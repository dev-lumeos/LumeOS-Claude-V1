---
nr: G-298
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-286
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-298 — Plaene lassen sich ansehen, nicht aendern

## Befund

Tom, 2026-08-31: *,,meal plans sehe ich noch nichts brauchbares."*

`[cmd]` **Nach G-286 ist der Reiter lesbar:** Karte, Tages-Akkordeon,
Aktivierung mit Zyklus.

`[read]` **Aber es gibt keinen Weg, einen Eintrag zu aendern.**
`[cmd]` **Die einzigen Knoepfe sind *Zuklappen* und *Laufzeit
aendern*.**

## Was fehlt

**Einen Eintrag hinzufuegen, aendern, entfernen.**

`[read]` **Ein Plan, den man nur ansehen kann, ist ein Ausdruck.**

`[cmd]` **Der Schreibweg steht:** G-267 legt Plaene an, G-286 hat
Anlegen, Aktivieren und Loeschen mit gezaehltem Rueckbau belegt.
`[read]` **Was fehlt, ist die Bearbeitung der Positionen.**

## Und ein zweiter Befund im selben Bild

`[cmd]` **Der aktive Plan laeuft vom 18.06. bis 08.07., heute ist der
31.08.** `[cmd]` **Die Karte sagt *aktiv*, und die Tagesansicht sagt
*fuer diesen Tag fuehrt der Plan keine Eintraege*.**

`[read]` **Beides stimmt einzeln und ergibt zusammen keinen Sinn.**
**Ein Plan, dessen Laufzeit vorbei ist, ist nicht aktiv** — **oder
die Anzeige muss sagen, dass er ausgelaufen ist.**

`[cmd]` **`lifecycle_type` ist bei diesem Plan `NULL`** — **also ist
nicht festgelegt, was am Ende geschieht** (G-290). **Das ist die
Luecke, die hier sichtbar wird.**

## Auftrag — Plaene bearbeitbar machen

**Mitbeauftragt: G-299, G-297.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Tom hat durchgesehen

*,,meal plans sehe ich noch nichts brauchbares"* — *,,planner ist
irgendwas aber noch nicht brauchbar"* — *,,tagesdeckung geht
kleiner."*

`[read]` **Nach G-286 ist der Reiter lesbar. Er ist nicht
benutzbar.**

### 1 · G-298 — einen Eintrag aendern

`[cmd]` **Die einzigen Knoepfe sind *Zuklappen* und *Laufzeit
aendern*.** `[read]` **Ein Plan, den man nur ansehen kann, ist ein
Ausdruck.**

**Hinzufuegen, aendern, entfernen — je Position.**

`[cmd]` **Der Schreibweg steht:** G-267 legt Plaene an, G-286 hat
Anlegen, Aktivieren und Loeschen belegt. **Es fehlen die
Positionen.**

**Und ein zweiter Befund im selben Bild:** `[cmd]` **der Plan laeuft
vom 18.06. bis 08.07., heute ist der 31.08., und die Karte sagt
*aktiv*.** `[read]` **Ein Plan, dessen Laufzeit vorbei ist, ist nicht
aktiv — oder die Anzeige muss sagen, dass er ausgelaufen ist.**
`[cmd]` **`lifecycle_type` ist `NULL`, also ist nicht festgelegt, was
am Ende geschieht.**

### 2 · G-299 — der Planner

`[cmd]` **Er oeffnet auf dem 18.6.** `[cmd]` **Heute ist der 31.8.**

`[read]` **Und die Vorfrage gehoert beantwortet, bevor du baust:**
**was ist der Planner, wenn es den Meal-plans-Reiter gibt?**

`[cmd]` **Beide zeigen denselben Plan** — der eine als Tagesliste,
der andere als Wochengitter. `[cmd]` **`SPEC_10` kennt den Planner
nicht als eigenen Bereich; `MealPlanDayView` steht unter den
Plan-Komponenten.**

`[read]` **Miss das und sag, was er sein soll.** **Dann bau es.**

### 3 · G-297 — die Tagesdeckung kleiner

`[cmd]` **28 Felder ueber die volle Kachelhoehe, je Feld eine Zahl.**
`[cmd]` **Und die Verlaufskachel daneben hat dadurch Leerraum.**

`[cmd]` **`HeatmapView.js` im Fundus zeigt es kompakt** — 7x5-Gitter,
**ohne dass ein Feld eine Bildschirmzeile fuellt.**

`[read]` **Die Zahl im Feld ist verzichtbar** — die Farbe traegt die
Aussage, die Zahl steht beim Darauffahren.

### Die Vorlagen

`[cmd]` **`referenz/.../nutrition/components/MealPlanView.tsx`, 21
kB** — Struktur ja, Code nie.

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` schreiben** — `test-user` mit
Rueckbau.
**Keine dritte Ansicht** — entweder der Planner ist die Wochenansicht
oder er verschwindet.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Eintrag aendern        schreibt, mit gezaehltem Rueckbau
    Eintrag hinzufuegen    dito
    abgelaufener Plan      was zeigt die Karte jetzt
    Planner                was ist er, und zeigt er die
                           laufende Woche
    Tagesdeckung           kleiner, Bildschirmfoto vorher/nachher
    Attrappen              am Schirm, vorher / nachher

## Bericht

**Der Reiter ist benutzbar: hinzufuegen, aendern, entfernen — je
Position, im Browser bewiesen.** Dazu die Antwort auf die
Planner-Vorfrage und die kleinere Tagesdeckung.

Alle Zahlen: **gemessen am 2026-08-31**, Schreibproben auf
**`test-user@lumeos.local`** mit gezaehltem Rueckbau. **`dev` wurde
nur gelesen** — 56 Eintraege vorher, 56 nachher.

### Zuerst zwei Praemissen des Auftrags, berichtigt

`[cmd]` **1. Der Plan laeuft bis zum 15.7., nicht bis zum 8.7.** Der
Auftrag nennt den 8.7.; die Tageszeilen enden am **2026-07-15** (drei
Wochen: 18.6.–24.6., 2.7.–8.7., 9.7.–15.7.). **Der 8.7. ist das Ende
der ZWEITEN Woche.** Die Sache bleibt dieselbe: **47 Tage vor heute,
und die Karte sagte „aktiv".**

`[cmd]` **2. Es gibt kein `end_date`.** `meal_plans` fuehrt
`start_date` und `days_count` — **und bei diesem Plan sind beide
`NULL`, ebenso `lifecycle_type`.** `[read]` **Die Laufzeit steht
ausschliesslich in den Tageszeilen.** Eine Rechnung aus `start_date`
ergaebe `NULL`, und die Karte sagte weiter nur *„aktiv"*. **Deshalb
liest `laufzeitVon()` die Tage.**

### 1 · G-298 — die Positionen

**Drei Vorgaenge, drei Knoepfe, alle im Browser gefahren.** Der
Nachweis lief auf `test-user` gegen die laufende Oberflaeche, nicht
per `fetch` gegen die Route — **ein gruener Endpunkt beweist nicht,
dass ein Knopf ihn erreicht** (die Luecke, die G-192 durchrutschen
liess):

    hinzufuegen   1 -> 2 Eintraege
    aendern       "3x" steht danach im Raster
    entfernen     2 -> 1, und in der Datenbank 0 Reste
    Konsole       2 Meldungen, beide die bekannte
                  `data-mode`-Hydrationswarnung

`[cmd]` **Und die Datenbank hat mitgeschrieben:** nach dem Entfernen
steht dort kein Eintrag mehr — die Anzeige und der Bestand stimmen
ueberein.

#### Der CHECK bestimmt das Formular, nicht der Geschmack

`[cmd]` **`meal_plan_entries_target_check`, am 2026-08-31 aus
`pg_constraint` gelesen:**

    recipe   recipe_id + planned_servings, amount_g MUSS NULL sein
    bls      food_id + amount_g, planned_servings MUSS NULL sein
    custom   custom_food_id + amount_g, planned_servings NULL

`[read]` **Ein Formular mit beiden Mengenfeldern wird von der
Datenbank abgelehnt** — und der Fehler erschiene erst beim Speichern,
als *„WRITE_FAILED"* ohne Hinweis auf die Ursache. **Deshalb
entscheidet der Typ, welches Feld ueberhaupt erscheint**
(`feldFuer()`), und `verletztCheck()` prueft den Bausatz **vor** dem
Senden — im Browser und noch einmal im Schreibweg.

`[cmd]` **Gegenprobe an der laufenden Datenbank:** ein Rezepteintrag
MIT `amount_g` wurde mit
`meal_plan_entries_target_check` abgewiesen, **null Zeilen
geschrieben.**

#### Was beim Typwechsel passiert

`[read]` **Alle drei Quellkennungen werden geschrieben, auch die
`null`en.** Wechselt ein Eintrag von Rezept auf Lebensmittel und
bliebe `recipe_id` stehen, waeren zwei Kennungen gesetzt — der CHECK
verlangt genau eine. `[cmd]` **Der Wechsel `bls -> recipe` ist
gefahren worden:** danach `recipe_id` gesetzt, `food_id` leer,
`planned_servings` 2, `amount_g` leer.

#### Die Coach-Sperre gilt auch fuer Positionen

`[read]` **Ohne sie liesse sich ein gesperrter Coach-Plan ueber seine
Eintraege umbauen** — G-269 waere dann eine Bitte statt einer Regel.
**Alle drei Vorgaenge fragen `darfAendern()`**, und ein Waechter
zaehlt die drei Aufrufe (nicht: sucht einen).

### 2 · G-299 — was der Planner ist

**Die Vorfrage zuerst, wie beauftragt.**

`[cmd]` **`SPEC_10_COMPONENTS.md` fuehrt acht Meal-Plan-Komponenten
und keinen Planner.** `MealPlanDayView` heisst dort *„Ein Tag
innerhalb eines Plans"*.

`[cmd]` **Beide Reiter lesen denselben Plan** (`ladePlan`), **zeigen
aber Verschiedenes:**

    Meal plans   Karte, Ziele, Lebenszyklus, Herkunft, Einhaltung
                 -> WAS der Plan ist
    Planner      Wochengitter, Zelle je Mahlzeit und Tag
                 -> WANN was gegessen wird

`[read]` **Meine Antwort: nicht loeschen, sondern zustaendig
machen.** **Eine Position gehoert in ein Raster aus Tag und
Mahlzeit** — und genau das ist dieses Gitter. **Der Planner ist ab
jetzt die Bearbeitungsflaeche des aktiven Plans**, Meal plans bleibt
seine Beschreibung. **Keine dritte Ansicht:** das Formular klappt IN
der Zelle auf.

`[read]` **Waere er geloescht worden, muesste die Bearbeitung in
einen Tages-Akkordeon-Eintrag** — eine Position je Zeile, ohne
Wochenbezug. **Das ist schlechter fuer genau die Aufgabe, um die es
geht.**

#### Warum er auf dem 18.6. oeffnete

`[cmd]` **Nicht die Navigation war schuld.** `PlannerEchtTab` sucht
seit jeher die Woche, in der heute liegt, und faellt auf die erste
zurueck. `[cmd]` **Der Plan hat drei Wochen, und heute ist in
keiner.**

`[read]` **Der Rueckfall war stumm** — das war der Fehler. Jetzt
steht *„keine Planwoche für heute"* in der Leiste, und **wenn es eine
gibt, fuehrt ein Knopf hin.** `[cmd]` **Auf der Probebuehne mit einer
Woche um heute herum ist Montag als HEUTE hervorgehoben** — die
Logik greift, sobald Daten da sind.

### 3 · G-297 — die Tagesdeckung kleiner

`[cmd]` **Vorher: `repeat(7, 1fr)` mit `aspectRatio: 1`** — ein Feld
war ein Siebtel der Kartenbreite hoch, rund 90 px. **28 davon fuellten
die Kachel.**

`[cmd]` **`HeatmapView.js` macht es zweifach anders**, und beides ist
uebernommen: **eine gedeckelte Feldbreite** (`minmax(0, 26px)` statt
`1fr`) **und die Legende als Flex-Zeile statt als Liste** — fuenf
Zeilen werden zu einer.

`[cmd]` **Die Zahl im Feld ist entfernt** (Auftrag): die Farbe traegt
die Aussage, die Zahl steht im `title`. `[read]` **Damit darf das
Feld so klein werden, dass keine Ziffer mehr hineinpassen muss.**

`[cmd]` **Und `tagNummer()` ist mit entfernt, nicht nur unbenutzt
liegengelassen** — A-59. Ihr Waechter faellt mit ihr weg; ein neuer
prueft, dass sie nicht zurueckkommt.

### Ein Befund, den erst das Bild zeigte

`[cmd]` **Die Werkzeugknoepfe haben das Raster gesprengt.** Nach dem
ersten Einbau standen Sa und So ausserhalb der Karte, und die
kcal-Zeile brach auf vier Zeilen um (*„789 / kcal / · / 1×"*) — die
Reihen wurden doppelt so hoch.

`[read]` **Die Ursache war nicht die Gitterbreite, sondern der
Fluss:** auch mit `opacity: 0` belegen die Knoepfe Platz und
verschmaelern die Textspalte. **Zwei Versuche an der falschen Stelle**
(`minmax(0,1fr)`, dann `min-width: 870px`) **haben es verschlimmert.**

`[cmd]` **Behoben durch `position: absolute`** — die Knoepfe legen
sich ueber die Zelle, statt in ihr Platz zu nehmen. **Das Raster hat
wieder die Dichte von vorher**, gegengeprueft am Bild.

### Waechter und Sabotageprobe

**17 Waechter** in `apps/web/src/lib/nutrition/__tests__/plan-eintrag-lage.test.ts`.

`[cmd]` **24 Sabotagen einzeln gefahren, jede mit SHA-256-Rueckbau:
24 gefangen, 0 Ueberlebende, Nachlauf 0 Fehlschlaege.**

**Zwei sind in der ersten Runde durchgefallen — beide meine eigenen,
beide dieselbe alte Klasse (G-216: das Wort statt der Wirkung):**

`[cmd]` **1.** Die Probe suchte `verletztCheck(bauEintrag(` im Text.
**Die Sabotage setzte ein `return null;` DAVOR** — der Text blieb
stehen, die Wirkung war weg. **Jetzt wird der Block zwischen
`entwurfFehler` und dem Aufruf geprueft.**

`[cmd]` **2.** Die Probe zaehlte `<EintragForm` und fand zwei.
**Die Sabotage aenderte nur die BEDINGUNG** (`{offen === e.id &&` zu
`{false &&`) — beide Vorkommen blieben. **Jetzt wird die Bedingung
selbst geprueft.**

### Gate und Messung

`[cmd]` **`pnpm gate`: 11 von 11 Aufgaben gruen**, Build und Typecheck
eingeschlossen. `[cmd]` **`[serverimport]` 51 Client-Chunks, 0
Treffer**, Gegenprobe positiv.

`[cmd]` **Attrappen je Reiter, einzeln ueber die Klasse gezaehlt:**

    plans      0 Attrappenkarten
    planner    0 Attrappenkarten, 2 „in Entwicklung"-Knoepfe
               (Copy week, New recipe - beide aus G-97, nicht
               Teil dieses Auftrags)
    insights   0 Attrappenkarten

`[read]` **Die „1", die `schuss.mjs` meldet, ist die Buddy-Leiste
rechts** — ausserhalb des Reiters, unveraendert.

`[cmd]` **Der erste Zaehlversuch war falsch und ist berichtigt:** ich
suchte `[data-in-entwicklung]`, **und dieses Attribut setzt
`InEntwicklungKnopf` gar nicht** — die Spalte zeigte deshalb dreimal
0. Gezaehlt wird jetzt der Knopf.

`[cmd]` **Ladezeit, kalt / warm:**

    plans      1.817 / 1.624 ms
    planner    1.647 / 1.656 ms
    insights   2.821 / 2.748 ms

`[cmd]` **Konsolenfehler: 1 je Reiter** — die bekannte
`data-mode`-Hydrationswarnung aus `RootLayout`, vorbestehend.

### Geaendert

    neu   lib/nutrition/plan-eintrag-lage.ts        CHECK + Laufzeit
    neu   v2/nutrition/plan-eintrag-editor.tsx      das Formular
    neu   __tests__/plan-eintrag-lage.test.ts       17 Waechter
    ge.   lib/nutrition/plan-write.ts               3 Vorgaenge
    ge.   api/nutrition/plan/route.ts               3 Arten
    ge.   v2/nutrition/tab-planner-echt.tsx         Zelle bearbeitbar
    ge.   v2/nutrition/plans-echt.tsx               abgelaufen
    ge.   v2/nutrition/plan-detail.tsx              abgelaufen
    ge.   v2/nutrition/insights-kacheln.tsx         G-297 kompakt
    ge.   lib/nutrition/insights-lage.ts            tagNummer weg
    ge.   v2/nutrition/nutrition.css                Werkzeuge, Form

**Nicht committet, nicht gestaget. Auf `dev` nur gelesen** — alle
Schreibproben auf `test-user`, vollstaendig zurueckgebaut. **Kein
Konsolenfenster.**

### Bilder

    backup/g298-plans-vorher.png     Karte sagte nur „aktiv"
    backup/g298-plans-nachher.png    „aktiv · abgelaufen" + Satz
    backup/g299-planner-vorher.png   Raster ohne Knoepfe
    backup/g298-planner-nachher.png  Banner, Sprunghinweis
    backup/g298-formular.png         das Formular in der Zelle
    backup/g298-final-insights.png   Tagesdeckung kompakt

### Offen, fuer Tom

1. `[cmd]` **Lebensmittel lassen sich noch nicht hinzufuegen**, nur
   Rezepte. Der Grund steht im Formular: **die Suche haengt an
   `food_search` und ist ein eigener Weg.**

   `[cmd]` **Vorhandene BLS-Eintraege sind aenderbar — gemessen, nicht
   behauptet:** auf `test-user` von 100 g / dinner auf 275 g / lunch
   geaendert, **`food_id` unveraendert, `recipe_id` weiter leer**,
   danach entfernt und vollstaendig zurueckgebaut. **Nur das Anlegen
   fehlt.** Falls das ein eigener Punkt werden soll, sag Bescheid.
2. `[read]` **Der abgelaufene Plan wird gezeigt, nicht repariert.**
   Was mit ihm geschehen soll — auf `completed` setzen, verlaengern,
   Folgeplan — **ist eine Produktentscheidung und haengt an
   `lifecycle_type`, das hier `NULL` ist** (G-290).


## Abnahme

**2026-08-31, Orchestrator.**

**Der Reiter ist benutzbar: hinzufuegen, aendern, entfernen — je
Position, im Browser bewiesen.**

`[cmd]` **1 auf 2 beim Hinzufuegen, *3x* im Raster nach der Aenderung,
2 auf 1 beim Entfernen, null Reste in der Datenbank.** `[cmd]` **`dev`
unberuehrt: 56 vorher, 56 nachher.**

`[read]` **Und er hat gegen die Oberflaeche gefahren, nicht per
`fetch` gegen die Route** — **ein gruener Endpunkt beweist nicht, dass
ein Knopf ihn erreicht.** `[cmd]` **Genau die Luecke, die G-192
durchrutschen liess.**

### Der CHECK bestimmt das Formular

`[cmd]` **`meal_plan_entries_target_check`: `recipe` verlangt
`planned_servings` und verbietet `amount_g`, `bls` und `custom`
umgekehrt.**

`[read]` **Ein Formular mit beiden Feldern wird abgelehnt** — **und
der Fehler erschiene erst beim Speichern, als *WRITE_FAILED* ohne
Ursache.** `[cmd]` **Deshalb entscheidet der Typ, welches Feld
erscheint, und `verletztCheck()` prueft vor dem Senden — im Browser
und noch einmal im Schreibweg.**

`[cmd]` **Gegenprobe gefahren: ein Rezepteintrag mit `amount_g` wurde
abgewiesen, null Zeilen geschrieben.**

`[read]` **Und die Coach-Sperre aus G-269 deckt jetzt auch die
Positionen** — **ohne sie liesse sich ein gesperrter Plan ueber seine
Eintraege neu bauen.**

### Zwei Praemissen von mir berichtigt

`[cmd]` **Der Plan laeuft bis zum 15.7., nicht bis zum 8.7.** — der
8.7. ist das Ende der zweiten Woche. `[read]` **Die Sache bleibt: 47
Tage vor heute, und die Karte sagte *aktiv*.**

`[cmd]` **Und es gibt kein `end_date`.** `start_date`, `days_count`
und `lifecycle_type` sind bei diesem Plan alle `NULL` — **die Laufzeit
steht ausschliesslich in den Tageszeilen.**

`[cmd]` **Die Karte liest jetzt *aktiv · abgelaufen*** — **der
gespeicherte Zustand wird gezeigt und eingeordnet, nicht
ueberschrieben.**

### G-299 — die Vorfrage beantwortet, dann gebaut

`[cmd]` **`SPEC_10` fuehrt acht Plan-Komponenten und keinen Planner.**

`[read]` Sein Urteil: **Meal plans ist, *was der Plan ist* — der
Planner, *wann was gegessen wird*.** `[read]` **Weil eine Position in
ein Raster aus Tag mal Mahlzeit gehoert, hat er den Planner
zustaendig gemacht statt ihn zu loeschen** — **er ist jetzt die
Bearbeitungsflaeche, das Formular oeffnet in der Zelle.**

`[cmd]` **Und der 18.6. war kein Navigationsfehler:** keine der drei
Wochen enthaelt heute. **Der stille Rueckfall sagt es jetzt.**

### G-297 — kleiner

`[cmd]` **Begrenzte Zellbreite, Legende als eine Zeile, beides aus
`HeatmapView.js`.** `[cmd]` **Die Zahl ist aus dem Feld weg, und
`tagNummer()` wurde geloescht statt ungenutzt gelassen** (A-59).

### Eine selbst verursachte Regression, gemeldet

`[cmd]` **Die Werkzeugknoepfe brachen das Raster** — Samstag und
Sonntag ausserhalb der Karte, kcal auf vier Zeilen.

`[read]` **Zwei Versuche an der falschen Ursache machten es
schlimmer**, bevor er es fand: **auch bei `opacity: 0` belegten die
Knoepfe Platz.**

`[cmd]` 17 Waechter, 24 Sabotagen einzeln, 24 gefangen, 0
Ueberlebende. Gate 11/11.

**Abgenommen.** **Zwei offene Sachen gehen als G-300 und C-369.**

