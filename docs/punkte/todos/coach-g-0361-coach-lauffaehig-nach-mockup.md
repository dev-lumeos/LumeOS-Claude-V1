---
nr: G-361
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-360
entscheidung: E-71
beruehrt:
  dateien:
    - apps/coach/src/app/page.tsx
zahlen:
  gemessen: 2026-09-07
  seiten: 3
  mockup_zeilen: 3855
  fehlend: 285
---

# G-361 — coach lauffaehig nach Mockup

## Was gemessen ist

`[cmd]` **`apps/coach`: 2.891 Dateien, Port 3220, drei Seiten.**

    app/page.tsx
    app/login/page.tsx
    app/athlet/[id]/page.tsx

`[cmd]` **Acht Mockups, 3.855 Zeilen:**

    module-coach.jsx                   971
    module-coach-extras.jsx            753
    module-coach-athlete.jsx           566
    module-coach-gaps.jsx              456
    module-coach-portal-v2.jsx         388
    module-coach-portal-workflows.js   315
    module-coach-programs.jsx          205
    module-coach-meta.jsx              201

`[cmd]` **285 von 521 Beschriftungen fehlen** — **es sind nie
gebaute Ansichten, keine versteckten** (G-359).

## Die vier Quellen

`[cmd]` **Spec:** `docs/specs/HumanCoach/SPEC_05_COACH_
WORKFLOWS.md`, `ADR_COACH_PERMISSIONS_V1.md` — **15 Dateien tragen
`coach` im Namen, 265 nennen es.**

`[cmd]` **Altrepo:** `referenz/lumeos-2026/apps/coach`,
`docs/coach-module`, `docs/ai-coach-module`, `research/ai-coach` —
**18 Verzeichnisse.** `[read]` **Struktur ja, Code nie.**

`[cmd]` **Mockup:** die acht Dateien oben.

`[cmd]` **Entscheidungen:** `ADR_COACH_PERMISSIONS_V1`,
`coach.client_consent_log` (existiert bereits).

## Was zuerst zu klaeren ist

`[read]` **Drei Seiten fuer acht Mockups** — **die Zuordnung fehlt.**

`[read]` **Welches Mockup wird welche Route?** `[read]` **Und welche
sind Varianten desselben Schirms?** `[cmd]` **`module-coach.jsx` und
`module-coach-portal-v2.jsx` klingen nach zwei Fassungen.**

`[read]` **`module-coach-gaps.jsx` heisst *Luecken*** — **das ist
vermutlich eine Sammlung dessen, was in den anderen fehlt, kein
eigener Schirm.**

## Und die Regeln gelten

`[cmd]` **E-68, E-69, E-70** — **was nicht anbindbar ist, bleibt als
Attrappe sichtbar, faellt erst mit Toms Abnahme.**
