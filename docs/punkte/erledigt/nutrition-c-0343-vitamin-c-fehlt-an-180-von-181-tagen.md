---
nr: C-343
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-324
entscheidung: E-38
agent: codex
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 33a526a3
beruehrt:
  tabellen: [nutrition.nutrient_defs, nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-29
  ohne_vitc_zeile: 420
  vitc_gleich_null: 1797
  vitc_groesser_null: 4923
  vitc_null_wert: 0
  lebensmittel_gesamt: 7140
---

# C-343 — zwei Schreibweisen fuer *,,kein Vitamin C"*

## Berichtigung des urspruenglichen Befunds

`[read]` **Dieser Punkt hiess *,,Vitamin C fehlt an 180 von 181
Tagen"* und behandelte das als Datenluecke.** **Tom, 2026-08-29:**
*,,schonmal in betracht gezogen dass nicht jedes lebensmittel vitamin
c drin hat?"*

`[cmd]` **Er hat recht, und ich hatte es nicht geprueft.** Unter den
420 ohne Wert stehen **Butterschmalz, Backpulver, Balsamicoessig,
Cashewkerne** — dort ist null der richtige Wert.

## Der eigentliche Befund

`[cmd]` **Gemessen 2026-08-29, alle aus `bls_4_0_local_import`:**

    VITC = 0        1.797 Lebensmittel
    VITC > 0        4.923
    VITC NULL           0
    keine Zeile       420

`[read]` **Zwei Schreibweisen fuer dieselbe Aussage:** 1.797
Lebensmittel tragen eine Zeile mit null, 420 tragen gar keine.
**Und `NULL` gibt es nirgends** — wo eine Zeile steht, steht ein
Wert.

## Warum das nicht nur Kosmetik ist

`[cmd]` **Apfelsaft hat 119 Naehrstoffwerte — aber keinen fuer
Vitamin C.** `[read]` **Apfelsaft ohne Vitamin C ist unplausibel.**

`[read]` **Also bedeutet *,,keine Zeile"* nicht durchgaengig
*,,nicht enthalten"*.** **Butterschmalz ist der eine Fall, Apfelsaft
der andere — und wir koennen sie heute nicht unterscheiden.**

`[cmd]` **Der Durchschnitt liegt bei 121,8 Naehrstoffen je
Lebensmittel.** `[cmd]` Apfelpektin hat 31, Backpulver 47 — **dort
ist die duenne Belegung plausibel.** Apfelsaft mit 119 ist es nicht.

## Was daran haengt

`[cmd]` **`vitc_missing` feuert an 180 von 181 Tagen** und hat
deshalb C-324 blockiert.

`[read]` **Wenn *,,keine Zeile"* meist *,,nicht enthalten"* heisst,
ist der Zaehler ein Fehlalarm** — und der Score nicht blockiert.
**Wenn nicht, ist er richtig.** **Beides ist heute nicht
unterscheidbar.**

## Zu messen

**Fuehrt BLS 4.0 eine Kennzeichnung fuer *nicht bestimmt* gegen
*nicht enthalten*, und hat der Import sie mitgenommen?**

`[read]` **Wenn ja: nachtragen, und der Zaehler wird ehrlich.**
`[read]` **Wenn nein: entscheiden, wie fehlende Zeilen zu lesen
sind** — und die Entscheidung aufschreiben, statt sie im Zaehler zu
verstecken.

## Abnahme

**2026-08-29, geschlossen ohne Auftrag.**

`[cmd]` **`nutrition.nutrient_defs` traegt alle 138 BLS-Codes mit
Name, Einheit, Gruppe, Formel, `is_always_computed`,
`is_partly_computed` und `parent_code`** — vollstaendig und korrekt
importiert.

`[read]` **Damit war die Frage beantwortet, bevor ich sie gestellt
habe.**

`[cmd]` **Und die Luecke ist keine:** `FOLAC` ist an 7.059 von 7.086
Lebensmitteln null, weil synthetische Folsaeure nur in angereicherten
vorkommt. **Dasselbe gilt fuer Vitamin C in Butterschmalz** — Toms
Einwand traegt.

`[read]` **Was ich stattdessen getan habe:** eine 14-MB-Quelltabelle
durchgerechnet, um zu bestaetigen, was mit einer Abfrage auf
`nutrient_defs` zu haben war.

### Was offen bleibt und wo es hingehoert

`[cmd]` **Die Quelle traegt 871.311 Zahlen, `food_nutrients` 869.501
Zeilen** — und die Quelle fuehrt genau 1.800 Werte mit der
Datenherkunft *Spuren*.

`[read]` **Ob das ein Befund ist, ist offen.** **Als C-345 abgelegt,
`schwere: niedrig`, ohne Auftrag.**

**Geschlossen.**

## Wieder offen, 2026-08-30

**Aus C-49, Claude Code.**

`[cmd]` **`VITC` ist an 0 von 30 Tagen vollstaendig, mit 98 fehlenden
Posten** — **die groesste Luecke aller zwoelf NRF9.3-Naehrstoffe.**

`[read]` **Ich habe diesen Punkt am 29.08. geschlossen mit *,,die
vermutete Vitamin-C-Luecke war keine"*.** **Das war falsch.**

`[read]` **Tom sagte, nicht jedes Lebensmittel habe Vitamin C — das
stimmt.** **Ich habe daraus geschlossen, es gebe keine Luecke — das
stimmt nicht.**

`[read]` **Beides gilt gleichzeitig:** die 420 Lebensmittel ohne
`VITC` enthalten tatsaechlich keins, **und die Tagesbilanz ist
trotzdem an keinem Tag vollstaendig**, weil `value_complete` jeden
Posten verlangt.

**Die Entscheidung dazu ist C-360.**

## Auftrag — die Herkunft mitfuehren, damit E-38 wirkt

**Entschieden in `docs/entscheidungen/E-38`.** **Mitbeauftragt: das
neu gefasste C-345.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag ist der Vitamin-C-Tag rechenbar** —
**und damit NRF9.3.**

### Was entschieden ist

`[cmd]` **E-38: zensierte Werte (`<LOD`, `<LOQ`) zaehlen als 0, echte
Luecken (`-`) bleiben unvollstaendig.**

`[read]` **Das ist die EFSA/WHO-Substitutionsmethode, Lower Bound** —
**und die Leitlinie nennt Naehrstoffe ausdruecklich als
Anwendungsfall.**

`[cmd]` **Lower Bound, weil der BLS die Grenze nicht mitliefert:**
Middle und Upper braeuchten den LOD-Wert, **LB kommt ohne erfundene
Zahl aus.**

### Was zu bauen ist

**Die BLS-Herkunft muss in `food_nutrients` ankommen.**

`[cmd]` **Heute unterscheidet `data_source` nur zwei Importwege** —
`bls_4_0_local_import` und `bls_4_0_xlsx_nachtrag`. `[cmd]` **Die
Quelle traegt je Naehrstoff eine Herkunftsspalte mit 14 Werten.**

`[read]` **Es braucht nicht alle 14.** **Was die Bilanz unterscheiden
muss:** zensiert (`<LOD`/`<LOQ`), echte Luecke (`-`), logische Null,
Spuren, gemessen.

`[cmd]` **985.320 Angaben in der Quelle, 18.566 logische Nullen,
1.800 Spuren, 110.182 Striche.**

### Dann die Bilanz

`[read]` **`value_complete` muss zensierte Werte als vorhanden
zaehlen** — **mit dem Wert 0.**

`[cmd]` **Die zwoelf Ziegenfleisch-Posten bleiben unvollstaendig** —
C-48 Regel 1 gilt weiter.

`[read]` **Und die Anzeige muss es sagen koennen:** ein Tag aus
zensierten Werten ist nicht dasselbe wie einer aus Messungen.
`[cmd]` **Das Muster steht: der `teilweise`-Zustand aus C-177.**

### Was nicht zu tun ist

**Keine Grenze erfinden** — MB und UB brauchen den LOD-Wert, den es
nicht gibt.
**Die logische Null nicht anfassen** — sie traegt in der Quelle
bereits eine 0.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Herkunft in food_nutrients   welche Werte, wie viele je Art
    VITC vollstaendige Tage      vorher 0 von 30, nachher
    Ziegenfleisch                bleibt unvollstaendig - belegt
    Vitamin A                    aendert sich etwas?
    NRF9.3                       rechenbar? an wie vielen Tagen
    Gegenprobe                   ein Naehrstoff ohne zensierte
                                 Werte bleibt unveraendert

## Bericht

**2026-08-31, Codex — umgesetzt, nicht committed.**

`nutrition.food_nutrients` hat jetzt die abfragbare Spalte
`bls_value_status`; `data_source` bleibt ausschliesslich der technische
Importweg. Der Status hat genau die fuer Bilanz und Anzeige benoetigten
fuenf Auspraegungen: `measured`, `censored`, `missing`, `logical_zero`,
`trace`. `measured` heisst dabei nur: ein vorhandener Zahlenwert ohne
einen dieser Sonderzustaende — nicht zwingend Laboranalyse.

| BLS-Wertzustand | Zeilen | gespeicherter Wert |
|---|---:|---|
| `measured` | 850.896 | Quellzahl |
| `censored` | 3.870 | `0` nach E-38 Lower Bound |
| `missing` | 110.188 | `NULL` |
| `logical_zero` | 18.566 | Quellwert `0` |
| `trace` | 1.800 | `NULL` |

Die sechs zusaetzlichen `missing`-Zeilen gegenueber den 110.182
Herkunftsangaben `-` haben ebenfalls keinen Wert in der BLS-Arbeitsmappe;
sie werden nicht geraten oder zur Null gemacht.

Der Import uebernimmt die vollstaendige BLS-Matrix (7.140 x 138 =
985.320). Er aktualisiert bei bereits eingefrorenen BLS-Mahlzeiten nur
zensierte Schluessel auf die entschiedene Null: **1.726** Positionen.
Spuren und echte Luecken erhalten weiterhin keinen JSON-Schluessel. Neue
Snapshots verwenden dieselbe Regel. Damit bleibt der Snapshot-Charakter
erhalten, ohne alte Bilanzen mit neu erfundenen Werten zu ersetzen.

**Nachweis, dev, 01.–30.08.2026:**

- VITC: vorher 0/30, jetzt **18/30** vollstaendige Tage; die **12**
  Ziegenfleisch-Positionen bleiben echte Luecken und damit unvollstaendig.
- VITA: **30/30** vollstaendige Tage, keine Verschlechterung.
- Alle zwoelf NRF9.3-Eingaenge sind an **12/30** Tagen vollstaendig. Die
  Tagesbilanz kann diese Tage daher ohne fehlende VITC-Werte liefern; eine
  NRF-Score-Ausgabe war nicht Teil dieses Auftrags.
- Gegenprobe PROT625: 0 zensierte BLS-Zeilen, 30/30 vollstaendige Tage,
  0 fehlende Positionen.

Der gezielte Test `nutrition-c343-bls-censoring.test.ts` ist gruen
(3/3). Die Vollstaendigkeitspruefung bestaetigt die neue Matrix und die
drei Importwege; ihr einziger Fehler ist die vorbestehende, fachfremde
fehlende Tabelle `supplements.substance_group_memberships`.

**C-345:** Der Befund und die Entscheidung E-38 sind umgesetzt; siehe
diesen Bericht. C-345 bleibt als Quellen-/Spurenbefund referenzierbar.

## Abnahme

**2026-08-31, Orchestrator. Der Blocker ist weg.**

`[cmd]` **`food_nutrients.bls_value_status` unterscheidet zensiert,
Luecke, logische Null, Spur und Zahlenwert.**

`[cmd]` **E-38 umgesetzt: 3.870 zensierte Werte auf 0, 110.188
Luecken und 1.800 Spuren auf `NULL`.**

`[cmd]` **VITC: 18 von 30 vollstaendigen Tagen — vorher 0.** `[cmd]`
**Die zwoelf Ziegenfleisch-Positionen bleiben unvollstaendig.**

`[cmd]` **Und alle NRF9.3-Eingaenge sind an 12 von 30 Tagen
vollstaendig.**

`[read]` **Damit ist C-324 nach zwei Tagen entblockt** — der Score ist
rechenbar.

### Der vorsichtige Teil

`[cmd]` **1.726 alte eingefrorene Mahlzeit-Positionen wurden
ausschliesslich um zensierte Nullwerte ergaenzt** — **nichts
ueberschrieben, nichts geraten.**

`[read]` **Eingefrorene Naehrwerte sind Bestand; sie nachtraeglich zu
aendern waere ein Eingriff in Vergangenes.** **Er hat nur ergaenzt,
was E-38 deckt.**

`[cmd]` Test 3/3 gruen. `[cmd]` **Die Schemapruefung meldet eine
vorbestehende, fachfremde Luecke bei
`supplements.substance_group_memberships`** — **gemeldet, nicht
angefasst.**

**Abgenommen.** **C-324 geht als Naechstes raus.**

