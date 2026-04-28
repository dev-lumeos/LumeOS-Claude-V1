// features/training/RoutineList.js — ENHANCED
// Kategorie-Filter, Routine-Preview (Expand), Source-Badges, Volumen-Schätzung

window.Training_RoutineList = function() {
  const cats = ['Alle','Push','Pull','Legs','Full Body','Cardio','Recovery'];
  const routines = [
    {name:'PPL Push Day A',      cat:'Push',    exercises:5, vol:'~11.200kg', dur:'52min',lastUsed:'gestern', source:'user',
     exs:['Bankdrücken 4×8-10','Schrägbankdrücken 3×10','Schulterdrücken 4×8','Seitheben 3×15','Trizeps Pushdown 3×12']},
    {name:'PPL Pull Day B',      cat:'Pull',    exercises:6, vol:'~9.800kg',  dur:'48min',lastUsed:'vor 3T', source:'user',
     exs:['Kreuzheben 3×5','Klimmzüge 3×6-8','Kabelrudern 3×10','Bizeps Curl 3×12','Facepull 3×15']},
    {name:'PPL Legs Day C',      cat:'Legs',    exercises:5, vol:'~16.400kg', dur:'65min',lastUsed:'vor 4T', source:'user',
     exs:['Kniebeugen 5×5','Beinpresse 3×10','Romanian DL 4×8','Beinbeuger 3×12','Wadenheben 4×15']},
    {name:'Upper Body Strength', cat:'Push',    exercises:7, vol:'~8.500kg',  dur:'58min',lastUsed:'vor 2W', source:'coach',
     badge:'Von Coach Mueller', badgeColor:'#3b82f6',
     exs:['Bankdrücken 5×3','Kurzhantel OHP 4×5','Trizeps Dips 3×8']},
    {name:'Lean Bulk Prog.1',    cat:'Full Body',exercises:8,vol:'~12.000kg', dur:'70min',lastUsed:'nie',    source:'marketplace',
     badge:'Marketplace',badgeColor:'#f97316',
     exs:['Kniebeugen 3×8','Bankdrücken 3×8','Klimmzüge 3×8']},
    {name:'Zone 2 Cardio 30min', cat:'Cardio',  exercises:1, vol:'—',         dur:'30min',lastUsed:'vor 8T', source:'user',
     exs:['Treadmill 30min @65% HFmax']},
    {name:'Morgen Mobility',     cat:'Recovery',exercises:8, vol:'—',         dur:'20min',lastUsed:'vor 2W', source:'buddy',
     badge:'AI erstellt',badgeColor:'var(--brand-600)',
     exs:['Hip Flexor Stretch','Thoracic Rotation','Hip 90/90']},
  ];

  return `
    <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap">
      ${cats.map((c,i)=>`
        <div style="padding:4px 10px;border-radius:var(--r-full);background:${i===0?'var(--accent-training)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);font-weight:var(--fw-medium);cursor:pointer;border:1px solid ${i===0?'var(--accent-training)':'var(--surface-border)'}">
          ${c}
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Routinen</div>
        <div style="display:flex;gap:6px">
          <span class="badge badge-gray">7 gespeichert</span>
          <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-sm);background:var(--accent-training);color:#fff;cursor:pointer">+ Neu</div>
        </div>
      </div>
      ${routines.map((r,ri)=>`
        <div style="border-bottom:1px solid var(--surface-border);padding:2px 0">
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;cursor:pointer"
            onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'block':'none'})(this)">
            <div style="width:36px;height:36px;border-radius:var(--r-md);background:${r.cat==='Push'?'#fff7ed':r.cat==='Pull'?'#eff6ff':r.cat==='Legs'?'#f5f3ff':r.cat==='Cardio'?'#f0fdf4':r.cat==='Recovery'?'#f0fdfa':'var(--surface-hover)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
              ${{Push:'🏋️',Pull:'💪',Legs:'🦵','Full Body':'🔥',Cardio:'🏃',Recovery:'🧘'}[r.cat]||'🏋️'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary)">${r.name}</span>
                ${r.badge?`<span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:${r.badgeColor}20;color:${r.badgeColor};border:1px solid ${r.badgeColor}40">${r.badge}</span>`:''}
                <span style="font-size:var(--text-micro);padding:1px 6px;border-radius:var(--r-full);background:var(--surface-hover);color:var(--text-muted)">${r.cat}</span>
              </div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">${r.exercises} Übungen · ${r.dur} · ${r.vol} · zuletzt ${r.lastUsed}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
              <div style="font-size:var(--text-micro);padding:4px 8px;border-radius:var(--r-sm);background:var(--accent-training);color:#fff;cursor:pointer;text-align:center">▶ Start</div>
              <div style="font-size:10px;color:var(--text-muted);text-align:center">›</div>
            </div>
          </div>
          <div style="display:none;padding:8px 12px;background:var(--surface-card-alt);border-radius:var(--r-md);margin-bottom:8px">
            <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);margin-bottom:6px;text-transform:uppercase">Übungen:</div>
            ${r.exs.map((e,ei)=>`
              <div style="display:flex;align-items:center;gap:6px;padding:3px 0">
                <div style="width:16px;height:16px;border-radius:50%;background:var(--surface-hover);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--text-muted);flex-shrink:0">${ei+1}</div>
                <span style="font-size:var(--text-xs);color:var(--text-secondary)">${e}</span>
              </div>`).join('')}
            ${r.exercises>r.exs.length?`<div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:4px">+ ${r.exercises-r.exs.length} weitere Übungen</div>`:''}
            <div style="display:flex;gap:6px;margin-top:8px">
              <div style="font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-sm);background:var(--accent-training);color:#fff;cursor:pointer">▶ Workout starten</div>
              <div style="font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-secondary);cursor:pointer">✏️ Bearbeiten</div>
              <div style="font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-sm);background:var(--surface-hover);color:var(--text-secondary);cursor:pointer">📅 Planen</div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
};
