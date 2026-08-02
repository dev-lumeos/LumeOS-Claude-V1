---
status: generated_evidence
scope: webplatform_typecheck_blocker_fix
created_at: 2026-06-02
created_by: codex
authority: implementation_evidence_not_product_truth
---

# Web Typecheck Blocker Fix Report

## Ziel

`pnpm --filter @lumeos/web typecheck` sollte nach dem lokalen WebPlatform AppShell Draft wieder passieren. Der Scope war eng auf bestehende Nutrition-TypeScript-Blocker begrenzt.

## Initiale TypeScript-Fehler

| Datei | Fehler | Ursache | Minimaler Fix | Verhalten |
|---|---|---|---|---|
| `src/app/nutrition/curation/page.tsx` | TS2322 | Dynamische `Link href` Strings sind mit Next typed routes nicht direkt kompatibel. | `Route` importieren und lokale `curationRoute()` Cast-Hilfe verwenden. | Type-only |
| `src/app/nutrition/local-schema/nutrient-detail-panel.tsx` | TS2345 | `router.replace()` erwartet typed route, Helper liefern dynamische Strings. | Dynamische Helper-Ergebnisse lokal als `Route` casten. | Type-only |
| `src/lib/nutrition/food-search.ts` | TS1501 | Unicode property RegExp Flag ist mit dem aktuellen TS Target nicht erlaubt. | RegExp auf target-kompatible ASCII-Separator-Normalisierung umstellen. | Minimal behavior-impacting fuer nicht-lateinische Query-Zeichen |
| `src/lib/nutrition/food-search.ts` | TS2322 | Dynamische Zuweisung in `FoodSearchFilterState` kollabiert auf inkompatiblen Index-Typ. | Explizite `switch`-Zuweisung je Filter-Key; `offset` numerisch parsen. | Minimal behavior-impacting nur fuer string-basiertes `offset` in `next` |
| `src/lib/nutrition/preference-search-preview.ts` | TS1501 | Unicode property RegExp Flag ist mit dem aktuellen TS Target nicht erlaubt. | RegExp auf target-kompatible ASCII-Separator-Normalisierung umstellen. | Minimal behavior-impacting fuer nicht-lateinische Query-Zeichen |
| `src/lib/nutrition/preference-search-preview.ts` | TS2802 | `Set<string>` Spread braucht ES2015/downlevelIteration. | `Array.from(new Set(...))` verwenden. | Type-only |

## Geaenderte Dateien

- `apps/web/src/app/nutrition/curation/page.tsx`
- `apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx`
- `apps/web/src/lib/nutrition/food-search.ts`
- `apps/web/src/lib/nutrition/preference-search-preview.ts`
- `docs/project/generated-evidence/webplatform/web-typecheck-blocker-fix-report.md`

## Fixes

- Next typed routes wurden lokal mit `Route` kompatibel gemacht.
- Ungueltige Unicode property RegExp-Flags wurden entfernt.
- `Set`-Iteration wurde target-kompatibel gemacht.
- Dynamische Filter-State-Zuweisung wurde explizit typisiert.
- Kein `any`, kein `ts-ignore`, keine entfernte Nutrition-Funktionalitaet.

## Behavior Change

Es gab keine UI- oder Feature-Erweiterung. Die Normalisierung in zwei Nutrition-Suchfunktionen behandelt nicht-lateinische Query-Zeichen nun als Separator, weil das bisherige Unicode-property-RegExp mit dem aktuellen TypeScript Target nicht typisierbar war. Fuer den bestehenden BLS-/deutschen Search-Kontext bleibt die intendierte Umlaut-Normalisierung erhalten.

## Validierung

- Finaler Typecheck: `pnpm --filter @lumeos/web typecheck` -> passed.
- Test: `pnpm --filter @lumeos/web test` -> passed.
- Diff Check: `git diff --check` -> passed; CRLF-Warnungen fuer `.serena/project.yml` und `apps/web/src/app/nutrition/curation/page.tsx`.
- Route Probe auf `http://localhost:9501/`:
  - `/nutrition` -> 200
  - `/nutrition/foods` -> 200
  - `/nutrition/preferences` -> 200
  - `/nutrition/curation` -> 200
  - `/nutrition/local-schema` -> 200

## Remaining Blockers

Keine TypeScript-Blocker im Scope von `@lumeos/web typecheck` nach diesem Fix.

## Grenzen

- Keine DB-/Supabase-Kommandos.
- Keine Migrationen.
- Keine Secrets gelesen.
- Keine externen Repo-Writes.
- Kein Governance Sync Candidate.
- Kein Workorder, keine Queue, keine Approval und keine Execution Permission.
