# SPEC: Coach Buddy — The Killer Feature

> **Vision:** Lumeos Coach Buddy ist kein Chatbot. Es ist ein virtueller Trainingspartner der den User besser kennt als jeder menschliche Coach es könnte — weil er ALLES sieht: Schlaf, Ernährung, Blutwerte, Training, Recovery, Stimmung. Und der 24/7 da ist.

> **⚠️ DOKUMENTTYP: Strategische Zielarchitektur — nicht MVP-Scope.**
> Dies ist das North Star Architecture Document. Es definiert WO das System in 3-5 Jahren steht. Es ist der Kompass, nicht der Sprint-Plan. MVP-Scope ist markiert in der Roadmap (Kapitel 11). Alles darüber hinaus ist Zukunftsschicht. Jede Produktentscheidung wird an einer Frage gemessen: **Macht es den User stabiler?**

**Status:** DRAFT v1.2
**Erstellt:** 2026-02-28
**Autor:** Jarvis (Architektur) + Tom (Vision/Review)
**Priorität:** CRITICAL — Produkt-Differenzierung & Monetarisierung
**v1.1:** Medical Safety Gate, Decision Boundary, Output Contract, Event Model, Structured Memory, Cost Model, Gold Path Tests
**v1.2:** Policy-Konsistenz-Fixes (Supplement Dosing, Cross-Modul Beispiele, Evidence-Pflicht, Action→Event Binding, Privacy Consent, Scientist Personality Guard)
**v1.3:** Reminder-Scope, Lab Reference Ranges, Evidence nur in UI Cards, Action Result Model, Risk-Claim Cleanup, Medication Gate
**v1.4:** Blutwert↔Supplement Entkopplung, Overreaching-Label entfernt, Scientist No-Cite Rule, realistische Kostenrechnung, Emotional Coherence Model, Local-First Architektur-Prinzip
**v1.5:** Adaptive Intervention Engine, Behavioral Signature, Predictive Micro-Timing, Identity Reinforcement Loop — der echte Moat
**v1.6:** Manipulation Guard + max_intervention_intensity, BSS = Stability × Goal Alignment, Signature Confidence Levels, intervention_load_7d, Strategische Vision (Behavior Engine > Fitness App)

---

## 1. Produkt-Definition

### 1.1 Was Coach Buddy IST
- Ein persistenter, personalisierter AI-Coach der den User KENNT
- Eine Beziehung, kein Tool
- Ein Trainingspartner der durch Workouts führt (Voice)
- Ein Ernährungsberater der weiss was der User mag und braucht
- Ein Accountability-Partner der nicht aufgibt
- Ein Wissenschaftler der evidenzbasiert empfiehlt

### 1.2 Was Coach Buddy NICHT IST
- Kein generischer Chatbot mit Fitness-Prompt
- Kein statischer Meal-/Workout-Plan-Generator
- Kein Ersatz für medizinische Beratung (klar kommuniziert)
- Kein Ja-Sager — der Coach hat eine Meinung und vertritt sie

### 1.3 Kern-Differenzierung
| Feature | Andere Apps | Coach Buddy |
|---|---|---|
| Ernährungsplan | Statisch, generisch | Dynamisch, kennt Vorlieben, passt täglich an |
| Workout-Führung | Text-Anweisungen | Live Voice, zählt mit, motiviert, korrigiert |
| Personalisierung | Name + Ziel | Persönlichkeit, Humor, erinnert sich an alles |
| Proaktivität | Push "Trink Wasser" | "Du hast gestern schlecht geschlafen. Heute weniger Volumen, dafür Technik-Fokus." |
| Daten-Nutzung | Silos | Cross-Modul: Schlaf beeinflusst Workout beeinflusst Nutrition |
| Beziehung | Keine | Kennt Meilensteine, Struggles, Witze, Geschichte |

---

## 2. User Profile System ("Coach kennt seinen Schützling")

### 2.1 Profile Layers

```
Layer 1: STATIC (bei Onboarding erfasst)
├── Name, Alter, Geschlecht, Größe, Gewicht
├── Ziel (Bulk/Cut/Recomp/Maintain/Performance)
├── Trainingserfahrung (Beginner/Intermediate/Advanced)
├── Trainingsfrequenz & bevorzugte Zeiten
├── Equipment-Verfügbarkeit (Home/Commercial Gym/Minimal)
├── Sprache & Kommunikationsstil-Präferenz
└── Coach-Name & Persönlichkeits-Wahl

Layer 2: PREFERENCES (wächst über Zeit)
├── Essens-Vorlieben: ["liebt Reis", "hasst Brokkoli", "vegetarisch Mo/Mi"]
├── Essens-Allergien/Intoleranzen: ["laktoseintolerant", "Nussallergie"]
├── Übungs-Präferenzen: ["mag keine Lunges", "liebt Cable Flys"]
├── Supplement-Präferenzen: ["keine Kapseln, nur Pulver", "Budget max 50€/Monat"]
├── Zeitfenster: ["kann nur 45min trainieren", "Meal Prep sonntags"]
├── Kommunikation: ["morgens kurz", "abends ausführlich", "Humor erwünscht"]
└── Motivations-Triggers: ["Fortschritts-Zahlen motivieren", "Vergleiche mit sich selbst, nicht anderen"]

Layer 3: HISTORY (automatisch aus App-Daten)
├── Trainingshistorie: Alle Workouts, Sets, Reps, Gewichte, RPE
├── Ernährungshistorie: Meals, Makros, Adherence-Rate
├── Körperdaten: Gewichtsverlauf, Fotos, Messungen, DEXA-Scans
├── Blutwerte: Alle Lab-Results mit Zeitverlauf
├── Supplement-Zyklen: Was genommen, wie lange, Wirkung
├── Schlaf-Daten: Dauer, Qualität (wenn verfügbar via HealthKit/Wearable)
├── Recovery-Scores: Subjektive Check-ins, HRV (wenn verfügbar)
├── Verletzungen: Historie, aktuelle Einschränkungen
└── Stimmung/Wellness: Tägliche Check-in Ratings

Layer 4: RELATIONSHIP (Coach-spezifisch)
├── Gesprächs-Historie: Zusammenfassungen wichtiger Gespräche
├── Meilensteine: PRs, Streaks, Transformations-Punkte
├── Inside References: Wiederkehrende Themen, Witze, Motivations-Anker
├── Coaching-Feedback: Was funktioniert hat, was nicht
├── Trust Level: Wie viel "harter Push" der User verträgt (lernt über Zeit)
└── Persönliche Context-Notizen: "hat Prüfungsphase", "Urlaub nächste Woche", "Beziehungsstress"
```

### 2.2 Profile-Speicherung

```
Tabellen:
- user_coach_profile (1:1 mit users)
  - coach_name: VARCHAR(50)
  - coach_personality: ENUM('drill_sergeant', 'best_friend', 'scientist', 'motivator', 'zen_master')
  - communication_style: JSONB {humor: bool, directness: 1-5, detail_level: 1-5, language: 'de'|'en'|'th'}
  - wake_word: VARCHAR(50) — custom oder default

- user_preferences (1:n mit users)
  - category: ENUM('food_like', 'food_dislike', 'food_allergy', 'exercise_like', 'exercise_dislike', 'supplement_pref', 'schedule', 'motivation', 'communication')
  - key: VARCHAR(100)
  - value: TEXT
  - learned_at: TIMESTAMP — wann der Coach das gelernt hat
  - source: ENUM('onboarding', 'conversation', 'behavior', 'explicit') — wie gelernt

- user_milestones (1:n)
  - type: ENUM('pr', 'streak', 'body', 'habit', 'social', 'custom')
  - title: VARCHAR(200)
  - description: TEXT
  - achieved_at: TIMESTAMP
  - celebrated: BOOLEAN — hat der Coach es angesprochen?

- coach_memory (1:n) — RAG-gespeichert
  - user_id, content, category, importance, timestamp
  - → Wird als Vektor-Embedding im RAG gespeichert
  - → Coach sucht bei jeder Interaktion relevanten Kontext
```

### 2.3 Preference Learning

Der Coach lernt PASSIV aus Verhalten:
- User loggt nie Frühstück → "Frühstücks-Skipper" (Intermittent Fasting?)
- User trainiert immer 7:00 → "Morgen-Trainierer"
- User wählt immer Dumbbell über Barbell → "bevorzugt Dumbbells"
- User ignoriert Supplement-Reminders → Reminder-Frequenz reduzieren
- User loggt 3x/Woche Reis → Reis in Meal Plans priorisieren

Und AKTIV aus Gesprächen:
- "Ich mag keinen Fisch" → food_dislike: fish, source: conversation
- "Lunges tun meinem Knie weh" → exercise_dislike: lunges, injury_note: knee_pain
- "Abends kann ich nie trainieren" → schedule: no_evening_training

---

## 3. Voice I/O System

### 3.1 Architektur

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Mikro  │────▶│  STT Engine  │────▶│  Coach Brain │
│  (EarPods)   │     │  (Whisper)   │     │  (LLM + RAG) │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
┌─────────────┐     ┌──────────────┐             │
│  User Ears   │◀────│  TTS Engine  │◀────────────┘
│  (EarPods)   │     │  (Streaming) │
└─────────────┘     └──────────────┘
```

### 3.2 STT (Speech-to-Text)

**Option A: On-Device (bevorzugt für Latenz)**
- Apple Speech Framework (iOS native, kostenlos, offline-fähig)
- Whisper.cpp (on-device, ~500MB Modell, <1s Latenz)
- Vorteil: Kein Server-Roundtrip, funktioniert im Gym ohne WLAN

**Option B: Cloud (Fallback für Genauigkeit)**
- OpenAI Whisper API ($0.006/min)
- Deepgram ($0.0043/min, schneller)
- Latenz: 500ms-2s

**Gym-spezifische Herausforderungen:**
- Hintergrundmusik/Lärm → Noise Cancellation Preprocessing
- Kurze Commands ("Fertig", "26 Kilo", "Nächste") → Command-Recognition-Modus
- Lange Fragen ("Was soll ich heute essen?") → Full Transcription Modus

**Command Recognition (Low-Latency Path):**
```
Erkannte Commands (kein LLM nötig, Pattern Matching):
- "Fertig" / "Done" / "Set" → Set abgeschlossen
- "[Zahl] Kilo/Pounds" → Gewicht loggen
- "[Zahl] Reps/Wiederholungen" → Reps loggen
- "Nächste" / "Next" / "Skip" → Nächste Übung
- "Pause" / "Stop" → Workout pausieren
- "Wie viel?" / "Was war das?" → Letzte Info wiederholen
- "Timer [Zahl]" → Rest Timer starten
- RPE-Werte: "RPE 8" / "War schwer" / "War leicht"
```

### 3.3 TTS (Text-to-Speech)

**Anforderungen:**
- Natürliche Stimme (kein Roboter)
- Emotionale Variation: Motivierend, ruhig, feiernd, bestimmt
- Streaming: Erste Silbe <500ms nach LLM-Start
- Mehrsprachig: DE, EN, TH

**Optionen:**
| Provider | Qualität | Latenz | Kosten | Streaming |
|---|---|---|---|---|
| ElevenLabs | Exzellent | 300ms | $0.30/1k chars | ✅ |
| OpenAI TTS | Sehr gut | 500ms | $0.015/1k chars | ✅ |
| Google Cloud TTS | Gut | 200ms | $0.016/1k chars | ✅ |
| Apple AVSpeech | OK | Instant | $0 | ✅ (on-device) |
| Coqui/Local | Variabel | 100ms | $0 | ✅ |

**Empfehlung:**
- Phase 1: OpenAI TTS (gute Qualität, günstig, streaming)
- Phase 2: ElevenLabs für Premium-Tier (Voice Cloning, emotionaler)
- Fallback: Apple AVSpeech offline (Gym ohne Internet)

### 3.4 Voice-Persönlichkeiten

```
DRILL SERGEANT:
- "Los, noch 3 Reps! Die Stange bewegt sich nicht von alleine!"
- "Das war leicht für dich. 2 Kilo mehr nächstes Mal."
- "Keine Ausreden heute. Wir sind hier um zu arbeiten."

BEST FRIEND:
- "Alter, das war stark! 11 Reps bei 80 Kilo, neuer PR!"
- "Kein Stress, jeder hat mal einen schlechten Tag. Morgen wird besser."
- "Weisst du was? Lass uns heute was anderes machen. Du siehst müde aus."

SCIENTIST:
- "Basierend auf deinem Schlaf von 5.8 Stunden empfehle ich heute weniger Volumen. Dein Körper braucht mehr Erholung."
- "Incline bei 30-45 Grad aktiviert den oberen Brustanteil stärker als Flat."
- "Deine Trainingsfrequenz liegt bei 2x pro Muskelgruppe — das ist ein guter Wert für Hypertrophie."

> **⚠️ Scientist Personality Guard:**
> - Der Scientist darf Training, Nutrition und Trainingsplanung **erklären**, nicht **referenzieren**
> - ❌ "EMG-Studien zeigen..." / "Meta-Analysen belegen..." / "Laut Forschung..."
> - ✅ "Der Winkel aktiviert diesen Muskel stärker." / "Deine Frequenz ist gut für Hypertrophie."
> - Wenn User fragt "Warum?" → Evidence Card (UI), nicht Zitat im Speech
> - Sobald Lab-Werte, medizinische Marker oder Symptome → Medical Gate übersteuert und neutralisiert den Ton komplett

MOTIVATOR:
- "Du bist 12 Wochen dabei. Erinnerst du dich an Tag 1? Der Typ im Spiegel wäre stolz auf dich."
- "5 Uhr morgens aufgestanden fürs Training. Das machen 2% der Leute. Du gehörst dazu."
- "Diese letzte Rep entscheidet ob du besser wirst oder gleich bleibst. Deine Wahl."

ZEN MASTER:
- "Spüre die Kontraktion. Langsam runter. Kontrolliere das Gewicht, nicht umgekehrt."
- "Heute keine Zahlen. Spür in deinen Körper rein. Was braucht er?"
- "Fortschritt ist nicht linear. Vertrau dem Prozess."
```

---

## 4. Live Workout Session Mode

### 4.1 Session State Machine

```
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST → 
  ├── NEXT_SET → SET_ACTIVE (loop)
  └── NEXT_EXERCISE → EXERCISE_INTRO (loop)
      └── SESSION_COMPLETE → SUMMARY → IDLE
```

### 4.2 Session Flow (Detail)

```
SESSION_START:
  Coach: "Hey [Name]! Ready für [Workout-Name]? Heute: [Übungs-Liste].
          Basierend auf letzter Woche habe ich [Anpassung].
          [Optional: Recovery-Check] Wie fühlst du dich? 1 bis 5?"
  User: "4"
  Coach: "Gut, 4 von 5. Wir machen vollen Plan. Los geht's!"

EXERCISE_INTRO:
  Coach: "Nächste Übung: Incline Dumbbell Press.
          Letztes Mal: 24 Kilo, 4 Sets, 10-10-9-8 Reps.
          Heute: Versuch 26 Kilo. Du bist bereit.
          [Optional: Technik-Cue] Denk dran: Schulterblätter zusammen, kontrollierte Eccentric."
  
SET_ACTIVE:
  Coach: "[schweigt während Set — kein Gequatsche]"
  Coach (bei letzten Reps, wenn nötig): "Noch 2! Komm! Und noch einen! STAAARK!"
  
SET_COMPLETE:
  User: "Fertig" / drückt Button
  Coach: "Gewicht?"
  User: "26"
  Coach: "Reps?"
  User: "10"
  Coach: "RPE?"
  User: "8" / "War machbar"
  Coach: "26 Kilo, 10 Reps, RPE 8. Neuer PR bei Incline! 💪
          90 Sekunden Pause. [Timer startet]"

REST:
  Coach (bei 30s remaining): "30 Sekunden noch."
  Coach (bei 10s): "10 Sekunden. Nächster Set."
  Coach (bei 0): "Los geht's! Set 2 von 4. Gleiche Energie."
  [User kann auch sagen: "Mehr Zeit" → +30s / "Ready" → sofort]

SESSION_COMPLETE:
  Coach: "Workout fertig! Hier dein Zusammenfassung:
          - 45 Minuten, 5 Übungen, 20 Sets
          - 2 neue PRs: Incline Press 26kg, Cable Fly 15kg
          - Gesamtvolumen: 12.450 kg (+8% vs letzte Woche)
          - Geschätzt: 320 kcal verbrannt
          
          Wie war's insgesamt? [💪 / 😐 / 😩]"
  User: "💪"
  Coach: "So muss das! Morgen ist Rest Day. Schlaf gut, iss genug Protein.
          Dein nächstes Workout: Donnerstag, Pull Day."
```

### 4.3 Smart Features während Workout

**Progressive Overload Detection:**
```
IF user hit top of rep range 2+ sessions in a row:
  → "Du machst konstant 12 Reps bei 20kg. Zeit für 22kg. Traust du dich?"

IF user failed to hit minimum reps:
  → "8kg bei Lateral Raise war heute zu schwer. Kein Problem. 
     Nächstes Mal 7kg, saubere Form ist wichtiger."

IF no progression in 3+ weeks:
  → "Incline Press stagniert bei 24kg seit 3 Wochen. 
     Optionen: 1) Pause Reps am letzten Set, 2) Drop Set, 3) Gewicht halten, Reps steigern.
     Was willst du versuchen?"
```

**Fatigue Detection:**
```
IF reps dropping significantly within session:
  → "Deine Reps fallen ab. Set 1 war 12, jetzt nur 7. 
     Entweder längere Pause oder wir kürzen das letzte Set. Was denkst du?"

IF RPE consistently high (9-10) across exercises:
  → "Alles fühlt sich heute schwer an. Ist okay. 
     Sollen wir die letzten 2 Übungen auf 2 Sets reduzieren?"
```

**Form Reminders (basierend auf Übung):**
```
Bench Press: "Schulterblätter zusammen. Ellbogen 45 Grad."
Squat: "Brust hoch, Knie nach außen."
Deadlift: "Lats anspannen. Stange am Körper."
→ Nur beim ersten Set oder wenn User es aktiviert hat
→ Lernt über Zeit welche Cues der User braucht
```

**Superset/Rest-Pause Suggestions:**
```
IF time constraint detected (user mentioned "nur 30 Minuten"):
  → "Kurze Session heute. Ich mach Supersets: 
     Bench Press + Barbell Row, keine extra Pause. 
     Gleicher Stimulus in der Hälfte der Zeit."
```

### 4.4 Workout-Daten-Modell

```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  routine_id UUID REFERENCES routines(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INT,
  overall_rating SMALLINT, -- 1-3 (💪/😐/😩)
  coach_notes TEXT, -- Coach's Zusammenfassung
  energy_level SMALLINT, -- Pre-workout 1-5
  total_volume_kg DECIMAL,
  estimated_calories INT,
  prs_achieved JSONB -- [{exercise, metric, value, previous}]
);

CREATE TABLE workout_sets (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id),
  exercise_id UUID REFERENCES exercises(id),
  set_number SMALLINT,
  weight_kg DECIMAL,
  reps SMALLINT,
  rpe DECIMAL, -- 1-10
  tempo VARCHAR(10), -- "3010" = 3s eccentric, 0 pause, 1 concentric, 0 top
  rest_seconds SMALLINT,
  is_pr BOOLEAN DEFAULT FALSE,
  notes TEXT, -- "Griff war rutschig", "Rechte Schulter zwickt"
  logged_via ENUM('voice', 'manual', 'auto'),
  completed_at TIMESTAMP
);
```

---

## 5. Meal Planning Engine

### 5.1 Plan-Generierung

```
Input:
  - Makro-Targets (from goal): P:180g, C:280g, F:70g = 2,480 kcal
  - Food Preferences (from profile): liebt Reis, Hähnchen, Eier. Hasst Fisch, Brokkoli.
  - Allergien: Laktoseintoleranz
  - Meal-Struktur: 4 Mahlzeiten (kein Frühstück, 12:00/15:00/18:00/21:00)
  - Budget-Präferenz: Moderat
  - Kochfähigkeit: Einfach bis Mittel
  - Verfügbare Zeit: Max 30min Kochen
  - Lokale Verfügbarkeit: Thailand (tropische Früchte, Streetfood-Optionen)

Output:
  Mahlzeit 1 (12:00): 
    - 200g Hähnchenbrust + 150g Jasminreis + Gemüse-Stir-Fry
    - P:50g C:65g F:8g = 534 kcal
    
  Mahlzeit 2 (15:00):
    - Protein Shake (40g Whey) + 1 Banane + 30g Erdnussbutter
    - P:45g C:40g F:18g = 498 kcal
    
  Mahlzeit 3 (18:00):
    - 200g Rinderhack + 200g Süßkartoffel + Avocado
    - P:48g C:55g F:28g = 660 kcal
    
  Mahlzeit 4 (21:00):
    - 4 Eier Rührei + 100g Reis + Gemüse
    - P:37g C:45g F:22g = 526 kcal
    
  Snack (falls nötig):
    - 200g griechischer Joghurt (laktosefrei) + Honig
    - P:20g C:25g F:4g = 216 kcal
  
  TOTAL: P:200g C:230g F:80g = 2,434 kcal
  
  Einkaufsliste: [generiert für 7 Tage]
```

### 5.2 Dynamische Anpassung

```
Szenario: User hat Mittags 2 Stück Pizza gegessen (via MealCam geloggt)
  Pizza: P:24g C:80g F:30g = 680 kcal

Coach: "Kein Stress wegen der Pizza. Passiert. Hier dein angepasster Rest-Tag:
  - Abendessen: Hähnchenbrust pur (250g) + großer Salat (kein Dressing mit Fett)
  - Vor dem Schlafen: Casein Shake mit Wasser
  - So kommst du auf deine Makros: P:180g ✅ C:260g (leicht über, kein Problem) F:65g ✅
  
  Morgen machen wir wieder normal. Ein Tag ändert nichts."
```

### 5.3 Intelligente Vorschläge

```
"Was soll ich essen?" (kontextabhängig):
  - 14:00, nach dem Training → "Post-Workout: schnelle Carbs + Protein. Reis + Hähnchen oder Shake + Banane."
  - 22:00, noch 40g Protein übrig → "Casein Shake oder 200g Magerquark. Langsames Protein über Nacht."
  - Sonntag, Meal Prep → "Hier dein Prep-Plan für die Woche: [5 Gerichte, Einkaufsliste]"
  - Im Restaurant → "Bestell das Steak mit Reis statt Pommes. Salat als Beilage. ~P:45g C:50g F:15g"
```

---

## 6. Supplement Protocol Engine

### 6.1 Personalisierter Stack

```
Input:
  - Ziel: Muscle Building (Bulk)
  - Blutwerte: Vitamin D 28ng/ml (niedrig), Magnesium nicht getestet, Ferritin 45ng/ml (ok)
  - Budget: 60€/Monat
  - Präferenz: Keine Kapseln, Pulver bevorzugt
  - Aktueller Stack: Whey Protein, nichts sonst

Output — Coach Empfehlung (Policy-Engine konform):

  BLUTWERTE (separater Medical-Gate Flow):
  "Zwei Werte liegen außerhalb des Referenzbereichs. 
   Bitte besprich das mit deinem Arzt."
  → Ende. Keine Supplement-Ableitung aus Blutwerten.

  SUPPLEMENT-VORSCHLAG (separat, basierend auf ZIEL "Muscle Building"):
  "Für dein Ziel Muskelaufbau — hier Kategorien die oft genutzt werden:
  
  ☀️ Omega-3: Unterstützt Gelenke und allgemeines Wohlbefinden.
  💪 Kreatin Monohydrat: Einer der am besten erforschten Supplements für Kraft und Muskelmasse.
  💪 Whey Protein: hast du schon ✅
  🌙 Magnesium: Unterstützt Schlaf und Regeneration.
  🌙 Zink: Unterstützt Immunsystem.
  
  Genaue Dosierungen besprichst du am besten mit deinem Arzt oder Ernährungsberater.
  
  NICHT relevant für dich aktuell:
  ❌ BCAAs (du isst genug Protein — redundant)
  ❌ Pre-Workout (du trainierst morgens, Koffein kann Schlaf stören)"

> **⚠️ Blutwert↔Supplement Entkopplung:** Supplement-Vorschläge dürfen NICHT als Reaktion auf Laborwerte erscheinen. Blutwerte triggern nur: "Wert außerhalb Referenz → ärztlich abklären." Supplement Engine operiert unabhängig, basierend auf Ziel + Präferenzen. Sonst ist es Therapie.
```

### 6.2 Zyklus-Management

```
Coach (nach 8 Wochen Kreatin):
  "Kreatin gilt laut aktueller Forschung als sicher für Dauereinnahme — 
   Zyklen sind nach heutigem Stand nicht nötig. 
   Für die genaue Menge sprich mit deinem Ernährungsberater."

Coach (nach 12 Wochen Ashwagandha):
  "Bei Adaptogenen wie Ashwagandha empfehlen einige Quellen 
   gelegentliche Pausen. Sprich mit deinem Berater ob und wann 
   eine Pause für dich sinnvoll ist."
```

> **⚠️ Supplement Dosing Policy:** Coach darf Supplement-KATEGORIEN nennen und allgemeine Anwendungshinweise geben (z.B. "Dauereinnahme", "mit Mahlzeit"). Coach darf KEINE konkreten Mengen (mg, g, IU), Markennamen oder Extrakt-Bezeichnungen (z.B. KSM-66) als Empfehlung aussprechen. Dosierungen sind Sache des Arztes/Ernährungsberaters.

> **⚠️ Supplement Reminder Policy:** Reminders feuern nur für Supplements mit Status `ACTIVE` + `source=confirmed_by_user`. Keine Reminders für `coach_suggested` Supplements ohne explizite User-Bestätigung. Der Coach darf erinnern an was der User selbst nimmt — nicht an was der Coach vorgeschlagen hat.

### 6.3 Interaktions-Warnungen

```
User loggt Antibiotikum in Medications:
  → Medical Gate triggered (Medication aktiv)
  Coach: "Du hast ein Medikament geloggt. 
   Bitte kläre Supplement-Timing mit deinem Arzt oder Apotheker.
   Training diese Woche: hör auf deinen Körper und mach nur was sich gut anfühlt."
```

> **⚠️ Medication Gate:** Wenn `medications` aktiv oder neu geloggt → Medical Gate overrules. Keine Interaktions-Aussagen, keine "beeinflusst Wirkung", keine Timing-Empfehlungen. Nur: "Kläre mit Arzt/Apotheker."

---

## 7. Proaktive Kommunikation

### 7.1 Smart Notifications (nicht nerven, Wert liefern)

```
MORGENS (wenn aktiviert):
  "Guten Morgen [Name]! Heute ist Push Day. 
   Letzte Nacht: 7.2h Schlaf, gut. Volle Power heute.
   Reminder: Deine Supplements zum Frühstück nicht vergessen."

PRE-WORKOUT (30min vorher):
  "Workout in 30 Minuten. Hast du schon was gegessen?
   Falls nicht: Banane + kleiner Shake reicht."

POST-WORKOUT (wenn Logging vergessen, Location opt-in aktiv):
  "Hey, du warst um 8 Uhr im Gym. 
   Workout loggen? Ich hab Pull Day vorbereitet."

ABENDS (Recovery-Check):
  "Wie war dein Tag? Kurzer Check-in:
   Energie: 1️⃣2️⃣3️⃣4️⃣5️⃣
   Muskelkater: 😊😐😣
   Stimmung: 😊😐😞"

MILESTONE:
  "🎉 100 Workouts! Vor 8 Monaten hast du angefangen. 
   Seitdem: +5kg Muskelmasse, Bench Press von 60 auf 85kg.
   Das nächste Ziel: 100kg Bench. Ich sag dir: Du schaffst das bis März."

SMART WARNING:
  "Du hast 3 Tage kein Training geloggt. Alles ok?
   [Ich war krank 🤒] [Pause gebraucht 😴] [Einfach faul 😅] [Urlaub ✈️]"
  
  → "Krank" → "Gute Besserung! Ruh dich aus, Training kann warten. Iss genug Protein."
  → "Faul" → "Passiert den Besten. Morgen ist ein neuer Tag. Kein Schuldgefühl, nur Handlung."
```

### 7.2 Privacy & Consent

**Alle kontextbezogenen Features sind Opt-in mit granularen Toggles:**

- **Location**: Gym-Erkennung, Reise-Erkennung → separat aktivierbar
- **Motion/Activity**: Aktivitätserkennung → separat aktivierbar  
- **HealthKit/Health Connect**: Schlaf, HRV, Schritte → separat pro Datentyp
- **Notifications**: Pro Kategorie ein-/ausschaltbar (Morning, Pre-Workout, Recovery, Reminders)

Kein Feature sammelt Daten ohne explizites Opt-in. Toggles sind jederzeit widerrufbar.

### 7.3 Notification-Frequenz lernen

```
IF user dismisses notifications > 50% of time:
  → Frequenz reduzieren
IF user interacts with morning check-in but ignores evening:
  → Abend-Check deaktivieren
IF user interacts mehr am Wochenende:
  → Wochentags weniger, Wochenende mehr
```

---

## 8. Coaching Intelligence Layer

### 8.1 Cross-Modul Reasoning

Dies ist der KERN — der Coach sieht ALLES und verbindet die Punkte:

```
Szenario 1: Schlaf → Training
  Input: Schlaf letzte Nacht 4.5h (Wearable-Daten)
  Coach: "Nur 4.5h Schlaf? Heute modifiziertes Workout:
   - Gleiche Übungen, aber 30% weniger Volumen
   - Keine neuen PRs versuchen (Körper braucht Schlaf für saubere Motorik)
   - Extra Warm-up (15min statt 10)
   - Morgen: Schlaf priorisieren. Vor 22 Uhr ins Bett."

Szenario 2: Nutrition → Supplement → Training
  Input: Protein-Intake letzte 3 Tage: 120g/Tag (Ziel: 180g)
  Coach: "Dein Protein war diese Woche bei nur 120g. Das ist 33% unter Ziel.
   Das erklärt vielleicht warum die Gewichte diese Woche nicht steigen.
   Quick Fixes:
   1. Extra Shake morgens (40g)
   2. 200g Hähnchen mehr beim Mittagessen
   3. Casein vor dem Schlafen
   Soll ich deinen Meal Plan anpassen?"

Szenario 3: Blutwerte → Hinweis → Arzt
  Input: Neue Blutwerte hochgeladen. Vitamin D: 22ng/ml, Ferritin: 18ng/ml
  Coach: "Zwei Werte fallen auf:
   1. Vitamin D bei 22 ng/ml — liegt unter dem üblichen Referenzbereich (30-100).
   2. Ferritin bei 18 ng/ml — ebenfalls unter dem typischen Bereich.
   
   Bitte besprich beides mit deinem Arzt.
   Wenn du nachtesten lässt: Vitamin D (25-OH), Ferritin, Transferrin, großes Blutbild.
   Soll ich dich in 8 Wochen erinnern?"

Szenario 4: Training → Recovery → Nutrition
  Input: 3 Wochen kein Kraftzuwachs, Recovery-Score sinkt
  Coach: "Ich sehe ein Muster:
   - Kraft stagniert seit 3 Wochen
   - Deine Recovery-Scores sinken (letzte Woche Durchschnitt 2.8/5)
   - Dein Trainingsvolumen ist 15% über deinem üblichen
   
   Das deutet auf hohe Belastung hin. Dein Körper braucht eine Pause.
   
   Empfehlung: 
   - Diese Woche Deload (50% Volumen, gleiches Gewicht)
   - Schlaf diese Woche priorisieren (Ziel: 8h+)
   - Extra 300 kcal/Tag (Recovery braucht Energie)
   - Nächste Woche frisch starten — ich wette du setzt PRs."
```

### 8.2 Langzeit-Intelligenz

```
NACH 3 MONATEN:
  Coach: "3-Monats-Review:
   - Gewicht: 78→82kg (+4kg, davon geschätzt ~2.5kg Muskel basierend auf Kraftzuwachs)
   - Bench: 70→85kg (+21%)
   - Squat: 90→110kg (+22%)
   - Protein Adherence: 78% (gut, aber Wochenende fällt ab → Meal Prep Sonntags?)
   - Supplement Adherence: 92% (top)
   - Schlaf: Durchschnitt 6.8h (unter Ziel, größter Limiter)
   
   Mein Urteil: Stark! Der größte Hebel für die nächsten 3 Monate ist Schlaf. 
   Wenn du 7.5h+ schaffst, gehen die Gains nochmal 20% schneller.
   
   Soll ich den Plan für die nächste Phase anpassen?"

NACH 1 JAHR:
  Coach: "1 Jahr zusammen. Schau mal zurück:
   [Foto-Vergleich Tag 1 vs Heute]
   - 12kg Lean Mass dazu, 3% Körperfett runter
   - Aus dem Anfänger ist ein Intermediate geworden
   - 267 Workouts, 12.847 Sets, ~580 Tonnen bewegt
   - Dein Supplement-Stack hat sich 3x verändert (basierend auf Blutwerten)
   
   Du bist ein anderer Mensch als vor einem Jahr. Und ich bin stolz auf dich.
   Was wollen wir als Nächstes angreifen?"
```

---

## 9. Technische Architektur

### 9.1 System-Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                        MOBILE APP                            │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Voice   │  │  Chat    │  │  Workout  │  │  Quick     │  │
│  │  Mode    │  │  Mode    │  │  Mode     │  │  Actions   │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └─────┬──────┘  │
│       │             │              │               │         │
│  ┌────▼─────────────▼──────────────▼───────────────▼──────┐  │
│  │              COACH SESSION MANAGER                      │  │
│  │  (State Machine, Context Window, Mode Detection)        │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ WebSocket / REST
┌───────────────────────────▼──────────────────────────────────┐
│                      COACH BRAIN API                          │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  STT Engine │  │  LLM Router  │  │  TTS Engine         │  │
│  │  (Whisper)  │  │  (Intent +   │  │  (OpenAI/Eleven)    │  │
│  └──────┬──────┘  │   Response)  │  └──────────▲──────────┘  │
│         │         └──────┬───────┘             │             │
│         │                │                     │             │
│  ┌──────▼────────────────▼─────────────────────┴──────────┐  │
│  │              CONTEXT ASSEMBLER                          │  │
│  │  Collects: User Profile, RAG Results, Session State,    │  │
│  │  Current Workout, Recent Meals, Active Goals,           │  │
│  │  Supplement Cycle, Latest Bloodwork, Recovery Score     │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │              DATA SOURCES                               │  │
│  │  ┌──────┐ ┌─────────┐ ┌────────┐ ┌──────┐ ┌────────┐  │  │
│  │  │ RAG  │ │User DB  │ │Workout │ │Nutri-│ │Supple- │  │  │
│  │  │ 74+  │ │Profile  │ │History │ │tion  │ │ments   │  │  │
│  │  │ docs │ │Prefs    │ │Sessions│ │Meals │ │Cycles  │  │  │
│  │  └──────┘ └─────────┘ └────────┘ └──────┘ └────────┘  │  │
│  │  ┌──────┐ ┌─────────┐ ┌────────┐ ┌──────┐            │  │
│  │  │Goals │ │Recovery │ │Medical │ │Coach │            │  │
│  │  │TDEE  │ │Scores   │ │Labs    │ │Memory│            │  │
│  │  └──────┘ └─────────┘ └────────┘ └──────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Context Assembly (Pro Request)

```typescript
interface CoachContext {
  // Wer ist der User?
  user: {
    name: string;
    age: number;
    goal: GoalType;
    trainingLevel: 'beginner' | 'intermediate' | 'advanced';
    coachName: string;
    coachPersonality: PersonalityType;
  };
  
  // Was weiß der Coach über den User? (RAG)
  preferences: UserPreference[]; // Food, Exercise, Communication
  recentMemories: CoachMemory[]; // Letzte relevante Gespräche
  milestones: Milestone[]; // Errungenschaften
  
  // Was passiert JETZT?
  currentState: {
    mode: 'chat' | 'workout' | 'meal_question' | 'supplement_check';
    workoutSession?: ActiveWorkoutSession;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    daysSinceLastWorkout: number;
    daysSinceLastMeal: number;
  };
  
  // Was sagen die Daten?
  recentData: {
    last7dNutrition: DailyNutritionSummary[];
    lastWorkout: WorkoutSummary;
    currentGoalProgress: GoalProgress;
    latestRecoveryScore: number;
    latestSleepData?: SleepData;
    activeSupplements: SupplementCycle[];
    latestBloodwork?: BloodworkResult;
    todaysMacrosRemaining: MacroTargets;
  };
  
  // Wissenschaft (RAG Knowledge Base)
  relevantKnowledge: RAGResult[]; // Top-3 relevante KB Docs
}
```

### 9.3 LLM System Prompt (Kern)

```
Du bist {coachName}, der persönliche Fitness-Coach von {userName}.

DEINE PERSÖNLICHKEIT: {personalityDescription}

ÜBER DEINEN SCHÜTZLING:
{userProfileSummary}
{recentPreferences}
{currentGoalAndProgress}

AKTUELLE SITUATION:
{currentState}
{recentDataSummary}

REGELN:
1. Du KENNST {userName} — nutze was du weißt. Keine generischen Antworten.
2. Empfehlungen sind IMMER evidenzbasiert (nutze Knowledge Base).
3. Sei {personality} aber EHRLICH — keine Schönrederei bei schlechter Adherence.
4. Wenn du nicht sicher bist → sag es. Kein Raten bei medizinischen Fragen.
5. Feiere Erfolge. Erkenne Struggles. Sei menschlich.
6. Im Workout-Modus: KURZ und KLAR. Kein Gelaber während Sets.
7. Erinnere dich an vergangene Gespräche und referenziere sie natürlich.
8. Du darfst {userName} widersprechen wenn es seinem Ziel schadet.
9. Passt Sprache an: {language}. Wenn User switcht, switch mit.
10. Bei Verletzungen/Schmerz: IMMER empfehlen einen Arzt/Physio zu konsultieren.

KNOWLEDGE BASE (relevante Wissenschaft):
{ragResults}
```

---

## 10. Monetarisierung

### 10.1 Tier-Struktur

```
FREE:
- Text-Chat mit Coach (begrenzt: 20 Messages/Tag)
- Basic Workout Logging
- Basic Nutrition Tracking
- Coach-Persönlichkeit: Nur "Motivator"

PREMIUM (Abo → Wallet-Voucher):
- Unlimitierter Text-Chat
- Voice-Coaching (STT + TTS)
- Live Workout Session Mode
- Personalisierte Meal Plans
- Supplement Protokolle
- Proaktive Notifications
- Alle Persönlichkeiten wählbar
- Cross-Modul Intelligence
- Monats-/Quartals-Reviews

PRO (für Coaches/Trainer):
- White-Label Coach für eigene Clients
- Custom Voice (Voice Cloning)
- Custom Knowledge Base (eigene Methodik einspeisen)
- Client Dashboard
- Revenue Share: Coach bekommt Anteil der Client-Abos
```

### 10.2 Token-Ökonomie

```
Geschätzte Kosten pro User/Monat (Premium):
- LLM (GPT-4o/Claude): ~5,000 tokens/interaction × 30 interactions = 150k tokens = ~$0.75
- STT (Whisper): ~10min Voice/Tag × 30 = 300min = ~$1.80
- TTS (OpenAI): ~2,000 chars/interaction × 30 = 60k chars = ~$0.90
- RAG Search: negligible (local pgvector)
- Embedding: negligible (local MiniLM)

TOTAL: ~$3.50/User/Monat Infrastruktur
Abo-Preis: $14.99-24.99/Monat
Marge: 75-85%
```

---

## 11. Implementation Roadmap

### Phase 1: Smart Text Coach (4-6 Wochen)
- [ ] User Coach Profile (DB + API)
- [ ] Preference Learning System
- [ ] Context Assembler (verbindet alle Module)
- [ ] Enhanced Coach Chat mit persönlichem Kontext
- [ ] Coach Memory (RAG-basiert, pro User)
- [ ] Coach-Name & Persönlichkeits-Auswahl
- [ ] Cross-Modul Reasoning (Schlaf→Training, Nutrition→Performance)

### Phase 2: Live Workout Mode (4-6 Wochen)
- [ ] Workout Session State Machine
- [ ] Set/Rep/Weight Logging via Chat
- [ ] Progressive Overload Detection & Suggestions
- [ ] Rest Timer Integration
- [ ] Workout Summary & PR Detection
- [ ] Fatigue Detection & Auto-Adjustment
- [ ] Form Reminders per Exercise

### Phase 3: Voice (4-6 Wochen)
- [ ] STT Integration (Whisper on-device oder API)
- [ ] TTS Integration (OpenAI TTS Streaming)
- [ ] Command Recognition (schneller Path für Gym-Commands)
- [ ] Voice-optimierte Responses (kürzer, klarer)
- [ ] Background Audio Session (App im Hintergrund, EarPods)
- [ ] Noise Handling für Gym-Umgebung

### Phase 4: Meal & Supplement Planning (3-4 Wochen)
- [ ] Meal Plan Generator (Makros + Preferences + Allergien)
- [ ] Dynamic Meal Adjustment (basierend auf gegessen)
- [ ] Supplement Protocol Generator (Ziel + Blutwerte)
- [ ] Supplement Timing Reminders
- [ ] Einkaufsliste Generator

### Phase 5: Proaktive Intelligence (2-3 Wochen)
- [ ] Smart Notifications Engine
- [ ] Notification Frequency Learning
- [ ] Milestone Detection & Celebration
- [ ] Weekly/Monthly Review Generation
- [ ] Anomaly Detection (plötzliche Veränderungen)

### Phase 6: Polish & Monetarisierung (2-3 Wochen)
- [ ] Free/Premium/Pro Tier Gates
- [ ] Voice Personality Variations
- [ ] Onboarding Flow für Coach Setup
- [ ] Analytics Dashboard (Engagement, Retention, NPS)

**Geschätzte Gesamtdauer: 4-6 Monate**
**Geschätzte Kosten: Primär Entwicklungszeit (Infra-Kosten minimal durch lokales RAG/Embedding)**

---

## 12. Metriken für Erfolg

```
ENGAGEMENT:
- Daily Active Coach Interactions (Ziel: 3+/Tag pro User)
- Voice vs Text Ratio (Ziel: 50%+ Voice bei Premium)
- Workout Session Completion Rate (Ziel: 85%+)
- Meal Plan Adherence (Ziel: 70%+)

RETENTION:
- 30-Day Retention (Ziel: 80%+)
- 90-Day Retention (Ziel: 60%+)
- Churn Rate Premium (Ziel: <5%/Monat)
- NPS Score (Ziel: 50+)

OUTCOME:
- User Goal Achievement Rate
- Average Strength Progression
- Nutrition Adherence Trend
- User-reported Satisfaction

BUSINESS:
- Premium Conversion Rate (Ziel: 15-25%)
- LTV/CAC Ratio (Ziel: 3:1+)
- Revenue per User
```

---

## 13. Medical Safety Layer (Hard Gate)

### 13.1 Grundregel

Coach Buddy darf bei medizinischen Daten:
- ✅ Werte erklären
- ✅ Als auffällig markieren
- ✅ Trends nennen
- ✅ Erneute Tests vorschlagen (Marker benennen)
- ✅ Zur ärztlichen Abklärung raten

Medical Gate greift bei:
- Blutwerten, Diagnosen, Symptomen, Medikamenten, Interaktionen
- Allen Aussagen über "Ursachen" von Müdigkeit, Schmerz, Leistungsabfall etc.

Bei Trigger wird die Antwort:
- Neutral im Ton (unabhängig von gewählter Persönlichkeit)
- Kurz
- Ohne Handlungsanweisung außer "ärztlich abklären"
- Optional mit "Marker zum Nachtesten"

**Lab Reference Ranges:**
- Referenzbereiche kommen aus einer zentralen `lab_reference_ranges` Tabelle oder den Metadaten des Labors
- Medical Context enthält: `lab_reference_range_min`, `lab_reference_range_max`, `lab_name`, `sample_unit`
- LLM darf KEINE Referenzbereiche frei formulieren — nur die Daten aus dem Medical Context wiedergeben
- Wenn kein Referenzbereich in den Daten → Wert nennen, aber NICHT als "auffällig" markieren

Coach Buddy darf NICHT:
- ❌ Diagnosen nennen
- ❌ Ursachen behaupten
- ❌ Dosierungen empfehlen
- ❌ Therapien empfehlen oder "Stack" medizinisch begründen

### 13.2 Enforcement

Jede Antwort läuft durch einen **Policy-Gate**, bevor sie an UI/Voice rausgeht.

Policy-Gate prüft:
- Verbotene Patterns (Dosierungen, Therapie-Verben, Diagnose-Claims)
- Medizinische Konfidenz (wenn low → eskalieren)
- Output-Redaction (problematische Teile entfernen)

Output-Result:
- **PASS** — Antwort ist safe
- **REDACT + SAFE_REWRITE** — problematische Teile werden entfernt/umgeschrieben
- **BLOCK + ESCALATE_TO_DOCTOR** — Antwort wird komplett ersetzt durch Arzt-Verweis

### 13.3 Beispiel-Outputs (konform)

Input: "Vitamin D: 22 ng/ml"

Output:
- "Der Wert liegt unter dem üblichen Zielbereich."
- "Das kann relevant sein, bitte ärztlich abklären."
- "Wenn du es nachtesten lässt: Vitamin D (25-OH), ggf. Calcium, PTH."

**Keine Dosis. Kein "das erklärt Müdigkeit". Kein "nimm X".**

### 13.4 App Store Compliance

- Keine Diagnose-Claims
- Kein "behandelt", "heilt", "therapiert"
- Disclaimer bei jeder medizinischen Thematik
- Gesundheitsdaten = höchste Datenschutz-Klasse

---

## 14. Decision Boundary: Engine vs LLM

### 14.1 Engine entscheidet (deterministisch, testbar)

- Makros, Kalorien, Remaining Targets
- PR-Detection
- Progressive Overload Regeln
- Fatigue-Trigger (Reps Drop, RPE, Sleep Low)
- Notification Frequency Learning
- Workout-Session State Transitions
- Timer-Logik
- Recovery Score Berechnung
- Safety Policy Checks

### 14.2 LLM entscheidet (nur Presentation)

- Sprache, Tonalität, Kürze
- Motivation im Rahmen der erlaubten Events
- Erklärung von Entscheidungen der Engine
- Dialog-Flow (Fragen stellen, bestätigen)
- Persönlichkeit und emotionale Anpassung

**Harte Regel: LLM darf keine Zahlen "erfinden". Alle Zahlen kommen aus Engine-Fields.**

---

## 15. Output Contract (Coach Brain → App)

**LLM liefert strukturiert. UI/Voice rendert nur.**

### 15.1 Response Schema (minimal)

```
{
  intent: string,            // Was will der Coach?
  speech_text: string,       // Natürliche Sprache für Voice/Chat
  ui_cards: UICard[],        // Visuelle Elemente für die App
  actions: Action[],         // Maschinen-Aktionen
  safety_flags: string[],    // Leer wenn alles ok
  evidence: Evidence[]       // Optional, aus KB/RAG
}
```

### 15.2 Actions (MVP Set)

```
START_TIMER(seconds)
EXTEND_TIMER(seconds)
LOG_SET(weight, reps, rpe, notes)
NEXT_EXERCISE()
REPEAT_LAST()
PAUSE_SESSION()
END_SESSION()
REQUEST_INPUT(type: weight | reps | rpe | energy | pain)
SHOW_SUMMARY(type: session | week)
```

**Wichtig:** Actions sind idempotent oder haben event_id, damit keine Doppel-Logs entstehen.

### 15.3 Evidence-Pflicht

**Harte Regel:** Keine Studien-Claims, Meta-Analyse-Referenzen oder Jahreszahlen im `speech_text`.

- `speech_text` bleibt natürliche Sprache ohne Zitate
- Evidence erscheint NUR in UI Cards (Typ `EVIDENCE_CARD`) oder im expliziten "Warum?"-Flow
- `evidence[]` referenziert ausschließlich KB/RAG-Dokumente (source_id)
- Keine frei erfundenen Studien, Jahreszahlen oder Autorennamen
- Wenn kein RAG-Treffer → keine wissenschaftliche Behauptung machen
- UI zeigt "📚 Warum?" Button → öffnet Evidence Cards mit Quellenangabe

**Beispiel:**
- ❌ speech_text: "Studien zeigen dass 2x/Woche pro Muskel optimal ist."
- ✅ speech_text: "Deine Frequenz ist gut so." + evidence_card: {title: "Schoenfeld Frequency Meta-Analysis", source_id: "kb:hypertrophy-science"}

### 15.4 Detailliertes JSON Schema + Beispiele

→ Siehe separates Dokument: `specs/coach-buddy-output-contract.md`

---

## 16. Event Model (Workout-First)

### 16.1 Core Events

```
SESSION_STARTED
EXERCISE_STARTED(exercise_id)
SET_STARTED(set_id)
SET_COMPLETED(weight, reps, rpe, notes, logged_via)
REST_STARTED(seconds)
REST_ENDED
USER_FEEDBACK(energy, pain, comment)
COACH_SUGGESTION(type, payload)
COACH_SUGGESTION_ACCEPTED / REJECTED
SESSION_COMPLETED(summary_refs)
```

### 16.2 Action → Event Binding

**Actions sind Vorschläge/Commands. Events sind Wahrheit.**

- Jede Action hat eine `action_id`
- Engine returned `action_result`: `{ status: applied | rejected | noop, emitted_events: [] }`
- Action kann 0..n Events erzeugen (nicht immer genau 1)
- Jedes Event hat: `event_id` + `source` (voice/manual/auto) + `timestamp`
- Coach Memory darf NUR aus Events entstehen, nie aus rohem Chat
- Kein State-Change ohne Event

```
Action LOG_SET(action_id: "a-456", 26kg, 10, RPE 8)
  → action_result: { status: "applied", emitted_events: ["evt-123"] }
  → Event SET_COMPLETED(id: "evt-123", weight: 26, reps: 10, rpe: 8, source: "voice")
  → Memory: nur wenn Event existiert

Action START_TIMER(action_id: "a-789", 90s) — Timer läuft schon
  → action_result: { status: "rejected", emitted_events: [] }
  → Kein Event, kein State-Change

Action ohne applied result = nie passiert.
```

### 16.3 Warum Event-First

- **Replay und Debugging**: Jedes Workout nachvollziehbar
- **Deterministische Rules**: Engine reagiert auf Events, nicht auf Chat
- **Voice ohne Chaos**: Voice-Layer produziert/konsumiert gleiche Events wie Text
- **Messbare Qualität**: Dropouts, Friction, Conversion pro Step

---

## 17. Coach Memory (Structured, nicht freie Magie)

### 17.1 Memory Types

| Type | Beispiel | Decay |
|---|---|---|
| PREFERENCE | "mag keinen Fisch", "bevorzugt Dumbbells" | Nie (bis explizit geändert) |
| MILESTONE | PR, Streak, Habit erreicht | Nie |
| CONTEXT_NOTE | "Urlaub nächste Woche", "Prüfungsphase" | Ja (nach Relevanz) |
| COACHING_OUTCOME | "Deload hat geholfen", "Meal Prep funktioniert nicht" | Langsam |

### 17.2 Memory Fields (Spec-Level)

- **raw_text**: Original-Kontext
- **summary**: 1-2 Sätze
- **type**: siehe oben
- **importance_score**: 0-1
- **ttl/decay**: Wie lange relevant
- **source_event_id**: Woher stammt die Info
- **retrieval_tags**: z.B. "pull-day", "food_dislike", "shoulder_injury"

**Regel: Memory wird nur aus Events erzeugt, nicht aus jeder Chatzeile.**

---

## 18. Cost Model (Stand Q1/2026)

> ⚠️ Modellabhängig. Preise ändern sich schnell. Vor Launch neu kalkulieren.

### Casual User (Text only, 1-2 Interaktionen/Tag)
- **LLM**: ~50k tokens/Monat → ~$0.25-0.50
- **Infra**: ~$0.30
- **Total: ~$0.50-0.80/User/Monat**

### Active User (Text + gelegentlich Voice, 3-5 Interaktionen/Tag)
- **LLM**: ~200k tokens/Monat → ~$1.00-2.00
- **STT**: ~5min Voice/Tag → ~$0.90
- **TTS**: ~$0.50
- **Infra**: ~$0.50
- **Total: ~$3-4/User/Monat**

### Heavy User (Voice Coaching 5x/Woche, tägliche Reviews)
- **LLM**: ~500-600k tokens/Monat (längere Context Windows, Workout Sessions) → ~$3-4
- **STT**: ~15min Voice/Tag × 20 Tage → ~$1.80
- **TTS**: ~$1.50
- **Infra**: ~$0.70
- **Total: ~$7-8/User/Monat**

### Pricing-Implikation
- Free Tier: Casual-Kosten sind tragbar (~$0.50)
- Premium ($14.99-24.99): Active User = 75-85% Marge ✅
- Premium Heavy User: Marge sinkt auf 50-65% — akzeptabel wenn Retention hoch
- **Risiko:** Heavy User bei niedrigem Abo-Preis → Marge unter 50%. Mitigation: Voice als Premium-Only, Token-Budgets pro Tier

Kosten werden per Telemetrie real gemessen und in Pricing-Loop eingespeist.

---

## 19. Emotional Coherence Model

### 19.1 Problem

Persönlichkeit ist statisch gewählt (Drill Sergeant, Best Friend, etc.) — aber Beziehungen sind dynamisch. Ohne Tracking driftet der Ton: Woche 1 hart, Woche 6 empathisch, Woche 12 wieder hart — ohne Grund. Das zerstört die Illusion einer echten Beziehung.

### 19.2 Lösung: Coach Relationship State

```
coach_relationship_state:
  trust_score: 0-1        (steigt mit Zeit und positiven Interaktionen)
  push_tolerance: 0-1     (wie viel "harter Push" verträgt der User aktuell?)
  recent_adherence: 0-1   (letzte 7 Tage Adherence über alle Module)
  recent_stress: 0-1      (erkannte Stress-Signale: schlechter Schlaf, missed workouts, negative Check-ins)
  relationship_weeks: int  (wie lange kennen sich Coach und User?)
```

### 19.3 Wie es das Verhalten beeinflusst

```
trust_score LOW (neue User):
  → Coach ist ermutigend, nicht fordernd
  → Weniger "Du musst", mehr "Versuch mal"
  → Keine harten Konfrontationen

trust_score HIGH + push_tolerance HIGH:
  → Coach kann direkt sein: "Kein Beintraining skippen. Du weißt warum."
  → Kann auch mal Humor nutzen der am Anfang nicht ginge

recent_stress HIGH:
  → Unabhängig von Persönlichkeit: Ton wird weicher
  → Drill Sergeant wird zu "Tough Love mit Empathie"
  → Keine Schuldzuweisungen bei missed workouts

recent_adherence LOW + trust HIGH:
  → Coach darf konfrontieren: "3 Wochen unter Protein-Ziel. Was ist los?"
  → Bei LOW trust: Nur sanft fragen, nicht fordern
```

### 19.4 Regel

**Persönlichkeit ist ein Stil, kein Modus.** Der Stil bleibt (Scientist erklärt, Drill Sergeant ist direkt) — aber die INTENSITÄT passt sich an den Relationship State an. Das passiert automatisch, nicht durch User-Setting.

### 19.5 Priorität

Nicht MVP-kritisch. Aber für "Beziehung, kein Tool" ist es zentral. Einführung ab Phase 3 (nach Voice), weil erst dann genug Interaktionsdaten für sinnvolles Tracking existieren.

---

## 20. Local-First Architektur-Prinzip

### 20.1 Warum

- **GDPR/Gesundheitsrecht:** Blutwerte, Körperdaten, Trainingshistorie = sensible Daten. Je weniger davon auf Servern liegt, desto weniger regulatorische Angriffsfläche.
- **Latenz:** Gym-Commands müssen in <200ms reagieren. Server-Roundtrip kann das nicht immer garantieren.
- **Offline:** Gyms haben oft schlechtes WLAN. Workout-Kernfunktion muss offline laufen.
- **Kosten:** Lokale Berechnung = $0.

### 20.2 Was lokal läuft

```
LOKAL (On-Device):
├── Rules Engine komplett (Makros, PR Detection, Fatigue, Timer, State Machine)
├── Workout Event Stream (erzeugen + speichern)
├── Command Recognition (Gym-Commands: "Fertig", "26 Kilo", "Nächste")
├── STT (Whisper on-device als Primary, Cloud als Fallback)
├── Supplement Reminder Logic
├── Notification Scheduling
├── Offline Workout Mode (sync wenn online)
└── Preference Storage + Basic Memory Retrieval
```

```
REMOTE (Server):
├── LLM Phrasing (Sprache generieren)
├── RAG Search (Knowledge Base + Coach Memory)
├── TTS (Voice-Generierung)
├── Cross-Modul Intelligence (Aggregation über alle Datenquellen)
├── Meal Plan Generation
├── Weekly/Monthly Reviews
└── Sync + Backup
```

### 20.3 Regel

**Wenn es deterministisch ist, läuft es lokal. Wenn es LLM braucht, geht es remote.** Der User muss ein vollständiges Workout durchführen können ohne Internetverbindung. LLM-Features (Motivation-Text, Erklärungen, Reviews) sind Nice-to-have — die Kernfunktion (Tracking, Timer, State, PRs) läuft immer.

---

## 21. Adaptive Intervention Engine — Der Moat

### 21.1 Ziel

Coach Buddy optimiert nicht "Antworten". Er optimiert **Verhaltensstabilität**.

Er lernt:
- Welche Intervention wann wirkt
- Welcher Ton wann wirkt
- Welche Narrative den User bindet
- Welche Muster Dropout vorhersagen

**Output ist kein Text. Output ist ein Intervention-Plan. Text ist nur Rendering.**

---

### 21.2 Die drei Moats

#### Moat 1: Behavioral Signature

Coach Buddy baut pro User ein Verhaltensmodell das nicht aus Rohdaten besteht, sondern aus **Muster + Trigger + Reaktion**.

Beispiele (nur wenn durch Events belegt, nie als Behauptung):
- Stressphase → Training skippt (Pattern)
- Zahlen motivieren stärker als Empathie (Response Preference)
- Protein unter Schwelle → Adherence kollabiert (Trigger)
- Bestimmte Wochentage/Uhrzeiten → Dropout-Risiko (Timing)

**Entstehung:**
- Events (Workout/Nutrition/Sleep/Check-ins)
- Outcomes (Adherence Delta, Workout Completion, Mood Shift)
- Reject/Accept von Coach Suggestions

**Regel:** Kein Signature-Claim ohne Minimum-Datenfenster (≥8 Wochen Events oder definierter Threshold).

**Confidence-Level (Pflicht für jedes Pattern):**
```
Jedes Pattern in der Behavioral Signature hat:
{
  "detected": true,
  "confidence": 0.74,       // 0-1
  "sample_size": 11,        // Anzahl beobachteter Instanzen
  "first_observed": "2026-01-15",
  "last_confirmed": "2026-03-10"
}

Confidence-Thresholds:
  < 0.5: Pattern wird NICHT verwendet (zu unsicher)
  0.5-0.7: Pattern darf Intervention beeinflussen, aber keine Identity-Claims
  > 0.7: Pattern darf für Identity Reinforcement verwendet werden

Ohne Confidence-Level baut das System Narrative auf dünner Datenbasis.
Das führt zu falschen Identitäts-Framings und zerstört Trust.
```

#### Moat 2: Intervention Memory

Coach Buddy speichert nicht "Chat". Er speichert **Interventionen + Wirkung**.

Jede Intervention wird als Experiment geloggt:
- Kontext
- Gewählte Intervention
- Tonalität
- Ergebnis

So entsteht ein personalisiertes Playbook.

**Kern:** Emergentes Wissen, nicht exportierbare Daten.

#### Moat 3: Identity Reinforcement

Coach Buddy betreibt ein kontrolliertes Narrativ:
- **Phase 1:** Beobachten (Monat 1-2)
- **Phase 2:** Spiegeln (Monat 3-4)
- **Phase 3:** Verstärken (Monat 5+)

**Ziel:** Identität die Verhalten stabilisiert.

Beispiele:
- "Du bist jemand der nicht skippt."
- "Du bist jemand der seine Basics ernst nimmt."

**Regeln:**
- Keine Identity-Claims ohne Trust + Evidenz aus Events
- Intensität wird durch Relationship State begrenzt (trust_score, push_tolerance, recent_stress)

---

### 21.3 Datenmodell

#### 21.3.1 intervention_log (Event-sourced)

Pflichtfelder:
- `intervention_id`: UUID
- `timestamp`: datetime
- `context_vector_id`: Referenz auf berechneten Kontext
- `intervention_type`: confrontation | encouragement | adjustment | redirect | silence
- `tone_variant`: direct | soft | humorous | analytical | tough_love
- `hypothesis_id`: optional — wenn explizit getestet wird
- `expected_outcome`: optional
- `observed_outcome`: accepted | rejected | ignored | engaged
- `effectiveness_score`: 0-1 (berechnet aus Outcome-Feldern)
- `emitted_events[]`: die Wahrheit
- `cooldown_until`: optional — keine Wiederholung vor diesem Zeitpunkt

**Kontext kommt aus Engine-Features, nicht aus LLM-Text.**

#### 21.3.2 context_vector (deterministisch)

Features:
- `sleep_3d_avg`: Schlaf-Durchschnitt letzte 3 Tage
- `missed_workouts_7d`: Ausgefallene Workouts letzte 7 Tage
- `protein_adherence_7d`: Protein-Ziel Adherence letzte 7 Tage (0-1)
- `training_streak_days`: Aktuelle Streak
- `stress_proxy`: Berechnet aus Check-ins, Sleep, Missed Logs (0-1)
- `time_of_day`: Tageszeit-Bucket
- `day_of_week`: Wochentag
- `trust_score`: Relationship State (0-1)
- `push_tolerance`: Wie viel Konfrontation verträgt der User (0-1)

**Regel:** Features müssen offline berechenbar sein (Local-First kompatibel).

---

### 21.4 Manipulation Guard

**Das System führt implizite A/B-Tests am User durch. Das erfordert harte Grenzen.**

Verbotene Narrative:
- ❌ Angst-Narrative ("Wenn du jetzt aufhörst, verlierst du alles")
- ❌ Schuld-Narrative ("Du hast dein Versprechen gebrochen")
- ❌ Künstlicher Druck ("Dein Streak ist in Gefahr!")
- ❌ Streak-Shaming ("154 Tage am Stück — willst du das wirklich wegwerfen?")
- ❌ Sozialer Vergleich als Druck ("Andere in deinem Alter schaffen mehr")

**Warum:** Das System lernt irgendwann "Druck funktioniert mit 0.91 Effektivität" — und eskaliert autonom. Das darf nicht passieren. Kurzfristige Adherence auf Kosten der Beziehung ist ein Netto-Verlust.

**max_intervention_intensity:** Hard Cap pro User

```
max_intervention_intensity: 0-1
  0.0-0.3: Nur Encouragement + Adjustment
  0.3-0.6: + Analytical Confrontation (Zahlen, keine Emotion)
  0.6-0.8: + Direkte Konfrontation (wenn Trust hoch genug)
  0.8-1.0: Reserved, nur manuell freischaltbar

Default: 0.6
Upgrade: Nur wenn trust_score ≥ 0.75 UND push_tolerance ≥ 0.70
Engine darf max_intervention_intensity NIE autonom über 0.8 setzen.
```

**intervention_load_7d:** Limit für Gesamt-Interventionen

```
intervention_load_7d:
  max_interventions: 5 pro Woche
  max_confrontations: 2 pro Woche
  max_identity_statements: 3 pro Woche
  
  Wenn Limit erreicht → Stille. Keine Intervention.
  Manchmal ist Nicht-Intervenieren die stärkste Intervention.
```

Formal verschiedene Interventionstypen (confrontation → adjustment → analytical) an aufeinanderfolgenden Tagen sind emotional Dauerbeschuss. `intervention_load_7d` verhindert das.

---

### 21.5 Decision Boundary

**Engine entscheidet:**
- Wann eine Intervention nötig ist
- Welche Interventionen erlaubt sind
- Welches Tone-Bucket maximal erlaubt ist
- Welche Identity-Statements freigeschaltet sind

**LLM entscheidet nur:**
- Formulierung innerhalb der erlaubten Intervention
- Kürze
- Gesprächsfluss (Request Input, Confirmation)

---

### 21.5 Intervention Selection Algorithm (MVP)

Keine ML-Magie im v1. Ein simples, testbares System:

1. **Bucket:** Kontextklasse (z.B. `high_stress + missed_workout`)
2. **Candidate Interventions:** Feste Liste pro Bucket
3. **Score** = Weighted Average aus:
   - Historical effectiveness (per User)
   - Global prior (anonymisiert, optional)
   - Risk penalty (Safety/Medical Gates)
   - Fatigue penalty (nicht wiederholen innerhalb Cooldown)

**Wählt:**
- 1 Primary Intervention
- Optional 1 Backup, falls Primary abgelehnt wird

---

### 21.6 Zielmetrik: Behavior Stability Score (BSS)

BSS misst ob der User stabiler wird UND ob er seinem Ziel näher kommt. BSS ist kein "Feelgood Score". Er ist ein **Outcome-Score über 6 Monate**.

**BSS = Stability × Goal Alignment**

Stability allein reicht nicht. Jemand der stabil 2x/Woche trainiert obwohl sein Ziel 5x ist, hat niedrige Varianz aber null Fortschritt. Das darf keinen hohen Score geben.

Komponenten:
- **Training Consistency:** Workouts/Woche Varianz (niedrig = stabil)
- **Goal Alignment:** Actual vs Target Workouts/Woche (nah = gut)
- **Nutrition Adherence Stability:** Makro-Drift Varianz
- **Nutrition Goal Proximity:** Actual vs Target Makros (Trend Richtung Ziel)
- **Recovery Stability:** Sleep/Check-in Trends
- **Dropout Events:** 0/1 pro Zeitfenster
- **Bounceback Time:** Wie schnell kehrt der User nach Ausfall zurück

```
BSS Formel (vereinfacht):
  stability_score = f(varianzen aller Komponenten)     // 0-100, niedrige Varianz = hoch
  alignment_score = f(actual vs target, trend)          // 0-100, nah am Ziel + positiver Trend = hoch
  
  BSS = (stability_score × 0.5) + (alignment_score × 0.5)
  
  Beispiel:
  - Stabil 2x/Woche, Ziel 5x → Stability 90, Alignment 30 → BSS 60
  - Schwankend 3-5x/Woche, Ziel 5x → Stability 55, Alignment 75 → BSS 65
  - Stabil 4-5x/Woche, Ziel 5x → Stability 85, Alignment 90 → BSS 88
```

**Regeln:**
- BSS wird aus Events berechnet, nicht aus Chat
- BSS wird lokal berechnet (Local-First kompatibel)
- Gewichtung stability:alignment ist anpassbar (Default 50:50)

**Produktregel:**
- Wenn BSS steigt → Coach funktioniert
- Retention, NPS, Revenue sind Folgeeffekte
- **Bounceback Time ist der strategisch stärkste Sub-Score** — er misst echte Resilienz, nicht Perfektion

---

### 21.7 Gold Paths für Kapitel 21

5 Tests, nicht 50:

1. **Stressphase erkannt** → passende Intervention → Adherence steigt
2. **Falscher Ton gewählt** → User lehnt ab → Engine wählt Backup
3. **Identity-Claim blockiert** bei low trust_score
4. **Intervention nicht wiederholt** während Cooldown
5. **BSS-Berechnung reproduzierbar** aus Event Replay

---

### 21.8 Non-Goals v1

- ❌ Keine Blackbox-Modelle
- ❌ Keine psychologischen Diagnosen
- ❌ Keine medizinischen Ursachen-Claims
- ❌ Keine manipulativen Dark Patterns
- ❌ Keine ML-Magie (v1 ist deterministisch + testbar)
- ❌ Keine 100 Interventionstypen (5 Buckets, 6 Typen, fertig)
- ❌ Keine komplexe Psychologie-Metriken (BSS + Trust + Confidence reicht)

### 21.9 Strategische Vision

**Was hier gebaut wird ist kein Fitness-Tool. Es ist eine Behavior Optimization Engine mit Fitness als Domain.**

Die Architektur — Behavioral Signature, Intervention Memory, Identity Reinforcement, BSS — ist domain-agnostisch. Fitness ist der Trainingsraum, nicht die Grenze.

Wenn das System in Fitness funktioniert, ist es anwendbar auf:
- Lernen / Studium
- Business-Routinen / Produktivität
- Schlaf-Optimierung
- Rehabilitation
- Gewohnheitsaufbau allgemein

**Das ist die Skalierungsoption. Aber NICHT der v1 Scope.**

v1 = Fitness. Perfektioniert. Bewiesen. Dann erst Domain-Expansion.

Das größte Risiko ist nicht Technik. Es ist Scope-Explosion. Dagegen schützt:
- 5 Kontext-Buckets
- 6 Interventionstypen
- Deterministische Scores
- Klare Gates
- Und Disziplin.

---

### 21.9 Detailliertes JSON Schema + Beispiel-Interventionen

→ Siehe separates Dokument: `specs/coach-buddy-intervention-contract.md`

## 22. Test Scope für v1 (Gold Paths)

Nicht 200 Szenarien. Für v1 reicht:

### 10-15 Gold Path Flows:

**Workout (3):**
- Normal Session (5 Übungen, PR, sauberer Durchlauf)
- Müde Session (niedriger Energy-Level → Coach reduziert Volumen)
- Zeitdruck Session (nur 30min → Coach macht Supersets)

**Nutrition (3):**
- Cheat Meal (Pizza mittags → Coach passt Rest-Tag an)
- Low Protein (3 Tage unter Ziel → Coach schlägt Anpassung vor)
- Restaurant ("Was soll ich bestellen?" → kontextabhängige Empfehlung)

**Injury/Pain (3):**
- Schulter-Schmerz → Coach substituiert Übungen, empfiehlt Arzt
- Knie-Probleme → Tiefe reduzieren, Alternativen
- Allgemeines Unwohlsein → leichteres Workout, Recovery priorisieren

**Reviews (2):**
- Wochenreview (Adherence, Fortschritt, Empfehlung)
- Monatsreview (Trends, Ziel-Check, Plan-Anpassung)

**Notification Learning (2):**
- User dismissed 3x morgens → Frequenz reduziert sich
- User interagiert immer abends → Abend-Check bekommt Priorität

**Ziel: Engine-Outputs stabil, LLM-Phrasing austauschbar.**
