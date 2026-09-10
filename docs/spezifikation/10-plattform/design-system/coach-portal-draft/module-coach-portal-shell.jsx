// Coach Portal — standalone platform shell (coach.lumeos.app)
// Sidebar carries parents only; children live in the content sub-nav.

const CP_NAV = [
  { grp: "Coaching", items: [
    { id: "overview",  label: "Dashboard",   icon: "dashboard" },
    { id: "athletes",  label: "Athletes",    icon: "user",     badge: "14" },
    { id: "checkins",  label: "Check-ins",   icon: "message",  badge: "7" },
    { id: "assist",    label: "Assistant",   icon: "brain" },
  { id: "calendar",  label: "Calendar",    icon: "calendar" },
  ]},
  { grp: "Delivery", items: [
    { id: "plans",     label: "Plans",       icon: "workord" },
    { id: "library",   label: "Library",     icon: "layers" },
    { id: "alerts",    label: "Alerts",      icon: "alert",    badge: "7", badgeVariant: "warn" },
  ]},
  { grp: "Insight", items: [
    { id: "analytics", label: "Analytics",   icon: "trend_up" },
  ]},
  { grp: "Practice", items: [
    { id: "inbox",     label: "Notifications", icon: "bell",   badge: "12" },
    { id: "team",      label: "Team & audit",  icon: "shield" },
  ]},
];


const CP_META = {
  overview: { icon: "dashboard", pills: [["acc","14 athletes"],["","11 on track"],["warn","5 in queue"]], actions: [["message","Broadcast"],["plus","New plan"]] },
  athletes: { icon: "user",      pills: [["acc","14 active"],["","6 full access"],["warn","2 need decision"]], actions: [["plus","Invite client"],["download","Export"]] },
  checkins: { icon: "message",   pills: [["acc","7 received"],["warn","2 overdue"],["","3.2 h avg"]], actions: [["edit","Templates"],["message","Reply next"]] },
  assist:   { icon: "brain",     pills: [["acc","clone live · 6"],["","18 drafts · 7d"],["pos","4.8 h saved"]], actions: [["settings","Per-client"],["check","Approve queue"]] },
  calendar: { icon: "calendar",  pills: [["acc","8 events"],["warn","Thu overloaded"]], actions: [["plus","New event"]] },
  plans:    { icon: "workord",   pills: [["acc","6 templates"],["","4 live"],["warn","2 expiring"]], actions: [["plus","New plan"],["workord","Builder"]] },
  library:  { icon: "layers",    pills: [["acc","6 exercises"],["","6 recipes"],["warn","2 no video"]], actions: [["plus","New exercise"],["camera","Add video"]] },
  alerts:   { icon: "alert",     pills: [["neg","1 critical"],["warn","2 high"],["","4 lower"]], actions: [["settings","Rule builder"]] },
  analytics:{ icon: "trend_up",  pills: [["pos","retention 92 %"],["","4.8 ★"],["","87 % goals"]], actions: [["download","Export"]] },
  inbox:    { icon: "bell",      pills: [["acc","5 unread"],["","42 this week"]], actions: [["check","Mark all read"]] },
  team:     { icon: "shield",    pills: [["acc","5 members"],["","1,420 audit entries"]], actions: [["plus","Invite member"]] },
};

// section id → { title, sub, children:[{id,label}] }
const CP_SECTIONS = {
  overview: { title: "Dashboard", sub: "Roster health, attention scores and today's activity", children: null },
  athletes: { title: "Athletes", sub: "14 active clients", children: [
    { id: "athletes",  label: "Roster" },
    { id: "record",    label: "Full record" },
    { id: "notes",     label: "Client notes" },
    { id: "onboard",   label: "Onboarding" },
    { id: "autonomy",  label: "Autonomy levels" },
    { id: "autohist",  label: "Autonomy history" },
    { id: "adherence", label: "Adherence" },
    { id: "consent",   label: "Consent & access" },
  ]},
  checkins: { title: "Check-ins", sub: "Messages and guided review flows", children: [
    { id: "messages",  label: "Messages" },
    { id: "workflows", label: "Review workflows" },
    { id: "chkedit",   label: "Check-in templates" },
  ]},
  assist:   { title: "Assistant", sub: "Triage, drafting, memory and everything it does on your behalf", children: [
    { id: "assist",     label: "Triage & chat" },
    { id: "as-clone",   label: "Your clone" },
    { id: "as-client",  label: "Per-client setup" },
    { id: "as-ident",   label: "Identity" },
    { id: "as-dec",     label: "Decisions" },
    { id: "as-brief",   label: "Briefings" },
    { id: "as-voice",   label: "Voice notes" },
    { id: "as-method",  label: "Method memory" },
    { id: "as-butler",  label: "Portal actions" },
    { id: "as-watch",   label: "Roster watcher" },
    { id: "as-tone",    label: "Tone calibration" },
    { id: "as-guard",   label: "Guardrails" },
    { id: "as-cost",    label: "Cost & usage" },
  ]},
  calendar: { title: "Calendar", sub: "Check-ins, sessions and deadlines across the roster", children: null },
  plans:    { title: "Plans", sub: "Reusable plans and scheduled programs", children: [
    { id: "plans",     label: "Plan library" },
    { id: "programs",  label: "Programs · auto-delivery" },
    { id: "builder",   label: "Program builder" },
  ]},
  library:  { title: "Library", sub: "Your own exercises and meals, assignable to clients", children: [
    { id: "lib-ex",    label: "Exercises" },
    { id: "lib-meal",  label: "Meals & recipes" },
  ]},
  alerts:   { title: "Alerts", sub: "Five severities with confidence scoring", children: [
    { id: "alerts",    label: "Smart alerts" },
    { id: "rules",     label: "Rule builder" },
  ]},
  analytics:{ title: "Analytics", sub: "Performance, patterns, interventions and revenue", children: [
    { id: "analytics", label: "Performance" },
    { id: "patterns",  label: "Patterns & forecast" },
    { id: "intervene", label: "Interventions" },
    { id: "revenue",   label: "Revenue" },
  ]},
  inbox:    { title: "Notifications", sub: "Everything that happened while you were away", children: null },
  team:     { title: "Team & audit", sub: "Roles, permissions and the full action trail", children: null },
};

const CoachPortalPlatform = ({ onExit, theme, setTheme }) => {
  const [section, setSection] = useState("overview");
  const [rightOpen, setRightOpen] = useState(true);
  const [child, setChild] = useState(null);
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({ type, payload });
  const close = () => setModal(null);

  const sec = CP_SECTIONS[section];
  const view = sec.children ? (child || sec.children[0].id) : section;

  const goSection = (id) => { setSection(id); setChild(null); };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: rightOpen ? "222px 1fr 306px" : "222px 1fr",
      height: "100vh", width: "100vw",
      background: "var(--bg)", overflow: "hidden",
      "--acc": "var(--acc-coach)",
    }}>
      {/* Sidebar — parents only */}
      <aside style={{
        borderRight: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 45%, var(--bg))",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "13px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: "var(--acc-coach)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, letterSpacing: "-0.04em" }}>C</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em" }}>Coach Portal</div>
            <div className="dim mono" style={{ fontSize: 9.5 }}>coach.lumeos.app</div>
          </div>
        </div>

        <div style={{ padding: "9px 11px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: "linear-gradient(135deg, var(--acc-train), var(--acc-recov))", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600 }}>TM</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Tom Müller</div>
              <div className="dim mono" style={{ fontSize: 9.5 }}>head coach</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {CP_NAV.map(g => (
            <div key={g.grp} style={{ marginBottom: 11 }}>
              <div className="nav-group-label">{g.grp}</div>
              {g.items.map(it => (
                <div key={it.id} className={`nav-item ${section === it.id ? "active" : ""}`} onClick={() => goSection(it.id)}>
                  <span className="nav-icon"><Icon name={it.icon} className="ic" /></span>
                  {it.label}
                  {it.badge && <span className={`badge-mini ${it.badgeVariant || ""}`}>{it.badge}</span>}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginBottom: 11 }}>
            <div className="nav-group-label">Workspaces</div>
            <div className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent("gonav", { detail: "dashboard" }))}>
              <span className="nav-icon"><Icon name="dashboard" className="ic" /></span>
              LumeOS
              <Icon name="ext" className="ic ic-sm" style={{ marginLeft: "auto", color: "var(--fg-dim)" }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--pos)" }} />
          <span className="dim mono" style={{ fontSize: 10 }}>API 5600 · healthy</span>
          <button className="icon-btn" style={{ marginLeft: "auto" }}><Icon name="settings" className="ic ic-sm" /></button>
        </div>
      
        {/* BACK TO LUMEOS */}
        <div style={{ padding: 9, borderTop: "1px solid var(--border)" }}>
          <div onClick={() => onExit && onExit()} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "9px 10px",
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7,
            cursor: "pointer",
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: "var(--fg)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 10, letterSpacing: "-0.04em" }}>L</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500 }}>LumeOS</div>
              <div className="dim mono" style={{ fontSize: 9 }}>your own training</div>
            </div>
            <Icon name="ext" className="ic ic-sm" style={{ color: "var(--fg-dim)" }} />
          </div>
        </div>
      </aside>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div style={{ height: 40, borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", background: "color-mix(in srgb, var(--surface) 30%, var(--bg))" }}>
          <span className="mono" style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.05em", padding: "2px 6px", borderRadius: 4, color: "var(--acc-coach)", background: "color-mix(in srgb, var(--acc-coach) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-coach) 28%, var(--border))" }}>COACH</span>
          <span style={{ fontSize: 11.5, fontWeight: 500 }}>{sec.title}</span>
          {sec.children && <><span className="dim">/</span><span className="dim" style={{ fontSize: 11.5 }}>{sec.children.find(c => c.id === view)?.label}</span></>}
          <div className="spacer" />
          <Pill variant="pos" dot>14 athletes</Pill>
          <button className="icon-btn" onClick={() => goSection("inbox")}><Icon name="bell" className="ic" /></button>
          {/* PORTAL THEME */}
          {setTheme && (
            <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1 }}>
              {[["light","sun"],["dark","moon"]].map(([v, ic]) => (
                <button key={v} onClick={() => setTheme(v)} title={v + " mode"} style={{
                  width: 22, height: 20, borderRadius: 4, cursor: "pointer",
                  background: theme === v ? "var(--fg)" : "transparent",
                  color: theme === v ? "var(--bg)" : "var(--fg-muted)",
                  display: "grid", placeItems: "center",
                }}><Icon name={ic} className="ic ic-sm" /></button>
              ))}
            </div>
          )}
          <button className="icon-btn" onClick={() => setRightOpen(o => !o)} title="Toggle assistant panel"><Icon name="layers" className="ic" /></button>
          <button className="btn btn-sm"><Icon name="message" className="ic ic-sm" />Broadcast</button>
          <button className="btn btn-primary btn-sm" onClick={() => open("newPlan")}><Icon name="plus" className="ic ic-sm" />New plan</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 26px", minWidth: 0 }}>
          <div className="module-header module-hero-lite">
            <div className="module-title-block">
              <div className="module-title-row">
                <span className="module-title">{sec.title}</span>
                {(CP_META[section]?.pills || []).map(([v, l]) => (
                  <Pill key={l} variant={v}>{l}</Pill>
                ))}
              </div>
              <div className="module-sub">{sec.sub}</div>
            </div>
            <div className="module-actions">
              {(CP_META[section]?.actions || []).map(([ic, l], i) => (
                <button key={l} className={i === (CP_META[section].actions.length - 1) ? "btn btn-primary" : "btn"}>
                  <Icon name={ic} className="ic ic-sm" /> {l}
                </button>
              ))}
            </div>
          </div>

          {sec.children && (
            <Tabs
              items={sec.children.map(c => ({ id: c.id, label: c.label }))}
              active={view}
              onChange={setChild}
            />
          )}
          )}

          <CoachCtx.Provider value={{ open, close }}>
            {view === "overview"  && <><PortalOverview/>{window.ClientDashboardCard && <div style={{marginTop: 14}}><div className="eyebrow" style={{marginBottom: 8}}>Client focus · highest attention score</div><window.ClientDashboardCard/></div>}</>}
            {view === "athletes"  && (window.PortalAthletesV2 ? <window.PortalAthletesV2/> : <PortalAthletes/>)}
            {view === "record"    && window.FullClientRecord && <window.FullClientRecord/>}
        {view === "notes"     && window.PortalClientNotes && <window.PortalClientNotes/>}
            {view === "onboard"   && window.PortalClientOnboarding && <window.PortalClientOnboarding/>}
            {view === "autonomy"  && window.CoachPortalAutonomy && <window.CoachPortalAutonomy/>}
            {view === "autohist"  && window.AutonomyHistoryTimeline && <window.AutonomyHistoryTimeline/>}
            {view === "adherence" && window.AdherenceHeatmapView && <window.AdherenceHeatmapView/>}
            {view === "consent"   && window.ConsentFlowView && <window.ConsentFlowView/>}
            {view === "messages"  && <PortalMessages/>}
            {view === "workflows" && window.PortalWorkflows && <window.PortalWorkflows/>}
            {view === "chkedit"   && window.CheckinEditorView && <window.CheckinEditorView/>}
            {view === "assist"    && window.CoachAIAssistant && <window.CoachAIAssistant/>}
        {view === "as-clone"  && window.CoachCloneView && <window.CoachCloneView/>}
        {view === "as-client" && window.CoachPerClientView && <window.CoachPerClientView/>}
        {view === "as-ident"  && window.CoachAssistantIdentityView && <window.CoachAssistantIdentityView/>}
        {view === "as-dec"    && window.CoachAssistantDecisionsView && <window.CoachAssistantDecisionsView/>}
        {view === "as-brief"  && window.CoachBriefingsView && <window.CoachBriefingsView/>}
        {view === "as-voice"  && window.CoachVoiceView && <window.CoachVoiceView/>}
        {view === "as-method" && window.CoachMethodMemoryView && <window.CoachMethodMemoryView/>}
        {view === "as-butler" && window.CoachButlerView && <window.CoachButlerView/>}
        {view === "as-watch"  && window.CoachWatcherView && <window.CoachWatcherView/>}
        {view === "as-tone"   && window.CoachToneView && <window.CoachToneView/>}
        {view === "as-guard"  && window.CoachGuardrailsView && <window.CoachGuardrailsView/>}
        {view === "as-cost"   && window.CoachAICostView && <window.CoachAICostView/>}
        {view === "calendar"  && window.PortalCalendar && <window.PortalCalendar/>}
            {view === "plans"     && <PortalPlans/>}
            {view === "programs"  && window.PortalPrograms && <window.PortalPrograms/>}
            {view === "builder"   && window.ProgramBuilderView && <window.ProgramBuilderView/>}
            {view === "lib-ex"    && window.PortalLibraryExercises && <window.PortalLibraryExercises/>}
            {view === "lib-meal"  && window.PortalLibraryMeals && <window.PortalLibraryMeals/>}
            {view === "alerts"    && window.CoachPortalSmartAlerts && <window.CoachPortalSmartAlerts/>}
            {view === "rules"     && window.CoachPortalRules && <window.CoachPortalRules/>}
            {view === "analytics" && window.CoachPortalAnalytics && <window.CoachPortalAnalytics/>}
            {view === "patterns"  && window.PatternAnalysisView && <window.PatternAnalysisView/>}
            {view === "intervene" && window.InterventionEngineView && <window.InterventionEngineView/>}
            {view === "revenue"   && <PortalRevenue/>}
            {view === "inbox"     && window.PortalNotificationCenter && <window.PortalNotificationCenter/>}
            {view === "team"      && <>{window.CoachPortalTeam && <window.CoachPortalTeam/>}{window.AuditLogV2 && <div style={{marginTop: 14}}><window.AuditLogV2/></div>}</>}
          </CoachCtx.Provider>
        </div>
      </div>

      {modal?.type === "athleteDet" && (window.ClientDetailLayout ? <window.ClientDetailLayout athlete={modal.payload} onClose={close}/> : window.AthleteDetailEnhanced ? <window.AthleteDetailEnhanced athlete={modal.payload} onClose={close}/> : null)}
      {modal?.type === "newPlan"    && <NewPlanModal onClose={close}/>}
      {window.CoachExtrasLauncher && <window.CoachExtrasLauncher/>}
      {rightOpen && window.PortalContextPanel && <window.PortalContextPanel section={section} onNav={goSection} />}
    </div>
  );
};

window.CoachPortalPlatform = CoachPortalPlatform;
