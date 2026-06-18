from firebase_admin import firestore
from app import initialize_firebase

initialize_firebase()
db = firestore.client()

school = "Demo School"

db.collection("school_meals").document(school).set({
    "dictionary": {
        "Pasta Bolognese": ["pasta", "bolognese", "makaronia me kima"],
        "Pasta Carbonara": ["pasta", "carbonara"],
        "Chicken with Rice": ["chicken", "kotopoulo", "rice", "rizi"],
        "Fish Fillet with Potatoes": ["fish", "psari", "fillet", "potatoes"],
        "Vegetarian Lasagna": ["lasagna", "vegetarian", "vegan"],
        "Pizza Margherita": ["pizza", "margherita"]
    },
    "tags": {
        "Pasta Bolognese": ["pasta", "meat", "oven"],
        "Pasta Carbonara": ["pasta", "cream"],
        "Chicken with Rice": ["meat", "rice"],
        "Fish Fillet with Potatoes": ["fish", "oven"],
        "Vegetarian Lasagna": ["vegetarian", "pasta", "oven"],
        "Pizza Margherita": ["pizza", "vegetarian"]
    }
}, merge=True)
