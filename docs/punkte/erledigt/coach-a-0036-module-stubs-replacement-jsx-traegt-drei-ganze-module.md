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
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/admin
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

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt mit C-49. **Der
vollstaendige Bericht steht in [C-49](nutrition-c-0049-deckungsgrad-warnungen-und-tages-score-die-drei-stufen-danach.md#bericht).**

### Zuerst gemessen: die Module kommen nicht mehr aus dieser Datei

`[cmd]` **`module-stubs-replacement.jsx` liegt unter
`docs/spezifikation/10-plattform/design-system/theme-v1/`** — als
Entwurf. **Kein Import aus `apps/` oder `packages/` zeigt darauf.**

### Und es ist NICHT der Fall des Coaches-Reiters

`[cmd]` **Gemessen am Schirm, angemeldet:**

    Marketplace    -> https://marketplace.lumeos.app
    Admin          -> https://admin.lumeos.app
    /v2/marketplace   HTTP 404
    /v2/admin         HTTP 404
    /v2/onboarding    HTTP 404

`[read]` **Beim Coaches-Reiter stand die echte Komponente daneben und
bekam kein Prop.** **Hier gibt es keine Komponente, die man verdrahten
koennte** — die Module sind eigene Produkte auf eigenen Domains.

### Je Modul

    Marketplace   nicht gebaut, keine Route, externer Verweis.
                  Produktentscheidung, kein Befund.
    Admin         GEBAUT als eigene App: apps/admin, mit
                  curation/page.tsx (314 Zeilen), Middleware,
                  Anmeldung und zwei Testdateien.
                  A-36 ist insoweit ueberholt.
    Onboarding    nicht gebaut, keine Route (G-83 haelt es fest).

`[read]` **Als Attrappen-Befund geschlossen.** Was bleibt, ist die
Produktfrage, ob Marketplace und Onboarding in diese Anwendung
gehoeren — **und die stand nie in diesem Punkt.**

## Abnahme

**2026-08-30, mit C-49 abgenommen: geschlossen.**

`[cmd]` **Kein Import zeigt auf die Entwurfsdatei.** `[cmd]`
**Marketplace und Admin sind externe Verweise, die Routen liefern
404.**

`[read]` **Es ist nicht der Coaches-Fall** — dort stand eine
Komponente ohne Prop, **hier gibt es keine Komponente.**

`[cmd]` **Und Admin ist gebaut, als eigene App** — `apps/admin` mit
Kuration, Middleware und Tests. **Der Punkt ist insoweit ueberholt.**
