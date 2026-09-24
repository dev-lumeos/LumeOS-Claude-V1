---
nr: C-538
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-534
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 14e9933b
beruehrt:
  tabellen: [nutrition.meal_items]
zahlen:
  gemessen: 2026-09-08
---

# C-538 - das MealCam-Gedaechtnis: Bild, Ergebnis, Deklaration

## Toms Vorgabe

Tom, 2026-09-08:

> ein scan, 31 resultate, user deklariert ? also haben wir
> ein bild/visionresult/user deklaration als memory, und NICHT
> "user hat gestern das gewaehlt, also ist es heute dasselbe"

> anfangsphase sicher mit bild, das sind unsere teachingdaten

> die mealcam wird schon deterministisch gebaut werden ueber
> mehrere layers, darauf gehen wir spaeter tiefer ein. es
> reicht nicht, irgend ein visionmodell zu fragen

> unscharf, denn am ende ist es dasselbe

## Was der Orchestrator falsch vorschlug

`[read]` **Ich hatte eine Rangliste vorgeschlagen, deren erste
Stufe war:** *,,was DIESER Nutzer in dieser Gruppe zuletzt
gewaehlt hat"*.

Tom: *,,wer sagt, dass der user jeden tag dieselbe art
huehnerbrust isst? das ist bloedsinn."*

`[read]` **Der Schluessel ist das BILD, nicht der Nutzer** ?
**dasselbe Bild bekommt dieselbe Deklaration, egal wer
fotografiert.**

## Zu bauen: der Speicher

    Bild            die Aufnahme -- Lehrdaten der Anfangsphase
    Visionsergebnis was die Erkennung sagt
    Deklaration     was der Nutzer daraus gemacht hat
                    (welcher Katalogeintrag, welche Portion)

`[read]` **Drei Spalten, ein Zweck: aus einer Korrektur lernen,
statt aus einer Gewohnheit zu raten.**

### Die Zuordnung ist UNSCHARF

Tom: *,,unscharf, denn am ende ist es dasselbe"*

`[read]` **`Haehnchenbrust gegrillt` und `gegrillte Huehnerbrust`
meinen dasselbe.**

`[cmd]` **`pg_trgm` steht seit C-495 und traegt die
Produktsuche** ? **dieselbe Bauform, gemessen an Beispielen.**

## Was NICHT Teil dieses Punktes ist

Tom: *,,die mealcam wird schon deterministisch gebaut werden
ueber mehrere layers, darauf gehen wir spaeter tiefer ein"*

`[read]` **Die Erkennung selbst ist offen** ? **hier entsteht
nur der Speicher, den jede spaetere Bauform braucht.**

`[read]` **Kein Auswerten, kein Vorschlagen, kein Lernen** ?
**erst sammeln.**

## Das Bild ist personenbezogen

`[cmd]` **`goals.progress_photos` gibt es schon** ? **MISS, wie
es dort geloest ist: Bucket, RLS, Loeschung.**

`[read]` **Ein Mahlzeitenbild zeigt mehr als Essen** ? **Tisch,
Haende, Umgebung.**

`[cmd]` **Und C-498 hat die Bauform fuer Freigaben: eine eigene
Zustimmung mit Protokoll.**

## Abnahmebedingungen

    A1  eine Relation mit Bild, Visionsergebnis und
        Deklaration. Bauform begruendet.
    A2  die unscharfe Zuordnung: zwei Schreibweisen
        desselben Gerichts treffen einander. Belegt.
    A3  RLS: nur der eigene Nutzer, anon nichts.
    A4  wie ist progress_photos geloest? Gemessen und
        uebernommen oder begruendet abgewichen.
    A5  KEIN Auswerten, kein Vorschlagen.
    A6  Gegenprobe: zwei verschiedene Gerichte treffen
        einander NICHT.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht

`[done]` **Nicht live eingespielt.** Die Migration liegt unter
`supabase/migrations/20260924090000_c538_mealcam_memory.sql` vor.

`[done]` **Speicher:** `nutrition.mealcam_scans` bewahrt pro Scan
den privaten Bildpfad, den SHA-256-Bildschluessel, das rohe
Visionsergebnis sowie `food_id`, Namens-Snapshot und Portion. Der
Hash ist nur der Bildschluessel fuer eine spaetere deterministische
Schicht; C-538 leitet daraus weder eine fremde Deklaration ab noch
wertet oder empfiehlt etwas.

`[done]` **Datenschutz:** Eigener privater Bucket
`nutrition-mealcam-images`, dieselbe Eigentümer-RLS wie bei
`goals.progress_photos`: Pfad beginnt mit `auth.uid()`, Metadaten
und Objekt sind nur für den Eigentümer lesbar/schreibbar, anon hat
keine Rechte. Wie bei Progress-Fotos löscht das Entfernen der
Metadaten das Storage-Objekt nicht implizit; beide Löschungen müssen
explizit erfolgen.

`[done]` **Unschärfe:** Die vorhandene immutable
`nutrition.search_fold` mit `pg_trgm` liefert für
`Haehnchenbrust gegrillt` gegen `gegrillte Huehnerbrust` eine
Ähnlichkeit von `0,424242` (Testschwelle `0,40`); `Vollmilch
frisch` liegt bei `0`. Die Funktion vergleicht ausschließlich die
Deklaration dieses einen Scans, nicht Nutzerhistorien oder den
Katalog.

`[done]` **Nachweise:** C-538-Probe grün; Eigentümer sieht genau
seinen Scan und sein Objekt, ein zweiter Nutzer weder das eine noch
das andere. Vollkette `266` Schritte grün (`36/36` Tabellen,
`52/52` Funktionen, `36/36` RLS, `40/40` Rechte). `pnpm gate` ist
grün (`18/18`). Sicherung:
`backup/schema/20260924015431_c43_vor_kettenlauf.sql`.

`[done]` **Waechter:** Die leere private Bucket-Deklaration gilt
als strukturelle Migration, nicht als Katalogdaten. Der
Migrations-Wächter erlaubt genau diese eine Anweisung; eine weitere
oder beliebige Storage-`INSERT`-Anweisung bleibt rot (Probe grün).

## Abnahme

**2026-09-08, Orchestrator. Vorbereitet ? NICHT live.**

`[cmd]` **Keine MealCam-Tabelle in der laufenden Datenbank.**

`[cmd]` **Vorliegend:**
`migrations/20260924090000_c538_mealcam_memory.sql`,
`_validierung/nutrition-c538-mealcam-memory.test.ts`.

### Gebaut wie verlangt

`[cmd]` **Bildpfad, SHA-256, rohes Visionsergebnis,
deklarierter Katalogeintrag, Portion.**

`[cmd]` **Datenschutz nach `progress_photos`: eigener privater
Bucket, Eigentuemer-RLS, `anon` ohne Rechte.**

> *,,Metadaten und Storage-Objekt muessen getrennt geloescht
werden."*

`[read]` **Das ist gemeldet, nicht versteckt** ? **wer ein Bild
loescht, muss zwei Sachen loeschen.**

### Und A5 eingehalten

> *,,Der Bildhash ist gespeichert, aber es gibt bewusst noch
keinen nutzeruebergreifenden Abruf daraus."*

`[read]` **Kein Auswerten, kein Vorschlagen** ? **die Auflage.**

### Aber A6 war zu leicht

`[cmd]` **Selbst gemessen:**

    Haehnchenbrust gegrillt / gegrillte Huehnerbrust  0,4242
    Haehnchenbrust gegrillt / Putenbrust gegrillt     0,5172
    Haehnchenbrust gegrillt / Vollmilch frisch        0,0000
    Schwelle 0,3

`[read]` **PUTENBRUST ist aehnlicher als Huehnerbrust.**

`[cmd]` **Seine Gegenprobe war `Vollmilch frisch`** ? **die
trifft nie. Die harte Probe ist Pute gegen Huhn.**

`[cmd]` **Und C-534 hat gemessen: die Haehnchenbrust-Kategorie
enthaelt 18 Haehnchen-, 14 Puten- und 3 Entenbrustzeilen** ?
**genau die Verwechslung, die hier droht.**

`[read]` **Fuer diesen Punkt folgenlos: er speichert nur.**
**Fuer die spaetere Zuordnung nicht** ? **als C-539.**

**Abgenommen. Einspielen steht aus.**


