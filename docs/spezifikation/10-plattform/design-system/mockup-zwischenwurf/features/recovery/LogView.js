// features/recovery/LogView.js
// Mirrors: src/features/recovery/components/LogView.tsx
window.Recovery_LogView = function() {
  const logs = [
    {date:'Heute',      erschoepf:3, muskel:4, stress:2, note:'Gute Energie nach Frühstück'},
    {date:'Gestern',    erschoepf:4, muskel:6, stress:3, note:'Beine schwer nach Legs Day'},
    {date:'25. Apr',    erschoepf:3, muskel:3, stress:2, note:''},
    {date:'24. Apr',    erschoepf:5, muskel:7, stress:4, note:'Sehr intensiver Legs Day'},
    {date:'23. Apr',    erschoepf:2, muskel:3, stress:2, note:'Rest Day, sehr erholt'},
  ];
  const bar = (val, max=10, color) => `
    <div style="display:flex;align-items:center;gap:6px">
      <div style="width:48px;height:5px;background:var(--surface-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;background:${color};border-radius:3px;width:${(val/max)*100}%"></div>
      </div>
      <span style="font-size:var(--text-micro);color:var(--text-muted)">${val}/10</span>
    </div>`;
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Recovery Logs</div></div>
      ${logs.map(l=>`
        <div style="padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary);margin-bottom:6px">${l.date}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
            <div><div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">Erschöpfung</div>${bar(l.erschoepf,10,'#f97316')}</div>
            <div><div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">Muskelkater</div>${bar(l.muskel,10,'var(--accent-training)')}</div>
            <div><div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">Stress</div>${bar(l.stress,10,'var(--accent-goals)')}</div>
          </div>
          ${l.note?`<div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:5px">${l.note}</div>`:''}
        </div>`).join('')}
    </div>
  `;
};
