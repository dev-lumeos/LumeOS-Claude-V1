# Claude Code Prompt — LUMEOS Mockup Vollausbau

## Kontext

Du arbeitest im Repo `D:\GitHub\LumeOS-Claude-V1`.

Altes Repo als Referenz: `temp/lumeosold/`
Mockup-Shell: `apps/web/public/mockup/index.html`
Design Tokens: `apps/web/public/mockup/tokens.css`

---

## WICHTIG — Token-Limit vermeiden

**Schreibe NIEMALS die komplette index.html in einem einzigen Write.**
Stattdessen: Modulare Struktur — jedes Modul als eigene JS-Datei.

**Ziel-Struktur nach diesem Task:**
```
apps/web/public/mockup/
  index.html          ← Shell + Sidebar + Script-Loader (kurz)
  tokens.css          ← Design Tokens (nicht anfassen)
  modules/
    dashboard.js
    nutrition.js
    training.js
    coach.js
    goals.js
    supplements.js
    recovery.js
    medical.js
    intelligence.js
    analytics.js
    marketplace.js
    admin.js
```

Jede module/*.js Datei exportiert eine `render[ModuleName](tab)` Funktion als globale Variable.

---

## Phase 1 — index.html zur Shell umbauen

Ersetze den kompletten `<script>` Block in `index.html` durch einen schlanken Loader:

```html
<!-- Module laden -->
<script src="modules/dashboard.js"></script>
<script src="modules/nutrition.js"></script>
<script src="modules/training.js"></script>
<script src="modules/coach.js"></script>
<script src="modules/goals.js"></script>
<script src="modules/supplements.js"></script>
<script src="modules/recovery.js"></script>
<script src="modules/medical.js"></script>
<script src="modules/intelligence.js"></script>
<script src="modules/analytics.js"></script>
<script src="modules/marketplace.js"></script>
<script src="modules/admin.js"></script>

<script>
const MODULES = {
  dashboard:    { icon:'📊', title:'Dashboard',    desc:'Guten Morgen, Tom — 27. April 2026',    gradient:'g-dashboard',    kpis:[{val:'87',lbl:'Health Score'},{val:'4',lbl:'Offene Tasks'},{val:'12T',lbl:'Streak 🔥'}],  tabs:['🏠 Heute','🔮 Insights','🧠 Intelligence'], render: window.renderDashboard },
  nutrition:    { icon:'🍽️', title:'Ernährung',   desc:'Dein Tagesprotokoll — 27. April 2026',   gradient:'g-nutrition',    kpis:[{val:'1.840',lbl:'Kalorien 🔥'},{val:'142g',lbl:'Protein 💪'},{val:'2.1L',lbl:'Wasser 💧'}], tabs:['📋 Tagebuch','💡 Insights','🎯 Ziele','🌡️ Heatmap'], render: window.renderNutrition },
  training:     { icon:'🏋️', title:'Training',    desc:'Push Day — Woche 18, Tag 3',             gradient:'g-training',     kpis:[{val:'4',lbl:'Workouts 🏅'},{val:'12.400',lbl:'Volumen kg'},{val:'82%',lbl:'Adherenz'}],   tabs:['📅 Kalender','📜 History','🗓️ Plan','⚡ Live','📚 Routinen'], render: window.renderTraining },
  coach:        { icon:'🤖', title:'AI Coach',     desc:'Dein persönlicher Gesundheits-Assistent', gradient:'g-coach',       kpis:[{val:'94',lbl:'Health Score'},{val:'12',lbl:'Empfehlungen'},{val:'7',lbl:'Streak'}],      tabs:['💬 Chat','🧭 Entscheidungen','📊 Trends','🧠 Memory'], render: window.renderCoach },
  goals:        { icon:'🎯', title:'Ziele',        desc:'3 aktive Ziele · 2 auf Kurs',            gradient:'g-goals',        kpis:[{val:'3',lbl:'Aktive Ziele'},{val:'68%',lbl:'Ø Fortschritt'},{val:'12',lbl:'Streak'}],     tabs:['🎯 Übersicht','📉 Körper','📈 Trends','🧠 Intelligenz'], render: window.renderGoals },
  supplements:  { icon:'💊', title:'Supplements',  desc:'Stack für heute — 4/6 genommen',         gradient:'g-supplements',  kpis:[{val:'4/6',lbl:'Heute ✅'},{val:'94%',lbl:'Adherenz'},{val:'8',lbl:'Stack Items'}],       tabs:['☀️ Heute','🧪 Stack','🔬 Enhanced'], render: window.renderSupplements },
  recovery:     { icon:'😴', title:'Recovery',     desc:'Erholung & Schlaf · HRV-Tracking',       gradient:'g-recovery',     kpis:[{val:'78',lbl:'Recovery Score'},{val:'7.4h',lbl:'Schlaf 🌙'},{val:'58ms',lbl:'HRV'}],    tabs:['📊 Übersicht','😴 Schlaf','💓 HRV','📝 Log'], render: window.renderRecovery },
  medical:      { icon:'🩺', title:'Medical',      desc:'Gesundheitsdaten & Laborwerte',          gradient:'g-medical',      kpis:[{val:'3',lbl:'Einträge'},{val:'2',lbl:'Checkups'},{val:'gut',lbl:'Status'}],             tabs:['📋 Übersicht','🧪 Laborwerte','💉 Medikamente'], render: window.renderMedical },
  memory:       { icon:'🧠', title:'Intelligence', desc:'Cross-Modul Korrelationen & Insights',   gradient:'g-memory',       kpis:[{val:'142',lbl:'Datenpunkte'},{val:'8',lbl:'Korrelationen'},{val:'3',lbl:'Alerts'}],      tabs:['🔗 Korrelationen','📊 Patterns','🚨 Alerts'], render: window.renderIntelligence },
  analytics:    { icon:'📈', title:'Analytics',    desc:'System Performance & Metriken',          gradient:'g-analytics',    kpis:[{val:'534',lbl:'Events/Tag'},{val:'99.2%',lbl:'Uptime'},{val:'12ms',lbl:'Latenz'}],      tabs:['📊 Overview','📈 Charts','📋 Reports'], render: window.renderAnalytics },
  marketplace:  { icon:'🛒', title:'Marketplace',  desc:'Apps & Integrationen',                   gradient:'g-marketplace',  kpis:[{val:'24',lbl:'Apps'},{val:'3',lbl:'Aktiv'},{val:'2',lbl:'Updates'}],                   tabs:['🛒 Entdecken','✅ Installiert','⭐ Featured'], render: window.renderMarketplace },
  admin:        { icon:'⚙️', title:'Admin',        desc:'System-Konfiguration & Settings',        gradient:'g-admin',        kpis:[{val:'12',lbl:'Module'},{val:'3',lbl:'User'},{val:'aktiv',lbl:'Status'}],              tabs:['⚙️ Einstellungen','👥 Users','🔐 Sicherheit'], render: window.renderAdmin },
};

let activeModule='nutrition', activeTab=0;

function switchModule(key) {
  activeModule=key; activeTab=0;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const n=document.getElementById('nav-'+key);
  if(n) n.classList.add('active');
  renderModule();
}

function switchTab(idx) { activeTab=idx; renderModule(); }

function renderModule() {
  const m=MODULES[activeModule];
  const main=document.getElementById('main-area');
  const kpiHTML=m.kpis.map(k=>`<div class="kpi-tile"><div class="kpi-val">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
  const tabsHTML=m.tabs.map((t,i)=>`<div class="tab-btn ${i===activeTab?'active':''}" onclick="switchTab(${i})">${t}</div>`).join('');
  main.innerHTML=`
    <div class="module-header">
      <div class="module-header-inner ${m.gradient}">
        <div class="module-header-top">
          <div class="module-header-icon">${m.icon}</div>
          <div class="module-header-text"><h1>${m.title}</h1><p>${m.desc}</p></div>
        </div>
        <div class="kpi-row">${kpiHTML}</div>
      </div>
    </div>
    <div class="tab-nav">${tabsHTML}</div>
    <div class="content module-content">${m.render(activeTab)}</div>`;
}

renderModule();
</script>
```

**Behalte den kompletten HTML-Head und Sidebar-HTML unverändert.**
Ersetze nur den `<script>` Block am Ende.

---

## Phase 2 — Verzeichnis anlegen

```
mkdir apps/web/public/mockup/modules
```

---

## Phase 3 — Jedes Modul als eigene JS-Datei

Schreibe jede Datei einzeln. Jede Datei hat exakt dieses Format:

```js
// modules/nutrition.js
window.renderNutrition = function(tab) {
  if (tab === 0) return `... Tagebuch HTML ...`;
  if (tab === 1) return `... Insights HTML ...`;
  if (tab === 2) return `... Ziele HTML ...`;
  if (tab === 3) return `... Heatmap HTML ...`;
  return '';
};
```

---

## Was jedes Modul enthalten muss

Lies das alte Repo für jedes Modul gründlich:

### nutrition.js — `temp/lumeosold/apps/app/modules/nutrition/`
- Tab 0 (Tagebuch): Makro-Rings oder Progress-Bars (P/KH/F), Kalorien-Zähler, 4 Mahlzeiten mit Expandierung, Wasser-Tracker (Gläser-Visual), Smart Suggestion Box
- Tab 1 (Insights): Stats-Grid 4er, Nährstoff-Analyse (5 Mikronährstoffe mit Ampel-Farben), Makro-Trend letzte 7 Tage (Balken)
- Tab 2 (Ziele): Aktives Ernährungs-Ziel mit Fortschritt, TDEE-Berechnung anzeigen, Makro-Splitting, Ziel-Verlauf
- Tab 3 (Heatmap): 7×5 Grid (Woche × Tage), Farb-Intensität = Kalorien-Coverage, Legende

### training.js — `temp/lumeosold/apps/app/modules/training/`
- Tab 0 (Kalender): Monats-Grid, Workout-Dots, Wochensummary
- Tab 1 (History): Workout-Liste letzte 5, je expandierbar mit Sets
- Tab 2 (Plan): 7-Tage-Plan (Mo-So), jeder Tag mit geplanter Session
- Tab 3 (Live): Großer Timer, aktuelle Übung hervorgehoben, Sets-Tabelle mit Check-Buttons, Next-Exercise Preview
- Tab 4 (Routinen): Saved Routines als Cards

### coach.js — `temp/lumeosold/apps/app/modules/coach/`
- Tab 0 (Chat): 5-6 Chat-Nachrichten, AI-Cards mit Actions, Typing-Indicator, Input-Bar
- Tab 1 (Entscheidungen): Decision-Feed (5 Einträge, Datum/Aktion/Status)
- Tab 2 (Trends): Health-Score Chart 30T, Top-Korrelationen, Insight-Cards
- Tab 3 (Memory): Strukturierte Wissens-Übersicht (Ziele, Präferenzen, Muster, Körper-Daten)

### goals.js — `temp/lumeosold/apps/app/modules/goals/`
- Tab 0 (Übersicht): 3 Ziele mit Progress, Streak-Widget, Weekly Progress Banner
- Tab 1 (Körper): Maße-Tabelle (Gewicht/Körperfett/Hüfte/Taille/Brust), Trend-Pfeile, Entry-Form
- Tab 2 (Trends): Gewichts-Chart (Linie simuliert mit Balken), Body-Composition Trend
- Tab 3 (Intelligenz): Cross-Module Correlations, Goal Alignment Score, Empfehlungen

### supplements.js — `temp/lumeosold/apps/app/modules/supplements/`
- Tab 0 (Heute): Morgen-Protokoll (6 Items mit Check), Abend-Protokoll (3 Items), Adherenz-Streak
- Tab 1 (Stack): 8 Supplements als Cards (Name, Dosis, Timing, Zweck, Kategorie-Badge)
- Tab 2 (Enhanced): Wirkstoff-Details, Evidenz-Level (🟢🟡🔴), Interaktions-Warnung falls vorhanden

### recovery.js — `temp/lumeosold/apps/app/modules/recovery/`
- Tab 0 (Übersicht): Score-Circle groß, 4er Stats-Grid, Schlafphasen-Bar, Empfehlung
- Tab 1 (Schlaf): 7-Tage Schlaf-Qualität Balken, Einschlaf/Aufwach-Zeiten, Tiefschlaf-Anteil
- Tab 2 (HRV): 14-Tage HRV-Trend (Balken), Baseline, Ausreißer-Markierung, Status-Interpretation
- Tab 3 (Log): Recovery Log letzte 5 Einträge (Erschöpfung 1-10, Muskelkater, Stress, Notiz)

### medical.js
- Tab 0 (Übersicht): Checkup-Liste, Gesundheitsstatus-Cards (Herz/Blut/Hormone/Lunge)
- Tab 1 (Laborwerte): Tabelle mit Referenzwerten und Status-Ampel
- Tab 2 (Medikamente): Aktive Einnahmen mit Timing

### intelligence.js
- Tab 0 (Korrelationen): Top 5 Korrelationen mit r-Wert-Badge, Beschreibung, Zeitraum
- Tab 1 (Patterns): 4-5 erkannte Muster mit Häufigkeit + Konfidenz
- Tab 2 (Alerts): 3 Alerts nach Priorität (hoch/mittel/niedrig)

### analytics.js
- Tab 0 (Overview): System-Stats, Modul-Nutzung als Horizontal-Bars
- Tab 1 (Charts): Aktivitäts-Heatmap 7×24, Tages-Aktivitätskurve
- Tab 2 (Reports): Report-Liste als Cards mit Download-Button (Dummy)

### marketplace.js
- Tab 0 (Entdecken): 6-8 App-Cards im Grid (Icon, Name, Beschreibung, Install-Btn)
- Tab 1 (Installiert): 3 aktive Integrationen mit Status
- Tab 2 (Featured): 3 große Featured Cards

### admin.js
- Tab 0 (Einstellungen): Module-Toggle-Grid (alle 12 Module an/aus), Theme-Picker (3 Optionen Dummy)
- Tab 1 (Users): User-Tabelle mit Avatar/Name/Rolle/Status
- Tab 2 (Sicherheit): 2FA-Status, API-Keys (masked), Login-Log

### dashboard.js
- Tab 0 (Heute): Morning Briefing, Health-Score Übersicht (alle Module als klickbare Mini-Cards), Action Plan, Korrelationen
- Tab 1 (Insights): Wöchentlicher Report, Top-Metriken im Trend, Empfehlungen
- Tab 2 (Intelligence): Cross-Module Correlations ausführlich, Pattern Summary

---

## Design-Regeln

**Nur CSS-Vars aus tokens.css:**
```js
// ✅ Richtig
`style="color:var(--brand-700)"`
`style="background:var(--surface-card)"`
`class="card"` // nutzt intern var(--surface-card) etc.

// ❌ Falsch
`style="color:#15803d"`
`style="background:#ffffff"`
```

**Keine externen Libraries** — Charts mit HTML/CSS:
```js
// Balken-Chart
`<div style="display:flex;align-items:flex-end;height:60px;gap:3px">
  ${data.map(v=>`<div style="flex:1;background:var(--brand-500);border-radius:2px 2px 0 0;height:${(v/max)*100}%"></div>`).join('')}
</div>`

// Heatmap-Grid
`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">
  ${cells.map(v=>`<div style="aspect-ratio:1;border-radius:3px;background:var(--brand-${intensity(v)})"></div>`).join('')}
</div>`
```

**Realistische Daten:**
```js
const weights = [87.2, 86.8, 86.5, 86.1, 85.8, 85.6, 85.2]; // kg, realistischer Trend
const hrv = [54, 58, 52, 61, 57, 63, 58, 55, 60, 59, 56, 62, 58, 61]; // ms
const sleep = [7.2, 6.8, 7.5, 8.1, 6.9, 7.4, 7.1]; // Stunden
```

---

## Reihenfolge

1. `index.html` Script-Block ersetzen (Phase 1)
2. `modules/` Verzeichnis anlegen
3. Dann Modul für Modul — in dieser Reihenfolge:
   `nutrition.js` → `training.js` → `coach.js` → `recovery.js` → `goals.js` → `supplements.js` → `dashboard.js` → `medical.js` → `intelligence.js` → `analytics.js` → `marketplace.js` → `admin.js`
4. Nach jedem Modul: kurz verifizieren dass die Datei valides JS ist

**Jedes Modul ist ein separater Write — kein Token-Limit Problem.**
