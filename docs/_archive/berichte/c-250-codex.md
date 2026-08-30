# C-250 / C-251 - Codex-Bericht

Stand: 2026-08-23

## Auftrag

C-251 wurde zuerst erledigt: `test-user@lumeos.local` hat eine echte
Einkaufsliste mit echten `nutrition.foods`-Zeilen bekommen.

C-250 wurde danach erledigt: der Supplements-Stack liest und schreibt
gegen `supplements.supplements`, nachdem `stack_items.supplement_id` in
C-243 auf die neue Tabelle umgehaengt wurde.

Nicht committet, nicht gestaged, nicht gepusht.

## C-251 - Shopping-Liste fuer test-user

Vorher gemessen:

```text
shopping_lists|0
shopping_list_items|0
```

Eingebaut in:

```text
supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql
supabase/_pipeline/_validierung/testdaten-pruefen.ts
```

Die Seed-Liste heisst `Nachweis-Einkaufsliste`, gehoert zu
`test-user@lumeos.local`, nutzt `shopping_list_id` als FK-Spalte und
enthaelt sechs echte `nutrition.foods`-Zeilen:

```text
C133000  Haferflocken
F503100  Banane
E111100  Ei (roh)
V416100  Haehnchenbrust (roh)
C351000  Vollkornreis (roh)
Q120000  Olivenoel
```

Nachher ueber RLS als `test-user@lumeos.local`:

```text
shopping_lists|1
shopping_list_items|6
Haferflocken
Banane
Ei (roh)
Haehnchenbrust (roh)
Vollkornreis (roh)
Olivenoel
```

Beim ersten Live-Einspielen fiel auf, dass die feste Testdaten-UUID
nicht der echten Live-UUID von `test-user@lumeos.local` entsprach. Die
Korrektur wurde auf Lookup per `auth.users.email` umgestellt; die falsch
zugeordnete C-251-Liste wurde entfernt. Final gehoert die Liste zu:

```text
61e9f10a-4e40-4162-8a92-a19479b40615  test-user@lumeos.local
```

## C-250 - Stack-Lesepfad und Schreibpfad

Geaendert:

```text
apps/web/src/lib/supplements/stack-read.ts
apps/web/src/lib/supplements/stack-write.ts
apps/web/src/app/v2/medical/page.tsx
apps/web/src/app/v2/supplements/tabs.tsx
apps/web/src/components/shell/__tests__/v2-attrappen.test.ts
```

Der Stack liest nicht mehr per Embed auf `supplement_catalog`, sondern
holt die neuen Daten aus:

```text
supplements.supplements
supplements.supplement_categories
supplements.supplement_dosing
supplements.supplement_evidence
```

Name-Regel:

```sql
COALESCE(NULLIF(name_de, ''), name_en)
```

Das ist wichtig, weil `name_de` in den neuen Kimi-Daten absichtlich leer
bleibt, bis uebersetzt wurde.

Der Schreibpfad `erfasseEinnahme()` und `ergaenzePosition()` loest den
Snapshot-Namen jetzt ebenfalls aus `supplements.supplements` auf.

Aktiver Stack auf `test-user@lumeos.local` nachher:

```text
Nachweis-Stack|3 Positionen|2 mit supplement_id|1 custom_name
Creatine monohydrate|sub_9f9bb8c160|12 Einnahmen
Omega-3 (EPA/DHA)|sub_4480fcfa86|0 Einnahmen
Vitamin D3|custom_name|12 Einnahmen
```

## Felder ohne Gegenstueck

Nicht erfunden und nicht aus alten Spalten uebernommen:

```text
typical_dose_min
typical_dose_max
serving_size
serving_unit
cost_per_serving
timing_default
requires_food
priority
benefits
```

Teilweise abbildbar:

```text
evidence_summary  -> supplement_evidence.summary_de/_en
dosing            -> supplement_dosing
```

Die Cost-Kachel zeigt deshalb jetzt weiter eine Attrappenmarke, aber mit
korrektem Grund: der neue Katalog hat keine Preis- und Portionsbasis.

## Medical-Lab-Effekte

`apps/web/src/app/v2/medical/page.tsx` nutzt fuer aktive Stack-Substanzen
jetzt:

```text
supplements.stack_items.supplement_id
supplements.supplements.name_de/name_en
supplements.supplement_lab_effects
```

Damit ist der alte `supplement_catalog`-Pfad aus der Medical-Seite raus.

## Gegenproben

Positiv:

```text
im Stack lesbar:
Creatine monohydrate, Omega-3 (EPA/DHA), Vitamin D3
```

Negativprobe falsches Feld:

```text
supplements.supplements.name existiert nicht
```

Die pruefende Abfrage wird rot, wenn wieder ein alter oder erfundener
Feldname verwendet wird.

Negativprobe unbekannte `supplement_id`:

```text
stack_items_supplement_id_fkey rejects unknown supplement_id
```

Die im Auftrag genannte UI-Gegenprobe "unbekannter Eintrag wird als
unknown row angezeigt" ist mit dem aktuellen Schema nicht herstellbar,
weil die Datenbank den Zustand per FK verhindert. Das ist staerker als
ein Unknown-Fallback und wurde so gemeldet, nicht umgangen.

## Screenshots

Vorher:

```text
backup/c250/supplements-testuser-vorher.png
backup/c250/supplements-testuser-vorher.log
```

Der vorab angenommene sichtbare PostgREST-Bruch liess sich im Screenshot
nicht reproduzieren. Gemessen wurden 1 Attrappenmarke und 1 bekannter
Hydration-Hinweis zu `data-mode`.

Nachher:

```text
backup/c250/supplements-testuser-nachher.png
backup/c250/supplements-testuser-nachher.log
backup/c250/medical-testuser-nachher.png
backup/c250/medical-testuser-nachher.log
```

Supplements nachher:

```text
Attrappen: 1
Konsolenfehler: 1 bekannter data-mode-Hydration-Hinweis
zweiter Lauf: 1538 ms, document 500 ms
```

Medical nachher:

```text
Attrappen: 5
Konsolenfehler: 1 bekannter data-mode-Hydration-Hinweis
zweiter Lauf: 1720 ms, document 650 ms
```

## Live-Einspielen

Vollsicherungen vor Live-Eingriffen:

```text
backup/vollsicherung/20260823_183129_c250_voll.dump
backup/vollsicherung/20260823_183129_c250_voll.sql
backup/vollsicherung/20260823_183442_c250_voll.dump
backup/vollsicherung/20260823_183442_c250_voll.sql
backup/vollsicherung/20260823_183458_c250_voll.dump
backup/vollsicherung/20260823_183458_c250_voll.sql
```

Der zweite Korrekturlauf brach vor Commit ab, weil
`shopping_list_items.source_detail` nicht existiert. Danach wurde der
Korrekturlauf angepasst und erfolgreich ausgefuehrt:

```text
DELETE 6
DELETE 1
INSERT 0 1
INSERT 0 6
COMMIT
```

## Validierung

Gruen:

```text
pnpm --filter @lumeos/web typecheck
pnpm --filter @lumeos/web test
pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts
pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts
node tools/encoding-pruefen.mjs
pnpm gate
```

`testdaten-pruefen.ts` ist nach dem Live-Nachziehen gruen:

```text
OK: C-82 Testdaten stimmen.
```

`schema-vollstaendigkeit-pruefen.ts` ist gruen:

```text
SCHEMA VOLLSTAENDIG
```

