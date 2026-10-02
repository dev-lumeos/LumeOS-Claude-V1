---
nr: C-556
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-10-02
agent: codex
beauftragt: 2026-10-02

braucht: [C-295, C-275]
kind_von: C-295

quellen:
  - docs/punkte/erledigt/quer-c-0295-die-kette-liest-aus-zwei-kimi-pfaden.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/13_supplements/134_substance_catalog.ts
    - supabase/_pipeline/14_medical/147_substance_lab_markers.ts
---

# Zwei fachliche Folgen des neuen Kimi-Bestands

## Auftrag — Kopf

    AUFTRAG FUER Codex - C-556: die zwei Folgen des Pfadwechsels, je
                               fachlich entschieden
    Bereich: supabase/_pipeline/13_supplements/134_substance_catalog.ts
             supabase/_pipeline/14_medical/147_substance_lab_markers.ts
             supabase/_pipeline/_validierung/
    Fremd:   apps/ gehoert Claude Code (G-586). docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

## Der Befund — du hast ihn gemeldet statt passend gemacht

`[cmd]` **C-295 hat den Pfad umgestellt, und der Vollimport legte zwei
fachliche Fehler offen.** Du hast beide gemeldet und **nicht geraten** —
deshalb sind sie ein eigener Auftrag und nicht Teil von C-295.

`[cmd]` **Der neue Bestand ist groesser, belegt und richtig** (C-275):

    supplements.jsonl            154 -> 243
    peptides.jsonl                61 ->  79
    performance_compounds.jsonl   75 -> 124
    Substanzen je Schritt        290 -> 446

**25 von 28 gelesenen Quelldateien sind SHA-byteidentisch** — nur diese
drei unterscheiden sich.

### Erstens: 148 Datensaetze ohne C-230-Filter

`[cmd]` **Schritt 134 rechnet fuer den neuen Bestand 297 / 90 / 185
statt 307 / 82 / 177**, und **148 Datensaetze erhalten keinen
verpflichtenden C-230-Filter.**

`[read]` **Das ist eine Zuordnungsfrage, keine Zahlenfrage.** Die 148
sind neu im Bestand und passen in keine der bestehenden Gruppen.

### Zweitens: ein unbekannter Wirkungstyp

`[cmd]` **Schritt 147 bricht woertlich ab:**

    Unbekannter effect_type: detection_marker

`[read]` **Der Abbruch ist richtig** — ein unbekannter Wert darf nicht
still durchlaufen. Aber `detection_marker` ist offenbar eine Kategorie,
die der Katalog bisher nicht kannte.

`[cmd]` **Beides haelt den naechtlichen Vollimport rot**, und damit
haengt auch A-91/A5 daran: ohne gruenen Vollauf kein neuer Dump.

## Auftrag

**A1 — die 148 fachlich zuordnen, oder begruendet den Filterzwang
lockern.** `[read]` **Die Frage, die du entscheiden und melden sollst:**
sind die 148 Substanzen eine eigene Gruppe, gehoeren sie in bestehende,
oder ist der Zwang aus C-230 fuer diesen Bestand zu eng? **Begruende es
am Inhalt der 148, nicht an der Zahl** — und wenn die Antwort
"Produktentscheidung" lautet, **sag das und bau nichts.**

**A2 — `detection_marker` einordnen.** Was bedeutet der Wert im neuen
Bestand, wie viele Zeilen tragen ihn, und gehoert er in die bestehende
Aufzaehlung oder braucht er eine eigene Behandlung? `[read]` **Den
Abbruch nicht entfernen** — er ist die Zusicherung, die diesen Fund
moeglich gemacht hat.

**A3 — die Rohzaehlwaechter stehen schon auf den neuen Zahlen**
(`134_substance_catalog.ts:648`, in C-295 nachgezogen). **Pruef, ob deine
Loesung sie wieder verschiebt**, und zieh sie dann mit, mit der
gemessenen Zahl.

**A4 — danach der Vollimport.** `[read]` **Das ist der einzige Nachweis,
der zaehlt**, und er traegt zwei Punkte zugleich: wird er gruen, erzeugt
der naechtliche Lauf einen neuen Dump und **A-91/A5 ist belegt.** `[cmd]`
**Kein Vollauf von Hand** — die Nacht macht ihn, und du sagst im Bericht,
was sie vorfinden wird.

**Nicht Teil:** der Pfadwechsel (C-295, erledigt), der
Inhaltsunterschied der drei Dateien (C-275) und `supabase/README.md`.

**Zu belegen:** die Gruppenzahlen vorher und nachher, gegen eine
Wegwerf-Datenbank · die Zahl der 148 nach deiner Zuordnung · die
Zeilenzahl mit `detection_marker` · die betroffenen Schritte einzeln
gruen, mit Laufzeit · Wegwerf-Datenbank verworfen mit Zaehler · kein
`db push` · nichts committen.
