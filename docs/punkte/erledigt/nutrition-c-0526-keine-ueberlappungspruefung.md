---
nr: C-526
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-486
entscheidung: Tom: nur ein aktiver Plan ist SSOT
agent: codex
beauftragt: 2026-09-21
erledigt: 2026-09-08
commit: c5df20c0
beruehrt:
  tabellen: [nutrition.meal_plans, nutrition.meal_plan_days]
  dateien:
    - supabase/migrations/20260921094500_c526_one_active_meal_plan_per_day.sql
    - supabase/_pipeline/_validierung/nutrition-c526-active-plan-overlap.test.ts
zahlen:
  gemessen: 2026-09-21
---

# C-526 — aktive Meal-Pläne dürfen nicht überlappen

## Befund

`nutrition.meal_plans_status_compatibility()` verhinderte nichts. Sie setzt
nur `is_active = (status = 'active')`. Die zurückgerollte Live-Probe konnte
zwei aktive Pläne derselben Nutzerin mit demselben materialisierten
`plan_date` anlegen: `active_plans = 2`, `same_day_coverage = 2`.

Der aktuelle Bestand hat keinen aktiven Tageskonflikt; seine Statuszahlen
blieben bei der Einspielung unverändert: 5 `assigned`, 3 `active`, 2 `paused`.

## Umsetzung

**2026-09-21 live eingespielt.**
`nutrition.meal_plan_active_overlap_guard()` prüft beide Schreibwege:

- Aktivierung/Anlage eines Plans gegen seine materialisierten Plan-Tage;
- Anlage oder Verschiebung eines Tages eines bereits aktiven Plans.

Je Nutzerin serialisiert ein Transaktions-Advisory-Lock die Prüfung. Ein
Konflikt endet mit `23514` und dem Constraint-Namen
`meal_plans_one_active_per_day`. `assigned` und `paused` dürfen weiterhin
denselben Tag vorbereiten; nur zwei `active`-Pläne sind ausgeschlossen.

## Nachweis

| Probe | Ergebnis |
|---|---|
| Zwei aktive Pläne, gleicher Tag | abgewiesen |
| Zweiter Plan `assigned`, gleicher Tag | erlaubt |
| Aktivierung des zweiten Plans | abgewiesen |
| Verbleibende aktive Pläne/Abdeckung | 1 / 1 |
| Bestehende aktive Tageskonflikte | 0 |

Die Live-Probe läuft vollständig in einer Transaktion mit `ROLLBACK`.
`nutrition-c526-active-plan-overlap.test.ts`: 2/2 grün.
Frische Vollkette: C-526 grün; nur der bekannte C-327-Grantbefund bleibt rot.

Sicherung: `backup/schema/20260921093000_c526_vorher.sql`.

## Abnahme

**2026-09-08, Orchestrator. LIVE.**

`[cmd]` **Selbst gemessen: 0 Tage mit mehr als einem aktiven
Plan.**

### Der Trigger tat nicht, was sein Name versprach

> *,,`status_compatibility` verhinderte Ueberlappungen NICHT,
sondern synchronisierte nur Status/Boolean."*

`[read]` **Ein Trigger, dessen Name nach Pruefung klingt, und
der nur abgleicht** ? **dieselbe Klasse wie
`client-grenze.test.ts` in G-470.**

### Toms Regel, umgesetzt

> *,,Der neue Guard verhindert nun zwei AKTIVE Plaene derselben
Nutzerin am selben materialisierten Tag; `assigned`/`paused`
duerfen weiter ueberlappen."*

`[read]` **Genau Toms Satz:** *,,nur ein aktiver plan ist
ssot"* ? **nicht: keine Ueberlappung, sondern: kein zweiter
aktiver.**

`[cmd]` **Live-Probe: Aktivierung des zweiten Plans
abgewiesen.**

`[cmd]` **Sicherung:**
`backup/schema/20260921093000_c526_vorher.sql`

**Abgenommen.**
