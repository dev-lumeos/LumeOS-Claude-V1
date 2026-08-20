-- F-07: Das Coach-Portal bekommt einen anmeldbaren Coach und Arbeitsdaten.
--
-- Aufruf:
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres \
--     < supabase/_pipeline/_testdaten/coach-portal-fuellen.sql
--
-- REIHENFOLGE: nach eigenes-konto-fuellen.sql. Dessen Aufraeumteil
-- loescht alle coach.*-Zeilen des Dev-Kontos — auch die von hier.
-- Beide Skripte sind wiederholbar; wer eigenes-konto-fuellen erneut
-- laufen laesst, laesst danach dieses hier erneut laufen.
--
-- WAS ES ANLEGT:
-- 1. coach@lumeos.app als ECHTES Anmeldekonto (Passwort LumeosCoach2026)
--    — die Seed-Konten haben bewusst kein Passwort, aber das Portal
--    braucht einen Coach, der sich anmelden kann (Nachweis F-07).
--    Idempotent: existiert das Konto, wird es nicht angefasst.
-- 2. Drei Athleten in drei Zustaenden:
--      dev@lumeos.app            aktiv, differenzierte Rechte (C-147-Staffel)
--      max.seed@example.com      aktiv, nur Training/Recovery als summary
--      sarah.seed@example.com    eingeladen, keine Rechte
--    test-user@lumeos.local bleibt ohne jede Beziehung (Zeilenschutz-Konto).
-- 3. Portal-Arbeitsdaten: Check-in-Vorlage und drei Check-ins
--    (reviewed/submitted/pending), Nachrichten, Alerts, eine offene
--    Pending Action.
\set ON_ERROR_STOP on

\set coach_email '''coach@lumeos.app'''
\set ziel_email '''dev@lumeos.app'''
\set max_email '''max.seed@example.com'''
\set sarah_email '''sarah.seed@example.com'''

BEGIN;

-- 1. Coach-Konto anlegen, falls es fehlt. Die Token-Spalten muessen ''
-- sein, nicht NULL — GoTrue liest sie als String.
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  '70000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'coach@lumeos.app',
  extensions.crypt('LumeosCoach2026', extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'full_name', 'Anna Keller', 'seed', 'f07_coach_login'),
  '{}'::jsonb,
  now(), now(),
  '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'coach@lumeos.app');

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  u.id::text,
  now(), now(), now()
FROM auth.users u
WHERE u.email = 'coach@lumeos.app'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = u.id AND i.provider = 'email'
  );

INSERT INTO public.profiles (id)
SELECT id FROM auth.users WHERE email = 'coach@lumeos.app'
ON CONFLICT (id) DO NOTHING;

SELECT id AS coach_id FROM auth.users WHERE email = :coach_email \gset
SELECT id AS ziel_id FROM auth.users WHERE email = :ziel_email \gset
SELECT id AS max_id FROM auth.users WHERE email = :max_email \gset
SELECT id AS sarah_id FROM auth.users WHERE email = :sarah_email \gset

\set coach :coach_id
\set ziel :ziel_id
\set maxu :max_id
\set sarah :sarah_id

-- 2. Wiederholbar: alles raeumen, was dieser Coach angelegt hat.
DELETE FROM coach.alerts WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.messages WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.checkins WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.checkin_templates WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.action_log WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.pending_actions WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.permission_change_log WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.autonomy_change_log WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.relationship_change_log WHERE coach_id = :'coach'::uuid;
ALTER TABLE coach.client_permissions DISABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy DISABLE TRIGGER client_autonomy_change_log;
ALTER TABLE coach.relationships DISABLE TRIGGER relationships_change_log;
DELETE FROM coach.client_permissions WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.client_autonomy WHERE coach_id = :'coach'::uuid;
DELETE FROM coach.relationships WHERE coach_id = :'coach'::uuid;
ALTER TABLE coach.client_permissions ENABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy ENABLE TRIGGER client_autonomy_change_log;
ALTER TABLE coach.relationships ENABLE TRIGGER relationships_change_log;

-- 3. Beziehungen: aktiv / aktiv / eingeladen.
INSERT INTO coach.relationships (coach_id, client_id, status, invited_by, invite_note, started_at, changed_by)
VALUES
(:'coach'::uuid, :'ziel'::uuid, 'active', :'coach'::uuid,
 'F-07: aktive Beziehung seit 120 Tagen', now() - interval '120 days', :'coach'::uuid),
(:'coach'::uuid, :'maxu'::uuid, 'active', :'coach'::uuid,
 'F-07: aktive Beziehung seit 45 Tagen', now() - interval '45 days', :'coach'::uuid),
(:'coach'::uuid, :'sarah'::uuid, 'invited', :'coach'::uuid,
 'F-07: Einladung offen, keine Rechte', NULL, :'coach'::uuid);

-- 4. Rechte: Dev nach der C-147-Staffel (erst Ausgangszustand, dann
-- Update — die Trigger erzeugen so eine echte Historie), Max minimal.
INSERT INTO coach.client_permissions (
  coach_id, client_id,
  nutrition_visibility, training_visibility, recovery_visibility, goals_visibility,
  supplements_visibility, medical_visibility, buddy_visibility,
  client_note, changed_by
)
VALUES (
  :'coach'::uuid, :'ziel'::uuid,
  'summary', 'summary', 'none', 'summary', 'none', 'none', 'none',
  'F-07: Ausgangszustand vor differenzierten Coach-Rechten', :'ziel'::uuid
);

UPDATE coach.client_permissions
SET nutrition_visibility = 'full',
    training_visibility = 'full',
    recovery_visibility = 'summary',
    goals_visibility = 'full',
    supplements_visibility = 'summary',
    medical_visibility = 'none',
    buddy_visibility = 'summary',
    training_auto_apply = true,
    client_note = 'F-07: Training offen, Medical gesperrt, Nutrition mit Bestaetigung',
    changed_by = :'ziel'::uuid
WHERE coach_id = :'coach'::uuid AND client_id = :'ziel'::uuid;

INSERT INTO coach.client_permissions (
  coach_id, client_id,
  nutrition_visibility, training_visibility, recovery_visibility, goals_visibility,
  supplements_visibility, medical_visibility, buddy_visibility,
  client_note, changed_by
)
VALUES (
  :'coach'::uuid, :'maxu'::uuid,
  'none', 'summary', 'summary', 'none', 'none', 'none', 'none',
  'F-07: Max gibt nur Training und Recovery als Zusammenfassung frei', :'maxu'::uuid
);

INSERT INTO coach.client_autonomy (
  coach_id, client_id,
  nutrition_level, training_level, recovery_level, goals_level,
  supplements_level, medical_level, buddy_level, safety_level,
  coach_note, changed_by
)
VALUES
(:'coach'::uuid, :'ziel'::uuid, 2, 2, 2, 2, 2, 2, 2, 1,
 'F-07: Ausgangszustand fuer Autonomy-Historie', :'coach'::uuid),
(:'coach'::uuid, :'maxu'::uuid, 2, 2, 2, 2, 2, 2, 2, 1,
 'F-07: Ausgangszustand fuer den zweiten Athleten', :'coach'::uuid);

UPDATE coach.client_autonomy
SET nutrition_level = 3, training_level = 4, recovery_level = 2,
    goals_level = 3, supplements_level = 2, medical_level = 1,
    buddy_level = 3, safety_level = 2,
    coach_note = 'F-07: differenzierte Reifegrade je Modul',
    changed_by = :'coach'::uuid
WHERE coach_id = :'coach'::uuid AND client_id = :'ziel'::uuid;

-- 5. Pending Action: der Bestaetigungsweg, sichtbar auf beiden Seiten.
INSERT INTO coach.pending_actions (
  coach_id, client_id, module, action_type, preview, payload,
  status, expires_at, created_by
)
VALUES (
  :'coach'::uuid, :'ziel'::uuid, 'nutrition', 'adjust_macro_targets',
  '{"title":"Protein leicht anheben","summary":"Coach schlaegt +10 g Protein am Trainingstag vor"}'::jsonb,
  '{"protein_g_delta":10,"reason":"F-07 Pending Action mit Nutzerbestaetigung"}'::jsonb,
  'pending', now() + interval '10 minutes', :'coach'::uuid
);

-- 6. Check-in-Vorlage und drei Instanzen (reviewed/submitted/pending).
INSERT INTO coach.checkin_templates (id, coach_id, client_id, name, cadence, fields, changed_by)
VALUES (
  '70000000-0000-0000-0000-000000000110'::uuid,
  :'coach'::uuid, :'ziel'::uuid,
  'Woechentlicher Standard', 'weekly',
  '[
    {"key":"gewicht_kg","label":"Gewicht (kg)","typ":"zahl"},
    {"key":"energie","label":"Energie (1-10)","typ":"zahl"},
    {"key":"schlaf","label":"Schlaf (1-10)","typ":"zahl"},
    {"key":"training_verlauf","label":"Wie lief das Training?","typ":"text"},
    {"key":"fragen","label":"Offene Fragen","typ":"text"}
  ]'::jsonb,
  :'coach'::uuid
);

INSERT INTO coach.checkins (
  coach_id, client_id, template_id, due_date, status,
  auto_data, client_data, client_note, coach_feedback, coach_notes,
  submitted_at, reviewed_at, changed_by
)
VALUES
(
  :'coach'::uuid, :'ziel'::uuid, '70000000-0000-0000-0000-000000000110'::uuid,
  current_date - 8, 'reviewed',
  '{"training":{"freigegeben":true,"einheiten_30d":9},"nutrition":{"freigegeben":true,"kcal_schnitt":2431}}'::jsonb,
  '{"gewicht_kg":85.4,"energie":7,"schlaf":7,"training_verlauf":"Bank fuehlte sich schwer an, Rest gut.","fragen":"Refeed am Samstag ok?"}'::jsonb,
  'Woche war stressig im Job.',
  'Gute Woche. Refeed Samstag passt — Protein halten. Bank beobachten wir.',
  'Bank-Topset stagniert zweite Woche, beim naechsten Block adressieren.',
  now() - interval '8 days', now() - interval '7 days', :'coach'::uuid
),
(
  :'coach'::uuid, :'ziel'::uuid, '70000000-0000-0000-0000-000000000110'::uuid,
  current_date - 1, 'submitted',
  '{"training":{"freigegeben":true,"einheiten_30d":10},"nutrition":{"freigegeben":true,"kcal_schnitt":2405}}'::jsonb,
  '{"gewicht_kg":84.9,"energie":6,"schlaf":6,"training_verlauf":"Deadlift-PR, sonst solide.","fragen":"Schlaf ist schlechter geworden, Ideen?"}'::jsonb,
  NULL, NULL, NULL,
  now() - interval '1 day', NULL, :'ziel'::uuid
),
(
  :'coach'::uuid, :'ziel'::uuid, '70000000-0000-0000-0000-000000000110'::uuid,
  current_date + 6, 'pending',
  '{}'::jsonb, '{}'::jsonb,
  NULL, NULL, NULL,
  NULL, NULL, :'coach'::uuid
);

-- 7. Nachrichten und Alerts.
INSERT INTO coach.messages (coach_id, client_id, sender_id, body, sent_at, read_at)
VALUES
(:'coach'::uuid, :'ziel'::uuid, :'coach'::uuid,
 'Check-in ist reviewt — Feedback steht drin. Meld dich bei Fragen.',
 now() - interval '7 days', now() - interval '7 days' + interval '3 hours'),
(:'coach'::uuid, :'ziel'::uuid, :'ziel'::uuid,
 'Danke! Refeed hat gut getan. Neuer Check-in ist eingereicht.',
 now() - interval '1 day', NULL),
(:'coach'::uuid, :'maxu'::uuid, :'coach'::uuid,
 'Willkommen an Bord — sobald du magst, schalte weitere Module frei.',
 now() - interval '44 days', NULL);

INSERT INTO coach.alerts (coach_id, client_id, module, title, detail, metric, status, created_by)
VALUES
(:'coach'::uuid, :'ziel'::uuid, 'general',
 'Check-in eingereicht, Review offen',
 'Der Check-in vom Vortag wartet auf eine Antwort.',
 jsonb_build_object('eingereicht_vor_tagen', 1), 'open', :'coach'::uuid),
(:'coach'::uuid, :'ziel'::uuid, 'nutrition',
 'Kalorienschnitt 7 Tage unter Ziel',
 'Schnitt 2.405 kcal gegen Ziel 2.500 kcal ueber die letzten 7 Tage.',
 '{"kcal_schnitt_7d":2405,"kcal_ziel":2500}'::jsonb, 'open', :'coach'::uuid),
(:'coach'::uuid, :'maxu'::uuid, 'recovery',
 'Recovery-Schnitt gegenueber Vorwoche gefallen',
 '7-Tage-Schnitt 62 gegen 70 in der Vorwoche.',
 '{"score_schnitt_7d":62,"score_vorwoche":70}'::jsonb, 'read', :'coach'::uuid);

COMMIT;

-- Kontrollzaehlung.
SELECT 'relationships' AS tabelle, count(*)::text AS zeilen FROM coach.relationships WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'client_permissions', count(*)::text FROM coach.client_permissions WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'client_autonomy', count(*)::text FROM coach.client_autonomy WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'pending_actions', count(*)::text FROM coach.pending_actions WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'checkin_templates', count(*)::text FROM coach.checkin_templates WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'checkins', count(*)::text FROM coach.checkins WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'messages', count(*)::text FROM coach.messages WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'alerts', count(*)::text FROM coach.alerts WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'permission_change_log', count(*)::text FROM coach.permission_change_log WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app')
UNION ALL SELECT 'relationship_change_log', count(*)::text FROM coach.relationship_change_log WHERE coach_id = (SELECT id FROM auth.users WHERE email = 'coach@lumeos.app');
