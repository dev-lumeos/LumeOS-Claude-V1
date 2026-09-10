// Medical · UI rebuild — 5 spec tabs: Dashboard · Biomarkers · Import · Tracking · Insights

const MedCtx2 = React.createContext(null);

const MedicalModuleV2 = () => {
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({ type, payload });
  const close = () => setModal(null);
  const overall = calcOverallHealthScore();
  const alerts = generateAlerts();
  const criticals = alerts.filter(a => a.severity === "critical").length;

  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Medical</span>
            <Pill style={{borderColor:"color-mix(in srgb, var(--acc-medic) 35%, var(--border))", color:"var(--acc-medic)", background:"color-mix(in srgb, var(--acc-medic) 6%, transparent)"}}>Local-first · encrypted</Pill>
            <Pill><span className="dot" style={{background: overall.score>=85?"var(--pos)":overall.score>=70?"var(--acc-recov)":"var(--warn)"}}/>Health score {overall.score}</Pill>
            {alerts.length > 0 && <Pill variant={criticals ? "neg" : "warn"}>{alerts.length} alert{alerts.length===1?"":"s"}</Pill>}
          </div>
          <div className="module-sub">{BIOMARKERS.length} biomarkers · LOINC-mapped · dual-range (lab + optimal) · no diagnosis, no therapy advice</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => open("export")}><Icon name="download" className="ic ic-sm"/>Doctor export</button>
          <button className="btn" onClick={() => open("privacy")}><Icon name="shield" className="ic ic-sm"/>Privacy</button>
          <button className="btn btn-primary" onClick={() => setTab("import")}><Icon name="camera" className="ic ic-sm"/>Import lab</button>
        </div>
      </div>

      <Tabs items={[
        { id:"dashboard",  label:"Dashboard",  icon:"dashboard" },
        { id:"biomarkers", label:"Biomarkers", icon:"trend_up", count: BIOMARKERS.length },
        { id:"import",     label:"Import",     icon:"camera" },
        { id:"tracking",   label:"Tracking",   icon:"edit",     count: SYMPTOMS.filter(s=>!s.resolved).length + MEDICATIONS_V2.filter(m=>m.status==="active").length },
        { id:"insights",   label:"Insights",   icon:"sparkles", count: CORRELATIONS.length },
      ]} active={tab} onChange={setTab}/>

      <MedCtx2.Provider value={{ open, close }}>
        {tab === "dashboard"  && <MedDashboard/>}
        {tab === "biomarkers" && <MedBiomarkers/>}
        {tab === "import"     && <MedImport/>}
        {tab === "tracking"   && <MedTracking/>}
        {tab === "insights"   && <MedInsights/>}
      </MedCtx2.Provider>

      {modal?.type === "biomarker" && <BiomarkerDetailModal b={modal.payload} onClose={close}/>}
      {modal?.type === "symptom"   && <SymptomDetailModal s={modal.payload} onClose={close}/>}
      {modal?.type === "logSymptom"&& <LogSymptomModal onClose={close}/>}
      {modal?.type === "med"       && <MedicationDetailModal m={modal.payload} onClose={close}/>}
      {modal?.type === "export"    && <DoctorExportModal onClose={close}/>}
      {modal?.type === "privacy"   && <PrivacyTiersModal onClose={close}/>}
      {modal?.type === "ocrReview" && <OCRReviewModal onClose={close}/>}
      {modal?.type === "manualEntry" && <ManualEntryModal onClose={close}/>}
    </>
  );
};

// ── Shared: dual-range indicator ───────────────────────────
const RangeIndicator = ({ b, height = 26, showLabels = true }) => {
  const flag = calcBiomarkerFlag(b.value, b);
  const meta = FLAG_META[flag];
  const lo = b.critical_low ?? (b.lab_min != null ? b.lab_min * 0.5 : 0);
  const hi = b.critical_high ?? (b.lab_max != null ? b.lab_max * 1.5 : b.value * 1.5);
  const span = hi - lo || 1;
  const pos = v => Math.max(0, Math.min(100, ((v - lo) / span) * 100));
  const labL = b.lab_min != null ? pos(b.lab_min) : 0;
  const labR = b.lab_max != null ? pos(b.lab_max) : 100;
  const optL = b.optimal_min != null ? pos(b.optimal_min) : labL;
  const optR = b.optimal_max != null ? pos(b.optimal_max) : labR;
  const valPos = pos(b.value);
  return (
    <div>
      <div style={{position:"relative", height, borderRadius:5, overflow:"hidden", background:"color-mix(in srgb, var(--neg) 20%, var(--surface-2))", border:"1px solid var(--border)"}}>
        {/* lab-normal band */}
        <div style={{position:"absolute", left:`${labL}%`, width:`${labR-labL}%`, top:0, bottom:0, background:"color-mix(in srgb, var(--acc-recov) 26%, transparent)"}}/>
        {/* optimal band */}
        <div style={{position:"absolute", left:`${optL}%`, width:`${optR-optL}%`, top:0, bottom:0, background:"color-mix(in srgb, var(--pos) 34%, transparent)"}}/>
        {/* value marker */}
        <div style={{position:"absolute", left:`${valPos}%`, top:-2, bottom:-2, width:2.5, background:meta.c, boxShadow:"0 0 0 1.5px var(--bg)", borderRadius:2}}/>
      </div>
      {showLabels && (
        <div style={{display:"flex", justifyContent:"space-between", marginTop:4, fontSize:9, color:"var(--fg-dim)", fontFamily:"var(--font-mono)"}}>
          <span>{b.critical_low ?? "—"}</span>
          <span style={{color:"var(--acc-recov)"}}>lab {b.lab_min}–{b.lab_max}</span>
          <span style={{color:"var(--pos)"}}>optimal {b.optimal_min}–{b.optimal_max}</span>
          <span>{b.critical_high ?? "—"}</span>
        </div>
      )}
    </div>
  );
};

const FlagPill = ({ flag, small }) => {
  const m = FLAG_META[flag];
  return <Pill style={{borderColor:`color-mix(in srgb, ${m.c} 35%, var(--border))`, color:m.c, background:`color-mix(in srgb, ${m.c} 8%, transparent)`, fontSize: small ? 9 : undefined}}>{m.label}</Pill>;
};

const TrendBadge = ({ hist }) => {
  const t = calcBiomarkerTrend(hist);
  if (t.direction === "insufficient_data") return <span className="dim mono" style={{fontSize:10}}>n&lt;3</span>;
  const arrow = t.direction === "rising" ? "↑" : t.direction === "falling" ? "↓" : "→";
  const c = t.strength === "significant" ? "var(--fg)" : t.strength === "mild" ? "var(--fg-muted)" : "var(--fg-dim)";
  return (
    <span className="mono" style={{fontSize:10.5, color:c}} title={`${t.direction} · ${t.strength} · ${t.change_pct}% over ${t.n} points`}>
      {arrow} {t.change_pct > 0 ? "+" : ""}{t.change_pct}%
    </span>
  );
};

// ═══ TAB 1 · DASHBOARD ═════════════════════════════════════
const MedDashboard = () => {
  const { open } = React.useContext(MedCtx2);
  const overall = calcOverallHealthScore();
  const alerts = generateAlerts();
  const systems = Object.keys(SYSTEM_META).map(k => ({ key:k, ...SYSTEM_META[k], ...calcSystemScore(k) }));
  const trajectory = "stable";

  return (
    <div>
      {alerts.filter(a => a.severity === "critical").length > 0 && (
        <div style={{padding:14, background:"color-mix(in srgb, var(--neg) 8%, var(--surface))", border:"1px solid color-mix(in srgb, var(--neg) 35%, var(--border))", borderRadius:8, marginBottom:14, display:"flex", alignItems:"center", gap:12}}>
          <Icon name="alert" className="ic" style={{color:"var(--neg)"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:600, color:"var(--neg)"}}>{alerts.filter(a=>a.severity==="critical").length} critical value{alerts.filter(a=>a.severity==="critical").length===1?"":"s"}</div>
            <div className="muted" style={{fontSize:11.5}}>Contact your doctor immediately. LumeOS does not diagnose.</div>
          </div>
        </div>
      )}

      <div className="grid" style={{gridTemplateColumns:"1.5fr 1fr", gap:14}}>
        <div className="col-gap" style={{gap:14}}>
          <Card title="Health score" sub={`weighted across 5 systems · ${Math.round(overall.data_completeness*100)}% data completeness`}>
            <div style={{display:"flex", gap:20, alignItems:"center"}}>
              <Ring value={overall.score} max={100} color={overall.score>=85?"var(--pos)":overall.score>=70?"var(--acc-recov)":"var(--warn)"} label={overall.status} size={132} stroke={9}/>
              <div style={{flex:1}}>
                <div className="grid g-cols-2" style={{gap:8}}>
                  {systems.map(s => (
                    <div key={s.key} style={{padding:10, background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:6}}>
                      <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                        <span className="dot" style={{background:s.c, width:7, height:7}}/>
                        <span style={{fontSize:11.5, fontWeight:600}}>{s.label}</span>
                        <span className="num" style={{marginLeft:"auto", fontSize:14, color: s.score>=85?"var(--pos)":s.score>=65?"var(--acc-recov)":s.score>=40?"var(--warn)":"var(--neg)"}}>{s.score ?? "—"}</span>
                      </div>
                      <Meter value={s.score ?? 0} color={s.score>=85?"var(--pos)":s.score>=65?"var(--acc-recov)":s.score>=40?"var(--warn)":"var(--neg)"}/>
                      <div className="dim mono" style={{fontSize:9, marginTop:3}}>{s.marker_count} markers{s.missing ? ` · ${s.missing} missing` : ""} · weight {Math.round((SYSTEM_WEIGHTS[s.key]||0)*100)}%</div>
                    </div>
                  ))}
                  <div style={{padding:10, background:"var(--surface)", border:"1px dashed var(--border)", borderRadius:6, display:"flex", flexDirection:"column", justifyContent:"center"}}>
                    <div className="eyebrow" style={{marginBottom:3}}>Trajectory</div>
                    <div style={{fontSize:13, fontWeight:600}}>{trajectory}</div>
                    <div className="dim" style={{fontSize:10}}>vs. previous panel</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="divider"/>
            <div className="dim mono" style={{fontSize:10, lineHeight:1.7}}>
              overall = Σ(system_score × weight) / Σ(weight_with_data)<br/>
              weights: cardiovascular .25 · metabolic .25 · hormonal .20 · liver .15 · kidney .15<br/>
              flag scores: optimal 100 · normal 75 · low/high 40 · critical 10
            </div>
          </Card>

          <Card title="Alerts" sub={`${alerts.length} active · sorted by severity`}>
            <div className="col-gap" style={{gap:6}}>
              {alerts.map(a => {
                const c = a.severity === "critical" ? "var(--neg)" : a.severity === "warning" ? "var(--warn)" : "var(--acc-recov)";
                return (
                  <div key={a.id} onClick={() => a.biomarker && open("biomarker", a.biomarker)}
                    style={{display:"flex", gap:12, padding:11, background:`color-mix(in srgb, ${c} 5%, var(--surface))`, border:`1px solid color-mix(in srgb, ${c} 26%, var(--border))`, borderRadius:6, cursor: a.biomarker ? "pointer" : "default"}}>
                    <div style={{width:3, alignSelf:"stretch", background:c, borderRadius:2}}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap"}}>
                        <Pill style={{borderColor:`color-mix(in srgb, ${c} 35%, var(--border))`, color:c}}>{a.severity}</Pill>
                        <span style={{fontSize:12.5, fontWeight:600}}>{a.biomarker ? a.biomarker.name : a.medication?.name}</span>
                        {a.biomarker && <span className="num" style={{color:c}}>{a.value} {a.biomarker.unit}</span>}
                        <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>{a.type.replace(/_/g," ")}</span>
                      </div>
                      <div className="muted" style={{fontSize:11}}>
                        {a.biomarker
                          ? `lab ${a.biomarker.lab_min}–${a.biomarker.lab_max} · optimal ${a.biomarker.optimal_min}–${a.biomarker.optimal_max} ${a.biomarker.unit}`
                          : `${a.medication?.name} monitoring due ${a.medication?.next_due}`}
                      </div>
                    </div>
                    <div style={{alignSelf:"center", textAlign:"right"}}>
                      <div className="mono" style={{fontSize:10.5, color:c}}>{a.action}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="col-gap" style={{gap:14}}>
          <Card title="Quick actions">
            <div className="qa-grid">
              <button className="qa" onClick={() => open("manualEntry")}><Icon name="plus"/>Add value</button>
              <button className="qa" onClick={() => open("logSymptom")}><Icon name="edit"/>Log symptom</button>
              <button className="qa" onClick={() => open("export")}><Icon name="download"/>Doctor PDF</button>
              <button className="qa" onClick={() => open("privacy")}><Icon name="shield"/>Privacy tier</button>
            </div>
          </Card>

          <Card title="Last panel" sub="23 Apr 2026 · MVZ Lab Berlin">
            <Row label="Markers imported" value="34"/>
            <Row label="Flagged non-optimal" value={String(BIOMARKERS.filter(b => calcBiomarkerFlag(b.value,b) !== "optimal").length)}/>
            <Row label="Out of lab range" value={String(BIOMARKERS.filter(b => ["low","high","critical_low","critical_high"].includes(calcBiomarkerFlag(b.value,b))).length)}/>
            <Row label="Next panel due" value="15 Jul 2026"/>
            <Row label="Days overdue" value="31"/>
          </Card>

          <Card title="Non-optimal markers" sub="lab-normal but below optimum">
            <div className="col-gap" style={{gap:5}}>
              {BIOMARKERS.filter(b => calcBiomarkerFlag(b.value,b) === "normal").sort((a,b)=>b.prio-a.prio).slice(0,6).map(b => (
                <div key={b.id} onClick={() => open("biomarker", b)} style={{display:"flex", alignItems:"center", gap:8, padding:"7px 9px", background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer"}}>
                  <span style={{fontSize:11.5, flex:1}}>{b.name}</span>
                  <span className="num" style={{fontSize:11}}>{b.value}</span>
                  <span className="dim mono" style={{fontSize:9.5}}>opt {b.optimal_min}–{b.optimal_max}</span>
                </div>
              ))}
            </div>
            <div className="dim" style={{fontSize:10.5, marginTop:8, lineHeight:1.5}}>
              These fall inside the lab's normal band but outside the performance/longevity optimum. Not abnormal — improvable.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ═══ TAB 2 · BIOMARKERS ════════════════════════════════════
const MedBiomarkers = () => {
  const { open } = React.useContext(MedCtx2);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const list = BIOMARKERS
    .filter(b => cat === "all" || b.cat === cat)
    .filter(b => !q || (b.name + b.de + b.abbr + b.loinc).toLowerCase().includes(q.toLowerCase()))
    .filter(b => !onlyFlagged || calcBiomarkerFlag(b.value,b) !== "optimal")
    .sort((a,b) => b.prio - a.prio);

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:12}}>
        <div style={{flex:1, position:"relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--fg-subtle)"}}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${BIOMARKERS.length} biomarkers · name, abbreviation, LOINC…`}
            style={{width:"100%", height:32, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:7, padding:"0 12px 0 30px", fontSize:12}}/>
        </div>
        <button onClick={() => setOnlyFlagged(v=>!v)} className={onlyFlagged ? "btn btn-primary" : "btn"}>
          <Icon name="filter" className="ic ic-sm"/>Non-optimal only
        </button>
      </div>
      <div style={{display:"flex", gap:5, marginBottom:14, flexWrap:"wrap"}}>
        {BIOMARKER_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className={cat===c.id ? "pill pill-acc" : "pill"} style={{cursor:"pointer", padding:"3px 10px", fontSize:11}}>
            {c.label}
            <span className="dim" style={{marginLeft:4}}>{c.id==="all" ? BIOMARKERS.length : BIOMARKERS.filter(b=>b.cat===c.id).length}</span>
          </button>
        ))}
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th>Biomarker</th>
              <th style={{width:90}}>LOINC</th>
              <th style={{width:90, textAlign:"right"}}>Value</th>
              <th style={{width:190}}>Lab · optimal · you</th>
              <th style={{width:110}}>Flag</th>
              <th style={{width:80}}>Trend</th>
              <th style={{width:80}}>Sparkline</th>
              <th style={{width:26}}></th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => {
              const flag = calcBiomarkerFlag(b.value, b);
              const m = FLAG_META[flag];
              return (
                <tr key={b.id} className="clickable" style={{cursor:"pointer"}} onClick={() => open("biomarker", b)}>
                  <td>
                    <div style={{fontSize:12.5, fontWeight:500}}>{b.name}</div>
                    <div className="dim mono" style={{fontSize:9.5}}>{b.abbr} · {b.cat.replace(/_/g," ")} · ev {b.ev}</div>
                  </td>
                  <td className="mono dim" style={{fontSize:10.5}}>{b.loinc}</td>
                  <td className="num" style={{textAlign:"right", color:m.c, fontWeight:600}}>
                    {b.value}<span className="dim" style={{fontSize:9.5, marginLeft:3}}>{b.unit}</span>
                  </td>
                  <td style={{padding:"6px 8px 6px 0"}}><RangeIndicator b={b} height={16} showLabels={false}/></td>
                  <td><FlagPill flag={flag}/></td>
                  <td><TrendBadge hist={b.hist}/></td>
                  <td style={{padding:"4px 8px 4px 0"}}><Sparkline data={b.hist} color={m.c} h={20}/></td>
                  <td><Icon name="chevron_right" className="ic ic-sm" style={{color:"var(--fg-dim)"}}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ═══ TAB 3 · IMPORT ════════════════════════════════════════
const MedImport = () => {
  const { open } = React.useContext(MedCtx2);
  const [sub, setSub] = useState("upload");
  const auto = OCR_EXTRACTED.filter(x => x.action === "auto").length;
  const review = OCR_EXTRACTED.filter(x => x.action === "review").length;
  const reject = OCR_EXTRACTED.filter(x => x.action === "reject").length;

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:14}}>
        <div style={{display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:7, padding:2, gap:1}}>
          {[["upload","OCR upload"],["manual","Manual entry"],["history","Import history"],["units","Unit conversions"]].map(([k,l]) => (
            <button key={k} onClick={()=>setSub(k)} className={sub===k?"btn btn-primary":"btn btn-ghost"} style={{height:24, fontSize:11, padding:"0 12px", borderRadius:5}}>{l}</button>
          ))}
        </div>
      </div>

      {sub === "upload" && (
        <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:14}}>
          <div className="col-gap" style={{gap:14}}>
            <Card title="Upload lab report" sub="PDF or photo · max 20 MB · Claude Vision extraction">
              <div style={{padding:36, border:"1px dashed var(--border)", borderRadius:8, textAlign:"center", background:"var(--surface)", cursor:"pointer", marginBottom:12}}>
                <Icon name="camera" className="ic" style={{width:30, height:30, color:"var(--fg-dim)", margin:"0 auto 10px"}}/>
                <div style={{fontSize:13, fontWeight:600, marginBottom:4}}>Drop PDF or image here</div>
                <div className="dim" style={{fontSize:11}}>or use camera · German, English, Thai lab formats supported</div>
              </div>
              <div style={{display:"flex", gap:6}}>
                <button className="btn"><Icon name="camera" className="ic ic-sm"/>Camera</button>
                <button className="btn"><Icon name="file" className="ic ic-sm"/>Choose file</button>
                <div className="spacer"/>
                <button className="btn btn-primary" onClick={() => open("ocrReview")}>Simulate extraction →</button>
              </div>
            </Card>

            <Card title="Pipeline" sub="7 steps · SPEC_04 Feature 2">
              <div className="col-gap" style={{gap:5}}>
                {[
                  ["1","Upload to storage","file → Supabase Storage, LabReport row created"],
                  ["2","Claude Vision call","system prompt requests JSON with per-value confidence"],
                  ["3","Entity matching","extracted name → alias table → LOINC → biomarker_id"],
                  ["4","Unit normalization","mmol/L → mg/dL etc. via conversion map"],
                  ["5","Plausibility check","value outside biologically possible range → flag"],
                  ["6","Review UI","confidence < 0.85 or no biomarker match"],
                  ["7","Confirm + insert","user accepts → UserBiomarkerResult rows written"],
                ].map(([n,t,d]) => (
                  <div key={n} style={{display:"flex", gap:10, padding:9, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6}}>
                    <div style={{width:20, height:20, borderRadius:999, background:"var(--acc-medic)", color:"var(--bg)", display:"grid", placeItems:"center", fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700, flexShrink:0}}>{n}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12, fontWeight:600, marginBottom:2}}>{t}</div>
                      <div className="dim" style={{fontSize:10.5, lineHeight:1.45}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col-gap" style={{gap:14}}>
            <Card title="Confidence thresholds">
              <div className="col-gap" style={{gap:6}}>
                {[
                  ["≥ 0.85","Auto-accept","var(--pos)", `${auto} values`],
                  ["0.60 – 0.84","User review required","var(--warn)", `${review} values`],
                  ["< 0.60","Reject · manual entry","var(--neg)", `${reject} value`],
                ].map(([r,a,c,n]) => (
                  <div key={r} style={{display:"flex", alignItems:"center", gap:10, padding:10, background:`color-mix(in srgb, ${c} 5%, var(--surface))`, border:`1px solid color-mix(in srgb, ${c} 26%, var(--border))`, borderRadius:6}}>
                    <span className="num" style={{fontSize:12, color:c, width:78}}>{r}</span>
                    <span style={{fontSize:12, flex:1}}>{a}</span>
                    <span className="dim mono" style={{fontSize:10}}>{n}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Last extraction" sub="Q2 2026 panel · 12 of 34 shown" actions={<button className="btn btn-sm" onClick={() => open("ocrReview")}>Open review</button>}>
              <table className="tbl">
                <thead><tr><th>Raw text</th><th>Matched</th><th style={{width:70, textAlign:"right"}}>Conf</th><th style={{width:70}}>Action</th></tr></thead>
                <tbody>
                  {OCR_EXTRACTED.slice(0,7).map((x,i) => (
                    <tr key={i}>
                      <td className="mono" style={{fontSize:11}}>{x.raw}</td>
                      <td style={{fontSize:11.5}}>{x.matched ?? <span className="dim">no match</span>}</td>
                      <td className="num" style={{textAlign:"right", color: x.conf>=0.85?"var(--pos)":x.conf>=0.6?"var(--warn)":"var(--neg)"}}>{x.conf.toFixed(2)}</td>
                      <td><Pill variant={x.action==="auto"?"pos":x.action==="review"?"warn":"neg"} style={{fontSize:9}}>{x.action}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {sub === "manual" && (
        <Card title="Manual entry" sub="search catalog → enter value">
          <div style={{maxWidth:640}}>
            <div className="eyebrow" style={{marginBottom:4}}>Biomarker</div>
            <input placeholder="Search by name, abbreviation, or LOINC…" style={{width:"100%", height:32, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:7, padding:"0 12px", fontSize:12, marginBottom:12}}/>
            <div className="grid g-cols-4" style={{gap:10, marginBottom:12}}>
              <div><div className="eyebrow" style={{marginBottom:4}}>Value</div><input placeholder="0.0" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
              <div><div className="eyebrow" style={{marginBottom:4}}>Unit</div><input placeholder="ng/mL" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
              <div><div className="eyebrow" style={{marginBottom:4}}>Test date</div><input type="date" defaultValue="2026-08-15" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
              <div><div className="eyebrow" style={{marginBottom:4}}>Fasting</div><select style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}><option>fasting</option><option>non-fasting</option><option>unknown</option></select></div>
            </div>
            <div className="grid g-cols-3" style={{gap:10, marginBottom:12}}>
              <div><div className="eyebrow" style={{marginBottom:4}}>Lab name</div><input defaultValue="MVZ Lab Berlin" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}/></div>
              <div><div className="eyebrow" style={{marginBottom:4}}>Lab range min</div><input placeholder="optional" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
              <div><div className="eyebrow" style={{marginBottom:4}}>Lab range max</div><input placeholder="optional" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
            </div>
            <div className="eyebrow" style={{marginBottom:4}}>Notes</div>
            <input placeholder="Context, symptoms at time of test…" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, marginBottom:14}}/>
            <button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save value</button>
          </div>
        </Card>
      )}

      {sub === "history" && (
        <Card title="Import history" sub={`${LAB_REPORTS.length} reports · ${LAB_REPORTS.reduce((s,r)=>s+r.markers,0)} markers total`}>
          <table className="tbl">
            <thead><tr><th style={{width:90}}>ID</th><th style={{width:100}}>Date</th><th>Lab</th><th>File</th><th style={{width:80, textAlign:"right"}}>Markers</th><th style={{width:100, textAlign:"right"}}>Needs review</th><th style={{width:100}}>Status</th></tr></thead>
            <tbody>
              {LAB_REPORTS.map(r => (
                <tr key={r.id} className="clickable" style={{cursor:"pointer"}}>
                  <td className="num">{r.id}</td>
                  <td className="num muted">{r.date}</td>
                  <td>{r.lab}</td>
                  <td className="mono dim" style={{fontSize:10.5}}>{r.file} · {r.size}</td>
                  <td className="num right">{r.markers}</td>
                  <td className="num right" style={{color: r.needs_review ? "var(--warn)" : "var(--fg-dim)"}}>{r.needs_review || "—"}</td>
                  <td><Pill variant="pos">{r.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {sub === "units" && (
        <Card title="Unit normalization map" sub="applied automatically during OCR import">
          <table className="tbl">
            <thead><tr><th>Analyte</th><th style={{width:110}}>From</th><th style={{width:110}}>To</th><th style={{width:110, textAlign:"right"}}>Factor</th><th>Example</th></tr></thead>
            <tbody>
              {UNIT_CONVERSIONS.map((c,i) => (
                <tr key={i}>
                  <td>{c.analyte}</td>
                  <td className="mono">{c.from}</td>
                  <td className="mono">{c.to}</td>
                  <td className="num right">× {c.factor}</td>
                  <td className="dim mono" style={{fontSize:10.5}}>5.66 {c.from} → {(5.66*c.factor).toFixed(2)} {c.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// ═══ TAB 4 · TRACKING (symptoms + medications) ═════════════
const MedTracking = () => {
  const { open } = React.useContext(MedCtx2);
  const [sub, setSub] = useState("symptoms");
  const active = SYMPTOMS.filter(s => !s.resolved);
  const overdue = MEDICATIONS_V2.filter(m => m.monitoring_overdue);

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:14, alignItems:"center"}}>
        <div style={{display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:7, padding:2, gap:1}}>
          {[["symptoms",`Symptoms · ${active.length}`],["medications",`Medications · ${MEDICATIONS_V2.length}`]].map(([k,l]) => (
            <button key={k} onClick={()=>setSub(k)} className={sub===k?"btn btn-primary":"btn btn-ghost"} style={{height:24, fontSize:11, padding:"0 12px", borderRadius:5}}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        {sub === "symptoms" && <button className="btn btn-primary" onClick={() => open("logSymptom")}><Icon name="plus" className="ic ic-sm"/>Log symptom</button>}
        {sub === "medications" && <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add medication</button>}
      </div>

      {sub === "symptoms" && (
        <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr", gap:14}}>
          <div className="col-gap" style={{gap:12}}>
            {SYMPTOMS.map(s => {
              const linked = (SYMPTOM_BIOMARKER_MAP[s.name] || [])
                .map(n => BIOMARKERS.find(b => b.name === n))
                .filter(Boolean)
                .map(b => ({ b, flag: calcBiomarkerFlag(b.value, b) }))
                .filter(x => x.flag !== "optimal");
              return (
                <Card key={s.id} onClick={() => open("symptom", s)} style={{cursor:"pointer"}}>
                  <div style={{display:"flex", alignItems:"flex-start", gap:12}}>
                    <div style={{width:3, alignSelf:"stretch", background: s.resolved ? "var(--fg-dim)" : "var(--warn)", borderRadius:2}}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap"}}>
                        <span style={{fontSize:13.5, fontWeight:600}}>{s.label}</span>
                        <Pill>{s.cat}</Pill>
                        {s.resolved ? <Pill variant="pos">resolved</Pill> : <Pill variant="warn">active</Pill>}
                        {s.photos > 0 && <Pill><Icon name="camera" className="ic ic-sm"/>{s.photos}</Pill>}
                        <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>{s.onset}{s.resolved ? ` → ${s.resolved}` : ""}</span>
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:8}}>
                        <div>
                          <div className="eyebrow" style={{marginBottom:3}}>Severity · {s.severity}/10</div>
                          <div style={{display:"flex", gap:2}}>
                            {Array.from({length:10}).map((_,i) => (
                              <div key={i} style={{flex:1, height:6, borderRadius:1, background: i < s.severity ? (s.severity>=7?"var(--neg)":s.severity>=4?"var(--warn)":"var(--acc-recov)") : "var(--surface-2)"}}/>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="eyebrow" style={{marginBottom:3}}>Daily impact · {s.impact}/10</div>
                          <div style={{display:"flex", gap:2}}>
                            {Array.from({length:10}).map((_,i) => (
                              <div key={i} style={{flex:1, height:6, borderRadius:1, background: i < s.impact ? "var(--acc-medic)" : "var(--surface-2)"}}/>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom: linked.length ? 8 : 0}}>
                        {s.triggers.map(t => <Pill key={t} style={{fontSize:9.5}}>trigger: {t}</Pill>)}
                        {s.relieving.map(t => <Pill key={t} variant="pos" style={{fontSize:9.5}}>helps: {t}</Pill>)}
                      </div>
                      {linked.length > 0 && (
                        <div style={{padding:9, background:"color-mix(in srgb, var(--acc-medic) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-medic) 22%, var(--border))", borderRadius:5}}>
                          <div className="eyebrow" style={{marginBottom:4, color:"var(--acc-medic)"}}>Non-optimal markers linked to this symptom</div>
                          <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
                            {linked.map(({b,flag}) => (
                              <Pill key={b.id} style={{borderColor:`color-mix(in srgb, ${FLAG_META[flag].c} 35%, var(--border))`, color:FLAG_META[flag].c, fontSize:9.5}}>
                                {b.abbr} {b.value} {b.unit}
                              </Pill>
                            ))}
                          </div>
                          <div className="dim" style={{fontSize:10, marginTop:5, lineHeight:1.45}}>Association only — not a diagnosis. Discuss with your doctor.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Card title="Symptom → biomarker map" sub="which markers to check per symptom">
            <div className="col-gap" style={{gap:8}}>
              {Object.entries(SYMPTOM_BIOMARKER_MAP).map(([sym, markers]) => (
                <div key={sym} style={{padding:10, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6}}>
                  <div style={{fontSize:12, fontWeight:600, marginBottom:5, textTransform:"capitalize"}}>{sym.replace(/_/g," ")}</div>
                  <div style={{display:"flex", gap:3, flexWrap:"wrap"}}>
                    {markers.map(m => {
                      const b = BIOMARKERS.find(x => x.name === m);
                      const flag = b ? calcBiomarkerFlag(b.value,b) : null;
                      return <Pill key={m} style={flag && flag!=="optimal" ? {borderColor:`color-mix(in srgb, ${FLAG_META[flag].c} 35%, var(--border))`, color:FLAG_META[flag].c, fontSize:9.5} : {fontSize:9.5}}>{b?.abbr ?? m}</Pill>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {sub === "medications" && (
        <div>
          {overdue.length > 0 && (
            <div style={{padding:12, background:"color-mix(in srgb, var(--warn) 6%, var(--surface))", border:"1px solid color-mix(in srgb, var(--warn) 28%, var(--border))", borderRadius:7, marginBottom:14, display:"flex", alignItems:"center", gap:10}}>
              <Icon name="alert" className="ic" style={{color:"var(--warn)"}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5, fontWeight:600}}>{overdue.length} medications with overdue monitoring</div>
                <div className="muted" style={{fontSize:11}}>{overdue.map(m=>m.name).join(" · ")} — bloodwork due since {overdue[0].next_due}</div>
              </div>
              <button className="btn btn-sm">Schedule panel</button>
            </div>
          )}
          <div className="col-gap" style={{gap:12}}>
            {MEDICATIONS_V2.map(m => (
              <Card key={m.id} onClick={() => open("med", m)} style={{cursor:"pointer"}}>
                <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
                  <div style={{width:34, height:34, borderRadius:7, background: m.type==="prescription" ? "color-mix(in srgb, var(--acc-medic) 18%, transparent)" : "var(--surface-2)", border:`1px solid ${m.type==="prescription" ? "color-mix(in srgb, var(--acc-medic) 35%, var(--border))" : "var(--border)"}`, color: m.type==="prescription" ? "var(--acc-medic)" : "var(--fg-muted)", display:"grid", placeItems:"center", flexShrink:0}}>
                    <Icon name="medical" className="ic"/>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap"}}>
                      <span style={{fontSize:13.5, fontWeight:600}}>{m.name}</span>
                      <Pill>{m.type}</Pill>
                      {m.rx && <Pill className="mono" style={{fontSize:9.5}}>{m.rx}</Pill>}
                      {m.monitoring_overdue && <Pill variant="warn">monitoring overdue</Pill>}
                    </div>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, fontSize:11}}>
                      <div><div className="eyebrow" style={{marginBottom:2}}>Dose</div><div className="num">{m.dosage}</div></div>
                      <div><div className="eyebrow" style={{marginBottom:2}}>Frequency</div><div>{m.frequency.replace(/_/g," ")}</div></div>
                      <div><div className="eyebrow" style={{marginBottom:2}}>Indication</div><div>{m.indication}</div></div>
                      <div><div className="eyebrow" style={{marginBottom:2}}>Monitoring</div><div className="num">{m.monitoring ? m.monitoring_frequency : "none"}</div></div>
                      <div><div className="eyebrow" style={{marginBottom:2}}>Next due</div><div className="num" style={{color: m.monitoring_overdue ? "var(--warn)" : "var(--fg)"}}>{m.next_due ?? "—"}</div></div>
                    </div>
                    {m.targets.length > 0 && (
                      <div style={{display:"flex", gap:4, flexWrap:"wrap", marginTop:8, alignItems:"center"}}>
                        <span className="eyebrow" style={{marginRight:2}}>Monitors</span>
                        {m.targets.map(t => {
                          const b = BIOMARKERS.find(x => x.abbr === t);
                          const flag = b ? calcBiomarkerFlag(b.value,b) : null;
                          return <Pill key={t} style={flag && flag!=="optimal" ? {borderColor:`color-mix(in srgb, ${FLAG_META[flag].c} 35%, var(--border))`, color:FLAG_META[flag].c, fontSize:9.5} : {fontSize:9.5}}>{t}{b ? ` ${b.value}` : ""}</Pill>;
                        })}
                      </div>
                    )}
                    {m.interactions.length > 0 && (
                      <div style={{marginTop:8, padding:8, background:"color-mix(in srgb, var(--warn) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--warn) 22%, var(--border))", borderRadius:5, fontSize:10.5, color:"var(--fg-muted)"}}>
                        <Icon name="alert" className="ic ic-sm" style={{display:"inline", verticalAlign:"middle", marginRight:5, color:"var(--warn)"}}/>
                        Known interaction: {m.interactions.join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══ TAB 5 · INSIGHTS ══════════════════════════════════════
const MedInsights = () => {
  const { open } = React.useContext(MedCtx2);
  const [sub, setSub] = useState("correlations");
  const effectiveness = SUPPLEMENT_BIOMARKER_MAP.map(calcSupplementEffectiveness).filter(Boolean);

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:14, alignItems:"center"}}>
        <div style={{display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:7, padding:2, gap:1}}>
          {[["correlations","Correlations"],["supplements","Supplement effect"],["benchmark","Population"],["export","Doctor export"]].map(([k,l]) => (
            <button key={k} onClick={()=>setSub(k)} className={sub===k?"btn btn-primary":"btn btn-ghost"} style={{height:24, fontSize:11, padding:"0 12px", borderRadius:5}}>{l}</button>
          ))}
        </div>
      </div>

      {sub === "correlations" && (
        <div className="col-gap" style={{gap:10}}>
          <div style={{padding:12, background:"color-mix(in srgb, var(--acc-buddy) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius:7, display:"flex", alignItems:"center", gap:10}}>
            <Icon name="sparkles" className="ic" style={{color:"var(--acc-buddy)"}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12.5, fontWeight:600}}>Cross-module correlation engine</div>
              <div className="muted" style={{fontSize:11}}>Biomarker changes matched against Nutrition, Training, Recovery, Supplements. Minimum 3 data points. Association, never causation.</div>
            </div>
          </div>
          {CORRELATIONS.map(c => {
            const strong = c.confidence === "strong";
            const col = strong ? "var(--pos)" : c.confidence === "moderate" ? "var(--acc-recov)" : "var(--fg-dim)";
            return (
              <Card key={c.id}>
                <div style={{display:"flex", gap:12, alignItems:"flex-start"}}>
                  <div style={{width:3, alignSelf:"stretch", background:col, borderRadius:2}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap"}}>
                      <Pill style={{borderColor:"color-mix(in srgb, var(--acc-medic) 35%, var(--border))", color:"var(--acc-medic)"}}>{c.biomarker}</Pill>
                      <span className="dim">×</span>
                      <Pill><Icon name={c.module} className="ic ic-sm"/>{c.module} · {c.metric}</Pill>
                      <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>n={c.n} · r={c.r} · {c.confidence}</span>
                    </div>
                    <div style={{fontSize:12.5, lineHeight:1.55, marginBottom:8}}>{c.finding}</div>
                    <div style={{display:"flex", alignItems:"center", gap:10}}>
                      <div style={{flex:1, position:"relative", height:5, background:"var(--surface-2)", borderRadius:999}}>
                        <div style={{position:"absolute", left:"50%", top:-2, bottom:-2, width:1, background:"var(--border-strong)"}}/>
                        <div style={{position:"absolute", left: c.r < 0 ? `${50 + c.r*50}%` : "50%", width:`${Math.abs(c.r)*50}%`, top:0, bottom:0, background:col, borderRadius:999}}/>
                      </div>
                      <span className="num" style={{fontSize:11, color:col, width:52, textAlign:"right"}}>r = {c.r}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {sub === "supplements" && (
        <div>
          <div className="dim" style={{fontSize:11.5, marginBottom:12, lineHeight:1.55, maxWidth:760}}>
            Automatic before/after comparison for every supplement in your stack that maps to a tracked biomarker. Baseline is the last value before the supplement start date; latest is the most recent result.
          </div>
          <div className="grid g-cols-2" style={{gap:12}}>
            {effectiveness.map((e,i) => {
              const statusColor = { effective:"var(--pos)", partial:"var(--acc-recov)", no_change:"var(--fg-dim)", inconclusive:"var(--warn)", insufficient_data:"var(--fg-dim)" }[e.status];
              return (
                <Card key={i}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap"}}>
                    <span style={{fontSize:13, fontWeight:600}}>{e.supplement}</span>
                    <span className="dim">→</span>
                    <Pill>{e.biomarkerObj.name}</Pill>
                    <Pill style={{marginLeft:"auto", borderColor:`color-mix(in srgb, ${statusColor} 35%, var(--border))`, color:statusColor}}>{e.status.replace(/_/g," ")}</Pill>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
                    <div style={{textAlign:"center"}}>
                      <div className="eyebrow" style={{marginBottom:2}}>Baseline</div>
                      <div className="num" style={{fontSize:17}}>{e.baseline}</div>
                      <FlagPill flag={e.baselineFlag} small/>
                    </div>
                    <Icon name="arr_r" className="ic" style={{color:"var(--fg-dim)"}}/>
                    <div style={{textAlign:"center"}}>
                      <div className="eyebrow" style={{marginBottom:2}}>Latest</div>
                      <div className="num" style={{fontSize:17, color:statusColor}}>{e.latest}</div>
                      <FlagPill flag={e.latestFlag} small/>
                    </div>
                    <div style={{flex:1, textAlign:"right"}}>
                      <div className="num" style={{fontSize:20, color: e.changePct > 0 ? "var(--pos)" : e.changePct < 0 ? "var(--warn)" : "var(--fg-dim)"}}>
                        {e.changePct > 0 ? "+" : ""}{e.changePct}%
                      </div>
                      <div className="dim mono" style={{fontSize:9.5}}>{e.biomarkerObj.unit} · since {e.start}</div>
                    </div>
                  </div>
                  <Sparkline data={e.biomarkerObj.hist} color={statusColor} h={28}/>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {sub === "benchmark" && (
        <Card title="Population benchmark" sub="vs. men 35–45 · NHANES reference distribution">
          <table className="tbl">
            <thead><tr><th>Biomarker</th><th style={{width:90, textAlign:"right"}}>Your value</th><th style={{width:220}}>Percentile</th><th style={{width:90, textAlign:"right"}}>Percentile</th><th>Interpretation</th></tr></thead>
            <tbody>
              {[
                ["LDL Cholesterol","102 mg/dL",73,"better than 73% of men 35–45"],
                ["HDL Cholesterol","58 mg/dL",68,"better than 68%"],
                ["hs-CRP","0.6 mg/L",88,"better than 88% — low inflammation"],
                ["Total Testosterone","712 ng/dL",84,"higher than 84% (on TRT)"],
                ["HbA1c","5.4%",52,"median range"],
                ["Vitamin D (25-OH)","48 ng/mL",91,"higher than 91%"],
                ["Ferritin","142 ng/mL",76,"higher than 76%"],
                ["Hematocrit","48%",82,"higher than 82% — TRT-associated"],
              ].map((r,i) => (
                <tr key={i}>
                  <td>{r[0]}</td>
                  <td className="num right">{r[1]}</td>
                  <td>
                    <div style={{position:"relative", height:6, background:"var(--surface-2)", borderRadius:999}}>
                      <div style={{position:"absolute", left:0, width:`${r[2]}%`, top:0, bottom:0, background: r[2]>=75?"var(--pos)":r[2]>=40?"var(--acc-recov)":"var(--warn)", borderRadius:999}}/>
                      <div style={{position:"absolute", left:"50%", top:-2, bottom:-2, width:1, background:"var(--border-strong)"}}/>
                    </div>
                  </td>
                  <td className="num right">P{r[2]}</td>
                  <td className="dim" style={{fontSize:11}}>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {sub === "export" && (
        <div className="grid" style={{gridTemplateColumns:"1.3fr 1fr", gap:14}}>
          <Card title="Doctor export · report structure" sub="6 sections · PDF · legal notice mandatory">
            <div className="col-gap" style={{gap:6}}>
              {[
                ["1","Executive summary","current system scores + overall health trajectory"],
                ["2","Critical + flagged values","all non-optimal flags with context and reference ranges"],
                ["3","Biomarker table","every value: lab range | optimal range | your value | flag | trend"],
                ["4","Supplement effectiveness","which supplements demonstrably moved which markers"],
                ["5","Symptom overview","last 90 days with severity and duration"],
                ["6","Medication list","active medications with monitoring status"],
              ].map(([n,t,d]) => (
                <div key={n} style={{display:"flex", gap:10, padding:9, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6}}>
                  <div style={{width:20, height:20, borderRadius:4, background:"var(--surface-2)", color:"var(--fg-muted)", display:"grid", placeItems:"center", fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700, flexShrink:0}}>{n}</div>
                  <div><div style={{fontSize:12, fontWeight:600, marginBottom:2}}>{t}</div><div className="dim" style={{fontSize:10.5}}>{d}</div></div>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div style={{padding:11, background:"color-mix(in srgb, var(--neg) 5%, var(--surface))", border:"1px solid color-mix(in srgb, var(--neg) 24%, var(--border))", borderRadius:6}}>
              <div className="eyebrow" style={{color:"var(--neg)", marginBottom:5}}>Mandatory legal notice in every report</div>
              <div style={{fontSize:11.5, lineHeight:1.6, color:"var(--fg-muted)", fontStyle:"italic"}}>
                "Dieser Report wurde von LumeOS erstellt. Die enthaltenen Informationen stellen keine medizinische Diagnose oder Therapieempfehlung dar. Bitte besprechen Sie alle Befunde mit Ihrem Arzt."
              </div>
            </div>
          </Card>
          <Card title="Generate report">
            <div className="eyebrow" style={{marginBottom:6}}>Categories</div>
            <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:12}}>
              {BIOMARKER_CATEGORIES.slice(1).map(c => <Pill key={c.id} variant="acc" style={{cursor:"pointer"}}>{c.label}</Pill>)}
            </div>
            <div className="grid g-cols-2" style={{gap:10, marginBottom:12}}>
              <div><div className="eyebrow" style={{marginBottom:4}}>From</div><input type="date" defaultValue="2025-08-15" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
              <div><div className="eyebrow" style={{marginBottom:4}}>To</div><input type="date" defaultValue="2026-08-15" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
            </div>
            <div className="eyebrow" style={{marginBottom:4}}>Report type</div>
            <select style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, marginBottom:12}}>
              <option>Comprehensive · all sections</option>
              <option>Focused · selected categories</option>
              <option>Progress · trends only</option>
              <option>Provider summary · 2 pages</option>
            </select>
            <div className="eyebrow" style={{marginBottom:4}}>Format</div>
            <div style={{display:"flex", gap:6, marginBottom:14}}>
              <button className="btn btn-primary btn-sm" style={{flex:1}}>PDF</button>
              <button className="btn btn-sm" style={{flex:1}}>FHIR R4</button>
              <button className="btn btn-sm" style={{flex:1}}>CSV</button>
            </div>
            <button className="btn btn-primary" style={{width:"100%", justifyContent:"center"}}><Icon name="download" className="ic ic-sm"/>Generate report</button>
          </Card>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { MedicalModuleV2, RangeIndicator, FlagPill, TrendBadge, MedCtx2 });
