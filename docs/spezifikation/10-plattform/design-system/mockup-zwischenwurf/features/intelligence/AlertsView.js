// features/intelligence/AlertsView.js
// Mirrors: src/features/intelligence/components/AlertsView.tsx
window.Intelligence_AlertsView = function() {
  const alerts = [
    {prio:'mittel', icon:'⚠️', title:'Vitamin D Coverage 3 Tage unter 62%', action:'Supplementierung überprüfen oder mehr Sonnenlicht', badgeClass:'badge-orange'},
    {prio:'niedrig',icon:'💡', title:'Montag-Recovery-Muster erkannt',       action:'Sonntags früher ins Bett → besserer Wochenstart',   badgeClass:'badge-blue'},
    {prio:'niedrig',icon:'📈', title:'Bankdrücken-Plateau seit 2 Wochen',    action:'Technik-Check oder Deload-Woche einplanen',          badgeClass:'badge-blue'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Aktive Alerts</div><div class="badge badge-orange">3 aktiv</div></div>
      ${alerts.map(a=>`
        <div style="display:flex;gap:10px;padding:10px;margin-bottom:8px;background:${a.prio==='hoch'?'rgba(239,68,68,.06)':a.prio==='mittel'?'rgba(234,179,8,.06)':'var(--surface-hover)'};border-radius:var(--r-md);border-left:3px solid ${a.prio==='hoch'?'var(--semantic-danger-text)':a.prio==='mittel'?'var(--semantic-warning-text)':'var(--semantic-info-text)'}">
          <span style="font-size:18px;flex-shrink:0">${a.icon}</span>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${a.title}</div>
              <div class="badge ${a.badgeClass}">${a.prio}</div>
            </div>
            <div style="font-size:var(--text-micro);color:var(--text-secondary)">→ ${a.action}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
};
