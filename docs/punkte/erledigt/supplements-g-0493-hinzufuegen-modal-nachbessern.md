---
nr: G-493
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-492
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 2ff9be65
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/produkt-aktion.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-493 - das Hinzufuegen-Modal nachbessern

## Vier Befunde

### 1 - zwei Woerter fuer dieselbe Aktion

Tom, 2026-09-08:

> in der auflistung heisst es + Add und aufgeklappt
> + hinzufuegen

`[cmd]` **`ansicht.tsx:404` gegen `produkt-tafel.tsx:301`.**

`[read]` **EIN Wort, ueberall** ? **auch bei den Substanzen.**

### 2 - keine neue Mahlzeit im Modal

Tom, 2026-09-08:

> im modal, wenn man mahlzeit waehlt, kommen die definierten
> standards, da muss noch mahlzeit hinzufuegen wie in diary
> rein, dass man ohne slot hinzufuegen kann, zb
> preworkout/postworkout oder andere

`[cmd]` **Die Datenbank kennt sie schon:**

    meals.meal_type  breakfast | lunch | dinner | snack |
                     pre_workout | post_workout | other

`[cmd]` **Und das Diary hat den Weg: `mahlzeiten.tsx:630`,
*,,Mahlzeit hinzufuegen"*.**

`[read]` **Das Modal zeigt nur die HEUTE angelegten
Mahlzeiten** ? **es fehlt der Weg, eine neue anzulegen.**

`[read]` **Denselben Weg wie das Diary benutzen, nicht
nachbauen.**

### 3 - die Zielwahl zeigt ihren Zustand nicht

`[cmd]` **`In den Stack` und `Zu einer Mahlzeit` sehen gleich
aus, ob gewaehlt oder nicht.**

### 4 - die Produkt-Id steht noch in notes

`[cmd]` **C-529 ist live: `stack_items.supplier_product_id`,
optional.**

`[cmd]` **Gemessen: 0 von 11 Eintraegen haben ein Produkt** ?
**weil `produkt-aktion.tsx` noch in `notes` schreibt.**

> Codex: *,,`notes` wurde bewusst NICHT entfernt; Claude Code
kann jetzt auf die neue Spalte umstellen, ohne Nutzernotizen zu
beschaedigen."*

`[read]` **Schreiben und Lesen auf die Spalte umstellen** ?
**und die Kruecke aus `notes` erst entfernen, wenn nichts sie
mehr liest.**

## Abnahmebedingungen

    A1  ein Wort fuer die Aktion, in Liste, Tafel und
        Substanzen. Belegt.
    A2  im Modal: eine neue Mahlzeit anlegen, mit
        pre_workout / post_workout / other. Foto.
    A3  derselbe Weg wie das Diary -- nicht nachgebaut.
        Belegt.
    A4  der gewaehlte Zielknopf ist erkennbar. Foto
        beider Zustaende.
    A5  ein neuer Stackeintrag traegt
        supplier_product_id. Gegen die Datenbank belegt.
    A6  notes enthaelt keine Produkt-Id mehr bei neuen
        Eintraegen.
    A7  bestehende Eintraege unveraendert.
    A8  Kontraste gemessen.
    A9  apps/web 1934 oder mehr, apps/coach 65.

## Bericht

**Alle vier Befunde behoben.**

    A1  ein Wort fuer die Aktion            erfuellt
    A2  neue Mahlzeit im Modal              erfuellt
    A3  derselbe Weg wie das Diary          erfuellt
    A4  der gewaehlte Zielknopf erkennbar   erfuellt
    A5  supplier_product_id gesetzt         erfuellt
    A6  keine Produkt-Id mehr in notes      erfuellt
    A7  bestehende Eintraege unveraendert   erfuellt
    A8  Kontraste gemessen                  erfuellt
    A9  apps/web 1951/1951, coach 65/65     erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### 1 — ein Wort, und der Schluessel war schon da

`[cmd]` **Gemessen: DREI Literale**, zwei davon `Add`:

    tab-produkte.tsx:1222      Add
    substanz-detail.tsx:470    Add
    produkt-tafel.tsx:301      Hinzufügen

`[cmd]` **Mein erster Entwurf legte einen NEUEN Schluessel unter
`Supplements` an** — **und schrieb ihn ohne Umlaut.** `[cmd]`
**Gemessen, was dabei herauskam:**

    Liste       "Hinzufuegen"
    Tafel       "Hinzufügen"

`[read]` **Zwei Woerter fuer dieselbe Aktion, wieder** — genau
Toms Befund, nur eine Silbe verschoben.

`[cmd]` **`Allgemein.hinzufuegen` gab es schon** (`de.json:7`
*„Hinzufügen"*, `en.json` *„Add"*). `[cmd]` **`messages/` ist
jetzt UNVERAENDERT** — der Schluessel war da, ich habe ihn nur
nicht gesucht.

`[cmd]` **Gemessen nach dem Umbau:**

    Liste       ["Hinzufügen","Hinzufügen","Hinzufügen"]
    Tafel       "Hinzufügen"
    Substanzen  ["Hinzufügen","Hinzufügen","Hinzufügen"]

**Und eine Stelle bleibt englisch, mit Grund:**

`[cmd]` **`tabs.tsx:949` steht in `DatabaseAttrappe`** — **UNTER
dem `ReferenzTrenner`** (Zeile 882). `[read]` **Das ist die
Mockup-Vorlage**, durchgehend englisch (*„Search supplements…"*).
`[read]` **Sie zu uebersetzen hiesse, die Referenz zu faelschen.**

### 2 — die neue Mahlzeit, ueber den Diary-Weg

`[cmd]` **Gemessen: `POST /api/nutrition/diary` mit
`art: 'mahlzeit'`** — derselbe Aufruf wie `FreieMahlzeit`
(`mahlzeiten.tsx:583`). `[cmd]` **Die Kategorien kommen aus
`kategorieAuswahl()`**, derselben Funktion.

`[read]` **Nicht die KOMPONENTE wiederverwendet, sondern den
WEG** — `FreieMahlzeit` ist nicht exportiert und braucht `slots`
und ein `ZiehModal`; ein Modal im Modal waere schlechter als ein
Formular.

`[cmd]` **Gemessen am Schirm:**

    vorher   Frühstück · 07:30 | Mittagessen · 12:30 |
             Snack · 16:00 | Abendessen · 19:30
    Wahl     pre_workout, 05:45
    nachher  Vor dem Training · 05:45  <- gewaehlt
             + die vier vorhandenen

`[cmd]` **In der Datenbank:** `pre_workout | 05:45:00 |
2026-09-22`.

**Eine Einschraenkung, die ich nicht selbst entschieden habe:**

`[read]` **Tom nannte *„zb preworkout/postworkout oder
andere"*.** `[cmd]` **`other` steht NICHT zur Wahl** —
`kategorieAuswahl()` filtert es seit G-351 heraus:

> *„Eine Mahlzeit auf `other` faellt aus dem Tag"* — `rasterZeilen`
> kennt sie nicht, ueber *Wie gestern* ist sie nicht erreichbar.

`[read]` **Pre-Workout und Post-Workout sind da, `other` bleibt
aus einem gemessenen Grund draussen.** `[read]` **Wer es
trotzdem will, muss G-351 aufmachen** — nicht diesen Filter
umgehen.

### 3 — die Zielwahl zeigt ihren Zustand

`[cmd]` **Die Knoepfe trugen `aria-pressed` schon** (G-484) —
**gemessen: keine einzige CSS-Regel las es.** `[read]` **Eine
Zusage an die Vorlesesoftware, die das Auge nicht bekam.**

`[cmd]` **Gemessen, vorher und nachher:**

    keiner gewaehlt   beide  oklch(0.2 …) auf weiss, 500
    Mahlzeit gewaehlt Stack  unveraendert, Kontrast 18,11
                      Mahl.  eigener Grund, 600, Kontrast 7,46

`[cmd]` **Erster Entwurf: 4,06:1** — **WCAG AA verlangt 4,5.**
`[read]` **Die Farbe traegt hier eine Aussage**, also muss sie
lesbar sein. `[cmd]` **`--acc` NICHT geaendert** (der Wert gilt
fuer die ganze Anwendung), **sondern die Schrift abgedunkelt** —
**7,46:1**.

`[read]` **Und die Regel steht in `supplements.css`, nicht in
`packages/ui`** — das Paket gehoert allen Apps.

### 4 — die Produkt-Id steht in der Spalte

`[cmd]` **Gemessen VOR der Aenderung:**

    stack_items          11 Zeilen
    mit supplier_product_id   0
    mit "Produkt-Id" in notes 0

`[read]` **Die Kruecke war nie angekommen** — meine G-484-Schreib-
versuche liefen in den Fehler, den G-492 behoben hat. `[cmd]`
**Die 11 Zeilen sind Seeds mit echten Notizen** (*„C-82
Szenario…"*, *„Abends"*). `[read]` **Genau das meinte Codex mit
*„ohne Nutzernotizen zu beschaedigen"*.**

`[cmd]` **Umgestellt: Schreibweg** (`stack-write.ts`,
`intake/route.ts`, `produkt-aktion.tsx`) **UND Leseweg**
(`stack-read.ts`, `StackPosition`).

`[cmd]` **Gemessen NACH einer Schreibprobe ueber die Oberflaeche:**

    stack_items               12 Zeilen  (11 -> 12)
    mit supplier_product_id    1
    mit "Produkt-Id" in notes  0
    notes der neuen Zeile      LEER
    alte Zeilen mit Notizen    9  (unveraendert)

`[read]` **A5, A6 und A7 in einer Messung.**

### Der Waechter

`[cmd]` **`g493-modal-nachbessern.test.ts`, 8 Faelle.** `[cmd]`
**`_g493-sabotage.mjs`: 11 Schaeden plus Kontrolle — 12/12 im
ERSTEN Lauf.**

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `supplements.css`.

### Die Fotos

    x-g493-a4-keiner.png       A4: keiner gewaehlt
    x-g493-a4-gewaehlt.png     A4: Mahlzeit gewaehlt, hervorgehoben
    x-g493-a2-neue-mahlzeit.png A2: das Formular mit den Arten
    x-g493-a2-neue-angelegt.png A2: „Vor dem Training · 05:45"
    x-g493-a5-stack.png        A5: in den Stack uebernommen

## Abnahme

_(vom Orchestrator)_

## ZURUECK - A1 ist nicht erfuellt, 2026-09-08

`[cmd]` **Toms Bildschirmfoto nach der Meldung: der Knopf zeigt
den ROHEN Schluessel.**

    Liste         [+ Allgemein.hinzufuegen]
    Tafel oben    [+ Allgemein.hinzufuegen]

Tom: *,,buttonbezeichnung unlogisch auf deutsch"*

`[cmd]` **Selbst gemessen:**

    de.json   Allgemein.hinzufuegen = 'Hinzufuegen' (mit ue)
    en.json   Allgemein.hinzufuegen = 'Add'
    th.json   Allgemein fehlt GANZ
    tab-produkte.tsx:301   useTranslations('Allgemein')
    produkt-tafel.tsx:230  useTranslations('Allgemein')

`[read]` **Der Schluessel existiert, der Aufruf sieht richtig
aus ? und der Schirm zeigt trotzdem den Schluessel.**

`[cmd]` **Der Bericht meldete A1 als belegt:** *,,Das
Aktionswort steht jetzt dreimal identisch."* **Identisch ist es
? identisch falsch.**

`[read]` **Die Probe hat Gleichheit geprueft, nicht die
Anzeige.**

## Und ein zweiter Befund

Tom, mit Pfeilen im Foto:

> dann erweitert gleich darunter derselbe button? dann kann man
> es gleich weglassen

`[cmd]` **Aufgeklappt stehen ZWEI gleiche Knoepfe untereinander**
? **in der Zeile und in der Subnav-Zeile der Tafel direkt
darunter.**

`[read]` **Wenn die Tafel unter ihrer Zeile aufklappt, ist der
Zeilenknopf schon da** ? **der zweite faellt weg.**

## Und im Kopf

`[cmd]` **Im selben Foto oben rechts: *,,Supplement
hinzufuegen"*, OHNE ue** ? **ein drittes Wort fuer dieselbe
Aktion.**

## Nacharbeit, Abnahmebedingungen

    N1  warum zeigt der Schirm den Schluessel? Ursache
        gemessen.
    N2  der Knopf zeigt "Hinzufuegen" (mit ue) in der
        Liste. Foto.
    N3  eine Probe, die die ANZEIGE prueft, nicht die
        Gleichheit. Sabotage: ein fehlender Schluessel
        wird rot.
    N4  th.json: Allgemein fehlt ganz -- gemeldet oder
        ergaenzt, begruendet.
    N5  aufgeklappt unter der Zeile: EIN Knopf, nicht
        zwei. Foto.
    N6  "Supplement hinzufuegen" im Kopf: ein Wort mit
        dem Rest. Foto.
    N7  apps/web 1951 oder mehr, apps/coach 65.

## Nacharbeit-Bericht

**Du hattest recht: A1 war nicht erfuellt, und meine Probe konnte
es nicht merken.**

    N1  Ursache gemessen                     erfuellt
    N2  der Knopf zeigt "Hinzufügen"         erfuellt
    N3  eine Probe, die die ANZEIGE prueft   erfuellt
    N4  th.json begruendet                   erfuellt
    N5  aufgeklappt: EIN Knopf               erfuellt
    N6  "Supplement hinzufügen" im Kopf      erfuellt
    N7  apps/web 1952/1952, coach 65/65      erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### N1 — die Ursache war meine eigene Sabotageprobe

`[cmd]` **Der Fall wurde HALBIERT, nicht geraten:** drei Schluessel
DESSELBEN Namensraums in DERSELBEN Komponente gerendert.

    tA('speichern')    -> "Speichern"            OK
    tA('laedt')        -> "Laden..."             OK
    tA('hinzufuegen')  -> "Allgemein.hinzufuegen" FEHLT

`[read]` **Der Namensraum loeste also auf — nur dieser eine
Schluessel nicht.** `[cmd]` **Dann im Auslieferungsstrom der Seite
nachgesehen, welche Schluessel der Server wirklich schickt:**

    "Allgemein": { "speichern", "abbrechen", "entfernen",
                   "bearbeiten", "hinzufuegenX",  <-- !!
                   "suchen", "laedt", ... }

`[cmd]` **Und auf der Platte:**

    grep -c hinzufuegenX apps/web/messages/de.json        0
    grep -l hinzufuegenX apps/web/.next/server/...        1
      -> _rsc_messages_de_json.js, Zeitstempel 15:43

`[read]` **Die Datei war sauber, das kompilierte Servermodul
nicht.**

`[cmd]` **Der Schaden stammt aus `_g493-sabotage.mjs`:** dort stand
ein Fall *,,der deutsche Schluessel faellt weg"*, der
`"hinzufuegen"` in `"hinzufuegenX"` umbenannte. `[cmd]` **Die
Probe stellt die Datei danach wieder her — aber Next hatte die
Sprachdatei laengst in ein Servermodul uebersetzt und haelt es je
Prozess.**

`[read]` **Ein Schaden an einer Datei, die der Dev-Server
zwischenspeichert, ueberlebt die Wiederherstellung** — **und sieht
danach aus wie ein Codefehler.** `[read]` **Genau so habe ich ihn
Tom gemeldet.**

**Behoben:** `_g493-sabotage.mjs` sabotiert die Sprachdatei nicht
mehr. `[read]` **Sie belegte ohnehin nur, dass `JSON.parse`
funktioniert** — die Zusicherung liest die Datei selbst.

`[cmd]` **Das alte Servermodul liegt noch in `.next/server/`.**
`[read]` **Ich loesche dort nichts** (CLAUDE.md). **Der
Zwischenstand verschwindet mit dem naechsten Serverstart** —
danach zeigt auch Toms Schirm das Wort.

### Warum meine A1-Probe das nicht gesehen hat

`[cmd]` **Sie verglich die drei Knopftexte MITEINANDER:**

    Liste       ["Hinzufügen","Hinzufügen","Hinzufügen"]
    Tafel       "Hinzufügen"
    Substanzen  ["Hinzufügen","Hinzufügen","Hinzufügen"]

`[read]` **Gleichheit ohne SOLL-Wert kann nicht falsch werden.**
`[read]` **Haetten alle drei den Schluessel gezeigt, waere die
Probe ebenso gruen gewesen** — *,,identisch falsch"*, wie Tom es
genannt hat.

`[cmd]` **Und `tools/i18n-pruefen.mjs` half nicht:** es meldete
*,,109 Verwendungen, alle vorhanden"*. `[read]` **Es liest die
DATEIEN, nicht den Schirm** — und genau dazwischen lag der Fehler.

### N3 — die Probe, die rot werden kann

`[cmd]` **`tools/_g493n-anzeige.mjs`:** sie holt den SOLL-Wert aus
`de.json` und vergleicht ihn mit dem, was der Browser zeigt.

`[cmd]` **`tools/_g493n-sabotage.mjs`: 3 Schaeden plus Kontrolle —
4/4.**

    ROT    die Liste ruft einen Schluessel, den es nicht gibt
    ROT    die Substanzen rufen einen, den es nicht gibt
    ROT    die Liste schreibt das Wort wieder als Literal
    GRUEN  KONTROLLE

`[cmd]` **Sabotiert wird der AUFRUF, nicht die Sprachdatei** —
`.tsx` laedt Next bei jeder Aenderung neu, die Sprachdatei nicht.
`[read]` **Die Lehre aus N1 steht im Kopf der Probe.**

### N2 und N6 — ein Wort, und diesmal richtig geschrieben

`[cmd]` **Gemessen: VIER deutsche Werte, drei davon ohne Umlaut.**

    Allgemein.hinzufuegen              "Hinzufügen"     ok
    Supplements.supplementHinzufuegen  "Supplement hinzufuegen"
    Supplements.zumStackHinzufuegen    "Zum Stack hinzufuegen"
    Nutrition.hinzufuegenZu            "Zu {slot} hinzufuegen"

`[cmd]` **Alle drei berichtigt** — **der SCHLUESSEL bleibt ASCII**
(er steht so im Code), **der angezeigte WERT bekommt den Umlaut.**

`[cmd]` **Gemessen am Schirm, nach der Aenderung:**

    Liste        "Hinzufügen"
    Substanzen   "Hinzufügen"
    Kopf         "Supplement hinzufügen"

### N5 — ein Knopf, nicht zwei

**Tom:** *,,dann erweitert gleich darunter derselbe button? dann
kann man es gleich weglassen"*

`[cmd]` **Gemessen: die Tafel klappt DIREKT unter ihrer Zeile
auf**, und die Zeile traegt den Knopf seit G-492/A1.

`[cmd]` **Der Knopf der Tafel ist weg.** `[read]` **Nicht der der
Zeile** — die Zeile ist der Ort, an dem man die Aktion sucht,
ohne aufzuklappen.

`[cmd]` **Mitgegangen sind `modalOffen`, `setModalOffen` und der
`ProduktAktionModal`-Block in der Tafel** — **erreichbar waren sie
nur ueber diesen Knopf.** `[read]` **Ein Zustand, den nichts mehr
setzen kann, ist kein Rueckfall, sondern eine Attrappe** (G-163).

`[cmd]` **Das Modal steht weiter — in `tab-produkte.tsx`**, am
Knopf der Zeile. **Ein Modal, ein Ort.**

`[read]` **Das Prop `aktion` bleibt** — die Substanz-Tafel braucht
es (A13/A14). **Es wird hier nur nicht belegt.**

### N4 — th.json ist der Sollzustand, kein Loch

`[cmd]` **`docs/ssot/88-i18n.md`, Tom am 2026-08-17:**

> *,,Englisch und Deutsch befuellen wir, Thai sehen wir vor und
> ziehen wir bei Bedarf nach."*

`[cmd]` **Die Tabelle dort nennt `th.json` = `{}` ausdruecklich
,,Sollzustand"**, und `tools/i18n-pruefen.mjs` fuehrt nur `de` und
`en` als Pflicht.

`[cmd]` **Und der Rueckfall greift:** mit `lumeos-sprache=th`
gemessen — **keine rohen Schluessel, deutscher Text.**
`[cmd]` **`request.ts` legt die deutschen Nachrichten unter jede
andere Sprache.**

`[read]` **Also gemeldet, nicht ergaenzt** — 135 Schluessel Thai zu
erfinden waere eine Entscheidung, die Tom schon getroffen hat.

### Zwei fremde Zusicherungen mussten nachziehen

`[cmd]` **G-492/A12** verlangte den Knopf in BEIDEN Reiterleisten.
`[read]` **N5 dreht das fuer die Produkt-Tafel um** — die
Zusicherung gilt jetzt fuer die Substanz-Tafel **und prueft
zusaetzlich, dass die Produkt-Tafel KEINEN traegt.** `[read]`
**Sonst kaeme der zweite Knopf still zurueck.**

`[cmd]` **G-493/A1** zaehlte die Tafel mit auf — **sie faellt aus
der Aufzaehlung**, mit Begruendung im Waechter.

`[cmd]` **Beide Sabotageproben danach erneut gelaufen:**
**G-492 16/16, G-493 11/11.**

### Ein Waechterfehler, den die Nacharbeit aufgedeckt hat

`[cmd]` **`supplier_product_id: eingabe.supplier_product_id` steht
DREIMAL in `stack-write.ts`**, seit G-489 zwei Planfunktionen
dazukamen. `[cmd]` **Die Sabotage am Stack-Insert blieb gruen** —
**die anderen beiden erfuellten die Zusicherung weiter.**

`[cmd]` **Jetzt prueft sie den INSERT in `stack_items`**, nicht den
blossen Text.

### Die Fotos

    x-g493n-anzeige.png       N2/N6: "Hinzufügen" in jeder Zeile,
                              "Supplement hinzufügen" im Kopf
    x-g493n-n5-ein-knopf.png  N5: Zeile mit Knopf, Tafel darunter
                              OHNE zweiten

### Neustart noetig?

`[cmd]` **JA — und diesmal ist er die halbe Behebung.**

`[read]` **`apps/web/messages/de.json` ist geaendert** (drei Werte
mit Umlaut), **und die Sprachdatei wird beim Start in ein
Servermodul uebersetzt.** `[cmd]` **Ohne Neustart zeigt der Schirm
weiter den alten Stand — samt des `hinzufuegenX` aus meiner
Sabotage.**

## Abnahme der Nacharbeit

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`de.json`: `Hinzufuegen` mit ue, kein `hinzufuegenX`
mehr.**

### Die Ursache war sein eigenes Werkzeug

> *,,Der String kam aus meinem eigenen `_g493-sabotage.mjs`,
das den Schluessel umbenannte und die Datei danach
wiederherstellte ? aber Next uebersetzt die Nachrichtendatei in
ein SERVERMODUL und haelt es je Prozess. Eine Sabotage gegen
eine zwischengespeicherte Datei UEBERLEBT die Wiederherstellung
und sieht dann aus wie ein Codefehler."*

`[cmd]` **Auf der Platte: 0 Treffer. In
`.next/server/_rsc_messages_de_json.js`: vorhanden, 15:43.**

`[read]` **Er hat den Fall HALBIERT statt weiter zu raten:
drei Schluessel desselben Raums, zwei loesen auf, einer
nicht.**

### Und warum seine erste Probe nicht rot werden konnte

> *,,Sie verglich die drei Knopftexte MITEINANDER. Gleichheit
ohne SOLL-Wert kann nicht rot werden."*

> *,,`i18n-pruefen.mjs` half auch nicht; es liest DATEIEN,
nicht den SCHIRM, und der Fehler sass genau dazwischen."*

`[cmd]` **N3: `_g493n-anzeige.mjs` nimmt den Sollwert aus
`de.json` und vergleicht ihn mit dem angezeigten Text,
Sabotage 4/4.**

### N6 war breiter als der Kopf

`[cmd]` **Vier deutsche Werte, DREI ohne Umlaut** ? **alle
berichtigt, der Schluessel bleibt ASCII.**

`[cmd]` **N5: der doppelte Knopf ist weg, samt seinem
unerreichbaren Modalzustand.**

`[cmd]` **N4: `th.json = {}` ist der dokumentierte Sollzustand
(Tom, 2026-08-17)** ? **Thai faellt auf deutschen Text zurueck,
nicht auf rohe Schluessel. Gemessen, nicht gefuellt.**

### Und ein echtes Waechterloch

> *,,`supplier_product_id: eingabe...` kommt seit G-489 DREIMAL
vor, der Schaden wurde vom Geschwister aufgefangen."*

**Abgenommen.**
