---
nr: C-177
typ: messung
modul: nutrition
schwere: hoch
angelegt: 2026-08-20
braucht: []
kind_von: C-165
kinder: []
entscheidung: E-36
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/components/shell/sprachwahl.tsx
zahlen: null
---

# C-177 - Thai-Aliase fehlen bewusst

## Befund

(neu 2026-08-20). Rest aus
  C-165.

  `[cmd]` **0 Thai-Zeilen** — *„ohne Sprecher oder Quelle waere jede
  Zeile erfunden."*

  `[read]` **Richtig entschieden.** `[cmd]` **Die 138 `name_th` sind
  da**, die Umgangsnamen nicht. **Tom lebt in Thailand** — er kann sie
  liefern oder pruefen.

## Auftrag

**Mitbeauftragt mit C-120 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

Weiter offen: [C-120 - Messbericht](nutrition-c-0120-drei-sperren-in-food-search.md#2026-08-30---c-120-c-191-c-27-und-c-177-nachgemessen).
E-16 betrifft keine Thai-Abschaltung; die laufende Sprachwahl enthaelt TH,
waehrend die Datenbank weiter 0 Thai-Aliase hat.

## Neu gemessen, 2026-08-30

**Aus C-120, Codex.**

`[cmd]` **E-16 betrifft Thai nicht** — die Entscheidung galt einer
anderen Sache.

`[cmd]` **TH ist im heutigen UI auswaehlbar. Die Datenbank hat 0
Thai-Aliase**, bei 32.845 Aliassen insgesamt.

`[read]` **Damit ist *bewusst fehlend* keine gueltige Beschreibung
mehr.** **Die Sprache laesst sich waehlen, und die Suche findet
nichts** — **das ist eine Zusage ohne Deckung.**

## Zwei Wege

`[read]` **Thai in der Sprachwahl abschalten, bis Aliase da sind.**
**Oder Aliase beschaffen.**

`[cmd]` **BLS 4.0 ist die einzige Lebensmittelquelle (E-03)** und
fuehrt keine thailaendischen Namen. `[read]` **Woher sie kaemen, ist
offen** — und das ist die eigentliche Frage.

`[read]` **Tom sitzt in Thailand, und TH ist eine der drei
Zielsprachen.** **Deshalb `schwere: hoch` statt `mittel`.**

## Auftrag — der Hinweis fuer noch nicht Gebautes

**Entschieden in `docs/entscheidungen/E-36`.** `[read]` **Vorbereitet
am 2026-08-30.**

### Die Entscheidung

Tom, 2026-08-30: *,,lassen wir die sprachauswahl aber setzen ein modal
darueber wenn es gewaehlt wird mit *noch nicht entwickelt* oder
sowas"*.

**Die Sprachauswahl bleibt. Wer TH waehlt, bekommt einen Hinweis.**

### Der Baustein existiert bereits

`[cmd]` **`packages/ui/src/in-entwicklung.tsx`, genutzt in 39
Dateien** quer durch alle v2-Module.

    <InEntwicklung titel grund? onClose />

`[cmd]` **Und `grund` ist optional** — *,,Woran es haengt. Ohne
Angabe bleibt es beim allgemeinen Satz."*

`[read]` **Damit ist nichts zu bauen. Nur ein weiterer Aufrufer.**

`[read]` **Ich hatte im Auftrag geschrieben, es gebe die Bauform
nicht.** `[cmd]` **Falsch** — ich habe nach *,,noch nicht
entwickelt"* gesucht, **der Baustein schreibt *,,in Entwicklung"*.**

### Was der `grund` sagen muss

`[cmd]` **Bei Thai: die Aliase fehlen, und woher sie kaemen ist
offen** — BLS 4.0 fuehrt keine thailaendischen Namen (E-03).

`[read]` **Das ist etwas anderes als *,,noch nicht gebaut"*** — **es
ist eine Datenfrage, keine Bauzeitfrage.** **Der Satz sollte das
tragen.**

### Was nicht zu tun ist

**Die Sprachauswahl nicht entfernen.**
**Den alten Routenbaum nicht anfassen.**
**Keine Thai-Aliase erfinden.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    TH waehlbar               unveraendert
    Hinweis erscheint         Bildschirmfoto
    DE und EN                 unveraendert - belegt
    Bauform                   an einem zweiten Ort einsetzbar?
                              gezeigt oder begruendet
    Attrappen                 am Schirm, vorher / nachher

`[read]` **Die vorletzte Zeile entscheidet, ob es eine Bauform ist
oder ein Sonderfall.**

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt mit C-353; beide Teile
stehen hier. Nichts committet, nichts gestaged, nichts auf `dev`
geschrieben.

### Zwei Praemissen des Auftrags sind gefallen

**1. „Die 138 `name_th` sind da" (Befund, Zeile 29) — nein, 0.**

`[cmd]` Gemessen am 2026-08-30 gegen die laufende Datenbank:

    nutrient_defs.name_th    0 von 138 gefuellt
    foods.name_th            0 von 7.140 gefuellt
    food_aliases gesamt      32.845 Zeilen
      davon lang = 'de'      25.705
      davon lang = 'en'       7.140
      davon lang = 'th'           0

`[read]` **Nicht nur die Umgangsnamen fehlen — die kanonischen Namen
auch.** Der Befund trennte beides; die Trennung existiert heute nicht.
Das aendert die Sache nicht, macht sie aber groesser: es gibt keinen
einzigen thailaendischen Lebensmittelnamen im System.

**2. „genutzt in 39 Dateien" (Zeile 83) — 135 Aufrufe.**

`[cmd]` `git grep -c -E '<InEntwicklung(Knopf)?[ >]' -- apps/ packages/`
ergibt **135** ueber `apps/` und `packages/`. 39 ist vermutlich die Zahl
der *Dateien* einer Variante, nicht die der Aufrufe. Fuer den Auftrag
folgenlos — die Zahl steht im Waechter richtig.

### Was gebaut wurde

`apps/web/src/components/shell/sprachwahl.tsx` — ein weiterer Aufrufer,
kein neues Modal:

    if (s === 'th') setHinweis(true)

`[read]` **Erst setzen, dann hinweisen.** Der Hinweis steht *nach*
`document.cookie = …`, nicht davor. Ein Hinweis davor waere eine
Rueckfrage („willst du wirklich?"), und die hat Tom nicht verlangt —
er sagte *„lassen wir die sprachauswahl"*. `[cmd]` Belegt: nach der
Wahl steht `lumeos-sprache=th`, die Kopfzeile zeigt **TH**, die
Oberflaeche uebersetzt sich.

### Der Baustein trug den Fall nicht — eine Zeile fehlte

`[cmd]` **Der erste Durchgang war fertig und zeigte einen falschen
Satz.** Der Baustein schreibt unbedingt:

> *„Diese Flaeche stammt aus dem Entwurf und ist noch nicht angebunden.
> Der Knopf steht hier, damit das Gesamtbild vollstaendig ist — **er tut
> noch nichts**."*

`[read]` **Bei Thai stimmt das nicht.** Die Wahl *tut* etwas: Cookie
gesetzt, Oberflaeche uebersetzt. Ungedeckt ist allein die
Lebensmittelsuche. Der Standardsatz haette der Messung widersprochen,
die diesen Auftrag ausgeloest hat.

**Deshalb ein Prop statt eines zweiten Modals:** `teilweise?: boolean`,
Standard `false`.

    {!teilweise && (<p>… er tut noch nichts.</p>)}
    <Pill variant="warn">{teilweise ? 'teilweise gedeckt' : 'in Entwicklung'}</Pill>

`[cmd]` **134 der 135 Aufrufe bleiben unveraendert** — nur der aus
C-177 setzt das Prop. Gegengeprueft: `git grep teilweise` findet in
`apps/`/`packages/` genau eine Aufrufstelle (der Rest sind Synonymlisten
und `tageslage.ts`).

### Nachweis

    TH waehlbar        unveraendert - Liste zeigt
                       ["DE Deutsch","EN Englisch","TH Thai"]
    Hinweis erscheint  backup/c177-3-th-hinweis.png
                       Kopfzeile zeigt TH, Pille "teilweise gedeckt"
    DE unveraendert    nach Wahl: 0 Modale sichtbar
    EN unveraendert    nach Wahl: 0 Modale sichtbar
                       backup/c177-2-en-ohne-hinweis.png
    Attrappen          vorher 5, nachher 5 (Tagebuch, dev@lumeos.app)
                       der Hinweis erzeugt keine
    Schliessen         danach 0 Modale; Sprache bleibt gesetzt

`[cmd]` Alle Messungen: `dev@lumeos.app`, 2026-08-30, angemeldet,
1600x1000. Der Lauf setzt am Ende auf `de` zurueck — belegt.

### Bauform oder Sonderfall — die vorletzte Zeile

**Bauform, und der zweite Ort ist bereits gebaut.**

`[cmd]` **Der Baustein steht seit heute an 135 Stellen und ist der
zweite Ort im Wortsinn nicht** — er *ist* die Bauform, C-177 nutzt sie
nur. Die Frage lautet richtig gestellt: **traegt das neue `teilweise`
mehr als einen Fall?**

`[read]` **Ja, und der Bedarf ist im Repo belegt.** Es trennt zwei
Zustaende, die vorher denselben Text bekamen:

    "in Entwicklung"     der Knopf tut nichts        134 Aufrufe
    "teilweise gedeckt"  die Sache wirkt, aber die     1 Aufruf
                         Datenschicht ist unvollstaendig

`[cmd]` **Kandidaten fuer den zweiten Aufruf liegen sichtbar auf dem
Bildschirmfoto**: „Bei 73 von 138 Naehrstoffen fehlen einzelne
Positionen", „Schaetzung ist keine Messung — belegt wird…",
`Ballaststoffe 1 ohne Wert`. `[read]` **Das sind dieselbe Sorte
Aussage** — es funktioniert, die Deckung ist unvollstaendig. **Nicht
angebunden, weil der Auftrag es nicht verlangt** und weil jeder dieser
Faelle eine eigene gemessene Begruendung braucht.

### Waechter und Sabotageprobe

Sieben Waechter in
`apps/web/src/lib/nutrition/__tests__/sprachhinweis.test.ts`.
**Sechs Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256):**

    faellt   TH aus der Sprachliste entfernen
    faellt   den Hinweis nicht mehr setzen
    faellt   Thai vor dem Setzen abfangen (if (s==='th') return)
    faellt   den Baustein durch ein eigenes Modal ersetzen
    faellt   die gemessene Zahl aus dem Grund nehmen
    faellt   die Quelle (BLS 4.0) aus dem Grund nehmen

`[cmd]` **Zwei Zwischenstaende waren falsch und sind korrigiert** —
beide der bekannten Sorte:

**a) Der Waechter fand den Namen im eigenen Kommentar (G-186).** Der
Grund-Waechter las die Datei roh; `BLS 4.0` steht auch im Kommentar
ueber der Konstante. Sabotiert war die Konstante, gruen blieb er wegen
des Kommentars. **Behoben:** liest `ohneKommentare`.

**b) Eine Sabotage lief nicht.** `.replace('BLS 4.0 ist', …, 1)` traf
die gleichlautende Stelle im Kommentar *darueber* und liess die
Konstante unberuehrt. `[read]` **Das ist die dritte Ursache aus der
Regel — nicht schwacher Waechter, nicht toter Code, sondern eine
Sabotage, die nie ankam.** Aufgefallen nur, weil sie „ueberlebte".
**Behoben:** Anker mit Umgebung (`sondern der Quelle: BLS 4.0 ist `).

### Laeufe

    pnpm --filter @lumeos/web test    1027 pass, 0 fail  (vorher 1020)
    turbo typecheck web + ui          2/2 gruen
    node tools/encoding-pruefen.mjs   20.519 Dateien sauber
                                      (16 BOM, alle vorbestehend,
                                       keine davon aus C-177)
    pnpm gate                         11/11 Tasks gruen

---

## C-353 — woher die Zeit kommt

**Mitbeauftragt.** Der Auftrag: *„Nicht optimieren — erklaeren."*

### Die Praemisse traegt nicht: es sind zwei verschiedene Reiter

`[cmd]` **6.898 ms war der Nutrition-Reiter `nutrients` bei
`fenster=90`. 2.993 ms war der Supplements-Reiter `today`** — aus der
G-275-Berichtszeile *„Ladezeit | today **2.993 / 2.531 ms**, intel
**2.889 / 2.500 ms**"*.

`[cmd]` Heute, warm, `dev@lumeos.app`, 2026-08-30:

    nutrition nutrients fenster=90    6.730 ms
    supplements today                 2.447 ms
    supplements intel                 2.371 ms

`[read]` **Die 3.900 ms sind kein Gewinn, sondern der Abstand zwischen
zwei Reitern.** Der Nutrients-Reiter ist nie von 6.898 auf 2.993
gefallen — er steht heute bei 6.730. **Damit ist die Frage „was hat die
3.900 ms gebracht" gegenstandslos**; es gibt nichts zu erklaeren, was
verschwunden waere.

`[read]` **Derselbe Fehler wie in G-245/G-70:** beide Zahlen richtig
gemessen, die falsche verwendet.

### Was den Reiter langsam macht — vollstaendig aufgeteilt

`[cmd]` Die eigentliche Frage ist damit: **woher kommen die 6.730 ms?**
Gemessen je Fenster, `dev@lumeos.app`, 2026-08-30, warm (zweiter Lauf,
gleiche Sitzung):

    Fenster  Reiter   Datenbank   HTML     Rest
      1      2.775 ms     10 ms   164 kB   2.765 ms
      7      3.223 ms    381 ms   216 kB   2.842 ms
     30      3.972 ms    871 ms   351 kB   3.101 ms
     90      6.730 ms  2.158 ms   700 kB   4.572 ms

Die Datenbankanteile einzeln (`explain analyze`, Median aus 3):

    Fenster   summary_window   flags    Reihenabfrage
      1            10 ms         0 ms         0 ms
      7            15 ms       155 ms       211 ms
     30            37 ms       617 ms       217 ms
     90            88 ms     1.840 ms       230 ms

**Die Rechnung fuer 90 gegen 1 Tag: 3.955 ms mehr.**

    Datenbank                        2.148 ms   (54 %)
      davon reference_assessment_
      window_flags                   1.840 ms
    HTML-Aufbau und -Uebertragung  ~1.620 ms   (41 %)
      536 kB mehr, rund 3,0 ms je kB
                                   ─────────
                                    ~3.770 ms von 3.955 ms

`[read]` **Damit ist die Zeit erklaert, nicht nur benannt.** Zwei
Ursachen, beide gemessen, keine geraten.

### Was ausgeschlossen wurde

`[cmd]` **Die Zeilenzahl allein ist es nicht.** Die Reihenabfrage holt
966 / 4.140 / 12.420 Zeilen (1 / 5 / 13 Seiten gegen den
1.000-Zeilen-Deckel) und braucht **konstant rund 220 ms** — seit G-252
laufen die Seiten parallel. **Der Deckel kostet hier nichts mehr.**

`[cmd]` **Die Menge sichtbarer Zeilen ist es auch nicht.** `tbody tr`
bleibt bei **17**, in jedem Fenster. Was waechst, ist nicht die Tabelle.

`[cmd]` **Es ist die Sparkline.** Die SVG-Pfade tragen 90 Punkte statt
einem; die HTML-Antwort waechst von 164 auf 700 kB, waehrend die Zahl
der Pfade bei 102 stehenbleibt. **Mehr Punkte je Pfad, nicht mehr
Pfade.**

`[read]` **Offen bleibt die Aufteilung innerhalb der 1.620 ms** —
wieviel davon serverseitiges Rendern ist und wieviel Uebertragung plus
Parsen im Browser, ist nicht getrennt gemessen. **Der Betrag ist
belegt, seine innere Aufteilung nicht.**

### Kein Vorschlag

`[read]` Der Auftrag verlangt keine Optimierung, und ich lege keine
vor. **Zwei Stellen sind benannt und messbar**
(`reference_assessment_window_flags` mit 1.840 ms; 536 kB Pfaddaten);
was daraus folgt, ist eine Entscheidung, keine Messung.

### Dateien

    apps/web/src/components/shell/sprachwahl.tsx          geaendert
    packages/ui/src/in-entwicklung.tsx                    geaendert
    apps/web/src/lib/nutrition/__tests__/
      sprachhinweis.test.ts                               neu
    backup/c177-1-liste.png                               Nachweis
    backup/c177-2-en-ohne-hinweis.png                     Nachweis
    backup/c177-3-th-hinweis.png                          Nachweis
    backup/c177-4-th-seite.png                            Nachweis

## Abnahme

**2026-08-30, Orchestrator.**

### Zwei meiner Praemissen sind gefallen

`[cmd]` **`nutrient_defs.name_th`: 0 von 138. `foods.name_th`: 0 von
7.140. `food_aliases`: 25.705 de, 7.140 en, 0 th.**

`[read]` **Der Punkt trennte Umgangsnamen von kanonischen Namen — die
Trennung existiert nicht.** **Es gibt keinen einzigen
thailaendischen Lebensmittelnamen im System.**

`[cmd]` **Und *,,39 Dateien"* waren 135 Aufrufe** — ich hatte
Dateien gezaehlt und Aufrufe geschrieben.

### Der Baustein trug den Fall nicht, und das ist der Fund

`[cmd]` **Der Standardsatz lautet: *,,er tut noch nichts"*.**

`[read]` **Bei Thai stimmt das nicht.** `[cmd]` **Die Wahl tut etwas:
Cookie gesetzt, Kopfzeile zeigt TH, die Oberflaeche uebersetzt sich.**
**Ungedeckt ist allein die Lebensmittelsuche.**

`[read]` **Der Baustein haette der Messung widersprochen, die diesen
Auftrag ausgeloest hat.**

`[cmd]` **Geloest mit `teilweise?: boolean`, Standard `false`** — 134
der 135 Aufrufe unveraendert, die Pille liest *,,teilweise gedeckt"*.

`[read]` **Damit ist die entscheidende Frage aus dem Auftrag
beantwortet: es ist eine Bauform.** `[read]` **`teilweise` trennt
zwei Zustaende, die vorher denselben Text bekamen** — *tut nichts*
gegen *funktioniert, Datenlage unvollstaendig*.

`[read]` **Und die Reihenfolge ist begruendet:** erst setzen, dann
hinweisen. **Ein Hinweis davor waere eine Rueckfrage gewesen, und die
war nicht verlangt.**

### C-353 — die Praemisse verglich zwei verschiedene Reiter

`[cmd]` **6.898 ms war `nutrition` Nutrients bei `fenster=90`.**
`[cmd]` **2.993 ms war `supplements` Today.**

`[read]` **Ich habe zwei Zahlen aus verschiedenen Reitern verglichen
und daraus einen Punkt gemacht.** `[cmd]` **Heute gemessen: Nutrients
90 = 6.730 ms, Supplements Today = 2.447 ms.** **Der Reiter ist nie
gefallen — es gibt keine 3.900 ms zu erklaeren.**

### Die eigentliche Frage ist trotzdem beantwortet

`[cmd]` **90 gegen 1 Tag sind +3.955 ms:** 2.148 ms Datenbank —
davon `reference_assessment_window_flags` allein 1.840 ms — **und
rund 1.620 ms HTML** (164 auf 700 kB).

`[cmd]` **Ausgeschlossen: die Zeilenzahl** (966/4.140/12.420, aber
konstant ~220 ms seit dem nebenlaeufigen Laden in G-252) **und die
sichtbaren Zeilen** (`tbody tr` bleibt bei 17 in jedem Fenster).

`[read]` **Es ist die Sparkline: 90 Punkte je Pfad statt einem, bei
gleichen 102 Pfaden.**

`[read]` **Und was offen bleibt, sagt er selbst:** wie sich die
1.620 ms auf Serverrendering und Uebertragung aufteilen. **Die Menge
ist gemessen, ihre Aufteilung nicht.** **Als C-356 angelegt.**

`[cmd]` 1027 Tests, 6/6 Sabotagen, Gate 11/11.

**Abgenommen.**

