// features/training/StrengthView.js
// Training → Kraft: StrengthSparklines (Big 4), Standards (Beginner→Elite), WorkoutComparison

window.Training_StrengthView = function() {
  const lifts = [
    {name:'Bankdrücken',    emoji:'🏋️',e1rm:117,bwX:1.38,level:'Intermediate',trend:'up',  pct:8, data:[95,100,104,107,108,112,117]},
    {name:'Kniebeugen',     emoji:'🦵',e1rm:124,bwX:1.46,level:'Intermediate',trend:'up',  pct:6, data:[100,104,108,112,115,120,124]},
    {name:'Kreuzheben',     emoji:'💀',e1rm:147,bwX:1.73,level:'Intermediate',trend:'flat', pct:1, data:[135,138,140,143,143,145,147]},
    {name:'Schulterdrücken',emoji:'💪',e1rm:79, bwX:0.93,level:'Beginner',    trend:'up',  pct:12,data:[62,65,68,70,72,75,79]},
  ];
  const standards = [
    {ex:'Bankdrücken',  scores:[0.50,0.75,1.25,1.75,2.25],current:1.38,label:'Intermediate'},
    {ex:'Kniebeugen',   scores:[0.75,1.00,1.50,2.00,2.75],current:1.46,label:'Intermediate'},
    {ex:'Kreuzheben',   scores:[1.00,1.25,1.75,2.50,3.25],current:1.73,label:'Intermediate'},
    {ex:'OHP',          scores:[0.35,0.55,0.80,1.10,1.40],current:0.93,label:'Beginner'},
  ];
  const levelColors = ['#94a3b8','#3b82f6','#22c55e','#f97316','#ef4444'];
  const levelLabels = ['Anfänger','Novice','Intermediate','Advanced','Elite'];
  const trendColor = (t) => t==='up'?'var(--brand-600)':t==='down'?'#ef4444':'#94a3b8';
  const trendIcon  = (t) => t==='up'?'↑':t==='down'?'↓':'→';

  const cmp = [
    {ex:'Bankdrücken',     prev:[[90,8],[90,8],[90,7],[87,8]],curr:[[90,8],[90,8],[92,8],[92,null]],delta:'+2kg PR 🏆'},
    {ex:'Schrägbank DB',   prev:[[30,10],[30,9],[28,10]],    curr:[[34,10],[34,9],[30,10]],         delta:'+4kg'},
    {ex:'Schulterdrücken', prev:[[60,8],[57,8]],             curr:[[60,8],[60,8]],                  delta:'→ stabil'},
  ];

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="card">
        <div class="card-header"><div class="card-title">📈 Kraftentwicklung — Sparklines (90T)</div></div>
        ${lifts.map(l=>{
          const maxD=Math.max(...l.data),minD=Math.min(...l.data);
          const pts=l.data.map((v,i)=>`${(i/(l.data.length-1))*90},${28-((v-minD)/(maxD-minD||1))*24}`).join(' ');
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
              <span style="font-size:16px;flex-shrink:0">${l.emoji}</span>
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${l.name}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">e1RM: ${l.e1rm}kg · ${l.bwX}× BW · ${l.level}</div>
              </div>
              <svg width="90" height="28" style="flex-shrink:0">
                <line x1="0" y1="${28-((l.e1rm-Math.min(...l.data))/(Math.max(...l.data)-Math.min(...l.data)||1))*24}" x2="90" y2="${28-((l.e1rm-Math.min(...l.data))/(Math.max(...l.data)-Math.min(...l.data)||1))*24}" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="2"/>
                <polyline points="${pts}" fill="none" stroke="${trendColor(l.trend)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="90" cy="${28-((l.data[6]-Math.min(...l.data))/(Math.max(...l.data)-Math.min(...l.data)||1))*24}" r="2.5" fill="${trendColor(l.trend)}"/>
              </svg>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${trendColor(l.trend)}">${trendIcon(l.trend)} ${l.pct}%</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">3 Mon</div>
              </div>
            </div>`;
        }).join('')}
        <div style="margin-top:8px;background:var(--semantic-success-bg);border-radius:var(--r-sm);padding:8px 10px;font-size:var(--text-micro);color:var(--semantic-success-text)">
          Big Three Total: 388 kg · 4.56× Körpergewicht (85 kg)
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">💪 Kraft-Standards</div><div class="badge badge-blue">85 kg KG</div></div>
        ${standards.map(s=>{
          const pctInLevel = (() => {
            let idx=0;
            for(let i=s.scores.length-1;i>=0;i--){if(s.current>=s.scores[i]){idx=i;break;}}
            const low=s.scores[idx],high=s.scores[Math.min(idx+1,s.scores.length-1)];
            return Math.round(((s.current-low)/(high-low||1))*100);
          })();
          const lvlIdx = s.scores.filter(v=>s.current>=v).length-1;
          return `
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${s.ex}</span>
                <span style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:${levelColors[lvlIdx]}">${s.label} · ${s.current}× BW</span>
              </div>
              <div style="position:relative;height:6px;background:var(--surface-hover);border-radius:3px;overflow:hidden">
                <div style="position:absolute;inset:0;display:flex">
                  ${levelColors.map(c=>`<div style="flex:1;background:${c};opacity:.15;border-right:1px solid #fff"></div>`).join('')}
                </div>
                <div style="height:100%;width:${(lvlIdx/4)*100+pctInLevel/4}%;background:linear-gradient(90deg,#8b5cf6,#6366f1);border-radius:3px"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8px;margin-top:2px">
                ${levelLabels.map((l,i)=>`<span style="color:${levelColors[i]}">${l}</span>`).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">⚖️ Session-Vergleich — letzte vs. heute</div></div>
        ${cmp.map(ex=>`
          <div style="margin-bottom:8px;border-bottom:1px solid var(--surface-border);padding-bottom:8px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${ex.ex}</span>
              <span style="font-size:var(--text-micro);color:var(--brand-700);font-weight:600">${ex.delta}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              <div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">Letzte Session</div>
                <div style="display:flex;gap:3px;flex-wrap:wrap">
                  ${ex.prev.map((s,i)=>`<span style="font-size:var(--text-micro);background:var(--surface-hover);border-radius:3px;padding:2px 5px;color:var(--text-muted)">S${i+1}:${s[0]}×${s[1]}</span>`).join('')}
                </div>
              </div>
              <div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">Heute</div>
                <div style="display:flex;gap:3px;flex-wrap:wrap">
                  ${ex.curr.map((s,i)=>`<span style="font-size:var(--text-micro);background:${ex.delta.includes('PR')?'#fef9c3':'var(--brand-50)'};border-radius:3px;padding:2px 5px;color:${ex.delta.includes('PR')?'#92400e':'var(--brand-700)'}">${s[0]}×${s[1]??'—'}${ex.delta.includes('PR')&&i===2?' 🏆':''}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
};
