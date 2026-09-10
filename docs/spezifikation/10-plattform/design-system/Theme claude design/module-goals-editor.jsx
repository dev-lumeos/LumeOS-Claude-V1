// Goals · Phase Editor — customize any phase's parameters, guards, and cycle layout

const PE_MODES = {
  fat_loss:         ["variants", "guards", "duration"],
  lean_bulk:        ["params", "guards", "duration"],
  maintenance:      ["params"],
  recomp:           ["params", "cycling"],
  contest_prep:     ["subphases", "refeeds", "peakweek", "guards", "anchor"],
  reverse_diet:     ["params", "exits", "guards"],
  expert_bb_annual: ["annual", "anchor", "overrides"],
};

const PEField = ({ label, sub, children }) => (
  <div style={{marginBottom: 12}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5}}>
      <label className="eyebrow">{label}</label>
      {sub && <span className="dim mono" style={{fontSize: 10}}>{sub}</span>}
    </div>
    {children}
  </div>
);

const PENum = ({ value, onChange, suffix, width }) => (
  <div style={{position: "relative", width: width || "100%"}}>
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
      style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 34px 0 10px", fontSize: 12, fontFamily: "var(--font-mono)", outline: "none"}}/>
    {suffix && <span className="dim mono" style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10}}>{suffix}</span>}
  </div>
);

const PERange = ({ min, max, onMin, onMax, suffix }) => (
  <div style={{display: "flex", alignItems: "center", gap: 8}}>
    <PENum value={min} onChange={onMin} suffix={suffix}/>
    <span className="dim mono" style={{fontSize: 11}}>→</span>
    <PENum value={max} onChange={onMax} suffix={suffix}/>
  </div>
);

const PEToggle = ({ on, onChange, label, sub }) => (
  <div onClick={() => onChange(!on)} style={{
    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", cursor: "pointer",
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6,
  }}>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontSize: 11.5, fontFamily: "var(--font-mono)", color: on ? "var(--fg)" : "var(--fg-dim)"}}>{label}</div>
      {sub && <div className="dim" style={{fontSize: 10, marginTop: 2}}>{sub}</div>}
    </div>
    <div style={{width: 30, height: 17, borderRadius: 999, background: on ? "var(--pos)" : "var(--surface-2)", padding: 2, flexShrink: 0, transition: "background .15s"}}>
      <div style={{width: 13, height: 13, borderRadius: 999, background: "var(--bg)", marginLeft: on ? 13 : 0, transition: "margin .15s"}}/>
    </div>
  </div>
);

// ── Editor modal ──────────────────────────────────────────
window.PhaseEditorModal = ({ phaseId, onClose }) => {
  const base = GOAL_PHASES[phaseId];
  const modes = PE_MODES[phaseId] || ["params"];
  const [tab, setTab] = React.useState(modes[0]);
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(base)));
  const [dirty, setDirty] = React.useState(false);
  const [anchorDate, setAnchorDate] = React.useState("2026-11-14");

  const upd = fn => { setDraft(d => { const n = JSON.parse(JSON.stringify(d)); fn(n); return n; }); setDirty(true); };

  const tabLabels = {
    variants: "Variants", params: "Parameters", guards: "Guards", duration: "Duration",
    subphases: "Sub-phases", refeeds: "Refeeds", peakweek: "Peak week", anchor: "Date anchor",
    annual: "Annual cycle", overrides: "Per-phase overrides", cycling: "Calorie cycling", exits: "Exit conditions",
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 860, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: `color-mix(in srgb, ${base.color} 18%, transparent)`,
            border: `1px solid color-mix(in srgb, ${base.color} 38%, var(--border))`,
            color: base.color, display: "grid", placeItems: "center",
          }}><Icon name="edit" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <span style={{fontSize: 14, fontWeight: 600}}>Edit · {base.name}</span>
              {dirty && <Pill variant="warn" style={{fontSize: 9}}>unsaved</Pill>}
            </div>
            <div className="dim" style={{fontSize: 11}}>Personal override — the shipped defaults stay intact</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>

        <div style={{padding: "10px 16px 0"}}>
          <div className="tabs tabs-rail" style={{marginBottom: 0}}>
            {modes.map(m => (
              <div key={m} className={`tab ${tab === m ? "active" : ""}`} onClick={() => setTab(m)}>{tabLabels[m]}</div>
            ))}
          </div>
        </div>

        <div className="modal-body" style={{overflowY: "auto", padding: 16}}>
          {/* ── VARIANTS (fat_loss) ── */}
          {tab === "variants" && draft.variants && (
            <div className="grid g-cols-2" style={{gap: 12}}>
              {Object.entries(draft.variants).map(([vk, v]) => (
                <Card key={vk} className="card-tight" style={{padding: 14}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 12}}>
                    <span style={{fontSize: 13, fontWeight: 600, textTransform: "capitalize"}}>{vk}</span>
                    <Pill style={{fontSize: 9}}>{v.maxWeeks} wk cap</Pill>
                  </div>
                  <PEField label="Calorie deficit" sub="kcal/day">
                    <PERange min={v.deficit[0]} max={v.deficit[1]} suffix="kcal"
                      onMin={n => upd(d => d.variants[vk].deficit[0] = n)}
                      onMax={n => upd(d => d.variants[vk].deficit[1] = n)}/>
                  </PEField>
                  <PEField label="Protein" sub="g per kg bodyweight">
                    <PERange min={v.protein[0]} max={v.protein[1]} suffix="g/kg"
                      onMin={n => upd(d => d.variants[vk].protein[0] = n)}
                      onMax={n => upd(d => d.variants[vk].protein[1] = n)}/>
                  </PEField>
                  <PEField label="Max duration">
                    <PENum value={v.maxWeeks} suffix="wk" onChange={n => upd(d => d.variants[vk].maxWeeks = n)}/>
                  </PEField>
                  <PEField label="Rate of loss" sub="informational">
                    <input value={v.rate} onChange={e => upd(d => d.variants[vk].rate = e.target.value)}
                      style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
                  </PEField>
                  <PEField label="Diet break">
                    <input value={v.dietBreak} onChange={e => upd(d => d.variants[vk].dietBreak = e.target.value)}
                      style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
                  </PEField>
                </Card>
              ))}
            </div>
          )}

          {/* ── PARAMS ── */}
          {tab === "params" && draft.params && (
            <div className="grid g-cols-2" style={{gap: 12}}>
              {Object.entries(draft.params).map(([k, v]) => (
                <PEField key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}>
                  {Array.isArray(v)
                    ? <PERange min={v[0]} max={v[1]}
                        onMin={n => upd(d => d.params[k][0] = n)}
                        onMax={n => upd(d => d.params[k][1] = n)}/>
                    : <input value={v} onChange={e => upd(d => d.params[k] = e.target.value)}
                        style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>}
                </PEField>
              ))}
            </div>
          )}

          {/* ── CALORIE CYCLING (recomp) ── */}
          {tab === "cycling" && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Set the per-day delta from TDEE. The weekly average is computed from your actual training-day count.
              </div>
              <div className="grid g-cols-3" style={{gap: 12, marginBottom: 14}}>
                <PEField label="Training days" sub="delta from TDEE"><PENum value={200} suffix="kcal" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Rest days" sub="delta from TDEE"><PENum value={-300} suffix="kcal" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Training days / week"><PENum value={5} suffix="d" onChange={() => setDirty(true)}/></PEField>
              </div>
              <Card className="card-tight" style={{padding: 12, background: "color-mix(in srgb, var(--acc-goals) 6%, var(--surface))"}}>
                <div className="eyebrow" style={{marginBottom: 6}}>Computed weekly average</div>
                <div className="num" style={{fontSize: 18, fontWeight: 600}}>+{Math.round((5 * 200 + 2 * -300) / 7)} kcal/day</div>
                <div className="dim" style={{fontSize: 11, marginTop: 4}}>vs. TDEE {TDEE_STATE.current.toLocaleString()} → effective {(TDEE_STATE.current + Math.round((5 * 200 + 2 * -300) / 7)).toLocaleString()} kcal/day</div>
              </Card>
              <div className="divider"/>
              <PEField label="Protein floor"><PERange min={2.0} max={2.4} suffix="g/kg" onMin={() => setDirty(true)} onMax={() => setDirty(true)}/></PEField>
            </>
          )}

          {/* ── DURATION ── */}
          {tab === "duration" && (
            <>
              <div className="grid g-cols-2" style={{gap: 12}}>
                <PEField label="Max duration" sub="force transition after">
                  <PENum value={draft.params?.maxWeeks || draft.variants?.moderate?.maxWeeks || 20} suffix="wk" onChange={() => setDirty(true)}/>
                </PEField>
                <PEField label="Minimum before transition allowed">
                  <PENum value={4} suffix="wk" onChange={() => setDirty(true)}/>
                </PEField>
              </div>
              <PEField label="Auto-transition behaviour">
                <div style={{display: "flex", gap: 6}}>
                  {["Suggest only", "Auto with 7d notice", "Fully automatic"].map((o, i) => (
                    <button key={o} className={i === 0 ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{o}</button>
                  ))}
                </div>
              </PEField>
              <div className="divider"/>
              <div className="eyebrow" style={{marginBottom: 8}}>Scheduled diet breaks</div>
              <div className="grid g-cols-2" style={{gap: 12}}>
                <PEField label="Every"><PENum value={8} suffix="wk" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Duration"><PENum value={1} suffix="wk" onChange={() => setDirty(true)}/></PEField>
              </div>
            </>
          )}

          {/* ── SUB-PHASES (contest prep) ── */}
          {tab === "subphases" && draft.subPhases && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Weeks-out are anchored to your show date. Change the anchor in the <span className="mono" style={{color: "var(--fg)"}}>Date anchor</span> tab and these recompute.
              </div>
              <Card className="card-tight" style={{padding: 0}}>
                <table className="tbl" style={{margin: 0}}>
                  <thead><tr><th style={{paddingLeft: 12}}>Stage</th><th style={{width: 110}}>Weeks out</th><th style={{width: 120}}>Deficit</th><th style={{width: 130}}>Cardio</th><th style={{width: 40}}></th></tr></thead>
                  <tbody>
                    {draft.subPhases.map((sp, i) => (
                      <tr key={i}>
                        <td style={{paddingLeft: 12}}>
                          <input value={sp.name} onChange={e => upd(d => d.subPhases[i].name = e.target.value)}
                            style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}/>
                        </td>
                        <td>
                          <input value={sp.weeks} onChange={e => upd(d => d.subPhases[i].weeks = e.target.value)}
                            style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5, fontFamily: "var(--font-mono)"}}/>
                        </td>
                        <td>
                          {sp.deficit != null
                            ? <PENum value={sp.deficit} suffix="kcal" onChange={n => upd(d => d.subPhases[i].deficit = n)}/>
                            : <span className="dim mono" style={{fontSize: 11}}>protocol</span>}
                        </td>
                        <td>
                          {sp.cardio
                            ? <select value={sp.cardio} onChange={e => upd(d => d.subPhases[i].cardio = e.target.value)}
                                style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, padding: "0 6px"}}>
                                <option>none</option><option>low</option><option>moderate</option><option>high</option><option>very high</option>
                              </select>
                            : <span className="dim mono" style={{fontSize: 11}}>—</span>}
                        </td>
                        <td><button className="icon-btn"><Icon name="trash" className="ic ic-sm"/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <div style={{display: "flex", gap: 6, marginTop: 10}}>
                <button className="btn btn-sm"><Icon name="plus" className="ic ic-sm"/>Add sub-phase</button>
                <button className="btn btn-ghost btn-sm">Reset to IFBB default</button>
              </div>
            </>
          )}

          {/* ── REFEEDS ── */}
          {tab === "refeeds" && (
            <>
              <div className="grid g-cols-3" style={{gap: 12}}>
                <PEField label="Start after week"><PENum value={8} suffix="wk" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Frequency"><PENum value={2} suffix="×/wk" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Carb multiplier"><PENum value={1.8} suffix="×" onChange={() => setDirty(true)}/></PEField>
              </div>
              <PEField label="Refeed day placement">
                <div style={{display: "flex", gap: 4}}>
                  {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d, i) => (
                    <button key={d} className={[3, 6].includes(i) ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{d}</button>
                  ))}
                </div>
              </PEField>
              <PEField label="Refeed type">
                <div style={{display: "flex", gap: 6}}>
                  {["High carb · moderate kcal", "Full maintenance", "Above maintenance"].map((o, i) => (
                    <button key={o} className={i === 0 ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{o}</button>
                  ))}
                </div>
              </PEField>
              <div className="divider"/>
              <PEToggle on={true} onChange={() => setDirty(true)} label="Auto-schedule refeeds after low-adherence weeks" sub="triggers when adherence < 80% for 2 consecutive weeks"/>
            </>
          )}

          {/* ── PEAK WEEK ── */}
          {tab === "peakweek" && (
            <>
              <div className="grid g-cols-2" style={{gap: 12}}>
                <PEField label="Carb depletion days"><PENum value={3} suffix="d" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Carb load days"><PENum value={2} suffix="d" onChange={() => setDirty(true)}/></PEField>
              </div>
              <div className="grid g-cols-2" style={{gap: 12}}>
                <PEField label="Depletion carbs" sub="g/kg on depletion days"><PENum value={0.5} suffix="g/kg" onChange={() => setDirty(true)}/></PEField>
                <PEField label="Load carbs" sub="g/kg on load days"><PENum value={8} suffix="g/kg" onChange={() => setDirty(true)}/></PEField>
              </div>
              <div className="divider"/>
              <div className="eyebrow" style={{marginBottom: 8}}>Protocols</div>
              <div className="col-gap" style={{gap: 6}}>
                <PEToggle on={true}  onChange={() => setDirty(true)} label="Sodium manipulation" sub="load then taper 48h out"/>
                <PEToggle on={true}  onChange={() => setDirty(true)} label="Water manipulation" sub="high intake → cut 12h out"/>
                <PEToggle on={false} onChange={() => setDirty(true)} label="Diuretics" sub="off · requires medical sign-off"/>
                <PEToggle on={true}  onChange={() => setDirty(true)} label="Training taper" sub="last heavy session 5d out"/>
                <PEToggle on={true}  onChange={() => setDirty(true)} label="Posing practice schedule" sub="2×/day final week"/>
              </div>
            </>
          )}

          {/* ── DATE ANCHOR ── */}
          {tab === "anchor" && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Set your show or target date. Everything upstream — sub-phases, refeed start, peak week, taper — recomputes backwards from here.
              </div>
              <div className="grid g-cols-2" style={{gap: 12}}>
                <PEField label="Show / target date">
                  <input type="date" value={anchorDate} onChange={e => { setAnchorDate(e.target.value); setDirty(true); }}
                    style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
                </PEField>
                <PEField label="Total prep length"><PENum value={24} suffix="wk" onChange={() => setDirty(true)}/></PEField>
              </div>
              <Card className="card-tight" style={{padding: 14, background: "color-mix(in srgb, var(--acc-goals) 6%, var(--surface))"}}>
                <div className="eyebrow" style={{marginBottom: 8}}>Computed backwards schedule</div>
                <table className="tbl" style={{margin: 0}}>
                  <tbody>
                    {[
                      ["Prep start",      "2026-05-30", "24 wk out"],
                      ["Mid phase start", "2026-07-25", "16 wk out"],
                      ["Late phase start","2026-09-19", "8 wk out"],
                      ["Refeeds begin",   "2026-07-25", "16 wk out"],
                      ["Peak week start", "2026-11-07", "1 wk out"],
                      ["Show day",        anchorDate,   "0"],
                    ].map(r => (
                      <tr key={r[0]}>
                        <td style={{fontSize: 11.5}}>{r[0]}</td>
                        <td className="num" style={{textAlign: "right", width: 110}}>{r[1]}</td>
                        <td className="num dim" style={{textAlign: "right", width: 80, fontSize: 10}}>{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {/* ── ANNUAL CYCLE ── */}
          {tab === "annual" && draft.annual && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Drag the month boundaries or type directly. Total must sum to 12 months.
              </div>
              {/* visual month bar */}
              <div style={{display: "flex", height: 32, borderRadius: 7, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 6}}>
                {[
                  { l: "LEAN BULK",   m: 4, c: "var(--acc-train)" },
                  { l: "MAINT",       m: 2, c: "var(--acc-recov)" },
                  { l: "CONTEST PREP",m: 4, c: "var(--neg)" },
                  { l: "PEAK",        m: 1, c: "var(--acc-goals)" },
                  { l: "REVERSE",     m: 1, c: "var(--acc-coach)" },
                ].map(seg => (
                  <div key={seg.l} style={{
                    flex: seg.m, background: `color-mix(in srgb, ${seg.c} 28%, var(--surface))`,
                    borderRight: "1px solid var(--border)",
                    display: "grid", placeItems: "center",
                    fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600, color: seg.c,
                    letterSpacing: "0.04em",
                  }}>{seg.l}</div>
                ))}
              </div>
              <div style={{display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2, marginBottom: 16}}>
                {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                  <span key={i} className="dim mono" style={{fontSize: 9, textAlign: "center"}}>{m}</span>
                ))}
              </div>
              <Card className="card-tight" style={{padding: 0}}>
                <table className="tbl" style={{margin: 0}}>
                  <thead><tr><th style={{paddingLeft: 12, width: 100}}>Months</th><th>Phase</th><th>Focus</th><th style={{width: 40}}></th></tr></thead>
                  <tbody>
                    {draft.annual.map((a, i) => (
                      <tr key={i}>
                        <td style={{paddingLeft: 12}}>
                          <input value={a.months} onChange={e => upd(d => d.annual[i].months = e.target.value)}
                            style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5, fontFamily: "var(--font-mono)"}}/>
                        </td>
                        <td>
                          <select value={a.phase} onChange={e => upd(d => d.annual[i].phase = e.target.value)}
                            style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, padding: "0 6px", fontFamily: "var(--font-mono)"}}>
                            {["LEAN_BULK","MAINTENANCE","CONTEST_PREP","PEAK WEEK + SHOW","REVERSE_DIET","FAT_LOSS","RECOMP","MINI_CUT"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td>
                          <input value={a.focus} onChange={e => upd(d => d.annual[i].focus = e.target.value)}
                            style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}/>
                        </td>
                        <td><button className="icon-btn"><Icon name="trash" className="ic ic-sm"/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <div style={{display: "flex", gap: 6, marginTop: 10, alignItems: "center"}}>
                <button className="btn btn-sm"><Icon name="plus" className="ic ic-sm"/>Add block</button>
                <button className="btn btn-ghost btn-sm">Reset to default cycle</button>
                <div className="spacer"/>
                <span className="dim mono" style={{fontSize: 10.5}}>12 of 12 months allocated</span>
              </div>
              <div className="divider"/>
              <div className="col-gap" style={{gap: 6}}>
                <PEToggle on={draft.autoTransitions} onChange={v => upd(d => d.autoTransitions = v)} label="Auto-transition between blocks" sub="no confirmation needed at month boundaries"/>
                <PEToggle on={draft.coachOverride}   onChange={v => upd(d => d.coachOverride = v)}   label="Coach can override transitions" sub="Anders Lindqvist has write access to this cycle"/>
              </div>
            </>
          )}

          {/* ── PER-PHASE OVERRIDES (annual) ── */}
          {tab === "overrides" && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Each block in your annual cycle inherits that phase's defaults. Override them here — changes apply only inside this cycle.
              </div>
              <div className="col-gap" style={{gap: 10}}>
                {[
                  { phase: "LEAN_BULK",    color: "var(--acc-train)", fields: [["Surplus", "250", "kcal"], ["Protein", "1.9", "g/kg"], ["Rate cap", "0.4", "% BW/mo"]] },
                  { phase: "MAINTENANCE",  color: "var(--acc-recov)", fields: [["Target", "TDEE", "±100"], ["Protein", "1.8", "g/kg"]] },
                  { phase: "CONTEST_PREP", color: "var(--neg)",       fields: [["Start deficit", "-350", "kcal"], ["Peak deficit", "-800", "kcal"], ["Protein", "2.8", "g/kg"]] },
                  { phase: "REVERSE_DIET", color: "var(--acc-coach)", fields: [["Weekly increase", "120", "kcal"], ["Max weeks", "14", "wk"]] },
                ].map(b => (
                  <Card key={b.phase} className="card-tight" style={{padding: 12, borderLeft: `2px solid ${b.color}`}}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10}}>
                      <span className="mono" style={{fontSize: 11.5, fontWeight: 600}}>{b.phase}</span>
                      <Pill style={{fontSize: 9}}>overridden</Pill>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: `repeat(${b.fields.length}, 1fr)`, gap: 10}}>
                      {b.fields.map(([l, v, u]) => (
                        <div key={l}>
                          <div className="eyebrow" style={{marginBottom: 4}}>{l}</div>
                          <div style={{position: "relative"}}>
                            <input defaultValue={v} onChange={() => setDirty(true)}
                              style={{width: "100%", height: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 32px 0 8px", fontSize: 11.5, fontFamily: "var(--font-mono)"}}/>
                            <span className="dim mono" style={{position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 9.5}}>{u}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* ── GUARDS ── */}
          {tab === "guards" && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Guards are the deterministic rules that trigger auto-adjustments. Toggle off any you want to manage yourself, or shift the thresholds.
              </div>
              <div className="col-gap" style={{gap: 8}}>
                {(draft.guards || []).map((g, i) => {
                  const m = g.match(/([\d.]+)/);
                  return (
                    <Card key={i} className="card-tight" style={{padding: 12}}>
                      <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: m ? 10 : 0}}>
                        <span className="mono" style={{fontSize: 11.5, flex: 1, color: "var(--fg-muted)"}}>{g}</span>
                        <div style={{width: 30, height: 17, borderRadius: 999, background: "var(--pos)", padding: 2, flexShrink: 0}}>
                          <div style={{width: 13, height: 13, borderRadius: 999, background: "var(--bg)", marginLeft: 13}}/>
                        </div>
                      </div>
                      {m && (
                        <div style={{display: "flex", alignItems: "center", gap: 10}}>
                          <span className="eyebrow" style={{width: 70}}>Threshold</span>
                          <input type="range" min="0" max={Number(m[1]) * 3 || 30} step="0.1" defaultValue={m[1]}
                            onChange={() => setDirty(true)} style={{flex: 1, accentColor: base.color}}/>
                          <span className="num" style={{width: 48, textAlign: "right", fontSize: 12}}>{m[1]}</span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
              <div style={{display: "flex", gap: 6, marginTop: 12}}>
                <button className="btn btn-sm"><Icon name="plus" className="ic ic-sm"/>Add custom guard</button>
                <button className="btn btn-ghost btn-sm">Restore defaults</button>
              </div>
            </>
          )}

          {/* ── EXITS ── */}
          {tab === "exits" && (
            <>
              <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
                Conditions that end this phase. All are OR-combined — the first one met triggers a transition prompt.
              </div>
              <div className="col-gap" style={{gap: 6}}>
                {(draft.exits || []).map((e, i) => (
                  <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                    <Icon name="arrow_right" className="ic ic-sm" style={{color: base.color}}/>
                    <input defaultValue={e} onChange={() => setDirty(true)}
                      style={{flex: 1, height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5, fontFamily: "var(--font-mono)"}}/>
                    <button className="icon-btn"><Icon name="trash" className="ic ic-sm"/></button>
                  </div>
                ))}
              </div>
              <button className="btn btn-sm" style={{marginTop: 10}}><Icon name="plus" className="ic ic-sm"/>Add exit condition</button>
            </>
          )}
        </div>

        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <div className="spacer"/>
          <button className="btn"><Icon name="copy" className="ic ic-sm"/>Save as my template</button>
          <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Apply to my plan</button>
        </div>
      </div>
    </div>
  );
};

// ── Template library ──────────────────────────────────────
window.PhaseTemplateLibrary = ({ onClose }) => {
  const mine = [
    { id: "t1", name: "My 2026 contest cycle", base: "Expert BB Annual", edited: "May 12", uses: 1, note: "Show Nov 14 · 5mo bulk · earlier reverse" },
    { id: "t2", name: "Aggressive mini-cut",   base: "Fat Loss",         edited: "Apr 2",  uses: 3, note: "-900 kcal · 6wk cap · 3.0 g/kg protein" },
    { id: "t3", name: "Off-season lean bulk",  base: "Lean Bulk",        edited: "Jan 18", uses: 2, note: "+250 kcal · BF guard at 1.5%" },
  ];
  const shared = [
    { id: "s1", name: "Anders · Powerbuilding block", author: "Anders Lindqvist", rating: 4.9, uses: 42 },
    { id: "s2", name: "Jana · Recomp for lifters",    author: "Jana Bauer",       rating: 4.8, uses: 88 },
    { id: "s3", name: "IFBB standard 24wk prep",       author: "LumeOS",           rating: 4.7, uses: 310 },
  ];
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 720, maxHeight: "88vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-goals) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-goals) 38%, var(--border))", color: "var(--acc-goals)", display: "grid", placeItems: "center"}}><Icon name="layers" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Phase templates</div>
            <div className="dim" style={{fontSize: 11}}>Your saved configurations and shared plans</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          <div className="eyebrow" style={{marginBottom: 8}}>My templates</div>
          <div className="col-gap" style={{gap: 6, marginBottom: 18}}>
            {mine.map(t => (
              <Card key={t.id} className="card-tight" style={{padding: 12, cursor: "pointer"}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                  <span style={{fontSize: 13, fontWeight: 600}}>{t.name}</span>
                  <Pill style={{fontSize: 9}}>from {t.base}</Pill>
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>edited {t.edited} · used {t.uses}×</span>
                </div>
                <div className="muted mono" style={{fontSize: 11}}>{t.note}</div>
                <div style={{display: "flex", gap: 6, marginTop: 8}}>
                  <button className="btn btn-primary btn-sm">Apply</button>
                  <button className="btn btn-ghost btn-sm">Edit</button>
                  <button className="btn btn-ghost btn-sm">Duplicate</button>
                  <button className="btn btn-ghost btn-sm">Share with coach</button>
                </div>
              </Card>
            ))}
          </div>
          <div className="eyebrow" style={{marginBottom: 8}}>Shared with you</div>
          <div className="col-gap" style={{gap: 6}}>
            {shared.map(t => (
              <div key={t.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 12.5, fontWeight: 500}}>{t.name}</div>
                  <div className="dim mono" style={{fontSize: 10}}>{t.author} · {t.rating} ★ · {t.uses} uses</div>
                </div>
                <button className="btn btn-sm">Preview</button>
                <button className="btn btn-sm">Import</button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>New template from scratch</button>
        </div>
      </div>
    </div>
  );
};
