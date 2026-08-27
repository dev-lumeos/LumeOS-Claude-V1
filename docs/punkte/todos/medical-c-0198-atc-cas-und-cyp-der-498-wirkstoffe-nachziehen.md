---
nr: C-198
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["medical.medication_active_substances"]
  dateien: []
zahlen: null
---

# C-198 - ATC, CAS und CYP der 498 Wirkstoffe nachziehen

## Befund

(neu 2026-08-22).

  `[cmd]` `medical.medication_active_substances` **498 Zeilen** — aber
  **ATC 56, CAS 56, CYP 22**. `risk_flags` **498**,
  `contraindications` **433**, `regulatory_state` 498, `sources` 498.

  `[read]` **Erst pruefen, ob Kimi mehr hat als wir importiert haben.**
  Fable meldet, die Quelle sei gleich duenn (1:1-Import) — dann ist es
  eine Recherchefrage an Kimi, keine Importfrage. **Das entscheidet,
  ob der Punkt zu Codex oder in die naechste Crawl-Runde geht.**
