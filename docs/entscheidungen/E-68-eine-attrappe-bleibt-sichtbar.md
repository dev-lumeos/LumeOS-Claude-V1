---
nr: E-68
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-355, G-358, A-59]
modul: quer
---

# E-68 — eine Attrappe bleibt sichtbar und sagt, worauf sie wartet

## Entscheidung

Tom, 2026-09-07:

> es ist mir scheiss egal was fuer ausreden er hat. nicht angebunden
> heisst es bleibt als attrappe in der ui visible

> wir binden mockups an; was nicht anbindbar ist bleibt in der ui
> als mockup deklariert, genau aus dem grund dass nichts
> verschwindet und keiner mehr weiss um was es geht

## Was gilt

**Eine Sache aus dem Mockup verschwindet nie aus der Oberflaeche.**

`[read]` **Nicht anbindbar ist kein Grund zum Weglassen** — **es ist
ein Grund zum Kennzeichnen.**

`[read]` **Wer etwas herausnimmt, weil es noch nicht geht, loescht
das Wissen darueber, dass es geplant war.**

## Und der Vermerk sagt, worauf er wartet

`[cmd]` **Gemessen 2026-09-07 (G-355): 69 Attrappen-Vermerke in
`v2/goals`, 62 nennen keine Ursache.**

`[read]` **Die Sichtbarkeit war also da** — **die Begruendung
nicht.**

**Die Form:**

    // Attrappe -- SPEC_08 Flow 3
    //   wartet auf: goal_phases-Schreibweg (G-357)

`[read]` **Quelle und Grund.** `[read]` **Wo der Grund unbekannt
ist, gehoert das hin:** **`wartet auf: unbekannt, nie untersucht`
ist ehrlicher als nichts.**

## Warum die Begruendung zaehlt

`[cmd]` **`modale.tsx:13` behauptete, es gebe weder
`goals.user_goals` noch `goals.body_measurements`** — **beide gibt
es, mit 23 und 17 Spalten** (G-354).

`[cmd]` **Und dreimal am selben Tag stand in einem
`InEntwicklungKnopf` ein Grund, der nicht mehr galt.**

`[read]` **Ein Vermerk ohne Grund wird zur Ausrede.** `[read]` **Ein
Vermerk mit falschem Grund ist schlimmer** — **er wird beim
naechsten Auftrag zitiert.**

## Was daraus folgt

`[read]` **Ein Vermerk, dessen Grund weggefallen ist, ist ein
Befund** — **kein Zustand.**

`[cmd]` **A-59 bleibt gueltig: toter Code wird geloescht, nicht
auskommentiert.**

`[read]` **Der Unterschied: toter Code hatte nie einen Zweck.**
**Eine Attrappe hat einen, der noch nicht erreicht ist.**
