---
nr: G-293
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-293 — MacroDetail — die Fetthierarchie fehlt

## Befund

`[cmd]` **`SPEC_10` nennt `MacroDetail`:** *,,Parent/Child Hierarchie
(Fette: Gesaettigt/Ungesaettigt/Omega-3)"*.

`[cmd]` **Gebaut ist sie nicht.** `[cmd]` **Die Makrokachel zeigt
Protein, Kohlenhydrate, Fett als drei Balken** — **ohne Aufteilung.**

## Die Daten stehen

`[cmd]` **`FASAT`, `FAMS`, `FAPU`, `FAPUN3`, `FAPUN6` sind als
Naehrstoffe definiert und gefuellt.**

`[cmd]` **Und der Supplement-Bericht vom 30.08. hat mit `FAPUN3`
gerechnet** — die Kette traegt.

`[read]` **Was fehlt, ist die Anzeige:** Fett aufklappen und sehen,
woraus es besteht.

`[read]` **`SPEC_04` fuehrt 36 Fettsaeuren einschliesslich
Einzelfettsaeuren.** **Die Hierarchie ist die Frage, nicht die
Datenlage.**

## Auftrag

**Mitbeauftragt mit G-291 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in G-291)

`[cmd]` **Gebaut, aufklappbar, zwei Ebenen tief.** Fett 65,40 g ->
gesaettigt 14,07 / einfach 29,95 / mehrfach 11,29 -> Omega-3 4,44 /
Omega-6 6,84; **nicht aufgeschluesselt 10,09 g** (der BLS fuehrt
weitere Bestandteile).

`[cmd]` **Zwei eigene Fehler, gefunden vom Bildschirmfoto:** unter
den Kohlenhydraten standen erst **197,98 g „nicht aufgeschluesselt"**,
weil `STARCH` und `POLYL` im Baum fehlten — **mit ihnen bleiben
0,51 g.** Und `FIBT` gehoert **neben** `CHO`, nicht darunter: `CHO`
ist *Kohlenhydrate, VERFUEGBAR*, **als Kind gerechnet uebersteigen
die Teile das Ganze** (320,78 gegen 281,86).

`[read]` **Eine grosse Differenz ist ein Verdacht, keine Aussage** —
erst nachsehen, ob der Teil einen Code hat.

Bild: `backup/g291-makrodetail.png`

## Abnahme

**2026-08-31, mit G-291 abgenommen:** gebaut: zwei Ebenen, aufklappbar; STARCH und POLYL ergaenzt, FIBT
aus der CHO-Hierarchie genommen.
