// AI Coach · Knowledge base (RAG), user rules engine, AI Clone, Gym Finder
// Ref: Buddy INDEX (RAG, clone, gym finder), SPEC_02 §6 (BuddyRules), SPEC_04 F10 (evidence)

const KB_ENTRIES = [
  { id: "KB-118", title: "Creatine loading is optional", topic: "Supplements", conf: 0.96,
    claim: "A 20 g/day loading phase saturates muscle stores in about a week; 3–5 g daily reaches the same saturation in three to four weeks with less GI upset.",
    refs: [{ t: "Hultman et al. · J Appl Physiol", y: 1996, doi: "10.1152/jappl.1996.81.1.232" },
           { t: "ISSN Position Stand: Creatine", y: 2017, doi: "10.1186/s12970-017-0173-z" }],
    used: 4, lastUsed: "yesterday" },
  { id: "KB-104", title: "Protein distribution across the day", topic: "Nutrition", conf: 0.91,
    claim: "Four doses of roughly 0.4 g/kg spread evenly outperform two large doses for 24-hour muscle protein synthesis.",
    refs: [{ t: "Areta et al. · J Physiol", y: 2013, doi: "10.1113/jphysiol.2012.244897" },
           { t: "Schoenfeld & Aragon · JISSN", y: 2018, doi: "10.1186/s12970-018-0215-1" }],
    used: 11, lastUsed: "today" },
  { id: "KB-092", title: "HRV responds to sleep debt before it responds to load", topic: "Recovery", conf: 0.84,
    claim: "Overnight rMSSD tracks cumulative sleep deficit more tightly than acute training volume in trained populations.",
    refs: [{ t: "Plews et al. · Sports Med", y: 2013, doi: "10.1007/s40279-013-0071-8" }],
    used: 6, lastUsed: "2 days ago" },
  { id: "KB-076", title: "Caffeine half-life and sleep onset", topic: "Supplements", conf: 0.93,
    claim: "With a five-hour half-life, 200 mg at 17:00 still leaves roughly 100 mg circulating at 22:00 — enough to delay sleep onset in most people.",
    refs: [{ t: "Drake et al. · J Clin Sleep Med", y: 2013, doi: "10.5664/jcsm.3170" }],
    used: 8, lastUsed: "yesterday" },
  { id: "KB-061", title: "Volume landmarks are individual", topic: "Training", conf: 0.72,
    claim: "MEV and MRV vary widely between lifters; population defaults are a starting point, not a prescription.",
    refs: [{ t: "Israetel et al. · Scientific Principles of Hypertrophy", y: 2021, doi: "—" }],
    used: 3, lastUsed: "last week" },
];

window.BuddyKnowledge = () => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const rows = KB_ENTRIES.filter(k => !q || (k.title + k.claim + k.topic).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="brain" className="ic" style={{color: "var(--acc-buddy)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Knowledge base</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Retrieval runs before any science claim. If nothing is retrieved, I don't make the claim — and the citation lands in a card,
            never inside spoken text.
          </div>
        </div>
        <Pill variant="acc">pgvector · {KB_ENTRIES.length} of 1,240</Pill>
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the knowledge base…"
        style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>

      <div className="col-gap" style={{gap: 8}}>
        {rows.map(k => (
          <Card key={k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} style={{cursor: "pointer"}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
              <span className="mono dim" style={{fontSize: 10}}>{k.id}</span>
              <Pill>{k.topic}</Pill>
              <Pill style={{color: k.conf >= 0.9 ? "var(--pos)" : k.conf >= 0.8 ? "var(--acc-recov)" : "var(--warn)"}}>confidence {k.conf.toFixed(2)}</Pill>
              <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>cited {k.used}× · {k.lastUsed}</span>
            </div>
            <div style={{fontSize: 13.5, fontWeight: 600, marginBottom: 5}}>{k.title}</div>
            <div className="muted" style={{fontSize: 12, lineHeight: 1.55}}>{k.claim}</div>
            {sel?.id === k.id && (
              <>
                <div className="divider"/>
                <div className="eyebrow" style={{marginBottom: 6}}>Evidence card · shown in UI, never spoken</div>
                <div className="col-gap" style={{gap: 4}}>
                  {k.refs.map((r, i) => (
                    <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 5, fontSize: 11.5}}>
                      <Icon name="file" className="ic ic-sm" style={{color: "var(--acc-buddy)"}}/>
                      <span style={{flex: 1}}>{r.t}</span>
                      <span className="num dim">{r.y}</span>
                      <span className="mono dim" style={{fontSize: 10}}>{r.doi}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── User-facing rules engine (SPEC_02 §6) ───────────────────
const USER_RULES = [
  { id: "UR-04", name: "Remind me about casein",     cat: "nutrition", by: "user",   active: true,
    trigger: "protein_remaining > 30 AND hour >= 20", action: "message", priority: 4,
    cooldown: 24, maxPerDay: 1, fired: 12, success: 0.75 },
  { id: "UR-03", name: "Flag late caffeine",          cat: "supplements", by: "user", active: true,
    trigger: "caffeine_logged AND hour >= 16", action: "alert · info", priority: 6,
    cooldown: 12, maxPerDay: 2, fired: 5, success: 0.60 },
  { id: "UR-02", name: "No training talk on Sundays", cat: "general", by: "user",     active: true,
    trigger: "day = sunday", action: "suppress training reminders", priority: 2,
    cooldown: 0, maxPerDay: 1, fired: 8, success: null },
  { id: "SR-11", name: "Recovery below 50 · warn",    cat: "recovery", by: "system",  active: true,
    trigger: "recovery_score < 50 AND heavy_training_day", action: "alert · warning", priority: 1,
    cooldown: 24, maxPerDay: 1, fired: 2, success: 0.88 },
  { id: "CR-02", name: "Peaking block · no confrontation", cat: "training", by: "coach", active: true,
    trigger: "block_phase = peaking", action: "cap intervention tone", priority: 1,
    cooldown: 0, maxPerDay: 99, fired: 1, success: null },
];

window.BuddyRules = () => {
  const [open, setOpen] = useState(false);
  const byLabel = { user: "you", system: "system", coach: "coach" };
  const byColor = { user: "var(--acc-buddy)", system: "var(--fg-dim)", coach: "var(--acc-coach)" };
  return (
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="bolt" className="ic" style={{color: "var(--acc-buddy)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Your rules</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Write your own triggers. Yours run alongside the system rules and any your coach has set — priority decides who wins,
            cooldown decides how often.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" className="ic ic-sm"/>New rule</button>
      </div>

      <Card>
        <table className="tbl">
          <thead><tr><th style={{width: 70}}>ID</th><th>Rule</th><th style={{width: 80}}>Source</th><th style={{width: 60, textAlign: "right"}}>Prio</th><th style={{width: 90, textAlign: "right"}}>Cooldown</th><th style={{width: 80, textAlign: "right"}}>Max/day</th><th style={{width: 70, textAlign: "right"}}>Fired</th><th style={{width: 90, textAlign: "right"}}>Success</th></tr></thead>
          <tbody>
            {USER_RULES.map(r => (
              <tr key={r.id}>
                <td className="num muted" style={{fontSize: 11}}>{r.id}</td>
                <td>
                  <div style={{fontSize: 12.5, fontWeight: 500, marginBottom: 2}}>{r.name}</div>
                  <div className="mono dim" style={{fontSize: 10}}>{r.trigger} → {r.action}</div>
                </td>
                <td><Pill style={{color: byColor[r.by], borderColor: `color-mix(in srgb, ${byColor[r.by]} 32%, var(--border))`}}>{byLabel[r.by]}</Pill></td>
                <td className="num" style={{textAlign: "right"}}>{r.priority}</td>
                <td className="num muted" style={{textAlign: "right"}}>{r.cooldown ? r.cooldown + " h" : "—"}</td>
                <td className="num muted" style={{textAlign: "right"}}>{r.maxPerDay}</td>
                <td className="num" style={{textAlign: "right"}}>{r.fired}</td>
                <td className="num" style={{textAlign: "right", color: r.success == null ? "var(--fg-dim)" : r.success >= 0.7 ? "var(--pos)" : "var(--warn)"}}>
                  {r.success == null ? "—" : (r.success * 100).toFixed(0) + "%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {open && (
        <div className="modal-veil" onClick={() => setOpen(false)}>
          <div className="modal" style={{width: 600}} onClick={e => e.stopPropagation()}>
            <div className="modal-h">
              <div style={{flex: 1}}>
                <div style={{fontSize: 14, fontWeight: 600}}>New rule</div>
                <div className="dim" style={{fontSize: 11}}>Runs on every event that matches the trigger</div>
              </div>
              <button className="icon-btn" onClick={() => setOpen(false)}><Icon name="x" className="ic"/></button>
            </div>
            <div className="modal-body">
              <div style={{marginBottom: 12}}>
                <div className="eyebrow" style={{marginBottom: 4}}>Name</div>
                <input placeholder="e.g. Remind me about casein" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
              </div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12}}>
                <div>
                  <div className="eyebrow" style={{marginBottom: 4}}>Category</div>
                  <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
                    <option>nutrition</option><option>training</option><option>recovery</option><option>supplements</option><option>general</option>
                  </select>
                </div>
                <div>
                  <div className="eyebrow" style={{marginBottom: 4}}>Action</div>
                  <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
                    <option>message</option><option>alert · info</option><option>alert · warning</option><option>suppress</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom: 12}}>
                <div className="eyebrow" style={{marginBottom: 4}}>Condition</div>
                <input defaultValue="protein_remaining > 30 AND hour >= 20" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
              </div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
                <div><div className="eyebrow" style={{marginBottom: 4}}>Priority</div><input type="number" defaultValue="5" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
                <div><div className="eyebrow" style={{marginBottom: 4}}>Cooldown h</div><input type="number" defaultValue="24" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
                <div><div className="eyebrow" style={{marginBottom: 4}}>Max per day</div><input type="number" defaultValue="1" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
              </div>
            </div>
            <div className="modal-f">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Create rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── AI Clone + Gym Finder ───────────────────────────────────
window.BuddyClone = () => (
  <div className="grid" style={{gridTemplateColumns: "1.3fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="coach" className="ic" style={{color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>AI Clone · Anders Lindqvist</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Your training coach has published a clone of his method. Between your weekly calls, it answers in his framework
            and flags him when it can't.
          </div>
        </div>
        <Pill variant="acc">Coach B2B</Pill>
      </div>

      <Card title="What the clone knows" sub="trained on 4 years of his coaching corpus">
        <div className="col-gap" style={{gap: 5}}>
          {[
            ["Programming philosophy", "RPE-led, never percentage-led. Autoregulation over fixed loads."],
            ["Deload triggers",         "Three stalled sessions or RPE 9 twice in a week."],
            ["Exercise preferences",    "Free weights first. Machines only for isolation or rehab."],
            ["Communication style",     "Short, direct, no filler. Explains the why once."],
            ["Hard limits",             "Never advises on medical, nutrition specifics or supplements."],
          ].map(([k, v]) => (
            <div key={k} style={{display: "grid", gridTemplateColumns: "180px 1fr", gap: 10, padding: "9px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
              <span style={{fontWeight: 500}}>{k}</span>
              <span className="muted">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent clone answers" sub="he reviews these weekly">
        <div className="col-gap" style={{gap: 8}}>
          {[
            { q: "Should I add a set to bench this week?", a: "Not this week. You're two sessions into block 2 — hold volume and let intensity settle first.", flagged: false, at: "yesterday" },
            { q: "My elbow aches on pressing.",             a: "That's outside what I answer for Anders. Flagged for him — he'll pick it up before Monday.",  flagged: true,  at: "May 12" },
            { q: "Is RPE 8 too easy for the top set?",      a: "No. RPE 8 on the top set is the plan through week 8. Nine is for the peaking block.",         flagged: false, at: "May 10" },
          ].map((c, i) => (
            <div key={i} style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                {c.flagged ? <Pill variant="warn">escalated to Anders</Pill> : <Pill variant="pos">answered</Pill>}
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{c.at}</span>
              </div>
              <div style={{fontSize: 12, marginBottom: 6}}>&ldquo;{c.q}&rdquo;</div>
              <div className="muted" style={{fontSize: 12, lineHeight: 1.5, paddingLeft: 10, borderLeft: "2px solid var(--acc-coach)"}}>{c.a}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 14}}>
      <Card title="Gym finder" sub="Pro feature · Google Places">
        <div style={{padding: 10, background: "var(--surface-2)", borderRadius: 6, marginBottom: 12, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
          Used when you travel — filters for the equipment your current block actually needs.
        </div>
        <div className="eyebrow" style={{marginBottom: 6}}>Required for block 2</div>
        <div style={{display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12}}>
          {["Power rack", "Barbell 20 kg", "Plates to 200 kg", "Pull-up bar", "Adjustable bench"].map(e => <Pill key={e}>{e}</Pill>)}
        </div>
        <div className="col-gap" style={{gap: 6}}>
          {[
            { n: "McFit Charlottenburg", d: "1.2 km", ok: true,  note: "All equipment present" },
            { n: "Basefit Kantstraße",   d: "2.4 km", ok: true,  note: "All equipment present" },
            { n: "Holmes Place Ku'damm", d: "3.1 km", ok: false, note: "No plates above 160 kg" },
          ].map(g => (
            <div key={g.n} style={{display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
              <span style={{width: 7, height: 7, borderRadius: 999, background: g.ok ? "var(--pos)" : "var(--warn)"}}/>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12, fontWeight: 500}}>{g.n}</div>
                <div className="dim" style={{fontSize: 10.5}}>{g.note}</div>
              </div>
              <span className="num dim" style={{fontSize: 11}}>{g.d}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

Object.assign(window, { KB_ENTRIES, USER_RULES });
