// Coach Portal — Client Detail 7-tab layout, Alert bulk actions,
// Adherence heatmap/benchmark, Autonomy history, Program builder, Check-in editor.
// Closes SPEC_10 component gaps.

// ── Client Detail · 7 tabs with permission locks ─────
const CD_PERMS = {
  training: "full", nutrition: "full", recovery: "summary",
  supplements: "summary", medical: "none", goals: "full",
};

window.PermissionLock = ({ module }) => (
  <div style={{
    padding: "40px 24px", textAlign: "center",
    background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 9, margin: "0 auto 11px",
      background: "var(--surface-2)", color: "var(--fg-dim)",
      display: "grid", placeItems: "center",
    }}><Icon name="shield" className="ic ic-lg" /></div>
    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>No access to {module}</div>
    <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, maxWidth: 340, margin: "0 auto" }}>
      The client has not granted access to this module. This is their decision — the portal does not prompt them and offers no way to request it from here.
    </div>
  </div>
);

const CD_SUMMARY_ONLY = ({ module, score, trend }) => (
  <Card title={`${module} · summary access`} sub="score and trend only · detail withheld">
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {window.Ring && <window.Ring value={score} max={100} size={84} stroke={7} color="var(--acc-coach)" label="score" />}
      <div style={{ flex: 1 }}>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
          At summary level you see the aggregate score and its direction. Individual entries, timestamps and notes stay with the client.
        </div>
        <Row label="7-day average" value={`${score} / 100`} />
        <Row label="Trend" value={trend} />
        <Row label="Access level" value="summary · granted by client" />
      </div>
    </div>
  </Card>
);

window.ClientDetailLayout = ({ athlete, onClose }) => {
  const a = athlete || (window.PORTAL_ATHLETES || [])[0];
  const [tab, setTab] = useState("overview");
  const auto = (window.ATHLETE_AUTONOMY || {})[a.id];
  const ladder = window.AUTONOMY_LEVELS || [];
  const lv = auto && ladder.find(l => l.lvl === auto.level);

  const TABS = [
    { id: "overview",    label: "Overview" },
    { id: "training",    label: "Training",    perm: "training" },
    { id: "nutrition",   label: "Nutrition",   perm: "nutrition" },
    { id: "recovery",    label: "Recovery",    perm: "recovery" },
    { id: "supplements", label: "Supplements", perm: "supplements" },
    { id: "medical",     label: "Medical",     perm: "medical" },
    { id: "goals",       label: "Goals",       perm: "goals" },
    { id: "chat",        label: "Chat & notes" },
  ];

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{ width: 880, maxHeight: "92vh" }} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>{a.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>{a.name}</span>
              {auto && <Pill variant="acc">L{auto.level} · {lv?.name}</Pill>}
              <Pill>{a.plan}</Pill>
            </div>
            <div className="dim mono" style={{ fontSize: 10.5 }}>client since {a.since} · last session {a.lastSession}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic" /></button>
        </div>

        <div style={{ display: "flex", gap: 3, padding: "0 16px", borderBottom: "1px solid var(--border)", overflowX: "auto", flexShrink: 0 }}>
          {TABS.map(t => {
            const p = t.perm ? CD_PERMS[t.perm] : "full";
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "9px 11px", fontSize: 11.5, whiteSpace: "nowrap", cursor: "pointer",
                background: "transparent", border: "none", marginBottom: -1,
                borderBottom: `2px solid ${tab === t.id ? "var(--acc-coach)" : "transparent"}`,
                color: tab === t.id ? "var(--fg)" : p === "none" ? "var(--fg-dim)" : "var(--fg-muted)",
                fontWeight: tab === t.id ? 600 : 400,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {t.label}
                {p === "none" && <Icon name="shield" className="ic" style={{ width: 9, height: 9, opacity: 0.6 }} />}
                {p === "summary" && <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--warn)", opacity: 0.7 }} />}
              </button>
            );
          })}
        </div>

        <div className="modal-body" style={{ overflowY: "auto", padding: 16 }}>
          {tab === "overview" && (
            <>
              <div className="grid g-cols-4" style={{ gap: 9, marginBottom: 14 }}>
                {[["Status", a.alerts > 0 ? "attention" : "good"], ["Compliance", a.compliance + " %"], ["Open alerts", a.alerts], ["Autonomy", auto ? `L${auto.level}` : "—"]].map(([l, v]) => (
                  <div key={l} style={{ padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                    <div className="num" style={{ fontSize: 15, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="eyebrow" style={{ marginBottom: 7 }}>Permission map</div>
              <div className="grid g-cols-3" style={{ gap: 8, marginBottom: 14 }}>
                {Object.entries(CD_PERMS).map(([m, p]) => (
                  <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                    <span style={{ fontSize: 11.5, flex: 1, textTransform: "capitalize" }}>{m}</span>
                    <Pill variant={p === "full" ? "pos" : p === "summary" ? "warn" : ""}>{p}</Pill>
                  </div>
                ))}
              </div>
              <div className="eyebrow" style={{ marginBottom: 7 }}>Billing</div>
              <Row label="Retainer" value="€180 / month" />
              <Row label="Next invoice" value="1 October 2026" />
              <Row label="Lifetime value" value="€4,140" />
              <Row label="Last contact" value="2 days ago · message" />
            </>
          )}
          {tab === "training" && (
            <div className="col-gap" style={{ gap: 12 }}>
              <Card title="Volume by muscle · 4 weeks" sub="full access">
                {window.BarSeries && <window.BarSeries data={[56, 72, 40, 32, 36, 64, 36, 40]} labels={["Chest","Back","Sh","Bi","Tri","Quad","Ham","Glut"]} h={90} color="var(--acc-train)" />}
              </Card>
              <Card title="Strength progression" sub="bench e1RM · 12 weeks">
                {window.LineChart && <window.LineChart h={150} range={[95, 130]} xLabels={["w1","","","w4","","","w7","","","w10","","w12"]} series={[{ data: [102,105,105,107.5,110,112.5,110,115,117.5,117.5,120,122.5], color: "var(--acc-train)" }]} />}
              </Card>
              <Card title="Recent sessions">
                <table className="tbl">
                  <tbody>
                    {[["Today 07:14","Push B","18 sets","6.2 t"],["Sat","Pull A","20 sets","7.1 t"],["Thu","Legs A","22 sets","9.4 t"]].map((r, i) => (
                      <tr key={i}><td className="num muted" style={{width: 90}}>{r[0]}</td><td style={{fontSize: 12}}>{r[1]}</td><td className="num muted">{r[2]}</td><td className="num" style={{textAlign: "right"}}>{r[3]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
          {tab === "nutrition" && (
            <div className="col-gap" style={{ gap: 12 }}>
              <Card title="Macro adherence · 14 days" sub="full access">
                {window.LineChart && <window.LineChart h={150} range={[60, 105]} xLabels={["","","","","d5","","","","","d10","","","","today"]} series={[{ data: [88,92,84,90,94,86,78,88,92,96,90,88,94,92], color: "var(--acc-nutri)" }]} />}
              </Card>
              <Card title="Today's split">
                {window.DonutBreakdown && <window.DonutBreakdown centerValue="2,410" centerLabel="kcal" segments={[
                  { label: "Protein · 182 g", value: 728, color: "var(--acc-train)", display: "728" },
                  { label: "Carbs · 268 g",   value: 1072, color: "var(--acc-nutri)", display: "1072" },
                  { label: "Fat · 68 g",      value: 612, color: "var(--acc-goals)", display: "612" },
                ]} />}
              </Card>
            </div>
          )}
          {tab === "recovery"    && <CD_SUMMARY_ONLY module="Recovery" score={74} trend="declining · −6 over 14 days" />}
          {tab === "supplements" && <CD_SUMMARY_ONLY module="Supplements" score={91} trend="stable" />}
          {tab === "medical"     && <window.PermissionLock module="Medical" />}
          {tab === "goals" && (
            <div className="col-gap" style={{ gap: 12 }}>
              <Card title="Active phase" sub="contest prep · 6 weeks out">
                <Row label="Phase" value="contest_prep" />
                <Row label="Weeks out" value="6" />
                <Row label="Target rate" value="0.7 % BW / week" />
                <Row label="Actual rate" value="0.8 % BW / week" />
                <Row label="TDEE (adaptive)" value="2,840 kcal" />
              </Card>
              <Card title="Trajectory" sub="weight vs planned">
                {window.LineChart && <window.LineChart h={150} range={[78, 90]} xLabels={["w-8","","w-6","","w-4","","w-2","now"]} series={[
                  { data: [88.2, 87.1, 86.0, 85.2, 84.1, 83.4, 82.6, 82.0], color: "var(--acc-goals)" },
                  { data: [88.2, 87.3, 86.4, 85.5, 84.6, 83.7, 82.8, 82.0], color: "var(--fg-dim)", dashed: true },
                ]} />}
              </Card>
            </div>
          )}
          {tab === "chat" && (
            <div className="col-gap" style={{ gap: 10 }}>
              {[
                { who: "coach", at: "today 09:14", body: "Weight is up 1.2 kg since Saturday — that is sodium and water from the meal out, not fat. Hold the plan, re-weigh Wednesday." },
                { who: "client", at: "today 08:52", body: "Weight is up 1.2 kg since Saturday — should I worry?" },
                { who: "coach", at: "Sat 17:30", body: "Prep review done. Strength is holding at 96 % of baseline, so the deficit is where it should be. No change this week." },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.who === "coach" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "76%", padding: "10px 13px", borderRadius: 9,
                    background: m.who === "coach" ? "color-mix(in srgb, var(--acc-coach) 14%, var(--surface))" : "var(--surface)",
                    border: "1px solid var(--border)",
                  }}>
                    <div className="dim mono" style={{ fontSize: 9.5, marginBottom: 3 }}>{m.who === "coach" ? "You" : a.name} · {m.at}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.5 }}>{m.body}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <input placeholder="Write a message…" style={{ flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 11px", fontSize: 12 }} />
                <button className="btn btn-primary btn-sm">Send</button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn"><Icon name="calendar" className="ic ic-sm" />Schedule</button>
          <button className="btn"><Icon name="edit" className="ic ic-sm" />Adjust plan</button>
          <button className="btn btn-primary"><Icon name="message" className="ic ic-sm" />Message</button>
        </div>
      </div>
    </div>
  );
};

// ── Adherence heatmap + benchmark ────────────────────
window.AdherenceHeatmapView = () => {
  const athletes = (window.PORTAL_ATHLETES || []).slice(0, 10);
  const days = 28;
  const cell = (ai, di) => {
    const base = athletes[ai].compliance;
    const n = Math.sin(ai * 3.1 + di * 0.7) * 14 + Math.cos(di * 1.3) * 6;
    return Math.max(20, Math.min(100, Math.round(base + n)));
  };
  const col = v => v >= 90 ? "var(--pos)" : v >= 75 ? "var(--acc-recov)" : v >= 60 ? "var(--warn)" : "var(--neg)";

  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <Card title="Adherence heatmap" sub="10 athletes × 28 days · weighted across all modules">
        <div style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: 8 }}>
          <div />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${days}, 1fr)`, gap: 2, marginBottom: 3 }}>
            {Array.from({ length: days }, (_, i) => (
              <span key={i} className="mono" style={{ fontSize: 7.5, color: "var(--fg-dim)", textAlign: "center" }}>{(i + 1) % 7 === 1 ? i + 1 : ""}</span>
            ))}
          </div>
          {athletes.map((a, ai) => (
            <React.Fragment key={a.id}>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${days}, 1fr)`, gap: 2 }}>
                {Array.from({ length: days }, (_, di) => {
                  const v = cell(ai, di);
                  return <div key={di} title={`${a.name} · day ${di + 1} · ${v}%`} style={{ height: 15, borderRadius: 2, background: col(v), opacity: 0.25 + (v / 100) * 0.6 }} />;
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="divider" />
        <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "var(--fg-muted)" }}>
          {[["≥ 90 %", "var(--pos)"], ["75–89 %", "var(--acc-recov)"], ["60–74 %", "var(--warn)"], ["< 60 %", "var(--neg)"]].map(([l, c]) => (
            <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: 0.7 }} />{l}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Dimension bars" sub="roster average per module">
          {[["Nutrition", 84, "var(--acc-nutri)"], ["Training", 91, "var(--acc-train)"], ["Recovery", 76, "var(--acc-recov)"], ["Supplements", 88, "var(--acc-suppl)"]].map(([l, v, c]) => (
            <div key={l} style={{ display: "grid", gridTemplateColumns: "94px 1fr 40px", gap: 10, alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 11.5 }}>{l}</span>
              {window.Meter ? <window.Meter value={v} color={c} tall /> : <div />}
              <span className="num" style={{ textAlign: "right", fontSize: 11.5 }}>{v}%</span>
            </div>
          ))}
        </Card>
        <Card title="Benchmark" sub="Lukas Bauer vs roster vs target">
          {[["Client", 94, "var(--acc-coach)"], ["Roster median", 87, "var(--fg-dim)"], ["Target", 90, "var(--pos)"]].map(([l, v, c]) => (
            <div key={l} style={{ display: "grid", gridTemplateColumns: "104px 1fr 40px", gap: 10, alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 11.5, color: l === "Client" ? "var(--fg)" : "var(--fg-muted)", fontWeight: l === "Client" ? 600 : 400 }}>{l}</span>
              {window.Meter ? <window.Meter value={v} color={c} tall /> : <div />}
              <span className="num" style={{ textAlign: "right", fontSize: 11.5 }}>{v}%</span>
            </div>
          ))}
          <div className="divider" />
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Seven points above the roster median and four above target. This is the client to model the others on, not the one to intervene with.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Autonomy history timeline ────────────────────────
window.AutonomyHistoryTimeline = () => {
  const events = [
    { at: "2026-08-14", who: "Lukas Bauer",   from: 3, to: 4, by: "coach", why: "Four weeks of self-corrected deloads without prompting. Communication quality 92." },
    { at: "2026-07-02", who: "Sophie Klein",  from: 2, to: 1, by: "coach", why: "Regression. Missed three consecutive check-ins and stopped logging nutrition." },
    { at: "2026-06-18", who: "Marcus Weber",  from: 4, to: 5, by: "system",why: "Auto-recommendation accepted. All four assessment scores above 90 for eight weeks." },
    { at: "2026-05-30", who: "Niko Brandt",   from: 2, to: 3, by: "coach", why: "Consistency 0.93, knowledge score up after the RPE calibration session." },
    { at: "2026-05-11", who: "Elena Schmidt", from: 1, to: 2, by: "coach", why: "First month complete. Logging daily, asks good questions." },
  ];
  return (
    <Card title="Autonomy history" sub="every level change across the roster">
      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 1, background: "var(--border)" }} />
        {events.map((e, i) => (
          <div key={i} style={{ position: "relative", paddingBottom: i < events.length - 1 ? 16 : 0 }}>
            <div style={{
              position: "absolute", left: -20, top: 3,
              width: 15, height: 15, borderRadius: 999,
              background: e.to > e.from ? "var(--pos)" : "var(--warn)",
              color: "var(--bg)", display: "grid", placeItems: "center",
              fontSize: 8.5, fontWeight: 700,
            }}>{e.to > e.from ? "↑" : "↓"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
              <span className="num dim" style={{ fontSize: 10 }}>{e.at}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{e.who}</span>
              <Pill variant={e.to > e.from ? "pos" : "warn"}>L{e.from} → L{e.to}</Pill>
              <Pill>{e.by}</Pill>
            </div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{e.why}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ── Program builder ──────────────────────────────────
window.ProgramBuilderView = () => {
  const [type, setType] = useState("combined");
  const [weeks, setWeeks] = useState(12);
  const [delivery, setDelivery] = useState("weekly");
  return (
    <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
      <div className="col-gap" style={{ gap: 14 }}>
        <Card title="Program builder" sub="combine training, nutrition and supplement templates">
          <div className="col-gap" style={{ gap: 12 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 5 }}>Name</div>
              <input defaultValue="Powerbuilding 12 · autumn intake" style={{ width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 11px", fontSize: 12 }} />
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 5 }}>Type</div>
              <div style={{ display: "flex", gap: 5 }}>
                {[["training","Training"],["nutrition","Nutrition"],["combined","Combined"]].map(([k, l]) => (
                  <button key={k} onClick={() => setType(k)} className={type === k ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{ flex: 1 }}>{l}</button>
                ))}
              </div>
            </div>
            <div className="grid g-cols-2" style={{ gap: 10 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 5 }}>Duration</div>
                <select value={weeks} onChange={e => setWeeks(+e.target.value)} style={{ width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12 }}>
                  {[4, 6, 8, 12, 16].map(w => <option key={w} value={w}>{w} weeks</option>)}
                </select>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 5 }}>Auto-delivery</div>
                <select value={delivery} onChange={e => setDelivery(e.target.value)} style={{ width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12 }}>
                  <option value="weekly">Weekly · one week ahead</option>
                  <option value="phase">Per phase</option>
                  <option value="all">All at once</option>
                  <option value="manual">Manual release</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Components" sub={type === "combined" ? "three templates linked" : "one template"}>
          <div className="col-gap" style={{ gap: 8 }}>
            {[
              ["Training", "PPL Hypertrophy → Strength", "var(--acc-train)", type !== "nutrition"],
              ["Nutrition", "Recomp · 2,700 kcal split", "var(--acc-nutri)", type !== "training"],
              ["Supplements", "Foundation stack · 5 items", "var(--acc-suppl)", type === "combined"],
            ].filter(x => x[3]).map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, padding: 11, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 26%, var(--border))`, borderRadius: 7 }}>
                <span style={{ width: 3, alignSelf: "stretch", background: c, borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div className="eyebrow" style={{ marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{v}</div>
                </div>
                <button className="btn btn-sm btn-ghost">Change</button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Delivery schedule" sub={`${weeks} weeks · ${delivery === "weekly" ? "one week unlocks every 7 days" : delivery === "phase" ? "unlocks per phase boundary" : delivery === "all" ? "everything available immediately" : "you release each week manually"}`}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(weeks, 12)}, 1fr)`, gap: 4 }}>
            {Array.from({ length: Math.min(weeks, 12) }, (_, i) => (
              <div key={i} style={{
                padding: "9px 4px", textAlign: "center", borderRadius: 5,
                background: i === 0 ? "color-mix(in srgb, var(--acc-coach) 14%, var(--surface))" : "var(--surface)",
                border: `1px solid ${i === 0 ? "color-mix(in srgb, var(--acc-coach) 32%, var(--border))" : "var(--border)"}`,
              }}>
                <div className="num" style={{ fontSize: 11, fontWeight: 600 }}>{i + 1}</div>
                <div className="dim mono" style={{ fontSize: 8 }}>{i === 0 ? "now" : delivery === "all" ? "open" : `+${i * 7}d`}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="col-gap" style={{ gap: 14 }}>
        <Card title="Assign to clients" sub="client confirmation required before anything changes">
          <div className="col-gap" style={{ gap: 5 }}>
            {(window.PORTAL_ATHLETES || []).slice(0, 7).map(a => (
              <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "var(--acc-coach)" }} />
                <span style={{ fontSize: 11.5, flex: 1 }}>{a.name}</span>
                <span className="dim mono" style={{ fontSize: 10 }}>{a.plan}</span>
              </label>
            ))}
          </div>
          <div className="divider" />
          <div style={{ padding: 10, background: "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 24%, var(--border))", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 10 }}>
            Assignment creates a proposal in each client's modules. Nothing takes effect until they accept it.
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }}>Send proposals</button>
        </Card>
        <Card title="Preview" sub="what the client sees">
          <Row label="Program" value="Powerbuilding 12" />
          <Row label="Available now" value="Week 1 only" />
          <Row label="Next unlock" value="in 7 days" />
          <Row label="Source" value="Coach · Tom Müller" />
          <Row label="Confirmation" value="required" />
        </Card>
      </div>
    </div>
  );
};

// ── Check-in editor ──────────────────────────────────
window.CheckinEditorView = () => {
  const [qs, setQs] = useState([
    { id: 1, q: "How was your energy this week?", type: "scale" },
    { id: 2, q: "Anything notable or any questions?", type: "text" },
    { id: 3, q: "How did the new squat cue feel?", type: "text" },
  ]);
  return (
    <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
      <Card title="Check-in template" sub="weekly standard · auto-generated Mondays for autonomy 1–3">
        <div className="eyebrow" style={{ marginBottom: 7 }}>Pre-filled automatically</div>
        <div className="grid g-cols-2" style={{ gap: 8, marginBottom: 15 }}>
          {[["Weight", "7-day average"], ["Training adherence", "7-day %"], ["Nutrition adherence", "7-day %"], ["Recovery", "7-day average score"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <Icon name="check" className="ic ic-sm" style={{ color: "var(--pos)" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500 }}>{l}</div>
                <div className="dim mono" style={{ fontSize: 9.5 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="eyebrow" style={{ marginBottom: 7 }}>Questions</div>
        <div className="col-gap" style={{ gap: 6 }}>
          {qs.map((q, i) => (
            <div key={q.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <span className="num dim" style={{ fontSize: 10, width: 14 }}>{i + 1}</span>
              <input defaultValue={q.q} style={{ flex: 1, height: 26, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 9px", fontSize: 11.5 }} />
              <select defaultValue={q.type} style={{ height: 26, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11 }}>
                <option value="scale">1–10 scale</option>
                <option value="text">Free text</option>
                <option value="yesno">Yes / No</option>
              </select>
              <button className="icon-btn" onClick={() => setQs(s => s.filter(x => x.id !== q.id))}><Icon name="trash" className="ic ic-sm" style={{ color: "var(--neg)" }} /></button>
            </div>
          ))}
        </div>
        <button className="btn btn-sm" style={{ marginTop: 9 }} onClick={() => setQs(s => [...s, { id: Date.now(), q: "", type: "text" }])}>
          <Icon name="plus" className="ic ic-sm" />Add question
        </button>
        <div className="divider" />
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-primary btn-sm">Save template</button>
          <button className="btn btn-sm">Save as new</button>
        </div>
      </Card>

      <div className="col-gap" style={{ gap: 14 }}>
        <Card title="Schedule" sub="who gets it and when">
          <Row label="Generated" value="Mondays 06:00" />
          <Row label="Applies to" value="autonomy 1–3 · 8 clients" />
          <Row label="Due within" value="48 hours" />
          <Row label="Reminder" value="after 24 h, then 40 h" />
          <div className="divider" />
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Clients at autonomy 4 and 5 do not receive automatic check-ins. They initiate contact when they need it.
          </div>
        </Card>
        <Card title="Recent responses" sub="4 of 8 submitted this week">
          {[["Lukas Bauer","submitted","2h ago"],["Marcus Weber","submitted","yesterday"],["Sophie Klein","submitted","yesterday"],["Niko Brandt","submitted","2 days ago"],["Elena Schmidt","overdue","9 days"],["Anna Frey","pending","due in 14h"]].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 11.5, flex: 1 }}>{r[0]}</span>
              <Pill variant={r[1] === "submitted" ? "pos" : r[1] === "overdue" ? "block" : "warn"}>{r[1]}</Pill>
              <span className="dim mono" style={{ fontSize: 10, width: 60, textAlign: "right" }}>{r[2]}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};
