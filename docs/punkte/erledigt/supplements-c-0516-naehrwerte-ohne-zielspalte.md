---
nr: C-516
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-510
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1a5d3539
beruehrt:
  tabellen: [supplements.supplier_product_nutrient_name_mappings, supplements.product_contents]
zahlen:
  gemessen: 2026-09-18
  naehrstoffe: 138
---

# C-516 - Naehrwerte ohne Mapping

## Ergebnis

Die sieben offenen Familien wurden gegen `nutrition.nutrient_defs` gemessen.
Fuenf Ziele existieren und sind als 14 exakte DSLD-Schreibweisen gemappt. Die
Werte stehen portionsgenau in `supplier_product_nutrient_serving_options.nutrients`
und `supplier_product_nutrients.nutrients`; beim Hinzufuegen zu einer Mahlzeit
gehen sie unveraendert in den Snapshot. Es wurden keine neuen Food-Spalten und
keine neuen Nährstoffcodes erfunden.

| Familie | nutrition-Code | Einheit | exakte Schreibweisen | Zeilen | Produkte | umrechenbare Zeilen |
|---|---|---|---:|---:|---:|---:|
| Cholesterol | `CHORL` | mg | 4 | 14.889 | 13.785 | 10.932 |
| Monounsaturated Fat | `FAMS` | g | 5 | 2.608 | 2.513 | 2.070 |
| Polyunsaturated Fat | `FAPU` | g | 3 | 3.885 | 3.810 | 3.608 |
| Soluble Fiber | `FIBSOL` | g | 1 | 1.316 | 1.231 | 1.291 |
| Insoluble Fiber | `FIBINS` | g | 1 | 553 | 545 | 537 |
| Trans Fat | — | — | 0 | — | — | — |
| Added Sugars | — | — | 0 | — | — | — |

`Trans Fat` und `Added Sugars` haben keinen passenden generischen
`nutrient_defs`-Code. Die vorhandene trans-konjugierte Einzelfettsaeure ist
kein Ersatz fuer Gesamt-Transfett. Beide bleiben daher sichtbar ohne Mapping.

Die 14 Mappingzeilen haben Quelle `dsld_nutrition_facts_exact_label_c516` und
Evidenzklasse A: vollständige, exakte DSLD-Nutrition-Facts-Labels. Ungueltige
oder fehlende Mengen werden nicht konvertiert, sondern als Luecke gezeigt.

## Ausgeschlossen

Alle Blend- und Sammelnamen bleiben ohne Mapping, darunter `Cholesterol Support
Blend` (2), `Cholesterol Support Blend:` (1), `Cholesterol D-fense Blend` (1),
`Cholesterol Health(TM)` (1) und `Trans Fats & Saturated Fats` (8). Sie
benennen Mischungen, nicht den einzelnen Naehrwert.

Die 23.251 gemappten Labelzeilen liegen auf 16.632 unterschiedlichen Produkten;
18.438 Zeilen tragen eine sicher umrechenbare Masse. Die Zahl der
`product_contents.supplement_id` bleibt 815.461: fuer diese fuenf
Naehrstoffaggregate gibt es absichtlich kein Substanzkatalogziel.

## Gegenproben und Kette

- C-516-Schutztest: gruen; anon hat kein View-SELECT, authenticated hat SELECT.
- Mahlzeitenprobe: 30 mg `CHORL` pro Softgel werden bei zwei Portionen als
  60 mg im unveraenderlichen Mahlzeiten-Snapshot gespeichert.
- Zweiter Datenlauf: 14 Mappings, 815.461 Inhaltslinks und 112.285
  Nährwertprodukte jeweils vor/nachher gleich; der Mapping-Insert meldet `0`.
- Sicherung: `backup/schema/20260918041858_c43_vor_kettenlauf.sql`.
- Vollkette: gruen, 246 Schritte, 1.259,1 s, `SCHEMA VOLLSTAENDIG`.

## Abnahme

**2026-09-08, Orchestrator. Gemessen ? NICHT live.**

`[cmd]` **Die Mappings auf CHORL, FAMS, FAPU, FIBSOL, FIBINS
sind in der laufenden Datenbank NICHT da.**

`[cmd]` **Migration und Kettenschritt liegen vor:**
`20260918113000_c516_additional_supplier_product_nutrients`,
`516_supplier_product_additional_nutrients.sql`.

### Vierzehn Labels gemappt

`[cmd]` **Auf CHORL, FAMS, FAPU, FIBSOL, FIBINS** ? **die
Codes, die Tom genannt hat.**

### Und zwei bleiben offen, gemeldet

> *,,Trans Fat und Added Sugars haben keinen passenden
generischen Code und bleiben offen."*

`[read]` **Die Auflage war:** *,,wo nein: GEMELDET, nicht
angelegt."*

`[cmd]` **7.581 Produkte mit Trans Fat, 8.271 mit Added
Sugars** ? **sie brauchen einen Eintrag in `nutrient_defs`,
und das ist Toms Entscheidung.**

### Und die Werte fliessen durch

> *,,Zusatzwerte stehen portionsgenau im `nutrients`-JSON und
fliessen in Mahlzeiten-Snapshots ein: 30 mg Cholesterin x 2 =
60 mg."*

`[read]` **Damit zaehlt Cholesterin in Toms Fruehstueck mit,
sobald es eingespielt ist.**

**Abgenommen, Einspielen steht aus.**

