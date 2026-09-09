---
nr: G-126
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-122
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: c3cd8fe5
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-126 - Drei Reste aus G-122

## Befund

(neu 2026-08-20).

  `[cmd]` **`CHOL` → `CHORL` (Cholesterin) waere mappbar und fehlt** —
  ein Erklaertext mehr. **Codex.**

  `[cmd]` **28 Codes haben keinen Erklaertext** — 26 einzelne
  Fettsaeuren, `OLSAC`, `F18:2C9T11`.

  ### Selen: nachgemessen, der Befund stimmt

  `[cmd]` **BLS 4.0 fuehrt kein Selen** — `nutrient_defs` hat **16
  Elemente**, Selen ist nicht dabei. Der `SE`-Treffer war `SER` (Serin).

  | | |
  |---|---|
  | gefuehrt | NACL, NA, CLD, K, CA, MG, P, S, FE, ZN, ID, CU, MN, FD, CR, MO |
  | **fehlt** | **Selen** |

  `[read]` **Das ist eine echte Luecke im Lebensmittelbestand**, kein
  Zuordnungsfehler — **und sie ist relevant:** Selen ist essenziell,
  EFSA fuehrt einen AI-Wert, und es steht in jeder
  Naehrstoffempfehlung.

  **Zu klaeren:** Bleibt es weg, oder kommt eine zweite Quelle dazu?
  `[cmd]` **BLS ist als alleinige Quelle festgelegt** — das waere eine
  Produktentscheidung.

## Auftrag

**Mitbeauftragt mit G-388 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-08, mit G-388 abgenommen.**

`[cmd]` **`InjektionsKarte` hat jetzt einen Aufrufer** ? **die
Rotationskarte in `tab-injektionen.tsx`.**

`[cmd]` **Und die lokale Zweitzeichnung ist entfernt: 563 -> 513
Zeilen.**
