import sys

sys.path.insert(0, "tools")
from lauf import psql

print(
    psql(
        """
        select conname || ': ' || pg_get_constraintdef(oid)
        from pg_constraint
        where conrelid = 'medical.biomarker_reference_ranges'::regclass
          and contype = 'c'
        order by conname
        """
    )
)
