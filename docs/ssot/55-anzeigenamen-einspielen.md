# Anzeigenamen einspielen

`[cmd]` Eingabedatei vor dem Einbau geprüft:
`supabase/_pipeline/daten/anzeigenamen.jsonl` enthält 5.775 Zeilen,
33 davon mit `sicher: false`, 576 mit nicht-leeren `nebennamen`.

---

## Ziel

Die kuratierten Anzeigenamen aus der versionierten JSONL-Datei sollen den
Kettenlauf überleben. `name_de` und `name_en` bleiben der amtliche
BLS-Wortlaut; die Kuration landet nur in `name_display_de` und
`name_display_en`.

---

## Commit 1: Spalte umbenannt

`[cmd]` Commit `6ef3ebe` benennt die deutsche Anzeigename-Spalte in den
lebenden Ketten-, Baseline-, Lese- und App-Dateien von `name_display` nach
`name_display_de` um.

`[cmd]` Nach dem Commit lief `pnpm gate` mit 8 von 8 Tasks erfolgreich.

---

## Commit 2: Anzeigenamen als Kettenschritt

`[cmd]` Commit `cad85b5` ergänzt den Kettenschritt
`supabase/_pipeline/_ableitung/anzeigenamen-einspielen.ts` und trägt ihn als
Schritt `025` in der README-Kettentabelle nach.

`[read]` `022_alias_ableitung.sql` liest `name_de`, nicht den Anzeigenamen.
Die Reihenfolge des Anzeigenamen-Schritts gegen `022` ist deshalb fachlich
unkritisch. In der README steht er nach `024`, weil er keine Grundlage für
Aliasableitung oder Suchsynonyme ist. Der Nebennamen-Schritt folgt danach als
eigener Schritt `026`.

**Entscheidung:** Der Schritt ist TypeScript unter
`supabase/_pipeline/_ableitung/anzeigenamen-einspielen.ts`, kein SQL.

`[read]` Grund: Die JSONL-Datei liegt im Repo auf dem Host. Ein SQL-Schritt im
DB-Container kann diese Datei nicht robust lesen, ohne sie vorher in den
Container zu kopieren oder den Inhalt in SQL zu duplizieren. Der TS-Schritt
liest die Datei zur Laufzeit, verlangt exakt 5.775 Zeilen und streamt die JSONL
per `docker exec -i ... psql` in eine temporäre Tabelle.

`[read]` Die 33 Zeilen mit `sicher: false` werden wie alle übrigen
eingespielt. Der Schritt zählt sie und gibt die Zahl aus, damit die offene
manuelle Prüfliste sichtbar bleibt.

`[read]` `name_display_th` bleibt unberührt.

`[cmd]` Nach dem Commit lief `pnpm gate` mit 8 von 8 Tasks erfolgreich.

---

## Commit 3: Nebennamen als Aliase

`[cmd]` Commit `a3d00e1` ergänzt den Kettenschritt
`supabase/_pipeline/_ableitung/anzeigenamen-nebennamen-aliase.ts` und trägt
ihn als Schritt `026` in der README-Kettentabelle nach.

`[cmd]` Die Datei enthält 576 Foods mit nicht-leerem `nebennamen`-Array und
663 einzelne kuratierte Nebennamen vor Deduplikation.

`[cmd]` Beim ersten Kettenlauf des Nebennamen-Schritts waren 380 der 663
kuratieren Nebennamen bereits als Alias vorhanden; 283 wurden mit
`source='curated_nebenname'` ergänzt. Ein zweiter Lauf meldete danach
663 vorhanden und 0 neu; der Schritt ist damit idempotent.

`[read]` Die bestehenden abgeleiteten Aliase aus `022_alias_ableitung.sql`
bleiben aus `name_de` abgeleitet. Der neue Schritt liest ausschließlich das
kuratierte Feld `nebennamen` aus `anzeigenamen.jsonl`; er leitet nichts aus
`name_display_de` ab.

`[read]` Herkunft in `food_aliases.source`: `curated_nebenname`. Die
CHECK-Constraint ist in Baseline, `020`, `022` und im neuen Schritt erweitert,
damit `derived` und `curated_nebenname` nebeneinander gültig bleiben.

`[read]` Überschneidung wird vor dem Einfügen über
`nutrition.search_fold(fa.alias) = nutrition.search_fold(nebenname)` gemessen.
Damit zählt auch ein bereits vorhandener gefalteter Alias als vorhanden und
wird nicht ein zweites Mal eingefügt.

### Fehler im ersten Lauf

`[cmd]` Der erste Lauf von `025` scheiterte an Zeile 3.744 der JSONL-Datei:
`COPY ... jsonb FROM STDIN` interpretierte Backslashes und machte aus dem
korrekt escaped `\"Toast Hawaii\"` wieder ein nacktes Anführungszeichen. Die
JSONL-Datei war nicht beschädigt; der Transport in `COPY` war falsch.

`[cmd]` Reparatur: Beide TS-Schritte streamen die JSON-Zeilen jetzt als
CSV-gequoteten `text` und casten erst in SQL zu `jsonb`. Danach aktualisierte
`025` 5.775 Anzeigenamen und meldete 33 `sicher=false`.

---

## Live-Neuaufbau und Messung

`[cmd]` Nach dem vollständigen lokalen Kettenneuaufbau enthält
`nutrition.foods` 7.140 Zeilen. `name_display_de` und `name_display_en` sind
jeweils bei 7.140 Zeilen befüllt; `name_display_th` bleibt bei 0 befüllten
Zeilen.

`[cmd]` `food_aliases` enthält nach dem Lauf 32.805 Zeilen:
21.420 `editorial`, 11.102 `derived`, 283 `curated_nebenname`.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`
lief mit Exit 0. Mindestzeilen waren erfüllt, unter anderem
`foods` 7.140/7.140, `food_nutrients` 698.092/698.092,
`food_aliases` 32.805/30.000 und `search_synonyms` 4.877/4.800.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/mealcam-zutaten-messen.ts`
traf den Sollwert auf Platz 1 bei 34 von 37 Zutaten. Der Wert ist gegenüber
dem bekannten Maßstab nicht gefallen.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/suche-wortschatz-pruefen.ts`
bestand mit `soll` 31 von 31 und `schutz` 16 von 16.

`[cmd]` Finales `pnpm gate` lief mit 8 von 8 Tasks erfolgreich.

---

## Was dieser Schritt nicht tut

- Er macht die Namen noch nicht editierbar. Das bleibt C-29/C-31.
- Er verändert `name_de` und `name_en` nicht.
- Er befüllt `name_display_th` nicht.
- Er baut keine Override-Tabelle.
- Er ersetzt die Aliasableitung aus `name_de` nicht.
