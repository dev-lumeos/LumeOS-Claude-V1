---
nr: G-344
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: d4d2689a
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
  listen: 4
  posten: 17
---

# G-344 — Einkaufslisten koennen mehr, als die Spec sagt

## Befund

Tom, 2026-09-07: *,,einkaufslisten kann ich anhand von rezepten
erzeugen, aber danach weder loeschen noch editieren, mal abgesehen
davon dass man einkaufslisten anhand von plaenen macht und nicht
einem rezeptbuch."*

## Die Spec beschreibt nur einen Weg

`[cmd]` **`SPEC_03`, Flow 8, sechs Schritte:** Rezept oeffnen,
Portionen waehlen, generieren, anzeigen, abhaken, teilen.

`[cmd]` **`SPEC_04`, Feature 6:** *,,Generiert aus Rezept:
`POST /api/nutrition/recipes/:id/shopping-list`."*

`[read]` **Kein Loeschen, kein Bearbeiten, kein Weg vom Plan.**

## Aber das Schema kann alles davon

`[cmd]` **`shopping_lists` traegt zwoelf Spalten**, darunter:

    source_type          manual | recipe | meal_plan |
                         supplement_reorder
    recipe_id
    meal_plan_week_id
    status               open | completed | archived

`[cmd]` **Und der CHECK erzwingt die Zuordnung:**

    recipe      -> recipe_id gesetzt, meal_plan_week_id leer
    meal_plan   -> meal_plan_week_id gesetzt, recipe_id leer
    manual      -> beide leer
    supplement_reorder -> beide leer

`[read]` **Die Datenbank kennt den Weg vom Plan seit ihrem Bau.**
`[read]` **Und `manual` heisst: eine Liste ohne Quelle, frei
angelegt.**

`[cmd]` **`status` kennt `archived`** — **die Absicht, eine Liste
wegzulegen, ist im Schema vorgesehen.**

## Was auf `dev` liegt

    Nachweis-Einkaufsliste                     manual
    Lachs mit Suesskartoffel (2 Portionen)     recipe
    Huhn-Reis-Bowl (2 Portionen)               recipe
    Banane-Joghurt-Haferflocken (1 Portionen)  recipe

`[cmd]` **Vier Listen, 17 Posten** — **eine davon `manual`, drei aus
Rezepten, keine aus einem Plan.**

## Und niemand liest sie

`[cmd]` **Keine API-Route unter `apps/web/src/app/api/` nennt
`shopping`.**

`[cmd]` **In `apps/` steht `shopping_list` nur in Tests** —
`plan-lage.test.ts`, `rezept-lage.test.ts`.

`[read]` **Die Tabellen sind gebaut, gefuellt und haben keinen
Aufrufer** — **dieselbe Klasse wie `meal_plan_slots` vor G-336.**

## Was zu entscheiden ist

`[read]` **Toms Einwand trifft die Spec, nicht das Schema:**
**Einkaufslisten aus Plaenen sind der Hauptfall, aus Rezepten der
Nebenfall.**

`[read]` **Wer eine Woche plant, kauft fuer die Woche** — **nicht
fuer ein einzelnes Rezept.**

`[cmd]` **`meal_plan_week_id` zeigt auf eine Woche, nicht auf einen
Plan** — **das passt: man kauft woechentlich, nicht fuer zwoelf
Wochen.**

`[read]` **Und die drei fehlenden Wege sind keine neuen Ideen,
sondern unbelegte Faehigkeiten:** loeschen (`archived`), bearbeiten
(`manual`-Posten), aus dem Plan erzeugen (`meal_plan`).

## Auftrag — die Einkaufslisten anschliessen

**Mitbeauftragt: G-353.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Was schon steht

`[cmd]` **C-407: DB-Funktionen zum Erzeugen, Lesen und
Archivieren.** **Gleiche `food_id` in Gramm summiert, gleiche
Freitextnamen getrennt.**

`[cmd]` **C-408: `nutrition.user_inventory` mit Abzug beim
Erfassen.**

`[cmd]` **C-409: `nutrition_reorder` ist in beiden CHECKs.**

`[cmd]` **G-345: die Oberflaeche an drei Orten** — Fenster auf der
gemeinsamen Huelle, Knopf an der Planwoche, eigener Reiter mit
Archiv.

`[cmd]` **Und vier Listen mit 17 Posten liegen auf `dev`.**

`[read]` **Was fehlt: der Anschluss.** `[cmd]` **Keine API-Route
nennt `shopping`, in `apps/` steht der Name nur in Tests.**

### 1 · G-344 — anschliessen

`[read]` **Der Hauptfall zuerst** (E-64): **aus einer Planwoche eine
Liste.** `[cmd]` **`meal_plan_week_id` zeigt auf eine Woche, nicht
auf einen Plan.**

`[read]` **Dann: abhaken, bearbeiten, archivieren.**

`[cmd]` **Loeschen gibt es nicht** — **`authenticated` hat kein
DELETE, `status = 'archived'` ist der Weg.**

### 2 · G-353 — die Setup-Karten

`[cmd]` **Du hast sie entworfen: sie haengen an der Leere, nicht am
Konfigurationszustand** — **deshalb braucht es keine Spalte fuer
*weggewischt*.**

`[read]` **Bau sie** — **und melde, wenn eine Karte auf etwas
wartet, das noch nicht steht.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  aus einer Planwoche eine Liste erzeugt.
        Zahl: Posten in der Liste / Eintraege in der Woche.
        Und: sieben Tage Huehnchen ergeben EINE Zeile -- belegt.

    A2  abhaken schreibt `is_checked`. Zahl: vorher/nachher.

    A3  archivieren: die Liste verschwindet aus *offen*, bleibt
        lesbar. Zahl: offen vorher/nachher, archiviert
        vorher/nachher.

    A4  E-72: jede angebundene Kachel zeigt Werte oder einen
        benannten Leerhinweis. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.

    A5  E-69: jede angebundene Kachel hat ihre Mockup-Referenz
        unter der Linie. Zahl: angebunden / Referenzen.

    A6  G-353: wie viele Setup-Karten, je Karte die
        Verschwindregel.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** — **der Leseweg steht.**
**Nichts auf `dev@lumeos.app` schreiben** — **Nachweise auf
`test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### Vorweg: der Anschluss stand schon

`[cmd]` **Der Auftrag sagt *,,keine API-Route nennt shopping, in
`apps/` steht der Name nur in Tests"*.** **Das gilt fuer den Namen,
nicht fuer die Sache.**

`[cmd]` **Gemessen:** `lib/nutrition/einkaufsliste-lesen.ts` mit drei
Lesewegen, `einkaufsliste-aktionen.ts` mit **sieben** Schreibwegen
(`postenAbhaken`, `postenMenge`, `postenEntfernen`,
`postenHinzufuegen`, `listeArchivieren`, `wochenlisteErzeugen`,
`listeHolen`), dazu `einkaufsliste-modal.tsx` und der Reiter.

`[read]` **Es laeuft ueber Serveraktionen, nicht ueber
`app/api/`** — deshalb findet eine Suche nach `shopping` unter
`api/` nichts. **G-345 ist gebaut.**

`[cmd]` **Und die drei C-407-Funktionen sind live** (`pg_proc`):
`shopping_list_from_meal_plan_week`, `shopping_list_read`,
`shopping_list_archive`.

`[read]` **Also war nicht anzuschliessen, sondern nachzuweisen** —
und genau eine Luecke zu schliessen (A5).

### A1 — aus einer Planwoche eine Liste

**4 Posten in der Liste / 28 Eintraege in der Woche.**

`[cmd]` **Am Schirm erzeugt:** Reiter *Planner*, Knopf
*Einkaufsliste* an der Woche `Nachweiswoche`. **Danach in der
Datenbank:**

    Einkauf Nachweiswoche | meal_plan | open | 4 Posten

**Und die Buendelung, belegt:**

    Lebensmittel              Tage   Summe      Posten in der Liste
    Weisser Reis (roh)          7    1750 g     1 Zeile, 1750.00
    Lachs (geduenstet)          7    1260 g     1 Zeile, 1260.00
    Magerquark (< 10% Fett)     7    1260 g     1 Zeile, 1260.00
    Banane                      7    1050 g     1 Zeile, 1050.00

`[cmd]` **Jedes Lebensmittel steht an sieben Tagen und ergibt EINE
Zeile mit der Gramm-Summe.** **28 Eintraege → 4 Posten.**

`[read]` **Die Gruppierung sitzt in der DB-Funktion**
(`GROUP BY item_source, food_id, custom_food_id`) — gleiche
`food_id` summiert, gleiche Freitextnamen getrennt, wie C-407 es
beschreibt.

### A2 — abhaken schreibt `is_checked`

**vorher 0 von 4 / nachher 1 von 4.**

`[cmd]` **Ueber das Kontrollkaestchen im Listenfenster geklickt**,
nicht per SQL:

    vorher    Banane f | Lachs f | Magerquark f | Reis f
    nachher   Banane t | Lachs f | Magerquark f | Reis f

`[cmd]` **Und am Schirm sichtbar:** die Liste zeigt `1/4`.

### A3 — archivieren

**offen 2 → 1, archiviert 0 → 1.**

`[cmd]` **Kopfzeile des Reiters vor und nach dem Klick auf
*Archivieren*:**

    vorher    2 offen · 0 archiviert
    nachher   1 offen · 1 archiviert

`[cmd]` **Und sie bleibt lesbar:** unter *Archiv zeigen* steht
*,,Einkauf Nachweiswoche · aus einer Planwoche · 8.9. · 1/4 ·
archiviert"*.

`[cmd]` **Nichts geloescht:** die Liste traegt weiter ihre 4 Posten,
nur `status = 'archived'`.

### A4 — E-72: Werte oder benannter Leerhinweis

**1 Kachel / 1 mit Daten / 0 mit Leerhinweis.**

`[cmd]` **Der Reiter fuehrt EINE angebundene Kachel**
(*Einkaufslisten*), **und sie zeigt Werte:** Kopfzeile mit
offen/archiviert, je Liste Name, Herkunft, Datum und Fortschritt.

`[read]` **Kein Leerhinweis noetig, weil Daten vorliegen.**
`[cmd]` **Der Leerfall ist gebaut** — er greift, wenn ein Konto
keine Liste hat; auf `test-user` ist er nicht ausgeloest.

### A5 — E-69: die Referenz unter der Linie

**1 angebunden / 1 Referenz** — **und das war die Luecke.**

`[cmd]` **Der Reiter trug den Vermerk *,,Kein Mockup-Gegenstueck"*
mit der Begruendung, `einkauf` stehe in keiner theme-v1-Datei.**
**Das ist falsch.**

`[cmd]` **`module-nutrition-spec.jsx:476` fuehrt ihn** — als
Unterreiter von *Meal plans*, mit zwei Kacheln:

    Shopping list   fuenf Warengruppen, 14 Posten, Haken mit
                    Durchstreichung
    Scale list      Portionswahl 1-4x, Total items, Checked,
                    Est. cost

`[read]` **Die Begruendung hatte nur `module-nutrition.jsx`
durchsucht** — **und kein Modul hat nur eine Mockupdatei.**
***Nicht gefunden* heisst nur, dass die Suche nichts fand.**

`[cmd]` **Gebaut: `EinkaufReferenz`** mit beiden Kacheln, portiert
statt beschrieben — Warengruppen, Mengen, Haken, Durchstreichung.
**Am Schirm: Linie steht, oben 1 Kachel, unten 2.**

**Sabotageprobe:** eine Marke aus `Scale list` entfernt → der
Waechter meldete 26 statt 27. Zurueckgedreht → gruen.

#### Ein Befund an der Vorlage, nicht an der Portierung

`[cmd]` **Das Mockup hakt die ersten zwei Posten JE WARENGRUPPE ab**
(`g.items.map(..., i) => i < 2`), **das sind 10 von 14** —
**waehrend *Scale list* daneben *,,Checked: 2 of 14"* meldet.**

`[read]` **Die Vorlage widerspricht sich selbst.** **Die Referenz
zeigt sie, wie sie ist** (E-69) — **gemeldet, nicht stillschweigend
begradigt.**

### A6 — G-353

**0 Karten gebaut — und der Punkt gehoert nicht in diesen Auftrag.**

`[cmd]` **`nutrition-g-0353-setup-karten-nach-dem-onboarding.md`
liegt in `docs/punkte/erledigt/`**, mit einer Abnahme vom
2026-09-07.

`[cmd]` **Aber die Abnahme handelt von etwas anderem als der Titel:**
sie misst die vier Achsen von `goal_type`, `subtype`, `phase_type`
und `difficulty_level` — **nicht von Setup-Karten.**

`[cmd]` **Und im Code steht `G-353` nirgends** — kein Treffer in
`apps/web/src`.

`[read]` **Zwei Moeglichkeiten, und ich kann sie nicht
auseinanderhalten:** entweder wurde der Punkt unter falschem Titel
geschlossen, oder die Abnahme eines anderen Punktes ist in diese
Datei geraten. **Das ist eine Frage an den Orchestrator, keine
Bauaufgabe.**

`[read]` **Der Chatauftrag nennt G-353 nicht** — nur die
Punktdatei tut es. **Ich habe nichts gebaut, statt zu raten, was
gemeint war.**

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen (1 Fehler behoben, eigener)
    pnpm --filter web test      1500 pass, 0 fail
    encoding-pruefen            20.897 Dateien, sauber

`[cmd]` **Waechter-Erwartung `nutrition/mockup-referenz.tsx`
25 → 27** — die zwei neuen Kacheln, mit Sabotageprobe belegt.

### Was unberuehrt blieb

`[cmd]` **`dev@lumeos.app` hat unveraendert 4 Listen** — alle
Schreibvorgaenge liefen auf `test-user@lumeos.local`.

**Nichts in `supabase/`. Nicht committet, nicht gestaget.**

### Geaendert

    nutrition/mockup-referenz.tsx    EinkaufReferenz (2 Kacheln)
    nutrition/ansicht.tsx            falscher Vermerk -> Referenz
    shell/__tests__/v2-attrappen     25 -> 27

## Abnahme

**2026-09-08, Orchestrator.** **Alle Bedingungen mit Zahlen, und
die Praemisse widerlegt.**

### Er hat meinen Auftrag berichtigt

`[read]` **Ich schrieb: *,,keine Route nennt `shopping`, in `apps/`
steht der Name nur in Tests."***

`[cmd]` **Wahr als Zeichenkette, falsch als Aussage ueber das
System.**

`[cmd]` **Der Strang laeuft ueber Server-Aktionen, nicht ueber
`app/api/`:** `einkaufsliste-lesen.ts` **(drei Lesewege),**
`einkaufsliste-aktionen.ts` **(sieben Schreibwege, darunter
`wochenlisteErzeugen` und `listeArchivieren`), das Fenster und der
Reiter.**

`[read]` **Dieselbe Klasse wie meine Marketplace-Behauptung: nach
Namen gesucht statt nach der Sache.**

### Die Zahlen

    A1  4 Posten / 28 Wocheneintraege
        Reis    7 x 250 g = 1750 g
        Lachs   1260 g, Quark 1260 g, Banane 1050 g
    A2  0 von 4 -> 1 von 4, im Fenster geklickt
    A3  offen 2 -> 1, archiviert 0 -> 1, alle vier Posten erhalten
    A4  1 Kachel / 1 mit Daten / 0 mit Leerhinweis
    A5  1 angebunden / 1 Referenz, neu gebaut

`[read]` **A1 belegt die Forderung:** **sieben Tage Reis ergeben
eine Zeile mit der Grammsumme** — **und die Gruppierung liegt in der
DB-Funktion, nicht in der Oberflaeche.**

`[cmd]` **Und A3 ist der Beleg fuer E-64:** **Archivieren aendert
den Status, es loescht nicht.**

### A5 war die echte Luecke, und die Begruendung war falsch

`[cmd]` **Der Reiter trug *,,Kein Mockup-Gegenstueck"*** — **mit dem
Grund, `einkauf` komme in `module-nutrition.jsx` nicht vor.**

`[cmd]` **Falsche Datei:** `module-nutrition-spec.jsx:476` **traegt
ihn als Unterreiter von *Meal plans*** — **mit *Shopping list*
(fuenf Kategorien, 14 Posten) und *Scale list*.**

`[read]` **Ein Vermerk mit falschem Grund** — **G-368, jetzt zum
dritten Mal.**

`[cmd]` **Beide portiert, Sabotageprobe: eine Marke entfernt ->
26 statt 27, zurueck -> gruen.**

### Ein Widerspruch im Mockup selbst

`[cmd]` **Die Vorlage hakt die ersten zwei Posten je Kategorie ab —
10 von 14** — **waehrend *Scale list* daneben *,,Checked: 2 of 14"*
sagt.**

`[read]` **Er zeigt es unveraendert und meldet es** — **statt das
Soll still zu begradigen.**

`[cmd]` **Genau E-69: das Mockup ist Referenzobjekt, nicht SSOT** —
**wer es korrigiert, loescht die Spur.**

### Und A6 hat einen Fehler von mir gefunden

`[cmd]` **G-353 lag in `erledigt/` mit einer Abnahme, die die vier
Zielachsen misst** — **nicht Setup-Karten.**

`[read]` **Die Abnahme gehoerte zu G-352.** `[read]` **Ich habe sie
in die falsche Datei geschrieben.**

`[read]` **Er hat nichts gebaut, statt zu raten.** `[cmd]` **G-353
ist wieder offen.**

**Abgenommen.**

