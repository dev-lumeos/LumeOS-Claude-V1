---
nr: G-388
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-53
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-388 — `InjektionsKarte` und die Reste

## Befund

`[cmd]` **G-53: `InjektionsKarte` liegt in `packages/ui` und hat
keinen Aufrufer.**

`[cmd]` **Und C-429 hat `injection_sites` und `injection_logs`
gebaut** ? **zwei der wenigen Tabellen mit echter Beschreibung
(G-384, A1).**

`[read]` **Dreizehnter A-71-Fall, vermutlich** ? **aber gemessen,
nicht angenommen.**

## Auftrag

**Mitbeauftragt: G-126 (drei Reste aus G-122).** Bericht in diese
Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
supplements.**

`[cmd]` **Und `docs/ssot/00-MODULTABELLEN.md`** ? **dort stehen
`injection_sites` und `injection_logs` mit Spalten und Zeilen.**

`[read]` **Nachsehen, nicht messen** ? **das ist der Zweck der
Datei.**

### 1 · G-53 — die Karte

`[read]` **Miss zuerst, ob sie zu den Tabellen passt** ? **eine
Karte aus `packages/ui` kennt das Schema von C-429 nicht.**

`[cmd]` **Und `packages/ui` gehoert Admin und Coach mit** ? **deine
eigene Lehre aus G-17.**

`[read]` **Wenn sie passt: anbinden.** `[read]` **Wenn nicht:
melden, was fehlt.**

### 2 · G-126 — die drei Reste

`[read]` **Lies den Punkt und miss, was heute davon steht.**

### Abnahmebedingungen

    A1  passt die Karte zum Schema? Zahl: Felder / davon
        gedeckt.
    A2  wenn angebunden: Zeilen am Schirm, gemessen.
    A3  G-126: je Rest, steht er noch? Mit Messung.
    A4  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

### Was nicht zu tun ist

**Nichts in `packages/ui` aendern** ? **melden, wenn dort etwas
fehlt.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-439.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Berichtigt 2026-09-08 — Tom hat die Vorlage verworfen

Tom: *,,diese mockup vorlage ist obsolet, da will ich dieselbe
grafik wie recovery/muscle map."*

`[read]` **Und der Auftrag oben war zweimal falsch.**

### Was ich falsch geschrieben habe

`[cmd]` **Die Tabellen liegen in `medical`, nicht `supplements`.**

`[cmd]` **Und es sind FUENF, nicht zwei:**

    medical.injection_sites            10 Sp, 4 Zeilen
    medical.injection_logs              6 Sp, 0 Zeilen
    medical.injection_site_conditions
    medical.injection_needle_recommendations
    medical.injection_tissue_condition_guidance

`[read]` **Ich haette in `00-MODULTABELLEN.md` nachsehen sollen** ?
**die Datei, die ich heute selbst gebaut habe.**

### Was heute am Schirm steht

`[cmd]` **`apps/web/src/app/v2/supplements/tab-injektionen.tsx`,
563 Zeilen, ELF Kacheln, alle `attrappe={ATTRAPPE}`.**

`[cmd]` **Aus `theme-v1/module-supplements-injection.jsx`
abgeschrieben.**

`[cmd]` **Die Kachel heisst schon *,,Rotation map"***, Untertitel
*,,click a site ? dashed ring = SubQ ? dimmed = resting"*.

`[read]` **Aber sie zeichnet selbst** ? **`InjektionsKarte` steht
nur im Kommentar, nicht als Aufruf.**

### Was Tom will

`[read]` **Dieselbe Figur wie `recovery`** ? **nicht eine zweite
Zeichnung daneben.**

`[cmd]` **`packages/ui/src/koerperkarte.tsx` traegt bereits drei
Aufrufe derselben Karte:**

    ErmuedungsKarte     Muskeln eingefaerbt
    AktivierungsKarte   Muskeln eingefaerbt
    InjektionsKarte     Punkte ueber der Figur

`[cmd]` **`KoerperkarteProps` nimmt `muskeln`, `punkte`,
`figurDimmen`, `legende`** ? **die Punktkarte ist vorgesehen, nicht
nachtraeglich.**

`[cmd]` **16 Injektionsorte, links und rechts getrennt:**
`delt_l`/`delt_r`, `pec_l`/`pec_r`, `bicep_l`/`bicep_r`,
`quad_l`/`quad_r` ? **genau was eine Rotation braucht.**

## Auftrag 2 — die Rotation auf der echten Figur

**Beauftragt am 2026-09-08.**

### 1 · Die eigene Zeichnung ersetzen

`[read]` **`InjektionsKarte` aufrufen, statt eine zweite Figur zu
zeichnen.**

`[cmd]` **Miss zuerst, was die Kachel heute zeichnet** ? **und ob
`punkte` dasselbe ausdruecken kann.**

`[read]` **Wenn `Koerperkarte` etwas nicht kann: melden, nicht in
`packages/ui` bauen** ? **Admin und Coach nutzen es mit.**

### 2 · Die Rotation ist im Schema, nicht im Bild

`[cmd]` **`medical.injection_sites` traegt:**

    rotation_required
    rotation_distance_mm
    rotation_quadrant_interval_days
    minimum_rest_days + _reason

`[read]` **Also: wie weit muss der naechste Einstich weg sein,
wann ist derselbe Quadrant wieder frei, wie lange ruht ein Ort.**

`[cmd]` **`injection_logs` hat 0 Zeilen** ? **es wurde nie eine
Injektion erfasst.**

`[read]` **Miss, ob ein Schreibweg existiert** ? **wenn nicht, ist
die Rotation nicht berechenbar und das ist der Befund.**

### 3 · Die elf Attrappen

`[read]` **Miss je Kachel, ob die fuenf Tabellen sie tragen
koennen.**

`[cmd]` **`injection_needle_recommendations` koennte *Needle
reference* tragen,** `injection_tissue_condition_guidance` **die
Gewebehinweise.**

`[read]` **Melde je Kachel: baubar, oder was fehlt.**

### Abnahmebedingungen

    A1  die Kachel ruft InjektionsKarte. Belegt.
    A2  was Koerperkarte nicht kann. Zahl: geprueft / fehlend.
    A3  gibt es einen Schreibweg fuer injection_logs? Ja mit
        Namen, nein.
    A4  je der elf Kacheln: baubar oder was fehlt.
    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A6  Bildschirmfoto der Kachel.

### Was nicht zu tun ist

**Nichts in `packages/ui` aendern.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-439.**
**Keine zweite Figur zeichnen** ? **das ist der Punkt.**
Nicht committen, nicht stagen, nicht pushen.
