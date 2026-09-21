---
nr: C-524
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519, C-525]
kind_von: G-483
entscheidung: E-84
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-21
commit: nicht-committet
beruehrt:
  tabellen:
    - nutrition.meal_plan_entries
    - supplements.meal_plan_product_references
    - supplements.product_form_placement_rules
  dateien:
    - supabase/migrations/20260921093000_c524_meal_plan_supplements.sql
    - supabase/_pipeline/13_supplements/524_product_form_placement_rules.sql
    - supabase/_pipeline/_validierung/nutrition-c524-meal-plan-supplements.test.ts
zahlen:
  gemessen: 2026-09-21
---

# C-524 — Planeinträge können Supplemente vorsehen

## Ergebnis

**2026-09-21 live eingespielt.** Ein Supplement-Planeintrag ist eine
Produktabsicht, keine vorgezogene Einnahme. Die neue Tabelle
`supplements.meal_plan_product_references` verweist eindeutig auf einen
`meal_plan_entries`-Satz; sie ist absichtlich nicht die Rezept-Referenztabelle,
deren zwingender Fremdschlüssel auf `recipe_ingredients` zeigt.

`entry_type = 'supplement'` hat kein Food-, Rezept- oder Custom-Ziel. Ein
Intake entsteht erst nach Bestätigung durch
`record_supplier_product_intake(..., meal_id)`.

| Form | Platzierung |
|---|---|
| Powder, Liquid, Bar, Gummy | Meal |
| Capsule, Tablet/Pill, Softgel, Lozenge | Stack |
| Other, Unknown | nicht automatisch einplanbar |

Die Regel liegt einmalig in
`supplements.product_form_placement_rules`; die lesbare Funktion
`supplier_product_meal_eligibility(product_id)` liefert Form, Platzierung und
Zulässigkeit. In der Live-Transaktionsprobe wurde ein Powder-Planeintrag samt
Produktreferenz erzeugt; eine Capsule endete mit `check_violation`.

## G-484-/Ghost-Gegenprobe

G-484 liest Produkt- und Stackdaten, keinen C-524-Planvertrag. C-524 entfernt
keine Spalte und bricht deshalb keinen bestehenden Leseweg. Der aktuelle
Food-Ghost liest Supplement-Referenzen noch nicht; Anzeige und Bestätigung in
der Oberfläche bleiben der ausdrücklich getrennte G-489-Folgeweg. Ein
Supplement-Planeintrag kann die bestehende Food-Bestätigung daher nicht
fälschen.

## Nachweise

- Live: 23 C-525-Suchbegriffe, C-524-Referenztabelle und zehn Formregeln.
- Bestehende Planeinträge: 756 vor/nach Einspielung; davon 0
  Supplement-Planeinträge.
- Vertragsprobe: 4/4 grün, inklusive BLS-Gegenplan und RLS:
  `authenticated` darf Regeln lesen/eigene Referenzen bearbeiten, `anon` nicht.
- Frische Vollkette: C-524 grün. Der Abschlussfehler ist ausschließlich der
  bekannte C-327-Grantbefund.

Sicherung: `backup/schema/20260921090000_c525_c524_vorher.sql`.

## Nachtrag: LIVE eingespielt, 2026-09-08

`[cmd]` **10 Formregeln live: Powder im Plan erlaubt, Capsule
datenbankseitig abgewiesen.**

`[cmd]` **Selbst gemessen: 756 Planeintraege, unveraendert.**
