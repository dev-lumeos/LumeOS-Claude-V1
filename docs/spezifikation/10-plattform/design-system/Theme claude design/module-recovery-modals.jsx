// Recovery modals & detail drawers

const RecModal = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 540 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && (
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: `color-mix(in oklch, ${accent || "var(--acc-recov)"} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent || "var(--acc-recov)"} 35%, transparent)`,
            color: accent || "var(--acc-recov)", display: "grid", placeItems: "center"
          }}><Icon name={eyebrow} className="ic" /></div>
        )}
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize: 11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic" /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

const RecField = ({ label, sub, children }) => (
  <div style={{marginBottom: 14}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5}}>
      <label className="eyebrow">{label}</label>
      {sub && <span className="dim" style={{fontSize: 10}}>{sub}</span>}
    </div>
    {children}
  </div>
);

const RecInput = ({ value, onChange, placeholder, type = "text", suffix }) => (
  <div style={{position: "relative"}}>
    <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none"}}/>
    {suffix && <span className="dim mono" style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>{suffix}</span>}
  </div>
);

const RecSlider = ({ value, onChange, min = 0, max = 10, label }) => (
  <div>
    <div style={{display: "flex", gap: 3, marginBottom: 4}}>
      {Array.from({length: max - min + 1}).map((_, i) => (
        <button key={i} onClick={() => onChange(min + i)}
          style={{
            flex: 1, height: 24, borderRadius: 3, border: 0, cursor: "pointer",
            background: (min + i) <= value ? "var(--acc-recov)" : "var(--surface-2)",
            opacity: (min + i) <= value ? 0.4 + (i / max) * 0.6 : 1,
            color: (min + i) === value ? "var(--bg)" : "var(--fg-dim)",
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          }}>{min + i}</button>
      ))}
    </div>
    {label && <div className="dim" style={{fontSize: 10, fontFamily: "var(--font-mono)"}}>{label}</div>}
  </div>
);

// ── Log Sleep Modal ───────────────────────────────────────────
const LogSleepModal = ({ onClose }) => {
  const [src, setSrc] = useState("garmin");
  const [bedtime, setBedtime] = useState("22:48");
  const [waketime, setWaketime] = useState("06:30");
  const [quality, setQuality] = useState(7);
  return (
    <RecModal title="Log sleep · last night" subtitle="Auto-imported · edit or override manually" eyebrow="moon" onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save sleep entry</button>
      </>}>
      <RecField label="Source">
        <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
          {[
            { id: "garmin", l: "Garmin · auto", icon: "training" },
            { id: "polar",  l: "Polar · auto",  icon: "training" },
            { id: "whoop",  l: "Whoop · auto",  icon: "training" },
            { id: "manual", l: "Manual entry",  icon: "edit" },
          ].map(s => (
            <button key={s.id} onClick={() => setSrc(s.id)}
              className={src === s.id ? "btn btn-primary" : "btn"} style={{height: 28, fontSize: 11}}>
              <Icon name={s.icon} className="ic ic-sm"/>{s.l}
            </button>
          ))}
        </div>
      </RecField>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
        <RecField label="Date"><RecInput type="date" value="2026-05-15" onChange={()=>{}}/></RecField>
        <RecField label="Bedtime"><RecInput type="time" value={bedtime} onChange={setBedtime}/></RecField>
        <RecField label="Wake time"><RecInput type="time" value={waketime} onChange={setWaketime}/></RecField>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
        <RecField label="Total duration" sub="auto-computed">
          <RecInput value="7h 42m" onChange={()=>{}} suffix="hrs"/>
        </RecField>
        <RecField label="Efficiency" sub="time asleep / time in bed">
          <RecInput value="94" onChange={()=>{}} type="number" suffix="%"/>
        </RecField>
      </div>
      <RecField label="Subjective quality" sub={`${quality} / 10`}>
        <RecSlider value={quality} onChange={setQuality} min={1} max={10} label="1 = wreckage · 5 = mediocre · 10 = perfect"/>
      </RecField>
      {src === "manual" && (
        <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, marginBottom: 14}}>
          <div className="eyebrow" style={{marginBottom: 8}}>Manual sleep stages (optional)</div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8}}>
            <div><div className="dim mono" style={{fontSize: 10}}>Deep</div><RecInput value="" onChange={()=>{}} placeholder="hrs" suffix="h"/></div>
            <div><div className="dim mono" style={{fontSize: 10}}>REM</div><RecInput value="" onChange={()=>{}} placeholder="hrs" suffix="h"/></div>
            <div><div className="dim mono" style={{fontSize: 10}}>Light</div><RecInput value="" onChange={()=>{}} placeholder="hrs" suffix="h"/></div>
            <div><div className="dim mono" style={{fontSize: 10}}>Awake</div><RecInput value="" onChange={()=>{}} placeholder="min" suffix="m"/></div>
          </div>
        </div>
      )}
      <RecField label="Notes (optional)">
        <RecInput value="" onChange={()=>{}} placeholder="Wake-up reason, dreams, caffeine cutoff…"/>
      </RecField>
    </RecModal>
  );
};

// ── Readiness Check-in Modal ──────────────────────────────────
const ReadinessCheckinModal = ({ onClose }) => {
  const [vals, setVals] = useState({ energy: 82, mood: 90, soreness: 78, motivation: 86, stress: 71, sleep_feel: 80 });
  const upd = (k, v) => setVals(s => ({...s, [k]: v}));
  const items = [
    { k: "energy", l: "Energy", desc: "physical energy reserve right now" },
    { k: "mood", l: "Mood", desc: "overall psychological state" },
    { k: "soreness", l: "Soreness (inverse)", desc: "10 = no soreness, 1 = wrecked" },
    { k: "motivation", l: "Training motivation", desc: "would you train if asked?" },
    { k: "stress", l: "Stress (inverse)", desc: "10 = calm, 1 = peak stress" },
    { k: "sleep_feel", l: "Sleep felt like", desc: "your subjective rating, not the device's" },
  ];
  const avg = Math.round(Object.values(vals).reduce((s,v) => s+v, 0) / Object.values(vals).length);
  return (
    <RecModal title="Daily readiness check-in" subtitle="60 seconds · feeds the Recovery score (15% weight)" eyebrow="edit" onClose={onClose} width={600}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save · {avg}/100</button>
      </>}>
      <div className="dim" style={{fontSize: 11, marginBottom: 14, lineHeight: 1.5}}>
        Score from 1 (worst) to 10 (best). Combined into Subjective component. Pattern-matched against past performance after 30+ entries.
      </div>
      <div className="col-gap" style={{gap: 12}}>
        {items.map(i => (
          <div key={i.k}>
            <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6}}>
              <div>
                <span style={{fontSize: 12, fontWeight: 500}}>{i.l}</span>
                <span className="dim" style={{fontSize: 10, marginLeft: 8}}>{i.desc}</span>
              </div>
              <span className="num" style={{fontSize: 12, color: "var(--acc-recov)"}}>{Math.round(vals[i.k]/10)}/10</span>
            </div>
            <RecSlider value={Math.round(vals[i.k]/10)} onChange={v => upd(i.k, v*10)} min={1} max={10}/>
          </div>
        ))}
      </div>
      <div className="divider"/>
      <RecField label="Notes (optional)">
        <RecInput value="" onChange={()=>{}} placeholder="Anything notable? Travel, sickness, life events…"/>
      </RecField>
      <div style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "color-mix(in oklch, var(--pos) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--pos) 22%, var(--border))", borderRadius: 6, fontSize: 11.5}}>
        <Icon name="trend_up" className="ic" style={{color: "var(--pos)"}}/>
        <div>Subjective score: <span className="num" style={{color: "var(--fg)"}}>{avg}/100</span> · contributes <span className="num" style={{color: "var(--pos)"}}>+{(avg * 0.15).toFixed(1)}</span> to today's Recovery composite.</div>
      </div>
    </RecModal>
  );
};

// ── Log Protocol Modal ────────────────────────────────────────
const PROTOCOL_DEFS = [
  { id: "cold",       name: "Cold plunge",     icon: "droplet",  fields: ["duration_min", "temp_c"]  },
  { id: "sauna",      name: "Sauna",           icon: "flame",    fields: ["duration_min", "temp_c"] },
  { id: "mobility",   name: "Mobility",        icon: "recovery", fields: ["duration_min", "routine"]  },
  { id: "massage",    name: "Massage",         icon: "recovery", fields: ["duration_min", "pressure"]  },
  { id: "meditation", name: "Meditation",      icon: "brain",    fields: ["duration_min", "type"]  },
  { id: "stretching", name: "Stretching",      icon: "recovery", fields: ["duration_min"]   },
  { id: "breathwork", name: "Breathwork",      icon: "brain",    fields: ["duration_min", "protocol"]  },
  { id: "walk",       name: "Easy walk",       icon: "training", fields: ["duration_min", "distance_km"]  },
];

const LogProtocolModal = ({ onClose, defaultProtocol }) => {
  const [proto, setProto] = useState(defaultProtocol || "cold");
  const def = PROTOCOL_DEFS.find(p => p.id === proto);
  return (
    <RecModal title="Log recovery protocol" subtitle="Adds to frequency tracking + score" eyebrow="plus" onClose={onClose} width={580}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Log protocol</button>
      </>}>
      <RecField label="Protocol type">
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6}}>
          {PROTOCOL_DEFS.map(p => (
            <button key={p.id} onClick={() => setProto(p.id)}
              style={{
                padding: "10px 8px", borderRadius: 6,
                background: proto === p.id ? "color-mix(in oklch, var(--acc-recov) 12%, var(--surface))" : "var(--surface)",
                border: `1px solid ${proto === p.id ? "color-mix(in oklch, var(--acc-recov) 35%, var(--border))" : "var(--border)"}`,
                color: proto === p.id ? "var(--acc-recov)" : "var(--fg-muted)",
                cursor: "pointer", fontSize: 11,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4
              }}>
              <Icon name={p.icon} className="ic"/>
              {p.name}
            </button>
          ))}
        </div>
      </RecField>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
        <RecField label="Date"><RecInput type="date" value="2026-05-16" onChange={()=>{}}/></RecField>
        <RecField label="Time"><RecInput type="time" value="07:08" onChange={()=>{}}/></RecField>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
        <RecField label="Duration">
          <RecInput value="3" onChange={()=>{}} type="number" suffix="min"/>
        </RecField>
        {def.fields.includes("temp_c") && (
          <RecField label="Temperature">
            <RecInput value={proto === "cold" ? "12" : "92"} onChange={()=>{}} type="number" suffix="°C"/>
          </RecField>
        )}
        {def.fields.includes("distance_km") && (
          <RecField label="Distance">
            <RecInput value="" onChange={()=>{}} type="number" suffix="km"/>
          </RecField>
        )}
        {def.fields.includes("routine") && (
          <RecField label="Routine">
            <RecInput value="" onChange={()=>{}} placeholder="e.g. hips + thoracic"/>
          </RecField>
        )}
        {def.fields.includes("type") && (
          <RecField label="Type">
            <RecInput value="" onChange={()=>{}} placeholder="e.g. focused-attention"/>
          </RecField>
        )}
        {def.fields.includes("protocol") && (
          <RecField label="Protocol">
            <RecInput value="" onChange={()=>{}} placeholder="e.g. 4-7-8 / box / Wim Hof"/>
          </RecField>
        )}
        {def.fields.includes("pressure") && (
          <RecField label="Pressure">
            <RecInput value="" onChange={()=>{}} placeholder="light · medium · deep"/>
          </RecField>
        )}
        <RecField label="Felt benefit" sub="1–5"><RecInput value="4" onChange={()=>{}} type="number" suffix="/5"/></RecField>
      </div>
      <RecField label="Notes (optional)">
        <RecInput value="" onChange={()=>{}} placeholder="Context, location, immediate effects…"/>
      </RecField>
    </RecModal>
  );
};

// ── Wearable Sync Modal ───────────────────────────────────────
const WearableSyncModal = ({ onClose }) => {
  const devices = [
    { id: "garmin",   name: "Garmin",       model: "Fēnix 8 · Solar",   status: "synced", last: "8s ago",  metrics: ["HRV","RHR","Sleep stages","SpO₂","Stress","Body Battery"], primary: true },
    { id: "polar",    name: "Polar",        model: "H10 chest strap",   status: "synced", last: "8s ago",  metrics: ["HR (workout)","HRV (orthostatic test)"], primary: false },
    { id: "whoop",    name: "Whoop",        model: "4.0 band",          status: "paused", last: "2d ago",  metrics: ["HRV","RHR","Strain","Recovery"], primary: false },
    { id: "oura",     name: "Oura",         model: "Gen 3",             status: "not_connected", last: "—", metrics: ["Sleep stages","Temperature","HRV","Readiness"], primary: false },
    { id: "apple",    name: "Apple Health", model: "iPhone 17 Pro",     status: "synced", last: "1m ago",  metrics: ["Steps","Workouts","Heart Rate","Mindful minutes"], primary: false },
  ];
  return (
    <RecModal title="Wearables & data sources" subtitle="Manage connections, conflict rules, sync state" eyebrow="settings" onClose={onClose} width={680}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary">Save changes</button></>}>
      <div className="col-gap" style={{gap: 8}}>
        {devices.map(d => (
          <div key={d.id} style={{
            padding: 14, borderRadius: 8,
            background: "var(--surface)", border: "1px solid var(--border)",
            display: "flex", alignItems: "flex-start", gap: 12
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 7,
              background: d.status === "synced" ? "color-mix(in oklch, var(--pos) 12%, var(--surface-2))" : "var(--surface-2)",
              border: `1px solid ${d.status === "synced" ? "color-mix(in oklch, var(--pos) 30%, var(--border))" : "var(--border)"}`,
              color: d.status === "synced" ? "var(--pos)" : d.status === "paused" ? "var(--warn)" : "var(--fg-dim)",
              display: "grid", placeItems: "center", flexShrink: 0
            }}><Icon name="training" className="ic"/></div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                <span style={{fontSize: 13, fontWeight: 600}}>{d.name}</span>
                <span className="dim" style={{fontSize: 11}}>· {d.model}</span>
                {d.primary && <Pill variant="acc">primary HRV</Pill>}
                {d.status === "synced" && <Pill variant="pos" dot>synced · {d.last}</Pill>}
                {d.status === "paused" && <Pill variant="warn" dot>paused · {d.last}</Pill>}
                {d.status === "not_connected" && <Pill>not connected</Pill>}
              </div>
              <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
                {d.metrics.map(m => <Pill key={m}>{m}</Pill>)}
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end"}}>
              {d.status === "synced" && <button className="btn btn-ghost btn-sm" style={{height: 22, fontSize: 11}}>Pause</button>}
              {d.status === "paused" && <button className="btn btn-sm" style={{height: 22, fontSize: 11}}>Resume</button>}
              {d.status === "not_connected" && <button className="btn btn-primary btn-sm" style={{height: 22, fontSize: 11}}>Connect</button>}
              <button className="btn-ghost btn-sm" style={{height: 22, fontSize: 11, padding: "0 6px", color: "var(--fg-dim)"}}>⋯</button>
            </div>
          </div>
        ))}
      </div>
      <div className="divider"/>
      <div className="eyebrow" style={{marginBottom: 6}}>Conflict resolution</div>
      <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
        When multiple devices report the same metric, LumeOS picks based on priority. For HRV, Polar's orthostatic-test reading overrides Garmin's nightly reading on test mornings.
      </div>
    </RecModal>
  );
};

// ── Protocol Detail Drawer ────────────────────────────────────
const ProtocolDetail = ({ name, onClose, onLog }) => {
  const trend30 = Array.from({length: 30}, (_, i) => Math.random() > 0.4 ? 1 : 0);
  return (
    <RecModal title={name} subtitle="Frequency · effect on recovery · history" eyebrow="droplet" onClose={onClose} width={620}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onLog}><Icon name="plus" className="ic ic-sm"/>Log {name.toLowerCase()}</button>
      </>}>
      <div className="grid g-cols-3" style={{gap: 10, marginBottom: 16}}>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>30d count</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500}}>12</div>
          <div className="muted" style={{fontSize: 11}}>2.8 / wk</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Target</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500}}>14</div>
          <div className="muted" style={{fontSize: 11}}>3 / wk</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Streak</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500}}>4d</div>
          <div className="muted" style={{fontSize: 11}}>since May 12</div>
        </Card>
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Last 30 days</div>
      <div style={{display: "flex", gap: 3, marginBottom: 14}}>
        {trend30.map((v, i) => (
          <div key={i} style={{flex: 1, height: 16, borderRadius: 2, background: v ? "var(--acc-recov)" : "var(--surface-2)", opacity: v ? 0.7 : 1}}/>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Effect on HRV (rMSSD) next morning</div>
      <Card className="card-tight" style={{padding: 12, marginBottom: 14}}>
        <div style={{display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4}}>
          <span className="num" style={{fontSize: 22, fontWeight: 500, color: "var(--pos)"}}>+4.2 ms</span>
          <span className="dim" style={{fontSize: 11}}>vs. days without · n=12 paired</span>
        </div>
        <div className="dim" style={{fontSize: 11, lineHeight: 1.5}}>Significant lift in overnight HRV when {name.toLowerCase()} is logged in the prior 24h. Buddy includes this in your weekly recommendation.</div>
      </Card>
      <div className="eyebrow" style={{marginBottom: 6}}>Recent entries</div>
      <table className="tbl">
        <tbody>
          <tr><td className="num">Today 07:08</td><td>3 min · 12°C · post AM cardio</td><td className="num">+5ms</td></tr>
          <tr><td className="num">Yesterday 06:42</td><td>2.5 min · 12°C</td><td className="num">+3ms</td></tr>
          <tr><td className="num">Wed May 14</td><td>3 min · 11°C · post-workout</td><td className="num">+6ms</td></tr>
          <tr><td className="num">Mon May 12</td><td>2 min · 13°C</td><td className="num">+2ms</td></tr>
        </tbody>
      </table>
    </RecModal>
  );
};

// ── Muscle Detail Drawer ──────────────────────────────────────
const MuscleDetail = ({ muscle, onClose }) => (
  <RecModal title={muscle} subtitle="Recovery trend · last training · exercises that hit it" eyebrow="recovery" onClose={onClose} width={560}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="training" className="ic ic-sm"/>Open Training</button></>}>
    <div className="grid g-cols-3" style={{gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}>
        <div className="eyebrow">Recovery</div>
        <div className="num" style={{fontSize: 22, color: "var(--pos)"}}>88%</div>
      </Card>
      <Card className="card-tight" style={{padding: 12}}>
        <div className="eyebrow">Last hit</div>
        <div className="num" style={{fontSize: 14}}>3 days ago</div>
        <div className="muted" style={{fontSize: 11}}>Push A · Wed</div>
      </Card>
      <Card className="card-tight" style={{padding: 12}}>
        <div className="eyebrow">Soreness</div>
        <div className="num" style={{fontSize: 14}}>2 / 10</div>
        <div className="muted" style={{fontSize: 11}}>subjective</div>
      </Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Recovery curve · 72h</div>
    <LineChart h={120} range={[0, 100]} xLabels={["Wed 22:00","","","Thu","","","Fri","","","today"]}
      series={[{ data: [10, 32, 48, 58, 65, 70, 76, 81, 85, 88], color: "var(--acc-recov)" }]}/>
    <div className="eyebrow" style={{marginTop: 14, marginBottom: 6}}>Exercises that loaded it</div>
    <table className="tbl">
      <tbody>
        <tr><td>Bench Press</td><td className="num muted">5×5 @ 115kg</td><td className="num">≈ 65% sets</td></tr>
        <tr><td>Incline DB Press</td><td className="num muted">4×8 @ 36kg</td><td className="num">≈ 25% sets</td></tr>
        <tr><td>Cable Fly</td><td className="num muted">3×12 @ 22kg</td><td className="num">≈ 10% sets</td></tr>
      </tbody>
    </table>
  </RecModal>
);

// ── Recommendations Tab (KI) ──────────────────────────────────
const RECOMMENDATIONS = [
  {
    id: "rec-1",
    priority: "high",
    title: "Move Push B from 18:00 to 16:30 — match HRV peak window",
    body: "Your HRV trough sits around 19:00–20:00 on training nights for the last 14 days. Moving heavy push work 90 minutes earlier puts the stress earlier in the day and gives sleep more buffer. Predicted recovery score +3 over 14 days.",
    drivers: ["HRV trough at 19:30", "Sleep onset delayed by 28min on training days", "Score correlation"],
    confidence: 0.81,
    sourceModules: ["training", "recovery"],
    action: "Reschedule Push B",
  },
  {
    id: "rec-2",
    priority: "high",
    title: "Add second cold plunge per week — n=12 shows +4.2ms HRV next morning",
    body: "Cold plunges land at 2.8/wk against your 3.5/wk target. Effect is statistically robust on your data (12 paired days, p ≈ 0.02). Consider stacking it onto Thu rest day to extend recovery without adding load.",
    drivers: ["Protocol frequency below target", "Effect size +4.2ms", "Thu = lowest load day"],
    confidence: 0.74,
    sourceModules: ["recovery", "training"],
    action: "Schedule for Thu morning",
  },
  {
    id: "rec-3",
    priority: "medium",
    title: "Glucose trending up on MK-677 — request earlier lab panel",
    body: "Last fasting glucose was 102 mg/dL (up from 88 pre-cycle). On the current trajectory, you reach 110 around June 5 — at which point Buddy recommends an early cycle-off. Pull the next panel forward by 4 weeks.",
    drivers: ["MK-677 cycle wk 7/12", "Fasting glucose +14", "Out-of-range threshold approaching"],
    confidence: 0.69,
    sourceModules: ["supplements", "medical"],
    action: "Schedule lab earlier",
  },
  {
    id: "rec-4",
    priority: "medium",
    title: "Sleep window drift — bedtime moved 22 min later in 14 days",
    body: "Your bedtime is creeping toward 23:30. Sleep duration has held but sleep efficiency dropped 3 points. A consistent 22:45 anchor restores efficiency without changing total time.",
    drivers: ["Bedtime variance ±28min", "Efficiency 94% → 91%", "Late screen exposure (correlated)"],
    confidence: 0.62,
    sourceModules: ["recovery"],
    action: "Set bedtime reminder",
  },
  {
    id: "rec-5",
    priority: "low",
    title: "Magnesium timing — try moving 60 min earlier on training nights",
    body: "On training nights with whey at 19:30, Mg at 22:00 lands at ≈2.5h gap. Moving Mg to 21:00 widens to 3.5h and may improve absorption — small effect, low risk.",
    drivers: ["Whey-Mg interaction", "Training night pattern", "Subjective sleep felt-quality"],
    confidence: 0.48,
    sourceModules: ["supplements", "recovery"],
    action: "Shift schedule",
  },
];

const RecoveryInsights = ({ open }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? RECOMMENDATIONS : RECOMMENDATIONS.filter(r => r.priority === filter);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.6fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 14}}>
        <div style={{display: "flex", alignItems: "center", gap: 10, padding: 12, background: "color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "color-mix(in oklch, var(--acc-buddy) 18%, transparent)",
            border: "1px solid color-mix(in oklch, var(--acc-buddy) 35%, transparent)",
            color: "var(--acc-buddy)", display: "grid", placeItems: "center"
          }}><Icon name="sparkles" className="ic ic-lg"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 13, fontWeight: 600, marginBottom: 2}}>Buddy · recovery insights</div>
            <div className="muted" style={{fontSize: 11.5}}>{RECOMMENDATIONS.length} recommendations from training-load × recovery-score correlation · last analysis 12m ago</div>
          </div>
          <button className="btn"><Icon name="refresh" className="ic ic-sm"/> Re-analyze</button>
        </div>
        <div style={{display: "flex", gap: 6, alignItems: "center"}}>
          <span className="eyebrow">Filter</span>
          {["all", "high", "medium", "low"].map(p => (
            <button key={p} onClick={() => setFilter(p)} className={filter === p ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{p}</button>
          ))}
        </div>
        {filtered.map(r => <RecommendationCard key={r.id} r={r}/>)}
      </div>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Training load × Recovery" sub="last 30 days · correlation -0.62">
          <CorrelationChart/>
          <div className="dim" style={{fontSize: 11, lineHeight: 1.5, marginTop: 8}}>Negative correlation expected — higher load suppresses next-day recovery. Outliers above the line are good-recovery-despite-load days; worth replicating.</div>
        </Card>
        <Card title="Readiness ↔ performance" sub="paired data · 23 sessions">
          <Card className="card-tight" style={{padding: 12}}>
            <div className="eyebrow" style={{marginBottom: 4}}>Best PR days</div>
            <div className="num" style={{fontSize: 16, marginBottom: 4}}>Subjective ≥ 85</div>
            <div className="muted" style={{fontSize: 11}}>4 of 4 last PRs were on days with check-in ≥ 85.</div>
          </Card>
          <div style={{height: 8}}/>
          <Card className="card-tight" style={{padding: 12}}>
            <div className="eyebrow" style={{marginBottom: 4}}>Worst sessions</div>
            <div className="num" style={{fontSize: 16, marginBottom: 4}}>Subjective ≤ 65</div>
            <div className="muted" style={{fontSize: 11}}>All 3 lost sets last month happened with check-in ≤ 65 — consider auto-deload day threshold.</div>
          </Card>
        </Card>
        <Card title="Pattern detection · 30d">
          <div className="col-gap" style={{gap: 6}}>
            <div className="row"><span className="row-l">Late-day caffeine</span><span className="row-r" style={{color: "var(--warn)"}}>−4ms HRV</span></div>
            <div className="row"><span className="row-l">Sauna in 24h window</span><span className="row-r" style={{color: "var(--pos)"}}>+3ms HRV</span></div>
            <div className="row"><span className="row-l">Travel day</span><span className="row-r" style={{color: "var(--neg)"}}>−9 recovery</span></div>
            <div className="row"><span className="row-l">Cheat meal evening</span><span className="row-r" style={{color: "var(--fg-dim)"}}>no effect</span></div>
            <div className="row"><span className="row-l">Alcohol > 1 drink</span><span className="row-r" style={{color: "var(--neg)"}}>−11 recovery</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const RecommendationCard = ({ r }) => {
  const priColor = r.priority === "high" ? "var(--neg)" : r.priority === "medium" ? "var(--warn)" : "var(--fg-dim)";
  return (
    <Card style={{position: "relative"}}>
      <div style={{position: "absolute", top: 14, left: 0, width: 3, bottom: 14, background: priColor, borderRadius: "0 2px 2px 0"}}/>
      <div style={{paddingLeft: 8}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
          <Pill style={{borderColor: `color-mix(in oklch, ${priColor} 35%, var(--border))`, color: priColor, background: `color-mix(in oklch, ${priColor} 6%, transparent)`}}>{r.priority} priority</Pill>
          {r.sourceModules.map(m => <Pill key={m}>{m}</Pill>)}
          <span className="dim" style={{marginLeft: "auto", fontSize: 10}}>confidence <span className="num">{(r.confidence * 100).toFixed(0)}%</span></span>
        </div>
        <div style={{fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em", lineHeight: 1.35}}>{r.title}</div>
        <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>{r.body}</div>
        <div className="eyebrow" style={{marginBottom: 4}}>Why this recommendation</div>
        <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10}}>
          {r.drivers.map(d => <Pill key={d}><Icon name="sparkles" className="ic ic-sm"/>{d}</Pill>)}
        </div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>{r.action}</button>
          <button className="btn btn-ghost">Dismiss</button>
          <button className="btn btn-ghost">Remind later</button>
        </div>
      </div>
    </Card>
  );
};

const CorrelationChart = () => {
  const dots = Array.from({length: 30}, (_, i) => {
    const load = 200 + Math.random() * 600;
    const rec = 95 - load * 0.04 + (Math.random() - 0.5) * 20;
    return { load, rec };
  });
  return (
    <svg viewBox="0 0 280 160" style={{width: "100%", height: 160}}>
      <line x1="30" y1="140" x2="270" y2="140" stroke="var(--border)" strokeWidth="1"/>
      <line x1="30" y1="20" x2="30" y2="140" stroke="var(--border)" strokeWidth="1"/>
      <line x1="30" y1="40" x2="270" y2="120" stroke="var(--fg-dim)" strokeWidth="1" strokeDasharray="3 3"/>
      {dots.map((d, i) => (
        <circle key={i} cx={30 + ((d.load - 200) / 600) * 240} cy={140 - (d.rec / 100) * 120} r={3}
          fill="var(--acc-recov)" opacity="0.7"/>
      ))}
      <text x="270" y="155" textAnchor="end" fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)">load (TSS)</text>
      <text x="30" y="15" fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)">recovery</text>
    </svg>
  );
};

Object.assign(window, {
  LogSleepModal, ReadinessCheckinModal, LogProtocolModal, WearableSyncModal,
  ProtocolDetail, MuscleDetail, RecoveryInsights, PROTOCOL_DEFS,
  RecModal, RecField, RecInput, RecSlider,
});
