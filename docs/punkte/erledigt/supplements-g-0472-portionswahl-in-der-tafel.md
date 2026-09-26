---
nr: G-472
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-512
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 9ec68b84
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/produkt-etikett.ts
zahlen:
  gemessen: 2026-09-08
  produkte: 3273
---

# G-472 - die Tafel zeigt die Portionswahl nicht

## Befund

`[cmd]` **C-512 hat gemessen: 3.273 Produkte haben MEHRERE
DSLD-Portionsgroessen.**

`[cmd]` **Die Standardsicht zeigt dafuer
`luecken.multiple_serving_sizes`** ? **keine Summe mehr.**

`[cmd]` **Und `supplier_product_nutrient_serving_options`
liefert die Werte je Portion.**

`[read]` **Die Tafel liest keine davon.**

## Was zu bauen ist

`[cmd]` **Beleg: Mary Ruths Vegan Liquid Iron (DSLD 327737):**

     5 mL   10 kcal,  6 mg Eisen
    10 mL   15 kcal, 12 mg
    15 mL   20 kcal, 18 mg

`[read]` **Der Nutzer waehlt die Portion, und die Werte
folgen.**

`[read]` **Bei einem Produkt mit EINER Portion aendert sich
nichts.**

## Abnahmebedingungen

    A1  ein Produkt mit mehreren Portionen: die Wahl
        steht. Foto.
    A2  die Werte folgen der Wahl. Zahl je Portion.
    A3  ein Produkt mit EINER Portion: unveraendert.
        Foto.
    A4  Gegenprobe: ein Produkt ohne Portionsangabe.
    A5  vier Module unveraendert.
    A6  apps/web 1830 oder mehr, apps/coach 65.

## Ist er durch G-492 ueberholt? 2026-09-08

`[cmd]` **G-492 hat ein Modal mit Portionswahl gebaut:**

    PORTIONSGROESSE  [33 Gram(s) - 130 kcal v]
    ANZAHL           [2]
                     ergibt 260 kcal, 48 g Protein

`[read]` **Das ist die Wahl beim HINZUFUEGEN.** **Dieser
Punkt meint die TAFEL: was steht da, bevor man etwas tut?**

`[cmd]` **MISS das ZUERST** ? **wenn das Modal reicht, ist
der Punkt erledigt und wird geschlossen, nicht gebaut.**

`[cmd]` **Beleg aus C-512: Mary Ruths Vegan Liquid Iron
(DSLD 327737) traegt 5/10/15 mL mit 6/12/18 mg Eisen** ?
**pruefe an genau dem, was die Tafel heute zeigt.**


## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Proben: web 2006, coach 65.**

    5 mL    1 Calories-Zeile   10 kcal,  6 mg Eisen
    10 mL   1                  15,      12
    15 mL   1                  20,      18

`[read]` **Vorher vier unbeschriftete Zeilen, jetzt eine.**

### Die Quelle war schon da

> *,,`product_contents.source_serving_size` traegt die Portion
je Zeile. Die SICHT fuehrt die Spalte nicht, die TABELLE schon ?
und die zweite Abfrage lief ohnehin. Ein Wort mehr im `select`,
kein Schemaeingriff."*

`[read]` **Der billigste Weg war der richtige** ? **und er hat
ihn gesucht, statt eine Spalte zu bestellen.**

### Ein Befund beim Bauen, ehrlich abgegrenzt

> *,,5 mL trug Calories 10, Carbs 2 und Iron 6 ZWEIMAL ?
verschiedene id, gleicher Wert, weil das Etikett 5 mL fuer zwei
ALTERSGRUPPEN fuehrt."*

`[cmd]` **In der Anzeige zusammengefasst, nur wo wirklich alles
gleich ist. Die Daten nicht angefasst** ? **das gehoert zu
C-549.**

### Drei Probenfehler, und einer ist neu

> *,,Ein NUL-Byte in den Quelltext geschrieben ? `file` meldete
`data`, der Dev-Server lieferte nichts mehr aus."*

`[read]` **Und die Probe meldete das als *Produkt
unerreichbar*, nicht als kaputte Datei** ? **ein Schreibfehler,
der wie ein Befund aussieht.**

### Und ein Waechter hat ihn gefangen

> *,,Mein Hinweissatz stand in `v2-dim` (2,88:1) ? obwohl der
Dateikopf genau das verbietet."*

`[cmd]` **Auf `v2-muted` geaendert (9,19:1)** ? **G-479 und
G-498 wirken.**

### Der Gate-Bruch war meiner

`[cmd]` **`docs/ssot/40-der-koerper-als-grundlage.md` fehlte in
`00-INDEX.md`** ? **ich habe das Konzept verschoben und die
Indexzeile vergessen. Nachgetragen.**

**Abgenommen.**



## Bericht

**Claude Code, 2026-09-25.** `[read]` **Der Auftrag sagte: erst
messen, ob er noch gilt.** **Er gilt nicht mehr so ? aber er
ist auch nicht einfach erledigt.**

### Der Befund von damals ist ueberholt

`[cmd]` **Der Punkt sagt:** *,,Die Tafel liest keine davon."*

`[cmd]` **Gemessen am 2026-09-25, Mary Ruths Vegan Liquid Iron
Berry (DSLD 327737), `test-user@lumeos.local`:**

    Liste, Spalte PORTION
      5 mL [1 tsp, 4-13 years], 10 mL [2 tsp, 14-18 years],
      15 mL [1 Tbsp, 19-50 years], 5 mL [1 tsp, 51+ years]

    Detailtafel, Kachel PORTION
      derselbe Text

`[read]` **Die Tafel liest sie also** ? **und zwar bevor man
etwas tut**, genau wie der Punkt es verlangt.

### Und das Modal daneben

`[cmd]` **G-492s Wahl beim Hinzufuegen steht ebenfalls** ?
`produkt-aktion.tsx` liest `portionen` aus
`supplier_product_nutrient_serving_options`.

`[read]` **Damit ist die urspruengliche Frage beantwortet:**
**die Portionen sind an BEIDEN Stellen sichtbar.**

### ABER: ein neuer, genauerer Befund

`[cmd]` **In der Detailtafel, unter NAEHRWERTE:**

    Calories   10 Calorie(s)
    Calories   15 Calorie(s)
    Calories   20 Calorie(s)
    Calories   10 Calorie(s)

    Total Carbohydrates   2 Gram(s)
    Total Carbohydrates   3 Gram(s)

`[cmd]` **Gemessen gegen die Datenbank ? die Zahlen stimmen
exakt:**

    5 mL    10 kcal   2 g   6 mg Eisen
    10 mL   15 kcal   3 g  12 mg
    15 mL   20 kcal   5 g  18 mg

`[read]` **Es ist JE PORTION eine Zeile ? und keine sagt,
welche.** `[read]` **Vier Zeilen *,,Calories"* untereinander
lesen sich wie ein Fehler in den Daten**, und sie sind das
Gegenteil: sie sind vollstaendig, nur unbeschriftet.

`[read]` **Das ist schlimmer als die urspruengliche Luecke.**
Eine fehlende Angabe sieht man; **vier widerspruechliche
Zahlen ohne Bezug laden zum Fehlschluss ein.**

### Was ich NICHT getan habe

`[read]` **Nicht gebaut** ? **welche Form die Loesung hat, ist
eine Entscheidung:**

    a  je Naehrwertzeile die Portion dahinter
       („10 Calorie(s) · 5 mL")
    b  eine Portionswahl ueber der Liste, die Werte
       folgen ihr (wie im Modal)
    c  nur die Standardportion zeigen, die uebrigen
       hinter einem Aufklapper

`[read]` **b waere das, was der Punkt urspruenglich wollte** ?
**a ist die kleinste Aenderung und macht die Zahlen sofort
lesbar.**

### Zwei Zahlen, die abweichen

`[cmd]` **C-512 nennt 3.273 Produkte mit mehreren
Portionsgroessen.** `[cmd]` **Ich messe 2.760** ?
`supplier_product_nutrient_serving_options`, gruppiert nach
`product_id` mit `count(*) > 1`.

`[read]` **Die Differenz ist nicht erklaert** ? moeglich ist,
dass C-512 die Portionsangabe im Text zaehlt und ich die
hinterlegten Werte. **Gemeldet, nicht geraten.**

### Ein Messfehler, der wie ein Befund aussah

`[cmd]` **Auf `dev@lumeos.app` fand ich das Produkt NICHT** ?
null Treffer bei jedem Suchbegriff. `[read]` **Ich war nahe
daran, die Produktsuche als kaputt zu melden.**

`[cmd]` **Der Grund: das Konto hat eine Markenvorliebe**
(`preferred_brands: ON Optimum Nutrition …`), **und das Produkt
ist von *,,Mary Ruth's"*.** `[read]` **Der Treffer fehlte
nicht, er war gefiltert** ? und das ist richtiges Verhalten.

`[cmd]` **Dazu ein zweiter:** mein erster Locator traf die
GLOBALE Navigationssuche (*,,Search or jump to…"*) statt der
Produktsuche (`aria-label="Produkt suchen"`). **Drei Textfelder
auf einer Seite ? der Platzhalter ist kein Anker.**

### Empfehlung

`[read]` **Den Punkt NICHT schliessen, sondern umschreiben:**
der Titel *,,die Tafel zeigt die Portionswahl nicht"* stimmt
nicht mehr. **Die offene Frage lautet jetzt:** *welcher Portion
gehoert eine Naehrwertzeile?*

`[read]` **Wenn Tom a, b oder c waehlt, ist es eine halbe
Stunde Arbeit** ? die Daten liegen vollstaendig vor.

### Werkzeug

    tools/_g472-tafel.mjs   Tafel und Modal, je Foto

## UMGESCHRIEBEN und entschieden, 2026-09-08

### Sein Befund

> *,,Die Tafel ZEIGT die Portionen ? *5 mL [1 tsp, 4-13
years], 10 mL, 15 mL* ? in Liste und Detail, bevor man etwas
tut. Der Befund ist ueberholt."*

> *,,Aber darunter steht ein SCHAERFERER: die Naehrwertliste
zeigt *Calories 10 / 15 / 20 / 10* als VIER unbeschriftete
Zeilen, je eine pro Portion. Gegen die Datenbank geprueft
stimmen sie exakt."*

> *,,Vier widerspruechliche Zahlen ohne Bezug laden zum
FEHLSCHLUSS ein ? das ist schlimmer als die urspruengliche
Luecke."*

`[read]` **Er hat recht: eine Luecke sieht man, einen
Fehlschluss nicht.**

### Die Entscheidung: eine Wahl ueber der Liste

`[read]` **Der Nutzer waehlt die Portion, die Liste zeigt
GENAU DIESE.**

**Warum nicht *Portion je Zeile*:** `[read]` **die Liste hat
138 moegliche Naehrstoffe ? mal vier Portionen sind das 552
Zeilen fuer ein Praeparat.**

**Warum nicht *nur die Standardportion*:** `[read]` **dann
verschwinden drei von vier, und der Nutzer weiss nicht, dass es
sie gibt.**

`[cmd]` **Und es passt zu G-492: das Modal waehlt bereits eine
Portion, bevor es rechnet.** **Dieselbe Geste an beiden
Stellen.**

`[read]` **Die Wahl nennt, wie viele es gibt** ? **so ist
nichts versteckt.**

## Neue Abnahmebedingungen

    N1  eine Portionswahl ueber der Naehrwertliste.
        Foto.
    N2  die Liste zeigt GENAU eine Portion, keine
        vier Zeilen. Foto mit Mary Ruths (DSLD 327737).
    N3  gegen die Datenbank belegt: 5 mL -> 10 kcal /
        6 mg, 10 mL -> 15 / 12, 15 mL -> 20 / 18.
    N4  ein Produkt mit EINER Portion zeigt keine Wahl.
        Foto.
    N5  dieselbe Geste wie im G-492-Modal. Belegt.
    N6  apps/web 2006 oder mehr, apps/coach 65.


## Bericht zur Nacharbeit

**Claude Code, 2026-09-26.** `[cmd]` **15 Proben gruen,
Austritt 0** ? `node tools/_g472-portionswahl.mjs`.

### Woher die Portion kommt

`[cmd]` **`product_contents.source_serving_size`** ? **die
Zeile traegt ihre Portion selbst.** **Gemessen an Mary Ruths:**

    10 mL     3 Zeilen
    15 mL     3
     5 mL     6      <- die Portion steht ZWEIMAL
    NULL      8      <- Hilfsstoffe, gelten fuer jede

`[read]` **Kein Schemaeingriff noetig** ? die Sicht
`supplier_product_content_catalog` fuehrt die Spalte nicht, die
TABELLE schon, **und die zweite Abfrage lief ohnehin.** **Ein
Wort mehr im `select`.**

`[read]` **`null` heisst: gilt fuer JEDE Portion** ? so tragen
es Wasser und Glycerin. **Sie bleiben in jeder Auswahl
stehen.**

### N1 - die Wahl steht ueber der Liste

    PORTIONSGRÖSSE  [5 mL · 10 kcal v]
                    3 Portionsgrößen auf dem Etikett ·
                    die Liste zeigt die gewählte

`[read]` **Der Satz daneben nennt die Zahl** ? **so ist nichts
versteckt**, auch wenn nur eine Portion zu sehen ist.

**Bild:** `tools/_g472-n1-wahl.png`

### N2/N3 - eine Portion, und die Werte stimmen

`[cmd]` **Je Portion umgeschaltet, gegen `psql` geprueft:**

    Portion   Calories-Zeilen   kcal      Eisen
     5 mL           1           10 = 10   6 = 6
    10 mL           1           15 = 15  12 = 12
    15 mL           1           20 = 20  18 = 18

`[read]` **Vorher standen dort vier Calories-Zeilen** ?
**jetzt eine.** `[read]` **Der SOLL-Wert kommt aus der
Datenbank, nicht aus dem Auftragstext** ? sonst koennte die
Probe nicht rot werden.

**Bild:** `tools/_g472-n2-eine-portion.png`

### N4 - eine Portion, keine Wahl

`[cmd]` **`OptiFlex +`** (ueber `psql` gesucht: genau eine
`source_serving_size`): **die Wahl erscheint nicht.**

`[read]` **Eine Bedienung ohne Wirkung waere schlimmer als
keine.**

**Bild:** `tools/_g472-n4-eine-portion.png`

### N5 - dieselbe Geste wie im Modal, belegt

`[cmd]` **Sechs Merkmale, beide Stellen verglichen:**

    <label>-Rahmen          Modal JA   Tafel JA
    v2-eyebrow „Portionsgröße"    JA         JA
    <select className="v2-feld"   JA         JA
    aria-label                    JA         JA
    data-probe                    JA         JA
    Option nennt die kcal         JA         JA

### N6

`[cmd]` **`apps/web` 2.006, `apps/coach` 65, lint/typecheck/
build gruen.**

`[cmd]` **Das Gate bricht davor ab** ?
`[nummern] ssot-ohne-index: docs/ssot/40-der-koerper-als-
grundlage.md steht nicht in 00-INDEX.md`. **Committet in
`d235106e` (C-544/C-546), nicht aus dieser Arbeit.**

### Ein Befund beim Bauen: dieselbe Zeile zweimal

`[cmd]` **`5 mL` trug *Calories 10*, *Total Carbohydrates 2*
und *Iron 6* je ZWEIMAL** ? verschiedene `id`, verschiedene
`reihenfolge`, **gleicher Wert.**

`[cmd]` **Der Grund steht im Etikett:** es fuehrt `5 mL`
zweimal auf ? fuer *4-13 years* und fuer *51+ years*.

`[read]` **Nach dem Filtern blieben zwei identische Zeilen
stehen** ? **genau die Doppelung, die dieser Punkt beseitigen
soll, nur eine Ebene tiefer.** **In der Anzeige
zusammengefasst**, und zwar nur, was WIRKLICH gleich ist
(Name, Menge, Einheit, Mischung, Portion).

`[read]` **Die Daten bleiben unberuehrt** ? das ist eine Frage
an `supabase/`, und dort laeuft mit C-549 schon eine verwandte
Zaehlung.

### Drei Fehler in meiner eigenen Probe

`[cmd]` **1 ? zu frueh gezaehlt.** Die Probe suchte die Wahl,
bevor die Tafel sie gerendert hatte: **0 gemeldet, waehrend
der Filter nachweislich wirkte.** `[read]` **Erst warten, dann
zaehlen.**

`[cmd]` **2 ? nach einer Codeaenderung zu kurz gewartet.** Der
Entwicklungsserver uebersetzt die Route neu (3-10 s); die
Probe meldete *,,das Produkt ist nicht erreichbar"*, obwohl
die Seite Sekunden spaeter 200 Zeilen zeigte. **Dieselbe
Klasse wie bei `hrzones` in G-25.**

`[cmd]` **3 ? ein NUL-Byte in die Datei geschrieben.** Mein
Trennzeichen `'\0'` landete als echtes Byte im Quelltext;
`file` meldete `data` statt `JavaScript source`, und der
Entwicklungsserver lieferte die Seite nicht mehr aus.
**Ersetzt durch `'\u0001'`.**

### Und ein Waechter hat mich gefangen

`[cmd]` **`A3: die Tafel benutzt kein `v2-dim` fuer Text, der
gelesen werden soll`** ? mein Hinweissatz stand in `v2-dim`
(**2,88:1**, WCAG AA verlangt 4,5:1). `[read]` **Der
Dateikopf sagt es sogar ausdruecklich**, und ich habe es
trotzdem getan. **Auf `v2-muted` (9,19:1) geaendert.**

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`.

### Werkzeug

    tools/_g472-portionswahl.mjs   N1-N4, 15 Proben,
                                   SOLL aus psql, Austritt 0/1
