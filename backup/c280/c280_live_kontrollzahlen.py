from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\live-19-kontrollzahlen.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"

sql = """
create or replace function pg_temp.count_if_exists(p_rel text)
returns text
language plpgsql
as $$
declare
  v_count text;
begin
  if to_regclass(p_rel) is null then
    return 'MISSING';
  end if;
  execute format('select count(*)::text from %s', p_rel) into v_count;
  return v_count;
end;
$$;

with targets(name) as (
  values
  ('nutrition.meal_items'),
  ('nutrition.meals'),
  ('supplements.substance_aliases'),
  ('nutrition.water_logs'),
  ('supplements.intake_logs'),
  ('supplements.substance_catalog_sources'),
  ('supplements.substance_catalog'),
  ('medical.medication_active_substances'),
  ('medical.medication_formulations'),
  ('medical.medication_products'),
  ('goals.body_measurements'),
  ('recovery.checkins'),
  ('recovery.scores'),
  ('medical.lab_result_values'),
  ('supplements.substance_lab_effects'),
  ('training.workout_sets'),
  ('recovery.modality_log'),
  ('nutrition.nutrient_defs'),
  ('nutrition.foods')
)
select name, pg_temp.count_if_exists(name) as value from targets;
"""

out = lauf([
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
OUT.write_text(out + "\n", encoding="utf-8", newline="\n")
print(OUT)
