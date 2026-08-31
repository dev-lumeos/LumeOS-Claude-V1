// features/analytics/ReportsView.js
window.Analytics_ReportsView = function() {
  const reports = [
    {title:'Wochenbericht KW 17',  date:'27. Apr 2026', size:'84 KB', type:'PDF'},
    {title:'Wochenbericht KW 16',  date:'20. Apr 2026', size:'78 KB', type:'PDF'},
    {title:'Monatsbericht April',  date:'1. Apr 2026',  size:'142 KB',type:'PDF'},
    {title:'Wochenbericht KW 15',  date:'13. Apr 2026', size:'81 KB', type:'PDF'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Generierte Reports</div></div>
      ${reports.map(r=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--semantic-danger-bg);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">📄</div>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${r.title}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.date} · ${r.size}</div>
          </div>
          <div style="font-size:var(--text-xs);color:var(--semantic-info-text);cursor:pointer">↓ Download</div>
        </div>`).join('')}
    </div>
  `;
};
