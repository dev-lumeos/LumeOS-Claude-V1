# Recovery Module — TODO

**Status:** ~85% Sprint 1 Done
**API:** Port 5400
**Tables:** recovery_checkins, recovery_modalities, recovery_scores

---

## ✅ Done — Sprint 1

- [x] Morning Check-in (sleep hours, quality, feeling, mood, soreness body map)
- [x] Recovery Score (0-100, weighted composite, SVG ring + breakdown)
- [x] Muscle Recovery Map (anterior + posterior, react-body-highlighter, color-coded)
- [x] Modality Logging (8 types: cold plunge, sauna, massage, stretching, breathwork, meditation, nap, active recovery)
- [x] Modality bonus recalculation (auto-update score after logging)
- [x] Overtraining Detection (signal count + alert levels)
- [x] Recovery Trends (score history, sleep stats)
- [x] Navigation restructured (5 bottom tabs, Recovery = own tab 💤)
- [x] DiaryTabView wrapper (Diary+Insights+Foods as header sub-tabs)
- [x] Recovery API (Hono, port 5400, 7 endpoints)
- [x] DB Migration 010 (3 tables + indexes + RLS)
- [x] i18n (45+ keys DE/EN/TH)
- [x] Vite proxy config

## 🔲 Open — Sprint 1 Polish

- [ ] **Seed Data** — Multi-day recovery data so app isn't empty
- [ ] **Muscle Detail Modal** — Tap muscle → last trained, recovery %, recommendation (AC4)
- [ ] **Check-in Auto-Prompt on Home** — Show check-in card if none today
- [ ] **Muscle map data from Training** — Currently no training data feeding muscle recovery %
- [ ] **Soreness body map UX polish** — Severity levels (0-3) per muscle more intuitive

## 🔲 Phase 2 (Later)

- [ ] Apple HealthKit / Google Health Connect integration
- [ ] Phone Camera HRV measurement
- [ ] Sleep Stage Analysis (deep/REM/light)
- [ ] Wearable-enhanced Recovery Score
- [ ] AI Coach integration ("Dein Recovery ist niedrig weil...")
- [ ] Recovery Protocol Templates (Deload Week, Active Recovery Week)

## 🐛 Known Bugs

- Muscle map colors need alignment with actual training data (currently all gray without check-in soreness data)
- Body silhouette sizing can vary across devices
