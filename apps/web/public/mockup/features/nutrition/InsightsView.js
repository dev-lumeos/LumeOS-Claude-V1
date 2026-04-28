// features/nutrition/InsightsView.js — COMPLETE REBUILD
// Mirrors: InsightsView + MacroDetail + NutritionScoreCard + TrendAnalysis + SPEC_09_SCORING
// Score Breakdown (Formel), Makro-Detail (hierarchisch), Mikronährstoffe Tier 1+2 (Ampel), Trends

window.Nutrition_InsightsView = function() {
  // Score from SPEC_09 formula (intermediate × 0.90)
  const scoreBreakdown = [
    {name:'Protein',      comp:0.94, weight:0.30, pts:28.2, color:'#3b82f6'},
    {name:'Kalorien',     comp:0.88, weight:0.25, pts:22.0, color:'#f59e0b'},
    {name:'Kohlenhydrate',comp:0.82, weight:0.15, pts:12.3, color:'#eab308'},
    {name:'Fett',         comp:0.91, weight:0.15, pts:13.7, color:'#f97316'},
    {name:'Ballaststoffe',comp:0.71, weight:0.15, pts:8.0,  color:'#ef4444'},
  ];
  const totalScore = 84;

  const vitamine = [
    {name:'Vitamin A',  pct:72,  val:'864µg', rda:'1200µg', sev:'warn'},
    {name:'Vitamin D',  pct:62,  val:'5µg',   rda:'20µg',   sev:'critical', detail:'Supplement deckt nur 50% — Tageslicht empfohlen'},
    {name:'Vitamin E',  pct:94,  val:'12mg',  rda:'13mg',   sev:'ok'},
    {name:'Vitamin K',  pct:88,  val:'88µg',  rda:'100µg',  sev:'ok'},
    {name:'Vitamin C',  pct:112, val:'90mg',  rda:'80mg',   sev:'surplus'},
    {name:'Vitamin B1', pct:95,  val:'1.14mg',rda:'1.2mg',  sev:'ok'},
    {name:'Vitamin B2', pct:98,  val:'1.37mg',rda:'1.4mg',  sev:'ok'},
    {name:'Vitamin B3', pct:91,  val:'14mg',  rda:'15mg',   sev:'ok'},
    {name:'Vitamin B6', pct:78,  val:'1.17mg',rda:'1.5mg',  sev:'warn'},
    {name:'Vitamin B12',pct:100, val:'3µg',   rda:'3µg',    sev:'ok'},
  ];
  const minerale = [
    {name:'Calcium',  pct:74,  val:'740mg', rda:'1000mg',sev:'warn'},
    {name:'Eisen',    pct:92,  val:'8.3mg', rda:'10mg',  sev:'ok'},
    {name:'Magnesium',pct:88,  val:'353mg', rda:'400mg', sev:'ok', detail:'inkl. Supplement: 753mg ✅'},
    {name:'Phosphor', pct:98,  val:'980mg', rda:'1000mg',sev:'ok'},
    {name:'Kalium',   pct:71,  val:'2840mg',rda:'4000mg',sev:'warn'},
    {name:'Zink',     pct:95,  val:'9.5mg', rda:'10mg',  sev:'ok'},
  ];
  const sevColor = {ok:'var(--brand-500)',warn:'#f59e0b',critical:'#ef4444',surplus:'#3b82f6'};
  const sevBg    = {ok:'var(--semantic-success-bg)',warn:'var(--semantic-warning-bg)',critical:'var(--semantic-danger-bg)',surplus:'var(--semantic-info-bg)'};
  const sevIcon  = {ok:'✅',warn:'⚠️',critical:'🔴',surplus:'📈'};

  const renderMicro = (n) => `
    <div style="padding:7px 0;border-bottom:1px solid var(--surface-border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="font-size:12px;flex-shrink:0">${sevIcon[n.sev]}</span>
        <div style="flex:1;font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${n.name}</div>
        <div style="text-align:right;flex-shrink:0">
          <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${sevColor[n.sev]}">${n.pct}%</span>
          <span style="font-size:var(--text-micro);color:var(--text-muted);margin-left:4px">${n.val} / ${n.rda}</span>
        </div>
      </div>
      <div class="progress-track" style="height:4px">
        <div class="progress-fill" style="width:${Math.min(n.pct,100)}%;background:${sevColor[n.sev]}"></div>
      </div>
      ${n.detail?`<div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:3px">→ ${n.detail}</div>`:''}
    </div>`;

  const weekData = [87.2,86.8,86.5,86.1,85.8,85.6,85.2];
  const scoreData=[81,79,84,86,81,83,84];

  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card" style="border:1px solid ${totalScore>=80?'var(--brand-300)':totalScore>=50?'#fde68a':'#fca5a5'}">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
            <div style="position:relative;width:72px;height:72px;flex-shrink:0">
              <div style="width:72px;height:72px;border-radius:50%;background:conic-gradient(${totalScore>=80?'var(--brand-500)':totalScore>=50?'#f59e0b':'#ef4444'} 0% ${totalScore}%,var(--surface-hover) ${totalScore}% 100%)"></div>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:var(--surface-card);display:flex;flex-direction:column;align-items:center;justify-content:center">
                <div style="font-size:16px;font-weight:var(--fw-bold);color:var(--text-primary);line-height:1">${totalScore}</div>
                <div style="font-size:8px;color:var(--text-muted)">/100</div>
              </div>
            </div>
            <div style="flex:1">
              <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Nutrition Score — ${totalScore>=80?'✅ Ziele erfüllt':totalScore>=50?'⚠️ Verbesserungsbedarf':'🔴 Ziele weit verfehlt'}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">Level: Intermediate (Faktor ×0.90) · gewichtete Compliance</div>
            </div>
          </div>
          <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;border:1px solid var(--surface-border)">
            <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:6px;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid var(--surface-border)">
              ${['Makro','Compliance','× Gewicht','Punkte'].map(h=>`<div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase">${h}</div>`).join('')}
            </div>
            ${scoreBreakdown.map(s=>`
              <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:6px;padding:4px 0;align-items:center;border-bottom:1px solid var(--surface-border)">
                <div style="display:flex;align-items:center;gap:5px">
                  <div style="width:8px;height:8px;border-radius:2px;background:${s.color}"></div>
                  <span style="font-size:var(--text-xs);color:var(--text-primary)">${s.name}</span>
                </div>
                <div style="text-align:right">
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${s.comp>=0.9?'var(--brand-700)':s.comp>=0.7?'#f59e0b':'#ef4444'}">${Math.round(s.comp*100)}%</span>
                  <div class="progress-track" style="width:50px;height:3px;margin-top:2px"><div class="progress-fill" style="width:${s.comp*100}%;background:${s.color}"></div></div>
                </div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">× ${s.weight}</div>
                <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary);text-align:right">${s.pts}</div>
              </div>`).join('')}
            <div style="display:flex;justify-content:space-between;padding-top:6px;font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">
              <span>Gesamt</span><span style="color:var(--brand-700)">${scoreBreakdown.reduce((a,s)=>a+s.pts,0).toFixed(1)} Punkte</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">🔍 Makro-Detail</div><div class="badge badge-blue">aufklappbar</div></div>
          ${[
            {name:'💪 Protein',   total:'142g',target:'170g',pct:84,color:'#3b82f6',
             rows:[
               {n:'🍗 Hähnchen',v:'46g',pct:32},{n:'🥛 Whey',v:'22g',pct:16},{n:'🥚 Eier',v:'18g',pct:13},
               {n:'🐟 Lachs',v:'14g',pct:10},{n:'🥗 Andere',v:'42g',pct:29}],
             note:'Aminosäuren: Leucin 12.4g/14g (89%) ✅ · BCAA 28g/35g (80%) ⚠️ · Fehlen: 28g'},
            {name:'🌾 Kohlenhydrate',total:'198g',target:'240g',pct:83,color:'#f59e0b',
             rows:[
               {n:'Zucker',v:'42g',pct:21,warn:true},{n:'Stärke',v:'134g',pct:68},{n:'Ballaststoffe',v:'22g',pct:11}],
             note:'Qualität: Komplex 78% ✅ · Einfach 22% · Zucker-Limit: 42g/50g ⚠️'},
            {name:'🫒 Fett',      total:'62g', target:'70g', pct:89,color:'#f97316',
             rows:[
               {n:'Gesättigte FS',v:'18g',pct:29},{n:'Einfach unges.',v:'28g',pct:45},{n:'Mehrfach unges.',v:'16g',pct:26}],
             note:'Omega-3: 2.1g/3g (70%) ⚠️ → EPA/DHA nur 0.8g · Omega-6: 13.9g · Ratio 1:6.6 (Ziel 1:4)'},
            {name:'🫘 Ballaststoffe',total:'22g',target:'30g',pct:73,color:'#6366f1',
             rows:[
               {n:'🫘 Hülsenfrüchte',v:'8g',pct:36},{n:'🥦 Gemüse',v:'7g',pct:32},{n:'🌾 Vollkorn',v:'5g',pct:23},{n:'🍎 Obst',v:'2g',pct:9}],
             note:'Noch 8g offen → 1 Apfel + 30g Haferflocken abends'},
          ].map(m=>`
            <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);margin-bottom:6px;overflow:hidden">
              <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;background:var(--surface-card-alt)"
                onclick="(function(el){const c=el.nextElementSibling;c.style.display=c.style.display==='none'?'block':'none'})(this)">
                <div style="flex:1">
                  <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${m.name}</div>
                  <div class="progress-track" style="height:4px;margin-top:4px;width:100px"><div class="progress-fill" style="width:${m.pct}%;background:${m.color}"></div></div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${m.total}</span>
                  <span style="font-size:var(--text-micro);color:var(--text-muted)"> / ${m.target} (${m.pct}%)</span>
                </div>
                <span style="color:var(--text-muted)">›</span>
              </div>
              <div style="display:none;padding:10px 12px;border-top:1px solid var(--surface-border)">
                ${m.rows.map(r=>`
                  <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--surface-border)">
                    <div style="font-size:var(--text-xs);color:var(--text-secondary);flex:1">${r.n}</div>
                    <div style="width:80px;height:4px;background:var(--surface-hover);border-radius:2px;overflow:hidden"><div style="height:100%;width:${r.pct}%;background:${m.color}"></div></div>
                    <div style="font-size:var(--text-micro);color:var(--text-muted);width:30px;text-align:right">${r.pct}%</div>
                    <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);width:36px;text-align:right">${r.v}</div>
                    ${r.warn?'<span style="font-size:11px">⚠️</span>':''}
                  </div>`).join('')}
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:6px;line-height:1.4">→ ${m.note}</div>
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">🔬 Vitamine (Tier 1 Essential)</div></div>
          ${vitamine.map(renderMicro).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">🪨 Mineralstoffe (Tier 1 Essential)</div></div>
          ${minerale.map(renderMicro).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">7-Tage Trends</div></div>
          <div style="margin-bottom:12px">
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Gewicht (kg)</div>
            <div style="display:flex;align-items:flex-end;height:40px;gap:3px;margin-bottom:2px">
              ${weekData.map((v,i)=>`<div style="flex:1;background:${i===6?'var(--brand-600)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-84)/(88-84))*36}px"></div>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--text-muted)"><span>${weekData[0]}</span><span>↓ -1.0 kg</span><span>${weekData[6]}</span></div>
          </div>
          <div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Score (7 Tage)</div>
            <div style="display:flex;align-items:flex-end;height:36px;gap:3px">
              ${scoreData.map((v,i)=>`<div style="flex:1;background:${i===6?'var(--brand-600)':v>=85?'var(--brand-300)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-70)/30)*32}px"></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">📊 Wöchentliche Stats</div></div>
          ${[
            {l:'Ø Kalorien/Tag',v:'1.840 kcal',d:'↓ -120 vs. Plan',up:false},
            {l:'Ø Protein/Tag', v:'142g',       d:'↑ +8g vs. VW',   up:true},
            {l:'Protein-Streak',v:'12 Tage',    d:'↑ Best: 14T',    up:true},
            {l:'Plan-Compliance',v:'60%',        d:'3/5 bestätigt',  up:false},
          ].map(r=>`
            <div class="data-row">
              <div class="data-label">${r.l}</div>
              <div style="text-align:right">
                <div class="data-val">${r.v}</div>
                <div class="stat-delta ${r.up?'delta-up':'delta-dn'}">${r.d}</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">🔍 Micro Defizite</div></div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">Ø letzte 7 Tage</div>
          ${[
            {n:'Vitamin D',pct:58,c:'#ef4444'},{n:'Calcium',pct:71,c:'#f97316'},
            {n:'Vitamin A',pct:74,c:'#f59e0b'},{n:'Kalium',pct:72,c:'#f59e0b'},
            {n:'Vitamin B6',pct:76,c:'#f59e0b'},
          ].map(m=>`
            <div style="margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);margin-bottom:2px">
                <span style="color:var(--text-secondary)">${m.n}</span>
                <span style="color:${m.c};font-weight:600">${m.pct}% RDA</span>
              </div>
              <div class="progress-track" style="height:4px"><div class="progress-fill" style="width:${m.pct}%;background:${m.c}"></div></div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
};
