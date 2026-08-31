// features/coach/MemoryView.js
// AI Coach · Memory: Kategorie-Tabs, strukturiertes Wissen, Zeitstrahl letzte Updates

window.Coach_MemoryView = function() {
  const cats = ['Alle','🎯 Ziele','💪 Training','🍽️ Ernährung','😴 Schlaf'];
  const sections = [
    {cat:'🎯 Ziele', title:'🎯 Ziele', items:[
      'Körpergewicht: 86kg → 82kg bis 30. Juni 2026',
      'Bankdrücken: 90kg → 110kg × 5 bis August 2026',
      '5km unter 22 Minuten bis Mai 2026',
    ]},
    {cat:'💪 Training', title:'💪 Training-Präferenzen', items:[
      'Split: PPL (Push/Pull/Legs), 4-5× pro Woche',
      'Beste Trainingszeit: 17:00–19:00 Uhr',
      'Lieblings-Übungen: Bankdrücken, Kniebeugen, Kreuzheben',
      'Kein Cardio morgens — Leistung deutlich schlechter',
    ]},
    {cat:'🍽️ Ernährung', title:'🍽️ Ernährungs-Präferenzen', items:[
      'Hohe Protein-Priorität (2.0g/kg KG Ziel)',
      'Keine Milchprodukte außer Magerquark und Whey',
      'Meal Prep typischerweise Sonntags',
      'Intermittent Fasting: 12/12 (22:00–10:00)',
    ]},
    {cat:'😴 Schlaf', title:'😴 Schlaf-Muster', items:[
      'Optimal: 22:30 Uhr schlafen, 06:00 aufwachen',
      'Tiefschlaf-Baseline: 1h 35min (30T-Schnitt)',
      'HRV-Baseline: 54ms · Heute: 58ms (↑ gut)',
      'Spätes Essen (>21h) stört Tiefschlaf nachweislich',
    ]},
    {cat:'Alle', title:'📊 Körperdaten', items:[
      'Größe: 182cm · Gewicht: 85.2kg (27. Apr 2026)',
      'Körperfett: ~18% · FFMI: 21.1',
      'Ruhepuls: 52 bpm Ø · SpO₂: 96%',
      'Letzter Checkup: März 2026 — alle Werte normal',
    ]},
  ];
  return `
    <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:10px">Zuletzt aktualisiert: heute 06:42 · <strong>47</strong> Einträge · Konfidenz: hoch</div>

    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
      ${cats.map((c,i)=>`
        <div style="font-size:var(--text-micro);font-weight:var(--fw-medium);padding:4px 10px;border-radius:var(--r-full);cursor:pointer;background:${i===0?'var(--accent-coach)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};border:1px solid ${i===0?'var(--accent-coach)':'var(--surface-border)'}">${c}</div>`).join('')}
    </div>

    ${sections.map(s=>`
      <div class="card">
        <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary);margin-bottom:10px">${s.title}</div>
        ${s.items.map(item=>`
          <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--surface-border)">
            <div style="color:var(--brand-500);flex-shrink:0;font-size:12px">▸</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.4">${item}</div>
          </div>`).join('')}
      </div>`).join('')}

    <div class="card">
      <div class="card-header"><div class="card-title">🕐 Letzte Aktualisierungen</div></div>
      ${[
        {time:'heute 06:42',  icon:'😴', entry:'HRV 58ms gespeichert, Schlaf 7h24min — über Baseline'},
        {time:'gestern 20:15',icon:'🍽️', entry:'Abendessen: Lachs 150g, Süßkartoffel 200g geloggt'},
        {time:'27. Apr 17:48',icon:'🏋️', entry:'Push Day: 4×8 @ 90kg Bankdrücken — neuer PR Set 3'},
        {time:'27. Apr 07:00',icon:'💊', entry:'Morgen-Supplements komplett: Vit D, Omega-3, Kreatin'},
        {time:'26. Apr 22:00',icon:'🎯', entry:'Ziel-Check: Bankdrücken-Progression +2kg diese Woche'},
      ].map(u=>`
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:14px;flex-shrink:0">${u.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.4">${u.entry}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">${u.time}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
};
