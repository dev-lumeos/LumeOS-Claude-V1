---
nr: C-385
typ: feature
modul: medical
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-109
entscheidung: E-57
beruehrt:
  tabellen: [medical.symptoms]
zahlen: null
---

# C-385 — das Datenmodell fuer Injektionsstellen

## Befund

Aus E-57, 2026-09-02. **Die Recherche aendert das Modell.**

`[cmd]` **Der urspruengliche Entwurf: `injection_sites` mit
`max_ml`, `rest_days`, Nadelstaerke je Ort.**

`[read]` **Zwei der drei Felder tragen nicht:**

    rest_days      es gibt keine validierte Zahl (E-57)
    Nadel je Ort   Gauge haengt an der Viskositaet,
                   Laenge an Route, Fettdicke und Koerperbau

## Was stattdessen gebraucht wird

    route                  IM oder SC
    site                   Deltoid, Vastus, Ventrogluteal, ...
    medication_viscosity   waessrig oder oelig
    gauge_range            aus der Viskositaet
    length_range           aus Route und Koerperbau
    body_size_modifier     BMI oder gemessene Fettdicke
    evidence_type          Leitlinie / Studie / Praxisregel

`[read]` **Und drei getrennte Eigenschaften statt einer Ruhezeit:**

    minimum_rest_days      IM: null, mit Begruendung
    rotation               IM: Pflicht, ohne Zahl
                           SC: mindestens 10 mm, Quadrant je Woche
    gewebezustand          Lipohypertrophie: 3-6 Monate aussetzen

`[read]` **Der dritte ist keine laengere Pause, sondern ein anderer
Zustand.**

## Die Nadeltabelle mit Vorschlag

Tom, 2026-09-02: *,,daraus machen wir eine table und schlagen die
groessen auch vor, die daten fuer die auswahl haben wir ja aus den
profilen."*

### Die Eingaben stehen, gemessen

`[cmd]` **`public.profiles`:** `biological_sex`, `height_cm`,
`body_weight_kg`.
`[cmd]` **`goals.body_measurements`:** `weight_kg`, `body_fat_pct`,
`height_cm_snapshot`, `bmi`.

`[read]` **Alle vier Groessen, die die Quellen brauchen** — **und
`body_fat_pct` ist genauer als BMI.**

`[cmd]` **Die Recherche sagt: *,,BMI ist nur ein Proxy. Die
tatsaechlich relevante Groesse ist die Distanz Haut zu Muskel am
konkreten Injektionsort."***

### Die Tabelle traegt die Quelle je Zeile

    CDC 2026            Deltoid, sechs Gewichtsklassen, 22-25G
    Cook 2006           Deltoid, BMI >35 bei Frauen: 32 mm
    Larkin 2018         Ventrogluteal, 32 / 38 mm nach Geschlecht
    Zaybak 2007         Ventrogluteal, Fettdicke 38-54 mm bei
                        BMI >= 25
    Open RN 2023        Vastus, 25-38 mm, Gauge nach Viskositaet
    FITTER Forward 2025 SC, Pen 4 mm, Spritze 6 mm
    Spratt 2017         SC-Testosteron, 25G x 16 mm, BMI 19-50
    FDA Xyosted 2019    SC-Testosteron, 27G x 12,7 mm, 0,5 ml

### Der Vorschlag sagt, worauf er beruht

    Vorschlag: 25-38 mm, 22-25G
    Grundlage: CDC 2026, Deltoid, 70-118 kg
    Deine Angaben: 82 kg, BMI 26

`[read]` **Wer die Grundlage sieht, kann sie pruefen** — **und
merkt, wenn sie nicht passt.**

`[cmd]` **Bei Ventrogluteal und hohem BMI warnt der Vorschlag
statt zu empfehlen:** **Zaybak hat gemessen, dass eine 38-mm-Nadel
dort den Muskel nicht erreicht.**

## Zu klaeren

`[read]` **Welche Quelle gewinnt, wenn zwei zutreffen?** `[cmd]`
**CDC und Cook widersprechen sich beim Deltoid nicht, aber Larkin und
Zaybak liefern fuer Ventrogluteal verschiedene Zahlen** — die eine
misst die noetige Laenge, die andere die Fettdicke.

`[read]` **Und woher kommt `body_fat_pct`?** `[cmd]` **`goals.body_
measurements` ist eine Messreihe** — **welcher Eintrag gilt, der
letzte oder ein Durchschnitt?**

## Und die Grafik

`[cmd]` **Der Tab zeigt heute die einfache Silhouette der Vorlage**
(viewBox 100x120). `[cmd]` **Tom, 19.08.: die vollstaendige Figur wie
in `MuscleBodyMap_test.html`.**

`[cmd]` **`InjektionsKarte` in `packages/ui` hat keinen Aufrufer**,
weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
hat (G-53). `[read]` **Beim Grafiktausch entscheidet sich, ob sie
bleibt.**