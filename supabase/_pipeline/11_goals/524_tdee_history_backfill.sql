-- G-524: rueckwirkende Reihe nur dort, wo ein vollstaendiges Fenster
-- tatsaechlich berechenbar ist. Unvollstaendige Nutzer werden nicht geraten.

DO $$
DECLARE
  v_candidate record;
  v_status text;
BEGIN
  FOR v_candidate IN
    SELECT DISTINCT ds.user_id, ds.entry_date AS stichtag
    FROM nutrition.daily_summary ds
    WHERE ds.entry_date <= CURRENT_DATE
    ORDER BY ds.user_id, ds.entry_date
  LOOP
    SELECT a.status
    INTO v_status
    FROM goals.adaptive_tdee(v_candidate.user_id, v_candidate.stichtag, 14) a;

    IF v_status = 'complete' THEN
      PERFORM goals.record_adaptive_tdee(
        v_candidate.user_id,
        v_candidate.stichtag,
        14
      );
    END IF;
  END LOOP;
END $$;
