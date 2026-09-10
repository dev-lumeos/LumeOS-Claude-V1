// Die Kontextspalte des Drafts — G-405/A4.
//
// ══ ABGELESEN AUS `module-coach-portal-context.jsx` ═════════════════
//
// `[cmd]` **`OPS_CTX` (Zeile 3-142) fuehrt elf Bereiche**, je mit
// Nachricht, Zustand, vier Schnellaktionen, zwei bis drei
// Erkenntnissen und vier Kennzahlen. `[cmd]` **Gemessen: 44
// Aktionen, 26 Erkenntnisse, 44 Kennzahlen.**
//
// `[cmd]` **Die Spalte ist 306 px breit** (`:148`) und **kennt den
// Bereich** — `PortalContextPanel({ section, onNav })` (`:144`).
//
// ══ WARUM DIESE TEXTE HIER STEHEN ═══════════════════════════════════
//
// `[read]` **Sie sind Vorfuehrmaterial des Drafts** — „Lukas · peak
// week Monday", „Sophie drifting quietly". **Kein Modell hat sie
// erzeugt, keine Tabelle traegt sie.**
//
// `[read]` **Uebernommen, weil Tom den direkten Vergleich will** —
// eine leere 306-px-Spalte waere kein Vergleich. `[cmd]` **Jede
// Kachel traegt den Vermerk, woher sie stammt**, und die Spalte
// nennt es im Kopf.
//
// `[read]` **Was echt ist, steht daneben:** die Kennzahlen unten
// werden ueberschrieben, wo das Portal sie messen kann.

export type KontextErkenntnis = { v: string, t: string, b: string }

export type KontextBereich = {
  msg: string
  state: string
  actions: Array<[string, string]>
  insights: KontextErkenntnis[]
  details: Array<[string, string]>
}

export const DRAFT_KONTEXT: Record<string, KontextBereich> = {
  overview: {
    msg: 'Fourteen clients, five in the queue. Lukas is the only hard deadline — peak week Monday, protocol needs your signature.',
    state: 'alert',
    actions: [
      ['message', 'Open queue'],
      ['edit', 'Draft all'],
      ['calendar', 'Today'],
      ['brain', 'Ask Ops'],
    ],
    insights: [
      { v: 'warn', t: 'Lukas · peak week Monday', b: 'Protocol drafted and waiting. Sleep is 6.4 h against a 7.5 target, which matters more than the carbohydrate load this week.' },
      { v: 'warn', t: 'Sophie drifting quietly', b: 'Logging down 18 points over ten days, training untouched. Reads as admin fatigue, not disengagement.' },
      { v: 'pos', t: 'Marcus · 220 kg first time', b: 'Bar speed faster than his 212.5 attempt in June. Draft congratulation ready, two minutes.' },
    ],
    details: [
      ['Roster', '14 active'],
      ['Median compliance', '91 %'],
      ['Queue', '5 clients'],
      ['MRR', '€4,820'],
    ],
  },
  athletes: {
    msg: 'Eleven on track, two need a decision, one drifting. Elena is the only one still below level 2 autonomy.',
    state: 'idle',
    actions: [
      ['user', 'Full record'],
      ['message', 'Message all'],
      ['edit', 'Add note'],
      ['plus', 'Invite client'],
    ],
    insights: [
      { v: '', t: 'Autonomy distribution', b: 'Two at level 1–2, four at 3, eight at 4–5. Your average has climbed 0.4 levels in ninety days.' },
      { v: 'warn', t: 'Anna will not tell you', b: 'Four-week plateau, 91 % adherence, no complaint. The watcher noticed before she said anything.' },
      { v: 'pos', t: 'Niko · twelve weeks perfect', b: 'Longest adherence streak on the roster. Low-touch by design now.' },
    ],
    details: [
      ['Full access granted', '6 of 14'],
      ['Summary only', '7'],
      ['Training only', '1'],
      ['Pending onboarding', '2'],
    ],
  },
  checkins: {
    msg: 'Seven check-ins in, three answered. Two review workflows are half-finished from yesterday.',
    state: 'idle',
    actions: [
      ['message', 'Reply next'],
      ['workord', 'Resume review'],
      ['edit', 'Templates'],
      ['brain', 'Draft all'],
    ],
    insights: [
      { v: 'warn', t: 'Two reviews unfinished', b: 'Lukas prep review sits at step 4 of 6, Anna strength review at step 2 of 5. Both from yesterday.' },
      { v: '', t: 'Response time 3.2 h', b: 'Against a 4 h target. Your slowest day is Friday, average 6.1 h.' },
    ],
    details: [
      ['Received · 7d', '14'],
      ['Answered', '11'],
      ['Avg response', '3.2 h'],
      ['Overdue', '2'],
    ],
  },
  assist: {
    msg: 'Eighteen drafts this week, fifteen sent after your approval, five edited first. Clone live for six clients.',
    state: 'responding',
    actions: [
      ['check', 'Approve queue'],
      ['brain', 'Retrain clone'],
      ['settings', 'Per-client setup'],
      ['trend_up', 'Cost'],
    ],
    insights: [
      { v: '', t: 'Edit rate 28 %', b: 'Five of eighteen rewritten. Plan-expiry drafts are the worst offender — the template is wrong, not the rule.' },
      { v: 'warn', t: 'Clone weak under pushback', b: 'Fidelity 72 % when a client argues. That is why pushback sits outside its scope rather than merely flagged.' },
      { v: 'pos', t: '4.8 hours saved', b: 'Drafting, triage and routine reminders. Estimated, not measured.' },
    ],
    details: [
      ['Drafts · 7d', '18'],
      ['Auto-sent', '11'],
      ['Escalated', '3'],
      ['Cost · 30d', '$14.82'],
    ],
  },
  calendar: {
    msg: 'Eight events this week. Thursday is heavy — four check-ins and a call in the same afternoon.',
    state: 'idle',
    actions: [
      ['plus', 'New event'],
      ['calendar', 'Week view'],
      ['message', 'Confirm all'],
      ['brain', 'Rebalance'],
    ],
    insights: [
      { v: 'warn', t: 'Thursday overloaded', b: 'Four check-ins between 14:00 and 17:00 plus a consultation. Two could move to Wednesday without conflict.' },
      { v: '', t: 'Lukas peak week', b: 'Daily contact Monday through Saturday. Blocked in already.' },
    ],
    details: [
      ['This week', '8 events'],
      ['Check-ins', '5'],
      ['Calls', '2'],
      ['Deadlines', '1'],
    ],
  },
  plans: {
    msg: 'Four programmes running with auto-delivery. Two expire within a week and need renewal drafts.',
    state: 'idle',
    actions: [
      ['plus', 'New plan'],
      ['workord', 'Builder'],
      ['message', 'Renewals'],
      ['copy', 'Duplicate'],
    ],
    insights: [
      { v: 'warn', t: 'Two expiring', b: 'Marcus and Niko both end on the 22nd. Renewal drafts written but not sent.' },
      { v: 'pos', t: 'PPL template · 6 assigned', b: 'Highest-rated plan in your library at 4.9. Sold 18 times in the marketplace.' },
    ],
    details: [
      ['Templates', '6'],
      ['Programmes live', '4'],
      ['Assignments', '19'],
      ['Marketplace sales', '41'],
    ],
  },
  library: {
    msg: 'Six custom exercises, six recipes. Two exercises have no video, which is the most common client complaint.',
    state: 'idle',
    actions: [
      ['plus', 'New exercise'],
      ['camera', 'Add video'],
      ['nutrition', 'New recipe'],
      ['user', 'Assign'],
    ],
    insights: [
      { v: 'warn', t: 'Two exercises without video', b: 'Landmine press and Zercher squat. Both assigned to clients who have asked about form.' },
      { v: '', t: 'Most assigned', b: 'Nordic hamstring curl, on eleven of fourteen plans.' },
    ],
    details: [
      ['Own exercises', '6'],
      ['Own recipes', '6'],
      ['Platform library', '1,850'],
      ['Assignments', '34'],
    ],
  },
  alerts: {
    msg: 'Seven open. One critical: Sophie hit the three-strike overtraining rule this morning.',
    state: 'alert',
    actions: [
      ['alert', 'Open critical'],
      ['settings', 'Rule builder'],
      ['check', 'Resolve'],
      ['brain', 'Batch settings'],
    ],
    insights: [
      { v: 'neg', t: 'Sophie · critical', b: 'Recovery 58, sleep 5.8 h, RPE 8.5 for three consecutive days. Confidence 91 %, false-positive risk 4 %.' },
      { v: '', t: 'Forty fires, five reached you', b: 'Twelve PRs handled by automation, eight reminders sent alone, the rest deduplicated.' },
    ],
    details: [
      ['Critical', '1'],
      ['High', '2'],
      ['Medium', '3'],
      ['Info', '1'],
    ],
  },
  analytics: {
    msg: 'Retention 92 % against a 78 % benchmark. Calorie precision is the weakest dimension across the roster.',
    state: 'idle',
    actions: [
      ['trend_up', 'Performance'],
      ['layers', 'Patterns'],
      ['brain', 'Interventions'],
      ['download', 'Export'],
    ],
    insights: [
      { v: 'pos', t: 'Retention 14 points above benchmark', b: 'Ninety-day retention 92 %. Client LTV €4,280, referral rate 21 %.' },
      { v: 'warn', t: 'Friday is the weak day', b: 'Cohort adherence 78 % on Fridays against 88 % Monday. Consider lighter sessions there.' },
      { v: '', t: 'Tough love works on you', b: 'Effectiveness 94 % — your highest tone variant. Humour lands at 58 %.' },
    ],
    details: [
      ['Retention · 90d', '92 %'],
      ['Satisfaction', '4.8 ★'],
      ['Goal completion', '87 %'],
      ['Response time', '1.8 h'],
    ],
  },
  inbox: {
    msg: 'Twelve notifications, five unread. Nothing escalated overnight.',
    state: 'idle',
    actions: [
      ['check', 'Mark all read'],
      ['settings', 'Delivery rules'],
      ['bell', 'Push settings'],
      ['brain', 'Digest'],
    ],
    insights: [
      { v: '', t: 'Five unread', b: 'Three PR notifications, two check-in submissions. All non-urgent.' },
      { v: 'pos', t: 'Quiet overnight', b: 'No critical alerts between 22:00 and 06:00. Quiet hours held.' },
    ],
    details: [
      ['Unread', '5'],
      ['This week', '42'],
      ['Push sent', '8'],
      ['Quiet hours', '22:00–06:00'],
    ],
  },
  team: {
    msg: 'Five members, you plus two senior and two coaches. Audit trail clean, 1,420 entries this month.',
    state: 'idle',
    actions: [
      ['plus', 'Invite member'],
      ['shield', 'Permissions'],
      ['download', 'Export audit'],
      ['user', 'Reassign'],
    ],
    insights: [
      { v: '', t: 'Roster load uneven', b: 'You carry 14, Erik 8, Hanna 6, Paul 4, Carla 5. Yours is the heaviest by half.' },
      { v: 'pos', t: 'Audit clean', b: 'No permission escalations, no exports outside role scope.' },
    ],
    details: [
      ['Members', '5'],
      ['Head', '1'],
      ['Senior', '2'],
      ['Audit entries · 30d', '1,420'],
    ],
  },
}
