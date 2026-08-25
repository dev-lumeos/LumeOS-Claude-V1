import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import psql


tables = [
    "nutrition.meal_items",
    "nutrition.meals",
    "supplements.substance_aliases",
    "nutrition.water_logs",
    "supplements.intake_logs",
    "supplements.substance_catalog_sources",
    "supplements.substance_catalog",
    "medical.medication_active_substances",
    "medical.medication_formulations",
    "medical.medication_products",
    "goals.body_measurements",
    "recovery.checkins",
    "recovery.scores",
    "medical.lab_result_values",
    "supplements.substance_lab_effects",
    "training.workout_sets",
    "recovery.modality_log",
    "nutrition.nutrient_defs",
    "nutrition.foods",
]

lines = []
for table in tables:
    lines.append(f"{table}|{psql(f'select count(*) from {table}').strip()}")

target = Path("backup/c248/live-19-counts.log")
target.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
print(target)
