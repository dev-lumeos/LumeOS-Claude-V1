---
nr: G-355
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-67
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  tabellen: 6
  spalten: 110
  zeilen: 450
  leser: 37
---

# G-355 — Goals und Body gegen alle Quellen pruefen

## Befund

Tom, 2026-09-07:

> ich denke goals & body solltest nochmal komplett gegen spec, old
> repo, new design mockup und sonstigen quellen pruefen, denn da
> wurde einiges schon angepasst dass nicht der sinn der sache ist
> denke ich. da fehlt mittlerweile sehr viel das ploetzlich
> verschwunden ist

## Was gemessen ist

`[cmd]` **Sechs Tabellen, 110 Spalten, 450 Zeilen:**

    user_goals            23 Sp,  11 Zeilen
    goal_milestones       20 Sp,  13 Zeilen
    body_circumferences   22 Sp,  54 Zeilen
    body_measurements     17 Sp, 362 Zeilen
    goal_phases           14 Sp,   5 Zeilen
    nutrition_targets     14 Sp,   5 Zeilen

`[cmd]` **Und 37 Dateien in `apps/web/src` lesen `goals.`**

`[read]` **Die Daten sind also da** — **Toms Beobachtung betrifft die
Oberflaeche, nicht das Schema.**

## Was der Verdacht heisst

`[read]` **Wenn 110 Spalten existieren und der Schirm wenig zeigt,
gibt es zwei Erklaerungen:**

`[read]` **Entweder wurde nie alles angeschlossen** — **dann ist es
eine Luecke, kein Verlust.**

`[read]` **Oder etwas wurde entfernt** — **dann steht es in der
Geschichte, und man kann sagen wann und warum.**

`[cmd]` **Der Unterschied ist messbar:** `git log` **je Datei.**

## Die vier Quellen

`[cmd]` **Spec:** `docs/specs/` — **welche Spec traegt Goals?**
`[cmd]` **Altrepo:** `referenz/lumeos-2026/`, 91.290 Dateien —
**Struktur ja, Code nie.**
`[cmd]` **Mockup:** `00-QUELLEN.md` sagt, welche es je Modul gibt.
`[cmd]` **Und die Entscheidungen:** E-54 (Zeitachse), E-46
(Erfahrungsgrade), E-67 (Onboarding gegen Goals).

## Was der Auftrag liefern soll

`[read]` **Eine Gegenueberstellung, nicht eine Meinung:**

    was die Spec verlangt
    was die Datenbank traegt
    was der Schirm zeigt
    was fehlt -- und ob es je da war

## Auftrag — die Gegenueberstellung

**Beauftragt am 2026-09-07.**

### Warum der Punkt jetzt kommt

`[cmd]` **Du hast in G-354 einen Kommentar gefunden, der zwei
vorhandene Tabellen fuer abwesend erklaerte** —
`modale.tsx:13`: *,,es gibt weder `goals.user_goals` noch
`goals.body_measurements`."*

`[read]` **Das ist vermutlich die Erklaerung fuer Toms
Beobachtung** — *,,da fehlt mittlerweile sehr viel das ploetzlich
verschwunden ist."*

`[read]` **Vielleicht ist nichts verschwunden.** `[read]`
**Vielleicht steht an mehreren Stellen, es sei nie da gewesen.**

### Was zu messen ist

    was die Spec verlangt
    was die Datenbank traegt
    was der Schirm zeigt
    was fehlt -- und ob es je da war

`[cmd]` **Gemessen 2026-09-07: sechs Tabellen, 110 Spalten, 450
Zeilen, 37 Leser in `apps/web/src`.**

`[read]` **Die Daten sind da** — **die Frage ist die Oberflaeche.**

### Der Unterschied ist messbar

`[read]` **Nie angeschlossen** — **eine Luecke, kein Verlust.**

`[read]` **Entfernt** — **dann steht es in der Geschichte, und `git
log` sagt wann und warum.**

`[cmd]` **Sucht gezielt nach weiteren Kommentaren wie dem aus
G-354** — **eine Zeile, die eine vorhandene Sache fuer abwesend
erklaert, wird beim naechsten Auftrag als Grund zitiert.**

### Die vier Quellen

`[cmd]` **`00-QUELLEN.md` sagt, welche Specs und Mockups es je Modul
gibt** — **lies es zuerst.**

`[cmd]` **Altrepo:** `referenz/lumeos-2026/` — **Struktur ja, Code
nie.** `[read]` **Und nachsehen, warum es ersetzt wurde.**

`[cmd]` **Entscheidungen:** E-54 (Zeitachse), E-46
(Erfahrungsgrade), E-67 (Onboarding gegen Goals).

### Das Fortgeschrittene steht im Schema

**Tom, 2026-09-07:** *,,da fehlen all die pro sachen und
grundsaetzlichen sachen in goals, da hatten wir auch advanced stuff
drin nicht nur so 0815 goals wie 100kg druecken und so
anfaengerzeugs."*

`[cmd]` **Gemessen 2026-09-07:**

    phase_type   fat_loss, lean_bulk, maintenance, recomp,
                 contest_prep, reverse_diet, expert_bb_annual,
                 mini_cut, peak_week

`[read]` **`contest_prep`, `peak_week`, `reverse_diet`,
`expert_bb_annual`, `mini_cut`** — **Wettkampfvorbereitung, kein
Anfaengerzeug.**

`[cmd]` **`goal_phases` traegt eine Phasenmaschine:**

    variant             eine Auspraegung je Phasenart
    parameters jsonb    die Stellgroessen
    gueltig_ab          Beginn
    projected_end_date  geplant
    actual_end_date     tatsaechlich
    transitioned_from   woher
    recommended_next    wohin
    transition_reason   warum

`[read]` **Uebergaenge mit Begruendung** — **das ist eine
Zustandsmaschine, keine Zielliste.**

`[cmd]` **`body_measurements`: `ffmi`, `lean_mass_kg`,
`fat_mass_kg`, `bf_method`, `height_cm_snapshot`.**

`[read]` **FFMI ist ein Bodybuilder-Mass** — **und `bf_method` sagt,
womit gemessen wurde.**

`[cmd]` **`body_circumferences`: 13 Messpunkte, links und rechts
getrennt** — Hals, Schultern, Brust, Ober- und Unterarm, Taille,
Huefte, Oberschenkel, Wade.

### Danach richtet sich die Gegenueberstellung

`[read]` **Miss je Spalte, ob der Schirm sie zeigt** — **110 Spalten,
und die Frage ist, wie viele davon erreichbar sind.**

`[read]` **Und je Phasenart, ob es einen Weg dorthin gibt:**
`[cmd]` **`contest_prep` und `peak_week` sind im CHECK** —
**existiert eine Oberflaeche, die sie setzt?**

`[read]` **Das ist der Kern von Toms Beobachtung:** **nicht *,,ein
Feld fehlt"*, sondern *,,die fortgeschrittene Haelfte ist nicht
erreichbar"*.**

### Die Regel greift, und trotzdem weiss niemand mehr Bescheid

**Tom, 2026-09-07:** *,,das war alles im mockup und verschwindet
einfach irgendwann irgendwie. wir haben verdammt nochmal rules. wir
binden mockups an; was nicht anbindbar ist bleibt in der ui als
mockup deklariert, genau aus dem grund dass nichts verschwindet und
keiner mehr weiss um was es geht."*

`[cmd]` **Gemessen 2026-09-07: die Regel wird befolgt.**

    131 Dateien im Repo tragen einen Attrappen-Vermerk
     10 davon in v2/goals

    phase-editor.tsx    796 Zeilen, 40 Vermerke
    tab-phase.tsx       689 Zeilen, 17 Vermerke
    modale.tsx          507 Zeilen, 20 Vermerke

`[cmd]` **`v2/goals` hat 12 Dateien, 4.253 Zeilen.**

`[read]` **Die Mockups sind nicht verschwunden** — **sie stehen als
Attrappen da.**

`[read]` **Aber 40 Vermerke in einer Datei sind kein *,,hier fehlt
noch ein Knopf"*** — **das ist eine Flaeche, die aussieht wie gebaut
und nichts tut.**

`[read]` **Und niemand weiss mehr, welcher Vermerk auf welche
Quelle zeigt.**

### Was daraus fuer diesen Auftrag folgt

`[read]` **Zaehl die Vermerke und ordne sie zu:**

    welcher Vermerk       auf welche Mockup-Stelle
    welche Datenlage      liegt dahinter
    warum nicht gebunden  fehlt der Leseweg, die Entscheidung,
                          oder hat es nie jemand versucht?

`[cmd]` **Beispiel aus C-193, heute:** **MealCam ist *,,rein
statisch, kein Leseweg"*** — **und niemand wusste es, bis jemand
fragte.**

`[read]` **Ein Vermerk sagt *,,noch nicht"*.** `[read]` **Er sagt
nicht, was fehlt** — **und genau das ist die Luecke.**

`[cmd]` **`phase-editor.tsx` ist der Anfang** — 796 Zeilen, 40
Vermerke, **und `goal_phases` traegt neun Phasenarten mit
Uebergangsfeldern.**

### Was nicht zu tun ist

**Nichts bauen** — **dieser Auftrag stellt gegenueber.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Gegenueberstellung  Spec / Datenbank / Schirm, je Bereich
    110 Spalten         wie viele erreichbar, gezaehlt
    Attrappen-Vermerke  gezaehlt und zugeordnet
    je Vermerk          was fehlt: Leseweg / Entscheidung /
                        nie versucht
    neun Phasenarten    welche haben einen Weg, welche nicht
    FFMI und Umfaenge   erreichbar oder tot
    fehlt               was, und ob es je da war
    Kommentare          weitere Falschaussagen, gezaehlt
    Bildschirmfoto      was Goals und Body heute zeigen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
