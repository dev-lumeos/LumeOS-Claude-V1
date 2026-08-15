// Goals & Body module
// Tabs: Goals · Timeline · Body Metrics · Measurements · Composition

const GoalsCtx = React.createContext(null);

// ── Fixtures ────────────────────────────────────────────────
const ACTIVE_GOALS = [
  {
    id: "g1",
    type: "Body composition",
    title: "78 kg @ 12% body fat",
    icon: "goals", color: "var(--acc-goals)",
    target: { weight: 78, bf: 12 },
    current: { weight: 79.4, bf: 13.8 },
    start: { weight: 81.2, bf: 15.4 },
    started: "2026-03-15",
    deadline: "2026-08-01",
    linkedModules: ["nutrition", "training", "recovery"],
    progress: 0.61,
    pace: "on-track",
    note: "Lean recomposition — preserve strength during fat loss.",
    history: [
      { d: "Mar 15", weight: 81.2, bf: 15.4 },
      { d: "Mar 29", weight: 80.8, bf: 15.0 },
      { d: "Apr 12", weight: 80.5, bf: 14.6 },
      { d: "Apr 26", weight: 80.0, bf: 14.2 },
      { d: "May 10", weight: 79.6, bf: 13.9 },
      { d: "May 16", weight: 79.4, bf: 13.8 },
    ],
  },
  {
    id: "g2",
    type: "Strength",
    title: "Bench Press 1RM · 130 kg",
    icon: "training", color: "var(--acc-train)",
    target: { weight: 130 },
    current: { weight: 122.5 },
    start: { weight: 110 },
    started: "2026-02-04",
    deadline: "2026-07-15",
    linkedModules: ["training", "recovery"],
    progress: 0.625,
    pace: "ahead",
    note: "Periodized block · linked to PPL Block 3-5.",
    history: [
      { d: "Feb 4",  weight: 110.0 },
      { d: "Feb 25", weight: 112.5 },
      { d: "Mar 18", weight: 115.0 },
      { d: "Apr 8",  weight: 117.5 },
      { d: "Apr 29", weight: 120.0 },
      { d: "May 13", weight: 122.5 },
    ],
  },
  {
    id: "g3",
    type: "Performance",
    title: "10 km run · sub 45:00",
    icon: "training", color: "var(--acc-recov)",
    target: { time: 45 * 60 },
    current: { time: 47 * 60 + 20 },
    start: { time: 52 * 60 + 40 },
    started: "2026-01-12",
    deadline: "2026-09-15",
    linkedModules: ["training", "recovery"],
    progress: 0.71,
    pace: "on-track",
    note: "Z2 base + 1× weekly tempo. Sub-50 hit Apr 12, sub-48 hit May 3.",
    history: [
      { d: "Jan 12", time: 52 * 60 + 40 },
      { d: "Feb 14", time: 50 * 60 + 15 },
      { d: "Mar 10", time: 48 * 60 + 50 },
      { d: "Apr 12", time: 49 * 60 + 5 },
      { d: "May 3",  time: 47 * 60 + 40 },
      { d: "May 14", time: 47 * 60 + 20 },
    ],
  },
  {
    id: "g4",
    type: "Habit",
    title: "Meditate 5×/week for 12 weeks",
    icon: "brain", color: "var(--acc-buddy)",
    target: { count: 60 },
    current: { count: 28 },
    start: { count: 0 },
    started: "2026-03-30",
    deadline: "2026-06-22",
    linkedModules: ["recovery"],
    progress: 0.466,
    pace: "behind",
    note: "Currently 14d streak. Slipped 2 weeks in April.",
    history: [],
  },
];

const COMPLETED_GOALS = [
  { id: "gc1", title: "Sub-50 min 10k", deadline: "2026-04-30", completedOn: "2026-04-12", icon: "training", color: "var(--acc-recov)" },
  { id: "gc2", title: "Deadlift 1RM · 180 kg", deadline: "2026-03-15", completedOn: "2026-03-04", icon: "training", color: "var(--acc-train)" },
  { id: "gc3", title: "TRT initiation + 6mo stabilization", deadline: "2025-03-12", completedOn: "2025-03-08", icon: "medical", color: "var(--acc-medic)" },
];

const BODY_METRICS = {
  weight: {
    current: 79.4, unit: "kg",
    history: Array.from({length: 180}, (_, i) => {
      const t = (i - 30) / 150;
      return 81.5 - t * 2.3 + Math.sin(i * 0.4) * 0.4 + (Math.random() - 0.5) * 0.4;
    }),
  },
  bodyfat: {
    current: 13.8, unit: "%",
    history: Array.from({length: 30}, (_, i) => {
      return 15.4 - (i / 30) * 1.7 + (Math.random() - 0.5) * 0.3;
    }),
  },
  leanMass: {
    current: 68.4, unit: "kg",
    history: Array.from({length: 30}, (_, i) => {
      return 67.9 + (i / 30) * 0.5 + Math.sin(i * 0.5) * 0.2;
    }),
  },
};

const MEASUREMENTS = [
  { id: "neck",      label: "Neck",       current: 41.0, last: 41.2,  history: [42.0, 41.8, 41.6, 41.4, 41.2, 41.0] },
  { id: "chest",     label: "Chest",      current: 108.0, last: 109.0, history: [109.5, 109.4, 109.2, 109.0, 109.0, 108.0] },
  { id: "shoulder",  label: "Shoulders",  current: 124.5, last: 124.0, history: [122.0, 122.5, 123.0, 123.5, 124.0, 124.5] },
  { id: "waist",     label: "Waist (navel)", current: 82.0, last: 83.5, history: [86.0, 85.0, 84.0, 83.5, 83.0, 82.0] },
  { id: "hip",       label: "Hip",        current: 96.0, last: 96.5,   history: [98.0, 97.5, 97.0, 96.5, 96.5, 96.0] },
  { id: "armR",      label: "Arm · right (flexed)", current: 39.5, last: 39.3, history: [38.5, 38.8, 39.0, 39.2, 39.3, 39.5] },
  { id: "armL",      label: "Arm · left (flexed)",  current: 39.0, last: 38.8, history: [38.0, 38.3, 38.5, 38.6, 38.8, 39.0] },
  { id: "forearm",   label: "Forearm",    current: 32.0, last: 32.0,   history: [31.5, 31.6, 31.8, 32.0, 32.0, 32.0] },
  { id: "thighR",    label: "Thigh · right", current: 60.0, last: 60.5, history: [61.0, 60.8, 60.5, 60.5, 60.5, 60.0] },
  { id: "thighL",    label: "Thigh · left",  current: 59.5, last: 60.0, history: [60.5, 60.3, 60.0, 60.0, 60.0, 59.5] },
  { id: "calfR",     label: "Calf · right", current: 39.5, last: 39.3, history: [39.0, 39.1, 39.2, 39.3, 39.3, 39.5] },
  { id: "calfL",     label: "Calf · left",  current: 39.0, last: 38.8, history: [38.5, 38.7, 38.8, 38.8, 38.8, 39.0] },
];

const PHOTO_PROGRESSION = [
  { date: "2026-03-15", weight: 81.2, bf: 15.4 },
  { date: "2026-04-01", weight: 80.6, bf: 14.8 },
  { date: "2026-04-15", weight: 80.0, bf: 14.4 },
  { date: "2026-05-01", weight: 79.7, bf: 14.0 },
  { date: "2026-05-15", weight: 79.4, bf: 13.8 },
];

// ── Module shell ────────────────────────────────────────────
const GoalsModule = () => {
  const [tab, setTab] = useState("goals");
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({type, payload});
  const close = () => setModal(null);
  const ctx = { open, close };

  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Goals &amp; Body</span>
            <Pill variant="acc">{ACTIVE_GOALS.length} active goals</Pill>
            <Pill><span className="dot" style={{background: "var(--pos)"}}/>3 closed in 90d</Pill>
          </div>
          <div className="module-sub">Body composition · strength · performance · habits — cross-module linked</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => open("logWeight")}><Icon name="plus" className="ic ic-sm"/> Log weight</button>
          <button className="btn" onClick={() => open("logMeasure")}><Icon name="edit" className="ic ic-sm"/> Measurements</button>
          <button className="btn btn-primary" onClick={() => open("newGoal")}><Icon name="plus" className="ic ic-sm"/> New goal</button>
        </div>
      </div>

      <Tabs items={[
        { id: "goals",    label: "Goals",      count: ACTIVE_GOALS.length },
        { id: "phase",    label: "Phase engine" },
        { id: "tdee",     label: "Adaptive TDEE" },
        { id: "cross",    label: "Cross-module" },
        { id: "timeline", label: "Timeline" },
        { id: "metrics",  label: "Body metrics" },
        { id: "measure",  label: "Measurements" },
        { id: "comp",     label: "Composition" },
        { id: "physique", label: "Physique ratios" },
        { id: "poses",    label: "Pose sessions" },
      ]} active={tab} onChange={setTab}/>

      <GoalsCtx.Provider value={ctx}>
      {tab === "goals"    && <GoalsTab/>}
      {tab === "timeline" && <TimelineTab/>}
      {tab === "metrics"  && <MetricsTab/>}
      {tab === "measure"  && <MeasureTab/>}
      {tab === "comp"     && <CompTab/>}
      {tab === "phase"    && window.GoalsPhaseView && <window.GoalsPhaseView/>}
      {tab === "tdee"     && window.GoalsTDEEView && <window.GoalsTDEEView/>}
      {tab === "cross"    && window.GoalsCrossModuleView && <window.GoalsCrossModuleView/>}
      {tab === "physique" && window.GoalsPhysiqueView && <window.GoalsPhysiqueView/>}
      {tab === "poses"    && window.GoalsPosesView && <window.GoalsPosesView/>}
      </GoalsCtx.Provider>

      {modal?.type === "newGoal"    && <NewGoalModal onClose={close}/>}
      {modal?.type === "goalDet"    && <GoalDetailModal goal={modal.payload} onClose={close}/>}
      {modal?.type === "logWeight"  && <LogWeightModal onClose={close}/>}
      {modal?.type === "logMeasure" && <LogMeasureModal onClose={close}/>}
      {modal?.type === "logPhoto"   && <LogPhotoModal onClose={close}/>}
      {modal?.type === "measureDet" && <MeasureDetailModal m={modal.payload} onClose={close}/>}
    </>
  );
};

// ── GOALS TAB ───────────────────────────────────────────────
const GoalsTab = () => {
  const { open } = React.useContext(GoalsCtx);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 14}}>
        {ACTIVE_GOALS.map(g => <GoalCard key={g.id} g={g} onClick={() => open("goalDet", g)} />)}
      </div>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="This week" sub="movement toward all goals">
          <div className="col-gap" style={{gap: 8}}>
            <Row label="Bench Press" value="+0 kg (next session Mon)" />
            <Row label="Weight" value="−0.2 kg" />
            <Row label="Body fat" value="−0.1 %" />
            <Row label="10k pace" value="−5 s/km avg (3 runs)" />
            <Row label="Meditation" value="3 of 5 sessions" />
          </div>
        </Card>

        <Card title="Recently closed" sub="3 in last 90 days">
          <div className="col-gap" style={{gap: 6}}>
            {COMPLETED_GOALS.map(g => (
              <div key={g.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5}}>
                <Icon name={g.icon} className="ic" style={{color: g.color, flexShrink: 0}}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 12, fontWeight: 500}}>{g.title}</div>
                  <div className="dim mono" style={{fontSize: 10}}>completed {g.completedOn} · deadline was {g.deadline}</div>
                </div>
                <Pill variant="pos"><Icon name="check" className="ic ic-sm"/>done</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cross-module health" sub="how goals are doing in linked modules">
          <Row label="Nutrition adherence" value="94% · 30d" />
          <Row label="Training compliance" value="22 / 24 sessions" />
          <Row label="Sleep quality avg" value="84 / 100" />
          <Row label="Recovery avg" value="78 / 100" />
          <div className="divider"/>
          <div className="dim" style={{fontSize: 11, lineHeight: 1.45}}>
            Buddy: All four inputs trend supportive. Body-comp goal pace is sustainable if compliance holds.
          </div>
        </Card>
      </div>
    </div>
  );
};

const GoalCard = ({ g, onClick }) => {
  const paceColor = g.pace === "ahead" ? "var(--pos)" : g.pace === "on-track" ? "var(--acc-recov)" : "var(--warn)";
  return (
    <Card onClick={onClick} style={{cursor: "pointer"}}>
      <div style={{display: "flex", gap: 14, alignItems: "flex-start"}}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `color-mix(in oklch, ${g.color} 16%, transparent)`,
          border: `1px solid color-mix(in oklch, ${g.color} 32%, var(--border))`,
          color: g.color, display: "grid", placeItems: "center", flexShrink: 0
        }}><Icon name={g.icon} className="ic ic-lg"/></div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
            <span style={{fontSize: 11, color: "var(--fg-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase"}}>{g.type}</span>
            <Pill style={{borderColor: `color-mix(in oklch, ${paceColor} 35%, var(--border))`, color: paceColor, background: `color-mix(in oklch, ${paceColor} 8%, transparent)`}}>{g.pace}</Pill>
            <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>deadline {g.deadline} · {daysToDeadline(g.deadline)}</span>
          </div>
          <div style={{fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8}}>{g.title}</div>
          <div style={{display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8, fontSize: 12}}>
            {g.target.weight != null && (
              <>
                <span><span className="dim">current </span><span className="num" style={{color: "var(--fg)", fontWeight: 500}}>{g.current.weight} kg{g.current.bf != null ? ` · ${g.current.bf}%` : ""}</span></span>
                <span className="dim">→</span>
                <span><span className="dim">target </span><span className="num" style={{color: g.color, fontWeight: 500}}>{g.target.weight} kg{g.target.bf != null ? ` · ${g.target.bf}%` : ""}</span></span>
              </>
            )}
            {g.target.time != null && (
              <>
                <span><span className="dim">current </span><span className="num" style={{color: "var(--fg)", fontWeight: 500}}>{fmtTime(g.current.time)}</span></span>
                <span className="dim">→</span>
                <span><span className="dim">target </span><span className="num" style={{color: g.color, fontWeight: 500}}>{fmtTime(g.target.time)}</span></span>
              </>
            )}
            {g.target.count != null && (
              <>
                <span><span className="dim">current </span><span className="num" style={{color: "var(--fg)", fontWeight: 500}}>{g.current.count}</span></span>
                <span className="dim">→</span>
                <span><span className="dim">target </span><span className="num" style={{color: g.color, fontWeight: 500}}>{g.target.count} sessions</span></span>
              </>
            )}
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
            <div style={{flex: 1}}>
              <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden", position: "relative"}}>
                <div style={{position: "absolute", top: 0, left: 0, bottom: 0, width: `${g.progress * 100}%`, background: g.color, borderRadius: 999}}/>
              </div>
            </div>
            <span className="num" style={{fontSize: 13, fontWeight: 500, color: g.color, width: 44, textAlign: "right"}}>{(g.progress * 100).toFixed(0)}%</span>
          </div>
          <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
            {g.linkedModules.map(m => <Pill key={m}><Icon name={m} className="ic ic-sm"/>{m}</Pill>)}
          </div>
        </div>
      </div>
    </Card>
  );
};

function daysToDeadline(deadline) {
  const target = new Date(deadline + "T12:00:00");
  const now = new Date("2026-05-16T12:00:00");
  const days = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return `overdue ${-days}d`;
  if (days < 30) return `${days}d left`;
  if (days < 365) return `${Math.floor(days / 7)}w left`;
  return `${Math.floor(days / 30)}mo left`;
}

function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── TIMELINE TAB ─────────────────────────────────────────────
const TimelineTab = () => {
  // 12-month gantt
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const all = [...ACTIVE_GOALS.map(g => ({...g, status: "active"})), ...COMPLETED_GOALS.map(g => ({...g, status: "done"}))];
  return (
    <Card title="Goal timeline · 2026" sub={`${ACTIVE_GOALS.length} active · ${COMPLETED_GOALS.length} closed`}>
      <div style={{display: "grid", gridTemplateColumns: "180px 1fr", gap: 8, alignItems: "center", marginBottom: 8}}>
        <div></div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, fontSize: 9.5, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
          {months.map(m => <span key={m} style={{textAlign: "left"}}>{m}</span>)}
        </div>
      </div>
      <div className="col-gap" style={{gap: 6}}>
        {all.map(g => <GanttRow key={g.id} g={g}/>)}
      </div>
      <div className="divider"/>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div className="dim" style={{fontSize: 11, fontFamily: "var(--font-mono)"}}>Today · May 16, 2026</div>
        <div style={{display: "flex", gap: 12, fontSize: 10, color: "var(--fg-muted)"}}>
          <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--acc-goals)", borderRadius: 2, opacity: 0.5}}/>elapsed</span>
          <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--acc-goals)", borderRadius: 2}}/>remaining</span>
          <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--pos)", borderRadius: 2}}/>completed</span>
        </div>
      </div>
    </Card>
  );
};

const GanttRow = ({ g }) => {
  // Convert dates to month positions (0-11)
  const monthFraction = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.getMonth() + d.getDate() / 30;
  };
  const start = monthFraction(g.started || g.completedOn || "2026-01-01");
  const end = monthFraction(g.deadline || g.completedOn || "2026-12-31");
  const today = monthFraction("2026-05-16");
  const left = (start / 12) * 100;
  const right = (end / 12) * 100;
  const width = right - left;
  const todayInRange = today > start && today < end;
  return (
    <div style={{display: "grid", gridTemplateColumns: "180px 1fr", gap: 8, alignItems: "center"}}>
      <div style={{display: "flex", alignItems: "center", gap: 6, minWidth: 0}}>
        <Icon name={g.icon} className="ic" style={{color: g.color, flexShrink: 0}}/>
        <span style={{fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{g.title}</span>
      </div>
      <div style={{position: "relative", height: 22, background: "var(--surface-2)", borderRadius: 4}}>
        {/* gridlines */}
        {Array.from({length: 12}).map((_, i) => (
          <div key={i} style={{position: "absolute", left: `${(i / 12) * 100}%`, top: 0, bottom: 0, width: 1, background: "var(--border)"}}/>
        ))}
        {/* bar */}
        {g.status === "done" ? (
          <div style={{position: "absolute", top: 3, left: `${left}%`, height: 16, width: `${width}%`, background: "var(--pos)", borderRadius: 3, opacity: 0.7}}>
            <div style={{position: "absolute", right: -2, top: -1, bottom: -1, width: 4, background: "var(--pos)"}}/>
          </div>
        ) : (
          <>
            {todayInRange && (
              <>
                <div style={{position: "absolute", top: 3, left: `${left}%`, height: 16, width: `${((today - start) / (end - start)) * width}%`, background: g.color, borderRadius: "3px 0 0 3px", opacity: 0.45}}/>
                <div style={{position: "absolute", top: 3, left: `${left + ((today - start) / (end - start)) * width}%`, height: 16, width: `${((end - today) / (end - start)) * width}%`, background: g.color, borderRadius: "0 3px 3px 0"}}/>
              </>
            )}
            {!todayInRange && (
              <div style={{position: "absolute", top: 3, left: `${left}%`, height: 16, width: `${width}%`, background: g.color, borderRadius: 3}}/>
            )}
          </>
        )}
        {/* today marker */}
        <div style={{position: "absolute", left: `${(today / 12) * 100}%`, top: -3, bottom: -3, width: 1, background: "var(--fg)"}}/>
      </div>
    </div>
  );
};

// ── METRICS TAB ──────────────────────────────────────────────
const MetricsTab = () => (
  <div>
    <div className="grid g-cols-3" style={{gap: 12, marginBottom: 14}}>
      <MetricKPI label="Weight"      value={BODY_METRICS.weight.current}   unit="kg" delta="-1.1 kg / 30d" deltaVariant="pos" color="var(--acc-goals)" history={BODY_METRICS.weight.history.slice(-30)}/>
      <MetricKPI label="Body fat"    value={BODY_METRICS.bodyfat.current}  unit="%"  delta="-1.6 % / 60d"   deltaVariant="pos" color="var(--acc-suppl)" history={BODY_METRICS.bodyfat.history}/>
      <MetricKPI label="Lean mass"   value={BODY_METRICS.leanMass.current} unit="kg" delta="+0.5 kg / 30d"  deltaVariant="pos" color="var(--acc-train)" history={BODY_METRICS.leanMass.history}/>
    </div>
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
      <Card title="Weight · 6 months" sub="daily entries · 7d moving avg overlaid">
        <LineChart h={220} range={[78, 82]}
          xLabels={["Nov","Dec","Jan","Feb","Mar","Apr","May"]}
          series={[
            { data: BODY_METRICS.weight.history, color: "color-mix(in oklch, var(--acc-goals) 40%, transparent)" },
            { data: BODY_METRICS.weight.history.map((_, i, arr) => {
                const w = arr.slice(Math.max(0, i - 6), i + 1);
                return w.reduce((s, x) => s + x, 0) / w.length;
              }), color: "var(--acc-goals)" },
          ]}/>
        <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span className="row-gap"><span className="dot" style={{background: "color-mix(in oklch, var(--acc-goals) 40%, transparent)"}}/>daily</span>
          <span className="row-gap"><span className="dot" style={{background: "var(--acc-goals)"}}/>7d MA</span>
          <span style={{marginLeft: "auto"}}>180 entries · 0 missed</span>
        </div>
      </Card>
      <Card title="Body fat trend" sub="bi-weekly · DXA + smart scale">
        <LineChart h={220} range={[12, 16]}
          xLabels={["Mar 15", "", "", "Apr", "", "", "May 16"]}
          series={[
            { data: BODY_METRICS.bodyfat.history, color: "var(--acc-suppl)" },
            { data: Array(BODY_METRICS.bodyfat.history.length).fill(12), color: "var(--fg-dim)" },
          ]}/>
        <div style={{display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span>Current <span className="num" style={{color: "var(--fg)"}}>13.8 %</span></span>
          <span>Target <span className="num" style={{color: "var(--acc-suppl)"}}>12.0 %</span></span>
          <span className="dim">−1.6 over 60d · on pace</span>
        </div>
      </Card>
      <Card title="Lean mass · 30 days" sub="estimated from weight × (1 − BF%)" style={{gridColumn: "span 2"}}>
        <LineChart h={160} range={[67, 69]}
          xLabels={["Apr 16","","","","","May 1","","","","","May 16"]}
          series={[{ data: BODY_METRICS.leanMass.history, color: "var(--acc-train)" }]}/>
        <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span>Current <span className="num" style={{color: "var(--fg)"}}>68.4 kg</span></span>
          <span>Δ 30d <span className="num" style={{color: "var(--pos)"}}>+0.5 kg</span></span>
          <span className="dim">Recomposition working — gaining muscle while losing fat.</span>
        </div>
      </Card>
    </div>
  </div>
);

const MetricKPI = ({ label, value, unit, delta, deltaVariant, color, history }) => (
  <Card className="card-tight" style={{padding: 14, position: "relative", overflow: "hidden"}}>
    <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 1, background: color, opacity: 0.6}}/>
    <div className="eyebrow" style={{marginBottom: 6}}>{label}</div>
    <div className="num" style={{fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 4}}>
      {value}<span style={{fontSize: 11, color: "var(--fg-dim)", fontWeight: 400, marginLeft: 3}}>{unit}</span>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 8}}>
      <Icon name={deltaVariant === "pos" ? "trend_down" : "trend_up"} className="ic ic-sm" style={{color: deltaVariant === "pos" ? "var(--pos)" : "var(--neg)"}}/>
      <span className="num" style={{fontSize: 11, color: deltaVariant === "pos" ? "var(--pos)" : "var(--neg)"}}>{delta}</span>
    </div>
    <Sparkline data={history} color={color} h={32}/>
  </Card>
);

// ── MEASUREMENTS TAB ─────────────────────────────────────────
const MeasureTab = () => {
  const { open } = React.useContext(GoalsCtx);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
      <Card title="Circumferences" sub="last update May 14 · cm" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("logMeasure")}>Update <Icon name="edit" className="ic ic-sm"/></button>}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Site</th>
              <th style={{width: 80, textAlign: "right"}}>Current</th>
              <th style={{width: 70, textAlign: "right"}}>Δ 30d</th>
              <th style={{width: 160}}>Trend · 6 entries</th>
              <th style={{width: 30}}></th>
            </tr>
          </thead>
          <tbody>
            {MEASUREMENTS.map(m => {
              const delta = (m.current - m.history[0]).toFixed(1);
              const positive = parseFloat(delta) > 0;
              const isWaist = ["waist", "hip"].includes(m.id);
              const goodDir = isWaist ? !positive : positive;
              return (
                <tr key={m.id} className="clickable" style={{cursor: "pointer"}} onClick={() => open("measureDet", m)}>
                  <td>{m.label}</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 500}}>{m.current.toFixed(1)}</td>
                  <td className="num" style={{textAlign: "right", color: parseFloat(delta) === 0 ? "var(--fg-dim)" : goodDir ? "var(--pos)" : "var(--warn)"}}>
                    {parseFloat(delta) > 0 ? "+" : ""}{delta}
                  </td>
                  <td style={{padding: "4px 8px 4px 0"}}><Sparkline data={m.history} color={goodDir ? "var(--pos)" : parseFloat(delta) === 0 ? "var(--fg-dim)" : "var(--warn)"} h={22}/></td>
                  <td><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="col-gap" style={{gap: 14}}>
        {window.PhotoUploadPanel ? <window.PhotoUploadPanel/> : null}
        <Card title="Photo progression" sub={`${PHOTO_PROGRESSION.length} sessions · front · side · back`} actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("logPhoto")}><Icon name="camera" className="ic ic-sm"/>New session</button>}>
          <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4}}>
            {PHOTO_PROGRESSION.map((p, i) => (
              <div key={i} style={{display: "flex", flexDirection: "column", gap: 3}}>
                <div className="placeholder-img" style={{aspectRatio: "9/16", border: "1px solid var(--border)", borderRadius: 4}}>
                  <div style={{fontSize: 9, padding: 4, textAlign: "center", lineHeight: 1.4, color: "var(--fg-dim)"}}>front<br/>side<br/>back</div>
                </div>
                <div style={{textAlign: "center"}}>
                  <div className="num" style={{fontSize: 10, color: "var(--fg-dim)"}}>{p.date.slice(5)}</div>
                  <div className="num" style={{fontSize: 11, color: "var(--fg)"}}>{p.weight}</div>
                  <div className="num" style={{fontSize: 9.5, color: "var(--fg-dim)"}}>{p.bf}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Symmetry · left vs right" sub="watch list">
          <Row label="Arms · R / L" value={`39.5 / 39.0 cm · ${(0.5).toFixed(1)} cm`} />
          <Row label="Thighs · R / L" value={`60.0 / 59.5 cm · ${(0.5).toFixed(1)} cm`} />
          <Row label="Calves · R / L" value={`39.5 / 39.0 cm · ${(0.5).toFixed(1)} cm`} />
          <div className="divider"/>
          <div className="dim" style={{fontSize: 11, lineHeight: 1.45}}>
            All within 1 cm. Right-side dominance is consistent and small — within normal range for a right-handed athlete.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── COMPOSITION TAB ──────────────────────────────────────────
const CompTab = () => {
  // Tom: 36yo male, 184cm, 79.4kg, 13.8% BF
  const age = 36, height = 184, weight = 79.4, bf = 13.8, sex = "male";
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const leanMass = weight * (1 - bf / 100);
  const ffmi = leanMass / (heightM * heightM);
  const ffmiAdj = ffmi + 6.1 * (1.8 - heightM);
  // Mifflin-St Jeor
  const bmr = sex === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const activityFactor = 1.725; // very active (5x training)
  const tdee = bmr * activityFactor;

  return (
    <div className="grid" style={{gridTemplateColumns: "1fr 1fr", gap: 16}}>
      <Card title="Body composition calculators" sub="inputs from profile + most recent metrics">
        <div className="col-gap" style={{gap: 10}}>
          <CalcRow label="BMI" value={bmi.toFixed(1)} unit="" range="Normal 18.5–24.9" status={bmi >= 18.5 && bmi <= 24.9 ? "in" : "watch"} note="Height-adjusted weight indicator. Not useful for trained athletes — use FFMI."/>
          <CalcRow label="FFMI" value={ffmi.toFixed(1)} unit="kg/m²" range="18–22 natural · 22–25 advanced" status={ffmi < 25 ? "in" : "watch"} note={`Adjusted: ${ffmiAdj.toFixed(1)} · puts you at the high end of intermediate trained.`}/>
          <CalcRow label="BMR" value={bmr.toFixed(0)} unit="kcal/day" range="Mifflin-St Jeor" status="info" note="Basal metabolic rate. Energy used at complete rest."/>
          <CalcRow label="TDEE" value={tdee.toFixed(0)} unit="kcal/day" range="× 1.725 (very active)" status="info" note="Total daily expenditure. Cut target ≈ 2600 kcal · maintenance 3100."/>
          <CalcRow label="Lean mass" value={leanMass.toFixed(1)} unit="kg" range="" status="info" note="Weight × (1 − BF%). Tracks muscle mass changes."/>
          <CalcRow label="Fat mass" value={(weight - leanMass).toFixed(1)} unit="kg" range="" status="info" note=""/>
        </div>
      </Card>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Body fat estimate · visual" sub="for orientation only · DXA is the ground truth">
          <BodyFatScale current={bf}/>
        </Card>
        <Card title="Energy balance · today" sub={`TDEE ${tdee.toFixed(0)} kcal`}>
          <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 10}}>
            <Ring value={1847} max={tdee} color="var(--acc-nutri)" label="kcal in" size={108} stroke={7}/>
            <div style={{flex: 1}}>
              <Row label="Intake (so far)" value="1,847 kcal"/>
              <Row label="Estimated burn" value={`${tdee.toFixed(0)} kcal`}/>
              <Row label="Balance" value={`-${(tdee - 1847).toFixed(0)} kcal`}/>
              <Row label="Goal context" value="cut · target -500 kcal/day"/>
            </div>
          </div>
          <div className="dim" style={{fontSize: 11, lineHeight: 1.45}}>
            On track for ~0.5 kg/wk fat loss while preserving lean mass — assuming the remaining intake stays at 850 kcal (dinner + evening snack).
          </div>
        </Card>
        <Card title="Profile · inputs">
          <Row label="Sex" value={sex}/>
          <Row label="Age" value={`${age} years`}/>
          <Row label="Height" value={`${height} cm`}/>
          <Row label="Weight (latest)" value={`${weight} kg`}/>
          <Row label="Body fat (latest)" value={`${bf} %`}/>
          <Row label="Activity factor" value={`${activityFactor} · very active`}/>
        </Card>
      </div>
    </div>
  );
};

const CalcRow = ({ label, value, unit, range, status, note }) => {
  const color = status === "in" ? "var(--pos)" : status === "watch" ? "var(--warn)" : status === "out" ? "var(--neg)" : "var(--fg)";
  return (
    <div style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
      <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 3}}>
        <span className="eyebrow">{label}</span>
        <div>
          <span className="num" style={{fontSize: 18, fontWeight: 500, color}}>{value}</span>
          <span className="dim mono" style={{fontSize: 10, marginLeft: 4}}>{unit}</span>
        </div>
      </div>
      {range && <div className="dim mono" style={{fontSize: 10, marginBottom: 4}}>{range}</div>}
      {note && <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{note}</div>}
    </div>
  );
};

const BodyFatScale = ({ current }) => {
  const stops = [
    { label: "Essential", from: 2, to: 5, color: "var(--neg)" },
    { label: "Athletic",  from: 5, to: 13, color: "var(--pos)" },
    { label: "Fitness",   from: 13, to: 17, color: "var(--acc-recov)" },
    { label: "Average",   from: 17, to: 25, color: "var(--warn)" },
    { label: "High",      from: 25, to: 35, color: "var(--neg)" },
  ];
  const min = 2, max = 35;
  const pos = ((current - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{position: "relative", height: 28, borderRadius: 4, overflow: "hidden", display: "flex", border: "1px solid var(--border)"}}>
        {stops.map(s => (
          <div key={s.label} style={{
            flex: s.to - s.from,
            background: s.color, opacity: 0.55,
            display: "grid", placeItems: "center",
            fontSize: 9.5, color: "var(--bg)", fontWeight: 600, letterSpacing: "0.02em",
            fontFamily: "var(--font-mono)"
          }}>{s.label.toUpperCase()}</div>
        ))}
        <div style={{position: "absolute", left: `${pos}%`, top: -4, bottom: -4, width: 2, background: "var(--fg)", boxShadow: "0 0 0 2px var(--bg)"}}/>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9.5, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
        <span>2%</span><span>5%</span><span>13%</span><span>17%</span><span>25%</span><span>35%</span>
      </div>
      <div style={{display: "flex", alignItems: "baseline", gap: 8, marginTop: 10}}>
        <span className="num" style={{fontSize: 22, fontWeight: 500}}>{current}<span className="dim" style={{fontSize: 11, marginLeft: 2}}>%</span></span>
        <span className="dim" style={{fontSize: 11}}>· Fitness range · 0.8% above Athletic boundary</span>
      </div>
    </div>
  );
};

// ── MODALS ──────────────────────────────────────────────────
const GModal = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 580 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && (
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: `color-mix(in oklch, ${accent || "var(--acc-goals)"} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent || "var(--acc-goals)"} 35%, transparent)`,
            color: accent || "var(--acc-goals)", display: "grid", placeItems: "center"
          }}><Icon name={eyebrow} className="ic"/></div>
        )}
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize: 11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

const GField = ({ label, sub, children }) => (
  <div style={{marginBottom: 14}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5}}>
      <label className="eyebrow">{label}</label>
      {sub && <span className="dim" style={{fontSize: 10}}>{sub}</span>}
    </div>
    {children}
  </div>
);
const GInput = props => <input {...props} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", ...(props.style || {})}}/>;

const NewGoalModal = ({ onClose }) => {
  const [type, setType] = useState("body_comp");
  const types = [
    { id: "body_comp",  label: "Body composition", icon: "goals" },
    { id: "weight",     label: "Weight",           icon: "trend_up" },
    { id: "strength",   label: "Strength PR",      icon: "training" },
    { id: "performance",label: "Performance",      icon: "training" },
    { id: "habit",      label: "Habit",            icon: "brain" },
    { id: "custom",     label: "Custom",           icon: "edit" },
  ];
  return (
    <GModal title="New goal" subtitle="Choose type · set target · link modules" eyebrow="plus" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Create goal</button></>}>
      <GField label="Goal type">
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6}}>
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              style={{
                padding: "10px 8px", borderRadius: 6,
                background: type === t.id ? "color-mix(in oklch, var(--acc-goals) 12%, var(--surface))" : "var(--surface)",
                border: `1px solid ${type === t.id ? "color-mix(in oklch, var(--acc-goals) 35%, var(--border))" : "var(--border)"}`,
                color: type === t.id ? "var(--acc-goals)" : "var(--fg-muted)",
                cursor: "pointer", fontSize: 11.5,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6
              }}>
              <Icon name={t.icon} className="ic"/>
              {t.label}
            </button>
          ))}
        </div>
      </GField>
      <GField label="Title"><GInput placeholder={type === "strength" ? "e.g. Bench Press 1RM · 130 kg" : type === "performance" ? "e.g. 10k under 45:00" : "e.g. Drop to 12% BF"}/></GField>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
        <GField label="Current value"><GInput placeholder={type === "strength" ? "122.5" : "79.4"} suffix="kg"/></GField>
        <GField label="Target value"><GInput placeholder={type === "strength" ? "130" : "78"} suffix="kg"/></GField>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
        <GField label="Start date"><GInput type="date" defaultValue="2026-05-16"/></GField>
        <GField label="Deadline"><GInput type="date" defaultValue="2026-08-01"/></GField>
      </div>
      <GField label="Linked modules · auto-pull data">
        <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
          {["nutrition","training","recovery","supplements","medical"].map(m => (
            <button key={m} className="pill" style={{cursor: "pointer", padding: "4px 10px", fontSize: 11}}>{m}</button>
          ))}
        </div>
      </GField>
      <GField label="Notes (optional)"><GInput placeholder="Context, sub-goals, reminders…"/></GField>
    </GModal>
  );
};

const GoalDetailModal = ({ goal: g, onClose }) => {
  const paceColor = g.pace === "ahead" ? "var(--pos)" : g.pace === "on-track" ? "var(--acc-recov)" : "var(--warn)";
  return (
    <GModal title={g.title} subtitle={`${g.type} · started ${g.started}`} eyebrow={g.icon} accent={g.color} onClose={onClose} width={680}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Edit</button><button className="btn btn-primary">Mark complete</button></>}>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16}}>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Progress</div><div className="num" style={{fontSize: 18, color: g.color}}>{(g.progress * 100).toFixed(0)}%</div></Card>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Pace</div><Pill style={{borderColor: `color-mix(in oklch, ${paceColor} 35%, var(--border))`, color: paceColor}}>{g.pace}</Pill></Card>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Deadline</div><div className="num" style={{fontSize: 13}}>{g.deadline}</div><div className="dim" style={{fontSize: 10}}>{daysToDeadline(g.deadline)}</div></Card>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Linked</div><div style={{display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4}}>{g.linkedModules.map(m => <Pill key={m}>{m}</Pill>)}</div></Card>
      </div>

      <div className="eyebrow" style={{marginBottom: 6}}>Plan vs actual</div>
      <Card className="card-tight" style={{padding: 12, marginBottom: 14}}>
        {g.history && g.history.length > 0 ? (
          <GoalProgressChart g={g}/>
        ) : (
          <div className="dim" style={{fontSize: 12, textAlign: "center", padding: 20}}>No data points logged yet.</div>
        )}
      </Card>

      <div className="eyebrow" style={{marginBottom: 6}}>Connected data sources</div>
      <div className="col-gap" style={{gap: 6, marginBottom: 14}}>
        {g.linkedModules.includes("training") && <ContextRow icon="training" label="Training compliance" value="22 / 24 sessions · last 30d"/>}
        {g.linkedModules.includes("nutrition") && <ContextRow icon="nutrition" label="Calorie balance" value="−420 kcal/day avg · 30d"/>}
        {g.linkedModules.includes("recovery") && <ContextRow icon="recovery" label="Recovery score avg" value="78 / 100"/>}
        {g.linkedModules.includes("supplements") && <ContextRow icon="supplements" label="Adherence" value="94% · 30d"/>}
      </div>

      <div className="eyebrow" style={{marginBottom: 6}}>Notes</div>
      <div style={{padding: 12, background: "var(--surface)", borderRadius: 6, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55}}>{g.note}</div>
    </GModal>
  );
};

const ContextRow = ({ icon, label, value }) => (
  <div style={{display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
    <Icon name={icon} className="ic" style={{color: "var(--fg-muted)"}}/>
    <span style={{fontSize: 12, flex: 1}}>{label}</span>
    <span className="num" style={{fontSize: 11.5}}>{value}</span>
  </div>
);

const GoalProgressChart = ({ g }) => {
  // Generic chart for weight / time / count goals
  const isWeight = g.target.weight != null;
  const isTime = g.target.time != null;
  const isCount = g.target.count != null;
  let data, target, start, ideal;
  if (isWeight) {
    data = g.history.map(h => h.weight);
    target = g.target.weight;
    start = g.start.weight;
  } else if (isTime) {
    data = g.history.map(h => h.time / 60);
    target = g.target.time / 60;
    start = g.start.time / 60;
  } else {
    data = g.history.map(h => h.count);
    target = g.target.count;
    start = g.start.count;
  }
  ideal = Array.from({length: data.length}, (_, i) => start + (target - start) * (i / (data.length - 1)));
  return (
    <>
      <LineChart h={180}
        range={[Math.min(target, ...data) * 0.97, Math.max(start, ...data) * 1.03]}
        series={[
          { data: ideal, color: "var(--fg-dim)" },
          { data, color: g.color },
        ]}
        xLabels={g.history.map(h => h.d)}
      />
      <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span className="dot" style={{background: "var(--fg-dim)"}}/>ideal path</span>
        <span className="row-gap"><span className="dot" style={{background: g.color}}/>actual</span>
      </div>
    </>
  );
};

const LogWeightModal = ({ onClose }) => (
  <GModal title="Log weight" subtitle="Daily — morning fasted preferred" eyebrow="plus" onClose={onClose} width={520}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Log</button></>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
      <GField label="Date"><GInput type="date" defaultValue="2026-05-16"/></GField>
      <GField label="Time"><GInput type="time" defaultValue="07:15"/></GField>
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
      <GField label="Weight"><GInput type="number" defaultValue="79.4" suffix="kg"/></GField>
      <GField label="Body fat (optional)"><GInput type="number" defaultValue="13.8" suffix="%"/></GField>
    </div>
    <GField label="Source">
      <div style={{display: "flex", gap: 6}}>
        <button className="btn">Manual</button>
        <button className="btn">Smart scale</button>
        <button className="btn">DXA</button>
      </div>
    </GField>
    <GField label="Note (optional)"><GInput placeholder="Hydration, cycle phase, salt the night before…"/></GField>
  </GModal>
);

const LogMeasureModal = ({ onClose }) => (
  <GModal title="Update measurements" subtitle="All in cm · fill what you have" eyebrow="edit" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save measurements</button></>}>
    <GField label="Date"><GInput type="date" defaultValue="2026-05-16"/></GField>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
      {MEASUREMENTS.map(m => (
        <GField key={m.id} label={m.label} sub={`last ${m.current}`}>
          <GInput type="number" defaultValue={m.current} suffix="cm"/>
        </GField>
      ))}
    </div>
    <GField label="Note (optional)"><GInput placeholder="Time of day, pump state, etc."/></GField>
  </GModal>
);

const LogPhotoModal = ({ onClose }) => (
  <GModal title="New photo session" subtitle="Front · side · back · same lighting" eyebrow="camera" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="download" className="ic ic-sm"/>Save session</button></>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14}}>
      {["Front","Side","Back"].map(p => (
        <div key={p} className="placeholder-img" style={{aspectRatio: "9/16", borderRadius: 6, cursor: "pointer", border: "1px dashed var(--border)"}}>
          <div style={{fontSize: 10, textAlign: "center", color: "var(--fg-dim)"}}>{p}<br/>tap to upload</div>
        </div>
      ))}
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
      <GField label="Date"><GInput type="date" defaultValue="2026-05-16"/></GField>
      <GField label="Weight"><GInput type="number" defaultValue="79.4" suffix="kg"/></GField>
      <GField label="Body fat"><GInput type="number" defaultValue="13.8" suffix="%"/></GField>
    </div>
    <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      <Icon name="check" className="ic ic-sm" style={{display: "inline", color: "var(--pos)", marginRight: 4}}/>
      Photos are stored encrypted, never shared with coaches unless you explicitly add them to a goal share.
    </div>
  </GModal>
);

const MeasureDetailModal = ({ m, onClose }) => (
  <GModal title={m.label} subtitle={`Current ${m.current} cm · 6 entries`} eyebrow="trend_up" onClose={onClose} width={580}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Update value</button></>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Current</div><div className="num" style={{fontSize: 18}}>{m.current} cm</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">6 entries ago</div><div className="num" style={{fontSize: 18}}>{m.history[0]} cm</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Δ</div><div className="num" style={{fontSize: 18, color: m.current > m.history[0] ? "var(--pos)" : "var(--warn)"}}>{m.current > m.history[0] ? "+" : ""}{(m.current - m.history[0]).toFixed(1)} cm</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Trend</div>
    <Card className="card-tight" style={{padding: 12}}>
      <LineChart h={140} range={[Math.min(...m.history) - 0.5, Math.max(...m.history) + 0.5]}
        series={[{ data: m.history, color: "var(--acc-goals)" }]}
        xLabels={["6 ago","","","","","now"]}/>
    </Card>
  </GModal>
);

window.GoalsModule = GoalsModule;
