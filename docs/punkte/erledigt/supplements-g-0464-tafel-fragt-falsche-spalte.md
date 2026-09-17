---
nr: G-464
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-453
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: dba58ce5
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/produkt-etikett.ts
zahlen:
  gemessen: 2026-09-08
---

# G-464 - die Tafel fragt die falsche Spalte

## Toms Befund

Tom, 2026-09-08, am Schirm:

> Calcium 1440 mg  (ohne "auswertbar")
> Vitamin C 65 mg  (ohne)
> Iron 5.3 mg      (ohne)
> Zinc 18 mg       (ohne)

> Thiamin 5.1 mg   auswertbar
> Biotin 300 mcg   auswertbar

`[read]` **Das ist widerspruechlich, und die Ursache liegt in
der Anzeige.**

## Gemessen

    Zutat        supplement_id   nutrient_code
    Biotin       ja              NEIN     -> auswertbar
    Thiamin      ja              NEIN     -> auswertbar
    Calcium      NEIN            CA       -> NICHT
    Iron         NEIN            FE       -> NICHT
    Zinc         NEIN            ZN       -> NICHT
    Vitamin C    NEIN            VITC     -> NICHT

`[read]` **Die Marke *auswertbar* haengt an `supplement_id`
allein.**

`[cmd]` **`Calcium` hat ein gueltiges Naehrstoff-Mapping (`CA`)
und wird trotzdem als *nicht im Katalog* gezeigt.**

## Was zu bauen ist

`[read]` **Die Marke haengt an BEIDEM:**

    supplement_id   -> als Wirkstoff auswertbar
    nutrient_code   -> als Naehrwert auswertbar
    beides null     -> Kandidat

`[cmd]` **C-505 hat die Klassifikation schon gebaut** ?
**Naehrwert, Wirkstoff, Hilfsstoff, Kandidat.**

`[read]` **MISS, ob die Tafel sie liest** ? **oder ob sie
`supplement_id` direkt abfragt.**

## Und die Gruppierung stimmt auch nicht

`[cmd]` **In Toms Beispiel stehen `Vitamin A`, `Calcium`,
`Iron` unter WIRKSTOFFE.**

`[read]` **Das sind Naehrwerte** ? **sie gehoeren in die erste
Gruppe, zu `Total Fat` und `Protein`.**

`[cmd]` **Die Tafel hat *Naehrwerte 12* und *Wirkstoffe 62*** ?
**miss, woran die Gruppierung haengt.**

`[read]` **Vermutlich an `ingredient_category`** ? `vitamin`,
`mineral` **landen bei den Wirkstoffen, obwohl sie
Naehrwerte sind.**

## Und die doppelten Zeilen

`[cmd]` **Toms Beispiel zeigt JEDEN Wert zweimal:**
`Total Fat 19 g` **und** `Total Fat 4 g`, `Vitamin A 6500 IU`
**und** `5000 IU`.

`[read]` **Das ist das Etikett mit ZWEI Portionsgroessen** ?
**C-485 hat es gemessen, `product_contents` hat keine
Portionsspalte.**

`[read]` **MELDEN, nicht bauen** ? **das ist ein
Datenbankpunkt.**

## Abnahmebedingungen

    A1  die Marke haengt an supplement_id ODER
        nutrient_code. Foto.
    A2  Toms Beispielprodukt: wie viele der 62 sind
        nachher markiert? Zahl vorher/nachher.
    A3  Naehrwerte stehen bei den Naehrwerten,
        nicht bei den Wirkstoffen. Foto.
    A4  die doppelten Zeilen: gemeldet, mit Zahl.
    A5  Gegenprobe: eine Zeile ohne beides -> Kandidat.
    A6  vier Module unveraendert.
    A7  apps/web 1793 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Die Mappings NICHT erweitern** ? **das ist C-510 bei
Codex.**

**Nichts in `supabase/`.**

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[read]` **Toms Befund war richtig, und die Ursache lag genau dort,
wo er sie vermutet hat** ? **die Tafel las `product_contents` und
sah damit weder `nutrient_code` noch die Einstufung aus C-505.**

### Was gemessen wurde, bevor gebaut wurde

`[cmd]` **Die Tafel liest C-505 NICHT** ? sie fragte
`from('product_contents')` und hatte damit nur `supplement_id` zur
Hand:

    produkte-read.ts:603   bekannt = supplement_id !== null
                                  || supplement_name_en !== null
    produkt-etikett.ts:382 ziel = buendelFuer(ingredient_category)

`[read]` **Beide Fehler haben dieselbe Wurzel:** **die Rohtabelle
traegt die Antwort nicht.** `[cmd]` **`supplier_product_content_
catalog` (C-505) traegt sie** ? `nutrient_code` **und**
`content_class` ? **und `authenticated` hat SELECT darauf**
(gemessen 2026-09-17).

### A1 ? die Marke haengt an BEIDEM

`[cmd]` **Gemessen an `Serious Mass Vanilla`
(`0351cf6e`, 85 Zeilen):**

    Zutat        supplement_id  nutrient_code  Klasse
    Biotin       ja             ?              wirkstoff
    Calcium      ?              CA             naehrwert
    Iron         ?              FE             naehrwert
    Zinc         ?              ZN             naehrwert
    Vitamin C    ?              VITC           naehrwert
    Vitamin A    ja             VITA           naehrwert

`[read]` **Biotin ist der Beleg, dass es wirklich ZWEI Wege sind**
? es hat eine `supplement_id` und KEIN Mapping, **und bleibt
trotzdem auswertbar.**

**Foto:** `backup/x-g464-a1-nachher.png`.

### A2 ? wie viele sind nachher markiert

`[cmd]` **Gemessen ueber den Leseweg, je Produkt:**

    0351cf6e (85 Zeilen)   vorher 22   nachher 62
    e83c7d31 (46 Zeilen)   vorher 24   nachher 32

`[cmd]` **Und die Gegenrechnung geht auf:**
`62 = 52 naehrwert + 10 wirkstoff`, `32 = 27 + 5`.

`[read]` **Die uebrigen sind keine Luecke, sondern eine Aussage:**
23 Zeilen (16 Kandidaten + 7 Hilfsstoffe) **tragen weder
`supplement_id` noch `nutrient_code`.**

### A3 ? die Gruppierung haengt an der Einstufung

`[cmd]` **Sie hing an `ingredient_category`, und die Zuordnung
schickte `vitamin` und `mineral` zu den Wirkstoffen**
(`produkt-etikett.ts`, `buendelFuer`).

`[cmd]` **Gemessen: 40 der 85 Zeilen tragen `vitamin` oder
`mineral` und sind nach C-505 `naehrwert`** ? **sie standen alle in
der falschen Gruppe.**

`[read]` **Die Kategorie sagt, WORAUS die Zutat ist; die Einstufung
sagt, WIE LumeOS sie auswertet.** **Die Tafel gruppiert nach der
zweiten Frage.**

`[cmd]` **Auf dem Schirm, `e83c7d31`:**

    NAEHRWERTE  29   Total Fat, Protein, Vitamin A,
                     Vitamin C, Calcium, Iron, Zinc
    WIRKSTOFFE  10   Biotin, Creatine, L-Glutamine
    HILFSSTOFFE  7   Maltodextrin, Lecithin, Sucralose

**Foto:** `backup/x-g464-a3-gruppen.png` ? **und die Pille sagt
*,,32 von 46 Zutaten kennt LumeOS"*.**

`[read]` **Die Mischungsregel aus G-453 bleibt unangetastet** ?
**ein Kind folgt seinem Kopf, nicht seiner Einstufung**, sonst
zerrisse die Einstufung genau die Mischungen, die G-453
zusammengehalten hat.

### A4 ? die doppelten Zeilen (gemeldet, nicht gebaut)

`[cmd]` **Am Beispielprodukt:** 85 Zeilen, **46 verschiedene Namen,
78 Zeilen in Dubletten** ? **jeder Wert steht zweimal.**

`[cmd]` **Im ganzen Bestand:**

    Produkte mit Dubletten    16.228 von 214.778   7,6 %
    Zeilen in Dubletten      207.689 von 3.000.982  6,9 %

`[cmd]` **Und `product_contents` hat KEINE Portionsspalte** ?
gemessen, alle 16 Spalten aufgelistet: `amount_per_serving`,
`unit`, `conversion_factor`, **aber nichts, was zwei Portionen
unterscheidet.** `[read]` **C-485 hatte recht.**

`[read]` **Das ist ein Datenbankpunkt** ? **die Tafel koennte
Dubletten zusammenfassen, aber dann verschwaende sie die
Unterscheidung zwischen ,,1 Scoop" und ,,2 Scoops", die auf dem
Etikett steht.** **Ohne Portionsspalte ist jede Zusammenfassung
geraten.**

### A5 ? die Gegenprobe: eine Zeile ohne beides

`[cmd]` **In der Datenbank, je Klasse gezaehlt:**

    Klasse       weder supplement_id noch nutrient_code
    naehrwert     0 von 52
    wirkstoff     0 von 10
    kandidat     16 von 16
    hilfsstoff    7 von  7

`[read]` **Beide Richtungen belegt:** **jede markierte Zeile hat
mindestens eine der beiden Spalten, jede unmarkierte hat keine.**

`[cmd]` **Auf dem Schirm sind es `Cholesterol`, `Added Sugars`,
`Pantothenic Acid`, `Selenium`, `Chromium`** ? **ohne Marke, und
das ist richtig.**

### A6 ? die vier Module unveraendert

`[cmd]` **Gemessen mit und ohne die Aenderung** (`git stash`,
derselbe Lauf):

    /v2/nutrition     193.151 Zeichen / 13 Kacheln   gleich
    /v2/training      104.993 / 11                   gleich
    /v2/medical       511.300 / 11                   gleich
    /v2/goals          50.402 / 18                   gleich
    /v2/supplements   472.752 / 18                   gleich

`[cmd]` **Und die Aenderung ist eingegrenzt:** ausser
`produkte-read.ts` und `produkt-etikett.ts` liest niemand
`ladeProdukt` oder `InhaltsZeile` ? gemessen ueber beide Apps.

### A7 ? die Waechter

    apps/web     1803 Proben   1803 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0
    next lint web  keine Fehler

**Neu: 10 Proben in `g464-tafel-spalte.test.ts`.**

`[cmd]` **JEDE kann rot werden ? gemessen, nicht behauptet:**

    A1/A4  Gruppe wieder aus der Kategorie      ROT
    A1b    Naehrwert zu den Wirkstoffen         ROT
    A2     Rueckfall faellt weg                 ROT
    A3     Hilfsstoff nach Kategorie            ROT
    A5     Mischung zerrissen                   ROT
    A6     Marke wieder nur supplement_id       ROT
    A7     Rohtabelle statt Sicht               ROT
    A8     Einrueckung faellt weg               ROT
    A9     unbekannte Klasse durchgereicht      ROT

`[cmd]` **Und die KONTROLLE:** ein Kommentar mit `dsld_name`,
`nutrient_code`, `blend_id` und `product_contents` als blossen
Woertern ? **bleibt GRUEN.**

#### Zwei der Proben waren blind ? die Sabotage hat es gezeigt

`[cmd]` **A5 und A9 blieben gruen, obwohl die Sabotage ankam:**

`[read]` **A5:** der Mischungskopf trug die Kategorie `blend` ?
**damit landete er auch OHNE die Mischungsregel bei den
Mischungen**, ueber `buendelFuer('blend')`. **Die Probe konnte gar
nicht unterscheiden.** `[cmd]` **Jetzt traegt der Kopf `amino
acid`** ? **so entscheidet allein `istMischung`.**

`[read]` **A9:** die Probe suchte die vier Klassennamen im
Quelltext ? **und ein `as`-Cast, der jeden Wert durchreicht, laesst
die Namen stehen.** `[cmd]` **Jetzt wird die Funktion GERUFEN**
(`pruefeKlasse('mikronaehrstoff') === null`).

`[read]` **Ohne die Sabotageprobe waeren beide als ,,gruen"
durchgegangen** ? **das ist der Grund, warum sie zu jedem Auftrag
gehoert.**

### Ein Messfehler, der nach einem Widerspruch aussah

`[cmd]` **Zwischendurch meldete der Schirm 57 markierte Zeilen,
waehrend die Route 62 lieferte** ? **beide Zahlen stimmten, fuer
VERSCHIEDENE Produkte.**

`[cmd]` **Drei Ursachen, alle in der Messung:**

    1  `fill()` allein filterte die Liste NICHT
       -> geklickt wurde in der alphabetischen Liste
    2  zwei Produkte heissen „Serious Mass Vanilla"
       (85 und 46 Zeilen), ein drittes („QUICKMASS
       Vanilla") hat ebenfalls 85
    3  beim Durchklicken blieben Tafeln offen stehen
       -> die Messung summierte zwei Produkte (95 Zeilen)

`[read]` **Der Code war nie falsch** ? **die Grundgesamtheit war
es.** `[cmd]` **Nach der Berichtigung stimmen Schirm und Leseweg
auf die Zeile ueberein** (32 von 46, Klassen 27+5).

### Was gebaut wurde

    NEU        app/v2/supplements/__tests__/g464-tafel-spalte.test.ts
               tools/_g464-satz.mjs       der Leseweg je ID
               tools/_g464-tafel.mjs      der Schirm, eine Tafel
               tools/_g464-sabotage.mjs   9 + 1 Kontrolle

    GEAENDERT  lib/supplements/produkte-read.ts
                 liest C-505 statt product_contents,
                 Marke an beiden Spalten, content_class,
                 pruefeKlasse, zeilenVerbinden
               lib/supplements/produkt-etikett.ts
                 buendelFuerZeile ? die Einstufung fuehrt
               __tests__/g452-produkte-reiter.test.ts
               __tests__/g453-produkttafel.test.ts
                 je ein Vorgabewert fuer das neue Feld

`[cmd]` **Nichts in `supabase/`, keine Mappings erweitert, nichts
committet.**

`[cmd]` **`backup/c276/supplement-kern-dubletten.json` hatte ein
Waechterlauf neu geschrieben** ? **zurueckgenommen.**

### Was offen bleibt

`[cmd]` **Die doppelten Zeilen (A4)** ? **207.689 Zeilen ueber
16.228 Produkte, und keine Portionsspalte.** `[read]` **Ein
Datenbankpunkt fuer Codex:** ohne eine Spalte, die die Portion
benennt, **kann die Tafel nicht entscheiden, ob zwei Zeilen zwei
Portionen oder ein Fehler sind.**

`[cmd]` **`docs/punkte/laufend_codex/supplements-c-0510-...md` ist
veraendert** ? **nicht von mir** (17:34, Codex arbeitet an C-510).

`[read]` **`kandidat` bekommt bewusst KEIN eigenes Buendel** ? der
Auftrag nennt vier Ueberschriften, **eine fuenfte waere eine
Entscheidung, die Tom nicht getroffen hat.** **Kandidaten stehen
weiter nach Kategorie einsortiert, ohne Marke.**

`[read]` **Ein Neustart ist NICHT noetig** ? nur `apps/web/src`
geaendert, das laedt heiss nach.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g464-a3-gruppen.png`, Serious Mass Vanilla:**

    NAEHRWERTE 29   Calories, Total Fat, Vitamin A, C, D, E
                    alle mit "auswertbar"
    WIRKSTOFFE 10   Biotin, Creatine Monohydrate, L-Glutamine
    HILFSSTOFFE 7   Maltodextrin, Lecithin, Sucralose
                    "ohne Mengenangabe"
    32 von 46 Zutaten kennt LumeOS

`[cmd]` **Proben: web 1803/1803, coach 65/65.**

`[read]` **`Vitamin A` und `Vitamin C` stehen jetzt bei den
NAEHRWERTEN, nicht mehr bei den Wirkstoffen.**

### Drei Ursachen, meine Diagnose war die kleinste

**1** ? **Die Marke, wie ich sie gemessen hatte.**

**2** ? `[cmd]` **`ingredient_category` ist ein DSLD-Feld** ?
`vitamin`, `mineral` **beschreiben den STOFF, nicht die Rolle.**

> *,,Die Nahrungsmittelrichtlinie kennt Vitamine als
Naehrwerte."*

**3** ? **Der, den ich nicht gesehen habe:**

> *,,Der ENGERE Filter kam zuerst. Eine Zeile galt als Wirkstoff,
wenn sie eine `supplement_id` hatte ? auch Calories. Die
Naehrwertgruppe sah nur, was uebrig blieb."*

`[read]` **Ich hatte Punkt 3 fuer Punkt 1 gehalten** ? **die
Reihenfolge der Pruefung, nicht die falsche Spalte.**

`[cmd]` **`Calories` hat eine `supplement_id` und wurde
deshalb zum Wirkstoff.**

### Und er hat den Vorher-Zustand belegt

> *,,Die Zahlen aus deinem Auftrag ? Naehrwerte 12,
Wirkstoffe 62 ? habe ich nicht uebernommen: ich habe sie
aus dem alten Code nachgerechnet."*

`[read]` **Meine Zahlen kamen aus Toms Bildschirmtext** ?
**er hat sie gegen den Code geprueft.**

### Die doppelten Zeilen, gemessen statt vermutet

`[cmd]` **`amount_qualifier` traegt `per_serving` und
`per_container`** ? **die Portionsspalte gibt es doch.**

> *,,Mein Auftrag sagte, sie fehle. Der Wert ist da ? und der
ZWEITE Wert ist nicht *die zweite Portionsgroesse*, sondern das
was IN DER PACKUNG steckt."*

`[cmd]` **`Total Fat 19 g` je Portion, `4 g` je Behaelter** ?
**oder umgekehrt.**

`[read]` **C-485 hat gemeldet, die Spalte fehle** ? **sie
fehlt nicht, sie wird nicht gelesen.**

`[cmd]` **Als G-466.**

### Und die Gegenprobe, die nichts gemessen haette

> *,,Die Sabotage, die keine ist: `ingredient_category` in
`produkt-etikett.ts` umbenennen ? bleibt gruen, weil die Datei
das Feld nicht mehr benutzt. Ich lasse sie als Kontrollprobe
drin, mit dem Grund im Code."*

**Abgenommen.**


