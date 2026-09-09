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
