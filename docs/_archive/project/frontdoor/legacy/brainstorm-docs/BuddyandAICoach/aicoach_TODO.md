# AI Coach Module — TODO

**Status:** M1 Butler MVP ~90% Done
**API:** Port 5500
**LLM:** Z.AI GLM-4.7-Flash (OpenAI-compatible, $0 Flatabo)
**Tables:** coach_conversations, coach_messages, coach_briefings, coach_settings
**PRD:** `/docs/coach-module/PRD.md` (28KB, vollständig)

---

## ✅ Done — Sprint 1 (Chat + Personas + Context)

- [x] PRD created (12 ACs)
- [x] Migration 011 (4 DB tables + indexes + RLS)
- [x] Context Builder (reads LIVE from Nutrition 5100, Supplements 5300, Recovery 5400)
- [x] 5 Personas (Scientist/Motivator/Drill Sergeant/Best Friend/Sensei)
- [x] 8 Cross-Module Insight Rules (deterministic, $0)
- [x] Daily Briefing (Morning/Evening, cached in DB)
- [x] Coach API on port 5500 (Hono, 12 endpoints)
- [x] Chat with SSE streaming (Z.AI GLM)
- [x] Chat sync endpoint (non-streaming)
- [x] Conversation CRUD + history
- [x] Settings, Quick Actions, Personas endpoints
- [x] Local Coach fallback (deterministic, no LLM)
- [x] Chat UI (streaming bubbles, Markdown)
- [x] Persona Selector, Typing Indicator, Quick Action Bar
- [x] Daily Briefing Card on Home Dashboard
- [x] Insight Cards component
- [x] Coach View (chat + insights + history tabs)
- [x] Bottom Nav: 6 tabs (Home/Coach/Diary/Training/Supps/Recovery)
- [x] Vite proxy, CSS animations, i18n DE/EN/TH
- [x] Z.AI GLM integration (handles reasoning_content)
- [x] Scope Guard — Off-Topic Blocker (Regex + System Prompt)
- [x] Vite build PASS

## ✅ Done — Butler Action Layer

- [x] Intent Router (Fast Path regex + LLM fallback)
- [x] Action Executor (calls Nutrition/Supplement/Recovery APIs)
- [x] **Meal Logging** — "200g Hähnchen mit 150g Reis" → API
- [x] **Water Logging** — "500ml Wasser" → geloggt + Restmenge
- [x] **Weight Logging** — "85.5kg" → geloggt
- [x] **All Supplements** — "Alle Supps genommen" → 8/8 ✅
- [x] **Single Supplement** — "Kreatin genommen" → geloggt
- [x] **Recovery Check-in** — "Schlaf 7h, gut gefühlt" → Score 60/100
- [x] **Query Macros** — "Wie viel Protein fehlt?" → Status
- [x] **Query Water** — "Wasser status" → Restmenge
- [x] **Query Supplements** — "Supplement status" → Compliance %
- [x] **Query Recovery** — "Recovery score?" → Score
- [x] Fast Path: 0 Tokens, instant (Regex-basiert)
- [x] LLM Path: GLM Intent Classification für natürliche Sprache
- [x] Action results saved as coach_messages (model='action')
- [x] Sync + Streaming endpoints both support actions

## 🔲 Open — Sprint 1 Polish

- [ ] **Food Search verbessern** — BLS hat "Hähnchenbrust" nur in Rezepten, nicht als Rohzutat. Synonyme/Mapping nötig
- [ ] **Smart Confirmation** — Bei unsicherer Erkennung Rückfrage statt falsch buchen (confidence < 0.7)
- [ ] **Undo** — "Mach das rückgängig" → letzten Log löschen
- [ ] **Streaming für Actions** — Actions kommen als JSON zurück, nicht als Stream
- [ ] **Butler UI polish** — Action-Bestätigungen als spezielle Bubble (nicht nur Text)
- [ ] **Training data in context** — Training API (5200) unstable
- [ ] **Evening Summary** — Abend-Briefing mit Tages-Totals

## 🔲 M2: Voice + Wächter

- [ ] Voice Input (Web Speech API, Mikrofon-Button)
- [ ] Proaktiver Wächter (Background Worker, alle 15-30min)
- [ ] Push Notifications (Web Push API)
- [ ] Journey Heartbeat (konfigurierbares Briefing)
- [ ] Smart Mute (Nachtmodus, Lernfähig)

## 🔲 M3: Human Coach Platform

- [ ] Coach Registration + Profile
- [ ] Coach Dashboard (Client-Liste mit Ampel)
- [ ] Permission-Based Data Access
- [ ] In-App Chat (Coach↔Client)
- [ ] Program Builder
- [ ] Automated Check-Ins
- [ ] Business Analytics (aus Coach Feedback)
- [ ] Kundeneinteilung/Tags (aus Coach Feedback)
- [ ] Kurzvideo-Funktion (aus Coach Feedback)

## 🔲 M4: Coach AI Assistant

- [ ] Auto-Monitoring (Alerts an Coach)
- [ ] Auto-Reports (Weekly Summary pro Client)
- [ ] Standard-Fragen im Coach-Stil beantworten
- [ ] Fortschritts-Insights für Coach + Client

## 🔲 M5: AI Clone + Marketplace

- [ ] AI Clone Builder
- [ ] Clone Training Interface
- [ ] Marketplace Listing
- [ ] Wallet Integration
- [ ] Modulares Pricing (Feature-Gate Middleware)

## 🔲 M6: Premium Features

- [ ] Gym Finder (Google Places API)
- [ ] Visual Check-In (Spiegel-Selfie → AI Vergleich)
- [ ] Pattern Detective (Korrelations-Engine)
- [ ] Adaptive Ziele
- [ ] Biomarker-Integration
- [ ] Reise-Modus
- [ ] Predictive Coach
- [ ] Kontext-Gedächtnis
- [ ] Inline Rich Cards im Chat
- [ ] Challenges & Social

## 🐛 Known Issues

- GLM response time ~15-30s (reasoning model, CoT intern)
- Anthropic API key has no credits — auto-falls back to GLM/local
- Training context empty (API 5200 unstable)
- BLS Food Search: "Hähnchenbrust" findet nur Rezepte, nicht Rohzutat
- LLM Intent Classification: GLM braucht hohe max_tokens wegen Reasoning-Overhead
