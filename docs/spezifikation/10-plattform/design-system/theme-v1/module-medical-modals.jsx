// Medical · modals — biomarker detail, symptom, medication, OCR review, export, privacy

const MMod = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 660 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight:"92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && <div style={{width:26, height:26, borderRadius:6, background:`color-mix(in srgb, ${accent||"var(--acc-medic)"} 18%, transparent)`, border:`1px solid color-mix(in srgb, ${accent||"var(--acc-medic)"} 35%, var(--border))`, color:accent||"var(--acc-medic)", display:"grid", placeItems:"center"}}><Icon name={eyebrow} className="ic"/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:14, fontWeight:600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize:11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY:"auto"}}>{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

// ── Biomarker detail (dual-range, history, supplement effect) ──
window.BiomarkerDetailModal = ({ b, onClose }) => {
  const flag = calcBiomarkerFlag(b.value, b);
  const meta = FLAG_META[flag];
  const trend = calcBiomarkerTrend(b.hist);
  const suppl = SUPPLEMENT_BIOMARKER_MAP.filter(s => s.biomarker === b.id).map(calcSupplementEffectiveness);
  const relatedSymptoms = Object.entries(SYMPTOM_BIOMARKER_MAP).filter(([, names]) => names.includes(b.name)).map(([s]) => s);
  const meds = MEDICATIONS_V2.filter(m => m.targets.includes(b.abbr));

  return (
    <MMod title={b.name} subtitle={`${b.de} · ${b.abbr} · LOINC ${b.loinc} · ${b.cat.replace(/_/g," ")}`} eyebrow="trend_up" onClose={onClose} width={760}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="plus" className="ic ic-sm"/>Add value</button><button className="btn"><Icon name="download" className="ic ic-sm"/>Export trend</button></>}>

      <div className="grid g-cols-4" style={{gap:10, marginBottom:14}}>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:3}}>Current</div>
          <div className="num" style={{fontSize:20, fontWeight:600, color:meta.c}}>{b.value}<span className="dim" style={{fontSize:10, marginLeft:3}}>{b.unit}</span></div>
          <div style={{marginTop:4}}><FlagPill flag={flag} small/></div>
        </Card>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:3}}>Lab range</div>
          <div className="num" style={{fontSize:14, color:"var(--acc-recov)"}}>{b.lab_min} – {b.lab_max}</div>
          <div className="dim" style={{fontSize:9.5, marginTop:3}}>clinical normal</div>
        </Card>
        <Card className="card-tight" style={{padding:12, background:"color-mix(in srgb, var(--pos) 6%, var(--surface))", border:"1px solid color-mix(in srgb, var(--pos) 26%, var(--border))"}}>
          <div className="eyebrow" style={{marginBottom:3, color:"var(--pos)"}}>Optimal range</div>
          <div className="num" style={{fontSize:14, color:"var(--pos)"}}>{b.optimal_min} – {b.optimal_max}</div>
          <div className="dim" style={{fontSize:9.5, marginTop:3}}>performance / longevity</div>
        </Card>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:3}}>Trend · {trend.n} points</div>
          <div className="num" style={{fontSize:14}}>{trend.direction === "rising" ? "↑" : trend.direction === "falling" ? "↓" : "→"} {trend.change_pct > 0 ? "+" : ""}{trend.change_pct}%</div>
          <div className="dim" style={{fontSize:9.5, marginTop:3}}>{trend.strength} · next ≈ {trend.projected}</div>
        </Card>
      </div>

      <div className="eyebrow" style={{marginBottom:6}}>Where you sit</div>
      <Card className="card-tight" style={{padding:14, marginBottom:14}}>
        <RangeIndicator b={b} height={30}/>
        <div style={{display:"flex", gap:14, marginTop:12, fontSize:10, color:"var(--fg-muted)", flexWrap:"wrap"}}>
          <span className="row-gap"><span style={{width:12, height:10, borderRadius:2, background:"color-mix(in srgb, var(--neg) 20%, var(--surface-2))"}}/>outside lab range</span>
          <span className="row-gap"><span style={{width:12, height:10, borderRadius:2, background:"color-mix(in srgb, var(--acc-recov) 26%, transparent)"}}/>lab normal</span>
          <span className="row-gap"><span style={{width:12, height:10, borderRadius:2, background:"color-mix(in srgb, var(--pos) 34%, transparent)"}}/>optimal</span>
          <span className="row-gap"><span style={{width:2.5, height:11, background:meta.c}}/>your value</span>
        </div>
      </Card>

      <div className="eyebrow" style={{marginBottom:6}}>History · 6 panels</div>
      <Card className="card-tight" style={{padding:12, marginBottom:14}}>
        <LineChart h={150}
          range={[Math.min(...b.hist, b.optimal_min ?? Infinity) * 0.92, Math.max(...b.hist, b.optimal_max ?? 0) * 1.08]}
          xLabels={["Q1 25","Q2 25","Q3 25","Q4 25","Q1 26","Q2 26"]}
          series={[
            { data: b.hist, color: meta.c },
            { data: Array(b.hist.length).fill(b.optimal_min), color: "var(--pos)" },
            { data: Array(b.hist.length).fill(b.optimal_max), color: "var(--pos)" },
          ]}/>
        <div style={{display:"flex", gap:14, marginTop:8, fontSize:10.5, color:"var(--fg-muted)"}}>
          <span className="row-gap"><span className="dot" style={{background:meta.c}}/>your values</span>
          <span className="row-gap"><span className="dot" style={{background:"var(--pos)"}}/>optimal band</span>
          <span style={{marginLeft:"auto"}} className="mono">slope {trend.slope} / panel</span>
        </div>
      </Card>

      <div className="grid g-cols-2" style={{gap:12, marginBottom:14}}>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:5}}>Clinical significance</div>
          <div style={{fontSize:11.5, lineHeight:1.55, color:"var(--fg-muted)"}}>{b.sig}</div>
        </Card>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:5}}>Testing</div>
          <Row label="Recommended frequency" value={b.freq}/>
          <Row label="Fasting required" value={b.fasting ? "yes" : "no"}/>
          <Row label="Evidence level" value={b.ev}/>
          <Row label="Sample" value="serum"/>
        </Card>
      </div>

      {(suppl.length > 0 || meds.length > 0 || relatedSymptoms.length > 0) && (
        <>
          <div className="eyebrow" style={{marginBottom:6}}>Linked across modules</div>
          <div className="col-gap" style={{gap:6}}>
            {suppl.map((e,i) => (
              <div key={i} style={{display:"flex", alignItems:"center", gap:9, padding:9, background:"color-mix(in srgb, var(--acc-suppl) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-suppl) 22%, var(--border))", borderRadius:5}}>
                <Icon name="supplements" className="ic ic-sm" style={{color:"var(--acc-suppl)"}}/>
                <span style={{fontSize:11.5, flex:1}}>{e.supplement} since {e.start}</span>
                <span className="num" style={{fontSize:11}}>{e.baseline} → {e.latest}</span>
                <Pill variant={e.status==="effective"?"pos":e.status==="partial"?"":"idle"} style={{fontSize:9.5}}>{e.status.replace(/_/g," ")}</Pill>
              </div>
            ))}
            {meds.map(m => (
              <div key={m.id} style={{display:"flex", alignItems:"center", gap:9, padding:9, background:"color-mix(in srgb, var(--acc-medic) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-medic) 22%, var(--border))", borderRadius:5}}>
                <Icon name="medical" className="ic ic-sm" style={{color:"var(--acc-medic)"}}/>
                <span style={{fontSize:11.5, flex:1}}>{m.name} monitors this marker</span>
                <span className="dim mono" style={{fontSize:10}}>{m.monitoring_frequency}</span>
                {m.monitoring_overdue && <Pill variant="warn" style={{fontSize:9.5}}>overdue</Pill>}
              </div>
            ))}
            {relatedSymptoms.map(s => (
              <div key={s} style={{display:"flex", alignItems:"center", gap:9, padding:9, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:5}}>
                <Icon name="edit" className="ic ic-sm" style={{color:"var(--fg-muted)"}}/>
                <span style={{fontSize:11.5, flex:1}}>Associated with symptom: <span style={{textTransform:"capitalize"}}>{s.replace(/_/g," ")}</span></span>
              </div>
            ))}
          </div>
        </>
      )}
    </MMod>
  );
};

// ── Symptom detail ─────────────────────────────────────────
window.SymptomDetailModal = ({ s, onClose }) => {
  const linked = (SYMPTOM_BIOMARKER_MAP[s.name] || []).map(n => BIOMARKERS.find(b => b.name === n)).filter(Boolean);
  return (
    <MMod title={s.label} subtitle={`${s.cat} · onset ${s.onset}${s.resolved ? ` · resolved ${s.resolved}` : " · ongoing"}`} eyebrow="edit" accent="var(--warn)" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Update</button>{!s.resolved && <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Mark resolved</button>}</>}>
      <div className="grid g-cols-3" style={{gap:10, marginBottom:14}}>
        <Card className="card-tight" style={{padding:12}}><div className="eyebrow">Severity</div><div className="num" style={{fontSize:18, color: s.severity>=7?"var(--neg)":s.severity>=4?"var(--warn)":"var(--acc-recov)"}}>{s.severity}<span className="dim" style={{fontSize:11}}>/10</span></div></Card>
        <Card className="card-tight" style={{padding:12}}><div className="eyebrow">Daily impact</div><div className="num" style={{fontSize:18}}>{s.impact}<span className="dim" style={{fontSize:11}}>/10</span></div></Card>
        <Card className="card-tight" style={{padding:12}}><div className="eyebrow">Duration</div><div className="num" style={{fontSize:14}}>{s.resolved ? "resolved" : "ongoing"}</div><div className="dim" style={{fontSize:10}}>since {s.onset}</div></Card>
      </div>
      <div className="grid g-cols-2" style={{gap:12, marginBottom:14}}>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:5}}>Potential triggers</div>
          <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>{s.triggers.map(t => <Pill key={t}>{t}</Pill>)}</div>
        </Card>
        <Card className="card-tight" style={{padding:12}}>
          <div className="eyebrow" style={{marginBottom:5}}>Relieving factors</div>
          <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>{s.relieving.map(t => <Pill key={t} variant="pos">{t}</Pill>)}</div>
        </Card>
      </div>
      <div className="eyebrow" style={{marginBottom:6}}>Biomarkers associated with this symptom</div>
      <table className="tbl">
        <thead><tr><th>Biomarker</th><th style={{width:90, textAlign:"right"}}>Value</th><th style={{width:160}}>Range</th><th style={{width:110}}>Flag</th></tr></thead>
        <tbody>
          {linked.map(b => {
            const f = calcBiomarkerFlag(b.value, b);
            return (
              <tr key={b.id}>
                <td style={{fontSize:12}}>{b.name}</td>
                <td className="num right" style={{color:FLAG_META[f].c}}>{b.value} <span className="dim" style={{fontSize:9.5}}>{b.unit}</span></td>
                <td><RangeIndicator b={b} height={12} showLabels={false}/></td>
                <td><FlagPill flag={f}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{marginTop:12, padding:11, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, fontSize:11, color:"var(--fg-muted)", lineHeight:1.55}}>
        This is a statistical association from the biomarker catalog, not a diagnosis. Non-optimal values here may or may not relate to your symptom. Discuss with your doctor.
      </div>
      {s.photos > 0 && (
        <>
          <div className="eyebrow" style={{marginTop:14, marginBottom:6}}>Photos · {s.photos}</div>
          <div style={{display:"flex", gap:8}}>
            {Array.from({length:s.photos}).map((_,i) => (
              <div key={i} className="placeholder-img" style={{width:100, aspectRatio:"1", borderRadius:6, fontSize:9}}>photo {i+1}</div>
            ))}
          </div>
        </>
      )}
    </MMod>
  );
};

// ── Log symptom ────────────────────────────────────────────
window.LogSymptomModal = ({ onClose }) => {
  const [sev, setSev] = React.useState(5);
  const [impact, setImpact] = React.useState(4);
  const [name, setName] = React.useState("fatigue");
  const linked = (SYMPTOM_BIOMARKER_MAP[name] || []).map(n => BIOMARKERS.find(b => b.name === n)).filter(Boolean);
  return (
    <MMod title="Log symptom" subtitle="Tracked over time · correlated with biomarkers" eyebrow="plus" accent="var(--warn)" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Log symptom</button></>}>
      <div className="grid g-cols-2" style={{gap:10, marginBottom:12}}>
        <div>
          <div className="eyebrow" style={{marginBottom:4}}>Symptom</div>
          <select value={name} onChange={e=>setName(e.target.value)} style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}>
            {Object.keys(SYMPTOM_BIOMARKER_MAP).map(k => <option key={k} value={k}>{k.replace(/_/g," ")}</option>)}
            <option value="other">other (describe)</option>
          </select>
        </div>
        <div>
          <div className="eyebrow" style={{marginBottom:4}}>Category</div>
          <select style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}>
            <option>physical</option><option>mental</option><option>digestive</option><option>sleep</option><option>skin</option><option>respiratory</option>
          </select>
        </div>
      </div>
      <div className="eyebrow" style={{marginBottom:5}}>Severity · {sev}/10</div>
      <div style={{display:"flex", gap:3, marginBottom:12}}>
        {Array.from({length:10}).map((_,i) => (
          <button key={i} onClick={()=>setSev(i+1)} style={{flex:1, height:26, borderRadius:4, cursor:"pointer", border:0,
            background: i < sev ? (sev>=7?"var(--neg)":sev>=4?"var(--warn)":"var(--acc-recov)") : "var(--surface-2)",
            color: i+1===sev ? "var(--bg)" : "var(--fg-dim)", fontFamily:"var(--font-mono)", fontSize:10, fontWeight:600}}>{i+1}</button>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom:5}}>Impact on daily life · {impact}/10</div>
      <div style={{display:"flex", gap:3, marginBottom:12}}>
        {Array.from({length:10}).map((_,i) => (
          <button key={i} onClick={()=>setImpact(i+1)} style={{flex:1, height:26, borderRadius:4, cursor:"pointer", border:0,
            background: i < impact ? "var(--acc-medic)" : "var(--surface-2)",
            color: i+1===impact ? "var(--bg)" : "var(--fg-dim)", fontFamily:"var(--font-mono)", fontSize:10, fontWeight:600}}>{i+1}</button>
        ))}
      </div>
      <div className="grid g-cols-2" style={{gap:10, marginBottom:12}}>
        <div><div className="eyebrow" style={{marginBottom:4}}>Onset</div><input type="datetime-local" defaultValue="2026-08-15T09:00" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
        <div><div className="eyebrow" style={{marginBottom:4}}>Photos</div><button className="btn" style={{width:"100%", height:30, justifyContent:"center"}}><Icon name="camera" className="ic ic-sm"/>Attach</button></div>
      </div>
      <div className="eyebrow" style={{marginBottom:4}}>Potential triggers · comma-separated</div>
      <input placeholder="late caffeine, poor sleep, travel…" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, marginBottom:12}}/>
      {linked.length > 0 && (
        <div style={{padding:11, background:"color-mix(in srgb, var(--acc-medic) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-medic) 22%, var(--border))", borderRadius:6}}>
          <div className="eyebrow" style={{marginBottom:5, color:"var(--acc-medic)"}}>Markers LumeOS will check against this symptom</div>
          <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
            {linked.map(b => {
              const f = calcBiomarkerFlag(b.value,b);
              return <Pill key={b.id} style={f!=="optimal" ? {borderColor:`color-mix(in srgb, ${FLAG_META[f].c} 35%, var(--border))`, color:FLAG_META[f].c} : undefined}>{b.abbr} {b.value}</Pill>;
            })}
          </div>
        </div>
      )}
    </MMod>
  );
};

// ── Medication detail ──────────────────────────────────────
window.MedicationDetailModal = ({ m, onClose }) => (
  <MMod title={m.name} subtitle={`${m.type} · ${m.dosage} · ${m.frequency.replace(/_/g," ")}`} eyebrow="medical" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Edit</button>{m.monitoring_overdue && <button className="btn btn-primary">Schedule bloodwork</button>}</>}>
    <div className="grid g-cols-4" style={{gap:10, marginBottom:14}}>
      <Card className="card-tight" style={{padding:12}}><div className="eyebrow">Started</div><div className="num" style={{fontSize:13}}>{m.start ?? "—"}</div></Card>
      <Card className="card-tight" style={{padding:12}}><div className="eyebrow">Monitoring</div><div className="num" style={{fontSize:13}}>{m.monitoring ? m.monitoring_frequency : "none"}</div></Card>
      <Card className="card-tight" style={{padding:12}}><div className="eyebrow">Last test</div><div className="num" style={{fontSize:13}}>{m.last_test ?? "—"}</div></Card>
      <Card className="card-tight" style={{padding:12, background: m.monitoring_overdue ? "color-mix(in srgb, var(--warn) 6%, var(--surface))" : undefined, border: m.monitoring_overdue ? "1px solid color-mix(in srgb, var(--warn) 28%, var(--border))" : undefined}}>
        <div className="eyebrow" style={m.monitoring_overdue ? {color:"var(--warn)"} : undefined}>Next due</div>
        <div className="num" style={{fontSize:13, color: m.monitoring_overdue ? "var(--warn)" : "var(--fg)"}}>{m.next_due ?? "—"}</div>
      </Card>
    </div>
    <div className="eyebrow" style={{marginBottom:5}}>Indication</div>
    <div style={{fontSize:12.5, marginBottom:14}}>{m.indication}</div>
    {m.targets.length > 0 && (
      <>
        <div className="eyebrow" style={{marginBottom:6}}>Monitored biomarkers</div>
        <table className="tbl" style={{marginBottom:14}}>
          <thead><tr><th>Marker</th><th style={{width:100, textAlign:"right"}}>Current</th><th style={{width:150}}>Range</th><th style={{width:110}}>Flag</th></tr></thead>
          <tbody>
            {m.targets.map(t => {
              const b = BIOMARKERS.find(x => x.abbr === t);
              if (!b) return null;
              const f = calcBiomarkerFlag(b.value, b);
              return (
                <tr key={t}>
                  <td style={{fontSize:12}}>{b.name}</td>
                  <td className="num right" style={{color:FLAG_META[f].c}}>{b.value} <span className="dim" style={{fontSize:9.5}}>{b.unit}</span></td>
                  <td><RangeIndicator b={b} height={12} showLabels={false}/></td>
                  <td><FlagPill flag={f}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    )}
    {m.side_effects.length > 0 && (
      <><div className="eyebrow" style={{marginBottom:5}}>Reported side effects</div>
      <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:12}}>{m.side_effects.map(s => <Pill key={s} variant="warn">{s}</Pill>)}</div></>
    )}
    {m.interactions.length > 0 && (
      <div style={{padding:11, background:"color-mix(in srgb, var(--warn) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--warn) 24%, var(--border))", borderRadius:6}}>
        <div className="eyebrow" style={{marginBottom:5, color:"var(--warn)"}}>Known interactions</div>
        {m.interactions.map(x => <div key={x} style={{fontSize:11.5, color:"var(--fg-muted)", lineHeight:1.5}}>· {x}</div>)}
      </div>
    )}
    {m.physician && (
      <div style={{marginTop:12}}>
        <Row label="Prescriber" value={m.physician}/>
        <Row label="Prescription" value={m.rx ?? "—"}/>
      </div>
    )}
  </MMod>
);

// ── OCR review table ───────────────────────────────────────
window.OCRReviewModal = ({ onClose }) => {
  const auto = OCR_EXTRACTED.filter(x => x.action === "auto");
  const review = OCR_EXTRACTED.filter(x => x.action === "review");
  const reject = OCR_EXTRACTED.filter(x => x.action === "reject");
  return (
    <MMod title="Review extracted values" subtitle={`Q2 2026 panel · ${OCR_EXTRACTED.length} of 34 shown · ${auto.length} auto-accepted, ${review.length} need review`} eyebrow="camera" onClose={onClose} width={860}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel import</button><div className="spacer"/><span className="dim mono" style={{fontSize:10.5, alignSelf:"center", marginRight:8}}>{auto.length + review.length} values will be saved</span><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Confirm + save</button></>}>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{width:26}}></th>
            <th>Raw OCR text</th>
            <th>Matched biomarker</th>
            <th style={{width:80}}>LOINC</th>
            <th style={{width:120, textAlign:"right"}}>Value</th>
            <th style={{width:130}}>Normalized</th>
            <th style={{width:70, textAlign:"right"}}>Conf</th>
            <th style={{width:80}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {OCR_EXTRACTED.map((x,i) => {
            const c = x.conf >= 0.85 ? "var(--pos)" : x.conf >= 0.6 ? "var(--warn)" : "var(--neg)";
            return (
              <tr key={i} style={{background: x.action === "review" ? "color-mix(in srgb, var(--warn) 4%, transparent)" : x.action === "reject" ? "color-mix(in srgb, var(--neg) 4%, transparent)" : undefined}}>
                <td><input type="checkbox" defaultChecked={x.action !== "reject"} style={{accentColor:"var(--acc-medic)"}}/></td>
                <td className="mono" style={{fontSize:11}}>{x.raw}</td>
                <td style={{fontSize:11.5}}>{x.matched ?? <span style={{color:"var(--neg)"}}>no catalog match</span>}</td>
                <td className="mono dim" style={{fontSize:10}}>{x.loinc ?? "—"}</td>
                <td className="num right">{x.value} <span className="dim" style={{fontSize:9.5}}>{x.unit}</span></td>
                <td>
                  {x.converted
                    ? <span className="mono" style={{fontSize:10.5, color:"var(--acc-recov)"}}>× {x.converted.factor} → {x.converted.result} {x.converted.to}</span>
                    : <span className="dim mono" style={{fontSize:10}}>no conversion</span>}
                </td>
                <td className="num right" style={{color:c}}>{x.conf.toFixed(2)}</td>
                <td><Pill variant={x.action==="auto"?"pos":x.action==="review"?"warn":"neg"} style={{fontSize:9}}>{x.action}</Pill></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {reject.length > 0 && (
        <div style={{marginTop:12, padding:11, background:"color-mix(in srgb, var(--neg) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--neg) 24%, var(--border))", borderRadius:6, fontSize:11.5, color:"var(--fg-muted)", lineHeight:1.55}}>
          <Icon name="alert" className="ic ic-sm" style={{display:"inline", verticalAlign:"middle", marginRight:5, color:"var(--neg)"}}/>
          {reject.length} value below the 0.60 confidence floor and unmatched in the catalog ({reject.map(r=>r.raw).join(", ")}). Enter manually if needed.
        </div>
      )}
    </MMod>
  );
};

// ── Manual entry ───────────────────────────────────────────
window.ManualEntryModal = ({ onClose }) => (
  <MMod title="Add biomarker value" subtitle="manual entry · counts toward system scores" eyebrow="plus" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save value</button></>}>
    <div className="eyebrow" style={{marginBottom:4}}>Biomarker</div>
    <input placeholder="Search name, abbreviation, LOINC…" style={{width:"100%", height:32, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:7, padding:"0 12px", fontSize:12, marginBottom:12}}/>
    <div className="grid g-cols-4" style={{gap:10, marginBottom:12}}>
      <div><div className="eyebrow" style={{marginBottom:4}}>Value</div><input placeholder="0.0" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
      <div><div className="eyebrow" style={{marginBottom:4}}>Unit</div><input placeholder="ng/mL" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
      <div><div className="eyebrow" style={{marginBottom:4}}>Date</div><input type="date" defaultValue="2026-08-15" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
      <div><div className="eyebrow" style={{marginBottom:4}}>Fasting</div><select style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}><option>fasting</option><option>non-fasting</option><option>unknown</option></select></div>
    </div>
    <div className="eyebrow" style={{marginBottom:4}}>Lab</div>
    <input defaultValue="MVZ Lab Berlin" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}/>
  </MMod>
);

// ── Doctor export ──────────────────────────────────────────
window.DoctorExportModal = ({ onClose }) => (
  <MMod title="Generate doctor report" subtitle="PDF · 6 sections · legal notice included" eyebrow="download" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn"><Icon name="share" className="ic ic-sm"/>Share link (30d)</button><button className="btn btn-primary"><Icon name="download" className="ic ic-sm"/>Generate PDF</button></>}>
    <div className="grid g-cols-2" style={{gap:10, marginBottom:12}}>
      <div><div className="eyebrow" style={{marginBottom:4}}>Report type</div>
        <select style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}>
          <option>Comprehensive</option><option>Focused</option><option>Progress</option><option>Provider summary</option>
        </select></div>
      <div><div className="eyebrow" style={{marginBottom:4}}>Format</div>
        <select style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}>
          <option>PDF</option><option>FHIR R4 bundle</option><option>CSV</option>
        </select></div>
    </div>
    <div className="eyebrow" style={{marginBottom:6}}>Included sections</div>
    <div className="col-gap" style={{gap:4, marginBottom:12}}>
      {["Executive summary · system scores","Critical + flagged values","Full biomarker table (dual ranges)","Supplement effectiveness","Symptom overview · 90 days","Medication list + monitoring"].map(s => (
        <label key={s} style={{display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:5, fontSize:11.5, cursor:"pointer"}}>
          <input type="checkbox" defaultChecked style={{accentColor:"var(--acc-medic)"}}/>{s}
        </label>
      ))}
    </div>
    <div style={{padding:11, background:"color-mix(in srgb, var(--neg) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--neg) 24%, var(--border))", borderRadius:6, fontSize:11, lineHeight:1.6, color:"var(--fg-muted)", fontStyle:"italic"}}>
      Every report carries: "Dieser Report wurde von LumeOS erstellt. Die enthaltenen Informationen stellen keine medizinische Diagnose oder Therapieempfehlung dar. Bitte besprechen Sie alle Befunde mit Ihrem Arzt."
    </div>
  </MMod>
);

// ── Privacy tiers ──────────────────────────────────────────
window.PrivacyTiersModal = ({ onClose }) => {
  const [tier, setTier] = React.useState(1);
  const tiers = [
    { n:1, name:"Local-first", sub:"default", desc:"SQLite on device. No cloud sync. LumeOS never sees your medical data.", detail:["Zero-knowledge by construction","No server-side copy exists","Backup is your responsibility","Coach sharing unavailable"], c:"var(--pos)" },
    { n:2, name:"E2E encrypted cloud", sub:"opt-in", desc:"You hold the encryption key. Cloud stores ciphertext only.", detail:["User-generated key, never transmitted","Cross-device sync","LumeOS cannot decrypt","Key loss = data loss"], c:"var(--acc-recov)" },
    { n:3, name:"Provider sharing", sub:"opt-in, time-boxed", desc:"Time-limited access tokens for named providers.", detail:["Max 30-day expiry per token","Per-category scoping","One-time access links","Full audit trail of every view"], c:"var(--acc-medic)" },
  ];
  return (
    <MMod title="Privacy architecture" subtitle="Medical data is the most sensitive category — defaults are restrictive" eyebrow="shield" onClose={onClose} width={720}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary">Apply tier {tier}</button></>}>
      <div className="col-gap" style={{gap:8, marginBottom:14}}>
        {tiers.map(t => (
          <div key={t.n} onClick={() => setTier(t.n)} style={{
            padding:14, borderRadius:8, cursor:"pointer",
            background: tier === t.n ? `color-mix(in srgb, ${t.c} 7%, var(--surface))` : "var(--surface)",
            border: `1px solid ${tier === t.n ? `color-mix(in srgb, ${t.c} 35%, var(--border))` : "var(--border)"}`,
          }}>
            <div style={{display:"flex", alignItems:"center", gap:9, marginBottom:5}}>
              <div style={{width:22, height:22, borderRadius:999, background: tier===t.n ? t.c : "var(--surface-2)", color: tier===t.n ? "var(--bg)" : "var(--fg-dim)", display:"grid", placeItems:"center", fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700}}>{t.n}</div>
              <span style={{fontSize:13.5, fontWeight:600}}>{t.name}</span>
              <Pill style={{borderColor:`color-mix(in srgb, ${t.c} 35%, var(--border))`, color:t.c}}>{t.sub}</Pill>
              {tier === t.n && <Pill variant="pos" style={{marginLeft:"auto"}}>active</Pill>}
            </div>
            <div className="muted" style={{fontSize:11.5, lineHeight:1.5, marginBottom:8}}>{t.desc}</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:4}}>
              {t.detail.map(d => (
                <div key={d} style={{fontSize:10.5, color:"var(--fg-dim)", display:"flex", gap:5, alignItems:"flex-start"}}>
                  <span style={{color:t.c}}>·</span>{d}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom:6}}>Compliance</div>
      <div className="grid g-cols-2" style={{gap:8}}>
        {[
          ["HIPAA","RLS + encryption at rest"],
          ["GDPR","right to deletion, data export"],
          ["LOINC","all biomarkers mapped"],
          ["FHIR R4","export format for provider sharing"],
        ].map(([k,v]) => (
          <div key={k} style={{padding:9, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:5}}>
            <div className="eyebrow" style={{marginBottom:2}}>{k}</div>
            <div className="dim" style={{fontSize:10.5}}>{v}</div>
          </div>
        ))}
      </div>
    </MMod>
  );
};
