---
nr: G-397
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-391
entscheidung: null
beruehrt:
  dateien:
    - tools/vollstaendigkeit.mjs
zahlen:
  gemessen: 2026-09-08
  ungezaehlt: 11
---

# G-397 — zwei Vorlagen kennt die Zaehlung nicht

## Befund

Aus G-391, Claude Code, 2026-09-08.

`[cmd]` **`tools/vollstaendigkeit.mjs`, `coach.dateien`:**

    module-coach.jsx        module-coach-extras.jsx
    module-coach-gaps.jsx   module-coach-athlete.jsx
    module-coach-meta.jsx   module-coach-programs.jsx

`[cmd]` **NICHT darin:** `module-coach-portal-v2.jsx` **und**
`module-coach-portal-workflows.jsx`.

`[cmd]` **Selbst nachgemessen: 2 + 6 = acht Karten mit Titel** ?
**insgesamt elf `<Card>`.**

`[read]` **Elf Karten, die keine Zaehlung je gesehen hat.**

## Und ein zweiter Widerspruch

`[cmd]` **`docs/ssot/102-coach-mockup.md:175/176/179` fuehrt
`PatternAnalysisView`, `InterventionEngineView`, `ConsentFlowView`
als PORTAL.**

`[cmd]` **`bekanntOffen` fuehrt sie NICHT.**

`[read]` **Zwei Verzeichnisse desselben Bestands, die
auseinanderlaufen.**

`[read]` **Claude Code hat sie als Luecke behandelt** ? **sichtbar
machen kostet nichts.**

## Die Entscheidung

`[read]` **Welches Verzeichnis gilt?**

**a** ? **`vollstaendigkeit.mjs`** ? **es ist ein Werkzeug, es
laeuft.**

**b** ? **`docs/ssot/102-coach-mockup.md`** ? **es ist die SSOT.**

`[read]` **Und dann: die zwei Dateien nachtragen, oder ist der
Portalzweig auch dort bewusst draussen?**

`[cmd]` **`module-coach.jsx:137` verdrahtet `const side =
"athlete"`** ? **der Portalzweig ist im Athletenbereich nie
erreichbar** (G-02, G-40).

`[read]` **Wenn das der Grund ist, gehoeren die zwei Dateien in
`bekanntOffen`, nicht in `dateien`** ? **dann waere die Zaehlung
richtig und nur unvollstaendig dokumentiert.**
