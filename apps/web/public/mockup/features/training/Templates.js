// features/training/Templates.js
// Training → Vorlagen: Coach-Programme, Marketplace, AI-erstellte Pläne, Assign-Flow

window.Training_Templates = function() {
  const templates = [
    {name:'Push/Pull/Legs Hypertrophie',source:'coach',badge:'Von Coach Mueller',badgeColor:'#3b82f6',
     weeks:12,kcal_note:'Kraftzuwachs + Muskelaufbau',freq:'4-5×/Woche',status:'Empfohlen',
     compliance:null,desc:'12-Wochen PPL Programm, Double Progression, wöchentliche Volumensteigerung'},
    {name:'Lean Bulk 2026',            source:'marketplace',badge:'Marketplace',badgeColor:'#f97316',
     weeks:12,kcal_note:'Lean Bulk Phase',freq:'4×/Woche',status:'Gekauft',
     compliance:null,desc:'Strukturierter Lean Bulk mit Periodisierung und Deload-Wochen'},
    {name:'3-Tage Ganzkörper',          source:'buddy',badge:'AI erstellt',badgeColor:'var(--brand-600)',
     weeks:8,kcal_note:'Basis-Muskelaufbau',freq:'3×/Woche',status:'Bereit',
     compliance:null,desc:'Buddy-generiertes 3-Tage Full Body Programm für Intermediate'},
    {name:'Powerlifting Vorbereitung',  source:'marketplace',badge:'Marketplace',badgeColor:'#f97316',
     weeks:16,kcal_note:'Kraft-Peaking',freq:'4×/Woche',status:'Verfügbar',
     compliance:null,desc:'16-Wochen Peak-Vorbereitung auf Wettkampf (Bench/Squat/Deadlift)'},
  ];

  const sourceIcon = {coach:'🏋️',marketplace:'🛒',buddy:'🤖',user:'👤'};

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">
        ${[{l:'Alle',active:true},{l:'Von Coach'},{l:'Marketplace'},{l:'AI erstellt'},{l:'Eigene'}].map((f,i)=>`
          <div style="padding:4px 10px;border-radius:var(--r-full);background:${f.active?'var(--accent-training)':'var(--surface-hover)'};color:${f.active?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer;border:1px solid ${f.active?'var(--accent-training)':'var(--surface-border)'}">
            ${f.l}
          </div>`).join('')}
      </div>

      ${templates.map(t=>`
        <div class="card">
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
            <div style="width:36px;height:36px;border-radius:var(--r-md);background:${t.badgeColor}20;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${sourceIcon[t.source]}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
                <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${t.name}</span>
                <span style="font-size:9px;padding:1px 6px;border-radius:var(--r-full);background:${t.badgeColor}20;color:${t.badgeColor};border:1px solid ${t.badgeColor}40;font-weight:600">${t.badge}</span>
              </div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">${t.desc}</div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                ${[{v:t.weeks+'W',l:'Dauer'},{v:t.freq,l:'Frequenz'},{v:t.kcal_note,l:'Fokus'}].map(s=>`
                  <span style="font-size:var(--text-micro);color:var(--text-secondary)"><strong style="color:var(--text-primary)">${s.v}</strong> ${s.l}</span>`).join('')}
              </div>
            </div>
            <div style="flex-shrink:0">
              <span class="badge badge-${t.status==='Empfohlen'?'green':t.status==='Gekauft'||t.status==='Bereit'?'blue':'gray'}">${t.status}</span>
            </div>
          </div>
          <div style="border-top:1px solid var(--surface-border);padding-top:10px;display:flex;gap:6px">
            <div style="flex:1;padding:7px;text-align:center;border-radius:var(--r-md);background:var(--accent-training);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">▶ Aktivieren</div>
            <div style="padding:7px 12px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">Vorschau</div>
            <div style="padding:7px 12px;border-radius:var(--r-md);background:var(--surface-hover);color:var(--text-secondary);font-size:var(--text-xs);cursor:pointer">Kopieren</div>
          </div>
        </div>`).join('')}

      <div style="text-align:center;padding:12px 0">
        <div style="display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);padding:10px 20px;border-radius:var(--r-md);border:1px dashed var(--surface-border);cursor:pointer;background:var(--surface-card)">
          ✨ AI-Trainingsplan generieren
        </div>
      </div>
    </div>
  `;
};
