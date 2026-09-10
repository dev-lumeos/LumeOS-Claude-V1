// Supplements module — modals, drawers, calendar view, expanded interactions

// ── Generic Modal wrapper ─────────────────────────────────────
const SuppModal = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 540 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && (
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: `color-mix(in oklch, ${accent || "var(--acc-suppl)"} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent || "var(--acc-suppl)"} 35%, transparent)`,
            color: accent || "var(--acc-suppl)", display: "grid", placeItems: "center"
          }}>
            <Icon name={eyebrow} className="ic" />
          </div>
        )}
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize: 11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic" /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

const FormField = ({ label, sub, children }) => (
  <div style={{marginBottom: 14}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5}}>
      <label className="eyebrow">{label}</label>
      {sub && <span className="dim" style={{fontSize: 10}}>{sub}</span>}
    </div>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", suffix }) => (
  <div style={{position: "relative"}}>
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", height: 30,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 6, padding: "0 10px",
        fontSize: 12, outline: "none"
      }}
    />
    {suffix && <span className="dim mono" style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>{suffix}</span>}
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    style={{
      width: "100%", height: 30,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 6, padding: "0 10px",
      fontSize: 12, outline: "none", cursor: "pointer"
    }}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const DayPicker = ({ days, onChange }) => (
  <div style={{display: "flex", gap: 4}}>
    {DAY_LETTERS.map((l, i) => (
      <button
        key={i}
        onClick={() => onChange(days.map((d, j) => j === i ? (d ? 0 : 1) : d))}
        style={{
          width: 32, height: 32, borderRadius: 5,
          background: days[i] ? "color-mix(in oklch, var(--acc-suppl) 22%, transparent)" : "var(--surface-2)",
          border: days[i] ? "1px solid color-mix(in oklch, var(--acc-suppl) 40%, var(--border))" : "1px solid var(--border)",
          color: days[i] ? "var(--acc-suppl)" : "var(--fg-muted)",
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
          cursor: "pointer"
        }}
      >{l}</button>
    ))}
    <button
      onClick={() => onChange([1,1,1,1,1,1,1])}
      className="btn btn-ghost"
      style={{height: 32, fontSize: 11, marginLeft: 6}}
    >Daily</button>
    <button
      onClick={() => onChange([1,1,1,0,1,1,0])}
      className="btn btn-ghost"
      style={{height: 32, fontSize: 11}}
    >Mon-Wed-Fri-Sat</button>
  </div>
);

// ── Add Supplement Modal ──────────────────────────────────────
const AddSupplementModal = ({ onClose, prefill, onSave }) => {
  const [form, setForm] = useState(prefill || {
    name: "", brand: "", dose: "", form: "Capsule", slot: "morning",
    days: [1,1,1,1,1,1,1], purpose: "", monthlyCost: 0,
  });
  const upd = (k, v) => setForm(f => ({...f, [k]: v}));
  return (
    <SuppModal
      title={prefill ? "Edit supplement" : "Add to stack"}
      subtitle={prefill ? "Update dosing or schedule" : "From database, custom, or barcode"}
      eyebrow="plus"
      onClose={onClose}
      width={580}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave?.(form); onClose(); }}>
          <Icon name="check" className="ic ic-sm" /> {prefill ? "Save changes" : "Add to stack"}
        </button>
      </>}
    >
      {!prefill && (
        <div style={{display: "flex", gap: 6, marginBottom: 14}}>
          <button className="btn"><Icon name="search" className="ic ic-sm" />Search database</button>
          <button className="btn"><Icon name="camera" className="ic ic-sm" />Scan barcode</button>
          <button className="btn"><Icon name="edit" className="ic ic-sm" />Custom entry</button>
        </div>
      )}
      <FormField label="Supplement name">
        <Input value={form.name} onChange={v => upd("name", v)} placeholder="e.g. Creatine Monohydrate" />
      </FormField>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
        <FormField label="Brand">
          <Input value={form.brand} onChange={v => upd("brand", v)} placeholder="e.g. Bulk Pure Series" />
        </FormField>
        <FormField label="Form">
          <Select value={form.form} onChange={v => upd("form", v)} options={["Capsule","Tablet","Powder","Softgel","Liquid","Sublingual"]} />
        </FormField>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
        <FormField label="Dose per serving">
          <Input value={form.dose} onChange={v => upd("dose", v)} placeholder="e.g. 5 g" />
        </FormField>
        <FormField label="Cost / month" sub="approx">
          <Input value={form.monthlyCost} onChange={v => upd("monthlyCost", parseFloat(v) || 0)} type="number" suffix="€" />
        </FormField>
      </div>
      <FormField label="Timing slot">
        <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
          {SLOTS.map(s => (
            <button
              key={s.id}
              onClick={() => upd("slot", s.id)}
              className={form.slot === s.id ? "btn btn-primary" : "btn"}
              style={{height: 26, fontSize: 11}}
            >{s.label} <span className="dim mono" style={{marginLeft: 4, fontSize: 10}}>{s.time}</span></button>
          ))}
        </div>
      </FormField>
      <FormField label="Days of week" sub={`${form.days.reduce((s,d) => s + d, 0)} of 7`}>
        <DayPicker days={form.days} onChange={d => upd("days", d)} />
      </FormField>
      <FormField label="Purpose tags" sub="comma-separated">
        <Input value={form.purpose} onChange={v => upd("purpose", v)} placeholder="e.g. Strength, Power, Hydration" />
      </FormField>
    </SuppModal>
  );
};

// ── Log Skip Modal ────────────────────────────────────────────
const LogSkipModal = ({ item, onClose, onSave }) => {
  const [reason, setReason] = useState("");
  const reasons = [
    "Ran out / refill needed",
    "Forgot",
    "Cheat day / off-protocol",
    "Skipped pre-workout meal",
    "Sick / not training",
    "Cycle off-week",
    "Side effect (note required)",
    "Custom…",
  ];
  return (
    <SuppModal
      title="Log skip"
      subtitle={`${item.name} · ${item.dose}`}
      eyebrow="x"
      accent="var(--warn)"
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={() => { onSave?.(reason); onClose(); }}><Icon name="check" className="ic ic-sm"/>Log skip</button>
      </>}
    >
      <FormField label="Reason">
        <div className="col-gap" style={{gap: 4}}>
          {reasons.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              style={{
                textAlign: "left", padding: "8px 10px", fontSize: 12,
                background: reason === r ? "color-mix(in oklch, var(--warn) 8%, var(--surface))" : "var(--surface)",
                border: `1px solid ${reason === r ? "color-mix(in oklch, var(--warn) 35%, var(--border))" : "var(--border)"}`,
                borderRadius: 6, cursor: "pointer", color: "var(--fg)"
              }}
            >
              {reason === r && <Icon name="check" className="ic ic-sm" style={{display: "inline", marginRight: 6, color: "var(--warn)"}} />}
              {r}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="Note (optional)">
        <Input value="" onChange={() => {}} placeholder="Add context…" />
      </FormField>
      <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5}}>
        Skips affect compliance & inform Buddy's pattern detection. Coach with permission will see this entry.
      </div>
    </SuppModal>
  );
};

// ── Product Detail Drawer ─────────────────────────────────────
const PRODUCT_DETAILS = {
  "Creatine Monohydrate": {
    actives: [{ name: "Creatine Monohydrate", amount: "5,000 mg", pct: 100 }],
    fillers: ["None"],
    allergens: ["None declared"],
    thirdParty: ["Informed Sport", "Heavy metals tested"],
    sourcing: "Creapure® · AlzChem Germany",
    sku: "BLK-CRE-1KG-001",
    upc: "5060604180024",
    coachRec: "Anders Lindqvist · Training",
  },
  "Whey Protein Isolate": {
    actives: [{ name: "Whey Protein Isolate", amount: "27 g", pct: 90 },{ name: "BCAA (natural)", amount: "5.4 g", pct: 18 },{ name: "Glutamine (natural)", amount: "4.8 g", pct: 16 }],
    fillers: ["Sunflower lecithin", "Natural vanilla flavor", "Stevia"],
    allergens: ["Milk", "Lactose < 1%"],
    thirdParty: ["NSF Certified for Sport", "Informed Choice"],
    sourcing: "Cross-flow microfiltration · grass-fed (NZ)",
    sku: "ESN-WPI-2KG-VAN",
    upc: "4260326064019",
    coachRec: "Jana Bauer · Nutrition",
  },
  "Vitamin D3 (+K2)": {
    actives: [{ name: "Cholecalciferol (D3)", amount: "4000 IU (100 µg)", pct: 100 },{ name: "Menaquinone-7 (K2)", amount: "200 µg", pct: 100 }],
    fillers: ["MCT oil", "Olive oil", "Gelatin (softgel)"],
    allergens: ["None"],
    thirdParty: ["GMP certified", "Heavy metals tested"],
    sourcing: "Pure Encapsulations · CH",
    sku: "PE-D3K2-90",
    upc: "766298017556",
    coachRec: "Dr. M. Kessler · Medical",
  },
};

const ProductDetailDrawer = ({ name, onClose, onAdd, inStack }) => {
  const item = SUPPLEMENT_DB.find(s => s.name === name) || {};
  const detail = PRODUCT_DETAILS[name] || {
    actives: [{ name, amount: item.doseTypical || "—", pct: 100 }],
    fillers: ["Data not yet sourced — manufacturer info pending"],
    allergens: ["Not yet listed"],
    thirdParty: [],
    sourcing: "—",
    sku: "—",
    upc: "—",
    coachRec: null,
  };
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 720, maxHeight: "88vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "color-mix(in oklch, var(--acc-suppl) 18%, transparent)",
            border: "1px solid color-mix(in oklch, var(--acc-suppl) 35%, transparent)",
            color: "var(--acc-suppl)", display: "grid", placeItems: "center"
          }}>
            <Icon name="supplements" className="ic" />
          </div>
          <div style={{flex: 1}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 2}}>
              <span style={{fontSize: 15, fontWeight: 600}}>{name}</span>
              <Pill>{item.category}</Pill>
              <Pill style={{borderColor: `color-mix(in oklch, ${EVIDENCE_PALETTE[item.evidence]} 40%, var(--border))`, color: EVIDENCE_PALETTE[item.evidence], background: `color-mix(in oklch, ${EVIDENCE_PALETTE[item.evidence]} 8%, transparent)`}}>Evidence {item.evidence}</Pill>
              {inStack && <Pill variant="pos"><Icon name="check" className="ic ic-sm"/>In stack</Pill>}
            </div>
            <div className="muted" style={{fontSize: 11.5}}>{item.purpose}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 18}}>
          {detail.coachRec && (
            <div style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "color-mix(in oklch, var(--acc-coach) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-coach) 25%, var(--border))", borderRadius: 6, marginBottom: 14}}>
              <div style={{width: 24, height: 24, borderRadius: 5, background: "var(--acc-coach)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600}}>C</div>
              <div style={{flex: 1, fontSize: 12, lineHeight: 1.5}}>
                <span style={{fontWeight: 500}}>Recommended by {detail.coachRec.split(" · ")[0]}</span>
                <span className="dim"> — your {detail.coachRec.split(" · ")[1]?.toLowerCase()} coach</span>
              </div>
              <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}>See note</button>
            </div>
          )}
          <div className="eyebrow" style={{marginBottom: 8}}>Active ingredients</div>
          <table className="tbl" style={{marginBottom: 16}}>
            <thead>
              <tr><th>Ingredient</th><th style={{width: 120, textAlign: "right"}}>Per serving</th><th style={{width: 80, textAlign: "right"}}>% DV*</th></tr>
            </thead>
            <tbody>
              {detail.actives.map((a, i) => (
                <tr key={i}>
                  <td style={{fontSize: 12}}>{a.name}</td>
                  <td className="num" style={{textAlign: "right"}}>{a.amount}</td>
                  <td className="num muted" style={{textAlign: "right"}}>{a.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid g-cols-2" style={{gap: 14, marginBottom: 16}}>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 6}}>Other ingredients</div>
              <div style={{fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
                {detail.fillers.join(" · ")}
              </div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 6}}>Allergens</div>
              <div style={{fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
                {detail.allergens.join(" · ")}
              </div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 6}}>3rd-party testing</div>
              <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                {detail.thirdParty.length > 0 ? detail.thirdParty.map(t => <Pill key={t} variant="pos"><Icon name="check" className="ic ic-sm"/>{t}</Pill>) : <span className="dim" style={{fontSize: 11}}>None declared</span>}
              </div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 6}}>Sourcing · SKU</div>
              <div style={{fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
                {detail.sourcing}<br/>
                <span className="mono dim" style={{fontSize: 10}}>{detail.sku} · UPC {detail.upc}</span>
              </div>
            </Card>
          </div>
          <div className="eyebrow" style={{marginBottom: 8}}>Notes</div>
          <div style={{fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 16}}>{item.notes}</div>
          <div style={{padding: 12, background: "color-mix(in oklch, var(--acc-mkt) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-mkt) 22%, var(--border))", borderRadius: 6}}>
            <div style={{display: "flex", alignItems: "center", gap: 10}}>
              <Icon name="marketplace" className="ic" style={{color: "var(--acc-mkt)"}}/>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12.5, fontWeight: 500, marginBottom: 2}}>Available in Marketplace</div>
                <div className="muted" style={{fontSize: 11}}>3 verified suppliers · price range €{((item.evidence === "A" ? 8 : 14) * 0.85).toFixed(2)}–€{((item.evidence === "A" ? 8 : 14) * 1.4).toFixed(2)} / month</div>
              </div>
              <button className="btn">Open in Marketplace →</button>
            </div>
          </div>
        </div>
        <div className="modal-f">
          <div className="dim" style={{fontSize: 10, marginRight: "auto"}}>* % Daily Value</div>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {!inStack && <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" className="ic ic-sm"/>Add to stack</button>}
          {inStack && <button className="btn"><Icon name="edit" className="ic ic-sm"/>Edit in stack</button>}
        </div>
      </div>
    </div>
  );
};

// ── Calendar View ─────────────────────────────────────────────
const CalendarView = () => {
  const month = 4; // May (0-indexed = 4)
  const year = 2026;
  const today = 16;
  // first weekday Mon=0
  const firstDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // generate compliance per day
  const dayData = [];
  let seed = 11;
  for (let d = 1; d <= daysInMonth; d++) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    if (d > today) dayData.push({ day: d, status: "future", taken: 0, planned: 0 });
    else if (d === today) dayData.push({ day: d, status: "today", taken: 3, planned: 8 });
    else {
      seed = (seed * 9301 + 49297) % 233280;
      const r2 = seed / 233280;
      const planned = 7 + Math.floor(r2 * 3);
      const taken = r > 0.08 ? planned - Math.floor(r2 * 2) : Math.floor(planned * 0.5);
      dayData.push({ day: d, status: "past", taken, planned });
    }
  }
  // pad with empty cells at start
  const cells = Array(firstDay).fill(null).concat(dayData);
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <Card title="Compliance · May 2026" sub={`${dayData.filter(d => d.status === "past" && d.taken === d.planned).length} perfect days · ${dayData.filter(d => d.status === "past" && d.taken < d.planned).length} with skips`}
      actions={<>
        <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}><Icon name="chevron_left" className="ic ic-sm"/></button>
        <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}>May 2026</button>
        <button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}><Icon name="chevron_right" className="ic ic-sm"/></button>
      </>}
    >
      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6}}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} style={{textAlign: "center", fontSize: 10, color: "var(--fg-dim)", fontFamily: "var(--font-mono)", padding: 6}}>{d}</div>
        ))}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4}}>
        {cells.map((c, i) => {
          if (!c) return <div key={i} style={{aspectRatio: "1.2", background: "transparent"}}/>;
          const pct = c.planned > 0 ? c.taken / c.planned : 0;
          const isToday = c.status === "today";
          const isFuture = c.status === "future";
          return (
            <div key={i} style={{
              aspectRatio: "1.2",
              background: isFuture ? "var(--surface)" :
                          isToday ? "color-mix(in oklch, var(--acc-suppl) 8%, var(--surface))" :
                          pct === 1 ? "color-mix(in oklch, var(--pos) 8%, var(--surface))" :
                          pct >= 0.8 ? "color-mix(in oklch, var(--pos) 4%, var(--surface))" :
                          pct >= 0.5 ? "color-mix(in oklch, var(--warn) 6%, var(--surface))" :
                          "color-mix(in oklch, var(--neg) 6%, var(--surface))",
              border: isToday ? "1px solid var(--acc-suppl)" : "1px solid var(--border)",
              borderRadius: 5,
              padding: 6,
              display: "flex", flexDirection: "column",
              cursor: isFuture ? "default" : "pointer",
              opacity: isFuture ? 0.55 : 1,
            }}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                <span className="num" style={{fontSize: 11, fontWeight: isToday ? 600 : 500, color: isToday ? "var(--acc-suppl)" : isFuture ? "var(--fg-dim)" : "var(--fg)"}}>{c.day}</span>
                {!isFuture && c.planned > 0 && (
                  <span className="num" style={{fontSize: 9, color: pct === 1 ? "var(--pos)" : pct >= 0.8 ? "var(--fg-muted)" : pct >= 0.5 ? "var(--warn)" : "var(--neg)"}}>
                    {c.taken}/{c.planned}
                  </span>
                )}
              </div>
              {!isFuture && c.planned > 0 && (
                <div style={{marginTop: "auto", display: "flex", gap: 1.5}}>
                  {Array.from({length: Math.min(c.planned, 10)}).map((_, j) => (
                    <div key={j} style={{
                      flex: 1, height: 3, borderRadius: 1,
                      background: j < c.taken ? (pct === 1 ? "var(--pos)" : pct >= 0.5 ? "var(--warn)" : "var(--neg)") : "var(--surface-2)",
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{display: "flex", gap: 12, marginTop: 14, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "color-mix(in oklch, var(--pos) 30%, var(--surface))", borderRadius: 2, border: "1px solid var(--border)"}}/>100% adherence</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "color-mix(in oklch, var(--warn) 30%, var(--surface))", borderRadius: 2, border: "1px solid var(--border)"}}/>50–99%</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "color-mix(in oklch, var(--neg) 30%, var(--surface))", borderRadius: 2, border: "1px solid var(--border)"}}/>{"<50%"}</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--surface)", borderRadius: 2, border: "1px solid var(--acc-suppl)"}}/>Today</span>
      </div>
    </Card>
  );
};

// ── Interaction Detail Drawer ─────────────────────────────────
const InteractionDetail = ({ interaction, onClose }) => (
  <SuppModal
    title={interaction.title}
    subtitle={interaction.items.join(" + ")}
    eyebrow="sparkles"
    accent={interaction.severity === "moderate" ? "var(--warn)" : interaction.severity === "low" ? "var(--acc-recov)" : "var(--pos)"}
    onClose={onClose}
    width={620}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
      <button className="btn"><Icon name="copy" className="ic ic-sm"/>Copy to coach</button>
    </>}
  >
    <div style={{display: "flex", gap: 6, marginBottom: 12}}>
      <Pill variant={interaction.severity === "moderate" ? "warn" : interaction.severity === "low" ? "" : "pos"}>
        {interaction.severity === "moderate" ? "Moderate" : interaction.severity === "low" ? "Low" : "Synergy"}
      </Pill>
      {interaction.items.map(it => <Pill key={it}>{it}</Pill>)}
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Mechanism</div>
    <div style={{fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 16}}>{interaction.body}</div>
    <div className="eyebrow" style={{marginBottom: 6}}>Affects</div>
    <div style={{fontSize: 12, marginBottom: 16}}>{interaction.affects}</div>
    <div className="eyebrow" style={{marginBottom: 6}}>Recommendation</div>
    <div style={{fontSize: 12, marginBottom: 16}}>{interaction.recommendation}</div>
    <div className="eyebrow" style={{marginBottom: 8}}>References</div>
    <div className="col-gap" style={{gap: 4}}>
      <div className="card-tight" style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11}}>
        <span className="mono dim" style={{fontSize: 10}}>PMID 28640783</span> · Examine.com — Caffeine and adaptogens interaction matrix · 2023
      </div>
      <div className="card-tight" style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11}}>
        <span className="mono dim" style={{fontSize: 10}}>DOI 10.3390/nu14163320</span> · Adaptogenic herbs in sport performance · 2022 review
      </div>
      <div className="card-tight" style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11}}>
        <span className="mono dim" style={{fontSize: 10}}>internal</span> · Buddy pattern detection · last scan May 14
      </div>
    </div>
  </SuppModal>
);

// ── Reorder Modal ─────────────────────────────────────────────
const ReorderModal = ({ items, onClose }) => {
  const total = items.reduce((s, i) => s + i.monthlyCost * 2.5, 0); // ~3 months supply
  return (
    <SuppModal
      title="Order refills"
      subtitle={`${items.length} items · 3 months supply each`}
      eyebrow="download"
      accent="var(--acc-mkt)"
      onClose={onClose}
      width={580}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn"><Icon name="copy" className="ic ic-sm"/>Save list</button>
        <button className="btn btn-primary"><Icon name="marketplace" className="ic ic-sm"/>Open Marketplace</button>
      </>}
    >
      <div className="col-gap" style={{gap: 6, marginBottom: 14}}>
        {items.map(i => (
          <div key={i.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <input type="checkbox" defaultChecked style={{accentColor: "var(--acc-suppl)"}} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 12.5, fontWeight: 500}}>{i.name}</div>
              <div className="dim" style={{fontSize: 10.5}}>{i.brand} · {i.servingsLeft} servings left · due {i.refill}</div>
            </div>
            <select className="btn" style={{height: 26, fontSize: 11, padding: "0 8px"}}>
              <option>3 months</option><option>6 months</option><option>1 month</option>
            </select>
            <span className="num" style={{width: 60, textAlign: "right"}}>€{(i.monthlyCost * 2.5).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="divider" />
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13}}>
        <span className="dim">Estimated total</span>
        <span className="num" style={{fontSize: 18, fontWeight: 500}}>€{total.toFixed(2)}</span>
      </div>
    </SuppModal>
  );
};

// ── Generic stub modals for Extended actions ──────────────────
const AddLabResultModal = ({ onClose }) => (
  <SuppModal title="Add lab result" subtitle="Manual entry · upload PDF · Medical sync" eyebrow="medical" accent="var(--acc-medic)" onClose={onClose} width={580}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save panel</button></>}>
    <div style={{display: "flex", gap: 6, marginBottom: 14}}>
      <button className="btn"><Icon name="camera" className="ic ic-sm"/>Upload PDF</button>
      <button className="btn"><Icon name="copy" className="ic ic-sm"/>Paste values</button>
      <button className="btn"><Icon name="edit" className="ic ic-sm"/>Manual</button>
    </div>
    <FormField label="Panel date"><Input value="2026-05-25" onChange={()=>{}} type="date"/></FormField>
    <FormField label="Lab"><Select value="MVZ Lab Berlin" onChange={()=>{}} options={["MVZ Lab Berlin","Sonic Health","Synlab","Other…"]}/></FormField>
    <div className="eyebrow" style={{margin: "8px 0 6px"}}>Markers (12 to enter)</div>
    <div className="dim" style={{fontSize: 11, padding: 10, background: "var(--surface)", borderRadius: 6, lineHeight: 1.5}}>
      PDF parser will pre-fill values. Out-of-range markers route to Medical for follow-up. Markers tied to active compounds raise inline alerts in Extended.
    </div>
  </SuppModal>
);

const AddSideEffectModal = ({ onClose }) => {
  const [sev, setSev] = useState(1);
  return (
    <SuppModal title="Log side effect" subtitle="Symptom or response · attaches to compound" eyebrow="alert" accent="var(--warn)" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn"><Icon name="check" className="ic ic-sm"/>Log</button></>}>
      <FormField label="Compound">
        <Select value="MK-677" onChange={()=>{}} options={EXTENDED_STACK.map(c => c.name)} />
      </FormField>
      <FormField label="Severity">
        <div style={{display: "flex", gap: 4}}>
          {[0,1,2,3].map(s => (
            <button key={s} onClick={() => setSev(s)} className={sev === s ? "btn btn-primary" : "btn"} style={{height: 30, fontSize: 11, flex: 1}}>
              {["None","Mild","Moderate","Severe"][s]}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="Notes">
        <Input value="" onChange={()=>{}} placeholder="What did you notice?"/>
      </FormField>
      <FormField label="Bloodwork concern?">
        <div style={{display: "flex", gap: 6}}>
          <button className="btn">No</button>
          <button className="btn">Yes — flag for next panel</button>
        </div>
      </FormField>
    </SuppModal>
  );
};

const AddCompoundModal = ({ onClose }) => (
  <SuppModal title="Add extended compound" subtitle="Prescription required · physician info logged" eyebrow="plus" accent="var(--acc-medic)" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save</button></>}>
    <div style={{padding: 12, background: "color-mix(in oklch, var(--acc-medic) 6%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))", borderRadius: 6, marginBottom: 14, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      Compounds in Extended require physician name and (optional) prescription reference. LumeOS tracks; it does not prescribe.
    </div>
    <FormField label="Compound name"><Input value="" onChange={()=>{}} placeholder="e.g. Testosterone Cypionate"/></FormField>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
      <FormField label="Category"><Select value="Hormone" onChange={()=>{}} options={["Hormone","Peptide","SARM","GH secretagogue","Estrogen control","Other Rx"]}/></FormField>
      <FormField label="Dose"><Input value="" onChange={()=>{}} placeholder="150 mg"/></FormField>
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
      <FormField label="Schedule"><Input value="" onChange={()=>{}} placeholder="Mon + Thu IM"/></FormField>
      <FormField label="Cycle type"><Select value="continuous" onChange={()=>{}} options={["continuous","cycled","as_needed"]}/></FormField>
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
      <FormField label="Physician (required)"><Input value="" onChange={()=>{}} placeholder="Dr. Name · Practice"/></FormField>
      <FormField label="Prescription ref"><Input value="" onChange={()=>{}} placeholder="RX-XXXXX"/></FormField>
    </div>
  </SuppModal>
);

const PlanCycleModal = ({ onClose }) => (
  <SuppModal title="Plan next cycle" subtitle="Schedule on/off weeks, link to training block" eyebrow="calendar" onClose={onClose} width={580}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save plan</button></>}>
    <FormField label="Compound"><Select value="MK-677" onChange={()=>{}} options={EXTENDED_STACK.filter(c => c.cycleType === "cycled").map(c => c.name)}/></FormField>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
      <FormField label="On weeks"><Input value="12" onChange={()=>{}} suffix="wk" type="number"/></FormField>
      <FormField label="Off weeks"><Input value="8" onChange={()=>{}} suffix="wk" type="number"/></FormField>
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
      <FormField label="Start date"><Input value="2026-08-01" onChange={()=>{}} type="date"/></FormField>
      <FormField label="Link to training block"><Select value="Block 5 · Hypertrophy" onChange={()=>{}} options={["Block 5 · Hypertrophy","Block 6 · Strength","None"]}/></FormField>
    </div>
    <FormField label="Lab milestones">
      <div className="col-gap" style={{gap: 4}}>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
          <Icon name="check" className="ic ic-sm" style={{display: "inline", color: "var(--pos)", marginRight: 6}}/>Week 4 · IGF-1 + fasting glucose
        </div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
          <Icon name="check" className="ic ic-sm" style={{display: "inline", color: "var(--pos)", marginRight: 6}}/>Week 8 · Full panel (T, E2, lipids, CBC)
        </div>
        <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
          <Icon name="check" className="ic ic-sm" style={{display: "inline", color: "var(--pos)", marginRight: 6}}/>Week 12 · End-of-cycle panel
        </div>
      </div>
    </FormField>
  </SuppModal>
);

const PermissionsModal = ({ onClose }) => {
  const coaches = [
    { name: "Dr. M. Kessler", role: "Medical", visibility: "full" },
    { name: "Jana Bauer",     role: "Nutrition", visibility: "metabolic" },
    { name: "Anders Lindqvist", role: "Training", visibility: "hidden" },
    { name: "Buddy (AI)",     role: "AI", visibility: "aggregate" },
  ];
  return (
    <SuppModal title="Edit Extended permissions" subtitle="Per-coach, per-compound visibility" eyebrow="shield" onClose={onClose} width={680}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save</button></>}>
      <div className="dim" style={{fontSize: 11, marginBottom: 14, lineHeight: 1.5}}>Defaults are restrictive. Granting "full" exposes labs, side-effect log, and audit trail. Always reversible — coach is notified on change.</div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Coach</th>
            <th style={{width: 90}}>Role</th>
            <th style={{width: 110}}>Compounds</th>
            <th style={{width: 110}}>Labs</th>
            <th style={{width: 110}}>Side effects</th>
          </tr>
        </thead>
        <tbody>
          {coaches.map(c => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td className="muted">{c.role}</td>
              <td><Select value={c.visibility === "full" ? "all" : c.visibility === "metabolic" ? "MK-677" : c.visibility === "aggregate" ? "aggregate" : "none"} onChange={()=>{}} options={["all","MK-677","aggregate","none"]}/></td>
              <td><Select value={c.visibility === "full" ? "all" : c.visibility === "metabolic" ? "glucose+IGF" : "none"} onChange={()=>{}} options={["all","glucose+IGF","none"]}/></td>
              <td><Select value={c.visibility === "full" ? "all" : "none"} onChange={()=>{}} options={["all","compound-specific","none"]}/></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider"/>
      <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
        <span style={{color: "var(--fg)"}}>Audit log:</span> last permission change Apr 23 — added Jana Bauer to MK-677 visibility. <a className="mono" style={{color: "var(--acc-coach)"}}>view full log</a>
      </div>
    </SuppModal>
  );
};

const LogDoseModal = ({ compound, onClose }) => (
  <SuppModal title={`Log dose · ${compound?.name || "—"}`} subtitle="Timestamp + optional notes" eyebrow="check" accent="var(--pos)" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Log dose</button></>}>
    <FormField label="Time"><Input value="07:42" onChange={()=>{}} type="time"/></FormField>
    <FormField label="Dose"><Input value={compound?.dose || "—"} onChange={()=>{}}/></FormField>
    <FormField label="Site (injectable only)">
      <Select value="Right glute" onChange={()=>{}} options={["Right glute","Left glute","Right quad","Left quad","SubQ abdomen","SubQ shoulder","Sublingual","Oral"]}/>
    </FormField>
    <FormField label="Note"><Input value="" onChange={()=>{}} placeholder="Optional"/></FormField>
  </SuppModal>
);

Object.assign(window, {
  AddSupplementModal, LogSkipModal, ProductDetailDrawer, CalendarView,
  InteractionDetail, ReorderModal, AddLabResultModal, AddSideEffectModal,
  AddCompoundModal, PlanCycleModal, PermissionsModal, LogDoseModal,
  SuppModal, FormField, Input, Select, DayPicker,
});
