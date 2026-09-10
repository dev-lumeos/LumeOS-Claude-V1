// AI Coach — intelligence layers (SPEC_04 F1–F10)
// Routing · feature gates · butler · watcher · journey · policy gate
// · behavioural signature · output contract · memory learning

// ── F1 · Hybrid routing ──────────────────────────────
const AI_PATHS = [
  { id: "fast",      label: "Fast path",      cost: "$0",      model: "none · engines only", share: 46,
    desc: "Dashboard reads, scores, current state. No language model touches it.",
    ex: ["What's my recovery score?", "How much protein left today?", "Show this week's volume"] },
  { id: "knowledge", label: "Knowledge path", cost: "~$0.002", model: "RAG + Haiku",        share: 22,
    desc: "General questions that need the library but not your data.",
    ex: ["How does creatine loading work?", "What is RPE?", "Explain progressive overload"] },
  { id: "hybrid",    label: "Hybrid path",    cost: "~$0.02",  model: "Engines + Sonnet",   share: 32,
    desc: "Needs both your numbers and reasoning over them.",
    ex: ["Why has my bench stalled?", "Should I deload this week?", "Adjust my macros for the cut"] },
];

const AI_ROUTE_LOG = [
  { at: "14:22", q: "Why did my recovery drop?",        path: "hybrid",    ms: 1840, cost: 0.021, engines: ["recovery", "training", "supplements"] },
  { at: "14:18", q: "How much protein left?",           path: "fast",      ms: 42,   cost: 0,     engines: ["nutrition"] },
  { at: "13:51", q: "What does creatine do exactly?",   path: "knowledge", ms: 680,  cost: 0.002, engines: [] },
  { at: "13:04", q: "Log 500ml water",                  path: "fast",      ms: 88,   cost: 0,     engines: ["nutrition"] },
  { at: "11:32", q: "Should I push tonight or deload?", path: "hybrid",    ms: 2110, cost: 0.024, engines: ["recovery", "training", "goals"] },
  { at: "09:14", q: "Show me my weekly volume",         path: "fast",      ms: 36,   cost: 0,     engines: ["training"] },
];

// ── F2 · Feature tiers ───────────────────────────────
const AI_TIERS = [
  { key: "chat_basic",        label: "Basic chat",              free: true,  plus: true,  elite: true },
  { key: "dashboard_reads",   label: "Dashboard queries",       free: true,  plus: true,  elite: true },
  { key: "knowledge_search",  label: "Knowledge base search",   free: true,  plus: true,  elite: true },
  { key: "action_execution",  label: "App Butler · logging",    free: false, plus: true,  elite: true },
  { key: "proactive_watcher", label: "Proactive watcher",       free: false, plus: true,  elite: true },
  { key: "journey",           label: "Journey checkpoints",     free: false, plus: true,  elite: true },
  { key: "voice_input",       label: "Voice input",             free: false, plus: false, elite: true },
  { key: "live_workout",      label: "Live workout session",    free: false, plus: false, elite: true },
  { key: "behavioral_sig",    label: "Behavioural signature",   free: false, plus: false, elite: true },
  { key: "ai_clone",          label: "AI clone (coach B2B)",    free: false, plus: false, elite: true },
];

// ── F3 · App Butler ──────────────────────────────────
const AI_INTENTS = [
  { type: "log_meal",       conf: 0.94, ex: "\"Hatte 200 g Hähnchen mit Reis\"",        entities: "foods[2], portions", flow: "preview → confirm" },
  { type: "log_water",      conf: 0.99, ex: "\"500 ml Wasser\"",                        entities: "amount_ml: 500",     flow: "immediate" },
  { type: "log_weight",     conf: 0.97, ex: "\"79,4 heute früh\"",                      entities: "weight_kg: 79.4",    flow: "immediate" },
  { type: "log_supplement", conf: 0.92, ex: "\"Creatin genommen\"",                     entities: "supplement_id",      flow: "immediate" },
  { type: "log_set",        conf: 0.88, ex: "\"117,5 mal 5, war RPE 8\"",                entities: "weight, reps, rpe",  flow: "immediate" },
  { type: "log_checkin",    conf: 0.71, ex: "\"Fühl mich heute ok\"",                    entities: "mood?",              flow: "clarify · below 0.8" },
];

const AI_BUTLER_LOG = [
  { at: "14:18", said: "500 ml Wasser", intent: "log_water", conf: 0.99, result: "executed", detail: "Nutrition · water +500 ml" },
  { at: "12:04", said: "Hatte 200 g Hähnchen mit Reis", intent: "log_meal", conf: 0.94, result: "preview", detail: "2 foods matched · awaiting confirm" },
  { at: "08:31", said: "79,4 heute früh", intent: "log_weight", conf: 0.97, result: "executed", detail: "Goals · measurement logged" },
  { at: "07:12", said: "Fühl mich heute ok", intent: "log_checkin", conf: 0.71, result: "clarify", detail: "Asked: energy 1–10?" },
];

// ── F4 · Watcher rules ───────────────────────────────
const AI_WATCHER = [
  { id: "nutrition_nothing_logged", level: "warning",  cat: "nutrition",   cond: "meals_today = 0 AND hour ≥ 14", fired: 3, dismissed: 0, muted: false },
  { id: "recovery_critical",        level: "warning",  cat: "recovery",    cond: "recovery < 50 AND heavy_training_day", fired: 2, dismissed: 0, muted: false },
  { id: "sleep_consecutive_bad",    level: "warning",  cat: "recovery",    cond: "bad_sleep_days ≥ 3", fired: 1, dismissed: 4, muted: true },
  { id: "supplement_interaction",   level: "critical", cat: "supplements", cond: "interaction_critical = true", fired: 0, dismissed: 0, muted: false },
  { id: "protein_shortfall",        level: "info",     cat: "nutrition",   cond: "protein < 70 % AND hour ≥ 20", fired: 6, dismissed: 2, muted: false },
];

// ── F5 · Journey checkpoints ─────────────────────────
const AI_JOURNEY = [
  { id: "morning",     time: "06:45", days: "Mon–Sun", persona: "friend",    modules: ["recovery", "goals"],        push: true,  last: "today 06:45" },
  { id: "pre_workout", time: "16:30", days: "Mon Wed Fri Sat", persona: "motivator", modules: ["training", "nutrition"], push: true, last: "today 16:30" },
  { id: "evening",     time: "21:00", days: "Mon–Sun", persona: "scientist", modules: ["nutrition", "supplements"], push: false, last: "yesterday 21:00" },
  { id: "weekly",      time: "18:00", days: "Sun",     persona: "scientist", modules: ["goals", "training", "recovery"], push: true, last: "Sun 18:00" },
];

// ── F8 · Policy gate ─────────────────────────────────
const AI_POLICY_LOG = [
  { at: "2 days ago", q: "Kann ich Ibuprofen mit meinem TRT nehmen?", action: "block_escalate", reason: "medication interaction question", out: "Redirected to physician · disclaimer card shown" },
  { at: "5 days ago", q: "Was hilft gegen meine Knieschmerzen?",      action: "redact_rewrite", reason: "diagnosis-adjacent phrasing", out: "Rewritten as load-management guidance, no diagnosis" },
  { at: "1 week ago", q: "Wie viel Protein für Muskelaufbau?",        action: "pass",           reason: "—", out: "Answered with RAG evidence" },
  { at: "2 weeks ago",q: "Ist mein Cortisol zu hoch?",                action: "block_escalate", reason: "lab interpretation", out: "Redirected to Medical module and physician" },
];

// ── F9 · Behavioural signature ───────────────────────
const AI_SIGNATURE = [
  { key: "stress_pattern",   label: "Stress → skipped training", detected: true,  conf: 0.78, n: 11, first: "2026-04-02", last: "2026-09-05",
    pattern: "Work-stress days show 3.2× higher skip rate. Tuesdays and Thursdays most affected." },
  { key: "protein_collapse", label: "Protein collapse on weekends", detected: true, conf: 0.84, n: 18, first: "2026-03-18", last: "2026-09-07",
    pattern: "Saturday protein averages 118 g against a 182 g target. Sunday recovers to 154 g." },
  { key: "dropout_risk",     label: "Dropout risk window",       detected: true,  conf: 0.62, n: 7,  first: "2026-05-11", last: "2026-08-29",
    pattern: "Friday 18:00 — the session most often postponed and then not made up." },
  { key: "sleep_training",   label: "Sleep debt → RPE inflation",detected: true,  conf: 0.71, n: 14, first: "2026-04-22", last: "2026-09-03",
    pattern: "After two nights under 6 h, reported RPE runs 1.4 points above the load-matched baseline." },
  { key: "travel_impact",    label: "Travel disruption",         detected: false, conf: 0.31, n: 3,  first: "2026-06-04", last: "2026-08-12",
    pattern: "Only three travel periods observed. Not enough to confirm." },
];

// ── F10 · Output contract ────────────────────────────
const AI_CONTRACT = [
  { field: "intent",        req: true,  type: "string",   note: "Classification of what the response does" },
  { field: "speech_text",   req: true,  type: "string",   note: "The spoken or written answer" },
  { field: "ui_cards",      req: false, type: "Card[]",   note: "Structured data blocks rendered below the text" },
  { field: "actions",       req: false, type: "Action[]", note: "Executable follow-ups offered to the user" },
  { field: "safety_flags",  req: false, type: "string[]", note: "Set by the policy gate, never by the model" },
  { field: "evidence",      req: false, type: "Ref[]",    note: "RAG sources. No evidence means no science claim" },
  { field: "expects_input", req: false, type: "boolean",  note: "Whether the turn ends open" },
];

const AI_VALIDATION = [
  { rule: "Numbers come from engines", status: "enforced", detail: "Any figure in speech_text must exist in the engine context. The model may not compute." },
  { rule: "No evidence, no claim",     status: "enforced", detail: "A scientific assertion without a RAG reference is rejected before it reaches you." },
  { rule: "Safety flags are read-only",status: "enforced", detail: "The policy gate sets them after generation. The model cannot clear its own flags." },
  { rule: "Schema conformance",        status: "enforced", detail: "Malformed output is retried once, then falls back to the fast path." },
];

// ══ Views ════════════════════════════════════════════

window.AIRoutingView = () => {
  const total = AI_ROUTE_LOG.length;
  const cost = AI_ROUTE_LOG.reduce((s, r) => s + r.cost, 0);
  const pathCol = { fast: "var(--pos)", knowledge: "var(--acc-recov)", hybrid: "var(--acc-buddy)" };
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {[["Requests today", total], ["Cost today", "$" + cost.toFixed(3)], ["Avg latency", Math.round(AI_ROUTE_LOG.reduce((s, r) => s + r.ms, 0) / total) + " ms"], ["Zero-cost share", "46 %"]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{ padding: 13 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
          </Card>
        ))}
      </div>

      <div className="grid g-cols-3" style={{ gap: 12 }}>
        {AI_PATHS.map(p => (
          <Card key={p.id} style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: pathCol[p.id] }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</span>
              <Pill style={{ color: pathCol[p.id], borderColor: `color-mix(in srgb, ${pathCol[p.id]} 32%, var(--border))` }}>{p.cost}</Pill>
            </div>
            <div className="dim mono" style={{ fontSize: 10, marginBottom: 8 }}>{p.model}</div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 10 }}>{p.desc}</div>
            <div style={{ marginBottom: 9 }}>
              {window.Meter && <window.Meter value={p.share} color={pathCol[p.id]} tall />}
              <div className="num dim" style={{ fontSize: 10, marginTop: 4 }}>{p.share} % of traffic</div>
            </div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Routes here</div>
            <div className="col-gap" style={{ gap: 3 }}>
              {p.ex.map(e => <div key={e} className="dim" style={{ fontSize: 10.5, lineHeight: 1.4 }}>· {e}</div>)}
            </div>
          </Card>
        ))}
      </div>

      <Card title="Routing log" sub="every request, which path it took and why">
        <table className="tbl">
          <thead><tr><th style={{ width: 60 }}>Time</th><th>Message</th><th style={{ width: 100 }}>Path</th><th style={{ width: 70, textAlign: "right" }}>Latency</th><th style={{ width: 70, textAlign: "right" }}>Cost</th><th>Engines used</th></tr></thead>
          <tbody>
            {AI_ROUTE_LOG.map((r, i) => (
              <tr key={i}>
                <td className="num muted">{r.at}</td>
                <td style={{ fontSize: 11.5 }}>{r.q}</td>
                <td><Pill style={{ color: pathCol[r.path], borderColor: `color-mix(in srgb, ${pathCol[r.path]} 32%, var(--border))` }}>{r.path}</Pill></td>
                <td className="num" style={{ textAlign: "right", color: r.ms > 1500 ? "var(--warn)" : "var(--fg)" }}>{r.ms} ms</td>
                <td className="num muted" style={{ textAlign: "right" }}>{r.cost === 0 ? "—" : "$" + r.cost.toFixed(3)}</td>
                <td className="dim mono" style={{ fontSize: 10.5 }}>{r.engines.length ? r.engines.join(" · ") : "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

window.AITiersView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
    <Card title="Feature access by tier" sub="you are on Plus · voice and live workout need Elite">
      <table className="tbl">
        <thead><tr><th>Capability</th><th style={{ width: 70, textAlign: "center" }}>Free</th><th style={{ width: 70, textAlign: "center" }}>Plus</th><th style={{ width: 70, textAlign: "center" }}>Elite</th></tr></thead>
        <tbody>
          {AI_TIERS.map(t => (
            <tr key={t.key} style={{ background: !t.plus && t.elite ? "color-mix(in srgb, var(--warn) 4%, transparent)" : "transparent" }}>
              <td>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{t.label}</div>
                <div className="dim mono" style={{ fontSize: 9.5 }}>{t.key}</div>
              </td>
              {[t.free, t.plus, t.elite].map((on, i) => (
                <td key={i} style={{ textAlign: "center", color: on ? "var(--pos)" : "var(--fg-dim)", fontSize: 13 }}>{on ? "✓" : "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <div className="col-gap" style={{ gap: 14 }}>
      <Card title="Your tier" sub="Plus · €12 / month">
        <Row label="Active capabilities" value={`${AI_TIERS.filter(t => t.plus).length} of ${AI_TIERS.length}`} />
        <Row label="Locked" value={AI_TIERS.filter(t => !t.plus).map(t => t.label).join(", ")} />
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 11 }}>
          Locked features return a 403 with the required tier rather than degrading silently. You always know why something did not happen.
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }}>Upgrade to Elite · €24 / month</button>
      </Card>
      <Card title="Gate responses · last 30 days">
        <Row label="403 · feature_locked" value="4" />
        <Row label="Most requested locked" value="voice_input · 3×" />
        <Row label="Upgrade prompts shown" value="4" />
      </Card>
    </div>
  </div>
);

window.AIButlerView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <Card title="App Butler" sub="natural language becomes logged data · confidence below 0.8 asks first">
      <table className="tbl">
        <thead><tr><th style={{ width: 130 }}>Intent</th><th>Example</th><th style={{ width: 170 }}>Extracted</th><th style={{ width: 80, textAlign: "right" }}>Confidence</th><th style={{ width: 150 }}>Flow</th></tr></thead>
        <tbody>
          {AI_INTENTS.map(i => (
            <tr key={i.type}>
              <td className="mono" style={{ fontSize: 11 }}>{i.type}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{i.ex}</td>
              <td className="dim mono" style={{ fontSize: 10.5 }}>{i.entities}</td>
              <td className="num" style={{ textAlign: "right", color: i.conf >= 0.8 ? "var(--pos)" : "var(--warn)" }}>{i.conf.toFixed(2)}</td>
              <td>{i.flow.includes("clarify") ? <Pill variant="warn">{i.flow}</Pill> : <Pill>{i.flow}</Pill>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" />
      <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        Meals always go through a preview because portion estimation is the least reliable part. Water, weight and supplements execute straight away — a wrong entry there is trivially corrected.
      </div>
    </Card>

    <Card title="Execution log · today" sub="4 butler actions">
      <div className="col-gap" style={{ gap: 7 }}>
        {AI_BUTLER_LOG.map((l, i) => {
          const c = l.result === "executed" ? "var(--pos)" : l.result === "preview" ? "var(--acc-recov)" : "var(--warn)";
          return (
            <div key={i} style={{ display: "flex", gap: 11, padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
              <span className="num dim" style={{ fontSize: 10.5, width: 42, flexShrink: 0 }}>{l.at}</span>
              <span style={{ width: 3, background: c, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, marginBottom: 3 }}>"{l.said}"</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span className="mono dim" style={{ fontSize: 10 }}>{l.intent}</span>
                  <span className="num dim" style={{ fontSize: 10 }}>conf {l.conf}</span>
                  <Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 30%, var(--border))` }}>{l.result}</Pill>
                  <span className="dim" style={{ fontSize: 10.5 }}>{l.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

window.AIWatcherView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
    <Card title="Watcher rules" sub="checked on every data write and once daily · Plus and above">
      <table className="tbl">
        <thead><tr><th>Rule</th><th style={{ width: 80 }}>Level</th><th>Condition</th><th style={{ width: 60, textAlign: "right" }}>Fired</th><th style={{ width: 80, textAlign: "right" }}>Dismissed</th><th style={{ width: 70 }}>State</th></tr></thead>
        <tbody>
          {AI_WATCHER.map(r => {
            const c = r.level === "critical" ? "var(--neg)" : r.level === "warning" ? "var(--warn)" : "var(--fg-dim)";
            return (
              <tr key={r.id} style={{ opacity: r.muted ? 0.6 : 1 }}>
                <td className="mono" style={{ fontSize: 10.5 }}>{r.id}</td>
                <td><Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 32%, var(--border))` }}>{r.level}</Pill></td>
                <td className="dim mono" style={{ fontSize: 10.5 }}>{r.cond}</td>
                <td className="num" style={{ textAlign: "right" }}>{r.fired}</td>
                <td className="num muted" style={{ textAlign: "right" }}>{r.dismissed}</td>
                <td>{r.muted ? <Pill variant="warn">downgraded</Pill> : <Pill variant="pos">active</Pill>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="divider" />
      <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        Dismiss the same category three times and the rule drops from warning to info. Buddy stops pushing on what you have already decided to ignore, but keeps recording it.
      </div>
    </Card>
    <div className="col-gap" style={{ gap: 14 }}>
      <Card title="Deduplication" sub="how repeat alerts are suppressed">
        <Row label="Cooldown window" value="24 hours per category" />
        <Row label="Max per day" value="1 per rule per client" />
        <Row label="Smart mute threshold" value="3 dismissals" />
        <Row label="Critical bypass" value="always delivered" />
      </Card>
      <Card title="Push behaviour">
        <Row label="Critical" value="push notification" />
        <Row label="Warning" value="in-app only" />
        <Row label="Info" value="feed entry, no interrupt" />
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Only critical alerts leave the app. Everything else waits until you open it.
        </div>
      </Card>
    </div>
  </div>
);

window.AIJourneyView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <Card title="Journey checkpoints" sub="scheduled briefings · persona and modules per checkpoint">
      <table className="tbl">
        <thead><tr><th style={{ width: 110 }}>Checkpoint</th><th style={{ width: 70 }}>Time</th><th style={{ width: 140 }}>Days</th><th style={{ width: 110 }}>Persona</th><th>Modules pulled</th><th style={{ width: 60 }}>Push</th><th style={{ width: 120 }}>Last run</th></tr></thead>
        <tbody>
          {AI_JOURNEY.map(j => (
            <tr key={j.id}>
              <td className="mono" style={{ fontSize: 11.5, fontWeight: 500 }}>{j.id}</td>
              <td className="num">{j.time}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{j.days}</td>
              <td><Pill>{j.persona}</Pill></td>
              <td><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{j.modules.map(m => <Pill key={m} style={{ fontSize: 9.5 }}>{m}</Pill>)}</div></td>
              <td>{j.push ? <Pill variant="pos">yes</Pill> : <span className="dim">—</span>}</td>
              <td className="num muted" style={{ fontSize: 10.5 }}>{j.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" />
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-sm"><Icon name="plus" className="ic ic-sm" />Add checkpoint</button>
        <button className="btn btn-sm btn-ghost">Pause all</button>
      </div>
    </Card>

    <Card title="Today's morning briefing" sub="06:45 · friend persona · recovery + goals">
      <div style={{ display: "flex", gap: 13, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 24%, var(--border))", borderRadius: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, flexShrink: 0, background: "var(--acc-buddy)", opacity: 0.85 }} />
        <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
          Recovery came back at 78 after two nights above seven hours — that is the highest since the block started. Bench is at 122.5 for a triple and the plan says 125 today. Conditions are as good as they get, so take the attempt. Protein target is 182 g; you averaged 174 last week, so front-load it a bit today.
        </div>
      </div>
      <div className="divider" />
      <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--fg-muted)" }}>
        <span>Model <span className="mono" style={{ color: "var(--fg)" }}>haiku</span></span>
        <span>Cost <span className="num" style={{ color: "var(--fg)" }}>$0.002</span></span>
        <span>Engines <span className="mono" style={{ color: "var(--fg)" }}>recovery · training · nutrition · goals</span></span>
      </div>
    </Card>
  </div>
);

window.AIPolicyView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
    <Card title="Policy gate log" sub="every response passes through before it reaches you">
      <div className="col-gap" style={{ gap: 9 }}>
        {AI_POLICY_LOG.map((p, i) => {
          const c = p.action === "pass" ? "var(--pos)" : p.action === "redact_rewrite" ? "var(--warn)" : "var(--neg)";
          return (
            <div key={i} style={{ padding: 12, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 22%, var(--border))`, borderRadius: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 32%, var(--border))` }}>{p.action}</Pill>
                <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{p.at}</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 5 }}>"{p.q}"</div>
              {p.reason !== "—" && <div className="dim mono" style={{ fontSize: 10.5, marginBottom: 4 }}>trigger: {p.reason}</div>}
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{p.out}</div>
            </div>
          );
        })}
      </div>
    </Card>
    <div className="col-gap" style={{ gap: 14 }}>
      <Card title="Three outcomes">
        {[["pass", "Nothing matched. The response goes through unchanged.", "var(--pos)"],
          ["redact_rewrite", "Phrasing edged toward diagnosis. Rewritten as guidance, substance kept.", "var(--warn)"],
          ["block_escalate", "Medical territory. Response replaced with a redirect and a disclaimer card.", "var(--neg)"]].map(([k, v, c]) => (
          <div key={k} style={{ padding: 11, marginBottom: 7, background: `color-mix(in srgb, ${c} 5%, var(--surface))`, border: `1px solid color-mix(in srgb, ${c} 22%, var(--border))`, borderRadius: 6 }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: c, marginBottom: 4 }}>{k}</div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </Card>
      <Card title="30-day counts">
        <Row label="Responses screened" value="1,842" />
        <Row label="Passed" value="1,818 · 98.7 %" />
        <Row label="Rewritten" value="18" />
        <Row label="Blocked" value="6" />
      </Card>
    </div>
  </div>
);

window.AISignatureView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="brain" className="ic" style={{ color: "var(--acc-buddy)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Behavioural signature · Elite feature</div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Built from 90 days of events. A pattern needs at least 50 data points and 0.5 confidence before Buddy acts on it — below that it is noted but never mentioned.
          </div>
        </div>
        <Pill variant="acc">184 events · 24 weeks</Pill>
      </div>
    </div>

    <div className="col-gap" style={{ gap: 10 }}>
      {AI_SIGNATURE.map(s => (
        <Card key={s.key} style={{ opacity: s.detected ? 1 : 0.65 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
            {s.detected
              ? <Pill variant={s.conf >= 0.7 ? "pos" : "warn"}>confirmed · {(s.conf * 100).toFixed(0)} %</Pill>
              : <Pill>below threshold · {(s.conf * 100).toFixed(0)} %</Pill>}
            <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>n = {s.n} · {s.first} → {s.last}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 9 }}>{s.pattern}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>{window.Meter && <window.Meter value={s.conf * 100} color={s.detected ? "var(--acc-buddy)" : "var(--fg-dim)"} />}</div>
            <span className="num dim" style={{ fontSize: 10, width: 82 }}>threshold 50 %</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

window.AIContractView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
    <Card title="Output contract" sub="every response is validated against this shape before rendering">
      <table className="tbl">
        <thead><tr><th style={{ width: 120 }}>Field</th><th style={{ width: 70 }}>Required</th><th style={{ width: 90 }}>Type</th><th>Purpose</th></tr></thead>
        <tbody>
          {AI_CONTRACT.map(f => (
            <tr key={f.field}>
              <td className="mono" style={{ fontSize: 11.5 }}>{f.field}</td>
              <td>{f.req ? <Pill variant="pos">yes</Pill> : <span className="dim" style={{ fontSize: 11 }}>optional</span>}</td>
              <td className="dim mono" style={{ fontSize: 10.5 }}>{f.type}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{f.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <Card title="Validation rules" sub="what gets rejected">
      <div className="col-gap" style={{ gap: 9 }}>
        {AI_VALIDATION.map(v => (
          <div key={v.rule} style={{ padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <Icon name="check" className="ic ic-sm" style={{ color: "var(--pos)" }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{v.rule}</span>
            </div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, paddingLeft: 20 }}>{v.detail}</div>
          </div>
        ))}
      </div>
      <div className="divider" />
      <Row label="Contract failures · 30d" value="7" />
      <Row label="Retried successfully" value="6" />
      <Row label="Fell back to fast path" value="1" />
    </Card>
  </div>
);
