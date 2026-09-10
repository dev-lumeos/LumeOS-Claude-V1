-- C-456: Schreibende Datenlogik gehoert in den Kettenschritt, nicht in die Strukturmigration.
BEGIN;

CREATE OR REPLACE FUNCTION supplements.start_supplement_cycle(
  p_supplement_id uuid, p_source text DEFAULT 'confirmed_by_user',
  p_suggestion_source text DEFAULT 'user_manual', p_note_de text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_user_id uuid := auth.uid(); v_cycle_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'start_supplement_cycle: Anmeldung erforderlich' USING ERRCODE = '42501'; END IF;
  IF p_supplement_id IS NULL THEN RAISE EXCEPTION 'start_supplement_cycle: Supplement ist erforderlich' USING ERRCODE = '22023'; END IF;
  IF p_source NOT IN ('coach_suggested', 'confirmed_by_user') THEN RAISE EXCEPTION 'start_supplement_cycle: ungueltige Quelle' USING ERRCODE = '22023'; END IF;
  IF p_suggestion_source NOT IN ('ai_suggested', 'marketplace_product', 'coach_recommendation', 'user_manual') THEN RAISE EXCEPTION 'start_supplement_cycle: ungueltige Vorschlagsquelle' USING ERRCODE = '22023'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || p_supplement_id::text, 456));
  INSERT INTO supplements.user_supplement_cycles (user_id, supplement_id, status, source, suggestion_source, note_de)
  VALUES (v_user_id, p_supplement_id, 'active', p_source, p_suggestion_source, NULLIF(btrim(p_note_de), '')) RETURNING id INTO v_cycle_id;
  INSERT INTO supplements.supplement_cycle_events (cycle_id, user_id, supplement_id, event_type, note_de)
  VALUES (v_cycle_id, v_user_id, p_supplement_id, 'created', NULLIF(btrim(p_note_de), ''));
  RETURN v_cycle_id;
END;
$$;

CREATE OR REPLACE FUNCTION supplements.set_supplement_cycle_status(
  p_cycle_id uuid, p_status text, p_note_de text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_user_id uuid := auth.uid(); v_cycle supplements.user_supplement_cycles%ROWTYPE; v_event_type text;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'set_supplement_cycle_status: Anmeldung erforderlich' USING ERRCODE = '42501'; END IF;
  IF p_status NOT IN ('active', 'paused', 'stopped') THEN RAISE EXCEPTION 'set_supplement_cycle_status: ungueltiger Status' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_cycle FROM supplements.user_supplement_cycles WHERE id = p_cycle_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'set_supplement_cycle_status: Zyklus nicht gefunden oder nicht berechtigt' USING ERRCODE = '42501'; END IF;
  IF v_cycle.status = p_status THEN RAISE EXCEPTION 'set_supplement_cycle_status: Status ist bereits %', p_status USING ERRCODE = '22023'; END IF;
  IF v_cycle.status = 'stopped' THEN RAISE EXCEPTION 'set_supplement_cycle_status: gestoppte Zyklen werden nicht erneut geoeffnet' USING ERRCODE = '22023'; END IF;
  v_event_type := CASE p_status WHEN 'active' THEN 'resumed' WHEN 'paused' THEN 'paused' ELSE 'stopped' END;
  UPDATE supplements.user_supplement_cycles SET status = p_status,
    paused_at = CASE WHEN p_status = 'paused' THEN now() ELSE paused_at END,
    stopped_at = CASE WHEN p_status = 'stopped' THEN now() ELSE stopped_at END,
    note_de = COALESCE(NULLIF(btrim(p_note_de), ''), note_de) WHERE id = v_cycle.id;
  INSERT INTO supplements.supplement_cycle_events (cycle_id, user_id, supplement_id, event_type, note_de)
  VALUES (v_cycle.id, v_user_id, v_cycle.supplement_id, v_event_type, NULLIF(btrim(p_note_de), ''));
  RETURN v_cycle.id;
END;
$$;

CREATE OR REPLACE FUNCTION supplements.create_supplement_protocol_from_template(
  p_template_code text, p_anchor_supplement_id uuid, p_started_at date DEFAULT current_date
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_user_id uuid := auth.uid(); v_template supplements.supplement_protocol_templates%ROWTYPE; v_protocol_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'create_supplement_protocol_from_template: Anmeldung erforderlich' USING ERRCODE = '42501'; END IF;
  IF NULLIF(btrim(p_template_code), '') IS NULL OR p_anchor_supplement_id IS NULL OR p_started_at IS NULL THEN RAISE EXCEPTION 'create_supplement_protocol_from_template: Vorlage, Anker-Supplement und Startdatum sind erforderlich' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_template FROM supplements.supplement_protocol_templates WHERE code = btrim(p_template_code) AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'create_supplement_protocol_from_template: aktive Vorlage nicht gefunden' USING ERRCODE = '22023'; END IF;
  INSERT INTO supplements.supplement_protocols (user_id, supplement_id, name_de, name_en, name_th, status, source, started_at)
  VALUES (v_user_id, p_anchor_supplement_id, v_template.name_de, v_template.name_en, v_template.name_th, 'active', 'legacy_cycleplanner_template', p_started_at) RETURNING id INTO v_protocol_id;
  INSERT INTO supplements.supplement_protocol_items (protocol_id, supplement_id, dose_amount, dose_unit, timing, with_meal, weeks_start, weeks_end, sort_order)
  SELECT v_protocol_id, i.supplement_id, i.dose_amount, i.dose_unit, i.timing, i.with_meal, i.weeks_start, i.weeks_end, i.sort_order
  FROM supplements.supplement_protocol_template_items i WHERE i.template_id = v_template.id ORDER BY i.sort_order;
  RETURN v_protocol_id;
END;
$$;

CREATE OR REPLACE FUNCTION supplements.refresh_intake_schedule(p_schedule_date date DEFAULT current_date)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'refresh_intake_schedule: Anmeldung erforderlich' USING ERRCODE = '42501'; END IF;
  IF p_schedule_date IS NULL THEN RAISE EXCEPTION 'refresh_intake_schedule: Datum ist erforderlich' USING ERRCODE = '22023'; END IF;
  DELETE FROM supplements.intake_schedule WHERE user_id = v_user_id AND schedule_date = p_schedule_date;
  INSERT INTO supplements.intake_schedule (user_id, supplement_id, stack_item_id, status, scheduled_time, frequency, dose_amount, dose_unit, schedule_date, timing, source_kind)
  SELECT us.user_id, si.supplement_id, si.id, 'unbekannt', NULL, si.frequency, si.dose, si.dose_unit, p_schedule_date, si.timing, 'stack'
  FROM supplements.user_stacks us JOIN supplements.stack_items si ON si.stack_id = us.id
  WHERE us.user_id = v_user_id AND us.is_active AND si.is_active AND si.supplement_id IS NOT NULL AND (
    si.frequency <> 'cycling' OR (EXISTS (SELECT 1 FROM supplements.user_supplement_cycles c WHERE c.user_id = v_user_id AND c.supplement_id = si.supplement_id AND c.status = 'active')
    AND ((p_schedule_date - (si.cycling ->> 'started_on')::date) % (((si.cycling ->> 'on_weeks')::integer + (si.cycling ->> 'off_weeks')::integer) * 7)) < (si.cycling ->> 'on_weeks')::integer * 7));
  INSERT INTO supplements.intake_schedule (user_id, supplement_id, protocol_item_id, status, scheduled_time, frequency, dose_amount, dose_unit, schedule_date, timing, source_kind)
  SELECT p.user_id, i.supplement_id, i.id, 'unbekannt', NULL, 'daily', i.dose_amount, i.dose_unit, p_schedule_date, i.timing, 'protocol'
  FROM supplements.supplement_protocols p JOIN supplements.supplement_protocol_items i ON i.protocol_id = p.id
  WHERE p.user_id = v_user_id AND p.status = 'active' AND (i.weeks_start IS NULL OR (p_schedule_date >= p.started_at + ((i.weeks_start - 1) * 7) AND p_schedule_date < p.started_at + (i.weeks_end * 7)));
  RETURN (SELECT count(*)::integer FROM supplements.intake_schedule WHERE user_id = v_user_id AND schedule_date = p_schedule_date);
END;
$$;

REVOKE ALL ON FUNCTION supplements.start_supplement_cycle(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.set_supplement_cycle_status(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.create_supplement_protocol_from_template(text, uuid, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.refresh_intake_schedule(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.start_supplement_cycle(uuid, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION supplements.set_supplement_cycle_status(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION supplements.create_supplement_protocol_from_template(text, uuid, date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION supplements.refresh_intake_schedule(date) TO authenticated, service_role;

COMMENT ON FUNCTION supplements.start_supplement_cycle(uuid, text, text, text) IS 'C-456: Atomarer Start mit created-Ereignis im eigenen Zyklusverlauf; RLS bleibt SECURITY INVOKER wirksam.';
COMMENT ON FUNCTION supplements.set_supplement_cycle_status(uuid, text, text) IS 'C-456: Atomarer Statuswechsel active/paused/stopped mit genau einem Verlaufseintrag; gestoppte Zyklen werden nicht reaktiviert.';
COMMENT ON FUNCTION supplements.create_supplement_protocol_from_template(text, uuid, date) IS 'C-456: Kopiert eine aktive, lesbare PCT-Vorlage atomar in ein eigenes Protokoll mit Wochenintervallen.';
COMMENT ON FUNCTION supplements.refresh_intake_schedule(date) IS 'C-456: Ersetzt nur die eigene Tagesliste aus aktivem Stack, aktivem Zyklus und aktiven Protokollen; Zeiten werden nicht geraten.';

COMMIT;
