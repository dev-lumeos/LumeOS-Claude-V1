---
nr: G-246
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_details, nutrition.nutrient_defs]
  dateien:
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-nutrition-nutrients.jsx
zahlen:
  gemessen: 2026-08-28
  detailzeilen: 110
  nutrient_defs: 138
  ohne_detailtext: 28
  function_de: 110
  deficiency_de: 110
  excess_de: 41
  top_sources_de: 110
---

# G-246 — die Detailtexte liegen in der Datenbank und werden nicht gelesen

## Berichtigung des urspruenglichen Befunds

`[read]` **Dieser Punkt sagte: *,,Im Bestand gibt es dafuer keine
Tabelle."*** `[cmd]` **Falsch.** `nutrition.nutrient_details`
existiert mit **110 Zeilen und 31 Spalten.**

`[read]` **Ich hatte den Satz aus einem Nebensatz in Claude Codes
G-239-Bericht uebernommen und nicht geprueft** — obwohl `SPEC_10`
`data/nutrientDetails.ts` unter *,,Statische Daten"* fuehrt und G-237
genau davon handelt.

## Was tatsaechlich da ist

`[cmd]` **Dreisprachig, je Naehrstoff:**

    function_de/en/th       was es ist und wofuer      110 gefuellt
    deficiency_de/en/th     was bei zu wenig           110
    excess_de/en/th         was bei zu viel             41
    top_sources_de/en/th    beste Quellen              110
    interactions_de/en/th   Wechselwirkungen
    tip_de/en/th            Hinweis
    detail_de/en/th         Langtext
    rda_standard_text       normale Tagesdosis
    rda_athlete_text        Tagesdosis fuer Sportler
    upper_limit_text        Obergrenze

`[cmd]` **Beispiel Vitamin A:**

    function      Sicht, Immunsystem, Haut
    deficiency    Nachtblindheit
    excess        Kopfschmerzen, Uebelkeit, Leberschaeden bei
                  chronischer Ueberdosierung
    rda_standard  900 ug (M), 700 ug (F)
    rda_athlete   Standard
    upper_limit   3000 ug
    sources       Leber, Karotten, Suesskartoffeln

`[cmd]` **Herkunft belegt je Zeile** — `source`, `source_path`, `raw`.

`[cmd]` **28 der 138 Naehrstoffe haben keinen Detailtext**, und **kein
Detailtext haengt in der Luft** (0 ohne `nutrient_defs`-Eintrag).

`[read]` **`excess_de` nur bei 41** — plausibel, weil nicht jeder
Naehrstoff eine sinnvolle Ueberdosierung hat. **Aber es gehoert
geprueft, ob 41 die richtigen sind.**

## Der Mockup zeigt dieselbe Gestalt

`[cmd]` **`module-nutrition-nutrients.jsx`, 891 Zeilen, fuehrt 79
Naehrstoffe** mit `what` / `def` / `tox` / `sources` — **alle 79
vollstaendig.**

`[read]` **Die Feldnamen unterscheiden sich, die Sache nicht:**
`what` ist `function_de`, `def` ist `deficiency_de`, `tox` ist
`excess_de`. **Dieselbe Klasse wie `LogDoseModal` gegen
`LogDoseFenster`.**

## Was zu bauen ist

**Die Kacheln im aufgeklappten Naehrstoff.** `[read]` **Keine
Entscheidung fehlt, keine Tabelle fehlt** — die Ansicht aus G-239
zeigt Werte und Referenzen, **die Erklaerung dazu liegt daneben
unbenutzt.**

`[read]` **Und `rda_athlete_text` ist der Teil, den ein Sportler
sucht** — eine eigene Angabe neben dem Normalwert.

## Verwandt

**C-210** — *,,Die 28 fehlenden Naehrstofftexte"*. `[cmd]` **Die Zahl
stimmt exakt mit den 28 ohne Detailtext ueberein.** `[read]`
**Derselbe Befund, unabhaengig zweimal gefunden.**

**G-237** (MIN-8 der Opus-Review) — `nutrientDetails.ts` als
statisches Array, `food_sources` veraltet. `[read]` **Der Bestand ist
inzwischen in der Datenbank; der Punkt ist vermutlich ueberholt.**
