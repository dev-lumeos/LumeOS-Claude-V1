---
nr: G-53
typ: entscheidung
modul: supplements
schwere: mittel
angelegt: 2026-08-18
braucht: []
kind_von: G-45
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: c3cd8fe5
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-53 - `InjektionsKarte` in `packages/ui` hat keinen Aufrufer

## Befund

(neu 2026-08-18). Befund aus G-45.

  `[cmd]` **Gebaut und exportiert in G-26, von keinem Tab gerufen.** Die
  Supplements-Karte wurde nach Toms Entscheidung **im Modul** gebaut,
  weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
  hat.

  `[read]` **Nicht loeschen, aber entscheiden:** entweder sie bekommt
  die fehlenden Felder und den Injections-Tab als Aufrufer, **oder sie
  faellt weg.** Ein Baustein ohne Aufrufer wird beim naechsten Mal ein
  zweites Mal gebaut — **das ist bereits passiert.**

## Auftrag

**Mitbeauftragt mit G-388 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-08, mit G-388 abgenommen.**

`[cmd]` **`InjektionsKarte` hat jetzt einen Aufrufer** ? **die
Rotationskarte in `tab-injektionen.tsx`.**

`[cmd]` **Und die lokale Zweitzeichnung ist entfernt: 563 -> 513
Zeilen.**
