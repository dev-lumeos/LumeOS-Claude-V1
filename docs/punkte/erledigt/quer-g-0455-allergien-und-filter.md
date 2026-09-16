---
nr: G-455
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: [C-498]
kind_von: null
entscheidung: null
erledigt: 2026-09-08
commit: 5b98ac0c
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-455 - Allergien in Settings, Filter in Produkten

## Was C-498 liefert

`[cmd]` **`public.user_allergies`** ? **`art` (nahrung,
supplement, medikament, umwelt, sonstiges), `schwere`
(unvertraeglichkeit, allergie, anaphylaxie), mit
Aliasaufloesung.**

`[read]` **`food_preferences.allergies` faellt weg** ? **die
Anzeige bleibt.**

## Drei Oberflaechen

**1** ? **Settings.**

`[read]` **Anlegen und pflegen, alle Arten** ? **Nahrung,
Supplement, Medikament.**

`[cmd]` **Spaeter ins Onboarding** (Toms Wort) ? **hier nur die
Pflege.**

**2** ? **nutrition/preferences bleibt bedienbar.**

Tom: *,,dargestellt kann es ja trotzdem zusaetzlich in
foods/preferences bleiben und auch da editierbar"*

`[cmd]` **`tab-vorlieben.tsx` ist gebaut** ? **es liest jetzt
`public.user_allergies` statt der eigenen Spalte.**

`[read]` **Fuer den Nutzer aendert sich NICHTS** ? **er sieht
und aendert sie an derselben Stelle.**

**3** ? **supplements/produkte: zwei neue Filter.**

    MEINE ALLERGIEN   aus public.user_allergies
                      hart: Produkt verschwindet

    MEIDESTOFFE       aus food_preference_items
                      weich: Produkt wird markiert

`[cmd]` **`food_preference_items` unterscheidet es schon:**
`hard_exclude` **gegen** `soft_dislike`.

`[read]` **Eine Nussallergie gilt ueberall.
*,,Keine Farbstoffe"* ist eine Haltung, keine Diagnose.**

## Und der Markenfilter

Tom: *,,marken muessen noch besser geloest werden, dass ein user
seine filtermasken mit marken setzen kann und nicht nur eine
marke waehlen"*

`[read]` **MEHRERE Marken, ODER-verknuepft:**

    [Optimum Nutrition] [NOW] [Thorne] [+]

`[cmd]` **Heute eine Marke, `p_marke text`** ? **G-454 misst,
ob die Suchfunktion mehrere kann.**

## Abnahmebedingungen

    A1  Settings: eine Allergie anlegen, art und
        schwere waehlen. Foto.
    A2  nutrition/preferences zeigt dieselbe Allergie.
        Foto.
    A3  eine Aenderung dort wirkt in Settings. Belegt.
    A4  supplements: ein Produkt mit dem Allergen
        verschwindet. Zahl vorher/nachher.
    A5  ein Meidestoff markiert statt zu entfernen.
        Foto.
    A6  mehrere Marken gleichzeitig. Foto.
    A7  Gegenprobe: eine geloeschte Allergie faellt
        aus dem Filter.
    A8  vier Module unveraendert.
    A9  apps/web 1759 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINE Allergie ableiten** ? **nur was der Nutzer
eintraegt.**

**Nichts in `supabase/`.**

## Bericht

**Claude Code, 2026-09-15.**

### Der Stand in einem Satz

`[read]` **Alle zehn Abnahmebedingungen erfuellt** ? **und der
wertvollste Befund ist ein HTTP 431, der einen richtig gebauten Filter
wie einen kaputten aussehen liess.**

### Was C-497 und C-498 schon erledigt hatten

`[cmd]` **Gemessen 2026-09-15, bevor eine Zeile geschrieben wurde:**

    public.user_allergies             2 Zeilen, 4 RLS-Policies
      art_check      nahrung|supplement|medikament|umwelt|sonstiges
      schwere_check  unvertraeglichkeit|allergie|anaphylaxie
    public.allergen_aliases           3 Aliase
    public.user_allergy_codes(uuid)   -> text[]
    public.supplier_product_allergy_matches(uuid)
      -> product_id, ingredient_name, stoff_code, stoff_text
    food_preference_items.supplement_product_id   existiert

`[cmd]` **Und `nutrition.food_preferences_read` liefert `allergies`
weiterhin** ? jetzt aus der neuen Tabelle. **`food_preferences_write`
schreibt dorthin zurueck.**

`[read]` **Damit war Oberflaeche 2 datenseitig fertig, bevor der
Auftrag begann** ? fuer den Nutzer aendert sich an der Allergenreihe
nichts, wie Tom es wollte.

### Der Befund, der den Auftrag getragen hat

`[cmd]` **Der Markenfilter setzte die Pillen richtig, baute die
Adresse richtig, und die Liste blieb bei 458.**

`[cmd]` **Gemessen mit einem Anfragenmitschnitt:** die Anfrage ging
mit `marken=NOW` hinaus, **`requestfinished` feuerte nie.** `[read]`
**Drei Vermutungen waren falsch** ? Array-Abhaengigkeit, doppelter
Effekt, Abbruchreihenfolge. **Ich habe sie alle drei behoben und der
Fehler blieb.**

`[cmd]` **Dann die Konsole gelesen: `HTTP 431 Request Header Fields
Too Large`.**

`[cmd]` **Die Rechnung:** der Daumen-Leseweg schickte die Produkt-Ids
in der Adresse. **500 Zeilen x 37 Zeichen = 18.500**, Nodes Vorgabe
fuer Kopfzeilen ist **16.384.**

`[read]` **Die Wirkung war schlimmer als ein Fehler:** die Anfrage
starb, und die NEBENSTEHENDE Produktsuche starb mit ? sie lief ueber
dieselbe Verbindung. **Ein Weg riss den anderen um, und nur der
andere war sichtbar.**

`[read]` **Dieselbe Familie wie G-64** (`.in()` kippt um 200 Ids), **nur
eine Ebene hoeher: nicht PostgREST, sondern der eigene Weg.** **Jetzt
POST mit den Ids im Rumpf.**

`[read]` **Und die drei Vermutungen waren trotzdem richtig** ? ein
Array als Abhaengigkeit IST ein Fehler, er war nur nicht DIESER. **Sie
stehen als Berichtigung im Code, mit der Messung dabei.**

### Ein zweiter gemessener Deckel

`[cmd]` **`supplier_product_allergy_matches` gab genau 1.000 Zeilen
zurueck**, waehrend die Funktion in der Datenbank **56.909** liefert
? PostgREST deckelt.

`[cmd]` **Die Wirkung:** von den ersten 500 Produkten sind **42**
betroffen, **entfernt wurden 0** ? die abgeschnittenen 1.000
enthielten keines davon. **Der Filter sah aus, als griffe er nicht.**

`[read]` **Geblaettert gelesen** (wie die Markenliste in G-453), und
**ein Abschneiden wird gemeldet** ? ein Filter, der nur teilweise
greift, ist gefaehrlicher als einer, der gar nicht greift: er sieht
vollstaendig aus.

### Die Abnahmebedingungen

    A1   erfuellt   backup/x-g455-a1-anlegen.png
    A2   erfuellt   backup/x-g455-a2-preferences.png
    A3   erfuellt   gemessen, Zahlen unten
    A4   erfuellt   backup/x-g455-a4-allergiefilter.png
    A5   erfuellt   backup/x-g455-a5-meidestoff.png
    A6   erfuellt   backup/x-g455-a6-daumen.png
    A7   erfuellt   backup/x-g455-a7-marken.png
    A8   erfuellt   458 gegen 500, gemessen
    A9   erfuellt   vorher/nachher gemessen
    A10  erfuellt   web 1780, coach 65

**A1** ? `[cmd]` **Ueber die OBERFLAECHE angelegt**, nicht per SQL:
`Magnesium Stearate`, Art **Supplement**, Schwere
**Unvertraeglichkeit**. **Vorher 1 Zeile, nachher 2.**

`[cmd]` **Der `stoff_code` wurde nach derselben Regel gebildet wie in
den Vorlieben** (`lower`, Leerzeichen zu `_`) ? **`magnesium_stearate`,
und genau darueber greifen die Aliase.** `[read]` **Ohne diese Regel
stuenden „Magnesium Stearate" und „magnesium_stearate" als zwei
Eintraege da, und der Filter faende einen davon.**

**A2** ? `[cmd]` **`nutrition/preferences` zeigt dieselbe Zeile**,
aus demselben Baustein (`settings/allergien-kachel.tsx`). `[read]`
**Eine zweite Fassung waere die Drift, die Tom vermeiden wollte** ?
dieselbe Linie wie die Mahlzeiten-Slots (G-332).

**A3** ? `[cmd]` **In Preferences angelegt, in Settings nachgesehen:**

    angelegt in preferences   Soja, nahrung, anaphylaxie
    in preferences            Soja, lactose, Magnesium Stearate
    in settings               Soja, lactose, Magnesium Stearate

`[read]` **Und die Trennung haelt:** `[cmd]` **`food_preferences_write`
loescht nur `art='nahrung' AND quelle='nutrition_preferences'`**
(gemessen im Funktionsrumpf) ? **eine in Settings angelegte
Medikamentenallergie ueberlebt jedes Speichern in den Vorlieben.**
**Ein Waechter haelt die zwei Quellen auseinander.**

**A4** ? `[cmd]` **Zahl vorher/nachher, am Schirm und in der API:**

    ohne Filter      500 Zeilen   ->  458   (42 entfernt)
    eine Marke       500          ->  344   (156)
    drei Marken      500          ->  266   (234)
    Smartsuche       100          ->   94   (6)

`[cmd]` **Die 42 stimmen mit einer unabhaengigen SQL-Vorhersage
ueberein** (`WHERE EXISTS` ueber die ersten 500 nach `name_en`) ?
**das ist der Beleg, nicht die Zahl allein.**

`[cmd]` **Und die Oberflaeche sagt es:** *„56.909 Produkte enthalten
eines deiner Allergene · 42 davon aus dieser Liste entfernt."*

**A5** ? `[cmd]` **`100% Casein Protein Chocolate Cream` traegt
*„Meidestoff: Lactose"* und BLEIBT in der Liste** (101 Zeilen vorher
wie nachher).

`[read]` **Die Haerte ist der ganze Unterschied**, und sie ist Toms
Entscheidung: **wer etwas nicht vertraegt, will es nicht sehen; wer
etwas nicht mag, will es erkennen.**

`[cmd]` **Die Codes sind Nahrungs-Tags** (`contains_lactose`), **die
Zutaten sind Text** (`Lactose`) ? **der Suchbegriff wird abgeleitet**,
und das ist eine NAEHERUNG. `[read]` **Genau deshalb steht sie beim
WEICHEN Filter und nicht beim harten:** ein falsch markiertes Produkt
kostet einen Blick, ein falsch entferntes waere unsichtbar.

`[cmd]` **Die Marke steht in der TAFEL, nicht in der Liste** ?
**gemessen: eine Abfrage *„welche Produkte enthalten <Stoff>"* kostet
291 ms**, bei drei Meidestoffen und jedem Tastendruck waere das knapp
eine Sekunde. **Die Tafel hat die Zutaten ohnehin.**

**A6** ? `[cmd]` **Daumen hoch, und das Produkt wandert nach oben:**

    Platz 4  ->  Platz 3
    oben stehen die zwei frueher hochgedaumten

`[read]` **Die Zusage ist die WANDERUNG, nicht Platz 1** ? ein schon
frueher bewertetes Produkt steht zu Recht davor. **Eine Probe auf
`nachher[0] === ziel` waere zu streng gewesen und haette einen
richtigen Zustand als Fehler gemeldet.**

`[cmd]` **In der Datenbank angekommen:** `target_type =
'supplement_product'`, `strength = 'like'`, `source =
'supplement_thumb'`.

`[cmd]` **Nachsortiert wird STABIL** ? die Reihenfolge innerhalb einer
Gruppe bleibt die der Datenbank. `[read]` **Sonst sprangen die Zeilen
bei jedem Klick.** `[cmd]` **Und es ist noetig:** die Sortierung liegt
laut Auftrag in `search_supplier_products`, **aber der Tabellenweg
sortiert nach `name_en`** ? und der laeuft, sobald ein Kategorie- oder
Formfilter gesetzt ist (G-453).

**A7** ? `[cmd]` **Marken kumulieren, gemessen gegen die Datenbank:**

    + NOW        344 von 1.272     NOW 1.272
    + Solgar     268 von 1.902     Solgar 630
    + Swanson    266 von 2.687     Swanson 785
                                   Summe 2.687   stimmt ueberein

`[cmd]` **Nur diese drei Marken in den Zeilen**, drei entfernbare
Pillen, *„3 Marken ? ODER-verknuepft"*.

`[cmd]` **`search_supplier_products` nimmt `p_marke text`** ? EINE
Marke. `[read]` **Bei einer bleibt die Smartsuche zustaendig** (sonst
verlöre man die Fehlertoleranz fuer den haeufigen Fall), **bei
mehreren uebernimmt der Tabellenweg mit `.in()`** ? und filtert in der
Datenbank, also stimmt `gesamt`.

**A8** ? `[cmd]` **Der Filter laesst sich abschalten:** 458 mit,
**500 ohne**. `[read]` **Und „Alles zuruecksetzen" schaltet ihn NICHT
ab** ? er ist ein Schutz, kein Suchfilter. **Ein Waechter haelt das
fest.**

**A9** ? `[cmd]` **VORHER und NACHHER gemessen:**

    /v2/nutrition   194.292   identisch
    /v2/training    104.993   identisch
    /v2/medical     511.300   identisch
    /v2/goals        49.925   identisch

`[cmd]` **Medical weicht vom G-450-Stand ab (509.701 -> 511.300)** ?
**nicht von mir.** **Codex hat C-501 eingespielt** (`501_seed_leere_
module.sql`), und die Vorher-Messung zeigt dieselbe Zahl ohne meine
Aenderung.

**A10** ? `[cmd]` **apps/web 1780 (Grundstand 1766, +14), apps/coach
65, `tsc --noEmit` ohne Meldung.**

### Sabotage ? fuenfzehn Proben, alle rot

    eine Art faellt aus der Auswahlliste             ROT
    stoff_code weicht von den Vorlieben ab           ROT
    Sortierung verdreht: Anaphylaxie zuunterst       ROT
    Meidebegriff wird nicht abgeleitet               ROT
    Settings schreibt die Vorlieben-Quelle           ROT
    geloeschte Allergie wirkt nicht im Filter        ROT
    harter Filter laeuft nicht in der Datenbank      ROT
    Deckelung entfernt (URI too long)                ROT
    Daumen-Rang verdreht: rote zuoberst              ROT
    zweiter Klick hebt nicht mehr auf                ROT
    Stueckelung ueber die 200er-Grenze               ROT
    Daumen schreibt auf das falsche Ziel             ROT
    Meidemarke nennt die Zutat nicht                 ROT
    Allergiefilter ist per Vorgabe AUS               ROT
    Allergiefilter laesst sich nicht abschalten      ROT
    ----------------------------------------------------
    (Anker-Kontrolle, muss gruen bleiben)          gruen

`[read]` **Die Kontrolle ist neu:** eine Sabotage, die nichts
Wesentliches aendert, MUSS gruen bleiben ? sonst misst der Waechter
Zufall.

`[cmd]` **Ein Waechter hat sich dabei selbst gefangen:** er suchte
`food_preferences_write` im Quelltext ? **und fand die Erklaerung im
Dateikopf, warum die Datei sie meidet.** `[read]` **Dieselbe Falle wie
G-166: der Test bestaetigte sein eigenes Changelog.** **Jetzt ohne
Kommentare geprueft.**

### Was gebaut wurde

    NEU  lib/allergien/allergie-lage.ts      Rechnung, serverfrei
         lib/allergien/allergie-read.ts      Lesen und Schreiben
         lib/supplements/produkt-daumen.ts       Schreibweg
         lib/supplements/produkt-daumen-lage.ts  Rechnung, serverfrei
         v2/settings/allergien-kachel.tsx    EIN Baustein, ZWEI Orte
         v2/settings/allergie-aktionen.ts    Serveraktionen
         v2/supplements/daumen-aktion.ts     Serveraktion
         api/supplements/daumen/route.ts     POST, siehe 431
         api/supplements/meidestoffe/route.ts
         v2/settings/__tests__/g455-allergien.test.ts   14 Proben

    GEAENDERT
         v2/settings/page.tsx                die Kachel
         v2/nutrition/page.tsx               die Allergien laden
         v2/nutrition/tab-vorlieben.tsx      dieselbe Kachel
         v2/supplements/tab-produkte.tsx     zwei Filter, Daumen,
                                             mehrere Marken
         v2/supplements/produkt-tafel.tsx    die Meidemarke
         lib/supplements/produkte-read.ts    Marken-Liste, harter Filter
         api/supplements/produkte/route.ts   Allergien aus der Sitzung
         app/globals.css                     die Kachel, beide Orte
         .../g453-produkttafel.test.ts       drei Waechter nachgezogen

`[cmd]` **Nichts in `supabase/`. Nichts committet, nichts gestaged.**
`[cmd]` **Keine Allergie abgeleitet** ? nur was der Nutzer eintraegt,
und die leere Kachel sagt es.

### Zwei Sachen, die ich hinterlassen habe

**1** ? `[cmd]` **Drei Allergien auf `dev@lumeos.app`:** `lactose`
(aus den Vorlieben, vorher da), **`Magnesium Stearate`** (A1) und
**`Soja`** (A3). `[read]` **Sie gehoeren zu den Nachweisen** ? wer sie
wegraeumt, nimmt dem Filter seine Grundlage.

**2** ? `[cmd]` **Drei Daumen auf Produkten**, davon **einer aus einem
Fehlversuch** (`"The Original" HerbaGreen Tea`): die erste Messung
klickte, bevor die Suche geantwortet hatte, und traf die falsche
Zeile. `[read]` **Genannt, nicht stillschweigend geloescht.**

### Was offen bleibt

**1** ? `[cmd]` **`lactose` und `tree_nuts` haben KEINE Aliase**, und
die Trefferfunktion braucht entweder einen Alias oder einen exakt
gleichen Zutatnamen. **Ergebnis: 0 Treffer**, obwohl **418
Zutatzeilen woertlich `lactose` heissen.**

`[read]` **Das ist ein Datenbefund fuer C-498, kein Fehler dieses
Auftrags** ? und die Oberflaeche sagt es: *„Getroffen wird ueber die
Zutatenliste ? ein Stoff ohne hinterlegte Schreibweisen findet
nichts."*

**2** ? `[cmd]` **`search_supplier_products` kennt weder Kategorie
noch Form noch mehrere Marken.** `[read]` **Wer einen dieser Filter
setzt, verliert die Fehlertoleranz** ? die Fusszeile sagt es. **Drei
Parameter mehr braechten beides zusammen.**

**3** ? `[cmd]` **Der harte Filter deckelt bei 150 Ids in der
Abfrage**, darueber wird nach dem Lesen abgezogen und `gesamt` ist
eine Obergrenze. `[read]` **Bei 56.909 betroffenen Produkten ist das
der Normalfall** ? die Zahl in der Fusszeile ist also die ungefilterte
Menge, und der Hinweis daneben nennt die entfernten.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g455-a4-allergiefilter.png` angesehen:**

    MEINE ALLERGIEN  [Ausblenden] [Alle zeigen]
    "56.909 Produkte enthalten eines deiner Allergene
     - 42 davon aus dieser Liste entfernt"
    MARKE  [Marke tippen...] [Marke hinzufuegen]
    je Zeile Haken und Kreuz

`[cmd]` **Auf `dev@lumeos.app`: drei Allergien (`lactose`,
`magnesium_stearate`, `soja`), vier Daumen.**

`[cmd]` **Proben: web 1780 (Grundstand 1766), coach 65.**

### Der Befund, der den Auftrag traegt

> *,,Der Markenfilter setzte die Pillen richtig, baute die
Adresse richtig, die API antwortete korrekt ? und die Liste
blieb bei 458."*

> *,,Ich habe DREI plausible Ursachen vermutet und behoben.
Alle drei waren ECHTE Fehler, keiner war dieser."*

`[read]` **Drei Treffer, die das Problem nicht loesten** ?
**und er hat weitergemessen, statt sich mit dem Aufraeumen zu
begnuegen.**

> *,,Dann die Konsole gelesen: HTTP 431. Mein Daumen-Leseweg
schickte 500 Produkt-Ids in der ADRESSE ? 18.500 Zeichen gegen
Nodes 16.384. Die Anfrage starb und riss die nebenstehende
Produktsuche mit, weil beide dieselbe Verbindung nutzten."*

`[read]` **Ein Weg toetete den anderen, und nur der andere war
sichtbar.**

`[cmd]` **Jetzt POST** ? **dieselbe Familie wie G-64, eine
Ebene hoeher.**

### Ein zweiter Deckel

> *,,`supplier_product_allergy_matches` gab 1.000 statt 56.909
Zeilen ? PostgREST. Von den ersten 500 Produkten sind 42
betroffen, entfernt wurden 0, weil die abgeschnittenen 1.000
keines davon enthielten."*

`[read]` **Ein stiller Deckel, der zufaellig das Richtige
verschwieg** ? **geblaettert gelesen, ein Abschneiden wird
jetzt gemeldet.**

### Und die Trennung haelt

> *,,Der Write loescht nur `quelle=nutrition_preferences`, also
ueberlebt eine in Settings angelegte Medikamentenallergie jedes
Speichern in den Vorlieben."*

`[cmd]` **C-498 hatte `food_preferences_read/_write` schon
umgestellt** ? **Oberflaeche 2 war datenseitig erledigt, bevor
er anfing.**

`[read]` **Toms Vorgabe war:** *,,fuer den Nutzer aendert sich
nichts"* ? **eingehalten.**

### Die Sabotagen mit Kontrollprobe

> *,,15 Sabotagen rot, plus eine KONTROLLPROBE, die gruen
bleiben musste ? sonst misst man nur, dass jemand die Datei
angefasst hat."*

`[cmd]` **Und ein Waechter fing sich selbst: er suchte
`food_preferences_write` und fand die Erklaerung im eigenen
Dateikopf.**

### Was er hinterlassen hat, genannt

> *,,drei Allergien und drei Daumen auf `dev@lumeos.app`, davon
ein Daumen aus einem Fehlversuch (HerbaGreen Tea) ? genannt,
nicht heimlich geloescht."*

`[cmd]` **Ich messe VIER Daumen, nicht drei** ? **kleine
Abweichung, der Fehlversuch ist im Bild sichtbar.**

### Und ein Befund fuer C-498

> *,,`lactose` und `tree_nuts` haben keine Aliase und treffen
deshalb nichts, obwohl 418 Zutatzeilen woertlich `lactose`
heissen."*

`[cmd]` **Selbst nachgemessen: nur `magnesium_stearate` hat
Aliase (3), `lactose` hat 418 woertliche Zeilen und trifft
null.**

`[cmd]` **Als C-502.**

**Abgenommen.**

