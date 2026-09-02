---
nr: A-69
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-241
entscheidung: null
beruehrt:
  dateien:
    - package.json
zahlen:
  gemessen: 2026-09-02
  anzahl: 26
---

# A-69 — 26 Abhaengigkeiten mit High Severity

## Befund

Aus C-241, Codex, 2026-09-02, nebenbei gemessen.

`[cmd]` **`pnpm audit` meldet 26 bestehende
High-Severity-Abhaengigkeiten**, darunter **Next 14.2.35** und
**Playwright**.

`[read]` **Codex sagt selbst: nicht Teil dieses Auftrags** —
richtig, **er hat es gemeldet statt nebenbei zu aendern.**

## Warum es zaehlt

`[read]` **Ein Abhaengigkeitswechsel beruehrt alles gleichzeitig** —
**Gate, Tests, beide Agenten.**

`[read]` **Und Next ist der Rahmen, in dem `apps/web` laeuft** —
**ein Sprung dort ist kein Nebenbei.**

## Zu klaeren

`[read]` **Welche der 26 betreffen den Betrieb, welche nur
Werkzeuge?** `[cmd]` **Playwright laeuft nur in `tools/schuss.mjs`
und den Tests** — **nicht im Auslieferungsstand.**

`[read]` **Und ob es einen Zeitpunkt gibt, an dem beide Agenten
stillstehen** — **sonst kollidiert der Wechsel mit laufender
Arbeit.**
