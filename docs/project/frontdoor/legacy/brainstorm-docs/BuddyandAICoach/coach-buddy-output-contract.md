# Coach Buddy Output Contract — JSON Schema v0.1

> Dieses Dokument definiert das exakte Format jeder Coach-Antwort.
> Coder bauen gegen diesen Contract. LLM liefert dieses Format. UI/Voice rendert nur.

---

## Schema

```json
{
  "$schema": "coach-response-v0.1",
  
  "intent": "string (required)",
  "speech_text": "string (required) — natürliche Sprache, wird gesprochen/angezeigt",
  
  "ui_cards": [
    {
      "type": "stat | comparison | list | chart | exercise | meal_plan | action_prompt",
      "title": "string",
      "data": {},
      "priority": "high | normal | low"
    }
  ],
  
  "actions": [
    {
      "id": "uuid — für Idempotenz",
      "type": "START_TIMER | EXTEND_TIMER | LOG_SET | NEXT_EXERCISE | REPEAT_LAST | PAUSE_SESSION | END_SESSION | REQUEST_INPUT | SHOW_SUMMARY",
      "params": {},
      "requires_confirmation": "boolean"
    }
  ],
  
  "safety_flags": ["string — leer wenn ok"],
  
  "evidence": [
    {
      "source_id": "string — RAG document ID (Pflicht)",
      "title": "string — Dokument-Titel aus KB",
      "relevance": "number 0-1"
    }
  ],
  
  "// EVIDENCE RULE:",
  "// Keine Studien-Claims, Jahreszahlen oder 'Studie zeigt' im speech_text.",
  "// Evidence erscheint NUR in ui_cards vom Typ EVIDENCE_CARD.",
  "// UI zeigt '📚 Warum?' Button → Evidence Cards.",
  "// Kein RAG-Treffer = keine wissenschaftliche Behauptung.",
  "// Keine erfundenen Studien oder Autorennamen.",
  
  "expects_input": "boolean — wartet der Coach auf Antwort?",
  "input_type": "free_text | number | choice | rating | confirm (optional)",
  "choices": ["string array — bei input_type=choice"]
}
```

### Intent Values (v0.1)

| Intent | Wann | Typische Actions |
|---|---|---|
| `workout_intro` | Session startet | — |
| `exercise_intro` | Neue Übung beginnt | `SHOW_EXERCISE` |
| `set_prompt` | "Gewicht? Reps?" | `REQUEST_INPUT(weight)` |
| `set_feedback` | Set geloggt, Feedback | `LOG_SET`, ggf. `START_TIMER` |
| `rest_timer` | Pause läuft | `START_TIMER` |
| `motivation` | Während letzter Reps | — |
| `workout_summary` | Session fertig | `END_SESSION`, `SHOW_SUMMARY` |
| `meal_suggestion` | "Was soll ich essen?" | — |
| `meal_feedback` | Nach MealCam | — |
| `supplement_info` | Supplement-Frage | — |
| `health_info` | Blutwerte erklären | — |
| `weekly_review` | Wochenreview | `SHOW_SUMMARY(week)` |
| `milestone` | PR, Streak, etc. | — |
| `check_in` | Proaktiver Check | `REQUEST_INPUT(energy)` |
| `general_chat` | Alles andere | — |
| `safety_redirect` | Medizinisch → Arzt | — |
| `fatigue_warning` | Engine meldet Fatigue | — |

---

## 5 Beispiel-Responses

### Beispiel 1: Workout — Set Feedback + Timer

Kontext: User hat Set 2 von Incline Dumbbell Press abgeschlossen. 26kg, 10 Reps, RPE 8. Neuer PR.

```json
{
  "intent": "set_feedback",
  "speech_text": "26 Kilo, 10 Reps — neuer PR bei Incline! Letzte Woche waren es 24. Stark! 90 Sekunden Pause.",
  
  "ui_cards": [
    {
      "type": "stat",
      "title": "Neuer PR!",
      "data": {
        "exercise": "Incline Dumbbell Press",
        "current": "26kg × 10",
        "previous": "24kg × 10",
        "improvement": "+2kg"
      },
      "priority": "high"
    }
  ],
  
  "actions": [
    {
      "id": "a1b2c3d4-set-log",
      "type": "LOG_SET",
      "params": {
        "exercise_id": "incline-db-press",
        "set_number": 2,
        "weight_kg": 26,
        "reps": 10,
        "rpe": 8,
        "is_pr": true
      },
      "requires_confirmation": false
    },
    {
      "id": "a1b2c3d4-timer",
      "type": "START_TIMER",
      "params": { "seconds": 90 },
      "requires_confirmation": false
    }
  ],
  
  "safety_flags": [],
  "evidence": [],
  "expects_input": false
}
```

---

### Beispiel 2: Rest Timer Ablauf + Nächster Set

Kontext: Timer ist abgelaufen. Set 3 von 4 steht an. Letzte Session war 26kg × 9 bei Set 3.

```json
{
  "intent": "set_prompt",
  "speech_text": "Pause vorbei. Set 3 von 4. Letztes Mal 9 Reps bei 26 Kilo. Gleiche Energie — los geht's!",
  
  "ui_cards": [
    {
      "type": "exercise",
      "title": "Incline Dumbbell Press",
      "data": {
        "set": "3/4",
        "target_weight": 26,
        "last_session_reps": 9,
        "rest_completed": true
      },
      "priority": "normal"
    }
  ],
  
  "actions": [],
  
  "safety_flags": [],
  "evidence": [],
  "expects_input": true,
  "input_type": "confirm"
}
```

---

### Beispiel 3: Fatigue Detection

Kontext: Set 1 war 12 Reps, Set 2 war 10, Set 3 war 7. Engine meldet: fatigue=moderate. User hat gestern nur 5h geschlafen.

```json
{
  "intent": "fatigue_warning",
  "speech_text": "Deine Reps fallen ziemlich ab — von 12 auf 7. Du hast gestern nur 5 Stunden geschlafen, das macht sich bemerkbar. Zwei Optionen: Wir kürzen auf 3 Sets statt 4, oder wir machen mit leichterem Gewicht weiter. Was willst du?",
  
  "ui_cards": [
    {
      "type": "comparison",
      "title": "Rep-Verlauf diese Übung",
      "data": {
        "sets": [12, 10, 7],
        "trend": "declining",
        "sleep_last_night": 5.0,
        "sleep_target": 7.5
      },
      "priority": "high"
    }
  ],
  
  "actions": [],
  
  "safety_flags": [],
  "evidence": [],
  "expects_input": true,
  "input_type": "choice",
  "choices": ["3 Sets reichen", "Leichteres Gewicht", "Weiter wie geplant"]
}
```

---

### Beispiel 4: Medical Escalation (Policy Gate: REDACT → SAFE_REWRITE)

Kontext: User hat Blutwerte hochgeladen. Vitamin D: 12 ng/ml (sehr niedrig). Ferritin: 8 ng/ml (kritisch niedrig).

LLM wollte sagen: ~~"Du hast einen schweren Vitamin-D-Mangel. Das erklärt deine Müdigkeit und Muskelschwäche. Nimm sofort 10.000 IU D3 täglich."~~

Policy Gate: **REDACT + SAFE_REWRITE**

Finale Antwort nach Policy Gate:

```json
{
  "intent": "safety_redirect",
  "speech_text": "Zwei Werte fallen auf: Dein Vitamin D liegt bei 12 ng/ml — das ist deutlich unter dem Referenzbereich von 30-100. Und dein Ferritin ist bei 8 ng/ml — auch unter dem üblichen Bereich. Bitte besprich beides zeitnah mit deinem Arzt. Wenn du nachtesten lässt: Vitamin D (25-OH), Ferritin, Transferrin, und großes Blutbild wären sinnvoll.",
  
  "ui_cards": [
    {
      "type": "list",
      "title": "Auffällige Blutwerte",
      "data": {
        "values": [
          { "marker": "Vitamin D (25-OH)", "value": "12 ng/ml", "reference": "30-100 ng/ml", "status": "low" },
          { "marker": "Ferritin", "value": "8 ng/ml", "reference": "30-300 ng/ml", "status": "low" }
        ],
        "retest_markers": ["Vitamin D (25-OH)", "Ferritin", "Transferrin", "Großes Blutbild"]
      },
      "priority": "high"
    }
  ],
  
  "actions": [],
  
  "safety_flags": ["medical_content"],
  "disclaimer": "Dies ist keine medizinische Beratung. Bitte konsultiere einen Arzt.",
  
  "evidence": [
    {
      "source": "Endocrine Society Clinical Practice Guideline",
      "doc_id": "kb:biomarkers-blood-tests",
      "relevance": 0.72
    }
  ],
  
  "expects_input": false
}
```

---

### Beispiel 5: Workout Summary + Session End

Kontext: Workout fertig. 5 Übungen, 20 Sets, 43 Minuten. 2 PRs. Gesamtvolumen 12.450kg (+8% vs letzte Woche).

```json
{
  "intent": "workout_summary",
  "speech_text": "Workout fertig! 43 Minuten, 5 Übungen, 20 Sets. Zwei neue PRs heute: Incline Press und Cable Row. Dein Gesamtvolumen liegt bei 12.450 Kilo — 8 Prozent mehr als letzte Woche. Wie war's insgesamt?",
  
  "ui_cards": [
    {
      "type": "stat",
      "title": "Workout-Zusammenfassung",
      "data": {
        "duration_minutes": 43,
        "exercises": 5,
        "total_sets": 20,
        "total_volume_kg": 12450,
        "volume_change_pct": 8,
        "estimated_calories": 340,
        "prs": [
          { "exercise": "Incline Dumbbell Press", "metric": "weight", "value": "26kg × 10", "previous": "24kg × 10" },
          { "exercise": "Cable Row", "metric": "weight", "value": "55kg × 12", "previous": "50kg × 12" }
        ]
      },
      "priority": "high"
    }
  ],
  
  "actions": [
    {
      "id": "session-end-001",
      "type": "END_SESSION",
      "params": {
        "session_id": "ws-2026-02-28-001",
        "duration_minutes": 43,
        "total_volume_kg": 12450
      },
      "requires_confirmation": false
    },
    {
      "id": "session-end-002",
      "type": "REQUEST_INPUT",
      "params": { "type": "rating" },
      "requires_confirmation": false
    }
  ],
  
  "safety_flags": [],
  "evidence": [],
  "expects_input": true,
  "input_type": "rating",
  "choices": ["💪", "😐", "😩"]
}
```

---

## Rendering Rules

### Voice Mode
- Spricht nur `speech_text`
- Actions werden im Hintergrund ausgeführt
- UI Cards werden auf dem Screen angezeigt (User schaut evtl. nicht hin)
- Bei `expects_input`: Wartet auf Voice-Command oder Button

### Text Mode
- `speech_text` als Chat-Bubble
- UI Cards als Rich-Content unter der Bubble
- Actions als Buttons wenn `requires_confirmation=true`
- `choices` als Quick-Reply Buttons

### Safety
- Wenn `safety_flags` nicht leer → Disclaimer wird angezeigt
- Wenn `safety_flags` enthält `medical_content` → Disclaimer-Banner persistent
- Policy Gate läuft SERVERSEITIG, nicht im Client

---

## Versionierung

- Contract Version: `v0.1`
- Breaking Changes → Major Version Bump
- Neue optionale Felder → Minor Version
- Client muss unbekannte Felder ignorieren (forward-compatible)
