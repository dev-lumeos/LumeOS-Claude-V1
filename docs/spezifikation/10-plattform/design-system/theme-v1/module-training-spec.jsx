// Training · Spec-alignment — Progression Engine, Volume Landmarks, Evaluation Scores,
// AI Generator, Plate/Warm-up Calculators, Calendar, Cross-Module Gating, Pending Actions

// ── Block A: classification + set types ───────────────────
const EX_CLASSIFICATION = {
  category:        ["Bodyweight", "Free Weights", "Resistance", "Cardio", "Stretching"],
  tracking_type:   ["weight_reps", "reps_only", "duration", "distance_duration"],
  movement_pattern:["push", "pull", "squat", "hinge", "carry", "rotation"],
  discipline:      ["bodybuilding", "powerlifting", "olympic", "general"],
};

const SET_TYPES = [
  { id: "working", label: "Working",  desc: "Normaler Arbeitssatz",              volume: true },
  { id: "warmup",  label: "Warm-up",  desc: "Aufwärmsatz",                        volume: false },
  { id: "dropset", label: "Drop set", desc: "Reduziertes Gewicht ohne Pause",    volume: true },
  { id: "failure", label: "Failure",  desc: "Bis zum Versagen",                   volume: true },
];

// ── Block B: 5 progression models ─────────────────────────
const PROGRESSION_MODELS = [
  {
    id: "linear", name: "Linear Progression", level: "Beginner", color: "var(--acc-recov)",
    rule: "Alle Sets in Rep-Range oder besser → next_weight += weight_increment",
    formula: "next_weight = current_weight + 2.5 kg",
    use: "Beginner · konsistente Progression",
    active: false,
  },
  {
    id: "double", name: "Double Progression", level: "Intermediate", color: "var(--acc-train)",
    rule: "Phase 1 Reps hoch bis max · Phase 2 Gewicht hoch, Reps zurücksetzen",
    formula: "reps < max_reps ? reps += 1 : (weight += inc, reps = min_reps)",
    use: "Hypertrophie · Intermediate · Standard-Modell",
    active: true,
  },
  {
    id: "wave", name: "Wave Loading", level: "Intermediate+", color: "var(--acc-goals)",
    rule: "Welle [75%, 85%, 95%, Deload 65%] des Trainingsgewichts",
    formula: "intensity = wave[currentWeek % 4]",
    use: "Periodisiertes Krafttraining",
    active: false,
  },
  {
    id: "rpe", name: "RPE-Autoregulation", level: "Advanced", color: "var(--acc-buddy)",
    rule: "session_rpe über/unter Ziel → Gewicht ×(1 ∓ adjustmentFactor)",
    formula: "rpe > 8 + range ? w × 0.95 : rpe < 8 − range ? w × 1.025 : w",
    use: "Advanced · tagesabhängige Anpassung",
    active: false,
  },
  {
    id: "dup", name: "DUP", level: "Advanced", color: "var(--neg)",
    rule: "Rotation Kraft (3-5 @ 87-93%) → Hypertrophie (8-12 @ 70-80%) → Power (2-4 @ 85-90%)",
    formula: "block = rotation[sessionIndex % 3]",
    use: "Abwechslungsreiche Stimuli · Advanced",
    active: false,
  },
];

const DELOAD_TRIGGERS = [
  { t: "Reps fallen 3 Sätze hintereinander ab",           hit: false, detail: "Bench: 5,5,5,4 → kein Abfall über 3 Sätze" },
  { t: "RPE > 9 in 2+ Sessions in Folge",                  hit: false, detail: "Letzte 2 Sessions: RPE 8.0 / 8.5" },
  { t: "Keine Progression für 3 Sessions (Übung)",         hit: true,  detail: "Lateral Raise: 9 kg seit 4 Sessions" },
  { t: "User-Feedback Performance 😩 in 2+ Sessions",      hit: false, detail: "Letzte Bewertungen: 🙂 / 😐" },
];

window.TrainingProgressionView = () => {
  const [sel, setSel] = React.useState("double");
  const m = PROGRESSION_MODELS.find(x => x.id === sel);
  const triggered = DELOAD_TRIGGERS.filter(t => t.hit).length;
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Progression models" sub="5 models · one per routine · deterministic">
          <div className="col-gap" style={{gap: 6}}>
            {PROGRESSION_MODELS.map(p => {
              const on = p.id === sel;
              return (
                <div key={p.id} onClick={() => setSel(p.id)} style={{
                  padding: 12, borderRadius: 7, cursor: "pointer",
                  background: on ? `color-mix(in srgb, ${p.color} 9%, var(--surface))` : "var(--surface)",
                  border: `1px solid ${on ? `color-mix(in srgb, ${p.color} 35%, var(--border))` : "var(--border)"}`,
                }}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap"}}>
                    <span style={{width: 7, height: 7, borderRadius: 999, background: p.color}}/>
                    <span style={{fontSize: 13, fontWeight: 600}}>{p.name}</span>
                    <Pill style={{fontSize: 9.5}}>{p.level}</Pill>
                    {p.active && <Pill variant="acc" style={{fontSize: 9.5}}>active on Push B</Pill>}
                  </div>
                  <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: on ? 8 : 0}}>{p.rule}</div>
                  {on && (
                    <>
                      <div style={{padding: "8px 10px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", marginBottom: 8}}>{p.formula}</div>
                      <div className="dim" style={{fontSize: 10.5}}>{p.use}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="divider"/>
          <div style={{display: "flex", gap: 6}}>
            <button className="btn btn-primary btn-sm">Apply {m.name} to Push B</button>
            <button className="btn btn-ghost btn-sm">Apply to all routines</button>
          </div>
        </Card>

        <Card title="Next-session prescription" sub={`computed by ${m.name}`}>
          <table className="tbl">
            <thead><tr><th>Exercise</th><th style={{width: 130}}>Last session</th><th style={{width: 90}}>Phase</th><th style={{width: 140}}>Prescription</th></tr></thead>
            <tbody>
              {[
                ["Bench Press",       "5,5,5,5,4 @ 117.5", "reps",   "5×5 @ 117.5 kg"],
                ["Incline DB Press",  "8,8,7,7 @ 38",      "reps",   "4×8 @ 38 kg"],
                ["OHP · seated",      "6,6,6,6 @ 65",      "weight", "4×6 @ 67.5 kg ↑"],
                ["Cable Fly",         "12,12,12 @ 22",     "weight", "3×12 @ 24 kg ↑"],
                ["Lateral Raise",     "15,14,12 @ 9",      "stalled","3×15 @ 9 kg · deload flag"],
                ["Triceps Pushdown",  "12,12,10 @ 38",     "reps",   "3×12 @ 38 kg"],
              ].map((r, i) => (
                <tr key={i}>
                  <td>{r[0]}</td>
                  <td className="num muted" style={{fontSize: 11}}>{r[1]}</td>
                  <td><Pill style={{fontSize: 9.5, color: r[2] === "weight" ? "var(--pos)" : r[2] === "stalled" ? "var(--warn)" : "var(--fg-muted)"}}>{r[2]}</Pill></td>
                  <td className="num" style={{fontSize: 11.5, color: r[3].includes("↑") ? "var(--pos)" : r[3].includes("deload") ? "var(--warn)" : "var(--fg)"}}>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Fatigue detection" sub={`${triggered} of 4 triggers active`}
          actions={triggered > 0 ? <Pill variant="warn">deload suggested</Pill> : <Pill variant="pos">clear</Pill>}>
          <div className="col-gap" style={{gap: 6}}>
            {DELOAD_TRIGGERS.map((t, i) => (
              <div key={i} style={{
                padding: 10, borderRadius: 6,
                background: t.hit ? "color-mix(in srgb, var(--warn) 7%, var(--surface))" : "var(--surface)",
                border: `1px solid ${t.hit ? "color-mix(in srgb, var(--warn) 28%, var(--border))" : "var(--border)"}`,
              }}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                  <span style={{width: 6, height: 6, borderRadius: 999, background: t.hit ? "var(--warn)" : "var(--fg-dim)", flexShrink: 0}}/>
                  <span style={{fontSize: 11.5, fontWeight: t.hit ? 600 : 400, color: t.hit ? "var(--fg)" : "var(--fg-muted)"}}>{t.t}</span>
                </div>
                <div className="dim mono" style={{fontSize: 10, paddingLeft: 14}}>{t.detail}</div>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Deload protocol</div>
          <Row label="Weight reduction" value="−10%"/>
          <Row label="Set reduction" value="2/3 of normal"/>
          <Row label="Duration" value="1 week"/>
          <Row label="Threshold" value="3 sessions without progression"/>
          <button className="btn btn-sm" style={{width: "100%", marginTop: 10}}>Schedule deload week</button>
        </Card>

        <Card title="Set types" sub="volume counting">
          {SET_TYPES.map(s => (
            <div key={s.id} className="row">
              <span className="row-l">
                <span className="mono" style={{fontSize: 11}}>{s.label}</span>
                <span className="dim" style={{fontSize: 10}}>{s.desc}</span>
              </span>
              <span className="row-r" style={{color: s.volume ? "var(--pos)" : "var(--fg-dim)"}}>{s.volume ? "counts" : "excluded"}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ── Block C: Volume landmarks ─────────────────────────────
const LANDMARKS = [
  { m: "Chest",      mev: 10, mav: 18, mrv: 22, cur: 14, pump: 2.6, sore: 1.4, points: 7 },
  { m: "Back",       mev: 12, mav: 20, mrv: 25, cur: 18, pump: 2.4, sore: 1.8, points: 9 },
  { m: "Shoulders",  mev:  8, mav: 16, mrv: 20, cur: 10, pump: 1.8, sore: 1.2, points: 6 },
  { m: "Biceps",     mev:  8, mav: 14, mrv: 20, cur: 14, pump: 2.8, sore: 1.3, points: 8 },
  { m: "Triceps",    mev:  6, mav: 14, mrv: 18, cur: 14, pump: 2.2, sore: 1.6, points: 8 },
  { m: "Quads",      mev:  8, mav: 16, mrv: 20, cur: 18, pump: 2.0, sore: 2.6, points: 11 },
  { m: "Hamstrings", mev:  6, mav: 12, mrv: 16, cur:  9, pump: 1.6, sore: 1.4, points: 5 },
  { m: "Glutes",     mev:  4, mav: 12, mrv: 16, cur: 10, pump: 2.2, sore: 1.5, points: 6 },
  { m: "Calves",     mev:  8, mav: 14, mrv: 20, cur:  6, pump: 1.4, sore: 1.1, points: 4 },
  { m: "Abs",        mev:  6, mav: 14, mrv: 20, cur:  8, pump: 2.0, sore: 1.2, points: 5 },
];

function landmarkStatus(l) {
  if (l.cur < l.mev) return { k: "below_mev",       c: "var(--neg)",  l: "below MEV" };
  if (l.cur > l.mrv) return { k: "over_mrv",        c: "var(--neg)",  l: "over MRV · deload" };
  if (l.cur > l.mav) return { k: "approaching_mrv", c: "var(--warn)", l: "approaching MRV" };
  return { k: "optimal", c: "var(--pos)", l: "optimal" };
}
function feedbackVerdict(l) {
  if (l.points < 5) return { t: "collecting", c: "var(--fg-dim)", d: `${l.points} of 5 data points` };
  if (l.pump >= 2.5 && l.sore <= 1.5) return { t: "MAV +1", c: "var(--pos)", d: "can handle more volume" };
  if (l.sore >= 2.5 && l.pump <= 1.5) return { t: "MRV capped", c: "var(--warn)", d: "MRV reached or exceeded" };
  return { t: "no change", c: "var(--fg-muted)", d: "data point logged" };
}

window.TrainingLandmarksView = () => {
  const push = LANDMARKS.filter(l => ["Chest","Shoulders","Triceps"].includes(l.m)).reduce((s,l) => s + l.cur, 0);
  const pull = LANDMARKS.filter(l => ["Back","Biceps"].includes(l.m)).reduce((s,l) => s + l.cur, 0);
  const ratio = +(push / pull).toFixed(2);
  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Optimal zone</div>
          <div className="num" style={{fontSize: 22, color: "var(--pos)"}}>{LANDMARKS.filter(l => landmarkStatus(l).k === "optimal").length}</div>
          <div className="dim" style={{fontSize: 11}}>of {LANDMARKS.length} muscle groups</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Below MEV</div>
          <div className="num" style={{fontSize: 22, color: "var(--neg)"}}>{LANDMARKS.filter(l => landmarkStatus(l).k === "below_mev").length}</div>
          <div className="dim" style={{fontSize: 11}}>needs more volume</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Approaching MRV</div>
          <div className="num" style={{fontSize: 22, color: "var(--warn)"}}>{LANDMARKS.filter(l => landmarkStatus(l).k === "approaching_mrv").length}</div>
          <div className="dim" style={{fontSize: 11}}>watch fatigue</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Push : Pull ratio</div>
          <div className="num" style={{fontSize: 22, color: Math.abs(ratio - 1) <= 0.15 ? "var(--pos)" : "var(--warn)"}}>{ratio}</div>
          <div className="dim" style={{fontSize: 11}}>{push} push / {pull} pull sets · target ~1.0</div>
        </Card>
      </div>

      <Card title="Volume landmarks · sets per week" sub="RP Hypertrophy defaults, personalised by your feedback">
        <div className="col-gap" style={{gap: 4}}>
          {LANDMARKS.map(l => {
            const st = landmarkStatus(l);
            const fb = feedbackVerdict(l);
            const scale = 28;
            return (
              <div key={l.m} style={{display: "grid", gridTemplateColumns: "90px 1fr 90px 110px 120px", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 45%, transparent)"}}>
                <span style={{fontSize: 12}}>{l.m}</span>
                {/* landmark bar */}
                <div style={{position: "relative", height: 16, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden"}}>
                  {/* zones */}
                  <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${(l.mev/scale)*100}%`, background: "color-mix(in srgb, var(--neg) 14%, transparent)"}}/>
                  <div style={{position: "absolute", left: `${(l.mev/scale)*100}%`, top: 0, bottom: 0, width: `${((l.mav-l.mev)/scale)*100}%`, background: "color-mix(in srgb, var(--pos) 16%, transparent)"}}/>
                  <div style={{position: "absolute", left: `${(l.mav/scale)*100}%`, top: 0, bottom: 0, width: `${((l.mrv-l.mav)/scale)*100}%`, background: "color-mix(in srgb, var(--warn) 16%, transparent)"}}/>
                  <div style={{position: "absolute", left: `${(l.mrv/scale)*100}%`, top: 0, right: 0, background: "color-mix(in srgb, var(--neg) 14%, transparent)"}}/>
                  {/* current */}
                  <div style={{position: "absolute", left: 0, top: 3, height: 10, width: `${(l.cur/scale)*100}%`, background: st.c, opacity: 0.85, borderRadius: 3}}/>
                  {/* markers */}
                  {[["mev", l.mev], ["mav", l.mav], ["mrv", l.mrv]].map(([k, v]) => (
                    <div key={k} style={{position: "absolute", left: `${(v/scale)*100}%`, top: 0, bottom: 0, width: 1, background: "var(--fg-dim)", opacity: 0.55}}/>
                  ))}
                </div>
                <span className="num" style={{fontSize: 11.5, textAlign: "right", color: st.c, fontWeight: 500}}>{l.cur} sets</span>
                <Pill style={{borderColor: `color-mix(in srgb, ${st.c} 32%, var(--border))`, color: st.c, fontSize: 9.5}}>{st.l}</Pill>
                <div style={{textAlign: "right"}}>
                  <div className="num" style={{fontSize: 10.5, color: fb.c}}>{fb.t}</div>
                  <div className="dim" style={{fontSize: 9.5}}>{fb.d}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display: "flex", gap: 14, marginTop: 12, fontSize: 10, color: "var(--fg-muted)", flexWrap: "wrap"}}>
          <span className="row-gap"><span style={{width: 12, height: 10, background: "color-mix(in srgb, var(--neg) 14%, transparent)", borderRadius: 2}}/>below MEV</span>
          <span className="row-gap"><span style={{width: 12, height: 10, background: "color-mix(in srgb, var(--pos) 16%, transparent)", borderRadius: 2}}/>MEV → MAV optimal</span>
          <span className="row-gap"><span style={{width: 12, height: 10, background: "color-mix(in srgb, var(--warn) 16%, transparent)", borderRadius: 2}}/>MAV → MRV</span>
          <span className="row-gap"><span style={{width: 12, height: 10, background: "color-mix(in srgb, var(--neg) 14%, transparent)", borderRadius: 2}}/>over MRV</span>
          <span className="dim" style={{marginLeft: "auto"}}>MEV minimum effective · MAV adaptive max · MRV recoverable max</span>
        </div>
      </Card>

      <div style={{height: 14}}/>
      <div className="grid" style={{gridTemplateColumns: "1fr 1fr", gap: 14}}>
        <Card title="Feedback loop" sub="pump + soreness → personal MAV/MRV">
          <div className="dim" style={{fontSize: 11.5, marginBottom: 12, lineHeight: 1.55}}>
            After each session you rate pump (1–3) and soreness (1–3) per muscle group. After 5 data points the algorithm shifts your personal landmarks.
          </div>
          <pre style={{margin: 0, padding: 12, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, lineHeight: 1.7, color: "var(--fg-muted)", whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)"}}>{`IF pump ≥ 2.5 AND soreness ≤ 1.5
   → personal_mav += 1

IF soreness ≥ 2.5 AND pump ≤ 1.5
   → personal_mrv = MIN(mrv, current_sets)

ELSE
   → no change · data point logged

min 5 entries per muscle group`}</pre>
        </Card>
        <Card title="Post-workout feedback" sub="Push B · logged 2 min ago">
          <div className="col-gap" style={{gap: 8}}>
            {["Chest", "Shoulders", "Triceps"].map(mg => (
              <div key={mg}>
                <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5}}>
                  <span style={{fontSize: 12, width: 78}}>{mg}</span>
                  <span className="dim mono" style={{fontSize: 10}}>pump</span>
                  <div style={{display: "flex", gap: 3, flex: 1}}>
                    {[1,2,3].map(v => (
                      <button key={v} style={{flex: 1, height: 22, borderRadius: 4, cursor: "pointer",
                        background: v <= 2 ? "var(--pos)" : "var(--surface-2)", opacity: v <= 2 ? 0.5 + v * 0.2 : 1,
                        color: v <= 2 ? "var(--bg)" : "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600}}>{v}</button>
                    ))}
                  </div>
                  <span className="dim mono" style={{fontSize: 10}}>sore</span>
                  <div style={{display: "flex", gap: 3, flex: 1}}>
                    {[1,2,3].map(v => (
                      <button key={v} style={{flex: 1, height: 22, borderRadius: 4, cursor: "pointer",
                        background: v <= 1 ? "var(--warn)" : "var(--surface-2)", opacity: v <= 1 ? 0.7 : 1,
                        color: v <= 1 ? "var(--bg)" : "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600}}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Session rating</div>
          <div style={{display: "flex", gap: 6}}>
            {["😩","😐","🙂","💪"].map((e, i) => (
              <button key={e} className={i === 2 ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1, fontSize: 15}}>{e}</button>
            ))}
          </div>
          <button className="btn btn-primary" style={{width: "100%", marginTop: 10}}><Icon name="check" className="ic ic-sm"/>Submit feedback</button>
        </Card>
      </div>
    </div>
  );
};

// ── Strength standards + training score ───────────────────
window.TrainingStandardsView = () => {
  const bw = 79.4;
  const lifts = [
    { n: "Bench Press", e1rm: 122.5, std: { beginner: 0.75, novice: 1.0, intermediate: 1.25, advanced: 1.6, elite: 2.0 } },
    { n: "Squat",       e1rm: 165,   std: { beginner: 1.0,  novice: 1.35, intermediate: 1.75, advanced: 2.2, elite: 2.75 } },
    { n: "Deadlift",    e1rm: 192,   std: { beginner: 1.25, novice: 1.65, intermediate: 2.1,  advanced: 2.6, elite: 3.2 } },
    { n: "OHP",         e1rm: 72.5,  std: { beginner: 0.45, novice: 0.65, intermediate: 0.85, advanced: 1.1, elite: 1.4 } },
  ];
  const cat = (ratio, std) => {
    if (ratio >= std.elite) return { l: "Elite", c: "var(--acc-buddy)" };
    if (ratio >= std.advanced) return { l: "Advanced", c: "var(--pos)" };
    if (ratio >= std.intermediate) return { l: "Intermediate", c: "var(--acc-train)" };
    if (ratio >= std.novice) return { l: "Novice", c: "var(--warn)" };
    return { l: "Beginner", c: "var(--fg-dim)" };
  };
  const scoreParts = { adherence: 0.92, landmarks: 0.60, strength: 0.88, balance: 0.94 };
  const trainingScore = Math.round((scoreParts.adherence * 0.40 + scoreParts.landmarks * 0.30 + scoreParts.strength * 0.20 + scoreParts.balance * 0.10) * 100);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
      <Card title="Strength standards" sub={`Brzycki e1RM ÷ bodyweight ${bw} kg · population comparison`}>
        <div className="col-gap" style={{gap: 12}}>
          {lifts.map(l => {
            const ratio = +(l.e1rm / bw).toFixed(2);
            const c = cat(ratio, l.std);
            const max = l.std.elite * 1.1;
            return (
              <div key={l.n}>
                <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6}}>
                  <span style={{fontSize: 12.5, fontWeight: 500, width: 110}}>{l.n}</span>
                  <span className="num" style={{fontSize: 13}}>{l.e1rm} kg</span>
                  <span className="dim mono" style={{fontSize: 10.5}}>{ratio}× BW</span>
                  <Pill style={{marginLeft: "auto", borderColor: `color-mix(in srgb, ${c.c} 35%, var(--border))`, color: c.c, fontSize: 9.5}}>{c.l}</Pill>
                </div>
                <div style={{position: "relative", height: 18, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden"}}>
                  {Object.entries(l.std).map(([k, v], i) => (
                    <div key={k} style={{position: "absolute", left: `${(v/max)*100}%`, top: 0, bottom: 0, width: 1, background: "var(--border-strong)"}}>
                      <span className="dim mono" style={{position: "absolute", top: 3, left: 3, fontSize: 8, whiteSpace: "nowrap"}}>{k.slice(0, 3)}</span>
                    </div>
                  ))}
                  <div style={{position: "absolute", left: 0, top: 4, height: 10, width: `${(ratio/max)*100}%`, background: c.c, opacity: 0.8, borderRadius: 3}}/>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Training score" sub="exported to Goals">
        <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 12}}>
          <Ring value={trainingScore} max={100} color="var(--acc-train)" label="score" size={88} stroke={7}/>
          <div className="dim mono" style={{fontSize: 10.5, lineHeight: 1.7}}>
            adherence&nbsp; 0.92 × 0.40<br/>
            landmarks&nbsp; 0.60 × 0.30<br/>
            strength&nbsp;&nbsp; 0.88 × 0.20<br/>
            balance&nbsp;&nbsp;&nbsp; 0.94 × 0.10
          </div>
        </div>
        <Row label="Session adherence" value="22 of 24"/>
        <Row label="Volume in landmarks" value="6 of 10 groups"/>
        <Row label="Strength trend" value="+4.2% · 12 wk"/>
        <Row label="Muscle balance" value="Push:Pull 1.05"/>
        <div className="divider"/>
        <div className="dim" style={{fontSize: 11, lineHeight: 1.5}}>
          Landmarks is the weak component — 4 groups outside MAV. Bringing calves and hamstrings into range lifts the score by ~9 points.
        </div>
      </Card>
    </div>
  );
};

// ── Block D: tools ────────────────────────────────────────
window.PlateCalculatorModal = ({ onClose }) => {
  const [target, setTarget] = React.useState(117.5);
  const [bar, setBar] = React.useState(20);
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const perSide = (target - bar) / 2;
  let rest = perSide;
  const load = [];
  for (const p of plates) {
    const n = Math.floor(rest / p);
    if (n > 0) { load.push([p, n]); rest = +(rest - n * p).toFixed(2); }
  }
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 520}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-train) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-train) 38%, var(--border))", color: "var(--acc-train)", display: "grid", placeItems: "center"}}><Icon name="training" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Plate calculator</div>
            <div className="dim" style={{fontSize: 11}}>Per side loading</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16}}>
          <div className="grid g-cols-2" style={{gap: 10, marginBottom: 14}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Target weight</div>
              <input type="number" value={target} step="2.5" onChange={e => setTarget(Number(e.target.value))}
                style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 13, fontFamily: "var(--font-mono)"}}/>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Bar</div>
              <div style={{display: "flex", gap: 4}}>
                {[20, 15, 10].map(b => (
                  <button key={b} onClick={() => setBar(b)} className={bar === b ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{b} kg</button>
                ))}
              </div>
            </div>
          </div>
          {/* visual bar */}
          <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 2, padding: "20px 0", marginBottom: 12}}>
            {load.slice().reverse().map(([p, n]) => Array.from({length: n}).map((_, i) => (
              <div key={`${p}-${i}`} style={{
                width: 9, height: 20 + p * 2.2, borderRadius: 2,
                background: p >= 20 ? "var(--neg)" : p >= 15 ? "var(--acc-goals)" : p >= 10 ? "var(--acc-recov)" : p >= 5 ? "var(--acc-train)" : "var(--fg-dim)",
              }} title={`${p} kg`}/>
            )))}
            <div style={{width: 60, height: 6, background: "var(--fg-dim)", borderRadius: 2}}/>
            {load.map(([p, n]) => Array.from({length: n}).map((_, i) => (
              <div key={`r-${p}-${i}`} style={{
                width: 9, height: 20 + p * 2.2, borderRadius: 2,
                background: p >= 20 ? "var(--neg)" : p >= 15 ? "var(--acc-goals)" : p >= 10 ? "var(--acc-recov)" : p >= 5 ? "var(--acc-train)" : "var(--fg-dim)",
              }} title={`${p} kg`}/>
            )))}
          </div>
          <Card className="card-tight" style={{padding: 12}}>
            <div className="eyebrow" style={{marginBottom: 8}}>Per side · {perSide} kg</div>
            {load.length === 0
              ? <div className="dim" style={{fontSize: 12}}>Bar only</div>
              : load.map(([p, n]) => (
                  <div key={p} className="row" style={{padding: "5px 0"}}>
                    <span className="row-l num">{p} kg</span>
                    <span className="row-r">× {n}</span>
                  </div>
                ))}
            {rest > 0 && <div style={{marginTop: 8, fontSize: 11, color: "var(--warn)", fontFamily: "var(--font-mono)"}}>⚠ {rest} kg not loadable with available plates</div>}
          </Card>
        </div>
        <div className="modal-f"><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
};

window.WarmupCalculatorModal = ({ onClose }) => {
  const work = 117.5;
  const scheme = [
    { pct: 0.40, reps: 8,  label: "Activation" },
    { pct: 0.55, reps: 5,  label: "Light" },
    { pct: 0.70, reps: 3,  label: "Ramp" },
    { pct: 0.85, reps: 2,  label: "Primer" },
    { pct: 0.93, reps: 1,  label: "Neural" },
  ];
  const round = w => Math.round(w / 2.5) * 2.5;
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 520}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-train) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-train) 38%, var(--border))", color: "var(--acc-train)", display: "grid", placeItems: "center"}}><Icon name="flame" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Warm-up calculator</div>
            <div className="dim" style={{fontSize: 11}}>Bench Press · working weight {work} kg</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16}}>
          <table className="tbl">
            <thead><tr><th style={{width: 40}}>Set</th><th>Stage</th><th style={{width: 70, textAlign: "right"}}>%</th><th style={{width: 90, textAlign: "right"}}>Weight</th><th style={{width: 60, textAlign: "right"}}>Reps</th></tr></thead>
            <tbody>
              {scheme.map((s, i) => (
                <tr key={i}>
                  <td className="num muted">W{i + 1}</td>
                  <td>{s.label}</td>
                  <td className="num muted" style={{textAlign: "right"}}>{Math.round(s.pct * 100)}%</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 500}}>{round(work * s.pct)} kg</td>
                  <td className="num" style={{textAlign: "right"}}>{s.reps}</td>
                </tr>
              ))}
              <tr style={{borderTop: "1px solid var(--border-strong)"}}>
                <td className="num" style={{color: "var(--acc-train)"}}>1</td>
                <td style={{fontWeight: 600}}>Working set</td>
                <td className="num muted" style={{textAlign: "right"}}>100%</td>
                <td className="num" style={{textAlign: "right", fontWeight: 600, color: "var(--acc-train)"}}>{work} kg</td>
                <td className="num" style={{textAlign: "right"}}>5</td>
              </tr>
            </tbody>
          </table>
          <div style={{marginTop: 12, padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5}}>
            Warm-up sets are logged as <span className="mono">warmup</span> type and excluded from weekly volume.
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add to session</button>
        </div>
      </div>
    </div>
  );
};

window.AIWorkoutGenModal = ({ onClose }) => {
  const [step, setStep] = React.useState(1);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 680, maxHeight: "90vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-train) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-train) 38%, var(--border))", color: "var(--acc-train)", display: "grid", placeItems: "center"}}><Icon name="bolt" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Generate workout</div>
            <div className="dim" style={{fontSize: 11}}>Rules-based · no ML · evaluation-score driven</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          {step === 1 && (
            <>
              <div className="eyebrow" style={{marginBottom: 8}}>Algorithm steps</div>
              <div className="col-gap" style={{gap: 4}}>
                {[
                  ["1", "Determine target muscle groups", "from plan: Chest, Shoulders, Triceps"],
                  ["2", "Compute volume need", "Chest 14→18 · Shoulders 10→16 · Triceps 14→14"],
                  ["3", "Filter by equipment + recovery", "recovery_status < 70% excluded → none blocked"],
                  ["4", "Sort by evaluation_score DESC", "SFR · mechanical tension · stretch position"],
                  ["5", "Pick top-N until volume met", "7 exercises selected"],
                  ["6", "Sets × reps from progression model", "Double Progression active"],
                  ["7", "Preview → you confirm", "nothing is saved until you accept"],
                ].map(([n, t, d]) => (
                  <div key={n} style={{display: "flex", gap: 10, padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                    <span style={{width: 20, height: 20, borderRadius: 999, background: "var(--acc-train)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0}}>{n}</span>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 12, fontWeight: 500}}>{t}</div>
                      <div className="dim mono" style={{fontSize: 10, marginTop: 2}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="eyebrow" style={{marginBottom: 8}}>Generated session · Push</div>
              <table className="tbl">
                <thead><tr><th>Exercise</th><th style={{width: 70, textAlign: "right"}}>Score</th><th style={{width: 110}}>Prescription</th><th style={{width: 80}}>Primary</th></tr></thead>
                <tbody>
                  {[
                    ["Bench Press · Barbell", 94, "5×5 @ 117.5", "Chest"],
                    ["Incline DB Press",      89, "4×8 @ 38",    "Chest"],
                    ["OHP · seated",          87, "4×6 @ 67.5",  "Shoulders"],
                    ["Dips · weighted",       85, "3×10 @ +15",  "Chest"],
                    ["Lateral Raise · cable", 78, "3×15 @ 9",    "Shoulders"],
                    ["Overhead Triceps Ext.", 74, "3×10 @ 24",   "Triceps"],
                    ["Triceps Pushdown",      71, "3×12 @ 38",   "Triceps"],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r[0]}</td>
                      <td className="num" style={{textAlign: "right", color: r[1] >= 85 ? "var(--pos)" : r[1] >= 75 ? "var(--acc-train)" : "var(--fg-muted)", fontWeight: 500}}>{r[1]}</td>
                      <td className="num" style={{fontSize: 11.5}}>{r[2]}</td>
                      <td className="muted" style={{fontSize: 11}}>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop: 12, display: "flex", gap: 14, fontSize: 11, color: "var(--fg-muted)"}}>
                <span>22 sets</span><span>≈ 6.4 t volume</span><span>~72 min</span><span>Avg score 82.6</span>
              </div>
            </>
          )}
        </div>
        <div className="modal-f">
          {step === 2 ? <button className="btn btn-ghost" onClick={() => setStep(1)}><Icon name="chevron_left" className="ic ic-sm"/>Back</button> : <div/>}
          <div className="spacer"/>
          {step === 1
            ? <button className="btn btn-primary" onClick={() => setStep(2)}>Generate<Icon name="arrow_right" className="ic ic-sm"/></button>
            : <><button className="btn">Regenerate</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Accept session</button></>}
        </div>
      </div>
    </div>
  );
};

window.TrainingCalendarView = () => {
  const firstDay = 4; // May 2026 starts Friday
  const days = 31;
  const done = [1,2,3,5,6,8,9,10,12,13,14,16];
  const planned = [17,18,19,21,22,23,25,26,27,29,30];
  const cells = Array(firstDay).fill(null).concat(Array.from({length: days}, (_, i) => i + 1));
  while (cells.length % 7) cells.push(null);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
      <Card title="May 2026" sub={`${done.length} sessions logged · ${planned.length} planned`}
        actions={<><button className="btn btn-ghost btn-sm"><Icon name="chevron_left" className="ic ic-sm"/></button><button className="btn btn-ghost btn-sm">May</button><button className="btn btn-ghost btn-sm"><Icon name="chevron_right" className="ic ic-sm"/></button></>}>
        <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6}}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} className="dim mono" style={{fontSize: 9.5, textAlign: "center", padding: 4}}>{d}</div>
          ))}
        </div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4}}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{aspectRatio: "1"}}/>;
            const isDone = done.includes(d);
            const isPlanned = planned.includes(d);
            const isToday = d === 16;
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 6, padding: 6,
                background: isToday ? "color-mix(in srgb, var(--acc-train) 10%, var(--surface))" : "var(--surface)",
                border: `1px solid ${isToday ? "var(--acc-train)" : "var(--border)"}`,
                borderStyle: isPlanned ? "dashed" : "solid",
                display: "flex", flexDirection: "column", cursor: "pointer",
              }}>
                <span className="num" style={{fontSize: 10.5, color: isToday ? "var(--acc-train)" : "var(--fg-muted)", fontWeight: isToday ? 600 : 400}}>{d}</span>
                <div style={{marginTop: "auto", display: "flex", justifyContent: "center"}}>
                  {isDone && <span style={{width: 7, height: 7, borderRadius: 999, background: "var(--pos)"}}/>}
                  {isPlanned && <span style={{width: 7, height: 7, borderRadius: 999, border: "1px solid var(--acc-train)"}}/>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display: "flex", gap: 14, marginTop: 12, fontSize: 10, color: "var(--fg-muted)"}}>
          <span className="row-gap"><span style={{width: 7, height: 7, borderRadius: 999, background: "var(--pos)"}}/>completed</span>
          <span className="row-gap"><span style={{width: 7, height: 7, borderRadius: 999, border: "1px solid var(--acc-train)"}}/>planned</span>
          <span className="row-gap"><span style={{width: 10, height: 10, borderRadius: 3, border: "1px solid var(--acc-train)"}}/>today</span>
        </div>
      </Card>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Streak">
          <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10}}>
            <span className="num" style={{fontSize: 32, fontWeight: 600}}>12</span>
            <span className="dim" style={{fontSize: 12}}>consecutive active weeks</span>
          </div>
          <Row label="Longest streak" value="18 weeks"/>
          <Row label="This month" value="12 of 13 planned"/>
          <Row label="Adherence" value="92%"/>
        </Card>
        <Card title="Cross-module gating" sub="today's checks">
          <div className="col-gap" style={{gap: 6}}>
            {[
              { src: "Recovery", v: "readiness 84", ok: true,  msg: "Full volume — no restriction" },
              { src: "Recovery", v: "chest 88 · shoulders 70", ok: true, msg: "All target muscles above 50" },
              { src: "Goals",    v: "phase recomp", ok: true,  msg: "Volume at lower MAV" },
              { src: "Medical",  v: "CRP 0.6 · normal", ok: true, msg: "No inflammation flag" },
              { src: "Medical",  v: "no injury flags", ok: true, msg: "All exercises available" },
            ].map((c, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
                <Icon name={c.ok ? "check" : "alert"} className="ic ic-sm" style={{color: c.ok ? "var(--pos)" : "var(--warn)", flexShrink: 0}}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 11.5}}>{c.msg}</div>
                  <div className="dim mono" style={{fontSize: 9.5, marginTop: 1}}>{c.src} · {c.v}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 6}}>Gate rules</div>
          <div className="dim mono" style={{fontSize: 10, lineHeight: 1.7}}>
            readiness &lt; 60 → volume −20-30%<br/>
            readiness &lt; 40 → rest day<br/>
            muscle_readiness &lt; 50 → skip muscle<br/>
            crp_elevated → reduce volume<br/>
            injury_flag → hide exercises
          </div>
        </Card>
        <Card title="Pending actions">
          <div className="col-gap" style={{gap: 6}}>
            {[
              { t: "Post-workout feedback open", s: "Push B · 2 min ago", act: "Rate" },
              { t: "Deload flag · Lateral Raise", s: "no progression 4 sessions", act: "Review" },
              { t: "Calves below MEV", s: "6 of 8 sets · 4 days", act: "Add sets" },
            ].map((a, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 11.5}}>{a.t}</div>
                  <div className="dim mono" style={{fontSize: 9.5}}>{a.s}</div>
                </div>
                <button className="btn btn-sm">{a.act}</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { PROGRESSION_MODELS, LANDMARKS, SET_TYPES, EX_CLASSIFICATION, landmarkStatus });
