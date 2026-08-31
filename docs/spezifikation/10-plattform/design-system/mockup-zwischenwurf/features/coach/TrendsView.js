// features/coach/TrendsView.js
// AI Coach · Trends: Health Score 30T, Score-Breakdown (4 Pillar), Body Composition, Insights

window.Coach_TrendsView = function() {
  const scores = [72,75,78,74,81,83,79,76,82,85,80,78,84,86,82,79,83,87,84,81,86,88,85,82,87,83,80,84,88,87];
  const maxS = Math.max(...scores);
  const avg = Math.round(scores.reduce((a,b)=>a+b)/scores.length);
  const pillars = [
    {name:'Schlaf',     score:82,weight:25,color:'var(--accent-recovery)',delta:'+3'},
    {name:'Training',   score:85,weight:25,color:'var(--accent-training)', delta:'+6'},
    {name:'Ernährung',  score:78,weight:25,color:'var(--accent-nutrition)',delta:'+2'},
    {name:'Recovery',   score:76,weight:25,color:'var(--accent-coach)',    delta:'+1'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Health Score — 30 Tage</div><div class="badge badge-green">Ø ${avg}</div></div>
      <div style="display:flex;align-items:flex-end;height:72px;gap:2px;margin-bottom:8px">
        ${scores.map((s,i)=>`
          <div style="flex:1;background:${i===scores.length-1?'var(--brand-600)':s>=85?'var(--brand-200)':s>=75?'var(--brand-100)':'var(--surface-hover)'};border-radius:2px 2px 0 0;height:${(s/maxS)*68}px"></div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>28. März</span><span>Ø ${avg} · Trend: ↑</span><span>Heute: ${scores[scores.length-1]}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Score Breakdown — 4 Säulen</div></div>
      ${pillars.map(p=>`
        <div style="margin-bottom:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:10px;height:10px;border-radius:2px;background:${p.color}"></div>
              <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${p.name}</span>
              <span style="font-size:var(--text-micro);color:var(--text-muted)">(${p.weight}%)</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:var(--text-micro);color:var(--brand-700);font-weight:var(--fw-semibold)">${p.delta} vs. VW</span>
              <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${p.score}/100</span>
            </div>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${p.score}%;background:${p.color}"></div>
          </div>
        </div>`).join('')}
      <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;border:1px solid var(--surface-border);margin-top:4px">
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Gewichteter Gesamt-Score</div>
        <div style="font-size:20px;font-weight:var(--fw-bold);color:var(--brand-700)">80.3 / 100</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Körper-Komposition Trend</div><div class="badge badge-orange">30 Tage</div></div>
      <div style="margin-bottom:12px">
        <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:6px">Gewicht (kg)</div>
        <div style="display:flex;align-items:flex-end;height:44px;gap:3px">
          ${[88.2,87.8,87.4,87.1,86.8,86.4,86.1,85.8,85.4,85.2].map((v,i)=>`
            <div style="flex:1;background:${i===9?'var(--brand-600)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-84)/(89-84))*40}px"></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted);margin-top:3px">
          <span>88.2 kg</span><span>-3.0 kg in 30T</span><span>85.2 kg</span>
        </div>
      </div>
      <div class="data-row"><div class="data-label">Körperfett</div><div class="data-val">~18% <span style="font-size:var(--text-micro);color:var(--brand-700)">↓ -0.5%</span></div></div>
      <div class="data-row"><div class="data-label">Muskelmasse</div><div class="data-val">69.9 kg <span style="font-size:var(--text-micro);color:var(--brand-700)">↑ +0.3 kg</span></div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Top AI-Insights</div></div>
      ${[
        {icon:'💡',text:'Dein Score ist Montags im Schnitt 6 Punkte niedriger — Wochenend-Muster erkannt'},
        {icon:'📈',text:'Seit Ashwagandha (14 Tage): HRV +4ms, Ruhepuls -2bpm im Vergleich'},
        {icon:'🎯',text:'Beste Workout-Leistung nach 7h+ Schlaf — Korrelation r=0.91'},
      ].map(i=>`
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:16px;flex-shrink:0">${i.icon}</span>
          <span style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.5">${i.text}</span>
        </div>`).join('')}
    </div>
  `;
};
