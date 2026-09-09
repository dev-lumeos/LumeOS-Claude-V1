---
nr: G-392
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-390
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  module_mit_platz: 6
  betroffen: 1
---

# G-392 — der Hydrationsfehler am Wechslerplatz

## Befund

Aus G-390, Claude Code, 2026-09-08. **Durch Bisektion gefunden,
zweimal reproduziert.**

`[cmd]` **`ansicht.tsx:327`:**

    <div className="v2-kopf-mitte" data-tageswechsler />

`[cmd]` **Weg davon: sauber. Zurueck: rot.**

`[cmd]` **Und die Meldung passt:** *,,did not expect server HTML to
contain a `<div>` in `<div>`."*

## Was der Orchestrator nachgemessen hat

`[cmd]` **`v2-kopf-mitte` je Modul:**

    dashboard    1   dashboard-echt.tsx:83
    goals        1   ansicht.tsx:203
    nutrition    1   ansicht.tsx:314
    recovery     1   ansicht.tsx:207
    supplements  1   ansicht.tsx:327
    training     1   ansicht.tsx:161

`[read]` **Genau eines je Modul** ? **Claude Codes Vermutung, dass
`nutrition` zwei hat, stimmt NICHT.**

`[read]` **Damit faellt seine Spur** ? **`querySelector` nimmt den
ersten Treffer, aber es gibt nur einen.**

## Was der Unterschied sein koennte

`[cmd]` **Das naechste Geschwisterelement:**

    dashboard    </div>  -- Kopf endet
    goals        <div className="v2-module-actions"> <button>
    nutrition    <div className="v2-module-actions"> {/* Kommentar */}
    recovery     <div className="v2-module-actions"> <button>
    training     <div className="v2-module-actions"> <button>
    supplements  <div className="v2-module-actions"> <InEntwicklungKnopf>

`[read]` **Bei `supplements` folgt ein BAUTEIL, bei den anderen ein
`<button>`.**

`[cmd]` **Aber `InEntwicklungKnopf` steht in 36 Dateien, auch in
`goals` und `medical`** ? **die sauber sind.**

`[read]` **Also ist es nicht das Bauteil allein** ? **es ist eine
Vermutung, kein Befund.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Meldung genau lesen

`[cmd]` **`<div>` in `<div>`** ? **das ist eine
Verschachtelungsmeldung, keine Textmeldung.**

`[read]` **Miss, WELCHE zwei `div` gemeint sind** ? **die
Browsermeldung nennt beide, mit Attributen.**

`[read]` **Und ob der Server ein `div` liefert, wo der Client
keines erwartet, oder umgekehrt** ? **die Richtung steht in der
Meldung.**

### 2 · Der Vergleich, den du schon halb hast

`[cmd]` **Sechs Module tragen den Platz, eines faellt.**

`[read]` **Miss den vom Server gelieferten HTML-Text an dieser
Stelle, je Modul** ? **`view-source` oder die Netzwerkansicht.**

`[read]` **Nicht den gerenderten Baum** ? **der ist schon
repariert.**

`[cmd]` **Der Unterschied muss im Serverausgang stehen** ? **sonst
waere er nicht serverseitig.**

### 3 · Die Kopfstruktur

`[cmd]` **`supplements/ansicht.tsx` ist 474 Zeilen** ? **die
laengste der sechs.**

`[read]` **Miss, ob der Kopf dort anders aufgebaut ist** ?
**mehr Verschachtelung, ein zusaetzlicher Rahmen, eine Bedingung
die serverseitig anders faellt.**

`[cmd]` **`v2-module-hero-lite`** ? **hat `supplements` es, haben
die anderen es?**

### Abnahmebedingungen

    A1  welche zwei `div` nennt die Meldung. Wortlaut.
    A2  der Serverausgang je Modul an dieser Stelle.
        Zahl: 6 Module, je der Ausschnitt.
    A3  der Unterschied, belegt. Nicht vermutet.
    A4  behoben, 0 Konsolenfehler auf allen elf Reitern.
        Bildschirmfoto.
    A5  Gegenprobe: der Fehler kehrt zurueck, wenn die Ursache
        wieder eingebaut wird.
    A6  1525 Tests bleiben gruen.

### Was nicht zu tun ist

**Den Wechslerplatz nicht entfernen** ? **er ist die Loesung aus
G-376, nicht das Problem.**
**Nichts in `packages/ui`** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-445.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`** ? **er ist dir
gestern von selbst zurueckgekommen, das war richtig.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Nachtrag 2026-09-08 — die Karte ist leer, und das ist ein zweiter Fehler

Tom, am Schirm: *,,die map hat er nie richtiggestellt, hat das einen
grund oder hat er das rapportiert?"*

`[read]` **Weder noch** ? **er konnte es nicht wissen: C-445 ist
erst danach eingespielt worden.**

`[cmd]` **Die Kachel meldet:** *,,Keine Injektionsorte gelesen.
`medical.injection_sites` ist leer oder nicht lesbar."*

`[cmd]` **Nachgemessen: 16 Zeilen, RLS erlaubt `authenticated`
alles** (`injection_sites_select`, `USING true`).

`[read]` **Die Meldung ist falsch** ? **die Tabelle ist weder leer
noch unlesbar.**

## Die Ursache: drei Listen, drei Kennungen

`[cmd]` **`injektion-karte.ts:46`:**

    KARTEN_ORTE = {
      deltoid:          ['delt_l', 'delt_r'],
      vastus_lateralis: ['quad_l', 'quad_r'],
      ventrogluteal:    ['vg_l',   'vg_r'],
      subcutaneous:     [],
    }

`[cmd]` **Und der Kommentar darueber sagt es:** *,,`injection_sites`
fuehrt REGIONEN ohne Seite ? `deltoid`, `vastus_lateralis`,
`ventrogluteal`, `subcutaneous`. Kein `delt_l`/`delt_r`."*

`[cmd]` **Seit C-445 fuehrt sie aber genau das:**

    abd_l      abd_r      delt_l     delt_r
    glute_l    glute_r    lat_l      lat_r
    quad_l     quad_r     sq_delt_l  sq_delt_r
    thigh_sq_l thigh_sq_r vglute_l   vglute_r

`[read]` **`KARTEN_ORTE['delt_l']` ist `undefined`** ? **die
Schleife findet nichts, `punkte` bleibt leer, die Kachel meldet
*leer*.**

## Und zwei Namen weichen weiterhin ab

`[cmd]` **`INJEKTIONS_ORTE` in `packages/ui/src/koerperkarte-pfade.ts`:**

    delt_l/r  pec_l/r   bicep_l/r  quad_l/r     (Vorderseite)
    glute_l/r vg_l/r    lat_l/r    tricep_l/r   (Rueckseite)

    Datenbank hat  vglute_l/r   Karte hat  vg_l/r
    Datenbank hat  abd_l/r, sq_delt_l/r, thigh_sq_l/r
                   -> kein Kartenpunkt
    Karte hat      pec, bicep, tricep
                   -> keine Datenbankzeile

`[read]` **Von 16 Orten und 16 Punkten decken sich zehn.**

## Zusaetzlicher Auftrag

### 4 · Die Zuordnung fallen lassen

`[read]` **`KARTEN_ORTE` war eine Bruecke zwischen Regionen und
Punkten.** `[read]` **Seit C-445 gibt es keine Regionen mehr** ?
**die Bruecke ist ueberfluessig.**

`[read]` **Die Zeile-Id IST die Punkt-Id** ? **direkt verwenden.**

### 5 · Die zwei Luecken melden

`[cmd]` **`vglute_l/r` gegen `vg_l/r`** ? **eine Umbenennung, aber
in welcher Richtung?** `[read]` **Die Datenbank folgt der Spec
(`Injection Planner:48`), die Karte ist aelter** ? **also die
Karte.**

`[cmd]` **`abd`, `sq_delt`, `thigh_sq` haben keinen Punkt** ?
**das sind die SubQ-Orte.**

`[read]` **Melden, nicht in `packages/ui` bauen** ? **aber miss,
wo sie auf der Figur liegen muessten.**

### Zusaetzliche Abnahmebedingungen

    A7  die Karte zeigt Punkte. Zahl: 16 Orte / davon auf
        der Figur.
    A8  die zwei Luecken, je mit Vorschlag.
    A9  KARTEN_ORTE entfernt oder mit Grund behalten.
