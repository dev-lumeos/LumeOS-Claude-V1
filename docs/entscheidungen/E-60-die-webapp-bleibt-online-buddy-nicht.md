---
nr: E-60
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-170, E-37, E-50]
modul: quer
---

# E-60 — die Webapp bleibt online, Buddy nicht

## Entscheidung

Tom, 2026-09-02, zu C-170:

> das eine ist diese webapp oder coach plattform oder marketplace und
> das andere ist der zukuenftige buddy als app

## Was gilt

    apps/web        online, ohne Vorbehalt
    apps/coach      online
    Marktplatz      online (E-37, zurueckgestellt)
    Buddy           spaeter, als eigene App -- dort gehoert es hin

`[read]` **Eine Webapp offline zu machen ist Arbeit fuer nichts.**
**Wer am Rechner sitzt, hat Netz.** **Der Coach am Schreibtisch, der
Marktplatz beim Kaufen — alle online.**

`[read]` **Buddy ist der andere Fall:** **er laeuft am Handy, und die
Erfassung passiert dort, wo es kein Netz gibt** — im
Fitnessstudio-Keller, im Flugzeug, beim Essen unterwegs.

## Der Befund, den es aufloest

`[cmd]` **C-170, gemessen 2026-09-02:** kein IndexedDB-Einsatz, keine
Outbox, kein Sync, keine Konfliktaufloesung.

`[read]` **Das Problem war nicht, dass es fehlt** — **sondern dass
der Entwurf im Bestand stand, als waere er geplant.** `[read]` **Ein
Agent, der ihn liest, haelt ihn fuer eine Aufgabe.**

`[read]` **Das ist keine Zurueckstellung, sondern eine
Entscheidung:** **`apps/web` bekommt keinen Offline-Betrieb, auch
spaeter nicht.**

## Und fuer Buddy gilt E-50

`[read]` **Die Struktur steht vor dem Erzeuger.**

`[read]` **Wenn Buddy eine Spalte braeuchte** — einen
Erfassungszeitpunkt vom Geraet, eine Quellenkennung — **entsteht sie
jetzt, nicht wenn Buddy sie fuellt.**

`[cmd]` **Und die gibt es zum Teil schon:** `meals.entry_source`,
`entry_date` getrennt von `created_at`.

`[read]` **Wer offline erfasst, hat zwei verschiedene Zeiten** —
**wann er gegessen hat und wann die Zeile ankam.** **Die Tabelle kann
das bereits.**

`[read]` **Was fehlt, ist die Konfliktfrage:** **zwei Geraete, dieselbe
Mahlzeit.** `[cmd]` **Sie gehoert zu Buddy, nicht hierher** — **aber
sie ist beim Buddy-Entwurf zu beantworten, nicht dann erst zu
entdecken.**

## Die Grenze

`[cmd]` **`apps/web` und Buddy teilen die Datenbank, nicht die
Oberflaeche.**

`[read]` **Was Buddy offline loest, wird nicht in `apps/web`
geloest** — **und was hier an Struktur entsteht, steht Buddy zur
Verfuegung.**
