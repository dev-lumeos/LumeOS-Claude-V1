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
erledigt: 2026-09-07
commit: a880e92b
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

**Claude Code, 2026-09-06. Gegenuebergestellt, nichts gebaut.**

### Die kurze Antwort

`[read]` **Es ist nichts verschwunden.** `[cmd]` **Alle drei
Goals-Mockups liegen unveraendert in
`docs/spezifikation/10-plattform/design-system/theme-v1/`** —
`module-goals.jsx` (903 Z), `module-goals-pro.jsx` (905 Z),
`module-goals-editor.jsx` (569 Z), zusammen 2.377 Zeilen.

`[cmd]` **Und sie sind angebunden, wie die Regel es verlangt:**
**`apps/web/src/app/v2/goals/` traegt 4.658 Zeilen in 13 Dateien** —
**mehr als die Vorlage, nicht weniger.**

`[read]` **Toms Beobachtung stimmt trotzdem** — **nur ist es kein
Verschwinden, sondern ein Zustand:** **die fortgeschrittene Haelfte
ist da, sichtbar, und nicht bedienbar.**

### 1 · Die 110 Spalten — gezaehlt

`[cmd]` **Gemessen am 2026-09-06 ueber alle 110 Spalten in `goals`,
gegen alle 1.100 Dateien in `apps/web/src`, mit Wortgrenze:**

    Tabelle                Sp   gelesen  angezeigt  SCHREIBBAR
    body_circumferences    22        22         21           7
    body_measurements      17        17         13          15
    goal_milestones        20        13         13           4
    goal_phases            14        14         14           4
    nutrition_targets      14        14         12          12
    user_goals             23        18         18           6
    ────────────────────────────────────────────────────────────
    GESAMT                110        98         91          48

`[read]` **Das ist der Befund in einer Zeile: 91 von 110 Spalten
stehen am Schirm, aber nur 48 lassen sich schreiben.**

`[read]` **Die Luecke ist nicht das Lesen** — **es ist das
Eintragen.**

### Was gar nicht erreicht wird — 12 Spalten

    goal_milestones  milestone_type, threshold_pct, achieved_date,
                     achieved_value, celebration_message,
                     auto_generated, notification_sent      (7)
    user_goals       motivation_reason, difficulty_level,
                     auto_update, celebration_enabled,
                     achievement_date                       (5)

`[read]` **Die Meilenstein-Automatik ist vollstaendig unerreichbar**
— **`auto_generated`, `threshold_pct` und `notification_sent`
beschreiben eine Maschine, die Meilensteine selbst erzeugt und
meldet.** `[cmd]` **13 Zeilen liegen in der Tabelle.**

### 2 · Die neun Phasenarten — welche haben einen Weg?

`[cmd]` **Gemessen, in wie vielen `.tsx` jede Art vorkommt:**

    fat_loss           1        contest_prep       1
    lean_bulk          2        reverse_diet       1
    maintenance        2        expert_bb_annual   2
    recomp             4        mini_cut           0
                               peak_week           0

`[read]` **Aber die Zahl allein taeuscht** — **Vorkommen ist kein
Weg.** `[cmd]` **Nachgesehen: `phase-editor.tsx` fuehrt
`contest_prep` mit Unterphasen, Refeeds und Peak Week, und
`expert_bb_annual` mit Jahresbloecken.**

`[cmd]` **Beide lesen aber `GOAL_PHASES` aus `daten.ts`** — **einer
Attrappenkonstante aus `module-goals-pro.jsx:5-192`, nicht aus
`goals.goal_phases`.**

`[cmd]` **Und JEDE Aktion darin ist ein `InEntwicklungKnopf`:**
*Add sub-phase*, *Reset to IFBB default*, *Add block*, *Apply to my
plan*.

**Der Weg zu einer Phase, gemessen:**

    setzt eine Phase in der Datenbank      KEINE Oberflaeche
    zeigt die laufende Phase               tab-phase.tsx, echt
    zeigt Phasenmodelle zum Ansehen        phase-editor.tsx, Attrappe

`[cmd]` **`goal_phases` hat 4 von 14 Spalten schreibbar** — und die
vier sind `id`, `user_id`, `gueltig_ab`, `updated_at`. **Die
Zustandsmaschine selbst** — `phase_type`, `variant`, `parameters`,
`transitioned_from`, `recommended_next`, `transition_reason` —
**ist vollstaendig nur lesbar.**

`[read]` **Damit ist die Antwort auf Toms Frage: keine der neun
Phasenarten hat einen Weg.** **Auch die vier einfachen nicht.**

**Am Schirm belegt** (`backup/g355-goals-phase.png`): die Kachel
zeigt *lean bulk · moderate · laufend*, *Kam aus: maintenance*,
*Empfohlen als Naechstes: mini cut*, Quelle *GO-07 testdata* —
**echte Daten, gelesen, mit einem Hinweis daneben, dass
`goal_phases` weder Woche noch Fortschritt fuehrt.**

### 3 · FFMI und die Umfaenge

`[cmd]` **FFMI ist erreichbar.** `body_measurements` hat **15 von
17 Spalten schreibbar**, darunter `ffmi`, `lean_mass_kg`,
`fat_mass_kg`, `bf_method`, `height_cm_snapshot`. `[cmd]` **Der
Schreibweg ist `lib/goals/koerpermass-write.ts`, die Rechnung steht
in `koerpermass-rechnung.ts` (Kouri-normalisiert).** `[cmd]` **362
Zeilen liegen live.**

`[cmd]` **Die 13 Messpunkte sind TOT.** `body_circumferences` hat
**22 Spalten, 21 angezeigt — und 7 schreibbar.** `[cmd]` **Keiner
der 13 Punkte ist darunter:**

    neck, shoulders, chest, upper_arm_left/right,
    forearm_left/right, waist, hip, thigh_left/right,
    calf_left/right

`[read]` **Alle dreizehn werden gelesen und angezeigt** — **54
Zeilen liegen in der Tabelle** — **und keiner laesst sich
eintragen.**

`[read]` **Das ist der klarste Fall von Toms Satz:** **die Ansicht
ist fertig, die Eingabe fehlt.**

### 4 · Die Attrappen-Vermerke — gezaehlt und eingeordnet

`[cmd]` **69 Vermerke in `v2/goals`**, je Datei:

    tab-phase.tsx       23      ansicht.tsx          1
    phase-editor.tsx    23      und acht weitere je 1-2
    tab-physique.tsx    12
    modale.tsx          10

`[cmd]` **Gegengeprobt mit `grep -c`:** 22 Knoepfe je Datei plus
**ein** Dateivermerk (*„ALLES IST ATTRAPPE"*) — **die Zahlen
stimmen ueberein.**

**Und die Einordnung, die der Auftrag verlangt:**

    5   nennen den SCHREIBWEG als das Fehlende
    2   nennen die Datenlage (Tabelle/Spalten)
    62  sagen nur "noch nicht"

`[read]` **Das ist Toms Punkt, gemessen: 62 von 69 sagen nicht, WAS
fehlt.**

**Die sieben mit Begruendung — und sie sind gut:**

    modale.tsx:368   Log weight          Schreibweg benannt
    modale.tsx:405   Save measurements   Schreibweg benannt
    modale.tsx:176   Create goal         Datenlage + G-352/G-354
    phase-editor:692 Save as my template Schreibweg
    phase-editor:695 Apply to my plan    Schreibweg, woertlich:
        "gelesen wird ueber `goals.phase_am`, geschrieben wird
         nirgends"
    tab-phase:422    Switch to <Phase>   Schreibweg
    modale.tsx:13    Dateikopf           Datenlage

`[read]` **Das Muster ist klar und es ist kein Zufall:** **die
Knoepfe an der Aussenkante tragen einen Grund, die inneren
Bedienelemente nicht.** `[cmd]` *Add sub-phase*, *Refeed Mo/Do*,
*Add block*, *Reset to IFBB default*, *Restore defaults* —
**keiner sagt, woran es haengt.**

`[read]` **Warum das schadet:** **wer *Apply to my plan* liest,
weiss, dass der Schreibweg fehlt.** **Wer *Add sub-phase* liest,
weiss nur, dass es nicht geht** — **und beim naechsten Auftrag
faengt das Messen von vorn an.**

### Was je Vermerk fehlt — die Antwort ist einheitlich

`[read]` **Fuer alle 62 unbenannten in `phase-editor.tsx` und
`tab-phase.tsx` ist es DASSELBE, und es ist gemessen:**

    fehlt der Leseweg?        NEIN - `goals.phase_am` liest
    fehlt die Entscheidung?   NEIN - der CHECK nennt neun Arten
    hat es nie jemand
    versucht?                 JA - es gibt keinen einzigen
                              insert/update auf `goal_phases`

`[cmd]` **Kein `.insert(` und kein `.update(` auf `goal_phases` in
`apps/web/src`.** `[read]` **Der Editor ist eine vollstaendige
Ansicht einer Maschine, die niemand starten kann.**

### 5 · Falschaussagen wie die aus G-354 — gesucht und gezaehlt

`[cmd]` **38 Verneinungen in Kommentaren im ganzen Baum, davon 5 mit
Goals/Body-Bezug.** `[cmd]` **Alle fuenf gegen die Datenbank
gehalten:**

    recovery.hrv_measurements     gibt es NICHT   -> Aussage stimmt
    constant_evidence_registry    gibt es NICHT   -> Aussage stimmt
    public.profiles.height_cm     gibt es         -> bedingt formuliert
                                                     ("fehlt sie, …")
    goals.nutrition_targets       gibt es         -> bedingt formuliert

`[read]` **Keine weitere Falschaussage.** **Der G-354-Fund war der
einzige, und er ist berichtigt** (Commit `d5cad642`).

### Die Probe der Probe

`[read]` **Eine Suche, die nichts findet, ist von einer, die nicht
sucht, nicht zu unterscheiden.** `[cmd]` **Deshalb den
Originaltext von G-354 aus `git show d5cad642^` durch dieselbe
Suche geschickt.**

`[cmd]` **Sie fand ihn zuerst NICHT** — **zwei Gruende, beide
behoben:**

    1  die Aussage lief ueber ZWEI Zeilen: "es gibt weder" am
       Zeilenende, die Tabellennamen auf der naechsten
    2  mein Muster verlangte "es gibt (kein|nicht|weder)" —
       im Text steht "es gibt weder" mit anderer Wortstellung

`[read]` **Erst nach beiden Berichtigungen fand sie den bekannten
Fall.** **Die 38 und die 5 sind also gemessen, nicht behauptet.**

### 6 · Was die Spec verlangt und hier nicht steht

`[cmd]` **`docs/specs/Goals/` fuehrt 10 Dateien, 65 KB**, darunter
`PHASE_MODELS.md` (7 KB) und `SCORING.md` (10 KB).

`[cmd]` **`DATABASE.md:102` nennt den `phase_type`-CHECK woertlich
mit denselben neun Werten wie die laufende Datenbank** —
**Spec und Schema stimmen ueberein.**

`[read]` **Damit liegt die Abweichung NICHT zwischen Spec und
Datenbank, sondern zwischen Datenbank und Oberflaeche.** **Das ist
der Grund, warum eine Spec-Pruefung allein nichts gefunden
haette.**

### Die Gegenueberstellung, kurz

    Bereich          Spec   Datenbank        Schirm          Luecke
    Ziele            ja     23 Sp, 11 Z      lesend          anlegen
    Meilensteine     ja     20 Sp, 13 Z      13 Sp lesend    7 Sp tot
    Phasen           ja     14 Sp,  5 Z      lesend, echt    setzen
    Phasenmodelle    ja     dieselben 9      Attrappe        alles
    Koerpermasse     ja     17 Sp, 362 Z     lesend+schreib  --
    Umfaenge         ja     22 Sp,  54 Z     13 Punkte       eintragen
    Zielwerte        ja     14 Sp,  5 Z      lesend+schreib  --

`[read]` **Zwei Bereiche sind fertig** (Koerpermasse, Zielwerte).
**Fuenf zeigen Daten, die niemand eintragen kann.**

### Bildschirmfotos

    backup/g355-goals-goals.png       Zielliste
    backup/g355-goals-phase.png       die laufende Phase, echt
    backup/g355-goals-tdee.png        Adaptive TDEE, 6 Attrappen
    backup/g355-goals-timeline.png    Zeitachse (E-54)
    backup/g355-goals-metrics.png     Koerpermasse
    backup/g355-goals-measure.png     Messungen
    backup/g355-goals-comp.png        Composition
    backup/g355-goals-physique.png    Physique, 41 Kacheln

### Gemessen, nicht gebaut

    geaendert           nichts am Code
    dev@lumeos.app      nicht geschrieben, 730 Mahlzeiten
    goals-Tabellen      nur gelesen
    gestaged            nichts

## Abnahme

**2026-09-07, Orchestrator.** **Ging in G-359 und G-365 auf.**

`[cmd]` **Die Messung war vollstaendig: 110 Spalten, 98 gelesen, 91
angezeigt, 48 schreibbar.**

`[read]` **Und sie fuehrte zur wichtigsten Erkenntnis des Tages:**
**die Luecke ist nicht das Lesen, sondern das Eintragen.**

`[cmd]` **Keine der neun Phasenarten hatte einen Schreibweg, die 13
Umfangspunkte waren tot** — **beide seit G-357 und G-356 gebaut.**

`[cmd]` **Und der Fund, der alles ausloeste:** `modale.tsx:13`
**behauptete, es gebe weder `goals.user_goals` noch
`goals.body_measurements`** — **beide gibt es.**

`[read]` **Der Orchestrator hat die falsche Frage gestellt:**
**Datenbank gegen Schirm statt Mockup gegen Schirm.** `[cmd]` **Die
richtige Messung dauerte vier Minuten und ergab 105 fehlende
Elemente allein in `goals`.**

**Abgenommen, aufgegangen in G-359.**


## Nachtrag 2026-09-07 — die Spec liegt in `docs/specs/Goals/`

`[cmd]` **Zehn Dateien, 1.996 Zeilen.**

`[read]` **Der Orchestrator hatte im Auftrag auf `00-QUELLEN.md`
verwiesen, ohne das Verzeichnis zu nennen.**

`[cmd]` **`docs/specs/` traegt 13 Modulordner mit rund 50.500
Zeilen** — **Nutrition allein 46 Dateien.**
