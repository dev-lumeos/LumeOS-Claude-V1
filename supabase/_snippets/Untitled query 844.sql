select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'nutrition'
  and table_name = 'nutrient_defs'
order by ordinal_position;