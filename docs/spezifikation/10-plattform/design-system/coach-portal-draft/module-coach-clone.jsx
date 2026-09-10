// Coach assistant — clone, per-client delegation, identity, autonomy, rules, decisions
// Mirrors the AI Coach architecture, applied to a coach managing a roster

// ── Clone ────────────────────────────────────────────
const CLONE_SOURCES = [
  { id: "method",   label: "Written method",    n: "42 documents",   pct: 100, desc: "Your periodisation approach, RPE philosophy, deload criteria, exercise selection logic", status: "ingested" },
  { id: "messages", label: "Message history",   n: "1,240 messages", pct: 100, desc: "How you actually phrase things — with client consent, anonymised across the roster", status: "ingested" },
  { id: "decisions",label: "Plan decisions",    n: "412 changes",    pct: 100, desc: "Every volume change, deload call and exercise swap you have made, with its trigger", status: "ingested" },
  { id: "calls",    label: "Call transcripts",  n: "18 hours",       pct: 64,  desc: "Recorded consultations. Captures how you explain things out loud, which differs from writing", status: "processing" },
  { id: "corrections", label: "Your edits",     n: "142 edits",      pct: 100, desc: "Every time you rewrote a draft. The most valuable source — it shows what the clone got wrong", status: "continuous" },
];

const CLONE_FIDELITY = [
  { dim: "Vocabulary",        score: 91, note: "Word choice matches. It has learned you never write 'crushing it'." },
  { dim: "Sentence rhythm",   score: 88, note: "Short declaratives, occasional long explanatory sentence. Close." },
  { dim: "Structure",         score: 94, note: "Number first, interpretation second, instruction last. Reliably reproduced." },
  { dim: "Decision logic",    score: 86, note: "Deload timing and volume calls align with your history in 86 % of test cases." },
  { dim: "Tone under pressure", score: 72, note: "Weakest area. When a client pushes back, the clone softens more than you do." },
  { dim: "Humour",            score: 58, note: "You are dry and infrequent. The clone either misses it or overdoes it." },
];

const CLONE_SCOPE = [
  { q: "Programme questions",       ex: "\"Why three sets and not four?\"",              allowed: true,  note: "Answers from your written method" },
  { q: "Schedule and logistics",    ex: "\"Can I move Thursday to Friday?\"",            allowed: true,  note: "Checks your calendar, proposes, confirms" },
  { q: "Technique cues",            ex: "\"Where should my elbows be?\"",                allowed: true,  note: "From your cue library and past messages" },
  { q: "Encouragement after a PR",  ex: "—",                                             allowed: true,  note: "Templated on how you have congratulated before" },
  { q: "Progression decisions",     ex: "\"Should I go up in weight?\"",                 allowed: "draft", note: "Drafts an answer, holds for you" },
  { q: "Plan changes",              ex: "\"Can we swap squats out?\"",                   allowed: "draft", note: "Never applied, only proposed" },
  { q: "Anything medical",          ex: "\"My knee hurts, what is it?\"",                allowed: false, note: "Routed to medical coach, clone stays silent" },
  { q: "Contract and payment",      ex: "\"Can I pause my subscription?\"",              allowed: false, note: "Goes to you directly" },
  { q: "Emotional or personal",     ex: "\"I have been struggling lately\"",             allowed: false, note: "Flagged for you within the hour, no clone reply" },
];

const CLONE_LOG = [
  { at: "today 08:14", client: "Marcus Weber",  q: "is 220 too big a jump to repeat next week?", answer: "Not too big, but I want the pattern grooved before we add again. Hold at 220 for two more sessions — if the bar speed stays where it was yesterday we go up after that.", verdict: "accurate", edited: false },
  { at: "yesterday 19:22", client: "Elena Schmidt", q: "why do I do the hack squat and not back squat?", answer: "Your left knee was flagging under bar position. Hack squat keeps the same quad stimulus with less demand on the joint angle that was bothering you. We revisit it when the knee has been quiet for six weeks.", verdict: "accurate", edited: false },
  { at: "yesterday 14:08", client: "Anna Frey", q: "should I add cardio?", answer: "Not yet — let us see what the added volume does first. One change at a time.", verdict: "accurate", edited: true, editNote: "You added: 'and tell me if the recovery dips'" },
  { at: "2 days ago", client: "Sophie Klein", q: "I have been really down this week, is it worth training?", answer: "—", verdict: "escalated", edited: false, editNote: "Emotional content · clone stayed silent, flagged to you in 4 minutes" },
];

window.CoachCloneView = () => {
  const [tab, setTab] = useState("status");
  const overall = Math.round(CLONE_FIDELITY.reduce((s, f) => s + f.score, 0) / CLONE_FIDELITY.length);
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div style={{ padding: 14, background: "color-mix(in srgb, var(--acc-coach) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 24%, var(--border))", borderRadius: 8, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--acc-coach)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>AL</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Anders · AI</span>
            <Pill variant="pos" dot>live for 6 clients</Pill>
            <Pill>fidelity {overall} %</Pill>
          </div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Answers routine questions in your voice between your scheduled contacts. Every reply is labelled as AI on the client's side. It never applies a plan change and it never speaks on anything you marked as yours.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-sm">Pause clone</button>
          <button className="btn btn-primary btn-sm">Retrain</button>
        </div>
      </div>

      <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1, width: "fit-content" }}>
        {[["status","Training data"],["fidelity","Fidelity"],["scope","What it may answer"],["log","Answer log"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={tab === k ? "btn btn-primary" : "btn btn-ghost"} style={{ height: 24, fontSize: 11, padding: "0 11px", borderRadius: 5 }}>{l}</button>
        ))}
      </div>

      {tab === "status" && (
        <Card title="Training sources" sub="what the clone learned from · your material only">
          <div className="col-gap" style={{ gap: 9 }}>
            {CLONE_SOURCES.map(s => (
              <div key={s.id} style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.label}</span>
                  <span className="num dim" style={{ fontSize: 10.5 }}>{s.n}</span>
                  {s.status === "processing" ? <Pill variant="warn">processing · {s.pct} %</Pill>
                    : s.status === "continuous" ? <Pill variant="acc">continuous</Pill>
                    : <Pill variant="pos">ingested</Pill>}
                </div>
                <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 7 }}>{s.desc}</div>
                {window.Meter && <window.Meter value={s.pct} color={s.pct === 100 ? "var(--pos)" : "var(--warn)"} />}
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Your edits are the most useful source and the only one that never stops feeding. Every rewrite tells the clone where it drifted from you.
          </div>
        </Card>
      )}

      {tab === "fidelity" && (
        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <Card title="Fidelity by dimension" sub="measured against held-out messages you wrote">
            {CLONE_FIDELITY.map(f => (
              <div key={f.dim} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{f.dim}</span>
                  <span className="num" style={{ marginLeft: "auto", fontSize: 12, color: f.score >= 85 ? "var(--pos)" : f.score >= 70 ? "var(--warn)" : "var(--neg)" }}>{f.score}</span>
                </div>
                {window.Meter && <window.Meter value={f.score} color={f.score >= 85 ? "var(--pos)" : f.score >= 70 ? "var(--warn)" : "var(--neg)"} />}
                <div className="muted" style={{ fontSize: 11, marginTop: 5, lineHeight: 1.45 }}>{f.note}</div>
              </div>
            ))}
          </Card>
          <div className="col-gap" style={{ gap: 14 }}>
            <Card title="Where it fails" sub="honest weak spots">
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Two areas are below where they should be. Under pushback the clone concedes faster than you do, which risks a client thinking they have talked you into something. And your humour is dry and rare — the clone reads that as an absence and either drops it entirely or misjudges the register.
              </div>
              <div className="divider" />
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                Both are why pushback and anything personal are outside its scope rather than merely flagged.
              </div>
            </Card>
            <Card title="Accuracy over time">
              {window.Sparkline && <window.Sparkline data={[62, 68, 71, 74, 78, 81, 83, 84, 86, 85, 87, 88]} color="var(--acc-coach)" h={52} />}
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-muted)" }}>
                <span>12 weeks live</span>
                <span>Edit rate <span className="num" style={{ color: "var(--fg)" }}>11 %</span></span>
                <span>Escalated <span className="num" style={{ color: "var(--fg)" }}>4 %</span></span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "scope" && (
        <Card title="Answer scope" sub="what the clone handles, drafts, or refuses">
          <table className="tbl">
            <thead><tr><th style={{ width: 200 }}>Question type</th><th style={{ width: 250 }}>Example</th><th style={{ width: 100 }}>Handling</th><th>Note</th></tr></thead>
            <tbody>
              {CLONE_SCOPE.map(s => {
                const c = s.allowed === true ? "var(--pos)" : s.allowed === "draft" ? "var(--acc-recov)" : "var(--neg)";
                const l = s.allowed === true ? "answers" : s.allowed === "draft" ? "drafts" : "refuses";
                return (
                  <tr key={s.q}>
                    <td style={{ fontSize: 12 }}>{s.q}</td>
                    <td className="muted" style={{ fontSize: 11.5, fontStyle: s.ex === "—" ? "normal" : "italic" }}>{s.ex}</td>
                    <td><Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 30%, var(--border))` }}>{l}</Pill></td>
                    <td className="muted" style={{ fontSize: 11.5 }}>{s.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "log" && (
        <Card title="Answer log" sub="every clone reply, reviewable">
          <div className="col-gap" style={{ gap: 10 }}>
            {CLONE_LOG.map((l, i) => {
              const c = l.verdict === "accurate" ? "var(--pos)" : l.verdict === "escalated" ? "var(--acc-buddy)" : "var(--warn)";
              return (
                <div key={i} style={{ padding: 12, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 20%, var(--border))`, borderRadius: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{l.client}</span>
                    <Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 30%, var(--border))` }}>{l.verdict}</Pill>
                    {l.edited && <Pill variant="warn">you edited</Pill>}
                    <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{l.at}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, fontStyle: "italic", marginBottom: 7, paddingLeft: 10, borderLeft: "2px solid var(--border)" }}>"{l.q}"</div>
                  {l.answer !== "—" && (
                    <div style={{ padding: 11, background: "var(--surface-2)", borderRadius: 6, fontSize: 12, lineHeight: 1.55, marginBottom: l.editNote ? 7 : 0 }}>
                      <span className="mono dim" style={{ fontSize: 9.5, display: "block", marginBottom: 4 }}>Anders · AI</span>
                      {l.answer}
                    </div>
                  )}
                  {l.editNote && <div className="dim" style={{ fontSize: 11, lineHeight: 1.45 }}>{l.editNote}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Per-client configuration ─────────────────────────
const PC_CLIENTS = [
  { id: "c1", name: "Lukas Bauer",   av: "LB", autonomy: 2, clone: false, drafts: true,  auto: false, tone: "direct",     watch: "all", note: "Contest prep. Everything goes through you until the show." },
  { id: "c2", name: "Sophie Klein",  av: "SK", autonomy: 4, clone: true,  drafts: true,  auto: true,  tone: "soft",       watch: "adherence", note: "Responds better to fewer, shorter touches. Clone handles logistics." },
  { id: "c3", name: "Marcus Weber",  av: "MW", autonomy: 5, clone: true,  drafts: true,  auto: true,  tone: "direct",     watch: "minimal", note: "Self-sufficient. Needs braking more than pushing." },
  { id: "c4", name: "Elena Schmidt", av: "ES", autonomy: 1, clone: false, drafts: true,  auto: false, tone: "explanatory",watch: "all", note: "New to structured training. Every message from you personally." },
  { id: "c5", name: "Anna Frey",     av: "AF", autonomy: 3, clone: true,  drafts: true,  auto: true,  tone: "analytical", watch: "progression", note: "Will not report problems. Watcher does the noticing." },
  { id: "c6", name: "Niko Brandt",   av: "NB", autonomy: 4, clone: true,  drafts: true,  auto: true,  tone: "direct",     watch: "minimal", note: "Twelve weeks at full adherence. Low touch." },
  { id: "c7", name: "Jonas Becker",  av: "JB", autonomy: 4, clone: true,  drafts: true,  auto: true,  tone: "analytical", watch: "load", note: "Marathon block. Watch weekly volume, not adherence." },
  { id: "c8", name: "Mira Stahl",    av: "MS", autonomy: 2, clone: false, drafts: true,  auto: false, tone: "soft",       watch: "all", note: "Rebuilding confidence after an injury layoff." },
];

const PC_LADDER = [
  { n: 1, label: "You only",      desc: "Assistant prepares context. Nothing is drafted, nothing is sent." },
  { n: 2, label: "Draft only",    desc: "Drafts everything, sends nothing. You read every word." },
  { n: 3, label: "Routine auto",  desc: "Reminders and confirmations go out alone. Substance still drafts." },
  { n: 4, label: "Clone active",  desc: "Clone answers routine questions in your voice, labelled as AI." },
  { n: 5, label: "Full delegate", desc: "Clone handles all routine contact. You see a summary, not each message." },
];

window.CoachPerClientView = () => {
  const [sel, setSel] = useState("c2");
  const c = PC_CLIENTS.find(x => x.id === sel);
  const lvl = PC_LADDER.find(l => l.n === c.autonomy);
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8 }}>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
          Delegation is set per client, not once for the roster. Lukas is seven days from a stage and gets nothing but you. Marcus has been training for a decade and would find a personal reply to every logistics question patronising. The same assistant, two different jobs.
        </div>
      </div>

      <Card title="Autonomy ladder" sub="five levels · set individually">
        <div className="grid g-cols-5" style={{ gap: 9 }}>
          {PC_LADDER.map(l => {
            const n = PC_CLIENTS.filter(x => x.autonomy === l.n).length;
            return (
              <div key={l.n} style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>{l.n}</div>
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{l.label}</span>
                </div>
                <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.45, marginBottom: 7 }}>{l.desc}</div>
                <div className="num dim" style={{ fontSize: 10 }}>{n} client{n === 1 ? "" : "s"}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <Card title="Per-client settings" sub="click a row to edit">
          <table className="tbl">
            <thead><tr><th>Client</th><th style={{ width: 110 }}>Autonomy</th><th style={{ width: 60 }}>Clone</th><th style={{ width: 60 }}>Auto</th><th style={{ width: 100 }}>Tone</th><th style={{ width: 110 }}>Watcher</th></tr></thead>
            <tbody>
              {PC_CLIENTS.map(x => (
                <tr key={x.id} onClick={() => setSel(x.id)} style={{ cursor: "pointer", background: sel === x.id ? "color-mix(in srgb, var(--acc-buddy) 7%, transparent)" : "transparent" }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600 }}>{x.av}</div>
                      <span style={{ fontSize: 12 }}>{x.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 17, height: 17, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700 }}>{x.autonomy}</div>
                      <span className="dim" style={{ fontSize: 10.5 }}>{PC_LADDER.find(l => l.n === x.autonomy).label}</span>
                    </div>
                  </td>
                  <td>{x.clone ? <Pill variant="pos">on</Pill> : <span className="dim" style={{ fontSize: 11 }}>off</span>}</td>
                  <td>{x.auto ? <Pill variant="pos">on</Pill> : <span className="dim" style={{ fontSize: 11 }}>off</span>}</td>
                  <td className="muted" style={{ fontSize: 11 }}>{x.tone}</td>
                  <td className="muted" style={{ fontSize: 11 }}>{x.watch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title={c.name} sub="individual configuration">
          <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 7, marginBottom: 13 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Why this setting</div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{c.note}</div>
          </div>

          <div className="eyebrow" style={{ marginBottom: 7 }}>Autonomy level</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
            {PC_LADDER.map(l => (
              <button key={l.n} style={{
                flex: 1, height: 28, borderRadius: 5, cursor: "pointer",
                background: l.n === c.autonomy ? "var(--acc-buddy)" : "var(--surface-2)",
                border: "1px solid " + (l.n === c.autonomy ? "var(--acc-buddy)" : "var(--border)"),
                color: l.n === c.autonomy ? "var(--bg)" : "var(--fg-dim)",
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
              }}>{l.n}</button>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 11, lineHeight: 1.45, marginBottom: 14 }}>{lvl.desc}</div>

          <div className="eyebrow" style={{ marginBottom: 7 }}>Toggles</div>
          <div className="col-gap" style={{ gap: 5, marginBottom: 14 }}>
            {[["Clone may answer", c.clone], ["Auto-send reminders", c.auto], ["Draft substantive replies", c.drafts]].map(([l, on]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                <span style={{ fontSize: 11.5, flex: 1 }}>{l}</span>
                <div style={{ width: 30, height: 17, borderRadius: 999, background: on ? "var(--pos)" : "var(--surface-2)", padding: 2, cursor: "pointer" }}>
                  <div style={{ width: 13, height: 13, borderRadius: 999, background: "var(--bg)", marginLeft: on ? 13 : 0, transition: "margin 0.15s" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 7 }}>Tone for this client</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {["direct", "soft", "analytical", "explanatory"].map(t => (
              <button key={t} className={t === c.tone ? "pill pill-acc" : "pill"} style={{ cursor: "pointer", padding: "4px 11px", fontSize: 11 }}>{t}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 7 }}>Watcher scope</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["all", "adherence", "progression", "load", "minimal"].map(w => (
              <button key={w} className={w === c.watch ? "pill pill-acc" : "pill"} style={{ cursor: "pointer", padding: "4px 11px", fontSize: 11 }}>{w}</button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Assistant identity ───────────────────────────────
window.CoachAssistantIdentityView = () => (
  <div className="grid" style={{ gridTemplateColumns: "1fr 1.3fr", gap: 14 }}>
    <Card title="Identity" sub="how the assistant presents itself to you">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 20px" }}>
        <div style={{ width: 62, height: 62, borderRadius: 999, background: "var(--acc-buddy)", opacity: 0.9, marginBottom: 13, boxShadow: window.chartGlow ? window.chartGlow("var(--acc-buddy)", 1) : "none" }} />
        <input defaultValue="Ops" style={{ width: 140, height: 30, textAlign: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, fontWeight: 600 }} />
        <div className="dim" style={{ fontSize: 10.5, marginTop: 6 }}>the name you call it</div>
      </div>
      <div className="divider" />
      <div className="eyebrow" style={{ marginBottom: 7 }}>How it talks to you</div>
      <div className="col-gap" style={{ gap: 5 }}>
        {[["Brevity", "terse"], ["Hedging", "none"], ["Proactivity", "high"], ["Uncertainty", "always stated"]].map(([l, v]) => (
          <Row key={l} label={l} value={v} />
        ))}
      </div>
      <div className="divider" />
      <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
        This is separate from how it writes to clients. To you it is an operations tool; to them it is either a draft you approved or the clone in your voice.
      </div>
    </Card>
    <div className="col-gap" style={{ gap: 14 }}>
      <Card title="Two voices" sub="the distinction that matters">
        <div className="grid g-cols-2" style={{ gap: 10 }}>
          {[
            ["To you", "var(--acc-buddy)", "Ops", "Lukas needs sign-off by Monday. Sophie is drifting but still training. Marcus pulled 220."],
            ["To clients", "var(--acc-coach)", "Anders · AI", "Not too big a jump, but I want the pattern grooved before we add again. Hold at 220 for two more sessions."],
          ].map(([t, c, name, sample]) => (
            <div key={t} style={{ padding: 12, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 24%, var(--border))`, borderRadius: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                <span style={{ fontSize: 11.5, fontWeight: 600 }}>{t}</span>
                <span className="mono dim" style={{ marginLeft: "auto", fontSize: 9.5 }}>{name}</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>{sample}</div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          The assistant reports to you in its own register — compressed, no softening. When it writes to a client it drops that entirely and either drafts in your voice or speaks as the clone.
        </div>
      </Card>
      <Card title="Disclosure" sub="what clients are told">
        <Row label="Assistant use in your profile" value="disclosed" />
        <Row label="Clone replies labelled" value="always · Anders · AI" />
        <Row label="Approved drafts labelled" value="no · your words" />
        <Row label="Auto-sent labelled" value="yes · automated" />
        <div className="divider" />
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          A client can always tell whether they are reading you, something you approved, or the clone. The one thing that never happens is a machine reply passing as personal.
        </div>
      </Card>
    </div>
  </div>
);

// ── Assistant decisions ──────────────────────────────
const CD_DECISIONS = [
  { at: "09:12", rule: "queue_priority", type: "ordering", conf: 0.91,
    short: "Lukas placed above Sophie in today's queue",
    detail: "Lukas has an external deadline on Monday; Sophie's issue degrades gradually. Ordering by irreversibility rather than by severity.",
    data: "lukas.days_out=7 · sophie.adherence_delta=-18pp · sophie.training=unaffected" },
  { at: "09:14", rule: "draft_length", type: "drafting", conf: 0.84,
    short: "Sophie's draft kept to three sentences",
    detail: "Her reply rate falls sharply above four sentences. Shorter message chosen despite the topic warranting more.",
    data: "sophie.reply_rate_short=0.78 · reply_rate_long=0.31" },
  { at: "08:02", rule: "clone_scope", type: "escalation", conf: 0.96,
    short: "Clone withheld on Sophie's emotional message",
    detail: "Content matched the personal-distress pattern. Clone stayed silent and flagged to you rather than attempting a reply.",
    data: "sentiment=-0.62 · pattern=personal_distress · scope=refuse" },
  { at: "yesterday", rule: "no_message", type: "silence", conf: 0.77,
    short: "No fourth message to Marcus",
    detail: "Three touches already that day. A streak congratulation did not justify another interruption.",
    data: "marcus.touches_today=3 · threshold=3 · value=low" },
];

window.CoachAssistantDecisionsView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8 }}>
      <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
        Every judgement the assistant made today, including the ones where it decided to do nothing. If a draft reads oddly or a client was skipped, the reason is here rather than buried in a model.
      </div>
    </div>
    <div className="col-gap" style={{ gap: 10 }}>
      {CD_DECISIONS.map((d, i) => (
        <Card key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{d.short}</span>
            <Pill>{d.type}</Pill>
            <span className="num dim" style={{ fontSize: 10 }}>conf {d.conf}</span>
            <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{d.at}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 9 }}>{d.detail}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", background: "var(--surface-2)", borderRadius: 5 }}>
            <span className="dim mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>rule</span>
            <span className="mono" style={{ fontSize: 10.5 }}>{d.rule}</span>
            <span className="dim mono" style={{ fontSize: 10, marginLeft: "auto" }}>{d.data}</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
