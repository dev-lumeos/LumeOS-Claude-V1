# C-191: Die drei offenen Reste aus C-187

Datum: 2026-08-22  
Bereich: `supabase/_pipeline/`

## Korrekturen am C-187-Bericht

- `[cmd]` Der rote Test aus `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts` ist nicht als bestehender fremder Fehler zu behandeln. Er prueft C-124: `MAX_DAILY_BONUS` muss entfernt sein. Das liegt bei Fable; der Punkt wurde nicht umgangen.
- `[cmd]` Serin heisst `SER`, nicht `SE`. `SE` existiert nicht, `S` ist Schwefel. Die Schlussfolgerung bleibt: Selen fehlt.
- `[cmd]` `nutrition.nutrient_defs` hat keine Beschreibungsspalte. Die 20 Spalten sind der technische Katalog plus Thai-Felder, Bewertungshorizont und `parent_code`; fuer die 28 Texte kommen deshalb nur `name_th`/`group_th` als Katalogluecke oder die separate `nutrition.nutrient_details`-Tabelle als Erklaerungsluecke in Frage.

Der C-187-Bericht wurde nicht geaendert, weil C-187 uncommittet im Baum liegt und Tom ueber diesen Commit entscheidet.

## C-178 mit den richtigen Namen

`[cmd]` Vorher, auf Wegwerf-Datenbank aus der Kette:

- `medical.biomarker_spec_enrichment`: 49 Zeilen
- `medical.lab_marker_catalog`: 66 Zeilen
- `system_groups`: `text[]`-Spalte auf `medical.biomarker_spec_enrichment`, keine Tabelle, kein JSONB
- Schluessel in `biomarker_spec_enrichment`: `loinc_code`, keine Spalte `code`

`[cmd]` Prolactin wurde ueber `name_de`, `common_name` und `spec_name` in `biomarker_spec_enrichment` nicht gefunden. Im Katalog lag es bereits vor:

- `medical.lab_marker_catalog`: `lab_prolactin`, LOINC `2842-3`
- `medical.biomarker_catalog`: `2842-3`, Prolactin, `ng/mL`, deutscher Name `Prolaktin`

`[cmd]` ApoB war in `biomarker_spec_enrichment` nur als falsche Spec-Zeile vorhanden:

- `1869-7`: Spec sagt ApoB, LOINC ist aber Apolipoprotein A-I; Status bleibt `identity_mismatch`
- `1884-6`: echter ApoB-Code im Katalog und in `medical.lab_marker_catalog`

Gebaut:

- `1884-6` als belegte ApoB-Spiegelung mit `system_groups = {cardiovascular}`, `display_usable = true`, `ranges_imported = true`
- `2842-3` als repo-validierter Prolactin-Zusatz mit `system_groups = {hormonal}`, `display_usable = true`, `ranges_imported = false`

`[cmd]` Danach:

- `medical.biomarker_spec_enrichment`: 51 Zeilen
- `medical.lab_marker_catalog`: 66 Zeilen
- `medical.biomarker_reference_ranges`: 566 Zeilen, weil ApoB zwei Spec-Bereiche mitbringt

Die festen Erwartungen stehen in `144_biomarker_spec_enrichment.ts` und `schema-sollstand.json`. Mit eingebautem Fehler `EXPECTED_PRESENT_IN_CATALOG = 999` bricht die Pruefung rot ab: `Spec-Marker im Katalog: 51, erwartet 999`, Returncode 1.

## Selen

`[cmd]` In der Ketten-DB:

- `SELECT ... WHERE lower(code || name_de || name_en) ~ 'selen|seleni'` liefert 0.
- `S` ist `Schwefel`, `parent_code = NULL`.
- `SER` ist `Serin`, `parent_code = PROT625`.
- `SE` existiert nicht.

`[cmd]` Auch im Repo gibt es keinen Treffer auf `selen`, `seleni` oder `Selen` ausserhalb der Auftrags- und Berichtstexte. BLS 4.0 ist hier die Quelle des importierten Naehrstoffkatalogs; in den importierten BLS-Katalogdaten dieses Repos fuehrt er keinen Selen-Eintrag. Es wurde kein Code erfunden und nichts angelegt.

## Die 28 Texte

`[cmd]` `nutrition.nutrient_defs` hat keine Beschreibungsspalte. Gemessen auf der Ketten-DB:

- `name_th` leer: 138 von 138
- `group_th` leer: 138 von 138
- beide leer: 138 von 138

Damit sind die 28 nicht die Thai-Felder. Sie stammen aus der separaten Erklaerungsschicht: `nutrition.nutrient_details` trifft nicht jeden `nutrient_defs`-Code. Der alte Befund aus G-122/G-126 bleibt plausibel: 28 Codes ohne Erklaerungstext, vor allem einzelne Fettsaeuren plus `OLSAC` und `F18:2C9T11`. Das ist keine Uebersetzungsfrage in `nutrient_defs`; es wurde nichts uebersetzt oder erfunden.

## CHORL

`[cmd]` `CHORL` steht als:

- `code = CHORL`
- `name_de = Cholesterin`
- `display_tier = 1`
- `group_de = Sonstige Naehrstoffe`
- `parent_code = NULL`

Nicht alle Naehrstoffe haengen im Baum unter einem Elternteil; C-161 hatte 40 Wurzeln und 98 Kinder. `CHORL` ist aktuell eine Wurzel. Das wirkt fachlich plausibel, weil Cholesterin kein Kind von `FAT`, `FASAT` oder einer Fettsaeuren-Summe ist. Der Wert wurde nicht gesetzt.

## Nachweis

- `[cmd]` Schema-Sicherung vor Aenderung: `backup/schema/20260822081453_c191_vor_schema.sql`.
- `[cmd]` Kettenlauf auf Wegwerf-Datenbank `lumeos_c191_rc`: 87 Schritte, Returncode 0. Log: `backup/c191/kette-c191-rc.log`.
- `[cmd]` Erwartungspruefung mit eingebautem Fehler: Returncode 1. Log: `backup/c191/negative-erwartung-rc.log`.
- `[cmd]` Zaehl- und Befundabfragen: `backup/c191/messung-vorher.log` und `backup/c191/messung-nachher.log`.
- `[cmd]` Wegwerf-Datenbanken wurden verworfen.
