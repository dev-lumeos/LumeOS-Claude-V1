\set ON_ERROR_STOP on
BEGIN;

SELECT id::text AS test_uid
FROM auth.users
WHERE email = 'test-user@lumeos.local' \gset

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', :'test_uid', 'role', 'authenticated')::text,
  true
) \gset
SELECT set_config('request.jwt.claim.sub', :'test_uid', true) \gset

SELECT count(*) AS rls_visible
FROM medical.user_medications;

ROLLBACK;
