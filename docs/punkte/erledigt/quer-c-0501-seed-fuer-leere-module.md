---
nr: C-501
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: [G-451]
kind_von: C-493
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: e6577da4
beruehrt:
  tabellen: [goals.progress_photos]
zahlen:
  gemessen: 2026-09-08
---

# C-501 - Seed fuer die leeren Module

## Toms Vorgabe

Tom, 2026-09-08:

> ich will nicht hoeren, was an seeddaten fehlen ? das ist dein
> job, dass die da sind, nicht meiner

> und wenn seeddaten fehlen, dann muss man die halt erstellen
> lassen, sehe da nicht das problem

`[read]` **Er hat recht** ? **C-493 hat es vorgemacht: zehn
Sitzungen, 132 Saetze, idempotent, im Testdatenpfad.**

## Gemessen an dev@lumeos.app

    training.workout_sessions      40    voll
    nutrition.meals               733
    nutrition.meal_items        2.302
    recovery.checkins             170
    recovery.scores               170
    goals.body_measurements       181

    medical.user_medications        1    duenn
    goals.progress_photos           0    LEER

## Zu bauen

**1** ? **`goals.progress_photos`**

`[cmd]` **Die Pose-Session braucht sie** (C-494).

`[read]` **Miss, welche Spalten Pflicht sind, und ob ein Bild
im Bucket liegen muss oder ein Verweis reicht.**

`[read]` **Wenn ein Bild noetig ist: MELDEN, nicht erfinden** ?
**ein Platzhalter im privaten Bucket ist etwas anderes als ein
erfundener Messwert.**

`[cmd]` **C-463 hat die Tabelle gebaut, 13 Spalten, Bucket
privat.**

**2** ? **`medical.user_medications` und was daran haengt**

`[read]` **Ein Eintrag ist zu wenig, um die Oberflaeche zu
pruefen.**

`[cmd]` **`medical` hat 31 Tabellen** ? **miss, welche leer sind
UND eine Oberflaeche haben.**

`[read]` **Eine leere Tabelle ohne Leser braucht keinen
Seed.**

## Die Reihenfolge

`[read]` **Erst G-451 (der Testdatenlauf faellt), dann dieser
Punkt.**

`[cmd]` **`testdaten-einspielen.ts` laeuft transaktional** ?
**ein Fehler in Eintrag 3 verhindert Eintrag 24.**

`[read]` **Ein Seed, der nie durchlaeuft, nuetzt nichts.**

## Was nicht zu tun ist

**Nur `dev@lumeos.app`** ? **`tom.seed` und `test-user`
unveraendert.**

**Idempotent** ? **ein zweiter Lauf aendert nichts.**

**In den TESTDATENPFAD, nicht in die Kette** ? **C-493 hat
gezeigt, warum: der Nutzer existiert in der Kette nicht.**

**KEINEN Messwert erfinden** ? **ein Foto ohne Bild ist
moeglich, ein Koerperumfang ohne Messung nicht.**

## Abnahmebedingungen

    A1  welche medical-Tabellen sind leer UND haben
        einen Leser? TABELLE.
    A2  progress_photos: braucht es ein Bild im
        Bucket? Gemessen.
    A3  je Tabelle die Zeilenzahl vorher/nachher.
    A4  zweiter Lauf aendert nichts.
    A5  tom.seed und test-user unveraendert.
    A6  Sicherung, Vollkette, Punktelauf.

## Bericht

### Befund

`goals.progress_photos` hat 13 Spalten; Pflicht sind `user_id`,
`session_date`, `pose_type`, `pose_name` und `photo_url`. `photo_url` ist
nicht nur ein beliebiger Verweis: C-463/C-494 verwenden darin den Pfad eines
Objekts im privaten Bucket `goals-progress-photos`. Der Schreibpfad laedt
zuerst eine echte `File` hoch und schreibt danach die Zeile. Es gibt daher
absichtlich keinen C-501-Foto-Seed: eine Metazeile ohne Objekt waere eine
tote Referenz und kein echter Nachweis.

Leere, fuer `dev@lumeos.app` lesbare Medical-Pfade zum Messzeitpunkt:

| Tabelle/Pfad | Dev-Zeilen vorher | Leser |
|---|---:|---|
| `medical.appointments` | 0 | `lib/medical/dokumente-read.ts` |
| `medical.health_events` (ueber `medical.health_timeline`) | 0 | `lib/medical/dokumente-read.ts` |
| `medical.injection_logs` | 0 | `lib/medical/injektion-read.ts` |
| `medical.user_injection_site_selections` | 0 | `lib/medical/injektion-read.ts` |

`injection_site_conditions` und `injection_site_overrides` sind ebenfalls
leer, haben aber keinen eigenstaendigen UI-Leser. Sie erhalten keinen Seed.
Die vier gelesenen Fremdpfade gehoeren nicht zur Medikamentenbindung; C-501
fuellt sie daher nicht mit erfundenen Behandlungs- oder Injektionsereignissen.

### Eingespielt

`supabase/_pipeline/_testdaten/501_seed_leere_module.sql` ist ein separater
Testdatenpfad, nicht Teil der Kette. Er ersetzt ausschliesslich die drei
eindeutig markierten C-501-Zeilen von `dev@lumeos.app`:

| Tabelle | vorher | nachher |
|---|---:|---:|
| `medical.user_medications` (dev) | 1 | 4 |
| `goals.progress_photos` | 0 | 0 — bewusst, echtes privates Bild erforderlich |

Die drei UI-Szenarien sind zwei aktive Medikamente (eines mit fristgerechtem,
eines mit ueberfaelligem Monitoring) und ein abgesetzter Eintrag. Sie sind
explizit als Seed gekennzeichnet und keine Dosierungs- oder
Therapieempfehlung.

Der zweite C-501-Lauf loescht wieder nur diese drei Zeilen und schreibt
wieder drei: Zeilenzahl, Besitzer und Zustandsverteilung bleiben identisch
(3 / 0 fremd / 2 aktiv / 2 Monitoring / 1 abgesetzt). `tom.seed` und
`test-user@lumeos.local` haben weiterhin je 0 C-501-Medikamentenzeilen.
Der Datenbanktest `quer-c501-seed-leere-module.test.ts` ist gruen.

Sicherung: `backup/schema/20260915190638_g444_g451_vorher.sql`. Die frische
Vollkette `g451_c501_final` endete nach 981,6 s mit `SCHEMA VOLLSTAENDIG`;
die Punktpruefung ist gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    dev@lumeos.app        4 Medikamente (vorher 1)
    tom.seed              1, unveraendert
    test-user             0
    progress_photos       0, bewusst

`[cmd]` **Selbst gemessen.**

### progress_photos bleibt leer, mit Grund

> *,,`photo_url` muss auf ein ECHTES Objekt im privaten Bucket
`goals-progress-photos` zeigen."*

`[read]` **Genau die Auflage:** *,,wenn ein Bild noetig ist:
MELDEN, nicht erfinden."*

`[read]` **Ein Verweis ins Leere waere schlimmer als eine leere
Tabelle** ? **die Oberflaeche wuerde ein kaputtes Bild
zeigen.**

### Und die leeren Leserpfade stehen als Tabelle

`[cmd]` **Termine, Zeitachse/Health Events,
Injektionsprotokolle, konfigurierte Injektionsflaechen.**

`[read]` **Er hat gemessen, welche leeren Tabellen einen LESER
haben** ? **und die anderen nicht angefasst.**

**Abgenommen.**


