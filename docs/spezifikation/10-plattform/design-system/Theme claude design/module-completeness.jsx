// LumeOS · completeness file — finishes the partial modules
// Body map · Tom profile · Settings · Privacy · Nutrition extras · Training extras · HRV comments

// ── Anatomical Body Map (SVG) ──────────────────────────────
// Replaces the basic block-tile BodyFigure with stylized but anatomically-grouped paths.
const ANATOMY = {
  front: [
    // head + neck
    { id: "head",     name: "Head",          d: "M 50 4 q -6 0 -8 5 q -2 5 0 9 q 2 4 8 4 q 6 0 8 -4 q 2 -4 0 -9 q -2 -5 -8 -5 z" },
    { id: "neck",     name: "Neck",          d: "M 45 22 v 4 h 10 v -4 z" },
    // shoulders + chest
    { id: "delt_l",   name: "Front Delt L",  d: "M 22 27 q -6 1 -9 6 q -2 5 0 11 l 8 -2 l 2 -14 z" },
    { id: "delt_r",   name: "Front Delt R",  d: "M 78 27 q 6 1 9 6 q 2 5 0 11 l -8 -2 l -2 -14 z" },
    { id: "chest_l",  name: "Pec L",         d: "M 25 28 q 0 -2 4 -2 h 19 q 2 0 2 4 v 12 q -1 2 -3 2 h -14 q -3 0 -5 -2 q -3 -3 -3 -8 z" },
    { id: "chest_r",  name: "Pec R",         d: "M 75 28 q 0 -2 -4 -2 h -19 q -2 0 -2 4 v 12 q 1 2 3 2 h 14 q 3 0 5 -2 q 3 -3 3 -8 z" },
    // arms
    { id: "bicep_l",  name: "Bicep L",       d: "M 16 38 q -3 1 -4 5 l -2 10 q 0 3 3 4 q 3 -1 4 -3 l 2 -13 z" },
    { id: "bicep_r",  name: "Bicep R",       d: "M 84 38 q 3 1 4 5 l 2 10 q 0 3 -3 4 q -3 -1 -4 -3 l -2 -13 z" },
    { id: "forearm_l",name: "Forearm L",     d: "M 11 52 q -2 1 -2 4 l -2 12 q 0 2 2 3 q 3 0 4 -2 l 1 -16 z" },
    { id: "forearm_r",name: "Forearm R",     d: "M 89 52 q 2 1 2 4 l 2 12 q 0 2 -2 3 q -3 0 -4 -2 l -1 -16 z" },
    // core
    { id: "abs_u",    name: "Upper Abs",     d: "M 42 42 h 16 v 8 h -16 z" },
    { id: "abs_m",    name: "Middle Abs",    d: "M 42 50 h 16 v 8 h -16 z" },
    { id: "abs_l",    name: "Lower Abs",     d: "M 42 58 h 16 v 8 h -16 z" },
    { id: "obliq_l",  name: "Oblique L",     d: "M 30 42 q -2 1 -3 4 v 18 q 1 3 4 4 l 8 -2 v -22 z" },
    { id: "obliq_r",  name: "Oblique R",     d: "M 70 42 q 2 1 3 4 v 18 q -1 3 -4 4 l -8 -2 v -22 z" },
    // hips + legs
    { id: "hipflex",  name: "Hip flexors",   d: "M 38 66 h 24 q 0 4 -2 6 h -20 q -2 -2 -2 -6 z" },
    { id: "quad_l",   name: "Quadriceps L",  d: "M 32 72 q -2 1 -2 4 l 0 16 q 0 3 3 4 q 6 0 7 -2 l 1 -22 z" },
    { id: "quad_r",   name: "Quadriceps R",  d: "M 68 72 q 2 1 2 4 l 0 16 q 0 3 -3 4 q -6 0 -7 -2 l -1 -22 z" },
    { id: "addct_l",  name: "Adductor L",    d: "M 41 72 q 0 1 1 4 v 18 q -1 1 -2 0 v -22 z" },
    { id: "addct_r",  name: "Adductor R",    d: "M 59 72 q 0 1 -1 4 v 18 q 1 1 2 0 v -22 z" },
    { id: "knee_l",   name: "Knees L",       d: "M 32 94 q -1 0 -2 1 v 3 h 9 v -3 q -3 -1 -7 -1 z" },
    { id: "knee_r",   name: "Knees R",       d: "M 68 94 q 1 0 2 1 v 3 h -9 v -3 q 3 -1 7 -1 z" },
    { id: "calf_l",   name: "Calves L",      d: "M 30 99 q -1 1 -1 4 l 1 14 q 1 2 4 1 l 5 -2 l 0 -17 z" },
    { id: "calf_r",   name: "Calves R",      d: "M 70 99 q 1 1 1 4 l -1 14 q -1 2 -4 1 l -5 -2 l 0 -17 z" },
  ],
  back: [
    { id: "head_b",   name: "Head",          d: "M 50 4 q -6 0 -8 5 q -2 5 0 9 q 2 4 8 4 q 6 0 8 -4 q 2 -4 0 -9 q -2 -5 -8 -5 z" },
    { id: "trap_u",   name: "Upper Traps",   d: "M 40 22 q -2 0 -3 3 q 1 4 4 5 h 18 q 3 -1 4 -5 q -1 -3 -3 -3 z" },
    { id: "trap_m",   name: "Mid Traps",     d: "M 40 30 q -1 0 -1 3 v 8 q 1 2 3 2 h 16 q 2 0 3 -2 v -8 q 0 -3 -1 -3 z" },
    { id: "delt_lb",  name: "Rear Delt L",   d: "M 22 27 q -6 1 -9 6 q -2 5 0 11 l 8 -2 l 2 -14 z" },
    { id: "delt_rb",  name: "Rear Delt R",   d: "M 78 27 q 6 1 9 6 q 2 5 0 11 l -8 -2 l -2 -14 z" },
    { id: "lat_l",    name: "Lats L",        d: "M 24 38 q -2 1 -3 4 l 0 16 q 1 2 3 2 l 13 -2 v -20 z" },
    { id: "lat_r",    name: "Lats R",        d: "M 76 38 q 2 1 3 4 l 0 16 q -1 2 -3 2 l -13 -2 v -20 z" },
    { id: "rhomb",    name: "Rhomboids",     d: "M 38 35 h 24 v 8 h -24 z" },
    { id: "tri_l",    name: "Triceps L",     d: "M 16 38 q -3 1 -4 5 l -2 10 q 0 3 3 4 q 3 -1 4 -3 l 2 -13 z" },
    { id: "tri_r",    name: "Triceps R",     d: "M 84 38 q 3 1 4 5 l 2 10 q 0 3 -3 4 q -3 -1 -4 -3 l -2 -13 z" },
    { id: "forearm_lb",name:"Forearm L",     d: "M 11 52 q -2 1 -2 4 l -2 12 q 0 2 2 3 q 3 0 4 -2 l 1 -16 z" },
    { id: "forearm_rb",name:"Forearm R",     d: "M 89 52 q 2 1 2 4 l 2 12 q 0 2 -2 3 q -3 0 -4 -2 l -1 -16 z" },
    { id: "lowback",  name: "Lower back",    d: "M 38 56 h 24 v 10 h -24 z" },
    { id: "glute_l",  name: "Glutes L",      d: "M 30 66 q -2 1 -2 4 v 5 q 1 3 4 3 l 12 -2 v -12 z" },
    { id: "glute_r",  name: "Glutes R",      d: "M 70 66 q 2 1 2 4 v 5 q -1 3 -4 3 l -12 -2 v -12 z" },
    { id: "ham_l",    name: "Hamstrings L",  d: "M 32 78 q -2 1 -2 4 l 0 14 q 0 3 3 4 q 6 0 7 -2 l 1 -20 z" },
    { id: "ham_r",    name: "Hamstrings R",  d: "M 68 78 q 2 1 2 4 l 0 14 q 0 3 -3 4 q -6 0 -7 -2 l -1 -20 z" },
    { id: "calf_lb",  name: "Calves L",      d: "M 30 99 q -1 1 -1 4 l 1 14 q 1 2 4 1 l 5 -2 l 0 -17 z" },
    { id: "calf_rb",  name: "Calves R",      d: "M 70 99 q 1 1 1 4 l -1 14 q -1 2 -4 1 l -5 -2 l 0 -17 z" },
  ]
};

// Recovery values keyed by muscle group
const MUSCLE_RECOVERY = {
  Head: 100, Neck: 95,
  "Front Delt L": 70, "Front Delt R": 70, "Rear Delt L": 70, "Rear Delt R": 70,
  "Pec L": 88, "Pec R": 88,
  "Bicep L": 90, "Bicep R": 90, "Tricep L": 82, "Tricep R": 82,
  "Triceps L": 82, "Triceps R": 82,
  "Forearm L": 78, "Forearm R": 78,
  "Upper Abs": 70, "Middle Abs": 70, "Lower Abs": 70,
  "Oblique L": 72, "Oblique R": 72,
  "Hip flexors": 75,
  "Quadriceps L": 85, "Quadriceps R": 85,
  "Adductor L": 70, "Adductor R": 70,
  "Knees L": 92, "Knees R": 92,
  "Calves L": 92, "Calves R": 92,
  "Upper Traps": 75, "Mid Traps": 75, "Lats L": 80, "Lats R": 80, Rhomboids: 75,
  "Lower back": 70,
  "Glutes L": 78, "Glutes R": 78,
  "Hamstrings L": 65, "Hamstrings R": 65,
};

const AnatomyMap = ({ data = MUSCLE_RECOVERY, onClick }) => {
  const colorFor = v => v >= 85 ? "var(--pos)" : v >= 65 ? "var(--warn)" : "var(--neg)";
  const fillFor = name => {
    const v = data[name];
    return v != null ? colorFor(v) : "var(--surface-2)";
  };
  const renderSide = (parts, label) => (
    <div style={{flex: 1, textAlign: "center"}}>
      <div className="eyebrow" style={{marginBottom: 8}}>{label}</div>
      <svg viewBox="0 0 100 120" style={{width: "100%", maxWidth: 220}}>
        {/* outline */}
        <path d="M 50 4 q -6 0 -8 5 q -2 5 0 9 q 0 4 2 6 q -8 2 -13 6 q -5 4 -6 12 v 12 q -1 4 -3 9 l -7 14 q -1 4 0 7 l 2 5 q 1 2 3 0 l 3 -7 q 1 -2 1 2 v 18 q 0 4 4 5 h 11 q 4 -1 5 -5 v -22 q 0 -2 2 -3 q 0 4 0 22 v 24 q 0 4 4 5 q 4 -1 4 -5 v -24 q 0 -18 0 -22 q 2 1 2 3 v 22 q 1 4 5 5 h 11 q 4 -1 4 -5 v -18 q 0 -4 1 -2 l 3 7 q 2 2 3 0 l 2 -5 q 1 -3 0 -7 l -7 -14 q -2 -5 -3 -9 v -12 q -1 -8 -6 -12 q -5 -4 -13 -6 q 2 -2 2 -6 q 2 -4 0 -9 q -2 -5 -8 -5 z"
          fill="var(--surface)" stroke="var(--border)" strokeWidth="0.6" />
        {/* muscles */}
        {parts.map(p => (
          <path key={p.id} d={p.d}
            fill={fillFor(p.name)} opacity="0.7"
            stroke={fillFor(p.name)} strokeWidth="0.3"
            style={{cursor: onClick ? "pointer" : "default"}}
            onClick={() => onClick?.(p.name)}>
            <title>{p.name} · {data[p.name] != null ? data[p.name] + "% recovered" : "no data"}</title>
          </path>
        ))}
      </svg>
    </div>
  );
  return (
    <div>
      <div style={{display: "flex", gap: 24, justifyContent: "center"}}>
        {renderSide(ANATOMY.front, "Front")}
        {renderSide(ANATOMY.back, "Back")}
      </div>
      <div style={{display: "flex", justifyContent: "center", gap: 14, marginTop: 14, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 12, height: 12, background: "var(--pos)", opacity: 0.7, borderRadius: 3}}/>Recovered ≥ 85%</span>
        <span className="row-gap"><span style={{width: 12, height: 12, background: "var(--warn)", opacity: 0.7, borderRadius: 3}}/>Recovering 65–84%</span>
        <span className="row-gap"><span style={{width: 12, height: 12, background: "var(--neg)", opacity: 0.7, borderRadius: 3}}/>Fatigued {"<65%"}</span>
        <span className="dim" style={{marginLeft: 12}}>· hover or click muscle for detail</span>
      </div>
    </div>
  );
};

// Replace the existing BodyFigure used in Recovery
window.BodyFigure = AnatomyMap;

// ── Profile / Settings / Privacy modals ────────────────────
const ProfileSettingsModal = ({ tab: initTab = "profile", onClose }) => {
  const [tab, setTab] = useState(initTab);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 760, maxHeight: "92vh", display: "flex", flexDirection: "column"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, var(--acc-train), var(--acc-recov))", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600}}>TM</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Tom Müller · Account</div>
            <div className="dim" style={{fontSize: 11}}>athlete · pro · joined Apr 2023</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "180px 1fr", flex: 1, minHeight: 0}}>
          <div style={{borderRight: "1px solid var(--border)", padding: 8, overflow: "auto"}}>
            {[
              { id: "profile",    label: "Profile", icon: "user" },
              { id: "units",      label: "Units & locale", icon: "settings" },
              { id: "modules",    label: "Modules", icon: "layers" },
              { id: "privacy",    label: "Privacy & sharing", icon: "shield" },
              { id: "data",       label: "Data sources", icon: "training" },
              { id: "billing",    label: "Subscription", icon: "marketplace" },
              { id: "danger",     label: "Danger zone", icon: "alert" },
            ].map(s => (
              <div key={s.id} onClick={() => setTab(s.id)}
                style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 5, cursor: "pointer",
                  background: tab === s.id ? "var(--surface)" : "transparent",
                  color: tab === s.id ? "var(--fg)" : "var(--fg-muted)", fontSize: 12}}>
                <Icon name={s.icon} className="ic ic-sm"/>{s.label}
              </div>
            ))}
          </div>
          <div style={{padding: 18, overflowY: "auto"}}>
            {tab === "profile"  && <ProfilePanel/>}
            {tab === "units"    && <UnitsPanel/>}
            {tab === "modules"  && <ModulesPanel/>}
            {tab === "privacy"  && <PrivacyPanel/>}
            {tab === "data"     && <DataSourcesPanel/>}
            {tab === "billing"  && <BillingPanel/>}
            {tab === "danger"   && <DangerPanel/>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePanel = () => (
  <div>
    <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 18}}>
      <div style={{width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg, var(--acc-train), var(--acc-recov))", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 600}}>TM</div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 16, fontWeight: 600, marginBottom: 2}}>Tom Müller</div>
        <div className="muted" style={{fontSize: 12, marginBottom: 8}}>tom.mueller@example.de · athlete · pro</div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-sm">Change avatar</button>
          <button className="btn btn-ghost btn-sm">Export profile</button>
        </div>
      </div>
    </div>
    <SimpleField label="Display name" defaultValue="Tom Müller"/>
    <SimpleField label="Email" defaultValue="tom.mueller@example.de"/>
    <SimpleField label="Bio" defaultValue="Recreational lifter. Climbing on Sundays. 36." placeholder="2-line bio shown to coaches"/>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
      <SimpleField label="Sex" defaultValue="male" select={["male","female","non-binary","prefer not to say"]}/>
      <SimpleField label="Age" defaultValue="36" type="number"/>
      <SimpleField label="Height" defaultValue="184" suffix="cm"/>
    </div>
    <SimpleField label="Primary goal" defaultValue="Body recomposition" select={["Body recomposition","Strength","Performance","Health","Longevity"]}/>
    <SimpleField label="Activity level" defaultValue="Very active" select={["Sedentary","Lightly active","Moderately active","Very active","Athlete"]}/>
  </div>
);

const UnitsPanel = () => (
  <div>
    <div className="eyebrow" style={{marginBottom: 10}}>Units</div>
    <UnitRow label="Weight" options={["kg","lbs"]} active="kg"/>
    <UnitRow label="Length" options={["cm","inch"]} active="cm"/>
    <UnitRow label="Distance" options={["km","mi"]} active="km"/>
    <UnitRow label="Temperature" options={["°C","°F"]} active="°C"/>
    <UnitRow label="Volume" options={["L","fl oz"]} active="L"/>
    <UnitRow label="Energy" options={["kcal","kJ"]} active="kcal"/>
    <UnitRow label="Date format" options={["YYYY-MM-DD","DD.MM.YYYY","MM/DD/YYYY"]} active="YYYY-MM-DD"/>
    <UnitRow label="Time format" options={["24h","12h"]} active="24h"/>
    <UnitRow label="First day of week" options={["Mon","Sun"]} active="Mon"/>
    <div className="divider"/>
    <div className="eyebrow" style={{marginBottom: 10}}>Locale</div>
    <SimpleField label="Language" defaultValue="English (UK)" select={["English (UK)","English (US)","Deutsch","Français","Español"]}/>
    <SimpleField label="Time zone" defaultValue="Europe/Berlin (UTC+1)"/>
  </div>
);

const UnitRow = ({ label, options, active }) => (
  <div style={{display: "grid", gridTemplateColumns: "180px 1fr", gap: 10, marginBottom: 8, alignItems: "center"}}>
    <span style={{fontSize: 12, color: "var(--fg-muted)"}}>{label}</span>
    <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2}}>
      {options.map(o => (
        <button key={o} className={o === active ? "btn btn-primary" : "btn btn-ghost"} style={{height: 24, fontSize: 11, padding: "0 12px", flex: 1, borderRadius: 4}}>{o}</button>
      ))}
    </div>
  </div>
);

const ModulesPanel = () => {
  const mods = [
    { id: "dashboard", label: "Dashboard", on: true,  lock: true },
    { id: "nutrition", label: "Nutrition", on: true,  lock: false },
    { id: "training",  label: "Training",  on: true,  lock: false },
    { id: "recovery",  label: "Recovery",  on: true,  lock: false },
    { id: "suppl",     label: "Supplements", on: true, lock: false },
    { id: "goals",     label: "Goals & Body", on: true, lock: false },
    { id: "medical",   label: "Medical", on: true, lock: false },
    { id: "coach",     label: "Coach Portal", on: true, lock: false },
    { id: "buddy",     label: "Buddy AI", on: true, lock: false },
    { id: "market",    label: "Marketplace", on: false, lock: false },
  ];
  return (
    <div>
      <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.5}}>
        Enable only the modules you use. Disabled modules hide from sidebar but data is preserved.
      </div>
      <div className="col-gap" style={{gap: 4}}>
        {mods.map(m => (
          <div key={m.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <span style={{fontSize: 13, flex: 1}}>{m.label}</span>
            {m.lock && <Pill className="mono" style={{fontSize: 10}}>required</Pill>}
            <div style={{display: "flex", background: m.on ? "var(--pos)" : "var(--surface-2)", borderRadius: 999, width: 32, height: 18, padding: 2, cursor: m.lock ? "default" : "pointer", opacity: m.lock ? 0.5 : 1}}>
              <div style={{width: 14, height: 14, borderRadius: 999, background: "var(--bg)", marginLeft: m.on ? 14 : 0, transition: "margin 0.15s"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PrivacyPanel = () => (
  <div>
    <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
      Central control over what your coaches and Buddy can see. Each module also has its own visibility settings — this is the override.
    </div>
    <div className="eyebrow" style={{marginBottom: 8}}>Default coach visibility</div>
    <Card className="card-tight" style={{padding: 0, marginBottom: 16}}>
      <table className="tbl">
        <thead><tr><th>Module</th><th style={{width: 110}}>Training coach</th><th style={{width: 110}}>Nutrition coach</th><th style={{width: 110}}>Medical coach</th><th style={{width: 110}}>Buddy AI</th></tr></thead>
        <tbody>
          {[
            ["Nutrition",   "off",  "full", "summary", "full"],
            ["Training",    "full", "off",  "summary", "full"],
            ["Recovery",    "summary", "summary", "summary", "full"],
            ["Supplements", "summary", "summary", "full", "full"],
            ["Goals",       "full", "full", "summary", "full"],
            ["Medical",     "off",  "off",  "full", "summary"],
            ["Extended supplements", "off", "off", "full", "summary"],
            ["Body photos", "off",  "off",  "off",  "off"],
          ].map(r => (
            <tr key={r[0]}>
              <td>{r[0]}</td>
              {[1,2,3,4].map(i => (
                <td key={i}><PermSelect value={r[i]}/></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <div className="eyebrow" style={{marginBottom: 8}}>Data export & deletion</div>
    <div className="col-gap" style={{gap: 6}}>
      <button className="btn"><Icon name="download" className="ic ic-sm"/>Export all data (JSON, last 4 years)</button>
      <button className="btn"><Icon name="download" className="ic ic-sm"/>Export Medical only (PDF + JSON)</button>
      <button className="btn btn-ghost" style={{color: "var(--neg)", borderColor: "color-mix(in oklch, var(--neg) 35%, var(--border))"}}><Icon name="trash" className="ic ic-sm"/>Request account deletion (14-day grace)</button>
    </div>
    <div className="divider"/>
    <div className="eyebrow" style={{marginBottom: 8}}>Audit</div>
    <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      Last permission change: Apr 23 — added Jana Bauer to MK-677 visibility.<br/>
      <span className="mono dim" style={{fontSize: 10}}>full audit log · 142 entries · last 90 days</span>
    </div>
  </div>
);

const PermSelect = ({ value }) => (
  <select defaultValue={value} style={{width: "100%", height: 26, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11}}>
    <option value="full">full</option>
    <option value="summary">summary</option>
    <option value="off">off</option>
  </select>
);

const DataSourcesPanel = () => (
  <div>
    <div className="eyebrow" style={{marginBottom: 10}}>Wearables · scales · labs</div>
    {[
      { name: "Garmin Connect", state: "synced", last: "8s ago" },
      { name: "Polar Flow", state: "synced", last: "8s ago" },
      { name: "Apple Health", state: "synced", last: "1m ago" },
      { name: "Withings (smart scale)", state: "synced", last: "2h ago" },
      { name: "Whoop", state: "paused", last: "2d ago" },
      { name: "Oura", state: "off", last: "—" },
      { name: "MVZ Lab Berlin (manual upload)", state: "manual", last: "Apr 23" },
    ].map(d => (
      <div key={d.name} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, marginBottom: 4}}>
        <span style={{fontSize: 12.5, flex: 1}}>{d.name}</span>
        {d.state === "synced" && <Pill variant="pos" dot>synced · {d.last}</Pill>}
        {d.state === "paused" && <Pill variant="warn">paused · {d.last}</Pill>}
        {d.state === "off" && <Pill>not connected</Pill>}
        {d.state === "manual" && <Pill variant="acc">manual · {d.last}</Pill>}
        <button className="btn btn-sm">Manage</button>
      </div>
    ))}
  </div>
);

const BillingPanel = () => (
  <div>
    <Card className="card-tight" style={{padding: 14, marginBottom: 14, border: "1px solid color-mix(in oklch, var(--acc-mkt) 30%, var(--border))", background: "color-mix(in oklch, var(--acc-mkt) 5%, var(--surface))"}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
        <Icon name="check" className="ic" style={{color: "var(--pos)"}}/>
        <span style={{fontSize: 14, fontWeight: 600}}>LumeOS Pro · Annual</span>
        <Pill variant="pos">active</Pill>
      </div>
      <div className="muted" style={{fontSize: 12, marginBottom: 10}}>Renews 14 Apr 2027 · €99/yr · Stripe</div>
      <div style={{display: "flex", gap: 6}}>
        <button className="btn">Change plan</button>
        <button className="btn btn-ghost">Manage billing</button>
        <button className="btn btn-ghost">Download invoices</button>
      </div>
    </Card>
    <Row label="Plan" value="Pro · all modules · 4 coach seats"/>
    <Row label="Renewal" value="14 Apr 2027"/>
    <Row label="Payment" value="VISA · 4242 (Stripe)"/>
    <Row label="Member since" value="Apr 2023 · 3 yr"/>
  </div>
);

const DangerPanel = () => (
  <div>
    <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>Reversible until you confirm with phrase. Irreversible operations require typing the exact phrase shown.</div>
    {[
      { t: "Disable Buddy entirely", desc: "Buddy stops generating insights, suggestions, and chat responses across all modules. Reversible." },
      { t: "Pause coach sharing", desc: "All coaches lose access immediately. Audit log preserved. Reversible." },
      { t: "Reset all permissions to defaults", desc: "Restrictive defaults restored. Module-level overrides cleared." },
      { t: "Delete photos only", desc: "All body progression photos deleted. Other data unaffected. Irreversible." },
      { t: "Delete account", desc: "All data deleted after 14-day grace period. GDPR-compliant. Irreversible.", confirm: "I want to delete my LumeOS account" },
    ].map((d, i) => (
      <div key={i} style={{padding: 12, background: "var(--surface)", border: `1px solid ${d.confirm ? "color-mix(in oklch, var(--neg) 25%, var(--border))" : "var(--border)"}`, borderRadius: 6, marginBottom: 8}}>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 3}}>{d.t}</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.45, marginBottom: 8}}>{d.desc}</div>
        <button className="btn btn-ghost" style={{color: d.confirm ? "var(--neg)" : "var(--fg)", borderColor: d.confirm ? "color-mix(in oklch, var(--neg) 35%, var(--border))" : "var(--border)"}}>{d.confirm ? "Begin deletion…" : "Confirm"}</button>
      </div>
    ))}
  </div>
);

const SimpleField = ({ label, defaultValue, placeholder, type = "text", suffix, select }) => (
  <div style={{marginBottom: 12}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4}}>
      <label className="eyebrow">{label}</label>
    </div>
    {select ? (
      <select defaultValue={defaultValue} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
        {select.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <div style={{position: "relative"}}>
        <input type={type} defaultValue={defaultValue} placeholder={placeholder}
          style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none"}}/>
        {suffix && <span className="dim mono" style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>{suffix}</span>}
      </div>
    )}
  </div>
);

// Wire profile/settings to sidebar avatar click
window.ProfileSettingsModal = ProfileSettingsModal;

// ── Nutrition extras ──────────────────────────────────────
// 1) Food Detail Modal with full 138 nutrients
window.FoodDetailModal = ({ food, onClose }) => {
  const f = food || { name: "Salmon · Atlantic, raw", src: "BLS", kcal: 208, p: 20, c: 0, f: 13 };
  const sampleNutrients = window.NUTRIENT_TREE ? window.NUTRIENT_TREE.slice(0, 30) : [];
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 800, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 30, height: 30, borderRadius: 7, background: "color-mix(in oklch, var(--acc-nutri) 18%, transparent)", border: "1px solid color-mix(in oklch, var(--acc-nutri) 35%, transparent)", color: "var(--acc-nutri)", display: "grid", placeItems: "center"}}>
            <Icon name="nutrition" className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 2}}>
              <span style={{fontSize: 15, fontWeight: 600}}>{f.name}</span>
              <Pill>{f.src}</Pill>
            </div>
            <div className="muted" style={{fontSize: 11.5}}>per 100 g · raw weight</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 18, overflowY: "auto"}}>
          <div className="grid g-cols-4" style={{gap: 10, marginBottom: 16}}>
            <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Energy</div><div className="num" style={{fontSize: 18}}>{f.kcal}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>kcal</span></div></Card>
            <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Protein</div><div className="num" style={{fontSize: 18}}>{f.p}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>g</span></div></Card>
            <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Carbs</div><div className="num" style={{fontSize: 18}}>{f.c}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>g</span></div></Card>
            <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Fat</div><div className="num" style={{fontSize: 18}}>{f.f}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>g</span></div></Card>
          </div>
          <div style={{display: "flex", gap: 6, marginBottom: 14}}>
            <div style={{flex: 1, position: "relative"}}>
              <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}}/>
              <input placeholder="Search the 138 nutrients in this food…" style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px 0 30px", fontSize: 12, outline: "none"}}/>
            </div>
            <button className="btn">All</button>
            <button className="btn">Above 10% DV</button>
            <button className="btn">Below 10% DV</button>
          </div>
          <Card className="card-tight" style={{padding: 0, marginBottom: 14}}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th style={{width: 100}}>Group</th>
                  <th style={{width: 100, textAlign: "right"}}>Per 100g</th>
                  <th style={{width: 90, textAlign: "right"}}>% Daily</th>
                  <th style={{width: 200}}>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {sampleNutrients.map(n => {
                  const dv = Math.round(20 + Math.random() * 80);
                  const amount = n.target ? (n.target * (dv / 100)).toFixed(1) : (Math.random() * 10).toFixed(1);
                  return (
                    <tr key={n.id} className="clickable" style={{cursor: "pointer"}}>
                      <td>{n.name}</td>
                      <td><Pill>{n.group}</Pill></td>
                      <td className="num" style={{textAlign: "right"}}>{amount} <span className="dim">{n.unit}</span></td>
                      <td className="num" style={{textAlign: "right", color: dv > 50 ? "var(--pos)" : "var(--fg)"}}>{dv}%</td>
                      <td style={{padding: "4px 8px 4px 0"}}>
                        <div style={{height: 4, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden"}}>
                          <div style={{height: "100%", width: `${Math.min(dv, 100)}%`, background: "var(--acc-nutri)"}}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <div className="dim" style={{fontSize: 11, marginBottom: 14}}>30 of 138 nutrients shown · scroll table or use filter to narrow · click row for full nutrient detail</div>
          <div className="eyebrow" style={{marginBottom: 6}}>Allergens</div>
          <div style={{display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14}}>
            <Pill>Fish</Pill>
            <Pill>Contains EPA + DHA</Pill>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn"><Icon name="copy" className="ic ic-sm"/>Add to favorites</button>
          <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add to meal</button>
        </div>
      </div>
    </div>
  );
};

// 2) Recipe Builder Modal
window.RecipeBuilderModal = ({ onClose }) => {
  const items = [
    { food: "Chicken breast · grilled", qty: 180, kcal: 297, p: 56, c: 0,  f: 6.5 },
    { food: "Basmati rice · cooked",   qty: 200, kcal: 260, p: 5.4, c: 56, f: 0.6 },
    { food: "Olive oil · EV",          qty: 12,  kcal: 106, p: 0,   c: 0,  f: 12 },
    { food: "Mixed greens",            qty: 100, kcal: 25,  p: 2,   c: 5,  f: 0.3 },
  ];
  const total = items.reduce((s, x) => ({kcal: s.kcal + x.kcal, p: s.p + x.p, c: s.c + x.c, f: s.f + x.f}), {kcal: 0, p: 0, c: 0, f: 0});
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 760, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 30, height: 30, borderRadius: 7, background: "color-mix(in oklch, var(--acc-nutri) 18%, transparent)", border: "1px solid color-mix(in oklch, var(--acc-nutri) 35%, transparent)", color: "var(--acc-nutri)", display: "grid", placeItems: "center"}}>
            <Icon name="edit" className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Recipe builder</div>
            <div className="dim" style={{fontSize: 11}}>Save as reusable meal · auto-scales by serving</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 18, overflowY: "auto"}}>
          <SimpleField label="Recipe name" defaultValue="Power lunch"/>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
            <SimpleField label="Servings" defaultValue="1" type="number"/>
            <SimpleField label="Tag" defaultValue="Lunch" select={["Breakfast","Lunch","Dinner","Snack","Pre-workout","Post-workout"]}/>
            <SimpleField label="Cuisine" defaultValue="Bowl"/>
          </div>
          <div className="eyebrow" style={{marginTop: 8, marginBottom: 8}}>Ingredients</div>
          <Card className="card-tight" style={{padding: 0, marginBottom: 14}}>
            <table className="tbl">
              <thead><tr><th>Food</th><th style={{width: 90}}>Qty</th><th style={{width: 80, textAlign: "right"}}>kcal</th><th style={{width: 60, textAlign: "right"}}>P</th><th style={{width: 60, textAlign: "right"}}>C</th><th style={{width: 60, textAlign: "right"}}>F</th><th style={{width: 30}}></th></tr></thead>
              <tbody>
                {items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.food}</td>
                    <td><input defaultValue={`${i.qty}g`} style={{width: "100%", height: 24, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 4, padding: "0 6px", fontSize: 11, outline: "none"}}/></td>
                    <td className="num" style={{textAlign: "right"}}>{i.kcal}</td>
                    <td className="num" style={{textAlign: "right"}}>{i.p}</td>
                    <td className="num" style={{textAlign: "right"}}>{i.c}</td>
                    <td className="num" style={{textAlign: "right"}}>{i.f}</td>
                    <td><button className="icon-btn"><Icon name="trash" className="ic ic-sm"/></button></td>
                  </tr>
                ))}
                <tr><td colSpan="7" style={{textAlign: "center"}}><button className="btn btn-ghost"><Icon name="plus" className="ic ic-sm"/>Add ingredient</button></td></tr>
              </tbody>
              <tfoot>
                <tr style={{borderTop: "1px solid var(--border-strong)"}}><td colSpan="2" style={{padding: 8, fontWeight: 600}}>Per serving</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 600}}>{total.kcal}</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 600}}>{total.p.toFixed(1)}</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 600}}>{total.c.toFixed(1)}</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 600}}>{total.f.toFixed(1)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </Card>
          <SimpleField label="Instructions (optional)" placeholder="Cook chicken to 74°C internal…"/>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn">Save & log now</button>
          <button className="btn btn-primary">Save recipe</button>
        </div>
      </div>
    </div>
  );
};

// 3) Macro Calculator wizard
window.MacroCalculatorModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ goal: "recomp", protein_g_kg: 2.0, fat_pct: 25 });
  const weight = 79.4, age = 36, height = 184, sex = "male";
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const af = 1.725;
  const tdee = bmr * af;
  const targetCals = data.goal === "cut" ? tdee - 500 : data.goal === "bulk" ? tdee + 350 : tdee - 250;
  const protein = data.protein_g_kg * weight;
  const fat = (targetCals * (data.fat_pct / 100)) / 9;
  const carbs = (targetCals - protein * 4 - fat * 9) / 4;
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 640}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in oklch, var(--acc-nutri) 18%, transparent)", border: "1px solid color-mix(in oklch, var(--acc-nutri) 35%, transparent)", color: "var(--acc-nutri)", display: "grid", placeItems: "center"}}>
            <Icon name="trend_up" className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Macro calculator</div>
            <div className="dim" style={{fontSize: 11}}>Step {step} of 3 · TDEE-based</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="eyebrow" style={{marginBottom: 14}}>1 · Confirm baseline</div>
              <Row label="Sex" value="male"/>
              <Row label="Age" value="36"/>
              <Row label="Height" value="184 cm"/>
              <Row label="Weight" value="79.4 kg"/>
              <Row label="Activity factor" value="1.725 · very active (5x/wk training)"/>
              <div className="divider"/>
              <Row label="BMR (Mifflin-St Jeor)" value={`${bmr.toFixed(0)} kcal/day`}/>
              <Row label="TDEE" value={`${tdee.toFixed(0)} kcal/day`}/>
            </>
          )}
          {step === 2 && (
            <>
              <div className="eyebrow" style={{marginBottom: 14}}>2 · Pick a goal</div>
              <div className="col-gap" style={{gap: 6}}>
                {[
                  { id: "cut", l: "Cut", sub: "-500 kcal/d · ~0.5kg/wk fat loss" },
                  { id: "recomp", l: "Recomposition", sub: "-250 kcal/d · slow body comp shift" },
                  { id: "maintain", l: "Maintain", sub: "± 0 · hold current body" },
                  { id: "bulk", l: "Lean bulk", sub: "+350 kcal/d · ~0.25kg/wk gain" },
                ].map(g => (
                  <button key={g.id} onClick={() => setData(d => ({...d, goal: g.id}))}
                    style={{
                      textAlign: "left", padding: "12px 14px", borderRadius: 6, cursor: "pointer",
                      background: data.goal === g.id ? "color-mix(in oklch, var(--acc-nutri) 8%, var(--surface))" : "var(--surface)",
                      border: `1px solid ${data.goal === g.id ? "color-mix(in oklch, var(--acc-nutri) 35%, var(--border))" : "var(--border)"}`,
                      color: "var(--fg)"
                    }}>
                    <div style={{fontSize: 13, fontWeight: 600, marginBottom: 2}}>{g.l}</div>
                    <div className="muted" style={{fontSize: 11}}>{g.sub}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="eyebrow" style={{marginBottom: 14}}>3 · Confirm macros</div>
              <Card className="card-tight" style={{padding: 14, marginBottom: 14, background: "color-mix(in oklch, var(--acc-nutri) 5%, var(--surface))"}}>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10}}>
                  <div><div className="eyebrow">Calories</div><div className="num" style={{fontSize: 20}}>{targetCals.toFixed(0)}</div><div className="dim" style={{fontSize: 10}}>kcal/d</div></div>
                  <div><div className="eyebrow">Protein</div><div className="num" style={{fontSize: 20}}>{protein.toFixed(0)}</div><div className="dim" style={{fontSize: 10}}>g · {((protein*4/targetCals)*100).toFixed(0)}%</div></div>
                  <div><div className="eyebrow">Carbs</div><div className="num" style={{fontSize: 20}}>{carbs.toFixed(0)}</div><div className="dim" style={{fontSize: 10}}>g · {((carbs*4/targetCals)*100).toFixed(0)}%</div></div>
                  <div><div className="eyebrow">Fat</div><div className="num" style={{fontSize: 20}}>{fat.toFixed(0)}</div><div className="dim" style={{fontSize: 10}}>g · {data.fat_pct}%</div></div>
                </div>
              </Card>
              <SimpleField label="Protein g per kg bodyweight" defaultValue={data.protein_g_kg.toString()} type="number"/>
              <SimpleField label="Fat % of calories" defaultValue={data.fat_pct.toString()} type="number" suffix="%"/>
              <div className="dim" style={{fontSize: 11, lineHeight: 1.45}}>
                Carbs are calculated to fill the remainder. Recomp default: 2 g protein/kg + 25% fat.
              </div>
            </>
          )}
        </div>
        <div className="modal-f">
          {step > 1 ? <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}><Icon name="chevron_left" className="ic ic-sm"/>Back</button> : <div/>}
          <div className="spacer"/>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next<Icon name="arrow_right" className="ic ic-sm"/></button> : <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Apply targets</button>}
        </div>
      </div>
    </div>
  );
};

// 4) Pre-Workout Optimizer
window.PreWorkoutOptimizer = () => (
  <Card title="Pre-workout window · 17:30 session" sub="optimal nutrition timing"
    actions={<button className="btn btn-ghost btn-sm">Why this?</button>}>
    <div style={{display: "flex", gap: 16, alignItems: "flex-start"}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0}}>
        <div className="ring" style={{width: 76, height: 76}}>
          <svg width="76" height="76">
            <circle cx="38" cy="38" r="34" stroke="var(--surface-2)" strokeWidth="6" fill="none"/>
            <circle cx="38" cy="38" r="34" stroke="var(--acc-nutri)" strokeWidth="6" fill="none"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - 0.68)}
              strokeLinecap="round"/>
          </svg>
          <div className="ring-label"><span className="v" style={{fontSize: 24}}>68</span></div>
        </div>
        <Pill variant="acc" style={{fontSize: 9.5}}>optimal</Pill>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 15, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.01em"}}>Eat by 16:00</div>
        <div className="muted" style={{fontSize: 11.5, marginBottom: 8}}>90 min before training</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>Window is 60–120 min before compound lifting. You have <span className="num" style={{color: "var(--fg)"}}>2h 28m</span>.</div>
      </div>
    </div>
    <div className="divider"/>
    <div className="eyebrow" style={{marginBottom: 6}}>Suggested macros for this pre-workout</div>
    <div className="grid g-cols-3" style={{gap: 8, marginBottom: 12}}>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Carbs</div><div className="num" style={{fontSize: 16}}>60 g</div><div className="dim" style={{fontSize: 10}}>fast-acting</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Protein</div><div className="num" style={{fontSize: 16}}>25-30 g</div><div className="dim" style={{fontSize: 10}}>lean source</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Fat</div><div className="num" style={{fontSize: 16}}>{"<10 g"}</div><div className="dim" style={{fontSize: 10}}>minimal · slows digestion</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Suggested foods from your favorites</div>
    <div className="col-gap" style={{gap: 4}}>
      <div style={{padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, display: "flex", gap: 8}}><span style={{flex: 1}}>Basmati rice + Whey + Banana</span><span className="num dim">~450 kcal · 28P · 65C · 4F</span><button className="btn btn-sm">Add</button></div>
      <div style={{padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, display: "flex", gap: 8}}><span style={{flex: 1}}>Oatmeal + Whey + Honey</span><span className="num dim">~430 kcal · 30P · 60C · 5F</span><button className="btn btn-sm">Add</button></div>
      <div style={{padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, display: "flex", gap: 8}}><span style={{flex: 1}}>Sourdough + Turkey + Berries</span><span className="num dim">~420 kcal · 28P · 58C · 6F</span><button className="btn btn-sm">Add</button></div>
    </div>
  </Card>
);

// 5) Smart Suggestions card
window.SmartSuggestionsCard = () => (
  <Card title="Smart suggestions" sub="based on your patterns">
    <div className="col-gap" style={{gap: 6}}>
      {[
        { icon: "copy", title: "Same as yesterday", sub: "Oats + Whey · 612 kcal", action: "Log breakfast" },
        { icon: "trend_up", title: "Top breakfast (last 30d)", sub: "78% adherence · 24× this month", action: "Add" },
        { icon: "bolt", title: "Quick post-workout", sub: "Whey 30g + Banana · 30 sec to log", action: "Log" },
        { icon: "calendar", title: "Saturday cheat meal", sub: "You typically eat out Sat · 850 kcal allowance", action: "Plan" },
      ].map((s, i) => (
        <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
          <Icon name={s.icon} className="ic ic-sm" style={{color: "var(--acc-nutri)", flexShrink: 0}}/>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 12, fontWeight: 500}}>{s.title}</div>
            <div className="dim" style={{fontSize: 10.5}}>{s.sub}</div>
          </div>
          <button className="btn btn-sm">{s.action}</button>
        </div>
      ))}
    </div>
  </Card>
);

// 6) Active Workout · offline indicator + HR widget
window.OfflineStatusWidget = () => (
  <div style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "color-mix(in oklch, var(--warn) 8%, var(--surface))", border: "1px solid color-mix(in oklch, var(--warn) 25%, var(--border))", borderRadius: 5, fontSize: 11}}>
    <Icon name="cloud_off" className="ic ic-sm" style={{color: "var(--warn)"}}/>
    <span style={{color: "var(--warn)"}}>Offline · 4 entries queued</span>
    <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>auto-sync when online</span>
  </div>
);

window.HeartRateWidget = () => (
  <Card title="Live HR · Polar H10" sub="connected · 02:18 into session"
    actions={<Pill variant="pos" dot>chest strap</Pill>}>
    <div style={{display: "flex", gap: 14, alignItems: "center", marginBottom: 10}}>
      <div className="num" style={{fontSize: 36, fontWeight: 500, color: "var(--neg)"}}>148<span className="dim" style={{fontSize: 12, marginLeft: 4}}>bpm</span></div>
      <div style={{flex: 1}}>
        <div className="eyebrow" style={{marginBottom: 4}}>Zone 4 · threshold</div>
        <Meter value={148} max={193} color="var(--neg)" tall/>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--fg-dim)", marginTop: 3, fontFamily: "var(--font-mono)"}}>
          <span>96 Z1</span><span>116 Z2</span><span>135 Z3</span><span>155 Z4</span><span>193 max</span>
        </div>
      </div>
    </div>
    <Sparkline data={[78,82,88,95,110,135,142,148,144,138,142,148,146,140,150]} color="var(--neg)" h={32}/>
    <div style={{display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
      <span>Avg <span className="num" style={{color: "var(--fg)"}}>132</span></span>
      <span>Max <span className="num" style={{color: "var(--fg)"}}>158</span></span>
      <span>Time in Z3+ <span className="num" style={{color: "var(--fg)"}}>14:22</span></span>
    </div>
  </Card>
);

// 7) HRV comment modal
window.HRVCommentModal = ({ onClose }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width: 520}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in oklch, var(--acc-recov) 18%, transparent)", border: "1px solid color-mix(in oklch, var(--acc-recov) 35%, transparent)", color: "var(--acc-recov)", display: "grid", placeItems: "center"}}><Icon name="edit" className="ic"/></div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>Annotate HRV reading</div>
          <div className="dim" style={{fontSize: 11}}>2026-05-16 · 64 ms · context for trend analysis</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body">
        <SimpleField label="Tags" defaultValue="" placeholder="e.g. travel, alcohol, ill, late meal" select={["normal","travel","alcohol","illness","late meal","poor sleep","stressful day","menstrual","other"]}/>
        <SimpleField label="Note" placeholder="What's worth remembering about this reading?"/>
        <SimpleField label="Confidence" defaultValue="high" select={["low","medium","high"]}/>
      </div>
      <div className="modal-f">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save annotation</button>
      </div>
    </div>
  </div>
);

// 8) Periodization full view (richer)
window.PeriodizationFullView = () => {
  const blocks = [
    { id: 1, name: "Block 1 · Hypertrophy",    weeks: "Jan 6 → Feb 9 (5w)",    state: "done",    note: "Volume base · +3% bench" },
    { id: 2, name: "Block 2 · Hypertrophy",    weeks: "Feb 10 → Mar 16 (5w)",  state: "done",    note: "Volume peak · +2% bench" },
    { id: 3, name: "Block 3 · Hypertrophy → Strength", weeks: "May 5 → Jun 8 (5w)", state: "current", note: "Current · transitioning intensity" },
    { id: 4, name: "Block 4 · Strength",        weeks: "Jun 9 → Jul 13 (5w)",   state: "planned", note: "Heavy doubles + triples" },
    { id: 5, name: "Block 5 · Peak",             weeks: "Jul 14 → Aug 10 (4w)",  state: "planned", note: "PR attempts · taper" },
    { id: 6, name: "Block 6 · Recovery + Aerobic", weeks: "Aug 11 → Sep 7 (4w)", state: "planned", note: "Z2 base + mobility" },
  ];
  return (
    <Card title="Annual periodization · 2026" sub="6 blocks · 28 weeks tracked"
      actions={<button className="btn btn-ghost btn-sm">View 2025</button>}>
      <div className="col-gap" style={{gap: 6}}>
        {blocks.map(b => (
          <div key={b.id} style={{
            padding: "10px 12px", borderRadius: 6,
            background: b.state === "current" ? "color-mix(in oklch, var(--acc-train) 8%, var(--surface))" : "var(--surface)",
            border: `1px solid ${b.state === "current" ? "color-mix(in oklch, var(--acc-train) 30%, var(--border))" : "var(--border)"}`
          }}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
              <span style={{fontSize: 13, fontWeight: 600}}>{b.name}</span>
              {b.state === "current" && <Pill variant="acc">current</Pill>}
              {b.state === "done" && <Pill variant="pos">complete</Pill>}
              {b.state === "planned" && <Pill>planned</Pill>}
              <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{b.weeks}</span>
            </div>
            <div className="muted" style={{fontSize: 11.5}}>{b.note}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// 9) Heatmap component
window.NutritionHeatmapView = () => (
  <Card title="Nutrient coverage · 90 days" sub="rows are top-12 nutrients · columns are days">
    {(() => {
      const rows = ["Vit D", "Omega-3", "Magnesium", "Iron", "B12", "Calcium", "Zinc", "Vit C", "Folate", "Potassium", "Fiber", "Choline"];
      const days = 90;
      return (
        <div>
          <div style={{display: "grid", gridTemplateColumns: "100px 1fr", gap: 4}}>
            {rows.map((r, i) => (
              <React.Fragment key={r}>
                <div style={{fontSize: 11, color: "var(--fg-muted)", display: "flex", alignItems: "center"}}>{r}</div>
                <div style={{display: "grid", gridTemplateColumns: `repeat(${days}, 1fr)`, gap: 1.5}}>
                  {Array.from({length: days}).map((_, j) => {
                    const v = Math.sin((i * 13 + j) * 0.3) * 0.5 + 0.55 + Math.random() * 0.1;
                    const color = v >= 0.85 ? "var(--pos)" : v >= 0.5 ? "var(--warn)" : "var(--neg)";
                    return <div key={j} style={{height: 12, background: color, opacity: 0.3 + v * 0.6, borderRadius: 1.5}}/>;
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12, fontSize: 10, color: "var(--fg-muted)"}}>
            <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--neg)", opacity: 0.6, borderRadius: 2}}/>{"<50% target"}</span>
            <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--warn)", opacity: 0.6, borderRadius: 2}}/>50–85%</span>
            <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--pos)", opacity: 0.6, borderRadius: 2}}/>≥ 85%</span>
          </div>
        </div>
      );
    })()}
  </Card>
);
