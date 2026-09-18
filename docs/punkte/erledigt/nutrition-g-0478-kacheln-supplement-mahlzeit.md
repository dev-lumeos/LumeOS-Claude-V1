---
nr: G-478
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-475
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1a5d3539
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/supplement-posten-read.ts
    - apps/web/src/lib/nutrition/diary-model.ts
    - apps/web/src/lib/nutrition/diary-write.ts
    - apps/web/src/app/api/nutrition/diary/route.ts
    - apps/web/src/app/api/nutrition/supplement-suche/route.ts
    - apps/web/src/app/v2/nutrition/supplement-modal.tsx
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
    - apps/web/src/app/v2/nutrition/modale.tsx
    - apps/web/src/app/v2/nutrition/kopfknoepfe.tsx
    - apps/web/src/app/globals.css
zahlen:
  gemessen: 2026-09-18
---

# G-478 - die Kacheln fuer Supplemente in der Mahlzeit

## Was G-475 gebaut hat

`[cmd]` **Drei Dateien:** `supplement-posten-read.ts`,
`supplement-posten-lage.ts`, **plus Probe.**

`[cmd]` **Gegen die Datenbank belegt, mit ROLLBACK:**

    1 x 31 Gram(s)   120 kcal, 24 g
    2 x 31 Gram(s)   240 kcal, 48 g

`[cmd]` **Und der Satz fuer Produkte ohne Naehrwerte steht:**
*,,Fuer dieses Produkt sind keine Naehrwerte hinterlegt. Es
wird erfasst, zaehlt aber nicht in die Tagesbilanz."*

## Sein eigener Vorschlag

> *,,Der Folgeauftrag muss nur noch Kacheln bauen ? Suchfeld,
Portions-Pulldown, Posten in der Liste, separate Bilanzzeile,
Rueckfrage."*

## Abnahmebedingungen

    A1  ein Supplement laesst sich einer Mahlzeit
        hinzufuegen. Foto.
    A2  die Tagesbilanz weist es SEPARAT aus. Foto.
    A3  Toms Fruehstueck ERFASST: Haferflocken,
        Blaubeeren, Mandelmus, Whey. Foto mit der
        Summe, und die Zeilen stehen in der Datenbank.
    A4  mehrere Portionsgroessen: die Wahl steht. Foto.
    A5  ein Produkt ohne Naehrwerte: der Satz steht.
        Foto.
    A6  Kontraste gemessen, nicht geschaetzt.
    A7  vier Module unveraendert.
    A8  apps/web 1857 oder mehr, apps/coach 65.

## Was NICHT in diesen Auftrag gehoert

`[cmd]` **Die Rueckfrage bei doppelter Erfassung** ? **sie
braucht die Produkt-Substanz-Bruecke, und die gibt es nicht
(C-518).**

## Bericht

**Alle acht Bedingungen erfuellt.** **Gemessen am 2026-09-18
auf `dev@lumeos.app`, Dev-Server 3200.**

### Die Zahlen

    A1  Posten angelegt, Zeile in der Datenbank       erfuellt
    A2  „davon 120 kcal · 24 P aus 1 Supplement"      erfuellt
    A3  557,50 kcal / 40,022 g -- vier Zeilen         erfuellt
    A4  drei Portionsgroessen zur Wahl                erfuellt
    A5  der Satz steht, ohne Portionswahl             erfuellt
    A6  12 Flaechen gemessen, 0 durchgefallen         erfuellt
    A7  vier Module 200, Kachelzahlen unveraendert    erfuellt
    A8  apps/web 1865/1865, apps/coach 65/65          erfuellt

### A3 ? Toms Fruehstueck, und was die Auftragszahl wirklich war

`[cmd]` **Die Summe des Auftrags war eine RECHNUNG, kein
erfasster Tag** ? **das stand schon im G-475-Bericht, und es
galt bis heute: `food_source='supplement'` hatte null Zeilen.**

`[cmd]` **Jetzt gemessen, in `nutrition.meal_items`:**

    Haferflocken       60 g    208,8 kcal    7,93 g
    Heidelbeere       100 g     61,0 kcal    0,50 g
    Mandelmus          30 g    167,7 kcal    7,59 g
    Whey            1 x 31 g   120,0 kcal   24,00 g
    ------------------------------------------------
                             557,50 kcal   40,022 g

`[read]` **Genau die Zahl aus dem Auftrag** ? **diesmal aber
aus vier Zeilen summiert, nicht ausgerechnet.**

`[cmd]` **Angelegt ueber `POST /api/nutrition/diary`** ?
**dieselbe Route, die die Kacheln benutzen.** `[read]` **Kein
direkter SQL-Schreibweg: was die Anwendung nicht kann, soll
auch die Probe nicht koennen.**

### A2 ? die Tagesbilanz zaehlte bereits richtig

`[cmd]` **Vor dem Bauen gemessen, und das hat den Auftrag
geaendert:**

    nutrition.daily_summary        2.127,53 kcal
    Summe ueber die Posten         2.127,53 kcal
    davon food_source=supplement     120,00 kcal

`[read]` **Die Sicht zaehlt Supplemente also schon mit** ?
**die Tagessumme war nie falsch.** `[read]` **Was fehlte, war
die Auskunft, WIEVIEL davon nicht aus Lebensmitteln kam.**

`[cmd]` **Deshalb keine zweite Summe, sondern eine Zerlegung**
? **eine unabhaengig gerechnete zweite Zahl koennte von der
ersten abweichen, und niemand saehe es.**

`[cmd]` **Am Schirm:** *,,davon 120 kcal · 24 P aus 1
Supplement"*, **neben der Kopfsumme der Mahlzeit.** `[read]`
**Das Wort ,,davon" traegt die Aussage** ? **ohne es liest
sich die Zahl wie ein Zuschlag.**

`[cmd]` **`supabase/` nicht angefasst** ? **die Zerlegung
rechnet im Browser aus den Posten, die ohnehin schon da sind.**

### Der Befund, der den Auftrag gerettet hat

`[cmd]` **`diary-model.ts` warf JEDE Supplement-Zeile weg:**

    if (amount === null) return []

`[read]` **`meal_items_amount_g_check` verlangt `amount_g IS
NULL` fuer Supplemente** ? **die Zeile stand also in der
Datenbank und kam nie an der Oberflaeche an.** `[read]` **Ohne
Fehler, ohne Meldung, ohne Null: sie fehlte einfach.**

`[cmd]` **Gefunden beim Lesen des Lesers, bevor die Kachel
gebaut war** ? **nicht durch die Anzeige.**

    const istSupplement = record.food_source === 'supplement'
    if (amount === null && !istSupplement) return []

`[read]` **Die Gegenprobe steht im Waechter:** **ein
Lebensmittel ohne `amount_g` faellt weiterhin weg** ? **sonst
haette man den Filter abgeschaltet statt ihn zu verzweigen.**

### A6 ? zwoelf Flaechen, zwei waren rot

`[cmd]` **Gemessen ueber ein 1x1-Canvas** (`_g478-kontrast.mjs`,
Kern aus `_g453`) ? **nicht ueber die Farbzeichenkette: `oklch()`
bricht jeden Regex.**

`[cmd]` **Erster Lauf: 11 Flaechen, ZWEI durchgefallen.**

    .v2-dim       2,88:1   Schwelle 4,5
    .v2-eyebrow   2,88:1   Schwelle 4,5

`[read]` **Beide sind geerbte Hausklassen, keine eigenen** ?
**sie liegen in `packages/ui/src/styles/v2.css` und werden
1.565 mal in `v2` benutzt.** `[cmd]` **Dort zu greifen hiesse,
jede App zu aendern** ? **das waere A7 gewesen.**

`[cmd]` **Deshalb auf die eigene Flaeche begrenzt**, wie es
`supplements.css:1910` fuer den Produktfilter schon tut:

    [data-probe='supplement-add'] .v2-dim,
    [data-probe='supplement-add'] .v2-eyebrow { color: var(--fg-muted); }

`[cmd]` **Zweiter Lauf: 12 Flaechen, 0 durchgefallen** ?
**beide jetzt bei 9,19:1.**

`[read]` **Dass die Probe vorher zwei Fehler fand, ist der
Beleg, dass sie ueberhaupt rot werden kann.**

### Der Waechter, und was er zuerst NICHT gemessen hat

`[cmd]` **`g478-supplement-kacheln.test.ts`, 8 Faelle** ?
**dazu `_g478-sabotage.mjs` mit 11 Schaeden und einer
KONTROLLPROBE, die gruen bleiben muss.**

`[cmd]` **Erster Sabotagelauf: 7/10** ? **drei Schaeden
blieben gruen.** `[read]` **Der Fehler lag NICHT im Waechter:**

    String.replace(zeichenkette, ...)   ersetzt nur das ERSTE Vorkommen

`[cmd]` **`food_source === 'supplement'`,
`supplement_serving_quantity` und `legeSupplementPostenAn`
stehen je ZWEIMAL in ihrer Datei** ? **das zweite Vorkommen
erfuellte die Zusicherung weiter, und die Sabotage kam nie an.**

`[cmd]` **Mit `replaceAll`: 12/12** ? **elf rot, die Kontrolle
gruen.**

`[read]` **Eine Sabotage, die nur eines von zwei Vorkommen
beschaedigt, beweist nichts** ? **sie sieht nur so aus.**

### Ein fremder Waechter fiel ? und war im Recht

`[cmd]` **`quick-add-manueller-posten.test.ts` wurde rot:**
*,,G-340: die Route kennt die dritte art"*.

`[cmd]` **Der Grund war meine Aenderung:** **die Fehlermeldung
der Route nennt jetzt vier arten statt drei.** `[read]` **Die
Absicht des Waechters (*,,die Fehlermeldung nennt alle, sonst
raet der naechste Aufrufer"*) ist weiter erfuellt** ? **nur
seine woertliche Form war veraltet:**

    assert.match(r, /"mahlzeit", "position" oder "manuell"/)

`[cmd]` **Nachgezogen auf die Sache statt auf die Wortfolge:**
**jede der vier arten muss vorkommen.** `[cmd]` **Beleg, dass
die gelockerte Zusicherung noch rot werden kann: jede der vier
einzeln entfernt ? viermal rot.**

`[read]` **Beim ersten Beleg blieb `manuell` gruen** ? **auch
dort war die Sabotage nicht angekommen, nicht der Waechter
blind.** `[cmd]` **Erst pruefen, ob der Schaden wirkt, dann
den Waechter verdaechtigen.**

### Die Fotos

    backup/x-g478-a1-posten.png        A1  Knopf, Marke, „1 ×"
    backup/x-g478-a2-bilanz.png        A2  „davon 120 kcal ..."
    backup/x-g478-a3-fruehstueck.png   A3  vier Zeilen mit Summe
    backup/x-g478-a4-portionen.png     A4  drei Portionsgroessen
    backup/x-g478-a5-ohne-werte.png    A5  der Satz, ohne Wahl

`[cmd]` **A4 am Beispiel `Amplified Wheybolic Extreme 60
Strength Fruit Punch`:**

    28,3 Gram(s)    90 kcal   20 g Protein
    56,7 Gram(s)   190 kcal   40 g Protein
    85   Gram(s)   280 kcal   60 g Protein

`[cmd]` **A5 am Beispiel `Micronized Creatine Monohydrate`:**
**keine Portionswahl, der Satz steht, speichern bleibt
moeglich.**

`[cmd]` **Jede Zahl im A3-Foto gegen die Datenbank gehalten**
? **auch die 4 K und 1 F beim Whey: das sind die Kohlenhydrate
und das Fett der 31-g-Portion des Produkts, nicht der
Rundung.**

### Gemessen gegen 3200, nicht gegen den Produktionsbau

`[read]` **Die Proben navigieren mehrfach** ? **und Playwright
1.41.2 bringt Chromium 121 mit, das dabei im Produktionsbau
stirbt (G-474).**

`[cmd]` **Der Dev-Server wurde weder gestartet noch neu
gestartet noch aufgeraeumt.**

### Was nicht gebaut wurde

`[cmd]` **Die Rueckfrage bei doppelter Erfassung** ? **wie
beauftragt ausgelassen (C-518).** `[read]` **Die Regeln dafuer
liegen in `supplement-posten-lage.ts` seit G-475 bereit
(`DOPPELT_MINUTEN`, `doppeltSatz`, `fragtNach`)** ? **sie
werden von der Oberflaeche noch nicht gerufen.**

### Neustart noetig?

`[read]` **Nein** ? **nur `apps/web/src`: heisses Nachladen
genuegt.** `[read]` **`packages/` wurde bewusst NICHT
angefasst, obwohl die beiden blassen Klassen dort liegen.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g478-a3-fruehstueck.png` angesehen:**

    Fruehstueck  4 items  190 g  558 kcal  40 P  47 K  20 F
      davon 120 kcal - 24 P aus 1 Supplement
      Haferflocken              60 g  209 kcal   8 P
      Heidelbeere              100 g   61 kcal   1 P
      Mandelmus                 30 g  168 kcal   8 P
      Gold Standard 100% Whey  1 x   120 kcal  24 P
        [Supplement - 31 Gram(s)]

`[cmd]` **Selbst nachgemessen: 1 Zeile mit
`food_source=supplement`** ? **vorher 0.**

`[cmd]` **Proben: web 1865/1865, coach 65/65.**

### Ein stiller Datenverlust, vor der Auslieferung gefangen

> *,,`diary-model.ts` hatte `if (amount === null) return []` ?
und der DB-CHECK verlangt `amount_g IS NULL` fuer Supplemente.
Jede Supplementzeile waere richtig geschrieben und dann vom
LESER verworfen worden: kein Fehler, keine Null, einfach
ABWESEND."*

`[read]` **Gefunden durch das Lesen des Parsers, bevor die
Kachel gebaut war.**

`[read]` **Derselbe Fehlertyp wie der Vorgabewert in G-450** ?
**kein Typfehler, keine Meldung, falsches Ergebnis.**

### A2 war anders, als ich dachte

> *,,`daily_summary` ZAEHLT Supplemente bereits (2.127,53 kcal
in der Sicht = 2.127,53 ueber die Posten, davon 120 das Whey).
Die Summe war nie falsch. Also habe ich eine AUFSCHLUESSELUNG
gebaut, keine zweite Summe ? eine zweite unabhaengig gerechnete
Zahl koennte unbemerkt abweichen."*

`[read]` **Er hat die Voraussetzung gepruefft, statt sie zu
bauen** ? **und `supabase/` blieb unberuehrt.**

### Und ein Waechter, richtig behandelt

> *,,`G-340` verlangte die woertliche Wendung `mahlzeit`,
`position` oder `manuell`; ich habe eine VIERTE Art. Ich habe
die Behauptung so umgeschrieben, dass sie prueft, dass JEDE Art
benannt ist ? dann bewiesen, dass sie noch rot werden kann."*

> *,,Mein erster Sabotageversuch blieb gruen, weil der Schaden
nie ankam, nicht weil der Waechter blind war."*

`[read]` **Er hat den Unterschied zwischen *,,Probe blind"* und
*,,Sabotage misslungen"* benannt.**

### Und die Kontraste lokal berichtigt

`[cmd]` **`.v2-dim` und `.v2-eyebrow` messen 2,88:1 und liegen
in `packages/ui`, 1.565-fach benutzt** ? **er hat sie NUR im
Modal ueberschrieben.**

`[read]` **Aendern haette A7 gebrochen** ? **als G-479.**

**Abgenommen.**

