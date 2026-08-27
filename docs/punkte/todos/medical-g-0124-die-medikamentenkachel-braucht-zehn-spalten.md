---
nr: G-124
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-123
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["medical.user_medications"]
  dateien: []
zahlen:
  gemessen: 2026-08-20
  bestehende_spalten: 21
  bestehende_zeilen: 2
  fehlende_kachelspalten: 10
  warnungen_gesamt: 6
  warnungen_aus_fehlenden_spalten: 4
---

# G-124 - Die Medikamentenkachel braucht zehn Spalten

## Befund

(neu 2026-08-20, aus G-123).

  `[cmd]` **`medical.user_medications` gibt es seit C-130** (21
  Spalten, 2 Zeilen) — **aber keine der zehn, die die Kachel zeigt:**
  `monitoring`, `monitoring_frequency`, `last_test`, `next_due`,
  `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`,
  `prescription_ref`.

  `[cmd]` **Vier der sechs Warnungen im Medical-Kopf** speisen sich aus
  `next_due` und `monitoring_overdue`.

  `[read]` **Ein Schreibweg allein genuegt hier nicht** — er wuerde
  Medikamente speichern, waehrend die Kachel darueber weiter erfundene
  Ueberwachungsdaten zeigt.

  `[cmd]` **Gemessen 2026-08-20 mit G-130 — zehn Spalten fehlen:**

  `monitoring` · `monitoring_frequency` · `last_test` · `next_due` ·
  `monitoring_overdue` · `targets` · `side_effects` · `physician` ·
  `rx` · `prescription_ref`

  `[read]` **Vier der sechs Alert-Eintraege speisen sich daraus.**
  **Codex-Auftrag** — der Rest der Kachel liest bereits echt.
