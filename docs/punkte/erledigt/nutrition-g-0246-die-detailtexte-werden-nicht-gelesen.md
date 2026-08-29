---
nr: G-246
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 8003800e
beruehrt:
  tabellen: [nutrition.nutrient_details, nutrition.nutrient_defs]
  dateien:
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-nutrition-nutrients.jsx
zahlen:
  gemessen: 2026-08-28
  detailzeilen: 110
  nutrient_defs: 138
  ohne_detailtext: 28
  function_de: 110
  deficiency_de: 110
  excess_de: 41
  top_sources_de: 110
---

# G-246 — die Detailtexte liegen in der Datenbank und werden nicht gelesen

## Berichtigung des urspruenglichen Befunds

`[read]` **Dieser Punkt sagte: *,,Im Bestand gibt es dafuer keine
Tabelle."*** `[cmd]` **Falsch.** `nutrition.nutrient_details`
existiert mit **110 Zeilen und 31 Spalten.**

`[read]` **Ich hatte den Satz aus einem Nebensatz in Claude Codes
G-239-Bericht uebernommen und nicht geprueft** — obwohl `SPEC_10`
`data/nutrientDetails.ts` unter *,,Statische Daten"* fuehrt und G-237
genau davon handelt.

## Was tatsaechlich da ist

`[cmd]` **Dreisprachig, je Naehrstoff:**

    function_de/en/th       was es ist und wofuer      110 gefuellt
    deficiency_de/en/th     was bei zu wenig           110
    excess_de/en/th         was bei zu viel             41
    top_sources_de/en/th    beste Quellen              110
    interactions_de/en/th   Wechselwirkungen
    tip_de/en/th            Hinweis
    detail_de/en/th         Langtext
    rda_standard_text       normale Tagesdosis
    rda_athlete_text        Tagesdosis fuer Sportler
    upper_limit_text        Obergrenze

`[cmd]` **Beispiel Vitamin A:**

    function      Sicht, Immunsystem, Haut
    deficiency    Nachtblindheit
    excess        Kopfschmerzen, Uebelkeit, Leberschaeden bei
                  chronischer Ueberdosierung
    rda_standard  900 ug (M), 700 ug (F)
    rda_athlete   Standard
    upper_limit   3000 ug
    sources       Leber, Karotten, Suesskartoffeln

`[cmd]` **Herkunft belegt je Zeile** — `source`, `source_path`, `raw`.

`[cmd]` **28 der 138 Naehrstoffe haben keinen Detailtext**, und **kein
Detailtext haengt in der Luft** (0 ohne `nutrient_defs`-Eintrag).

`[read]` **`excess_de` nur bei 41** — plausibel, weil nicht jeder
Naehrstoff eine sinnvolle Ueberdosierung hat. **Aber es gehoert
geprueft, ob 41 die richtigen sind.**

## Der Mockup zeigt dieselbe Gestalt

`[cmd]` **`module-nutrition-nutrients.jsx`, 891 Zeilen, fuehrt 79
Naehrstoffe** mit `what` / `def` / `tox` / `sources` — **alle 79
vollstaendig.**

`[read]` **Die Feldnamen unterscheiden sich, die Sache nicht:**
`what` ist `function_de`, `def` ist `deficiency_de`, `tox` ist
`excess_de`. **Dieselbe Klasse wie `LogDoseModal` gegen
`LogDoseFenster`.**

## Was zu bauen ist

**Die Kacheln im aufgeklappten Naehrstoff.** `[read]` **Keine
Entscheidung fehlt, keine Tabelle fehlt** — die Ansicht aus G-239
zeigt Werte und Referenzen, **die Erklaerung dazu liegt daneben
unbenutzt.**

`[read]` **Und `rda_athlete_text` ist der Teil, den ein Sportler
sucht** — eine eigene Angabe neben dem Normalwert.

## Verwandt

**C-210** — *,,Die 28 fehlenden Naehrstofftexte"*. `[cmd]` **Die Zahl
stimmt exakt mit den 28 ohne Detailtext ueberein.** `[read]`
**Derselbe Befund, unabhaengig zweimal gefunden.**

**G-237** (MIN-8 der Opus-Review) — `nutrientDetails.ts` als
statisches Array, `food_sources` veraltet. `[read]` **Der Bestand ist
inzwischen in der Datenbank; der Punkt ist vermutlich ueberholt.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, und du nennst Nutzer und Zeitraum
dazu.** `[cmd]` **Seit heute in `CLAUDE.md`:** zweimal an einem Tag
haben zwei Beteiligte verschiedene Zahlen fuer dieselbe Sache
gemeldet, **beide Male weil der Ausschnitt nicht genannt war.**
`[cmd]` **Fuenf Konten haben Tagesdaten** — `dev`, drei Seed-Konten,
`test-user`.

`[cmd]` **Der massgebliche Mockup ist
`module-nutrition-nutrients.jsx`** in
`docs/spezifikation/10-plattform/design-system/theme-v1/`, 891
Zeilen. **Er fuehrt 79 Naehrstoffe mit `what` / `def` / `tox` /
`sources`.**

`[read]` **Die Feldnamen unterscheiden sich von der Datenbank, die
Sache nicht:** `what` ist `function_de`, `def` ist `deficiency_de`,
`tox` ist `excess_de`. **Dieselbe Klasse wie `LogDoseModal` gegen
`LogDoseFenster`** — **pruef nach der Sache, nicht nach dem Namen.**

### Zu tun

**Die Detailkacheln im aufgeklappten Naehrstoff, aus
`nutrition.nutrient_details`.**

`[cmd]` **110 Zeilen, dreisprachig, gefuellt:**

    function_de       110    was es ist und wofuer
    deficiency_de     110    was bei zu wenig
    excess_de          41    was bei zu viel
    top_sources_de    110    beste Quellen
    rda_standard_text        normale Tagesdosis
    rda_athlete_text         Tagesdosis fuer Sportler
    upper_limit_text         Obergrenze
    interactions_de          Wechselwirkungen
    tip_de · detail_de       Hinweis und Langtext

`[read]` **`rda_athlete_text` ist der Teil, den ein Sportler sucht** —
eine eigene Angabe neben dem Normalwert. **Nicht weglassen.**

### Was zu messen ist, bevor gebaut wird

`[cmd]` **28 der 138 Naehrstoffe haben keinen Detailtext** — es sind
**27 Einzelfettsaeuren und `OLSAC`.** `[read]` **Sachlich harmlos:**
`F18:1CN9` braucht keinen Text ueber Mangelerscheinungen. **Aber die
Kachel darf nicht leer erscheinen** — dieselbe Unterscheidung wie
*begruendet leer* gegen *nicht bearbeitet* aus G-208.

`[cmd]` **`excess_de` nur bei 41 von 110.** `[read]` **Pruef, ob die
41 die richtigen sind** — ein Naehrstoff mit `UL` und ohne
Ueberdosierungstext ist eine Luecke, einer ohne `UL` nicht.

### Was nicht zu tun ist

**Keine Texte schreiben oder ergaenzen.** `[read]` **Was fehlt, wird
gemeldet, nicht gefuellt.**
**Keine Tabelle anlegen.**
**Die drei Sprachen nicht vermischen** — `_de` ist die Anzeige,
`_en`/`_th` bleiben liegen.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Kacheln je Naehrstoff        welche Felder, in welcher Ordnung
    ohne Detailtext              wie sieht die Ansicht aus
    ohne `excess_de`             unterscheidbar von "keine Gefahr"
    rda_athlete gegen standard   beide sichtbar
    Quelle je Naehrstoff         `source` erreichbar
    Attrappen im Reiter          vorher / nachher, am Schirm gezaehlt
    Ladezeit                     ms, kalt und warm getrennt
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[cmd]` **Attrappen am Schirm zaehlen, nicht im Quelltext** — A-59:
in `v2/supplements` stehen 89 Marken im Code und 24 auf dem Schirm.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und **eine
Messung im Browser vor dem Neukompilieren zeigt alte Zahlen** — das
hat dich in G-247 fast einen Fehlbefund gekostet.
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Die Kacheln stehen, mit allen zehn Feldern.** **Beide Messfragen
sind beantwortet, und beide haben einen Befund ergeben** — bei der
zweiten sogar einen, den der Auftrag nicht erwartet hat.

### Die Zahlen, mit Ausschnitt

`[cmd]` **Gemessen am 2026-08-29.** `[read]` **Der Bestand von
`nutrient_details` ist nutzerunabhaengig** — es gibt keine
`user_id`-Spalte, die Texte gelten fuer alle Konten. **Nutzer und
Zeitraum entfallen deshalb hier**; wo unten Tagesdaten vorkommen,
sind sie `dev@lumeos.app` am 2026-06-01.

    nutrition.nutrient_details    110 Zeilen, 31 Spalten
    nutrition.nutrient_defs       138 Codes
    ohne Detailtext                28

    function_de      110      top_sources_de   110
    deficiency_de    110      rda_standard     110
    excess_de         41      rda_athlete      110
    detail_de         97      upper_limit       17
    tip_de            85      source           110
    interactions_de   26

`[read]` **Drei Zahlen, die der Auftrag nicht nennt und die die
Anzeige praegen:** `interactions_de` steht nur bei **26**,
`upper_limit_text` bei **17**, `detail_de` bei **97**. **Die Kacheln
erscheinen deshalb einzeln, nicht als festes Raster.**

### Messfrage 1: wer sind die 28 ohne Detailtext?

`[cmd]` **Bestaetigt: 27 Einzelfettsaeuren und `OLSAC`.**

    F10:0  F12:0  F14:0  F14:1CN5  F15:0  F16:0  F16:1CN7  F17:0
    F18:0  F18:1CN7  F18:1CN9  F18:2C9T11  F18:3CN3  F18:3CN6
    F18:4CN3  F20:0  F20:1CN9  F20:2CN6  F20:3CN6  F20:4CN6
    F22:0  F22:1CN9  F22:5CN3  F24:0  F4:0  F6:0  F8:0     +  OLSAC

`[cmd]` **Kein Detailtext haengt in der Luft** — 0 Zeilen ohne
Eintrag in `nutrient_defs`.

`[read]` **Gebaut ist ein eigener Satz statt einer leeren Kachel:**
*„Für einzelne Fettsäuren gibt es keinen eigenen Erklärtext — sie
werden als Bestandteil des Fettprofils gemessen, nicht als Nährstoff
mit eigenem Bedarf."* **Fuer `OLSAC` steht der allgemeinere Satz mit
dem Zusatz *„Das ist keine Aussage über seine Bedeutung."***

`[cmd]` **Erkannt am Muster `^F\d`, nicht an einer Liste** — eine
Liste veraltet beim naechsten Import. Ein Waechter faellt, wenn
jemand sie einbaut.

### Messfrage 2: sind die 41 mit `excess_de` die richtigen?

**Der Auftrag gibt die Probe vor:** ein Naehrstoff mit `UL` und ohne
Ueberdosierungstext ist eine Luecke, einer ohne `UL` nicht.

`[cmd]` **17 Naehrstoffe fuehren ein `UL`. 15 davon haben
`excess_de`. Zwei fehlen:**

    FD      Fluorid                  UL 10.000 µg   (National Academies)
    FOLAC   Folsäure, synthetisch    UL  1.000 µg   (EFSA)

`[cmd]` **Umgekehrt tragen 26 einen `excess_de` OHNE `UL`** — kein
Fehler: ein Text ueber zu viel Koffein ist nuetzlich, auch wenn EFSA
keine Obergrenze fuehrt.

`[read]` **Antwort: die 41 sind bis auf zwei die richtigen.** **Die
zwei sind gemeldet, nicht gefuellt** — der Auftrag verbietet das
Schreiben von Texten ausdruecklich.

`[read]` **Gebaut sind drei Zustaende, nicht zwei:** Text da · keine
Obergrenze gefuehrt · Obergrenze ohne Text. `[cmd]` Der dritte ist
auf dem Schirm belegt (`backup/g246-3-fluorid.png`): *„Es gibt eine
Obergrenze, aber keinen Text dazu. Die Zahl steht oben bei den
Referenzen."*

`[read]` **Und der zweite Zustand sagt ausdruecklich, was er NICHT
heisst:** *„Für diesen Nährstoff ist keine Obergrenze hinterlegt. Das
heißt nicht, dass beliebig viel unbedenklich ist."* Ein Waechter
faellt, wenn daraus eine Entwarnung wird.

### Ein Befund, den der Auftrag nicht erwartet hat

`[cmd]` **`FD` traegt einen Detailtext, der nicht zu ihm gehoert.**

    nutrient_defs.name_de     Fluorid  (µg, Gruppe „Elemente")
    nutrient_details.function_de
                              „Trockenmassegehalt eines Lebensmittels"
    nutrient_details.deficiency_de
                              „Kein klinischer Mangel definiert"
    source_key                FD
    source_path               referenz/lumeos-2026/.../nutrientDetails.ts

`[read]` **Im Vorgaengerrepo bedeutete `FD` *dry matter* — in diesem
Schema ist `FD` Fluorid.** Beim Import ist die Zeile ueber den
gleichlautenden Schluessel am falschen Naehrstoff gelandet.

`[read]` **Dieselbe Klasse wie `CLD` gegen `CL` in G-239** — zwei
Codesysteme, ein Bezeichner. **Nicht korrigiert, nur gemeldet:** eine
Textkorrektur waere Datenpflege.

`[cmd]` **Die drei Fettsaeurezeilen sind der harmlose Gegenfall:**
`F18:2CN6` traegt `source_key = F18D2N6`, also den alten Code —
**dort hat die Uebersetzung funktioniert.**

### Die Kacheln

`[cmd]` **Gestalt aus dem Mockup uebernommen**
(`module-nutrition-nutrients.jsx:780-800`): zwei Karten *„Bei zu
wenig"* (bernstein) und *„Bei zu viel"* (rot) nebeneinander, darunter
die Quellen als nummerierte Liste.

`[cmd]` **Nach der Sache geprueft, nicht nach dem Namen:** `what` ist
`function_de`, `def` ist `deficiency_de`, `tox` ist `excess_de`.

**Die Ordnung:**

    Wofür            function_de
    Bei zu wenig     deficiency_de      ┐ nebeneinander
    Bei zu viel      excess_de          ┘
    Tagesdosis       rda_standard_text
    Sportler         rda_athlete_text   nur wenn eigener Wert
    Obergrenze       upper_limit_text
    Beste Quellen    top_sources_de     nummeriert
    Wechselwirkungen interactions_de
    Langtext         detail_de
    Hinweis          tip_de
    Erklärtext:      source             zuletzt

`[read]` **Die Funktion steht vor den Warnungen** — wer aufklappt,
will zuerst wissen, wofuer der Naehrstoff gut ist. Ein Waechter
prueft die Reihenfolge.

### `rda_athlete_text` — der Teil, den ein Sportler sucht

`[cmd]` **Er steht bei allen 110 Zeilen, aber oft als `Standard`.**
`[read]` **Dann ist er kein zweiter Wert, sondern die Auskunft, dass
es keinen gibt** — ihn danebenzustellen wie eine eigene Empfehlung
waere irrefuehrend.

`[cmd]` **Gebaut sind beide Faelle, auf dem Schirm belegt:**

    Vitamin A   Tagesdosis 900μg (M), 700μg (F)
                „Für Sportler gilt derselbe Wert."
    Niacin      Tagesdosis 16mg (M), 14mg (F)
                Sportler 20mg          <- eigene Angabe, hervorgehoben

### Zwei Fehlmessungen von mir, damit sie nicht als Befund gelten

`[read]` **Die erste war echt und ist behoben:** `getErklaertexte`
gab eine `Map` zurueck, und `mikro-ansicht.tsx` ist `'use client'`.
`[cmd]` **React serialisiert Props nach JSON — eine `Map` kommt dort
LEER an, ohne Fehler.** Der Rueckfallzweig rendete, die Kacheln
blieben stumm. **Behoben:** der Leseweg gibt ein Feld zurueck, die
Nachschlagetabelle entsteht im Client.

`[read]` **Die zweite war meine Messung, nicht der Code.** Mein
Pruefskript klappte jede Zeile wieder zu, bevor es `innerText` las —
und der Umlaut in *„Wofür"* war durch die Python-JS-Kette doppelt
maskiert. **Vier Laeufe meldeten „NEIN", wo alles stand.** `[cmd]`
Im DOM gemessen liegt es vollstaendig vor:

    Wofür            „Sicht, Immunsystem, Haut"
    Bei zu wenig     „Nachtblindheit"
    Bei zu viel      „Kopfschmerzen, Übelkeit, Leberschäden bei
                      chronischer Überdosierung"
    Tagesdosis       „900μg (M), 700μg (F)"
    Obergrenze       „3000μg"
    Beste Quellen    „01 Leber · 02 Karotten · 03 Süßkartoffeln"

`[read]` **Der Auftrag warnt vor der Messung vor dem Neukompilieren —
ich habe zusaetzlich gegen einen frisch gestarteten Server geprueft**
(die PID wechselte waehrend der Sitzung, G-205). **Der Stand blieb
gleich; es lag am Skript.**

### Nachweisliste

    Kacheln je Naehrstoff    [cmd] 11 Felder, Ordnung oben
    ohne Detailtext          [cmd] eigener Satz, Bild g246-4
    ohne excess_de           [cmd] drei Zustaende, Bild g246-3
    rda_athlete gegen std    [cmd] beide sichtbar, Bilder g246-1/2
    Quelle je Naehrstoff     [cmd] „Erklärtext: …" zuletzt
    Attrappen im Reiter      [cmd] 0 vorher, 0 nachher (am Schirm)
    Ladezeit                 [cmd] kalt 4.073 ms, warm 3.187 ms
    Bildschirmfoto           [cmd] vier Bilder

### Waechter: acht Sabotagen, acht Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    fehlender excess_de immer als Luecke gemeldet   faellt
    „keine Obergrenze" heisst „unbedenklich"        faellt
    „Standard" gilt als eigener Sportlerwert        faellt
    Fettsaeuren an einer Liste statt am Muster      faellt (2)
    der Satz sagt nicht mehr, warum                 faellt
    der Beleg wandert vor die Funktion              faellt
    der Sportlerwert faellt weg                     faellt
    die Abfrage laedt die englischen Felder         faellt

`[read]` **Der siebte fiel beim ersten Versuch NICHT.** Mein Waechter
suchte den Feldnamen im Text, und `void athletWertEigen` liess ihn
stehen. **Dieselbe Klasse wie in G-216 und G-247.** Jetzt wird der
Aufruf mit beiden Werten geprueft und ein festgenagelter Wert
verboten.

`[cmd]` **13 neue Tests, 239 im Nutrition-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.589 Dateien sauber.

### Abgrenzung der Zahlen

`[read]` **Abgrenzung bei „ohne Detailtext":** gezaehlt ueber
`nutrient_defs d` gegen `nutrient_details t` mit
`t.nutrient_code = d.code`. **Die Spalten heissen verschieden** —
`code` gegen `nutrient_code`. Mein erster Versuch mit `d.nutrient_code`
scheiterte an genau dieser Stelle.

`[read]` **Abgrenzung bei „17 mit UL":** `select distinct
nutrient_code from nutrient_reference_values where reference_kind='UL'`
— **nicht** `reference_direction='upper_limit'`. Die zweite Bedingung
faenge auch `ALAP` mit.

`[read]` **Abgrenzung bei „Attrappen":** `.v2-attrappe` im
gerenderten DOM (A-24, A-59). **0 vorher wie nachher** — der
Nutrients-Reiter trug schon vor diesem Auftrag keine.

### Was offen bleibt

`[read]` **Zwei Textluecken:** `excess_de` fuer `FD` und `FOLAC`,
beide mit `UL`. **Gemeldet, nicht gefuellt.**

`[read]` **Eine falsch zugeordnete Zeile:** `FD` traegt den Text fuer
*dry matter* aus dem Vorgaengerrepo. **Das ist keine Textluecke,
sondern eine Verwechslung beim Import** — und sie betrifft
moeglicherweise weitere Codes, die in beiden Systemen existieren mit
verschiedener Bedeutung. **Ein eigener Punkt.**

`[read]` **`_en` und `_th` bleiben liegen**, wie der Auftrag verlangt
— die Abfrage laedt sie nicht, ein Waechter prueft das.

**Keine Texte geschrieben, keine Tabelle angelegt, nichts auf `dev`
geschrieben, nicht committet.**

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Beide Messfragen exakt bestaetigt:**

    Naehrstoffe mit UL        17
    davon mit excess_de       15
    ohne                      FOLAC · FD

`[cmd]` **28 ohne Detailtext = 27 Einzelfettsaeuren + OLSAC**, keine
verwaiste Zeile.

`[read]` **Und statt einer leeren Kachel steht ein eigener Satz** —
fuer Fettsaeuren mit Begruendung (*,,Bestandteil des Fettprofils,
nicht Naehrstoff mit eigenem Bedarf"*), fuer OLSAC der allgemeinere
mit dem Zusatz, dass es keine Aussage ueber die Bedeutung ist.
`[read]` **Erkannt am Muster `^F\d`, nicht an einer Liste** — eine
neue Fettsaeure faellt damit von selbst richtig.

`[read]` **Drei Zustaende statt zwei**, und *,,keine Obergrenze"* sagt
ausdruecklich, dass es keine Entwarnung ist. **Dieselbe Sorgfalt wie
bei den vier Zustaenden aus G-239.**

`[cmd]` **`rda_athlete_text` in beiden Formen:** Vitamin A zeigt
*,,Fuer Sportler gilt derselbe Wert"*, Niacin den eigenen Wert 20 mg
gegen 16/14 mg hervorgehoben.

### Der FD-Fund ist ernster als gemeldet

`[cmd]` **`nutrient_defs.name_de` sagt *Fluorid*, Einheit ug.**
`[cmd]` **`nutrient_details.function_de` sagt *,,Trockenmassegehalt
eines Lebensmittels"*.**

`[read]` **Im Vorgaengerrepo hiess `FD` *dry matter*.** Beim Import
ist die Zeile ueber den gleichlautenden Schluessel am falschen
Naehrstoff gelandet — **dieselbe Klasse wie `CLD`/`CL` aus G-239, nur
mit Wirkung: wer auf Fluorid klickt, liest ueber Trockenmasse.**

`[read]` **Nicht korrigiert, sondern gemeldet — richtig.** **Die
Frage dahinter ist die wichtigere:** wenn ein Schluessel kollidieren
konnte, **wie viele andere sind es?** **Als C-336 angelegt.**

### Zwei Fehlmessungen, beide selbst benannt

`[cmd]` **Echt und behoben:** `getErklaertexte` gab eine `Map`
zurueck, aber `mikro-ansicht.tsx` ist `'use client'` — **React
serialisiert Props nach JSON, eine `Map` kommt leer an, ohne
Fehler.** `[read]` **Als A-60 angelegt** — das kann anderswo genauso
passieren.

`[read]` **Und die eigene:** vier Laeufe meldeten *,,NEIN"*, weil das
Pruefskript jede Zeile wieder zuklappte und der Umlaut doppelt
maskiert war. **Im DOM gemessen lag alles vor.** `[read]` **Gegen
einen frisch gestarteten Server gegengeprueft** — die Falle aus
G-247 ein zweites Mal umgangen.

`[cmd]` 13 neue Tests, 239 gruen, **0 Attrappen am Schirm, vorher wie
nachher.**

**Abgenommen.**

