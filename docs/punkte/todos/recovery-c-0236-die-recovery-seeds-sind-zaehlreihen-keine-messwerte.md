---
nr: C-236
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-236 - Die Recovery-Seeds sind Zaehlreihen, keine Messwerte

## Befund

(neu 2026-08-23). Aus G-160.

  `[cmd]` `hrv_rmssd` bei `dev@lumeos.app`: **min 62, max 230,
  Schnitt 146** über 43 Werte. Die juengsten acht:
  `230 · 226 · 222 · 218 · 214 · 210 · 206 · 202` — **eine perfekte
  arithmetische Reihe, +4 pro Tag.**

  `[read]` **Menschliche RMSSD liegt bei 20–80 ms.** 146 im Schnitt ist
  physiologisch unmoeglich, und +4 pro Tag ist kein Messwert, sondern
  ein Zaehler.

  `[cmd]` **Und die Luecken:** `sleep_start_time` **0**,
  `sleep_end_time` **0**, `work_stress` **0**, `life_stress` **0** von
  170. Die Sleep-Kachel kann keine Bettzeit zeigen, weil keine da ist.
  `caffeine_mg` und `screen_time_before_bed` sind vollstaendig.

  `[read]` **Fable hat die Kacheln gebaut und die Zahlen nicht
  schoengerechnet** — richtig. Eine Kachel, die 146 ms zeigt, ist
  ehrlich kaputt; eine, die es kaschiert, ist unehrlich heil.

  `[cmd]` **`test-user@lumeos.local` hat 0 Check-ins** — wie schon 0
  Trainingssitzungen (G-159) und 0 Coach-Beziehungen (G-158).
  **Als Nachweiskonto ist es fuer drei Module unbrauchbar**, obwohl die
  Regel aus C-209 es dafuer vorsieht.

  **Zu tun:** plausible Seeds fuer Recovery und Training, die fehlenden
  Spalten fuellen, und `test-user` mit Daten versehen.
