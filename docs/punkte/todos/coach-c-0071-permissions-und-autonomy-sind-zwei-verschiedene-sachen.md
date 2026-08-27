---
nr: C-71
typ: entscheidung
modul: coach
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: F-04
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-71 - Permissions und Autonomy sind zwei verschiedene Sachen

## Befund

(neu gefasst 2026-08-19). **Toms Klarstellung.**

  **Tom, 2026-08-19:** *„In Permissions setzt der User, was der Coach
  sehen darf und wie autonom es sein soll. Unter Autonomy setzt der
  Coach den Level seines Users, welches Autonomy definiert. Das sind
  zwei verschiedene Sachen."*

  ### Zwei Achsen, zwei Orte, zwei Akteure

  | | wer setzt | was |
  |---|---|---|
  | **Permissions** | **der Nutzer** | was der Coach **sehen** darf · und ob er **ohne Bestaetigung aendern** darf (je Modul) |
  | **Autonomy** | **der Coach** | den **Level seines Athleten** — wie selbstaendig der arbeiten darf |

  `[read]` **Das erklaert `056_coach_autonomy` mit den fuenf Stufen:**
  Sie beschreiben nicht die Coach-Rechte, sondern **die Reife des
  Athleten.** Ein Anfaenger bekommt engere Fuehrung, ein
  Fortgeschrittener entscheidet mehr selbst.

  `[cmd]` **Und der Tab `Autonomie` in `/v2/coach/human` ist genau
  das** — die Coach-Sicht auf seiner Plattform, **nicht die
  Nutzerrechte.** Der Orchestrator hatte beides in einen Topf geworfen.

  ### Entschieden

  `[cmd]` **Fuenf Stufen des Vorgaengers** fuer die Autonomy-Achse —
  Toms Entscheidung 2026-08-19.

  `[cmd]` **Fuer Permissions bleibt es bei C-95:** je Modul zweiwertig,
  mit oder ohne Bestaetigung.

  `[read]` **Was aus der F-04-Recherche uebernommen wird:** das Muster
  von `coach_pending_actions` — Vorschau, 10-Minuten-Verfall,
  `confirmed_at`, daneben ein Log mit Undo. **Die Tabelle nicht** —
  *„hartkodierte Default-User-UUID, keine Akteursspalte, keine RLS."*

  `[cmd]` **Und die Widerrufshistorie wird gebraucht** — F-03 sagt ja
  mit Begruendung, F-04 misst, dass sie fehlt: **das dokumentierte
  `coach_client_autonomy_log` hat keine Migration.**
