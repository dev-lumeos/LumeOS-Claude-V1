select schemaname, viewname
from pg_views
where viewname like '%supplement%forms%'
order by schemaname, viewname;
