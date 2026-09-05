---
nr: G-345
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-344
entscheidung: E-64
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 1450c56b
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-345 — die Oberflaeche fuer Einkaufslisten

## Befund

Aus E-64, 2026-09-07.

`[cmd]` **Vier Listen und 17 Posten liegen auf `dev`** — **niemand
zeigt sie.**

## Drei Orte

### 1 · Im Planner, an der Woche

`[cmd]` **Dort steht bereits *,,28 Eintraege · Copy week"*** —
**daneben gehoert *Einkaufsliste*.**

`[read]` **Der Hauptfall** (E-64): wer eine Woche plant, kauft fuer
die Woche.

### 2 · Am Rezept

`[cmd]` **Flow 8 funktioniert im Schema** — drei Listen liegen so
auf `dev`.

`[read]` **Der Nebenfall:** ein Rezept, das nicht im Plan steht.

### 3 · Ein eigener Reiter

`[read]` **Wo man alle Listen sieht, offene und archivierte.**

`[cmd]` **Supplements haben `tab-inventory-echt.tsx`** — **dieselbe
Machart.**

## Was die Liste kann

    abhaken       is_checked je Posten
    bearbeiten    Posten hinzufuegen, Menge aendern
    archivieren   status = 'archived' -- Loeschen heisst archivieren
    teilen        SPEC_03 Flow 8, Schritt 6

`[read]` **Eine Einkaufsliste ist ein Beleg, was man gekauft hat** —
**deshalb archivieren statt loeschen.**

## Was zuerst steht

`[read]` **C-407 baut den Leseweg** — **ohne ihn gibt es nichts
anzuzeigen.**

## Auftrag — die Oberflaeche fuer Einkaufslisten

**Mitbeauftragt: G-347, G-346.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.** `[cmd]` **C-407 ist erledigt** — der
Leseweg steht.

### 1 · G-347 — die Anzeige zieht nach (zuerst)

`[cmd]` **`NT` liegt jetzt bei Makronaehrstoffen, ohne
`parent_code`.** `[cmd]` **Und *Fettbegleitstoffe* ist neu** — **es
gehoert direkt nach *Fette*.**

`[cmd]` **`CHORL` traegt kein `parent_code`** (E-63) — **es
erscheint nicht in der Fettsumme.**

`[cmd]` **Und vier `strong_avoid`-Stellen unter `apps/`:**
`vorlieben-aktionen.ts`, `daumen-schreiben.ts`, `food-search.ts`,
`daumen-schreiben.test.ts`.

`[read]` **Der CHECK kennt den Wert nicht mehr** — **beim naechsten
Schreibversuch faellt er.** `[cmd]` **Die mittlere Stufe bleibt ueber
`intolerances`, Laktose liefert `strong / intolerance` mit -25.**

### 2 · G-345 — drei Orte fuer Einkaufslisten

`[cmd]` **Vier Listen und 17 Posten liegen auf `dev`** — **niemand
zeigt sie.**

**Im Planner, an der Woche.** `[cmd]` **Dort steht bereits *,,28
Eintraege · Copy week"*** — **daneben gehoert *Einkaufsliste*.**
`[read]` **Der Hauptfall** (E-64): wer eine Woche plant, kauft fuer
die Woche.

**Am Rezept.** `[cmd]` **Flow 8 funktioniert im Schema** — drei
Listen liegen so auf `dev`. **Der Nebenfall.**

**Ein eigener Reiter.** `[read]` **Wo man alle Listen sieht, offene
und archivierte.** `[cmd]` **Supplements haben
`tab-inventory-echt.tsx`** — **dieselbe Machart.**

**Was die Liste kann:**

    abhaken       is_checked je Posten
    bearbeiten    Posten hinzufuegen, Menge aendern
    archivieren   status = 'archived'
    teilen        SPEC_03 Flow 8, Schritt 6

`[read]` **Loeschen heisst archivieren** — **eine Einkaufsliste ist
ein Beleg, was man gekauft hat.**

### 3 · G-346 — braucht Quick-Add eine Mahlzeit?

`[cmd]` **Der Posten haengt an einer echten Mahlzeit** — **fuer den
Tag muss eine angelegt sein.**

`[read]` **Drei Wege, und der dritte scheint richtig:**
**Quick-Add fragt nach der Zeit und legt die Mahlzeit mit an** —
**ein Schritt, zwei Wirkungen.** `[read]` **Das folgt E-58: die Zeit
ordnet zu.**

`[read]` **Miss, was es kostet** — **und melde, wenn es eine
Produktentscheidung bleibt.**

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** — **der Leseweg ist C-407.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    NT              bei Makronaehrstoffen, am Schirm
    Fettbegl.       nach Fette, CHORL ohne Fettsumme
    strong_avoid    vier Stellen weg, Gate gruen
    Wochenliste     im Planner erreichbar
    archivieren     Liste verschwindet aus offen, bleibt lesbar
    Bildschirmfoto  vorher / nachher

## Bericht

**Claude Code, 2026-09-07.** Dev-Server auf 3200 **nicht neu
gestartet**. **Nichts in `supabase/` geaendert, nichts auf `dev`
geschrieben** — alle Messungen lesend, kein Klick, der anlegt.

---

## 1 · G-347 — die Anzeige zieht nach (zuerst, wie beauftragt)

### Die vier `strong_avoid`-Stellen

`[cmd]` **Der CHECK kennt den Wert nicht mehr** — gemessen am
2026-09-07: `hard_exclude, soft_dislike, neutral, like, boost`.
**C-408 hat ihn entfernt.**

    daumen-schreiben.test.ts   ZUSAGE  — die Erlaubnisliste
    vorlieben-aktionen.ts:48   Kommentar
    daumen-schreiben.ts:49     Kommentar
    food-search.ts:760         Kommentar

`[read]` **Nur die erste war gefaehrlich** — die drei anderen sind
Text. **Aber sie war auf eine Weise gefaehrlich, die nicht auffaellt:**

`[cmd]` **Der Waechter waere NICHT rot geworden.** Er prueft, ob der
Daumen (`like`) in der Liste steht — **und `like` steht in beiden
Fassungen.** `[read]` **Ein zu grosser Erlaubnisbereich faellt nie
auf** (G-343: der Test kann seiner eigenen Liste nicht
widersprechen). **Jetzt prueft er zusaetzlich die Abwesenheit.**

### Und ein Kommentar war doppelt falsch

`[cmd]` **`food-search.ts:760` sagte:** *,,bei leerer Anfrage
schliesst `food_search` auch `strong_avoid` aus (075, Zeile 455)"*.

`[cmd]` **Beides ueberholt:** `strong_avoid` ist aus dem CHECK, **und der Block
um Zeile 455 traegt `diet_type`** (gemessen: `'hard'`,
`'diet_type'`, `profile_diet_type`), **nicht den Ausschluss.**

`[cmd]` **Die Wirkung bleibt, ihre Quelle wechselte** — die starke
Stufe kommt jetzt aus `intolerances` (075, Zeile 403).
`[cmd]` **Gemessen: Suche *milch* auf `dev` liefert 98 Treffer mit
`strong`.** **Sie wirkt.**

### NT und Fettbegleitstoffe

`[cmd]` **Live geprueft:** `NT` traegt `Makronährstoffe` ohne
`parent_code`, `CHORL` traegt `Fettbegleitstoffe` ohne
`parent_code`.

`[cmd]` **Beides ist seit G-343 gebaut** — `NT` faellt auf die
Protein-Karte, `Fettbegleitstoffe` steht direkt hinter *Fette*.
**Am Schirm nachgemessen:** Kohlenhydrate > Fette >
**Fettbegleitstoffe** > Protein > … , **und *Sonstige* ist weg.**

`[cmd]` **`Stickstoff` steht heute nicht im Seitentext** — nicht
weil er fehlt, sondern **weil die Protein-Karte zugeklappt ist**
(21 Eintraege). **Kein Befund.**

---

## 2 · G-345 — drei Orte, ein Fenster

### Zuerst zwei Berichtigungen zur Auftragsangabe

`[cmd]` **Es sind DREI Listen auf `dev`, nicht vier** — alle
`source_type = 'recipe'`, zusammen **11 Posten**, keiner abgehakt.

`[cmd]` **Und `status` kennt DREI Werte**, nicht zwei: `open`,
`completed`, `archived`. **`completed` steht dazwischen** —
abgearbeitet, aber noch nicht weggeraeumt.

### Was die Datenbank vorgibt

`[cmd]` **Rechte von `authenticated`, gemessen:**

    shopping_lists        SELECT, INSERT, UPDATE   — KEIN DELETE
    shopping_list_items   SELECT, INSERT, UPDATE, DELETE

`[read]` **Das Fehlen von DELETE ist die Entscheidung, nicht ein
Versehen.** *,,Loeschen heisst archivieren — eine Einkaufsliste ist
ein Beleg, was man gekauft hat."* **Die Datenbank setzt E-64 durch,
nicht die Oberflaeche.**

`[read]` **Posten duerfen weg** — das ist Bearbeiten.

### Gebaut

    einkaufsliste-lesen.ts       ladeEinkaufslisten, ladeEinkaufsliste,
                                 ladeWochenliste
    einkaufsliste-aktionen.ts    abhaken, Menge, entfernen,
                                 hinzufuegen, archivieren, erzeugen
    einkaufsliste-modal.tsx      das eine Fenster, auf ZiehModal
    tab-einkauf-echt.tsx         der eigene Reiter, mit Archiv
    tab-planner-echt.tsx         der Knopf an der Woche
    page.tsx / ansicht.tsx       Reiter `einkauf` angemeldet

### Am Schirm, nachgemessen

`[cmd]` **Im Planner steht jetzt:**

    1.9. – 7.9. · Gefuellte Aufbauwoche · 28 Eintraege ·
    Copy week · Einkaufsliste

`[read]` **Genau dort, wo E-64 es verlangt.** `[cmd]` **Keine
Konsolenfehler.**

`[cmd]` **Der Reiter zeigt die drei Listen** mit Namen, Herkunft und
Fortschritt, plus einen Umschalter fuers Archiv.

`[cmd]` **Das Fenster:** 3 Posten, 3 Haken, Archivieren, Teilen,
**ziehbar** (`titelleiste: 1`) — **dieselbe Huelle wie Suche
(G-320/321), Mahlzeiten-Modal (G-336) und Quick-Add (G-340).**

### Ein Fehler beim Bauen, gefunden bevor er wirkte

`[cmd]` **Ich hatte `ladeEinkaufsliste` als WERT in eine
`'use client'`-Datei importiert.** `[read]` **Das zieht
`next/headers` ins Browserbuendel und ergibt HTTP 500 auf der
ganzen Seite — bei gruenem Typecheck.** **Dreimal gemessen: G-74,
G-79, G-97.**

`[cmd]` **Behoben ueber eine Serveraktion** (`listeHolen`), **und
ein Waechter prueft es jetzt fuer alle drei Client-Dateien.**

### Der Rezeptweg war schon da — und ist ein zweiter Schreibweg

`[cmd]` **Flow 8 ist seit G-289 gebaut:** `EinkaufslisteKarte` in
`rezepte-echt.tsx`, mit eigenem Abhaken ueber
`/api/nutrition/rezept` (`art: 'posten_haken'`).

`[read]` **Damit gibt es jetzt ZWEI Wege fuer dieselbe Spalte**
`is_checked` — meine Serveraktion und die Route. **Zwei Wahrheiten,
und die naechste Aenderung trifft nur eine.**

`[read]` **Ich habe ihn NICHT umgestellt** — der Auftrag nennt die
Rezeptkarte nicht, und sie funktioniert. **Der Grund steht als
Vermerk in `einkaufsliste-aktionen.ts`.**

**MELDUNG:** `rezepte-echt.tsx` gehoert auf `postenAbhaken` umgezogen,
damit es wieder EINEN Weg gibt. **Eigener Punkt.**

---

## 3 · G-346 — es bleibt eine Produktentscheidung

**Der Vorschlag:** Quick-Add fragt nach der Zeit und legt die
Mahlzeit mit an.

### Was es kosten wuerde: wenig

`[cmd]` **Die Bausteine stehen alle:**

    art: 'mahlzeit'      legt eine an (diary/route.ts)
    slotFuerZeit()       ordnet eine Zeit einem Slot zu (E-58)
    sicherstellen()      genau dieses Muster, in mahlzeiten.tsx:735

`[read]` **Der Bau waere klein** — Zeitfeld, Slotzuordnung, ein
zweiter Aufruf vor dem Posten.

### Aber eine Frage ist offen, und sie ist nicht technisch

`[cmd]` **Gemessen: das UNIQUE auf `(user_id, entry_date,
meal_type)` gibt es nicht mehr** (G-341). `[cmd]` **Und doppelte
Mahlzeitarten sind real:** `dev` hat an vier Tagen zwei `lunch`.

`[read]` **Damit kann *,,die Mahlzeit mit anlegen"* nicht stumm
wiederverwenden.** **Zwei Ausgaenge, beide vertretbar:**

    immer neu      22:00 legt eine zweite „Sonstiges" an, auch wenn
                   es schon eine gibt — sauber, aber der Tag fuellt
                   sich mit Einzelmahlzeiten
    wiederverwenden  wenn die Zeit in denselben Slot faellt, an die
                   bestehende haengen — sparsamer, aber es braucht
                   eine Regel, WANN zwei Buchungen dieselbe
                   Mahlzeit sind

`[read]` **E-58 sagt, dass die Zeit ZUORDNET** — es sagt nicht, dass
zwei Buchungen im selben Fenster dieselbe Mahlzeit sind.

### Und wie oft der Fall ueberhaupt auftritt

`[cmd]` **Gemessen: 0 von 30 Tagen auf `dev` haben keine
Mahlzeit.** `[read]` **Fuer jemanden, der regelmaessig erfasst, ist
die Sperre theoretisch.** `[read]` **Fuer einen NEUEN Nutzer ist sie
der Normalfall** — sein erster Eintrag faellt immer in einen leeren
Tag.

**MELDUNG: G-346 bleibt eine Produktentscheidung.** `[read]` **Der
Bau ist klein, die Regel dahinter nicht.** **Zu entscheiden: immer
neu, oder wiederverwenden — und wenn wiederverwenden, wann.**

---

## Waechter

`[cmd]` **Neu: `__tests__/einkaufsliste-drei-orte.test.ts`,
10 Waechter:**

    die Dateiproben finden ihre Dateien
    es gibt keinen Loeschweg fuer eine Liste (.delete() gezaehlt)
    das Fenster bietet Archivieren an, kein Loeschen
    kein Wert-Import aus dem Leseweg in Client-Dateien
    der Planner traegt den Knopf an der Woche
    es gibt einen eigenen Reiter, und er kennt das Archiv
    alle drei Orte benutzen DASSELBE Fenster
    abhaken, bearbeiten, teilen
    eine archivierte Liste laesst sich nicht mehr aendern
    kein await je Liste (G-252)

`[cmd]` **Zwei bestehende nachgezogen:**

    daumen-schreiben     `strong_avoid` aus der Erlaubnisliste,
                         plus eine Zusage auf seine Abwesenheit
    v2-attrappen         DREI LeerHinweis-Zweige -> VIER

`[read]` **Der zweite ist ein Beispiel fuer einen Waechter, der
funktioniert:** **er zaehlt, statt zu suchen** — und wurde rot, als
ein vierter Zweig entstand. **Genau dafuer war er gebaut** (G-289).

## Sabotageprobe: 12 Eingriffe, 12 Faelle

    faellt   eine Liste laesst sich loeschen
    faellt   archiviert wird nicht mehr ueber C-407
    faellt   der Wert-Import zieht den Server mit
    faellt   der Wochenknopf faellt weg
    faellt   der Knopf sagt immer dasselbe
    faellt   der Reiter ist nicht erlaubt
    faellt   das Archiv laesst sich nicht mehr zeigen
    faellt   der Reiter baut ein eigenes Fenster
    faellt   abgehakte Posten verschwinden
    faellt   archivierte Listen lassen sich abhaken
    faellt   ein await je Liste
    faellt   strong_avoid kommt in die Erlaubnisliste zurueck

`[cmd]` **Nach dem Rueckbau keiner rot.**

`[read]` **Der dritte ist der wichtigste** — er stellt genau den
Fehler wieder her, den ich beim Bauen gemacht hatte.

## Bildschirmfotos

    backup/g345-nachher-planner.png   Copy week · Einkaufsliste
    backup/g345-nachher-reiter.png    drei Listen, Archiv-Umschalter
    backup/g345-nachher-modal.png     Posten, Haken, Archivieren
    backup/g343-g347-vorher-nutrients.png  Kartenreihenfolge

## Laeufe

    pnpm --filter @lumeos/web test      1403 gruen, 0 rot  (+10)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.

## Datenstand nach dem Lauf

    dev: 3 Listen, 11 Posten, 0 abgehakt   — unveraendert

## Neue Befunde

    1  `rezepte-echt.tsx` hat einen ZWEITEN Schreibweg fuer
       `is_checked` (`/api/nutrition/rezept`, `art: 'posten_haken'`).
       Er gehoert auf `postenAbhaken` umgezogen — eigener Punkt.

    2  G-346 bleibt eine Produktentscheidung: der Bau ist klein,
       aber ohne UNIQUE braucht *,,Mahlzeit mit anlegen"* eine
       Regel, wann zwei Buchungen dieselbe Mahlzeit sind.

    3  Der Auftrag nannte vier Listen und zwei `status`-Werte —
       gemessen sind es drei und drei.

## Nicht getan

    nichts in supabase/ geaendert
    nichts auf dev geschrieben — kein Klick, der eine Liste anlegt
    G-346 nicht gebaut — gemessen und vorgelegt, wie beauftragt
    rezepte-echt.tsx nicht umgestellt — nicht im Auftrag
    nicht committet, nicht gestaged, nicht gepusht

## Abnahme

**2026-09-07, Orchestrator.**

### Die Oberflaeche steht, an drei Orten

`[cmd]` **Lese- und Schreibweg, ein Fenster auf der gemeinsamen
Huelle, der Knopf an der Planwoche, ein eigener Reiter mit Archiv.**

`[cmd]` **Zehn neue Waechter, 12 von 12 Sabotagen.**

`[read]` **Das Fenster auf der gemeinsamen Huelle ist die richtige
Entscheidung** — **dieselbe Machart wie `FoodSuchModal` (G-320) und
das Mahlzeiten-Modal (G-336).**

### G-347 zuerst, und mit einem Fund

`[cmd]` **Vier `strong_avoid`-Stellen bereinigt** — **davon eine
stille Zusage.**

`[cmd]` **Plus ein doppelt falscher Kommentar.**

`[read]` **Eine *stille Zusage* ist eine, die niemand bemerkt haette:
sie stand da, sie galt, und sie zeigte auf einen Wert, den die
Datenbank nicht mehr kennt.**

### Und meine Zahlen waren wieder falsch

`[cmd]` **Ich schrieb: vier Listen, zwei `status`-Werte.**
`[cmd]` **Gemessen: drei und drei.**

`[read]` **Die vierte Liste liegt beim Testkonto** — **zum fuenften
Mal `count(*)` ohne `user_id`.**

`[read]` **Und die `status`-Werte hatte ich aus dem Kopf zitiert,
statt den CHECK zu lesen:** `open`, `completed`, `archived`.

### G-346 bleibt eine Produktentscheidung

`[cmd]` **Ohne das entfallene UNIQUE ist offen, ob *Mahlzeit mit
anlegen* immer eine neue erzeugt oder eine bestehende
wiederverwendet.**

`[read]` **Das ist die Frage, die ich nicht gestellt hatte.**
`[read]` **Mein Vorschlag lautete *ein Schritt, zwei Wirkungen*** —
**und liess offen, was bei einer zweiten Erfassung um dieselbe Zeit
geschieht.**

`[read]` **Wer um 15:00 einen Kaffee und um 15:10 einen Keks
erfasst:** **eine Mahlzeit oder zwei?**

**Abgenommen.**

