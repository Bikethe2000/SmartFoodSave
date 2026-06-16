import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

DAYS = 730
START_DATE = datetime(2024, 1, 1)

MENU_ITEMS = {
    "Pasta": {"popularity": 0.85, "waste_factor": 0.18},
    "Chicken": {"popularity": 0.95, "waste_factor": 0.10},
    "Fish": {"popularity": 0.70, "waste_factor": 0.28},
    "Vegetarian": {"popularity": 0.60, "waste_factor": 0.35},
    "Pizza": {"popularity": 0.92, "waste_factor": 0.12},
}

rows = []

for i in range(DAYS):
    date = START_DATE + timedelta(days=i)
    dow = date.weekday()

    menu_item = random.choice(list(MENU_ITEMS.keys()))
    pop = MENU_ITEMS[menu_item]["popularity"]
    waste_factor = MENU_ITEMS[menu_item]["waste_factor"]

    # Attendance baseline
    attendance = int(np.random.normal(110, 12))

    # Day-of-week effect
    if dow == 0: attendance -= 12
    if dow == 4: attendance += 8

    attendance = max(60, min(attendance, 160))

    # Prepared portions = attendance + buffer
    buffer = np.random.uniform(0.05, 0.25)
    prepared = int(attendance * (1 + buffer))

    # Served = min(attendance, prepared)
    served = min(attendance, prepared)

    # Leftovers depend on:
    # - extra prepared
    # - waste factor
    # - random noise
    extra = prepared - served
    leftovers = int(extra * waste_factor + np.random.normal(0, 1.5))
    leftovers = max(0, leftovers)

    rows.append({
        "date": date.strftime("%Y-%m-%d"),
        "day_of_week": dow,
        "menu_item": menu_item,
        "attendance": attendance,
        "prepared_portions": prepared,
        "served": served,
        "leftovers": leftovers
    })

df = pd.DataFrame(rows)
df.to_csv("improved_data.csv", index=False)

print("✓ improved_data.csv created with", len(df), "rows")
