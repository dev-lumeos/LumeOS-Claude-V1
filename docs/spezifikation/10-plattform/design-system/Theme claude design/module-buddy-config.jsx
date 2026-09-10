// AI Coach — configuration layers · 4-layer memory · AI clone · widget · onboarding
// SPEC_01 §3–4, SPEC_03 flows 1/6/7/8

// ── Configuration · four levels ──────────────────────
const CFG_LEVELS = [
  {
    id: "user", label: "User", color: "var(--acc-buddy)", who: "You control these directly",
    items: [
      ["Persona", "Best Friend", "5 styles · switchable mid-conversation"],
      ["Autonomy level", "3 · collaborative", "1 asks everything, 5 acts alone"],
      ["Intervention threshold", "medium", "low · medium · high · urgent_only"],
      ["Quiet hours", "22:00 – 06:00", "critical alerts bypass"],
      ["Journey checkpoints", "4 active", "time, modules and persona per slot"],
      ["Module access", "5 of 6", "medical excluded by you"],
    ],
  },
  {
    id: "tier", label: "Tier", color: "var(--acc-mkt)", who: "Set by your plan · Plus",
    items: [
      ["Chat volume", "unlimited", "free is capped at 5 per day"],
      ["Personas", "all 5", "free gets motivator only"],
      ["Journey / heartbeat", "enabled", "plus and above"],
      ["Voice input", "locked", "requires pro"],
      ["Action execution", "locked", "requires pro"],
      ["Proactive watcher", "locked", "requires pro"],
      ["Training plans", "locked", "requires elite"],
      ["Weekly deep report", "locked", "requires elite"],
    ],
  },
  {
    id: "coach", label: "Coach", color: "var(--acc-coach)", who: "Anders can override these for you",
    items: [
      ["Autonomy override", "none set", "coach may cap your level"],
      ["Max intervention intensity", "not capped", "limits how hard Buddy pushes"],
      ["Blocked rules", "2 rules", "deload_suggestion, volume_autoadjust"],
      ["Custom rules", "3 active", "written by Anders for you specifically"],
      ["Clone activation", "off", "would let Buddy answer in his voice"],
    ],
  },
  {
    id: "gym", label: "Gym / B2B", color: "var(--acc-train)", who: "Not applicable · no gym affiliation",
    items: [
      ["White-label branding", "—", "gym logo and colours in chat"],
      ["Custom knowledge base", "—", "gym's own protocols added to RAG"],
      ["Wallet integration", "—", "credits redeemable at the gym"],
      ["Escalation contact", "—", "who gets called on a safety flag"],
    ],
  },
];

window.AIConfigView = () => {
  const [lvl, setLvl] = useState("user");
  const cur = CFG_LEVELS.find(c => c.id === lvl);
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8 }}>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
          Four layers decide how Buddy behaves. They stack: your setting is the starting point, your tier can lock it, your coach can override it, and a gym affiliation can wrap all three. Where two disagree, the more restrictive one wins.
        </div>
      </div>

      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {CFG_LEVELS.map(c => (
          <div key={c.id} onClick={() => setLvl(c.id)} style={{
            padding: 13, borderRadius: 8, cursor: "pointer",
            background: lvl === c.id ? `color-mix(in srgb, ${c.color} 9%, var(--surface))` : "var(--surface)",
            border: `1px solid ${lvl === c.id ? `color-mix(in srgb, ${c.color} 34%, var(--border))` : "var(--border)"}`,
            opacity: c.id === "gym" ? 0.62 : 1,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.label}</span>
            </div>
            <div className="dim" style={{ fontSize: 10.5, lineHeight: 1.4, marginBottom: 6 }}>{c.who}</div>
            <div className="num dim" style={{ fontSize: 10 }}>{c.items.length} settings</div>
          </div>
        ))}
      </div>

      <Card title={`${cur.label} level`} sub={cur.who}>
        <table className="tbl">
          <thead><tr><th style={{ width: 200 }}>Setting</th><th style={{ width: 170 }}>Current</th><th>Notes</th></tr></thead>
          <tbody>
            {cur.items.map(([k, v, n]) => {
              const locked = v === "locked";
              const na = v === "—";
              return (
                <tr key={k} style={{ opacity: na ? 0.55 : 1 }}>
                  <td style={{ fontSize: 12 }}>{k}</td>
                  <td>
                    {locked
                      ? <Pill variant="warn">locked</Pill>
                      : na
                        ? <span className="dim">—</span>
                        : <span className="num" style={{ fontSize: 11.5 }}>{v}</span>}
                  </td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{n}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card title="Coach overrides in effect" sub="Anders Lindqvist · training coach">
        <div className="col-gap" style={{ gap: 7 }}>
          {[
            ["Blocked · deload_suggestion", "Anders handles deload timing himself. Buddy will not raise it.", "var(--neg)"],
            ["Blocked · volume_autoadjust", "Volume changes come from the block plan, not from daily readiness.", "var(--neg)"],
            ["Custom · pr_attempt_gate", "No PR attempt suggestion unless recovery ≥ 75 and sleep ≥ 7 h for two nights.", "var(--acc-coach)"],
            ["Custom · rpe_drift_watch", "Flag when reported RPE runs above the load-matched baseline three sessions running.", "var(--acc-coach)"],
            ["Custom · weekend_protein", "Saturday protein below 150 g sends a Sunday-morning nudge, not a Saturday-evening one.", "var(--acc-coach)"],
          ].map(([t, d, c], i) => (
            <div key={i} style={{ display: "flex", gap: 11, padding: 11, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 22%, var(--border))`, borderRadius: 6 }}>
              <span style={{ width: 3, background: c, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div className="mono" style={{ fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{t}</div>
                <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── 4-layer memory ───────────────────────────────────
const MEM_LAYERS = [
  { n: 1, id: "working", label: "Working memory", color: "var(--acc-recov)", ttl: "current conversation",
    desc: "The last turns of this thread. Cleared when the conversation closes.",
    count: 8, ex: ["You asked about the weight jump", "Established it is water, not fat", "Agreed to re-weigh Wednesday"] },
  { n: 2, id: "episodic", label: "Episodic memory", color: "var(--acc-buddy)", ttl: "90 days, decaying",
    desc: "Specific events with a date. Fades unless referenced again.",
    count: 142, ex: ["Bench PR 122.5 kg on 29 Aug", "Missed three Fridays in July", "Travelled to Spain 4–11 Aug"] },
  { n: 3, id: "semantic", label: "Semantic memory", color: "var(--acc-coach)", ttl: "persistent",
    desc: "Facts about you that do not expire. Preferences, constraints, history.",
    count: 34, ex: ["Lactose intolerant, mild", "Trains five days, rests Thursday and Sunday", "On TRT since Sep 2024"] },
  { n: 4, id: "procedural", label: "Procedural memory", color: "var(--acc-train)", ttl: "confidence-weighted",
    desc: "What has worked with you before. Grows and shrinks with observed outcomes.",
    count: 21, ex: ["Data framing lands, pep talks do not", "Direct tone works when adherence is high", "Silence beats a fourth message in a day"] },
];

const MEM_ENTRIES = [
  { layer: "semantic",   type: "preference", cat: "nutrition",  content: "Dislikes fish. Salmon suggestions declined four times.", conf: 0.92, imp: 0.7, acc: 14, decay: false, created: "2026-04-12" },
  { layer: "semantic",   type: "concern",    cat: "training",   content: "Left knee discomfort under load. Back squat swapped for hack squat.", conf: 0.88, imp: 0.9, acc: 22, decay: false, created: "2026-06-21" },
  { layer: "procedural", type: "pattern",    cat: "psychology", content: "Responds to numbers, not encouragement. Analytical tone rates highest.", conf: 0.91, imp: 0.95, acc: 61, decay: false, created: "2026-05-28" },
  { layer: "episodic",   type: "milestone",  cat: "training",   content: "Bench 122.5 kg × 3 — highest e1RM in the current block.", conf: 1.00, imp: 0.8, acc: 8, decay: true, created: "2026-08-29" },
  { layer: "episodic",   type: "context_note",cat: "lifestyle", content: "Holiday in Spain, 4–11 Aug. Training and nutrition both off-plan by design.", conf: 1.00, imp: 0.4, acc: 3, decay: true, created: "2026-08-04" },
  { layer: "procedural", type: "success",    cat: "training",   content: "Tough-love framing on the August plateau led to an accepted intensity change.", conf: 0.94, imp: 0.85, acc: 12, decay: false, created: "2026-08-19" },
  { layer: "semantic",   type: "goal",       cat: "training",   content: "Target 78 kg at 12 % body fat by 1 Aug 2026. Strength retention is the constraint.", conf: 1.00, imp: 1.0, acc: 88, decay: false, created: "2026-03-15" },
  { layer: "working",    type: "context_note",cat: "general",   content: "Currently discussing the 1.2 kg weight jump since Saturday.", conf: 1.00, imp: 0.3, acc: 1, decay: true, created: "today" },
];

window.AIMemoryLayersView = () => {
  const [layer, setLayer] = useState("all");
  const rows = layer === "all" ? MEM_ENTRIES : MEM_ENTRIES.filter(e => e.layer === layer);
  const lc = Object.fromEntries(MEM_LAYERS.map(l => [l.id, l.color]));
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {MEM_LAYERS.map(l => (
          <Card key={l.id} className="card-tight" style={{ padding: 13, position: "relative", overflow: "hidden", cursor: "pointer",
            border: layer === l.id ? `1px solid color-mix(in srgb, ${l.color} 34%, var(--border))` : undefined }}
            onClick={() => setLayer(layer === l.id ? "all" : l.id)}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: l.color }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 5 }}>
              <span className="num" style={{ fontSize: 10, color: l.color, fontWeight: 700 }}>L{l.n}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{l.label}</span>
            </div>
            <div className="num" style={{ fontSize: 19, fontWeight: 500, marginBottom: 4 }}>{l.count}</div>
            <div className="dim mono" style={{ fontSize: 9.5, marginBottom: 7 }}>{l.ttl}</div>
            <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.45 }}>{l.desc}</div>
          </Card>
        ))}
      </div>

      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {MEM_LAYERS.map(l => (
          <Card key={l.id} className="card-tight" style={{ padding: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 7, color: l.color }}>{l.label} · sample</div>
            <div className="col-gap" style={{ gap: 5 }}>
              {l.ex.map(e => <div key={e} className="muted" style={{ fontSize: 10.5, lineHeight: 1.45 }}>· {e}</div>)}
            </div>
          </Card>
        ))}
      </div>

      <Card title="Memory entries" sub={layer === "all" ? `${MEM_ENTRIES.length} shown · all layers` : `filtered to ${layer}`}
        actions={layer !== "all" ? <button className="btn btn-sm btn-ghost" onClick={() => setLayer("all")}>Clear filter</button> : null}>
        <table className="tbl">
          <thead><tr><th style={{ width: 100 }}>Layer</th><th style={{ width: 110 }}>Type</th><th>Content</th><th style={{ width: 100 }}>Confidence</th><th style={{ width: 90 }}>Importance</th><th style={{ width: 60, textAlign: "right" }}>Reads</th><th style={{ width: 70 }}>Decay</th></tr></thead>
          <tbody>
            {rows.map((e, i) => (
              <tr key={i}>
                <td><Pill style={{ color: lc[e.layer], borderColor: `color-mix(in srgb, ${lc[e.layer]} 30%, var(--border))`, fontSize: 9.5 }}>{e.layer}</Pill></td>
                <td className="mono dim" style={{ fontSize: 10.5 }}>{e.type}</td>
                <td style={{ fontSize: 11.5 }}>{e.content}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1 }}>{window.Meter && <window.Meter value={e.conf * 100} color={lc[e.layer]} flat />}</div>
                    <span className="num dim" style={{ fontSize: 10 }}>{e.conf.toFixed(2)}</span>
                  </div>
                </td>
                <td className="num" style={{ fontSize: 11, color: e.imp >= 0.85 ? "var(--fg)" : "var(--fg-muted)" }}>{e.imp.toFixed(2)}</td>
                <td className="num muted" style={{ textAlign: "right", fontSize: 11 }}>{e.acc}</td>
                <td>{e.decay ? <Pill variant="warn">fades</Pill> : <Pill variant="pos">kept</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Confidence rises when a memory is confirmed by a later event and falls when it is contradicted. Entries marked as fading lose importance over 90 days unless something references them again.
        </div>
      </Card>
    </div>
  );
};

// ── AI Clone (Coach B2B) ─────────────────────────────
window.AICloneView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <div style={{ padding: 14, background: "color-mix(in srgb, var(--acc-coach) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 24%, var(--border))", borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--acc-coach)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>AL</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>AI Clone · Anders Lindqvist</span>
            <Pill variant="warn">inactive</Pill>
            <Pill>Elite feature</Pill>
          </div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Lets Buddy answer routine questions in your coach's voice and according to his documented method, between your scheduled contacts. He controls what it may say. It never replaces him on anything he flagged as his own call.
          </div>
        </div>
        <button className="btn btn-primary btn-sm">Request activation</button>
      </div>
    </div>

    <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
      <Card title="What the clone is trained on" sub="supplied by the coach, not scraped from your chats">
        <div className="col-gap" style={{ gap: 8 }}>
          {[
            ["Written method", "42 documents", "Periodisation approach, RPE philosophy, deload criteria", "var(--acc-train)"],
            ["Past answers", "1,240 messages", "Anonymised responses to other clients, with their consent", "var(--acc-coach)"],
            ["Decision rules", "18 rules", "When he changes volume, when he holds, when he escalates", "var(--acc-buddy)"],
            ["Tone samples", "60 excerpts", "How he phrases praise, correction and bad news", "var(--acc-recov)"],
          ].map(([t, n, d, c]) => (
            <div key={t} style={{ display: "flex", gap: 11, padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
              <span style={{ width: 3, background: c, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{t}</span>
                  <span className="num dim" style={{ fontSize: 10.5 }}>{n}</span>
                </div>
                <div className="muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="col-gap" style={{ gap: 14 }}>
        <Card title="Boundaries" sub="what the clone may never do">
          <div className="col-gap" style={{ gap: 6 }}>
            {[
              "Change a plan without the coach seeing it",
              "Answer anything medical",
              "Contradict a decision the coach made explicitly",
              "Claim to be the human coach",
            ].map(t => (
              <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.45 }}>
                <Icon name="x" className="ic ic-sm" style={{ color: "var(--neg)", flexShrink: 0, marginTop: 2 }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Attribution" sub="always visible in chat">
          <div style={{ padding: 11, background: "var(--surface-2)", borderRadius: 6, fontSize: 11.5, lineHeight: 1.5, color: "var(--fg-muted)" }}>
            Answers from the clone carry a marker reading <span className="mono" style={{ color: "var(--fg)" }}>Anders · AI</span>. You always know whether you are reading him or a model trained on him.
          </div>
        </Card>
      </div>
    </div>
  </div>
);

// ── Floating widget + onboarding ─────────────────────
window.AIWidgetView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1fr 1.3fr", gap: 14 }}>
    <Card title="Floating widget" sub="persistent across every module">
      <div style={{ display: "flex", justifyContent: "center", padding: "18px 0 22px" }}>
        <div style={{
          width: 250, padding: 14, borderRadius: 13,
          background: "var(--bg-elev)", border: "1px solid var(--border)",
          boxShadow: window.chartGlow ? window.chartGlow("var(--acc-buddy)", 0.7) : "0 8px 28px rgba(0,0,0,0.28)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--acc-buddy)", opacity: 0.9, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>Buddy</div>
              <div className="dim mono" style={{ fontSize: 9 }}>idle · tap to open</div>
            </div>
            <Icon name="chevron_up" className="ic ic-sm" style={{ color: "var(--fg-dim)" }} />
          </div>
          <div className="col-gap" style={{ gap: 7 }}>
            {[["Today", 72, "var(--acc-coach)"], ["Protein", 65, "var(--acc-nutri)"], ["Recovery", 78, "var(--acc-recov)"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "grid", gridTemplateColumns: "58px 1fr 30px", gap: 8, alignItems: "center" }}>
                <span className="dim" style={{ fontSize: 10 }}>{l}</span>
                {window.Meter && <window.Meter value={v} color={c} />}
                <span className="num" style={{ fontSize: 10, textAlign: "right" }}>{v}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 11 }}>
            {["Log", "Ask", "Today"].map(b => (
              <button key={b} className="btn btn-sm" style={{ flex: 1, height: 24, fontSize: 10.5 }}>{b}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="divider" />
      <Row label="Position" value="bottom right" />
      <Row label="Visible in" value="all modules" />
      <Row label="Collapses to" value="orb only" />
      <Row label="Data refresh" value="on every event" />
    </Card>

    <Card title="Onboarding · five steps" sub="run once at first login · re-runnable from settings">
      <div className="col-gap" style={{ gap: 9 }}>
        {[
          { n: 1, t: "Name your coach", d: "Alex · Dr. Kim · Max · Buddy · custom", done: true, val: "Buddy" },
          { n: 2, t: "Choose personality", d: "Scientist · Motivator · Drill Sergeant · Best Friend · Zen Master, with a live preview of how each one speaks", done: true, val: "Best Friend" },
          { n: 3, t: "What may Buddy see?", d: "Six modules, each opt-in. Medical is off by default and stays off unless you turn it on", done: true, val: "5 of 6 · medical excluded" },
          { n: 4, t: "How active should Buddy be?", d: "Level 1 waits to be asked, level 3 collaborates, level 5 decides alone", done: true, val: "Level 3" },
          { n: 5, t: "Enable heartbeat?", d: "Daily briefings at 07:00 and 21:00 to start with, adjustable afterwards", done: true, val: "4 checkpoints active" },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", gap: 12, padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
            <div style={{
              width: 23, height: 23, borderRadius: 999, flexShrink: 0,
              background: s.done ? "var(--pos)" : "var(--surface-2)", color: s.done ? "var(--bg)" : "var(--fg-muted)",
              display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700,
            }}>{s.done ? "✓" : s.n}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.t}</span>
                <Pill variant="acc" style={{ marginLeft: "auto" }}>{s.val}</Pill>
              </div>
              <div className="muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="divider" />
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-sm">Re-run onboarding</button>
        <button className="btn btn-sm btn-ghost">Reset Buddy to defaults</button>
      </div>
    </Card>
  </div>
);
