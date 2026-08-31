// features/admin/UsersView.js
window.Admin_UsersView = function() {
  const users = [
    {initials:'TK', name:'Tom K.',        role:'Owner',  active:'gerade eben', color:'linear-gradient(135deg,#667eea,#764ba2)'},
    {initials:'SK', name:'Sarah K.',      role:'Viewer', active:'vor 2 Tagen',  color:'linear-gradient(135deg,#f97316,#ef4444)'},
    {initials:'GK', name:'Coach Mueller', role:'Coach',  active:'vor 1 Woche',  color:'linear-gradient(135deg,#22c55e,#2dd4bf)'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Users</div><div class="badge badge-blue">3 User</div></div>
      ${users.map(u=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <div style="width:32px;height:32px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:600;flex-shrink:0">${u.initials}</div>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${u.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Aktiv: ${u.active}</div>
          </div>
          <div class="badge badge-${u.role==='Owner'?'green':u.role==='Coach'?'blue':'gray'}">${u.role}</div>
        </div>`).join('')}
      <div style="margin-top:10px">
        <div style="font-size:var(--text-xs);color:var(--semantic-info-text);cursor:pointer;font-weight:var(--fw-medium)">+ Einladen</div>
      </div>
    </div>
  `;
};
