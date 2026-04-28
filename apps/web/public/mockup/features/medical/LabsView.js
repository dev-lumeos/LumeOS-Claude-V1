// features/medical/LabsView.js
// Mirrors: src/features/medical/components/LabsView.tsx
window.Medical_LabsView = function() {
  const labs = [
    {name:'Testosteron', val:'18.4 nmol/L', ref:'9.9-27.8',  status:'✅', note:'Normbereich'},
    {name:'Vitamin D',   val:'42 ng/mL',    ref:'30-60',      status:'✅', note:'Gut — weiter supplementieren'},
    {name:'Ferritin',    val:'78 µg/L',     ref:'30-400',     status:'✅', note:'Normbereich'},
    {name:'TSH',         val:'1.8 mU/L',    ref:'0.5-4.5',    status:'✅', note:'Schilddrüse normal'},
    {name:'HbA1c',       val:'5.1%',        ref:'<5.7%',      status:'✅', note:'Sehr gut'},
    {name:'LDL',         val:'2.8 mmol/L',  ref:'<3.4',       status:'✅', note:'Optimal'},
    {name:'HDL',         val:'1.6 mmol/L',  ref:'>1.0',       status:'✅', note:'Gut'},
    {name:'CRP',         val:'0.4 mg/L',    ref:'<5.0',       status:'✅', note:'Keine Entzündung'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Laborwerte</div><div style="font-size:var(--text-micro);color:var(--text-muted)">März 2026</div></div>
      <div style="display:grid;grid-template-columns:1fr 80px 60px 40px;gap:0;margin-bottom:6px">
        ${['Wert','Ergebnis','Referenz',''].map(h=>`
          <div style="font-size:var(--text-micro);color:var(--text-muted);padding:4px 0">${h}</div>`).join('')}
      </div>
      ${labs.map(l=>`
        <div style="display:grid;grid-template-columns:1fr 80px 60px 40px;gap:0;padding:6px 0;border-bottom:1px solid var(--surface-border)">
          <div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${l.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${l.note}</div>
          </div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${l.val}</div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">${l.ref}</div>
          <div style="font-size:13px;text-align:center">${l.status}</div>
        </div>`).join('')}
    </div>
  `;
};
