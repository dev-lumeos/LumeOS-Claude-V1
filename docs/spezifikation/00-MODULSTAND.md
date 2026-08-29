# Modulstand — was jedes Modul hat, was gebaut ist

**Erhoben 2026-08-28.** `[read]` **Zweck: das nicht taeglich neu
recherchieren muessen.** Ergaenzt `00-QUELLEN.md`, die sagt *was zu
lesen ist*; diese Datei sagt *wie der Stand ist*.

---

## Vorweg: es gibt zwei Mockup-Bestaende

`[cmd]` **Der massgebliche:**
`docs/spezifikation/10-plattform/design-system/theme-v1/` —
**53 `.jsx`-Dateien, 1.801 KB.** `[read]` **Sie tragen `Ref:`-Zeilen
auf konkrete Spec-Paragraphen** und sind die Zielgestalt.

`[cmd]` **Der zweite:** `apps/web/public/mockup/features/` —
**94 `.js`-Dateien.** `[read]` **Gemischt:** Nutrition und Training
sind daraus neu gebaut (`NEW`, `REBUILD`, `DEEP REBUILD`),
**Supplements, Medical und Goals sind 1:1-Spiegel des alten Repos**
mit hartkodierten Beispieldaten. **Fuer diese drei ist er nicht die
Zielgestalt.**

`[read]` **Am 28.08. habe ich drei Stunden im zweiten Bestand
gesucht** und Befunde gemeldet, die keine waren. **`00-QUELLEN.md`
haette es gesagt — sie nennt seit dem 20.08. die `.jsx`-Dateien.**

---

## Supplements

**Mockup — 226 KB in vier Dateien:**

    module-supplements.jsx          1.606 Z  6 Reiter: Today · Stack ·
                                             Database · Compliance ·
                                             Interactions · Cost
    module-supplements-spec.jsx     1.082 Z  Evidence S–F, vereinter
                                             Katalog, Stacks, Intake,
                                             Intelligence, Inventory
    module-supplements-modals.jsx     704 Z  Modale, Kalender,
                                             Interaktionen erweitert
    module-supplements-injection.jsx  524 Z  Injektionsplaner:
                                             Rotation, Volumengrenzen

**Spec** — `docs/specs/Supplements/`, 13 Dateien, SPEC_01–10 plus
`SCHEMA_NEUAUFBAU.md` und `Injection Planner – Spec Change Request`.
**43 Komponenten in 8 Gruppen, 18 Hooks, 2 Stores.**

**Gebaut** — `v2/supplements/`, 24 Dateien:
`tabs.tsx` 55 KB · `substanz-tafel.tsx` 44 KB · `supplements.css`
44 KB · `modale.tsx` 40 KB · `tab-injektionen.tsx` 27 KB

**Daten:** `entity_transporters` 4.617 · `entity_cyp` 3.001 ·
`supplement_field_sources` 2.815 · `supplement_aliases` 2.755 ·
`supplement_faq` 1.970 · `intake_logs` 744 · `supplements` 596
(412 sichtbar)

---

## Medical

**Mockup — 174 KB in vier Dateien:**

    module-medical.jsx        810 Z  6 Reiter: Overview · Labs ·
                                     Medications · History · Documents ·
                                     Appointments
    module-medical-v2.jsx     819 Z  5 Spec-Reiter: Dashboard ·
                                     Biomarkers · Import · Tracking ·
                                     Insights
    module-medical-data.jsx   299 Z  Dual-Range, 6 Flags, 5
                                     Systemscores, OCR, Symptome,
                                     Korrelation, Arzt-Export
    module-medical-modals.jsx 454 Z  Biomarker-Detail, Symptom,
                                     Medikament, OCR-Pruefung, Export

`[read]` **Zwei Reiterschnitte nebeneinander** — die alte
Sechserteilung und die Spec-Fuenferteilung. **Welche gilt, ist eine
Frage.**

**Spec** — 11 Dateien, SPEC_01–10 plus `SPEC_05_BIOMARKER_CATALOG`.
**34 Komponenten in 5 Gruppen, 16 Hooks.**

**Gebaut** — `v2/medical/`, 19 Dateien: `modale.tsx` 48 KB ·
`tab-tracking.tsx` 46 KB · `daten.ts` 39 KB · `medical.css` 24 KB

**Daten:** `biomarker_catalog` 11.676 · `medication_faq` 2.313 ·
`biomarker_reference_ranges` 566 · `medication_active_substances` 498
· `medication_products` 448

---

## Goals

**Mockup — 134 KB in drei Dateien:**

    module-goals.jsx         904 Z  Goals · Timeline · Body Metrics ·
                                    Measurements · Composition
    module-goals-pro.jsx     906 Z  Phase State Machine, Adaptive TDEE,
                                    Cross-Module Contributions,
                                    Bottleneck, Achievement Probability,
                                    Ratios, IFBB Poses, Weekly Report
    module-goals-editor.jsx  570 Z  Phase-Editor: Parameter, Guards,
                                    Zyklus

**Spec** — 10 Dateien, darunter `PHASE_MODELS.md`, `SCORING.md`,
`OPEN_ITEMS.md`. **38 Komponenten in 6 Gruppen, 18 Hooks.**

**Gebaut** — `v2/goals/`, 20 Dateien: `phase-editor.tsx` 45 KB ·
`tab-phase.tsx` 36 KB · `modale.tsx` 23 KB · `daten.ts` 20 KB

**Daten:** `body_measurements` 362 · `body_circumferences` 54 ·
`goal_milestones` 13 · `user_goals` 11 · `goal_phases` 5

`[read]` **`module-goals-pro.jsx` traegt Rechenwerke** — Phasenmodelle
nach `PHASE_MODELS.md`. **Wer nur `module-goals.jsx` liest, findet sie
nicht.**

---

## Recovery

**Mockup — 156 KB in fuenf Dateien:**

    module-recovery-v2.jsx      900 Z  Today · Check-in · Muscle map ·
                                       HRV · Sleep · Modalities ·
                                       Overtraining · Protokolle
    module-recovery-modals.jsx  568 Z
    module-recovery.jsx         546 Z
    module-recovery-engine.jsx  395 Z  3 Score-Modi, 18-Muskel-Karte,
                                       HRV PPG, Uebertrainingssignale
    module-recovery-modals2.jsx 267 Z

**Spec** — 11 Dateien. **39 Komponenten in 9 Gruppen, 16 Hooks.**

**Gebaut** — `v2/recovery/`, 21 Dateien: `motor.ts` 34 KB ·
`tab-protokolle.tsx` 29 KB · `modale.tsx` 28 KB ·
`tab-messwerte.tsx` 22 KB

**Daten:** `checkins` 370 · `scores` 370 · `modality_log` 178

`[read]` **Deckt sich am besten von allen Modulen** — Namen anders,
Struktur gleich. `[cmd]` `module-recovery-engine.jsx` traegt
`MODALITY_BONUS` (elf Modalitaeten) und `OVERTRAINING_SIGNALS` (vier
Schwellen); **mehrere offene Punkte fuehren diese Werte als
*unbelegt*.**

---

## Coach — zwei Seiten derselben Sache

**Tom, 2026-08-28:** *,,coach hat eine subnav mit human coach
(verbindung zu seinen coaches welche mit der coachingplattform
arbeiten) und AI coach"* — und *,,wir werden am ende eine komplette
coachingplattform haben und der spiegel als pendant dazu im user
Human coach"*.

**Mockup Human Coach — 238 KB in acht Dateien:**

    module-coach.jsx                 971 Z  Athlet- und Portalsicht
                                            mit Rollenwechsel
    module-coach-extras.jsx          753 Z  Analytics, Rule Builder,
                                            Autonomie, Adherence,
                                            Rollen, Audit Log
    module-coach-athlete.jsx         566 Z  Rechtemodell, Consent-Log,
                                            Proposals, Autonomie aus
                                            Klientensicht
    module-coach-gaps.jsx            456 Z
    module-coach-portal-v2.jsx       388 Z  Klienten-Dashboard,
                                            10 Regelvorlagen, Risiko
    module-coach-portal-workflows.jsx 315 Z Gefuehrte Ablaeufe
    module-coach-programs.jsx        205 Z  Program Builder
    module-coach-meta.jsx            201 Z  Beziehungsdaten, Bewertung

`[read]` **Diese Dateien tragen `Ref:`-Zeilen auf HumanCoach SPEC_01
§2–3, SPEC_02, SPEC_05, SPEC_09, SPEC_11** — sie sind gegen die Spec
gebaut, nicht daneben.

**Gebaut — zwei Orte fuer zwei Nutzergruppen:**

    v2/coach/human          DIE ARBEITSFLAECHE
                            http://127.0.0.1:3200/v2/coach/human
                            10 Reiter: Overview · Coaches ·
                            Permissions · Proposals · Autonomy ·
                            Check-ins · Messages · Notes · Invites ·
                            Onboarding
                            Was der Athlet von seinen Coaches sieht.

    apps/coach              Die Coachingplattform, Port 3220,
                            22 Dateien. Fuer die Coaches selbst,
                            nicht fuer den Athleten.

`[read]` **Tom, 2026-08-28:** *,,wir arbeiten in v2"*. **UI-Auftraege
gehen nach `apps/web/src/app/v2/`**, nicht nach `apps/coach` —
letzteres ist eine eigene Anwendung fuer eine andere Nutzergruppe.

**Daten (`coach`-Schema):** `relationships` 6 · `client_permissions` 5
· `client_autonomy` 5 · `checkins` 6 · `messages` 6 · `alerts` 6 ·
`pending_actions` 3 · **drei Aenderungsprotokolle mit je 7–8 Zeilen**

`[read]` **Die Protokolle sind Punkt 4 aus `SICHERHEIT.md`** —
Rechte-, Autonomie- und Beziehungsaenderungen werden bereits
nachvollziehbar gefuehrt.

`[cmd]` **Elf Attrappen-Vorkommen in fuenf Dateien** — die rechten
Kacheln (Coaching balance, Trust circle, Coach activity) und *,,Latest
from your coaches"*. **Die Reiter selbst sind angebunden.**

---

## Buddy und AI Coach

**Tom, 2026-08-28:** *,,buddy ist der ueberbegriff, am ende wird buddy
eine app fuer ios und android sein und nur dein sprechender freund
sein wird der alles weiss. ai coach ist die abbildung von buddy in der
webplattform"*.

**Mockup — 108 KB in vier Dateien:**

    module-buddy-engines.jsx    848 Z  Motorenoberflaechen,
                                       Feature-Gate, Tiers, Cron,
                                       Safety
    module-buddy.jsx            415 Z  Chat, 5-Zustands-Avatar,
                                       Insights, Memory, Decisions
    module-buddy-knowledge.jsx  280 Z  RAG, Regelmaschine, AI Clone,
                                       Gym Finder
    module-buddy-voice.jsx      207 Z  Sprache, Live-Workout-Automat

**Spec** — `docs/specs/BuddyandAICoach/`, 12 Dateien inkl.
`SPEC_05_ENGINES.md` und `SPEC_11_UI_DESIGN.md`. **46 Komponenten.**

**Gebaut** — `v2/coach/ai/`: `tab-motoren.tsx` 53 KB ·
`tab-wissen.tsx` 30 KB · `daten.ts` 26 KB · `tab-stimme.tsx` 21 KB ·
`ansicht.tsx` 25 KB

`[read]` **`apps/buddy` wird die mobile App** — nicht eine weitere
Weboberflaeche.

---

## Attrappenzahlen: Quelltext gegen Bildschirm

`[cmd]` **Nachgetragen 2026-08-28 (A-59):** in `v2/supplements/`
stehen **89 Attrappenmarken im Quelltext, auf dem Schirm sind es 24.**

`[read]` **Grund ist das Rueckfallmuster** `daten ? <Echt /> :
<Attrappe />` — **die Marke steht fuer den Fall, dass nichts laedt.**

`[read]` **Die Zahl *,,elf Attrappen-Vorkommen in fuenf Dateien"* fuer
`v2/coach` weiter oben ist eine Quelltextzaehlung** und
ueberschaetzt damit vermutlich. `[cmd]` **`tools/schuss.mjs` zaehlt
am gerenderten Bildschirm und ist die belastbare Quelle.**

## Was daraus folgt

`[read]` **Kein Modul ist leer, und keines ist fertig.** Die Datenseite
traegt ueberall; die Oberflaeche ist ueberall angelegt und an
verschiedenen Stellen Attrappe.

## Berichtigung 2026-08-28: v2 ist die Wahrheit, nicht der Mockup

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben. ssot findest selber im code, also ist theme-v1 nur
noch eine ideen struktur falls uns in v2 was fehlt."*

`[read]` **Der gebaute `/v2/`-Stand ist der Massstab.** `theme-v1` ist
die Ableitungsquelle — **eine Ideensammlung fuer den Fall, dass in v2
etwas fehlt, kein Sollzustand.**

`[read]` **Diese Datei sagte bis eben das Gegenteil** (*,,den Mockup
gegen den gebauten Stand halten"*). `[cmd]` **Und in G-249 hat genau
das Schaden angerichtet:** ich liess eine zweite Ansicht neben eine
bestehende bauen, **weil ich den Entwurf fuer den Massstab hielt.**

    richtig   Miss den gebauten /v2/-Stand. Was er kann, ist der
              Stand. theme-v1 nachschlagen, wenn etwas fehlt und die
              Frage ist, wie es gemeint war.

## Zwei Routenbaeume, beide gewollt

`[cmd]` **Gemessen 2026-08-28:**

    /v2/nutrition · /v2/training · /v2/goals · /v2/medical
    /v2/recovery · /v2/supplements · /v2/coach/ai · /v2/coach/human
    /v2/dashboard · /v2/settings

    /nutrition · /nutrition/foods · /nutrition/preferences
    /training · /goals · /medical · /recovery · /supplements
    /coach · /dashboard · /settings

**Tom, 2026-08-28:** *,,da laeuft ein anderes template und das soll
bleiben"*.

`[read]` **Der Baum ohne `/v2/` traegt ein eigenes Template** —
andere Schale, Boundary-Karten (*BLS-only*, *Candidate*,
*Blockiert*), *,,TABS LAUT SPEC"*, *,,READ-ONLY MOCK"*. **Er ist
nicht tot und wird nicht angefasst.**

`[read]` **Fuer Auftraege heisst das: `/v2/` ist der Arbeitsort, der
alte Baum bleibt unberuehrt.**
