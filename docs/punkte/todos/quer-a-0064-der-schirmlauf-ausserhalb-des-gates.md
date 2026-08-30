---
nr: A-64
typ: entscheidung
modul: quer
schwere: niedrig
angelegt: 2026-08-30
braucht: []
kind_von: A-29
entscheidung: null
beruehrt:
  dateien: [tools/schuss.mjs]
zahlen:
  gemessen: 2026-08-30
  ms_je_schuss: 11700
  alle_reiter_min: 7.8
  gate_min: 1
---

# A-64 — der Schirmlauf ausserhalb des Gates

## Befund

Aus A-29, Claude Code, 2026-08-30.

`[cmd]` **Ein Schirmlauf ueber alle Reiter kostet 7,8 Minuten, der
ganze uebrige Gate etwa eine.** `[cmd]` **Und er braucht Server,
Datenbank, Anmeldung und Chromium** — **alle 20 Gate-Schritte sind
reine Dateipruefungen.**

`[read]` **Deshalb gehoert er nicht in den Gate.** `[cmd]` **Aber er
funktioniert und ist stabil:** dieselbe Route fuenfmal, `attrappen=2`
jedes Mal.

## Die Frage

**Soll er woanders laufen?**

`[read]` **Dafuer spricht: er ist die einzige belastbare
Attrappenzahl.** `[cmd]` **Eine Quelltextzahl kann nicht richtig
sein** — `tabs.tsx` traegt 17 Marken und zeigt 1 / 7 / 1, je nach
offenem Reiter.

`[read]` **Dagegen: was nicht im Gate laeuft, laeuft irgendwann gar
nicht.** `[cmd]` **`LAUFEND.md` ist genau daran gestorben.**

`[read]` **Ein Mittelweg waere, ihn auf Zuruf zu behalten** — er wird
in jedem UI-Auftrag ohnehin verlangt, **und die Zahl steht dann im
Bericht statt in einem Lauf, den niemand ansieht.**
