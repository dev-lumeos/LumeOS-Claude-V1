---
nr: A-27
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/schuss.mjs"]
zahlen: null
---

# A-27 - Zwei Agenten, zwei Attrappen-Erwartungen

## Befund

(neu
  2026-08-20). **Das Gate ist rot.**

  `[cmd]` **`v2-attrappen.test.ts` scheitert zweimal:** *„Supplements
  erwartet 1 Attrappenmarke, findet 17"* und *„`TodayAttrappe` braucht
  laut Test eine Rueckfallmarke."*

  `[read]` **Die Ursache ist der Parallelbetrieb:** G-74 hat die
  Rueckfallfassungen markiert und den Test auf 1 gesetzt. **G-91 hat
  danach den Catalog-Tab gebaut** — und die Zaehlung stimmt nicht mehr.

  `[cmd]` **A-24 haelt fest, dass Textmarken kein brauchbares Mass
  sind.** `[read]` **Und `tools/schuss.mjs` misst seit heute die
  gerenderte Seite** — 7 Attrappen auf `/v2/nutrition`, in einem
  Aufruf.

  **Zu tun:** Test auf den gemessenen Stand ziehen — **oder ihn durch
  die gerenderte Zaehlung ersetzen.**
