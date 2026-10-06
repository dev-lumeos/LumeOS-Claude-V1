---
nr: A-106
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-10-06

braucht: [A-105]
kind_von: A-104

quellen:
  - docs/punkte/erledigt/quer-a-0104-live-hinkt-der-kette-hinterher.md

beruehrt:
  tabellen: []
  dateien: []
---

# Funktionen, Policies und Grants sind live anders als in der Kette

## Befund

`[read]` A-104 (`backup/a104/`): neben den sieben fehlenden Schritten
(A-105) unterscheiden sich 12 App-Funktionen im Rumpf (u. a.
`goals.goal_milestone_status`, `goal_progress_at`, vier
Fortschritts-Refresh-Funktionen, `nutrition.food_nutrient_snapshot`,
`food_preferences_write`, `micronutrient_snapshot`), 15 Policies und 187
App-Grants. Auffaellig: `goals.berechne_zielwerte` ist live fuer PUBLIC
ausfuehrbar (Kette: nur authenticated/service_role),
`supplements.supplement_forms_read` hat live keinen SELECT-Grant,
`coach.withdraw_relationship_invite` ist live SECURITY INVOKER statt
DEFINER, die Policy `nutrition.shopping_lists_delete` gibt es nur live.

Katalog: 55 Tabellen mit gleicher Zeilenzahl, aber anderem Inhalt; 28 mit
anderer Zeilenzahl (u. a. `food_tags` 32.128 / 30.857). Live teils groesser.

## Was zu tun ist

Je Abweichung entscheiden: Kette hat recht (live nachziehen), Live hat
recht (Kette nachziehen), oder beides falsch. Erst nach A-105.
