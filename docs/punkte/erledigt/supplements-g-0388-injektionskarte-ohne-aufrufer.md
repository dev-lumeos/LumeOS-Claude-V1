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
erledigt: 2026-09-08
commit: c3cd8fe5
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

### A1 ? Die Kachel ruft `InjektionsKarte`

`[cmd]` **Am Schirm belegt** ? `Koerperkarte` setzt je Punkt ein
`data-punkt`, die alte Eigenzeichnung nicht:

    Punkte mit data-punkt   6
    Ids                     delt_l, delt_r, quad_l, quad_r, vg_l, vg_r
    Untertitel              4 Orte aus medical.injection_sites
                            · 0 Protokollzeilen

`[cmd]` **Und es ist EINE Figur, nicht zwei** ? die zwei `svg` sind
die beiden Ansichten derselben Karte:

    viewBox "0 0 724 1448"     90 Pfade, 4 Punkte   (front)
    viewBox "724 0 724 1448"   70 Pfade, 2 Punkte   (back)

`[read]` **Derselbe Koordinatenraum, um 724 versetzt** ? genau der
Mechanismus, den recovery benutzt.

**Entfernt:** `function InjKarte` (84 Zeilen) und die Konstante
`SILHOUETTE` (8 Zeilen Pfaddaten). `[cmd]` **Die Datei ist von 563
auf 513 Zeilen gefallen**, und `rg` findet die zwei Namen nur noch in
den Kommentaren, die die Aenderung erklaeren.

**Gebaut, damit die Kachel Daten hat:**

    lib/medical/injektion-read.ts    Leseweg zu den fuenf Tabellen
    lib/medical/injektion-karte.ts   die Rechnung, importfrei
    page.tsx -> ansicht.tsx -> tab-injektionen.tsx   durchgereicht

#### Ein Fehler von mir, mit Ansage in der eigenen Lehre

`[cmd]` **Nach dem ersten Umbau: HTTP 500 auf JEDER Route** ?
`/login` und `/v2/supplements` beide 500. **Ursache:**
`tab-injektionen.tsx` ist `'use client'`, und ich importierte
`tageSeitInjektion` als **WERT** aus `injektion-read.ts` ? einer
Datei, die `@lumeos/shared/session` laedt.

`[cmd]` **`tsc --noEmit` blieb dabei gruen.** `[read]` **Der
Typecheck sieht die Laufzeitgrenze nicht** ? nur der Server sagt es,
und zwar mit 500 statt mit einer Meldung.

`[read]` **Behoben durch Trennung:** die reine Rechnung steht jetzt in
`injektion-karte.ts` **ohne einen einzigen Import**, beide Seiten der
Grenze koennen sie laden. **Nur der TYP kommt weiter aus dem
Leseweg.** `[cmd]` **Danach 200 auf beiden Routen.**

### A2 ? `Koerperkarte` fehlt nichts: 6 geprueft / 0 fehlend

`[cmd]` **Die vier Orte aus `medical.injection_sites` sind
anatomische REGIONEN ohne Seite** ? `deltoid`, `vastus_lateralis`,
`ventrogluteal`, `subcutaneous`. **Kein `delt_l`/`delt_r`.**

`[cmd]` **Abbildung auf `INJEKTIONS_ORTE` geprueft:**

    deltoid           -> delt_l, delt_r      beide vorhanden
    vastus_lateralis  -> quad_l, quad_r      beide vorhanden
    ventrogluteal     -> vg_l,   vg_r        beide vorhanden
    subcutaneous      -> kein Ort

`[read]` **`subcutaneous` ist ein WEG, kein Ort** ? es hat keine
Stelle auf der Figur, und `INJEKTIONS_ORTE` fuehrt deshalb keine.
**Das ist kein Mangel der Karte, sondern eine Eigenschaft der
Sache.**

`[cmd]` **Lage aller sechs Punkte gemessen** (Bounding-Box der Figur
gegen die Punktkoordinaten):

    delt_l  x=203 y=319   drin=true    figur 49,96 - 679,1351
    delt_r  x=521 y=319   drin=true
    quad_l  x=275 y=941   drin=true
    quad_r  x=449 y=941   drin=true
    vg_l    x=977 y=695   drin=true    figur 769,97 - 1399,1351
    vg_r    x=1195 y=695  drin=true

**Alle sechs liegen auf der Figur.** `[read]` **Die Deltoid-Punkte
sitzen am Schulterrand** ? anatomisch richtig fuer eine
Deltoid-Injektion, auch wenn es auf den ersten Blick knapp aussieht.

`[cmd]` **Diese Kachel ist der ERSTE Aufrufer von
`InjektionsKarte`** ? `rg` findet ausserhalb von `supplements/`
keinen. **Die Koordinaten waren nie gerendert worden.**

**Nichts in `packages/ui` geaendert.**

**Was ich der Vollstaendigkeit halber melde, ohne es zu bauen:**
`KoerperPunkt` kennt kein `gestrichelt`/`ring`. **Die alte Zeichnung
markierte SubQ mit einem gestrichelten Ring.** `[read]` **Hier
faellt das nicht ins Gewicht:** `subcutaneous` hat ohnehin keinen
Ort auf der Figur. **Braeuchte es die Unterscheidung spaeter, waere
das eine Ergaenzung in `packages/ui` ? und die gehoert dir**, weil
Admin und Coach mitlesen.

### A3 ? Kein Schreibweg fuer `injection_logs`

**Nein.** `[cmd]` **`rg` auf `injection_logs` in `apps/web/src` und
`packages`: 0 Treffer** ausser meinem neuen Leseweg.

`[cmd]` **Das Fenster „Log injection" existiert** (`modale.tsx:835`,
`LogInjektionFenster`) ? **und es schreibt nichts.** Es rechnet aus
`INJ_ORTE` und `ortZustand`, beides Entwurfskonstanten, und sperrt
den Knopf bei Grenzverletzung. **Ein Fenster mit Pruefung, ohne
Ziel.**

`[cmd]` **Die Erlaubnis liegt bereit:** `pg_policies` fuehrt
`injection_logs_insert`, `_select`, `_update`, `_delete`. **Nur der
Weg fehlt** ? A-71 in Reinform.

`[read]` **Damit ist die Rotation nicht berechenbar, und das ist der
Befund.** `rotation_distance_mm` und
`rotation_quadrant_interval_days` stehen in der Tabelle, aber ohne
eine einzige erfasste Injektion gibt es nichts, wogegen zu rechnen
waere.

`[cmd]` **Und zwei Spalten sagen ausdruecklich, dass eine Zahl
FEHLEN muss:** `minimum_rest_days` ist bei allen vier Zeilen `NULL`,
mit `minimum_rest_days_reason`:

    E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer
    wiederholte IM-Injektionen.

`[read]` **Der Entwurf fuehrte `restDays: 14` je Ort** ? genau die
Sorte Zahl, die E-57 verbietet. **Die Datenbank ist hier ehrlicher
als die Vorlage.**

### A4 ? Die elf Kacheln, je mit Urteil

`[cmd]` **13 Marken `attrappe={ATTRAPPE}` in der Datei** (vorher 14
? die Rotationskarte traegt keine mehr).

| Kachel | baubar? | was fehlt |
|---|---|---|
| **Rotation map** | **gebaut** | ? liest `injection_sites`, zeichnet mit `InjektionsKarte` |
| **Needle reference** | **ja, vollstaendig** | nichts. `injection_needle_recommendations` traegt 8 Zeilen mit `route`, `site`, `medication_viscosity`, `gauge_range`, `length_range`, `source_citation` ? **inklusive Quelle je Zeile.** |
| **Site guide** (Gewebehinweise) | **ja, duenn** | `injection_tissue_condition_guidance` hat **1 Zeile** (`lipohypertrophy`, 3-6 Monate, `guideline`). **Baubar, aber die Kachel zeigt einen Eintrag.** |
| **IM sites** / **SubQ sites** | **ja** | `injection_sites.route` trennt `im` von `sc` ? 3 IM, 1 SC. |
| **Sites ready** | **nein** | braucht `injection_logs` (0 Zeilen, kein Schreibweg) ? ohne Protokoll ist „bereit" nicht entscheidbar. |
| **Resting** | **nein** | dito, **und zusaetzlich `minimum_rest_days`** ? bei allen vier `NULL` mit Begruendung (E-57). **Eine Ruhezeit waere erfunden.** |
| **Overused · 30d** | **nein** | braucht Protokoll ueber 30 Tage. |
| **Next injection** | **nein** | braucht Protokoll und Plan. |
| **Injection log** | **nein** | die Tabelle ist leer, und es gibt keinen Schreibweg. |
| **Rotation plan · next 7** | **nein** | braucht Protokoll; `rotation_quadrant_interval_days` allein ergibt keinen Plan. |
| **Overuse warnings** / **Volume limits** / **Weekly load** | **nein** | alle drei rechnen ueber Mengen je Zeitraum ? kein Protokoll, keine Mengenspalte. |

**Zusammengefasst: 1 gebaut, 4 sofort baubar (Needle reference, Site
guide, IM sites, SubQ sites), 6 haengen am fehlenden Schreibweg.**

`[cmd]` **Und der Attrappengrund war eine Falschaussage.** Er
lautete: *„Es gibt keine Tabelle fuer Injektionen ? weder Orte noch
Protokoll noch Plan."* **Es gibt fuenf.** `[read]` **Ein Vermerk mit
falschem Grund ist schlimmer als eine fehlende Kachel** ? er
verhindert, dass jemand nachsieht. **Berichtigt** auf den echten
Grund: kein Schreibweg fuer `injection_logs`.

### A5 ? E-69: 1 angebunden / 7 Referenzen

`[cmd]` **Am Schirm gezaehlt, Reiter `injection`:**

    Trennlinie      1
    Kacheln oben    6
    davon Attrappe  5
    angebunden      1   (Rotation map)
    Referenzen      7

`[read]` **Die Referenzen sind mehr als die angebundenen Kacheln**,
weil unter der Linie die Mockup-Fassung **jeder** Kachel steht ?
nicht nur der angebundenen.

### A6 ? Bildschirmfoto

`[cmd]` **`backup/g388-rotationskarte.png`** ? dieselbe Figur wie
recovery, sechs Punkte mit Beschriftung (Deltoid, Vastus lateralis,
Ventrogluteal je links/rechts), alle grau (`nie`), weil
`injection_logs` leer ist.

`[cmd]` **Eine zweite Legende ist entfernt:** die alte nannte
`ready`/`resting` aus Entwurfskonstanten, `InjektionsKarte` bringt
ihre eigene mit (>14d / 7-14d / 3-7d / <3d / nie). **Zwei Legenden
unter einer Figur widersprachen sich.**

### Waechter

`[cmd]` **tsc** sauber, **lint** sauber, **Tests 1518 pass / 0
fail.**

**Zwei Waechter wurden rot, und die zwei Faelle sind verschieden:**

`[cmd]` **`der Injections-Tab bringt seine Rotationskarte mit`**
verlangte `function InjKarte` ? **den Namen der Zweitzeichnung, die
dieser Auftrag entfernen soll.** `[read]` **Ein Waechter, der einen
Namen verlangt, altert zur Blockade.** **Geschaerft auf die Sache:**
`<InjektionsKarte` muss stehen, `const SILHOUETTE` darf nicht.

`[cmd]` **`die neuen Tabs kennzeichnen jede Kachel`** zaehlte 14
Attrappenmarken. **Der hat recht** ? er verlangt, dass die Zahl
mitgezogen wird, wenn eine Kachel angebunden wird. **14 -> 13, mit
Begruendung im Kommentar.**

**Sabotageprobe am geschaerften Waechter:**

    Aufruf durch <div> ersetzt   -> not ok 3
    `const SILHOUETTE` zurueck   -> not ok 3

**Beide rot, zurueckgebaut, 1518 gruen** ? und die Schirmmessung nach
dem Rueckbau wiederholt: **6 Punkte, derselbe Untertitel.**

### Neustart

`[read]` **Keiner noetig.** Geaendert sind `apps/web/src` (heisses
Nachladen). **Nichts in `packages/ui`**, keine Konfiguration.
`[cmd]` **Belegt: die Messungen liefen gegen den laufenden Server**
? und der 500 nach meinem Fehler war ebenfalls dort sichtbar, nicht
erst nach einem Neustart.

### Was offen bleibt

**1 ? Der Schreibweg fuer `injection_logs`** (A3). **Die Policies
stehen, das Fenster steht, nur der Weg dazwischen fehlt.** **Sechs
der elf Kacheln haengen daran.** `[read]` **Das ist ein eigener
Punkt** ? und er gehoert nach `apps/`, nicht nach `supabase/`: die
Tabelle ist da.

**2 ? Vier Kacheln waeren sofort baubar** (Needle reference, Site
guide, IM sites, SubQ sites). **Nicht in diesem Auftrag gebaut** ?
er nennt die Rotationskarte.

**3 ? `injection_site_conditions` hat 0 Zeilen** und keine Kachel
zeigt sie. **Sie traegt die Schonfristen je Stelle** (`condition_code`,
`avoidance_months`, `resolved_at`) ? **die Gegenstuecke zu
`injection_tissue_condition_guidance`.** Ohne Erfassung bleibt sie
leer.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  die Kachel ruft InjektionsKarte
    A2  Koerperkarte fehlt nichts -- 6/6 Punkte auf der Figur
    A3  kein Schreibweg fuer injection_logs
    A4  11 Kacheln: 1 gebaut, 4 baubar, 6 blockiert
    A5  Referenz unter der Linie
    A6  Bildschirmfoto

`[cmd]` **Selbst gemessen: vier Policies auf `injection_logs`,
Zeilen 4 / 8 / 1 / 0 / 0, und die zwei
`medical.injection_*`-Funktionen sind Leser.**

### Die zweite Zeichnung ist weg

`[cmd]` **563 -> 513 Zeilen** ? **die lokale Silhouette samt
Zweitfigur entfernt.**

`[read]` **Tom: *,,dieselbe grafik wie recovery/muscle map"*** ?
**und jetzt ist es dieselbe, nicht eine aehnliche.**

`[cmd]` **Ein Koordinatenraum in zwei Ansichten, 6 Punkte mit
`data-punkt`.**

### A2 — gemessen, statt `packages/ui` anzufassen

`[read]` **Ich hatte geschrieben: wenn `Koerperkarte` etwas nicht
kann, melden statt bauen.**

`[cmd]` **Er hat gemessen, dass sie alles kann: 6 von 6 Punkten
liegen auf der Figur.**

`[read]` **Kein Zusatz noetig** ? **die Karte war fuer Punkte
gebaut** (`KoerperkarteProps.punkte`).

### A4 — die Dreiteilung ist die Arbeit

    1 gebaut       die Rotationskarte
    4 baubar       needle_recommendations (8 Zeilen),
                   tissue_condition_guidance (1)
    6 blockiert    warten auf den Schreibweg

`[read]` **Er hat nicht *,,sechs fehlen"* gesagt, sondern warum** ?
**und dass der Weg nach `apps/` gehoert, nicht `supabase/`.**

`[cmd]` **Die Policies stehen seit C-429** ? **vierzehnter
A-71-Fall.**

### Und was er nicht gebaut hat

`[cmd]` **`injection_site_conditions`: 0 Zeilen, keine Kachel.**

`[read]` **Er hat keine fuer eine leere Tabelle gebaut** ?
**richtig, das waere eine Attrappe mit Anspruch.**

`[cmd]` **Und die Ring-Option fuer SubQ in `packages/ui` nicht
angefasst** ? **gemeldet, wie beauftragt.**

**Abgenommen, G-389 beauftragt.**


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
