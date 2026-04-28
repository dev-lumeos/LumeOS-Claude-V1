# Training Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Exercise Library — Suchen & Entdecken

```
1. User öffnet Tab "Exercises"
2. Interface zeigt:
   - Suchfeld
   - Kategorie-Filter (horizontal scrollbar): [Alle] [Bodyweight] [Free Weights] [Resistance] [Cardio] [Stretching]
   - Filter: [Muskel ▾] [Equipment ▾] [Schwierigkeit ▾]
   - Virtualisierte Exercise-Liste (1.200+ Items)

3. Suche: Eingabe → debounced pg_trgm (Name + Alias + Muskel)
4. Filter: Kategorie / Muskelgruppe / Equipment (kombinierbar)

5. Exercise-Karte zeigt:
   - Start-Bild (Male/Female je nach User-Setting)
   - Name, Kategorie, Primary Muscle, Equipment

6. Tap → Exercise Detail
```

### Exercise Detail

```
┌─────────────────────────────────┐
│ ← Zurück         [+ Zur Routine]│
│ [📷 Start] ←→ [📷 End]          │  ← Toggle/Swipe
│ (oder 🎬 Video wenn vorhanden)  │
│                                  │
│ Barbell Bench Press              │
│ Brust · Free Weights             │
│ Schwierigkeit: ●●○ Mittel        │
│ Evaluation Score: 94/100         │  ← Exercise Evaluation Score
│                                  │
│ ─── Muskeln ─────────────────── │
│ Primär: Pectoralis Major         │
│ Sekundär: Trizeps, vord. Deltoid │
│ [Muscle Map Visualization]       │
│                                  │
│ ─── Instructions ────────────── │
│ 1. Lege dich auf eine Bank...    │
│ 2. Greife die Stange...          │
│                                  │
│ ─── Pro Tips ────────────────── │
│ 💡 Schulterblätter zusammen      │
│ 💡 Nicht vom Brustkorb abfedern  │
│                                  │
│ ─── Häufige Fehler ──────────── │
│ ⚠️ Zu breiter Griff              │
│                                  │
│ ─── Deine History ───────────── │
│ Best 1RM: 100kg (Feb 20)         │
│ Letztes Mal: 90kg × 8 (Feb 24)  │
│ [📊 Fortschritts-Chart]          │
│                                  │
│ SFR-Rating: Hoch  Stretch: ✓     │
└─────────────────────────────────┘
```

---

## Flow 2: Routine erstellen

```
1. Tab "Routines" → "+ Neue Routine"
2. Basis-Info:
   - Name, Beschreibung
   - Kategorie: Kraft / Hypertrophie / Powerlifting / Ausdauer / Custom
   - Tags: Push / Pull / Legs / Upper / Lower / Full Body
   - Tage/Woche

3. Exercises hinzufügen:
   a. "+ Exercise" → Exercise Library öffnet sich (Flow 1)
   b. Exercise auswählen → zurück zur Routine
   c. Soll-Werte einstellen:
      - Target Sets × Reps (z.B. "4 × 8-10")
      - Rest Timer
      - RPE-Ziel (optional)
      - Progression Model

4. Reihenfolge anpassen:
   - Move Up / Move Down (Pfeile)
   - Drag & Drop (v2)

5. Supersets markieren:
   - Exercise A → [Superset ↔] → wählt Exercise B
   - Beide bekommen gleiche superset_group

6. Estimated Duration (auto-berechnet): Sets × (Avg Rep Duration + Rest)
7. Speichern → training.routines

8. Optional: Wochenplan zuweisen (Flow 6)
```

---

## Flow 3: Routine aus Quelle (Coach / Marketplace / Buddy)

```
Coach:
1. Coach erstellt Routine im Human Coach Modul
2. Weist User zu → training.routines mit source='coach'
3. User sieht Routine unter "Von Coach" Section (read-only)
4. User kann [▶ Workout starten] oder [📋 Details anzeigen]

Marketplace:
1. User kauft Routine-Programm im Marketplace
2. Nach Kauf → training.routines mit source='marketplace'
3. Identischer Zugriff wie eigene Routine

Buddy:
1. User sagt: "Erstell mir einen 3-Tage PPL Plan"
2. Buddy generiert Routine via API
3. User sieht Vorschau → bestätigt → aktiviert
4. source='buddy'
```

---

## Flow 4: Workout starten

```
1. Von "Routines" Tab: [▶ Workout starten] auf Routine-Karte
   ODER
   Von "Workouts" Tab: [+ Blanko Workout] (ohne Routine)

2. Session wird angelegt (status: 'active')
3. Live Workout öffnet sich (Flow 5)
```

---

## Flow 5: Live Workout

### State Machine
```
IDLE
  ↓ [Start]
SESSION_START
  ↓
EXERCISE_INTRO     ← Übungs-Name, Start-Bild, Previous Performance
  ↓
SET_ACTIVE         ← Eingabefelder: kg / Reps (+ RPE/RIR optional)
  ↓ [✓ Set Done]
SET_COMPLETE       ← PR-Check, Volume-Update
  ↓
REST               ← Auto-Countdown (konfigurierbar, Superset: 0s)
  ├──[NEXT_SET]──→ SET_ACTIVE
  └──[NEXT_EXERCISE]──→ EXERCISE_INTRO
         ↓
     SESSION_COMPLETE
         ↓
     SUMMARY → IDLE
```

### Logging-Screen (Strong-inspiriert)

```
┌─────────────────────────────────┐
│ Push Day              ⏱ 32:15  │
├─────────────────────────────────┤
│ ✅ Barbell Bench Press           │
│ ┌────┬────────┬──────┬────────┐ │
│ │Set │ Prev   │  kg  │ Reps   │ │
│ ├────┼────────┼──────┼────────┤ │
│ │ 1✅│ 90×8  │ [90] │ [8]    │ │ ← Prev aus letzter Session
│ │ 2✅│ 90×8  │ [95] │ [7]    │ │
│ │ 3  │ 85×10 │ [  ] │ [  ]   │ │ ← Aktueller Set
│ └────┴────────┴──────┴────────┘ │
│ [+ Set]          [RPE ▾] [RIR ▾]│
│                                  │
│ ⏳ Rest: 1:23 / 1:30 [Skip]     │
│                                  │
│ ─────────────────────────────── │
│ ◻ Incline DB Press  3×10-12  60s│ ← Nächste Übung
│ ◻ Cable Fly ↔ Push-Up  (SS)    │ ← Superset (farbig markiert)
├─────────────────────────────────┤
│ [🏁 Workout abschliessen]       │
└─────────────────────────────────┘
```

### Key UX-Details
- **Previous-Spalte:** Letzter Session-Wert vorausgefüllt → Progressive Overload sichtbar
- **PR Detection:** Automatisch nach jedem Set (estimated_1rm, max_weight, max_reps)
- **PR Celebration:** 🎉 Animation + Ton bei neuem PR
- **Warmup Sets:** optional, zählen nicht zur Volume-Berechnung
- **Drop Sets:** markiert, Gewicht auto-reduziert
- **Superset Flow:** Nach Set A → direkt zu Set B (Rest = 0s), nach B → voller Rest
- **Plate Calculator:** Button zeigt Hantelscheiben-Komposition für gewähltes Gewicht
- **RPE/RIR:** Progressive Disclosure — Default nicht sichtbar, aktivierbar per Button

---

## Flow 6: Wochenplan konfigurieren

```
1. Routine öffnen → [📅 Plan konfigurieren]
2. Kalender-Grid (Mon–Son)
3. Drag-and-drop Routine auf Wochentag
4. Split-Typ:
   - Sequentiell: immer Woche 1 → Woche 2 → Woche 3 → repeat
   - Wochentag-fix: Montag = Push, Mittwoch = Pull, Freitag = Legs
5. Speichern → training.routine_schedule_days
6. "Nächste Workout"-Widget auf Home zeigt nächsten Trainingstag
```

---

## Flow 7: Workout abschliessen + Summary

```
1. User tippt [🏁 Workout abschliessen]
2. Summary-Screen:
   ┌──────────────────────────────┐
   │ 🎉 Workout abgeschlossen!    │
   │                              │
   │ Dauer: 47 min                │
   │ Volumen: 12.450 kg           │
   │ Sätze: 18 absolviert         │
   │                              │
   │ 🏆 Neue PRs:                 │
   │   Bench Press: 95kg × 7      │
   │   (Est. 1RM: 117kg +2kg)     │
   │                              │
   │ Muskelverteilung:            │
   │ Brust 45% ■■■■□             │
   │ Trizeps 30% ■■■□□           │
   │ Schultern 25% ■■□□□         │
   │                              │
   │ Volume vs. letzte Woche: +5% │
   └──────────────────────────────┘

3. Post-Workout Feedback (optional, aber empfohlen):
   ┌──────────────────────────────┐
   │ Wie war der Pump?            │
   │ Brust:    [1] [2] [3]        │
   │ Trizeps:  [1] [2] [3]        │
   │                              │
   │ Wie ist die Session gelaufen?│
   │ [🏆 Besser] [😐 Gleich] [😩]│
   └──────────────────────────────┘

4. Training Load → Recovery Modul (async)
5. Workout-Kontext → Nutrition Modul (async)
6. Compliance → Goals Modul (async)
```

---

## Flow 8: Personal Records History

```
1. Tab "Stats" → "PRs"
2. Liste aller Exercises mit aktuellem PR
3. Filter: Muskelgruppe, Zeitraum
4. Tap auf Exercise → PR-Verlauf Chart
   - Y-Achse: Estimated 1RM
   - X-Achse: Datum
   - PR-Punkte hervorgehoben
5. "Top PRs diese Woche" auf Home-Widget
```

---

## Flow 9: Stats & Volume Analytics

```
1. Tab "Stats"
2. Sub-Views:
   a. Volume — Wöchentliches Volumen per Muskelgruppe (Balken-Chart, 8 Wochen)
   b. PRs — Stärke-Verlauf (1RM Chart per Exercise)
   c. Balance — Push/Pull/Legs Verteilung (Pie Chart + Imbalance-Alert)
   d. Frequenz — Sessions/Woche, Streak Counter
   e. Landmarks — MV/MEV/MAV/MRV per Muskelgruppe mit aktuellem Status

3. Volume Landmarks View:
   ┌────────────────────────────────┐
   │ Brust — diese Woche: 14 Sätze │
   │ ████████████░░░░ MAV: 16       │
   │ MV: 8  MEV: 10  MAV: 16  MRV: 22│
   │ Status: OPTIMAL ✅              │
   ├────────────────────────────────┤
   │ Rücken — diese Woche: 6 Sätze  │
   │ ██████░░░░░░░░░░ MEV: 10       │
   │ Status: UNTER MEV ⚠️            │
   │ "Mehr Pull-Exercises empfohlen" │
   └────────────────────────────────┘
```

---

## Flow 10: Progressive Overload Vorschlag

```
1. User startet Workout → Set-Eingabe-Screen
2. System lädt ExerciseProgressionConfig für diese Übung
3. "Vorheriges Mal" Spalte zeigt letzten Wert
4. System berechnet Vorschlag basierend auf Modell:
   - Linear: +2.5kg wenn alle Sets in Rep-Range
   - Double: erst Reps erhöhen bis max, dann +2.5kg
   - RPE-based: Gewicht so dass RPE ≈ targetRPE
5. Vorschlag wird HELLGRAU vorausgefüllt — User kann ändern

6. Nach Session: Analyse ob Progression erfolgt:
   - Progression ✓ → nächstes Modell-Level vorbereiten
   - Stagnation (3× kein Fortschritt) → Deload vorschlagen
   - RPE > 9 konsistent → Volumen-Reduktion vorschlagen
```

---

## Flow 11: Post-Workout Feedback → Personalisierung

```
1. Nach Workout Summary (Flow 7, Schritt 3)
2. Pump-Feedback: 1=niedrig, 2=mittel, 3=hoch pro Muskelgruppe
3. Soreness-Feedback (am nächsten Tag): 1=nichts, 2=leicht, 3=stark
4. System updatet VolumeLandmark:
   - Hoher Pump + wenig Soreness → MAV kann steigen
   - Starke Soreness + geringer Pump → MRV-Warnung
5. Buddy-Kontext: "Dein persönliches MAV für Brust: 18 Sets/Woche (Ø 14)"
```

---

## Flow 12: AI Workout Generation

```
1. User hat keine Routine oder will Abwechslung
2. Tab "Workouts" → "AI Workout generieren"
3. Buddy fragt (oder liest aus Profil):
   - Ziel: Kraft / Hypertrophie / Ausdauer
   - Verfügbare Zeit: 30 / 45 / 60+ Minuten
   - Equipment: Gym / Home / Bodyweight
   - Welche Muskeln today?
4. System generiert Routine (rules-based + Exercise Evaluation Scores)
5. Vorschau mit Exercises + Soll-Werten
6. User bestätigt → Workout startet (Flow 5)
   ODER speichert als neue Routine
```

---

## Flow 13: Pending Actions (TODO-System)

```
GET /api/training/pending-actions

Response:
{
  "date": "2026-04-15",
  "pending": [
    {
      "type": "log_workout",
      "priority": "normal",
      "label": "Pull Day steht heute an",
      "routine_id": "uuid",
      "routine_name": "Pull Day",
      "scheduled_time": "18:00",
      "action_url": "/training?start=uuid"
    },
    {
      "type": "post_feedback",
      "priority": "normal",
      "label": "Feedback für gestriges Workout ausstehend",
      "session_id": "uuid",
      "action_url": "/training/sessions/uuid/feedback"
    }
  ]
}
```
