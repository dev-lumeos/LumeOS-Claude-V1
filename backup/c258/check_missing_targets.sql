select slug, name_en, source, im_katalog, parent_id is not null as is_child
from supplements.supplements
where lower(name_en) like '%ashwagandha%'
   or lower(name_en) like '%bacopa%'
   or lower(name_en) like '%black cohosh%'
   or lower(name_en) like '%cabergoline%'
order by name_en;
