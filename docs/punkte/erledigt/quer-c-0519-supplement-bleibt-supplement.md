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
erledigt: 2026-09-19
commit: 6fb06234
beruehrt:
  tabellen: [supplements.intake_logs, nutrition.meal_items]
---

# C-519 - ein Supplement bleibt ein Supplement

## Entscheidung E-84

Ein Produkt-Supplement bleibt im Schema `supplements`. Mahlzeiten und Rezepte
tragen nur einen Verweis. Der Produktname und die historischen Naehrwerte
liegen beim Einnahmelog, nicht in `nutrition`.

## Live eingespielt - 2026-09-19

Die drei Schritte wurden in dieser Reihenfolge gegen die laufende Datenbank
eingespielt:

1. `20260918193000_c519_supplement_intake_references.sql`
2. `519_migrate_meal_supplement_references.sql`
3. `20260918194000_c519_remove_meal_product_snapshots.sql`

Vorher lag die verlangte Sicherung vor:
[`20260918205352_c519_vor_einspielen.sql`](D:/GitHub/LumeOS-Claude-V1/backup/schema/20260918205352_c519_vor_einspielen.sql).

### Ergebnis live

- `supplements.intake_logs.meal_id` ist vorhanden.
- `supplements.intake_logs.stack_item_id` ist NULL-faehig.
- Die vier C-513-Altspalten sind aus `nutrition.meal_items` entfernt:
  `supplement_product_id`, `supplement_serving_size`,
  `supplement_serving_quantity`, `supplement_nutrient_status`.
- Der idempotente Pipeline-Schritt hat die historische C-513-Zeile in einen
  Intake-Log ueberfuehrt; danach gab es keine verbliebene Alt-Referenz.
- `meal_items` verweist jetzt mit `supplement_intake_log_id` auf den
  Supplements-Log. Zum Abschluss bestanden drei Meal-zu-Intake-Verweise und
  drei Intake-Logs mit `meal_id`.

### Toms Whey-Fruehstueck

Das konkrete Fruehstueck bleibt unveraendert nachvollziehbar:

| Naehrstoff | Nahrung | Whey aus Supplement-Log | Summe |
|---|---:|---:|---:|
| ENERCC | 437,5 kcal | 120 kcal | **557,5 kcal** |
| PROT625 | 16,022 g | 24 g | **40,022 g** |

Damit stammt das Whey weiterhin getrennt und sichtbar aus `supplements`.

### Gegenprobe

Unter der authentifizierten Identitaet von `dev@lumeos.app` wurde in einer
zurueckgerollten Transaktion `record_supplier_product_intake` fuer das Whey
aufgerufen. Der erzeugte Log hatte sowohl `stack_item_id IS NULL` als auch
`meal_id IS NULL`. Es wurde kein Testdatensatz behalten.

## Vollkette und Waechter

Die frische Tageskette `lumeos_tageskette_20260919` lief alle C-519-Schritte
in der Reihenfolge Schema -> Pipeline -> Bereinigung erfolgreich durch. Die
Abschlusspruefung ist anschliessend an einem bestehenden, fachfremden
C-327-Sollstandsfehler stehen geblieben:
`supplements.substance_group_memberships` hat fuer `service_role` mehr Rechte
als der Sollstand erwartet. C-519 selbst hat keine Abweichung verursacht.

- `migration-kette-pruefen.mjs`: gruen.
- `migration-datenlogik-pruefen.mjs`: gruen (44/44 historische Operationen).
- `punkte-pruefen.mjs`: fachliche Punkte 25/25 Sollbefunde; rot ausschliesslich
  wegen des genannten fehlgeschlagenen Tagesketten-Nachweises.
- Der Dev-Server wurde nicht gestartet, gestoppt oder veraendert.
