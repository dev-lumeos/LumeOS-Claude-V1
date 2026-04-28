// features/coach/WatcherView.js — NEW
// AI Coach · Watcher: Active Rules, CoachAutonomyConfig, Watcher-Log

window.Coach_WatcherView = function() {
  const rules = [
    {id:1,icon:'🍽️',cat:'Ernährung', trigger:'Protein < 140g um 20:00 Uhr',action:'Abend-Reminder senden',status:'aktiv',last:'heute 20:00',triggered:true},
    {id:2,icon:'💤',cat:'Recovery',  trigger:'Recovery Score < 70 für 2+ Tage',action:'Training-Volumen -20% empfehlen',status:'aktiv',last:'nie',triggered:false},
    {id:3,icon:'🏋️',cat:'Training',  trigger:'Deload überfällig (>6 Wochen)',action:'Deload-Woche vorschlagen',status:'aktiv',last:'vor 2 Wochen',triggered:false},
    {id:4,icon:'💊',cat:'Supplements',trigger:'Adherenz < 80% in 7 Tagen',action:'Supplement-Reminder einrichten',status:'aktiv',last:'nie',triggered:false},
    {id:5,icon:'📈',cat:'Training',  trigger:'3× gleiche Gewicht ohne Fortschritt',action:'Progression-Vorschlag senden',status:'aktiv',last:'vor 5 Tagen',triggered:true},
    {id:6,icon:'💧',cat:'Ernährung', trigger:'Wasser < 1.5L bis 18:00 Uhr',action:'Wasser-Reminder senden',status:'pausiert',last:'nie',triggered:false},
  ];
  const todayLog = [
    {time:'07:15',icon:'💊',event:'Morgen-Supplement-Check: 6/6 genommen — kein Reminder nötig'},
    {time:'12:30',icon:'🍽️',event:'Mittagessen geloggt — Proteinziel 53% erreicht, kein Alert'},
    {time:'17:00',icon:'🏋️',event:'Training gestartet — Watcher überwacht RPE und Volumen'},
    {time:'18:45',icon:'📈',event:'Bankdrücken PR erkannt (92kg×8) — Progression-Hinweis ausgegeben'},
    {time:'20:01',icon:'🍽️',event:'Protein-Check: 114g gegessen, 26g unter Ziel → Reminder gesendet ✅'},
  ];
  const activeCount = rules.filter(r=>r.status==='aktiv').length;
  const triggeredToday = rules.filter(r=>r.triggered).length;

  return `
    <div class="card-grid">
      <div class="stat-card"><div class="stat-val">${activeCount}</div><div class="stat-lbl">Aktive Regeln</div><div class="stat-delta delta-up">↑ Wächter aktiv</div></div>
      <div class="stat-card"><div class="stat-val">${triggeredToday}</div><div class="stat-lbl">Heute ausgelöst</div><div class="stat-delta delta-up">↑ ${todayLog.length} Events</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🤖 Coach-Autonomie</div><div class="badge badge-blue">40%</div></div>
      <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:10px">Wie viel darf der Coach selbstständig entscheiden?</div>
      <div style="position:relative;height:8px;background:linear-gradient(90deg,var(--brand-100),var(--brand-600));border-radius:4px;margin-bottom:6px">
        <div style="position:absolute;left:40%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--brand-600);box-shadow:var(--shadow-md)"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>0% — nur Vorschläge</span><span style="color:var(--brand-700);font-weight:600">40% — aktuell</span><span>100% — volle Autonomie</span>
      </div>
      <div style="margin-top:10px">
        ${[
          {lvl:0,lbl:'Nur Vorschläge',desc:'Coach schlägt vor, du entscheidest alles'},
          {lvl:40,lbl:'Moderate Autonomie',desc:'Coach passt Reminder und Volumen-Hinweise an',active:true},
          {lvl:70,lbl:'Hohe Autonomie',desc:'Coach ändert Pläne, sendet automatisch Reminders'},
          {lvl:100,lbl:'Volle Autonomie',desc:'Coach agiert vollständig selbstständig'},
        ].map(l=>`
          <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--surface-border)">
            <div style="width:18px;height:18px;border-radius:50%;border:2px solid ${l.active?'var(--brand-600)':'var(--surface-border)'};background:${l.active?'var(--brand-600)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
              ${l.active?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
            </div>
            <div>
              <div style="font-size:var(--text-xs);font-weight:${l.active?'var(--fw-semibold)':'var(--fw-normal)'};color:${l.active?'var(--text-primary)':'var(--text-muted)'}">${l.lbl}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${l.desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">👁️ Aktive Watcher-Regeln</div><div class="badge badge-green">${activeCount} aktiv</div></div>
      ${rules.map(r=>`
        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:18px;flex-shrink:0">${r.icon}</span>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span class="badge badge-${r.status==='aktiv'?'green':'gray'}">${r.status}</span>
              <span style="font-size:var(--text-micro);color:var(--text-muted)">${r.cat}</span>
              ${r.triggered?'<span class="badge badge-orange">🔔 heute</span>':''}
            </div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">WENN: ${r.trigger}</div>
            <div style="font-size:var(--text-micro);color:var(--text-secondary);margin-top:2px">→ DANN: ${r.action}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">Zuletzt: ${r.last}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
            <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-muted);cursor:pointer">✏️ Edit</div>
            <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-sm);background:var(--semantic-danger-bg);color:var(--semantic-danger-text);cursor:pointer">✕</div>
          </div>
        </div>`).join('')}
      <div style="margin-top:12px;text-align:center">
        <div style="display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--fw-medium);padding:8px 16px;border-radius:var(--r-md);background:var(--brand-600);color:#fff;cursor:pointer">+ Neue Regel hinzufügen</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📋 Watcher-Log — heute</div><div class="card-meta">${todayLog.length} Events</div></div>
      ${todayLog.map(l=>`
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <div style="font-size:var(--text-micro);color:var(--text-muted);width:36px;flex-shrink:0;margin-top:1px">${l.time}</div>
          <span style="font-size:14px;flex-shrink:0">${l.icon}</span>
          <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.4">${l.event}</div>
        </div>`).join('')}
    </div>`;
};
