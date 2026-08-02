select indexname, indexdef
from pg_indexes
where schemaname='nutrition'
  and tablename='nutrient_defs'
order by indexname;