---
nr: C-327
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-129
entscheidung: null
agent: codex
beauftragt: 2026-08-28
beruehrt:
  tabellen:
    - supplements.rule_catalog
  dateien: []
zahlen:
  gemessen: 2026-08-28
  medikamentenregeln: 20
  missing_input: 1
  fehlende_gruppenmitgliedschaft: 1
---

# C-327 - Die Chelationsregel kennt keine Gruppenmitgliedschaft

## Befund

`[cmd]` **Gemessen 2026-08-28 fuer `dev@lumeos.app`:**
`rule_assessment` gibt fuer `wr_drug_chelation_timing`
`evaluation_state = missing_input` und
`missing_inputs = {supplements.substance_group_membership}` zurueck.

`[cmd]` Von 20 Medikamentenregeln sind 1 `missing_input`, 7
`unsupported_operator` und 12 `not_fulfilled`. Die sieben unbekannten
Operatoren gehoeren in C-313; diese einzelne fehlende
Gruppenmitgliedschaft ist davon getrennt.

## Was zu tun ist

**Die Gruppenmitgliedschaft fuer die Regel auswertbar machen oder die
Regel fachlich als nicht auswertbar begruenden.** Ein fehlender Input
bleibt sichtbar; er darf nicht als nicht erfuellt erscheinen.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, und du nennst Nutzer und Zeitraum
dazu.** `[cmd]` **Seit heute in `CLAUDE.md`** — zweimal haben zwei
Beteiligte verschiedene Zahlen fuer dieselbe Sache gemeldet, weil der
Ausschnitt fehlte.

### Zu tun

**Der letzte `missing_input` in der Regel-Engine.**

`[cmd]` **Von 64 Regeln:** 39 `not_fulfilled`, 23
`unsupported_operator`, 1 `fulfilled`, **1 `missing_input` — das ist
diese.**

`[read]` **`missing_input` ist der ehrlichste der vier Zustaende:**
die Regel koennte auswerten, ihr fehlt nur eine Eingabe. `[read]`
**Miss zuerst, welche** — und ob sie fehlt oder nur nicht verknuepft
ist.

`[cmd]` **C-296 hat gezeigt, wie leicht man sich hier taeuscht:**
`drug_class` fuehrte jeden Tag doppelt, und `wr_serotonergic` sucht
Grossschreibung. **Eine Gruppenmitgliedschaft, die *fehlt*, kann auch
eine sein, die unter anderem Namen da ist.**

### Der Nachweis ist wichtiger als die Behebung

**Eine Lage, in der die Regel zutreffen muss, und eine, in der sie
nicht zutreffen darf.**

`[read]` **Chelatbildner und Mineralstoffe im selben Zeitfenster sind
ein echter Fall** — Eisen und Kalzium binden sich gegenseitig.
**Eine Warnung, die zu frueh feuert, macht den ganzen Block
unglaubwuerdig; eine, die ausbleibt, ist wirkungslos.**

### Was nicht zu tun ist

**Keine Regel aendern.** `[read]` **Die Eingabe wird zur Regel
gebaut, nicht die Regel zur Eingabe.** Wenn die Regel etwas verlangt,
das nicht sinnvoll herstellbar ist: **melden.**
**Keine weiteren Operatoren** — die 23 warten (C-332).
`apps/` nicht anfassen — Claude Code arbeitet dort an G-246.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    welche Eingabe fehlt         benannt
    fehlt sie oder heisst sie    gemessen, nicht vermutet
      anders
    trifft zu                    Lage hergestellt, Regel feuert
    trifft nicht zu              Lage hergestellt, Regel schweigt
    evaluation_state             vorher / nachher, alle 64
    andere Regeln                unveraendert - belegt

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
