---
nr: C-414
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: C-412
entscheidung: E-65
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-07
  module: 6
---

# C-414 — die Querschnittssicht liegt in `nutrition`

## Befund

Nachgemessen bei der C-412-Abnahme, 2026-09-07.

`[cmd]` **`activity_stream` liegt in `nutrition`** — **obwohl sie
sechs Module vereint:** Mahlzeiten, Wasser, Supplements, Training,
Recovery, Medical.

`[cmd]` **Der Dateiname sagt `00_querschnitt/412_activity_stream.
sql`, das Schema sagt `nutrition`.**

## Warum es zaehlt

Tom, 2026-09-07: *,,wir mischen keine module durcheinander. jedes
modul ist in sich geschlossen."* (E-65)

`[read]` **E-65 verbot einen Fremdschluessel ueber die
Modulgrenze** — **eine Sicht, die sechs Module liest und im Schema
eines davon liegt, ist derselbe Fall.**

`[read]` **Wer `nutrition` liest, erwartet Nutrition** — **nicht
Trainingseinheiten.**

## Zu tun

`[read]` **Nach `quer` oder `public` verschieben.**

`[cmd]` **Und die Leser nachziehen** — **G-152 wartet auf sie,
gebaut ist dort noch nichts.**

`[read]` **Jetzt ist es billig** — **nach dem ersten Aufrufer
nicht.**

## Auftrag — das Schema und zwei Reste

**Mitbeauftragt: C-389, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-414 — die Sicht liegt im falschen Schema

`[cmd]` **`activity_stream` liegt in `nutrition`** — **obwohl sie
sechs Module vereint.** `[cmd]` **Der Dateiname sagt
`00_querschnitt/`.**

Tom, 2026-09-07: *,,wir mischen keine module durcheinander."* (E-65)

`[read]` **Verschieb sie nach `quer` oder `public`** — **und
begruende, welches.**

`[cmd]` **Kein Aufrufer in `apps/`** — **G-152 wartet noch.**
`[read]` **Jetzt ist es billig.**

### 2 · C-389 — die drei Saftfamilien

`[cmd]` **Du hast gemessen und vier Zeilen berichtigt:** `F201600`,
`F310600`, `F603600`, `F603700` **auf `minimally_processed`.**

`[cmd]` **Die drei Smoothies bleiben `raw`, keine 53er-Regel.**

`[read]` **Miss, ob der Punkt damit zu ist** — **oder was noch
offen bleibt.**

### 3 · C-193 — was ein MealCam-Leseweg braucht

`[cmd]` **Du hast es dokumentiert:** *,,MealCam muss BLS-Kandidaten
ungefiltert lesen und erst danach Konflikte pro Food/Zutat als
Warnung zurueckgeben."*

`[cmd]` **`SPEC_11` steht seit heute** — **Abschnitt 2a nennt drei
Kandidatentypen:** `BLS_FOOD`, `GLOBAL_RECIPE`, `USER_RECIPE`.

`[read]` **Miss, was eine solche Funktion braeuchte** — **und ob
`food_search` sie tragen kann oder eine zweite noetig ist.**

`[cmd]` **`match_reason` gibt es seit C-391** — **zehn Wege.**

`[read]` **Melden, nicht bauen** — **MealCam ist Phase 0.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Schema      verschoben, Wahl begruendet
    Kettenlauf  ueberlebt, in kette.json
    C-389       zu / was offen bleibt
    C-193       was die Funktion braeuchte, mit Zahl

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
