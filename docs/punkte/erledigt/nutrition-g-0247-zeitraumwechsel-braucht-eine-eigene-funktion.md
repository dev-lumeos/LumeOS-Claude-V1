---
nr: G-247
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: E-24
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
beruehrt:
  dateien: [apps/web/public/mockup/features/nutrition/MacroDetail.js]
zahlen: null
---

# G-247 — der Zeitraumwechsel braucht eine eigene Funktion

## Befund

Aus G-239, Claude Code, 2026-08-28.

`[cmd]` **`nutrition.daily_reference_assessment(user_id, date)`
bewertet einen Tag.** `[read]` **Der Mockup fuehrt einen
Zeitraumwechsel Heute / 7d / 14d / 30d** — `MacroDetail.js` nennt ihn
im Kopf.

`[read]` **Ein Mittelwert ueber sieben Tage ist nicht die
Tagesbewertung siebenmal.** Bei einer Obergrenze zaehlt der
Einzeltag, bei einem Zielwert der Durchschnitt — **die Leserichtung
aus C-48 Regel 2 gilt auch hier, nur ueber die Zeit.**

`[read]` **Deshalb eine eigene Funktion und kein Schleifenaufruf.**

## Auftrag — Zeitraum und Filter

**Entschieden in `docs/entscheidungen/E-24`.** `[read]` **Lies sie
zuerst; sie ist die Vorgabe.**

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[cmd]` **Und der massgebliche Mockup fuer diesen Reiter ist
`module-nutrition-nutrients.jsx`** —
`docs/spezifikation/10-plattform/design-system/theme-v1/`, **54 KB,
die groesste Nutrition-Datei.** `[read]` **Ungelesen.** **NICHT der
`.js`-Ordner** — dort steht eine vereinfachte Fassung.

### 1 · Zeitraum 7 / 30 / 90

`[cmd]` **`daily_reference_assessment(user_id, date)` bewertet einen
Tag.** `[read]` **Ein Schnitt ueber sieben Tage ist nicht die
Tagesbewertung siebenmal** — die Mengen werden gemittelt, dann
bewertet, nicht umgekehrt.

`[read]` **Der Standard bleibt der Tag**, weil die Oberflaeche im
Tagesmodus laeuft. **7, 30 und 90 kommen dazu.**

`[cmd]` **Gebaut ist heute ueberall 14 Tage** — `insights-read.ts`,
`naehrstoff-detail-read.ts`. **Pruef, ob das bleibt oder mitwandert.**

### 2 · Ein Verlauf im Detail

**Im aufgeklappten Naehrstoff ein Verlauf ueber den gewaehlten
Zeitraum, mit Mittelwert, Zielwert und Obergrenze als Linien.**

`[read]` **Das ist C-48 Regel 2 als Bild.** Bei Vitamin A liegen beide
Referenzlinien im selben Diagramm — **der Verlauf ueber der einen,
unter der anderen.**

`[cmd]` **Die Form existiert als Attrappe:** *,,Calorie balance,
14 days"*, mit dem Vermerk *,,die Auswertung rechnet noch nicht ueber
`daily_summary`"*. **Hier rechnet sie darueber.**

`[read]` **Kleinster und groesster Wert stehen als Ausschlaege im
Verlauf** — mit dem Zusatz, wann sie waren. **Eine Ueberschreitung an
drei aufeinanderfolgenden Tagen sieht anders aus als drei
verstreute.**

`[read]` **Das ist der Kern der Entscheidung.** Der Schnitt zeigt die
Versorgung, **die Spanne zeigt, ob eine Ueberschreitung darin
verschwunden ist.** `[cmd]` Bei Niacin schwanken die Tageswerte
zwischen 20 und 80 mg — **im Schnitt sieht man davon nichts.**

`[read]` **Nur bei 7/30/90, nicht im Tagesmodus** — dort ist der Tag
die Spanne.

### 3 · Die Pillen werden Filter

`[cmd]` **Sie stehen bereits und zaehlen** (aus G-239): *4x ueber der
Obergrenze · 5x zu wenig · 26x gedeckt · 14x unvollstaendig · 89x kein
Richtwert*.

**Anwaehlbar machen. Erste Pille *alle*, vorausgewaehlt.**

`[read]` **Ein Zaehler, der nicht filtert, laesst den Nutzer die Liste
von Hand durchsuchen, obwohl das System die Antwort kennt.**

`[read]` **Und die Zahlen muessen sich mit dem Zeitraum aendern** —
*4x ueber der Obergrenze* gilt fuer heute; ueber 90 Tage ist es eine
andere Zahl.

### Was nicht zu tun ist

**Keine Referenzwerte aendern, keine Schwellen setzen.**
**Keine Tabelle anlegen** — Codex hat den Bereich.
**Nichts auf `dev@lumeos.app` schreiben.**
`[read]` **Und die Leserichtung aus C-48 Regel 2 gilt auch im
Zeitraum:** 80 Prozent eines `PRI` sind zu wenig, 80 Prozent eines
`UL` sind unbedenklich. **Der Schnitt aendert daran nichts.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Zeitraeume waehlbar          1 · 7 · 30 · 90
    Schnitt gegen Tag            unterscheidbar - Bildschirmfoto
    Verlauf im Detail            je Tag ein Punkt
    drei Linien                  Mittelwert, Zielwert, Obergrenze
    Verlauf nur bei 7/30/90      im Tagesmodus keiner
    Pillen filtern               je Pille, Zahl stimmt mit Liste
    Pille *alle*                 vorausgewaehlt
    Pillenzahlen je Zeitraum     aendern sich mit der Wahl
    Ladezeit                     ms je Zeitraum, kalt und warm
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[read]` **Gegenprobe:** einen Naehrstoff finden, dessen Schnitt
unter der Obergrenze liegt und dessen groesster Tag darueber.
`[read]` **Wenn es keinen gibt, sag das** — dann ist die Spanne
richtig gebaut und heute wirkungslos, und das ist ein Ergebnis.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Alle drei Teile stehen, und die Gegenprobe faellt aus** — es gibt
**zwei** Naehrstoffe, deren Schnitt unter der Obergrenze liegt und
deren groesster Tag darueber. Die Spanne ist also nicht nur richtig
gebaut, sondern heute schon wirksam.

### Die Quelle

`[cmd]` **`module-nutrition-nutrients.jsx` gelesen**, 890 Zeilen.
`[cmd]` **Zeile 485 fuehrt genau vier Stufen:**
`["today","7d","30d","90d"]`, mit `useState("today")` als Vorgabe
(Zeile 461) — **der Standard bleibt der Tag, wie der Auftrag sagt.**

`[cmd]` **Und Zeile 492 fuehrt die Filter:** `All`, `Out of range`,
`Deficient only`. `[read]` **Der Mockup bestaetigt damit beide
Teile** — Zeitraum und anwaehlbare Filter stehen dort nebeneinander.

`[read]` **Uebernommen:** vier Stufen, Vorgabe Tag, Filter mit
*alle* voran. **Nicht uebernommen:** die drei festen Filternamen des
Mockups — **die Pillen tragen hier die gemessenen Lagen** (aus
G-239), und die sind feiner als *out of range*.

### 1 · Der Zeitraum — erst mitteln, dann bewerten

`[read]` **Der Kern des Auftrags:** ein Schnitt ueber sieben Tage ist
nicht die Tagesbewertung siebenmal.

`[cmd]` **Der Unterschied ist messbar, und er ist gross.** Vitamin A
auf dev, 90 Tage bis 2026-06-01: **Schnitt 2.820 µg, groesster Tag
5.865 µg, Obergrenze 3.000 µg — 6 von 12 Tagen darueber, der Schnitt
darunter.**

`[read]` **Wer je Tag bewertet und die Urteile zaehlt, bekommt „an 6
von 12 Tagen ueber der Grenze". Wer erst mittelt, bekommt „im
Schnitt darunter". Beides ist wahr und heisst etwas anderes.**

`[cmd]` **Gebaut ist die zweite Reihenfolge**, wie der Auftrag
verlangt: die Mengen werden gemittelt, dann gegen die Referenz
bewertet.

**Und der Leseweg brauchte keine neue Datenbankfunktion.** `[cmd]`
`nutrition.daily_nutrient_summary_long` liefert die Tagesmengen je
Naehrstoff bereits — mit `value_complete` und `missing_count`.
`[read]` **Eine Schleife ueber `daily_reference_assessment` waere 90
Aufrufe fuer Referenzwerte gewesen, die sich nicht aendern.** `[cmd]`
Eine Abfrage ueber 90 Tage und alle 138 Naehrstoffe: **222 ms**
(`explain analyze`, 2026-08-28).

`[cmd]` **Die Referenzen kommen weiter aus
`daily_reference_assessment` fuer den Stichtag** — sie gelten fuer
die Person, nicht fuer den Tag.

### 2 · Der Verlauf mit drei Linien

**Nach dem Nachtrag gebaut: ein Diagramm, keine zwei Zahlen.**

`[cmd]` **Auf dem Schirm gemessen** (Vitamin A, 90 Tage,
`backup/g247-verlauf-vitamina.png`):

    Ueberschrift    „Verlauf · 90 Tage"
    Linien          Obergrenze · Zielwert · Mittelwert   (alle drei)
    Spanne          „Zwischen 9,6 µg (2026-05-25) und
                     5.865 µg (2026-05-20), aus 8 Tagen."
    Warnung         „Der Schnitt liegt unter der Obergrenze,
                     der höchste Tag darüber."
    Abdeckung       „8 von 90 Tagen tragen Daten."

`[read]` **Das ist C-48 Regel 2 als Bild** — beide Referenzlinien im
selben Diagramm, der Verlauf ueber der einen und unter der anderen.

`[read]` **Balken, nicht Linie:** ein Tag ohne Erfassung ist eine
Luecke, kein Nullpunkt. **Eine durchgezogene Linie muesste ihn
ueberbruecken und behauptete damit einen Wert.** Unvollstaendige Tage
stehen blasser.

`[cmd]` **Nur bei 7/30/90** — im Tagesmodus gemessen: kein Verlauf.
Ein Waechter faellt, wenn er dort erscheint.

### 3 · Die Pillen filtern — und die Zahlen wandern mit

`[cmd]` **Gemessen ueber alle vier Stufen** (dev, 2026-06-01):

    Heute     3× über der Obergrenze · 4× zu wenig · 28× gedeckt
              15× unvollständig · 88× kein Richtwert
    7 Tage    2× über der Obergrenze · 7× zu wenig · 26× gedeckt
    30 Tage   1× über der Obergrenze · 8× zu wenig · 25× gedeckt
    90 Tage   1× über der Obergrenze · 8× zu wenig · 25× gedeckt

`[read]` **Die Zahlen aendern sich mit dem Zeitraum, wie der Auftrag
verlangt** — und sie zeigen genau, was E-24 meint: **je laenger der
Zeitraum, desto weniger Ueberschreitungen und desto mehr
Unterversorgung.** Der Schnitt glaettet die Spitzen und legt die
Luecken frei.

`[cmd]` **Der Filter greift:** Klick auf *1× ueber der Obergrenze*
(90 Tage) → die Liste faellt von 138 auf einen Naehrstoff.

`[cmd]` **Die Pille *alle* steht voran und ist vorausgewaehlt.**

`[read]` **Als Knopf um die Pille, nicht als `onClick` auf ihr:**
`Pill` ist ein `<span>` aus `packages/ui` — ein Klickziel ohne Rolle
waere per Tastatur nicht erreichbar. **Das UI-Paket blieb
unangetastet**, `aria-pressed` sagt, was gewaehlt ist.

### Gegenprobe

**Der Auftrag: *„einen Naehrstoff finden, dessen Schnitt unter der
Obergrenze liegt und dessen groesster Tag darueber. Wenn es keinen
gibt, sag das."***

`[cmd]` **Es gibt zwei** (90 Tage bis 2026-06-01, gemessen gegen
`daily_reference_assessment`):

    Vitamin A   Schnitt 2.820 µg   Spitze 5.865 µg   Grenze 3.000
                6 von 12 Tagen darueber
    Mangan      Schnitt 7.650 µg   Spitze 12.794 µg  Grenze 11.000
                1 von 12 Tagen darueber

`[read]` **Die Spanne ist damit nicht nur richtig gebaut, sondern
heute wirksam.** Ohne sie waere Vitamin A im 90-Tage-Schnitt
unauffaellig — **obwohl die Haelfte der Tage ueber der Grenze lag.**

`[cmd]` **Und Niacin, der Fall aus E-24, bestaetigt sich:** die
Tageswerte schwanken zwischen **4,1 und 74,8 mg** gegen eine Grenze
von 35 mg. Der 7-Tage-Schnitt liegt bei 47,5 mg.

### Ein Befund, der gemeldet gehoert

`[cmd]` **Die Datenlage traegt 90 Tage nicht.** Auf dev beginnen die
Mahlzeiten am **2026-05-20**; ein 90-Tage-Fenster bis 2026-06-01
findet **13 Tage** — dieselbe Zahl wie das 30-Tage-Fenster. **Deshalb
sind die Pillenzahlen fuer 30 und 90 identisch.**

`[read]` **Die Beschriftung „90 Tage" waere dann eine Behauptung.**
**Gebaut ist deshalb ein Abdeckungssatz** — *„8 von 90 Tagen tragen
Daten"* —, statt das Fenster stillschweigend zu kuerzen. Ein
Waechter faellt, wenn er verschwindet.

`[cmd]` **Ab Juni wird es dicht:** Juni 30 Tage, Juli 31, August 31,
September 30, Oktober 31. **Wer den Zeitraum an einem spaeteren
Stichtag prueft, sieht volle Fenster.**

### Regel 1 wird im Zeitraum zur Regel

`[cmd]` **Ueber 90 Tage sind 973 von 1.794 Tageszeilen
unvollstaendig**, und **alle 138 Naehrstoffe** haben mindestens einen
solchen Tag.

`[read]` **Im Tagesmodus war das die Ausnahme, im Zeitraum ist es der
Normalfall.** Ein Schnitt, der ueber Luecken hinwegmittelt, ist
systematisch zu niedrig — **und zwar umso mehr, je laenger der
Zeitraum.** Deshalb steht je Naehrstoff, aus wie vielen Tagen der
Schnitt stammt und wie viele davon Luecken trugen.

### Nachweisliste

    Zeitraeume waehlbar     [cmd] 1 · 7 · 30 · 90, Vorgabe Tag
    Schnitt gegen Tag       [cmd] Pillenzahlen unterscheiden sich,
                                  Bilder g247-Heute/7/30/90
    Verlauf im Detail       [cmd] je Tag ein Balken
    drei Linien             [cmd] Obergrenze, Zielwert, Mittelwert
    Verlauf nur bei 7/30/90 [cmd] im Tagesmodus keiner
    Pillen filtern          [cmd] 138 -> 1 bei „über der Obergrenze"
    Pille „alle"            [cmd] voran, vorausgewaehlt
    Pillenzahlen je Zeitraum[cmd] 3 -> 2 -> 1 -> 1 über der Grenze
    Ladezeit                [cmd] kalt 4.711 ms, warm 3.463 ms
    Bildschirmfoto          [cmd] sieben Bilder

### Waechter: neun Sabotagen, neun Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    leere Tage als Null mitmitteln              faellt (2)
    die Spanne verschweigt den Tag              faellt
    die Spitze schlaegt auch beim Zielwert an   faellt
    die Obergrenze faellt aus der Skala         faellt
    Luecken verschweigen die Richtung           faellt
    ein kurzes Fenster wird als voll ausgegeben faellt
    der Standard ist nicht mehr der Tag         faellt
    der Verlauf erscheint im Tagesmodus         faellt
    die Pillen filtern nicht mehr               faellt

`[read]` **Der letzte fiel beim ersten Versuch NICHT** — mein
Waechter pruefte, ob `setFilter` im Text steht, und eine Sabotage,
die es zur leeren Funktion machte, kam durch. **Dieselbe Klasse wie
in G-216.** Jetzt wird die WIRKUNG geprueft: der Zustand muss
veraenderbar sein UND die Liste danach geschnitten werden.

`[cmd]` **15 neue Tests, 227 im Nutrition-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.583 Dateien sauber.

### Was ich am Bestand geaendert habe

    neu   lib/nutrition/mikro-zeitraum.ts        serverfrei
    neu   lib/nutrition/__tests__/…              15 Tests
    erg.  lib/nutrition/reference-assessment-read.ts  Zeitraum-Leseweg
    erg.  lib/nutrition/mikro-lage.ts            `gruppiere` generisch
    ger.  app/v2/nutrition/mikro-ansicht.tsx     Zeitraum, Filter, Verlauf
    ger.  app/v2/nutrition/{page,ansicht}.tsx    Daten durchgereicht

`[read]` **`gruppiere` wurde generisch**, damit es die Spanne nicht
abschneidet — vorher gab es den Grundtyp zurueck und verlor das
zusaetzliche Feld. **Kein Verhalten geaendert, nur der Typ.**

`[cmd]` **Die 14 Tage im Bestand bleiben.**
`naehrstoff-detail-read.ts` laedt weiter 14 Tage fuer seinen eigenen
Trend — **der Auftrag fragt, ob das mitwandert: es tut es nicht, und
das ist bewusst.** Der Detailtrend gehoert zu einem anderen Reiter
(`naehrstoff-modal`), hat eine eigene Quelle und war nicht im
Zuschnitt. **Wer beide vereinheitlichen will, braucht einen eigenen
Punkt.**

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank und den laufenden Dev-Server, Stichtag
**2026-06-01**.

`[read]` **Abgrenzung bei „Schnitt":** Mittelwert der **Tage mit
Wert**, nicht Summe geteilt durch Fensterlaenge. **Ein Tag ohne
Erfassung zaehlt weder im Zaehler noch im Nenner** — er ist keine
Null (C-48, G-239).

`[read]` **Abgrenzung bei den Pillenzahlen:** gezaehlt werden
**Naehrstoffe nach Zusammenfassung** (138), nicht Zeilen der
Bewertungsfunktion (154). Die Differenz sind die zweiten Referenzen
der Naehrstoffe mit Zielwert **und** Obergrenze.

`[read]` **Abgrenzung bei „Gegenprobe":** gemessen ueber
`daily_reference_assessment` je Tag, gefiltert auf
`reference_direction = 'upper_limit'`, Bedingung
`avg <= grenze AND max > grenze`. **Ohne diesen Filter waere jeder
Naehrstoff mit schwankendem Zielwert mitgezaehlt worden.**

`[read]` **Eine Fehlmessung im ersten Lauf, damit sie nicht als
Befund missverstanden wird:** die erste Bildschirmmessung zeigte fuer
7d und 30d dieselben Zahlen wie fuer heute und eine Spanne bis
2026-06-02. **Der Dev-Server hatte noch nicht neu uebersetzt.** Nach
dem zweiten Lauf stimmten alle Werte; die Zahlen oben stammen aus dem
zweiten Lauf.

**Keine Referenzwerte geaendert, keine Tabelle angelegt, nichts auf
`dev` geschrieben, nicht committet.**

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Die Gegenprobe faellt aus, und staerker als berichtet.**
Auf `dev@lumeos.app`, letzte 90 Tage:

    Vitamin A   Schnitt 3.042 ug · Spitze 8.396 ug · Grenze 3.000 ug
                42 von 90 Tagen darueber

`[read]` **Im Schnitt liegt Vitamin A knapp ueber der Grenze, in fast
der Haelfte der Tage deutlich.** **Ohne die Spanne waere das
unsichtbar** — genau der Fall, fuer den E-24 existiert.

`[cmd]` **Die Pillenzahlen wandern wie vorgesehen:** 3x ueber der
Obergrenze heute, 2x bei 7 Tagen, 1x bei 30 und 90 — **dafuer steigt
*zu wenig* von 4 auf 8.** `[read]` **Der Schnitt glaettet die
Spitzen und legt die Luecken frei.**

`[read]` **Balken statt Linie ist die richtige Wahl:** *,,ein Tag ohne
Erfassung ist eine Luecke, keine Null, und eine durchgezogene Linie
muesste ihn ueberbruecken."*

`[cmd]` **Neunte Sabotage fiel erst nach Korrektur am eigenen
Waechter** — er prueft jetzt, ob die Liste geschnitten wird, nicht ob
`setFilter` im Text steht. **Dieselbe Klasse wie in G-216, wieder
selbst gefunden.**

### Die Zahlen sind nicht vergleichbar, zum zweiten Mal heute

`[cmd]` **Fuenf Nutzer haben Tagesdaten:**

    dev@lumeos.app          181 Tage   2026-05-20 bis 2026-11-16
    tom.seed@example.com    181
    sarah.seed@example.com  181
    max.seed@example.com    180
    test-user@lumeos.local    1        2026-08-16

`[cmd]` **724 Tageszeilen gesamt** — der Bericht nennt 1.794.
`[cmd]` **`vita_missing` ist auf `dev` 0 von 181**, der Bericht nennt
973 von 1.794 unvollstaendig. `[cmd]` **Und das 90-Tage-Fenster
traegt auf `dev` 90 von 90 Tagen**, nicht 13.

`[read]` **Nicht die Daten weichen ab, sondern der gemessene
Ausschnitt.** **Als Regel in `CLAUDE.md` nachgetragen:** jede Messung
nennt Nutzer und Zeitraum.

**Abgenommen.**

