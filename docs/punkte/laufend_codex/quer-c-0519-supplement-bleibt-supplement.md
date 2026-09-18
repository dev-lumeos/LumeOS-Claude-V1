---
nr: C-519
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-84
entscheidung: E-84
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.intake_logs]
---

# C-519 – ein Supplement bleibt ein Supplement

## Entscheidung E-84

Ein Produkt-Supplement bleibt im Schema `supplements`. Eine Mahlzeit oder ein Rezept hat lediglich einen Verweis; der Produktname und die historischen Nährwerte liegen nie in `nutrition`.

## Bericht (2026-09-18)

**Nicht live eingespielt.** Der Stand liegt als zwei Migrationen und ein idempotenter Pipeline-Schritt vor; geprüft wurde die frische Scratch-Datenbank `lumeos_c519_verify`. Die Live-Zeile aus C-513 bleibt bis zu einem ausdrücklichen Einspielen unverändert.

### Bauform

- `supplements.intake_logs.meal_id` ist optional; `stack_item_id` ist optional. Der Owner-Guard erzwingt bei einer verknüpften Mahlzeit denselben Nutzer und dasselbe Datum.
- Der historische Produkt-Snapshot liegt in `intake_logs`: Produkt, gewählte Portionsgröße, Menge, Datenstatus und Nährwerte. Das passt zu den vorhandenen Namens- und Dosis-Snapshots: eine tatsächliche Einnahme bleibt bei späterer Rezepturänderung historisch korrekt.
- `nutrition.meal_items` trägt nur `supplement_intake_log_id`. Die fünf C-513-Produkt-/Snapshotfelder werden nach dem Pipeline-Umzug entfernt.
- Rezepte nutzen eine `nutrition.recipe_ingredients`-Position mit `food_source='supplement'`; der Produktverweis liegt ausschließlich in `supplements.recipe_product_references`. Ein Rezept rechnet aktuelle, evidenzierte Produktwerte und ist kein Einnahmesnapshot.

### Nachweis

Der C-519-Test in der frischen Vollkette ist grün:

- Mahlzeit- und Stack-Verweis sind beide NULL-fähig.
- Eine Produkt-Einnahme mit Mahlzeit erzeugt einen Supplements-Log mit `120 kcal` und `24 g Protein`; der Meal-Posten enthält nur den Log-Verweis, keine Nährwerte und kein Produktfeld.
- Das Frühstück bleibt rechnerisch `557,5 kcal` und `40,022 g Protein` (Nahrungsanteil `437,5/16,022`, Whey `120/24`).
- Ein Whey-Rezept mit einer Referenz rechnet `120 kcal`, `24 g Protein`.
- Eine Einnahme ohne Stack und ohne Mahlzeit ist möglich und erzeugt keinen Meal-Posten.
- Die Tagesbilanz führt Nahrung und Supplemente getrennt: Mahlzeiten-Supplement, eigenständige/Stack-Einnahme und Gesamtsupplement bleiben separat sichtbar.
- Fremde Mahlzeit ist über RLS nicht lesbar und damit nicht verknüpfbar; `anon` hat kein EXECUTE auf beide Schreibfunktionen.

Der Pipeline-Schritt verschiebt die eine bestehende C-513-Zeile idempotent in einen neuen Intake-Log und leert dort die Nutrition-Snapshots. In der frischen Vollkette gab es keine C-513-Testzeile, daher war der Schritt erwartungsgemäß `0`; die echte eine Live-Zeile wird **nicht** ohne Einspielauftrag verändert.

### Sicherung und Prüfungen

- Vor der Vollkette: [Schema-Sicherung](D:/GitHub/LumeOS-Claude-V1/backup/schema/20260918121553_c43_vor_kettenlauf.sql).
- Vollkette: alle C-519-Schritte grün (`Schema → Pipeline → Bereinigung`) auf `lumeos_c519_verify`.
- `quer-c519-supplement-intake-references.test.ts`: grün.
- `migration-kette-pruefen` und die Selbstprobe von `migration-datenlogik-pruefen`: grün.
- Die wiederholte Schema-Abschlussprüfung hat keine C-519-Abweichung; rot bleibt ein bestehender, fremder Befund: `supplements.substance_group_memberships` hat bei `service_role` mehr Rechte als der C-327-Sollstand erwartet.
- `pnpm gate` stoppt vor den späteren Wächtern am bekannten, fremden Sammelfragen-Befund: `3` statt Soll `1` (C-507, E-84, G-377). Der Dev-Server wurde nicht gestartet, gestoppt oder verändert.

## Abnahme

_(vom Orchestrator)_
