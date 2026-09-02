---
nr: G-136
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: E-48
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 8ecaa528
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/naehrstoff-anzeige.ts
zahlen: null
---

# G-136 - Zwei Kartenzuordnungen sind Auslegung

## Befund

(neu
  2026-08-20). **Entscheidung fuer Tom.** Aus G-129.

  `[cmd]` **Die Acht-Karten-Liste aus GO-22 nennt sie nicht** — der
  Agent hat entschieden und markiert:

  | | wohin | Begruendung |
  |---|---|---|
  | **`FIBT` Ballaststoffe** | **Kohlenhydrate** | *„sind Kohlenhydrate; Cronometer ebenso"* |
  | Wasser, Alkohol, Organische Saeuren, Rohasche | **Sonstige** | *„die Liste laesst ihnen keinen anderen Platz"* |

  `[cmd]` **Je eine Zeile in `karteFuerWurzel`**, falls es anders sein
  soll.

  `[read]` **Beide sind vertretbar.** Ballaststoffe unter Kohlenhydrate
  ist fachlich richtig. **Wasser bei *„Sonstige"* ist der schwaechere
  Teil** — es ist einer der sechs Naehrstoffklassen, aber eine eigene
  Karte fuer einen Eintrag waere seltsam.

## Entschieden: E-48, 2026-09-02

Tom hat *Sonstige* aufgeloest — **drei der vier bekommen eine eigene
Karte:**

    FIBT    bleibt bei den Kohlenhydraten          (bestaetigt)
    WATER   Karte "Wasser" als Fluessigkeitsbilanz --
            zwei Positionen: Trinkwasser aus dem Wassermodul,
            Wasseranteil aus den Lebensmitteln
    OA      Karte "Organische Saeuren" --
            nicht-essentielle Wirkstoffe, fuenf Kinder
    ALC     Karte "Genussmittel" --
            energieliefernde Nicht-Naehrstoffe

`[read]` **Und ein Hinweis aus G-291, der beim Bauen zaehlt:**
`[cmd]` **`FIBT` gehoert auf die Kohlenhydrat-Karte, aber nicht als
Kind unter `CHO`** — als Kind ueberstiegen die Teile das Elternteil.

`[read]` **Karte und Hierarchie sind zwei verschiedene Sachen.**

`[cmd]` **`ASH` gehoert zu den Mineralstoffen** — Tom, 2026-09-02:
*,,die Summe aller lebensnotwendigen Mineralstoffe und Spurenelemente
in einem Lebensmittel."*

`[cmd]` **Gemessen: sechzehn Mineralstoff-Wurzeln stehen bereits
nebeneinander, `ASH` mitten darin.** `[read]` **Keine neue Karte
noetig.**

`[read]` **Aber dieselbe Vorsicht wie bei `FIBT`:** `[cmd]` **`ASH`
ist die Summe der uebrigen fuenfzehn, nicht ihr Elternteil** — **auf
derselben Karte ja, als `parent_code` nein.**

`[read]` **Und *Wasser* ist der erste modulschneidende Naehrwert:**
**die Trinkmenge kommt aus einem anderen Modul.** **Wo sie liegt und
wie sie hereinkommt, ist zu messen.**

## Auftrag — vier Karten statt *Weitere*

**Mitbeauftragt: G-134.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Die vier Quellen, gemessen

`[cmd]` **Code: `apps/web/src/lib/nutrition/mikro-lage.ts`, 376
Zeilen.** **Sieben Gruppen:** Vitamine fettloeslich, Vitamine
wasserloeslich, Mineralstoffe, Spurenelemente, Aminosaeuren,
Fettsaeuren, **Weitere.**

`[cmd]` **Zeile 325-327:** `const rest = stoffe.filter(...)` →
`titel: 'Weitere'` — **dort landet, was in keine Gruppe faellt.**

`[cmd]` **Daten: `nutrition.nutrient_defs`, vier Wurzeln:** `WATER`
(0 Kinder), `ALC` (0), `OA` (5 Kinder), `ASH` (0).

`[cmd]` **Die fuenf Saeuren:** Essigsaeure, Zitronensaeure,
Milchsaeure, Aepfelsaeure, Weinsaeure.

`[cmd]` **Spec: E-48.** `[cmd]` **G-239 hat schon einmal gemessen,
dass 100 von 154 Zeilen in keine Gruppe fielen** — *Weitere* ist der
Auffangzustand seither.

### Was zu bauen ist

    FIBT    bleibt bei den Kohlenhydraten
            ABER nicht als Kind von CHO -- G-291 hat gemessen,
            dass die Teile dann das Elternteil uebersteigen
    WATER   Karte "Wasser" als Fluessigkeitsbilanz, zwei Positionen:
            Trinkwasser (aus dem Wassermodul) und Wasseranteil
    OA      Karte "Organische Saeuren" -- nicht-essentielle
            Wirkstoffe, fuenf Kinder
    ALC     Karte "Genussmittel" -- energieliefernde
            Nicht-Naehrstoffe
    ASH     zu den Mineralstoffen, mit Erklaerungstext:
            Summe aller Mineralstoffe, im Labor durch Verbrennen
            bei ueber 500 Grad bestimmt, liefert keine Energie
            ABER nicht als parent_code der fuenfzehn -- sonst
            zaehlt es doppelt

`[read]` **Karte und Hierarchie sind zwei verschiedene Sachen.**

`[cmd]` **`hydration.tsx` existiert, 490 Zeilen** — **miss, ob die
Trinkmenge dort liegt, bevor du die Wasserkarte baust.**

### G-134 — die Filtergruppen

`[cmd]` **E-49: `diet` mischt drei Fragen.**

    Ernaehrungsform    vegan, vegetarian, halal, kosher
    Naehrwert          high_protein, high_fiber, low_carb, low_fat
    Verarbeitung       whole_food, ultra_processed
    Allergene          contains_gluten, contains_lactose,
                       contains_nuts

`[cmd]` **`thai_food` faellt heraus** — eine Kueche. **Bis
`preferred_cuisines` kommt: unter Ernaehrungsform geparkt, mit
Vermerk.**

`[read]` **Und die Zuordnung gehoert als Spalte in
`tag_definitions`** — **heute steht sie nur in der Oberflaeche, an
einer Stelle, die kein Waechter erreicht.**

`[read]` **Wenn die Spalte Codex braucht: melden, nicht selbst
anlegen.**

### Was nicht zu tun ist

**Kein `parent_code` fuer `FIBT` oder `ASH`.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    vier Karten      am Schirm, mit ihren Stoffen
    ASH              bei den Mineralstoffen, mit Erklaerung
    FIBT             auf der CHO-Karte, kein Kind
    Weitere          was bleibt uebrig? gezaehlt
    Wasserkarte      zwei Positionen, oder gemeldet was fehlt
    Filtergruppen    vier statt vier falsche
    Bildschirmfoto   vorher / nachher

## Bericht

**Claude Code, 2026-09-02.** Mitbeauftragt G-134; beides in diesem
Bericht. **Nicht committet, nichts auf `dev@lumeos.app` geschrieben,
kein Schema angefasst** (138 Definitionen, 98 mit `parent_code`, 14
Tags — vor und nach dem Lauf gleich).

### Zwei Auftragsfragen, gemessen

**1 · Liegt die Trinkmenge in `hydration.tsx`?** — **Ja.**

`[cmd]` **`hydration-day-read.ts:24-46` liefert bereits beide
Positionen:** `logged_ml` (getrunken, aus `water_logs`) und `food_ml`
(Wasseranteil, aus `daily_summary.water_g`), dazu
`food_ml_missing` fuer die Vollstaendigkeit.

`[read]` **Deshalb habe ich KEINE zweite Fluessigkeitsbilanz
gebaut.** Die Karte ordnet `WATER` ein — die Bilanz bleibt im
Wassermodul, und der Erklaerungssatz verweist darauf. **Eine zweite
waere eine zweite Wahrheit ueber dieselbe Zahl.**

**2 · Wo wirkt die Gruppierung?** — **Nicht in `mikro-lage.ts`.**

`[cmd]` **Der Auftrag nennt `mikro-lage.ts:325-327`** (`const rest =
… → titel: 'Weitere'`). `[cmd]` **Gemessen: die Datei hat ausser
Tests KEINEN Aufrufer.** `[cmd]` **G-249 hat die zweite Ansicht
entfernt** — der Nutrients-Reiter laeuft ueber
`NaehrstoffOrdnungTab`, und die Karten vergibt
`naehrstoff-anzeige.ts:karteFuerWurzel`.

`[read]` **Ich habe zuerst in `mikro-lage.ts` gebaut und es
zurueckgenommen** — dort waere es eine tote zweite Wahrheit
gewesen. **Die Aenderung sitzt jetzt an der Stelle, die wirkt.**

`[read]` **Die Sammelkarte heisst dort *Sonstige*, nicht
*Weitere*** — dasselbe Verhalten, anderer Name.

### G-136 / E-48 — vier Karten

`[cmd]` **Gemessen am 2026-09-02:** `WATER`, `ALC`, `OA` und `ASH`
tragen alle `group_de = 'Makronaehrstoffe'` und fielen damit in
*Sonstige*.

    vorher                          nachher
    Sonstige   4 Wurzeln + CHORL    Wasser              1 Eintrag
                                    Organische Saeuren  6 Eintraege
                                    Genussmittel        1 Eintrag
                                    Elemente  16 -> 17  (mit ASH)
                                    Sonstige            1 (CHORL)

`[cmd]` **Am Schirm gemessen:** elf Karten, vier mit
Erklaerungssatz.

**`FIBT` war bereits geloest** — `karteFuerWurzel` gibt seit jeher
*Kohlenhydrate*, `parent_code` ist leer, und
`insights-read.ts:270-282` fuehrt es als eigenen Knoten NEBEN `CHO`.
`[cmd]` **Der Grund steht dort mit Zahlen: als Kind gerechnet
ergaeben die Teile 320,78 gegen 281,86** — mehr als das Ganze.
**Nichts zu tun.**

**`ASH` ist Karte, nicht Elternteil.** `[cmd]` **Kein
`parent_code`, kein Baumknoten** — ein Waechter prueft beides,
denn sonst zaehlte die Elemente-Karte Summe UND Bestandteile.

`[read]` **Vier von elf Karten tragen einen Satz** — nur wo der
Name irrefuehrt. **Ein Satz, der nichts hinzufuegt, wird beim Lesen
uebersprungen und macht die naechsten wertlos.**

### G-134 / E-49 — drei Fragen in einem Feld

`[cmd]` **Gemessen: neun Tags tragen `tag_type = 'diet'`** — vier
Naehrwertangaben (`high_protein`, `low_carb`, `low_fat`,
`high_fiber`), zwei Ernaehrungsformen, `halal`, `kosher`,
`thai_food`.

`[cmd]` **Die drei Gruppen standen in der Oberflaeche bereits**
(Ernaehrungsform, Naehrwert, Verarbeitung) — **aber `halal` und
`kosher` fehlten in jeder.** `[read]` **Sie waren nicht erreichbar,
obwohl die Tags seit jeher in der Datenbank stehen** (`sort_order`
130, 140).

`[cmd]` **Am Schirm gegengeprueft, dass der Filter wirkt:** 4.970
-> **4.440 Treffer** mit `halal`. `[cmd]` **Ohne Vorlieben: 7.140 ->
6.379** — die Differenz sind Toms gespeicherte Vorlieben (C-94),
die auf jede Suche wirken.

**`thai_food` ist geparkt, nicht eingeordnet.** `[read]` **Eine
Kueche ist keine Ernaehrungsform** — wer thai isst, isst nicht *nur*
thai. **Sie steht mit Vermerk `Thai (Kueche — geparkt)` dort, bis
`preferred_cuisines` kommt;** ein vorhandener Filter, den niemand
mehr findet, waere schlimmer als einer an der falschen Stelle.

### Zu melden: die Spalte in `tag_definitions`

`[cmd]` **`tag_definitions` hat neun Spalten und KEINE fuer die
Untergruppe:** `code`, `name_de`, `name_en`, `tag_type`,
`is_exclusion_relevant`, `icon`, `sort_order`,
`requires_macro_check`, `macro_rule`.

`[read]` **Die Zuordnung steht damit weiter nur in der
Oberflaeche** (`tab-foods.tsx:FILTERGRUPPEN`) — genau der Zustand,
den E-49 beheben will. **Der Auftrag sagt: wenn die Spalte Codex
braucht, melden statt selbst anlegen.** **Hiermit gemeldet.**

`[read]` **Was die Spalte tragen muesste:** `ernaehrungsform`,
`naehrwert`, `verarbeitung`, `allergen`, spaeter `kueche`.
**Solange sie fehlt, ist die Trennung eine Anzeigeentscheidung, die
jede zweite Oberflaeche neu treffen muss.**

### Nachweis

    Karten          11, davon Wasser 1, Saeuren 6, Genussmittel 1
    Elemente        16 -> 17 (mit ASH)
    Sonstige        nur noch CHORL
    Erklaerungen    4 von 11, am Schirm sichtbar
    FIBT            Karte Kohlenhydrate, kein parent_code
    ASH             Karte Elemente, kein Baumknoten
    halal/kosher    erreichbar, Filter wirkt (4.970 -> 4.440)
    thai_food       geparkt, mit Vermerk
    Bilder          backup/g136-nachher.png, g134-nachher.png

### Gate und Sabotageprobe

    pnpm gate        15 von 15 Tasks, 1.301 Tests, 0 Fehler
    Sabotageprobe    21 von 21 gefangen
    neuer Waechter   karten-und-filtergruppen.test.ts, 10 Proben

### Ein bestehender Waechter hielt den alten Zustand fest

`[cmd]` **`naehrstoff-anzeige.test.ts:146` pruefte
`karteFuerWurzel('WATER', …) === 'Sonstige'`** — den Zustand vor
E-48.

`[read]` **Was er sichert, gilt weiter** (die drei Makro-Aeste
tragen eigene Karten, *Sonstige* faengt weiter auf) — **er prueft
jetzt die neue Zuordnung, mit allen vier Wurzeln einzeln.**

## Abnahme

**2026-09-02, Orchestrator.**

### Meine Fundstelle war die falsche

`[read]` **Mein Auftrag nannte `mikro-lage.ts:325-327`.**

`[cmd]` **Gemessen: die Datei hat ausser Tests keinen Aufrufer.**
`[cmd]` **G-249 hat die zweite Ansicht entfernt** — der
Nutrients-Reiter laeuft ueber `NaehrstoffOrdnungTab`, **die Karten
vergibt `naehrstoff-anzeige.ts:karteFuerWurzel`.**

`[read]` **Er hat zuerst dort gebaut und es zurueckgenommen** —
*,,dort waere es eine tote zweite Wahrheit gewesen."*

`[read]` **Ich habe eine Datei gemessen, die aussah wie die
richtige, ohne ihre Aufrufer zu zaehlen.** **Dieselbe Klasse wie die
drei Funktionen ohne Aufrufer.**

### Die vier Karten stehen

`[cmd]` **`WATER`, `ALC`, `OA` und `ASH` trugen alle
`group_de = 'Makronaehrstoffe'`** und fielen damit in *Sonstige*.

    vorher                       nachher
    Sonstige  4 Wurzeln + CHORL  Wasser              1
                                 Organische Saeuren  6
                                 Genussmittel        1
                                 Elemente  16 -> 17  (mit ASH)
                                 Sonstige            1 (CHORL)

`[cmd]` **Elf Karten, vier mit Erklaerungssatz.**

`[read]` **Und seine Begruendung fuer *nur vier*:** *,,Ein Satz, der
nichts hinzufuegt, wird beim Lesen uebersprungen und macht die
naechsten wertlos."*

### `FIBT` war bereits geloest

`[cmd]` **`karteFuerWurzel` gibt seit jeher *Kohlenhydrate*,
`parent_code` ist leer, `insights-read.ts:270-282` fuehrt es als
eigenen Knoten neben `CHO`.**

`[cmd]` **Mit Zahlen belegt: als Kind gerechnet ergaeben die Teile
320,78 gegen 281,86** — **mehr als das Ganze.**

`[read]` **Nichts zu tun** — **und er hat es gemessen, statt es zu
bauen.**

### Die Trinkmenge liegt schon dort

`[cmd]` **`hydration-day-read.ts:24-46` liefert beide Positionen:**
`logged_ml` aus `water_logs`, `food_ml` aus `daily_summary.water_g`,
**dazu `food_ml_missing`.**

`[read]` **Deshalb keine zweite Fluessigkeitsbilanz** — **die Karte
ordnet `WATER` ein, die Bilanz bleibt im Wassermodul.** `[read]`
*,,Eine zweite waere eine zweite Wahrheit ueber dieselbe Zahl."*

### G-134 — und ein Fund, den niemand gesucht hat

`[cmd]` **`halal` und `kosher` fehlten in jeder Gruppe der
Oberflaeche** — **sie waren nicht erreichbar, obwohl die Tags seit
jeher in der Datenbank stehen** (`sort_order` 130, 140).

`[cmd]` **Am Schirm belegt: 4.970 auf 4.440 Treffer mit `halal`.**

`[cmd]` **Und die zweite Zahl ist die interessantere:** ohne
Vorlieben 7.140 auf 6.379 — **die Differenz sind Toms gespeicherte
Vorlieben** (C-94), **die auf jede Suche wirken.**

`[cmd]` **`thai_food` steht als *Thai (Kueche — geparkt)*** —
`[read]` *,,ein vorhandener Filter, den niemand mehr findet, waere
schlimmer als einer an der falschen Stelle."*

### Und die Spalte fehlt weiter

`[cmd]` **`tag_definitions` hat neun Spalten, keine fuer die
Untergruppe.**

`[read]` **Er hat sie gemeldet statt angelegt** — richtig, das ist
Codex' Bereich. **Als C-390.**

**Abgenommen.**

