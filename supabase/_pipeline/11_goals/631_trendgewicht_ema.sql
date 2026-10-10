-- G-631: Trendgewicht aus echten Gewichtsmessungen, mit gekennzeichnetem
-- Rückfall auf die letzte Messung bei zu dünner oder veralteter Datenlage.
BEGIN;

CREATE FUNCTION goals.trendgewicht_am(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  wert numeric,
  quelle text,
  letzte_messung_am date,
  anzahl_messungen integer
)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_point record;
  v_ema numeric;
  v_factor numeric;
  v_previous_date date;
  v_latest_date date;
  v_latest_weight numeric;
  v_count_14 integer := 0;
BEGIN
  -- Die explizite Eigentumsprüfung gilt auch bei zusätzlichen SELECT-Policies
  -- für Coaches; die Tabellenabfrage bleibt außerdem RLS-geschützt.
  IF p_stichtag IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN;
  END IF;

  -- Je Kalendertag zählt die letzte echte Gewichtsmessung. Der äußere
  -- Sortierschritt liefert die Tage chronologisch für die rekursive EMA.
  FOR v_point IN
    SELECT daily.measurement_date,daily.weight_kg
    FROM (
      SELECT DISTINCT ON (m.measurement_date)
        m.measurement_date,m.weight_kg
      FROM goals.body_measurements m
      WHERE m.user_id = p_user_id
        AND m.measurement_date <= least(p_stichtag,CURRENT_DATE)
      ORDER BY m.measurement_date,m.measurement_time DESC,
        m.created_at DESC,m.id DESC
    ) daily
    ORDER BY daily.measurement_date
  LOOP
    IF v_previous_date IS NULL THEN
      v_ema := v_point.weight_kg;
    ELSE
      v_factor := power(0.75::numeric,
        (v_point.measurement_date - v_previous_date)::numeric);
      v_ema := v_ema * v_factor + v_point.weight_kg * (1 - v_factor);
    END IF;
    IF v_point.measurement_date >= p_stichtag - 13 THEN
      v_count_14 := v_count_14 + 1;
    END IF;
    v_previous_date := v_point.measurement_date;
    v_latest_date := v_point.measurement_date;
    v_latest_weight := v_point.weight_kg;
  END LOOP;

  IF v_latest_date IS NULL THEN RETURN; END IF;

  anzahl_messungen := v_count_14;
  letzte_messung_am := v_latest_date;
  IF v_count_14 >= 4 AND p_stichtag - v_latest_date <= 7 THEN
    wert := round(v_ema,3);
    quelle := 'trend_ema';
  ELSE
    wert := v_latest_weight;
    quelle := 'letzte_messung';
  END IF;
  RETURN NEXT;
END $$;

COMMENT ON FUNCTION goals.trendgewicht_am(uuid,date) IS
  'G-631: EMA mit alpha 0,25 und kalenderbasiertem Abstand; anzahl_messungen zählt Messtage im 14-Tage-Fenster. Ohne vier aktuelle Messtage oder nach mehr als sieben Tagen ohne Messung gilt die letzte Rohmessung.';
REVOKE ALL ON FUNCTION goals.trendgewicht_am(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.trendgewicht_am(uuid,date) TO authenticated;

COMMIT;
