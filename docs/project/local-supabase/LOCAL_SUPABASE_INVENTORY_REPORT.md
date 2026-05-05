# Local Supabase Inventory Report

Date: 2026-05-05

## 1. Scope

This report is a read-only inventory of the existing local Supabase database for `D:\GitHub\LumeOS-Claude-V1`.

No reset, push, migration execution, import, destructive SQL, or data writes were performed. All database inspection used `SELECT`-only queries.

## 2. Supabase Status

| Item | Value |
| --- | --- |
| Local setup running | yes |
| Studio URL | `http://127.0.0.1:54323` |
| Mailpit URL | `http://127.0.0.1:54324` |
| MCP URL | `http://127.0.0.1:54321/mcp` |
| Project URL | `http://127.0.0.1:54321` |
| REST URL | `http://127.0.0.1:54321/rest/v1` |
| GraphQL URL | `http://127.0.0.1:54321/graphql/v1` |
| Database target | `postgresql://postgres:<redacted>@127.0.0.1:54322/postgres` |
| Supabase CLI | `2.75.0` |
| Update available | `2.98.1` |

Stopped services reported by `supabase status`:

| Service |
| --- |
| `supabase_imgproxy_LumeOS-Claude-V1` |
| `supabase_edge_runtime_LumeOS-Claude-V1` |
| `supabase_pooler_LumeOS-Claude-V1` |

Secrets and API keys from `supabase status` were intentionally excluded.

## 3. Schemas

| Schema |
| --- |
| `_realtime` |
| `auth` |
| `extensions` |
| `graphql` |
| `graphql_public` |
| `information_schema` |
| `net` |
| `pg_catalog` |
| `pg_temp_17` |
| `pg_temp_36` |
| `pg_temp_38` |
| `pg_temp_43` |
| `pg_temp_6` |
| `pg_toast` |
| `pg_toast_temp_17` |
| `pg_toast_temp_36` |
| `pg_toast_temp_38` |
| `pg_toast_temp_43` |
| `pg_toast_temp_6` |
| `pgbouncer` |
| `public` |
| `realtime` |
| `storage` |
| `supabase_functions` |
| `supabase_migrations` |
| `vault` |

## 4. Tables by Schema

| Schema | Table |
| --- | --- |
| `_realtime` | `extensions` |
| `_realtime` | `schema_migrations` |
| `_realtime` | `tenants` |
| `auth` | `audit_log_entries` |
| `auth` | `flow_state` |
| `auth` | `identities` |
| `auth` | `instances` |
| `auth` | `mfa_amr_claims` |
| `auth` | `mfa_challenges` |
| `auth` | `mfa_factors` |
| `auth` | `oauth_authorizations` |
| `auth` | `oauth_client_states` |
| `auth` | `oauth_clients` |
| `auth` | `oauth_consents` |
| `auth` | `one_time_tokens` |
| `auth` | `refresh_tokens` |
| `auth` | `saml_providers` |
| `auth` | `saml_relay_states` |
| `auth` | `schema_migrations` |
| `auth` | `sessions` |
| `auth` | `sso_domains` |
| `auth` | `sso_providers` |
| `auth` | `users` |
| `extensions` | `pg_stat_statements` |
| `extensions` | `pg_stat_statements_info` |
| `net` | `_http_response` |
| `net` | `http_request_queue` |
| `public` | `execution_tokens` |
| `public` | `governance_artefacts` |
| `public` | `wo_failure_events` |
| `public` | `workorders` |
| `realtime` | `messages` |
| `realtime` | `messages_2026_04_29` |
| `realtime` | `messages_2026_04_30` |
| `realtime` | `messages_2026_05_01` |
| `realtime` | `messages_2026_05_02` |
| `realtime` | `messages_2026_05_03` |
| `realtime` | `schema_migrations` |
| `realtime` | `subscription` |
| `storage` | `buckets` |
| `storage` | `buckets_analytics` |
| `storage` | `buckets_vectors` |
| `storage` | `iceberg_namespaces` |
| `storage` | `iceberg_tables` |
| `storage` | `migrations` |
| `storage` | `objects` |
| `storage` | `s3_multipart_uploads` |
| `storage` | `s3_multipart_uploads_parts` |
| `storage` | `vector_indexes` |
| `supabase_functions` | `hooks` |
| `supabase_functions` | `migrations` |
| `supabase_migrations` | `schema_migrations` |
| `vault` | `decrypted_secrets` |
| `vault` | `secrets` |

Public tables:

| Table |
| --- |
| `execution_tokens` |
| `governance_artefacts` |
| `wo_failure_events` |
| `workorders` |

## 5. Governance Tables

| Expected Table | Present | Actual Location / Note |
| --- | --- | --- |
| `workorders` | yes | `public.workorders` |
| `execution_tokens` | yes | `public.execution_tokens` |
| `governance_artifacts` | no | Local DB uses `public.governance_artefacts` |
| `governance_artefacts` | yes | `public.governance_artefacts` |
| `wo_failure_events` | yes | `public.wo_failure_events` |

## 6. Nutrition Schema State

| Check | Result |
| --- | --- |
| `nutrition` schema exists | no |
| Nutrition tables | none |
| Committed Nutrition migrations appear applied | no |

The local database does not currently contain the `nutrition` schema or Nutrition tables.

## 7. Migration History

| Version | Name |
| --- | --- |
| `20260423120000` | `control_plane_tables` |

The local migration history contains the control-plane migration only. The committed Nutrition migrations are not present in `supabase_migrations.schema_migrations`.

## 8. Row Count Estimates

`pg_stat_user_tables` estimates all listed user tables at `0` live rows at inspection time.

| Schema | Table | Estimated Rows |
| --- | --- | ---: |
| `_realtime` | `extensions` | 0 |
| `_realtime` | `schema_migrations` | 0 |
| `_realtime` | `tenants` | 0 |
| `auth` | `audit_log_entries` | 0 |
| `auth` | `flow_state` | 0 |
| `auth` | `identities` | 0 |
| `auth` | `instances` | 0 |
| `auth` | `mfa_amr_claims` | 0 |
| `auth` | `mfa_challenges` | 0 |
| `auth` | `mfa_factors` | 0 |
| `auth` | `oauth_authorizations` | 0 |
| `auth` | `oauth_client_states` | 0 |
| `auth` | `oauth_clients` | 0 |
| `auth` | `oauth_consents` | 0 |
| `auth` | `one_time_tokens` | 0 |
| `auth` | `refresh_tokens` | 0 |
| `auth` | `saml_providers` | 0 |
| `auth` | `saml_relay_states` | 0 |
| `auth` | `schema_migrations` | 0 |
| `auth` | `sessions` | 0 |
| `auth` | `sso_domains` | 0 |
| `auth` | `sso_providers` | 0 |
| `auth` | `users` | 0 |
| `net` | `_http_response` | 0 |
| `net` | `http_request_queue` | 0 |
| `public` | `execution_tokens` | 0 |
| `public` | `governance_artefacts` | 0 |
| `public` | `wo_failure_events` | 0 |
| `public` | `workorders` | 0 |
| `realtime` | `messages` | 0 |
| `realtime` | `messages_2026_04_29` | 0 |
| `realtime` | `messages_2026_04_30` | 0 |
| `realtime` | `messages_2026_05_01` | 0 |
| `realtime` | `messages_2026_05_02` | 0 |
| `realtime` | `messages_2026_05_03` | 0 |
| `realtime` | `schema_migrations` | 0 |
| `realtime` | `subscription` | 0 |
| `storage` | `buckets` | 0 |
| `storage` | `buckets_analytics` | 0 |
| `storage` | `buckets_vectors` | 0 |
| `storage` | `iceberg_namespaces` | 0 |
| `storage` | `iceberg_tables` | 0 |
| `storage` | `migrations` | 0 |
| `storage` | `objects` | 0 |
| `storage` | `s3_multipart_uploads` | 0 |
| `storage` | `s3_multipart_uploads_parts` | 0 |
| `storage` | `vector_indexes` | 0 |
| `supabase_functions` | `hooks` | 0 |
| `supabase_functions` | `migrations` | 0 |
| `supabase_migrations` | `schema_migrations` | 0 |
| `vault` | `secrets` | 0 |

## 9. Enum Types

| Schema | Enum | Value |
| --- | --- | --- |
| `public` | `wo_state` | `wo_generated` |
| `public` | `wo_state` | `graph_validated` |
| `public` | `wo_state` | `queue_released` |
| `public` | `wo_state` | `blocked` |
| `public` | `wo_state` | `ready` |
| `public` | `wo_state` | `dispatched` |
| `public` | `wo_state` | `running` |
| `public` | `wo_state` | `done` |
| `public` | `wo_state` | `failed` |
| `public` | `wo_state` | `reviewed` |
| `public` | `wo_state` | `retry_scheduled` |
| `public` | `wo_state` | `closed` |
| `public` | `wo_state` | `cancelled` |
| `public` | `wo_state` | `graph_repair_pending` |
| `public` | `wo_type` | `micro` |
| `public` | `wo_type` | `macro` |

## 10. Existing Data Risk

| Risk Question | Result |
| --- | --- |
| Local DB contains schema state | yes |
| Local DB contains migration history | yes |
| User/application row estimates are non-zero | no, estimates are currently `0` |
| `supabase db reset` would destroy local schema/migration state | yes |
| `supabase db reset` allowed | no |

Even though row estimates are currently zero, this database contains local schema state and migration history. A reset would replace the local database state and remains forbidden.

## 11. Comparison With Repo Migrations

| Repo Migration | Exists In Repo | Present In Local Migration History | Local Schema Evidence |
| --- | --- | --- | --- |
| `supabase/migrations/20240522_001_nutrition_schema_foundation.sql` | yes | no | `nutrition` schema absent |
| `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` | yes | no | Nutrition tables absent |
| `supabase/migrations/20260423120000_control_plane_tables.sql` | yes | yes | public governance tables present |

The committed Nutrition migrations appear unapplied in the local database. This report does not run or apply them.

## 12. Recommended Next Safe Step

Prepare a Tom-approved additive local migration validation plan that preserves the existing local database and explicitly forbids `supabase db reset`.
