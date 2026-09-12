-- =============================================================
-- C-479 — Strukturvertrag der aufgeteilten Rueckenflaechen
-- =============================================================
-- Die Zeilen gehoeren bewusst in den Kettenschritt
-- 00_querschnitt/479_koerperflaechen_aufteilung.sql. Diese Migration
-- liefert nur den deploybaren Struktur- und Rechtevertrag.

BEGIN;

-- Pro sichtbarer Flaeche gibt es hoechstens eine linke und eine rechte
-- Ebene-3-Zeile. Die bestehende Hierarchie erfuellt den Vertrag bereits.
CREATE UNIQUE INDEX IF NOT EXISTS koerperflaechen_eltern_seite_uq
  ON public.koerperflaechen(parent_id, seite)
  WHERE ebene = 3;

-- C-471 bleibt die zweite Schutzschicht: Default-ACLs helfen nur bei
-- kuenftigen Objekten; diese bestehende Tabelle braucht explizite Rechte.
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
