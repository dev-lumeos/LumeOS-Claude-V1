---
nr: G-469
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-467
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
  ms: 7730
---

# G-469 - 7,7 Sekunden, und die Daten sind es nicht

## Befund

Aus G-467, Claude Code, 2026-09-08:

> *,,101,1 kB -> 0,7 kB (-99 %), 9.545 -> 7.730 ms (-19 %)."*

> *,,Die DATEN fallen viel staerker als die ZEIT. Das passt zu
G-465: die Zeit haengt am Weg durch Next.js und Auth, nicht an
der Menge. Die restlichen 7,7 s liegen woanders."*

## Was schon ausgeschlossen ist

`[cmd]` **Die Datenbank: 0,2 bis 40 ms (selbst gemessen).**

`[cmd]` **Die Datenmenge: 99 % weniger, nur 19 % schneller.**

`[cmd]` **Die Anzahl Anfragen: fuenf, und sie laufen parallel
(G-465).**

`[cmd]` **Der 57-Runden-Fehler: behoben (G-465).**

`[read]` **Vier Verdaechtige gemessen und ausgeschlossen.**

## Was zu messen bleibt

`[read]` **Der Weg durch Next.js und Auth.**

    A  wie lange braucht die Anmeldung je Anfrage?
    B  laeuft sie je fetch neu oder einmal?
    C  wie viel ist Uebersetzungszeit im Dev-Server
       und faellt im Produktionsbau weg?
    D  Vergleich: wie lange braucht ein anderes Modul?

`[cmd]` **Ich habe gemessen: Heute 10,3 s, Produkte 14,5 s,
Recovery 15,3 s** ? **ueber `schuss.mjs`, inkl. Anmeldung.**

`[read]` **Recovery ist LANGSAMER als Produkte** ? **das
spricht fuer den Dev-Server, nicht fuer die Supplements.**

`[cmd]` **Tom sagt: *,,normale ui changes sind nicht
langsam"*** ? **also liegt es am ersten Aufruf je Route.**

## Der Verdacht

`[read]` **Next.js uebersetzt jede Route beim ersten Aufruf im
Entwicklungsmodus.**

`[cmd]` **MISS den Unterschied: erster gegen zweiten Aufruf
derselben Route.**

`[read]` **Wenn der zweite schnell ist, ist es der
Dev-Server** ? **und der Produktionsbau misst es endgueltig.**

`[cmd]` **`pnpm gate` baut nach `.next-gate`** ? **dort laesst
es sich messen, ohne den Dev-Server anzufassen.**

## Abnahmebedingungen

    A1  erster gegen zweiten Aufruf. Zahl.
    A2  Dev-Server gegen Produktionsbau. Zahl.
    A3  je Abschnitt: Anmeldung, Uebersetzung, Daten.
        TABELLE.
    A4  wenn es der Dev-Server ist: GEMELDET, nicht
        wegoptimiert.
    A5  wenn nicht: die Ursache benannt.
    A6  NIE .next loeschen, nie next build direkt.
