---
nr: C-528
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: Tom
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  tabellen: [training.muscle_groups, training.exercise_muscles, public.koerperflaechen]
zahlen:
  gemessen: 2026-09-21
  muskeln: 105
  exercise_muscles: 6744
---

# C-528 - die Muskelhierarchie ist unsauber

## Toms Anstoss

Tom, 2026-09-08:

> meine excel zeigt, dass die uebungen primary und secondary muskeln zeigen

> ich denke, wir brauchen eine komplette muskelhierarchie tabelle und dann muss diese mit uebungen/recovery/etc richtig hinterlegt werden und womoeglich angereichert werden

## Ergebnis

Die komplette Hierarchie ist bereits vorhanden. Eine zweite Tabelle waere keine
Loesung: sechs Fremdschluessel haengen an `training.muscle_groups`.
Der Befund betrifft Benennung, einzelne Eltern-Kind-Beziehungen und einige
fehlende anatomische Kinder -- nicht die Tabellenbauform.

`[cmd]` 2026-09-21, laufende Datenbank:

    training.muscle_groups             105
      Ebene 1 / 2 / 3 / 4           7 / 30 / 51 / 17
    training.exercise_muscles        6.744
      primary 3.169 (Faktor 1,00)
      secondary 3.575 (Faktor 0,50)
    exercises                         1.416
      mit Muskelzuordnung              1.411
    recovery.muscle_recovery_profiles   105

`[read]` Die Nutzlast ist schon auf der bestehenden Hierarchie aufgebaut:

    exercise_muscles.muscle_group_id
    muscle_groups.parent_id
    koerperflaechen.muscle_group_id
    exercise_muscle_resolution_notes.original_muscle_group_id
    muscle_group_level_decisions.muscle_group_id
    muscle_recovery_profiles.muscle_group_id

Toms Excel-Klammern entsprechen der bestehenden Bauform, zum Beispiel
`Legs -> Hamstrings -> Biceps Femoris / Semitendinosus / Semimembranosus`.

## A1 -- gleiche Namen, aber nur wo die Anatomie es traegt

| Paar | Anatomischer Befund | Quelle | Messbarer Umfang | Urteil |
|---|---|---|---:|---|
| `Abductors` / `Hip Abductors` | Im `Legs`-Zweig bezeichnet beides dieselbe Funktion. Die fachliche Gruppe *hip abductors* besteht aus Gluteus medius, Gluteus minimus und Tensor fasciae latae. | [NCBI/StatPearls: Hip](https://www.ncbi.nlm.nih.gov/books/NBK526019/) | 2 + 30 Zuordnungen | Kurationskandidat. `Hip Abductors` ist der praezisere kanonische Name; kein automatischer Merge, weil `Abductors` ausserhalb dieses Zweigs mehrdeutig waere. |
| `Adductors` / `Hip Adductors` | In diesem Zweig dieselbe Bewegungsgruppe. Die Quelle fuehrt die *hip adductors* als Adductor magnus, longus und brevis (plus weitere beteiligte Muskeln). | [NCBI/StatPearls: Hip](https://www.ncbi.nlm.nih.gov/books/NBK526019/) | 31 + 1 Zuordnungen | Kurationskandidat. `Hip Adductors` ist keine sinnvoll feinere Untergruppe von `Adductors`, sondern dieselbe Sammelbezeichnung. |
| `Peroneals` / `Fibularis Muscles` | `Fibularis` ist der offizielle Terminus; `Peroneus` ist sein Synonym in Terminologia Anatomica 2. | [FIPAT Terminologia Anatomica 2](https://cdn.dal.ca/content/dam/dalhousie/pdf/library/FIPAT/TA2/FIPAT-TA2-Part-1.pdf) | 1 + 1 Zuordnung | Echter Synonym-Mergekandidat, kanonisch `Fibularis Muscles`. |

Folgende aehnliche Namen sind **keine** belegten Gleichheiten und duerfen nicht
zusammengefuehrt werden:

| Namen | Warum kein Merge | Quelle |
|---|---|---|
| `Fibularis Muscles` / `Peroneus Brevis` | `Peroneus/Fibularis brevis` ist ein konkreter Muskel; die laterale Gruppe besteht mindestens aus Longus und Brevis. Die Obergruppe ist also nicht der Brevis-Muskel. | [NCBI/StatPearls: Foot and Ankle](https://www.ncbi.nlm.nih.gov/books/NBK546698/) |
| `Tibialis` / `Anterior Tibialis` / `Tibialis Posterior` | Anterior und Posterior sind verschiedene Muskeln in verschiedenen Kompartimenten. `Tibialis` allein ist kein ausreichend bestimmtes anatomisches Ziel. | [NCBI/StatPearls: Tibialis anterior](https://www.ncbi.nlm.nih.gov/books/NBK513304/), [NCBI/StatPearls: Foot and Ankle](https://www.ncbi.nlm.nih.gov/books/NBK546698/) |
| `Inner Thigh` / `Adductors`, `Outer Thigh` / `Hip Abductors` | Inner/Outer Thigh sind Regionen, keine Muskelbezeichnungen. Die Quellen belegen eine funktionelle Beteiligung, aber keine Gleichheit der Region mit genau einer Muskelgruppe. | [NCBI/StatPearls: Hip](https://www.ncbi.nlm.nih.gov/books/NBK526019/) |
| `Thighs` / `Upper Legs` | Beides sind regionale Anzeigeausdruecke, keine anatomischen Muskeln. Die Datenquelle belegt keine eindeutige kanonische Muskelidentitaet; daher kein automatischer Merge. | [NCBI/StatPearls: Anthropometric Measurement](https://www.ncbi.nlm.nih.gov/books/NBK537315/) |

## A2 -- falsche bzw. uneinheitliche Eltern

| Ist | Befund | Begruendung | Sichere Richtung, keine Umsetzung |
|---|---|---|---|
| `Legs -> Abductors` neben `Legs -> Hip Abductors` | Zwei Geschwister fuer dieselbe hier gemeinte Funktionsgruppe. | Die Hip-Abduktoren sind anatomisch die benannte Gruppe; TFL, Gluteus medius und minimus gehoeren funktionell dazu. | Nach Toms Entscheidung `Abductors` in den kanonischen Gruppenbegriff ueberfuehren und die verstreuten Kinder danach kuratieren. |
| `Legs -> Adductors -> Hip Adductors` | Redundante Hierarchieebene. | `Hip Adductors` beschreibt nicht eine Teilmenge der Adduktoren, sondern nochmals die gleiche Funktion. | Den einen Sammelbegriff behalten, nicht Eltern und Kind parallel zaehlen. |
| `Lower Legs -> Fibularis Muscles` und `Lower Legs -> Peroneus Brevis` | Der konkrete Brevis steht neben seiner Obergruppe. | Longus und Brevis bilden die laterale Fibularis/Peroneus-Gruppe. | Falls die Obergruppe erhalten bleibt, `Peroneus Brevis` darunter haengen; vorher jede Zuordnung kuratieren. |
| `Lower Legs -> Tibialis`, `Anterior Tibialis`, `Tibialis Posterior` | Der Wortstamm suggeriert eine Elternschaft, anatomisch liegen die beiden konkreten Muskeln jedoch in verschiedenen Kompartimenten. | Tibialis anterior gehoert zum anterioren, Tibialis posterior zum tief-posterioren Kompartiment. | `Tibialis` nicht blind zum Elternknoten machen; seine zwei direkten Zuordnungen einzeln pruefen oder den unspezifischen Begriff als Alias behandeln. |
| `Legs -> Thighs` neben `Legs -> Upper Legs` | Zwei regionale Sammelnamen als direkte Muskelknoten. | Die Begriffe sind keine einzelnen Muskeln und keine belegte feinere Muskelhierarchie. | Eine Produktentscheidung: eine regionale Anzeigegruppe oder beide entfernen/als Alias fuehren; keine automatische Muskel-Umhaengung. |
| `Inner Thigh`, `Outer Thigh` als Muskelkinder | Region statt Anatomie im Muskelbaum. | Sie stehen fuer Flaechen, waehrend die zugeordneten Muskeln mehrere sein koennen. | Nicht mit einem Muskel verschmelzen; gegebenenfalls als Koerperflaeche/Anzeige behandeln. |

Nebenbefund: sieben von 105 Namen beginnen klein (`adductor brevis`,
`adductor magnus`, `erector spinae`, `latissimus dorsi`, `levator scapulae`,
`piriformis`, `splenius capitis`), die restlichen 98 gross. Das ist eine
Darstellungsinkonsistenz, keine anatomische Gleichheit.

## A3 -- vorhandene Aufraeumprotokolle

`[cmd]` `training.exercise_muscle_resolution_notes` wurde gelesen:

    1.105 Notizen
    1.101 resolved, Quelle exercise_catalog_enrichment_c83
        Wurzelgruppen wurden rollenbezogen auf konkrete Untergruppen aufgeloest.
        Beispielgrund: vorhandener Rohtext nennt eine Untergruppe;
        E-82 ersetzt nur die Wurzel.
        Die hier auffaelligen Bein-Knoten kommen in keiner der 1.101
        Aufloesungen als Original oder Ergebnis vor.
        4 unresolved: kein passender rollenbezogener Rohtext; Wurzel bleibt
        bis zur Einzelpruefung (nicht still geraten).

`[cmd]` `training.muscle_group_level_decisions` wurde ebenfalls gelesen:

    22 Entscheidungen, Quelle e82_set_counting_scope
    21 keep_group
     1 map_to_child: Lower Back -> erector spinae

Die 21 `keep_group`-Entscheidungen sagen ausdrücklich: Ohne
bewegungsspezifische Messung bleiben Sammelgruppen die tiefste zaehlbare
Satzebene. Darunter sind `Adductors` und `Hip Abductors` (aber nicht
`Abductors`, `Fibularis Muscles`, `Peroneals`, `Tibialis`, `Thighs` oder
`Upper Legs`). Eine kuenftige Kuration darf diese Entscheidung nicht
ueberschreiben, ohne die Satzzaehlregel erneut zu entscheiden.

## A4 -- Auswirkung auf Belastung und Doppelzaehlung

Die heutige Trainingsrechnung liest jede `exercise_muscles`-Zeile einzeln.
Sie benutzt derzeit nicht einmal `faktor`; jeder Satz wird pro Zuordnung
gezaehlt. Elternzustand wird danach aus direkten Kindern verdichtet. Daher
wuerde ein semantisch doppeltes Paar bei derselben Uebung auch den
Elternwert doppelt erreichen.

| Moegliche Kuration | Zeilen heute | Gleiche Uebung in beiden Knoten | Saetze in vorhandenen Workout-Daten | Befund |
|---|---:|---:|---:|---|
| `Abductors` + `Hip Abductors` | 2 + 30 | 0 | 0 | Kein aktueller Doppelzaehler; Werte sind auf zwei Namen fragmentiert. |
| `Adductors` + `Hip Adductors` | 31 + 1 | 0 | 0 | Kein aktueller Doppelzaehler; die Kindebene ist redundant. |
| `Peroneals` + `Fibularis Muscles` | 1 + 1 | 0 | 0 | Kein aktueller Doppelzaehler; echter Synonymfall mit getrennten Uebungen. |
| `Thighs` + `Upper Legs` | 1 + 1 | 0 | 0 | Kein aktueller Doppelzaehler; regionale Begriffe, kein Muskel-Merge. |

Der **eine echte heutige Konflikt** liegt daneben:

    Fibularis Muscles + Peroneus Brevis
    Bodyweight standing calf raise
    beide secondary, beide Faktor 0,50

Es gibt also eine Uebung mit zwei Zuordnungen auf Obergruppe und konkreten
Mitgliedsmuskel. In den vorhandenen `workout_sets` kommt diese Uebung noch
nicht vor (0 Saetze, 0 Sitzungen), deshalb ist keine historische Nutzersumme
falsch. Bei kuenftiger Nutzung wuerde die aktuelle, ungewichtete Rechnung
aber beide Kinder in `Lower Legs` verdichten und diesen Satz dort doppelt
fuehren. Das ist vor jeder Umhaengung einzeln zu kuratieren, nicht mit einem
pauschalen Merge zu loesen.

## A5 -- 18 Koerperflaechen ohne Muskel

| Art | Code | Name | Einordnung |
|---|---|---|---|
| muskel | `flanke` | Flanke | einzige echte Muskelflaeche ohne Link; Hinweis sagt, Obliques decken sie ab. |
| umriss | `tendinous-inscriptions` | Sehnenzwischenstuecke | kein Muskel |
| umriss | `achillessehne` | Achillessehne | Sehne, kein Muskel |
| umriss | `head` | Kopf | Umriss |
| umriss | `hair` | Haar | Umriss |
| umriss | `hands` | Haende | Umriss |
| umriss | `feet` | Fuesse | Umriss |
| umriss | `ankles` | Knoechel | Gelenk/Umriss |
| umriss | `knees` | Knie | Gelenk/Umriss |
| umriss | `kehle` | Kehle | Umrissdetail |
| wurzel | `wurzel-ruecken` | Ruecken | Hierarchiewurzel |
| wurzel | `wurzel-brust` | Brust | Hierarchiewurzel |
| wurzel | `wurzel-rumpf` | Rumpf | Hierarchiewurzel |
| wurzel | `wurzel-arme` | Arme | Hierarchiewurzel |
| wurzel | `wurzel-schultern` | Schultern | Hierarchiewurzel |
| wurzel | `wurzel-beine` | Beine | Hierarchiewurzel |
| wurzel | `wurzel-hals` | Hals | Hierarchiewurzel |
| wurzel | `wurzel-umriss` | Umriss | Hierarchiewurzel |

Damit sind 17 der 18 NULLs strukturell richtig (acht Wurzeln, neun Umrisse).
Nur `flanke` ist die offene Brueckenfrage aus G-447; die vorhandene
Begruendung verweist bewusst auf `Obliques`, ohne eine falsche Eins-zu-eins-
Zuordnung zu behaupten.

## A6 -- Vergleich gegen Anatomie: belegte Luecken

Es wurde keine Vollstaendigkeit behauptet. Der Vergleich gegen klar abgegrenzte,
autoritative Muskelgruppen ergibt diese acht heute fehlenden Namen:

| Anatomische Gruppe | Vorhanden | Fehlend | Quelle |
|---|---|---|---|
| Quadriceps | Rectus femoris, Vastus lateralis, Vastus medialis | Vastus intermedius | [NLM MeSH: Quadriceps](https://www.ncbi.nlm.nih.gov/mesh/D052097) |
| Rotator cuff | Infraspinatus, Subscapularis, Teres minor | Supraspinatus | [NCBI/StatPearls: Rotator cuff](https://www.ncbi.nlm.nih.gov/books/NBK441844/) |
| Laterales Unterschenkel-Kompartiment | Fibularis-Muskelgruppe, Peroneus brevis | Fibularis longus | [NCBI/StatPearls: Foot and Ankle](https://www.ncbi.nlm.nih.gov/books/NBK546698/) |
| Anteriores Unterschenkel-Kompartiment | Anterior tibialis | Extensor digitorum longus, Extensor hallucis longus, Fibularis tertius | [NCBI/StatPearls: Tibialis anterior](https://www.ncbi.nlm.nih.gov/books/NBK513304/) |
| Medialer Oberschenkel/Adduktoren | Adductor brevis, longus, magnus | Gracilis, Pectineus | [NCBI/StatPearls: Medial thigh](https://www.ncbi.nlm.nih.gov/books/NBK534775/) |

Alle acht fehlen sowohl als `muscle_groups.name` als auch als
`exercise_muscles`-Ziel (0 Zeilen). Das rechtfertigt noch keinen Import:
fuer jede Aufnahme fehlen die bewegungsspezifischen Zuordnungen und damit die
nach E-82 erforderliche Evidenz fuer Satzzaehlung.

## Empfehlung und Reihenfolge fuer Tom

1. **Zuerst die eine echte Konfliktzuordnung kuratieren:** `Bodyweight
   standing calf raise` auf `Fibularis Muscles` und `Peroneus Brevis`.
   Die Obergruppe/Kind-Dopplung kann kuenftig den Lower-Legs-Wert verdoppeln.
2. **Dann die drei echten Synonymfaelle entscheiden:** `Abductors`/
   `Hip Abductors`, `Adductors`/`Hip Adductors`, `Peroneals`/
   `Fibularis Muscles`. Vor jeder Aenderung Kollisionen auf
   `(exercise_id, role)` messen und die sechs referenzierenden Tabellen
   umhaengen.
3. **Regionen nicht als Muskeln mergen:** `Inner Thigh`, `Outer Thigh`,
   `Thighs`, `Upper Legs` brauchen eine Produktentscheidung zur Anzeige,
   keine anatomische Gleichsetzung.
4. **Fehlende anatomische Kinder separat kuratieren:** zuerst die vier
   kanonischen Komplettierungsfaelle `Vastus Intermedius`, `Supraspinatus`,
   `Fibularis Longus`, `Gracilis`; danach erst weitere Kinder mit Quellen
   und bewegungsspezifischer Zuordnung. Keine Namen aus der Anatomieliste
   unbesehen als belastete Uebungsmuskeln importieren.

## Grenzen und unveraenderter Stand

Dies ist ausschliesslich eine Messung. Keine Tabelle, Zuordnung, Hierarchie,
Migration oder App-Datei wurde geaendert. `git status --short -- supabase`
war am Ende leer. Die fremde, untracked Dev-Build-Ablage
`apps/web/.next-dev/` wurde weder gelesen noch veraendert; der Dev-Server
wurde nicht angefasst.

## Abnahme

**2026-09-08, Orchestrator. Ein Messauftrag, kein Bau.**

### Die Kollision, selbst nachgemessen

    Bodyweight standing calf raise
      Fibularis Muscles : secondary
      Peroneus Brevis   : secondary

`[read]` **Zwei Namen fuer denselben Muskel an derselben
Uebung** ? **die Belastung zaehlt doppelt.**

> *,,Noch keine historischen Nutzersaetze betroffen, kuenftig
aber Doppelzaehlrisiko in Lower Legs."*

### Die fehlenden Muskeln, selbst nachgemessen

    Vastus Intermedius    fehlt
    Supraspinatus         fehlt
    Fibularis Longus      fehlt
    Gracilis              fehlt
    Vastus Lateralis      da
    Vastus Medialis       da
    Infraspinatus         da
    Teres Minor           da

`[read]` **Der Quadrizeps hat vier Koepfe ? LumeOS kennt
drei.**

`[read]` **Die Rotatorenmanschette hat vier Muskeln ? LumeOS
kennt drei. Und ausgerechnet Supraspinatus fehlt, der am
haeufigsten verletzte.**

`[cmd]` **Quellen: FIPAT TA2, NCBI.**

### Die drei Kurationskandidaten

    Abductors  /  Hip Abductors
    Adductors  /  Hip Adductors
    Peroneals  /  Fibularis Muscles

> *,,Der letzte ist durch die anatomische Terminologie DIREKT
als Synonym belegt."*

### Die Zeichnung

> *,,Von 18 Koerperflaechen ohne Muskelbezug sind 17
STRUKTURELL KORREKT (Wurzeln/Umrisse); nur `flanke` bleibt als
offene Bruecke."*

`[cmd]` **Selbst gesehen: `flanke -> NULL`.**

`[read]` **G-447 war also groesser gemeldet, als er ist** ?
**17 der 18 sind keine Luecken.**

`[cmd]` **Und `supabase/` unveraendert** ? **die Auflage.**

**Abgenommen. Die Kuration liegt bei Tom.**

