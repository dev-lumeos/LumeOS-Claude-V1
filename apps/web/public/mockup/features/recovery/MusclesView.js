// features/recovery/MusclesView.js — NEW
// Recovery · Muskeln: RecoveryMuscleMap, Status-Tabelle, Recovery % per Muskelgruppe

window.Recovery_MusclesView = function() {
  const muscles = [
    {name:'Brust',      icon:'🫁', lastTrain:'gestern 17:00', hrs:24,  recovery:20, soreness:3, readiness:'🔴 Braucht Ruhe',    color:'#ef4444'},
    {name:'Schultern',  icon:'💪', lastTrain:'gestern 17:00', hrs:24,  recovery:25, soreness:2, readiness:'🔴 Braucht Ruhe',    color:'#ef4444'},
    {name:'Trizeps',    icon:'💪', lastTrain:'gestern 17:00', hrs:24,  recovery:35, soreness:2, readiness:'🟠 Leicht ok',       color:'#f97316'},
    {name:'Latissimus', icon:'🔙', lastTrain:'vor 3 Tagen',   hrs:72,  recovery:85, soreness:0, readiness:'🟢 Training bereit', color:'var(--brand-500)'},
    {name:'Bizeps',     icon:'💪', lastTrain:'vor 3 Tagen',   hrs:72,  recovery:88, soreness:0, readiness:'🟢 Training bereit', color:'var(--brand-500)'},
    {name:'Trapez',     icon:'🔺', lastTrain:'vor 3 Tagen',   hrs:72,  recovery:90, soreness:0, readiness:'🟢 Training bereit', color:'var(--brand-500)'},
    {name:'Quadrizeps', icon:'🦵', lastTrain:'vor 5 Tagen',   hrs:120, recovery:100,soreness:0, readiness:'🟢 Sehr erholt',     color:'var(--brand-500)'},
    {name:'Gesäß',      icon:'🍑', lastTrain:'vor 5 Tagen',   hrs:120, recovery:100,soreness:0, readiness:'🟢 Sehr erholt',     color:'var(--brand-500)'},
    {name:'Beinbeuger', icon:'🦵', lastTrain:'vor 5 Tagen',   hrs:120, recovery:95, soreness:0, readiness:'🟢 Sehr erholt',     color:'var(--brand-500)'},
    {name:'Waden',      icon:'🦶', lastTrain:'vor 5 Tagen',   hrs:120, recovery:100,soreness:0, readiness:'🟢 Sehr erholt',     color:'var(--brand-500)'},
    {name:'Bauch',      icon:'🎯', lastTrain:'gestern 17:00', hrs:24,  recovery:60, soreness:1, readiness:'🟡 Vorsicht',        color:'#f59e0b'},
    {name:'Unterarme',  icon:'🤜', lastTrain:'vor 3 Tagen',   hrs:72,  recovery:92, soreness:0, readiness:'🟢 Training bereit', color:'var(--brand-500)'},
  ];
  const avgRecovery = Math.round(muscles.reduce((s,m)=>s+m.recovery,0)/muscles.length);
  const readyCount  = muscles.filter(m=>m.recovery>=70).length;

  return `
    <div style="background:var(--gradient-recovery);border-radius:var(--r-lg);padding:16px 20px;color:#fff;margin-bottom:2px">
      <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Muskel Recovery Status</div>
      <div style="display:flex;align-items:center;gap:16px">
        <div>
          <div style="font-size:32px;font-weight:var(--fw-bold)">${avgRecovery}%</div>
          <div style="font-size:var(--text-xs);color:rgba(255,255,255,.75)">Ø Erholung alle Muskeln</div>
        </div>
        <div style="flex:1">
          <div style="background:rgba(255,255,255,.25);border-radius:4px;height:8px;overflow:hidden">
            <div style="width:${avgRecovery}%;height:100%;background:#fff;border-radius:4px"></div>
          </div>
          <div style="font-size:var(--text-micro);color:rgba(255,255,255,.7);margin-top:6px">${readyCount} von ${muscles.length} Muskelgruppen trainingsbereit</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🗺️ Körper Recovery Map</div><div class="badge badge-blue">Klick für Details</div></div>
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div style="flex:1">
          <div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center;margin-bottom:6px">Vorderseite</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:0 auto;max-width:160px">
            ${[
              [null,'Schultern',null,'Schultern',null],
              ['Bizeps','Brust',null,'Brust','Trizeps'],
              [null,'Bauch','Bauch','Bauch',null],
              ['Unterarme','Quadrizeps','Quadrizeps','Quadrizeps',null],
              [null,'Beinbeuger',null,'Beinbeuger',null],
              [null,'Waden',null,'Waden',null],
            ].flat().map(n=>{
              if(!n) return `<div style="height:20px"></div>`;
              const m=muscles.find(mu=>mu.name===n);
              if(!m) return `<div style="height:20px"></div>`;
              return `<div style="height:20px;border-radius:3px;background:${m.color};opacity:${0.2+m.recovery/100*0.8}" title="${m.name}: ${m.recovery}% erholt"></div>`;
            }).join('')}
          </div>
        </div>
        <div style="flex:1">
          <div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center;margin-bottom:6px">Rückseite</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:0 auto;max-width:160px">
            ${[
              [null,'Trapez','Trapez','Trapez',null],
              ['Bizeps','Latissimus','Latissimus','Latissimus','Trizeps'],
              [null,'Latissimus','Latissimus','Latissimus',null],
              [null,'Gesäß','Gesäß','Gesäß',null],
              [null,'Beinbeuger','Beinbeuger','Beinbeuger',null],
              [null,'Waden',null,'Waden',null],
            ].flat().map(n=>{
              if(!n) return `<div style="height:20px"></div>`;
              const m=muscles.find(mu=>mu.name===n);
              if(!m) return `<div style="height:20px"></div>`;
              return `<div style="height:20px;border-radius:3px;background:${m.color};opacity:${0.2+m.recovery/100*0.8}" title="${m.name}: ${m.recovery}% erholt"></div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:10px;flex-wrap:wrap">
        ${[{c:'var(--brand-500)',l:'≥70% erholt'},{c:'#f59e0b',l:'40-69%'},{c:'#f97316',l:'20-39%'},{c:'#ef4444',l:'<20% Ruhe'}].map(l=>`
          <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)">
            <div style="width:10px;height:10px;border-radius:2px;background:${l.c}"></div>${l.l}
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Muskel-Recovery-Tabelle</div></div>
      ${muscles.map(m=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:14px;flex-shrink:0">${m.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${m.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.lastTrain} · ${m.hrs}h ago</div>
          </div>
          <div style="width:80px">
            <div class="progress-track" style="height:5px;margin-bottom:2px">
              <div class="progress-fill" style="width:${m.recovery}%;background:${m.color}"></div>
            </div>
            <div style="font-size:var(--text-micro);font-weight:600;color:${m.color};text-align:right">${m.recovery}%</div>
          </div>
          <div style="font-size:var(--text-micro);color:var(--text-secondary);width:110px;text-align:right">${m.readiness}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">💡 Muskelkater-Log heute</div></div>
      ${muscles.filter(m=>m.soreness>0).map(m=>`
        <div class="data-row">
          <div class="data-label">${m.icon} ${m.name}</div>
          <div style="display:flex;align-items:center;gap:6px">
            ${Array.from({length:3},(_,i)=>`
              <div style="width:8px;height:8px;border-radius:50%;background:${i<m.soreness?m.color:'var(--surface-hover)'}"></div>`).join('')}
            <span style="font-size:var(--text-micro);color:var(--text-muted)">${m.soreness===1?'leicht':m.soreness===2?'mittel':'stark'}</span>
          </div>
        </div>`).join('')}
      ${muscles.every(m=>m.soreness===0)?`<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:var(--text-xs)">🎉 Kein Muskelkater heute!</div>`:''}
    </div>`;
};
