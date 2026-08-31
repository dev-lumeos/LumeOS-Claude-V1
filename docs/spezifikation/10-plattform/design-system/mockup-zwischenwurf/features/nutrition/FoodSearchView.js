// features/nutrition/FoodSearchView.js — NEW
// Mirrors: src/features/nutrition/components/FoodSearch.tsx + SPEC_04_FEATURES Feature 2
// 5-Tab Nutrition · Suche: Quick-Access, Smart Search, Filter, Food Cards, Amount Input, Smart Suggestions

window.Nutrition_FoodSearchView = function() {
  const foods = [
    {id:'c1',custom:true, icon:'🥤',name:'Protein Shake Mix (Eigene Rezeptur)',kcal:380,p:42,kh:28,f:8, tags:['💪 High-Protein','👤 Custom']},
    {id:'c2',custom:true, icon:'🍱',name:'Post-Workout Meal Prep',           kcal:520,p:48,kh:52,f:12,tags:['🏋️ Post-Workout','👤 Custom']},
    {id:'1', custom:false,icon:'🍗',name:'Hähnchenbrust (roh)',              kcal:109,p:23,kh:0, f:1, tags:['💪 High-Protein','🥩 Fleisch']},
    {id:'2', custom:false,icon:'🐟',name:'Lachs (Atlantik, roh)',            kcal:208,p:20,kh:0, f:13,tags:['🐟 Fisch','🫒 Omega-3']},
    {id:'3', custom:false,icon:'🥛',name:'Magerquark (0.2% Fett)',           kcal:72, p:12,kh:4, f:0, tags:['💪 High-Protein','🥛 Milch']},
    {id:'4', custom:false,icon:'🌾',name:'Haferflocken (Vollkorn)',           kcal:369,p:13,kh:59,f:7, tags:['🌾 Vollkorn','🫘 High-Fiber']},
    {id:'5', custom:false,icon:'🍚',name:'Basmati Reis (gekocht)',            kcal:155,p:3, kh:35,f:0, tags:['🍚 Getreide','⚡ Fast-Carbs']},
    {id:'6', custom:false,icon:'🥦',name:'Brokkoli (roh)',                   kcal:34, p:3, kh:7, f:0, tags:['🥦 Gemüse','🫘 High-Fiber']},
    {id:'7', custom:false,icon:'🥚',name:'Ei (M, roh)',                      kcal:143,p:12,kh:1, f:10,tags:['🥚 Eier','💪 Complete-Protein']},
    {id:'8', custom:false,icon:'🍌',name:'Banane',                           kcal:88, p:1, kh:23,f:0, tags:['🍌 Obst','⚡ Fast-Carbs']},
  ];
  const customFoods = foods.filter(f=>f.custom);
  const blsFoods    = foods.filter(f=>!f.custom);
  const categories  = ['Fleisch','Fisch','Milch','Eier','Getreide','Gemüse','Obst','Hülsenfrüchte','Nüsse','Fette'];
  const dietTags    = ['Vegetarisch','Vegan','Low-Carb','Keto','High-Protein'];

  const renderFood = (f, selected=false) => `
    <div style="border:${selected?'2px solid var(--brand-500)':'1px solid var(--surface-border)'};border-radius:var(--r-lg);padding:10px 12px;background:var(--surface-card);cursor:pointer;transition:var(--transition-fast)"
      onclick="(function(el){document.querySelectorAll('.food-detail').forEach(d=>d.style.display='none');el.querySelector('.food-detail').style.display=el.querySelector('.food-detail').style.display==='none'?'block':'none'})(this.closest('[data-food]'))"
      data-food="${f.id}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:18px">${f.icon}</span>
        <div style="flex:1">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${f.name}</div>
          <div style="display:flex;gap:4px;margin-top:2px;flex-wrap:wrap">
            ${f.tags.map(t=>`<span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:var(--surface-hover);color:var(--text-muted)">${t}</span>`).join('')}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${f.kcal} kcal</div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">pro 100g</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        ${[{l:'P',v:f.p,c:'#3b82f6'},{l:'KH',v:f.kh,c:'#f59e0b'},{l:'F',v:f.f,c:'#f97316'}].map(m=>`
          <span style="font-size:var(--text-micro);font-weight:var(--fw-semibold);padding:2px 6px;border-radius:var(--r-full);background:${m.c}15;color:${m.c}">${m.v}g ${m.l}</span>`).join('')}
      </div>
      <div class="food-detail" style="display:none;margin-top:10px;border-top:1px solid var(--surface-border);padding-top:10px">
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:6px">Menge eingeben:</div>
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
          <input type="number" value="100" style="width:70px;padding:5px 8px;border:1px solid var(--surface-border);border-radius:var(--r-md);font-size:var(--text-xs)" />
          <span style="font-size:var(--text-xs);color:var(--text-muted)">g</span>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
          ${f.id==='1'?`<span style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-full);background:var(--brand-50);color:var(--brand-700);cursor:pointer;border:1px solid var(--brand-200)">1 Brust (~150g)</span><span style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-full);background:var(--brand-50);color:var(--brand-700);cursor:pointer;border:1px solid var(--brand-200)">1 Stück (~120g)</span>`:''}
          ${f.id==='8'?`<span style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-full);background:var(--brand-50);color:var(--brand-700);cursor:pointer;border:1px solid var(--brand-200)">1 mittel (~118g)</span>`:''}
        </div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">Bei 100g: ${f.kcal} kcal · ${f.p}g P · ${f.kh}g KH · ${f.f}g F</div>
        <div style="display:flex;gap:6px">
          <select style="flex:1;padding:5px 8px;border:1px solid var(--surface-border);border-radius:var(--r-md);font-size:var(--text-xs)">
            <option>Frühstück</option><option>Snack 1</option><option selected>Mittagessen</option><option>Snack 2</option><option>Abendessen</option>
          </select>
          <div style="padding:5px 12px;background:var(--brand-600);color:#fff;border-radius:var(--r-md);font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer;white-space:nowrap">+ Hinzufügen</div>
        </div>
      </div>
    </div>`;

  return `
    <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap">
      ${[
        {icon:'⭐',label:'Meist genutzt',active:false},
        {icon:'👤',label:'Eigene Foods',  active:false},
        {icon:'🔁',label:'Wie gestern',   active:false},
        {icon:'📅',label:'Aus Mealplan',  active:false},
      ].map(b=>`
        <div style="display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-full);background:var(--surface-card);border:1px solid var(--surface-border);font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);cursor:pointer">
          ${b.icon} ${b.label}
        </div>`).join('')}
    </div>

    <div class="card" style="padding:12px;margin-bottom:12px">
      <div style="display:flex;gap:8px;align-items:center">
        <div style="flex:1;display:flex;align-items:center;gap:8px;background:var(--surface-card-alt);border:1px solid var(--surface-border);border-radius:var(--r-md);padding:8px 12px">
          <span style="color:var(--text-muted)">🔍</span>
          <span style="font-size:var(--text-sm);color:var(--text-muted)">Lebensmittel suchen… (z.B. "Hähnchen", "Lachs")</span>
        </div>
        <div style="padding:8px 10px;background:var(--brand-50);border:1px solid var(--brand-200);border-radius:var(--r-md);font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--brand-700);cursor:pointer;white-space:nowrap">⚡ Smart</div>
        <div style="padding:8px 10px;background:var(--surface-card-alt);border:1px solid var(--surface-border);border-radius:var(--r-md);font-size:var(--text-xs);color:var(--text-secondary);cursor:pointer">Filter ▼</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Kategorien</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
        <div style="padding:4px 10px;border-radius:var(--r-full);background:var(--brand-600);color:#fff;font-size:var(--text-micro);font-weight:var(--fw-semibold);cursor:pointer">Alle</div>
        ${categories.map(c=>`<div style="padding:4px 10px;border-radius:var(--r-full);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-micro);cursor:pointer">${c}</div>`).join('')}
      </div>
      <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Diät-Filter</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
        ${dietTags.map(t=>`<div style="padding:4px 10px;border-radius:var(--r-full);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-micro);cursor:pointer">${t}</div>`).join('')}
      </div>
      <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Sortierung</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${['Relevanz ✓','Protein ↓','Kalorien ↑','Name A-Z'].map((s,i)=>`<div style="padding:4px 10px;border-radius:var(--r-full);background:${i===0?'var(--brand-600)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer">${s}</div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border-radius:var(--r-md);padding:10px 12px;margin-bottom:10px">
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--semantic-info-text);margin-bottom:2px">💡 Smart Suggestions</div>
        <div style="font-size:var(--text-micro);color:var(--semantic-info-text)">Empfohlen: noch 28g Protein + 260 kcal offen · Tipp: Magerquark oder Lachs</div>
      </div>
      <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">👤 Meine Foods (${customFoods.length})</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        ${customFoods.map(f=>renderFood(f)).join('')}
      </div>
      <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Alle Lebensmittel (7.140 in BLS 4.0)</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${blsFoods.map(f=>renderFood(f)).join('')}
      </div>
    </div>

    <div style="text-align:center;padding:12px 0">
      <div style="display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--fw-medium);padding:8px 16px;border-radius:var(--r-md);background:var(--surface-card);border:1px solid var(--surface-border);color:var(--text-secondary);cursor:pointer">+ Eigenes Lebensmittel anlegen</div>
    </div>`;
};
