---
nr: G-102
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-100
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["packages/ui/src/koerperkarte-pfade.ts"]
zahlen: null
---

# G-102 - Zwei SVG-Pfade der Muskelkarte sind abgeschnitten

## Befund

(neu 2026-08-20, aus G-100). **`packages/ui`.**

  `[cmd]` **Zwei Konsolenfehler auf jeder Recovery-Seite:**
  `<path> attribute d: Expected number`.

  `[cmd]` **Kein Encoding-Problem**, obwohl die Meldung so aussieht:
  `packages/ui/src/koerperkarte-pfade.ts` enthaelt **0 Ersatzzeichen
  (U+FFFD)** — das `?` in der Konsole ist die Konsole.

  `[cmd]` **Es sind abgeschnittene Pfaddaten.** Ein `C` braucht sechs
  Zahlen:

  ```
  … C 89.50 823.53 109.24 767.88 A 0.37 …   ← vier, dann folgt A
  … C 1039.32 221.19 C 1041.33 230.61 …     ← zwei, dann folgt C
  ```

  `[cmd]` **Unveraendert seit `3dae1a2`** — die Daten kamen so ins
  Repo. Die Karte zeichnet; nur diese zwei Teilstuecke fehlen.

  `[read]` In G-100 nicht behoben, weil `packages/ui` dort gesperrt
  war.
