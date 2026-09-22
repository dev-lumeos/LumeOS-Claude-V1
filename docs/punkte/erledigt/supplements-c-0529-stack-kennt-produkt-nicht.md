---
nr: C-529
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-484
entscheidung: null
agent: codex
beauftragt: 2026-09-22
erledigt: 2026-09-08
commit: c2ef18dc
beruehrt:
  tabellen: [supplements.stack_items]
zahlen:
  gemessen: 2026-09-08
---

# C-529 - der Stackeintrag kennt sein Produkt nicht

## Befund

Aus G-484, Claude Code, 2026-09-08:

> *,,`stack_items` hat weiterhin keine Produktspalte. Der Eintrag
traegt daher den Produktnamen. Der Stackeintrag weiss nicht,
welches Produkt gemeint war (die Id steht als KRUECKE in
`notes`)."*

`[cmd]` **Selbst gesehen:** `custom_name` = *,,Optimum Nutrition
Gold Standard 100% Whey Vanilla Ice Cream"*.

## Codex eigene Empfehlung aus C-518

> *,,`stack_items` kuenftig mit OPTIONALEM Produkt ZUSAETZLICH
zur optionalen Substanz. Nicht ableiten, welche
*Hauptsubstanz* ein Produkt meint."*

`[read]` **Jetzt gibt es einen Grund** ? **G-484 schreibt
Produkte in den Stack.**

## Abnahmebedingungen

    A1  stack_items.supplier_product_id, optional.
    A2  die Krueke in notes wird zur Spalte umgezogen.
    A3  ein Stackeintrag mit Produkt kennt seine
        Naehrwerte.
    A4  bestehende Eintraege unveraendert.
    A5  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. LIVE.**

`[cmd]` **`stack_items.supplier_product_id` optional, selbst
gesehen.**

`[cmd]` **0 von 11 Eintraegen haben ein Produkt** ? **weil der
Code aus G-484 noch in `notes` schreibt.**

> *,,Die alte G-484-Notiz wird ausschliesslich bei EXAKTER,
existierender Produkt-ID migriert. Live gab es davon 0."*

> *,,`notes` wurde bewusst NICHT entfernt; Claude Code kann
jetzt auf die neue Spalte umstellen, ohne Nutzernotizen zu
beschaedigen."*

`[read]` **Die Warnung aus G-485 beachtet** ? **erst die
Spalte, dann den Leser, dann die Kruecke.**

`[cmd]` **Sicherung: `backup/schema/20260922070000_c529_vorher.sql`.**

**Abgenommen. Die Umstellung liegt in G-493.**

