---
nr: C-414
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: C-412
entscheidung: E-65
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
