---
nr: C-382
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-319
entscheidung: E-45
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-02
---

# C-382 — wer entscheidet, ob ein Plan editierbar ist?

## Befund

Aus G-319, Claude Code, 2026-09-02.

Tom: *,,der coach oder derjenige der den plan fuer marketplace
erstellt definiert ob er editierbar ist."*

`[cmd]` **Diese Aussage hat keine Entsprechung im Schema.**

`[cmd]` **`nutrition.meal_plans` traegt `darf_weiterverkaufen boolean
NOT NULL DEFAULT true`** — **und E-42 sagt ausdruecklich, das sei
Weiterverkaufs-, nicht Bearbeitungsschutz.**

`[read]` **Die Sperre haengt heute an der Herkunft** —
`coach_created`, `marketplace` — **nicht an einer Wahl des
Erstellers.**

## Der Widerspruch zu E-42

`[cmd]` **E-42, 31.08.:** *,,Editieren darf nie gesperrt werden — der
Nutzer besitzt seinen Plan."*

Toms Begruendung damals: *,,wenn wir den einschraenken dass er nicht
editieren kann dann bescheisst er sich ja selber."*

`[read]` **Das galt fuer den eigenen Plan.** `[read]` **Ein gekaufter
oder vom Coach vergebener ist ein anderer Fall:** **der Ersteller hat
ein Interesse daran, dass sein Plan bleibt, wie er ist.**

## Zu entscheiden

**Soll es eine Spalte `darf_bearbeiten` geben, die der Ersteller
setzt?**

`[read]` **Dafuer:** ein Coach-Plan, den der Klient umbaut, ist nicht
mehr der Plan des Coaches — **und die Compliance-Auswertung misst
etwas anderes als vereinbart.**

`[read]` **Dagegen:** E-42s Argument gilt weiter — **wer nicht
aendern darf, traegt beim Loggen etwas Falsches ein.**

`[read]` **Ein dritter Weg: bearbeiten erzeugt eine Kopie.** `[cmd]`
**Der Weg dafuer stand schon einmal** — *Kopie bearbeiten* aus G-306,
in G-315 entfernt, weil die Sperre wegfiel.

## Entschieden: E-45, 2026-09-02

Tom: *,,kein editierschutz aber rueckmeldeweg."*

    coach_created   editierbar, Coach wird benachrichtigt
    buddy           editierbar, von Hand oder per Anweisung
    marketplace     editierbar, aber nie weiterverkaeuflich --
                    Original wie Kopie

`[read]` **Damit ist der Punkt kein Entscheid mehr, sondern
Bauarbeit** — **drei Wege, je einer je Herkunft.**

`[cmd]` **Und `darf_weiterverkaufen` reicht nicht:** ein `boolean`
ueberlebt keinen neuen Plan, in den jemand den Inhalt kopiert.
`[read]` **E-45 schlaegt `stammt_aus_kauf uuid` vor** — eine Kennung,
die mitwandert.
