---
nr: E-88
typ: entscheidung
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-117
entscheidung: null
erledigt: 2026-09-08
commit: entschieden
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/mockup-referenz.tsx
zahlen:
  gemessen: 2026-09-08
---

# E-88 - die Entwurfsreferenz zeigt PED-Protokolle ohne Gradpruefung

## Der Befund

Aus G-117, Claude Code, 2026-09-08:

> *,,Der vierte Weg ist offen und gehoert dir.
`mockup-referenz.tsx` zeigt unter der Trennlinie dieselben
Wirkstoffe mit DOSIS und SCHEMA ? fuer jeden, ohne
Gradpruefung."*

> *,,Isolationsprobe: haengt man sie aus, verschwindet
`physician-supervised` aus dem Manifest ? sie ist die URSACHE,
kein Rest."*

`[cmd]` **Selbst nachgemessen, im Chunk
`page-ef08b4bb9df16c11.js`, 315 KB:**

    ReferenzTrenner        JA
    Mockup-Marken          6 von 6
    physician-supervised   JA
    EXTENDED_STACK         nein

`[read]` **Der Extended-Code ist draussen, die Referenz nicht.**

## Warum es eine Entscheidung ist

`[cmd]` **E-68 und E-70: die Entwurfsreferenzen bleiben
stehen, bis ein Modul fertig ist** ? **sie sind der Massstab,
gegen den gebaut wird.**

`[read]` **Aber sie liegen UNTER der Trennlinie im laufenden
Betrieb, nicht in einer Werkstatt.**

`[read]` **Und es geht nicht um Kacheln, sondern um
PED-Protokolle mit Dosis und Schema ? fuer jeden Besucher.**

## Drei Wege

**a** ? **die Referenz hinter dieselbe Gradpruefung.**

`[read]` **Sie bleibt als Massstab, aber nur fuer den, der
Extended ohnehin sieht.**

**b** ? **die Referenz aus dem Buendel, wie der Reiter.**

`[cmd]` **Dasselbe `dynamic`, das G-117 benutzt hat.**

**c** ? **die Referenz stehen lassen.**

`[read]` **Dann ist die Arbeit aus G-117 halb** ? **der Code
ist drin, nur an anderer Stelle.**

## Und eine zweite Frage

Tom, in G-118: *,,Es geht um PED-Protokolle ? die Frage ist
nicht rein technisch."*

`[read]` **Wer entscheidet, dass der Code nicht zum Browser
soll, entscheidet auch ueber die Referenz.**

## Entschieden, 2026-09-08, Orchestrator

Tom, zum wiederholten Vorlegen: *,,und was willst du nun von
mir?"*

`[read]` **Zu Recht** ? **die Entscheidung folgt aus zwei
Saetzen, die schon stehen.**

### Weg a: die Referenz hinter dieselbe Gradpruefung

`[read]` **Sie zeigt Extended-INHALT, also folgt sie Extendeds
Regel.**

`[cmd]` **E-68 und E-70 sagen: die Entwurfsreferenz bleibt
stehen, bis ein Modul fertig ist** ? **sie sagen NICHT, dass
jeder sie sehen muss.**

`[read]` **Als Massstab taugt sie weiter: wer Extended baut,
hat den Grad.**

### Warum nicht b oder c

`[read]` **b (nur aus dem Buendel) laedt den Chunk beim
Oeffnen nach** ? **die Dosis steht dann trotzdem im Browser,
nur spaeter.**

`[read]` **c laesst G-117 halb** ? **der Code ist drin, nur an
anderer Stelle.**

`[cmd]` **Und a bringt b mit: hinter dem Gate faellt der Chunk
fuer alle ohne Grad ohnehin weg.**

### Umsetzung als G-499

