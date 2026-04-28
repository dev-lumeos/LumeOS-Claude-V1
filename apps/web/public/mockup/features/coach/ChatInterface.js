// features/coach/ChatInterface.js — REBUILD
// DailyBriefing Card, TrainingAdaptationCard, Chat, QuickActionBar, typing indicator

window.Coach_ChatInterface = function() {
  const quickActions = [
    {icon:'📊',label:'Mein Tag',    color:'var(--surface-hover)',tc:'var(--text-secondary)'},
    {icon:'🍽️',label:'Was essen?', color:'var(--brand-50)',    tc:'var(--brand-700)'},
    {icon:'🏋️',label:'Training?',  color:'#fff7ed',            tc:'#92400e'},
    {icon:'💊',label:'Supps Check',color:'#f0fdf4',            tc:'var(--brand-700)'},
    {icon:'🔥',label:'Motivation', color:'#fef3c7',            tc:'#92400e'},
    {icon:'📈',label:'Wochenbericht',color:'var(--semantic-info-bg)',tc:'var(--semantic-info-text)'},
  ];
  return `
    <div style="background:linear-gradient(135deg,var(--brand-50),#ecfdf5);border:1px solid var(--brand-200);border-radius:var(--r-lg);padding:14px 16px;margin-bottom:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--brand-700)">🧠 AI Coach Briefing — Montag, 27. Apr</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted)">06:42 Uhr</div>
      </div>
      ${[
        {icon:'💤',text:'Recovery 78/100 — gut erholt · HRV über Baseline',bg:'var(--brand-50)',tc:'var(--brand-700)'},
        {icon:'🏋️',text:'Push Day geplant — Volumen bei 80% empfohlen (Recovery)',bg:'#fff7ed',tc:'#92400e'},
        {icon:'🍽️',text:'Protein 83% · noch 28g offen · Pre-Workout 15:30 ideal',bg:'#eff6ff',tc:'var(--semantic-info-text)'},
        {icon:'💊',text:'Supplements: 4/6 genommen · Abend-Supps noch ausstehend',bg:'#f0fdfa',tc:'#0f766e'},
      ].map(b=>`
        <div style="background:${b.bg};border-radius:var(--r-sm);padding:6px 10px;margin-bottom:4px;font-size:var(--text-xs);font-weight:var(--fw-medium);color:${b.tc};cursor:pointer">
          ${b.icon} ${b.text}
        </div>`).join('')}
    </div>

    <div class="ai-card" style="max-width:100%;background:linear-gradient(135deg,#fff7ed,#fff)">
      <div class="ai-card-title">🏋️ Training-Anpassung — gestern Push Day</div>
      <div class="ai-card-text">Bankdrücken PR gestern (92kg×8)! Basis für heute: Pull Day, Rücken 72h erholt. Volumen bei 85% da Recovery 78. Klimmzüge + Kabelrudern + Bizeps-Curl empfohlen.</div>
      <div class="ai-actions">
        <div class="ai-btn ai-btn-primary">Pull Day starten</div>
        <div class="ai-btn ai-btn-secondary">Anpassen</div>
        <div class="ai-btn ai-btn-secondary">Übungen sehen</div>
      </div>
    </div>

    <div class="chat-area" style="flex:1">
      <div class="chat-msg-ai">Guten Morgen Tom! 🌅 Dein Recovery Score ist heute <strong>78/100</strong> — solide. Bankdrücken-PR gestern (92kg×8) 🏆. Heute empfehle ich Pull Day mit 85% Volumen. Wie geht's dir?</div>
      <div class="chat-msg-user">Super, bereit für Pull Day! Was sollte ich als Erstes machen?</div>
      <div class="chat-msg-ai">
        <div style="margin-bottom:6px">Perfekt! Hier dein optimierter Pull Day:</div>
        <div style="font-size:var(--text-micro);color:var(--text-secondary);line-height:1.6">
          🏋️ <strong>Kreuzheben</strong> — 3×5 @ 130kg (leicht unter PR für Recovery)<br>
          🔙 <strong>Klimmzüge BW+15kg</strong> — 3×6 (Bizeps frisch, gut für heute)<br>
          💪 <strong>Kabelrudern</strong> — 3×10 @ 70kg<br>
          🤜 <strong>Bizeps Curl</strong> — 3×12 @ 32kg
        </div>
        <div style="margin-top:6px;font-size:var(--text-micro);color:var(--brand-700)">Gesamt: ~52min · Volumen ~9.800kg</div>
      </div>
      <div class="chat-msg-user">Wie war mein Schlaf letzte Nacht?</div>
      <div class="chat-msg-ai">
        <div style="margin-bottom:6px">Letzte Nacht: <strong>7h 24min</strong>, HRV 58ms, Tiefschlaf 1h 42min.</div>
        <div style="font-size:var(--text-micro);color:var(--text-muted)">Monatsdurchschnitt: 7h 11min · HRV Ø 54ms · Tiefschlaf Ø 1h 31min</div>
        <div style="margin-top:6px;font-size:var(--text-micro);color:var(--brand-700)">↑ Alle drei Werte über deinem Monatsdurchschnitt — starke Nacht 🌙</div>
      </div>
      <div class="ai-card">
        <div class="ai-card-title">🍽️ Abend-Optionen für 28g Protein</div>
        <div class="ai-card-text">Option A: Lachs + Süßkartoffel — 340 kcal, 35g P ⭐<br>Option B: Magerquark + Walnüsse — 280 kcal, 30g P</div>
        <div class="ai-actions">
          <div class="ai-btn ai-btn-primary">Option A loggen</div>
          <div class="ai-btn ai-btn-secondary">Option B loggen</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;padding:4px 0">
        <div style="width:24px;height:24px;border-radius:50%;background:var(--gradient-coach);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600;flex-shrink:0">AI</div>
        <div style="display:flex;gap:3px;align-items:center">
          <div class="typing-dot" style="width:5px;height:5px;border-radius:50%;background:var(--text-muted)"></div>
          <div class="typing-dot" style="width:5px;height:5px;border-radius:50%;background:var(--text-muted)"></div>
          <div class="typing-dot" style="width:5px;height:5px;border-radius:50%;background:var(--text-muted)"></div>
        </div>
      </div>
    </div>

    <div style="margin-top:8px">
      <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:6px">⚡ Schnell-Aktionen</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">
        ${quickActions.map(a=>`
          <div style="display:flex;align-items:center;gap:4px;padding:5px 10px;border-radius:var(--r-full);background:${a.color};color:${a.tc};font-size:var(--text-micro);font-weight:var(--fw-medium);cursor:pointer;border:1px solid var(--surface-border)">
            ${a.icon} ${a.label}
          </div>`).join('')}
      </div>
      <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">Slash-Commands: <span style="font-family:var(--font-mono);color:var(--brand-700)">/essen /training /report /analyse /ziele</span></div>
    </div>
    <div class="chat-input-bar">
      <input class="chat-input" placeholder="Frag deinen AI Coach… (/ für Befehle)" />
      <button class="chat-send">↑</button>
    </div>`;
};
