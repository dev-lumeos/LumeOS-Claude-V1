---
nr: C-477
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
---

# C-477 — Provenienz je Uebungsasset

## Woher

`[cmd]` **Due Diligence openGym, Abschnitt 05, Risiko HOCH:**

> *,,Medien sind nicht durch die openGym-AGPL abgedeckt. Fuer
> LumeOS nur Assets aus dem eigenen Vertrag einsetzen; Lizenz-ID,
> Rechteinhaber, erlaubte Kanaele und Aufloesung pro Asset
> speichern."*

## Was das Fremdprojekt falsch macht

`[cmd]` **1.324 JPGs und GIFs, alle 180x180, aus einem
Drittdatensatz zur Laufzeit geklont.**

`[cmd]` **Rechteinhaber GymVisual, Weitergabe nur mit gesonderter
Erlaubnis und Attribution.**

`[cmd]` **Und ein Ownership-Disput zwischen GymVisual und
ExerciseDB v1, den das Projekt selbst dokumentiert.**

`[read]` **Tom hat eigene Assets gekauft** ? **das ist die
Differenzierung, wenn die Herkunft belegt ist.**

## Die Bauform gibt es schon

`[cmd]` **`supplements.supplement_field_sources`, 2.815 Zeilen:**

    supplement_id, field_name, source_id,
    as_of, evidence_class, source_note_de/en/th

`[cmd]` **Je FELD eine Quelle, mit Evidenzklasse und Stichtag:**

    cas_number          src_pubchem_98521      B  2026-08-20
    external_ids.UNII   src_gsrs_ZPZ473F40K    A  2026-08-20

`[read]` **Dieselbe Form fuer Uebungsassets** ? **je Bild und
Video: Lizenz-ID, Rechteinhaber, erlaubte Kanaele, Aufloesung,
Kaufbeleg.**

## Was zu messen ist

**1** ? **Was traegt `training.exercises` heute an Medien?**

`[cmd]` **Miss die Spalten** ? **gibt es ueberhaupt Bilder?**

**2** ? **Wo liegen sie?**

`[cmd]` **Ein Bucket wie `goals-progress-photos` (C-463) oder
`medical-originals` (C-429)?**

**3** ? **Und die Aufloesung.**

`[cmd]` **Der Bericht rechnet vor:** **180 px in 320 px Anzeige
= 1,78-fache Skalierung, jedes Quellpixel wird zu 3,2
Bildschirmpixeln.**

`[read]` **Wenn LumeOS-Assets hoeher aufgeloest sind, ist das
sofort sichtbar.**

`[read]` **Und der Bericht nennt den Weg:** *,,AVIF/WebP/MP4 aus
einem verlustarmen Master; das Master bleibt unveraendert und
revisionsfest."*

## Was NICHT gemessen werden kann

`[read]` **Ob Toms Kaufpaket dieselbe Asset-Familie ist** ?
**dafuer braucht es den Lizenzvertrag, nicht die Datenbank.**

`[cmd]` **Der Bericht sagt es selbst:** *,,Einen beweissicheren
1:1-Abgleich habe ich ohne dessen Originaldateien und
Lizenzvertrag nicht vorgenommen."*
