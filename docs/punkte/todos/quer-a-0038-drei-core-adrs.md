---
nr: A-38
typ: befund
modul: quer
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

# A-38 - Drei Core-ADRs

## Befund

(neu 2026-08-20). Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/` hat drei ADRs, alle April 2026:**

  **`SUBSCRIPTION_GATES_ADR`** — *„Kein Subscription-Gate in V1. Alle
  Features ohne Einschraenkung."* `[read]` **Aber das Datenmodell ist
  tier-ready** — siehe G-140. **Sieben Features sind als spaetere
  Gates benannt**, darunter MealCam, Trend-Charts ueber 7 Tage, Coach
  Autonomy, Korrelationen, Export.

  `[cmd]` **`AI_USAGE_WALLET_ADR`** (120 Zeilen) — *„AI-Features sind
  keine Subscription-Features — sie werden aus dem **User-Wallet**
  bezahlt."* **V1 = nur Nutzungserfassung, Endausbau = Wallet.**

  `[read]` **`module-crossmodule-rest.jsx` traegt `WALLET` und
  `WALLET_TX`** — die Anzeige dazu.

  `[cmd]` **`ONBOARDING_ADR`** — siehe G-141.
