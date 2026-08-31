---
nr: A-18
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-18
braucht: []
kind_von: G-42
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/spezifikation/10-plattform/design-system/theme-v1/uploads/SPEC_10_COMPONENTS-d99c9f3e.md", "docs/spezifikation/10-plattform/design-system/theme-v1/uploads/SPEC_04_FEATURES-aadfc7f5.md", "docs/spezifikation/10-plattform/design-system/theme-v1/uploads/SPEC_09_SCORING-8a1632fa.md"]
zahlen: null
---

# A-18 - `theme-v1/uploads/` — die Bruecke zwischen Spec und Entwurf

## Befund

(neu 2026-08-18). Befund aus der G-42-Vorarbeit.

  `[cmd]` `docs/spezifikation/10-plattform/design-system/theme-v1/uploads/`
  enthaelt **die Spec-Dateien, die Claude Design bekommen hat** — mit
  Hash im Namen: `SPEC_10_COMPONENTS-d99c9f3e.md`,
  `SPEC_04_FEATURES-aadfc7f5.md`, `SPEC_09_SCORING-8a1632fa.md`.

  `[cmd]` **Sie steht in keinem Index** — weder im SSOT noch in der
  Spezifikation. **Vierter unentdeckter Fundus** nach
  `referenz/lumeos-2026/`, `docs/ssot/70-spec-audit/` und
  `docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/`.

  ### Warum sie zaehlt

  `[read]` **Tom, 2026-08-18:** *„Das Design wurde aus den Specs und der
  Vision von Claude Design erstellt, also muss das irgendwo definiert
  sein."* — **Und es war so.** Alle vier unklaren Buddy-Tabs
  (`clone`, `bss`, `signature`, `butler`) stehen dort definiert.

  **Damit laesst sich pruefen, ob der Entwurf auf dem aktuellen
  Spec-Stand beruht** — und was sich seither geaendert hat. `[cmd]` Ein
  Vergleich der Hash-Dateien gegen `docs/specs/` sagt es Datei fuer
  Datei.

  **Was zu tun ist:** Bestand aufnehmen, in den Index, und den Abgleich
  fahren. `[read]` Wo Entwurf und heutige Spec auseinanderlaufen, ist
  **der Entwurf nicht automatisch veraltet** — bei den TDEE-Formeln war
  die Vorlage genauer als die Spec (W-6).
