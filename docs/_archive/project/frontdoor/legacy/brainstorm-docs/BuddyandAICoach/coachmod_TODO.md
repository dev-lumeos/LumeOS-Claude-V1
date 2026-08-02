# Coach Module — TODO

**Updated:** 2026-02-24
**PRD:** `/docs/coach-module/PRD.md` (28KB)

---

## M1: AI Coach Butler — ✅ 95% Done
**API:** Port 5500 | **LLM:** Z.AI GLM-4.7-Flash ($0)

### ✅ Done
- [x] Chat Interface mit Streaming (SSE) + Sync
- [x] 5 Personas (Scientist/Motivator/Drill Sergeant/Best Friend/Sensei)
- [x] Context Builder (Cross-Module: Nutrition, Supplements, Recovery)
- [x] Proactive Insights (8 deterministic rules)
- [x] Daily Briefing (Morning/Evening, cached)
- [x] Z.AI GLM Integration ($0 Flatabo)
- [x] Scope Guard (Off-Topic Blocker — Regex + System Prompt)
- [x] Butler Action Layer — Intent Router (Fast Path + LLM)
- [x] Butler Action Layer — Action Executor (Water/Weight/Supplements/Macros/Recovery/Meal)
- [x] All actions tested end-to-end
- [x] Conversation history + persistence
- [x] Quick Actions (6 pre-defined, 3 languages)
- [x] i18n DE/EN/TH (16+ keys)
- [x] Vite build PASS

### 🔲 Open (Polish)
- [ ] Food search synonym mapping (BLS "Hähnchenbrust" missing as raw ingredient)
- [ ] Smart Confirmation (confidence < 0.7 → ask user)
- [ ] Undo ("Mach das rückgängig" → delete last log)
- [ ] Streaming for action results (currently JSON)
- [ ] Butler UI polish — action confirmations as special bubbles
- [ ] Training data in context (Training API 5200 unstable)
- [ ] Evening Summary briefing

---

## M2: Voice + Wächter — 🔲 Not Started

- [ ] Voice Input (Web Speech API, Mikrofon-Button)
- [ ] Proaktiver Wächter (Background Worker, 15-30min interval)
- [ ] Push Notifications (Web Push API)
- [ ] Journey Heartbeat (konfigurierbar)
- [ ] Smart Mute (Nachtmodus, lernfähig)

---

## M3: Human Coach Platform — ✅ 95% Done
**API:** Port 5600 | **DB:** Migration 012 (7 tables)

### ✅ Done — Dashboard & Core
- [x] Coach Registration + Profile (edit, specialties, certifications, tier, working hours)
- [x] Coach Dashboard — 8 Tabs: Home, Kunden, Pläne, Check-ins, Chat, Alerts, Analytics, Profil
- [x] KPI Row (Kunden, Umsatz, Check-ins, Ungelesen)
- [x] Handlungsbedarf section (Critical/Warning/Unread grouped)
- [x] Client overview with avatar initials, status dots, priority badges
- [x] Revenue breakdown bars
- [x] Quick Actions (Neuer Kunde, Programm, Check-in)

### ✅ Done — Client Management (F1.1, F1.2)
- [x] Client list with search, status filter, goal filter, tag filter, sort
- [x] Client detail with 5 tabs (Übersicht/Chat/Programme/🧬 Enhanced/Notizen)
- [x] Permission-based data access (7 categories, 3 levels)
- [x] Cross-module data cards (Nutrition/Supplements/Recovery/Check-in)
- [x] Compliance bars (Training/Nutrition/Supplements/Recovery)
- [x] Weight trend (from Nutrition API)
- [x] Progress insights (auto-generated)
- [x] Last message timestamp, next check-in date
- [x] Add/edit/delete clients
- [x] Client notes (freetext, autosave)

### ✅ Done — Communication (F1.5)
- [x] In-App Chat (Coach↔Client, text)
- [x] Thread list with unread badges
- [x] Chat bubbles with timestamp, sender styling
- [x] System messages + AI Clone message styling

### ✅ Done — Programs (F1.3)
- [x] Program CRUD (name, type, difficulty, duration)
- [x] Phase editor (add/remove phases with weeks + description)
- [x] Client assignment (select client → assign program)
- [x] Template system (save as template, create from template)
- [x] Marketplace toggle
- [x] Active assignment count

### ✅ Done — Check-Ins (F1.4)
- [x] Create check-in (client, week, due date)
- [x] Auto-pull data from Nutrition/Supplements/Recovery APIs
- [x] Client data display (energy, mood, soreness, notes)
- [x] Coach review (notes, feedback, action items)
- [x] Status flow: pending → client_submitted → coach_reviewed → completed
- [x] Status filter tabs

### ✅ Done — Alerts
- [x] Grouped by level (critical/warning/info/success)
- [x] Time-ago formatting
- [x] Dismiss functionality
- [x] Auto-generated from bloodwork, compliance drops

### ✅ Done — Analytics (F1.7)
- [x] Revenue by month (last 6 months bar chart)
- [x] Client growth (new clients per month)
- [x] Retention rate gauge
- [x] Churn rate
- [x] Average revenue per client
- [x] Expiring programs warning
- [x] Top clients by revenue leaderboard

### ✅ Done — Enhanced Protocol Management (F1.6)
- [x] 🧬 Enhanced tab in ClientDetail (visible for enhanced/TRT clients)
- [x] Active Cycles — name, compounds, doses, frequency, route, timing, sites, progress bar
- [x] Bloodwork Panel — markers with reference ranges, color coding (🟢🟡🔴), trend arrows
- [x] Coach can add new bloodwork (form with 10 markers)
- [x] Auto-alerts from bloodwork (trending markers: "ALT steigend: 28→42")
- [x] Auto-generate coach_client_alerts for out-of-range values
- [x] Injection History — last 30 days, site rotation overview
- [x] Reference ranges for 10 markers (Hematocrit, ALT, AST, HDL, LDL, Triglycerides, Testosterone, E2, Prolactin, RBC)
- [x] PCT display in cycle view

### ✅ Done — Infrastructure
- [x] 7 API route files (coaches, clients, programs, checkins, messages, alerts, analytics, enhanced)
- [x] 22+ React Query hooks
- [x] Fullscreen dark mode design
- [x] i18n keys (40+ in DE/EN/TH)
- [x] Seed data (4 clients, 15 check-ins, 24+ messages, 7+ alerts, 2 bloodwork panels)
- [x] Vite build PASS (215 modules, 987KB)

### 🔲 Open
- [ ] Voice Notes in chat (record + send audio)
- [ ] Video Call link integration (Zoom/Meet)
- [ ] Kurzvideo Coach→Client (record + send)
- [ ] Auto-Reminder for check-ins (push/notification)
- [ ] Multi-Coach / Team support
- [ ] Coach Branding (logo, colors)
- [ ] Client onboarding flow (guided wizard)
- [ ] Drag & Drop for program builder
- [ ] Body Composition tracking for clients
- [ ] Kraft-Kurven (strength PRs over time)
- [ ] Compliance leaderboard with real data

---

## M4: Coach AI Assistant — 🔲 Not Started
- [ ] Auto-Monitoring (alerts to coach)
- [ ] Auto-Reports (weekly summary per client)
- [ ] Standard-Fragen beantworten (im Coach-Stil)
- [ ] Check-In Automation

## M5: AI Clone + Marketplace — 🔲 Not Started
- [ ] AI Clone Builder
- [ ] Clone Training Interface
- [ ] Marketplace Listing (Programs)
- [ ] Wallet Integration

## M6: Premium Features — 🔲 Not Started
- [ ] Gym Finder (Google Places API)
- [ ] Visual Check-In
- [ ] Pattern Detective
- [ ] Biomarker Integration
- [ ] Inline Rich Cards

---

## Module Status Summary

| Module | Status | Completion |
|--------|--------|-----------|
| M1 AI Butler | ✅ MVP Done | 95% |
| M2 Voice+Watcher | 🔲 Not Started | 0% |
| M3 Human Coach | ✅ MVP Done | 95% |
| M4 Coach AI Assist | 🔲 Not Started | 0% |
| M5 Clone+Marketplace | 🔲 Not Started | 0% |
| M6 Premium | 🔲 Not Started | 0% |
