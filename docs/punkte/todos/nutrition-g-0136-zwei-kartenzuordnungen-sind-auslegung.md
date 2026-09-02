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