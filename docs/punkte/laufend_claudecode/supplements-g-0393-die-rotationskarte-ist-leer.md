---
nr: G-393
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-392
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/medical/injektion-karte.ts
zahlen:
  gemessen: 2026-09-08
  orte: 16
  gezeigt: 0
---

# G-393 — die Rotationskarte ist leer

## Befund

Tom, am Schirm: *,,die map hat er nie richtiggestellt."*

`[cmd]` **Die Kachel meldet:** *,,Keine Injektionsorte gelesen.
`medical.injection_sites` ist leer oder nicht lesbar."*

`[cmd]` **Nachgemessen: 16 Zeilen, RLS erlaubt `authenticated`
alles** (`injection_sites_select`, `USING true`).

`[read]` **Die Meldung ist falsch** ? **die Tabelle ist weder leer
noch unlesbar.**

## Die Ursache

`[cmd]` **`apps/web/src/lib/medical/injektion-karte.ts:46`:**

    KARTEN_ORTE = {
      deltoid:          ['delt_l', 'delt_r'],
      vastus_lateralis: ['quad_l', 'quad_r'],
      ventrogluteal:    ['vg_l',   'vg_r'],
      subcutaneous:     [],
    }

`[cmd]` **Der Kommentar darueber sagt es:** *,,`injection_sites`
fuehrt REGIONEN ohne Seite ? `deltoid`, `vastus_lateralis`,
`ventrogluteal`, `subcutaneous`. Kein `delt_l`/`delt_r`."*

`[read]` **Das war am Vormittag richtig.**

`[cmd]` **Seit C-445 fuehrt sie genau das:**

    abd_l      abd_r      delt_l     delt_r
    glute_l    glute_r    lat_l      lat_r
    quad_l     quad_r     sq_delt_l  sq_delt_r
    thigh_sq_l thigh_sq_r vglute_l   vglute_r

`[read]` **`KARTEN_ORTE['delt_l']` ist `undefined`** ? **die
Schleife findet nichts, `punkte` bleibt leer, die Kachel meldet
*leer*.**

## Und zwei Namen weichen ab

`[cmd]` **`INJEKTIONS_ORTE` in
`packages/ui/src/koerperkarte-pfade.ts`:**

    delt_l/r  pec_l/r   bicep_l/r  quad_l/r    (vorne)
    glute_l/r vg_l/r    lat_l/r    tricep_l/r  (hinten)

    Datenbank  vglute_l/r      Karte  vg_l/r
    Datenbank  abd, sq_delt, thigh_sq  -> kein Punkt
    Karte      pec, bicep, tricep      -> keine Zeile

`[cmd]` **Von 16 Orten und 16 Punkten decken sich zehn.**

## Auftrag

**Beauftragt am 2026-09-08.**

`[read]` **Herausgezogen aus G-392** ? **die Karte haengt nicht am
Hydrationsfehler, und Tom wartet seit Stunden darauf.**

### 1 · Die Zuordnung fallen lassen

`[read]` **`KARTEN_ORTE` war eine Bruecke zwischen Regionen und
Punkten.** `[read]` **Seit C-445 gibt es keine Regionen mehr.**

`[read]` **Die Zeile-Id IST die Punkt-Id** ? **direkt
verwenden.**

`[cmd]` **Und den Kommentar berichtigen** ? **er beschreibt einen
Stand von heute morgen.**

### 2 · Die zwei Luecken

`[cmd]` **`vglute_l/r` gegen `vg_l/r`** ? **eine Umbenennung.**

`[read]` **Welche Richtung?** `[cmd]` **Die Datenbank folgt der
Spec (`Injection Planner:48`), die Karte ist aelter** ? **also
weicht die Karte ab.**

`[read]` **Aber `packages/ui` gehoert Admin und Coach mit** ?
**melden, nicht anfassen.**

`[cmd]` **`abd`, `sq_delt`, `thigh_sq` haben keinen Punkt** ?
**das sind die SubQ-Orte.**

`[read]` **Miss, wo sie auf der Figur liegen muessten** ? **und
melde es.**

### 3 · Was die Karte zeigt, wenn nichts protokolliert ist

`[cmd]` **`injection_logs` hat 0 Zeilen.**

`[cmd]` **Der Kommentar in `injektion-karte.ts:59` sagt es
richtig:** *,,Ohne Protokollzeile bleibt `daysSince` `undefined`,
nicht 0 ? 0 hiesse *heute injiziert*."*

`[read]` **Also: alle Punkte in *nie*-Faerbung, und die Kachel sagt
warum** ? **E-72, kein leeres Bild.**

### Abnahmebedingungen

    A1  die Karte zeigt Punkte. Zahl: 16 Orte / davon auf
        der Figur. Bildschirmfoto.
    A2  KARTEN_ORTE entfernt, Kommentar berichtigt.
    A3  die zwei Luecken, je mit Vorschlag. Nichts in
        packages/ui geaendert.
    A4  ohne Protokollzeilen: alle Punkte *nie*, mit
        benanntem Hinweis. E-72.
    A5  1525 Tests bleiben gruen.

### Was nicht zu tun ist

**Nichts in `packages/ui`** ? **melden.**
**Den Hydrationsfehler nicht anfassen** ? **das ist G-392.**
**Nichts in `supabase/`.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
