// features/nutrition/TrendsView.js — Kalorien-Trend 30T, Protein-Streak Kalender, 7×7 Heatmap, Makro-Qualität
// Basiert auf NutrientHeatmap.tsx + TrendAnalysis.tsx

window.Nutrition_TrendsView = function() {
  // 30-day calorie data (daily kcal)
  const calData = [1820,1950,2100,1780,2050,1840,2200,1920,1760,2040,1850,2180,1970,1820,2060,1900,2150,1840,1780,2020,1860,2100,1920,1840,1790,2080,1940,1860,1900,1840];
  const calTarget = 2100;
  const calMax = Math.max(...calData);
  const calMin = Math.min(...calData);
  const calAvg = Math.round(calData.reduce((a,b)=>a+b,0)/calData.length);

  // Protein streak: last 30 days, green = met (>150g), red = not
  const protMet = [1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1];
  let streak=0; for(let i=protMet.length-1;i>=0&&protMet[i];i--) streak++;

  // 7×7 heatmap: nutrients × days (Mo-So)
  const hmNutrients = ['Kalorien','Protein','Vitamin D','Magnesium','Ballaststoffe','Omega-3','Vitamin C'];
  const hmDays = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  const hmData = [
    [2,2,2,2,0,2,1],[2,2,1,2,1,2,2],[0,0,0,0,0,1,0],[1,2,2,1,2,2,1],
    [1,1,2,1,0,1,1],[1,1,1,2,1,1,1],[2,2,2,2,2,2,2]
  ]; // 0=miss 1=adequate 2=hit
  const hmColor = v => v===2?'var(--brand-500)':v===1?'#f59e0b':'#ef4444';
  const hmIcon  = v => v===2?'🟢':v===1?'🟡':'🔴';

  // Macro quality trend (last 4 weeks)
  const qualWeeks = ['KW14','KW15','KW16','KW17'];
  const complexCH = [72,75,78,82]; // % complex carbs
  const omega36   = [1.8,1.6,1.7,1.5]; // omega3:6 ratio

  return `
    <div style="display:flex;flex-direction:column;gap:14px">

      <div class="card">
        <div class="card-header"><div class="card-title">🔥 Kalorien-Trend — 30 Tage</div><div class="badge badge-${calAvg>calTarget?'orange':'green'}">${calAvg>calTarget?'↑':'↓'} Ø ${calAvg}</div></div>
        <div style="position:relative;height:64px;margin-bottom:8px">
          <div style="display:flex;align-items:flex-end;height:56px;gap:1px">
            ${calData.map((v,i)=>`
              <div style="flex:1;background:${v>calTarget?'#f97316':'var(--brand-400)'};border-radius:1px 1px 0 0;height:${((v-calMin)/(calMax-calMin))*50+6}px;opacity:${i===29?1:.75}"></div>`).join('')}
          </div>
          <div style="position:absolute;top:0;left:0;right:0;height:${100-(((calTarget-calMin)/(calMax-calMin))*50+6)/56*100}%;border-bottom:1.5px dashed var(--text-muted);pointer-events:none">
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
          <span>1. Apr</span>
          <span>Ziel: ${calTarget} kcal (gestrichelt)</span>
          <span>Heute: ${calData[29]}</span>
        </div>
        <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
          ${[{l:'Min',v:calMin},{l:'Max',v:calMax},{l:'Ø',v:calAvg},{l:'Über Ziel',v:calData.filter(v=>v>calTarget).length+' T'}].map(s=>`
            <div style="text-align:center"><div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${s.v}</div><div style="font-size:var(--text-micro);color:var(--text-muted)">${s.l}</div></div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">💪 Protein-Streak Kalender</div><div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--accent-nutrition)">🔥 ${streak} Tage</div></div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">Grün = ≥150g Protein · Rot = unter Ziel</div>
        <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:3px">
          ${protMet.map((v,i)=>`
            <div style="aspect-ratio:1;border-radius:3px;background:${v?'var(--brand-500)':'#fca5a5'};display:flex;align-items:center;justify-content:center" title="${i+1}. Apr">
              <span style="font-size:8px;color:#fff;font-weight:600">${i+1}</span>
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;margin-top:8px">
          <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)"><div style="width:10px;height:10px;border-radius:2px;background:var(--brand-500)"></div>Ziel erreicht</div>
          <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)"><div style="width:10px;height:10px;border-radius:2px;background:#fca5a5"></div>Unter Ziel</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🌡️ Nährstoff-Heatmap (7 Tage)</div></div>
        <div style="overflow-x:auto">
          <div style="display:grid;grid-template-columns:96px repeat(7,1fr);gap:3px;min-width:360px;margin-bottom:4px">
            <div></div>
            ${hmDays.map(d=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${d}</div>`).join('')}
          </div>
          ${hmNutrients.map((n,ni)=>`
            <div style="display:grid;grid-template-columns:96px repeat(7,1fr);gap:3px;margin-bottom:3px">
              <div style="font-size:var(--text-micro);color:var(--text-secondary);display:flex;align-items:center">${n}</div>
              ${hmData[ni].map(v=>`
                <div style="aspect-ratio:1.3/1;border-radius:3px;background:${hmColor(v)};display:flex;align-items:center;justify-content:center">
                  <span style="font-size:10px">${hmIcon(v)}</span>
                </div>`).join('')}
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📊 Makro-Qualität Trend</div></div>
        <div style="margin-bottom:12px">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:6px">Komplexe KH % (Ziel ≥ 75%)</div>
          <div style="display:flex;align-items:flex-end;height:40px;gap:4px;margin-bottom:4px">
            ${complexCH.map((v,i)=>`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
                <div style="font-size:8px;color:var(--text-muted)">${v}%</div>
                <div style="width:100%;background:${v>=75?'var(--brand-500)':'#f59e0b'};border-radius:2px 2px 0 0;height:${(v/100)*32}px"></div>
                <div style="font-size:8px;color:var(--text-muted)">${qualWeeks[i]}</div>
              </div>`).join('')}
          </div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">Trend: ↑ Qualität verbessert (+10% in 4W)</div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:6px">Omega-3:6 Ratio (Ziel 1:4 oder besser)</div>
          <div style="display:flex;align-items:center;gap:8px">
            ${omega36.map((v,i)=>`
              <div style="flex:1;text-align:center">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${v<=4?'var(--brand-700)':'var(--semantic-warning-text)'}">1:${v}</div>
                <div style="font-size:9px;color:var(--text-muted)">${qualWeeks[i]}</div>
              </div>`).join('')}
          </div>
          <div style="font-size:var(--text-micro);color:var(--semantic-warning-text);margin-top:4px">⚠️ Omega-3 noch zu niedrig — mehr Lachs/Fischöl</div>
        </div>
      </div>
    </div>`;
};
