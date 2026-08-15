// Coach module · gap-closers — wires MultiDimAdherence, Autonomy, inline actions,
// alert detail, rule editor, coach settings, intervention engine, pattern analysis,
// team/audit details, consent flow

const CMod = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 640 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && <div style={{width: 26, height: 26, borderRadius: 6, background: `color-mix(in oklch, ${accent || "var(--acc-coach)"} 18%, transparent)`, border: `1px solid color-mix(in oklch, ${accent || "var(--acc-coach)"} 35%, transparent)`, color: accent || "var(--acc-coach)", display: "grid", placeItems: "center"}}><Icon name={eyebrow} className="ic"/></div>}
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize: 11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY: "auto"}}>{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

// ── 1. Enhanced Athlete Detail (wires MultiDimAdherence + Autonomy) ──
window.AthleteDetailEnhanced = ({ athlete: a, onClose }) => {
  const [tab, setTab] = React.useState("overview");
  const autonomy = (window.ATHLETE_AUTONOMY || {})[a.id];
  const lvl = autonomy ? (window.AUTONOMY_LEVELS || []).find(x => x.lvl === autonomy.level) : null;
  return (
    <CMod title={a.name} subtitle={`${a.plan} · since ${a.since}`} eyebrow="user" onClose={onClose} width={840}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="bell" className="ic ic-sm"/>Call</button><button className="btn"><Icon name="message" className="ic ic-sm"/>Message</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Adjust plan</button><button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add note</button></>}>
      {/* Hero strip */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Compliance</div><div className="num" style={{fontSize: 18, color: a.compliance >= 90 ? "var(--pos)" : "var(--warn)"}}>{a.compliance}%</div></Card>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Alerts</div><div className="num" style={{fontSize: 18, color: a.alerts > 0 ? "var(--warn)" : "var(--fg-dim)"}}>{a.alerts}</div></Card>
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Last session</div><div className="num" style={{fontSize: 12}}>{a.lastSession}</div></Card>
        {autonomy && (
          <Card className="card-tight" style={{padding: 12, background: "color-mix(in oklch, var(--acc-buddy) 8%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-buddy) 30%, var(--border))"}}>
            <div className="eyebrow" style={{color: "var(--acc-buddy)"}}>Autonomy</div>
            <div style={{display: "flex", alignItems: "center", gap: 6, marginTop: 3}}>
              <div style={{width: 18, height: 18, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 9}}>{autonomy.level}</div>
              <span style={{fontSize: 12, fontWeight: 600}}>{lvl?.name}</span>
            </div>
            <div className="dim mono" style={{fontSize: 9.5, marginTop: 3}}>{autonomy.trend === "up" ? "↑ progressing" : autonomy.trend === "down" ? "↓ at risk" : "stable"} · {autonomy.since}</div>
          </Card>
        )}
        <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Tags</div><div style={{display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3}}>{a.tags.map(t => <Pill key={t} style={{fontSize: 9.5, padding: "1px 5px"}}>{t}</Pill>)}</div></Card>
      </div>

      <Tabs items={[
        { id: "overview",  label: "Overview" },
        { id: "adherence", label: "Adherence · multi-dim" },
        { id: "autonomy",  label: "Autonomy assessment" },
        { id: "notes",     label: "My notes" },
      ]} active={tab} onChange={setTab}/>

      <div style={{marginTop: 14}}>
        {tab === "overview" && (
          <>
            <div className="eyebrow" style={{marginBottom: 6}}>Shared modules</div>
            <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14}}>
              {["Training","Recovery","Goals"].map(m => <Pill key={m} variant="acc">{m}</Pill>)}
              {["Nutrition","Medical","Supplements"].map(m => <Pill key={m}>hidden</Pill>)}
            </div>
            <div className="eyebrow" style={{marginBottom: 6}}>Compliance · last 4 weeks</div>
            <LineChart h={140} range={[60, 100]} xLabels={["wk-3","wk-2","wk-1","this wk"]}
              series={[{ data: [88, 92, 94, a.compliance], color: "var(--acc-train)" }]}/>
            <div className="eyebrow" style={{marginTop: 14, marginBottom: 6}}>Recent notes you've written</div>
            <Card className="card-tight" style={{padding: 12, fontSize: 11.5, color: "var(--fg-muted)"}}>
              <div className="dim mono" style={{fontSize: 10, marginBottom: 4}}>May 13 · Training</div>
              Solid week 2. Bench felt confident, RPE 7-8 throughout. Sending Block 3 progression Mon.
            </Card>
          </>
        )}
        {tab === "adherence" && window.MultiDimAdherence && <window.MultiDimAdherence aid={a.id}/>}
        {tab === "autonomy" && autonomy && <AutonomyAssessment aid={a.id} autonomy={autonomy} lvl={lvl}/>}
        {tab === "notes"     && <div className="dim" style={{padding: 20, textAlign: "center"}}>Coach notes view — see Notes tab on left side.</div>}
      </div>
    </CMod>
  );
};

const AutonomyAssessment = ({ aid, autonomy, lvl }) => {
  const seed = aid?.charCodeAt(1) || 1;
  const rand = (a) => Math.round((Math.sin(a * 13.7 + seed * 31.3) * 0.3 + 0.7) * 100);
  const criteria = [
    { name: "Consistency", items: [["Adherence (long-term)", rand(1)], ["Check-in frequency", rand(2)], ["Goal progress", rand(3)]] },
    { name: "Knowledge",   items: [["Nutrition understanding", rand(4)], ["Training principles", rand(5)], ["Recovery awareness", rand(6)], ["Supplement knowledge", rand(7)]] },
    { name: "Self-correction", items: [["Problem identification", rand(8)], ["Solution implementation", rand(9)], ["Seeking help", rand(10)], ["Adaptation skills", rand(11)]] },
    { name: "Communication",   items: [["Proactivity", rand(12)], ["Clarity", rand(13)], ["Feedback quality", rand(14)], ["Responsiveness", rand(15)]] },
  ];
  return (
    <div>
      <div style={{display: "flex", alignItems: "center", gap: 14, padding: 14, background: "color-mix(in oklch, var(--acc-buddy) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-buddy) 25%, var(--border))", borderRadius: 8, marginBottom: 14}}>
        <div style={{width: 48, height: 48, borderRadius: 999, background: "var(--acc-buddy)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 22}}>{autonomy.level}</div>
        <div style={{flex: 1}}>
          <div className="eyebrow" style={{color: "var(--acc-buddy)", marginBottom: 4}}>Current level</div>
          <div style={{fontSize: 15, fontWeight: 600, marginBottom: 2}}>{lvl?.name}</div>
          <div className="muted" style={{fontSize: 11.5}}>{lvl?.desc}</div>
        </div>
        <div style={{textAlign: "right"}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Time at level</div>
          <div className="num" style={{fontSize: 16}}>{autonomy.since}</div>
          <Pill style={{marginTop: 4, color: autonomy.trend === "up" ? "var(--pos)" : autonomy.trend === "down" ? "var(--warn)" : "var(--fg-dim)"}}>{autonomy.trend === "up" ? "↑ ready to progress" : autonomy.trend === "down" ? "↓ regression risk" : "stable"}</Pill>
        </div>
      </div>
      <div className="eyebrow" style={{marginBottom: 8}}>Assessment criteria</div>
      <div className="grid g-cols-2" style={{gap: 10, marginBottom: 14}}>
        {criteria.map(c => (
          <Card key={c.name} className="card-tight" style={{padding: 12}}>
            <div className="eyebrow" style={{marginBottom: 6, fontSize: 10}}>{c.name}</div>
            {c.items.map(([k, v]) => (
              <div key={k} style={{display: "grid", gridTemplateColumns: "1fr 40px 36px", gap: 6, alignItems: "center", fontSize: 11, marginBottom: 4}}>
                <span style={{color: "var(--fg-muted)"}}>{k}</span>
                <div style={{height: 4, background: "var(--surface-2)", borderRadius: 999}}>
                  <div style={{height: "100%", width: `${v}%`, background: v >= 80 ? "var(--pos)" : v >= 60 ? "var(--warn)" : "var(--neg)", borderRadius: 999}}/>
                </div>
                <span className="num" style={{textAlign: "right"}}>{v}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
      <Card className="card-tight" style={{padding: 14, background: "color-mix(in oklch, var(--acc-buddy) 4%, var(--surface))"}}>
        <div className="eyebrow" style={{marginBottom: 6}}>Coach recommendation</div>
        <div style={{fontSize: 12.5, lineHeight: 1.55, marginBottom: 10}}>{autonomy.recommendation}</div>
        {autonomy.canProgress && (
          <button className="btn btn-primary"><Icon name="chevron_up" className="ic ic-sm"/>Promote to Level {autonomy.level + 1}</button>
        )}
      </Card>
    </div>
  );
};

// ── 2. Smart Prioritization Score (replaces manual sort) ──
window.smartPriorityScore = (a) => {
  // Combined attention score: alerts heaviest, then low compliance, then time since last session
  return (a.alerts * 30) + (100 - a.compliance) * 1.2 + (a.lastSession.includes("d ago") ? parseInt(a.lastSession) * 4 : 0);
};

// ── 3. Inline Action Buttons component for athlete cards ──
window.AthleteInlineActions = ({ a }) => (
  <div style={{display: "flex", gap: 4, marginLeft: "auto"}} onClick={e => e.stopPropagation()}>
    <button className="icon-btn" title="Message"><Icon name="message" className="ic ic-sm"/></button>
    <button className="icon-btn" title="Call"><Icon name="bell" className="ic ic-sm"/></button>
    <button className="icon-btn" title="Adjust plan"><Icon name="edit" className="ic ic-sm"/></button>
  </div>
);

// ── 4. Alert Detail Modal ──
window.AlertDetailModal = ({ alert: al, onClose }) => (
  <CMod title={al.title} subtitle={`${al.athlete} · ${al.type} · ${al.id}`} eyebrow="alert" onClose={onClose} width={720}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-ghost" style={{color: "var(--neg)"}}>Mark as false positive</button><button className="btn">Dismiss</button><button className="btn btn-primary"><Icon name="message" className="ic ic-sm"/>Open client</button></>}>
    <div className="grid g-cols-4" style={{gap: 8, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Severity</div><div style={{marginTop: 4}}>{window.CoachPortalSmartAlerts && <Pill style={{color: al.severity === "CRITICAL" ? "var(--neg)" : "var(--warn)"}}>{al.severity}</Pill>}</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Confidence</div><div className="num" style={{fontSize: 16}}>{Math.round(al.confidence * 100)}%</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">FP risk</div><div className="num" style={{fontSize: 16}}>{Math.round(al.fpRisk * 100)}%</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Similar cases</div><div className="num" style={{fontSize: 16}}>{al.similarCases ?? "—"}</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Why this fired</div>
    <Card className="card-tight" style={{padding: 12, marginBottom: 14, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55}}>{al.why}</Card>
    <div className="eyebrow" style={{marginBottom: 6}}>Predicted outcome if not addressed</div>
    <Card className="card-tight" style={{padding: 12, marginBottom: 14, background: "color-mix(in oklch, var(--warn) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--warn) 25%, var(--border))", fontSize: 12, lineHeight: 1.55}}>{al.predicted}</Card>
    <div className="eyebrow" style={{marginBottom: 6}}>Similar cases · what worked</div>
    <div className="col-gap" style={{gap: 4}}>
      <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>Apr 18 · Lukas Bauer · same alert · resolved with deload week + sleep coaching · outcome positive</div>
      <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>Mar 2 · Niko Brandt · same alert · ignored · injury occurred 2 weeks later</div>
    </div>
  </CMod>
);

// ── 5. Coach Settings Modal (Quiet Hours, Batch, etc.) ──
window.CoachSettingsModal = ({ onClose }) => (
  <CMod title="Coach settings" subtitle="Alerts · batching · quiet hours · escalation" eyebrow="settings" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save</button></>}>
    <div className="eyebrow" style={{marginBottom: 8}}>Quiet hours</div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14}}>
      <div><div className="eyebrow" style={{marginBottom: 4}}>From</div><input type="time" defaultValue="22:00" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
      <div><div className="eyebrow" style={{marginBottom: 4}}>To</div><input type="time" defaultValue="06:00" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
    </div>
    <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, marginBottom: 14, fontSize: 11.5, color: "var(--fg-muted)"}}>
      <Icon name="check" className="ic ic-sm" style={{display: "inline", color: "var(--pos)", marginRight: 4}}/>
      Critical alerts bypass quiet hours · medical referrals always notify
    </div>
    <div className="eyebrow" style={{marginBottom: 8}}>Alert batching</div>
    <div className="col-gap" style={{gap: 6, marginBottom: 14}}>
      {[
        ["Batch related alerts", "on · groups same-rule alerts within 30min"],
        ["Min severity for immediate", "MEDIUM and above"],
        ["Max batch size", "5 alerts per notification"],
        ["Adaptive thresholds", "on · learn from your dismissal patterns"],
      ].map(([k, v]) => (
        <div key={k} style={{display: "flex", alignItems: "center", padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
          <span style={{fontSize: 12, flex: 1}}>{k}</span>
          <span className="dim mono" style={{fontSize: 10.5}}>{v}</span>
        </div>
      ))}
    </div>
    <div className="eyebrow" style={{marginBottom: 8}}>Escalation rules</div>
    <div className="col-gap" style={{gap: 6}}>
      <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>CRITICAL unhandled 4h → notify Senior Coach</div>
      <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>CRITICAL unhandled 24h → notify Head Coach + log incident</div>
      <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>Medical flag → notify Medical Coach immediately</div>
    </div>
  </CMod>
);

// ── 6. Rule Edit Drawer ──
window.RuleEditModal = ({ rule, onClose }) => (
  <CMod title={rule?.name || "Edit rule"} subtitle="Conditions · actions · segmentation" eyebrow="edit" onClose={onClose} width={760}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn"><Icon name="bolt" className="ic ic-sm"/>Test replay</button><button className="btn"><Icon name="copy" className="ic ic-sm"/>Duplicate</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save</button></>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12}}>
      <div><div className="eyebrow" style={{marginBottom: 4}}>Name</div><input defaultValue={rule?.name || ""} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
      <div><div className="eyebrow" style={{marginBottom: 4}}>Severity</div><select defaultValue={rule?.severity || "MEDIUM"} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option><option>INFO</option></select></div>
      <div><div className="eyebrow" style={{marginBottom: 4}}>Active</div><div style={{display: "flex", alignItems: "center", height: 30, gap: 6}}><div style={{width: 32, height: 18, background: "var(--pos)", borderRadius: 999, padding: 2}}><div style={{width: 14, height: 14, background: "var(--bg)", borderRadius: 999, marginLeft: 14}}/></div><span style={{fontSize: 12}}>Active</span></div></div>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Test on historical data (replay)</div>
    <Card className="card-tight" style={{padding: 12, marginBottom: 12, background: "color-mix(in oklch, var(--acc-coach) 5%, var(--surface))"}}>
      <div style={{display: "flex", gap: 14, alignItems: "center"}}>
        <div><div className="eyebrow">Replay window</div><div className="num" style={{fontSize: 13}}>last 90 days</div></div>
        <div><div className="eyebrow">Would fire</div><div className="num" style={{fontSize: 13, color: "var(--fg)"}}>{rule?.fired * 6 || 18}×</div></div>
        <div><div className="eyebrow">False positives</div><div className="num" style={{fontSize: 13, color: "var(--pos)"}}>{rule?.falsePositives || 0}</div></div>
        <div><div className="eyebrow">Avg confidence</div><div className="num" style={{fontSize: 13}}>87%</div></div>
        <button className="btn" style={{marginLeft: "auto"}}>Run replay</button>
      </div>
    </Card>
    <div className="eyebrow" style={{marginBottom: 6}}>Assigned athletes</div>
    <div style={{display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12}}>
      {["Sophie K.","Daniel V.","Marcus W.","Lukas B.","+10 more"].map(n => <Pill key={n}>{n}</Pill>)}
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Fire log · last 5</div>
    <table className="tbl">
      <tbody>
        <tr><td className="num muted">today 06:14</td><td>Sophie Klein</td><td><Pill variant="pos">resolved 1.8h</Pill></td></tr>
        <tr><td className="num muted">Apr 24</td><td>Lukas Bauer</td><td><Pill variant="block">false positive</Pill></td></tr>
        <tr><td className="num muted">Apr 18</td><td>Daniel Vogel</td><td><Pill variant="pos">resolved · plan adjusted</Pill></td></tr>
      </tbody>
    </table>
  </CMod>
);

// ── 7. Pattern Analysis (predictive + weekly/seasonal/events) ──
window.PatternAnalysisView = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
    <Card title="Adherence forecast · 30 days" sub="ML-based prediction with confidence band">
      <LineChart h={200} range={[60, 100]}
        xLabels={["wk-4","wk-3","wk-2","wk-1","now","wk+1","wk+2","wk+3"]}
        series={[
          { data: [82, 84, 88, 91, 94, 92, 90, 88], color: "var(--acc-coach)" },
          { data: [82, 84, 88, 91, 94, 96, 97, 95], color: "var(--pos)" },
          { data: [82, 84, 88, 91, 94, 87, 82, 80], color: "var(--warn)" },
        ]}/>
      <div style={{display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span className="dot" style={{background: "var(--acc-coach)"}}/>Likely (72% conf.)</span>
        <span className="row-gap"><span className="dot" style={{background: "var(--pos)"}}/>Best case (best-day pattern)</span>
        <span className="row-gap"><span className="dot" style={{background: "var(--warn)"}}/>Worst (travel + missed sessions)</span>
      </div>
    </Card>
    <Card title="Risk indicators" sub="across cohort">
      <Row label="Trend velocity" value="-0.4 pp/wk · 4 athletes"/>
      <Row label="Volatility score" value="0.18 · low"/>
      <Row label="External stressors" value="2 athletes on travel"/>
      <Row label="Support strength" value="strong · 91%"/>
      <Row label="Motivation index" value="78 · stable"/>
      <div className="divider"/>
      <div className="eyebrow" style={{marginBottom: 6}}>Intervention windows · next 14d</div>
      <div className="col-gap" style={{gap: 4}}>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>Wed May 18 · Sophie Klein · pre-emptive call (predicted drop)</div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>Fri May 20 · 3 athletes · weekly group check-in slot</div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>Mon May 23 · Mira Stahl · plan adjustment review</div>
      </div>
    </Card>
    <Card title="Day-of-week pattern" sub="cohort adherence by weekday">
      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, alignItems: "end", height: 100}}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
          const v = [88, 91, 89, 84, 78, 92, 86][i];
          return (
            <div key={d} style={{textAlign: "center"}}>
              <div style={{height: 70, display: "flex", alignItems: "flex-end", justifyContent: "center"}}>
                <div style={{width: 16, height: `${v}%`, background: v >= 85 ? "var(--pos)" : "var(--warn)", borderRadius: "3px 3px 0 0"}}/>
              </div>
              <div className="num" style={{fontSize: 9.5, marginTop: 3, color: "var(--fg-dim)"}}>{v}%</div>
              <div className="dim mono" style={{fontSize: 9}}>{d}</div>
            </div>
          );
        })}
      </div>
      <div className="dim" style={{fontSize: 11, marginTop: 10, lineHeight: 1.45}}>Friday is the consistent weak day — consider lighter sessions or accountability nudge.</div>
    </Card>
    <Card title="Event impact analysis" sub="how life events affect compliance">
      <table className="tbl">
        <thead><tr><th>Event</th><th style={{width: 80, textAlign: "right"}}>Impact</th><th style={{width: 80}}>Recovery</th></tr></thead>
        <tbody>
          <tr><td>Travel ≥3 days</td><td className="num" style={{textAlign: "right", color: "var(--neg)"}}>-14pp</td><td className="num muted">~7d</td></tr>
          <tr><td>Illness</td><td className="num" style={{textAlign: "right", color: "var(--neg)"}}>-22pp</td><td className="num muted">~10d</td></tr>
          <tr><td>Cheat weekend</td><td className="num" style={{textAlign: "right", color: "var(--warn)"}}>-4pp</td><td className="num muted">~2d</td></tr>
          <tr><td>New PR</td><td className="num" style={{textAlign: "right", color: "var(--pos)"}}>+6pp</td><td className="num muted">~14d boost</td></tr>
          <tr><td>Plan change</td><td className="num" style={{textAlign: "right", color: "var(--warn)"}}>-3pp</td><td className="num muted">~5d</td></tr>
        </tbody>
      </table>
    </Card>
  </div>
);

// ── 8. Intervention Engine UI ──
window.InterventionEngineView = () => (
  <div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12, background: "color-mix(in oklch, var(--acc-recov) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-recov) 25%, var(--border))"}}>
        <div className="eyebrow" style={{color: "var(--acc-recov)", marginBottom: 6}}>Educational</div>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 6}}>Address knowledge gaps</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 10}}>Targeted content + skill building when adherence ↓ correlates with confusion (not motivation).</div>
        <Row label="Active" value="3 athletes"/>
        <Row label="Effectiveness" value="74%"/>
      </Card>
      <Card className="card-tight" style={{padding: 12, background: "color-mix(in oklch, var(--acc-buddy) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-buddy) 25%, var(--border))"}}>
        <div className="eyebrow" style={{color: "var(--acc-buddy)", marginBottom: 6}}>Motivational</div>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 6}}>Realign + reward</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 10}}>Goal-realignment conversations, social proof, achievement celebration.</div>
        <Row label="Active" value="5 athletes"/>
        <Row label="Effectiveness" value="68%"/>
      </Card>
      <Card className="card-tight" style={{padding: 12, background: "color-mix(in oklch, var(--acc-train) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-train) 25%, var(--border))"}}>
        <div className="eyebrow" style={{color: "var(--acc-train)", marginBottom: 6}}>Practical</div>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 6}}>Remove barriers</div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 10}}>Schedule fixes, plan simplification, tool/app recommendations.</div>
        <Row label="Active" value="2 athletes"/>
        <Row label="Effectiveness" value="84%"/>
      </Card>
    </div>
    <Card title="Active interventions" sub="10 ongoing">
      <table className="tbl">
        <thead><tr><th>Athlete</th><th style={{width: 110}}>Type</th><th>Strategy</th><th style={{width: 100}}>Started</th><th style={{width: 90, textAlign: "right"}}>Outcome</th></tr></thead>
        <tbody>
          {[
            ["Sophie Klein",  "educational", "Recovery science micro-course · 5 lessons", "May 8",  "improving"],
            ["Elena Schmidt", "practical",   "Travel prep checklist · pre-departure call", "May 10", "improving"],
            ["Mira Stahl",    "motivational","Sub-goal reset · weekly streak target",     "May 6",  "stalled"],
            ["Anna Frey",     "motivational","Re-engagement · 30-day reset offer",         "May 12", "pending"],
            ["Daniel Vogel",  "practical",   "Plan simplification · drop 2 accessories", "May 11", "improving"],
            ["Felix Krause",  "educational", "RPE calibration session",                   "Apr 30", "resolved"],
          ].map((r, i) => (
            <tr key={i}>
              <td>{r[0]}</td>
              <td><Pill style={{color: r[1] === "educational" ? "var(--acc-recov)" : r[1] === "motivational" ? "var(--acc-buddy)" : "var(--acc-train)"}}>{r[1]}</Pill></td>
              <td className="muted" style={{fontSize: 11.5}}>{r[2]}</td>
              <td className="num muted">{r[3]}</td>
              <td style={{textAlign: "right"}}><Pill variant={r[4] === "improving" || r[4] === "resolved" ? "pos" : r[4] === "stalled" ? "warn" : ""}>{r[4]}</Pill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ── 9. Team Invite + Member Detail ──
window.InviteTeamMemberModal = ({ onClose }) => (
  <CMod title="Invite team member" subtitle="Add coach to your team" eyebrow="plus" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Send invite</button></>}>
    <div className="col-gap" style={{gap: 12}}>
      <div><div className="eyebrow" style={{marginBottom: 4}}>Email</div><input placeholder="coach@example.com" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
      <div>
        <div className="eyebrow" style={{marginBottom: 4}}>Role</div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6}}>
          <button className="btn">Senior Coach</button>
          <button className="btn btn-primary">Coach</button>
        </div>
      </div>
      <div><div className="eyebrow" style={{marginBottom: 4}}>Initial assignment</div><input placeholder="None · they'll request athletes" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
      <div><div className="eyebrow" style={{marginBottom: 4}}>Welcome note</div><input placeholder="Personal message…" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
    </div>
  </CMod>
);

window.TeamMemberDetailModal = ({ member, onClose }) => (
  <CMod title={member?.name || "Team member"} subtitle={`${member?.role} · since ${member?.since}`} eyebrow="user" onClose={onClose} width={720}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Change role</button><button className="btn btn-ghost" style={{color: "var(--neg)"}}>Remove</button></>}>
    <div className="grid g-cols-4" style={{gap: 8, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Athletes</div><div className="num" style={{fontSize: 18}}>{member?.athletes ?? 0}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Rating</div><div className="num" style={{fontSize: 18}}>{member?.rating ?? "—"} ★</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Response time</div><div className="num" style={{fontSize: 13}}>2.4h avg</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Retention</div><div className="num" style={{fontSize: 18, color: "var(--pos)"}}>89%</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Permission overrides</div>
    <div className="col-gap" style={{gap: 4, marginBottom: 14}}>
      {[
        ["Data export", "limited · per role"],
        ["Rule creation", "templates only · per role"],
        ["Cross-team athletes", "view-only override granted Apr 4"],
      ].map(([k, v]) => (
        <div key={k} style={{display: "flex", padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
          <span style={{fontSize: 12, flex: 1}}>{k}</span>
          <span className="dim mono" style={{fontSize: 10.5}}>{v}</span>
        </div>
      ))}
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Assigned athletes</div>
    <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
      {["Lukas B.","Sophie K.","Marcus W.","Elena S.","+4 more"].map(n => <Pill key={n}>{n}</Pill>)}
    </div>
  </CMod>
);

// ── 10. Consent Management Flow ──
window.ConsentFlowView = () => (
  <Card title="Client consent · per module sharing" sub="GDPR-compliant · timestamped grants">
    <div style={{padding: 12, background: "var(--surface)", borderRadius: 6, marginBottom: 14, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      Every athlete-coach data sharing requires explicit consent. View grants, revocations, and expiry status here.
    </div>
    <table className="tbl">
      <thead><tr><th>Athlete</th><th>Modules granted</th><th style={{width: 100}}>Granted</th><th style={{width: 110}}>Expires</th><th style={{width: 90}}>Status</th></tr></thead>
      <tbody>
        {[
          ["Lukas Bauer", "Training · Recovery · Goals",     "Mar 8, 2024",  "indefinite", "active"],
          ["Sophie Klein","Training · Recovery",              "Sep 12, 2025", "indefinite", "active"],
          ["Marcus Weber","Training · Nutrition · Recovery", "Nov 2, 2024",  "indefinite", "active"],
          ["Elena Schmidt","Training",                         "Feb 14, 2026", "Aug 14, 2026", "expiring · 90d"],
          ["Niko Brandt", "All modules · full",                "Jan 8, 2024",  "indefinite", "active"],
          ["Tom (Test)",  "Training · Goals",                  "Aug 12, 2024", "ended Apr 2026", "expired"],
        ].map((r, i) => (
          <tr key={i}>
            <td>{r[0]}</td>
            <td className="muted">{r[1]}</td>
            <td className="num muted">{r[2]}</td>
            <td className="num muted">{r[3]}</td>
            <td><Pill variant={r[4] === "active" ? "pos" : r[4].includes("expiring") ? "warn" : "block"}>{r[4]}</Pill></td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="divider"/>
    <div style={{display: "flex", gap: 6}}>
      <button className="btn"><Icon name="download" className="ic ic-sm"/>Export consent log</button>
      <button className="btn btn-ghost"><Icon name="alert" className="ic ic-sm"/>3 expiring within 90d</button>
    </div>
  </Card>
);

// ── Launcher for all modals via custom events ──
window.CoachExtrasLauncher = () => {
  const [m, setM] = React.useState(null);
  React.useEffect(() => {
    const h = e => setM(e.detail);
    window.addEventListener("coach-modal", h);
    return () => window.removeEventListener("coach-modal", h);
  }, []);
  if (!m) return null;
  const close = () => setM(null);
  if (m.type === "alertDet" && window.AlertDetailModal) return <window.AlertDetailModal alert={m.payload} onClose={close}/>;
  if (m.type === "settings" && window.CoachSettingsModal) return <window.CoachSettingsModal onClose={close}/>;
  if (m.type === "ruleEdit" && window.RuleEditModal) return <window.RuleEditModal rule={m.payload} onClose={close}/>;
  if (m.type === "inviteTeam" && window.InviteTeamMemberModal) return <window.InviteTeamMemberModal onClose={close}/>;
  if (m.type === "memberDet" && window.TeamMemberDetailModal) return <window.TeamMemberDetailModal member={m.payload} onClose={close}/>;
  if (m.type === "athleteEnhanced" && window.AthleteDetailEnhanced) return <window.AthleteDetailEnhanced athlete={m.payload} onClose={close}/>;
  return null;
};
