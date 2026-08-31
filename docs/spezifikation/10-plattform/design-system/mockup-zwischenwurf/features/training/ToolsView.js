// features/training/ToolsView.js
// Training → Tools: 1RM-Rechner, Aufwärm-Rechner, Scheiben-Rechner

window.Training_ToolsView = function() {
  // 1RM calc: 92kg × 8
  const w=92,r=8;
  const epley =Math.round(w*(1+r/30)*10)/10;
  const brzycki=Math.round(w*(36/(37-r))*10)/10;
  const lander =Math.round((100*w)/(101.3-2.67123*r)*10)/10;
  const avg    =Math.round((epley+brzycki+lander)/3*10)/10;
  const pctTable=[{p:100,rep:'1'},{p:95,rep:'2'},{p:90,rep:'3-4'},{p:85,rep:'5-6'},{p:80,rep:'7-8'},{p:75,rep:'9-10'},{p:70,rep:'11-12'},{p:65,rep:'13-15'}];

  // Warmup: 90kg working, 20kg bar
  const ww=90,bw=20;
  const warmupSets=[
    {n:1,kg:20, reps:10,pct:'Bar only',c:'#94a3b8'},
    {n:2,kg:35, reps:8, pct:'40%',     c:'#22c55e'},
    {n:3,kg:55, reps:5, pct:'60%',     c:'#f59e0b'},
    {n:4,kg:67.5,reps:3,pct:'75%',     c:'#f97316'},
    {n:5,kg:77.5,reps:2,pct:'85%',     c:'#ef4444'},
  ];

  // Plate calc: 92kg target, 20kg bar → 36kg/side: 25+10+1
  const plates=[
    {kg:25,color:'#dc2626',hex:'🔴',count:1},
    {kg:10,color:'#16a34a',hex:'🟢',count:1},
    {kg:1,  color:'#94a3b8',hex:'⚪',count:1},
  ];

  return `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- 1RM Calculator -->
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:38px;height:38px;border-radius:var(--r-md);background:#fff7ed;display:flex;align-items:center;justify-content:center;font-size:18px">🏋️</div>
          <div><div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">1RM Rechner</div><div style="font-size:var(--text-micro);color:var(--text-muted)">Geschätztes Einwiederholungsmaximum</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          ${[{l:'Gewicht (kg)',v:w},{l:'Wiederholungen',v:r}].map(f=>`
            <div>
              <div style="font-size:var(--text-micro);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:3px">${f.l}</div>
              <div style="border:1px solid var(--accent-training);border-radius:var(--r-md);padding:10px;font-size:22px;font-weight:var(--fw-bold);text-align:center;color:var(--accent-training);background:#fff7ed">${f.v}</div>
            </div>`).join('')}
        </div>
        <div style="background:linear-gradient(135deg,var(--accent-training),#ef4444);border-radius:var(--r-lg);padding:14px;text-align:center;color:#fff;margin-bottom:10px">
          <div style="font-size:11px;opacity:.8;margin-bottom:2px">Geschätztes 1RM (Ø 3 Formeln)</div>
          <div style="font-size:32px;font-weight:900">${avg} kg</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
          ${[{n:'Epley',v:epley},{n:'Brzycki',v:brzycki},{n:'Lander',v:lander}].map(f=>`
            <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:8px;text-align:center;border:1px solid var(--surface-border)">
              <div style="font-size:14px;font-weight:var(--fw-bold);color:var(--text-primary)">${f.v}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${f.n}</div>
            </div>`).join('')}
        </div>
        <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:6px">Trainingszonen</div>
        <div style="border-radius:var(--r-md);overflow:hidden;border:1px solid var(--surface-border)">
          ${pctTable.map((row,i)=>`
            <div style="display:grid;grid-template-columns:48px 1fr 64px;gap:4px;padding:5px 8px;background:${row.p>=85?'#fef2f2':row.p>=70?'#fffbeb':'#f0fdf4'};border-bottom:${i<pctTable.length-1?'1px solid var(--surface-border)':'none'}">
              <span style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:${row.p>=85?'#ef4444':row.p>=70?'#f59e0b':'var(--brand-700)'}">${row.p}%</span>
              <span style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:var(--text-primary)">${Math.round(avg*row.p/100)} kg</span>
              <span style="font-size:var(--text-micro);color:var(--text-muted)">${row.rep} Wdh.</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Warmup Calculator -->
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:38px;height:38px;border-radius:var(--r-md);background:#fff7ed;display:flex;align-items:center;justify-content:center;font-size:18px">🔥</div>
          <div>
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Aufwärm-Rechner</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Arbeitsgewicht ${ww} kg · Stange ${bw} kg</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <div style="flex:1;display:flex;align-items:center;justify-content:space-between;background:var(--surface-card-alt);border:1px solid var(--surface-border);border-radius:var(--r-md);padding:8px 12px">
            <span style="font-size:var(--text-micro);color:var(--text-muted)">Arbeitsgewicht</span>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:18px;cursor:pointer;color:var(--text-muted)">−</span>
              <span style="font-size:var(--text-xl);font-weight:var(--fw-bold);color:var(--accent-training)">${ww} kg</span>
              <span style="font-size:18px;cursor:pointer;color:var(--text-muted)">+</span>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${warmupSets.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;background:#fff7ed;border-radius:var(--r-md);padding:8px 12px">
              <div style="width:24px;height:24px;border-radius:50%;background:${s.c};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${s.n}</div>
              <div style="flex:1">
                <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${s.kg} kg</span>
                <span style="font-size:var(--text-xs);color:var(--text-muted);margin-left:4px">× ${s.reps} Wdh.</span>
              </div>
              <span style="font-size:var(--text-micro);padding:2px 6px;border-radius:var(--r-full);background:${s.c}20;color:${s.c};font-weight:700">${s.pct}</span>
            </div>`).join('')}
        </div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center;margin-top:8px">Aufwärm-Volumen: ${warmupSets.reduce((s,ws)=>s+ws.kg*ws.reps,0)} kg</div>
      </div>

      <!-- Plate Calculator -->
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:38px;height:38px;border-radius:var(--r-md);background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:18px">⚖️</div>
          <div>
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Scheiben-Rechner</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Ziel: 92 kg · Stange: 20 kg → 36 kg/Seite</div>
          </div>
        </div>
        <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:14px;text-align:center;margin-bottom:12px;border:1px solid var(--surface-border)">
          <div style="display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap">
            <div style="width:8px;height:44px;background:#94a3b8;border-radius:3px 0 0 3px"></div>
            ${plates.map(p=>Array.from({length:p.count},()=>`<div style="background:${p.color};border-radius:3px;width:14px;height:${36+p.kg*0.5}px;display:flex;align-items:center;justify-content:center;box-shadow:1px 0 2px rgba(0,0,0,.2)"><span style="font-size:8px;color:#fff;transform:rotate(90deg);white-space:nowrap">${p.kg}</span></div>`).join('')).join('')}
            <div style="width:16px;height:24px;background:#475569;border-radius:2px"></div>
            ${plates.map(p=>Array.from({length:p.count},()=>`<div style="background:${p.color};border-radius:3px;width:14px;height:${36+p.kg*0.5}px"></div>`).join('')).join('')}
            <div style="width:8px;height:44px;background:#94a3b8;border-radius:0 3px 3px 0"></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px">
          ${plates.map(p=>`
            <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--fw-semibold)">
              <div style="width:12px;height:12px;border-radius:2px;background:${p.color}"></div>
              ${p.count}× ${p.kg}kg
            </div>`).join('')}
        </div>
        <div style="text-align:center;font-size:var(--text-sm);color:var(--text-secondary)">
          ${plates.map(p=>`${p.count}×${p.kg}`).join(' + ')} = 36 kg × 2 + 20 kg Bar = <strong style="color:var(--accent-training)">92 kg</strong>
        </div>
        <div style="display:flex;gap:4px;margin-top:10px;justify-content:center;flex-wrap:wrap">
          ${[{w:20,c:'#94a3b8',l:'20'},{w:25,c:'#dc2626',l:'25'},{w:20,c:'#2563eb',l:'20'},{w:15,c:'#ca8a04',l:'15'},{w:10,c:'#16a34a',l:'10'},{w:5,c:'#f1f5f9',l:'5'},{w:2.5,c:'#1e293b',l:'2.5'}].map(p=>`
            <div style="background:${p.c};border-radius:3px;width:12px;height:${20+p.w*0.4}px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,.1)">
              <span style="font-size:7px;color:${p.c==='#f1f5f9'?'#334155':'#fff'};transform:rotate(90deg);white-space:nowrap">${p.l}</span>
            </div>`).join('')}
          <div style="margin-left:4px;font-size:var(--text-micro);color:var(--text-muted);display:flex;align-items:flex-end">Verfügbare Scheiben</div>
        </div>
      </div>
    </div>
  `;
};
