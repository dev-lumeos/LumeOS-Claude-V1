// Recovery · spec UI — Today · Check-in · Muscle map · HRV · Sleep · Modalities · Overtraining · Protocols

const RecCtx2 = React.createContext(null);

const RecoveryModuleV2 = () => {
  const [tab, setTab] = useState("today");
  const [mode, setMode] = useState("hrv");
  const [modal, setModal] = useState(null);
  const open = (t, p) => setModal({ type:t, payload:p });
  const close = () => setModal(null);
  const sc = calcRecoveryScore(mode);
  const rd = readinessFor(sc.score);
  const ot = evaluateOvertraining();
  const pending = recoveryPendingActions();

  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Recovery</span>
            <Pill style={{borderColor:`color-mix(in srgb, ${rd.c} 35%, var(--border))`, color:rd.c, background:`color-mix(in srgb, ${rd.c} 7%, transparent)`}}>Score {sc.score} · {rd.label}</Pill>
            <Pill><span className="dot" style={{background:"var(--pos)"}}/>Check-in {CHECKIN.logged_at}</Pill>
            {ot.severity !== "normal" && <Pill variant="warn">{ot.count} OT signals</Pill>}
          </div>
          <div className="module-sub">{rd.advice} · score mode: {mode} · {pending.length} pending action{pending.length===1?"":"s"}</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => open("hrvMeasure")}><Icon name="camera" className="ic ic-sm"/>Measure HRV</button>
          <button className="btn" onClick={() => open("logModality")}><Icon name="plus" className="ic ic-sm"/>Log modality</button>
          <button className="btn btn-primary" onClick={() => setTab("checkin")}><Icon name="edit" className="ic ic-sm"/>Morning check-in</button>
        </div>
      </div>

      <Tabs items={[
        { id:"today",       label:"Today",        icon:"zap" },
        { id:"checkin",     label:"Check-in",     icon:"edit" },
        { id:"muscles",     label:"Muscle map",   icon:"recovery", count:18 },
        { id:"hrv",         label:"HRV",          icon:"trend_up" },
        { id:"sleep",       label:"Sleep",        icon:"moon" },
        { id:"modalities",  label:"Modalities",   icon:"droplet",  count:TODAY_MODALITIES.length },
        { id:"overtraining",label:"Overtraining", icon:"alert",    count:ot.count },
        { id:"protocols",   label:"Protocols",    icon:"calendar" },
        { id:"stress",      label:"Stress",       icon:"brain" },
      ]} active={tab} onChange={setTab}/>

      <RecCtx2.Provider value={{ open, close, mode, setMode, sc, rd, ot, pending }}>
        {tab === "today"        && <RecToday/>}
        {tab === "checkin"      && <RecCheckin/>}
        {tab === "muscles"      && <RecMuscleMap/>}
        {tab === "hrv"          && <RecHRV/>}
        {tab === "sleep"        && <RecSleep/>}
        {tab === "modalities"   && <RecModalities/>}
        {tab === "overtraining" && <RecOvertraining/>}
        {tab === "protocols"    && <RecProtocols/>}
      {tab === "stress" && window.RecoveryStress && <window.RecoveryStress/>}
      </RecCtx2.Provider>

      {modal?.type === "hrvMeasure"  && <HRVMeasureModal onClose={close}/>}
      {modal?.type === "logModality" && <LogModalityModal onClose={close}/>}
      {modal?.type === "muscle"      && <MuscleDetailModal2 slug={modal.payload} onClose={close}/>}
      {modal?.type === "protocol"    && <ProtocolDetailModal p={modal.payload} onClose={close}/>}
    </>
  );
};

// ── Reusable: 18-group body map ────────────────────────────
const BodyMap18 = ({ values, mode = "recovery", onPick, selected, size = 210 }) => {
  const colorFor = slug => {
    const v = values[slug];
    if (v == null) return "var(--surface-2)";
    if (mode === "recovery") return v >= 80 ? "var(--pos)" : v >= 50 ? "var(--warn)" : "var(--neg)";
    return v === 0 ? "var(--surface-2)" : v === 1 ? "var(--acc-recov)" : v === 2 ? "var(--warn)" : "var(--neg)";
  };
  const render = view => (
    <div style={{flex:1, textAlign:"center"}}>
      <div className="eyebrow" style={{marginBottom:6}}>{view === "front" ? "Front" : "Back"}</div>
      <svg viewBox="0 0 100 126" style={{width:"100%", maxWidth:size}}>
        <defs><clipPath id={"bodyclip-"+view}><path d={window.SILHOUETTE_PATH}/></clipPath></defs>
        <path d={window.SILHOUETTE_PATH} fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1"/>
        <g clipPath={"url(#bodyclip-"+view+")"}>
        {MUSCLE_GROUPS_BODYMAP.filter(s => MUSCLE_PATHS[s]?.view === view).map(slug => (
          <path key={slug} d={MUSCLE_PATHS[slug].d}
            fill={colorFor(slug)} opacity={selected === slug ? 0.95 : 0.68}
            stroke={selected === slug ? "var(--fg)" : colorFor(slug)} strokeWidth={selected === slug ? 0.8 : 0.3}
            style={{cursor: onPick ? "pointer" : "default"}}
            onClick={() => onPick?.(slug)}>
            <title>{MUSCLE_LABEL[slug]} · {values[slug] ?? "—"}{mode === "recovery" ? "%" : "/3"}</title>
          </path>
        ))}
        </g>
      </svg>
    </div>
  );
  return <div style={{display:"flex", gap:16}}>{render("front")}{render("back")}</div>;
};

// ═══ TODAY ═════════════════════════════════════════════════
const RecToday = () => {
  const { open, mode, setMode, sc, rd, ot, pending } = React.useContext(RecCtx2);
  const recoveryValues = Object.fromEntries(MUSCLE_GROUPS_BODYMAP.map(slug => {
    const st = MUSCLE_STATE[slug];
    if (!st) return [slug, null];
    return [slug, calcMuscleRecovery({ hours:st.hours, sets:st.sets, sleepQuality:CHECKIN.sleep_quality, proteinPct:0.79, caloriePct:0.68, soreness:st.soreness }).value];
  }));

  return (
    <div className="grid" style={{gridTemplateColumns:"1.5fr 1fr", gap:14}}>
      <div className="col-gap" style={{gap:14}}>
        <Card>
          <div style={{display:"flex", gap:20, alignItems:"center", marginBottom:14}}>
            <Ring value={sc.score} max={100} color={rd.c} label={rd.level} size={140} stroke={10}/>
            <div style={{flex:1}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                <span className="eyebrow">Readiness</span>
                <div style={{display:"flex", background:"var(--surface-2)", borderRadius:6, padding:2, gap:1, marginLeft:"auto"}}>
                  {["manual","hrv"].map(m => (
                    <button key={m} onClick={()=>setMode(m)} className={mode===m?"btn btn-primary":"btn btn-ghost"} style={{height:20, fontSize:10, padding:"0 9px", borderRadius:4}}>{m}</button>
                  ))}
                </div>
              </div>
              <div style={{fontSize:19, fontWeight:600, marginBottom:5, color:rd.c}}>{rd.label}</div>
              <div style={{fontSize:12.5, color:"var(--fg-muted)", lineHeight:1.5, marginBottom:10}}>{rd.advice}</div>
              <div style={{display:"flex", gap:14, flexWrap:"wrap"}}>
                {[
                  ["HRV", `${CHECKIN.hrv_rmssd} ms`, `z ${sc.hrv.z}`],
                  ["Sleep", `${CHECKIN.sleep_hours} h`, `q ${CHECKIN.sleep_quality}/10`],
                  ["ACWR", ACWR_DATA.acwr, `load ${sc.tls.toFixed(2)}`],
                  ["Bonus", `+${sc.bonus.capped}`, sc.bonus.wasCapped ? "capped" : `of ${MAX_DAILY_BONUS} max`],
                ].map(([l,v,s]) => (
                  <div key={l}>
                    <div className="eyebrow" style={{marginBottom:2}}>{l}</div>
                    <div className="num" style={{fontSize:16, lineHeight:1}}>{v}</div>
                    <div className="dim mono" style={{fontSize:9.5, marginTop:2}}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom:8}}>Score composition · {mode} mode</div>
          <div className="col-gap" style={{gap:5}}>
            {sc.terms.map(t => (
              <div key={t.key} style={{display:"grid", gridTemplateColumns:"130px 90px 1fr 52px", gap:10, alignItems:"center", fontSize:11}}>
                <span style={{color:"var(--fg-muted)"}}>{t.label}</span>
                <span className="mono dim" style={{fontSize:10}}>{t.raw}</span>
                <div style={{height:6, background:"var(--surface-2)", borderRadius:999}}>
                  <div style={{height:"100%", width:`${(t.val/t.w)*100}%`, background:"var(--acc-recov)", borderRadius:999}}/>
                </div>
                <span className="num" style={{textAlign:"right"}}>{t.val.toFixed(1)}<span className="dim" style={{fontSize:9}}>/{t.w}</span></span>
              </div>
            ))}
            <div style={{display:"grid", gridTemplateColumns:"130px 90px 1fr 52px", gap:10, alignItems:"center", fontSize:11, paddingTop:6, borderTop:"1px solid var(--border)"}}>
              <span style={{fontWeight:600}}>Modality bonus</span>
              <span className="mono dim" style={{fontSize:10}}>{TODAY_MODALITIES.length} logged</span>
              <div style={{height:6, background:"var(--surface-2)", borderRadius:999}}>
                <div style={{height:"100%", width:`${(sc.bonus.capped/MAX_DAILY_BONUS)*100}%`, background:"var(--pos)", borderRadius:999}}/>
              </div>
              <span className="num" style={{textAlign:"right", color:"var(--pos)"}}>+{sc.bonus.capped}</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"130px 90px 1fr 52px", gap:10, alignItems:"center", fontSize:12, paddingTop:6, borderTop:"1px solid var(--border-strong)"}}>
              <span style={{fontWeight:700}}>Total</span>
              <span/>
              <span/>
              <span className="num" style={{textAlign:"right", fontSize:16, fontWeight:600, color:rd.c}}>{sc.score}</span>
            </div>
          </div>
        </Card>

        <Card title="Muscle readiness" sub="18 groups · click for the calculation" actions={<button className="btn btn-ghost btn-sm" onClick={()=>window.dispatchEvent(new CustomEvent("rec-tab",{detail:"muscles"}))}>Full map →</button>}>
          <BodyMap18 values={recoveryValues} mode="recovery" onPick={s => open("muscle", s)} size={170}/>
          <div style={{display:"flex", justifyContent:"center", gap:14, marginTop:10, fontSize:10, color:"var(--fg-muted)"}}>
            <span className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:"var(--pos)",opacity:.68}}/>ready &gt; 80%</span>
            <span className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:"var(--warn)",opacity:.68}}/>recovering 50–80%</span>
            <span className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:"var(--neg)",opacity:.68}}/>not ready &lt; 50%</span>
          </div>
        </Card>
      </div>

      <div className="col-gap" style={{gap:14}}>
        {pending.length > 0 && (
          <Card title="Pending actions" sub={`${pending.length} open`}>
            <div className="col-gap" style={{gap:5}}>
              {pending.map((p,i) => {
                const c = p.priority === "high" ? "var(--warn)" : p.priority === "normal" ? "var(--acc-recov)" : "var(--fg-dim)";
                return (
                  <div key={i} style={{display:"flex", gap:9, padding:9, background:`color-mix(in srgb, ${c} 5%, var(--surface))`, border:`1px solid color-mix(in srgb, ${c} 24%, var(--border))`, borderRadius:5}}>
                    <div style={{width:3, alignSelf:"stretch", background:c, borderRadius:2}}/>
                    <div style={{flex:1}}>
                      <div className="mono" style={{fontSize:10, color:c, marginBottom:2}}>{p.type.replace(/_/g," ")}</div>
                      <div style={{fontSize:11.5, lineHeight:1.4}}>{p.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Today's modalities" sub={`bonus +${sc.bonus.capped} of ${MAX_DAILY_BONUS} max`} actions={<button className="btn btn-ghost btn-sm" onClick={()=>open("logModality")}><Icon name="plus" className="ic ic-sm"/></button>}>
          {TODAY_MODALITIES.length === 0 ? <div className="dim" style={{fontSize:11.5, padding:10, textAlign:"center"}}>Nothing logged today.</div> : (
            <div className="col-gap" style={{gap:5}}>
              {TODAY_MODALITIES.map(m => {
                const meta = MODALITY_META[m.type];
                return (
                  <div key={m.id} style={{display:"flex", alignItems:"center", gap:9, padding:9, background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:5}}>
                    <Icon name={meta.icon} className="ic ic-sm" style={{color:meta.c}}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:11.5, fontWeight:500}}>{meta.label}</div>
                      <div className="dim mono" style={{fontSize:9.5}}>{m.time} · {m.duration} min · {m.detail}</div>
                    </div>
                    <span className="num" style={{fontSize:11, color:"var(--pos)"}}>+{MODALITY_BONUS[m.type]}</span>
                  </div>
                );
              })}
              {sc.bonus.wasCapped && (
                <div className="dim" style={{fontSize:10.5, padding:"6px 9px", lineHeight:1.45}}>
                  Raw bonus {sc.bonus.raw} capped at {MAX_DAILY_BONUS} — prevents score inflation through excessive logging.
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="Overtraining watch" sub={`${ot.count} of 8 signals · ${ot.severity}`}>
          <div style={{display:"flex", gap:3, marginBottom:10}}>
            {ot.results.map(r => (
              <div key={r.id} title={`${r.label} · ${r.detailText}`}
                style={{flex:1, height:22, borderRadius:3, background: r.fired ? "var(--warn)" : "var(--surface-2)", opacity: r.fired ? 0.85 : 1}}/>
            ))}
          </div>
          <Row label="Severity" value={ot.severity}/>
          <Row label="Threshold" value="3+ moderate · 5+ high · 7+ critical"/>
          <div className="divider"/>
          <div className="dim" style={{fontSize:10.5, lineHeight:1.5}}>
            Single signals are normal day-to-day noise. The combination is what matters — that is why severity keys off count, not any one threshold.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══ CHECK-IN ══════════════════════════════════════════════
const RecCheckin = () => {
  const [hours, setHours] = useState(CHECKIN.sleep_hours);
  const [quality, setQuality] = useState(CHECKIN.sleep_quality);
  const [feeling, setFeeling] = useState(CHECKIN.subjective_feeling);
  const [mood, setMood] = useState(CHECKIN.mood);
  const [soreness, setSoreness] = useState({ ...CHECKIN.soreness });
  const [sel, setSel] = useState(null);
  const [more, setMore] = useState(false);
  const cycle = slug => setSoreness(s => ({ ...s, [slug]: ((s[slug] ?? 0) + 1) % 4 }));
  const emoji = ["😫","😣","😕","😐","🙂","😌","😊","😃","😁","🤩"][Math.max(0, Math.min(9, quality - 1))];

  return (
    <div className="grid" style={{gridTemplateColumns:"1.3fr 1fr", gap:14}}>
      <Card title="Morning check-in" sub="target: under 30 seconds · overwrite any time today"
        actions={<Pill variant="pos" dot>logged {CHECKIN.logged_at}</Pill>}>

        <div className="eyebrow" style={{marginBottom:6}}>Sleep duration · {hours} h</div>
        <input type="range" min="0" max="12" step="0.5" value={hours} onChange={e=>setHours(Number(e.target.value))}
          style={{width:"100%", accentColor:"var(--acc-recov)", marginBottom:4}}/>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:9.5, color:"var(--fg-dim)", fontFamily:"var(--font-mono)", marginBottom:14}}>
          <span>0</span><span>4</span><span>8</span><span>12 h</span>
        </div>

        <div className="eyebrow" style={{marginBottom:6}}>Sleep quality · {quality}/10 {emoji}</div>
        <input type="range" min="1" max="10" value={quality} onChange={e=>setQuality(Number(e.target.value))}
          style={{width:"100%", accentColor:"var(--acc-recov)", marginBottom:4}}/>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:14}}>
          {["😫","😣","😕","😐","🙂","😌","😊","😃","😁","🤩"].map((e,i) => (
            <span key={i} style={{opacity: i+1 === quality ? 1 : 0.28, fontSize: i+1 === quality ? 17 : 12, transition:"all .12s"}}>{e}</span>
          ))}
        </div>

        <div className="eyebrow" style={{marginBottom:6}}>How do you feel · {feeling}/10</div>
        <div style={{display:"flex", gap:3, marginBottom:14}}>
          {Array.from({length:10}).map((_,i) => (
            <button key={i} onClick={()=>setFeeling(i+1)} style={{flex:1, height:28, borderRadius:4, border:0, cursor:"pointer",
              background: i < feeling ? "var(--acc-recov)" : "var(--surface-2)",
              opacity: i < feeling ? 0.35 + (i/10)*0.65 : 1,
              color: i+1===feeling ? "var(--bg)" : "var(--fg-dim)", fontFamily:"var(--font-mono)", fontSize:10, fontWeight:600}}>{i+1}</button>
          ))}
        </div>

        <div className="eyebrow" style={{marginBottom:6}}>Mood</div>
        <div style={{display:"flex", gap:6, marginBottom:14}}>
          {MOOD_META.map(m => (
            <button key={m.id} onClick={()=>setMood(m.id)} style={{flex:1, padding:"9px 6px", borderRadius:6, cursor:"pointer",
              background: mood===m.id ? `color-mix(in srgb, ${m.c} 14%, var(--surface))` : "var(--surface)",
              border:`1px solid ${mood===m.id ? `color-mix(in srgb, ${m.c} 40%, var(--border))` : "var(--border)"}`,
              color: mood===m.id ? m.c : "var(--fg-muted)"}}>
              <div style={{fontSize:11.5, fontWeight:600}}>{m.label}</div>
              <div className="mono" style={{fontSize:9, marginTop:2, opacity:.8}}>×{MOOD_MULTIPLIER[m.id]} = {m.pts}pt</div>
            </button>
          ))}
        </div>

        <div className="eyebrow" style={{marginBottom:6}}>Soreness · tap a muscle to cycle 0 → 3</div>
        <Card className="card-tight" style={{padding:12, marginBottom:12}}>
          <BodyMap18 values={soreness} mode="soreness" onPick={slug => { cycle(slug); setSel(slug); }} selected={sel} size={180}/>
          <div style={{display:"flex", justifyContent:"center", gap:14, marginTop:10, fontSize:10, color:"var(--fg-muted)"}}>
            {[["0 none","var(--surface-2)"],["1 mild","var(--acc-recov)"],["2 moderate","var(--warn)"],["3 severe","var(--neg)"]].map(([l,c]) => (
              <span key={l} className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:c,opacity:.68}}/>{l}</span>
            ))}
          </div>
          {sel && (
            <div style={{marginTop:10, padding:9, background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:5, display:"flex", alignItems:"center", gap:8}}>
              <span style={{fontSize:12, fontWeight:600}}>{MUSCLE_LABEL[sel]}</span>
              <span className="num" style={{fontSize:12}}>{soreness[sel]}/3</span>
              <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>{MUSCLE_STATE[sel]?.lastSession ?? "no recent session"}</span>
            </div>
          )}
        </Card>

        <button className="btn btn-ghost" onClick={()=>setMore(v=>!v)} style={{marginBottom:more?12:0}}>
          <Icon name={more?"chevron_down":"chevron_right"} className="ic ic-sm"/>{more?"Hide":"Add more"} · stress, alcohol, caffeine, screen time
        </button>
        {more && (
          <div className="grid g-cols-2" style={{gap:10, marginBottom:12}}>
            <div><div className="eyebrow" style={{marginBottom:4}}>Stress level · 1–10</div><input type="number" defaultValue={CHECKIN.stress_level} style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
            <div><div className="eyebrow" style={{marginBottom:4}}>Alcohol · units</div><input type="number" defaultValue={CHECKIN.alcohol_units} style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
            <div><div className="eyebrow" style={{marginBottom:4}}>Caffeine · mg</div><input type="number" defaultValue={CHECKIN.caffeine_mg} style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
            <div><div className="eyebrow" style={{marginBottom:4}}>Screen time before bed · min</div><input type="number" defaultValue={CHECKIN.screen_time_before_bed} style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
          </div>
        )}

        <div style={{display:"flex", gap:6, marginTop:12}}>
          <button className="btn btn-primary" style={{flex:1, justifyContent:"center"}}><Icon name="check" className="ic ic-sm"/>Save check-in · recalculates score</button>
        </div>
      </Card>

      <div className="col-gap" style={{gap:14}}>
        <Card title="Live score preview" sub="updates as you edit">
          {(() => {
            const sor = Object.values(soreness).reduce((s,v)=>s+v,0) / Object.values(soreness).length;
            const tls = calcTrainingLoadScore(ACWR_DATA.acwr);
            const bonus = calcModalityBonus(TODAY_MODALITIES);
            const hrv = calcHRVScore(CHECKIN.hrv_rmssd);
            const val = (quality/10)*15 + (Math.min(hours,8)/8)*15 + (hrv.score/100)*25 + (feeling/10)*10 + (1-sor/3)*10 + tls*15 + 0.88*10;
            const total = Math.round(Math.min(100, val + bonus.capped));
            const rd = readinessFor(total);
            return (
              <div style={{display:"flex", alignItems:"center", gap:14}}>
                <Ring value={total} max={100} color={rd.c} label={rd.level} size={96} stroke={7}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:15, fontWeight:600, color:rd.c, marginBottom:3}}>{rd.label}</div>
                  <div className="muted" style={{fontSize:11.5, lineHeight:1.45}}>{rd.advice}</div>
                  <div className="dim mono" style={{fontSize:10, marginTop:6}}>avg soreness {sor.toFixed(2)}/3 · bonus +{bonus.capped}</div>
                </div>
              </div>
            );
          })()}
        </Card>

        <Card title="Readiness levels" sub="score → training recommendation">
          {READINESS_LEVELS.map((l,i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderBottom: i<READINESS_LEVELS.length-1?"1px solid var(--border)":"none"}}>
              <span className="num" style={{fontSize:11, width:56, color:l.c}}>{l.min}{i===0?"–100":`–${READINESS_LEVELS[i-1].min-1}`}</span>
              <span style={{fontSize:11.5, fontWeight:600, width:82}}>{l.label}</span>
              <span className="dim" style={{fontSize:10.5, flex:1, lineHeight:1.4}}>{l.advice}</span>
            </div>
          ))}
        </Card>

        <Card title="Why check in daily" sub="the one required interaction">
          <div className="dim" style={{fontSize:11.5, lineHeight:1.6}}>
            Sleep quality and subjective feeling carry 45% of the manual score. Without a check-in the engine falls back on wearable data alone, which cannot see soreness, mood, or how you actually feel. The map only takes a few taps because it remembers yesterday.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══ MUSCLE MAP ════════════════════════════════════════════
const RecMuscleMap = () => {
  const { open } = React.useContext(RecCtx2);
  const rows = MUSCLE_GROUPS_BODYMAP.map(slug => {
    const st = MUSCLE_STATE[slug];
    if (!st) return { slug, value:null };
    const calc = calcMuscleRecovery({ hours:st.hours, sets:st.sets, sleepQuality:CHECKIN.sleep_quality, proteinPct:0.79, caloriePct:0.68, soreness:st.soreness });
    return { slug, ...st, ...calc };
  }).sort((a,b) => (a.value ?? 999) - (b.value ?? 999));
  const values = Object.fromEntries(rows.map(r => [r.slug, r.value]));

  return (
    <div className="grid" style={{gridTemplateColumns:"1fr 1.35fr", gap:14}}>
      <Card title="Muscle recovery" sub="18 groups · click for the breakdown">
        <BodyMap18 values={values} mode="recovery" onPick={s => open("muscle", s)} size={200}/>
        <div style={{display:"flex", justifyContent:"center", gap:14, marginTop:12, fontSize:10, color:"var(--fg-muted)"}}>
          <span className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:"var(--pos)",opacity:.68}}/>ready</span>
          <span className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:"var(--warn)",opacity:.68}}/>recovering</span>
          <span className="row-gap"><span style={{width:10,height:10,borderRadius:2,background:"var(--neg)",opacity:.68}}/>not ready</span>
        </div>
        <div className="divider"/>
        <div className="eyebrow" style={{marginBottom:6}}>Base recovery curve</div>
        <LineChart h={110} range={[0,105]} xLabels={["0h","12h","24h","48h","72h","96h"]}
          series={[{ data:[10,30,50,75,90,100], color:"var(--acc-recov)" }]}/>
        <div className="dim mono" style={{fontSize:10, marginTop:8, lineHeight:1.7}}>
          recovery = base(hours) × volume_mod × sleep_mod × nutrition_mod × soreness_mod
        </div>
      </Card>

      <Card title="Per-muscle detail" sub="sorted by readiness · lowest first">
        <table className="tbl">
          <thead>
            <tr>
              <th>Muscle</th>
              <th style={{width:60, textAlign:"right"}}>Hours</th>
              <th style={{width:50, textAlign:"right"}}>Sets</th>
              <th style={{width:56, textAlign:"right"}}>Sore</th>
              <th style={{width:130}}>Recovery</th>
              <th style={{width:56, textAlign:"right"}}>%</th>
              <th style={{width:24}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              if (r.value == null) return null;
              const c = r.value >= 80 ? "var(--pos)" : r.value >= 50 ? "var(--warn)" : "var(--neg)";
              return (
                <tr key={r.slug} className="clickable" style={{cursor:"pointer"}} onClick={() => open("muscle", r.slug)}>
                  <td>
                    <div style={{fontSize:12}}>{MUSCLE_LABEL[r.slug]}</div>
                    <div className="dim mono" style={{fontSize:9}}>{r.lastSession}</div>
                  </td>
                  <td className="num right">{r.hours}</td>
                  <td className="num right muted">{r.sets}</td>
                  <td className="num right" style={{color: r.soreness >= 2 ? "var(--warn)" : "var(--fg-muted)"}}>{r.soreness}/3</td>
                  <td><Meter value={r.value} color={c} tall/></td>
                  <td className="num right" style={{color:c, fontWeight:600}}>{r.value}</td>
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

// ═══ HRV ═══════════════════════════════════════════════════
const RecHRV = () => {
  const { open } = React.useContext(RecCtx2);
  const today = calcHRVScore(CHECKIN.hrv_rmssd);
  return (
    <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr", gap:14}}>
      <div className="col-gap" style={{gap:14}}>
        <Card title="HRV score" sub="z-score against your rolling 30-day baseline">
          <div style={{display:"flex", gap:18, alignItems:"center", marginBottom:14}}>
            <Ring value={today.score} max={100} color={today.score>=70?"var(--pos)":today.score>=50?"var(--warn)":"var(--neg)"} label="hrv" size={112} stroke={8}/>
            <div style={{flex:1}}>
              <div className="grid g-cols-2" style={{gap:10}}>
                {[
                  ["Today RMSSD", `${CHECKIN.hrv_rmssd} ms`],
                  ["Baseline", `${HRV_BASELINE.avg_rmssd} ms`],
                  ["Std deviation", `± ${HRV_BASELINE.stddev_rmssd}`],
                  ["Z-score", `${today.z > 0 ? "+" : ""}${today.z}`],
                ].map(([l,v]) => (
                  <div key={l} style={{padding:9, background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:5}}>
                    <div className="eyebrow" style={{marginBottom:2}}>{l}</div>
                    <div className="num" style={{fontSize:15}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dim mono" style={{fontSize:10, lineHeight:1.7, padding:10, background:"var(--surface-2)", borderRadius:6}}>
            deviation = (rmssd − baseline) / stddev = ({CHECKIN.hrv_rmssd} − {HRV_BASELINE.avg_rmssd}) / {HRV_BASELINE.stddev_rmssd} = {today.z}<br/>
            score = 70 + deviation × 15 = 70 + {today.z} × 15 = {today.score}<br/>
            anchors: z +2 → 100 · z 0 → 70 · z −2 → 30 · z ≤ −3 → 0
          </div>
        </Card>

        <Card title="Measurement log" sub={`${HRV_LOG.length} readings · baseline from ${HRV_BASELINE.samples} of last ${HRV_BASELINE.window_days} days`}
          actions={<button className="btn btn-sm" onClick={()=>open("hrvMeasure")}><Icon name="camera" className="ic ic-sm"/>Measure now</button>}>
          <table className="tbl">
            <thead><tr><th style={{width:100}}>Date</th><th style={{width:80, textAlign:"right"}}>RMSSD</th><th style={{width:70, textAlign:"right"}}>Z</th><th style={{width:70, textAlign:"right"}}>Score</th><th style={{width:110}}>Method</th><th style={{width:80, textAlign:"right"}}>Quality</th><th>Note</th></tr></thead>
            <tbody>
              {HRV_LOG.map((h,i) => {
                const s = calcHRVScore(h.rmssd);
                return (
                  <tr key={i}>
                    <td className="num muted">{h.date.slice(5)}</td>
                    <td className="num right">{h.rmssd} <span className="dim" style={{fontSize:9}}>ms</span></td>
                    <td className="num right" style={{color: s.z >= 0 ? "var(--pos)" : "var(--warn)"}}>{s.z > 0 ? "+" : ""}{s.z}</td>
                    <td className="num right">{s.score}</td>
                    <td><Pill style={{fontSize:9}}>{h.method.replace(/_/g," ")}</Pill></td>
                    <td className="num right" style={{color: h.quality >= 0.9 ? "var(--pos)" : h.quality >= 0.8 ? "var(--warn)" : "var(--neg)"}}>{h.quality.toFixed(2)}</td>
                    <td className="dim" style={{fontSize:10.5}}>{h.note || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="col-gap" style={{gap:14}}>
        <Card title="Phone camera HRV" sub="no wearable required">
          <div style={{padding:14, background:"color-mix(in srgb, var(--acc-recov) 6%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-recov) 24%, var(--border))", borderRadius:7, marginBottom:12}}>
            <div style={{fontSize:12.5, lineHeight:1.6, color:"var(--fg-muted)"}}>
              Index finger on the camera lens with the flash on. 60 seconds of PPG signal gives R-R intervals, which give RMSSD. Validated at r = 0.98 against a chest strap.
            </div>
          </div>
          <Row label="Duration" value="60 seconds"/>
          <Row label="Accuracy vs. strap" value="r = 0.98"/>
          <Row label="Limitations" value="motion, poor lighting"/>
          <Row label="Best time" value="on waking, before standing"/>
          <div style={{marginTop:12}}>
            <button className="btn btn-primary" style={{width:"100%", justifyContent:"center"}} onClick={()=>open("hrvMeasure")}>
              <Icon name="camera" className="ic ic-sm"/>Start 60-second measurement
            </button>
          </div>
        </Card>

        <Card title="30-day trend" sub="RMSSD vs. baseline band">
          <LineChart h={150} range={[44,72]}
            xLabels={["30d","","","20d","","","10d","","today"]}
            series={[
              { data:[52,54,53,56,55,58,57,59,58,60,59,61,58,62,64], color:"var(--acc-recov)" },
              { data:Array(15).fill(HRV_BASELINE.avg_rmssd), color:"var(--fg-dim)" },
              { data:Array(15).fill(HRV_BASELINE.avg_rmssd - HRV_BASELINE.stddev_rmssd), color:"var(--surface-2)" },
            ]}/>
          <div style={{display:"flex", gap:14, marginTop:8, fontSize:10.5, color:"var(--fg-muted)"}}>
            <span className="row-gap"><span className="dot" style={{background:"var(--acc-recov)"}}/>RMSSD</span>
            <span className="row-gap"><span className="dot" style={{background:"var(--fg-dim)"}}/>baseline</span>
            <span className="row-gap"><span className="dot" style={{background:"var(--surface-2)"}}/>−1 SD</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══ SLEEP ═════════════════════════════════════════════════
const RecSleep = () => {
  const w = calcSleepScore(SLEEP_DATA, CHECKIN);
  const s = calcSleepScore(null, CHECKIN);
  const d = SLEEP_DATA;
  const pct = m => Math.round((m / d.total_sleep_minutes) * 100);
  return (
    <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr", gap:14}}>
      <div className="col-gap" style={{gap:14}}>
        <Card title="Last night" sub={`${d.bedtime} → ${d.wake} · source: ${d.source}`}>
          <div style={{display:"flex", gap:18, alignItems:"center", marginBottom:14}}>
            <Ring value={w.score} max={100} color={w.score>=85?"var(--pos)":w.score>=70?"var(--acc-recov)":"var(--warn)"} label="sleep" size={112} stroke={8}/>
            <div style={{flex:1}}>
              <div className="num" style={{fontSize:26, lineHeight:1, marginBottom:4}}>
                {Math.floor(d.total_sleep_minutes/60)}:{String(d.total_sleep_minutes%60).padStart(2,"0")}
                <span className="dim" style={{fontSize:12, marginLeft:5}}>hrs asleep</span>
              </div>
              <div className="muted" style={{fontSize:11.5, marginBottom:10}}>{d.time_in_bed_minutes} min in bed · {d.sleep_efficiency}% efficiency</div>
              <div className="col-gap" style={{gap:4}}>
                {[
                  ["Deep",  d.deep_sleep_minutes,  "var(--acc-coach)"],
                  ["REM",   d.rem_sleep_minutes,   "var(--acc-buddy)"],
                  ["Light", d.light_sleep_minutes, "var(--acc-recov)"],
                  ["Awake", d.awake_minutes,       "var(--neg)"],
                ].map(([l,m,c]) => (
                  <div key={l} style={{display:"grid", gridTemplateColumns:"52px 1fr 64px 40px", gap:8, alignItems:"center", fontSize:11}}>
                    <span>{l}</span>
                    <div style={{height:6, background:"var(--surface-2)", borderRadius:999}}>
                      <div style={{height:"100%", width:`${pct(m)}%`, background:c, borderRadius:999}}/>
                    </div>
                    <span className="num" style={{textAlign:"right"}}>{Math.floor(m/60)}h {m%60}m</span>
                    <span className="num dim" style={{textAlign:"right", fontSize:10}}>{pct(m)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom:8}}>Score formula · wearable path</div>
          <div className="dim mono" style={{fontSize:10, lineHeight:1.8, padding:10, background:"var(--surface-2)", borderRadius:6}}>
            efficiency {d.sleep_efficiency}% → {w.eff.toFixed(2)} × 0.40 = {(w.eff*0.4).toFixed(3)}<br/>
            duration {d.total_sleep_minutes}/480 min → {w.dur.toFixed(2)} × 0.40 = {(w.dur*0.4).toFixed(3)}<br/>
            deep {d.deep_sleep_minutes}/90 min → {w.deep.toFixed(2)} × 0.20 = {(w.deep*0.2).toFixed(3)}<br/>
            <span style={{color:"var(--fg)"}}>total × 100 = {w.score}</span>
          </div>
        </Card>

        <Card title="14 nights" sub="duration + stage composition">
          <div style={{display:"grid", gridTemplateColumns:"repeat(14, 1fr)", gap:3, height:96}}>
            {Array.from({length:14}).map((_,i) => {
              const dur = 6.2 + Math.sin(i*1.1)*0.9 + (i===13?0.4:0);
              const h = (dur/9.5)*100;
              const deep = 0.17 + Math.sin(i*0.7)*0.03, rem = 0.21 + Math.cos(i*0.5)*0.03, awake = 0.05;
              return (
                <div key={i} style={{display:"flex", alignItems:"flex-end", height:"100%"}}>
                  <div style={{width:"100%", height:`${h}%`, display:"flex", flexDirection:"column", borderRadius:"2px 2px 0 0", overflow:"hidden"}} title={`${dur.toFixed(1)}h`}>
                    <div style={{flex:awake, background:"var(--neg)", opacity:.7}}/>
                    <div style={{flex:rem, background:"var(--acc-buddy)", opacity:.8}}/>
                    <div style={{flex:1-deep-rem-awake, background:"var(--acc-recov)", opacity:.75}}/>
                    <div style={{flex:deep, background:"var(--acc-coach)", opacity:.9}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex", justifyContent:"space-between", marginTop:6, fontSize:9.5, color:"var(--fg-dim)", fontFamily:"var(--font-mono)"}}>
            <span>14 nights ago</span><span>last night</span>
          </div>
        </Card>
      </div>

      <div className="col-gap" style={{gap:14}}>
        <Card title="Score paths" sub="wearable vs. subjective">
          <div className="col-gap" style={{gap:8}}>
            <div style={{padding:11, background:"color-mix(in srgb, var(--pos) 6%, var(--surface))", border:"1px solid color-mix(in srgb, var(--pos) 26%, var(--border))", borderRadius:6}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                <span style={{fontSize:12, fontWeight:600}}>Wearable path</span>
                <Pill variant="pos" style={{marginLeft:"auto"}}>active</Pill>
              </div>
              <div className="num" style={{fontSize:20, color:"var(--pos)"}}>{w.score}</div>
              <div className="dim mono" style={{fontSize:10, marginTop:3}}>efficiency 0.4 + duration 0.4 + deep 0.2</div>
            </div>
            <div style={{padding:11, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6}}>
              <div style={{fontSize:12, fontWeight:600, marginBottom:4}}>Subjective fallback</div>
              <div className="num" style={{fontSize:20, color:"var(--fg-muted)"}}>{s.score}</div>
              <div className="dim mono" style={{fontSize:10, marginTop:3}}>quality 0.6 + duration 0.4</div>
            </div>
          </div>
          <div className="dim" style={{fontSize:10.5, marginTop:10, lineHeight:1.5}}>
            The subjective path is what most users get. It never blocks a score — the engine degrades gracefully rather than refusing to compute.
          </div>
        </Card>

        <Card title="Sleep hygiene inputs" sub="from check-in">
          <Row label="Caffeine today" value={`${CHECKIN.caffeine_mg} mg`}/>
          <Row label="Alcohol" value={`${CHECKIN.alcohol_units} units`}/>
          <Row label="Screen before bed" value={`${CHECKIN.screen_time_before_bed} min`}/>
          <Row label="Stress level" value={`${CHECKIN.stress_level}/10`}/>
          <div className="divider"/>
          <div className="dim" style={{fontSize:10.5, lineHeight:1.5}}>
            Caffeine at 280 mg with a 17:30 pre-workout dose sits close to the edge — bedtime has drifted 22 min later across the last 14 days.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══ MODALITIES ════════════════════════════════════════════
const RecModalities = () => {
  const { open, sc } = React.useContext(RecCtx2);
  return (
    <div>
      <div className="grid g-cols-4" style={{gap:10, marginBottom:14}}>
        <Card className="card-tight" style={{padding:14}}>
          <div className="eyebrow">Today's bonus</div>
          <div className="num" style={{fontSize:22, color:"var(--pos)"}}>+{sc.bonus.capped}</div>
          <div className="dim" style={{fontSize:11}}>raw {sc.bonus.raw} · cap {MAX_DAILY_BONUS}</div>
        </Card>
        <Card className="card-tight" style={{padding:14}}>
          <div className="eyebrow">Logged today</div>
          <div className="num" style={{fontSize:22}}>{TODAY_MODALITIES.length}</div>
          <div className="dim" style={{fontSize:11}}>{MODALITY_LOG.length} in last 7 days</div>
        </Card>
        <Card className="card-tight" style={{padding:14}}>
          <div className="eyebrow">Best next-day delta</div>
          <div className="num" style={{fontSize:22, color:"var(--pos)"}}>+8</div>
          <div className="dim" style={{fontSize:11}}>massage · 12 Aug</div>
        </Card>
        <Card className="card-tight" style={{padding:14}}>
          <div className="eyebrow">Awaiting rating</div>
          <div className="num" style={{fontSize:22, color:"var(--warn)"}}>{MODALITY_LOG.filter(m=>m.nextDay==null).length}</div>
          <div className="dim" style={{fontSize:11}}>next-day feedback</div>
        </Card>
      </div>

      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:14}}>
        <Card title="Modality catalog" sub="11 types · bonus value per session"
          actions={<button className="btn btn-sm" onClick={()=>open("logModality")}><Icon name="plus" className="ic ic-sm"/>Log</button>}>
          <table className="tbl">
            <thead><tr><th>Modality</th><th style={{width:80, textAlign:"right"}}>Bonus</th><th style={{width:110, textAlign:"right"}}>Used · 7d</th></tr></thead>
            <tbody>
              {Object.entries(MODALITY_BONUS).sort((a,b)=>b[1]-a[1]).map(([k,v]) => {
                const meta = MODALITY_META[k];
                const used = MODALITY_LOG.filter(m => m.type === k).length;
                return (
                  <tr key={k}>
                    <td>
                      <div style={{display:"flex", alignItems:"center", gap:8}}>
                        <Icon name={meta.icon} className="ic ic-sm" style={{color:meta.c}}/>
                        <span style={{fontSize:12}}>{meta.label}</span>
                      </div>
                    </td>
                    <td className="num right" style={{color: v >= 2 ? "var(--pos)" : "var(--fg)"}}>+{v.toFixed(1)}</td>
                    <td className="num right muted">{used || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="divider"/>
          <div className="dim" style={{fontSize:10.5, lineHeight:1.5}}>
            Daily bonus is capped at {MAX_DAILY_BONUS} points regardless of how many sessions you log. Stacking six modalities does not buy a better score.
          </div>
        </Card>

        <Card title="Effectiveness log" sub="immediate rating + next-day follow-up">
          <div className="col-gap" style={{gap:6}}>
            {MODALITY_LOG.map(m => {
              const meta = MODALITY_META[m.type];
              return (
                <div key={m.id} style={{padding:11, background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:6}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                    <Icon name={meta.icon} className="ic ic-sm" style={{color:meta.c}}/>
                    <span style={{fontSize:12.5, fontWeight:600}}>{meta.label}</span>
                    <span className="dim mono" style={{fontSize:10}}>{m.duration} min · {m.detail}</span>
                    <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>{m.date.slice(5)} {m.time}</span>
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 76px", gap:10, alignItems:"center"}}>
                    <div>
                      <div className="eyebrow" style={{marginBottom:3}}>Immediate · {m.immediate}/10</div>
                      <div style={{display:"flex", gap:1.5}}>
                        {Array.from({length:10}).map((_,i) => <div key={i} style={{flex:1, height:5, borderRadius:1, background: i < m.immediate ? meta.c : "var(--surface-2)"}}/>)}
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{marginBottom:3}}>Next day · {m.nextDay ?? "pending"}</div>
                      {m.nextDay != null ? (
                        <div style={{display:"flex", gap:1.5}}>
                          {Array.from({length:10}).map((_,i) => <div key={i} style={{flex:1, height:5, borderRadius:1, background: i < m.nextDay ? "var(--acc-recov)" : "var(--surface-2)"}}/>)}
                        </div>
                      ) : <button className="btn btn-sm" style={{height:18, fontSize:9.5, padding:"0 7px"}}>Rate now</button>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="eyebrow" style={{marginBottom:2}}>Δ score</div>
                      <div className="num" style={{fontSize:14, color: m.scoreDelta > 0 ? "var(--pos)" : "var(--fg-dim)"}}>{m.scoreDelta != null ? `${m.scoreDelta > 0 ? "+" : ""}${m.scoreDelta}` : "—"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══ OVERTRAINING ══════════════════════════════════════════
const RecOvertraining = () => {
  const { ot } = React.useContext(RecCtx2);
  const sevColor = { normal:"var(--pos)", moderate:"var(--warn)", high:"var(--neg)", critical:"var(--neg)" }[ot.severity];
  return (
    <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr", gap:14}}>
      <Card title="Signal panel" sub={`${ot.count} of 8 firing · severity ${ot.severity}`}>
        <div className="col-gap" style={{gap:6}}>
          {ot.results.map(r => (
            <div key={r.id} style={{display:"flex", gap:11, padding:11, background: r.fired ? "color-mix(in srgb, var(--warn) 6%, var(--surface))" : "var(--surface)", border:`1px solid ${r.fired ? "color-mix(in srgb, var(--warn) 26%, var(--border))" : "var(--border)"}`, borderRadius:6}}>
              <div style={{width:18, height:18, borderRadius:4, flexShrink:0, marginTop:1, display:"grid", placeItems:"center",
                background: r.fired ? "var(--warn)" : "var(--surface-2)", color: r.fired ? "var(--bg)" : "var(--fg-dim)"}}>
                <Icon name={r.fired ? "alert" : "check"} className="ic" style={{width:10, height:10, strokeWidth:2.5}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:2}}>
                  <span style={{fontSize:12.5, fontWeight: r.fired ? 600 : 500, color: r.fired ? "var(--fg)" : "var(--fg-muted)"}}>{r.label}</span>
                  <span className="mono dim" style={{marginLeft:"auto", fontSize:9.5}}>{r.id}</span>
                </div>
                <div className="dim mono" style={{fontSize:10.5}}>{r.detailText}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="col-gap" style={{gap:14}}>
        <Card title="Severity" sub="based on signal count, not any single threshold">
          <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:14}}>
            <div style={{width:64, height:64, borderRadius:14, background:`color-mix(in srgb, ${sevColor} 14%, var(--surface))`, border:`1px solid color-mix(in srgb, ${sevColor} 35%, var(--border))`, display:"grid", placeItems:"center"}}>
              <span className="num" style={{fontSize:26, fontWeight:600, color:sevColor}}>{ot.count}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:15, fontWeight:600, color:sevColor, textTransform:"capitalize", marginBottom:3}}>{ot.severity}</div>
              <div className="muted" style={{fontSize:11.5, lineHeight:1.45}}>
                {ot.severity === "normal" ? "No action needed. Keep training as planned."
                 : ot.severity === "moderate" ? "Warning. A deload is worth considering."
                 : ot.severity === "high" ? "Deload week strongly recommended."
                 : "Mandatory break. See a doctor if this persists."}
              </div>
            </div>
          </div>
          {[
            ["0–2 signals","Normal","var(--pos)"],
            ["3–4 signals","Moderate · warning + deload suggestion","var(--warn)"],
            ["5–6 signals","High · deload week urgently recommended","var(--neg)"],
            ["7–8 signals","Critical · mandatory break + doctor","var(--neg)"],
          ].map(([r,l,c],i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderBottom: i<3?"1px solid var(--border)":"none",
              opacity: (ot.count>=0&&i===0&&ot.count<=2)||(i===1&&ot.count>=3&&ot.count<=4)||(i===2&&ot.count>=5&&ot.count<=6)||(i===3&&ot.count>=7) ? 1 : 0.42}}>
              <span className="num" style={{fontSize:11, width:76, color:c}}>{r}</span>
              <span style={{fontSize:11, flex:1}}>{l}</span>
            </div>
          ))}
        </Card>

        <Card title="Alert lifecycle">
          <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:10}}>
            {["active","acknowledged","resolved"].map((s,i) => (
              <React.Fragment key={s}>
                <div style={{flex:1, padding:"8px 6px", textAlign:"center", borderRadius:5, fontSize:10.5,
                  background: i===0 ? "color-mix(in srgb, var(--warn) 10%, var(--surface))" : "var(--surface)",
                  border:`1px solid ${i===0 ? "color-mix(in srgb, var(--warn) 30%, var(--border))" : "var(--border)"}`,
                  color: i===0 ? "var(--warn)" : "var(--fg-muted)"}}>{s}</div>
                {i < 2 && <Icon name="arr_r" className="ic ic-sm" style={{color:"var(--fg-dim)"}}/>}
              </React.Fragment>
            ))}
          </div>
          <div className="dim" style={{fontSize:10.5, lineHeight:1.55}}>
            No new alert is raised while one is active. That keeps a bad week from generating seven separate warnings.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══ PROTOCOLS ═════════════════════════════════════════════
const RecProtocols = () => {
  const { open } = React.useContext(RecCtx2);
  const active = RECOVERY_PROTOCOLS.find(p => p.id === ACTIVE_PROTOCOL.id);
  return (
    <div className="grid" style={{gridTemplateColumns:"1.3fr 1fr", gap:14}}>
      <div className="col-gap" style={{gap:14}}>
        <Card title={`Active · ${active.name}`} sub={`day ${ACTIVE_PROTOCOL.day} of ${ACTIVE_PROTOCOL.of} · started ${ACTIVE_PROTOCOL.started}`}
          actions={<button className="btn btn-ghost btn-sm">End protocol</button>}>
          <div style={{display:"flex", gap:4, marginBottom:14}}>
            {Array.from({length:active.days}).map((_,i) => (
              <div key={i} style={{flex:1, height:8, borderRadius:2, background: i < ACTIVE_PROTOCOL.day ? "var(--acc-recov)" : "var(--surface-2)"}}/>
            ))}
          </div>
          <div className="eyebrow" style={{marginBottom:6}}>Today's tasks</div>
          <div className="col-gap" style={{gap:5}}>
            {active.tasks.map((t,i) => (
              <label key={i} style={{display:"flex", alignItems:"center", gap:9, padding:"9px 11px", background: t.done ? "color-mix(in srgb, var(--pos) 5%, var(--surface))" : "var(--surface)", border:`1px solid ${t.done ? "color-mix(in srgb, var(--pos) 24%, var(--border))" : "var(--border)"}`, borderRadius:5, cursor:"pointer"}}>
                <input type="checkbox" defaultChecked={t.done} style={{accentColor:"var(--pos)"}}/>
                <span style={{fontSize:12, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--fg-muted)" : "var(--fg)"}}>{t.t}</span>
                {t.done && <Pill variant="pos" style={{marginLeft:"auto", fontSize:9}}>done</Pill>}
              </label>
            ))}
          </div>
          <div className="dim" style={{fontSize:10.5, marginTop:10, lineHeight:1.5}}>
            Protocol tasks appear in your Today view the same way meal-plan ghost entries do — pre-filled, confirmable, skippable.
          </div>
        </Card>

        <Card title="Protocol library" sub="4 system templates">
          <div className="col-gap" style={{gap:8}}>
            {RECOVERY_PROTOCOLS.map(p => (
              <div key={p.id} onClick={()=>open("protocol", p)} style={{padding:12, background: p.id===ACTIVE_PROTOCOL.id ? "color-mix(in srgb, var(--acc-recov) 6%, var(--surface))" : "var(--surface)", border:`1px solid ${p.id===ACTIVE_PROTOCOL.id ? "color-mix(in srgb, var(--acc-recov) 28%, var(--border))" : "var(--border)"}`, borderRadius:6, cursor:"pointer"}}>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                  <span style={{fontSize:13, fontWeight:600}}>{p.name}</span>
                  {p.id===ACTIVE_PROTOCOL.id && <Pill variant="acc">active</Pill>}
                  <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>{p.days} days</span>
                </div>
                <div className="muted" style={{fontSize:11.5, marginBottom:6}}>{p.goal}</div>
                <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
                  {p.activities.slice(0,3).map(a => <Pill key={a} style={{fontSize:9.5}}>{a}</Pill>)}
                  {p.activities.length > 3 && <Pill style={{fontSize:9.5}}>+{p.activities.length-3}</Pill>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="When to run which" sub="trigger conditions">
        <div className="col-gap" style={{gap:8}}>
          {[
            ["Active Recovery Week","Score 60–70 for 3+ days, no acute problem","var(--acc-recov)"],
            ["Passive Deload","5+ overtraining signals, or score below 55 for 3 days","var(--warn)"],
            ["Sleep Optimization","Sleep score below 70 across 7 days","var(--acc-coach)"],
            ["Injury Protocol","Acute injury logged in Medical, or soreness 3/3 for 5 days","var(--neg)"],
          ].map(([n,c,col]) => (
            <div key={n} style={{padding:11, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6}}>
              <div style={{display:"flex", alignItems:"center", gap:7, marginBottom:4}}>
                <span className="dot" style={{background:col, width:7, height:7}}/>
                <span style={{fontSize:12, fontWeight:600}}>{n}</span>
              </div>
              <div className="dim" style={{fontSize:10.5, lineHeight:1.45, paddingLeft:14}}>{c}</div>
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div className="dim" style={{fontSize:10.5, lineHeight:1.55}}>
          Buddy proposes a protocol when a trigger fires — it never activates one on its own. Activation is always your call.
        </div>
      </Card>
    </div>
  );
};

Object.assign(window, { RecoveryModuleV2, BodyMap18, RecCtx2 });
