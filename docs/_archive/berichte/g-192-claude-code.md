# G-192 — Community-Reiter im Substanzdetail

## Was gebaut wurde

- Neuer Reiter `Aus der Community` im Substanzdetail, nur wenn erlaubte Community-Daten zur Substanz vorliegen.
- Lesepfad in `apps/web/src/lib/supplements/substanz-read.ts` gegen `wissen.community_records`.
- Angezeigt werden nur die erlaubten Kosten-/Unsicherheits-Bloecke:
  - berichtete Nebenwirkungen
  - Stack-Tradeoffs
  - widersprochene Narrative als Mythen
  - Produktqualitaetssignale
  - Szene-Begriffe
- Nicht gelesen werden die Anleitungsfelder:
  - `reported_mitigations`
  - `components`
  - `reported_reason_for_combination`
  - `why_these_doses`

## Gemessene Datenlage in `wissen`

Direkt gegen die laufende Datenbank gemessen:

| Block | Datensaetze |
|---|---:|
| `community_side_effect_patterns` | 37 |
| davon mit `reported_mitigations` | 36 |
| `community_stack_patterns` | 31 |
| davon mit `expected_tradeoff` | 24 |
| `community_intelligence_patterns` mit `CONTRADICTED` | 3 |
| `community_product_quality_signals` | 40 |
| `community_terminology_terms` | 71 |

Substanzbezug, gefiltert auf `admin_only = true` und
`not_medical_recommendation = true`:

| Dataset | verknuepfte Zeilen | Substanzen |
|---|---:|---:|
| `community_intelligence_patterns` | 203 | 89 |
| `community_product_quality_signals` | 28 | 20 |
| `community_side_effect_patterns` | 81 | 40 |
| `community_stack_patterns` | 16 | 10 |
| `community_terminology_terms` | 71 | 14 |

Mindestens ein sichtbarer Community-Block liegt fuer 94 Substanzen vor.

Gegenproben:

| Substanz | Ergebnis |
|---|---|
| Nandrolone decanoate `sub_77b68a4df6` | 2 Nebenwirkungen, 5 Narrative |
| LGD-4033 `sub_a407e3597e` | 1 Nebenwirkung, 2 Tradeoffs, 4 Narrative, 1 Qualitaetssignal |
| Vitamin D3 `vitamin-d3` | kein Community-Reiter |

## Blocker

Die Daten liegen in der Datenbank, aber `wissen` ist nicht in
`supabase/config.toml` fuer PostgREST freigegeben:

```text
schemas = ["public", "graphql_public", "nutrition", "goals",
"supplements", "medical", "recovery", "training", "coach"]
```

Der angemeldete API-Test auf `/api/supplements/substanz?id=sub_77b68a4df6`
lieferte vor dem Guard:

```json
{"error":"Invalid schema: wissen","code":"READ_FAILED"}
```

Der Lesepfad faengt diesen Zustand jetzt ab und gibt `community = null`
zurueck. Dadurch bleibt das Substanzdetail nutzbar, aber der Reiter wird
erst sichtbar, wenn `wissen` ueber PostgREST erreichbar ist oder ein
eigener serverseitiger DB-Lesepfad bereitsteht.

## Nachweis

- `pnpm --filter web test -- src/lib/supplements/__tests__/substanz-reiter.test.ts`
  - 598 Tests gruen
  - neuer Waechter: verbotene Anleitungsfelder im Lesepfad lassen den Test rot werden
- `pnpm --filter web typecheck`
  - gruen
- API nach Guard:
  - `/api/supplements/substanz?id=sub_77b68a4df6` liefert angemeldet 200
- Screenshots:
  - `backup/g192/nandrolone-1280.png`
  - `backup/g192/nandrolone-1920-dark.png`
  - `backup/g192/ligandrol-1280.png`
  - `backup/g192/vitamin-d3-1280.png`

Aktueller Screenshot-Befund: keine 500er mehr, aber `Aus der Community`
sichtbar 0, weil `wissen` nicht freigegeben ist.

