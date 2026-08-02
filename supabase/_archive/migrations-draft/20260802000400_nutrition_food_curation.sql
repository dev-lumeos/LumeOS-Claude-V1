-- STATUS: DRAFT — NICHT ANWENDEN (Job D-12, Rückbau 2026-08-02)
-- Die beiden Curation-Tabellen, die bislang in KEINER Migrationsdatei
-- stehen (verwaiste Tabellen 3+4 von 4). Quelle: pg_dump 2026-08-01
-- (backup/rescue/2026-08-01_verwaiste_tabellen.sql), Struktur am 2026-08-02
-- gegenverifiziert. Historische DDL-Quelle laut docs/ssot/30-datenbank.md:
-- docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql.
-- Kein RLS, keine Policies — wie im Container (offene Frage O-3).

-- UP

CREATE TABLE nutrition.food_curation_candidates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    food_id uuid REFERENCES nutrition.foods(id) ON DELETE CASCADE,
    target_type text NOT NULL,
    target_field text NOT NULL,
    proposed_value text DEFAULT ''::text NOT NULL,
    proposed_value_id uuid,
    source text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer text DEFAULT 'local_curation_foundation'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT food_curation_candidates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text]))),
    CONSTRAINT food_curation_candidates_target_type_check CHECK ((target_type = ANY (ARRAY['category_assignment'::text, 'display_name'::text, 'alias'::text, 'preference_item_mapping'::text])))
);

CREATE INDEX food_curation_candidates_food_idx ON nutrition.food_curation_candidates USING btree (food_id);
CREATE INDEX food_curation_candidates_status_idx ON nutrition.food_curation_candidates USING btree (status);

CREATE TABLE nutrition.food_curation_decisions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id uuid NOT NULL REFERENCES nutrition.food_curation_candidates(id) ON DELETE CASCADE,
    decision text NOT NULL,
    reviewer text NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT food_curation_decisions_decision_check CHECK ((decision = ANY (ARRAY['accepted'::text, 'rejected'::text, 'superseded'::text])))
);

CREATE INDEX food_curation_decisions_candidate_idx ON nutrition.food_curation_decisions USING btree (candidate_id);

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS nutrition.food_curation_decisions;
-- DROP TABLE IF EXISTS nutrition.food_curation_candidates;
