# SmartFoodSave Backend - Python + Flask

Shared Python/Flask backend API serving web (React/Vite) and mobile (Flutter) applications.

## Setup

### Prerequisites
- Python 3.8+
- Firebase project with Firestore
- Service account key (JSON)

### Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Firebase credentials
```

### Running

```bash
# Development mode
python app.py

# Production with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Server runs on `http://localhost:5000`

## Environment Variables

- `PORT` - Server port (default: 5000)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Private key from service account
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_API_KEY` - Web API key for auth proxy

See `.env.example` for complete list.

## API Endpoints

All endpoints require: `Authorization: Bearer <idToken>` header

### Authentication
- `POST /api/auth/login` - Email/password login

### Dashboard
- `GET /api/stats/weekly-waste` - Weekly waste stats
- `GET /api/predictions/upcoming` - High-risk predictions
- `GET /api/recommendations/today` - Top 3 recommendations

### Predictions
- `GET /api/predictions` - List (optional: ?from=DATE&to=DATE)
- `GET /api/predictions/:id` - Details
- `POST /api/predictions` - Create

### Recommendations
- `GET /api/recommendations` - List all
- `POST /api/recommendations/:id/accept` - Accept
- `POST /api/recommendations/:id/ignore` - Ignore
- `POST /api/recommendations` - Create

### Data Logs
- `GET /api/data/daily-logs` - List logs
- `POST /api/data/daily-logs` - Add log

### Health
- `GET /health` - Server status

## Clients

- **Web**: React/Vite (`../site/`) - uses `/api` proxy
- **Mobile**: Flutter (`../mobile_app/`) - direct HTTP calls

## Testing

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass"}'

# Use token with protected endpoint
curl -X GET http://localhost:5000/api/stats/weekly-waste \
  -H "Authorization: Bearer YOUR_TOKEN"
```
