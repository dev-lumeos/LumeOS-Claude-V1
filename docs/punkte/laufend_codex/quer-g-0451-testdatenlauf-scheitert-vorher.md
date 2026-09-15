---
nr: G-451
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-493
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-08
---

# G-451 — der Testdatenlauf scheitert vor C-493

## Befund

Aus C-493, Codex, 2026-09-08:

> *,,Der allgemeine Testdatenlauf scheitert schon VOR C-493
transaktional an bestehenden Fremdbefunden:
`shopping_lists_source_target_check`, danach ein
`recovery.score_contributions`-Duplikat."*

`[read]` **Er hat sie nicht angefasst** ? **ausserhalb seines
Auftrags.**

## Was das bedeutet

`[cmd]` **`testdaten-einspielen.ts` laeuft transaktional** ?
**ein Fehler in Eintrag 3 verhindert Eintrag 24.**

`[read]` **C-493 wurde deshalb einzeln geprueft** ? **der
vollstaendige Lauf kommt nie dort an.**

## Zwei Fehler, einzeln

**1** ? `shopping_lists_source_target_check`

`[cmd]` **Ein CHECK auf `nutrition.shopping_lists`** ? **miss,
welche Zeile ihn verletzt.**

**2** ? **`recovery.score_contributions`-Duplikat**

`[cmd]` **Ein eindeutiger Schluessel wird zweimal
geschrieben** ? **miss, von welchen zwei Eintraegen.**

## Warum es zaehlt

`[read]` **Der Testdatenpfad ist der einzige Weg, ein frisches
Konto zu fuellen.**

`[cmd]` **Solange er faellt, kann niemand pruefen, ob ein
Frischaufbau die Karte fuellt.**

