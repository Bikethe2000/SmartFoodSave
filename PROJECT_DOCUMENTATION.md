# SmartFoodSave Project Documentation

## 1. Title

SmartFoodSave: An AI-Assisted Decision Support System for Food Waste Reduction in School Meal Operations

## 2. Executive Summary

SmartFoodSave is a full-stack software and AI project focused on reducing food waste in school environments. The platform combines machine learning, semantic text matching, rule-based nutritional analysis, operational logging, and donation-point discovery to support schools in managing meal preparation and leftovers more effectively.

The project addresses a practical sustainability problem: schools must prepare enough food to satisfy uncertain attendance and heterogeneous meal preferences, while avoiding avoidable surplus. SmartFoodSave treats this as a data-driven prediction and decision-support problem. The system records school meal logs, estimates probable leftovers, flags nutrition and schedule issues, recommends meal alternatives, and identifies nearby donation destinations for surplus food.

The implementation in this repository demonstrates a working end-to-end architecture. However, the documentation also makes a necessary academic distinction: the current trained regression model is benchmarked on a synthetic dataset included in the repository, while the production backend is designed to collect real operational data via Firebase Firestore for future retraining and validation.

## 3. Motivation And Societal Relevance

Food waste is a major economic, environmental, and social challenge. In school systems, waste has several direct consequences:

- Unnecessary purchasing and preparation costs
- Poor resource utilization
- Environmental burden from discarded food
- Missed opportunities for redistribution to people in need

At the same time, school meal planning is difficult because attendance varies, student preferences differ, and menu acceptance is not constant across meal types or time periods. A school may overestimate demand for a menu category such as fish or vegetarian meals, or underestimate the stabilizing effect of highly preferred meals such as chicken or pizza.

SmartFoodSave is motivated by the need for a practical decision-support tool that can operate under imperfect data conditions, support real users, and remain extensible as more data becomes available.

## 4. Project Objectives

The core objectives of the project are:

1. To collect structured operational food-service data from schools.
2. To predict expected leftovers for planned meals.
3. To normalize free-text menus into canonical forms suitable for machine processing.
4. To incorporate basic nutritional reasoning into meal recommendations.
5. To account for contextual school characteristics such as size and demographics.
6. To support redistribution of edible surplus food via donation-point discovery.
7. To provide usable web and mobile interfaces for school operators.

## 5. Full System Description

### 5.1 Backend

The backend is implemented in FastAPI and acts as the central orchestration layer. It exposes endpoints for authentication, settings, meal logging, schedules, meal metadata, prediction, donation search, and contact handling.

Main backend responsibilities:

- Firebase-backed authentication support
- Firestore persistence for user and school data
- Machine learning inference
- Heuristic nutrition and schedule analysis
- Semantic meal interpretation
- Donation-point lookup and enrichment
- Email delivery for OTP and notifications

### 5.2 Web dashboard

The web dashboard provides a desktop-oriented interface for school staff. It is intended to support data entry, operational monitoring, and prediction usage.

### 5.3 Mobile application

The Expo React Native application provides mobile access to the same operational workflow. This is important for realistic school deployment scenarios, where data is often entered close to service time rather than exclusively from desktop environments.

**Mobile App APK Delivery:** Due to repository size constraints, the mobile APK is available via Google Drive: [Download APK](https://drive.google.com/file/d/1_RrAgc_zeNRVatusqZJOr8Ymti2sndLO/view?usp=sharing)

### 5.4 Documentation site

The repository also contains a dedicated documentation site, which supports onboarding and project communication.

## 6. Software Architecture

The system follows a service-oriented application architecture centered on a single backend.

```text
Client Interfaces
|- Web dashboard
|- Mobile app
|- Documentation site

Backend Services
|- Authentication and OTP
|- Settings and user profile management
|- Daily meal logging
|- Schedule and meal dictionary management
|- AI prediction and recommendation engine
|- Donation discovery and messaging

Persistence and External Services
|- Firebase Auth
|- Firestore
|- OpenAI API
|- SentenceTransformer model
|- OpenStreetMap Nominatim
|- Google Maps APIs
|- Resend email service
```

## 7. Data Model And Data Collection

### 7.1 Firestore collections

The implemented backend uses the following Firestore collections:

- `users`
- `settings`
- `daily_logs`
- `school_schedules`
- `school_meals`
- `otp`

### 7.2 User and school metadata

The `settings` and `users` collections capture contextual data such as:

- School name
- School type
- Student count
- Portion size
- Gender distribution
- Geographic location
- Timezone

These fields are not merely administrative. They are also used in the prediction explanation layer and demographic adjustment stage.

### 7.3 Daily log schema

Each daily log entry includes:

- `date`
- `dayOfWeek`
- `menuItems`
- `attendance`
- `prepared`
- `served`
- `leftovers`
- `createdAt`

From a machine learning perspective, each log is a labeled observation because it contains both predictors and target outcome. In formal notation:

$$
x_i = (d_i, m_i, a_i, p_i, s_i)
$$

$$
y_i = l_i
$$

where:

- $d_i$ is the date or weekday context
- $m_i$ is the menu information
- $a_i$ is attendance
- $p_i$ is prepared quantity
- $s_i$ is served quantity
- $l_i$ is leftovers

### 7.4 Meal metadata

The `school_meals` collection stores:

- Dictionary mappings from keywords to canonical meals
- Tag sets for meals

This enables standardization of meal naming, which is essential because schools often use local, inconsistent, or multilingual menu language.

## 8. Repository Data Assets

### 8.1 Baseline dataset: `data.csv`

This compact dataset contains 30 rows and serves primarily as an example dataset.

Summary statistics:

| Metric | Value |
|---|---:|
| Rows | 30 |
| Mean prepared portions | 109.0 |
| Mean served portions | 86.3 |
| Mean leftovers | 22.7 |
| Mean attendance | 97.767 |
| Overall waste rate | 20.826% |

Per-menu summary:

| Menu item | Samples | Avg attendance | Avg prepared | Avg served | Avg leftovers | Avg waste rate |
|---|---:|---:|---:|---:|---:|---:|
| Pasta | 6 | 99.667 | 120.0 | 92.5 | 27.5 | 22.917% |
| Pizza | 5 | 100.0 | 130.0 | 102.8 | 27.2 | 20.923% |
| Chicken Wrap | 5 | 100.0 | 110.0 | 88.0 | 22.0 | 20.000% |
| Rice Bowl | 5 | 95.0 | 100.0 | 79.2 | 20.8 | 20.800% |
| Salad | 5 | 92.0 | 90.0 | 70.0 | 20.0 | 22.222% |
| Sandwich | 4 | 100.0 | 100.0 | 83.5 | 16.5 | 16.500% |

### 8.2 Synthetic model-training dataset: `improved_data.csv`

This is the main training asset used by the current Random Forest model. It contains 730 rows generated by the script `generate_dataset.py`.

Generator assumptions in code:

- Start date: 2024-01-01
- Number of days: 730
- Attendance sampled from a normal distribution centered near 110
- Monday attendance reduced by 12
- Friday attendance increased by 8
- Prepared portions set to attendance plus a random buffer between 5% and 25%
- Leftovers determined from extra prepared food, a menu-specific waste factor, and Gaussian noise

Menu configuration used by the generator:

| Menu item | Popularity | Waste factor |
|---|---:|---:|
| Pasta | 0.85 | 0.18 |
| Chicken | 0.95 | 0.10 |
| Fish | 0.70 | 0.28 |
| Vegetarian | 0.60 | 0.35 |
| Pizza | 0.92 | 0.12 |

Global summary:

| Metric | Value |
|---|---:|
| Rows | 730 |
| Mean attendance | 108.599 |
| Mean prepared portions | 124.095 |
| Mean leftovers | 2.736 |
| Leftovers standard deviation | 2.377 |
| Overall waste rate | 2.204% |
| Minimum leftovers | 0 |
| Maximum leftovers | 11 |

Per-menu summary:

| Menu item | Samples | Avg attendance | Avg prepared | Avg leftovers | Std leftovers | Avg waste rate |
|---|---:|---:|---:|---:|---:|---:|
| Vegetarian | 149 | 108.497 | 123.564 | 4.799 | 2.787 | 3.754% |
| Fish | 144 | 109.264 | 124.188 | 3.840 | 2.196 | 3.030% |
| Pasta | 152 | 106.000 | 120.559 | 2.125 | 1.653 | 1.751% |
| Pizza | 130 | 109.992 | 126.369 | 1.562 | 1.233 | 1.217% |
| Chicken | 155 | 109.458 | 126.077 | 1.310 | 1.421 | 1.015% |

Weekday summary:

| Day | Samples | Avg attendance | Avg prepared | Avg leftovers | Avg waste rate |
|---|---:|---:|---:|---:|---:|
| 0 | 105 | 98.352 | 112.162 | 2.724 | 2.381% |
| 1 | 105 | 109.705 | 125.371 | 2.667 | 2.074% |
| 2 | 104 | 108.798 | 123.644 | 2.750 | 2.185% |
| 3 | 104 | 108.048 | 124.337 | 2.740 | 2.115% |
| 4 | 104 | 116.615 | 132.519 | 3.135 | 2.351% |
| 5 | 104 | 108.087 | 123.577 | 2.404 | 1.919% |
| 6 | 104 | 110.673 | 127.154 | 2.731 | 2.098% |

Correlation excerpts:

| Variable pair | Correlation |
|---|---:|
| attendance vs prepared_portions | 0.924 |
| prepared_portions vs leftovers | 0.332 |
| attendance vs leftovers | 0.172 |

## 9. Mathematical Formulation

### 9.1 Core prediction task

$$
\hat{y} = f(x)
$$

where:

$$
x = [\text{dayOfWeek}, \text{preparedPortions}, \text{attendance}, \text{historicalAvgLeftovers}, \text{mealEncoding}]
$$

and:

$$
y = \text{leftovers}
$$

### 9.2 Waste percentage

$$
\text{wasteRate}(\%) = \frac{\text{leftovers}}{\text{preparedPortions}} \times 100
$$

### 9.3 Mean Absolute Error

$$
\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|
$$

Measured repository result:

$$
\text{MAE} = 1.2125
$$

### 9.4 Random Forest regression

$$
\hat{y}(x) = \frac{1}{T}\sum_{t=1}^{T} h_t(x)
$$

with `T = 200` trees.

### 9.5 Cosine similarity for semantic matching

$$
\cos(\theta) = \frac{a \cdot b}{\|a\|\|b\|}
$$

### 9.6 Nutrition score

$$
\text{Nutrition Score} = \max(0, 1 - 0.2m)
$$

where $m$ is the number of detected nutrition issues.

### 9.7 Demographic adjustment

$$
\hat{y}_{adj} = \min(P, \max(0, \hat{y} \cdot F))
$$

where:

- $\hat{y}$ is the local model prediction
- $F$ is the product of demographic multipliers
- $P$ is prepared portions

### 9.8 Haversine distance

$$
a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)
$$

$$
c = 2\arctan2(\sqrt{a}, \sqrt{1-a})
$$

$$
d = 6371 \cdot c
$$

## 10. Models Used In The Project

### 10.1 Random Forest Regressor

Purpose:

- Predict expected leftovers in portions

Current configuration:

- `RandomForestRegressor`
- `n_estimators = 200`
- `random_state = 42`
- `train_test_split(test_size = 0.2)`

The script saves:

- `food_waste_model.pkl`
- `feature_columns.pkl`

### 10.2 Sentence Transformer: `all-MiniLM-L6-v2`

Purpose:

- Convert meal text into embeddings for semantic similarity and category matching

Role:

- Canonicalization of noisy menu entries
- Detection of main meal and side items
- Category alignment with weekly plans

### 10.3 OpenAI models

The repository currently uses:

- `gpt-4o-mini` for structured prediction fallback
- `gpt-4.1` for donation-point extraction
- `gpt-4.1-mini` for donation-point enrichment

### 10.4 Heuristic nutrition model

This is a knowledge-based scoring layer rather than a statistical learner. It uses manually specified nutrient estimates for a limited set of canonical meals.

### 10.5 Heuristic demographic adjustment

This layer applies multiplicative rules based on gender balance, school type, and school size. It should be described as contextual expert logic rather than a learned model.

## 11. Prediction Workflow

1. Authenticate the user
2. Identify the user's school
3. Load school schedule and optional weekly plan
4. Load historical school logs from Firestore
5. Determine the meal from user input or the stored schedule
6. Normalize the meal to a canonical form
7. Check nutrition issues and repeated-category conflicts
8. Attempt structured LLM prediction if enabled
9. Otherwise build a feature vector and run the Random Forest model
10. Clamp the prediction to valid bounds
11. Compute risk level
12. Apply demographic adjustment
13. Return explanation and summary values

## 12. Nutrition Reasoning Layer

The internal nutrition database currently includes approximate entries for meals such as:

- Pasta Bolognese
- Pasta Carbonara
- Pasta Alfredo
- Pasta Napoli
- Chicken with Rice
- Chicken Fillet
- Chicken Soup
- Fish Fillet with Potatoes
- Grilled Fish
- Fish Soup
- Vegetarian Lasagna
- Pizza Margherita
- Pizza Special

Stored fields include:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Sodium
- Tags

The current rule thresholds are:

- Fiber target at least `6 g`
- Protein target at least `25 g`
- Sodium target at most `2300 mg`
- Calorie band between `450` and `1000 kcal`

## 13. Donation And Redistribution Workflow

The project supports surplus-food donation through:

1. City geocoding
2. AI-assisted donation-point extraction
3. Google Maps enrichment where needed
4. Haversine distance ranking
5. Email notification of a nearby donation point

This extends the project from prediction alone to actionable waste mitigation.

## 14. Critical Evaluation

### Strengths

- End-to-end implementation rather than isolated notebook work
- Realistic operational data schema
- Hybrid AI design combining prediction, semantics, and rules
- Clear sustainability use case
- Ready path for real-data improvement

### Limitations

- Current trained model is benchmarked on synthetic data
- Nutrition database is limited and approximate
- Demographic adjustment is rule-based
- No uncertainty estimation yet
- No automated retraining pipeline from Firestore logs yet

### Threats to validity

- Synthetic data may not match real school behavior
- Rule-based assumptions may not generalize across institutions
- LLM-assisted outputs depend on external service quality and availability

## 15. Future Work

1. Export and anonymize Firestore logs into a versioned research dataset
2. Retrain on real school data
3. Add RMSE, $R^2$, and calibration metrics
4. Add confidence intervals or uncertainty estimates
5. Expand the nutrition knowledge base using validated food composition data
6. Replace heuristic demographic factors with empirically learned features
7. Measure real-world waste reduction after deployment

## 16. Conclusion

SmartFoodSave is a credible university-level AI and software engineering project because it integrates machine learning, data collection, semantic processing, user interfaces, and socially relevant decision support into one coherent platform. Its current strongest contribution is the working end-to-end architecture. Its main research limitation is that the local waste predictor is still validated on synthetic data. That distinction is important, and it is now documented clearly for submission purposes.