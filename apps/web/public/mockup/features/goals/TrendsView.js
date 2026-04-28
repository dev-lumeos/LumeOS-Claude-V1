// features/goals/TrendsView.js
// Mirrors: src/features/goals/components/TrendsView.tsx
window.Goals_TrendsView = function() {
  const weights = [87.2,87.0,86.8,86.5,86.4,86.1,85.8,85.6,85.4,85.2,85.1,84.9];
  const max = Math.max(...weights), min = Math.min(...weights)-0.5;
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Gewicht — 12 Wochen</div></div>
      <div style="display:flex;align-items:flex-end;height:72px;gap:3px;margin-bottom:6px">
        ${weights.map((v,i)=>`
          <div style="flex:1;background:${i===weights.length-1?'var(--brand-600)':'var(--brand-300,var(--brand-200))'};border-radius:2px 2px 0 0;height:${((v-min)/(max-min))*68}px"></div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>Feb</span><span>→ -2.3 kg Gesamt</span><span>Heute: ${weights[weights.length-1]} kg</span>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Zielfortschritt über Zeit</div></div>
      ${[
        {name:'Körpergewicht 82kg',  pct:68, col:'var(--accent-goals)',    change:'+8% diese Woche'},
        {name:'Bankdrücken 110kg×5', pct:82, col:'#ec4899',                change:'+5% diese Woche'},
        {name:'5km unter 22min',     pct:45, col:'var(--accent-training)', change:'+2% diese Woche'},
      ].map(g=>`
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary)">${g.name}</span>
            <span style="font-size:var(--text-xs);color:var(--brand-700)">${g.change}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${g.pct}%;background:${g.col}"></div>
          </div>
        </div>`).join('')}
    </div>
  `;
};
