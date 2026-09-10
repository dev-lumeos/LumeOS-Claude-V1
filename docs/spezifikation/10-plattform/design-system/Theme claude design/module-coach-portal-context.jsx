// Coach Portal — right context panel, the portal's Ops assistant per section

const OPS_CTX = {
  overview: {
    msg: "Fourteen clients, five in the queue. Lukas is the only hard deadline — peak week Monday, protocol needs your signature.",
    state: "alert",
    actions: [["message","Open queue"],["edit","Draft all"],["calendar","Today"],["brain","Ask Ops"]],
    insights: [
      { v: "warn", t: "Lukas · peak week Monday", b: "Protocol drafted and waiting. Sleep is 6.4 h against a 7.5 target, which matters more than the carbohydrate load this week.", a: ["Sign off","Open record"] },
      { v: "warn", t: "Sophie drifting quietly", b: "Logging down 18 points over ten days, training untouched. Reads as admin fatigue, not disengagement.", a: ["Send short reply"] },
      { v: "pos", t: "Marcus · 220 kg first time", b: "Bar speed faster than his 212.5 attempt in June. Draft congratulation ready, two minutes.", a: ["Approve"] },
    ],
    details: [["Roster","14 active"],["Median compliance","91 %"],["Queue","5 clients"],["MRR","€4,820"]],
  },
  athletes: {
    msg: "Eleven on track, two need a decision, one drifting. Elena is the only one still below level 2 autonomy.",
    state: "idle",
    actions: [["user","Full record"],["message","Message all"],["edit","Add note"],["plus","Invite client"]],
    insights: [
      { v: "", t: "Autonomy distribution", b: "Two at level 1–2, four at 3, eight at 4–5. Your average has climbed 0.4 levels in ninety days.", a: ["See ladder"] },
      { v: "warn", t: "Anna will not tell you", b: "Four-week plateau, 91 % adherence, no complaint. The watcher noticed before she said anything.", a: ["Open record"] },
      { v: "pos", t: "Niko · twelve weeks perfect", b: "Longest adherence streak on the roster. Low-touch by design now.", a: [] },
    ],
    details: [["Full access granted","6 of 14"],["Summary only","7"],["Training only","1"],["Pending onboarding","2"]],
  },
  checkins: {
    msg: "Seven check-ins in, three answered. Two review workflows are half-finished from yesterday.",
    state: "idle",
    actions: [["message","Reply next"],["workord","Resume review"],["edit","Templates"],["brain","Draft all"]],
    insights: [
      { v: "warn", t: "Two reviews unfinished", b: "Lukas prep review sits at step 4 of 6, Anna strength review at step 2 of 5. Both from yesterday.", a: ["Resume"] },
      { v: "", t: "Response time 3.2 h", b: "Against a 4 h target. Your slowest day is Friday, average 6.1 h.", a: [] },
    ],
    details: [["Received · 7d","14"],["Answered","11"],["Avg response","3.2 h"],["Overdue","2"]],
  },
  assist: {
    msg: "Eighteen drafts this week, fifteen sent after your approval, five edited first. Clone live for six clients.",
    state: "responding",
    actions: [["check","Approve queue"],["brain","Retrain clone"],["settings","Per-client setup"],["trend_up","Cost"]],
    insights: [
      { v: "", t: "Edit rate 28 %", b: "Five of eighteen rewritten. Plan-expiry drafts are the worst offender — the template is wrong, not the rule.", a: ["Fix template"] },
      { v: "warn", t: "Clone weak under pushback", b: "Fidelity 72 % when a client argues. That is why pushback sits outside its scope rather than merely flagged.", a: ["See fidelity"] },
      { v: "pos", t: "4.8 hours saved", b: "Drafting, triage and routine reminders. Estimated, not measured.", a: [] },
    ],
    details: [["Drafts · 7d","18"],["Auto-sent","11"],["Escalated","3"],["Cost · 30d","$14.82"]],
  },
  calendar: {
    msg: "Eight events this week. Thursday is heavy — four check-ins and a call in the same afternoon.",
    state: "idle",
    actions: [["plus","New event"],["calendar","Week view"],["message","Confirm all"],["brain","Rebalance"]],
    insights: [
      { v: "warn", t: "Thursday overloaded", b: "Four check-ins between 14:00 and 17:00 plus a consultation. Two could move to Wednesday without conflict.", a: ["Rebalance"] },
      { v: "", t: "Lukas peak week", b: "Daily contact Monday through Saturday. Blocked in already.", a: [] },
    ],
    details: [["This week","8 events"],["Check-ins","5"],["Calls","2"],["Deadlines","1"]],
  },
  plans: {
    msg: "Four programmes running with auto-delivery. Two expire within a week and need renewal drafts.",
    state: "idle",
    actions: [["plus","New plan"],["workord","Builder"],["message","Renewals"],["copy","Duplicate"]],
    insights: [
      { v: "warn", t: "Two expiring", b: "Marcus and Niko both end on the 22nd. Renewal drafts written but not sent.", a: ["Review drafts"] },
      { v: "pos", t: "PPL template · 6 assigned", b: "Highest-rated plan in your library at 4.9. Sold 18 times in the marketplace.", a: [] },
    ],
    details: [["Templates","6"],["Programmes live","4"],["Assignments","19"],["Marketplace sales","41"]],
  },
  library: {
    msg: "Six custom exercises, six recipes. Two exercises have no video, which is the most common client complaint.",
    state: "idle",
    actions: [["plus","New exercise"],["camera","Add video"],["nutrition","New recipe"],["user","Assign"]],
    insights: [
      { v: "warn", t: "Two exercises without video", b: "Landmine press and Zercher squat. Both assigned to clients who have asked about form.", a: ["Record"] },
      { v: "", t: "Most assigned", b: "Nordic hamstring curl, on eleven of fourteen plans.", a: [] },
    ],
    details: [["Own exercises","6"],["Own recipes","6"],["Platform library","1,850"],["Assignments","34"]],
  },
  alerts: {
    msg: "Seven open. One critical: Sophie hit the three-strike overtraining rule this morning.",
    state: "alert",
    actions: [["alert","Open critical"],["settings","Rule builder"],["check","Resolve"],["brain","Batch settings"]],
    insights: [
      { v: "neg", t: "Sophie · critical", b: "Recovery 58, sleep 5.8 h, RPE 8.5 for three consecutive days. Confidence 91 %, false-positive risk 4 %.", a: ["Open","Call"] },
      { v: "", t: "Forty fires, five reached you", b: "Twelve PRs handled by automation, eight reminders sent alone, the rest deduplicated.", a: ["See watcher"] },
    ],
    details: [["Critical","1"],["High","2"],["Medium","3"],["Info","1"]],
  },
  analytics: {
    msg: "Retention 92 % against a 78 % benchmark. Calorie precision is the weakest dimension across the roster.",
    state: "idle",
    actions: [["trend_up","Performance"],["layers","Patterns"],["brain","Interventions"],["download","Export"]],
    insights: [
      { v: "pos", t: "Retention 14 points above benchmark", b: "Ninety-day retention 92 %. Client LTV €4,280, referral rate 21 %.", a: [] },
      { v: "warn", t: "Friday is the weak day", b: "Cohort adherence 78 % on Fridays against 88 % Monday. Consider lighter sessions there.", a: ["See pattern"] },
      { v: "", t: "Tough love works on you", b: "Effectiveness 94 % — your highest tone variant. Humour lands at 58 %.", a: ["Tone"] },
    ],
    details: [["Retention · 90d","92 %"],["Satisfaction","4.8 ★"],["Goal completion","87 %"],["Response time","1.8 h"]],
  },
  inbox: {
    msg: "Twelve notifications, five unread. Nothing escalated overnight.",
    state: "idle",
    actions: [["check","Mark all read"],["settings","Delivery rules"],["bell","Push settings"],["brain","Digest"]],
    insights: [
      { v: "", t: "Five unread", b: "Three PR notifications, two check-in submissions. All non-urgent.", a: ["Read all"] },
      { v: "pos", t: "Quiet overnight", b: "No critical alerts between 22:00 and 06:00. Quiet hours held.", a: [] },
    ],
    details: [["Unread","5"],["This week","42"],["Push sent","8"],["Quiet hours","22:00–06:00"]],
  },
  team: {
    msg: "Five members, you plus two senior and two coaches. Audit trail clean, 1,420 entries this month.",
    state: "idle",
    actions: [["plus","Invite member"],["shield","Permissions"],["download","Export audit"],["user","Reassign"]],
    insights: [
      { v: "", t: "Roster load uneven", b: "You carry 14, Erik 8, Hanna 6, Paul 4, Carla 5. Yours is the heaviest by half.", a: ["Reassign"] },
      { v: "pos", t: "Audit clean", b: "No permission escalations, no exports outside role scope.", a: ["Review"] },
    ],
    details: [["Members","5"],["Head","1"],["Senior","2"],["Audit entries · 30d","1,420"]],
  },
};

const OPS_ORB = ({ state = "idle", size = 30 }) => {
  const c = { idle: "var(--acc-buddy)", alert: "var(--warn)", responding: "var(--acc-recov)" }[state] || "var(--acc-buddy)";
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, flexShrink: 0 }}>
      <defs>
        <radialGradient id={"oo" + state} cx="50%" cy="40%">
          <stop offset="0%" stopColor={c} stopOpacity="0.95" />
          <stop offset="100%" stopColor={c} stopOpacity="0.06" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#oo${state})`}>
        {state !== "idle" && <animate attributeName="r" values="40;44;40" dur="2.4s" repeatCount="indefinite" />}
      </circle>
      <circle cx="50" cy="50" r="15" fill={c} opacity="0.75">
        {state === "responding" && <animate attributeName="r" values="12;19;12" dur="1.1s" repeatCount="indefinite" />}
      </circle>
      <circle cx="50" cy="50" r="7" fill={c}>
        {state === "alert" && <animate attributeName="fill-opacity" values="1;0.4;1" dur="0.7s" repeatCount="indefinite" />}
      </circle>
      <circle cx="50" cy="50" r="2.5" fill="var(--bg)" opacity="0.75" />
    </svg>
  );
};

window.PortalContextPanel = ({ section, onNav }) => {
  const [dismissed, setDismissed] = useState([]);
  const c = OPS_CTX[section] || OPS_CTX.overview;
  const vc = { warn: "var(--warn)", neg: "var(--neg)", pos: "var(--pos)", "": "var(--acc-buddy)" };

  return (
    <aside style={{
      width: 306, flexShrink: 0, borderLeft: "1px solid var(--border)",
      background: "color-mix(in srgb, var(--surface) 35%, var(--bg))",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Ops greeting */}
      <div style={{ padding: "13px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <OPS_ORB state={c.state} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Ops</span>
              <span className="dim mono" style={{ fontSize: 9 }}>· {c.state}</span>
            </div>
            <div className="dim mono" style={{ fontSize: 9 }}>your assistant</div>
          </div>
          <button className="icon-btn" onClick={() => onNav && onNav("assist")} title="Open assistant">
            <Icon name="ext" className="ic ic-sm" />
          </button>
        </div>
        <div style={{
          padding: 11, borderRadius: 8, fontSize: 11.5, lineHeight: 1.55,
          background: c.state === "alert" ? "color-mix(in srgb, var(--warn) 7%, var(--surface))" : "color-mix(in srgb, var(--acc-buddy) 6%, var(--surface))",
          border: `1px solid color-mix(in srgb, ${c.state === "alert" ? "var(--warn)" : "var(--acc-buddy)"} 22%, var(--border))`,
        }}>{c.msg}</div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "11px 12px", borderBottom: "1px solid var(--border)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Quick actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {c.actions.map(([ic, l]) => (
            <button key={l} className="btn btn-sm" style={{ height: 28, fontSize: 10.5, justifyContent: "flex-start", padding: "0 8px" }}>
              <Icon name={ic} className="ic ic-sm" />{l}
            </button>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ flex: 1, overflowY: "auto", padding: "11px 12px" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Insights</div>
        <div className="col-gap" style={{ gap: 8 }}>
          {c.insights.map((ins, i) => dismissed.includes(i) ? null : (
            <div key={i} style={{
              padding: 11, borderRadius: 7, position: "relative",
              background: "var(--surface)",
              border: `1px solid color-mix(in srgb, ${vc[ins.v]} 20%, var(--border))`,
            }}>
              <div style={{ position: "absolute", left: 0, top: 11, bottom: 11, width: 2, background: vc[ins.v], borderRadius: "0 2px 2px 0" }} />
              <div style={{ paddingLeft: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, flex: 1, lineHeight: 1.35 }}>{ins.t}</span>
                  <button className="icon-btn" style={{ width: 16, height: 16, flexShrink: 0 }} onClick={() => setDismissed(d => [...d, i])}>
                    <Icon name="x" className="ic" style={{ width: 9, height: 9, color: "var(--fg-dim)" }} />
                  </button>
                </div>
                <div className="muted" style={{ fontSize: 11, lineHeight: 1.5, marginBottom: ins.a.length ? 8 : 0 }}>{ins.b}</div>
                {ins.a.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {ins.a.map((a, j) => (
                      <button key={a} className={j === 0 ? "btn btn-sm" : "btn btn-sm btn-ghost"} style={{ height: 22, fontSize: 10 }}>{a}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "11px 12px", borderTop: "1px solid var(--border)" }}>
        <div className="eyebrow" style={{ marginBottom: 7 }}>Section details</div>
        <div className="col-gap" style={{ gap: 0 }}>
          {c.details.map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "5px 0" }}>
              <span className="dim" style={{ fontSize: 10.5, flex: 1, minWidth: 0 }}>{l}</span>
              <span className="num" style={{ fontSize: 11 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
