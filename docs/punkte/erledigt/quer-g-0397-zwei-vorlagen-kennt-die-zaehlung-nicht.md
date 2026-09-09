---
nr: G-397
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-391
entscheidung: null
erledigt: 2026-09-08
commit: 91181203
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

## Nachgemessen 2026-09-08 — die SSOT hat recht

`[cmd]` **`module-coach.jsx:923-940`: die Reiterliste des
Portalzweigs.**

`[cmd]` **Die drei stehen mitten darin:**

    923  <Tabs items={[
    924    overview, athletes, analytics, alerts,
    928    rules, autonomy,
    930    patterns      <- PatternAnalysisView
    931    intervene     <- InterventionEngineView
    932    consent       <- ConsentFlowView
    933    plans, workflows, onboard, programs,
    939    messages, revenue, team
    940  ]}

`[cmd]` **Und Zeile 916 sagt, was dieser Rahmen ist:**

> *,,Coach workspace ? read-only on client data ? every call
> logged"*

`[cmd]` **Die Nachbarn:** `CoachPortalAnalytics`,
`CoachPortalSmartAlerts`, `CoachPortalRules`,
`CoachPortalAutonomy`, `PortalPlans`, `PortalWorkflows` ?
**ALLE stehen in `bekanntOffen`.**

`[read]` **Die drei sind Reiter DESSELBEN Arbeitsplatzes** ?
**sie fehlen in `bekanntOffen`, nichts weiter.**

`[cmd]` **`module-coach.jsx:137`: `const side = "athlete"`** ?
**der ganze Zweig ist im Athletenbereich nie erreichbar.**

**Damit ist es Variante b: die SSOT gilt, das Werkzeug ist
unvollstaendig.**

## Was zu tun ist

    1  die drei in coach.bekanntOffen nachtragen
       PatternAnalysisView, InterventionEngineView,
       ConsentFlowView
    2  module-coach-portal-v2.jsx und -portal-workflows.jsx
       in bekanntOffen aufnehmen, NICHT in dateien
       -- elf Karten, alle Portal
    3  den Kommentar ergaenzen, warum

`[read]` **Und Claude Codes zehn gebaute Karten pruefen** ?
**wenn die drei darunter sind, gehoeren sie wieder weg.**

## Abnahme

**2026-09-08, mit G-398 entschieden.**

`[cmd]` **`module-coach.jsx:948-950` zeigt `PatternAnalysisView`,
`InterventionEngineView`, `ConsentFlowView` als Portalreiter.**

> *,,Der SSOT hatte recht, `bekanntOffen` hatte recht ? nur mein
> Schluss in G-391 war falsch."*

`[read]` **Es gab nie einen Widerspruch zwischen den
Verzeichnissen** ? **nur eine falsche Folgerung des
Orchestrators.**

`[cmd]` **Alle drei tragen jetzt ihre Referenz in `apps/coach`.**

`[read]` **Was offen bleibt: `module-coach-portal-v2.jsx` und
`-portal-workflows.jsx` in `vollstaendigkeit.mjs`** ? **elf
Karten, die keine Zaehlung sieht.**

**Als G-399.**
