
\pset tuples_only on
\pset format aligned
select 'rows', count(*) from supplements.substance_catalog;
select 'columns', count(*) from information_schema.columns where table_schema='supplements' and table_name='substance_catalog';
select 'group', coalesce(gruppe,'<leer>'), count(*) from supplements.substance_catalog group by gruppe order by 3 desc, 2;
select 'null_group', count(*) from supplements.substance_catalog where gruppe is null;
select 'description', count(*) from supplements.substance_catalog where description is not null;
select 'monitoring', count(*) from supplements.substance_catalog where monitoring is not null;
select 'category', gruppe, kategorie, count(*) from supplements.substance_catalog group by gruppe,kategorie order by gruppe, count(*) desc, kategorie;
