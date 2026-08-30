---
nr: C-352
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-316
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-08-30
  ohne_name_de: 412
  sichtbar_gesamt: 412
  mit_name_en: 412
---

# C-352 — der Katalog hat keine deutschen Namen

## Befund

Aus C-316, Codex, 2026-08-30. **Vom Orchestrator nachgemessen.**

`[cmd]` **412 von 412 sichtbaren Substanzen haben kein `name_de`.**
`[cmd]` **Alle 412 haben ein `name_en`.**

`[read]` **Der Punkt hiess *,,NAC steht im Katalog ohne deutschen
Namen"*.** **NAC war kein Einzelfall, sondern ein sichtbares
Beispiel.**

`[read]` **Meine Frage im Auftrag lautete: *,,eine Zeile ist ein
Tippfehler, zwanzig sind ein Importfehler"*.** **Die Antwort ist eine
dritte: alle.**

## Was daran haengt

`[cmd]` **Die Oberflaeche ist dreisprachig angelegt (DE/EN/TH).**
`[read]` **Ein Katalog ohne deutsche Namen zeigt jedem Nutzer
englische Substanznamen** — unabhaengig von seiner Sprachwahl.

`[read]` **Und es ist dieselbe Klasse wie C-177:** eine Sprache ist
vorgesehen, und die Daten dahinter fehlen. `[cmd]` **Dort sind es
Thai-Aliase, hier deutsche Substanznamen.**

## Zu klaeren, bevor gebaut wird

**Woher kaemen die deutschen Namen?**

`[read]` **Substanznamen sind nicht frei uebersetzbar** — *NAC*
heisst auch auf Deutsch NAC, *Vitamin D3* ebenso. `[read]` **Aber
*Ashwagandha* gegen *Schlafbeere* ist eine Entscheidung, und
*Cholecalciferol* gegen *Vitamin D3* auch.**

`[cmd]` **Der Medikamentenkatalog hat dasselbe Problem von der
anderen Seite:** `medication_products` traegt DE=0 bei 448
Produkten.

`[read]` **Also keine Uebersetzungsaufgabe, sondern eine Frage nach
der Quelle** — **und die gehoert Tom vorgelegt, nicht geraten.**

## Praezisiert, 2026-08-30

**Tom hat den Zuschnitt bestaetigt:** *,,fuer welche der 412 lohnt
sich ein deutscher Name? Und die Antwort waere eine kurze Liste,
keine Katalogarbeit."*

### Drei Faelle, gemessen an echten Namen

    Glucosamine              -> Glucosamin        Nomenklatur
    L-Citrulline             -> L-Citrullin       nur die Endung
    Insulin Glargine         -> Insulin glargin   INN, amtlich
    Testosterone Isocaproate -> Testosteronisocaproat

    Gotu Kola                -> Indischer Wassernabel?
    Cistanche                -> bleibt

    GHRP-6, AOD-9604, BAM15  -> bleiben           Codes
    Andarine (S4)            -> bleibt            Forschungscode
    1-Andro (1-DHEA)         -> bleibt            Szenename

`[read]` **Der erste Fall ist keine Uebersetzung, sondern
Nomenklatur** — `-ine` wird `-in`, `-ate` wird `-at`, und fuer
Wirkstoffe gibt es den INN mit amtlicher deutscher Schreibweise.

`[read]` **Der zweite ist eine Entscheidung, und meist gegen den
deutschen Namen:** *Gotu Kola* heisst *Indischer Wassernabel*,
**aber niemand sucht danach.** `[cmd]` **Die Suche findet heute ueber
`name_en`** — ein deutscher Name, den keiner eintippt, macht sie
schlechter.

`[read]` **Der dritte hat nichts zu uebersetzen.**

### Was daraus folgt

`[cmd]` **Ein leeres `name_de` mit Rueckfall auf `name_en` ist der
gebaute Weg** — gemessen in G-253.

`[read]` **Also nicht *,,412 Namen beschaffen"*, sondern messen, wie
viele in den ersten Fall fallen.** `[read]` **Das sind die, bei denen
ein deutscher Name eine Regel ist und keine Meinung** — und nur die
gehoeren gefuellt.

## Auftrag — die Nomenklaturfaelle zaehlen

**Mitbeauftragt: C-358.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · C-352 — nicht 412 Namen, sondern eine Liste

**Tom, 2026-08-30:** *,,fuer welche der 412 lohnt sich ein deutscher
Name? Und die Antwort waere eine kurze Liste, keine Katalogarbeit."*

`[read]` **Der Punkt oben nennt drei Faelle.** **Miss, wie viele in
den ersten fallen** — **wo ein deutscher Name eine Regel ist und
keine Meinung.**

    Nomenklatur    -ine -> -in, -ate -> -at, INN mit amtlicher
                   deutscher Schreibweise
    Meinung        Gotu Kola gegen Indischer Wassernabel
    nichts         GHRP-6, AOD-9604, Andarine (S4)

`[read]` **Nur die erste Gruppe fuellen.** `[read]` **Und wenn ein
Name unsicher ist, bleibt er leer** — `name_en` ist der gebaute
Rueckfall.

`[cmd]` **Kein Katalogausbau** — es geht um Namen, nicht um
Beschreibungen oder Evidenzstufen.

### 2 · C-358 — abgelaufene Aktionen

`[cmd]` **Zwei `dev`-Zeilen tragen vergangenes `expires_at` und
`status = 'pending'`.**

`[read]` **Das ist eine Entscheidung, keine Bauarbeit** — **miss den
Umfang und leg die drei Wege vor:** Schreibweg auf `expired`, Filter
in der Funktion, oder Vermerk in der Anzeige.

`[read]` **Und die Frage dahinter: wer schreibt?** **Einen
Hintergrundlauf gibt es nicht, und ein Lesevorgang, der schreibt, ist
eine eigene Klasse.**

### Nachweis

    Nomenklaturfaelle      Zahl, Liste
    gefuellt               wie viele, je mit Regel
    unsicher geblieben     wie viele, mit Grund
    abgelaufene Aktionen   Zahl, drei Wege vorgelegt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
