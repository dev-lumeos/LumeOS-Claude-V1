---
nr: G-471
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-470
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/components/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-471 - der Browserreiter stuerzt im Produktionsbau ab

## Befund

Aus G-470, Claude Code, 2026-09-08:

> *,,Der Browserreiter stuerzt auf `/v2/*` im Produktionsbau ab
? Serverprotokoll LEER, HTTP 200, voller Inhalt. Rein
clientseitig, war bisher vom `document`-Fehler VERDECKT."*

`[read]` **Der Server liefert richtig, der Browser faellt
danach um.**

`[read]` **Und es war unsichtbar, solange der
`document`-Fehler frueher zuschlug** ? **ein Fehler hinter
einem Fehler, wie in G-461 und G-465.**

## Warum es zaehlt

`[cmd]` **G-470 hat den Produktionsbau anmeldefaehig
gemacht** ? **jetzt kommt man weit genug, um den naechsten
Fehler zu sehen.**

`[read]` **HTTP 200 mit vollem Inhalt und trotzdem ein toter
Reiter: die Waechter sehen es nicht, weil sie die Antwort
pruefen, nicht den Browser.**

## Was zu messen ist

    A  was steht in der Browserkonsole?
    B  welche Route stuerzt, welche nicht?
    C  ist es dieselbe Ursache wie G-470 (ein
       Browser-Objekt), nur andersherum?
    D  faellt schuss.mjs darauf? Es zaehlt
       Konsolenfehler.

`[cmd]` **`schuss.mjs` meldet Konsolenfehler** ? **miss, ob es
im Produktionsbau laeuft.**

## Abnahmebedingungen

    A1  die Ausnahme im Browser, mit Stapel.
    A2  welche Routen betroffen? TABELLE.
    A3  behoben, und der Reiter bleibt stehen.
    A4  ein Waechter, der es faengt. Sabotageprobe.
    A5  Gegenprobe: der Dev-Server bleibt unveraendert.
    A6  NIE .next loeschen, nie next build direkt.
