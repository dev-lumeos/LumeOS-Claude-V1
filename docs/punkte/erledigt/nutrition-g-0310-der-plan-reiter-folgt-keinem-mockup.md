---
nr: G-310
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: null
entscheidung: E-41
agent: claudecode
beauftragt: 2026-09-01
erledigt: 2026-09-02
commit: 43e6154e
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen:
  gemessen: 2026-09-01
  mockup_zeilen: 136
---

# G-310 — der Plan-Reiter folgt keinem Mockup

## Befund

Tom, 2026-09-01: *,,irgendwie zweifle ich daran dass das alles anhand
specs oder unserem brainstorm erstellt wird und irgend ein gebastel
ist."*

`[cmd]` **`MealPlansView.js` liegt seit Monaten im Fundus, 136
Zeilen.** `[cmd]` **Der Orchestrator hat es nie gelesen.**

`[read]` **Die Ablaeufe kamen aus `SPEC_03`, die Sperren aus den
ADRs, die Komponenten aus `SPEC_10`.** `[read]` **Das Layout — welche
Kachel wo, was zusammensteht — ist erfunden.**

## Was das Mockup zeigt

    Links (1fr)
      Aktiver Plan   Name, Beschreibung, "Tag 3/12"
                     Compliance-Balken mit Prozent
                     3 bestaetigt · 1 abweichend · 1 uebersprungen
                       · 2 offen
                     vier Kacheln: kcal/Tag, Dauer, Protein, Score
                     Tages-Accordion, heutiger Tag offen
      Alle Plaene    je Zeile Name, Herkunfts-Badge, Beschreibung
                     user ohne Badge, Marketplace orange,
                     Von Coach blau, AI erstellt gruen

    Rechts (280px)
      Lifecycle      "Was passiert nach Tag 12?"
                     drei Radios: Einmalig / Wiederholend /
                     Gefolgt von -> Plan
      Statistiken    Aktiver Plan seit, Compliance gesamt,
                     Mahlzeiten bestaetigt 9/15,
                     Offene Ghost Entries, ø Kalorien (3T)

## Was heute stattdessen steht

`[cmd]` **Vier getrennte Kacheln rechts: *Planumfang*,
*Lebenszyklus*, *Herkunft* mit Knopf *Plan bearbeiten*,
*Einhaltung*.**

`[read]` **Keine davon steht in einem Mockup oder einer Spec.**
**Sie sind aus dem Schema abgeleitet** — eine Kachel je Spaltengruppe.

Tom: *,,irgend einen plannamen anpassen und seine laufzeiten ist fuer
mich nicht planbearbeiten."*

`[cmd]` **Und die Compliance-Zahlen fehlen** — das Mockup zeigt sie
als erste Aussage der aktiven Karte.

## Auftrag — nach dem Mockup bauen

**Mitbeauftragt: G-311, G-307.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-01.**

### Lies zuerst, vollstaendig

    mockup-zwischenwurf/features/nutrition/MealPlansView.js
      136 Zeilen. Layout, Kacheln, Reihenfolge, Badges.
    mockup-zwischenwurf/features/nutrition/RecipeList.js
    SPEC_03 Flow 3 und 4
    SPEC_10 Meal Plan Components (8)

`[read]` **Der Orchestrator hat das Mockup nie gelesen und das
Layout erfunden.** **Deshalb steht es hier zuerst.**

`[read]` **Und wenn das Mockup etwas zeigt, das der Spec
widerspricht: melden, nicht auswaehlen.**

### Was das Mockup vorgibt

    Links (1fr)
      Aktiver Plan   Name, Beschreibung, "Tag 3/12"
                     Compliance-Balken mit Prozent
                     3 bestaetigt · 1 abweichend · 1 uebersprungen
                       · 2 offen
                     vier Kacheln: kcal/Tag, Dauer, Protein, Score
                     Tages-Accordion, heutiger Tag offen
      Alle Plaene    je Zeile Name, Herkunfts-Badge, Beschreibung
                     user ohne Badge, Marketplace orange,
                     Von Coach blau, AI erstellt gruen

    Rechts (280px)
      Lifecycle      "Was passiert nach Tag 12?"
                     drei Radios mit Folgesatz
      Statistiken    Aktiver Plan seit, Compliance gesamt,
                     Mahlzeiten bestaetigt 9/15,
                     Offene Ghost Entries, ø Kalorien

`[cmd]` **Die vier heutigen Kacheln — Planumfang, Lebenszyklus,
Herkunft, Einhaltung — stehen in keinem Mockup.** `[read]` **Sie sind
aus dem Schema abgeleitet, eine je Spaltengruppe.**

`[cmd]` **Und die Daten fuer die Compliance stehen seit G-309:**
`meal_plan_logs` mit vier Zustaenden je Position.

### Was aus der Spec kommt und bleibt

`[cmd]` **Der Lifecycle-Picker mit drei Wahlen** — E-31, und das
Mockup zeigt dieselben drei. `[cmd]` **Die Herkunft je Zeile** —
`SPEC_03` Flow 3 nennt die Beschriftungen.

`[read]` **Der Knopf *Plan bearbeiten* gehoert nicht unter
*Herkunft*.** Tom: *,,irgend einen plannamen anpassen und seine
laufzeiten ist fuer mich nicht planbearbeiten."* **Er fuehrt in den
Planner** (E-41, G-307).

### G-311 — drei Sackgassen im Planner

`[cmd]` **1. *In der Werkbank* tut nichts** — der Sprung fehlt
(G-307).

`[cmd]` **2. Ein Rezept im Raster laesst sich nicht oeffnen.**
`RecipeDetail` ist gebaut, im Planner nicht verdrahtet.

`[cmd]` **3. Die Rezepte-Auflistung unter dem Raster steht in keiner
Spec und keinem Mockup** — sie ist seit dem Rezepte-Reiter doppelt.

### Was nicht zu tun ist

**Nichts erfinden, was weder in Mockup noch Spec steht.**
**Kein Layout aus dem Schema ableiten.**
**Nichts auf `dev@lumeos.app`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    je Kachel        steht sie im Mockup? Zeile nennen
    entfernt         welche, und warum sie nirgends stand
    Compliance       Zahlen aus meal_plan_logs, am Schirm
    Plan-Liste       vier Herkuenfte, Badges wie im Mockup
    Werkbank-Knopf   fuehrt in den Planner, belegt
    Rezept im Raster oeffnet das Detail
    Rezepte-Liste    entfernt
    Bildschirmfoto   vorher / nachher

## Bericht

**Gate gruen (1.204 Tests, +14), 34 von 34 Sabotagen gefangen,
`dev@lumeos.app` unveraendert.**

`[read]` **Der Auftrag stand auf der falschen Vorlage** — das ist der
erste Befund, und er hat den Rest bestimmt.

### 1 · Die Vorlagenfrage — gemessen, nicht ausgewaehlt

`[cmd]` **G-310 nannte `mockup-zwischenwurf/features/nutrition/
MealPlansView.js` (135 Zeilen).** `[cmd]` **Der Dateikopf von
`tab-plans.tsx` nennt `theme-v1/module-nutrition-spec.jsx`,
`MealPlansView` Zeile 334-521 (630 Zeilen).** **Zwei verschiedene
Entwuerfe desselben Reiters, fast gleicher Name, derselbe Ordner.**

`[cmd]` **Jedes Merkmal von Toms Bildschirmfoto steht in `theme-v1`,
keines im Zwischenwurf:**

    Merkmal                    theme-v1   Zwischenwurf
    "not counted"                 1x           0
    "Today's ghost entries"       1x           0
    "read-only while active"      1x           0
    "Next restart"                1x           0
    "7-day compliance"            1x           0
    "Confirm as planned"          1x           0
    "Mandeln"                     2x           0

`[cmd]` **Und die Compliance-Rechnung steht in `theme-v1` Zeile 340
woertlich:** `((confirmed + deviated) / (confirmed + deviated +
skipped)) * 100`.

**Tom, 2026-09-01:** *,,Die Vorlage ist die Attrappe im Code. ... das
angebunden ist eine kopie des mockups angebunden."*

`[read]` **Also: die sechs `attrappe={ATTRAPPE}`-Zweige SIND die
Vorlage.** **`theme-v1` erklaert, was eine Attrappe meint** — sie ist
keine zweite Vorlage zum Neubauen. **Der Zwischenwurf gilt nicht**
(G-284).

`[cmd]` **Zurueckgebaut: der Statistik-Leseweg** (`ladePlanStatistik`,
119 Zeilen) — er war gegen den Zwischenwurf gebaut. **Null Aufrufer
ausserhalb der Definition, vor dem Rueckbau gemessen.**

### 2 · Was die Kopien vorher falsch machten

`[cmd]` **Drei Kacheltitel waren erfunden**, ein vierter dazu:

    Attrappe                  hiess vorher
    Plan settings             Planumfang
    7-day compliance          Einhaltung
    Lifecycle types           Lebenszyklus
    Today's ghost entries     Plan-Eintraege

`[read]` **Ein erfundener Titel neben einer Attrappe, die einen
anderen traegt, ist das Gegenteil einer Kopie.**

`[cmd]` **Und zwei Elemente der Attrappe fehlten ganz:** der
Compliance-Ring und die Sparkline.

### 3 · Die Kopfkarte — Ring und ausgeschriebene Rechnung

`[cmd]` **Die alte Begruendung stand im Doccomment:** *,,Ohne Ring.
... `meal_plan_entries` fuehrt keinen Status."*

`[cmd]` **Seit G-309 ist das hinfaellig** — der Status liegt in
`meal_plan_logs`, und dort entstehen Zeilen.

`[cmd]` **Am Schirm gemessen, Buehne mit 4 confirmed / 1 deviated /
1 skipped:**

    (4 bestaetigt + 1 abgewichen) / (4 + 1 + 1 ausgelassen)
      = 83.3 % · 0 offen zaehlen nicht

**Nachgerechnet: 5/6 = 83,33 %.** `[read]` **Ausgeschrieben wie in
der Attrappe (Z. 164-166)** — sonst stuende dort eine Prozentzahl,
die niemand nachrechnen kann.

`[read]` **Ohne Entscheidung kein Ring**, und die Zeile sagt dann
*,,noch nichts entschieden"* statt *,,0 %"* (C-323).

### 4 · Die Compliance-Formel war falsch — nicht im Auftrag

`[cmd]` **`quoteVon` rechnete `bestaetigt / entschieden`.**
`[cmd]` **`SPEC_09` Abschnitt 2 verlangt `(confirmed + deviated) /
decided`** und nennt die Regel ausdruecklich: *,,`deviated` zaehlt als
Erfolg fuer Compliance (User hat sich aktiv entschieden)."*

**Tom, 2026-09-01:** *,,Compliance misst, ob jemand seinen Plan
verfolgt — nicht, ob er gehorcht."*

`[read]` **Und die falsche Formel arbeitete gegen die Auswertung aus
G-309:** wenn jede Abweichung die Quote senkt, ist Abweichen bestraft
— **und der Nutzer traegt lieber falsch ein.** Dasselbe Argument wie
E-42.

`[cmd]` **Vor der Aenderung gemessen: EIN Produktaufrufer**
(`plans-echt.tsx`), der Rest Tests. **Keine Stelle zaehlte bewusst nur
`confirmed`** — deshalb dieselbe Funktion, kein zweiter Name.

`[cmd]` **Ein bestehender Test kodierte die falsche Regel** —
*,,abgewichen zaehlt als Entscheidung, nicht als Erfolg"*, mit
`quoteVon(e) === 50`. **Umgestellt, mit dem Spec-Verweis.**

### 5 · Fuenf Elemente ohne Vorlage entfernt

    Next restart              Termin ohne Ausfuehrer (C-373/E-42)
    Confirm mode              liegt an meal_plan_logs, nicht am Plan
    read-only while active    E-42
    Pause plan                E-42
    Duplicate                 E-42

`[read]` **`Next restart` war meine eigene Meldung:** die Zeile
behauptet einen Termin, an dem etwas geschieht. **Nach C-373
geschieht nichts von selbst.** `[cmd]` **Stattdessen steht dort das
Ende der Laufzeit** (*,,Laeuft bis 6.9.2026"*) — es ist gemessen und
behauptet keinen Vollzug.

`[cmd]` **`Confirm mode` haengt an `meal_plan_logs`, nicht an
`meal_plans`** — gemessen am 2026-09-01. **Je Ausfuehrung, nicht als
Planeinstellung**; und der MealCam-Weg existiert nicht (G-276).

### 6 · Die Herkunft ist ein Badge, keine Kachel

`[cmd]` **`HerkunftEcht` entfernt** (A-59) — sie stand in keiner
Attrappe, sie war aus dem Schema abgeleitet.

`[cmd]` **Das Badge steht an der Plankarte**, wie in der Vorlage
(Mockup Z. 89) und `SPEC_03` Flow 3 Schritt 2.

`[cmd]` **Der CHECK erlaubt VIER Herkuenfte** — gemessen:
`self_created`, `coach_created`, `marketplace`, `buddy`.
`[cmd]` **`herkunftVon` kannte nur drei und warf `buddy` auf
`unbekannt`.** **Berichtigt.**

`[cmd]` **Am Schirm belegt, vier Plaene mit vier Herkuenften:**

    Von Coach      1x
    Marketplace    1x
    AI erstellt    1x
    self_created   kein Badge   (SPEC_03: "Eigene — ohne Label")

### 7 · Der Befund, der die Badges erst belegbar machte

`[cmd]` **Am 2026-09-01 gemessen: vier Plaene bei `test-user`, EINER
erschien.**

`[read]` **`ladePlan()` nimmt `plaene[0]`.** `[cmd]` **`allePlaene`
war geladen — ging aber nur an den Planner, nicht in den
Plans-Reiter.**

`[cmd]` **Und der Kommentar dort begruendete genau die Luecke:**
*,,Einen Plan, nicht zwei — der zweite gehoert `tom.seed`."* **Bei
`test-user` waren es vier eigene** (A-62).

**Vorgelegt statt gebaut**, weil der Auftrag es nicht nannte. **Tom:
*,,Ja, verdrahte die Alle-Plaene-Liste."*** `[cmd]` **Drei Quellen
verlangen sie:** die Attrappe (Z. 343), **E-41**, **`SPEC_03` Flow 3
Schritt 2.**

### 8 · A-62: zwei still gekippte Aussagen

`[cmd]` **In `plans-echt.tsx:162`:** *,,Vier der fuenf Zeilen der
Vorlage fehlen im Schema: `Lifecycle`, `Started`, `Next restart` und
`Confirm mode` haben keine Spalte."*

`[cmd]` **Am 2026-09-01 gemessen: alle vier existieren.**
`lifecycle_type`, `start_date`, `days_count`, `next_plan_id`,
`rollover_count` an `meal_plans`; `confirmation_mode` an
`meal_plan_logs`.

`[read]` **Die Berichtigung stand seit dem 30.08. IM RUMPF — aber
nicht im Kopf.** **Und der Kopf ist, was der naechste Leser zuerst
sieht.**

`[cmd]` **Zweite Stelle:** der `tom.seed`-Kommentar aus Abschnitt 7.

### 9 · G-311 — die drei Sackgassen

**1 · *In der Werkbank* tut nichts.**

`[cmd]` **Der Knopf setzte einen `useState` in der Liste** — und das
Raster darunter zeigte weiter den aktiven Plan. `[read]` **Der Zustand
blieb im Client, der Plan wird auf dem Server geladen** — **sie
konnten sich gar nicht treffen.**

`[cmd]` **Der Kommentar in `ansicht.tsx` sagte *,,das Raster zeigt
dann dessen Wochen"* — und genau das tat es nicht.**

**Gebaut:** `ladePlan(planId?)`, die Wahl geht ueber `?plan=`.
`[cmd]` **Am Schirm belegt:**

    Raster vorher:   G-310 Recomp 5-Meal Plan
    Klick "Bearbeiten"
    URL danach:      ?tab=planner&plan=88c5f259-...
    Raster nachher:  G-310 Buddy AI — Defizit Plan

`[read]` **Eine veraltete Kennung faellt auf den ersten Plan zurueck**
— sie kommt aus der URL, und ein leeres Raster waere ein Fehler, den
niemand erklaert.

**2 · Ein Rezept im Raster laesst sich nicht oeffnen.**

`[cmd]` **`RecipeDetail` gibt es nicht als Komponente** — nur als
Kommentar. **Das Detail ist `RezeptKarte`** (`rezepte-echt.tsx`
Z. 656), nicht exportiert, an einen anderen Typ gebunden.

`[cmd]` **Der Planner fuehrte `zutaten` nur als ZAHL.** **Gebaut:
`ZutatenListe`**, die Zutaten kommen aus demselben Verbund, der schon
zum Zaehlen gelesen wurde — **keine zweite Runde** (G-252).

`[cmd]` **Am Schirm belegt:**

    klickbare Rezepte: 1
    G-311 Huhn-Reis-Bowl — Zutaten
    aria-expanded: true
    Grillhaehnchen · Reis · Broccolisalat
    3 Zutaten · 1348 kcal je Rezept

`[read]` **NUR ein Rezept ist klickbar** — ein BLS-Eintrag ist sein
eigener Inhalt. **Ein Knopf, der nichts oeffnet, waere die naechste
Sackgasse.**

`[cmd]` **Und `planned_servings / servings` skaliert** — dieselbe
Rechnung wie beim Bestaetigen (G-309), **sonst zeigte das Raster
andere Mengen als das Tagebuch.**

**3 · Die Rezepte-Auflistung unter dem Raster.**

`[cmd]` **Eine Tabelle mit sieben Spalten** (Rezept, Kueche, Koennen,
Zeit, Zutaten, kcal, Protein). `[cmd]` **In keiner Spec, in keinem
Mockup** — und seit G-289 doppelt.

`[cmd]` **Entfernt, nicht auskommentiert** (A-59). **Am Schirm
belegt: Spalte *Kueche* weg.**

### 10 · Zwei fremde Waechter fielen mit

`[cmd]` **G-287 verlangte `HERKUNFT_TEXT[herkunft]` an der
Plankarte** — die Quelle steht weiter da, **jetzt als Badge**.
**Umgestellt, `SPEC_10` verlangt *,,Quelle"*, keine Schreibweise.**

`[cmd]` **Und G-287 verlangte, dass `PlanBibliothekEcht` GELOESCHT
ist** — in G-287 richtig: die alte zeigte je Woche eine Textzeile,
nicht anklickbar. **G-310 baut sie neu, aus drei Quellen.**
**Derselbe Name, andere Sache** — der Waechter prueft jetzt, dass sie
Plaene zeigt, die man aktivieren kann.

### 11 · Die Waechter und die Sabotageprobe

`[cmd]` **14 Waechter, 34 Sabotagen, 34 gefangen** — Rueckbau je
Sabotage per SHA-256 als byteidentisch belegt.

`[cmd]` **Im ersten Durchgang kam eine durch:**

    S1   ein Attrappen-Zweig verliert seine Marke

`[read]` **Mein Waechter zaehlte `>= 4`, es sind sechs** — **eine
einzelne Marke konnte verschwinden.** **Auf die feste Zahl
umgestellt** (G-216: eine Untergrenze erlaubt Verlust).

`[cmd]` **Und eine Sabotage war eine Dublette** — die Ring-Bedingung
steht nur einmal (gemessen). **Ersetzt durch eine echte zweite
Pruefung**, samt neuem Waechter fuer den Leersatz.

### 12 · Ein Datenverlust waehrend der Arbeit

`[cmd]` **Ein `UnicodeEncodeError` auf einem Emoji-Surrogatpaar hat
`plan-lesen.ts` von 645 auf 119 Zeilen abgeschnitten.**
`[read]` **`io.open(..., "w")` leert die Datei beim OEFFNEN** — der
Fehler kam beim `write`. **Die G-309-Arbeit daran war nicht
committet.**

`[cmd]` **Wiederhergestellt aus `git show HEAD:` plus den Bloecken der
Scratchpad-Skripte.** **Belegt durch Typecheck, 15/15
G-309-Waechter und das volle Gate.**

`[read]` **Seither schreibe ich ueber eine Nebendatei mit
`os.replace`** — atomar, und ein Kodierungsfehler erreicht das Ziel
nie.

### 13 · Stand

    pnpm gate                gruen, 15 von 15 Aufgaben
    Tests apps/web           1.204 (vorher 1.190), davon 0 rot
    Sabotagen                34 von 34, Rueckbau byteidentisch
    Attrappen am Schirm      1 — der Buddy-Bereich (G-02),
                               nicht der Plan-Reiter
    Ladezeit                 1.860 ms / 1.534 ms zweiter Lauf
    test-user@lumeos.local   zurueckgebaut, gezaehlt:
                               meal_plans 4 -> 0, logs 6 -> 0,
                               meals 5 -> 0, recipes 1 -> 0,
                               recipe_ingredients 3 -> 0
    dev@lumeos.app           unveraendert — 1 Plan, 0 Logs,
                               updated_at 2026-09-01 (aus G-306)
    committet                nein

### Was ich NICHT getan habe

`[read]` **Keine Attrappe entfernt** — alle sechs Zweige stehen, ein
Waechter zaehlt sie.
`[read]` **Nichts aus dem Zwischenwurf uebernommen** — der
Statistik-Leseweg ist zurueckgebaut.
`[read]` **Kein `Preview`-Knopf in der Bibliothek** — die Attrappe
zeigt ihn, aber er fuehrt nirgendwohin. **Ein Knopf ohne Ziel ist
eine Sackgasse** (G-311).

### Was offen bleibt

`[cmd]` **Die Attrappe zeigt einen `Preview`-Knopf je Plankarte**
(Z. 365). **Nicht gebaut** — das Tages-Akkordeon gibt es nur fuer den
aktiven Plan (`MealPlanDetail` braucht `PlanDaten`, die Bibliothek
hat `PlanKurz`). `[read]` **Das ist ein eigener Baustein, kein
Versehen.**

`[cmd]` **`MealPlanCard` und `PlanBibliothekEcht` zeigen beide eine
Plankarte** — die eine mit vollem Baum, die andere kurz. `[read]`
**Ob sie zusammengelegt gehoeren, habe ich nicht entschieden** — sie
bedienen verschiedene Typen.


## Abnahme

**2026-09-02, Orchestrator.**

**Der Reiter folgt jetzt der Attrappe, mit Zeilenbeleg je Kachel.**

    Kopfkarte          Ring + (4 bestaetigt + 1 abgewichen) /
                       (4+1+1 ausgelassen) = 83,3 %      Z. 153, 164-166
    Plan settings      Lifecycle, Days count, Started,
                       Laeuft bis                        Z. 246
    7-day compliance   Sparkline, Avg, Deviations, Skips  Z. 301
    Herkunfts-Badge    in MealPlanCard                    Mockup Z. 89

`[cmd]` **Sieben Entfernungen, jede belegt:** Planumfang, Einhaltung,
Herkunft, Next restart, Confirm mode, *read-only while active*, Pause
plan.

`[read]` **Die letzten beiden waren durch E-42 abgeloest** — **er hat
sie nicht stehen lassen, weil sie in der Attrappe standen.**

### Die Buehne war falsch, nicht die Anzeige

`[cmd]` **Erst zeigte die Compliance Avg 100 % bei 4/1/1 auf der
Buehne.**

`[cmd]` **Gemessen statt vermutet: `ladePlanLogs(datum, 7)` liest
rueckwaerts vom Anzeigetag** — **vier der sechs Zeilen lagen in der
Zukunft und fielen korrekt heraus.**

`[read]` **Die naheliegende Reaktion waere gewesen, das Fenster zu
aendern.** **Er hat die Buehne korrigiert.**

`[cmd]` **Danach: 5/6 = 83,33 Prozent, ausgeschrieben wie in der
Attrappe.**

### Der Befund, den er nicht selbst entschieden hat

`[cmd]` **Der Plans-Reiter zeigt einen von vier Plaenen.** `[cmd]`
**`allePlaene` ist geladen und wird durchgereicht** — **an
`PlanWerkbank` im Planner, nicht in den Plans-Reiter.**

`[read]` **Damit sind zwei der vier Herkunfts-Badges nicht belegbar:
die Plaene, die sie tragen, werden nicht gerendert.**

`[read]` **Er hat angehalten und gemeldet, statt die Liste zu
erfinden.** **Die Antwort ist ja** — drei Quellen verlangen sie:
Attrappe, E-41 und `SPEC_03` Flow 3 Schritt 1.

### Und ein dritter gekippter Kommentar

`[cmd]` **`,,Einen Plan, nicht zwei — der zweite gehoert
tom.seed"`** — **bei `test-user` liegen vier eigene.**

`[read]` **A-62, und er begruendete genau die Luecke, die derselbe
Lauf gefunden hat.**

`[cmd]` **Offen bleibt ein erfundener Titel: *Lebenszyklus* statt
*Lifecycle types*.** **Mit G-311 beauftragt.**

**Abgenommen.**

