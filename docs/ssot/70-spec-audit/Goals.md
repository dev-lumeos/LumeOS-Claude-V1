# Spec-Audit: Goals

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Goals/` · **Prüftiefe:** Dateibestand vollständig, README vollständig gelesen, Zählprüfung DB, Querschnitts-Greps.

## Dateibestand

`[cmd]` 10 Dateien: `README.md`, `CONSOLIDATED_KNOWLEDGE.md`, `STRATEGY.md`,
`FEATURES.md`, `DATABASE.md`, `API.md`, `COMPONENTS.md`, `SCORING.md`,
`PHASE_MODELS.md`, `OPEN_ITEMS.md`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Folgt einem **anderen Schema** (thematische Dateinamen statt SPEC_xx, README
statt INDEX). Inhaltlich sind die Slots grob abgedeckt (DATABASE≈06, API≈07,
SCORING≈09, COMPONENTS≈10, PHASE_MODELS≈05); es fehlen als eigene Dokumente:
Module Contract (01), Entities (02), User Flows (03), Import (08).
Goals ist das **einzige** Modul, in dem `CONSOLIDATED_KNOWLEDGE.md` wirklich
existiert (`[cmd]` Glob: genau 1 Treffer im gesamten Spec-Baum) — 7 andere
INDEX-Dateien verweisen auf ihre eigene, nicht existente Kopie.

## Interne Widersprüche

- `[cmd]` README sagt „10 Core-Tabellen", `DATABASE.md` enthält 10
  `CREATE TABLE`. Deckt sich.
- `[read]` README-Architektur nennt `apps/app/app/(app)/goals/` und
  `apps/app/modules/goals/` — `[cmd]` es gibt kein `apps/app`; die Haupt-App
  heißt `apps/web`. Ausserdem `src/api/goals/` als API-Ort — das Repo-Gerüst
  heißt `services/goals-api`.
- `[read]` `OPEN_ITEMS.md` trägt lt. TODO C-06 zwei kritische Bugs
  (Adaptive-TDEE Cross-Schema, Contribution-Timing) — nicht neu geprüft `[annahme]`.

## Modulübergreifend

- `[cmd]` Port 5900 konsistent (README, API.md, alle Consumer-Module
  referenzieren `goals:5900`).
- `[cmd]` `packages/scoring/src/goals.ts` referenziert — Gerüst fehlt.
- `[read]` „Next.js 15" (README:53) vs. WebPlatform „14+".
- `[read]` FEATURES.md mit „Status und Code-Referenzen" — Code-Referenzen
  beschreiben lt. `40-spec-code-matrix.md` Vorgängerrepo-Stand; hier nicht
  erneut verifiziert `[annahme]`.

## Reifegrad

Hoch in der Substanz (Aggregation-Engine, Phasenmodell, TDEE), aber
strukturfremd und mit Vorgängerrepo-Pfaden durchsetzt.
**Einer Freigabe steht im Weg:** Schema-Angleichung oder bewusste Ausnahme;
Pfad-Korrekturen (`apps/app` → `apps/web`, `src/api` → `services/goals-api`);
Klärung der 2 kritischen Bugs aus OPEN_ITEMS (C-06).
