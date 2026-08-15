# Spec Change Request — Injection Planner (Supplements Module)

**Target module:** Supplements
**Affected spec files:** `SPEC_02_ENTITIES.md`, `SPEC_03_USER_FLOWS.md`, `SPEC_04_FEATURES.md`, `SPEC_06_DATABASE_SCHEMA.md`, `SPEC_07_API.md`, `SPEC_09_SCORING.md`, `SPEC_10_COMPONENTS.md`
**Status:** implemented in prototype, not yet in spec
**Author:** design prototype (LumeOS-Draft)
**Date:** 2026-08-15

---

## 1. Why this is missing

The Supplements spec defines `route` on `enhanced_substances`:

```
route TEXT NOT NULL   -- oral | injection_im | injection_subq | topical | nasal
```

That is the only injection-related structure in the entire spec. Nothing downstream uses it. There is no site model, no rotation logic, no volume constraint, no needle guidance, and no injection log.

For any user on injectable protocols (TRT, HCG, peptides, GH, GLP-1 agonists) this is the single most safety-relevant daily interaction with the app, and it currently has no specification. Repeated injection into the same site without a rest window causes scar tissue, lipohypertrophy, and reduced absorption. Volume exceeding a site's capacity causes pain, leakage, and abscess risk. Both are mechanically preventable with data the app already holds.

Scope note: this is a **tracking and rotation-hygiene** feature. It does not prescribe, does not compute dose, and does not replace physician guidance. It answers one question: *given what I injected recently, where should the next one go and is the volume safe for that site?*

---

## 2. New entity: `injection_sites` (reference data, seeded)

Static reference table. Not user-editable in V1.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | e.g. `glute_l`, `vglute_r`, `abd_l` |
| `name` | TEXT | Display name, i18n via `name_de` / `name_en` / `name_th` |
| `short_code` | TEXT(2) | Map marker label, e.g. `GL`, `VR`, `AL` |
| `route` | TEXT | `im` \| `subq` — must match `enhanced_substances.route` family |
| `max_volume_ml` | NUMERIC(4,2) | Hard per-injection limit for this site |
| `rest_days` | INT | Minimum days before reuse |
| `body_view` | TEXT | `front` \| `back` — which body map it renders on |
| `coord_x` | NUMERIC(5,2) | % position on a 100×120 body outline |
| `coord_y` | NUMERIC(5,2) | % position |
| `needle_gauge` | TEXT | e.g. `23G` |
| `needle_length_in` | NUMERIC(3,2) | e.g. `1.50` |
| `landmark_note` | TEXT | Anatomical guidance, i18n |
| `difficulty` | TEXT | `standard` \| `advanced` — advanced sites hidden until opt-in |
| `is_active` | BOOLEAN | allows retiring a site without deleting history |

### Seed data — 16 sites

**IM sites**

| id | name | max_ml | rest_days | view | needle | landmark note | difficulty |
|---|---|---|---|---|---|---|---|
| `glute_l` | Gluteus L | 3.0 | 7 | back | 23G × 1.5" | Dorsogluteal, upper outer quadrant | standard |
| `glute_r` | Gluteus R | 3.0 | 7 | back | 23G × 1.5" | Dorsogluteal, upper outer quadrant | standard |
| `vglute_l` | Ventrogluteal L | 2.5 | 7 | front | 23G × 1.25" | Safest IM site, no sciatic risk | standard |
| `vglute_r` | Ventrogluteal R | 2.5 | 7 | front | 23G × 1.25" | Safest IM site, no sciatic risk | standard |
| `quad_l` | Quadriceps L | 2.0 | 5 | front | 25G × 1" | Vastus lateralis, outer third | standard |
| `quad_r` | Quadriceps R | 2.0 | 5 | front | 25G × 1" | Vastus lateralis, outer third | standard |
| `delt_l` | Deltoid L | 1.0 | 5 | front | 25G × 1" | 3 finger-widths below acromion | standard |
| `delt_r` | Deltoid R | 1.0 | 5 | front | 25G × 1" | 3 finger-widths below acromion | standard |
| `lat_l` | Latissimus L | 1.5 | 7 | back | 25G × 1" | Thin muscle, experienced users only | advanced |
| `lat_r` | Latissimus R | 1.5 | 7 | back | 25G × 1" | Thin muscle, experienced users only | advanced |

**SubQ sites**

| id | name | max_ml | rest_days | view | needle | landmark note | difficulty |
|---|---|---|---|---|---|---|---|
| `abd_l` | Abdomen L | 1.0 | 3 | front | 29G × 0.5" | ≥ 2 cm lateral of navel, pinch fold | standard |
| `abd_r` | Abdomen R | 1.0 | 3 | front | 29G × 0.5" | ≥ 2 cm lateral of navel, pinch fold | standard |
| `sq_delt_l` | SubQ Deltoid L | 0.5 | 3 | front | 29G × 0.5" | Posterior upper-arm fat pad | standard |
| `sq_delt_r` | SubQ Deltoid R | 0.5 | 3 | front | 29G × 0.5" | Posterior upper-arm fat pad | standard |
| `thigh_sq_l` | SubQ Thigh L | 1.0 | 3 | front | 29G × 0.5" | Anterolateral fat pad | standard |
| `thigh_sq_r` | SubQ Thigh R | 1.0 | 3 | front | 29G × 0.5" | Anterolateral fat pad | standard |

> Volume limits and rest windows are conservative defaults from clinical IM/SubQ practice. They must be overridable per user by a linked physician (see §7).

---

## 3. New entity: `injection_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `injected_at` | TIMESTAMPTZ | date + time |
| `site_id` | TEXT FK → `injection_sites` | |
| `substance_id` | UUID FK → `enhanced_substances` | nullable if manual entry |
| `substance_name` | TEXT | frozen snapshot, survives catalog changes |
| `route` | TEXT | `im` \| `subq` — frozen from substance |
| `volume_ml` | NUMERIC(4,2) | |
| `dose_amount` | NUMERIC(10,3) | nullable |
| `dose_unit` | TEXT | `mg` \| `IU` \| `µg` \| `ml` |
| `needle_gauge` | TEXT | as actually used |
| `needle_length_in` | NUMERIC(3,2) | as actually used |
| `pain_score` | SMALLINT | 0–3 · none / mild / moderate / severe |
| `complication` | TEXT[] | `none` \| `bleeding` \| `lump` \| `swelling` \| `redness` \| `leakage` \| `nerve_sensation` |
| `notes` | TEXT | |
| `override_reason` | TEXT | required when a validation rule was bypassed, else NULL |
| `stack_item_id` | UUID FK | nullable — links to the stack item that scheduled it |
| `created_at` | TIMESTAMPTZ | |

**Indexes:** `(user_id, injected_at DESC)`, `(user_id, site_id, injected_at DESC)`

---

## 4. New entity: `injection_schedule` (derived, not stored)

Computed on read from active stack items where `route IN ('injection_im','injection_subq')`. Returns next N planned injections with a suggested site.

No table needed. Materialise only if performance requires it.

---

## 5. Scoring / algorithms — `SPEC_09_SCORING.md`

### 5.1 Site state

```typescript
type SiteStatus = 'fresh' | 'ready' | 'soon' | 'resting';

function siteState(site: InjectionSite, logs: InjectionLog[]): SiteState {
  const last = logs
    .filter(l => l.site_id === site.id)
    .sort((a, b) => b.injected_at - a.injected_at)[0];

  if (!last) return { status: 'fresh', days_ago: null, rest_remaining: 0 };

  const days_ago = daysBetween(last.injected_at, now());
  const rest_remaining = site.rest_days - days_ago;

  if (rest_remaining > 1)  return { status: 'resting', days_ago, rest_remaining };
  if (rest_remaining >= 0) return { status: 'soon',    days_ago, rest_remaining };
  return { status: 'ready', days_ago, rest_remaining: 0 };
}
```

### 5.2 Site suggestion — longest-rest-first

```typescript
function suggestSite(
  route: 'im' | 'subq',
  volume_ml: number,
  sites: InjectionSite[],
  logs: InjectionLog[],
  previousSiteId?: string
): { site_id: string; reason: string } | null {

  const eligible = sites
    .filter(s => s.is_active)
    .filter(s => s.route === route)
    .filter(s => s.difficulty === 'standard' || userOptedIntoAdvanced)
    .filter(s => volume_ml <= s.max_volume_ml)
    .map(s => ({ site: s, state: siteState(s, logs) }))
    .filter(x => x.state.status !== 'resting');

  if (eligible.length === 0) return null;   // caller must widen constraints

  // Rank: never-used first, then longest since last use
  eligible.sort((a, b) => {
    if (a.state.days_ago === null) return -1;
    if (b.state.days_ago === null) return 1;
    return b.state.days_ago - a.state.days_ago;
  });

  // Tie-break: prefer contralateral to the previous injection
  const top = eligible[0];
  const tied = eligible.filter(x => x.state.days_ago === top.state.days_ago);
  if (tied.length > 1 && previousSiteId) {
    const contra = tied.find(x => isContralateral(x.site.id, previousSiteId));
    if (contra) return { site_id: contra.site.id, reason: 'contralateral_rotation' };
  }

  return {
    site_id: top.site.id,
    reason: top.state.days_ago === null ? 'never_used' : 'longest_rested',
  };
}

function isContralateral(a: string, b: string): boolean {
  const strip = (s: string) => s.replace(/_[lr]$/, '');
  return strip(a) === strip(b) && a !== b ? false   // same muscle, opposite side is NOT contralateral enough
       : strip(a) !== strip(b);                      // different muscle group entirely
}
```

### 5.3 Validation rules on log

Applied before an `injection_logs` insert. Each returns `pass` / `warn` / `block`.

| Rule | Condition | Result | Message |
|---|---|---|---|
| `volume_limit` | `volume_ml > site.max_volume_ml` | **block** | `volume {x} ml exceeds {site} limit of {max} ml` |
| `rest_window` | `siteState().status === 'resting'` | **block** | `{site} used {n}d ago, rest window is {rest_days}d` |
| `route_mismatch` | `substance.route family ≠ site.route` | **block** | `{substance} is {route}, {site} is a {site.route} site` |
| `overuse_30d` | `count(logs where site AND ≤30d) ≥ 3` | warn | `{site} used {n}× in 30 days — scar tissue risk` |
| `advanced_site` | `site.difficulty = 'advanced'` and not opted in | warn | `{site} is an advanced site — confirm you know the landmarks` |
| `complication_repeat` | previous log at this site had a complication | warn | `last injection here reported {complication}` |
| `pain_trend` | mean `pain_score` at this site over last 3 ≥ 2 | warn | `pain trending up at {site} — consider rotating away` |

**Blocks are overridable** only with a non-empty `override_reason`. The override is written to the log row and surfaces in the Medical module audit trail.

### 5.4 Overuse metric (for pending actions + coach view)

```typescript
function siteLoad(siteId: string, logs: InjectionLog[], windowDays = 28) {
  const recent = logs.filter(l => l.site_id === siteId && daysAgo(l) <= windowDays);
  return {
    count: recent.length,
    total_ml: recent.reduce((s, l) => s + l.volume_ml, 0),
    mean_pain: recent.length ? recent.reduce((s, l) => s + l.pain_score, 0) / recent.length : 0,
    complications: recent.flatMap(l => l.complication ?? []).filter(c => c !== 'none'),
  };
}
```

---

## 6. API — `SPEC_07_API.md`

```
GET    /api/supplements/injection-sites
       → reference data, i18n-resolved, with user-specific overrides applied

GET    /api/supplements/injection-sites/state
       → [{ site_id, status, days_ago, rest_remaining, load_28d }]

GET    /api/supplements/injections?from=&to=&site_id=&substance_id=
       → paginated log

POST   /api/supplements/injections
       body: { injected_at, site_id, substance_id?, substance_name, route,
               volume_ml, dose_amount?, dose_unit?, needle_gauge?,
               needle_length_in?, pain_score, complication[], notes?,
               override_reason?, stack_item_id? }
       → 201 with created row
       → 422 with { violations: [{ rule, severity, message }] } when a block rule
         fires and no override_reason is supplied

PATCH  /api/supplements/injections/:id
DELETE /api/supplements/injections/:id

GET    /api/supplements/injection-schedule?days=14
       → [{ planned_date, substance_name, route, volume_ml,
             suggested_site_id, suggestion_reason, alternatives[] }]

POST   /api/supplements/injection-sites/:id/override
       body: { max_volume_ml?, rest_days?, physician_note, physician_name }
       → per-user override of a site constraint, physician-attributed
```

**Cross-module:**
`GET /api/supplements/injections/for-medical?from=&to=` — feeds the Medical module's enhanced-protocol correlation view (injection frequency and site complications alongside biomarker trends).

---

## 7. Physician override

Volume limits and rest windows are conservative defaults. A linked Medical coach must be able to raise or lower them per user:

- `injection_site_overrides` table: `(user_id, site_id, max_volume_ml, rest_days, physician_name, physician_note, created_at)`
- Overrides require an active Medical coach relationship with `full` visibility on Extended supplements
- The override is shown inline on the site detail card: *"limit raised to 4.0 ml by Dr. M. Kessler, 2026-04-23"*
- Overrides appear in the Medical audit log

---

## 8. User flows — `SPEC_03_USER_FLOWS.md`

### Flow A — Log an injection

1. User taps **Log injection** (from Injections tab, or from a pending action)
2. Compound pre-selected if only one injectable is due today
3. Site picker: body map (front + back) with colour-coded state, plus a scrollable list showing days-since-use per site
4. Suggested site is pre-selected via `suggestSite()`, with the reason shown
5. Volume defaults from the stack item; needle defaults from the site
6. Pain score 0–3, optional complications multi-select, optional notes
7. Validation runs live — blocks disable the save button and show the failing rule
8. On block, an **Override with reason** path is offered; the reason is mandatory
9. Save → log row written, site state recomputes, rotation schedule refreshes

### Flow B — Follow the rotation plan

1. Injections tab → **Schedule**
2. Next N planned injections from active stack items, each with suggested site and reason
3. User can change any suggestion; the picker excludes resting and over-volume sites
4. Tapping a row opens Flow A pre-filled

### Flow C — Respond to an overuse warning

1. Pending action: *"Gluteus R used 3× in 30 days"*
2. Opens the site detail with 30-day use history strip and mean pain
3. Offers a rotation alternative and, if pain is trending, prompts to notify the Medical coach

---

## 9. Features — `SPEC_04_FEATURES.md`

Add as **Feature 11: Injection Planner**.

### 11a. Rotation map
Front and back body outlines with 16 markers. Colour = site state (ready / ready tomorrow / resting). Dashed ring distinguishes SubQ from IM. Marker label is the 2-char short code. Filter by route. Click selects and opens the site detail.

### 11b. Site detail
Status, days since last use, max volume, rest window, needle recommendation, anatomical landmark note, 30-day use-history strip, physician override if present.

### 11c. Rotation schedule
Next 7–14 planned injections derived from active stack items. Each row: date, compound, route, volume, suggested site, and the reason the site was chosen. Editable per row.

### 11d. Injection log
Full history: date, compound, site, route, volume, dose, needle, pain bar, complications, notes. Filterable by site and substance. Exportable.

### 11e. Site guide
Reference view for all 16 sites split by route, with landmark notes, volume limits, rest windows, and needle recommendations. Plus a needle reference table (draw 21G; IM glute 23G × 1.25–1.5"; IM quad/delt 25G × 1"; SubQ 29–31G × 0.5").

### 11f. Warnings
Overuse (≥ 3 per site per 30 days), pain trend, repeat complications, volume violations, rest-window violations.

---

## 10. Pending actions — extend `SPEC_04` Feature 10

Add to the Supplements pending-action triggers:

| Type | Condition |
|---|---|
| `injection_due` | scheduled injection date is today and no log exists after its slot time |
| `injection_site_overuse` | any site with ≥ 3 injections in 30 days |
| `injection_pain_trend` | mean pain ≥ 2 across last 3 injections at one site |
| `injection_complication` | complication other than `none` logged in the last 7 days |
| `no_eligible_site` | `suggestSite()` returns null for a scheduled injection — all sites resting or over volume |

`no_eligible_site` is the important one: it means the protocol's injection frequency exceeds the available rotation surface, which is a protocol-design problem the user must resolve with their physician.

---

## 11. Components — `SPEC_10_COMPONENTS.md`

| Component | Purpose |
|---|---|
| `InjectionPlannerView` | Tab shell with 4 sub-views: Rotation map, Schedule, Log, Site guide |
| `InjBodyMap` | SVG body outline with interactive site markers, `view` and `filterRoute` props |
| `InjSiteDetailCard` | Selected-site panel: state, limits, needle, 30-day history |
| `InjRotationSchedule` | Table of upcoming injections with suggested sites and reasons |
| `InjLogTable` | Injection history with pain bars and complications |
| `InjSiteGuide` | Reference cards split IM / SubQ, plus needle table |
| `LogInjectionModal` | Log flow with body-map picker, live validation, override path |
| `InjOveruseWarnings` | Warning cards for overused sites |

---

## 12. i18n keys

All site names, landmark notes, complication labels, pain labels, validation messages, and suggestion reasons need DE / EN / TH entries. Suggestion reasons are enum-keyed (`never_used`, `longest_rested`, `contralateral_rotation`) so they translate cleanly rather than being assembled from fragments.

---

## 13. Explicit non-goals for V1

- No dose calculation from concentration (mg/ml → ml) — that is a separate calculator feature
- No photo documentation of injection sites
- No automatic reminder push notifications (goes through the existing reminders system)
- No user-created custom sites — the 16 seeded sites cover standard practice
- No injection technique video content

---

## 14. Safety and framing

The module tracks; it does not advise. Wording throughout stays descriptive ("this site was used 4 days ago, its rest window is 7 days") rather than prescriptive ("inject here"). The site guide carries a standing disclaimer that gauge, length, and volume depend on carrier-oil viscosity and individual subcutaneous depth, and must be confirmed with the prescribing physician. Every block override is recorded and visible to the linked Medical coach.
