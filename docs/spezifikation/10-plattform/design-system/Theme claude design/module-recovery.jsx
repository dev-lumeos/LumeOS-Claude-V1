// Recovery module

const RecCtx = React.createContext(null);

const RecoveryModule = () => {
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({type, payload});
  const close = () => setModal(null);
  const ctx = { open, close };
  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Recovery</span>
            <Pill variant="acc">Score 82 · Optimal</Pill>
            <Pill style={{cursor: "pointer"}} onClick={() => open("wearables")}><span className="dot" style={{background: "var(--pos)"}} />Garmin · Polar synced</Pill>
          </div>
          <div className="module-sub">Sleep, HRV, biometrics, and recovery protocol log</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => open("sleep")}><Icon name="moon" className="ic ic-sm" /> Log sleep</button>
          <button className="btn" onClick={() => open("readiness")}><Icon name="edit" className="ic ic-sm" /> Readiness check</button>
          <button className="btn btn-primary" onClick={() => open("protocol")}><Icon name="plus" className="ic ic-sm" /> Log protocol</button>
        </div>
      </div>
      <Tabs
        items={[
          { id: "today",     label: "Today",        icon: "zap" },
          { id: "sleep",     label: "Sleep",        icon: "moon" },
          { id: "biometric", label: "Biometrics",   icon: "trend_up" },
          { id: "protocols", label: "Protocols",    icon: "droplet" },
          { id: "body",      label: "Body map",     icon: "recovery" },
          { id: "stress",    label: "Stress",       icon: "brain" },
          { id: "insights",  label: "Insights",     icon: "sparkles", count: 5 },
        ]}
        active={tab}
        onChange={setTab}
      />
      <RecCtx.Provider value={ctx}>
      {tab === "today" && <RecoveryToday />}
      {tab === "sleep" && <RecoverySleep />}
      {tab === "biometric" && <RecoveryBiometric />}
      {tab === "protocols" && <RecoveryProtocols />}
      {tab === "body" && <RecoveryBody />}
      {tab === "stress" && window.RecoveryStress && <window.RecoveryStress/>}
      {tab === "insights" && <RecoveryInsights open={open}/>}
      </RecCtx.Provider>

      {modal?.type === "sleep"     && <LogSleepModal onClose={close}/>}
      {modal?.type === "readiness" && <ReadinessCheckinModal onClose={close}/>}
      {modal?.type === "protocol"  && <LogProtocolModal onClose={close} defaultProtocol={modal.payload?.protocol}/>}
      {modal?.type === "wearables" && <WearableSyncModal onClose={close}/>}
      {modal?.type === "protoDetail" && <ProtocolDetail name={modal.payload.name} onClose={close} onLog={() => { close(); setTimeout(() => open("protocol", {protocol: modal.payload.id}), 50); }}/>}
      {modal?.type === "muscle"    && <MuscleDetail muscle={modal.payload.name} onClose={close}/>}
      <HRVCommentLauncher/>
    </>
  );
};

const HRVCommentLauncher = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("open-hrv-comment", h);
    return () => window.removeEventListener("open-hrv-comment", h);
  }, []);
  if (!open || !window.HRVCommentModal) return null;
  return <window.HRVCommentModal onClose={() => setOpen(false)}/>;
};

const RecoveryToday = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 16}}>
      <Card>
        <div style={{display: "flex", gap: 20, alignItems: "center"}}>
          <Ring value={82} max={100} color="var(--acc-recov)" label="recovery" size={140} stroke={9} />
          <div style={{flex: 1}}>
            <div className="eyebrow" style={{marginBottom: 6}}>Status</div>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 8}}>Optimal — green light for intensity</div>
            <div style={{fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5}}>
              HRV is up 12% versus your 30-day baseline. Sleep quality at 84 for the second consecutive night. Subjective soreness in chest is down to 78.
            </div>
            <div style={{display: "flex", gap: 16, marginTop: 14}}>
              {[
                { l: "HRV", v: "64", u: "ms", d: "+4" },
                { l: "RHR", v: "52", u: "bpm", d: "-2" },
                { l: "SpO₂", v: "97", u: "%", d: "—" },
                { l: "Resp", v: "13.2", u: "rpm", d: "—" },
              ].map(m => (
                <div key={m.l}>
                  <div className="eyebrow" style={{marginBottom: 2}}>{m.l}</div>
                  <div className="num" style={{fontSize: 18, lineHeight: 1}}>
                    {m.v}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>{m.u}</span>
                  </div>
                  <div className="num" style={{fontSize: 10, color: m.d.startsWith("+") ? "var(--pos)" : "var(--fg-dim)"}}>{m.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Score breakdown">
        <div className="col-gap" style={{gap: 8}}>
          {[
            { k: "Sleep duration", v: 86, w: 0.20, why: "7h 42m of 8h target" },
            { k: "Sleep quality",  v: 84, w: 0.20, why: "REM 22% · Deep 18% · 2 wake events" },
            { k: "HRV",            v: 88, w: 0.20, why: "64ms · +12% vs baseline" },
            { k: "RHR",            v: 78, w: 0.10, why: "52 bpm · -2 vs avg" },
            { k: "Subjective",     v: 80, w: 0.15, why: "Mood 90 · Soreness 78 · Energy 82" },
            { k: "Training load",  v: 72, w: 0.15, why: "Last 7d TSS 2,142 · within window" },
          ].map((s, i) => (
            <div key={i} style={{display: "grid", gridTemplateColumns: "150px 60px 1fr 40px", gap: 12, alignItems: "center", fontSize: 11}}>
              <div>
                <div>{s.k}</div>
                <div className="dim" style={{fontSize: 10}}>weight <span className="num">{(s.w * 100).toFixed(0)}%</span></div>
              </div>
              <div className="num" style={{fontSize: 16}}>{s.v}</div>
              <div>
                <Meter value={s.v} color={s.v >= 80 ? "var(--pos)" : s.v >= 60 ? "var(--warn)" : "var(--neg)"} tall />
                <div className="dim" style={{fontSize: 10, marginTop: 3}}>{s.why}</div>
              </div>
              <div className="num dim" style={{fontSize: 10, textAlign: "right"}}>{(s.v * s.w).toFixed(1)}</div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between"}}>
          <span className="eyebrow">Weighted total</span>
          <span className="num" style={{fontSize: 24, color: "var(--acc-recov)"}}>82.4</span>
        </div>
      </Card>

      <Card title="Today · protocols logged" sub="3 entries">
        <div className="col-gap">
          {[
            { icon: "droplet", label: "Cold plunge", meta: "3 min · 12°C · post AM cardio", time: "07:08" },
            { icon: "recovery", label: "Mobility flow", meta: "15 min · routine: hips + thoracic", time: "10:30" },
            { icon: "flame", label: "Sauna", meta: "20 min · 92°C · planned 19:30", time: "Planned" },
          ].map((p, i) => (
            <div key={i} className="row">
              <span className="row-l">
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: "color-mix(in oklch, var(--acc-recov) 18%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--acc-recov) 35%, transparent)",
                  color: "var(--acc-recov)", display: "grid", placeItems: "center"
                }}>
                  <Icon name={p.icon} className="ic ic-sm" />
                </div>
                <div>
                  <div style={{fontSize: 12}}>{p.label}</div>
                  <div className="dim" style={{fontSize: 10}}>{p.meta}</div>
                </div>
              </span>
              <span className="num dim">{p.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 16}}>
      <Card title="HRV · last 30 days" sub="rMSSD nightly avg" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => window.dispatchEvent(new CustomEvent("open-hrv-comment"))}><Icon name="edit" className="ic ic-sm"/>Annotate</button>}>
        <LineChart
          h={140}
          range={[40, 80]}
          series={[
            { data: [54, 58, 52, 60, 56, 58, 62, 58, 60, 56, 54, 58, 62, 60, 64, 58, 56, 60, 62, 58, 60, 64, 62, 58, 60, 62, 64, 62, 64, 64], color: "var(--acc-recov)" },
            { data: Array(30).fill(58), color: "var(--fg-dim)" },
          ]}
          xLabels={["", "", "", "", "", "Apr 22", "", "", "", "", "May 1", "", "", "", "", "May 8", "", "", "", "", "May 15", "", "", "", "", "", "", "", "", ""]}
        />
        <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span>30d avg <span className="num" style={{color: "var(--fg)"}}>59 ms</span></span>
          <span>Today <span className="num" style={{color: "var(--pos)"}}>64 ms</span></span>
          <span className="dim">Trend ↑</span>
        </div>
      </Card>

      <Card title="Sleep · last 14 nights">
        <SleepStaging />
      </Card>

      <Card title="Readiness check-in" sub="subjective · today">
        <div className="col-gap" style={{gap: 10}}>
          {[
            { l: "Energy",      v: 82, color: "var(--acc-recov)" },
            { l: "Mood",        v: 90, color: "var(--acc-buddy)" },
            { l: "Soreness",    v: 78, color: "var(--acc-train)" },
            { l: "Motivation",  v: 86, color: "var(--acc-recov)" },
            { l: "Stress",      v: 71, color: "var(--warn)" },
          ].map(s => (
            <div key={s.l} style={{display: "grid", gridTemplateColumns: "80px 1fr 40px", gap: 10, alignItems: "center", fontSize: 11}}>
              <span style={{color: "var(--fg-muted)"}}>{s.l}</span>
              <div style={{display: "flex", gap: 3}}>
                {Array.from({length: 10}).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 8, borderRadius: 2,
                    background: i < s.v / 10 ? s.color : "var(--surface-2)",
                    opacity: i < s.v / 10 ? 0.5 + (i / 10) * 0.5 : 1,
                  }} />
                ))}
              </div>
              <span className="num" style={{textAlign: "right"}}>{s.v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const SleepStaging = () => {
  const nights = Array.from({length: 14}, (_, i) => {
    const dur = 6 + (Math.sin(i * 1.3) * 0.8 + 1.2);
    return {
      day: i,
      awake: 0.05 + Math.random() * 0.05,
      rem: 0.18 + Math.random() * 0.08,
      light: 0.45 + Math.random() * 0.08,
      deep: 0.18 + Math.random() * 0.06,
      duration: dur,
    };
  });
  return (
    <div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3, height: 80}}>
        {nights.map((n, i) => {
          const max = 9.5;
          const h = (n.duration / max) * 100;
          return (
            <div key={i} style={{position: "relative", height: "100%", display: "flex", alignItems: "flex-end"}}>
              <div style={{width: "100%", height: `${h}%`, display: "flex", flexDirection: "column", borderRadius: "2px 2px 0 0", overflow: "hidden"}}>
                <div style={{flex: n.awake, background: "var(--neg)", opacity: 0.7}} />
                <div style={{flex: n.rem,   background: "var(--acc-buddy)", opacity: 0.8}} />
                <div style={{flex: n.light, background: "var(--acc-recov)", opacity: 0.8}} />
                <div style={{flex: n.deep,  background: "var(--acc-coach)", opacity: 0.9}} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 3, marginTop: 6}}>
        {nights.map((n, i) => (
          <span key={i} className="num" style={{fontSize: 9, color: "var(--fg-dim)", textAlign: "center"}}>{i < 13 ? "" : "tn"}</span>
        ))}
      </div>
      <div style={{display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 8, height: 8, background: "var(--acc-coach)", display: "block", borderRadius: 2}} />Deep</span>
        <span className="row-gap"><span style={{width: 8, height: 8, background: "var(--acc-recov)", display: "block", borderRadius: 2}} />Light</span>
        <span className="row-gap"><span style={{width: 8, height: 8, background: "var(--acc-buddy)", display: "block", borderRadius: 2}} />REM</span>
        <span className="row-gap"><span style={{width: 8, height: 8, background: "var(--neg)", display: "block", borderRadius: 2}} />Awake</span>
        <span className="dim">Avg <span className="num" style={{color: "var(--fg)"}}>7.3h</span></span>
      </div>
    </div>
  );
};

const RecoverySleep = () => (
  <div className="grid" style={{gridTemplateColumns: "1fr 1fr", gap: 16}}>
    <Card title="Last night" sub="May 15 → 16">
      <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 16}}>
        <Ring value={84} max={100} color="var(--acc-recov)" label="quality" size={108} stroke={7} />
        <div style={{flex: 1}}>
          <div className="num" style={{fontSize: 26, lineHeight: 1, marginBottom: 4}}>7:42<span className="dim" style={{fontSize: 12, marginLeft: 4}}>hrs</span></div>
          <div className="muted" style={{fontSize: 11, marginBottom: 8}}>22:48 → 06:30 · efficiency 94%</div>
          {[
            { l: "Deep",  v: 1.32, p: "18%", color: "var(--acc-coach)" },
            { l: "REM",   v: 1.68, p: "22%", color: "var(--acc-buddy)" },
            { l: "Light", v: 4.18, p: "55%", color: "var(--acc-recov)" },
            { l: "Awake", v: 0.27, p: "5%",  color: "var(--neg)" },
          ].map(s => (
            <div key={s.l} style={{display: "grid", gridTemplateColumns: "60px 1fr 60px 40px", gap: 8, alignItems: "center", fontSize: 11, marginBottom: 4}}>
              <span>{s.l}</span>
              <Meter value={parseInt(s.p)} color={s.color} />
              <span className="num">{s.v.toFixed(1)}h</span>
              <span className="num dim">{s.p}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>

    <Card title="Sleep debt · 7 day rolling">
      <LineChart
        h={180}
        series={[
          { data: [-2.4, -1.8, -1.4, -0.8, -0.5, -0.1, 0.3], color: "var(--acc-recov)" },
          { data: [0, 0, 0, 0, 0, 0, 0], color: "var(--fg-dim)" },
        ]}
        xLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "today"]}
        range={[-3, 1.5]}
      />
      <div className="muted" style={{fontSize: 11, marginTop: 8}}>Debt cleared on day 7 · maintain current rhythm for a positive surplus next week.</div>
    </Card>

    <Card title="Bedtime & wake · 30 days" style={{gridColumn: "span 2"}}>
      <SleepRhythm />
    </Card>
  </div>
);

const SleepRhythm = () => {
  // pseudo data — bedtime hour fractional from 21 to 24.5, wake from 5.5 to 7.5
  const data = Array.from({length: 30}, (_, i) => ({
    bed: 22.5 + Math.sin(i * 0.5) * 0.8 + (Math.random() - 0.5) * 0.3,
    wake: 6.3 + Math.sin(i * 0.4) * 0.5 + (Math.random() - 0.5) * 0.2,
  }));
  return (
    <div style={{position: "relative", padding: "8px 0"}}>
      <div style={{position: "relative", height: 120}}>
        {/* Hour gridlines: 20, 22, 24, 02, 04, 06, 08 */}
        {[20, 22, 0, 2, 4, 6, 8].map((h, i) => (
          <div key={h} style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${(i / 6) * 100}%`,
            width: 1, background: "var(--border)"
          }}>
            <span className="num" style={{position: "absolute", bottom: -16, left: -8, fontSize: 9, color: "var(--fg-dim)"}}>{h.toString().padStart(2, "0")}:00</span>
          </div>
        ))}
        {/* Sleep bars */}
        {data.map((d, i) => {
          // map hours: 20 = 0%, 8 = 100% (12h window)
          const toPct = h => {
            let v = h < 20 ? h + 24 : h;
            return ((v - 20) / 12) * 100;
          };
          const start = toPct(d.bed);
          const end = toPct(d.wake);
          return (
            <div key={i} style={{
              position: "absolute",
              top: `${(i / 30) * 100}%`,
              left: `${start}%`,
              width: `${end - start}%`,
              height: "3px",
              background: "var(--acc-recov)",
              opacity: 0.7,
              borderRadius: 2
            }} />
          );
        })}
      </div>
      <div className="muted" style={{fontSize: 10, marginTop: 20, display: "flex", gap: 12}}>
        <span>Consistent rhythm — bedtime variance <span className="num" style={{color: "var(--fg)"}}>±28 min</span></span>
        <span>Avg duration <span className="num" style={{color: "var(--fg)"}}>7.3h</span></span>
      </div>
    </div>
  );
};

const RecoveryBiometric = () => (
  <div className="grid g-cols-2" style={{gap: 16}}>
    <Card title="HRV · 90 days" sub="rMSSD nightly · 7d MA">
      <LineChart
        h={200}
        range={[40, 80]}
        series={[
          { data: Array.from({length: 30}, (_, i) => 52 + Math.sin(i * 0.3) * 4 + Math.random() * 3), color: "var(--fg-dim)" },
          { data: Array.from({length: 30}, (_, i) => 53 + i * 0.35 + Math.sin(i * 0.4) * 2), color: "var(--acc-recov)" },
        ]}
      />
    </Card>
    <Card title="Resting HR · 90 days">
      <LineChart
        h={200}
        range={[45, 65]}
        series={[
          { data: Array.from({length: 30}, (_, i) => 56 - i * 0.13 + Math.sin(i * 0.4) * 1.4), color: "var(--acc-train)" },
        ]}
      />
    </Card>
    <Card title="Weight · 30 days" style={{gridColumn: "span 2"}}>
      <LineChart
        h={140}
        range={[78, 81]}
        xLabels={["Apr 16", "", "", "", "", "Apr 30", "", "", "", "", "May 16"]}
        series={[
          { data: Array.from({length: 30}, (_, i) => 80.5 - i * 0.04 + Math.sin(i * 0.5) * 0.3), color: "var(--acc-goals)" },
        ]}
      />
    </Card>
  </div>
);

const RecoveryProtocols = () => {
  const { open } = React.useContext(RecCtx);
  return (
  <div className="grid g-cols-3" style={{gap: 16}}>
    {[
      { id: "cold",       name: "Cold plunge", icon: "droplet", color: "var(--acc-recov)", count: 12, last: "today", target: 14, unit: "/wk" },
      { id: "sauna",      name: "Sauna",       icon: "flame",   color: "var(--neg)",       count: 8,  last: "Wed",  target: 3,  unit: "/wk" },
      { id: "mobility",   name: "Mobility",    icon: "recovery", color: "var(--acc-train)", count: 22, last: "today", target: 5,  unit: "/wk" },
      { id: "massage",    name: "Massage",     icon: "recovery", color: "var(--acc-buddy)", count: 4,  last: "May 8", target: 1,  unit: "/wk" },
      { id: "meditation", name: "Meditation",  icon: "brain",   color: "var(--acc-coach)", count: 18, last: "Tue",  target: 7,  unit: "/wk" },
      { id: "stretching", name: "Stretching",  icon: "recovery", color: "var(--acc-goals)", count: 30, last: "today", target: 5,  unit: "/wk" },
    ].map(p => (
      <Card key={p.name} title={p.name} sub={`Last: ${p.last}`}
        onClick={() => open("protoDetail", {name: p.name, id: p.id})}
        style={{cursor: "pointer"}}
        actions={<button className="icon-btn" onClick={e => {e.stopPropagation(); open("protocol", {protocol: p.id});}}><Icon name="plus" className="ic ic-sm"/></button>}>
        <div style={{display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6}}>
          <span className="num" style={{fontSize: 26}}>{p.count}</span>
          <span className="dim" style={{fontSize: 11}}>last 30d</span>
        </div>
        <div style={{display: "flex", gap: 3, marginTop: 4}}>
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 14, borderRadius: 2,
              background: i % Math.round(30 / p.count) === 0 ? p.color : "var(--surface-2)",
              opacity: 0.85
            }} />
          ))}
        </div>
        <div style={{display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "var(--fg-muted)"}}>
          <span>30d ago</span>
          <span>today</span>
        </div>
        <div className="divider" style={{margin: "10px 0"}} />
        <Row label="Cadence" value={`${(p.count / 30 * 7).toFixed(1)}${p.unit}`} />
        <Row label="Target" value={`${p.target}${p.unit}`} />
      </Card>
    ))}
  </div>
  );
};

const RecoveryBody = () => {
  const { open } = React.useContext(RecCtx);
  return (
  <Card title="Muscle recovery map" sub="recovery % by group — last 72h · click for detail">
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
      <BodyFigure />
      <div>
        <table className="tbl">
          <thead>
            <tr><th>Muscle</th><th style={{width: 140}}>Recovery</th><th style={{width: 60, textAlign: "right"}}>%</th></tr>
          </thead>
          <tbody>
            {[
              { m: "Chest",      v: 88, c: "var(--pos)" },
              { m: "Abs",        v: 70, c: "var(--warn)" },
              { m: "Quadriceps", v: 85, c: "var(--pos)" },
              { m: "Biceps",     v: 90, c: "var(--pos)" },
              { m: "Shoulders",  v: 70, c: "var(--warn)" },
              { m: "Adductors",  v: 70, c: "var(--warn)" },
              { m: "Upper back", v: 70, c: "var(--warn)" },
              { m: "Lower back", v: 70, c: "var(--warn)" },
              { m: "Hamstrings", v: 65, c: "var(--warn)" },
              { m: "Calves",     v: 92, c: "var(--pos)" },
              { m: "Glutes",     v: 78, c: "var(--warn)" },
              { m: "Triceps",    v: 82, c: "var(--pos)" },
            ].map((r, i) => (
              <tr key={i} className="clickable" style={{cursor: "pointer"}} onClick={() => open("muscle", {name: r.m})}>
                <td>{r.m}</td>
                <td><Meter value={r.v} color={r.c} tall /></td>
                <td className="num" style={{textAlign: "right", color: r.c}}>{r.v}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Card>
  );
};

// Body figure — abstract muscle map, no anatomical reproduction
const BodyFigure = () => {
  // Stylized: front and back silhouette as block "tiles" representing muscle groups
  const recoveryColor = v => v >= 85 ? "var(--pos)" : v >= 65 ? "var(--warn)" : "var(--neg)";
  const muscles = {
    front: [
      { id: "neck",  v: 92, x: 38, y: 8,  w: 14, h: 6  },
      { id: "chest_l", v: 88, x: 22, y: 18, w: 30, h: 10 },
      { id: "chest_r", v: 88, x: 49, y: 18, w: 30, h: 10 },
      { id: "delt_l",  v: 70, x: 13, y: 16, w: 9,  h: 12 },
      { id: "delt_r",  v: 70, x: 79, y: 16, w: 9,  h: 12 },
      { id: "biceps_l", v: 90, x: 11, y: 29, w: 8, h: 11 },
      { id: "biceps_r", v: 90, x: 82, y: 29, w: 8, h: 11 },
      { id: "abs",    v: 70, x: 36, y: 30, w: 28, h: 16 },
      { id: "obliq_l", v: 72, x: 25, y: 31, w: 10, h: 13 },
      { id: "obliq_r", v: 72, x: 65, y: 31, w: 10, h: 13 },
      { id: "fore_l", v: 78, x: 9,  y: 42, w: 7,  h: 10 },
      { id: "fore_r", v: 78, x: 84, y: 42, w: 7,  h: 10 },
      { id: "quad_l",  v: 85, x: 30, y: 50, w: 16, h: 22 },
      { id: "quad_r",  v: 85, x: 54, y: 50, w: 16, h: 22 },
      { id: "calf_l",  v: 92, x: 32, y: 76, w: 12, h: 16 },
      { id: "calf_r",  v: 92, x: 56, y: 76, w: 12, h: 16 },
    ],
    back: [
      { id: "neck",     v: 92, x: 38, y: 8,  w: 14, h: 6 },
      { id: "traps",    v: 75, x: 30, y: 14, w: 28, h: 10 },
      { id: "delt_lb",  v: 70, x: 13, y: 16, w: 9, h: 12 },
      { id: "delt_rb",  v: 70, x: 79, y: 16, w: 9, h: 12 },
      { id: "upper_l",  v: 70, x: 22, y: 22, w: 14, h: 14 },
      { id: "upper_r",  v: 70, x: 52, y: 22, w: 14, h: 14 },
      { id: "tri_l",    v: 82, x: 11, y: 26, w: 8, h: 12 },
      { id: "tri_r",    v: 82, x: 82, y: 26, w: 8, h: 12 },
      { id: "lower",    v: 70, x: 30, y: 38, w: 28, h: 10 },
      { id: "glute_l",  v: 78, x: 28, y: 48, w: 16, h: 12 },
      { id: "glute_r",  v: 78, x: 56, y: 48, w: 16, h: 12 },
      { id: "ham_l",    v: 65, x: 30, y: 60, w: 16, h: 14 },
      { id: "ham_r",    v: 65, x: 54, y: 60, w: 16, h: 14 },
      { id: "calf_l",   v: 92, x: 32, y: 76, w: 12, h: 16 },
      { id: "calf_r",   v: 92, x: 56, y: 76, w: 12, h: 16 },
    ],
  };
  const drawSide = (data, label) => (
    <div style={{flex: 1, textAlign: "center"}}>
      <div className="eyebrow" style={{marginBottom: 8}}>{label}</div>
      <svg viewBox="0 0 100 100" style={{width: "100%", maxWidth: 200}}>
        {/* silhouette */}
        <path d="M 50 5 q -8 0 -10 6 q -2 4 1 7 q -5 1 -10 4 q -5 2 -6 8 v 12 q 0 4 -3 8 l -8 14 q -1 3 0 5 l 3 8 q 1 3 2 0 l 4 -8 q 1 2 1 5 v 18 q 0 3 3 4 h 10 q 3 -1 4 -4 v -20 q 0 -3 1 -5 q 1 3 3 4 v 21 q 0 3 3 4 q 3 -1 3 -4 v -21 q 2 -1 3 -4 q 1 2 1 5 v 20 q 1 3 4 4 h 10 q 3 -1 3 -4 v -18 q 0 -3 1 -5 l 4 8 q 1 3 2 0 l 3 -8 q 1 -2 0 -5 l -8 -14 q -3 -4 -3 -8 v -12 q -1 -6 -6 -8 q -5 -3 -10 -4 q 3 -3 1 -7 q -2 -6 -10 -6 z"
          fill="var(--surface)" stroke="var(--border)" strokeWidth="0.5" />
        {data.map(m => (
          <rect key={m.id} x={m.x} y={m.y} width={m.w} height={m.h} rx={2}
            fill={recoveryColor(m.v)} opacity="0.6"
            stroke={recoveryColor(m.v)} strokeWidth="0.3"
          />
        ))}
      </svg>
    </div>
  );
  return (
    <div>
      <div style={{display: "flex", gap: 8}}>
        {drawSide(muscles.front, "Front")}
        {drawSide(muscles.back, "Back")}
      </div>
      <div style={{display: "flex", justifyContent: "center", gap: 14, marginTop: 12, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--pos)", opacity: 0.6, borderRadius: 2}} />Recovered ≥ 85%</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--warn)", opacity: 0.6, borderRadius: 2}} />Recovering 65–84%</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--neg)", opacity: 0.6, borderRadius: 2}} />Fatigued {"<65%"}</span>
      </div>
    </div>
  );
};

window.RecoveryModule = RecoveryModule;
