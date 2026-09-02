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

## Zu klaeren

`[read]` **`body_size_modifier`: BMI oder gemessene Fettdicke?**

`[cmd]` **Die Recherche sagt: BMI ist ein Proxy, die relevante
Groesse ist die Distanz Haut-Muskel am konkreten Ort.**

`[cmd]` **Und `goals`/`body` fuehrt Koerperdaten** — **ob dort ein
Fettanteil steht, ist zu messen.**

## Und die Grafik

`[cmd]` **Der Tab zeigt heute die einfache Silhouette der Vorlage**
(viewBox 100x120). `[cmd]` **Tom, 19.08.: die vollstaendige Figur wie
in `MuscleBodyMap_test.html`.**

`[cmd]` **`InjektionsKarte` in `packages/ui` hat keinen Aufrufer**,
weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
hat (G-53). `[read]` **Beim Grafiktausch entscheidet sich, ob sie
bleibt.**
