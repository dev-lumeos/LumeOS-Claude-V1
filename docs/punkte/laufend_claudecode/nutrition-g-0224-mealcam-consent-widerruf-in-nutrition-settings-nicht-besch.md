---
nr: G-224
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
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

## Gemessen am 2026-09-08, vor der Auftragsvergabe

`[cmd]` **`nutrition` hat KEINE Spalte mit `consent` oder
`mealcam` im Namen.**

`[read]` **Der Widerruf ist versprochen und nicht baubar** ?
**es gibt nichts zu widerrufen.**

## Auftrag

**Mitbeauftragt: G-223.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
nutrition.**

`[cmd]` **`ADR_MEALCAM_CONSENT.md`** ? **dort steht das
Versprechen.** `[cmd]` **Und `SPEC_10_PASS2_PATCH.md`** ? **dort
steht, was gebaut wurde.**

### 1 · G-224 — miss zuerst, was fehlt

`[read]` **Der Punkt nennt drei fehlende Teile** ?
**Settings-Bauteil, Liste je Bild, Sammelwiderruf.**

`[cmd]` **Aber die Datenbank fuehrt keinen Zustand** ? **miss, wo
die Freigabe heute liegt.**

`[read]` **Wenn sie nirgends liegt: melden, nicht bauen** ? **das
waere ein Codex-Auftrag.**

`[read]` **Wenn sie im Bild liegt oder in einer Sitzung: sag, wo
und wie lange.**

### 2 · G-223 — der Neu-berechnen-Knopf

`[cmd]` **Zwei Endpunkte stehen:**
`POST /api/nutrition/meal-items/:id/recalculate` **und**
`.../meals/:id/recalculate`.

`[read]` **Miss, ob sie aufgerufen werden** ? `rg` **auf beide
Pfade.**

`[read]` **Wenn nicht: zwoelfter Fall von A-71** ? **der
Schreibweg steht, niemand ruft ihn.**

`[cmd]` **`SPEC_10` sagt: der Knopf erscheint, wenn die
Lebensmitteldaten neuer sind als der Schnappschuss.**

`[read]` **Miss, ob die Kachel das ueberhaupt vergleichen kann** ?
**tragen die Zeilen einen Zeitstempel?**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  wo liegt die MealCam-Freigabe heute? Gemessen,
        mit Fundstelle. Oder: nirgends.
    A2  die zwei Endpunkte: Aufrufer? Zahl.
    A3  koennen die Zeilen Schnappschuss und Bestand
        vergleichen? Zahl: Zeilen / davon vergleichbar.
    A4  wenn der Knopf baubar ist: gebaut und belegt.
        Zahl: eine Neuberechnung vorher/nachher.
    A5  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A6  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** ? **Codex arbeitet an C-428.**
**Keine Freigabe erfinden** ? **wenn der Zustand fehlt, ist das
ein Befund.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`** ? **Tom haelt
ihn.**

`[read]` **Und sag, wenn deine Aenderung einen Neustart braucht.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
