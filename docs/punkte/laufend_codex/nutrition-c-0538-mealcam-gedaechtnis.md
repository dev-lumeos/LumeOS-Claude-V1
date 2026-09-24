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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

