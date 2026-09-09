---
nr: C-454
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-453
entscheidung: null
beruehrt:
  tabellen: [medical.injection_logs]
zahlen:
  gemessen: 2026-09-08
  orte: 16
  konfigurationstabellen: 0
---

# C-454 — der Nutzer waehlt seine Punkte

## Was Tom beschreibt

Tom, 2026-09-08:

> der user waehlt: peptide oder enhanced, wieviel, nadel, moegliche
> injektionspunkte ? und wir verwalten es. rotationsplaene fuer alle
> injektionen gemaess KONFIGURIERTEN injektionspunkten. wenn er
> triceps waehlt weil er lokal ein tendonproblem hat, dann zeigen
> wir den triceps und keinen rotationsvorschlag, weil nur triceps
> vorhanden ist.
>
> ja wir kennen die ueblichen einstichstellen, das heisst aber
> nicht dass ein user nicht andere waehlen kann.

`[read]` **Der Katalog ist Vorschlag, nicht Vorgabe.**

## Was das Schema heute traegt

`[cmd]` **`medical.injection_sites`, 10 Spalten:**

    id, route, display_name
    minimum_rest_days + _reason
    rotation_required
    rotation_distance_mm
    rotation_quadrant_interval_days

`[cmd]` **KEINE `user_id`** ? **ein Katalog fuer alle.**

`[cmd]` **`medical.injection_logs`, 12 Spalten:** **was war.**

`[cmd]` **Und dazwischen: NICHTS.** `[cmd]` **Null Tabellen mit
`user_injection`, `injection_config`, `injection_plan` oder
`rotation` im Namen.**

`[read]` **Es fehlt die Ebene, die Tom beschreibt:** **was der
Nutzer fuer DIESE Substanz gewaehlt hat.**

## Was fehlt, in seinen Worten

    peptide oder enhanced      -> supplement_id, gibt es
    wieviel                    -> Dosis, gehoert zum Stack
    nadel                      -> je Substanz und Ort, nicht global
    moegliche injektionspunkte -> FEHLT VOLLSTAENDIG

`[read]` **Der vierte Punkt ist die Luecke** ? **eine Auswahl je
Nutzer und Substanz, aus dem Katalog ODER frei.**

## Was daraus folgt

**1** ? **Die Rotation laeuft ueber die KONFIGURIERTEN Punkte, nicht
ueber alle 16.**

`[read]` **Wer vier Orte gewaehlt hat, rotiert ueber vier.**
`[read]` **Wer einen gewaehlt hat, bekommt keinen Vorschlag** ? **es
gibt nichts zu waehlen.**

`[cmd]` **`suggestSite` in der Spec rechnet ueber alle Orte
(Zeile 138)** ? **das muesste auf die Auswahl eingeschraenkt
werden.**

**2** ? **Ein Ort ohne Rotation ist ein gueltiger Fall.**

`[read]` **Toms Trizeps-Beispiel:** **lokal, verletzungsnah, keine
Rotation.**

`[cmd]` **`rotation_required` steht in `injection_sites`** ? **aber
je ORT, nicht je Nutzer-Substanz-Paar.**

`[read]` **Und BPC-157 an der Problemstelle ist derselbe Fall**
(C-453).

**3** ? **Der Nutzer kann Orte waehlen, die der Katalog nicht
kennt.**

`[read]` **Trizeps steht nicht unter den 16.** `[cmd]` **Die
Muskelkarte hat ihn** (`tricep_l/r`).

`[read]` **Also: die Auswahl zeigt die Muskelkarte, nicht die
Katalogliste** ? **und der Katalog ergaenzt Ruhezeit, Volumen und
Nadel, wo er den Ort kennt.**

`[read]` **Wo nicht, bleiben die Felder leer und benannt** ?
**E-72.**

## Die offene Frage

`[read]` **Traegt `injection_sites` dann noch alle Orte, oder nur
die mit Fachwissen?**

`[read]` **Ein Nutzer kann den Bizeps waehlen** ? **soll dafuer
eine Katalogzeile entstehen, oder bleibt er ein Ort ohne
Kataloguntermauerung?**

`[cmd]` **Die Spec beantwortet das nicht** ? `Injection Planner:33
**nennt `id` als *,,e.g. `glute_l`, `vglute_r`, `abd_l`"*, ohne zu
sagen, ob die Liste geschlossen ist.**
