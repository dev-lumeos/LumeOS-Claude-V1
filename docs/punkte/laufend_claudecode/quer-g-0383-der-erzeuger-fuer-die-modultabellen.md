---
nr: G-383
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-382
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - tools/ssot-nachtragen.mjs
zahlen:
  gemessen: 2026-09-08
  tabellen: 167
  spalten: 2340
  neue_ungenannt: 6
---

# G-383 — der Erzeuger fuer die Modultabellen

## Befund

Aus G-382, Claude Code, 2026-09-08.

`[cmd]` **Von sechs Tabellen, die in zwei Tagen entstanden, nennt
die SSOT keine** ? **und zwei behauptet sie ausdruecklich als nicht
gebaut:**

    128-recovery-scores.md:52    overtraining_alerts
    96-recovery-checkins.md:27   recovery_protocols

`[cmd]` **Beide stehen seit C-421 live.**

`[read]` **Und sein Satz dazu ist die Lehre:**

> *,,Eine fehlende Erwaehnung laedt zum Nachsehen ein; eine
> behauptete Abwesenheit haelt davon ab."*

`[read]` **Der Suchlauf findet den Namen und haelt die Datei fuer
abgedeckt** ? **die Falschaussage verhindert ihre eigene
Entdeckung.**

## Was erzeugbar ist

`[cmd]` **Eine Abfrage deckt alle sieben Schemas:** **167 Tabellen,
2.340 Spalten.**

`[cmd]` **Vorbild: `tools/ssot-nachtragen.mjs`, 85 Zeilen, 326
Eintraege.**

**Erzeugbar, rund ein halber Tag:**

    Tabellen und Spalten je Modul
    Zeilenzahlen mit Stichtag und Konto
    CHECK-Wertelisten
    neue Tabellen seit Datum X

`[read]` **Der letzte Punkt haette diesen Auftrag selbst
beantwortet.**

**Handarbeit bleibt:**

`[read]` **Warum etwas so gebaut ist.** `[read]` **Was bewusst NICHT
gebaut wurde** ? **eine Abwesenheit hat keine Zeile, und genau da
kamen die zwei Falschaussagen her.**

`[read]` **Die Beurteilung Mockup / angebunden / verworfen.**
`[cmd]` **Und die 58 datierten Auftragsschnappschuesse** ? **die
sind Protokoll und duerfen nicht nachgezogen werden.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Den Erzeuger bauen

`[cmd]` **Nach dem Vorbild von `ssot-nachtragen.mjs`.**

`[read]` **Und seine eigene Warnung ist die Bauvorschrift:**

> *,,Ein Erzeuger, der Lese- und Schreibwege nach Dateinamen zaehlt,
> meldet fuer `goals` null Lesewege ? weil `goals` `lesen.ts` und
> `schreiben.ts` heisst statt `*-read.ts`."*

`[read]` **Also: NUR aus der Datenbank ableiten.** `[read]` **Dort
ist der Tabellenname die Sache selbst, keine Konvention.**

`[cmd]` **Eine erzeugte Zahl sieht aus wie eine gemessene** ?
**minus jemand, der sie nachprueft.**

### 2 · Die zwei Abwesenheitsbehauptungen

`[read]` **Miss, welche weiteren Dateien etwas als nicht gebaut
behaupten, das existiert.**

`[cmd]` **Dein eigener Weg: die Namen aus dem Schema gegen die
Dateien halten** ? **aber diesmal auf Verneinungen achten, nicht
auf Erwaehnungen.**

`[read]` **Melden, nicht schreiben** ? `docs/` **gehoert dem
Orchestrator.**

### Abnahmebedingungen

    A1  der Erzeuger laeuft. Zahl: Tabellen, Spalten, Module.
    A2  Gegenprobe: eine Tabelle umbenennen -> der Erzeuger
        meldet sie anders. Zurueckgebaut.
    A3  die sechs neuen Tabellen erscheinen. Belegt.
    A4  keine Zahl aus Dateinamen abgeleitet. Belegt.
    A5  weitere Abwesenheitsbehauptungen: Zahl geprueft /
        gefunden, je mit Fundstelle.
    A6  `docs/ssot/` unveraendert ausser der erzeugten Datei.

### Was nicht zu tun ist

**Keine Moduldatei umschreiben** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-435.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
