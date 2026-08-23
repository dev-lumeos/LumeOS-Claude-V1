# C-235 — Codex, 2026-08-23

**Roh, unbearbeitet.** Geprueft vom Orchestrator; die Pruefung steht in
`docs/todo/ERLEDIGT.md`.

---

C-235 ist umgesetzt und live eingespielt. Nichts committed, nichts gestaged.

Geändert:
- `supabase/_pipeline/13_supplements/137_supplements_neuaufbau_befuellen.sql` neu angelegt.
- `supabase/_pipeline/kette.json` auf 89 Schritte erweitert.
- `supabase/_pipeline/daten/schema-sollstand.json` nachgezogen.
- `136_supplements_neuaufbau.sql`: `lab_marker_id` in `supplement_lab_effects` und
  `supplement_monitoring` von UUID auf TEXT, weil `medical.lab_marker_catalog.marker_id`
  ein Textschlüssel ist.

Wichtig: Schritt 137 musste in der Kette hinter `14_medical/147_substance_lab_markers.ts`
laufen. Direkt nach 136 fehlt die Quelle `supplements.substance_lab_effects`; der erste
Probelauf ist genau daran korrekt rot geworden.

## Wegwerf-Nachweis
- Kettenlauf: `backup/c235/kette-g.log`
- Ergebnis: KETTE OK: 167.0s, 89 Schritte, SCHEMA VOLLSTAENDIG
- Separate Schemaprüfung gegen `wegwerf_c235g`: grün.
- Negativproben:
  - Daten fehlen: `supplement_aliases` 1540 statt 1541 → rot.
  - Erwartung zu hoch: 1541 statt 1542 → rot.

## 33 Zieltabellen nach Befüllung

    supplements 566
    supplement_groups 3
    supplement_categories 23
    supplement_aliases 1541
    supplement_lab_effects 222
    supplement_nutrients 17
    supplement_safety 290
    supplement_warnings 290
    supplement_wada 290
    supplement_quality 237
    supplement_pharmacology 566
    supplement_dosing 566
    supplement_evidence 566
    supplement_monitoring 46
    supplement_organ_risks 1450
    supplement_identifiers 1226
    supplement_regulatory 1119
    supplement_field_sources 2147
    supplement_interactions 78
    alle übrigen Plan-/User-/Template-/Cycle-Tabellen: 0

## Befund

`supplement_regulatory` ist 1119, nicht 1185. Die aktuelle Quelle enthält 331 leere
UK/Australia-Strings. `unknown` wird als `unbekannt` importiert; leere Strings werden
nicht als Zeile importiert. Das ist im SQL als NOTICE dokumentiert, nicht passend gemacht.

## Live eingespielt
- Vollsicherung vorher:
  - `backup/vollsicherung/20260823_093637_c235_vor_live_lumeos_voll.dump`
  - `backup/vollsicherung/20260823_093637_c235_vor_live_lumeos_voll.sql`
- Live-Apply: `backup/c235/live-apply-137.log`
- Alte Tabellen unverändert: `substance_catalog` 566, `supplement_catalog` 44,
  `substance_aliases` 1541, `intake_logs` 720, `stack_items` 8, `user_stacks` 2.
- 19 Kontrollzahlen nachher unverändert, u.a. foods 7140, meal_items 9051,
  recovery.scores 340, lab_result_values 280.
- Policies live gezählt: 308 total.

## Prüfungen
- Wegwerf-Kette und Wegwerf-Schema: grün.
- Live-Schema ist rot, aber nicht wegen C-235: es fehlen live die 058b-Shopping-List-Objekte.
- `testdaten-pruefen.ts` ist rot mit 2 Punkten:
  - `medical.biomarker_reference_ranges` 566 statt erwarteter 564.
  - Recovery-Score-Fall fehlt.
  Beide liegen außerhalb C-235.
