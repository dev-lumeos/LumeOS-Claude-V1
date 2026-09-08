---
nr: G-382
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-381
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - tools/ssot-nachtragen.mjs
zahlen:
  gemessen: 2026-09-08
  geprueft: 156
  falsche_bezeichner: 5
---

# G-382 — fuenf SSOT-Dateien inhaltlich pruefen

## Befund

Aus G-381, Claude Code, 2026-09-08.

`[cmd]` **156 Dateien geprueft, 32 Verdachtsfaelle, nach Einordnung
5 echte:**

    10-workspace.md
    30-datenbank.md
    32-encoding-schaeden.md
    83-dashboard.md
    140-supplements-restliche-tabs.md

`[read]` **Und seine Einschraenkung ist die richtige:**

> *,,Die Zahl 5 ist eine untere Schranke ? die Methode findet nur
> falsche Bezeichner, nicht inhaltlich veraltete Aussagen."*

`[cmd]` **A-74 hat gemessen: 112 Commits seit dem letzten
Nachtrag** ? **`00-ABGENOMMEN.md` traegt jetzt 326 Punkte,
erzeugt.**

`[read]` **Aber die Beschreibung des Ist-Zustands je Modul ist
Handarbeit.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die fuenf Dateien

`[read]` **Je Datei: was steht drin, was heute nicht mehr
stimmt?**

`[read]` **Nicht umschreiben** ? **melden, mit Satz und Messung.**

`[cmd]` **`docs/` gehoert dem Orchestrator.**

### 2 · Und die Module, die sich stark veraendert haben

`[cmd]` **`recovery`, `medical`, `supplements`, `goals` und
`nutrition` haben in zwei Tagen neue Tabellen und Schreibwege
bekommen** (C-421, C-423, C-429, C-431, C-432).

`[read]` **Miss je Modul: nennt die SSOT die neuen Tabellen?**

`[cmd]` **`00-ABGENOMMEN.md` sagt, was abgenommen wurde** ? **die
Moduldateien sagen, was gebaut IST.**

`[read]` **Melde die Luecke je Modul, in einem Satz.**

### 3 · Und ein Vorschlag

`[read]` **Du hast zweimal gemessen, was 156 Dateien tragen.**

`[read]` **Laesst sich ein Teil davon erzeugen?** `[cmd]`
**`00-ABGENOMMEN.md` wird erzeugt** ? **eine Modultabelle mit
Spalten und Zeilen liesse sich genauso ableiten.**

`[read]` **Miss, was erzeugbar waere und was Handarbeit bleibt** ?
**nicht bauen.**

### Abnahmebedingungen

    A1  je der fuenf Dateien: was stimmt nicht, ein Satz mit
        Messung. Zahl: 5 / davon belegt.
    A2  je Modul: nennt die SSOT die neuen Tabellen?
        Zahl: 5 Module / davon vollstaendig.
    A3  was ist erzeugbar, was bleibt Handarbeit. Mit Aufwand.
    A4  keine Datei in `docs/` geaendert. Belegt.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-434.**
**In `backup/` loescht niemand ausser Tom** ?
`backup/g381-w2.sicherung` **bleibt liegen.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
