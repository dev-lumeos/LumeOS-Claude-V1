---
nr: A-34
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-129
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-34 - Nachweislaeufe ueberschreiben Toms gespeicherte Ansicht

## Befund

(neu 2026-08-20). Randbefund aus G-129.

  `[cmd]` *„Beim ersten Messlauf stand deine live gespeicherte Ansicht
  auf „Auffaellig / 30 Tage" — meine Probelaeufe haben sie ueberschrieben
  (jetzt „Alle / Heute")."*

  `[read]` **Das ist das korrekte Verhalten der Speicherung** — aber es
  heisst: **jeder Agent, der als `dev@lumeos.app` misst, aendert Toms
  Einstellungen.**

  `[cmd]` **Seit G-122 gilt das fuer `user_display_preferences`** — und
  kuenftig fuer jede gespeicherte Ansicht.

  **Regel fuer Auftraege:** `[cmd]` **Nachweise auf
  `test-user@lumeos.local` fuehren**, oder die Zeile vorher sichern und
  danach zuruecksetzen. `[read]` **Gehoert in die Nachweisliste jedes
  UI-Auftrags.**
