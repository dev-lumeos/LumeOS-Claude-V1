// Onboarding walkthrough — 10 filled steps

const WALK = [
  { n: 1, t: "Welcome to LumeOS",
    body: "Eleven modules, one picture. Nutrition down to 138 nutrients, training with volume landmarks, recovery from HRV, bloodwork, supplements — and they talk to each other. Nothing leaves your account until you decide otherwise.",
    kind: "intro" },

  { n: 2, t: "The basics",
    body: "This seeds your energy expenditure and every target derived from it.",
    kind: "form", fields: [
      { l: "Display name", v: "Tom Müller", w: 2 },
      { l: "Sex", v: "male", opts: ["male", "female", "other"] },
      { l: "Date of birth", v: "1990-03-12", type: "date" },
      { l: "Height", v: "184", unit: "cm" },
      { l: "Weight", v: "79.4", unit: "kg" },
      { l: "Country", v: "Germany", opts: ["Germany", "Austria", "Switzerland", "Other"] },
    ]},

  { n: 3, t: "What are you here for",
    body: "One primary goal drives your targets. Secondary goals shape the advice without competing for the same numbers.",
    kind: "goals",
    primary: ["Build muscle", "Lose fat", "Body recomposition", "Get stronger", "Endurance", "Health & longevity"],
    picked: "Body recomposition",
    secondary: ["Better sleep", "More energy", "Bloodwork in range"],
    detail: [
      { l: "Target weight", v: "78.0 kg" },
      { l: "Target body fat", v: "12 %" },
      { l: "By when", v: "1 August 2026" },
    ]},

  { n: 4, t: "How you train",
    body: "Sets your activity multiplier — 1.725 for five hard sessions a week.",
    kind: "activity",
    levels: [
      { l: "Sedentary", d: "Desk job, little movement", f: "1.2" },
      { l: "Light", d: "One or two sessions a week", f: "1.375" },
      { l: "Moderate", d: "Three or four sessions", f: "1.55" },
      { l: "Very active", d: "Five or six hard sessions", f: "1.725", on: true },
      { l: "Athlete", d: "Twice daily or competing", f: "1.9" },
    ],
    detail: [
      { l: "Training years", v: "8" },
      { l: "Sessions per week", v: "5" },
      { l: "Main discipline", v: "Powerbuilding" },
    ]},

  { n: 5, t: "Pick your modules",
    body: "Start with what you will actually use. The rest stay hidden in the sidebar and switch on any time from Settings.",
    kind: "modules",
    modules: [
      { l: "Nutrition", d: "138 nutrients, BLS food database", on: true },
      { l: "Training", d: "Routines, volume landmarks, PRs", on: true },
      { l: "Recovery", d: "HRV, sleep, readiness score", on: true },
      { l: "Supplements", d: "Stack, timing, interactions", on: true },
      { l: "Goals & Body", d: "Phases, TDEE, measurements", on: false },
      { l: "Medical", d: "Bloodwork, medications, history", on: false },
      { l: "Coach", d: "Human coaches and the AI coach", on: false },
      { l: "Marketplace", d: "Verified sellers and plans", on: false },
    ]},

  { n: 6, t: "Connect your devices",
    body: "Optional. Everything works with manual entry — devices just remove the typing.",
    kind: "devices",
    devices: [
      { l: "Garmin Connect", d: "HRV · sleep · workouts · body battery", on: true },
      { l: "Polar Flow", d: "Orthostatic HRV test, chest-strap HR", on: true },
      { l: "Apple Health", d: "Steps, workouts, mindful minutes", on: false },
      { l: "Withings", d: "Smart scale — weight and body fat", on: false },
      { l: "Whoop", d: "Strain and recovery", on: false },
      { l: "Oura", d: "Sleep stages and temperature", on: false },
    ]},

  { n: 7, t: "Choose how your coach talks",
    body: "Same data, different delivery. Changeable any time, and you can set a different one per time of day later.",
    kind: "persona",
    personas: [
      { l: "Scientist", d: "Cites the evidence, stays neutral", q: "Protein sits at 142 g of 180. Four even doses beat two large ones for 24-hour synthesis." },
      { l: "Motivator", d: "Energetic, celebrates the wins", q: "142 grams down, 38 to go — one shake and you own today." },
      { l: "Drill Sergeant", d: "Direct, accountability first", q: "38 grams short. You know what to do. Do it." },
      { l: "Best Friend", d: "Warm, conversational", q: "You're nearly there — 38 g left. Casein before bed and it's sorted.", on: true },
      { l: "Zen Master", d: "Calm, takes the long view", q: "Today is 142 of 180. The week matters more than the day." },
    ]},

  { n: 8, t: "Your privacy floor",
    body: "Restrictive by default. Coaches see nothing until you grant it per module, and every grant is logged with a timestamp you can revoke.",
    kind: "privacy",
    rows: [
      { m: "Nutrition",   you: "full", coach: "off", buddy: "aggregate", us: "off" },
      { m: "Training",    you: "full", coach: "off", buddy: "aggregate", us: "off" },
      { m: "Recovery",    you: "full", coach: "off", buddy: "aggregate", us: "off" },
      { m: "Supplements", you: "full", coach: "off", buddy: "aggregate", us: "off" },
      { m: "Medical",     you: "full", coach: "off", buddy: "off",       us: "off" },
      { m: "Body photos", you: "full", coach: "off", buddy: "off",       us: "off" },
    ]},

  { n: 9, t: "Choose a tier",
    body: "Fourteen days of Pro to start, no card required. Downgrade keeps your data — features just switch off.",
    kind: "tiers",
    tiers: [
      { l: "Free",  p: "€0",  f: ["Five chat messages a day", "Insights feed", "All eleven modules"] },
      { l: "Plus",  p: "€8",  f: ["Unlimited chat", "All five personas", "Daily heartbeat briefings"] },
      { l: "Pro",   p: "€18", f: ["Voice logging in the gym", "Action execution", "Proactive watcher", "Push alerts"], on: true },
      { l: "Elite", p: "€39", f: ["Training plan generation", "Cycle consulting", "Weekly deep report"] },
    ]},

  { n: 10, t: "You're set",
    body: "Buddy introduces itself tomorrow at seven. The first week is guided — one module a day, so nothing arrives all at once.",
    kind: "done",
    summary: [
      { l: "Goal", v: "Body recomposition · 78 kg at 12 % by 1 Aug" },
      { l: "Modules", v: "Nutrition · Training · Recovery · Supplements" },
      { l: "Devices", v: "Garmin · Polar" },
      { l: "Coach persona", v: "Best Friend · autonomy level 3" },
      { l: "Tier", v: "Pro · 14-day trial, ends 30 May" },
      { l: "Privacy", v: "Coaches off · Buddy aggregate only" },
    ]},
];

window.AuthWalkthrough = () => {
  const [n, setN] = useState(1);
  const s = WALK[n - 1];
  return (
    <Card>
      <div style={{display: "flex", gap: 3, marginBottom: 18}}>
        {WALK.map(w => (
          <button key={w.n} onClick={() => setN(w.n)} title={w.t} style={{
            flex: 1, height: 5, borderRadius: 999, cursor: "pointer", border: 0,
            background: w.n <= n ? "var(--acc-coach)" : "var(--surface-2)",
            opacity: w.n === n ? 1 : w.n < n ? 0.6 : 1,
          }}/>
        ))}
      </div>

      <div style={{marginBottom: 18}}>
        <div className="mono dim" style={{fontSize: 10.5, marginBottom: 6}}>STEP {s.n} OF 10</div>
        <div style={{fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8}}>{s.t}</div>
        <div className="muted" style={{fontSize: 12.5, lineHeight: 1.6, maxWidth: 560}}>{s.body}</div>
      </div>

      {s.kind === "intro" && (
        <div className="grid g-cols-4" style={{gap: 8}}>
          {[["11", "modules"], ["138", "nutrients tracked"], ["7,140", "foods in BLS"], ["1,200", "exercises"]].map(([v, l]) => (
            <div key={l} style={{padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, textAlign: "center"}}>
              <div className="num" style={{fontSize: 20, fontWeight: 500, marginBottom: 3}}>{v}</div>
              <div className="dim" style={{fontSize: 10.5}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {s.kind === "form" && (
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10}}>
          {s.fields.map(f => (
            <div key={f.l} style={{gridColumn: f.w === 2 ? "span 2" : undefined}}>
              <div className="eyebrow" style={{marginBottom: 4}}>{f.l}</div>
              {f.opts ? (
                <select defaultValue={f.v} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <div style={{position: "relative"}}>
                  <input type={f.type || "text"} defaultValue={f.v} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
                  {f.unit && <span className="dim mono" style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>{f.unit}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {s.kind === "goals" && (
        <>
          <div className="eyebrow" style={{marginBottom: 8}}>Primary goal</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16}}>
            {s.primary.map(g => (
              <button key={g} style={{
                padding: "12px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12.5, textAlign: "left",
                background: g === s.picked ? "color-mix(in srgb, var(--acc-coach) 12%, var(--surface))" : "var(--surface)",
                border: `1px solid ${g === s.picked ? "color-mix(in srgb, var(--acc-coach) 38%, var(--border))" : "var(--border)"}`,
                color: g === s.picked ? "var(--acc-coach)" : "var(--fg)", fontWeight: g === s.picked ? 600 : 400,
              }}>{g}</button>
            ))}
          </div>
          <div className="eyebrow" style={{marginBottom: 8}}>Targets</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16}}>
            {s.detail.map(d => (
              <div key={d.l} style={{padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                <div className="eyebrow" style={{marginBottom: 3}}>{d.l}</div>
                <div className="num" style={{fontSize: 14}}>{d.v}</div>
              </div>
            ))}
          </div>
          <div className="eyebrow" style={{marginBottom: 8}}>Secondary · optional</div>
          <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
            {s.secondary.map((g, i) => <button key={g} className={i === 0 ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "5px 12px", fontSize: 11.5}}>{g}</button>)}
          </div>
        </>
      )}

      {s.kind === "activity" && (
        <>
          <div className="col-gap" style={{gap: 6, marginBottom: 16}}>
            {s.levels.map(l => (
              <div key={l.l} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 7, cursor: "pointer",
                background: l.on ? "color-mix(in srgb, var(--acc-coach) 10%, var(--surface))" : "var(--surface)",
                border: `1px solid ${l.on ? "color-mix(in srgb, var(--acc-coach) 35%, var(--border))" : "var(--border)"}`,
              }}>
                <div style={{width: 14, height: 14, borderRadius: 999, border: `2px solid ${l.on ? "var(--acc-coach)" : "var(--border-strong)"}`, background: l.on ? "var(--acc-coach)" : "transparent", flexShrink: 0}}/>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 12.5, fontWeight: l.on ? 600 : 500}}>{l.l}</div>
                  <div className="muted" style={{fontSize: 11}}>{l.d}</div>
                </div>
                <span className="num dim" style={{fontSize: 11.5}}>× {l.f}</span>
              </div>
            ))}
          </div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10}}>
            {s.detail.map(d => (
              <div key={d.l}>
                <div className="eyebrow" style={{marginBottom: 4}}>{d.l}</div>
                <input defaultValue={d.v} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
              </div>
            ))}
          </div>
          <div style={{marginTop: 14, padding: 11, background: "color-mix(in srgb, var(--pos) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 22%, var(--border))", borderRadius: 6, fontSize: 11.5}}>
            <span className="mono">BMR 1,821 × 1.725 = TDEE 3,141 kcal</span>
            <span className="muted"> — recomposition target lands at 2,891 kcal.</span>
          </div>
        </>
      )}

      {s.kind === "modules" && (
        <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8}}>
          {s.modules.map(m => (
            <div key={m.l} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 7, cursor: "pointer",
              background: m.on ? "color-mix(in srgb, var(--acc-coach) 10%, var(--surface))" : "var(--surface)",
              border: `1px solid ${m.on ? "color-mix(in srgb, var(--acc-coach) 35%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{width: 16, height: 16, borderRadius: 4, display: "grid", placeItems: "center", flexShrink: 0,
                background: m.on ? "var(--acc-coach)" : "transparent", border: `1px solid ${m.on ? "var(--acc-coach)" : "var(--border-strong)"}`}}>
                {m.on && <Icon name="check" className="ic" style={{width: 10, height: 10, color: "var(--bg)", strokeWidth: 3}}/>}
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12.5, fontWeight: m.on ? 600 : 500}}>{m.l}</div>
                <div className="muted" style={{fontSize: 10.5}}>{m.d}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {s.kind === "devices" && (
        <div className="col-gap" style={{gap: 6}}>
          {s.devices.map(d => (
            <div key={d.l} style={{display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div style={{width: 30, height: 30, borderRadius: 6, background: d.on ? "color-mix(in srgb, var(--pos) 14%, var(--surface-2))" : "var(--surface-2)", border: `1px solid ${d.on ? "color-mix(in srgb, var(--pos) 30%, var(--border))" : "var(--border)"}`, display: "grid", placeItems: "center", color: d.on ? "var(--pos)" : "var(--fg-dim)", flexShrink: 0}}>
                <Icon name="training" className="ic ic-sm"/>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12.5, fontWeight: 500}}>{d.l}</div>
                <div className="muted" style={{fontSize: 10.5}}>{d.d}</div>
              </div>
              {d.on ? <Pill variant="pos" dot>connected</Pill> : <button className="btn btn-sm">Connect</button>}
            </div>
          ))}
        </div>
      )}

      {s.kind === "persona" && (
        <div className="col-gap" style={{gap: 7}}>
          {s.personas.map(p => (
            <div key={p.l} style={{
              padding: 12, borderRadius: 7, cursor: "pointer",
              background: p.on ? "color-mix(in srgb, var(--acc-buddy) 10%, var(--surface))" : "var(--surface)",
              border: `1px solid ${p.on ? "color-mix(in srgb, var(--acc-buddy) 35%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                <div style={{width: 14, height: 14, borderRadius: 999, border: `2px solid ${p.on ? "var(--acc-buddy)" : "var(--border-strong)"}`, background: p.on ? "var(--acc-buddy)" : "transparent", flexShrink: 0}}/>
                <span style={{fontSize: 12.5, fontWeight: 600}}>{p.l}</span>
                <span className="muted" style={{fontSize: 11}}>· {p.d}</span>
              </div>
              <div className="muted" style={{fontSize: 12, lineHeight: 1.5, paddingLeft: 22, fontStyle: "italic"}}>&ldquo;{p.q}&rdquo;</div>
            </div>
          ))}
        </div>
      )}

      {s.kind === "privacy" && (
        <>
          <table className="tbl">
            <thead><tr><th>Module</th><th style={{width: 90}}>You</th><th style={{width: 90}}>Coaches</th><th style={{width: 110}}>Buddy</th><th style={{width: 90}}>LumeOS</th></tr></thead>
            <tbody>
              {s.rows.map(r => (
                <tr key={r.m}>
                  <td style={{fontSize: 12.5}}>{r.m}</td>
                  <td><Pill variant="pos">{r.you}</Pill></td>
                  <td><Pill>{r.coach}</Pill></td>
                  <td>{r.buddy === "off" ? <Pill>{r.buddy}</Pill> : <Pill variant="acc">{r.buddy}</Pill>}</td>
                  <td><Pill>{r.us}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop: 12, padding: 11, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
            <Icon name="shield" className="ic ic-sm" style={{display: "inline", verticalAlign: "middle", marginRight: 5, color: "var(--pos)"}}/>
            Export everything as JSON at any time. Deletion has a fourteen-day grace period, then it is permanent.
          </div>
        </>
      )}

      {s.kind === "tiers" && (
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10}}>
          {s.tiers.map(t => (
            <div key={t.l} style={{
              padding: 14, borderRadius: 8, cursor: "pointer",
              background: t.on ? "color-mix(in srgb, var(--acc-coach) 10%, var(--surface))" : "var(--surface)",
              border: `1px solid ${t.on ? "color-mix(in srgb, var(--acc-coach) 38%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{fontSize: 14, fontWeight: 600, marginBottom: 2, color: t.on ? "var(--acc-coach)" : "var(--fg)"}}>{t.l}</div>
              <div className="num dim" style={{fontSize: 12, marginBottom: 10}}>{t.p} / mo</div>
              <div className="col-gap" style={{gap: 5}}>
                {t.f.map(x => (
                  <div key={x} style={{display: "flex", gap: 6, fontSize: 10.5, lineHeight: 1.4}}>
                    <Icon name="check" className="ic" style={{width: 10, height: 10, color: t.on ? "var(--acc-coach)" : "var(--fg-dim)", flexShrink: 0, marginTop: 2}}/>
                    <span className="muted">{x}</span>
                  </div>
                ))}
              </div>
              {t.on && <Pill variant="acc" style={{marginTop: 10}}>14 days free</Pill>}
            </div>
          ))}
        </div>
      )}

      {s.kind === "done" && (
        <div className="col-gap" style={{gap: 0}}>
          {s.summary.map(x => (
            <div key={x.l} className="row" style={{fontSize: 12.5, padding: "10px 0"}}>
              <span className="row-l">{x.l}</span>
              <span className="row-r" style={{fontFamily: "var(--font-sans)"}}>{x.v}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{display: "flex", gap: 6, justifyContent: "space-between", marginTop: 18}}>
        <button className="btn btn-ghost" disabled={n === 1} onClick={() => setN(x => Math.max(1, x - 1))}>Back</button>
        <div style={{display: "flex", gap: 6}}>
          {n < 10 && <button className="btn btn-ghost" onClick={() => setN(x => x + 1)}>Skip</button>}
          <button className="btn btn-primary" disabled={n === 10} onClick={() => setN(x => Math.min(10, x + 1))}>
            {n === 10 ? "Finished" : "Continue →"}
          </button>
        </div>
      </div>
    </Card>
  );
};

window.WALK = WALK;
