import json
import os
import statistics
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI, _wo

ROOT = Path(r"D:\GitHub\LumeOS-Claude-V1")
OUT = ROOT / "backup" / "c192"
OUT.mkdir(parents=True, exist_ok=True)
DB = os.environ.get("C192_DB", "lumeos_c192_before2")
CONTAINER = os.environ.get("LUMEOS_DB_CONTAINER", "supabase_db_LumeOS-Claude-V1")


def run(argv, env=None, input_text=None, check=True, timeout=None):
    argv = list(argv)
    if argv and argv[0] in ("pnpm", "npx", "npm", "tsx"):
        argv[0] = _wo(argv[0])
    result = subprocess.run(
        argv,
        cwd=str(ROOT),
        env=env,
        input=input_text,
        text=True,
        capture_output=True,
        startupinfo=_SI,
        creationflags=_FLAGS,
        shell=False,
        timeout=timeout,
    )
    if check and result.returncode != 0:
        raise RuntimeError(
            f"{argv} rc={result.returncode}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        )
    return result


def psql(sql, db=DB, check=True):
    result = run(
        [
            "docker",
            "exec",
            "-i",
            CONTAINER,
            "psql",
            "-U",
            "postgres",
            "-d",
            db,
            "-v",
            "ON_ERROR_STOP=1",
            "-t",
            "-A",
            "-c",
            sql,
        ],
        check=check,
    )
    return result.stdout.strip()


def psql_json(sql):
    return json.loads(psql(sql))


def explain_time(sql):
    data = psql_json("EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + sql)
    plan = data[0]
    return {
        "execution_ms": plan.get("Execution Time"),
        "planning_ms": plan.get("Planning Time"),
        "plan": plan.get("Plan"),
    }


def series(label, sql, runs=10):
    vals = [explain_time(sql)["execution_ms"] for _ in range(runs)]
    return {
        "label": label,
        "runs_ms": vals,
        "median_ms": statistics.median(vals),
        "min_ms": min(vals),
        "max_ms": max(vals),
    }


def food_args(user_id):
    user = "NULL::uuid" if user_id is None else f"'{user_id}'::uuid"
    return (
        "('', '', ARRAY[]::text[], NULL::uuid, NULL::text, NULL::uuid, "
        f"NULL::text, 'relevance', 25, 0, NULL::text[], NULL::text[], false, NULL::jsonb, {user}, NULL::jsonb)"
    )


def build_pref_base(user_id):
    return f"""
WITH RECURSIVE normalized AS (
  SELECT NULLIF(nutrition.search_fold(''), '') AS normalized_query,
         NULLIF('', '') AS raw_query,
         ARRAY[]::text[] AS token_groups,
         COALESCE(NULLIF('', '') IS NOT NULL, false) AS has_search
),
user_preference AS (
  SELECT fp.*
  FROM nutrition.food_preferences fp
  WHERE fp.user_id = '{user_id}'::uuid
),
preference_items AS MATERIALIZED (
  SELECT fpi.*
  FROM nutrition.food_preference_items fpi
  WHERE fpi.user_id = '{user_id}'::uuid
),
category_tree AS (
  SELECT pi.id AS preference_item_id, pi.category_id AS category_id, pi.category_id AS matched_category_id
  FROM preference_items pi
  WHERE pi.target_type = 'category' AND pi.category_id IS NOT NULL
  UNION ALL
  SELECT ct.preference_item_id, ct.category_id, fc.id
  FROM category_tree ct
  JOIN nutrition.food_categories fc ON fc.parent_id = ct.matched_category_id
),
category_ancestors AS (
  SELECT pi.id AS preference_item_id, pi.category_id AS category_id, pi.category_id AS ancestor_category_id
  FROM preference_items pi
  WHERE pi.target_type = 'category' AND pi.category_id IS NOT NULL
  UNION ALL
  SELECT ca.preference_item_id, ca.category_id, fc.parent_id
  FROM category_ancestors ca
  JOIN nutrition.food_categories fc ON fc.id = ca.ancestor_category_id
  WHERE fc.parent_id IS NOT NULL
),
allergy_tag_map AS (
  SELECT *
  FROM (VALUES
    ('nuts','contains_nuts'), ('tree_nuts','contains_nuts'), ('peanuts','contains_nuts'),
    ('milk','contains_lactose'), ('lactose','contains_lactose'),
    ('gluten','contains_gluten'), ('wheat','contains_gluten')
  ) AS m(raw_value, tag_code)
),
preference_targets AS MATERIALIZED (
  SELECT pi.id AS preference_item_id, pi.preference, pi.strength, pi.target_type,
         pi.food_id, NULL::uuid AS category_id, NULL::text AS tag_code, NULL::text AS cuisine_code,
         NULL::text AS exclusion_preset_code,
         pi.food_id AS matched_food_id,
         1 AS specificity_rank,
         CASE WHEN pi.strength = 'hard' THEN 'hard' WHEN pi.strength = 'strong' THEN 'strong' ELSE 'rank' END AS constraint_level,
         pi.source
  FROM preference_items pi
  WHERE pi.target_type = 'food' AND pi.food_id IS NOT NULL
  UNION ALL
  SELECT pi.id, pi.preference, pi.strength, pi.target_type,
         NULL::uuid, pi.category_id, NULL::text, NULL::text, NULL::text,
         f.id, 2,
         CASE WHEN pi.strength = 'hard' THEN 'hard' WHEN pi.strength = 'strong' THEN 'strong' ELSE 'rank' END,
         pi.source
  FROM preference_items pi
  JOIN category_tree ct ON ct.preference_item_id = pi.id
  JOIN nutrition.foods f ON f.category_id = ct.matched_category_id
  WHERE pi.target_type = 'category' AND pi.category_id IS NOT NULL
  UNION ALL
  SELECT pi.id, pi.preference, pi.strength, pi.target_type,
         NULL::uuid, pi.category_id, NULL::text, NULL::text, NULL::text,
         f.id, 4,
         CASE WHEN pi.strength = 'hard' THEN 'hard' WHEN pi.strength = 'strong' THEN 'strong' ELSE 'rank' END,
         pi.source
  FROM preference_items pi
  JOIN category_ancestors ca ON ca.preference_item_id = pi.id
  JOIN nutrition.foods f ON f.category_id = ca.ancestor_category_id
  WHERE pi.target_type = 'category' AND pi.category_id IS NOT NULL
  UNION ALL
  SELECT pi.id, pi.preference, pi.strength, pi.target_type,
         NULL::uuid, NULL::uuid, pi.tag_code, NULL::text, NULL::text,
         ft.food_id, 3,
         CASE WHEN pi.strength = 'hard' THEN 'hard' WHEN pi.strength = 'strong' THEN 'strong' ELSE 'rank' END,
         pi.source
  FROM preference_items pi
  JOIN nutrition.food_tags ft ON ft.tag_code = pi.tag_code
  WHERE pi.target_type = 'tag' AND pi.tag_code IS NOT NULL
  UNION ALL
  SELECT pi.id, pi.preference, pi.strength, pi.target_type,
         NULL::uuid, NULL::uuid, NULL::text, NULL::text, pi.exclusion_preset_code,
         epm.food_id, 3,
         CASE WHEN pi.strength = 'hard' THEN 'hard' WHEN pi.strength = 'strong' THEN 'strong' ELSE 'rank' END,
         pi.source
  FROM preference_items pi
  JOIN nutrition.exclusion_preset_matches epm ON epm.preset_code = pi.exclusion_preset_code
  WHERE pi.target_type = 'exclusion_preset' AND pi.exclusion_preset_code IS NOT NULL
  UNION ALL
  SELECT gen_random_uuid(), 'disliked'::text, 'hard'::text, 'allergy'::text,
         NULL::uuid, NULL::uuid, atm.tag_code, NULL::text, NULL::text,
         ft.food_id, 3, 'hard'::text, 'profile_allergy'::text
  FROM user_preference up
  JOIN LATERAL unnest(COALESCE(up.allergies, ARRAY[]::text[])) allergy(value) ON TRUE
  JOIN allergy_tag_map atm ON atm.raw_value = allergy.value
  JOIN nutrition.food_tags ft ON ft.tag_code = atm.tag_code
  UNION ALL
  SELECT gen_random_uuid(), 'disliked'::text, 'strong'::text, 'intolerance'::text,
         NULL::uuid, NULL::uuid, atm.tag_code, NULL::text, NULL::text,
         ft.food_id, 3, 'strong'::text, 'profile_intolerance'::text
  FROM user_preference up
  JOIN LATERAL unnest(COALESCE(up.intolerances, ARRAY[]::text[])) intolerance(value) ON TRUE
  JOIN allergy_tag_map atm ON atm.raw_value = intolerance.value
  JOIN nutrition.food_tags ft ON ft.tag_code = atm.tag_code
  UNION ALL
  SELECT gen_random_uuid(), 'disliked'::text, 'hard'::text, 'diet_type'::text,
         NULL::uuid, NULL::uuid, 'contains_meat'::text, NULL::text, NULL::text,
         ft.food_id, 3, 'hard'::text, 'profile_diet_type'::text
  FROM user_preference up
  JOIN nutrition.food_tags ft ON ft.tag_code = 'contains_meat'
  WHERE up.diet_type IN ('vegan', 'vegetarian')
  UNION ALL
  SELECT gen_random_uuid(), 'disliked'::text, 'hard'::text, 'diet_type'::text,
         NULL::uuid, NULL::uuid, 'contains_dairy'::text, NULL::text, NULL::text,
         ft.food_id, 3, 'hard'::text, 'profile_diet_type'::text
  FROM user_preference up
  JOIN nutrition.food_tags ft ON ft.tag_code = 'contains_dairy'
  WHERE up.diet_type = 'vegan'
  UNION ALL
  SELECT gen_random_uuid(), 'disliked'::text, 'hard'::text, 'diet_type'::text,
         NULL::uuid, NULL::uuid, 'contains_fish'::text, NULL::text, NULL::text,
         ft.food_id, 3, 'hard'::text, 'profile_diet_type'::text
  FROM user_preference up
  JOIN nutrition.food_tags ft ON ft.tag_code = 'contains_fish'
  WHERE up.diet_type IN ('vegan', 'vegetarian')
)
"""


def main():
    stamp = time.strftime("%Y%m%d%H%M%S")
    backup = ROOT / "backup" / "schema" / f"{stamp}_c192_vor_schema.sql"
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_text(
        run(["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres", "--schema-only"], timeout=120).stdout,
        encoding="utf-8",
    )

    if os.environ.get("C192_SKIP_BUILD") != "1":
        kette = run(
            ["pnpm", "exec", "tsx", "supabase/_pipeline/kette-ausfuehren.ts", "--database", DB, "--keep-database"],
            check=False,
            timeout=900,
        )
        (OUT / "kette-before.log").write_text(
            f"RC={kette.returncode}\nSTDOUT:\n{kette.stdout}\nSTDERR:\n{kette.stderr}",
            encoding="utf-8",
        )
        if kette.returncode != 0:
            print(json.dumps({"ok": False, "stage": "kette", "rc": kette.returncode}))
            return kette.returncode

        seed_env = os.environ.copy()
        seed_env["PGDATABASE"] = DB
        seed = run(
            ["pnpm", "exec", "tsx", "supabase/_pipeline/_testdaten/testdaten-einspielen.ts"],
            env=seed_env,
            check=False,
            timeout=600,
        )
        (OUT / "testdaten-before.log").write_text(
            f"RC={seed.returncode}\nSTDOUT:\n{seed.stdout}\nSTDERR:\n{seed.stderr}",
            encoding="utf-8",
        )
        if seed.returncode != 0:
            print(json.dumps({"ok": False, "stage": "testdaten", "rc": seed.returncode}))
            return seed.returncode

    uids = psql_json(
        """
SELECT jsonb_object_agg(email, id::text)
FROM auth.users
WHERE email IN ('tom.seed@example.com','test-user@lumeos.local','max.seed@example.com','sarah.seed@example.com');
"""
    )
    tom = uids["tom.seed@example.com"]
    test = uids.get("test-user@lumeos.local") or uids.get("max.seed@example.com") or uids.get("sarah.seed@example.com")

    state = psql_json(
        f"""
SELECT jsonb_build_object(
  'tom_user_id', '{tom}',
  'test_user_id', '{test}',
  'tom_food_preferences', (SELECT to_jsonb(fp) FROM nutrition.food_preferences fp WHERE fp.user_id='{tom}'::uuid),
  'tom_preference_item_count', (SELECT count(*) FROM nutrition.food_preference_items WHERE user_id='{tom}'::uuid),
  'test_preference_item_count', (SELECT count(*) FROM nutrition.food_preference_items WHERE user_id='{test}'::uuid),
  'tom_preference_items', (SELECT jsonb_agg(to_jsonb(fpi) ORDER BY preference, strength, target_type, coalesce(food_id::text, category_id::text, tag_code, cuisine_code, exclusion_preset_code)) FROM nutrition.food_preference_items fpi WHERE fpi.user_id='{tom}'::uuid),
  'food_tags_indexes', (SELECT jsonb_agg(indexdef ORDER BY indexname) FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_tags'),
  'preset_match_indexes', (SELECT jsonb_agg(indexdef ORDER BY indexname) FROM pg_indexes WHERE schemaname='nutrition' AND tablename='exclusion_preset_matches'),
  'preference_item_indexes', (SELECT jsonb_agg(indexdef ORDER BY indexname) FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items')
);
"""
    )

    food_search = [
        series("food_search_no_user", f"SELECT nutrition.food_search{food_args(None)};"),
        series("food_search_tom_seed_preferences", f"SELECT nutrition.food_search{food_args(tom)};"),
        series("food_search_test_user_no_preferences", f"SELECT nutrition.food_search{food_args(test)};"),
    ]

    pref_base = build_pref_base(tom)
    probes = {
        "user_preference": pref_base + "SELECT count(*) FROM user_preference;",
        "preference_items": pref_base + "SELECT count(*) FROM preference_items;",
        "category_tree": pref_base + "SELECT count(*) FROM category_tree;",
        "category_ancestors": pref_base + "SELECT count(*) FROM category_ancestors;",
        "preference_targets": pref_base + "SELECT count(*) FROM preference_targets;",
        "preference_scores": pref_base
        + """
, preference_scores AS MATERIALIZED (
  SELECT pt.matched_food_id AS food_id,
         bool_or(constraint_level = 'hard')
           OR (bool_or(constraint_level = 'strong')
               AND COALESCE((SELECT normalized_query FROM normalized), '') = '') AS preference_excluded,
         sum(CASE
           WHEN constraint_level IN ('hard', 'strong') THEN 0
           WHEN preference = 'liked' OR strength = 'boost' THEN CASE specificity_rank WHEN 1 THEN 100 WHEN 2 THEN 50 WHEN 3 THEN 30 ELSE 20 END
           WHEN preference = 'disliked' OR strength = 'soft' THEN -CASE specificity_rank WHEN 1 THEN 100 WHEN 2 THEN 50 WHEN 3 THEN 30 ELSE 20 END
           ELSE 0
         END) AS preference_score,
         jsonb_agg(DISTINCT jsonb_build_object(
           'preference', preference, 'strength', strength, 'target_type', target_type,
           'source', source, 'constraint_level', constraint_level
         )) AS preference_matches
  FROM preference_targets pt
  GROUP BY pt.matched_food_id
)
SELECT count(*), count(*) FILTER (WHERE preference_excluded), sum(preference_score) FROM preference_scores;
""",
    }
    preference_ctes = []
    for label, sql in probes.items():
        item = series(label, sql)
        item["result"] = psql(sql)
        preference_ctes.append(item)

    out = {
        "database": DB,
        "backup": str(backup),
        "kette_rc": 0 if os.environ.get("C192_SKIP_BUILD") == "1" else kette.returncode,
        "state": state,
        "food_search": food_search,
        "preference_ctes": preference_ctes,
    }
    (OUT / "messung-before.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "database": DB, "backup": str(backup), "food_search": food_search, "preference_ctes": preference_ctes}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
