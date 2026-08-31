---
nr: G-291
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 45687f24
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-291 — TrendChart fehlt im Insights-Reiter

## Befund

`[cmd]` **`SPEC_10`, *Insights Components (6)*, nennt `TrendChart`:**
*,,Linien-Chart (7d/14d/30d): Kalorien, Protein, Score"*.

`[cmd]` **Gebaut ist er nicht.** `[cmd]` **Der Reiter zeigt zwei
Kacheln: Kalorienbilanz und Makroverteilung.**

`[read]` **Tom, 2026-08-31:** *,,kann nicht sein dass wir da nur 2
kacheln haben."*

## Die Daten stehen

`[cmd]` **181 Tage mit Mahlzeiten fuer `dev`.** `[cmd]` **Die
Tagesbilanz liefert Kalorien und Makros je Tag.**

`[cmd]` **Der Score kommt mit C-324** — **bis dahin zwei Linien statt
drei.**

`[read]` **Und die Zeitraeume gibt es schon:** der Nutrients-Reiter
traegt 1/7/30/90, **die Spec nennt 7/14/30.** **Eine Auswahl, nicht
zwei.**

## Auftrag — der Insights-Reiter wird vollstaendig

**Mitbeauftragt: G-292, G-293, G-295.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Das Ergebnis

`[cmd]` **`SPEC_10` nennt sechs Insights-Komponenten. Gebaut sind
zwei.**

    TrendChart           fehlt   -> G-291
    NutrientHeatmap      entfernt -> G-295
    MacroDetail          fehlt   -> G-293
    DeficitSuggestions   siehe unten
    CrossModuleInsights  wartet auf C-324 -> G-294
    MicroFlagsList       fehlt   -> G-292

`[read]` **Tom, 2026-08-31:** *,,kann nicht sein dass wir da nur 2
kacheln haben."*

### Die Daten stehen alle

`[cmd]` **181 Tage mit Mahlzeiten. 74 Tage mit vollstaendiger Bilanz
in 30 Tagen. `FASAT`, `FAMS`, `FAPU`, `FAPUN3`, `FAPUN6` gefuellt.**
`[cmd]` **Die Flag-Funktion ist seit dem 30.08. live: 9 / 11 / 10
Flags bei 7 / 30 / 90 Tagen.**

`[read]` **Es fehlt nirgends eine Datengrundlage** — **es fehlen die
Anzeigen.**

### Die Vorlagen stehen an drei Stellen

`[cmd]` **CLAUDE.md: das Vorgaengerrepo — Struktur ja, Code nie.**

    referenz/.../nutrition/components/TrendAnalysis.tsx
      339 Zeilen. Score-Farbe, Makro-Maximum, Zeitraumwahl.

    mockup-zwischenwurf/features/nutrition/TrendsView.js
      116 Zeilen. Kalorien-Trend 30 Tage, Protein-Streak-Kalender,
      7x7-Heatmap, Makro-Qualitaet.

    mockup-zwischenwurf/features/nutrition/HeatmapView.js
      69 Zeilen. 7x5-Kalendergitter mit Farbintensitaet.

    mockup-zwischenwurf/features/nutrition/InsightsView.js
      210 Zeilen. Sagt selbst: *,,Mirrors InsightsView + MacroDetail
      + NutritionScoreCard + TrendAnalysis + SPEC_09_SCORING"*.

`[read]` **Die letzte ist die wichtigste** — **sie ist gegen die Spec
gebaut und zeigt, wie die vier Kacheln zusammen aussehen.**

`[cmd]` **Und sie traegt eine Score-Aufschluesselung mit Gewichten**
— **das ist C-324, das gerade bei Codex laeuft.** `[read]` **Nicht
uebernehmen; die Formel ist in E-25 entschieden.**

`[read]` **Lies alle vier, bevor du baust.** `[read]` **Und wenn eine
Vorlage etwas zeigt, das die Spec nicht nennt: melden, nicht
weglassen.**

### Zu G-295 — meine Abnahme war falsch

`[cmd]` **Ich habe der Entfernung der Heatmap am 30.08.
zugestimmt**, mit der Begruendung, der Nutrients-Reiter zeige
dasselbe.

`[read]` **Das war falsch.** `[cmd]` **`HeatmapView.js` ist genau diese Kachel: 7x5-Gitter,
Farbintensitaet je Tag.**

**Die Sparkline zeigt einen Naehrstoff
ueber die Zeit; die Heatmap zeigt einen Tag je Feld, ueber alle
Naehrstoffe.** **Nicht *,,wie lief Vitamin C"*, sondern *,,welche
Tage waren gut"*.**

`[read]` **Die entfernte Attrappe war richtig entfernt — sie war
erfunden.** **Die Kachel gehoert echt gebaut.**

### DeficitSuggestions — melden, nicht bauen

`[cmd]` **`SPEC_10` nennt sie: *,,Food-Empfehlungen basierend auf
aktuellen Defiziten"*.**

`[cmd]` **Und C-108/F-02 sagt: nennen ja, bewerten nein.** `[read]`
**Eine Empfehlung ist eine Bewertung.**

`[read]` **Das ist ein Widerspruch zwischen Spec und Entscheidung.**
**Miss ihn und melde ihn — bau sie nicht.**

### Was nicht zu tun ist

**Nichts erfinden, wo Daten fehlen.**
**Keine Bewertung ausgeben.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** **Codex fasst ihn nicht
an.**

### Nachweis

    je Kachel               echte Zahlen, Bildschirmfoto
    Zeitraeume              welche, und passen sie zum
                            Nutrients-Reiter
    Heatmap                 28 Tage, Farbe je Tag
    Fetthierarchie          aufklappbar, aus den Daten
    Warnungen               sortiert nach Schwere, welche
    DeficitSuggestions      Widerspruch benannt, nicht gebaut
    Attrappen               am Schirm, vorher / nachher
    Ladezeit                ms, kalt und warm

## Bericht

**Gebaut: vier Kacheln. Gemeldet, nicht gebaut: DeficitSuggestions.**
Der Insights-Reiter zeigt jetzt **sechs statt zwei** Kacheln.

Alle Zahlen unten: **`dev@lumeos.app`, gemessen am 2026-08-31**,
Fenster **beidseitig begrenzt** (`between current_date - n und
current_date`).

### Zuerst der Fehler, der die Messung fast verdorben haette

`[cmd]` **Meine erste Abfrage lief mit `entry_date > current_date -
30` und lieferte 107 Tage, bis 2026-11-16.** Bei 7 Tagen waren es
**55 statt 7**.

`[cmd]` **Ursache: `daily_summary` traegt fuer `dev` 104 vergangene
und 77 KUENFTIGE Tage** — die Seeds reichen bewusst nach vorn (C-78).
`[read]` **Ein Zeitfenster ohne obere Grenze faengt sie mit**, ohne
Fehler und ohne Warnung.

Beidseitig begrenzt liefern 7/14/30 genau 7/14/30 Zeilen. Die Regel
steht jetzt im Typ (`InsightsStand.reihe`), im Leseweg und in einem
Waechter, der die `gte`- gegen die `lte`-Aufrufe **zaehlt**.

### G-291 TrendChart

`[cmd]` **30 Tage, 30 mit Eintrag. Schnitt 2.464 kcal.** Vier
Groessen umschaltbar (Kalorien, Protein, Kohlenhydrate, Fett), drei
Fenster (7/14/30).

`[cmd]` **Nicht `LineChart` aus dem Baukasten.** Der nimmt `number[]`
— ein Tag ohne Eintrag muesste dort 0 werden oder wegfallen. `[read]`
**Beides luegt:** 0 kcal behauptet Fasten, das Weglassen zieht die
Kurve ueber die Luecke. **`pfadMitLuecken` setzt nach jedem `null`
neu an**, und die Zeile *„Tage mit Eintrag: 30 von 30"* nennt die
Grundlage.

**Zum Zeitraum, weil der Auftrag danach fragt:** `[cmd]` **SPEC_10
nennt 7/14/30, der Nutrients-Reiter fuehrt 1/7/30/90.** Genommen ist
die der Spec, der Nutrients-Reiter bleibt unberuehrt. `[cmd]` **Der
Altbestand zeigt sie NEBENEINANDER** (`TrendAnalysis.tsx`: drei
`TrendCard`); `[read]` **hier ist es eine Wahl** — drei Diagramme
nebeneinander waeren auf 375 px unlesbar.

Bild: `backup/g291-verlauf.png`

### G-295 NutrientHeatmap

**Deine Berichtigung war richtig, meine Abnahme vom 30.08. war
falsch.** Die Sparkline zeigt einen Naehrstoff ueber die Zeit, die
Heatmap einen Tag je Feld. Die Kachel ist echt gebaut.

`[cmd]` **28 Tage, ein Feld je Tag, Ziel 2.500 kcal**
(`goals.nutrition_targets`, gueltig ab 2026-05-21). Verteilung, in
der Legende mitgezaehlt:

    optimal  >= 95 %    18 Tage
    gut      85-94 %     5
    knapp    75-84 %     4
    gering   < 75 %      1
    leer     kein Eintrag 0

**Die Zahlen der Legende stimmen mit der Datenbank ueberein** —
dieselbe Abfrage, unabhaengig gerechnet.

`[read]` **Ohne Ziel keine Deckung.** `[cmd]` **Die Vorlage
`HeatmapView.js` rechnet gegen ein festes `calTarget = 2100`.** Eine
erfundene Zahl faerbte hier 28 Felder, ohne dass jemand saehe, dass
sie erfunden ist — **fehlt das Ziel, steht ein Satz statt eines
Gitters.**

Bild: `backup/g291-heatmap.png`

### G-293 MacroDetail — und zwei Fehler, die erst das Bild zeigte

`[cmd]` **Aufklappbar, zwei Ebenen tief, Schnitt je Tag ueber 30
Tage:**

    Protein (Nx6,25)                        165,68 g
    Kohlenhydrate, verfuegbar               281,86 g
      Zucker, gesamt                         44,45 g
      Staerke                               234,54 g
      Zuckeralkohole  (aus 13 von 30 Tagen)   2,36 g
      nicht aufgeschluesselt                  0,51 g
    Ballaststoffe   (aus 24 von 30 Tagen)    39,43 g
    Fett                                     65,40 g
      gesaettigt                             14,07 g
      einfach ungesaettigt (aus 25 von 30)   29,95 g
      mehrfach ungesaettigt                  11,29 g
        Omega-3                               4,44 g
        Omega-6                               6,84 g
      nicht aufgeschluesselt                 10,09 g

**Zwei Befunde, beide von mir verursacht, beide vom Bildschirmfoto
gefunden — nicht vom Typecheck und nicht vom ersten Waechter:**

`[cmd]` **1. Die Tageszahlen der Heatmap lasen 48, 58, 68 … 318.**
Meine Zeichenkettenbastelei machte aus `'4.8.'` den Wert `48`. **Der
Typecheck sah nichts** — es war die ganze Zeit ein gueltiger String.
Jetzt `tagNummer()` mit Waechter, der genau diesen Fall prueft.

`[cmd]` **2. „nicht aufgeschluesselt: 197,98 g" unter den
Kohlenhydraten.** `[read]` **Das war kein unbekannter Rest, sondern
mein Auslassen:** `STARCH` (234,54) und `POLYL` (2,36) existieren und
sind an allen 30 Tagen gefuellt. **Mit ihnen bleiben 0,51 g.**

`[cmd]` **Und dabei fiel ein zweites auf: `FIBT` gehoert NICHT unter
`CHO`.** `CHO` ist *Kohlenhydrate, VERFUEGBAR* — Ballaststoffe zaehlen
nicht hinein. **Als Kind gerechnet ergaeben die Teile 320,78 gegen
281,86**, also mehr als das Ganze. `FIBT` steht jetzt daneben, und
`restVon` gibt bei negativem Rest `null` zurueck: **ein negativer
„Rest" ist ein Zuordnungsfehler, keine unaufgeschluesselte Menge.**

`[read]` **Die Lehre: eine grosse Differenz ist ein Verdacht, keine
Aussage** — erst nachsehen, ob der Teil einen Code hat. **Beim Fett
sind die 10,09 g echt** (der BLS fuehrt weitere Bestandteile), bei
den Kohlenhydraten waren es meine fehlenden zwei Codes.

Die Lueckenangabe steht **an der Zahl**, nicht im Kleingedruckten:
`FAMS` *„aus 25 von 30 Tagen"*, `FIBT` *„aus 24"*, `POLYL` *„aus
13"* — sonst liest sich ein Schnitt aus 25 Tagen wie einer aus 30.

Bild: `backup/g291-makrodetail.png`

### G-292 MicroFlagsList

`[cmd]` **11 Warnungen bei 30 Tagen**, sortiert nach Schwere, Duennes
nach hinten:

    Magnesium (Obergrenze)      100 %   30 von 30
    Wasser                      100 %   30 von 30
    Linolsaeure                  97 %   29 von 30
    Natrium                      90 %   27 von 30
    Salz                         90 %   27 von 30
    Niacin (Obergrenze)          77 %   23 von 30
    Calcium                      63 %   19 von 30
    Alpha-Linolensaeure          63 %   19 von 30
    Vitamin D                    63 %   19 von 30
    ---- duenn belegt ----
    Chlorid                      50 %    4 von 8    22 nicht bewertbar
    EPA                          50 %    6 von 12   18 nicht bewertbar

`[read]` **Der Anteil rechnet gegen die BEWERTETEN Tage, nicht gegen
das Fenster.** Gegen 30 gerechnet saehe Chlorid mit 13 % harmlos aus;
tatsaechlich war es an der Haelfte der bewertbaren Tage auffaellig.

`[read]` **Und die Sortierung allein reicht nicht** — wer nur
sortiert, verlaesst sich darauf, dass jemand die Reihenfolge deutet.
**Der Satz steht an der Zeile**, dazu die Zahl der nicht bewertbaren
Tage und ein Merkmal in der Kachelkopfzeile (*„2 duenn belegt"*).

`[cmd]` **Die Funktion liefert genau zwei Richtungen** — `target` (9
Zeilen) und `upper_limit` (2). **Kein `min`, kein `max`.** Ein
unbekannter Wert faellt auf den Rohtext zurueck statt still
uebersetzt zu werden.

Bild: `backup/g291-warnungen.png`

### DeficitSuggestions — der Widerspruch, gemessen

`[cmd]` **SPEC_10, *Insights Components (6)*: *„Food-Empfehlungen
basierend auf aktuellen Defiziten"*.**

`[cmd]` **C-108/F-02: nennen ja, bewerten nein** — ausdruecklich in
C-113: *„Was nicht gebaut wird: Dosierungsempfehlung, Zyklusaufbau,
PCT-Protokoll, Kombinationsvorschlag."*

`[read]` **Eine Lebensmittelempfehlung aufgrund eines Defizits ist
beides zugleich:** sie bewertet den Zustand (*„dir fehlt X"*) und
schreibt eine Handlung vor (*„iss Y"*). **Der Widerspruch ist echt
und nicht durch Formulierung aufzuloesen.**

`[read]` **Was ohne Bewertung ginge, ist bereits gebaut:**
`MicroFlagsList` nennt den Naehrstoff und seine Deckung. **Welches
Lebensmittel die Luecke schliessen soll, ist der Schritt, den C-108
verbietet.** — **Die Entscheidung gehoert Tom; die Kachel ist nicht
gebaut.**

### Waechter und Sabotageprobe

**28 Waechter** in `apps/web/src/lib/nutrition/__tests__/insights-lage.test.ts`.

`[cmd]` **24 Sabotagen einzeln gefahren, jede mit SHA-256-Rueckbau:
24 gefangen, 0 Ueberlebende, Nachlauf 0 Fehlschlaege.**

**Zwei Waechter sind in der ersten Runde durchgefallen — beides meine
eigenen, beides dieselbe alte Klasse:**

`[cmd]` **1. `sortiere`:** meine Testdaten hatten das duenne Flag
zufaellig am unteren Ende, **also gab Sortieren nach Anteil allein
dieselbe Reihenfolge.** Der Fall braucht ein duennes Flag mit dem
HOECHSTEN Anteil — jetzt CLD bei 100 % gegen WATER bei 80 %.

`[cmd]` **2. `pfadMitLuecken`:** die Probe suchte `neu = true` im
Quelltext. **Die Deklaration steht weiter oben und blieb stehen**, als
die Sabotage den Ruecksetzer entfernte — G-216/G-246 zum vierten Mal.
**Jetzt wird die Funktion ausgefuehrt** und die Zahl der
Pfad-Neuansaetze gezaehlt; sie liegt dafuer in `insights-lage.ts`
statt in der Browserdatei.

### Ein dritter Waechterfehler, gefunden vom Gate

`[cmd]` **Alle 14 Dateiproben liefen gruen, solange ich sie aus der
Wurzel startete — und fielen im Gate**, das aus `apps/web/` laeuft.
Ursache: `process.cwd()`. `[read]` **Eine Probe, die vom Startort
abhaengt, prueft nicht die Sache, sondern den Startort.** Der Pfad
kommt jetzt aus `import.meta.url`, **und ein Waechter prueft, dass
die Wurzel wirklich die Wurzel ist** (`pnpm-workspace.yaml`).

### Attrappen und Ladezeit

`[cmd]` **Attrappenmarken auf dem Reiter: 0.** Alle vier neuen
Kacheln tragen keine — einzeln geprueft ueber die Klasse
`v2-attrappe`, nicht ueber eine Textsuche.

`[read]` **Vorher waren es ebenfalls 0** — der Entwurf war seit G-11
per `ohneEchte` unterdrueckt, sobald echte Kacheln stehen.
**Die Aenderung ist die Kachelzahl (2 -> 6), nicht die
Attrappenzahl.** `schuss.mjs` zaehlt weiterhin **1**: das ist die
Buddy-Leiste rechts (*„Buddy ist in G-02 eine Attrappe"*), ausserhalb
des Reiters und nicht Teil dieses Auftrags.

`[cmd]` **Ladezeit, nach `server.py neustart`:**

    kalt   3.839 ms   (Dokument 2.490 ms)
    warm   2.830 ms   (Dokument 1.642 ms)

**Die langsamste Anfrage ist beides Mal das Dokument selbst.** `[cmd]`
**Der Leseweg hat drei Abfragen mehr, aber alle fuenf laufen
nebeneinander** (`Promise.allSettled`) — **300 Zeilen fuer den
Makrobaum**, deutlich unter dem PostgREST-Deckel von 1.000 (G-249).

`[cmd]` **Konsolenfehler: 1** — eine Hydrationswarnung aus
`RootLayout` (`data-mode`), **vorbestehend und ausserhalb dieses
Auftrags.**

### Gate

`[cmd]` **`pnpm gate`: 11 von 11 Aufgaben gruen**, Build und
Typecheck eingeschlossen. `[cmd]` **`[serverimport]` 51 Client-Chunks
geprueft, 0 Treffer**, Gegenprobe positiv. **Der Dev-Server hat den
Build ueberlebt** — die `.next` / `.next-gate`-Trennung haelt.

### Geaendert

    neu   apps/web/src/lib/nutrition/insights-lage.ts        Logik, serverfrei
    neu   apps/web/src/app/v2/nutrition/insights-kacheln.tsx die vier Kacheln
    neu   .../__tests__/insights-lage.test.ts                28 Waechter
    ge.   apps/web/src/lib/nutrition/insights-read.ts        3 Abfragen mehr
    ge.   apps/web/src/app/v2/nutrition/ansicht.tsx          verdrahtet
    ge.   apps/web/src/app/v2/nutrition/page.tsx             30 statt 14 Tage
    ge.   apps/web/src/app/v2/nutrition/insights-echt.tsx    „14d" war fest

`[cmd]` **In `insights-echt.tsx` stand `14` fest im Titel** (*„Macro
split · 14d avg"*). **Mit dem Fenster von 30 Tagen war das falsch** —
die Zahl kommt jetzt vom Aufrufer. `[read]` **Eine Zahl im Titel
altert mit dem, der sie setzt.**

**Nicht committet, nicht gestaged. Nichts auf `dev` geschrieben** —
nur gelesen. **Kein Konsolenfenster** (alle Skripte ueber
`tools/lauf.py` bzw. als Datei).

### Offen, fuer Tom

1. **DeficitSuggestions:** der Widerspruch oben. **Nicht gebaut**,
   wie beauftragt.
2. **CrossModuleInsights** wartet weiter auf C-324.
3. `[cmd]` **`POLYL` ist nur an 13 von 30 Tagen vollstaendig** — die
   Zeile sagt es, aber falls das an den Seeds liegt und nicht an den
   Lebensmitteln, waere es ein eigener Punkt.


## Abnahme

**2026-08-31, Orchestrator.** **Sechs Kacheln statt zwei.**

`[cmd]` **TrendChart:** 30 von 30 Tagen mit Eintrag, Schnitt 2.464
kcal, vier Groessen mal drei Zeitraeume.

`[read]` **Und er hat `LineChart` bewusst nicht genommen:** `[cmd]`
**sie nimmt `number[]`** — **ein Tag ohne Eintrag wuerde zu 0 oder
verschwaende.** **Sein Pfad bricht an der Luecke ab.**

`[cmd]` **NutrientHeatmap:** 28 Felder gegen das echte Ziel von 2.500
kcal — 18 optimal, 5 gut, 4 knapp, 1 gering, 0 leer. `[cmd]` **Ohne
Ziel zeigt sie einen Satz, kein gefaerbtes Gitter.**

`[cmd]` **MacroDetail:** zwei Ebenen, aufklappbar, mit Luecken-Notiz
am Wert.

`[cmd]` **MicroFlagsList:** 11 Warnungen, Anteil gegen bewertete Tage
gerechnet. `[read]` **Und die zwei duenn belegten (Chlorid 4/8, EPA
6/12) sortieren zuletzt und sagen es in der Zeile** — **gegen das
ganze Fenster gerechnet saehe ein selten messbarer Naehrstoff harmlos
aus.**

`[cmd]` **DeficitSuggestions: gemessen und gemeldet, nicht gebaut.**

### Drei eigene Fehler, jeder von einer anderen Pruefung gefangen

`[read]` **Erstens: die Tagesbeschriftungen lasen 48, 58, … 318** —
**ein Zeichenkettenfehler, den der Typecheck nicht sehen konnte.**
**Gefunden vom Bildschirmfoto.**

`[read]` **Zweitens: *197,98 g nicht aufgeschluesselt* unter
Kohlenhydraten** — **er hatte STARCH und POLYL vergessen; mit ihnen
sind es 0,51 g.** `[cmd]` **Und `FIBT` gehoert gar nicht unter CHO —
als Kind uebersteigen die Teile das Elternteil.** **Gefunden beim
Lesen der gerenderten Zahlen.**

`[read]` **Drittens: alle 14 dateilesenden Waechter liefen aus dem
Repo-Wurzelverzeichnis gruen und im Gate rot** — **der Gate laeuft
aus `apps/web`.** **Gefunden vom Gate.**

`[read]` **Drei Fehler, drei verschiedene Faenger.** **Keine Pruefung
haette alle drei gefunden.**

`[cmd]` 28 Waechter, 24 Sabotagen einzeln mit SHA-256-Rueckbau, 24
gefangen, 0 Ueberlebende. `[cmd]` Gate 11/11, kalt 3.839 ms, warm
2.830 ms.

`[cmd]` **Die eine gemeldete Attrappe ist das Buddy-Feld ausserhalb
des Reiters** — auf dem Reiter selbst 0.

**Abgenommen.** **Toms drei Anmerkungen gehen als G-297, G-298,
G-299.**

