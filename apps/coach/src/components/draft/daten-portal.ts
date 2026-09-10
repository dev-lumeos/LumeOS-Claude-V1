// Die Zahlen der uebrigen Draft-Kacheln — aus der Vorlage, G-407.
// 
// ABGELESEN, NICHT ERFUNDEN. Quellen:
//   module-coach-portal-tools.jsx     CAL_*, CN_*, LIB_*, NC_*
//   module-coach-portal-detail.jsx    CD_PERMS, CD_SUMMARY_ONLY
//   module-coach-portal-workflows.jsx PORTAL_WF_DEFS, PEAK_WEEK, PORTAL_ONBOARD
//   module-coach-client-record.jsx    FCR_*
//   module-coach-programs.jsx         PROGRAMS, DELIVERY_*, ASSIGNMENT
// 
// [cmd] ASSIGNMENT rechnet in der Vorlage mit `new Date` — hier steht
// das ERGEBNIS, damit die Zahlen nicht bei jedem Aufruf wandern.

/** `portal-tools.jsx` · `CAL_EVENTS` */
export const CAL_EVENTS = {
    "2026-09-07": [
      { t: "09:00", who: "Lukas Bauer", kind: "checkin", label: "Weekly check-in" },
    ],
    "2026-09-08": [
      { t: "07:30", who: "Marcus Weber", kind: "session", label: "Session review · Legs" },
      { t: "16:00", who: "Elena Schmidt", kind: "call", label: "Onboarding call" },
    ],
    "2026-09-09": [
      { t: "10:00", who: "Sophie Klein", kind: "checkin", label: "Weekly check-in" },
      { t: "14:00", who: "Roster", kind: "deadline", label: "Block 3 ends · reassign" },
    ],
    "2026-09-10": [
      { t: "08:00", who: "Lukas Bauer", kind: "prep", label: "Prep review · 6 weeks out" },
      { t: "11:00", who: "Niko Brandt", kind: "checkin", label: "Bi-weekly check-in" },
      { t: "17:30", who: "Daniel Vogel", kind: "call", label: "Plateau discussion" },
    ],
    "2026-09-11": [
      { t: "09:30", who: "Anna Frey", kind: "checkin", label: "Weekly check-in" },
    ],
    "2026-09-12": [
      { t: "10:00", who: "Mira Stahl", kind: "session", label: "Form review · video" },
    ],
    "2026-09-14": [
      { t: "09:00", who: "Lukas Bauer", kind: "checkin", label: "Weekly check-in" },
      { t: "13:00", who: "Carla Roth", kind: "call", label: "Plan handover" },
    ],
    "2026-09-15": [
      { t: "08:00", who: "Roster", kind: "deadline", label: "Monthly invoices due" },
    ],
    "2026-09-17": [
      { t: "08:00", who: "Lukas Bauer", kind: "prep", label: "Prep review · 5 weeks out" },
    ],
  } as const

/** `portal-tools.jsx` · `CAL_KIND` */
export const CAL_KIND = {
    checkin: { c: "var(--acc-coach)", l: "Check-in" },
    session: { c: "var(--acc-train)", l: "Session" },
    call: { c: "var(--acc-recov)", l: "Call" },
    prep: { c: "var(--acc-goals)", l: "Prep review" },
    deadline: { c: "var(--warn)", l: "Deadline" },
  } as const

/** `portal-tools.jsx` · `CN_NOTES` */
export const CN_NOTES = [
    {
      id: "n1",
      who: "Lukas Bauer",
      at: "2026-09-09 18:22",
      tag: "prep",
      pinned: true,
      body: "Water retention up 1.2 kg after Saturday\u0027s meal out. Not fat gain — sodium. Told him to hold the plan and re-weigh Wednesday.",
    },
    {
      id: "n2",
      who: "Sophie Klein",
      at: "2026-09-08 11:04",
      tag: "injury",
      pinned: true,
      body: "Left knee discomfort on the descent, not the drive. Swapped back squat for hack squat this block. Physio referral if it persists past two weeks.",
    },
    {
      id: "n3",
      who: "Marcus Weber",
      at: "2026-09-07 20:40",
      tag: "form",
      pinned: false,
      body: "Deadlift video: hips rise before the bar on set 4. Cued \u0027chest up, push the floor away\u0027 — set 5 was clean. Watch again next session.",
    },
    {
      id: "n4",
      who: "Elena Schmidt",
      at: "2026-09-06 09:15",
      tag: "adherence",
      pinned: false,
      body: "Third missed Friday in a row. She works late Thursdays. Moving the session to Saturday morning from next week.",
    },
    {
      id: "n5",
      who: "Daniel Vogel",
      at: "2026-09-04 16:30",
      tag: "plateau",
      pinned: false,
      body: "Bench stalled at 105 for three weeks. Volume is fine, intensity too low. Adding a heavy triple on the top set.",
    },
    {
      id: "n6",
      who: "Niko Brandt",
      at: "2026-09-03 08:12",
      tag: "nutrition",
      pinned: false,
      body: "Protein consistently 30 g under target. Not a compliance issue — his portion estimate is off. Sent him a scale and a reference sheet.",
    },
    {
      id: "n7",
      who: "Anna Frey",
      at: "2026-09-01 19:50",
      tag: "mindset",
      pinned: false,
      body: "Comparing herself to other clients on the leaderboard. Turned the leaderboard off for her account and reframed the goal around her own baseline.",
    },
  ] as const

/** `portal-tools.jsx` · `CN_TAGS` */
export const CN_TAGS = {
    prep: "var(--acc-goals)",
    injury: "var(--neg)",
    form: "var(--acc-train)",
    adherence: "var(--warn)",
    plateau: "var(--acc-mkt)",
    nutrition: "var(--acc-nutri)",
    mindset: "var(--acc-buddy)",
  } as const

/** `portal-tools.jsx` · `LIB_EX` */
export const LIB_EX = [
    {
      id: "CX-01",
      name: "Paused Zercher Squat · 3ct",
      cat: "Compound",
      muscles: ["Quads", "Glutes", "Core"],
      equip: "Barbell",
      video: true,
      assigned: 6,
      note: "Front-loaded, forces upright torso. Good for clients who fold forward.",
    },
    {
      id: "CX-02",
      name: "Deficit Snatch-Grip RDL",
      cat: "Compound",
      muscles: ["Hamstrings", "Upper back"],
      equip: "Barbell",
      video: true,
      assigned: 4,
      note: "Longer ROM, big upper-back demand. Cap at RPE 8.",
    },
    {
      id: "CX-03",
      name: "Half-Kneeling Cable Press",
      cat: "Compound",
      muscles: ["Chest", "Front delt", "Core"],
      equip: "Cable",
      video: false,
      assigned: 9,
      note: "Anti-rotation press. My default shoulder-friendly horizontal push.",
    },
    {
      id: "CX-04",
      name: "Seated DB Powell Raise",
      cat: "Isolation",
      muscles: ["Rear delt", "Rotator cuff"],
      equip: "Dumbbell",
      video: true,
      assigned: 12,
      note: "Cuff health for everyone benching above 100 kg.",
    },
    {
      id: "CX-05",
      name: "Slant-Board Reverse Nordic",
      cat: "Isolation",
      muscles: ["Quads", "Hip flexors"],
      equip: "Bodyweight",
      video: true,
      assigned: 7,
      note: "Knee-friendly quad lengthening. Two sets, no failure.",
    },
    {
      id: "CX-06",
      name: "Landmine Meadows Row",
      cat: "Compound",
      muscles: ["Lats", "Rear delt", "Biceps"],
      equip: "Barbell",
      video: false,
      assigned: 5,
      note: "Unilateral, low axial load. Fits deload weeks.",
    },
  ] as const

/** `portal-tools.jsx` · `LIB_MEAL` */
export const LIB_MEAL = [
    {
      id: "CM-01",
      name: "High-protein overnight oats",
      kcal: 520,
      p: 42,
      c: 58,
      f: 12,
      tag: "Breakfast",
      assigned: 11,
      note: "Skyr base, whey, oats, berries. Prep the night before, zero morning friction.",
    },
    {
      id: "CM-02",
      name: "Chicken · rice · greens bowl",
      kcal: 680,
      p: 58,
      c: 72,
      f: 14,
      tag: "Lunch",
      assigned: 14,
      note: "The default. Scales cleanly from cut to bulk by adjusting rice only.",
    },
    {
      id: "CM-03",
      name: "Salmon, potato, asparagus",
      kcal: 620,
      p: 44,
      c: 48,
      f: 26,
      tag: "Dinner",
      assigned: 8,
      note: "Omega-3 anchor. Twice weekly for anyone not supplementing fish oil.",
    },
    {
      id: "CM-04",
      name: "Pre-workout rice cakes + whey",
      kcal: 340,
      p: 28,
      c: 52,
      f: 3,
      tag: "Pre",
      assigned: 12,
      note: "60–90 min before. Low fat and fibre so it clears fast.",
    },
    {
      id: "CM-05",
      name: "Cottage cheese + berries",
      kcal: 240,
      p: 28,
      c: 18,
      f: 6,
      tag: "Snack",
      assigned: 9,
      note: "Casein before bed. Keeps overnight amino availability up.",
    },
    {
      id: "CM-06",
      name: "Lentil bolognese",
      kcal: 560,
      p: 32,
      c: 78,
      f: 12,
      tag: "Dinner",
      assigned: 4,
      note: "Plant-based option. Pair with a whey shake to close the leucine gap.",
    },
  ] as const

/** `portal-tools.jsx` · `NC_ITEMS` */
export const NC_ITEMS = [
    {
      id: "N-01",
      kind: "alert",
      at: "12 min ago",
      who: "Sophie Klein",
      title: "Overtraining risk · critical",
      body: "Third consecutive day of recovery below 60 with RPE above 8.5.",
      unread: true,
    },
    {
      id: "N-02",
      kind: "message",
      at: "38 min ago",
      who: "Lukas Bauer",
      title: "New message",
      body: "\"Weight is up 1.2 kg since Saturday — should I worry?\"",
      unread: true,
    },
    {
      id: "N-03",
      kind: "checkin",
      at: "1 h ago",
      who: "Marcus Weber",
      title: "Check-in submitted",
      body: "Weekly form complete · adherence 96 % · two open questions.",
      unread: true,
    },
    {
      id: "N-04",
      kind: "system",
      at: "2 h ago",
      who: "Platform",
      title: "Program delivered",
      body: "Week 4 of Powerbuilding 12 sent to 6 clients automatically.",
      unread: true,
    },
    {
      id: "N-05",
      kind: "alert",
      at: "4 h ago",
      who: "Elena Schmidt",
      title: "Adherence drop",
      body: "Nutrition adherence fell 20 points over the last 7 days.",
      unread: false,
    },
    {
      id: "N-06",
      kind: "message",
      at: "yesterday",
      who: "Niko Brandt",
      title: "New message",
      body: "\"Sent the deadlift video from today\u0027s session.\"",
      unread: false,
    },
    {
      id: "N-07",
      kind: "billing",
      at: "yesterday",
      who: "Platform",
      title: "Payment received",
      body: "€180 · Lukas Bauer · September retainer.",
      unread: false,
    },
    {
      id: "N-08",
      kind: "checkin",
      at: "2 days ago",
      who: "Anna Frey",
      title: "Check-in overdue",
      body: "No submission for 9 days. Two automated reminders sent.",
      unread: false,
    },
    {
      id: "N-09",
      kind: "system",
      at: "3 days ago",
      who: "Platform",
      title: "Consent expiring",
      body: "Elena Schmidt\u0027s data access expires in 90 days.",
      unread: false,
    },
  ] as const

/** `portal-tools.jsx` · `NC_KIND` */
export const NC_KIND = {
    alert: { c: "var(--neg)", i: "alert", l: "Alert" },
    message: { c: "var(--acc-coach)", i: "message", l: "Message" },
    checkin: { c: "var(--acc-recov)", i: "check", l: "Check-in" },
    system: { c: "var(--fg-dim)", i: "settings", l: "System" },
    billing: { c: "var(--acc-mkt)", i: "marketplace", l: "Billing" },
  } as const

/** `portal-detail.jsx` · `CD_PERMS` */
export const CD_PERMS = {
    training: "full",
    nutrition: "full",
    recovery: "summary",
    supplements: "summary",
    medical: "none",
    goals: "full",
  } as const

/** `portal-workflows.jsx` · `PORTAL_WF_DEFS` */
export const PORTAL_WF_DEFS = [
    {
      id: "prep",
      name: "Contest Prep review",
      accent: "var(--acc-goals)",
      icon: "goals",
      cadence: "weekly · Mondays",
      duration: "12–20 min",
      when: "Client in contest_prep phase, weeks-out ≤ 20",
      steps: [
        {
          n: 1,
          t: "Weight & rate check",
          d: "Compare 7-day average against the prescribed weekly loss rate. Flag if outside 0.5–1.0 % BW.",
          fields: ["7d avg weight", "Δ vs last week", "target rate", "cumulative loss"],
        },
        {
          n: 2,
          t: "Photo comparison",
          d: "Side-by-side with last week and with the baseline. Look for regional changes, not scale movement.",
          fields: ["front relaxed", "side", "back", "most-muscular"],
        },
        {
          n: 3,
          t: "Performance check",
          d: "Strength retention is the guard rail. More than 10 % off baseline on main lifts means the deficit is too aggressive.",
          fields: ["bench e1RM", "squat e1RM", "deadlift e1RM", "% vs baseline"],
        },
        {
          n: 4,
          t: "Recovery & subjective",
          d: "Sleep, HRV, hunger, mood, libido. Two or more red flags trigger a diet break discussion.",
          fields: ["sleep 7d", "HRV trend", "hunger 1–10", "mood 1–10"],
        },
        {
          n: 5,
          t: "Adjustment decision",
          d: "Calories, cardio, refeed placement. One variable at a time.",
          fields: ["kcal change", "cardio change", "refeed day", "reasoning"],
        },
        {
          n: 6,
          t: "Peak week check",
          d: "Only inside 10 days out. Opens the peak-week protocol.",
          fields: ["days out", "protocol status"],
        },
      ],
    },
    {
      id: "nutrition",
      name: "Nutrition review",
      accent: "var(--acc-nutri)",
      icon: "nutrition",
      cadence: "bi-weekly",
      duration: "8–12 min",
      when: "Any client with an active macro target",
      steps: [
        {
          n: 1,
          t: "Adherence",
          d: "Logged days, protein hit-rate, calorie variance. Below 80 % logging makes the rest unreliable.",
          fields: ["days logged", "protein hit %", "kcal variance", "weekend gap"],
        },
        {
          n: 2,
          t: "Trend vs target",
          d: "Body weight trend against the phase target. Two weeks of no movement is the trigger.",
          fields: ["weight trend", "expected", "delta"],
        },
        {
          n: 3,
          t: "Micronutrient gaps",
          d: "Pull the gap analysis from Nutrition. Only act on gaps below 80 % of RDA for 14 days.",
          fields: ["gaps < 80 %", "duration", "food-first option"],
        },
        {
          n: 4,
          t: "Adjust macros",
          d: "Change one macro or total calories. Note the reason so the next review has context.",
          fields: ["kcal", "protein", "carbs", "fat", "reason"],
        },
        {
          n: 5,
          t: "Send proposal",
          d: "Client confirms before anything changes in their Nutrition module.",
          fields: ["proposal note"],
        },
      ],
    },
    {
      id: "strength",
      name: "Strength block review",
      accent: "var(--acc-train)",
      icon: "training",
      cadence: "end of each block",
      duration: "10–15 min",
      when: "Client finishing a mesocycle",
      steps: [
        {
          n: 1,
          t: "Volume landmarks",
          d: "Sets per muscle against MEV/MAV/MRV. Anything above MRV for two weeks needs a cut.",
          fields: ["sets by muscle", "zone", "weeks in zone"],
        },
        {
          n: 2,
          t: "Progression audit",
          d: "Which lifts moved, which stalled. Three stalled sessions is a deload signal.",
          fields: ["lifts progressed", "stalled", "e1RM delta"],
        },
        {
          n: 3,
          t: "Fatigue markers",
          d: "RPE creep, session duration, recovery score. Combined signals matter more than any single one.",
          fields: ["avg RPE", "RPE trend", "recovery avg"],
        },
        {
          n: 4,
          t: "Next block design",
          d: "Volume, intensity and exercise selection for the coming block.",
          fields: ["block focus", "volume change", "intensity", "swaps"],
        },
        {
          n: 5,
          t: "Assign",
          d: "Send as a proposal. Client\u0027s Training module updates on confirmation.",
          fields: ["routine", "start date"],
        },
      ],
    },
    {
      id: "standard",
      name: "Standard check-in",
      accent: "var(--acc-coach)",
      icon: "coach",
      cadence: "weekly",
      duration: "5–8 min",
      when: "Default for every client without a specialised workflow",
      steps: [
        {
          n: 1,
          t: "Read the check-in",
          d: "Client\u0027s submitted form: weight, adherence, energy, questions.",
          fields: ["submitted", "weight", "adherence", "open questions"],
        },
        {
          n: 2,
          t: "Scan the dashboard",
          d: "Compliance bars, recovery chain, any alerts since last week.",
          fields: ["compliance", "recovery", "alerts"],
        },
        {
          n: 3,
          t: "Write feedback",
          d: "One thing that went well, one thing to change, one thing to watch.",
          fields: ["went well", "change", "watch"],
        },
        {
          n: 4,
          t: "Adjust or hold",
          d: "Most weeks the answer is hold. Only change with a reason.",
          fields: ["decision", "reason"],
        },
      ],
    },
  ] as const

/** `portal-workflows.jsx` · `PEAK_WEEK` */
export const PEAK_WEEK = [
    {
      day: "Day 7 · Sun",
      carbs: "Low · 1.0 g/kg",
      water: "6 L",
      sodium: "normal",
      training: "Full body depletion",
      note: "Start glycogen depletion. High volume, moderate load.",
    },
    {
      day: "Day 6 · Mon",
      carbs: "Low · 1.0 g/kg",
      water: "6 L",
      sodium: "normal",
      training: "Upper depletion",
      note: "Continue depletion. Watch for excessive flatness.",
    },
    {
      day: "Day 5 · Tue",
      carbs: "Low · 1.2 g/kg",
      water: "6 L",
      sodium: "normal",
      training: "Lower depletion",
      note: "Last depletion session. Posing practice 20 min.",
    },
    {
      day: "Day 4 · Wed",
      carbs: "Moderate · 3 g/kg",
      water: "6 L",
      sodium: "normal",
      training: "Light pump only",
      note: "Begin the load. Complex carbs, low fibre.",
    },
    {
      day: "Day 3 · Thu",
      carbs: "High · 6 g/kg",
      water: "5 L",
      sodium: "slight increase",
      training: "Posing only",
      note: "Main load day. Monitor fullness hourly.",
    },
    {
      day: "Day 2 · Fri",
      carbs: "High · 6 g/kg",
      water: "4 L",
      sodium: "normal",
      training: "Posing only",
      note: "Second load day. Adjust based on Thursday\u0027s response.",
    },
    {
      day: "Day 1 · Sat",
      carbs: "Moderate · 4 g/kg",
      water: "2 L",
      sodium: "reduce",
      training: "Rest",
      note: "Taper water. Final assessment evening before.",
    },
    {
      day: "Show day",
      carbs: "Small meals by feel",
      water: "sips only",
      sodium: "small pinch",
      training: "Pump backstage",
      note: "Adjust by look, not by plan. Have the coach on site.",
    },
  ] as const

/** `portal-workflows.jsx` · `PORTAL_ONBOARD` */
export const PORTAL_ONBOARD = [
    {
      n: 1,
      t: "Invite sent",
      d: "Coach sends an email invite or QR code. Link is valid for 7 days.",
      status: "done",
      at: "12 May",
    },
    {
      n: 2,
      t: "Client accepts",
      d: "Client creates or links their LumeOS account and confirms the coaching relationship.",
      status: "done",
      at: "12 May",
    },
    {
      n: 3,
      t: "Permissions granted",
      d: "Client picks which of the 7 modules the coach can see, and at what level. Nothing is shared until they do.",
      status: "done",
      at: "13 May",
    },
    {
      n: 4,
      t: "Intake form",
      d: "Training history, injuries, equipment access, goals, availability, dietary restrictions.",
      status: "active",
      at: "in progress",
    },
    {
      n: 5,
      t: "Baseline assessment",
      d: "Current lifts, body metrics, recent bloodwork if shared. Sets the reference point for all later reviews.",
      status: "pending",
      at: "—",
    },
    {
      n: 6,
      t: "Autonomy level set",
      d: "Coach assigns the starting level. Determines check-in cadence and intervention threshold.",
      status: "pending",
      at: "—",
    },
    {
      n: 7,
      t: "First plan proposed",
      d: "Training routine and macro targets sent as a proposal. Client confirms before it lands in their modules.",
      status: "pending",
      at: "—",
    },
    {
      n: 8,
      t: "Check-in scheduled",
      d: "Template and recurring day picked. First check-in fires automatically.",
      status: "pending",
      at: "—",
    },
  ] as const

/** `client-record.jsx` · `FCR_CLIENT` */
export const FCR_CLIENT = {
    name: "Lukas Bauer",
    av: "LB",
    age: 31,
    sex: "male",
    height: 182,
    since: "Mar 2024",
    tier: "Elite",
    access: "full",
    granted: "8 Mar 2024",
    goal: "Contest prep · classic physique · 20 Sep",
    phase: "contest_prep · week 18 of 20",
    coaches: ["Anders Lindqvist · training", "Jana Bauer · nutrition", "Dr. Kessler · medical"],
  } as const

/** `client-record.jsx` · `FCR_MODULES` */
export const FCR_MODULES = [
    { id: "training", label: "Training", access: "full", color: "var(--acc-train)" },
    { id: "nutrition", label: "Nutrition", access: "full", color: "var(--acc-nutri)" },
    { id: "recovery", label: "Recovery", access: "full", color: "var(--acc-recov)" },
    { id: "supplements", label: "Supplements", access: "full", color: "var(--acc-suppl)" },
    { id: "goals", label: "Goals & body", access: "full", color: "var(--acc-goals)" },
    { id: "medical", label: "Medical", access: "summary", color: "var(--acc-medic)" },
  ] as const

/** `client-record.jsx` · `FCR_TRAINING` */
export const FCR_TRAINING = {
    kpis: [
      ["Sessions · 7d", "6 of 6"],
      ["Volume · week", "34.2 t"],
      ["Avg RPE", "8.4"],
      ["Streak", "126 days"],
    ],
    sessions: [
      {
        d: "today 06:40",
        name: "Push · depletion",
        sets: 24,
        vol: "6.8 t",
        rpe: 8.1,
        note: "Flat but moved well",
      },
      {
        d: "yesterday",
        name: "Pull · depletion",
        sets: 22,
        vol: "7.4 t",
        rpe: 8.6,
        note: "Last two sets grindy",
      },
      { d: "Sat 07:12", name: "Legs", sets: 20, vol: "9.1 t", rpe: 9, note: "Called it after set 18" },
      { d: "Fri 06:55", name: "Upper", sets: 24, vol: "6.2 t", rpe: 8.2, note: "" },
    ],
    lifts: [
      { l: "Bench press", cur: "132.5 kg", peak: "137.5 kg", delta: "−3.6 %", ok: true },
      { l: "Squat", cur: "182.5 kg", peak: "190 kg", delta: "−3.9 %", ok: true },
      { l: "Deadlift", cur: "212.5 kg", peak: "222.5 kg", delta: "−4.5 %", ok: true },
      { l: "Overhead press", cur: "72.5 kg", peak: "80 kg", delta: "−9.4 %", ok: false },
    ],
  } as const

/** `client-record.jsx` · `FCR_NUTRITION` */
export const FCR_NUTRITION = {
    kpis: [
      ["Calories today", "2,180"],
      ["Protein", "218 g"],
      ["Adherence · 7d", "97 %"],
      ["Water", "4.2 L"],
    ],
    macros: [
      ["Protein", 218, 220, "var(--acc-train)"],
      ["Carbs", 180, 190, "var(--acc-nutri)"],
      ["Fat", 52, 55, "var(--acc-goals)"],
    ],
    week: [
      { d: "Mon", kcal: 2180, p: 220, logged: true },
      { d: "Tue", kcal: 2210, p: 218, logged: true },
      { d: "Wed", kcal: 2160, p: 222, logged: true },
      { d: "Thu", kcal: 2190, p: 216, logged: true },
      { d: "Fri", kcal: 2240, p: 219, logged: true },
      { d: "Sat", kcal: 2380, p: 208, logged: true },
      { d: "Sun", kcal: 2180, p: 218, logged: true },
    ],
    gaps: [
      ["Vitamin D", 62],
      ["Omega-3", 71],
      ["Magnesium", 84],
    ],
  } as const

/** `client-record.jsx` · `FCR_RECOVERY` */
export const FCR_RECOVERY = {
    kpis: [
      ["Recovery score", "58"],
      ["Sleep · 7d avg", "6.4 h"],
      ["HRV", "48 ms"],
      ["Resting HR", "54"],
    ],
    sleep: [7.1, 6.8, 6.2, 6, 6.4, 5.9, 6.4],
    hrv: [58, 56, 52, 50, 49, 47, 48],
    flags: [
      { t: "Sleep below target seven nights running", sev: "warn" },
      { t: "HRV down 17 % from the block baseline", sev: "warn" },
      { t: "Resting HR up 4 bpm over two weeks", sev: "info" },
    ],
  } as const

/** `client-record.jsx` · `FCR_SUPPS` */
export const FCR_SUPPS = [
    { n: "Creatine mono", dose: "5 g", when: "morning", adherence: 100, days: 126 },
    { n: "Vitamin D3", dose: "4000 IU", when: "morning", adherence: 98, days: 126 },
    { n: "Omega-3", dose: "2 g EPA", when: "with meals", adherence: 94, days: 126 },
    { n: "Magnesium glycinate", dose: "400 mg", when: "evening", adherence: 96, days: 84 },
    { n: "Caffeine", dose: "200 mg", when: "pre-training", adherence: 100, days: 126 },
    { n: "Electrolytes", dose: "1 sachet", when: "peri-workout", adherence: 89, days: 42 },
  ] as const

/** `client-record.jsx` · `FCR_BODY` */
export const FCR_BODY = {
    kpis: [
      ["Weight", "81.4 kg"],
      ["Body fat", "6.8 %"],
      ["Lean mass", "75.9 kg"],
      ["Weekly change", "−0.4 kg"],
    ],
    weight: [88.2, 87.4, 86.5, 85.8, 85, 84.3, 83.6, 83, 82.4, 82, 81.7, 81.4],
    measures: [
      ["Chest", "112 cm", "−2 cm"],
      ["Waist", "74 cm", "−9 cm"],
      ["Arm", "41 cm", "−1.5 cm"],
      ["Thigh", "62 cm", "−3 cm"],
    ],
  } as const

/** `client-record.jsx` · `FCR_MEDICAL` */
export const FCR_MEDICAL = {
    note: "Summary access only. Full records, lab values and medication detail stay with Dr. Kessler unless Lukas grants more.",
    visible: [
      ["Clearance status", "cleared for competition prep · reviewed 2 Sep"],
      ["Active flags", "none"],
      ["Medication interactions", "none reported"],
      ["Last physician contact", "2 Sep 2026"],
    ],
    hidden: ["Lab panels", "Diagnoses", "Prescriptions", "Consultation notes"],
  } as const

/** `client-record.jsx` · `FCR_TIMELINE` */
export const FCR_TIMELINE = [
    { at: "today 06:40", m: "training", t: "Push depletion logged · 24 sets, RPE 8.1" },
    { at: "today 06:12", m: "recovery", t: "Check-in: energy 5, soreness 6, sleep 6.4 h" },
    { at: "today 05:58", m: "goals", t: "Weight logged · 81.4 kg" },
    { at: "yesterday 21:30", m: "supplements", t: "Evening stack taken" },
    { at: "yesterday 19:14", m: "nutrition", t: "Dinner logged · 620 kcal, 58 g protein" },
    { at: "yesterday 18:02", m: "training", t: "Pull depletion logged · 22 sets, RPE 8.6" },
    { at: "2 days ago", m: "medical", t: "Physician clearance confirmed" },
  ] as const

/** `programs.jsx` · `PROGRAMS` */
export const PROGRAMS = [
    {
      id: "PG-04",
      name: "12-Week Powerbuilding",
      category: "Training",
      weeks: 12,
      assigned: 6,
      delivered: "rolling",
      created: "2026-01-08",
      rating: 4.9,
      blocks: [
        {
          n: 1,
          weeks: "1–4",
          name: "Block 1 · Hypertrophy",
          focus: "High volume, RPE 7–8",
          color: "var(--acc-train)",
        },
        {
          n: 2,
          weeks: "5–8",
          name: "Block 2 · Strength",
          focus: "Lower volume, RPE 8–9",
          color: "var(--acc-coach)",
        },
        {
          n: 3,
          weeks: "9–12",
          name: "Block 3 · Peaking",
          focus: "Singles and doubles, taper",
          color: "var(--acc-buddy)",
        },
      ],
    },
    {
      id: "PG-03",
      name: "Beginner Linear · 12 weeks",
      category: "Training",
      weeks: 12,
      assigned: 5,
      delivered: "rolling",
      created: "2025-11-02",
      rating: 4.6,
      blocks: [],
    },
    {
      id: "PG-02",
      name: "Cut · 8-week meal plan",
      category: "Nutrition",
      weeks: 8,
      assigned: 3,
      delivered: "weekly",
      created: "2026-02-14",
      rating: 4.8,
      blocks: [],
    },
    {
      id: "PG-01",
      name: "Contest Prep · 16 weeks",
      category: "Combined",
      weeks: 16,
      assigned: 2,
      delivered: "rolling",
      created: "2025-09-20",
      rating: 5,
      blocks: [],
    },
  ] as const

/** `programs.jsx` · `DELIVERY_MODES` */
export const DELIVERY_MODES = [
    {
      id: "immediate",
      label: "All at once",
      desc: "Every week unlocked on assignment. Client can read ahead.",
    },
    {
      id: "rolling",
      label: "Rolling +7 d",
      desc: "Week 1 on assign, each following week seven days later.",
    },
    {
      id: "weekly",
      label: "Fixed weekday",
      desc: "New week unlocks every Monday regardless of assignment date.",
    },
    { id: "manual", label: "Manual", desc: "You release each week yourself." },
  ] as const

/** `programs.jsx` · `ASSIGNMENT` */
export const ASSIGNMENT = {
    program: "12-Week Powerbuilding",
    athlete: "Lukas Bauer",
    assigned: "2026-04-06",
    mode: "rolling",
    currentWeek: 6,
    weeks: 12,
    autoMessage: true,
    messageTemplate: "New week unlocked — focus: {block_name}. {week_note}",
    schedule: [
      { week: 1, date: "06.04", block: 1, status: "delivered", completion: 100 },
      { week: 2, date: "13.04", block: 1, status: "delivered", completion: 100 },
      { week: 3, date: "20.04", block: 1, status: "delivered", completion: 92 },
      { week: 4, date: "27.04", block: 1, status: "delivered", completion: 100 },
      { week: 5, date: "04.05", block: 2, status: "delivered", completion: 88 },
      { week: 6, date: "11.05", block: 2, status: "active", completion: null },
      { week: 7, date: "18.05", block: 2, status: "scheduled", completion: null },
      { week: 8, date: "25.05", block: 2, status: "scheduled", completion: null },
      { week: 9, date: "01.06", block: 3, status: "scheduled", completion: null },
      { week: 10, date: "08.06", block: 3, status: "scheduled", completion: null },
      { week: 11, date: "15.06", block: 3, status: "scheduled", completion: null },
      { week: 12, date: "22.06", block: 3, status: "scheduled", completion: null },
    ],
  } as const

/** `programs.jsx` · `DELIVERY_LOG` */
export const DELIVERY_LOG = [
    {
      at: "2026-05-11 06:00",
      week: 6,
      athlete: "Lukas Bauer",
      event: "week_unlocked",
      note: "Block 2 · Strength — auto-message sent",
    },
    {
      at: "2026-05-11 06:00",
      week: 4,
      athlete: "Marcus Weber",
      event: "week_unlocked",
      note: "Block 1 · Hypertrophy",
    },
    {
      at: "2026-05-04 06:00",
      week: 5,
      athlete: "Lukas Bauer",
      event: "week_unlocked",
      note: "Block 2 begins — coach note attached",
    },
    {
      at: "2026-05-02 14:22",
      week: 4,
      athlete: "Sophie Klein",
      event: "paused",
      note: "Coach paused delivery — recovery critical",
    },
    {
      at: "2026-04-27 06:00",
      week: 4,
      athlete: "Lukas Bauer",
      event: "week_unlocked",
      note: "Block 1 final week",
    },
    {
      at: "2026-04-06 09:14",
      week: 1,
      athlete: "Lukas Bauer",
      event: "assigned",
      note: "Proposal accepted by client",
    },
  ] as const

/** `programs.jsx` · `STATUS_STYLE` */
export const STATUS_STYLE = {
    delivered: { color: "var(--pos)", label: "delivered" },
    active: { color: "var(--acc-coach)", label: "active" },
    scheduled: { color: "var(--fg-dim)", label: "scheduled" },
    paused: { color: "var(--warn)", label: "paused" },
  } as const
