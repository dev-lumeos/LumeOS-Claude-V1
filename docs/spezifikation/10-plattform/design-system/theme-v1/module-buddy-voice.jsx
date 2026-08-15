// AI Coach · Voice / Live Workout state machine
// Ref: Buddy SPEC_03 Flow 3, SPEC_04 F6 (parseGymCommand, WorkoutSessionState)

const SESSION_PHASES = [
  { id: "IDLE",             label: "Idle",             desc: "Waiting for the hotword or a tap" },
  { id: "SESSION_START",    label: "Session start",     desc: "Routine loaded · energy check 1–5" },
  { id: "EXERCISE_INTRO",   label: "Exercise intro",    desc: "Names the lift and last week's numbers" },
  { id: "SET_ACTIVE",       label: "Set active",        desc: "Silent — cues only on the last two reps" },
  { id: "SET_COMPLETE",     label: "Set complete",      desc: "Asks weight, then reps, then logs" },
  { id: "REST",             label: "Rest",              desc: "Timer running · accepts extend / skip" },
  { id: "SESSION_COMPLETE", label: "Session complete",  desc: "Volume, PRs, duration" },
  { id: "SUMMARY",          label: "Summary",           desc: "Written back to Training · rating asked" },
];

// Pattern matching — no LLM in the gym (F6)
const GYM_COMMANDS = [
  { intent: "set_complete",  pattern: "^(fertig|done|set|gemacht)$",                       ex: "fertig",        emits: "SET_COMPLETE" },
  { intent: "log_weight",    pattern: "^(\\d+(?:\\.\\d+)?)\\s*(kilo|kg|pfund|pounds?)$",   ex: "117,5 kilo",    emits: "weight = 117.5" },
  { intent: "log_reps",      pattern: "^(\\d+)\\s*(reps?|wiederholungen?|mal)$",           ex: "elf reps",      emits: "reps = 11" },
  { intent: "log_rpe",       pattern: "^rpe\\s*([1-9]|10)$",                                ex: "rpe 8",         emits: "rpe = 8" },
  { intent: "log_rpe",       pattern: "^war\\s*(sehr\\s*)?(schwer|hart)$",                  ex: "war schwer",    emits: "rpe = 9" },
  { intent: "log_rpe",       pattern: "^war\\s*(leicht|easy)$",                             ex: "war leicht",    emits: "rpe = 5" },
  { intent: "next_exercise", pattern: "^(n\u00e4chste?|next|weiter|skip)$",                 ex: "weiter",        emits: "EXERCISE_INTRO" },
  { intent: "pause_session", pattern: "^(pause|stop|halt)$",                                ex: "pause",         emits: "paused" },
  { intent: "extend_rest",   pattern: "^(mehr\\s*zeit|more\\s*time|\\+\\d+)$",              ex: "mehr zeit",     emits: "rest + 30 s" },
];

const SESSION_SCRIPT = [
  { phase: "SESSION_START",    who: "buddy", text: "Pull Day, five exercises. Last week you hit 85 % of the target reps. Today we aim for 90. Energy check — one to five?" },
  { phase: "SESSION_START",    who: "tom",   text: "four" },
  { phase: "SESSION_START",    who: "buddy", text: "Four out of five — full plan. Let's go." },
  { phase: "EXERCISE_INTRO",   who: "buddy", text: "First up: pull-ups. Last week four sets — ten, nine, eight, seven. Today keep every set above eight." },
  { phase: "SET_ACTIVE",       who: "sys",   text: "[silence during the set]" },
  { phase: "SET_ACTIVE",       who: "buddy", text: "Two more! Come on! And again — strong!" },
  { phase: "SET_COMPLETE",     who: "tom",   text: "fertig" },
  { phase: "SET_COMPLETE",     who: "buddy", text: "Weight?" },
  { phase: "SET_COMPLETE",     who: "tom",   text: "bodyweight" },
  { phase: "SET_COMPLETE",     who: "buddy", text: "Reps?" },
  { phase: "SET_COMPLETE",     who: "tom",   text: "eleven" },
  { phase: "SET_COMPLETE",     who: "buddy", text: "Eleven reps — that's a PR. Logged. Ninety seconds." },
  { phase: "REST",             who: "sys",   text: "[timer 01:30 · say 'mehr zeit' for +30 s]" },
  { phase: "SESSION_COMPLETE", who: "buddy", text: "Session done. Forty-two minutes, twenty sets, two PRs. Total volume 9,840 kg — eight per cent above last week." },
  { phase: "SUMMARY",          who: "buddy", text: "How was it?" },
];

const SESSION_STATE = {
  sessionId: "WS-2026-05-16-01", routine: "Pull Day", exercise: 1, exercises: 5,
  set: 2, sets: 4, energy: 4, restSeconds: 90, elapsed: "04:18",
  history: [
    { ex: "Pull-up",        set: 1, weight: "BW",      reps: 11, rpe: 8, pr: true },
    { ex: "Pull-up",        set: 2, weight: "BW",      reps: 10, rpe: 8, pr: false },
    { ex: "Barbell Row",    set: 1, weight: "82.5 kg", reps: 8,  rpe: 7, pr: false },
  ],
};

const OFFLINE_QUEUE = [
  { at: "18:42:11", op: "log_set",     payload: "Pull-up · BW × 11 · RPE 8", synced: false },
  { at: "18:44:02", op: "log_set",     payload: "Pull-up · BW × 10 · RPE 8", synced: false },
  { at: "18:48:30", op: "log_set",     payload: "Row · 82.5 × 8 · RPE 7",    synced: false },
  { at: "18:39:00", op: "session_start", payload: "Pull Day · energy 4",     synced: true  },
];

window.BuddyVoice = () => {
  const [phase, setPhase] = useState("SET_COMPLETE");
  const [test, setTest] = useState("");
  const match = GYM_COMMANDS.find(c => new RegExp(c.pattern, "i").test(test.trim().toLowerCase()));
  const idx = SESSION_PHASES.findIndex(p => p.id === phase);

  return (
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="training" className="ic" style={{color: "var(--acc-buddy)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Voice in the gym</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            No language model runs during a session — gym commands are matched against fixed patterns on device, so logging a set
            works with the phone in your pocket and no signal. Speech-to-text is Whisper.cpp, local.
          </div>
        </div>
        <Pill variant="acc">Pro tier</Pill>
      </div>

      {/* State machine */}
      <Card title="Session state machine" sub="click a phase to inspect it">
        <div style={{display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 12}}>
          {SESSION_PHASES.map((p, i) => (
            <React.Fragment key={p.id}>
              <button onClick={() => setPhase(p.id)} style={{
                flexShrink: 0, padding: "9px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left", minWidth: 128,
                background: phase === p.id ? "color-mix(in srgb, var(--acc-buddy) 14%, var(--surface))" : "var(--surface)",
                border: `1px solid ${phase === p.id ? "color-mix(in srgb, var(--acc-buddy) 40%, var(--border))" : "var(--border)"}`,
              }}>
                <div className="mono" style={{fontSize: 9.5, color: "var(--fg-dim)", marginBottom: 3}}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{fontSize: 11.5, fontWeight: 600, color: phase === p.id ? "var(--acc-buddy)" : "var(--fg)"}}>{p.label}</div>
              </button>
              {i < SESSION_PHASES.length - 1 && <div style={{alignSelf: "center", color: "var(--fg-dim)", fontSize: 11}}>→</div>}
            </React.Fragment>
          ))}
        </div>
        <div style={{padding: 12, background: "var(--surface-2)", borderRadius: 6}}>
          <div className="mono" style={{fontSize: 10.5, color: "var(--acc-buddy)", marginBottom: 4}}>{phase}</div>
          <div style={{fontSize: 12.5}}>{SESSION_PHASES[idx].desc}</div>
        </div>
      </Card>

      <div className="grid" style={{gridTemplateColumns: "1.3fr 1fr", gap: 14}}>
        {/* Transcript */}
        <Card title="Session transcript" sub={`${SESSION_STATE.routine} · exercise ${SESSION_STATE.exercise} of ${SESSION_STATE.exercises} · ${SESSION_STATE.elapsed}`}>
          <div className="col-gap" style={{gap: 6}}>
            {SESSION_SCRIPT.map((l, i) => {
              const isPhase = l.phase === phase;
              if (l.who === "sys") return (
                <div key={i} className="dim" style={{fontSize: 11, fontStyle: "italic", padding: "4px 10px", opacity: isPhase ? 1 : 0.45}}>{l.text}</div>
              );
              return (
                <div key={i} style={{display: "flex", justifyContent: l.who === "tom" ? "flex-end" : "flex-start", opacity: isPhase ? 1 : 0.45}}>
                  <div style={{
                    maxWidth: "78%", padding: "8px 12px", borderRadius: 9, fontSize: 12.5, lineHeight: 1.5,
                    background: l.who === "tom" ? "color-mix(in srgb, var(--acc-buddy) 16%, var(--surface))" : "var(--surface)",
                    border: "1px solid var(--border)",
                  }}>
                    <div className="dim mono" style={{fontSize: 9, marginBottom: 2}}>{l.who === "tom" ? "Tom" : "Buddy"} · {l.phase}</div>
                    {l.text}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="col-gap" style={{gap: 14}}>
          {/* Live state */}
          <Card title="Live state" sub="WorkoutSessionState">
            <Row label="Session" value={SESSION_STATE.sessionId}/>
            <Row label="Phase" value={phase}/>
            <Row label="Exercise" value={`${SESSION_STATE.exercise} / ${SESSION_STATE.exercises}`}/>
            <Row label="Set" value={`${SESSION_STATE.set} / ${SESSION_STATE.sets}`}/>
            <Row label="Energy check" value={`${SESSION_STATE.energy} / 5`}/>
            <Row label="Rest target" value={`${SESSION_STATE.restSeconds} s`}/>
            <div className="divider"/>
            <div className="eyebrow" style={{marginBottom: 6}}>Logged this session</div>
            <table className="tbl">
              <tbody>
                {SESSION_STATE.history.map((h, i) => (
                  <tr key={i}>
                    <td style={{fontSize: 11.5}}>{h.ex}</td>
                    <td className="num muted" style={{fontSize: 11}}>set {h.set}</td>
                    <td className="num" style={{fontSize: 11}}>{h.weight} × {h.reps}</td>
                    <td className="num muted" style={{fontSize: 11}}>RPE {h.rpe}</td>
                    <td>{h.pr && <Pill variant="pos" style={{fontSize: 9}}>PR</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Offline queue */}
          <Card title="Offline queue" sub={`${OFFLINE_QUEUE.filter(o => !o.synced).length} pending · IndexedDB`}>
            <div className="col-gap" style={{gap: 4}}>
              {OFFLINE_QUEUE.map((o, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11}}>
                  <span style={{width: 6, height: 6, borderRadius: 999, background: o.synced ? "var(--pos)" : "var(--warn)"}}/>
                  <span className="num dim" style={{fontSize: 10, width: 58}}>{o.at}</span>
                  <span className="mono" style={{fontSize: 10, width: 92, color: "var(--fg-muted)"}}>{o.op}</span>
                  <span className="muted" style={{flex: 1, fontSize: 11}}>{o.payload}</span>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div className="muted" style={{fontSize: 11, lineHeight: 1.5}}>
              Sets are written locally first and pushed when the connection returns. The session never waits for the network.
            </div>
          </Card>
        </div>
      </div>

      {/* Command parser */}
      <Card title="Command parser" sub="regex on device · type something to test it">
        <input value={test} onChange={e => setTest(e.target.value)} placeholder='try "fertig", "117,5 kilo", "elf reps", "war schwer", "mehr zeit"'
          style={{width: "100%", height: 34, background: "var(--surface)", border: `1px solid ${test ? (match ? "color-mix(in srgb, var(--pos) 40%, var(--border))" : "color-mix(in srgb, var(--neg) 40%, var(--border))") : "var(--border)"}`, borderRadius: 7, padding: "0 12px", fontSize: 13, fontFamily: "var(--font-mono)", marginBottom: 10}}/>
        {test && (
          <div style={{padding: 10, background: match ? "color-mix(in srgb, var(--pos) 6%, var(--surface))" : "color-mix(in srgb, var(--neg) 6%, var(--surface))", border: `1px solid ${match ? "color-mix(in srgb, var(--pos) 25%, var(--border))" : "color-mix(in srgb, var(--neg) 25%, var(--border))"}`, borderRadius: 6, marginBottom: 12, fontSize: 12}}>
            {match
              ? <><span className="mono" style={{color: "var(--pos)"}}>{match.intent}</span> <span className="dim">→</span> <span className="mono">{match.emits}</span></>
              : <span style={{color: "var(--neg)"}}>No pattern matched — Buddy would ask you to repeat.</span>}
          </div>
        )}
        <table className="tbl">
          <thead><tr><th style={{width: 130}}>Intent</th><th>Pattern</th><th style={{width: 130}}>Example</th><th style={{width: 150}}>Emits</th></tr></thead>
          <tbody>
            {GYM_COMMANDS.map((c, i) => (
              <tr key={i} style={match === c ? {background: "color-mix(in srgb, var(--pos) 7%, transparent)"} : undefined}>
                <td className="mono" style={{fontSize: 11, color: "var(--acc-buddy)"}}>{c.intent}</td>
                <td className="mono muted" style={{fontSize: 10}}>{c.pattern}</td>
                <td className="muted" style={{fontSize: 11, fontStyle: "italic"}}>&ldquo;{c.ex}&rdquo;</td>
                <td className="mono" style={{fontSize: 10.5}}>{c.emits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

Object.assign(window, { SESSION_PHASES, GYM_COMMANDS, SESSION_STATE });
