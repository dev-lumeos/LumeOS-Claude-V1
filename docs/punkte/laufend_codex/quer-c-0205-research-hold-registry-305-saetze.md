---
nr: C-205
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/lib/evidenz/registry.ts"]
zahlen: null
---

# C-205 - `research_hold_registry` — 305 Saetze

## Befund

(neu 2026-08-22).

  `[cmd]` **305 Eintraege** als Kuratierungs-Warteschlange. Koennte wie
  `lib/evidenz/registry.ts` (C-180) erzeugt werden statt in die
  Datenbank zu wandern.

## Auftrag — drei Altbestaende messen

**Mitbeauftragt: C-229, G-214.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Alle drei sind Befunde ohne Messung von heute.** **Die
Erwartung: mindestens einer ist ueberholt** — **am 30.08. waren es
neun von zweiundzwanzig.**

### 1 · C-205 — `research_hold_registry`, 305 Saetze

`[cmd]` **Miss, ob die Tabelle existiert und was sie traegt.**
`[read]` **Und ob irgendetwas sie liest** — A-59 gilt auch fuer
Tabellen.

### 2 · C-229 — der Katalog aus `DatabaseEcht`

`[read]` **Der Punkt nennt Katalog, Detail und *Add*.** `[cmd]`
**Seit G-265 und G-272 ist der Add-Weg neu.** **Miss, was vom Befund
bleibt.**

### 3 · G-214 — die Katalogsuche sagt nicht, warum ein Treffer passt

`[read]` **Miss zuerst, ob die Suche heute eine Begruendung
mitliefert.** `[cmd]` **`food_search` traegt seit C-20 zehn
Sortierwerte und `unsupported_sort`** — **vielleicht gibt es die
Auskunft schon und sie kommt nur nicht an.**

### Was nicht zu tun ist

**Keine deutschen Namen setzen** — C-352 wartet auf Tom.
**Keine ADRs anfassen** — C-357 wartet ebenfalls.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil    erledigt / gebaut / offen / ueberholt
    research_hold          existiert? wird gelesen?
    DatabaseEcht           was bleibt nach G-265/G-272
    Trefferbegruendung     gibt es sie, kommt sie an?

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
