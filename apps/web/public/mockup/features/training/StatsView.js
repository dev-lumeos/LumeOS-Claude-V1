// features/training/StatsView.js
// Training → Stats: Frequenz-Ring, Volumen-Chart 8W, Push/Pull/Legs Balance, Tonnage, Split-Analyse

window.Training_StatsView = function() {
  const weekVol = [65,72,78,84,80,75,88,85];
  const muscleBalance = [
    {n:'Push (Brust/Schulter/Triz)',v:48,c:'var(--accent-training)',sets:32},
    {n:'Pull (Rücken/Bizeps)',       v:38,c:'var(--accent-coach)',   sets:26},
    {n:'Legs (Quad/Hams/Gesäß)',     v:14,c:'var(--accent-goals)',   sets:10},
  ];
  const months = ['Jan','Feb','Mär','Apr'];
  const monthVol = [42,61,55,68]; // this month = 68 so far

  return `
    <div style="display:grid;grid-template-columns:1fr 260px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card">
          <div class="card-header"><div class="card-title">📈 Wöchentliches Volumen (8W)</div><div class="badge badge-green">↑ Trend</div></div>
          <div style="display:flex;align-items:flex-end;height:64px;gap:4px;margin-bottom:8px">
            ${weekVol.map((v,i)=>`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
                <div style="font-size:8px;color:var(--text-muted)">${v}k</div>
                <div style="width:100%;background:${i===7?'var(--accent-training)':v>80?'#fed7aa':'#ffedd5'};border-radius:2px 2px 0 0;height:${(v/88)*52}px"></div>
                <div style="font-size:8px;color:var(--text-muted)">KW${10+i}</div>
              </div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
            <span>Ø 80.9k kg/Woche</span><span style="color:var(--accent-training)">KW17: 85k ↑ +5%</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">⚖️ Push / Pull / Legs Balance</div><div class="badge badge-orange">⚠️ Legs unter 20%</div></div>
          ${muscleBalance.map(m=>`
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:var(--text-xs);color:var(--text-primary)">${m.n}</span>
                <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${m.c}">${m.v}% · ${m.sets} Sets</span>
              </div>
              <div class="progress-track" style="height:8px"><div class="progress-fill" style="width:${m.v}%;background:${m.c}"></div></div>
            </div>`).join('')}
          <div style="background:var(--semantic-warning-bg);border-radius:var(--r-sm);padding:8px 10px;font-size:var(--text-micro);color:var(--semantic-warning-text);margin-top:4px">
            ⚠️ Legs-Volumen bei 14% — empfohlen ≥30%. Mehr Kniebeugen / RDL einplanen.
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">📅 Monatliches Volumen</div></div>
          <div style="display:flex;align-items:flex-end;height:56px;gap:8px;margin-bottom:6px">
            ${months.map((m,i)=>`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${monthVol[i]}k</div>
                <div style="width:100%;background:${i===3?'var(--accent-training)':'var(--brand-100)'};border-radius:3px 3px 0 0;height:${(monthVol[i]/70)*50}px"></div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${m}</div>
              </div>`).join('')}
          </div>
        </div>

      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">📊 Trainingsfrequenz</div></div>
          <div style="position:relative;width:88px;height:88px;margin:0 auto 12px">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="var(--surface-hover)" stroke-width="8"/>
              <circle cx="44" cy="44" r="36" fill="none" stroke="var(--accent-training)" stroke-width="8"
                stroke-dasharray="${(4/7)*226} 226" stroke-linecap="round" transform="rotate(-90 44 44)"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
              <div style="font-size:22px;font-weight:800;color:var(--accent-training)">4</div>
              <div style="font-size:9px;color:var(--text-muted)">diese Woche</div>
            </div>
          </div>
          <div class="data-row"><div class="data-label">Ø Sessions/Woche</div><div class="data-val" style="color:var(--brand-700)">4.2</div></div>
          <div class="data-row"><div class="data-label">Bester Streak</div><div class="data-val">4 Wochen</div></div>
          <div class="data-row"><div class="data-label">Sessions gesamt</div><div class="data-val">47</div></div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">💰 Tonnage-Rekorde</div></div>
          ${[
            {l:'Beste Woche', v:'88.4k kg',d:'KW 16'},
            {l:'Bester Tag',  v:'15.8k kg',d:'24. Apr'},
            {l:'Bester Monat',v:'320k kg',d:'März 2026'},
          ].map(r=>`
            <div class="data-row">
              <div style="flex:1">
                <div class="data-label">${r.l}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.d}</div>
              </div>
              <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--accent-training)">${r.v}</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Split-Analyse</div></div>
          <div class="data-row"><div class="data-label">Aktueller Split</div><div class="data-val">PPL</div></div>
          <div class="data-row"><div class="data-label">Push/Pull Ratio</div><div class="data-val" style="color:var(--semantic-warning-text)">1.26 ⚠️</div></div>
          <div class="data-row"><div class="data-label">Consistency</div><div class="data-val" style="color:var(--brand-700)">85%</div></div>
        </div>
      </div>
    </div>
  `;
};
