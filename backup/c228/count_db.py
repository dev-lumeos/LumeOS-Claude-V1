
import sys
sys.path.insert(0, r'D:\GitHub\LumeOS-Claude-V1\tools')
from lauf import lauf
DB=sys.argv[1]
ROWS=[
('nutrition.meal_items','nutrition','meal_items'),('nutrition.meals','nutrition','meals'),('supplements.substance_aliases','supplements','substance_aliases'),('nutrition.water_logs','nutrition','water_logs'),('supplements.intake_logs','supplements','intake_logs'),('supplements.substance_catalog_sources','supplements','substance_catalog_sources'),('supplements.substance_catalog','supplements','substance_catalog'),('medical.medication_active_substances','medical','medication_active_substances'),('medical.medication_formulations','medical','medication_formulations'),('medical.medication_products','medical','medication_products'),('goals.body_measurements','goals','body_measurements'),('recovery.checkins','recovery','checkins'),('recovery.scores','recovery','scores'),('medical.lab_result_values','medical','lab_result_values'),('supplements.substance_lab_effects','supplements','substance_lab_effects'),('training.workout_sets','training','workout_sets'),('recovery.modality_log','recovery','modality_log'),('nutrition.nutrient_defs','nutrition','nutrient_defs'),('nutrition.foods','nutrition','foods'),('medical.biomarker_reference_ranges','medical','biomarker_reference_ranges')]
def q(sql):
    return lauf(['docker','exec','supabase_db_LumeOS-Claude-V1','psql','-U','postgres','-d',DB,'-Atc',sql]).strip()
def table_exists(s,t): return q(f"select count(*) from information_schema.tables where table_schema='{s}' and table_name='{t}';")=='1'
def col_exists(c): return q(f"select count(*) from information_schema.columns where table_schema='supplements' and table_name='substance_catalog' and column_name='{c}';")=='1'
for label,s,t in ROWS:
    print(f"{label}\t{q(f'select count(*) from {s}.{t};') if table_exists(s,t) else 'MISSING_TABLE'}")
print('substance_catalog.columns\t'+q("select count(*) from information_schema.columns where table_schema='supplements' and table_name='substance_catalog';"))
for col in ['gruppe','kategorie','description','monitoring']:
    if col_exists(col): print(f"substance_catalog.{col}\t"+q(f"select count(*) from supplements.substance_catalog where {col} is not null;"))
    else: print(f"substance_catalog.{col}\tABSENT")
if col_exists('gruppe'):
    print('substance_catalog.gruppe_distribution\t'+q("select string_agg(gruppe || ':' || c, ', ' order by gruppe) from (select gruppe, count(*) c from supplements.substance_catalog group by gruppe) s;"))
    print('substance_catalog.no_gruppe\t'+q("select count(*) from supplements.substance_catalog where gruppe is null;"))
