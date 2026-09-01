---
nr: G-321
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-320
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: e70e1cfe
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/food-such-modal.tsx
zahlen: null
---

# G-321 — drei Befunde am Suchmodal

## Befund

Tom, 2026-09-02, am Schirm: *,,die suche ist ungluecklich gemacht, da
ist nicht klar dass man zuerst den suchen button klicken muss. das
modal muss bewegbar werden und es hat einen spaltenfehler drin."*

### 1 · Der Suchknopf ist nicht erkennbar

`[cmd]` **Im Bild steht im Feld *,,— noch keines gewaehlt"* und
daneben ein Knopf *Suchen*.**

`[read]` **Wer tippt, erwartet Treffer.** `[cmd]` **Und das Modal
selbst sucht beim Tippen** — Entprellen ist im Hook.

`[read]` **Der Widerspruch liegt zwischen dem Auswahlfeld im Planner
und dem Modal darueber:** **das Feld sieht aus wie eine Eingabe, ist
aber ein Oeffner.**

### 2 · Das Modal ist nicht bewegbar

`[cmd]` **Es liegt fest ueber dem Raster.** `[read]` **Wer pruefen
will, was der Tag schon traegt, sieht es nicht** — **obwohl das Modal
die Tagessumme kennt.**

### 3 · Der Spaltenfehler

`[cmd]` **Am Bild: die Kopfzeile *Name Quelle kcal P C F* steht in
der Mitte der Liste, nicht oben.** `[cmd]` **Und die Werte stehen
ohne Trennung: *79 1.3 15.9 0.4*.**

`[read]` **Die Kopfzeile ist von der Liste abgeloest** — sie
scrollt nicht mit, sondern steht an einer festen Stelle im Fluss.

## Nachgemessen, 2026-09-02

### 1 · Das Feld ist ein Oeffner, sieht aber wie eine Eingabe aus

`[cmd]` **`plan-eintrag-editor.tsx:248`:**
`placeholder="— noch keines gewaehlt —"`.

`[cmd]` **Daneben Zeile 319: `<FoodSuchModal ... />`.**

`[read]` **Das Modal sucht beim Tippen** — der Hook entprellt.
`[read]` **Aber das Feld darunter ist kein Eingabefeld, sondern ein
Anzeigefeld mit Knopf.**

`[read]` **Wer hineintippt, erwartet Treffer und bekommt nichts.**

### 2 · Das Modal ist fest verankert

`[cmd]` **`drag` 0, `transform` 0, `onMouseDown` 0.** `[cmd]` **Zwei
`fixed`, eine `position:`.**

`[read]` **Es verdeckt das Raster, in dem der Nutzer pruefen will,
was der Tag schon traegt** — **obwohl das Modal die Tagessumme
kennt und anzeigt.**

### 3 · Der Kopf ist richtig gebaut, die Breite fehlt

`[cmd]` **`food-such-modal.tsx:405-414`: ein `<thead>` mit sieben
`<th>`, feste Breiten 50/60/50/50/50/70.**

`[read]` **Der Kopf steht also korrekt oben.** `[read]` **Was Toms
Bild zeigt, ist etwas anderes: der Kopf erscheint auf Hoehe der
achten Zeile, mitten in der Liste.**

`[cmd]` **`Name` hat keine Breite** — **und `<div style={{
overflowX: 'auto' }}>` in Zeile 403 laesst die Tabelle waagerecht
laufen.**

`[read]` **Zu messen: laeuft der Kopf mit, oder rutscht die
Namensspalte so weit, dass er verschoben erscheint?** `[cmd]` **Und
die Werte im Bild stehen ungetrennt: *79 1.3 15.9 0.4*** — **bei
`textAlign: right` und 50 px Breite duerfte das nicht passieren.**

`[read]` **Verdacht: die Zeilen ohne `name_display_de` brechen die
Namensspalte, und `overflowX` verschiebt alles darunter.**

## Auftrag — die drei Befunde am Modal

**Beauftragt am 2026-09-02.**

`[read]` **Alle drei sind nachgemessen, die Fundstellen stehen
oben.**

### 1 · Das Feld darf keine Eingabe vortaeuschen

`[cmd]` **`plan-eintrag-editor.tsx:248` traegt einen `placeholder`** —
**das ist ein Eingabefeld.** `[cmd]` **Es oeffnet aber nur das Modal
(Z. 319).**

`[read]` **Entweder tippt man dort und die Suche laeuft an** — **oder
es ist kein Eingabefeld.**

`[read]` **Das Modal sucht bereits beim Tippen** (der Hook
entprellt). `[read]` **Der einfachste Weg: das Feld wird ein Knopf,
und der Knopf oeffnet das Modal mit dem Fokus im Suchfeld.**

### 2 · Das Modal muss bewegbar werden

`[cmd]` **`drag` 0, `transform` 0, `onMouseDown` 0.**

`[read]` **Es verdeckt das Raster, in dem der Nutzer sieht, was der
Tag schon traegt** — **obwohl das Modal die Tagessumme kennt.**

`[read]` **Ziehen an der Titelleiste reicht.** **Kein Groessenaendern,
kein Andocken.**

### 3 · Der Spaltenfehler

`[cmd]` **Der Kopf ist richtig gebaut:** `food-such-modal.tsx:405-414`,
sieben `<th>` mit festen Breiten 50/60/50/50/50/70.

`[cmd]` **`Name` hat keine Breite.** `[cmd]` **Und Zeile 403 setzt
`overflowX: 'auto'`.**

`[read]` **Toms Bild zeigt den Kopf auf Hoehe der achten Zeile** —
**und Werte ohne Trennung: *79 1.3 15.9 0.4*.**

`[read]` **Verdacht: lange Kategorienamen brechen die Namensspalte,
die Tabelle laeuft waagerecht, und der Kopf verschiebt sich.**
**Miss es, bevor du aenderst.**

`[cmd]` **Im Bild: *FERTIGGERICHTE & ZUBEREITUNGEN* bricht auf zwei
Zeilen** — der laengste Kategoriename der Trefferliste.

### Wie du es belegst

`[cmd]` **`dev@lumeos.app` traegt 8 Plaene und 6 Protokollzeilen** —
lesen und ansehen erlaubt, **nicht schreiben.**

`[read]` **Ein Bildschirmfoto mit dem Suchwort *banane*** — **genau
der Fall aus Toms Bild, 24 Treffer mit langen Kategorienamen.**

### Was nicht zu tun ist

**Keine zweite Suche** — der Hook aus G-320 steht.
**Kein Umbau von `tab-foods.tsx`** — das ist G-322.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Feld              tippen loest die Suche aus, oder es ist
                      kein Eingabefeld
    bewegbar          Titelleiste ziehen, Position bleibt
    Kopfzeile         steht oben, auch bei 24 Treffern
    Werte             kcal, P, C, F getrennt und rechtsbuendig
    Bildschirmfoto    Suchwort "banane", vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-02, Orchestrator. Bildschirmfoto angesehen.**

`[cmd]` **Alle drei sitzen:** Kopfzeile oben, Spalten getrennt und
rechtsbuendig, das Feld ist ein Knopf mit Lupe.

    Punkt       vorher                        nachher
    Feld        <input> readOnly + Knopf      ein Knopf, Fokus im
                                              Suchfeld
    bewegbar    drag 0, onMouseDown 0         gezogen dx=-220 dy=160
    Kopfzeile   thead y=493, Zeile 1 y=275    thead y=267, Zeile 1
                                              y=299
    Werte       "79 1.3 15.9 0.4"             kcal b=60, P/C/F b=50,
                                              alle rechtsbuendig

`[read]` **Gemessen in Pixeln, nicht behauptet.** `[read]` **Der
Kopf lag vorher hinter der achten Zeile** — das war Toms Bild.

### Der Spaltenfehler war ein anderer als mein Verdacht

`[read]` **Mein Auftrag verdaechtigte lange Kategorienamen und
waagerechten Lauf.**

`[cmd]` **Gemessen: `scrollWidth − clientWidth = 0`** — **es lag nie
am Ueberlauf.**

`[cmd]` **Die Ursache ist seine eigene aus G-320:
`className="v2-tab"`.** `[cmd]` **Das ist die Klasse fuer
Reiter-Knoepfe, `v2.css:423`, mit `display: flex`.**

`[read]` **Damit gilt keine Tabellenmechanik mehr:** `<thead>` und
`<tbody>` werden Flex-Kinder nebeneinander, **der Kopf rutscht neben
die Liste, und die Zellen schieben sich ohne Breite zusammen.**
`[read]` **Genau die zwei Symptome.**

`[cmd]` **Richtig ist `v2-tbl`, wie `tab-foods.tsx:875` sie nutzt** —
**dieselbe Klasse wie in Food DB, wie Tom es verlangt hat.**

### Und der Waechter darauf ist die richtige Art

`[cmd]` **Er prueft, dass `.v2-tab` ueberhaupt noch eine Flexbox
ist.**

`[read]` **Faellt die Eigenschaft weg, ist die Begruendung
hinfaellig** — **und der Test erinnert daran, statt still
weiterzulaufen.** **A-62 vorweggenommen.**

### Drei Fallen, die keine Sabotage gemeldet haette

`[cmd]` **Die Maus-Zuhoerer haengen am `window`, nicht am Kasten** —
sonst reisst der Zug ab, sobald die Maus ihn verlaesst.

`[cmd]` **Ein Zug, der auf der Huelle endet, schliesst nicht mehr** —
sonst verschwaende das Modal mitten in der Bewegung.

`[cmd]` **Die Kopfknoepfe halten den Zug auf** — sonst waere jeder
Klick auf *Schliessen* ein Zug von 0 px.

`[read]` **Alle drei entstehen nur beim Ziehen** — **eine Sabotage
erzeugt sie nicht, nur ein Nutzer.**

### Und eine Zahl im Auftrag gehoert mir

`[cmd]` **Ich schrieb *,,dev traegt 8 Plaene"*.** `[cmd]` **Gemessen:
4** — 1 active, 1 paused, 2 assigned. **Die 8 ist die Gesamtzahl
ueber alle Konten.**

`[read]` **`count(*)` ohne `user_id`** — dieselbe Klasse wie die
112 Eintraege aus G-286.

`[cmd]` Gate 15/15, 1.254 Tests, 19 von 19 Sabotagen, `dev`
unberuehrt.

**Abgenommen.**

