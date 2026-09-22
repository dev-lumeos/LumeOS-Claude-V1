---
nr: G-492
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [G-491]
kind_von: G-484
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 321bacb5
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
    - apps/web/src/app/v2/supplements/produkt-tafel.tsx
    - apps/web/src/app/v2/supplements/produkt-aktion.tsx
    - apps/web/src/app/v2/supplements/substanz-tafel.tsx
    - apps/web/src/app/v2/supplements/tafel-reiterleiste.tsx
    - apps/web/src/app/v2/supplements/supplements.css
    - apps/web/src/lib/supplements/produkt-reiter-lage.ts
    - apps/web/src/lib/supplements/produkt-aktion-lage.ts
    - apps/web/src/lib/supplements/produkte-read.ts
    - apps/web/src/lib/supplements/__tests__/g492-aktion-als-modal.test.ts
zahlen:
  gemessen: 2026-09-22
---

# G-492 - Hinzufuegen ist eine Aktion, keine Detailseite

## Toms Befund

Tom, 2026-09-08:

> ich denke, es ist nicht die richtige richtung, dass man ein
> produkt oeffnen muss, dann runterscrollen, um irgendwo
> hinzuzufuegen

> es ist eine aktion, und aktionen sollten wir mit modals loesen

> meiner meinung nach gehoert in die auflistung als
> zweithinterste spalte action rein, sprich benutzen oder
> hinzufuegen, und wohin/wieviel etc gehoert ins modal

## Die Recherche

### Cronometer macht es genau so

`[cmd]` **Cronometer, Hilfe-Artikel *,,Add a Food"*:** nach dem
Auswaehlen oeffnet sich das Fenster *,,Add Food To Diary"* mit
Portionsgroesse, Menge und **Diary Group** ? **das ist die
Mahlzeitwahl.**

### Die UX-Literatur stuetzt beide Haelften

`[cmd]` **Spalte:** Aktionen einer Zeile gehoeren in die
letzte Spalte (PatternFly); die ein bis zwei haeufigsten
bleiben direkt sichtbar (saasui.design).

`[cmd]` **Modal:** braucht eine Aktion mehrere Felder, ist ein
Modal besser als Inline (Eleken).

`[cmd]` **Eine Warnung, die hier NICHT greift:** NN/G raet bei
tiefer Bearbeitung von Modals ab, weil sie Nachbarzeilen
verdecken.

`[read]` **Beim Hinzufuegen schaut niemand in die
Nachbarzeile** ? **es ist eine Entscheidung, keine
Bearbeitung.**

## Toms Entscheidungen

**1** ? **EIN Knopf.**

> einen

`[read]` **Die Formregel (C-524, in der Datenbank) entscheidet,
was das Modal anbietet** ? **eine Kapsel zeigt nur den
Stack.**

**2** ? **Die Aktion bleibt auch in der Detailansicht, aber
OBEN.**

> kann drin bleiben, aber auch da sehe ich es nicht am ende,
> denn soweit runter scrollt einer nur, wenn er anweisungen
> lesen will

## Die Form

    Name | Marke | Form | Portion | kcal | P | [+] | [>]
                                             ^      ^
                                   zweithinterste  Detail

### Das Modal

    Wohin?     ( ) Stack   ( ) Mahlzeit   <- nach Form
    Welcher?   [Cut-Phase v] / [Mittagessen v]
    Wieviel?   Portion [31 g v]  Anzahl [1]
    nur Stack: Zeitpunkt, Haeufigkeit, Zyklus
               -> "ergibt 120 kcal, 24 g Protein"

## Was bleibt aus G-484

`[cmd]` **Die Schreibwege, die Formregel, die zwei Pulldowns,
die Dosispruefung** ? **alles wird wiederverwendet.**

`[read]` **Nur der ORT wandert: aus der Detailansicht unten ins
Modal.**

## Warum G-491 zuerst

`[cmd]` **Die Tabelle bleibt bei manchen Suchen leer** ?
**ohne Zeilen kein Knopf.**

## Abnahmebedingungen

    A1  der Knopf steht in der zweithintersten Spalte.
        Foto.
    A2  ein Klick oeffnet das Modal, OHNE die Liste zu
        verlassen. Foto.
    A3  eine Kapsel: das Modal zeigt nur den Stack.
        Foto.
    A4  ein Pulver: beides. Foto.
    A5  die Vorschau rechnet vor dem Eintragen mit.
        Foto.
    A6  in der Detailansicht steht derselbe Knopf OBEN,
        ohne Scrollen sichtbar. Foto.
    A7  derselbe Schreibweg wie G-484 -- nicht
        nachgebaut. Belegt.
    A8  nach dem Eintragen: eine Bestaetigung, wohin es
        ging. Foto.
    A9  die elf anderen Reiter unveraendert.
    A10 apps/web 1910 oder mehr, apps/coach 65.

## Nachtrag 2026-09-08 - die Vorlage steht schon im Code

Tom, mit Bildschirmfoto des Substanzen-Reiters:

> oder wir gehen nochmal logisch ueber die darstellung, wenn
> details geoeffnet sind, und bauen das wie bei supplements mit
> subnav, dann muss man nicht mehr soviel runternavigieren

### Was der Substanzen-Reiter schon hat

    Zeile      [+ Add]  -- ganz rechts, in der Liste
    Detail     Subnav: Ueberblick | Dosierung | Sicherheit |
                       Fragen | Rechtslage
    unten      [Zum Stack hinzufuegen]

`[cmd]` **Gemessen: `substanz-tafel.tsx` und
`substanz-abschnitte.tsx`.**

`[cmd]` **`produkt-tafel.tsx` existiert daneben, OHNE
Subnav.**

### Und dasselbe Problem steht auch dort

`[read]` **`Zum Stack hinzufuegen` steht bei den Substanzen
ganz UNTEN** ? **Toms Pfeile zeigen genau darauf.**

## Was sich damit am Auftrag aendert

**1** ? **Die Produkt-Detailansicht bekommt eine Subnav, wie
die Substanzen.**

    Ueberblick     Marke, Form, Portion, Markt
    Inhaltsstoffe  die Tafel (C-505)
    Anwendung      Suggested Use (schon importiert)
    Hinweise       Precautions, Formulation -- erst nach
                   C-527, dann nachziehen

`[read]` **Die Abschnitte sind ein Vorschlag** ? **MISS, was
die Produkt-Tafel heute zeigt, und gruppiere danach.**

**2** ? **Die Aktion steht OBEN, in der Subnav-Zeile.**

`[read]` **Nicht unten, nicht im Abschnitt** ? **sichtbar, egal
welcher Reiter offen ist.**

**3** ? **Dasselbe fuer die Substanzen.**

`[read]` **`Zum Stack hinzufuegen` wandert dort ebenfalls nach
oben** ? **eine Bauform fuer beide Tafeln.**

### Zusaetzliche Abnahmebedingungen

    A11 die Produkt-Tafel hat eine Subnav wie die
        Substanz-Tafel. Foto.
    A12 die Aktion steht in der Subnav-Zeile, in JEDEM
        Reiter sichtbar. Foto aus zwei Reitern.
    A13 die Substanz-Tafel: Zum Stack hinzufuegen oben
        statt unten. Foto vorher/nachher.
    A14 beide Tafeln nutzen DIESELBE Subnav-Bauform --
        nicht zweimal gebaut. Belegt.

## Toms Entscheidung zu den Reitern, 2026-09-08

> einbauen und ausdokumentieren, sobald daten da sind
> einbinden. plus einen reiter fuer die etikette, den bildpfad
> werden wir mit den 527 daten auch haben. ueberblick und
> inhaltsstoffe auf den ersten reiter, das ist was man sehen
> will

### Die Reiter

    1  Ueberblick     Marke, Form, Portion, Markt
                     UND die Inhaltsstoffe (C-505)
                     -- das, was man sehen will
    2  Anwendung      Suggested Use (schon importiert)
    3  Hinweise       Precautions, Formulation
                     -> Daten kommen mit C-527
    4  Etikett        das Etikettenbild
                     -> Bildpfad kommt mit C-527

    rechts in der Subnav-Zeile:  [+ Add]

`[read]` **Das ersetzt den Vorschlag aus dem Nachtrag oben** ?
**Inhaltsstoffe sind kein eigener Reiter, sondern Teil des
ersten.**

### Vorbereitete Reiter sagen, warum sie leer sind

`[read]` **Die Lehre aus G-482 und G-486: eine leere Flaeche
ohne Grund sieht aus wie ein Fehler.**

`[read]` **Hinweise und Etikett zeigen bis C-527 einen Satz,
KEIN leeres Feld** ? **etwa:** *,,Die Warnhinweise vom Etikett
werden noch uebernommen."*

`[cmd]` **Und im Code dokumentiert: welche Spalte den Reiter
fuellen wird, und welcher Punkt sie liefert (C-527).**

### C-527 bekommt den Gegenzug

`[read]` **Wenn C-527 die Daten liefert, zieht ein Auftrag die
zwei Reiter nach** ? **das steht in C-527 als Folge.**

### Zusaetzliche Abnahmebedingungen

    A15 vier Reiter: Ueberblick (mit Inhaltsstoffen),
        Anwendung, Hinweise, Etikett. Foto.
    A16 der erste Reiter zeigt die Inhaltsstoffe ohne
        Wechsel. Foto.
    A17 Hinweise und Etikett: ein Satz statt eines
        leeren Felds. Foto beider.
    A18 im Code dokumentiert: welche Datenquelle, welcher
        Punkt (C-527). Belegt.

## Bericht

**Hinzufuegen ist jetzt eine Aktion.** `[cmd]` **Ein Klick in der
Zeile, ein Modal, kein Scrollen** — und beide Tafeln haben eine
Subnav mit der Aktion oben.

    A1  Knopf in der zweithintersten Spalte      erfuellt
    A2  ein Klick, Modal auf, Liste bleibt       erfuellt
    A3  Kapsel: nur Stack                        erfuellt
    A4  Pulver: beides                           erfuellt
    A5  die Vorschau rechnet mit                 erfuellt
    A6  derselbe Knopf oben in der Tafel         erfuellt
    A7  derselbe Schreibweg wie G-484            erfuellt
    A8  Bestaetigung, wohin es ging              erfuellt
    A9  die elf anderen Reiter unveraendert      erfuellt
    A10 apps/web 1934/1934, coach 65/65          erfuellt
    A11 die Produkt-Tafel hat eine Subnav        erfuellt
    A12 die Aktion in JEDEM Reiter sichtbar      erfuellt
    A13 Substanz-Aktion oben statt unten         erfuellt
    A14 beide Tafeln, EINE Bauform               erfuellt
    A15 vier Reiter                              erfuellt
    A16 Inhaltsstoffe ohne Wechsel               erfuellt
    A17 Hinweise und Etikett: ein Satz           erfuellt
    A18 Quelle und Punkt dokumentiert            erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen sind
Codex' C-529.

### Das Vorher-Bild, bevor es verschwand

`[cmd]` **Zuerst gemessen** (`tools/_g492-vorher.mjs`), weil ein
Vorher sich nicht nachtraeglich herstellen laesst:

    Substanz   Leiste y=560    Knopf y=1228   668 px darunter
    Produkt    keine Leiste    Aktion y=1625

`[cmd]` **Beide `scrollNoetig: true`** — ausserhalb des Schirms.
`[read]` **Das ist Toms Befund in Zahlen.**

**Nachher:**

    Substanz   Leiste y=560    Knopf y=564    in der Leiste
    Produkt    Leiste y=669    Knopf y=673    in der Leiste

### A14 — eine Bauform, und sie stand dreimal im Code

`[cmd]` **Gemessen: die Reiterleiste war dreimal abgeschrieben.**

    substanz-tafel.tsx:853            .v2-supp-reiter
    medical/wirkstoff-tafel.tsx:416   .v2-med-wirk-reiter
    produkt-tafel.tsx                 gar nicht

`[cmd]` **Jetzt eine:** `tafel-reiterleiste.tsx`, benutzt von
beiden Tafeln dieses Auftrags. `[cmd]` **Die alte Abschrift in
`substanz-tafel.tsx` ist GELOESCHT**, nicht auskommentiert —
**genau so sind die drei entstanden.**

`[read]` **Die medizinische Abschrift bleibt liegen.** Sie traegt
ein eigenes Klassenpraefix und gehoert einem anderen Modul —
**sie mitzuziehen waere eine Aenderung an `medical`, die dieser
Auftrag nicht deckt.** `[cmd]` **Gemeldet, nicht angefasst.**

**Eine Regel musste dabei fallen:** die Abschriften trugen
`reiter.length <= 1 -> null`. `[read]` **Mit der Aktion IN der
Leiste waere sie bei einem einzigen Reiter unsichtbar** — genau
der Fehler, den der Auftrag behebt.

### Der Befund aus meinem eigenen Foto — und was er wirklich war

`[cmd]` **Gemessen 2026-09-22:**

    SELECT pg_get_function_result(oid) FROM pg_proc
     WHERE proname='search_supplier_products';
    -> elf Spalten, `produktform` ist KEINE davon

`[read]` **Der Tabellenweg liefert die Form, der Smartweg nicht**
— und der Smartweg laeuft bei jeder Suche ohne Filter.

`[read]` **Fuer G-492 waere das schlimmer als eine leere Spalte:**
die Formregel entscheidet, ob der Knopf Stack oder beides
anbietet — **ohne Form faellt JEDES Pulver auf „nur Stack".**

`[cmd]` **Die Nachlese steht jetzt in `produkte-read.ts`,
serverseitig.** `[cmd]` **Kosten gemessen: 500 Zeilen in 2,8 ms**
(`EXPLAIN ANALYZE`, Index Only Scan).

`[cmd]` **Sie wird GESTUECKELT (150)** — `SUCH_GRENZE` ist 200,
und G-64 hat gemessen, dass `.in()` um 200 Ids mit *„URI too
long"* kippt **und die Bibliothek das als LEERE Liste meldet.**
`[read]` **Ein stiller Totalverlust waere der Fall, den niemand
bemerkt.**

`[cmd]` **Gemessen ueber drei Suchen: 0 Zeilen ohne Form.**

    "Whey"        200 Zeilen   Powder 197, Other 3
    "Vitamin D3"  200 Zeilen   sieben verschiedene Formen
    "Creatine"    200 Zeilen   Powder 171, Capsule 14, ...

`[read]` **Es reicht** — und es faellt weg, sobald C-520 die
Spalte zurueckgibt. **Im Code steht, dass es dann zu entfernen
ist.**

### A17/A18 — die wartenden Reiter, und eine berichtigte Annahme

`[cmd]` **Gemessen in `information_schema.columns`:**
`supplier_products` hat **0 Spalten**, die auf `precaut`,
`formul`, `label`, `image` oder `bild` passen.

`[cmd]` **Und C-527 ist ein RECHERCHEPUNKT** (*„A7 KEINE
Umsetzung"*). `[read]` **Die Spaltennamen stehen also noch nicht
fest.** `[cmd]` **Mein erster Entwurf nannte
`supplier_products.precautions` und `label_image_path`** — **das
waeren erfundene Zusagen gewesen.**

`[cmd]` **Jetzt nennt die Dokumentation die QUELLE:**

    Hinweise   DSLD „Label Statements"
               Precautions 18.362, Formulation 16.621
    Etikett    DSLD-Etikettseite
               dsld.od.nih.gov/label/<dsld_id>

`[cmd]` **Der Etikett-Reiter wartet auf eine URL, nicht auf eine
Bilddatei** — C-527 sagt *„Etikett wartet auf den Bildpfad
(URL)"*, und sie ist aus `dsld_id` rekonstruierbar. `[read]`
**Nicht hier zusammengebaut:** C-527 hat drei Zeilen geprueft und
schreibt selbst *„drei von 121.959 sind kein Beleg. MISS es."*

`[read]` **Der Satz steht auf dem Schirm, nicht nur im
Quelltext** — wer den Reiter offen hat, soll sehen, dass das
Warten einen Grund und eine Adresse hat.

### Zwei Fehler, die nur die Messung gefunden hat

**1 — das Pulldown zeigte eine Portion, der Zustand war leer.**

`[cmd]` **Gemessen: das Feld zeigte `32 Gram(s)`, der Server
antwortete** *„Bitte eine Portionsgroesse waehlen."* — **und die
Vorschau blieb leer.**

`[cmd]` **Der Grund ist der neue ORT:** in der Tafel stand die
Portionsliste beim ersten Anstrich schon da. **Aus der ZEILE
heraus mountet das Modal sofort und laedt sie nach** —
`useState(portionen[0]…)` lief gegen eine LEERE Liste.

`[read]` **Ein `<select>` mit einem Wert, den keine Option
traegt, zeigt trotzdem die erste** — **der Schirm sah richtig
aus, der Zustand war leer.** `[read]` **Ein Foto findet das
nicht, eine Schreibprobe schon.**

**2 — die Trennlinie im Modal.**

`[cmd]` **`.v2-supp-aktion` trug `border-top` und Polster** —
richtig am Fuss einer Tafel, **im Modal erzeugte es ein leeres
Band unter der Kopfzeile.** `[read]` **Eine Trennlinie, die
nichts trennt, sieht aus wie ein fehlender Inhalt.**

### Der Schreibweg ist derselbe — gegen die Datenbank geprueft

`[cmd]` **Das Modal enthaelt KEIN `fetch`** — es rendert
`ProduktAktion` aus G-484. **Der Waechter prueft beides.**

`[cmd]` **Und der Nachweis lief gegen die DATENBANK, nicht gegen
den Statuscode** (die Lehre aus G-484):

    vorher   5 Zeilen in supplements.intake_logs (heute)
    Schirm   "Zu ,Fruehstueck' hinzugefuegt."
    nachher  6 Zeilen

`[cmd]` **A5 gemessen:** Anzahl 1 -> *„ergibt 130 kcal, 24 g
Protein"*, Anzahl 2 -> *„260 kcal, 48 g Protein"*. `[cmd]`
**`prot625` kam dazu** — die Sicht traegt die Spalte, der
Leseweg holte sie nur nicht.

### Der Waechter, und der eine gruene Schaden

`[cmd]` **`g492-aktion-als-modal.test.ts`, 15 Faelle.** `[cmd]`
**`_g492-sabotage.mjs`: 15 Schaeden plus Kontrolle — 16/16.**

`[cmd]` **Erster Lauf: 15/16.** **Ein Schaden blieb gruen**
(`substanz-add` -> `substanz-addX`).

`[read]` **Zwei Ursachen auf einmal, und keine davon war ein
blinder Waechter im ueblichen Sinn:**

`[cmd]` **Der Schaden war zu WEICH** — `substanz-add` ist ein
PRAEFIX von `substanz-addX`, die Zusicherung traf weiter.

`[cmd]` **Und die Zusicherung mass die falsche Sache** — sie
suchte NAEHE im Quelltext (`{0,600}` Zeichen), und Naehe sagt
nichts ueber Verschachtelung.

`[cmd]` **Jetzt prueft sie den PROP:** der Knopf muss im
`aktion={…}` der Leiste stehen. **Nimmt ihn jemand da heraus,
faellt sie** — egal, wo er landet.

### Ein fremder Waechter hat mich gefangen

`[cmd]` **`g453-produkttafel.test.ts` wurde rot:** ich hatte die
Quellenzeile mit `v2-dim` gesetzt. `[cmd]` **Gemessen 2,88:1,
WCAG AA verlangt 4,5:1**; `v2-muted` liegt bei 9,19:1.

`[read]` **Der Waechter hatte recht, mein Code war falsch** —
berichtigt, nicht entschaerft.

**Eine andere Zusicherung desselben Waechters musste dagegen
UMGEDREHT werden:**

`[cmd]` **Dort stand:** `assert.doesNotMatch(q, /role="tablist"/)`
— *„der Auftrag verbietet sie ausdruecklich (ein Produkt hat
keine Rechtslage)"*.

`[cmd]` **Tom hat das am 2026-09-08 umgedreht** und nennt vier
Reiter. `[read]` **Die alte Begruendung war nicht falsch, sie war
ueberholt:** G-453 kannte zwei moegliche Reiter, Tom nennt vier.

`[read]` **Nicht geloescht, sondern umgedreht** — sonst waere die
Leiste ab jetzt unbewacht.

### Was ROT bleibt und mir nicht gehoert

`[cmd]` **`pnpm gate`: einzig `[kettenlauf]` ist rot** —
`lumeos_tageskette_20260921`. `[read]` **Das liegt in
`supabase/`, und der Auftrag sagt: nichts in `supabase/`.**
**Gemeldet, nicht angefasst** — wie schon in G-491.

### Ein Hinweis fuer den naechsten Auftrag

`[cmd]` **Codex baut gerade C-529:**
`supabase/migrations/20260922065000_c529_stack_item_product_reference.sql`.

`[read]` **Das ist die Produktspalte, die `stack_items` in G-484
fehlte** — damals stand im Bericht: *„solange `stack_items` keine
Produktspalte hat, weiss der Stackeintrag nicht, WELCHES Produkt
gemeint war. Die Id steht in `notes` — das ist eine Kruecke."*

`[cmd]` **Wenn C-529 eingespielt ist, kann die Kruecke weg.**
`[read]` **Nicht jetzt** — nichts in `supabase/`, und eine
Migrationsdatei im Repo heisst nicht eingespielt.

### Die Fotos

    x-g492-a13-vorher.png      Substanz VORHER: Knopf y=1228
    x-g492-a11-vorher.png      Produkt VORHER: keine Leiste
    x-g492-a1-spalte.png       A1: Add in der 6. von 7 Spalten
    x-g492-a2-modal-pulver.png A2/A4: Modal offen, Liste bleibt
    x-g492-a3-modal-kapsel.png A3: nur Stack, mit Grund
    x-g492-a5-vorschau.png     A5: Anzahl 2 -> 260 kcal, 48 g
    x-g492-a8-bestaetigung.png A8: "Zu ,Fruehstueck' hinzugefuegt"
    x-g492-a11-ueberblick.png  A11/A15/A16: vier Reiter
    x-g492-a12-anwendung.png   A12: Aktion im 2. Reiter
    x-g492-a17-hinweise.png    A17: Satz statt Leerfeld
    x-g492-a17-etikett.png     A17: desgleichen
    x-g492-a13-nachher.png     A13: Knopf y=564, in der Leiste

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `supplements.css`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g492-a5-vorschau.png` angesehen:**

    Hinzufuegen
    ON Optimum Nutrition Gold Standard 100% Whey
    [In den Stack] [Zu einer Mahlzeit]
    MAHLZEIT HEUTE   [Fruehstueck - 07:30 v]
    PORTIONSGROESSE  [33 Gram(s) - 130 kcal v]
    ANZAHL           [2]
                     ergibt 260 kcal, 48 g Protein
                                     [Hinzufuegen]

`[read]` **Genau Toms Bild: wohin, welcher, wieviel, und die
Vorschau rechnet vor dem Eintragen.**

`[cmd]` **Die Liste: `FORM` gefuellt (Powder, Liquid), `+ Add`
in der zweithintersten Spalte, `Details` ganz rechts.**

`[cmd]` **`tafel-reiterleiste.tsx`, genutzt von
`produkt-tafel.tsx` und `substanz-tafel.tsx`.**

`[cmd]` **6 intake_logs heute** ? **der Schreibweg gegen die
Datenbank belegt, nicht gegen den Statuscode.**

`[cmd]` **Proben: web 1934/1934, coach 65/65.**

### Gemessen VOR dem Bau

> *,,Substanz-Leiste bei y=560, der Knopf bei y=1228 (668 px
darunter, ausserhalb des Schirms); Produkt-Tafel ohne Leiste,
die Aktion bei y=1625. Jetzt stehen beide Knoepfe bei y=564
und y=673."*

`[read]` **Der Vorher-Zustand laesst sich nachher nicht
rekonstruieren** ? **darum zuerst gemessen.**

### A14 war groesser als gedacht

> *,,Die Subnav war DREIMAL kopiert (substanz-tafel,
medical/wirkstoff-tafel, und fehlend in produkt-tafel). Jetzt
EINE geteilte `tafel-reiterleiste.tsx`, und die alte Kopie ist
geloescht statt als Rueckfall liegengelassen ? genau so
entstanden drei Kopien."*

`[cmd]` **Die Medical-Kopie gemeldet, nicht angefasst** ?
**anderes Modul.**

### Die FORM-Luecke war mehr als Kosmetik

> *,,Da die Formregel entscheidet, ob der Knopf Stack oder
beides anbietet, waere JEDES Pulver auf *nur Stack* gefallen."*

`[cmd]` **Serverseitige Nachlese: 2,8 ms je 500 Zeilen,
gestueckelt zu 150.** **Markiert zum Entfernen, sobald C-520
liefert.**

### Zwei eigene Annahmen berichtigt

> *,,Ich habe zuerst `supplier_products.precautions` und
`label_image_path` als C-527-Quellen dokumentiert ? beide
ERFUNDEN. C-527 ist noch ein Messpunkt ohne Spaltennamen."*

`[read]` **Er hat Spaltennamen erfunden und es selbst
gefunden** ? **die Doku nennt jetzt die Quelle, nicht eine
Spalte.**

### Ein Waechter bewusst umgedreht

> *,,`g453` verlangte, die Produkt-Tafel habe KEINE Reiter.
Toms G-492-Entscheidung kehrt das um ? ich habe die
Behauptung umgedreht statt geloescht, sonst waere die Leiste
jetzt unbewacht."*

### Eine Kleinigkeit

`[read]` **`In den Stack` und `Zu einer Mahlzeit` sehen gleich
aus** ? **welcher gewaehlt ist, zeigt nur das Formular
darunter, nicht der Knopf.**

**Abgenommen.**
