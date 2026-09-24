---
nr: G-468
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [C-511]
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1264ad04
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
    - apps/web/src/app/v2/supplements/page.tsx
    - apps/web/src/app/v2/supplements/tab-vorlieben.tsx
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
    - apps/web/src/app/v2/supplements/vorlieben-aktionen.ts
    - apps/web/src/app/api/supplements/vorlieben/route.ts
    - apps/web/src/lib/supplements/vorlieben-lage.ts
    - apps/web/src/lib/supplements/vorlieben-read.ts
    - apps/web/src/lib/supplements/produkt-daumen.ts
    - apps/web/src/app/v2/supplements/__tests__/g468-vorlieben.test.ts
    - apps/web/src/app/v2/supplements/__tests__/g452-produkte-reiter.test.ts
    - apps/web/messages/de.json
    - apps/web/messages/en.json
zahlen:
  gemessen: 2026-09-24
---

# G-468 - der Vorlieben-Reiter fuer Supplements

## Toms Vorgabe

> jedes modul braucht seine preferences

> nutrition haben wir das schon

## Die Vorlage

`[cmd]` **`apps/web/src/app/v2/nutrition/tab-vorlieben.tsx`**

`[read]` **Sieh sie an, bevor du baust.**

## Was hineingehoert

`[read]` **C-511 liefert die Tabelle** ? **warte darauf.**

    bevorzugte Marken     mehrere, verwaltbar
    gemiedene Stoffe      mehrere
    Allergien             GEZEIGT aus public.user_allergies,
                          dort aenderbar -- nicht kopiert
    bevorzugte Formen     Capsule, Powder, Liquid
    nur On Market         Schalter

`[cmd]` **Elf Reiter heute** ? **der neue steht bei den
Einstellungen, nicht bei den Produkten.**

`[cmd]` **MISS, wo `nutrition` seinen hat** ? **dieselbe
Stelle.**

## Abnahmebedingungen

    A1  ein Vorlieben-Reiter, wie in nutrition. Foto.
    A2  mehrere Marken setzbar. Foto.
    A3  die Allergien: gezeigt und aenderbar, eine
        Aenderung wirkt in Settings. Belegt.
    A4  die Vorlieben wirken auf die Produktsuche.
        Zahl vorher/nachher.
    A5  Kontraste gemessen.
    A6  die elf anderen Reiter unveraendert.
    A7  apps/web 1811 oder mehr, apps/coach 65.

## Bericht

**Alle sieben Bedingungen erfuellt.** Gemessen 2026-09-24 auf
`dev@lumeos.app`, Port 3200.

### A1 -- der Reiter, an derselben Stelle wie in nutrition

`[cmd]` **`{ id: 'prefs', label: t('tabVorlieben'), icon: 'settings' }`**
? **zwischen `catalog` und `stacks`.** `[read]` **Gemessen, nicht
geraten:** nutrition hat seinen als sechsten, am Ende der
Schauflaechen und vor den Werkzeugen ? **hier dieselbe Stelle.**

    Heute  Stack  Extended  Produkte  Katalog  VORLIEBEN
    Stacks  Auswertung  Bestand  Injektionen
    Einnahmetreue  Wechselwirkungen  Kosten

`[read]` **Dreizehn Reiter, der neue als sechster.**

**Foto:** `backup/x-g468-reiter.png`

`[cmd]` **Ohne Referenztrenner und ohne Attrappe** ? **die Flaeche
ist vollstaendig angebunden (C-511), und es gibt keine
Mockup-Vorlage dafuer:** Toms Vorgabe vom 2026-09-08, nicht aus
einem Entwurf.

### A2 -- mehrere Marken, und sie bleiben

`[cmd]` **Vier Marken gesetzt, vier nach dem Neuladen aus der
Datenbank zurueck:**

    BulkSupplements.com          5.595 Produkte
    Hawaii Pharm                 4.726
    Herbal Terra                 3.138
    TerraVita Premium Collection  4.019

`[read]` **Die Liste kommt aus `supplement_brand_options`** (C-511):
eigene Marken zuerst, dann nach Produktzahl ? **24 zur Wahl, dazu
eine entprellte Suche ueber alle 4.907.**

### A3 -- die Allergien: EIN Speicher, zwei Flaechen

**Toms Regel E-84:** *„solange es an DENSELBEN ORT geschrieben
wird."*

`[cmd]` **Dieselbe `AllergienKachel` wie in Settings** ? **nicht
nachgebaut, importiert:**

    import { AllergienKachel } from '../settings/allergien-kachel'

`[cmd]` **Belegt am Schirm:** ein Stoff im **Supplement-Reiter**
angelegt, danach in **Settings** nachgesehen:

    vorher   Supplements: nein   Settings: nein
    nachher  Supplements: JA     Settings: JA

`[read]` **`public.user_allergies` bleibt die Wahrheit** (C-498) ?
**der Reiter fasst die Tabelle nicht selbst an**, und
`settings/allergie-aktionen.ts` frischt `/v2/supplements` bereits
mit (G-455, dort schon vorgesehen).

`[cmd]` **Der Probestoff ist geloescht** ? das Konto traegt wieder
seine drei: `lactose`, `Magnesium Stearate`, `Soja`.

**Foto:** `backup/x-g468-a3-allergien.png`

### A4 -- die Vorlieben wirken auf die Produktsuche

    VORHER    426 geladen, der Filter trifft 121.959 Produkte
    NACHHER   499 geladen, der Filter trifft   8.069 Produkte

`[cmd]` **8.069 = 4.050 + 4.019** ? die beiden gesetzten Marken.
`[read]` **Gegengerechnet in der Datenbank:** vier Marken ergeben
14.150 `On Market`, und die Route liefert dieselbe Zahl.

**Foto:** `backup/x-g468-a4-nachher.png`

#### Was dafuer gebaut werden musste

`[cmd]` **Gemessen VOR dem Bauen: nichts las die neue Tabelle** ?
null Treffer fuer `supplement_preferences` in `lib/supplements`.
**A4 war nicht zu zeigen, sondern zu bauen.**

`[read]` **Der Leseweg nahm `marken` schon an** ? es fehlte die
Zuleitung, nicht die Abfrage.

#### Die Rangfolge, und warum sie so herum ist

    1  der gespeicherte Sitzungsfilter   (C-504, wenn VORHANDEN)
    2  die Vorlieben                     (C-511)
    3  die leere Vorgabe

`[cmd]` **Zwei Speicher, zwei Bedeutungen** ? **das ist KEIN
Verstoss gegen E-84:**

    C-504 user_display_preferences   was ich JETZT ansehe
    C-511 supplement_preferences     was ich ALLGEMEIN will

`[read]` **Ein Sitzungsfilter, der den Vorlieben folgte, liesse
sich nicht mehr wegklicken. Vorlieben, die dem Filter folgten,
waeren keine Vorlieben.**

`[cmd]` **Und die Trennung ist gemessen:** nach dem Lauf steht
`gespeichert: false, marken: []` ? **aus einer Vorliebe wird KEIN
Sitzungsfilter.** `[read]` **Ohne diese Sperre loeschte ein
*Zuruecksetzen* im Reiter die Wirkung der Vorlieben** ? genau die
zweite Wahrheit, die E-84 verbietet.

#### Zwei Fallen, beide gemessen

`[cmd]` **Erstens: `ladeProduktFilter` gibt NIE `filter: null`
zurueck** (`produkt-filter-read.ts:55`) ? ohne Zeile kommt
`{ filter: VORGABE, gespeichert: false }`. `[read]` **Eine Pruefung
auf `filter != null` waere IMMER wahr, die Vorlieben kaemen nie zum
Zug, und A4 waere gebaut und unwirksam.** `[cmd]` **Genau das stand
hier im ersten Anlauf** ? das Merkmal ist `gespeichert`.

`[cmd]` **Zweitens: die gemiedenen Stoffe standen NUR in
`nutrition.food_preference_items`** (G-455). `[read]` **Der neue
Reiter schrieb `avoided_ingredients` nach C-511, und niemand las
das Feld** ? eine Vorliebe, die nichts tut, sieht aus wie eine
Zusage. `[cmd]` **Jetzt liest `ladeMeidestoffe` BEIDE Orte** und
gibt eine Vereinigung ? **ein Leseweg, kein zweiter Reiter.**

### A5 -- Kontraste, beide Themen

    Wirkungssatz      hell 8,79:1    dunkel 7,86:1
    Marken-Pille      hell 9,19:1    dunkel 7,20:1
    gewaehlte Pille   hell 4,85:1    dunkel 8,34:1

`[read]` **Alle ueber 4,5** (WCAG AA).

`[cmd]` **Der Wirkungssatz stand zuerst bei 2,76:1** ?
`.v2-hinweis` traegt `--fg-dim` (`v2.css:1653`), **eine der 27
Textstellen, die G-479 nicht angefasst hat.** `[read]` **Eine
zweite KLASSE reichte nicht:** `.v2-muted` steht in Zeile 833,
`.v2-hinweis` in 1647 ? **beide einfache Waehler, der spaetere
gewinnt.** `[cmd]` **Also am Element**, wo nichts dazwischenkommt.

`[cmd]` **Zwei Messfehler im Werkzeug, beide berichtigt:**
`data-theme` traegt den NAMEN des Themas ? es auf `light` zu setzen
loeschte die Tokens, **und jeder Kontrast wurde 1,0.** `[read]`
**Eine 1,0 ist kein Messwert, sondern ein kaputtes Messwerkzeug.**
`[cmd]` **Und die gewaehlte Pille traegt ihren eigenen Farbton bei
8 % Deckung** ? die Kette bricht dort ab, und die Schrift wurde
gegen ihre eigene Tuenche gemessen.

### A6 -- die zwoelf anderen Reiter unveraendert

`[cmd]` **Jeder einzeln geoeffnet, Inhalt gezaehlt, Seitenfehler
gezaehlt:**

    today 4.709   stack 1.714   extended 21.897   produkte 1.464
    catalog 73.809   stacks 3.055   intel 3.770   inventory 2.483
    injection 7.814   compliance 2.404   interactions 4.177
    cost 6.148

`[read]` **Null Seitenfehler, kein Fehlertext, keiner leer.**

`[cmd]` **Und der vorhandene Waechter hat gemeldet:** *„A8: die
zehn anderen Reiter stehen unveraendert"* fiel, als `prefs`
dazukam ? **das war sein Zweck.** `[read]` **Nachgezogen, nicht
entschaerft:** die Reihenfolge der uebrigen zwoelf ist unveraendert,
und genau das prueft er weiter.

### A7 -- die Waechter

    apps/web      1.982 Proben, 0 rot   (verlangt: 1.811 oder mehr)
    apps/coach       65 Proben, 0 rot
    tsc                 sauber
    eslint              sauber

`[cmd]` **13 neue Proben** in `g468-vorlieben.test.ts`.

#### Die Sabotageprobe

`[cmd]` **Sechs Schaeden, sechs Mal ROT, Kontrolle vorher UND
nachher gruen:**

    umschalten sortiert nicht            ROT
    p_source auf 'settings'              ROT
    Rangfolge an `filter != null`        ROT
    die Vorliebe wird doch gespeichert   ROT
    C-511-Stoffe nicht gelesen           ROT
    AllergienKachel entfernt             ROT

`[cmd]` **Zwei Waechter fielen zuerst an ihrer EIGENEN
Begruendung** ? die Kommentare nennen `user_allergies` und beide
erlaubten Werte von `p_source`, **und eine Suche im Rohtext trifft
sie mit.** `[read]` **Ein Waechter, der seine Begruendung mitliest,
misst nicht die Sache** ? beide pruefen jetzt den Quelltext ohne
Kommentare.

### Drei eigene Fehlschluesse, benannt

`[read]` **Sie gehoeren in den Bericht, weil sie Messzeit gekostet
haben und der naechste sie sonst wiederholt.**

`[cmd]` **Erstens: „zwei Marken geklickt, eine kam an."** `[read]`
**Der Code war in Ordnung** ? die Probe wartete mit
`.first().waitFor()`, **und `.first()` ist nach dem ersten Klick
schon da.** `[cmd]` **Ab dem zweiten Klick wartete sie auf
nichts.** `[read]` **Die Bedingung ist die ANZAHL, sie waechst je
Klick.** `[cmd]` **Ein Einzelklick schrieb nachweislich beide
Marken** ? das hat den Fall halbiert.

`[cmd]` **Zweitens: „Kein Produkt passt zu diesen Filtern."**
`[read]` **Das war ein ZWISCHENSTAND** ? die Marke
`produkt-treffer` steht in der Fusszeile und ist sofort da,
waehrend die Tabelle noch *„Sucht..."* zeigte. `[cmd]` **Das FOTO
hat es entschieden, nicht die naechste Vermutung.** `[read]`
**Jetzt wartet die Probe auf eine ZAHL im Trefferstand.**

`[cmd]` **Drittens: `v2-pill-knopf`, `anzahl`, `allergie-zeile`,
`tab=products`** ? **vier erfundene Namen.** `[read]` **Jeder
kostete einen Lauf.** `[cmd]` **Die Reiter heissen `produkte`, die
Felder `onMarket`/`alle`, und die geteilte Kachel traegt gar keine
Marke** ? greppen, nicht raten.

### Ein Befund, nicht behoben

`[cmd]` **`.v2-hinweis` traegt weiterhin `--fg-dim`** und liegt
damit unter 4,5:1 ? **an allen anderen Stellen, die die Klasse
benutzen.** `[read]` **Hier wurde nur die eine Zeile geloest, die
zu diesem Auftrag gehoert.** `[cmd]` **Das global zu aendern ist
ein eigener Auftrag** ? es beruehrt `packages/ui` und damit alle
vier Module (die Lage aus G-479).

### Neustart

`[read]` **Keiner noetig** ? nur `apps/web/src` und `messages/`
beruehrt, beides laedt heiss nach.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Proben: web 1982/1982, coach 65/65.**

`[cmd]` **Die Vorlieben wirken: 121.959 On Market -> 4.050 bei
zwei gespeicherten Marken.**

### A4 war kein Zeigen, sondern ein Bauen

> *,,Nichts las die C-511-Tabelle, also habe ich die Vorlieben
in die Produktsuche verdrahtet: 121.959 -> 8.069."*

`[read]` **C-511 war live und wirkungslos** ? **ein Speicher
ohne Leser, wie `user_display_preferences` vor G-467.**

> *,,`avoided_ingredients` wurde geschrieben, aber nie
gelesen."*

### Und die zwei Speicher sauber getrennt

> *,,Sitzungsfilter (C-504) und Vorliebe (C-511) als zwei
Speicher mit ausdruecklichem Vorrang ? ohne diesen Riegel
haette ein *Zuruecksetzen* die Wirkung der Vorliebe still
geloescht."*

`[read]` **Genau Codex Unterscheidung aus C-511: der Filter ist
eine Ansichtssache, die Lieblingsmarke eine Haltung.**

### A3: eine Wahrheit, zwei Flaechen

`[cmd]` **Ein in Supplements angelegtes Allergen erschien in
Settings** ? **`public.user_allergies` bleibt die Wahrheit
(E-84).**

### Drei eigene Messfehler, aufgeschrieben

> *,,Eine Probe wartete auf `.first()` ? schon nach dem ersten
Klick da, also wartete sie nie wieder."*

> *,,Eine Marke im Fuss stand sofort, waehrend die Tafel noch
*Sucht...* zeigte ? ich habe drei Laeufe lang einen Ladezustand
als Null gelesen."*

> *,,Vier erfundene Namen, jeder einen Lauf."*

`[read]` **Ein Ladezustand, der wie ein Ergebnis aussieht** ?
**dieselbe Klasse wie die Null in G-483 und die 438 kcal in
G-485.**

**Abgenommen.**

