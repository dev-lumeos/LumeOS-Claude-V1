// features/training/CoachRoutines.js
// Training → Coach Programme: Zugewiesene Programme mit Compliance, Preview, Status

window.Training_CoachRoutines = function() {
  const programmes = [
    {name:'PPL Hypertrophie 12 Wochen', coach:'Coach Mueller',avatar:'CM',color:'#3b82f6',
     status:'aktiv',compliance:73,week:3,totalWeeks:12,
     desc:'Progressiver Push/Pull/Legs Split mit wöchentlicher Volumensteigerung',
     lastAssigned:'1. April 2026',
     days:[
       {d:'Mo',name:'Push Day A',sets:18,dur:'~52min'},
       {d:'Di',name:'Pull Day B', sets:16,dur:'~48min'},
       {d:'Mi',name:'Legs Day C', sets:20,dur:'~65min'},
       {d:'Do',name:'Rest',       sets:0, dur:'—'},
       {d:'Fr',name:'Push Day B', sets:18,dur:'~52min'},
       {d:'Sa',name:'Cardio',     sets:0, dur:'30min'},
       {d:'So',name:'Rest',       sets:0, dur:'—'},
     ]},
    {name:'Lean Bulk Phase 2',          coach:'Coach Mueller',avatar:'CM',color:'#3b82f6',
     status:'wartend',compliance:null,week:0,totalWeeks:8,
     desc:'Wartet auf Abschluss von Phase 1 — startet automatisch in KW 25',
     lastAssigned:'1. April 2026',
     days:[]},
  ];
  const noCoach = programmes.length === 0;

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${noCoach ? `
        <div class="card" style="text-align:center;padding:40px 20px">
          <div style="font-size:40px;margin-bottom:12px">🏋️</div>
          <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary);margin-bottom:6px">Kein Coach zugewiesen</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">Finde deinen Coach im Marketplace</div>
        </div>
      ` : programmes.map(p=>`
        <div class="card" style="border:1px solid ${p.status==='aktiv'?p.color+'40':'var(--surface-border)'}">
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
            <div style="width:38px;height:38px;border-radius:var(--r-full);background:${p.color};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">${p.avatar}</div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${p.name}</span>
                <span class="badge badge-${p.status==='aktiv'?'green':'gray'}">${p.status}</span>
              </div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:2px">${p.desc}</div>
              <div style="font-size:var(--text-micro);color:var(--text-secondary)">Von: ${p.coach} · Zugewiesen: ${p.lastAssigned}</div>
            </div>
          </div>

          ${p.status==='aktiv'?`
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:var(--text-xs);color:var(--text-secondary)">Woche ${p.week} von ${p.totalWeeks}</span>
                <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${p.color}">${p.compliance}% Compliance</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${(p.week/p.totalWeeks)*100}%;background:${p.color}"></div></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:10px">
              ${p.days.map(d=>`
                <div style="text-align:center">
                  <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:2px">${d.d}</div>
                  <div style="border-radius:var(--r-sm);padding:6px 2px;background:${d.sets>0?p.color+'15':'var(--surface-hover)'};border:1px solid ${d.sets>0?p.color+'40':'var(--surface-border)'}">
                    <div style="font-size:var(--text-micro);font-weight:${d.sets>0?'var(--fw-semibold)':'var(--fw-normal)'};color:${d.sets>0?p.color:'var(--text-muted)'};line-height:1.2">${d.name.split(' ')[0]}</div>
                    ${d.sets>0?`<div style="font-size:8px;color:var(--text-muted)">${d.dur}</div>`:''}
                  </div>
                </div>`).join('')}
            </div>`:''}

          <div style="display:flex;gap:6px">
            ${p.status==='aktiv'?`
              <div style="flex:1;padding:7px;text-align:center;border-radius:var(--r-md);background:${p.color};color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">▶ Heute starten</div>
              <div style="padding:7px 12px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">Feedback</div>
              <div style="padding:7px 12px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">Details</div>`:`
              <div style="flex:1;padding:7px;text-align:center;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-muted);font-size:var(--text-xs)">Wartend auf Phase 1</div>`}
          </div>
        </div>`).join('')}

      <div style="text-align:center;padding:8px 0">
        <div style="display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);padding:10px 20px;border-radius:var(--r-md);border:1px dashed var(--surface-border);cursor:pointer">
          🔍 Coach finden im Marketplace
        </div>
      </div>
    </div>
  `;
};
