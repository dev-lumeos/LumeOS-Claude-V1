---
nr: A-70
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-216
entscheidung: null
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

## Was zuerst zu klaeren ist

`[read]` **A-39 sagt: `backup/` wird nicht geraeumt, solange Agenten
laufen.** `[read]` **Ein Aufraeumlauf braucht einen Zeitpunkt, an dem
niemand schreibt.**

`[read]` **Und die Vollsicherungen sind eine Produktfrage:**
**wie weit zurueck will Tom springen koennen?**
