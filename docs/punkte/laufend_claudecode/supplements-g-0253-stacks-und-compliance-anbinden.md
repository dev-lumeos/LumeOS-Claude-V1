---
nr: G-253
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-240
entscheidung: null
beruehrt:
  tabellen: [supplements.user_stacks, supplements.stack_items, supplements.intake_logs]
  dateien: [apps/web/src/app/v2/supplements/tabs.tsx]
zahlen: null
agent: claudecode
beauftragt: 2026-08-29
---

# G-253 — Stacks und Compliance anbinden

## Befund

**Aus G-240, Claude Code, 2026-08-28** — deine eigene Bauliste:

`[read]` *,,Sofort baubar: `stacks` (4 Attrappen, `user_stacks` wird
bereits geladen) und die Kalenderansicht von `compliance`
(`intake_logs` traegt Zeilen). Dort fehlt weder Tabelle noch
Entscheidung — das ist der naechste Bauauftrag."*

`[read]` **Elf Reiter im Mockup, elf gebaut, eins zu eins** — was
fehlt, ist die Anbindung zweier davon.

## Auftrag

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Und der gebaute `/v2/`-Stand ist der Massstab** —
`theme-v1` nur nachschlagen, wenn etwas fehlt und die Frage ist, wie
es gemeint war. **Der Baum ohne `/v2/` bleibt unberuehrt.**

`[cmd]` **Die Seed-Daten reichen bis November 2026** — eine offene
Datumsgrenze faengt alles Zukuenftige mit. **Das hat dich in G-11
fast einen Fehlbefund gekostet.**

### 1 · Stacks

`[cmd]` **`user_stacks` wird bereits geladen**, `stack_items` haengt
darunter, **und seit G-138 gibt es einen Schreibweg fuer Einnahmen.**

`[read]` **Miss zuerst, was der Reiter heute zeigt und woher es
kommt.** **Vier Attrappen — woran haengt jede?**

### 2 · Compliance, Kalenderansicht

`[cmd]` **`intake_logs` traegt Zeilen mit `status` (`taken`,
`skipped`) und den vier `_snapshot`-Spalten aus G-138.**

`[read]` **Ein Kalender zeigt Tage, an denen etwas war — und Tage,
an denen nichts war.** `[read]` **Das sind zwei verschiedene
Aussagen:** nicht genommen und nicht erfasst. **Dieselbe
Unterscheidung, die du in C-48 fuer das Tagebuch gebaut hast.**

### Was nicht zu tun ist

**Keine zweite Ansicht neben eine bestehende bauen.** `[read]`
**Dreimal ist das passiert** — G-249 im Nutrients-Reiter, G-11 im
Insights-Reiter, und beide Male musste es wieder raus. **Miss zuerst,
ob der Reiter das schon zeigt.**
**Keine Tabelle anlegen** — Codex arbeitet an Recovery.
**Kein Katalogausbau.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Attrappen im Reiter          vorher / nachher, am Schirm gezaehlt
    Stacks: Datenquelle          je Kachel benannt
    Compliance: zwei Leerlagen   unterscheidbar - Bildschirmfoto
    Doppelung                    zeigt der Reiter etwas zweimal?
    Ladezeit                     ms, kalt und warm getrennt
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[read]` **Die vierte Zeile ist die, die ich dreimal uebersehen
habe.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30, A-59, A-60 beachten** — kein Wert-Import aus dem
Leseweg, Attrappen am Schirm zaehlen, keine `Map` ueber die
Client-Grenze.
`[read]` **Und eine Sabotage, die nicht faellt, kann zweierlei
heissen** — der Waechter taugt nichts, oder die sabotierte Stelle ist
wirkungslos.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
