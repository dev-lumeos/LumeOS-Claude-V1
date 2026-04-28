// features/training/ExerciseBrowse.js
// Training → Übungen durchsuchen: Search, Filter (Muskel/Equipment/Typ), Übungskarten + Detail

window.Training_ExerciseBrowse = function() {
  const muscles = ['Alle','Brust','Rücken','Schultern','Bizeps','Trizeps','Beine','Bauch','Core'];
  const types   = ['Alle Typen','Kraft','Bodyweight','Cardio','Dehnung'];
  const exercises = [
    {name:'Bankdrücken',            muscle:'Brust',        equip:'Langhantel',  score:94,diff:'Mittel',  cat:'Compound',icon:'🏋️',desc:'Brust, Trizeps, Schultern'},
    {name:'Kniebeugen',             muscle:'Quadrizeps',   equip:'Langhantel',  score:96,diff:'Mittel',  cat:'Compound',icon:'🦵',desc:'Quads, Hamstrings, Gesäß'},
    {name:'Kreuzheben',             muscle:'Rücken',       equip:'Langhantel',  score:98,diff:'Schwer',  cat:'Compound',icon:'💀',desc:'Rücken, Beine, Core'},
    {name:'Schulterdrücken',        muscle:'Schultern',    equip:'Langhantel',  score:91,diff:'Mittel',  cat:'Compound',icon:'💪',desc:'Schultern, Trizeps'},
    {name:'Klimmzüge',              muscle:'Latissimus',   equip:'Klimmzugst.', score:95,diff:'Schwer',  cat:'Compound',icon:'🧗',desc:'Lats, Bizeps, Trapez'},
    {name:'Langhantel-Rudern',      muscle:'Rücken',       equip:'Langhantel',  score:89,diff:'Mittel',  cat:'Compound',icon:'🚣',desc:'Oberer Rücken, Bizeps'},
    {name:'Schrägbankdrücken DB',   muscle:'Brust',        equip:'Kurzhantel',  score:87,diff:'Mittel',  cat:'Isolation',icon:'🏋️',desc:'Obere Brust, Schultern'},
    {name:'Trizeps Pushdown Kabel', muscle:'Trizeps',      equip:'Kabelzug',    score:82,diff:'Leicht',  cat:'Isolation',icon:'💪',desc:'Trizeps (alle Köpfe)'},
    {name:'Beinpresse',             muscle:'Quadrizeps',   equip:'Beinpresse',  score:78,diff:'Leicht',  cat:'Compound',icon:'🦵',desc:'Quads, Gesäß, Hamstrings'},
    {name:'Bizeps Curl LH',         muscle:'Bizeps',       equip:'Langhantel',  score:80,diff:'Leicht',  cat:'Isolation',icon:'💪',desc:'Bizeps brachii'},
  ];

  const scoreColor = (s) => s>=90?'var(--brand-700)':s>=80?'#f59e0b':'var(--text-muted)';
  const diffColor  = (d) => d==='Schwer'?'var(--semantic-danger-text)':d==='Mittel'?'var(--semantic-warning-text)':'var(--brand-700)';

  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:10px">

        <div style="display:flex;gap:8px;align-items:center">
          <div style="flex:1;display:flex;align-items:center;gap:8px;background:var(--surface-card);border:1px solid var(--surface-border);border-radius:var(--r-md);padding:9px 12px">
            <span style="color:var(--text-muted)">🔍</span>
            <span style="font-size:var(--text-sm);color:var(--text-muted)">Übungen suchen… (1.200+ in DE/EN/TH)</span>
          </div>
          <div style="padding:9px 12px;border-radius:var(--r-md);background:var(--surface-hover);border:1px solid var(--surface-border);font-size:var(--text-xs);cursor:pointer">Filter ▼</div>
        </div>

        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${muscles.map((m,i)=>`<div style="padding:4px 10px;border-radius:var(--r-full);background:${i===0?'var(--accent-training)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer;border:1px solid ${i===0?'var(--accent-training)':'var(--surface-border)'}">${m}</div>`).join('')}
        </div>

        <div style="font-size:var(--text-micro);color:var(--text-muted)">10 von 1.200+ Übungen · Sortiert nach Effektivität</div>

        <div style="display:flex;flex-direction:column;gap:6px">
          ${exercises.map(ex=>`
            <div style="background:var(--surface-card);border:1px solid var(--surface-border);border-radius:var(--r-lg);padding:10px 14px;cursor:pointer;transition:var(--transition-fast)"
              onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'block':'none'})(this)">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:20px;flex-shrink:0">${ex.icon}</span>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                    <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${ex.name}</span>
                    <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:${scoreColor(ex.score)}20;color:${scoreColor(ex.score)};font-weight:700">${ex.score}/100</span>
                  </div>
                  <div style="font-size:var(--text-micro);color:var(--text-muted)">${ex.desc}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0">
                  <span class="badge badge-gray">${ex.equip}</span>
                  <span style="font-size:9px;font-weight:600;color:${diffColor(ex.diff)}">${ex.diff}</span>
                </div>
              </div>
            </div>
            <div style="display:none;background:var(--brand-50);border:1px solid var(--brand-200);border-radius:var(--r-md);padding:10px 14px;margin-top:-4px">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);margin-bottom:6px">${ex.name} — Ausführung</div>
              <div style="font-size:var(--text-micro);color:var(--text-secondary);line-height:1.5;margin-bottom:8px">
                Primäre Muskeln: <strong>${ex.desc}</strong> · Equipment: ${ex.equip} · Kategorie: ${ex.cat}
              </div>
              <div style="display:flex;gap:6px">
                <div style="font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-sm);background:var(--accent-training);color:#fff;cursor:pointer">+ Zur Routine</div>
                <div style="font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-secondary);cursor:pointer">History ansehen</div>
                <div style="font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-secondary);cursor:pointer">Bewertung: ${ex.score}/100</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="card">
          <div class="card-header"><div class="card-title">Typ-Filter</div></div>
          ${types.map((t,i)=>`<div style="padding:6px 8px;border-radius:var(--r-sm);background:${i===0?'var(--surface-hover)':'transparent'};font-size:var(--text-xs);color:${i===0?'var(--text-primary)':'var(--text-secondary)'};cursor:pointer;margin-bottom:2px">${i===0?'✓ ':''} ${t}</div>`).join('')}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Effektivitäts-Score</div></div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">Basiert auf SFR (Stimulus/Fatigue), Stretch-Position, Tension</div>
          ${[{r:'90-100',c:'var(--brand-700)',l:'Elite — beste Wahl'},{r:'80-89',c:'#f59e0b',l:'Sehr gut'},{r:'70-79',c:'var(--text-secondary)',l:'Gut'},{r:'<70',c:'var(--text-muted)',l:'Akzeptabel'}].map(s=>`
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
              <div style="width:36px;font-size:var(--text-micro);font-weight:var(--fw-bold);color:${s.c}">${s.r}</div>
              <div style="font-size:var(--text-micro);color:var(--text-secondary)">${s.l}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
};
