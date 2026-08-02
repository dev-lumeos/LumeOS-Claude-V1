# Goals Module — Product Requirements Document

## Vision
Das Goals-Modul ist das strategische Zentrum von Lumeos. Hier definiert der User wo er hin will und trackt den Fortschritt mit Daten UND Bildern. Body Composition Tracker ist der erste und wichtigste Baustein.

## Problem Statement
Bodybuilder tracken ihren Fortschritt mit:
1. Waage (ungenau — sagt nichts über Zusammensetzung)
2. Spiegel (subjektiv — kein Vergleich über Zeit)
3. Random Fotos (inkonsistent — verschiedene Winkel, Licht, Posen)
4. Excel/Notizen (umständlich — keine Analyse)

Keine App kombiniert standardisierte Posen mit AI-Analyse und klassischen Messungen in einem System.

## Target User
- Ernsthafter Bodybuilder/Fitness-Athlet
- Trackt bereits Nutrition + Supplements in Lumeos
- Will objektiven Fortschritt sehen, nicht nur Gefühl
- Hat möglicherweise einen Coach der Fotos sehen will

## User Stories

### Epic 1: Klassische Messungen
| ID | Story | Priority |
|----|-------|----------|
| BC-01 | Als User will ich mein Körperfett% mit Methode loggen | MUST |
| BC-02 | Als User will ich meine Umfänge (13 Messpunkte) erfassen | MUST |
| BC-03 | Als User will ich FFMI und Schulter-Taille-Ratio automatisch berechnet sehen | MUST |
| BC-04 | Als User will ich Trend-Charts meiner Messungen über 30/90/180/365 Tage | MUST |
| BC-05 | Als User will ich Symmetrie-Scores (L/R Arm, L/R Bein) sehen | MUST |
| BC-06 | Als User will ich Zielwerte setzen und Fortschritt als Progress-Bar sehen | MUST |
| BC-07 | Als User will ich Delta-Anzeigen ("↑ 2.1cm seit letzter Messung") | SHOULD |
| BC-08 | Als User will ich meine Proportionen mit Idealwerten vergleichen | SHOULD |

### Epic 2: Visual AI (Kamera)
| ID | Story | Priority |
|----|-------|----------|
| BC-09 | Als User will ich eine Foto-Session mit vordefinierten Posen starten | MUST |
| BC-10 | Als User will ich ein Silhouetten-Overlay auf der Kamera sehen um die Pose korrekt einzunehmen | MUST |
| BC-11 | Als User will ich zwischen Posen-Sets wählen (Mandatory 8, Quarter Turns 4, Detail 10) | MUST |
| BC-12 | Als User will ich ein Foto per Timer aufnehmen (3/5/10s) | MUST |
| BC-13 | Als User will ich nach jedem Foto "Nochmal" oder "Weiter" wählen | MUST |
| BC-14 | Als User will ich eine AI-Analyse meines Fotos (Muskel-Scores, Conditioning, Symmetrie) | MUST |
| BC-15 | Als User will ich zwei Fotos gleicher Pose Side-by-Side vergleichen | MUST |
| BC-16 | Als User will ich einen Slider-Vergleich (vorher/nachher) | SHOULD |
| BC-17 | Als User will ich meine Fotos nach Pose, Datum oder Muskelgruppe filtern | MUST |
| BC-18 | Als User will ich einen AI-generierten Fortschritts-Report | SHOULD |
| BC-19 | Als User will ich Photo-Guidelines angezeigt bekommen (Licht, Distanz, Zeit) | MUST |
| BC-20 | Als User will ich Detail-Aufnahmen einzelner Muskelgruppen machen | SHOULD |

### Epic 3: Goals & Intelligence
| ID | Story | Priority |
|----|-------|----------|
| BC-21 | Als User will ich Ziele setzen (Gewicht, KFA%, Umfänge, visuell) | MUST |
| BC-22 | Als User will ich meinen Fortschritt zum Ziel als Prozent sehen | MUST |
| BC-23 | Als User will ich Deadline-Tracking für meine Ziele | SHOULD |
| BC-24 | Als User will ich Cross-Module Insights (Nutrition ↔ Body Composition) | SHOULD |
| BC-25 | Als User will ich eine Timelapse aus meinen Fortschrittsfotos | NICE |

## Milestones

### M1: Sprint 1 — Klassische Messungen (MVP)
**Zeitrahmen:** 1 Session
- DB Migration (body_measurements, body_circumferences, body_goals)
- Goals API auf Port 5900 (Hono)
- Seed Data (30 Tage Beispieldaten)
- UI: Goals Tab mit Sub-Navigation
- UI: Measurement Entry Form
- UI: Circumference Entry Form (13 Messpunkte)
- UI: Computed Values (FFMI, V-Taper, Symmetrie)
- UI: Trend Charts (Line Charts)
- UI: Goal Setting + Progress Bars
- i18n: DE/EN/TH

**Acceptance Criteria:**
- AC1: Körperkomposition erfassen (Gewicht, KFA%, Methode) → gespeichert in DB
- AC2: 13 Umfänge erfassen (L/R getrennt) → gespeichert in DB
- AC3: FFMI korrekt berechnet (Formel validiert)
- AC4: Schulter-Taille-Ratio angezeigt
- AC5: Symmetrie-Score L/R berechnet
- AC6: Trend-Chart zeigt historische Daten
- AC7: Ziel setzen → Progress-Bar zeigt Fortschritt
- AC8: Goals Tab sichtbar in Bottom Navigation
- AC9: i18n funktioniert für DE/EN/TH
- AC10: Build PASS

### M2: Sprint 2 — Visual AI
**Zeitrahmen:** 1-2 Sessions
- Photo Storage (lokales Filesystem + DB-Referenz)
- Photo Session Flow
- Kamera-Integration mit Overlay
- 22 Posen-Definitionen (8 Mandatory + 4 Quarter + 10 Detail)
- Claude Vision Integration für Analyse
- Galerie-Views
- Vergleichs-Tool

### M3: Sprint 3 — Intelligence
**Zeitrahmen:** 1 Session
- AI-Reports
- Cross-Module Insights
- Timelapse
- Goals vertiefen (mit Tom)

## Technical Architecture
- **API:** Hono auf Port 5900 (9. API-Server)
- **DB:** PostgreSQL via Supabase (Migration 016)
- **AI:** Claude Vision (claude-sonnet-4-20250514) für Foto-Analyse
- **Storage:** Fotos als Base64 in DB oder lokales Filesystem mit Pfad-Referenz
- **Frontend:** React + Tailwind + Zustand/TanStack Query

## Non-Functional Requirements
- Fotos werden NUR lokal gespeichert (Privacy!)
- Fotos werden NICHT an externe Server gesendet (ausser Claude Vision für Analyse)
- AI-Analyse ist optional (App funktioniert auch ohne)
- Offline-fähig für Messungen (sync wenn online)

## Risks
- Claude Vision Kosten bei vielen Fotos → Rate Limiting / User-Limit pro Tag
- Foto-Qualität variiert stark → Guidelines prominent anzeigen
- Silhouetten-Overlay Kalibrierung → einmalige Körpergrösse-Eingabe
- Storage-Bedarf bei vielen Fotos → Thumbnail-Generierung, Kompression
