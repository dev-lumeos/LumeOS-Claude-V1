// Coach · Human Coaches — Entwurfsdaten der Vorlage.
//
// [cmd] Quellen, 1:1 uebernommen:
//   module-coach.jsx:3-131          COACHES, PENDING_INVITES, COACH_NOTES,
//                                   PORTAL_ATHLETES, COACH_PLANS, MESSAGES_THREAD
//   module-coach-athlete.jsx:6-141  PERM_MODULES, ACCESS_LEVELS, PERM_GRANTS,
//                                   PERM_EXPIRY, CONSENT_LOG, PROPOSALS,
//                                   CLIENT_AUTONOMY, AUTONOMY_LADDER,
//                                   CHECKIN_TEMPLATES, CHECKIN_HISTORY, LEVEL_COLOR
//   module-coach-meta.jsx:4-157     COACH_META, ASSIGNMENT_DESC, STYLE_DESC,
//                                   ROLE_LABEL, ONBOARD_STEPS, COACH_OVERRIDES
//
// Die Zahlen sind Entwurfszahlen und bleiben stehen — sie kommen aus der
// Vorlage, nicht aus der Datenbank. Was fehlt, steht im Bericht
// `docs/ssot/102-coach-mockup.md`.

export type Coach = {
  id: string
  type: string
  name: string
  title: string
  org: string
  avatar: string
  color: string
  status: string
  since: string
  sharedModules: string[]
  activePlan: string
  lastMsg: string
  lastMsgAt: string
  unread: number
  cadence: string
  rating: number
  bio: string
  fee: string
}

export const COACHES: Coach[] = [
  {
    id: 'c-train',
    type: 'Training',
    name: 'Anders Lindqvist',
    title: 'Strength · Periodization · S&C',
    org: 'Performance Lab Stockholm',
    avatar: 'AL',
    color: 'var(--acc-train)',
    status: 'active',
    since: '2024-08-12',
    sharedModules: ['Training', 'Recovery', 'Goals'],
    activePlan: 'PPL · Block 3',
    lastMsg: 'Bench at 117.5 felt heavy on set 4 — drop to 115 next session.',
    lastMsgAt: 'Yesterday 21:14',
    unread: 0,
    cadence: 'weekly · Mondays 19:00 CET',
    rating: 4.9,
    bio: '12 years coaching strength athletes. Former NSCA-CSCS. Periodization specialist.',
    fee: '€180 / month',
  },
  {
    id: 'c-nutri',
    type: 'Nutrition',
    name: 'Jana Bauer',
    title: 'Sports nutrition · DGE certified',
    org: 'Independent · Berlin',
    avatar: 'JB',
    color: 'var(--acc-nutri)',
    status: 'active',
    since: '2025-01-18',
    sharedModules: ['Nutrition', 'Goals', 'Supplements (MK-677 only)'],
    activePlan: 'Recomp · 2,700 kcal split',
    lastMsg: 'Increased carbs +20g on training days. Hold for 2 weeks then re-evaluate.',
    lastMsgAt: 'Wed 18:42',
    unread: 1,
    cadence: 'bi-weekly check-in · Wednesdays',
    rating: 4.8,
    bio: 'Specialist for body recomposition. Whoop + DXA integration.',
    fee: '€120 / month',
  },
  {
    id: 'c-med',
    type: 'Medical',
    name: 'Dr. Magnus Kessler',
    title: 'Endokrinologe · Sport-Medicine',
    org: 'Endokrinologie Berlin · Charlottenburg',
    avatar: 'MK',
    color: 'var(--acc-medic)',
    status: 'active',
    since: '2024-09-12',
    sharedModules: ['Medical (full)', 'Supplements (extended)', 'Recovery (summary)'],
    activePlan: 'TRT protocol · quarterly panels',
    lastMsg: 'HCT 48% — within range. Continue current Test Cyp dose. Next panel Jul 15.',
    lastMsgAt: 'Apr 23',
    unread: 0,
    cadence: 'quarterly + ad-hoc',
    rating: 5.0,
    bio: 'Certified endocrinologist. Sports-medicine focus. Member DGE/DGS.',
    fee: '€680 / year',
  },
  {
    id: 'c-suppl',
    type: 'Supplement',
    name: 'David Park',
    title: 'Performance nutrition · evidence-led',
    org: 'Examine.com network · remote',
    avatar: 'DP',
    color: 'var(--acc-suppl)',
    status: 'active',
    since: '2025-03-04',
    sharedModules: ['Supplements (full)', 'Nutrition (summary)'],
    activePlan: 'Stack v3.2 · 8 items',
    lastMsg: 'Ashwagandha cycle off-week starts Jun 9. Reminder set.',
    lastMsgAt: 'Mon 09:32',
    unread: 0,
    cadence: 'monthly review',
    rating: 4.7,
    bio: 'Peer-reviewed evidence approach. No upsell.',
    fee: '€60 / month',
  },
]

export type Invite = {
  id: string
  name: string
  type: string
  invitedOn: string
  expiry: string
}

// G-185: `PENDING_INVITES` ist entfernt (G-163-Beschluss:
// Entwurfskonstanten bleiben nicht als Notfallanzeige stehen).
//
// `[cmd]` Sie trug eine erfundene Einladung („Sarah Müller · Physio ·
// expires May 19") und speiste die Reiterzahl, waehrend daneben seit
// C-225 `coach.relationships` liegt. **Der Reiter liest jetzt die
// Tabelle**, gefiltert auf `status='invited'`.
//
// `[read]` **Der Typ `Invite` bleibt** — er beschreibt die Gestalt der
// Vorlage und wird von `modale.tsx` weiterverwendet.

export type CoachNote = {
  id: string
  coach: string
  coachId: string
  module: string
  date: string
  body: string
  tags: string[]
}

export const COACH_NOTES: CoachNote[] = [
  {
    id: 'n1', coach: 'Anders Lindqvist', coachId: 'c-train', module: 'Training', date: 'May 13',
    body: 'Pull A · Wk2: PR on weighted pull-up at +30kg ×5. Consider deload week 4 already — RPE drifted above plan for 3 sessions.',
    tags: ['PR', 'RPE-watch'],
  },
  {
    id: 'n2', coach: 'Jana Bauer', coachId: 'c-nutri', module: 'Nutrition', date: 'May 8',
    body: 'Add 200g sweet potato to Wed/Sat dinners. Compliance was 92% in April — strong baseline.',
    tags: ['adjustment'],
  },
  {
    id: 'n3', coach: 'Dr. M. Kessler', coachId: 'c-med', module: 'Medical', date: 'Apr 23',
    body: 'All TRT markers stable. Watch Hematocrit if it climbs above 49 — donate blood next quarter as preventive.',
    tags: ['TRT', 'monitor'],
  },
  {
    id: 'n4', coach: 'Anders Lindqvist', coachId: 'c-train', module: 'Training', date: 'May 6',
    body: 'Move Push B from 18:00 to 16:30 next block — Buddy correlation supports it. Will coordinate with Jana on pre-workout meal.',
    tags: ['cross-coach'],
  },
  {
    id: 'n5', coach: 'David Park', coachId: 'c-suppl', module: 'Supplements', date: 'Apr 28',
    body: 'MK-677 baseline panel done. Track fasting glucose. Cycle off if exceeds 110 mg/dL.',
    tags: ['MK-677', 'safety'],
  },
]

export type ThreadMessage = {
  id: string
  from: string
  at: string
  body: string
  direction: 'in' | 'out'
}

export const MESSAGES_THREAD: ThreadMessage[] = [
  { id: 'm1', from: 'Anders', at: 'Yesterday 21:14', body: 'Bench at 117.5 felt heavy on set 4 — drop to 115 next session.', direction: 'in' },
  { id: 'm2', from: 'Tom', at: 'Yesterday 21:18', body: 'Will do. Felt the slow rep on 4. Going for 5×5 next Mon.', direction: 'out' },
  { id: 'm3', from: 'Anders', at: 'Yesterday 21:22', body: 'Good. Send a video if you want me to check bar path on the last attempt.', direction: 'in' },
  { id: 'm4', from: 'Anders', at: 'May 10 09:14', body: 'Pull-up PR. Nice work. Recovery numbers were perfect this week.', direction: 'in' },
  { id: 'm5', from: 'Tom', at: 'May 10 11:32', body: 'Cheers. Felt the lats more than usual — RPE 8.', direction: 'out' },
]

// ── Berechtigungen (module-coach-athlete.jsx) ────────────────────────

export type PermModule = {
  key: string
  label: string
  def: string
  sensitive: boolean
  note?: string
}

export const PERM_MODULES: PermModule[] = [
  { key: 'training', label: 'Training', def: 'full', sensitive: false },
  { key: 'nutrition', label: 'Nutrition', def: 'full', sensitive: false },
  { key: 'recovery', label: 'Recovery', def: 'summary', sensitive: true, note: 'Full HRV data is sensitive' },
  { key: 'supplements', label: 'Supplements', def: 'full', sensitive: false },
  { key: 'medical', label: 'Medical', def: 'none', sensitive: true, note: 'Highest sensitivity — explicit grant only' },
  { key: 'goals', label: 'Goals', def: 'full', sensitive: false },
  { key: 'body_metrics', label: 'Body metrics', def: 'summary', sensitive: true, note: 'Progress photos very sensitive' },
]

export const ACCESS_LEVELS = [
  { key: 'full', label: 'full', desc: 'Coach sees every record in the module' },
  { key: 'summary', label: 'summary', desc: 'Coach sees compliance score + trend only' },
  { key: 'none', label: 'none', desc: 'Module is invisible to this coach' },
]

export type Grants = Record<string, Record<string, string>>

export const PERM_GRANTS: Grants = {
  'c-train': { training: 'full', nutrition: 'none', recovery: 'summary', supplements: 'none', medical: 'none', goals: 'full', body_metrics: 'summary' },
  'c-nutri': { training: 'summary', nutrition: 'full', recovery: 'summary', supplements: 'summary', medical: 'none', goals: 'full', body_metrics: 'summary' },
  'c-med': { training: 'summary', nutrition: 'summary', recovery: 'full', supplements: 'full', medical: 'full', goals: 'summary', body_metrics: 'full' },
  'c-suppl': { training: 'none', nutrition: 'summary', recovery: 'summary', supplements: 'full', medical: 'none', goals: 'summary', body_metrics: 'none' },
}

export const PERM_EXPIRY: Record<string, Record<string, string>> = {
  'c-med': { medical: '2026-12-31' },
}

export const LEVEL_COLOR: Record<string, string> = {
  full: 'var(--pos)',
  summary: 'var(--warn)',
  none: 'var(--fg-dim)',
}

export type ConsentEntry = {
  ts: string
  coach: string
  module: string
  from: string
  to: string
  action: string
  by: string
}

export const CONSENT_LOG: ConsentEntry[] = [
  { ts: '2026-05-02 09:14', coach: 'Dr. M. Kessler', module: 'medical', from: 'none', to: 'full', action: 'granted', by: 'Tom (client)' },
  { ts: '2026-04-18 17:32', coach: 'David Park', module: 'supplements', from: 'summary', to: 'full', action: 'granted', by: 'Tom (client)' },
  { ts: '2026-03-11 08:02', coach: 'Jana Bauer', module: 'body_metrics', from: 'none', to: 'summary', action: 'granted', by: 'Tom (client)' },
  { ts: '2026-02-28 21:40', coach: 'Anders Lindqvist', module: 'nutrition', from: 'summary', to: 'none', action: 'revoked', by: 'Tom (client)' },
  { ts: '2026-01-18 11:05', coach: 'Jana Bauer', module: 'nutrition', from: 'none', to: 'full', action: 'granted', by: 'Tom (client)' },
  { ts: '2024-09-12 14:22', coach: 'Dr. M. Kessler', module: 'recovery', from: 'none', to: 'full', action: 'granted', by: 'Tom (client)' },
  { ts: '2024-08-12 10:00', coach: 'Anders Lindqvist', module: 'training', from: 'none', to: 'full', action: 'granted', by: 'Tom (client)' },
]

// ── Vorschlaege (module-coach-athlete.jsx:46) ────────────────────────

export type Proposal = {
  id: string
  coach: string
  coachId: string
  type: string
  title: string
  sent: string
  status: string
  target: string
  summary: string
  diff: string[][]
  requiresConfirm: boolean
  decidedOn?: string
  declineReason?: string
}

export const PROPOSALS: Proposal[] = [
  {
    id: 'PR-014', coach: 'Anders Lindqvist', coachId: 'c-train', type: 'Training routine',
    title: 'Block 4 · Strength — 5 weeks', sent: 'today 08:14', status: 'pending',
    target: 'Training → Routines',
    summary: 'Transition from hypertrophy to strength. Volume −18%, intensity +8%. Bench moves to 5×3 @ 87%.',
    diff: [
      ['Weekly sets · chest', '16', '13'],
      ['Bench scheme', '5×5 @ 78%', '5×3 @ 87%'],
      ['Session length', '~74 min', '~66 min'],
      ['Deload week', 'wk 5', 'wk 5 (unchanged)'],
    ],
    requiresConfirm: true,
  },
  {
    id: 'PR-013', coach: 'Jana Bauer', coachId: 'c-nutri', type: 'Macro targets',
    title: 'Cut phase · −250 kcal', sent: 'yesterday 18:42', status: 'pending',
    target: 'Nutrition → Targets',
    summary: 'Recomp is stalling at 79.4 kg. Small deficit for 3 weeks, protein held at 2.0 g/kg.',
    diff: [
      ['Calories', '2,700 kcal', '2,450 kcal'],
      ['Protein', '180 g', '180 g'],
      ['Carbs', '320 g', '258 g'],
      ['Fat', '90 g', '90 g'],
    ],
    requiresConfirm: true,
  },
  {
    id: 'PR-012', coach: 'David Park', coachId: 'c-suppl', type: 'Supplement stack',
    title: 'Add L-Theanine 200 mg (evening)', sent: 'Mon 09:32', status: 'accepted',
    target: 'Supplements → Stack',
    summary: 'Pairs with your caffeine timing. Evidence B+, no interactions with the current stack.',
    diff: [['Stack items', '9', '10'], ['Evening slot', '2 items', '3 items'], ['Monthly cost', '€87.10', '€94.10']],
    requiresConfirm: true, decidedOn: 'Mon 19:08',
  },
  {
    id: 'PR-011', coach: 'Anders Lindqvist', coachId: 'c-train', type: 'Training routine',
    title: 'Swap Cable Fly → Dumbbell Fly', sent: 'May 8', status: 'declined',
    target: 'Training → Routines',
    summary: 'Cable station is often occupied at your gym time.',
    diff: [['Push B exercise 3', 'Cable Fly', 'DB Fly']],
    requiresConfirm: true, decidedOn: 'May 8', declineReason: 'Prefer the cable path of motion',
  },
]

// ── Autonomie (module-coach-athlete.jsx:92) ──────────────────────────

export const CLIENT_AUTONOMY = {
  level: 4,
  levelName: 'Advanced',
  coach: 'Anders Lindqvist',
  assignedAt: '2025-09-14',
  assignedBy: 'Anders Lindqvist',
  reason: '12 weeks of consistent logging, self-corrected two deloads without prompting.',
  nextAssessment: '2026-06-15',
  regressionRisk: 0.12,
  checkInFrequency: 'weekly',
  interventionThreshold: 'significant_trends',
  planFlexibility: 'flexible',
  scores: { consistency: 0.92, knowledge: 0.84, self_correction: 0.88, communication: 0.79, overall: 0.86 },
  history: [
    { date: '2025-09-14', from: 3 as number | null, to: 4, type: 'promotion', reason: 'Consistent 12 weeks · self-managed deload' },
    { date: '2025-04-02', from: 2 as number | null, to: 3, type: 'promotion', reason: 'Knowledge score crossed 0.75' },
    { date: '2024-08-12', from: null as number | null, to: 2, type: 'initial', reason: 'Onboarding assessment' },
  ],
}

export const AUTONOMY_LADDER = [
  { lvl: 1, name: 'Novice', cadence: 'daily', threshold: 'any_deviation', flex: 'strict' },
  { lvl: 2, name: 'Developing', cadence: 'weekly', threshold: 'any_deviation', flex: 'guided' },
  { lvl: 3, name: 'Intermediate', cadence: 'bi_weekly', threshold: 'significant_trends', flex: 'guided' },
  { lvl: 4, name: 'Advanced', cadence: 'weekly', threshold: 'significant_trends', flex: 'flexible' },
  { lvl: 5, name: 'Expert', cadence: 'monthly', threshold: 'safety_only', flex: 'autonomous' },
]

// ── Check-ins (module-coach-athlete.jsx:121) ─────────────────────────

export const CHECKIN_TEMPLATES = [
  {
    id: 'weekly_standard', name: 'Weekly standard', cadence: 'Mondays 08:00', active: true, coach: 'Anders Lindqvist',
    fields: ['Bodyweight', 'Training adherence', 'Energy 1–10', 'Sleep quality 1–10', 'Soreness map', 'Free note'],
  },
  {
    id: 'prep_intensive', name: 'Prep intensive', cadence: 'Mon + Thu', active: false, coach: '—',
    fields: ['Bodyweight', 'Waist', 'Front/back photo', 'Macro adherence', 'Cardio minutes', 'Hunger 1–10', 'Free note'],
  },
  {
    id: 'nutrition_only', name: 'Nutrition focus', cadence: 'Wednesdays', active: true, coach: 'Jana Bauer',
    fields: ['Bodyweight', 'Macro adherence', 'Digestion 1–5', 'Cravings 1–5', 'Free note'],
  },
]

export const CHECKIN_HISTORY: Array<{
  date: string; template: string; status: string; coach: string; reply: string | null
}> = [
  { date: 'May 12', template: 'Weekly standard', status: 'submitted', coach: 'Anders Lindqvist', reply: 'Solid week. Hold the plan.' },
  { date: 'May 14', template: 'Nutrition focus', status: 'submitted', coach: 'Jana Bauer', reply: 'Carbs up 20 g on training days.' },
  { date: 'May 5', template: 'Weekly standard', status: 'submitted', coach: 'Anders Lindqvist', reply: 'Bench felt heavy — drop to 115.' },
  { date: 'Apr 28', template: 'Weekly standard', status: 'missed', coach: 'Anders Lindqvist', reply: null },
]

// ── Beziehungsdaten (module-coach-meta.jsx) ──────────────────────────
//
// `[cmd]` Die Vorlage traegt bei `c-suppl` ein zusaetzliches `style2: null`,
// das keine andere Zeile hat und das nichts liest. Nicht uebernommen —
// ein Feld, das nirgends gelesen wird, ist kein Inhalt.

export type CoachMetaEntry = {
  assignment: string
  style: string
  role: string
  certs: string[]
  years: number
  rated: number
  maxClients: number
  current: number
}

export const COACH_META: Record<string, CoachMetaEntry> = {
  'c-train': { assignment: 'primary', style: 'hands_on', role: 'head_coach', certs: ['NSCA-CSCS', 'NASM-PES'], years: 12, rated: 5, maxClients: 20, current: 14 },
  'c-nutri': { assignment: 'primary', style: 'collaborative', role: 'senior_coach', certs: ['DGE', 'PN1', 'ISSN'], years: 8, rated: 4, maxClients: 30, current: 22 },
  'c-med': { assignment: 'secondary', style: 'consultative', role: 'coach', certs: ['Facharzt Endokrinologie'], years: 18, rated: 5, maxClients: 40, current: 31 },
  'c-suppl': { assignment: 'temporary', style: 'consultative', role: 'coach', certs: ['ISSN-SNS'], years: 6, rated: 4, maxClients: 60, current: 44 },
}

export const ASSIGNMENT_DESC: Record<string, string> = {
  primary: 'Owns the plan for their domain. First point of contact.',
  secondary: 'Advises alongside a primary coach. No plan ownership.',
  temporary: 'Time-boxed engagement — ends without renewal.',
}

export const STYLE_DESC: Record<string, string> = {
  hands_on: 'Prescribes and checks. Expects the plan followed as written.',
  collaborative: 'Proposes and negotiates. Your input shapes the plan.',
  consultative: 'Answers when asked. You drive, they advise.',
}

export const ROLE_LABEL: Record<string, string> = {
  trainee_coach: 'Trainee',
  coach: 'Coach',
  senior_coach: 'Senior Coach',
  head_coach: 'Head Coach',
}

export const ONBOARD_STEPS = [
  {
    n: 1, title: 'Invite accepted', desc: 'Coach sends a link or QR. You register and pick permissions.',
    detail: ['Invite link or QR code', 'Account created or matched', 'Initial permission grants'],
  },
  {
    n: 2, title: 'Profile review', desc: 'Coach reads your onboarding data and sets a starting autonomy level.',
    detail: ['Goals, injuries, diet reviewed', 'Initial autonomy — default level 2', 'Tags applied: intermediate · male'],
  },
  {
    n: 3, title: 'Plan created', desc: 'Training routine, macro targets and supplement stack — all as proposals.',
    detail: ['Routine from library or new', 'Calorie target from goal and TDEE', 'Stack assembled from catalog'],
  },
  {
    n: 4, title: 'Rules activated', desc: 'System rules run by default. Coach enables the custom ones.',
    detail: ['10 system templates active', 'Custom rules for your client type', 'Alert thresholds set'],
  },
  {
    n: 5, title: 'Check-in scheduled', desc: 'A template is chosen and starts on the next Monday.',
    detail: ['weekly_standard or prep_intensive', 'First check-in next Monday', 'Cadence follows autonomy level'],
  },
]

export const COACH_OVERRIDES = [
  {
    coach: 'Anders Lindqvist', type: 'Training', field: 'autonomy_level',
    yours: 'L3 · collaborative', theirs: 'L2 · cautious', active: true,
    why: 'During block 4 peaking he wants confirmation before Buddy changes anything training-related.',
  },
  {
    coach: 'Anders Lindqvist', type: 'Training', field: 'max_intervention_intensity',
    yours: '0.8', theirs: '0.6', active: true,
    why: 'No confrontational tone during a peaking block.',
  },
  {
    coach: 'Dr. M. Kessler', type: 'Medical', field: 'blocked_rules',
    yours: '—', theirs: 'supplement_suggestion_on_labs', active: true,
    why: 'Buddy must never propose a supplement in response to a lab value. Hard block, not a preference.',
  },
  {
    coach: 'Jana Bauer', type: 'Nutrition', field: 'custom_rule',
    yours: '—', theirs: 'protein_reminder_at_18:00', active: false,
    why: 'Offered but not accepted by you — Buddy does not run it.',
  },
]
