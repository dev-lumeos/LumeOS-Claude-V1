// Buddy module — full chat surface · 5-state avatar · insights · settings · memory · decisions

const BUDDY_PERSONAS = [
  { id: "scientist", name: "Scientist", desc: "Evidence-led · cites sources · neutral tone", icon: "brain" },
  { id: "motivator", name: "Motivator", desc: "Energetic · celebrates wins · pushes hard", icon: "bolt" },
  { id: "drill",     name: "Drill Sergeant", desc: "Direct · no-nonsense · accountability-first", icon: "training" },
  { id: "friend",    name: "Best Friend", desc: "Warm · empathetic · conversational", icon: "user" },
  { id: "zen",       name: "Zen Master", desc: "Calm · long-view · holistic", icon: "moon" },
];

const BUDDY_STATES = [
  { id: "idle",        label: "Idle",        desc: "ambient · listening for cues" },
  { id: "thinking",    label: "Thinking",    desc: "processing your data" },
  { id: "responding",  label: "Responding",  desc: "generating answer" },
  { id: "alert",       label: "Alert",       desc: "something needs your attention" },
  { id: "celebrating", label: "Celebrating", desc: "you hit a milestone" },
];

const BUDDY_CHAT_HISTORY = [
  { from: "buddy", at: "today 14:18", body: "Pre-workout dose in 4h 02m — Beta-Alanine + Caffeine. Want me to set a reminder?", state: "responding" },
  { from: "tom",   at: "today 14:18", body: "yes, 15 min before" },
  { from: "buddy", at: "today 14:18", body: "Done. Reminder set for 17:15. Also: Anders flagged moving Push B to 16:30 — that would shift the pre-workout window to ~15:00. Stay with 17:30 or adjust?", state: "responding" },
  { from: "tom",   at: "today 14:19", body: "stay with 17:30 for this week, then we can shift" },
  { from: "buddy", at: "today 14:19", body: "Noted. I'll remind Anders too.", state: "idle" },
  { from: "buddy", at: "today 09:32", body: "Glucose trending up since MK-677 start. Tagged for next lab panel discussion with Dr. Kessler.", state: "alert" },
  { from: "buddy", at: "today 07:43", body: "Bench Press PR moved to 122.5kg this week. Strength block 3 is hitting its mark — recovery score 82, sleep quality 84. Push hard tonight.", state: "celebrating" },
  { from: "tom",   at: "yesterday 21:14", body: "buddy why is my sleep down?" },
  { from: "buddy", at: "yesterday 21:14", body: "Three nights in a row of <7h. Caffeine at 17:30 might be the cause — your previous cut-off was 14:00. Pattern detection suggests pushing caffeine 90min earlier.", state: "responding" },
];

const BUDDY_INSIGHTS_FEED = [
  { ts: "today 14:18", type: "suggestion", title: "Pre-workout window opens in 15 min", body: "Optimal eating window for tonight's 17:30 session starts at 15:30. Same as yesterday available.", actions: ["Log meal","Snooze"] },
  { ts: "today 09:32", type: "alert", title: "Glucose trending up · 4 weeks", body: "Fasting glucose +14 mg/dL since MK-677 start. Within range but worth flagging at next panel.", actions: ["Open Medical","Dismiss"] },
  { ts: "today 07:43", type: "celebration", title: "PR — Bench Press 122.5kg ×3", body: "Highest e1RM in 12 weeks. Block 3 trajectory matches plan. Share with Anders?", actions: ["Share","Save"] },
  { ts: "yesterday 19:22", type: "pattern", title: "Sleep onset later on training days", body: "Avg 22:48 vs 22:14 on rest days. Possibly caffeine timing or post-workout cortisol.", actions: ["See data","Dismiss"] },
  { ts: "yesterday 14:00", type: "suggestion", title: "Cold plunge effect detected", body: "+4.2ms HRV next morning when logged. Currently 2.8/wk vs target 3.5. Add Thursday slot?", actions: ["Schedule","Dismiss"] },
  { ts: "Mon", type: "celebration", title: "23-day supplement streak", body: "All 8 daily items taken. Highest streak this year.", actions: ["Share"] },
];

const BUDDY_MEMORY = [
  { id: "m1", cat: "Profile",     fact: "Tom is 36, 184cm, 79.4kg, athlete-pro tier", source: "Auth · Profile",     updated: "Apr 23" },
  { id: "m2", cat: "Goal",        fact: "Body recomposition · 78kg @ 12% BF by Aug 1", source: "Goals · g1",         updated: "Mar 15" },
  { id: "m3", cat: "Preference",  fact: "Trains Mon/Tue/Wed/Fri/Sat · rest Thu/Sun", source: "Training pattern",    updated: "May 14" },
  { id: "m4", cat: "Preference",  fact: "Pre-workout window 60-120min before training (typical 17:30)", source: "Pattern detection", updated: "May 10" },
  { id: "m5", cat: "Constraint",  fact: "Lactose-intolerant (mild) · avoids ice cream pre-workout", source: "Tom (Apr 8)",       updated: "Apr 8" },
  { id: "m6", cat: "Coach rule",  fact: "Anders prefers RPE-based loading · not %1RM", source: "Coach config",        updated: "Sep 12, 2024" },
  { id: "m7", cat: "Coach rule",  fact: "Jana adjusts macros based on weight trend, not absolute", source: "Coach config",      updated: "Feb 14" },
  { id: "m8", cat: "Medical",     fact: "On TRT since Sep 2024 · current trough 712 ng/dL", source: "Medical · DOC-014", updated: "Apr 23" },
  { id: "m9", cat: "Medical",     fact: "MK-677 cycle wk 7/12 · monitoring fasting glucose", source: "Supplements · ext", updated: "May 14" },
  { id: "m10", cat: "Personality", fact: "Responds best to data + reasoning, not pep talks", source: "Persona test",     updated: "Jan 8" },
  { id: "m11", cat: "Privacy",    fact: "Training coach (Anders) does not see Nutrition data", source: "Privacy settings",   updated: "Sep 12, 2024" },
  { id: "m12", cat: "Achievement", fact: "Bench PR 122.5kg (Apr 29) · Deadlift 192kg e1RM",  source: "Training · PRs",    updated: "May 13" },
];

const BUDDY_DECISIONS = [
  { ts: "today 14:18", decision: "Created reminder · pre-workout 17:15", category: "Reminder", autonomy: "auto", outcome: "pending" },
  { ts: "today 09:32", decision: "Flagged glucose trend for next Medical panel", category: "Insight", autonomy: "auto", outcome: "logged" },
  { ts: "today 07:43", decision: "Detected PR · bench 122.5kg · sent celebration", category: "Pattern", autonomy: "auto", outcome: "delivered" },
  { ts: "yesterday 19:22", decision: "Detected sleep onset shift on training days", category: "Pattern", autonomy: "auto", outcome: "shared" },
  { ts: "yesterday 14:00", decision: "Suggested cold plunge schedule shift", category: "Suggestion", autonomy: "advisory", outcome: "shared" },
  { ts: "Mon", decision: "Auto-celebrated 23-day supplement streak", category: "Reward", autonomy: "auto", outcome: "delivered" },
  { ts: "May 8", decision: "Skipped low-confidence alert (sleep variance only)", category: "Filter", autonomy: "auto", outcome: "filtered" },
];

const BuddyCtx = React.createContext(null);

const BuddyModule = () => {
  const [tab, setTab] = useState("chat");
  const [persona, setPersona] = useState("friend");
  const [autonomy, setAutonomy] = useState(3);
  const [tier, setTier] = useState("pro");
  const ctx = { persona, setPersona, autonomy, setAutonomy, tier, setTier };
  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Buddy</span>
            <Pill variant="acc">{BUDDY_PERSONAS.find(p => p.id === persona).name}</Pill>
            <Pill>autonomy · L{autonomy}</Pill>
            <Pill variant="acc">{({free:"Free",plus:"Plus",pro:"Pro",elite:"Elite"})[tier]}</Pill>
            <Pill><span className="dot" style={{background: "var(--pos)"}}/>idle</Pill>
          </div>
          <div className="module-sub">Persistent AI buddy · knows your data · cross-module aware · {BUDDY_MEMORY.length} memories</div>
        </div>
        <div className="module-actions">
          <button className="btn"><Icon name="bell" className="ic ic-sm"/>Notifications</button>
          <button className="btn btn-primary"><Icon name="message" className="ic ic-sm"/>New chat</button>
        </div>
      </div>
      <Tabs items={[
        { id: "chat",      label: "Chat" },
        { id: "feed",      label: "Insights feed", count: BUDDY_INSIGHTS_FEED.length },
        { id: "memory",    label: "Memory",        count: BUDDY_MEMORY.length },
        { id: "decisions", label: "Decisions",     count: BUDDY_DECISIONS.length },
        { id: "settings",  label: "Personality" },
        { id: "states",    label: "Avatar states" },
        { id: "tiers",     label: "Plan & gate" },
        { id: "engines",   label: "Engines" },
        { id: "journey",   label: "Journey" },
        { id: "watcher",   label: "Watcher" },
        { id: "bss",       label: "BSS" },
        { id: "signature", label: "Signature" },
        { id: "interven",  label: "Interventions" },
        { id: "safety",    label: "Safety" },
        { id: "butler",    label: "Butler" },
        { id: "voice",     label: "Voice / Live" },
        { id: "knowledge", label: "Knowledge" },
        { id: "rules",     label: "Rules" },
        { id: "overrides", label: "Coach overrides" },
        { id: "clone",     label: "Clone & Gym" },
      ]} active={tab} onChange={setTab}/>
      <BuddyCtx.Provider value={ctx}>
      {tab === "chat"      && <BuddyChat/>}
      {tab === "feed"      && <BuddyFeed/>}
      {tab === "memory"    && <BuddyMemoryView/>}
      {tab === "decisions" && <BuddyDecisions/>}
      {tab === "settings"  && <BuddySettings/>}
      {tab === "states"    && <BuddyStatesShowcase/>}
      {tab === "tiers"     && window.BuddyTiers && <window.BuddyTiers tier={tier} setTier={setTier}/>}
      {tab === "engines"   && window.BuddyEngines && <window.BuddyEngines/>}
      {tab === "journey"   && window.BuddyJourney && <window.BuddyJourney/>}
      {tab === "watcher"   && window.BuddyWatcher && <window.BuddyWatcher/>}
      {tab === "bss"       && window.BuddyBSS && <window.BuddyBSS/>}
      {tab === "signature" && window.BuddySignature && <window.BuddySignature/>}
      {tab === "interven"  && window.BuddyInterventions && <window.BuddyInterventions/>}
      {tab === "safety"    && window.BuddySafety && <window.BuddySafety/>}
      {tab === "butler"    && window.BuddyButler && <window.BuddyButler/>}
      {tab === "voice"     && window.BuddyVoice && <window.BuddyVoice/>}
      {tab === "knowledge" && window.BuddyKnowledge && <window.BuddyKnowledge/>}
      {tab === "rules"     && window.BuddyRules && <window.BuddyRules/>}
      {tab === "overrides" && window.BuddyCoachOverrides && <window.BuddyCoachOverrides/>}
      {tab === "clone"     && window.BuddyClone && <window.BuddyClone/>}
      </BuddyCtx.Provider>
    </>
  );
};

const BuddyOrbModule = ({ state = "idle", size = 96 }) => {
  // Reuse approach: animated radial orb that responds to state
  const stateColor = {
    idle:        "var(--acc-buddy)",
    thinking:    "var(--acc-coach)",
    responding:  "var(--acc-recov)",
    alert:       "var(--warn)",
    celebrating: "var(--acc-nutri)",
  }[state] || "var(--acc-buddy)";
  return (
    <svg viewBox="0 0 100 100" style={{width: size, height: size}}>
      <defs>
        <radialGradient id={`borb-${state}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={stateColor} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={stateColor} stopOpacity="0.05"/>
        </radialGradient>
        <filter id={`bblur-${state}`}><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#borb-${state})`} opacity="0.85">
        {state !== "idle" && <animate attributeName="r" values="40;44;40" dur="2.4s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="50" cy="50" r="18" fill={stateColor} opacity="0.7" filter={`url(#bblur-${state})`}>
        {state === "thinking" && <animate attributeName="cx" values="45;55;45" dur="1.4s" repeatCount="indefinite"/>}
        {state === "responding" && <animate attributeName="r" values="14;22;14" dur="1s" repeatCount="indefinite"/>}
        {state === "celebrating" && <animate attributeName="cy" values="50;42;58;50" dur="1.2s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="50" cy="50" r="8" fill={stateColor}>
        {state === "alert" && <animate attributeName="fill-opacity" values="1;0.4;1" dur="0.6s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="50" cy="50" r="3" fill="var(--bg)" opacity="0.7"/>
    </svg>
  );
};

const BuddyChat = () => {
  const { persona } = React.useContext(BuddyCtx);
  return (
    <div className="grid" style={{gridTemplateColumns: "280px 1fr", gap: 14, minHeight: 580}}>
      <Card title="Threads" sub="recent" className="card-tight" style={{padding: 0}}>
        <div className="col-gap" style={{gap: 0}}>
          {[
            { name: "Today's training prep", at: "14:19", last: "stay with 17:30 for this week", active: true },
            { name: "Glucose trend question", at: "09:32", last: "tagged for Medical panel" },
            { name: "Bench PR celebration",   at: "07:43", last: "Strength block hitting target" },
            { name: "Sleep onset shift",      at: "yesterday", last: "caffeine timing" },
            { name: "Cold plunge effect",     at: "yesterday", last: "+4.2ms HRV next morning" },
            { name: "Supplement streak",      at: "Mon", last: "23-day streak" },
          ].map((t, i) => (
            <div key={i} style={{padding: 10, borderBottom: "1px solid var(--border)", cursor: "pointer", background: t.active ? "color-mix(in oklch, var(--acc-buddy) 6%, transparent)" : "transparent"}}>
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 3}}>
                <span style={{fontSize: 12, fontWeight: t.active ? 600 : 500}}>{t.name}</span>
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 9.5}}>{t.at}</span>
              </div>
              <div className="muted" style={{fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{t.last}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{padding: 0, display: "flex", flexDirection: "column"}}>
        <div style={{padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10}}>
          <BuddyOrbModule state="responding" size={36}/>
          <div style={{flex: 1}}>
            <div style={{fontSize: 13, fontWeight: 600}}>Today's training prep</div>
            <div className="dim mono" style={{fontSize: 10}}>{BUDDY_PERSONAS.find(p => p.id === persona).name} persona · 4 messages</div>
          </div>
          <Pill variant="pos" dot>online</Pill>
        </div>
        <div style={{flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, maxHeight: 420}}>
          {BUDDY_CHAT_HISTORY.slice().reverse().map((m, i) => (
            <div key={i} style={{display: "flex", justifyContent: m.from === "tom" ? "flex-end" : "flex-start"}}>
              <div style={{maxWidth: "75%", padding: "10px 14px", background: m.from === "tom" ? "color-mix(in oklch, var(--acc-buddy) 18%, var(--surface))" : "var(--surface)", border: "1px solid var(--border)", borderRadius: 10}}>
                <div className="dim mono" style={{fontSize: 9.5, marginBottom: 3}}>{m.from === "buddy" ? `Buddy${m.state ? ` · ${m.state}` : ""}` : "Tom"} · {m.at}</div>
                <div style={{fontSize: 12.5, lineHeight: 1.5, color: "var(--fg)"}}>{m.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding: 12, borderTop: "1px solid var(--border)"}}>
          <div style={{display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap"}}>
            {["Log meal", "Start workout", "Sleep score", "Recovery suggestion", "Plan tonight"].map(q => (
              <button key={q} className="pill" style={{cursor: "pointer", padding: "4px 10px", fontSize: 11}}>{q}</button>
            ))}
          </div>
          <div style={{display: "flex", gap: 6}}>
            <input placeholder="Ask Buddy anything…" style={{flex: 1, height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 12.5}}/>
            <button className="icon-btn" style={{width: 34, height: 34}}><Icon name="camera" className="ic"/></button>
            <button className="btn btn-primary"><Icon name="arr_r" className="ic ic-sm"/></button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const BuddyFeed = () => (
  <div className="col-gap" style={{gap: 8}}>
    {BUDDY_INSIGHTS_FEED.map((f, i) => {
      const color = { suggestion: "var(--acc-recov)", alert: "var(--warn)", celebration: "var(--pos)", pattern: "var(--acc-buddy)" }[f.type];
      return (
        <Card key={i}>
          <div style={{display: "flex", gap: 12}}>
            <div style={{width: 3, alignSelf: "stretch", background: color, borderRadius: 2}}/>
            <div style={{flex: 1}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                <Pill style={{borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`, color, textTransform: "uppercase"}}>{f.type}</Pill>
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{f.ts}</span>
              </div>
              <div style={{fontSize: 14, fontWeight: 600, marginBottom: 6}}>{f.title}</div>
              <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>{f.body}</div>
              <div style={{display: "flex", gap: 6}}>
                {f.actions.map(a => <button key={a} className={a === f.actions[0] ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}>{a}</button>)}
              </div>
            </div>
          </div>
        </Card>
      );
    })}
  </div>
);

const BuddyMemoryView = () => {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(BUDDY_MEMORY.map(m => m.cat))];
  const filtered = cat === "All" ? BUDDY_MEMORY : BUDDY_MEMORY.filter(m => m.cat === cat);
  return (
    <div>
      <div style={{padding: 14, background: "color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))", borderRadius: 8, marginBottom: 14}}>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <Icon name="brain" className="ic" style={{color: "var(--acc-buddy)"}}/>
          <div style={{flex: 1}}>
            <div style={{fontSize: 13, fontWeight: 600}}>What Buddy knows about you</div>
            <div className="muted" style={{fontSize: 11}}>Editable · sourced · always reviewable. Buddy never has unrevealed memory.</div>
          </div>
          <button className="btn"><Icon name="download" className="ic ic-sm"/>Export memory</button>
        </div>
      </div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap"}}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{c}</button>
        ))}
      </div>
      <Card>
        <table className="tbl">
          <thead><tr><th>Category</th><th>Fact</th><th style={{width: 180}}>Source</th><th style={{width: 90}}>Updated</th><th style={{width: 60}}></th></tr></thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td><Pill>{m.cat}</Pill></td>
                <td style={{fontSize: 12.5}}>{m.fact}</td>
                <td className="dim mono" style={{fontSize: 11}}>{m.source}</td>
                <td className="num muted">{m.updated}</td>
                <td><button className="icon-btn"><Icon name="edit" className="ic ic-sm"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const BuddyDecisions = () => (
  <Card title="Decision feed" sub={`${BUDDY_DECISIONS.length} of 412 · last 7 days`} actions={<button className="btn btn-ghost"><Icon name="download" className="ic ic-sm"/>Export</button>}>
    <table className="tbl">
      <thead><tr><th style={{width: 120}}>When</th><th>Decision</th><th style={{width: 110}}>Category</th><th style={{width: 90}}>Autonomy</th><th style={{width: 110}}>Outcome</th></tr></thead>
      <tbody>
        {BUDDY_DECISIONS.map((d, i) => (
          <tr key={i}>
            <td className="num muted">{d.ts}</td>
            <td style={{fontSize: 12}}>{d.decision}</td>
            <td><Pill>{d.category}</Pill></td>
            <td><Pill variant={d.autonomy === "auto" ? "" : "warn"}>{d.autonomy}</Pill></td>
            <td><Pill variant={d.outcome === "delivered" || d.outcome === "logged" ? "pos" : "idle"}>{d.outcome}</Pill></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const BuddySettings = () => {
  const { persona, setPersona, autonomy, setAutonomy } = React.useContext(BuddyCtx);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Persona" sub="how Buddy speaks to you">
          <div className="grid g-cols-2" style={{gap: 8}}>
            {BUDDY_PERSONAS.map(p => (
              <div key={p.id} onClick={() => setPersona(p.id)} style={{
                padding: 12, borderRadius: 7, cursor: "pointer",
                background: persona === p.id ? "color-mix(in oklch, var(--acc-buddy) 10%, var(--surface))" : "var(--surface)",
                border: `1px solid ${persona === p.id ? "color-mix(in oklch, var(--acc-buddy) 35%, var(--border))" : "var(--border)"}`
              }}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                  <Icon name={p.icon} className="ic" style={{color: persona === p.id ? "var(--acc-buddy)" : "var(--fg-muted)"}}/>
                  <span style={{fontSize: 13, fontWeight: 600}}>{p.name}</span>
                  {persona === p.id && <Pill variant="acc">active</Pill>}
                </div>
                <div className="muted" style={{fontSize: 11.5, lineHeight: 1.45}}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Autonomy level" sub="how independently Buddy acts">
          <div className="dim" style={{fontSize: 11.5, marginBottom: 12, lineHeight: 1.5}}>
            Level 1 confirms every action · Level 5 acts autonomously within safety bounds.
          </div>
          <div style={{display: "flex", gap: 6}}>
            {[1,2,3,4,5].map(l => (
              <button key={l} onClick={() => setAutonomy(l)} style={{
                flex: 1, padding: "10px 8px", borderRadius: 6, cursor: "pointer",
                background: autonomy === l ? "var(--acc-buddy)" : "var(--surface)",
                color: autonomy === l ? "var(--bg)" : "var(--fg-muted)",
                border: `1px solid ${autonomy === l ? "var(--acc-buddy)" : "var(--border)"}`,
                fontFamily: "var(--font-mono)", fontWeight: 600
              }}>L{l}</button>
            ))}
          </div>
          <div className="muted" style={{fontSize: 11.5, marginTop: 10, lineHeight: 1.5}}>
            {[
              "Supervised · confirms every action",
              "Cautious · asks for routine actions",
              "Collaborative (default) · independent on low-risk",
              "Independent · acts on most decisions, asks on changes",
              "Autonomous · acts within safety bounds, summarizes weekly"
            ][autonomy - 1]}
          </div>
        </Card>
      </div>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Communication">
          <Row label="Language" value="English (auto-detect)"/>
          <Row label="Tone" value="Professional · friendly"/>
          <Row label="Voice" value="Off · text only"/>
          <Row label="Wake word" value='"hey buddy" (off)'/>
        </Card>
        <Card title="Notifications">
          <Row label="Frequency" value="Smart · ML-balanced"/>
          <Row label="Critical alerts" value="Always · push + chat"/>
          <Row label="Achievements" value="Push notification"/>
          <Row label="Patterns" value="In-app only"/>
          <Row label="Daily summary" value="07:00 · email"/>
          <Row label="Quiet hours" value="22:00 — 06:00"/>
        </Card>
        <Card title="Privacy">
          <Row label="Memory access" value="On · editable"/>
          <Row label="Cross-module aware" value="On · all 11"/>
          <Row label="Share with coaches" value="aggregate only"/>
          <Row label="Anonymous learning" value="Opted in"/>
        </Card>
      </div>
    </div>
  );
};

const BuddyStatesShowcase = () => (
  <Card title="Avatar states" sub="5 states reflect what Buddy is doing">
    <div className="grid g-cols-5" style={{gap: 12}}>
      {BUDDY_STATES.map(s => (
        <div key={s.id} style={{padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, textAlign: "center"}}>
          <div style={{display: "grid", placeItems: "center", marginBottom: 10}}>
            <BuddyOrbModule state={s.id} size={96}/>
          </div>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 3}}>{s.label}</div>
          <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{s.desc}</div>
        </div>
      ))}
    </div>
    <div className="divider"/>
    <div className="muted" style={{fontSize: 12, lineHeight: 1.55}}>
      Buddy's state is visible in the right context panel of every module · pulse-animation indicates active processing · color shifts when an alert needs attention. Click the orb to open this chat.
    </div>
  </Card>
);

window.BuddyModule = BuddyModule;
