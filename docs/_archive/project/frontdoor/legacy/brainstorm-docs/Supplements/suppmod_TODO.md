# Supplement Module — TODO

**Status:** ~90% Sprint 1+2 Done
**API:** Port 5300
**Tables:** supplements, enhanced_substances, user_stacks, stack_items, intake_schedule, intake_logs, supplement_interactions, user_inventory, health_markers, injection_logs, cycle_plans

---

## ✅ Done — Sprint 1 (Foundation)

- [x] Supplement DB (44 supplements, evidence grades, costs, timing)
- [x] Stack System (CRUD, items, cycling on/off)
- [x] Intake Logging (taken/snoozed/skipped, per stack item)
- [x] Intake Generation (auto-generate from active stack)
- [x] Compliance Tracking (daily %, progress bar)
- [x] Search (supplements + enhanced unified, category filter)
- [x] Evidence Badges (S/A/B/C/D/F grades)
- [x] Interactions (33 interactions, timing conflict detection)
- [x] Intelligence Routes (suggestions, generate stack, compliance)
- [x] Cost Summary (monthly costs per supplement)
- [x] Timing Groups (morning, pre-workout, with meal, evening, bedtime)
- [x] Absorption Notes (mit Fett, nüchtern etc.)
- [x] i18n (supplement keys DE/EN/TH)

## ✅ Done — Sprint 2 (Enhanced Mode)

- [x] Enhanced Substances DB (54 substances — AAS, SARMs, Peptides, TRT)
- [x] Enhanced Mode Toggle (Settings + localStorage + custom event)
- [x] Cycle Planner (DB-backed, compound selection from enhanced_substances)
- [x] Cycle Compounds (dose, route, frequency, weeks, inject_days, timing)
- [x] Injection Site Rotation (preferred_sites config, auto-rotation via shared utility)
- [x] Injection Logging (site, dose, date — persistent in DB)
- [x] Blood Level Chart (pharmacokinetic visualization)
- [x] Health Monitoring Dashboard (markers tracking)
- [x] Injection Site Tracker (history view)
- [x] Cycle → Stack Auto-Sync ([CYCLE] tag, server-side syncCycleToStack)
- [x] Pin Day in Diary (CycleDiarySection with site rotation)
- [x] Pin Day in Supps Today (PinDayBlock, persistent log status)
- [x] Cycle Edit functionality
- [x] IM/SubQ separation from oral supplements in views
- [x] Shared injection rotation utility (injectionRotation.ts)

## 🔲 Open

- [ ] **Inventory Tab** — Stock tracking, expiry alerts, reorder reminders (Tom: "later")
- [ ] **Reminder Notifications** — Push/local notifications for timing (Tom: "later")
- [ ] **AI Stack Generator** — Real AI suggestions based on goals (currently basic logic)
- [ ] **Supplement-Nutrition Connector** — Show supplement nutrients in micro dashboard
- [ ] **Wallet Integration** — Supplement purchases via marketplace
- [ ] **Coach Kickback System** — Per monetization model
- [ ] **Marketplace Visibility** — Paid placements per research/marketplace-economics.md

## 🐛 Known Bugs

- API needs manual restart after crash (no pm2)
- ~~Injection log status lost on tab switch~~ → FIXED (now DB-backed)
