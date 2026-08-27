---
nr: C-166
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-166 - Recovery hat 3 Tabellen, der Entwurf 25 Konstanten

## Befund

(neu 2026-08-20). Aus dem Gesamtabgleich (SSOT 173).

  `[cmd]` **`recovery` fuehrt `checkins`, `modality_log`, `scores`.**
  **Ohne Gegenstueck im Schema:**

  | | |
  |---|---|
  | **`SLEEP_DATA`** | Schlafphasen, Rhythmus — `RecoverySleep`, `SleepStaging`, `SleepRhythm` |
  | **`HRV_LOG`, `HRV_BASELINE`** | HRV-Verlauf und Grundlinie |
  | **`ACWR_DATA`** | Belastungsverhaeltnis — **wird nirgends gerechnet** |
  | **`PROTOCOL_DEFS`, `RECOVERY_PROTOCOLS`, `ACTIVE_PROTOCOL`** | Erholungsprotokolle |
  | `RECOMMENDATIONS`, `READINESS_LEVELS`, `MOOD_MULTIPLIER` | |

  `[read]` **17 von 61 Komponenten fehlen** — darunter `RecoverySleep`,
  `RecoveryProtocols`, `RecoveryInsights`, `CorrelationChart`.

  `[cmd]` **`module-recovery-engine.jsx` traegt das Rechenwerk** — nie
  gelesen.
