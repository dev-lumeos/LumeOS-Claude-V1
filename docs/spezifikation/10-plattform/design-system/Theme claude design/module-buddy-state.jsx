// AI Coach — state, events, decisions, interventions, BSS, preferences
// SPEC_02 entities 2–8

// ── BuddyState · six state blocks ────────────────────
const BS_SCORES = [
  { k: "training",  v: 88, c: "var(--acc-train)" },
  { k: "nutrition", v: 84, c: "var(--acc-nutri)" },
  { k: "recovery",  v: 78, c: "var(--acc-recov)" },
  { k: "adherence", v: 91, c: "var(--acc-coach)" },
  { k: "risk",      v: 18, c: "var(--warn)", inverse: true },
];

const BS_BLOCKS = [
  { key: "training_state", color: "var(--acc-train)", fields: [
    ["sessions_7d", "5"], ["volume_week", "31.4 t"], ["streak", "23 days"],
    ["missed_workouts_7d", "0"], ["heavy_training_day_flag", "true"], ["last_session", "today 07:14"] ]},
  { key: "nutrition_state", color: "var(--acc-nutri)", fields: [
    ["calories_today", "1,847"], ["protein_today", "142 g"], ["protein_target", "182 g"],
    ["meals_today", "3"], ["gaps", "vitamin_d, omega3"], ["water_ml", "2,400"] ]},
  { key: "recovery_state", color: "var(--acc-recov)", fields: [
    ["sleep_hours", "7.4"], ["sleep_score", "81"], ["hrv_score", "62"],
    ["fatigue_score", "34"], ["bad_sleep_days_consecutive", "0"], ["resting_hr", "52"] ]},
  { key: "body_state", color: "var(--acc-goals)", fields: [
    ["bodyweight", "79.4 kg"], ["weight_trend_7d", "−0.3 kg"], ["rapid_change_flag", "false"],
    ["body_fat_pct", "13.8"], ["lean_mass", "68.4 kg"], ["last_measured", "today 06:52"] ]},
  { key: "behavior_state", color: "var(--acc-buddy)", fields: [
    ["logging_consistency", "0.94"], ["plan_rejection_rate", "0.08"], ["adherence", "0.91"],
    ["response_rate", "0.86"], ["avg_response_hours", "3.2"], ["session_count_30d", "142"] ]},
  { key: "safety_state", color: "var(--neg)", fields: [
    ["pain_flags", "none"], ["dizziness", "false"], ["medical_flags", "trt_active"],
    ["supplement_interaction_critical", "false"], ["escalation_required", "false"], ["last_screened", "today 14:22"] ]},
];

window.AIStateView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <Card title="Daily scores" sub="recomputed on every event · algorithm v1.0">
      <div className="grid g-cols-5" style={{ gap: 12 }}>
        {BS_SCORES.map(s => (
          <div key={s.k} style={{ textAlign: "center" }}>
            {window.Ring && <window.Ring value={s.v} max={100} size={82} stroke={7} color={s.c} label="" />}
            <div style={{ fontSize: 11.5, fontWeight: 500, marginTop: 7, textTransform: "capitalize" }}>{s.k}</div>
            {s.inverse && <div className="dim mono" style={{ fontSize: 9.5 }}>lower is better</div>}
          </div>
        ))}
      </div>
    </Card>

    <div className="grid g-cols-3" style={{ gap: 12 }}>
      {BS_BLOCKS.map(b => (
        <Card key={b.key} style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: b.color, opacity: 0.65 }} />
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, marginBottom: 9, color: b.color }}>{b.key}</div>
          <div className="col-gap" style={{ gap: 0 }}>
            {b.fields.map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "5px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 55%, transparent)" }}>
                <span className="dim mono" style={{ fontSize: 10, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k}</span>
                <span className="num" style={{ fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>

    <Card title="Rebuild capability" sub="state is derived, never authoritative">
      <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
        Every value above is computed from the event log. Nothing is written to state directly. If the state table were dropped, a full replay of 4,821 events would reproduce it exactly — which is what makes the numbers auditable rather than merely plausible.
      </div>
      <div className="divider" />
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-sm"><Icon name="refresh" className="ic ic-sm" />Replay from events</button>
        <button className="btn btn-sm btn-ghost">Export snapshot JSON</button>
      </div>
    </Card>
  </div>
);

// ── BuddyEvents · append-only ────────────────────────
const BE_EVENTS = [
  { id: "ev_9f2a", type: "set_logged",       src: "training",    at: "14:22:08", sync: "synced",       payload: "exercise=bench_press · weight=117.5 · reps=5 · rpe=8" },
  { id: "ev_9f29", type: "workout_started",  src: "training",    at: "14:04:12", sync: "synced",       payload: "routine=push_b · planned_sets=18" },
  { id: "ev_9f28", type: "meal_logged",      src: "nutrition",   at: "12:41:33", sync: "synced",       payload: "foods=[chicken_breast:200g, rice:150g] · kcal=612 · protein=58" },
  { id: "ev_9f27", type: "supplement_taken", src: "supplements", at: "12:02:51", sync: "synced",       payload: "supplement=creatine · dose=5g" },
  { id: "ev_9f26", type: "wearable_sync",    src: "recovery",    at: "07:31:04", sync: "synced",       payload: "device=garmin · hrv=62 · sleep=7.4h · rhr=52" },
  { id: "ev_9f25", type: "bodyweight_logged",src: "goals",       at: "06:52:19", sync: "synced",       payload: "weight_kg=79.4 · method=scale" },
  { id: "ev_9f24", type: "recovery_checkin", src: "recovery",    at: "06:48:02", sync: "synced",       payload: "energy=7 · soreness=3 · mood=8 · motivation=8" },
  { id: "ev_9f23", type: "set_logged",       src: "training",    at: "yesterday", sync: "pending_sync",payload: "exercise=deadlift · weight=180 · reps=3 · rpe=9" },
];

const BE_TYPES = ["meal_logged","workout_started","workout_completed","set_logged","supplement_taken","sleep_logged","bodyweight_logged","blood_test_imported","recovery_checkin","note_added","wearable_sync","check_in"];

window.AIEventsView = () => {
  const [f, setF] = useState("all");
  const rows = f === "all" ? BE_EVENTS : BE_EVENTS.filter(e => e.src === f);
  const syncCol = { synced: "var(--pos)", pending_sync: "var(--warn)", local_only: "var(--acc-recov)", failed: "var(--neg)", superseded: "var(--fg-dim)" };
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {[["Events total", "4,821"], ["Today", "8"], ["Pending sync", "1"], ["Event types", BE_TYPES.length]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{ padding: 13 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
          </Card>
        ))}
      </div>

      <Card title="Event log" sub="append-only · idempotency key per write · nothing is ever updated in place"
        actions={
          <select value={f} onChange={e => setF(e.target.value)} style={{ height: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11 }}>
            {["all","training","nutrition","recovery","supplements","goals"].map(o => <option key={o} value={o}>{o === "all" ? "All engines" : o}</option>)}
          </select>
        }>
        <table className="tbl">
          <thead><tr><th style={{ width: 80 }}>ID</th><th style={{ width: 80 }}>Time</th><th style={{ width: 150 }}>Type</th><th style={{ width: 100 }}>Engine</th><th>Payload</th><th style={{ width: 110 }}>Sync</th></tr></thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id}>
                <td className="mono dim" style={{ fontSize: 10 }}>{e.id}</td>
                <td className="num muted" style={{ fontSize: 10.5 }}>{e.at}</td>
                <td className="mono" style={{ fontSize: 11 }}>{e.type}</td>
                <td className="muted" style={{ fontSize: 11 }}>{e.src}</td>
                <td className="dim mono" style={{ fontSize: 10 }}>{e.payload}</td>
                <td><Pill style={{ color: syncCol[e.sync], borderColor: `color-mix(in srgb, ${syncCol[e.sync]} 30%, var(--border))` }}>{e.sync}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Event types" sub="12 defined · every user action lands as one of these">
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {BE_TYPES.map(t => <Pill key={t} className="mono" style={{ fontSize: 10 }}>{t}</Pill>)}
        </div>
      </Card>
    </div>
  );
};

// ── BuddyDecisions ───────────────────────────────────
const BD_DECISIONS = [
  { id: "dc_44a1", at: "14:22", rule: "recovery_training_conflict", type: "recovery_alert", conf: 0.88,
    short: "Recovery is fine for the planned load",
    detail: "Recovery 78 against a heavy push day. Above the 65 intervention floor, so no warning issued and the session stands as planned.",
    engine: "recovery.score=78 · training.heavy_day=true · threshold=65" },
  { id: "dc_44a0", at: "12:41", rule: "protein_pace_check", type: "nutrition_reminder", conf: 0.74,
    short: "Protein pace behind for the hour",
    detail: "142 g at 12:41 against a 182 g target. Historical pace at this hour is 96 g, so you are ahead of your own baseline — logged, not surfaced.",
    engine: "nutrition.protein=142 · target=182 · hour_baseline=96" },
  { id: "dc_449f", at: "06:48", rule: "morning_briefing_tone", type: "motivation", conf: 0.91,
    short: "Push tone selected for morning brief",
    detail: "Check-in energy 7, motivation 8, recovery 78. All three above the encouragement threshold, so the brief used direct framing rather than soft.",
    engine: "checkin.energy=7 · checkin.motivation=8 · recovery=78" },
  { id: "dc_449e", at: "yesterday", rule: "supplement_interaction_scan", type: "supplement_reminder", conf: 0.96,
    short: "No interaction conflict in evening stack",
    detail: "Magnesium and zinc within the 2-hour separation rule. Iron absent from the evening stack, so no competing binding.",
    engine: "supplements.evening=[mg, zn, omega3] · rules_checked=14" },
];

window.AIDecisionsView = () => (
  <div className="col-gap" style={{ gap: 14 }}>
    <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8 }}>
      <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
        Every rule evaluation is recorded, including the ones that decided to say nothing. Silence is a decision with a reason, and it is written down the same way an alert is.
      </div>
    </div>
    <div className="col-gap" style={{ gap: 10 }}>
      {BD_DECISIONS.map(d => (
        <Card key={d.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
            <span className="mono dim" style={{ fontSize: 10 }}>{d.id}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{d.short}</span>
            <Pill>{d.type}</Pill>
            <span className="num dim" style={{ fontSize: 10 }}>conf {d.conf}</span>
            <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{d.at}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 8 }}>{d.detail}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface-2)", borderRadius: 5 }}>
            <span className="dim mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>rule</span>
            <span className="mono" style={{ fontSize: 10.5 }}>{d.rule}</span>
            <span className="dim mono" style={{ fontSize: 10, marginLeft: "auto" }}>{d.engine}</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ── InterventionLog ──────────────────────────────────
const IL_LOG = [
  { at: "2026-09-05", bucket: "high_stress__missed_workout", type: "encouragement", tone: "soft",
    content: "Acknowledged the week, offered a shortened session instead of the full plan.",
    scored: 4, selected: "soft encouragement", backup: "silence",
    reason: "Direct tone scored lower — last two confrontational messages were ignored.",
    expected: "resumes training within 48 h", observed: "engaged", eff: 0.82 },
  { at: "2026-08-28", bucket: "protein_shortfall__weekend", type: "adjustment", tone: "analytical",
    content: "Showed the Saturday-versus-weekday protein gap as a number, proposed one added shake.",
    scored: 3, selected: "analytical adjustment", backup: "humorous",
    reason: "Scientist persona active. Data framing matched stated preference.",
    expected: "weekend protein above 150 g", observed: "accepted", eff: 0.71 },
  { at: "2026-08-19", bucket: "plateau__high_adherence", type: "confrontation", tone: "tough_love",
    content: "Named the stall directly and put the intensity question on the table.",
    scored: 5, selected: "tough love", backup: "analytical",
    reason: "Adherence was 96 %, so effort was not the issue. Softening would have obscured the point.",
    expected: "accepts intensity change", observed: "accepted", eff: 0.94 },
  { at: "2026-08-11", bucket: "low_sleep__high_rpe", type: "redirect", tone: "direct",
    content: "Redirected from the planned PR attempt to a technique session.",
    scored: 4, selected: "direct redirect", backup: "soft",
    reason: "Safety-adjacent. Softening risked the message being read as optional.",
    expected: "defers PR attempt", observed: "accepted", eff: 0.88 },
  { at: "2026-08-02", bucket: "streak_milestone", type: "silence", tone: "—",
    content: "No message sent.",
    scored: 3, selected: "silence", backup: "encouragement",
    reason: "Three messages already sent that day. Congratulating a streak did not justify a fourth.",
    expected: "no fatigue", observed: "ignored", eff: null },
];

const IL_TONES = ["direct", "soft", "humorous", "analytical", "tough_love"];
const IL_TYPES = ["confrontation", "encouragement", "adjustment", "redirect", "silence"];

window.AIInterventionView = () => {
  const withEff = IL_LOG.filter(l => l.eff != null);
  const avg = (withEff.reduce((s, l) => s + l.eff, 0) / withEff.length * 100).toFixed(0);
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {[["Interventions · 90d", "34"], ["Avg effectiveness", avg + " %"], ["Silence chosen", "6 times"], ["Tone variants", IL_TONES.length]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{ padding: 13 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
          </Card>
        ))}
      </div>

      <div className="grid g-cols-2" style={{ gap: 12 }}>
        <Card title="Intervention types" sub="silence is a first-class option">
          {IL_TYPES.map(t => {
            const n = IL_LOG.filter(l => l.type === t).length;
            return (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "110px 1fr 30px", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 11 }}>{t}</span>
                {window.Meter && <window.Meter value={n} max={IL_LOG.length} color="var(--acc-buddy)" />}
                <span className="num dim" style={{ textAlign: "right", fontSize: 11 }}>{n}</span>
              </div>
            );
          })}
        </Card>
        <Card title="Tone effectiveness" sub="observed outcome per variant">
          {[["tough_love", 94], ["direct", 88], ["soft", 82], ["analytical", 71], ["humorous", 58]].map(([t, e]) => (
            <div key={t} style={{ display: "grid", gridTemplateColumns: "110px 1fr 40px", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 11 }}>{t}</span>
              {window.Meter && <window.Meter value={e} color={e >= 85 ? "var(--pos)" : e >= 70 ? "var(--acc-recov)" : "var(--warn)"} />}
              <span className="num" style={{ textAlign: "right", fontSize: 11 }}>{e} %</span>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Selection log" sub="which variant was chosen, and what it beat">
        <div className="col-gap" style={{ gap: 10 }}>
          {IL_LOG.map((l, i) => {
            const oc = l.observed === "accepted" || l.observed === "engaged" ? "var(--pos)" : l.observed === "rejected" ? "var(--neg)" : "var(--fg-dim)";
            return (
              <div key={i} style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span className="num dim" style={{ fontSize: 10 }}>{l.at}</span>
                  <Pill className="mono" style={{ fontSize: 9.5 }}>{l.bucket}</Pill>
                  <Pill>{l.type}</Pill>
                  {l.tone !== "—" && <Pill style={{ color: "var(--acc-buddy)", borderColor: "color-mix(in srgb, var(--acc-buddy) 30%, var(--border))" }}>{l.tone}</Pill>}
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                    <Pill style={{ color: oc, borderColor: `color-mix(in srgb, ${oc} 30%, var(--border))` }}>{l.observed}</Pill>
                    {l.eff != null && <span className="num" style={{ fontSize: 11, color: oc }}>{(l.eff * 100).toFixed(0)} %</span>}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 7 }}>{l.content}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 10.5 }}>
                  <div style={{ padding: "6px 9px", background: "var(--surface-2)", borderRadius: 5 }}>
                    <span className="dim mono" style={{ fontSize: 9.5 }}>candidates scored </span>
                    <span className="num">{l.scored}</span>
                    <span className="dim"> · backup was </span>
                    <span className="mono">{l.backup}</span>
                  </div>
                  <div style={{ padding: "6px 9px", background: "var(--surface-2)", borderRadius: 5 }} className="muted">{l.reason}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ── BSS · Behaviour Stability Score ──────────────────
const BSS_STABILITY = [
  { k: "training_consistency",         v: 92, note: "5 of 5 planned sessions, 12 weeks running" },
  { k: "nutrition_adherence_stability",v: 78, note: "Weekday strong, weekend variance drags it" },
  { k: "recovery_stability",           v: 84, note: "Sleep window has held within ±40 min" },
  { k: "dropout_events",               v: 88, note: "2 events in 90 days, both single-day" },
  { k: "bounceback_time",              v: 95, note: "Average 1.1 days back to plan after a miss" },
];

const BSS_ALIGNMENT = [
  { k: "training",   target: "5 / week",    actual: "4.8 / week",  score: 96 },
  { k: "nutrition",  target: "protein 85 %",actual: "79 % hit rate",score: 93 },
  { k: "calories",   target: "±150 kcal",   actual: "±210 kcal",   score: 71 },
  { k: "body_comp",  target: "78 kg @ 12 %",actual: "on track",    score: 88 },
];

const BSS_HISTORY = [64, 66, 63, 68, 71, 70, 74, 76, 75, 79, 82, 84];

window.AIBSSView = () => {
  const stab = Math.round(BSS_STABILITY.reduce((s, x) => s + x.v, 0) / BSS_STABILITY.length);
  const alig = Math.round(BSS_ALIGNMENT.reduce((s, x) => s + x.score, 0) / BSS_ALIGNMENT.length);
  const total = Math.round(stab * 0.6 + alig * 0.4);
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {window.Ring && <window.Ring value={total} max={100} size={116} stroke={10} color="var(--acc-buddy)" label="BSS" />}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Behaviour Stability Score</span>
              <Pill variant="pos">improving · +6 vs prior period</Pill>
            </div>
            <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 11 }}>
              Rolling 90 days. Sixty percent stability, forty percent goal alignment. It measures whether your behaviour is reliable enough to plan around — not whether you are working hard.
            </div>
            <div className="dim mono" style={{ fontSize: 10.5 }}>bss = stability × 0.6 + alignment × 0.4 · {stab} × 0.6 + {alig} × 0.4 = {total}</div>
          </div>
          <div style={{ width: 170 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>12-month trend</div>
            {window.Sparkline && <window.Sparkline data={BSS_HISTORY} color="var(--acc-buddy)" h={44} />}
          </div>
        </div>
      </Card>

      <div className="grid g-cols-2" style={{ gap: 12 }}>
        <Card title="Stability" sub={`${stab} / 100 · weighted 60 %`}>
          {BSS_STABILITY.map(s => (
            <div key={s.k} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 10.5, flex: 1 }}>{s.k}</span>
                <span className="num" style={{ fontSize: 11.5, color: s.v >= 85 ? "var(--pos)" : s.v >= 70 ? "var(--acc-recov)" : "var(--warn)" }}>{s.v}</span>
              </div>
              {window.Meter && <window.Meter value={s.v} color={s.v >= 85 ? "var(--pos)" : s.v >= 70 ? "var(--acc-recov)" : "var(--warn)"} />}
              <div className="dim" style={{ fontSize: 10.5, marginTop: 4 }}>{s.note}</div>
            </div>
          ))}
        </Card>
        <Card title="Goal alignment" sub={`${alig} / 100 · weighted 40 %`}>
          <table className="tbl">
            <thead><tr><th>Dimension</th><th style={{ width: 110 }}>Target</th><th style={{ width: 110 }}>Actual</th><th style={{ width: 55, textAlign: "right" }}>Score</th></tr></thead>
            <tbody>
              {BSS_ALIGNMENT.map(a => (
                <tr key={a.k}>
                  <td className="mono" style={{ fontSize: 11 }}>{a.k}</td>
                  <td className="muted" style={{ fontSize: 11 }}>{a.target}</td>
                  <td className="num" style={{ fontSize: 11 }}>{a.actual}</td>
                  <td className="num" style={{ textAlign: "right", color: a.score >= 90 ? "var(--pos)" : a.score >= 75 ? "var(--acc-recov)" : "var(--warn)" }}>{a.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="divider" />
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Calorie precision is the weak dimension at 71. The variance is wide enough that a 150-kcal deficit target cannot be verified week to week.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── UserPreferences ──────────────────────────────────
const UP_PREFS = [
  { cat: "food_dislike",     key: "fish",                    val: "true",  src: "conversation", conf: 0.92, at: "2026-04-12" },
  { cat: "food_like",        key: "greek_yoghurt",           val: "true",  src: "behavior",     conf: 0.88, at: "2026-05-03" },
  { cat: "food_intolerance", key: "lactose",                 val: "mild",  src: "onboarding",   conf: 1.00, at: "2026-01-08" },
  { cat: "exercise_dislike", key: "back_squat",              val: "knee",  src: "conversation", conf: 0.79, at: "2026-06-21" },
  { cat: "exercise_like",    key: "weighted_pullup",         val: "true",  src: "behavior",     conf: 0.94, at: "2026-03-14" },
  { cat: "schedule",         key: "no_evening_training",     val: "true",  src: "behavior",     conf: 0.83, at: "2026-07-02" },
  { cat: "communication",    key: "humor",                   val: "false", src: "explicit",     conf: 1.00, at: "2026-01-08" },
  { cat: "communication",    key: "directness",              val: "4",     src: "explicit",     conf: 1.00, at: "2026-01-08" },
  { cat: "motivation",       key: "responds_to_data",        val: "true",  src: "behavior",     conf: 0.91, at: "2026-05-28" },
  { cat: "supplement_pref",  key: "capsules_over_powder",    val: "true",  src: "conversation", conf: 0.72, at: "2026-08-04" },
];

const UP_SOURCES = {
  onboarding:   { c: "var(--acc-coach)", d: "Stated during setup. Treated as fact until you change it." },
  explicit:     { c: "var(--pos)",       d: "You set it directly in settings. Never overwritten automatically." },
  conversation: { c: "var(--acc-buddy)", d: "Extracted from something you said. Pattern-matched, so it can be wrong." },
  behavior:     { c: "var(--acc-recov)", d: "Inferred from what you actually do. Confidence grows with repetition." },
};

window.AIPreferencesView = () => {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(UP_PREFS.map(p => p.cat))];
  const rows = cat === "All" ? UP_PREFS : UP_PREFS.filter(p => p.cat === cat);
  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div className="grid g-cols-4" style={{ gap: 10 }}>
        {Object.entries(UP_SOURCES).map(([k, v]) => (
          <Card key={k} className="card-tight" style={{ padding: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: v.c }} />
            <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: v.c, marginBottom: 5 }}>{k}</div>
            <div className="num" style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>{UP_PREFS.filter(p => p.src === k).length}</div>
            <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.45 }}>{v.d}</div>
          </Card>
        ))}
      </div>

      <Card title="Learned preferences" sub="every entry is editable and deletable · nothing is hidden"
        actions={
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ height: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11 }}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        }>
        <table className="tbl">
          <thead><tr><th style={{ width: 140 }}>Category</th><th style={{ width: 170 }}>Key</th><th style={{ width: 90 }}>Value</th><th style={{ width: 120 }}>Source</th><th style={{ width: 140 }}>Confidence</th><th style={{ width: 100 }}>Learned</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 10.5 }}>{p.cat}</td>
                <td className="mono" style={{ fontSize: 11 }}>{p.key}</td>
                <td className="num" style={{ fontSize: 11 }}>{p.val}</td>
                <td><Pill style={{ color: UP_SOURCES[p.src].c, borderColor: `color-mix(in srgb, ${UP_SOURCES[p.src].c} 30%, var(--border))`, fontSize: 9.5 }}>{p.src}</Pill></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ flex: 1 }}>{window.Meter && <window.Meter value={p.conf * 100} color={p.conf >= 0.9 ? "var(--pos)" : p.conf >= 0.75 ? "var(--acc-recov)" : "var(--warn)"} flat />}</div>
                    <span className="num dim" style={{ fontSize: 10, width: 26 }}>{p.conf.toFixed(2)}</span>
                  </div>
                </td>
                <td className="num muted" style={{ fontSize: 10.5 }}>{p.at}</td>
                <td><button className="icon-btn"><Icon name="trash" className="ic ic-sm" style={{ color: "var(--fg-dim)" }} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
