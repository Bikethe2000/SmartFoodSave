from fastapi import APIRouter, Request, HTTPException
from firebase_admin import auth, firestore
import json

router = APIRouter()

def get_db():
    # Initialize Firebase Admin SDK if not already initialized
    try:
        firestore.client()
    except Exception:
        import firebase_admin
        from firebase_admin import credentials
        import os

        service_account = json.load(os.getenv("FIREBASE_SERVICE_ACCOUNT"))
        cred = credentials.Certificate(service_account)
        firebase_admin.initialize_app(cred)

    return firestore.client()

@router.get("/api/data/schedule")
async def get_schedule(request: Request):
    try:
        token = request.headers.get("authorization", "").replace("Bearer ", "")
        if not token:
            raise HTTPException(status_code=401, detail="Missing token")

        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]

        db = get_db()
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        school = user_doc.to_dict().get("school")
        school_doc = db.collection("school_schedules").document(school).get()

        if not school_doc.exists:
            return {"schedule": {}}

        data = school_doc.to_dict()
        return {"schedule": data.get("schedule", {})}

    except Exception as e:
        print("Error loading schedule:", e)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/api/data/schedule")
async def save_schedule(request: Request):
    try:
        token = request.headers.get("authorization", "").replace("Bearer ", "")
        if not token:
            raise HTTPException(status_code=401, detail="Missing token")

        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]

        body = await request.json()
        schedule = body.get("schedule", {})

        db = get_db()
        user_doc = db.collection("users").document(uid).get()
        school = user_doc.to_dict().get("school")

        db.collection("school_schedules").document(school).set(
            {"schedule": schedule},
            merge=True
        )

        return {"success": True}

    except Exception as e:
        print("Error saving schedule:", e)
        raise HTTPException(status_code=500, detail="Internal server error")
