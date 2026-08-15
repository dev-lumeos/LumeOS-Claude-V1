// Coach Portal — guided workflows (SPEC_05 §3) + Client onboarding
// Prep · Nutrition · Strength · Standard review, each as a stepped flow

const PORTAL_WF_DEFS = [
  {
    id: "prep",
    name: "Contest Prep review",
    accent: "var(--acc-goals)",
    icon: "goals",
    cadence: "weekly · Mondays",
    duration: "12–20 min",
    when: "Client in contest_prep phase, weeks-out ≤ 20",
    steps: [
      { n: 1, t: "Weight & rate check", d: "Compare 7-day average against the prescribed weekly loss rate. Flag if outside 0.5–1.0 % BW.", fields: ["7d avg weight", "Δ vs last week", "target rate", "cumulative loss"] },
      { n: 2, t: "Photo comparison", d: "Side-by-side with last week and with the baseline. Look for regional changes, not scale movement.", fields: ["front relaxed", "side", "back", "most-muscular"] },
      { n: 3, t: "Performance check", d: "Strength retention is the guard rail. More than 10 % off baseline on main lifts means the deficit is too aggressive.", fields: ["bench e1RM", "squat e1RM", "deadlift e1RM", "% vs baseline"] },
      { n: 4, t: "Recovery & subjective", d: "Sleep, HRV, hunger, mood, libido. Two or more red flags trigger a diet break discussion.", fields: ["sleep 7d", "HRV trend", "hunger 1–10", "mood 1–10"] },
      { n: 5, t: "Adjustment decision", d: "Calories, cardio, refeed placement. One variable at a time.", fields: ["kcal change", "cardio change", "refeed day", "reasoning"] },
      { n: 6, t: "Peak week check", d: "Only inside 10 days out. Opens the peak-week protocol.", fields: ["days out", "protocol status"] },
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
      { n: 1, t: "Adherence", d: "Logged days, protein hit-rate, calorie variance. Below 80 % logging makes the rest unreliable.", fields: ["days logged", "protein hit %", "kcal variance", "weekend gap"] },
      { n: 2, t: "Trend vs target", d: "Body weight trend against the phase target. Two weeks of no movement is the trigger.", fields: ["weight trend", "expected", "delta"] },
      { n: 3, t: "Micronutrient gaps", d: "Pull the gap analysis from Nutrition. Only act on gaps below 80 % of RDA for 14 days.", fields: ["gaps < 80 %", "duration", "food-first option"] },
      { n: 4, t: "Adjust macros", d: "Change one macro or total calories. Note the reason so the next review has context.", fields: ["kcal", "protein", "carbs", "fat", "reason"] },
      { n: 5, t: "Send proposal", d: "Client confirms before anything changes in their Nutrition module.", fields: ["proposal note"] },
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
      { n: 1, t: "Volume landmarks", d: "Sets per muscle against MEV/MAV/MRV. Anything above MRV for two weeks needs a cut.", fields: ["sets by muscle", "zone", "weeks in zone"] },
      { n: 2, t: "Progression audit", d: "Which lifts moved, which stalled. Three stalled sessions is a deload signal.", fields: ["lifts progressed", "stalled", "e1RM delta"] },
      { n: 3, t: "Fatigue markers", d: "RPE creep, session duration, recovery score. Combined signals matter more than any single one.", fields: ["avg RPE", "RPE trend", "recovery avg"] },
      { n: 4, t: "Next block design", d: "Volume, intensity and exercise selection for the coming block.", fields: ["block focus", "volume change", "intensity", "swaps"] },
      { n: 5, t: "Assign", d: "Send as a proposal. Client's Training module updates on confirmation.", fields: ["routine", "start date"] },
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
      { n: 1, t: "Read the check-in", d: "Client's submitted form: weight, adherence, energy, questions.", fields: ["submitted", "weight", "adherence", "open questions"] },
      { n: 2, t: "Scan the dashboard", d: "Compliance bars, recovery chain, any alerts since last week.", fields: ["compliance", "recovery", "alerts"] },
      { n: 3, t: "Write feedback", d: "One thing that went well, one thing to change, one thing to watch.", fields: ["went well", "change", "watch"] },
      { n: 4, t: "Adjust or hold", d: "Most weeks the answer is hold. Only change with a reason.", fields: ["decision", "reason"] },
    ],
  },
];

const PEAK_WEEK = [
  { day: "Day 7 · Sun", carbs: "Low · 1.0 g/kg", water: "6 L", sodium: "normal", training: "Full body depletion", note: "Start glycogen depletion. High volume, moderate load." },
  { day: "Day 6 · Mon", carbs: "Low · 1.0 g/kg", water: "6 L", sodium: "normal", training: "Upper depletion", note: "Continue depletion. Watch for excessive flatness." },
  { day: "Day 5 · Tue", carbs: "Low · 1.2 g/kg", water: "6 L", sodium: "normal", training: "Lower depletion", note: "Last depletion session. Posing practice 20 min." },
  { day: "Day 4 · Wed", carbs: "Moderate · 3 g/kg", water: "6 L", sodium: "normal", training: "Light pump only", note: "Begin the load. Complex carbs, low fibre." },
  { day: "Day 3 · Thu", carbs: "High · 6 g/kg", water: "5 L", sodium: "slight increase", training: "Posing only", note: "Main load day. Monitor fullness hourly." },
  { day: "Day 2 · Fri", carbs: "High · 6 g/kg", water: "4 L", sodium: "normal", training: "Posing only", note: "Second load day. Adjust based on Thursday's response." },
  { day: "Day 1 · Sat", carbs: "Moderate · 4 g/kg", water: "2 L", sodium: "reduce", training: "Rest", note: "Taper water. Final assessment evening before." },
  { day: "Show day", carbs: "Small meals by feel", water: "sips only", sodium: "small pinch", training: "Pump backstage", note: "Adjust by look, not by plan. Have the coach on site." },
];

const PORTAL_ONBOARD = [
  { n: 1, t: "Invite sent", d: "Coach sends an email invite or QR code. Link is valid for 7 days.", status: "done", at: "12 May" },
  { n: 2, t: "Client accepts", d: "Client creates or links their LumeOS account and confirms the coaching relationship.", status: "done", at: "12 May" },
  { n: 3, t: "Permissions granted", d: "Client picks which of the 7 modules the coach can see, and at what level. Nothing is shared until they do.", status: "done", at: "13 May" },
  { n: 4, t: "Intake form", d: "Training history, injuries, equipment access, goals, availability, dietary restrictions.", status: "active", at: "in progress" },
  { n: 5, t: "Baseline assessment", d: "Current lifts, body metrics, recent bloodwork if shared. Sets the reference point for all later reviews.", status: "pending", at: "—" },
  { n: 6, t: "Autonomy level set", d: "Coach assigns the starting level. Determines check-in cadence and intervention threshold.", status: "pending", at: "—" },
  { n: 7, t: "First plan proposed", d: "Training routine and macro targets sent as a proposal. Client confirms before it lands in their modules.", status: "pending", at: "—" },
  { n: 8, t: "Check-in scheduled", d: "Template and recurring day picked. First check-in fires automatically.", status: "pending", at: "—" },
];

// ── Views ────────────────────────────────────────────
window.PortalWorkflows = () => {
  const [active, setActive] = useState("prep");
  const [step, setStep] = useState(1);
  const wf = PORTAL_WF_DEFS.find(w => w.id === active);
  const [peak, setPeak] = useState(false);

  useEffect(() => { setStep(1); setPeak(false); }, [active]);

  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        {PORTAL_WF_DEFS.map(w => (
          <div key={w.id} onClick={() => setActive(w.id)} style={{
            padding: 13, borderRadius: 8, cursor: "pointer",
            background: active === w.id ? `color-mix(in srgb, ${w.accent} 9%, var(--surface))` : "var(--surface)",
            border: `1px solid ${active === w.id ? `color-mix(in srgb, ${w.accent} 34%, var(--border))` : "var(--border)"}`,
          }}>
            <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 6}}>
              <Icon name={w.icon} className="ic" style={{color: active === w.id ? w.accent : "var(--fg-muted)"}}/>
              <span style={{fontSize: 12.5, fontWeight: 600}}>{w.name}</span>
            </div>
            <div className="dim mono" style={{fontSize: 10, marginBottom: 4}}>{w.cadence} · {w.duration}</div>
            <div className="muted" style={{fontSize: 11, lineHeight: 1.4}}>{w.steps.length} steps</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{gridTemplateColumns: "260px 1fr", gap: 14}}>
        <Card title="Steps" sub={wf.name} className="card-tight" style={{padding: 0}}>
          <div className="col-gap" style={{gap: 0}}>
            {wf.steps.map(s => {
              const on = step === s.n;
              return (
                <div key={s.n} onClick={() => setStep(s.n)} style={{
                  display: "flex", gap: 10, padding: "11px 13px", cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  background: on ? `color-mix(in srgb, ${wf.accent} 8%, transparent)` : "transparent",
                }}>
                  <div style={{
                    width: 21, height: 21, borderRadius: 999, flexShrink: 0,
                    background: on ? wf.accent : "var(--surface-2)",
                    color: on ? "var(--bg)" : "var(--fg-muted)",
                    display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                  }}>{s.n}</div>
                  <div style={{minWidth: 0}}>
                    <div style={{fontSize: 12, fontWeight: on ? 600 : 500, marginBottom: 1}}>{s.t}</div>
                    <div className="dim" style={{fontSize: 10.5, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"}}>{s.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{padding: 12}}>
            <div className="eyebrow" style={{marginBottom: 5}}>When it runs</div>
            <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{wf.when}</div>
          </div>
        </Card>

        <div className="col-gap" style={{gap: 12}}>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: 9, marginBottom: 10, flexWrap: "wrap"}}>
              <div style={{width: 26, height: 26, borderRadius: 999, background: wf.accent, color: "var(--bg)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600}}>{step}</div>
              <span style={{fontSize: 15, fontWeight: 600}}>{wf.steps[step - 1].t}</span>
              <span className="dim mono" style={{marginLeft: "auto", fontSize: 10.5}}>step {step} of {wf.steps.length}</span>
            </div>
            <div className="muted" style={{fontSize: 12.5, lineHeight: 1.55, marginBottom: 13}}>{wf.steps[step - 1].d}</div>
            <div className="eyebrow" style={{marginBottom: 7}}>What you fill in</div>
            <div className="grid g-cols-2" style={{gap: 8, marginBottom: 13}}>
              {wf.steps[step - 1].fields.map(f => (
                <div key={f} style={{padding: 10, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6}}>
                  <div className="eyebrow" style={{marginBottom: 5, fontSize: 9.5}}>{f}</div>
                  <input placeholder="—" style={{width: "100%", height: 26, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5, outline: "none", fontFamily: "var(--font-mono)"}}/>
                </div>
              ))}
            </div>
            <div style={{display: "flex", gap: 6}}>
              <button className="btn btn-ghost btn-sm" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>Back</button>
              {step < wf.steps.length
                ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Next step</button>
                : <button className="btn btn-primary btn-sm">Finish · send proposal</button>}
              {wf.id === "prep" && step === 6 && <button className="btn btn-sm" onClick={() => setPeak(p => !p)} style={{borderColor: `color-mix(in srgb, ${wf.accent} 34%, var(--border))`, color: wf.accent}}>{peak ? "Hide" : "Open"} peak-week protocol</button>}
              <div className="spacer"/>
              <button className="btn btn-ghost btn-sm">Save draft</button>
            </div>
          </Card>

          {wf.id === "prep" && peak && (
            <Card title="Peak-week protocol" sub="Lukas Bauer · 7 days out · adjust by look, never by the sheet alone">
              <div style={{padding: 11, background: "color-mix(in srgb, var(--warn) 7%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 25%, var(--border))", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 12}}>
                Water and sodium manipulation carries real risk. Nothing here is prescriptive — the plan is a starting point that gets adjusted daily based on how the athlete actually looks. Diuretics stay locked behind medical sign-off.
              </div>
              <table className="tbl">
                <thead><tr><th style={{width: 110}}>Day</th><th style={{width: 130}}>Carbs</th><th style={{width: 80}}>Water</th><th style={{width: 110}}>Sodium</th><th style={{width: 150}}>Training</th><th>Note</th></tr></thead>
                <tbody>
                  {PEAK_WEEK.map((d, i) => (
                    <tr key={i} style={{background: i === 0 ? "color-mix(in srgb, var(--acc-goals) 6%, transparent)" : "transparent"}}>
                      <td style={{fontSize: 11.5, fontWeight: i === 0 ? 600 : 500}}>{d.day}</td>
                      <td className="num" style={{fontSize: 11.5}}>{d.carbs}</td>
                      <td className="num" style={{fontSize: 11.5}}>{d.water}</td>
                      <td className="muted" style={{fontSize: 11.5}}>{d.sodium}</td>
                      <td className="muted" style={{fontSize: 11.5}}>{d.training}</td>
                      <td className="dim" style={{fontSize: 11}}>{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="divider"/>
              <div style={{display: "flex", gap: 6}}>
                <button className="btn btn-primary btn-sm">Send to client</button>
                <button className="btn btn-sm">Adjust plan</button>
                <button className="btn btn-ghost btn-sm">Daily check-in schedule</button>
              </div>
            </Card>
          )}

          <Card title="Recent runs" sub={`${wf.name} · last 4`}>
            <table className="tbl">
              <tbody>
                {[
                  ["16 May", "Lukas Bauer", "completed", "kcal −150, cardio +1 session"],
                  ["09 May", "Lukas Bauer", "completed", "hold — strength retention good"],
                  ["02 May", "Lukas Bauer", "completed", "refeed moved to Saturday"],
                  ["25 Apr", "Sophie Klein", "abandoned", "client missed check-in"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="num muted" style={{width: 70}}>{r[0]}</td>
                    <td style={{width: 140, fontSize: 12}}>{r[1]}</td>
                    <td style={{width: 110}}>{r[2] === "completed" ? <Pill variant="pos">completed</Pill> : <Pill>abandoned</Pill>}</td>
                    <td className="muted" style={{fontSize: 11.5}}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

window.PortalClientOnboarding = () => {
  const done = PORTAL_ONBOARD.filter(s => s.status === "done").length;
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
      <Card title="Client onboarding" sub="Sarah Weber · started 12 May · step 4 of 8">
        <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999, marginBottom: 16}}>
          <div style={{height: "100%", width: (done / PORTAL_ONBOARD.length * 100) + "%", background: "var(--acc-coach)", borderRadius: 999}}/>
        </div>
        <div className="col-gap" style={{gap: 8}}>
          {PORTAL_ONBOARD.map(s => {
            const c = s.status === "done" ? "var(--pos)" : s.status === "active" ? "var(--acc-coach)" : "var(--fg-dim)";
            return (
              <div key={s.n} style={{
                display: "flex", gap: 12, padding: 12, borderRadius: 7,
                background: s.status === "active" ? "color-mix(in srgb, var(--acc-coach) 7%, var(--surface))" : "var(--surface)",
                border: `1px solid ${s.status === "active" ? "color-mix(in srgb, var(--acc-coach) 30%, var(--border))" : "var(--border)"}`,
                opacity: s.status === "pending" ? 0.72 : 1,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                  background: s.status === "done" ? "var(--pos)" : s.status === "active" ? "var(--acc-coach)" : "var(--surface-2)",
                  color: s.status === "pending" ? "var(--fg-muted)" : "var(--bg)",
                  display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                }}>{s.status === "done" ? "✓" : s.n}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                    <span style={{fontSize: 12.5, fontWeight: 600}}>{s.t}</span>
                    {s.status === "active" && <Pill variant="acc">in progress</Pill>}
                    <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{s.at}</span>
                  </div>
                  <div className="muted" style={{fontSize: 11.5, lineHeight: 1.45}}>{s.d}</div>
                  {s.status === "active" && (
                    <div style={{display: "flex", gap: 6, marginTop: 9}}>
                      <button className="btn btn-primary btn-sm">Open intake form</button>
                      <button className="btn btn-ghost btn-sm">Send reminder</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Pending invites" sub="2 outstanding">
          {[["Sarah Weber","12 May","expires in 3 days","active"],["Mark Reinhold","08 May","expired","expired"]].map((r, i) => (
            <div key={i} style={{padding: "10px 0", borderBottom: i === 0 ? "1px solid var(--border)" : "none"}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                <span style={{fontSize: 12.5, fontWeight: 500}}>{r[0]}</span>
                {r[3] === "expired" ? <Pill variant="block">expired</Pill> : <Pill variant="warn">{r[2]}</Pill>}
              </div>
              <div className="dim mono" style={{fontSize: 10.5}}>sent {r[1]}</div>
              <div style={{display: "flex", gap: 5, marginTop: 7}}>
                <button className="btn btn-sm btn-ghost">Resend</button>
                <button className="btn btn-sm btn-ghost">Cancel</button>
              </div>
            </div>
          ))}
          <div className="divider"/>
          <button className="btn btn-primary" style={{width: "100%"}}><Icon name="plus" className="ic ic-sm"/>Invite new client</button>
        </Card>
        <Card title="What the client controls" sub="coach cannot bypass any of it">
          <div className="col-gap" style={{gap: 7, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
            {[
              "Which of the 7 modules you can see, and at what level",
              "Whether to accept or decline every plan proposal",
              "Revoking access at any point, effective immediately",
              "Medical data stays hidden unless explicitly granted",
            ].map((t, i) => (
              <div key={i} style={{display: "flex", gap: 8}}>
                <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)", flexShrink: 0, marginTop: 2}}/>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
