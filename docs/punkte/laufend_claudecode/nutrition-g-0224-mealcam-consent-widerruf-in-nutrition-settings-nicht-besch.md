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

### A1 ? Die MealCam-Freigabe liegt NIRGENDS

`[cmd]` **Gemessen, alle Schemata:**

    Spalten mit consent|mealcam|freigab|zustimm
      -> coach.client_consent_log.revokes_consent_id  (Coach, nicht MealCam)
    Spalte `training_consent`                    0 Treffer
    `training_consent` in apps/ packages/ supabase/  0 Treffer
    Tabellen mit consent|photo|image|cam im Namen
      -> auth.oauth_consents, coach.client_consent_log
    Buckets: genau einer, `medical-originals` (1 Objekt)

`[read]` **Nicht im Bild, nicht in einer Sitzung, nicht in einer
Spalte.** **Es gibt keinen Zustand, der widerrufen werden koennte** ?
und **kein Bild, an dem er haengen wuerde.**

**Die ADR nennt das Feld namentlich.**
`docs/specs/Nutrition/04_adrs/ADR_MEALCAM_CONSENT.md`:

    training_consent: true | false
    ### Widerruf
    User kann Freigabe jederzeit widerrufen.
    Bei Widerruf: Bilder aus Trainingspool entfernen.

`[cmd]` **Der Name `training_consent` kommt im gesamten Repo nicht
vor** ? weder als Spalte noch im Code.

**Was von den neun Bauteilen aus `SPEC_10_PASS2_PATCH.md` gebaut
ist:**

    MealCamButton          nicht gebaut
    MealCamModal           in 5 Dateien
    MealCamImageInput      nicht gebaut
    MealCamProcessing      nicht gebaut
    MealCamResults         nicht gebaut
    MealCamFoodItem        nicht gebaut
    MealCamUnknownItem     nicht gebaut
    MealCamConfirmation    nicht gebaut
    MealCamConsentBanner   nicht gebaut

`[cmd]` **Und `MealCamModal` ist eine Attrappe:**
`modale.tsx:120-136` fuehrt drei fest verdrahtete Treffer
(*„Chicken breast · grilled"*, 94 % Konfidenz). **Kein Upload, kein
Schreibweg, keine Freigabefrage.**

`[read]` **Damit sind die drei fehlenden Teile aus G-224
(Settings-Bauteil, Liste je Bild, Sammelwiderruf) nicht das
Problem** ? **es fehlt die Ebene darunter.** **Ein Widerrufsknopf
ohne Zustand waere ein Regler ohne Wirkung** (C-426), und eine Liste
je Bild braucht Bilder.

`[read]` **Das ist ein Codex-Auftrag** ? Tabelle und Spalte gehoeren
nach `supabase/`. **Ich habe keine Freigabe erfunden.**

### A2 ? Die zwei Endpunkte gibt es nicht ? kein A-71

`[cmd]` **`recalculate` in `apps/web/src`: 2 Treffer**, beide in
`recovery` (*„Save check-in · recalculates score"*) ? **keiner in
nutrition.**

`[cmd]` **Alle nutrition-API-Routen aufgelistet:** ansicht, diary,
foods (+categories, smart-preview), local-schema, naehrstoff, plan,
preferences (+catalog), rezept, water. **Keine `meal-items`, keine
`meals`, kein `recalculate`.**

`[read]` **Damit ist es NICHT der zwoelfte Fall von A-71.** A-71
heisst: **der Weg existiert und hat keinen Aufrufer.** `[read]`
**Hier existiert der Weg nicht** ? er steht im
`NUTRITION_WORKORDER_PLAN_V1.md:102` als geplant
(`POST /meal-items/:id/recalculate`), **als Workorder
`nutrition-recalculate-v1`, Phase 3.**

**Zahl: 0 Endpunkte, 0 Aufrufer.**

### A3 ? Die Zeilen koennen vergleichen: 9065 / 9065

`[cmd]` **Beide Seiten tragen einen Zeitstempel:**

    nutrition.meal_items.frozen_at   der Schnappschuss
    nutrition.foods.updated_at       der Bestand

`[cmd]` **Gemessen:**

    Zeilen gesamt                          9065
    mit `frozen_at`                        9065
    mit `food_id`                          9065
    vergleichbar (beides gesetzt)          9065
    davon veraltet (updated_at > frozen_at)   0

`[cmd]` **Die Zeitfenster erklaeren die Null:**
`frozen_at` von **2026-08-23 bis 2026-09-06**, `foods.updated_at`
durchgehend **2026-08-15**. `[read]` **Jeder Schnappschuss ist
neuer als seine Quelle** ? ein echter Zustand, kein Messfehler.

`[cmd]` **`custom_food_id`: 0 Zeilen** ? keine eigenen Lebensmittel
im Bestand.

**Zahl: 9065 Zeilen / 9065 vergleichbar.**

`[cmd]` **Und ein Befund dabei:** `frozen_at` **stand seit C-03 in
der Tabelle und wurde nie gelesen.** `diary-model.ts` SCHREIBT sie an
drei Stellen (Insert, Mengenaenderung, Neueinfrieren) ? **kein
Leseweg nahm sie mit.** `[read]` **Das ist die Klasse A-71 auf
Spaltenebene:** der Wert liegt da, ungenutzt.

### A4 ? Der Knopf ist gebaut und belegt

**Kein neuer Endpunkt.** `[cmd]` **`PATCH /api/nutrition/diary` ruft
`updateMealItemAmount`, und das rechnet die Naehrwerte aus dem
HEUTIGEN Bestand neu und setzt `frozen_at` mit**
(`buildMealItemAmountUpdate`). `[read]` **Mit unveraenderter Menge
ist genau das eine Neuberechnung** ? **die zwei Endpunkte aus
SPEC_10 waeren eine zweite Wahrheit neben einem Weg, der dasselbe
tut.**

**Gebaut:**

    diary-model.ts   `frozen_at` + `food_updated_at` im Typ,
                     `istSchnappschussVeraltet()` als eigene Funktion
    diary-write.ts   `frozen_at, foods!left(updated_at)` in der Abfrage
    mahlzeiten.tsx   Knopf „Neu berechnen" an der ueberholten Zeile

`[read]` **Die Entscheidung steht als eigene Funktion**, nicht als
Bedingung im JSX ? **sonst prueft der Waechter nur das Wort.**

`[read]` **`foods!left`, nicht `!inner`:** ein manueller Posten und
ein eigenes Lebensmittel haben `food_id IS NULL`. **Mit `!inner`
fielen beide aus der Liste**, und das Tagebuch waere stillschweigend
kuerzer ? **dieselbe Klasse wie G-348.**

`[cmd]` **Buehne:** EINE Zeile von `test-user` auf `frozen_at
2026-08-01` gesetzt. `[read]` **`foods.updated_at` NICHT angefasst**
? das sind gemeinsame BLS-Daten.

`[cmd]` **Am Schirm, `/v2/nutrition?datum=2026-09-06`:**

    Knoepfe „Neu berechnen"   1
    Titel                     Eingefroren 2026-08-01, Bestand 2026-08-15
    Knoepfe danach            0
    Fehlerhinweis             0

`[cmd]` **In der Datenbank, vorher/nachher:**

    frozen_at   2026-08-01  ->  2026-09-09 01:08:41
    enercc      877,5       ->  877,5
    amount_g    250         ->  250
    veraltete Zeilen  1  ->  0

`[read]` **`enercc` bleibt gleich, und das ist richtig:** die
Lebensmitteldaten haben sich nicht geaendert, nur der Zeitstempel des
Schnappschusses. **Waere der Wert gesprungen, waere die Rechnung
falsch gewesen.**

`[read]` **Genau ein Knopf, an genau der veralteten Zeile** ? die
anderen 13 Zeilen von `test-user` tragen keinen. **Die Buehne hat
sich selbst zurueckgebaut**, der Endstand ist 0 veraltete Zeilen und
14 Zeilen wie vorher.

### A5 ? E-72: keine nackte Null

`[cmd]` **Am Schirm gezaehlt, oberhalb der Trennlinie**
(verschachtelte Karten gefiltert, sonst zaehlt ein Rahmen mit):

    Kacheln oben        17
    mit Daten           10
    mit Leerhinweis      3
    Attrappen            4
    NACKTE NULL          0

`[cmd]` **Die drei Leerhinweise sind benannt:** *„Keine offenen
Aktionen"*, *„Nichts geplant / Keine geplante Trainingseinheit"*,
*„Setz dir ein Ziel"*.

`[read]` **Vier Nullen stehen am Schirm und sind KEIN Verstoss** ?
sie tragen ihren Bezug: `Hydration` zeigt *„getrunken 0 ml"* neben
*„aus Lebensmitteln 160,3 ml"*, `Vitamin C` *„0 mg / 110"*.
**Eine Null mit Bezugsgroesse ist ein Ergebnis, keine leere
Kachel.**

`[cmd]` **Der neue Knopf verletzt E-72 nicht:** **kein Knopf heisst
nicht „kein Zustand"** ? ist der Stand aktuell, gibt es nichts zu
tun. **Und ein Fehlschlag wird benannt** (*„Neu berechnen
fehlgeschlagen: …"*), nicht stillschweigend verschluckt.

### A6 ? E-69: Referenz unter der Linie

`[cmd]` **Trennlinie: 1.** `[cmd]` **Kacheln oberhalb: 17,
Referenzen unterhalb: 10.**

`[read]` **Die Zahl unten ist kleiner als oben, und das ist
richtig** ? **eine Attrappe braucht keine Referenz auf sich selbst**
(4 der 17 sind Attrappen). **Der Rest deckt die angebundenen
Kacheln.**

`[cmd]` **Unten stehen unter anderem `Hydration` und
`Micronutrient snapshot`** als je eigene Referenz ? **je Kachel
eine, kein Block.**

### Waechter

`[cmd]` **tsc `--noEmit`** sauber. `[cmd]` **`next lint`:** *No
ESLint warnings or errors*. `[cmd]` **Tests: 1510 -> 1518 pass, 0
fail** (acht neue).

`[cmd]` **Ein Waechter ist unterwegs rot geworden, und der Befund
gehoert dazu:** `not ok 614 - G-348: food_source kommt durch den
ganzen Leseweg`. **Ursache:** ich hatte die `select`-Zeile ueber
mehrere Zeilen verkettet, und der Waechter prueft
`/\.select\('[^']*food_source[^']*'\)/` ? **eine Verkettung macht
ihn rot, obwohl die Felder mitkommen.** `[read]` **Behoben durch
Rueckkehr zu EINER Zeichenkette** ? nicht durch Aendern des
Waechters. **Er prueft die Form, und die Form ist billig
einzuhalten.**

**Sabotageprobe, je Waechter einzeln:**

    `>=` statt `>`                    -> not ok 3 (gleicher Zeitpunkt)
    frozen_at + Verbund entfernt      -> not ok 7 (Abfrage holt sie nicht)

`[read]` **Jede Sabotage traf genau einen Waechter**, die uebrigen
blieben gruen. **Zurueckgenommen, 1518 gruen** ? und der Knopf am
Schirm nach dem Rueckbau erneut gemessen: **1 Knopf, 0 danach.**

### Neustart

`[read]` **Keiner noetig.** Geaendert sind nur `apps/web/src`
(heisses Nachladen). **Nichts in `packages/ui`, keine Konfiguration,
keine neuen Abhaengigkeiten.** `[cmd]` **Belegt: die Messung zu A4
lief gegen den laufenden Server und sah den neuen Knopf.**

### Was offen bleibt

**1 ? Die MealCam-Freigabe braucht einen Zustand** (A1). **Tabelle
und Spalte gehoeren nach `supabase/`** ? Codex-Auftrag. **Bis dahin
ist G-224 nicht baubar**, und die drei genannten Teile beschreiben
die Ebene darueber.

**2 ? Ein Kommentar in `nutrition/page.tsx:6` behauptet
`meals und meal_items haben 0 Zeilen`.** `[cmd]` **Gemessen: 9065
Zeilen ueber fuenf Konten**, davon 14 auf `test-user`. **Der
Kommentar ist zu einer Falschaussage gealtert** ? dieselbe Klasse
wie die SSOT-Faelle aus G-382.

**3 ? Die zwei Endpunkte aus SPEC_10** (A2) bleiben ungebaut. `[read]`
**Mein Urteil: sie sollten es bleiben** ? `PATCH` tut dasselbe, und
ein zweiter Weg waere eine zweite Wahrheit. **Die Entscheidung ist
deine.**


## Abnahme

_(vom Orchestrator)_
