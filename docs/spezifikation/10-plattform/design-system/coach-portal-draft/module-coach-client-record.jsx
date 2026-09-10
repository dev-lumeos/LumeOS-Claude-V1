// Coach Portal — full client record, all modules, when the client has granted full access

const FCR_CLIENT = {
  name: "Lukas Bauer", av: "LB", age: 31, sex: "male", height: 182,
  since: "Mar 2024", tier: "Elite", access: "full", granted: "8 Mar 2024",
  goal: "Contest prep · classic physique · 20 Sep",
  phase: "contest_prep · week 18 of 20",
  coaches: ["Anders Lindqvist · training", "Jana Bauer · nutrition", "Dr. Kessler · medical"],
};

const FCR_MODULES = [
  { id: "training",    label: "Training",    access: "full",    color: "var(--acc-train)" },
  { id: "nutrition",   label: "Nutrition",   access: "full",    color: "var(--acc-nutri)" },
  { id: "recovery",    label: "Recovery",    access: "full",    color: "var(--acc-recov)" },
  { id: "supplements", label: "Supplements", access: "full",    color: "var(--acc-suppl)" },
  { id: "goals",       label: "Goals & body",access: "full",    color: "var(--acc-goals)" },
  { id: "medical",     label: "Medical",     access: "summary", color: "var(--acc-medic)" },
];

const FCR_TRAINING = {
  kpis: [["Sessions · 7d", "6 of 6"], ["Volume · week", "34.2 t"], ["Avg RPE", "8.4"], ["Streak", "126 days"]],
  sessions: [
    { d: "today 06:40",  name: "Push · depletion", sets: 24, vol: "6.8 t", rpe: 8.1, note: "Flat but moved well" },
    { d: "yesterday",    name: "Pull · depletion", sets: 22, vol: "7.4 t", rpe: 8.6, note: "Last two sets grindy" },
    { d: "Sat 07:12",    name: "Legs",             sets: 20, vol: "9.1 t", rpe: 9.0, note: "Called it after set 18" },
    { d: "Fri 06:55",    name: "Upper",            sets: 24, vol: "6.2 t", rpe: 8.2, note: "" },
  ],
  lifts: [
    { l: "Bench press",  cur: "132.5 kg", peak: "137.5 kg", delta: "−3.6 %", ok: true },
    { l: "Squat",        cur: "182.5 kg", peak: "190 kg",   delta: "−3.9 %", ok: true },
    { l: "Deadlift",     cur: "212.5 kg", peak: "222.5 kg", delta: "−4.5 %", ok: true },
    { l: "Overhead press", cur: "72.5 kg", peak: "80 kg",   delta: "−9.4 %", ok: false },
  ],
};

const FCR_NUTRITION = {
  kpis: [["Calories today", "2,180"], ["Protein", "218 g"], ["Adherence · 7d", "97 %"], ["Water", "4.2 L"]],
  macros: [["Protein", 218, 220, "var(--acc-train)"], ["Carbs", 180, 190, "var(--acc-nutri)"], ["Fat", 52, 55, "var(--acc-goals)"]],
  week: [
    { d: "Mon", kcal: 2180, p: 220, logged: true }, { d: "Tue", kcal: 2210, p: 218, logged: true },
    { d: "Wed", kcal: 2160, p: 222, logged: true }, { d: "Thu", kcal: 2190, p: 216, logged: true },
    { d: "Fri", kcal: 2240, p: 219, logged: true }, { d: "Sat", kcal: 2380, p: 208, logged: true },
    { d: "Sun", kcal: 2180, p: 218, logged: true },
  ],
  gaps: [["Vitamin D", 62], ["Omega-3", 71], ["Magnesium", 84]],
};

const FCR_RECOVERY = {
  kpis: [["Recovery score", "58"], ["Sleep · 7d avg", "6.4 h"], ["HRV", "48 ms"], ["Resting HR", "54"]],
  sleep: [7.1, 6.8, 6.2, 6.0, 6.4, 5.9, 6.4],
  hrv: [58, 56, 52, 50, 49, 47, 48],
  flags: [
    { t: "Sleep below target seven nights running", sev: "warn" },
    { t: "HRV down 17 % from the block baseline", sev: "warn" },
    { t: "Resting HR up 4 bpm over two weeks", sev: "info" },
  ],
};

const FCR_SUPPS = [
  { n: "Creatine mono",     dose: "5 g",      when: "morning",     adherence: 100, days: 126 },
  { n: "Vitamin D3",        dose: "4000 IU",  when: "morning",     adherence: 98,  days: 126 },
  { n: "Omega-3",           dose: "2 g EPA",  when: "with meals",  adherence: 94,  days: 126 },
  { n: "Magnesium glycinate",dose: "400 mg",  when: "evening",     adherence: 96,  days: 84 },
  { n: "Caffeine",          dose: "200 mg",   when: "pre-training",adherence: 100, days: 126 },
  { n: "Electrolytes",      dose: "1 sachet", when: "peri-workout",adherence: 89,  days: 42 },
];

const FCR_BODY = {
  kpis: [["Weight", "81.4 kg"], ["Body fat", "6.8 %"], ["Lean mass", "75.9 kg"], ["Weekly change", "−0.4 kg"]],
  weight: [88.2, 87.4, 86.5, 85.8, 85.0, 84.3, 83.6, 83.0, 82.4, 82.0, 81.7, 81.4],
  measures: [["Chest", "112 cm", "−2 cm"], ["Waist", "74 cm", "−9 cm"], ["Arm", "41 cm", "−1.5 cm"], ["Thigh", "62 cm", "−3 cm"]],
};

const FCR_MEDICAL = {
  note: "Summary access only. Full records, lab values and medication detail stay with Dr. Kessler unless Lukas grants more.",
  visible: [
    ["Clearance status", "cleared for competition prep · reviewed 2 Sep"],
    ["Active flags", "none"],
    ["Medication interactions", "none reported"],
    ["Last physician contact", "2 Sep 2026"],
  ],
  hidden: ["Lab panels", "Diagnoses", "Prescriptions", "Consultation notes"],
};

const FCR_TIMELINE = [
  { at: "today 06:40",   m: "training",  t: "Push depletion logged · 24 sets, RPE 8.1" },
  { at: "today 06:12",   m: "recovery",  t: "Check-in: energy 5, soreness 6, sleep 6.4 h" },
  { at: "today 05:58",   m: "goals",     t: "Weight logged · 81.4 kg" },
  { at: "yesterday 21:30", m: "supplements", t: "Evening stack taken" },
  { at: "yesterday 19:14", m: "nutrition", t: "Dinner logged · 620 kcal, 58 g protein" },
  { at: "yesterday 18:02", m: "training", t: "Pull depletion logged · 22 sets, RPE 8.6" },
  { at: "2 days ago",    m: "medical",   t: "Physician clearance confirmed" },
];

window.FullClientRecord = () => {
  const [mod, setMod] = useState("overview");
  const mc = Object.fromEntries(FCR_MODULES.map(m => [m.id, m.color]));

  return (
    <div className="col-gap" style={{ gap: 14 }}>
      {/* Header */}
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 15 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{FCR_CLIENT.av}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15.5, fontWeight: 600 }}>{FCR_CLIENT.name}</span>
              <Pill variant="pos" dot>full access granted</Pill>
              <Pill>{FCR_CLIENT.tier}</Pill>
              <span className="dim mono" style={{ fontSize: 10 }}>since {FCR_CLIENT.since}</span>
            </div>
            <div className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 7 }}>
              {FCR_CLIENT.goal} · {FCR_CLIENT.phase} · {FCR_CLIENT.age}, {FCR_CLIENT.height} cm
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {FCR_CLIENT.coaches.map(c => <Pill key={c} style={{ fontSize: 9.5 }}>{c}</Pill>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-sm"><Icon name="message" className="ic ic-sm" />Message</button>
            <button className="btn btn-sm"><Icon name="edit" className="ic ic-sm" />Add note</button>
            <button className="btn btn-primary btn-sm">Open review</button>
          </div>
        </div>
        <div className="divider" />
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          <span className="eyebrow" style={{ marginRight: 3 }}>Access</span>
          {FCR_MODULES.map(m => (
            <Pill key={m.id} style={{
              color: m.access === "full" ? m.color : "var(--fg-dim)",
              borderColor: m.access === "full" ? `color-mix(in srgb, ${m.color} 30%, var(--border))` : "var(--border)",
            }}>{m.label} · {m.access}</Pill>
          ))}
          <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>granted {FCR_CLIENT.granted} · revocable any time</span>
        </div>
      </Card>

      {/* Module switcher */}
      <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1, flexWrap: "wrap" }}>
        {[["overview","Overview"],["training","Training"],["nutrition","Nutrition"],["recovery","Recovery"],["supplements","Supplements"],["body","Body"],["medical","Medical"],["timeline","Timeline"]].map(([k, l]) => (
          <button key={k} onClick={() => setMod(k)} className={mod === k ? "btn btn-primary" : "btn btn-ghost"} style={{ height: 24, fontSize: 11, padding: "0 11px", borderRadius: 5 }}>{l}</button>
        ))}
      </div>

      {mod === "overview" && (
        <div className="grid g-cols-3" style={{ gap: 12 }}>
          {[
            { t: "Training", c: mc.training, rows: FCR_TRAINING.kpis, foot: "6 of 6 sessions. Strength holding within 5 % of peak on three of four lifts." },
            { t: "Nutrition", c: mc.nutrition, rows: FCR_NUTRITION.kpis, foot: "97 % adherence over seven days. Saturday ran 200 kcal over, deliberate." },
            { t: "Recovery", c: mc.recovery, rows: FCR_RECOVERY.kpis, foot: "The problem area. Sleep under target all week, HRV down 17 % from baseline." },
            { t: "Body", c: mc.goals, rows: FCR_BODY.kpis, foot: "0.4 kg per week, in the target band for the final phase." },
            { t: "Supplements", c: mc.supplements, rows: [["Stack size", "6 items"], ["Adherence · 30d", "96 %"], ["Longest streak", "126 days"], ["Interactions", "none"]], foot: "Electrolytes at 89 % is the only gap, and only on rest days." },
            { t: "Medical", c: mc.medical, rows: [["Access", "summary only"], ["Clearance", "cleared"], ["Active flags", "none"], ["Last contact", "2 Sep"]], foot: "Detail stays with Dr. Kessler. You see status, not records." },
          ].map(b => (
            <Card key={b.t} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: b.c }} />
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>{b.t}</div>
              <div className="col-gap" style={{ gap: 0, marginBottom: 10 }}>
                {b.rows.map(([l, v]) => <Row key={l} label={l} value={v} />)}
              </div>
              <div className="muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{b.foot}</div>
            </Card>
          ))}
        </div>
      )}

      {mod === "training" && (
        <div className="col-gap" style={{ gap: 12 }}>
          <div className="grid g-cols-4" style={{ gap: 10 }}>
            {FCR_TRAINING.kpis.map(([l, v]) => (
              <Card key={l} className="card-tight" style={{ padding: 13 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
              </Card>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
            <Card title="Recent sessions">
              <table className="tbl">
                <thead><tr><th style={{ width: 110 }}>When</th><th>Session</th><th style={{ width: 55, textAlign: "right" }}>Sets</th><th style={{ width: 70, textAlign: "right" }}>Volume</th><th style={{ width: 55, textAlign: "right" }}>RPE</th><th>Note</th></tr></thead>
                <tbody>
                  {FCR_TRAINING.sessions.map((s, i) => (
                    <tr key={i}>
                      <td className="num muted" style={{ fontSize: 11 }}>{s.d}</td>
                      <td style={{ fontSize: 11.5 }}>{s.name}</td>
                      <td className="num" style={{ textAlign: "right" }}>{s.sets}</td>
                      <td className="num" style={{ textAlign: "right" }}>{s.vol}</td>
                      <td className="num" style={{ textAlign: "right", color: s.rpe >= 8.8 ? "var(--warn)" : "var(--fg)" }}>{s.rpe}</td>
                      <td className="dim" style={{ fontSize: 11 }}>{s.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card title="Strength retention" sub="against block peak">
              {FCR_TRAINING.lifts.map(l => (
                <div key={l.l} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5 }}>{l.l}</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: 11.5 }}>{l.cur}</span>
                    <span className="num" style={{ fontSize: 11, color: l.ok ? "var(--pos)" : "var(--warn)", width: 52, textAlign: "right" }}>{l.delta}</span>
                  </div>
                  <div className="dim mono" style={{ fontSize: 9.5 }}>peak {l.peak}</div>
                </div>
              ))}
              <div className="divider" />
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                Overhead press is the outlier at nearly ten percent down. It is the least trained of the four and the first to go in a deficit.
              </div>
            </Card>
          </div>
        </div>
      )}

      {mod === "nutrition" && (
        <div className="col-gap" style={{ gap: 12 }}>
          <div className="grid g-cols-4" style={{ gap: 10 }}>
            {FCR_NUTRITION.kpis.map(([l, v]) => (
              <Card key={l} className="card-tight" style={{ padding: 13 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
              </Card>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Card title="Today's macros">
              {FCR_NUTRITION.macros.map(([l, cur, tgt, c]) => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5 }}>{l}</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: 11.5 }}>{cur} / {tgt} g</span>
                  </div>
                  {window.Meter && <window.Meter value={cur} max={tgt} color={c} tall />}
                </div>
              ))}
            </Card>
            <Card title="This week" sub="calories and protein">
              {window.BarSeries && <window.BarSeries data={FCR_NUTRITION.week.map(d => d.kcal)} labels={FCR_NUTRITION.week.map(d => d.d)} h={92} color="var(--acc-nutri)" highlight={5} />}
              <div className="dim" style={{ fontSize: 11, marginTop: 9, lineHeight: 1.45 }}>Saturday 200 kcal over, agreed refeed. Protein never below 208 g.</div>
            </Card>
            <Card title="Micronutrient gaps" sub="below target, 30-day average">
              {FCR_NUTRITION.gaps.map(([l, v]) => (
                <div key={l} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5 }}>{l}</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: 11.5, color: v < 70 ? "var(--warn)" : "var(--fg)" }}>{v} %</span>
                  </div>
                  {window.Meter && <window.Meter value={v} color={v < 70 ? "var(--warn)" : "var(--acc-recov)"} />}
                </div>
              ))}
              <div className="divider" />
              <div className="muted" style={{ fontSize: 11, lineHeight: 1.45 }}>Vitamin D is supplemented; the gap is dietary intake only.</div>
            </Card>
          </div>
        </div>
      )}

      {mod === "recovery" && (
        <div className="col-gap" style={{ gap: 12 }}>
          <div className="grid g-cols-4" style={{ gap: 10 }}>
            {FCR_RECOVERY.kpis.map(([l, v]) => (
              <Card key={l} className="card-tight" style={{ padding: 13 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 500, color: l.includes("score") ? "var(--warn)" : "var(--fg)" }}>{v}</div>
              </Card>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card title="Sleep · last 7 nights" sub="target 7.5 h">
              {window.LineChart && <window.LineChart series={[{ data: FCR_RECOVERY.sleep, color: "var(--acc-recov)" }, { data: Array(7).fill(7.5), color: "var(--fg-dim)", dashed: true }]} h={150} xLabels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} range={[5, 8.5]} />}
            </Card>
            <Card title="HRV · last 7 days" sub="block baseline 58 ms">
              {window.LineChart && <window.LineChart series={[{ data: FCR_RECOVERY.hrv, color: "var(--warn)" }, { data: Array(7).fill(58), color: "var(--fg-dim)", dashed: true }]} h={150} xLabels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} range={[40, 65]} />}
            </Card>
          </div>
          <Card title="Flags" sub="what the watcher has raised">
            <div className="col-gap" style={{ gap: 7 }}>
              {FCR_RECOVERY.flags.map((f, i) => {
                const c = f.sev === "warn" ? "var(--warn)" : "var(--fg-dim)";
                return (
                  <div key={i} style={{ display: "flex", gap: 10, padding: 11, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 22%, var(--border))`, borderRadius: 6 }}>
                    <span style={{ width: 3, background: c, borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12 }}>{f.t}</span>
                  </div>
                );
              })}
            </div>
            <div className="divider" />
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              Recovery at 58 two days before peak week is the single thing worth acting on. Everything else in his data is where it should be.
            </div>
          </Card>
        </div>
      )}

      {mod === "supplements" && (
        <Card title="Active stack" sub="6 items · 96 % adherence over 30 days">
          <table className="tbl">
            <thead><tr><th>Supplement</th><th style={{ width: 100 }}>Dose</th><th style={{ width: 130 }}>Timing</th><th style={{ width: 140 }}>Adherence · 30d</th><th style={{ width: 90, textAlign: "right" }}>On stack</th></tr></thead>
            <tbody>
              {FCR_SUPPS.map(s => (
                <tr key={s.n}>
                  <td style={{ fontSize: 12 }}>{s.n}</td>
                  <td className="num" style={{ fontSize: 11.5 }}>{s.dose}</td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{s.when}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1 }}>{window.Meter && <window.Meter value={s.adherence} color={s.adherence >= 95 ? "var(--pos)" : "var(--acc-recov)"} />}</div>
                      <span className="num" style={{ fontSize: 11, width: 32 }}>{s.adherence} %</span>
                    </div>
                  </td>
                  <td className="num muted" style={{ textAlign: "right", fontSize: 11 }}>{s.days} d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {mod === "body" && (
        <div className="col-gap" style={{ gap: 12 }}>
          <div className="grid g-cols-4" style={{ gap: 10 }}>
            {FCR_BODY.kpis.map(([l, v]) => (
              <Card key={l} className="card-tight" style={{ padding: 13 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
              </Card>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
            <Card title="Weight · 12 weeks" sub="88.2 kg → 81.4 kg">
              {window.LineChart && <window.LineChart series={[{ data: FCR_BODY.weight, color: "var(--acc-goals)" }]} h={170} xLabels={["w1","","","w4","","","w7","","","w10","","w12"]} range={[80, 89]} />}
            </Card>
            <Card title="Measurements" sub="change since week 1">
              <table className="tbl">
                <tbody>
                  {FCR_BODY.measures.map(([l, v, d]) => (
                    <tr key={l}>
                      <td style={{ fontSize: 11.5 }}>{l}</td>
                      <td className="num" style={{ textAlign: "right", fontSize: 11.5 }}>{v}</td>
                      <td className="num" style={{ textAlign: "right", fontSize: 11, color: "var(--acc-goals)", width: 60 }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="divider" />
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                Waist down nine centimetres against one and a half on the arm. That ratio is what you want in a prep.
              </div>
            </Card>
          </div>
        </div>
      )}

      {mod === "medical" && (
        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
          <Card title="Medical · summary access" sub="what Lukas has shared with you">
            <div style={{ padding: 12, background: "color-mix(in srgb, var(--acc-medic) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-medic) 22%, var(--border))", borderRadius: 7, marginBottom: 13 }}>
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>{FCR_MEDICAL.note}</div>
            </div>
            <div className="col-gap" style={{ gap: 0 }}>
              {FCR_MEDICAL.visible.map(([l, v]) => <Row key={l} label={l} value={v} />)}
            </div>
          </Card>
          <Card title="Not visible to you" sub="held by the medical coach">
            <div className="col-gap" style={{ gap: 6 }}>
              {FCR_MEDICAL.hidden.map(h => (
                <div key={h} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, opacity: 0.7 }}>
                  <Icon name="x" className="ic ic-sm" style={{ color: "var(--fg-dim)" }} />
                  <span style={{ fontSize: 11.5 }}>{h}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              Full medical access is a separate grant. Lukas can extend it at any time, and Dr. Kessler is notified when he does.
            </div>
          </Card>
        </div>
      )}

      {mod === "timeline" && (
        <Card title="Activity timeline" sub="every logged event across all shared modules">
          <div className="col-gap" style={{ gap: 0 }}>
            {FCR_TIMELINE.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: i < FCR_TIMELINE.length - 1 ? "1px solid color-mix(in srgb, var(--border) 60%, transparent)" : "none" }}>
                <span className="num dim" style={{ fontSize: 10.5, width: 110, flexShrink: 0 }}>{e.at}</span>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: mc[e.m], marginTop: 5, flexShrink: 0 }} />
                <span className="mono dim" style={{ fontSize: 10, width: 88, flexShrink: 0 }}>{e.m}</span>
                <span style={{ fontSize: 11.5 }}>{e.t}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
