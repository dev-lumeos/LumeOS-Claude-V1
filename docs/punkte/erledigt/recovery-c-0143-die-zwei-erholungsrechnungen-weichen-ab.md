---
nr: C-143
typ: messung
modul: recovery
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-82
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: d2f692b2
beruehrt:
  tabellen: [recovery.scores]
zahlen: null
---

# C-143 - Die zwei Erholungsrechnungen weichen ab

## Befund

Der gebaute `/v2/`-Stand hat weiterhin zwei aktive Erholungsrechnungen:

| Weg | Einsatzort | Ergebnisform |
|---|---|---|
| Browser-Vorschau | `score.ts:vorschauScore()` in `tab-checkin.tsx` waehrend der Eingabe | `Math.round` auf 0--100, normiert auf die vorhandenen **75** Gewichtspunkte |
| gespeicherter Score | `recovery.recalculate_score()` in `121_recovery_scores_modalities.sql`; `/v2/recovery` liest ihn mit `ladeScores()` | ein Dezimalwert ohne Normierung, maximal **82** plus bis zu 5 Bonuspunkte |

`[cmd]` Der vorhandene Browser-Test `apps/web/src/lib/recovery/__tests__/score.test.ts` lief mit **11/11** Tests gruen. Er bestaetigt den Browserweg, nicht dessen Gleichheit mit der Datenbankformel.

### Wo sie sich trennen

Beide Wege benutzen Schlafqualitaet, Schlafdauer, subjektives Gefuehl, gemeldete Soreness und Stimmung. Sie sind dennoch keine Varianten derselben Formel:

| Aspekt | Browser `score.ts` | Datenbank `recalculate_score()` |
|---|---|---|
| fehlende Anteile | Trainingslast und Nutrition sind `null`; die Summe wird durch die vorhandene Gewichtsgrundlage **75** geteilt | Training steht als Score/Points **0**, wird aber nicht in die Summe aufgenommen; Nutrition ist der feste Rueckfall **70** und bringt immer **7,0** Punkte |
| Schlafdauer | linear bis **8 h**, dann gedeckelt | **7--9 h = 100**; darunter linear gegen 7 h, darueber eigener Abfall |
| Stimmung | `good=80`, `neutral=60`, `tired=40`, `sick=10`; `stressed=30` | `good=85`, `neutral=70`, `tired=45`, `sick=20`; jeder sonstige Wert = 70 |
| Ausgabe | ganze Zahl, 0--100 durch Normierung | eine Dezimalstelle, ohne Normierung; Nutrition-Fallback ist Teil der Zahl |

`[cmd]` Der im Seed-Loader fest verdrahtete schlechte Manual-Szenario-Check-in (`sleep_quality 3`, `sleep_hours 4,8`, `subjective_feeling 3`, `mood tired`, Soreness 3/2/2, kein HRV) ergibt aus demselben Eingang:

| Weg | Rechnung | Ergebnis |
|---|---|---:|
| Browser | `(9 + 9 + 4,5 + 2,22 + 2) / 75 * 100`, gerundet | **36** |
| Datenbank | `9 + 10,29 + 4,5 + 2,22 + 7 + 2,25` | **35,3** |

Die Differenz dieses Testfalls betraegt **0,7 Punkte**. Sie kann je nach Schlafdauer, Mood und dem festen Nutrition-Rueckfall deutlich groesser werden. Der alte Befund mit fuenf historischen Tagen ist deshalb kein Nachweis mehr fuer den heutigen Stand: Er beschreibt eine ACWR-haltige Tabellenformel, die der aktuelle Pipeline-Schritt entfernt.

`[read]` Keiner der beiden Wege ist damit als der richtige entschieden. Die Vorschau ist als Sofortwert waehrend der Eingabe sinnvoll, die gespeicherte Zahl als nachvollziehbarer Schnappschuss. Solange beide im Produkt vergleichbar sind, braucht es eine Produktentscheidung ueber Skala und Rueckfall -- nicht ein stilles Angleichen.

`[read]` Die Seed-Reihe reicht ueber den heutigen Tag hinaus. `refresh_scores_for_user()` rechnet alle Check-ins eines Nutzers, und `ladeScores()` hat keine Datumsgrenze. Eine Messung ueber einen offenen Zeitraum wuerde daher auch die Zukunftszeilen bis November einschliessen; die obige Gegenprobe ist bewusst ein fest benannter Szenario-Check-in statt einer offenen Zeitabfrage.

**Urteil C-143: offen.** Die zwei Wege sind gemessen, aber nicht als gemeinsame Skala entschieden. Keine Rechnung wurde veraendert.

## Mitbeauftragte Punkte

| Punkt | Urteil | Ergebnis |
|---|---|---|
| C-166 | ueberholt als vermeintliche Luecke | Die Entwurfszahlen sind keine uebernahmefaehigen Belege; ihre Abwesenheit im gebauten Stand ist beabsichtigt. |
| C-168 | offen | Die Entwurfsschwellen sind gesetzt, nicht belegt; E-06/E-09 bleiben unerledigt. |
| C-181 | erledigt im aktuellen Recovery-Score | ACWR wird im aktiven Recovery-Pfad nicht mehr gerechnet; der Grund fuer das Entfernen traegt weiter. |
| C-127 | offen | Der Seed kann die drei Spalten fuellen, aber eine reale Wearable-Quelle ist bewusst nicht gebaut und nicht konkret eingeplant. |

### C-166 und C-168 -- Konstanten des Entwurfs

`[read]` `module-recovery-engine.jsx` ist ein `theme-v1`-Entwurf und hat keine Quellenreferenzen an den Zahlen. Wiederholungen derselben Werte in `module-recovery-v2.jsx` oder den `SPEC_*`-Dateien sind keine unabhaengige Evidenz.

| Entwurfswert | Befund zur Herkunft | Gebauter Stand |
|---|---|---|
| `MODALITY_BONUS` (11 Modalitaeten) und `MAX_DAILY_BONUS = 5` | **gesetzt.** `00-schemaentwurf.md` bezeichnet die Typwerte ausdruecklich als Produktentscheidungen ohne Quelle (E5). | `recovery.modality_bonus_value()` liefert **0**; Bonuswerte tragen `pending_c124_e5`. |
| `OVERTRAINING_SIGNALS` | **gesetzt.** Der Motor hat nicht vier, sondern **acht** Signale mit Schwellen: HRV 90 % der Baseline, Ruhepuls +5, Schlaf <6/3d, Gefuehl <=4/3d, Soreness >=3d, Score <55/3d, Motivation <=3/5d und fallender Trainingstrend. Der Entwurf selbst dokumentiert widerspruechliche Signalsets und Skalen; insbesondere ist der gebaute Check-in bei Motivation 1--10, der Motor prueft `/5`. | Kein Overtraining-Rechenpfad, keine Alert-Tabelle und keine dieser Schwellen im `/v2/`-Score. |
| `ACWR_DATA = 2142/1980/1,08` plus ACWR-Kurve | **gesetzt.** Es sind Beispielwerte des Entwurfs, keine Messung eines Nutzerzeitraums. | Aus Recovery entfernt, siehe C-181. |
| `HRV_BASELINE = 58,4/6,2/30/28` | **gesetzt.** Die Zahlen sind fest im Entwurf; eine individuelle Baseline wird nicht aus Daten berechnet. | `recovery.hrv_readings` und eine Baseline-Ableitung existieren nicht; `hrv_rmssd` wird im Manual-Score nicht bewertet. |

`[read]` E-06 und E-09 verlangen Recherche statt Default. Der Entwurf kann daher Ideenstruktur sein, aber keinen der Werte belegen. Die vier Aussagen widersprechen dem gebauten Stand nicht; sie duerfen nur nicht als Anlass dienen, eine Schwelle oder einen Bonus zu setzen.

### C-181 -- ACWR

`[read]` Im aktuellen Recovery-Pfad wird ACWR **nicht** gerechnet:

- `121_recovery_scores_modalities.sql` loescht `recovery.training_load_score`, `recovery.acwr_for_day` und `scores.acwr_used`.
- Die aktuelle Rechenfunktion setzt `training_load_score` und `training_load_points` auf **0** und addiert den Trainingsterm nicht zu `v_total`.
- `score.ts` gibt fuer Trainingslast `null` mit `entfaellt -- C-181, ACWR ohne Beleg` zurueck.
- Der verbliebene Feldvertrag `training.load_spike` meldet in `132a_rule_input_status.sql` `no_data`: kein Load-Spike-Modell ist gebaut. Er rechnet ACWR nicht heimlich weiter.

`[read]` Der Grund traegt weiterhin: Die im Punkt zitierte Evidenzentscheidung lautet `implement:no`; der tatsaechliche Registry-Inhalt liegt allerdings nicht im Arbeitsbaum, nur seine dokumentierte Auswertung. Direkt pruefbar ist deshalb die Umsetzung, nicht die drei externen Quellen selbst. Die frueheren Behauptungen in C-181/C-215, ACWR werde noch im Recovery-Motor bzw. in der Datenbank berechnet, widersprechen dem aktuellen Code und sind ueberholt.

### C-127 -- Wearable-Spalten

`[read]` Die Aussage "leer" ist zeitabhaengig. Der aktuelle Seed-Generator `recoveryCheckinFor()` setzt an jedem vierten Tag `resting_hr`, `hrv_rmssd`, `spo2_pct` und `respiratory_rate`; in einer 170-Tage-Reihe sind das **43** Werte je Spalte. Der Loader schreibt sie anschliessend unveraendert nach `recovery.checkins`.

`[read]` Das ist keine Wearable-Anbindung, sondern Testdatenerzeugung. E-02 legt weiterhin `manual` fest: Wearables kommen spaeter. Es gibt weder `recovery.hrv_readings`, `recovery.sleep_data` noch `wearable_source_config`, keinen Importpfad und keinen echten Schreiber fuer die drei Spalten. Sie warten also auf eine kuenftige Quelle im allgemeinen Sinn, aber auf keine im aktuellen Repo konkret verdrahtete oder terminierte Quelle.

`[read]` Ob eine bereits laufende Datenbank noch den alten Stand `0 von 340` traegt, wurde absichtlich nicht gegen die laufende Instanz abgefragt. Der alte Zahlenbefund darf nicht aus dem Code allein auf eine aktuelle Datenbank hochgerechnet werden; der Seed-Quellstand zeigt aber, dass "leer" kein strukturelles Merkmal mehr ist.

## Abnahme

**2026-08-29, Orchestrator.**

`[cmd]` **Der Kern ist bestaetigt und nicht behoben:** Browser-Vorschau
und gespeicherter Datenbank-Score rechnen unterschiedlich — **36 gegen
35,3 im Szenario-Check-in.**

`[read]` **Nicht angeglichen, weil nicht klar ist, welche richtig
ist** — das war die Vorgabe. **Als C-218 liegt der Punkt bereits
offen** (*,,Frontend und Datenbank normieren den Recovery-Score
verschieden"*), und beide beschreiben dasselbe von zwei Seiten.

### Die vier mitbeauftragten, je ein Urteil

`[cmd]` **C-166 / C-168 — die Entwurfswerte sind gesetzt, nicht
belegt.** `[read]` **Damit gilt E-06 und E-09 weiter:** Tom hat
*,,Recherchieren statt setzen"* entschieden, **und der Entwurf ist
kein Beleg.** Dieselbe Antwort wie bei den Umrechnungsfaktoren in
C-149 und den Tag-Schwellen in G-221.

`[cmd]` **C-181 — ACWR wird im Recovery-Pfad nicht mehr gerechnet.**
`[read]` **Der Entferngrund traegt weiter** — der Punkt beschreibt
etwas, das bereits geschehen ist.

`[cmd]` **C-127 — die Wearable-Spalten werden vom Seed-Generator
gefuellt, aber es gibt keine Anbindung.** `[read]` **Das ist die
gefaehrlichere Fassung des urspruenglichen Befunds:** *leer* waere
ehrlich gewesen, *gefuellt ohne Quelle* sieht aus wie Daten.

`[cmd]` Recovery-Score-Test 11/11 gruen, keine `apps/`-Aenderung.

**Abgenommen.** Die Angleichung der zwei Rechnungen bleibt offen —
**sie braucht die Entscheidung, welche richtig ist.**

