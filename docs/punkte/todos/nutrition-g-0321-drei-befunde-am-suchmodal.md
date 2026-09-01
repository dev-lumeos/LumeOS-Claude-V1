---
nr: G-321
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-320
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/food-such-modal.tsx
zahlen: null
---

# G-321 — drei Befunde am Suchmodal

## Befund

Tom, 2026-09-02, am Schirm: *,,die suche ist ungluecklich gemacht, da
ist nicht klar dass man zuerst den suchen button klicken muss. das
modal muss bewegbar werden und es hat einen spaltenfehler drin."*

### 1 · Der Suchknopf ist nicht erkennbar

`[cmd]` **Im Bild steht im Feld *,,— noch keines gewaehlt"* und
daneben ein Knopf *Suchen*.**

`[read]` **Wer tippt, erwartet Treffer.** `[cmd]` **Und das Modal
selbst sucht beim Tippen** — Entprellen ist im Hook.

`[read]` **Der Widerspruch liegt zwischen dem Auswahlfeld im Planner
und dem Modal darueber:** **das Feld sieht aus wie eine Eingabe, ist
aber ein Oeffner.**

### 2 · Das Modal ist nicht bewegbar

`[cmd]` **Es liegt fest ueber dem Raster.** `[read]` **Wer pruefen
will, was der Tag schon traegt, sieht es nicht** — **obwohl das Modal
die Tagessumme kennt.**

### 3 · Der Spaltenfehler

`[cmd]` **Am Bild: die Kopfzeile *Name Quelle kcal P C F* steht in
der Mitte der Liste, nicht oben.** `[cmd]` **Und die Werte stehen
ohne Trennung: *79 1.3 15.9 0.4*.**

`[read]` **Die Kopfzeile ist von der Liste abgeloest** — sie
scrollt nicht mit, sondern steht an einer festen Stelle im Fluss.
