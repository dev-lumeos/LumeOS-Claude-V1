---
nr: G-490
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-460
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a975287a
beruehrt:
  dateien:
    - tools/gefallene-spalten-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
---

# G-490 - der Spaltenwaechter kennt die Tabelle nicht

## Befund

`[cmd]` **`gefallene-spalten-pruefen.mjs` meldet:**

    apps/web/src/lib/supplements/produkt-daumen.ts
      liest `supplement_product_id` -- geworfen in
      c519_remove_meal_product_snapshots.sql

`[cmd]` **Selbst gemessen: `produkt-daumen.ts` liest aus
`nutrition.food_preference_items`** ? **und dort steht die
Spalte noch.**

`[read]` **C-519 hat `supplement_product_id` aus `meal_items`
entfernt, nicht aus `food_preference_items`.**

`[read]` **Der Waechter vergleicht den SPALTENNAMEN, nicht die
TABELLE** ? **falscher Alarm.**

## Dieselbe Klasse wie G-460

`[cmd]` **G-460: der Waechter suchte das WORT `ebene` statt
der Spaltenform** ? **acht Falschmeldungen.**

`[read]` **Hier sucht er die Spalte ohne die Tabelle** ? **ein
Name, der in zwei Tabellen vorkommt, wird verwechselt.**

## Warum es zaehlt

`[cmd]` **Codex zaehlt den Befund zu den *,,bestehenden roten
Waechtern"*** ? **er wird als Altlast mitgeschleppt, obwohl er
keiner ist.**

`[read]` **Ein Waechter, der falsch rot ist, lehrt alle, ihn zu
uebersehen.**

## Abnahmebedingungen

    A1  der Waechter kennt die Tabelle, nicht nur den
        Spaltennamen.
    A2  produkt-daumen.ts ist gruen.
    A3  Gegenprobe: eine echte gefallene Spalte in
        meal_items wird weiter rot. Sabotageprobe.
    A4  G-485 wuerde er fangen -- belegt.

## Zum dritten Mal gemeldet, 2026-09-08

`[cmd]` **Codex in C-536:** *,,pnpm gate ist danach rot wegen
eines anderen, neu sichtbaren C-519-Nachzugs:
`produkt-daumen.ts` liest noch die entfernte Spalte
`meal_items.supplement_product_id`."*

`[cmd]` **Selbst nachgemessen, zum zweiten Mal:
`produkt-daumen.ts` liest `nutrition.food_preference_items`,
und DORT steht die Spalte.**

`[read]` **Jeder Agent haelt es fuer einen echten Befund und
meldet es weiter** ? **das kostet in jedem Bericht Platz und
einmal fast eine Aenderung am falschen Ort.**


## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

> *,,Der Spaltenwaechter prueft nun Schema.Tabelle.Spalte."*

`[cmd]` **Selbst gelaufen: exit 0.**

`[cmd]` **Und die Gegenprobe:** *,,eine echte Leseabfrage auf
`nutrition.meal_items.supplement_serving_size` wird rot und
haette G-485 gefangen."*

`[read]` **A4 war genau das: der Fall, der Tom das Tagebuch
gekostet hat.**

`[read]` **Dreimal gemeldet, einmal behoben** ? **und der
naechste Agent verliert keinen Platz mehr daran.**

**Abgenommen.**


