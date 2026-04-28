// features/marketplace/InstalledView.js
window.Marketplace_InstalledView = function() {
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Installierte Apps</div><div class="badge badge-blue">2 aktiv</div></div>
      ${[
        {icon:'⌚', name:'Apple Health', desc:'Letzte Sync: vor 5 Min', status:'aktiv',  badge:'badge-green'},
        {icon:'🛌', name:'Oura Ring',   desc:'Letzte Sync: heute 06:00', status:'aktiv', badge:'badge-green'},
      ].map(a=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:20px">${a.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${a.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${a.desc}</div>
          </div>
          <div class="badge ${a.badge}">${a.status}</div>
        </div>`).join('')}
    </div>
  `;
};
