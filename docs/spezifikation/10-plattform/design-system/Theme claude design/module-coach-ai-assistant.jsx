// Coach Portal — the coach's own AI assistant
// Roster triage · drafting · automation · digest · delegation

const CAI_QUEUE = [
  { id: "q1", client: "Lukas Bauer",   avatar: "LB", why: "Prep review due · 7 days out", urgency: "high",
    prep: "Weight −0.4 kg on plan, strength held at 96 %, sleep 6.8 h and falling. Peak week starts Monday.",
    draft: "Lukas — numbers look right for this stage. Strength retention at 96 % is better than most people manage at seven days out. Sleep is the one thing I want tighter: 6.8 h average this week against your 7.5 target. Peak week starts Monday and water manipulation on short sleep is where people get it wrong. Lights out by 22:30 from tonight.",
    est: "8 min", conf: 0.88 },
  { id: "q2", client: "Sophie Klein",  avatar: "SK", why: "Adherence dropped 18 pp", urgency: "high",
    prep: "Nutrition logging fell from 94 % to 76 % over ten days. Training unaffected. No message from her in 12 days.",
    draft: "Sophie — training has been solid, so this is not a motivation issue. Logging dropped off around the 3rd, which lines up with your work trip. Do you want me to switch you to a simplified target while things are busy? Three numbers instead of seven.",
    est: "5 min", conf: 0.82 },
  { id: "q3", client: "Marcus Weber",  avatar: "MW", why: "PR logged · deadlift 220 kg", urgency: "low",
    prep: "First 220 kg pull. Previous best 212.5 kg in June. Bar speed on the last rep suggests more in the tank.",
    draft: "220. That is a 7.5 kg jump from June and the bar moved faster than the 212.5 did. Nice work. I am holding you at this for two more sessions before we go up — the jump was big enough that I want the pattern grooved first.",
    est: "2 min", conf: 0.94 },
  { id: "q4", client: "Elena Schmidt", avatar: "ES", why: "Check-in overdue · 4 days", urgency: "medium",
    prep: "Weekly check-in not submitted. Last three were on time. Training logged normally, so she is still active.",
    draft: "Elena — no check-in from you this week, but I can see you have been training. Everything alright? If the form is the friction, tell me and we can do it as a two-line message instead.",
    est: "3 min", conf: 0.76 },
  { id: "q5", client: "Anna Frey",     avatar: "AF", why: "Plateau · 4 weeks no progression", urgency: "medium",
    prep: "Bench and row both static since 12 Aug. Adherence 91 %, recovery normal. Volume unchanged for six weeks.",
    draft: "Anna — four weeks with no movement on bench or row, and it is not effort. Adherence is 91 % and recovery is fine. The volume has been the same for six weeks, which is long enough that your body has stopped finding it hard. I am adding a set to both and dropping the accessory work to compensate.",
    est: "6 min", conf: 0.85 },
];

const CAI_AUTOMATIONS = [
  { id: "a1", name: "PR acknowledgement",       trigger: "New PR logged",                     action: "Draft congratulation, hold for approval", mode: "draft",  fired: 12, approved: 12, edited: 3 },
  { id: "a2", name: "Check-in nudge",           trigger: "Check-in 3 days overdue",           action: "Send reminder directly",                  mode: "auto",   fired: 8,  approved: 8,  edited: 0 },
  { id: "a3", name: "Adherence drop flag",      trigger: "Adherence falls 15 pp over 7 days", action: "Add to triage queue with context",        mode: "queue",  fired: 6,  approved: 6,  edited: 0 },
  { id: "a4", name: "Weekly digest",            trigger: "Sunday 18:00",                      action: "Compile roster summary",                  mode: "auto",   fired: 24, approved: 24, edited: 0 },
  { id: "a5", name: "Plan expiry warning",      trigger: "Program ends in 7 days",            action: "Draft renewal message",                   mode: "draft",  fired: 4,  approved: 3,  edited: 2 },
  { id: "a6", name: "Overtraining escalation",  trigger: "3-strike rule fires",               action: "Alert coach immediately, no draft",       mode: "alert",  fired: 2,  approved: 2,  edited: 0 },
  { id: "a7", name: "New client welcome",       trigger: "Onboarding step 3 complete",        action: "Send intake form and intro",              mode: "auto",   fired: 3,  approved: 3,  edited: 0 },
];

const CAI_DIGEST = {
  period: "Week of 9–15 September",
  headline: "Fourteen clients, eleven on track. Two need a decision from you this week, one is drifting quietly.",
  sections: [
    { t: "Needs your decision", tone: "warn", items: [
      "Lukas Bauer — peak week starts Monday. Protocol drafted, waiting on your sign-off.",
      "Anna Frey — four-week plateau. I have drafted a volume change but will not send a plan edit without you.",
    ]},
    { t: "Drifting", tone: "warn", items: [
      "Sophie Klein — logging down 18 points since her work trip. Training unaffected, so she has not disengaged, just deprioritised the admin.",
    ]},
    { t: "Going well", tone: "pos", items: [
      "Marcus Weber — 220 kg deadlift, first time. Bar speed suggests more available.",
      "Niko Brandt — twelve weeks at 100 % adherence. Longest streak on your roster.",
      "Jonas Becker — marathon block on schedule, 62 km last week without a recovery dip.",
    ]},
    { t: "Handled without you", tone: "", items: [
      "Eight check-in reminders sent, six answered within a day.",
      "Three PR acknowledgements drafted and approved by you on Tuesday.",
      "Two new clients moved through onboarding steps 1 to 3.",
    ]},
  ],
  stats: [["Messages drafted", 18], ["Sent after your approval", 15], ["Edited before sending", 5], ["Sent automatically", 11], ["Escalated to you", 3]],
};

const CAI_DELEGATION = [
  { cap: "Draft messages",              level: "always",   note: "Nothing leaves without you reading it, unless a rule says otherwise" },
  { cap: "Send routine reminders",      level: "auto",     note: "Check-in nudges, form reminders, session confirmations" },
  { cap: "Answer factual questions",    level: "auto",     note: "Programme details, schedule, what a cue means" },
  { cap: "Flag anomalies",              level: "auto",     note: "Adherence drops, missed sessions, unusual recovery patterns" },
  { cap: "Propose plan changes",        level: "draft",    note: "Written up for you, never applied" },
  { cap: "Apply plan changes",          level: "never",    note: "Yours alone. The assistant cannot write to a client's plan" },
  { cap: "Answer medical questions",    level: "never",    note: "Routed to the client's medical coach, not answered" },
  { cap: "Change client permissions",   level: "never",    note: "Only the client can" },
  { cap: "Speak as you",                level: "off",      note: "Clone is available on Elite but is currently switched off" },
];

const CAI_CHAT = [
  { from: "coach", at: "09:12", body: "who needs me most today?" },
  { from: "ai",    at: "09:12", body: "Two. Lukas is seven days out and his peak week protocol needs signing off before Monday — that is the hard deadline. Sophie's logging dropped 18 points over ten days, but her training is untouched, so it reads as admin fatigue rather than disengagement. I would take Lukas first and give Sophie a short message rather than a long one." },
  { from: "coach", at: "09:14", body: "draft sophie's" },
  { from: "ai",    at: "09:14", body: "Written and in the queue. I kept it to three sentences and offered the simplified target, since the pattern started with her work trip. Approve, edit or discard when you are ready." },
  { from: "coach", at: "09:15", body: "anyone i'm missing?" },
  { from: "ai",    at: "09:15", body: "Anna Frey. Four weeks with no progression on bench or row, adherence 91 %, recovery normal, volume unchanged for six weeks. She has not complained, which is why she is not louder in the queue — but the plateau is real and it is a programming issue, not an effort one." },
];

window.CoachAIAssistant = () => {
  const [sub, setSub] = useState("triage");
  const [sel, setSel] = useState(CAI_QUEUE[0].id);
  const item = CAI_QUEUE.find(q => q.id === sel);
  const uc = { high: "var(--neg)", medium: "var(--warn)", low: "var(--fg-dim)" };
  const mc = { auto: "var(--pos)", draft: "var(--acc-recov)", queue: "var(--acc-buddy)", alert: "var(--warn)" };

  return (
    <div className="col-gap" style={{ gap: 14 }}>
      <div style={{ padding: 13, background: "color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--acc-buddy)", opacity: 0.9, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Your assistant</span>
            <Pill variant="pos" dot>active</Pill>
            <Pill>14 clients under watch</Pill>
          </div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Reads every client's data, prepares your day, drafts what it can and escalates what it cannot. It does not touch a plan and it does not speak as you.
          </div>
        </div>
        <button className="btn btn-sm" onClick={() => setSub("delegation")}>What it may do</button>
      </div>

      <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1, width: "fit-content" }}>
        {[["triage","Triage queue"],["chat","Ask the assistant"],["automations","Automations"],["digest","Weekly digest"],["delegation","Delegation"]].map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} className={sub === k ? "btn btn-primary" : "btn btn-ghost"} style={{ height: 24, fontSize: 11, padding: "0 11px", borderRadius: 5 }}>{l}</button>
        ))}
      </div>

      {sub === "triage" && (
        <div className="grid" style={{ gridTemplateColumns: "300px 1fr", gap: 14 }}>
          <Card title="Today" sub={`${CAI_QUEUE.length} clients · ordered by what changes if you wait`} className="card-tight" style={{ padding: 0 }}>
            <div className="col-gap" style={{ gap: 0 }}>
              {CAI_QUEUE.map(q => (
                <div key={q.id} onClick={() => setSel(q.id)} style={{
                  display: "flex", gap: 10, padding: "11px 13px", cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  background: sel === q.id ? "color-mix(in srgb, var(--acc-buddy) 7%, transparent)" : "transparent",
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 600, flexShrink: 0 }}>{q.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: sel === q.id ? 600 : 500 }}>{q.client}</span>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: uc[q.urgency], marginLeft: "auto", flexShrink: 0 }} />
                    </div>
                    <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.35 }}>{q.why}</div>
                    <div className="dim mono" style={{ fontSize: 9.5, marginTop: 3 }}>≈ {q.est}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="col-gap" style={{ gap: 12 }}>
            <Card title={item.client} sub={item.why}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>What the assistant found</div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 13 }}>{item.prep}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span className="eyebrow">Drafted reply</span>
                <span className="num dim" style={{ fontSize: 10 }}>confidence {item.conf}</span>
                <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>not sent</span>
              </div>
              <div style={{ padding: 13, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12.5, lineHeight: 1.6, marginBottom: 12 }}>
                {item.draft}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm"><Icon name="check" className="ic ic-sm" />Approve and send</button>
                <button className="btn btn-sm"><Icon name="edit" className="ic ic-sm" />Edit first</button>
                <button className="btn btn-sm">Open client</button>
                <button className="btn btn-ghost btn-sm">Rewrite shorter</button>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--neg)" }}>Discard</button>
              </div>
            </Card>
            <Card title="Why this order" sub="the assistant explains its own ranking">
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                Lukas sits at the top because his deadline is external — peak week starts Monday whether you sign off or not. Sophie is second because a drop this size gets harder to reverse the longer it runs. Marcus is at the bottom despite the PR: a delayed congratulation costs nothing, and he already knows he lifted well.
              </div>
            </Card>
          </div>
        </div>
      )}

      {sub === "chat" && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "12px 15px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--acc-buddy)", opacity: 0.9 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Assistant · roster context</div>
              <div className="dim mono" style={{ fontSize: 10 }}>reads all 14 clients · answers about any of them</div>
            </div>
          </div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
            {CAI_CHAT.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "coach" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "76%", padding: "10px 14px", borderRadius: 10,
                  background: m.from === "coach" ? "color-mix(in srgb, var(--acc-coach) 16%, var(--surface))" : "var(--surface)",
                  border: "1px solid var(--border)",
                }}>
                  <div className="dim mono" style={{ fontSize: 9.5, marginBottom: 3 }}>{m.from === "ai" ? "Assistant" : "You"} · {m.at}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
              {["Who needs me today?", "Summarise Lukas this week", "Draft check-in replies", "Anyone drifting?", "Compare adherence"].map(q => (
                <button key={q} className="pill" style={{ cursor: "pointer", padding: "4px 10px", fontSize: 10.5 }}>{q}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="Ask about any client…" style={{ flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 12 }} />
              <button className="btn btn-primary btn-sm">Send</button>
            </div>
          </div>
        </Card>
      )}

      {sub === "automations" && (
        <Card title="Automations" sub="what runs without you, what waits for you">
          <table className="tbl">
            <thead><tr><th style={{ width: 180 }}>Rule</th><th style={{ width: 210 }}>Trigger</th><th>Action</th><th style={{ width: 90 }}>Mode</th><th style={{ width: 60, textAlign: "right" }}>Fired</th><th style={{ width: 70, textAlign: "right" }}>Edited</th><th style={{ width: 50 }}></th></tr></thead>
            <tbody>
              {CAI_AUTOMATIONS.map(a => (
                <tr key={a.id}>
                  <td style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{a.trigger}</td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{a.action}</td>
                  <td><Pill style={{ color: mc[a.mode], borderColor: `color-mix(in srgb, ${mc[a.mode]} 30%, var(--border))` }}>{a.mode}</Pill></td>
                  <td className="num" style={{ textAlign: "right" }}>{a.fired}</td>
                  <td className="num muted" style={{ textAlign: "right" }}>{a.edited}</td>
                  <td><button className="icon-btn"><Icon name="settings" className="ic ic-sm" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="divider" />
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55, marginBottom: 11 }}>
            The edit column is the useful one. Plan-expiry drafts get rewritten half the time, which means the template is wrong rather than the rule. PR acknowledgements almost never get touched.
          </div>
          <button className="btn btn-sm"><Icon name="plus" className="ic ic-sm" />New automation</button>
        </Card>
      )}

      {sub === "digest" && (
        <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
          <Card title="Weekly digest" sub={CAI_DIGEST.period}>
            <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 15, paddingBottom: 13, borderBottom: "1px solid var(--border)" }}>{CAI_DIGEST.headline}</div>
            <div className="col-gap" style={{ gap: 14 }}>
              {CAI_DIGEST.sections.map(s => {
                const c = s.tone === "warn" ? "var(--warn)" : s.tone === "pos" ? "var(--pos)" : "var(--fg-dim)";
                return (
                  <div key={s.t}>
                    <div className="eyebrow" style={{ marginBottom: 7, color: c }}>{s.t}</div>
                    <div className="col-gap" style={{ gap: 6 }}>
                      {s.items.map((it, i) => (
                        <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, lineHeight: 1.55, color: "var(--fg-muted)" }}>
                          <span style={{ width: 3, background: c, borderRadius: 2, flexShrink: 0, opacity: 0.5 }} />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <div className="col-gap" style={{ gap: 14 }}>
            <Card title="Assistant workload" sub="this week">
              {CAI_DIGEST.stats.map(([l, v]) => <Row key={l} label={l} value={v} />)}
              <div className="divider" />
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                Five of eighteen drafts were edited before sending. That ratio is the honest measure of how well it writes in your voice.
              </div>
            </Card>
            <Card title="Time saved" sub="estimated, not measured">
              <Row label="Drafting" value="~2.4 h" />
              <Row label="Triage and context gathering" value="~1.8 h" />
              <Row label="Routine reminders" value="~0.6 h" />
              <div className="divider" />
              <Row label="Total" value="~4.8 h this week" />
            </Card>
          </div>
        </div>
      )}

      {sub === "delegation" && (
        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <Card title="Delegation boundaries" sub="what the assistant may do on its own">
            <table className="tbl">
              <thead><tr><th style={{ width: 200 }}>Capability</th><th style={{ width: 90 }}>Level</th><th>Note</th></tr></thead>
              <tbody>
                {CAI_DELEGATION.map(d => {
                  const c = d.level === "auto" ? "var(--pos)" : d.level === "draft" || d.level === "always" ? "var(--acc-recov)" : d.level === "off" ? "var(--fg-dim)" : "var(--neg)";
                  return (
                    <tr key={d.cap}>
                      <td style={{ fontSize: 12 }}>{d.cap}</td>
                      <td><Pill style={{ color: c, borderColor: `color-mix(in srgb, ${c} 30%, var(--border))` }}>{d.level}</Pill></td>
                      <td className="muted" style={{ fontSize: 11.5 }}>{d.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <div className="col-gap" style={{ gap: 14 }}>
            <Card title="The line" sub="why some things stay yours">
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                The assistant may prepare, summarise and draft. It may not decide. A plan change carries your judgement about a person you know, and a client is paying for that judgement rather than for the reasoning that surrounds it.
              </div>
            </Card>
            <Card title="Visible to clients?">
              <Row label="Assistant use disclosed" value="yes, in your profile" />
              <Row label="Drafts marked as AI" value="no · you approved them" />
              <Row label="Auto-sent marked" value="yes · shown as automated" />
              <div className="divider" />
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                Anything sent without you reading it is labelled as automated on the client's side. Approved drafts are not, because at that point they are your words.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
