// features/supplements/StackView.js
// Mirrors: src/features/supplements/components/StackView.tsx
window.Supplements_StackView = function() {
  const stack = [
    {name:'Vitamin D3+K2',     dose:'5.000 IU + 100mcg', timing:'Morgens mit Fett', cat:'Vitamine',    icon:'☀️'},
    {name:'Omega-3 (EPA/DHA)', dose:'2g / 1g täglich',   timing:'Morgens mit Essen', cat:'Fette',      icon:'🐟'},
    {name:'Kreatin Monohydrat',dose:'5g täglich',         timing:'Morgens / prä WO', cat:'Performance', icon:'💪'},
    {name:'Magnesium Glycinat',dose:'400mg',              timing:'Abends vor Schlaf', cat:'Mineralien', icon:'🌙'},
    {name:'Ashwagandha KSM-66',dose:'600mg',             timing:'Abends',            cat:'Adaptogen',   icon:'🌿'},
    {name:'Zink (als Bisglycinat)',dose:'15mg',           timing:'Morgens',           cat:'Mineralien', icon:'⚡'},
    {name:'Vitamin B-Komplex',  dose:'1 Kapsel',         timing:'Morgens',           cat:'Vitamine',    icon:'🅱️'},
    {name:'L-Theanin',          dose:'200mg',            timing:'Bei Kaffee',        cat:'Amino',       icon:'☕'},
  ];
  const catColor = {Vitamine:'badge-blue', Fette:'badge-green', Performance:'badge-orange', Mineralien:'badge-gray', Adaptogen:'badge-green', Amino:'badge-blue'};
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Mein Stack</div><div class="badge badge-blue">8 Supplements</div></div>
      ${stack.map(s=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:18px;flex-shrink:0">${s.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${s.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${s.dose} · ${s.timing}</div>
          </div>
          <div class="badge ${catColor[s.cat]||'badge-gray'}">${s.cat}</div>
        </div>`).join('')}
    </div>
  `;
};
