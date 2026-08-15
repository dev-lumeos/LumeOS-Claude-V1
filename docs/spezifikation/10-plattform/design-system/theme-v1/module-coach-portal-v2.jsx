// Coach Portal · step-4 gaps
// Ref: HumanCoach SPEC_05 §7 (client dashboard), §8 (10 rule templates),
//      SPEC_09 (client status / risk), SPEC_11 §5 (autonomy column, batching, audit filters)

// ── Client status + risk (SPEC_09) ──────────────────────────
const CLIENT_STATUS = {
  good:      { label: "Good",      color: "var(--pos)",  desc: "On plan, no open alerts" },
  attention: { label: "Attention", color: "var(--warn)", desc: "Trend declining or 1 open alert" },
  critical:  { label: "Critical",  color: "var(--neg)",  desc: "Adherence < 60 % or a high/critical alert" },
};

function clientStatus(a) {
  if (a.alerts >= 2 || a.compliance < 60) return "critical";
  if (a.alerts >= 1 || a.compliance < 80) return "attention";
  return "good";
}

// SPEC_11: alerts × 30 + low_compliance_penalty + days_since_last_session
function attentionScore(a) {
  const days = /(\d+)d ago/.test(a.lastSession) ? parseInt(RegExp.$1) : 0;
  return a.alerts * 30 + Math.max(0, 90 - a.compliance) * 1.2 + days * 4;
}

// ── 10 system rule templates (SPEC_05 §8) ───────────────────
const RULE_TEMPLATES_SPEC = [
  { name: "Protein alert",            cond: "protein_adherence_pct < 70 AND training.session_today",              sev: "MEDIUM",   cat: "nutrition" },
  { name: "Overtraining warning",     cond: "recovery.score_trend_down (7d) AND training.volume_trend_up (7d)",   sev: "HIGH",     cat: "training" },
  { name: "Recovery critical",        cond: "recovery.score_7d_avg < 50",                                          sev: "HIGH",     cat: "recovery" },
  { name: "Sleep alarm",              cond: "recovery.sleep_hours < 6 AND 3+ days",                                sev: "MEDIUM",   cat: "recovery" },
  { name: "Supplement drop-off",      cond: "supplements.compliance < 50 AND 5+ days",                             sev: "MEDIUM",   cat: "supplements" },
  { name: "Streak achievement",       cond: "training.consecutive_days >= 7",                                      sev: "INFO",     cat: "training" },
  { name: "Adherence drop",           cond: "nutrition.daily_score_trend_down (5d) AND under 70",                  sev: "MEDIUM",   cat: "nutrition" },
  { name: "Medical alert forward",    cond: "medical.critical_flag = true",                                        sev: "CRITICAL", cat: "medical" },
  { name: "Missed check-in",          cond: "checkin.missed = true AND days_since > 3",                            sev: "LOW",      cat: "general" },
  { name: "Inactivity",               cond: "training.days_since_last_session > 7",                                sev: "MEDIUM",   cat: "training" },
];

const SEV_COLOR = { CRITICAL: "var(--neg)", HIGH: "var(--warn)", MEDIUM: "var(--acc-recov)", LOW: "var(--fg-dim)", INFO: "var(--acc-coach)" };

// ── Client dashboard fixture (SPEC_05 §7) ───────────────────
const CLIENT_DASH = {
  name: "Sophie Klein", autonomy: 2, autonomyName: "Developing",
  program: "Upper-Lower Hypertrophy", week: 6, weeks: 12, start: "2026-02-01",
  status: "critical",
  compliance: { training: 85, nutrition: 65, supplements: 40, recovery: 62 },
  trends:     { training: "stable", nutrition: "declining", supplements: "declining", recovery: "declining" },
  recoveryChain: [71, 65, 58, 54, 52],
  sleepAvg: 5.9, sleepTarget: 7.5,
  weight: "82.3 kg", weightDelta: "-0.5 kg/wk", weightOk: true,
  pr: "Bench 100 kg (+2.5)",
  bloodwork: { date: "2026-02-14", markers: [
    { k: "Hematocrit", v: "48 %", ok: true },
    { k: "Vitamin D",  v: "28 ng/mL", ok: false },
    { k: "ALT",        v: "38 U/L", ok: false },
  ]},
  alerts: [
    { sev: "HIGH",   text: "Recovery score critically low" },
    { sev: "MEDIUM", text: "Supplement compliance under 50 %" },
  ],
  lastMessage: "yesterday 18:32",
  nextCheckin: "Monday",
};

// ── Audit categories ────────────────────────────────────────
const AUDIT_CATS = ["all", "data-access", "export", "rule", "comm", "autonomy", "team", "alert"];

// ════════════════════════════════════════════════════════════

// 1 · Athletes table with autonomy column + smart prioritisation + inline actions
window.PortalAthletesV2 = () => {
  const ctx = React.useContext(window.CoachCtx || React.createContext(null)) || {};
  const [sort, setSort] = useState("attention");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const auto = window.ATHLETE_AUTONOMY || {};
  const ladder = window.AUTONOMY_LEVELS || [];

  let rows = [...(window.PORTAL_ATHLETES || [])];
  if (filter === "alerts") rows = rows.filter(a => a.alerts > 0);
  if (filter === "critical") rows = rows.filter(a => clientStatus(a) === "critical");
  if (q) rows = rows.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));
  if (sort === "attention")  rows.sort((a, b) => attentionScore(b) - attentionScore(a));
  if (sort === "compliance") rows.sort((a, b) => a.compliance - b.compliance);
  if (sort === "name")       rows.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap"}}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search athletes…"
          style={{flex: 1, minWidth: 180, height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["all","All"],["alerts","With alerts"],["critical","Critical"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} className={filter === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
          <option value="attention">Sort · Attention score</option>
          <option value="compliance">Sort · Compliance</option>
          <option value="name">Sort · Name</option>
        </select>
        <button className="btn"><Icon name="download" className="ic ic-sm"/>Export</button>
      </div>

      {sort === "attention" && (
        <div style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 12, fontSize: 11, color: "var(--fg-muted)", fontFamily: "var(--font-mono)"}}>
          attention = alerts × 30 + max(0, 90 − compliance) × 1.2 + days_since_last_session × 4
        </div>
      )}

      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 26}}></th>
              <th>Athlete</th>
              <th style={{width: 150}}>Plan</th>
              <th style={{width: 130}}>Autonomy</th>
              <th style={{width: 90, textAlign: "right"}}>Compliance</th>
              <th style={{width: 60, textAlign: "right"}}>Alerts</th>
              <th style={{width: 110}}>Last session</th>
              <th style={{width: 60, textAlign: "right"}}>Score</th>
              <th style={{width: 96}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => {
              const st = CLIENT_STATUS[clientStatus(a)];
              const au = auto[a.id];
              const lv = au && ladder.find(l => l.lvl === au.level);
              return (
                <tr key={a.id} className="clickable" style={{cursor: "pointer"}}
                    onClick={() => ctx.open && ctx.open("athleteDet", a)}>
                  <td><span title={st.desc} style={{display: "inline-block", width: 7, height: 7, borderRadius: 999, background: st.color}}/></td>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                      <div style={{width: 24, height: 24, borderRadius: 5, background: "var(--surface-2)", color: "var(--fg-muted)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 600}}>{a.avatar}</div>
                      <div>
                        <div style={{fontSize: 12.5, fontWeight: 500}}>{a.name}</div>
                        <div className="dim mono" style={{fontSize: 9.5}}>since {a.since}</div>
                      </div>
                    </div>
                  </td>
                  <td className="muted" style={{fontSize: 11}}>{a.plan}</td>
                  <td>
                    {au ? (
                      <div style={{display: "flex", alignItems: "center", gap: 6}}>
                        <div style={{width: 16, height: 16, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600}}>{au.level}</div>
                        <span style={{fontSize: 11}}>{lv?.name}</span>
                        <span style={{fontSize: 10, color: au.trend === "up" ? "var(--pos)" : au.trend === "down" ? "var(--warn)" : "var(--fg-dim)"}}>
                          {au.trend === "up" ? "↑" : au.trend === "down" ? "↓" : "→"}
                        </span>
                      </div>
                    ) : <span className="dim">—</span>}
                  </td>
                  <td className="num" style={{textAlign: "right", color: a.compliance >= 90 ? "var(--pos)" : a.compliance >= 80 ? "var(--warn)" : "var(--neg)"}}>{a.compliance}%</td>
                  <td style={{textAlign: "right"}}>{a.alerts > 0 ? <Pill variant="warn">{a.alerts}</Pill> : <span className="dim">—</span>}</td>
                  <td className="num muted" style={{fontSize: 11}}>{a.lastSession}</td>
                  <td className="num dim" style={{textAlign: "right", fontSize: 11}}>{attentionScore(a).toFixed(0)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{display: "flex", gap: 2}}>
                      <button className="icon-btn" title="Message"><Icon name="message" className="ic ic-sm"/></button>
                      <button className="icon-btn" title="Call"><Icon name="bell" className="ic ic-sm"/></button>
                      <button className="icon-btn" title="Adjust plan"><Icon name="edit" className="ic ic-sm"/></button>
                      <button className="icon-btn" title="Details" onClick={() => ctx.open && ctx.open("athleteDet", a)}><Icon name="chevron_right" className="ic ic-sm"/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div style={{display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: "var(--fg-muted)"}}>
        {Object.entries(CLIENT_STATUS).map(([k, v]) => (
          <span key={k} style={{display: "inline-flex", alignItems: "center", gap: 6}}>
            <span style={{width: 7, height: 7, borderRadius: 999, background: v.color}}/>{v.label} · {v.desc}
          </span>
        ))}
      </div>
    </div>
  );
};

// 2 · Client dashboard card (SPEC_05 §7)
window.ClientDashboardCard = () => {
  const c = CLIENT_DASH;
  const st = CLIENT_STATUS[c.status];
  const trendArrow = t => t === "declining" ? "↓" : t === "improving" ? "↑" : "→";
  const trendCol   = t => t === "declining" ? "var(--warn)" : t === "improving" ? "var(--pos)" : "var(--fg-dim)";
  return (
    <Card>
      <div style={{display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14}}>
        <div style={{width: 40, height: 40, borderRadius: 8, background: "var(--surface-2)", color: "var(--fg-muted)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13}}>SK</div>
        <div style={{flex: 1}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap"}}>
            <span style={{fontSize: 15, fontWeight: 600}}>{c.name}</span>
            <Pill style={{color: st.color, borderColor: `color-mix(in srgb, ${st.color} 35%, var(--border))`, background: `color-mix(in srgb, ${st.color} 8%, transparent)`}}>{st.label}</Pill>
            <Pill><span style={{width: 14, height: 14, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "inline-grid", placeItems: "center", fontSize: 8, fontWeight: 600, marginRight: 4}}>{c.autonomy}</span>{c.autonomyName}</Pill>
          </div>
          <div className="muted" style={{fontSize: 11.5}}>{c.program} · week {c.week} of {c.weeks} · started {c.start}</div>
        </div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-sm"><Icon name="message" className="ic ic-sm"/>Message</button>
          <button className="btn btn-sm"><Icon name="edit" className="ic ic-sm"/>Adjust plan</button>
          <button className="btn btn-sm">Details</button>
        </div>
      </div>

      <div className="eyebrow" style={{marginBottom: 8}}>Compliance · last 7 days</div>
      <div className="col-gap" style={{gap: 7, marginBottom: 14}}>
        {Object.entries(c.compliance).map(([k, v]) => (
          <div key={k} style={{display: "grid", gridTemplateColumns: "110px 1fr 44px 90px", gap: 10, alignItems: "center", fontSize: 11.5}}>
            <span className="muted" style={{textTransform: "capitalize"}}>{k}</span>
            <Meter value={v} color={v >= 80 ? "var(--pos)" : v >= 60 ? "var(--warn)" : "var(--neg)"}/>
            <span className="num" style={{textAlign: "right"}}>{v}%</span>
            <span className="mono" style={{fontSize: 10.5, color: trendCol(c.trends[k])}}>{trendArrow(c.trends[k])} {c.trends[k]}</span>
          </div>
        ))}
      </div>

      <div className="grid g-cols-2" style={{gap: 12, marginBottom: 14}}>
        <div style={{padding: 10, background: "color-mix(in srgb, var(--neg) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 22%, var(--border))", borderRadius: 6}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Recovery trend</div>
          <div style={{display: "flex", alignItems: "center", gap: 6}}>
            {c.recoveryChain.map((v, i) => (
              <React.Fragment key={i}>
                <span className="num" style={{fontSize: 13, color: i === c.recoveryChain.length - 1 ? "var(--neg)" : "var(--fg-muted)"}}>{v}</span>
                {i < c.recoveryChain.length - 1 && <span className="dim" style={{fontSize: 10}}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{fontSize: 10.5, color: "var(--neg)", marginTop: 4}}>five sessions of continuous decline</div>
        </div>
        <div style={{padding: 10, background: "color-mix(in srgb, var(--neg) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 22%, var(--border))", borderRadius: 6}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Sleep average</div>
          <div style={{display: "flex", alignItems: "baseline", gap: 6}}>
            <span className="num" style={{fontSize: 17, color: "var(--neg)"}}>{c.sleepAvg} h</span>
            <span className="dim" style={{fontSize: 11}}>target {c.sleepTarget} h</span>
          </div>
          <div style={{fontSize: 10.5, color: "var(--fg-muted)", marginTop: 4}}>1.6 h short every night</div>
        </div>
      </div>

      <div className="grid g-cols-2" style={{gap: 12, marginBottom: 14}}>
        <Row label="Body weight" value={`${c.weight} · ${c.weightDelta}`}/>
        <Row label="Recent PR" value={c.pr}/>
      </div>

      <div className="eyebrow" style={{marginBottom: 6}}>Bloodwork · {c.bloodwork.date}</div>
      <div style={{display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14}}>
        {c.bloodwork.markers.map(m => (
          <Pill key={m.k} variant={m.ok ? "pos" : "warn"}>{m.k} {m.v}</Pill>
        ))}
      </div>

      <div className="eyebrow" style={{marginBottom: 6}}>Open alerts · {c.alerts.length}</div>
      <div className="col-gap" style={{gap: 5, marginBottom: 14}}>
        {c.alerts.map((a, i) => (
          <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
            <Pill style={{color: SEV_COLOR[a.sev], borderColor: `color-mix(in srgb, ${SEV_COLOR[a.sev]} 35%, var(--border))`}}>{a.sev}</Pill>
            {a.text}
          </div>
        ))}
      </div>

      <div className="divider"/>
      <div style={{display: "flex", gap: 16, fontSize: 11, color: "var(--fg-muted)"}}>
        <span>Last message <span style={{color: "var(--fg)"}}>{c.lastMessage}</span></span>
        <span>Next check-in <span style={{color: "var(--fg)"}}>{c.nextCheckin}</span></span>
        <button className="btn btn-ghost btn-sm" style={{marginLeft: "auto"}}>Acknowledge alerts</button>
      </div>
    </Card>
  );
};

// 3 · Rule marketplace with the 10 spec templates
window.RuleTemplatesSpec = () => (
  <div>
    <div style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 14, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      System templates ship enabled for every coach. Clone one to change its thresholds — the original stays untouched.
    </div>
    <Card>
      <table className="tbl">
        <thead><tr><th style={{width: 200}}>Template</th><th>Condition</th><th style={{width: 110}}>Category</th><th style={{width: 90}}>Severity</th><th style={{width: 130, textAlign: "right"}}>Action</th></tr></thead>
        <tbody>
          {RULE_TEMPLATES_SPEC.map(t => (
            <tr key={t.name}>
              <td style={{fontSize: 12.5, fontWeight: 500}}>{t.name}</td>
              <td className="mono muted" style={{fontSize: 10.5}}>{t.cond}</td>
              <td><Pill>{t.cat}</Pill></td>
              <td><Pill style={{color: SEV_COLOR[t.sev], borderColor: `color-mix(in srgb, ${SEV_COLOR[t.sev]} 35%, var(--border))`}}>{t.sev}</Pill></td>
              <td style={{textAlign: "right"}}>
                <button className="btn btn-ghost btn-sm">Clone</button>
                <button className="btn btn-sm" style={{marginLeft: 4}}>Configure</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// 4 · Smart batching for alerts
window.AlertBatching = () => {
  const alerts = window.SMART_ALERTS || [];
  const byAthlete = {};
  alerts.forEach(a => { (byAthlete[a.athlete] ||= []).push(a); });
  const batched = Object.entries(byAthlete).filter(([, v]) => v.length > 1);
  const single  = Object.entries(byAthlete).filter(([, v]) => v.length === 1);
  if (batched.length === 0) return null;
  return (
    <Card title="Batched" sub={`${batched.length} athlete${batched.length === 1 ? "" : "s"} with more than one open alert`} style={{marginBottom: 12}}>
      <div className="col-gap" style={{gap: 8}}>
        {batched.map(([name, list]) => {
          const worst = list.reduce((w, a) => tierOf(a.severity) > tierOf(w.severity) ? a : w, list[0]);
          return (
            <div key={name} style={{padding: 12, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${SEV_COLOR[worst.severity]} 25%, var(--border))`, borderRadius: 6}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 13, fontWeight: 600}}>{name}</span>
                <Pill style={{color: SEV_COLOR[worst.severity], borderColor: `color-mix(in srgb, ${SEV_COLOR[worst.severity]} 35%, var(--border))`}}>{list.length} alerts · worst {worst.severity}</Pill>
                <div style={{marginLeft: "auto", display: "flex", gap: 4}}>
                  <button className="btn btn-sm"><Icon name="message" className="ic ic-sm"/>One message</button>
                  <button className="btn btn-ghost btn-sm">Expand</button>
                </div>
              </div>
              <div className="col-gap" style={{gap: 4}}>
                {list.map(a => (
                  <div key={a.id} style={{display: "flex", alignItems: "center", gap: 8, fontSize: 11.5}}>
                    <span style={{width: 5, height: 5, borderRadius: 999, background: SEV_COLOR[a.severity]}}/>
                    <span className="mono dim" style={{fontSize: 10}}>{a.id}</span>
                    <span className="muted">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="divider"/>
      <div className="dim" style={{fontSize: 11, lineHeight: 1.5}}>
        {single.length} further athlete{single.length === 1 ? " has" : "s have"} a single alert — listed individually below.
      </div>
    </Card>
  );
};
const tierOf = s => ({ INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[s] ?? 0);

// 5 · Audit log with filter, search and export
window.AuditLogV2 = () => {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const rows = (window.COACH_AUDIT || []).filter(e => {
    if (cat !== "all" && e.cat !== cat) return false;
    if (q && !(e.action + e.who).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <Card title="Audit log" sub={`${rows.length} of 1,420 entries · every coach action is recorded`}
      actions={<button className="btn btn-ghost btn-sm"><Icon name="download" className="ic ic-sm"/>Export CSV</button>}>
      <div style={{display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center"}}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search action or actor…"
          style={{flex: 1, minWidth: 180, height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
        {AUDIT_CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{c}</button>
        ))}
      </div>
      <table className="tbl">
        <thead><tr><th style={{width: 150}}>Timestamp</th><th style={{width: 160}}>Actor</th><th>Action</th><th style={{width: 110}}>Category</th></tr></thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={i}>
              <td className="num muted" style={{fontSize: 11}}>{e.ts}</td>
              <td className="mono" style={{fontSize: 11}}>{e.who}</td>
              <td style={{fontSize: 12}}>{e.action}</td>
              <td><Pill>{e.cat}</Pill></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="4" className="dim" style={{textAlign: "center", padding: 20}}>No entries match.</td></tr>}
        </tbody>
      </table>
    </Card>
  );
};

Object.assign(window, { CLIENT_STATUS, clientStatus, attentionScore, RULE_TEMPLATES_SPEC, CLIENT_DASH });
