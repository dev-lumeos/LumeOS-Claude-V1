// features/training/LiveWorkout.js — DEEP REBUILD
// SetRow states, RestTimer (circle), ProgressiveOverloadAdvisor, PlateCalculator, PostWorkoutFeedback

window.Training_LiveWorkout = function() {
  const exercises = [
    {name:'Bankdrücken',    sets:4,reps:'8-10',kg:90,  prev:'90kg×8', done:[[90,8,'✅'],[90,8,'✅'],[92,8,'✅🏆'],[92,null,'current']],pr:true},
    {name:'Schrägbankdruck',sets:3,reps:'10-12',kg:34, prev:'30kg×10',done:[]},
    {name:'Schulterdrücken',sets:4,reps:'8-10',kg:60,  prev:'60kg×8', done:[]},
    {name:'Trizeps Pushdown',sets:3,reps:'12-15',kg:40,prev:'40kg×12',done:[]},
    {name:'Seitenheben',    sets:3,reps:'15-20',kg:14, prev:'14kg×15',done:[]},
  ];
  const currentEx = exercises[0];
  const restSecs = 105;
  const totalSecs = 90;
  const restPct = Math.round((restSecs/totalSecs)*100);
  // Plate calculator: 92kg target, 20kg bar → 72kg / 2 = 36kg per side
  // 25+10+1 = 36kg
  const plates = [{w:25,c:'#dc2626'},{w:10,c:'#16a34a'},{w:1,c:'#94a3b8'}];

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="card" style="background:linear-gradient(135deg,#fff7ed,#fff);border:2px solid var(--accent-training)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Aktives Workout</div>
            <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);color:var(--text-primary)">Push Day</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:28px;font-weight:var(--fw-bold);color:var(--accent-training);font-family:var(--font-mono)">42:18</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Laufzeit</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          ${[{v:'1/5',l:'Übung'},{v:'3/4',l:'Sets'},{v:'2.700',l:'Volumen kg'},{v:'3',l:'PRs heute'}].map(s=>`
            <div class="stat-card" style="flex:1;text-align:center;padding:8px">
              <div style="font-size:13px;font-weight:var(--fw-bold);color:var(--text-primary)">${s.v}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${s.l}</div>
            </div>`).join('')}
        </div>
      </div>

      <div style="background:linear-gradient(135deg,#fef9c3,#fefce8);border:1px solid #fde68a;border-radius:var(--r-lg);padding:10px 14px;display:flex;gap:10px;align-items:center">
        <span style="font-size:18px">📈</span>
        <div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:#92400e">Progressive Overload: +2.5kg möglich</div>
          <div style="font-size:var(--text-micro);color:#78350f">3× 90kg×8 erreicht — Nächste Session: 92.5kg × 8 empfohlen</div>
        </div>
      </div>

      <div class="card" style="border:2px solid var(--accent-training)">
        <div style="font-size:var(--text-micro);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Aktuelle Übung (1/5)</div>
        <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);color:var(--text-primary);margin-bottom:3px">${currentEx.name}</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:12px">Ziel: ${currentEx.sets}×${currentEx.reps} @ ${currentEx.kg}kg · Vorher: ${currentEx.prev}</div>
        <div style="display:grid;grid-template-columns:32px 1fr 70px 70px 1fr;gap:4px;margin-bottom:6px;padding:0 2px">
          ${['Set','kg','Wdh.','Soll',''].map(h=>`<div style="font-size:var(--text-micro);color:var(--text-muted)">${h}</div>`).join('')}
        </div>
        ${currentEx.done.map((s,i)=>{
          const isCurrent = s[2]==='current';
          const isDone = s[2]?.includes('✅');
          const isPR = s[2]?.includes('🏆');
          return `
            <div style="display:grid;grid-template-columns:32px 1fr 70px 70px 1fr;gap:4px;padding:7px 2px;border-radius:${isCurrent?'var(--r-sm)':'0'};background:${isCurrent?'var(--brand-50)':isPR?'#fef9c3':'transparent'};border-bottom:1px solid var(--surface-border)">
              <div style="font-size:var(--text-sm);color:var(--text-muted)">${i+1}</div>
              <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary)">${s[0]} kg</div>
              <div style="font-size:var(--text-sm);color:${isDone?'var(--brand-700)':isCurrent?'var(--text-muted)':'var(--text-subtle)'}">${s[1]!==null?s[1]:'—'}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">8 Wdh.</div>
              <div style="display:flex;align-items:center;gap:4px">
                <span style="font-size:13px">${isDone?'✅':isCurrent?'▶️':'○'}</span>
                ${isPR?`<span style="font-size:9px;background:#fef9c3;color:#92400e;padding:1px 5px;border-radius:3px;border:1px solid #fde68a;font-weight:700">🏆 PR</span>`:''}
              </div>
            </div>`;
        }).join('')}
      </div>

      <div class="card" style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--semantic-info-text)">⏱ Rest Timer</div>
          <div style="font-size:22px;font-weight:var(--fw-bold);color:var(--semantic-info-text);font-family:var(--font-mono)">1:45</div>
        </div>
        <div class="progress-track" style="margin-bottom:4px">
          <div class="progress-fill" style="width:${restPct}%;background:var(--semantic-info-text)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--semantic-info-text)">
          <span>Empfohlen: 90 Sek</span>
          <span style="cursor:pointer;text-decoration:underline">→ Überspringen</span>
        </div>
        <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
          ${[30,60,90,120,180].map((s,i)=>`<div style="padding:3px 8px;border-radius:var(--r-full);background:${i===2?'var(--semantic-info-text)':'var(--surface-card)'};color:${i===2?'#fff':'var(--semantic-info-text)'};font-size:var(--text-micro);cursor:pointer;border:1px solid var(--semantic-info-text)">${s}s</div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🏋️ Scheiben-Rechner</div><div class="badge badge-gray">92 kg Ziel</div></div>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:10px">20kg Olympia-Stange · Pro Seite: 36kg</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:2px;padding:10px;background:var(--surface-card-alt);border-radius:var(--r-md);margin-bottom:10px">
          <div style="width:8px;height:40px;background:#94a3b8;border-radius:2px 0 0 2px"></div>
          ${plates.map(p=>`<div style="background:${p.c};border-radius:3px;width:14px;height:${32+p.w*0.5}px;display:flex;align-items:center;justify-content:center"><span style="font-size:8px;color:#fff;transform:rotate(90deg);white-space:nowrap">${p.w}</span></div>`).join('')}
          <div style="width:16px;height:20px;background:#475569;border-radius:2px"></div>
          ${[...plates].reverse().map(p=>`<div style="background:${p.c};border-radius:3px;width:14px;height:${32+p.w*0.5}px;display:flex;align-items:center;justify-content:center"><span style="font-size:8px;color:#fff;transform:rotate(90deg);white-space:nowrap">${p.w}</span></div>`).join('')}
          <div style="width:8px;height:40px;background:#94a3b8;border-radius:0 2px 2px 0"></div>
        </div>
        <div style="font-size:var(--text-xs);text-align:center;color:var(--text-secondary)">25 + 10 + 1 = 36kg × 2 + 20kg Bar = <strong>92 kg</strong></div>
      </div>

      <div class="card" style="background:var(--surface-hover)">
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Nächste Übung (2/5)</div>
        <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary)">Schrägbankdrücken — 3×10-12 @ 34 kg</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">Vorher: 30kg×10, 30kg×9, 28kg×10</div>
      </div>

      <div style="text-align:center">
        <div style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:var(--r-md);background:var(--semantic-danger-bg);color:var(--semantic-danger-text);font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer;border:1px solid var(--semantic-danger-border)">🏁 Workout abschliessen</div>
      </div>
    </div>`;
};
