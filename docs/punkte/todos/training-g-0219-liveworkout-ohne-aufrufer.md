---
nr: G-219
typ: entscheidung
modul: training
schwere: niedrig
angelegt: 2026-08-28
braucht: []
kind_von: G-217
entscheidung: null
beruehrt:
  dateien: [apps/web/src/app/v2/training/ansicht.tsx]
zahlen: null
---

# G-219 — `LiveWorkout` hat keinen Aufrufer mehr

## Befund

`[cmd]` Aus G-217: `LiveWorkout` steht in `ansicht.tsx:966`, **ohne
Aufrufer.** Das Formular aus G-217 hat ihn ersetzt.

`[read]` **Claude Code hat ihn absichtlich stehengelassen und es
gesagt** — er zeigt die Zielgestalt: Pausenuhr, PR-Marke,
Zielvorgabe. **Dinge, die das Formular nicht hat und die jemand
gedacht hat.**

## Die Entscheidung

`[read]` **Der G-163-Beschluss sagt: Rueckfallfassungen bleiben nicht
als Notfallanzeige stehen.** `[read]` **Aber das hier ist keine
Rueckfallfassung, sondern ein Entwurf** — und in G-189 hat sich
gezeigt, was passiert, wenn man einen toten Zweig ersatzlos entfernt,
der nebenbei etwas trug.

**Zwei Wege:**

**Entfernen** und die Zielgestalt als Punkt festhalten. `[read]`
Sauber, aber die Gestalt ist dann Text statt Code.

**Stehenlassen**, mit einem Kommentar, der sagt, dass er kein
Aufrufer hat und warum er bleibt. `[read]` **Dann muss der
Attrappenzaehler ihn kennen**, sonst faellt er beim naechsten Zaehlen
wieder auf.

`[read]` **Kein Fall fuer einen Agenten** — es ist eine Frage, wie
lange ein Entwurf im Code stehen darf.
