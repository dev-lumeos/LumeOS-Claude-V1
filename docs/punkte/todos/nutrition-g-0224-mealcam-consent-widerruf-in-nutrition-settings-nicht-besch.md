---
nr: G-224
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-224 — MealCam Consent-Widerruf in Nutrition Settings nicht beschrieben

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-2.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`ADR_MEALCAM_CONSENT.md`:
> User kann Freigabe jederzeit widerrufen.

`SPEC_10_PASS2_PATCH.md` definiert nur `MealCamConsentBanner` (nach Confirmation, Opt-in für einzelne Bilder bzw. global). Es fehlt:
- Settings-Component für globale Verwaltung (z. B. `MealCamConsentSettings`)
- Liste aller Bilder mit Consent-Status pro Bild (zumindest aggregiert: "X Bilder im Trainings-Pool")
- Bulk-Widerruf-Button ("Alle Bilder aus Trainings-Pool entfernen")
- Settings-Pfad für Coach-Bild-Freigabe (separat von Training-Consent)

`SPEC_03_USER_FLOWS.md` hat keinen Consent-Flow.

`SPEC_07_PASS2_PATCH.md §4` Schritt 5 hat `POST /mealcam/scan/:id/consent` für einzelnen Scan, aber kein globales Widerruf-Endpoint und kein "Alle Bilder löschen"-Endpoint.

**Konsequenz:** Datenschutz-Anforderung "jederzeit widerrufen" ist nur teilweise umsetzbar. Compliance-Lücke.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** E-20 (Cam: zwei Zwecke, zwei Einwilligungen). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.
