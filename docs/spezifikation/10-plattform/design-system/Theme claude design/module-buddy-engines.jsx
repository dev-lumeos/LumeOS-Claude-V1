// AI Coach (Buddy) · spec-conformant engine surfaces
// Ref: Buddy SPEC_01 §3, SPEC_02, SPEC_04 F1–F9, INDEX (tiers, engines, cron, safety)

// ── Feature gate (INDEX) ────────────────────────────────────
const TIERS = ["free", "plus", "pro", "elite"];
const TIER_LABEL = { free: "Free", plus: "Plus", pro: "Pro", elite: "Elite" };
const TIER_PRICE = { free: "€0", plus: "€8 / mo", pro: "€18 / mo", elite: "€39 / mo" };

const GATED_FEATURES = [
  { key: "chat_limited",     label: "Text chat · 5 / day",   min: "free"  },
  { key: "insights_feed",    label: "Insights feed",          min: "free"  },
  { key: "chat_unlimited",   label: "Chat unlimited",         min: "plus"  },
  { key: "all_personas",     label: "All 5 personas",         min: "plus"  },
  { key: "journey",          label: "Journey / Heartbeat",    min: "plus"  },
  { key: "voice_input",      label: "Voice input",            min: "pro"   },
  { key: "action_execution", label: "Action execution",       min: "pro"   },
  { key: "proactive_watcher",label: "Proactive watcher",      min: "pro"   },
  { key: "push",             label: "Push notifications",     min: "pro"   },
  { key: "gym_finder",       label: "Gym finder",             min: "pro"   },
  { key: "training_plans",   label: "Training plans",         min: "elite" },
  { key: "cycle_consulting", label: "Cycle consulting",       min: "elite" },
  { key: "weekly_report",    label: "Weekly deep report",     min: "elite" },
  { key: "ai_clone",         label: "AI Clone",               min: "coach" },
];
const tierRank = t => ({ free: 0, plus: 1, pro: 2, elite: 3, coach: 4 }[t] ?? 0);
const hasFeature = (userTier, min) => tierRank(userTier) >= tierRank(min);

// ── Hybrid AI paths (F1) ────────────────────────────────────
const AI_PATHS = [
  { id: "fast",      label: "Fast path",      model: "none (engines only)",    cost: "$0",          share: 60, when: "Dashboard cards, scores, anything already computed" },
  { id: "knowledge", label: "Knowledge path", model: "GLM-4.7-Flash / Haiku",  cost: "~$0.002",     share: 20, when: "Science questions that don't need your data" },
  { id: "hybrid",    label: "Hybrid path",    model: "GLM-4.7-Flash / Sonnet", cost: "~$0.005–0.02",share: 20, when: "Cross-module analysis — engines feed the LLM" },
];

const PATH_LOG = [
  { at: "14:19", msg: "stay with 17:30 for this week",        path: "fast",      cost: 0,      ms: 40   },
  { at: "14:18", msg: "Pre-workout dose in 4h 02m…",           path: "hybrid",    cost: 0.018,  ms: 1840 },
  { at: "09:32", msg: "Glucose trending up since MK-677…",     path: "hybrid",    cost: 0.021,  ms: 2140 },
  { at: "07:43", msg: "Bench PR 122.5 kg — block on target",   path: "fast",      cost: 0,      ms: 32   },
  { at: "yest",  msg: "Why is creatine loading optional?",     path: "knowledge", cost: 0.002,  ms: 680  },
  { at: "yest",  msg: "Sleep down three nights — caffeine?",   path: "hybrid",    cost: 0.019,  ms: 1920 },
];

// ── 11 engines (INDEX) ──────────────────────────────────────
const ENGINES = [
  { id: "nutrition",  label: "Nutrition",           out: "nutrition_score · protein_gap · calorie_gap · micronutrient_deficits", val: "72", state: "ok" },
  { id: "training",   label: "Training",            out: "training_readiness · progression_state · overreach_risk",             val: "84", state: "ok" },
  { id: "recovery",   label: "Recovery",            out: "recovery_score · deload_recommendation · sleep_priority_flag",        val: "82", state: "ok" },
  { id: "biomarker",  label: "Biomarker",           out: "biomarker_risk_flags · escalation_recommendation",                    val: "1 flag", state: "warn" },
  { id: "supplement", label: "Supplement",          out: "stack_safety_score · interaction_flags",                              val: "94", state: "ok" },
  { id: "bodycomp",   label: "Body composition",    out: "composition_score · phase_state · tdee_estimate",                     val: "2,847", state: "ok" },
  { id: "behaviour",  label: "Behaviour",           out: "compliance_score · adherence_pattern",                                val: "91", state: "ok" },
  { id: "circadian",  label: "Circadian",           out: "circadian_alignment_score · optimal_training_window",                 val: "76", state: "ok" },
  { id: "energy",     label: "Energy availability", out: "energy_availability_score · underfueling_flag",                       val: "38 kcal/kg", state: "warn" },
  { id: "stress",     label: "Stress load",         out: "stress_load_score · overload_flag",                                   val: "44", state: "ok" },
  { id: "electrolyte",label: "Electrolyte",         out: "electrolyte_balance_score · imbalance_flags",                         val: "88", state: "ok" },
];

// ── Journey / heartbeat (E10, Flow 6) ───────────────────────
const CHECKPOINTS = [
  { id: "morning",   emoji: "🌅", time: "07:00", enabled: true,  persona: "drill_sergeant", push: true,
    days: [1,2,3,4,5,6], modules: ["recovery","nutrition","supplements"],
    content: { show_recovery: true, show_macros: true, show_supplements: true, show_goals: false } },
  { id: "midday",    emoji: "🍽️", time: "12:30", enabled: false, persona: "best_friend", push: false,
    days: [1,2,3,4,5], modules: ["nutrition"],
    content: { show_recovery: false, show_macros: true, show_supplements: false, show_goals: false } },
  { id: "preworkout",emoji: "🏋️", time: "16:00", enabled: true,  persona: "motivator", push: true,
    days: [1,2,3,5,6], modules: ["training","nutrition"],
    content: { show_recovery: true, show_macros: true, show_supplements: true, show_goals: false } },
  { id: "evening",   emoji: "🌙", time: "21:00", enabled: true,  persona: "zen_master", push: false,
    days: [0,1,2,3,4,5,6], modules: ["recovery","supplements"],
    content: { show_recovery: true, show_macros: false, show_supplements: true, show_goals: false } },
  { id: "weekly",    emoji: "📊", time: "20:00", enabled: true,  persona: "scientist", push: true,
    days: [0], modules: ["training","nutrition","recovery","goals"],
    content: { show_recovery: true, show_macros: true, show_supplements: true, show_goals: true } },
];
const DOW = ["S","M","T","W","T","F","S"];
const PERSONA_LABEL = { scientist: "Scientist", motivator: "Motivator", drill_sergeant: "Drill Sergeant", best_friend: "Best Friend", zen_master: "Zen Master" };

// ── Proactive watcher (F4) ──────────────────────────────────
const WATCHER_RULES = [
  { id: "nutrition_nothing_logged", level: "warning",  category: "nutrition",
    cond: "meals_today === 0 AND hour >= 14", now: "3 meals by 13:08", fires: false },
  { id: "recovery_critical", level: "warning", category: "recovery",
    cond: "recovery_score < 50 AND heavy_training_day", now: "82 · heavy day today", fires: false },
  { id: "sleep_consecutive_bad", level: "warning", category: "recovery",
    cond: "bad_sleep_days_consecutive >= 3", now: "1 night under 6 h", fires: false },
  { id: "supplement_interaction_critical", level: "critical", category: "supplements",
    cond: "supplement_interaction_critical === true", now: "no critical interaction", fires: false },
  { id: "glucose_trend_up", level: "warning", category: "cross_module",
    cond: "fasting_glucose rising 4 weeks AND enhanced_cycle_active", now: "+14 mg/dL since MK-677 start", fires: true },
];

const WATCHER_ALERTS = [
  { id: "AL-3312", level: "warning", category: "cross_module", created: "today 02:00",
    message: "Fasting glucose has climbed 14 mg/dL since the MK-677 cycle started. Still in range, worth raising at the next panel.",
    dismissCount: 0, expires: "in 34 h" },
  { id: "AL-3308", level: "info", category: "recovery", created: "Mon 02:00",
    message: "Sleep onset is drifting later on training days — 22:48 vs 22:14 on rest days.",
    dismissCount: 2, expires: "expired" },
];

// ── BSS (E8, Flow 11) ───────────────────────────────────────
const BSS = {
  total: 71, prior: 58, delta: 13, trend: "improving", period: "rolling_90d",
  formula: "BSS = stability_score × 0.6 + goal_alignment_score × 0.4",
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
    body_composition: { goal: "recomp 78 kg @ 12 %", on_track: true },
    alignment_score: 64,
  },
  history: [52, 54, 56, 58, 58, 61, 63, 65, 66, 68, 70, 71],
};

// ── Behavioral signature (F9) ───────────────────────────────
const SIGNATURE = {
  weeksOfData: 11, minWeeks: 8, eventCount: 412,
  patterns: [
    { key: "stress_pattern",  label: "Stress → skips training", detected: true,  confidence: 0.74, n: 9,
      pattern: "skips_training", first: "2026-02-18", last: "2026-05-09",
      detail: "On days you log stress ≥ 7, the evening session is skipped 6 of 9 times." },
    { key: "protein_collapse",label: "Protein collapse",        detected: true,  confidence: 0.68, n: 7,
      pattern: "weekend_drop", first: "2026-03-01", last: "2026-05-11", threshold_g: 120,
      detail: "Saturday protein lands under 120 g in 7 of the last 11 weekends." },
    { key: "dropout_risk",    label: "Dropout risk window",     detected: true,  confidence: 0.61, n: 5,
      pattern: "friday@18:00", first: "2026-03-14", last: "2026-05-08",
      detail: "Friday evening sessions are the ones most often missed." },
    { key: "motivation_type", label: "Motivation type",         detected: false, confidence: 0.34, n: 3,
      detail: "Not enough signal yet — needs more logged mood/outcome pairs." },
  ],
};

// ── Intervention engine (E7) ────────────────────────────────
const INTERVENTIONS = [
  { id: "IV-88", bucket: "high_stress__missed_workout", type: "encouragement", tone: "soft",
    at: "May 9 19:40", content: "Rough week showing up in the numbers. 20 minutes easy would still count.",
    expected: "engaged", observed: "engaged", effectiveness: 0.82 },
  { id: "IV-87", bucket: "protein_below_target__evening", type: "adjustment", tone: "analytical",
    at: "May 8 20:10", content: "45 g short. Casein before bed closes it without touching tomorrow's deficit.",
    expected: "accepted", observed: "accepted", effectiveness: 0.91 },
  { id: "IV-86", bucket: "streak_at_risk__friday", type: "confrontation", tone: "direct",
    at: "May 2 17:30", content: "Third Friday in a row. Is the slot wrong, or is the session wrong?",
    expected: "engaged", observed: "rejected", effectiveness: 0.24 },
  { id: "IV-85", bucket: "recovery_low__heavy_day", type: "redirect", tone: "tough_love",
    at: "Apr 28 06:50", content: "Recovery 48. Move the heavy day, keep the week.",
    expected: "accepted", observed: "accepted", effectiveness: 0.88 },
  { id: "IV-84", bucket: "all_green__no_signal", type: "silence", tone: "—",
    at: "Apr 26", content: "(no intervention — nothing worth saying)", expected: "—", observed: "—", effectiveness: null },
];

const INTERVENTION_LOAD = { window: "7 days", total: 3, max: 5, confrontations: 1, maxConfrontations: 2, identity: 0, maxIdentity: 3 };

// ── Policy gate (F8) + safety rules (INDEX) ─────────────────
const SAFETY_RULES = [
  { rule: "Medical Gate",                  detail: "No diagnoses, dosages or therapy recommendations." },
  { rule: "Supplement–biomarker decoupling", detail: "Supplements are never suggested in response to a lab value." },
  { rule: "Manipulation guard",            detail: "No fear, guilt or streak-shaming narratives." },
  { rule: "Medication gate",               detail: "Medication logged → only 'discuss with your doctor or pharmacist'." },
  { rule: "max_intervention_intensity",    detail: "Never autonomously above 0.8." },
  { rule: "intervention_load_7d",          detail: "Max 5 per week · 2 confrontations · 3 identity statements." },
  { rule: "Policy Gate",                   detail: "Server-side before every response: PASS · REDACT · BLOCK." },
  { rule: "Safety priority",               detail: "Safety > Recovery > Training > Nutrition > Behavior." },
  { rule: "Evidence obligation",           detail: "Study claims never in speech_text — only in UI cards." },
];

const GATE_LOG = [
  { at: "today 09:32", verdict: "REDACT", reason: "dosage_mention",
    before: "Your glucose is climbing — drop MK-677 to 5 mg and add 500 mg berberine.",
    after:  "Your fasting glucose has moved from 88 to 102 mg/dL since the cycle started. That's worth raising with Dr. Kessler before the next panel." },
  { at: "Apr 23 11:14", verdict: "BLOCK", reason: "medical_diagnosis",
    before: "Your ferritin pattern suggests early hemochromatosis.",
    after:  "Ferritin is 142 ng/mL, inside the reference range. If you want this interpreted in context, your next panel is the place." },
  { at: "Apr 12 08:02", verdict: "PASS", reason: "—", before: "—", after: "Protein is at 142 g of 180 g. Casein tonight closes most of it." },
];

// ── App Butler (F3, Flow 4) ─────────────────────────────────
const BUTLER_INTENTS = [
  { type: "log_meal",       label: "Log meal",        target: "Nutrition",   preview: true,  ex: "Had 200 g chicken with 150 g rice" },
  { type: "log_water",      label: "Log water",       target: "Nutrition",   preview: false, ex: "500 ml water" },
  { type: "log_weight",     label: "Log weight",      target: "Goals",       preview: false, ex: "79.2 this morning" },
  { type: "log_supplement", label: "Log supplement",  target: "Supplements", preview: false, ex: "Took the morning stack" },
  { type: "log_checkin",    label: "Log check-in",    target: "Recovery",    preview: false, ex: "Slept 7 h, feel a 7" },
  { type: "log_set",        label: "Log set",         target: "Training",    preview: false, ex: "117.5 for 5" },
];

const BUTLER_LOG = [
  { at: "today 13:08", said: "Had 200 g chicken with 150 g rice", intent: "log_meal", conf: 0.94, status: "confirmed",
    result: "490 kcal · 52 P · 57 C · 6 F → Nutrition" },
  { at: "today 07:44", said: "Took the morning stack", intent: "log_supplement", conf: 0.97, status: "executed",
    result: "3 items marked taken → Supplements" },
  { at: "yesterday 21:02", said: "Weight 79.4", intent: "log_weight", conf: 0.99, status: "executed",
    result: "79.4 kg → Goals" },
  { at: "yesterday 18:40", said: "Some pasta I think", intent: "log_meal", conf: 0.41, status: "clarification",
    result: "Asked back: how much, and with what?" },
];

// ── Cron jobs (INDEX) ───────────────────────────────────────
const CRON_JOBS = [
  { job: "Proactive watcher",   schedule: "daily 02:00",  desc: "Check every user for critical patterns", last: "today 02:00", next: "tomorrow 02:00" },
  { job: "BSS calculation",     schedule: "daily 03:00",  desc: "Rolling 90-day BSS for active users",    last: "today 03:00", next: "tomorrow 03:00" },
  { job: "Behavioral signature",schedule: "daily 04:00",  desc: "Update for users with ≥ 8 weeks of data",last: "today 04:00", next: "tomorrow 04:00" },
  { job: "Journey dispatcher",  schedule: "every minute", desc: "Fire heartbeat checkpoints",              last: "14:19",       next: "16:00 · pre-workout" },
  { job: "Memory decay",        schedule: "daily 06:00",  desc: "Weaken old or unused memories",           last: "today 06:00", next: "tomorrow 06:00" },
  { job: "Weekly deep report",  schedule: "Mon 05:00",    desc: "Elite tier weekly report",                last: "Mon 05:00",   next: "Mon 05:00" },
];

// ════════════════════════════════════════════════════════════
// VIEWS
// ════════════════════════════════════════════════════════════

const STATE_COLOR = { ok: "var(--pos)", warn: "var(--warn)", bad: "var(--neg)" };

window.BuddyTiers = ({ tier, setTier }) => (
  <div className="col-gap" style={{gap: 14}}>
    <Card title="Your plan" sub="feature gate is middleware — every gated endpoint checks the tier">
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14}}>
        {TIERS.map(t => (
          <div key={t} onClick={() => setTier(t)} style={{
            padding: 14, borderRadius: 8, cursor: "pointer", textAlign: "center",
            background: tier === t ? "color-mix(in srgb, var(--acc-buddy) 12%, var(--surface))" : "var(--surface)",
            border: `1px solid ${tier === t ? "color-mix(in srgb, var(--acc-buddy) 40%, var(--border))" : "var(--border)"}`,
          }}>
            <div style={{fontSize: 14, fontWeight: 600, marginBottom: 3, color: tier === t ? "var(--acc-buddy)" : "var(--fg)"}}>{TIER_LABEL[t]}</div>
            <div className="num" style={{fontSize: 12, color: "var(--fg-muted)"}}>{TIER_PRICE[t]}</div>
            {tier === t && <Pill variant="acc" style={{marginTop: 6}}>current</Pill>}
          </div>
        ))}
      </div>
      <table className="tbl">
        <thead><tr><th>Feature</th><th style={{width: 90}}>Requires</th>{TIERS.map(t => <th key={t} style={{width: 70, textAlign: "center"}}>{TIER_LABEL[t]}</th>)}</tr></thead>
        <tbody>
          {GATED_FEATURES.map(f => (
            <tr key={f.key}>
              <td style={{fontSize: 12.5}}>{f.label}</td>
              <td><Pill style={{fontSize: 9.5}}>{f.min}</Pill></td>
              {TIERS.map(t => (
                <td key={t} style={{textAlign: "center"}}>
                  {hasFeature(t, f.min)
                    ? <Icon name="check" className="ic ic-sm" style={{color: t === tier ? "var(--pos)" : "var(--fg-dim)"}}/>
                    : <span className="dim">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>

    <Card title="What's locked for you right now" sub={`tier: ${TIER_LABEL[tier]}`}>
      {GATED_FEATURES.filter(f => !hasFeature(tier, f.min)).length === 0
        ? <div className="dim" style={{fontSize: 12, padding: 12}}>Nothing — you have everything.</div>
        : (
          <div className="col-gap" style={{gap: 6}}>
            {GATED_FEATURES.filter(f => !hasFeature(tier, f.min)).map(f => (
              <div key={f.key} style={{display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                <Icon name="shield" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/>
                <span style={{fontSize: 12.5, flex: 1}}>{f.label}</span>
                <Pill variant="acc">{TIER_LABEL[f.min] || f.min}</Pill>
                <button className="btn btn-sm">Upgrade</button>
              </div>
            ))}
          </div>
        )}
    </Card>
  </div>
);

window.BuddyEngines = () => (
  <div className="col-gap" style={{gap: 14}}>
    <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
      <Icon name="brain" className="ic" style={{color: "var(--acc-buddy)", flexShrink: 0, marginTop: 2}}/>
      <div style={{flex: 1}}>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Numbers come from engines, words come from the model</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
          Eleven deterministic engines run order-independently and produce every figure I quote. The language model only phrases them —
          it is never the source of a number.
        </div>
      </div>
    </div>

    <Card title="Engines" sub="11 · deterministic · order-independent">
      <table className="tbl">
        <thead><tr><th style={{width: 170}}>Engine</th><th>Outputs</th><th style={{width: 110, textAlign: "right"}}>Current</th><th style={{width: 70}}>State</th></tr></thead>
        <tbody>
          {ENGINES.map(e => (
            <tr key={e.id}>
              <td style={{fontSize: 12.5, fontWeight: 500}}>{e.label}</td>
              <td className="mono muted" style={{fontSize: 10.5}}>{e.out}</td>
              <td className="num" style={{textAlign: "right", color: STATE_COLOR[e.state]}}>{e.val}</td>
              <td><span className="dot" style={{background: STATE_COLOR[e.state], display: "inline-block", width: 7, height: 7}}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>

    <div className="grid" style={{gridTemplateColumns: "1.3fr 1fr", gap: 14}}>
      <Card title="Request routing" sub="three paths · cost per request">
        <div className="col-gap" style={{gap: 8, marginBottom: 14}}>
          {AI_PATHS.map(p => (
            <div key={p.id} style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                <span style={{fontSize: 12.5, fontWeight: 600}}>{p.label}</span>
                <Pill className="mono" style={{fontSize: 9.5}}>{p.cost}</Pill>
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{p.share}% of traffic</span>
              </div>
              <div className="muted" style={{fontSize: 11.5, marginBottom: 6}}>{p.when}</div>
              <div style={{height: 4, background: "var(--surface-2)", borderRadius: 999}}>
                <div style={{height: "100%", width: `${p.share}%`, background: "var(--acc-buddy)", borderRadius: 999, opacity: 0.7}}/>
              </div>
              <div className="dim mono" style={{fontSize: 9.5, marginTop: 4}}>{p.model}</div>
            </div>
          ))}
        </div>
        <div className="eyebrow" style={{marginBottom: 6}}>Recent routing</div>
        <table className="tbl">
          <thead><tr><th style={{width: 60}}>When</th><th>Message</th><th style={{width: 90}}>Path</th><th style={{width: 70, textAlign: "right"}}>Cost</th><th style={{width: 60, textAlign: "right"}}>ms</th></tr></thead>
          <tbody>
            {PATH_LOG.map((l, i) => (
              <tr key={i}>
                <td className="num muted" style={{fontSize: 10.5}}>{l.at}</td>
                <td className="muted" style={{fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240}}>{l.msg}</td>
                <td><Pill style={{fontSize: 9.5, color: l.path === "fast" ? "var(--pos)" : l.path === "knowledge" ? "var(--acc-recov)" : "var(--acc-buddy)"}}>{l.path}</Pill></td>
                <td className="num muted" style={{textAlign: "right", fontSize: 11}}>{l.cost === 0 ? "$0" : "$" + l.cost.toFixed(3)}</td>
                <td className="num muted" style={{textAlign: "right", fontSize: 11}}>{l.ms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Cost this month" sub="your tier">
          <div style={{display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10}}>
            <span className="num" style={{fontSize: 26, fontWeight: 500}}>$3.42</span>
            <span className="dim" style={{fontSize: 11}}>· Pro budget ≈ $3.50</span>
          </div>
          <Meter value={97} color="var(--warn)"/>
          <div className="divider"/>
          <Row label="Fast path" value="412 calls · $0"/>
          <Row label="Knowledge path" value="38 calls · $0.08"/>
          <Row label="Hybrid path" value="167 calls · $3.34"/>
        </Card>
        <Card title="Cron" sub="6 jobs">
          <div className="col-gap" style={{gap: 0}}>
            {CRON_JOBS.map(j => (
              <div key={j.job} style={{padding: "8px 0", borderBottom: "1px solid var(--border)"}}>
                <div style={{display: "flex", alignItems: "baseline", gap: 8}}>
                  <span style={{fontSize: 12, fontWeight: 500}}>{j.job}</span>
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{j.schedule}</span>
                </div>
                <div className="dim" style={{fontSize: 10.5, marginTop: 2}}>next · {j.next}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
);

window.BuddyJourney = () => {
  const [cps, setCps] = useState(CHECKPOINTS);
  const toggle = id => setCps(c => c.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const toggleDay = (id, d) => setCps(c => c.map(x => x.id === id
    ? { ...x, days: x.days.includes(d) ? x.days.filter(y => y !== d) : [...x.days, d].sort() } : x));
  return (
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="calendar" className="ic" style={{color: "var(--acc-buddy)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Heartbeat</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Scheduled briefings. Each slot carries its own persona, its own module set, and its own weekdays — mornings can be
            a drill sergeant while evenings are a zen master.
          </div>
        </div>
        <div style={{textAlign: "right"}}>
          <div className="num" style={{fontSize: 20}}>{cps.filter(c => c.enabled).length}</div>
          <div className="dim" style={{fontSize: 10}}>of {cps.length} active</div>
        </div>
      </div>

      {cps.map(cp => (
        <Card key={cp.id} style={{opacity: cp.enabled ? 1 : 0.6}}>
          <div style={{display: "flex", alignItems: "flex-start", gap: 14}}>
            <div style={{fontSize: 22, lineHeight: 1, marginTop: 2}}>{cp.emoji}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap"}}>
                <span className="num" style={{fontSize: 15, fontWeight: 600}}>{cp.time}</span>
                <span style={{fontSize: 13, fontWeight: 600, textTransform: "capitalize"}}>{cp.id}</span>
                <Pill variant="acc">{PERSONA_LABEL[cp.persona]}</Pill>
                {cp.push && <Pill><Icon name="bell" className="ic ic-sm"/>push</Pill>}
                <div style={{marginLeft: "auto", display: "flex", gap: 6, alignItems: "center"}}>
                  <span className="dim mono" style={{fontSize: 10}}>{cp.enabled ? "on" : "off"}</span>
                  <div onClick={() => toggle(cp.id)} style={{cursor: "pointer", width: 32, height: 18, borderRadius: 999, padding: 2, background: cp.enabled ? "var(--acc-buddy)" : "var(--surface-2)"}}>
                    <div style={{width: 14, height: 14, borderRadius: 999, background: "var(--bg)", marginLeft: cp.enabled ? 14 : 0, transition: "margin .15s"}}/>
                  </div>
                </div>
              </div>
              <div style={{display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 14px", alignItems: "center"}}>
                <span className="eyebrow">Days</span>
                <div style={{display: "flex", gap: 3}}>
                  {DOW.map((d, i) => (
                    <button key={i} onClick={() => toggleDay(cp.id, i)} style={{
                      width: 24, height: 24, borderRadius: 5, cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                      background: cp.days.includes(i) ? "color-mix(in srgb, var(--acc-buddy) 22%, transparent)" : "var(--surface-2)",
                      border: `1px solid ${cp.days.includes(i) ? "color-mix(in srgb, var(--acc-buddy) 40%, var(--border))" : "var(--border)"}`,
                      color: cp.days.includes(i) ? "var(--acc-buddy)" : "var(--fg-dim)",
                    }}>{d}</button>
                  ))}
                </div>
                <span className="eyebrow">Modules</span>
                <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                  {cp.modules.map(m => <Pill key={m}>{m}</Pill>)}
                </div>
                <span className="eyebrow">Content</span>
                <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                  {Object.entries(cp.content).map(([k, v]) => (
                    <Pill key={k} style={{opacity: v ? 1 : 0.4, fontSize: 9.5}}>{k.replace("show_", "")}{v ? "" : " ✕"}</Pill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

window.BuddyWatcher = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Watcher rules" sub="evaluated nightly at 02:00 · Pro tier and up">
        <table className="tbl">
          <thead><tr><th style={{width: 210}}>Rule</th><th style={{width: 80}}>Level</th><th>Condition · current value</th><th style={{width: 70}}>Fires</th></tr></thead>
          <tbody>
            {WATCHER_RULES.map(r => (
              <tr key={r.id} style={r.fires ? {background: "color-mix(in srgb, var(--warn) 6%, transparent)"} : undefined}>
                <td className="mono" style={{fontSize: 11}}>{r.id}</td>
                <td><Pill variant={r.level === "critical" ? "block" : "warn"}>{r.level}</Pill></td>
                <td>
                  <div className="mono" style={{fontSize: 10.5, color: "var(--fg-muted)"}}>{r.cond}</div>
                  <div style={{fontSize: 11, marginTop: 2, color: r.fires ? "var(--warn)" : "var(--fg-dim)"}}>{r.now}</div>
                </td>
                <td>{r.fires ? <Pill variant="warn">yes</Pill> : <span className="dim">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Open alerts" sub="dedup 24 h · 3 dismissals downgrade the level">
        <div className="col-gap" style={{gap: 8}}>
          {WATCHER_ALERTS.map(a => {
            const col = a.level === "critical" ? "var(--neg)" : a.level === "warning" ? "var(--warn)" : "var(--fg-dim)";
            return (
              <div key={a.id} style={{display: "flex", gap: 12, padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, opacity: a.expires === "expired" ? 0.55 : 1}}>
                <div style={{width: 3, alignSelf: "stretch", background: col, borderRadius: 2}}/>
                <div style={{flex: 1}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                    <Pill style={{color: col, borderColor: `color-mix(in srgb, ${col} 35%, var(--border))`}}>{a.level}</Pill>
                    <Pill>{a.category}</Pill>
                    <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{a.created} · {a.expires}</span>
                  </div>
                  <div style={{fontSize: 12.5, lineHeight: 1.5}}>{a.message}</div>
                  {a.dismissCount > 0 && (
                    <div className="dim mono" style={{fontSize: 10, marginTop: 6}}>
                      dismissed {a.dismissCount}× · {a.dismissCount >= 3 ? "downgraded to info" : `${3 - a.dismissCount} more downgrades it`}
                    </div>
                  )}
                </div>
                <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                  <button className="btn btn-sm">Act</button>
                  <button className="btn btn-ghost btn-sm">Dismiss</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>

    <Card title="Watcher settings">
      <Row label="Runs" value="daily 02:00"/>
      <Row label="Minimum tier" value="Pro"/>
      <Row label="Dedup window" value="24 h per category"/>
      <Row label="Smart mute" value="3 dismissals → downgrade"/>
      <Row label="Alert TTL" value="48 h"/>
      <Row label="Critical delivery" value="push, bypasses quiet hours"/>
      <div className="divider"/>
      <div className="eyebrow" style={{marginBottom: 6}}>Quiet hours</div>
      <div className="mono" style={{fontSize: 13}}>22:00 — 06:00</div>
      <div className="dim" style={{fontSize: 11, marginTop: 4, lineHeight: 1.45}}>
        Warnings wait for the morning briefing. Critical alerts do not.
      </div>
    </Card>
  </div>
);

window.BuddyBSS = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card>
        <div style={{display: "flex", gap: 20, alignItems: "center", marginBottom: 16}}>
          <Ring value={BSS.total} max={100} color="var(--acc-buddy)" label="BSS" size={128} stroke={9}/>
          <div style={{flex: 1}}>
            <div className="eyebrow" style={{marginBottom: 6}}>Behavior Stability Score · {BSS.period.replace("_", " ")}</div>
            <div style={{fontSize: 17, fontWeight: 600, marginBottom: 6}}>
              {BSS.delta > 0 ? "+" : ""}{BSS.delta} versus the prior period
            </div>
            <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>
              Not how strong you are — how reliably you come back. Lapses are getting shorter: a setback used to cost five days,
              now it costs two.
            </div>
            <Pill variant="pos">{BSS.trend}</Pill>
          </div>
        </div>
        <div className="mono" style={{fontSize: 11, padding: 10, background: "var(--surface-2)", borderRadius: 6, color: "var(--fg-muted)"}}>
          {BSS.formula}
        </div>
      </Card>

      <Card title="Stability" sub={`sub-score ${BSS.stability.stability_score} · weight 0.6`}>
        <div className="col-gap" style={{gap: 10}}>
          {[
            ["Training consistency", BSS.stability.training_consistency],
            ["Nutrition adherence stability", BSS.stability.nutrition_adherence_stability],
            ["Recovery stability", BSS.stability.recovery_stability],
            ["Dropout events", BSS.stability.dropout_events.score, `${BSS.stability.dropout_events.count} in 90 d`],
            ["Bounceback time", BSS.stability.bounceback_time.score, `${BSS.stability.bounceback_time.avg_days} d avg`],
          ].map(([k, v, note]) => (
            <div key={k} style={{display: "grid", gridTemplateColumns: "200px 1fr 90px", gap: 10, alignItems: "center", fontSize: 11.5}}>
              <span className="muted">{k}</span>
              <Meter value={v} color={v >= 80 ? "var(--pos)" : v >= 65 ? "var(--warn)" : "var(--neg)"}/>
              <span className="num" style={{textAlign: "right"}}>{v}{note && <span className="dim" style={{fontSize: 10}}> · {note}</span>}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Goal alignment" sub={`sub-score ${BSS.alignment.alignment_score} · weight 0.4`}>
        <Row label="Training · target per week" value={`${BSS.alignment.training.target_per_week}`}/>
        <Row label="Training · actual average" value={`${BSS.alignment.training.actual_avg}`}/>
        <Row label="Training alignment" value={`${BSS.alignment.training.alignment}%`}/>
        <Row label="Protein target hit rate" value={`${BSS.alignment.nutrition.protein_target_hit_rate}%`}/>
        <Row label="Calorie target hit rate" value={`${BSS.alignment.nutrition.calorie_target_hit_rate}%`}/>
        <Row label="Body composition goal" value={BSS.alignment.body_composition.goal}/>
        <Row label="On track" value={BSS.alignment.body_composition.on_track ? "yes" : "no"}/>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 14}}>
      <Card title="90-day trend">
        <LineChart h={180} range={[45, 80]}
          xLabels={["","","Mar","","","Apr","","","","May","",""]}
          series={[{ data: BSS.history, color: "var(--acc-buddy)" }]}/>
        <div style={{display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span>Now <span className="num" style={{color: "var(--fg)"}}>{BSS.total}</span></span>
          <span>Prior <span className="num" style={{color: "var(--fg)"}}>{BSS.prior}</span></span>
          <span>Δ <span className="num" style={{color: "var(--pos)"}}>+{BSS.delta}</span></span>
        </div>
      </Card>
      <Card title="What moves it" sub="biggest levers right now">
        <div className="col-gap" style={{gap: 6}}>
          <div style={{padding: 10, background: "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 22%, var(--border))", borderRadius: 6, fontSize: 11.5, lineHeight: 1.5}}>
            <span style={{fontWeight: 600}}>Calorie target hit rate · 64%</span><br/>
            <span className="muted">The weakest input. Closing it to 80% would move BSS about 6 points.</span>
          </div>
          <div style={{padding: 10, background: "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 22%, var(--border))", borderRadius: 6, fontSize: 11.5, lineHeight: 1.5}}>
            <span style={{fontWeight: 600}}>Recovery stability · 66</span><br/>
            <span className="muted">Sleep variance drives this more than sleep length.</span>
          </div>
          <div style={{padding: 10, background: "color-mix(in srgb, var(--pos) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 22%, var(--border))", borderRadius: 6, fontSize: 11.5, lineHeight: 1.5}}>
            <span style={{fontWeight: 600}}>Bounceback · 2 days</span><br/>
            <span className="muted">Your strongest component. Protect it.</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

window.BuddySignature = () => (
  <div className="col-gap" style={{gap: 14}}>
    <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
      <Icon name="brain" className="ic" style={{color: "var(--acc-buddy)", flexShrink: 0, marginTop: 2}}/>
      <div style={{flex: 1}}>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Behavioral signature</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
          Patterns found in {SIGNATURE.eventCount} logged events across {SIGNATURE.weeksOfData} weeks. Detection needs at least {SIGNATURE.minWeeks} weeks,
          and only patterns above 0.5 confidence are kept. Everything here is visible to you and editable.
        </div>
      </div>
      <div style={{textAlign: "right"}}>
        <div className="num" style={{fontSize: 20}}>{SIGNATURE.patterns.filter(p => p.detected).length}</div>
        <div className="dim" style={{fontSize: 10}}>patterns held</div>
      </div>
    </div>

    <div className="grid g-cols-2" style={{gap: 12}}>
      {SIGNATURE.patterns.map(p => (
        <Card key={p.key} style={{opacity: p.detected ? 1 : 0.6}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap"}}>
            <span style={{fontSize: 13.5, fontWeight: 600}}>{p.label}</span>
            {p.detected ? <Pill variant="acc">detected</Pill> : <Pill>below threshold</Pill>}
            <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>n = {p.n}</span>
          </div>
          <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>{p.detail}</div>
          <div style={{display: "grid", gridTemplateColumns: "70px 1fr 44px", gap: 8, alignItems: "center", marginBottom: 8}}>
            <span className="eyebrow">Confidence</span>
            <Meter value={p.confidence * 100} color={p.confidence >= 0.7 ? "var(--acc-buddy)" : p.confidence >= 0.5 ? "var(--warn)" : "var(--fg-dim)"}/>
            <span className="num" style={{textAlign: "right", fontSize: 11.5}}>{(p.confidence * 100).toFixed(0)}%</span>
          </div>
          {p.detected && (
            <div style={{display: "flex", gap: 12, fontSize: 10.5, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
              <span>first {p.first}</span><span>last {p.last}</span>
              {p.pattern && <span style={{marginLeft: "auto"}}>{p.pattern}</span>}
            </div>
          )}
          {p.detected && (
            <div style={{display: "flex", gap: 6, marginTop: 10}}>
              <button className="btn btn-ghost btn-sm">That's not me</button>
              <button className="btn btn-ghost btn-sm">Explain</button>
            </div>
          )}
        </Card>
      ))}
    </div>
  </div>
);

window.BuddyInterventions = () => (
  <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Intervention log" sub="what I said, and whether it worked">
        <div className="col-gap" style={{gap: 8}}>
          {INTERVENTIONS.map(iv => {
            const eff = iv.effectiveness;
            const col = eff == null ? "var(--fg-dim)" : eff >= 0.7 ? "var(--pos)" : eff >= 0.4 ? "var(--warn)" : "var(--neg)";
            return (
              <div key={iv.id} style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
                  <span className="mono dim" style={{fontSize: 10}}>{iv.id}</span>
                  <Pill variant="acc">{iv.type}</Pill>
                  {iv.tone !== "—" && <Pill>{iv.tone}</Pill>}
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{iv.at}</span>
                </div>
                <div style={{fontSize: 12.5, lineHeight: 1.5, marginBottom: 8, fontStyle: iv.type === "silence" ? "italic" : "normal", color: iv.type === "silence" ? "var(--fg-dim)" : "var(--fg)"}}>
                  {iv.content}
                </div>
                <div className="mono dim" style={{fontSize: 10, marginBottom: 6}}>bucket · {iv.bucket}</div>
                <div style={{display: "grid", gridTemplateColumns: "auto auto 1fr 44px", gap: 10, alignItems: "center", fontSize: 11}}>
                  <span className="dim">expected <span style={{color: "var(--fg-muted)"}}>{iv.expected}</span></span>
                  <span className="dim">observed <span style={{color: iv.observed === "rejected" ? "var(--neg)" : "var(--fg-muted)"}}>{iv.observed}</span></span>
                  {eff != null ? <Meter value={eff * 100} color={col}/> : <div/>}
                  <span className="num" style={{textAlign: "right", color: col}}>{eff != null ? eff.toFixed(2) : "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 14}}>
      <Card title="Load budget" sub={`rolling ${INTERVENTION_LOAD.window}`}>
        <div className="col-gap" style={{gap: 12}}>
          {[
            ["Total interventions", INTERVENTION_LOAD.total, INTERVENTION_LOAD.max],
            ["Confrontations", INTERVENTION_LOAD.confrontations, INTERVENTION_LOAD.maxConfrontations],
            ["Identity statements", INTERVENTION_LOAD.identity, INTERVENTION_LOAD.maxIdentity],
          ].map(([k, v, max]) => (
            <div key={k}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11.5}}>
                <span className="muted">{k}</span>
                <span className="num">{v} / {max}</span>
              </div>
              <div style={{display: "flex", gap: 3}}>
                {Array.from({length: max}).map((_, i) => (
                  <div key={i} style={{flex: 1, height: 8, borderRadius: 2, background: i < v ? "var(--acc-buddy)" : "var(--surface-2)"}}/>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div className="muted" style={{fontSize: 11, lineHeight: 1.5}}>
          A hard ceiling. When the budget is spent, silence is the intervention — the engine picks it deliberately rather than
          running out of things to say.
        </div>
      </Card>

      <Card title="Types" sub="5 · with tone variants">
        <div className="col-gap" style={{gap: 4}}>
          {[
            ["confrontation", "names the gap directly"],
            ["encouragement", "reinforces what is working"],
            ["adjustment", "proposes a concrete change"],
            ["redirect", "moves effort somewhere better"],
            ["silence", "deliberately says nothing"],
          ].map(([t, d]) => (
            <div key={t} style={{display: "flex", gap: 10, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
              <span className="mono" style={{width: 108, color: "var(--acc-buddy)"}}>{t}</span>
              <span className="muted">{d}</span>
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div className="eyebrow" style={{marginBottom: 6}}>Tone variants</div>
        <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
          {["direct","soft","humorous","analytical","tough_love"].map(t => <Pill key={t}>{t}</Pill>)}
        </div>
      </Card>
    </div>
  </div>
);

window.BuddySafety = () => (
  <div className="col-gap" style={{gap: 14}}>
    <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--neg) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 22%, var(--border))", borderRadius: 8}}>
      <Icon name="shield" className="ic" style={{color: "var(--neg)", flexShrink: 0, marginTop: 2}}/>
      <div style={{flex: 1}}>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Policy gate</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
          Every response passes server-side review before it reaches you: <span className="mono">PASS</span>,
          <span className="mono"> REDACT</span> (rewritten) or <span className="mono">BLOCK</span> (replaced with a safe redirect).
          These nine rules cannot be turned off by any tier, coach or gym.
        </div>
      </div>
    </div>

    <Card title="Immutable rules" sub="9">
      <table className="tbl">
        <thead><tr><th style={{width: 250}}>Rule</th><th>What it means</th></tr></thead>
        <tbody>
          {SAFETY_RULES.map(r => (
            <tr key={r.rule}>
              <td style={{fontSize: 12.5, fontWeight: 500}}>{r.rule}</td>
              <td className="muted" style={{fontSize: 11.5}}>{r.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>

    <Card title="Gate log" sub="what the gate changed">
      <div className="col-gap" style={{gap: 8}}>
        {GATE_LOG.map((g, i) => {
          const col = g.verdict === "BLOCK" ? "var(--neg)" : g.verdict === "REDACT" ? "var(--warn)" : "var(--pos)";
          return (
            <div key={i} style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                <Pill style={{color: col, borderColor: `color-mix(in srgb, ${col} 35%, var(--border))`, background: `color-mix(in srgb, ${col} 8%, transparent)`}}>{g.verdict}</Pill>
                {g.reason !== "—" && <Pill className="mono" style={{fontSize: 9.5}}>{g.reason}</Pill>}
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{g.at}</span>
              </div>
              {g.before !== "—" && (
                <div style={{marginBottom: 8}}>
                  <div className="eyebrow" style={{marginBottom: 3, color: "var(--neg)"}}>Model wanted to say</div>
                  <div style={{fontSize: 12, lineHeight: 1.5, color: "var(--fg-muted)", textDecoration: "line-through", textDecorationColor: "color-mix(in srgb, var(--neg) 50%, transparent)"}}>{g.before}</div>
                </div>
              )}
              <div>
                <div className="eyebrow" style={{marginBottom: 3, color: "var(--pos)"}}>You received</div>
                <div style={{fontSize: 12, lineHeight: 1.5}}>{g.after}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

window.BuddyButler = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Recent actions" sub="intent → confidence → preview → write">
        <div className="col-gap" style={{gap: 8}}>
          {BUTLER_LOG.map((b, i) => {
            const col = b.status === "clarification" ? "var(--warn)" : "var(--pos)";
            return (
              <div key={i} style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                  <Pill className="mono" style={{fontSize: 9.5}}>{b.intent}</Pill>
                  <Pill style={{color: b.conf >= 0.8 ? "var(--pos)" : "var(--warn)"}}>conf {b.conf.toFixed(2)}</Pill>
                  <Pill style={{color: col, borderColor: `color-mix(in srgb, ${col} 35%, var(--border))`}}>{b.status}</Pill>
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{b.at}</span>
                </div>
                <div style={{fontSize: 12.5, marginBottom: 6}}>&ldquo;{b.said}&rdquo;</div>
                <div className="mono" style={{fontSize: 11, color: "var(--fg-muted)"}}>{b.result}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Confidence threshold" sub="below 0.80 I ask instead of acting">
        <div style={{position: "relative", height: 28, borderRadius: 5, overflow: "hidden", display: "flex", border: "1px solid var(--border)", marginBottom: 8}}>
          <div style={{width: "80%", background: "var(--warn)", opacity: 0.35, display: "grid", placeItems: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg)"}}>ask back</div>
          <div style={{width: "20%", background: "var(--pos)", opacity: 0.35, display: "grid", placeItems: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg)"}}>execute</div>
          <div style={{position: "absolute", left: "80%", top: -3, bottom: -3, width: 2, background: "var(--fg)"}}/>
        </div>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
          <span>0.00</span><span>0.80 threshold</span><span>1.00</span>
        </div>
        <div className="divider"/>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
          Meals always show a preview before writing, regardless of confidence — quantities are too easy to get wrong.
        </div>
      </Card>
    </div>

    <Card title="What I can write" sub="6 intents · each targets one module">
      <div className="col-gap" style={{gap: 6}}>
        {BUTLER_INTENTS.map(i => (
          <div key={i.type} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
              <span className="mono" style={{fontSize: 11, color: "var(--acc-buddy)"}}>{i.type}</span>
              <Pill style={{fontSize: 9.5}}>{i.target}</Pill>
              {i.preview && <Pill variant="warn" style={{fontSize: 9.5}}>preview first</Pill>}
            </div>
            <div className="dim" style={{fontSize: 11, fontStyle: "italic"}}>&ldquo;{i.ex}&rdquo;</div>
          </div>
        ))}
      </div>
      <div className="divider"/>
      <div className="muted" style={{fontSize: 11, lineHeight: 1.5}}>
        Every write goes through the module's own API with your user id — never a direct database write.
      </div>
    </Card>
  </div>
);

Object.assign(window, { TIERS, GATED_FEATURES, hasFeature, AI_PATHS, ENGINES, CHECKPOINTS, WATCHER_RULES, BSS, SIGNATURE, INTERVENTIONS, SAFETY_RULES, BUTLER_INTENTS, CRON_JOBS });
