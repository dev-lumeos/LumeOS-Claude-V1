// features/goals/OverviewView.js
// Ziele · Übersicht: ProgressBanner, StreakWidget (visual dots), AlignmentCard, Goal Cards

window.Goals_OverviewView = function() {
  const goals = [
    {icon:'⚖️',title:'Körpergewicht: 82 kg',  deadline:'30. Jun 2026',current:'85.2kg',target:'82kg',   pct:68,color:'var(--accent-goals)'},
    {icon:'💪',title:'Bankdrücken: 110 kg × 5',deadline:'1. Aug 2026', current:'90kg×8',target:'110kg×5',pct:82,color:'#ec4899'},
    {icon:'🏃',title:'5km unter 22 Minuten',   deadline:'15. Mai 2026',current:'24:12',target:'22:00',   pct:45,color:'var(--accent-training)'},
  ];
  const streakDays = Array.from({length:14},(_,i)=>({
    day:i+1,active:i<12,today:i===12,
  }));
  return `
    <div style="background:var(--gradient-goals);border-radius:var(--r-lg);padding:16px 20px;color:#fff">
      <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Gesamt-Fortschritt</div>
      <div style="display:flex;align-items:center;gap:16px">
        <div>
          <div style="font-size:32px;font-weight:var(--fw-bold)">65%</div>
          <div style="font-size:var(--text-xs);color:rgba(255,255,255,.75)">Ø aller Ziele</div>
        </div>
        <div style="flex:1">
          <div style="background:rgba(255,255,255,.25);border-radius:4px;height:8px;overflow:hidden">
            <div style="width:65%;height:100%;background:#fff;border-radius:4px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:var(--text-micro);color:rgba(255,255,255,.7)">
            <span>2 von 3 auf Kurs</span><span>1 hinter Plan</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🔥 Ziel-Streak</div><div style="font-size:22px;font-weight:var(--fw-bold);color:var(--brand-700)">12 Tage</div></div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
        ${streakDays.map(d=>`
          <div style="width:18px;height:18px;border-radius:3px;background:${d.today?'var(--brand-600)':d.active?'var(--brand-200)':'var(--surface-hover)'};border:${d.today?'2px solid var(--brand-700)':'none'}" title="Tag ${d.day}"></div>`).join('')}
      </div>
      <div style="font-size:var(--text-micro);color:var(--text-muted)">Heute: Tag 13 · Längstes Streak: 14 Tage</div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🔗 Modul-Alignment</div><div class="badge badge-blue">Sync-Check</div></div>
      <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:10px">Unterstützen deine Module deine Ziele?</div>
      ${[
        {mod:'🍽️ Ernährung', score:87, ok:true,  note:'Protein-Ziel auf Kurs'},
        {mod:'🏋️ Training',  score:82, ok:true,  note:'Volumen optimal für Kraft-Ziel'},
        {mod:'😴 Recovery',  score:78, ok:true,  note:'Ausreichend für Progression'},
        {mod:'💊 Supplements',score:94,ok:true,  note:'Stack unterstützt Körperfett-Ziel'},
        {mod:'💧 Wasser',    score:70, ok:false, note:'Unter Ziel — Fettabbau verlangsamt'},
      ].map(m=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:13px;flex-shrink:0">${m.ok?'✅':'⚠️'}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${m.mod}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.note}</div>
          </div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${m.ok?'var(--brand-700)':'var(--semantic-warning-text)'}">${m.score}%</div>
        </div>`).join('')}
    </div>

    ${goals.map(g=>`
      <div class="goal-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:20px">${g.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary)">${g.title}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Deadline: ${g.deadline}</div>
          </div>
          <div class="badge badge-${g.pct>=70?'green':'orange'}">${g.pct}%</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:var(--text-micro);color:var(--text-muted)">Aktuell: <strong style="color:var(--text-primary)">${g.current}</strong></span>
          <span style="font-size:var(--text-micro);color:var(--text-muted)">Ziel: <strong style="color:var(--text-primary)">${g.target}</strong></span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${g.pct}%;background:${g.color}"></div></div>
      </div>`).join('')}
  `;
};
