# PLANE Initial Items Seed
> Konvertiert aus PLANE_INITIAL_ITEMS_SEED.md.rtf
> Die ersten 12 Plane-Items für den LumeOS-Rebuild

**Zweck:** Sofort in Plane anlegbare Items, damit das System operativ nutzbar ist.

**Startwerte für alle 12 Items:**
- State: `OPEN`
- artifact_level: `decision`
- artifact_status: `draft`
- build_readiness: `not_buildable`
- decision_state: `open`
- source_of_truth_doc: `22_V1_DECISION_SHEET.md`

---

## Die 12 Start-Decision-Items

| # | Titel | Workstream | Blockiert |
|---|---|---|---|
| 01 | Finaler Auth-Ansatz | A_identity_user | User Foundation PRD, Goal-Bindung |
| 02 | Minimaler User Profile Scope | A_identity_user | Profile PRD, Onboarding Foundation |
| 03 | Minimaler Goal Model Scope | A_identity_user | Goal PRD/Spec, User Foundation |
| 04 | Food Search V1 Standard | B_nutrition_data | Nutrition Search PRD, Logging UX |
| 05 | Portion Scope V1 | C_nutrition_logging | Portion Spec, Logging Flow |
| 06 | Saved Meals V1 oder später | C_nutrition_logging | Nutrition Logging PRD, Meal Design |
| 07 | Exercise Normalization Depth | D_training | Training Foundation PRD, Exercise Spec |
| 08 | Workout Templates in V1 | D_training | Training PRD, Session Flow Scope |
| 09 | Minimaler Recovery Check-in | E_recovery | Recovery PRD, Check-in UX |
| 10 | Recovery Score ja oder nein | E_recovery | Recovery UX, Output-Typen |
| 11 | Current State Definition | F_state_access | State Access PRD, Buddy Readiness |
| 12 | Basic V1 Experience Level | G_v1_experience | V1 Experience PRD, Screen-Priorisierung |

---

## Beschreibungen

**01 — Finaler Auth-Ansatz**
Definiert den finalen V1-Ansatz für Login, Registrierung, Session-Grundlage und OAuth. Ohne klare Auth-Basis sind User-Zuordnung, Sessions, Goal-Bindung und spätere State-Logik instabil.

**02 — Minimaler User Profile Scope**
Welche Profilfelder sind Pflicht / optional / nicht V1? Zu groß = Scope-Aufblähung. Zu klein = schwache Personalisierung.

**03 — Minimaler Goal Model Scope**
Wie minimal oder strukturiert soll Goal-Logik in V1 sein? Goals sind Kernanker für spätere Orientierung, State-Logik und Buddy-Kontext.

**04 — Food Search V1 Standard**
Wie gut muss Food Search funktionieren? Suchqualität, Alias-/Synonymtiefe, Sucherwartung. Wenn Search schwach ist, ist Nutrition Logging praktisch unbrauchbar.

**05 — Portion Scope V1**
Welche Portionslogik ist Pflicht? Wie grammgenau vs alltagstauglich? Ohne gute Portionen ist selbst eine gute Food-Datenbasis im Alltag kaum nutzbar.

**06 — Saved Meals V1 oder später**
Sind wiederverwendbare Meals V1 Pflicht oder V1.1? Saved Meals sind alltagsrelevant, erhöhen aber Datenmodell-, UX- und Logging-Komplexität.

**07 — Exercise Normalization Depth**
Wie tief müssen Übungen in V1 strukturell normalisiert werden? Canonical Exercises, Varianten, Alias-Handling.

**08 — Workout Templates in V1**
Templates V1 oder erst Session/Set-Logging? Templates sind praktisch, erhöhen aber Scope erheblich.

**09 — Minimaler Recovery Check-in**
Wie kurz, niedrigschwellig und gleichzeitig sinnvoll soll Daily Check-in sein? Zu schwer = keine Nutzung. Zu dünn = wenig Wert.

**10 — Recovery Score ja oder nein**
Braucht V1 bereits einen Recovery Score? Scores erzeugen Pseudo-Präzision, Erklärungsbedarf und Modellierungslast.

**11 — Current State Definition**
Was gilt in V1 als "aktueller Zustand" und wie werden aktuelle Inputs logisch zusammengeführt? Blockierend für Timeline, Daily Orientation, Buddy Readiness.

**12 — Basic V1 Experience Level**
Wie produktnah soll die erste Experience sein und was ist bewusst noch nicht dabei?

---

## Priorisierte Startreihenfolge

**Phase 1 — Morgen direkt starten:**
1. Finaler Auth-Ansatz
2. Minimaler User Profile Scope
3. Minimaler Goal Model Scope

**Phase 2:**
4. Food Search V1 Standard
5. Portion Scope V1
6. Saved Meals V1 oder später

**Phase 3:**
7. Exercise Normalization Depth
8. Workout Templates in V1

**Phase 4:**
9. Minimaler Recovery Check-in
10. Recovery Score ja oder nein

**Phase 5:**
11. Current State Definition
12. Basic V1 Experience Level

---

**Wichtigste Arbeitsregel:** Erst sauber entscheiden. Dann erst PRD / Spec / WO. Nicht umgekehrt.

**Schlussregel:** Wenn Unsicherheit entsteht womit begonnen werden soll — immer zuerst Identity / User / Goal. Nicht irgendwo anders anfangen.
