# 127 — Recovery: Check-in und Erholungswert angebunden (G-76)

Stand: 2026-08-20 · Anker: Zweig `dev` · Auftrag G-76
Herkunft: gebaut und am Bildschirm geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

`[cmd]` **Der Erholungswert rechnet jetzt aus echten Check-ins** —
Manual-Modus, ohne HRV, **ohne Urteilstext**. `recovery.checkins`
bleibt die einzige Tabelle; **kein Schema geändert**.

---

## Welche Kachel welche Spalte bekommt

`[cmd]` **Der Bestand:** 340 Zeilen über zwei Nutzer,
2026-05-21 bis 2026-11-06. Für `dev@lumeos.app` sind es **170**.

### Was die Tabelle trägt — und was leer ist

`[cmd]` Belegung über die 170 Zeilen von `dev@lumeos.app`:

| Spalte | belegt | fließt in |
|---|---|---|
| `sleep_quality` | **170** | Score, Gewicht 30 |
| `sleep_hours` | **170** | Score, Gewicht 15 |
| `subjective_feeling` | **170** | Score, Gewicht 15 |
| `soreness` (jsonb) | **340** | Score, Gewicht 10 |
| `mood` | **340** | Score, Gewicht 5 |
| `energy_level` | 170 | Kopfzeile, Check-in-Streifen |
| `motivation` | 170 | Check-in-Streifen |
| `stress_level` | 170 | Score-Kachel (Anzeige) |
| `alcohol_units`, `caffeine_mg`, `notes` | je 170 | noch nicht angezeigt |
| **`hrv_rmssd`** | **43 von 170** | nur Anzeige, nicht im Score |
| **`resting_hr`** | **0** | — |
| **`spo2_pct`** | **0** | — |
| **`respiratory_rate`** | **0** | — |
| **`pain_areas`** | **0 von 340** | — |

`[read]` **Drei Wearable-Spalten sind vollständig leer.** Sie existieren
im Schema, aber kein Check-in füllt sie — jede Kachel, die sie
bräuchte, bleibt Attrappe.

### Die Kacheln

| Kachel | vorher | jetzt |
|---|---|---|
| **Morning check-ins** (Streifen) | echt seit G-55 | echt, Hinweistext berichtigt |
| **Erholungswert** (Ring + Zusammensetzung) | Attrappe | **echt** — fünf Anteile aus `checkins` |
| **Kopfzeile** „Score 88 · Good" | Attrappe | **echt** — „Score 82", ohne Wertung |
| Muscle readiness | echt seit G-55 | unverändert |
| Pending actions · Modalities · Overtraining · Sleep · HRV | Attrappe | **bleibt Attrappe** |

`[cmd]` **Am Bildschirm gezählt:** Today hatte **5 Marken**, jetzt
**4**. `[read]` Im Quelltext stehen weiter 5 — die Entwurfskachel
bleibt als Rückfall stehen, wie in G-74 vereinbart, und wird nur nicht
mehr gezeigt.

---

## Wie der Score rechnet

### Die Gewichte sind der stabile Kern

`[cmd]` `00-schemaentwurf.md:49` nennt sie „in allen drei Quellen
identisch": **30/15/15/10/15/10/5**.

| Anteil | Gewicht | Quelle | rechnet? |
|---|---|---|---|
| Schlafqualität | 30 | `sleep_quality` | ✓ |
| Schlafdauer | 15 | `sleep_hours` | ✓ |
| Gefühl | 15 | `subjective_feeling` | ✓ |
| Muskelkater | 10 | `soreness` | ✓ |
| Stimmung | 5 | `mood` | ✓ |
| **Trainingslast** | 15 | braucht ACWR | **✗** |
| **Ernährung** | 10 | nicht im Check-in | **✗** |

**Gerechnet werden 75 von 100 Gewichtspunkten.**

### Fehlende Anteile zählen nicht mit

`[read]` **Weder als null noch als voll.** Der Score normiert auf die
Gewichte, die wirklich gerechnet haben, und die Kachel nennt die Zahl:
*„Gerechnet aus 5 von 7 Anteilen (75 von 100 Gewichtspunkten)."*

`[read]` Eine leere Spalte als 0 zu werten wäre eine Behauptung; sie
als voll zu werten wäre Schönrechnen. **Die beiden offenen Anteile
stehen sichtbar in der Zusammensetzung**, mit Grund („braucht ACWR",
„nicht im Check-in") und einem Strich statt einer Zahl.

### Der Beispieltag — ohne HRV

`[cmd]` **2026-11-06**, `hrv_rmssd` ist `NULL`:

```
Schlafqualität 8/10  → 0,8 × 30 = 24,000
Schlafdauer    7,8 h → (7,8/8) × 15 = 14,625
Gefühl         8/10  → 0,8 × 15 = 12,000
Muskelkater    back 1, chest 1 → (1 − 2/3) × 10 = 6,667
Stimmung       good (80) → 0,8 × 5 = 4,000
                       Summe 61,292 von 75  →  82
```

`[cmd]` **Die Anzeige zeigt 82.** Unabhängig nachgerechnet: **82.**
`[read]` Der Tag trägt keinen HRV-Wert — **der Score rechnet also
nachweislich ohne**, wie der Auftrag verlangt.

### Die Soreness-Mittelung — E2, und Tom muss sie entscheiden

**Genommen ist V/S: Mittel nur über die gemeldeten Muskeln.**

`[cmd]` Der Schemaentwurf misst drei Lesarten für dieselben Daten:
*„Ein einziger Muskel mit Kater 3 ergibt je nach Quelle 9,4/10 oder
0/10 Punkte."*

**Zwei Gründe, beide belegt:**

1. `[read]` **Der Entwurf empfiehlt es:** „sonst ist der Term bei 18
   Gruppen praktisch konstant."
2. `[cmd]` **Die Daten stützen es.** Das JSONB führt **höchstens fünf
   Muskeln** — `chest`, `back`, `quadriceps`, `glutes`, `lower_back` —
   und **nie ein leeres Objekt** (0 von 340). Über 18 zu mitteln hiesse,
   **13 Nullen zu erfinden, die niemand erfasst hat.**

`[read]` **Das Gegenargument des Entwurfs steht:** der Check-in-Tab
belegt die Karte mit allen 18 Gruppen vor und legt damit die
Engine-Lesart nahe. **Das ist eine Aussage über die Oberfläche, nicht
über die Daten** — und die Daten zeigen fünf. **Tom entscheidet; bis
dahin gilt die gemessene Lesart.**

### Drei Formeln sind NICHT nachgebaut

`[cmd]` Der Entwurf hat sie als fehlerhaft gemessen:

| Formel | Fehler |
|---|---|
| SQL-Trigger der `SPEC_06` | Trainingsterm ergibt für jede nennenswerte Last ≈ volle Punkte |
| ACWR-Kurve des Mockup-Motors | **Faktor 1.1 bei ACWR 1.4** — erhöhtes Verletzungsrisiko verbessert den Score |
| Gedruckte HRV-Anker | widersprechen der eigenen Formel |

`[read]` **Keine davon ist übernommen.** Der Trainingsterm liefert
deshalb `null`, nicht eine falsche Zahl — und ein Test stellt sicher,
**dass kein Anteil über sein Gewicht steigen kann**, genau der Fehler
der Engine-Kurve.

### Der Score zeigt keine Lage

`[cmd]` **Der Kopf zeigte „Score 88 · Good".** `Good` ist eine
Readiness-Stufe der `SPEC_09` und damit Urteilssprache. **Jetzt steht
dort „Score 82"**, darunter „manual mode · 75 von 100 Gewichtspunkten
gerechnet".

`[read]` **Dieselbe Regel wie bei Medical:** „Im Bereich / Über /
Unter" ja, „Optimal" nein — es benennt keine Lage. Die sechs
Readiness-Texte und der Arzt-Hinweis der `SPEC_09` bleiben offen, bis
Tom sie entschieden hat.

`[cmd]` **Ein Hinweistext war nach dem Umbau falsch geworden.** Der
Check-in-Streifen sagte seit G-55: *„kein Erholungswert daraus
gerechnet … Der Ring oben bleibt deshalb Attrappe."* Seit G-76 wird
einer gerechnet — **der Satz ist berichtigt**, statt stehenzubleiben
und das Gegenteil zu behaupten.

---

## Was Attrappe bleibt und warum

| Kachel / Tab | Grund |
|---|---|
| **Modalities** | `[cmd]` **`checkins` trägt keine Modalitätsspalte** — geprüft: kein Feld mit `modal`, `sauna`, `massage`, `protocol` im Namen. Braucht `recovery.modality_log` (Entwurf 2.4). |
| **Overtraining** | `[read]` Braucht Wochen Verlauf und ist Stufe 6 im Entwurf. Der Auftrag schliesst es aus. |
| **HRV-Tab** | `[cmd]` 43 von 170 Zeilen tragen HRV, `resting_hr` ist **0-mal** belegt. Eine Baseline über 30 Tage ist damit nicht rechenbar. |
| **Sleep-Tab** | `[cmd]` `sleep_start_time`/`sleep_end_time` existieren, aber der Schlaf-Score der Wearable-Quelle ist Entwurf 3.9 und offen. |
| **Protocols** | `[cmd]` Braucht `recovery.protocols` + `protocol_assignments` (Entwurf 2.6) — beide gibt es nicht. |
| **Pending actions** | `[cmd]` Der Abhak-Zustand der Tagesaufgaben ist laut Entwurf 2.7 **in allen drei Quellen eine Lücke**. |
| **Stress-Tab** | `[cmd]` `stress_level`, `work_stress`, `life_stress` sind da — aber der Tab-Zuschnitt ist Entwurf 3.10 und offen. |

`[read]` **Keine Schwelle erfunden.** C-105 hält fest, dass MEV/MAV/MRV
keine Quelle haben; dasselbe gilt für Erholungsschwellen. Wo eine
Kachel eine bräuchte, bleibt sie Attrappe.

---

## Was ohne neues Schema nicht geht

`[cmd]` **`recovery` hat genau eine Tabelle:** `checkins`. Der
Schemaentwurf nennt sechs weitere als nötig — keine davon existiert.

| Fehlt | Wofür | Entwurf |
|---|---|---|
| `recovery.modality_log` | Modalitäten, Bonus | 2.4 |
| `recovery.scores` | Verlauf, Wochenbericht | 2.2 |
| `recovery.hrv_readings` | HRV-Baseline über 30 Tage | 2.3 |
| `recovery.overtraining_alerts` | Übertrainings-Signale | 2.5 |
| `recovery.protocols` + `_assignments` | Protokolle | 2.6 |
| Abhak-Zustand | Tagesaufgaben | 2.7 |

`[read]` **Die Modalitäten sind der grösste Einzelposten** — der Tab
zeigt sechs Kacheln, und keine davon hat eine Spalte. **Gemeldet, nicht
gebaut**, wie der Auftrag verlangt.

`[cmd]` **Der Score braucht keine neue Tabelle**, solange er nicht
gespeichert wird. Er rechnet bei jeder Anzeige aus dem Check-in — ohne
`algorithm_version`, ohne Verlauf. **Sobald ein Verlauf gezeigt werden
soll, führt kein Weg an `recovery.scores` vorbei.**

### Was E1 heisst

`[cmd]` **27 von 36 ursprünglichen Check-ins hatten kein HRV**; heute
sind es **127 von 170**. `[read]` Der Entwurf schlägt vor, V1 bewusst
nur `manual` zu bauen — das ist E1 und offen. **Gebaut ist genau das**,
und der Modusschalter „manual/hrv" der Vorlage bleibt vorerst ohne
zweiten Modus.

---

## Nachweise

`[cmd]` Am Bildschirm geprüft, 2026-08-20, als `dev@lumeos.app`:

| Prüfung | Ergebnis |
|---|---|
| **Kacheln ohne Marke** | `[cmd]` Today **5 → 4** — die Erholungswert-Kachel |
| **Der Score ohne HRV** | `[cmd]` 2026-11-06 (`hrv_rmssd` NULL) → **82**, unabhängig nachgerechnet **82** |
| **Kopfzeile ohne Urteil** | `[cmd]` „Score 82", kein „Good" mehr im Dokument |
| **Zusammensetzung** | `[cmd]` fünf Anteile mit Zahl, zwei mit Grund und Strich |
| **Zeilenschutz** | `[cmd]` `test-user@lumeos.local`: **0 Zeilen**, `dev@lumeos.app`: **170** |
| Konsolenfehler | `[cmd]` **2 — beide vorbestehend**, siehe unten |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf |
| Hell und dunkel | `[cmd]` beide geprüft |

### Die zwei Konsolenfehler sind nicht meine

`[cmd]` `<path> attribute d: Expected number` — zweimal, mit
Koordinaten um 767 und 1039. **Das ist die anatomische Muskelkarte**
(724 × 1448), die der Auftrag ausdrücklich nicht anzufassen erlaubt.

`[cmd]` **Gegengeprüft:** meine beiden geänderten Dateien gestasht,
Seite neu geladen — **dieselben 2 Fehler.** Danach zurückgeholt.

### Die Tests

`[cmd]` **Elf neue Prüfungen** in
`src/lib/recovery/__tests__/score.test.ts`. Sie prüfen vor allem, was
NICHT passiert: kein Anteil ohne Wert zählt als 0, kein Anteil steigt
über sein Gewicht, kein unbekannter `mood` erfindet Punkte.

`[cmd]` **Drei Gegenproben, alle rot:**

| Eingriff | Ergebnis |
|---|---|
| Soreness über 18 Gruppen mitteln (Engine-Lesart) | **10 pass, 1 fail** |
| fehlende Anteile als 0 werten | **10 pass, 1 fail** |
| Gewicht 30 → 25 | **7 pass, 4 fail** |

Vorher und nachher je **11 grün, 0 rot**.

### Bildschirmfotos

| Datei | Inhalt |
|---|---|
| `g76-score-hell-1440.png` | die Erholungswert-Kachel, hell |
| `g76-score-dunkel-{1440,1024,768,375}.png` | dunkel, vier Breiten |

### Geänderte Dateien

| Datei | Was |
|---|---|
| `lib/recovery/score.ts` | **neu** — Gewichte, Soreness-Mittelung, Score ohne HRV |
| `lib/recovery/__tests__/score.test.ts` | **neu** — elf Prüfungen |
| `v2/recovery/score-kachel.tsx` | **neu** — Ring, Zusammensetzung, kein Urteilstext |
| `v2/recovery/ansicht.tsx` | Kopfpille ohne Wertung, Weiche auf die echte Kachel |
| `v2/recovery/checkin-streifen.tsx` | Hinweistext berichtigt |

### Was dieser Auftrag NICHT getan hat

- **Kein Schema, keine Migration** — `recovery` hat weiter eine Tabelle.
- **Keine Schwelle erfunden**, keine Übertrainings-Warnung.
- **Die Muskelkarte nicht umgebaut** — sie steht seit G-55.
- **`packages/ui` nicht angefasst.**
- **Die drei fehlerhaften Quellformeln nicht nachgebaut.**

`[cmd]` Messskripte unter `tools/g76-*` — **nur lesend**, gehören vor
dem Commit entfernt.

**Nichts ist committet oder gestaged.**
