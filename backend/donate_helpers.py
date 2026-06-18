# helpers.py
import os
import math
import httpx
from email.message import EmailMessage
from openai import OpenAI
import smtplib

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SYSTEM_EMAIL = os.getenv("SMTP_USER")
SYSTEM_EMAIL_PASSWORD = os.getenv("SMTP_PASS")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def build_directions_link(address):
    if not address:
        return None
    return f"https://www.google.com/maps/dir/?api=1&destination={address.replace(' ', '+')}"


# -----------------------------
# 1. GEOCODING (City → lat/lon)
# -----------------------------
async def geocode_city(city):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": city, "format": "json", "limit": 1},
            headers={"User-Agent": "DonationFinder/1.0"}
        )
    data = res.json()
    if not data:
        return None
    return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}

# -----------------------------
# 2. FETCH OSM DONATION POINTS
# -----------------------------
async def ai_find_donation_points(city):
    prompt = f"""
    Search the web for donation points, food banks, charities, and social support centers
    located in or near: {city}.

    Your job:
    - Perform a real web search.
    - Extract ONLY real places.
    - Return a JSON list of objects.
    - Each object MUST include:
        - name
        - full exact address(address)
        - type
        - latitude(lat)
        - longitude(lon)
        - website (if available)
        - phone (if available)

    Return ONLY valid JSON.
    """

    response = client.responses.create(
        model="gpt-4.1",
        input=prompt,
        max_output_tokens=500
    )
    print("AI FIND DONATION POINTS RESPONSE:", response.output[0].content[0].text)

    return response.output[0].content[0].text
#-----------------------------
# 3. GOOGLE MAPS GEOCODING
# -----------------------------
async def google_maps_lookup(address):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": GOOGLE_API_KEY, "language": "en"}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)

    data = res.json()
    if not data.get("results"):
        return None

    result = data["results"][0]
    return {
        "formatted_address": result.get("formatted_address"),
        "location": result.get("geometry", {}).get("location"),
        "place_id": result.get("place_id")
    }

# -----------------------------
# 4. GOOGLE PLACE DETAILS
# -----------------------------
async def google_place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "formatted_address,formatted_phone_number,website,opening_hours",
        "key": GOOGLE_API_KEY,
        "language": "en"
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)

    data = res.json()
    return data.get("result")

# -----------------------------
# 5. HAVERSINE DISTANCE
# -----------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

# -----------------------------
# 6. AI ENRICHMENT
# -----------------------------
async def ai_enrich(raw, google_data):
    prompt = f"""
    You are an AI that enriches donation point data.

    Your MOST IMPORTANT RULE:
    - ALWAYS return the **exact full address** of the donation point.
    - NEVER return only the city.
    - NEVER guess — use Google Maps data if available and other data in the web.

    Raw OSM:
    {raw}

    Google Maps:
    {google_data}

    Return JSON with:
    - name
    - address (FULL EXACT ADDRESS)
    - phone
    - website
    - hours
    - type
    - accepted
    - rating (1-5)
    """

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt,
        max_output_tokens=300
    )

    return response.output[0].content[0].text

# -----------------------------
# 7. SAFE EMAIL SENDING
# -----------------------------
def build_directions_link_with_origin(origin_lat, origin_lon, dest_address):
    if not dest_address:
        return None
    base = "https://www.google.com/maps/dir/?api=1"
    return f"{base}&origin={origin_lat},{origin_lon}&destination={dest_address.replace(' ', '+')}"


# -----------------------------
# 8. MULTI-LANGUAGE EMAIL
# -----------------------------
def donation_email(language, point):
    name = point.get("name", "Unknown")
    address = point.get("address", "Unknown")
    distance = point.get("distance", "Unknown")
    directions = build_directions_link(address)

    if language == "el":
        body = f"""
        <html>
          <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0f172a;">
            <h2>Βρέθηκε σημείο δωρεάς κοντά σας</h2>
            <p><strong>Όνομα:</strong> {name}</p>
            <p><strong>Διεύθυνση:</strong> {address}</p>
            <p><strong>Απόσταση:</strong> {distance}</p>
            <p>
              <a href="{directions}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px;">
                Οδηγίες στο Google Maps
              </a>
            </p>
          </body>
        </html>
        """
        subject = "Βρέθηκε σημείο δωρεάς"
        return subject, body

    body = f"""
    <html>
      <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0f172a;">
        <h2>Donation point found near you</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Address:</strong> {address}</p>
        <p><strong>Distance:</strong> {distance}</p>
        <p>
          <a href="{directions}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px;">
            Open in Google Maps
          </a>
        </p>
      </body>
    </html>
    """
    subject = "Donation point found"
    return subject, body
