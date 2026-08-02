# Buddy / AI Coach Module — Strategie & Markt

## Markt-Landscape

**13 Apps analysiert** — AI Fitness Apps: $2.5B (2025), 32% CAGR

| App | Users | Stärke | Schwäche |
|---|---|---|---|
| Freeletics | 50M | "The Coach" Algorithm, $100M+ Revenue | Kein LLM, keine Supps, kein Nutrition |
| ChatGPT | Milliarden | Konversation, Wissen | Keine echten Daten, halluziniert bei Zahlen |
| Welltory | 16M+ | HRV + GPT Insights, Wellness | Kein Training/Nutrition/Coach |
| Zing Coach | 1M | CV Form Check, 4.8★ | Nur Form, keine anderen Module |
| Fitbod | 5M | Muscle Recovery AI | Kein Nutrition/Coach |
| MacroFactor | — | Adaptive TDEE | Kein Training/Coach |
| Coachvox | — | AI Clone, $99/mo bewiesen | Nur Chat, keine Daten |
| Kemtai | B2B | CV API, medical-validated | Nur B2B API |
| Trainwell | — | $149/mo beweist Premium | Nur Training |

---

## Kritische Markt-Lücken

1. **KEIN Holistic AI Coach existiert** — Archetype #5 ist ein leerer Markt
2. **ChatGPT = größter "Competitor" aber hat keine Daten** — keine Accountability, halluziniert
3. **CV Form Checking ist gelöst** — Kemtai bietet White-Label API → kein eigenes CV-Model
4. **Coach Clones sind validiert** — Coachvox zeigt: Coaches zahlen $99/mo
5. **KEINER verbindet alles** — Training ODER Nutrition ODER Recovery ODER Supplements

---

## User Personas

### Jan — Overwhelmed Beginner (35%)
- **Pain:** Informationsflut, widersprüchliche Infos, keine Struktur
- **Needs:** "Sag mir einfach was ich tun soll", Step-by-Step
- **Persona-Preference:** Best Friend oder Motivator
- **Zahlungsbereitschaft:** $9.99/mo

### Marie — Intermediate Plateau (30%)
- **Pain:** Fortschritt stagniert, "mache ich alles richtig?"
- **Needs:** Training Analysis, Nutrition Audit, Periodisierung
- **Persona-Preference:** Scientist oder Sensei
- **Zahlungsbereitschaft:** $9.99/mo

### Marcus — Advanced Lifter (20%)
- **Pain:** Will Daten-Analyse, keine Basics-Erklärungen
- **Needs:** Advanced Analytics, Periodization, Bloodwork-based Recs
- **Persona-Preference:** Scientist
- **Zahlungsbereitschaft:** $19.99/mo

### Coach Tina — Fitness Coach (15%)
- **Pain:** Kann nicht 50 Clients gleichzeitig betreuen, repetitive Fragen
- **Needs:** AI Clone, Client Data Access, Custom Protocols
- **Zahlungsbereitschaft:** $99/mo (Business Tool)

---

## Lumeos Buddy USP

### Primary USP: "The Only AI Coach That Knows EVERYTHING About You"

ChatGPT weiß was das Internet sagt.
**Lumeos Buddy WEISS:**
- Was du gegessen hast (heute, diese Woche, Mikronährstoff-Status)
- Wie du trainiert hast (Volumen, Intensität, PRs, Imbalances)
- Wie erholt du bist (Recovery Score, HRV, Muscle Readiness)
- Was du supplementierst (Stack, Timing, Interaktionen)
- Was dein Blut sagt (Biomarker-Trends, Deficiencies)
- Was dein Ziel ist (Phase, TDEE, Adherence Rate)

**ChatGPT kann raten. Lumeos Buddy WEISS.**

### Secondary USPs

1. **Deterministic Accuracy** — Alle Berechnungen aus Engines, nie aus LLM
2. **5 Personas** — User wählt Coaching-Stil
3. **Action Execution** — Alles per Sprache steuern (Pro+)
4. **Proaktiver Wächter** — kommt zum User, nicht umgekehrt
5. **AI Clone** — Coach skaliert seine Methode
6. **Konfigurierbares Briefing** — Personalisierter Daily Heartbeat

### Kompetitiver Vergleich

| Kriterium | ChatGPT | Freeletics | Zing Coach | Fitbod | Lumeos |
|---|:---:|:---:|:---:|:---:|:---:|
| Personalized Data (alle Module) | ❌ | 🟡 | 🟡 | 🟡 | **✅** |
| Nutrition-Aware | ❌ | ❌ | ❌ | ❌ | **✅** |
| Recovery-Aware | ❌ | ❌ | ❌ | 🟡 | **✅** |
| Bloodwork-Aware | ❌ | ❌ | ❌ | ❌ | **✅** |
| Form Check (CV) | ❌ | ❌ | ✅ | ❌ | **✅ (Kemtai)** |
| Voice + Action Execution | ❌ | ❌ | ❌ | ❌ | **✅** |
| Coach Clone | ❌ | ❌ | ❌ | ❌ | **✅** |
| Proactive Alerts | ❌ | 🟡 | ❌ | ❌ | **✅** |
| Memory (persistent) | ❌ | 🟡 | ❌ | 🟡 | **✅** |
| Human Coach Integration | ❌ | ❌ | ❌ | ❌ | **✅** |
| Preis/mo | $20 | $12 | Free+IAP | $13 | **$9.99–29.99** |

---

## Architecture Decision: Hybrid (Variante C)

Von 3 analysierten Varianten gewählt:
- **Variante A** (Rules-First): Günstig, sicher, aber starr. Kein echtes Gespräch.
- **Variante B** (LLM-First): Maximale Flexibilität, aber teuer ($1.30/User/Mo) und Halluzinations-Risiko.
- **Variante C** (Hybrid) — **Gewählt:** Deterministische Engines für Safety/Zahlen, LLM für Konversation.

**Rollout:**
- Phase 1: Rules-First (MVP) → Dashboard Cards, Daily Summary, Alerts
- Phase 2: + LLM Konversation + RAG Wissen
- Phase 3: + Voice + Action Execution + Proaktiver Wächter
- Phase 4+: + AI Clone + Advanced Features

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| Hybrid AI | Safety wo es zählt (Medical, Supplements = deterministisch), UX wo es zählt (Konversation = LLM) |
| 5 Free Messages/Tag | User muss Wert erleben bevor er zahlt. Conversion Trigger: "5/5 Messages genutzt → Upgrade" |
| Konfigurierbarer Heartbeat | Jeder User hat andere Präferenzen — Zwangs-Zeitplan wird ignoriert |
| Feature Gate als Middleware | Tiers in DB/Config, nicht hardcoded → A/B-Testing, schnelle Preis-Anpassung |
| Manipulation Guard (unveränderlich) | Vertrauen ist der Moat. Manipulation zerstört Retention. |
| Kemtai statt eigenem CV | 2+ Jahre Entwicklung gespart. Kemtai medical-validated. ~$0.05/Check |
| Local-First Voice | Gym ohne Internet. <200ms Latenz. Whisper.cpp on-device. |
| AI Clone als B2B Feature | Coachvox hat $99/mo validiert. Near-zero marginal cost. |
