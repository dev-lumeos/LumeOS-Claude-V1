# Spec-Audit: HumanCoach

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/HumanCoach/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Zählprüfungen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 12 Dateien: `INDEX.md` + `SPEC_01` bis `SPEC_11_UI_DESIGN`
(Slot 05 = `COACH_WORKFLOWS`).

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig, plus SPEC_11 (UI). SPEC_11 fehlt im eigenen INDEX, wird aber
von `WebPlatform/INDEX.md:47` referenziert.

## Interne Widersprüche

- `[cmd]` Zählprüfung: INDEX „10 Core Entities" / „10 Tabellen" — SPEC_02 hat
  10 Entity-Überschriften, SPEC_06 hat 10 `CREATE TABLE`. Deckt sich.
- Feldebene Entities↔DB↔API nicht abgeglichen `[annahme]`.

## Tote Verweise

- `[read]` `INDEX.md:10` referenziert `CONSOLIDATED_KNOWLEDGE.md`
  („10 Alt-Dokumente") — `[cmd]` existiert nicht (nur in Goals).

## Modulübergreifend

- `[cmd]` Port 5600 konsistent (INDEX, SPEC_01, SPEC_07); Coach-App
  `apps/coach/` Port 8502.
- `[cmd]` Gerüst `apps/coach` existiert; `services/coach-api` existiert als Gerüst.
- `[read]` „Client View: Integriert in apps/app/" (INDEX:101) — `[cmd]`
  `apps/app` existiert nicht (Haupt-App ist `apps/web`).
- `[cmd]` `packages/scoring/src/human-coach.ts` referenziert — Gerüst fehlt.
- `[read]` Next.js 15 (INDEX:100) vs. WebPlatform 14+.
- `[read]` SPEC_01 nennt konsistente Partner-Ports (nutrition 5100,
  training 5200, supplements 5300, recovery 5400, medical 5800, goals 5900).

## Reifegrad

Strukturell sauberster Standard-Modulordner (Zählungen stimmen, Schema
komplett). **Einer Freigabe steht im Weg:** toten CONSOLIDATED-Verweis
entfernen, SPEC_11 in INDEX aufnehmen, `apps/app`-Referenz korrigieren,
Feldabgleich Entities↔DB↔API nachholen.
