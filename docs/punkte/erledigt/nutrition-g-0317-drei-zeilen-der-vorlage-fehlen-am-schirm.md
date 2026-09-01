---
nr: G-317
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-315
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 3d5854f7
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-317 — drei Zeilen der Vorlage fehlen am Schirm

## Befund

`[cmd]` **Bildschirmfoto vom 2026-09-02, `backup/g315-nachher-voll.png`,
gegen `theme-v1` Z. 334-521 gehalten.**

    Z. 364   Ring: label UNTER der Zahl
             Ist: "COMPLIANCE" liegt im Ring und ueberlagert ihn
    Z. 393   Status-Pille in der Statusfarbe
             Ist: grau, fuer jeden Zustand gleich
    Z. 394   kcal rechtsbuendig, marginLeft auto
             Ist: fehlt

`[read]` **Alle drei wurden in G-315 als umgesetzt gemeldet.**

## Warum es zaehlt

`[read]` **Die Statuspille ist die einzige Stelle, an der `confirmed`,
`deviated` und `skipped` sich unterscheiden.** `[cmd]` **Die Vorlage
gibt jedem eine Farbe** (Z. 341-346): `--pos`, `--warn`, `--neg`,
`--fg-dim`.

`[read]` **Grau fuer alle heisst: die Unterscheidung ist unsichtbar.**

`[cmd]` **Und die kcal je Eintrag stehen in der Vorlage rechts** —
sie sind der einzige Zahlenwert der Zeile.

## Und ein vierter, aus G-302

`[cmd]` **Die Zielzeile bricht weiter um** — *Kohlenhydrate 313 g*
steht ueber der Beschriftung, bei 1440 px.

`[read]` **G-302 liegt seit dem 31.08. offen.**

## Auftrag — die drei Zeilen und der Umbruch

**Mitbeauftragt: G-302, G-316.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Drei Zeilen, die du als umgesetzt gemeldet hast

`[cmd]` **Am Bildschirmfoto `backup/g315-nachher-voll.png`
nachgesehen:**

    Z. 364   Ring: label UNTER der Zahl
             Ist: "COMPLIANCE" liegt im Ring
    Z. 393   Status-Pille in der Statusfarbe
             Ist: grau, fuer jeden Zustand gleich
    Z. 394   kcal rechtsbuendig, marginLeft auto
             Ist: fehlt

`[read]` **Die Statuspille ist die einzige Stelle, an der
`confirmed`, `deviated` und `skipped` sich unterscheiden.** `[cmd]`
**Die Vorlage gibt jedem eine Farbe** (Z. 341-346): `--pos`,
`--warn`, `--neg`, `--fg-dim`.

`[read]` **Grau fuer alle heisst: die Unterscheidung ist
unsichtbar** — **und genau sie traegt die Compliance-Rechnung
darueber.**

### G-302 — die Zielzeile bricht um

`[cmd]` **Seit dem 31.08. offen.** `[cmd]` **Bei 1440 px steht
*Kohlenhydrate 313 g* ueber der Beschriftung, nicht daneben.**

`[cmd]` **Vier Werte in einer Zeile, der dritte hat die laengste
Beschriftung.**

### G-316 — Log deviation

`[cmd]` **Du hast gemeldet: `ladeTagesEintraege` liefert nur
Bezeichnung und kcal.**

`[cmd]` **Der Rest steht:** G-309 hat die Ghost-Anzeige mit
Einzelzutaten gebaut, **je Zutat ein Mengenfeld.** `[cmd]` **Und
`plan-log-write.ts` rechnet `deviation_kcal` und `deviation_pct`** —
belegt mit 1.028 kcal und 76,3 Prozent.

`[read]` **Es fehlt der Leseweg** — **derselbe, den du in G-311 fuer
das Rezept im Raster gebraucht hast.**

`[read]` **MealCam bleibt weg** — G-276, kein Modell.

### 4 · Die Kopfkarte traegt zwoelf Zeilen statt vier

Tom, 2026-09-02: *,,Aufbau-Wochenplan zeigt genau die gleichen daten
wie nebendran Plan settings."*

`[cmd]` **Die Vorlage, Z. 362-377, hat GENAU vier Zeilen neben dem
Ring:**

    Z. 367   Name
    Z. 368   Pille "active"
    Z. 369   Pille mit dem Zyklus
    Z. 371   "Day 3 of 7 ? started May 14 ? source: coach (Jana
             Bauer)"  -- EINE Zeile, muted, 12 px
    Z. 373   die Rechnung, mono, 10,5 px

`[cmd]` **Bei uns stehen darunter zusaetzlich:** Wochen, Tage,
Eintraege, Zeilen je Tag, kcal Ziel, Protein, Kohlenhydrate, Fett
**und ein Absatz Fliesstext.**

`[cmd]` **Vier davon stehen rechts nochmal in *Plan settings*:**
Wochen, Tage gesamt, Eintraege, Zustand.

`[read]` **Die Vorlage fasst Dauer, Start und Herkunft in eine
Zeile.** **Wir haben sie in zwei Tabellen ausgebreitet, links und
rechts, mit Ueberschneidung.**

**Bau die vier Zeilen. Was rechts steht, steht nicht links.**

`[read]` **Und der Fliesstext *aus nutrition.meal_plans ? 3 Wochen ?
21 Tage ?"* gehoert weg** — er wiederholt zum dritten Mal, was schon
zweimal dasteht.

### 5 · Die Sparkline zeigt keinen Verlauf

`[cmd]` **Vorlage Z. 436: `Sparkline data={[...sieben Werte]} h=44`.**

`[cmd]` **Bei uns: ein Balken, der von links unten nach rechts oben
laeuft und dann flach bleibt.**

`[read]` **Sieben Tage, sechs davon ohne Protokoll** — **die Kurve
zeigt fast nur Fuellwerte.** `[read]` **Sag, was sie zeigen soll,
wenn nur zwei Tage Daten haben** — **eine Linie durch erfundene
Punkte ist schlimmer als eine kurze.**

### 6 · Was Tom sonst benannt hat

*,,wechseln im planner geht irgendwas aber keine daten da"*

`[cmd]` **Die drei Plaene hatten 0 Positionen** — mein Seed. `[cmd]`
**Codex fuellt sie gerade** (C-380). `[read]` **Pruef nach seinem
Bericht, ob das Wechseln dann Daten zeigt.**

*,,der untere teil alles ineinander verschoben"*

`[cmd]` **Das war der dreifache Plan, in G-315 behoben.** `[read]`
**Sieh am Bildschirmfoto nach, ob es jetzt sitzt** — und sag es,
falls nicht.

### Wie du es belegst

`[cmd]` **`dev@lumeos.app` traegt vier Plaene und sechs
Protokollzeilen** — lesen und ansehen erlaubt, **nicht schreiben.**

`[read]` **Ein Bildschirmfoto, auf dem die drei Statusfarben
gleichzeitig zu sehen sind** — **die Buehne hat confirmed, deviated
und skipped.**

### Nachweis

    Kopfkarte       vier Zeilen, keine Wiederholung von rechts
    Ring            label unter der Zahl, Bildschirmfoto
    Statuspille     drei Farben gleichzeitig sichtbar
    kcal            rechtsbuendig je Zeile
    Zielzeile       bricht nicht um, 1440 px
    Log deviation   Mengenfelder, Abweichung beziffert
    Bildschirmfoto  vorher / nachher

## Bericht

**Gate gruen (1.220 Tests, +6), 21 von 21 Sabotagen gefangen.**

`[read]` **Zwei Punkte des Auftrags haben sich beim Messen anders
dargestellt** — sie stehen unten mit dem, was gemessen wurde.
`[cmd]` **Und ich habe einen eigenen Fehler gefunden: meine
G-315-Klickprobe hat auf `dev` geschrieben.**

### 1 · Die drei Zeilen — gemessen, nicht angenommen

`[cmd]` **Vorher am Schirm, Konto `dev@lumeos.app`, 1440 px:**

    Z. 364   Ring, Label unter der Zahl
             Wert y 17..59, Label y 61..76, ragt nicht heraus
             -> WAR BEREITS RICHTIG

    Z. 393   Statuspille in der Statusfarbe
             ausgelassen  oklch(0.68 0.005 270)
             offen        oklch(0.68 0.005 270)   <- dasselbe Grau
             -> 2 von 3 nicht unterscheidbar

    Z. 394   kcal rechtsbuendig
             0 kcal-Spannen am Schirm
             -> die Zeile war LEER, nicht falsch ausgerichtet

`[read]` **Der Ring war schon richtig** — der Auftrag nennt ihn als
Fehler, die Messung widerspricht. **Am Bild sitzt das Label eng
(0 px Abstand); 2 px ergaenzt, mehr war nicht zu tun.**

### 2 · Die Statusfarbe — die Ursache lag in der Tabelle

`[cmd]` **`plan-bestaetigung.ts`: `skipped: 'var(--fg-dim)'`** —
dasselbe Grau wie `pending`. `[cmd]` **Die Vorlage (Z. 344) sagt
`var(--neg)`.**

`[read]` **Der Kommentar dort sagte *,,Offen ist kein Befund"*** —
das stimmt fuer `pending`. **Fuer `skipped` galt er nie:** wer eine
Mahlzeit auslaesst, hat entschieden. **Die Zeile hatte die
Begruendung der Nachbarzeile geerbt.**

`[cmd]` **Nachher gemessen, alle vier gleichzeitig sichtbar:**

    bestaetigt   oklch(0.52 0.13 150)   gruen
    abgewichen   oklch(0.55 0.13 80)    gelb
    ausgelassen  oklch(0.5 0.16 22)     rot
    offen        oklch(0.68 0.005 270)  grau
    -> 4 von 4 verschieden

`[cmd]` **Bild: `backup/g317-vier-zustaende.png`.**

`[read]` **Der Nachweis geht auf `dev` NICHT** — der Seed legt je Tag
genau EINEN Zustand an, und der Reiter zeigt heute. **Also auf
`test-user`, mit einer Buehne, die alle vier an einem Tag traegt.**

### 3 · Die kcal fehlten ganz

`[cmd]` **`ladeTagesEintraege` setzte `kcal: null`**, mit der
Begruendung *,,die kcal stehen erst nach dem Bestaetigen fest"*.

`[read]` **Das verwechselt zwei Zahlen.** **Was nach dem Bestaetigen
feststeht, ist die GEGESSENE Menge** — sie steht in `meals`. **Die
Vorlage zeigt die GEPLANTE**, und die steht im Eintrag.

`[cmd]` **Derselbe Rechenweg wie im Planner** (`ladePlan`
Z. 363-365): `recipe_nutrition` fuer Rezepte,
`food_nutrient_snapshot` fuer Lebensmittel. **Kein zweiter Weg.**

`[cmd]` **Nachher: 16 kcal-Spannen, `marginLeft: 174px`.**

### 4 · Die Kopfkarte trug zwoelf Zeilen

**Tom:** *,,Aufbau-Wochenplan zeigt genau die gleichen daten wie
nebendran Plan settings."*

`[cmd]` **Vorher:** Wochen, Tage, Eintraege, Zeilen je Tag, kcal Ziel,
Protein, Kohlenhydrate, Fett **und ein Absatz Fliesstext.**

`[cmd]` **Nachher, vier Zeilen wie die Vorlage (Z. 362-377):**

    Aufbau-Wochenplan  ·  aktiv  ·  once
    Tag 1 von 21 · Start 1.9.2026
    (5 bestaetigt + 1 abgewichen) / (5 + 1 + 2 ausgelassen)
      = 75 % · 0 offen zaehlen nicht

`[read]` **Die Vorlage fasst Dauer, Start und Herkunft in EINE
Zeile** (Z. 371). **Jeder Teil faellt weg, wenn er nicht belegbar
ist** — ein `· — ·` behauptet eine Leerstelle, wo es keine gibt.

### 5 · G-302 loest sich mit auf — kein Layoutfehler

`[cmd]` **Ueber `theme-v1` Z. 334-521 gemessen: die Vorlage zeigt im
aktiven Bereich KEINE Zielwerte.** `target_kcal` kommt dort nicht
vor — nur `kcal` als Pille in der Bibliothek (Z. 464).

`[read]` **Die Zeile, die bei 1440 px umbrach, war kein
Layoutfehler** — **sie stand an der falschen Stelle.** `[cmd]`
**Nachher: `Kohlenhydrate`, `kcal Ziel`, `Zeilen je Tag` und der
Fliesstext sind weg.**

### 6 · Die Sparkline — die Frage des Auftrags

**Der Auftrag fragt:** *,,sag, was sie zeigen soll, wenn nur zwei
Tage Daten haben."*

`[cmd]` **Erst gemessen: es sind SECHS von sieben, nicht zwei** —
27.8. bis 1.9., je eine Zeile. **Die Kurve hatte genug Punkte.**

`[cmd]` **Der Fehler lag woanders: `reihe.map(x => x.quote ?? 0)`** —
**ein Tag ohne Entscheidung wurde als 0 % gezeichnet.**

`[read]` **Dieselbe Erfindung, die `quoteVon` vermeidet:** `null`
heisst *,,noch keine Aussage"*, nicht *,,null Prozent"* (C-323).
**Eine Kurve, die dort auf den Boden faellt, behauptet einen
Einbruch, den es nicht gab.**

**Die Antwort auf die Frage, im Code:**

    nur die gemessenen Tage      die Kurve wird kuerzer, nicht falscher
    Skala fest auf 0-100         ohne Vorgabe normalisiert sie auf
                                 min/max, und 75/80/100 saehe aus wie
                                 ein Absturz
    "6 von 7 Tagen protokolliert" sonst liest man sieben, wo sechs
                                 stehen

`[cmd]` **Nachher am Schirm: *,,6 von 7 Tagen protokolliert · Avg
78 % · Deviations 1 · Skips 2 · Confirmed 5"*.**

### 7 · G-316: `Log deviation`

`[cmd]` **Der Schreibweg konnte es seit G-309** (`bestaetigen` nimmt
`mengen`). `[cmd]` **Es fehlte der Leseweg** — ohne Posten keine
Mengenfelder.

`[cmd]` **Gebaut wie in G-311:** die Zutaten aus demselben Verbund,
EINE Abfrage fuer alle Rezepte, `planned_servings / servings`
skaliert.

`[cmd]` **Im Browser belegt** (auf `test-user`, nicht dev):

    Menge 200 g -> 600 g, HTTP 200
    status           deviated
    deviation_kcal   1372
    deviation_pct    200,0

**Nachgerechnet: 200 g = 686 kcal, 600 g = 2058 kcal, Differenz
1372 = +200 %.**

`[read]` **MealCam bleibt weg** — G-276, kein Modell.

### 8 · Punkt 6: was Tom sonst benannt hat

`[cmd]` **Die drei Plaene haben jetzt Positionen** — Codex' C-380
ist eingespielt: der aktive Plan traegt 21 Tage und 56 Eintraege.
**Das Wechseln im Planner zeigt Daten.**

`[cmd]` **Der untere Teil sitzt** — jeder der vier Plaene erscheint
genau 1x. **Der dreifache Plan aus G-315 ist behoben.**

### 9 · Ein eigener Fehler: meine Klickprobe hat auf dev geschrieben

`[cmd]` **Beim Rueckbau gemessen: `dev` trug 8 Logzeilen statt 6.**

`[cmd]` **Zwei davon entstanden um 06:42** — der Seed war um 05:30.
**Dazu eine Mahlzeit mit vier Posten, und `Lean bulk 3100` stand auf
`paused` statt `assigned`.**

`[read]` **Herkunft: meine Knopfprobe in G-315** — ich habe die
Knopfnamen geprueft und dabei gedrueckt. **Genau die Falle, die ich
mir in `klickprobe-schreibt-mit` notiert hatte.**

`[cmd]` **Zurueckgebaut, gezaehlt:** 2 Logzeilen, 4 Posten, 1
Mahlzeit geloescht, `Lean bulk 3100` auf `assigned` zurueckgesetzt.
**Nachher: 6 Logzeilen, alle mit `created_at` 05:30 — der
Seed-Stand.**

`[read]` **In diesem Auftrag habe ich auf `dev` nur gelesen** — die
Abweichungsprobe lief auf `test-user`, mit gezaehltem Rueckbau.

### 10 · Die Waechter und die Sabotageprobe

`[cmd]` **6 Waechter, 21 Sabotagen, 21 gefangen** — Rueckbau je
Sabotage per SHA-256 als byteidentisch belegt.

`[cmd]` **Im ersten Durchgang kam eine durch:**

    S9   ein `return` vor der Logik — `teile.join(' · ')` blieb
         im Text stehen, der Waechter suchte das Wort

`[read]` **Derselbe Fehler wie in G-315** — **behoben, indem
`kopfzeile` exportiert und AUFGERUFEN wird**, mit vier Faellen:
alle Teile, ohne Herkunft, ohne alles, und die Trennzeichen gezaehlt.

`[read]` **Und warum es diese Datei ueberhaupt gibt:** meine
G-315-Waechter waren gruen, waehrend drei Zeilen am Schirm fehlten.
**Sie prueften die ANZEIGE** — und uebersahen, dass die Farbtabelle
zwei Zustaende zusammenlegte und der Leseweg `null` lieferte. **Das
Wort stand da, der Wert nicht.**

### 11 · Drei fremde Waechter fielen mit

`[cmd]` **G-298** verlangte `{laufzeitSatz(laufzeit)}` als eigenen
Absatz — **die Sache gilt weiter**, jetzt in der einen Zeile, **mit
Datum** (*,,21 Tage, abgelaufen am 15.7.2026"*).
`[cmd]` **G-310** verlangte den Filter beim Zeichnen — er steht
jetzt eine Zeile hoeher.
`[cmd]` **G-315** vermerkte `Log deviation` als *nicht gebaut* —
**jetzt ist es gebaut.**

### 12 · Stand

    pnpm gate                gruen, 15 von 15 Aufgaben
    Tests apps/web           1.220 (vorher 1.214), 0 rot
    Sabotagen                21 von 21, Rueckbau byteidentisch
    Bildschirmfotos          backup/g315-nachher-voll.png (vorher)
                             backup/g317-nachher-voll.png (nachher)
                             backup/g317-vier-zustaende.png
                               (vier Statusfarben gleichzeitig)
    Ladezeit                 1.838 ms / 1.598 ms zweiter Lauf
    Attrappen am Schirm      1 — der Buddy-Bereich (G-02)
    dev@lumeos.app           4 Plaene, 6 Logzeilen — Seed-Stand
                               wiederhergestellt
    test-user                0 Plaene, 0 Logs — Buehne zurueckgebaut
    committet                nein

### Was offen bleibt

`[cmd]` **Der Ring war nie falsch** — falls Tom ihn am Bild weiter
als ueberlagert sieht, liegt es an der Enge (Label 71 px in 92 px),
nicht an der Anordnung. **Dann waere die Zahl kleiner zu setzen, und
das weicht von der Vorlage ab** — gemeldet, nicht entschieden.


## Abnahme

**2026-09-02, Orchestrator.** `[cmd]` Gate 15/15, 19 von 19
Sabotagen, `dev` unberuehrt.

`[cmd]` **Committet als `3d5854f7`** — 20 Dateien, getrennt von
Codex' C-380-Arbeit im selben Arbeitsbaum.

### Vier Befunde, die er nebenbei gefunden hat

`[cmd]` **1. Vier bestehende Waechter prueften das Wort statt der
Wirkung:**

    614     onAktivieren?: (id: string) => void
            der Name war da, die id wurde verworfen
    C-375   />Bearbeiten</button>/  -- der Knopf heisst jetzt Anwaehlen
    G-298   pruefeHerkunft == 4     -- wocheKopieren ist der fuenfte
    G-306   dieselbe Zaehlung, zweite Stelle

`[read]` **Der erste ist der schwerste: der Waechter prueste die
Signatur, nicht den Aufruf.** `[read]` **Sie messen jetzt die
Wirkung** — haengt die Frage an `p.id`, traegt die Kachel den Klick,
wird die Herkunft bei der Kopie geprueft.

`[cmd]` **2. Acht Waechter waren gruen, waehrend `tsc` acht
Syntaxfehler meldete.** `[cmd]` **Ursache: ein JSX-Kommentar als
erstes Element nach `return (`** — dort gilt er nicht.

`[read]` **Seine Folgerung ist die richtige:** *,,die Reihenfolge im
Gate ist die einzige Absicherung."* **Ein Waechter, der Text liest,
sagt nichts ueber Code, der laeuft.**

`[cmd]` **3. Seine Schnittfunktion `rumpf()` nahm die erste `{` nach
dem Funktionskopf** — **die Destrukturierung, nicht den Koerper.**
`[read]` **Der Schnitt endete in der Typangabe, und die Suche darin
fand nichts.** `[cmd]` **Fuer JSX gibt es jetzt `element()`, das
rueckwaerts zum oeffnenden Tag geht und prueft, ob es eines
gefunden hat** — sonst waere das Fenster die ganze Datei.

`[cmd]` **4. Er hat den Fremdanteil im Arbeitsbaum gemeldet:**
`supabase/_pipeline/` traegt Codex' C-380-Arbeit. `[read]`
**Getrennt committet: `3d5854f7` und `6992fca2`.**

### Was offen bleibt

`[read]` **Eine Entscheidung fuer Tom:** `[cmd]` **es gibt keine
Spalte fuer Bearbeitbarkeit.** `[cmd]` **`meal_plans` traegt nur
`darf_weiterverkaufen`, und E-42 sagt ausdruecklich, das sei
Weiterverkaufs-, nicht Bearbeitungsschutz.**

Tom: *,,der coach oder derjenige der den plan fuer marketplace
erstellt definiert ob er editierbar ist."*

`[read]` **Die Sperre haengt heute an der Herkunft, nicht an einer
Wahl des Erstellers.** **Als C-382.**

**Abgenommen.**

