---
nr: C-279
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-26
braucht: []
kind_von: G-190
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-279 - Das Kreuzprodukt in `rule_assessment` skaliert mit den Einnahmen

## Befund

(neu 2026-08-26). Aus G-190.

  `[cmd]` **`ladeRegeln` braucht auf `dev@lumeos.app` 926 ms, auf
  `test-user@lumeos.local` 62 ms** — Faktor 15.

  `[cmd]` **Der Ausfuehrungsplan zeigt die Ursache:**

      dev:        temp read=9457 written=9457 · 172 ms
      test-user:  (kein temp)                 ·  20 ms

  `[cmd]` **360 Einnahmen gegen 24.** `[read]` **Das Kreuzprodukt
  entsteht erst mit Einnahmehistorie — es skaliert mit `intake_logs`,
  nicht mit der Stackgroesse.**

  `[read]` **Damit waechst die Ladezeit mit der Nutzungsdauer.** Ein
  Konto, das ein Jahr protokolliert, traegt ein Vielfaches von 360
  Zeilen. **Das ist kein Ausreisser, das ist eine Kurve.**

## Auftrag

**Mitbeauftragt mit C-159 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.
