select table_name, column_name
from information_schema.columns
where table_schema='supplements'
  and table_name in ('supplement_evidence','supplement_dosing','supplement_safety','supplement_monitoring','supplement_regulatory','supplement_wada')
order by table_name, ordinal_position;
