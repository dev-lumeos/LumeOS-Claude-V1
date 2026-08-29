---
nr: G-249
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
    - apps/web/src/app/v2/nutrition/naehrstoff-modal.tsx
    - apps/web/src/lib/nutrition/trend.ts
zahlen:
  gemessen: 2026-08-28
  mikro_ansicht_zeilen: 722
  ordnung_tab_zeilen: 518
  modal_zeilen: 368
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: ecc05083
---

# G-249 — zwei Ansichten zusammenfuehren und den Verlauf als Trend zeigen

## Befund

`[cmd]` **Der `nutrients`-Reiter rendert zwei Ansichten
uebereinander** (`ansicht.tsx`):

    <MikroAnsicht>            G-239/G-246/G-247, heute gebaut
    <NaehrstoffOrdnungTab>    G-101/C-54/G-121/G-122, aelter

`[read]` **Beide zeigen Naehrstoffe gegen Referenzwerte, beide haben
eigene Zeitfilter, und die Filter der oberen wirken nicht auf die
untere.** Kein Defekt — **die Folge davon, dass zweimal dasselbe
gebaut wurde.**

### Der Fehler ist meiner

`[read]` **Ich habe G-239 beauftragt, ohne zu pruefen, was im selben
Reiter schon steht.** Dann G-247 mit Zeitraeumen, **die die Ordnung
seit G-121 hat.** Dann G-246 mit Detailkacheln, **die das
Ordnungsmodal bereits zeigt.**

`[cmd]` **Toms Erinnerung an *,,1, 14, 30, 45, 90"* war exakt
richtig** — sie stand in der Ordnung, nicht in der neuen Ansicht.

### Was die Ordnung kann und die neue Ansicht nicht

    Baum ueber `parent_code`, auf jeder Ebene klappbar
    Klappzustand in `user_display_preferences` gespeichert
      (Datenbank, nicht Browser - "dieselbe Sicht am Telefon")
    Filter Alle / Auffaellig / Unter Ziel
    Suche ueber Name, Code, Beschwerde, Quelle
    sieben Zeitfenster: Heute · 7 · 14 · 30 · 45 · 60 · 90
    `nutrition_targets` - das persoenliche Ziel aus den Goals
    Modal mit wissenschaftlicher Referenz, Quelle, Zusammensetzung

### Was die neue Ansicht kann und die Ordnung nicht

    Verlauf mit drei Linien (G-247)
    Detailkacheln: `deficiency_de`, `excess_de`, `top_sources_de`,
      `rda_athlete_text` (G-246)
    Pillen als Filter mit Zaehlern (G-247)
    vier Zustaende inkl. "kein Richtwert" (G-239)

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, mit Nutzer und Zeitraum** (`CLAUDE.md`).
`[read]` **Und ein Waechter prueft die Wirkung, nicht das Wort** —
dreimal in Folge derselbe Fehler in deinen eigenen Waechtern.

### 1 · Zusammenfuehren

**Die Ordnung bleibt, die MikroAnsicht geht darin auf.**

`[read]` **Tom, 2026-08-28:** *,,ja klar so ist es nicht brauchbar und
der alte teil ist detailliert mit modal"*.

**Was aus der MikroAnsicht mitkommt:** die vier Zustaende, die Pillen
als Filter, die Detailkacheln, der Verlauf. **Was bleibt:** Baum,
Suche, Klappzustand, `nutrition_targets`, das Modal.

`[read]` **Miss zuerst, was doppelt ist** — die Pillen der oberen und
der Filter *,,Auffaellig"* der unteren koennten dasselbe meinen.
**Wenn ja: eine Fassung, nicht beide.**

**Das Modal bleibt vorerst ein Modal.** `[read]` Tom: *,,koennen wir
dann immer noch entscheiden ob wir einen view change bauen wollen
sprich dulldown anstatt modal"* — **eigene Entscheidung, nicht Teil
dieses Auftrags.**

### 2 · Der Verlauf wird ein Trend

`[read]` **Tom:** *,,haesslich und nicht was ein bodybuilder sehen
muss. es geht um trends und nicht einzelne tagesbalken. selbst wenn
mal tage fehlen kann man einen trend darstellen."*

**Recherchiert am 2026-08-28, drei Regeln aus der Fachliteratur:**

**Linie statt Balken.** Balken vergleichen Kategorien, Linien zeigen
Verlaeufe ueber die Zeit. `[read]` **Die heutige Balkenform aus G-247
war meine Vorgabe** — sie kam aus dem Gedanken, dass ein fehlender Tag
keine Null ist. **Das bleibt richtig, loest sich aber anders: ein
gleitender Mittelwert ueberbrueckt Luecken, ohne sie zu erfinden.**

**Nicht bei Null beginnen.** `[read]` Eine Nullbasis drueckt echte
Schwankungen zu einer flachen Linie zusammen. **Bei einem Naehrstoff,
der zwischen 839 und 8.396 ug schwankt, ist das der Unterschied
zwischen sichtbar und unsichtbar.**

**Gleiche Achsenskalierung ueber alle Zeilen**, wenn mehrere Verlaeufe
untereinander stehen — sonst sehen ungleiche Aenderungen gleich aus.

`[read]` **Und was ein Bodybuilder sehen muss:** nicht der einzelne
Tag, sondern **ob es steigt, faellt oder steht** — und wo es
gegenueber Ziel und Obergrenze liegt.

`[read]` **Die Fachliteratur nennt dafuer zwei Formen, die
zusammenpassen:** eine **Sparkline** in der Zeile fuer die Trendform,
und ein **Bullet-Balken** fuer Wert gegen Ziel gegen Obergrenze.
**Beides kompakt genug fuer eine Tabellenzeile mit 138 Eintraegen.**

**Bei 7 / 30 / 90 zeigen. Im Tagesmodus nicht** — ein Tag hat keinen
Trend.

### Was nicht zu tun ist

**Keine Referenzwerte aendern, keine Schwellen setzen.**
**Kein Dropdown statt Modal** — eigene Entscheidung.
**Keine Zeitfenster streichen** ohne zu sagen warum. `[cmd]` Die
Ordnung hat sieben, die MikroAnsicht vier. **Sag, welche bleiben.**
**Den gespeicherten Klappzustand nicht verlieren** — er liegt in
`user_display_preferences`, nicht im Browser.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Ansichten im Reiter          vorher 2, nachher 1
    Zeitfenster                  welche bleiben, begruendet
    Filter wirken durchgaengig   Pille + Suche + Zeitfenster
                                 zusammen - Bildschirmfoto
    Klappzustand                 ueberlebt einen Neuladen
    Trend statt Balken           Bildschirmfoto, 7/30/90
    Luecken                      ueberbrueckt, nicht als Null
    Achsen                       gleiche Skalierung je Gruppe
    Detailkacheln                unveraendert erreichbar
    Zeilen gesamt                vorher / nachher
    Ladezeit                     ms je Zeitfenster, kalt und warm

`[read]` **Die vorletzte Zeile ist die ehrlichste:** 722 + 518 + 368
Zeilen stehen heute im Reiter. **Wenn die Zusammenfuehrung mehr
ergibt, ist etwas schiefgelaufen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und **eine
Messung vor dem Neukompilieren zeigt alte Zahlen.**
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.
`[cmd]` **A-60:** keine `Map` ueber die Client-Grenze — sie kommt
leer an, ohne Fehler.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Der Reiter zeigt eine Ansicht statt zwei, und die Zeilen sind
weniger geworden** — 1.605 auf 946. **Der Trend ist eine Linie, und
die Gegenprobe zu E-24 traegt: bei Vitamin A laufen alle 90 Punkte
ueber der Ziellinie.**

`[cmd]` **Alle Zahlen gemessen am 2026-08-29, `dev@lumeos.app`,
Stichtag heute (2026-08-29), Fenster wie genannt.**

### 1 · Was doppelt war — zuerst gemessen

**Der Auftrag: *„Miss zuerst, was doppelt ist — die Pillen und der
Filter *Auffaellig* koennten dasselbe meinen."***

`[cmd]` **Sie meinen dasselbe, aber die Pillen sind feiner:**

    Ordnung (`Scope`)          MikroAnsicht (`Lage`)
    auffaellig = unter ODER    zu_wenig  +  zu_viel
                 ueber            (zwei getrennte Pillen)
    unter                      zu_wenig
    —                          gedeckt · im_bereich
    —                          unvollstaendig · ohne_referenz

`[cmd]` **Auf dev am Stichtag: 3 ueber der Obergrenze, 4 unter Ziel,
zusammen 7 „auffaellig"** — die Pillenzahlen und der Filter beziffern
denselben Bestand.

`[read]` **Entschieden: eine Fassung, und zwar die der Ordnung.**
`Auffaellig` ist genau die Vereinigung zweier Pillen, aber es filtert
den BAUM mit — Elternknoten auffaelliger Kinder bleiben stehen
(`kindTrifft`, die `hasChildOutOfRange`-Regel). **Die Pillen konnten
das nicht**, sie filterten eine flache Liste. **Was verloren geht:
die vier Zaehler in Pillenform.** Die Ordnung zeigt dieselben Zahlen
im Kopf, aber ohne Klick.

### Was die Zusammenfuehrung uebernommen hat — und was nicht

`[cmd]` **Der Reiter rendert jetzt nur `NaehrstoffOrdnungTab`.** Ein
Waechter zaehlt die Komponenten im `nutrients`-Zweig und faellt bei
mehr als einer.

**Mitgekommen:**

    Trend            neu als Sparkline (statt Balken, siehe Teil 2)
    Detailkacheln    `[cmd]` waren SCHON im Modal — deficiency,
                     excess, top_sources, rda_standard,
                     rda_athlete, upper_limit
    vier Zustaende   `[read]` NICHT uebernommen, siehe unten

**Nicht mitgekommen, mit Grund:**

`[read]` **Die vier Zustaende der MikroAnsicht** (`gedeckt`,
`im_bereich`, `unvollstaendig`, `ohne_referenz`) **sind nicht in die
Ordnung gewandert.** Sie stammen aus `daily_reference_assessment`;
die Ordnung bildet ihren `status` selbst aus Wert, Ziel und
Obergrenze — **und ihr Ziel ist ein anderes**, weil
`nutrition_targets` das persoenliche Makroziel vorzieht (G-143).
**Beide Systeme zu mischen haette zwei Wahrheiten in einer Zeile
ergeben.** `[read]` **Das ist ein Verlust und wird als solcher
gemeldet** — „kein Richtwert" als eigene Aussage (G-239, Regel 3)
steht heute nur noch im Modal.

### Die Zeitfenster: sieben bleiben

`[cmd]` **Die Ordnung hat sieben (1 · 7 · 14 · 30 · 45 · 60 · 90),
die MikroAnsicht hatte vier (1 · 7 · 30 · 90).**

`[read]` **Die sieben bleiben, alle.** Tom hat sie in G-249 selbst
erinnert (*„1, 14, 30, 45, 90"*), sie stehen seit G-121 in
`user_display_preferences`, **und ein Fenster zu streichen haette
gespeicherte Nutzerzustaende ungueltig gemacht.** Die vier der
MikroAnsicht sind eine Teilmenge — es geht nichts verloren.

### 2 · Der Trend

**Tom:** *„haesslich und nicht was ein bodybuilder sehen muss. es
geht um trends und nicht einzelne tagesbalken."*

`[cmd]` **Gebaut: eine Sparkline je Zeile, 64 x 18 Pixel**, daneben
ein Richtungszeichen. **Die drei Regeln sind umgesetzt und
gewaechtert:**

**Linie statt Balken.** `[cmd]` Ein gleitender Mittelwert
ueberbrueckt Luecken — Fensterbreite 3 (7 Tage), 7 (30), 14 (90).
`[read]` **Er erfindet keinen Tageswert**, er bildet den Nachbarwert:
ein Tag ohne Erfassung bekommt den Schnitt seiner Umgebung, ein Tag
ohne jeden Nachbarn bleibt leer.

**Nicht bei Null beginnen.** `[cmd]` Die Achse laeuft vom kleinsten
zum groessten dargestellten Wert. **Gemessen: eine Reihe um 1.000 mit
1 Prozent Schwankung ergibt eine Y-Spanne von 15,2 von 18 Pixeln** —
mit Nullbasis waeren es unter 0,2 gewesen.

**Gleiche Skalierung ueber die Zeilen.** `[read]` **Hier anders
geloest als in der Literatur** — die Naehrstoffe einer Gruppe mischen
µg und g, eine geteilte ABSOLUTE Achse waere unbrauchbar. **Geteilt
wird die RELATIVE Achse:** jede Zeile skaliert auf ihr eigenes Ziel,
und damit heisst dieselbe Hoehe ueberall „am Ziel". Ein Waechter
prueft, dass 50 von 100 und 5.000 von 10.000 denselben Anteil
ergeben.

`[cmd]` **Der Bullet-Balken existierte bereits** — `Spektrum` aus
G-122 zeigt Wert gegen Ziel gegen Obergrenze mit Zonen. **Nicht neu
gebaut, sondern die Sparkline danebengestellt.**

### Die Gegenprobe zu E-24

**Deine Bedingung: zeigt die Sparkline, was E-24 meint?**

`[cmd]` **Vitamin A, 90 Tage bis 2026-08-29** — deine Zahlen
nachgemessen: **Schnitt 3.057 µg, Spitze 8.396 µg, Grenze 3.000 µg,
42 von 90 Tagen darueber.**

`[cmd]` **Auf dem Schirm gemessen:**

    Punkte                     90
    Ziellinie im Bild          ja
    Punkte ueber der Linie     90 von 90
    Y-Spanne                   6,0 von 18 Pixeln
    Tooltip                    „gleichbleibend · 90 von 90 Tagen
                                mit Wert"

`[read]` **Die Linie laeuft durchgehend ueber der Ziellinie** — man
sieht auf einen Blick, dass hier dauerhaft und nicht nur an Spitzen
ueberschritten wird. **Das ist mehr, als zwei Zahlen sagen konnten.**

`[cmd]` **Und im Tagesmodus erscheint keine Sparkline** — gemessen 0.

### Der Befund, der die Sparkline fast unbrauchbar gemacht haette

`[cmd]` **Die erste Messung zeigte 8 Punkte statt 90 und eine
kerzengerade Linie.** `[read]` **Ursache: PostgREST deckelt bei 1.000
Zeilen — und `.limit(20000)` aendert daran nichts.**

`[cmd]` **Gemessen: 12.420 Zeilen angefragt (138 Naehrstoffe x 90
Tage), 1.000 zurueck, davon 8 fuer `VITA`, 8 verschiedene Tage.**
Weil nach `entry_date` sortiert wurde, kamen die ersten acht Tage
fuer ALLE Naehrstoffe — und fuer keinen mehr.

`[read]` **Dieselbe Falle wie G-64**, dort mit `.in()`. **Mein
Kommentar zitierte G-64 und der Code lief hinein.** `[cmd]` Behoben
durch seitenweises Laden (`.range()`, 1.000 je Seite, Abbruch bei
kurzer Seite, harte Grenze 20 Seiten). **Danach: 90 Punkte.**

### Der zweite Befund: ein Deckel, der nie greift

`[cmd]` **`Math.min(1, wert / max)` im Bullet war toter Code.** Da
`max` aus dem groessten der drei Werte gebildet wird, kann der Anteil
nie ueber 1/1,05 = **0,9524** steigen — **gemessen bei 5.000 wie bei
99.999 derselbe Wert.**

`[read]` **Entfernt.** Ein Deckel, der nie greift, taeuscht eine
Absicherung vor, die es nicht braucht — und eine Sabotageprobe
dagegen kann nie fallen.

### Nachweisliste

    Ansichten im Reiter    [cmd] vorher 2, nachher 1
    Zeitfenster            [cmd] sieben bleiben, begruendet
    Filter durchgaengig    [cmd] 42 Zeilen -> Auffaellig 42
                                 -> + Suche „vitamin" 29
    Klappzustand           [cmd] 23 offen vor, 23 nach dem Neuladen
    Trend statt Balken     [cmd] Sparkline, Bild g249-2/3
    Luecken                [cmd] gleitender Mittelwert, nicht Null
    Achsen                 [cmd] relativ zum Ziel, Waechter prueft es
    Detailkacheln          [cmd] unveraendert im Modal erreichbar
    Zeilen gesamt          [cmd] 1.605 -> 946
    Ladezeit               [cmd] siehe unten

`[cmd]` **Ladezeit je Fenster, angemeldet, kalt und warm:**

    Fenster    kalt      warm
         1    3.570     2.779
         7    3.551     2.907
        30    4.407     3.688
        90    6.434     5.786

`[read]` **Die 90 Tage kosten rund 3 Sekunden mehr als der Tag** —
das sind die dreizehn Seiten der Reihenabfrage. **Eine
Datenbankfunktion, die je Naehrstoff eine fertige Reihe liefert,
waere schneller; sie anzulegen ist Codex' Bereich.**

### Die Loeschung

**Freigegeben unter drei Bedingungen, alle drei belegt:**

`[cmd]` **1 · `rda_athlete_text` kommt an.** `naehrstoff-modal.tsx`
zeigt es (`:355`), `naehrstoff-detail-read.ts` laedt es (`:99`,
`:132`). **Daten: Niacin „Sportler 20mg" gegen „Standard 16mg (M),
14mg (F)"; Vitamin A „Standard".**

`[cmd]` **2 · Die Spanne ist sichtbar** — 90 Punkte, Ziellinie im
Bild, alle darueber. Siehe oben.

`[cmd]` **3 · Der Abdeckungssatz existiert**, in anderer Form: die
Ordnung nennt *„N Tage erfasst"* im Kopf (`:238`) und
*„13/14 Tg. vollst."* je Zeile (`:512`); die Sparkline traegt
*„90 von 90 Tagen mit Wert"* im Tooltip.

`[cmd]` **Geloescht, 1.467 Zeilen:**

    mikro-ansicht.tsx                    721
    mikro-zeitraum.ts                    257
    erklaertext-lage.ts                  158
    __tests__/mikro-zeitraum.test.ts     177
    __tests__/erklaertext-lage.test.ts   154

`[cmd]` **`mikro-lage.ts` bleibt** — `tageslage.ts` (C-48, Diary)
haengt daran.

### Zeilenbilanz

    vorher   mikro-ansicht  721
             ordnung-tab    517
             modal          367   = 1.605
    nachher  ordnung-tab    579   (+62 fuer die Sparkline)
             modal          367   =   946

    neu      trend.ts       234
             trend.test.ts  224   =   458  (serverfrei, mit Tests)
    weg      fuenf Dateien       = 1.467

`[read]` **Der Reiter ist um 659 Zeilen kleiner, obwohl er mehr
kann.** Die 458 neuen Zeilen sind serverfreie Logik mit Tests, keine
Oberflaeche — **unterm Strich 1.009 Zeilen weniger im Repo.**

### Waechter: zehn Sabotagen, zehn Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    die Luecke wird uebersprungen              faellt
    die Sparkline beginnt bei Null             faellt
    das Ziel faellt aus dem Bild               faellt
    der Bullet skaliert absolut                faellt
    die Skala kommt nicht aus den Werten       faellt
    die Richtung kommt aus den Endpunkten      faellt
    die Fensterbreite bleibt konstant          faellt
    der Trend erscheint im Tagesmodus          faellt
    die zweite Ansicht kommt zurueck           faellt
    die Sparkline faellt weg                   faellt

`[read]` **Fuenf davon hielten beim ersten Versuch NICHT** — meine
Waechter prueften wieder das Wort statt die Wirkung. **Was sie
durchliess und wie sie geschaerft wurden:**

    Ziel im Bild      prueste `0 <= y <= hoehe` — gilt auch ohne
                      Dehnung. Jetzt: der Pfad MUSS sich aendern.
    Richtung          prueste `!== 'faellt'` — eine Endpunktrechnung
                      liefert hier zufaellig `steigt`. Jetzt: zwei
                      Reihen mit gleichen Endpunkten, verschiedenen
                      Haelften.
    zweite Ansicht    suchte `<MikroAnsicht` — ein beliebiger anderer
                      Platzhalter kam durch. Jetzt: die Komponenten
                      im Zweig gezaehlt.
    Sparkline weg     suchte `sparklinePfad(` — steht auch in einer
                      Komponente, die niemand rendert. Jetzt: der
                      Einbau `<Sparkline k={k} fenster={fenster}`.
    Deckel            war gar nicht pruefbar — toter Code, siehe oben.

`[cmd]` **18 Tests in `trend.test.ts`, 230 im Nutrition-Modul
gruen**, Typecheck sauber, `serverimport-pruefen.mjs` 0 Treffer
(A-30), `encoding-pruefen.mjs` 20.589 Dateien sauber.

### Abgrenzung der Zahlen

`[read]` **Abgrenzung bei „Zeilen":** gezaehlt mit `wc -l` ueber die
im Reiter gerenderten Dateien. **Der Auftrag nennt 722/518/368, ich
messe 721/517/367** — die Differenz ist die letzte Zeile ohne
Zeilenumbruch, kein inhaltlicher Unterschied.

`[read]` **Abgrenzung bei „42 Zeilen":** die Zahl der `<tr>` in
`tbody` bei Fenster 90 **mit dem gespeicherten Filter des Nutzers**
— der stand bereits auf `auffaellig`, deshalb aendert der Klick
darauf nichts. Ohne gespeicherten Filter waeren es mehr.

`[read]` **Abgrenzung bei „Attrappen":** `schuss.mjs` meldet **1** auf
`?tab=nutrients` — dieselbe wie vorher, sie gehoert nicht zu diesem
Reiterinhalt.

### Was offen bleibt

`[read]` **Die vier Zustaende aus G-239** stehen nur noch im Modal.
**Ob die Ordnung sie in ihrer Statuslogik fuehren soll, ist eine
Entscheidung** — sie braeuchte eine zweite Wahrheit neben
`nutrition_targets`.

`[read]` **Eine Reihenfunktion in der Datenbank** wuerde die 90-Tage-
Ladezeit von 6,4 auf etwa 4 Sekunden bringen. **Codex' Bereich.**

**Das Modal bleibt Modal** — die Dropdown-Frage ist nicht Teil dieses
Auftrags.

**Nichts auf `dev` geschrieben, nicht committet.**

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Der Reiter zeigt eine Ansicht: 948 Zeilen** (Ordnung 580 +
Modal 368) **statt 1.605.** `[cmd]` **Die fuenf Dateien sind weg** —
`mikro-ansicht.tsx`, `mikro-zeitraum.ts`, `erklaertext-lage.ts` und
die zwei Tests.

`[read]` **Die Nachweiszeile geht auf, und das war der Punkt.**

### Die drei Bedingungen sind belegt

`[cmd]` **`rda_athlete_text` im Modal** — Niacin *,,Sportler 20 mg"*
gegen *,,Standard 16 mg"*. **Der Teil, den Tom ausdruecklich verlangt
hatte.**

`[cmd]` **Die Spanne ist sichtbar** — bei Vitamin A laufen alle 90
Punkte ueber der Ziellinie, und meine Zahlen sind nachgemessen:
Schnitt 3.057, Spitze 8.396, **42 von 90 Tagen ueber der Grenze.**

`[cmd]` **Der Abdeckungssatz in anderer Form** — *,,N Tage erfasst"*,
*,,13/14 Tg. vollst."*

`[read]` **Erst belegt, dann geloescht.** Genau die Reihenfolge, um
die ich gebeten hatte.

### Die Doppelung war exakt messbar

`[cmd]` ***Auffaellig* ist die Vereinigung zweier Pillen:** 3 ueber
UL + 4 unter Ziel = 7. `[read]` **Behalten wurde die
Ordnungsfassung, weil sie den Baum mitfiltert** — Eltern auffaelliger
Kinder bleiben stehen. **Die Pillen filterten eine flache Liste.**

`[read]` **Und die sieben Zeitfenster bleiben alle:** die vier der
MikroAnsicht sind eine Teilmenge, **und ein gestrichenes Fenster
haette gespeicherte Nutzerzustaende ungueltig gemacht.** Das hatte
ich nicht bedacht.

### Der Sparkline-Befund ist der wertvollste

`[cmd]` **Erste Messung: 8 Punkte statt 90, kerzengerade Linie.**
`[cmd]` **PostgREST deckelt bei 1.000 Zeilen, `.limit(20000)` aendert
daran nichts** — bei 12.420 angefragten Zeilen kamen die ersten acht
Tage fuer alle 138 Naehrstoffe.

`[read]` **Und der eigene Kommentar zitierte G-64, waehrend der Code
in dieselbe Falle lief.** `[read]` **Eine Warnung im Kommentar ist
kein Waechter** — dasselbe Muster wie der Merksatz in
`substanz-luecken.ts`.

`[cmd]` **Fuenf von zehn Waechtern hielten beim ersten Versuch
nicht** — wieder Wort statt Wirkung. `[cmd]` **Und einer war gar
nicht pruefbar:** `Math.min(1, wert/max)` ist toter Code, weil `max`
aus dem groessten Wert gebildet wird. **Entfernt statt repariert.**

### Ein Verlust, benannt statt versteckt

`[read]` **Die vier Zustaende aus G-239 sind nicht in die Ordnung
gewandert.** Sie stammen aus `daily_reference_assessment`, die Ordnung
bildet ihren Status aus `nutrition_targets` — **beides zu mischen
haette zwei Wahrheiten in einer Zeile ergeben.**

`[read]` ***,,Kein Richtwert"* als eigene Aussage steht jetzt nur noch
im Modal.** **Als G-250 angelegt** — ob die Ordnung die Zustaende
fuehren soll, ist eine Entscheidung.

### A-60 war mein Fehler

`[cmd]` **Der Punktewaechter stand rot**, weil A-60 auf die geloeschte
`mikro-ansicht.tsx` verwies. `[read]` **Meine Datei, nicht seine** —
und er hat sie richtigerweise nicht angefasst, sondern gemeldet.
**Nachgezogen: der Befund haengt am Muster, nicht an der Datei.**

**Abgenommen.**

