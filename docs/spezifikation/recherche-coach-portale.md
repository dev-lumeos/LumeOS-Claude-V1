---
status:     entwurf
version:    1.0
stand:      2026-08-19
ankerhash:  81c068d
quellen:    referenz/lumeos-2026/supabase/migrations/ (012, 018, 020, 022, 043, 046, 048, 052, 056, 20260321000000)
            referenz/lumeos-2026/research/coach/competitive-analysis.md (2026-02-17)
            referenz/lumeos-2026/research/ai-coach/competitive-analysis.md (2026-02-17)
            referenz/lumeos-2026/research/ai-coach/ai-coach-architecture-variants.md (2026-02-17)
            referenz/lumeos-2026/research/coach-dashboard-competitive-analysis.md (2026-02-25)
            referenz/lumeos-2026/research/coach-feedback-competitor-2026-02.md (2026-02-23)
            referenz/lumeos-2026/specs/coach-buddy-killer-feature.md (v1.6, 2026-02-28)
            referenz/lumeos-2026/AUTONOMY_ARCHITECTURE.md
            Webrecherche 2026-08-19 (URLs je Aussage im Text)
abhaengig:  —
---

# Recherche: Coach-Portale — das Vorgängerrepo und der Markt (F-04)

**Auftrag:** F-04. Auswertung, kein Entwurf — das Schema ist F-03.
**Alle `[cmd]`-Aussagen zum Vorgängerrepo sind am 2026-08-19 direkt an den
Dateien erhoben** (Read/Grep), nicht aus Berichten übernommen. Webaussagen
tragen Quelle und Abrufdatum 2026-08-19.

---

## 1. Was das Vorgängerrepo gebaut hatte

`[cmd]` Die Coach-Migrationen liegen unter
`referenz/lumeos-2026/supabase/migrations/`. Gelesen wurden 012, 018, 020,
022, 043, 046, 048, 052, 056 und `20260321000000_coach_alerts.sql`.

| Migration | Was sie anlegt | Bemerkenswert |
|---|---|---|
| **012** | `coaches` (Tier starter→enterprise, Branding, `max_clients`), `coach_clients`, `coach_programs` (inkl. `marketplace_listed`, `marketplace_price`), `program_assignments`, `coach_checkins` (Status-Workflow pending→completed), `coach_client_messages` (Sender inkl. `ai_clone`), `coach_client_alerts` | `coach_clients.permissions` ist ein JSONB mit **drei Sichtstufen je Modul**: `full` / `summary` / `none` — für sieben Module inkl. `medical: "none"` als Default |
| **018** | `coach_client_permissions` (7 Lese-Flags je Modul, 3 Plan-Schreib-Flags, `edit_auto_accept`, `edit_goals`, `medical_consent_given` + Datum), `checkin_analysis` (Modul-Scores, AI-Insights, Flags) | Boolesche **Zwei-Stufen**-Variante derselben Frage, die 012 dreistufig beantwortet hatte. Seed-Block schaltet für alle Bestandsklienten **alles frei, inkl. `medical_consent_given = true` mit `NOW()`** |
| **020** | „AI Butler" je Coach: `coach_ai_memory` (Kategorien preference/client_note/template_rule/…), `coach_ai_automations` (Trigger→Bedingung→Aktion, darunter `draft_message` für Review vs. `send_message` automatisch), `coach_ai_actions` (Log) | RLS aktiviert, aber Policies `USING (true)` |
| **022** | `coach_action_log` (Undo-Daten, `undone_at`), `coach_pending_actions` (Vorschau, 10-Minuten-Ablauf, `confirmed_at`) | Einzelnutzer-Bauweise: `user_id` mit **hartkodierter Default-UUID**, kein FK, keine RLS, keine Akteursspalte |
| **043** | `user_coach_profile` (Persönlichkeit, Ton, Sprache), `user_preferences` (mit Konfidenz und Quelle), **`user_preference_audit`** (alt/neu/Quelle/Grund), `user_milestones`, `coach_relationship_state` (trust_score, push_tolerance), `user_behavior_events` (append-only) | Die sauberste Migration: echte RLS je Tabelle, Klient darf nur `source='explicit'` schreiben, Relationship-State nur Service-Role |
| **046** | `behavioral_signatures` (6 Mustertypen mit Konfidenz und Stichprobe), `context_vectors`, `intervention_log` (Typ, Tonvariante, Intensität, **gemessenes Outcome**), `intervention_affinity` (30-Tage-Zähler, EMA), `coach_calibration_settings` (**Nutzer-Cap für Interventionsintensität, Opt-in**), Notification-System inkl. `notification_suppressed_log` | Interventionen als Experimente mit Wirkungsmessung — je Nutzer kalibriert |
| **048** | `llm_cost_log`, `user_token_budget` (Tages-Budget je Tier), **`wallets`** (Credits), `wallet_transactions` (inkl. `revenue_share`), **`subscriptions`** (free/pro/coach_basic/coach_pro, Stripe-ID), `coach_revenue` (Brutto, **Plattformgebühr**, Netto, Auszahlung) | Legt `coach_clients` **ein zweites Mal** an (`IF NOT EXISTS`, andere Spalten, `coach_id` referenziert `users` statt `coaches`) — die Definition lief ins Leere, die Policies nicht |
| **052** | `coach_rules` (Bedingung→Aktion je Klient, Priorität 1–5), `buddy_decisions` (mit `reasoning`-Feld und Status pending→accepted/rejected/executed/expired), `buddy_daily_state` | Aktionsleiter je Regel: `inform` → `recommend` → `prepare_action` → `auto_action` → `escalate_coach`. **Keine RLS in dieser Migration** |
| **056** | **`coach_autonomy`**: je Coach-Klient-Paar vier Modulstufen 1–5 (Training, Nutrition, Recovery, Supplements) + `safety_level` 1–3 | Defaults 2/2/2/2/1. Kein Goals, kein Medical. Keine RLS in der Datei |
| **20260321…_coach_alerts** | Coach-Alerts, `visible_to_coach` an Watcher-Alerts, Hilfsfunktionen | `get_coach_clients()` joint auf eine Tabelle `client_autonomy`, **die keine Migration je anlegt** |

`[cmd]` Die Begleitdokumente existieren: `specs/coach-buddy-killer-feature.md`
(v1.6, vollständig gelesen), `docs/coach-module/PRD.md`,
`docs/modules/human-coach/` mit DATABASE.md, COMPONENTS.md, API.md,
FEATURES.md, MIGRATION.md, RESEARCH.md, sowie sechs `AUTONOMY_*.md` im
Wurzelverzeichnis. `[cmd]` Der Code nutzt die Tabellen real:
`executionEngine.ts`, `manipulationGuard.ts`, `buddy.ts` und
`api/human-coach/routes/decisions.ts` lesen `coach_autonomy` per Grep belegt.

`[read]` Auffällig an der Gesamtschau: Das Repo beantwortet dieselben Fragen
mehrfach in aufeinanderfolgenden Wellen — Sicht dreistufig (012), dann
boolesch (018); Autonomie als eine Zahl (Doku), dann je Modul (056), dann je
Regel (052). Jede Welle ist für sich durchdacht; keine räumt die vorige ab.

---

## 2. Was `coach_autonomy` und `coach_pending_actions` lösen

### 2.1 Das Stufenmodell (Antwort auf Frage 1 des Auftrags)

`[cmd]` `056_coach_autonomy.sql` legt je Coach-Klient-Paar **fünf Stufen je
Modul** an (1–5, Default 2), getrennt für Training, Nutrition, Recovery,
Supplements, plus ein `safety_level` 1–3, das die API hart bei 3 kappt
(`decisions.ts`, `LEAST(..., 3)`).

`[cmd]` Die Semantik der Stufen steht in `AUTONOMY_ARCHITECTURE.md`:
1 Supervised (alles blockiert) · 2 Guided (nur Erinnerungen) ·
3 Collaborative (Empfehlungen, kleine Makro-Anpassungen <5 %, Default) ·
4 Adaptive (Deload, Volumen, Übungstausch) · 5 Autonomous (alles inkl.
Programmumbau). Dazu eine Empfehlungs-Engine: Ausgang Stufe 3, ±1 je nach
Erfahrung, Beziehungsdauer, Compliance und Komplexitäts-Flags.

`[cmd]` Durchgesetzt wird das im Buddy-Code: `processBuddyDecision` prüft je
Entscheidung Stufe gegen Aktions-Matrix; blockierte Aktionen werden zur
Freigabe an den **Coach** eskaliert, nicht an den Nutzer.

**Reichte es?** `[read]` Als Mechanik: ja — Stufen je Modul, Matrix,
Eskalation, Empfehlung sind vollständig gedacht und angebunden. Als
Governance: nein, aus zwei Gründen:

1. `[cmd]` **Die Stufen setzt der Coach über `PUT /autonomy/:clientId`
   selbst.** Es gibt keinen Bestätigungsschritt des Klienten, keine
   Einwilligung, keine RLS auf der Tabelle. Toms Vorgabe in C-95 ist genau
   umgekehrt: *der Nutzer* entscheidet, wie autonom sein Coach handeln darf.
2. `[cmd]` **Vier konkurrierende Repräsentationen derselben Idee:**
   `coach_autonomy` (056, real) · `coach_clients.autonomy_level` (nur in den
   sechs AUTONOMY-Dokumenten, die referenzierte Migration
   `20260321_add_autonomy_level.sql` existiert nirgends im Repo) ·
   `coach_autonomy_settings` (beschrieben von `coach-actions.ts:791`, keine
   Migration legt sie an) · `client_autonomy` (gejoint von
   `get_coach_clients()`, keine Migration legt sie an). Zwei davon sind
   Schreib-/Lesezugriffe auf Tabellen, die es nie gab.

### 2.2 Das Bestätigungsmuster (Antwort auf Frage 2)

`[cmd]` `coach_pending_actions` ist **genau Toms Muster** aus C-95: Die
Aktion wird mit `action_data` und `preview_data` abgelegt, verfällt nach 10
Minuten (`expires_at`), wird erst bei `confirmed_at` ausgeführt. Daneben
`coach_action_log` mit `undo_data` und `undone_at` — ausgeführte Aktionen
sind rückholbar.

`[read]` **Aber gebaut wurde es für den AI-Coach im Einzelnutzer-Betrieb,
nicht für den menschlichen Coach:** `[cmd]` `user_id` trägt eine
hartkodierte Default-UUID (`…0001`), es gibt keine Coach-/Akteursspalte,
keinen Conversation-übergreifenden Bezug auf ein Coach-Klient-Verhältnis,
keine RLS. Das Muster ist übernehmbar; die Tabelle ist es nicht.

`[read]` Bemerkenswert ist die Doppelung des Gedankens an dritter Stelle:
`coach_rules.action_type` (052) stuft **je Regel** ab, ob der Buddy nur
informiert, empfiehlt, eine Aktion vorbereitet (= pending), automatisch
handelt oder an den Coach eskaliert. Mit-oder-ohne-Bestätigung war dort
kein globaler Schalter, sondern ein Attribut der einzelnen Regel.

---

## 3. Was trotzdem fehlte

### 3.1 Die Widerrufsfrage (Antwort auf Frage 3)

C-71 hält fest: *„Keine Widerrufshistorie — vier Tabellennamen-Varianten
durchsucht, nichts gefunden."* **Die Prüfung ergibt ein differenzierteres
Bild:**

| Was | Historie vorhanden? | Beleg |
|---|---|---|
| Präferenz-Änderungen | **Ja** — `user_preference_audit` mit `old_value`, `new_value`, `source`, `reason` | `[cmd]` 043, Zeilen 132–147 |
| Coach-/Buddy-**Aktionen** | **Ja** — `coach_action_log` mit Undo-Daten und `undone_at`; `intervention_log` mit gemessenem Outcome | `[cmd]` 022, 046 |
| **Rechte- und Autonomie-Änderungen** | **Nein** — `coach_client_permissions` und `coach_autonomy` werden in place überschrieben; das in `AUTONOMY_ARCHITECTURE.md` beschriebene `coach_client_autonomy_log` (alt/neu, `changed_by`, Grund) **hat keine Migration** | `[cmd]` Grep über alle 73 Migrationen: kein `autonomy_log`, kein Audit auf den Rechte-Tabellen |

`[read]` C-71 trifft also den Kern — **für die Rechtevergabe gibt es keine
Spur, und genau dort braucht Toms Modell sie** („eine Aenderung ohne
Rueckfrage braucht trotzdem eine Spur"). Die Pauschalaussage „fehlt ganz"
ist aber zu breit: Für Präferenzen und für ausgeführte Aktionen war die
Historie gebaut, und das Autonomie-Audit war **dokumentiert, nur nie
migriert**. Das Wissen lag vor; es kam nicht in die Datenbank.

### 3.2 Der Klient hat keine Stimme

`[cmd]` Drei Belege aus den Dateien: Die Autonomiestufe setzt der Coach
(2.1). Der Seed in 018 vergibt Vollrechte inklusive Medical-Einwilligung
per Skript. `edit_auto_accept` erlaubt Änderungen „without client
confirmation" als einfachen Schalter. `[read]` Das einzige nutzerseitige
Einwilligungs-Instrument ist `coach_calibration_settings` (Opt-in-Cap für
Interventionsintensität) — und das gilt dem **AI**-Coach, nicht dem
Menschen. Toms zwei Achsen (Sicht vergibt der Nutzer, Autonomie stuft der
Nutzer) existierten als Datenstruktur, aber die Schreibrichtung war falsch
herum.

### 3.3 Zeilenschutz war Attrappe

`[cmd]` 012 und 020 aktivieren RLS und legen dann Policies `USING (true)`
an („Dev policies, replace with proper auth later"); 022, 052 und 056 haben
gar keine RLS-Zeile. Nur 043, 046 und 048 tragen echte Policies. `[read]`
Der sensibelste Bereich der Plattform — Coach sieht Klientendaten bis
Medical — lief faktisch ungeschützt. Das deckt sich mit dem bekannten
Befund, dass das Repo im Einzelnutzer-Modus entwickelt wurde.

### 3.4 Warum 60 Tabellen nicht reichten

`[read]` Der Grund ist an den Fundstücken ablesbar und deckt sich mit Toms
Diagnose („mit jedem Feature gewachsen"): **Jede Welle baute neu statt
um.** Vier Autonomie-Repräsentationen, zwei Rechte-Modelle, eine zweite
`coach_clients`-Definition mit anderer FK-Semantik, Code gegen Tabellen,
die nie angelegt wurden, und über 100 Abschluss-/Statusberichte im
Wurzelverzeichnis. `[read]` Gescheitert ist nicht die Fachlichkeit — die
Stufenmodelle, das Bestätigungsmuster, die Interventions-Messung sind
durchdacht — sondern die Konsolidierung: Es gab keinen Mechanismus, der
eine neue Antwort zwang, die alte abzulösen.

---

## 4. Was die eigene Marktrecherche schon sagt — und was daran veraltet ist

`[cmd]` Fünf Dokumente liegen vor, alle Februar 2026:

| Dokument | Datum | Inhalt |
|---|---|---|
| `research/coach/competitive-analysis.md` | 2026-02-17 | Sechs Plattformen (Trainerize, Everfit, TrueCoach, PT Distinction, TrainHeroic, My PT Hub), Feature-Matrix, Preise, USP-Ableitung |
| `research/ai-coach/competitive-analysis.md` | 2026-02-17 | Fünf AI-Coach-Archetypen (Workout-Generator, Nutrition-Planner, CV-Form-Coach, LLM-Chat, holistisch), 13 Apps, Kostenmodell |
| `research/ai-coach/ai-coach-architecture-variants.md` | 2026-02-17 | Drei Architekturvarianten (Rules-First / LLM-First / Hybrid) mit Kosten je Nutzer, „Entscheidung ausstehend" |
| `research/coach-dashboard-competitive-analysis.md` | 2026-02-25 | CoachRx als „Gold Standard" (Needs Attention, Touch Points, Activity Feed), Gap-Liste fürs eigene Dashboard |
| `research/coach-feedback-competitor-2026-02.md` | 2026-02-23 | **Echtes Feedback eines Coaches** zu seiner Software: 7 Coach- und 8 Kunden-Schmerzpunkte |

**Was davon trägt:** `[read]` Die Kernbefunde halten auch gegen die
aktuelle Webrecherche (Abschnitt 5): keine Plattform mit
Supplement-Tracking, keine mit Blutwerten, Recovery bestenfalls als
Wearable-Import, AI als neuer Differenzierer, B2B-Modell (Coach zahlt,
Klient gratis), Preis-Konvergenz auf wenige Dollar je Klient. Das
Coach-Feedback vom 23.02. ist die wertvollste Einzelquelle — es benennt
Alltag statt Featurelisten.

**Was veraltet oder lückenhaft ist:**

- **Preise.** `[cmd]` Die Matrix nennt Trainerize „Pro 5 $19.80" und lässt
  TrueCoach-Preise offen. Stand 2026-08-19 liegen die realen Endkosten
  deutlich höher (Abschnitt 5); Vergleichsquellen beziffern die
  Add-on-Inflation auf 40–60 % über dem beworbenen Preis
  ([assistantcoach.fit](https://assistantcoach.fit/blog/real-cost-fitness-coaching-software/)).
- **CoachRx fehlt** in der Plattform-Analyse vom 17.02. und kommt erst am
  25.02. im Dashboard-Dokument vor — ohne Preise. Die stehen jetzt fest
  (Abschnitt 5).
- **AI-Check-in-Analyse war am 23.02. ein unerfüllter Wunsch des Coaches
  („Kein AI Support").** `[cmd]` Stand August 2026 verkauft My PT Hub genau
  das als Add-on („Check-Ins AI")
  ([quickcoach.fit](https://www.quickcoach.fit/my-pt-hub-pricing-2026.html)).
  Der Vorsprung an dieser Stelle schrumpft.
- **Statusspalten sind Momentaufnahmen des alten Repos** („35 Übungen
  aktuell") und für LumeOS heute wertlos — die Lumeos-Relevanz-Tabelle im
  Feedback-Dokument darf nur als historisches Zeugnis gelesen werden.
- **Die Architektur-Entscheidung „ausstehend"** wurde de facto getroffen:
  `[cmd]` Das Killer-Feature-Spec (v1.4 ff.) schreibt die
  Hybrid-Grundsätze fest — Engine entscheidet, LLM formuliert, Zahlen nie
  aus dem LLM, Local-First. `[read]` Das Variantendokument ist damit
  Begründungsarchiv, keine offene Frage mehr.
- **Nicht geprüft wurden damals:** Trainerkritik in der Breite, der
  Arbeitsalltag (wo Zeit verloren geht), die Rechtefrage und die
  Rechtsseite des Geldes. Diese Lücken füllt diese Recherche (5, 6).

---

## 5. Was die Plattformen können und was Trainer kritisieren

### 5.1 Stand August 2026 (Webrecherche 2026-08-19)

| Plattform | Preisstruktur (Auswahl) | Profil |
|---|---|---|
| **ABC Trainerize** | ~175–200 $/M. bei 50 Klienten mit vollem Stack; Advanced Nutrition +45 $/M. | Feature-breiteste Plattform, Integrationen/Wearables, Studio-Features; gilt als teuer und träge |
| **Everfit** | ~134–148 $/M. bei 50 Klienten voll ausgebaut; Module: Meal Plans 33–39 $, Autoflow 24–29 $, Payments 8–9 $ | AI-Workout-Builder, natives Nutrition-Modul, moderne UI, Automation |
| **TrueCoach** | 20 $ (5) / 53 $ (20) / 107 $ (50 Klienten); **Widerspruch:** eine Quelle nennt 137 $/M. bei 50 Klienten plus 5 % Transaktionsgebühr — beide Zahlen stehen im Raum | Schnellste 1:1-Programmierung; **kein** natives Nutrition, **kein** AI-Builder, **keine** Branded App |
| **PT Distinction** | All-inclusive, ~1,60 $/Klient/M. über 50; höchstbewertet (4,9★ Capterra) | AI-Suite (Programm-Generator, Meal Planner, Assistant), White-Label inklusive |
| **CoachRx (OPEX)** | 25 $ (1–5) / 67 $ (6–50) / 169 $/M. (51–150 Klienten), keine Feature-Gates | Individual-Design-Philosophie; Dashboard-Vorbild: Needs Attention, Touch Points, Activity Feed |
| **My PT Hub** | Starter 40 $ (3 Klienten) / Premium 105 $ monatlich bzw. 90 $ jährlich, unbegrenzte Klienten / Ultimate 329 $; **Widerspruch:** eine Quelle nennt Premium 59 $ bzw. 29,50 $ jährlich (vermutlich Regionalpreise) | Flatrate statt Pro-Klient; Add-ons: White-Label 225 $/M., Check-Ins AI ~10 €/M. |
| **TrainHeroic** | Marktplatz: 1 $/Athlet/M. + 2,9 % + 0,30 $; „Marketplace Match" 30 % Provision | S&C-Fokus, Programme-Marktplatz als Revenue-Stream |

Quellen: [fitbudd.com](https://www.fitbudd.com/insights/everfit-vs-trainerize-vs-truecoach) ·
[blog.everfit.io](https://blog.everfit.io/everfit-vs-trainerize-vs-truecoach) ·
[assistantcoach.fit (Realkosten)](https://assistantcoach.fit/blog/real-cost-fitness-coaching-software/) ·
[assistantcoach.fit (Hidden Fees)](https://assistantcoach.fit/blog/hidden-fees-fitness-coaching-software/) ·
[intercom.help/coachrx (Preisliste)](https://intercom.help/coachrx/en/articles/14310925-coachrx-pricing-plans-feature-comparison) ·
[capterra.com/CoachRx](https://www.capterra.com/p/253158/CoachRx/) ·
[quickcoach.fit (My PT Hub)](https://www.quickcoach.fit/my-pt-hub-pricing-2026.html) ·
[coachway.io (My PT Hub)](https://coachway.io/articles/my-pt-hub-pricing/) ·
[support.trainheroic.com (Seller Terms)](https://support.trainheroic.com/hc/en-us/articles/18156808889997-Marketplace-Seller-Terms-Payment-Information) ·
[trainerize.com (Vergleich)](https://www.trainerize.com/blog/trainerize-vs-truecoach-vs-everfit-online-coaches/)

### 5.2 Was Trainer kritisieren (wiederkehrende Muster)

1. **Preis-Intransparenz durch Add-ons.** Der beworbene Preis ist nicht der
   gezahlte; 40–60 % Aufschlag durch Nutrition-, Automation-, Payment- und
   Branding-Module ([assistantcoach.fit](https://assistantcoach.fit/blog/hidden-fees-fitness-coaching-software/)).
   Der Markt honoriert Gegenmodelle: PT Distinction und CoachRx werben
   explizit mit „all-inclusive".
2. **Nutrition als Anhängsel.** TrueCoach delegiert an MyFitnessPal;
   Trainerize gilt für Online-only-Coaches als schwach im Meal Planning
   ([fitbudd.com](https://www.fitbudd.com/insights/best-nutrition-meal-planning-software-for-coaches),
   [instituteofpersonaltrainers.com](https://instituteofpersonaltrainers.com/blog/best-online-personal-training-software)).
3. **Veraltete/teure Platzhirsche.** Wechselbegründungen aus Reviews:
   „The platform was outdated and expensive for what you actually got"
   (Trainerize→Everfit), „Everfit looked better and had a coaching app"
   (TrueCoach→Everfit) ([blog.everfit.io](https://blog.everfit.io/everfit-vs-trainerize-vs-truecoach)).
4. **Kleinteilige Funktionslücken.** Capterra-Rezensionen zu TrueCoach:
   keine kundenspezifische Preisgestaltung/Rechnungsstellung, kein zweites
   Workout am selben Tag planbar
   ([capterra.com](https://capterra.com/p/155784/truecoach/reviews/)).
5. `[cmd]` **Das interne Coach-Feedback (23.02.2026)** deckt sich damit und
   geht tiefer: keine Business-Analytics (wer zahlt wie viel, Laufzeiten,
   Auslauf-Warnungen), keine Kundensegmentierung, keine Warnsignale
   (Gewichtstrend, Tracking-Abbruch), Training nur am Desktop bearbeitbar,
   keine Kurzvideo-Funktion Coach→Kunde, veraltete Übungsdatenbank; aus
   Kundensicht: Dashboard ohne Kontext, zu viele Klicks, **keine eigene
   Funktion für Medikamente/PEDs**, nur Englisch.

### 5.3 Der Arbeitsalltag: wo Zeit verloren geht

`[read]` Die Zeitsenke Nummer eins ist der Check-in-Review, nicht die
Programmerstellung: Gut systematisiert kostet ein Check-in 2–3 Minuten,
über Tabs und Screenshots 10–15 — bei 50 Klienten ist das der Unterschied
zwischen 90 Minuten und 6 Stunden pro Woche; ab ~40 Klienten kippt es ohne
System ([coachway.io](https://coachway.io/articles/how-to-do-client-check-ins-online-coach/),
[usecoached.com](https://usecoached.com/blog/how-to-do-client-check-ins-personal-trainers)).
Als Faustzahl für Hybrid-Trainer kursieren 15 Präsenz- plus 10–20
Online-Klienten ([mypthub.net](https://www.mypthub.net/blog/how-many-clients-personal-trainer/)).
`[read]` Das erklärt, warum CoachRx' „Needs Attention"-Priorisierung und
die aufkommenden AI-Check-in-Analysen genau dort ansetzen — und es ist die
Stelle, an der die Cross-Modul-Datenlage von LumeOS (der Coach sieht
Nutrition, Training, Recovery, Supplements in einem Datenmodell) den
Review-Aufwand strukturell senken kann, nicht nur kosmetisch.

### 5.4 Ernährung und Training zusammen

`[read]` Native Abdeckung beider Domänen bieten Everfit und PT Distinction
(je mit AI-Meal-Planner) sowie mit Abstrichen Trainerize (Add-on, 45 $/M.);
TrueCoach und TrainHeroic decken Ernährung nicht bzw. nur per Integration
ab. Die Fachpresse rät inzwischen explizit zu nativem Meal-Planning mit
verifizierter Lebensmitteldatenbank statt MyFitnessPal-Kopplung
([fitbudd.com](https://www.fitbudd.com/insights/best-nutrition-meal-planning-software-for-coaches),
[trainerfu.com](https://www.trainerfu.com/blog/best-ai-nutrition-software-for-personal-trainers-in-2026/)).
**Niemand im Feld führt Supplements, Blutwerte oder Recovery als
Coaching-Gegenstand** — der Befund der Februar-Recherche hält. `[cmd]`
LumeOS bringt laut Auftrag F-04 7.140 Lebensmittel und 1.416 Übungen mit;
die BLS-Datenbank ist genau die „verifizierte Lebensmitteldatenbank", die
der Markt als Kriterium entdeckt hat.

---

## 6. Die Rechte- und Geldseite

### 6.1 Rechte: Wie andere Sicht und Autonomie lösen

`[read]` Die großen B2B-Plattformen lösen es **gar nicht**: Der Coach ist
der zahlende Kunde, der Klient lädt „seine" Coach-App und der Coach sieht
im Wesentlichen alles, was die Plattform erfasst. Ein Rechtemodell, in dem
der **Klient** Sicht je Datenart vergibt, findet sich nur in
jüngeren/Nischen-Apps: Wellness Coach dokumentiert Opt-in je Datentyp
(„nothing is pre-checked", Widerruf jederzeit), Rollen-basierte Zugriffe
([wellnesscoach.live](https://www.wellnesscoach.live/privacy-policy),
[athletedata.health](https://www.athletedata.health/privacy)). Ein
gestuftes **Autonomie**-Modell (Coach darf ändern, ab wann ohne Rückfrage)
hat `[annahme]` keine der sechs untersuchten Plattformen — in keiner
Preis-, Feature- oder Hilfeseite der Recherche taucht das Konzept auf;
geprüft wurden die öffentlichen Materialien, nicht die eingeloggten Apps.

**Datenschutz bei Gesundheitsdaten in der EU:** `[read]` Fitness- und
Gesundheitsdaten (Herzfrequenz, Schlaf, erst recht Blutwerte und
Medikamente) sind Art.-9-DSGVO-Daten. Konsequenzen für ein Coach-Portal:
ausdrückliche Einwilligung **je Datenkategorie und Zweck** (kein
Sammel-Häkchen „Privacy Policy akzeptiert"), Widerruf ohne Nachteil,
Zugriffsminimierung (Sub-Coach sieht nur, was er braucht)
([legiscope.com](https://www.legiscope.com/blog/health-data-article-9-gdpr.html),
[themomentum.ai](https://www.themomentum.ai/blog/gdpr-consent-requirements-health-data),
[coachway.io](https://coachway.io/articles/client-data-privacy-for-online-coaches/),
[origym.co.uk](https://www.origym.co.uk/blog/gdpr-for-personal-trainers/)).

`[read]` Zwei Folgerungen: **Erstens** ist Toms Zwei-Achsen-Modell (Nutzer
vergibt Sicht je Modul, Nutzer stuft Autonomie) nicht nur Produktgeschmack,
sondern nahe an dem, was Art. 9 ohnehin verlangt — die Modul-Granularität
von 018 ist die richtige Auflösung für „je Kategorie". **Zweitens** wären
zwei Muster des Vorgängerrepos in der EU unhaltbar: die per Seed-Skript
gesetzte Medical-Einwilligung und die vom Coach selbst gesetzte
Autonomiestufe. Die fehlende Widerrufshistorie (3.1) ist auch
datenschutzrechtlich ein Loch — Einwilligungen muss man nachweisen können.

### 6.2 Geld: Wie die Plattformen verdienen

`[read]` Drei Erlösmuster im Feld, alle B2B (Coach zahlt, Klient gratis):

1. **Subscription nach Klientenzahl** — konvergiert auf ~1–4 $/Klient/M.
   (Everfit, PT Distinction, CoachRx, TrueCoach); My PT Hub fährt
   stattdessen Flatrate.
2. **Transaktionsgebühren auf Klientenzahlungen** — TrueCoach 5 % laut
   [assistantcoach.fit](https://assistantcoach.fit/blog/real-cost-fitness-coaching-software/);
   Abwicklung überall via Stripe, die Plattform hält kein Geld selbst.
   TeamBuildr wirbt umgekehrt mit „zero commission" als Kampfansage
   ([teambuildr.com](https://www.teambuildr.com/trainheroic-vs-teambuildr)).
3. **Marktplatz-Provision** — TrainHeroic: 1 $/Athlet/M. + Bankgebühren,
   bei plattformvermittelten Verkäufen („Marketplace Match") 30 %
   ([support.trainheroic.com](https://support.trainheroic.com/hc/en-us/articles/18156808889997-Marketplace-Seller-Terms-Payment-Information)).

`[cmd]` Das Vorgängerrepo (048) kombiniert Muster 1 und 3 — Subscriptions
mit `coach_basic`/`coach_pro`, `coach_revenue` mit Plattformgebühr — und
legt **zusätzlich** eine eigene Credits-Ökonomie an (`wallets`,
`wallet_transactions` mit `revenue_share`), plus LLM-Kostensteuerung
(`llm_cost_log`, `user_token_budget` je Tier). Das AI-Coach-Spec rechnet
die Token-Seite durch: 0,50–8 $ Infrastrukturkosten je Nutzer und Monat je
nach Nutzung, Abo-Zielpreis 14,99–24,99 $.

`[read]` **Rechtlich berührt das dreierlei:** Reine
Stripe-Connect-Abwicklung (Muster im Markt) hält die Plattform aus der
Zahlungsregulierung heraus. Eine **eigene Credits-Wallet mit Guthaben,
Auszahlung und Revenue-Share** geht darüber hinaus — `[annahme]` das
berührt E-Geld-/Zahlungsdienste-Regulierung (in der EU: PSD2/EMD-Umfeld)
und ist von keiner der sechs Plattformen vorgelebt; eine belastbare
juristische Prüfung war nicht Teil dieser Recherche und **fehlt als
ehrliche Lücke**. Drittens setzt ein Marktplatz für Programme Steuer- und
Verbraucherrechtsfragen (Provision, Widerruf) voraus, die hier ebenfalls
nur benannt, nicht beantwortet sind.

**Ob LumeOS eine Wallet will, ist eine Produkt- und Rechtsentscheidung —
sie gehört Tom**, mit juristischer Zuarbeit vor dem Bau.

---

## 7. Was an unserem Entwurf eigen ist

Maßstab: 60+ Tabellen und die Mockup-Vorlage gegen den Marktstand aus
Abschnitt 5.

### 7.1 Deckungsgleich mit dem Markt (Übersetzungsarbeit, kein Neuland)

`[read]` Klientenverwaltung, Programm-Builder mit Templates und Zuweisung,
Check-ins mit Status-Workflow, Messaging, Compliance-Anzeigen,
Priorisierung („Needs Attention" — CoachRx), Activity Feed, Payments,
White-Label-Stufen, Programme-Marktplatz (TrainHeroic), AI-generierte
Programme und Meal Plans (Everfit, PT Distinction), AI-Entwurfsassistent
für Coach-Antworten (020 „AI Butler" ≈ Marktrichtung AI-Assistants),
Readiness-Abfragen vor dem Training (TrainHeroic). Hier ist der Vorgänger
Anforderungsquelle, kein Alleinstellungsmerkmal.

### 7.2 Eigen — und nach dieser Recherche ein Vorteil

- **Supplements, Blutwerte, Recovery, PED/Enhanced-Monitoring als
  Coaching-Gegenstand.** `[read]` Auch Stand August 2026 bietet das keine
  der sechs Plattformen; das interne Coach-Feedback benennt genau diese
  Lücke aus Kundensicht („keine Extra-Funktion für Medis/PEDs"). Zusammen
  mit nativem Nutrition auf BLS-Basis ist das die Differenzierung mit dem
  längsten Bestand.
- **Cross-Modul-Intelligenz für den Coach.** `[read]` Der Markt entdeckt
  AI-Check-in-Analyse gerade als Add-on (My PT Hub); niemand hat die
  Datenbasis, Ursachenketten über Module zu legen („Eisen niedrig →
  Energie → Trainingsleistung"). Der Zeitgewinn liegt an der teuersten
  Stelle des Coach-Alltags (5.3).
- **Autonomie als gestuftes, je Modul verschiedenes Recht mit
  Bestätigungsmuster.** `[read]` Die Mechanik aus 056/022/052 —
  Stufen, Aktions-Matrix, pending mit Vorschau und Verfall, Undo-Log,
  Eskalationsleiter je Regel — hat im Markt kein Gegenstück und ist als
  Muster übernehmbar. **Vorteil wird sie aber erst mit umgekehrter
  Schreibrichtung** (Nutzer stuft, Coach beantragt) — sonst reproduziert
  sie den Fehler des Vorgängers und kollidiert mit Art. 9 (6.1).
- **Interventions-Engine mit Leitplanken.** `[cmd]` Manipulation Guard
  (verbotene Angst-/Schuld-Narrative, `max_intervention_intensity` mit
  Hard Cap, Wochenlimits), Wirkungsmessung je Intervention, BSS =
  Stabilität × Zielausrichtung — das ist im Killer-Feature-Spec v1.6
  ausgearbeitet und `[read]` nirgends im Markt auch nur angedeutet. Es ist
  zugleich das ethisch heikelste Stück: Das Spec selbst benennt, dass das
  System implizite A/B-Tests am Nutzer fährt. Eigen: ja. Vorteil: nur mit
  den Leitplanken als nicht verhandelbarem Teil.

### 7.3 Eigen — und nach meiner Einschätzung Irrtum oder offenes Risiko

- **Der Coach setzt seine eigene Autonomiestufe** (056/decisions.ts).
  `[read]` Halte ich für einen Irrtum, nicht für eine Alternative: Er
  widerspricht Toms C-95-Vorgabe, dem Kernversprechen der Vorlage („jeder
  Plan kommt als Vorschlag") und der DSGVO-Logik. Der Mechanismus bleibt,
  die Governance dreht sich um.
- **Fünf Stufen je Modul plus Safety-Level plus Regel-Leiter
  gleichzeitig.** `[read]` Drei Granularitäten derselben Frage sind ein
  Symptom, kein Design. Tom hat für den Start zwei Werte je Modul
  vorgegeben („mit oder ohne Bestätigung, feiner später") — **wie viel der
  Vorgänger-Feinheit später zurückkommt, ist Toms Entscheidung**; diese
  Recherche liefert nur den Befund, dass die Feinheit dort nie konsolidiert
  wurde (vier Repräsentationen, zwei davon ohne Tabelle).
- **Credits-Wallet als eigene Ökonomie.** `[read]` Kein Vorbild im Feld,
  regulatorische Last (6.2), und der Markt zeigt, dass Subscription +
  Stripe + Provision ohne eigenes Guthaben auskommt. Eigen heißt hier:
  teuer in Prüfung und Betrieb, bevor es Wert beweist. Entscheidung für
  Tom, mit Rechtsprüfung davor.
- **Behavior-Engine über Fitness hinaus** (Spec 21.9, „domain-agnostisch").
  `[read]` Als Vision notiert, als Scope-Risiko markiert — das Spec selbst
  nennt Scope-Explosion das größte Risiko. Kein Bauauftrag ableitbar.

### 7.4 Entscheidungen, die hier nur benannt werden (Tom)

1. Stufigkeit der Autonomie: zwei Werte jetzt (C-95) — ob und wann die
   5er-/Regel-Granularität des Vorgängers zurückkommt.
2. Sichtstufen: zwei (018, boolesch) oder drei (012, full/summary/none —
   die Vorlage kennt drei).
3. Wallet/Credits: bauen, verschieben oder streichen.
4. Marktplatz-Provisionmodell (Flat vs. prozentual vs. vermittelt).

### Ehrliche Lücken dieser Recherche

- Trainerkritik stammt aus Reviews, Vergleichsseiten und einem
  Einzel-Feedback — **direkte Reddit-/Forendiskussionen waren über die
  Suche nicht erreichbar**; die Suchtreffer lieferten stattdessen
  Review-Aggregate. Die Muster decken sich, die Rohquellen fehlen.
- Preisangaben mit benannten Widersprüchen (TrueCoach 107 $ vs. 137 $;
  My PT Hub 105 $ vs. 59 $) — vermutlich Regional-/Aktionspreise, nicht
  aufgelöst.
- Keine juristische Prüfung der Wallet-/PSD2-Frage; nur als
  Prüfungsbedarf markiert.
- Die eingeloggten Apps der sechs Plattformen wurden nicht selbst bedient;
  Feature-Aussagen beruhen auf öffentlichem Material der Anbieter und
  Dritter.
