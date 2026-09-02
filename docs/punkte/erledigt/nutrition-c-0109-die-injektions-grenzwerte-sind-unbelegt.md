---
nr: C-109
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: F-02
kinder: []
entscheidung: E-57
erledigt: 2026-09-02
commit: c7aac690
beruehrt:
  tabellen: []
  dateien: ["docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/components/MuscleBodyMap_test.html"]
zahlen: null
---

# C-109 - Die Injektions-Grenzwerte sind unbelegt

## Befund

(neu
  2026-08-19). Befund aus F-02. **Entscheidung fuer Tom.**

  `[cmd]` **Der 17-KB-Change-Request ist deckungsgleich mit dem
  G-45-Mockup.** **Drei Objekte reichen:** `injection_sites` als
  Stammdaten, `injection_logs`, **Schedule abgeleitet — keine
  Tabelle.** Enhanced ist keine Voraussetzung.

  `[cmd]` **Aus Daten kommen:** Ruhefenster-Zustand,
  Ueberbeanspruchung, Ortsvorschlag — **reine Arithmetik ueber das
  eigene Protokoll.**

  `[cmd]` **Aussagen sind die 16×3 Grenzwerte selbst** — `max_ml`,
  `rest_days`, Nadelstaerke. **Der CR nennt sie *„conservative
  defaults"*, belegt ist im Repo keine einzige Zahl.**

  `[cmd]` **Teilweise erledigt durch F-05 (2026-08-19):** Die
  IM-Volumina sind aus Pflegeliteratur belegt — **Deltoid 1–2 ml, Vastus
  1–5 ml, Ventrogluteal bis 3 ml.** *„Die haengen damit nicht mehr an
  deiner Abnahme."*

  `[cmd]` **Was die Literatur nicht liefert:** `rest_days` und
  **Nadelempfehlung je Ort** — die bleiben *„conservative defaults"*.

  **Entschieden (Tom, 2026-08-19): wissenschaftliche Quellen suchen.**
  `[read]` **Keine Abnahme aus dem Bauch** — fuer `rest_days` und
  Nadelstaerke je Ort gibt es Pflege- und Fachliteratur, wie fuer die
  Volumina.

  ### Und die Grafik gehoert getauscht

  **Tom, 2026-08-19:** *„Bei Injections muessen noch die neuen Grafiken
  rein."*

  `[cmd]` **Der Tab zeigt heute die einfache Silhouette der Vorlage**
  (viewBox 100×120), in G-57 sichtbar gemacht. **Gemeint ist die
  vollstaendige Figur** wie in `MuscleBodyMap_test.html` — mit Anatomie,
  wie sie die Koerperkarte seit G-55 traegt.

  `[cmd]` **G-53 haengt daran:** `InjektionsKarte` in `packages/ui` hat
  keinen Aufrufer, **weil die Vorlage sechs Felder je Ort fuehrt, die
  der Baustein nicht hat.** Beim Grafiktausch entscheidet sich, ob sie
  bleibt oder faellt.
  **Dieselbe Regel wie bei MEV/MAV/MRV (C-105) und den
  Naehrstoff-Referenzwerten (C-45).**

## Abnahme

**2026-09-02, durch E-57 beantwortet.** **Tom hat extern
recherchiert, 18 Quellen.**

### Das Ergebnis ist ein belegtes Nein

`[cmd]` **Fuer wiederholte IM-Injektionen gibt es keine
evidenzbasierte Ruhezeit in Tagen.** **Keine Leitlinie von WHO oder
CDC, keine kontrollierte Humanstudie.**

`[read]` **Damit ist die Frage nicht offen geblieben, sondern
beantwortet** — **die Zahl existiert nicht.**

`[cmd]` **Fibrose durch wiederholte Injektionen ist belegt** (Oh et
al. 1977, Fallserie 2006) — **eine Schwelle nicht.**

`[cmd]` **Volumen wirkt** (Diness 1985, Svendsen 1984, beide
Tierversuch) — **ergibt aber keine Formel.**

### Was stattdessen gilt

    IM   rest_days = null, Rotation Pflicht, ohne Zahl
    SC   mindestens 10 mm Abstand, Quadrant je Woche
         (FITTER Forward 2025)
    Lipohypertrophie: 3-6 Monate aussetzen -- eigener Zustand

`[read]` **Und der Warnsatz sagt, was die App weiss und was
nicht:** *,,Eine wissenschaftlich validierte Mindest-Ruhezeit fuer
diese Stelle existiert nicht."*

`[read]` **Dieselbe Haltung wie E-38 und C-378** — **wenn die Daten
nicht da sind, erfinden wir sie nicht.**

### Nadeln: gute Evidenz, anderes Modell

`[cmd]` **CDC 2026, Cook 2006, Larkin 2018, Zaybak 2007, Spratt
2017, FDA Xyosted** — alle in E-57 mit Zahlen.

`[read]` **Aber die Recherche aendert das Datenmodell:** **Gauge
haengt an der Viskositaet, Laenge an Route und Koerperbau** — **nicht
beides am Ort.**

`[cmd]` **Als C-385.**

**Geschlossen.**
