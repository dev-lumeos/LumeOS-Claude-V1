# Goals Module — Spec

## Navigation
- **Neuer Bottom-Tab: "Goals"** (🎯) — Position 5 (nach Supplements, vor Recovery)
- **Sub-Navigation** (Header-Tabs):
  - Body Composition Tracker (Sprint 1)
  - [Zukünftig: Fitness Goals, Body Goals, Performance Goals, etc.]

---

## Feature: Body Composition Tracker

### Übersicht
Zwei komplementäre Tracking-Methoden für Bodybuilder:
1. **Klassisch (Manuell)** — Messungen, Körperfett%, Umfänge
2. **Visual AI (Kamera)** — Standardisierte Posen, AI-Analyse, automatisierte Reports

### Weg 1: Klassische Messungen

#### 1.1 Körperkomposition
- **Körperfett%** — Eingabe manuell (Caliper, DEXA, BIA, Schätzung)
  - Methode wählbar: Caliper (3/7-Falten), DEXA, BIA-Waage, Visuell, Hydrostatisch
  - Trend-Chart über Zeit
- **Muskelmasse (kg)** — Berechnet: Gewicht × (1 - Körperfett%/100)
- **Gewicht (kg)** — Verknüpft mit bestehendem Weight Tracking
- **BMI** — Automatisch berechnet (informativ, nicht Fokus)
- **FFMI** (Fat-Free Mass Index) — Berechnet: Muskelmasse / Größe² + 6.1 × (1.8 - Größe)
  - Natürlicher Bereich: 18-25, Elite: 25+
  - Wichtiger Indikator für Bodybuilder

#### 1.2 Umfänge (Circumference Measurements)
Alle in cm, links/rechts getrennt wo sinnvoll:
- **Hals** (Neck)
- **Schultern** (Shoulders) — breitester Punkt
- **Brust** (Chest) — Nippelhöhe
- **Oberarm** (Upper Arm) — L/R, gebeugt
- **Unterarm** (Forearm) — L/R, breitester Punkt
- **Taille** (Waist) — Nabelhöhe
- **Hüfte** (Hip) — breitester Punkt
- **Oberschenkel** (Thigh) — L/R, 15cm über Knie
- **Wade** (Calf) — L/R, breitester Punkt

#### 1.3 Verhältnisse & Scores
Automatisch berechnet aus Umfängen:
- **Schulter-Taille-Ratio** (Ziel: >1.618 = Goldener Schnitt)
- **Arm-Symmetrie** (L/R Differenz in %)
- **Bein-Symmetrie** (L/R Differenz in %)
- **V-Taper Score** (Schulter / Taille)
- **Proportions-Score** — Vergleich mit "idealen" Bodybuilding-Proportionen (Steve Reeves Formel)

#### 1.4 Trend-Analyse
- **Verlauf pro Messung** — Line Chart, 30/90/180/365 Tage
- **Delta-Anzeige** — "↑ 2.1cm seit letzter Messung"
- **Goal-Tracking** — Zielwerte setzen, Fortschritt anzeigen
- **Wöchentlicher/Monatlicher Durchschnitt**

---

### Weg 2: Visual AI (Kamera-basiert)

#### 2.1 Standardisierte Posen-Sets

##### A) Pflichtposen (8 IFBB Mandatory Poses)
Basierend auf offiziellen Wettkampf-Standards:

| # | Pose | Zeigt | Muskelgruppen |
|---|------|-------|---------------|
| 1 | **Front Double Biceps** | Arme oben, Bizeps geflext | Bizeps, Lats, Quads, Abs, Schultern |
| 2 | **Front Lat Spread** | Arme seitlich, Lats ausgebreitet | Lat-Breite, V-Taper, Brust, Quads |
| 3 | **Side Chest** (L/R) | Seitlich, Brust geflext | Brusttiefe, Schulter, Arm, Quad/Ham |
| 4 | **Rear Double Biceps** | Rücken, Arme oben geflext | Bizeps, Lats, Traps, Erector, Glutes, Hams, Waden |
| 5 | **Rear Lat Spread** | Rücken, Lats ausgebreitet | Rückenbreite, -dichte, Taper |
| 6 | **Side Triceps** (L/R) | Seitlich, Trizeps geflext | Trizeps, Obliques, Hams |
| 7 | **Abdominal & Thigh** | Frontal, Abs geflext, Bein vor | Abs, Quad-Definition, Serratus |
| 8 | **Most Muscular** | Alles geflext | Gesamtmuskulatur, Conditioning |

##### B) Progress-Standard-Posen (4 Quarter Turns)
Einfacher als Wettkampf, für regelmässige Check-ins:

| # | Pose | Beschreibung |
|---|------|-------------|
| 1 | **Front Relaxed** | Frontal, Arme locker seitlich, alles angespannt |
| 2 | **Right Side** | 90° rechts gedreht, Arme locker |
| 3 | **Back Relaxed** | Rücken zur Kamera, Arme locker |
| 4 | **Left Side** | 90° links gedreht, Arme locker |

##### C) Detail-Aufnahmen (Muscle Close-Ups)
Für spezifisches Tracking einzelner Muskelgruppen:

| # | Detail | Empfohlene Position |
|---|--------|-------------------|
| 1 | **Delts/Schultern** | Front, Arme seitlich leicht angehoben |
| 2 | **Bizeps** | Einzelner Arm gebeugt, Nahaufnahme |
| 3 | **Trizeps** | Seitlich oder Rück, Arm gestreckt |
| 4 | **Brust** | Front, Side Chest Light |
| 5 | **Abs** | Frontal, Vacuum oder Crunch |
| 6 | **Rücken** | Rear, Lat Spread Detail |
| 7 | **Quads** | Frontal, ein Bein vorgestellt |
| 8 | **Hamstrings** | Rück, ein Bein nach hinten |
| 9 | **Waden** | Seitlich, auf Zehenspitzen |
| 10 | **Unterarme** | Arm ausgestreckt, Faust geballt |

#### 2.2 Kamera-Overlay System

**Silhouetten-Overlay:**
- Halbtransparente Pose-Silhouette auf Kamera-Vorschau
- User richtet sich an Silhouette aus → konsistente Fotos
- Fuss-Markierungen, Arm-Winkel, Kopfposition
- Anpassbar an Körpergrösse (einmalig kalibrieren)

**Photo Guidelines (automatisch angezeigt):**
- Gleiche Tageszeit (morgens nüchtern empfohlen)
- Gleiche Beleuchtung (heller Hintergrund, dunkler Raum — oder umgekehrt)
- Gleiche Distanz (Markierung am Boden oder Timer + Stativ)
- Keine Selfies — Timer (10s) + Stativ/Ablage
- Alles flexen was die Kamera sieht

**Session-Flow:**
1. User wählt Posen-Set (Mandatory / Quarter Turns / Detail / Custom)
2. App zeigt erste Pose mit Overlay + Anleitung
3. Timer countdown (3/5/10s wählbar)
4. Foto wird aufgenommen
5. Quick-Review: "Nochmal?" oder "Weiter"
6. Nächste Pose → repeat
7. Session komplett → alle Fotos gespeichert mit Metadaten

#### 2.3 AI-Analyse (Claude Vision)

**Pro Foto:**
- Muskelgruppen-Erkennung + Scoring (1-10 pro Gruppe)
- Conditioning/Definition Level (1-10)
- Symmetrie-Analyse (L/R Vergleich)
- Geschätztes Körperfett% (visuell)
- Stärken/Schwächen-Identifikation

**Über Zeit (Vergleich):**
- Side-by-Side Overlay (2 Fotos gleiche Pose, verschiedene Daten)
- Slider-Vergleich (links/rechts wischen)
- Delta-Analyse: "Quads +15% Definition seit 01.01."
- Symmetrie-Trend: "Linker Bizeps holt auf, Differenz von 8% auf 3%"
- Gesamt-Fortschritts-Score

**AI-Report (wöchentlich/monatlich):**
- Zusammenfassung aller Posen
- Top 3 Verbesserungen
- Top 3 Fokus-Bereiche
- Empfehlungen basierend auf Goals
- Vergleich mit gesetzten Zielen
- Cross-Referenz mit Nutrition + Training Daten

#### 2.4 Foto-Galerie & Timeline
- **Kalender-View**: Tage mit Foto-Sessions markiert
- **Posen-View**: Alle Fotos einer bestimmten Pose chronologisch
- **Muskelgruppen-View**: Alle relevanten Fotos für z.B. "Rücken"
- **Vergleichs-Tool**: 2-4 Fotos nebeneinander, gleiche Pose
- **Timelapse**: Animation aus chronologischen Fotos gleicher Pose

---

### Datenmodell

#### Tabellen

**body_measurements**
```
id UUID PK
user_id UUID FK
date DATE
weight_kg DECIMAL
body_fat_pct DECIMAL
method VARCHAR (caliper_3, caliper_7, dexa, bia, visual, hydrostatic)
muscle_mass_kg DECIMAL (computed)
bmi DECIMAL (computed)
ffmi DECIMAL (computed)
notes TEXT
created_at TIMESTAMP
```

**body_circumferences**
```
id UUID PK
user_id UUID FK
date DATE
neck_cm DECIMAL
shoulders_cm DECIMAL
chest_cm DECIMAL
upper_arm_left_cm DECIMAL
upper_arm_right_cm DECIMAL
forearm_left_cm DECIMAL
forearm_right_cm DECIMAL
waist_cm DECIMAL
hip_cm DECIMAL
thigh_left_cm DECIMAL
thigh_right_cm DECIMAL
calf_left_cm DECIMAL
calf_right_cm DECIMAL
created_at TIMESTAMP
```

**body_photos**
```
id UUID PK
user_id UUID FK
session_id UUID FK → photo_sessions
pose_type VARCHAR (front_double_biceps, front_lat_spread, side_chest_left, side_chest_right, rear_double_biceps, rear_lat_spread, side_triceps_left, side_triceps_right, abdominal_thigh, most_muscular, front_relaxed, right_side, back_relaxed, left_side, detail_delts, detail_biceps, detail_triceps, detail_chest, detail_abs, detail_back, detail_quads, detail_hamstrings, detail_calves, detail_forearms)
image_path VARCHAR
thumbnail_path VARCHAR
ai_analysis JSONB
ai_scores JSONB
created_at TIMESTAMP
```

**photo_sessions**
```
id UUID PK
user_id UUID FK
date DATE
session_type VARCHAR (mandatory_8, quarter_turns, detail, custom)
photo_count INTEGER
notes TEXT
overall_ai_analysis JSONB
created_at TIMESTAMP
```

**body_goals**
```
id UUID PK
user_id UUID FK
goal_type VARCHAR (weight, body_fat, muscle_mass, circumference, visual)
target_value DECIMAL
target_metric VARCHAR
current_value DECIMAL
deadline DATE
status VARCHAR (active, achieved, paused)
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

### API Endpoints

#### Measurements API
```
GET    /api/goals/measurements?date=YYYY-MM-DD     — Messung für Datum
GET    /api/goals/measurements/history?days=N        — Verlauf
POST   /api/goals/measurements                       — Neue Messung speichern
PUT    /api/goals/measurements/:id                   — Messung bearbeiten
DELETE /api/goals/measurements/:id                   — Messung löschen
```

#### Circumferences API
```
GET    /api/goals/circumferences?date=YYYY-MM-DD    — Umfänge für Datum
GET    /api/goals/circumferences/history?days=N      — Verlauf
POST   /api/goals/circumferences                     — Neue Umfänge speichern
PUT    /api/goals/circumferences/:id                 — Bearbeiten
```

#### Photos API
```
POST   /api/goals/photos/session                     — Neue Foto-Session starten
POST   /api/goals/photos/upload                      — Foto hochladen (base64)
GET    /api/goals/photos/sessions                    — Alle Sessions
GET    /api/goals/photos/session/:id                 — Session-Details mit Fotos
GET    /api/goals/photos/pose/:poseType?limit=N      — Fotos einer Pose chronologisch
POST   /api/goals/photos/:id/analyze                 — AI-Analyse für ein Foto triggern
GET    /api/goals/photos/compare?ids=id1,id2         — Vergleich zweier Fotos
DELETE /api/goals/photos/:id                         — Foto löschen
```

#### AI Analysis API
```
POST   /api/goals/analysis/photo                     — Einzelfoto analysieren (Claude Vision)
POST   /api/goals/analysis/compare                   — 2 Fotos vergleichen (Claude Vision)
GET    /api/goals/analysis/report?period=weekly|monthly — AI-Report generieren
GET    /api/goals/analysis/scores/history             — Score-Verlauf über Zeit
```

#### Goals API
```
GET    /api/goals/targets                            — Alle aktiven Ziele
POST   /api/goals/targets                            — Neues Ziel setzen
PUT    /api/goals/targets/:id                        — Ziel bearbeiten
DELETE /api/goals/targets/:id                        — Ziel löschen
GET    /api/goals/targets/:id/progress               — Fortschritt zum Ziel
```

#### Dashboard API
```
GET    /api/goals/dashboard                          — Übersicht: letzte Messung, Scores, Trends, nächstes Ziel
```

---

### UI Struktur

#### Goals Tab (Bottom Navigation)
```
🎯 Goals
├── Sub-Nav: Body Composition | [Fitness Goals] | [Performance] | ...
│
├── Body Composition Tracker
│   ├── Overview Card (letzte Werte, Score, Quick-Stats)
│   ├── Tab: Messungen
│   │   ├── Neue Messung erfassen
│   │   ├── Aktuelle Werte + Deltas
│   │   ├── Verhältnisse & Scores (V-Taper, Symmetrie, FFMI)
│   │   └── Trend Charts
│   ├── Tab: Fotos
│   │   ├── Neue Session starten
│   │   ├── Posen-Auswahl mit Overlay-Preview
│   │   ├── Kamera mit Silhouetten-Overlay
│   │   ├── Session-Review
│   │   ├── Galerie (Kalender / Pose / Muskelgruppe)
│   │   └── Vergleichs-Tool (Side-by-Side, Slider)
│   ├── Tab: AI Report
│   │   ├── Letzter Report
│   │   ├── Muskelgruppen-Scores
│   │   ├── Fortschritts-Zusammenfassung
│   │   └── Empfehlungen
│   └── Tab: Ziele
│       ├── Aktive Ziele mit Progress-Bars
│       ├── Neues Ziel setzen
│       └── Archivierte/erreichte Ziele
```

---

### Konkurrenz-Analyse

| App | Stärke | Schwäche | Unser Vorteil |
|-----|--------|----------|--------------|
| **Vscale** | AI Muskel-Scoring | Nur Front/Back, keine Posen-Standards | 8 Mandatory + Details + Overlay |
| **ZOZOFIT** | 3D Body Scan | Braucht speziellen Anzug ($40+) | Nur Handy-Kamera nötig |
| **Bodymapp** | 3D Measurements | Teuer, keine Bodybuilding-Posen | BB-spezifisch, gratis |
| **BodyType Photo AI** | 20+ Measurements | Kein Posen-Standard, kein Vergleich | Standardisierte Posen + Timeline |
| **Rate My Physique** | Community Rating | Keine AI-Analyse | Echte AI-Analyse, privat |

**Unser USP:** Einzige App die standardisierte Bodybuilding-Posen mit Silhouetten-Overlay, AI-Analyse UND klassischen Messungen kombiniert — integriert in ein Gesundheits-Ökosystem (Nutrition, Supplements, Recovery).

---

### i18n Keys (DE/EN/TH)
- Alle Posen-Namen
- Muskelgruppen-Namen
- Messwert-Labels
- AI-Report Texte
- Photo Guidelines
- Goal-Status Texte

---

### Cross-Module Integration
- **Nutrition** → Kaloriendefizit/-überschuss korreliert mit Körperfett-Trend
- **Supplements** → Kreatin-Einnahme korreliert mit Gewicht/Wassereinlagerung
- **Recovery** → Übertraining sichtbar in Muskel-Scores
- **AI Coach** → Nutzt Body Composition Daten für Empfehlungen
- **Medical** → Hormonwerte (Testosteron) korreliert mit Muskelaufbau-Rate
- **Training** → Volume/Intensity korreliert mit Muskelgruppen-Development

---

### Phasen

**Sprint 1 (MVP):**
- DB Migration + Seed
- Goals API (Measurements, Circumferences, Goals)
- UI: Messungen erfassen + Trends
- UI: Umfänge erfassen + Verhältnisse
- Goals Tab in Bottom Navigation

**Sprint 2 (Visual AI):**
- Photo API + Storage
- Kamera mit Posen-Overlay
- Session-Flow (8 Mandatory + Quarter Turns)
- AI-Analyse via Claude Vision
- Galerie + Vergleichs-Tool

**Sprint 3 (Intelligence):**
- AI-Reports (wöchentlich/monatlich)
- Cross-Module Insights
- Timelapse-Generator
- Detail-Aufnahmen
- Goals deepened (wird mit Tom vertieft)
