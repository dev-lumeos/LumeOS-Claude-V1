-- =============================================================
-- 468 - C-468: eine Muskelhierarchie fuer alle Karten
-- Datum: 2026-09-11
-- Laeuft im Querschnitt, weil vier Module dieselbe Karte nutzen.
-- =============================================================
--
-- TOMS VORGABE:
--   "wenn wir gruppieren, dann muessen wir mit parent/child
--    arbeiten - denn ein bodybuilder nutzt uebungen fuer einzelne
--    muskeln sowie gebuendelt. das gilt auch fuer recovery, ueberall
--    wo wir die maps einsetzen."
--
-- DREI ENTSCHEIDUNGEN:
--   1 Schema public  ("das ist eine public komponente, wenn sie von
--                     mehreren modulen benutzt wird")
--   2 drei Ebenen    ("ok, eine dritte") - Wurzel / Flaeche / Seite
--   3 hair, head, hands, feet, ankles bleiben
--                    ("brauchen wir, dass wir einen mensch erkennen")
--                    - unterschieden durch die Spalte `art`
--
-- =============================================================
-- WARUM public.koerperflaechen NEBEN training.muscle_groups
-- =============================================================
--
-- [cmd] GEMESSEN 2026-09-11 gegen die laufende Instanz:
--
--     training.muscle_groups        95 Zeilen
--     davon mit parent_id           88
--     Tiefe                          VIER Ebenen (7 / 28 / 45 / 15)
--     Fremdschluessel darauf         training.exercise_muscles
--     Leseaufrufe in apps/web        4, in zwei Dateien
--
-- [read] DER AUFTRAG NENNT ZWEI EBENEN - es sind VIER.
--   `Arms > Forearms > Forearm Extensors > Extensor Carpi Radialis`
--   ist ein echter Pfad in der Tabelle.
--
-- [read] DESHALB WIRD SIE NICHT ERSETZT:
--   * sie traegt die Trainingssicht (welche Uebung trifft welchen
--     Muskel) - das ist nicht die Kartensicht
--   * `training.exercise_muscles` haengt per Fremdschluessel daran
--   * zwei Dateien in `apps/web/src/lib/training/` lesen sie, und
--     `apps/` gehoert in diesem Auftrag Claude Code
--
-- [read] UND SIE WIRD NICHT KOPIERT:
--   eine zweite Namensliste liefe auseinander. Stattdessen ZEIGT die
--   neue Tabelle auf sie - `muscle_group_id` ist der Anker.
--
-- [read] Zwei Zerlegungen desselben Koerpers: die Karte zeichnet,
--   was man SIEHT; `muscle_groups` fuehrt, was man TRAINIERT. Die
--   Bruecke ist eine Zuordnung, keine Verschmelzung.
--
-- =============================================================
-- WAS IN DEN 23 FLAECHEN STECKT - gemessen, nicht geraten
-- =============================================================
--
-- [cmd] Jeder Pfad einzeln eingefaerbt und angesehen
--   (docs/bilder/c468/, Verfahren aus G-425).
--
-- [read] DER MASSSTAB: ein Pfad ist eine ZEICHENEBENE, kein Muskel.
--   `triceps` hat drei Koepfe und bleibt EIN Muskel.
--
-- [cmd] DREI FLAECHEN TRAGEN VERSCHIEDENE MUSKELN:
--
--     upper-back   3 Muskelpaare (G-425):
--                    Teres major, Teres minor, Latissimus dorsi
--     lower-back   2 Muskelpaare (G-425):
--                    Erector spinae, Flanke (QL / Obliquus)
--     obliques     1 Muskel + 7 Zeichenteile je Seite: Pfad 8 und 16
--                    sind der Obliquus-Bauch, 1-7 die Verzahnung
--                    mit dem Serratus
--
-- [cmd] DIE UEBRIGEN ZWANZIG buendeln EINEN Muskel oder eine
--   anatomische Gruppe - Koepfe, Haelften oder Segmente:
--
--     quadriceps   3 Pfade je Bein = die drei sichtbaren Koepfe
--     hamstring    3 Muskelstreifen je Bein + 1 Sehnenlinie
--     calves       Gastrocnemius zweikoepfig + Soleusrand
--     forearm      Beugerbuendel vorne, Streckerbuendel hinten
--     triceps      drei Koepfe, EIN Muskel (G-425)
--     trapezius    ein Muskel, zwei Haelften (G-425)
--     gluteal      ein Muskelpaar, Spiegelhaelften (G-425)
--
-- [read] WAS DIE KARTE NICHT ZEIGT, WIRD GEMELDET, NICHT ERFUNDEN:
--   * Rhomboiden - `muskel-ebenen.ts` wirft sie auf `upper-back`,
--     aber KEINER der sechs Pfade zeichnet sie (G-425).
--   * Obliquus internus - die Karte zeichnet nur die aeussere Lage.
--   * Soleus - liegt unter dem Gastrocnemius; die vier Calf-Pfade
--     je Bein trennen ihn nicht belegbar ab.
--   Diese drei bekommen KEINE Zeile. Eine Flaeche ohne Pfad waere
--   eine Zusage, die die Karte nicht einloest.
-- =============================================================

BEGIN;

-- =============================================================
-- Die Tabelle
-- =============================================================
--
-- [read] DREI EBENEN, wie Tom entschieden hat:
--     ebene 1  wurzel   Back, Legs, Core ...
--     ebene 2  flaeche  latissimus, quadriceps ...
--     ebene 3  seite    links / rechts
--
-- [read] `parent_id` traegt alle drei - eine Wurzel hat keinen
--   Elternteil, eine Seite hat eine Flaeche als Elternteil.

CREATE TABLE IF NOT EXISTS public.koerperflaechen (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     uuid REFERENCES public.koerperflaechen(id) ON DELETE RESTRICT,

  -- [cmd] Auf Ebene 2 der Schluessel aus MUSKELN
  --   (`packages/ui/src/koerperkarte-pfade.ts`), z. B. `quadriceps`.
  -- [read] Auf Ebene 1 und 3 ein eigener, sprechender Schluessel.
  code          text NOT NULL,

  name_de       text NOT NULL,
  name_en       text,

  -- [read] Die Ebene als ZAHL, nicht als Ableitung - eine rekursive
  --   Abfrage koennte sie rechnen, aber dann liesse sich keine
  --   Ebene erzwingen.
  ebene         smallint NOT NULL,

  -- [read] TOMS DRITTE ENTSCHEIDUNG, als Merkmal. `umriss` sind
  --   hair, head, hands, feet, ankles, knees: sie stehen fuer den
  --   Menschen, nicht fuer Training.
  art           text NOT NULL,

  seite         text,

  -- [cmd] DIE BRUECKE zu `training.muscle_groups` - kein Nachbau.
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
  'C-468: die Flaechen der Koerperkarte als Hierarchie (Wurzel / Flaeche / Seite). '
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
-- Zeilensicherheit
-- =============================================================
--
-- [read] EIN KATALOG, KEINE NUTZERDATEN - jede angemeldete Person
--   liest dieselben Flaechen. Es gibt nichts zu trennen.
--
-- [cmd] `anon` bekommt NICHTS: die Karte steht hinter der Anmeldung,
--   und ein offener Katalog waere ein Weg, das Datenmodell ohne
--   Konto auszulesen.

ALTER TABLE public.koerperflaechen ENABLE ROW LEVEL SECURITY;

-- [cmd] GEMESSEN 2026-09-11, und es war eine Ueberraschung:
--   `pg_default_acl` fuer `public` vergibt bei JEDER neuen Tabelle
--   `arwdDxtm` an anon, authenticated UND service_role -
--   also auch INSERT, UPDATE, DELETE, TRUNCATE.
--
-- [read] EIN `GRANT SELECT` ALLEIN REICHT DESHALB NICHT. Nach dem
--   ersten Lauf stand `authenticated` mit UPDATE und TRUNCATE da,
--   obwohl diese Datei nur SELECT vergibt.
--
-- [read] Die Zeilensicherheit fing es ab (`UPDATE 0`, weil es keine
--   UPDATE-Policy gibt) - aber ein Recht, das nur durch eine Policy
--   ins Leere laeuft, ist ein Recht zu viel. **Erst entziehen, dann
--   vergeben.**
REVOKE ALL ON public.koerperflaechen FROM PUBLIC;
REVOKE ALL ON public.koerperflaechen FROM anon;
REVOKE ALL ON public.koerperflaechen FROM authenticated;
GRANT SELECT ON public.koerperflaechen TO authenticated;
GRANT ALL    ON public.koerperflaechen TO service_role;

DROP POLICY IF EXISTS koerperflaechen_select ON public.koerperflaechen;
CREATE POLICY koerperflaechen_select ON public.koerperflaechen
  FOR SELECT TO authenticated USING (true);

COMMIT;
