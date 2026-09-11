-- =============================================================
-- C-471 - public.koerperflaechen: die Struktur
-- Datum: 2026-09-11
-- Grundlage: C-468 (Messung), C-470 (pg_default_acl)
-- =============================================================
--
-- D-17, Weg B (supabase/README.md, seit 2026-08-05):
--   migrations/  Deploybare Struktur. Schemas, Tabellen,
--                Constraints, Indizes, Funktionen, Trigger,
--                Policies, Grants. KEINE Daten.
--   _pipeline/   Lokale Aufbaukette. Katalog-Seeds, Ableitungen.
--
-- [read] DIESE DATEI LEGT NUR AN. Die 59 Zeilen stehen in
--   `_pipeline/00_querschnitt/468b_koerperflaechen_seed.sql` -
--   kein INSERT, kein COPY hier.
--
-- =============================================================
-- WARUM DIE TABELLE NEBEN training.muscle_groups STEHT
-- =============================================================
--
-- [cmd] GEMESSEN in C-468, 2026-09-11:
--
--     training.muscle_groups        95 Zeilen, VIER Ebenen
--     Fremdschluessel darauf        training.exercise_muscles
--     Leseaufrufe in apps/web       4, in zwei Dateien
--
-- [read] Zwei Zerlegungen desselben Koerpers: die Karte zeichnet,
--   was man SIEHT (23 Flaechen); `muscle_groups` fuehrt, was man
--   TRAINIERT (95 Muskeln). Die Bruecke ist eine Zuordnung, keine
--   Verschmelzung - `muscle_group_id` zeigt hin, ersetzt nicht.
-- =============================================================

BEGIN;

-- =============================================================
-- Die Tabelle: drei Ebenen, Wurzel / Flaeche / Seite
-- =============================================================

CREATE TABLE IF NOT EXISTS public.koerperflaechen (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     uuid REFERENCES public.koerperflaechen(id) ON DELETE RESTRICT,

  -- [cmd] Auf Ebene 2 der Schluessel aus MUSKELN
  --   (`packages/ui/src/koerperkarte-pfade.ts`), z. B. `quadriceps`.
  code          text NOT NULL,

  name_de       text NOT NULL,
  name_en       text,

  -- [read] Die Ebene als ZAHL, nicht als Ableitung - eine rekursive
  --   Abfrage koennte sie rechnen, aber dann liesse sich keine
  --   Ebene erzwingen.
  ebene         smallint NOT NULL,

  -- [read] Toms dritte Entscheidung: hair, head, hands, feet,
  --   ankles und knees bleiben ("brauchen wir, dass wir einen
  --   mensch erkennen") - als `umriss`, nicht als Muskel.
  art           text NOT NULL,

  seite         text,

  -- [cmd] DIE BRUECKE zu training.muscle_groups - kein Nachbau.
  -- [read] Nullable: Umrisse haben keinen Muskel, und nicht jede
  --   Kartenflaeche hat ein Gegenstueck in der Trainingssicht.
  muscle_group_id uuid REFERENCES training.muscle_groups(id) ON DELETE SET NULL,

  -- [read] WAS DIE KARTE NICHT ZEICHNET, steht als Satz da - nicht
  --   als fehlende Zeile, die niemand erklaeren kann.
  hinweis       text,

  sortierung    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT koerperflaechen_code_uq UNIQUE (code),
  CONSTRAINT koerperflaechen_ebene_ck CHECK (ebene IN (1, 2, 3)),
  CONSTRAINT koerperflaechen_art_ck   CHECK (art IN ('muskel', 'umriss')),
  CONSTRAINT koerperflaechen_seite_ck CHECK (
    (ebene = 3 AND seite IN ('links', 'rechts'))
    OR (ebene <> 3 AND seite IS NULL)
  ),
  -- [read] Ebene 1 hat keinen Elternteil, 2 und 3 haben einen -
  --   sonst koennte eine Wurzel unter einer Seite haengen.
  CONSTRAINT koerperflaechen_wurzel_ck CHECK (
    (ebene = 1 AND parent_id IS NULL) OR (ebene > 1 AND parent_id IS NOT NULL)
  ),
  -- [read] Ein Umriss hat keinen Muskel - sonst stuende `hands`
  --   irgendwann in einer Trainingsauswertung.
  CONSTRAINT koerperflaechen_umriss_ck CHECK (
    art = 'muskel' OR muscle_group_id IS NULL
  )
);

COMMENT ON TABLE public.koerperflaechen IS
  'C-468/C-471: die Flaechen der Koerperkarte als Hierarchie (Wurzel / Flaeche / Seite). '
  'Liegt in public, weil Recovery, Supplements, Medical und Coach dieselbe Karte nutzen. '
  'Zeigt per muscle_group_id auf training.muscle_groups, ersetzt sie NICHT.';
COMMENT ON COLUMN public.koerperflaechen.code IS
  'Auf Ebene 2 der Schluessel aus koerperkarte-pfade.ts (MUSKELN).';
COMMENT ON COLUMN public.koerperflaechen.art IS
  'muskel = trainierbar; umriss = zeichnet den Menschen (hair, head, hands, feet, ankles, knees).';
COMMENT ON COLUMN public.koerperflaechen.muscle_group_id IS
  'Bruecke zu training.muscle_groups. NULL bei Umrissen und wo die Hierarchie den Muskel nicht fuehrt.';
COMMENT ON COLUMN public.koerperflaechen.hinweis IS
  'Warum eine Flaeche mehrere Muskeln buendelt oder einen nicht zeigt - gemessen, nicht behauptet.';

CREATE INDEX IF NOT EXISTS koerperflaechen_parent_idx ON public.koerperflaechen(parent_id);
CREATE INDEX IF NOT EXISTS koerperflaechen_ebene_idx  ON public.koerperflaechen(ebene, sortierung);
CREATE INDEX IF NOT EXISTS koerperflaechen_muskel_idx ON public.koerperflaechen(muscle_group_id);

CREATE OR REPLACE FUNCTION public.koerperflaechen_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS koerperflaechen_touch_updated_at ON public.koerperflaechen;
CREATE TRIGGER koerperflaechen_touch_updated_at
  BEFORE UPDATE ON public.koerperflaechen
  FOR EACH ROW EXECUTE FUNCTION public.koerperflaechen_touch();

-- =============================================================
-- Zeilensicherheit und Rechte
-- =============================================================
--
-- [read] EIN KATALOG, KEINE NUTZERDATEN - jede angemeldete Person
--   liest dieselben Flaechen. Es gibt nichts zu trennen.
--
-- ══ C-470: DAS REVOKE MUSS MIT ══════════════════════════════
--
-- [cmd] GEMESSEN in C-468: `pg_default_acl` vergibt im Schema
--   `public` bei JEDER neuen Tabelle `arwdDxtm` an `anon`,
--   `authenticated` UND `service_role` - also auch INSERT, UPDATE,
--   DELETE, TRUNCATE.
--
-- [read] EIN `GRANT SELECT` ALLEIN REICHT NICHT. Nach dem ersten
--   Lauf stand `authenticated` mit UPDATE und TRUNCATE da, obwohl
--   die Datei nur SELECT vergab.
--
-- [read] Die Zeilensicherheit fing es ab (`UPDATE 0`, weil es keine
--   UPDATE-Policy gibt) - aber ein Recht, das nur durch eine
--   FEHLENDE Policy ins Leere laeuft, ist ein Recht zu viel: die
--   naechste Policy macht es scharf.
--
-- [cmd] Deshalb: erst ENTZIEHEN, dann vergeben - nach dem CREATE.

ALTER TABLE public.koerperflaechen ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.koerperflaechen FROM PUBLIC;
REVOKE ALL ON public.koerperflaechen FROM anon;
REVOKE ALL ON public.koerperflaechen FROM authenticated;
GRANT SELECT ON public.koerperflaechen TO authenticated;
GRANT ALL    ON public.koerperflaechen TO service_role;

DROP POLICY IF EXISTS koerperflaechen_select ON public.koerperflaechen;
CREATE POLICY koerperflaechen_select ON public.koerperflaechen
  FOR SELECT TO authenticated USING (true);

COMMIT;
