import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# -------------------------------------------------------
# 1. Load CSV
# -------------------------------------------------------
df = pd.read_csv("improved_data.csv")

# -------------------------------------------------------
# 2. Basic preprocessing
# -------------------------------------------------------

# Ensure date is datetime
df["date"] = pd.to_datetime(df["date"])

# If day_of_week is missing, compute it
if "day_of_week" not in df.columns:
    df["day_of_week"] = df["date"].dt.weekday

# -------------------------------------------------------
# 3. Feature engineering
# -------------------------------------------------------

# One-hot encode menu_item
df = pd.get_dummies(df, columns=["menu_item"])

# Rolling average leftovers per menu item
df["historical_avg_leftovers"] = (
    df.groupby("menu_item_Pasta").leftovers.transform(lambda x: x.rolling(3, min_periods=1).mean())
    if "menu_item_Pasta" in df.columns else df["leftovers"].rolling(3, min_periods=1).mean()
)

# -------------------------------------------------------
# 4. Select features & target
# -------------------------------------------------------

feature_cols = [
    "day_of_week",
    "prepared_portions",
    "attendance",
    "historical_avg_leftovers",
]

# Add all one-hot encoded menu columns
menu_cols = [col for col in df.columns if col.startswith("menu_item_")]
feature_cols.extend(menu_cols)

X = df[feature_cols]
y = df["leftovers"]

# -------------------------------------------------------
# 5. Train/test split
# -------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------------------------------
# 6. Train model
# -------------------------------------------------------

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# -------------------------------------------------------
# 7. Evaluate
# -------------------------------------------------------

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print("Mean Absolute Error:", mae)

# -------------------------------------------------------
# 8. Save model + feature names
# -------------------------------------------------------

joblib.dump(model, "food_waste_model.pkl")
joblib.dump(feature_cols, "feature_columns.pkl")

print("Model saved as food_waste_model.pkl")
print("Feature columns saved as feature_columns.pkl")
 