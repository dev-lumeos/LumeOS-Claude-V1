---
nr: A-36
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-36 - `module-stubs-replacement.jsx` traegt drei ganze Module

## Befund

(neu 2026-08-20). Aus SSOT 173. **730 Zeilen, nie erwaehnt.**

  `[cmd]` **Marketplace:** `MARKETPLACE_CATEGORIES`,
  `MARKETPLACE_PRODUCTS` (mit Preis, Bewertung, Haendler, Evidenzgrad,
  `inStack`), `COACH_PROFILES`, `ORDERS`, `SUBSCRIPTIONS` — dazu
  `MarketBrowse`, `MarketCoaches`, `MarketPlans`, `MarketOrders`,
  `MarketSubs`, `MarketSeller`.

  `[cmd]` **Auth und Onboarding:** **`OnboardingFlow`, `LoginScreen`,
  `RegisterScreen`, `ProfileSetupScreen`, `PrivacyPreview`.**

  `[read]` **G-83 haelt fest, dass es kein Onboarding gibt.**
  **`module-onboarding.jsx` hat den Assistenten, und diese Datei hat
  die Bildschirme dazu** — Anmeldung, Registrierung, Profilaufbau,
  Datenschutzvorschau.

  `[cmd]` **Admin:** `ADMIN_USERS`, `ADMIN_MODERATION`,
  `AdminDashboard`, `AdminUsers`, `AdminModeration`, `AdminAnalytics`,
  `AdminSystem`, **`AdminFoodDB`**, `AdminAudit`.

  `[read]` **`AdminFoodDB` ist der Ort fuer die manuelle Kuration** —
  C-125 haelt 124 Zutaten fuer eine Woche Handarbeit fest, und
  `name_display` wartet auf menschliche Namen.

  `[cmd]` **`module-stubs.jsx` selbst (230 Zeilen) ist nur der
  Platzhalter** — *„keep the shell coherent when navigating."*
  **Der ist erledigt, sobald die Module stehen.**

## Auftrag

**Mitbeauftragt mit C-49 am 2026-08-30.** Bericht dort.

`[read]` **Dasselbe Muster wie der Coaches-Reiter am 30.08.:** dort
zeigte die Anzeige vier erfundene Personen, **waehrend die echte
Komponente seit G-158 danebenstand und nur kein Prop bekam.**

`[cmd]` **Miss zuerst, ob die drei Module ueberhaupt noch aus dieser
Datei kommen** — der Punkt ist aelter als der `/v2/`-Umbau.

`[read]` **Und wenn ja: gilt die Frage aus G-277** — **fehlt ein
Bauteil, oder fehlt nur die Verdrahtung?** `[cmd]` **Beim
Coaches-Reiter war es die Verdrahtung, und die Behebung war ein
Prop.**
