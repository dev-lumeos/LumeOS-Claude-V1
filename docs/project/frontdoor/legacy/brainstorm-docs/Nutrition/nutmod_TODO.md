# Nutrition Module — TODO

**Status:** ~95% Sprint 1 Done
**API:** Port 5100
**Tables:** foods, meal_logs, meal_items, water_logs, weight_logs, daily_nutrition_summary (VIEW), recipes, recipe_ingredients, food_portions, custom_foods, meal_plans, meal_plan_items, user_settings

---

## ✅ Done

- [x] Food Search (BLS 7140 foods, nutrients_full JSONB, 98 BLS nutrients)
- [x] Food Log (CRUD meals, meal items, meal types)
- [x] Macro Dashboard (SVG rings, targets, remaining bar)
- [x] Micro Dashboard (107 nutrients, 7 groups, traffic light, RDA)
- [x] Micronutrient Detail Cards (42+ nutrients, 3 languages, symptoms)
- [x] Water Tracking (daily log, goal progress)
- [x] Weight Tracking (daily log, BMI, sparkline trend)
- [x] TDEE Calculator (Mifflin-St Jeor, 5 activity levels, 4 goals)
- [x] Recipe System (CRUD, meal-to-recipe, per-serving macros)
- [x] Quick-Add Macros (direct macro input, auto-calculates kcal)
- [x] Smart Suggestions (wie gestern, favorites, recent, one-click)
- [x] Streak System (current/longest, badges, motivational)
- [x] Nutrient Heatmap (28-day grid on Dashboard)
- [x] Copy Yesterday's Meals
- [x] Enhanced Search (category filters, sort-by, favorites)
- [x] Food Favorites (DB + API + ⭐)
- [x] Custom Foods (form + API + search UNION)
- [x] Portions System (DB + API)
- [x] Meal Plans (ghost entries, confirm/skip/adjust)
- [x] Settings (meal schedule, preferences)
- [x] Morning Quick Entry (weight + water on Home)
- [x] Day Summary (evening review, compliance %)
- [x] Deficit Suggestions (macro-deficit-based food search)
- [x] Trends (7d/14d/30d period views, Ø values)
- [x] Macros Detail Tab (parent/child hierarchy fats/carbs/protein)
- [x] Cross-Module Connectors (Nutrition Score → Dashboard, Recovery)
- [x] Rules Engine (8 rules, alerts, safety order)
- [x] MealCam (camera/file upload, AI detection — mock)
- [x] i18n (400+ keys DE/EN/TH)
- [x] Seed Data (41 days, 13 foods, 144 meals, 185 items)
- [x] All API endpoints wired to Postgres (0 Zustand imports)

## 🔲 Open / Phase 2

- [ ] MealCam → Real Claude Vision API (currently mock)
- [ ] Barcode Scanner (deferred)
- [ ] Menu Plan per Coach (Tom: "Meal eingabe wird mealcam oder menuplan")
- [ ] Menu Plan Confirmation Flow (Tom: "User muss menuplan bei jedem essen bestätigen")
- [ ] Custom Foods route 500 bug (`:id` catches "custom")
- [ ] Micro-Dashboard 0-values bug (reads meal_items columns, should use nutrients_full)
- [ ] Food DB expansion (BLS 4.0 + 5 EU DBs per research)
- [ ] AI Coach nutrition advice
- [ ] Wallet/monetization integration

## 🐛 Known Bugs

- Custom Foods route returns 500 (`:id` parameter catches "custom" as UUID)
- Micro-Dashboard shows 0 values for some nutrients (endpoint reads meal_items columns instead of nutrients_full JSONB)
