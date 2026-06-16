from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
import json
from datetime import datetime
from firebase_admin import firestore
from typing import Dict, Optional, List
from openai import OpenAI

from sentence_transformers import SentenceTransformer, util

from .auth_deps import authenticate
from .diet_plan import choose_meals_for_day
from .preferred_diet import choose_meals_with_preferences
from .nutrition import check_basic_nutrition

router = APIRouter()

# ML model for waste prediction
model = joblib.load("engine/food_waste_model.pkl")
feature_columns = joblib.load("engine/feature_columns.pkl")

# Hugging Face sentence transformer (local)
hf_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=openai_api_key) if openai_api_key else None


def check_nutrition_issues(meal: str) -> List[str]:
    if not meal:
        return []
    res = check_basic_nutrition([meal])
    # Filter out the fallback message if present, but keep actual warnings
    return [issue for issue in res.issues if "No nutrition data available" not in issue and "approximate" not in issue]


def check_repeated_meals(meal: str, date_str: str, schedule: Dict) -> List[str]:
    if not meal or not schedule:
        return []
    
    current_cat = detect_category(meal)
    target_day = datetime.strptime(date_str, "%Y-%m-%d").strftime("%A")
    
    repeated_days = []
    for day, scheduled_meal in schedule.items():
        if day.lower() == target_day.lower():
            continue
        
        if scheduled_meal:
            scheduled_cat = detect_category(scheduled_meal)
            if scheduled_cat == current_cat:
                repeated_days.append(day)
                
    if repeated_days:
        return [f"Repeated meal/category ({current_cat}) is also scheduled on {', '.join(repeated_days)}."]
    return []


def predict_with_chatgpt(
    date: str,
    menu_item: str,
    prepared_portions: int,
    attendance: int,
    school_stats: Dict,
    schedule: Dict,
    nutrition_issues: List[str],
    repeated_issues: List[str]
) -> Optional[Dict]:
    if not openai_client:
        return None

    stats = school_stats.get(menu_item, {})
    avg_leftovers = stats.get("total_leftovers", 0) / max(1, stats.get("count", 1))

    prompt = f"""
You are an AI food waste prediction assistant for schools.
Please predict the food waste for the following day:
- Date: {date} (Day of week: {datetime.strptime(date, "%Y-%m-%d").strftime("%A")})
- Menu Item: {menu_item}
- Prepared Portions: {prepared_portions}
- Expected Attendance: {attendance}
- School Historical Average Leftovers for this meal: {avg_leftovers:.1f} portions
- Weekly Schedule: {json.dumps(schedule)}
- Nutrition Issues identified locally: {json.dumps(nutrition_issues)}
- Repeated Meal/Food Issues identified locally: {json.dumps(repeated_issues)}

Based on this data, estimate the predicted waste portions and output a JSON object with:
1. "predictedWastePortions": float (expected leftovers in portions, between 0 and {prepared_portions})
2. "riskLevel": string ("Low", "Medium", or "High")
3. "explanation": string (detailed breakdown including waste driver, nutritional balance, and whether it's repeated or has conflicts)
4. "menuItemUsed": string (the menu item name)
5. "historicalAvgLeftovers": float ({avg_leftovers:.1f})

Return ONLY the raw JSON object. No markdown, no backticks, no other text.
"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a precise JSON-only output predictor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        res_text = response.choices[0].message.content.strip()
        if res_text.startswith("```"):
            res_text = res_text.strip("`").strip("json").strip()
        return json.loads(res_text)
    except Exception as e:
        print("Failed to predict with ChatGPT:", e)
        return None



def get_db():
    return firestore.client()


class PredictRequest(BaseModel):
    date: str
    menu_item: Optional[str] = None
    prepared_portions: int
    attendance: int
    # List of user preferred foods/diet categories (e.g., "chicken", "vegetarian", "pasta")
    preferred_foods: Optional[List[str]] = None
    excluded_meals: Optional[List[str]] = None


def get_school_history(school: str) -> Dict:
    db = get_db()
    logs_ref = db.collection("daily_logs").where("school", "==", school).stream()

    menu_stats: Dict[str, Dict[str, float]] = {}

    for doc in logs_ref:
        logs = doc.to_dict().get("logs", [])
        for entry in logs:
            for item in entry.get("menuItems", []):
                if item not in menu_stats:
                    menu_stats[item] = {"count": 0, "total_leftovers": 0}
                menu_stats[item]["count"] += 1
                menu_stats[item]["total_leftovers"] += entry.get("leftovers", 0)

    return menu_stats


def encode_texts(texts: List[str]):
    return hf_model.encode(texts, convert_to_tensor=True)


def cosine_sim(a, b):
    return util.cos_sim(a, b)


# --- semantic main & side definitions (for Hugging Face matching) ---

MAIN_DEFS = {
    "pasta": "pasta with sauce, spaghetti, macaroni, makaronia",
    "chicken": "chicken main dish, kotopoulo, chicken with rice",
    "fish": "fish main dish, psari, fish fillet",
    "beef": "beef main dish, mosxari, beef stew",
    "pizza": "pizza main dish",
    "lasagna": "lasagna main dish",
}

SIDE_DEFS = {
    "salad": "green salad, side salad, salata",
    "sauce": "tomato sauce, white sauce, gravy, saltsa",
    "bread": "bread, slice of bread",
    "rice": "rice side dish, rizi",
    "potatoes": "potatoes, roasted potatoes, patates",
}

MAIN_KEYS = list(MAIN_DEFS.keys())
MAIN_TEXTS = list(MAIN_DEFS.values())
MAIN_EMBS = encode_texts(MAIN_TEXTS)

SIDE_KEYS = list(SIDE_DEFS.keys())
SIDE_TEXTS = list(SIDE_DEFS.values())
SIDE_EMBS = encode_texts(SIDE_TEXTS)

# --- nutrition / weekly-plan categories ---

CATEGORY_DEFS = {
    "pasta": "pasta, spaghetti, macaroni, makaronia, pasta dish",
    "soup": "soup, broth, creamy soup, vegetable soup, chicken soup",
    "chicken": "chicken dish, kotopoulo, grilled chicken, chicken with rice",
    "fish": "fish dish, psari, fish fillet, grilled fish",
    "beef": "beef dish, mosxari, beef stew",
    "pizza": "pizza, margherita, cheese pizza",
    "vegetarian": "vegetarian meal, plant based, no meat",
    "legumes": "lentils, beans, chickpeas, legumes, pulses",
    "rice dishes": "rice dish, risotto, pilaf",
    "salad meals": "salad meal, big salad, salad with protein",
}

CATEGORY_KEYS = list(CATEGORY_DEFS.keys())
CATEGORY_TEXTS = list(CATEGORY_DEFS.values())
CATEGORY_EMBS = encode_texts(CATEGORY_TEXTS)

CATEGORY_TO_MEALS = {
    "pasta": ["Pasta Bolognese", "Pasta Carbonara", "Pasta Alfredo", "Pasta Napoli"],
    "soup": ["Chicken Soup", "Vegetable Soup", "Fish Soup", "Lentil Soup"],
    "chicken": ["Chicken with Rice", "Chicken Fillet", "Chicken Soup", "Chicken Salad"],
    "fish": ["Fish Fillet with Potatoes", "Grilled Fish", "Fish Soup"],
    "beef": ["Beef Stew with Potatoes", "Beef with Rice"],
    "pizza": ["Pizza Margherita", "Pizza Special"],
    "vegetarian": ["Vegetarian Lasagna", "Vegetarian Rice Bowl", "Vegetarian Salad Bowl"],
    "legumes": ["Lentil Soup", "Chickpea Stew"],
    "rice dishes": ["Rice Pilaf", "Vegetable Risotto"],
    "salad meals": ["Chicken Salad", "Vegetarian Salad Bowl"],
}


def detect_category(meal: str) -> str:
    emb = encode_texts([meal])[0]
    sims = cosine_sim(emb, CATEGORY_EMBS)[0]
    idx = int(sims.argmax().item())
    return CATEGORY_KEYS[idx]


def find_alternatives(category: Optional[str]) -> List[str]:
    if not category:
        return []
    return CATEGORY_TO_MEALS.get(category, [])


def combine_meal_name(raw: str, school_stats: Dict) -> str:
    if not raw:
        return "Unknown Meal"

    text = raw.lower()

    # --- multi‑component parsing ---
    separators = [",", "+", "/", " and ", " & ", " με "]
    for sep in separators:
        text = text.replace(sep, ",")

    parts = [p.strip() for p in text.split(",") if p.strip()]

    mains: List[str] = []
    sides: List[str] = []

    # --- semantic detection per part (Hugging Face) ---
    for part in parts:
        part_emb = encode_texts([part])[0]

        # similarity with main categories
        main_sims = cosine_sim(part_emb, MAIN_EMBS)[0]
        best_main_idx = int(main_sims.argmax().item())
        best_main_score = float(main_sims[best_main_idx])

        # similarity with side categories
        side_sims = cosine_sim(part_emb, SIDE_EMBS)[0]
        best_side_idx = int(side_sims.argmax().item())
        best_side_score = float(side_sims[best_side_idx])

        MAIN_THRESHOLD = 0.45
        SIDE_THRESHOLD = 0.45

        if best_main_score >= MAIN_THRESHOLD and best_main_score >= best_side_score:
            mains.append(MAIN_KEYS[best_main_idx])
        elif best_side_score >= SIDE_THRESHOLD:
            sides.append(SIDE_KEYS[best_side_idx])

    # --- dynamic main meal selection (fallback using school history) ---
    if not mains:
        main_counts = {m: 0 for m in MAIN_DEFS.keys()}

        for meal in school_stats.keys():
            lower = meal.lower()
            for main in main_counts.keys():
                if main in lower:
                    main_counts[main] += 1

        best_main = max(main_counts, key=main_counts.get)
        if main_counts[best_main] == 0:
            best_main = "pasta"

        mains.append(best_main)

    base_options_by_main = {
        "pasta": ["Pasta Bolognese", "Pasta Carbonara", "Pasta Alfredo", "Pasta Napoli"],
        "chicken": ["Chicken with Rice", "Chicken Fillet", "Chicken Soup"],
        "fish": ["Fish Fillet with Potatoes", "Grilled Fish", "Fish Soup"],
        "pizza": ["Pizza Margherita", "Pizza Special"],
        "beef": ["Beef Stew with Potatoes", "Beef with Rice"],
        "lasagna": ["Vegetarian Lasagna"],
    }

    chosen_base: Optional[str] = None
    for main in mains:
        options = base_options_by_main.get(main, ["Unknown Meal"])

        scored = []
        for opt in options:
            if opt in school_stats:
                avg_left = school_stats[opt]["total_leftovers"] / max(
                    1, school_stats[opt]["count"]
                )
                scored.append((avg_left, opt))

        if scored:
            scored.sort(reverse=True, key=lambda t: t[0])
            chosen_base = scored[0][1]
            break

        if options and chosen_base is None:
            idx = (len(raw) + len(main)) % len(options)
            chosen_base = options[idx]

    if chosen_base is None:
        chosen_base = "Unknown Meal"

    meal = chosen_base

    if sides:
        seen = set()
        unique_sides = []
        for s in sides:
            if s not in seen:
                seen.add(s)
                unique_sides.append(s)
        meal = meal + " with " + " and ".join(unique_sides)

    return meal


def build_feature_vector(data: PredictRequest, school_stats: Dict):
    day_of_week = datetime.strptime(data.date, "%Y-%m-%d").weekday()

    feature_dict = {col: 0 for col in feature_columns}

    feature_dict["day_of_week"] = day_of_week
    feature_dict["attendance"] = data.attendance
    feature_dict["prepared_portions"] = data.prepared_portions
    feature_dict["served"] = min(data.attendance, data.prepared_portions)

    if data.menu_item in school_stats:
        avg_left = (
            school_stats[data.menu_item]["total_leftovers"]
            / school_stats[data.menu_item]["count"]
        )
    else:
        avg_left = 0

    if "historical_avg_leftovers" in feature_dict:
        feature_dict["historical_avg_leftovers"] = avg_left

    # Map concrete menu variants to the coarse menu categories used during training.
    # feature_columns expect: menu_item_Pasta/Chicken/Fish/Pizza/Vegetarian
    menu_category = None
    mi = (data.menu_item or "").lower()
    if any(k in mi for k in ["pasta", "carbonara", "bolognese", "alfredo", "napoli"]):
        menu_category = "Pasta"
    elif "chicken" in mi or "kotopoulo" in mi:
        menu_category = "Chicken"
    elif "fish" in mi or "psari" in mi:
        menu_category = "Fish"
    elif "pizza" in mi:
        menu_category = "Pizza"
    elif "lasagna" in mi or "vegetarian" in mi:
        menu_category = "Vegetarian"

    if menu_category:
        menu_col = f"menu_item_{menu_category}"
        if menu_col in feature_dict:
            feature_dict[menu_col] = 1

    x = np.array([[feature_dict[col] for col in feature_columns]])
    return x


def get_risk_level(pred: float) -> str:
    if pred < 1:
        return "Low"
    elif pred < 3:
        return "Medium"
    else:
        return "High"


def generate_explanation(menu_item: str, risk: str, avg_left: float) -> str:
    if avg_left > 20:
        return f"{menu_item} historically has high leftovers at this school."
    if avg_left > 10:
        return f"{menu_item} sometimes produces moderate waste."
    if risk == "High":
        return f"High waste expected for {menu_item}."
    if risk == "Medium":
        return f"Moderate waste expected for {menu_item}."
    return f"Low waste expected for {menu_item}."


def analyze_school_demographics(
    user_context: Dict,
    menu_item: str,
    predicted_waste: float,
    prepared_portions: int,
    attendance: int
) -> Dict:
    """
    Analyze school demographics and their impact on food waste prediction.
    Returns detailed demographic insights and adjusted prediction.
    """
    location = user_context.get("location", "Unknown")
    male_percent = user_context.get("malePercent")
    female_percent = user_context.get("femalePercent")
    school_type = user_context.get("schoolType", "")
    student_count = user_context.get("studentCount", "0")
    portion_size = user_context.get("portionSize", "0.25kg")

    try:
        male_percent = float(male_percent) if male_percent is not None else 50.0
        female_percent = float(female_percent) if female_percent is not None else 50.0
        student_count = int(student_count) if isinstance(student_count, str) else int(student_count or 0)
    except (ValueError, TypeError):
        male_percent = 50.0
        female_percent = 50.0
        student_count = 0

    # Extract region from location (e.g., "Drama, Greece" → "Drama")
    region = location.split(",")[0].strip() if location and location != "Unknown" else "Unknown"

    # Gender distribution analysis
    gender_imbalance = abs(male_percent - female_percent)
    gender_category = "balanced"
    if gender_imbalance > 20:
        gender_category = "highly imbalanced"
    elif gender_imbalance > 10:
        gender_category = "moderately imbalanced"

    # Waste adjustment factors
    waste_adjustment_factor = 1.0

    # Gender-based adjustment
    # Research suggests males typically consume more, leading to higher selection but also different waste patterns
    if male_percent > 60:
        waste_adjustment_factor *= 0.95  # Slightly lower waste due to higher consumption
    elif male_percent < 40:
        waste_adjustment_factor *= 1.05  # Slightly higher waste with predominantly female student body

    # School type adjustment
    if "middle" in school_type.lower():
        waste_adjustment_factor *= 0.92  # Younger students have more structured eating habits
    elif "high" in school_type.lower():
        waste_adjustment_factor *= 1.08  # High schoolers more selective about food

    # School size adjustment
    if student_count > 500:
        waste_adjustment_factor *= 0.98  # Larger schools have better meal planning
    elif student_count > 200:
        waste_adjustment_factor *= 1.0  # Medium schools - neutral
    elif student_count > 0:
        waste_adjustment_factor *= 1.05  # Smaller schools - less predictable

    adjusted_waste = predicted_waste * waste_adjustment_factor
    adjusted_waste = max(0, min(adjusted_waste, prepared_portions))

    # Generate demographic insights
    gender_insight = f"{male_percent:.0f}% male and {female_percent:.0f}% female students ({gender_category} distribution)"

    school_size_insight = ""
    if student_count > 0:
        school_size_insight = f"School has {student_count} students. "

    portion_insight = ""
    try:
        # Try to parse portion size
        portion_str = str(portion_size).replace("kg", "").strip()
        portion_val = float(portion_str)
        portion_insight = f"Portion size: {portion_size}. "
    except:
        portion_insight = f"Portion size: {portion_size}. "

    waste_percentage = (adjusted_waste / prepared_portions * 100) if prepared_portions > 0 else 0
    waste_per_student = (adjusted_waste / attendance) if attendance > 0 else 0

    region_factor_text = ""
    if region != "Unknown":
        region_factor_text = f"Region ({region}) may influence local food preferences and seasonality. "

    return {
        "adjusted_waste": round(adjusted_waste, 2),
        "waste_percentage": round(waste_percentage, 1),
        "waste_per_student": round(waste_per_student, 2),
        "gender_insight": gender_insight,
        "school_size_insight": school_size_insight,
        "portion_insight": portion_insight,
        "region": region,
        "region_factor_text": region_factor_text,
        "school_type": school_type,
        "adjustment_factor": round(waste_adjustment_factor, 3),
        "male_percent": male_percent,
        "female_percent": female_percent,
        "student_count": student_count,
    }


@router.post("")
def predict_endpoint(data: PredictRequest, user=Depends(authenticate)):
    db = get_db()

    user_uid = user["uid"]
    user_doc = db.collection("users").document(user_uid).get()

    if not user_doc.exists:
        raise HTTPException(404, "User not found")

    school = user_doc.to_dict().get("school")
    if not school:
        raise HTTPException(400, "School not set")

    schedule_doc = db.collection("school_schedules").document(school).get()
    doc_data = schedule_doc.to_dict() if schedule_doc.exists else {}

    schedule = doc_data.get("schedule", {})
    weekly_plan = doc_data.get("weekly_plan", {})

    # load school history once
    school_stats = get_school_history(school)

    # --- get raw meal (either from request or schedule) ---
    if data.menu_item and isinstance(data.menu_item, str) and data.menu_item.strip() != "":
        raw_meal = data.menu_item
    else:
        weekday_name = datetime.strptime(data.date, "%Y-%m-%d").strftime("%A")
        raw_meal = schedule.get(weekday_name, "Unknown")

    normalized_menu = combine_meal_name(raw_meal, school_stats)

    # --- weekly plan category logic ---
    weekday_key = datetime.strptime(data.date, "%Y-%m-%d").strftime("%A").lower()
    planned_category = weekly_plan.get(weekday_key)

    final_meal = normalized_menu

    if planned_category:
        meal_category = detect_category(normalized_menu)

        if meal_category != planned_category:
            # find alternatives in the planned category and pick the one with lowest predicted waste
            alternatives = find_alternatives(planned_category)
            
            # Filter out already suggested/excluded meals
            excluded = data.excluded_meals or []
            filtered_alts = [alt for alt in alternatives if alt not in excluded]
            if not filtered_alts:
                filtered_alts = alternatives

            best_meal = None
            best_score = None

            for alt in filtered_alts:
                tmp_req = PredictRequest(
                    date=data.date,
                    menu_item=alt,
                    prepared_portions=data.prepared_portions,
                    attendance=data.attendance,
                    preferred_foods=data.preferred_foods,
                )
                x_alt = build_feature_vector(tmp_req, school_stats)
                pred_alt = float(model.predict(x_alt)[0])
                pred_alt = max(0, min(pred_alt, data.prepared_portions))

                # lower waste is better
                if best_score is None or pred_alt < best_score:
                    best_score = pred_alt
                    best_meal = alt

            if best_meal:
                final_meal = best_meal
            else:
                final_meal = normalized_menu
        else:
            final_meal = normalized_menu
    else:
        # no weekly plan for that day → keep old nutrition/preference logic
        nutrition_candidates = [normalized_menu]
        nlow = (normalized_menu or "").lower()

        if any(k in nlow for k in ["pasta", "bolognese", "carbonara", "alfredo"]):
            nutrition_candidates += [
                "Chicken with Rice",
                "Grilled Fish",
                "Fish Fillet with Potatoes",
                "Vegetarian Lasagna",
            ]
        elif "pizza" in nlow:
            nutrition_candidates += ["Chicken with Rice", "Grilled Fish", "Vegetarian Lasagna"]

        # Filter out already suggested/excluded meals
        excluded = data.excluded_meals or []
        filtered_candidates = [c for c in nutrition_candidates if c not in excluded]
        if not filtered_candidates:
            filtered_candidates = nutrition_candidates

        preferred_foods = getattr(data, "preferred_foods", None) or []
        chosen_preferred = None
        if preferred_foods:
            chosen_preferred = choose_meals_with_preferences(
                filtered_candidates,
                preferred_foods=preferred_foods,
                max_meals=2,
            )

        chosen_for_nutrition = None
        if not chosen_preferred or not chosen_preferred.chosen_meals:
            chosen_for_nutrition = choose_meals_for_day(filtered_candidates, max_meals=2)

        chosen_set = None
        if chosen_preferred and chosen_preferred.chosen_meals:
            chosen_set = list(chosen_preferred.chosen_meals)
        elif chosen_for_nutrition and chosen_for_nutrition.chosen_meals:
            chosen_set = list(chosen_for_nutrition.chosen_meals)

        if chosen_set:
            day_of_week = datetime.strptime(data.date, "%Y-%m-%d").weekday()
            idx = day_of_week % len(chosen_set)
            final_meal = chosen_set[idx]
        else:
            final_meal = normalized_menu

    data.menu_item = final_meal

    # local checks
    nutrition_issues = check_nutrition_issues(data.menu_item)
    repeated_issues = check_repeated_meals(data.menu_item, data.date, schedule)

    # 1. Try ChatGPT first if enabled
    chatgpt_result = predict_with_chatgpt(
        date=data.date,
        menu_item=data.menu_item,
        prepared_portions=data.prepared_portions,
        attendance=data.attendance,
        school_stats=school_stats,
        schedule=schedule,
        nutrition_issues=nutrition_issues,
        repeated_issues=repeated_issues
    )

    if chatgpt_result:
        # Validate response keys
        for key in ["predictedWastePortions", "riskLevel", "explanation", "menuItemUsed", "historicalAvgLeftovers"]:
            if key not in chatgpt_result:
                chatgpt_result = None
                break

    if chatgpt_result:
        return chatgpt_result

    # 2. Fallback to local prediction model
    if data.attendance >= data.prepared_portions:
        explanation = "No waste expected because attendance is equal or higher than prepared portions."
        if nutrition_issues:
            explanation += " Nutrition Assessment: " + " ".join(nutrition_issues)
        if repeated_issues:
            explanation += " Schedule Conflict: " + " ".join(repeated_issues)

        return {
            "predictedWastePortions": 0,
            "riskLevel": "Low",
            "explanation": explanation,
            "menuItemUsed": data.menu_item,
            "historicalAvgLeftovers": 0,
        }

    x = build_feature_vector(data, school_stats)

    predicted = float(model.predict(x)[0])
    predicted = max(0, min(predicted, data.prepared_portions))

    avg_left = school_stats.get(data.menu_item, {}).get("total_leftovers", 0) / max(
        1, school_stats.get(data.menu_item, {}).get("count", 1)
    )

    risk = get_risk_level(predicted)

    # Comprehensive school demographics analysis
    user_context = user_doc.to_dict() if user_doc else {}
    demo_analysis = analyze_school_demographics(
        user_context=user_context,
        menu_item=data.menu_item,
        predicted_waste=predicted,
        prepared_portions=data.prepared_portions,
        attendance=data.attendance
    )

    adjusted_pred = demo_analysis["adjusted_waste"]
    gender_insight = demo_analysis["gender_insight"]
    school_size_insight = demo_analysis["school_size_insight"]
    portion_insight = demo_analysis["portion_insight"]
    region_factor_text = demo_analysis["region_factor_text"]
    waste_percentage = demo_analysis["waste_percentage"]
    waste_per_student = demo_analysis["waste_per_student"]
    adjustment_factor = demo_analysis["adjustment_factor"]

    # Base explanation
    base_explanation = generate_explanation(data.menu_item, risk, avg_left)

    # Append local checks to explanation
    extra_notes = []
    if nutrition_issues:
        extra_notes.append("Nutrition: " + " ".join(nutrition_issues))
    if repeated_issues:
        extra_notes.append("Schedule Conflict: " + " ".join(repeated_issues))

    if extra_notes:
        base_explanation += " | " + " | ".join(extra_notes)

    # Build comprehensive explanation with demographic analysis
    demographic_breakdown = (
        f"\n📊 **Demographic Analysis:**\n"
        f"• {school_size_insight}"
        f"Gender Distribution: {gender_insight}\n"
        f"• {portion_insight}"
        f"{region_factor_text}"
    )

    waste_analysis = (
        f"\n📈 **Waste Projection for {data.menu_item}:**\n"
        f"• Predicted Waste: {adjusted_pred} portions ({waste_percentage}% of prepared portions)\n"
        f"• Waste Per Student: {waste_per_student:.2f} portions\n"
        f"• Historical Average: {avg_left:.2f} portions\n"
        f"• ML Model Adjustment Factor: {adjustment_factor}x (based on school demographics)"
    )

    explanation = (
        f"{base_explanation}"
        f"{demographic_breakdown}"
        f"{waste_analysis}"
    )

    return {
        "predictedWastePortions": round(adjusted_pred, 2),
        "riskLevel": risk,
        "explanation": explanation,
        "menuItemUsed": data.menu_item,
        "historicalAvgLeftovers": round(avg_left, 2),
        "demographicInsights": {
            "location": user_context.get("location", "Unknown"),
            "malePercent": demo_analysis["male_percent"],
            "femalePercent": demo_analysis["female_percent"],
            "studentCount": demo_analysis["student_count"],
            "schoolType": demo_analysis["school_type"],
            "wastePercentage": waste_percentage,
            "wastePerStudent": waste_per_student,
            "adjustmentFactor": adjustment_factor,
        }
    }

