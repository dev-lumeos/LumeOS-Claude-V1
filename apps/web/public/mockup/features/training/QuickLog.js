// features/training/QuickLog.js
// Training → Quick Log: Schnelle Set-Eingabe ohne kompletten Workout-Flow

window.Training_QuickLog = function() {
  const recentExercises = [
    {name:'Bankdrücken',    muscle:'Brust',    last:'90kg×8',  icon:'🏋️'},
    {name:'Kniebeugen',     muscle:'Beine',    last:'100kg×8', icon:'🦵'},
    {name:'Kreuzheben',     muscle:'Rücken',   last:'130kg×5', icon:'💀'},
    {name:'Schulterdrücken',muscle:'Schultern',last:'60kg×8',  icon:'💪'},
    {name:'Klimmzüge',      muscle:'Rücken',   last:'BW+15×6', icon:'🧗'},
  ];
  const loggedSets = [
    {ex:'Bankdrücken', sets:[[90,8,true],[90,8,true],[92,8,true]]},
    {ex:'Schrägbank',  sets:[[34,10,true]]},
  ];

  return `
    <div style="display:grid;grid-template-columns:1fr 260px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card">
          <div class="card-header"><div class="card-title">🔍 Übung hinzufügen</div></div>
          <div style="display:flex;gap:8px;margin-bottom:10px">
            <div style="flex:1;display:flex;align-items:center;gap:8px;background:var(--surface-card-alt);border:1px solid var(--surface-border);border-radius:var(--r-md);padding:8px 12px">
              <span style="color:var(--text-muted)">🔍</span>
              <span style="font-size:var(--text-sm);color:var(--text-muted)">Übungsname eingeben…</span>
            </div>
            <div style="padding:8px 12px;border-radius:var(--r-md);background:var(--accent-training);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer;white-space:nowrap">+ Übung</div>
          </div>
          <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Zuletzt verwendet</div>
          ${recentExercises.map(ex=>`
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--surface-border);cursor:pointer" onclick="">
              <span style="font-size:16px">${ex.icon}</span>
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${ex.name}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${ex.muscle} · Letzte Session: ${ex.last}</div>
              </div>
              <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-secondary);cursor:pointer">+ Hinzufügen</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">⚡ Schnell-Eingabe</div><div class="badge badge-orange">aktiv</div></div>
          <div style="display:grid;grid-template-columns:1fr 80px 80px 80px auto;gap:6px;align-items:center;margin-bottom:6px">
            ${['Übung','kg','Wdh.','Set-Typ',''].map(h=>`<div style="font-size:var(--text-micro);color:var(--text-muted);font-weight:var(--fw-semibold)">${h}</div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 80px 80px 80px auto;gap:6px;align-items:center;margin-bottom:8px">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--accent-training)">Bankdrücken</div>
            <div style="border:1px solid var(--surface-border);border-radius:var(--r-sm);padding:6px 8px;font-size:var(--text-sm);font-weight:var(--fw-bold);text-align:center;background:var(--surface-card)">90</div>
            <div style="border:1px solid var(--surface-border);border-radius:var(--r-sm);padding:6px 8px;font-size:var(--text-sm);font-weight:var(--fw-bold);text-align:center;background:var(--surface-card)">8</div>
            <div style="border:1px solid var(--surface-border);border-radius:var(--r-sm);padding:5px 6px;font-size:var(--text-xs);background:var(--surface-card)">
              <select style="width:100%;border:none;outline:none;font-size:var(--text-xs);background:transparent;color:var(--text-secondary)"><option>Working</option><option>Warmup</option><option>Dropset</option></select>
            </div>
            <div style="padding:6px 10px;border-radius:var(--r-sm);background:var(--brand-600);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-bold);cursor:pointer;white-space:nowrap">+ Satz</div>
          </div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">Vorheriges: 90kg×8 · Satz 3/4 aktiv</div>
        </div>

        ${loggedSets.map(g=>`
          <div class="card">
            <div class="card-header"><div class="card-title">${g.ex}</div><div class="badge badge-green">${g.sets.filter(s=>s[2]).length}/${g.sets.length} Sätze</div></div>
            ${g.sets.map((s,i)=>`
              <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--surface-border)">
                <div style="font-size:var(--text-micro);color:var(--text-muted);width:30px">S${i+1}</div>
                <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary);flex:1">${s[0]} kg × ${s[1]}</div>
                <div style="font-size:13px">${s[2]?'✅':'🔲'}</div>
              </div>`).join('')}
          </div>`).join('')}
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card" style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff">
          <div style="font-size:var(--text-micro);color:rgba(255,255,255,.5);margin-bottom:8px">SESSION TIMER</div>
          <div style="font-size:32px;font-weight:800;font-family:var(--font-mono);color:var(--accent-training);text-align:center;margin-bottom:8px">18:42</div>
          <div style="display:flex;gap:6px;justify-content:center">
            ${[{v:'6',l:'Sätze'},{v:'2',l:'Übungen'},{v:'1.080',l:'kg Vol.'}].map(s=>`
              <div style="background:rgba(255,255,255,.1);border-radius:var(--r-sm);padding:6px 8px;text-align:center">
                <div style="font-size:12px;font-weight:700;color:#fff">${s.v}</div>
                <div style="font-size:9px;color:rgba(255,255,255,.5)">${s.l}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">⏱ Rest Timer</div></div>
          <div style="font-size:22px;font-weight:var(--fw-bold);color:var(--semantic-info-text);text-align:center;font-family:var(--font-mono);margin-bottom:6px">1:45</div>
          <div class="progress-track" style="margin-bottom:8px"><div class="progress-fill" style="width:58%;background:var(--semantic-info-text)"></div></div>
          <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap">
            ${[30,60,90,120].map((s,i)=>`<div style="padding:4px 8px;border-radius:var(--r-full);font-size:var(--text-micro);cursor:pointer;background:${i===2?'var(--semantic-info-text)':'var(--surface-hover)'};color:${i===2?'#fff':'var(--text-secondary)'}">${s}s</div>`).join('')}
          </div>
        </div>
        <div style="text-align:center">
          <div style="padding:10px 20px;border-radius:var(--r-md);background:var(--semantic-danger-bg);color:var(--semantic-danger-text);font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer;border:1px solid var(--semantic-danger-border)">🏁 Session beenden</div>
        </div>
      </div>
    </div>
  `;
};
