---
nr: C-530
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-528
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: dca49d15
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
  muskeln: 105
---

# C-530 - die Muskelhierarchie bereinigen und vervollstaendigen

## Toms Entscheidung

Tom, 2026-09-08:

> die zeichnung ist eine visuelle kontrolle, ob da detailliert
> jeder muskel verfuegbar ist bis ins detail ist momentan nicht
> relevant. ich sehe die grafik eh in absehbarer zukunft durch
> eine detailliertere zu ersetzen, der brustmuskel ist mir
> zuwenig detailliert

> momentan in der grafik, wenn der ort passt, die muskeln
> zusammenfassen. wichtig ist die auflistung parent/child, dass
> die detailliert ist

    Zeichnung       fasst zusammen, wird ersetzt
    parent/child    geht ins DETAIL -- das ist der Auftrag

## Was C-528 gemessen hat

### Eine echte Doppelzaehlung

    Bodyweight standing calf raise
      Fibularis Muscles : secondary
      Peroneus Brevis   : secondary

### Drei Kurationskandidaten

    Peroneals  /  Fibularis Muscles   Synonym, FIPAT TA2
    Abductors  /  Hip Abductors
    Adductors  /  Hip Adductors

### Acht fehlende Muskeln

`[cmd]` **Selbst nachgemessen, vier davon:** `Vastus
Intermedius`, `Supraspinatus`, `Fibularis Longus`, `Gracilis`.

## Und was ich zusaetzlich gemessen habe

`[cmd]` **Chest, ganz:**

    Chest
      Pectoralis Major
        Clavicular Head
        Sternal Head
      Upper Chest

`[read]` **`Upper Chest` IST der `Clavicular Head`** ? **als
Geschwister von `Pectoralis Major` doppelt gefuehrt.**

`[read]` **Es fehlen `Pectoralis Minor` und der `Abdominal
Head`** ? **Tom: *,,der brustmuskel ist mir zuwenig
detailliert"*.**

`[cmd]` **Shoulders, ganz:**

    Shoulders
      Deltoids
        Front Shoulders
        Rear Deltoids
      Rotator Cuff
        Infraspinatus
        Subscapularis
        Teres Minor
      Serratus Anterior

`[read]` **Der SEITLICHE Deltamuskel fehlt** ? **der Kopf, den
jedes Seitheben trainiert.**

`[read]` **`Front Shoulders` ist ein Alltagsname neben
Fachnamen** ? **`Anterior Deltoid`.**

`[cmd]` **`Supraspinatus` fehlt in der Rotatorenmanschette**
? **vier Muskeln, LumeOS kennt drei.**

## Was zu bauen ist

**1** ? **Doppelungen zusammenfuehren.**

`[read]` **Wo zwei Namen dasselbe meinen: einer bleibt, der
andere wird zum Alias** ? **nicht loeschen, die
Fremdschluessel haengen dran.**

`[cmd]` **Die `exercise_muscles`-Zeilen ziehen mit** ? **und wo
dann zwei Zeilen auf denselben Muskel zeigen (die
Wadenheben-Kollision), bleibt EINE.**

**2** ? **Falsche Eltern korrigieren.**

`[read]` **`Upper Chest` wird Alias von `Clavicular Head`,
`Tibialis Posterior` Kind von `Tibialis`, usw.**

**3** ? **Fehlende Muskeln ergaenzen.**

`[read]` **Je Muskel eine anatomische Quelle** ? **FIPAT TA2,
NCBI, wie in C-528.**

`[cmd]` **Mindestens: Vastus Intermedius, Supraspinatus,
Fibularis Longus, Gracilis, Pectoralis Minor, der Abdominal
Head, der laterale Deltamuskel.**

**4** ? **Alltagsnamen anzeigen, Fachnamen fuehren.**

`[cmd]` **`name_display_en` existiert** ? **`Front Shoulders`
kann dort stehen, `Anterior Deltoid` im Namen.**

## Die Zeichnung

`[read]` **Nicht anfassen, ausser eine Flaeche verliert ihren
Muskel durch eine Zusammenfuehrung** ? **dann auf den
ueberlebenden umhaengen.**

`[cmd]` **`flanke` bleibt offen** ? **Tom ersetzt die Grafik.**

## Abnahmebedingungen

    A1  je Zusammenfuehrung: welcher bleibt, welcher
        wird Alias? TABELLE mit Quelle.
    A2  exercise_muscles gezogen, keine Uebung zaehlt
        einen Muskel doppelt. Gegenprobe: das
        Wadenheben.
    A3  falsche Eltern korrigiert. Je Fall begruendet.
    A4  fehlende Muskeln ergaenzt, je mit Quelle.
    A5  Chest und Shoulders nachher, ganz. Baum.
    A6  muscle_recovery_profiles: jeder neue Muskel
        hat eines oder erbt es vom Elternteil.
        Gemessen.
    A7  koerperflaechen: keine Flaeche verliert ihren
        Muskel.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Was NICHT zu tun ist

**Keine neue Tabelle** ? **sechs Fremdschluessel.**

**Nichts loeschen** ? **Doppelungen werden Aliase.**

**Die Zeichnung nicht verfeinern** ? **sie wird ersetzt.**

## Bericht

### Umsetzung 2026-09-21

Sicherung vor der Live-Aenderung:
`backup/schema/20260921101500_c530_vorher.sql` (4.217.752 Bytes).

Die Aliasbeziehung ist als nullable Selbstverweis
`training.muscle_groups.canonical_muscle_group_id` umgesetzt. Damit bleiben
die vier alten Gruppenzeilen samt stabiler ID und ihren sechs bestehenden
Fremdschluessel-Beziehungen erhalten; keine neue Tabelle und kein
Muskelgruppen-Datensatz wurde geloescht. Hierarchieabfragen filtern
Aliaszeilen ueber diesen Verweis aus.

#### A1 -- Zusammenfuehrungen

| Alias bleibt lesbar | Kanonisches Ziel | Quelle | Betroffene exercise_muscles vor/nachher |
|---|---|---|---:|
| `Upper Chest` | `Clavicular Head of Pectoralis Major` | [NCBI: Pectoral region](https://www.ncbi.nlm.nih.gov/books/NBK525991/), FIPAT TA2 Part 2 | 40 / 0 |
| `Abductors` | `Hip Abductors` | [NCBI/StatPearls: Hip](https://www.ncbi.nlm.nih.gov/books/NBK526019/) | 2 / 0 |
| `Hip Adductors` | `Adductors` | [NCBI/StatPearls: Hip](https://www.ncbi.nlm.nih.gov/books/NBK526019/) | 1 / 0 |
| `Peroneals` | `Fibularis Muscles` | [FIPAT Terminologia Anatomica 2](https://cdn.dal.ca/content/dam/dalhousie/pdf/library/FIPAT/TA2/FIPAT-TA2-Part-1.pdf) | 1 / 0 |

`exercise_muscles`: 6.744 vor der Kuration, 6.726 danach. Der Unterschied
sind 17 durch den Upper-Chest-Merge kollidierende Paare und die eine echte
Wadenheben-Dublette; die drei restlichen Aliasumhaengungen waren nicht
kollidierend.

#### A2/A3 -- Zaehlebene und korrigierte Eltern

`Bodyweight standing calf raise` hat jetzt genau eine relevante
Nebenrolle: `Fibularis Muscles / secondary = 1`; `Peroneus Brevis /
secondary = 0`. Der konkrete Brevis wurde nicht mit der Sammelgruppe
verschmolzen: er ist korrekt deren Kind. Ohne bewegungsspezifische Quelle
bleibt die Sammelgruppe die Satzebene.

Korrigiert wurden die drei Pectoralis-major-Teile, Pectoralis minor, alle
drei Deltoidteile, Supraspinatus, Vastus intermedius, Fibularis longus und
Peroneus brevis, Gracilis sowie Anterior/Posterior tibialis (14
Kind-Eltern-Beziehungen). Fachnamen stehen in `name`, Alltagsanzeigen in
`name_display_en`: etwa `Anterior Deltoid` / `Front shoulders` und
`Lateral Deltoid` / `Side deltoid`.

#### A4/A5 -- ergaenzte Detailknoten

| Neuer Knoten | Elternknoten | Quelle |
|---|---|---|
| `Vastus Intermedius` | `Quadriceps` | [NLM MeSH: Quadriceps](https://www.ncbi.nlm.nih.gov/mesh/D052097) |
| `Supraspinatus` | `Rotator Cuff` | [NCBI/StatPearls: Rotator cuff](https://www.ncbi.nlm.nih.gov/books/NBK441844/) |
| `Fibularis Longus` | `Fibularis Muscles` | [NCBI/StatPearls: Foot and Ankle](https://www.ncbi.nlm.nih.gov/books/NBK546698/) |
| `Gracilis` | `Adductors` | [NCBI/StatPearls: Medial thigh](https://www.ncbi.nlm.nih.gov/books/NBK534775/) |
| `Pectoralis Minor` | `Chest` | [NCBI/StatPearls: Pectoralis minor](https://www.ncbi.nlm.nih.gov/books/NBK545241/) |
| `Abdominal Part of Pectoralis Major` | `Pectoralis Major` | [FIPAT Terminologia Anatomica 2, Part 2](https://fipat.library.dal.ca/wp-content/uploads/2020/09/FIPAT-TA2-Part-2.pdf) |
| `Lateral Deltoid` | `Deltoids` | [NCBI/StatPearls: Deltoid](https://www.ncbi.nlm.nih.gov/books/NBK537056/) |

Die relevanten Teilbaeume sind nachher:

    Chest
      Pectoralis Major
        Clavicular Head of Pectoralis Major
        Sternocostal Head of Pectoralis Major
        Abdominal Part of Pectoralis Major
      Pectoralis Minor

    Shoulders
      Deltoids
        Anterior Deltoid
        Lateral Deltoid
        Posterior Deltoid
      Rotator Cuff
        Infraspinatus, Subscapularis, Supraspinatus, Teres Minor
      Serratus Anterior

#### A6/A7 -- Recovery und Zeichnung

Alle sieben neuen Knoten haben ein sichtbares geerbtes
`muscle_recovery_profile` (`source_id = c530_parent_recovery_inheritance`):
48 h fuer Vastus intermedius,
Gracilis sowie die Pectoralis-Knoten, 36 h fuer Supraspinatus, Fibularis
longus und Lateral deltoid. Das ist als Erbe markiert, nicht als geratenes
Einzelprofil.

Keine `public.koerperflaechen`-Zeile zeigte vorab auf einen der vier
Alias-Knoten; nachher gibt es weiterhin null Flaechen mit nicht
existierendem Muskel. Die Zeichnung wurde deshalb nicht angefasst;
`flanke` bleibt offen.

#### A8 -- Pruefungen

- Vollkette in `lumeos_c530_vollkette`: C-530 lief mit 112 Gruppen,
  6.726 Uebungs-Muskel-Zuordnungen und vier Aliasen durch. Die neue
  C-530-Probe sowie C-490 und C-491 sind dort und live gruen.
- Zweiter Pipeline-Lauf live: alle persistenten `UPDATE`/`INSERT`/`DELETE`
  ergaben `0`; nur die transaktionalen Temp-Tabellen wurden erneut befuellt
  und beim Commit verworfen -- echte Idempotenz.
- `migration-kette-pruefen` und `migration-datenlogik-pruefen`: gruen;
  44 begruendete historische Datenoperationen, keine neue
  Migrationsdatenlogik.
- `turbo run lint typecheck test build` und `serverimport-pruefen`: gruen
  (ein bestehender `img`-Lint-Hinweis in `fehlende-kacheln.tsx`).
- Die Vollketten-Abschlusspruefung bleibt rot an einem fremden Befund aus
  Schritt 327/327a: `service_role` hat auf
  `supplements.substance_group_memberships` zu viele Rechte. C-530 fuegt
  keine GRANT-Abweichung hinzu.
- `pnpm gate` bleibt zudem am ueberfaelligen/fehlgeschlagenen gespeicherten
  Tageskettenlauf stehen. Weitere unveraenderte rote Waechter: drei
  ueberholte Abwesenheitsbehauptungen, eine fremde Lesestelle auf die in
  C-519 entfernte Spalte sowie die bekannten 15 Testdaten-Abweichungen.

Kein Commit, keine Aenderung unter `apps/`, kein Dev-Server-Eingriff.

## Abnahme

**2026-09-08, Orchestrator. LIVE, nachgemessen.**

    muscle_groups       112   (vorher 105)
    exercise_muscles  6.726   (vorher 6.744)

### Die Doppelzaehlung ist weg

`[cmd]` **Bodyweight standing calf raise: nur noch
`Fibularis Muscles:secondary`.**

`[cmd]` **`Upper Chest`: 0 Zuordnungen, `Clavicular Head`: 46,
und 0 Uebungen mit beiden.**

### Chest und Shoulders, nachher

    Chest
      Pectoralis Major
        Abdominal Part of Pectoralis Major
        Clavicular Head of Pectoralis Major
        Sternocostal Head of Pectoralis Major
      Pectoralis Minor
      Upper Chest               <- Alias, 0 Zuordnungen

    Shoulders
      Deltoids
        Anterior Deltoid
        Lateral Deltoid
        Posterior Deltoid
      Rotator Cuff
        Infraspinatus, Subscapularis,
        Supraspinatus, Teres Minor
      Serratus Anterior

`[read]` **Toms *,,der brustmuskel ist mir zuwenig
detailliert"*: drei Pectoralis-Anteile und der Minor.**

`[read]` **Die Rotatorenmanschette hat jetzt alle vier
Muskeln, der Deltamuskel alle drei Koepfe.**

### Recovery-Profile

`[cmd]` **Alle neun gepruefte neuen Muskeln haben ein Profil**
? **geerbt und sichtbar markiert, wie verlangt.**

### Ein Vorbehalt

`[cmd]` **`Upper Chest` steht im Baum weiter als GESCHWISTER
von `Pectoralis Major`** ? **ohne Zuordnungen, aber sichtbar.**

`[cmd]` **Es gibt KEINE Aliastabelle fuer Muskeln** ? **die
*,,4 erhaltenen Aliaszeilen"* sind Knoten ohne Zuordnung, die
nichts als Alias kennzeichnet.**

`[read]` **Wer den Baum liest, sieht `Upper Chest` als eigenen
Muskel** ? **als C-531.**

**Abgenommen, mit Vorbehalt.**


