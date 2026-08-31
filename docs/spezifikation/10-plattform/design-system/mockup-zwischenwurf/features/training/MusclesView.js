// features/training/MusclesView.js — DEEP REBUILD
// Training Readiness Score, MuscleVolumeHeatmap (12 muscles × 4W), Fatigue Tabelle, Deload-Alert

window.Training_MusclesView = function() {
  // Training Readiness: SPEC_09 formula — Recovery × 0.30 + Sleep × 0.25 + Soreness × 0.20 + Load × 0.15 + Mood × 0.10
  const readinessInputs = [
    {label:'Recovery',  icon:'💚', val:78, weight:.30, color:'var(--brand-500)'},
    {label:'Schlaf',    icon:'😴', val:82, weight:.25, color:'#3b82f6'},
    {label:'Kein Kater',icon:'🦵', val:72, weight:.20, color:'#f59e0b'},
    {label:'Belastung', icon:'📊', val:85, weight:.15, color:'#a855f7'},
    {label:'Stimmung',  icon:'🧠', val:80, weight:.10, color:'#06b6d4'},
  ];
  const readiness = Math.round(readinessInputs.reduce((s,r)=>s+r.val*r.weight,0));
  const readyLabel = readiness>=85?'Bereit für alles 💪':readiness>=70?'Gute Form':readiness>=50?'Moderates Training empfohlen':'Leichtes Training';
  const readyAdvice = readiness>=85?'Heute ist ein guter Tag für PRs. Volle Intensität.':'Recovery 78 — Pull Day mit 85% Volumen empfohlen.';
  const ringColor = readiness>=80?'var(--brand-500)':readiness>=60?'#f59e0b':'#ef4444';

  // Muscle status data
  const muscles = [
    {name:'Brust',      icon:'🫁',lastTrain:'gestern',  hrs:24, fatigue:85,status:'rest',   rec:'48h warten'},
    {name:'Schultern',  icon:'💪',lastTrain:'gestern',  hrs:24, fatigue:75,status:'rest',   rec:'48h warten'},
    {name:'Trizeps',    icon:'💪',lastTrain:'gestern',  hrs:24, fatigue:70,status:'caution',rec:'Leicht OK'},
    {name:'Latissimus', icon:'🔙',lastTrain:'vor 3T',   hrs:72, fatigue:10,status:'ready',  rec:'Training bereit'},
    {name:'Bizeps',     icon:'💪',lastTrain:'vor 3T',   hrs:72, fatigue:12,status:'ready',  rec:'Training bereit'},
    {name:'Trapez',     icon:'🔺',lastTrain:'vor 3T',   hrs:72, fatigue:8, status:'ready',  rec:'Training bereit'},
    {name:'Quadrizeps', icon:'🦵',lastTrain:'vor 5T',   hrs:120,fatigue:0, status:'ready',  rec:'Sehr erholt'},
    {name:'Gesäß',      icon:'🍑',lastTrain:'vor 5T',   hrs:120,fatigue:0, status:'ready',  rec:'Sehr erholt'},
    {name:'Beinbeuger', icon:'🦵',lastTrain:'vor 5T',   hrs:120,fatigue:0, status:'ready',  rec:'Sehr erholt'},
    {name:'Waden',      icon:'🦶',lastTrain:'vor 5T',   hrs:120,fatigue:5, status:'ready',  rec:'Erholt'},
    {name:'Bauch',      icon:'🎯',lastTrain:'gestern',  hrs:24, fatigue:30,status:'caution',rec:'24h warten'},
    {name:'Unterarme',  icon:'🤜',lastTrain:'vor 3T',   hrs:72, fatigue:5, status:'ready',  rec:'Training bereit'},
  ];
  const statusColor = {ready:'var(--brand-500)',caution:'#f59e0b',rest:'#ef4444'};
  const readyCount  = muscles.filter(m=>m.status==='ready').length;

  // Volume Heatmap data: 12 muscles × 4 weeks
  // Colors: 0=empty, <MEV=red, MEV-MAV=green gradient, >MRV=purple
  const mev = {Brust:10,Latissimus:10,Schultern:8,Bizeps:6,Trizeps:6,Quadrizeps:8,Gesäß:6,Beinbeuger:6,Waden:6,Bauch:4,Trapez:4,Unterarme:2};
  const mrv = {Brust:22,Latissimus:25,Schultern:20,Bizeps:16,Trizeps:16,Quadrizeps:22,Gesäß:16,Beinbeuger:18,Waden:16,Bauch:20,Trapez:18,Unterarme:12};
  const volData = {
    Brust:    [10,12,14,14], Latissimus:[8,10,12,12], Schultern:[6,8,8,8],
    Bizeps:   [6,6,8,8],     Trizeps:   [6,8,8,8],    Quadrizeps:[4,4,6,6],
    Gesäß:    [4,4,4,4],     Beinbeuger:[4,4,4,4],    Waden:     [4,6,6,6],
    Bauch:    [0,4,4,4],     Trapez:    [4,4,6,4],    Unterarme: [0,0,2,2],
  };
  const getCellColor = (sets,m) => {
    if(!sets) return 'var(--surface-hover)';
    const mv=mev[m]||6, mr=mrv[m]||20;
    if(sets<mv) return '#fca5a5';
    const r=sets/mr;
    if(r<=.5) return '#86efac';
    if(r<=.75) return '#22c55e';
    if(r<=1) return '#15803d';
    return '#a855f7';
  };
  const muscleNames = Object.keys(volData);

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:var(--r-lg);padding:16px;color:#fff">
        <div style="font-size:var(--text-micro);color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">⚡ Training Readiness Score</div>
        <div style="display:flex;align-items:center;gap:16px">
          <div style="position:relative;width:84px;height:84px;flex-shrink:0">
            <svg width="84" height="84" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="6"/>
              <circle cx="42" cy="42" r="36" fill="none" stroke="${ringColor}" stroke-width="6"
                stroke-dasharray="${(readiness/100)*226} 226" stroke-linecap="round"
                transform="rotate(-90 42 42)"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
              <div style="font-size:22px;font-weight:800;color:${ringColor}">${readiness}</div>
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:#fff;margin-bottom:4px">${readyLabel}</div>
            <div style="font-size:var(--text-micro);color:rgba(255,255,255,.6);margin-bottom:8px;line-height:1.4">${readyAdvice}</div>
            <div style="display:flex;gap:3px;flex-wrap:wrap">
              <span style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:var(--brand-500);color:#fff">💪 Pull Day</span>
              <span style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:rgba(255,255,255,.1);color:rgba(255,255,255,.8)">85% Volumen</span>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;margin-top:12px">
          ${readinessInputs.map(r=>`
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:12px;width:18px;flex-shrink:0">${r.icon}</span>
              <span style="font-size:var(--text-micro);color:rgba(255,255,255,.6);width:80px">${r.label}</span>
              <div style="flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden">
                <div style="height:100%;width:${r.val}%;background:${r.color};border-radius:2px"></div>
              </div>
              <span style="font-size:var(--text-micro);font-weight:600;color:${r.color};width:28px;text-align:right">${r.val}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🔥 Volume Heatmap (4 Wochen)</div></div>
        <div style="overflow-x:auto">
          <div style="display:grid;grid-template-columns:80px repeat(4,1fr);gap:3px;min-width:280px;margin-bottom:4px">
            <div></div>
            ${['KW14','KW15','KW16','KW17'].map(w=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${w}</div>`).join('')}
          </div>
          ${muscleNames.map(m=>`
            <div style="display:grid;grid-template-columns:80px repeat(4,1fr);gap:3px;margin-bottom:3px">
              <div style="font-size:var(--text-micro);color:var(--text-secondary);display:flex;align-items:center;padding-right:4px">${m}</div>
              ${volData[m].map(v=>`
                <div style="aspect-ratio:1.4/1;border-radius:3px;background:${getCellColor(v,m)};display:flex;align-items:center;justify-content:center">
                  <span style="font-size:8px;color:${v>=mev[m]?'#fff':'var(--semantic-danger-text)'};font-weight:600">${v||''}</span>
                </div>`).join('')}
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap">
          ${[{c:'#fca5a5',l:'<MEV'},{c:'#86efac',l:'Low'},{c:'#22c55e',l:'Mid'},{c:'#15803d',l:'High'},{c:'#a855f7',l:'>MRV'}].map(l=>`
            <div style="display:flex;align-items:center;gap:4px;font-size:9px;color:var(--text-secondary)">
              <div style="width:10px;height:10px;border-radius:2px;background:${l.c}"></div>${l.l}
            </div>`).join('')}
        </div>
      </div>

      <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:var(--r-lg);padding:12px 14px;border:1px solid #bfdbfe">
        <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:#1d4ed8;margin-bottom:4px">💪 Pull Day empfohlen — ${readyCount} Muskeln erholt</div>
        <div style="font-size:var(--text-micro);color:#3b82f6">Latissimus 72h · Bizeps 72h · Trapez 72h — optimale Trainingszeit</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Muskel-Status</div><div class="card-grid">${readyCount}✅ ${muscles.filter(m=>m.status==='caution').length}🟡 ${muscles.filter(m=>m.status==='rest').length}🔴</div></div>
        ${muscles.map(m=>`
          <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--surface-border)">
            <span style="font-size:12px;flex-shrink:0">${m.icon}</span>
            <div style="flex:1">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${m.name}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.lastTrain} · ${m.hrs}h</div>
            </div>
            <div style="width:70px">
              <div class="progress-track" style="height:4px;margin-bottom:2px">
                <div class="progress-fill" style="width:${m.fatigue}%;background:${statusColor[m.status]}"></div>
              </div>
              <div style="font-size:var(--text-micro);font-weight:600;color:${statusColor[m.status]};text-align:right">${m.fatigue}%</div>
            </div>
            <div style="font-size:var(--text-micro);color:var(--text-secondary);width:100px;text-align:right">${m.rec}</div>
          </div>`).join('')}
      </div>

      <div class="card" style="background:linear-gradient(135deg,#fff7ed,#fffbf5);border:1px solid #fed7aa">
        <div class="card-header"><div class="card-title">⚠️ Deload-Empfehlung</div><div class="badge badge-orange">Beobachten</div></div>
        <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:8px">4 Wochen konsistentes Volumen · Push/Brust steigt seit 4W</div>
        <div style="font-size:var(--text-micro);color:#92400e;background:#fef9c3;border:1px solid #fde68a;border-radius:var(--r-sm);padding:8px;line-height:1.5">
          💡 In 1-2 Wochen Deload planen: Volumen -40%, Intensität halten. Push Day: 2×8 statt 4×8.
        </div>
      </div>
    </div>`;
};
