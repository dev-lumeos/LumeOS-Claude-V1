import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import psql


OUT = Path("backup/c250/food-code-check.log")

SQL = """
WITH expected(bls_code, erwartung) AS (
  VALUES
    ('C133000', 'Haferflocken'),
    ('F503100', 'Banane'),
    ('E111100', 'Ei'),
    ('V416100', 'Haehnchenbrust'),
    ('C351000', 'Vollkornreis'),
    ('Q120000', 'Olivenoel')
)
SELECT e.bls_code || '|' || e.erwartung || '|' ||
       COALESCE(NULLIF(f.name_display_de, ''), f.name_de, 'MISSING')
FROM expected e
LEFT JOIN nutrition.foods f USING (bls_code)
ORDER BY e.bls_code;
"""

out = psql(SQL)
OUT.write_text(out + "\n", encoding="utf-8", newline="\n")
print(out)
