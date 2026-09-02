---
nr: A-68
typ: befund
modul: quer
schwere: niedrig
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: null
agent: null
erledigt: 2026-09-02
commit: OFFEN
beruehrt:
  dateien:
    - tools/punkte-pruefen.mjs
zahlen:
  gemessen: 2026-09-02
---

# A-68 — der Waechter fuer leerlaufende Agenten

## Befund

Tom, 2026-09-02, dreimal an einem Tag: *,,und wieder vergessen den
neuen auftrag zu geben."*

`[read]` **Der Orchestrator nimmt einen Bericht ab, bevor er den
naechsten Auftrag rausgibt** — **und der Agent steht solange
still.**

`[cmd]` **`punkte-pruefen.mjs` zaehlte bereits, was in `next/`
liegt** — **aber niemand fragte den Zaehler, wenn ein Agent frei
wurde.**

## Was gebaut wurde

`[cmd]` **Eine Zeile in `punkte-pruefen.mjs`:** wenn ein Agent
**null laufende Punkte** hat und **mindestens einen in `next/`**,
erscheint

    [punkte] ACHTUNG: codex hat nichts laufen, aber 3 Punkt(e)
    in next/ - der Auftrag geht raus, bevor abgenommen wird.

`[read]` **Sie steht dort, wo der Orchestrator ohnehin hinsieht** —
**der Punktelauf gehoert zu jedem Zyklus.**

## Abnahme

**2026-09-02, in beide Richtungen belegt.**

    2 laufend, 3 in next   keine Warnung   -- richtig
    0 laufend, 3 in next   Warnung         -- richtig
    zurueckgebaut          keine Warnung   -- richtig

`[read]` **Die erste Gegenprobe war falsch aufgesetzt** — sie
verschob einen Punkt aus `next/` nach `laufend`, **wodurch die
Warnung ausbleiben MUSSTE.** `[read]` **Erst als die laufenden
weggenommen wurden, war die Bedingung erfuellt.**

`[read]` **Und das ist selbst ein Beleg:** **eine Pruefung, die nicht
rot wird, kann am Versuchsaufbau liegen** — nicht nur am Waechter.
