// features/supplements/TodayView.js
// Mirrors: src/features/supplements/components/TodayView.tsx
window.Supplements_TodayView = function() {
  const morning = [
    {name:'Vitamin D3+K2',    dose:'5.000 IU + 100mcg', done:true},
    {name:'Omega-3 (EPA/DHA)',dose:'2g EPA / 1g DHA',   done:true},
    {name:'Zink',             dose:'15mg',               done:true},
    {name:'Kreatin Monohydrat',dose:'5g',               done:true},
  ];
  const evening = [
    {name:'Magnesium Glycinat',dose:'400mg',    done:false},
    {name:'Ashwagandha KSM-66',dose:'600mg',   done:false},
  ];
  const list = (items, label) => `
    <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin:10px 0 6px">${label}</div>
    ${items.map(s=>`
      <div class="suppl-item">
        <div class="suppl-check ${s.done?'done':''}">${s.done?'✓':''}</div>
        <div style="flex:1">
          <div class="suppl-name">${s.name}</div>
          <div class="suppl-dose">${s.dose}</div>
        </div>
        <div class="suppl-time">${label.includes('Morgen')?'Morgens':'Abends'}</div>
      </div>`).join('')}`;
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Heute</div>
        <div class="badge badge-green">4 / 6 ✅</div>
      </div>
      ${list(morning,'☀️ Morgen-Protokoll')}
      ${list(evening,'🌙 Abend-Protokoll')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Adherenz-Streak</div></div>
      <div style="display:flex;gap:4px">
        ${Array.from({length:14},(_,i)=>`
          <div style="flex:1;height:20px;border-radius:3px;background:${i<12?'var(--brand-500)':i===12?'var(--brand-200)':'var(--surface-hover)'}"></div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:var(--text-micro);color:var(--text-muted)">
        <span>14 Apr</span><span>12 Tage Streak 🔥</span><span>Heute</span>
      </div>
    </div>
  `;
};
