# Toms Bildschirmfotos — der Anlass, nicht die Wiederholung

**Abgelegt 2026-08-22.** Tom hat diese Aufnahmen geschickt, weil der
Orchestrator behauptet hatte, es gebe keine Arbeit fuer zwei freie
Agenten. **Sie sind der Beleg, dass die TODO-Liste ein Befundregister
ist und kein Arbeitsvorrat.**

`[read]` **Wer hier landet, muss Tom nicht noch einmal fragen.** Was auf
den Bildern steht, steht unten als Text.

---

## Recovery — sieben Tabs, jede Kachel eine Attrappe

| Datei | Tab | Was zu sehen ist |
|---|---|---|
| `recovery-today-muscle-readiness.png` | Today | Muskelkarte, 18 Gruppen, Ampel Ready/Caution/Rest |
| `recovery-muscle-map.png` | Muscle map | Karte plus Per-muscle detail, 18 Zeilen mit Stunden, Saetzen, Soreness, Prozent |
| `recovery-hrv.png` | HRV | HRV-Score 84, Baseline 58,4, z +0,9, Messprotokoll mit 7 Eintraegen, 30-Tage-Trend, Kamera-HRV |
| `recovery-sleep.png` | Sleep | 94, 7:42 h, Deep/REM/Light/Awake, Formelblock, 14 Naechte, Score-Pfade, Schlafhygiene |
| `recovery-modalities.png` | Modalities | Katalog mit 11 Typen und Evidenzgrad, Wirksamkeitsprotokoll mit sechs Eintraegen |
| `recovery-overtraining.png` | Overtraining | Acht Signale, 0 feuern, Schweregrad-Staffel, Alert-Lebenszyklus |
| `recovery-stress.png` | Stress | Stress 44, sechs Beitragende, „What helps you" mit fuenf Massnahmen, 14 Tage |

**Auf jeder Kachel steht:** *„Aus dem Entwurf uebernommen. Die Zahlen
sind erfunden — das Schema `recovery` gibt es noch nicht."*

`[cmd]` **Der Satz ist falsch.** Gemessen am 2026-08-22:

| | |
|---|---:|
| `recovery.checkins` | **340** Zeilen |
| `recovery.scores` | **340** |
| `recovery.modality_log` | **178** |

`[cmd]` Und drei Lesefunktionen greifen bereits darauf zu:
`checkin-read.ts:62` auf `checkins`, `scores-read.ts:145` auf `scores`,
`scores-read.ts:239` auf `modality_log`.

`[cmd]` **42 Attrappen-Marken in sieben Dateien:** `tab-protokolle` 17,
`tab-messwerte` 10, `ansicht` 6, `checkin-streifen` 4, `tab-checkin` 3,
`modale` 1, `page` 1.

`[cmd]` **Der Kopf zeigt „Score 79,4 · aus `recovery.scores` · manual
mode · 170 Tage erfasst"** — also echt gelesen, waehrend die Kacheln
darunter Entwurf behaupten. **Zwei Aussagen auf einem Bildschirm.**

`[cmd]` Der Pauschalbanner steht in `ansicht.tsx:68` und wird ueberall
ausgegeben, statt je Kachel zu sagen, was stimmt. **Dasselbe Muster in
vier weiteren Modulen:** `coach/ai/ansicht.tsx:64`, `coach/ansicht.tsx:69`,
`medical/ansicht.tsx:58`, `training/ansicht.tsx:65`.

---

## Nutrition — die Preferences-Entscheidung

`nutrition-preferences-rangfolge.png` — **die Rangfolge ist deklariert,
darueber gibt es nichts mehr zu diskutieren:**

| | | |
|---|---|---|
| 1 | Allergen | **hard exclude** |
| 2 | Diet type | **hard exclude** |
| 3 | Food | ±100 |
| 4 | Category | ±50 |
| 5 | Tag | ±30 |
| 6 | Prefix match | +20 |

*„Specific beats general — a liked food overrides a disliked category."*

`[read]` **Der Text auf demselben Bild ist ueberholt:** *„Die Kataloge
(Food DB, Startliste, Suchseite) zeigen bewusst alles."* **Tom,
2026-08-22:** *„Preferences ist exakt die Konfig fuer den Food-DB-Zugriff
des Kunden, dass er das sieht was er sehen will."* Seit G-154 laedt der
Katalog mit `prefs=1`. **Der Satz im Dialog muss weg.**

`nutrition-kategorienfilter.png` — die Kategorienpillen: All, Meat,
Fish, Grains, Dairy, Produce, Fruit, Beverages, Eggs, Fats & oils,
Sweets, Legumes & nuts, Spices.

`nutrition-naehrwert-verarbeitung.png` — die zwei verbleibenden
Tag-Gruppen mit ihren Zahlen: Proteinreich 1.400 · Low-Carb 4.659 ·
Fettarm 2.648 · Ballaststoffreich 558 · Grundnahrungsmittel 2.884 ·
Hochverarbeitet 927.

**Tom, 2026-08-22 — was die FoodDB oben drauf bekommt:**

1. **Kategorienfilter** — zeigt nur gewaehlte
2. **Naehrwert und Verarbeitung** als Tag-Filter
3. **Spaltensortierung** `up/down/off` auf kcal/P/C/F, auf der bereits
   gefilterten Liste

`[cmd]` **Ernaehrungsform faellt als Filtergruppe weg** — Diet type ist
`hard exclude` und kommt aus den Preferences. Das entscheidet G-134.

`[cmd]` **Die Sortierung ist blockiert:** `food_search` kennt heute
`relevance`, `kcal_asc`, `protein_desc`, `name_asc` — vier Sortierungen,
je eine Richtung. Gebraucht werden acht. **Das ist Datenbankarbeit und
geht vor der Oberflaeche.**

---

## MealCam — Toms Regel vom 2026-08-22

*„MealCam kann alles einlesen, muss aber bei Erkennung darauf hinweisen,
dass X laut Preferences hard excluded ist, und der User muss das
bestaetigen."*

`[read]` Der Unterschied zum Katalog: die FoodDB **wendet** Preferences
**an**. MealCam **erkennt**, was auf dem Teller liegt — wegfiltern waere
dort falsch. Einlesen, benennen, bestaetigen lassen. **Nur `hard` loest
aus.** Steht als C-193.

---

## Ablage

Die zehn PNG gehoeren neben diese Datei. Sie stammen aus Toms
Bildschirmaufnahmen, nicht aus `tools/schuss.mjs` — die maschinell
erzeugten liegen unter `backup/bestand/<modul>-<tab>-<hell|dunkel>.png`
aus G-155.

`[read]` **Nicht ueberschreiben und nicht durch neue Laeufe ersetzen.**
Sie halten den Stand fest, an dem der Befund entstanden ist.
