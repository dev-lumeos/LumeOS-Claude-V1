// Recovery · modals — HRV measurement, log modality, muscle detail, protocol detail

const RMod = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 620 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight:"92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && <div style={{width:26, height:26, borderRadius:6, background:`color-mix(in srgb, ${accent||"var(--acc-recov)"} 18%, transparent)`, border:`1px solid color-mix(in srgb, ${accent||"var(--acc-recov)"} 35%, var(--border))`, color:accent||"var(--acc-recov)", display:"grid", placeItems:"center"}}><Icon name={eyebrow} className="ic"/></div>}
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

// ── HRV phone-camera measurement ───────────────────────────
window.HRVMeasureModal = ({ onClose }) => {
  const [phase, setPhase] = React.useState("ready"); // ready | measuring | done
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (phase !== "measuring") return;
    const id = setInterval(() => setT(x => {
      if (x >= 60) { clearInterval(id); setPhase("done"); return 60; }
      return x + 1;
    }), 50);
    return () => clearInterval(id);
  }, [phase]);
  const result = calcHRVScore(64);

  return (
    <RMod title="HRV measurement" subtitle="Phone camera PPG · 60 seconds · no wearable needed" eyebrow="camera" onClose={onClose}
      footer={phase === "done"
        ? <><button className="btn btn-ghost" onClick={onClose}>Discard</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save · 64 ms</button></>
        : <><button className="btn btn-ghost" onClick={onClose}>Cancel</button>{phase==="ready" && <button className="btn btn-primary" onClick={()=>{setT(0);setPhase("measuring");}}><Icon name="play" className="ic ic-sm"/>Start measurement</button>}</>}>

      {phase === "ready" && (
        <>
          <div style={{padding:20, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, marginBottom:14}}>
            <div className="eyebrow" style={{marginBottom:10}}>Before you start</div>
            <div className="col-gap" style={{gap:7}}>
              {[
                "Sit still, breathe normally — do not control your breath",
                "Cover the rear camera lens and flash fully with your index finger",
                "Light pressure only · pressing hard distorts the signal",
                "Best taken on waking, before standing up",
              ].map(x => (
                <div key={x} style={{display:"flex", gap:8, alignItems:"flex-start", fontSize:11.5, color:"var(--fg-muted)"}}>
                  <Icon name="check" className="ic ic-sm" style={{color:"var(--pos)", marginTop:2, flexShrink:0}}/>{x}
                </div>
              ))}
            </div>
          </div>
          <div className="grid g-cols-3" style={{gap:10}}>
            <Card className="card-tight" style={{padding:11}}><div className="eyebrow">Duration</div><div className="num" style={{fontSize:15}}>60 s</div></Card>
            <Card className="card-tight" style={{padding:11}}><div className="eyebrow">Accuracy</div><div className="num" style={{fontSize:15}}>r = 0.98</div><div className="dim" style={{fontSize:9.5}}>vs chest strap</div></Card>
            <Card className="card-tight" style={{padding:11}}><div className="eyebrow">Your baseline</div><div className="num" style={{fontSize:15}}>{HRV_BASELINE.avg_rmssd} ms</div><div className="dim" style={{fontSize:9.5}}>± {HRV_BASELINE.stddev_rmssd}</div></Card>
          </div>
        </>
      )}

      {phase === "measuring" && (
        <div style={{textAlign:"center", padding:"10px 0"}}>
          <div style={{position:"relative", width:150, height:150, margin:"0 auto 18px"}}>
            <svg viewBox="0 0 100 100" style={{width:"100%", height:"100%", transform:"rotate(-90deg)"}}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-2)" strokeWidth="7"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--acc-recov)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={2*Math.PI*44} strokeDashoffset={2*Math.PI*44*(1-t/60)}/>
            </svg>
            <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
              <span className="num" style={{fontSize:32, fontWeight:600}}>{60-t}</span>
              <span className="dim mono" style={{fontSize:10}}>seconds left</span>
            </div>
          </div>
          <div className="eyebrow" style={{marginBottom:8}}>PPG signal</div>
          <svg viewBox="0 0 300 50" style={{width:"100%", height:50, marginBottom:12}}>
            <path d={Array.from({length:60}).map((_,i) => {
              const x = i*5, beat = i % 7;
              const y = beat === 0 ? 8 : beat === 1 ? 42 : beat === 2 ? 26 : 30 + Math.sin(i)*2;
              return `${i===0?"M":"L"} ${x} ${y}`;
            }).join(" ")} fill="none" stroke="var(--acc-recov)" strokeWidth="1.5"/>
          </svg>
          <div className="dim" style={{fontSize:11}}>Detecting R-R intervals · keep your finger still</div>
        </div>
      )}

      {phase === "done" && (
        <>
          <div style={{display:"flex", gap:18, alignItems:"center", marginBottom:14}}>
            <Ring value={result.score} max={100} color="var(--pos)" label="hrv" size={104} stroke={8}/>
            <div style={{flex:1}}>
              <div className="num" style={{fontSize:28, lineHeight:1, marginBottom:4}}>64 <span className="dim" style={{fontSize:13}}>ms RMSSD</span></div>
              <div style={{fontSize:12.5, color:"var(--pos)", marginBottom:6}}>+{(64 - HRV_BASELINE.avg_rmssd).toFixed(1)} ms above your baseline</div>
              <div className="dim mono" style={{fontSize:10.5}}>z-score {result.z > 0 ? "+" : ""}{result.z} · signal quality 0.94</div>
            </div>
          </div>
          <div className="dim mono" style={{fontSize:10, lineHeight:1.7, padding:10, background:"var(--surface-2)", borderRadius:6, marginBottom:12}}>
            R-R intervals captured: 61 · artifacts removed: 2<br/>
            deviation = (64 − {HRV_BASELINE.avg_rmssd}) / {HRV_BASELINE.stddev_rmssd} = {result.z}<br/>
            score = 70 + {result.z} × 15 = {result.score}
          </div>
          <div className="eyebrow" style={{marginBottom:4}}>Note (optional)</div>
          <input placeholder="Travel, illness, late meal…" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12}}/>
        </>
      )}
    </RMod>
  );
};

// ── Log modality ───────────────────────────────────────────
window.LogModalityModal = ({ onClose }) => {
  const [type, setType] = React.useState("sauna");
  const [rating, setRating] = React.useState(7);
  const bonusAfter = calcModalityBonus([...TODAY_MODALITIES, { type }]);
  return (
    <RMod title="Log recovery modality" subtitle={`Today's bonus: +${calcModalityBonus(TODAY_MODALITIES).capped} of ${MAX_DAILY_BONUS} max`} eyebrow="plus" onClose={onClose} width={640}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Log · +{MODALITY_BONUS[type]} bonus</button></>}>
      <div className="eyebrow" style={{marginBottom:6}}>Modality</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6, marginBottom:14}}>
        {Object.entries(MODALITY_BONUS).map(([k,v]) => {
          const meta = MODALITY_META[k];
          const on = type === k;
          return (
            <button key={k} onClick={()=>setType(k)} style={{padding:"10px 6px", borderRadius:6, cursor:"pointer",
              background: on ? `color-mix(in srgb, ${meta.c} 12%, var(--surface))` : "var(--surface)",
              border:`1px solid ${on ? `color-mix(in srgb, ${meta.c} 38%, var(--border))` : "var(--border)"}`,
              color: on ? meta.c : "var(--fg-muted)", display:"flex", flexDirection:"column", alignItems:"center", gap:4}}>
              <Icon name={meta.icon} className="ic"/>
              <span style={{fontSize:10.5, textAlign:"center", lineHeight:1.25}}>{meta.label}</span>
              <span className="mono" style={{fontSize:9, opacity:.75}}>+{v}</span>
            </button>
          );
        })}
      </div>
      <div className="grid g-cols-3" style={{gap:10, marginBottom:14}}>
        <div><div className="eyebrow" style={{marginBottom:4}}>Date</div><input type="date" defaultValue="2026-08-15" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
        <div><div className="eyebrow" style={{marginBottom:4}}>Time</div><input type="time" defaultValue="19:30" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
        <div><div className="eyebrow" style={{marginBottom:4}}>Duration · min</div><input type="number" defaultValue="20" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, fontFamily:"var(--font-mono)"}}/></div>
      </div>
      <div className="eyebrow" style={{marginBottom:5}}>How did it feel · {rating}/10</div>
      <div style={{display:"flex", gap:3, marginBottom:14}}>
        {Array.from({length:10}).map((_,i) => (
          <button key={i} onClick={()=>setRating(i+1)} style={{flex:1, height:26, borderRadius:4, border:0, cursor:"pointer",
            background: i < rating ? MODALITY_META[type].c : "var(--surface-2)", opacity: i < rating ? 0.4 + (i/10)*0.6 : 1,
            color: i+1===rating ? "var(--bg)" : "var(--fg-dim)", fontFamily:"var(--font-mono)", fontSize:10, fontWeight:600}}>{i+1}</button>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom:4}}>Detail</div>
      <input placeholder="Temperature, routine, location…" style={{width:"100%", height:30, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, padding:"0 10px", fontSize:12, marginBottom:12}}/>
      <div style={{padding:11, background: bonusAfter.wasCapped ? "color-mix(in srgb, var(--warn) 6%, var(--surface))" : "color-mix(in srgb, var(--pos) 5%, var(--surface))", border:`1px solid ${bonusAfter.wasCapped ? "color-mix(in srgb, var(--warn) 26%, var(--border))" : "color-mix(in srgb, var(--pos) 24%, var(--border))"}`, borderRadius:6, fontSize:11.5, color:"var(--fg-muted)", lineHeight:1.5}}>
        {bonusAfter.wasCapped
          ? <>Raw bonus would be {bonusAfter.raw} — capped at {MAX_DAILY_BONUS}. This session still counts for effectiveness tracking, but adds no further score.</>
          : <>Bonus after logging: <span className="num" style={{color:"var(--pos)"}}>+{bonusAfter.capped}</span> of {MAX_DAILY_BONUS} max. You will be asked to rate the after-effect tomorrow morning.</>}
      </div>
    </RMod>
  );
};

// ── Muscle detail ──────────────────────────────────────────
window.MuscleDetailModal2 = ({ slug, onClose }) => {
  const st = MUSCLE_STATE[slug];
  const c = calcMuscleRecovery({ hours:st.hours, sets:st.sets, sleepQuality:CHECKIN.sleep_quality, proteinPct:0.79, caloriePct:0.68, soreness:st.soreness });
  const col = c.value >= 80 ? "var(--pos)" : c.value >= 50 ? "var(--warn)" : "var(--neg)";
  const trainingName = Object.entries(MUSCLE_SLUG_MAP).find(([,v]) => v === slug)?.[0];
  const curve = [0,12,24,36,48,60,72,84,96].map(h => Math.round(baseRecoveryCurve(h) * c.vm * c.sm * c.nm * c.som));

  return (
    <RMod title={MUSCLE_LABEL[slug]} subtitle={`${st.lastSession} · ${st.hours}h ago · ${st.sets} sets`} eyebrow="recovery" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="training" className="ic ic-sm"/>Open Training</button></>}>
      <div style={{display:"flex", gap:18, alignItems:"center", marginBottom:16}}>
        <Ring value={c.value} max={100} color={col} label="recovered" size={104} stroke={8}/>
        <div style={{flex:1}}>
          <div className="grid g-cols-2" style={{gap:8}}>
            {[
              ["Hours since", `${st.hours} h`],
              ["Sets logged", st.sets],
              ["Soreness", `${st.soreness}/3`],
              ["Body-map slug", slug],
            ].map(([l,v]) => (
              <div key={l} style={{padding:9, background:"var(--bg-elev)", border:"1px solid var(--border)", borderRadius:5}}>
                <div className="eyebrow" style={{marginBottom:2}}>{l}</div>
                <div className="num" style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{marginBottom:6}}>Calculation</div>
      <Card className="card-tight" style={{padding:12, marginBottom:14}}>
        <div className="col-gap" style={{gap:5}}>
          {[
            ["Base curve", `${st.hours}h`, c.base, "from the 0→96h recovery curve"],
            ["Volume modifier", `${st.sets} sets`, `× ${c.vm.toFixed(2)}`, st.sets<=6?"≤6 sets speeds recovery":st.sets<=12?"6–12 sets neutral":st.sets<=18?"13–18 sets slows it":"high volume, slow"],
            ["Sleep modifier", `q ${CHECKIN.sleep_quality}/10`, `× ${c.sm.toFixed(2)}`, CHECKIN.sleep_quality>=8.5?"excellent sleep":"adequate sleep"],
            ["Nutrition modifier", "P 79% · kcal 68%", `× ${c.nm.toFixed(2)}`, "protein below 80% of target"],
            ["Soreness modifier", `${st.soreness}/3`, `× ${c.som.toFixed(2)}`, st.soreness===0?"no soreness reported":st.soreness===1?"mild soreness":"significant soreness"],
          ].map(([l,input,factor,note]) => (
            <div key={l} style={{display:"grid", gridTemplateColumns:"128px 88px 62px 1fr", gap:9, alignItems:"center", fontSize:11}}>
              <span style={{color:"var(--fg-muted)"}}>{l}</span>
              <span className="mono dim" style={{fontSize:10}}>{input}</span>
              <span className="num" style={{color: String(factor).includes("0.") && parseFloat(String(factor).replace("× ","")) < 1 ? "var(--warn)" : "var(--fg)"}}>{factor}</span>
              <span className="dim" style={{fontSize:10}}>{note}</span>
            </div>
          ))}
          <div style={{display:"grid", gridTemplateColumns:"128px 88px 62px 1fr", gap:9, alignItems:"center", fontSize:12, paddingTop:6, borderTop:"1px solid var(--border-strong)"}}>
            <span style={{fontWeight:700}}>Result</span>
            <span/>
            <span className="num" style={{fontSize:15, fontWeight:600, color:col}}>{c.value}%</span>
            <span className="dim mono" style={{fontSize:10}}>{c.base} × {c.vm} × {c.sm} × {c.nm} × {c.som}</span>
          </div>
        </div>
      </Card>

      <div className="eyebrow" style={{marginBottom:6}}>Projected recovery for this muscle</div>
      <LineChart h={130} range={[0,105]} xLabels={["0h","","24h","","48h","","72h","","96h"]}
        series={[
          { data: curve, color: col },
          { data: Array(9).fill(80), color: "var(--pos)" },
        ]}/>
      <div style={{display:"flex", gap:14, marginTop:8, fontSize:10.5, color:"var(--fg-muted)"}}>
        <span className="row-gap"><span className="dot" style={{background:col}}/>with your current modifiers</span>
        <span className="row-gap"><span className="dot" style={{background:"var(--pos)"}}/>80% ready threshold</span>
      </div>
      {trainingName && (
        <div style={{marginTop:12, padding:10, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, fontSize:11, color:"var(--fg-muted)"}}>
          Mapped from Training module muscle group <span className="mono" style={{color:"var(--fg)"}}>{trainingName}</span> via MUSCLE_SLUG_MAP.
        </div>
      )}
    </RMod>
  );
};

// ── Protocol detail ────────────────────────────────────────
window.ProtocolDetailModal = ({ p, onClose }) => {
  const isActive = p.id === ACTIVE_PROTOCOL.id;
  return (
    <RMod title={p.name} subtitle={`${p.goal} · ${p.days} days`} eyebrow="calendar" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button>{isActive ? <button className="btn btn-ghost" style={{color:"var(--neg)"}}>End protocol</button> : <button className="btn btn-primary"><Icon name="play" className="ic ic-sm"/>Activate protocol</button>}</>}>
      {isActive && (
        <div style={{padding:11, background:"color-mix(in srgb, var(--acc-recov) 7%, var(--surface))", border:"1px solid color-mix(in srgb, var(--acc-recov) 28%, var(--border))", borderRadius:6, marginBottom:14}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Pill variant="acc">active</Pill>
            <span style={{fontSize:12}}>Day {ACTIVE_PROTOCOL.day} of {ACTIVE_PROTOCOL.of}</span>
            <span className="dim mono" style={{marginLeft:"auto", fontSize:10}}>started {ACTIVE_PROTOCOL.started}</span>
          </div>
        </div>
      )}
      <div className="eyebrow" style={{marginBottom:6}}>Daily activities</div>
      <div className="col-gap" style={{gap:5, marginBottom:14}}>
        {p.activities.map(a => (
          <div key={a} style={{display:"flex", gap:9, padding:"9px 11px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:5, fontSize:12}}>
            <Icon name="check" className="ic ic-sm" style={{color:"var(--acc-recov)", marginTop:1, flexShrink:0}}/>{a}
          </div>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom:6}}>How it works</div>
      <div style={{padding:11, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, fontSize:11.5, color:"var(--fg-muted)", lineHeight:1.6}}>
        Activating this protocol writes its activities into your Today view as daily tasks — the same pattern nutrition meal plans use for ghost entries. Tasks can be confirmed, skipped, or edited. The protocol ends automatically after {p.days} days, or you can end it early.
      </div>
    </RMod>
  );
};
