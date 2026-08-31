---
nr: G-294
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: [C-324]
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-294 — CrossModuleInsights — Goals bekommt nichts

## Befund

`[cmd]` **`SPEC_10` nennt `CrossModuleInsights`:** *,,Nutrition Score
zu Dashboard-Karte fuer Goals"*.

`[cmd]` **Im `goals`-Schema gibt es keine Funktion, die Nutrition
liest.**

`[read]` **Der Nutrition-Score existiert noch nicht** (C-324 laeuft)
— **aber die Naht auch nicht.**

## Die Modulgrenze

`[cmd]` **E-29 verlangt fuer Coach-Zugriffe eine Funktion.** `[read]`
**Ob das hier gilt, ist zu messen** — `goals` und `nutrition` sind
beide Nutzermodule, kein Dritter liest.

`[cmd]` **Und `lib/dashboard/lesen.ts` liest bereits aus fremden
Modulen** — **die Naht koennte dort liegen.**

`[read]` **Erst C-324, dann dieser Punkt** — **ohne Score gibt es
nichts zu uebergeben.**
