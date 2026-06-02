---
status: compliance_review
reviewed_at: 2026-06-02
reviewed_by: codex
authority: source_spec_compliance_review_not_product_truth
---

# WebPlatform Source-Spec Compliance Review

## Zweck

Diese Review prüft den sichtbaren WebPlatform Foundation Phase 1 UI-Draft gegen die maßgeblichen Source-Specs unter `docs/specs/WebPlatform/`.

Boundary: Dieser Report ist keine Product Truth, kein approved Spec, kein Workorder, keine Queue, keine Approval und keine Execution Permission.

## Preflight-Klassifizierung

### Existing dirty / unrelated

- `.serena/project.yml` war bereits dirty und wurde nicht berührt.
- Untracked Docs-/Spec-/Screenshot-Bereiche außerhalb der WebPlatform-Evidence bleiben unrelated und wurden nicht verändert.

### WebPlatform Draft Files

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/nutrition/page.tsx`
- `apps/web/src/app/nutrition/foods/page.tsx`
- `apps/web/src/app/nutrition/preferences/page.tsx`
- `apps/web/src/app/goals/page.tsx`
- `apps/web/src/app/training/page.tsx`
- `apps/web/src/app/recovery/page.tsx`
- `apps/web/src/app/supplements/page.tsx`
- `apps/web/src/app/coach/page.tsx`
- `apps/web/src/app/settings/page.tsx`
- `apps/web/src/components/shell/app-shell.tsx`
- `apps/web/src/components/ui/*`
- `docs/project/generated-evidence/webplatform/*`

## Source Specs Gelesen

- `docs/specs/WebPlatform/INDEX.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`
- `docs/specs/WebPlatform/SPEC_03_DASHBOARD.md`
- `docs/specs/WebPlatform/SPEC_04_NUTRITION_UI.md`
- `docs/specs/WebPlatform/SPEC_05_TRAINING_UI.md`
- `docs/specs/WebPlatform/SPEC_06_RECOVERY_UI.md`
- `docs/specs/WebPlatform/SPEC_07_SUPPLEMENTS_UI.md`
- `docs/specs/WebPlatform/SPEC_08_GOALS_UI.md`
- `docs/specs/WebPlatform/SPEC_10_WORKSPACE_LINKS.md`

## Kleine Fixes Angewendet

- Sidebar-Breite von `16rem` auf `15rem` gesetzt, passend zu 240px aus `SPEC_01_APP_SHELL.md`.
- Core-Navigation an `SPEC_01_APP_SHELL.md` angenähert: Dashboard `1`, Nutrition `2`, Training `3`, Recovery `4`, Supplements `5`, Goals & Body `6`.
- Coach aus dem Core-Shortcut-Set in eine Workspace-Gruppe verschoben, weil Workspaces laut `INDEX.md` und `SPEC_10_WORKSPACE_LINKS.md` separate Anwendungen sind.
- Fehlende Akzenttokens aus `SPEC_02_DESIGN_SYSTEM.md` ergänzt: `--acc-medic`, `--acc-buddy`, `--acc-mkt`, `--acc-admin`.
- Light-Mode-Basistokens und Light-Mode-Modulakzente ergänzt, soweit `SPEC_02_DESIGN_SYSTEM.md` sie konkret definiert.
- Topbar-Akzentlinie ergänzt, passend zur `topbar::after`-Anforderung aus `SPEC_01_APP_SHELL.md`.
- Active-Nav-Indikator von Card-Boxshadow auf 2px `::before`-Leiste umgestellt, passend zur Source-Spec.

## Compliance-Matrix

| Bereich | Source-Spec-Anforderung | Aktueller UI-Stand | Status | Abweichung | Fix-Empfehlung |
| ------- | ----------------------- | ------------------ | ------ | ---------- | -------------- |
| Design-Philosophie | Linear-style, datenorientiert, professionell; Modulfarben als Akzent, nicht Fläche; Numerics mono/tabular. | Draft nutzt kompakte Tokens, Statusreihen und kleine Akzentpunkte; Numerics in `MetricCard` via `.num`. | partial | Nicht alle numerischen Werte in preserved `/nutrition/foods` sind vereinheitlicht; kein vollständiges package/ui System. | Später systematisch auf alle Tabellen/Nutrition-Detailwerte anwenden. |
| Basis-Farb-Tokens | `--bg`, `--bg-elev`, `--surface`, `--surface-2`, `--surface-hover`, `--border`, `--fg*` in OKLCH. | Tokens in `globals.css` vorhanden. | compliant | Keine relevante Abweichung im Draft-Scope. | Keine. |
| Modul-Farben | Dashboard steel, Nutrition clay/amber, Training lavender, Recovery sage, Supplements terracotta, Goals mustard, Medical rust, Coach slate-cyan, Buddy lilac, Marketplace moss, Admin neutral. | Alle relevanten Tokens sind jetzt vorhanden; sichtbare Routes nutzen route-aware `--acc`. | partial | Kein Medical-Modul/Route im aktuellen Draft; Buddy/Marketplace/Admin sind nicht als Workspace-Links umgesetzt. | Medical und Workspace-Link-Gruppe separat umsetzen, nicht in diesem Draft-Pass. |
| Light Mode | `data-theme="light"` soll Light-Mode-Tokens setzen. | Light-Mode-Tokens wurden ergänzt. | partial | Kein Theme-Toggle und keine Persistenz via `localStorage`. | Theme Provider/Toggle als späterer AppShell-Task. |
| Typografie | Body/UI Inter; Zahlen JetBrains Mono/ui-monospace; Display 28px, Heading 16px, Body 13px, Small 11px. | Draft nutzt 13px/16px/28px nahe am Spec und `.num` für MetricCard. | partial | Keine echte Font-Konfiguration für Inter/JetBrains Mono; preserved Food Search nutzt ältere Tailwind-Skala. | Font-Setup und Nutrition-Food-Search-Restyle separat. |
| Spacing/Radius | Card Padding 16px, Radius 8px, Radius-sm 6px, `space-y-4`. | Tokens und neue Components folgen dem Muster. | compliant | Keine relevante Abweichung im neuen Draft-Scope. | Keine. |
| Cards | Card Primitive mit `title`, `sub`, `accent` Dot. | `Card` unterstützt `title`, `sub`, `accent`. | compliant | Kein shadcn Wrapper, weil keine neue Dependency/Refactor. | Bei UI-Package-Migration auf shadcn wrappern. |
| Pills/Badges | Pill Varianten default/pos/warn/neg/accent/outline. | StatusBadge nutzt semantische Draft-Tones und Tokenfarben. | partial | Variant-Namen weichen ab; semantisch aber passend für Draft-Grenzen. | Bei UI-Package-Migration auf Source-Variant-Namen mappen. |
| AppShell Layout | 3-Spalten-Shell: Sidebar 240px, Content fluid, Context Panel 340px; optional hidden Panel. | Sidebar jetzt 240px; Content vorhanden; Context Panel fehlt. | partial | Kein Context Panel, keine persistente Collapse-Preference. | Größerer Shell-Task, nicht in diesem Compliance-Pass. |
| Sidebar Gruppen | Brand, Search, Modules, Workspaces, System, User. | Brand, Modules, Workspaces, System, User vorhanden; Search fehlt. | partial | Keine Search/Command-Palette; Workspaces nur Coach Draft, nicht alle externen Domains. | Search/Command-Palette und Workspace-Linkliste separat. |
| Core Module Shortcuts | 1 Dashboard, 2 Nutrition, 3 Training, 4 Recovery, 5 Supplements, 6 Goals & Body, 7 Medical. | 1-6 jetzt source-konform für vorhandene Routes; 7 Medical fehlt. | partial | Medical Route fehlt; Coach war vorher fälschlich Core-Shortcut und wurde in Workspace verschoben. | Medical als eigenes Modul nur mit Spec/Scope-Freigabe ergänzen. |
| Active Nav State | Active Item `background: var(--surface)`, 2px left bar in `--acc`. | `::before` 2px Accent-Leiste und route-aware `--acc` vorhanden. | compliant | Keine relevante Abweichung. | Keine. |
| Topbar | Mod-Tag, Breadcrumb, Sync-Pill, Notifications, Theme Toggle, Context Toggle, Commands, 2px Accent-Linie. | Topbar hat Modul-Meta, Titel, Draft-Statusstrip und Accent-Linie. | partial | Sync, Notifications, Theme Toggle, Context Toggle und Commands fehlen. | Als Shell-Feature separat implementieren. |
| Context Panel | 340px Panel mit Buddy, Insights, Quick Actions, Module Details. | Nicht implementiert. | not_implemented | Größere Featurefläche fehlt. | Nicht in Phase-1-Draft-Fix; als eigenes Work-Paket. |
| Dashboard Routing | `/dashboard`, keine Subroutes, eine scrollbare Seite. | `/dashboard` und `/` rendern Dashboard. | compliant | `/` zusätzlich als Einstieg, aber nicht konfliktiv. | Keine. |
| Dashboard Layout | 4 KPI Cards, Today Flow Timeline, Macros Today, Activity Feed, Readiness, Tonight Plan. | Draft hat 4 KPI-artige Cards und Today Flow; Macros/Activity/Readiness/Tonight sind nicht echt implementiert. | partial | Produktdaten fehlen absichtlich; echte Komponenten nicht vorhanden. | Als Dashboard-Feature separat mit echten Empty States umsetzen. |
| Dashboard Empty States | Keine Produktions-Placeholder, definierte Empty States. | Draft markiert klar Mock/Read-only und Grenzen. | partial | Noch Draft-Placeholder, nicht produktionsreif. | Für Product-Commit echte Empty-State-Komponenten gemäß Spec. |
| Nutrition Routing | `/nutrition` Diary default, `/nutrition/foods` Food DB/Search, `/nutrition/planner`, `/nutrition/insights`. | `/nutrition` ist Foundation Overview; `/nutrition/foods` preserved Food Search; preferences redirect; planner/insights fehlen. | mismatch | Default-Route weicht bewusst vom Diary-Spec ab. | Für Product-Scope `/nutrition` auf Diary ausbauen; Draft kann als Review-Overview bleiben, aber ist nicht spec-compliant. |
| Nutrition BLS Boundary | Ausschließlich BLS, kein USDA/OFF. | Overview und Food Search markieren BLS-only. | compliant | Keine relevante Abweichung. | Keine. |
| Nutrition Food DB/Search | `/nutrition/foods` Food Database + Search, BLS Source. | Preserved old Food Search unter `/nutrition/foods`. | partial | UI ist älter/dunkler und nicht vollständig an neue Tokens/Tab-Struktur angepasst. | Nicht in diesem Pass restylen, um Funktion nicht zu brechen. |
| Nutrition Tabs | Diary/Foods/Planner/Insights Tab-Navigation. | Nicht implementiert; Overview-Linkcards statt Tabs. | not_implemented | Tab-Navigation fehlt. | Separater Nutrition UI task. |
| Goals Routing | `/goals` als Goals + Body alle Tabs auf einer Route. | `/goals` vorhanden. | compliant | Keine relevante Routing-Abweichung. | Keine. |
| Goals Tabs | Goals, Timeline, Body Metrics, Measurements, Composition. | Als geplante Tab-Liste sichtbar, aber nicht interaktiv. | partial | Keine echte Tab-Komponente und keine Featureflächen. | Separater Goals UI task. |
| Goal Cards | 2-Spalten Goal Cards mit Progress, Meta, Linked Modules, Actions. | Draft zeigt keine echten Goals, sondern Placeholder und 0%-Progress. | partial | Keine echten Goal Cards, bewusst keine Fake-Live-Ziele. | Echte Empty State + Goal Card Skeleton nach Freigabe. |
| Workspace Links | Coach/Buddy/Marketplace/Admin als separate Apps, neue Tabs, kein Embed. | Coach als Workspace Draft in Sidebar; Buddy/Marketplace/Admin fehlen. | partial | Externe Workspace-Linkliste nicht vollständig. | Separat implementieren; keine externen Links ohne Produktfreigabe. |
| Governance | WebPlatform Spec trennt Admin/Workspaces; Governance ist keine WebPlatform Core-Route. | Governance bleibt System/Ops-Link, Shell bypass bleibt erhalten. | partial | Governance ist repo-spezifische bestehende Route, nicht Source-WebPlatform-Modul. | Weiterhin nicht als Product Core behandeln. |

## Bewertung

Der Draft ist nach den kleinen Fixes näher an den maßgeblichen Source-Specs, bleibt aber klar ein Foundation-/Review-Draft. Die größten Compliance-Lücken sind Feature- und Layout-Flächen, die nicht klein genug für diesen Pass sind:

- fehlendes Context Panel,
- fehlende Command/Search/Theme/Sync Controls,
- fehlendes Medical Core-Modul,
- unvollständige Workspace-Linkliste,
- Dashboard nur KPI-/Flow-artig statt vollständiger KPI/Macros/Activity/Readiness/Tonight-Struktur,
- `/nutrition` weicht vom Diary-default ab,
- Nutrition Tabs/Planner/Insights fehlen,
- Goals Tabs und echte Goal Cards sind nicht implementiert.

## Route Smoke

Bestehender Dev Server wurde wiederverwendet:

- URL: `http://localhost:9501/`
- Listening PID: `159420`

| Route | Status | Ergebnis |
| ----- | -----: | -------- |
| `/` | 200 | OK |
| `/dashboard` | 200 | OK |
| `/nutrition` | 200 | OK |
| `/nutrition/foods` | 200 | OK |
| `/nutrition/preferences` | 200 | OK |
| `/goals` | 200 | OK |
| `/training` | 200 | OK |
| `/recovery` | 200 | OK |
| `/supplements` | 200 | OK |
| `/coach` | 200 | OK |
| `/medical` | 200 | OK |
| `/settings` | 200 | OK |

## Validierung

- `git diff --check`: passed. Bestehende `.serena/project.yml` CRLF-Warnung bleibt unrelated.
- `pnpm --filter @lumeos/web test`: passed, exit code 0.
- `pnpm --filter @lumeos/web typecheck`: failed.

Typecheck-Fehlerklassifizierung: bestehend/unrelated zu diesem Compliance-Pass.

Bekannte verbleibende Fehler:

- `src/app/nutrition/curation/page.tsx`: typed-route Link-String-Fehler.
- `src/app/nutrition/local-schema/nutrient-detail-panel.tsx`: typed-route Router-Argument-Fehler.
- `src/lib/nutrition/food-search.ts`: ES-Target-/Type-Fehler.
- `src/lib/nutrition/preference-search-preview.ts`: ES-Target-/Iteration-Fehler.

## Phase 1B Source-Spec Gap Fix Pass - 2026-06-02

Ziel: die wichtigsten Source-Spec-Gaps schließen, ohne Backend, DB, Product Truth oder Live-Daten zu behaupten.

Specs erneut gelesen:

- `SPEC_01_APP_SHELL.md`
- `SPEC_02_DESIGN_SYSTEM.md`
- `SPEC_03_DASHBOARD.md`
- `SPEC_04_NUTRITION_UI.md`
- `SPEC_08_GOALS_UI.md`
- `SPEC_09_MEDICAL_UI.md`
- `SPEC_10_WORKSPACE_LINKS.md`

Fixes angewendet:

- `/nutrition` ist jetzt diary-first statt reine Foundation-Overview. Die Seite zeigt Macro-KPI-Strip, Meal-List-Placeholder, Tab-Zeile und klare No-Write-Boundary.
- `/nutrition/foods` blieb unverändert erhalten.
- `/nutrition/preferences` bleibt als vorhandener Redirect/Entry erhalten.
- AppShell wurde auf 3-Spalten-Rhythmus erweitert: Sidebar, Content, Context Panel.
- Context Panel zeigt pro aktivem Modul Status, Boundary, nächste sichere Aktion und Module Detail als read-only Draft.
- Search/Command Placeholder wurde in der Sidebar sichtbar gemacht.
- Topbar zeigt Sync Mock, Theme Demo, Context sichtbar und Commands später als nicht-live Controls.
- Medical wurde als 7. Core-Modul in Navigation und Route `/medical` ergänzt.
- `/medical` ist ein sensibler Placeholder: Monitoring only, keine Diagnose, keine Therapie, keine Live-Daten.
- Workspace Links wurden source-näher: Coach, Buddy, Marketplace und Admin als externe Links in neuem Tab; lokaler `/coach` Draft bleibt zusätzlich erhalten.
- Settings zeigt Workspace Links als sichtbare Mock-Liste.
- Dashboard wurde um Medical und Workspace-Link-Orientierung ergänzt.

Aktualisierter Delta-Status:

| Bereich | Status nach Phase 1B | Kommentar |
| ------- | -------------------- | --------- |
| Module Color Mapping | partial | Core-Modulfarben inklusive Medical sind sichtbar; externe Workspace-Akzente sind als Tokens vorhanden, aber keine aktiven Workspace-Routes. |
| Nutrition Default Route | partial | `/nutrition` ist diary-first und nicht mehr Overview-only; echte Diary-Daten, Planner und Insights bleiben bewusst nicht implementiert. |
| Context Panel | partial | Panel existiert und ist modulbezogen, aber nicht collapsible/persistent und ohne echte Insights/API-Daten. |
| Search / Command | partial | Placeholder sichtbar, keine Command Palette und keine Suche außer vorhandener Food Search. |
| Theme / Sync Controls | partial | Sichtbare Mock Controls vorhanden, keine Persistenz und kein echter Sync-State. |
| Medical Core Module | partial | `/medical` und Nav-Item vorhanden; echte Medical-Tabs/Daten bleiben aus Sicherheitsgründen Backlog. |
| Workspace Links | partial | Externe Links sichtbar und kein Embed; SSO, Role-Gate und Badge Counts bleiben nicht implementiert. |
| Dashboard | partial | Dashboard zeigt Medical/Workspace-Status, bleibt ohne echte Macros/Activity/Readiness/Tonight-Daten. |
| Goals | partial | Unverändert Foundation-Draft mit Tabs/Blöcken als nicht-live Struktur. |

Route Smoke nach Phase 1B:

| Route | Status | Ergebnis |
| ----- | -----: | -------- |
| `/` | 200 | OK |
| `/dashboard` | 200 | OK |
| `/nutrition` | 200 | OK |
| `/nutrition/foods` | 200 | OK |
| `/nutrition/preferences` | 200 | OK |
| `/goals` | 200 | OK |
| `/training` | 200 | OK |
| `/recovery` | 200 | OK |
| `/supplements` | 200 | OK |
| `/coach` | 200 | OK |
| `/medical` | 200 | OK |
| `/settings` | 200 | OK |

Verbleibende Mismatches:

- Context Panel ist nicht collapsible und nicht persistent.
- Command Palette ist nicht implementiert.
- Theme Toggle und Sync State sind sichtbar, aber nicht funktional.
- Nutrition Planner und Insights fehlen.
- Dashboard enthält keine echten Macros/Activity/Readiness/Tonight-Daten.
- Goals Tabs sind nicht interaktiv und echte Goal Cards fehlen.
- Medical-Tabs, Uploads, Lab Results und Datenschutzlogik fehlen bewusst.
- Workspace SSO, Admin Role-Gate und Badge Counts fehlen.

## Empfehlung

Nicht als vollständig source-spec-compliant committen. Für einen scoped Draft Commit ist der Stand nur dann vertretbar, wenn die bekannten Abweichungen ausdrücklich als Phase-1-Draft-Grenzen akzeptiert werden und bestehende Typecheck-Blocker separat behandelt oder waived werden.
