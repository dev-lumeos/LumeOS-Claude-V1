# LUMEOS Core Foundation — Vollständige Rekonstruktion
> Konsolidiert aus 01–21 RTF-Quellen | 2026-04-14
> Quellen: 01_CORE_PRODUCT_TRUTH bis 21_MASTER_INDEX

---

## 01 — Core Product Truth

**LumeOS verwandelt fragmentierte Körper-, Gesundheits- und Verhaltensdaten in personalisierte, proaktive und alltagstaugliche Entscheidungen.**

LumeOS ist kein Kalorientracker, kein Workout-Logger, kein GPT-Wrapper. Es ist ein AI-natives Health & Performance OS mit Buddy als persistenter Intelligenzschicht.

**Buddy:** Kein normaler Chatbot. Die intelligente, persönliche und kontinuierliche Oberfläche des Gesamtsystems.

**Produkt-DNA:** persistent, persönlich, proaktiv, erklärbar, modular, AI-native, kontextbewusst, alltagstauglich, entscheidungsorientiert, langfristig lernfähig.

**7 Grundprinzipien:**
1. Entscheidung vor Datenmenge
2. Klarheit vor Feature-Masse
3. Buddy ist die Oberfläche, nicht das Add-on
4. Kontext schlägt Einzeldaten
5. Unterstützung statt Überforderung
6. Erklärbarkeit ist Pflicht
7. Sicherheit und Grenzen sind Teil des Produkts

**Arbeitsregel:** Jede Funktion muss bestehen: "Macht das LumeOS besser darin, den Nutzer kontextbezogen zu verstehen und ihm sinnvolle nächste Schritte zu geben?"

---

## 02 — Domain Map

**5 Ebenen — 22 Domains**

**Ebene 1 — Foundation (Absolute Core):**
Identity & Access, User Profile, Preferences & Settings, Goals & Strategy

**Ebene 2 — Core State Domains (Absolute Core):**
Nutrition, Training, Recovery, Supplements, Medical Awareness (Sensitive Core)

**Ebene 3 — Intelligence Domains (Absolute Core):**
Memory & Context, Recommendation Engine, Decision Engine, Safety & Guardrails, Insight & Prioritization

**Ebene 4 — Interaction Domains (Core):**
Buddy/Companion, Daily Guidance, Check-ins, Explanations & Education, Notifications/Nudges, Voice (Strategic Expansion)

**Ebene 5 — Human/Business/Expansion:**
Coach Layer (Strategic Core), Human Escalation, Programs & Plans, Marketplace/Commerce, Content Library, Wearables & Integrations, Visual/Vision Layer

**Domain-Priorität:**
- Absolute Core: Goals & Strategy, Nutrition, Training, Recovery, Memory & Context, Recommendation Engine, Decision Engine, Safety & Guardrails, Buddy/Companion
- Core: Identity, Profile, Preferences, Supplements, Medical, Insight, Daily Guidance, Check-ins, Explanations, Notifications
- Strategic Expansion: Voice, Coach, Human Escalation, Programs, Marketplace, Content, Wearables, Vision

**Arbeitsregel:** Jedes Feature muss einer legitimen Domain zugeordnet werden. Keine Domain = nicht in den Produktkern.

---

## 03 — Capability Map

**21 Capability-Bereiche (vollständige Produktlandkarte)**

1. Identity, Account & Personal Foundation
2. Goals, Phases & Strategy
3. Nutrition Capabilities (Food DB, Search, Logging, Analysis, Planning, Advanced)
4. Training Capabilities (Exercise DB, Workout Structure, Logging, Progression, Adaptive, Advanced)
5. Recovery Capabilities (State Tracking, Interpretation, Guidance, Advanced)
6. Supplement Capabilities (DB, Logging, Intelligence, Guidance, Advanced)
7. Medical Awareness Capabilities (Bloodwork, Interpretation, Safety Guidance, Boundaries)
8. Memory & Context Capabilities (Persistent Memory, Context Synthesis, Adaptive Personalization, Memory-Driven Guidance)
9. Recommendation & Decision Capabilities (Generation, Logic, Cross-Domain Reasoning, Confidence, Escalation)
10. Buddy/Companion Capabilities (Conversational, Daily Companion, Proactive, Decision Translator, Advanced)
11. Daily UX, Check-ins & Adherence
12. Insights, Reports & Explanations
13. Coach Capabilities (Dashboard, Assistance, Personalization)
14. Human Escalation
15. Content & Education
16. Marketplace & Commerce
17. Wearables & External Integrations
18. Visual/Vision
19. Voice
20. Automation

**Wichtigste Designregel:** Alles in der Capability Map darf prinzipiell Teil von LumeOS sein. Nichts ist automatisch V1. Planung darf groß sein. Umsetzung muss brutal fokussiert sein.

---

## 04 — System Entities

**8 Entity-Hauptklassen:**

**1. Identity & Foundation:** User, Account, Session, Role, UserProfile, Preference, Constraint

**2. Goal & Strategy:** Goal, GoalHierarchy, GoalPriority, GoalPhase, Strategy, Tradeoff

**3. State Input Entities:**
- Nutrition: Food, FoodPortion, Recipe, Meal, Nutrient, NutrientTarget
- Training: Exercise, ExerciseVariant, Workout, WorkoutBlock
- Recovery: RecoveryState, SleepRecord, StressSignal, SorenessSignal
- Supplements: Supplement, SupplementProduct, SupplementIngredient, SupplementProtocol
- Medical: Biomarker, BiomarkerReading, ReferenceRange, HealthContext

**4. Logging & Event Entities:** MealLog, FoodLogItem, WorkoutSession, SetLog, CheckIn, SupplementLog, SymptomLog, HabitEvent, AdherenceRecord, TimelineEvent

**5. Intelligence Entities:** MemoryItem, Pattern, Insight, Recommendation, RecommendationReason, DecisionContext, DecisionRule, Trigger, PrioritySignal, ConfidenceState, RiskFlag, EscalationCase

**6. Companion & Interaction:** BuddyMessage, Conversation, ConversationTurn, GuidanceItem, DailyFocus, Reminder, Nudge, Explanation, Summary

**7. Human & Collaboration:** CoachProfile, ClientRelationship, CoachNote, CoachRecommendation, HumanReview, EscalationTarget

**8. Commerce, Content & Expansion:** Program, ContentItem, KnowledgeNode, Product, Offer, IntegrationSource, VisionInput, VoiceInteraction

**Kernregel:** Dieses Dokument definiert fachliche Existenz, nicht technische Umsetzung. Nicht jede Entity braucht sofort eine eigene Tabelle — aber jede muss als fachliches Objekt klar gedacht sein.

---

## 05 — Build Strategy

**Zentrale Bauregel:** Planung darf maximal vollständig sein. Umsetzung muss maximal selektiv sein.

**Zwei Ebenen die nie vermischt werden dürfen:**
- Ebene A (Produktlandkarte): Darf groß und ambitioniert sein
- Ebene B (Build Scope): Muss brutal fokussiert bleiben

**Was nicht wieder passieren darf:**
- Vision und Realität vermischen
- Module zu früh technisch zementieren
- Zu früh in UI denken
- Feature-Masse vor Fundament
- Buddy als Add-on behandeln

**Richtige Build-Reihenfolge (von innen nach außen):**
1. Produktwahrheit → 2. Domänenklarheit → 3. Fähigkeitskarte → 4. Entity-Klarheit → 5. Entscheidungslogik → 6. Datenfundament → 7. Interaktionsschicht → 8. Ausbau- und Business-Layer

**12 Bauphasen (langfristig):**
Phase 0: Rekonstruktion | Phase 1: Identity & Foundation | Phase 2: Nutrition | Phase 3: Training | Phase 4: Recovery | Phase 5: Supplements | Phase 6: Medical | Phase 7: Memory & Context | Phase 8: Recommendation & Decision | Phase 9: Buddy Core | Phase 10: Daily System | Phase 11: Coach Layer | Phase 12: Programs, Content, Commerce, Expansion

**5 Entscheidungsfragen für jedes Feature:**
1. Trägt es direkt zum Produktkern bei?
2. Baut es auf stabilem Fundament auf?
3. Erhöht es echte Nutzbarkeit?
4. Erzeugt es Klarheit oder Komplexität?
5. Wäre Buddy ohne es wirklich schlechter?

---

## 06 — Product Layers (5-Schichten-Modell)

```
Foundation Layer → State Layer → Intelligence Layer → Interaction Layer → Human & Expansion Layer
```

**Layer 1 — Foundation:** Identity, Profile, Preferences, Goals & Strategy, Constraints
Output: Nutzerkontext, Zielkontext, Präferenzkontext

**Layer 2 — State:** Nutrition, Training, Recovery, Supplements, Medical Awareness, State-Nahe Events
Output: Aktueller Zustand + Verlauf + Adherence-Signale

**Layer 3 — Intelligence (der eigentliche Motor):**
Memory & Context, Context Synthesis, Decision Engine, Recommendation Engine, Safety & Guardrails, Insight & Prioritization
Output: Recommendations, Priority Signals, Risk Flags, Insights, Buddy-konformer Kontext

**Layer 4 — Interaction:** Buddy, Daily Guidance, Check-ins, Explanations, Summaries, Reminders & Nudges, Voice
Output: Buddy-Antworten, Guidance Items, Check-in-Daten

**Layer 5 — Human & Expansion:** Coach Layer, Human Escalation, Programs & Plans, Content, Marketplace, Wearables, Visual, Advanced Automation

**Kritische Abhängigkeiten:**
- Foundation → Voraussetzung für alles
- State → Voraussetzung für echte Intelligenz
- Intelligence → Voraussetzung für Buddy
- Interaction → Voraussetzung für Alltagstauglichkeit
- Human/Expansion → Verstärkung, nicht Fundament

**Wichtigste Erkenntnis:** LumeOS darf nie wieder als "viele Module nebeneinander" gedacht werden. Es ist ein geschichtetes Entscheidungs- und Begleitsystem.

---

## 07 — V1 Foundation Scope

**Ziel:** Belastbares Fundament schaffen, auf dem Buddy später wirklich sinnvoll arbeiten kann.

**V1 Pflichtbereiche:**

**A. Identity & User Foundation**
Auth, OAuth, User, UserProfile, Preferences, Goals (Hauptziel + einfache Priorisierung)

**B. Nutrition Foundation**
Food Base (Foods, Canonical, Portions, Makros, Mikros, Suchbarkeit)
Meal Structure (Meal, Logging, Tagesbezug, Historie, Calculation)

**C. Training Foundation**
Exercise Base (Übungen, Kategorien, Muskelgruppen, Equipment)
Workout Base + Logging (Sessions, Sets, Gewicht, Reps, History, Baseline Progression)

**D. Recovery Foundation**
Recovery Inputs (Schlaf, Energie, Stress, Soreness, Tagesform)
Daily Check-in + RecoveryState + Verlauf

**E. Core Event / Timeline Foundation**
Zeitliche Zuordnung, Verlauf pro Domain, zusammenführbare Historie

**F. Minimale Intelligence-Vorbereitung**
Saubere State-Zusammenführung, erste Kontextfähigkeit, erste Bewertbarkeit

**Bewusst NICHT Teil von V1:**
Vollständiger Buddy, Recommendation Engine, Memory Layer tief, Supplement-System, Medical Awareness tief, Coach Layer, Marketplace, Voice, Vision, Wearables, Programme

**Erfolgsdefinition:** "LumeOS V1 Foundation ist ein sauberes, stateful Fundament für User, Ziele, Ernährung, Training und Recovery."

---

## 08 — Core User Journeys (8 Journeys)

**Journey 1 — Onboarding & Grundlage**
Nutzer richtet LumeOS ein. Basisprofil → Ziel → Präferenzen → Startzustand. Keine Formularhölle.

**Journey 2 — Täglicher Start / Daily Orientation**
"Sag mir, was heute wichtig ist." Optional: Schlaf/Energie/Stress → Tageseinordnung → Daily Focus.

**Journey 3 — Ernährung im Alltag**
"Ich will Essen einfach eintragen, ohne dass es nervt." Food/Meal-Eingabe → Portionen → Meal-Verständnis → Auswertung.

**Journey 4 — Training im Alltag**
"Im Gym schnell durch mein Training kommen." Workout auswählen → Sets loggen → Verlauf sehen.

**Journey 5 — Recovery & Zustandsreflexion**
"Ich will nicht alles messen, aber wissen wie ich dastehe." Kurzer Check-in → Recovery-Zustand → Kontext.

**Journey 6 — Verstehen & Einordnen**
"Ich will nicht nur Zahlen sehen. Ich will kapieren was das heißt." Insights → Trends → Zusammenhänge.

**Journey 7 — Buddy als täglicher Begleiter**
"Ich will nicht immer selbst überlegen müssen wo ich hinschauen soll." Buddy mit echtem Systemkontext.

**Journey 8 — Langfristige Entwicklung & Kontinuität**
"Ich will nicht jeden Monat wieder bei null anfangen." Verlauf → Muster → bessere Guidance → echter Companion.

**Produktregel:** Jede neue Funktion muss mindestens eine Core Journey verbessern.

**Priorität für Build:**
- Erste Prio: Journey 1–5
- Zweite Prio: Journey 6–7
- Dritte Prio: Journey 8

---

## 11 — System Boundaries

**3 Boundary-Zonen:**

**Zone A — Sicherer Produktkern:** Tagesfokus, Trainingseinordnung, Nutrition Guidance, Recovery-Einordnung, Adherence-Hinweise, Supplement-Logik im klaren Rahmen, Buddy-Guidance im Alltag. Hier darf LumeOS klar und proaktiv sein.

**Zone B — Vorsichtiger Kontextbereich:** Auffällige Gesundheitsmuster, potenzielle Interaktionen, ungew. Verläufe, unsichere Signallagen. Hier nur aufmerksam machen, vorsichtig formulieren, zur Abklärung raten.

**Zone C — Explizit außerhalb:** Diagnosen, Therapieanweisungen, medizinische Ursachenbehauptungen, psychologische Behandlungsführung, harte Sicherheitszusagen. Klar begrenzen, an menschliche Stellen verweisen.

**Eskalationsregel:** LumeOS muss eskalieren wenn: Sicherheit vor Optimierung, Datenlage zu unsicher, sensibles Thema braucht menschliche Bewertung, Buddy an sinnvolle Grenze kommt.

**Oberste Grenzregel:** LumeOS darf intelligent und klar sein — aber niemals sicherer, kompetenter oder vollständiger wirken als seine echte Systemsubstanz es trägt.

---

## 12 — Value Proposition

**Das Kernproblem das LumeOS löst:**
Menschen scheitern selten an fehlenden Informationen. Sie scheitern an zu vielen, zu losen, zu wenig hilfreichen Informationen.
→ LumeOS löst kein Datenproblem. LumeOS löst ein Orientierungs-, Priorisierungs- und Kontinuitätsproblem.

**Besser als:**
- Klassische Tracker: speichern Daten — LumeOS übersetzt in Handlung
- AI-Chatbots: reagieren ohne Kontext — LumeOS begleitet kontextbewusst
- Coaching-Apps: geben Pläne aus — LumeOS denkt mit und priorisiert
- Informationsquellen: häufen Wissen an — LumeOS übersetzt in Entscheidungshilfe

**6 echte Nutzenversprechen:**
1. Klarheit — was ist gerade wirklich los
2. Priorität — was zählt jetzt zuerst
3. Kontinuität — kein Neustart-Gefühl
4. Alltagstauglichkeit — weniger Reibung
5. Personalisierung — individuell relevant
6. Begleitung — kontinuierlicher Companion

**Die Transformation:**
Vorher: Datenfragmentierung, Planchaos, Reibung, unklare Prioritäten
Nachher: Klarheit, bessere Priorisierung, Kontinuität, weniger Reibung, "ich habe ein System"

---

## 13 — Data Truth Principles

**3 Klassen von Datenwahrheit:**

**Klasse A — Direkte Wahrheit:** Direkt eingegeben oder belastbare Quelle. Gilt als "direkt wahr". Beispiele: geloggte Mahlzeit, geloggtes Workout, echter Biomarker-Wert.

**Klasse B — Abgeleitete Wahrheit:** Aus anderen Daten logisch berechnet. Nur so gut wie ihre Inputs. Nicht gleichwertig zu Rohwahrheit.

**Klasse C — Interpretative Wahrheit:** Aus Regeln, Kontext oder Mustern interpretiert. Braucht: Regeln, Kontext, Confidence, Vorsicht, Erklärbarkeit.

**Kritische Regeln:**
- Schätzungen ≠ Fakten speichern
- Interpretationen ≠ Rohdaten behandeln
- Rohdaten dürfen NICHT von Systemmeinungen überschrieben werden
- Canonical Layer (standardisiert) ≠ User Reality Layer (alltagsnah) — beide nötig
- Mapping: nur als sicher wenn wirklich eindeutig. Sonst: confidence level + Fallback
- Fehlende Daten: Unknown > falsch-sicher
- "Unknown" ist ein legitimer Zustand

**Buddy-Regel:** Buddy darf verständlicher formulieren — darf aber nie härter behaupten als die Datenbasis erlaubt.

---

## 14 — System Output Types (9 Typen)

| Typ | Zweck | Beispiel |
|---|---|---|
| **Focus Output** | Was jetzt die wichtigste Sache ist | "Heute Recovery priorisieren." |
| **Recommendation Output** | Konkrete handlungsfähige nächste Schritte | "Reduziere heute das Trainingsvolumen." |
| **Insight Output** | Relevante Erkenntnis / Musterverdichtung | "Energie fällt wiederholt nach schlechtem Schlaf." |
| **Explanation Output** | Warum etwas empfohlen wird | "Das kommt aus deinem Recovery- und Trainingskontext." |
| **Warning/Risk Output** | Erhöhter Aufmerksamkeitsmarker | "Aktuell erhöhtes Überlastungsrisiko." |
| **Reminder/Nudge Output** | Verhalten niedrigschwellig unterstützen | "Kurzer Check-in für deinen Zustand?" |
| **Summary Output** | Verdichtete Übersicht | Tageszusammenfassung, Wochenrückblick |
| **Check-in Prompt Output** | Fehlende Zustandsinfos einholen | "Wie war dein Schlaf letzte Nacht?" |
| **Escalation Output** | Grenzmarkierung + Übergabe | "Hier wäre menschliche Rücksprache sinnvoll." |

**Systemregel:** Fachliche Output-Typen dürfen nicht mit UI-Komponenten verwechselt werden. Ein Insight bleibt ein Insight, egal ob er als Chat-Antwort oder Dashboard-Block erscheint.

**Erste Priorität für V1:** Focus, Recommendation, Check-in Prompt, Summary (einfach), Explanation (einfach)

---

## 15 — V1 System Contract

**5 Pflicht-Eingabewelten:**
1. User Context Inputs (Identität, Auth, Basisprofil, K.daten, Erfahrung, Präferenzen, Sprache/Einheiten)
2. Goal Context Inputs (Hauptziel, Unterziele, Priorität, Fokusrichtung)
3. Nutrition Inputs (Food, Portion, Meal, Meal-Zeitpunkt, Logging, Wiederholbarkeit)
4. Training Inputs (Workout, Sets, Gewicht, Reps, Session-Zeitpunkt, History)
5. Recovery Inputs (Schlaf, Energie, Stress, Soreness, Tagesform)

**6 Pflicht-Kernobjekte:**
1. User Foundation Objects (User, Account, UserProfile, Preference, Goal)
2. Nutrition Objects (Food, FoodPortion, Meal, MealLog, Nutrient)
3. Training Objects (Exercise, Workout/Template, WorkoutSession, SetLog)
4. Recovery Objects (RecoveryState, CheckIn, SleepRecord, Tageszustände)
5. Timeline/History Objects
6. Early Context Objects (Goal-Kontext, State-Zusammenführung)

**7 Pflicht-Fähigkeiten:**
1. User Basis verwalten
2. Ernährung strukturiert erfassen
3. Ernährung auswerten (Makros, Mikros, Tageswerte)
4. Training strukturiert erfassen
5. Training basal einordnen (letzte Leistung, Verlauf)
6. Recovery erfassen
7. Zeit und Verlauf zusammenhalten

**5 Pflicht-Outputs:**
1. Basic State View (aktueller Stand pro Domain)
2. Basic History View (Verlauf)
3. Basic Daily Orientation Basis
4. Basic Explanatory Data
5. Buddy-Ready Context Basis

**5 Pflicht-Flows:**
1. User Setup Flow
2. Food/Meal Logging Flow
3. Workout Logging Flow
4. Daily Recovery/Check-in Flow
5. Basic Daily State Access Flow

**Systemische Non-Funktionsregeln:**
- Datenklarheit (Rohdaten ≠ Interpretation)
- Zeitlichkeit (Verlauf erhalten)
- Canonical Readiness
- Erweiterbarkeit (V1 darf Kernschichten nicht blockieren)
- Buddy Readiness

---

## 16 — Build Order V1

**Oberste Bauregel:** Von innen nach außen. Erst Fundament, dann Nutzungsflüsse, dann Zugriff, dann Darstellung.

**8 Baustufen:**

| Stufe | Name | Freischaltet |
|---|---|---|
| 1 | Identity & User Foundation | Echter Nutzerkontext |
| 2 | Nutrition Data Foundation | Saubere Ernährungsdatenbasis |
| 3 | Nutrition Logging & Calculation | Echte tägliche Erfassung |
| 4 | Training Foundation | Workout-Struktur + Gym-tauglich |
| 5 | Training Logging & History | Verlauf + Progression |
| 6 | Recovery Foundation | Echter Daily State |
| 7 | Timeline & State Access Layer | Dom.übergreifender State-Zugriff |
| 8 | Basic V1 Experience Layer | Erste echte Alltagsnutzung |

**Abhängigkeitskette:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

**Red Flags für falsche Reihenfolge:**
- "Lass uns schnell schon mal Buddy bauen"
- "Wir machen erstmal Screens, dann Logik später"
- "Das Recommendation-System bauen wir promptbasiert rein"
- "Die Struktur fixen wir später"

**Nicht anfassen während V1 Foundation:**
Buddy Personality, Recommendation Engine tief, Memory System tief, Supplements, Medical, Coach Layer, Human Escalation, Voice, Vision, Wearables, Marketplace, tiefe AI-Agentenlogik

---

## 17 — V1 Acceptance Criteria

**Abnahmeregel:** V1 gilt nur dann als fertig wenn: "Ein echter Nutzer kann mit stabiler Nutzerbasis, klaren Zielen und alltagstauglichen Flows Ernährung, Training und Recovery nutzen, und das System hält diese Zustände sauber über Zeit zusammen."

**6 Abnahmebereiche:**

**1. User Foundation:** Auth stabil, Profil strukturiert nutzbar, Ziele wirklich nutzbar, Präferenzen nicht nur Kosmetik

**2. Nutrition Foundation:** Foods real nutzbar, Meal Logging alltagstauglich, Calculation belastbar (konsistente Ergebnisse), History vorhanden

**3. Training Foundation:** Übungen/Workouts nutzbar modelliert, Workout Logging funktioniert real, History brauchbar

**4. Recovery Foundation:** Inputs niedrigschwellig nutzbar, State persistent + lesbar

**5. Timeline & State Integrity:** Zeitbezug sauber, Verlauf systemisch lesbar, Current State ableitbar, Rohdaten ≠ Interpretation

**6. V1 Product Usability:** Onboarding erzeugt echten Startzustand, Meal Logging real verwendbar, Workout Logging real verwendbar, Recovery Check-in real verwendbar, Basic Daily State abrufbar

**Nicht ausreichend für Abnahme:**
schöne Screens, Demo-Videos, halb funktionierende Flows, "Backend steht schon irgendwie", "die Daten sind in der DB", "Claude kann das im Zweifel erklären"

---

## 18 — Scope Control Rules

**3 Scope-Kategorien:**

**Kategorie A (Current Build Scope):** Direkt nötig für aktiven Contract / Kernflow / Systemstabilität / Abnahmefähigkeit

**Kategorie B (Later Planned Scope):** Gehört klar zum Produkt — aber NICHT jetzt dran

**Kategorie C (Parking / Idea Reservoir):** Spannend aber noch zu unscharf oder zu weit weg

**Regel für neue Ideen:** Nicht sofort in Umsetzung ziehen. Schritt 1: Für aktuelle Stufe zwingend? Schritt 2: Wenn nein: späterer Layer? Schritt 3: Sonst ins Parking.

**5 häufigste Scope-Fallen:**
1. "Wenn wir schon dabei sind..." → NEIN
2. "Das brauchen wir später sowieso" → "Später wichtig" ≠ "jetzt dran"
3. "Nur schnell vorbereiten" → wird fast immer halbfertige Architektur
4. "Das ist doch nur ein kleines Extra" → Fast nie. Erzeugt UI-Folgen, Edge Cases, Pflege
5. "Das macht es gleich intelligenter" → Intelligenz kommt auf Substanz, nicht davor

**Echter Fortschritt vs. Aktivität:**
Echter Fortschritt: abgeschlossene Kernfähigkeit, belastbarer Flow, neue Produktnutzbarkeit
Bloße Aktivität: viele halbe Dinge, viele neue Files ohne Produktnutzen, viele angefangene Strukturen

---

## 19 — V1 Workstreams

**7 operative Workstreams:**

| Workstream | Ziel | Ergebnis |
|---|---|---|
| A — Identity/User Foundation | Stabile Nutzerbasis | Echter persistenter Nutzerkontext |
| B — Nutrition Data Foundation | Nutrition Datengrundlage | Saubere rechenf. Datenbasis |
| C — Nutrition Logging & Calculation | Nutrition alltagsnutzbar | Real loggbar + berechenbar |
| D — Training Foundation & Logging | Training aufbauen + loggbar | Real loggbar + verlaufsf. |
| E — Recovery Foundation | Recovery + Tageszustand | Echter täglicher Zustandskontext |
| F — Timeline/State Access Layer | Domains zusammenführen | Erster echter Systemzugriff |
| G — V1 Experience Layer | Foundation in Produkt übersetzen | Minimal echte Produktnutzbarkeit |

**Reihenfolge:** A → B → C → D → E → F → G

**Workstream gilt erst dann als fertig wenn:**
Kernobjekte stabil, Kernflow real nutzbar, Outputs logisch, keine offenen Abhängigkeiten, echter Produktwert freigeschaltet.

Nicht ausreichend: "Daten angelegt", "Tabellen existieren", "APIs laufen halb"

---

## 20 — V1 Open Questions

**Status-Typen:** OPEN / DIRECTIONALLY CLEAR / DELAYED BY DESIGN

**Offene Identity-Fragen:**
- A1: Exakter Auth-Ansatz (DIRECTIONALLY CLEAR — exakter Stack noch offen)
- A2: Umfang User Profile in V1 (OPEN — welche Felder Pflicht?)
- A3: Goal-Modellierung in V1 (DIRECTIONALLY CLEAR — ob Subgoals/Phasen nötig offen)

**Offene Nutrition-Fragen:**
- B1: Exakte Food-Search-Strategie (OPEN — Ranking, Synonyme, Alias-Handling)
- B2: Tiefe Canonical Food Layer in V1 (DIRECTIONALLY CLEAR)
- B3: Wiederverwendbare Meals in V1 (OPEN — V1 oder V1.1?)
- B4: Mikronutrient-Tiefe in V1 (DIRECTIONALLY CLEAR — Calculation ja, UI-Tiefe offen)

**Offene Training-Fragen:**
- C1: Exercise-Normalisierungstiefe (OPEN)
- C2: Workout Templates in V1 (OPEN — ob zwingend?)
- C3: Minimaler Progressionskontext (DIRECTIONALLY CLEAR)

**Offene Recovery-Fragen:**
- D1: Welche Recovery Inputs wirklich Pflicht (OPEN)
- D2: Recovery Score in V1 (OPEN)

**Offene State-Fragen:**
- E1: Wie "Current State" exakt modelliert wird (DIRECTIONALLY CLEAR)
- E2: Welche Verlaufsfenster V1 unterstützt (OPEN)

**Offene Experience-Fragen:**
- F1: Wie viel UI V1 wirklich braucht (OPEN)
- F2: Daily Orientation: nur vorbereitet oder minimal sichtbar? (OPEN)

**Buddy (DELAYED BY DESIGN):** G1: Wie stark in V1 sichtbar / G2: Was "Buddy-ready" technisch bedeutet

**Alle Nicht-V1 Layer (DELAYED BY DESIGN):** Supplements, Medical, Recommendation Core, Memory, Buddy Core, Coach Layer, Voice, Vision, Wearables, Marketplace

**Kernregel:** Unklarheit ist erlaubt. Versteckte Unklarheit ist nicht erlaubt.

---

## 21 — Master Index

**Empfohlene Lesereihenfolge:**

Phase 1 (Strategische Klarheit): 01 → 02 → 03 → 12
Phase 2 (Produkt- und Nutzerlogik): 05 → 06 → 07 → 08 → 09 → 10 → 11
Phase 3 (Systemische Klarheit): 13 → 14 → 15
Phase 4 (Delivery & Umsetzung): 16 → 17 → 18 → 19 → 20
Phase 5 (Orientierung): 21

**Für V1 Umsetzung:** 07, 15, 16, 17, 18, 19, 20
**Für Agenten/Claude:** 07, 10, 13, 14, 15, 16, 17, 18, 19, 20
**Für Specs/PRDs/WOs:** 08, 10, 13, 14, 15, 16, 17, 19, 20

**Wichtigste Schlussregel:** Ab jetzt soll keine größere Produkt- oder Systemarbeit mehr "frei aus dem Kopf" passieren. Jede Arbeit referenziert mindestens: einen Workstream, einen Contract, eine Core Journey, eine offene Frage, einen Scope-Bereich, oder ein Abnahmekriterium.
