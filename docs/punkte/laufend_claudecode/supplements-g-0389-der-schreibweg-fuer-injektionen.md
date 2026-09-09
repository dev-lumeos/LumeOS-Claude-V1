---
nr: G-389
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-388
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
  blockiert: 6
  baubar: 4
---

# G-389 — der Schreibweg fuer Injektionen

## Befund

Aus G-388, Claude Code, 2026-09-08.

`[cmd]` **Nachgemessen: alle vier Policies stehen.**

    injection_logs_select    injection_logs_insert
    injection_logs_update    injection_logs_delete

`[cmd]` **Und die Zeilen:**

    injection_sites                        4
    injection_needle_recommendations       8
    injection_tissue_condition_guidance    1
    injection_logs                         0
    injection_site_conditions              0

`[read]` **Die Erlaubnis liegt seit C-429 da, der Weg dazwischen
fehlt** ? **vierzehnter A-71-Fall.**

`[cmd]` **Und er gehoert nach `apps/`** ? **die zwei
`medical.injection_*`-Funktionen sind Leser
(`_body_measurement_context`, `_needle_suggestions`), keine
Schreiber.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Der Schreibweg

`[read]` **Eine Injektion erfassen: Ort, Zeitpunkt** ? **das sind
die sechs Spalten von `injection_logs`.**

`[cmd]` **`E-74` gilt auch hier** ? **miss, ob die Tabelle eine
Herkunft traegt oder braucht.**

`[read]` **Und die Rotation ist der Zweck:** `rotation_distance_mm`,
`rotation_quadrant_interval_days`, `minimum_rest_days` **werden erst
sinnvoll, wenn Zeilen da sind.**

### 2 · Die sechs blockierten Kacheln

`[read]` **Du hast sie gemessen** ? **bau sie, sobald der Weg
steht.**

`[read]` **Und melde je Kachel, was sie zeigt, wenn null Zeilen da
sind** ? **E-72: keine nackte Null.**

### 3 · Die vier sofort baubaren

`[read]` **Waren nicht beauftragt** ? **jetzt schon.**

`[cmd]` **`injection_needle_recommendations` hat 8 Zeilen,
`injection_tissue_condition_guidance` eine** ? **die tragen
Kacheln ohne neuen Schreibweg.**

### 4 · Was du NICHT bauen sollst

`[cmd]` **`injection_site_conditions` hat 0 Zeilen und keine
Kachel.**

`[read]` **Miss, was die Tabelle traegt, und melde, ob sie eine
Kachel braucht** ? **bau keine fuer eine leere Tabelle.**

`[read]` **Und die Ring-Option fuer SubQ in `packages/ui`:
nicht anfassen** ? **melden, wenn sie noetig wird.**

### Abnahmebedingungen

    A1  eine Injektion erfasst. Zahl: injection_logs
        vorher/nachher.
    A2  die Rotation rechnet. Zahl: Orte / davon ruhend,
        mit Begruendung je Ort.
    A3  die sechs Kacheln: gebaut, je mit Zahl.
    A4  die vier baubaren: gebaut, je mit Zahl.
    A5  E-72: Zahl: Kacheln / mit Daten / mit Leerhinweis /
        nackte Nullen.
    A6  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A7  injection_site_conditions: braucht sie eine Kachel?
        Mit Grund.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **die Policies stehen schon, Codex
arbeitet an C-440.**
**Nichts in `packages/ui`.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Auftrag 2 — 2026-09-08, neu gefasst

Tom, am Schirm: *,,diese grafik soll den rotationsmodus zeigen und
zustand der injektionsstellen und welches der naechste ist ? und
daneben und darum sind die anderen informationen, das gehoert alles
zusammen."*

`[read]` **Der erste Auftrag hat den Reiter in Kacheln zerlegt.**
**Er ist eines.**

### Die Reihenfolge

`[cmd]` **C-441 baut zuerst die 16 Orte** ? **heute sind es vier,
ohne Seite.**

`[read]` **Warte darauf.** `[read]` **Eine Rotation ueber vier
Orte ohne links und rechts ist keine.**

### Was die Spec vorgibt

`[cmd]` **`docs/specs/Supplements/Injection Planner - Spec Change
Request.md`, 371 Zeilen** ? **die einzige Quelle, das Altrepo kennt
Injektionen nicht.**

**5.1, Zeile 117-135** ? **vier Zustaende, gerechnet aus dem
letzten Einstich:**

    fresh      nie benutzt
    resting    rest_remaining > 1
    soon       rest_remaining >= 0
    ready      rest_remaining < 0

`[read]` **Die Legende unter der Karte zeigt heute fuenf Stufen
nach Tagen** ? **das ist die Mockup-Fassung.** `[cmd]` **Die Spec
rechnet je Ort mit seinem eigenen `rest_days`** ? **Deltoid 5 Tage,
Gluteus 7.**

`[read]` **Also nicht *,,vor 7 Tagen"*, sondern *,,noch 2 Tage
Ruhe"*.**

**5.2, ab Zeile 138** ? **`suggestSite`: laengste Ruhe zuerst,
bei Gleichstand `contralateral_rotation`.**

`[cmd]` **Und Zeile 182: derselbe Muskel auf der Gegenseite zaehlt
NICHT als Wechsel** ? **`isContralateral` ist die feinste Regel der
Spec.**

**6, ab Zeile 190** ? **drei Sperren, vier Warnungen:**

    block   volume_limit, rest_window, route_mismatch
    warn    overuse_30d, advanced_site,
            complication_repeat, pain_trend

### 1 · Der Schreibweg

`[read]` **Ohne Zeilen rechnet nichts** ? **`injection_logs` hat
null.**

`[cmd]` **Alle vier Policies stehen seit C-429.**

`[read]` **Der Weg gehoert nach `apps/`** ? **die zwei
`medical.injection_*`-Funktionen sind Leser.**

### 2 · Die Karte zeigt den Zustand

`[read]` **Farbe je Ort nach `siteState`, nicht nach Tagen.**

`[cmd]` **Und der vorgeschlagene naechste Ort hervorgehoben** ?
**`suggestSite` sagt welcher, und WARUM
(`reason: contralateral_rotation`).**

`[read]` **Ein Vorschlag ohne Grund ist eine Anweisung.**

### 3 · Klick zeigt den Ort

Tom: *,,bei klick infos anzeigen."*

`[cmd]` **Die Kachel rechts gibt es schon** ? **`Ventroglutal L`
mit Status, Volumen, Ruhefenster, Nadel.**

`[read]` **Sie ist heute fest verdrahtet** ? **verbinde sie mit dem
Klick.**

### 4 · Die Beschriftungen

Tom: *,,beschriftungen weiter draussen lesbar machen, koennen auch
linien zum punkt fuehren."*

`[cmd]` **Heute stehen sie ueber dem Punkt und ueberlappen** ?
**bei 16 Orten wird es schlimmer.**

`[read]` **Miss, ob `Koerperkarte` das kann** ? **wenn nicht:
melden, nicht in `packages/ui` bauen.**

`[read]` **Eine Linie vom Text zum Punkt ist eine Zeile SVG** ?
**aber sie gehoert in die gemeinsame Karte, nicht daneben.**

### 5 · Die uebrigen Kacheln

`[cmd]` **Vier sofort baubar:** `injection_needle_recommendations`
**(8 Zeilen),** `injection_tissue_condition_guidance` **(1).**

`[cmd]` **Sechs warten auf den Schreibweg.**

`[read]` **`injection_site_conditions` hat 0 Zeilen** ? **miss, was
sie traegt, und melde, ob sie eine Kachel braucht.**

### Abnahmebedingungen

    A1  eine Injektion erfasst. Zahl: injection_logs
        vorher/nachher.
    A2  je Ort der Zustand nach 5.1. Zahl: 16 Orte / je Zustand.
        Und: rechnet er mit dem EIGENEN rest_days?
    A3  der Vorschlag: welcher Ort, welcher Grund. Belegt.
    A4  Klick auf einen Punkt fuellt die Kachel rechts.
        Bildschirmfoto.
    A5  Beschriftungen lesbar bei 16 Orten. Bildschirmfoto.
        Und: was Koerperkarte dafuer braucht.
    A6  die zehn Kacheln: gebaut oder mit Grund offen.
    A7  E-72: Kacheln / mit Daten / mit Leerhinweis /
        nackte Nullen.
    A8  E-69: Referenz unter der Linie.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **C-441 baut die Orte, Codex.**
**Nichts in `packages/ui` ohne Meldung.**
**Keine eigene Zustandsberechnung** ? **5.1 steht in der Spec.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.
