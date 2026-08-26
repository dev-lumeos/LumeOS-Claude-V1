from pathlib import Path
import subprocess
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\negativprobe-prepare.out")
DB = "lumeos_c280_neg"
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def run(args, timeout=30):
    r = subprocess.run(
        args,
        cwd=r"D:\GitHub\LumeOS-Claude-V1",
        capture_output=True,
        startupinfo=_SI,
        creationflags=_FLAGS,
        shell=False,
        timeout=timeout,
    )
    return (r.stdout + r.stderr).decode("utf-8", "replace")


def psql(sql: str, timeout=30) -> str:
    return run([
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
    ], timeout=timeout)


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

parts = []
for sql in [
    "select pg_terminate_backend(pid) from pg_stat_activity where datname='lumeos_c280_neg' and pid <> pg_backend_pid();",
    "DROP VIEW IF EXISTS supplements.community_anzeige CASCADE;",
    "CREATE VIEW supplements.community_anzeige WITH (security_barrier = true) AS SELECT "
    + ", ".join(columns)
    + " FROM generate_series(1, 212) AS gs;",
    "REVOKE ALL ON supplements.community_anzeige FROM anon, authenticated, service_role; GRANT SELECT ON supplements.community_anzeige TO authenticated; GRANT ALL ON supplements.community_anzeige TO service_role;",
    "SELECT count(*) AS rows, count(*) FILTER (WHERE column_name='reported_mitigations') AS forbidden_column FROM information_schema.columns WHERE table_schema='supplements' AND table_name='community_anzeige';",
]:
    try:
        out = psql(sql)
    except subprocess.TimeoutExpired as exc:
        out = f"TIMEOUT: {exc}"
    parts.append(sql + "\n" + out)

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
