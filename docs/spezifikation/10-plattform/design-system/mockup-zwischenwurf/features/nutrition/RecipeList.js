// features/nutrition/RecipeList.js — Recipe cards mit Quellen-Filter, Expand, Log/Edit/Einkaufsliste

window.Nutrition_RecipeList = function() {
  const filters = ['Alle','Eigene','Coach','Marketplace','AI'];
  const recipes = [
    {name:'Hähnchen-Reis-Bowl',   source:'user',   icon:'🍗',servings:2,kcal:426,p:52,kh:58,f:8,  time:'25min',
     items:[{n:'Hähnchenbrust',g:200,kcal:218},{n:'Basmati Reis',g:150,kcal:174},{n:'Brokkoli',g:100,kcal:34}],
     tags:['High-Protein','Low-Fat','Meal-Prep']},
    {name:'Overnight Oats Deluxe',source:'user',   icon:'🥣',servings:1,kcal:520,p:34,kh:72,f:12, time:'10min',
     items:[{n:'Haferflocken',g:80,kcal:296},{n:'Whey Protein',g:30,kcal:120},{n:'Beeren',g:100,kcal:57}],
     tags:['High-Protein','Pre-Workout']},
    {name:'Lachs mit Süßkartoffel',source:'coach', badge:'Von Coach Mueller',badgeColor:'#3b82f6',icon:'🐟',servings:1,kcal:480,p:38,kh:44,f:14,time:'30min',
     items:[{n:'Lachs',g:180,kcal:374},{n:'Süßkartoffel',g:200,kcal:180}],
     tags:['Omega-3','Lean Protein']},
    {name:'Lean Bulk Pasta',       source:'marketplace',badge:'Marketplace',badgeColor:'#f97316',icon:'🍝',servings:2,kcal:650,p:48,kh:88,f:10,time:'20min',
     items:[{n:'Vollkornnudeln',g:180,kcal:260},{n:'Hähnchenhack',g:200,kcal:218}],
     tags:['High-Carb','Bulk-Phase']},
    {name:'Post-Workout Shake',    source:'buddy',  badge:'AI erstellt',badgeColor:'var(--brand-600)',icon:'🥤',servings:1,kcal:380,p:42,kh:44,f:6, time:'5min',
     items:[{n:'Whey Protein',g:60,kcal:240},{n:'Banane',g:120,kcal:100}],
     tags:['Post-Workout','Fast Carbs']},
  ];
  const sourceIcon = {user:'👤',coach:'🏋️',marketplace:'🛒',buddy:'🤖'};
  const sourceColor = {user:'var(--surface-hover)',coach:'#eff6ff',marketplace:'#fff7ed',buddy:'#f0fdf4'};

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${filters.map((f,i)=>`<div style="padding:4px 10px;border-radius:var(--r-full);background:${i===0?'var(--accent-nutrition)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer;border:1px solid ${i===0?'var(--accent-nutrition)':'var(--surface-border)'}">${f}</div>`).join('')}
        </div>
        <div style="font-size:var(--text-micro);padding:5px 10px;border-radius:var(--r-sm);background:var(--accent-nutrition);color:#fff;cursor:pointer">+ Neues Rezept</div>
      </div>

      <div style="display:flex;gap:8px;align-items:center;background:var(--surface-card);border:1px solid var(--surface-border);border-radius:var(--r-md);padding:8px 12px">
        <span style="color:var(--text-muted)">🔍</span>
        <span style="font-size:var(--text-sm);color:var(--text-muted)">Rezepte suchen…</span>
      </div>

      ${recipes.map(r=>`
        <div style="background:${sourceColor[r.source]};border:1px solid var(--surface-border);border-radius:var(--r-lg);overflow:hidden">
          <div style="padding:12px 14px;cursor:pointer" onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'block':'none'})(this)">
            <div style="display:flex;align-items:flex-start;gap:10px">
              <span style="font-size:24px;flex-shrink:0">${r.icon}</span>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
                  <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${r.name}</span>
                  ${r.badge?`<span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:${r.badgeColor}20;color:${r.badgeColor};border:1px solid ${r.badgeColor}40;font-weight:600">${r.badge}</span>`:`<span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:var(--surface-hover);color:var(--text-muted)">${sourceIcon[r.source]} Eigenes</span>`}
                </div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">${r.servings} Portion · ${r.time} Zuber.</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  ${[{l:'kcal',v:r.kcal},{l:'P',v:r.p+'g'},{l:'KH',v:r.kh+'g'},{l:'F',v:r.f+'g'}].map(m=>`<span style="font-size:var(--text-micro);color:var(--text-secondary)"><strong>${m.v}</strong> ${m.l}</span>`).join('')}
                </div>
                <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
                  ${r.tags.map(t=>`<span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:var(--brand-100);color:var(--brand-700)">${t}</span>`).join('')}
                </div>
              </div>
              <span style="font-size:14px;color:var(--text-muted)">›</span>
            </div>
          </div>
          <div style="display:none;border-top:1px solid var(--surface-border);padding:10px 14px;background:var(--surface-card)">
            <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);margin-bottom:6px">Zutaten (${r.items.length}):</div>
            ${r.items.map(item=>`
              <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:var(--text-micro);color:var(--text-secondary);border-bottom:1px solid var(--surface-border)">
                <span>${item.n}</span><span>${item.g}g · ${item.kcal} kcal</span>
              </div>`).join('')}
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
              <div style="flex:1;min-width:100px;padding:7px;text-align:center;border-radius:var(--r-md);background:var(--accent-nutrition);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">📝 Als Mahlzeit loggen</div>
              <div style="padding:7px 10px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">✏️ Bearbeiten</div>
              <div style="padding:7px 10px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">🛒 Einkaufsliste</div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
};
