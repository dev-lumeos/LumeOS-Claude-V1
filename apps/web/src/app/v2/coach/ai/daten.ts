// Coach · AI Coach (Buddy) — Entwurfsdaten der Vorlage.
//
// `[cmd]` Quellen, 1:1 uebernommen:
//   module-buddy.jsx:3-63           BUDDY_PERSONAS, BUDDY_STATES,
//                                   BUDDY_CHAT_HISTORY, BUDDY_INSIGHTS_FEED,
//                                   BUDDY_MEMORY, BUDDY_DECISIONS
//   module-buddy-engines.jsx:5-220  TIERS, TIER_LABEL, TIER_PRICE,
//                                   GATED_FEATURES, tierRank, hasFeature,
//                                   AI_PATHS, PATH_LOG, ENGINES, CHECKPOINTS,
//                                   DOW, PERSONA_LABEL, WATCHER_RULES,
//                                   WATCHER_ALERTS, BSS, SIGNATURE,
//                                   INTERVENTIONS, INTERVENTION_LOAD,
//                                   SAFETY_RULES, GATE_LOG, BUTLER_INTENTS,
//                                   BUTLER_LOG, CRON_JOBS, STATE_COLOR
//
// `[cmd]` NICHT hier, sondern beim jeweiligen Tab: `KB_ENTRIES` und
// `USER_RULES` (module-buddy-knowledge.jsx:4/85) stehen in
// `tab-wissen.tsx`, die Sitzungsdaten (module-buddy-voice.jsx:4-61) in
// `tab-stimme.tsx`. Beide werden von genau einem Tab gelesen; sie hier
// zu fuehren hiesse, eine gemeinsame Datei fuer etwas Einzelnes zu
// oeffnen. `COACH_OVERRIDES` liegt in `../daten` — der Tab „Coach
// overrides" gehoert der Vorlage nach zu Human Coaches (siehe
// tab-overrides.tsx).
//
// `[cmd]` Elf der Konstanten stehen NICHT in der `Object.assign`-Zeile
// der Vorlage (TIER_LABEL, TIER_PRICE, tierRank, PATH_LOG, DOW,
// PERSONA_LABEL, WATCHER_ALERTS, INTERVENTION_LOAD, GATE_LOG,
// BUTLER_LOG, STATE_COLOR) — sie sind dateilokal. Uebernommen sind sie
// trotzdem: die Ansichten lesen sie, und was gelesen wird, ist Inhalt.
//
// Die Zahlen sind Entwurfszahlen und bleiben stehen — es gibt kein
// Buddy-Schema. Was fehlt, steht in `docs/ssot/106-ai-coach-mockup.md`.

import type { IconName } from '@lumeos/ui'

// ── Rahmen (module-buddy.jsx) ────────────────────────────────────────

export type Persona = { id: string; name: string; desc: string; icon: IconName }

export const BUDDY_PERSONAS: Persona[] = [
  { id: 'scientist', name: 'Scientist', desc: 'Evidence-led · cites sources · neutral tone', icon: 'brain' },
  { id: 'motivator', name: 'Motivator', desc: 'Energetic · celebrates wins · pushes hard', icon: 'bolt' },
  { id: 'drill', name: 'Drill Sergeant', desc: 'Direct · no-nonsense · accountability-first', icon: 'training' },
  { id: 'friend', name: 'Best Friend', desc: 'Warm · empathetic · conversational', icon: 'user' },
  { id: 'zen', name: 'Zen Master', desc: 'Calm · long-view · holistic', icon: 'moon' },
]

export type BuddyState = { id: string; label: string; desc: string }

export const BUDDY_STATES: BuddyState[] = [
  { id: 'idle', label: 'Idle', desc: 'ambient · listening for cues' },
  { id: 'thinking', label: 'Thinking', desc: 'processing your data' },
  { id: 'responding', label: 'Responding', desc: 'generating answer' },
  { id: 'alert', label: 'Alert', desc: 'something needs your attention' },
  { id: 'celebrating', label: 'Celebrating', desc: 'you hit a milestone' },
]

export type ChatMessage = { from: string; at: string; body: string; state?: string }

export const BUDDY_CHAT_HISTORY: ChatMessage[] = [
  { from: 'buddy', at: 'today 14:18', body: 'Pre-workout dose in 4h 02m — Beta-Alanine + Caffeine. Want me to set a reminder?', state: 'responding' },
  { from: 'tom', at: 'today 14:18', body: 'yes, 15 min before' },
  { from: 'buddy', at: 'today 14:18', body: 'Done. Reminder set for 17:15. Also: Anders flagged moving Push B to 16:30 — that would shift the pre-workout window to ~15:00. Stay with 17:30 or adjust?', state: 'responding' },
  { from: 'tom', at: 'today 14:19', body: 'stay with 17:30 for this week, then we can shift' },
  { from: 'buddy', at: 'today 14:19', body: "Noted. I'll remind Anders too.", state: 'idle' },
  { from: 'buddy', at: 'today 09:32', body: 'Glucose trending up since MK-677 start. Tagged for next lab panel discussion with Dr. Kessler.', state: 'alert' },
  { from: 'buddy', at: 'today 07:43', body: 'Bench Press PR moved to 122.5kg this week. Strength block 3 is hitting its mark — recovery score 82, sleep quality 84. Push hard tonight.', state: 'celebrating' },
  { from: 'tom', at: 'yesterday 21:14', body: 'buddy why is my sleep down?' },
  { from: 'buddy', at: 'yesterday 21:14', body: 'Three nights in a row of <7h. Caffeine at 17:30 might be the cause — your previous cut-off was 14:00. Pattern detection suggests pushing caffeine 90min earlier.', state: 'responding' },
]

export type FeedItem = { ts: string; type: string; title: string; body: string; actions: string[] }

export const BUDDY_INSIGHTS_FEED: FeedItem[] = [
  { ts: 'today 14:18', type: 'suggestion', title: 'Pre-workout window opens in 15 min', body: 'Optimal eating window for tonight\'s 17:30 session starts at 15:30. Same as yesterday available.', actions: ['Log meal', 'Snooze'] },
  { ts: 'today 09:32', type: 'alert', title: 'Glucose trending up · 4 weeks', body: 'Fasting glucose +14 mg/dL since MK-677 start. Within range but worth flagging at next panel.', actions: ['Open Medical', 'Dismiss'] },
  { ts: 'today 07:43', type: 'celebration', title: 'PR — Bench Press 122.5kg ×3', body: 'Highest e1RM in 12 weeks. Block 3 trajectory matches plan. Share with Anders?', actions: ['Share', 'Save'] },
  { ts: 'yesterday 19:22', type: 'pattern', title: 'Sleep onset later on training days', body: 'Avg 22:48 vs 22:14 on rest days. Possibly caffeine timing or post-workout cortisol.', actions: ['See data', 'Dismiss'] },
  { ts: 'yesterday 14:00', type: 'suggestion', title: 'Cold plunge effect detected', body: '+4.2ms HRV next morning when logged. Currently 2.8/wk vs target 3.5. Add Thursday slot?', actions: ['Schedule', 'Dismiss'] },
  { ts: 'Mon', type: 'celebration', title: '23-day supplement streak', body: 'All 8 daily items taken. Highest streak this year.', actions: ['Share'] },
]

export type MemoryEntry = { id: string; cat: string; fact: string; source: string; updated: string }

export const BUDDY_MEMORY: MemoryEntry[] = [
  { id: 'm1', cat: 'Profile', fact: 'Tom is 36, 184cm, 79.4kg, athlete-pro tier', source: 'Auth · Profile', updated: 'Apr 23' },
  { id: 'm2', cat: 'Goal', fact: 'Body recomposition · 78kg @ 12% BF by Aug 1', source: 'Goals · g1', updated: 'Mar 15' },
  { id: 'm3', cat: 'Preference', fact: 'Trains Mon/Tue/Wed/Fri/Sat · rest Thu/Sun', source: 'Training pattern', updated: 'May 14' },
  { id: 'm4', cat: 'Preference', fact: 'Pre-workout window 60-120min before training (typical 17:30)', source: 'Pattern detection', updated: 'May 10' },
  { id: 'm5', cat: 'Constraint', fact: 'Lactose-intolerant (mild) · avoids ice cream pre-workout', source: 'Tom (Apr 8)', updated: 'Apr 8' },
  { id: 'm6', cat: 'Coach rule', fact: 'Anders prefers RPE-based loading · not %1RM', source: 'Coach config', updated: 'Sep 12, 2024' },
  { id: 'm7', cat: 'Coach rule', fact: 'Jana adjusts macros based on weight trend, not absolute', source: 'Coach config', updated: 'Feb 14' },
  { id: 'm8', cat: 'Medical', fact: 'On TRT since Sep 2024 · current trough 712 ng/dL', source: 'Medical · DOC-014', updated: 'Apr 23' },
  { id: 'm9', cat: 'Medical', fact: 'MK-677 cycle wk 7/12 · monitoring fasting glucose', source: 'Supplements · ext', updated: 'May 14' },
  { id: 'm10', cat: 'Personality', fact: 'Responds best to data + reasoning, not pep talks', source: 'Persona test', updated: 'Jan 8' },
  { id: 'm11', cat: 'Privacy', fact: 'Training coach (Anders) does not see Nutrition data', source: 'Privacy settings', updated: 'Sep 12, 2024' },
  { id: 'm12', cat: 'Achievement', fact: 'Bench PR 122.5kg (Apr 29) · Deadlift 192kg e1RM', source: 'Training · PRs', updated: 'May 13' },
]

export type Decision = {
  ts: string; decision: string; category: string; autonomy: string; outcome: string
}

export const BUDDY_DECISIONS: Decision[] = [
  { ts: 'today 14:18', decision: 'Created reminder · pre-workout 17:15', category: 'Reminder', autonomy: 'auto', outcome: 'pending' },
  { ts: 'today 09:32', decision: 'Flagged glucose trend for next Medical panel', category: 'Insight', autonomy: 'auto', outcome: 'logged' },
  { ts: 'today 07:43', decision: 'Detected PR · bench 122.5kg · sent celebration', category: 'Pattern', autonomy: 'auto', outcome: 'delivered' },
  { ts: 'yesterday 19:22', decision: 'Detected sleep onset shift on training days', category: 'Pattern', autonomy: 'auto', outcome: 'shared' },
  { ts: 'yesterday 14:00', decision: 'Suggested cold plunge schedule shift', category: 'Suggestion', autonomy: 'advisory', outcome: 'shared' },
  { ts: 'Mon', decision: 'Auto-celebrated 23-day supplement streak', category: 'Reward', autonomy: 'auto', outcome: 'delivered' },
  { ts: 'May 8', decision: 'Skipped low-confidence alert (sleep variance only)', category: 'Filter', autonomy: 'auto', outcome: 'filtered' },
]

// ── Stufen und Tore (module-buddy-engines.jsx:5-26) ──────────────────

export const TIERS = ['free', 'plus', 'pro', 'elite'] as const
export type Tier = typeof TIERS[number]

export const TIER_LABEL: Record<string, string> = {
  free: 'Free', plus: 'Plus', pro: 'Pro', elite: 'Elite',
}

export const TIER_PRICE: Record<string, string> = {
  free: '€0', plus: '€8 / mo', pro: '€18 / mo', elite: '€39 / mo',
}

// `[cmd]` `min: 'coach'` ist KEINE Stufe aus `TIERS` — die Zeile
// `ai_clone` zeigt deshalb in allen vier Spalten „—". Uebernommen wie
// die Vorlage es fuehrt (module-buddy-engines.jsx:23).
export const GATED_FEATURES = [
  { key: 'chat_limited', label: 'Text chat · 5 / day', min: 'free' },
  { key: 'insights_feed', label: 'Insights feed', min: 'free' },
  { key: 'chat_unlimited', label: 'Chat unlimited', min: 'plus' },
  { key: 'all_personas', label: 'All 5 personas', min: 'plus' },
  { key: 'journey', label: 'Journey / Heartbeat', min: 'plus' },
  { key: 'voice_input', label: 'Voice input', min: 'pro' },
  { key: 'action_execution', label: 'Action execution', min: 'pro' },
  { key: 'proactive_watcher', label: 'Proactive watcher', min: 'pro' },
  { key: 'push', label: 'Push notifications', min: 'pro' },
  { key: 'gym_finder', label: 'Gym finder', min: 'pro' },
  { key: 'training_plans', label: 'Training plans', min: 'elite' },
  { key: 'cycle_consulting', label: 'Cycle consulting', min: 'elite' },
  { key: 'weekly_report', label: 'Weekly deep report', min: 'elite' },
  { key: 'ai_clone', label: 'AI Clone', min: 'coach' },
]

const tierRank = (t: string): number =>
  ({ free: 0, plus: 1, pro: 2, elite: 3, coach: 4 } as Record<string, number>)[t] ?? 0

export const hasFeature = (userTier: string, min: string): boolean =>
  tierRank(userTier) >= tierRank(min)

// ── Pfade und Motoren (module-buddy-engines.jsx:29-57) ───────────────

export const AI_PATHS = [
  { id: 'fast', label: 'Fast path', model: 'none (engines only)', cost: '$0', share: 60, when: 'Dashboard cards, scores, anything already computed' },
  { id: 'knowledge', label: 'Knowledge path', model: 'GLM-4.7-Flash / Haiku', cost: '~$0.002', share: 20, when: "Science questions that don't need your data" },
  { id: 'hybrid', label: 'Hybrid path', model: 'GLM-4.7-Flash / Sonnet', cost: '~$0.005–0.02', share: 20, when: 'Cross-module analysis — engines feed the LLM' },
]

export const PATH_LOG = [
  { at: '14:19', msg: 'stay with 17:30 for this week', path: 'fast', cost: 0, ms: 40 },
  { at: '14:18', msg: 'Pre-workout dose in 4h 02m…', path: 'hybrid', cost: 0.018, ms: 1840 },
  { at: '09:32', msg: 'Glucose trending up since MK-677…', path: 'hybrid', cost: 0.021, ms: 2140 },
  { at: '07:43', msg: 'Bench PR 122.5 kg — block on target', path: 'fast', cost: 0, ms: 32 },
  { at: 'yest', msg: 'Why is creatine loading optional?', path: 'knowledge', cost: 0.002, ms: 680 },
  { at: 'yest', msg: 'Sleep down three nights — caffeine?', path: 'hybrid', cost: 0.019, ms: 1920 },
]

export const ENGINES = [
  { id: 'nutrition', label: 'Nutrition', out: 'nutrition_score · protein_gap · calorie_gap · micronutrient_deficits', val: '72', state: 'ok' },
  { id: 'training', label: 'Training', out: 'training_readiness · progression_state · overreach_risk', val: '84', state: 'ok' },
  { id: 'recovery', label: 'Recovery', out: 'recovery_score · deload_recommendation · sleep_priority_flag', val: '82', state: 'ok' },
  { id: 'biomarker', label: 'Biomarker', out: 'biomarker_risk_flags · escalation_recommendation', val: '1 flag', state: 'warn' },
  { id: 'supplement', label: 'Supplement', out: 'stack_safety_score · interaction_flags', val: '94', state: 'ok' },
  { id: 'bodycomp', label: 'Body composition', out: 'composition_score · phase_state · tdee_estimate', val: '2,847', state: 'ok' },
  { id: 'behaviour', label: 'Behaviour', out: 'compliance_score · adherence_pattern', val: '91', state: 'ok' },
  { id: 'circadian', label: 'Circadian', out: 'circadian_alignment_score · optimal_training_window', val: '76', state: 'ok' },
  { id: 'energy', label: 'Energy availability', out: 'energy_availability_score · underfueling_flag', val: '38 kcal/kg', state: 'warn' },
  { id: 'stress', label: 'Stress load', out: 'stress_load_score · overload_flag', val: '44', state: 'ok' },
  { id: 'electrolyte', label: 'Electrolyte', out: 'electrolyte_balance_score · imbalance_flags', val: '88', state: 'ok' },
]

export const STATE_COLOR: Record<string, string> = {
  ok: 'var(--pos)', warn: 'var(--warn)', bad: 'var(--neg)',
}

// ── Heartbeat (module-buddy-engines.jsx:60-78) ───────────────────────

export type Checkpoint = {
  id: string
  emoji: string
  time: string
  enabled: boolean
  persona: string
  push: boolean
  days: number[]
  modules: string[]
  content: Record<string, boolean>
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 'morning', emoji: '🌅', time: '07:00', enabled: true, persona: 'drill_sergeant', push: true,
    days: [1, 2, 3, 4, 5, 6], modules: ['recovery', 'nutrition', 'supplements'],
    content: { show_recovery: true, show_macros: true, show_supplements: true, show_goals: false },
  },
  {
    id: 'midday', emoji: '🍽️', time: '12:30', enabled: false, persona: 'best_friend', push: false,
    days: [1, 2, 3, 4, 5], modules: ['nutrition'],
    content: { show_recovery: false, show_macros: true, show_supplements: false, show_goals: false },
  },
  {
    id: 'preworkout', emoji: '🏋️', time: '16:00', enabled: true, persona: 'motivator', push: true,
    days: [1, 2, 3, 5, 6], modules: ['training', 'nutrition'],
    content: { show_recovery: true, show_macros: true, show_supplements: true, show_goals: false },
  },
  {
    id: 'evening', emoji: '🌙', time: '21:00', enabled: true, persona: 'zen_master', push: false,
    days: [0, 1, 2, 3, 4, 5, 6], modules: ['recovery', 'supplements'],
    content: { show_recovery: true, show_macros: false, show_supplements: true, show_goals: false },
  },
  {
    id: 'weekly', emoji: '📊', time: '20:00', enabled: true, persona: 'scientist', push: true,
    days: [0], modules: ['training', 'nutrition', 'recovery', 'goals'],
    content: { show_recovery: true, show_macros: true, show_supplements: true, show_goals: true },
  },
]

export const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const PERSONA_LABEL: Record<string, string> = {
  scientist: 'Scientist', motivator: 'Motivator', drill_sergeant: 'Drill Sergeant',
  best_friend: 'Best Friend', zen_master: 'Zen Master',
}

// ── Waechter (module-buddy-engines.jsx:81-101) ───────────────────────

export const WATCHER_RULES = [
  { id: 'nutrition_nothing_logged', level: 'warning', category: 'nutrition', cond: 'meals_today === 0 AND hour >= 14', now: '3 meals by 13:08', fires: false },
  { id: 'recovery_critical', level: 'warning', category: 'recovery', cond: 'recovery_score < 50 AND heavy_training_day', now: '82 · heavy day today', fires: false },
  { id: 'sleep_consecutive_bad', level: 'warning', category: 'recovery', cond: 'bad_sleep_days_consecutive >= 3', now: '1 night under 6 h', fires: false },
  { id: 'supplement_interaction_critical', level: 'critical', category: 'supplements', cond: 'supplement_interaction_critical === true', now: 'no critical interaction', fires: false },
  { id: 'glucose_trend_up', level: 'warning', category: 'cross_module', cond: 'fasting_glucose rising 4 weeks AND enhanced_cycle_active', now: '+14 mg/dL since MK-677 start', fires: true },
]

export const WATCHER_ALERTS = [
  {
    id: 'AL-3312', level: 'warning', category: 'cross_module', created: 'today 02:00',
    message: 'Fasting glucose has climbed 14 mg/dL since the MK-677 cycle started. Still in range, worth raising at the next panel.',
    dismissCount: 0, expires: 'in 34 h',
  },
  {
    id: 'AL-3308', level: 'info', category: 'recovery', created: 'Mon 02:00',
    message: 'Sleep onset is drifting later on training days — 22:48 vs 22:14 on rest days.',
    dismissCount: 2, expires: 'expired',
  },
]

// ── BSS · Behavior Stability Score (module-buddy-engines.jsx:104-122) ─
//
// `[read]` Der Auftrag nennt die Quelle: `SPEC_09_SCORING.md`, gedacht
// fuer `packages/scoring/src/buddy.ts`. Hier stehen nur die
// Entwurfszahlen der Vorlage; gerechnet wird nichts.

export const BSS = {
  total: 71, prior: 58, delta: 13, trend: 'improving', period: 'rolling_90d',
  formula: 'BSS = stability_score × 0.6 + goal_alignment_score × 0.4',
  stability: {
    training_consistency: 78,
    nutrition_adherence_stability: 74,
    recovery_stability: 66,
    dropout_events: { count: 2, score: 80 },
    bounceback_time: { avg_days: 2, score: 84 },
    stability_score: 76,
  },
  alignment: {
    training: { target_per_week: 5, actual_avg: 4.6, alignment: 92 },
    nutrition: { protein_target_hit_rate: 86, calorie_target_hit_rate: 64 },
    body_composition: { goal: 'recomp 78 kg @ 12 %', on_track: true },
    alignment_score: 64,
  },
  history: [52, 54, 56, 58, 58, 61, 63, 65, 66, 68, 70, 71],
}

// ── Signatur (module-buddy-engines.jsx:125-140) ──────────────────────

export type SignaturePattern = {
  key: string
  label: string
  detected: boolean
  confidence: number
  n: number
  detail: string
  pattern?: string
  first?: string
  last?: string
  threshold_g?: number
}

export const SIGNATURE: {
  weeksOfData: number; minWeeks: number; eventCount: number; patterns: SignaturePattern[]
} = {
  weeksOfData: 11, minWeeks: 8, eventCount: 412,
  patterns: [
    {
      key: 'stress_pattern', label: 'Stress → skips training', detected: true, confidence: 0.74, n: 9,
      pattern: 'skips_training', first: '2026-02-18', last: '2026-05-09',
      detail: 'On days you log stress ≥ 7, the evening session is skipped 6 of 9 times.',
    },
    {
      key: 'protein_collapse', label: 'Protein collapse', detected: true, confidence: 0.68, n: 7,
      pattern: 'weekend_drop', first: '2026-03-01', last: '2026-05-11', threshold_g: 120,
      detail: 'Saturday protein lands under 120 g in 7 of the last 11 weekends.',
    },
    {
      key: 'dropout_risk', label: 'Dropout risk window', detected: true, confidence: 0.61, n: 5,
      pattern: 'friday@18:00', first: '2026-03-14', last: '2026-05-08',
      detail: 'Friday evening sessions are the ones most often missed.',
    },
    {
      key: 'motivation_type', label: 'Motivation type', detected: false, confidence: 0.34, n: 3,
      detail: 'Not enough signal yet — needs more logged mood/outcome pairs.',
    },
  ],
}

// ── Interventionen (module-buddy-engines.jsx:143-160) ────────────────

export type Intervention = {
  id: string; bucket: string; type: string; tone: string; at: string
  content: string; expected: string; observed: string; effectiveness: number | null
}

export const INTERVENTIONS: Intervention[] = [
  { id: 'IV-88', bucket: 'high_stress__missed_workout', type: 'encouragement', tone: 'soft', at: 'May 9 19:40', content: 'Rough week showing up in the numbers. 20 minutes easy would still count.', expected: 'engaged', observed: 'engaged', effectiveness: 0.82 },
  { id: 'IV-87', bucket: 'protein_below_target__evening', type: 'adjustment', tone: 'analytical', at: 'May 8 20:10', content: "45 g short. Casein before bed closes it without touching tomorrow's deficit.", expected: 'accepted', observed: 'accepted', effectiveness: 0.91 },
  { id: 'IV-86', bucket: 'streak_at_risk__friday', type: 'confrontation', tone: 'direct', at: 'May 2 17:30', content: 'Third Friday in a row. Is the slot wrong, or is the session wrong?', expected: 'engaged', observed: 'rejected', effectiveness: 0.24 },
  { id: 'IV-85', bucket: 'recovery_low__heavy_day', type: 'redirect', tone: 'tough_love', at: 'Apr 28 06:50', content: 'Recovery 48. Move the heavy day, keep the week.', expected: 'accepted', observed: 'accepted', effectiveness: 0.88 },
  { id: 'IV-84', bucket: 'all_green__no_signal', type: 'silence', tone: '—', at: 'Apr 26', content: '(no intervention — nothing worth saying)', expected: '—', observed: '—', effectiveness: null },
]

export const INTERVENTION_LOAD = {
  window: '7 days', total: 3, max: 5, confrontations: 1, maxConfrontations: 2,
  identity: 0, maxIdentity: 3,
}

// ── Sicherheit (module-buddy-engines.jsx:163-183) ────────────────────

export const SAFETY_RULES = [
  { rule: 'Medical Gate', detail: 'No diagnoses, dosages or therapy recommendations.' },
  { rule: 'Supplement–biomarker decoupling', detail: 'Supplements are never suggested in response to a lab value.' },
  { rule: 'Manipulation guard', detail: 'No fear, guilt or streak-shaming narratives.' },
  { rule: 'Medication gate', detail: "Medication logged → only 'discuss with your doctor or pharmacist'." },
  { rule: 'max_intervention_intensity', detail: 'Never autonomously above 0.8.' },
  { rule: 'intervention_load_7d', detail: 'Max 5 per week · 2 confrontations · 3 identity statements.' },
  { rule: 'Policy Gate', detail: 'Server-side before every response: PASS · REDACT · BLOCK.' },
  { rule: 'Safety priority', detail: 'Safety > Recovery > Training > Nutrition > Behavior.' },
  { rule: 'Evidence obligation', detail: 'Study claims never in speech_text — only in UI cards.' },
]

export const GATE_LOG = [
  {
    at: 'today 09:32', verdict: 'REDACT', reason: 'dosage_mention',
    before: 'Your glucose is climbing — drop MK-677 to 5 mg and add 500 mg berberine.',
    after: "Your fasting glucose has moved from 88 to 102 mg/dL since the cycle started. That's worth raising with Dr. Kessler before the next panel.",
  },
  {
    at: 'Apr 23 11:14', verdict: 'BLOCK', reason: 'medical_diagnosis',
    before: 'Your ferritin pattern suggests early hemochromatosis.',
    after: 'Ferritin is 142 ng/mL, inside the reference range. If you want this interpreted in context, your next panel is the place.',
  },
  {
    at: 'Apr 12 08:02', verdict: 'PASS', reason: '—', before: '—',
    after: 'Protein is at 142 g of 180 g. Casein tonight closes most of it.',
  },
]

// ── Butler · Action Executor (module-buddy-engines.jsx:186-204) ──────
//
// `[read]` Der Auftrag nennt die Quelle: `SPEC_07_API.md`, Intent-Parser.
// Braucht `requireFeature('action_execution')`, Pro-Stufe — was sich mit
// `GATED_FEATURES` deckt (`action_execution`, `min: 'pro'`).

export const BUTLER_INTENTS = [
  { type: 'log_meal', label: 'Log meal', target: 'Nutrition', preview: true, ex: 'Had 200 g chicken with 150 g rice' },
  { type: 'log_water', label: 'Log water', target: 'Nutrition', preview: false, ex: '500 ml water' },
  { type: 'log_weight', label: 'Log weight', target: 'Goals', preview: false, ex: '79.2 this morning' },
  { type: 'log_supplement', label: 'Log supplement', target: 'Supplements', preview: false, ex: 'Took the morning stack' },
  { type: 'log_checkin', label: 'Log check-in', target: 'Recovery', preview: false, ex: 'Slept 7 h, feel a 7' },
  { type: 'log_set', label: 'Log set', target: 'Training', preview: false, ex: '117.5 for 5' },
]

export const BUTLER_LOG = [
  { at: 'today 13:08', said: 'Had 200 g chicken with 150 g rice', intent: 'log_meal', conf: 0.94, status: 'confirmed', result: '490 kcal · 52 P · 57 C · 6 F → Nutrition' },
  { at: 'today 07:44', said: 'Took the morning stack', intent: 'log_supplement', conf: 0.97, status: 'executed', result: '3 items marked taken → Supplements' },
  { at: 'yesterday 21:02', said: 'Weight 79.4', intent: 'log_weight', conf: 0.99, status: 'executed', result: '79.4 kg → Goals' },
  { at: 'yesterday 18:40', said: 'Some pasta I think', intent: 'log_meal', conf: 0.41, status: 'clarification', result: 'Asked back: how much, and with what?' },
]

export const CRON_JOBS = [
  { job: 'Proactive watcher', schedule: 'daily 02:00', desc: 'Check every user for critical patterns', last: 'today 02:00', next: 'tomorrow 02:00' },
  { job: 'BSS calculation', schedule: 'daily 03:00', desc: 'Rolling 90-day BSS for active users', last: 'today 03:00', next: 'tomorrow 03:00' },
  { job: 'Behavioral signature', schedule: 'daily 04:00', desc: 'Update for users with ≥ 8 weeks of data', last: 'today 04:00', next: 'tomorrow 04:00' },
  { job: 'Journey dispatcher', schedule: 'every minute', desc: 'Fire heartbeat checkpoints', last: '14:19', next: '16:00 · pre-workout' },
  { job: 'Memory decay', schedule: 'daily 06:00', desc: 'Weaken old or unused memories', last: 'today 06:00', next: 'tomorrow 06:00' },
  { job: 'Weekly deep report', schedule: 'Mon 05:00', desc: 'Elite tier weekly report', last: 'Mon 05:00', next: 'Mon 05:00' },
]
