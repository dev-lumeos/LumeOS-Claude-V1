---
nr: E-72
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [E-68, E-69, G-365, C-241]
modul: quer
---

# E-72 — anbinden heisst mit Daten

## Entscheidung

Tom, 2026-09-07:

> wenn wir was anbinden sollen auch daten dafuer da sein um es
> anzuzeigen und nicht einfach verschwinden und jeder vergisst es

## Was gilt

**Eine angebundene Kachel ohne Daten ist schlimmer als eine
Attrappe.**

`[cmd]` **Gemessen 2026-09-07, Supplements-Heute:**
**`TODAY'S ADHERENCE 0 / 9`, `TAKEN 0`.**

`[read]` **Die Anbindung steht, der Bestand fehlt** — **und die
Kachel zeigt Null.**

`[read]` **Eine Attrappe sagt *,,noch nicht angebunden"*.** **Eine
leere Kachel sagt nichts** — **sie sieht aus wie ein Ergebnis.**

## Drei Zustaende, nicht zwei

    angebunden mit Daten     zeigt Werte
    angebunden ohne Daten    zeigt einen Leerhinweis, benannt
    Attrappe                 zeigt Entwurfswerte, gekennzeichnet

`[read]` **Der mittlere Fall braucht einen eigenen Hinweis:**
**nicht *,,0 von 9"*, sondern *,,keine Einnahmen erfasst"*.**

## Und der Seed traegt die Daten

`[cmd]` **C-241 hat `test-user` einen Grundbestand gegeben** —
Slots, Plaene, Mahlzeiten, Vorlieben, 90 Einnahmen.

`[read]` **Wer eine Kachel anbindet, prueft, ob der Seed sie
fuellt** — **sonst ist sie nach dem Anbinden leer, und niemand
merkt es.**

`[cmd]` **Und `dev@lumeos.app` traegt echte Daten** — **eine Kachel,
die dort leer bleibt, ist ein Befund.**

## Was daraus folgt

`[read]` **Zu jedem Anbindeauftrag gehoert die Frage: liegen Daten
vor?**

`[read]` **Wenn nein, ist der Seed Teil des Auftrags** — **oder die
Kachel bleibt Attrappe, bis er steht.**

`[read]` **Was nicht geht: anbinden und leer lassen.**
