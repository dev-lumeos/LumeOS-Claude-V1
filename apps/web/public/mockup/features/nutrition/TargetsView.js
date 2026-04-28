// features/nutrition/TargetsView.js — TDEE Breakdown, Makro-Targets, Goal Phase
// Basiert auf NutritionTargetEditor.tsx + TDEECalculator.tsx

window.Nutrition_TargetsView = function() {
  const bmr = 1890, factor = 1.55, tdee = Math.round(bmr*factor);
  const goal = 'cut', deficit = 400;
  const targetCal = tdee - deficit;
  const targets = {cal:2100,prot:170,cho:240,fat:70,fiber:30,water:3000};
  const actual  = {cal:1840,prot:142,cho:198,fat:62,fiber:22,water:2100};
  const goalPhases = [{k:'cut',l:'🔻 Cut',desc:'Kaloriendefizit'},{k:'maintain',l:'➡️ Maintain',desc:'TDEE'},{k:'bulk',l:'📈 Bulk',desc:'Überschuss'},{k:'recomp',l:'🔄 Recomp',desc:'Muskeln↑ Fett↓'}];
  const levels = [{k:'beginner',l:'Anfänger',p:'75% = Score 100'},{k:'intermediate',l:'Intermediate',p:'90% = Score 100'},{k:'advanced',l:'Advanced',p:'100% = Score 100'},{k:'elite',l:'Elite',p:'110% = Score 100'}];
  const macroSplit = [
    {n:'Protein',g:targets.prot,kcal:targets.prot*4,pct:32,c:'#3b82f6'},
    {n:'KH',     g:targets.cho, kcal:targets.cho*4,  pct:46,c:'#f59e0b'},
    {n:'Fett',   g:targets.fat, kcal:targets.fat*9,  pct:30,c:'#f97316'},
  ];

  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card" style="border:2px solid var(--brand-200)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="width:42px;height:42px;border-radius:var(--r-lg);background:var(--semantic-success-bg);display:flex;align-items:center;justify-content:center;font-size:22px">🎯</div>
            <div>
              <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Aktive Targets — von Goals</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">Intermediate · 🔻 Cut Phase · −400 kcal Defizit</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
            ${[{l:'Kalorien',v:targets.cal,u:'kcal',c:'#f97316'},{l:'Protein',v:targets.prot,u:'g',c:'#3b82f6'},{l:'Wasser',v:'3.0',u:'L',c:'var(--accent-supplements)'}].map(k=>`
              <div style="background:${k.c}15;border-radius:var(--r-md);padding:10px;text-align:center;border:1px solid ${k.c}30">
                <div style="font-size:18px;font-weight:var(--fw-bold);color:${k.c}">${k.v}<span style="font-size:11px"> ${k.u}</span></div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${k.l}</div>
              </div>`).join('')}
          </div>
          ${[{l:'Protein',v:actual.prot,t:targets.prot,c:'#3b82f6',u:'g'},{l:'Kohlenhydrate',v:actual.cho,t:targets.cho,c:'#f59e0b',u:'g'},{l:'Fett',v:actual.fat,t:targets.fat,c:'#f97316',u:'g'},{l:'Ballaststoffe',v:actual.fiber,t:targets.fiber,c:'#22c55e',u:'g'}].map(m=>`
            <div class="progress-wrap">
              <div class="progress-header">
                <span class="progress-name">${m.l}</span>
                <span class="progress-nums">${m.v}${m.u} / ${m.t}${m.u} · ${Math.round(m.v/m.t*100)}%</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.min((m.v/m.t)*100,100)}%;background:${m.c}"></div></div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">📊 TDEE Berechnung</div></div>
          ${[
            {l:'Grundumsatz (BMR)',       v:`${bmr} kcal`,note:'Mifflin-St Jeor · 182cm · 85kg · 28J'},
            {l:'Aktivitätsfaktor',        v:'× 1.55',     note:'Moderat aktiv (4-5×/Woche)'},
            {l:'TDEE (Gesamtumsatz)',     v:`${tdee} kcal`,note:'Tatsächlicher Verbrauch'},
            {l:'Defizit (Cut -15%)',      v:`−${deficit} kcal`,note:'0.4 kg/Woche erwartet'},
            {l:'Ziel-Kalorien',          v:`${targetCal} kcal`,note:'Eingestellt: 2.100 kcal'},
          ].map(r=>`
            <div class="data-row">
              <div>
                <div class="data-label">${r.l}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.note}</div>
              </div>
              <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${r.v}</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">⚡ Aktivitätslevel anpassen</div></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
            ${[{k:'sedentary',l:'Sitzend',f:'1.2'},{k:'light',l:'Leicht aktiv',f:'1.375'},{k:'moderate',l:'Moderat',f:'1.55',active:true},{k:'very',l:'Sehr aktiv',f:'1.725'},{k:'extra',l:'Extrem aktiv',f:'1.9'}].map(a=>`
              <div style="padding:8px;text-align:center;border-radius:var(--r-md);border:1px solid ${a.active?'var(--brand-500)':'var(--surface-border)'};background:${a.active?'var(--brand-50)':'var(--surface-card)'};cursor:pointer">
                <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:${a.active?'var(--brand-700)':'var(--text-secondary)'}">${a.l}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">× ${a.f}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">Goal Phase</div></div>
          ${goalPhases.map(p=>`
            <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--surface-border);cursor:pointer">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${p.k===goal?'var(--brand-600)':'var(--surface-border)'};background:${p.k===goal?'var(--brand-600)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${p.k===goal?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
              </div>
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:${p.k===goal?'var(--fw-bold)':'var(--fw-normal)'};color:${p.k===goal?'var(--brand-700)':'var(--text-secondary)'}">${p.l}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${p.desc}</div>
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Makro-Split</div></div>
          <div style="position:relative;width:80px;height:80px;margin:0 auto 12px">
            <div style="width:80px;height:80px;border-radius:50%;background:conic-gradient(#3b82f6 0% 32%,#f59e0b 32% 78%,#f97316 78% 100%)"></div>
            <div style="position:absolute;inset:12px;border-radius:50%;background:var(--surface-card)"></div>
          </div>
          ${macroSplit.map(m=>`
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div style="width:10px;height:10px;border-radius:2px;background:${m.c};flex-shrink:0"></div>
              <div style="flex:1;font-size:var(--text-xs);color:var(--text-secondary)">${m.n}</div>
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${m.g}g</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);width:28px;text-align:right">${m.pct}%</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">User Level</div></div>
          ${levels.map(l=>`
            <div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--surface-border)">
              <div style="width:14px;height:14px;border-radius:50%;border:2px solid ${l.k==='intermediate'?'var(--brand-600)':'var(--surface-border)'};background:${l.k==='intermediate'?'var(--brand-600)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
                ${l.k==='intermediate'?'<div style="width:5px;height:5px;border-radius:50%;background:#fff"></div>':''}
              </div>
              <div>
                <div style="font-size:var(--text-xs);font-weight:${l.k==='intermediate'?'var(--fw-semibold)':'var(--fw-normal)'};color:${l.k==='intermediate'?'var(--brand-700)':'var(--text-muted)'}">${l.l}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${l.p}</div>
              </div>
            </div>`).join('')}
        </div>

        <div style="background:linear-gradient(135deg,var(--brand-50),var(--brand-100));border-radius:var(--r-lg);padding:12px;border:1px solid var(--brand-200)">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--brand-700);margin-bottom:4px">💡 Von Goals gesteuert</div>
          <div style="font-size:var(--text-micro);color:var(--brand-600);line-height:1.4">Targets werden täglich von Goals berechnet und können dort angepasst werden. Adaptive TDEE: 2.520 kcal (+20 vs. Berechnung).</div>
        </div>
      </div>
    </div>`;
};
