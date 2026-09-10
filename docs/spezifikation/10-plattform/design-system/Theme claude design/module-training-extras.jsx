// Training module — extras: Routine editor, exercise detail, block editor,
// custom exercise flow, body-stats correlation, video reference.

const TrainCtx = React.createContext(null);

// ── Routine fixtures with supersets ────────────────────────
const ROUTINE_TEMPLATES = [
  { id: "push_a", name: "Push A · Heavy", origin: "coach", blocks: 7, sets: 22, vol: "≈ 6.8 t",
    exercises: [
      { name: "Bench Press · Barbell", target: "5×5 @ 117.5kg", rir: "RIR 2", restSec: 180, group: null, equip: "Barbell" },
      { name: "Incline DB Press",       target: "4×8 @ 38kg",   rir: "RIR 2", restSec: 120, group: null, equip: "Dumbbell" },
      { name: "OHP · seated",           target: "4×6 @ 65kg",   rir: "RIR 2", restSec: 180, group: null, equip: "Barbell" },
      { name: "Cable Fly",              target: "3×12 @ 22kg",  rir: "RIR 1", restSec: 90,  group: "A",  equip: "Cable" },
      { name: "Triceps Pushdown",       target: "3×12 @ 38kg",  rir: "RIR 1", restSec: 90,  group: "A",  equip: "Cable" },
      { name: "Lateral Raise",          target: "3×15 @ 9kg",   rir: "RIR 0", restSec: 60,  group: "B",  equip: "Dumbbell" },
      { name: "Overhead Triceps Ext.",  target: "3×10 @ 24kg",  rir: "RIR 1", restSec: 60,  group: "B",  equip: "Dumbbell" },
    ],
  },
  { id: "push_b", name: "Push B · Volume", origin: "coach", blocks: 7, sets: 24, vol: "≈ 6.2 t",
    exercises: [
      { name: "Bench Press · Barbell", target: "5×5 @ 117.5kg", rir: "RIR 2", restSec: 180, group: null, equip: "Barbell" },
      { name: "Incline DB Press",       target: "4×8 @ 38kg",    rir: "RIR 2", restSec: 120, group: null, equip: "Dumbbell" },
      { name: "Cable Fly",              target: "3×12 @ 22kg",   rir: "RIR 1", restSec: 90,  group: null, equip: "Cable" },
      { name: "OHP · seated",           target: "4×6 @ 65kg",    rir: "RIR 2", restSec: 180, group: null, equip: "Barbell" },
      { name: "Lateral Raise",          target: "3×15 @ 9kg",    rir: "RIR 0", restSec: 60,  group: null, equip: "Dumbbell" },
      { name: "Triceps Pushdown",       target: "3×12 @ 38kg",   rir: "RIR 1", restSec: 90,  group: null, equip: "Cable" },
      { name: "Overhead Triceps Ext.",  target: "3×10 @ 24kg",   rir: "RIR 1", restSec: 60,  group: null, equip: "Dumbbell" },
    ],
  },
];

// ── Wrap original TrainingModule to add modal context ──────
const _OrigTrainingModule = window.TrainingModule;
const TrainingModuleEnhanced = () => {
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({type, payload});
  const close = () => setModal(null);
  return (
    <TrainCtx.Provider value={{ open, close }}>
      <_OrigTrainingModule />
      {modal?.type === "routineEditor" && <RoutineEditorModal routine={modal.payload} onClose={close}/>}
      {modal?.type === "exerciseDetail" && <ExerciseDetailModal exercise={modal.payload} onClose={close}/>}
      {modal?.type === "customExercise" && <CustomExerciseModal onClose={close}/>}
      {modal?.type === "blockEditor"   && <BlockEditorModal block={modal.payload} onClose={close}/>}
      {modal?.type === "assignWeek"    && <AssignWeekModal onClose={close}/>}
      {modal?.type === "supersetEdit"  && <SupersetEditorModal exercises={modal.payload} onClose={close}/>}
    </TrainCtx.Provider>
  );
};
window.TrainingModule = TrainingModuleEnhanced;

// ── MODALS ───────────────────────────────────────────────────
const TModal = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 640 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && (
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: `color-mix(in oklch, ${accent || "var(--acc-train)"} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent || "var(--acc-train)"} 35%, transparent)`,
            color: accent || "var(--acc-train)", display: "grid", placeItems: "center"
          }}><Icon name={eyebrow} className="ic"/></div>
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

const TField = ({ label, sub, children }) => (
  <div style={{marginBottom: 12}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4}}>
      <label className="eyebrow">{label}</label>
      {sub && <span className="dim" style={{fontSize: 10}}>{sub}</span>}
    </div>
    {children}
  </div>
);
const TInput = props => <input {...props} style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5, outline: "none", ...(props.style || {})}}/>;

// ── ROUTINE EDITOR ──────────────────────────────────────────
const RoutineEditorModal = ({ routine, onClose }) => {
  const [r, setR] = useState(routine || { name: "New routine", origin: "self", exercises: [] });
  const upd = (k, v) => setR(s => ({...s, [k]: v}));
  const updEx = (i, k, v) => setR(s => ({...s, exercises: s.exercises.map((e, j) => j === i ? {...e, [k]: v} : e)}));
  const moveEx = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= r.exercises.length) return;
    const next = [...r.exercises];
    [next[i], next[j]] = [next[j], next[i]];
    setR(s => ({...s, exercises: next}));
  };
  const delEx = i => setR(s => ({...s, exercises: s.exercises.filter((_, j) => j !== i)}));
  const addEx = () => setR(s => ({...s, exercises: [...s.exercises, { name: "Bench Press", target: "3×8 @ 80kg", rir: "RIR 2", restSec: 120, group: null, equip: "Barbell" }]}));

  // Group exercises by superset
  const grouped = [];
  let lastGroup = null;
  r.exercises.forEach((ex, i) => {
    if (ex.group && ex.group === lastGroup) {
      grouped[grouped.length - 1].items.push({ ...ex, _idx: i });
    } else {
      grouped.push({ group: ex.group, items: [{ ...ex, _idx: i }] });
      lastGroup = ex.group;
    }
  });

  return (
    <TModal title={`Routine editor · ${r.name}`} subtitle="Drag, supersets, rest timers · saves to your plan"
      eyebrow="edit" onClose={onClose} width={780}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn"><Icon name="copy" className="ic ic-sm"/>Save as template</button>
        <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save routine</button>
      </>}>
      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10}}>
        <TField label="Routine name"><TInput value={r.name} onChange={e => upd("name", e.target.value)}/></TField>
        <TField label="Block"><select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}><option>Block 3 · current</option><option>Block 4</option><option>None</option></select></TField>
        <TField label="Origin"><select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}><option>Self</option><option>Coach</option><option>Marketplace</option></select></TField>
      </div>

      <div className="eyebrow" style={{marginTop: 6, marginBottom: 8}}>Exercises · drag to reorder · group with shift-click for superset</div>
      <div className="col-gap" style={{gap: 4}}>
        {grouped.map((g, gi) => (
          <div key={gi} style={{
            padding: g.group ? 8 : 0,
            background: g.group ? "color-mix(in oklch, var(--acc-train) 6%, var(--surface))" : "transparent",
            border: g.group ? "1px solid color-mix(in oklch, var(--acc-train) 25%, var(--border))" : "none",
            borderRadius: 6
          }}>
            {g.group && (
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 6}}>
                <Pill variant="acc">Superset {g.group}</Pill>
                <span className="dim" style={{fontSize: 10.5}}>back-to-back · single rest after final exercise</span>
              </div>
            )}
            <div className="col-gap" style={{gap: 4}}>
              {g.items.map(ex => (
                <ExerciseEditorRow key={ex._idx} ex={ex} idx={ex._idx}
                  updEx={updEx} moveEx={moveEx} delEx={delEx}/>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{display: "flex", gap: 6, marginTop: 10}}>
        <button className="btn" onClick={addEx}><Icon name="plus" className="ic ic-sm"/>Add exercise</button>
        <button className="btn"><Icon name="layers" className="ic ic-sm"/>Group as superset</button>
        <button className="btn btn-ghost"><Icon name="copy" className="ic ic-sm"/>Import from library</button>
        <div className="spacer"/>
        <span className="dim" style={{fontSize: 11, alignSelf: "center"}}>Estimated · {r.exercises.length} exercises · {r.exercises.reduce((s, e) => s + parseInt(e.target.split("×")[0]) || 3, 0)} sets · ~{Math.round(r.exercises.length * 12)}min</span>
      </div>

      <div className="divider"/>
      <TField label="Notes"><TInput placeholder="Block context, deload notes, technique cues…"/></TField>
    </TModal>
  );
};

const ExerciseEditorRow = ({ ex, idx, updEx, moveEx, delEx }) => (
  <div style={{display: "grid", gridTemplateColumns: "20px 1fr 110px 70px 90px 80px", gap: 6, alignItems: "center", padding: "6px 8px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5}}>
    <span className="num dim" style={{fontSize: 10, textAlign: "center"}}>{(idx + 1).toString().padStart(2, "0")}</span>
    <TInput value={ex.name} onChange={e => updEx(idx, "name", e.target.value)}/>
    <TInput value={ex.target} onChange={e => updEx(idx, "target", e.target.value)}/>
    <TInput value={ex.rir} onChange={e => updEx(idx, "rir", e.target.value)}/>
    <TInput value={`${ex.restSec}s rest`} onChange={() => {}}/>
    <div style={{display: "flex", gap: 2, justifyContent: "flex-end"}}>
      <button className="icon-btn" onClick={() => moveEx(idx, -1)} title="Move up"><Icon name="chevron_up" className="ic ic-sm"/></button>
      <button className="icon-btn" onClick={() => moveEx(idx, 1)} title="Move down"><Icon name="chevron_down" className="ic ic-sm"/></button>
      <button className="icon-btn" onClick={() => delEx(idx)} title="Delete"><Icon name="trash" className="ic ic-sm" style={{color: "var(--neg)"}}/></button>
    </div>
  </div>
);

// ── EXERCISE DETAIL ─────────────────────────────────────────
const ExerciseDetailModal = ({ exercise, onClose }) => {
  const ex = exercise || { n: "Bench Press · Barbell", eq: "Barbell", musc: ["Chest", "Triceps", "Front Delt"], type: "Compound", e1rm: "122.5kg", best: "120kg ×3" };
  return (
    <TModal title={ex.n || ex.name} subtitle={`${ex.type || "Compound"} · ${ex.eq || ex.equip || "Barbell"}`}
      eyebrow="training" onClose={onClose} width={760}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn"><Icon name="edit" className="ic ic-sm"/>Edit exercise</button>
        <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add to routine</button>
      </>}>
      <div className="grid g-cols-2" style={{gap: 14, marginBottom: 14}}>
        {/* Video / image placeholder */}
        <div className="placeholder-img" style={{aspectRatio: "16/9", borderRadius: 6, position: "relative"}}>
          <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", flexDirection: "column", gap: 6}}>
            <Icon name="play" className="ic" style={{width: 28, height: 28, color: "var(--acc-train)"}}/>
          </div>
          <div style={{position: "absolute", bottom: 6, left: 6, right: 6, display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
            <span>technique demo · 1:34</span>
            <span>upload your own</span>
          </div>
        </div>
        <div className="col-gap" style={{gap: 6}}>
          <Card className="card-tight" style={{padding: 12}}>
            <div className="eyebrow" style={{marginBottom: 4}}>Current e1RM</div>
            <div className="num" style={{fontSize: 22, fontWeight: 500, color: "var(--acc-train)"}}>{ex.e1rm || "122.5kg"}</div>
            <div className="dim" style={{fontSize: 10}}>est. by Epley · best set {ex.best || "120kg ×3"}</div>
          </Card>
          <div className="grid g-cols-2" style={{gap: 6}}>
            <Card className="card-tight" style={{padding: 10}}>
              <div className="eyebrow">Primary</div>
              <div className="num" style={{fontSize: 12, marginTop: 2}}>Chest (Pec major)</div>
            </Card>
            <Card className="card-tight" style={{padding: 10}}>
              <div className="eyebrow">Synergists</div>
              <div style={{fontSize: 11, marginTop: 2}}>Triceps · Front Delt</div>
            </Card>
            <Card className="card-tight" style={{padding: 10}}>
              <div className="eyebrow">Lift type</div>
              <div style={{fontSize: 11, marginTop: 2}}>Compound</div>
            </Card>
            <Card className="card-tight" style={{padding: 10}}>
              <div className="eyebrow">Last session</div>
              <div className="num" style={{fontSize: 11, marginTop: 2}}>5,5,5,5,4 @ 115kg</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{marginBottom: 6}}>12-week strength progression</div>
      <Card className="card-tight" style={{padding: 12, marginBottom: 14}}>
        <LineChart h={120} range={[100, 130]}
          xLabels={["wk1", "", "", "wk4", "", "", "wk7", "", "", "wk10", "", "wk12"]}
          series={[{ data: [102, 105, 105, 107.5, 110, 112.5, 110, 115, 117.5, 117.5, 120, 122.5], color: "var(--acc-train)" }]}/>
      </Card>

      <div className="grid g-cols-2" style={{gap: 12}}>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 6}}>Technique cues</div>
          <ul style={{margin: 0, paddingLeft: 16, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
            <li>Retract scapula, slight arch</li>
            <li>Bar path angled — touches lower chest, presses back over shoulders</li>
            <li>Drive feet into floor (leg drive)</li>
            <li>Elbows ~60° from torso · not flared</li>
            <li>Lockout without bouncing off chest</li>
          </ul>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 6}}>Common errors</div>
          <ul style={{margin: 0, paddingLeft: 16, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
            <li>Flared elbows · shoulder impingement risk</li>
            <li>Bouncing bar off chest · wastes stretch reflex</li>
            <li>No leg drive · loses force transmission</li>
            <li>Asymmetric press · L/R weakness needs DB work</li>
          </ul>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 6}}>Variations</div>
          <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
            <Pill>Close-grip</Pill><Pill>Wide-grip</Pill><Pill>Pause bench</Pill><Pill>Spoto press</Pill><Pill>Floor press</Pill><Pill>Smith machine</Pill>
          </div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 6}}>Last 5 sessions</div>
          <table className="tbl">
            <tbody>
              <tr><td className="num muted">May 13</td><td className="num">5,5,5,5,4 @ 115kg</td></tr>
              <tr><td className="num muted">May 6</td><td className="num">5,5,5,4,4 @ 115kg</td></tr>
              <tr><td className="num muted">Apr 29</td><td className="num">5,5,5,4 @ 112.5kg</td></tr>
              <tr><td className="num muted">Apr 22</td><td className="num">5,5,4,4 @ 112.5kg</td></tr>
              <tr><td className="num muted">Apr 15</td><td className="num">5,5,5,5 @ 110kg</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </TModal>
  );
};

// ── CUSTOM EXERCISE ─────────────────────────────────────────
const CustomExerciseModal = ({ onClose }) => (
  <TModal title="Custom exercise" subtitle="Add to your library · syncs offline" eyebrow="plus" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save exercise</button></>}>
    <TField label="Exercise name"><TInput placeholder="e.g. Pause Squat · 3-count"/></TField>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
      <TField label="Equipment">
        <select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
          <option>Barbell</option><option>Dumbbell</option><option>Machine</option><option>Cable</option><option>Bodyweight</option><option>Bands</option>
        </select>
      </TField>
      <TField label="Type">
        <select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
          <option>Compound</option><option>Isolation</option><option>Skill</option><option>Cardio</option>
        </select>
      </TField>
    </div>
    <TField label="Primary muscle">
      <select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
        <option>Chest</option><option>Back</option><option>Shoulders</option><option>Biceps</option><option>Triceps</option><option>Quads</option><option>Hamstrings</option><option>Glutes</option><option>Calves</option><option>Core</option>
      </select>
    </TField>
    <TField label="Synergist muscles · comma-separated"><TInput placeholder="e.g. Triceps, Front Delt"/></TField>
    <TField label="Video / image reference"><div className="placeholder-img" style={{aspectRatio: "16/9", borderRadius: 5, cursor: "pointer"}}><div style={{fontSize: 11, color: "var(--fg-dim)", textAlign: "center"}}>tap to upload video or image (optional)</div></div></TField>
    <TField label="Technique notes (optional)"><TInput placeholder="Cues, weight progression, history…"/></TField>
  </TModal>
);

// ── BLOCK EDITOR (Mesocycle) ────────────────────────────────
const BlockEditorModal = ({ block, onClose }) => {
  const [b, setB] = useState(block || {
    name: "Block 3", weeks: 5, periodization: "linear", startLoad: 84, peakLoad: 100, deload: true,
    focus: "Hypertrophy → Strength",
    weekConfig: [
      { week: 1, focus: "Volume accumulation", load: 84, intent: "RPE 7" },
      { week: 2, focus: "Volume accumulation", load: 92, intent: "RPE 7-8" },
      { week: 3, focus: "Intensification",      load: 96, intent: "RPE 8" },
      { week: 4, focus: "Peak intensity",       load: 100, intent: "RPE 9" },
      { week: 5, focus: "Deload",                load: 55, intent: "RPE 5" },
    ]
  });
  return (
    <TModal title={`Mesocycle editor · ${b.name}`} subtitle="Periodization · weekly load · deload schedule"
      eyebrow="calendar" onClose={onClose} width={780}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn"><Icon name="copy" className="ic ic-sm"/>Save as template</button>
        <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save block</button>
      </>}>
      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10}}>
        <TField label="Block name"><TInput value={b.name}/></TField>
        <TField label="Duration"><TInput value={b.weeks} suffix="wk"/></TField>
        <TField label="Periodization">
          <select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
            <option>Linear</option><option>Undulating</option><option>Block (Bompa)</option><option>Conjugate</option>
          </select>
        </TField>
        <TField label="Deload">
          <select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
            <option>Last week</option><option>Mid + last</option><option>None</option>
          </select>
        </TField>
      </div>
      <TField label="Focus / goal"><TInput value={b.focus}/></TField>

      <div className="eyebrow" style={{marginTop: 6, marginBottom: 8}}>Week-by-week plan</div>
      <Card className="card-tight" style={{padding: 0}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 60}}>Week</th>
              <th>Focus</th>
              <th style={{width: 130}}>Intent (RPE)</th>
              <th style={{width: 150}}>Load %</th>
              <th style={{width: 80, textAlign: "right"}}>Value</th>
            </tr>
          </thead>
          <tbody>
            {b.weekConfig.map((w, i) => (
              <tr key={i}>
                <td className="num">Wk {w.week}</td>
                <td><TInput value={w.focus}/></td>
                <td><TInput value={w.intent}/></td>
                <td><div style={{height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden"}}><div style={{height: "100%", width: `${w.load}%`, background: w.load < 60 ? "var(--fg-dim)" : w.load < 95 ? "var(--acc-train)" : "var(--neg)"}}/></div></td>
                <td className="num" style={{textAlign: "right"}}>{w.load}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="eyebrow" style={{marginTop: 14, marginBottom: 6}}>Routines assigned to block</div>
      <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
        <Pill variant="acc">Push A · Heavy</Pill>
        <Pill variant="acc">Push B · Volume</Pill>
        <Pill variant="acc">Pull A · Heavy</Pill>
        <Pill variant="acc">Pull B · Volume</Pill>
        <Pill variant="acc">Legs A · Squat</Pill>
        <Pill variant="acc">Legs B · DL</Pill>
        <button className="pill" style={{cursor: "pointer", border: "1px dashed var(--border)"}}>+ Add routine</button>
      </div>
    </TModal>
  );
};

// ── ASSIGN WEEK MODAL ───────────────────────────────────────
const AssignWeekModal = ({ onClose }) => (
  <TModal title="Assign weekly plan" subtitle="Map routines to days · drag-drop in production" eyebrow="calendar" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Apply</button></>}>
    <TField label="Week of">
      <select style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
        <option>May 12–18 (current)</option><option>May 19–25</option><option>May 26–Jun 1</option>
      </select>
    </TField>
    <Card className="card-tight" style={{padding: 0}}>
      <table className="tbl">
        <thead><tr><th style={{width: 90}}>Day</th><th>Routine</th><th style={{width: 80}}>Status</th></tr></thead>
        <tbody>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
            <tr key={d}>
              <td>{d}</td>
              <td>
                <select style={{width: "100%", height: 26, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11}} defaultValue={["Pull A","Push A","Legs A","Rest","Push B","Pull B","Legs B"][i]}>
                  <option>Push A · Heavy</option><option>Push B · Volume</option><option>Pull A · Heavy</option><option>Pull B · Volume</option><option>Legs A · Squat</option><option>Legs B · DL</option><option>Mobility &amp; Core</option><option>Rest</option>
                </select>
              </td>
              <td>{["done","done","done","—","planned","planned","planned"][i] === "done" ? <Pill variant="pos">done</Pill> : ["done","done","done","—","planned","planned","planned"][i] === "planned" ? <Pill>planned</Pill> : <span className="dim">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </TModal>
);

// ── SUPERSET EDITOR ──────────────────────────────────────────
const SupersetEditorModal = ({ exercises, onClose }) => (
  <TModal title="Group as superset" subtitle="Back-to-back execution · single rest after final lift" eyebrow="layers" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Create superset</button></>}>
    <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.5}}>
      Select 2–4 exercises to perform back-to-back without rest. Use for antagonist pairing (push/pull) or time-efficiency (small lifts).
    </div>
    <TField label="Superset label"><TInput defaultValue="A"/></TField>
    <TField label="Rest after final exercise"><TInput defaultValue="90" suffix="sec"/></TField>
    <TField label="Exercises in this superset">
      <div className="col-gap" style={{gap: 4}}>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, display: "flex", alignItems: "center", gap: 8}}><input type="checkbox" defaultChecked/> Cable Fly · 3×12 @ 22kg</div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, display: "flex", alignItems: "center", gap: 8}}><input type="checkbox" defaultChecked/> Triceps Pushdown · 3×12 @ 38kg</div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, display: "flex", alignItems: "center", gap: 8}}><input type="checkbox"/> Lateral Raise · 3×15 @ 9kg</div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, display: "flex", alignItems: "center", gap: 8}}><input type="checkbox"/> Overhead Triceps · 3×10 @ 24kg</div>
      </div>
    </TField>
    <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5}}>
      Estimated time saved: <span className="num" style={{color: "var(--fg)"}}>~8 minutes</span> per workout.
    </div>
  </TModal>
);

// ── BODY-STATS CORRELATION (for History tab) ────────────────
window.TrainingBodyStatsCorrelation = () => {
  // Bench e1RM ↔ bodyweight ↔ bodyfat over 12 weeks
  const weeks = ["wk1","wk2","wk3","wk4","wk5","wk6","wk7","wk8","wk9","wk10","wk11","wk12"];
  const bench = [102, 105, 105, 107.5, 110, 112.5, 110, 115, 117.5, 117.5, 120, 122.5];
  const weight = [80.4, 80.5, 80.3, 80.1, 80.0, 79.9, 79.8, 79.7, 79.5, 79.5, 79.5, 79.4];
  const bf = [15.0, 14.9, 14.8, 14.6, 14.5, 14.3, 14.2, 14.0, 13.9, 13.8, 13.8, 13.8];
  return (
    <Card title="Body stats × strength" sub="12 weeks · correlation overlay">
      <LineChart h={180} range={[60, 130]}
        xLabels={weeks}
        series={[
          { data: bench, color: "var(--acc-train)" },
          { data: weight.map(w => w * 1.4), color: "var(--acc-goals)" },  // scaled for visual
          { data: bf.map(b => b * 6), color: "var(--acc-suppl)" },         // scaled for visual
        ]}/>
      <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span className="dot" style={{background: "var(--acc-train)"}}/>Bench e1RM (kg)</span>
        <span className="row-gap"><span className="dot" style={{background: "var(--acc-goals)"}}/>Bodyweight (scaled)</span>
        <span className="row-gap"><span className="dot" style={{background: "var(--acc-suppl)"}}/>Body fat % (scaled)</span>
      </div>
      <div className="divider"/>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 11.5}}>
        <Card className="card-tight" style={{padding: 10}}>
          <div className="eyebrow">Bench × weight</div>
          <div className="num" style={{fontSize: 14, color: "var(--pos)"}}>+20kg / −1.0kg</div>
          <div className="dim" style={{fontSize: 10}}>relative strength +13%</div>
        </Card>
        <Card className="card-tight" style={{padding: 10}}>
          <div className="eyebrow">Bench × bodyfat</div>
          <div className="num" style={{fontSize: 14, color: "var(--pos)"}}>+20kg / −1.2%</div>
          <div className="dim" style={{fontSize: 10}}>recomposition confirmed</div>
        </Card>
        <Card className="card-tight" style={{padding: 10}}>
          <div className="eyebrow">Coef. of determination</div>
          <div className="num" style={{fontSize: 14}}>R² = 0.91</div>
          <div className="dim" style={{fontSize: 10}}>strong linear trend</div>
        </Card>
      </div>
    </Card>
  );
};

Object.assign(window, {
  TrainCtx,
  RoutineEditorModal, ExerciseDetailModal, CustomExerciseModal,
  BlockEditorModal, AssignWeekModal, SupersetEditorModal,
});
