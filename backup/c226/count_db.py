
import sys
from pathlib import Path
sys.path.insert(0, r'D:\GitHub\LumeOS-Claude-V1\tools')
from lauf import lauf

DB = sys.argv[1]
ROWS = [
    ('nutrition.meal_items', 'nutrition', 'meal_items'),
    ('nutrition.meals', 'nutrition', 'meals'),
    ('supplements.substance_aliases', 'supplements', 'substance_aliases'),
    ('nutrition.water_logs', 'nutrition', 'water_logs'),
    ('supplements.intake_logs', 'supplements', 'intake_logs'),
    ('supplements.substance_catalog_sources', 'supplements', 'substance_catalog_sources'),
    ('supplements.substance_catalog', 'supplements', 'substance_catalog'),
    ('medical.medication_active_substances', 'medical', 'medication_active_substances'),
    ('medical.medication_formulations', 'medical', 'medication_formulations'),
    ('medical.medication_products', 'medical', 'medication_products'),
    ('goals.body_measurements', 'goals', 'body_measurements'),
    ('recovery.checkins', 'recovery', 'checkins'),
    ('recovery.scores', 'recovery', 'scores'),
    ('medical.lab_result_values', 'medical', 'lab_result_values'),
    ('supplements.substance_lab_effects', 'supplements', 'substance_lab_effects'),
    ('training.workout_sets', 'training', 'workout_sets'),
    ('recovery.modality_log', 'recovery', 'modality_log'),
    ('nutrition.nutrient_defs', 'nutrition', 'nutrient_defs'),
    ('nutrition.foods', 'nutrition', 'foods'),
    ('medical.biomarker_reference_ranges', 'medical', 'biomarker_reference_ranges'),
]

def q(sql: str) -> str:
    out = lauf(['docker','exec','supabase_db_LumeOS-Claude-V1','psql','-U','postgres','-d',DB,'-Atc',sql])
    return out.strip()

def table_exists(schema: str, table: str) -> bool:
    return q(f"select count(*) from information_schema.tables where table_schema='{schema}' and table_name='{table}';") == '1'

def column_exists(schema: str, table: str, col: str) -> bool:
    return q(f"select count(*) from information_schema.columns where table_schema='{schema}' and table_name='{table}' and column_name='{col}';") == '1'

def function_count(schema: str, name: str) -> str:
    return q(f"select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='{schema}' and p.proname='{name}';")

for label, schema, table in ROWS:
    if not table_exists(schema, table):
        print(f'{label}\tMISSING_TABLE')
    else:
        print(f'{label}\t{q(f"select count(*) from {schema}.{table};")}')

print('substance_catalog.columns\t' + q("select count(*) from information_schema.columns where table_schema='supplements' and table_name='substance_catalog';"))
for col in ['safety','regulatory','warning_triggers','canonical_category']:
    if column_exists('supplements', 'substance_catalog', col):
        print(f'substance_catalog.{col}\t{q(f"select count(*) from supplements.substance_catalog where {col} is not null;")}')
    else:
        print(f'substance_catalog.{col}\tABSENT')
print(f"recovery.scores.acwr_used.column\t{1 if column_exists('recovery','scores','acwr_used') else 0}")
print(f"nutrition.food_preference_search_targets.exists\t{1 if table_exists('nutrition','food_preference_search_targets') else 0}")
print(f"recovery.acwr_for_day.function\t{function_count('recovery','acwr_for_day')}")
print(f"recovery.training_load_score.function\t{function_count('recovery','training_load_score')}")
