// features/training/RecoveryIntel.js
// Training → Recovery Status: Readiness Score, Banister Fatigue Model, Sleep Impact, 3-Tage Forecast

window.Training_RecoveryIntel = function() {
  const readiness = 78;
  const ringColor = readiness>=80?'var(--brand-500)':readiness>=60?'#f59e0b':'#ef4444';
  const inputs = [
    {l:'Erholung',  icon:'💚',v:78,w:.30,c:'var(--brand-500)'},
    {l:'Schlaf',    icon:'😴',v:82,w:.25,c:'#3b82f6'},
    {l:'Kein Kater',icon:'🦵',v:72,w:.20,c:'#f59e0b'},
    {l:'Last Ratio',icon:'📊',v:85,w:.15,c:'#a855f7'},
    {l:'Stimmung',  icon:'🧠',v:80,w:.10,c:'#06b6d4'},
  ];
  const banister = {fitness:62.4,fatigue:41.8,performance:58.3,trend:'aufsteigend'};
  const forecast = [
    {date:'Di 28. Apr',readiness:82,workout:'Pull Day B',icon:'💪',color:'var(--brand-500)'},
    {date:'Mi 29. Apr',readiness:79,workout:'Legs Day C',icon:'🦵',color:'#f59e0b'},
    {date:'Do 30. Apr',readiness:85,workout:'Rest Day',  icon:'😴',color:'var(--brand-500)'},
  ];

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:var(--r-lg);padding:16px;color:#fff">
        <div style="font-size:var(--text-micro);color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">⚡ Training Readiness Score</div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">
          <div style="position:relative;width:84px;height:84px;flex-shrink:0">
            <svg width="84" height="84" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="6"/>
              <circle cx="42" cy="42" r="36" fill="none" stroke="${ringColor}" stroke-width="6"
                stroke-dasharray="${(readiness/100)*226} 226" stroke-linecap="round" transform="rotate(-90 42 42)"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
              <div style="font-size:22px;font-weight:800;color:${ringColor}">${readiness}</div>
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:#fff;margin-bottom:4px">Gute Form · Moderates Training</div>
            <div style="font-size:var(--text-micro);color:rgba(255,255,255,.6);margin-bottom:8px">Pull Day heute empfohlen — Rücken 72h erholt</div>
            ${inputs.map(i=>`
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                <span style="font-size:11px;width:16px">${i.icon}</span>
                <span style="font-size:var(--text-micro);color:rgba(255,255,255,.6);width:64px">${i.l}</span>
                <div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden"><div style="height:100%;width:${i.v}%;background:${i.c};border-radius:2px"></div></div>
                <span style="font-size:var(--text-micro);font-weight:600;color:${i.c};width:20px;text-align:right">${i.v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">💪 Fatigue Model (Banister)</div><div class="badge badge-green">📈 Aufsteigend</div></div>
        <div style="display:flex;gap:10px;margin-bottom:10px">
          ${[{l:'Fitness',v:banister.fitness,c:'#3b82f6'},{l:'Fatigue',v:banister.fatigue,c:'#ef4444'},{l:'Performance',v:banister.performance,c:'var(--brand-500)'}].map(b=>`
            <div style="flex:1;background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;text-align:center;border:1px solid var(--surface-border)">
              <div style="font-size:18px;font-weight:var(--fw-bold);color:${b.c}">${b.v}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${b.l}</div>
            </div>`).join('')}
        </div>
        <div style="display:flex;align-items:flex-end;height:40px;gap:3px">
          ${[48,52,55,60,58,56,61,59,62,63,60,62,banister.performance].map((v,i)=>`
            <div style="flex:1;background:${i===12?'var(--brand-500)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${(v/65)*36}px"></div>`).join('')}
        </div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:4px">Performance Index letzte 13 Sessions · Trend: steigend ↑</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">😴 Schlaf-Impact auf Leistung</div></div>
        ${[{l:'Nach gutem Schlaf (7h+)',v:12450,pct:100,c:'var(--brand-500)'},{l:'Nach schlechtem Schlaf (<7h)',v:10890,pct:87.5,c:'#ef4444'}].map(s=>`
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:var(--text-xs);color:${s.c};font-weight:var(--fw-medium)">${s.l}</span>
              <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${s.v} kg</span>
            </div>
            <div class="progress-track" style="height:8px"><div class="progress-fill" style="width:${s.pct}%;background:${s.c}"></div></div>
          </div>`).join('')}
        <div style="background:var(--semantic-info-bg);border-radius:var(--r-sm);padding:8px 10px;font-size:var(--text-micro);color:var(--semantic-info-text)">
          💡 +14% mehr Volumen nach 7h+ Schlaf · Korrelation r=0.82 (stark)
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🔮 3-Tage Bereitschafts-Forecast</div></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${forecast.map(f=>`
            <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:12px;text-align:center;border:1px solid var(--surface-border)">
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:6px">${f.date}</div>
              <div style="position:relative;width:54px;height:54px;margin:0 auto 8px">
                <svg width="54" height="54" viewBox="0 0 54 54">
                  <circle cx="27" cy="27" r="22" fill="none" stroke="var(--surface-hover)" stroke-width="5"/>
                  <circle cx="27" cy="27" r="22" fill="none" stroke="${f.color}" stroke-width="5"
                    stroke-dasharray="${(f.readiness/100)*138} 138" stroke-linecap="round" transform="rotate(-90 27 27)"/>
                </svg>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:13px;font-weight:800;color:${f.color}">${f.readiness}</div>
              </div>
              <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-primary)">${f.icon} ${f.workout}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
};
