# ADR: MealCam Consent — Training-Freigabe und Datenschutz

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

---

## Kontext

MealCam-Bilder und User-Korrekturen sind wertvolles Trainings-/Evaluationsmaterial für die spätere Verbesserung der Food-Erkennung. Gleichzeitig sind Fotos von Mahlzeiten sensible persönliche Daten.

## Entscheidung

### Standard: Privat

MealCam-Bilder werden **standardmäßig privat** gespeichert.
Keine Nutzung für Training oder Evaluation ohne explizite Freigabe.

### Opt-in für Training-Freigabe

User kann separat (nicht im Onboarding-Flow) eine Training-Freigabe erteilen.

```
training_consent: true | false
```

Bei `training_consent: true`:
- Bilder werden anonymisiert für Training/Evaluation genutzt
- Keine Verknüpfung mit User-ID in Trainings-Pipeline

### Widerruf

User kann Freigabe jederzeit widerrufen.
Bei Widerruf: Bilder aus Trainingspool entfernen.
Bestätigte Diary-Nährwerte bleiben trotz Bildlöschung erhalten.

### Coach-Zugriff

Coach sieht MealCam-Bilder **nur bei expliziter User-Freigabe** über Nutrition Permissions.

### Admin-Zugriff

Admin sieht Bilder nur bei expliziter Debug-/Support-Freigabe durch User.

## Datenstruktur für spätere Modell-Verbesserung

V1 speichert pro Scan für spätere Nutzung:

```json
{
  "original_image": "path/to/image",
  "detected_items": [
    {
      "food_id": "uuid",
      "food_name": "Hähnchenbrust",
      "confidence": 0.78,
      "estimated_amount_g": 180
    }
  ],
  "bls_matches": [...],
  "confidence_scores": {...},
  "user_corrections": [
    {
      "original_food_id": "uuid",
      "corrected_food_id": "uuid",
      "corrected_amount_g": 200
    }
  ],
  "final_diary_entry": {...},
  "training_consent": false
}
```

Nur wenn `training_consent: true` → Daten in Trainings-Pool verfügbar.
