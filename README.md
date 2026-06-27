# SmartFoodSave / FoodWasteAI

SmartFoodSave is an AI-assisted platform for reducing food waste in school meal operations. It combines data collection, machine learning prediction, semantic meal normalization, nutrition-aware menu logic, and donation-point discovery into one full-stack system.

This repository contains:

- A FastAPI backend for authentication, data storage, prediction, scheduling, and integrations
- A React web dashboard for school staff
- An Expo React Native mobile app
- A separate React documentation site

**YH4F Submission Note:**
- Full Technical Report: [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- **Mobile App APK Delivery:** Due to repository size constraints, the mobile APK is available via Google Drive: [Download APK](https://drive.google.com/file/d/1_RrAgc_zeNRVatusqZJOr8Ymti2sndLO/view?usp=sharing)

## Abstract

Food waste in schools is driven by uncertainty in attendance, variation in menu popularity, and limited decision-support for meal preparation. SmartFoodSave addresses this by collecting structured cafeteria data, predicting expected leftovers, checking nutritional and scheduling issues, and helping schools identify nearby donation points for surplus food.

The current system combines four technical layers:

1. Operational data collection from schools
2. Machine learning prediction of leftovers
3. Semantic and rule-based menu reasoning
4. Redistribution support through donation discovery

## Project Structure

```text
FoodWasteAI/
|- backend/        FastAPI API + ML logic
|- site/           Main React dashboard
|- myApp/          Expo mobile app (React Native + TypeScript)
|- docs/           Documentation website + technical report
|- serviceAccountKey.json
|- README.md
```

## System Architecture

```text
Dashboard (site) ----->
                      |
Mobile (myApp) ------> FastAPI backend (backend/app.py) -----> Firebase Auth + Firestore
                      |                                      |
Docs (docs) ----------> Static/documentation frontend        +--> ML prediction engine
                                                             +--> SentenceTransformer
                                                             +--> OpenAI services
                                                             +--> Donation lookup logic
```

## Technical Stack

### Backend

- FastAPI + Uvicorn
- Firebase Admin SDK
- Firestore
- scikit-learn + pandas + numpy
- sentence-transformers
- OpenAI API
- httpx

### Frontend

- React
- Vite
- Tailwind CSS
- Firebase Web SDK

### Mobile

- Expo
- React Native + TypeScript
- Expo Router

## Data And Statistics

The repository currently includes two CSV datasets.

### 1. Baseline sample dataset

File: `backend/engine/data.csv`

- Rows: `30`
- Columns: `date`, `day_of_week`, `menu_item`, `prepared_portions`, `served_portions`, `leftovers`, `attendance`
- Mean leftovers: `22.7`
- Overall waste rate: `20.826%`

Per-menu summary:

| Menu item | Samples | Avg leftovers | Avg waste rate |
|---|---:|---:|---:|
| Pasta | 6 | 27.5 | 22.917% |
| Pizza | 5 | 27.2 | 20.923% |
| Chicken Wrap | 5 | 22.0 | 20.000% |
| Rice Bowl | 5 | 20.8 | 20.800% |
| Salad | 5 | 20.0 | 22.222% |
| Sandwich | 4 | 16.5 | 16.500% |

### 2. Current model training dataset

File: `backend/engine/improved_data.csv`

- Rows: `730`
- Columns: `date`, `day_of_week`, `menu_item`, `attendance`, `prepared_portions`, `served`, `leftovers`
- Mean attendance: `108.599`
- Mean prepared portions: `124.095`
- Mean leftovers: `2.736`
- Standard deviation of leftovers: `2.377`
- Overall waste rate: `2.204%`

Per-menu summary:

| Menu item | Samples | Avg leftovers | Std leftovers | Avg waste rate |
|---|---:|---:|---:|---:|
| Vegetarian | 149 | 4.799 | 2.787 | 3.754% |
| Fish | 144 | 3.840 | 2.196 | 3.030% |
| Pasta | 152 | 2.125 | 1.653 | 1.751% |
| Pizza | 130 | 1.562 | 1.233 | 1.217% |
| Chicken | 155 | 1.310 | 1.421 | 1.015% |

## Models Used

### Primary waste prediction model

File: `backend/engine/train.py`

- Model: `RandomForestRegressor`
- Trees: `200`
- Train/test split: `80/20`
- Random state: `42`
- Current measured metric: `Mean Absolute Error = 1.2125`

Training features:

- `day_of_week`
- `prepared_portions`
- `attendance`
- `historical_avg_leftovers`
- one-hot encoded menu categories

Target variable:

- `leftovers`

### Semantic meal-normalization model

File: `backend/engine/predict.py`

- Model: `sentence-transformers/all-MiniLM-L6-v2`
- Purpose: semantic meal/category matching through embeddings and cosine similarity

### Optional LLM assistance

The backend also uses OpenAI models when configured:

- `gpt-4o-mini` for structured prediction fallback and explanation
- `gpt-4.1` for donation-point discovery
- `gpt-4.1-mini` for donation-point enrichment

## Mathematical Formulation

### Waste rate

$$
	ext{Waste Rate}(\%) = \frac{\text{Leftovers}}{\text{Prepared Portions}} \times 100
$$

### Mean Absolute Error

$$
	ext{MAE} = \frac{1}{n}\sum_{i=1}^{n} |y_i - \hat{y}_i|
$$

Current measured value:

$$
	ext{MAE} = 1.2125
$$

### Random Forest regression estimate

$$
\hat{y}(x) = \frac{1}{T}\sum_{t=1}^{T} h_t(x)
$$

where $T = 200$ trees.

### Cosine similarity for meal matching

$$
\cos(\theta) = \frac{a \cdot b}{\|a\|\|b\|}
$$

### Demographic adjustment

The runtime endpoint applies a multiplicative contextual factor:

$$
	ext{Adjusted Waste} = \text{Predicted Waste} \times f
$$

and clips the final value to:

$$
0 \leq \text{Adjusted Waste} \leq \text{Prepared Portions}
$$

### Donation distance

Nearby donation points are ranked with the Haversine distance formula:

$$
a = \sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)
$$

$$
c = 2\arctan2(\sqrt{a}, \sqrt{1-a})
$$

$$
d = R \cdot c
$$

with $R = 6371$ km.

## How Data Is Collected

The backend collects real school operational data through Firebase Firestore.

Main collections:

- `users`
- `settings`
- `daily_logs`
- `school_schedules`
- `school_meals`
- `otp`

Collected school-level variables include:

- School name
- School type
- Student count
- Portion size
- Gender distribution
- Location
- Daily menu items
- Attendance
- Prepared portions
- Served portions
- Leftovers

These are used during live prediction, although the committed training dataset in the repository is still synthetic.

## Current Limitations

This should be stated clearly in a university-style submission:

1. The current trained regression model is evaluated on synthetic data.
2. The nutrition layer is heuristic and intentionally approximate.
3. The demographic adjustment factors are rule-based, not learned from field data.
4. The current training script reports only MAE.
5. The app collects real data, but there is no automated retraining pipeline yet.

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Dashboard Web App

```bash
cd site
npm install
npm run dev
```

### Mobile App

```bash
cd myApp
npm install
npm run start
```

Then open with Expo Go or run:

```bash
npm run android
npm run ios
npm run web
```

### Docs Site

```bash
cd docs
npm install
npm run dev
```

## Environment Variables

### Backend

Create `backend/.env` manually:

```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_API_KEY=your_firebase_web_api_key
OPENAI_API_KEY=your_openai_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
RESEND_API_KEY=your_resend_key
SMTP_USER=optional_legacy_value
SMTP_PASS=optional_legacy_value
```

### Mobile

Use `myApp/.env.example` as reference.

## API Overview

Public endpoints:

- `GET /health`
- `POST /api/contact`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

Authenticated endpoints:

- `GET /api/settings`
- `POST /api/settings`
- `GET /api/data/daily-logs`
- `POST /api/data/daily-logs`
- `GET /api/schedule`
- `POST /api/schedule`
- `GET /api/meals/dictionary`
- `POST /api/meals/dictionary`
- `GET /api/meals/tags`
- `POST /api/meals/tags`
- `POST /api/meals/normalize`
- `POST /api/meals/combine`
- `GET /api/donations/nearby`
- `POST /api/predict`

## License

MIT
