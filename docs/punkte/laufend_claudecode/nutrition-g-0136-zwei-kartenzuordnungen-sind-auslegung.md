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
beruehrt:
  tabellen: []
  dateien: []
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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
