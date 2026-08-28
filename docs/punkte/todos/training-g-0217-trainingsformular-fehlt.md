---
nr: G-217
typ: feature
modul: training
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-216
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/training/sitzung-write.ts
    - apps/web/src/app/v2/training
zahlen: null
---

# G-217 — der Trainings-Schreibweg hat keine Oberflaeche

## Befund

Aus G-216, 2026-08-28.

`[read]` **Der Schreibweg ist gebaut und geprueft** — Sitzung
anlegen, Uebung hinzufuegen, Saetze eintragen, abschliessen, mit
Waechter je Tabelle und Rueckbau. `[read]` **Es fehlt das Formular.**

`[cmd]` Der Bildschirm zeigt im Verlaufsreiter eine Attrappe *,,Add
to session"*, **die genau den fehlenden Weg markiert.**

`[read]` **Zweimal an einem Tag habe ich in einem Auftrag ein
Bildschirmfoto verlangt, wo ein Schreibweg gebaut wurde** — bei
G-122 und G-216. **Der Fehler ist meiner, nicht der der Arbeit:** ein
Schreibweg ist kein Bild.

## Was zu tun ist

**Das Formular auf den vorhandenen Schreibweg setzen.** `[read]` Der
Baum entsteht schrittweise — **jemand faengt an, traegt zwischendurch
ein, hoert auf.** Die Oberflaeche muss das aushalten, nicht nur den
abgeschlossenen Fall.

`[cmd]` **Der offene Zustand existiert im Schema** (`active` mit
`ended_time IS NULL`) **und ist im Bestand unbenutzt: 0 von 66.**
`[read]` **Er wird erst durch das Formular entstehen** — und dann
sofort haeufig.
