// features/nutrition/GoalsView.js
// Ernährung · Ziele: Aktives Ziel, TDEE, Makro Cycling (Training vs. Rest), Adaptive TDEE, History

window.Nutrition_GoalsView = function() {
  return `
    <div class="card" style="border:2px solid var(--brand-200)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);background:var(--brand-50);display:flex;align-items:center;justify-content:center;font-size:18px">🎯</div>
        <div>
          <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Aktives Ziel: Körperfett reduzieren</div>
          <div style="font-size:var(--text-micro);color:var(--text-muted)">1. April 2026 → 30. Juni 2026 · 3.2kg verbleibend</div>
        </div>
      </div>
      <div class="progress-track" style="margin-bottom:10px">
        <div class="progress-fill" style="width:33%;background:var(--brand-500)"></div>
      </div>
      <div class="data-row"><div class="data-label">Kalorienziel</div><div class="data-val">2.100 kcal/Tag</div></div>
      <div class="data-row"><div class="data-label">Defizit</div><div class="data-val">-400 kcal vs. TDEE</div></div>
      <div class="data-row"><div class="data-label">Erwarteter Verlust</div><div class="data-val">~0.4 kg/Woche</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🔄 Makro Cycling</div><div class="badge badge-blue">Training vs. Rest</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;margin-bottom:8px">
        <div style="font-size:var(--text-micro);color:var(--text-muted);padding:6px 8px;border-bottom:2px solid var(--surface-border)"></div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--accent-training);text-align:center;padding:6px 4px;border-bottom:2px solid var(--accent-training)">🏋️ Training</div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-muted);text-align:center;padding:6px 4px;border-bottom:2px solid var(--surface-border)">😴 Rest</div>
      </div>
      ${[
        {lbl:'Kalorien',  train:'2.300 kcal',rest:'1.900 kcal'},
        {lbl:'Protein',   train:'175g',       rest:'165g'},
        {lbl:'Kohlenhy.', train:'280g',       rest:'160g'},
        {lbl:'Fett',      train:'72g',        rest:'78g'},
      ].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;padding:6px 0;border-bottom:1px solid var(--surface-border)">
          <div style="font-size:var(--text-xs);color:var(--text-secondary);padding-left:8px">${r.lbl}</div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--accent-training);text-align:center">${r.train}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);text-align:center">${r.rest}</div>
        </div>`).join('')}
      <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:8px;padding-left:8px">Heute: Trainingstag → 2.300 kcal Ziel</div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📊 Adaptive TDEE</div><div class="badge badge-green">aktualisiert</div></div>
      <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:12px;margin-bottom:12px;border:1px solid var(--surface-border)">
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Gemessener TDEE (letzte 2 Wochen)</div>
        <div style="font-size:22px;font-weight:var(--fw-bold);color:var(--brand-700)">2.520 kcal</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">+20 kcal vs. Startberechnung (Anpassung: Aktivität leicht höher)</div>
      </div>
      <div class="data-row"><div class="data-label">Grundumsatz (BMR)</div><div class="data-val">1.890 kcal</div></div>
      <div class="data-row"><div class="data-label">Aktivitätsfaktor</div><div class="data-val">1.55 → 1.57 angepasst</div></div>
      <div class="data-row"><div class="data-label">TDEE berechnet</div><div class="data-val">2.500 kcal</div></div>
      <div class="data-row"><div class="data-label">TDEE adaptiv</div><div class="data-val" style="color:var(--brand-700)">2.520 kcal</div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Ziel-Verlauf</div></div>
      ${[
        {name:'Gewicht reduzieren',   status:'aktiv',    result:'85.2kg / 82kg Ziel'},
        {name:'Proteinziel 150g/Tag', status:'erreicht', result:'Ø 152g über 4 Wochen'},
        {name:'Wasserintake 3L/Tag',  status:'laufend',  result:'Ø 2.4L / 3L'},
      ].map(z=>`
        <div class="data-row">
          <div style="flex:1">
            <div class="data-label">${z.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${z.result}</div>
          </div>
          <div class="badge badge-${z.status==='erreicht'?'green':z.status==='aktiv'?'blue':'orange'}">${z.status}</div>
        </div>`).join('')}
    </div>
  `;
};
