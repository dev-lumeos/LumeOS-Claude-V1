// features/nutrition/SettingsView.js — NEW
// Mirrors: src/features/nutrition/components/SettingsView.tsx + SPEC_04_FEATURES Feature 12+15
// Mahlzeiten-Zeitplan, Diät-Typ, Allergene, Likes/Dislikes, Mikro-Tier, MealCam, Wasser

window.Nutrition_SettingsView = function() {
  const mealSlots = [
    {id:'breakfast',   name:'Frühstück',   time:'07:00', enabled:true},
    {id:'snack1',      name:'Snack 1',     time:'10:00', enabled:true},
    {id:'lunch',       name:'Mittagessen', time:'12:30', enabled:true},
    {id:'snack2',      name:'Snack 2',     time:'15:00', enabled:true},
    {id:'dinner',      name:'Abendessen',  time:'18:30', enabled:true},
    {id:'pre_workout', name:'Pre-Workout', time:'17:00', enabled:false},
    {id:'post_workout',name:'Post-Workout',time:'19:00', enabled:false},
  ];
  const allergens = ['Gluten','Milch','Eier','Nüsse','Erdnüsse','Fisch','Schalentiere','Soja','Sesam','Sellerie','Senf','Sulfite','Lupine','Weichtiere'];
  const dietTypes = [
    {id:'omnivore',    label:'Omnivor ✓',     active:true},
    {id:'vegetarian',  label:'Vegetarisch',   active:false},
    {id:'vegan',       label:'Vegan',         active:false},
    {id:'pescatarian', label:'Pescatarisch',  active:false},
    {id:'keto',        label:'Keto',          active:false},
    {id:'paleo',       label:'Paleo',         active:false},
    {id:'low_carb',    label:'Low-Carb',      active:false},
    {id:'mediterranean',label:'Mediterran',   active:false},
  ];
  const liked    = ['Hähnchen','Lachs','Haferflocken','High-Protein','Post-Workout'];
  const disliked = ['Innereien','Fertiggerichte'];
  const likedFoods = ['Hähnchenbrust (roh)','Magerquark 0.2%','Blaubeeren'];
  const dislikedFoods = ['Feta-Käse'];

  const toggle = (on) => `
    <div style="width:40px;height:22px;border-radius:11px;background:${on?'var(--brand-600)':'var(--surface-border)'};position:relative;cursor:pointer;flex-shrink:0">
      <div style="position:absolute;top:2px;${on?'right:2px':'left:2px'};width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:var(--shadow-sm)"></div>
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:14px">

      <div class="card">
        <div class="card-header"><div class="card-title">🍽️ Meine Mahlzeiten</div><div style="font-size:var(--text-xs);color:var(--brand-700);font-weight:var(--fw-semibold);cursor:pointer">+ Mahlzeit</div></div>
        ${mealSlots.map(m=>`
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--surface-border)">
            ${toggle(m.enabled)}
            <div style="flex:1;font-size:var(--text-xs);font-weight:var(--fw-medium);color:${m.enabled?'var(--text-primary)':'var(--text-muted)'}">${m.name}</div>
            <div style="font-size:var(--text-micro);padding:3px 8px;border:1px solid var(--surface-border);border-radius:var(--r-sm);color:var(--text-secondary);font-family:var(--font-mono)">${m.time}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);cursor:pointer;padding:2px 6px">✏️</div>
            ${!['breakfast','lunch','dinner'].includes(m.id)?`<div style="font-size:var(--text-micro);color:var(--semantic-danger-text);cursor:pointer;padding:2px 6px">✕</div>`:''}
          </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🥗 Ernährungsstil</div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
          ${dietTypes.map(d=>`
            <div style="padding:8px 10px;border-radius:var(--r-md);border:1px solid ${d.active?'var(--brand-500)':'var(--surface-border)'};background:${d.active?'var(--brand-50)':'var(--surface-card)'};cursor:pointer">
              <div style="font-size:var(--text-xs);font-weight:${d.active?'var(--fw-semibold)':'var(--fw-normal)'};color:${d.active?'var(--brand-700)':'var(--text-secondary)'}">${d.label}</div>
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;margin-bottom:8px">
          <div style="flex:1">
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Kochskill</div>
            <div style="display:flex;gap:3px">
              ${['Anfänger','Mittel ✓','Fortgeschritten'].map((s,i)=>`<div style="flex:1;padding:4px;text-align:center;border-radius:var(--r-sm);background:${i===1?'var(--brand-600)':'var(--surface-hover)'};color:${i===1?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer">${s}</div>`).join('')}
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Max. Zubereitungszeit</div>
            <div style="display:flex;gap:3px">
              ${['15min','30min ✓','60min','Egal'].map((s,i)=>`<div style="flex:1;padding:4px;text-align:center;border-radius:var(--r-sm);background:${i===1?'var(--brand-600)':'var(--surface-hover)'};color:${i===1?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer">${s}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">⚠️ Allergien & Unverträglichkeiten</div></div>
        <div style="font-size:var(--text-micro);color:var(--semantic-warning-text);background:var(--semantic-warning-bg);padding:6px 10px;border-radius:var(--r-sm);margin-bottom:10px;border:1px solid var(--semantic-warning-border)">
          Allergene werden aus der Food Search <strong>hart ausgeschlossen</strong> — kein Scoring-Override möglich.
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${allergens.map(a=>`
            <div style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:var(--r-full);border:1px solid var(--surface-border);background:var(--surface-card-alt);cursor:pointer">
              <span style="font-size:11px">☐</span>
              <span style="font-size:var(--text-micro);color:var(--text-secondary)">${a}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">👍 Food-Präferenzen</div></div>
        <div style="margin-bottom:10px">
          <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Ich mag 💚</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
            ${liked.map(l=>`<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);background:#f0fdf4;border:1px solid var(--brand-200);cursor:pointer"><span style="font-size:10px;color:var(--brand-600)">💚</span><span style="font-size:var(--text-micro);color:var(--brand-700)">${l}</span><span style="font-size:9px;color:var(--text-muted)">✕</span></div>`).join('')}
            <div style="padding:3px 8px;border-radius:var(--r-full);border:1px dashed var(--surface-border);cursor:pointer;font-size:var(--text-micro);color:var(--text-muted)">+ hinzufügen</div>
          </div>
          <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Ich mag nicht ❌</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
            ${disliked.map(d=>`<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);background:var(--semantic-danger-bg);border:1px solid var(--semantic-danger-border);cursor:pointer"><span style="font-size:10px">❌</span><span style="font-size:var(--text-micro);color:var(--semantic-danger-text)">${d}</span><span style="font-size:9px;color:var(--text-muted)">✕</span></div>`).join('')}
            <div style="padding:3px 8px;border-radius:var(--r-full);border:1px dashed var(--surface-border);cursor:pointer;font-size:var(--text-micro);color:var(--text-muted)">+ hinzufügen</div>
          </div>
          <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Spezifische Foods</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${likedFoods.map(f=>`<span style="font-size:var(--text-micro);padding:2px 6px;border-radius:var(--r-full);background:#f0fdf4;color:var(--brand-700);border:1px solid var(--brand-200)">💚 ${f} ✕</span>`).join('')}
            ${dislikedFoods.map(f=>`<span style="font-size:var(--text-micro);padding:2px 6px;border-radius:var(--r-full);background:var(--semantic-danger-bg);color:var(--semantic-danger-text);border:1px solid var(--semantic-danger-border)">❌ ${f} ✕</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🔬 Mikronährstoff-Anzeige</div></div>
        ${[
          {tier:1,label:'Tier 1 — Essential',desc:'15 Kernnährstoffe (immer sichtbar)',active:false},
          {tier:2,label:'Tier 2 — Athlete',  desc:'+8 weitere (Kupfer, Selen, Folat, B12...)',active:true},
          {tier:3,label:'Tier 3 — Medical',  desc:'Alle 138 BLS-Nährstoffe inkl. Aminosäuren',active:false},
        ].map(t=>`
          <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--surface-border)">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${t.active?'var(--brand-600)':'var(--surface-border)'};background:${t.active?'var(--brand-600)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
              ${t.active?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
            </div>
            <div>
              <div style="font-size:var(--text-xs);font-weight:${t.active?'var(--fw-semibold)':'var(--fw-normal)'};color:${t.active?'var(--text-primary)':'var(--text-muted)'}">${t.label}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${t.desc}</div>
            </div>
          </div>`).join('')}
        <div style="margin-top:10px">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:4px">MealCam Auto-Accept Confidence: <strong style="color:var(--brand-700)">85%</strong></div>
          <div style="position:relative;height:6px;background:var(--surface-hover);border-radius:3px"><div style="position:absolute;height:100%;width:85%;background:var(--brand-500);border-radius:3px"></div><div style="position:absolute;top:-5px;left:85%;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--brand-600);box-shadow:var(--shadow-sm)"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted);margin-top:3px"><span>0% — immer fragen</span><span>100% — immer übernehmen</span></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">💧 Wasser Quick-Add Mengen</div></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${[250,500,750,1000].map(ml=>`
            <div style="padding:8px 14px;border-radius:var(--r-md);border:1px solid var(--brand-200);background:var(--brand-50);font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--brand-700);cursor:pointer">+${ml}ml</div>`).join('')}
          <div style="padding:8px 14px;border-radius:var(--r-md);border:1px dashed var(--surface-border);font-size:var(--text-xs);color:var(--text-muted);cursor:pointer">+ Eigene</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🌙 Morgenroutine & Tracking</div></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface-border)">${toggle(true)}<span style="font-size:var(--text-xs);color:var(--text-secondary);flex:1;margin-left:10px">Gewicht täglich morgens tracken</span></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface-border)">${toggle(true)}<span style="font-size:var(--text-xs);color:var(--text-secondary);flex:1;margin-left:10px">Morgen-Wasser-Reminder um 07:30</span></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0">${toggle(false)}<span style="font-size:var(--text-xs);color:var(--text-muted);flex:1;margin-left:10px">Abend-Summary automatisch öffnen</span></div>
      </div>
    </div>`;
};
