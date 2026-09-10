# Plan: was an LumeOS noch zu tun ist

**2026-09-08.** Tom: *,,plane was es noch zu tun gibt an lumeos.
prioritaer: nutrition, goals&body, training, supplements,
recovery."*

`[read]` **Coach ist abgeschlossen bis auf G-410** ? **danach gehen
wir punktuell durch.**

---

## Die Lage in Zahlen

    Modul          Bauteile      Tabellen   Zeilen
    ------------------------------------------------
    nutrition      32 von 38     45         1.039.991
    goals          59 von 65      7               450
    training       45 von 45      8            8.613
    supplements    65 von 67     59            28.040
    recovery       66 von 71      7               949

`[cmd]` **Gemessen mit `tools/vollstaendigkeit.mjs` und direkt.**

`[read]` **Training ist bei den Bauteilen vollstaendig, Recovery
fast** ? **die Luecken liegen woanders.**

---

## 1 · NUTRITION — sechs Bauteile fehlen

`[cmd]` **`FoodPreferencesView`** ? 6 Kacheln.
`[cmd]` **`NutrientAnalysisView`** ? **plus
`NutrientDetailModal` und `NutrientTable`.**
`[cmd]` **`NutritionSettingsModal`.**

`[read]` **`NutrientAnalysisView` ist der groesste Posten** ?
**die 138 Naehrstoffe haben eine Ansicht in der Vorlage, gebaut
ist nur die Heatmap in `tab-insights`.**

### Die Daten stehen

`[cmd]` **1,04 Mio Zeilen, 45 Tabellen** ? **das groesste Modul.**

`[cmd]` **21 leer, aber die meisten sind Kuratierungswerkzeuge**
(`food_curation_*`, `exclusion_presets`).

`[read]` **`foods` ist leer** ? **die Suche laeuft ueber
`food_search`, das ist gewollt.**

### Offene Punkte

`[cmd]` **`C-323` Speisekarte, `G-223` Neuberechnen-Knopf
(abgenommen), Essenskamera.**

`[read]` **Und die Handkuratierung: 124 Zutaten mit
`name_display`** ? **das Feld ist verdrahtet, die Namen fehlen.**

---

## 2 · GOALS & BODY — sechs Bauteile, drei Tabellen

`[cmd]` **Fehlend:** `CompTab` **(+`BodyFatScale`),** `GoalsTab`
**(+`GoalCard`),** `MeasureTab`, `MetricsTab`.

`[read]` **Vier von acht Reitern sind nicht gebaut.**

### Und die Tabellen fehlen

    user_goals          11 Zeilen   da
    body_measurements  362          da
    progress_photos     FEHLT
    phase_transitions   FEHLT
    body_weight_log     FEHLT

`[cmd]` **`LogPhotoModal` ist gebaut** ? **es schreibt in nichts.**

`[read]` **Das ist der wichtigste Befund des Moduls:** **drei
Modale ohne Ziel.**

---

## 3 · TRAINING — Bauteile vollstaendig, Programme fehlen

`[cmd]` **45 von 45.**

### Aber es gibt keine Programmtabelle

    exercises          1.416
    exercise_muscles   6.588
    muscle_groups         95
    equipment             58
    workout_sessions      66
    workout_sets         258

    programs / plans / routines   FEHLT GANZ

`[read]` **Der Katalog ist reich, die Protokolle laufen** ?
**aber ein Plan kann nirgends stehen.**

`[cmd]` **Das blockiert:**

    C-452   ein Kauf kommt nirgends an
            (Marketplace verkauft Programme)
    Coach   "Program: PPL Woche 6/12" im Dashboard
    G-410   der Draft zeigt Plaene als Attrappe

`[read]` **Drei Module warten auf dieselbe Tabelle.**

`[read]` **Das ist der groesste Einzelposten dieser Liste.**

---

## 4 · SUPPLEMENTS — zwei Bauteile, viele Huellen

`[cmd]` **Fehlend:** `ExtendedGate` **(in `SuppExtended`) und**
`SuppInteractions`.

### Die Zyklen stehen seit heute

`[cmd]` **C-456 abgenommen:** `user_supplement_cycles`,
`supplement_cycle_events`, `supplement_protocols`,
`supplement_protocol_items` **mit `weeks_start`/`weeks_end`, drei
PCT-Vorlagen.**

`[read]` **Alle noch leer** ? **der Schreibweg steht, die
Oberflaeche fehlt.**

### Der Injektionsplaner

`[cmd]` **C-455 und C-454 abgenommen:** **16 Orte mit zehn neuen
Spalten, `injection_site_overrides`,
`user_injection_site_selections` mit `body_area_code`.**

`[cmd]` **G-396 hat die Karte gebaut** ? **aber gegen den alten
Stand.**

`[read]` **Die Karte muss auf die Nutzerauswahl umgestellt
werden** ? **E-79.**

---

## 5 · RECOVERY — fuenf Bauteile, vier Tabellen

`[cmd]` **Fehlend: 26 Daten/Formeln, darunter `ACWR_DATA`,
`MODALITY_BONUS`, `calcModalityBonus`,
`calcTrainingLoadScore`.**

### Und die Tabellen

    scores            370   da
    checkins          370   da
    muscle_soreness   FEHLT
    modality_logs     FEHLT
    protocols         FEHLT
    hrv_readings      FEHLT

`[cmd]` **`RecMuscleMap`, `RecModalities`, `RecProtocols`,
`RecHRV` sind gebaut** ? **vier Ansichten ohne Tabelle.**

`[read]` **Dasselbe Muster wie bei Goals.**

---

## Die Reihenfolge, die daraus folgt

### Zuerst: die drei fehlenden Tabellengruppen

`[read]` **Weil sie mehrere Module gleichzeitig blockieren.**

    1  training.programs
       -> Training, Coach, Marketplace
       -> C-452, das Coach-Dashboard, G-410

    2  recovery: muscle_soreness, modality_logs,
       protocols, hrv_readings
       -> vier gebaute Ansichten ohne Ziel

    3  goals: progress_photos, phase_transitions,
       body_weight_log
       -> drei gebaute Modale ohne Ziel

`[read]` **Alle drei sind Codex-Auftraege.**

### Dann: die Oberflaechen, die auf fertige Tabellen warten

    4  Supplements-Zyklen  -> C-456 steht
    5  Injektionskarte     -> C-454/C-455 stehen, E-79
    6  Goals: vier Reiter  -> nach 3
    7  Nutrition: NutrientAnalysisView

### Zuletzt: die kleinen Luecken

    FoodPreferencesView, NutritionSettingsModal,
    ExtendedGate, SuppInteractions

---

## Was NICHT auf dieser Liste steht

`[read]` **Marketplace** ? **13 Tabellen live, aber ohne
Auslieferung** (C-452). `[read]` **Wartet auf
`training.programs`.**

`[read]` **Buddy** ? **42 von 42 Bauteilen, alles Attrappe.**
`[read]` **Braucht die Modellanbindung, nicht Tabellen.**

`[read]` **Admin** ? **nie gemessen.** `[cmd]` **Der Draft hat
`module-admin-v2.jsx`, 55 KB.**

`[read]` **Medical** ? **OCR steht seit heute (C-457), die
Oberflaeche fehlt.**
