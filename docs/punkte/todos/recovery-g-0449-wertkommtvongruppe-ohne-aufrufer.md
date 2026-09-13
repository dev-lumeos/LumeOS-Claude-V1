---
nr: G-449
typ: befund
modul: recovery
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-446
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/koerper/schluessel-gruppe.ts
zahlen:
  gemessen: 2026-09-08
---

# G-449 — wertKommtVonGruppe hat keinen Aufrufer

## Befund

Aus G-446, Claude Code, 2026-09-08:

> *,,Ich schrieb zuerst, `wertKommtVonGruppe()` haette andere
Aufrufer. Gemessen: keinen."*

`[cmd]` **Selbst nachgemessen: fuenf Treffer im Baum** ? **vier
Kommentare, einer die Definition in
`schluessel-gruppe.ts:108`.**

`[read]` **VIERTER Fall dieser Art** ? `logPhoto` (G-421),
`messungAnlegenAktion` (G-422), `muskelwerte()` (G-441), **und
jetzt diese.**

## Und der Waechter war blind

> *,,Der Waechter blieb nur gruen, weil der NAME in meinem
eigenen Kommentar ueberlebte ? er suchte die ganze Datei
einschliesslich Kommentare."*

`[cmd]` **Behoben: Kommentare abgestreift, Wirkung geprueft.**

`[read]` **Dieselbe Falle wie in G-423 und G-438** ? **ein
Waechter liest seine eigene Begruendung.**

## Was zu entscheiden ist

`[read]` **Die Funktion loeschen oder einen Aufrufer geben?**

`[cmd]` **Sie stammt aus G-438** ? **damals hat die Ansicht die
Herkunft bestimmt, heute die Rechnung.**

`[read]` **Wenn niemand sie braucht, ist Loeschen richtig** ?
**aber erst messen, ob eine kuenftige Ansicht sie braucht.**

## Und der Sammelbefund

`[read]` **Vier tote Bauteile in vier Tagen.**

`[cmd]` **G-422 hat einen Waechter vorgeschlagen:** *,,jede
exportierte Aktion muss mindestens einen Aufrufer haben"*.

`[read]` **Er wurde nie gebaut** ? **das ist der eigentliche
Punkt.**

