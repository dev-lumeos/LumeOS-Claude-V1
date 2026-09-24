---
nr: C-517
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - backup/.gitignore
zahlen:
  gemessen: 2026-09-08
  dateien: 12475
  mb: 6121
---

# C-517 - Backups gehoeren nicht in git

## Toms Vorgabe

Tom, 2026-09-08:

> das soll eigentlich nicht der normale weg sein, denn so
> waechst ein backupordner ins unendliche. backups haben in git
> nichts zu suchen

## Gemessen

    backup/           12.475 Dateien, 6.121 MB
    davon verfolgt     610 lose Dateien
                       plus 80 Verzeichnisse

`[cmd]` **Die groessten:**

    data              2.436 MB
    c262                659 MB
    _taeglich           621 MB   (untracked)
    vollsicherung       608 MB
    kimi-research       496 MB   (10.030 Dateien)
    schema              410 MB   (teils untracked)

## Der Anlass

`[read]` **Ich habe 701 lose Dateien in einen Tagesordner
verschoben, ohne zu pruefen, welche verfolgt sind** ? **608
waren es.**

`[cmd]` **`git status` meldete 608 Loeschungen, Claude Code hat
es in G-475 gemeldet.**

`[cmd]` **`git checkout backup/` hat die 608 zurueckgeholt, die
93 untracken aus `F:\My Backups` kopiert** ? **0 geloescht.**

`[read]` **Was ich haette tun muessen:** `git ls-files backup/`
**vor dem Verschieben.**

## Die eigentliche Frage

`[read]` **Warum sind Backups ueberhaupt verfolgt?**

`[cmd]` **`backup/.gitignore` existiert** ? **MISS, was es
ausnimmt und was nicht.**

`[read]` **Untracked sind heute schon: `_taeglich`, `logs`,
Teile von `schema`** ? **jemand hat angefangen.**

## Was zu entscheiden ist

**a** ? **Alles in `backup/` ignorieren.**

`[read]` **Dann sind die Nachweise der Abnahmen nicht mehr im
Verlauf** ? **die Punktdateien tragen die Zahlen, die Bilder
waeren weg.**

**b** ? **Nur die Nachweise verfolgen, den Rest nicht.**

`[cmd]` **464 `.png` und 129 `.mjs` liegen lose** ? **die
Bildschirmfotos sind Abnahmebelege, die Messwerkzeuge
Wegwerfgut.**

**c** ? **Backups ausserhalb des Repos.**

`[cmd]` **`F:\My Backups` existiert schon** ? **dort liegt
auch `lumeos02092026`.**

`[read]` **Dann braucht `backup/` im Repo nur noch, was ein
Punkt belegt.**

## Was zu messen ist, vor der Entscheidung

    A  was nimmt backup/.gitignore heute aus?
    B  welche verfolgten Dateien belegen einen Punkt?
       (docs/punkte verweist darauf)
    C  welche sind Wegwerfgut? (x-*.png, _g*.mjs)
    D  wie gross waere backup/ nach b?

`[read]` **Punkt B ist die Arbeit** ? **ein Bild, auf das eine
Abnahme zeigt, ist ein Beleg; eines ohne Verweis ist Muell.**


