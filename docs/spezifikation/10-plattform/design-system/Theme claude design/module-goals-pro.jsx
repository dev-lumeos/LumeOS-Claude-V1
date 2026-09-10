// Goals & Body · pro features — Phase State Machine, Adaptive TDEE, Cross-Module
// Contributions, Bottleneck, Achievement Probability, Ratios, IFBB Poses, Weekly Report

// ── Phase models (per PHASE_MODELS.md) ────────────────────
const GOAL_PHASES = {
  fat_loss: {
    id: "fat_loss", name: "Fat Loss", color: "var(--acc-suppl)",
    variants: {
      moderate:   { deficit: [-400, -600],  rate: "0.5–0.75% BW/wk", protein: [1.8, 2.4], maxWeeks: 20, dietBreak: "1 wk every 8" },
      aggressive: { deficit: [-750, -1000], rate: "1.0–1.5% BW/wk",  protein: [2.3, 3.1], maxWeeks: 8,  dietBreak: "1 wk every 4" },
    },
    guards: ["strength_loss > 10% → reduce deficit", "weekly_loss > 1.0kg → +150 kcal", "duration > max → force transition"],
    next: ["reverse_diet", "maintenance", "lean_bulk"],
  },
  lean_bulk: {
    id: "lean_bulk", name: "Lean Bulk", color: "var(--acc-train)",
    params: { surplus: [200, 400], rate: "0.25–0.5% BW/month", protein: [1.6, 2.2], fatPct: [25, 35], maxWeeks: 52 },
    guards: ["bf_increase > 2% in 4 wk → −100 kcal", "gain > 1kg/wk → surplus too high", "no strength 3+ wk → check training"],
    next: ["mini_cut", "maintenance", "contest_prep"],
  },
  maintenance: {
    id: "maintenance", name: "Maintenance", color: "var(--acc-recov)",
    params: { target: "TDEE ± 100", protein: [1.4, 2.0], duration: "indefinite" },
    purpose: ["Stabilisierung nach Cut/Bulk", "Langfristige Ernährung", "Lifestyle Mode"],
    next: ["fat_loss", "lean_bulk", "recomp", "contest_prep"],
  },
  recomp: {
    id: "recomp", name: "Recomposition", color: "var(--acc-goals)",
    params: { trainingDays: "+200 kcal", restDays: "−300 kcal", weeklyAvg: "~maintenance", protein: [2.0, 2.4] },
    success: ["BF% fallend", "Kraft steigend", "Gewicht stabil"],
    bestFor: ["Anfänger", "Nach Trainingspause", "Muscle Memory"],
    next: ["lean_bulk", "fat_loss"],
  },
  contest_prep: {
    id: "contest_prep", name: "Contest Prep", color: "var(--neg)",
    params: { duration: "16–24 wk", protein: [2.3, 3.1] },
    subPhases: [
      { name: "early",     weeks: "24–16", deficit: -300, cardio: "low" },
      { name: "mid",       weeks: "16–8",  deficit: -600, cardio: "moderate" },
      { name: "late",      weeks: "8–2",   deficit: -750, cardio: "high" },
      { name: "peak_week", weeks: "1",     special: true },
    ],
    refeeds: "1–2×/wk after week 8 · high carb",
    peakWeek: "3d carb depletion · 2d carb load · sodium manipulation",
    guards: ["BF% < 5% (M) / < 10% (F) → health warning", "strength_loss > 20% → reduce deficit", "hormonal symptoms → medical check"],
    next: ["reverse_diet"],
  },
  reverse_diet: {
    id: "reverse_diet", name: "Reverse Diet", color: "var(--acc-coach)",
    params: { weeklyIncrease: [50, 150], primaryMacro: "carbs", protein: "maintain", maxWeeks: 16 },
    exits: ["reached estimated TDEE", "gain > 0.5kg/wk", "user satisfied"],
    guards: ["weekly gain > 0.5kg → slow increase", "hunger normalized → close to TDEE"],
    next: ["maintenance", "lean_bulk", "fat_loss"],
  },
  expert_bb_annual: {
    id: "expert_bb_annual", name: "Expert BB · Annual", color: "var(--acc-buddy)",
    requires: "advanced",
    annual: [
      { months: "1–4",  phase: "LEAN_BULK",      focus: "Masseaufbau" },
      { months: "5–6",  phase: "MAINTENANCE",    focus: "Transition" },
      { months: "7–10", phase: "CONTEST_PREP",   focus: "Diäten" },
      { months: "11",   phase: "PEAK WEEK + SHOW", focus: "Wettkampf" },
      { months: "12",   phase: "REVERSE_DIET",   focus: "Recovery" },
    ],
    autoTransitions: true, coachOverride: true, requires: "experience ≥ advanced",
    next: [],
  },
};

// Tom's current state
const PHASE_STATE = {
  current: "recomp",
  variant: null,
  startedOn: "2026-03-15",
  week: 9,
  maxWeeks: 20,
  adherence: 94,
  weightTrend: -0.18,   // kg/wk (7d MA delta)
  strengthTrend: +4.2,  // % compound lifts
  bfTrend: -0.12,       // %/wk
  experience: "advanced",   // unlocks all phases incl. expert_bb_annual
  recommendation: {
    action: "no_change",
    reason: "On track — BF ↓, strength ↑, weight stable. Textbook recomp response.",
    confidence: 0.88,
  },
  suggestedTransition: {
    to: "lean_bulk",
    inWeeks: 4,
    why: "Recomp yield flattening after ~13 weeks. Lean bulk would capture better strength gains.",
  },
};

// Adaptive TDEE (MacroFactor-style)
const TDEE_STATE = {
  method: "adaptive",           // harris_benedict | mifflin | adaptive
  current: 2847,
  formulaBaseline: 2732,        // Mifflin × 1.725
  alpha: 0.3,
  history: [2680, 2712, 2745, 2760, 2788, 2801, 2822, 2835, 2847],
  weeklyIntakeAvg: 2610,
  weightDeltaKg: -0.18,
  lastAdjustment: { week: 8, delta: -100, reason: "Plateau trotz 94% Adherence" },
  crossModule: { trainingLoad: +64, recoveryPenalty: -22 },
  weightMA7: 79.42,
  weightRaw: 79.6,
};

// Cross-module contributions
const CONTRIBUTIONS = {
  nutrition:   88,
  training:    92,
  recovery:    74,
  supplements: 94,
  medical:     86,
};
const CONTRIB_WEIGHTS = {
  body_composition_gain: { nutrition: 0.30, training: 0.35, recovery: 0.20, supplements: 0.10, medical: 0.05 },
};

function calcGoalProgress(contrib, weights) {
  let total = 0, wsum = 0;
  const breakdown = {};
  for (const [m, w] of Object.entries(weights)) {
    const s = contrib[m] ?? 0;
    breakdown[m] = Math.round(s * w);
    total += s * w; wsum += w;
  }
  const overall = wsum > 0 ? Math.round(total / wsum) : 0;
  return {
    overall,
    status: overall >= 80 ? "excellent" : overall >= 65 ? "on_track" : overall >= 50 ? "needs_attention" : "at_risk",
    breakdown,
  };
}

function findBottleneck(contrib, weights) {
  const vals = Object.values(contrib);
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  let worst = "", gap = 0;
  for (const [m, s] of Object.entries(contrib)) {
    const g = (avg - s) * (weights[m] ?? 0);
    if (g > gap) { gap = g; worst = m; }
  }
  if (!worst || gap < 0.5) return null;
  const recs = {
    nutrition:   "Makros tracken + Protein-Ziel priorisieren",
    training:    "Training-Frequenz erhöhen oder Routine optimieren",
    recovery:    "Schlaf auf 7–8h erhöhen + Recovery-Aktivitäten",
    supplements: "Supplement-Einnahme konsistenter gestalten",
    medical:     "Nächste Blutuntersuchung einplanen",
  };
  return { module: worst, current: contrib[worst], avg: Math.round(avg), gap: Math.round(gap * 10) / 10, rec: recs[worst] };
}

// IFBB pose sets
const POSE_SETS = {
  mandatory: ["Front Double Biceps","Front Lat Spread","Side Chest L","Side Chest R","Rear Double Biceps","Rear Lat Spread","Side Triceps L","Side Triceps R","Abdominal & Thigh","Most Muscular"],
  quarter:   ["Front Relaxed","Right Side","Back Relaxed","Left Side"],
  detail:    ["Delts","Biceps","Triceps","Chest","Abs","Back","Quads","Hamstrings","Calves"],
};

// 13 circumferences per spec
const CIRCUMFERENCES = [
  { id: "neck",      label: "Neck",        v: 41.0, prev: 41.2 },
  { id: "shoulders", label: "Shoulders",   v: 124.5, prev: 124.0 },
  { id: "chest",     label: "Chest",       v: 108.0, prev: 109.0 },
  { id: "bicep_l",   label: "Bicep L",     v: 39.0, prev: 38.8 },
  { id: "bicep_r",   label: "Bicep R",     v: 39.5, prev: 39.3 },
  { id: "forearm_l", label: "Forearm L",   v: 31.8, prev: 31.7 },
  { id: "forearm_r", label: "Forearm R",   v: 32.0, prev: 32.0 },
  { id: "waist",     label: "Waist",       v: 82.0, prev: 83.5 },
  { id: "hips",      label: "Hips",        v: 96.0, prev: 96.5 },
  { id: "thigh_l",   label: "Thigh L",     v: 59.5, prev: 60.0 },
  { id: "thigh_r",   label: "Thigh R",     v: 60.0, prev: 60.5 },
  { id: "calf_l",    label: "Calf L",      v: 39.0, prev: 38.8 },
  { id: "calf_r",    label: "Calf R",      v: 39.5, prev: 39.3 },
];

function calcRatios(c) {
  const g = id => c.find(x => x.id === id)?.v ?? 0;
  const armAvg = (g("bicep_l") + g("bicep_r")) / 2;
  const legAvg = (g("thigh_l") + g("thigh_r")) / 2;
  return {
    shoulderWaist: +(g("shoulders") / g("waist")).toFixed(3),
    goldenTarget: 1.618,
    armSymmetry: +(Math.min(g("bicep_l"), g("bicep_r")) / armAvg * 100).toFixed(1),
    legSymmetry: +(Math.min(g("thigh_l"), g("thigh_r")) / legAvg * 100).toFixed(1),
    vTaper: Math.min(100, Math.round((g("shoulders") / g("waist") / 1.618) * 100)),
    reeves: 88,
  };
}

// ══════════════════════════════════════════════════════════
// VIEWS
// ══════════════════════════════════════════════════════════

window.GoalsPhaseView = () => {
  const [preview, setPreview] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [library, setLibrary] = React.useState(false);
  const p = GOAL_PHASES[PHASE_STATE.current];
  const pct = Math.round((PHASE_STATE.week / PHASE_STATE.maxWeeks) * 100);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        {/* Current phase hero */}
        <Card>
          <div style={{display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14}}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `color-mix(in srgb, ${p.color} 18%, transparent)`,
              border: `1px solid color-mix(in srgb, ${p.color} 38%, var(--border))`,
              color: p.color, display: "grid", placeItems: "center", flexShrink: 0
            }}><Icon name="goals" className="ic" style={{width: 22, height: 22}}/></div>
            <div style={{flex: 1}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
                <span style={{fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em"}}>{p.name}</span>
                <Pill variant="acc">week {PHASE_STATE.week} of {PHASE_STATE.maxWeeks}</Pill>
                <Pill variant="pos" dot>on track</Pill>
              </div>
              <div className="muted" style={{fontSize: 12, marginBottom: 10}}>Started {PHASE_STATE.startedOn} · adherence {PHASE_STATE.adherence}%</div>
              <Meter value={PHASE_STATE.week} max={PHASE_STATE.maxWeeks} color={p.color} tall/>
            </div>
          </div>
          <div className="grid g-cols-4" style={{gap: 8}}>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Weight trend</div><div className="num" style={{fontSize: 15, color: "var(--pos)"}}>{PHASE_STATE.weightTrend} kg/wk</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Strength</div><div className="num" style={{fontSize: 15, color: "var(--pos)"}}>+{PHASE_STATE.strengthTrend}%</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Body fat</div><div className="num" style={{fontSize: 15, color: "var(--pos)"}}>{PHASE_STATE.bfTrend} %/wk</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Adherence</div><div className="num" style={{fontSize: 15}}>{PHASE_STATE.adherence}%</div></Card>
          </div>
        </Card>

        {/* Weekly auto-adjustment */}
        <Card title="Weekly auto-adjustment" sub="deterministic rules · no AI">
          <div style={{
            padding: 12, borderRadius: 7,
            background: "color-mix(in srgb, var(--pos) 6%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--pos) 25%, var(--border))",
            marginBottom: 12,
          }}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
              <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)"}}/>
              <span style={{fontSize: 13, fontWeight: 600}}>No change this week</span>
              <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>confidence {Math.round(PHASE_STATE.recommendation.confidence * 100)}%</span>
            </div>
            <div className="muted" style={{fontSize: 12, lineHeight: 1.5}}>{PHASE_STATE.recommendation.reason}</div>
          </div>
          <div className="eyebrow" style={{marginBottom: 6}}>Active guards</div>
          <div className="col-gap" style={{gap: 4}}>
            {(p.guards || ["Calorie cycling per training/rest day", "Protein floor 2.0 g/kg", "Weekly average ≈ maintenance"]).map((g, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, fontFamily: "var(--font-mono)"}}>
                <span style={{width: 6, height: 6, borderRadius: 999, background: "var(--pos)", flexShrink: 0}}/>
                {g}
              </div>
            ))}
          </div>
        </Card>

        {/* Phase state machine */}
        <Card title="Phase state machine" sub="7 phases · click any phase to preview or switch">
          <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8}}>
            {Object.values(GOAL_PHASES).map(ph => {
              const active = ph.id === PHASE_STATE.current;
              const recommended = p.next?.includes(ph.id);
              const gated = ph.requires && PHASE_STATE.experience !== "advanced";
              return (
                <div key={ph.id}
                  onClick={() => !gated && setPreview(ph.id)}
                  style={{
                    padding: 10, borderRadius: 7, cursor: gated ? "not-allowed" : "pointer",
                    background: active ? `color-mix(in srgb, ${ph.color} 12%, var(--surface))`
                      : preview === ph.id ? `color-mix(in srgb, ${ph.color} 7%, var(--surface))`
                      : "var(--surface)",
                    border: `1px solid ${
                      active ? `color-mix(in srgb, ${ph.color} 40%, var(--border))`
                      : preview === ph.id ? `color-mix(in srgb, ${ph.color} 30%, var(--border))`
                      : recommended ? "var(--border-strong)" : "var(--border)"}`,
                    opacity: gated ? 0.45 : 1,
                  }}>
                  <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 4}}>
                    <span style={{width: 7, height: 7, borderRadius: 999, background: ph.color}}/>
                    <span style={{fontSize: 11.5, fontWeight: 600}}>{ph.name}</span>
                  </div>
                  {active && <Pill variant="acc" style={{fontSize: 9}}>current</Pill>}
                  {!active && recommended && <span className="mono" style={{fontSize: 9.5, color: "var(--pos)"}}>→ recommended next</span>}
                  {!active && !recommended && !gated && <span className="dim mono" style={{fontSize: 9.5}}>switchable</span>}
                  {gated && <span className="dim mono" style={{fontSize: 9.5}}>needs advanced</span>}
                </div>
              );
            })}
          </div>

          {/* Preview panel for the clicked phase */}
          {preview && preview !== PHASE_STATE.current && (() => {
            const ph = GOAL_PHASES[preview];
            return (
              <>
                <div className="divider"/>
                <div style={{
                  padding: 14, borderRadius: 8,
                  background: `color-mix(in srgb, ${ph.color} 6%, var(--surface))`,
                  border: `1px solid color-mix(in srgb, ${ph.color} 28%, var(--border))`,
                }}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap"}}>
                    <span style={{width: 8, height: 8, borderRadius: 999, background: ph.color}}/>
                    <span style={{fontSize: 14, fontWeight: 600}}>{ph.name}</span>
                    {p.next?.includes(ph.id)
                      ? <Pill variant="pos">recommended transition</Pill>
                      : <Pill variant="warn">manual switch · not in recommended path</Pill>}
                    <button className="icon-btn" style={{marginLeft: "auto"}} onClick={() => setPreview(null)}><Icon name="x" className="ic ic-sm"/></button>
                  </div>

                  {/* Variants (fat_loss) */}
                  {ph.variants && (
                    <div className="grid g-cols-2" style={{gap: 8, marginBottom: 10}}>
                      {Object.entries(ph.variants).map(([vk, v]) => (
                        <Card key={vk} className="card-tight" style={{padding: 10}}>
                          <div className="eyebrow" style={{marginBottom: 6, textTransform: "capitalize"}}>{vk}</div>
                          <Row label="Deficit" value={`${v.deficit[0]} … ${v.deficit[1]} kcal`}/>
                          <Row label="Rate" value={v.rate}/>
                          <Row label="Protein" value={`${v.protein[0]}–${v.protein[1]} g/kg`}/>
                          <Row label="Max duration" value={`${v.maxWeeks} wk`}/>
                          <Row label="Diet break" value={v.dietBreak}/>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Flat params */}
                  {ph.params && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Parameters</div>
                      {Object.entries(ph.params).map(([k, v]) => (
                        <Row key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())} value={Array.isArray(v) ? v.join(" – ") : String(v)}/>
                      ))}
                    </div>
                  )}

                  {/* Contest prep sub-phases */}
                  {ph.subPhases && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Sub-phases</div>
                      <table className="tbl">
                        <thead><tr><th>Stage</th><th style={{width: 90}}>Weeks out</th><th style={{width: 90, textAlign: "right"}}>Deficit</th><th style={{width: 100}}>Cardio</th></tr></thead>
                        <tbody>
                          {ph.subPhases.map(sp => (
                            <tr key={sp.name}>
                              <td style={{textTransform: "capitalize"}}>{sp.name.replace("_", " ")}</td>
                              <td className="num muted">{sp.weeks}</td>
                              <td className="num" style={{textAlign: "right"}}>{sp.deficit ? `${sp.deficit} kcal` : "—"}</td>
                              <td className="muted">{sp.cardio || (sp.special ? "protocol" : "—")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {ph.refeeds && <Row label="Refeeds" value={ph.refeeds}/>}
                      {ph.peakWeek && <Row label="Peak week" value={ph.peakWeek}/>}
                    </div>
                  )}

                  {/* Annual plan */}
                  {ph.annual && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>12-month cycle</div>
                      <div className="col-gap" style={{gap: 3}}>
                        {ph.annual.map((a, i) => (
                          <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
                            <span className="num dim" style={{width: 42, fontSize: 10}}>M{a.months}</span>
                            <span style={{fontWeight: 500, fontSize: 11}}>{a.phase}</span>
                            <span className="dim" style={{marginLeft: "auto", fontSize: 10.5}}>{a.focus}</span>
                          </div>
                        ))}
                      </div>
                      <Row label="Auto-transitions" value={ph.autoTransitions ? "enabled" : "manual"}/>
                      <Row label="Coach override" value={ph.coachOverride ? "allowed" : "no"}/>
                    </div>
                  )}

                  {/* Exits / success / bestFor */}
                  {ph.exits && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Exit conditions</div>
                      {ph.exits.map(e => <div key={e} style={{display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, marginBottom: 3}}><Icon name="arrow_right" className="ic ic-sm" style={{color: ph.color}}/>{e}</div>)}
                    </div>
                  )}
                  {ph.success && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Success metrics</div>
                      {ph.success.map(s => <div key={s} style={{display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, marginBottom: 3}}><Icon name="check" className="ic ic-sm" style={{color: "var(--pos)"}}/>{s}</div>)}
                    </div>
                  )}
                  {ph.bestFor && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Best for</div>
                      <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>{ph.bestFor.map(b => <Pill key={b}>{b}</Pill>)}</div>
                    </div>
                  )}
                  {ph.purpose && (
                    <div style={{marginBottom: 10}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Purpose</div>
                      <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>{ph.purpose.map(b => <Pill key={b}>{b}</Pill>)}</div>
                    </div>
                  )}

                  {/* Guards */}
                  {ph.guards && (
                    <div style={{marginBottom: 12}}>
                      <div className="eyebrow" style={{marginBottom: 6}}>Guards that would apply</div>
                      <div className="col-gap" style={{gap: 3}}>
                        {ph.guards.map((g, i) => (
                          <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-muted)"}}>
                            <span style={{width: 5, height: 5, borderRadius: 999, background: "var(--warn)", flexShrink: 0}}/>{g}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{display: "flex", gap: 6}}>
                    <button className="btn btn-primary btn-sm">Switch to {ph.name}</button>
                    <button className="btn btn-sm" onClick={() => setEditing(ph.id)}><Icon name="edit" className="ic ic-sm"/>Customize</button>
                    <button className="btn btn-sm">Schedule for later</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>Close</button>
                  </div>
                </div>
              </>
            );
          })()}

          <div className="divider"/>
          <div style={{
            padding: 12, borderRadius: 7,
            background: "color-mix(in srgb, var(--acc-train) 6%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--acc-train) 25%, var(--border))",
          }}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
              <Icon name="arrow_right" className="ic ic-sm" style={{color: "var(--acc-train)"}}/>
              <span style={{fontSize: 12.5, fontWeight: 600}}>Suggested transition in {PHASE_STATE.suggestedTransition.inWeeks} weeks → {GOAL_PHASES[PHASE_STATE.suggestedTransition.to].name}</span>
            </div>
            <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 8}}>{PHASE_STATE.suggestedTransition.why}</div>
            <div style={{display: "flex", gap: 6}}>
              <button className="btn btn-primary btn-sm">Accept & schedule</button>
              <button className="btn btn-ghost btn-sm">Stay in recomp</button>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Phase parameters" sub={p.name} actions={<>
          <button className="btn btn-ghost btn-sm" onClick={() => setLibrary(true)}><Icon name="layers" className="ic ic-sm"/>Templates</button>
          <button className="btn btn-sm" onClick={() => setEditing(PHASE_STATE.current)}><Icon name="edit" className="ic ic-sm"/>Edit</button>
        </>}>
          {p.params && Object.entries(p.params).map(([k, v]) => (
            <Row key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())} value={Array.isArray(v) ? v.join(" – ") : String(v)}/>
          ))}
          {p.success && (
            <>
              <div className="divider"/>
              <div className="eyebrow" style={{marginBottom: 6}}>Success metrics</div>
              {p.success.map(s => (
                <div key={s} style={{display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, marginBottom: 4}}>
                  <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)"}}/>{s}
                </div>
              ))}
            </>
          )}
        </Card>
        <Card title="Expert BB annual" sub="12-month cycle · advanced only" actions={<button className="btn btn-sm" onClick={() => setEditing("expert_bb_annual")}><Icon name="edit" className="ic ic-sm"/>Customize</button>}>
          <div className="col-gap" style={{gap: 4}}>
            {GOAL_PHASES.expert_bb_annual.annual.map((a, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
                <span className="num dim" style={{width: 40, fontSize: 10}}>M{a.months}</span>
                <span style={{fontWeight: 500, fontSize: 11}}>{a.phase}</span>
                <span className="dim" style={{marginLeft: "auto", fontSize: 10.5}}>{a.focus}</span>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <button className="btn btn-ghost" style={{width: "100%"}} onClick={() => setEditing("expert_bb_annual")}>Open annual cycle editor</button>
        </Card>
      </div>

      {editing && window.PhaseEditorModal && <window.PhaseEditorModal phaseId={editing} onClose={() => setEditing(null)}/>}
      {library && window.PhaseTemplateLibrary && <window.PhaseTemplateLibrary onClose={() => setLibrary(false)}/>}
    </div>
  );
};

window.GoalsTDEEView = () => {
  const t = TDEE_STATE;
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card>
          <div style={{display: "flex", alignItems: "center", gap: 18}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Adaptive TDEE</div>
              <div className="num" style={{fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1}}>{t.current.toLocaleString()}</div>
              <div className="dim mono" style={{fontSize: 11, marginTop: 4}}>kcal / day · EMA α={t.alpha}</div>
            </div>
            <div style={{width: 1, alignSelf: "stretch", background: "var(--border)"}}/>
            <div style={{flex: 1}}>
              <Row label="Formula baseline (Mifflin × 1.725)" value={`${t.formulaBaseline.toLocaleString()} kcal`}/>
              <Row label="Adaptive delta" value={`+${t.current - t.formulaBaseline} kcal`}/>
              <Row label="Weekly intake avg" value={`${t.weeklyIntakeAvg.toLocaleString()} kcal`}/>
              <Row label="Weight Δ (7d MA)" value={`${t.weightDeltaKg} kg`}/>
            </div>
          </div>
        </Card>

        <Card title="TDEE evolution" sub="9 weeks · adaptive from real intake + weight data">
          <LineChart h={180} range={[2600, 2900]}
            xLabels={["wk1","wk2","wk3","wk4","wk5","wk6","wk7","wk8","wk9"]}
            series={[
              { data: t.history, color: "var(--acc-goals)" },
              { data: Array(9).fill(t.formulaBaseline), color: "var(--fg-dim)" },
            ]}/>
          <div style={{display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
            <span className="row-gap"><span className="dot" style={{background: "var(--acc-goals)"}}/>Adaptive TDEE</span>
            <span className="row-gap"><span className="dot" style={{background: "var(--fg-dim)"}}/>Formula baseline</span>
          </div>
        </Card>

        <Card title="Calculation trace" sub="how this week's number was derived">
          <pre style={{margin: 0, padding: 14, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11.5, lineHeight: 1.7, color: "var(--fg-muted)", whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)"}}>{`weeklyIntake     = ${(t.weeklyIntakeAvg * 7).toLocaleString()} kcal
Δweight          = ${t.weightDeltaKg} kg
caloricDelta     = ${t.weightDeltaKg} × 7700 = ${Math.round(t.weightDeltaKg * 7700)} kcal
rawTDEE          = (${(t.weeklyIntakeAvg * 7).toLocaleString()} − (${Math.round(t.weightDeltaKg * 7700)})) / 7
                 = ${Math.round((t.weeklyIntakeAvg * 7 - t.weightDeltaKg * 7700) / 7).toLocaleString()} kcal/day

EMA (α = ${t.alpha})
  = ${t.alpha} × ${Math.round((t.weeklyIntakeAvg * 7 - t.weightDeltaKg * 7700) / 7).toLocaleString()} + ${1 - t.alpha} × ${t.history[t.history.length - 2].toLocaleString()}
  = ${t.current.toLocaleString()} kcal/day

cross-module corrections
  training load    ${t.crossModule.trainingLoad > 0 ? "+" : ""}${t.crossModule.trainingLoad} kcal
  recovery penalty ${t.crossModule.recoveryPenalty} kcal`}</pre>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Weight · trend vs raw" sub="7-day moving average smooths daily noise">
          <div style={{display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10}}>
            <div>
              <div className="eyebrow">7d MA</div>
              <div className="num" style={{fontSize: 22, fontWeight: 600}}>{t.weightMA7}<span className="dim" style={{fontSize: 11}}> kg</span></div>
            </div>
            <div>
              <div className="eyebrow">Today raw</div>
              <div className="num" style={{fontSize: 16, color: "var(--fg-dim)"}}>{t.weightRaw}<span className="dim" style={{fontSize: 10}}> kg</span></div>
            </div>
          </div>
          <Sparkline data={[80.1, 79.9, 80.2, 79.7, 79.8, 79.5, 79.6, 79.4, 79.42]} color="var(--acc-goals)" h={44}/>
          <div className="dim" style={{fontSize: 11, marginTop: 8, lineHeight: 1.45}}>Daily swings up to ±0.5 kg are water/glycogen. Only the MA drives adjustments.</div>
        </Card>
        <Card title="Last adjustment">
          <Row label="Week" value={`wk ${t.lastAdjustment.week}`}/>
          <Row label="Action" value={`${t.lastAdjustment.delta > 0 ? "+" : ""}${t.lastAdjustment.delta} kcal`}/>
          <div className="divider"/>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>{t.lastAdjustment.reason}</div>
        </Card>
        <Card title="Method">
          <Row label="Weeks 1–2" value="Mifflin-St Jeor"/>
          <Row label="Week 2+" value="Adaptive (real data)"/>
          <Row label="Smoothing" value={`EMA α = ${t.alpha}`}/>
          <Row label="Energy density" value="7,700 kcal / kg"/>
          <Row label="Auto-adjust range" value="±100–200 kcal"/>
        </Card>
      </div>
    </div>
  );
};

window.GoalsCrossModuleView = () => {
  const weights = CONTRIB_WEIGHTS.body_composition_gain;
  const progress = calcGoalProgress(CONTRIBUTIONS, weights);
  const bottleneck = findBottleneck(CONTRIBUTIONS, weights);
  const statusColor = { excellent: "var(--pos)", on_track: "var(--acc-recov)", needs_attention: "var(--warn)", at_risk: "var(--neg)" }[progress.status];
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card>
          <div style={{display: "flex", alignItems: "center", gap: 18}}>
            <Ring value={progress.overall} max={100} color={statusColor} label="overall" size={104} stroke={8}/>
            <div style={{flex: 1}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                <span style={{fontSize: 15, fontWeight: 600}}>Cross-module goal progress</span>
                <Pill style={{borderColor: `color-mix(in srgb, ${statusColor} 35%, var(--border))`, color: statusColor}}>{progress.status.replace("_", " ")}</Pill>
              </div>
              <div className="muted" style={{fontSize: 12, lineHeight: 1.5, marginBottom: 10}}>
                Goals is the single source of truth. Every module posts a daily contribution score; this is the weighted aggregate for a <span className="mono" style={{color: "var(--fg)"}}>body_composition_gain</span> goal.
              </div>
              <div className="dim mono" style={{fontSize: 10.5}}>updated 12 min ago · 5 modules reporting</div>
            </div>
          </div>
        </Card>

        <Card title="Module contributions" sub="score × weight = contribution">
          <table className="tbl">
            <thead><tr><th>Module</th><th style={{width: 70, textAlign: "right"}}>Score</th><th style={{width: 70, textAlign: "right"}}>Weight</th><th style={{width: 150}}>Contribution</th><th style={{width: 60, textAlign: "right"}}>Points</th></tr></thead>
            <tbody>
              {Object.entries(weights).map(([m, w]) => {
                const s = CONTRIBUTIONS[m];
                const pts = progress.breakdown[m];
                const isBottleneck = bottleneck?.module === m;
                return (
                  <tr key={m} style={isBottleneck ? {background: "color-mix(in srgb, var(--warn) 6%, transparent)"} : undefined}>
                    <td style={{textTransform: "capitalize"}}>
                      {m}
                      {isBottleneck && <Pill variant="warn" style={{marginLeft: 8, fontSize: 9}}>bottleneck</Pill>}
                    </td>
                    <td className="num" style={{textAlign: "right", color: s >= 85 ? "var(--pos)" : s >= 70 ? "var(--fg)" : "var(--warn)"}}>{s}</td>
                    <td className="num muted" style={{textAlign: "right"}}>{Math.round(w * 100)}%</td>
                    <td><Meter value={s} max={100} color={isBottleneck ? "var(--warn)" : "var(--acc-goals)"} tall/></td>
                    <td className="num" style={{textAlign: "right"}}>{pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {bottleneck && (
          <Card style={{border: "1px solid color-mix(in srgb, var(--warn) 30%, var(--border))", background: "color-mix(in srgb, var(--warn) 5%, var(--surface))"}}>
            <div style={{display: "flex", gap: 12, alignItems: "flex-start"}}>
              <div style={{width: 3, alignSelf: "stretch", background: "var(--warn)", borderRadius: 2}}/>
              <div style={{flex: 1}}>
                <div className="eyebrow" style={{color: "var(--warn)", marginBottom: 6}}>Bottleneck identified</div>
                <div style={{fontSize: 15, fontWeight: 600, marginBottom: 6, textTransform: "capitalize"}}>{bottleneck.module} is limiting your progress</div>
                <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 10}}>
                  Score {bottleneck.current} vs. {bottleneck.avg} average across modules — a weighted gap of {bottleneck.gap} points. {bottleneck.rec}
                </div>
                <div style={{display: "flex", gap: 6}}>
                  <button className="btn btn-primary btn-sm">Open {bottleneck.module}</button>
                  <button className="btn btn-ghost btn-sm">Ask Buddy for a plan</button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Achievement probability" sub="based on current trajectory">
          <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 12}}>
            <Ring value={78} max={100} color="var(--pos)" label="likely" size={88} stroke={7}/>
            <div style={{flex: 1}}>
              <div className="num" style={{fontSize: 20, fontWeight: 600, marginBottom: 4}}>78%</div>
              <div className="muted" style={{fontSize: 11.5, lineHeight: 1.45}}>If you keep this up, you reach 78 kg @ 12% BF in <span className="num" style={{color: "var(--fg)"}}>11 weeks</span> — 2 weeks ahead of deadline.</div>
            </div>
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Scenario modeling</div>
          <div className="col-gap" style={{gap: 4}}>
            {[
              { s: "Sleep → 7.5h avg", d: "3 weeks earlier", pos: true },
              { s: "Nutrition adherence → 95%", d: "1.5 weeks earlier", pos: true },
              { s: "Miss 2 sessions/wk", d: "4 weeks later", pos: false },
              { s: "Add 2nd cold plunge/wk", d: "0.5 weeks earlier", pos: true },
            ].map((sc, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
                <span style={{flex: 1}}>{sc.s}</span>
                <span className="num" style={{fontSize: 11, color: sc.pos ? "var(--pos)" : "var(--warn)"}}>{sc.d}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Weekly report" sub="week 9 · generated Sun 07:00">
          <Row label="Overall score" value={`${progress.overall} (+3 vs wk 8)`}/>
          <Row label="Top contributor" value="Supplements · 94"/>
          <Row label="Bottleneck" value={bottleneck ? `${bottleneck.module} · ${bottleneck.current}` : "—"}/>
          <Row label="Weight Δ" value="−0.18 kg"/>
          <Row label="Strength Δ" value="+1.2%"/>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Next week</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Hold calories. Prioritise sleep — pushing recovery from 74 → 85 lifts overall by ~2.2 points and is the single highest-leverage change available.
          </div>
          <div style={{display: "flex", gap: 6, marginTop: 10}}>
            <button className="btn btn-sm"><Icon name="download" className="ic ic-sm"/>Export PDF</button>
            <button className="btn btn-ghost btn-sm">Share with coach</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

window.GoalsPhysiqueView = () => {
  const r = calcRatios(CIRCUMFERENCES);
  const ffmi = 22.3;
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Physique ratios" sub="classic bodybuilding proportions">
          <div className="grid g-cols-3" style={{gap: 10, marginBottom: 14}}>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Shoulder : Waist</div>
              <div className="num" style={{fontSize: 20, fontWeight: 600, color: r.shoulderWaist >= 1.618 ? "var(--pos)" : "var(--warn)"}}>{r.shoulderWaist}</div>
              <div className="dim mono" style={{fontSize: 10}}>golden target 1.618</div>
              <div style={{marginTop: 6}}><Meter value={r.shoulderWaist} max={1.8} color={r.shoulderWaist >= 1.618 ? "var(--pos)" : "var(--warn)"}/></div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>V-Taper score</div>
              <div className="num" style={{fontSize: 20, fontWeight: 600}}>{r.vTaper}</div>
              <div className="dim mono" style={{fontSize: 10}}>0–100</div>
              <div style={{marginTop: 6}}><Meter value={r.vTaper} max={100} color="var(--acc-goals)"/></div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Steve Reeves</div>
              <div className="num" style={{fontSize: 20, fontWeight: 600}}>{r.reeves}</div>
              <div className="dim mono" style={{fontSize: 10}}>proportion score</div>
              <div style={{marginTop: 6}}><Meter value={r.reeves} max={100} color="var(--acc-goals)"/></div>
            </Card>
          </div>
          <div className="grid g-cols-2" style={{gap: 10}}>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 4}}>Arm symmetry</div>
              <div style={{display: "flex", alignItems: "baseline", gap: 8}}>
                <span className="num" style={{fontSize: 18, color: r.armSymmetry >= 97 ? "var(--pos)" : "var(--warn)"}}>{r.armSymmetry}%</span>
                <span className="dim mono" style={{fontSize: 10}}>L 39.0 · R 39.5 cm</span>
              </div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 4}}>Leg symmetry</div>
              <div style={{display: "flex", alignItems: "baseline", gap: 8}}>
                <span className="num" style={{fontSize: 18, color: r.legSymmetry >= 97 ? "var(--pos)" : "var(--warn)"}}>{r.legSymmetry}%</span>
                <span className="dim mono" style={{fontSize: 10}}>L 59.5 · R 60.0 cm</span>
              </div>
            </Card>
          </div>
        </Card>

        <Card title="13 circumferences" sub="last update May 14 · cm">
          <table className="tbl">
            <thead><tr><th>Site</th><th style={{width: 80, textAlign: "right"}}>Current</th><th style={{width: 80, textAlign: "right"}}>Previous</th><th style={{width: 70, textAlign: "right"}}>Δ</th><th style={{width: 120}}>Trend</th></tr></thead>
            <tbody>
              {CIRCUMFERENCES.map(c => {
                const d = +(c.v - c.prev).toFixed(1);
                const isWaist = ["waist", "hips"].includes(c.id);
                const good = isWaist ? d < 0 : d > 0;
                return (
                  <tr key={c.id}>
                    <td>{c.label}</td>
                    <td className="num" style={{textAlign: "right", fontWeight: 500}}>{c.v.toFixed(1)}</td>
                    <td className="num muted" style={{textAlign: "right"}}>{c.prev.toFixed(1)}</td>
                    <td className="num" style={{textAlign: "right", color: d === 0 ? "var(--fg-dim)" : good ? "var(--pos)" : "var(--warn)"}}>{d > 0 ? "+" : ""}{d}</td>
                    <td><Meter value={Math.abs(d) * 20 + 20} max={100} color={d === 0 ? "var(--fg-dim)" : good ? "var(--pos)" : "var(--warn)"}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="FFMI" sub="fat-free mass index">
          <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 12}}>
            <Ring value={ffmi} max={28} color="var(--acc-train)" label="ffmi" size={92} stroke={7}/>
            <div style={{flex: 1}}>
              <div className="num" style={{fontSize: 20, fontWeight: 600, marginBottom: 3}}>{ffmi}</div>
              <Pill variant="acc">advanced</Pill>
              <div className="dim mono" style={{fontSize: 10, marginTop: 6}}>height-adjusted</div>
            </div>
          </div>
          <div className="col-gap" style={{gap: 3}}>
            {[
              { r: "18–20", l: "Developing", active: false },
              { r: "20–22", l: "Natural trained", active: false },
              { r: "22–25", l: "Advanced natural", active: true },
              { r: "25+",   l: "Elite / assisted", active: false },
            ].map(b => (
              <div key={b.r} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, fontSize: 11.5,
                background: b.active ? "color-mix(in srgb, var(--acc-train) 10%, var(--surface))" : "var(--surface)",
                border: `1px solid ${b.active ? "color-mix(in srgb, var(--acc-train) 30%, var(--border))" : "var(--border)"}`,
              }}>
                <span className="num dim" style={{width: 48, fontSize: 10}}>{b.r}</span>
                <span style={{flex: 1}}>{b.l}</span>
                {b.active && <Pill variant="acc" style={{fontSize: 9}}>you</Pill>}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Body fat method" sub="track which method produced each reading">
          <Row label="Current" value="13.8% · DEXA"/>
          <Row label="Measured" value="Apr 23, 2026"/>
          <Row label="Next scan" value="Jul 15 · booked"/>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Method history</div>
          <table className="tbl">
            <tbody>
              <tr><td className="num muted">Apr 23</td><td>DEXA</td><td className="num right">13.8%</td></tr>
              <tr><td className="num muted">Mar 15</td><td>DEXA</td><td className="num right">15.4%</td></tr>
              <tr><td className="num muted">Feb 20</td><td>BIA</td><td className="num right">16.2%</td></tr>
              <tr><td className="num muted">Jan 12</td><td>Caliper (7-site)</td><td className="num right">16.8%</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

window.GoalsPosesView = () => {
  const [set, setSet] = React.useState("mandatory");
  const sets = { mandatory: "8 IFBB Mandatory", quarter: "4 Quarter Turns", detail: "9 Detail Close-Ups" };
  const poses = POSE_SETS[set];
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1}}>
          {Object.entries(sets).map(([k, l]) => (
            <button key={k} onClick={() => setSet(k)} className={set === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 24, fontSize: 11, padding: "0 12px", borderRadius: 5}}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <button className="btn"><Icon name="copy" className="ic ic-sm"/>Compare sessions</button>
        <button className="btn btn-primary"><Icon name="camera" className="ic ic-sm"/>New photo session</button>
      </div>

      <Card title={`${sets[set]} · pose guide`} sub="silhouette overlay · 3/5/10s timer · retake per pose">
        <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10}}>
          {poses.map((p, i) => (
            <div key={p}>
              <div className="placeholder-img" style={{aspectRatio: "3/4", borderRadius: 7, position: "relative", marginBottom: 6}}>
                <svg viewBox="0 0 60 80" style={{width: "60%", opacity: 0.28}}>
                  <ellipse cx="30" cy="11" rx="7" ry="8" fill="none" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M30 19 v10 M14 30 h32 M30 29 v22 M30 51 l-8 24 M30 51 l8 24 M14 30 l-7 18 M46 30 l7 18"
                    fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <Pill style={{position: "absolute", top: 6, left: 6, fontSize: 9}}>{(i + 1).toString().padStart(2, "0")}</Pill>
                {i < 4 && <Pill variant="pos" style={{position: "absolute", top: 6, right: 6, fontSize: 9}}>✓</Pill>}
              </div>
              <div style={{fontSize: 11, fontWeight: 500, lineHeight: 1.3, minHeight: 28}}>{p}</div>
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div style={{display: "flex", gap: 12, fontSize: 11, color: "var(--fg-muted)", alignItems: "center"}}>
          <span>Session progress: <span className="num" style={{color: "var(--fg)"}}>4 of {poses.length}</span></span>
          <span className="dim">·</span>
          <span>Timer: <span className="num" style={{color: "var(--fg)"}}>5s</span></span>
          <div className="spacer"/>
          <button className="btn btn-sm">Retake last</button>
          <button className="btn btn-sm">Skip pose</button>
        </div>
      </Card>

      <div style={{height: 14}}/>
      <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
        <Card title="Side-by-side comparison" sub="Mar 15 vs May 15 · Front Double Biceps">
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
            {[
              { d: "Mar 15", w: "81.2 kg", bf: "15.4%" },
              { d: "May 15", w: "79.4 kg", bf: "13.8%" },
            ].map(s => (
              <div key={s.d}>
                <div className="placeholder-img" style={{aspectRatio: "3/4", borderRadius: 7, marginBottom: 6}}>
                  <svg viewBox="0 0 60 80" style={{width: "55%", opacity: 0.25}}>
                    <ellipse cx="30" cy="11" rx="7" ry="8" fill="none" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M30 19 v10 M14 30 h32 M30 29 v22 M30 51 l-8 24 M30 51 l8 24 M14 30 l-7 18 M46 30 l7 18"
                      fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{textAlign: "center"}}>
                  <div className="num" style={{fontSize: 12, fontWeight: 600}}>{s.d}</div>
                  <div className="dim mono" style={{fontSize: 10}}>{s.w} · {s.bf}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Slider comparison</div>
          <input type="range" defaultValue="50" style={{width: "100%", accentColor: "var(--acc-goals)"}}/>
        </Card>
        <Card title="AI analysis" sub="Claude Vision · latest session">
          <Row label="Overall conditioning" value="7.8 / 10"/>
          <Row label="Symmetry score" value="94 / 100"/>
          <Row label="Vascularity" value="moderate"/>
          <Row label="Est. body fat (visual)" value="13–14%"/>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Muscle group scores</div>
          {[
            ["Back", 8.4], ["Chest", 7.9], ["Shoulders", 8.1],
            ["Arms", 7.6], ["Quads", 8.2], ["Hamstrings", 6.8], ["Calves", 6.4],
          ].map(([m, s]) => (
            <div key={m} style={{display: "grid", gridTemplateColumns: "80px 1fr 32px", gap: 8, alignItems: "center", fontSize: 11, marginBottom: 4}}>
              <span style={{color: "var(--fg-muted)"}}>{m}</span>
              <Meter value={s * 10} max={100} color={s >= 8 ? "var(--pos)" : s >= 7 ? "var(--acc-goals)" : "var(--warn)"}/>
              <span className="num" style={{textAlign: "right"}}>{s}</span>
            </div>
          ))}
          <div className="divider"/>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Weak point: calves and hamstrings lag the upper body. Consider adding a dedicated posterior-chain day.
          </div>
        </Card>
      </div>
    </div>
  );
};
