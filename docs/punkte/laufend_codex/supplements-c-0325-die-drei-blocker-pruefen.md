---
nr: C-325
typ: messung
modul: supplements
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - docs/punkte/todos/supplements-c-0129-der-kimi-bestand-brauchbar-aber-nicht-importierbar.md
zahlen:
  gemessen: 2026-08-27
  supplements_punkte: 42
  blocker: 3
agent: codex
beauftragt: 2026-08-27
---

# C-325 — die drei Supplements-Blocker gegen den heutigen Stand pruefen

## Befund

`[cmd]` **42 offene Supplements-Punkte, drei davon `blocker` mit
`schwere: hoch`:**

    C-129   Der Kimi-Bestand - brauchbar, aber nicht importierbar
    C-260   Die Arbeitsberichte sind nicht in die Daten
            zurueckgeflossen
    C-202   Produkte, Marken, Hersteller, Kennungen

`[read]` **Alle drei stammen aus der Zeit vor dem Katalogaufbau.**
`[cmd]` Seither sind 412 Substanzen sichtbar, 446 mit Nutzertext und
FAQ, und Kimis Wellen 1 bis 4 sind importiert.

`[read]` **Vier von vier stichprobenartig geprueften Punkten waren
heute veraltet** — G-207, G-211, G-138, G-176. **Ein Bauauftrag auf
C-129 waere der fuenfte auf toter Praemisse.**

`[cmd]` **C-202 dagegen ist heute erst richtig aufgegangen:** die
Produktebene existiert mit 448 Produkten und 428 Marken, **aber `DE`
steht bei 0.** C-308 haengt daran.

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**Du hast heute fuenfmal meine Zahl berichtigt** — 20 statt 31
Regeln, 43 statt 47 C-Punkte, 6.084 statt 6.600 Zeilen, 411 statt 412
Nutzertexte, 43 statt 47 Punkte in der Liste.

### Vier Punkte, je ein Urteil mit `[cmd]`

    C-129   Kimi-Bestand importierbar?
    C-260   Arbeitsberichte in den Daten?
    C-262   Der Import - vier Wellen
    C-202   Produkte, Marken, Hersteller, Kennungen

**Je Punkt:** `erledigt` · `teilweise` · `offen` · `ueberholt` ·
`unklar` — **mit `[cmd]` je Urteil, ohne Ausnahme.**

`[read]` **Ein Punkt, den du ohne Messung fuer erledigt haeltst,
bleibt `unklar`.** Das ist kein Makel, sondern das ehrliche Ergebnis.

### Bei `teilweise` und `offen`: was genau fehlt

`[read]` **Nicht *,,noch nicht fertig"*, sondern die Zahl.** Wenn
C-262 drei von vier Wellen importiert hat, **welche fehlt und wie
viele Zeilen sind es?**

`[cmd]` **Bei C-202 weiss ich schon, was fehlt:** 448 Produkte, davon
`US` 324, `CA` 56, `TH` 6, `UK` 4, `AU` 2 — **`DE` null.** `[read]`
**Pruef, ob der Punkt noch mehr meint als die fehlenden Marktdaten**
— Kennungen, Hersteller, Verpackungen sind eigene Fragen.

### Und die zwei formalen Blockaden aufloesen

`[cmd]` **C-272 traegt `braucht: C-275, C-276`, C-317 traegt
`braucht: C-274`.** `[read]` **Alle drei Vorbedingungen sind
geschlossen** — die Blockade ist nur noch formal. **Entfernen und im
Bericht nennen.**

### Was nicht zu tun ist

**Nichts reparieren, nichts importieren, nichts anlegen.** `[read]`
**Dies ist eine Bestandsaufnahme.** Was du findest, wird ein Auftrag.
**Keinen Punkt zusammenlegen oder streichen.**
`apps/` nicht anfassen — Claude Code arbeitet dort.
`docs/todo/` nicht anfassen. Nicht committen, nicht stagen, nicht
pushen.

### Nachweis

    Punkte geprueft            4
    je Urteil                  mit `[cmd]`
    bei teilweise/offen        was genau fehlt, in Zahlen
    braucht-Felder bereinigt   2
    Waechter                   gruen, Sollstand genannt

`[read]` **Und die Zahl, die zaehlt:** wie viele der drei
`hoch`-Blocker bleiben? **Wenn zwei wegfallen, sortiert sich die
Liste von selbst.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung.**
**Nach jeder Aenderung `node tools/punkte-index.mjs --schreiben`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
