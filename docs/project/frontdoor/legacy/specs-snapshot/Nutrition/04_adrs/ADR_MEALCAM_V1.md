# ADR: MealCam ist V1 — Barcode Scanner ist Phase 2

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

---

## Kontext

Für das Food-Logging über visuelle Eingaben gab es zwei Kandidaten:
1. **MealCam** — Kamera-Foto eines Tellers → KI-Erkennung → Portionsschätzung
2. **Barcode Scanner** — Kamera scannt EAN/UPC → Produktdatenbank-Lookup

## Entscheidung

**MealCam ist V1.**
**Barcode Scanner ist Phase 2.**

## Begründung

MealCam differenziert LumeOS von allen anderen Nutrition-Apps. Es gibt keinen seriösen Competitor, der Teller-Erkennung mit BLS-Matching und Portionsschätzung anbietet.

Barcode Scanner ist ein Commodity-Feature. Jede Nutrition-App hat Barcode-Lookup. Es schafft keinen Differenzierungsvorteil und erfordert eine externe Produktdatenbank (OpenFoodFacts oder ähnliches).

## V1 MealCam Flow

```
User öffnet Kamera oder lädt Bild hoch
→ Vision-Provider (TBD) analysiert Bild
→ Erkennt mehrere Foods auf dem Teller
→ Schätzt Portionsgrößen
→ Matcht erkannte Foods gegen BLS 4.0
→ Wenn kein guter Match: Custom-Food-Vorschlag
→ Zeigt Confidence Score pro Food
→ Niedrige Confidence blockiert Auto-Hinzufügen
→ User bestätigt/korrigiert jedes Item einzeln
→ Erst nach User-Bestätigung: Meal Item erstellen
```

**MealCam darf NIE automatisch finale Meal Items schreiben.**

## Vision-Provider

Noch nicht final entschieden für V1. Die Entscheidung erfolgt vor der Implementierung.
Spec ist Provider-agnostisch.

## Datenschutz

Siehe `ADR_MEALCAM_CONSENT.md` für Details.

## Barcode Scanner Phase 2

Barcode Scanner erfordert eine Produktdatenbank (typisch OpenFoodFacts).
Diese Entscheidung wird separat getroffen wenn BLS-Integration stabil läuft.
