---
nr: C-253
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: C-252
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-253 - Die IDs der beiden Kataloge sind nicht vergleichbar — drei Stellen haetten stumm nie mehr getroffen

## Befund

(neu 2026-08-23). Aus
  C-252.

  `[cmd]` **Alte Katalog-ID ist `text`, neue ist `uuid`.** Nach der
  Umstellung haetten **drei Stellen nie mehr getroffen**:
  Stack-Anker, Add-Knopf, Detailkopf.

  `[cmd]` **`slug` ist die alte ID** und bei allen 566 identisch —
  darueber ist die Bruecke sauber. Ueber den Namen waeren **26
  mehrdeutig** gewesen.

  `[cmd]` **Live haengt heute nichts daran:** 0 von 11 `stack_items`
  tragen einen Anker. **Genau deshalb ist der Fund wertvoll** — der
  Fehler waere erst in Wochen aufgefallen, bei einem Nutzer und nicht
  bei einem Test.

  `[read]` **Claude Code hat ihn ohne Auftrag gefunden und gemeldet.**
  Er stand in keiner Vorgabe.

  `[read]` **Das ist A-50 in einer Form, die keine bestehende Pruefung
  findet** — nicht eine geloeschte Spalte, sondern zwei Spalten
  gleichen Namens mit unvergleichbarem Typ. **Zu tun:** eine
  Gate-Pruefung, die Anker- und Verweisfelder gegen den Typ der
  Zielspalte haelt. Ohne sie ist die Lehre wieder nur notiert.
