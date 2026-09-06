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

`[cmd]` **Spec: `docs/specs/HumanCoach/`, 12 Dateien, 3.291
Zeilen** — **dieselbe Struktur wie Marketplace.**

    SPEC_07_API.md                417
    SPEC_06_DATABASE_SCHEMA.md    355
    SPEC_04_FEATURES.md           339
    SPEC_08_IMPORT_PIPELINE.md    340
    SPEC_11_UI_DESIGN.md          327
    SPEC_02_ENTITIES.md           325
    SPEC_09_SCORING.md            271
    SPEC_10_COMPONENTS.md         236
    SPEC_03_USER_FLOWS.md         224
    SPEC_05_COACH_WORKFLOWS.md    224
    SPEC_01_MODULE_CONTRACT.md    124
    INDEX.md                      109

`[cmd]` **Dazu `ADR_COACH_PERMISSIONS_V1.md` in
`docs/specs/Nutrition/04_adrs/`.**

### Und das Schema ist gebaut

`[cmd]` **Gemessen 2026-09-07: `coach` traegt 13 Tabellen, 161
Spalten, 56 Zeilen.**

    client_permissions        22 Sp,  4 Zeilen
    relationships             16 Sp,  6
    checkins                  16 Sp,  6
    client_autonomy           15 Sp,  4
    pending_actions           14 Sp,  2
    alerts                    13 Sp,  6
    action_log                12 Sp,  1
    checkin_templates         10 Sp,  2
    client_consent_log         9 Sp,  0
    autonomy_change_log        9 Sp,  6
    permission_change_log      9 Sp,  6
    relationship_change_log    9 Sp,  7
    messages                   7 Sp,  6

`[read]` **Vier Protokolltabellen** — **jede Aenderung an Rechten,
Autonomie und Beziehung wird verzeichnet.**

`[read]` **Das ist kein leeres Modul** — **es ist ein gebautes
Schema mit drei Seiten Oberflaeche.**

`[read]` **Damit aendert sich die Lage:** **`coach` ist derselbe Fall
wie `goals`** — **die Daten stehen, der Schirm zeigt sie nicht.**

`[cmd]` **Altrepo:** `referenz/lumeos-2026/apps/coach`,
`docs/coach-module`, `docs/ai-coach-module`, `research/ai-coach` —
**18 Verzeichnisse.** `[read]` **Struktur ja, Code nie.**

`[cmd]` **Mockup:** die acht Dateien oben.

`[cmd]` **Entscheidungen:** `ADR_COACH_PERMISSIONS_V1`,
`coach.client_consent_log` (existiert bereits).

## Was zuerst zu klaeren ist

`[read]` **Drei Seiten fuer acht Mockups und 13 Tabellen** — **die
Zuordnung fehlt.**

`[cmd]` **`SPEC_11_UI_DESIGN.md` mit 327 Zeilen und
`SPEC_10_COMPONENTS.md` mit 236 sagen vermutlich, welcher Schirm was
zeigt** — **pruefend lesen, bevor gefragt wird.**

`[read]` **Welches Mockup wird welche Route?** `[read]` **Und welche
sind Varianten desselben Schirms?** `[cmd]` **`module-coach.jsx` und
`module-coach-portal-v2.jsx` klingen nach zwei Fassungen.**

`[read]` **`module-coach-gaps.jsx` heisst *Luecken*** — **das ist
vermutlich eine Sammlung dessen, was in den anderen fehlt, kein
eigener Schirm.**

## Und die Regeln gelten

`[cmd]` **E-68, E-69, E-70** — **was nicht anbindbar ist, bleibt als
Attrappe sichtbar, faellt erst mit Toms Abnahme.**
