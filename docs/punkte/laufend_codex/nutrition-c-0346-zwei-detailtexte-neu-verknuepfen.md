---
nr: C-346
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-336
entscheidung: null
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: [nutrition.nutrient_details]
zahlen:
  gemessen: 2026-08-29
  falsch_zugeordnet: 2
  geprueft: 110
---

# C-346 — zwei Detailtexte neu verknuepfen

## Befund

Aus C-336, Claude Code, 2026-08-29. **Alle 110 Zeilen geprueft, genau
zwei falsch.**

    FD      Fluorid       traegt den Text von *dry matter*
    CHORL   Cholesterin   traegt den Text von Chlorid

`[read]` **`CHORL` ist medizinisch irrefuehrend:** Mangel *,,gestoerte
Verdauung, metabolische Alkalose"*, Quellen *,,Salz, Tomaten,
Oliven"*. `[cmd]` **Beide tragen auf `dev` an allen 90 Tagen echte
Werte** — der falsche Text steht live.

## Die Reparatur braucht kein Schreiben

`[cmd]` **Die richtigen Texte liegen in
`referenz/lumeos-2026/.../nutrientDetails.ts` unter `F`
(*,,Zahnschutz/Karies"*) und `CHOL` (*,,Hormone,
Zellmembranen"*)** — zwei Schluessel, die dieses Repo nicht
verwendet, **und beide wurden nie importiert** (`source_key` zeigt
null Treffer).

`[read]` **Also: neu verknuepfen, nicht neu schreiben.**

## Warum es passiert ist

`[read]` **Der Import glich auf Schluesselgleichheit ab.** `F` fand
keinen Partner und fiel weg, **`FD` fand einen und ging durch,
obwohl er etwas anderes bedeutet.** **Kein Fremdschluessel faengt
das** — die Zeile zeigt auf einen Code, den es gibt.

`[cmd]` **`nutrient_defs` ist unberuehrt und korrekt.**

## Auftrag — vier Datenbefunde, ein Thema

**Mitbeauftragt: C-212, C-211, C-333, C-49.** Bericht in diese Datei,
die anderen tragen einen Verweis.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

`[cmd]` **Und die Quellen sind jetzt bekannt und liegen im Repo:**

    docs/BrainstormDocs/Nutrition/BLS_4_0_Components_DE_EN.xlsx
      138 Komponenten mit Code, Name, Einheit, Gruppe, Formel
    docs/BrainstormDocs/Nutrition/BLS_4_0_Dokumentation_DE.pdf
      Kapitel 4.2 Datenherkuenfte, 4.3 fehlender Wert,
      4.4 Interpretation
    docs/BrainstormDocs/Nutrition/BLS_4_0_Daten_2025_DE.xlsx
      7.140 Lebensmittel, je Naehrstoff Wert + Datenherkunft +
      Referenz

`[read]` **Der Orchestrator hat sie am 29.08. nicht gelesen und
stattdessen aus der Datenbank rueckgeschlossen, was ein Code
bedeutet.** `[cmd]` **`nutrition.nutrient_defs` traegt ohnehin alles**
— Name, Einheit, Gruppe, Formel, `is_always_computed`, `parent_code`.
**Erst dort nachsehen, dann in der Quelle.**

### 1 · C-346 — zwei Detailtexte neu verknuepfen

`[cmd]` **`FD` (Fluorid) traegt den Text von *dry matter*, `CHORL`
(Cholesterin) den von Chlorid.** `[read]` **`CHORL` ist medizinisch
irrefuehrend** und steht live auf allen Tagen.

`[cmd]` **Die richtigen Texte liegen in
`referenz/lumeos-2026/.../nutrientDetails.ts` unter `F` und
`CHOL`** — nie importiert. **Neu verknuepfen, nicht neu schreiben.**

`[read]` **Und die Ursache gehoert behoben, nicht nur der Fall:** der
Import glich auf Schluesselgleichheit ab. **Wenn der Schritt bleibt,
wie er ist, passiert es beim naechsten Import wieder.**

### 2 · C-212 — `CHORL` haengt nicht im Naehrstoffbaum

`[read]` **Derselbe Naehrstoff, zweites Symptom.** `[cmd]`
`nutrient_defs` fuehrt `parent_code` — **miss, wo `CHORL` steht und
wo es hingehoert.** `[cmd]` **Die BLS-Komponententabelle nennt die
Gruppe: *Sonstige Naehrstoffe*.**

### 3 · C-211 und C-333 — Selen

`[read]` **Zweimal gemeldet:** einmal *,,fehlt im BLS-Katalog"*,
einmal *,,fehlt in der Bewertung auf dev"*. `[read]` **Miss, ob es
derselbe Befund ist.**

`[cmd]` **Die BLS-Komponententabelle sagt, ob Selen ueberhaupt eine
Komponente ist.** `[read]` **Wenn nicht, sind beide Punkte
gegenstandslos** — und das ist das Ergebnis.

### 4 · C-49 — die Klammer pruefen

`[read]` **Der Punkt heisst *,,Deckungsgrad, Warnungen und Tages-Score
— die drei Stufen danach"* und ist die Klammer ueber C-323 und
C-324.**

`[cmd]` **C-323 ist erledigt** (Dauerregel gebaut), **C-324
blockiert** (Vitamin A in IE, unvollstaendige Eingaenge).

`[read]` **Miss, was von C-49 uebrig ist** — und schliess ihn oder
sag, was bleibt. **Nicht bauen.**

### Was nicht zu tun ist

**Keine Texte schreiben** — nur verknuepfen.
**Keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil        erledigt / gebaut / offen / ueberholt
    FD und CHORL               Text vorher / nachher, beide Seiten
    Importursache              behoben oder benannt
    CHORL im Baum              Elternknoten vorher / nachher
    Selen                      ist es eine BLS-Komponente?
    C-49                       was bleibt, was faellt

`[read]` **Und wenn ein Punkt sich als gegenstandslos erweist: sagen,
nicht stillschweigend schliessen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
