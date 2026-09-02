---
nr: A-70
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-216
entscheidung: null
erledigt: 2026-09-02
commit: OFFEN
beruehrt:
  dateien:
    - tools/backup-manifest.mjs
zahlen:
  gemessen: 2026-09-02
  dateien: 11633
  groesse_gib: 5.97
---

# A-70 — ein Backupsystem statt eines wachsenden Ordners

## Befund

Tom, 2026-09-02: *,,dann ein sauberes backupsystem anlegen das sinn
macht und nicht ein wachsendes verzeichnis mit jedem alten muell
drin."*

`[cmd]` **Gemessen: 11.633 Dateien, 5,97 GiB.**

    vollsicherung     57 Dateien   3.932 MiB   66 %
    c262              53             659 MiB
    kimi-research  10.030             496 MiB
    schema           276             212 MiB
    c255              31             153 MiB
    (direkt)         573             126 MiB
    uebrige c-Ordner                 rund 250 MiB

## Zwei verschiedene Probleme

### 1 · Die Vollsicherungen wachsen ohne Ende

`[cmd]` **57 Stueck, jede vor einem Punkt angelegt:**

    20260823_154329_c243_vor_live_lumeos_voll.sql   132,5 MiB
    20260823_161228_c245_vor_live_lumeos_voll.sql   132,5 MiB
    20260823_161554_c246_vor_live_lumeos_voll.sql   132,5 MiB
    20260823_165204_c248_vor_live_lumeos_voll.sql   132,5 MiB
    20260823_183129_c250_voll.sql                   132,5 MiB
    20260823_183442_c250_voll.sql                   132,5 MiB
    20260823_183458_c250_voll.sql                   132,5 MiB

`[cmd]` **Dreimal `c250` innerhalb von drei Minuten.**

`[read]` **Die Regel *,,vor strukturellen Aenderungen Sicherung nach
`backup/`"* hat funktioniert** — **aber niemand hat je eine
zurueckgespielt.**

`[read]` **Und sie liegen auf derselben Platte wie das Original** —
**gegen einen Plattenausfall schuetzen sie nicht.**

### 2 · `kimi-research` liegt doppelt

    backup/kimi-research   10.030 Dateien   496,4 MiB
    docs/kimi_research      8.506 Dateien   653,8 MiB

`[read]` **Nicht identisch** — **die Zahlen unterscheiden sich, es
ist kein sauberes Duplikat.**

`[cmd]` **Die Notizen nennen `backup/kimi-research/` als obsoleten
Pfad**, `docs/kimi_research/` als gueltigen.

`[read]` **Zu messen, was in der einen Fassung steht und in der
anderen nicht.**

## Was ein System koennen muesste

`[read]` **Drei Fragen, die der heutige Ordner nicht beantwortet:**

    Wie lange bleibt was?     heute: fuer immer
    Was ist eine Sicherung,   heute: alles im selben Ordner
      was ein Arbeitsstand?
    Wovor schuetzt es?        heute: gegen nichts ausserhalb
                              der Platte

`[read]` **Vorschlag zur Diskussion, nicht als Entscheidung:**

    vollsicherung/   die letzten drei, plus eine je Monat
                     aelter: geloescht, Manifest behaelt den Eintrag
    arbeitsstaende/  je Punkt, faellt mit dem Punkt weg
    nachweise/       Bildschirmfotos und Proben, faellt mit der
                     Abnahme weg
    _manifests/      bleibt immer -- es ist das Gedaechtnis

`[cmd]` **Das Manifest steht seit C-216** —
`tools/backup-manifest.mjs`, 11.629 Dateien inventarisiert.

`[read]` **Damit ist Loeschen erstmals verantwortbar:** **was
verschwindet, bleibt im Manifest nachweisbar.**

## Der Fund, der den Plan geaendert hat

`[cmd]` **Gemessen 2026-09-02: sechs Kettenschritte und Produktcode
lesen aus `backup/`:**

    132_substance_alias_bridge.ts    backup/kimi-research/
    133_kimi_rules.ts                backup/kimi-research/
    134_substance_catalog.ts         backup/kimi-research/
    142_kimi_wave1_pharmacology.ts   backup/kimi-research/
    146_medications_katalog.ts       backup/kimi-research/
    101_training_seed.sql            backup/legacy-v2/training/
    080_public_bereinigen.sql        backup/schema/
    apps/web/.../evidenz/registry.ts backup/kimi-research/

`[read]` **Das sind keine Sicherungen, das sind Datenquellen.**

`[read]` **Ein Probelauf haette 3,43 GiB nach `_temp` verschoben** —
**darunter `kimi-research` und `legacy-v2`.** `[read]` **Der naechste
Kettenlauf waere gescheitert.**

`[cmd]` **Und `referenz/lumeos-2026/` existiert mit 91.290
Dateien** — **das Vorgaengerrepo liegt bereits richtig, `legacy-v2`
ist etwas anderes.**

## Was angelegt wurde

`[cmd]` **`backup/00-LIESMICH.md`** — die Regeln, mit den Quellen
zuerst.
`[cmd]` **`backup/quellen-NICHT-RAEUMEN.md`** — die sieben
Fundstellen.
`[cmd]` **`_temp/` mit eigener Liesmich:** *,,Kein Agent loescht.
Kein Orchestrator loescht. Tom entsorgt."*
`[cmd]` **Und die Ordner `vollsicherung/`, `arbeitsstaende/`,
`nachweise/`, `_manifests/`.**

`[read]` **Nichts wurde verschoben** — **die Regeln stehen, der
Umzug ist ein eigener Auftrag.**

## Was zuerst zu klaeren ist

`[read]` **A-39 sagt: `backup/` wird nicht geraeumt, solange Agenten
laufen.** `[read]` **Ein Aufraeumlauf braucht einen Zeitpunkt, an dem
niemand schreibt.**

`[read]` **Und die Vollsicherungen sind eine Produktfrage:**
**wie weit zurueck will Tom springen koennen?**

## Abnahme

**2026-09-02, Orchestrator.** **Geraeumt und gesichert.**

### Der Stand

    vorher    11.633 Dateien, 5,97 GiB
    nachher   11.581 Dateien, 2,31 GiB

`[cmd]` **56 von 57 Vollsicherungen entsorgt, 3,66 GiB.** `[cmd]`
**Die juengste bleibt:** `20260830_140937_c354_vor_live`, als `.sql`
und `.dump`.

`[read]` **Tom hat sie selbst entsorgt** — **kein Agent hat
geloescht.**

### Was gebaut wurde

`[cmd]` **`backup/00-LIESMICH.md`** — die Regeln, Quellen zuerst.
`[cmd]` **`backup/quellen-NICHT-RAEUMEN.md`** — sieben Fundstellen.
`[cmd]` **`backup/_temp/00-LIESMICH.md`** — *,,Tom entsorgt, sonst
niemand."*
`[cmd]` **`tools/backup-wachstum.mjs`** — laeuft im Gate, meldet bei
ueber 2,5 GiB oder sieben Tagen ohne Inventur.

### Der Waechter, in beide Richtungen belegt

    Manifest da, 2,19 GiB      keine Erinnerung   richtig
    kein Manifest              Erinnerung         richtig
    zurueckgebaut              keine Erinnerung   richtig

`[read]` **Die erste Fassung schwieg, wenn kein Manifest da war** —
**`alter !== null` liess den Fall durch.** `[read]` **Kein Manifest
heisst: nie inventarisiert** — **der aelteste denkbare Stand, kein
Grund zu schweigen.**

### Der Fund, der den Raeumplan gerettet hat

`[cmd]` **Sechs Kettenschritte und Produktcode lesen aus
`backup/kimi-research/` und `backup/legacy-v2/`.**

`[read]` **Mein Probelauf haette sie mitgenommen.**

`[cmd]` **Und `schema/` habe ich zuerst falsch als Quelle
eingeordnet** — **die eine Referenz steht in einem Kommentar, nicht
im Code.** **Es ist raeumbar.**

### Was als naechstes ansteht

    c262        658,7 MiB   Arbeitsstand, Punkt erledigt
    schema      211,6 MiB   276 Kettenlauf-Sicherungen
    c255        152,7 MiB   Arbeitsstand
    (direkt)    126,1 MiB   575 lose Dateien

`[cmd]` **In `schema` liegen drei Sicherungen innerhalb von 40
Sekunden** — **dieselbe Sache, nur kleiner.**

**Abgenommen.**
