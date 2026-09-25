---
nr: C-517
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-24
beruehrt:
  dateien:
    - .gitignore
    - backup/.gitignore
zahlen:
  gemessen: 2026-09-24
  backup_dateien_vorher: 12503
  backup_mb_vorher: 7782
  backup_dateien_nachher: 12313
  backup_mb_nachher: 5730.83
  verfolgt_vorher: 1081
  verfolgt_nachher: 943
---

# C-517 - Backups gehoeren nicht in git

## Toms Vorgabe

Tom, 2026-09-08:

> das soll eigentlich nicht der normale weg sein, denn so
> waechst ein backupordner ins unendliche. backups haben in git
> nichts zu suchen

## Urspruenglich gemessen

    backup/           12.475 Dateien, 6.121 MB
    davon verfolgt       610 lose Dateien
                         plus 80 Verzeichnisse

`[cmd]` **Die groessten waren:**

    data              2.436 MB
    c262                659 MB
    _taeglich           621 MB   (untracked)
    vollsicherung       608 MB
    kimi-research       496 MB   (10.030 Dateien)
    schema              410 MB   (teils untracked)

## Der Anlass

`[read]` **701 lose Dateien wurden in einen Tagesordner
verschoben, ohne vorher zu pruefen, welche verfolgt waren; 608
davon waren verfolgt.**

`[cmd]` **`git status` meldete 608 Loeschungen, Claude Code
meldete sie in G-475.**

`[cmd]` **`git checkout backup/` holte die 608 zurueck, die
93 unverfolgten kamen aus `F:\My Backups` zurueck: null
Dateien gingen verloren.**

`[read]` **Vor jeder Bewegung in `backup/` muss
`git ls-files backup/` laufen.**

## Die eigentliche Frage

`[read]` **Warum sind Backups ueberhaupt verfolgt?**

`backup/.gitignore` nahm bereits Datenabzuege, taegliche
Laeufe, Logs und einzelne Sicherungsmuster aus. Die Regeln waren
aber lueckenhaft und entfernten bereits verfolgte Dateien nicht
aus dem Index.

## Was zu entscheiden war

### a - alles in `backup/` ignorieren

Das ist falsch. Abnahmebelege und Datenquellen liegen historisch
unter `backup/` und muessen sichtbar bleiben.

### b - nur Nachweise verfolgen, den Rest nicht

Das ist fuer den aktuellen Baum richtig. Bilder, kleine
Messausgaben und reproduzierbare Quellen duerfen verfolgt
bleiben. Wegwerfwerkzeuge und Datenbanksicherungen nicht.

### c - Backups ausserhalb des Repos

Das ist fuer Sicherungen und abgenommene Messwerkzeuge richtig.
Ihr Ziel ist `F:\My Backups`.

## Bericht, 2026-09-24, Codex

### Vier Quellen

- **Code und Index:** `.gitignore`, `backup/.gitignore`,
  `git ls-files`, die Backup-Waechter und der vorgeschriebene
  Dateinamen-Scan wurden gelesen und gemessen.
- **Daten:** Der physische Bestand, der Git-Index sowie Quell-
  und Zielgroessen auf `D:` und `F:` wurden vor und nach
  jeder Bewegung gezaehlt.
- **Spec und Mockup:** Fuer Repo-Hygiene gibt es kein
  Produktmockup. Die geltende Spezifikation steht in
  `docs/lehren/werkzeuge.md`, `docs/lehren/daten.md` und
  A-70. Insbesondere sind `backup/kimi-research/` und
  `backup/legacy-v2/` Datenquellen und keine raeumbaren
  Sicherungen.
- **Vorgaengerrepo:** `referenz/lumeos-2026/` wurde
  gegengeprueft. Es bestimmt keine aktuelle Git- oder
  Backup-Regel. Das aktuelle `backup/legacy-v2/` darf trotzdem
  nicht verschoben werden, weil die heutige Pipeline daraus
  liest.

### Der ueberholte Befund

Die alten Zahlen stimmen nicht mehr.

| Stand | Dateien in `backup/` | physisch | von Git verfolgt |
|---|---:|---:|---:|
| Punkt vom 2026-09-08 | 12.475 | 6.121 MB | 610 |
| Beginn C-517 am 2026-09-24 | 12.503 | 7.782,00 MB | 1.081 / 180,89 MB |
| Abschluss C-517 | 12.313 | 5.730,83 MB | 943 / 172,49 MB |

Die physische Groesse war vor dieser Bereinigung sogar groesser
als im alten Befund. Die Zahl verfolgter Dateien war ebenfalls
gestiegen, aber sie zaehlte Abnahmebilder und Quellen als
"Backups" mit.

### Was schon vor diesem Auftrag erledigt war

- 143 Schema-Sicherungen lagen bereits unter
  `F:\My Backups\lumeos-schema-sicherungen`.
- 252 Messwerkzeuge lagen bereits unter
  `F:\My Backups\lumeos-messwerkzeuge`.
- 46 beziehungsweise 208 zuvor verfolgte Dateien waren schon
  aus dem Index entfernt.
- `backup/schema/*.sql` und die Ein-Unterstrich-Werkzeuge
  waren bereits ignoriert.

### Sicherheitspruefung vor jeder Bewegung

Vor jedem Umzug lief:

    git grep -oh "_[gce][0-9a-z-]*\.mjs" -- apps/ supabase/ tools/

Nach der Bereinigung nennt der Scan 35 eindeutige Dateinamen:

- 34 existieren und sind verfolgt.
- `_g411-abmelden.mjs` existierte bereits vor C-517 nicht,
  liegt nicht auf dem Backuplaufwerk und kommt in keiner
  Git-Historie vor. Die einzige Nennung ist ein Kommentar in
  `apps/web/src/lib/__tests__/abmelden.test.ts`; C-517 hat
  diese Datei nicht entfernt.
- `_g479-kontrast.mjs` und `_g498-kontrast.mjs` waren
  vorhanden, aber ignoriert und unverfolgt. Beide wurden mit
  `git add -f` als Waechterbelege aufgenommen.
- `_g155-bestand.mjs`, `_kimi-bestand.py` und
  `_modul-bestand.py` werden nicht vom Scan genannt, gehoeren
  aber noch offenen Punkten und bleiben ebenfalls verfolgt.

### In diesem Auftrag verschoben

Nach `F:\My Backups\lumeos-schema-sicherungen`:

- 53 Dateien aus `backup/schema/`, zusammen
  2.141.994.826 Byte;
- acht alte Schema-/Vorher-Abzuege ausserhalb dieses Ordners,
  zusammen 8.518.250 Byte.

Damit liegen dort jetzt 204 Dateien mit 2.222,48 MB. Jeder
Zielpfad wurde vor dem Verschieben auf Kollisionen geprueft und
danach mit Quellabwesenheit, Zielanwesenheit und Bytezahl
verifiziert.

Nach `F:\My Backups\lumeos-messwerkzeuge`:

- 22 verfolgte Werkzeuge aus den abgenommenen Punkten G-489 bis
  G-496, die kein verbleibender Waechter nennt;
- 129 alte Messwerkzeuge direkt unter `backup/`.

Damit liegen dort jetzt 403 Dateien mit 1,18 MB. In diesem
Auftrag kamen 151 Werkzeuge beziehungsweise 382.581 Byte hinzu.

Aus dem Git-Index gingen damit 138 historische
`backup/`-Dateien und 22 `tools/_*`-Dateien. Nichts wurde
geloescht; alles liegt auf dem Backuplaufwerk und ist
wiederherstellbar.

### Die korrigierten Ignore-Regeln

`.gitignore` ignoriert jetzt auch alte Namensformen:

    backup/**/*_schema_only.sql
    backup/**/*_vor_*.sql
    backup/**/*_vor-*.sql
    backup/**/*-vor-*.sql

`backup/.gitignore` erfasst nun auch die alten Messwerkzeuge
ohne fuehrenden Unterstrich:

    g*.mjs
    c*.mjs

Die bisherige Regel `tools/_*` hatte unbeabsichtigt auch den
Ordner `tools/__tests__/` getroffen. Sie lautet nun:

    tools/_[!_]*

Gegenprobe:

    tools/_g517.mjs          ignoriert
    tools/_probe.py          ignoriert
    tools/__tests__/probe.mjs sichtbar

### Was in Git bleibt

Kein aktuell verfolgter `backup/`-Pfad trifft mehr eine
Backup-Ignore-Regel. Die 943 verbleibenden Dateien sind
Nachweise oder Quellen, keine erkannte Datenbanksicherung:

- 638 PNG-Abnahmebilder, 156,73 MB;
- 65 JSON-Nachweise, 9,73 MB;
- 94 kleine Messausgaben, 3,07 MB;
- `backup/legacy-v2/` und `backup/kimi-research/` als
  ausdruecklich geschuetzte Pipelinequellen;
- kleine Mess-, Rescue- und stillgelegte Migrationsskripte.

Der alte Befund "610 verfolgte Backups" vermischte damit
Sicherungen, Nachweise und Quellen. Sicherungen sind nun aus
dem aktuellen Index entfernt; Nachweise und Quellen bleiben.

### Entscheidung

Variante **b plus c** gilt:

1. Git verfolgt Nachweise und notwendige Quellen.
2. Datenbanksicherungen und abgenommene Messwerkzeuge liegen
   ausserhalb des Repos auf `F:\My Backups`.
3. Vor jedem Werkzeugumzug laeuft der Dateinamen-Scan.
4. Was ein Waechter nennt oder ein offener Punkt noch braucht,
   bleibt mit `git add -f` verfolgt.
5. Eine Sicherung ist nach der Abnahme Geschichte.

`apps/` und der Dev-Server wurden nicht angefasst. Es wurde
nicht committed.

## Abnahme

_(vom Orchestrator)_

