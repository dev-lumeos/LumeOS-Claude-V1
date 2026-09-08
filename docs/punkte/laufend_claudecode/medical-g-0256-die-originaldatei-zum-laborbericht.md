---
nr: G-256
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-241
entscheidung: E-26
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.lab_reports]
zahlen: null
---

# G-256 — die Originaldatei zum Laborbericht

## Befund

**Aus E-26.** Tom: *,,seine original pdf/fotos/etc von labresults
verfuegbar hat und nicht nur eingelesen"*.

`[cmd]` **`medical.lab_reports` traegt bereits `file_ref`** — die
Spalte fuer die Originaldatei existiert. `[cmd]` Dazu `lab_name`,
`title`, `source`, `source_detail`, `report_date`.

`[read]` **Was fehlt, ist der Ablageort und die Ansicht.** `[read]`
**Heute liest der Import einen Befund aus, und das Original ist
danach nirgends** — wer seinem Arzt den Befund zeigen will, hat nur
unsere Auslesung.

## Beruehrt E-19 und E-20

`[read]` **Dieselbe Frage wie bei MealCam:** wo liegen Dateien, wer
darf sie sehen, was passiert bei Widerruf.

`[cmd]` **Und E-12 haelt Medical-Daten in der Entwicklungsphase als
Klartext.** `[read]` **Ein hochgeladener Arztbericht ist eine andere
Klasse als ein ausgelesener Laborwert** — er traegt Name, Diagnose
und Briefkopf.

## Auftrag

**Mitbeauftragt mit G-17 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-08: blockiert, zwei Entscheidungen offen

`[cmd]` **`storage.buckets` leer, 10 von 10 Laborberichten ohne
Datei.** `[cmd]` **`file_ref` steht als Zeiger da** — **es fehlt,
worauf er zeigt.**

`[read]` **Claude Code hat nichts gebaut** — richtig.

### Zwei Entscheidungen vor jeder Oberflaeche

**1 · Name und Sichtbarkeit des Buckets.**

**2 · Die Pfadregel fuer `file_ref`.**

`[read]` **Sein Vorschlag: `<user_id>/<report_id>.<ext>`** —
**damit laeuft die Zeilensicherheit ueber das erste Segment.**

`[read]` **Das ist der uebliche Weg bei Supabase Storage** — **und
er braucht keine zusaetzliche Tabelle.**

`[cmd]` **Codex baut den Ablageweg in C-429** — **die beiden
Entscheidungen gehoeren davor.**

## Entschieden am 2026-09-08 — E-75

    Name          medical-documents
    Sichtbarkeit  privat
    Pfadregel     <user_id>/<report_id>.<ext>

`[read]` **Damit sind die zwei blockierenden Entscheidungen
weg.**

`[cmd]` **Codex baut den Bucket in C-429** — **danach ist die
Oberflaeche beauftragbar.**

`[cmd]` **`file_ref` traegt den Pfad, nicht die URL** — **die URL
entsteht beim Lesen, zeitlich begrenzt.**

## Auftrag

**Mitbeauftragt mit G-376 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.
