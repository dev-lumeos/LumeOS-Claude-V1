---
nr: G-300
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-rezepte.tsx
zahlen: null
---

# G-300 — Lebensmittel lassen sich nicht in einen Plan legen

## Befund

Aus G-298, Claude Code, 2026-08-31.

`[cmd]` **Neue Positionen lassen sich nur als Rezept anlegen.**
`[cmd]` **Bestehende BLS-Eintraege sind bearbeitbar** — gemessen:
100 g/dinner auf 275 g/lunch, `food_id` unveraendert.

`[read]` **Der Grund: die Lebensmittelsuche ist ein eigener Weg.**
`[cmd]` **`food_search` liefert ein JSON-Dokument mit 4.970
Lebensmitteln** — **eine Auswahlliste reicht nicht.**

## Was zu bauen ist

**Die Suche im Planformular.**

`[cmd]` **Der `CHECK` unterscheidet drei Typen:** `recipe` mit
`planned_servings`, `bls` und `custom` mit `amount_g`. `[cmd]` **Zwei
davon sind heute nicht anlegbar.**

`[cmd]` **Und die Suche steht:** zehn Sortierwerte, Herkunftsfilter
seit C-355, Treffergrund seit G-281. `[read]` **Es fehlt der
Aufrufer.**

`[read]` **`custom` hat 0 Zeilen** (C-355) — **also zuerst `bls`.**

## Auftrag

**Mitbeauftragt mit G-289 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in G-289)

`[cmd]` **Die Lebensmittelsuche sitzt jetzt im Rezept** — `SPEC_03`
Flow 7, Schritt 3: *„Food suchen -> Menge in g eingeben, mehrere
Zutaten sammeln, Live-Preview"*.

`[cmd]` **Im Browser gefahren:** „Reis" 12 Treffer, „Aal" 12 Treffer,
je Menge in Gramm, **Live-Vorschau 1.310 kcal gesamt / 327 je
Portion** bei 4 Portionen.

`[cmd]` **Dieselbe Route wie im Erfassungsdialog** —
`/api/nutrition/foods?q=`, kein zweiter Suchweg.

### Ein Befund am Rande, der die Vorschau betraf

`[cmd]` **`NutritionFoodSearchRow` liefert die Naehrwerte als
ZEICHENKETTEN** (`enercc: string`). `[read]` **Ohne Umwandlung
rechnete die Vorschau mit Text, und `NaN` saehe aus wie ein fehlender
Wert.** Ein Waechter haelt die Umwandlung fest.

### Was NICHT gebaut ist

`[read]` **Die Suche gehoert laut Flow 7 ins Rezept, nicht in den
Plan.** `[cmd]` **Der Auftragstitel sagt *„in einen Plan legen"*** —
**das steht in keinem Flow.** `[read]` **Positionen im Plan sind
G-298** und dort ueber die Rezeptauswahl gebaut; **Lebensmittel
direkt in eine Planzelle zu legen bleibt offen**, weil kein Flow es
beschreibt.

Bild: `backup/g289-browserprobe.png`

## Abnahme

**2026-08-31, mit G-289 abgenommen:** gebaut: die Lebensmittelsuche steht im Rezept, mit Gramm und
Live-Vorschau.
