
\pset tuples_only on
\pset format aligned
select 'rows' as metric, count(*)::text from supplements.substance_catalog
union all select 'columns', count(*)::text from information_schema.columns where table_schema='supplements' and table_name='substance_catalog'
union all select 'canonical_category', count(*)::text from supplements.substance_catalog where canonical_category is not null
union all select 'canonical_compound_type', count(*)::text from supplements.substance_catalog where canonical_compound_type is not null
union all select 'canonical_routes', count(*)::text from supplements.substance_catalog where canonical_routes is not null
union all select 'non_kimi_taxonomy', count(*)::text from supplements.substance_catalog where source_primary not in ('kimi_supplement','kimi_performance','kimi_peptide') and (canonical_category is not null or canonical_compound_type is not null or canonical_routes is not null);
select 'CATEGORY' as kind, coalesce(canonical_category,'<leer>') as value, count(*) from supplements.substance_catalog group by canonical_category order by count(*) desc, value;
select 'TYPE' as kind, coalesce(canonical_compound_type,'<leer>') as value, count(*) from supplements.substance_catalog group by canonical_compound_type order by count(*) desc, value;
select 'ROUTE' as kind, route, count(*) from supplements.substance_catalog, unnest(canonical_routes) route group by route order by count(*) desc, route;
