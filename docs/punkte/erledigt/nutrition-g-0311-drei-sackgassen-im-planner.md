---
nr: G-311
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: G-310
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-311 — drei Sackgassen im Planner

## Befund

Tom, 2026-09-01, am Schirm.

### 1 · *In der Werkbank* tut nichts

`[cmd]` **Der Knopf steht in der Planliste, der Sprung fehlt.**
`[cmd]` **Das ist G-307, halb gebaut.**

### 2 · Ein Rezept im Raster laesst sich nicht oeffnen

Tom: *,,eingetragene recipes sind ja ok, aber mindestens bei klick
drauf will man sehen was darin ist an lebensmittel und details."*

`[cmd]` **`RecipeDetail` ist gebaut — im Rezepte-Reiter.** `[cmd]`
**Im Planner ist sie nicht verdrahtet.**

### 3 · Die Rezepte-Auflistung unter dem Raster

Tom: *,,darunter rezepte auflistung? fuer was ist das zeigt nur
irgendwelche daten an."*

`[cmd]` **Sie steht in keiner Spec und in keinem Mockup.**
`[read]` **Sie stammt aus dem Entwurf, aus der Zeit vor dem
Rezepte-Reiter** — **und ist seit G-289 doppelt.**

## Auftrag

**Vorbereitet mit G-310 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.


## Auftrag — die Bibliothek verdrahten, dann die drei Sackgassen

**Beauftragt am 2026-09-02.**

### 1 · Die "Alle Plaene"-Liste in den Plans-Reiter

**Ja, verdrahten.** `[read]` **Drei Quellen sagen dasselbe:**

`[cmd]` **Die Attrappe zeigt unten sechs Plankarten.** `[cmd]`
**E-41: *Meal plans ist die Bibliothek — alle Plaene, aktivieren.***
`[cmd]` **Und `SPEC_03` Flow 3 Schritt 1: *Uebersicht zeigt alle
verfuegbaren Plaene*.**

`[cmd]` **`allePlaene` ist geladen, `MealPlanCard` gebaut** — **es ist
Verdrahtung, kein Neubau.** `[read]` **Du hast recht, dass es dein
Auftrag nicht ausdruecklich nannte.** **Es ist die Voraussetzung
dafuer, die vier Herkunfts-Badges ueberhaupt zu belegen.**

`[read]` **Und der gekippte Kommentar *,,der zweite gehoert
tom.seed"* faellt damit auch** — er begruendete genau die Luecke, die
du gefunden hast.

### 2 · *Lifecycle types* heisst heute *Lebenszyklus*

`[cmd]` **Noch ein erfundener Titel.** `[read]` **Die Attrappe nennt
ihn *Lifecycle types* und zeigt drei Zeilen mit Folgesatz.**

`[read]` **Nimm ihn mit** — es ist dieselbe Klasse wie die sieben,
die du entfernt hast.

### 3 · G-311 — drei Sackgassen im Planner

`[cmd]` **1. *In der Werkbank* tut nichts** — der Sprung fehlt
(G-307).

`[cmd]` **2. Ein Rezept im Raster laesst sich nicht oeffnen.**
`RecipeDetail` ist gebaut, im Planner nicht verdrahtet.

`[cmd]` **3. Die Rezepte-Auflistung unter dem Raster steht in keiner
Spec und keinem Mockup** — seit dem Rezepte-Reiter doppelt.

### Was nicht zu tun ist

**Nichts erfinden, was weder in der Attrappe noch in der Spec
steht.**
**Nichts auf `dev@lumeos.app`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Alle Plaene       vier Plaene sichtbar, vier Badges belegt
    Lifecycle types   Titel aus der Attrappe
    Werkbank-Knopf    fuehrt in den Planner
    Rezept im Raster  oeffnet das Detail
    Rezepte-Liste     entfernt
    Buehne            rueckwaerts datiert, wie du korrigiert hast
    Bildschirmfoto    vorher / nachher

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

`[cmd]` Gate gruen, 1.204 Tests, 34 von 34 Sabotagen, `dev`
unveraendert.

### Die Bibliothek zeigt jetzt vier von vier

`[cmd]` **Von Coach, Marketplace, AI erstellt** — **und
`self_created` traegt keines**, wie `SPEC_03` Flow 3 verlangt:
*,,Eigene — ohne Label"*.

`[cmd]` **Der aktive Plan steht oben in voller Breite und wird nicht
wiederholt** — **wie das Mockup es mit `plans.slice(1)` macht.**

`[read]` **Damit sind die zwei Badges belegt, die vorher nicht
belegbar waren.**

`[cmd]` **Und zwei weitere erfundene Titel mitgenommen:** *Lifecycle
types* und *Today's ghost entries* — der hiess *Plan-Eintraege*.
**Vierter und fuenfter.**

### Sackgasse 1 lag tiefer als mein Auftrag sagte

`[read]` **Mein Auftrag sagte *,,der Sprung fehlt"*.**

`[cmd]` **Tatsaechlich setzte der Knopf einen Client-Zustand, und der
Plan wird auf dem Server geladen** — **sie konnten sich nie
treffen.**

`[read]` **Nicht *der Sprung fehlt*, sondern *der Sprung war nicht
moeglich*.** `[cmd]` **Jetzt ueber `?plan=`, mit Rueckfall auf den
ersten Plan bei veralteter Kennung.**

`[cmd]` **Belegt: das Raster wechselt von *Recomp 5-Meal Plan* auf
*Buddy AI*, die Adresse traegt `?plan=`.**

### Und `RecipeDetail` gibt es nicht

`[cmd]` **Nur als Kommentar.** `[cmd]` **Das Detail heisst
`RezeptKarte`, ist nicht exportiert und an einen anderen Typ
gebunden.**

`[read]` **Ich habe in G-311 eine Komponente zitiert, die es nicht
gibt** — **zum zweiten Mal an zwei Tagen, nach `MealPlansView.js`.**

`[read]` **Er hat die Zutaten aus demselben Verbund gelesen, der
schon zum Zaehlen diente** — statt eine Komponente zu bauen, die ich
faelschlich als vorhanden angenommen hatte.

### Zwei fremde Waechter fielen, beide berechtigt

`[cmd]` **G-287 verlangte `HERKUNFT_TEXT` an der Karte** — steht
jetzt als Badge. `[cmd]` **Und dass `PlanBibliothekEcht` geloescht
ist** — **in G-287 richtig, jetzt aus drei Quellen wieder da.**

`[read]` **A-62 in seiner sauberen Form: die Waechter waren nicht
falsch, sie sind ueberholt.** **Nachgezogen mit Begruendung.**

### Was er nicht gebaut hat

`[cmd]` **Den Preview-Knopf der Attrappe, Zeile 365.**

`[read]` **Begruendung:** das Tages-Akkordeon braucht `PlanDaten`,
**die Bibliothek hat `PlanKurz`** — *,,ein Knopf ohne Ziel waere die
naechste Sackgasse."*

`[read]` **Genau die Klasse, die wir heute viermal entfernt haben.**
**Als G-314 vorgelegt.**

**Abgenommen.**

