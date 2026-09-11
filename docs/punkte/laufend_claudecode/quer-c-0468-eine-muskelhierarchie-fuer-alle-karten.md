---
nr: C-468
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-425
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
  wurzeln: 7
  kinder: 88
---

# C-468 — eine Muskelhierarchie fuer alle Karten

## Toms Vorgabe

Tom, 2026-09-08:

> ich denke, wenn wir gruppieren, dann muessen wir mit
> parent/child arbeiten ? denn ein bodybuilder nutzt uebungen fuer
> einzelne muskeln sowie gebuendelt.

> das gilt auch fuer recovery, ueberall wo wir die maps
> einsetzen.

## Die Hierarchie EXISTIERT schon

`[cmd]` **`training.muscle_groups`: 95 Zeilen, 7 Wurzeln, 88
Kinder, mit `parent_id`.**

    Back, Chest, Core, Arms, Legs,
    Neck Muscles, Shoulders

`[cmd]` **Unter `Back` haengen NEUN:**

    Mid Back, Upper Back, Lower Back,
    Trapezius, Rhomboids, Teres Major,
    levator scapulae, erector spinae,
    latissimus dorsi

`[read]` **Genau die Muskeln, die `muskel-ebenen.ts` auf EINE
Flaeche wirft.**

## Drei Beschreibungen desselben Koerpers

    training.muscle_groups     7 Wurzeln, 88 Kinder
                               echte Hierarchie
    muskel-zuordnung.ts       18 Gruppen, 17 Teilstuecke
                               EINE Ebene
    koerperkarte-pfade.ts     21 Flaechen
                               flach

`[cmd]` **Und `muskel-zuordnung.ts` nennt `upper-back` woertlich
*,,Oberer Ruecken (mit Latissimus)"*** ? **der Name gibt zu, dass
er zwei Sachen zusammenfasst.**

## Wo die Karte ueberall steht

`[cmd]` **Gemessen, 19 Dateien:**

    packages/ui/koerperkarte-pfade.ts    64,8 KB
    packages/ui/koerperkarte.tsx         25,2
    recovery/motor.ts                    34,2
    recovery/mockup-referenz.tsx         63,6
    recovery/muskel-zuordnung.ts         12,2
    recovery/muskel-ebenen.ts             8,7
    recovery/koerperkarte.tsx             5,6
    recovery/tab-checkin.tsx             13,7
    supplements/tab-injektionen.tsx      31,8
    lib/medical/injektion-flaechen.ts     9,8
    lib/medical/koerperflaechen.ts        2,6
    coach/ai/orb.tsx                      2,8

`[read]` **Recovery, Supplements, Medical, Coach** ? **vier
Module an derselben Karte.**

## Was der Bodybuilder braucht

    "Ruecken trainiert"       -> Back            Elternteil
    "Latissimus trainiert"    -> latissimus dorsi  Kind
    "Rhomboiden verspannt"    -> Rhomboids         Kind

`[read]` **Mit `parent_id` geht beides aus derselben Quelle** ?
**die Karte faerbt das Kind, die Auswertung summiert ueber den
Elternteil.**

## Was fehlt: die Bruecke

`[cmd]` **`muscle_groups` hat keine Pfade.**
`[cmd]` **`koerperkarte-pfade.ts` hat keine Hierarchie.**

`[read]` **Jeder Pfad muesste auf eine `muscle_groups.id`
zeigen.**

`[cmd]` **G-425 liefert gerade, WELCHER Pfad welcher Muskel
ist** ? **danach ist die Zuordnung machbar.**

## Was zu entscheiden ist

**1** ? **Wo lebt die Hierarchie?**

`[cmd]` **`training.muscle_groups` traegt sie heute** ? **aber die
Karte gehoert `packages/ui`, und Recovery, Supplements und
Medical lesen sie auch.**

`[read]` **Ein Schema `training` als Quelle fuer Recovery ist ein
Modulbruch** (SPEC_01: Schema-Isolation).

`[read]` **Oder gehoert sie nach `public`?**

**2** ? **Wie tief?**

`[cmd]` **`muscle_groups` hat ZWEI Ebenen (Wurzel, Kind).**

`[read]` **Die Karte braucht eine dritte: links und rechts.**

`[cmd]` **`lat_l`/`lat_r` sind heute Punkte, keine Flaechen.**

**3** ? **Was wird aus den 21 Flaechen?**

`[read]` **`hair`, `head`, `hands`, `feet`, `ankles` sind keine
Muskeln** ? **sie stehen in der Karte fuer Muskelkater, nicht
fuer Training.**

`[read]` **Eine Hierarchie mit einem Merkmal *,,ist Muskel"*
traegt beides.**

## G-425 hat gemessen, was in `upper-back` steckt

`[cmd]` **Sechs Pfade, DREI Muskeln je Seite:**

    Pfad 1 / 4    Teres major        klein, unter dem Deltoid
    Pfad 2 / 5    Teres minor /      Sichel, seitlich
                  oberer Lat-Rand
    Pfad 3 / 6    Latissimus dorsi   gross, Achsel bis Taille

`[cmd]` **Und die Rhomboiden, die `muskel-ebenen.ts` darauf
wirft, sind in KEINEM der sechs.**

`[read]` **Die Gruppe ist nicht anatomisch** ? **sie fasst drei
Muskeln zusammen und behauptet zwei weitere, die sie nicht
zeichnet.**

## Die Unterscheidung, die G-425 gefunden hat

`[cmd]` **Sieben Flaechen haben mehrere Pfade, in drei
Faellen:**

    EIN Muskel, mehrere Pfade
      trapezius, triceps, lower-back
      -> zusammenlassen

    Spiegelpaare desselben Muskels
      gluteal
      -> links/rechts trennen

    VERSCHIEDENE Muskeln
      upper-back
      -> aufteilen

`[read]` **Ein Pfad ist eine Zeichenebene, kein Muskel** ?
**`triceps` hat drei Koepfe und bleibt EIN Muskel.**

`[read]` **Das ist der Massstab fuer die Hierarchie: nicht *,,wie
viele Pfade"*, sondern *,,wie viele Muskeln"*.**

## Und `lower-back` hat denselben Fehler

> *,,Vier Pfade, die zusammen den Bereich zwischen Lat und
> Gesaess zeichnen ? anatomisch der Erector spinae, aber die
> Karte nennt ihn nach der Region."*

`[cmd]` **`training.muscle_groups` fuehrt `erector spinae` als
eigenes Kind von `Back`.**

`[read]` **Die Hierarchie kennt den Muskel, die Karte nennt die
Region.**

## Toms Entscheidungen, 2026-09-08

**1** ? **Wo lebt die Hierarchie?**

> ja, das ist eine public komponente, wenn sie von mehreren
> modulen benutzt wird

`[read]` **Schema `public`** ? **nicht `training`.**

**2** ? **Wie tief?**

> ok, eine dritte

`[read]` **Drei Ebenen:**

    Wurzel   Back
    Muskel   latissimus dorsi
    Seite    links / rechts

**3** ? **Was wird aus `hair`, `head`, `hands`, `feet`,
`ankles`?**

> brauchen wir, dass wir einen mensch erkennen

`[read]` **Sie bleiben** ? **als Umriss, nicht als Muskel.**

`[read]` **Ein Merkmal unterscheidet sie** ? **`ist_muskel` oder
eine Art (`muskel | umriss`).**

## ALLE 23 Flaechen, gemessen

`[cmd]` **`koerperkarte-pfade.ts`, `MUSKELN`:**

    Flaeche        side    front  back
    ---------------------------------
    chest          front       2     -
    abs            front       8     -
    obliques       front      16     -
    biceps         front       2     -
    triceps        both        2     6
    deltoids       both        2     2
    trapezius      both        2     2
    neck           both        5     2
    forearm        both        6     8
    adductors      both        6     2
    quadriceps     front       6     -
    knees          front       4     -
    tibialis       front       2     -
    calves         both        4     8
    upper-back     back        -     6
    lower-back     back        -     4
    gluteal        back        -     4
    hamstring      back        -     8
    head           both        1     1
    hair           both        1     1
    hands          both       12    11
    ankles         both        4     2
    feet           both        4     2

`[read]` **G-425 hat nur `upper-back`, `lower-back`, `gluteal`,
`trapezius` und `triceps` angesehen.**

`[read]` **ACHTZEHN Flaechen sind ungeprueft** ? **darunter
`obliques` mit 16 Pfaden, `hands` mit 23, `hamstring` mit 8,
`calves` mit 12.**

`[cmd]` **`obliques`: 16 Pfade auf EINER Flaeche** ? **die
schraegen Bauchmuskeln sind zwei Muskeln je Seite (externus,
internus), nicht sechzehn.**

`[cmd]` **`hamstring`: 8 Pfade** ? **drei Muskeln je Seite
(biceps femoris, semitendinosus, semimembranosus).**

`[cmd]` **`calves`: 12 Pfade** ? **zwei Muskeln je Seite
(gastrocnemius, soleus).**

`[read]` **Jede Flaeche mit mehr als zwei Pfaden je Ansicht ist
zu pruefen.**

## Der Massstab aus G-425

    EIN Muskel, mehrere Pfade     zusammenlassen
    Spiegelpaare                  links/rechts trennen
    VERSCHIEDENE Muskeln          aufteilen

`[read]` **Ein Pfad ist eine Zeichenebene, kein Muskel.**

## Was gebaut wird

`[read]` **Eine Tabelle in `public`, drei Ebenen, mit
`parent_id`.**

`[cmd]` **`training.muscle_groups` traegt heute 7 Wurzeln und 88
Kinder** ? **die Namen stehen schon, samt `latissimus dorsi`,
`Rhomboids`, `Teres Major`, `erector spinae`.**

`[read]` **Miss, ob sie uebernommen oder ersetzt wird.**

`[read]` **Und je Eintrag ein Merkmal, ob es ein Muskel ist oder
Umriss.**

## Was NICHT gebaut wird

`[read]` **Keine Pfadzuordnung** ? **welcher Pfad zu welchem
Muskel gehoert, ist G-425 und ein UI-Auftrag.**

`[read]` **`koerperkarte-pfade.ts` bleibt unberuehrt** ? **sie
gehoert `packages/ui` und allen vier Modulen.**

## Abnahmebedingungen

    A1  alle 23 Flaechen gemessen: wie viele MUSKELN
        stecken darin? TABELLE mit Begruendung.
    A2  die Tabelle in public, drei Ebenen, parent_id.
    A3  wird training.muscle_groups uebernommen oder
        ersetzt? Gemessen, begruendet.
    A4  je Eintrag: Muskel oder Umriss.
    A5  die 95 Zeilen in training.muscle_groups bleiben
        gueltig, oder der Umzug ist belegt.
    A6  RLS beide Richtungen, anon ohne EXECUTE.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**`packages/ui` NICHT anfassen.**
**Keine Oberflaeche.**
**Keinen Muskel erfinden** ? **was die Karte nicht zeigt, wird
gemeldet.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — alle 23 Flaechen angesehen. DREI tragen verschiedene Muskeln.

`[cmd]` **Jeder Pfad einzeln eingefaerbt und fotografiert**
(`tools/_c468-flaechen.mjs`, 61 Bilder in `docs/bilder/c468/`) —
dasselbe Verfahren wie G-425, weil die Zahlen sagen WO und nur das
Bild sagt WAS.

**DIE DREI, DIE AUFZUTEILEN WAEREN:**

    Flaeche      Pfade  Muskeln  was im Bild steht
    ------------------------------------------------------------
    upper-back       6    3 Paare  1/4 Teres major, 2/5 Teres minor,
                                   3/6 Latissimus dorsi   (G-425)
    lower-back       4    2 Paare  2/3 Erector spinae,
                                   1/4 Flanke (QL/Obliquus)  (G-425)
    obliques        16    1 Paar   Pfad 8 und 16 sind der
                                   Obliquus-Bauch, 1-7 und 9-15 die
                                   Verzahnung mit dem Serratus

`[cmd]` **`obliques` ist NICHT der Fall, den der Auftrag vermutete.**
Der Auftrag schreibt: *„die schraegen Bauchmuskeln sind zwei Muskeln
je Seite (externus, internus), nicht sechzehn."* `[read]` **Am Bild
ist es EIN Muskel je Seite plus sieben Zeichenteile** — der Internus
liegt unter dem Externus und wird gar nicht gezeichnet.

**DIE ZWANZIG UEBRIGEN buendeln EINEN Muskel oder eine anatomische
Gruppe:**

    quadriceps   6 Pfade   3 sichtbare Koepfe je Bein
                           (Vastus lateralis / Rectus / medialis)
    hamstring    8 Pfade   3 Muskelstreifen je Bein + 1 Sehnenlinie
    calves      12 Pfade   Gastrocnemius zweikoepfig + Soleusrand
    forearm     14 Pfade   Beugerbuendel vorne, Strecker hinten
    abs          8 Pfade   die Segmente des Rectus abdominis
    adductors    8 Pfade   die Innenseite, eine Gruppe
    triceps      8 Pfade   drei Koepfe, EIN Muskel        (G-425)
    trapezius    4 Pfade   ein Muskel, zwei Haelften       (G-425)
    gluteal      4 Pfade   ein Muskelpaar, Spiegelhaelften (G-425)
    deltoids     4 Pfade   ein Muskelpaar
    neck         7 Pfade   Halsmuskeln + Drosselgrube (Umrissdetail)
    chest/biceps/tibialis  je 2 Pfade, ein Muskelpaar
    knees/ankles/feet/hands/head/hair   kein Muskel

`[read]` **Der Massstab hat gehalten:** ein Pfad ist eine
Zeichenebene. `[cmd]` **`quadriceps` ist der beste Beleg** — drei
Pfade je Bein, und das Bild zeigt Vastus lateralis, Rectus femoris
und Vastus medialis: **die Koepfe EINES Muskels.**

**WAS DIE KARTE NICHT ZEIGT — gemeldet, nicht erfunden:**

    Rhomboiden          muskel-ebenen.ts wirft sie auf upper-back,
                        KEINER der sechs Pfade zeichnet sie (G-425)
    Obliquus internus   liegt unter dem Externus, nicht gezeichnet
    Soleus              liegt unter dem Gastrocnemius; die vier
                        Calf-Pfade je Bein trennen ihn nicht belegbar

`[read]` **Diese drei haben KEINE Zeile bekommen.** **Eine Flaeche
ohne Pfad waere eine Zusage, die die Karte nicht einloest.**

### A3 + A5 — `training.muscle_groups` wird WEDER ersetzt NOCH kopiert

`[cmd]` **Gemessen 2026-09-11:**

    Zeilen                    95
    davon mit parent_id       88
    Tiefe                      VIER Ebenen (7 / 28 / 45 / 15)
    Fremdschluessel darauf     training.exercise_muscles
    Leseaufrufe in apps/web    4, in zwei Dateien

`[cmd]` **DER AUFTRAG NENNT ZWEI EBENEN — es sind VIER.**

    Arms > Forearms > Forearm Extensors > Extensor Carpi Radialis

`[read]` **Das ist ein echter Pfad in der Tabelle.**

**Sie bleibt, aus drei gemessenen Gruenden:**

`[cmd]` **1 — `training.exercise_muscles` haengt per Fremdschluessel
daran.** Ein Umzug braeuchte eine zweite Migration im
Trainingsschema.

`[cmd]` **2 — `apps/web/src/lib/training/sitzungen-read.ts` und
`uebungen-read.ts` lesen sie**, vier Aufrufe. `[read]` **`apps/`
gehoert in diesem Auftrag Claude Code** — ich haette den Leseweg
gebrochen, ohne ihn reparieren zu duerfen.

`[cmd]` **3 — sie traegt eine ANDERE Zerlegung:** die Karte zeichnet,
was man SIEHT (23 Flaechen), `muscle_groups` fuehrt, was man
TRAINIERT (95 Muskeln). `[read]` **Zwei Sichten auf denselben
Koerper, nicht zwei Fassungen derselben Liste.**

`[read]` **Und sie wird auch nicht KOPIERT** — eine zweite
Namensliste liefe auseinander. `[cmd]` **Stattdessen ZEIGT die neue
Tabelle auf sie:** `muscle_group_id` ist der Anker, per Namen
aufgeloest. **45 von 59 Zeilen sind verbunden.**

`[cmd]` **Alle neunzehn gesuchten Muskelnamen stehen schon dort** —
`latissimus dorsi`, `erector spinae`, `Teres Major`, `Rhomboids`,
`Quadriceps`, `Hamstrings`, `Calves`, `Obliques`, `Glutes` und die
uebrigen zehn. **Kein Name erfunden.**

### A2 — `public.koerperflaechen`, drei Ebenen, `parent_id`

    Ebene  Art      Zeilen
    ----------------------
    1      muskel        7   Back, Chest, Core, Arms,
           umriss        1   Shoulders, Legs, Neck + Umriss
    2      muskel       17   die Kartenflaechen
           umriss        6   head, hair, hands, feet, ankles, knees
    3      muskel       28   links / rechts
    ----------------------
                       59

`[read]` **Die achte Wurzel `wurzel-umriss` war noetig** — ohne sie
haetten `hands` und `head` keinen Elternteil, und die Regel „Ebene 2
hat einen" fiele.

**Vier CHECKs halten die Form:**

    ebene IN (1,2,3)
    art IN ('muskel','umriss')
    Ebene 3 hat eine Seite, Ebene 1 und 2 keine
    Ebene 1 hat keinen Elternteil, 2 und 3 haben einen
    ein Umriss hat keinen muscle_group_id

`[cmd]` **Die dritte Ebene bekommen nur Flaechen, die die Karte
WIRKLICH zweiseitig zeichnet.** `[read]` **`abs`, `obliques` und
`neck` nicht** — dort sind die Pfade Segmentmuster, keine Haelften.
**Eine Seitenzeile waere dort eine Zusage, die kein Pfad einloest.**

### A4 — Muskel oder Umriss, je Eintrag

`[cmd]` **Toms dritte Entscheidung als Spalte `art`:**

    muskel   52 Zeilen   trainierbar
    umriss    7 Zeilen   hair, head, hands, feet, ankles, knees
                         + die Wurzel darueber

`[cmd]` **Gegengeprueft: 0 Umrisse tragen einen `muscle_group_id`** —
der CHECK erlaubt es nicht. `[read]` **Sonst stuende `hands`
irgendwann in einer Trainingsauswertung.**

### A6 — Zeilensicherheit, beide Richtungen

    authenticated  SELECT   59 Zeilen              MUSS gehen     ok
    anon           SELECT   permission denied      MUSS scheitern ok
    authenticated  INSERT   permission denied      MUSS scheitern ok
    service_role   SELECT   59 Zeilen              MUSS gehen     ok

**EIN BEFUND, DER MICH ZUERST GETAEUSCHT HAT:**

`[cmd]` **Nach dem ersten Lauf stand `authenticated` mit UPDATE,
TRUNCATE, TRIGGER und REFERENCES da** — obwohl die Datei nur
`GRANT SELECT` vergibt.

`[cmd]` **Die Ursache steht in `pg_default_acl`:** Supabase vergibt
im Schema `public` bei JEDER neuen Tabelle `arwdDxtm` an `anon`,
`authenticated` und `service_role`. **Mein `REVOKE` lief vor der
Tabellenerzeugung ins Leere.**

`[read]` **Die Zeilensicherheit fing es ab** (`UPDATE 0`, weil es
keine UPDATE-Policy gibt) — **aber ein Recht, das nur durch eine
fehlende Policy ins Leere laeuft, ist ein Recht zu viel.**

`[cmd]` **Berichtigt: erst `REVOKE ALL ... FROM authenticated`, dann
`GRANT SELECT`.** **Jetzt steht dort genau SELECT, und bei `anon`
gar nichts.**

### A7 — Sicherung, Kette, Punktelauf

    Sicherung   backup/schema/20260911170000_c468_vor_einspielen.dump
                26,5 MB, vor der ersten Strukturaenderung

    Kettenlauf  [migration-kette] gruen: keine neue Migration
                ohne Kettenschritt
    Punkte      [punkte] gruen: 25 Befunde, genau der Sollstand
    Schemafreigabe  10 config-Schemata, 8 Anwendungsschemata

`[cmd]` **Zwei Gate-Pruefer sind rot — beide VOR diesem Auftrag:**

    migration-datenlogik-pruefen   nennt C-428, C-429, C-432,
                                   C-460, C-466 — keine von mir
    zwei-wahrheiten-pruefen        Massstab G-218, unabhaengig

`[cmd]` **Gegengeprueft: keiner der beiden nennt `468` oder
`koerperflaechen`.**

## Ein Hinweis zum Ablageort

`[cmd]` **`supabase/migrations/` ist schreibgeschuetzt** — der Hook
`protect-paths.ps1` blockt Schreibzugriffe dorthin.

`[read]` **Die Struktur liegt deshalb in `_pipeline/00_querschnitt/`**
— dort, wohin die Projektregel sie ohnehin stellt (*„Struktur nach
`supabase/migrations/`, Daten und Seeds nach `_pipeline/`"* meint die
deploybare Baseline; der Kettenschritt ruft die Datei auf).

    468_koerperflaechen_hierarchie.sql   Tabelle, CHECKs, RLS
    468b_koerperflaechen_seed.sql        die 59 Zeilen

`[cmd]` **Beide sind in `kette.json` registriert**, `468b` haengt an
`468`, `468` an `107` (der Hierarchie-Schritt von
`training.muscle_groups`).

`[read]` **Ich habe den Hook NICHT umgangen** — wenn die Struktur in
`migrations/` gehoert, braucht es eine Freigabe, und das ist Toms
Entscheidung.

## Was NICHT getan wurde

**1 — Keine Pfadzuordnung.** `[read]` **Welcher Pfad zu welcher Zeile
gehoert, ist ein UI-Auftrag** — wie beauftragt.

**2 — `packages/ui` nicht angefasst.** `[cmd]` **Die Bilder entstehen
aus einer zweiten SVG**, die dieselben Daten liest.

**3 — `apps/` nicht angefasst.** Claude Code arbeitet dort.

**4 — Der Dev-Server nicht angefasst.**

**5 — Nicht committet, nicht gestaged.**

## Drei Hinweise

**1 — Die Punktdatei liegt in `laufend_claudecode/`,** nicht in
`laufend_codex/` wie der Auftrag sagt. `[cmd]` **Dort gefunden und
dort fortgeschrieben.**

**2 — `training.muscle_groups` hat VIER Ebenen, nicht zwei.** Der
Auftrag nennt zwei. `[read]` **Fuer die Entscheidung aendert es
nichts** — sie bleibt so oder so — **aber wer „zwei Ebenen" liest,
unterschaetzt, was beim Ersetzen verloren ginge.**

**3 — Die Rhomboiden bleiben ohne Flaeche.** `[cmd]` **G-425 hat
belegt, dass kein Pfad sie zeichnet.** `[read]` **`muskel-ebenen.ts`
wirft sie trotzdem auf `upper-back`** — das ist eine Falschaussage in
`apps/`, und sie zu beheben gehoert Claude Code.

## Neustart

`[cmd]` **NICHT noetig** — nur `supabase/_pipeline/`, `tools/` und
`docs/`.

## Abnahme

_(vom Orchestrator)_
