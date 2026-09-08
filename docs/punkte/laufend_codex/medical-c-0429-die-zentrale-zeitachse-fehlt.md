---
nr: C-429
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-241
entscheidung: E-74
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.lab_reports]
zahlen:
  gemessen: 2026-09-08
  reiter: 5
---

# C-429 — die zentrale Zeitachse fehlt

## Befund

Aus G-241, Codex, 2026-09-08.

`[cmd]` **E-26 vermutete: *,,`History` ist vermutlich in `tracking`
aufgegangen. Das gehoert gemessen."***

`[cmd]` **Gemessen: `tracking` enthaelt nur Symptome und
Medikamente.**

    Biomarker-Verlauf     -> Biomarkers
    Import-Historie       -> Import
    Symptome, Medikamente -> Tracking
    Diagnose, Behandlung,
    Bildgebung, Operation -> NIRGENDS

`[read]` **Die alte zentrale Zeitachse hat weder Reiter noch
Tabelle.**

## Was das heisst

`[read]` **Vier Ereignisarten haben keinen Ort:** **Diagnose,
Behandlung, Bildgebung, Operation.**

`[read]` **Das sind genau die, die ein Arzt sehen will** — **und
die ein Nutzer ueber Jahre sammelt.**

## Zusammenhang

`[cmd]` **`public.activity_stream` vereint sechs Module** (C-414) —
**`medical` traegt dort 10 Zeilen, aus Laborberichten.**

`[read]` **Zu klaeren, ob die Zeitachse eine eigene Tabelle
braucht** — **oder ob sie aus den bestehenden entsteht, sobald
Diagnosen und Behandlungen einen Ort haben.**

`[cmd]` **`docs/specs/Medical/SPEC_02_ENTITIES.md` und
`SPEC_06_DATABASE_SCHEMA.md` sind zu lesen.**

## Berichtigung 2026-09-08 — die Spec verbietet es

**Gemessen vor der Auftragsvergabe.**

`[cmd]` **`SPEC_01_MODULE_CONTRACT.md:10`:**
**,,KEIN Arzt. KEINE Diagnose. KEIN Therapieplan."**

`[cmd]` **`INDEX.md:27`: ,,Keine Diagnose."**

`[cmd]` **`SPEC_02_ENTITIES.md:245`: AI-Erkenntnisse sind
,,nicht-diagnostisch, keine Therapieempfehlung."**

`[cmd]` **Und: `treatment`, `imaging`, `surgery`, `timeline` kommen
in der gesamten Medical-Spec NICHT vor.** `[cmd]` **Im Altrepo null
Treffer.**

`[cmd]` **`history` heisst in der Spec ausschliesslich
Biomarker-Verlauf** — `biomarkerHistory: LabValue[]`
(SPEC_04:188).

## Was daraus folgt

`[read]` **Die vier Ereignisarten stammen aus dem Mockup, nicht aus
der Spec** — **und drei davon sind Bereiche, die das Modul bewusst
nicht betritt.**

`[read]` **Eine Diagnose einzutragen waere kein fehlendes Feature,
sondern ein Bruch des Modulvertrags.**

## Was bleibt

`[read]` **Zu klaeren ist nicht *,,wo ist die Zeitachse"*, sondern:**

**1 · Darf ein Nutzer eine Diagnose erfassen, die ein Arzt gestellt
hat?**

`[read]` **Das ist keine Diagnose durch LumeOS** — **es ist eine
Notiz ueber eine fremde.** `[cmd]` **`conditions` traegt schon
etwas Aehnliches** — zu messen.

**2 · Und wenn ja: gehoert sie ins Modul oder in Documents?**

`[cmd]` **G-241 hat Documents beauftragt** — **ein Arztbericht ist
ein Dokument, keine Datenstruktur.**

`[read]` **Der einfachere Weg waere: das Original ablegen, nicht
die Diagnose modellieren.**

## Der Mockup-Reiter bleibt

`[cmd]` **E-70: das Mockup ist Referenzobjekt.** `[read]` **Der
History-Reiter bleibt als Attrappe sichtbar, mit dem Grund
*,,widerspricht dem Modulvertrag"*** — **verworfen, nicht
vergessen.**

## Aufgeloest durch E-74, 2026-09-08

Tom: *,,wir sind kein arzt, aber wir koennen daten fuer den user
sammeln die er zur verfuegung stellt."*

`[read]` **Die Frage im Abschnitt oben ist beantwortet: ja.**

`[read]` **Der Vertrag verbietet, dass LumeOS diagnostiziert** —
**nicht, dass der Nutzer eintraegt, was ein Arzt gesagt hat.**

`[cmd]` **Erfassbar: Diagnosen, Behandlungen, Operationen,
Zeitachse, Dokumente, Termine.**

`[cmd]` **Jeder Eintrag traegt seine Herkunft** — **damit ist die
Wiedergabe ein Zitat, keine Aussage.**

`[read]` **Der Punkt ist damit ein Bauauftrag, kein Befund.**

## Auftrag — die Medical-Ablage

**Mitbeauftragt: G-241, C-430, G-374.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### E-74 gilt

Tom, 2026-09-08: *,,wir sind kein arzt, aber wir koennen daten fuer
den user sammeln die er zur verfuegung stellt und dessen inhalt mit
herkunft bei fragen des users wiedergeben."*

`[read]` **Erfassen ist nicht diagnostizieren.** `[read]` **Der
Vertrag verbietet, dass LumeOS diagnostiziert** — **nicht, dass der
Nutzer eintraegt, was ein Arzt gesagt hat.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt Medical.**
`[cmd]` **`SPEC_02_ENTITIES.md`, `SPEC_06_DATABASE_SCHEMA.md`,
`SPEC_08_IMPORT_PIPELINE.md`.**

`[cmd]` **Und `E-74` selbst** — **die Herkunft traegt die Last.**

### 1 · Documents — der Bucket

`[cmd]` **Gemessen: 10 Laborberichte, alle `file_ref = NULL`,
`storage.buckets` leer.**

`[cmd]` **`SPEC_04:40`, `SPEC_06:117`, `SPEC_02:151` nennen
`file_url`/Storage.**

`[read]` **Bau den Ablageweg** — **und miss, ob Verschluesselung
noetig ist, bevor Originale liegen.**

`[cmd]` **`user_medications` wartet auf Schluesselverwaltung** —
**fuer Arztbefunde duerfte dasselbe gelten.** `[read]` **Miss es
und sag es, statt es zu entscheiden.**

### 2 · Appointments

`[cmd]` **Keine Tabelle, keine Entity, kein API-Eintrag** —
**einziger Fund: der UI-Text *,,Termin vereinbaren"*
(SPEC_03:151).**

`[cmd]` **Dein eigener Vorschlag aus G-241:** **Nutzer, Typ
(Arzt/Labor/sonstiges), Zeitpunkt mit Zeitzone, Status, optionale
Verknuepfung zu Laborbericht oder Medikation, Owner-RLS.**

`[read]` **Bau ihn.**

### 3 · Die vier Ereignisarten

`[cmd]` **Diagnosen, Behandlungen, Operationen, Zeitachse.**

`[read]` **Jeder Eintrag traegt seine Herkunft:** **wer, wann, und
ob ein Dokument dahinterliegt.**

`[read]` **Damit ist die Wiedergabe ein Zitat, keine Aussage.**

`[cmd]` **Dieselbe Machart wie `measurement_source` und
`source_detail`** — **und wie der Coach-Namenssnapshot** (C-268):
**die Herkunft friert ein.**

`[read]` **Miss zuerst, ob `medical.conditions` schon etwas davon
traegt** — **bevor du eine neue Tabelle baust.**

`[read]` **Und ob die Zeitachse eine eigene Tabelle braucht oder
aus den anderen entsteht** — **`public.activity_stream` ist der
Praezedenzfall** (C-414).

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  Bucket steht, ein Original abgelegt und gelesen.
        Zahl: Dateien / Groesse.
    A2  Verschluesselung: noetig oder nicht, mit Begruendung
        und Fundstelle.
    A3  appointments: Zeilen auf test-user, RLS beide Richtungen.
    A4  je Ereignisart: Zeilen auf test-user, und die Herkunft
        je Zeile belegt.
    A5  conditions: was traegt sie heute? Zahl: Spalten, Zeilen.
    A6  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Keine Oberflaeche** — **das sind UI-Auftraege.**
**Keine Ableitung aus den Daten** — **E-74: kein Wert wird
bewertet.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet an G-152.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Nachtrag 2026-09-08 — zwei Grundlagen dazu

Tom: *,,ja klar, das sind grundlagen."*

### C-430 — der Aktivitaetsstrom braucht drei Sprachspalten

`[cmd]` **`public.activity_stream` traegt nur `summary_de`** —
**und der deutsche Text steht als Zeichenkette IN der
Sichtdefinition** (`'Mahlzeit erfasst: '`, `'Abendessen'`).

`[cmd]` **`00-konventionen.md`, Abschnitt 1:** *,,Das Datenmodell
fuehrt Sprachvarianten als Spalten (`name_de`, `name_en`,
`name_th`)."*

Tom: *,,ist es eine datenbankabfrage? dann in der db loesen."*

`[read]` **Also `summary_de`, `summary_en`, `summary_th`.**

`[cmd]` **`supplement_evidence` macht es bereits so** — **die
Sicht ist der Ausreisser.**

`[read]` **Je Ereignisart drei Faelle** — `'Mahlzeit erfasst: '`
neben `'Meal logged: '` und der thailaendischen Fassung.

### G-374 — der Zyklusbeginn

`[cmd]` **Claude Code hat alle 17 Spalten von
`supplements.stack_items` geprueft:** **keine haelt den Beginn.**
**`added_at` ist die Zeilenanlage.**

`[cmd]` **`cycling` ist JSONB mit `{on_weeks, off_weeks}`, einem
*ist ein Objekt*-CHECK und null gefuellten Zeilen.**

`[read]` **Sein Vorschlag, von Tom bestaetigt: `started_on`
INNERHALB des bestehenden Objekts** — **keine neue Spalte.**

> *,,es ist schon da, hat schon einen CHECK, und die drei Werte sind
> einzeln bedeutungslos."*

`[read]` **Ohne Beginn gibt es kein *,,Woche 5 von 8"*.**

`[read]` **Den CHECK entsprechend erweitern** — **ein `cycling` mit
`on_weeks` und ohne `started_on` ist unvollstaendig.**

### Zusaetzliche Abnahmebedingungen

    A7  activity_stream: drei Sprachspalten, je eine Zeile
        belegt. Zahl: Ereignisarten / davon dreisprachig.
    A8  cycling: started_on im CHECK, eine Zeile gesetzt und
        gelesen. Und: was geschieht mit den null bestehenden?

## Nachtrag 2026-09-08 — E-75 entscheidet den Bucket

Tom: *,,nimm einen logischen namen gehoerend zu medical und ja
natuerlich privat, das sind ernste daten. pfadregel ok."*

    Name          medical-documents
    Sichtbarkeit  privat, kein oeffentlicher Zugriff
    Pfadregel     <user_id>/<report_id>.<ext>

`[read]` **Die Zeilensicherheit laeuft ueber das erste Segment.**

`[cmd]` **`lab_reports.file_ref` traegt den PFAD, nicht die URL** —
**eine URL waere ein Zugriff, ein Pfad ist ein Verweis.**

`[read]` **Die URL entsteht beim Lesen, zeitlich begrenzt.**

### Und A2 bleibt zu messen

`[read]` **Ein privater Bucket schuetzt den Zugriff, nicht den
Inhalt** — **wer die Datenbank hat, hat die Dateien.**

`[cmd]` **`user_medications` wartet auf Verschluesselung** — **miss,
ob dasselbe fuer die Originale gilt, und sag es.**
