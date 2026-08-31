// features/nutrition/MealPlansView.js — NEW
// Mirrors: src/features/nutrition/components/MealPlanView.tsx + SPEC_04_FEATURES Feature 7
// Plan-Liste (alle Quellen), aktiver Plan + Compliance, Plan-Detail Accordion, Lifecycle-Picker

window.Nutrition_MealPlansView = function() {
  const plans = [
    {id:'p1',name:'Hypertrophie Woche 3',     source:'user',   kcal:2100,days:12,status:'active',
     compliance:60,confirmed:3,deviated:1,skipped:1,pending:2,cycle:'Tag 3/12',
     desc:'Lean Bulk mit hohem Protein · 4 Mahlzeiten/Tag'},
    {id:'p2',name:'Lean Bulk 12 Wochen',      source:'marketplace',kcal:2400,days:84,status:'available',
     badge:'Marketplace',badgeColor:'#f97316',desc:'Von Tom Müller · 12 Wochen strukturierter Bulk'},
    {id:'p3',name:'Coach Mueller — Schneider', source:'coach', kcal:2200,days:28,status:'available',
     badge:'Von Coach Mueller',badgeColor:'#3b82f6',desc:'Personalisierter Plan · 4 Wochen'},
    {id:'p4',name:'Buddy AI — Defizit Plan',  source:'buddy', kcal:1900,days:14,status:'completed',
     badge:'AI erstellt',badgeColor:'var(--brand-600)',desc:'Abgeschlossen: 14/14 Tage · Score Ø 87'},
  ];
  const activePlan = plans[0];

  const sourceColors = {user:'var(--surface-hover)',marketplace:'#fff7ed',coach:'#eff6ff',buddy:'#f0fdf4'};
  const statusBadge  = {active:'badge-green',available:'badge-gray',completed:'badge-gray'};
  const statusLabel  = {active:'✅ Aktiv',available:'Verfügbar',completed:'✓ Abgeschlossen'};

  const dayItems = [
    {day:1,name:'Tag 1 — Höhes Protein',kcal:2150,items:{breakfast:'Haferflocken + Whey (570 kcal)',lunch:'Hähnchen + Reis + Broccoli (680 kcal)',snack:'Magerquark + Beeren (220 kcal)',dinner:'Lachs + Süßkartoffel (440 kcal)',snack2:'Casein Shake (240 kcal)'}},
    {day:2,name:'Tag 2 — Moderate KH',  kcal:2080,items:{breakfast:'Eier + Avocado Toast (480 kcal)',lunch:'Thunfisch + Quinoa (620 kcal)',snack:'Nüsse + Apfel (230 kcal)',dinner:'Hähnchen + Gemüse (520 kcal)',snack2:'Whey Shake (230 kcal)'}},
    {day:3,name:'Tag 3 — Heute',        kcal:2100,items:{breakfast:'Haferflocken + Banane + Whey (580 kcal)',lunch:'Hähnchen + Reis + Broccoli (680 kcal)',snack:'Magerquark + Beeren (220 kcal)',dinner:'Geplant: Lachs + Süßkartoffel (440 kcal)',snack2:'Geplant: Casein (180 kcal)'}},
  ];

  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card" style="border:2px solid var(--brand-300);background:linear-gradient(135deg,var(--brand-50),#fff)">
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${activePlan.name}</div>
                <span class="badge badge-green">✅ Aktiv</span>
              </div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${activePlan.desc} · ${activePlan.cycle}</div>
            </div>
          </div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary)">Plan-Compliance heute</span>
              <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--brand-700)">${activePlan.compliance}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${activePlan.compliance}%;background:var(--brand-500)"></div></div>
            <div style="display:flex;gap:12px;margin-top:6px;flex-wrap:wrap">
              ${[
                {n:`${activePlan.confirmed} bestätigt`,c:'var(--brand-700)'},
                {n:`${activePlan.deviated} abweichend`,c:'#f59e0b'},
                {n:`${activePlan.skipped} übersprungen`,c:'var(--semantic-danger-text)'},
                {n:`${activePlan.pending} offen`,c:'var(--text-muted)'},
              ].map(s=>`<span style="font-size:var(--text-micro);color:${s.c};font-weight:var(--fw-medium)">${s.n}</span>`).join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">
            ${[{l:'kcal/Tag',v:`${activePlan.kcal}`},{l:'Dauer',v:`${activePlan.days}T`},{l:'Protein',v:'170g'},{l:'Score Ø',v:'87'}].map(k=>`
              <div style="background:rgba(22,163,74,.08);border-radius:var(--r-md);padding:8px;text-align:center">
                <div style="font-size:12px;font-weight:var(--fw-bold);color:var(--brand-700)">${k.v}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${k.l}</div>
              </div>`).join('')}
          </div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);margin-bottom:8px">Tages-Plan (Accordion)</div>
          ${dayItems.map(d=>`
            <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);margin-bottom:4px;overflow:hidden">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:${d.day===3?'var(--brand-50)':'var(--surface-card-alt)'};cursor:pointer"
                onclick="(function(el){const c=el.nextElementSibling;c.style.display=c.style.display==='none'?'block':'none'})(this)">
                <div>
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:${d.day===3?'var(--brand-700)':'var(--text-primary)'}">${d.name}</span>
                  ${d.day===3?'<span style="font-size:var(--text-micro);color:var(--brand-600);margin-left:6px">← Heute</span>':''}
                </div>
                <span style="font-size:var(--text-micro);color:var(--text-muted)">${d.kcal} kcal · ›</span>
              </div>
              <div style="display:${d.day===3?'block':'none'};padding:10px 12px;background:var(--surface-card)">
                ${Object.values(d.items).map(item=>`<div style="font-size:var(--text-micro);color:var(--text-secondary);padding:3px 0;border-bottom:1px solid var(--surface-border)">${item}</div>`).join('')}
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Alle Pläne</div><div class="badge badge-gray">${plans.length} Pläne</div></div>
          ${plans.slice(1).map(p=>`
            <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border);background:${sourceColors[p.source]||'transparent'};margin:0 -4px;padding-left:4px;padding-right:4px">
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${p.name}</span>
                  ${p.badge?`<span style="font-size:var(--text-micro);padding:1px 6px;border-radius:var(--r-full);background:${p.badgeColor}20;color:${p.badgeColor};border:1px solid ${p.badgeColor}40;font-weight:var(--fw-semibold)">${p.badge}</span>`:''}
                </div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">${p.desc}</div>
                <div style="font-size:var(--text-micro);color:var(--text-secondary)">${p.kcal} kcal/Tag · ${p.days} Tage</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
                <div class="badge ${statusBadge[p.status]}">${statusLabel[p.status]}</div>
                ${p.status==='available'?`<div style="font-size:var(--text-micro);padding:4px 8px;border-radius:var(--r-sm);background:var(--brand-600);color:#fff;cursor:pointer;text-align:center">Aktivieren</div>`:''}
              </div>
            </div>`).join('')}
          <div style="margin-top:10px;display:flex;gap:6px">
            <div style="flex:1;padding:8px;border-radius:var(--r-md);background:var(--brand-600);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);text-align:center;cursor:pointer">+ Neuen Plan erstellen</div>
            <div style="flex:1;padding:8px;border-radius:var(--r-md);background:#f3e8ff;color:#7c3aed;font-size:var(--text-xs);font-weight:var(--fw-semibold);text-align:center;cursor:pointer">✨ AI generieren</div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">🔄 Lifecycle Aktiver Plan</div></div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:10px">Was passiert nach Tag 12?</div>
          ${[
            {id:'once',     label:'Einmalig',        desc:'Endet nach 12 Tagen', active:true},
            {id:'rollover', label:'Wiederholend',    desc:'Startet automatisch neu (Day 1)'},
            {id:'sequence', label:'Gefolgt von…',    desc:'→ Lean Bulk Plan aktivieren'},
          ].map(l=>`
            <div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${l.active?'var(--brand-600)':'var(--surface-border)'};background:${l.active?'var(--brand-600)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
                ${l.active?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
              </div>
              <div>
                <div style="font-size:var(--text-xs);font-weight:${l.active?'var(--fw-semibold)':'var(--fw-normal)'};color:${l.active?'var(--text-primary)':'var(--text-muted)'}">${l.label}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${l.desc}</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">📊 Plan-Statistiken</div></div>
          <div class="data-row"><div class="data-label">Aktiver Plan seit</div><div class="data-val">25. Apr 2026</div></div>
          <div class="data-row"><div class="data-label">Compliance gesamt</div><div class="data-val" style="color:var(--brand-700)">60%</div></div>
          <div class="data-row"><div class="data-label">Mahlzeiten bestätigt</div><div class="data-val">9 / 15</div></div>
          <div class="data-row"><div class="data-label">Offene Ghost Entries</div><div class="data-val" style="color:var(--semantic-warning-text)">2</div></div>
          <div class="data-row"><div class="data-label">Ø Kalorien (3T)</div><div class="data-val">1.987 kcal</div></div>
        </div>
      </div>
    </div>`;
};
