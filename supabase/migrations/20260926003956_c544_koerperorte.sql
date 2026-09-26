-- =============================================================
-- C-544 - Der Ort am Koerper als eigener, grafikneutraler Begriff
-- Datum: 2026-09-26
-- =============================================================
--
-- D-17, Weg B:
--   migrations/  Struktur, Constraints, Indizes, RLS und Rechte
--   _pipeline/   Katalogdaten und Zuordnungen
--
-- Ein Koerperort ist nicht dasselbe wie eine Flaeche der
-- Koerpergrafik. Er kann Muskel, Fettdepot oder Landmarke sein.
-- Mehrere Muskeln koennen denselben Ort bilden; Fettdepots duerfen
-- dagegen keine Muskelzuordnung tragen.

BEGIN;

CREATE TABLE public.koerperorte (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL,
  name_de     text NOT NULL,
  name_en     text NOT NULL,
  name_th     text,
  art         text NOT NULL,
  beschreibung text,
  quelle_url  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT koerperorte_code_uq UNIQUE (code),
  CONSTRAINT koerperorte_id_art_uq UNIQUE (id, art),
  CONSTRAINT koerperorte_code_ck CHECK (code = lower(code) AND code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT koerperorte_name_de_ck CHECK (btrim(name_de) <> ''),
  CONSTRAINT koerperorte_name_en_ck CHECK (btrim(name_en) <> ''),
  CONSTRAINT koerperorte_art_ck CHECK (art IN ('muskel', 'fettdepot', 'landmarke')),
  CONSTRAINT koerperorte_quelle_ck CHECK (quelle_url ~ '^https://')
);

COMMENT ON TABLE public.koerperorte IS
  'C-544: kanonische anatomische Orte, unabhaengig von einer Koerpergrafik. Ein Ort ist Muskel, Fettdepot oder Landmarke.';
COMMENT ON COLUMN public.koerperorte.art IS
  'muskel, fettdepot oder landmarke; die Zielstruktur, nicht die Orientierungshilfe zum Auffinden.';
COMMENT ON COLUMN public.koerperorte.quelle_url IS
  'Medizinischer Beleg fuer Gewebeart oder anatomische Einordnung.';

CREATE TABLE public.koerperort_muskeln (
  koerperort_id  uuid NOT NULL,
  koerperort_art text NOT NULL DEFAULT 'muskel',
  muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT koerperort_muskeln_pk PRIMARY KEY (koerperort_id, muscle_group_id),
  CONSTRAINT koerperort_muskeln_art_ck CHECK (koerperort_art = 'muskel'),
  CONSTRAINT koerperort_muskeln_ort_fk
    FOREIGN KEY (koerperort_id, koerperort_art)
    REFERENCES public.koerperorte(id, art)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.koerperort_muskeln IS
  'C-544: mehrwertige Zuordnung eines Muskel-Orts zu kanonischen training.muscle_groups. Die zusammengesetzte FK verhindert Muskeln an Fettdepots und Landmarken.';

CREATE INDEX koerperort_muskeln_muscle_idx
  ON public.koerperort_muskeln(muscle_group_id);

ALTER TABLE medical.injection_sites
  ADD COLUMN koerperort_id uuid;

ALTER TABLE medical.injection_sites
  ADD CONSTRAINT injection_sites_koerperort_fk
  FOREIGN KEY (koerperort_id)
  REFERENCES public.koerperorte(id)
  ON DELETE RESTRICT;

CREATE INDEX injection_sites_koerperort_idx
  ON medical.injection_sites(koerperort_id);

COMMENT ON COLUMN medical.injection_sites.koerperort_id IS
  'C-544: kanonischer Zielort. Koordinate und body_area_code bleiben reine Darstellungs-/Bestandsfelder.';

CREATE OR REPLACE FUNCTION public.koerperorte_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.koerperorte_touch() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.koerperorte_touch() FROM anon;
REVOKE ALL ON FUNCTION public.koerperorte_touch() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.koerperorte_touch() TO service_role;

CREATE TRIGGER koerperorte_touch_updated_at
  BEFORE UPDATE ON public.koerperorte
  FOR EACH ROW EXECUTE FUNCTION public.koerperorte_touch();

-- Gemeinsamer, unveraenderlicher Katalog: angemeldete Nutzer duerfen
-- lesen; nur die Service-Rolle darf den Katalog pflegen. `anon`
-- erhaelt weder Tabellenrechte noch eine Policy.
ALTER TABLE public.koerperorte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koerperort_muskeln ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.koerperorte FROM PUBLIC;
REVOKE ALL ON public.koerperorte FROM anon;
REVOKE ALL ON public.koerperorte FROM authenticated;
REVOKE ALL ON public.koerperorte FROM service_role;
GRANT SELECT ON public.koerperorte TO authenticated;
GRANT ALL ON public.koerperorte TO service_role;

REVOKE ALL ON public.koerperort_muskeln FROM PUBLIC;
REVOKE ALL ON public.koerperort_muskeln FROM anon;
REVOKE ALL ON public.koerperort_muskeln FROM authenticated;
REVOKE ALL ON public.koerperort_muskeln FROM service_role;
GRANT SELECT ON public.koerperort_muskeln TO authenticated;
GRANT ALL ON public.koerperort_muskeln TO service_role;

CREATE POLICY koerperorte_select
  ON public.koerperorte
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY koerperort_muskeln_select
  ON public.koerperort_muskeln
  FOR SELECT TO authenticated
  USING (true);

COMMIT;
