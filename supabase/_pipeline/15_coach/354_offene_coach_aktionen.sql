-- =============================================================
-- 354 - offene Coach-Aktionen fuer den Klienten (E-29)
-- =============================================================
-- Eine Lesenaht je Zweck, nicht je Modul. Der Aufrufer kann keine
-- client_id uebergeben: ausschliesslich auth.uid() bestimmt die Zeilen.

CREATE OR REPLACE FUNCTION coach.offene_aktionen(p_modul text)
RETURNS TABLE (
  id uuid,
  module text,
  action_type text,
  preview jsonb,
  payload jsonb,
  status text,
  expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = coach, pg_temp
AS $function$
  SELECT
    pa.id,
    pa.module,
    pa.action_type,
    pa.preview,
    pa.payload,
    pa.status,
    pa.expires_at,
    pa.created_at
  FROM coach.pending_actions pa
  WHERE pa.client_id = auth.uid()
    AND pa.module = p_modul
    AND pa.status = 'pending'
  ORDER BY pa.created_at DESC, pa.id DESC;
$function$;

REVOKE ALL ON FUNCTION coach.offene_aktionen(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.offene_aktionen(text) TO authenticated, service_role;

COMMENT ON FUNCTION coach.offene_aktionen(text) IS
  'C-354/E-29: offene pending_actions aus Sicht des angemeldeten Klienten, '
  'gefiltert nach Modul. Kein client_id-Parameter und kein Schreibweg.';
