// Coach module · extras — Performance Analytics, Visual Rule Builder, Autonomy System,
// Multi-dim Adherence, Role-based Access, Audit Log

// ── Autonomy levels (D8) ──────────────────────────────
const AUTONOMY_LEVELS = [
  { lvl: 1, key: "novice",      name: "Novice",       desc: "Hand-holding · daily guidance · strict adherence",                 cadence: "daily",      style: "directive",     threshold: "any deviation" },
  { lvl: 2, key: "beginner",    name: "Beginner",     desc: "Learning · weekly check-ins · structured plans",                  cadence: "weekly",     style: "guided",        threshold: "significant deviation" },
  { lvl: 3, key: "intermediate",name: "Intermediate", desc: "Growing · bi-weekly reviews · guided flexibility",                cadence: "bi-weekly",  style: "collaborative", threshold: "significant trends" },
  { lvl: 4, key: "advanced",    name: "Advanced",     desc: "Self-directed · monthly coaching · high independence",            cadence: "monthly",    style: "consultative",  threshold: "warning signs only" },
  { lvl: 5, key: "expert",      name: "Expert",       desc: "Mentor-ready · quarterly reviews · peer mentoring",               cadence: "quarterly",  style: "advisory",      threshold: "safety only" },
];

// Per-athlete autonomy data (mock)
const ATHLETE_AUTONOMY = {
  a1:  { level: 4, trend: "stable", since: "8mo", canProgress: true,  recommendation: "Hold · stable at Advanced for 8 months" },
  a2:  { level: 2, trend: "up",     since: "2mo", canProgress: true,  recommendation: "Ready to progress to Intermediate · 3 weeks of stability" },
  a3:  { level: 5, trend: "stable", since: "1y",  canProgress: false, recommendation: "Top of framework · mentor candidate" },
  a4:  { level: 1, trend: "stable", since: "3mo", canProgress: false, recommendation: "Hold · still learning fundamentals" },
  a5:  { level: 4, trend: "stable", since: "10mo", canProgress: true, recommendation: "Stable · could promote with more structured planning" },
  a6:  { level: 3, trend: "up",     since: "5mo", canProgress: false, recommendation: "Progressing well · 2 months from next level" },
  a7:  { level: 2, trend: "down",   since: "4mo", canProgress: false, recommendation: "Regression risk · compliance dropped 12pp" },
  a8:  { level: 3, trend: "stable", since: "2mo", canProgress: false, recommendation: "Building consistency at Intermediate" },
  a9:  { level: 4, trend: "stable", since: "1y",  canProgress: false, recommendation: "Comfortable at Advanced" },
  a10: { level: 2, trend: "down",   since: "3mo", canProgress: false, recommendation: "Watch · stability score dropping" },
  a11: { level: 4, trend: "up",     since: "2y",  canProgress: true,  recommendation: "Endurance specialist · could progress to Expert" },
  a12: { level: 2, trend: "stable", since: "6mo", canProgress: false, recommendation: "Comfortable Beginner · no rush" },
  a13: { level: 4, trend: "up",     since: "8mo", canProgress: true,  recommendation: "Self-driven · primed for Expert" },
  a14: { level: 1, trend: "up",     since: "2mo", canProgress: false, recommendation: "Promising start · check in 4 more weeks" },
};

// ── Rule builder fixtures ─────────────────────────────
const RULE_TRIGGERS = [
  { id: "threshold", label: "Data threshold",   icon: "trend_up", desc: "When a metric crosses a value" },
  { id: "trend",     label: "Trend detection",  icon: "trend_up", desc: "When a trend changes direction" },
  { id: "time",      label: "Time-based",       icon: "calendar", desc: "On schedule or deadline" },
  { id: "event",     label: "Event-based",      icon: "bolt",     desc: "When a specific event occurs" },
  { id: "compare",   label: "Comparison",       icon: "layers",   desc: "Versus baseline or peer" },
];

const RULE_TEMPLATES = [
  { id: "t1", name: "Adherence decline detection",   cat: "Nutrition",  diff: "beginner",   downloads: 412, rating: 4.8, desc: "Alerts when nutrition adherence drops 15+ points in any 7-day window" },
  { id: "t2", name: "Overtraining risk · 3-strike",  cat: "Training",   diff: "advanced",   downloads: 286, rating: 4.9, desc: "Recovery < 65 + sleep < 6h + RPE > 8 over 3 days = critical alert" },
  { id: "t3", name: "Plateau identification",         cat: "Training",   diff: "intermediate", downloads: 198, rating: 4.7, desc: "PR detection stalled for 14 days, suggests deload" },
  { id: "t4", name: "Goal deadline reminder",         cat: "General",    diff: "beginner",   downloads: 540, rating: 4.6, desc: "30/7/2 day warnings before goal deadline if {`<`} 70% complete" },
  { id: "t5", name: "Achievement celebration",        cat: "General",    diff: "beginner",   downloads: 380, rating: 4.5, desc: "Auto-celebrate PRs, streaks, milestones · client + coach notified" },
  { id: "t6", name: "Sleep-debt accumulation",        cat: "Recovery",   diff: "intermediate", downloads: 144, rating: 4.7, desc: "Cumulative sleep debt > 4 hours over 7 days triggers wellness check" },
];

const ACTIVE_RULES = [
  { id: "r1", name: "Overtraining risk", template: "t2", assignedTo: 11, fired: 3, falsePositives: 0, lastFired: "today 06:14", active: true, severity: "CRITICAL" },
  { id: "r2", name: "Adherence decline (nutrition)", template: "t1", assignedTo: 14, fired: 8, falsePositives: 1, lastFired: "yesterday 11:30", active: true, severity: "HIGH" },
  { id: "r3", name: "Missed sessions · 2x in a week", template: null, assignedTo: 14, fired: 4, falsePositives: 0, lastFired: "Mon", active: true, severity: "MEDIUM" },
  { id: "r4", name: "PR celebration", template: "t5", assignedTo: 14, fired: 12, falsePositives: 0, lastFired: "today 06:30", active: true, severity: "INFO" },
  { id: "r5", name: "Goal deadline · 7d warning", template: "t4", assignedTo: 8, fired: 2, falsePositives: 0, lastFired: "Tue", active: true, severity: "LOW" },
  { id: "r6", name: "Sleep debt", template: "t6", assignedTo: 14, fired: 1, falsePositives: 0, lastFired: "Apr 28", active: false, severity: "MEDIUM" },
];

// ── Smart alerts (D6) — 5-severity with intelligence layer ─
const SMART_ALERTS = [
  { id: "AL-018", severity: "CRITICAL", athlete: "Sophie Klein", aid: "a2",  type: "Overtraining risk", title: "3-day pattern · recovery 58 + sleep 5.8h + RPE 8.5",
    why: "Sophie's combined metrics breached the Overtraining Risk rule for 3 consecutive days.",
    confidence: 0.91, fpRisk: 0.04, predicted: "Performance decline + injury risk if pattern continues 7+ days",
    similarCases: 4, age: "12m ago", expires: "in 4h" },
  { id: "AL-017", severity: "HIGH", athlete: "Elena Schmidt", aid: "a4", type: "Adherence decline",
    title: "Nutrition adherence dropped to 62% (was 82%)",
    why: "7-day moving average fell 20pp. Coincides with travel period (Apr 28 → May 4).",
    confidence: 0.78, fpRisk: 0.12, predicted: "Stalled body-comp goal · regression risk for autonomy level",
    similarCases: 11, age: "1h ago", expires: "in 23h" },
  { id: "AL-016", severity: "HIGH", athlete: "Daniel Vogel", aid: "a9", type: "Missed sessions",
    title: "2 sessions missed in current week (Wed, Sat)",
    why: "Pattern · skipped accessory work in Block 2. RPE on logged sessions 9.2 (high).",
    confidence: 0.84, fpRisk: 0.08, predicted: "Linear regression incomplete · risks plateau",
    similarCases: 3, age: "3h ago" },
  { id: "AL-015", severity: "MEDIUM", athlete: "Mira Stahl", aid: "a10", type: "Sleep-debt",
    title: "Cumulative sleep debt 5.2h over 7 days",
    why: "5 nights below 6.5h. Recovery score correlated drop (78 → 64).",
    confidence: 0.72, fpRisk: 0.15, predicted: "Compounding fatigue, may affect Wed PR attempt",
    similarCases: 7, age: "5h ago" },
  { id: "AL-014", severity: "MEDIUM", athlete: "Anna Frey", aid: "a12", type: "Compliance",
    title: "Compliance trending down 4 weeks (92 → 79)",
    why: "Gradual decline · no single event. Communication frequency also down.",
    confidence: 0.66, fpRisk: 0.22, predicted: "Possible disengagement · proactive outreach recommended",
    similarCases: 9, age: "yesterday" },
  { id: "AL-013", severity: "LOW", athlete: "Carla Roth", aid: "a8", type: "Goal deadline",
    title: "Body comp goal · 14 days remaining · 78% complete",
    why: "On pace but margin shrinking. Worth a check-in.",
    confidence: 0.55, fpRisk: 0.30, predicted: "Likely to miss target by 2-3 percentage points if pace holds",
    similarCases: 5, age: "yesterday" },
  { id: "AL-012", severity: "INFO", athlete: "Marcus Weber", aid: "a3", type: "PR achieved",
    title: "Deadlift PR · 220 kg ×1 (previous 215 kg)",
    why: "Block 4 progression on schedule. Form rating 4.8/5 from auto-check.",
    confidence: 1.0, fpRisk: 0, predicted: "Celebration + bench progression unlock recommended",
    similarCases: null, age: "today 06:30" },
];

// ── Multi-dim adherence (D9) ──────────────────────────
function adherenceProfile(seed = 1) {
  const rand = (a) => Math.round((Math.sin(a * 13.7 + seed * 31.3) * 0.4 + 0.7) * 100);
  return {
    overall: rand(1),
    nutrition: {
      caloric: rand(2), protein: rand(3), carbs: rand(4), fat: rand(5),
      timing: rand(6), quality: rand(7), hydration: rand(8),
    },
    training: {
      frequency: rand(9), intensity: rand(10), volume: rand(11),
      progression: rand(12), form: rand(13),
    },
    recovery: {
      sleepDuration: rand(14), sleepQuality: rand(15), sleepConsistency: rand(16),
      checkins: rand(17), modalities: rand(18), stress: rand(19),
    },
    supplements: { timing: rand(20), dosage: rand(21), consistency: rand(22), interactions: 100 },
    lifestyle: { checkins: rand(23), goals: rand(24), planning: rand(25), flexibility: rand(26) },
  };
}

// ── Roles (RBAC) ──────────────────────────────────────
const COACH_ROLES = [
  { id: "head",   label: "Head Coach", caps: { all: true, billing: true, team: true, advAnalytics: true } },
  { id: "senior", label: "Senior Coach", caps: { assignedPlusTeam: true, dataExport: true, ownRules: true, stdAnalytics: true } },
  { id: "coach",  label: "Coach", caps: { assignedOnly: true, dataExportLimited: true, templatesOnly: true, basicAnalytics: true } },
];

const TEAM_MEMBERS = [
  { id: "tm1", name: "Tom Müller (you)",    role: "head",   athletes: 14, since: "2 yr",  rating: 4.9 },
  { id: "tm2", name: "Erik Lange",           role: "senior", athletes: 8,  since: "1 yr",  rating: 4.7 },
  { id: "tm3", name: "Hanna Brodersen",     role: "senior", athletes: 6,  since: "8 mo",  rating: 4.8 },
  { id: "tm4", name: "Paul Reinhardt",      role: "coach",  athletes: 4,  since: "3 mo",  rating: 4.5 },
  { id: "tm5", name: "Carla Vogt",          role: "coach",  athletes: 5,  since: "5 mo",  rating: 4.6 },
];

// ── Audit log ─────────────────────────────────────────
const COACH_AUDIT = [
  { ts: "2026-05-16 14:22", who: "Tom (head)",      action: "viewed Sophie Klein · Training",       cat: "data-access" },
  { ts: "2026-05-16 11:48", who: "Hanna (senior)",  action: "exported PDF report · Lukas Bauer",    cat: "export" },
  { ts: "2026-05-16 09:14", who: "Tom (head)",      action: "added rule 'Overtraining risk · 3-strike'", cat: "rule" },
  { ts: "2026-05-15 17:32", who: "Paul (coach)",    action: "messaged Niko Brandt",                  cat: "comm" },
  { ts: "2026-05-15 16:08", who: "Tom (head)",      action: "promoted Sophie Klein autonomy 1 → 2",  cat: "autonomy" },
  { ts: "2026-05-14 12:42", who: "Erik (senior)",   action: "viewed Lea Hartmann · Recovery",        cat: "data-access" },
  { ts: "2026-05-13 19:18", who: "Tom (head)",      action: "approved Carla Vogt as Coach",          cat: "team" },
  { ts: "2026-05-12 08:00", who: "system",          action: "auto-fired alert AL-014 (Anna Frey)",   cat: "alert" },
];

// ── Analytics fixtures ────────────────────────────────
const COACH_KPIS = {
  retention90d: { value: 92, benchmark: 78, trend: "up" },
  satisfactionAvg: { value: 4.8, response: 0.84 },
  goalCompletion: { rate: 87, onTime: 71 },
  autonomyProgression: { avgLevelIncrease: 0.4, clientsProgressed: 6 },
  responseTime: { avg: 1.8, target: 4, percentile: 92 },
  alertResolution: { avg: 4.2, rate: 96 },
  proactiveInterventions: { count: 23, successRate: 78 },
  revenuePerClient: 344,
  ltv: 4280,
  referralRate: 0.21,
  expansion: 1840,
};

// ── COMPONENTS ────────────────────────────────────────

const CoachPortalAnalytics = () => (
  <div>
    <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Retention · 90d</div><div className="num" style={{fontSize: 22, color: "var(--pos)"}}>{COACH_KPIS.retention90d.value}%</div><div className="dim" style={{fontSize: 11}}>vs. {COACH_KPIS.retention90d.benchmark}% benchmark · +14pp</div></Card>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Avg satisfaction</div><div className="num" style={{fontSize: 22}}>{COACH_KPIS.satisfactionAvg.value} ★</div><div className="dim" style={{fontSize: 11}}>{Math.round(COACH_KPIS.satisfactionAvg.response * 100)}% response rate</div></Card>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Goal completion</div><div className="num" style={{fontSize: 22, color: "var(--pos)"}}>{COACH_KPIS.goalCompletion.rate}%</div><div className="dim" style={{fontSize: 11}}>{COACH_KPIS.goalCompletion.onTime}% on time</div></Card>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Avg autonomy gain</div><div className="num" style={{fontSize: 22}}>+{COACH_KPIS.autonomyProgression.avgLevelIncrease}</div><div className="dim" style={{fontSize: 11}}>{COACH_KPIS.autonomyProgression.clientsProgressed} athletes progressed 90d</div></Card>
    </div>
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14}}>
      <Card title="Coach efficiency" sub="vs. targets">
        <Row label="Avg response time" value={`${COACH_KPIS.responseTime.avg}h · target ${COACH_KPIS.responseTime.target}h`} />
        <Row label="Response percentile (Lumeos)" value={`P${COACH_KPIS.responseTime.percentile}`} />
        <Row label="Alert resolution time" value={`${COACH_KPIS.alertResolution.avg}h avg`} />
        <Row label="Alert resolution rate" value={`${COACH_KPIS.alertResolution.rate}%`} />
        <Row label="Proactive interventions · 30d" value={`${COACH_KPIS.proactiveInterventions.count} · ${COACH_KPIS.proactiveInterventions.successRate}% success`} />
        <div className="divider" />
        <div className="eyebrow" style={{marginBottom: 8}}>Response time · 30d</div>
        <LineChart h={120} range={[1, 5]} xLabels={["wk-4","wk-3","wk-2","wk-1","now"]} series={[
          { data: [3.8, 2.9, 2.4, 2.0, 1.8], color: "var(--pos)" },
          { data: [4, 4, 4, 4, 4], color: "var(--fg-dim)" }
        ]} />
      </Card>
      <Card title="Business impact">
        <Row label="Revenue per client / mo" value={`€${COACH_KPIS.revenuePerClient}`} />
        <Row label="Client LTV" value={`€${COACH_KPIS.ltv.toLocaleString()}`} />
        <Row label="Referral rate" value={`${Math.round(COACH_KPIS.referralRate * 100)}%`} />
        <Row label="Expansion revenue · 90d" value={`€${COACH_KPIS.expansion.toLocaleString()}`} />
        <div className="divider" />
        <div className="eyebrow" style={{marginBottom: 8}}>LTV trend · 12 mo</div>
        <Sparkline data={[3200, 3320, 3400, 3520, 3680, 3780, 3920, 4020, 4100, 4180, 4220, 4280]} color="var(--acc-mkt)" h={50} />
      </Card>
    </div>
    <Card title="Adherence per dimension · across all athletes" sub="14-athlete average">
      <div className="col-gap" style={{gap: 8}}>
        {[
          { dim: "Nutrition · caloric", v: 88 },
          { dim: "Nutrition · macro split", v: 84 },
          { dim: "Nutrition · timing", v: 76 },
          { dim: "Training · frequency", v: 92 },
          { dim: "Training · intensity (RPE)", v: 81 },
          { dim: "Training · progression", v: 87 },
          { dim: "Recovery · sleep duration", v: 78 },
          { dim: "Recovery · check-ins", v: 91 },
          { dim: "Supplements · timing", v: 89 },
          { dim: "Lifestyle · planning", v: 73 },
        ].map(r => (
          <div key={r.dim} style={{display: "grid", gridTemplateColumns: "210px 1fr 50px", gap: 10, alignItems: "center", fontSize: 11.5}}>
            <span style={{color: "var(--fg-muted)"}}>{r.dim}</span>
            <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}>
              <div style={{height: "100%", width: `${r.v}%`, background: r.v >= 85 ? "var(--pos)" : r.v >= 70 ? "var(--warn)" : "var(--neg)", borderRadius: 999}} />
            </div>
            <span className="num" style={{textAlign: "right", color: r.v >= 85 ? "var(--pos)" : r.v >= 70 ? "var(--warn)" : "var(--neg)"}}>{r.v}%</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const CoachPortalRules = () => {
  const [tab, setTab] = useState("active");
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["active","Active rules"],["templates","Marketplace"],["builder","Visual builder"],["history","Fire history"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={tab === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
        <div className="spacer" />
        <button className="btn"><Icon name="download" className="ic ic-sm"/>Export rules</button>
        <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>New rule</button>
      </div>
      {tab === "active"    && <ActiveRulesView/>}
      {tab === "templates" && (window.RuleTemplatesSpec ? <window.RuleTemplatesSpec/> : <RuleMarketplaceView/>)}
      {tab === "builder"   && <VisualRuleBuilder/>}
      {tab === "history"   && <RuleHistoryView/>}
    </div>
  );
};

const ActiveRulesView = () => (
  <Card>
    <table className="tbl">
      <thead>
        <tr>
          <th>Rule</th>
          <th style={{width: 90}}>Severity</th>
          <th style={{width: 90, textAlign: "right"}}>Athletes</th>
          <th style={{width: 80, textAlign: "right"}}>Fired (7d)</th>
          <th style={{width: 90, textAlign: "right"}}>FP rate</th>
          <th style={{width: 130}}>Last fired</th>
          <th style={{width: 70}}>Status</th>
          <th style={{width: 30}}></th>
        </tr>
      </thead>
      <tbody>
        {ACTIVE_RULES.map(r => (
          <tr key={r.id} className="clickable" style={{cursor: "pointer"}} onClick={() => window.dispatchEvent(new CustomEvent("coach-modal", {detail: {type: "ruleEdit", payload: r}}))}>
            <td>
              <div style={{fontSize: 12.5, fontWeight: 500}}>{r.name}</div>
              {r.template && <div className="dim mono" style={{fontSize: 10}}>from template · {r.template}</div>}
            </td>
            <td><SevPill sev={r.severity}/></td>
            <td className="num" style={{textAlign: "right"}}>{r.assignedTo}</td>
            <td className="num" style={{textAlign: "right"}}>{r.fired}</td>
            <td className="num muted" style={{textAlign: "right"}}>{r.fired > 0 ? Math.round((r.falsePositives / r.fired) * 100) : 0}%</td>
            <td className="num muted">{r.lastFired}</td>
            <td>{r.active ? <Pill variant="pos" dot>active</Pill> : <Pill>off</Pill>}</td>
            <td><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const SevPill = ({ sev }) => {
  const map = {
    CRITICAL: { color: "var(--neg)", label: "CRITICAL" },
    HIGH:     { color: "var(--warn)", label: "HIGH" },
    MEDIUM:   { color: "var(--acc-recov)", label: "MEDIUM" },
    LOW:      { color: "var(--fg-dim)", label: "LOW" },
    INFO:     { color: "var(--acc-coach)", label: "INFO" },
  };
  const m = map[sev] || map.LOW;
  return <Pill style={{borderColor: `color-mix(in oklch, ${m.color} 35%, var(--border))`, color: m.color, background: `color-mix(in oklch, ${m.color} 8%, transparent)`}}>{m.label}</Pill>;
};

const RuleMarketplaceView = () => (
  <div className="grid g-cols-2" style={{gap: 12}}>
    {RULE_TEMPLATES.map(t => (
      <Card key={t.id} style={{cursor: "pointer"}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
          <span style={{fontSize: 13.5, fontWeight: 600}}>{t.name}</span>
          <Pill>{t.cat}</Pill>
          <Pill>{t.diff}</Pill>
          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{t.downloads} ↓ · {t.rating} ★</span>
        </div>
        <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>{t.desc}</div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-primary btn-sm"><Icon name="plus" className="ic ic-sm"/>Install</button>
          <button className="btn btn-ghost btn-sm">Preview</button>
          <button className="btn btn-ghost btn-sm">Reviews</button>
        </div>
      </Card>
    ))}
  </div>
);

const VisualRuleBuilder = () => (
  <div className="grid" style={{gridTemplateColumns: "260px 1fr 280px", gap: 12}}>
    <Card title="Building blocks" sub="drag to canvas">
      <div className="eyebrow" style={{marginBottom: 6}}>Triggers</div>
      <div className="col-gap" style={{gap: 4, marginBottom: 12}}>
        {RULE_TRIGGERS.map(t => (
          <div key={t.id} style={{display: "flex", alignItems: "center", gap: 8, padding: 8, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, cursor: "grab", fontSize: 11.5}}>
            <Icon name={t.icon} className="ic ic-sm" style={{color: "var(--acc-coach)"}}/>
            {t.label}
          </div>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Actions</div>
      <div className="col-gap" style={{gap: 4}}>
        {["Alert", "Email", "SMS", "Plan adjust", "Schedule call", "Escalate"].map(a => (
          <div key={a} style={{padding: 8, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, cursor: "grab", fontSize: 11.5}}>{a}</div>
        ))}
      </div>
    </Card>
    <Card title="Rule canvas" sub="Overtraining risk · 3-strike" actions={<><button className="btn btn-ghost btn-sm">Save draft</button><button className="btn btn-primary btn-sm">Activate</button></>}>
      <div className="col-gap" style={{gap: 0}}>
        <RuleBlock label="WHEN · ALL of (3 days)" color="var(--acc-coach)">
          <RuleCondition field="recovery_score" op="<" value="65" tf="3 consecutive days"/>
          <RuleCondition field="sleep_hours"    op="<" value="6"  tf="3 consecutive days"/>
          <RuleCondition field="rpe_avg"        op=">" value="8.0" tf="last session"/>
        </RuleBlock>
        <div style={{textAlign: "center", padding: "4px 0", color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: 11}}>AND</div>
        <RuleBlock label="ONLY IF" color="var(--acc-buddy)">
          <RuleCondition field="autonomy_level" op="≤" value="3"/>
          <RuleCondition field="tags"           op="includes" value="powerlifter, intermediate"/>
        </RuleBlock>
        <div style={{textAlign: "center", padding: "8px 0", color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: 11}}>THEN</div>
        <RuleBlock label="ACTIONS" color="var(--acc-train)">
          <RuleAction action="Create alert" arg="severity = CRITICAL"/>
          <RuleAction action="SMS coach" arg="bypass quiet hours"/>
          <RuleAction action="Suggest plan adjustment" arg="deload recommendation"/>
          <RuleAction action="Schedule check-in call" arg="within 24h"/>
        </RuleBlock>
      </div>
      <div className="divider"/>
      <div style={{display: "flex", gap: 14, fontSize: 11, color: "var(--fg-muted)", flexWrap: "wrap"}}>
        <span>Estimated frequency: <span className="num" style={{color: "var(--fg)"}}>~2-4 fires / month</span></span>
        <span>Test on historical: <span className="num" style={{color: "var(--fg)"}}>would have fired 4× · 0 false positives</span></span>
      </div>
    </Card>
    <Card title="Settings">
      <div className="eyebrow" style={{marginBottom: 6}}>Segmentation</div>
      <div className="col-gap" style={{gap: 6, marginBottom: 14}}>
        <SegToggle label="Autonomy ≤ 3 only" on={true}/>
        <SegToggle label="Exclude new clients (< 2w)" on={true}/>
        <SegToggle label="Exclude vacation periods" on={true}/>
        <SegToggle label="Weekdays only" on={false}/>
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Schedule</div>
      <div className="col-gap" style={{gap: 6, marginBottom: 14}}>
        <Row label="Check frequency" value="hourly"/>
        <Row label="Grace period (new client)" value="2 weeks"/>
        <Row label="Quiet hours" value="22:00 — 06:00"/>
        <Row label="Critical bypass" value="yes"/>
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Escalation</div>
      <div className="col-gap" style={{gap: 6}}>
        <Row label="After 4h unhandled" value="→ Senior Coach"/>
        <Row label="After 24h" value="→ Head Coach"/>
      </div>
    </Card>
  </div>
);

const RuleBlock = ({ label, color, children }) => (
  <div style={{
    border: `1px solid color-mix(in oklch, ${color} 35%, var(--border))`,
    background: `color-mix(in oklch, ${color} 5%, var(--surface))`,
    borderRadius: 8, padding: 10
  }}>
    <div style={{
      fontSize: 10, fontFamily: "var(--font-mono)", color,
      textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: 8
    }}>{label}</div>
    <div className="col-gap" style={{gap: 4}}>{children}</div>
  </div>
);

const RuleCondition = ({ field, op, value, tf }) => (
  <div style={{display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, fontFamily: "var(--font-mono)"}}>
    <span style={{color: "var(--fg)"}}>{field}</span>
    <span className="dim">{op}</span>
    <span style={{color: "var(--acc-train)"}}>{value}</span>
    {tf && <span className="dim" style={{marginLeft: "auto"}}>{tf}</span>}
  </div>
);

const RuleAction = ({ action, arg }) => (
  <div style={{display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
    <Icon name="bolt" className="ic ic-sm" style={{color: "var(--acc-train)"}}/>
    <span>{action}</span>
    {arg && <span className="dim mono" style={{fontSize: 10.5, marginLeft: "auto"}}>{arg}</span>}
  </div>
);

const SegToggle = ({ label, on }) => (
  <div style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
    <span style={{flex: 1}}>{label}</span>
    <div style={{display: "flex", background: on ? "var(--pos)" : "var(--surface-2)", borderRadius: 999, width: 26, height: 14, padding: 1}}>
      <div style={{width: 12, height: 12, borderRadius: 999, background: "var(--bg)", marginLeft: on ? 12 : 0}}/>
    </div>
  </div>
);

const RuleHistoryView = () => (
  <Card title="Rule fire history · 30 days" sub="all rules · click for context">
    <table className="tbl">
      <thead><tr><th style={{width: 130}}>When</th><th>Rule</th><th>Athlete</th><th style={{width: 100}}>Severity</th><th style={{width: 110}}>Outcome</th></tr></thead>
      <tbody>
        {[
          ["today 06:14",  "Overtraining risk",         "Sophie Klein",  "CRITICAL", "resolved 1.8h"],
          ["yesterday 11:30","Adherence decline",        "Elena Schmidt", "HIGH",     "in progress"],
          ["Mon 14:22",    "Missed sessions · 2x",       "Daniel Vogel",  "MEDIUM",   "resolved · plan adjusted"],
          ["today 06:30",  "PR celebration",             "Marcus Weber",  "INFO",     "acknowledged"],
          ["Tue 09:14",    "Goal deadline · 7d",         "Niko Brandt",   "LOW",      "scheduled"],
          ["Apr 28",       "Sleep debt",                 "Mira Stahl",    "MEDIUM",   "resolved 6h"],
          ["Apr 24",       "Overtraining risk",          "Lukas Bauer",   "CRITICAL", "false positive"],
        ].map((r, i) => (
          <tr key={i}>
            <td className="num muted">{r[0]}</td>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
            <td><SevPill sev={r[3]}/></td>
            <td><Pill variant={r[4].startsWith("resolved") ? "pos" : r[4].includes("false") ? "block" : "warn"}>{r[4]}</Pill></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

// ── Smart Alerts View (D6) ─────────────────────────────
const CoachPortalSmartAlerts = () => {
  const [sevFilter, setSevFilter] = useState("all");
  const filtered = sevFilter === "all" ? SMART_ALERTS : SMART_ALERTS.filter(a => a.severity === sevFilter);
  const counts = {
    CRITICAL: SMART_ALERTS.filter(a => a.severity === "CRITICAL").length,
    HIGH: SMART_ALERTS.filter(a => a.severity === "HIGH").length,
    MEDIUM: SMART_ALERTS.filter(a => a.severity === "MEDIUM").length,
    LOW: SMART_ALERTS.filter(a => a.severity === "LOW").length,
    INFO: SMART_ALERTS.filter(a => a.severity === "INFO").length,
  };
  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Open alerts</div>
          <div className="num" style={{fontSize: 22}}>{SMART_ALERTS.length}</div>
          <div className="dim" style={{fontSize: 10}}>last 24h</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Avg confidence</div>
          <div className="num" style={{fontSize: 22}}>{Math.round(SMART_ALERTS.reduce((s, a) => s + a.confidence, 0) / SMART_ALERTS.length * 100)}%</div>
          <div className="dim" style={{fontSize: 10}}>ML score</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Avg FP risk</div>
          <div className="num" style={{fontSize: 22}}>{Math.round(SMART_ALERTS.reduce((s, a) => s + a.fpRisk, 0) / SMART_ALERTS.length * 100)}%</div>
          <div className="dim" style={{fontSize: 10}}>false-positive likelihood</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Resolution · 7d</div>
          <div className="num" style={{fontSize: 22, color: "var(--pos)"}}>96%</div>
          <div className="dim" style={{fontSize: 10}}>resolved within target</div>
        </Card>
      </div>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap"}}>
        <span className="eyebrow">Severity</span>
        <button onClick={() => setSevFilter("all")} className={sevFilter === "all" ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>All ({SMART_ALERTS.length})</button>
        {["CRITICAL","HIGH","MEDIUM","LOW","INFO"].map(s => (
          <button key={s} onClick={() => setSevFilter(s)} className={sevFilter === s ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{s} ({counts[s]})</button>
        ))}
        <div className="spacer"/>
          <button onClick={e => {e.stopPropagation(); window.dispatchEvent(new CustomEvent("coach-modal", {detail: {type: "settings"}}))}} className="btn btn-ghost"><Icon name="settings" className="ic ic-sm"/>Quiet hours & batching</button>
      </div>
      {window.AlertBatching && <window.AlertBatching/>}
      <div className="col-gap" style={{gap: 8}}>
        {filtered.map(a => <SmartAlertCard key={a.id} a={a}/>)}
      </div>
    </div>
  );
};

const SmartAlertCard = ({ a }) => {
  const sevColor = { CRITICAL: "var(--neg)", HIGH: "var(--warn)", MEDIUM: "var(--acc-recov)", LOW: "var(--fg-dim)", INFO: "var(--acc-coach)" }[a.severity];
  return (
    <Card style={{position: "relative", cursor: "pointer"}} onClick={() => window.dispatchEvent(new CustomEvent("coach-modal", {detail: {type: "alertDet", payload: a}}))}>
      <div style={{position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: sevColor, borderRadius: "0 2px 2px 0"}}/>
      <div style={{paddingLeft: 10}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
          <SevPill sev={a.severity}/>
          <span className="num mono" style={{fontSize: 10, color: "var(--fg-dim)"}}>{a.id}</span>
          <span style={{fontSize: 12.5, fontWeight: 500}}>{a.athlete}</span>
          <span className="dim">·</span>
          <span className="muted" style={{fontSize: 11.5}}>{a.type}</span>
          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{a.age}{a.expires ? " · expires " + a.expires : ""}</span>
        </div>
        <div style={{fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em"}}>{a.title}</div>
        <div className="muted" style={{fontSize: 12, lineHeight: 1.5, marginBottom: 10}}>{a.why}</div>
        <div className="grid g-cols-4" style={{gap: 8, marginBottom: 10}}>
          <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
            <div className="eyebrow" style={{marginBottom: 2}}>Confidence</div>
            <div className="num" style={{fontSize: 14}}>{Math.round(a.confidence * 100)}%</div>
          </div>
          <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
            <div className="eyebrow" style={{marginBottom: 2}}>FP risk</div>
            <div className="num" style={{fontSize: 14, color: a.fpRisk > 0.2 ? "var(--warn)" : "var(--fg)"}}>{Math.round(a.fpRisk * 100)}%</div>
          </div>
          <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, gridColumn: "span 2"}}>
            <div className="eyebrow" style={{marginBottom: 2}}>If not addressed</div>
            <div style={{fontSize: 11.5}}>{a.predicted}</div>
          </div>
        </div>
        <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
          <button className="btn btn-primary btn-sm"><Icon name="message" className="ic ic-sm"/>Message · <kbd style={{fontSize: 9, padding: "1px 4px", background: "color-mix(in oklch, var(--bg) 60%, transparent)", borderRadius: 3, marginLeft: 2}}>M</kbd></button>
          <button className="btn btn-sm"><Icon name="bell" className="ic ic-sm"/>Call · <kbd style={{fontSize: 9, padding: "1px 4px", background: "var(--surface-2)", borderRadius: 3, marginLeft: 2}}>C</kbd></button>
          <button className="btn btn-sm"><Icon name="edit" className="ic ic-sm"/>Adjust plan · <kbd style={{fontSize: 9, padding: "1px 4px", background: "var(--surface-2)", borderRadius: 3, marginLeft: 2}}>P</kbd></button>
          <button className="btn btn-sm"><Icon name="calendar" className="ic ic-sm"/>Schedule · <kbd style={{fontSize: 9, padding: "1px 4px", background: "var(--surface-2)", borderRadius: 3, marginLeft: 2}}>S</kbd></button>
          <div className="spacer"/>
          {a.severity === "CRITICAL" && <button className="btn btn-sm" style={{borderColor: "color-mix(in oklch, var(--neg) 35%, var(--border))", color: "var(--neg)"}}>Escalate</button>}
          <button className="btn btn-ghost btn-sm">Dismiss</button>
        </div>
      </div>
    </Card>
  );
};

// ── Autonomy view (D8) ──────────────────────────────────
const CoachPortalAutonomy = () => (
  <div>
    <div style={{padding: 14, background: "color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))", borderRadius: 8, marginBottom: 14}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 10}}>
        <Icon name="layers" className="ic" style={{color: "var(--acc-buddy)"}}/>
        <div style={{fontSize: 13, fontWeight: 600}}>5-Level Autonomy Framework</div>
      </div>
      <div className="grid" style={{gridTemplateColumns: "repeat(5, 1fr)", gap: 8}}>
        {AUTONOMY_LEVELS.map(l => (
          <div key={l.lvl} style={{padding: 10, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 4}}>
              <div style={{width: 18, height: 18, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10}}>{l.lvl}</div>
              <span style={{fontSize: 11.5, fontWeight: 600}}>{l.name}</span>
            </div>
            <div className="muted" style={{fontSize: 10.5, lineHeight: 1.5, marginBottom: 6}}>{l.desc}</div>
            <div className="dim mono" style={{fontSize: 9.5}}>Cadence: {l.cadence}</div>
            <div className="dim mono" style={{fontSize: 9.5}}>Style: {l.style}</div>
          </div>
        ))}
      </div>
    </div>
    <Card title="Athletes by autonomy level" sub="distribution + progression candidates">
      <table className="tbl">
        <thead>
          <tr>
            <th>Athlete</th>
            <th style={{width: 110}}>Level</th>
            <th style={{width: 80}}>Trend</th>
            <th style={{width: 90}}>Time at level</th>
            <th>Coach recommendation</th>
            <th style={{width: 110}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(ATHLETE_AUTONOMY).map(([aid, info]) => {
            const lvl = AUTONOMY_LEVELS.find(x => x.lvl === info.level);
            return (
              <tr key={aid}>
                <td>{(window.PORTAL_ATHLETES || []).find(a => a.id === aid)?.name || aid}</td>
                <td>
                  <div style={{display: "flex", alignItems: "center", gap: 6}}>
                    <div style={{width: 16, height: 16, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 9}}>{info.level}</div>
                    <span style={{fontSize: 11.5}}>{lvl?.name}</span>
                  </div>
                </td>
                <td>
                  <Pill style={{color: info.trend === "up" ? "var(--pos)" : info.trend === "down" ? "var(--warn)" : "var(--fg-dim)"}}>
                    {info.trend === "up" ? "↑ progressing" : info.trend === "down" ? "↓ at risk" : "stable"}
                  </Pill>
                </td>
                <td className="num muted">{info.since}</td>
                <td className="muted" style={{fontSize: 11.5}}>{info.recommendation}</td>
                <td>
                  {info.canProgress
                    ? <button className="btn btn-sm">Promote · L{info.level + 1}</button>
                    : info.trend === "down"
                      ? <button className="btn btn-sm" style={{borderColor: "color-mix(in oklch, var(--warn) 35%, var(--border))"}}>Review</button>
                      : <span className="dim mono" style={{fontSize: 10}}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  </div>
);

// ── Team / RBAC + Audit ────────────────────────────────
const CoachPortalTeam = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
    <Card title="Team" sub={`${TEAM_MEMBERS.length} members · 1 head, 2 senior, 2 coaches`} actions={<button className="btn btn-primary btn-sm" onClick={() => window.dispatchEvent(new CustomEvent("coach-modal", {detail: {type: "inviteTeam"}}))}><Icon name="plus" className="ic ic-sm"/>Invite member</button>}>
      <table className="tbl">
        <thead><tr><th>Name</th><th style={{width: 110}}>Role</th><th style={{width: 80, textAlign: "right"}}>Athletes</th><th style={{width: 80}}>Tenure</th><th style={{width: 80, textAlign: "right"}}>Rating</th><th style={{width: 80, textAlign: "right"}}>Action</th></tr></thead>
        <tbody>
          {TEAM_MEMBERS.map(m => (
            <tr key={m.id} className="clickable" style={{cursor: "pointer"}} onClick={() => window.dispatchEvent(new CustomEvent("coach-modal", {detail: {type: "memberDet", payload: m}}))}>
              <td>{m.name}</td>
              <td><Pill variant={m.role === "head" ? "acc" : ""}>{COACH_ROLES.find(r => r.id === m.role).label}</Pill></td>
              <td className="num" style={{textAlign: "right"}}>{m.athletes}</td>
              <td className="num muted">{m.since}</td>
              <td className="num" style={{textAlign: "right"}}>{m.rating} ★</td>
              <td style={{textAlign: "right"}}><button className="btn btn-ghost btn-sm">Manage</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <Card title="Permission matrix" sub="capabilities per role">
      <table className="tbl">
        <thead><tr><th>Capability</th><th style={{width: 50, textAlign: "center"}}>Head</th><th style={{width: 50, textAlign: "center"}}>Senior</th><th style={{width: 50, textAlign: "center"}}>Coach</th></tr></thead>
        <tbody>
          {[
            ["Client access · all", "✓", "—", "—"],
            ["Client access · assigned + team", "✓", "✓", "—"],
            ["Client access · assigned only", "✓", "✓", "✓"],
            ["Data export · full", "✓", "✓", "—"],
            ["Data export · limited", "✓", "✓", "✓"],
            ["Rule management · full", "✓", "—", "—"],
            ["Rule management · own", "✓", "✓", "—"],
            ["Rule templates only", "✓", "✓", "✓"],
            ["Team management", "✓", "—", "—"],
            ["Analytics · advanced", "✓", "—", "—"],
            ["Analytics · standard", "✓", "✓", "—"],
            ["Analytics · basic", "✓", "✓", "✓"],
            ["Billing", "✓", "—", "—"],
          ].map((r, i) => (
            <tr key={i}>
              <td style={{fontSize: 11.5}}>{r[0]}</td>
              <td style={{textAlign: "center", color: r[1] === "✓" ? "var(--pos)" : "var(--fg-dim)"}}>{r[1]}</td>
              <td style={{textAlign: "center", color: r[2] === "✓" ? "var(--pos)" : "var(--fg-dim)"}}>{r[2]}</td>
              <td style={{textAlign: "center", color: r[3] === "✓" ? "var(--pos)" : "var(--fg-dim)"}}>{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <Card title="Audit log · last 30 days" sub={`${COACH_AUDIT.length} of 1,420 entries · all coach actions`} style={{gridColumn: "span 2"}}>
      <table className="tbl">
        <thead><tr><th style={{width: 150}}>Timestamp</th><th style={{width: 160}}>Actor</th><th>Action</th><th style={{width: 110}}>Category</th></tr></thead>
        <tbody>
          {COACH_AUDIT.map((e, i) => (
            <tr key={i}>
              <td className="num muted" style={{fontSize: 11}}>{e.ts}</td>
              <td className="mono" style={{fontSize: 11}}>{e.who}</td>
              <td style={{fontSize: 12}}>{e.action}</td>
              <td><Pill>{e.cat}</Pill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ── Multi-dim adherence panel (used in AthleteDetailModal) ─
window.MultiDimAdherence = ({ aid }) => {
  const p = adherenceProfile(aid?.charCodeAt(1) || 1);
  const dims = [
    { group: "Nutrition", color: "var(--acc-nutri)", items: [
      ["Caloric", p.nutrition.caloric], ["Protein", p.nutrition.protein], ["Carbs", p.nutrition.carbs],
      ["Fat", p.nutrition.fat], ["Timing", p.nutrition.timing], ["Quality", p.nutrition.quality], ["Hydration", p.nutrition.hydration],
    ]},
    { group: "Training", color: "var(--acc-train)", items: [
      ["Frequency", p.training.frequency], ["Intensity", p.training.intensity], ["Volume", p.training.volume],
      ["Progression", p.training.progression], ["Form", p.training.form],
    ]},
    { group: "Recovery", color: "var(--acc-recov)", items: [
      ["Sleep · duration", p.recovery.sleepDuration], ["Sleep · quality", p.recovery.sleepQuality], ["Sleep · consistency", p.recovery.sleepConsistency],
      ["Check-ins", p.recovery.checkins], ["Modalities", p.recovery.modalities], ["Stress", p.recovery.stress],
    ]},
    { group: "Supplements", color: "var(--acc-suppl)", items: [
      ["Timing", p.supplements.timing], ["Dosage", p.supplements.dosage], ["Consistency", p.supplements.consistency], ["No interactions", p.supplements.interactions],
    ]},
    { group: "Lifestyle", color: "var(--acc-buddy)", items: [
      ["Check-ins", p.lifestyle.checkins], ["Goals", p.lifestyle.goals], ["Planning", p.lifestyle.planning], ["Flexibility", p.lifestyle.flexibility],
    ]},
  ];
  return (
    <div>
      <div style={{padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", gap: 14}}>
        <Ring value={p.overall} max={100} color="var(--acc-coach)" label="overall" size={72} stroke={6}/>
        <div style={{flex: 1}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Multi-dimensional adherence</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500}}>{p.overall}%</div>
          <div className="muted" style={{fontSize: 11}}>average across 5 dimensions · {dims.reduce((s,d) => s + d.items.length, 0)} sub-metrics</div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end"}}>
          <div className="eyebrow">Next week forecast</div>
          <div className="num" style={{fontSize: 14, color: "var(--pos)"}}>{p.overall + 2}%</div>
          <div className="dim mono" style={{fontSize: 10}}>confidence 72%</div>
        </div>
      </div>
      <div className="col-gap" style={{gap: 8}}>
        {dims.map(d => (
          <Card key={d.group} className="card-tight" style={{padding: 12}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
              <span className="dot" style={{background: d.color, width: 8, height: 8}}/>
              <span style={{fontSize: 12, fontWeight: 600}}>{d.group}</span>
              <span className="num dim" style={{marginLeft: "auto", fontSize: 11}}>{Math.round(d.items.reduce((s,[,v]) => s + v, 0) / d.items.length)}% avg</span>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6}}>
              {d.items.map(([k, v]) => (
                <div key={k} style={{padding: 8, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5}}>
                  <div className="eyebrow" style={{marginBottom: 3, fontSize: 9.5}}>{k}</div>
                  <div style={{display: "flex", alignItems: "baseline", gap: 4}}>
                    <span className="num" style={{fontSize: 13, color: v >= 85 ? "var(--pos)" : v >= 70 ? "var(--warn)" : "var(--neg)"}}>{v}</span>
                    <span className="dim" style={{fontSize: 9}}>%</span>
                  </div>
                  <div style={{height: 3, background: "var(--surface-2)", borderRadius: 999, marginTop: 3}}>
                    <div style={{height: "100%", width: `${v}%`, background: v >= 85 ? "var(--pos)" : v >= 70 ? "var(--warn)" : "var(--neg)", borderRadius: 999}}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

window.PORTAL_ATHLETES = window.PORTAL_ATHLETES || [];

Object.assign(window, {
  CoachPortalAnalytics, CoachPortalRules, CoachPortalSmartAlerts, CoachPortalAutonomy, CoachPortalTeam,
  ATHLETE_AUTONOMY, AUTONOMY_LEVELS, SMART_ALERTS, ACTIVE_RULES, COACH_AUDIT,
});
