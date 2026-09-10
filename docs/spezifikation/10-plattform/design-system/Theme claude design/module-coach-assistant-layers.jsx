// Coach assistant — the layers it was missing against the athlete-side AI Coach
// Voice · method memory · briefings · butler · watcher · guardrails · tone · cost

// ── Voice capture ────────────────────────────────────
const CVO_NOTES = [
  { at: "today 11:42", client: "Marcus Weber",  dur: "0:38", state: "filed",
    raw: "Marcus hit two twenty clean, bar speed was good on the last rep, hold him here two more sessions before we go up, also his left shoulder was sitting a bit high on the setup, mention it next time",
    parsed: ["PR logged · deadlift 220 kg", "Progression: hold 2 sessions", "Cue for next session: left shoulder position at setup"] },
  { at: "today 10:15", client: "Sophie Klein",  dur: "0:22", state: "filed",
    raw: "Sophie called, work trip next week again, wants to keep training but knows the food logging will slip, told her simplified targets are fine",
    parsed: ["Travel: next week", "Agreed: simplified nutrition targets during travel"] },
  { at: "yesterday 18:04", client: "Lukas Bauer", dur: "1:12", state: "filed",
    raw: "Lukas peak week planning, he looks flatter than I'd like at seven days out, might pull the depletion back by a day, sleep is the concern not the carbs",
    parsed: ["Peak week: consider shortening depletion by one day", "Concern: sleep, not carbohydrate load", "Visual: flatter than expected at 7 days out"] },
  { at: "yesterday 09:31", client: "—",           dur: "0:16", state: "unfiled",
    raw: "remember to restructure the beginner template, the week three jump is too aggressive for most people",
    parsed: ["Template note: Beginner Linear · week 3 progression too steep"] },
];

window.CoachVoiceView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", gap: 14 }}>
    <Card title="Dictate" sub="between sessions · on-device transcription">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "26px 0 20px" }}>
        <div style={{
          width: 76, height: 76, borderRadius: 999, marginBottom: 15,
          background: "var(--acc-buddy)", opacity: 0.9,
          display: "grid", placeItems: "center",
          boxShadow: window.chartGlow ? window.chartGlow("var(--acc-buddy)", 1.1) : "none",
        }}>
          <Icon name="message" className="ic" style={{ width: 26, height: 26, color: "var(--bg)" }} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Hold to record</div>
        <div className="dim" style={{ fontSize: 11, textAlign: "center", lineHeight: 1.5, maxWidth: 210 }}>
          Speak freely. It picks out the client, the observation and anything that should become a cue or a plan note.
        </div>
      </div>
      <div className="divider" />
      <Row label="Transcription" value="on-device · whisper.cpp" />
      <Row label="Audio retention" value="discarded after parse" />
      <Row label="Client detection" value="from name in speech" />
      <Row label="Unfiled notes" value="1" />
    </Card>
    <Card title="Recent captures" sub="raw speech and what was extracted">
      <div className="col-gap" style={{ gap: 10 }}>
        {CVO_NOTES.map((n, i) => (
          <div key={i} style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{n.client}</span>
              <span className="num dim" style={{ fontSize: 10 }}>{n.dur}</span>
              {n.state === "unfiled" ? <Pill variant="warn">unfiled</Pill> : <Pill variant="pos">filed</Pill>}
              <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{n.at}</span>
            </div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, fontStyle: "italic", marginBottom: 9, paddingLeft: 10, borderLeft: "2px solid var(--border)" }}>
              "{n.raw}"
            </div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Extracted</div>
            <div className="col-gap" style={{ gap: 4 }}>
              {n.parsed.map((p, j) => (
                <div key={j} style={{ display: "flex", gap: 7, fontSize: 11.5, color: "var(--fg-muted)" }}>
                  <Icon name="check" className="ic ic-sm" style={{ color: "var(--pos)", flexShrink: 0, marginTop: 2 }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ── Method memory ────────────────────────────────────
const CM_METHOD = [
  { cat: "Programming", conf: 0.94, uses: 142, txt: "RPE-based loading over percentage-based. You have never assigned a percentage-of-1RM week." },
  { cat: "Programming", conf: 0.91, uses: 88,  txt: "Deload at week five of a mesocycle, or earlier if RPE drifts up three sessions running." },
  { cat: "Programming", conf: 0.87, uses: 64,  txt: "One variable per adjustment. You do not change volume and intensity in the same week." },
  { cat: "Communication", conf: 0.96, uses: 210, txt: "You lead with the number, then the interpretation. Never the other way around." },
  { cat: "Communication", conf: 0.89, uses: 96, txt: "Bad news gets stated plainly in the first sentence. No cushioning preamble." },
  { cat: "Communication", conf: 0.82, uses: 44, txt: "You rarely use exclamation marks. Two in 1,240 messages." },
  { cat: "Decision", conf: 0.93, uses: 38,  txt: "Plateau below four weeks: hold. Four weeks or more with good adherence: change the programme, not the effort." },
  { cat: "Decision", conf: 0.90, uses: 22,  txt: "Any pain report stops the exercise that day. No 'work around it'." },
  { cat: "Decision", conf: 0.78, uses: 14,  txt: "You escalate to medical rather than adjusting, whenever a symptom is new." },
];

const CM_CLIENTS = [
  { c: "Lukas Bauer",   n: 34, top: "Responds to detail. Wants the reasoning, not just the instruction." },
  { c: "Sophie Klein",  n: 21, top: "Goes quiet when overwhelmed rather than saying so. Shorter messages work." },
  { c: "Marcus Weber",  n: 28, top: "Self-motivated. Needs braking more often than pushing." },
  { c: "Elena Schmidt", n: 12, top: "New to structured training. Explain the why every time." },
  { c: "Anna Frey",     n: 18, top: "High adherence, low complaint rate. Will not tell you when something is wrong." },
];

window.CoachMethodMemoryView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8 }}>
      <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
        Learned from 1,240 of your messages and 412 plan decisions. This is what makes a draft sound like you rather than like a model. Every line is editable — if something here is wrong, the drafts will be wrong in the same direction.
      </div>
    </div>
    <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
      <Card title="Your method" sub="patterns inferred from how you actually coach">
        <table className="tbl">
          <thead><tr><th style={{ width: 120 }}>Area</th><th>Pattern</th><th style={{ width: 110 }}>Confidence</th><th style={{ width: 60, textAlign: "right" }}>Uses</th><th style={{ width: 36 }}></th></tr></thead>
          <tbody>
            {CM_METHOD.map((m, i) => (
              <tr key={i}>
                <td><Pill style={{ fontSize: 9.5 }}>{m.cat}</Pill></td>
                <td className="muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{m.txt}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1 }}>{window.Meter && <window.Meter value={m.conf * 100} color={m.conf >= 0.9 ? "var(--pos)" : "var(--acc-recov)"} flat />}</div>
                    <span className="num dim" style={{ fontSize: 10 }}>{m.conf.toFixed(2)}</span>
                  </div>
                </td>
                <td className="num muted" style={{ textAlign: "right", fontSize: 11 }}>{m.uses}</td>
                <td><button className="icon-btn"><Icon name="edit" className="ic ic-sm" style={{ color: "var(--fg-dim)" }} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Per client" sub="what the assistant remembers about handling each one">
        <div className="col-gap" style={{ gap: 9 }}>
          {CM_CLIENTS.map(c => (
            <div key={c.c} style={{ padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{c.c}</span>
                <span className="num dim" style={{ marginLeft: "auto", fontSize: 10 }}>{c.n} notes</span>
              </div>
              <div className="muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{c.top}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ── Briefings ────────────────────────────────────────
const CB_BRIEFS = [
  { id: "morning",  time: "07:00", days: "Mon–Fri", push: true,  scope: "Roster overview and today's queue", last: "today 07:00" },
  { id: "midday",   time: "13:00", days: "Mon–Fri", push: false, scope: "New check-ins since morning",       last: "today 13:00" },
  { id: "evening",  time: "19:00", days: "Mon–Fri", push: false, scope: "Unanswered messages, tomorrow's calendar", last: "yesterday 19:00" },
  { id: "weekly",   time: "18:00", days: "Sun",     push: true,  scope: "Full digest and next week's load", last: "Sun 18:00" },
];

window.CoachBriefingsView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <Card title="Scheduled briefings" sub="when the assistant reports in">
      <table className="tbl">
        <thead><tr><th style={{ width: 110 }}>Briefing</th><th style={{ width: 70 }}>Time</th><th style={{ width: 110 }}>Days</th><th>Scope</th><th style={{ width: 60 }}>Push</th><th style={{ width: 120 }}>Last run</th><th style={{ width: 40 }}></th></tr></thead>
        <tbody>
          {CB_BRIEFS.map(b => (
            <tr key={b.id}>
              <td className="mono" style={{ fontSize: 11.5, fontWeight: 500 }}>{b.id}</td>
              <td className="num">{b.time}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{b.days}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{b.scope}</td>
              <td>{b.push ? <Pill variant="pos">yes</Pill> : <span className="dim">—</span>}</td>
              <td className="num muted" style={{ fontSize: 10.5 }}>{b.last}</td>
              <td><button className="icon-btn"><Icon name="settings" className="ic ic-sm" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <Card title="This morning" sub="07:00 · delivered to your phone">
      <div style={{ display: "flex", gap: 13, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--acc-buddy)", opacity: 0.9, flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, lineHeight: 1.65 }}>
          Fourteen clients, five in the queue. Lukas is the only hard deadline — peak week starts Monday and the protocol needs your signature. Sophie's logging is down eighteen points but her training is untouched, so it reads as admin fatigue rather than disengagement; a short message will do more than a long one. Marcus pulled 220 yesterday, first time, and the bar moved faster than his last attempt at 212.5. Three check-ins came in overnight, all unremarkable. Nothing escalated.
        </div>
      </div>
      <div className="divider" />
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-sm">Open queue</button>
        <button className="btn btn-sm btn-ghost">Replay as audio</button>
        <button className="btn btn-sm btn-ghost">Adjust scope</button>
      </div>
    </Card>
  </div>
);

// ── Butler · portal actions ──────────────────────────
const CBU_INTENTS = [
  { intent: "schedule_checkin",  ex: "\"book Sophie for Thursday 10am\"",              conf: 0.93, flow: "immediate", n: 18 },
  { intent: "assign_plan",       ex: "\"put Anna on the upper-lower template\"",        conf: 0.88, flow: "preview",   n: 11 },
  { intent: "add_note",          ex: "\"note for Lukas: shoulder position at setup\"", conf: 0.96, flow: "immediate", n: 42 },
  { intent: "send_message",      ex: "\"tell Marcus to hold at 220 for two sessions\"", conf: 0.84, flow: "draft",     n: 26 },
  { intent: "adjust_volume",     ex: "\"add a set to Anna's bench and row\"",           conf: 0.79, flow: "preview",   n: 7 },
  { intent: "flag_client",       ex: "\"watch Elena this week\"",                       conf: 0.91, flow: "immediate", n: 9 },
  { intent: "export_report",     ex: "\"send Lukas his month summary\"",                conf: 0.86, flow: "preview",   n: 4 },
];

window.CoachButlerView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <Card title="Portal actions by instruction" sub="type or speak · confidence under 0.8 previews rather than executes">
      <table className="tbl">
        <thead><tr><th style={{ width: 160 }}>Intent</th><th>Example</th><th style={{ width: 90, textAlign: "right" }}>Confidence</th><th style={{ width: 100 }}>Flow</th><th style={{ width: 70, textAlign: "right" }}>Used</th></tr></thead>
        <tbody>
          {CBU_INTENTS.map(i => (
            <tr key={i.intent}>
              <td className="mono" style={{ fontSize: 11 }}>{i.intent}</td>
              <td className="muted" style={{ fontSize: 11.5 }}>{i.ex}</td>
              <td className="num" style={{ textAlign: "right", color: i.conf >= 0.85 ? "var(--pos)" : "var(--warn)" }}>{i.conf.toFixed(2)}</td>
              <td>{i.flow === "immediate" ? <Pill variant="pos">immediate</Pill> : i.flow === "draft" ? <Pill variant="acc">draft</Pill> : <Pill variant="warn">preview</Pill>}</td>
              <td className="num muted" style={{ textAlign: "right" }}>{i.n}×</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" />
      <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        Notes and scheduling execute straight away — a wrong entry costs nothing. Anything that touches a client's plan previews first, because reversing it after they have seen it is a different conversation.
      </div>
    </Card>
    <Card title="Command bar" sub="⌘K from anywhere in the portal">
      <div style={{ padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
          <Icon name="search" className="ic ic-sm" style={{ color: "var(--fg-dim)" }} />
          <span className="mono" style={{ fontSize: 12.5 }}>book Sophie for Thursday 10am</span>
          <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>↵</span>
        </div>
        <div style={{ padding: 11, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Pill variant="pos">schedule_checkin</Pill>
            <span className="num dim" style={{ fontSize: 10 }}>0.93</span>
          </div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Sophie Klein · Thursday 18 September, 10:00 · 30 min · calendar invite sent on confirm
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// ── Watcher · roster-wide ────────────────────────────
const CW_RULES = [
  { id: "adherence_drop",     level: "warning",  cond: "adherence falls ≥ 15 pp over 7 days",       fired: 6, muted: false, clients: 14 },
  { id: "checkin_overdue",    level: "info",     cond: "check-in ≥ 3 days late",                     fired: 8, muted: false, clients: 14 },
  { id: "plateau_detected",   level: "warning",  cond: "no progression ≥ 4 weeks with adherence > 85 %", fired: 3, muted: false, clients: 11 },
  { id: "overtraining_3strike",level: "critical",cond: "recovery < 65 + sleep < 6 h + RPE > 8, three days", fired: 2, muted: false, clients: 11 },
  { id: "silence_pattern",    level: "warning",  cond: "no client message ≥ 14 days",                fired: 4, muted: false, clients: 14 },
  { id: "plan_expiry",        level: "info",     cond: "programme ends within 7 days",               fired: 4, muted: false, clients: 9 },
  { id: "pr_logged",          level: "info",     cond: "new personal record",                        fired: 12, muted: false, clients: 14 },
  { id: "weight_rapid",       level: "warning",  cond: "± 2 % bodyweight within 7 days",             fired: 1, muted: true,  clients: 6 },
];

window.CoachWatcherView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
    <Card title="Roster watcher" sub="runs on every client write and once nightly">
      <table className="tbl">
        <thead><tr><th style={{ width: 170 }}>Rule</th><th style={{ width: 85 }}>Level</th><th>Condition</th><th style={{ width: 70, textAlign: "right" }}>Clients</th><th style={{ width: 60, textAlign: "right" }}>Fired</th><th style={{ width: 70 }}>State</th></tr></thead>
        <tbody>
          {CW_RULES.map(r => {
            const c = r.level === "critical" ? "var(--neg)" : r.level === "warning" ? "var(--warn)" : "var(--fg-dim)";
            return (
              <tr key={r.id} style={{ opacity: r.muted ? 0.6 : 1 }}>
                <td className="mono" style={{ fontSize: 10.5 }}>{r.id}</td>
                <td><Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 30%, var(--border))` }}>{r.level}</Pill></td>
                <td className="dim mono" style={{ fontSize: 10.5 }}>{r.cond}</td>
                <td className="num muted" style={{ textAlign: "right" }}>{r.clients}</td>
                <td className="num" style={{ textAlign: "right" }}>{r.fired}</td>
                <td>{r.muted ? <Pill variant="warn">muted</Pill> : <Pill variant="pos">on</Pill>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
    <div className="col-gap" style={{ gap: 14 }}>
      <Card title="Scope" sub="not every rule applies to every client">
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55, marginBottom: 11 }}>
          Plateau detection needs a progression history, so it skips the three clients who started in the last month. Rapid weight change is muted because two of your clients are in a deliberate cut and it fired on both.
        </div>
        <Row label="Rules active" value="7 of 8" />
        <Row label="Clients covered" value="14" />
        <Row label="Fires this week" value="40" />
        <Row label="Reached your queue" value="5" />
      </Card>
      <Card title="Why only five reached you">
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Twelve PR notifications were handled by the acknowledgement automation. Eight overdue check-ins got reminders without your involvement. The rest were deduplicated or below the threshold you set for interruption.
        </div>
      </Card>
    </div>
  </div>
);

// ── Guardrails ───────────────────────────────────────
const CG_LOG = [
  { at: "3 days ago", what: "Draft mentioned adjusting a client's blood pressure medication timing", action: "blocked", out: "Rewritten without the medication reference, medical coach flagged" },
  { at: "6 days ago", what: "Draft interpreted a client's cortisol result",                          action: "blocked", out: "Replaced with a referral to the client's physician" },
  { at: "1 week ago", what: "Draft used a guilt framing about a missed week",                        action: "rewritten", out: "Reframed as a factual observation with no implied judgement" },
  { at: "2 weeks ago",action: "passed", what: "Draft cited a study on protein timing",               out: "Allowed · evidence card attached, claim not made in the message body" },
];

window.CoachGuardrailsView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
    <Card title="Guardrail log" sub="every draft is screened before it reaches your queue">
      <div className="col-gap" style={{ gap: 9 }}>
        {CG_LOG.map((g, i) => {
          const c = g.action === "passed" ? "var(--pos)" : g.action === "rewritten" ? "var(--warn)" : "var(--neg)";
          return (
            <div key={i} style={{ padding: 12, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 22%, var(--border))`, borderRadius: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 30%, var(--border))` }}>{g.action}</Pill>
                <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{g.at}</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 5 }}>{g.what}</div>
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{g.out}</div>
            </div>
          );
        })}
      </div>
    </Card>
    <Card title="Rules the assistant cannot break">
      <div className="col-gap" style={{ gap: 8 }}>
        {[
          "No medication guidance, ever. Routed to the client's medical coach.",
          "No interpretation of lab results.",
          "No guilt, fear or streak-shaming framing.",
          "No scientific claim in the message body without an evidence card.",
          "No plan write. Drafts only.",
          "No message that implies it came from you when it did not.",
        ].map(t => (
          <div key={t} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
            <Icon name="x" className="ic ic-sm" style={{ color: "var(--neg)", flexShrink: 0, marginTop: 2 }} />
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="divider" />
      <Row label="Screened · 30 days" value="184 drafts" />
      <Row label="Passed" value="176" />
      <Row label="Rewritten" value="6" />
      <Row label="Blocked" value="2" />
    </Card>
  </div>
);

// ── Tone calibration ─────────────────────────────────
window.CoachToneView = () => {
  const [dir, setDir] = useState(4);
  const [warm, setWarm] = useState(2);
  const [len, setLen] = useState(2);
  const samples = {
    "4-2-2": "Four weeks with no movement on bench or row, and it is not effort. Adherence is 91 %. The volume has been the same for six weeks. I am adding a set to both.",
    "2-4-3": "I have been looking at your last month and wanted to talk it through. Bench and row have been sitting still since mid-August, which I know is frustrating when you have been this consistent — 91 % adherence is genuinely good. What I think is happening is that the volume has not changed in six weeks, so your body has stopped finding it challenging. I would like to add a set to each and see how the next fortnight goes.",
    "5-1-1": "Bench and row: four weeks static. Adherence 91 %, so not effort. Volume unchanged six weeks. Adding one set to each.",
  };
  const key = dir >= 5 ? "5-1-1" : dir <= 2 ? "2-4-3" : "4-2-2";
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", gap: 14 }}>
      <Card title="Calibration" sub="tuned against 1,240 of your own messages">
        {[["Directness", dir, setDir, "hedged", "blunt"], ["Warmth", warm, setWarm, "clinical", "personal"], ["Length", len, setLen, "terse", "expansive"]].map(([l, v, set, lo, hi]) => (
          <div key={l} style={{ marginBottom: 15 }}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{l}</span>
              <span className="num dim" style={{ marginLeft: "auto", fontSize: 11 }}>{v} / 5</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => set(n)} style={{
                  flex: 1, height: 26, borderRadius: 5, cursor: "pointer",
                  background: n <= v ? "var(--acc-coach)" : "var(--surface-2)",
                  border: "1px solid " + (n <= v ? "var(--acc-coach)" : "var(--border)"),
                  color: n <= v ? "var(--bg)" : "var(--fg-dim)",
                  fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600,
                }}>{n}</button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span className="dim" style={{ fontSize: 9.5 }}>{lo}</span>
              <span className="dim" style={{ fontSize: 9.5 }}>{hi}</span>
            </div>
          </div>
        ))}
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Your measured baseline is directness 4, warmth 2, length 2. The settings start there rather than at the middle.
        </div>
      </Card>
      <Card title="Live preview" sub="same message, your current settings">
        <div className="eyebrow" style={{ marginBottom: 7 }}>Scenario · Anna Frey, four-week plateau</div>
        <div style={{ padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12.5, lineHeight: 1.65, marginBottom: 13 }}>
          {samples[key]}
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--fg-muted)" }}>
          <span>Words <span className="num" style={{ color: "var(--fg)" }}>{samples[key].split(" ").length}</span></span>
          <span>Reading time <span className="num" style={{ color: "var(--fg)" }}>{Math.max(1, Math.round(samples[key].split(" ").length / 200 * 60))} s</span></span>
          <span className="dim" style={{ marginLeft: "auto" }}>matches your baseline: {key === "4-2-2" ? "yes" : "no"}</span>
        </div>
      </Card>
    </div>
  );
};

// ── Cost & usage ─────────────────────────────────────
window.CoachAICostView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <div className="grid g-cols-4" style={{ gap: 10 }}>
      {[["Requests · 30d", "1,420"], ["Cost · 30d", "$14.82"], ["Per client", "$1.06"], ["Zero-cost share", "51 %"]].map(([l, v]) => (
        <Card key={l} className="card-tight" style={{ padding: 13 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
          <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
        </Card>
      ))}
    </div>
    <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
      <Card title="Cost by activity" sub="30 days">
        {[["Draft generation", 6.40, "var(--acc-coach)"], ["Triage and context", 4.10, "var(--acc-buddy)"], ["Weekly digests", 2.20, "var(--acc-mkt)"], ["Roster queries", 1.60, "var(--acc-recov)"], ["Voice transcription", 0.52, "var(--acc-train)"]].map(([l, v, c]) => (
          <div key={l} style={{ display: "grid", gridTemplateColumns: "150px 1fr 60px", gap: 10, alignItems: "center", marginBottom: 9 }}>
            <span style={{ fontSize: 11.5 }}>{l}</span>
            {window.Meter && <window.Meter value={v} max={7} color={c} />}
            <span className="num" style={{ textAlign: "right", fontSize: 11.5 }}>${v.toFixed(2)}</span>
          </div>
        ))}
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Just over half of all requests never reach a language model — roster reads, score lookups and calendar queries are answered from the data directly.
        </div>
      </Card>
      <Card title="Per client · this month">
        <table className="tbl">
          <thead><tr><th>Client</th><th style={{ width: 70, textAlign: "right" }}>Requests</th><th style={{ width: 70, textAlign: "right" }}>Cost</th></tr></thead>
          <tbody>
            {[["Lukas Bauer", 218, 2.41], ["Sophie Klein", 142, 1.62], ["Anna Frey", 128, 1.44], ["Marcus Weber", 96, 0.88], ["Elena Schmidt", 88, 0.94]].map(([c, n, v]) => (
              <tr key={c}>
                <td style={{ fontSize: 11.5 }}>{c}</td>
                <td className="num muted" style={{ textAlign: "right" }}>{n}</td>
                <td className="num" style={{ textAlign: "right" }}>${v.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Lukas costs the most because prep reviews pull more context than a standard check-in. That is proportionate to what he pays.
        </div>
      </Card>
    </div>
  </div>
);
