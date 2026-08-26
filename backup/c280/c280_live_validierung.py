from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

BASE = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280")
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def psql(sql: str) -> str:
    return lauf([
        "docker",
        "exec",
        CONTAINER,
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-t",
        "-A",
        "-F",
        "\t",
        "-c",
        sql,
    ])


schema = lauf([
    "pnpm",
    "exec",
    "tsx",
    "supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts",
])
(BASE / "live-schema-vollstaendigkeit.out").write_text(schema + "\n", encoding="utf-8", newline="\n")

freigabe = lauf(["node", "tools/schemafreigabe-pruefen.mjs"])
(BASE / "live-schemafreigabe.out").write_text(freigabe + "\n", encoding="utf-8", newline="\n")

testdaten = lauf([
    "pnpm",
    "exec",
    "tsx",
    "supabase/_pipeline/_validierung/testdaten-pruefen.ts",
])
(BASE / "live-testdaten-pruefen.out").write_text(testdaten + "\n", encoding="utf-8", newline="\n")

control = psql(
    """
    with counts(name, value) as (
      values
      ('nutrition.meal_items', (select count(*)::text from nutrition.meal_items)),
      ('nutrition.meals', (select count(*)::text from nutrition.meals)),
      ('supplements.substance_aliases', (select count(*)::text from supplements.substance_aliases)),
      ('nutrition.water_logs', (select count(*)::text from nutrition.water_logs)),
      ('supplements.intake_logs', (select count(*)::text from supplements.intake_logs)),
      ('supplements.substance_catalog_sources', (select count(*)::text from supplements.substance_catalog_sources)),
      ('supplements.substance_catalog', (select count(*)::text from supplements.substance_catalog)),
      ('medical.medication_active_substances', (select count(*)::text from medical.medication_active_substances)),
      ('medical.medication_formulations', (select count(*)::text from medical.medication_formulations)),
      ('medical.medication_products', (select count(*)::text from medical.medication_products)),
      ('goals.body_measurements', (select count(*)::text from goals.body_measurements)),
      ('recovery.checkins', (select count(*)::text from recovery.checkins)),
      ('recovery.scores', (select count(*)::text from recovery.scores)),
      ('medical.lab_result_values', (select count(*)::text from medical.lab_result_values)),
      ('supplements.substance_lab_effects', (select count(*)::text from supplements.substance_lab_effects)),
      ('training.workout_sets', (select count(*)::text from training.workout_sets)),
      ('recovery.modality_log', (select count(*)::text from recovery.modality_log)),
      ('nutrition.nutrient_defs', (select count(*)::text from nutrition.nutrient_defs)),
      ('nutrition.foods', (select count(*)::text from nutrition.foods))
    )
    select name, value from counts;
    """
)
(BASE / "live-19-kontrollzahlen.out").write_text(control + "\n", encoding="utf-8", newline="\n")

print(BASE)
