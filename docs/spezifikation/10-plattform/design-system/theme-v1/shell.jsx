// App shell: sidebar + topbar + context panel

const MODULES = [
  { id: "dashboard",   label: "Dashboard",   icon: "dashboard",   accent: "var(--acc-dash)",  shortcut: "1" },
  { id: "nutrition",   label: "Nutrition",   icon: "nutrition",   accent: "var(--acc-nutri)", shortcut: "2" },
  { id: "training",    label: "Training",    icon: "training",    accent: "var(--acc-train)", shortcut: "3" },
  { id: "recovery",    label: "Recovery",    icon: "recovery",    accent: "var(--acc-recov)", shortcut: "4" },
  { id: "supplements", label: "Supplements", icon: "supplements", accent: "var(--acc-suppl)", shortcut: "5" },
  { id: "goals",       label: "Goals & Body",icon: "goals",       accent: "var(--acc-goals)", shortcut: "6" },
  { id: "medical",     label: "Medical",     icon: "medical",     accent: "var(--acc-medic)", shortcut: "7" },
  { id: "coach",       label: "Coach",       icon: "coach",       accent: "var(--acc-coach)", shortcut: "8",
    sub: [
      { id: "coach-human", label: "Human Coaches", icon: "user" },
      { id: "coach-ai",    label: "AI Coach",      icon: "buddy", accent: "var(--acc-buddy)" },
    ] },
];
// Flat resolver: sub-entries are first-class routes for topbar, accent and context.
function resolveNav(id) {
  for (const m of MODULES) {
    if (m.id === id) return m;
    if (m.sub) { const hit = m.sub.find(s => s.id === id); if (hit) return { ...hit, accent: hit.accent || m.accent, parent: m.label }; }
  }
  return APPS.find(a => a.id === id) || MODULES[0];
}

const APPS = [
  { id: "portal",      label: "Coach Portal", icon: "coach",       accent: "var(--acc-coach)", external: "coach.lumeos.app" },
  { id: "marketplace", label: "Marketplace",  icon: "marketplace", accent: "var(--acc-mkt)" },
  { id: "admin",       label: "Admin",        icon: "admin",       accent: "var(--acc-admin)" },
];

const Sidebar = ({ active, setActive }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">L</div>
        <div className="brand-name">LumeOS</div>
        <a href="LumeOS Overview.html" className="brand-meta" title="Open system overview" style={{textDecoration: "none"}}>v0.9.4 ↗</a>
      </div>
      <div className="sidebar-search">
        <input placeholder="Search or jump to…" />
        <span className="kbd">⌘K</span>
      </div>
      <div className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-label">Modules</div>
          {MODULES.map(m => (
            <React.Fragment key={m.id}>
            <div
              className={`nav-item ${active === m.id || (m.sub && m.sub.some(s => s.id === active)) ? "active" : ""}`}
              onClick={() => setActive(m.sub ? m.sub[0].id : m.id)}
              style={{"--mod-acc": m.accent}}
            >
              <span className="nav-icon"><Icon name={m.icon} className="ic" /></span>
              {m.label}
              {(m.id === active || (m.sub && m.sub.some(s => s.id === active))) ? null : <span className="accent-dot" />}
              <kbd>{m.shortcut}</kbd>
            </div>
            {m.sub && m.sub.some(s => s.id === active) && (
              <div className="nav-sub-group">
                {m.sub.map(s => (
                  <div
                    key={s.id}
                    className={`nav-item nav-sub ${active === s.id ? "active" : ""}`}
                    onClick={() => setActive(s.id)}
                    style={{"--mod-acc": s.accent || m.accent}}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            )}
            </React.Fragment>
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-group-label">Workspaces</div>
          {APPS.map(m => (
            <div
              key={m.id}
              className={`nav-item ${active === m.id ? "active" : ""}`}
              onClick={() => setActive(m.id)}
              style={{"--mod-acc": m.accent}}
            >
              <span className="nav-icon"><Icon name={m.icon} className="ic" /></span>
              {m.label}
              <span className="accent-dot" />
            </div>
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-group-label">System</div>
          <div className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent("open-onboarding-test"))} style={{cursor: "pointer"}}>
            <span className="nav-icon"><Icon name="play" className="ic" /></span>
            Test · Onboarding
          </div>
          <div className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent("open-profile-settings"))} style={{cursor: "pointer"}}>
            <span className="nav-icon"><Icon name="settings" className="ic" /></span>
            Settings
          </div>
        </div>
      </div>
      <div className="sidebar-user">
        <div className="avatar" onClick={() => window.dispatchEvent(new CustomEvent("open-profile-settings"))} style={{cursor: "pointer"}}>TM</div>
        <div className="user-meta">
          <div className="user-name">Tom Müller</div>
          <div className="user-status">athlete · pro</div>
        </div>
        <UserMenu />
      </div>
    </aside>
  );
};

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);
  const go = (evt) => { setOpen(false); window.dispatchEvent(new CustomEvent(evt)); };
  const items = [
    { label: "Profile", icon: "settings", act: () => go("open-profile-settings") },
    { label: "Units & locale", icon: "settings", act: () => go("open-profile-settings") },
    { label: "Privacy & sharing", icon: "settings", act: () => go("open-profile-settings") },
    { label: "Data sources", icon: "training", act: () => go("open-profile-settings") },
    { sep: true },
    { label: "Subscription · Pro", icon: "marketplace", act: () => go("open-profile-settings") },
    { label: "Export all data", icon: "download", act: () => setOpen(false) },
    { sep: true },
    { label: "Sign out", icon: "x", danger: true, act: () => setOpen(false) },
  ];
  return (
    <div style={{position: "relative"}} onClick={e => e.stopPropagation()}>
      <button className="icon-btn" onClick={() => setOpen(o => !o)}><Icon name="more" className="ic" /></button>
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", right: 0, minWidth: 190,
          background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 8,
          boxShadow: "0 12px 32px rgba(0,0,0,0.35)", padding: 4, zIndex: 60,
        }}>
          {items.map((it, i) => it.sep ? (
            <div key={i} style={{height: 1, background: "var(--border)", margin: "4px 0"}} />
          ) : (
            <button key={i} onClick={it.act} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "7px 10px", borderRadius: 5, fontSize: 12,
              color: it.danger ? "var(--neg)" : "var(--fg-muted)", textAlign: "left", cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name={it.icon} className="ic ic-sm" />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Topbar = ({ moduleLabel, moduleId, syncState, onToggleTheme, theme, onToggleRight, rightOpen }) => {
  return (
    <div className="topbar">
      <div className="breadcrumb">
        <span className="mod-tag">{moduleId.toUpperCase()}</span>
        <span className="crumb">Workspace</span>
        <span className="sep">/</span>
        <span className="crumb current">{moduleLabel}</span>
      </div>
      <div className="topbar-actions">
        <div className="pill" style={{borderColor: "var(--border)"}}>
          <span className="dot" style={{background: syncState === "synced" ? "var(--pos)" : "var(--warn)"}} />
          {syncState === "synced" ? "Synced" : "Offline · queued"}
        </div>
        <button className="icon-btn" title="Notifications"><Icon name="bell" className="ic" /></button>
        <div title="Theme" style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          <button
            onClick={() => onToggleTheme && theme !== "light" && onToggleTheme()}
            title="Light mode"
            style={{
              width: 24, height: 22, borderRadius: 4,
              background: theme === "light" ? "var(--fg)" : "transparent",
              color: theme === "light" ? "var(--bg)" : "var(--fg-muted)",
              display: "grid", placeItems: "center", cursor: "pointer"
            }}><Icon name="sun" className="ic ic-sm" /></button>
          <button
            onClick={() => onToggleTheme && theme !== "dark" && onToggleTheme()}
            title="Dark mode"
            style={{
              width: 24, height: 22, borderRadius: 4,
              background: theme === "dark" ? "var(--fg)" : "transparent",
              color: theme === "dark" ? "var(--bg)" : "var(--fg-muted)",
              display: "grid", placeItems: "center", cursor: "pointer"
            }}><Icon name="moon" className="ic ic-sm" /></button>
        </div>
        <button className="icon-btn" title="Toggle context panel" onClick={onToggleRight}>
          <Icon name="layers" className="ic" />
        </button>
        <button className="btn"><Icon name="command" className="ic ic-sm" /> Commands</button>
      </div>
    </div>
  );
};

// Context panel — adapts per module
const ContextPanel = ({ moduleId, onCloseInsight, dismissed = [] }) => {
  const [buddyState, setBuddyState] = useState("idle");

  useEffect(() => {
    // Cycle through states subtly
    const seq = ["idle", "idle", "thinking", "responding", "idle"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % seq.length;
      setBuddyState(seq[i]);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const ctxKey = { "coach-human": "coach", "coach-ai": "buddy", "portal": "coach" }[moduleId] || moduleId;
  const rawCtx = CONTEXT_DATA[ctxKey] || CONTEXT_DATA.dashboard;
  const ctx = typeof rawCtx === "function" ? rawCtx() : rawCtx;
  const ctxLabel = resolveNav(moduleId).label;

  return (
    <aside className="context">
      <div className="ctx-h">
        <div className="ctx-h-title">
          <Icon name="sparkles" className="ic ic-sm" style={{color: "var(--acc-buddy)"}} />
          Context · {ctxLabel}
        </div>
        <div className="ctx-h-actions">
          <button className="icon-btn"><Icon name="pin" className="ic ic-sm" /></button>
          <button className="icon-btn"><Icon name="more" className="ic ic-sm" /></button>
        </div>
      </div>
      <div className="ctx-body">
        <div className="orb-wrap">
          <BuddyOrb state={buddyState} size={84} />
          <div className="orb-status">
            <span className="dot" style={{background: "var(--pos)", marginRight: 6}} />
            Buddy · {buddyState}
          </div>
          <div className="orb-msg">{ctx.buddyMsg}</div>
          <div style={{display: "flex", gap: 6, marginTop: 4}}>
            <button className="btn"><Icon name="message" className="ic ic-sm" /> Ask</button>
            <button className="btn btn-ghost">View memory</button>
          </div>
        </div>

        <div>
          <div className="ctx-section-title">
            <Icon name="zap" className="ic ic-sm" />
            Quick actions
          </div>
          <div className="qa-grid">
            {ctx.actions.map((a, i) => (
              <button key={i} className="qa">
                <Icon name={a.icon} />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="ctx-section-title">
            <Icon name="alert" className="ic ic-sm" />
            Insights
            <span className="count num" style={{marginLeft: "auto", fontSize: 10, color: "var(--fg-dim)"}}>{ctx.insights.filter((_, i) => !dismissed.includes(i)).length}</span>
          </div>
          <div className="col-gap" style={{gap: 8}}>
            {ctx.insights.map((ins, i) => dismissed.includes(i) ? null : (
              <div key={i} className={`insight ${ins.variant || ""}`}>
                <div className="insight-mark" />
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="insight-title">{ins.title}</div>
                  <div className="insight-body">{ins.body}</div>
                  <div className="insight-actions">
                    {ins.actions && ins.actions.map((a, j) => (
                      <button key={j} className={`btn ${j === 0 ? "btn-accent" : "btn-ghost"}`} style={{height: 22, fontSize: 11, padding: "0 8px"}}>{a}</button>
                    ))}
                    <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => onCloseInsight(i)}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="ctx-section-title">
            <Icon name="layers" className="ic ic-sm" />
            Module details
          </div>
          <Card className="card-tight">
            {ctx.details.map((d, i) => <Row key={i} label={d.label} value={d.value} />)}
          </Card>
        </div>
      </div>
    </aside>
  );
};

// Per-module context data
const CONTEXT_DATA = {
  dashboard: {
    buddyMsg: "Good morning. You're 78% to today's protein target and well-recovered.",
    actions: [
      { icon: "plus", label: "Log meal" },
      { icon: "training", label: "Start workout" },
      { icon: "recovery", label: "Recovery check" },
      { icon: "supplements", label: "Mark stack" },
    ],
    insights: [
      { variant: "", title: "Recovery trending up", body: "HRV avg 64ms over last 7 days, +4ms vs prior week. Good window for intensity.", actions: ["See data"] },
      { variant: "warn", title: "Hydration below baseline", body: "1.2L logged by 13:00 — 38% behind your 14-day average. Suggest +600ml before training.", actions: ["Log water"] },
    ],
    details: [
      { label: "Date", value: "Sat, May 16" },
      { label: "Streak", value: "23 days" },
      { label: "Last sync", value: "2m ago" },
      { label: "Data sources", value: "4 active" },
    ],
  },
  nutrition: {
    buddyMsg: "Carbs are running 38% — consider a starchy lunch to support tonight's session.",
    actions: [
      { icon: "camera", label: "MealCam" },
      { icon: "search", label: "Search food" },
      { icon: "copy", label: "Same as yesterday" },
      { icon: "bookmark", label: "Favorites" },
    ],
    insights: [
      { variant: "warn", title: "Vitamin D under target", body: "7-day avg: 12µg (target 20µg). 600 IU supplement recommended.", actions: ["Add to stack"] },
      { variant: "", title: "Pre-workout window open", body: "Training at 18:00. Suggest 60g carbs + 25g protein by 16:30.", actions: ["See suggestions"] },
    ],
    details: [
      { label: "Tracking mode", value: "138 nutrients" },
      { label: "Today's meals", value: "3 of 5" },
      { label: "Food DB entries", value: "BLS 4.0 · 7.140" },
      { label: "Last MealCam", value: "08:42" },
    ],
  },
  training: {
    buddyMsg: "Tonight's session is Push B. Your bench is +2.5kg from last week — primed for a PR attempt.",
    actions: [
      { icon: "play", label: "Start workout" },
      { icon: "calendar", label: "View plan" },
      { icon: "trend_up", label: "PR tracker" },
      { icon: "edit", label: "Edit routine" },
    ],
    insights: [
      { variant: "pos", title: "Volume target on track", body: "Chest: 14 of 16 weekly sets logged. Quads ahead at 18 of 16.", actions: ["See breakdown"] },
      { variant: "", title: "Deload window in 9 days", body: "Mesocycle 3 ends Mon · planning ramp-down volume for w/e May 25.", actions: ["Plan deload"] },
    ],
    details: [
      { label: "Active plan", value: "PPL · Block 3" },
      { label: "Streak", value: "4 days" },
      { label: "Sync mode", value: "Offline-first" },
      { label: "Wearables", value: "Garmin · Polar" },
    ],
  },
  recovery: () => {
    const W = typeof window !== "undefined" ? window : {};
    const CI = W.CHECKIN, SD = W.SLEEP_DATA, HB = W.HRV_BASELINE, MS = W.MUSCLE_STATE, ML = W.MUSCLE_LABEL;
    if (!CI || typeof W.calcRecoveryScore !== "function") {
      return { buddyMsg: "Recovery engine loading\u2026", actions: [{ icon: "edit", label: "Morning check-in" }], insights: [], details: [] };
    }
    const sc = W.calcRecoveryScore("hrv");
    const rd = W.readinessFor(sc.score);
    const ot = W.evaluateOvertraining();
    const hrv = W.calcHRVScore(CI.hrv_rmssd);
    const sleepW = W.calcSleepScore(SD, CI);
    const worst = Object.entries(MS).map(([slug, st]) => ({
      slug, label: ML[slug],
      v: W.calcMuscleRecovery({ hours: st.hours, sets: st.sets, sleepQuality: CI.sleep_quality, proteinPct: 0.79, caloriePct: 0.68, soreness: st.soreness }).value,
      st,
    })).sort((a, b) => a.v - b.v)[0];
    return {
      buddyMsg: `Score ${sc.score} \u00b7 ${rd.label.toLowerCase()}. HRV ${CI.hrv_rmssd} ms is ${hrv.z >= 0 ? "+" : ""}${hrv.z} SD from baseline. ${rd.advice}.`,
      actions: [
        { icon: "edit", label: "Morning check-in" },
        { icon: "camera", label: "Measure HRV" },
        { icon: "droplet", label: "Log modality" },
        { icon: "recovery", label: "Muscle map" },
      ],
      insights: [
        {
          variant: hrv.z >= 0 ? "pos" : "warn",
          title: hrv.z >= 0 ? "HRV above baseline" : "HRV below baseline",
          body: `${CI.hrv_rmssd} ms vs ${HB.avg_rmssd} baseline \u00b7 z ${hrv.z >= 0 ? "+" : ""}${hrv.z} \u2192 HRV score ${hrv.score}.`,
          actions: ["See trend"],
        },
        worst && {
          variant: worst.v < 50 ? "neg" : worst.v < 80 ? "warn" : "pos",
          title: `${worst.label} at ${worst.v}%`,
          body: `${worst.st.hours}h since ${worst.st.lastSession}, soreness ${worst.st.soreness}/3, protein at 79% of target.`,
          actions: ["Open muscle"],
        },
        {
          variant: ot.severity === "normal" ? "" : "warn",
          title: `${ot.count} of 8 overtraining signals`,
          body: ot.severity === "normal"
            ? "Within normal noise. Severity stays normal below 3 signals."
            : `Severity ${ot.severity}. ${ot.count >= 5 ? "Deload week recommended." : "Worth watching."}`,
          actions: ["View panel"],
        },
      ].filter(Boolean),
      details: [
        { label: "Recovery score", value: `${sc.score} \u00b7 ${rd.label.toLowerCase()}` },
        { label: "HRV \u00b7 RMSSD", value: `${CI.hrv_rmssd} ms \u00b7 z ${hrv.z >= 0 ? "+" : ""}${hrv.z}` },
        { label: "Sleep", value: `${Math.floor(SD.total_sleep_minutes / 60)}h ${SD.total_sleep_minutes % 60}m \u00b7 score ${sleepW.score}` },
        { label: "Modality bonus", value: `+${sc.bonus.capped} of ${W.MAX_DAILY_BONUS}` },
      ],
    };
  },
  // Stubs for other modules
  supplements: {
    buddyMsg: "Pre-workout dose in 4h 02m — Beta-Alanine + Caffeine. Omega-3 runs out on May 26; auto-refill recommended.",
    actions: [
      { icon: "check", label: "Mark next dose taken" },
      { icon: "plus", label: "Log skip" },
      { icon: "download", label: "Order refills" },
      { icon: "search", label: "Find supplement" },
    ],
    insights: [
      { variant: "warn", title: "Omega-3 running low", body: "8 of 60 softgels left — refill due May 26 (current pace). Nordic Naturals subscription saves ~€7/mo.", actions: ["Reorder"] },
      { variant: "", title: "Ashwagandha cycle · week 5 of 8", body: "3 weeks until scheduled 2-week off-cycle. Caffeine cycle ends same week — consider staggering to avoid simultaneous washout.", actions: ["See cycles"] },
      { variant: "pos", title: "Compliance 94% · 30d", body: "Highest streak: Omega-3 (504d). Lowest: Beta-Alanine (88%) — typically tied to skipped pre-workout meals.", actions: ["Review skips"] },
    ],
    details: [
      { label: "Active stack", value: "8 items" },
      { label: "Compliance 30d", value: "94%" },
      { label: "Monthly spend", value: "€87.10" },
      { label: "Interactions", value: "1 moderate · 1 low" },
    ],
  },
  goals: {
    buddyMsg: "Body comp goal · 61% to target. Pace is sustainable if 94% nutrition adherence holds through August.",
    actions: [
      { icon: "plus", label: "Log weight" },
      { icon: "edit", label: "Update measurements" },
      { icon: "camera", label: "Photo session" },
      { icon: "plus", label: "New goal" },
    ],
    insights: [
      { variant: "pos", title: "Recomposition working", body: "Lean mass +0.5 kg / 30d while body fat -1.6 % / 60d. Rare to nail both — credit consistent training + supplements + sleep.", actions: ["Open goal"] },
      { variant: "warn", title: "Meditation habit behind", body: "28 of 60 sessions logged · 8 sessions behind a linear pace. Deadline Jun 22 needs +5/wk for the next 5 weeks.", actions: ["Open goal"] },
      { variant: "", title: "Bench 1RM ahead of schedule", body: "+12.5 kg in 14 weeks — 1.5 kg ahead of plan. Buddy suggests holding 1RM attempts to keep ramp safe.", actions: ["See chart"] },
    ],
    details: [
      { label: "Active goals", value: "4 (1 ahead · 2 on-track · 1 behind)" },
      { label: "Weight", value: "79.4 kg · -1.1 in 30d" },
      { label: "Body fat", value: "13.8% · -1.6 in 60d" },
      { label: "Closed in 90d", value: "3" },
    ],
  },
  medical: {
    buddyMsg: "Next Endo appt in 5 days · Jul 15. Fasting glucose 102 mg/dL trending up since MK-677 start — flagged for earlier panel.",
    actions: [
      { icon: "plus", label: "Add labs" },
      { icon: "camera", label: "Upload doc" },
      { icon: "calendar", label: "Book appt" },
      { icon: "trend_up", label: "Trends" },
    ],
    insights: [
      { variant: "warn", title: "Fasting glucose out of range", body: "102 mg/dL · range 70–99. Up from 88 pre-MK-677. Buddy suggests pulling next panel 4 weeks forward.", actions: ["Schedule earlier", "Open lab"] },
      { variant: "warn", title: "Hematocrit on watch · 48%", body: "TRT-associated rise (range 39–50). Re-test at Jul 15 panel — donate blood if hits 49%.", actions: ["Open lab"] },
      { variant: "", title: "Q3 panel due in 60 days", body: "18 markers planned · MVZ Lab Berlin · fasting required. Calendar already holds Jul 15 slot.", actions: ["Confirm slot"] },
    ],
    details: [
      { label: "Health score", value: "76 / 100 · good" },
      { label: "Biomarkers tracked", value: "44 · LOINC" },
      { label: "Non-optimal", value: "18 of 44" },
      { label: "Next panel", value: "31d overdue" },
    ],
  },
  coach: {
    buddyMsg: "1 unread from Jana (Nutrition). Anders sent a Bench tweak yesterday. All 4 coaches active.",
    actions: [
      { icon: "message", label: "Open messages" },
      { icon: "plus", label: "Invite coach" },
      { icon: "edit", label: "Edit permissions" },
      { icon: "user", label: "Open profile" },
    ],
    insights: [
      { variant: "", title: "Cross-coach coordination", body: "Anders flagged a 16:30 training time shift. Jana already adjusted your pre-workout window — sync.", actions: ["See note"] },
      { variant: "warn", title: "Ashwagandha cycle change", body: "David recommends starting off-cycle Jun 9. Caffeine cycle ends same week — staggering note added.", actions: ["Open thread"] },
      { variant: "pos", title: "Coach activity strong", body: "42 notes / 86 messages in 30d. Bench PR + TRT stability both attributed to coordinated coaching.", actions: ["View activity"] },
    ],
    details: [
      { label: "Active coaches", value: "4 of 4 categories" },
      { label: "Monthly fee", value: "€417" },
      { label: "Unread messages", value: "1" },
      { label: "Pending invites", value: "1 · Sarah Müller" },
    ],
  },
  buddy: {
    buddyMsg: "You're chatting with me. Friend persona. Autonomy L3. Memory has 12 facts about you.",
    actions: [{icon: "message", label: "New chat"}, {icon: "brain", label: "Memory"}, {icon: "edit", label: "Personality"}, {icon: "settings", label: "Settings"}],
    insights: [
      { variant: "", title: "6 insights in feed", body: "Pre-workout window, glucose trend, PR celebration, sleep onset pattern, cold plunge effect, supplement streak.", actions: ["Open feed"] },
      { variant: "pos", title: "Autonomy L3 · collaborative", body: "I act on low-risk decisions independently, confirm changes with you. Lift to L4 when you're ready.", actions: ["Adjust"] },
    ],
    details: [{label: "Persona", value: "Friend"}, {label: "Autonomy", value: "L3 · collaborative"}, {label: "Memory", value: "12 facts"}, {label: "Decisions/wk", value: "23"}],
  },
  marketplace: {
    buddyMsg: "3 saved items dropped in price. Nordic Naturals quarterly auto-renews Jul 28 (€38.50).",
    actions: [{icon: "search", label: "Browse"}, {icon: "bookmark", label: "Saved"}, {icon: "trend_up", label: "Trending"}, {icon: "download", label: "Orders"}],
    insights: [
      { variant: "warn", title: "Omega-3 refill due", body: "8 of 60 softgels left. Nordic Naturals subscription saves €7/mo.", actions: ["Order"] },
      { variant: "", title: "Seller earnings · May", body: "€2,420 · +18% vs prior 30d. Net €2,057 after Lumeos take.", actions: ["Open seller"] },
    ],
    details: [{label: "Active subs", value: "3 · €338.50/mo"}, {label: "Wishlist", value: "23 items"}, {label: "Orders 90d", value: "4"}, {label: "Seller status", value: "verified · 4.8★"}],
  },
  admin: {
    buddyMsg: "3 mod queue items · 1 critical (DMAA product). All systems operational. Uptime 99.98%.",
    actions: [{icon: "search", label: "Users"}, {icon: "alert", label: "Reports"}, {icon: "trend_up", label: "Analytics"}, {icon: "settings", label: "System"}],
    insights: [
      { variant: "neg", title: "DMAA product flagged", body: "MiracleFit Powder auto-detected with banned ingredient (DMAA). Remove immediately.", actions: ["Remove"] },
      { variant: "pos", title: "Growth strong", body: "DAU +3.2% wow · 12,402 active. MRR +5.6% wow.", actions: ["Open analytics"] },
    ],
    details: [{label: "DAU", value: "12,402"}, {label: "MAU", value: "48,920"}, {label: "Uptime 30d", value: "99.98%"}, {label: "Open mod", value: "3 · 1 critical"}],
  },
};

Object.assign(window, { Sidebar, Topbar, ContextPanel, MODULES, APPS, CONTEXT_DATA });
