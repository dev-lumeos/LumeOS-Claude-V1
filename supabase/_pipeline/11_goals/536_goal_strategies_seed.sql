-- G-536: 16 lauffaehige Definitionen aus dem Vorgaenger plus das nur im
-- Phasenmodell/Mockup vorhandene expert_bb_annual. Fehlende Rechenwerte des
-- Jahresprotokolls bleiben NULL; keine Zahl wird aus einem UI-Beispiel geraten.

BEGIN;

WITH source_rows AS (
  SELECT *
  FROM jsonb_to_recordset($strategies$
  [
    {
      "code":"lose","label":"Abnehmen","description":"Moderates Kaloriendefizit für nachhaltigen Fettabbau","icon":"TrendingDown","category":"fat_loss","tier":"simple",
      "tdee_modifier":-0.15,"weight_change_target_percent":-0.5,"protein_per_kg":2.2,"fat_percent":0.25,
      "guards":["strength_loss > 10% → reduce deficit","weekly_loss > 1.0kg → +150 kcal","duration > max → force transition"],
      "next_codes":["reverse_diet","maintenance","lean_bulk"],"editor_modes":["variants","guards","duration"]
    },
    {
      "code":"maintain","label":"Halten","description":"Gewicht stabil halten, Körperkomposition optimieren","icon":"Minus","category":"hybrid","tier":"simple",
      "tdee_modifier":0,"protein_per_kg":2.0,"fat_percent":0.28,
      "next_codes":["fat_loss","lean_bulk","recomp","contest_prep"],
      "purpose":["Stabilisierung nach Cut/Bulk","Langfristige Ernährung","Lifestyle Mode"],"editor_modes":["params"]
    },
    {
      "code":"gain","label":"Aufbauen","description":"Kontrollierter Kalorienüberschuss für Muskelaufbau","icon":"TrendingUp","category":"muscle_gain","tier":"simple",
      "tdee_modifier":0.10,"weight_change_target_percent":0.3,"protein_per_kg":1.8,"fat_percent":0.28,
      "editor_modes":["params","guards","duration"]
    },
    {
      "code":"aggressive_cut","label":"Aggressive Cut","description":"Schneller Fettabbau mit hohem Proteinanteil. Für erfahrene Athleten.","icon":"TrendingDown","category":"fat_loss","tier":"advanced",
      "tdee_modifier":-0.25,"weight_change_target_percent":-1.0,"max_duration_weeks":8,"macro_cycling":true,"refeed_schedule":true,"auto_adjust":true,"badge":"Intensiv",
      "warnings":["Nur für erfahrene Athleten","Max 8 Wochen empfohlen","Leistungseinbußen möglich"],"requirements":{"min_experience":"advanced"},"protein_per_kg":2.5,"fat_percent":0.20,
      "guards":["strength_loss > 10% → reduce deficit","weekly_loss > 1.0kg → +150 kcal","duration > max → force transition"],
      "next_codes":["reverse_diet","maintenance","lean_bulk"],"editor_modes":["variants","guards","duration"],
      "refeeds":{"every_weeks":4,"duration_weeks":1}
    },
    {
      "code":"moderate_cut","label":"Moderate Cut","description":"Bewährtes Defizit mit guter Balance zwischen Fettabbau und Leistung.","icon":"TrendingDown","category":"fat_loss","tier":"advanced",
      "tdee_modifier":-0.20,"weight_change_target_percent":-0.75,"max_duration_weeks":12,"macro_cycling":true,"refeed_schedule":true,"auto_adjust":true,"protein_per_kg":2.2,"fat_percent":0.25,
      "guards":["strength_loss > 10% → reduce deficit","weekly_loss > 1.0kg → +150 kcal","duration > max → force transition"],
      "next_codes":["reverse_diet","maintenance","lean_bulk"],"editor_modes":["variants","guards","duration"],
      "refeeds":{"every_weeks":8,"duration_weeks":1}
    },
    {
      "code":"conservative_cut","label":"Conservative Cut","description":"Sanftes Defizit. Ideal um Muskelmasse zu erhalten.","icon":"TrendingDown","category":"fat_loss","tier":"advanced",
      "tdee_modifier":-0.10,"weight_change_target_percent":-0.4,"refeed_schedule":true,"protein_per_kg":2.0,"fat_percent":0.28,
      "guards":["strength_loss > 10% → reduce deficit","weekly_loss > 1.0kg → +150 kcal","duration > max → force transition"],
      "next_codes":["reverse_diet","maintenance","lean_bulk"],"editor_modes":["variants","guards","duration"]
    },
    {
      "code":"mini_cut","label":"Mini Cut","description":"Kurze intensive Diätphase (2-4 Wochen) zwischen Aufbauphasen.","icon":"ScissorsLineDashed","category":"fat_loss","tier":"advanced",
      "tdee_modifier":-0.25,"weight_change_target_percent":-1.0,"max_duration_weeks":4,"badge":"Sprint",
      "warnings":["Max 4 Wochen","Aggressives Defizit"],"protein_per_kg":2.5,"fat_percent":0.22,"editor_modes":["params"]
    },
    {
      "code":"lean_bulk","label":"Lean Bulk","description":"Kontrollierter Überschuss mit minimaler Fettzunahme.","icon":"TrendingUp","category":"muscle_gain","tier":"advanced",
      "tdee_modifier":0.10,"weight_change_target_percent":0.25,"max_duration_weeks":52,"macro_cycling":true,"auto_adjust":true,"protein_per_kg":2.0,"fat_percent":0.25,
      "guards":["bf_increase > 2% in 4 wk → −100 kcal","gain > 1kg/wk → surplus too high","no strength 3+ wk → check training"],
      "next_codes":["mini_cut","maintenance","contest_prep"],"editor_modes":["params","guards","duration"]
    },
    {
      "code":"clean_bulk","label":"Clean Bulk","description":"Moderater Überschuss für optimalen Muskelaufbau.","icon":"TrendingUp","category":"muscle_gain","tier":"advanced",
      "tdee_modifier":0.15,"weight_change_target_percent":0.4,"macro_cycling":true,"protein_per_kg":1.8,"fat_percent":0.28,"editor_modes":["params","guards","duration"]
    },
    {
      "code":"aggressive_bulk","label":"Aggressive Bulk","description":"Hoher Überschuss für maximale Gewichtszunahme. Mehr Fettansatz erwartet.","icon":"Plus","category":"muscle_gain","tier":"advanced",
      "tdee_modifier":0.20,"weight_change_target_percent":0.75,"max_duration_weeks":16,"badge":"Mass",
      "warnings":["Signifikante Fettzunahme wahrscheinlich"],"protein_per_kg":1.6,"fat_percent":0.30,"editor_modes":["params","guards","duration"]
    },
    {
      "code":"body_recomp","label":"Body Recomposition","description":"Gleichzeitig Fett abbauen und Muskeln aufbauen. Langsamer aber nachhaltig.","icon":"Repeat","category":"hybrid","tier":"advanced",
      "tdee_modifier":0,"macro_cycling":true,"protein_per_kg":2.2,"fat_percent":0.25,
      "next_codes":["lean_bulk","fat_loss"],"success":["BF% fallend","Kraft steigend","Gewicht stabil"],
      "best_for":["Anfänger","Nach Trainingspause","Muscle Memory"],"editor_modes":["params","cycling"]
    },
    {
      "code":"reverse_diet","label":"Reverse Diet","description":"Schrittweise Kalorien erhöhen nach einer Diätphase.","icon":"RotateCcw","category":"recovery","tier":"advanced",
      "tdee_modifier":0.05,"max_duration_weeks":16,"auto_adjust":true,"protein_per_kg":2.0,"fat_percent":0.28,
      "guards":["weekly gain > 0.5kg → slow increase","hunger normalized → close to TDEE"],
      "next_codes":["maintenance","lean_bulk","fat_loss"],"exits":["reached estimated TDEE","gain > 0.5kg/wk","user satisfied"],
      "editor_modes":["params","exits","guards"]
    },
    {
      "code":"contest_prep","label":"Contest Prep","description":"Wettkampfvorbereitung mit progressivem Kaloriendefizit.","icon":"Award","category":"contest_prep","tier":"advanced",
      "tdee_modifier":-0.25,"max_duration_weeks":16,"macro_cycling":true,"refeed_schedule":true,"auto_adjust":true,"peak_week":true,"badge":"Wettkampf",
      "warnings":["Nur für erfahrene Wettkampf-Athleten","Coach-Betreuung empfohlen"],"requirements":{"min_experience":"advanced","coach_approval":true},"protein_per_kg":2.5,"fat_percent":0.18,
      "guards":["BF% < 5% (M) / < 10% (F) → health warning","strength_loss > 20% → reduce deficit","hormonal symptoms → medical check"],"next_codes":["reverse_diet"],
      "editor_modes":["subphases","refeeds","peakweek","guards","anchor"],
      "sub_phases":[{"name":"early","weeks":"24–16","deficit":-300,"cardio":"low"},{"name":"mid","weeks":"16–8","deficit":-600,"cardio":"moderate"},{"name":"late","weeks":"8–2","deficit":-750,"cardio":"high"},{"name":"peak_week","weeks":1,"special":true}],
      "refeeds":{"start_after_week":8,"frequency":"1-2× pro Woche","type":"High Carb, moderate Kalorien"},
      "peak_week_details":{"carb_depletion_days":3,"carb_load_days":2,"sodium_manipulation":true}
    },
    {
      "code":"peak_week","label":"Peak Week","description":"Letzte Woche vor dem Wettkampf. Wasser-, Carb- und Sodium-Manipulation.","icon":"Flame","category":"contest_prep","tier":"advanced",
      "tdee_modifier":-0.30,"max_duration_weeks":1,"peak_week":true,"badge":"Final",
      "warnings":["Extrem gefährlich bei falscher Ausführung","NUR mit Coach","Kann Ergebnis ruinieren"],"requirements":{"coach_approval":true},"protein_per_kg":2.5,"fat_percent":0.15,"editor_modes":["params"]
    },
    {
      "code":"maintenance_diet_break","label":"Diet Break","description":"Geplante Pause bei Maintenance-Kalorien (1-2 Wochen).","icon":"PauseCircle","category":"expert","tier":"advanced",
      "tdee_modifier":0,"max_duration_weeks":2,"protein_per_kg":2.0,"fat_percent":0.28,"editor_modes":["params"]
    },
    {
      "code":"custom","label":"Custom Goal","description":"Komplett eigene Kalorien- und Makro-Einstellungen.","icon":"Settings","category":"expert","tier":"advanced",
      "tdee_modifier":0,"protein_per_kg":2.0,"fat_percent":0.25,"editor_modes":["params"]
    },
    {
      "code":"expert_bb_annual","label":"Expert BB · Annual","description":"12-Monats Zyklus mit automatischen Transitions.","icon":"CalendarPlus","category":"expert","tier":"advanced",
      "requirements":{"min_experience":"advanced"},"editor_modes":["annual","anchor","overrides"],
      "annual":[{"months":"1–4","phase":"LEAN_BULK","focus":"Masseaufbau"},{"months":"5–6","phase":"MAINTENANCE","focus":"Transition"},{"months":"7–10","phase":"CONTEST_PREP","focus":"Diäten"},{"months":"11","phase":"PEAK WEEK + SHOW","focus":"Wettkampf"},{"months":"12","phase":"REVERSE_DIET","focus":"Recovery"}]
    }
  ]
  $strategies$::jsonb) AS s(
    code text,
    label text,
    description text,
    icon text,
    category text,
    tier text,
    tdee_modifier numeric,
    weight_change_target_percent numeric,
    max_duration_weeks smallint,
    macro_cycling boolean,
    refeed_schedule boolean,
    auto_adjust boolean,
    peak_week boolean,
    badge text,
    warnings text[],
    requirements jsonb,
    protein_per_kg numeric,
    fat_percent numeric,
    guards text[],
    next_codes text[],
    exits text[],
    success text[],
    best_for text[],
    purpose text[],
    editor_modes text[],
    sub_phases jsonb,
    annual jsonb,
    refeeds jsonb,
    peak_week_details jsonb
  )
)
INSERT INTO goals.goal_strategies (
  code, label, description, icon, category, tier,
  tdee_modifier, weight_change_target_percent, max_duration_weeks,
  macro_cycling, refeed_schedule, auto_adjust, peak_week,
  badge, warnings, requirements, protein_per_kg, fat_percent,
  guards, next_codes, exits, success, best_for, purpose, editor_modes,
  sub_phases, annual, refeeds, peak_week_details
)
SELECT
  s.code, s.label, s.description, s.icon, s.category, s.tier,
  s.tdee_modifier, s.weight_change_target_percent, s.max_duration_weeks,
  coalesce(s.macro_cycling, false), coalesce(s.refeed_schedule, false),
  coalesce(s.auto_adjust, false), coalesce(s.peak_week, false),
  s.badge, coalesce(s.warnings, '{}'::text[]),
  coalesce(s.requirements, '{}'::jsonb), s.protein_per_kg, s.fat_percent,
  coalesce(s.guards, '{}'::text[]), coalesce(s.next_codes, '{}'::text[]),
  coalesce(s.exits, '{}'::text[]), coalesce(s.success, '{}'::text[]),
  coalesce(s.best_for, '{}'::text[]), coalesce(s.purpose, '{}'::text[]),
  coalesce(s.editor_modes, ARRAY['params']::text[]),
  coalesce(s.sub_phases, '[]'::jsonb), coalesce(s.annual, '[]'::jsonb),
  s.refeeds, s.peak_week_details
FROM source_rows s
ON CONFLICT (code) DO UPDATE SET
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  category = excluded.category,
  tier = excluded.tier,
  tdee_modifier = excluded.tdee_modifier,
  weight_change_target_percent = excluded.weight_change_target_percent,
  max_duration_weeks = excluded.max_duration_weeks,
  macro_cycling = excluded.macro_cycling,
  refeed_schedule = excluded.refeed_schedule,
  auto_adjust = excluded.auto_adjust,
  peak_week = excluded.peak_week,
  badge = excluded.badge,
  warnings = excluded.warnings,
  requirements = excluded.requirements,
  protein_per_kg = excluded.protein_per_kg,
  fat_percent = excluded.fat_percent,
  guards = excluded.guards,
  next_codes = excluded.next_codes,
  exits = excluded.exits,
  success = excluded.success,
  best_for = excluded.best_for,
  purpose = excluded.purpose,
  editor_modes = excluded.editor_modes,
  sub_phases = excluded.sub_phases,
  annual = excluded.annual,
  refeeds = excluded.refeeds,
  peak_week_details = excluded.peak_week_details;

-- Der Bestand ist eindeutig: die beiden vorhandenen Arten haben genau einen
-- gleichnamigen bzw. kanonisch benannten Katalogeintrag. variant und
-- parameters werden absichtlich nicht veraendert.
UPDATE goals.goal_phases gp
SET strategie_code = CASE gp.phase_type
  WHEN 'maintenance' THEN 'maintain'
  WHEN 'lean_bulk' THEN 'lean_bulk'
  WHEN 'mini_cut' THEN 'mini_cut'
  WHEN 'recomp' THEN 'body_recomp'
  WHEN 'contest_prep' THEN 'contest_prep'
  WHEN 'reverse_diet' THEN 'reverse_diet'
  WHEN 'expert_bb_annual' THEN 'expert_bb_annual'
  WHEN 'peak_week' THEN 'peak_week'
  ELSE gp.strategie_code
END
WHERE gp.strategie_code IS NULL
  AND gp.phase_type IN (
    'maintenance', 'lean_bulk', 'mini_cut', 'recomp', 'contest_prep',
    'reverse_diet', 'expert_bb_annual', 'peak_week'
  );

DO $g536$
BEGIN
  IF (SELECT count(*) FROM goals.goal_strategies) <> 17 THEN
    RAISE EXCEPTION 'G-536: erwartet genau 17 Strategien';
  END IF;
  IF EXISTS (SELECT 1 FROM goals.goal_strategies WHERE code = 'profile') THEN
    RAISE EXCEPTION 'G-536: profile steht nicht in der gelesenen definitions.ts';
  END IF;
END
$g536$;

COMMIT;
