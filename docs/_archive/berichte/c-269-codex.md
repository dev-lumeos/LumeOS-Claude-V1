# C-269/C-268 Codex-Bericht

## Ausgangsmessung

Statuswerte in `coach.relationships` live vor der Aenderung:

| Status | Zeilen |
|---|---:|
| `active` | 4 |
| `invited` | 2 |

Der Check erlaubte nur:

```text
invited, active, ended
```

Fremdschluessel auf `coach.relationships`:

| Tabelle | Constraint | Regel |
|---|---|---|
| `coach.relationship_change_log` | `relationship_change_log_relationship_id_fkey` | `ON DELETE SET NULL` |

Trotz `ON DELETE SET NULL` scheitert ein DELETE, weil der AFTER-DELETE-Trigger danach eine neue Logzeile mit der geloeschten `relationship_id` schreibt. Die Negativprobe hat genau das reproduziert:

```text
ERROR: insert or update on table "relationship_change_log" violates foreign key constraint "relationship_change_log_relationship_id_fkey"
```

## Entscheidung

Ich habe Statuswechsel statt Loeschen gebaut.

Begruendung:

- Ein Aenderungsprotokoll, das beim Loeschen verschwindet, ist kein Protokoll.
- Eine zurueckgenommene Einladung ist ein Vorgang, nicht nichts.
- Die bestehende Datei `151_coach_relationships.sql` sagte bereits: Beziehungen verschwinden nicht, sie enden.

Neu in `coach.relationships`:

| Spalte | Zweck |
|---|---|
| `withdrawn_at` | Zeitpunkt der Ruecknahme |
| `withdrawn_by` | Nutzer, der zurueckgenommen hat |
| `withdraw_reason` | optionaler Grund |

Der Status-Check erlaubt jetzt:

```text
invited, active, ended, withdrawn
```

Neue RPC:

| Funktion | Zweck |
|---|---|
| `coach.withdraw_relationship_invite(uuid, text)` | eigene offene Einladung auf `withdrawn` setzen |
| `coach.resolve_invite_user_id(text)` | E-Mail fuer Invite-Pfad auf `user_id` aufloesen |

## Ruecknahme-Nachweis

Transaktionaler RLS-Nachweis mit `test-user@lumeos.local`, danach Rollback:

| Schritt | Ergebnis |
|---|---|
| Einladung angelegt | `rls_before_withdraw`: `invited = 1` |
| RPC aufgerufen | `withdraw_result = true` |
| Danach in RLS-Sicht | `rls_after_withdraw`: `withdrawn = 1` |
| Log sichtbar | `insert = 2`, `update = 1` |

Die Ruecknahme laeuft ohne Trigger-Abschaltung.

Die Live-Daten wurden durch den Nachweis nicht dauerhaft veraendert.

## Namensaufloesung

Gemessen:

- `coach.coach_profiles`: existiert nicht.
- `public.profiles`: 15 Spalten, kein Namensfeld.
- `auth.users`: 7 Nutzer, 7 E-Mails.
- `raw_user_meta_data`: keine echten Namen; nur technische Keys bei 2 Nutzern (`email`, `email_verified`, `phone_verified`, `sub`).

Damit gibt es keine belastbare Namensquelle. Ich habe keine Namen erfunden.

Die schmale Loesung ist E-Mail zu UUID:

| Probe | Ergebnis |
|---|---|
| `coach@lumeos.app` | Treffer |
| `unknown-c269@example.invalid` | kein Treffer |
| Rueckgabetyp | `uuid` |

Die Funktion gibt keine E-Mail, keine Metadaten und keinen Namen zurueck. Ein direkter Client-Lesezugriff auf `auth.users` bleibt gesperrt; der erste RLS-Test bekam erwartungsgemaess `permission denied for table users`, als er unter `authenticated` direkt aus `auth.users` lesen wollte.

## Pipeline und Live

Neuer Kettenschritt:

```text
155 — supabase/_pipeline/15_coach/155_coach_invites.sql
```

`152_coach_lesepfad.sql` haengt jetzt an `155`.

Wegwerf-Kettenlauf:

```text
Kette: supabase/_pipeline/kette.json (100 Schritte)
KETTE OK: 232.4s
Wegwerf-Datenbank geloescht: lumeos_kette_20260825043045
```

Live-Sicherung vor Einspielen:

```text
backup/c269/20260825_113453_before_live.dump
```

Live-Einspielung:

```text
OK: Coach-Einladungen mit withdrawn-Status und E-Mail-Aufloesung
```

## Abschlusspruefungen

Schemapruefung:

```text
SCHEMA VOLLSTAENDIG
Fremdschl. 58/58 vorhanden
Fremde Fkt. 34/34 vorhanden
```

Testdaten:

```text
OK: C-82 Testdaten stimmen.
```

Gate:

```text
pnpm gate
Tasks: 11 successful, 11 total
```

## Nachweisdateien

- `scratchpad/c269_messen.out.txt`
- `scratchpad/c269_kette.out.txt`
- `scratchpad/c269_backup.out.txt`
- `scratchpad/c269_live_apply.out.txt`
- `scratchpad/c269_nachweis.out.txt`
- `scratchpad/c269_nachweis_rls_sequenziell.out.txt`
- `scratchpad/c269_schema.out.txt`
- `scratchpad/c269_testdaten.out.txt`
- `scratchpad/c269_gate.out.txt`
- `backup/c269/20260825_113453_before_live.dump`

Nicht committet, nicht gestaged, nicht gepusht.
