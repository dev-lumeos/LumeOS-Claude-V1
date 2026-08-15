# Suchprotokoll C-18

Stand: 2026-08-15.

`[cmd]` Umgesetzt wurden Tabelle, Kettenschritt, Migration,
Schema-Sollstand, Web-Schreibpfad und Bericht. Es gab keinen Commit und
keinen Push.

Dateien:

- `supabase/_pipeline/05_user_tabellen/057_search_events.sql`
- `supabase/migrations/20260815180000_search_events.sql`
- `supabase/_pipeline/daten/schema-sollstand.json`
- `supabase/README.md`
- `apps/web/src/middleware.ts`
- `apps/web/src/lib/nutrition/food-search.ts`
- `apps/web/src/app/nutrition/foods/page.tsx`
- `apps/web/src/app/api/nutrition/foods/route.ts`
- `docs/ssot/59-suchprotokoll.md`

---

## Entscheidung: wo geschrieben wird

`[read]` C-18 verlangt, dass `nutrition.food_search` nicht langsamer wird.
Die Funktion ist heiß; C-17 vermerkte rund 533 ms für `huehnerbrust`.

`[cmd]` Die Schreibentscheidung: `nutrition.food_search` bleibt unverändert.
`apps/web` schreibt nach einem erfolgreichen Such-RPC eine separate Zeile in
`nutrition.search_events`.

`[annahme]` Das ist die robustere Grenze: Ein Logging-Fehler blockiert die
Suche nicht, und die Lesefunktion bekommt keinen Insert-Nebeneffekt. Der Preis
ist ein zweiter sehr kleiner DB-Aufruf im Anwendungspfad.

`[cmd]` Die Auswahl wird über den bestehenden `food`-Parameter erfasst. Wenn
die ausgewählte Food-ID auf der sichtbaren Trefferseite steht, wird
`selected_rank = offset + index + 1` gespeichert; sonst bleiben
`selected_rank` und Auswahlposition leer.

---

## Schema

`[cmd]` `057_search_events.sql` erzeugt:

- `nutrition.search_events`
- Index `idx_search_events_session_time`
- Index `idx_search_events_query`
- Index `idx_search_events_selected_rank`
- Funktion `nutrition.search_events_report()`
- RLS und Grants

`[cmd]` Gespeicherte Felder:

| Feld | Inhalt |
|---|---|
| `session_id` | nicht personenbezogene Suchsitzung |
| `query` | Anfrage wie getippt |
| `normalized_query` | gefaltete Anfrage |
| `searched_at` | Zeitpunkt |
| `result_count` | Trefferzahl |
| `selected_food_id` | ausgewählter Eintrag, leer wenn nichts gewählt |
| `selected_bls_code` | BLS-Code des gewählten Eintrags |
| `selected_rank` | Position der Auswahl, wenn sichtbar bestimmbar |

`[cmd]` Rechte:

| Rolle | Rechte |
|---|---|
| `authenticated` | `INSERT` |
| `service_role` | `ALL` |

`[cmd]` `authenticated` hat kein `SELECT`, kein `UPDATE`, kein `DELETE` auf
`nutrition.search_events`.

`[cmd]` RLS ist aktiv. Es gibt genau eine Policy:
`search_events_insert FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)`.

`[annahme]` Die Policy-Bedingungsart ist im Sollstand als `eigene_zeilen`
eingetragen, obwohl die Tabelle keine `user_id` führt. Das passt nicht so
sauber wie `052_diary_foundation.sql`: Es gibt keine Nutzerzeile, die man mit
`auth.uid() = user_id` begrenzen könnte. Der konkrete Schutz ist hier:
authentifizierte Nutzer dürfen schreiben, aber nicht lesen. Die Auswertung
läuft über `service_role`.

---

## Kette und Sollstand

`[cmd]` `supabase/README.md` enthält den neuen Schritt:
`057_search_events.sql` erzeugt `search_events` und
`search_events_report()`.

`[cmd]` `schema-sollstand.json` enthält:

- Tabelle `search_events`, Schritt `057`
- RLS `true`
- Policy `INSERT`
- GRANTs `authenticated: INSERT`, `service_role: ALL`
- Fremdschlüssel `search_events_selected_food_id_fkey`
- Funktion `search_events_report`

`[cmd]` Abschlussprüfung nach Anwendung des Schritts:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts
```

`[cmd]` Ergebnis:

| Prüfung | Ergebnis |
|---|---:|
| Tabellen | 18/18 |
| Sichten | 2/2 |
| Funktionen | 11/11 |
| Zeilenschutz | 18/18 |
| Policies | 18/18 |
| GRANTs | 20/20 |
| Policy-Bedingungen | 18/18 |
| Fremdschlüssel | 15/15 |
| Exit | 0 |

---

## Performance

`[cmd]` Vorher-Messung, direkt gegen `nutrition.food_search`:

```powershell
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY ON)
SELECT nutrition.food_search(
  'huehnerbrust','huehnerbrust',ARRAY['huehnerbrust']::text[],
  NULL,NULL,NULL,NULL,'relevance',25,0,NULL,NULL,false,
  '[["huehner","huhn","haehnchen"],["brust"]]'::jsonb
);
```

`[cmd]` Vorher: 812,810 ms · 772,295 ms · 717,827 ms · 743,228 ms ·
741,540 ms. Median: 743,228 ms.

`[cmd]` Nachher: 713,759 ms · 719,002 ms · 732,009 ms · 730,717 ms ·
708,968 ms. Median: 719,002 ms.

`[annahme]` Die leichte Verbesserung ist Messrauschen bzw. Cache-Lage. Wichtig
ist: Die Suchfunktion wurde nicht erweitert und wurde messbar nicht langsamer.

---

## Testlauf

`[cmd]` Schritt `057` wurde auf die laufende lokale DB angewendet:

```powershell
Get-Content supabase/_pipeline/05_user_tabellen/057_search_events.sql |
  docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -v ON_ERROR_STOP=1
```

`[cmd]` Ergebnis: `COMMIT`.

`[cmd]` Danach wurden zehn Testanfragen in `nutrition.search_events`
geschrieben, eine davon mit Auswahl:

| Anfrage | Treffer | Auswahl |
|---|---:|---|
| `kornflakes` | 0 | — |
| `cornflakes` | 13 | — |
| `yoghurt` | 0 | — |
| `joghurt` | 99 | — |
| `basmatireis` | 0 | — |
| `reis` | 145 | — |
| `huhn` | 31 | — |
| `haehnchen` | 105 | — |
| `lachs` | 132 | `T410072`, Platz 7 |
| `brokkoli` | 0 | — |

`[cmd]` `nutrition.search_events_report()` liefert alle vier Auswertungen:

| Auswertung | Ergebnis im Testlauf |
|---|---|
| Anfragen ohne Treffer | `basmatireis`, `brokkoli`, `kornflakes`, `yoghurt` |
| Treffer ohne Auswahl | `cornflakes`, `haehnchen`, `huhn`, `joghurt`, `reis` |
| Auswahl nicht Platz 1 | `lachs`, Durchschnittsplatz 7,00 |
| zwei Suchen innerhalb von 60 Sekunden | 9 Paare in `c18-test-session-20260815` |

---

## Überlebt der Inhalt einen Neuaufbau?

`[cmd]` Die Struktur überlebt den Kettenaufbau, weil Schritt `057` in der
Kettentabelle und im Schema-Sollstand steht.

`[annahme]` Der Inhalt überlebt nur idempotente Wiederläufe von `057`. Ein
destruktiver Neuaufbau von leer, der `nutrition` droppt oder die Datenbank neu
aufsetzt, löscht `nutrition.search_events`. Dann bleibt die Struktur, aber die
gesammelte Historie ist weg. Wenn die lokale Kette regelmäßig destruktiv neu
gefahren wird, sammelt diese lokale Tabelle keine langfristig belastbare
Nutzungshistorie.

---

## Was dieses Protokoll nicht sagt

`[annahme]` Das Protokoll misst erst ab Einführung. Alte Suchprobleme werden
nicht rückwirkend sichtbar.

`[annahme]` Solange nur Tom und zwei Testkonten suchen, misst das Protokoll
Tom und diese Testkonten. Es ist dann ein Entwicklungsinstrument, keine
Produktstatistik.

`[annahme]` Das Protokoll entscheidet keine Alias- oder Synonympflege
automatisch. Es liefert Arbeitslisten; die Abnahme bleibt menschlich.

`[annahme]` Die Tabelle speichert keine Nutzerkennung. Dadurch sieht man
Sitzungsverläufe, aber keine kontoübergreifenden Muster pro Person. Das ist
Absicht.

`[annahme]` `selected_rank` ist nur gesetzt, wenn die Auswahl auf der
angezeigten Trefferseite bestimmbar ist. Wird ein Food direkt per URL gewählt
und steht nicht in `payload.foods`, bleibt die Position leer.
