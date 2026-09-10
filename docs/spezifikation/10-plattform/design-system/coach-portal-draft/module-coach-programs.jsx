// Coach Portal · Program Builder with auto-delivery
// Ref: HumanCoach SPEC_05 §4 (auto-delivery), SPEC_01 §4 (assignment = proposal)

const PROGRAMS = [
  {
    id: "PG-04", name: "12-Week Powerbuilding", category: "Training", weeks: 12,
    assigned: 6, delivered: "rolling", created: "2026-01-08", rating: 4.9,
    blocks: [
      { n: 1, weeks: "1–4",  name: "Block 1 · Hypertrophy",  focus: "High volume, RPE 7–8",      color: "var(--acc-train)" },
      { n: 2, weeks: "5–8",  name: "Block 2 · Strength",      focus: "Lower volume, RPE 8–9",     color: "var(--acc-coach)" },
      { n: 3, weeks: "9–12", name: "Block 3 · Peaking",       focus: "Singles and doubles, taper", color: "var(--acc-buddy)" },
    ],
  },
  { id: "PG-03", name: "Beginner Linear · 12 weeks", category: "Training",  weeks: 12, assigned: 5, delivered: "rolling", created: "2025-11-02", rating: 4.6, blocks: [] },
  { id: "PG-02", name: "Cut · 8-week meal plan",      category: "Nutrition", weeks: 8,  assigned: 3, delivered: "weekly",  created: "2026-02-14", rating: 4.8, blocks: [] },
  { id: "PG-01", name: "Contest Prep · 16 weeks",     category: "Combined",  weeks: 16, assigned: 2, delivered: "rolling", created: "2025-09-20", rating: 5.0, blocks: [] },
];

const DELIVERY_MODES = [
  { id: "immediate", label: "All at once",  desc: "Every week unlocked on assignment. Client can read ahead." },
  { id: "rolling",   label: "Rolling +7 d", desc: "Week 1 on assign, each following week seven days later." },
  { id: "weekly",    label: "Fixed weekday",desc: "New week unlocks every Monday regardless of assignment date." },
  { id: "manual",    label: "Manual",        desc: "You release each week yourself." },
];

// One assignment, mid-flight
const ASSIGNMENT = {
  program: "12-Week Powerbuilding", athlete: "Lukas Bauer", assigned: "2026-04-06",
  mode: "rolling", currentWeek: 6, weeks: 12,
  autoMessage: true,
  messageTemplate: "New week unlocked — focus: {block_name}. {week_note}",
  schedule: Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    const d = new Date(2026, 3, 6 + i * 7);
    const date = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      week: w, date,
      block: w <= 4 ? 1 : w <= 8 ? 2 : 3,
      status: w < 6 ? "delivered" : w === 6 ? "active" : "scheduled",
      completion: w < 6 ? [100, 100, 92, 100, 88][w - 1] : null,
    };
  }),
};

const DELIVERY_LOG = [
  { at: "2026-05-11 06:00", week: 6, athlete: "Lukas Bauer",  event: "week_unlocked", note: "Block 2 · Strength — auto-message sent" },
  { at: "2026-05-11 06:00", week: 4, athlete: "Marcus Weber", event: "week_unlocked", note: "Block 1 · Hypertrophy" },
  { at: "2026-05-04 06:00", week: 5, athlete: "Lukas Bauer",  event: "week_unlocked", note: "Block 2 begins — coach note attached" },
  { at: "2026-05-02 14:22", week: 4, athlete: "Sophie Klein", event: "paused",        note: "Coach paused delivery — recovery critical" },
  { at: "2026-04-27 06:00", week: 4, athlete: "Lukas Bauer",  event: "week_unlocked", note: "Block 1 final week" },
  { at: "2026-04-06 09:14", week: 1, athlete: "Lukas Bauer",  event: "assigned",      note: "Proposal accepted by client" },
];

const STATUS_STYLE = {
  delivered: { color: "var(--pos)",     label: "delivered" },
  active:    { color: "var(--acc-coach)", label: "active" },
  scheduled: { color: "var(--fg-dim)",  label: "scheduled" },
  paused:    { color: "var(--warn)",    label: "paused" },
};

window.PortalPrograms = () => {
  const [sel, setSel] = useState(PROGRAMS[0]);
  const [mode, setMode] = useState(ASSIGNMENT.mode);
  const a = ASSIGNMENT;

  return (
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="calendar" className="ic" style={{color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Build once, deliver on a schedule</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            A multi-week program unlocks week by week on its own. You only step in when the client asks something,
            an alert fires, or a check-in shows a problem. Assignment still arrives as a proposal the client accepts.
          </div>
        </div>
        <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>New program</button>
      </div>

      <div className="grid" style={{gridTemplateColumns: "300px 1fr", gap: 14}}>
        {/* Library */}
        <Card title="Programs" sub={`${PROGRAMS.length} · ${PROGRAMS.reduce((s, p) => s + p.assigned, 0)} active assignments`} className="card-tight" style={{padding: 0}}>
          <div className="col-gap" style={{gap: 0}}>
            {PROGRAMS.map(p => (
              <div key={p.id} onClick={() => setSel(p)} style={{
                padding: 12, borderBottom: "1px solid var(--border)", cursor: "pointer",
                background: sel.id === p.id ? "color-mix(in srgb, var(--acc-coach) 7%, transparent)" : "transparent",
              }}>
                <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 4}}>
                  <span style={{fontSize: 12.5, fontWeight: sel.id === p.id ? 600 : 500}}>{p.name}</span>
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 9.5}}>{p.rating} ★</span>
                </div>
                <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                  <Pill style={{fontSize: 9.5}}>{p.category}</Pill>
                  <Pill style={{fontSize: 9.5}}>{p.weeks} wk</Pill>
                  <Pill style={{fontSize: 9.5}}>{p.assigned} assigned</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Selected program */}
        <div className="col-gap" style={{gap: 14}}>
          <Card title={sel.name} sub={`${sel.weeks} weeks · created ${sel.created} · ${sel.assigned} athletes on it`}
            actions={<><button className="btn btn-ghost btn-sm"><Icon name="copy" className="ic ic-sm"/>Duplicate</button><button className="btn btn-sm"><Icon name="edit" className="ic ic-sm"/>Edit blocks</button></>}>
            {sel.blocks.length > 0 ? (
              <>
                <div style={{display: "flex", gap: 4, marginBottom: 12}}>
                  {sel.blocks.map(b => (
                    <div key={b.n} style={{flex: 1, padding: 12, background: `color-mix(in srgb, ${b.color} 8%, var(--surface))`, border: `1px solid color-mix(in srgb, ${b.color} 28%, var(--border))`, borderRadius: 6}}>
                      <div className="mono" style={{fontSize: 9.5, color: b.color, marginBottom: 3}}>WEEKS {b.weeks}</div>
                      <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 3}}>{b.name}</div>
                      <div className="muted" style={{fontSize: 11}}>{b.focus}</div>
                    </div>
                  ))}
                </div>
                <div className="dim" style={{fontSize: 11}}>Each block carries its own routines, volume targets and RPE guidance.</div>
              </>
            ) : (
              <div className="dim" style={{fontSize: 12, padding: 16, textAlign: "center"}}>Block structure not expanded for this program.</div>
            )}
          </Card>

          {/* Delivery mode */}
          <Card title="Delivery" sub="how weeks unlock for the client">
            <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12}}>
              {DELIVERY_MODES.map(m => (
                <div key={m.id} onClick={() => setMode(m.id)} style={{
                  padding: 11, borderRadius: 6, cursor: "pointer",
                  background: mode === m.id ? "color-mix(in srgb, var(--acc-coach) 10%, var(--surface))" : "var(--surface)",
                  border: `1px solid ${mode === m.id ? "color-mix(in srgb, var(--acc-coach) 35%, var(--border))" : "var(--border)"}`,
                }}>
                  <div style={{fontSize: 12, fontWeight: 600, marginBottom: 3, color: mode === m.id ? "var(--acc-coach)" : "var(--fg)"}}>{m.label}</div>
                  <div className="muted" style={{fontSize: 10.5, lineHeight: 1.45}}>{m.desc}</div>
                </div>
              ))}
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div style={{width: 32, height: 18, borderRadius: 999, padding: 2, background: a.autoMessage ? "var(--acc-coach)" : "var(--surface-2)", flexShrink: 0}}>
                <div style={{width: 14, height: 14, borderRadius: 999, background: "var(--bg)", marginLeft: a.autoMessage ? 14 : 0}}/>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12, fontWeight: 500, marginBottom: 2}}>Auto-message on unlock</div>
                <div className="mono dim" style={{fontSize: 10.5}}>{a.messageTemplate}</div>
              </div>
            </div>
          </Card>

          {/* Live assignment */}
          <Card title="Live assignment" sub={`${a.athlete} · assigned ${a.assigned} · week ${a.currentWeek} of ${a.weeks}`}
            actions={<><button className="btn btn-ghost btn-sm">Pause delivery</button><button className="btn btn-sm">Release next early</button></>}>
            <div style={{display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3, marginBottom: 10}}>
              {a.schedule.map(w => {
                const st = STATUS_STYLE[w.status];
                const blk = sel.blocks.find(b => b.n === w.block);
                return (
                  <div key={w.week} title={`Week ${w.week} · ${w.date} · ${st.label}`} style={{
                    padding: "8px 4px", borderRadius: 5, textAlign: "center",
                    background: w.status === "scheduled" ? "var(--surface-2)" : `color-mix(in srgb, ${st.color} 14%, var(--surface))`,
                    border: `1px solid ${w.status === "active" ? st.color : `color-mix(in srgb, ${st.color} 22%, var(--border))`}`,
                  }}>
                    <div className="num" style={{fontSize: 11, fontWeight: 600, color: w.status === "scheduled" ? "var(--fg-dim)" : st.color}}>{w.week}</div>
                    <div className="dim mono" style={{fontSize: 8.5, marginTop: 2}}>{w.date}</div>
                    {w.completion != null && <div className="num" style={{fontSize: 8.5, marginTop: 3, color: w.completion >= 95 ? "var(--pos)" : "var(--warn)"}}>{w.completion}%</div>}
                    {blk && <div style={{height: 2, background: blk.color, borderRadius: 1, marginTop: 4, opacity: w.status === "scheduled" ? 0.3 : 0.8}}/>}
                  </div>
                );
              })}
            </div>
            <div style={{display: "flex", gap: 14, fontSize: 10.5, color: "var(--fg-muted)", flexWrap: "wrap"}}>
              {Object.entries(STATUS_STYLE).filter(([k]) => k !== "paused").map(([k, v]) => (
                <span key={k} style={{display: "inline-flex", alignItems: "center", gap: 5}}>
                  <span style={{width: 8, height: 8, borderRadius: 2, background: v.color, opacity: k === "scheduled" ? 0.4 : 1}}/>{v.label}
                </span>
              ))}
              <span style={{marginLeft: "auto"}} className="mono">next unlock · 18.05 06:00</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Delivery log */}
      <Card title="Delivery log" sub="across all assignments">
        <table className="tbl">
          <thead><tr><th style={{width: 150}}>When</th><th style={{width: 60}}>Week</th><th style={{width: 160}}>Athlete</th><th style={{width: 130}}>Event</th><th>Note</th></tr></thead>
          <tbody>
            {DELIVERY_LOG.map((l, i) => (
              <tr key={i}>
                <td className="num muted" style={{fontSize: 11}}>{l.at}</td>
                <td className="num">{l.week}</td>
                <td>{l.athlete}</td>
                <td><Pill variant={l.event === "paused" ? "warn" : l.event === "assigned" ? "acc" : "pos"}>{l.event}</Pill></td>
                <td className="muted" style={{fontSize: 11.5}}>{l.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

Object.assign(window, { PROGRAMS, DELIVERY_MODES, ASSIGNMENT });
