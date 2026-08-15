// Coach module — both Athlete-view + Coach-Portal-view with role switch

const COACHES = [
  {
    id: "c-train",
    type: "Training",
    name: "Anders Lindqvist",
    title: "Strength · Periodization · S&C",
    org: "Performance Lab Stockholm",
    avatar: "AL",
    color: "var(--acc-train)",
    status: "active",
    since: "2024-08-12",
    sharedModules: ["Training", "Recovery", "Goals"],
    activePlan: "PPL · Block 3",
    lastMsg: "Bench at 117.5 felt heavy on set 4 — drop to 115 next session.",
    lastMsgAt: "Yesterday 21:14",
    unread: 0,
    cadence: "weekly · Mondays 19:00 CET",
    rating: 4.9,
    bio: "12 years coaching strength athletes. Former NSCA-CSCS. Periodization specialist.",
    fee: "€180 / month",
  },
  {
    id: "c-nutri",
    type: "Nutrition",
    name: "Jana Bauer",
    title: "Sports nutrition · DGE certified",
    org: "Independent · Berlin",
    avatar: "JB",
    color: "var(--acc-nutri)",
    status: "active",
    since: "2025-01-18",
    sharedModules: ["Nutrition", "Goals", "Supplements (MK-677 only)"],
    activePlan: "Recomp · 2,700 kcal split",
    lastMsg: "Increased carbs +20g on training days. Hold for 2 weeks then re-evaluate.",
    lastMsgAt: "Wed 18:42",
    unread: 1,
    cadence: "bi-weekly check-in · Wednesdays",
    rating: 4.8,
    bio: "Specialist for body recomposition. Whoop + DXA integration.",
    fee: "€120 / month",
  },
  {
    id: "c-med",
    type: "Medical",
    name: "Dr. Magnus Kessler",
    title: "Endokrinologe · Sport-Medicine",
    org: "Endokrinologie Berlin · Charlottenburg",
    avatar: "MK",
    color: "var(--acc-medic)",
    status: "active",
    since: "2024-09-12",
    sharedModules: ["Medical (full)", "Supplements (extended)", "Recovery (summary)"],
    activePlan: "TRT protocol · quarterly panels",
    lastMsg: "HCT 48% — within range. Continue current Test Cyp dose. Next panel Jul 15.",
    lastMsgAt: "Apr 23",
    unread: 0,
    cadence: "quarterly + ad-hoc",
    rating: 5.0,
    bio: "Certified endocrinologist. Sports-medicine focus. Member DGE/DGS.",
    fee: "€680 / year",
  },
  {
    id: "c-suppl",
    type: "Supplement",
    name: "David Park",
    title: "Performance nutrition · evidence-led",
    org: "Examine.com network · remote",
    avatar: "DP",
    color: "var(--acc-suppl)",
    status: "active",
    since: "2025-03-04",
    sharedModules: ["Supplements (full)", "Nutrition (summary)"],
    activePlan: "Stack v3.2 · 8 items",
    lastMsg: "Ashwagandha cycle off-week starts Jun 9. Reminder set.",
    lastMsgAt: "Mon 09:32",
    unread: 0,
    cadence: "monthly review",
    rating: 4.7,
    bio: "Peer-reviewed evidence approach. No upsell.",
    fee: "€60 / month",
  },
];

const PENDING_INVITES = [
  { id: "inv-1", name: "Sarah Müller", type: "Physio", invitedOn: "May 12", expiry: "expires May 19" },
];

const COACH_NOTES = [
  { id: "n1", coach: "Anders Lindqvist", coachId: "c-train", module: "Training", date: "May 13", body: "Pull A · Wk2: PR on weighted pull-up at +30kg ×5. Consider deload week 4 already — RPE drifted above plan for 3 sessions.", tags: ["PR", "RPE-watch"] },
  { id: "n2", coach: "Jana Bauer",      coachId: "c-nutri", module: "Nutrition", date: "May 8", body: "Add 200g sweet potato to Wed/Sat dinners. Compliance was 92% in April — strong baseline.", tags: ["adjustment"] },
  { id: "n3", coach: "Dr. M. Kessler",  coachId: "c-med", module: "Medical", date: "Apr 23", body: "All TRT markers stable. Watch Hematocrit if it climbs above 49 — donate blood next quarter as preventive.", tags: ["TRT", "monitor"] },
  { id: "n4", coach: "Anders Lindqvist", coachId: "c-train", module: "Training", date: "May 6", body: "Move Push B from 18:00 to 16:30 next block — Buddy correlation supports it. Will coordinate with Jana on pre-workout meal.", tags: ["cross-coach"] },
  { id: "n5", coach: "David Park", coachId: "c-suppl", module: "Supplements", date: "Apr 28", body: "MK-677 baseline panel done. Track fasting glucose. Cycle off if exceeds 110 mg/dL.", tags: ["MK-677", "safety"] },
];

// ── Coach Portal — when Tom is acting as a coach ────────────
const PORTAL_ATHLETES = [
  { id: "a1",  name: "Lukas Bauer",      avatar: "LB", since: "2y 1mo", plan: "PPL · Block 3",          compliance: 98, alerts: 0, lastSession: "today 07:14",   tags: ["pro", "powerlifter"] },
  { id: "a2",  name: "Sophie Klein",     avatar: "SK", since: "8mo",    plan: "Upper-Lower Hyper",      compliance: 89, alerts: 1, lastSession: "yesterday",     tags: ["recreational"] },
  { id: "a3",  name: "Marcus Weber",     avatar: "MW", since: "1y 6mo", plan: "5/3/1 BBB · Wk 4",       compliance: 100, alerts: 0, lastSession: "today 06:30",  tags: ["pro"] },
  { id: "a4",  name: "Elena Schmidt",    avatar: "ES", since: "3mo",    plan: "Beginner Linear",         compliance: 76, alerts: 2, lastSession: "3d ago",        tags: ["beginner"] },
  { id: "a5",  name: "Niko Brandt",      avatar: "NB", since: "2y 4mo", plan: "Powerbuilding · Custom",  compliance: 94, alerts: 0, lastSession: "today",         tags: ["pro"] },
  { id: "a6",  name: "Lea Hartmann",     avatar: "LH", since: "1y 2mo", plan: "PPL · Block 2",           compliance: 92, alerts: 1, lastSession: "yesterday",     tags: ["intermediate"] },
  { id: "a7",  name: "Felix Krause",     avatar: "FK", since: "10mo",   plan: "Full Body 3x",            compliance: 84, alerts: 0, lastSession: "2d ago",        tags: ["recreational"] },
  { id: "a8",  name: "Carla Roth",       avatar: "CR", since: "4mo",    plan: "Hypertrophy · Wk 6",      compliance: 95, alerts: 0, lastSession: "today 17:08",  tags: ["intermediate"] },
  { id: "a9",  name: "Daniel Vogel",     avatar: "DV", since: "1y 8mo", plan: "Conjugate · Block 2",     compliance: 88, alerts: 2, lastSession: "yesterday",     tags: ["pro", "powerlifter"] },
  { id: "a10", name: "Mira Stahl",       avatar: "MS", since: "6mo",    plan: "Strength 5x",             compliance: 81, alerts: 1, lastSession: "today 19:42",  tags: ["intermediate"] },
  { id: "a11", name: "Jonas Becker",     avatar: "JB", since: "2y 9mo", plan: "Periodized · Marathon",   compliance: 96, alerts: 0, lastSession: "today",         tags: ["endurance"] },
  { id: "a12", name: "Anna Frey",        avatar: "AF", since: "1y",     plan: "PPL · Block 1",           compliance: 79, alerts: 1, lastSession: "4d ago",        tags: ["intermediate"] },
  { id: "a13", name: "Tom Müller",       avatar: "TM", since: "9mo",    plan: "PPL · Block 3 (current)", compliance: 94, alerts: 0, lastSession: "today 06:50",  tags: ["self"] },
  { id: "a14", name: "Erik Lange",       avatar: "EL", since: "5mo",    plan: "Beginner Linear",         compliance: 91, alerts: 0, lastSession: "today",         tags: ["beginner"] },
];

const COACH_PLANS = [
  { id: "p1",  name: "PPL · Hypertrophy → Strength · 5 weeks",  category: "Training", assignedTo: 6, sells: 18, rating: 4.9, lastUpdated: "Apr 14" },
  { id: "p2",  name: "5/3/1 BBB · 12 weeks",                     category: "Training", assignedTo: 4, sells: 22, rating: 4.8, lastUpdated: "Mar 22" },
  { id: "p3",  name: "Upper-Lower Hypertrophy · 6 weeks",        category: "Training", assignedTo: 3, sells: 11, rating: 4.7, lastUpdated: "Feb 8" },
  { id: "p4",  name: "Conjugate · 8 weeks (powerlifting)",       category: "Training", assignedTo: 2, sells: 8,  rating: 4.9, lastUpdated: "Mar 1" },
  { id: "p5",  name: "Beginner Linear · 12 weeks",                category: "Training", assignedTo: 5, sells: 41, rating: 4.6, lastUpdated: "Jan 18" },
  { id: "p6",  name: "Marathon prep · 16 weeks",                  category: "Endurance", assignedTo: 1, sells: 6,  rating: 4.7, lastUpdated: "Feb 14" },
];

const MESSAGES_THREAD = [
  { id: "m1", from: "Anders", at: "Yesterday 21:14", body: "Bench at 117.5 felt heavy on set 4 — drop to 115 next session.", direction: "in" },
  { id: "m2", from: "Tom",    at: "Yesterday 21:18", body: "Will do. Felt the slow rep on 4. Going for 5×5 next Mon.", direction: "out" },
  { id: "m3", from: "Anders", at: "Yesterday 21:22", body: "Good. Send a video if you want me to check bar path on the last attempt.", direction: "in" },
  { id: "m4", from: "Anders", at: "May 10 09:14",   body: "Pull-up PR. Nice work. Recovery numbers were perfect this week.", direction: "in" },
  { id: "m5", from: "Tom",    at: "May 10 11:32",   body: "Cheers. Felt the lats more than usual — RPE 8.", direction: "out" },
];

// ── Module shell ───────────────────────────────────────────
const CoachCtx = React.createContext(null);

const CoachModule = () => {
  const side = "athlete";
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({type, payload});
  const close = () => setModal(null);

  
  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Coach</span>
            {side === "athlete" ? (
              <>
                <Pill variant="acc">{COACHES.length} active</Pill>
                <Pill><Icon name="bell" className="ic ic-sm"/>{COACHES.filter(c => c.unread > 0).reduce((s,c) => s + c.unread, 0)} unread</Pill>
              </>
            ) : (
              <>
                <Pill variant="acc">{PORTAL_ATHLETES.length} athletes</Pill>
                <Pill><Icon name="alert" className="ic ic-sm"/>{PORTAL_ATHLETES.reduce((s,a) => s + a.alerts, 0)} alerts</Pill>
                <Pill>MRR €4,820</Pill>
              </>
            )}
          </div>
          <div className="module-sub">
            {side === "athlete"
              ? "Your coaches · what they see · messages · plans assigned"
              : "Your athletes · plan library · revenue · alerts"}
          </div>
        </div>
        <div className="module-actions">
          {side === "athlete"
            ? <>
                <button className="btn" onClick={() => open("scan")}><Icon name="camera" className="ic ic-sm"/>Scan QR</button>
                <button className="btn btn-primary" onClick={() => open("invite")}><Icon name="plus" className="ic ic-sm"/>Invite coach</button>
              </>
            : <>
                <button className="btn"><Icon name="message" className="ic ic-sm"/>Broadcast</button>
                <button className="btn btn-primary" onClick={() => open("addPlan")}><Icon name="plus" className="ic ic-sm"/>New plan</button>
              </>
          }
        </div>
      </div>

      <Tabs items={[
          { id: "overview",    label: "Overview" },
          { id: "coaches",     label: "Coaches",     count: COACHES.length },
          { id: "permissions", label: "Permissions" },
          { id: "proposals",   label: "Proposals",   count: 2 },
          { id: "autonomy",    label: "Autonomy" },
          { id: "checkins",    label: "Check-ins" },
          { id: "messages",    label: "Messages",    count: COACHES.filter(c => c.unread > 0).length },
          { id: "notes",       label: "Notes",       count: COACH_NOTES.length },
          { id: "invites",     label: "Invites",     count: PENDING_INVITES.length },
          { id: "onboard",     label: "Onboarding" },
        ]} active={tab} onChange={setTab}/>

      <CoachCtx.Provider value={{ open, close }}>
      {tab === "overview"    && <AthleteOverview/>}
      {tab === "coaches"     && <AthleteCoaches/>}
      {tab === "permissions" && (window.AthletePermissionsV2 ? <window.AthletePermissionsV2/> : <AthletePermissions/>)}
      {tab === "proposals"   && window.AthleteProposals && <window.AthleteProposals/>}
      {tab === "autonomy"    && window.AthleteAutonomy && <window.AthleteAutonomy/>}
      {tab === "checkins"    && window.AthleteCheckins && <window.AthleteCheckins/>}
      {tab === "messages"    && <AthleteMessages/>}
      {tab === "notes"       && <AthleteNotes/>}
      {tab === "invites"     && <AthleteInvites/>}
      {tab === "onboard"     && window.CoachOnboardingWizard && <window.CoachOnboardingWizard/>}
      </CoachCtx.Provider>

      {modal?.type === "coachDetail" && <CoachDetailModal coach={modal.payload} onClose={close}/>}
      {modal?.type === "invite"      && <InviteCoachModal onClose={close}/>}
      {modal?.type === "scan"        && <ScanQRModal onClose={close}/>}
      {modal?.type === "thread"      && <MessageThreadModal coach={modal.payload} onClose={close}/>}
      {modal?.type === "athleteDet"  && (window.AthleteDetailEnhanced ? <window.AthleteDetailEnhanced athlete={modal.payload} onClose={close}/> : <AthleteDetailModal athlete={modal.payload} onClose={close}/>)}
      {modal?.type === "noteDet"     && <NoteDetailModal note={modal.payload} onClose={close}/>}
      {modal?.type === "newPlan"     && <NewPlanModal onClose={close}/>}
      {window.CoachExtrasLauncher && <window.CoachExtrasLauncher/>}
    </>
  );
};

// ── ATHLETE OVERVIEW ───────────────────────────────────────
const AthleteOverview = () => {
  const ctx = React.useContext(CoachCtx);
  const latestNote = COACH_NOTES[0];
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Your coaches" sub={`${COACHES.length} of 4 categories`}>
          <div className="grid g-cols-2" style={{gap: 10}}>
            {COACHES.map(c => <CoachCardMini key={c.id} c={c} onClick={() => ctx.open("coachDetail", c)}/>)}
          </div>
        </Card>

        <Card title="Latest from your coaches" sub={`${COACH_NOTES.length} notes`}>
          <div className="col-gap" style={{gap: 6}}>
            {COACH_NOTES.slice(0, 4).map(n => (
              <div key={n.id} onClick={() => ctx.open("noteDet", n)} style={{padding: 10, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer"}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                  <span style={{fontSize: 12, fontWeight: 600}}>{n.coach}</span>
                  <Pill>{n.module}</Pill>
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{n.date}</span>
                </div>
                <div className="muted" style={{fontSize: 11.5, lineHeight: 1.45}}>{n.body}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Pending invites" sub={`${PENDING_INVITES.length}`} actions={<button className="btn btn-ghost btn-sm" onClick={() => ctx.open("invite")}>New invite</button>}>
          {PENDING_INVITES.length === 0 ? <Empty title="No pending invites" sub="Invite a new coach with QR code or link." icon="user"/> : (
            <div className="col-gap" style={{gap: 6}}>
              {PENDING_INVITES.map(i => (
                <div key={i.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5}}>
                  <span style={{flex: 1, fontSize: 12.5}}>{i.name} <span className="dim mono" style={{fontSize: 10, marginLeft: 6}}>{i.type}</span></span>
                  <span className="dim mono" style={{fontSize: 10}}>{i.invitedOn} · {i.expiry}</span>
                  <button className="btn btn-sm">Resend</button>
                  <button className="btn btn-ghost btn-sm">Cancel</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Coaching balance" sub="monthly investment">
          <Row label="Training" value="€180"/>
          <Row label="Nutrition" value="€120"/>
          <Row label="Supplements" value="€60"/>
          <Row label="Medical (annualized)" value="€57"/>
          <div className="divider"/>
          <Row label="Total" value="€417 / mo"/>
          <Row label="Vs. last month" value="+€60"/>
        </Card>
        <Card title="Trust circle" sub="who sees what" actions={<button className="btn btn-ghost btn-sm" onClick={() => window.dispatchEvent(new CustomEvent("open-profile-settings"))}>Edit privacy →</button>}>
          {COACHES.map(c => (
            <Row key={c.id} label={c.name} value={c.sharedModules.length + " mod" + (c.sharedModules.length === 1 ? "" : "s")} sub={c.type}/>
          ))}
        </Card>
        <Card title="Coach activity · 30d">
          <Sparkline data={[3,4,6,5,7,8,5,6,7,9,8,7,6,8]} color="var(--acc-coach)" h={40}/>
          <div style={{display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
            <span>Notes <span className="num" style={{color: "var(--fg)"}}>42</span></span>
            <span>Messages <span className="num" style={{color: "var(--fg)"}}>86</span></span>
            <span>Plan changes <span className="num" style={{color: "var(--fg)"}}>4</span></span>
          </div>
        </Card>
      </div>
    </div>
  );
};

const CoachCardMini = ({ c, onClick }) => (
  <div onClick={onClick} style={{padding: 12, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer", position: "relative", overflow: "hidden"}}>
    <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c.color}}/>
    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 8}}>
      <div style={{width: 32, height: 32, borderRadius: 7, background: c.color, color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11}}>{c.avatar}</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 12.5, fontWeight: 600}}>{c.name}</div>
        <div className="dim mono" style={{fontSize: 10}}>{c.type}</div>
      </div>
      {c.unread > 0 && <Pill variant="acc">{c.unread} new</Pill>}
    </div>
    <div className="muted" style={{fontSize: 11, lineHeight: 1.4, marginBottom: 6}}>{c.title}</div>
    <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
      {c.sharedModules.slice(0, 3).map(m => <Pill key={m}>{m}</Pill>)}
    </div>
  </div>
);

// ── ATHLETE COACHES TAB ────────────────────────────────────
const AthleteCoaches = () => {
  const ctx = React.useContext(CoachCtx);
  return (
    <div className="col-gap" style={{gap: 12}}>
      {COACHES.map(c => (
        <Card key={c.id} onClick={() => ctx.open("coachDetail", c)} style={{cursor: "pointer"}}>
          <div style={{display: "flex", gap: 16, alignItems: "flex-start"}}>
            <div style={{width: 56, height: 56, borderRadius: 12, background: c.color, color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 18, flexShrink: 0}}>{c.avatar}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
                <span style={{fontSize: 15, fontWeight: 600}}>{c.name}</span>
                <Pill style={{borderColor: `color-mix(in oklch, ${c.color} 35%, var(--border))`, color: c.color}}>{c.type}</Pill>
                {c.status === "active" && <Pill variant="pos" dot>active</Pill>}
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>since {c.since}</span>
              </div>
              <div className="muted" style={{fontSize: 12, marginBottom: 8, lineHeight: 1.45}}>{c.title} · {c.org}</div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, fontSize: 11, marginBottom: 10}}>
                <div><div className="eyebrow">Cadence</div><div>{c.cadence}</div></div>
                <div><div className="eyebrow">Active plan</div><div>{c.activePlan}</div></div>
                <div><div className="eyebrow">Fee</div><div className="num">{c.fee}</div></div>
                <div><div className="eyebrow">Rating</div><div className="num">{c.rating} ★</div></div>
              </div>
              <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                <span className="eyebrow" style={{marginRight: 4, alignSelf: "center"}}>Sees</span>
                {c.sharedModules.map(m => <Pill key={m}>{m}</Pill>)}
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 6}}>
              <button className="btn" onClick={e => {e.stopPropagation(); ctx.open("thread", c)}}><Icon name="message" className="ic ic-sm"/>Message{c.unread > 0 ? ` · ${c.unread}` : ""}</button>
              <button className="btn btn-ghost">Manage</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ── ATHLETE PERMISSIONS TAB ────────────────────────────────
const AthletePermissions = () => {
  const modules = ["Nutrition", "Training", "Recovery", "Supplements", "Goals", "Medical", "Extended supplements"];
  return (
    <Card title="Per-coach permissions matrix" sub="who sees what — exposes each coach's view of your data">
      <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: 14}}>
        Defaults are restrictive. Changes notify the coach. <a className="mono" style={{color: "var(--acc-coach)", cursor: "pointer"}} onClick={() => window.dispatchEvent(new CustomEvent("open-profile-settings"))}>Open full privacy settings →</a>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Module</th>
            {COACHES.map(c => <th key={c.id} style={{width: 130}}>{c.name.split(" ")[0]}<br/><span className="dim mono" style={{fontSize: 9}}>{c.type}</span></th>)}
            <th style={{width: 120}}>Buddy AI</th>
          </tr>
        </thead>
        <tbody>
          {modules.map(m => (
            <tr key={m}>
              <td>{m}</td>
              {COACHES.map(c => {
                const has = c.sharedModules.some(s => s.toLowerCase().includes(m.toLowerCase().split(" ")[0]));
                return (
                  <td key={c.id}>
                    <select defaultValue={has ? (c.type === "Medical" && m === "Medical" ? "full" : "shared") : "off"}
                      style={{width: "100%", height: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11, padding: "0 6px"}}>
                      <option value="full">full</option>
                      <option value="shared">shared</option>
                      <option value="summary">summary</option>
                      <option value="off">off</option>
                    </select>
                  </td>
                );
              })}
              <td>
                <select defaultValue="full" style={{width: "100%", height: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11, padding: "0 6px"}}>
                  <option>full</option><option>summary</option><option>aggregate</option><option>off</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider"/>
      <div style={{display: "flex", gap: 6}}>
        <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save changes</button>
        <button className="btn btn-ghost">Reset to defaults</button>
        <div className="spacer"/>
        <button className="btn btn-ghost"><Icon name="history" className="ic ic-sm"/>Audit log · 142 entries</button>
      </div>
    </Card>
  );
};

// ── ATHLETE MESSAGES TAB ───────────────────────────────────
const AthleteMessages = () => {
  const ctx = React.useContext(CoachCtx);
  return (
    <div className="grid" style={{gridTemplateColumns: "320px 1fr", gap: 12}}>
      <Card title="Threads" sub={`${COACHES.length} coaches`} className="card-tight" style={{padding: 0}}>
        <div className="col-gap" style={{gap: 0}}>
          {COACHES.map(c => (
            <div key={c.id} onClick={() => ctx.open("thread", c)} style={{padding: 12, borderBottom: "1px solid var(--border)", cursor: "pointer", display: "flex", gap: 10}}>
              <div style={{width: 28, height: 28, borderRadius: 6, background: c.color, color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10, flexShrink: 0}}>{c.avatar}</div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 2}}>
                  <span style={{fontSize: 12, fontWeight: 600}}>{c.name.split(" ")[0]} {c.name.split(" ").slice(-1)[0]}</span>
                  {c.unread > 0 && <span style={{width: 6, height: 6, borderRadius: 999, background: "var(--acc-coach)", display: "inline-block"}}/>}
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 9}}>{c.lastMsgAt}</span>
                </div>
                <div className="muted" style={{fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{c.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{textAlign: "center", padding: "40px 20px"}}>
          <Icon name="message" className="ic" style={{width: 32, height: 32, color: "var(--fg-dim)", margin: "0 auto 10px"}}/>
          <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4}}>Select a thread</div>
          <div className="dim" style={{fontSize: 12}}>Click any coach in the left panel to open the conversation.</div>
        </div>
      </Card>
    </div>
  );
};

const AthleteNotes = () => {
  const ctx = React.useContext(CoachCtx);
  const [filter, setFilter] = useState("All");
  const modules = ["All", ...new Set(COACH_NOTES.map(n => n.module))];
  const filtered = filter === "All" ? COACH_NOTES : COACH_NOTES.filter(n => n.module === filter);
  return (
    <div>
      <div style={{display: "flex", gap: 6, marginBottom: 14}}>
        <span className="eyebrow" style={{alignSelf: "center", marginRight: 6}}>Filter</span>
        {modules.map(m => (
          <button key={m} onClick={() => setFilter(m)} className={filter === m ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{m}</button>
        ))}
      </div>
      <div className="col-gap" style={{gap: 8}}>
        {filtered.map(n => {
          const coach = COACHES.find(c => c.id === n.coachId);
          return (
            <Card key={n.id} onClick={() => ctx.open("noteDet", n)} style={{cursor: "pointer"}}>
              <div style={{display: "flex", alignItems: "flex-start", gap: 12}}>
                <div style={{width: 32, height: 32, borderRadius: 6, background: coach?.color, color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11, flexShrink: 0}}>{coach?.avatar}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
                    <span style={{fontSize: 12.5, fontWeight: 600}}>{n.coach}</span>
                    <Pill>{n.module}</Pill>
                    {n.tags.map(t => <Pill key={t}>{t}</Pill>)}
                    <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{n.date}</span>
                  </div>
                  <div className="muted" style={{fontSize: 12, lineHeight: 1.55}}>{n.body}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const AthleteInvites = () => (
  <Card title="Invites" sub="track pending and historical invitations">
    <table className="tbl">
      <thead><tr><th>Name</th><th style={{width: 110}}>Type</th><th style={{width: 110}}>Invited</th><th style={{width: 130}}>Expires</th><th style={{width: 110}}>Status</th><th style={{width: 80, textAlign: "right"}}>Action</th></tr></thead>
      <tbody>
        {PENDING_INVITES.map(i => (
          <tr key={i.id}><td>{i.name}</td><td><Pill>{i.type}</Pill></td><td className="num muted">{i.invitedOn}</td><td className="num">{i.expiry}</td><td><Pill variant="warn">pending</Pill></td><td style={{textAlign: "right"}}><button className="btn btn-sm">Resend</button></td></tr>
        ))}
        <tr><td>Dr. R. Klein</td><td><Pill>Orthopedics</Pill></td><td className="num muted">Mar 12</td><td className="num">accepted</td><td><Pill variant="pos">accepted · ended</Pill></td><td/></tr>
        <tr><td>Dr. P. Holzer</td><td><Pill>Physio</Pill></td><td className="num muted">Feb 2</td><td className="num">declined</td><td><Pill variant="block">declined</Pill></td><td/></tr>
      </tbody>
    </table>
  </Card>
);

// ── PORTAL OVERVIEW ────────────────────────────────────────
const PortalOverview = () => {
  const ctx = React.useContext(CoachCtx);
  const alerts = PORTAL_ATHLETES.filter(a => a.alerts > 0);
  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Active athletes</div><div className="num" style={{fontSize: 22}}>{PORTAL_ATHLETES.length}</div><div className="dim" style={{fontSize: 11}}>+2 last 30d</div></Card>
        <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Median compliance</div><div className="num" style={{fontSize: 22, color: "var(--pos)"}}>91%</div><div className="dim" style={{fontSize: 11}}>30-day rolling</div></Card>
        <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Alerts open</div><div className="num" style={{fontSize: 22, color: "var(--warn)"}}>{PORTAL_ATHLETES.reduce((s,a) => s + a.alerts, 0)}</div><div className="dim" style={{fontSize: 11}}>{alerts.length} athletes affected</div></Card>
        <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">MRR · 30d</div><div className="num" style={{fontSize: 22}}>€4,820</div><div className="dim" style={{fontSize: 11}}>+€420 vs prior 30d</div></Card>
      </div>
      <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
        <Card title="Athletes needing attention" sub={`${alerts.length} with open alerts`}>
          <div className="col-gap" style={{gap: 6}}>
            {alerts.map(a => (
              <div key={a.id} onClick={() => ctx.open("athleteDet", a)} style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer"}}>
                <div style={{width: 30, height: 30, borderRadius: 6, background: "var(--surface-2)", color: "var(--fg-muted)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11, flexShrink: 0}}>{a.avatar}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 12.5, fontWeight: 500}}>{a.name}</div>
                  <div className="dim mono" style={{fontSize: 10}}>{a.plan} · last {a.lastSession}</div>
                </div>
                <Pill variant="warn">{a.alerts} alert{a.alerts === 1 ? "" : "s"}</Pill>
                <span className="num" style={{fontSize: 12, color: a.compliance >= 90 ? "var(--pos)" : a.compliance >= 80 ? "var(--warn)" : "var(--neg)", width: 36, textAlign: "right"}}>{a.compliance}%</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="col-gap" style={{gap: 14}}>
          <Card title="Today's sessions logged" sub="6 of 14">
            <Sparkline data={[2,3,5,4,6,4,5,7,5,6,8,5,6,8]} color="var(--acc-coach)" h={50}/>
            <div className="dim" style={{fontSize: 11, marginTop: 8}}>14 athletes total · 6 trained today · 4 yesterday rest day.</div>
          </Card>
          <Card title="Recent achievements">
            {[
              { who: "Marcus Weber", what: "Deadlift PR · 220 kg ×1", when: "today" },
              { who: "Lukas Bauer", what: "10th week of perfect compliance", when: "yesterday" },
              { who: "Niko Brandt", what: "Squat technique reviewed · cleared", when: "Mon" },
            ].map((a, i) => (
              <div key={i} style={{padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none"}}>
                <div style={{fontSize: 12, fontWeight: 500}}>{a.who}</div>
                <div className="dim" style={{fontSize: 11}}>{a.what} · {a.when}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

const PortalAthletes = () => {
  const ctx = React.useContext(CoachCtx);
  const [sortBy, setSortBy] = useState("recent");
  const [filter, setFilter] = useState("all");
  let sorted = [...PORTAL_ATHLETES];
  if (filter === "alerts") sorted = sorted.filter(a => a.alerts > 0);
  if (sortBy === "compliance") sorted.sort((a, b) => b.compliance - a.compliance);
  if (sortBy === "alerts") sorted.sort((a, b) => b.alerts - a.alerts);
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <input placeholder="Search athletes…" style={{flex: 1, height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["all","All"],["alerts","Alerts only"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} className={filter === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
          <option value="recent">Sort · Recent</option>
          <option value="compliance">Sort · Compliance</option>
          <option value="alerts">Sort · Alerts</option>
        </select>
        <button className="btn"><Icon name="download" className="ic ic-sm"/>Export</button>
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th>Athlete</th>
              <th style={{width: 160}}>Plan</th>
              <th style={{width: 90, textAlign: "right"}}>Compliance</th>
              <th style={{width: 70, textAlign: "right"}}>Alerts</th>
              <th style={{width: 130}}>Last session</th>
              <th style={{width: 130}}>Tags</th>
              <th style={{width: 30}}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a => (
              <tr key={a.id} className="clickable" style={{cursor: "pointer"}} onClick={() => ctx.open("athleteDet", a)}>
                <td>
                  <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <div style={{width: 26, height: 26, borderRadius: 6, background: "var(--surface-2)", color: "var(--fg-muted)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600}}>{a.avatar}</div>
                    <div>
                      <div style={{fontSize: 12.5, fontWeight: 500}}>{a.name}</div>
                      <div className="dim mono" style={{fontSize: 10}}>since {a.since}</div>
                    </div>
                  </div>
                </td>
                <td className="muted" style={{fontSize: 11.5}}>{a.plan}</td>
                <td className="num" style={{textAlign: "right", color: a.compliance >= 90 ? "var(--pos)" : a.compliance >= 80 ? "var(--warn)" : "var(--neg)", fontWeight: 500}}>{a.compliance}%</td>
                <td style={{textAlign: "right"}}>{a.alerts > 0 ? <Pill variant="warn">{a.alerts}</Pill> : <span className="dim">—</span>}</td>
                <td className="num muted">{a.lastSession}</td>
                <td><div style={{display: "flex", gap: 3, flexWrap: "wrap"}}>{a.tags.map(t => <Pill key={t}>{t}</Pill>)}</div></td>
                <td><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const PortalPlans = () => (
  <Card title="Plan library" sub={`${COACH_PLANS.length} reusable plans · ${COACH_PLANS.reduce((s, p) => s + p.assignedTo, 0)} active assignments`} actions={<button className="btn"><Icon name="plus" className="ic ic-sm"/>New plan</button>}>
    <table className="tbl">
      <thead>
        <tr><th>Plan</th><th style={{width: 110}}>Category</th><th style={{width: 90, textAlign: "right"}}>Assigned</th><th style={{width: 80, textAlign: "right"}}>Sold</th><th style={{width: 80, textAlign: "right"}}>Rating</th><th style={{width: 100}}>Updated</th><th style={{width: 30}}></th></tr>
      </thead>
      <tbody>
        {COACH_PLANS.map(p => (
          <tr key={p.id} className="clickable" style={{cursor: "pointer"}}>
            <td style={{fontWeight: 500}}>{p.name}</td>
            <td><Pill>{p.category}</Pill></td>
            <td className="num" style={{textAlign: "right"}}>{p.assignedTo}</td>
            <td className="num muted" style={{textAlign: "right"}}>{p.sells}</td>
            <td className="num" style={{textAlign: "right"}}>{p.rating} ★</td>
            <td className="num muted">{p.lastUpdated}</td>
            <td><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const PortalMessages = () => (
  <Card title="Recent messages · all athletes" sub="7 unread">
    <div className="col-gap" style={{gap: 6}}>
      {[
        { who: "Sophie Klein", body: "Knee felt off in squats today — pulled back to 80kg. Vid attached.", when: "12m ago", unread: true },
        { who: "Lukas Bauer", body: "Hit my 5x5 at 110kg comfortably. Ready to push to 115.", when: "2h ago", unread: true },
        { who: "Marcus Weber", body: "Tomorrow rest day? My recovery is in red.", when: "4h ago", unread: true },
        { who: "Elena Schmidt", body: "Question on RPE 8 vs RIR 2.", when: "yesterday", unread: false },
        { who: "Niko Brandt", body: "PR vid for deadlift, 220kg ×1.", when: "yesterday", unread: false },
      ].map((m, i) => (
        <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer"}}>
          <div style={{width: 28, height: 28, borderRadius: 6, background: "var(--surface-2)", color: "var(--fg-muted)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10}}>{m.who.split(" ").map(x => x[0]).join("")}</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: "flex", alignItems: "center", gap: 6}}>
              <span style={{fontSize: 12.5, fontWeight: 600}}>{m.who}</span>
              {m.unread && <span style={{width: 6, height: 6, borderRadius: 999, background: "var(--acc-coach)", display: "inline-block"}}/>}
              <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{m.when}</span>
            </div>
            <div className="muted" style={{fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{m.body}</div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const PortalRevenue = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
    <Card title="Revenue · 12 months" sub="MRR + plan sales">
      <LineChart h={200} range={[3000, 5500]}
        xLabels={["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"]}
        series={[{ data: [3200, 3500, 3700, 3900, 4100, 4200, 4250, 4350, 4400, 4550, 4700, 4820], color: "var(--acc-mkt)" }]}/>
      <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
        <span>Current MRR <span className="num" style={{color: "var(--fg)"}}>€4,820</span></span>
        <span>YTD <span className="num" style={{color: "var(--fg)"}}>€52,420</span></span>
        <span>Growth <span className="num" style={{color: "var(--pos)"}}>+9.2%</span></span>
      </div>
    </Card>
    <Card title="Revenue split">
      <Row label="Monthly retainers (14 athletes)" value="€3,920"/>
      <Row label="Plan sales (Marketplace)" value="€640"/>
      <Row label="1-off consultations" value="€260"/>
      <div className="divider"/>
      <Row label="Take rate · LumeOS" value="-15%"/>
      <Row label="Net" value="€4,097"/>
    </Card>
  </div>
);

const PortalAlerts = () => (
  <Card title="All open alerts" sub={`${PORTAL_ATHLETES.reduce((s,a)=>s+a.alerts,0)} alerts across ${PORTAL_ATHLETES.filter(a => a.alerts > 0).length} athletes`}>
    {PORTAL_ATHLETES.filter(a => a.alerts > 0).map(a => (
      <div key={a.id} style={{padding: 12, borderBottom: "1px solid var(--border)"}}>
        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
          <span style={{fontSize: 12.5, fontWeight: 600}}>{a.name}</span>
          <Pill variant="warn">{a.alerts} alert{a.alerts === 1 ? "" : "s"}</Pill>
          <Pill>compliance {a.compliance}%</Pill>
        </div>
        <div className="muted" style={{fontSize: 11.5, paddingLeft: 4}}>
          {a.alerts === 1 ? "1 alert · " : "Multiple alerts · "}
          {a.alerts === 1 && "compliance dropped below 80%."}
          {a.alerts === 2 && "compliance dropped + missed weekly session twice."}
        </div>
      </div>
    ))}
  </Card>
);

// ── MODALS ─────────────────────────────────────────────────
const KModal = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 600 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && (
          <div style={{width: 26, height: 26, borderRadius: 6, background: `color-mix(in oklch, ${accent || "var(--acc-coach)"} 18%, transparent)`, border: `1px solid color-mix(in oklch, ${accent || "var(--acc-coach)"} 35%, transparent)`, color: accent || "var(--acc-coach)", display: "grid", placeItems: "center"}}>
            <Icon name={eyebrow} className="ic"/>
          </div>
        )}
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize: 11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY: "auto"}}>{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

const CoachDetailModal = ({ coach: c, onClose }) => (
  <KModal title={c.name} subtitle={`${c.type} coach · ${c.org}`} eyebrow="user" accent={c.color} onClose={onClose} width={680}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
      <button className="btn"><Icon name="message" className="ic ic-sm"/>Message</button>
      <button className="btn btn-ghost" style={{color: "var(--neg)"}}>End coaching</button>
    </>}>
    <div style={{display: "flex", gap: 14, marginBottom: 16}}>
      <div style={{width: 64, height: 64, borderRadius: 14, background: c.color, color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 22, flexShrink: 0}}>{c.avatar}</div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55}}>{c.bio}</div>
      </div>
    </div>
    <div className="grid g-cols-3" style={{gap: 10, marginBottom: 16}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Since</div><div className="num" style={{fontSize: 14}}>{c.since}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Cadence</div><div style={{fontSize: 12}}>{c.cadence}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Fee</div><div className="num" style={{fontSize: 14}}>{c.fee}</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Active plan</div>
    <Card className="card-tight" style={{padding: 12, marginBottom: 14}}>
      <div style={{fontSize: 13, fontWeight: 500, marginBottom: 4}}>{c.activePlan}</div>
      <div className="muted" style={{fontSize: 11.5}}>Assigned by {c.name} · auto-syncs to your active modules</div>
    </Card>
    {window.CoachRelationshipCard && <><div className="eyebrow" style={{marginBottom: 6}}>Relationship</div><div style={{marginBottom: 14}}><window.CoachRelationshipCard coach={c}/></div></>}
    <div className="eyebrow" style={{marginBottom: 6}}>Shared modules</div>
    <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14}}>
      {c.sharedModules.map(m => <Pill key={m}>{m}</Pill>)}
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Last message</div>
    <div style={{padding: 12, background: "var(--surface)", borderRadius: 6, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55}}>
      <span className="dim mono" style={{fontSize: 10, display: "block", marginBottom: 4}}>{c.lastMsgAt}</span>
      {c.lastMsg}
    </div>
  </KModal>
);

const InviteCoachModal = ({ onClose }) => (
  <KModal title="Invite a coach" subtitle="Send a link or generate a QR code" eyebrow="plus" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Send invite</button></>}>
    <div style={{marginBottom: 14}}>
      <div className="eyebrow" style={{marginBottom: 8}}>Coach type</div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6}}>
        {["Training","Nutrition","Supplement","Medical"].map(t => (
          <button key={t} className="btn" style={{height: 36}}>{t}</button>
        ))}
      </div>
    </div>
    <div style={{marginBottom: 14}}>
      <div className="eyebrow" style={{marginBottom: 6}}>Email</div>
      <input placeholder="coach@example.com" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
    </div>
    <div style={{marginBottom: 14}}>
      <div className="eyebrow" style={{marginBottom: 6}}>Personal note (optional)</div>
      <input placeholder="Hey — added you to my LumeOS as Training coach. Let's sync." style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
    </div>
    <div style={{padding: 12, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 10}}>
      Default access on accept: <span style={{color: "var(--fg)"}}>only the module matching their type</span>. You can grant more later in the Permissions tab. Invite link expires in 7 days.
    </div>
    <div style={{padding: 16, background: "var(--surface)", borderRadius: 6, display: "flex", alignItems: "center", gap: 16}}>
      <div style={{width: 80, height: 80, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0}}>
        <div style={{display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 1.5, width: 60, height: 60}}>
          {Array.from({length: 64}).map((_, i) => <div key={i} style={{background: Math.random() > 0.5 ? "var(--fg)" : "transparent"}}/>)}
        </div>
      </div>
      <div>
        <div style={{fontSize: 12, fontWeight: 500, marginBottom: 4}}>QR code</div>
        <div className="dim" style={{fontSize: 11, lineHeight: 1.45}}>Coach scans this in their LumeOS app to accept instantly. No email needed.</div>
      </div>
    </div>
  </KModal>
);

const ScanQRModal = ({ onClose }) => (
  <KModal title="Scan coach QR code" subtitle="Or paste an invite link" eyebrow="camera" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Accept invite</button></>}>
    <div style={{aspectRatio: "4/3", background: "var(--surface-2)", borderRadius: 6, position: "relative", display: "grid", placeItems: "center", marginBottom: 14, border: "1px dashed var(--border)"}}>
      <div style={{position: "absolute", inset: "20%", border: "2px solid var(--acc-coach)", borderRadius: 8}}/>
      <Icon name="camera" className="ic" style={{width: 32, height: 32, color: "var(--fg-dim)"}}/>
    </div>
    <div className="dim" style={{fontSize: 11, textAlign: "center", marginBottom: 14}}>Point camera at QR code or…</div>
    <div className="eyebrow" style={{marginBottom: 6}}>Paste invite link</div>
    <input placeholder="https://lumeos.app/invite/…" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
  </KModal>
);

const MessageThreadModal = ({ coach: c, onClose }) => {
  const [msg, setMsg] = useState("");
  return (
    <KModal title={c.name} subtitle={`${c.type} coach · ${c.cadence}`} eyebrow="message" accent={c.color} onClose={onClose} width={680}
      footer={<>
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Reply…" style={{flex: 1, height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
        <button className="btn btn-primary"><Icon name="arr_r" className="ic ic-sm"/>Send</button>
      </>}>
      <div className="col-gap" style={{gap: 8}}>
        {MESSAGES_THREAD.map(m => (
          <div key={m.id} style={{display: "flex", justifyContent: m.direction === "out" ? "flex-end" : "flex-start"}}>
            <div style={{maxWidth: "75%", padding: "8px 12px", background: m.direction === "out" ? "color-mix(in oklch, var(--acc-coach) 18%, var(--surface))" : "var(--surface)", border: "1px solid var(--border)", borderRadius: 8}}>
              <div className="dim mono" style={{fontSize: 9.5, marginBottom: 2}}>{m.from} · {m.at}</div>
              <div style={{fontSize: 12, lineHeight: 1.5}}>{m.body}</div>
            </div>
          </div>
        ))}
      </div>
    </KModal>
  );
};

const AthleteDetailModal = ({ athlete: a, onClose }) => (
  <KModal title={a.name} subtitle={`${a.plan} · since ${a.since}`} eyebrow="user" onClose={onClose} width={720}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
      <button className="btn"><Icon name="message" className="ic ic-sm"/>Message</button>
      <button className="btn"><Icon name="edit" className="ic ic-sm"/>Assign plan</button>
      <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add note</button>
    </>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Compliance</div><div className="num" style={{fontSize: 18, color: a.compliance >= 90 ? "var(--pos)" : "var(--warn)"}}>{a.compliance}%</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Alerts</div><div className="num" style={{fontSize: 18, color: a.alerts > 0 ? "var(--warn)" : "var(--fg-dim)"}}>{a.alerts}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Last session</div><div className="num" style={{fontSize: 12}}>{a.lastSession}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Tags</div><div style={{display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3}}>{a.tags.map(t => <Pill key={t}>{t}</Pill>)}</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Shared modules (your view)</div>
    <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14}}>
      {["Training","Recovery","Goals"].map(m => <Pill key={m} variant="acc">{m}</Pill>)}
      {["Nutrition","Medical","Supplements"].map(m => <Pill key={m}>hidden</Pill>)}
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Last 4 weeks · Training compliance</div>
    <LineChart h={120} range={[60, 100]}
      xLabels={["wk-3","wk-2","wk-1","this wk"]}
      series={[{ data: [88, 92, 94, a.compliance], color: "var(--acc-train)" }]}/>
    <div className="eyebrow" style={{marginTop: 14, marginBottom: 6}}>Recent notes you've written</div>
    <Card className="card-tight" style={{padding: 12, marginBottom: 8, fontSize: 11.5, color: "var(--fg-muted)"}}>
      <div className="dim mono" style={{fontSize: 10, marginBottom: 4}}>May 13 · Training</div>
      Solid week 2. Bench felt confident, RPE 7-8 throughout. Sending Block 3 progression Mon.
    </Card>
  </KModal>
);

const NoteDetailModal = ({ note: n, onClose }) => {
  const coach = COACHES.find(c => c.id === n.coachId);
  return (
    <KModal title={`Note from ${n.coach}`} subtitle={`${n.module} · ${n.date}`} eyebrow="message" accent={coach?.color} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="message" className="ic ic-sm"/>Reply</button></>}>
      <div style={{padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, lineHeight: 1.6, color: "var(--fg)", marginBottom: 14}}>
        {n.body}
      </div>
      <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>{n.tags.map(t => <Pill key={t}>{t}</Pill>)}</div>
    </KModal>
  );
};

const NewPlanModal = ({ onClose }) => (
  <KModal title="New plan" subtitle="Reusable template · assign to one or many athletes" eyebrow="plus" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn"><Icon name="copy" className="ic ic-sm"/>Save draft</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Create plan</button></>}>
    <div className="eyebrow" style={{marginBottom: 4}}>Plan name</div>
    <input placeholder="e.g. Hypertrophy block · 5 weeks" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, marginBottom: 12}}/>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12}}>
      <div>
        <div className="eyebrow" style={{marginBottom: 4}}>Category</div>
        <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
          <option>Training</option><option>Nutrition</option><option>Recovery</option><option>Combined</option>
        </select>
      </div>
      <div>
        <div className="eyebrow" style={{marginBottom: 4}}>Duration</div>
        <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
          <option>4 weeks</option><option>5 weeks</option><option>6 weeks</option><option>8 weeks</option><option>12 weeks</option>
        </select>
      </div>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Starting template</div>
    <div className="col-gap" style={{gap: 4}}>
      <button className="btn" style={{justifyContent: "flex-start", textAlign: "left"}}>Empty plan · start from scratch</button>
      <button className="btn" style={{justifyContent: "flex-start", textAlign: "left"}}>Clone existing · PPL Block 3</button>
      <button className="btn" style={{justifyContent: "flex-start", textAlign: "left"}}>Import from Marketplace</button>
    </div>
  </KModal>
);



// ── Coach Portal · standalone surface (coach.lumeos.app · port 5600) ──
// Coach-only. No athlete "my coaches" data lives here.
const CoachPortalStandalone = () => {
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({type, payload});
  const close = () => setModal(null);
  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Coach Portal</span>
            <Pill variant="acc">separate platform</Pill>
            <Pill className="mono" style={{fontSize: 10}}>coach.lumeos.app</Pill>
            <Pill>{PORTAL_ATHLETES.length} athletes</Pill>
            <Pill><Icon name="alert" className="ic ic-sm"/>{PORTAL_ATHLETES.reduce((s,a) => s + a.alerts, 0)} alerts</Pill>
          </div>
          <div className="module-sub">Coach workspace · read-only on client data · every call permission-checked</div>
        </div>
        <div className="module-actions">
          <button className="btn"><Icon name="message" className="ic ic-sm"/>Broadcast</button>
          <button className="btn btn-primary" onClick={() => open("newPlan")}><Icon name="plus" className="ic ic-sm"/>New plan</button>
        </div>
      </div>
      <Tabs items={[
        { id: "overview",  label: "Overview" },
        { id: "athletes",  label: "Athletes",  count: PORTAL_ATHLETES.length },
        { id: "analytics", label: "Analytics" },
        { id: "alerts",    label: "Smart alerts", count: 7 },
        { id: "rules",     label: "Rules", count: 6 },
        { id: "autonomy",  label: "Autonomy" },
        { id: "patterns",  label: "Patterns" },
        { id: "intervene", label: "Interventions" },
        { id: "consent",   label: "Consent" },
        { id: "plans",     label: "Plans",  count: COACH_PLANS.length },
        { id: "workflows", label: "Workflows", count: 4 },
        { id: "onboard",   label: "Client onboarding" },
        { id: "programs",  label: "Programs", count: 4 },
        { id: "messages",  label: "Messages", count: 7 },
        { id: "revenue",   label: "Revenue" },
        { id: "team",      label: "Team & Audit" },
      ]} active={tab} onChange={setTab}/>
      <CoachCtx.Provider value={{ open, close }}>
      {tab === "overview"  && <><PortalOverview/>{window.ClientDashboardCard && <div style={{marginTop: 14}}><div className="eyebrow" style={{marginBottom: 8}}>Client focus · highest attention score</div><window.ClientDashboardCard/></div>}</>}
      {tab === "athletes"  && (window.PortalAthletesV2 ? <window.PortalAthletesV2/> : <PortalAthletes/>)}
      {tab === "analytics" && window.CoachPortalAnalytics && <window.CoachPortalAnalytics/>}
      {tab === "alerts"    && window.CoachPortalSmartAlerts && <window.CoachPortalSmartAlerts/>}
      {tab === "rules"     && window.CoachPortalRules && <window.CoachPortalRules/>}
      {tab === "autonomy"  && window.CoachPortalAutonomy && <window.CoachPortalAutonomy/>}
      {tab === "patterns"  && window.PatternAnalysisView && <window.PatternAnalysisView/>}
      {tab === "intervene" && window.InterventionEngineView && <window.InterventionEngineView/>}
      {tab === "consent"   && window.ConsentFlowView && <window.ConsentFlowView/>}
      {tab === "plans"     && <PortalPlans/>}
      {tab === "workflows" && window.PortalWorkflows && <window.PortalWorkflows/>}
      {tab === "onboard"   && window.PortalClientOnboarding && <window.PortalClientOnboarding/>}
      {tab === "programs"  && window.PortalPrograms && <window.PortalPrograms/>}
      {tab === "messages"  && <PortalMessages/>}
      {tab === "revenue"   && <PortalRevenue/>}
      {tab === "team"      && <>{window.CoachPortalTeam && <window.CoachPortalTeam/>}{window.AuditLogV2 && <div style={{marginTop: 14}}><window.AuditLogV2/></div>}</>}
      </CoachCtx.Provider>
      {modal?.type === "athleteDet" && (window.AthleteDetailEnhanced ? <window.AthleteDetailEnhanced athlete={modal.payload} onClose={close}/> : null)}
      {modal?.type === "newPlan"    && <NewPlanModal onClose={close}/>}
      {window.CoachExtrasLauncher && <window.CoachExtrasLauncher/>}
    </>
  );
};
window.CoachPortalStandalone = CoachPortalStandalone;

window.CoachCtx = CoachCtx;
window.COACHES = COACHES;
window.CoachModule = CoachModule;
window.PORTAL_ATHLETES = PORTAL_ATHLETES;
