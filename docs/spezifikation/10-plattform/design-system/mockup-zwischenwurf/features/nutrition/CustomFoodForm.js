// features/nutrition/CustomFoodForm.js — Barcode, Custom Food erstellen, EU-14 Allergene, Custom Foods Liste

window.Nutrition_CustomFoodForm = function() {
  const allergens = [
    {id:'gluten',l:'🌾 Gluten'},{id:'milk',l:'🥛 Milcheiweiss'},{id:'lactose',l:'🥛 Laktose'},
    {id:'eggs',l:'🥚 Eier'},{id:'fish',l:'🐟 Fisch'},{id:'crustaceans',l:'🦐 Krebstiere'},
    {id:'molluscs',l:'🦑 Weichtiere'},{id:'peanuts',l:'🥜 Erdnüsse'},{id:'nuts',l:'🥜 Baumnüsse'},
    {id:'soy',l:'🫘 Soja'},{id:'celery',l:'🥬 Sellerie'},{id:'mustard',l:'🟡 Senf'},
    {id:'sesame',l:'🌱 Sesam'},{id:'sulfites',l:'🍷 Sulfite'},{id:'lupin',l:'🌸 Lupine'},
  ];
  const customFoods = [
    {name:'Protein Shake Mix',kcal:380,p:42,kh:28,f:8,barcode:'4005900024657'},
    {name:'Post-Workout Bowl', kcal:520,p:48,kh:52,f:12,barcode:null},
  ];

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:var(--r-lg);padding:14px 16px;color:#fff;display:flex;align-items:center;gap:12px">
        <span style="font-size:28px">📷</span>
        <div style="flex:1">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-bold)">Barcode scannen</div>
          <div style="font-size:var(--text-micro);opacity:.7">Kamera öffnen oder EAN-Code eingeben</div>
        </div>
        <div style="padding:7px 14px;border-radius:var(--r-md);background:var(--accent-nutrition);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">Scannen</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">+ Neues Lebensmittel</div></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          ${[{l:'Name (DE)*',ph:'z.B. Hähnchenbrust roh',type:'text'},{l:'Name (EN)',ph:'Chicken breast',type:'text'},{l:'Marke',ph:'Markenname',type:'text'},{l:'Barcode',ph:'EAN / GTIN',type:'text'}].map(f=>`
            <div>
              <div style="font-size:var(--text-micro);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:3px">${f.l}</div>
              <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);padding:7px 10px;font-size:var(--text-xs);color:var(--text-muted);background:var(--surface-card-alt)">${f.ph}</div>
            </div>`).join('')}
        </div>

        <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Makros (pro 100g) — Pflichtfelder</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">
          ${[{l:'Kalorien',ph:'kcal',v:''},{l:'Protein',ph:'g',v:''},{l:'Kohlenhydrate',ph:'g',v:''},{l:'Fett',ph:'g',v:''}].map(f=>`
            <div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">${f.l}</div>
              <div style="border:1.5px solid var(--brand-200);border-radius:var(--r-md);padding:7px 8px;font-size:var(--text-sm);font-weight:var(--fw-bold);text-align:center;color:var(--text-muted);background:var(--surface-card)">${f.ph}</div>
            </div>`).join('')}
        </div>

        <div style="border-top:1px solid var(--surface-border);padding-top:10px;margin-bottom:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;margin-bottom:6px"
            onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'grid':'none';el.querySelector('span').textContent=d.style.display==='none'?'+ Weitere Makros':'− Weitere Makros'})(this)">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--brand-700)">+ Weitere Makros</div>
            <span style="font-size:var(--text-micro);color:var(--text-muted)">+ Weitere Makros</span>
          </div>
          <div style="display:none;grid-template-columns:repeat(4,1fr);gap:6px">
            ${['Zucker g','Ballaststoffe g','Salz g','Ges. Fett g'].map(f=>`
              <div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">${f}</div>
                <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);padding:6px;font-size:var(--text-xs);text-align:center;color:var(--text-muted);background:var(--surface-card-alt)">—</div>
              </div>`).join('')}
          </div>
        </div>

        <div style="border-top:1px solid var(--surface-border);padding-top:10px;margin-bottom:10px">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:8px">Allergene (EU 14 + weitere)</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${allergens.map(a=>`
              <div style="padding:4px 8px;border-radius:var(--r-full);border:1px solid var(--surface-border);background:var(--surface-card-alt);font-size:var(--text-micro);color:var(--text-secondary);cursor:pointer">${a.l}</div>`).join('')}
          </div>
        </div>

        <div style="border-top:1px solid var(--surface-border);padding-top:10px;margin-bottom:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer"
            onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'grid':'none'})(this)">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--brand-700)">+ Mikronährstoffe</div>
            <span style="font-size:var(--text-micro);color:var(--text-muted)">optional</span>
          </div>
          <div style="display:none;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px">
            ${['Vitamin D μg','Vitamin B12 μg','Eisen mg','Calcium mg','Magnesium mg','Zink mg'].map(f=>`
              <div>
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">${f}</div>
                <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);padding:6px;font-size:var(--text-xs);text-align:center;color:var(--text-muted);background:var(--surface-card-alt)">—</div>
              </div>`).join('')}
          </div>
        </div>

        <div style="display:flex;gap:6px">
          <div style="flex:1;padding:10px;text-align:center;border-radius:var(--r-md);background:var(--accent-nutrition);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">💾 Speichern</div>
          <div style="padding:10px 14px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">Abbrechen</div>
        </div>
      </div>

      ${customFoods.length>0?`
        <div class="card">
          <div class="card-header"><div class="card-title">👤 Meine Foods (${customFoods.length})</div></div>
          ${customFoods.map(f=>`
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${f.name}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${f.kcal} kcal · ${f.p}g P · ${f.kh}g KH · ${f.f}g F${f.barcode?` · EAN: ${f.barcode}`:''}</div>
              </div>
              <div style="display:flex;gap:5px">
                <div style="font-size:var(--text-micro);padding:3px 7px;border-radius:var(--r-sm);background:var(--accent-nutrition);color:#fff;cursor:pointer">+ Loggen</div>
                <div style="font-size:var(--text-micro);padding:3px 7px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-secondary);cursor:pointer">✏️</div>
              </div>
            </div>`).join('')}
        </div>`:''
      }
    </div>`;
};
