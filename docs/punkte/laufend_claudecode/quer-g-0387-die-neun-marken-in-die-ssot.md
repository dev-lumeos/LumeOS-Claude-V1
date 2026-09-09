---
nr: G-387
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-386
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  marken: 9
  ssot_marken: 0
---

# G-387 — die neun Marken in die SSOT

## Befund

Aus G-386, Claude Code, 2026-09-08.

`[cmd]` **`docs/ssot/**/*.md` steht in der Liste,
`abwesenheit-pruefen.mjs:54`.**

`[cmd]` **Aber die neun Marken kamen in `docs/spezifikation/` und
Punktdateien** ? **keine einzige in `docs/ssot/`.**

`[read]` **Der Waechter liest den Ordner und findet nichts.**

`[cmd]` **Und sein A5-Fund:** `128-recovery-scores.md:52`
**behauptet weiterhin, `overtraining_alerts` sei nicht gebaut.**

`[read]` **Die Berichtigung des Orchestrators steht DARUEBER, nicht
STATT der Aussage** ? **wer den Absatz liest und den Nachtrag
ueberspringt, glaubt weiter das Falsche.**

`[cmd]` **Der Orchestrator hat das berichtigt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Marken dorthin, wo die Aussagen stehen

`[read]` **Miss, welche `docs/ssot/`-Dateien eine Abwesenheit
behaupten** ? **du hast sie in G-384 schon gefunden.**

`[cmd]` **Und setz die Marken dort** ? **nicht in
`docs/spezifikation/`.**

`[read]` **Eine Marke gehoert an die Aussage, die sie sichert** ?
**sonst faellt der Waechter an der falschen Stelle.**

### 2 · Die Herkunftszeile

`[read]` **Dein eigener Vorschlag:** *,,eine `@quelle`-Zeile, die
den Punkt nennt, aus dem die Aussage stammt."*

`[read]` **Miss, ob der Waechter sie tragen kann** ? **und ob sie
sich aus den Punktdateien ableiten liesse.**

`[cmd]` **`erledigt/` traegt `commit:` je Punkt** ? **eine Aussage
mit Punktnummer waere rueckverfolgbar.**

### 3 · Die vier verbleibenden Kandidaten

`[cmd]` **Aus A1: 30 geprueft, 9 gesichert, 5 falsch** ? **bleiben
16.**

`[read]` **Miss, welche davon eine Marke braeuchten und welche
nicht** ? **und warum.**

### Abnahmebedingungen

    A1  Marken in docs/ssot/: Zahl, je Datei und Zeile.
    A2  der Waechter faellt, wenn eine davon entsteht.
        Gegenprobe belegt.
    A3  die Herkunftszeile: machbar? Mit Aufwand.
    A4  16 verbleibende: je Satz, Marke noetig oder nicht.
    A5  Gate gruen nach allen Aenderungen.

### Was nicht zu tun ist

**Nur Marken und Herkunftszeilen** ? **kein Fliesstext.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-428.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
