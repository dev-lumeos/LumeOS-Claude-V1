// features/dashboard/InsightsView.js
// Dashboard · Insights: VirtualCoachInsights, SmartFoodSuggestions, Wochenbericht, Trends

window.Dashboard_InsightsView = function() {
  return `
    <div class="ai-card" style="max-width:100%;background:linear-gradient(135deg,#eff6ff,#eef2ff)">
      <div class="ai-card-title">🤖 Virtual Coach — Wochensummary KW 17</div>
      <div class="ai-card-text">
        <strong>Starke Woche:</strong> 4/4 Workouts erledigt, Protein-Streak 12 Tage, Schlaf verbessert (+12min Ø).
        Schwachstelle: Vitamin D bei nur 62% — Supplementierung prüfen oder mehr Sonnenlicht einplanen.<br><br>
        <strong>Fokus diese Woche:</strong> Kalorien an Trainingstagen um 100 kcal erhöhen, Wasser auf 3L steigern.
      </div>
      <div class="ai-actions">
        <div class="ai-btn ai-btn-primary">Plan anpassen</div>
        <div class="ai-btn ai-btn-secondary">Details ansehen</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🍽️ Smart Food Suggestions — heute</div></div>
      ${[
        {icon:'🐟',food:'Lachs (150g)',reason:'Omega-3 + 34g Protein — deckt deinen Nährstoffmangel',kcal:'280 kcal',badge:'empfohlen'},
        {icon:'🥦',food:'Brokkoli (200g)',reason:'Vitamin C & K, nur 70 kcal — passt ins Kalorienbudget',kcal:'70 kcal',badge:'passt'},
        {icon:'🧀',food:'Magerquark (250g)',reason:'28g Protein fürs Abendessen — Ziel fast erreicht',kcal:'175 kcal',badge:'Top'},
      ].map(f=>`
        <div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:22px;flex-shrink:0">${f.icon}</span>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${f.food}</span>
              <span class="badge badge-green">${f.badge}</span>
            </div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);line-height:1.4">${f.reason}</div>
          </div>
          <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-secondary);white-space:nowrap">${f.kcal}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Wochenbericht — KW 17</div><div class="badge badge-green">gut</div></div>
      ${[
        {label:'Ø Kalorien/Tag',val:'1.840 kcal',delta:'↓ -120 vs. Plan',up:false},
        {label:'Ø Protein/Tag', val:'142g',      delta:'↑ +8g vs. Vorwoche',up:true},
        {label:'Workouts',      val:'4 / 4',     delta:'↑ Plan erfüllt',up:true},
        {label:'Ø Schlaf',      val:'7h 18min',  delta:'↑ +12min vs. Ø',up:true},
        {label:'Ø HRV',         val:'57ms',      delta:'↑ +3ms vs. Vorwoche',up:true},
      ].map(r=>`
        <div class="data-row">
          <div class="data-label">${r.label}</div>
          <div style="text-align:right">
            <div class="data-val">${r.val}</div>
            <div class="stat-delta ${r.up?'delta-up':'delta-dn'}">${r.delta}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Trends (7 Tage)</div></div>
      <div style="margin-bottom:14px">
        <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:6px">Körpergewicht (kg)</div>
        <div style="display:flex;align-items:flex-end;height:48px;gap:4px">
          ${[87.2,86.8,86.5,86.1,85.8,85.6,85.2].map((v,i)=>`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
              <div style="width:100%;background:${i===6?'var(--brand-600)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-84)/(88-84))*44}px"></div>
              <div style="font-size:9px;color:var(--text-muted)">${v}</div>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:6px">Health Score (letzte 7 Tage)</div>
        <div style="display:flex;align-items:flex-end;height:40px;gap:4px">
          ${[81,79,84,86,81,83,87].map((v,i)=>`
            <div style="flex:1;background:${i===6?'var(--brand-600)':v>=85?'var(--brand-300)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-70)/30)*36}px"></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted);margin-top:4px">
          ${['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>`<span>${d}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
};
