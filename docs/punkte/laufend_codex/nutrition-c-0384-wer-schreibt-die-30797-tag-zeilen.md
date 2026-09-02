---
nr: C-384
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-229
entscheidung: E-55
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-02
  zeilen: 30797
---

# C-384 — wer schreibt die 30.797 Tag-Zeilen?

## Befund

Aus E-55, 2026-09-02.

`[cmd]` **`nutrition.food_tags` traegt 30.797 Zeilen.**

`[cmd]` **`auto_tag_food` existiert nicht** — Codex hat es in C-366
gemessen, **`SPEC_06` nennt es als Trigger.**

`[read]` **Wer die Zeilen heute schreibt, ist ungemessen:** der
Import, ein Kettenschritt, oder etwas Drittes.

## Warum es vor E-55 gemessen wird

`[read]` **E-55 entscheidet: Kuration in einer zweiten Tabelle,
`food_tags_kuriert`.**

`[read]` **Sie schuetzt vor einem Schreiber** — **und wenn der
falsche gemeint ist, laeuft der echte weiter.**

`[cmd]` **Codex hat gemessen: der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung.** `[read]` **Zwoelf von vierzehn** —
**welche zwei nicht, und warum?**

## Zu messen

    wer schreibt         Import, Kettenschritt, Trigger?
    wann                 bei jedem Lauf, oder einmalig?
    die zwei Ausnahmen   welche Tag-Codes fasst der Import nicht an
    E-22                 vierzehn Definitionen -- alle vom selben
                         Schreiber?

## Auftrag — der Schreibweg und drei alte Ergebnisse

**Mitbeauftragt: C-386, C-30.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-384 — wer schreibt die 30.797 Tag-Zeilen?

`[cmd]` **`auto_tag_food` existiert nicht** — du hast es in C-366
gemessen, **`SPEC_06` nennt es als Trigger.**

`[cmd]` **Und du hast gemessen: der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung.** `[read]` **Zwoelf von vierzehn** —
**welche zwei nicht, und warum?**

`[read]` **E-55 entscheidet: Kuration in einer zweiten Tabelle,
`food_tags_kuriert`** — dasselbe Muster wie C-29 bei den
Anzeigenamen.

`[read]` **Sie schuetzt vor einem Schreiber.** **Wenn der falsche
gemeint ist, laeuft der echte weiter.**

### 2 · C-386 — sind die drei Reste aus C-35 eingeflossen?

`[cmd]` **C-35 haelt drei Erkenntnisse fest, die zwei verworfene
Modelle ueberlebt haben.** `[read]` **Sie stehen als Text, keine ist
gesichert.**

    Zubereitungsschluessel   "Banane roh" -> "Banane"
                             klingt nach name_display_de (C-29:
                             5.014 von 7.140 weichen ab)
    Vertreterregel           Gruppen ohne Vertreter 953 -> 0
                             klingt nach der Suchsortierung
                             (G-70, G-281)
    vier Erzeugnis-Zellen    Saft und Nektar trennen sich von der
                             Frucht (F201, F603, F310)
                             ungeprueft

`[read]` **Zu messen: eingeflossen oder verloren?**

`[cmd]` **Der dritte waere messbarer Zuwachs** — die Suche liegt bei
rund 84 Prozent auf dem Bodybuilder-Massstab.

### 3 · C-30 — Suche und Trefferliste auf Arten umstellen

`[read]` **Lies den Punkt und miss, ob er noch gilt.** `[cmd]`
**Seit G-281 traegt die Suche einen Treffergrund, seit C-355 einen
Herkunftsfilter.**

### Was nicht zu tun ist

**Keine Tabelle anlegen** — C-384 misst, E-55 baut spaeter.
**Keine Tags aendern.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Schreiber            wer, wann, wie oft
    die zwei Ausnahmen   welche Codes, warum
    drei Reste           je eingeflossen oder verloren
    C-30                 gilt / ueberholt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
