// Human Coaches · relationship metadata, rating, onboarding wizard
// Ref: HumanCoach SPEC_02 §1/§2, SPEC_05 §1

const COACH_META = {
  "c-train": { assignment: "primary",   style: "hands_on",      role: "head_coach",    certs: ["NSCA-CSCS", "NASM-PES"],      years: 12, rated: 5, maxClients: 20, current: 14 },
  "c-nutri": { assignment: "primary",   style: "collaborative", role: "senior_coach",  certs: ["DGE", "PN1", "ISSN"],          years: 8,  rated: 4, maxClients: 30, current: 22 },
  "c-med":   { assignment: "secondary", style: "consultative",  role: "coach",         certs: ["Facharzt Endokrinologie"],     years: 18, rated: 5, maxClients: 40, current: 31 },
  "c-suppl": { assignment: "temporary", style: "consultative",  style2: null, role: "coach", certs: ["ISSN-SNS"],             years: 6,  rated: 4, maxClients: 60, current: 44 },
};

const ASSIGNMENT_DESC = {
  primary:   "Owns the plan for their domain. First point of contact.",
  secondary: "Advises alongside a primary coach. No plan ownership.",
  temporary: "Time-boxed engagement — ends without renewal.",
};
const STYLE_DESC = {
  hands_on:      "Prescribes and checks. Expects the plan followed as written.",
  collaborative: "Proposes and negotiates. Your input shapes the plan.",
  consultative:  "Answers when asked. You drive, they advise.",
};
const ROLE_LABEL = { trainee_coach: "Trainee", coach: "Coach", senior_coach: "Senior Coach", head_coach: "Head Coach" };

window.CoachRelationshipCard = ({ coach }) => {
  const m = COACH_META[coach.id];
  const [rating, setRating] = useState(m?.rated ?? 0);
  if (!m) return null;
  return (
    <div className="col-gap" style={{gap: 12}}>
      <div className="grid g-cols-3" style={{gap: 10}}>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Assignment</div>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 3, textTransform: "capitalize"}}>{m.assignment}</div>
          <div className="muted" style={{fontSize: 10.5, lineHeight: 1.45}}>{ASSIGNMENT_DESC[m.assignment]}</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Coaching style</div>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 3}}>{m.style.replace("_", "-")}</div>
          <div className="muted" style={{fontSize: 10.5, lineHeight: 1.45}}>{STYLE_DESC[m.style]}</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Role &amp; roster</div>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 3}}>{ROLE_LABEL[m.role]}</div>
          <div className="muted mono" style={{fontSize: 10.5}}>{m.current} of {m.maxClients} clients · {m.years} yr</div>
        </Card>
      </div>

      <Card className="card-tight" style={{padding: 12}}>
        <div className="eyebrow" style={{marginBottom: 6}}>Certifications</div>
        <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
          {m.certs.map(c => <Pill key={c}>{c}</Pill>)}
        </div>
      </Card>

      <Card className="card-tight" style={{padding: 12}}>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <div style={{flex: 1}}>
            <div className="eyebrow" style={{marginBottom: 3}}>Your rating</div>
            <div className="muted" style={{fontSize: 11}}>Only aggregated averages are shown to the coach.</div>
          </div>
          <div style={{display: "flex", gap: 3}}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                width: 26, height: 26, borderRadius: 5, cursor: "pointer",
                background: n <= rating ? "color-mix(in srgb, var(--acc-goals) 20%, transparent)" : "var(--surface-2)",
                border: `1px solid ${n <= rating ? "color-mix(in srgb, var(--acc-goals) 40%, var(--border))" : "var(--border)"}`,
                color: n <= rating ? "var(--acc-goals)" : "var(--fg-dim)", fontSize: 13,
              }}>★</button>
            ))}
          </div>
          <span className="num" style={{width: 28, textAlign: "right", fontSize: 13}}>{rating}.0</span>
        </div>
      </Card>
    </div>
  );
};

// ── Coach onboarding wizard (SPEC_05 §1, five steps) ─────────
const ONBOARD_STEPS = [
  { n: 1, title: "Invite accepted",  desc: "Coach sends a link or QR. You register and pick permissions.",
    detail: ["Invite link or QR code", "Account created or matched", "Initial permission grants"] },
  { n: 2, title: "Profile review",   desc: "Coach reads your onboarding data and sets a starting autonomy level.",
    detail: ["Goals, injuries, diet reviewed", "Initial autonomy — default level 2", "Tags applied: intermediate · male"] },
  { n: 3, title: "Plan created",     desc: "Training routine, macro targets and supplement stack — all as proposals.",
    detail: ["Routine from library or new", "Calorie target from goal and TDEE", "Stack assembled from catalog"] },
  { n: 4, title: "Rules activated",  desc: "System rules run by default. Coach enables the custom ones.",
    detail: ["10 system templates active", "Custom rules for your client type", "Alert thresholds set"] },
  { n: 5, title: "Check-in scheduled", desc: "A template is chosen and starts on the next Monday.",
    detail: ["weekly_standard or prep_intensive", "First check-in next Monday", "Cadence follows autonomy level"] },
];

window.CoachOnboardingWizard = () => {
  const [step, setStep] = useState(2);
  const s = ONBOARD_STEPS[step - 1];
  return (
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="user" className="ic" style={{color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Starting with a new coach</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Thirty to sixty minutes, once. Nothing is written to your modules until you accept each proposal in step three.
          </div>
        </div>
      </div>

      <Card>
        <div style={{display: "flex", gap: 6, marginBottom: 16}}>
          {ONBOARD_STEPS.map(x => (
            <React.Fragment key={x.n}>
              <button onClick={() => setStep(x.n)} style={{
                flex: 1, padding: "10px 8px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                background: step === x.n ? "color-mix(in srgb, var(--acc-coach) 12%, var(--surface))" : x.n < step ? "color-mix(in srgb, var(--pos) 6%, var(--surface))" : "var(--surface)",
                border: `1px solid ${step === x.n ? "color-mix(in srgb, var(--acc-coach) 38%, var(--border))" : "var(--border)"}`,
              }}>
                <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 3}}>
                  <div style={{width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 600,
                    background: x.n < step ? "var(--pos)" : step === x.n ? "var(--acc-coach)" : "var(--surface-2)",
                    color: x.n <= step ? "var(--bg)" : "var(--fg-dim)"}}>{x.n < step ? "✓" : x.n}</div>
                  <span style={{fontSize: 11.5, fontWeight: 600, color: step === x.n ? "var(--acc-coach)" : "var(--fg)"}}>{x.title}</span>
                </div>
              </button>
              {x.n < 5 && <div style={{alignSelf: "center", color: "var(--fg-dim)", fontSize: 11}}>→</div>}
            </React.Fragment>
          ))}
        </div>

        <div style={{padding: 16, background: "var(--surface-2)", borderRadius: 7}}>
          <div style={{fontSize: 15, fontWeight: 600, marginBottom: 6}}>Step {s.n} · {s.title}</div>
          <div className="muted" style={{fontSize: 12.5, lineHeight: 1.55, marginBottom: 12}}>{s.desc}</div>
          <div className="col-gap" style={{gap: 5}}>
            {s.detail.map((d, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
                <Icon name="check" className="ic ic-sm" style={{color: step > s.n ? "var(--pos)" : "var(--fg-dim)"}}/>
                {d}
              </div>
            ))}
          </div>
        </div>

        <div style={{display: "flex", gap: 6, marginTop: 14, justifyContent: "flex-end"}}>
          <button className="btn btn-ghost" disabled={step === 1} onClick={() => setStep(x => Math.max(1, x - 1))}>Back</button>
          <button className="btn btn-primary" disabled={step === 5} onClick={() => setStep(x => Math.min(5, x + 1))}>Next step →</button>
        </div>
      </Card>
    </div>
  );
};

// ── Coach-level overrides on Buddy (Buddy SPEC_01 §3) ────────
const COACH_OVERRIDES = [
  { coach: "Anders Lindqvist", type: "Training", field: "autonomy_level",           yours: "L3 · collaborative", theirs: "L2 · cautious", active: true,
    why: "During block 4 peaking he wants confirmation before Buddy changes anything training-related." },
  { coach: "Anders Lindqvist", type: "Training", field: "max_intervention_intensity", yours: "0.8", theirs: "0.6", active: true,
    why: "No confrontational tone during a peaking block." },
  { coach: "Dr. M. Kessler",   type: "Medical",  field: "blocked_rules",             yours: "—", theirs: "supplement_suggestion_on_labs", active: true,
    why: "Buddy must never propose a supplement in response to a lab value. Hard block, not a preference." },
  { coach: "Jana Bauer",       type: "Nutrition",field: "custom_rule",               yours: "—", theirs: "protein_reminder_at_18:00", active: false,
    why: "Offered but not accepted by you — Buddy does not run it." },
];

window.BuddyCoachOverrides = () => (
  <div className="col-gap" style={{gap: 14}}>
    <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 8}}>
      <Icon name="coach" className="ic" style={{color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
      <div style={{flex: 1}}>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>What your coaches changed about me</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
          A coach can tighten my behaviour for their domain — never loosen it past your own settings, and never past the nine safety rules.
          Everything they set is listed here.
        </div>
      </div>
    </div>
    <Card>
      <table className="tbl">
        <thead><tr><th style={{width: 160}}>Coach</th><th style={{width: 100}}>Domain</th><th style={{width: 210}}>Setting</th><th style={{width: 130}}>Yours</th><th style={{width: 150}}>Their override</th><th style={{width: 70}}>Active</th></tr></thead>
        <tbody>
          {COACH_OVERRIDES.map((o, i) => (
            <tr key={i} style={{opacity: o.active ? 1 : 0.55}}>
              <td>{o.coach}</td>
              <td><Pill>{o.type}</Pill></td>
              <td>
                <div className="mono" style={{fontSize: 11}}>{o.field}</div>
                <div className="muted" style={{fontSize: 10.5, marginTop: 2, lineHeight: 1.4}}>{o.why}</div>
              </td>
              <td className="mono muted" style={{fontSize: 11}}>{o.yours}</td>
              <td className="mono" style={{fontSize: 11, color: "var(--acc-coach)"}}>{o.theirs}</td>
              <td>{o.active ? <Pill variant="acc">on</Pill> : <Pill>declined</Pill>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider"/>
      <div className="muted" style={{fontSize: 11, lineHeight: 1.5}}>
        You can decline any override. Medical blocks are the exception — those come from the safety layer, not from Dr. Kessler personally.
      </div>
    </Card>
  </div>
);

Object.assign(window, { COACH_META, ONBOARD_STEPS, COACH_OVERRIDES });
