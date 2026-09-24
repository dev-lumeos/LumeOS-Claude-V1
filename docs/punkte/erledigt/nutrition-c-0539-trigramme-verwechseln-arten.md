---
nr: C-539
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-538]
kind_von: C-538
entscheidung: null
erledigt: 2026-09-08
commit: 1bc924c1
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-08
---

# C-539 - Trigramme verwechseln Pute mit Huhn

## Befund

`[cmd]` **Selbst gemessen, mit der Vorgabeschwelle 0,3:**

    Haehnchenbrust gegrillt / gegrillte Huehnerbrust  0,4242
    Haehnchenbrust gegrillt / Huehnerbrust gegrillt   0,4839
    Haehnchenbrust gegrillt / Putenbrust gegrillt     0,5172
    Haehnchenbrust gegrillt / Vollmilch frisch        0,0000

`[read]` **Die FALSCHE Antwort hat den hoechsten Wert.**

`[cmd]` **Und C-534 hat gemessen: die Haehnchenbrust-Kategorie
enthaelt 18 Haehnchen-, 14 Puten- und 3 Entenbrustzeilen.**

`[read]` **`gegrillt` und `brust` wiegen schwerer als das
Tier** ? **Trigramme kennen keine Bedeutung.**

## Warum es zaehlt

`[cmd]` **C-538 speichert Bild, Visionsergebnis und
Deklaration** ? **die ZUORDNUNG kommt spaeter.**

Tom, 2026-09-08: *,,die mealcam wird schon deterministisch
gebaut werden ueber mehrere layers"*

`[read]` **Dieser Befund ist ein Beleg dafuer: eine
Textaehnlichkeit allein reicht nicht.**

`[read]` **Und fuer einen Nutzer mit Gefluegelallergie oder
einem Wettkampfplan ist Pute statt Huhn keine Kleinigkeit.**

## Was zu messen ist

    A  wie oft passiert es? Zwanzig Gerichte gegen
       den Katalog, und wie oft steht die falsche
       Art oben?
    B  hilft eine hoehere Schwelle? MISS es --
       0,5172 liegt UEBER 0,4242, eine Schwelle
       dreht die Reihenfolge nicht um.
    C  was unterscheidet die Arten? Ein eigenes Feld,
       ein Stichwortabgleich, die Kategorie?
    D  was tun andere? Die Recherche zu den
       Ernaehrungsapps liegt in der Sitzung vom
       2026-09-08.

`[read]` **MESSEN und EMPFEHLEN** ? **die Bauform der
Zuordnung ist Toms Entscheidung.**

## Abnahmebedingungen

    A1  wie oft steht die falsche Art oben? Zahl an
        zwanzig Gerichten.
    A2  hilft eine Schwelle? Gemessen, nicht vermutet.
    A3  ein Vorschlag, was die Arten trennt.
    A4  KEINE Umsetzung.

## Bericht, 2026-09-24

### A1 - 20 Eingaben gegen den gesamten BLS-Katalog

Je Eingabe wurde der Rang-1-Treffer aus allen 7.140
`nutrition.foods` nur nach
`similarity(search_fold(Eingabe), search_fold(name_de))` bestimmt.
Die erwartete Art kommt aus der menschlichen Eingabe, nicht aus dem
Treffer.

| Eingabe | Erwartet | Rang 1 | Score | Art richtig? |
|---|---|---|---:|---|
| Entenbrust gegrillt | Ente | Ente Brust, mit Haut, gegrillt | 0,5313 | ja |
| Forelle gegrillt | Forelle | Forelle gegrillt | 1,0000 | ja |
| Garnelen gekocht | Garnele | Garnele/Granat/Krabbe, gekocht | 0,4667 | ja |
| gegrillte Haehnchenkeule | Huhn | Haehnchen Brustfilet, gegrillt | 0,4474 | ja |
| gegrillte Huehnerbrust | Huhn | Pute Brust, ohne Haut, gegrillt | 0,3947 | **nein: Pute** |
| gegrillte Putenbrust | Pute | Pute Brust, ohne Haut, gegrillt | 0,5000 | ja |
| gegrillter Entenschenkel | Ente | Ente Schenkel, mit Haut, gegrillt | 0,5000 | ja |
| gegrilltes Schweinesteak | Schwein | Schwein Kammsteak, gegrillt | 0,5758 | ja |
| Haehnchenfilet gegrillt | Huhn | Haehnchen Brustfilet, gegrillt | 0,6875 | ja |
| Haehnchenschnitzel gebraten | Huhn | Haehnchenschenkel/Hähnchenkeule, gebraten im Ofen | 0,5238 | ja |
| Huhn Brust gegrillt | Huhn | Ente Brust, mit Haut, gegrillt | 0,4848 | **nein: Ente** |
| Kabeljau geduenstet | Kabeljau | Dorsch/Kabeljau, geduenstet | 0,7407 | ja |
| Kalbsschnitzel gebraten | Kalb | Kalbsschnitzel mehliert, gebraten | 0,7273 | ja |
| Lachs gegrillt | Lachs | Lachs gegrillt | 1,0000 | ja |
| Lammkotelett gegrillt | Lamm | Lamm Kotelett, gegrillt | 0,8000 | ja |
| Putenkeule gebraten | Pute | Pute Keule, ohne Haut, gebraten ohne Fett (Ofen) | 0,4250 | ja |
| Rindersteak gegrillt | Rind | Rindersteak gegrillt | 1,0000 | ja |
| Schweineschnitzel gebraten | Schwein | Schweineschnitzel natur, gebraten | 0,8125 | ja |
| Seehecht gebraten | Seehecht | Seehecht gebraten ohne Fett (Pfanne) | 0,5294 | ja |
| Truthahnbrust gegrillt | Pute | Tomate gegrillt | 0,3448 | **nein: andere Speise** |

Von 20 Rang-1-Treffern haben **zwei die falsche Tierart** und einer ist
eine ganz andere Speise: **17/20** treffen die erwartete Art, **3/20**
sind nicht der erwartete Katalogtyp.

### A2 - eine höhere Schwelle korrigiert keine Reihenfolge

| Schwelle | Treffer geliefert | ohne Treffer | erwartete Art auf Rang 1 | falsche Tierart auf Rang 1 | andere falsche Speise |
|---:|---:|---:|---:|---:|---:|
| 0,3 | 20 | 0 | 17 | 2 | 1 |
| 0,4 | 18 | 2 | 17 | 1 | 0 |
| 0,5 | 14 | 6 | 14 | 0 | 0 |
| 0,6 | 8 | 12 | 8 | 0 | 0 |

Die Schwelle sortiert nicht um. Bei 0,4 bleibt `Huhn Brust gegrillt`
vor der Ente falsch; bei 0,5 verschwinden Fehler nur, weil sechs von
zwanzig Eingaben keinen Treffer mehr bekommen. Das ist Unterdrücken,
nicht Korrigieren.

### A3 - was Arten tatsächlich trennt

`nutrition.foods` hat kein Artenfeld, nur Namen, `category_id`,
`processing_level` und `is_prepared_dish`. Kategorien sind ungeeignet:
`Haehnchenbrust & Filet` enthält 35 Einträge aus Huhn, Pute und Ente;
`Magerer Seefisch` enthält 74 Einträge aus fünf der gemessenen Arten.
Elf betroffene Kategorien tragen mehr als eine Art.

Ein kontrollierter Stichwortschlüssel würde die zwei Tierverwechslungen
in dieser Probe verhindern: Eine Begrenzung auf Huhn/Pute/Ente lässt bei
allen 20 Eingaben die erwartete Art im Kandidatenraum. Er löst nicht die
ganze Zuordnung: `gegrillte Huehnerbrust` wird danach zu `Huehnerbruehe`
statt zu Pute. Art ist eine notwendige Nebenbedingung, keine Entscheidung.

Eine einzelne Spalte wäre ebenfalls zu klein: in einem gemessenen
Zwölf-Arten-Vokabular nennen 53 Foods zwei und ein Food drei Arten, etwa
`Doener Kebab ... (Kalb/Rind)` oder `Gemuese-Eintopf ... Rind- und
Schweinefleisch`.

**Empfehlung an Tom, keine Umsetzung:** eine kuratierte, mehrwertige
Food-Arten-Relation mit kanonischen Codes und Synonymen
(`Huhn`/`Haehnchen`/`Huehner`, `Pute`/`Truthahn` usw.). Die spätere
deterministische Bildschicht liefert Arten-Kandidaten mit Konfidenz; erst
dann begrenzt LumeOS den BLS-Kandidatenraum, nutzt Trigramme nur für
Schreibweise, Schnitt und Zubereitung und lässt den Nutzer deklarieren.
Fehlt eine belastbare Art, darf es keine automatische Auswahl geben.

Das entspricht den dokumentierten Bausteinen anderer Katalog- und
Vision-Systeme: Vision-Labels tragen Beschreibung und Score, aber keine
BLS-ID ([Google Vision](https://cloud.google.com/vision/docs/labels));
Open Food Facts führt kanonische Taxonomie-IDs mit Synonymen für die Suche
([Taxonomie-Dokumentation](https://openfoodfacts.github.io/search-a-licious/users/explain-taxonomies/)).

### A4 - keine Umsetzung

Keine Tabelle, Spalte, Funktion, Migration oder Katalogzeile wurde für
C-539 angelegt oder geändert. `supabase/` enthält dafür nur den bereits
live eingespielten C-538-Stand und dessen nachgeschärfte Sicherheitsprobe.

## Abnahme

**2026-09-08, Orchestrator. Ein Messauftrag.**

    17 von 20 richtig
     2 falsche Tierart auf Rang 1
     1 ganz andere Speise

### A2 ist beantwortet, und zwar mit Nein

> *,,Hoehere Schwellen beheben keine Reihenfolge: bei 0,5
verschwinden die Fehler nur, weil 6 von 20 Eingaben KEINEN
Treffer mehr erhalten."*

`[read]` **Genau meine Vermutung im Auftrag, jetzt belegt** ?
**eine Schwelle dreht keine Reihenfolge um, sie schneidet nur
ab.**

### Und die Kategorien taugen auch nicht

`[cmd]` **Die Kategorie *Haehnchenbrust & Filet* enthaelt Huhn,
Pute und Ente; 53 Foods tragen in der Stichprobe zwei Tierarten,
eines drei.**

### Seine Empfehlung

> *,,Kuratierte MEHRWERTIGE Food-Arten-Relation mit kanonischen
Codes und Synonymen; Art VOR dem Trigramm-Ranking einschraenken,
bei unsicherer Art KEINE automatische Auswahl."*

`[read]` **Mehrwertig, weil ein Gericht zwei Arten tragen
kann** ? **53 Foods belegen es.**

`[read]` **Und *,,bei unsicherer Art keine automatische
Auswahl"* ist dieselbe Haltung wie bei Vitamin E (C-500) und
den Portionen (C-512): lieber eine Luecke als eine geratene
Zahl.**

`[cmd]` **Quellen: Google Vision (Labels mit Score, ohne
Katalog-ID), Open Food Facts (kanonische Taxonomie mit
Synonymen).**

**Abgenommen. Die Kuration entscheidet Tom.**
