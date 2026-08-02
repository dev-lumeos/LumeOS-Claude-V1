# Spec-Audit: Supplements

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Supplements/` · **Prüftiefe:** Dateibestand vollständig, INDEX teilgelesen (Kopf + Entscheidungen), Zählprüfungen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 11 Dateien: `INDEX.md` + `SPEC_01` bis `SPEC_10`
(Slot 05 = `CATALOG_EVIDENCE`). Kein SPEC_11 — UI in
`WebPlatform/SPEC_07_SUPPLEMENTS_UI.md`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig (01–10).

## Interne Widersprüche

- `[cmd]` Zählprüfung: INDEX „9 Core Entities" / „10 Tabellen" — SPEC_02 hat
  9 Entity-Überschriften, SPEC_06 hat 10 `CREATE TABLE`. In sich konsistent;
  Feldabgleich nicht durchgeführt `[annahme]`.

## Tote Verweise

- `[read]` `INDEX.md:10` referenziert `CONSOLIDATED_KNOWLEDGE.md`
  („22 Alt-Dokumente") — `[cmd]` existiert nicht.

## Modulübergreifend — Portkonflikt als Konsument

- `[cmd]` Eigener Port 5300 konsistent (INDEX, SPEC_01, SPEC_07; Buddy,
  HumanCoach, Marketplace rufen `supplements:5300`).
- `[cmd]` **Aber:** `docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md`
  (Z. 47, 134) ruft `supplements:5200` — Port 5200 gehört Training.
  Einziger gefundener Portwiderspruch im 5x00-Schema.
- `[cmd]` `packages/scoring/src/supplements.ts` referenziert — Gerüst fehlt.
- `[read]` Next.js 15 (INDEX:79) vs. WebPlatform 14+.
- `[cmd]` Gerüst `services/supplements-api` existiert.
- Sicherheitsrelevant: Enhanced-Mode-Trennung und die Buddy-Safety-Regel
  „Supplements NIE als Reaktion auf Laborwerte" müssen beim Bau konsistent
  umgesetzt werden (Buddy-INDEX ↔ Supplements SPEC_01) — inhaltlich nicht
  gegeneinander geprüft `[annahme]`.

## Reifegrad

Strukturell komplett, Evidence-Modell klar.
**Einer Freigabe steht im Weg:** toter CONSOLIDATED-Verweis; der
5200/5300-Fehler im Nutrition-Workorder-Plan (dort korrigieren);
Feld- und Safety-Abgleich mit Buddy/Medical.
