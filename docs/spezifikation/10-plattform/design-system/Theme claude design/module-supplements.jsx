// Nutrition module — full athlete Supplements module
// 6 tabs: Today · Stack · Database · Compliance · Interactions · Cost

// ── Tom's active stack ──────────────────────────────────────────
// Eight items across four slots. Realistic dosages, real evidence levels.
const STACK = [
  {
    id: "creatine",
    name: "Creatine Monohydrate",
    brand: "Bulk Pure Series",
    form: "Powder",
    dose: "5 g",
    slot: "morning",
    days: [1, 1, 1, 1, 1, 1, 1], // Mo Tu We Th Fr Sa Su
    purpose: ["Strength", "Power output", "Hydration"],
    evidence: "A",
    notes: "Maintenance dose. No loading phase used.",
    started: "2024-08-12",
    monthlyCost: 8.20,
    servingsLeft: 18,
    servingsTotal: 60,
    refill: "May 28",
    streakDays: 287,
    coachRecommended: true,
  },
  {
    id: "d3k2",
    name: "Vitamin D3 + K2 (MK-7)",
    brand: "Pure Encapsulations",
    form: "Capsule",
    dose: "4000 IU + 200 µg",
    slot: "morning",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Immune", "Bone health", "Calcium routing"],
    evidence: "A",
    notes: "Stack synergy — K2 directs Ca to bone.",
    started: "2024-04-02",
    monthlyCost: 6.40,
    servingsLeft: 34,
    servingsTotal: 90,
    refill: "Jun 14",
    streakDays: 412,
    coachRecommended: true,
  },
  {
    id: "omega3",
    name: "Omega-3 EPA/DHA",
    brand: "Nordic Naturals · Ultimate Omega",
    form: "Softgel",
    dose: "2 × 1280 mg (EPA 640 / DHA 480)",
    slot: "morning",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Inflammation", "Cognition", "CV"],
    evidence: "A",
    notes: "Take with fat-containing meal for absorption.",
    started: "2024-01-08",
    monthlyCost: 28.50,
    servingsLeft: 8,
    servingsTotal: 60,
    refill: "May 26",
    refillUrgent: true,
    streakDays: 504,
    coachRecommended: false,
  },
  {
    id: "whey",
    name: "Whey Isolate",
    brand: "ESN Iso Whey · Vanilla",
    form: "Powder",
    dose: "30 g",
    slot: "post_workout",
    days: [1, 1, 1, 0, 1, 1, 0], // Mo Tu We _ Fr Sa _
    purpose: ["Protein top-up", "Recovery"],
    evidence: "A",
    notes: "Post-training only. Skip on rest days (Thu/Sun).",
    started: "2023-11-04",
    monthlyCost: 18.20,
    servingsLeft: 22,
    servingsTotal: 33,
    refill: "Jun 8",
    streakDays: 88,
    coachRecommended: true,
  },
  {
    id: "betaala",
    name: "Beta-Alanine",
    brand: "Bulk · CarnoSyn",
    form: "Powder",
    dose: "3.2 g",
    slot: "pre_workout",
    days: [1, 0, 1, 0, 1, 1, 0],
    purpose: ["Muscle endurance", "Carnosine buffer"],
    evidence: "B+",
    notes: "Tingling normal in first 20 min — paraesthesia.",
    started: "2025-02-18",
    monthlyCost: 4.10,
    servingsLeft: 41,
    servingsTotal: 80,
    refill: "Jul 2",
    streakDays: 64,
    coachRecommended: true,
  },
  {
    id: "caffeine",
    name: "Caffeine Anhydrous",
    brand: "Bulk · 200 mg tabs",
    form: "Tablet",
    dose: "200 mg",
    slot: "pre_workout",
    days: [1, 0, 1, 0, 1, 1, 0],
    purpose: ["Stimulant", "Performance"],
    evidence: "A",
    notes: "Cycle-aware — Tom takes 2 weeks off every 8.",
    started: "2024-03-20",
    monthlyCost: 2.10,
    servingsLeft: 64,
    servingsTotal: 120,
    refill: "Jul 22",
    streakDays: 41,
    coachRecommended: false,
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    brand: "Pure Encapsulations",
    form: "Capsule",
    dose: "400 mg (elemental)",
    slot: "evening",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Sleep", "Muscle relax", "HRV"],
    evidence: "A",
    notes: "Glycinate form best tolerated — no GI issues.",
    started: "2024-06-15",
    monthlyCost: 12.40,
    servingsLeft: 28,
    servingsTotal: 90,
    refill: "Jun 9",
    streakDays: 332,
    coachRecommended: true,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    brand: "Sensoril/KSM dual std.",
    form: "Capsule",
    dose: "600 mg",
    slot: "evening",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Cortisol", "Stress", "Sleep"],
    evidence: "B+",
    notes: "8-week on / 2-week off cycle. Currently week 5 of 8.",
    started: "2025-04-14",
    monthlyCost: 18.00,
    servingsLeft: 12,
    servingsTotal: 60,
    refill: "May 31",
    streakDays: 35,
    coachRecommended: true,
  },
  {
    id: "probiotic",
    name: "Probiotic · 50B CFU",
    brand: "Seed DS-01",
    form: "Capsule",
    dose: "2 caps · 50B CFU",
    slot: "midday",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Gut microbiome", "Immunity"],
    evidence: "B+",
    notes: "24 strains · take 30 min before lunch with water only.",
    started: "2025-01-08",
    monthlyCost: 49.90,
    servingsLeft: 22,
    servingsTotal: 60,
    refill: "Jun 4",
    streakDays: 128,
    coachRecommended: false,
  },
];

const SLOTS = [
  { id: "morning",      label: "Morning",     time: "07:00", icon: "training" },
  { id: "midday",       label: "Midday",      time: "12:30", icon: "nutrition" },
  { id: "pre_workout",  label: "Pre-workout", time: "17:30", icon: "training" },
  { id: "post_workout", label: "Post-workout",time: "19:30", icon: "nutrition" },
  { id: "evening",      label: "Evening",     time: "22:00", icon: "recovery" },
];

const DAY_LETTERS = ["M","T","W","T","F","S","S"];
const TODAY_DOW = 5; // Sat (May 16, demo day)
const NOW_HOUR = 13.5;

// helper — slot status: taken / due / planned / skipped / na
function getSlotStatus(slot, item) {
  if (!item.days[TODAY_DOW]) return "na";
  const slotTime = parseFloat(SLOTS.find(s => s.id === slot).time.split(":")[0]);
  if (NOW_HOUR < slotTime - 0.5) return "planned";
  if (NOW_HOUR > slotTime + 1.5) return slot === "morning" ? "taken" : "due";
  return "due";
}

const EVIDENCE_PALETTE = {
  "A":  "var(--pos)",
  "B+": "var(--acc-recov)",
  "B":  "var(--acc-recov)",
  "C":  "var(--warn)",
  "D":  "var(--neg)",
};

// ── Module shell ────────────────────────────────────────────────
const SuppCtx = React.createContext(null);

const SupplementsModule = () => {
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null);
  const [takenToday, setTakenToday] = useState({ creatine: true, d3k2: true, omega3: true });
  const open = (type, payload) => setModal({ type, payload });
  const close = () => setModal(null);
  const toggleTaken = id => setTakenToday(t => ({ ...t, [id]: !t[id] }));
  const ctx = { open, close, takenToday, toggleTaken };
  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Supplements</span>
            <Pill>Sat · May 16</Pill>
            <Pill variant="acc">{STACK.length} active</Pill>
            <Pill><span className="dot" style={{background: "var(--pos)"}} /> Compliance 30d · 94%</Pill>
          </div>
          <div className="module-sub">Stack, dosing schedule, interactions, cost · coach-shared</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => setTab("database")}><Icon name="search" className="ic ic-sm" /> Database</button>
          <button className="btn"><Icon name="download" className="ic ic-sm" /> Export stack</button>
          <button className="btn btn-primary" onClick={() => open("catalogAdd")}><Icon name="plus" className="ic ic-sm" /> Add supplement</button>
        </div>
      </div>

      <Tabs
        items={[
          { id: "today",        label: "Today",        icon: "check" },
          { id: "stack",        label: "Stack",        icon: "supplements", count: STACK.length },
          { id: "extended",     label: "Extended",     icon: "medical",     count: EXTENDED_STACK.length },
          { id: "catalog",     label: "Catalog",      icon: "search" },
          { id: "stacks",      label: "Stacks",       icon: "layers" },
          { id: "intel",       label: "Intelligence", icon: "sparkles" },
          { id: "inventory",   label: "Inventory",    icon: "marketplace" },
          { id: "injection",   label: "Injections",   icon: "medical" },
          { id: "compliance",   label: "Compliance",   icon: "calendar" },
          { id: "interactions", label: "Interactions", icon: "sparkles",    count: 3 },
          { id: "cost",         label: "Cost",         icon: "trend_up" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <SuppCtx.Provider value={ctx}>
      {tab === "today"        && <SuppToday />}
      {tab === "stack"        && <SuppStack />}
      {tab === "extended"     && <SuppExtended />}
      {tab === "database"     && <SuppDatabase />}
      {tab === "compliance"   && <SuppCompliance />}
      {tab === "interactions" && (window.SuppInteractionsView ? <window.SuppInteractionsView /> : <SuppInteractions />)}
      {tab === "cost"         && <SuppCost />}
      {tab === "catalog"      && window.SuppCatalogView && <window.SuppCatalogView />}
      {tab === "stacks"       && window.SuppStacksView && <window.SuppStacksView />}
      {tab === "intel"        && window.SuppIntelligenceView && <window.SuppIntelligenceView />}
      {tab === "inventory"    && window.SuppInventoryView && <window.SuppInventoryView />}
      {tab === "injection"    && window.InjectionPlannerView && <window.InjectionPlannerView />}
      </SuppCtx.Provider>

      {modal?.type === "add"          && <AddSupplementModal onClose={close} prefill={modal.payload}/>}
      {modal?.type === "catalogAdd"    && window.AddFromCatalogModal && <window.AddFromCatalogModal mode="standard" onClose={close}/>}
      {modal?.type === "catalogAddEnh" && window.AddFromCatalogModal && <window.AddFromCatalogModal mode="enhanced" onClose={close}/>}
      {modal?.type === "skip"         && <LogSkipModal item={modal.payload} onClose={close}/>}
      {modal?.type === "product"      && <ProductDetailDrawer name={modal.payload.name} inStack={modal.payload.inStack} onClose={close} onAdd={() => { close(); setTimeout(() => open("add", {name: modal.payload.name}), 50); }}/>}
      {modal?.type === "interaction"  && <InteractionDetail interaction={modal.payload} onClose={close}/>}
      {modal?.type === "reorder"      && <ReorderModal items={modal.payload} onClose={close}/>}
      {modal?.type === "addLab"       && <AddLabResultModal onClose={close}/>}
      {modal?.type === "addSideEffect"&& <AddSideEffectModal onClose={close}/>}
      {modal?.type === "addCompound"  && <AddCompoundModal onClose={close}/>}
      {modal?.type === "planCycle"    && <PlanCycleModal onClose={close}/>}
      {modal?.type === "permissions"  && <PermissionsModal onClose={close}/>}
      {modal?.type === "logDose"      && <LogDoseModal compound={modal.payload} onClose={close}/>}
      {window.SuppInjectionLauncher && <window.SuppInjectionLauncher/>}
    </>
  );
};

// ── TODAY ──────────────────────────────────────────────────────
const SuppToday = () => {
  const { takenToday, toggleTaken, open } = React.useContext(SuppCtx);
  const dueToday = STACK.filter(s => s.days[TODAY_DOW]).length;
  const takenCount = STACK.filter(s => s.days[TODAY_DOW] && takenToday[s.id]).length;
  const nextItem = STACK.find(s => s.slot === "pre_workout" && s.days[TODAY_DOW]);

  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
      {/* LEFT — slot timeline */}
      <div className="col-gap" style={{gap: 14}}>
        {/* Day strip */}
        <Card>
          <div style={{display: "flex", alignItems: "center", gap: 16}}>
            <Ring value={takenCount} max={dueToday} color="var(--acc-suppl)" label="taken" size={88} stroke={7} />
            <div style={{flex: 1}}>
              <div className="eyebrow" style={{marginBottom: 6}}>Today's adherence</div>
              <div className="num" style={{fontSize: 26, lineHeight: 1, marginBottom: 4}}>
                {takenCount}<span className="dim" style={{fontSize: 13}}> / {dueToday}</span>
              </div>
              <div className="muted" style={{fontSize: 11.5}}>Next: <span style={{color: "var(--fg)", fontWeight: 500}}>{nextItem?.name}</span> in <span className="num">4h 02m</span></div>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end"}}>
              <span className="eyebrow">Streak</span>
              <span className="num" style={{fontSize: 18}}>23<span className="dim" style={{fontSize: 11}}> days</span></span>
            </div>
          </div>
        </Card>

        {/* Slot cards */}
        {SLOTS.map(slot => {
          const items = STACK.filter(s => s.slot === slot.id);
          if (items.length === 0) return null;
          return <SlotCard key={slot.id} slot={slot} items={items} takenToday={takenToday} toggleTaken={toggleTaken} onSkip={item => open("skip", item)} />;
        })}
      </div>

      {/* RIGHT */}
      <div className="col-gap" style={{gap: 14}}>
        {/* Next dose countdown */}
        <Card title="Next dose" sub={nextItem?.brand} actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}>Skip <Icon name="chevron_down" className="ic ic-sm" /></button>}>
          <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4}}>
            <span className="num" style={{fontSize: 28, fontWeight: 500}}>4:02</span>
            <span className="dim" style={{fontSize: 12}}>until 17:30 · pre-workout</span>
          </div>
          <div style={{fontSize: 13, fontWeight: 500, marginBottom: 2}}>{nextItem?.name}</div>
          <div className="muted num" style={{fontSize: 11}}>{nextItem?.dose}</div>
          <div className="divider" />
          <div className="eyebrow" style={{marginBottom: 8}}>Stacks with</div>
          <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
            <Pill>Caffeine · 200mg</Pill>
            <Pill>Pre-workout meal</Pill>
          </div>
        </Card>

        {/* Refill alerts */}
        <Card title="Refills" sub="next 14 days" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("reorder", STACK.filter(s => s.servingsLeft / s.servingsTotal < 0.4))}>Order all <Icon name="arrow_right" className="ic ic-sm" /></button>}>
          <div className="col-gap" style={{gap: 0}}>
            {STACK.filter(s => s.servingsLeft / s.servingsTotal < 0.4).sort((a, b) => a.servingsLeft - b.servingsLeft).map((s, i, arr) => (
              <div key={s.id} style={{padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none"}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                  <span className="dot" style={{background: s.refillUrgent ? "var(--neg)" : "var(--warn)"}} />
                  <span style={{fontSize: 12, fontWeight: 500, flex: 1}}>{s.name}</span>
                  <span className="num" style={{fontSize: 11, color: s.refillUrgent ? "var(--neg)" : "var(--warn)"}}>{s.refill}</span>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <div style={{flex: 1}}>
                    <Meter value={s.servingsLeft} max={s.servingsTotal} color={s.refillUrgent ? "var(--neg)" : "var(--warn)"} />
                  </div>
                  <span className="num dim" style={{fontSize: 10}}>{s.servingsLeft} / {s.servingsTotal} servings</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cycle awareness */}
        {window.SuppScoreCard && <window.SuppScoreCard />}
        {window.SuppPendingActions && <window.SuppPendingActions />}
        <Card title="Active cycles" sub="time-bound items">
          <div className="row">
            <span className="row-l">
              <span className="dot" style={{background: "var(--acc-suppl)"}} />
              Ashwagandha (KSM-66)
              <span className="dim" style={{fontSize: 10}}>8w on / 2w off</span>
            </span>
            <span className="row-r" style={{color: "var(--warn)"}}>Wk 5 of 8</span>
          </div>
          <div className="row">
            <span className="row-l">
              <span className="dot" style={{background: "var(--acc-suppl)"}} />
              Caffeine
              <span className="dim" style={{fontSize: 10}}>8w on / 2w off</span>
            </span>
            <span className="row-r">Wk 6 of 8</span>
          </div>
          <div className="row">
            <span className="row-l">
              <span className="dot" style={{background: "var(--pos)"}} />
              Creatine
              <span className="dim" style={{fontSize: 10}}>continuous</span>
            </span>
            <span className="row-r dim">—</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SlotCard = ({ slot, items, takenToday, toggleTaken, onSkip }) => {
  const slotTime = parseFloat(slot.time.split(":")[0]);
  const isPast = NOW_HOUR > slotTime + 1.5;
  const isCurrent = !isPast && NOW_HOUR > slotTime - 1;
  return (
    <Card
      className="card-tight"
      style={{
        padding: 0,
        border: isCurrent ? "1px solid color-mix(in oklch, var(--acc-suppl) 35%, var(--border))" : undefined,
        background: isCurrent ? "color-mix(in oklch, var(--acc-suppl) 4%, var(--surface))" : undefined,
      }}
    >
      <div style={{padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10}}>
        <span className="num" style={{fontSize: 11, color: isCurrent ? "var(--acc-suppl)" : "var(--fg-dim)", width: 44, fontWeight: 600}}>{slot.time}</span>
        <span style={{fontSize: 13, fontWeight: 600}}>{slot.label}</span>
        {isCurrent && <Pill variant="acc">Next</Pill>}
        {isPast && <Pill variant="pos"><Icon name="check" className="ic ic-sm" />Done</Pill>}
        <div className="spacer" />
        <span className="dim num" style={{fontSize: 10}}>{items.filter(i => i.days[TODAY_DOW]).length} item{items.filter(i => i.days[TODAY_DOW]).length === 1 ? "" : "s"}</span>
      </div>
      <div>
        {items.map((it, i) => {
          const active = !!it.days[TODAY_DOW];
          const isTaken = !!takenToday?.[it.id];
          const slotTime = parseFloat(slot.time.split(":")[0]);
          const isPastSlot = NOW_HOUR > slotTime + 1.5;
          const status = !active ? "skip" : isTaken ? "taken" : isPastSlot ? "due" : "planned";
          return (
            <div
              key={it.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px",
                borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                opacity: active ? 1 : 0.45
              }}
            >
              <button
                onClick={() => active && toggleTaken?.(it.id)}
                disabled={!active}
                style={{background: "none", border: 0, cursor: active ? "pointer" : "default", padding: 0}}
              ><CheckCircle status={status} /></button>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <span style={{fontSize: 12.5, fontWeight: 500}}>{it.name}</span>
                  <span className="num dim" style={{fontSize: 10.5}}>{it.dose}</span>
                  {it.coachRecommended && <Pill><Icon name="check" className="ic ic-sm" />Coach</Pill>}
                </div>
                <div className="muted" style={{fontSize: 10.5}}>{it.brand}</div>
              </div>
              {active && isTaken && <span className="num" style={{fontSize: 10, color: "var(--pos)"}}>✓ logged</span>}
              {active && !isTaken && (
                <>
                  <button className="btn" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => toggleTaken?.(it.id)}>Mark taken</button>
                  <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => onSkip?.(it)}>Skip</button>
                </>
              )}
              {!active && <span className="dim" style={{fontSize: 10}}>not today</span>}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const CheckCircle = ({ status }) => {
  const palette = {
    taken:   { bg: "var(--pos)",   stroke: "var(--pos)",   ic: "check" },
    due:     { bg: "transparent",  stroke: "var(--acc-suppl)", ic: null },
    planned: { bg: "transparent",  stroke: "var(--fg-dim)",   ic: null },
    skip:    { bg: "transparent",  stroke: "var(--fg-dim)",   ic: null },
  };
  const p = palette[status] || palette.planned;
  return (
    <div style={{
      width: 18, height: 18, borderRadius: 999,
      background: p.bg, border: `1.5px solid ${p.stroke}`,
      display: "grid", placeItems: "center",
      flexShrink: 0
    }}>
      {p.ic && <Icon name={p.ic} className="ic" style={{width: 10, height: 10, color: "var(--bg)", strokeWidth: 3}} />}
    </div>
  );
};

// ── STACK ──────────────────────────────────────────────────────
const SuppStack = () => {
  const { open } = React.useContext(SuppCtx);
  const [view, setView] = useState("matrix"); // matrix | list
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2}}>
          <button
            className={view === "matrix" ? "btn btn-primary" : "btn btn-ghost"}
            style={{height: 26, fontSize: 11, padding: "0 12px", borderRadius: 4}}
            onClick={() => setView("matrix")}
          >Timing matrix</button>
          <button
            className={view === "list" ? "btn btn-primary" : "btn btn-ghost"}
            style={{height: 26, fontSize: 11, padding: "0 12px", borderRadius: 4}}
            onClick={() => setView("list")}
          >List</button>
        </div>
        <div className="spacer" />
        <button className="btn"><Icon name="filter" className="ic ic-sm" /> Filter</button>
        <button className="btn btn-primary" onClick={() => open("add")}><Icon name="plus" className="ic ic-sm" /> Add to stack</button>
      </div>

      {view === "matrix" && <StackMatrix />}
      {view === "list" && <StackList />}
    </div>
  );
};

const StackMatrix = () => {
  const { open } = React.useContext(SuppCtx);
  return (
  <Card>
    <table className="tbl">
      <thead>
        <tr>
          <th style={{width: 240}}>Supplement</th>
          <th style={{width: 110}}>Dose</th>
          <th style={{width: 110}}>Slot</th>
          <th style={{width: 168}}>Mon — Sun</th>
          <th style={{width: 60}}>Evidence</th>
          <th style={{width: 50, textAlign: "right"}}>€/mo</th>
          <th style={{width: 60, textAlign: "right"}}>Streak</th>
          <th style={{width: 30}}></th>
        </tr>
      </thead>
      <tbody>
        {STACK.map(s => (
          <tr key={s.id} style={{cursor: "pointer"}}>
            <td>
              <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <span className="dot" style={{background: "var(--acc-suppl)", flexShrink: 0}} />
                <div>
                  <div style={{fontSize: 12.5, fontWeight: 500}}>{s.name}</div>
                  <div className="muted" style={{fontSize: 10.5}}>{s.brand}</div>
                </div>
              </div>
            </td>
            <td className="num" style={{fontSize: 11.5}}>{s.dose}</td>
            <td className="muted">{SLOTS.find(sl => sl.id === s.slot).label}</td>
            <td>
              <div style={{display: "flex", gap: 3}}>
                {s.days.map((d, i) => (
                  <div key={i} style={{
                    width: 20, height: 20, borderRadius: 4,
                    display: "grid", placeItems: "center",
                    background: d ? "color-mix(in oklch, var(--acc-suppl) 22%, transparent)" : "var(--surface-2)",
                    border: d ? "1px solid color-mix(in oklch, var(--acc-suppl) 40%, var(--border))" : "1px solid var(--border)",
                    color: d ? "var(--acc-suppl)" : "var(--fg-dim)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9.5, fontWeight: 600,
                  }}>{DAY_LETTERS[i]}</div>
                ))}
              </div>
            </td>
            <td>
              <Pill style={{borderColor: `color-mix(in oklch, ${EVIDENCE_PALETTE[s.evidence]} 40%, var(--border))`, color: EVIDENCE_PALETTE[s.evidence], background: `color-mix(in oklch, ${EVIDENCE_PALETTE[s.evidence]} 8%, transparent)`}}>{s.evidence}</Pill>
            </td>
            <td className="num" style={{textAlign: "right", fontSize: 11.5}}>€{s.monthlyCost.toFixed(2)}</td>
            <td className="num" style={{textAlign: "right", fontSize: 11.5, color: "var(--pos)"}}>{s.streakDays}d</td>
            <td><button className="icon-btn" onClick={() => open("add", s)}><Icon name="edit" className="ic ic-sm" /></button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
  );
};

const StackList = () => (
  <div className="grid g-cols-2" style={{gap: 12}}>
    {STACK.map(s => (
      <Card key={s.id} className="card-tight" style={{padding: 14}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10}}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "color-mix(in oklch, var(--acc-suppl) 18%, transparent)",
            border: "1px solid color-mix(in oklch, var(--acc-suppl) 35%, transparent)",
            color: "var(--acc-suppl)", display: "grid", placeItems: "center", flexShrink: 0
          }}>
            <Icon name="supplements" className="ic ic-lg" style={{strokeWidth: 1.5}} />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 13, fontWeight: 600, marginBottom: 1}}>{s.name}</div>
            <div className="muted" style={{fontSize: 11}}>{s.brand} · {s.form}</div>
          </div>
          <Pill style={{borderColor: `color-mix(in oklch, ${EVIDENCE_PALETTE[s.evidence]} 40%, var(--border))`, color: EVIDENCE_PALETTE[s.evidence], background: `color-mix(in oklch, ${EVIDENCE_PALETTE[s.evidence]} 8%, transparent)`}}>Evidence {s.evidence}</Pill>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10}}>
          <div>
            <div className="eyebrow" style={{marginBottom: 2}}>Dose</div>
            <div className="num" style={{fontSize: 12}}>{s.dose}</div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 2}}>Slot</div>
            <div style={{fontSize: 12}}>{SLOTS.find(sl => sl.id === s.slot).label}</div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 2}}>Streak</div>
            <div className="num" style={{fontSize: 12, color: "var(--pos)"}}>{s.streakDays}d</div>
          </div>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10}}>
          {s.purpose.map(p => <Pill key={p}>{p}</Pill>)}
        </div>
        <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{s.notes}</div>
      </Card>
    ))}
  </div>
);

// ── DATABASE ───────────────────────────────────────────────────
const SUPPLEMENT_DB = [
  { name: "Creatine Monohydrate", category: "Performance", purpose: "Strength, power, hydration", evidence: "A",  inStack: true,  doseTypical: "3–5 g/d", notes: "Strongest evidence in supplementation. Loading optional." },
  { name: "Whey Protein Isolate", category: "Protein",     purpose: "Protein top-up, recovery",   evidence: "A",  inStack: true,  doseTypical: "20–40 g/serving", notes: "Best post-training. Casein for slow release." },
  { name: "Vitamin D3 (+K2)",     category: "Vitamin",     purpose: "Immune, bone, mood",          evidence: "A",  inStack: true,  doseTypical: "1000–4000 IU/d", notes: "Pair with K2 (MK-7) to direct Ca to bone." },
  { name: "Omega-3 (EPA/DHA)",    category: "Fatty acid",  purpose: "Inflammation, cognition, CV", evidence: "A",  inStack: true,  doseTypical: "1–3 g EPA+DHA/d", notes: "Triglyceride form > ethyl ester." },
  { name: "Magnesium Glycinate",  category: "Mineral",     purpose: "Sleep, HRV, muscle relax",   evidence: "A",  inStack: true,  doseTypical: "200–400 mg elemental", notes: "Glycinate or citrate; avoid oxide." },
  { name: "Beta-Alanine",         category: "Performance", purpose: "Muscle endurance",            evidence: "B+", inStack: true,  doseTypical: "3.2–6 g/d", notes: "Causes harmless paraesthesia." },
  { name: "Caffeine Anhydrous",   category: "Stimulant",   purpose: "Performance, alertness",     evidence: "A",  inStack: true,  doseTypical: "3–6 mg/kg pre-exercise", notes: "Cycle to maintain sensitivity." },
  { name: "Ashwagandha (KSM-66)", category: "Adaptogen",   purpose: "Cortisol, stress, sleep",    evidence: "B+", inStack: true,  doseTypical: "300–600 mg/d", notes: "8w on / 2w off recommended." },
  { name: "L-Citrulline Malate",  category: "Performance", purpose: "Vasodilation, pump, recovery",evidence: "B",  inStack: false, doseTypical: "6–8 g pre-exercise", notes: "Often confused with arginine." },
  { name: "Zinc Picolinate",      category: "Mineral",     purpose: "Immune, testosterone, sleep",evidence: "B",  inStack: false, doseTypical: "15–30 mg/d", notes: "Long-term needs copper balance." },
  { name: "L-Theanine",           category: "Amino acid",  purpose: "Calm focus (with caffeine)", evidence: "B+", inStack: false, doseTypical: "100–200 mg", notes: "Pairs 1:2 with caffeine." },
  { name: "BCAAs",                category: "Amino acid",  purpose: "Anti-catabolic (claimed)",   evidence: "C",  inStack: false, doseTypical: "5–10 g", notes: "Largely redundant with whole protein." },
  { name: "Tribulus Terrestris",  category: "Adaptogen",   purpose: "Libido (claimed)",            evidence: "D",  inStack: false, doseTypical: "—", notes: "No evidence for testosterone." },
  { name: "Rhodiola Rosea",       category: "Adaptogen",   purpose: "Fatigue, focus, stress",     evidence: "B",  inStack: false, doseTypical: "200–600 mg/d", notes: "Look for 3% rosavins / 1% salidroside." },
  { name: "Tongkat Ali",          category: "Adaptogen",   purpose: "Cortisol, libido, T",        evidence: "B",  inStack: false, doseTypical: "200–400 mg/d", notes: "Recent solid trials; quality varies." },
];

const SuppDatabase = () => {
  const { open } = React.useContext(SuppCtx);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", "Performance", "Protein", "Vitamin", "Mineral", "Fatty acid", "Amino acid", "Adaptogen", "Stimulant"];
  const filtered = SUPPLEMENT_DB.filter(s => {
    if (cat !== "All" && s.category !== cat) return false;
    if (q && !(s.name.toLowerCase().includes(q.toLowerCase()) || s.purpose.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <div style={{flex: 1, position: "relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search 412 supplements · ingredients, purpose, brand…"
            style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px 0 30px", fontSize: 12, outline: "none"}}
          />
        </div>
        <button className="btn"><Icon name="filter" className="ic ic-sm" /> More filters</button>
      </div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap"}}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`pill ${cat === c ? "pill-acc" : ""}`} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{c}</button>
        ))}
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th>Supplement</th>
              <th style={{width: 110}}>Category</th>
              <th>Purpose</th>
              <th style={{width: 130}}>Typical dose</th>
              <th style={{width: 70}}>Evidence</th>
              <th style={{width: 80}}>In stack</th>
              <th style={{width: 80, textAlign: "right"}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.name} className="clickable" style={{cursor: "pointer"}} onClick={() => open("product", {name: s.name, inStack: s.inStack})}>
                <td>
                  <div style={{fontSize: 12.5, fontWeight: 500}}>{s.name}</div>
                  <div className="muted" style={{fontSize: 10.5}}>{s.notes}</div>
                </td>
                <td><Pill>{s.category}</Pill></td>
                <td className="muted" style={{fontSize: 11.5}}>{s.purpose}</td>
                <td className="num" style={{fontSize: 11}}>{s.doseTypical}</td>
                <td>
                  <Pill style={{borderColor: `color-mix(in oklch, ${EVIDENCE_PALETTE[s.evidence]} 40%, var(--border))`, color: EVIDENCE_PALETTE[s.evidence], background: `color-mix(in oklch, ${EVIDENCE_PALETTE[s.evidence]} 8%, transparent)`}}>{s.evidence}</Pill>
                </td>
                <td>{s.inStack ? <Pill variant="pos"><Icon name="check" className="ic ic-sm" />Active</Pill> : <span className="dim" style={{fontSize: 11}}>—</span>}</td>
                <td style={{textAlign: "right"}}>
                  {s.inStack
                    ? <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={e => { e.stopPropagation(); open("product", {name: s.name, inStack: true});}}>View</button>
                    : <button className="btn" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={e => { e.stopPropagation(); open("add", {name: s.name});}}><Icon name="plus" className="ic ic-sm" />Add</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── COMPLIANCE ─────────────────────────────────────────────────
const SuppCompliance = () => {
  const [view, setView] = useState("heatmap");
  return (
    <>
    <div style={{display: "flex", gap: 8, marginBottom: 14}}>
      <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2}}>
        <button className={view === "heatmap" ? "btn btn-primary" : "btn btn-ghost"} style={{height: 26, fontSize: 11, padding: "0 12px", borderRadius: 4}} onClick={() => setView("heatmap")}>Heatmap · 90d</button>
        <button className={view === "calendar" ? "btn btn-primary" : "btn btn-ghost"} style={{height: 26, fontSize: 11, padding: "0 12px", borderRadius: 4}} onClick={() => setView("calendar")}>Calendar · month</button>
      </div>
    </div>
    {view === "calendar" && <CalendarView />}
    {view === "heatmap" && (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <Card title="Compliance heatmap" sub="last 90 days · all supplements">
      <ComplianceHeatmap />
      <div style={{display: "flex", gap: 16, marginTop: 14, fontSize: 11, color: "var(--fg-muted)"}}>
        <div className="row-gap"><span className="dot" style={{background: "var(--pos)"}} />100%</div>
        <div className="row-gap"><span className="dot" style={{background: "color-mix(in oklch, var(--pos) 60%, var(--surface-2))"}} />80–99%</div>
        <div className="row-gap"><span className="dot" style={{background: "var(--warn)"}} />50–79%</div>
        <div className="row-gap"><span className="dot" style={{background: "var(--surface-2)"}} />below / off</div>
      </div>
    </Card>
    <Card title="Streaks · per supplement" sub="current">
      <div className="col-gap">
        {STACK.slice().sort((a, b) => b.streakDays - a.streakDays).map(s => (
          <div key={s.id} className="row">
            <span className="row-l">
              <span className="dot" style={{background: s.streakDays > 200 ? "var(--pos)" : s.streakDays > 60 ? "var(--acc-suppl)" : "var(--warn)"}} />
              <span style={{fontSize: 12}}>{s.name}</span>
            </span>
            <span className="row-r">{s.streakDays} <span className="dim" style={{fontSize: 10}}>days</span></span>
          </div>
        ))}
      </div>
    </Card>

    <Card title="Compliance · key supplements" sub="30 days" style={{gridColumn: "span 2"}}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Supplement</th>
            <th style={{width: 80}}>Taken</th>
            <th style={{width: 80}}>Planned</th>
            <th style={{width: 90, textAlign: "right"}}>Rate</th>
            <th style={{width: 280}}>Last 30d</th>
            <th>Last skip · reason</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: "creatine",    taken: 30, planned: 30, lastSkip: "—", rate: 100 },
            { id: "d3k2",        taken: 30, planned: 30, lastSkip: "—", rate: 100 },
            { id: "omega3",      taken: 28, planned: 30, lastSkip: "May 11 · ran out (re-ordered)", rate: 93 },
            { id: "whey",        taken: 16, planned: 18, lastSkip: "May 9 · cheat-day, skipped", rate: 89 },
            { id: "betaala",     taken: 14, planned: 16, lastSkip: "May 5 · pre-workout meal skipped", rate: 88 },
            { id: "caffeine",    taken: 14, planned: 16, lastSkip: "May 5 · late workout, no caffeine after 17:00", rate: 88 },
            { id: "magnesium",   taken: 30, planned: 30, lastSkip: "—", rate: 100 },
            { id: "ashwagandha", taken: 27, planned: 30, lastSkip: "May 12–14 · cycle-off interpretation error", rate: 90 },
          ].map(c => {
            const s = STACK.find(x => x.id === c.id);
            return (
              <tr key={c.id}>
                <td style={{fontSize: 12}}>{s.name}</td>
                <td className="num">{c.taken}</td>
                <td className="num muted">{c.planned}</td>
                <td className="num" style={{textAlign: "right", color: c.rate === 100 ? "var(--pos)" : c.rate >= 90 ? "var(--fg)" : "var(--warn)"}}>{c.rate}%</td>
                <td><ComplianceStrip rate={c.rate} /></td>
                <td className="muted" style={{fontSize: 11}}>{c.lastSkip}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  </div>
    )}
    </>
  );
};

const ComplianceHeatmap = () => {
  // GitHub-style contributions grid — 13 weeks × 7 days = 91 cells
  const weeks = 13;
  const days = 7;
  let seed = 1;
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < days; d++) {
      seed = (seed * 9301 + 49297) % 233280;
      const r = seed / 233280;
      const v = r > 0.06 ? (r > 0.18 ? 1 : 0.6) : 0.2;
      col.push(v);
    }
    cells.push(col);
  }
  const monthLabels = ["Feb", "", "", "Mar", "", "", "", "Apr", "", "", "", "May", ""];
  return (
    <div>
      <div style={{display: "grid", gridTemplateColumns: "20px 1fr", gap: 4}}>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", fontSize: 9, color: "var(--fg-dim)", fontFamily: "var(--font-mono)", paddingTop: 14}}>
          <span>M</span><span>W</span><span>F</span><span>S</span>
        </div>
        <div>
          <div style={{display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3, marginBottom: 4, fontSize: 9, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
            {monthLabels.map((m, i) => <span key={i} style={{textAlign: "left"}}>{m}</span>)}
          </div>
          <div style={{display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3}}>
            {cells.map((col, ci) => (
              <div key={ci} style={{display: "grid", gridTemplateRows: `repeat(${days}, 1fr)`, gap: 3}}>
                {col.map((v, di) => (
                  <div key={di} style={{
                    aspectRatio: "1",
                    background: v === 1 ? "var(--pos)" : v === 0.6 ? "color-mix(in oklch, var(--pos) 50%, var(--surface-2))" : v === 0.2 ? "var(--warn)" : "var(--surface-2)",
                    opacity: v === 1 ? 0.55 + ((ci * 7 + di) % 40) / 100 : 0.7,
                    borderRadius: 2.5,
                  }} title={`Week ${ci + 1}, day ${di + 1}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplianceStrip = ({ rate }) => {
  const seed = rate * 31;
  return (
    <div style={{display: "flex", gap: 1.5}}>
      {Array.from({ length: 30 }).map((_, i) => {
        const r = ((seed + i * 17) % 100) / 100;
        const taken = r < rate / 100;
        return (
          <div key={i} style={{
            flex: 1, height: 14,
            background: taken ? "var(--pos)" : "var(--surface-2)",
            opacity: taken ? 0.5 + (i / 60) : 1,
            borderRadius: 1.5,
          }} />
        );
      })}
    </div>
  );
};

// ── INTERACTIONS ───────────────────────────────────────────────
const INTERACTIONS = [
  {
    severity: "moderate",
    items: ["Caffeine Anhydrous", "Ashwagandha"],
    title: "Stimulant + adaptogen — opposing autonomic effects",
    body: "Caffeine (taken 17:30) drives sympathetic tone, Ashwagandha (22:00) reduces it. Spacing of >4 hours generally avoids interference — your current schedule is fine, but moving Ashwagandha earlier would blunt its sleep effect.",
    affects: "Sleep onset, HRV recovery",
    recommendation: "Keep ≥4h gap — current schedule (4.5h) is within tolerance."
  },
  {
    severity: "low",
    items: ["Magnesium Glycinate", "Whey Isolate"],
    title: "Mineral + protein — minor absorption competition",
    body: "Whey taken post-workout (~19:30) contains ~250 mg calcium per scoop, which slightly reduces magnesium absorption (~10–15%) if taken within 2 hours. Your Magnesium is at 22:00, giving 2.5h separation.",
    affects: "Mg bioavailability",
    recommendation: "Current 2.5h gap is sufficient. No action needed."
  },
  {
    severity: "info",
    items: ["Vitamin D3", "Vitamin K2 (MK-7)", "Magnesium Glycinate"],
    title: "Bone-health synergy stack",
    body: "D3 → K2 → Mg form a complementary triad: D3 promotes Ca absorption, K2 directs it to bone, Mg activates D3 enzymatically. This is a positive interaction.",
    affects: "Bone density, vascular calcification risk",
    recommendation: "Maintain current stack."
  },
];

const SuppInteractions = () => {
  const { open } = React.useContext(SuppCtx);
  const [scanning, setScanning] = useState(false);
  const reScan = () => { setScanning(true); setTimeout(() => setScanning(false), 1200); };
  return (
  <div>
    <div style={{marginBottom: 14, padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", gap: 12, alignItems: "center"}}>
      <div style={{width: 40, height: 40, borderRadius: 8, background: "color-mix(in oklch, var(--acc-suppl) 18%, transparent)", border: "1px solid color-mix(in oklch, var(--acc-suppl) 35%, transparent)", display: "grid", placeItems: "center", color: "var(--acc-suppl)"}}>
        <Icon name="sparkles" className="ic ic-lg" />
      </div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 2}}>{INTERACTIONS.length} interactions detected across your stack</div>
        <div className="muted" style={{fontSize: 11.5}}>1 moderate · 1 low · 1 informational synergy. No critical conflicts. Last scan: <span className="num" style={{color: "var(--fg)"}}>14 May</span>.</div>
      </div>
      <button className="btn" onClick={reScan} disabled={scanning}><Icon name={scanning ? "sparkles" : "refresh"} className="ic ic-sm" /> {scanning ? "Scanning…" : "Re-scan"}</button>
    </div>

    <div className="col-gap" style={{gap: 12}}>
      {INTERACTIONS.map((iv, i) => (
        <Card key={i} style={{cursor: "pointer"}} onClick={() => open("interaction", iv)}>
          <div style={{display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12}}>
            <div style={{
              width: 4, alignSelf: "stretch", borderRadius: 2,
              background: iv.severity === "moderate" ? "var(--warn)" : iv.severity === "low" ? "var(--acc-recov)" : "var(--pos)"
            }} />
            <div style={{flex: 1}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                <Pill variant={iv.severity === "moderate" ? "warn" : iv.severity === "low" ? "" : "pos"}>
                  {iv.severity === "moderate" ? "Moderate" : iv.severity === "low" ? "Low" : "Synergy"}
                </Pill>
                {iv.items.map(it => <Pill key={it}>{it}</Pill>)}
              </div>
              <div style={{fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em"}}>{iv.title}</div>
              <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>{iv.body}</div>
              <div style={{display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 4, fontSize: 11.5}}>
                <span className="eyebrow">Affects</span>
                <span className="muted">{iv.affects}</span>
                <span className="eyebrow">Recommendation</span>
                <span>{iv.recommendation}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
  );
};

// ── COST ───────────────────────────────────────────────────────
const SuppCost = () => {
  const monthlyTotal = STACK.reduce((s, x) => s + x.monthlyCost, 0);
  const annualTotal = monthlyTotal * 12;
  const trend = [82, 79, 84, 88, 91, 86, 90, 94, 89, 88, 92, monthlyTotal];

  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 14}}>
        <div className="grid g-cols-3" style={{gap: 12}}>
          <Card className="card-tight" style={{padding: 14}}>
            <div className="eyebrow" style={{marginBottom: 4}}>Monthly</div>
            <div className="num" style={{fontSize: 22, fontWeight: 500}}>€{monthlyTotal.toFixed(2)}</div>
            <div className="muted" style={{fontSize: 11}}>+ €4.20 vs Apr</div>
          </Card>
          <Card className="card-tight" style={{padding: 14}}>
            <div className="eyebrow" style={{marginBottom: 4}}>Annual run-rate</div>
            <div className="num" style={{fontSize: 22, fontWeight: 500}}>€{annualTotal.toFixed(0)}</div>
            <div className="muted" style={{fontSize: 11}}>12 × current</div>
          </Card>
          <Card className="card-tight" style={{padding: 14}}>
            <div className="eyebrow" style={{marginBottom: 4}}>Per active day</div>
            <div className="num" style={{fontSize: 22, fontWeight: 500}}>€{(monthlyTotal / 30).toFixed(2)}</div>
            <div className="muted" style={{fontSize: 11}}>8 items · ~26 doses</div>
          </Card>
        </div>

        <Card title="Cost · 12 months trend" sub="rolling monthly spend">
          <LineChart
            h={180}
            series={[{ data: trend, color: "var(--acc-suppl)" }]}
            xLabels={["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]}
            range={[70, 110]}
          />
        </Card>

        <Card title="Spend per supplement · this month">
          <table className="tbl">
            <thead>
              <tr>
                <th>Supplement</th>
                <th style={{width: 130}}>Distribution</th>
                <th style={{width: 80, textAlign: "right"}}>€/mo</th>
                <th style={{width: 80, textAlign: "right"}}>€/day*</th>
                <th style={{width: 60, textAlign: "right"}}>%</th>
              </tr>
            </thead>
            <tbody>
              {STACK.slice().sort((a, b) => b.monthlyCost - a.monthlyCost).map(s => {
                const pct = (s.monthlyCost / monthlyTotal) * 100;
                const activeDays = s.days.reduce((sum, d) => sum + d, 0) * 4.3; // per month
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td><Meter value={pct} color="var(--acc-suppl)" tall /></td>
                    <td className="num" style={{textAlign: "right"}}>€{s.monthlyCost.toFixed(2)}</td>
                    <td className="num" style={{textAlign: "right", color: "var(--fg-dim)"}}>€{(s.monthlyCost / activeDays).toFixed(2)}</td>
                    <td className="num" style={{textAlign: "right"}}>{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="dim" style={{fontSize: 10, marginTop: 8}}>* € per active-day, accounting for non-daily items (whey 5/7, pre-workout 4/7).</div>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Category split">
          <div className="col-gap" style={{gap: 8}}>
            {[
              { c: "Performance",   v: STACK.filter(s => ["creatine", "betaala", "caffeine"].includes(s.id)).reduce((a, b) => a + b.monthlyCost, 0), color: "var(--acc-train)" },
              { c: "Recovery",      v: STACK.filter(s => ["magnesium", "ashwagandha"].includes(s.id)).reduce((a, b) => a + b.monthlyCost, 0), color: "var(--acc-recov)" },
              { c: "Foundation",    v: STACK.filter(s => ["d3k2", "omega3"].includes(s.id)).reduce((a, b) => a + b.monthlyCost, 0), color: "var(--acc-suppl)" },
              { c: "Protein",       v: STACK.filter(s => ["whey"].includes(s.id)).reduce((a, b) => a + b.monthlyCost, 0), color: "var(--acc-nutri)" },
            ].map(c => (
              <div key={c.c} style={{display: "grid", gridTemplateColumns: "100px 1fr 60px", gap: 10, alignItems: "center", fontSize: 11}}>
                <span style={{color: "var(--fg-muted)"}}>{c.c}</span>
                <div style={{flex: 1}}><Meter value={c.v} max={monthlyTotal} color={c.color} tall /></div>
                <span className="num" style={{textAlign: "right"}}>€{c.v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="If you removed…" sub="cost-per-effect quick reference">
          <div className="muted" style={{fontSize: 11.5, marginBottom: 10, lineHeight: 1.55}}>
            Hypothetical monthly savings if individual items were dropped. Use with Buddy's effect analysis for trade-offs.
          </div>
          {STACK.slice().sort((a, b) => b.monthlyCost - a.monthlyCost).slice(0, 4).map(s => (
            <div key={s.id} className="row">
              <span className="row-l"><span style={{fontSize: 12}}>− {s.name}</span></span>
              <span className="row-r" style={{color: "var(--pos)"}}>save €{s.monthlyCost.toFixed(2)}/mo</span>
            </div>
          ))}
        </Card>

        <Card title="Cost optimization · suggestions">
          <div className="col-gap" style={{gap: 8}}>
            <div style={{padding: 10, background: "color-mix(in oklch, var(--acc-recov) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-recov) 25%, var(--border))", borderRadius: 6}}>
              <div style={{fontSize: 12, fontWeight: 500, marginBottom: 3}}>Bulk Nordic Naturals via subscription</div>
              <div className="muted" style={{fontSize: 11}}>Save ~€7/mo on Omega-3 with quarterly auto-ship.</div>
            </div>
            <div style={{padding: 10, background: "color-mix(in oklch, var(--acc-recov) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-recov) 25%, var(--border))", borderRadius: 6}}>
              <div style={{fontSize: 12, fontWeight: 500, marginBottom: 3}}>Switch creatine to 1kg pouch</div>
              <div className="muted" style={{fontSize: 11}}>Per-gram cost drops 22% — save €1.80/mo, ~€22/year.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── EXTENDED STACK ─────────────────────────────────────────────
// Tom is a serious athlete (35+) on physician-supervised TRT + recovery peptides.
// This surface is gated, logs labs, and integrates with Medical bloodwork.
const EXTENDED_STACK = [
  {
    id: "test-c",
    name: "Testosterone Cypionate",
    category: "Hormone",
    protocol: "TRT · physician supervised",
    dose: "150 mg",
    schedule: "Mon + Thu · IM glute",
    cycleType: "continuous",
    cycleWeek: null,
    started: "2024-09-12",
    physician: "Dr. M. Kessler · Endokrinologie Berlin",
    prescription: "RX-44102 · valid through 2026-09",
    halfLife: "8 days",
    nextDose: "Mon May 18 · 07:00",
    monthlyCost: 64.00,
    sideEffectScore: 1, // 0-3
    bloodMarkers: ["Total T", "Free T", "E2 (sens)", "Hematocrit", "PSA", "Lipid panel"],
    lastLab: "2026-04-23",
    nextLab: "2026-07-15",
    labStatus: "in_range",
    notes: "Trough-target: total T 600-800 ng/dL. E2 controlled with low-dose anastrozole. HCT trending 48% — within range.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
  {
    id: "hcg",
    name: "HCG (Human Chorionic Gonadotropin)",
    category: "Hormone",
    protocol: "Testicular preservation · w/ TRT",
    dose: "500 IU",
    schedule: "Tue + Fri · SubQ",
    cycleType: "continuous",
    cycleWeek: null,
    started: "2024-09-12",
    physician: "Dr. M. Kessler",
    prescription: "RX-44103",
    halfLife: "33 hours",
    nextDose: "Tue May 19 · 09:00",
    monthlyCost: 38.50,
    sideEffectScore: 0,
    bloodMarkers: ["LH", "FSH", "Estradiol"],
    lastLab: "2026-04-23",
    nextLab: "2026-07-15",
    labStatus: "in_range",
    notes: "Maintains testicular function and fertility during TRT.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
  {
    id: "anastrozole",
    name: "Anastrozole (Arimidex)",
    category: "Estrogen control",
    protocol: "Aromatase inhibitor · w/ TRT",
    dose: "0.25 mg",
    schedule: "Every 3rd day",
    cycleType: "as_needed",
    cycleWeek: null,
    started: "2024-10-04",
    physician: "Dr. M. Kessler",
    prescription: "RX-44104",
    halfLife: "46 hours",
    nextDose: "Sun May 18",
    monthlyCost: 12.20,
    sideEffectScore: 1,
    bloodMarkers: ["Estradiol (sensitive)"],
    lastLab: "2026-04-23",
    nextLab: "2026-07-15",
    labStatus: "in_range",
    notes: "Titrate by E2 sensitive — aim 20-30 pg/mL. Last reading 26.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
  {
    id: "mk677",
    name: "MK-677 (Ibutamoren)",
    category: "GH secretagogue",
    protocol: "Recovery + sleep depth",
    dose: "10 mg",
    schedule: "Daily · evening, oral",
    cycleType: "cycled",
    cycleWeek: 7,
    cycleTotalWeeks: 12,
    cycleOffWeeks: 8,
    started: "2026-03-30",
    halfLife: "6 hours",
    nextDose: "Today · 22:00",
    monthlyCost: 48.00,
    sideEffectScore: 2,
    bloodMarkers: ["IGF-1", "Fasting glucose", "HbA1c"],
    lastLab: "2026-04-23",
    nextLab: "2026-06-01",
    labStatus: "watch",
    notes: "Watch fasting glucose — last reading 102 mg/dL (up from 88). Considering early cycle-off if reaches 110.",
    coachVisible: false,
    nutriCoachVisible: true,
    medicalCoachVisible: true,
  },
  {
    id: "bpc157",
    name: "BPC-157",
    category: "Healing peptide",
    protocol: "Tendon repair · right elbow",
    dose: "250 µg",
    schedule: "Daily · SubQ near site",
    cycleType: "cycled",
    cycleWeek: 4,
    cycleTotalWeeks: 6,
    cycleOffWeeks: 4,
    started: "2026-04-22",
    halfLife: "4 hours",
    nextDose: "Today · 07:30",
    monthlyCost: 32.00,
    sideEffectScore: 0,
    bloodMarkers: [],
    lastLab: null,
    nextLab: null,
    labStatus: "not_required",
    notes: "Targeted injection site at right lateral epicondyle. 2 weeks left in 6w protocol.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
];

const EXTENDED_LABS = [
  { marker: "Total Testosterone", value: 712,  unit: "ng/dL", range: "600–900",  status: "in_range",   trend: "stable" },
  { marker: "Free Testosterone",  value: 18.4, unit: "ng/dL", range: "15–25",    status: "in_range",   trend: "up" },
  { marker: "Estradiol (sens.)",  value: 26,   unit: "pg/mL", range: "20–35",    status: "in_range",   trend: "stable" },
  { marker: "LH",                 value: 4.2,  unit: "IU/L",  range: "1.7–8.6",  status: "in_range",   trend: "stable" },
  { marker: "FSH",                value: 3.8,  unit: "IU/L",  range: "1.5–12.4", status: "in_range",   trend: "stable" },
  { marker: "Hematocrit",         value: 48,   unit: "%",     range: "39–50",    status: "watch",      trend: "up" },
  { marker: "PSA",                value: 0.9,  unit: "ng/mL", range: "<2.5",     status: "in_range",   trend: "stable" },
  { marker: "IGF-1",              value: 286,  unit: "ng/mL", range: "115–355",  status: "in_range",   trend: "up" },
  { marker: "Fasting glucose",    value: 102,  unit: "mg/dL", range: "70–99",    status: "out_of_range", trend: "up" },
  { marker: "HbA1c",              value: 5.4,  unit: "%",     range: "<5.7",     status: "in_range",   trend: "stable" },
  { marker: "ALT",                value: 28,   unit: "U/L",   range: "<40",      status: "in_range",   trend: "stable" },
  { marker: "Total cholesterol",  value: 184,  unit: "mg/dL", range: "<200",     status: "in_range",   trend: "stable" },
];

const SuppExtended = () => {
  const { open } = React.useContext(SuppCtx);
  const [unlocked, setUnlocked] = useState(false);
  const [drawer, setDrawer] = useState(null);

  if (!unlocked) return <ExtendedGate onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <ExtendedHeader />
      <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 16}}>
        <div className="col-gap" style={{gap: 14}}>
          <Card title="Active protocols" sub={`${EXTENDED_STACK.length} compounds · physician-supervised`} actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("catalogAddEnh")}><Icon name="plus" className="ic ic-sm" /> Add compound</button>}>
            <div className="col-gap" style={{gap: 8}}>
              {EXTENDED_STACK.map(c => <ExtendedCompoundCard key={c.id} c={c} onClick={() => setDrawer(c.id)} />)}
            </div>
          </Card>
          <CycleTimeline />
          <Card title="Side effect log" sub="last 7 days" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("addSideEffect")}>Add entry</button>}>
            <SideEffectLog />
          </Card>
        </div>
        <div className="col-gap" style={{gap: 14}}>
          <BloodworkPanel />
          <Card title="Visibility · who sees what" sub="permissions per coach">
            <div className="col-gap" style={{gap: 6}}>
              <Row label="Medical coach (Dr. Kessler)" value="full" sub="all compounds + labs" />
              <Row label="Nutrition coach (J. Bauer)"  value="MK-677 only" sub="metabolic relevance" />
              <Row label="Training coach (Anders)"     value="hidden" sub="opt-in required" />
              <Row label="Buddy (AI)"                  value="aggregate" sub="trends, no compounds" />
            </div>
            <div className="divider" />
            <div style={{display: "flex", gap: 6}}>
              <button className="btn" onClick={() => open("permissions")}><Icon name="edit" className="ic ic-sm" /> Edit permissions</button>
              <button className="btn btn-ghost">Audit log</button>
            </div>
          </Card>
          <Card title="Half-life · this week">
            <HalfLifeChart />
          </Card>
        </div>
      </div>
      {drawer && <ExtendedDrawer compound={EXTENDED_STACK.find(c => c.id === drawer)} onClose={() => setDrawer(null)} />}
    </>
  );
};

const ExtendedGate = ({ onUnlock }) => (
  <div style={{maxWidth: 520, margin: "60px auto 0", textAlign: "center"}}>
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: "color-mix(in oklch, var(--acc-medic) 12%, var(--surface))",
      border: "1px solid color-mix(in oklch, var(--acc-medic) 30%, var(--border))",
      color: "var(--acc-medic)", display: "grid", placeItems: "center",
      margin: "0 auto 16px"
    }}>
      <Icon name="medical" className="ic" style={{width: 24, height: 24}} />
    </div>
    <div style={{fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8}}>Extended supplements — gated</div>
    <div className="muted" style={{fontSize: 13, lineHeight: 1.55, marginBottom: 24}}>
      This surface tracks prescription hormones, peptides, and research compounds. It is a personal log of what you and your physician already manage — LumeOS does not prescribe, advise, or distribute. Visibility to coaches is opt-in per coach and per compound.
    </div>
    <div style={{textAlign: "left", border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 8, padding: 16, marginBottom: 16}}>
      <div className="eyebrow" style={{marginBottom: 10}}>Before you unlock</div>
      <div className="col-gap" style={{gap: 6, fontSize: 12, color: "var(--fg-muted)"}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: 8}}>
          <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)", marginTop: 2, flexShrink: 0}} />
          You are tracking, not seeking advice. LumeOS will not suggest dosing.
        </div>
        <div style={{display: "flex", alignItems: "flex-start", gap: 8}}>
          <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)", marginTop: 2, flexShrink: 0}} />
          Each compound requires a physician name and (optional) prescription reference.
        </div>
        <div style={{display: "flex", alignItems: "flex-start", gap: 8}}>
          <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)", marginTop: 2, flexShrink: 0}} />
          Coach visibility is locked off by default. You opt in per coach.
        </div>
        <div style={{display: "flex", alignItems: "flex-start", gap: 8}}>
          <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)", marginTop: 2, flexShrink: 0}} />
          Bloodwork from Medical syncs here. Out-of-range markers raise warnings, not prompts to act.
        </div>
      </div>
    </div>
    <div style={{display: "flex", gap: 8, justifyContent: "center"}}>
      <button className="btn btn-primary" onClick={onUnlock}>I understand · unlock</button>
      <button className="btn btn-ghost">Read disclosure</button>
    </div>
  </div>
);

const ExtendedHeader = () => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: 12,
    background: "color-mix(in oklch, var(--acc-medic) 5%, var(--surface))",
    border: "1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))",
    borderRadius: 8, marginBottom: 0
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 7,
      background: "color-mix(in oklch, var(--acc-medic) 18%, transparent)",
      border: "1px solid color-mix(in oklch, var(--acc-medic) 35%, transparent)",
      color: "var(--acc-medic)", display: "grid", placeItems: "center"
    }}><Icon name="medical" className="ic" /></div>
    <div style={{flex: 1}}>
      <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 2}}>
        <span style={{fontSize: 13, fontWeight: 600}}>Extended supplements · log</span>
        <Pill style={{borderColor: "color-mix(in oklch, var(--acc-medic) 30%, var(--border))", color: "var(--acc-medic)", background: "color-mix(in oklch, var(--acc-medic) 6%, transparent)"}}>Tracking only</Pill>
        <Pill variant="acc">Physician supervised</Pill>
      </div>
      <div className="muted" style={{fontSize: 11.5}}>Dr. M. Kessler · Endokrinologie Berlin · last visit 23 Apr · next 15 Jul</div>
    </div>
    <button className="btn btn-ghost"><Icon name="bookmark" className="ic ic-sm" />Disclosure</button>
    <button className="btn"><Icon name="medical" className="ic ic-sm" />Open Medical →</button>
  </div>
);

const ExtendedCompoundCard = ({ c, onClick }) => {
  const labColor = c.labStatus === "in_range" ? "var(--pos)" : c.labStatus === "watch" ? "var(--warn)" : c.labStatus === "out_of_range" ? "var(--neg)" : "var(--fg-dim)";
  return (
    <div onClick={onClick} style={{
      padding: 12,
      background: "var(--bg-elev)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      cursor: "pointer",
      position: "relative"
    }}>
      <div style={{
        position: "absolute", left: 0, top: 12, bottom: 12,
        width: 2, background: "var(--acc-medic)", borderRadius: "0 2px 2px 0"
      }} />
      <div style={{display: "flex", alignItems: "flex-start", gap: 10, paddingLeft: 8}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
            <span style={{fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em"}}>{c.name}</span>
            <Pill>{c.category}</Pill>
            {c.cycleType === "continuous" && <Pill variant="acc">continuous</Pill>}
            {c.cycleType === "cycled" && <Pill style={{borderColor: "color-mix(in oklch, var(--warn) 30%, var(--border))", color: "var(--warn)", background: "color-mix(in oklch, var(--warn) 6%, transparent)"}}>Wk {c.cycleWeek}/{c.cycleTotalWeeks}</Pill>}
            {c.cycleType === "as_needed" && <Pill>as-needed</Pill>}
          </div>
          <div className="muted" style={{fontSize: 11.5, marginBottom: 8, lineHeight: 1.45}}>{c.protocol}</div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, fontSize: 11}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 2}}>Dose</div>
              <div className="num">{c.dose}</div>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 2}}>Schedule</div>
              <div>{c.schedule}</div>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 2}}>Half-life</div>
              <div className="num">{c.halfLife}</div>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 2}}>Next dose</div>
              <div className="num">{c.nextDose}</div>
            </div>
          </div>
          {c.cycleType === "cycled" && (
            <div style={{marginTop: 10}}>
              <Meter value={c.cycleWeek} max={c.cycleTotalWeeks} color="var(--acc-medic)" />
              <div className="dim" style={{fontSize: 10, marginTop: 3, fontFamily: "var(--font-mono)"}}>
                {c.cycleTotalWeeks - c.cycleWeek} wk remaining · then {c.cycleOffWeeks}w off
              </div>
            </div>
          )}
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0}}>
          {c.labStatus !== "not_required" && (
            <div style={{display: "flex", alignItems: "center", gap: 5}}>
              <span className="dot" style={{background: labColor}} />
              <span className="num" style={{fontSize: 10, color: labColor}}>labs {c.labStatus.replace("_", " ")}</span>
            </div>
          )}
          {c.prescription && (
            <span className="num dim" style={{fontSize: 10}}>{c.prescription}</span>
          )}
          <span className="num dim" style={{fontSize: 10}}>€{c.monthlyCost.toFixed(2)}/mo</span>
        </div>
      </div>
    </div>
  );
};

const CycleTimeline = () => {
  const { open } = React.useContext(SuppCtx);
  // 16 weeks visualization
  const weeks = Array.from({length: 16}, (_, i) => i + 1);
  const cycles = [
    { name: "Testosterone Cyp.", color: "var(--acc-medic)",  bars: weeks.map(() => "on") },
    { name: "HCG",                color: "var(--acc-medic)",  bars: weeks.map(() => "on") },
    { name: "Anastrozole",        color: "var(--acc-suppl)", bars: weeks.map(() => "on") },
    { name: "MK-677",             color: "var(--acc-buddy)", bars: weeks.map((w, i) => i < 7 ? "past" : i < 12 ? "on" : "off") },
    { name: "BPC-157",            color: "var(--acc-recov)", bars: weeks.map((w, i) => i < 1 ? "off" : i < 7 ? "past" : i < 10 ? "on" : "off") },
  ];
  return (
    <Card title="Cycle timeline · 16 weeks" sub="Apr 7 → Jul 28" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("planCycle")}>Plan next cycle</button>}>
      <div style={{display: "grid", gridTemplateColumns: "140px 1fr", gap: 8, alignItems: "center"}}>
        <div></div>
        <div style={{display: "grid", gridTemplateColumns: `repeat(16, 1fr)`, gap: 2, fontSize: 9, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
          {weeks.map(w => <span key={w} style={{textAlign: "center"}}>{w}</span>)}
        </div>
        {cycles.map(cy => (
          <React.Fragment key={cy.name}>
            <div style={{fontSize: 11, color: "var(--fg-muted)"}}>{cy.name}</div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: 2}}>
              {cy.bars.map((state, i) => (
                <div key={i} style={{
                  height: 16,
                  borderRadius: 2,
                  background: state === "on" ? cy.color : state === "past" ? `color-mix(in oklch, ${cy.color} 35%, var(--surface-2))` : "var(--surface-2)",
                  opacity: state === "past" ? 0.5 : state === "off" ? 1 : 0.85,
                  border: i === 6 ? "1px solid var(--fg)" : undefined,
                }} title={`Week ${i + 1} · ${state}`} />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "flex", gap: 14, marginTop: 12, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--acc-medic)", borderRadius: 2}} /> Active</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "color-mix(in oklch, var(--acc-medic) 35%, var(--surface-2))", borderRadius: 2}} /> Past</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--surface-2)", borderRadius: 2}} /> Off / planned</span>
        <span className="row-gap" style={{marginLeft: "auto"}}><span style={{width: 2, height: 10, background: "var(--fg)"}} /> This week (Wk 7)</span>
      </div>
    </Card>
  );
};

const BloodworkPanel = () => {
  const { open } = React.useContext(SuppCtx);
  return (
  <Card title="Bloodwork · linked from Medical" sub="last panel · 23 Apr 2026" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}>Open Medical <Icon name="arrow_right" className="ic ic-sm" /></button>}>
    <div className="col-gap" style={{gap: 0}}>
      {EXTENDED_LABS.map((l, i) => {
        const color = l.status === "in_range" ? "var(--pos)" : l.status === "watch" ? "var(--warn)" : "var(--neg)";
        return (
          <div key={i} className="row" style={{padding: "7px 0", fontSize: 11.5}}>
            <span className="row-l">
              <span className="dot" style={{background: color}} />
              {l.marker}
              <span className="dim" style={{fontSize: 10}}>{l.range} {l.unit}</span>
            </span>
            <span className="row-r" style={{display: "flex", alignItems: "center", gap: 6}}>
              {l.trend === "up" && <Icon name="trend_up" className="ic ic-sm" style={{color: l.status === "in_range" ? "var(--fg-dim)" : color}} />}
              {l.trend === "down" && <Icon name="trend_down" className="ic ic-sm" style={{color: "var(--fg-dim)"}} />}
              <span style={{color}}>{l.value}<span className="dim" style={{marginLeft: 3, fontSize: 10}}>{l.unit}</span></span>
            </span>
          </div>
        );
      })}
    </div>
    <div className="divider" />
    <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--fg-muted)"}}>
      <Icon name="alert" className="ic ic-sm" style={{color: "var(--warn)"}} />
      <span>Fasting glucose 102 mg/dL — slight rise (+14 since pre-MK677). Watch.</span>
    </div>
    <div style={{display: "flex", gap: 6, marginTop: 10}}>
      <button className="btn" onClick={() => open("addLab")}>Schedule next panel · Jul 15</button>
      <button className="btn btn-ghost"><Icon name="download" className="ic ic-sm" />Export PDF</button>
    </div>
  </Card>
  );
};

const SideEffectLog = () => {
  const entries = [
    { date: "May 14", compound: "MK-677",        severity: 2, note: "Increased appetite, mild water retention. Sleep depth +.",  score: 2 },
    { date: "May 11", compound: "Anastrozole",   severity: 1, note: "Slight joint dryness — within tolerance.",                    score: 1 },
    { date: "May 7",  compound: "Test Cyp.",     severity: 0, note: "No noted effects.",                                            score: 0 },
    { date: "May 3",  compound: "MK-677",        severity: 2, note: "Vivid dreams x3 nights · slight numbness in fingertips.",      score: 2 },
    { date: "Apr 28", compound: "BPC-157",       severity: 0, note: "Reduced elbow pain · functional improvement.",                 score: 0 },
  ];
  return (
    <div className="col-gap" style={{gap: 0}}>
      {entries.map((e, i) => (
        <div key={i} style={{padding: "9px 0", borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none"}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
            <span className="num dim" style={{fontSize: 10, width: 50}}>{e.date}</span>
            <span style={{fontSize: 12, fontWeight: 500}}>{e.compound}</span>
            <div style={{marginLeft: "auto", display: "flex", gap: 2}}>
              {[0, 1, 2, 3].map(s => (
                <div key={s} style={{
                  width: 14, height: 5, borderRadius: 1,
                  background: s <= e.severity ? (e.severity >= 2 ? "var(--warn)" : "var(--pos)") : "var(--surface-2)"
                }} />
              ))}
            </div>
          </div>
          <div className="muted" style={{fontSize: 11, lineHeight: 1.4, paddingLeft: 58}}>{e.note}</div>
        </div>
      ))}
    </div>
  );
};

const HalfLifeChart = () => {
  // simulate weekly testosterone trough/peak from twice-weekly injection
  const days = 14;
  const points = [];
  const injectionDays = [0, 3, 7, 10]; // Mon Thu Mon Thu
  for (let d = 0; d <= days * 4; d++) {
    const day = d / 4;
    let level = 0;
    injectionDays.forEach(inj => {
      const t = day - inj;
      if (t < 0) return;
      // Exponential decay with 8-day half life, peaking after 1 day
      const peak = t < 1 ? t : 1;
      const decay = Math.pow(0.5, Math.max(0, t - 1) / 8);
      level += peak * decay * 80;
    });
    points.push(700 + level);
  }
  return (
    <>
      <LineChart
        h={140}
        series={[{ data: points, color: "var(--acc-medic)" }]}
        range={[650, 900]}
        xLabels={["Mon", "", "Wed", "", "Fri", "", "Sun", "Mon", "", "Wed", "", "Fri", "", "Sun"]}
      />
      <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
        <span>Trough <span className="num" style={{color: "var(--fg)"}}>~702</span></span>
        <span>Peak <span className="num" style={{color: "var(--fg)"}}>~862</span></span>
        <span>Avg <span className="num" style={{color: "var(--fg)"}}>~780 ng/dL</span></span>
      </div>
    </>
  );
};

const ExtendedDrawer = ({ compound: c, onClose }) => {
  const { open } = React.useContext(SuppCtx);
  return (
  <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "grid", placeItems: "center", animation: "fade 0.15s"}} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{
      width: 640, maxWidth: "92vw", maxHeight: "86vh",
      background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 12,
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      <div style={{padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div className="eyebrow" style={{marginBottom: 4}}>{c.category}</div>
          <div style={{fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 6}}>{c.name}</div>
          <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
            <Pill>{c.protocol}</Pill>
            {c.cycleType === "continuous" && <Pill variant="acc">continuous</Pill>}
            {c.cycleType === "cycled" && <Pill style={{color: "var(--warn)"}}>Wk {c.cycleWeek}/{c.cycleTotalWeeks}</Pill>}
          </div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic" /></button>
      </div>
      <div style={{padding: 18, overflowY: "auto", flex: 1}}>
        <div className="grid g-cols-2" style={{gap: 10, marginBottom: 16}}>
          <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)"}}>
            <div className="eyebrow" style={{marginBottom: 3}}>Dose · schedule</div>
            <div className="num" style={{fontSize: 14}}>{c.dose}</div>
            <div className="muted" style={{fontSize: 11, marginTop: 2}}>{c.schedule}</div>
          </div>
          <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)"}}>
            <div className="eyebrow" style={{marginBottom: 3}}>Half-life</div>
            <div className="num" style={{fontSize: 14}}>{c.halfLife}</div>
            <div className="muted" style={{fontSize: 11, marginTop: 2}}>Next dose · {c.nextDose}</div>
          </div>
          {c.physician && (
            <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)"}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Physician</div>
              <div style={{fontSize: 12}}>{c.physician}</div>
              <div className="muted num" style={{fontSize: 10, marginTop: 2}}>{c.prescription}</div>
            </div>
          )}
          <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)"}}>
            <div className="eyebrow" style={{marginBottom: 3}}>Cost · month</div>
            <div className="num" style={{fontSize: 14}}>€{c.monthlyCost.toFixed(2)}</div>
            <div className="muted" style={{fontSize: 11, marginTop: 2}}>Started {c.started}</div>
          </div>
        </div>
        <div className="eyebrow" style={{marginBottom: 8}}>Notes</div>
        <div style={{fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 16}}>{c.notes}</div>
        {c.bloodMarkers.length > 0 && (
          <>
            <div className="eyebrow" style={{marginBottom: 8}}>Bloodwork to monitor</div>
            <div style={{display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16}}>
              {c.bloodMarkers.map(m => <Pill key={m}>{m}</Pill>)}
            </div>
            <div style={{padding: 10, background: "color-mix(in oklch, var(--acc-medic) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", marginBottom: 16}}>
              Last panel: <span className="num" style={{color: "var(--fg)"}}>{c.lastLab}</span> ·
              Next: <span className="num" style={{color: "var(--fg)"}}>{c.nextLab || "—"}</span> ·
              Status: <span style={{color: c.labStatus === "in_range" ? "var(--pos)" : c.labStatus === "watch" ? "var(--warn)" : "var(--neg)"}}>{c.labStatus.replace("_", " ")}</span>
            </div>
          </>
        )}
        <div className="eyebrow" style={{marginBottom: 8}}>Visibility</div>
        <div className="col-gap" style={{gap: 4}}>
          <Row label="Medical coach" value={c.medicalCoachVisible ? "visible" : "hidden"} />
          <Row label="Nutrition coach" value={c.nutriCoachVisible ? "visible" : "hidden"} />
          <Row label="Training coach" value={c.coachVisible ? "visible" : "hidden"} />
        </div>
      </div>
      <div style={{padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 6, justifyContent: "flex-end"}}>
        <button className="btn btn-ghost" onClick={() => { onClose(); setTimeout(() => open("addCompound"), 50); }}><Icon name="edit" className="ic ic-sm" />Edit protocol</button>
        <button className="btn" onClick={() => { onClose(); setTimeout(() => open("logDose", c), 50); }}><Icon name="check" className="ic ic-sm" />Log dose</button>
      </div>
    </div>
  </div>
  );
};

window.SupplementsModule = SupplementsModule;
