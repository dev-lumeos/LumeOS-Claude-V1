---
nr: E-66
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-193, C-411, E-40, E-43, E-45, E-55]
modul: nutrition
---

# E-66 — MealCam erkennt nicht nur Lebensmittel

## Entscheidung

Tom, 2026-09-07, in vier Antworten und zwei Ergaenzungen.
Vollstaendig ausgearbeitet in
`docs/specs/Nutrition/01_current_specs/SPEC_11_MEALCAM.md`.

## 1 · Es gibt keinen Posten ohne Naehrwerte

> es gibt die auswahl NUR parent ohne naehrstoffe nicht, wenn es
> nicht erkannt wird muss der user es deklarieren

    EXACT_MATCH    Naehrwerte aus dem BLS-Eintrag
    PARENT_MATCH   der Nutzer waehlt die Zubereitung -> Exact
    AMBIGUOUS      der Nutzer waehlt aus den Kandidaten -> Exact
    NO_MATCH       der Nutzer deklariert

`[read]` **`PARENT_MATCH` ist ein Zwischenstand, kein
Tagebucheintrag.**

`[cmd]` **`meal_items.nutrients` traegt 96 Schluessel** — **ein halb
gefuellter Posten waere in 96 Feldern halb falsch.**

## 2 · Ein Posten kann eine Zusammensetzung sein

> nutrients detailliert speichern, darstellung kann eine sammlung
> verschiedener nutrients von bls sein

    Spaghetti Napoli
      Spaghetti (Teigwaren)   ein BLS-Eintrag
      Tomatensauce            Rezept als Sammelpunkt
        Tomate, Olivenoel, Zwiebel, Gewuerz

`[cmd]` **`recipe_ingredients` traegt das bereits.** `[cmd]` **Und
E-40 macht je Zutat eine Zeile in `meal_items`, einzeln anpassbar.**

## 3 · Zwei Aktionen bei Unsicherheit

`ACCEPT` durch den Nutzer, `ASK_USER`. **Crop, OCR und Barcode sind
Phase 4.**

## 4 · Die Mahlzeit steht vor dem Foto

> klickt user mealcam deklariert er zuerst was das fuer eine
> mahlzeit ist, das kann auch eine geplante sein oder eine neue

`[read]` **Damit ist G-346 fuer MealCam beantwortet: gewaehlt, nicht
abgeleitet.**

`[cmd]` **Und der geplante Fall traegt E-42:** **das Ergebnis ist
`confirmed` oder `deviated`.**

## 5 · MealCam legt Rezepte an, der Admin sieht sie

> mealcam kann rezepte im userprofil erstellen, das rezept muss aber
> auch im adminbereich zur validierung auftauchen

    im Nutzerprofil    sofort benutzbar, gehoert dem Nutzer
    im Adminbereich    erscheint zur Pruefung

`[cmd]` **`food_curation_candidates` und `food_curation_decisions`
existieren** — **aber `target_type` kennt kein Rezept** (C-411).

## 6 · Zwei Wege zu einem globalen Rezept

> wir werden bald automatische researcher haben, der kann genau
> solche rezepte mit bild, ingredients, kochanleitungen
> recherchieren und als knowledge ablegen

    von unten   MealCam-Rezepte -> Kuration -> Katalog
    von oben    Researcher -> wissen -> Katalog

`[cmd]` **Das `wissen`-Schema traegt zehn Tabellen** — der Ort
existiert.

`[read]` **Aber ein recherchiertes Rezept ist keine
Naehrwertquelle** — **E-43 gilt: die Naehrwerte kommen je Zutat aus
dem BLS.**

## Und eine Korrektur am Blueprint

`[cmd]` **Der Blueprint zeichnet `Cooked -> Grilled | Roasted |
Fried`.**

`[cmd]` **Im BLS sind das Geschwister:** `132` gekocht, `172`
gegrillt, `162` gebraten im Ofen — **59 Zubereitungscodes auf
derselben Ebene** (`docs/ssot/44-bls-codestruktur.md`).

Tom: *,,wenn sie gekocht ist ist sie nicht gegrillt."*

`[read]` **Damit ist `PARENT_MATCH` mechanisch definierbar:**
**Stellen 1-4 des BLS-Codes sicher, 5-7 offen.** `[read]` **Kein
Modell muss eine Hierarchie lernen.**
