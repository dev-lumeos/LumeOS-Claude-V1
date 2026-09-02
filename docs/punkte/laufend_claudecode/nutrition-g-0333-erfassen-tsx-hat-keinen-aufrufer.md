---
nr: G-333
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-02
braucht: []
kind_von: G-331
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/erfassen-modal.tsx
zahlen:
  gemessen: 2026-09-02
  zeilen: 477
  aufrufer: 0
---

# G-333 — `erfassen.tsx` hat keinen Aufrufer

## Befund

Aus G-331, Claude Code, 2026-09-02.

`[cmd]` **477 Zeilen, `export function Erfassen`, kein Aufrufer.**
`[cmd]` **Zuletzt geaendert am 16.08.**

`[cmd]` **Nachgemessen: nur `erfassen-modal.tsx` wird importiert** —
**eine andere Datei, die benutzt wird** (G-272).

## Was zu entscheiden ist

`[read]` **Loeschen, oder stehen lassen?**

`[cmd]` **Ihr fehlen alle acht Suchlehren** — Entprellen, Abbruch,
Vorlieben, Seitensortierung, Tags, Herkunft, Erstlauf.

`[read]` **Wer sie je wieder anschliesst, bekommt die schlechteste
Suche im Modul.**

`[cmd]` **Ein Waechter faengt es ab, wenn sie einen Aufrufer
bekommt** — dann gehoert sie auf den Hook.

`[read]` **A-59 sagt: geloescht, nicht auskommentiert.** `[read]`
**Aber 477 Zeilen zu loeschen heisst, eine Arbeit wegzuwerfen, die
jemand gemacht hat** — **deshalb eine Entscheidung, kein Auftrag.**

## Auftrag

**Mitbeauftragt mit G-341 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.