// features/nutrition/PreferencesView.js — 4-Step Wizard: Diet+Allergies, Food Grid, Cooking, Summary
// Vollständig aus FoodPreferences.tsx (927L): alle Diättypen, Allergene, Ausschlüsse, Küchen, Food-Grid

window.Nutrition_PreferencesView = function() {
  if (!window._prefStep) window._prefStep = 1;
  const step = window._prefStep;

  const setStep = (s) => { window._prefStep = s; document.querySelector('#pref-content').innerHTML = window.Nutrition_PreferencesView().match(/id="pref-content"[^>]*>([\s\S]*)<\/div>\s*$/) || ''; };

  const dietTypes = [
    {k:'omnivore',l:'Omnivor',e:'🥩',d:'Alles'},
    {k:'pescatarian',l:'Pescetarisch',e:'🐟',d:'Kein Fleisch'},
    {k:'vegetarian',l:'Vegetarisch',e:'🥬',d:'Kein Fleisch/Fisch'},
    {k:'vegan',l:'Vegan',e:'🌱',d:'Nur pflanzlich'},
    {k:'keto',l:'Keto',e:'🥑',d:'Sehr low carb'},
    {k:'paleo',l:'Paleo',e:'🦴',d:'Keine Getreide'},
    {k:'mediterranean',l:'Mediterran',e:'🫒',d:'Fisch, Gemüse, Öl'},
    {k:'custom',l:'Individuell',e:'⚙️',d:'Selbst wählen'},
  ];
  const allergens = [
    {id:'gluten',l:'🌾 Gluten/Weizen',sev:0},{id:'milk_protein',l:'🥛 Milcheiweiss',sev:0},
    {id:'lactose',l:'🥛 Laktose',sev:0},{id:'eggs',l:'🥚 Eier',sev:0},
    {id:'fish',l:'🐟 Fisch',sev:0},{id:'crustaceans',l:'🦐 Krebstiere',sev:0},
    {id:'molluscs',l:'🦑 Weichtiere',sev:0},{id:'peanuts',l:'🥜 Erdnüsse',sev:1},
    {id:'nuts',l:'🥜 Baumnüsse',sev:0},{id:'soy',l:'🫘 Soja',sev:0},
    {id:'celery',l:'🥬 Sellerie',sev:0},{id:'mustard',l:'🟡 Senf',sev:0},
    {id:'sesame',l:'🌱 Sesam',sev:0},{id:'sulfites',l:'🍷 Sulfite',sev:0},
    {id:'lupin',l:'🌸 Lupine',sev:0},{id:'fructose',l:'🍎 Fruktose',sev:1},
    {id:'histamine',l:'⚠️ Histamin',sev:0},{id:'fodmap',l:'🫧 FODMAP',sev:0},
  ];
  const globalExcl = [
    {id:'no_organ',l:'🫀 Keine Innereien',d:'Leber, Herz, Niere…'},
    {id:'no_processed',l:'🌭 Kein verarbeit. Fleisch',d:'Wurst, Salami, Aufschnitt'},
    {id:'no_pork',l:'🐷 Kein Schweinefleisch',d:'Auch kein Speck, Schinken'},
    {id:'no_red',l:'🥩 Kein rotes Fleisch',d:'Rind, Schwein, Lamm, Wild'},
    {id:'no_dairy',l:'🥛 Keine Milchprodukte',d:'Milch, Käse, Joghurt, Butter'},
    {id:'no_gluten',l:'🌾 Kein Gluten',d:'Weizen, Roggen, Dinkel'},
    {id:'no_raw_fish',l:'🍣 Kein roher Fisch',d:'Sushi, Sashimi, Tatar'},
    {id:'no_shellfish',l:'🦐 Keine Schalentiere',d:'Garnelen, Muscheln, Krabben'},
  ];
  const cuisines = ['🇩🇪 Deutsch','🇮🇹 Italienisch','🇨🇳 Chinesisch','🇯🇵 Japanisch','🇹🇭 Thai','🇲🇽 Mexikanisch','🇬🇷 Griechisch','🇮🇳 Indisch','🇹🇷 Türkisch','🫒 Mediterran','🇫🇷 Französisch','🇻🇳 Vietnamesisch'];

  const foodGroups = [
    {name:'🐔 Geflügel',foods:['🍗 Hähnchenbrust','🍗 Hähnchenschenkel','🦃 Putenbrust','🦃 Putenhack','🦆 Ente']},
    {name:'🐄 Rind',    foods:['🥩 Filet','🥩 Roastbeef','🥩 Ribeye','🥩 Hack','🍖 Gulasch']},
    {name:'🐟 Fisch',   foods:['🐟 Lachs','🐟 Thunfisch','🥫 Thunfisch (Dose)','🐟 Kabeljau','🐟 Makrele','🐟 Forelle']},
    {name:'🥛 Milch',   foods:['🥛 Griech. Joghurt','🥛 Magerquark','🧀 Mozzarella','🧀 Feta','🥤 Whey','🥤 Casein']},
    {name:'🥚 Eier/Pflanzl.',foods:['🥚 Eier','🫧 Tofu','🫘 Linsen','🫘 Kichererbsen','🫘 Edamame']},
    {name:'🍚 Getreide', foods:['🍚 Reis weiß','🍚 Basmatireis','🥣 Haferflocken','🍝 Vollkornnudeln','🥔 Kartoffeln','🍠 Süßkartoffel','🌾 Quinoa']},
    {name:'🥦 Gemüse',  foods:['🥦 Brokkoli','🥬 Spinat','🫑 Paprika','🍅 Tomaten','🥒 Zucchini','🍄 Pilze','🥕 Karotten']},
    {name:'🍎 Obst',    foods:['🍌 Banane','🍎 Apfel','🫐 Blaubeeren','🍓 Erdbeeren','🥭 Mango','🥝 Kiwi']},
    {name:'🥑 Fette',   foods:['🫒 Olivenöl','🥑 Avocado','🥜 Mandeln','🥜 Walnüsse','🌻 Chiasamen']},
  ];

  // Liked foods (Tom's known prefs)
  const liked = ['🍗 Hähnchenbrust','🐟 Lachs','🥛 Magerquark','🥣 Haferflocken','🍠 Süßkartoffel','🥦 Brokkoli','🫐 Blaubeeren','🥤 Whey'];
  const disliked = ['🐷 Innereien','🌭 Wurst'];

  const renderStep1 = () => `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:8px">Ernährungsform</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
          ${dietTypes.map(d=>`
            <div style="padding:10px 6px;text-align:center;border-radius:var(--r-md);border:2px solid ${d.k==='omnivore'?'var(--brand-500)':'var(--surface-border)'};background:${d.k==='omnivore'?'var(--brand-50)':'var(--surface-card)'};cursor:pointer">
              <div style="font-size:20px;margin-bottom:3px">${d.e}</div>
              <div style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:${d.k==='omnivore'?'var(--brand-700)':'var(--text-primary)'}">${d.l}</div>
              <div style="font-size:9px;color:var(--text-muted)">${d.d}</div>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:4px">Allergien & Unverträglichkeiten</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:6px">1× tippen = Sensibel (🟡) · 2× = Allergie (🔴) · 3× = Entfernen</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${allergens.map(a=>`
            <div style="padding:4px 8px;border-radius:var(--r-full);border:2px solid ${a.sev===1?'#f59e0b':a.sev===2?'#ef4444':'var(--surface-border)'};background:${a.sev===1?'#fffbeb':a.sev===2?'#fef2f2':'var(--surface-hover)'};font-size:var(--text-micro);color:${a.sev===1?'#92400e':a.sev===2?'#b91c1c':'var(--text-secondary)'};cursor:pointer">
              ${a.l}${a.sev===1?' ⚠️':a.sev===2?' 🚫':''}
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:6px">🚫 Generelle Ausschlüsse</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
          ${globalExcl.map(e=>`
            <div style="padding:8px 10px;border-radius:var(--r-md);border:1px solid var(--surface-border);background:var(--surface-card);cursor:pointer">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${e.l}</div>
              <div style="font-size:9px;color:var(--text-muted)">${e.d}</div>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-secondary);margin-bottom:6px">Bevorzugte Küchen</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${cuisines.map((c,i)=>`<div style="padding:3px 8px;border-radius:var(--r-full);background:${i%4===0?'var(--semantic-info-bg)':'var(--surface-hover)'};color:${i%4===0?'var(--semantic-info-text)':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer;border:1px solid ${i%4===0?'var(--semantic-info-border)':'var(--surface-border)'}">${c}</div>`).join('')}
        </div>
      </div>
    </div>`;

  const renderStep2 = () => `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:var(--semantic-success-bg);border:1px solid var(--semantic-success-border);border-radius:var(--r-md);padding:10px 12px;font-size:var(--text-xs);color:var(--semantic-success-text)">
        <strong>Tippe auf Lebensmittel:</strong> 💚 = Mag ich · ❌ = Mag nicht · Kein Tap = Egal<br>
        <span style="font-size:var(--text-micro)">${liked.length} 💚 · ${disliked.length} ❌ · gezählt</span>
      </div>
      ${foodGroups.map(g=>`
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${g.name}</div>
            <div style="display:flex;gap:4px">
              <div style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:var(--semantic-success-bg);color:var(--semantic-success-text);cursor:pointer">Alle 💚</div>
              <div style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:var(--surface-hover);color:var(--text-muted);cursor:pointer">Reset</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
            ${g.foods.map(f=>`
              <div style="position:relative;padding:7px 4px;text-align:center;border-radius:var(--r-md);border:2px solid ${liked.includes(f)?'var(--brand-500)':disliked.includes(f)?'#ef4444':'var(--surface-border)'};background:${liked.includes(f)?'var(--brand-50)':disliked.includes(f)?'#fef2f2':'var(--surface-card)'};cursor:pointer">
                <div style="font-size:14px">${f.split(' ')[0]}</div>
                <div style="font-size:9px;font-weight:var(--fw-medium);color:${liked.includes(f)?'var(--brand-700)':disliked.includes(f)?'#b91c1c':'var(--text-secondary)';line-height:1.2">${f.slice(f.indexOf(' ')+1)}</div>
                ${liked.includes(f)?`<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:var(--brand-600);font-size:9px;display:flex;align-items:center;justify-content:center;color:#fff">✓</div>`:''}
                ${disliked.includes(f)?`<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#ef4444;font-size:9px;display:flex;align-items:center;justify-content:center;color:#fff">✕</div>`:''}
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;

  const renderStep3 = () => `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[
        {t:'📋 Mahlzeiten pro Tag',opts:[2,3,4,5,6],active:4},
        {t:'🍎 Snacks pro Tag',    opts:[0,1,2,3],   active:1},
      ].map(s=>`
        <div class="card">
          <div class="card-header"><div class="card-title">${s.t}</div></div>
          <div style="display:flex;gap:6px">
            ${s.opts.map(o=>`<div style="flex:1;padding:10px;text-align:center;border-radius:var(--r-md);border:2px solid ${o===s.active?'var(--brand-500)':'var(--surface-border)'};background:${o===s.active?'var(--brand-50)':'var(--surface-card)'};cursor:pointer;font-size:var(--text-sm);font-weight:var(--fw-bold);color:${o===s.active?'var(--brand-700)':'var(--text-secondary)'}">${o}</div>`).join('')}
          </div>
        </div>`).join('')}
      <div class="card">
        <div class="card-header"><div class="card-title">👨‍🍳 Kochlevel</div></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
          ${[{k:'beginner',l:'🔰 Einfach',d:'Max. 5 Zutaten'},{k:'intermediate',l:'👨‍🍳 Normal',d:'Standard-Rezepte',active:true},{k:'advanced',l:'⭐ Fortgeschritten',d:'Komplexe Gerichte'}].map(s=>`
            <div style="padding:10px;text-align:center;border-radius:var(--r-md);border:2px solid ${s.active?'var(--brand-500)':'var(--surface-border)'};background:${s.active?'var(--brand-50)':'var(--surface-card)'};cursor:pointer">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:${s.active?'var(--brand-700)':'var(--text-primary)'}">${s.l}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${s.d}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">⏱️ Max. Zubereitungszeit</div></div>
        <div style="display:flex;gap:5px">
          ${[15,20,30,45,60].map(t=>`<div style="flex:1;padding:8px;text-align:center;border-radius:var(--r-md);border:2px solid ${t===30?'var(--brand-500)':'var(--surface-border)'};background:${t===30?'var(--brand-50)':'var(--surface-card)'};cursor:pointer;font-size:var(--text-xs);font-weight:var(--fw-medium);color:${t===30?'var(--brand-700)':'var(--text-secondary)'}">${t}min</div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📦 Budget & Meal-Prep</div></div>
        <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--surface-border)">
          <div style="width:40px;height:22px;border-radius:11px;background:var(--brand-600);position:relative;cursor:pointer;flex-shrink:0"><div style="position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:var(--shadow-sm)"></div></div>
          <div style="font-size:var(--text-xs);color:var(--text-secondary)">Meal-Prep OK (Vorkochen für mehrere Tage)</div>
        </div>
        <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
          ${['💰 Sparsam','💰💰 Normal','💰💰💰 Premium','♾️ Egal'].map((b,i)=>`<div style="flex:1;padding:6px;text-align:center;border-radius:var(--r-sm);border:1px solid ${i===1?'var(--brand-500)':'var(--surface-border)'};background:${i===1?'var(--brand-50)':'var(--surface-hover)'};font-size:9px;cursor:pointer;color:${i===1?'var(--brand-700)':'var(--text-secondary)'}">${b}</div>`).join('')}
        </div>
        <div style="margin-top:8px">
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Notizen für den AI-Planer</div>
          <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);padding:8px;font-size:var(--text-xs);color:var(--text-muted);background:var(--surface-card-alt)">z.B. "Abends keine Carbs", "Kein Fisch am Montag"…</div>
        </div>
      </div>
    </div>`;

  const renderStep4 = () => `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="card" style="border:1px solid var(--brand-200)">
        <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary);margin-bottom:10px">Dein Profil — Zusammenfassung</div>
        <div class="data-row"><div class="data-label">Ernährung</div><div class="data-val">Omnivor ✓</div></div>
        <div class="data-row"><div class="data-label">Allergien</div><div class="data-val" style="color:var(--semantic-warning-text)">⚠️ Erdnüsse · ⚠️ Fruktose</div></div>
        <div class="data-row"><div class="data-label">Ausschlüsse</div><div class="data-val">—</div></div>
        <div class="data-row"><div class="data-label">Küchen</div><div class="data-val">Deutsch · Thai · Japanisch</div></div>
        <div class="data-row"><div class="data-label">Mahlzeiten</div><div class="data-val">4/Tag + 1 Snack</div></div>
        <div class="data-row"><div class="data-label">Kochen</div><div class="data-val">👨‍🍳 Normal · max. 30min</div></div>
        <div class="data-row"><div class="data-label">Meal-Prep</div><div class="data-val">✅ Ja</div></div>
        <div style="margin-top:10px">
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:6px">💚 Mag ich (${liked.length}):</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${liked.map(f=>`<span style="font-size:9px;padding:1px 6px;border-radius:var(--r-full);background:var(--brand-100);color:var(--brand-700)">${f}</span>`).join('')}
          </div>
        </div>
        <div style="margin-top:8px">
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">❌ Mag nicht (${disliked.length}):</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${disliked.map(f=>`<span style="font-size:9px;padding:1px 6px;border-radius:var(--r-full);background:var(--semantic-danger-bg);color:var(--semantic-danger-text)">${f}</span>`).join('')}
          </div>
        </div>
      </div>
      <div style="padding:12px;border-radius:var(--r-lg);background:var(--brand-600);color:#fff;text-align:center;cursor:pointer;font-size:var(--text-sm);font-weight:var(--fw-bold)">💾 Profil speichern</div>
      <div style="padding:10px;border-radius:var(--r-lg);background:var(--semantic-success-bg);color:var(--semantic-success-text);text-align:center;font-size:var(--text-xs);font-weight:var(--fw-semibold);display:none">
        ✅ Gespeichert! Der AI-Coach nutzt jetzt dein Profil.
      </div>
    </div>`;

  const stepTitles = ['🥗 Ernährung & Allergien','🍽️ Was magst du?','👨‍🍳 Kochen & Alltag','✅ Zusammenfassung'];
  const stepContent = [renderStep1,renderStep2,renderStep3,renderStep4][step-1]();

  return `
    <div style="display:flex;flex-direction:column;gap:12px" id="pref-content">
      <div style="display:flex;gap:3px;margin-bottom:2px">
        ${[1,2,3,4].map(s=>`<div style="flex:1;height:5px;border-radius:3px;background:${step>=s?'var(--brand-500)':'var(--surface-hover)'};cursor:pointer" onclick="window._prefStep=${s};document.getElementById('pref-main').innerHTML=window.Nutrition_PreferencesView()"></div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${stepTitles[step-1]}</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted)">Schritt ${step}/4</div>
      </div>

      <div id="pref-main">${stepContent}</div>

      <div style="display:flex;gap:8px;padding-top:4px">
        ${step>1?`<div style="flex:1;padding:10px;text-align:center;border-radius:var(--r-md);border:1px solid var(--surface-border);color:var(--text-secondary);font-size:var(--text-xs);font-weight:var(--fw-medium);cursor:pointer" onclick="window._prefStep=${step-1};document.getElementById('pref-main').innerHTML=window.Nutrition_PreferencesView()">← Zurück</div>`:''}
        ${step<4?`<div style="flex:1;padding:10px;text-align:center;border-radius:var(--r-md);background:var(--brand-600);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-bold);cursor:pointer" onclick="window._prefStep=${step+1};document.getElementById('pref-main').innerHTML=window.Nutrition_PreferencesView()">Weiter →</div>`:''}
      </div>
    </div>`;
};
