---
nr: G-489
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-524]
kind_von: C-524
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-489 - die Ghost-UI kennt keine Supplemente

## Befund

Aus C-524, Codex, 2026-09-08:

> *,,Die Ghost-UI bleibt unveraendert: Sie stuerzt nicht ab,
kann Supplement-Planeintraege aber noch nicht anzeigen oder
bestaetigen."*

## Der Weg steht schon

> *,,Dafuer muss der spaetere UI-Weg die Referenz LESEN und
nach dem Anlegen der Mahlzeit `record_supplier_product_intake(
..., meal_id)` aufrufen."*

`[cmd]` **C-524 bringt die Absichtsreferenz, C-519 die
Einnahmefunktion** ? **beides liegt vor.**

`[read]` **Ein Planeintrag ist eine ABSICHT, das Bestaetigen
macht daraus eine EINNAHME.**

## Und die Formregel steht in der Datenbank

`[cmd]` **C-524 weist Capsule, Tablet, Softgel, Lozenge im
Plan ab** ? **die Oberflaeche muss sie nicht noch einmal
pruefen, aber sie soll es ERKLAEREN.**

## Abnahmebedingungen

    A1  ein Supplement im Ghost sichtbar. Foto.
    A2  Bestaetigen macht eine Einnahme daraus, mit
        intake_log. Belegt.
    A3  die Tagesbilanz zaehlt es. Zahl.
    A4  eine Kapsel im Plan: was sagt die Flaeche?
        Foto.
    A5  ein Plan ohne Supplemente unveraendert. Foto.
    A6  vier Module unveraendert.
