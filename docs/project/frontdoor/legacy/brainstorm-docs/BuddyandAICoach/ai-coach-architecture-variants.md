# AI Coach — 3 Architektur-Varianten

**Date:** 2026-02-17
**Status:** Entscheidung ausstehend — alle 3 Varianten ausgearbeitet

---

## Übersicht

| | Variante A | Variante B | Variante C |
|---|---|---|---|
| **Name** | Rules-First | LLM-First (Agent) | Hybrid |
| **Wer entscheidet?** | Rules Engine | LLM | Beides (Domain-abhängig) |
| **AI-Rolle** | Texter/Verpacker | Orchestrator | Kontextuelle Intelligenz |
| **Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flexibilität** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **UX** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Kosten/User** | $0.05-0.10/mo | $0.50-1.30/mo | $0.20-0.60/mo |
| **Dev-Aufwand** | Hoch (Rules) | Mittel (Prompts) | Hoch (beides) |
| **Referenz** | LUMEOS_OVERVIEW.md | Competitive Research | — |

---

## Variante A: Rules-First (LUMEOS_OVERVIEW.md Design)

### Architektur

```
┌─────────────────────────────────────────────────┐
│                    UI Layer                       │
│            Chat Interface + Cards                 │
└──────────────────────┬──────────────────────────┘
                       │ User Message
                       ▼
┌─────────────────────────────────────────────────┐
│              AI COACH LAYER                      │
│                                                   │
│  Input: DashboardOverview (JSON)                  │
│  ┌───────────────────────────────────────────┐   │
│  │ DashboardOverview = {                      │   │
│  │   nutrition: { score, macros, micros,      │   │
│  │               alerts, trends },            │   │
│  │   training:  { score, volume, prs,         │   │
│  │               readiness },                 │   │
│  │   supplements: { score, compliance,        │   │
│  │                  interactions },            │   │
│  │   recovery: { score, sleep, hrv,           │   │
│  │              fatigue },                     │   │
│  │   medical:  { scores[5], alerts,           │   │
│  │              trends }                      │   │
│  │ }                                          │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  LLM bekommt NUR dieses JSON + User Message       │
│  LLM hat KEINEN DB-Zugriff                        │
│  LLM erzeugt: Text-Antwort + optional Actions     │
│                                                   │
│  Output: Recommendations, Explanations, Actions    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            RULES ENGINE LAYER                    │
│                                                   │
│  ruleset.v1.json definiert ALLE Regeln:           │
│  - Nutrition: Macro Compliance, Micro Gaps        │
│  - Training: Volume Targets, Deload Triggers      │
│  - Supplements: Interactions, Timing Rules        │
│  - Recovery: Readiness Thresholds                 │
│  - Medical: Range Checks, Alert Triggers          │
│                                                   │
│  Input: Aggregates (read-only)                    │
│  Output: Alerts + Protocol Outputs                │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│           AGGREGATION LAYER (Read)               │
│                                                   │
│  Berechnet aus DB:                                │
│  - Scores (0-100 pro Modul)                      │
│  - Flags (ok/warn/block)                         │
│  - Trends (7/14/30 Tage)                         │
│  - Status (Training Readiness etc.)              │
│                                                   │
│  Pure Functions, deterministic, testable           │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│           ACTIONS LAYER (Write)                  │
│  Einzige Stelle für DB-Writes                    │
│  AI Coach kann Actions VORSCHLAGEN               │
│  User muss BESTÄTIGEN                            │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              DATA LAYER (DB)                     │
│          Supabase + RLS (user_id)                │
└─────────────────────────────────────────────────┘
```

### Datenfluss (Beispiel: "Wie war mein Tag?")

```
1. User: "Wie war mein Tag?"
2. System: Aggregation Layer berechnet DashboardOverview
3. System: Rules Engine evaluiert → Alerts: [protein_low, sleep_short]
4. AI Coach bekommt: { overview, alerts, user_message }
5. LLM generiert: "Dein Tag war solide (Nutrition 72/100), aber dein Protein 
   ist 35g unter Ziel. Recovery steht bei 58 — gestern nur 5.5h Schlaf. 
   Heute besser auf Protein achten und früher ins Bett."
```

### Was die AI KANN:
- ✅ Scores/Alerts in natürlicher Sprache erklären
- ✅ Tägliche/wöchentliche Summaries generieren
- ✅ Alert-Priorisierung und Erklärung
- ✅ Empfehlungen INNERHALB der Rules formulieren
- ✅ Actions vorschlagen (User bestätigt)

### Was die AI NICHT KANN:
- ❌ Eigene Berechnungen (TDEE, Macros, Scores)
- ❌ Direkt in DB schreiben
- ❌ Über Dinge sprechen die nicht im DashboardOverview sind
- ❌ Kreative Vorschläge außerhalb der Regeln
- ❌ Follow-up Fragen die Kontext aus DB brauchen

### Stärken:
- **Maximale Safety:** AI kann nichts Falsches berechnen
- **Testbar:** Rules Engine ist Pure Functions, 100% testbar
- **Günstig:** Nur 1 LLM-Call pro Interaktion mit kleinem Context
- **Konsistent:** Gleiche Daten → gleiche Regeln → gleiches Ergebnis
- **Auditierbar:** Jede Empfehlung ist auf eine Regel zurückführbar

### Schwächen:
- **Starr:** Kann nur über vordefinierte Regeln sprechen
- **Kein echtes Gespräch:** "Erkläre mir mehr über Kreatin" → geht nicht (nicht in Aggregates)
- **Rule-Explosion:** Jeder neue Use Case braucht neue Rules
- **Kein Kontext-Memory:** Kann nicht "Gestern hast du gesagt..." 
- **Keine Wissensfragen:** "Ist Ashwagandha sicher während Creatine?" → unmöglich

### Kosten:
- ~500-1000 Tokens Input (DashboardOverview JSON) + ~200-500 Output
- **~$0.05-0.10/User/Monat** bei 2 Interaktionen/Tag

### Tech Stack:
- Rules Engine: `packages/rules-engine/` (Pure TypeScript Functions)
- Scoring: `packages/scoring/` (Pure TypeScript Functions)  
- Evaluator: `packages/evaluator/` (Orchestrator)
- LLM: Claude Haiku/Sonnet (günstig, schnell)

---

## Variante B: LLM-First (Agent-Style)

### Architektur

```
┌─────────────────────────────────────────────────┐
│                    UI Layer                       │
│     Chat Interface (Conversation Thread)          │
└──────────────────────┬──────────────────────────┘
                       │ User Message + History
                       ▼
┌─────────────────────────────────────────────────┐
│              AI COACH (LLM Agent)                │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │ System Prompt:                             │   │
│  │ "Du bist der Lumeos AI Coach.              │   │
│  │  Du hast Zugriff auf alle User-Daten       │   │
│  │  über Tool-Calls. Nutze deterministische   │   │
│  │  Engines für Berechnungen."                │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌─────────────── Tool Calls ────────────────┐   │
│  │                                             │   │
│  │  get_nutrition_today()                      │   │
│  │  get_training_history(days=7)               │   │
│  │  get_supplement_stack()                     │   │
│  │  get_recovery_score()                       │   │
│  │  get_medical_latest()                       │   │
│  │  get_goals()                                │   │
│  │                                             │   │
│  │  calc_tdee(weight, activity)  ← determin.   │   │
│  │  calc_macros(goal, tdee)      ← determin.   │   │
│  │  calc_volume(muscle_group)    ← determin.   │   │
│  │  check_interactions(stack)    ← determin.   │   │
│  │  calc_recovery_score(data)    ← determin.   │   │
│  │                                             │   │
│  │  suggest_action(type, params) → User Confirm│   │
│  │  search_knowledge(query)      → RAG         │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                   │
│  Conversation Memory (letzte 20 Messages)          │
│  Persona System (Scientist/Motivator/etc.)         │
│                                                   │
└──────────────────────┬──────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Determin.    │ │ Data     │ │ Knowledge    │
│ Engines      │ │ Access   │ │ Base (RAG)   │
│ (TDEE, Macro,│ │ (Read    │ │ (Nutrition   │
│  Volume,     │ │  Only    │ │  Science,    │
│  Recovery,   │ │  via RLS)│ │  Training,   │
│  Interactions│ │          │ │  Supplements)│
│  )           │ │          │ │              │
└──────────────┘ └──────────┘ └──────────────┘
```

### Datenfluss (Beispiel: "Wie war mein Tag?")

```
1. User: "Wie war mein Tag?"
2. LLM entscheidet: brauche Nutrition + Training + Recovery Daten
3. Tool Calls: get_nutrition_today(), get_training_history(1), get_recovery_score()
4. LLM bekommt: Raw Data zurück
5. LLM: Analysiert, vergleicht mit Zielen, findet Patterns
6. LLM generiert: Detaillierte, personalisierte Analyse mit Kontext
```

### Beispiel: Komplexe Konversation

```
User: "Ich schlafe seit einer Woche schlecht, liegt das an meinem neuen Pre-Workout?"
LLM:
  → get_sleep_logs(days=14)          # Schlaf vor und nach Start
  → get_supplement_stack()            # Was nimmt User?
  → get_intake_logs(days=14)          # Wann nimmt er Pre-Workout?
  → search_knowledge("caffeine sleep half-life")
  
LLM analysiert:
  "Dein Schlaf ist von 7.2h auf 5.8h gefallen seit dem 10. Feb. 
   Du hast am 9. Feb mit 'PreX 3000' angefangen — enthält 300mg Caffein.
   Du nimmst es um 17:00, Caffein-Halbwertszeit ist 5-6h.
   Um 23:00 hast du noch ~150mg im System.
   
   Vorschlag: Pre-Workout vor 14:00 nehmen, oder auf Caffein-frei wechseln.
   Soll ich deinen Supplement-Schedule anpassen?"
```

→ **Das kann Variante A nicht.** Rules Engine kennt keine Kausalzusammenhänge über Module hinweg.

### Was die AI KANN:
- ✅ Alles was Variante A kann
- ✅ Freie Konversation über alle Gesundheitsthemen
- ✅ Cross-Module Kausalanalyse ("liegt X an Y?")
- ✅ Wissensfragen ("Ist Kreatin sicher bei XY?")
- ✅ Personalisierte Empfehlungen basierend auf vollständigem Kontext
- ✅ Conversation Memory (Follow-ups, Rückfragen)
- ✅ Persona-angepasste Kommunikation
- ✅ Proaktive Insights die keine Regel abdeckt

### Was die AI NICHT KANN:
- ❌ Direkt in DB schreiben (nur suggest_action → User Confirm)
- ❌ Medizinische Diagnosen oder Therapie
- ❌ Dosierungsempfehlungen für Medikamente/PEDs

### Stärken:
- **Maximale Flexibilität:** Kann über alles sprechen
- **Beste UX:** Natürliche Konversation, Follow-ups, Kontext
- **Cross-Module Intelligence:** Findet Zusammenhänge die keine Regel abdeckt
- **Wissensbasis:** RAG für Nutrition Science, Training Theory etc.
- **Skaliert:** Neue Features brauchen keine neuen Rules, nur neue Tools
- **Persona System:** User wählt Coach-Stil (Scientist, Motivator, Drill Sergeant)

### Schwächen:
- **Halluzinations-Risiko:** LLM könnte TDEE falsch berechnen (→ deshalb deterministische Engines)
- **Inkonsistenz:** Gleiche Frage → unterschiedliche Antworten
- **Teurer:** Mehr Tokens pro Interaktion (History + Tool Calls)
- **Latenz:** Tool Calls + LLM = 2-5 Sekunden pro Antwort
- **Schwerer zu testen:** LLM-Output ist nicht deterministisch
- **Safety:** Braucht robuste Guardrails für Medical/Supplements

### Safety Layer:

```
┌─────────────────────────────────────────────────┐
│                SAFETY LAYER                      │
├─────────────────────────────────────────────────┤
│                                                   │
│  PRE-RESPONSE CHECK:                             │
│  1. Medical Claims Filter                        │
│     → Keine Diagnosen, Therapie, Dosierung       │
│  2. Supplement Safety Gate                       │
│     → Interaction Check IMMER deterministisch    │
│  3. Calculation Verification                     │
│     → TDEE/Macros IMMER über deterministic Engine│
│  4. PII Filter                                   │
│     → Keine persönlichen Daten in Logs           │
│                                                   │
│  HARD BLOCKS:                                    │
│  - "nimm X mg von Y" → BLOCK                    │
│  - "du hast Krankheit Z" → BLOCK                │
│  - Interaction = critical → BLOCK + Alert         │
│                                                   │
│  DISCLAIMERS (auto-append):                      │
│  - Medical: "Sprich mit deinem Arzt"             │
│  - Supplements: "Keine medizinische Beratung"    │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Kosten:
- ~2000-5000 Tokens Input (History + Tool Results) + ~500-1500 Output
- RAG Queries: ~1000 Tokens pro Knowledge Search
- **~$0.50-1.30/User/Monat** bei 2 Interaktionen/Tag
- Bei Claude Haiku: ~$0.20-0.50/User/Monat

### Tech Stack:
- LLM: Claude Sonnet (Haupt-Modell) oder Haiku (Budget)
- Tools: Hono API Endpoints (read-only + suggest_action)
- RAG: Embeddings + Vector Search (Supabase pgvector oder Pinecone)
- Memory: Redis oder Postgres (letzte 20 Messages pro User)
- Persona: System Prompt Templates pro Stil

---

## Variante C: Hybrid (Empfehlung)

### Kernidee

**Deterministische Engines für alles Messbare, LLM für alles Menschliche.**

Die Intelligenz-Verteilung richtet sich nach der **Safety-Domäne**:

| Domäne | Wer entscheidet? | Warum? |
|--------|-----------------|--------|
| **TDEE/Macro Berechnung** | Deterministisch | Keine Halluzination bei Zahlen |
| **Supplement Interactions** | Deterministisch | Sicherheitskritisch |
| **Medical Alerts** | Deterministisch | Lebensrelevant |
| **Scoring (0-100)** | Deterministisch | Konsistenz |
| **Training Volume/Deload** | Deterministisch | Wissenschaftlich berechenbar |
| **Recovery Score** | Deterministisch | Formel-basiert |
| **Erklärungen** | LLM | Menschliche Sprache |
| **Cross-Module Analyse** | LLM | Pattern Recognition |
| **Wissensfragen** | LLM + RAG | Flexibilität |
| **Tagesplanung** | LLM + Engines | Kreativität + Korrektheit |
| **Motivation** | LLM | Empathie |
| **Persona/Ton** | LLM | Persönlichkeit |

### Architektur

```
┌─────────────────────────────────────────────────────────┐
│                       UI Layer                           │
│         Chat + Cards + Quick Actions + Dashboard         │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                    AI COACH (Hybrid)                      │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │              ORCHESTRATOR                        │     │
│  │                                                   │     │
│  │  Entscheidet: Braucht diese Frage...             │     │
│  │  → nur Rules? → Fast Path (kein LLM nötig)      │     │
│  │  → nur LLM? → Knowledge Path                    │     │
│  │  → beides? → Hybrid Path                        │     │
│  │                                                   │     │
│  └────────────┬──────────────────┬──────────────────┘     │
│               │                  │                         │
│  ┌────────────▼──────┐  ┌───────▼───────────────────┐    │
│  │  DETERMINISTIC    │  │  LLM LAYER                 │    │
│  │  ENGINES          │  │                             │    │
│  │                    │  │  Conversation Engine        │    │
│  │  · TDEE Calculator│  │  · System Prompt + Persona  │    │
│  │  · Macro Optimizer│  │  · Conversation Memory      │    │
│  │  · Volume Planner │  │  · Context Window           │    │
│  │  · Recovery Score │  │                             │    │
│  │  · Interaction    │  │  Knowledge Engine (RAG)     │    │
│  │    Checker        │  │  · Nutrition Science        │    │
│  │  · Rules Engine   │  │  · Training Theory          │    │
│  │  · Medical Ranges │  │  · Supplement Research      │    │
│  │  · Scoring Engine │  │  · Recovery Protocols       │    │
│  │                    │  │                             │    │
│  │  Output: Numbers,  │  │  Output: Text, Analysis,   │    │
│  │  Scores, Alerts,   │  │  Explanations, Motivation, │    │
│  │  Flags, Thresholds │  │  Cross-Module Insights     │    │
│  └────────────┬──────┘  └───────┬───────────────────┘    │
│               │                  │                         │
│  ┌────────────▼──────────────────▼──────────────────┐    │
│  │           RESPONSE COMPOSER                       │    │
│  │                                                    │    │
│  │  Mergt: Engine Results + LLM Text                 │    │
│  │  Enforced: Safety Layer (pre-output)              │    │
│  │  Format: Cards + Text + Actions                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │           SAFETY LAYER                            │    │
│  │                                                    │    │
│  │  HARD RULES (deterministisch, nicht überschreibbar)│   │
│  │  1. Medical > Supplements > Recovery > Protocols   │    │
│  │  2. Interactions = critical → BLOCK                │    │
│  │  3. Medical Disclaimer bei JEDEM Health-Thema      │    │
│  │  4. Keine Dosierungsempfehlungen für Medikamente   │    │
│  │  5. Zahlen IMMER aus Engines (nie LLM-generiert)   │    │
│  │                                                    │    │
│  │  SOFT RULES (LLM kann innerhalb Grenzen variieren)│    │
│  │  1. Formulierung / Ton                             │    │
│  │  2. Priorisierung von Tipps                        │    │
│  │  3. Detailtiefe der Erklärung                      │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 3 Pfade

#### Fast Path (kein LLM nötig)
```
User öffnet Dashboard
  → Aggregation Layer berechnet Scores + Alerts
  → Rules Engine evaluiert
  → UI zeigt Cards direkt (kein LLM-Call)
  
Beispiel: "Nutrition: 85/100 ✅ | Protein: 128/140g | 12g fehlen"
→ Pure Frontend-Rendering, $0 Kosten
```

#### Knowledge Path (nur LLM)
```
User: "Was ist der Unterschied zwischen Whey Isolate und Concentrate?"
  → Kein Engine-Call nötig
  → RAG Search: whey protein types
  → LLM generiert Antwort aus Knowledge Base
  
→ Günstig (nur RAG + Haiku)
```

#### Hybrid Path (beides)
```
User: "Ich schlafe schlecht seit meinem neuen Pre-Workout"
  → Orchestrator: brauche Sleep Data + Supplement Data + Timing + Knowledge
  
  Deterministic:
    get_sleep_logs(14d) → Trend: 7.2h → 5.8h ab 10. Feb
    get_supplement_stack() → PreX 3000: 300mg Caffein
    get_intake_logs(14d) → Intake um 17:00
    check_interactions("caffeine", "sleep") → timing_conflict
  
  LLM:
    Kontext: Sleep-Daten + Stack + Timing + Knowledge(caffeine half-life)
    → "Dein Schlaf ist seit dem 10. Feb um 1.4h gesunken..."
    → Kausalanalyse + Empfehlung
    → ABER: Zahlen kommen aus Engines, nicht aus LLM
```

### Response Format

```typescript
interface CoachResponse {
  // Deterministic (aus Engines)
  scores: {
    nutrition: number;     // 0-100
    training: number;
    supplements: number;
    recovery: number;
    medical: number;
  };
  alerts: Alert[];          // Rules Engine Output
  flags: Flag[];            // ok | warn | block
  
  // LLM-generated
  summary: string;          // Natürliche Sprache
  insights: string[];       // Cross-Module Findings
  explanation?: string;     // Falls User "warum?" fragt
  
  // Combined
  recommendations: {
    text: string;           // LLM-formuliert
    action?: Action;        // Deterministic (Engine-basiert)
    confidence: number;     // Wie sicher ist die Empfehlung
    source: 'engine' | 'llm' | 'rag';
  }[];
  
  // Safety
  disclaimers: string[];    // Auto-appended
  safetyOverrides: string[];// Falls Safety Layer eingreift
}
```

### Stärken:
- **Best of both worlds:** Safety wo nötig, Flexibilität wo möglich
- **Kosteneffizient:** Fast Path für 60% der Interaktionen (Dashboard) = $0
- **Skalierbar:** Neue Rules → Engine, neue Konversation → LLM
- **Auditierbar:** Zahlen immer nachvollziehbar (Engine), Text flexibel (LLM)
- **Progressive:** Kann mit mehr Rules strikter werden, oder mit besserem LLM flexibler

### Schwächen:
- **Komplexität:** Zwei Systeme pflegen (Rules + LLM)
- **Orchestrator-Logik:** "Wann brauche ich welchen Pfad?" muss robust sein
- **Testing:** Deterministic = easy, LLM = hard, Hybrid = beides
- **Latenz:** Hybrid Path = Engine Calls + LLM = 2-4 Sekunden

### Kosten:
- Fast Path: ~$0/Interaktion
- Knowledge Path: ~$0.002/Interaktion (Haiku + RAG)
- Hybrid Path: ~$0.005-0.02/Interaktion (Sonnet + Tools + RAG)
- **~$0.20-0.60/User/Monat** bei Mix aus allen Pfaden

### Tech Stack:
- Orchestrator: TypeScript (Hono API, `packages/evaluator/`)
- Deterministic: `packages/rules-engine/` + `packages/scoring/`
- LLM: Claude Sonnet (Hybrid), Claude Haiku (Knowledge), kein LLM (Fast)
- RAG: Supabase pgvector + Embeddings
- Memory: Postgres (conversation_history, 20 Messages Sliding Window)
- Persona: System Prompt Templates (5 Stile)
- Safety: Hard-coded Pre-Output Filter (nicht LLM-abhängig)

---

## Vergleichsmatrix (Detail)

| Kriterium | A: Rules-First | B: LLM-First | C: Hybrid |
|-----------|---------------|--------------|-----------|
| **"Wie war mein Tag?"** | Scores + Alerts erklären | Volle Analyse + Insights | Scores aus Engine, Insights aus LLM |
| **"Liegt mein schlechter Schlaf am Pre-Workout?"** | ❌ Unmöglich | ✅ Kausalanalyse | ✅ Daten aus Engine, Analyse aus LLM |
| **"Was ist Kreatin?"** | ❌ Nicht im Scope | ✅ RAG Antwort | ✅ RAG Antwort |
| **"Berechne meine Macros neu"** | ✅ Rules Engine | 🟡 LLM ruft Engine → Safety? | ✅ Engine berechnet, LLM erklärt |
| **Dashboard Cards** | ✅ Direkt (kein LLM) | 🟡 Overhead (LLM generiert Text) | ✅ Fast Path (kein LLM) |
| **Supplement Interaction Alert** | ✅ Deterministisch | 🟡 LLM muss Engine aufrufen | ✅ Engine detektiert, LLM erklärt |
| **"Motivier mich"** | 🟡 Generisch | ✅ Personalisiert | ✅ Personalisiert |
| **Follow-up Fragen** | ❌ Kein Memory | ✅ Conversation Memory | ✅ Conversation Memory |
| **Fehlerrisiko bei Zahlen** | ✅ Null (deterministisch) | 🟡 LLM könnte halluzinieren | ✅ Null (Zahlen aus Engine) |
| **Falsche Medical Empfehlung** | ✅ Unmöglich (nur Rules) | 🔴 Möglich (trotz Safety) | ✅ Safety Layer + Engine |
| **Kosten @10K Users** | ~$500-1000/mo | ~$5K-13K/mo | ~$2K-6K/mo |
| **Kosten @100K Users** | ~$5K-10K/mo | ~$50K-130K/mo | ~$20K-60K/mo |
| **Dev-Aufwand Initial** | Hoch (alle Rules) | Mittel (Prompts + Tools) | Hoch (beides) |
| **Dev-Aufwand Ongoing** | Hoch (neue Rules) | Niedrig (bessere Prompts) | Mittel |

---

## Empfehlung

**Variante C (Hybrid) ist der empfohlene Pfad**, weil:

1. **Safety wo es zählt:** Medical, Supplements, Scoring = deterministisch
2. **UX wo es zählt:** Konversation, Insights, Motivation = LLM
3. **Kosten-effizient:** 60% der Interaktionen brauchen kein LLM (Fast Path)
4. **Zukunftssicher:** Kann in beide Richtungen skalieren
5. **Wettbewerbsvorteil:** Kein Competitor hat diesen Hybrid-Ansatz

**Aber:** Die Entscheidung liegt bei Tom. Alle 3 Varianten sind implementierbar.

### Möglicher Rollout:

```
Phase 1 (MVP): Variante A — Rules-First
  → Schnell, günstig, sicher, beweist Grundkonzept
  → Dashboard Cards, Daily Summary, Alerts

Phase 2 (v1.5): Variante A → C — Hybrid hinzufügen
  → LLM für Konversation, RAG für Wissen
  → Rules Engine bleibt für Scoring/Safety

Phase 3 (v2): Variante C voll — Alle 3 Pfade
  → Fast Path + Knowledge Path + Hybrid Path
  → Persona System, Conversation Memory
```

---

*Stand: 2026-02-17 — Entscheidung ausstehend*
