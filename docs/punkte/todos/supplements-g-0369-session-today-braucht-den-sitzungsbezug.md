---
nr: G-369
typ: feature
modul: supplements
schwere: niedrig
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/kontext.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-369 — *Session today* braucht den Sitzungsbezug

## Befund

Aus G-365, Claude Code, 2026-09-07.

`[cmd]` **35 markierte Kacheln in `supplements` geprueft, keine
falsche Marke.**

`[cmd]` **Aber *Session today* auf dem Intelligenz-Reiter liesse
sich anbinden** — **sobald der Supplements-Kontext eine Sitzung
traegt.**

`[read]` **Kein falscher Vermerk** — **eine Moeglichkeit.**

## Zu tun

`[cmd]` **`training.workout_sessions` traegt die Sitzung.**

`[cmd]` **Und `training/ansicht.tsx` liest sie seit G-365** — Push 7,
heute, 17:30.

`[read]` **Der Kontext muss sie durchreichen** — **wie `verlauf` und
`readiness` im Training.**

`[read]` **Dieselbe Klasse wie A-71, aber umgekehrt:** **hier fehlt
der Leseweg wirklich, er liegt nicht ungenutzt daneben.**

## Und warum es zaehlt

`[read]` **Wer vor dem Training ein Supplement nimmt, will wissen,
wann trainiert wird.**

`[cmd]` **`intake_timing` kennt `pre_workout` und `post_workout`** —
**ohne Sitzung ist das eine Beschriftung ohne Bezug.**
