---
nr: G-325
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-323
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: c9d91b1c
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/rezepte-echt.tsx
zahlen: null
---

# G-325 — Zutaten zeigen ihre Makros nicht

## Befund

Tom, 2026-09-02: *,,die einzelpositionen sollen die makros anzeigen
wenn man da editiert weiss man nichts mehr. also eine saubere
auflistung inkl schon errechneten makros, das eingabefeld gramm
kleiner dafuer alle makros sauber auflisten von der menge die
eingegeben wird."*

`[cmd]` **Heute im Rezepteditor: je Zutat nur Name und ein
Grammfeld, das fast die halbe Breite nimmt.**

    Haehnchen Brustfilet, roh     [440              ] g  [Muell]
    Reis unpoliert, roh           [190              ] g  [Muell]
    Broccoli gekocht              [440              ] g  [Muell]
    Olivenoel                     [30               ] g  [Muell]

`[cmd]` **Die Makros stehen nur als Gesamtsumme darunter:**
1.579 kcal, 132,7 g Protein, 45,3 g Fett, 150,5 g Kohlenhydrate.

`[read]` **Wer eine Menge aendert, sieht nur, wie sich die Summe
bewegt** — **nicht, was die einzelne Zutat beitraegt.**

## Was zu bauen ist

**Je Zutat eine Zeile mit Menge und ihren Makros.**

`[read]` **Das Grammfeld schmal, daneben die vier Werte** — **aus der
eingegebenen Menge gerechnet.**

`[cmd]` **`menge-rechnen.ts` kann es bereits** — dieselbe Datei, die
im Suchmodal die Live-Vorschau rechnet. `[cmd]` **Gegen
`food_nutrient_snapshot()` geprueft, identisch auf die
Nachkommastelle** (G-320).

`[read]` **Es fehlt also nur die Anzeige, nicht die Rechnung.**

## Warum es zaehlt

`[read]` **Ein Rezept mit 1.579 kcal ist eine Zahl.** `[read]` **Ein
Rezept, bei dem 440 g Haehnchen 480 kcal und 30 g Olivenoel 270 kcal
beitragen, ist eine Aussage** — **man sieht, woran man drehen
kann.**

## Auftrag

**Mitbeauftragt mit G-323 am 2026-09-02.** Bericht dort.

`[read]` **Beides betrifft denselben Editor** — G-323 tauscht die
Suche, G-325 die Zutatenliste darunter.

### Die Zeile

    Haehnchen Brustfilet, roh   [440] g   480 kcal  ..P  ..F  ..C  [X]

`[read]` **Menge schmal, Makros daneben, aus der eingegebenen Menge
gerechnet.**

`[cmd]` **`menge-rechnen.ts` rechnet es bereits** — dieselbe Datei
wie im Suchmodal, **gegen `food_nutrient_snapshot()` geprueft.**

`[read]` **Es fehlt nur die Anzeige.**

### Und die Werte aendern sich beim Tippen

`[read]` **Wer 440 auf 300 setzt, sieht sofort, was das kostet.**
`[cmd]` **Ohne Rundreise** — die Rechnung ist linear, G-320 hat es
belegt.

### Nachweis

    je Zutat         Menge und vier Makros
    Menge aendern    die Werte der Zeile aendern sich
    Summe            bleibt die Summe der Zeilen
    Bildschirmfoto   vorher / nachher

## Abnahme

**2026-09-02, mit G-323 abgenommen: gebaut.**

`[cmd]` **Je Zutat Menge und vier Makros, aus der eingegebenen Menge
gerechnet.** `[cmd]` **80 auf 300 g: 1.044 kcal, 39,7 P, 20,0 F,
159,9 C** — gegen `food_nutrient_snapshot` geprueft, exakt.

`[read]` **Und zwei Befunde kamen erst beim Messen:** der Leseweg
lieferte je Zutat keine Naehrwerte, **und `.v2-feld` setzt `flex: 1`,
weshalb das schmale Feld 262 px breit war.**
