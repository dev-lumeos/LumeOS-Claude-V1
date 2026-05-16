# Lumeos Plattform — Komplette Architektur

**Version:** 1.0 — 17. Februar 2026
**Status:** Strategische Zielarchitektur

---

## Plattform-Übersicht

```
LUMEOS PLATFORM
│
├── 🍎 ERNÄHRUNG (Nutrition Module)
├── 🏋️ TRAINING (Training Module)
├── 💊 SUPPLEMENTS (Supplement Module)
│   └── 💉 Enhanced Mode (Opt-in, Privacy-First)
├── 🏥 MEDIZIN (Medical Module)
├── 😴 RECOVERY (Recovery Module)
├── 🎯 ZIELE (Goals Module)
├── 🤖 KI-COACH (AI Coach Module)
├── 👨‍🏫 COACH (Coach Module)
├── 🛒 MARKTPLATZ (Marketplace Module)
├── 🏢 B2B (B2B Module)
│
├── ⚡ CROSS-MODUL INTELLIGENCE LAYER
├── 🔒 DATENSCHUTZ & SICHERHEIT
└── ⚙️ TECH STACK & INFRASTRUKTUR
```

---

## 🍎 ERNÄHRUNG (Nutrition Module)

```
ERNÄHRUNG
│
├── 📝 Food-Logging
│   ├── Manuelle Suche (Meilisearch, <50ms, Typo-tolerant)
│   ├── Barcode-Scanner (KOSTENLOS, nicht hinter Paywall!)
│   │   └── Lookup: Lumeos Food-DB (BLS-Basis) → Open Food Facts → Manuell
│   ├── KI-Foto-Scan (Mahlzeit fotografieren → Erkennung)
│   │   └── GPT-4o-mini Vision, ~0,01$/Scan
│   ├── Spracheingabe ("200g Hähnchenbrust mit Reis")
│   ├── Quick-Add (Makros direkt eingeben, ohne Lebensmittel)
│   ├── Favoriten & Häufig verwendet
│   ├── Letzte Mahlzeiten ("Wie gestern" One-Tap)
│   ├── Copy Meal (Mahlzeit auf anderen Tag kopieren)
│   └── Multi-Serving (Portionsgrößen anpassen)
│
├── 🥗 Mahlzeiten-Struktur
│   ├── Frühstück / Mittagessen / Abendessen / Snacks
│   ├── Custom Mahlzeiten-Slots (z.B. Pre-Workout, Post-Workout)
│   ├── Mahlzeiten-Vorlagen (Meal Templates)
│   └── Mahlzeiten-Timing (Zeitstempel pro Mahlzeit)
│
├── 📊 Nährstoff-Dashboard
│   ├── Makro-Tracking
│   │   ├── Kalorien (Tages- + Wochen-Ansicht)
│   │   ├── Protein (g + % Ziel)
│   │   ├── Kohlenhydrate (g + % Ziel)
│   │   ├── Fett (g + % Ziel)
│   │   └── Ballaststoffe
│   │
│   ├── Mikronährstoff-Tracking (LUMEOS USP!)
│   │   ├── Stufe 1 — Immer sichtbar (15 Nährstoffe)
│   │   │   └── Vitamin A, C, D, E, K, B12, Folat, Eisen,
│   │   │       Calcium, Magnesium, Zink, Kalium, Natrium,
│   │   │       Omega-3, Selen
│   │   ├── Stufe 2 — Athleten-Modus (20 weitere)
│   │   │   └── B-Komplex komplett, Kupfer, Mangan, Chrom,
│   │   │       Molybdän, Jod, Phosphor, etc.
│   │   └── Stufe 3 — Medizinischer Modus (49+ weitere)
│   │       └── Aminosäuren, Fettsäure-Profile, Phytonährstoffe,
│   │           Cholesterin, Transfette, Zucker-Aufschlüsselung
│   │
│   ├── Wasser-Tracking
│   │   ├── Tages-Ziel (auto oder manuell)
│   │   ├── Quick-Add Buttons (250ml, 500ml)
│   │   └── Erinnerungen
│   │
│   └── Nährstoff-Trends
│       ├── 7 / 30 / 90 Tage Durchschnitte
│       ├── Makro-Verteilung über Zeit
│       └── Mikronährstoff-Abdeckung (% RDA)
│
├── 🍽️ Rezepte & Essenspläne
│   ├── Rezept-Erstellung (Zutaten → Auto-Nährwerte)
│   ├── Rezept-Import (URL → Parsing)
│   ├── Rezept-Bibliothek (Community + Kuratiert)
│   ├── KI-Essensplan-Generator
│   │   ├── Basierend auf: Ziel, Präferenzen, Budget, Allergien
│   │   ├── Wöchentliche Essenspläne
│   │   └── Einkaufsliste (auto-generiert)
│   └── Diät-Modi (Keto, Vegan, Mediterranean, IF, Custom)
│
├── ⏰ Intervallfasten (IF)
│   ├── Fasten-Timer (16:8, 20:4, OMAD, Custom)
│   ├── Fasten-Historie
│   └── Statistiken (durchschnittliche Fastendauer)
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → TRAINING: Kalorien-Auto-Anpassung basierend auf Workout
│   │   └── "Leg Day: +400 kcal, +30g Protein empfohlen"
│   ├── → SUPPLEMENTS: Mikronährstoff-Lückenanalyse
│   │   └── "Dir fehlen 4.000 IE Vitamin D laut Food-Log"
│   ├── → MEDIZIN: Defizit-Warnungen aus Blutwerten
│   │   └── "Ferritin niedrig → eisenreiche Lebensmittel vorschlagen"
│   ├── → RECOVERY: Ernährungs-Timing für Schlaf
│   │   └── "Schlechter Schlaf → Magnesium + Tryptophan abends"
│   ├── → ZIELE: Kalorien-Budget aus adaptivem TDEE
│   │   └── "Lean Bulk Phase: 2.800 kcal, 180g Protein"
│   └── → KI-COACH: Ernährungsberatung mit echten Daten
│       └── "Du hast gestern nur 90g Protein geschafft — heute 160g anpeilen"
│
├── 🗄️ Food-Datenbank (Eigene Lumeos Food-DB, BLS 4.0 Basis)
│   ├── Basis: BLS 4.0 (7.140 Lebensmittel, 138 Nährstoffe, CC BY 4.0, Lab-Grade)
│   ├── Anreicherung: USDA Foundation, Fineli, CIQUAL, CoFID, Swiss NWD
│   ├── Barcode-Mapping: Open Food Facts (EAN→Food, NICHT als Nährstoff-Quelle)
│   └── Community: Lumeos Community DB (User-generiert, moderiert)
│
└── 💰 Monetarisierung
    ├── Free: Unbegrenztes Logging, Barcode, Makros, Wasser, Basis-Rezepte
    ├── Plus (9,99$/Mo): KI-Foto, Mikros Stufe 2, Essenspläne, IF, Ad-free
    └── Pro (19,99$/Mo): Volle 138 Nährstoffe (BLS 4.0), Bloodwork-Integration, API-Export
```

---

## 🏋️ TRAINING (Training Module)

```
TRAINING
│
├── 📝 Workout-Logging
│   ├── Set-Logging (Gewicht × Wiederholungen × ✅)
│   │   ├── Speed-First UX (<3 Sekunden pro Satz)
│   │   ├── Vorherige Leistung vorausgefüllt
│   │   ├── +/- Buttons für Gewicht (kein Tippen nötig)
│   │   └── Swipe to Complete
│   ├── RPE/RIR Tracking (optional, aktivierbar)
│   ├── Rest-Timer (Auto + Custom pro Übung)
│   ├── Superset / Giant Set / Circuit Support
│   ├── Drop-Sets, Cluster-Sets, Myo-Reps
│   ├── Notizen pro Satz / pro Übung
│   ├── Warm-Up Sets (markierbar, nicht im Volumen)
│   └── Workout-Dauer (Auto-Timer)
│
├── 🏋️ Übungsdatenbank
│   ├── 800+ Übungen (free-exercise-db, Public Domain)
│   ├── SVG Muskelmaps (wger.de, AGPL)
│   ├── Bilder (Start + End Position)
│   ├── Videos (Phase 2: Wrkout.xyz oder eigene)
│   ├── 3D-Modelle (Phase 3: Three.js)
│   ├── Übungs-Anleitungen (Text + Cues)
│   ├── Häufige Fehler pro Übung
│   ├── Custom Übungen (User-erstellt)
│   ├── Muskelgruppen-Zuordnung (primär + sekundär)
│   └── Equipment-Filter (Langhantel, Kurzhantel, Kabel, Maschine, Bodyweight)
│
├── 📋 Routinen & Programme
│   ├── Routine Builder (unbegrenzt, KOSTENLOS!)
│   │   └── vs. Strong: 3-Routinen-Limit = #1 Kritikpunkt
│   ├── Drag & Drop Übungsreihenfolge
│   ├── Workout-Vorlagen (Template Library)
│   ├── Periodisierungs-Support (Phasen, Deload-Wochen)
│   ├── Programme aus Marktplatz laden
│   └── Coach-zugewiesene Programme
│
├── 🤖 KI-Workout-Engine (Plus)
│   ├── KI-Workout-Generator
│   │   ├── Basierend auf: Ziel, Equipment, Zeit, Erfahrung
│   │   ├── Muskel-Recovery-Map berücksichtigt
│   │   └── Lernt aus deinem Feedback
│   ├── Exercise Evaluation Scores (LUMEOS USP!)
│   │   ├── 0-100 Effektivitätsbewertung pro Übung pro Ziel
│   │   ├── Basierend auf: Stimulus-to-Fatigue Ratio, Mechanical Tension, Stretch Position
│   │   └── "Lat Pulldown: 92/100 für Lat-Hypertrophie"
│   ├── Feedback-Loop (LUMEOS USP!)
│   │   ├── Post-Workout: Pump (1-3) + Muskelkater (1-3) pro Muskelgruppe
│   │   ├── 10 Sekunden Input → personalisierte Volumen-Landmarks
│   │   └── System lernt DEINE Recovery-Kapazität
│   └── Intelligente Empfehlungen
│       ├── "Chest bei 95% Recovery → Push Day ideal"
│       └── "Volumen diese Woche über MAV → Deload empfohlen"
│
├── 📈 Progressive Overload Engine (Pro)
│   ├── Modelle
│   │   ├── Linear (Anfänger: jede Session Gewicht erhöhen)
│   │   ├── Double Progression (Rep-Range-Top → Gewicht erhöhen)
│   │   ├── Wellenbelastung (3 Wochen hoch, 1 Deload)
│   │   ├── DUP — Daily Undulating Periodization (Schwer/Mittel/Leicht)
│   │   └── RPE-basiert (Auto-Regulation nach Tagesform)
│   └── Volumen-Landmarks pro Muskelgruppe (LUMEOS USP!)
│       ├── MV  — Maintenance Volume (Erhaltung)
│       ├── MEV — Minimum Effective Volume (Minimum für Wachstum)
│       ├── MAV — Maximum Adaptive Volume (Optimaler Bereich)
│       ├── MRV — Maximum Recoverable Volume (Obergrenze)
│       └── Personalisiert durch Feedback-Loop
│
├── 🏅 Fortschritt & PRs
│   ├── Personal Records Detection 🎉 (automatisch)
│   │   ├── Gewichts-PR, Wiederholungs-PR, Volumen-PR, geschätzter 1RM-PR
│   │   └── Celebration Animation + Push Notification
│   ├── Progress Charts
│   │   ├── Gewicht über Zeit (pro Übung)
│   │   ├── Volumen über Zeit (pro Muskelgruppe)
│   │   ├── Geschätzter 1RM Trend
│   │   └── Trainingsfrequenz Kalender
│   ├── Muskelgruppen-Balance
│   │   ├── Volumen-Verteilung (Push vs. Pull vs. Legs)
│   │   ├── Schwachstellen-Erkennung
│   │   └── Empfehlungen zur Balance
│   └── Workout-Historie + Kalender
│
├── 👥 Social Features
│   ├── Workout teilen (Feed)
│   ├── PR-Celebration teilen
│   ├── Freunde herausfordern
│   ├── Leaderboards (optional)
│   └── Community Workout Templates
│
├── ⌚ Wearable Integration
│   ├── Apple Watch Companion (Set-Logging am Handgelenk)
│   ├── Wear OS Support
│   └── Herzfrequenz-Tracking während Workout
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → ERNÄHRUNG: Kalorien-Auto-Anpassung nach Workout-Typ
│   ├── → RECOVERY: Trainingsvolumen → Muskel-Recovery-Berechnung
│   ├── → SUPPLEMENTS: Workout-Typ → Pre/Post/Intra Stack
│   ├── → ZIELE: Phase → Volumen-Planung (Cut = weniger Volumen)
│   ├── → MEDIZIN: CRP erhöht → Trainingsvolumen-Warnung
│   └── → KI-COACH: Trainings-Analyse + Periodisierungs-Empfehlung
│
├── 🗄️ Datenquellen
│   ├── free-exercise-db (800+ Übungen, Public Domain, GRATIS)
│   ├── wger.de SVG Muskelmaps (AGPL, GRATIS)
│   └── MVP-Kosten: 0$
│
└── 💰 Monetarisierung
    ├── Free: Unbegrenzte Routinen, Set-Logging, Übungs-DB, Charts, PRs, Timer
    ├── Plus (9,99$/Mo): KI-Workouts, Recovery Map, Exercise Scores, Feedback-Loop
    └── Pro (19,99$/Mo): Volumen-Landmarks, 3D-Modelle, Formcheck, Custom Overload
```

---

## 💊 SUPPLEMENTS (Supplement Module)

```
SUPPLEMENTS
│
├── 📦 Stack-Manager
│   ├── Supplements hinzufügen (Suche + manuell + Barcode)
│   │   ├── NIH DSLD Datenbank (100.000+ Labels)
│   │   ├── Open Food Facts (Supplement-Produkte)
│   │   └── Lumeos Community DB
│   ├── Stack gruppiert nach Ziel (Gym, Sleep, Focus, Longevity)
│   ├── Dosierung pro Supplement
│   ├── Einnahme-Form (Kapsel, Pulver, Tropfen, Injektion)
│   ├── Marke + Produkt (optional)
│   └── Kosten pro Supplement (monatliche Übersicht)
│
├── ⏰ Timing & Erinnerungen
│   ├── Smart Timing Optimizer (LUMEOS USP!)
│   │   ├── Basierend auf: Mahlzeiten, Training, Wechselwirkungen
│   │   ├── "Vitamin D → Mittagessen (Fett nötig für Absorption)"
│   │   ├── "Eisen → morgens nüchtern (Dairy blockiert Absorption)"
│   │   └── "Calcium + Eisen → 2h Abstand!"
│   ├── Push-Erinnerungen (individuell pro Supplement)
│   ├── Apple Watch Complications
│   ├── Widget (Tagesübersicht)
│   └── Einnahme-Log (Genommen / Übersprungen / Vergessen)
│
├── 🔬 Intelligence Engine (LUMEOS USP!)
│   ├── Ernährungs-Lückenanalyse
│   │   ├── Food-Log → Mikronährstoff-Summen → RDA-Vergleich
│   │   └── "Dir fehlen 4.000 IE Vitamin D (nur 600 IE aus Food)"
│   ├── Redundanz-Erkennung
│   │   ├── Inhaltsstoff-Überlappung über alle Supplements
│   │   └── "3 Supplements enthalten Magnesium → 225% RDA → 1 reicht"
│   ├── Trainingsbasierte Stacks
│   │   ├── "Heavy Leg Day → Pre: Kreatin + Beta-Alanin + Koffein"
│   │   ├── "Post: Whey + Magnesium"
│   │   └── "Rest Day: Pre-Workout überspringen"
│   ├── Kosten-Optimierung
│   │   ├── Monatliche Supplement-Kosten berechnen
│   │   └── "Durch Redundanz-Entfernung: 87$ → 67$ → spare 20$/Mo"
│   └── Wirksamkeits-Tracking (via Medical Module)
│       ├── "Vitamin D seit 3 Monaten → Blutwert: 18 → 52 ng/mL ✅"
│       └── "Magnesium seit 6 Wochen → keine Veränderung ❌ → Form wechseln?"
│
├── ⚠️ Wechselwirkungs-Checker
│   ├── Supplement × Supplement
│   ├── Supplement × Medikament
│   ├── Supplement × Lebensmittel
│   ├── Schweregrade: Info | Warnung | Kritisch
│   │   ├── Info: "Vitamin C + Eisen = zusammen nehmen (verbessert Absorption)"
│   │   ├── Warnung: "Calcium + Eisen = 2h Abstand"
│   │   └── Kritisch: "Johanniskraut + SSRIs = VERMEIDEN (Serotonin-Syndrom)"
│   └── Quellen: PubMed-Referenzen pro Wechselwirkung
│
├── 📊 Evidenz-Bewertung (LUMEOS USP!)
│   ├── Grade A: Starke Evidenz (mehrere RCTs, Meta-Analysen)
│   ├── Grade B: Moderate Evidenz (einige RCTs)
│   ├── Grade C: Limitierte Evidenz (wenige Studien)
│   ├── Grade D: Vorläufige Evidenz (Tierstudien)
│   ├── Grade F: Keine Evidenz / Widerlegt
│   └── Beispiele:
│       ├── "Kreatin Monohydrat → Kraft: Grade A ✅ Großer Effekt"
│       ├── "Glutamin → Recovery: Grade F ❌ Kein Effekt bei Gesunden"
│       └── "BCAAs → Muskelaufbau: Grade D ⚠️ Unnötig wenn Protein ausreichend"
│
├── 💉 Enhanced Mode (Opt-in, Privacy-First)
│   │
│   │   ⚠️ SEPARATES OPT-IN MODUL
│   │   🔒 100% LOKALE SPEICHERUNG (kein Cloud, kein Analytics)
│   │   ⚖️ HARM REDUCTION ANSATZ (keine Promotion)
│   │
│   ├── 🧪 Compound-Datenbank (offline, 500+ Verbindungen)
│   │   ├── AAS (Anabole Androgene Steroide)
│   │   ├── SARMs (Selektive Androgenrezeptor-Modulatoren)
│   │   ├── Peptide (BPC-157, TB-500, Ipamorelin, CJC-1295, MK-677)
│   │   ├── Wachstumshormone
│   │   ├── Aromatasehemmer (AIs)
│   │   ├── SERMs (Clomid, Nolvadex)
│   │   └── Sonstige (Clenbuterol, T3/T4, etc.)
│   │
│   ├── 📅 Zyklus-Planer
│   │   ├── Compound-Stack definieren (Dosis, Frequenz, Dauer)
│   │   ├── Zyklus-Kalender (Start → On-Cycle → PCT → Off)
│   │   ├── PCT-Planer (automatisch basierend auf Halbwertszeiten)
│   │   └── Zyklus-Templates (Beginner, Intermediate, Advanced)
│   │
│   ├── 📈 Blutspiegel-Rechner
│   │   ├── Pharmakokinetik-Modellierung (Ester-Halbwertszeiten)
│   │   ├── Steady-State Berechnung
│   │   ├── Peak + Trough Level Visualisierung
│   │   ├── → VERKNÜPFT mit Medizin: Modelliert vs. Tatsächliche Blutwerte überlagert
│   │   └── "Gemessenes Test: 1.200 ng/dL — Modell: 1.150 → gute Korrelation"
│   │
│   ├── 💉 Injektions-Tracker
│   │   ├── Injektionsstellen-Map (visueller Körper)
│   │   ├── Rotations-Empfehlung
│   │   │   └── "Linker Gluteus 3x hintereinander → rotieren!"
│   │   ├── Injektions-Log (Datum, Dosis, Stelle, Notizen)
│   │   ├── Lokale Reaktionen tracken (PIP, Rötung)
│   │   └── Rekonstitutions-Rechner (BAC Water + Peptid → Dosis pro IE)
│   │
│   ├── 🩸 Gesundheits-Monitoring
│   │   ├── Leberwerte (AST, ALT, GGT)
│   │   ├── Lipide (HDL, LDL, Triglyceride)
│   │   ├── Hormone (Testosteron, Östradiol, SHBG)
│   │   ├── Blutbild (Hämatokrit, RBC)
│   │   ├── Niere (Kreatinin, BUN)
│   │   ├── Herz (Blutdruck, CRP)
│   │   ├── Farbcodierte Ampel (Grün/Gelb/Rot)
│   │   ├── → VERKNÜPFT mit Medizin Module
│   │   └── Warnungen:
│   │       ├── "HDL unter 40 → Kardio 3x/Woche empfohlen"
│   │       ├── "Hämatokrit über 54% → SOFORT Arzt aufsuchen"
│   │       └── "AST 3x Ausgangswert → Oral absetzen erwägen"
│   │
│   └── 🔒 Privacy-Architektur
│       ├── Standard: 100% SQLite auf Gerät (kein Cloud)
│       ├── Null Telemetrie, null Analytics, null Netzwerkanfragen
│       ├── Optional: E2E-verschlüsseltes Backup (Nutzerschlüssel)
│       ├── Optional: Selektiver Export für Arzt (PDF/FHIR, zeitlich begrenzt)
│       ├── Compound-DB mit App ausgeliefert (null Server-Logs)
│       └── Lumeos kann Daten NIEMALS sehen
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → ERNÄHRUNG: Lückenanalyse aus echtem Food-Log
│   ├── → TRAINING: Trainingsbasierte Pre/Post/Intra Stacks
│   ├── → MEDIZIN: Blutwerte validieren Supplement-Wirksamkeit
│   ├── → RECOVERY: "Schlechter Schlaf → Magnesium + ZMA?"
│   ├── → ZIELE: Phase-abhängige Stacks (Bulk: Kreatin+Carbs, Cut: Koffein+L-Carnitin)
│   └── → KI-COACH: Supplement-Empfehlungen basierend auf allen Daten
│
├── 🗄️ Datenquellen
│   ├── NIH DSLD (100.000+ Supplement-Labels, gratis)
│   ├── NIH DailyMed (150.000+ Labels + Wechselwirkungen, gratis)
│   ├── USDA Dietary Reference Intakes (RDAs, gratis)
│   └── MVP-Kosten: 0$
│
└── 💰 Monetarisierung
    ├── Free: 5 Supplements, Erinnerungen, Basis-Timing
    ├── Plus (9,99$/Mo): Unbegrenzt, Lückenanalyse, Smart Timing, Wechselwirkungen
    ├── Pro (19,99$/Mo): Blutwerte-Wirksamkeit, Evidenzgrade, KI-Berater
    └── Enhanced (9,99-19,99$/Mo extra): Zyklus-Planer, Blutspiegel, Gesundheits-Monitoring
```

---

## 🏥 MEDIZIN (Medical Module)

```
MEDIZIN
│
├── 🩸 Blutwerte-Management
│   ├── PDF-OCR-Import (LUMEOS USP!)
│   │   ├── PDF/Foto hochladen → automatische Wert-Extraktion
│   │   ├── OCR: Google Document AI / AWS Textract
│   │   ├── NLP: Biomarker-Erkennung + LOINC-Code-Zuordnung
│   │   ├── Einheiten-Normalisierung (mg/dL ↔ nmol/L ↔ µg/L)
│   │   ├── Plausibilitäts-Check (Testosteron 10.000? → Warnung)
│   │   └── Validierungs-UI: "Stimmen diese Werte?"
│   ├── Manuelle Eingabe (für einzelne Werte)
│   └── Labor-Partnerschaften (Phase 2: Affiliate mit Quest, Labcorp, LetsGetChecked)
│
├── 📊 Biomarker-Engine (100+ Marker)
│   ├── Kategorien
│   │   ├── Hormone (Testosteron, Östradiol, SHBG, TSH, T3/T4, Cortisol, DHEA, IGF-1)
│   │   ├── Lipide (Gesamt-Cholesterin, HDL, LDL, Triglyceride, ApoB, Lp(a))
│   │   ├── Metabolisch (Glukose, HbA1c, Insulin, HOMA-IR)
│   │   ├── Leber (AST, ALT, GGT, Bilirubin, Albumin, ALP)
│   │   ├── Niere (Kreatinin, BUN, eGFR, Harnsäure, Cystatin C)
│   │   ├── Blutbild (Hämoglobin, Hämatokrit, RBC, WBC, Thrombozyten, MCV, Ferritin)
│   │   ├── Entzündung (CRP, hs-CRP, Homocystein, ESR)
│   │   ├── Vitamine (D, B12, Folat, B6, A, E)
│   │   ├── Mineralien (Eisen, Magnesium, Zink, Selen, Kupfer)
│   │   └── Sonstige (PSA, Vitamin-D-Metaboliten, Omega-3-Index)
│   │
│   ├── Optimale Bereiche (LUMEOS USP!)
│   │   ├── Labor-Normal vs. Optimal getrennt dargestellt
│   │   ├── Segmentiert nach: Alter, Geschlecht, Aktivitätslevel, Ziel
│   │   ├── Beispiel: Ferritin Lab-Normal: 12-300 → Optimal Athlet: 80-150
│   │   └── Quellen: Peer-reviewed Literatur, funktionelle Medizin
│   │
│   ├── Trend-Analyse
│   │   ├── Multi-Test Vergleich (Verlauf über Monate/Jahre)
│   │   ├── Trend: Steigend / Stabil / Fallend
│   │   ├── Prozentile (vs. Alters-/Geschlechtskohorte)
│   │   └── Langzeit-Charts mit Referenzbereichen
│   │
│   └── Warnungen & Empfehlungen
│       ├── Farbcodiert: Grün (optimal), Gelb (suboptimal), Rot (außerhalb)
│       ├── Kontext-Empfehlungen: "Ferritin 25 → Rotes Fleisch, Spinat, Vitamin C"
│       └── "Zeit für den nächsten Bluttest" Push (quartalsweise)
│
├── 💊 Medikamenten-Tracking
│   ├── Medikamente hinzufügen (RxNorm-Datenbank)
│   ├── Dosierung + Frequenz + Zeitplan
│   ├── Einnahme-Erinnerungen
│   ├── Medikamenten-Wechselwirkungen (OpenFDA)
│   │   ├── Medikament × Medikament
│   │   ├── Medikament × Supplement
│   │   └── Schweregrade: Info / Warnung / Kritisch
│   └── Adhärenz-Tracking (Genommen / Übersprungen)
│
├── 📝 Symptom-Tracking
│   ├── Tägliches Symptom-Log
│   │   ├── Vordefinierte Symptome (Müdigkeit, Kopfschmerz, Verdauung, etc.)
│   │   ├── Custom Symptome
│   │   ├── Schweregrad (1-5)
│   │   └── Zeitstempel
│   └── Symptom-Trends über Zeit
│
├── 🔄 Korrelations-Engine (LUMEOS USP!)
│   ├── "Was beeinflusst was?" über ALLE Module
│   ├── Biomarker × Ernährung
│   │   └── "Dein Ferritin stieg nachdem du rotes Fleisch 3x/Woche gegessen hast"
│   ├── Biomarker × Supplements
│   │   └── "Vitamin D stieg von 18 auf 52 seit Supplementierung"
│   ├── Biomarker × Training
│   │   └── "CRP steigt nach >5 Trainingstagen in Folge"
│   ├── Biomarker × Recovery
│   │   └── "Cortisol hoch + HRV niedrig → Übertraining?"
│   ├── Symptome × Ernährung
│   │   └── "Blähungen korrelieren mit Milchprodukten am Vortag"
│   └── Symptome × Supplements
│       └── "Schlafqualität verbessert seit Magnesium-Start"
│
├── 📄 Arzt-Export
│   ├── PDF-Report (Trends + Optimale Bereiche + Korrelationen)
│   ├── FHIR R4 Export (interoperabel mit Krankenhaus-Systemen)
│   └── Selektiv teilbar (pro Biomarker/Kategorie, zeitlich begrenzt)
│
├── 🔒 Datenschutz
│   ├── Standard: Lokal-First (SQLite auf Gerät)
│   ├── Optional: E2E-verschlüsselte Cloud (Nutzerschlüssel)
│   ├── Selektives Teilen mit Coach/Arzt (berechtigungsbasiert)
│   └── Audit-Log aller Zugriffe
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → ERNÄHRUNG: Defizite → Lebensmittel-Empfehlungen
│   ├── → SUPPLEMENTS: Defizite → Supplement-Empfehlungen + Wirksamkeit
│   ├── → TRAINING: Entzündungsmarker → Trainings-Warnungen
│   ├── → RECOVERY: Cortisol + HRV → Übertrainings-Erkennung
│   ├── → ENHANCED: Leberwerte + Lipide während Zyklen monitoren
│   ├── → ZIELE: "Testosteron fällt → Cut pausieren?"
│   └── → KI-COACH: Blutwert-informierte Empfehlungen
│
├── 🗄️ Datenstandards (alle gratis)
│   ├── LOINC (90.000+ Labor-Codes)
│   ├── RxNorm (100.000+ Medikamente)
│   ├── ICD-10 (70.000+ Diagnose-Codes)
│   ├── SNOMED CT (350.000+ klinische Konzepte)
│   ├── OpenFDA (Medikamenten-Wechselwirkungen)
│   └── FHIR R4 (Gesundheitsdaten-Austausch)
│
└── 💰 Monetarisierung
    ├── Free: Manuell 10 Marker, Med-Erinnerungen, Basis-Trends
    ├── Plus (9,99$/Mo): OCR-Upload (5/Mo), 50 Marker, Symptome, Korrelationen
    ├── Pro (19,99$/Mo): Unbegrenzt OCR, 100+ Marker, Optimale Bereiche, Arzt-Export
    └── Zusatz-Revenue: Labor-Partnerschaften (Affiliate), Telemedizin-Referrals
```

---

## 😴 RECOVERY (Recovery Module)

```
RECOVERY
│
├── 😴 Schlaf-Tracking
│   ├── Wearable-Import (Apple Health / Google Health Connect)
│   │   ├── Schlafdauer
│   │   ├── Schlafphasen (Leicht, Tief, REM, Wach)
│   │   ├── Einschlaf- / Aufwachzeit
│   │   ├── Schlafeffizienz (%)
│   │   └── Schlafkonsistenz (Regelmäßigkeit)
│   ├── Manuelles Schlaf-Log (Fallback)
│   ├── Schlaf-Score (0-100)
│   ├── Schlaf-Trends (7/30/90 Tage)
│   └── Schlaf-Tipps basierend auf Daten
│
├── ❤️ HRV & Readiness
│   ├── Handy-Kamera HRV (LUMEOS USP!)
│   │   ├── PPG-Signal über Fingerauflage auf Kamera (60 Sekunden)
│   │   ├── R-R Intervall-Erkennung → RMSSD Berechnung
│   │   ├── Validiert: HRV4Training, 200.000+ Nutzer, peer-reviewed (r=0,98)
│   │   └── Kein 300$+ Wearable nötig!
│   ├── Wearable HRV (Apple Watch, Oura, WHOOP, Garmin)
│   ├── 30-Tage rollende Baseline
│   ├── Trend: Über/Unter/Normal vs. Baseline
│   └── Morgen-Messung (Routine: aufwachen → messen → Score sehen)
│
├── 💪 Muskel-Recovery Map (LUMEOS USP!)
│   ├── Pro Muskelgruppe: Recovery-Prozent (0-100%)
│   │   ├── Berechnet aus: Trainingsvolumen + Intensität + Zeit seit Training
│   │   ├── Beeinflusst durch: Schlaf, Ernährung (Protein), Alter, Erfahrung
│   │   └── Selbstbericht (Muskelkater) als zusätzlicher Input
│   ├── Visuell: Körper-Map mit Farbcodierung (Rot/Gelb/Grün)
│   ├── Ready for Training: >80% = bereit
│   ├── Risiko-Level: Niedrig / Moderat / Überbelastung
│   └── Training-Empfehlung:
│       ├── "Quads 55% → heute KEIN Leg Day"
│       ├── "Chest 95% → Push Day ideal"
│       └── "Alles unter 50% → Rest Day oder Active Recovery"
│
├── 🎯 Lumeos Recovery Score (0-100%)
│   ├── Zusammensetzung:
│   │   ├── Schlafqualität     (30%)
│   │   ├── HRV-Status         (25%)
│   │   ├── Muskel-Readiness   (25%)
│   │   ├── Stress/Wohlbefinden (10%)
│   │   └── Biomarker          (10%, wenn verfügbar aus Medizin)
│   ├── Tägliche Anzeige (morgens nach Messung)
│   ├── Trend über Zeit
│   └── Training-Intensitäts-Empfehlung:
│       ├── <50%:  Active Recovery / Rest Day
│       ├── 50-70%: Leichtes Training, reduziertes Volumen
│       ├── 70-90%: Normales Training
│       └── >90%:  Push Day — maximale Intensität
│
├── 🧘 Stress & Wohlbefinden
│   ├── Morgen Check-in (30 Sekunden)
│   │   ├── "Wie fühlst du dich?" (1-5)
│   │   ├── "Muskelkater wo?" (Body-Map antippen)
│   │   ├── "Stresslevel?" (1-5)
│   │   └── Optional: Stimmung, Energie, Motivation
│   ├── Wearable Stress-Score (falls verfügbar)
│   └── Stress-Trends über Zeit
│
├── 📱 Wearable-Integration
│   ├── Stufe 1 (MVP): Health-Aggregatoren
│   │   ├── Apple HealthKit (iOS) → Apple Watch, Oura, WHOOP, Garmin, Fitbit
│   │   └── Google Health Connect (Android) → Wear OS, Samsung, Fitbit, Oura
│   │   └── Abdeckung: ~90% aller Wearable-Nutzer mit 2 Integrationen
│   ├── Stufe 2: Direkte APIs
│   │   ├── WHOOP API (detaillierter Strain/Recovery)
│   │   ├── Oura API (detaillierte Schlafphasen)
│   │   ├── Garmin Connect API (Body Battery, Training Load)
│   │   └── Polar Flow API (Training Load Pro)
│   └── Stufe 3: Kein-Hardware
│       ├── Handy-Kamera HRV (PPG)
│       ├── Accelerometer Schlaf-Erkennung
│       └── Mikrofon Schnarch-Erkennung
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → TRAINING: Recovery Score → Trainings-Intensitätsvorschlag
│   ├── → TRAINING: Muskel-Readiness → "Heute Push, nicht Pull"
│   ├── → ERNÄHRUNG: Schlafqualität → Ernährungs-Timing-Empfehlungen
│   ├── → SUPPLEMENTS: Recovery niedrig → "Magnesium + ZMA?"
│   ├── → MEDIZIN: Cortisol + CRP → Übertrainings-Erkennung
│   ├── → ZIELE: Recovery Score beeinflusst Trainingsvolumen-Planung
│   └── → KI-COACH: Recovery-Kontext in allen Empfehlungen
│
└── 💰 Monetarisierung
    ├── Free: Basis-Schlaf-Log, Manuell HRV, Muskelkater Self-Report
    ├── Plus (9,99$/Mo): Handy-Kamera HRV, Recovery Score, Muskel-Map, Wearable-Sync
    └── Pro (19,99$/Mo): Cross-Modul-Korrelation, Biomarker-Integration, Custom Protokolle
```

---

## 🎯 ZIELE (Goals Module)

```
ZIELE
│
├── 🎯 Ziel-Setup
│   ├── Primärziel wählen
│   │   ├── Fettabbau (Gewicht verlieren)
│   │   ├── Muskelaufbau (Lean Bulk)
│   │   ├── Gewicht halten (Maintenance)
│   │   ├── Recomposition (Fett ab, Muskeln auf gleichzeitig)
│   │   ├── Wettkampf-Vorbereitung (Contest Prep)
│   │   ├── Reverse Diet
│   │   └── Experten-Jahresplan (12-Monats-Bodybuilding-Zyklus)
│   ├── Zielgewicht + Zeitrahmen
│   ├── Aktivitätslevel (für initiale TDEE-Schätzung)
│   └── Diät-Präferenzen
│
├── 📊 Adaptiver TDEE (LUMEOS USP!)
│   ├── Woche 1: Formel-basiert (Harris-Benedict / Mifflin-St Jeor)
│   ├── Ab Woche 2: Adaptiv aus echten Daten
│   │   ├── Verbrauch = Aufnahme ± Gewichtsveränderung
│   │   ├── Wöchentliche Neuberechnung
│   │   ├── Exponentieller gleitender Durchschnitt (Glättung)
│   │   └── Keine Aktivitätslevel-Ratespiele mehr
│   ├── Angereichert durch Cross-Modul-Daten:
│   │   ├── Training Load (aus Training Module)
│   │   ├── Recovery Score (aus Recovery Module)
│   │   └── Schlafqualität (aus Recovery Module)
│   └── "Dein TDEE ist 2.847, nicht die 2.500 einer Formel"
│
├── 🔄 Phasen-State-Machine
│   ├── Phasen:
│   │   ├── ASSESSMENT (Onboarding, Datensammlung)
│   │   ├── FETTABBAU (Kaloriendefizit, 0,5-1% Körpergewicht/Woche)
│   │   ├── MAINTENANCE (Erhaltung, TDEE = Aufnahme)
│   │   ├── LEAN BULK (Kalorienüberschuss, 0,25-0,5% KG/Woche)
│   │   ├── RECOMPOSITION (TDEE, hohe Protein, Training-Fokus)
│   │   ├── CONTEST PREP (aggressiver Cut + Refeed Days + Peak Week)
│   │   ├── REVERSE DIET (langsame Kalorien-Steigerung nach Cut)
│   │   └── EXPERTEN-JAHRESPLAN (12 Monate: Bulk→Cut→Prep→Reverse→Off)
│   ├── Semi-automatische Übergänge
│   │   ├── System empfiehlt Phasenwechsel
│   │   ├── "Zielgewicht erreicht → Wechsel zu Maintenance empfohlen"
│   │   └── Nutzer bestätigt (kein Auto-Switch)
│   ├── Exit-Bedingungen pro Phase
│   │   ├── Zielgewicht erreicht
│   │   ├── Ziel-Körperfett erreicht
│   │   ├── Maximale Dauer überschritten
│   │   └── Metabolische Adaptation erkannt (TDEE-Drop)
│   └── Auto-Anpassung
│       ├── Off-Track: ±100-200 kcal Anpassung
│       ├── Refeed Days (automatisch bei langen Cuts)
│       └── Deload-Wochen (alle 4-6 Wochen in intensiven Phasen)
│
├── ⚖️ Gewichts-Tracking
│   ├── Tägliches Wiegen (morgens, nüchtern)
│   ├── 7-Tage gleitender Durchschnitt (LUMEOS USP!)
│   │   └── Reduziert Angst durch tägliche 1-2kg Schwankungen
│   ├── Trend-Linie (echte Richtung sichtbar)
│   ├── Gewichts-Prognose ("Bei aktuellem Tempo: Ziel in X Wochen")
│   └── Progress Photos (wöchentlich, Side-by-Side Vergleich)
│
├── 🏆 Cross-Modul-Ziele (LUMEOS USP!)
│   ├── Gewichtsziel: Ernährung + Training + Recovery
│   │   └── "Lose 0,5kg/Woche: 2.300 kcal, 160g Protein, 4x Training"
│   ├── Kraftziel: Training + Ernährung + Recovery + Supplements
│   │   └── "Squat 150kg: Progressive Overload + Kalorienüberschuss + Kreatin + Recovery >70%"
│   ├── Körperzusammensetzung: ALLE Module
│   │   └── "Recomp: Maintenance Kalorien, hohes Protein, periodisiertes Training, Blutwert-Monitoring"
│   ├── Gesundheitsziel: Medizin + Ernährung + Supplements
│   │   └── "Ferritin >80: Eisenreiche Lebensmittel + Supplement + Retest in 3 Monaten"
│   ├── Recovery-Ziel: Recovery + Training + Ernährung + Supplements
│   │   └── "Recovery Score >80%: Schlaf >7h, Magnesium, Deload alle 4 Wochen"
│   └── Supplement-Ziel: Supplements + Medizin + Ernährung
│       └── "Vitamin D optimieren: 5.000 IE/Tag → Retest in 8 Wochen → Ziel 50-80 ng/mL"
│
├── 🧠 Verhaltens-Layer (inspiriert von Noom)
│   ├── Streak System (Tage in Folge getrackt)
│   ├── Meilensteine + Feier-Animationen
│   │   ├── "Erste Woche mit 100% Protein-Ziel! 🎉"
│   │   ├── "5kg Meilenstein erreicht! 🏆"
│   │   └── "30 Tage Streak! 🔥"
│   ├── Wöchentliche Check-ins
│   │   ├── Gewicht + Messungen + Progress Foto
│   │   ├── Reflexion: "Was lief gut? Was war schwierig?"
│   │   └── KI-Coach Zusammenfassung + Anpassung
│   ├── Nudges (Verhaltens-Anstöße)
│   │   ├── "Du hast gestern nicht geloggt — brauchst du Hilfe?"
│   │   ├── "Dein Protein ist diese Woche 20% unter Ziel"
│   │   └── "Time for your weekly weigh-in! 📊"
│   └── Accountability (optional)
│       ├── Ziel mit Freund teilen
│       ├── Coach-Accountability (wenn Coach-Mode aktiv)
│       └── Community Challenges
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → ERNÄHRUNG: TDEE + Phase → Kalorien- + Makro-Budget
│   ├── → TRAINING: Phase → Volumen-Planung (Cut = weniger Volumen)
│   ├── → SUPPLEMENTS: Phase → Stack-Anpassung
│   ├── → MEDIZIN: Blutwerte → Ziel-Informierung ("Testosteron fällt → Cut pausieren?")
│   ├── → RECOVERY: Recovery Score → Trainingsvolumen-Begrenzung
│   └── → KI-COACH: Ziel-Kontext in allen Empfehlungen
│
└── 💰 Monetarisierung
    ├── Free: Statisches Ziel, Basis-Kalorienziel, Wöchentliches Wiegen
    ├── Plus (9,99$/Mo): Adaptiver TDEE, Phasenmanagement, Streaks, Wöchentliche Anpassung
    └── Pro (19,99$/Mo): Alle Phasen, Cross-Modul-Ziele, Blutwert-Ziele, Experten-Jahresplan
```

---

## 🤖 KI-COACH (AI Coach Module)

```
KI-COACH
│
├── 💬 Konversations-Interface
│   ├── Natürliche Sprache (Text-Chat)
│   │   ├── "Wie viel Protein soll ich heute essen?"
│   │   ├── "Erstell mir ein Workout für heute"
│   │   ├── "Warum stagniert mein Bench Press?"
│   │   ├── "Erkläre mir RPE"
│   │   └── "Motivier mich"
│   ├── Spracheingabe (Voice-to-Text)
│   ├── Proaktive Nachrichten (Coach kommt zu DIR)
│   │   ├── "Du hast gestern Leg Day gemacht aber nur 90g Protein → heute 160g"
│   │   ├── "Dein Recovery Score ist 45% → Active Recovery empfohlen"
│   │   └── "Deine Vitamin D Vorräte reichen noch 5 Tage → nachbestellen"
│   └── Konversations-Gedächtnis (persistent über Sessions)
│
├── 🎭 Persona-System (LUMEOS USP!)
│   ├── 🔬 Wissenschaftler
│   │   ├── Evidenz-basiert, nüchtern, zitiert Studien
│   │   └── "Studien zeigen dass 1,6-2,2g/kg Protein optimal ist..."
│   ├── 💪 Motivator
│   │   ├── Energetisch, positiv, feiernd
│   │   └── "Du schaffst das! Gestern war ein starker Tag! 🔥"
│   ├── 🎖️ Drill Sergeant
│   │   ├── Hart, direkt, keine Ausreden
│   │   └── "Keine Ausreden. Rein ins Gym. Jetzt."
│   ├── 😊 Bester Freund
│   │   ├── Locker, supportive, verständnisvoll
│   │   └── "Hey, lass uns mal schauen was wir anpassen können..."
│   └── 🧘 Sensei
│       ├── Weise, geduldig, langfristig denkend
│       └── "Der Weg ist das Ziel. Konsistenz schlägt Perfektion."
│   └── Persona jederzeit wechselbar
│
├── 🧠 Hybrid-KI-Architektur (LUMEOS USP!)
│   ├── LLM-Layer (Konversation)
│   │   ├── GPT-4o-mini (80% der Anfragen, günstig + schnell)
│   │   ├── GPT-4o (20% komplexe Anfragen, Periodisierung, Multi-Modul)
│   │   └── Automatisches Routing nach Komplexität
│   ├── Deterministische Engine (Berechnungen)
│   │   ├── TDEE → IMMER aus Algorithmus, NIE aus LLM
│   │   ├── Makros → IMMER aus Algorithmus
│   │   ├── Volumen → IMMER aus Training Module
│   │   ├── Recovery Score → IMMER aus Recovery Module
│   │   └── Null Halluzinations-Toleranz bei Zahlen
│   └── Zusammenführung
│       ├── LLM generiert natürliche Antwort
│       ├── Deterministische Engine liefert Fakten/Zahlen
│       └── Safety Check vor Auslieferung
│
├── 📊 Kontext-Builder (liest ALLE Lumeos-Daten)
│   ├── Nutzer-Profil (Alter, Geschlecht, Gewicht, Größe, Erfahrung)
│   ├── Ernährung (Heutige Kalorien, Protein, Wochendurchschnitt, Defizite)
│   ├── Training (Letztes Workout, Wochenvolumen, PRs, Muskelgruppen-Balance)
│   ├── Recovery (Recovery Score, Schlafqualität, HRV-Trend, Muskel-Readiness)
│   ├── Supplements (Aktueller Stack, Timing, Wechselwirkungen)
│   ├── Medizin (Letzte Biomarker, Medikamente, markierte Werte)
│   ├── Ziele (Aktuelle Phase, Zielgewicht, TDEE, Adhärenz-Rate)
│   └── Gesprächsverlauf (Letzte 20 Nachrichten + Präferenzen)
│
├── 📹 Formcheck via Kamera (LUMEOS USP!)
│   ├── Kemtai API (White-Label, medizinisch validiert)
│   ├── Nutzer filmt Übung → Video an Kemtai
│   ├── Pose Estimation + Biomechanische Analyse
│   ├── Form-Score (0-100) + spezifische Korrekturen
│   └── KI-Coach erklärt: "Deine Kniebeuge: 72/100. Knie gehen zu weit nach innen."
│
├── 🛡️ Sicherheits-Layer
│   ├── Medizinische Hinweise
│   │   ├── Gesundheitsbezogene Antwort → Disclaimer hinzufügen
│   │   ├── Medikamenten-Empfehlung → BLOCKIERT + Arzt-Verweis
│   │   └── Widerspruch zu Arzt → BLOCKIERT + Eskalation
│   ├── Berechnungs-Integrität
│   │   ├── Kalorien-Berechnung → Verifizierung mit TDEE-Engine
│   │   ├── Volumen-Berechnung → Verifizierung mit Training Module
│   │   └── Dosierungs-Berechnung → Verifizierung mit Supplement DB
│   └── Halluzinations-Erkennung
│       ├── Studie zitiert → DOI-Existenz prüfen
│       └── Exakte Zahl behauptet → Cross-Check mit DB
│
├── 💼 Coach-Klon-Engine (B2B)
│   ├── Coach erstellt Klon:
│   │   ├── Methodik-Dokumente hochladen (PDFs, Protokolle)
│   │   ├── Q&A Sessions aufnehmen (Sprache → Transkript)
│   │   ├── Antwortstil + Grenzen definieren
│   │   └── Generierte Antworten prüfen + editieren (Training Loop)
│   ├── Klient interagiert mit Klon:
│   │   ├── Natürliche Sprache, Coach's Stil
│   │   ├── Nutzt Coach-Methodik + Klient's Lumeos-Daten
│   │   └── Eskalation an echten Coach bei Komplexem/Medizinischem
│   └── 99$/Mo pro Coach (durch Coachvox validiert)
│
├── 🔗 Cross-Modul-Verknüpfungen
│   ├── → ALLE MODULE: Liest und integriert alle Daten
│   ├── Einzigartige Fähigkeit:
│   │   └── "Dein TDEE ist 2.847 (Ziele), Recovery 82% (Recovery),
│   │       Bench stagniert seit 3 Wochen (Training), du isst nur 120g
│   │       Protein (Ernährung) → Empfehlung: Protein auf 160g erhöhen,
│   │       Bench-Variation einbauen, Kreatin supplementieren (Supplements)"
│   └── Kein anderer KI-Coach kann diesen Satz generieren
│
├── 💰 Unit Economics
│   ├── LLM-Kosten pro Nutzer/Monat: 0,50-1,30$
│   ├── Abo-Umsatz: 9,99$/Mo
│   ├── Bruttomarge: 87-95%
│   ├── Kemtai CV-API: ~0,05$/Formcheck
│   └── Coach-Klon: 99$/Mo (nahezu null Grenzkosten)
│
└── 💰 Monetarisierung
    ├── Free: 5 Nachrichten/Tag, Basis-Q&A, kein Modul-Zugriff
    ├── Plus (9,99$/Mo): Unbegrenzt, Alle Module, Persona-Wahl, Workout/Essensplan-Generator
    ├── Pro (19,99$/Mo): Erweiterte Analysen, Periodisierungs-Planung, Blutwert-Analyse
    └── Coach (99$/Mo): KI-Klon-Builder, Multi-Client, White-Label
```

---

## 👨‍🏫 COACH (Coach Module)

```
COACH
│
├── Dual-Mode: Nutzer kann Lumeos alleine nutzen ODER mit Coach
│
├── 👤 Self-Mode (B2C)
│   └── Nutzer trainiert, trackt, optimiert selbst
│       (Training, Ernährung, Supplements, Recovery, Medizin)
│
└── 👥 Coach-Mode (B2B2C)
    │
    ├── 🏋️ Coach-Dashboard
    │   │
    │   ├── Klienten-Management
    │   │   ├── Klienten-Liste + Profile
    │   │   ├── Onboarding-Formulare + Fragebögen
    │   │   ├── Tags + Segmente (z.B. "Wettkampf", "Anfänger", "Reha")
    │   │   ├── Klienten-Notizen (privat, nur für Coach)
    │   │   ├── Klienten-Status (Aktiv / Pausiert / Archiviert)
    │   │   └── Schnell-Übersicht: Recovery Score, Adhärenz, Letztes Login
    │   │
    │   ├── Workout-Programmierung
    │   │   ├── Programm-Builder (Drag & Drop)
    │   │   ├── KI-Programm-Generator
    │   │   ├── Übungsbibliothek (800+ eingebaut + Custom)
    │   │   ├── Programm-Vorlagen (wiederverwendbar)
    │   │   ├── Periodisierungs-Support (Phasen, Deload, Makrozyklen)
    │   │   ├── Zuweisen → Klienten-Kalender
    │   │   └── Fortschritts-Überwachung (hat Klient Programm befolgt?)
    │   │
    │   ├── Ernährungs-Coaching
    │   │   ├── Makro-/Kalorien-Ziele setzen pro Klient
    │   │   ├── KI-Essensplaner
    │   │   ├── Klienten Food-Log Review (Tages-/Wochen-Ansicht)
    │   │   ├── Compliance-Monitoring (% Makro-Ziel erreicht)
    │   │   ├── Ernährungs-Flags ("Protein unter 100g seit 3 Tagen")
    │   │   └── → VERKNÜPFT mit Lumeos Ernährungs-Modul
    │   │
    │   ├── 💊 Supplement-Management (LUMEOS USP!)
    │   │   ├── Supplement-Stack pro Klient erstellen
    │   │   ├── Timing + Dosierung festlegen
    │   │   ├── Klient-Compliance einsehen (Genommen/Übersprungen)
    │   │   ├── Wechselwirkungs-Warnungen
    │   │   ├── Lückenanalyse für Klienten
    │   │   └── → VERKNÜPFT mit Lumeos Supplement-Modul
    │   │
    │   ├── 🩸 Blutwerte-Review (LUMEOS USP!)
    │   │   ├── Klienten-Blutwerte einsehen (wenn freigegeben)
    │   │   ├── Trend-Analyse pro Klient
    │   │   ├── Red Flags + Warnungen
    │   │   ├── Enhanced-Mode Monitoring (für BB-Coaches)
    │   │   ├── Empfehlungen basierend auf Werten
    │   │   └── → VERKNÜPFT mit Lumeos Medizin-Modul
    │   │
    │   ├── 📊 Recovery & Readiness (LUMEOS USP!)
    │   │   ├── Klienten Recovery Scores (Tagesübersicht)
    │   │   ├── Schlaf + HRV Daten (Wearable-Import)
    │   │   ├── Muskel-Recovery-Map pro Klient
    │   │   ├── Übertrainings-Warnungen
    │   │   ├── "Klient X: Recovery unter 50% seit 3 Tagen"
    │   │   └── → VERKNÜPFT mit Lumeos Recovery-Modul
    │   │
    │   ├── 📈 Fortschritts-Analytics
    │   │   ├── Kraft-Fortschritt (PR-Tracking)
    │   │   ├── Körperzusammensetzung (Gewicht, KFA%, Maße)
    │   │   ├── Progress-Fotos (Side-by-Side Vergleich)
    │   │   ├── Compliance-Dashboards
    │   │   │   ├── Training-Adhärenz (%)
    │   │   │   ├── Ernährungs-Adhärenz (%)
    │   │   │   ├── Supplement-Adhärenz (%)
    │   │   │   └── Gewichts-Trend vs. Ziel
    │   │   ├── KI-gestützte Insights
    │   │   │   └── "Klient Y stagniert seit 4 Wochen — Volumen erhöhen?"
    │   │   └── Klienten-Reports (PDF-Export)
    │   │
    │   ├── 💬 Kommunikation
    │   │   ├── In-App Chat (1:1 + Gruppen)
    │   │   ├── Sprach- + Video-Nachrichten
    │   │   ├── Video-Calls (Zoom/Meet Integration)
    │   │   ├── Auto-Nachrichten + Geplante Nachrichten
    │   │   ├── Formcheck (Video-Review + Feedback)
    │   │   └── Session-Notizen (an Klienten-Timeline angehängt)
    │   │
    │   ├── 💼 Business-Tools
    │   │   ├── Zahlungen (Abos, Pakete, Einmalzahlungen)
    │   │   │   └── Stripe Connect Integration
    │   │   ├── Lead-Management (Interessenten-Pipeline)
    │   │   ├── Trial-Programme (kostenlose Probezeit)
    │   │   ├── Empfehlungssystem (Referral)
    │   │   ├── Team-Management (Multi-Coach, Klienten-Übergabe)
    │   │   └── Branded App (White-Label)
    │   │
    │   └── ⚡ Automation
    │       ├── Auto Programm-Auslieferung (Wochenplan automatisch)
    │       ├── Check-In Erinnerungen (wöchentlich automatisch)
    │       ├── Compliance-Alerts ("Klient hat 3 Tage nicht getrackt")
    │       ├── Automated Check-ins (Daten auto-gezogen)
    │       │   ├── Gewicht, Recovery Score, Adhärenz automatisch
    │       │   └── Coach reagiert auf Insights, nicht auf Daten-Sammlung
    │       └── Workflow Builder (Custom Automations)
    │
    ├── 🤖 KI-Klon-Engine (Business-Plan, 99$/Mo)
    │   ├── Coach erstellt KI-Version seiner Methode
    │   │   ├── Methodik-Dokumente hochladen
    │   │   ├── Q&A Sessions → Training
    │   │   ├── Stil + Grenzen definieren
    │   │   └── Review + Edit Loop
    │   ├── Klient interagiert mit Klon (24/7)
    │   │   ├── Coach's Stil + Klient's Lumeos-Daten
    │   │   └── Eskalation an echten Coach bei Komplexem
    │   └── Skalierung: 50 Klienten → 500 mit gleichem Aufwand
    │
    ├── 📱 Klienten-Ansicht (in normaler Lumeos App)
    │   ├── Sieht zugewiesene Workouts im Trainingskalender
    │   ├── Loggt Training (wie gewohnt)
    │   ├── Food-Log + Makro-Tracking (wie gewohnt)
    │   ├── Supplement-Compliance loggen
    │   ├── Progress-Fotos aufnehmen
    │   ├── Chat mit Coach
    │   ├── Recovery Score sehen
    │   ├── Check-ins beantworten
    │   └── ALLES fließt zurück zum Coach-Dashboard
    │   │
    │   └── KERN-INNOVATION: Klienten-App = Lumeos App
    │       ├── Kein doppeltes Tracking
    │       ├── Keine separate Coach-App
    │       ├── Coach sieht automatisch was Klient trackt
    │       └── Klient braucht nur EINE App
    │
    ├── 🔐 Berechtigungen (Datenschutz)
    │   ├── Klient kontrolliert was Coach sieht
    │   │   ├── Training: Voll / Zusammenfassung / Nichts
    │   │   ├── Ernährung: Voll / Zusammenfassung / Nichts
    │   │   ├── Recovery: Voll / Zusammenfassung / Nichts
    │   │   ├── Supplements: Voll / Zusammenfassung / Nichts
    │   │   ├── Medizin: Voll / Zusammenfassung / Nichts (SENSITIV!)
    │   │   ├── Körpermaße: Voll / Zusammenfassung / Nichts
    │   │   └── Ziele: Voll / Zusammenfassung / Nichts
    │   ├── Zeitlich begrenzter Zugriff möglich
    │   └── Audit-Log aller Coach-Zugriffe
    │
    └── 💰 Monetarisierung
        ├── Starter (29$/Mo): 10 Klienten, Dashboard, Chat, Programm-Builder
        ├── Professional (49$/Mo): 50 Klienten, + Ernährungs-Management, Automation, Branding
        ├── Business (99$/Mo): 150 Klienten, + KI-Klon, Marktplatz, Erweiterte Analytics
        ├── Enterprise (199$/Mo): Unbegrenzt + Multi-Coach, White-Label, API
        └── Revenue Split:
            ├── Coach-Traffic: 90/10 (Coach 90%, Lumeos 10%)
            └── Discovery-Traffic: 80/20 (Coach 80%, Lumeos 20%)
```

---

## 🛒 MARKTPLATZ (Marketplace Module)

```
MARKTPLATZ
│
├── 🏪 Storefront / Discovery
│   ├── Kategorien
│   │   ├── 🏋️ Trainingsprogramme
│   │   ├── 🍎 Essenspläne
│   │   ├── 💊 Supplement-Protokolle
│   │   ├── 😴 Recovery-Protokolle
│   │   ├── 📦 BUNDLES (Cross-Modul, LUMEOS USP!)
│   │   │   └── "12-Wochen Lean Bulk: Training + Ernährung + Supplements + Recovery"
│   │   └── 🤖 KI-Coach-Personas
│   ├── Personalisierte Empfehlungen
│   │   ├── "Programme für dich" (basierend auf Ziel + Level + Equipment)
│   │   ├── "Trending diese Woche" (Social Proof)
│   │   ├── "Coach Picks" (kuratiert)
│   │   └── KI-Coach-Empfehlung ("Basierend auf deinen Daten...")
│   ├── Suche + Filter (Ziel, Level, Dauer, Equipment, Preis)
│   ├── Bewertungen + Reviews
│   ├── Creator-Profile (Coach/Influencer)
│   └── Kostenlose Programme (Boostcamp-Strategie als Akquise-Funnel)
│
├── 📦 Produkttypen
│   ├── Trainingsprogramm (4-12 Wochen)
│   │   ├── Preis: 15-50$ einmalig
│   │   ├── Wird LIVE im Training Module geladen (kein PDF!)
│   │   ├── Fortschritt wird automatisch getrackt
│   │   └── KI-Coach kennt das Programm
│   ├── Essensplan (monatlich)
│   │   ├── Preis: 10-25$/Mo
│   │   ├── Wird LIVE im Ernährungs-Modul geladen
│   │   └── Einkaufsliste auto-generiert
│   ├── Supplement-Protokoll
│   │   ├── Preis: 5-15$ einmalig
│   │   └── Stack + Timing laden direkt ins Supplement-Modul
│   ├── Recovery-Protokoll
│   │   ├── Preis: 5-15$ einmalig
│   │   └── Schlaf + Deload + Stretching Routinen
│   ├── BUNDLE (LUMEOS USP!)
│   │   ├── Preis: 30-80$ einmalig
│   │   ├── Training + Ernährung + Supplements + Recovery KOMBINIERT
│   │   ├── ALLES LIVE in der App mit Tracking
│   │   └── KEIN Wettbewerber kann das anbieten
│   └── KI-Coach-Persona
│       ├── Preis: 10-20$/Mo
│       └── Custom KI-Persönlichkeit + Methodik
│
├── 🎨 Creator Hub
│   ├── Inhalte erstellen
│   │   ├── Programm-Builder (Drag & Drop)
│   │   ├── Essensplan-Builder
│   │   ├── Supplement-Protokoll-Builder
│   │   ├── Bundle-Builder (Module kombinieren)
│   │   └── Preview + Test (Selbst ausprobieren)
│   ├── Preis festlegen (einmalig oder Abo)
│   ├── Beschreibung + Vorschau-Bilder/Videos
│   ├── Analytics
│   │   ├── Verkäufe + Umsatz
│   │   ├── Completion Rate (% die das Programm abschließen)
│   │   ├── Bewertungen + Review-Management
│   │   └── Audience Insights
│   └── Auszahlungen (Stripe Connect, automatisch)
│
├── 🏷️ Marken-Partnerschaften (B2B)
│   ├── In-Context Produktplatzierung
│   │   ├── "Dein Stack fehlt Kreatin → [Marke] Kreatin Monohydrat, 24,99$"
│   │   ├── Kontextbezogen (nicht Banner-Werbung)
│   │   ├── Nur wenn relevant für Nutzer's Stack/Ziel
│   │   └── CPA: 5-15$ pro Conversion
│   ├── Co-Branded Bundles
│   │   ├── Marke + Coach Collaboration
│   │   └── Revenue Share: 70/30 (Marke/Lumeos)
│   ├── Featured Listing (CPM 15-30$)
│   └── Marken-Dashboard (Reach, Engagement, ROI)
│
├── 💳 Zahlungs-Infrastruktur
│   ├── Stripe Connect (Plattform-Modell)
│   │   ├── Creator Onboarding (KYC/AML)
│   │   ├── Split-Zahlungen (automatischer Revenue Share)
│   │   ├── Abo-Management
│   │   ├── Rückerstattungen (14-Tage Policy)
│   │   └── Steuer-Reporting
│   └── Apple/Google IAP
│       ├── 30% Plattform-Steuer auf Mobile-Käufe
│       └── Strategie: Web-Kauf nudgen (15% Ersparnis)
│
└── 💰 Revenue Shares
    ├── Coach-Traffic (Klient kommt über Coach): 90/10
    ├── Discovery-Traffic (Klient findet über Lumeos): 80/20
    ├── Lumeos-Bundles (Lumeos-kuratiert): 100% Lumeos
    └── Marken-Partnerschaften: CPA 5-15$ + Plattform-Gebühr
```

---

## 🏢 B2B (B2B Module)

```
B2B
│
├── 🏋️ Vertical 1: Gyms & Studios
│   │
│   ├── Gym-Connect
│   │   ├── Check-in Sync (Mitglied checkt ein → Lumeos loggt "Gym-Besuch")
│   │   ├── Bi-direktional: Mitglied trainiert in Lumeos → Gym sieht Aktivität
│   │   ├── Programme zuweisen (Gym's PT → Mitglied's Lumeos App)
│   │   └── Equipment-Sync (Technogym Integration, Phase 3)
│   │
│   ├── Mitglieder-Dashboard
│   │   ├── Mitglieder-Übersicht (Name, Status, Letzter Besuch, Recovery)
│   │   ├── Fortschritts-Tracking (aggregiert + individuell bei Freigabe)
│   │   ├── Aktivitäts-Heatmap (wann trainieren die Mitglieder?)
│   │   └── Segment-Analyse (Anfänger vs. Fortgeschrittene)
│   │
│   ├── Retention Engine (LUMEOS USP!)
│   │   ├── Churn-Prediction ("Mitglied X hat 7 Tage nicht trainiert")
│   │   ├── Automatisiertes Re-Engagement
│   │   │   ├── Push Notification
│   │   │   ├── Coach-Nachricht
│   │   │   └── Sonderangebot / Free PT Session
│   │   ├── ROI: 5 verhinderte Kündigungen/Mo × 50€ = 250€ gespart > 199€ Abo
│   │   └── Engagement-Reports (wöchentlich, monatlich)
│   │
│   ├── PT-Integration
│   │   ├── Personal Trainer nutzt Coach-Modul für Gym-Klienten
│   │   ├── Programm-Zuweisung direkt in Mitglied's Lumeos App
│   │   └── Standardisierte Programme über alle PTs
│   │
│   ├── White-Label (Enterprise)
│   │   ├── Custom Logo + Farben + Name
│   │   ├── Feature-Toggles (Module ein/ausblenden)
│   │   ├── Default-Programme (Gym's Programme vorgeladen)
│   │   ├── Custom Onboarding (Gym's Branding)
│   │   └── Custom Domain (gymname.lumeos.app)
│   │
│   ├── Gym-Software-Integrationen
│   │   ├── P1: Magicline (8.000 Studios, DACH, Open API)
│   │   ├── P1: Mindbody (40.000 Businesses, global)
│   │   ├── P2: Glofox (modern, wachsend)
│   │   ├── P2: PushPress (Free-Tier Gym Management)
│   │   ├── P3: Technogym (Premium-Equipment API)
│   │   └── P3: Wodify (CrossFit Boxes)
│   │
│   └── Preise
│       ├── Starter (99€/Mo): Bis 200 Mitglieder, Gym-Connect, Basis-Retention
│       ├── Professional (299€/Mo): Bis 1.000, PT-Integration, Erweiterte Analytics
│       └── Enterprise (499€+/Mo): Unbegrenzt, Multi-Standort, White-Label, API
│
├── 💊 Vertical 2: Supplement-Marken (höchstes Revenue-Potenzial)
│   │
│   ├── Marken-Dashboard
│   │   ├── Produktkatalog verwalten (mit Nährwertangaben)
│   │   ├── Zielgruppen-Regeln definieren
│   │   │   ├── "Zeige Nutzern die Protein tracken"
│   │   │   ├── "Zeige Nutzern mit Vitamin D Defizit"
│   │   │   └── "Zeige Nutzern die Kreatin im Stack haben"
│   │   ├── In-App-Platzierung
│   │   │   ├── "Empfohlen für deinen Stack"
│   │   │   ├── Kontextbezogen (nicht Spam)
│   │   │   └── CPA 5-15$ pro Conversion
│   │   ├── Co-Branded Bundles (mit Coaches/Influencern)
│   │   ├── Affiliate-Tracking (Klicks, Conversions, Umsatz)
│   │   └── Analytics (Reichweite, Engagement, ROI)
│   │
│   ├── Einzigartiger Kanal (LUMEOS USP!)
│   │   ├── KEIN anderer Kanal erreicht aktive Gym-Nutzer im Moment des Stack-Trackings
│   │   ├── CPA 5-15$ vs. Instagram 20-30$ (50-75% günstiger)
│   │   ├── 1st Phorm Case Study: App + Supplements = $500 Mio.+ Umsatz
│   │   └── Lumeos ermöglicht das für JEDE Marke (nicht nur eigene App)
│   │
│   └── Preise
│       ├── Plattform-Gebühr: 1.000-5.000$/Mo (nach Reichweite)
│       ├── CPA: 5-15$ pro Conversion (getrackt)
│       ├── Co-Branded Bundles: Revenue Share 70/30 (Marke/Lumeos)
│       ├── Featured Listing: 2.000-10.000$/Mo
│       └── Daten-Insights: 500-2.000$/Mo (anonymisierte Trends)
│
├── 🏢 Vertical 3: Corporate Wellness
│   │
│   ├── Mitarbeiter-App (= Lumeos App mit Config-Layer)
│   │   ├── KEIN separates Produkt (gleiche Codebase)
│   │   ├── App auch privat nützlich → Engagement >50% (vs. <30% bei Standard)
│   │   ├── Company-Branding (Logo, Farben)
│   │   └── Modul-Toggles (Company kann Module wählen)
│   │
│   ├── Challenges & Gamification
│   │   ├── Abteilungs-Challenges (z.B. "10.000 Schritte/Tag")
│   │   ├── Company-weite Leaderboards
│   │   ├── Belohnungen (Punkte → Gutscheine)
│   │   └── Team-Wettbewerbe
│   │
│   ├── Analytics (DSGVO-konform!)
│   │   ├── NUR aggregierte Daten (nie individuell!)
│   │   ├── Engagement-Rate pro Abteilung
│   │   ├── Challenge-Teilnahme
│   │   ├── Gesundheits-Score (anonymisiert)
│   │   └── ROI-Reports für HR
│   │
│   └── Preise
│       ├── Standard (15$/Mitarbeiter/Mo): App, Challenges, Basis-Analytics
│       ├── Premium (25$/Mitarbeiter/Mo): + Coaching, Erweiterte Analytics, Integration
│       └── Enterprise (Custom): Custom Features, Dedicated CSM, On-Prem Option
│
├── 🔌 API Layer
│   ├── REST API + Webhooks + SDK
│   ├── OAuth2 + API Keys
│   ├── Endpoints:
│   │   ├── /api/b2b/gyms/ (Mitglieder, Check-ins, Programme, Analytics)
│   │   ├── /api/b2b/brands/ (Produkte, Platzierungen, Conversions, Reports)
│   │   └── /api/b2b/corporate/ (Mitarbeiter, Challenges, Analytics)
│   └── Dokumentation + Developer Portal
│
├── 🔒 DSGVO & Datenschutz
│   ├── Gym sieht:
│   │   ├── ✅ Aggregierter Mitglieder-Fortschritt
│   │   ├── ✅ Check-in Frequenz
│   │   ├── ✅ Programm-Completion Rate
│   │   ├── ❌ Food-Log Details
│   │   ├── ❌ Medizin-/Blutwert-Daten
│   │   └── ❌ Individuelle Gesundheitsmetriken (außer bei Freigabe)
│   ├── Marke sieht:
│   │   ├── ✅ Anonymisierte Nutzersegmente
│   │   ├── ✅ Conversion-/Klick-Daten für eigene Produkte
│   │   ├── ❌ Individuelle Nutzerdaten
│   │   └── ❌ Wettbewerber-Produktdaten
│   └── Corporate sieht:
│       ├── ✅ Aggregierte Abteilungs-/Company-Scores
│       ├── ✅ Challenge-Teilnahmeraten
│       ├── ❌ Individuelle Mitarbeiterdaten
│       └── ❌ Medizinische Informationen
│
└── 💰 Revenue-Prognose
    ├── Jahr 1: Gyms 120.000$ + Marken 240.000$ + Corporate 100.000$ = 460.000$
    ├── Jahr 2: 500.000$ + 1,8 Mio.$ + 500.000$ = 2,8 Mio.$
    └── Jahr 3: 1,5 Mio.$ + 7,7 Mio.$ + 2 Mio.$ = 11,2 Mio.$
```

---

## ⚡ CROSS-MODUL INTELLIGENCE LAYER

```
CROSS-MODUL INTELLIGENCE
│
├── 🔄 Korrelations-Engine
│   ├── Biomarker × Ernährung × Supplements × Training × Recovery × Symptome
│   ├── "Was beeinflusst was?" (inspiriert von Bearable)
│   ├── Automatische Muster-Erkennung über Zeit
│   └── Nutzer-Insights mit Konfidenz-Level
│
├── 📊 Lückenanalyse
│   ├── Ernährung → Supplements: Mikronährstoff-Lücken aus Food-Log
│   ├── Training → Recovery: Muskelgruppen-Readiness aus Volumen-Daten
│   └── Medizin → Alle: Biomarker-Defizite → Ernährungs + Supplement Empfehlungen
│
├── 🔁 Redundanz-Erkennung
│   ├── Supplement × Supplement: Inhaltsstoff-Überlappung
│   ├── Supplement × Ernährung: "Du nimmst Vitamin C aber isst bereits 150% RDA"
│   └── Kosten-Optimierung: "Spare X$/Mo durch Redundanz-Entfernung"
│
├── 📈 Adaptiver TDEE
│   ├── Echte Daten: Aufnahme (Ernährung) ± Gewichtsveränderung (Ziele)
│   ├── Angereichert: Training Load + Recovery Score + Schlafqualität
│   └── Wöchentliche Neuberechnung
│
├── 🏋️ Recovery-gesteuertes Training
│   ├── Recovery Score → Trainingsintensitäts-Empfehlung
│   ├── Muskel-Readiness → Trainingsplan-Anpassung
│   └── Biomarker (CRP, Cortisol) → Übertrainings-Warnung
│
├── 💊 Trainingsbasierte Supplement-Stacks
│   ├── Heutiger Workout-Typ → Pre/Post/Intra Anpassung
│   ├── Rest Day → Pre-Workout überspringen
│   └── Phase (Bulk/Cut) → Stack-Anpassung
│
├── 🩸 Blutwert-Validierung
│   ├── Supplement-Log + Bluttest über Zeit → "Wirkt es?"
│   ├── Ernährungsänderung + Bluttest → "Hat es geholfen?"
│   └── Training Load + Entzündungsmarker → "Zu viel?"
│
└── 🌐 Netzwerk-Effekt
    ├── 1 Modul: Basis-Tracking
    ├── 2 Module: Erste Cross-Insights
    ├── 3+ Module: Exponentieller Wert-Anstieg
    ├── Alle Module: Vollständiges Gesundheitsbild
    └── Je mehr Module aktiv → stärkerer Lock-in + höherer Wert
```

---

## 🔒 DATENSCHUTZ & SICHERHEIT

```
DATENSCHUTZ
│
├── 🔒 Speicher-Stufen
│   ├── Stufe 1: Lokal-First (Standard)
│   │   ├── SQLite auf Gerät
│   │   ├── Daten verlassen NIEMALS das Gerät
│   │   ├── Zero-Knowledge: Lumeos kann nichts sehen
│   │   └── Standard für ALLE Module
│   │
│   ├── Stufe 2: E2E-verschlüsselte Cloud (Opt-in)
│   │   ├── Nutzer hält Verschlüsselungsschlüssel
│   │   ├── Cloud-Backup für Multi-Gerät
│   │   ├── Lumeos kann Daten weiterhin NICHT sehen
│   │   └── libsodium Verschlüsselung
│   │
│   ├── Stufe 3: Selektives Teilen (Opt-in)
│   │   ├── Coach/Arzt Zugriff auf bestimmte Module
│   │   ├── Zeitlich begrenzte Access-Tokens
│   │   ├── Berechtigungen pro Modul einstellbar
│   │   └── Audit-Log aller Zugriffe
│   │
│   └── Stufe 4: Enhanced Strikt
│       ├── NUR lokale Speicherung (keine Cloud-Option)
│       ├── Null Telemetrie, null Analytics
│       ├── Compound-DB offline ausgeliefert
│       └── Spezifisch für Enhanced Supplements Modul
│
├── 📋 Compliance
│   ├── DSGVO (EU)
│   ├── HIPAA (US, für Medizin-Modul)
│   ├── Daten-Portabilität (Export jederzeit)
│   ├── Löschrecht ("Right to be Forgotten")
│   └── Datenschutz-Folgenabschätzung (DSFA)
│
├── 🏢 B2B Datenschutz
│   ├── Gyms: NUR aggregierte Daten, nie individuelle Gesundheitsdaten
│   ├── Marken: NUR anonymisierte Segmente, nie Nutzerdaten
│   ├── Corporate: NUR Abteilungs-/Company-Level, nie Mitarbeiter-Daten
│   └── Individualdaten nur wenn Nutzer explizit freigibt
│
└── 🔐 Technische Sicherheit
    ├── Verschlüsselung at Rest (Geräte-Verschlüsselung + App-Layer)
    ├── Verschlüsselung in Transit (TLS 1.3)
    ├── E2E-Verschlüsselung (libsodium, für Cloud-Sync)
    ├── Biometrische App-Sperre (Face ID / Touch ID)
    ├── Session-Management (automatischer Logout)
    └── Penetration Testing (regelmäßig)
```

---

## ⚙️ TECH STACK & INFRASTRUKTUR

```
TECH STACK
│
├── 📱 Frontend
│   ├── React Native (iOS + Android, eine Codebase)
│   ├── Next.js (Web Dashboard, Coach Portal, B2B)
│   ├── Apple WatchKit (Watch Companion)
│   ├── Wear OS SDK (Android Watch)
│   └── Three.js (3D Übungsmodelle, Phase 3)
│
├── ⚙️ Backend
│   ├── Node.js + TypeScript (API Server)
│   ├── PostgreSQL (Nutzerdaten, Logs, Blutwerte)
│   ├── Redis (Cache, Sessions, Live-Workout-State)
│   ├── Meilisearch (Food-Suche, Übungs-Suche, <50ms)
│   └── SQLite (Offline-First, lokale Datenbank auf Gerät)
│
├── 🤖 KI & ML
│   ├── GPT-4o-mini (80% Chat-Anfragen, günstig)
│   ├── GPT-4o (20% komplexe Anfragen)
│   ├── Google Document AI (Blutwerte PDF OCR)
│   ├── GPT-4o-mini Vision (Mahlzeit-Foto-Erkennung)
│   ├── Kemtai API (Übungs-Formcheck, Computer Vision)
│   ├── TensorFlow Lite (On-Device Schlafphasen-Klassifikation)
│   └── Custom PPG Library (Handy-Kamera HRV)
│
├── 💳 Zahlungen
│   ├── Stripe Connect (Abos + Marktplatz-Splits)
│   ├── Apple IAP (In-App Purchases)
│   └── Google Play Billing
│
├── 📦 Speicher & Medien
│   ├── S3-kompatibel (Fotos, PDFs, Medien)
│   ├── CDN (statische Assets, Exercise Images)
│   └── libsodium (E2E-Verschlüsselung)
│
├── 🗄️ Datenquellen (alle kostenlos, Open Data)
│   ├── BLS 4.0 (7.140 Lebensmittel, 138 Nährstoffe, CC BY 4.0) — Food-DB Basis
│   ├── USDA FoodData Central (Anreicherung, Public Domain)
│   ├── Open Food Facts (Barcode-Mapping, ODbL)
│   ├── Fineli, CIQUAL, CoFID, Swiss NWD (EU-Anreicherung)
│   ├── free-exercise-db (800+ Übungen)
│   ├── wger.de SVG Muskelmaps
│   ├── NIH DSLD (100.000+ Supplement-Labels)
│   ├── NIH DailyMed (150.000+ Medikamenten-Labels)
│   ├── LOINC (90.000+ Labor-Codes)
│   ├── RxNorm (100.000+ Medikamente)
│   ├── SNOMED CT (350.000+ klinische Konzepte)
│   └── OpenFDA (Medikamenten-Wechselwirkungen)
│
├── 📱 Wearable-Integrationen
│   ├── Apple HealthKit (iOS)
│   ├── Google Health Connect (Android)
│   ├── WHOOP API (Phase 2)
│   ├── Oura API (Phase 2)
│   ├── Garmin Connect API (Phase 2)
│   └── Polar Flow API (Phase 2)
│
└── 🏗️ MVP-Kosten
    ├── Datenquellen: $0/Mo (alle Open Data, inkl. BLS 4.0 CC BY 4.0)
    ├── KI (LLM): 0,50-1,30$/Nutzer/Mo
    ├── KI (OCR): ~0,01$/Scan
    ├── KI (Formcheck): ~0,05$/Check
    ├── Hosting: Standard Cloud-Kosten
    └── Gesamt MVP bei 10.000 Nutzern: ~500-1.500$/Mo
```

---

*Dieses Dokument bildet die vollständige Zielarchitektur der Lumeos-Plattform ab. Jedes Feature, jede Verknüpfung und jede Monetarisierungsentscheidung ist durch über 160 Research-Dateien und die Analyse von 100+ Wettbewerbern untermauert.*

*Detaillierte Modul-Strategien: `/lumeos/research/{modul}/lumeos-{modul}-strategy.md`*
