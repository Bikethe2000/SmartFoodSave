from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


@dataclass(frozen=True)
class MealNutrition:
    # Very coarse macros (grams / mg) just for basic “healthy diet” checks.
    # These are intentionally approximate because no detailed nutrition dataset exists in this repo.
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    # Sodium is mg (coarse)
    sodium_mg: float
    # For dietary categories
    tags: Tuple[str, ...]


# Minimal nutrition knowledge base.
# Extend this as you add real nutrition data.
NUTRITION_DB: Dict[str, MealNutrition] = {
    "Pasta Bolognese": MealNutrition(520, 22, 78, 15, 5, 950, ("carb", "protein")),
    "Pasta Carbonara": MealNutrition(560, 20, 70, 22, 4, 1050, ("carb", "protein")),
    "Pasta Alfredo": MealNutrition(610, 18, 72, 28, 3, 980, ("carb",)),
    "Pasta Napoli": MealNutrition(500, 18, 80, 10, 4, 900, ("carb",)),
    "Chicken with Rice": MealNutrition(520, 35, 55, 12, 3, 780, ("protein", "carb")),
    "Chicken Fillet": MealNutrition(430, 40, 15, 14, 2, 620, ("protein",)),
    "Chicken Soup": MealNutrition(390, 30, 28, 10, 2, 720, ("protein",)),
    "Fish Fillet with Potatoes": MealNutrition(470, 34, 50, 12, 4, 680, ("protein",)),
    "Grilled Fish": MealNutrition(410, 36, 10, 14, 1, 560, ("protein",)),
    "Fish Soup": MealNutrition(360, 28, 20, 10, 1, 650, ("protein",)),
    "Vegetarian Lasagna": MealNutrition(480, 20, 60, 18, 7, 820, ("carb", "fiber")),
    "Pizza Margherita": MealNutrition(520, 22, 55, 18, 4, 980, ("carb",)),
    "Pizza Special": MealNutrition(580, 24, 58, 22, 4, 1100, ("carb",)),
}


def get_meal_nutrition(menu_item: str) -> Optional[MealNutrition]:
    if not menu_item:
        return None
    return NUTRITION_DB.get(menu_item)


@dataclass(frozen=True)
class NutritionResult:
    meets_basic_guidelines: bool
    issues: List[str]
    # 0..1 score
    score: float


def check_basic_nutrition(meal_items: List[str]) -> NutritionResult:
    """Basic “healthy diet” check for a set of meals.

    Since this project doesn’t currently include a full day-plan nutrition dataset,
    we validate coarse heuristics over the set of menu items selected for the school day.

    Heuristics (per day, rough):
    - Total fiber should be >= ~6g
    - Total protein should be >= ~25g
    - Sodium should be <= ~2300mg
    - Calories should be within a rough band
    """

    nutrition_rows: List[MealNutrition] = []
    missing = []
    for item in meal_items:
        n = get_meal_nutrition(item)
        if n is None:
            missing.append(item)
        else:
            nutrition_rows.append(n)

    if not nutrition_rows:
        return NutritionResult(
            meets_basic_guidelines=False,
            issues=["No nutrition data available for the selected menu items.", *missing],
            score=0.0,
        )

    totals = {
        "calories": sum(n.calories for n in nutrition_rows),
        "protein_g": sum(n.protein_g for n in nutrition_rows),
        "carbs_g": sum(n.carbs_g for n in nutrition_rows),
        "fat_g": sum(n.fat_g for n in nutrition_rows),
        "fiber_g": sum(n.fiber_g for n in nutrition_rows),
        "sodium_mg": sum(n.sodium_mg for n in nutrition_rows),
    }

    issues: List[str] = []

    # Fiber
    if totals["fiber_g"] < 6:
        issues.append(f"Low fiber: {totals['fiber_g']:.1f}g (target ≥ 6g).")

    # Protein
    if totals["protein_g"] < 25:
        issues.append(f"Low protein: {totals['protein_g']:.1f}g (target ≥ 25g).")

    # Sodium
    if totals["sodium_mg"] > 2300:
        issues.append(f"High sodium: {totals['sodium_mg']:.0f}mg (target ≤ 2300mg).")

    # Calories rough band
    if totals["calories"] < 450 or totals["calories"] > 1000:
        issues.append(f"Calories out of expected band: {totals['calories']} kcal.")

    # Score: 1 - normalized count of issues (cap)
    score = max(0.0, 1.0 - 0.2 * len(issues))
    meets = len(issues) == 0

    if missing:
        issues.append("Some items are missing nutrition data; results are approximate.")

    return NutritionResult(meets_basic_guidelines=meets, issues=issues, score=score)

