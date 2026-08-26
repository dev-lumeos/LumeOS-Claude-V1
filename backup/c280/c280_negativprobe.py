from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\negativprobe-schema.out")
DB = "lumeos_c280_neg"
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def psql(sql: str) -> str:
    return lauf([
        "docker",
        "exec",
        CONTAINER,
        "psql",
        "-U",
        "postgres",
        "-d",
        DB,
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql,
    ])


termination = lauf([
    "docker",
    "exec",
    CONTAINER,
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-c",
    "select pg_terminate_backend(pid) from pg_stat_activity where datname='lumeos_c280_neg' and pid <> pg_backend_pid();",
])

drop = psql("DROP VIEW IF EXISTS supplements.community_anzeige CASCADE;")

columns = [
    "'community_side_effect_patterns'::text AS dataset",
    "gs::text AS record_key",
    "'broken'::text AS anzeige_typ",
    "'E'::text AS evidence_class",
    "ARRAY[]::text[] AS substance_ids",
    "NULL::text AS substance_class",
    "NULL::text AS product_class",
    "NULL::text AS side_effect",
    "NULL::text AS community_attribution_note",
    "NULL::text AS prevalence",
    "NULL::text AS onset_context",
    "NULL::text AS attribution_confidence",
    "NULL::text AS community_consistency",
    "NULL::text AS scientific_alignment",
    "NULL::text AS limitations",
    "NULL::text AS community_evidence_grade",
    "NULL::text AS name",
    "NULL::text AS expected_tradeoff",
    "NULL::text AS quality_signal",
    "NULL::text AS quality_claim",
    "NULL::text AS independent_testing",
    "NULL::text AS quality_sources",
    "NULL::text AS term",
    "NULL::text AS community_definition",
    "NULL::text AS community_claim",
    "NULL::text AS community_resolution",
    "NULL::text AS concept",
    "NULL::text AS physiological_implications",
    "NULL::text AS reported_mitigations",
]

create = psql(
    "CREATE VIEW supplements.community_anzeige WITH (security_barrier = true) AS "
    + "SELECT "
    + ", ".join(columns)
    + " FROM generate_series(1, 212) AS gs;"
)
grants = psql(
    "REVOKE ALL ON supplements.community_anzeige FROM anon, authenticated, service_role; "
    "GRANT SELECT ON supplements.community_anzeige TO authenticated; "
    "GRANT ALL ON supplements.community_anzeige TO service_role;"
)

validation = lauf([
    "powershell",
    "-NoProfile",
    "-Command",
    "$env:PGDATABASE='lumeos_c280_neg'; pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts",
])

OUT.write_text(
    "\n\n".join(
        [
            "TERMINATION",
            termination,
            "DROP",
            drop,
            "CREATE BROKEN VIEW",
            create,
            "GRANTS",
            grants,
            "VALIDATION",
            validation,
        ]
    )
    + "\n",
    encoding="utf-8",
    newline="\n",
)

print(OUT)
