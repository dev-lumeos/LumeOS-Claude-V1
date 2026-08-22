
\pset tuples_only on
\pset format aligned
select 'nutrition.meal_items' as metric, count(*)::text from nutrition.meal_items
union all select 'nutrition.meals', count(*)::text from nutrition.meals
union all select 'supplements.substance_aliases', count(*)::text from supplements.substance_aliases
union all select 'nutrition.water_logs', count(*)::text from nutrition.water_logs
union all select 'supplements.intake_logs', count(*)::text from supplements.intake_logs
union all select 'supplements.substance_catalog_sources', count(*)::text from supplements.substance_catalog_sources
union all select 'supplements.substance_catalog', count(*)::text from supplements.substance_catalog
union all select 'medical.medication_active_substances', count(*)::text from medical.medication_active_substances
union all select 'medical.medication_formulations', count(*)::text from medical.medication_formulations
union all select 'medical.medication_products', count(*)::text from medical.medication_products
union all select 'goals.body_measurements', count(*)::text from goals.body_measurements
union all select 'recovery.checkins', count(*)::text from recovery.checkins
union all select 'recovery.scores', count(*)::text from recovery.scores
union all select 'medical.lab_result_values', count(*)::text from medical.lab_result_values
union all select 'supplements.substance_lab_effects', count(*)::text from supplements.substance_lab_effects
union all select 'training.workout_sets', count(*)::text from training.workout_sets
union all select 'recovery.modality_log', count(*)::text from recovery.modality_log
union all select 'nutrition.nutrient_defs', count(*)::text from nutrition.nutrient_defs
union all select 'nutrition.foods', count(*)::text from nutrition.foods
union all select 'medical.biomarker_reference_ranges', count(*)::text from medical.biomarker_reference_ranges
union all select 'substance_catalog.columns', count(*)::text from information_schema.columns where table_schema='supplements' and table_name='substance_catalog'
union all select 'substance_catalog.safety', count(*)::text from supplements.substance_catalog where safety is not null
union all select 'substance_catalog.regulatory', count(*)::text from supplements.substance_catalog where regulatory is not null
union all select 'substance_catalog.warning_triggers', count(*)::text from supplements.substance_catalog where warning_triggers is not null
union all select 'substance_catalog.canonical_category', count(*)::text from supplements.substance_catalog where canonical_category is not null
union all select 'recovery.scores.acwr_used.column', count(*)::text from information_schema.columns where table_schema='recovery' and table_name='scores' and column_name='acwr_used'
union all select 'nutrition.food_preference_search_targets.exists', count(*)::text from information_schema.tables where table_schema='nutrition' and table_name='food_preference_search_targets'
union all select 'recovery.acwr_for_day.function', count(*)::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='recovery' and p.proname='acwr_for_day'
union all select 'recovery.training_load_score.function', count(*)::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='recovery' and p.proname='training_load_score';
