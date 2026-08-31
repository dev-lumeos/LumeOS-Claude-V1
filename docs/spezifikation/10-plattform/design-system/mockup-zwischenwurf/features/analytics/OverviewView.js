// features/analytics/OverviewView.js
window.Analytics_OverviewView = function() {
  const modules = ['Nutrition','Training','Coach','Recovery','Goals','Supplements','Dashboard'];
  const usage =   [94,         82,        68,      71,        58,      76,           45];
  return `
    <div class="card-grid">
      <div class="stat-card"><div class="stat-val">534</div><div class="stat-lbl">Events heute</div><div class="stat-delta delta-up">↑ +12% vs. Ø</div></div>
      <div class="stat-card"><div class="stat-val">99.2%</div><div class="stat-lbl">Uptime (30T)</div><div class="stat-delta delta-up">↑ SLA erfüllt</div></div>
      <div class="stat-card"><div class="stat-val">12ms</div><div class="stat-lbl">Ø API-Latenz</div><div class="stat-delta delta-up">↓ -3ms vs. Woche</div></div>
      <div class="stat-card"><div class="stat-val">2</div><div class="stat-lbl">Aktive Sessions</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Modul-Nutzung heute</div></div>
      ${modules.map((m,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:5px 0">
          <div style="font-size:var(--text-xs);color:var(--text-secondary);min-width:80px">${m}</div>
          <div style="flex:1;height:6px;background:var(--surface-hover);border-radius:3px;overflow:hidden">
            <div style="height:100%;background:var(--brand-500);border-radius:3px;width:${usage[i]}%"></div>
          </div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);min-width:28px;text-align:right">${usage[i]}%</div>
        </div>`).join('')}
    </div>
  `;
};
