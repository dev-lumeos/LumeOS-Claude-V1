// Die Zahlen des Assistenten — aus der Vorlage, G-407.
// 
// ABGELESEN, NICHT ERFUNDEN. Quellen:
//   module-coach-clone.jsx            CLONE_*, PC_*, CD_*
//   module-coach-assistant-layers.jsx CVO_*, CM_*, CB_*, CBU_*, CW_*, CG_*
//   module-coach-ai-assistant.jsx     CAI_*
// 
// [read] KEINE dieser Zahlen ist gemessen. Es gibt keine Tabelle fuer
// den Assistenten — weder Entwuerfe noch Gedaechtnis noch Kosten.
// [cmd] Jede Kachel, die daraus baut, traegt den Attrappenvermerk.

/** `clone.jsx` · `CLONE_SOURCES` */
export const CLONE_SOURCES = [
    {
      id: "method",
      label: "Written method",
      n: "42 documents",
      pct: 100,
      desc: "Your periodisation approach, RPE philosophy, deload criteria, exercise selection logic",
      status: "ingested",
    },
    {
      id: "messages",
      label: "Message history",
      n: "1,240 messages",
      pct: 100,
      desc: "How you actually phrase things — with client consent, anonymised across the roster",
      status: "ingested",
    },
    {
      id: "decisions",
      label: "Plan decisions",
      n: "412 changes",
      pct: 100,
      desc: "Every volume change, deload call and exercise swap you have made, with its trigger",
      status: "ingested",
    },
    {
      id: "calls",
      label: "Call transcripts",
      n: "18 hours",
      pct: 64,
      desc: "Recorded consultations. Captures how you explain things out loud, which differs from writing",
      status: "processing",
    },
    {
      id: "corrections",
      label: "Your edits",
      n: "142 edits",
      pct: 100,
      desc: "Every time you rewrote a draft. The most valuable source — it shows what the clone got wrong",
      status: "continuous",
    },
  ] as const

/** `clone.jsx` · `CLONE_FIDELITY` */
export const CLONE_FIDELITY = [
    {
      dim: "Vocabulary",
      score: 91,
      note: "Word choice matches. It has learned you never write \u0027crushing it\u0027.",
    },
    {
      dim: "Sentence rhythm",
      score: 88,
      note: "Short declaratives, occasional long explanatory sentence. Close.",
    },
    {
      dim: "Structure",
      score: 94,
      note: "Number first, interpretation second, instruction last. Reliably reproduced.",
    },
    {
      dim: "Decision logic",
      score: 86,
      note: "Deload timing and volume calls align with your history in 86 % of test cases.",
    },
    {
      dim: "Tone under pressure",
      score: 72,
      note: "Weakest area. When a client pushes back, the clone softens more than you do.",
    },
    {
      dim: "Humour",
      score: 58,
      note: "You are dry and infrequent. The clone either misses it or overdoes it.",
    },
  ] as const

/** `clone.jsx` · `CLONE_SCOPE` */
export const CLONE_SCOPE = [
    {
      q: "Programme questions",
      ex: "\"Why three sets and not four?\"",
      allowed: true,
      note: "Answers from your written method",
    },
    {
      q: "Schedule and logistics",
      ex: "\"Can I move Thursday to Friday?\"",
      allowed: true,
      note: "Checks your calendar, proposes, confirms",
    },
    {
      q: "Technique cues",
      ex: "\"Where should my elbows be?\"",
      allowed: true,
      note: "From your cue library and past messages",
    },
    {
      q: "Encouragement after a PR",
      ex: "—",
      allowed: true,
      note: "Templated on how you have congratulated before",
    },
    {
      q: "Progression decisions",
      ex: "\"Should I go up in weight?\"",
      allowed: "draft",
      note: "Drafts an answer, holds for you",
    },
    {
      q: "Plan changes",
      ex: "\"Can we swap squats out?\"",
      allowed: "draft",
      note: "Never applied, only proposed",
    },
    {
      q: "Anything medical",
      ex: "\"My knee hurts, what is it?\"",
      allowed: false,
      note: "Routed to medical coach, clone stays silent",
    },
    {
      q: "Contract and payment",
      ex: "\"Can I pause my subscription?\"",
      allowed: false,
      note: "Goes to you directly",
    },
    {
      q: "Emotional or personal",
      ex: "\"I have been struggling lately\"",
      allowed: false,
      note: "Flagged for you within the hour, no clone reply",
    },
  ] as const

/** `clone.jsx` · `CLONE_LOG` */
export const CLONE_LOG = [
    {
      at: "today 08:14",
      client: "Marcus Weber",
      q: "is 220 too big a jump to repeat next week?",
      answer: "Not too big, but I want the pattern grooved before we add again. Hold at 220 for two more sessions — if the bar speed stays where it was yesterday we go up after that.",
      verdict: "accurate",
      edited: false,
    },
    {
      at: "yesterday 19:22",
      client: "Elena Schmidt",
      q: "why do I do the hack squat and not back squat?",
      answer: "Your left knee was flagging under bar position. Hack squat keeps the same quad stimulus with less demand on the joint angle that was bothering you. We revisit it when the knee has been quiet for six weeks.",
      verdict: "accurate",
      edited: false,
    },
    {
      at: "yesterday 14:08",
      client: "Anna Frey",
      q: "should I add cardio?",
      answer: "Not yet — let us see what the added volume does first. One change at a time.",
      verdict: "accurate",
      edited: true,
      editNote: "You added: \u0027and tell me if the recovery dips\u0027",
    },
    {
      at: "2 days ago",
      client: "Sophie Klein",
      q: "I have been really down this week, is it worth training?",
      answer: "—",
      verdict: "escalated",
      edited: false,
      editNote: "Emotional content · clone stayed silent, flagged to you in 4 minutes",
    },
  ] as const

/** `clone.jsx` · `PC_CLIENTS` */
export const PC_CLIENTS = [
    {
      id: "c1",
      name: "Lukas Bauer",
      av: "LB",
      autonomy: 2,
      clone: false,
      drafts: true,
      auto: false,
      tone: "direct",
      watch: "all",
      note: "Contest prep. Everything goes through you until the show.",
    },
    {
      id: "c2",
      name: "Sophie Klein",
      av: "SK",
      autonomy: 4,
      clone: true,
      drafts: true,
      auto: true,
      tone: "soft",
      watch: "adherence",
      note: "Responds better to fewer, shorter touches. Clone handles logistics.",
    },
    {
      id: "c3",
      name: "Marcus Weber",
      av: "MW",
      autonomy: 5,
      clone: true,
      drafts: true,
      auto: true,
      tone: "direct",
      watch: "minimal",
      note: "Self-sufficient. Needs braking more than pushing.",
    },
    {
      id: "c4",
      name: "Elena Schmidt",
      av: "ES",
      autonomy: 1,
      clone: false,
      drafts: true,
      auto: false,
      tone: "explanatory",
      watch: "all",
      note: "New to structured training. Every message from you personally.",
    },
    {
      id: "c5",
      name: "Anna Frey",
      av: "AF",
      autonomy: 3,
      clone: true,
      drafts: true,
      auto: true,
      tone: "analytical",
      watch: "progression",
      note: "Will not report problems. Watcher does the noticing.",
    },
    {
      id: "c6",
      name: "Niko Brandt",
      av: "NB",
      autonomy: 4,
      clone: true,
      drafts: true,
      auto: true,
      tone: "direct",
      watch: "minimal",
      note: "Twelve weeks at full adherence. Low touch.",
    },
    {
      id: "c7",
      name: "Jonas Becker",
      av: "JB",
      autonomy: 4,
      clone: true,
      drafts: true,
      auto: true,
      tone: "analytical",
      watch: "load",
      note: "Marathon block. Watch weekly volume, not adherence.",
    },
    {
      id: "c8",
      name: "Mira Stahl",
      av: "MS",
      autonomy: 2,
      clone: false,
      drafts: true,
      auto: false,
      tone: "soft",
      watch: "all",
      note: "Rebuilding confidence after an injury layoff.",
    },
  ] as const

/** `clone.jsx` · `PC_LADDER` */
export const PC_LADDER = [
    {
      n: 1,
      label: "You only",
      desc: "Assistant prepares context. Nothing is drafted, nothing is sent.",
    },
    { n: 2, label: "Draft only", desc: "Drafts everything, sends nothing. You read every word." },
    {
      n: 3,
      label: "Routine auto",
      desc: "Reminders and confirmations go out alone. Substance still drafts.",
    },
    {
      n: 4,
      label: "Clone active",
      desc: "Clone answers routine questions in your voice, labelled as AI.",
    },
    {
      n: 5,
      label: "Full delegate",
      desc: "Clone handles all routine contact. You see a summary, not each message.",
    },
  ] as const

/** `clone.jsx` · `CD_DECISIONS` */
export const CD_DECISIONS = [
    {
      at: "09:12",
      rule: "queue_priority",
      type: "ordering",
      conf: 0.91,
      short: "Lukas placed above Sophie in today\u0027s queue",
      detail: "Lukas has an external deadline on Monday; Sophie\u0027s issue degrades gradually. Ordering by irreversibility rather than by severity.",
      data: "lukas.days_out=7 · sophie.adherence_delta=-18pp · sophie.training=unaffected",
    },
    {
      at: "09:14",
      rule: "draft_length",
      type: "drafting",
      conf: 0.84,
      short: "Sophie\u0027s draft kept to three sentences",
      detail: "Her reply rate falls sharply above four sentences. Shorter message chosen despite the topic warranting more.",
      data: "sophie.reply_rate_short=0.78 · reply_rate_long=0.31",
    },
    {
      at: "08:02",
      rule: "clone_scope",
      type: "escalation",
      conf: 0.96,
      short: "Clone withheld on Sophie\u0027s emotional message",
      detail: "Content matched the personal-distress pattern. Clone stayed silent and flagged to you rather than attempting a reply.",
      data: "sentiment=-0.62 · pattern=personal_distress · scope=refuse",
    },
    {
      at: "yesterday",
      rule: "no_message",
      type: "silence",
      conf: 0.77,
      short: "No fourth message to Marcus",
      detail: "Three touches already that day. A streak congratulation did not justify another interruption.",
      data: "marcus.touches_today=3 · threshold=3 · value=low",
    },
  ] as const

/** `assistant-layers.jsx` · `CVO_NOTES` */
export const CVO_NOTES = [
    {
      at: "today 11:42",
      client: "Marcus Weber",
      dur: "0:38",
      state: "filed",
      raw: "Marcus hit two twenty clean, bar speed was good on the last rep, hold him here two more sessions before we go up, also his left shoulder was sitting a bit high on the setup, mention it next time",
      parsed: ["PR logged · deadlift 220 kg", "Progression: hold 2 sessions", "Cue for next session: left shoulder position at setup"],
    },
    {
      at: "today 10:15",
      client: "Sophie Klein",
      dur: "0:22",
      state: "filed",
      raw: "Sophie called, work trip next week again, wants to keep training but knows the food logging will slip, told her simplified targets are fine",
      parsed: ["Travel: next week", "Agreed: simplified nutrition targets during travel"],
    },
    {
      at: "yesterday 18:04",
      client: "Lukas Bauer",
      dur: "1:12",
      state: "filed",
      raw: "Lukas peak week planning, he looks flatter than I\u0027d like at seven days out, might pull the depletion back by a day, sleep is the concern not the carbs",
      parsed: ["Peak week: consider shortening depletion by one day", "Concern: sleep, not carbohydrate load", "Visual: flatter than expected at 7 days out"],
    },
    {
      at: "yesterday 09:31",
      client: "—",
      dur: "0:16",
      state: "unfiled",
      raw: "remember to restructure the beginner template, the week three jump is too aggressive for most people",
      parsed: ["Template note: Beginner Linear · week 3 progression too steep"],
    },
  ] as const

/** `assistant-layers.jsx` · `CM_METHOD` */
export const CM_METHOD = [
    {
      cat: "Programming",
      conf: 0.94,
      uses: 142,
      txt: "RPE-based loading over percentage-based. You have never assigned a percentage-of-1RM week.",
    },
    {
      cat: "Programming",
      conf: 0.91,
      uses: 88,
      txt: "Deload at week five of a mesocycle, or earlier if RPE drifts up three sessions running.",
    },
    {
      cat: "Programming",
      conf: 0.87,
      uses: 64,
      txt: "One variable per adjustment. You do not change volume and intensity in the same week.",
    },
    {
      cat: "Communication",
      conf: 0.96,
      uses: 210,
      txt: "You lead with the number, then the interpretation. Never the other way around.",
    },
    {
      cat: "Communication",
      conf: 0.89,
      uses: 96,
      txt: "Bad news gets stated plainly in the first sentence. No cushioning preamble.",
    },
    {
      cat: "Communication",
      conf: 0.82,
      uses: 44,
      txt: "You rarely use exclamation marks. Two in 1,240 messages.",
    },
    {
      cat: "Decision",
      conf: 0.93,
      uses: 38,
      txt: "Plateau below four weeks: hold. Four weeks or more with good adherence: change the programme, not the effort.",
    },
    {
      cat: "Decision",
      conf: 0.9,
      uses: 22,
      txt: "Any pain report stops the exercise that day. No \u0027work around it\u0027.",
    },
    {
      cat: "Decision",
      conf: 0.78,
      uses: 14,
      txt: "You escalate to medical rather than adjusting, whenever a symptom is new.",
    },
  ] as const

/** `assistant-layers.jsx` · `CM_CLIENTS` */
export const CM_CLIENTS = [
    {
      c: "Lukas Bauer",
      n: 34,
      top: "Responds to detail. Wants the reasoning, not just the instruction.",
    },
    {
      c: "Sophie Klein",
      n: 21,
      top: "Goes quiet when overwhelmed rather than saying so. Shorter messages work.",
    },
    { c: "Marcus Weber", n: 28, top: "Self-motivated. Needs braking more often than pushing." },
    { c: "Elena Schmidt", n: 12, top: "New to structured training. Explain the why every time." },
    {
      c: "Anna Frey",
      n: 18,
      top: "High adherence, low complaint rate. Will not tell you when something is wrong.",
    },
  ] as const

/** `assistant-layers.jsx` · `CB_BRIEFS` */
export const CB_BRIEFS = [
    {
      id: "morning",
      time: "07:00",
      days: "Mon–Fri",
      push: true,
      scope: "Roster overview and today\u0027s queue",
      last: "today 07:00",
    },
    {
      id: "midday",
      time: "13:00",
      days: "Mon–Fri",
      push: false,
      scope: "New check-ins since morning",
      last: "today 13:00",
    },
    {
      id: "evening",
      time: "19:00",
      days: "Mon–Fri",
      push: false,
      scope: "Unanswered messages, tomorrow\u0027s calendar",
      last: "yesterday 19:00",
    },
    {
      id: "weekly",
      time: "18:00",
      days: "Sun",
      push: true,
      scope: "Full digest and next week\u0027s load",
      last: "Sun 18:00",
    },
  ] as const

/** `assistant-layers.jsx` · `CBU_INTENTS` */
export const CBU_INTENTS = [
    {
      intent: "schedule_checkin",
      ex: "\"book Sophie for Thursday 10am\"",
      conf: 0.93,
      flow: "immediate",
      n: 18,
    },
    {
      intent: "assign_plan",
      ex: "\"put Anna on the upper-lower template\"",
      conf: 0.88,
      flow: "preview",
      n: 11,
    },
    {
      intent: "add_note",
      ex: "\"note for Lukas: shoulder position at setup\"",
      conf: 0.96,
      flow: "immediate",
      n: 42,
    },
    {
      intent: "send_message",
      ex: "\"tell Marcus to hold at 220 for two sessions\"",
      conf: 0.84,
      flow: "draft",
      n: 26,
    },
    {
      intent: "adjust_volume",
      ex: "\"add a set to Anna\u0027s bench and row\"",
      conf: 0.79,
      flow: "preview",
      n: 7,
    },
    { intent: "flag_client", ex: "\"watch Elena this week\"", conf: 0.91, flow: "immediate", n: 9 },
    {
      intent: "export_report",
      ex: "\"send Lukas his month summary\"",
      conf: 0.86,
      flow: "preview",
      n: 4,
    },
  ] as const

/** `assistant-layers.jsx` · `CW_RULES` */
export const CW_RULES = [
    {
      id: "adherence_drop",
      level: "warning",
      cond: "adherence falls ≥ 15 pp over 7 days",
      fired: 6,
      muted: false,
      clients: 14,
    },
    {
      id: "checkin_overdue",
      level: "info",
      cond: "check-in ≥ 3 days late",
      fired: 8,
      muted: false,
      clients: 14,
    },
    {
      id: "plateau_detected",
      level: "warning",
      cond: "no progression ≥ 4 weeks with adherence > 85 %",
      fired: 3,
      muted: false,
      clients: 11,
    },
    {
      id: "overtraining_3strike",
      level: "critical",
      cond: "recovery < 65 + sleep < 6 h + RPE > 8, three days",
      fired: 2,
      muted: false,
      clients: 11,
    },
    {
      id: "silence_pattern",
      level: "warning",
      cond: "no client message ≥ 14 days",
      fired: 4,
      muted: false,
      clients: 14,
    },
    {
      id: "plan_expiry",
      level: "info",
      cond: "programme ends within 7 days",
      fired: 4,
      muted: false,
      clients: 9,
    },
    {
      id: "pr_logged",
      level: "info",
      cond: "new personal record",
      fired: 12,
      muted: false,
      clients: 14,
    },
    {
      id: "weight_rapid",
      level: "warning",
      cond: "± 2 % bodyweight within 7 days",
      fired: 1,
      muted: true,
      clients: 6,
    },
  ] as const

/** `assistant-layers.jsx` · `CG_LOG` */
export const CG_LOG = [
    {
      at: "3 days ago",
      what: "Draft mentioned adjusting a client\u0027s blood pressure medication timing",
      action: "blocked",
      out: "Rewritten without the medication reference, medical coach flagged",
    },
    {
      at: "6 days ago",
      what: "Draft interpreted a client\u0027s cortisol result",
      action: "blocked",
      out: "Replaced with a referral to the client\u0027s physician",
    },
    {
      at: "1 week ago",
      what: "Draft used a guilt framing about a missed week",
      action: "rewritten",
      out: "Reframed as a factual observation with no implied judgement",
    },
    {
      at: "2 weeks ago",
      action: "passed",
      what: "Draft cited a study on protein timing",
      out: "Allowed · evidence card attached, claim not made in the message body",
    },
  ] as const

/** `ai-assistant.jsx` · `CAI_QUEUE` */
export const CAI_QUEUE = [
    {
      id: "q1",
      client: "Lukas Bauer",
      avatar: "LB",
      why: "Prep review due · 7 days out",
      urgency: "high",
      prep: "Weight −0.4 kg on plan, strength held at 96 %, sleep 6.8 h and falling. Peak week starts Monday.",
      draft: "Lukas — numbers look right for this stage. Strength retention at 96 % is better than most people manage at seven days out. Sleep is the one thing I want tighter: 6.8 h average this week against your 7.5 target. Peak week starts Monday and water manipulation on short sleep is where people get it wrong. Lights out by 22:30 from tonight.",
      est: "8 min",
      conf: 0.88,
    },
    {
      id: "q2",
      client: "Sophie Klein",
      avatar: "SK",
      why: "Adherence dropped 18 pp",
      urgency: "high",
      prep: "Nutrition logging fell from 94 % to 76 % over ten days. Training unaffected. No message from her in 12 days.",
      draft: "Sophie — training has been solid, so this is not a motivation issue. Logging dropped off around the 3rd, which lines up with your work trip. Do you want me to switch you to a simplified target while things are busy? Three numbers instead of seven.",
      est: "5 min",
      conf: 0.82,
    },
    {
      id: "q3",
      client: "Marcus Weber",
      avatar: "MW",
      why: "PR logged · deadlift 220 kg",
      urgency: "low",
      prep: "First 220 kg pull. Previous best 212.5 kg in June. Bar speed on the last rep suggests more in the tank.",
      draft: "220. That is a 7.5 kg jump from June and the bar moved faster than the 212.5 did. Nice work. I am holding you at this for two more sessions before we go up — the jump was big enough that I want the pattern grooved first.",
      est: "2 min",
      conf: 0.94,
    },
    {
      id: "q4",
      client: "Elena Schmidt",
      avatar: "ES",
      why: "Check-in overdue · 4 days",
      urgency: "medium",
      prep: "Weekly check-in not submitted. Last three were on time. Training logged normally, so she is still active.",
      draft: "Elena — no check-in from you this week, but I can see you have been training. Everything alright? If the form is the friction, tell me and we can do it as a two-line message instead.",
      est: "3 min",
      conf: 0.76,
    },
    {
      id: "q5",
      client: "Anna Frey",
      avatar: "AF",
      why: "Plateau · 4 weeks no progression",
      urgency: "medium",
      prep: "Bench and row both static since 12 Aug. Adherence 91 %, recovery normal. Volume unchanged for six weeks.",
      draft: "Anna — four weeks with no movement on bench or row, and it is not effort. Adherence is 91 % and recovery is fine. The volume has been the same for six weeks, which is long enough that your body has stopped finding it hard. I am adding a set to both and dropping the accessory work to compensate.",
      est: "6 min",
      conf: 0.85,
    },
  ] as const

/** `ai-assistant.jsx` · `CAI_AUTOMATIONS` */
export const CAI_AUTOMATIONS = [
    {
      id: "a1",
      name: "PR acknowledgement",
      trigger: "New PR logged",
      action: "Draft congratulation, hold for approval",
      mode: "draft",
      fired: 12,
      approved: 12,
      edited: 3,
    },
    {
      id: "a2",
      name: "Check-in nudge",
      trigger: "Check-in 3 days overdue",
      action: "Send reminder directly",
      mode: "auto",
      fired: 8,
      approved: 8,
      edited: 0,
    },
    {
      id: "a3",
      name: "Adherence drop flag",
      trigger: "Adherence falls 15 pp over 7 days",
      action: "Add to triage queue with context",
      mode: "queue",
      fired: 6,
      approved: 6,
      edited: 0,
    },
    {
      id: "a4",
      name: "Weekly digest",
      trigger: "Sunday 18:00",
      action: "Compile roster summary",
      mode: "auto",
      fired: 24,
      approved: 24,
      edited: 0,
    },
    {
      id: "a5",
      name: "Plan expiry warning",
      trigger: "Program ends in 7 days",
      action: "Draft renewal message",
      mode: "draft",
      fired: 4,
      approved: 3,
      edited: 2,
    },
    {
      id: "a6",
      name: "Overtraining escalation",
      trigger: "3-strike rule fires",
      action: "Alert coach immediately, no draft",
      mode: "alert",
      fired: 2,
      approved: 2,
      edited: 0,
    },
    {
      id: "a7",
      name: "New client welcome",
      trigger: "Onboarding step 3 complete",
      action: "Send intake form and intro",
      mode: "auto",
      fired: 3,
      approved: 3,
      edited: 0,
    },
  ] as const

/** `ai-assistant.jsx` · `CAI_DIGEST` */
export const CAI_DIGEST = {
    period: "Week of 9–15 September",
    headline: "Fourteen clients, eleven on track. Two need a decision from you this week, one is drifting quietly.",
    sections: [
      {
        t: "Needs your decision",
        tone: "warn",
        items: ["Lukas Bauer — peak week starts Monday. Protocol drafted, waiting on your sign-off.", "Anna Frey — four-week plateau. I have drafted a volume change but will not send a plan edit without you."],
      },
      {
        t: "Drifting",
        tone: "warn",
        items: ["Sophie Klein — logging down 18 points since her work trip. Training unaffected, so she has not disengaged, just deprioritised the admin."],
      },
      {
        t: "Going well",
        tone: "pos",
        items: ["Marcus Weber — 220 kg deadlift, first time. Bar speed suggests more available.", "Niko Brandt — twelve weeks at 100 % adherence. Longest streak on your roster.", "Jonas Becker — marathon block on schedule, 62 km last week without a recovery dip."],
      },
      {
        t: "Handled without you",
        tone: "",
        items: ["Eight check-in reminders sent, six answered within a day.", "Three PR acknowledgements drafted and approved by you on Tuesday.", "Two new clients moved through onboarding steps 1 to 3."],
      },
    ],
    stats: [
      ["Messages drafted", 18],
      ["Sent after your approval", 15],
      ["Edited before sending", 5],
      ["Sent automatically", 11],
      ["Escalated to you", 3],
    ],
  } as const

/** `ai-assistant.jsx` · `CAI_DELEGATION` */
export const CAI_DELEGATION = [
    {
      cap: "Draft messages",
      level: "always",
      note: "Nothing leaves without you reading it, unless a rule says otherwise",
    },
    {
      cap: "Send routine reminders",
      level: "auto",
      note: "Check-in nudges, form reminders, session confirmations",
    },
    {
      cap: "Answer factual questions",
      level: "auto",
      note: "Programme details, schedule, what a cue means",
    },
    {
      cap: "Flag anomalies",
      level: "auto",
      note: "Adherence drops, missed sessions, unusual recovery patterns",
    },
    { cap: "Propose plan changes", level: "draft", note: "Written up for you, never applied" },
    {
      cap: "Apply plan changes",
      level: "never",
      note: "Yours alone. The assistant cannot write to a client\u0027s plan",
    },
    {
      cap: "Answer medical questions",
      level: "never",
      note: "Routed to the client\u0027s medical coach, not answered",
    },
    { cap: "Change client permissions", level: "never", note: "Only the client can" },
    {
      cap: "Speak as you",
      level: "off",
      note: "Clone is available on Elite but is currently switched off",
    },
  ] as const

/** `ai-assistant.jsx` · `CAI_CHAT` */
export const CAI_CHAT = [
    { from: "coach", at: "09:12", body: "who needs me most today?" },
    {
      from: "ai",
      at: "09:12",
      body: "Two. Lukas is seven days out and his peak week protocol needs signing off before Monday — that is the hard deadline. Sophie\u0027s logging dropped 18 points over ten days, but her training is untouched, so it reads as admin fatigue rather than disengagement. I would take Lukas first and give Sophie a short message rather than a long one.",
    },
    { from: "coach", at: "09:14", body: "draft sophie\u0027s" },
    {
      from: "ai",
      at: "09:14",
      body: "Written and in the queue. I kept it to three sentences and offered the simplified target, since the pattern started with her work trip. Approve, edit or discard when you are ready.",
    },
    { from: "coach", at: "09:15", body: "anyone i\u0027m missing?" },
    {
      from: "ai",
      at: "09:15",
      body: "Anna Frey. Four weeks with no progression on bench or row, adherence 91 %, recovery normal, volume unchanged for six weeks. She has not complained, which is why she is not louder in the queue — but the plateau is real and it is a programming issue, not an effort one.",
    },
  ] as const
