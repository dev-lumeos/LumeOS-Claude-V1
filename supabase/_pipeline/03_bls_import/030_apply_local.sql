-- STATUS: LOCAL_ONLY_BLS_IMPORT_EXPANSION
-- PURPOSE: Apply deterministic UTF-8 CSV artifacts generated from the approved local BLS workbook.
-- AUTHORIZATION BOUNDARY:
--   - Local Supabase/Test DB only
--   - No DEV/LIVE
--   - No Supabase Cloud
--   - No source workbook commit
--   - No unsupported food or nutrient values
--   - No RDA value changes

begin;

create temporary table stage_foods (
  bls_code text not null,
  name_de text not null,
  name_en text,
  name_th text,
  name_display_de text
) on commit drop;

create temporary table stage_food_nutrients (
  bls_code text not null,
  nutrient_code text not null,
  value numeric(12,5) not null,
  data_source text not null
) on commit drop;

\copy stage_foods (bls_code, name_de, name_en, name_th, name_display_de) from '/tmp/p1-005-bls-local-import/foods.csv' with (format csv, header true, encoding 'UTF8')

\copy stage_food_nutrients (bls_code, nutrient_code, value, data_source) from '/tmp/p1-005-bls-local-import/food_nutrients.csv' with (format csv, header true, encoding 'UTF8')

do $$
declare
  missing_nutrient_count integer;
begin
  select count(*) into missing_nutrient_count
  from stage_food_nutrients staged
  left join nutrition.nutrient_defs defs
    on defs.code = staged.nutrient_code
  where defs.code is null;

  if missing_nutrient_count <> 0 then
    raise exception 'staged food_nutrients contain % missing nutrient_defs targets', missing_nutrient_count;
  end if;
end
$$;

insert into nutrition.foods (bls_code, name_de, name_en, name_th, name_display_de)
select bls_code, name_de, name_en, coalesce(name_th, ''), name_display_de
from stage_foods
on conflict (bls_code) do update set
  name_de = excluded.name_de,
  name_en = excluded.name_en,
  name_th = excluded.name_th,
  name_display_de = excluded.name_display_de,
  updated_at = now();

insert into nutrition.food_nutrients (food_id, nutrient_code, value, data_source)
select foods.id, staged.nutrient_code, staged.value, staged.data_source
from stage_food_nutrients staged
join nutrition.foods foods
  on foods.bls_code = staged.bls_code
join nutrition.nutrient_defs defs
  on defs.code = staged.nutrient_code
on conflict (food_id, nutrient_code) do update set
  value = excluded.value,
  data_source = excluded.data_source;

analyze nutrition.foods;
analyze nutrition.food_nutrients;

commit;
