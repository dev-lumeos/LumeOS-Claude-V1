// Human Coaches · spec-conformant permission model, consent log, proposals,
// autonomy from the client's side, check-in templates.
// Ref: HumanCoach SPEC_01 §2–3, SPEC_02 §2/3/6/7, SPEC_05, INDEX Permission Matrix

// ── The 7 spec modules with their spec defaults ──────────────
const PERM_MODULES = [
  { key: "training",     label: "Training",     def: "full",    sensitive: false },
  { key: "nutrition",    label: "Nutrition",    def: "full",    sensitive: false },
  { key: "recovery",     label: "Recovery",     def: "summary", sensitive: true,  note: "Full HRV data is sensitive" },
  { key: "supplements",  label: "Supplements",  def: "full",    sensitive: false },
  { key: "medical",      label: "Medical",      def: "none",    sensitive: true,  note: "Highest sensitivity — explicit grant only" },
  { key: "goals",        label: "Goals",        def: "full",    sensitive: false },
  { key: "body_metrics", label: "Body metrics", def: "summary", sensitive: true,  note: "Progress photos very sensitive" },
];

const ACCESS_LEVELS = [
  { key: "full",    label: "full",    desc: "Coach sees every record in the module" },
  { key: "summary", label: "summary", desc: "Coach sees compliance score + trend only" },
  { key: "none",    label: "none",    desc: "Module is invisible to this coach" },
];

// Per-coach grants (client-controlled). granted_by is always the client.
const PERM_GRANTS = {
  "c-train": { training: "full", nutrition: "none",    recovery: "summary", supplements: "none",    medical: "none", goals: "full",    body_metrics: "summary" },
  "c-nutri": { training: "summary", nutrition: "full", recovery: "summary", supplements: "summary", medical: "none", goals: "full",    body_metrics: "summary" },
  "c-med":   { training: "summary", nutrition: "summary", recovery: "full", supplements: "full",    medical: "full", goals: "summary", body_metrics: "full" },
  "c-suppl": { training: "none",  nutrition: "summary",  recovery: "summary", supplements: "full",  medical: "none", goals: "summary", body_metrics: "none" },
};

const PERM_EXPIRY = {
  "c-med": { medical: "2026-12-31" },
};

// ── Consent log (GDPR) ──────────────────────────────────────
const CONSENT_LOG = [
  { ts: "2026-05-02 09:14", coach: "Dr. M. Kessler",   module: "medical",     from: "none",    to: "full",    action: "granted", by: "Tom (client)" },
  { ts: "2026-04-18 17:32", coach: "David Park",        module: "supplements", from: "summary", to: "full",    action: "granted", by: "Tom (client)" },
  { ts: "2026-03-11 08:02", coach: "Jana Bauer",        module: "body_metrics",from: "none",    to: "summary", action: "granted", by: "Tom (client)" },
  { ts: "2026-02-28 21:40", coach: "Anders Lindqvist",  module: "nutrition",   from: "summary", to: "none",    action: "revoked", by: "Tom (client)" },
  { ts: "2026-01-18 11:05", coach: "Jana Bauer",        module: "nutrition",   from: "none",    to: "full",    action: "granted", by: "Tom (client)" },
  { ts: "2024-09-12 14:22", coach: "Dr. M. Kessler",   module: "recovery",    from: "none",    to: "full",    action: "granted", by: "Tom (client)" },
  { ts: "2024-08-12 10:00", coach: "Anders Lindqvist",  module: "training",    from: "none",    to: "full",    action: "granted", by: "Tom (client)" },
];

// ── Proposals — coach is read-only, everything needs client confirmation ──
const PROPOSALS = [
  {
    id: "PR-014", coach: "Anders Lindqvist", coachId: "c-train", type: "Training routine",
    title: "Block 4 · Strength — 5 weeks", sent: "today 08:14", status: "pending",
    target: "Training → Routines",
    summary: "Transition from hypertrophy to strength. Volume −18%, intensity +8%. Bench moves to 5×3 @ 87%.",
    diff: [
      ["Weekly sets · chest", "16", "13"],
      ["Bench scheme", "5×5 @ 78%", "5×3 @ 87%"],
      ["Session length", "~74 min", "~66 min"],
      ["Deload week", "wk 5", "wk 5 (unchanged)"],
    ],
    requiresConfirm: true,
  },
  {
    id: "PR-013", coach: "Jana Bauer", coachId: "c-nutri", type: "Macro targets",
    title: "Cut phase · −250 kcal", sent: "yesterday 18:42", status: "pending",
    target: "Nutrition → Targets",
    summary: "Recomp is stalling at 79.4 kg. Small deficit for 3 weeks, protein held at 2.0 g/kg.",
    diff: [
      ["Calories", "2,700 kcal", "2,450 kcal"],
      ["Protein", "180 g", "180 g"],
      ["Carbs", "320 g", "258 g"],
      ["Fat", "90 g", "90 g"],
    ],
    requiresConfirm: true,
  },
  {
    id: "PR-012", coach: "David Park", coachId: "c-suppl", type: "Supplement stack",
    title: "Add L-Theanine 200 mg (evening)", sent: "Mon 09:32", status: "accepted",
    target: "Supplements → Stack",
    summary: "Pairs with your caffeine timing. Evidence B+, no interactions with the current stack.",
    diff: [["Stack items", "9", "10"], ["Evening slot", "2 items", "3 items"], ["Monthly cost", "€87.10", "€94.10"]],
    requiresConfirm: true, decidedOn: "Mon 19:08",
  },
  {
    id: "PR-011", coach: "Anders Lindqvist", coachId: "c-train", type: "Training routine",
    title: "Swap Cable Fly → Dumbbell Fly", sent: "May 8", status: "declined",
    target: "Training → Routines",
    summary: "Cable station is often occupied at your gym time.",
    diff: [["Push B exercise 3", "Cable Fly", "DB Fly"]],
    requiresConfirm: true, decidedOn: "May 8", declineReason: "Prefer the cable path of motion",
  },
];

// ── Autonomy from the client's perspective (SPEC_02 §6) ──────
const CLIENT_AUTONOMY = {
  level: 4,
  levelName: "Advanced",
  coach: "Anders Lindqvist",
  assignedAt: "2025-09-14",
  assignedBy: "Anders Lindqvist",
  reason: "12 weeks of consistent logging, self-corrected two deloads without prompting.",
  nextAssessment: "2026-06-15",
  regressionRisk: 0.12,
  checkInFrequency: "weekly",
  interventionThreshold: "significant_trends",
  planFlexibility: "flexible",
  scores: { consistency: 0.92, knowledge: 0.84, self_correction: 0.88, communication: 0.79, overall: 0.86 },
  history: [
    { date: "2025-09-14", from: 3, to: 4, type: "promotion", reason: "Consistent 12 weeks · self-managed deload" },
    { date: "2025-04-02", from: 2, to: 3, type: "promotion", reason: "Knowledge score crossed 0.75" },
    { date: "2024-08-12", from: null, to: 2, type: "initial",  reason: "Onboarding assessment" },
  ],
};

const AUTONOMY_LADDER = [
  { lvl: 1, name: "Novice",       cadence: "daily",     threshold: "any_deviation",      flex: "strict" },
  { lvl: 2, name: "Developing",   cadence: "weekly",    threshold: "any_deviation",      flex: "guided" },
  { lvl: 3, name: "Intermediate", cadence: "bi_weekly", threshold: "significant_trends", flex: "guided" },
  { lvl: 4, name: "Advanced",     cadence: "weekly",    threshold: "significant_trends", flex: "flexible" },
  { lvl: 5, name: "Expert",       cadence: "monthly",   threshold: "safety_only",        flex: "autonomous" },
];

// ── Check-in templates (SPEC_05 §1) ─────────────────────────
const CHECKIN_TEMPLATES = [
  { id: "weekly_standard", name: "Weekly standard", cadence: "Mondays 08:00", active: true, coach: "Anders Lindqvist",
    fields: ["Bodyweight", "Training adherence", "Energy 1–10", "Sleep quality 1–10", "Soreness map", "Free note"] },
  { id: "prep_intensive",  name: "Prep intensive",  cadence: "Mon + Thu",     active: false, coach: "—",
    fields: ["Bodyweight", "Waist", "Front/back photo", "Macro adherence", "Cardio minutes", "Hunger 1–10", "Free note"] },
  { id: "nutrition_only",  name: "Nutrition focus", cadence: "Wednesdays",    active: true, coach: "Jana Bauer",
    fields: ["Bodyweight", "Macro adherence", "Digestion 1–5", "Cravings 1–5", "Free note"] },
];

const CHECKIN_HISTORY = [
  { date: "May 12", template: "Weekly standard", status: "submitted", coach: "Anders Lindqvist", reply: "Solid week. Hold the plan." },
  { date: "May 14", template: "Nutrition focus", status: "submitted", coach: "Jana Bauer",       reply: "Carbs up 20 g on training days." },
  { date: "May 5",  template: "Weekly standard", status: "submitted", coach: "Anders Lindqvist", reply: "Bench felt heavy — drop to 115." },
  { date: "Apr 28", template: "Weekly standard", status: "missed",    coach: "Anders Lindqvist", reply: null },
];

// ════════════════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════════════════

const LEVEL_COLOR = { full: "var(--pos)", summary: "var(--warn)", none: "var(--fg-dim)" };

window.AthletePermissionsV2 = () => {
  const [grants, setGrants] = useState(PERM_GRANTS);
  const set = (coachId, mod, val) => setGrants(g => ({ ...g, [coachId]: { ...g[coachId], [mod]: val } }));
  const coaches = window.COACHES || [];

  return (
    <div className="col-gap" style={{gap: 14}}>
      {/* Contract banner */}
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="shield" className="ic" style={{color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>You own your data</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Coaches read only what you release, and they can never write to your modules — every plan arrives as a proposal you confirm.
            Grants are recorded with a timestamp and revocable at any time.
          </div>
        </div>
      </div>

      {/* Access level legend */}
      <div style={{display: "flex", gap: 8}}>
        {ACCESS_LEVELS.map(l => (
          <div key={l.key} style={{flex: 1, padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 3}}>
              <span className="dot" style={{background: LEVEL_COLOR[l.key], width: 7, height: 7}}/>
              <span className="mono" style={{fontSize: 11.5, fontWeight: 600}}>{l.label}</span>
            </div>
            <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{l.desc}</div>
          </div>
        ))}
      </div>

      {/* The matrix */}
      <Card title="Permission matrix" sub="7 modules × your coaches · you are the only one who can change these">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 200}}>Module</th>
              <th style={{width: 80}}>Default</th>
              {coaches.map(c => (
                <th key={c.id} style={{width: 120}}>
                  {c.name.split(" ").slice(-1)[0]}
                  <br/><span className="dim mono" style={{fontSize: 9}}>{c.type}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERM_MODULES.map(m => (
              <tr key={m.key}>
                <td>
                  <div style={{display: "flex", alignItems: "center", gap: 6}}>
                    <span style={{fontSize: 12.5}}>{m.label}</span>
                    {m.sensitive && <Pill style={{fontSize: 9, color: "var(--warn)", borderColor: "color-mix(in srgb, var(--warn) 30%, var(--border))"}}>sensitive</Pill>}
                  </div>
                  {m.note && <div className="dim" style={{fontSize: 10, marginTop: 2}}>{m.note}</div>}
                </td>
                <td>
                  <span className="mono" style={{fontSize: 10.5, color: LEVEL_COLOR[m.def]}}>{m.def}</span>
                </td>
                {coaches.map(c => {
                  const val = grants[c.id]?.[m.key] ?? "none";
                  const exp = PERM_EXPIRY[c.id]?.[m.key];
                  return (
                    <td key={c.id}>
                      <select
                        value={val}
                        onChange={e => set(c.id, m.key, e.target.value)}
                        style={{
                          width: "100%", height: 24, fontSize: 11, padding: "0 6px", borderRadius: 5,
                          background: "var(--surface)",
                          border: `1px solid ${val === "none" ? "var(--border)" : `color-mix(in srgb, ${LEVEL_COLOR[val]} 35%, var(--border))`}`,
                          color: LEVEL_COLOR[val],
                          fontFamily: "var(--font-mono)",
                        }}>
                        {ACCESS_LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                      </select>
                      {exp && <div className="dim mono" style={{fontSize: 9, marginTop: 2}}>expires {exp}</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divider"/>
        <div style={{display: "flex", gap: 6, alignItems: "center"}}>
          <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save grants</button>
          <button className="btn btn-ghost">Reset to defaults</button>
          <div className="spacer"/>
          <span className="dim mono" style={{fontSize: 10.5}}>every change writes a consent-log entry</span>
        </div>
      </Card>

      {/* Consent log */}
      <Card title="Consent log" sub={`${CONSENT_LOG.length} entries · GDPR record of every grant and revocation`}
        actions={<button className="btn btn-ghost btn-sm"><Icon name="download" className="ic ic-sm"/>Export</button>}>
        <table className="tbl">
          <thead><tr><th style={{width: 140}}>When</th><th style={{width: 160}}>Coach</th><th style={{width: 120}}>Module</th><th style={{width: 150}}>Change</th><th style={{width: 90}}>Action</th><th>Granted by</th></tr></thead>
          <tbody>
            {CONSENT_LOG.map((e, i) => (
              <tr key={i}>
                <td className="num muted" style={{fontSize: 11}}>{e.ts}</td>
                <td>{e.coach}</td>
                <td className="mono" style={{fontSize: 11}}>{e.module}</td>
                <td className="mono" style={{fontSize: 11}}>
                  <span style={{color: LEVEL_COLOR[e.from]}}>{e.from}</span>
                  <span className="dim"> → </span>
                  <span style={{color: LEVEL_COLOR[e.to]}}>{e.to}</span>
                </td>
                <td><Pill variant={e.action === "granted" ? "pos" : "block"}>{e.action}</Pill></td>
                <td className="muted" style={{fontSize: 11.5}}>{e.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── Proposal inbox ──────────────────────────────────────────
window.AthleteProposals = () => {
  const [sel, setSel] = useState(null);
  const pending = PROPOSALS.filter(p => p.status === "pending");
  const decided = PROPOSALS.filter(p => p.status !== "pending");
  return (
    <>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8, marginBottom: 14}}>
        <Icon name="edit" className="ic" style={{color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Coaches propose — you decide</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Nothing your coach sends changes a module until you accept it here. Declining is free and needs no reason.
          </div>
        </div>
        <div style={{textAlign: "right"}}>
          <div className="num" style={{fontSize: 20, color: "var(--warn)"}}>{pending.length}</div>
          <div className="dim" style={{fontSize: 10}}>awaiting you</div>
        </div>
      </div>

      <div className="eyebrow" style={{marginBottom: 8}}>Pending</div>
      <div className="col-gap" style={{gap: 8, marginBottom: 16}}>
        {pending.map(p => <ProposalCard key={p.id} p={p} onOpen={() => setSel(p)}/>)}
        {pending.length === 0 && <Empty title="Nothing to review" sub="Your coaches have no open proposals." icon="check"/>}
      </div>

      <div className="eyebrow" style={{marginBottom: 8}}>Decided</div>
      <Card>
        <table className="tbl">
          <thead><tr><th style={{width: 80}}>ID</th><th>Proposal</th><th style={{width: 150}}>Coach</th><th style={{width: 110}}>Decided</th><th style={{width: 100}}>Outcome</th></tr></thead>
          <tbody>
            {decided.map(p => (
              <tr key={p.id} className="clickable" style={{cursor: "pointer"}} onClick={() => setSel(p)}>
                <td className="num">{p.id}</td>
                <td>{p.title}</td>
                <td className="muted">{p.coach}</td>
                <td className="num muted">{p.decidedOn}</td>
                <td><Pill variant={p.status === "accepted" ? "pos" : "block"}>{p.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {sel && <ProposalModal p={sel} onClose={() => setSel(null)}/>}
    </>
  );
};

const ProposalCard = ({ p, onOpen }) => (
  <Card onClick={onOpen} style={{cursor: "pointer"}}>
    <div style={{display: "flex", gap: 12}}>
      <div style={{width: 3, alignSelf: "stretch", background: "var(--warn)", borderRadius: 2}}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
          <span className="mono dim" style={{fontSize: 10}}>{p.id}</span>
          <Pill>{p.type}</Pill>
          <Pill variant="warn">needs your confirmation</Pill>
          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{p.sent}</span>
        </div>
        <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4}}>{p.title}</div>
        <div className="muted" style={{fontSize: 12, lineHeight: 1.5, marginBottom: 8}}>{p.summary}</div>
        <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 11}}>
          <span className="dim">from</span><span>{p.coach}</span>
          <span className="dim">→</span><span className="mono" style={{fontSize: 10.5}}>{p.target}</span>
        </div>
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 6, justifyContent: "center"}}>
        <button className="btn btn-primary btn-sm" onClick={e => e.stopPropagation()}><Icon name="check" className="ic ic-sm"/>Accept</button>
        <button className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>Decline</button>
      </div>
    </div>
  </Card>
);

const ProposalModal = ({ p, onClose }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width: 660, maxHeight: "90vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-coach) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-coach) 35%, var(--border))", color: "var(--acc-coach)", display: "grid", placeItems: "center"}}>
          <Icon name="edit" className="ic"/>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{p.title}</div>
          <div className="dim" style={{fontSize: 11}}>{p.type} · from {p.coach} · {p.sent}</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY: "auto"}}>
        <div className="eyebrow" style={{marginBottom: 6}}>Why</div>
        <div style={{fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: 14}}>{p.summary}</div>

        <div className="eyebrow" style={{marginBottom: 6}}>What changes</div>
        <Card className="card-tight" style={{padding: 0, marginBottom: 14}}>
          <table className="tbl">
            <thead><tr><th>Field</th><th style={{width: 150}}>Current</th><th style={{width: 150}}>Proposed</th></tr></thead>
            <tbody>
              {p.diff.map((d, i) => (
                <tr key={i}>
                  <td style={{fontSize: 12}}>{d[0]}</td>
                  <td className="num muted">{d[1]}</td>
                  <td className="num" style={{color: d[1] === d[2] ? "var(--fg-dim)" : "var(--acc-coach)"}}>{d[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
          Applies to <span className="mono" style={{color: "var(--fg)"}}>{p.target}</span> on accept.
          Your coach cannot write this directly — read-only by contract.
        </div>

        {p.declineReason && (
          <div style={{marginTop: 12, padding: 10, background: "color-mix(in srgb, var(--neg) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 22%, var(--border))", borderRadius: 6, fontSize: 11.5}}>
            <span className="eyebrow" style={{color: "var(--neg)", display: "block", marginBottom: 3}}>Your reason</span>
            {p.declineReason}
          </div>
        )}
      </div>
      {p.status === "pending" && (
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Later</button>
          <button className="btn">Decline</button>
          <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Accept &amp; apply</button>
        </div>
      )}
    </div>
  </div>
);

// ── Autonomy · client side ──────────────────────────────────
window.AthleteAutonomy = () => {
  const a = CLIENT_AUTONOMY;
  const cur = AUTONOMY_LADDER.find(l => l.lvl === a.level);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card>
          <div style={{display: "flex", gap: 16, alignItems: "center", marginBottom: 14}}>
            <div style={{width: 56, height: 56, borderRadius: 999, background: "var(--acc-coach)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 24}}>{a.level}</div>
            <div style={{flex: 1}}>
              <div className="eyebrow" style={{color: "var(--acc-coach)", marginBottom: 4}}>Your autonomy level</div>
              <div style={{fontSize: 17, fontWeight: 600, marginBottom: 3}}>{a.levelName}</div>
              <div className="muted" style={{fontSize: 11.5}}>Set by {a.coach} on {a.assignedAt}</div>
            </div>
            <div style={{textAlign: "right"}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Next review</div>
              <div className="num" style={{fontSize: 14}}>{a.nextAssessment}</div>
            </div>
          </div>
          <div style={{padding: 12, background: "var(--surface-2)", borderRadius: 6, fontSize: 12, lineHeight: 1.55, color: "var(--fg-muted)", marginBottom: 14}}>
            {a.reason}
          </div>
          <div className="grid g-cols-3" style={{gap: 10}}>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Check-in cadence</div><div className="mono" style={{fontSize: 13, marginTop: 3}}>{cur.cadence}</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Coach steps in on</div><div className="mono" style={{fontSize: 12, marginTop: 3}}>{cur.threshold.replace(/_/g, " ")}</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Plan flexibility</div><div className="mono" style={{fontSize: 13, marginTop: 3}}>{cur.flex}</div></Card>
          </div>
        </Card>

        <Card title="The ladder" sub="what changes as you move up">
          <table className="tbl">
            <thead><tr><th style={{width: 40}}>Lvl</th><th style={{width: 130}}>Name</th><th style={{width: 110}}>Cadence</th><th>Coach intervenes on</th><th style={{width: 110}}>Flexibility</th></tr></thead>
            <tbody>
              {AUTONOMY_LADDER.map(l => (
                <tr key={l.lvl} style={l.lvl === a.level ? {background: "color-mix(in srgb, var(--acc-coach) 8%, transparent)"} : undefined}>
                  <td className="num" style={{color: l.lvl === a.level ? "var(--acc-coach)" : undefined, fontWeight: l.lvl === a.level ? 600 : 400}}>{l.lvl}</td>
                  <td style={{fontWeight: l.lvl === a.level ? 600 : 400}}>{l.name}{l.lvl === a.level && <Pill variant="acc" style={{marginLeft: 6}}>you</Pill>}</td>
                  <td className="mono muted" style={{fontSize: 11}}>{l.cadence}</td>
                  <td className="mono muted" style={{fontSize: 11}}>{l.threshold.replace(/_/g, " ")}</td>
                  <td className="mono muted" style={{fontSize: 11}}>{l.flex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="History" sub={`${a.history.length} changes`}>
          <div className="col-gap" style={{gap: 0}}>
            {a.history.map((h, i) => (
              <div key={i} className="row" style={{fontSize: 12}}>
                <span className="row-l">
                  <span className="num dim" style={{fontSize: 10, width: 78}}>{h.date}</span>
                  <Pill variant={h.type === "promotion" ? "pos" : h.type === "demotion" ? "block" : ""}>{h.type}</Pill>
                  <span className="mono" style={{fontSize: 11}}>{h.from ?? "—"} → {h.to}</span>
                </span>
                <span className="row-r muted" style={{fontSize: 11, fontFamily: "var(--font-sans)"}}>{h.reason}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Assessment scores" sub="how your coach rates the four criteria">
          <div className="col-gap" style={{gap: 10}}>
            {[
              ["Consistency",     a.scores.consistency],
              ["Knowledge",       a.scores.knowledge],
              ["Self-correction", a.scores.self_correction],
              ["Communication",   a.scores.communication],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11.5}}>
                  <span className="muted">{k}</span>
                  <span className="num">{(v * 100).toFixed(0)}</span>
                </div>
                <Meter value={v * 100} color={v >= 0.85 ? "var(--pos)" : v >= 0.7 ? "var(--warn)" : "var(--neg)"}/>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
            <span className="eyebrow">Overall</span>
            <span className="num" style={{fontSize: 20, color: "var(--acc-coach)"}}>{(a.scores.overall * 100).toFixed(0)}</span>
          </div>
          <div className="divider"/>
          <Row label="Regression risk" value={`${(a.regressionRisk * 100).toFixed(0)}%`}/>
          <Row label="Assigned by" value={a.assignedBy}/>
        </Card>

        <Card title="What this means" sub="in practice">
          <div className="col-gap" style={{gap: 8, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
            <div style={{padding: 10, background: "var(--surface)", borderRadius: 6}}>
              Your coach reviews weekly rather than daily, and only messages you when a trend — not a single day — moves the wrong way.
            </div>
            <div style={{padding: 10, background: "var(--surface)", borderRadius: 6}}>
              You may deviate from the plan without asking, as long as you log why. Level 5 removes the logging requirement.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Check-ins ───────────────────────────────────────────────
window.AthleteCheckins = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Templates" sub={`${CHECKIN_TEMPLATES.filter(t => t.active).length} active`}>
        <div className="col-gap" style={{gap: 8}}>
          {CHECKIN_TEMPLATES.map(t => (
            <div key={t.id} style={{
              padding: 12, borderRadius: 7,
              background: t.active ? "color-mix(in srgb, var(--acc-coach) 6%, var(--surface))" : "var(--surface)",
              border: `1px solid ${t.active ? "color-mix(in srgb, var(--acc-coach) 28%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                <span style={{fontSize: 13, fontWeight: 600}}>{t.name}</span>
                {t.active ? <Pill variant="pos" dot>active</Pill> : <Pill>inactive</Pill>}
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{t.cadence}</span>
              </div>
              <div className="muted" style={{fontSize: 11, marginBottom: 8}}>Assigned by {t.coach}</div>
              <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                {t.fields.map(f => <Pill key={f} style={{fontSize: 9.5}}>{f}</Pill>)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="History" sub={`${CHECKIN_HISTORY.length} check-ins`}>
        <table className="tbl">
          <thead><tr><th style={{width: 80}}>Date</th><th style={{width: 150}}>Template</th><th style={{width: 100}}>Status</th><th>Coach reply</th></tr></thead>
          <tbody>
            {CHECKIN_HISTORY.map((h, i) => (
              <tr key={i}>
                <td className="num muted">{h.date}</td>
                <td>{h.template}</td>
                <td><Pill variant={h.status === "submitted" ? "pos" : "block"}>{h.status}</Pill></td>
                <td className="muted" style={{fontSize: 11.5}}>{h.reply || <span className="dim">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>

    <Card title="Next check-in" sub="Monday · Weekly standard">
      <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12}}>
        <span className="num" style={{fontSize: 26, fontWeight: 500}}>2</span>
        <span className="dim" style={{fontSize: 12}}>days · Mon 08:00</span>
      </div>
      <div className="eyebrow" style={{marginBottom: 8}}>You'll be asked for</div>
      <div className="col-gap" style={{gap: 4}}>
        {CHECKIN_TEMPLATES[0].fields.map(f => (
          <div key={f} style={{display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
            <span style={{width: 5, height: 5, borderRadius: 999, background: "var(--fg-dim)"}}/>
            {f}
          </div>
        ))}
      </div>
      <div className="divider"/>
      <button className="btn btn-primary" style={{width: "100%"}}><Icon name="edit" className="ic ic-sm"/>Fill in early</button>
    </Card>
  </div>
);

Object.assign(window, { PERM_MODULES, ACCESS_LEVELS, PERM_GRANTS, CONSENT_LOG, PROPOSALS, CLIENT_AUTONOMY, AUTONOMY_LADDER, CHECKIN_TEMPLATES });
