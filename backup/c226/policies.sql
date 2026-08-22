
\pset tuples_only on
\pset format aligned
select schemaname, count(*) from pg_policies
where schemaname in ('public','nutrition','training','recovery','supplements','medical','goals','coach')
group by schemaname
order by schemaname;
select 'total', count(*) from pg_policies
where schemaname in ('public','nutrition','training','recovery','supplements','medical','goals','coach');
