# ADR: Nutrition ↔ Supplements API Boundary

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

---

## Kontext

Für die Micronutrient Review muss Nutrition wissen, welche Nährstoffe ein User an einem Tag über Supplements aufgenommen hat. Die Frage war: Speichert Nutrition Supplement-Daten selbst, oder fragt es das Supplements-Modul ab?

## Entscheidung

**Klare Modulgrenze: Supplements-Modul speichert alle Supplement-Daten.**
**Nutrition fragt Supplement-Intake nur per API ab.**

```
Supplements-Modul speichert:
  → Supplement-Produkte
  → Inhaltsstoffe (Nährstoff-Codes)
  → Dosierungen
  → supplement-spezifische Risiken
  → Interaktionen

Nutrition-Modul speichert:
  → keine Supplement-Produkte
  → keine Supplement-Dosierungen
  → Nur: konsolidierte Tages-Nährstoffwerte aus beiden Quellen
```

## API-Abfrage

```
GET http://supplements:5200/api/supplements/daily-intake?user_id=:uid&date=:date

Response:
{
  "nutrient_totals": {
    "VITD": 25.0,
    "ZN": 10.0,
    "MG": 200.0,
    ...
  },
  "supplement_data_available": true
}
```

## Fallback-Verhalten

Wenn Supplements-API nicht erreichbar:

```
supplement_data_available: false
```

Micronutrient Review zeigt dann:
- Food-Anteil: vollständig
- Supplement-Anteil: "Nicht verfügbar"
- Gesamtstatus: auf Basis Food-Daten allein
- Kein Hard-Failure — keine Blockierung des Users

## Micronutrient Review Darstellung

```
Vitamin D
  Food-Anteil:       4.2 µg  (21% RDA)
  Supplement-Anteil: 25.0 µg (125% RDA)
  Gesamt:            29.2 µg (146% RDA)
  UL:                100 µg
  Status: 🟢 (im Zielbereich)
```

Score darf Supplement-Anteil nicht ignorieren wenn verfügbar.
Score darf rote Einzelwerte nicht verstecken.

## Konsequenz für UL-Logik

Wenn User Supplements + Food kombiniert → UL-Überschreitung kann real werden.
Nutrition muss UL prüfen auf Basis von (Food + Supplement) kombiniert.

Fettlösliche Vitamine (A, D, E, K), Eisen, Zink, Selen, Jod — besondere Aufmerksamkeit für UL.
