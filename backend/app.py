import os
import json
from datetime import datetime
from pathlib import Path
from functools import wraps

from engine.predict import router as predict_router
from schedule import router as schedule_router
from fastapi import FastAPI, Request, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from dotenv import load_dotenv
import uvicorn

# Firebase Admin
import firebase_admin
from firebase_admin import credentials, firestore, auth
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from donate_helpers import (
    geocode_city,  ai_find_donation_points, google_maps_lookup,
    google_place_details, ai_enrich, haversine,
    donation_email, build_directions_link
)
load_dotenv()

app = FastAPI()
PORT = int(os.getenv("PORT", 5000))


# ---------------------------
# CORS (ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://food-waste-ai-bice.vercel.app",
        "http://localhost:5173",  # for local dev
        "https://foodwasteai-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


db = None
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")


# ---------------------------
# Firebase Initialization
# ---------------------------
def initialize_firebase():
    global db

    try:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

        # Fallback: try to locate serviceAccountKey.json in the repo root
        if not service_account_path:
            repo_root = Path(__file__).resolve().parents[1]
            candidate = repo_root / "serviceAccountKey.json"
            if candidate.exists():
                service_account_path = str(candidate)

        if service_account_path:
            service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

            if not service_account_json:
                raise RuntimeError("Missing FIREBASE_SERVICE_ACCOUNT env variable")

            service_account = json.loads(service_account_json)
            cred = credentials.Certificate(service_account)
            firebase_admin.initialize_app(cred)

        else:
            raise FileNotFoundError(
                "Missing Firebase credentials; set FIREBASE_SERVICE_ACCOUNT_PATH or place serviceAccountKey.json in repo root"
            )

        db = firestore.client()
        print("✓ Firebase initialized")

    except Exception as e:
        print("✗ Firebase init failed:", e)
        exit(1)


# ---------------------------
# Authentication dependency
# ---------------------------
async def authenticate(request: Request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]

    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as exc:
        print("Auth token verification failed:", exc)
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {exc}")


# ---------------------------
# Utility
# ---------------------------
def to_item(doc):
    data = doc.to_dict()
    data["id"] = doc.id
    return data


import resend

def send_email(to, subject, body, reply_to=None):
    resend.api_key = os.getenv("RESEND_API_KEY")
    payload = {
        "from": "SmartFoodSave <onboarding@resend.dev>",
        "to": os.getenv("CONTACT_FORM_RECIPIENT"),  # always your own email
        "subject": subject,
        "html": body,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    resend.Emails.send(payload)
    

def otp_email_html(name, otp):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 12px; background: #d1fae5; border-radius: 12px;">
              <img src="https://img.icons8.com/emoji/48/green-salad-emoji.png" width="40" height="40" />
            </div>
            <h2 style="color: #064e3b; margin-top: 16px; font-size: 24px; font-weight: 800;">
              SmartFoodSave Verification
            </h2>
          </div>

          <p style="color: #334155; font-size: 16px;">
            Hello <strong>{name}</strong>,
          </p>

          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thank you for signing up to <strong>SmartFoodSave</strong>!  
            To complete your registration, please enter the verification code below:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <div style="
              display: inline-block;
              padding: 16px 32px;
              background: #059669;
              color: white;
              font-size: 32px;
              font-weight: bold;
              border-radius: 12px;
              letter-spacing: 4px;
            ">
              {otp}
            </div>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            This code will expire in <strong>10 minutes</strong>.  
            If you didn’t request this, you can safely ignore this email.
          </p>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />

          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            SmartFoodSave © {datetime.utcnow().year}<br/>
            AI‑powered food waste reduction for schools.
          </p>

        </div>
      </body>
    </html>
    """


# ---------------------------
# SETTINGS ENDPOINT
# ---------------------------

@app.get("/api/settings")
async def get_settings(user=Depends(authenticate)):
    """Load user settings from Firestore"""
    ref = db.collection("settings").document(user["uid"])
    doc = ref.get()

    if not doc.exists:
        return {
            "schoolName": "",
            "studentCount": "",
            "portionSize": "",
            "timezone": "GMT+3",
            "showConfidenceRanges": False,
        }

    return doc.to_dict()


@app.post("/api/settings")
async def save_settings(request: Request, user=Depends(authenticate)):
    """Save user settings to Firestore"""
    data = await request.json()

    ref = db.collection("settings").document(user["uid"])
    ref.set(
        {
            "schoolName": data.get("schoolName", ""),
            "schoolType": data.get("schoolType", ""),
            "studentCount": data.get("studentCount", ""),
            "portionSize": data.get("portionSize", ""),
            "malePercent": data.get("malePercent", 0),
            "femalePercent": data.get("femalePercent", 0),
            "location": data.get("location", ""),
            "timezone": data.get("timezone", "GMT+3"),
            "showConfidenceRanges": data.get("showConfidenceRanges", False),
            "updatedAt": datetime.utcnow(),
        }
    )

    # Also update the users profile with the school and clear isNew flag
    try:
        db.collection("users").document(user["uid"]).set(
            {
                "school": data.get("schoolName", ""),
                "schoolType": data.get("schoolType", ""),
                "studentCount": data.get("studentCount", ""),
                "portionSize": data.get("portionSize", ""),
                "malePercent": data.get("malePercent", 0),
                "femalePercent": data.get("femalePercent", 0),
                "location": data.get("location", ""),
                "isNew": False,
                "updatedAt": datetime.utcnow(),
            },
            merge=True,
        )
    except Exception as e:
        print("Warning: failed to update user profile on settings save:", e)

    return {"status": "ok"}


@app.post("/api/auth/send-otp")
async def send_otp(request: Request):
    data = await request.json()
    email = data.get("email")
    name = data.get("name")

    if not email or not name:
        raise HTTPException(400, "Missing fields")

    otp = str(random.randint(100000, 999999))

    # store OTP temporarily
    db.collection("otp").document(email).set(
        {
            "otp": otp,
            "createdAt": datetime.utcnow(),
        }
    )

    html = otp_email_html(name, otp)
    send_email(to=email, subject="Your SmartFoodSave Verification Code", body=html)

    return {"status": "sent"}


@app.post("/api/auth/verify-otp")
async def verify_otp(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    otp = data.get("otp")

    doc = db.collection("otp").document(email).get()
    if not doc.exists:
        raise HTTPException(400, "OTP not found")

    if doc.to_dict()["otp"] != otp:
        raise HTTPException(400, "Invalid OTP")

    # create Firebase user
    user = auth.create_user(email=email, password=password, display_name=name)

    # create a basic user profile in Firestore
    try:
        db.collection("users").document(user.uid).set(
            {
                "uid": user.uid,
                "email": email,
                "displayName": name,
                "school": "",
                "isNew": True,
                "createdAt": datetime.utcnow(),
            }
        )
    except Exception as e:
        print("Warning: failed to create user profile in Firestore:", e)

    # delete OTP
    db.collection("otp").document(email).delete()

    return {"status": "verified", "uid": user.uid}


def get_user_school(user_uid: str):
    user_doc = db.collection("users").document(user_uid).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_data = user_doc.to_dict() or {}
    school = user_data.get("school")
    if not school:
        raise HTTPException(status_code=400, detail="User school is not set")

    return school


# ---------------------------
# DAILY DATA ENDPOINTS
# ---------------------------
@app.get("/api/data/daily-logs")
async def get_daily_logs(user=Depends(authenticate)):
    """Fetch daily logs for the authenticated user"""
    try:
        school = get_user_school(user["uid"])
    except HTTPException:
        # School not set yet, return empty logs
        return []

    # Get all logs for this school across all dates
    logs_ref = db.collection("daily_logs")
    docs = logs_ref.where("school", "==", school).stream()

    all_logs = []
    for doc in docs:
        doc_logs = doc.to_dict().get("logs", [])
        all_logs.extend(doc_logs)

    # Sort by date descending
    all_logs.sort(key=lambda x: x.get("date", ""), reverse=True)
    return all_logs


@app.post("/api/data/daily-logs")
async def save_daily_logs(request: Request, user=Depends(authenticate)):
    """Add a daily log for the authenticated user"""
    data = await request.json()
    print(f"📥 Received log data: {data}")

    try:
        school = get_user_school(user["uid"])
        log_date = data.get("date", datetime.utcnow().strftime("%Y-%m-%d"))
        doc_id = f"{school}_{log_date}"

        ref = db.collection("daily_logs").document(doc_id)

        # Get existing logs for this school_date
        doc = ref.get()
        existing_logs = []
        if doc.exists:
            existing_logs = doc.to_dict().get("logs", [])

        # Create new log entry with ID and timestamp
        new_log = {
            "id": f"log-{int(datetime.utcnow().timestamp() * 1000)}",
            "date": log_date,
            "dayOfWeek": data.get("dayOfWeek"),
            "menuItems": data.get("menuItems", []),
            "attendance": data.get("attendance"),
            "prepared": data.get("prepared"),
            "served": data.get("served"),
            "leftovers": data.get("leftovers"),
            "createdAt": datetime.utcnow().isoformat(),
        }

        print(f"✅ New log entry: {new_log}")

        # Append to existing logs
        existing_logs.append(new_log)

        print(f"📝 About to save {len(existing_logs)} logs for doc_id: {doc_id}")

        # Save updated logs with school reference
        ref.set(
            {
                "school": school,
                "date": log_date,
                "logs": existing_logs,
                "updatedAt": datetime.utcnow().isoformat(),
            }
        )

        print(f"💾 Saved {len(existing_logs)} logs to Firebase for {doc_id}")
        return {"status": "ok", "log": new_log}

    except Exception as e:
        print(f"❌ Error saving daily log: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save log: {str(e)}")


@app.post("/api/schedule")
async def save_schedule(request: Request, user=Depends(authenticate)):
    data = await request.json()
    schedule = data.get("schedule")

    if not schedule:
        raise HTTPException(400, "Missing schedule")

    user_uid = user["uid"]
    user_doc = db.collection("users").document(user_uid).get()

    if not user_doc.exists:
        raise HTTPException(404, "User not found")

    school = user_doc.to_dict().get("school")
    if not school:
        raise HTTPException(400, "School not set")

    db.collection("school_schedules").document(school).set(
        {
            "schedule": schedule,
            "updatedAt": datetime.utcnow(),
        }
    )

    return {"status": "ok"}


@app.get("/api/schedule")
async def get_schedule(user=Depends(authenticate)):
    user_uid = user["uid"]
    user_doc = db.collection("users").document(user_uid).get()

    if not user_doc.exists:
        raise HTTPException(404, "User not found")

    school = user_doc.to_dict().get("school")
    if not school:
        raise HTTPException(400, "School not set")

    doc = db.collection("school_schedules").document(school).get()

    if not doc.exists:
        return {"schedule": {}}

    return {"schedule": doc.to_dict().get("schedule", {})}


@app.get("/api/meals/dictionary")
async def get_meal_dictionary(user=Depends(authenticate)):
    school = get_user_school(user["uid"])
    doc = db.collection("school_meals").document(school).get()
    if not doc.exists:
        return {}
    return doc.to_dict().get("dictionary", {})


@app.post("/api/meals/dictionary")
async def save_meal_dictionary(request: Request, user=Depends(authenticate)):
    school = get_user_school(user["uid"])
    data = await request.json()
    dictionary = data.get("dictionary", {})

    db.collection("school_meals").document(school).set(
        {
            "dictionary": dictionary,
        },
        merge=True,
    )

    return {"status": "ok"}


@app.get("/api/meals/tags")
async def get_meal_tags(user=Depends(authenticate)):
    school = get_user_school(user["uid"])
    doc = db.collection("school_meals").document(school).get()
    if not doc.exists:
        return {}
    return doc.to_dict().get("tags", {})


@app.post("/api/meals/tags")
async def save_meal_tags(request: Request, user=Depends(authenticate)):
    school = get_user_school(user["uid"])
    data = await request.json()
    tags = data.get("tags", {})

    db.collection("school_meals").document(school).set(
        {
            "tags": tags,
        },
        merge=True,
    )

    return {"status": "ok"}


@app.post("/api/meals/normalize")
async def normalize_meal(request: Request, user=Depends(authenticate)):
    data = await request.json()
    raw = (data.get("input") or "").lower().strip()

    if not raw:
        return {"input": raw, "suggestions": []}

    school = get_user_school(user["uid"])
    doc = db.collection("school_meals").document(school).get()
    dictionary = doc.to_dict().get("dictionary", {}) if doc.exists else {}

    suggestions = []

    # 1) Match από dictionary
    for meal, keywords in dictionary.items():
        for kw in keywords:
            if kw.lower() in raw:
                suggestions.append(meal)
                break

    # 2) Fallback rules
    if not suggestions:
        if "pasta" in raw or "makaron" in raw:
            suggestions = [
                "Pasta Bolognese",
                "Pasta Carbonara",
                "Pasta Alfredo",
                "Pasta Napoli",
            ]
        elif "chicken" in raw or "kotop" in raw:
            suggestions = [
                "Chicken with Rice",
                "Chicken Soup",
                "Chicken Fillet",
            ]
        elif "fish" in raw or "psari" in raw:
            suggestions = [
                "Fish Fillet with Potatoes",
                "Grilled Fish",
                "Fish Soup",
            ]

    return {"input": raw, "suggestions": suggestions}


@app.post("/api/meals/combine")
async def combine_meal(request: Request, user=Depends(authenticate)):
    data = await request.json()
    raw = (data.get("input") or "").lower().strip()

    if not raw:
        return {"input": raw, "suggestions": []}

    # Split into components
    parts = [
        p.strip()
        for p in raw.replace("+", ",").replace("/", ",").replace("and", ",").split(",")
    ]

    mains = []
    sides = []

    # Identify main categories
    main_keywords = {
        "pasta": ["pasta", "makaron", "spaghetti"],
        "chicken": ["chicken", "kotop"],
        "fish": ["fish", "psari"],
        "beef": ["beef", "mosx"],
        "pizza": ["pizza"],
        "lasagna": ["lasagna"],
    }

    side_keywords = {
        "salad": ["salad", "salata"],
        "sauce": ["sauce", "saltsa"],
        "bread": ["bread"],
        "rice": ["rice", "rizi"],
        "potatoes": ["potato", "patates"],
    }

    # Detect main & sides
    for part in parts:
        found_main = False
        for main, kws in main_keywords.items():
            if any(kw in part for kw in kws):
                mains.append(main)
                found_main = True
                break
        if found_main:
            continue

        for side, kws in side_keywords.items():
            if any(kw in part for kw in kws):
                sides.append(side)
                break

    # Build suggestions
    suggestions = []

    # MAIN MEAL OPTIONS
    if "pasta" in mains:
        base = ["Pasta Bolognese", "Pasta Carbonara", "Pasta Alfredo", "Pasta Napoli"]
    elif "chicken" in mains:
        base = ["Chicken with Rice", "Chicken Fillet", "Chicken Soup"]
    elif "fish" in mains:
        base = ["Fish Fillet with Potatoes", "Grilled Fish", "Fish Soup"]
    else:
        base = ["Unknown Meal"]

    # Add sides
    final_suggestions = []
    for meal in base:
        if sides:
            combined = meal + " with " + " and ".join(sides)
        else:
            combined = meal
        final_suggestions.append(combined)

    return {
        "input": raw,
        "suggestions": final_suggestions,
    }


# ---------------------------
# DONATION POINTS ENDPOINT
# ---------------------------
@app.get("/api/donations/nearby")
async def get_nearby_donations(user=Depends(authenticate)):
    user_uid = user["uid"]
    user_email = user["email"]
    user_language = user.get("language", "en")

    # Load city
    settings_doc = db.collection("settings").document(user_uid).get()
    if not settings_doc.exists:
        return {"donations": []}

    user_city = settings_doc.to_dict().get("location", "").strip()
    if not user_city:
        return {"donations": [], "message": "No city set"}

    # City → lat/lon
    geo = await geocode_city(user_city)
    if not geo:
        return {"donations": [], "message": "City not found"}

    user_lat, user_lon = geo["lat"], geo["lon"]

    # AI search
    raw_ai_points = await ai_find_donation_points(user_city)

    try:
        ai_points = json.loads(raw_ai_points)
        if not isinstance(ai_points, list):
            ai_points = []
    except:
        ai_points = []

    donations = []

    for p in ai_points:
        try:
            name = p.get("name")
            address = p.get("address")
            lat = p.get("lat")
            lon = p.get("lon")
            p_type = p.get("type")
            phone = p.get("phone")
            website = p.get("website")

            if not name or not address:
                continue

            # If AI didn't give lat/lon → geocode
            if lat is None or lon is None:
                geo2 = await google_maps_lookup(address)
                if not geo2 or not geo2.get("location"):
                    continue
                lat = geo2["location"]["lat"]
                lon = geo2["location"]["lng"]

            # Distance
            distance = haversine(user_lat, user_lon, lat, lon)

            # Google details
            place_details = None
            geo_details = await google_maps_lookup(address)
            if geo_details and geo_details.get("place_id"):
                place_details = await google_place_details(geo_details["place_id"])

            # AI enrichment
            raw_for_enrich = {
                "name": name,
                "address": address,
                "type": p_type,
                "phone": phone,
                "website": website,
            }

            enriched_json = await ai_enrich(raw_for_enrich, place_details)

            try:
                enriched = json.loads(enriched_json)
            except:
                enriched = raw_for_enrich

            enriched["distance"] = f"{distance} km"
            enriched["directions"] = build_directions_link(address)

            donations.append(enriched)

        except Exception as e:
            print("Error processing AI point:", e)
            continue

    # Send email
    if donations:
        subject, body = donation_email(user_language, donations[0])
        send_email(user_email, subject, body)

    return {
        "donations": donations,
        "city": user_city,
        "count": len(donations)
    }

app.include_router(predict_router, prefix="/api/predict", tags=["predict"])


# ---------------------------
# CONTACT FORM
# ---------------------------
def contact_email_html(name, email, message, phone=None):
    """Generate HTML for contact form email"""
    phone_info = f"<p><strong>Phone:</strong> {phone}</p>" if phone else ""
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 12px; background: #d1fae5; border-radius: 12px;">
              <img src="https://img.icons8.com/emoji/48/green-salad-emoji.png" width="40" height="40" />
            </div>
            <h2 style="color: #064e3b; margin-top: 16px; font-size: 24px; font-weight: 800;">
              New Contact Form Submission
            </h2>
          </div>

          <p style="color: #334155; font-size: 16px; background-color: #f0fdf4; padding: 12px; border-left: 4px solid #059669; border-radius: 4px;">
            <strong>From:</strong> {name} ({email})
          </p>
          {phone_info}

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />

          <h3 style="color: #1e293b; font-size: 16px; margin-top: 24px;">Message:</h3>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <p style="color: #475569; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
              {message}
            </p>
          </div>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />

          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            SmartFoodSave Contact Form © {datetime.utcnow().year}
          </p>

        </div>
      </body>
    </html>
    """


@app.post("/api/contact")
async def send_contact_form(request: Request):
    """Handle contact form submissions"""
    try:
        data = await request.json()

        # Validate required fields
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        message = data.get("message", "").strip()
        phone = data.get("phone", "").strip()

        if not name or not email or not message:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: name, email, message",
            )

        # Validate email format
        if "@" not in email:
            raise HTTPException(status_code=400, detail="Invalid email address")

        # Get recipient email from environment
        contact_recipient = os.getenv("CONTACT_FORM_RECIPIENT")
        if not contact_recipient:
            raise HTTPException(status_code=500, detail="Contact form not configured")

        # Send email to site admin
        admin_subject = f"New Contact Form Submission from {name}"
        admin_body = contact_email_html(
            name, email, message, phone if phone else None
        )
        send_email(contact_recipient, admin_subject, admin_body)

        # Send confirmation email to user
        user_subject = "We received your message - SmartFoodSave"
        user_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px;">
            <div style="max-width: 480px; margin: auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; padding: 12px; background: #d1fae5; border-radius: 12px;">
                  <img src="https://img.icons8.com/emoji/48/green-salad-emoji.png" width="40" height="40" />
                </div>
                <h2 style="color: #064e3b; margin-top: 16px; font-size: 24px; font-weight: 800;">
                  Message Received
                </h2>
              </div>

              <p style="color: #334155; font-size: 16px;">
                Hello <strong>{name}</strong>,
              </p>

              <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Thank you for contacting SmartFoodSave! We have received your message and will get back to you as soon as possible.
              </p>

              <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; margin: 24px 0;">
                <p style="color: #065f46; font-size: 14px; margin: 0;">
                  <strong>✓ Confirmation:</strong> Your message has been safely delivered.
                </p>
              </div>

              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Our team typically responds within 24-48 hours. In the meantime, feel free to explore our documentation or FAQ section.
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />

              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                SmartFoodSave © {datetime.utcnow().year}<br/>
                AI‑powered food waste reduction for schools.
              </p>

            </div>
          </body>
        </html>
        """
        try:
            send_email(email, user_subject, user_body)
        except Exception as e:
            print(f"Warning: Could not send confirmation email to {email}: {e}")

        return {
            "success": True,
            "message": "Your message has been sent successfully. We'll get back to you soon!",
            "email": email,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error processing contact form: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing contact form: {str(e)}",
        )


app.include_router(predict_router, prefix="/api/predict", tags=["predict"])


# ---------------------------
# HEALTH CHECK
# ---------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "message": "FastAPI backend running"}


# ---------------------------
# STARTUP
# ---------------------------
initialize_firebase()


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=PORT)
