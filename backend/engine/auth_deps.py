from fastapi import Request, HTTPException
from firebase_admin import auth as firebase_auth


async def authenticate(request: Request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]

    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception as exc:
        print("Auth token verification failed:", exc)
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {exc}")

