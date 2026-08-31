// features/supplements/EnhancedView.js
// Mirrors: src/features/supplements/components/EnhancedView.tsx
window.Supplements_EnhancedView = function() {
  const items = [
    {name:'Kreatin Monohydrat', evidence:'🟢', ev:'stark',  benefit:'Kraft +5-15%, Muskelmasse, Kognition', note:'Sicherste und am besten erforschte Ergänzung'},
    {name:'Vitamin D3',         evidence:'🟢', ev:'stark',  benefit:'Immunsystem, Knochen, Stimmung, Testosteron', note:'Blutspiegel 60-80 ng/ml anstreben'},
    {name:'Omega-3 (EPA/DHA)',  evidence:'🟢', ev:'stark',  benefit:'Entzündung ↓, Herz, Kognition, Recovery', note:'Fisch-Öl > pflanzlich für EPA/DHA'},
    {name:'Magnesium Glycinat', evidence:'🟡', ev:'mittel', benefit:'Schlafqualität, Muskelrelaxation, Stimmung', note:'Glycinat-Form besser absorbierbar als Oxid'},
    {name:'Ashwagandha KSM-66', evidence:'🟡', ev:'mittel', benefit:'Cortisol ↓, Stressresistenz, Testosteron', note:'KSM-66 Extrakt = standardisierter Wirkstoffgehalt'},
    {name:'Zink Bisglycinat',   evidence:'🟡', ev:'mittel', benefit:'Testosteron, Immunsystem, Wundheilung', note:'Nur nehmen wenn Mangel vorhanden'},
  ];
  return `
    <div style="display:flex;gap:10px;margin-bottom:8px">
      ${[{e:'🟢',l:'Stark (≥3 RCTs)'},{e:'🟡',l:'Mittel (1-2 RCTs)'},{e:'🔴',l:'Schwach/unklar'}].map(l=>`
        <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)">${l.e} ${l.l}</div>`).join('')}
    </div>
    ${items.map(item=>`
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:18px">${item.evidence}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${item.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Evidenz: ${item.ev}</div>
          </div>
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:6px;line-height:1.4">✓ ${item.benefit}</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);background:var(--surface-hover);border-radius:var(--r-sm);padding:6px 8px">${item.note}</div>
      </div>`).join('')}
  `;
};
