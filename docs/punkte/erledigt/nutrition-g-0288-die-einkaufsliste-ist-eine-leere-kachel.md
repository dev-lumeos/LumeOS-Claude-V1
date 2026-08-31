---
nr: G-288
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 5bb0e056
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-rezepte.tsx
zahlen: null
---

# G-288 — Die Einkaufsliste ist eine leere Kachel

## Befund

`[cmd]` **`SPEC_10` nennt drei Komponenten:** `ShoppingListView`,
`ShoppingListDetail` (*,,Liste mit Abhak-Items, Fortschrittsbalken (X
von N)"*), `ShoppingListItem`.

`[cmd]` **Gebaut ist eine Kachel mit dem Satz *,,Noch keine
Einkaufsliste angelegt"*.**

`[read]` **Tom, 2026-08-31:** *,,noch der groessere schwachsinn."*

## Was da ist

`[cmd]` **`nutrition.shopping_lists` traegt eine Zeile mit sechs
Positionen** — **sie gehoert `test-user@lumeos.local`.**

`[read]` **Die Kachel ist also nicht falsch, sie ist unfertig:** es
gibt keinen Weg, eine Liste anzulegen, keine Detailansicht, keine
Abhakfunktion.

`[cmd]` **`SPEC_10` sagt dazu: *,,Schema-only V1 — Full UI Phase 2
wenn Zeit knapp"* (ADR_RECIPES_SCHEMA_ONLY).** `[read]` **Das war
eine Entscheidung, und sie steht der Sache heute im Weg.**

## Zu klaeren

`[read]` **Gilt *Schema-only* noch?** **Wenn ja, gehoert es an die
Kachel geschrieben — wenn nein, sind es drei Komponenten.**

## Auftrag

**Mitbeauftragt mit G-289 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in G-289)

`[cmd]` **Gebaut nach `SPEC_03` Flow 8, Schritte 1-5** — im Browser
auf `test-user` gefahren:

    1  „Einkaufsliste" am Rezept   Dialog oeffnet
    2  Portionen waehlen           Vorgabe 4, gesetzt auf 8
    3  Generieren                  2 Posten, Mengen skaliert
                                   250 g -> 500 g, 150 g -> 300 g
    4  Anzeigen                    Titel, Portionen, Liste
    5  Abhaken                     HTTP 200, `is_checked = true`

`[cmd]` **In der Datenbank:** `source_type = 'recipe'`, `recipe_id`
gesetzt, `meal_plan_week_id` leer — so verlangt es
`shopping_lists_source_target_check`.

### Die Kachel behauptete das Gegenteil, und das ist berichtigt

`[cmd]` **Der Satz sagte: *„Sie entsteht aus einer Planwoche"*.**
`[cmd]` **Flow 8 sagt: *„Rezept oeffnen -> Einkaufsliste
erstellen"*.**

`[read]` **Das war die ZWEITE falsche Fassung desselben Satzes** —
die erste behauptete eine fehlende Tabelle (G-271), die zweite den
falschen Ursprung. **Der Waechter prueft jetzt die QUELLE statt der
Verfuegbarkeit**, weil das die Aussage ist, die falsch werden kann.

### Und die Einheit wird nicht erfunden

`[cmd]` **Die Bestandsliste im Repo fuehrt *„250 ml"* Olivenoel**, und
genau das steht auf dem Schirm — `unit_display` wird durchgereicht.
`[read]` **Milliliter aus Gramm zu rechnen waere eine
Dichteannahme.**

### Offen

`[cmd]` **Flow 8, Schritt 6 nennt *„Teilen / Exportieren moeglich"* —
ohne Format, ohne Ziel, ohne Mechanismus.** `[read]` **Nicht gebaut,
sondern gemeldet;** ein Waechter verbietet einen erfundenen
Export-Knopf. **Das braucht eine Entscheidung.**

Bild: `backup/g289-browserprobe.png`

## Abnahme

**2026-08-31, mit G-289 abgenommen:** gebaut: Liste aus Rezept, Mengen skaliert, Abhaken schreibt.
Der Satz von der Planwoche war die zweite falsche Fassung.
