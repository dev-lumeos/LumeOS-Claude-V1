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

## Phase 2A – SPEC_01/SPEC_02 Compliance

Ziel: App Shell und Design-System-Foundation näher an `SPEC_01_APP_SHELL.md` und `SPEC_02_DESIGN_SYSTEM.md` bringen. Diese Phase bleibt `implementation_draft`, nicht Product Truth, nicht approved Spec, nicht Workorder, nicht Queue und nicht Execution Approval.

Source Specs gelesen:

- `docs/specs/WebPlatform/INDEX.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Requirements checked:

- 3-column shell: 240px Sidebar, fluid Content, 340px Context Panel.
- Hidden Context Panel state.
- Density variants.
- Sidebar Brand/Search/Modules/Workspaces/System/User.
- 7 Core Modules.
- Workspace links as separate group.
- Active state with 2px module accent bar.
- Topbar with module tag, breadcrumb, sync pill, notification placeholder, theme toggle, context toggle, commands.
- Topbar accent line.
- Context Panel with Buddy widget, insight cards, quick actions, module details.
- Keyboard navigation placeholders and 1-7 module shortcuts.
- Route structure awareness.
- Command palette placeholder.
- Profile/settings trigger placeholder.
- OKLCH dark/light tokens.
- Module accent tokens.
- Status colors.
- Typography scale and `.num` mono/tabular class.
- Card/Pill/Badge primitives and placeholder Tabs/Modal/Drawer primitives.
- Avoid hardcoded colors in new LumeOS shell/components where practical.

Implemented:

- Shell grid now uses `240px minmax(0, 1fr) 340px` with `height: 100dvh`, `width: 100vw`, and hidden-panel grid via `data-right-panel="hidden"`.
- AppShell supports local `rightPanel`, `theme`, and `density` state using `localStorage` keys `lumeos-right-panel`, `lumeos-theme`, and `lumeos-density`.
- `data-theme` is set on `<html>` and `data-density` / `data-right-panel` are set on the shell root.
- Sidebar keeps Brand, Search/Command trigger, Modules, Workspaces, System, and User/Profile placeholder.
- Module nav has the 7 SPEC_01 modules in order: Dashboard, Nutrition, Training, Recovery, Supplements, Goals & Body, Medical.
- Workspace nav links Coach Portal, Buddy, Marketplace, and Admin as external new-tab links; local Coach Draft remains a visible placeholder route.
- Topbar now has module tag, `Workspace / {Module}` breadcrumb, sync mock, notification placeholder, theme toggle, context toggle, density control, and commands placeholder.
- Topbar accent line follows active module `--acc`.
- Context Panel shows header, Buddy placeholder, module-specific insight cards, quick actions, module detail, and next safe action.
- Keyboard shortcuts `1` through `7` navigate between core modules when focus is not inside an input/control.
- `globals.css` includes SPEC_02 OKLCH base tokens, status tokens, dark/light theme tokens, module accent tokens, radius/padding tokens, `.num` mono/tabular class, and density padding variants.
- `StatusBadge` now supports SPEC_02-style variants: `default`, `pos`, `warn`, `neg`, `accent`, `outline`, while keeping earlier draft tones.
- UI primitives include placeholder `TabPlaceholder`, `ModalPlaceholder`, and `DrawerPlaceholder`.

Partial:

- Command Palette is still a placeholder, not `cmdk`.
- Notifications are a placeholder, not a real unread-count system.
- Sync pill is a mock/offline label, not real sync state.
- Theme and Context controls persist locally, but no full settings modal exists.
- Profile trigger is visible as avatar placeholder, but does not open the 7-tab ProfileSettings modal.
- Context Panel is collapsible and persisted, but not animated and not driven by live module data.
- Sidebar icon-only behavior exists under 1280px, but is CSS-only and not a full interaction model.
- shadcn/lucide primitives are not added because no new dependency expansion was allowed.

Missing / intentional phase cuts:

- Full Command Palette categories and search are not implemented.
- ProfileSettings modal tabs are not implemented.
- Real Buddy animation states are not implemented.
- Real sync/offline queue state is not implemented.
- Workspace SSO, role gates, badge counts, and error toast are not implemented.
- `packages/ui` migration is not performed.
- Sparkline primitive is not implemented.

Remaining mismatches:

- SPEC_01 acceptance criteria are only partially met because Command Palette, Profile modal, real Sync, and full workspace handoff are out of this draft scope.
- SPEC_02 acceptance criteria are partially met in `apps/web`, but not as a full `packages/ui`/shadcn implementation.

## SPEC_02 Hard Gate – Source Token Contract

Authoritative source:

- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`

Exact design principles extracted:

- Linear-style, datenorientiert, professionell.
- Modul-Farben als Orientierung: Akzent, nie als große Fläche.
- Numerics immer in Mono mit tabular-nums.
- Active nav state uses `background: var(--surface)`, `color: var(--fg)`, and a 2px left bar in `var(--acc)`.
- Topbar accent line is a 2px gradient line using `var(--acc)`.

Exact base dark tokens:

```css
--bg: oklch(0.155 0.005 270);
--bg-elev: oklch(0.185 0.005 270);
--surface: oklch(0.205 0.005 270);
--surface-2: oklch(0.235 0.005 270);
--surface-hover: oklch(0.255 0.005 270);
--border: oklch(0.280 0.005 270);
--border-strong: oklch(0.360 0.005 270);
--fg: oklch(0.970 0.000 0);
--fg-muted: oklch(0.720 0.005 270);
--fg-subtle: oklch(0.550 0.005 270);
--fg-dim: oklch(0.420 0.005 270);
```

Exact light tokens:

```css
--bg: oklch(0.985 0.002 270);
--bg-elev: oklch(1.000 0.000 0);
--surface: oklch(1.000 0.000 0);
--surface-2: oklch(0.975 0.003 270);
--surface-hover: oklch(0.955 0.003 270);
--border: oklch(0.910 0.003 270);
--border-strong: oklch(0.820 0.005 270);
--fg: oklch(0.200 0.005 270);
--fg-muted: oklch(0.400 0.005 270);
--fg-subtle: oklch(0.550 0.005 270);
--fg-dim: oklch(0.680 0.005 270);
```

Exact status colors:

```css
--pos: oklch(0.78 0.13 150);
--warn: oklch(0.82 0.13 80);
--neg: oklch(0.72 0.16 22);
```

Exact module accent tokens:

```css
--acc-dash:  oklch(0.78 0.04 240);
--acc-nutri: oklch(0.78 0.10 70);
--acc-train: oklch(0.74 0.10 290);
--acc-recov: oklch(0.78 0.08 160);
--acc-suppl: oklch(0.76 0.10 25);
--acc-goals: oklch(0.80 0.10 95);
--acc-medic: oklch(0.76 0.09 15);
--acc-coach: oklch(0.78 0.08 200);
--acc-buddy: oklch(0.76 0.09 310);
--acc-mkt:   oklch(0.78 0.08 145);
--acc-admin: oklch(0.75 0.01 270);
--acc: var(--acc-dash);
```

Exact numeric mono rule:

```css
.num, .num * {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' on, 'zero' on;
  letter-spacing: -0.01em;
}
```

## SPEC_02 Hard Gate – Module Accent Compliance

Implementation notes:

- Single route-to-module accent map is implemented in `apps/web/src/components/shell/app-shell.tsx`.
- Route shell root sets `--acc` from the active module token.
- Sidebar active item uses a 2px left bar plus subtle token border/background.
- Sidebar inactive module and workspace items show their own token dot via `--item-acc`.
- Topbar module tag and 2px line use active route `--acc`.
- Page eyebrows inherit active route `--acc`.
- Context panel header, Buddy orb, and insight marker use active route `--acc`.
- Module cards accept an explicit `accent` prop and render a token top marker/border.
- `/settings` contains a draft-only “Design System / Module Accent Proof” block for Dashboard, Nutrition, Training, Recovery, Supplements, Goals & Body, Medical, Coach, Buddy, Marketplace, and Admin.

Route-to-module map:

| Route Pattern | Module | Token |
| --- | --- | --- |
| `/`, `/dashboard` | Dashboard | `--acc-dash` |
| `/nutrition`, `/nutrition/*` | Nutrition | `--acc-nutri` |
| `/training`, `/training/*` | Training | `--acc-train` |
| `/recovery`, `/recovery/*` | Recovery | `--acc-recov` |
| `/supplements`, `/supplements/*` | Supplements | `--acc-suppl` |
| `/goals`, `/goals/*` | Goals & Body | `--acc-goals` |
| `/medical`, `/medical/*` | Medical | `--acc-medic` |
| `/coach`, `/coach/*` | Coach | `--acc-coach` |
| `/settings` | Settings/System | `--acc-dash` documented neutral dashboard/system accent |
| Workspace Coach Link | Coach | `--acc-coach` |
| Workspace Buddy Link | Buddy | `--acc-buddy` |
| Workspace Marketplace Link | Marketplace | `--acc-mkt` |
| Workspace Admin Link | Admin | `--acc-admin` |

Compliance table:

| Route | Module | Expected Token | Sidebar Active | Sidebar Dot | Topbar | Page Eyebrow | Context Panel | Cards | Status |
| ----- | ------ | -------------- | -------------- | ----------- | ------ | ------------ | ------------- | ----- | ------ |
| `/` | Dashboard | `--acc-dash` | pass | pass | pass | pass | pass | pass | pass |
| `/dashboard` | Dashboard | `--acc-dash` | pass | pass | pass | pass | pass | pass | pass |
| `/nutrition` | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass | pass | pass |
| `/training` | Training | `--acc-train` | pass | pass | pass | pass | pass | pass | pass |
| `/recovery` | Recovery | `--acc-recov` | pass | pass | pass | pass | pass | pass | pass |
| `/supplements` | Supplements | `--acc-suppl` | pass | pass | pass | pass | pass | pass | pass |
| `/goals` | Goals & Body | `--acc-goals` | pass | pass | pass | pass | pass | pass | pass |
| `/medical` | Medical | `--acc-medic` | pass | pass | pass | pass | pass | pass | pass |
| `/coach` | Coach | `--acc-coach` | pass | pass | pass | pass | pass | pass | pass |
| `/settings` | Settings/System | `--acc-dash` | pass | pass | pass | pass | pass | pass | pass |
| `/settings` proof | Coach | `--acc-coach` | pass | pass | pass | pass | pass | pass | pass |
| `/settings` proof | Buddy | `--acc-buddy` | pass | pass | pass | pass | pass | pass | pass |
| `/settings` proof | Marketplace | `--acc-mkt` | pass | pass | pass | pass | pass | pass | pass |
| `/settings` proof | Admin | `--acc-admin` | pass | pass | pass | pass | pass | pass | pass |

Gate result: pass.

## SPEC_01/SPEC_02 Hard Reset Compliance

Authoritative specs read directly:

- `docs/specs/WebPlatform/INDEX.md`
- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Extracted reset requirements before implementation:

- SPEC_01: root shell `240px` Sidebar, fluid Content, `340px` Context Panel; `100dvh`; `100vw`; root overflow hidden; content vertical scroll; no horizontal shell overflow; context panel hidden state; density variants; SidebarBrand with logo/name/version; SidebarSearch command trigger; nav groups Modules/Workspaces/System; seven core modules; workspace links Coach/Buddy/Marketplace/Admin as secondary external links; System Settings; SidebarUser; active 2px accent bar; Topbar MOD-TAG/Breadcrumb/Sync/Bell/Theme/Context/Commands; topbar 2px accent line; Context header/Buddy/2-4 insights/2-4 quick actions/module details; shortcut hints `1`-`7`.
- SPEC_02: Linear-style data-oriented professional shell; module colors as accents only; OKLCH dark/light/base/status/module tokens; active `--acc`; numeric mono/tabular utility; typography scale; density-controlled `--pad-card`; radius tokens; card/pill/badge primitives; no arbitrary hardcoded colors in the product shell where tokens exist.

Implementation notes:

- Removed Governance from the product AppShell System nav to match this reset's source requirement: System shows Settings only. Governance route itself remains untouched and unwrapped when opened directly.
- Kept dependency-free module icon slots because `lucide-react` is not installed and this reset forbids adding dependencies.
- Hardened `.lume-content` descendants and tables to prevent existing `/nutrition/foods` UI from forcing horizontal shell overflow.
- Topbar now has an explicit minimum height so controls are not vertically clipped.

### A. SPEC_01 Shell Requirements

| Requirement | Expected | Actual | Status |
| ----------- | -------- | ------ | ------ |
| Root shell columns | `240px 1fr 340px` | `.lume-shell` uses `240px minmax(0, 1fr) 340px` | pass |
| Root height | `100dvh` | `.lume-shell { height: 100dvh; }` | pass |
| Root width | `100vw` | `.lume-shell { width: 100vw; }` | pass |
| Root overflow | hidden | `.lume-shell { overflow: hidden; }` | pass |
| Content vertical scroll | content scrolls vertically only | `.lume-content` uses `overflow-y: auto`, `overflow-x: hidden` | pass |
| No horizontal shell overflow | no document/shell/content horizontal overflow | Headless Edge/CDP route checks passed for all required routes | pass |
| Context hidden state | `240px 1fr` when hidden | `data-right-panel="hidden"` uses `240px minmax(0, 1fr)` | pass |
| Density variants | compact/default/comfortable affect `--pad-card` | `data-density` variants set `--pad-card` | pass |
| SidebarBrand | logo/name/version tag | Brand mark `L`, `LumeOS`, `v0.9.4`, `Athlete OS` | pass |
| SidebarSearch | command trigger | `Search or jump to...` with `⌘K` | pass |
| Nav groups | Modules, Workspaces, System | all three groups rendered | pass |
| Seven core modules | Dashboard, Nutrition, Training, Recovery, Supplements, Goals & Body, Medical | all seven rendered with shortcuts | pass |
| Workspace links | Coach Portal, Buddy, Marketplace, Admin external secondary links | all four rendered with `target="_blank"` and `↗` | pass |
| System nav | Settings | product shell System nav renders Settings only | pass |
| SidebarUser | avatar/name/role/more | `TM`, Tom, Athlete/Draft Tier, more button | pass |
| Active state | 2px accent bar | `.lume-nav-item-active::before` uses `width: 2px` and `--item-acc` | pass |
| Topbar structure | MOD-TAG, breadcrumb, sync, bell, theme, context, commands | all rendered and measured visible | pass |
| Topbar accent line | 2px active accent gradient | `.lume-topbar::after` uses 2px `var(--acc)` gradient | pass |
| Context header | `Context · {ModuleLabel}` | verified on all checked routes | pass |
| Buddy widget | Buddy block with avatar/orb/message | `.lume-buddy-widget` with accent orb and message | pass |
| Insight cards | 2-4 cards | verified 2-3 cards per checked route | pass |
| Quick actions | 2-4 actions | verified 2-3 actions per checked route | pass |
| Module details | details block | details, boundary, next safe action block rendered | pass |
| Shortcut hints | `1`-`7` visible/prepared | sidebar shows shortcuts and keyboard handler routes modules | pass |

### B. SPEC_02 Design Token Requirements

| Requirement | Expected | Actual | Status |
| ----------- | -------- | ------ | ------ |
| Visual principle | Linear-style, data-oriented, professional | shell uses restrained surfaces, borders, compact typography, no large accent fills | pass |
| Module colors as accents | accents only, not large surfaces | accents used as dots/icons/bars/borders/tag markers only | pass |
| Dark base tokens | OKLCH dark tokens | `:root` contains `--bg`, `--bg-elev`, `--surface`, `--surface-2`, `--surface-hover`, `--border`, `--border-strong`, `--fg`, `--fg-muted`, `--fg-subtle`, `--fg-dim` | pass |
| Light tokens | `[data-theme="light"]` base tokens | light base tokens present | pass |
| Status tokens | `--pos`, `--warn`, `--neg` | exact status tokens present | pass |
| Dashboard accent | `--acc-dash: oklch(0.78 0.04 240)` | present | pass |
| Nutrition accent | `--acc-nutri: oklch(0.78 0.10 70)` | present | pass |
| Training accent | `--acc-train: oklch(0.74 0.10 290)` | present | pass |
| Recovery accent | `--acc-recov: oklch(0.78 0.08 160)` | present | pass |
| Supplements accent | `--acc-suppl: oklch(0.76 0.10 25)` | present | pass |
| Goals accent | `--acc-goals: oklch(0.80 0.10 95)` | present | pass |
| Medical accent | `--acc-medic: oklch(0.76 0.09 15)` | present | pass |
| Coach accent | `--acc-coach: oklch(0.78 0.08 200)` | present | pass |
| Buddy accent | `--acc-buddy: oklch(0.76 0.09 310)` | present | pass |
| Marketplace accent | `--acc-mkt: oklch(0.78 0.08 145)` | present | pass |
| Admin accent | `--acc-admin: oklch(0.75 0.01 270)` | present | pass |
| Active `--acc` | resolves to active module | AppShell sets `--acc: var(--acc-*)` from one route map | pass |
| Numeric utility | mono/tabular nums | `.num, .num *` uses mono and tabular settings | pass |
| Typography scale | spec-like display/heading/body/small/eyebrow | shell primitives use compact 28/16/13/11/10-ish scale | pass |
| Density padding | `--pad-card` via density | density variants set `--pad-card` | pass |
| Radius tokens | `--radius`, `--radius-sm`, `--radius-lg` | all present and used | pass |
| Card/Pill/Badge primitives | reusable primitives | `Card`, `ModuleCard`, `StatusBadge`, pill variants present | pass |
| Avoid arbitrary product-shell colors | tokenized shell colors | product shell CSS uses tokens and color-mix with tokens | pass |

### C. Route Visual Compliance

| Route | Module | Expected Accent | Shell Overflow | Topbar | Sidebar | Context Panel | Status |
| ----- | ------ | --------------- | -------------- | ------ | ------- | ------------- | ------ |
| `/` | Dashboard | `--acc-dash` | pass | pass | pass | pass | pass |
| `/dashboard` | Dashboard | `--acc-dash` | pass | pass | pass | pass | pass |
| `/nutrition` | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass |
| `/nutrition/foods` | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass |
| `/nutrition/preferences` | Nutrition | `--acc-nutri` | pass | pass | pass | pass | pass |
| `/goals` | Goals & Body | `--acc-goals` | pass | pass | pass | pass | pass |
| `/training` | Training | `--acc-train` | pass | pass | pass | pass | pass |
| `/recovery` | Recovery | `--acc-recov` | pass | pass | pass | pass | pass |
| `/supplements` | Supplements | `--acc-suppl` | pass | pass | pass | pass | pass |
| `/medical` | Medical | `--acc-medic` | pass | pass | pass | pass | pass |
| `/coach` | Coach | `--acc-coach` | pass | pass | pass | pass | pass |
| `/settings` | Settings/System | `--acc-dash` | pass | pass | pass | pass | pass |

Hard reset gate result:

- SPEC_01 Shell Gate: pass.
- SPEC_02 Design Token Gate: pass.

## Phase 2A.3 – SPEC_01 AppShell Rebuild Compliance

Authoritative sources:

- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Scope: AppShell, Sidebar navigation, Topbar, Context Panel, shell typography/density, and module accent orientation. Dashboard, Nutrition, Goals, and other module page feature depth were intentionally not expanded.

Strict shell checklist used before editing:

- 3-column shell: Sidebar `240px`, content fluid, Context Panel `340px`.
- SidebarBrand: Logo, `LumeOS`, version tag.
- SidebarSearch: command trigger.
- SidebarNav groups: `Modules`, `Workspaces`, `System`.
- Modules: Dashboard, Nutrition, Training, Recovery, Supplements, Goals & Body, Medical.
- Workspaces: Coach Portal, Buddy, Marketplace, Admin; external new-tab links, visually secondary.
- System: Settings and existing Governance route.
- SidebarUser: avatar, Tom, Athlete/Draft Tier, more affordance.
- Active state: 2px accent bar, token border, accent orientation.
- Topbar: MOD-TAG, breadcrumb, sync pill, notification placeholder, theme toggle, context toggle, commands, 2px accent line.
- Context Panel: header, Buddy widget, 2-4 insight cards, 2-4 quick actions, module details.
- Keyboard shortcut hints `1` through `7`.
- SPEC_02: module accents as orientation only, no large color fills, Linear-style density.

Compliance matrix:

| SPEC_01 Requirement | Implemented | Evidence | Status |
| ------------------- | ----------- | -------- | ------ |
| 3-column shell | Yes | `.lume-shell` uses `240px minmax(0, 1fr) 340px`, `100vw`, `100dvh`, `overflow: hidden` | pass |
| Context panel hidden state | Yes | `data-right-panel="hidden"` keeps `240px minmax(0, 1fr)`; toggle persists in localStorage | pass |
| SidebarBrand | Yes | Brand mark, `LumeOS`, version tag `v0.9.4`, `Athlete OS` | pass |
| SidebarSearch | Yes | Command trigger `Search or jump to...` with `⌘K` hint | pass |
| Sidebar Modules group | Yes | Seven core module rows with product labels, icon slots, shortcuts, and accents | pass |
| Sidebar Workspaces group | Yes | Coach Portal, Buddy, Marketplace, Admin as secondary external rows with `↗` | pass |
| Sidebar System group | Yes | Settings and existing Governance route grouped under System | pass |
| SidebarUser | Yes | Avatar `TM`, Tom, Athlete/Draft Tier, more affordance | pass |
| Active nav state | Yes | 2px accent bar, token border, active label/icon accent | pass |
| Topbar MOD-TAG | Yes | Active module uppercase tag with accent dot | pass |
| Topbar breadcrumb | Yes | `Workspace / {ModuleLabel}` verified per route | pass |
| Topbar sync pill | Yes | `Offline · 0 queued` with warn status dot | pass |
| Topbar notification placeholder | Yes | Compact `Bell 0` control | pass |
| Topbar theme toggle | Yes | `Theme` control toggles `data-theme` | pass |
| Topbar context toggle | Yes | `Context` control toggles right panel | pass |
| Topbar commands control | Yes | `Commands ⌘K` placeholder | pass |
| Topbar accent line | Yes | 2px gradient line uses active `--acc` | pass |
| Context header | Yes | `Context · {ModuleLabel}` plus active module title/status | pass |
| Buddy widget | Yes | Buddy block with accent orb and module message | pass |
| Insight cards | Yes | 2-3 insight cards per checked route | pass |
| Quick actions | Yes | 2-3 read-only quick action rows per checked route | pass |
| Module details | Yes | Details, boundary, and next safe action block | pass |
| Keyboard shortcut hints | Yes | Sidebar shows `1` through `7`; keyboard handler routes modules | pass |
| Module accents as orientation only | Yes | Accent dots/icons/bars/borders only; no large accent fills | pass |
| No horizontal overflow | Yes | Headless Edge/CDP at 1440x900: document, shell, and content widths fit on all checked routes | pass |

Route check at 1440x900:

| Route | MOD-TAG | Breadcrumb | Context Title | Insights | Quick Actions | Overflow/Clipping | Status |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| `/dashboard` | `DASH` | `Workspace / Dashboard` | `Dashboard` | 3 | 3 | pass | pass |
| `/nutrition` | `NUTRI` | `Workspace / Nutrition` | `Nutrition` | 3 | 3 | pass | pass |
| `/goals` | `GOALS` | `Workspace / Goals & Body` | `Goals & Body` | 2 | 2 | pass | pass |
| `/training` | `TRAIN` | `Workspace / Training` | `Training` | 2 | 2 | pass | pass |
| `/recovery` | `RECOV` | `Workspace / Recovery` | `Recovery` | 2 | 2 | pass | pass |
| `/supplements` | `SUPPL` | `Workspace / Supplements` | `Supplements` | 2 | 2 | pass | pass |
| `/medical` | `MEDIC` | `Workspace / Medical` | `Medical` | 2 | 2 | pass | pass |
| `/settings` | `SETTINGS` | `Workspace / Settings` | `Settings` | 2 | 3 | pass | pass |

Gate result: pass.

Validation evidence for this gate:

- `http://localhost:9501/`, `/dashboard`, `/nutrition`, `/goals`, `/training`, `/recovery`, `/supplements`, `/medical`, `/coach`, and `/settings` returned 200.
- Each checked route rendered the expected `lume-shell-*` route class and expected module token reference.
- `/settings` rendered the draft-only `Design System / Module Accent Proof` section.
- Typecheck was run because component contracts changed; failures remain limited to known existing Nutrition blockers outside this SPEC_02 color pass.

## Phase 2A.2 – App Shell Layout / Navigation UX Compliance

Authoritative sources:

- `docs/specs/WebPlatform/SPEC_01_APP_SHELL.md`
- `docs/specs/WebPlatform/SPEC_02_DESIGN_SYSTEM.md`

Scope: shell overflow, topbar clipping, sidebar navigation cleanup, context panel containment, and module accent preservation. No module feature depth was added.

Implementation notes:

- Shell root remains `100vw` / `100dvh` with `240px minmax(0, 1fr) 340px` and `overflow: hidden`.
- Main/content areas now use `min-width: 0`; content scrolls `overflow-y: auto` and `overflow-x: hidden`.
- Topbar now has a truncating left copy group and compact non-shrinking right controls.
- Sidebar visible navigation was reduced to product labels plus subtle shortcut/external indicators; debug-like workspace meta text was removed.
- Context panel is fixed to `340px`, has its own vertical scrolling, and hides horizontal overflow.

Compliance matrix:

| Check | Expected | Actual | Status |
| ----- | -------- | ------ | ------ |
| No horizontal shell scroll | Shell root does not create horizontal page scroll at 1440px desktop | CDP measurement: document, shell, main, and content scroll widths fit client widths on all checked routes | pass |
| 240px sidebar | Sidebar column fixed to 240px in desktop shell | `.lume-shell` grid uses `240px`; `.lume-sidebar` width is `240px` | pass |
| 340px context panel | Context panel fixed to 340px and contained | CDP measurement: `contextWidth: 340`, no context horizontal overflow | pass |
| Content min-width: 0 | Fluid content column cannot force shell overflow | `.lume-main`, `.lume-content`, cards and key grid children use `min-width: 0` | pass |
| Topbar controls not clipped | Sync, Theme, Context, Command visible; secondary controls compact | CDP measurement: controls right edge stays within topbar right edge on all checked routes | pass |
| Sidebar groups clean | MODULE, WORKSPACES, SYSTEM remain; debug meta reduced | Module labels, workspace labels, subtle shortcuts/external markers remain; SSO/role debug sublines removed | pass |
| Active nav accent visible | Active state has 2px module accent bar and accent label | Existing SPEC_02 accent bar/dot retained and checked in rendered HTML | pass |
| Inactive module accents visible | Inactive modules retain individual accent orientation | Accent dots remain on module and workspace nav rows via `--item-acc` | pass |
| Context panel fits | Context panel stays within 340px and does not force overflow | Context panel fixed width, `overflow-x: hidden`, cards/text constrained; CDP route checks passed | pass |

Route visual smoke at 1440x900:

| Route | No Horizontal Scroll | Topbar Controls Visible | Active Accent Visible | Context Fits | Status |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | pass | pass | pass | pass | pass |
| `/nutrition` | pass | pass | pass | pass | pass |
| `/goals` | pass | pass | pass | pass | pass |
| `/training` | pass | pass | pass | pass | pass |
| `/recovery` | pass | pass | pass | pass | pass |
| `/supplements` | pass | pass | pass | pass | pass |
| `/medical` | pass | pass | pass | pass | pass |
| `/settings` | pass | pass | pass | pass | pass |

Gate result: pass.
