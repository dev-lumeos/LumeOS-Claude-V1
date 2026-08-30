---
nr: C-353
typ: messung
modul: nutrition
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-273
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: be998f73
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-08-30
  today_kalt_ms: 2993
  today_warm_ms: 2531
  erwartete_ersparnis_ms: 895
---

# C-353 — die erwartete Ersparnis tritt nicht ein

## Befund

Aus G-273, Claude Code, 2026-08-30.

`[cmd]` **Die Umstellung auf die zaehlende Funktion spart keine
messbare Zeit.** today 2.993 / 2.531 ms, intel 2.889 / 2.500 ms.

`[cmd]` **Die Begruendung fuer C-348 war rund 895 ms fuer 8,3 MB
`jsonb`**, die uebertragen und dann auf zehn Flags reduziert wurden.

`[read]` **Weniger Uebertragung ist fuer sich richtig** — die
Umstellung bleibt. **Die Frage ist, wo die Zeit tatsaechlich liegt.**

## Was dagegen spricht, es auf sich beruhen zu lassen

`[cmd]` **Der Reiter stand am 30.08. frueh bei 6.898 ms und steht
jetzt bei 2.993.** `[read]` **Irgendetwas hat die 3.900 ms
gebracht** — **und wenn es nicht die Uebertragung war, ist die
Ursache noch unbenannt.**

`[cmd]` **G-252 hat die Seitenkosten gefunden:** dreizehn Seiten zu
je 238 ms, weil `OFFSET` jedes Mal neu sortiert. **Vielleicht war das
schon alles.**

`[read]` **Eine Messung, die den Unterschied erklaert, ist mehr wert
als eine weitere Optimierung** — dieselbe Lehre wie in G-252, wo
fuenf Kandidaten falsch waren.

## Auftrag

**Mitbeauftragt mit C-177 am 2026-08-30.** `[read]` **Bericht in die
C-177-Datei.**

### Warum es dazugehoert

`[read]` **Du hast in G-273 gemessen, dass die Umstellung keine Zeit
spart** — und es gemeldet, statt die Zahl passend zu machen.

`[cmd]` **Der Reiter stand am 30.08. frueh bei 6.898 ms und steht
jetzt bei 2.993.** `[read]` **Irgendetwas hat die 3.900 ms
gebracht** — **und wenn es nicht die Uebertragung war, ist die
Ursache unbenannt.**

`[cmd]` **G-252 hat die Seitenkosten gefunden:** dreizehn Seiten zu je
238 ms, weil `OFFSET` jedes Mal neu sortiert. **Vielleicht war das
schon alles.**

### Was zu tun ist

**Eine Messung, die den Unterschied erklaert.**

`[read]` **Nicht optimieren** — erklaeren. `[read]` **Dieselbe Lehre
wie in G-252, wo fuenf meiner Kandidaten falsch waren und die Ursache
auf keinem stand.**

`[read]` **Und *,,unklar"* ist eine zulaessige Antwort**, wenn sie
sagt, was ausgeschlossen wurde.

### Nachweis

    heute                ms je Fenster, kalt und warm
    ohne die Umstellung  dieselbe Messung, Funktion abgeschaltet
    Differenz            erklaert oder als unklar gemeldet
    G-252-Anteil         wie viel kam von den Seitenkosten?

## Abnahme

**2026-08-30, mit C-177 abgenommen. Die Praemisse war meine.**

`[cmd]` **6.898 ms war `nutrition` Nutrients, 2.993 ms war
`supplements` Today** — **zwei verschiedene Reiter.**

`[read]` **Es gab nie einen Sturz um 3.900 ms.** **Der Punkt hat eine
Zahl erklaert, die ich erfunden hatte, indem ich zwei Messungen
verglich, die nichts miteinander zu tun hatten.**

`[cmd]` **Die 6.730 ms sind trotzdem aufgeklaert:** 2.148 ms
Datenbank, ~1.620 ms HTML durch die Sparkline. **Als C-356 bleibt,
wie sich die 1.620 ms aufteilen.**
