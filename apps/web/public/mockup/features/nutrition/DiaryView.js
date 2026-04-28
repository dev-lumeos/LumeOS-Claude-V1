// features/nutrition/DiaryView.js — DEEP REBUILD
// 5 meal slots (3 states), MacroRing CSS, RemainingBar, MicroDashboard, WaterTracker, WeightTracker, 2-col

window.Nutrition_DiaryView = function() {
  const eaten=1840, goal=2100, p=142, ph=170, kh=198, khh=240, f=62, fh=70;
  const pp=Math.round(p/ph*100), kp=Math.round(kh/khh*100), fp=Math.round(f/fh*100);
  // MacroRing conic: P=35%, KH=50%, F=15% (gram-weighted)
  const pSeg=35, khSeg=85; // cumulative %
  const kcalPct=Math.round(eaten/goal*100);

  const mealSlots = [
    {id:'breakfast', icon:'🌅', name:'Frühstück',   time:'07:00', state:'logged',
     items:[{n:'Haferflocken 80g',p:10,kh:54,f:6,kcal:310},{n:'Whey Protein 30g',p:22,kh:5,f:2,kcal:128},{n:'Banane',p:1,kh:23,f:0,kcal:96}],
     total:{p:33,kh:82,f:8,kcal:534}},
    {id:'snack1',    icon:'🍎', name:'Snack 1',      time:'10:00', state:'smart', yesterday:'Nüsse + Apfel (185 kcal)'},
    {id:'lunch',     icon:'🍽️', name:'Mittagessen',  time:'12:00', state:'logged',
     items:[{n:'Hähnchenbrust 200g',p:44,kh:0,f:4,kcal:212},{n:'Basmati Reis 150g',p:4,kh:52,f:1,kcal:232},{n:'Broccoli 200g',p:5,kh:10,f:1,kcal:70}],
     total:{p:53,kh:62,f:6,kcal:514}},
    {id:'snack2',    icon:'🍌', name:'Snack 2',      time:'15:00', state:'ghost',
     planned:[{n:'Magerquark 250g',kcal:180,p:28,kh:9,f:1},{n:'Blaubeeren 100g',kcal:57,p:1,kh:14,f:0}],
     total:{p:29,kh:23,f:1,kcal:237}},
    {id:'dinner',    icon:'🌙', name:'Abendessen',   time:'18:00', state:'smart', yesterday:'Lachs + Süßkartoffel (520 kcal)'},
  ];

  const renderSlot = (slot) => {
    const borderColor = slot.state==='logged'?'var(--brand-500)':slot.state==='ghost'?'#a855f7':'var(--surface-border)';
    const borderStyle = slot.state==='ghost'?'dashed':'solid';
    return `
      <div style="border:2px ${borderStyle} ${borderColor};border-radius:var(--r-lg);padding:12px 14px;background:var(--surface-card)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:${slot.state==='logged'?'8px':'10px'}">
          <span style="font-size:16px">${slot.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${slot.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${slot.time}</div>
          </div>
          ${slot.state==='logged'?`<span class="badge badge-green">✓ geloggt</span>`:
            slot.state==='ghost'?`<span style="font-size:var(--text-micro);padding:2px 6px;border-radius:var(--r-full);background:#f3e8ff;color:#7c3aed;font-weight:600">📋 geplant</span>`:
            `<span class="badge badge-gray">leer</span>`}
        </div>
        ${slot.state==='logged'?`
          ${slot.items.map(it=>`
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:var(--text-micro);color:var(--text-secondary);border-bottom:1px solid var(--surface-border)">
              <span>${it.n}</span><span style="color:var(--text-muted)">${it.p}P·${it.kh}K·${it.f}F · ${it.kcal}kcal</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">
            <span>Total: ${slot.total.kcal} kcal</span>
            <span style="color:var(--text-muted)">${slot.total.p}g P · ${slot.total.kh}g KH · ${slot.total.f}g F</span>
          </div>
          <div style="margin-top:8px;font-size:var(--text-micro);color:var(--brand-700);cursor:pointer">+ Weitere hinzufügen</div>`:
        slot.state==='ghost'?`
          ${slot.planned.map(it=>`
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:var(--text-micro);color:#7c3aed;opacity:.8">
              <span>${it.n}</span><span>${it.kcal} kcal</span>
            </div>`).join('')}
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin:6px 0">Total: ${slot.total.kcal} kcal · ${slot.total.p}g P</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
            <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);padding:5px 10px;border-radius:var(--r-md);background:var(--brand-600);color:#fff;cursor:pointer">✓ Bestätigen</div>
            <div style="font-size:var(--text-micro);padding:5px 10px;border-radius:var(--r-md);background:#f3e8ff;color:#7c3aed;cursor:pointer">✏️ Anpassen</div>
            <div style="font-size:var(--text-micro);padding:5px 10px;border-radius:var(--r-md);background:var(--semantic-info-bg);color:var(--semantic-info-text);cursor:pointer">📷 MealCam</div>
            <div style="font-size:var(--text-micro);padding:5px 10px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-muted);cursor:pointer">✕ Skip</div>
          </div>`:
        `
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">Gestern: ${slot.yesterday}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            ${[{icon:'🔁',label:'Gleiche wie gestern',c:'#dbeafe',tc:'#1d4ed8'},{icon:'⭐',label:'Favoriten',c:'#fef9c3',tc:'#92400e'},{icon:'📷',label:'MealCam',c:'#dcfce7',tc:'#15803d'},{icon:'🔍',label:'Suchen',c:'#f3e8ff',tc:'#7c3aed'}].map(b=>`
              <div style="background:${b.c};border-radius:var(--r-md);padding:8px;cursor:pointer;text-align:center">
                <div style="font-size:14px">${b.icon}</div>
                <div style="font-size:var(--text-micro);font-weight:var(--fw-medium);color:${b.tc};margin-top:2px">${b.label}</div>
              </div>`).join('')}
          </div>`}
      </div>`;
  };

  const micros = [{n:'Vitamin D',p:62,c:'#ef4444'},{n:'Omega-3',p:74,c:'#f97316'},{n:'Magnesium',p:88,c:'#eab308'},{n:'Zink',p:95,c:'#22c55e'},{n:'B12',p:100,c:'#22c55e'}];

  return `
    <div style="display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface-card);border:1px solid var(--surface-border);border-radius:var(--r-lg);padding:10px 14px">
          <div style="font-size:16px;cursor:pointer;color:var(--text-muted);padding:0 8px">‹</div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">Montag, 27. April 2026</div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="font-size:var(--text-micro);color:var(--brand-700);font-weight:var(--fw-semibold);background:var(--brand-50);padding:2px 8px;border-radius:var(--r-full)">Heute</div>
            <div style="font-size:16px;cursor:pointer;color:var(--text-muted);padding:0 8px">›</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,var(--brand-50),var(--brand-100));border:1px solid var(--brand-200);border-radius:var(--r-lg);padding:10px 14px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:22px">🔥</span>
            <div>
              <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--brand-700)">12 Tage Protein-Streak</div>
              <div style="font-size:var(--text-micro);color:var(--brand-600)">Rekord: 14 Tage · Gesamt: 87 Tage geloggt</div>
            </div>
          </div>
          <div style="font-size:26px;font-weight:var(--fw-bold);color:var(--brand-700)">🔥🔥🔥</div>
        </div>
        <div style="border:1px solid var(--brand-200);border-left:3px solid var(--brand-500);border-radius:var(--r-lg);padding:10px 14px;background:var(--surface-card)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted)">📅 Plan: Hypertrophie Woche 3 · Tag 3/12</div>
            <span class="badge badge-green">60% Compliance</span>
          </div>
          <div class="progress-track" style="margin-bottom:4px"><div class="progress-fill" style="width:60%;background:var(--brand-500)"></div></div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">3 bestätigt · 1 abweichend · 2 Ghost Entries heute offen</div>
        </div>
        ${mealSlots.map(renderSlot).join('')}
        <div class="card">
          <div class="card-header"><div class="card-title">🔬 Mikronährstoffe heute</div><div class="badge badge-orange">3 Defizite</div></div>
          ${micros.map(m=>`
            <div class="progress-wrap">
              <div class="progress-header"><span class="progress-name">${m.n}</span><span class="progress-nums" style="color:${m.c}">${m.p}%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.min(m.p,100)}%;background:${m.c}"></div></div>
            </div>`).join('')}
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:6px">💡 Vitamin D-Mangel: Mehr Lachs, Eier oder Sonnenlicht</div>
        </div>
        <div class="card" style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:rgba(255,255,255,.9)">🌙 Tages-Zusammenfassung</div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:var(--text-micro);color:rgba(255,255,255,.5)">Score</span>
              <div style="font-size:22px;font-weight:var(--fw-bold);color:#4ade80">84</div>
            </div>
          </div>
          ${[{l:'Kalorien',a:1840,t:2100,u:'kcal'},{l:'Protein',a:142,t:170,u:'g'},{l:'Kohlenhydrate',a:198,t:240,u:'g'},{l:'Fett',a:62,t:70,u:'g'},{l:'Ballaststoffe',a:22,t:30,u:'g'}].map(m=>{
            const pct=m.a/m.t;
            const icon=pct>=0.9&&pct<=1.1?'✅':pct<0.9?'⚠️':'🔴';
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)">
              <span style="font-size:var(--text-xs);color:rgba(255,255,255,.65)">${m.l}</span>
              <span style="font-size:var(--text-xs);color:rgba(255,255,255,.9)">${icon} ${m.a}/${m.t}${m.u} (${Math.round(pct*100)}%)</span>
            </div>`;}).join('')}
          <div style="margin-top:10px;padding:8px 10px;background:rgba(22,163,74,.2);border-radius:var(--r-sm);border-left:3px solid #4ade80">
            <div style="font-size:var(--text-micro);color:#86efac;line-height:1.4">🤖 Noch 28g Protein offen — Casein-Shake? Lachs 150g (34g P + Omega-3) als Abendessen perfekt.</div>
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card" style="border:1px solid var(--brand-200);background:linear-gradient(135deg,var(--brand-50),#fff)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="position:relative;width:44px;height:44px;flex-shrink:0">
              <div style="width:44px;height:44px;border-radius:50%;background:conic-gradient(var(--brand-500) 0% 84%,var(--surface-hover) 84% 100%)"></div>
              <div style="position:absolute;inset:6px;border-radius:50%;background:var(--surface-card);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--brand-700)">84</div>
            </div>
            <div>
              <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">Nutrition Score ✅</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">Intermediate × 0.90</div>
            </div>
          </div>
          ${[{n:'Protein',p:94,c:'#3b82f6'},{n:'Kalorien',p:88,c:'#f59e0b'},{n:'KH',p:82,c:'#eab308'},{n:'Fett',p:91,c:'#f97316'},{n:'Ballaststoffe',p:71,c:'#ef4444'}].map(m=>`
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="font-size:var(--text-micro);color:var(--text-secondary);width:76px">${m.n}</span>
              <div class="progress-track" style="flex:1;height:4px"><div class="progress-fill" style="width:${m.p}%;background:${m.c}"></div></div>
              <span style="font-size:var(--text-micro);font-weight:600;color:${m.c};width:28px;text-align:right">${m.p}%</span>
            </div>`).join('')}
        </div>
        <div class="card" style="text-align:center">
          <div class="card-header"><div class="card-title">Makros heute</div></div>
          <div style="position:relative;width:120px;height:120px;margin:0 auto 12px">
            <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(#3b82f6 0% ${pSeg}%,#f59e0b ${pSeg}% ${khSeg}%,#f97316 ${khSeg}% 100%)"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:84px;height:84px;border-radius:50%;background:var(--surface-card);display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div style="font-size:16px;font-weight:var(--fw-bold);color:var(--text-primary);line-height:1">${eaten}</div>
              <div style="font-size:9px;color:var(--text-muted)">/ ${goal} kcal</div>
              <div style="font-size:9px;font-weight:600;color:var(--brand-700)">${kcalPct}%</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-around;margin-bottom:10px">
            ${[{c:'#3b82f6',n:'Protein',v:p,max:ph,pct:pp},{c:'#f59e0b',n:'KH',v:kh,max:khh,pct:kp},{c:'#f97316',n:'Fett',v:f,max:fh,pct:fp}].map(m=>`
              <div style="text-align:center">
                <div style="width:8px;height:8px;border-radius:2px;background:${m.c};margin:0 auto 2px"></div>
                <div style="font-size:10px;font-weight:700;color:var(--text-primary)">${m.v}g</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.n}</div>
                <div style="font-size:var(--text-micro);color:${m.c};font-weight:600">${m.pct}%</div>
              </div>`).join('')}
          </div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:6px">Verbleibend</div>
          <div class="progress-track" style="margin-bottom:6px">
            <div class="progress-fill" style="width:${kcalPct}%;background:var(--brand-500)"></div>
          </div>
          <div style="font-size:var(--text-micro);color:var(--brand-700);font-weight:600">${goal-eaten} kcal · ${ph-p}g P · ${khh-kh}g KH offen</div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">💧 Wasser</div><div style="font-size:var(--text-xs);color:var(--text-muted)">2.1 / 3.0 L</div></div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:6px">
            ${Array.from({length:10},(_,i)=>`
              <div style="height:28px;border-radius:4px;background:${i<7?'var(--accent-supplements)':'var(--surface-hover)'};border:1px solid ${i<7?'transparent':'var(--surface-border)'}"></div>`).join('')}
          </div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">7 von 10 Gläsern · + 3 noch bis Ziel</div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">⚖️ Gewicht</div><div class="badge badge-green">↓ Trend</div></div>
          <div style="font-size:22px;font-weight:var(--fw-bold);color:var(--text-primary);text-align:center;margin-bottom:8px">85.2 <span style="font-size:13px;color:var(--text-muted)">kg</span></div>
          <div style="display:flex;align-items:flex-end;height:40px;gap:3px;margin-bottom:6px">
            ${[87.2,86.8,86.4,86.1,85.8,85.4,85.2].map((v,i)=>`
              <div style="flex:1;background:${i===6?'var(--brand-600)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-84.5)/(87.5-84.5))*36}px"></div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)"><span>87.2</span><span>Ziel: 82 kg</span><span>85.2</span></div>
        </div>
        <div style="background:linear-gradient(135deg,#fff7ed,#fffbf5);border:1px solid #fed7aa;border-radius:var(--r-lg);padding:12px">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:#92400e;margin-bottom:6px">💡 Deficit-Suggestion</div>
          <div style="font-size:var(--text-micro);color:#78350f;line-height:1.5">Noch <strong>${ph-p}g Protein</strong> offen. Empfehlung: Lachs 150g gibt 34g P + Omega-3.</div>
        </div>
      </div>
    </div>`;
};
