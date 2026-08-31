// features/admin/SecurityView.js
window.Admin_SecurityView = function() {
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Sicherheit</div></div>
      <div class="data-row"><div class="data-label">2FA Status</div><div class="badge badge-green">✓ Aktiviert</div></div>
      <div class="data-row"><div class="data-label">Letzte Passwort-Änderung</div><div class="data-val">Jan 2026</div></div>
      <div class="data-row"><div class="data-label">Aktive Sessions</div><div class="data-val">2</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">API Keys</div></div>
      ${[
        {name:'Produktions-Key',  key:'lm_prod_••••••••4a2f', created:'15. Jan 2026', last:'heute'},
        {name:'Entwickler-Key',   key:'lm_dev_••••••••9c1e',  created:'1. März 2026', last:'23. Apr'},
      ].map(k=>`
        <div style="padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${k.name}</div>
            <div class="badge badge-green">aktiv</div>
          </div>
          <div style="font-size:var(--text-micro);font-family:var(--font-mono);color:var(--text-muted)">${k.key}</div>
          <div style="font-size:var(--text-micro);color:var(--text-subtle);margin-top:2px">Erstellt: ${k.created} · Letzter Einsatz: ${k.last}</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Login-Log</div></div>
      ${[
        {time:'Heute 06:30', loc:'Koh Samui, TH', device:'Chrome / Windows'},
        {time:'Gestern 18:12',loc:'Koh Samui, TH',device:'Safari / iOS'},
        {time:'25. Apr 07:45',loc:'Koh Samui, TH',device:'Chrome / Windows'},
      ].map(l=>`
        <div class="data-row">
          <div>
            <div class="data-label">${l.time}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${l.loc} · ${l.device}</div>
          </div>
          <div class="badge badge-green">✓</div>
        </div>`).join('')}
    </div>
  `;
};
