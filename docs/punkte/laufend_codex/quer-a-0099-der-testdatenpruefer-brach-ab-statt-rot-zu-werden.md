---
nr: A-99
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-03
agent: codex
beauftragt: 2026-10-04

braucht: [A-95, G-594]
kind_von: A-95

quellen:
  - docs/punkte/erledigt/goals-g-0594-ein-ernaehrungsziel-kennt-seine-phase-aber-nicht-sein-ziel.md
  - docs/punkte/erledigt/goals-g-0595-der-zweiparameter-mantel-war-kein-ueberrest.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_validierung/testdaten-pruefen.ts
---

# Der Testdatenpruefer brach ab, statt rot zu werden — und niemand sah es

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-99: der Testdatenpruefer wird rot statt
                              abzubrechen, und die Befunde werden sortiert
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-04


## Der Befund

`[read]` **`testdaten-pruefen.ts` faengt Datenbankfehler nicht ab:**

    function sql(query: string): string[][] {
      return execFileSync('docker', [... 'psql' ... '-c', query], ...)
    }

`execFileSync` wirft bei einem Exitcode ungleich null. **Eine Probe mit
ungueltigem SQL beendet das Skript** — sie wird nicht rot, sie reisst
den Rest mit.

`[cmd]` **Genau das ist heute passiert.** A-95 hat eine Probe mit
`GROUP BY true` eingebracht — in Postgres ungueltig:

    df9cd8aa  2026-10-03  goals(A-95): Live-Stand nachgezogen, alte
                          Zweiparameter-Fassung entfernt

`[read]` **Die Probe stand bei Zeile 557. Alles darunter lief seither
nicht.** Dazu gehoeren die zwei Proben, die **G-595 danach** bei Zeile
587 ff. angelegt hat — die, die beide Signaturen von
`berechne_zielwerte` verlangen.

`[cmd]` **Entfernt ist die Zeile in `dc04902a` (G-594).** Der Pruefer
laeuft technisch wieder durch. **Dieser Punkt ist nicht die Zeile, er
ist die Bauart.**

## Was daran die Lehre ist

`[read]` **Ein Pruefer, der bei einem eigenen Fehler abbricht, meldet
dasselbe wie ein Pruefer, der nie lief** — und zwar genau dann, wenn man
ihn am dringendsten braucht: nach einer Aenderung. **Derselbe Fehler wie
bei `pipeline-database-vertrag.mjs` in A-98**, nur von der anderen Seite:
dort meldet ein Waechter gruen, ohne zu messen; hier meldet er gar
nichts, obwohl er messen wollte.

`[read]` **Und es trifft meine eigene G-595-Abnahme.** Ich habe dort
`[cmd]` gesetzt fuer *„die Probe verlangt jetzt beide Fassungen"*. **Am
Dateiinhalt ist das richtig. Durch einen Lauf der Datei belegt war es
nie.** Die Berichtigung steht in G-595.

## Was zu tun ist

### A1 — eine fehlgeschlagene Probe ist rot, nicht still

**Jede Probe faengt ihren eigenen Fehler.** Ein SQL-Fehler wird ein
Eintrag in `errors` mit dem Fehlertext, und das Skript laeuft weiter.
**Ein Abbruch darf nur noch entstehen, wenn die Datenbank selbst nicht
erreichbar ist** — und dann mit eigener Meldung.

`[read]` **Die Gegenprobe muss in beide Richtungen belegt sein:** mit
einer absichtlich ungueltigen Probe muss der Lauf **rot** werden und
**alle anderen Proben trotzdem** ausfuehren. Die Zahl der gelaufenen
Proben gehoert in die Ausgabe — ohne sie ist ein Abbruch von einem
gruenen Lauf nicht zu unterscheiden.

### A2 — die 16 gemeldeten Befunde triagieren

`[read]` **Codex meldet 16 bestehende Befunde** aus
Testdatenreihenfolge sowie Nutrition-, Supplements-, Training- und
Einkaufslistenbestand. `[annahme]` **Nicht von mir geprueft** — das
braucht einen Wegwerflauf der ganzen Kette.

**Erst zaehlen, dann sortieren:** welche sind echte Luecken im Seed,
welche sind Proben, die auf einen alten Stand zeigen. **Jeder echte wird
ein eigener Punkt.** Keine Sammelkorrektur.

### A3 — nachsehen, ob es weitere stille Abbrecher gibt

`[read]` **Dieselbe Bauart andernorts:** `_validierung/` und `tools/`
nach `execFileSync`-Aufrufen ohne `try` durchsehen. **Melden, nicht
aendern** — die Liste entscheidet, ob daraus ein Punkt wird.

## Harte Regeln

- **Nie gegen die laufende Datenbank.** Wegwerf-Datenbank, danach
  verwerfen, Anzahl im Bericht.
- **A2 wartet auf A-91** — der Vollkettenlauf gehoert dorthin, nicht
  hierher. Ohne gruenen Nachtlauf keine 16er-Triage.
- **Kein Commit.**

**Nicht Teil:** A-98 (der Datenbankvertrag-Waechter) · A-96 (die
Logdatei des Nachtlaufs) · die 16 Befunde selbst, solange sie nicht
sortiert sind.

## Stand 2026-10-04 — jetzt durchfuehrbar

`[cmd]` **Die Kette ist seit C-558 gruen** (`4dd9aa11`, Dump
`grunddaten-20261004T011755Z.dump`). **A2 wartet damit nicht mehr** — die
Triage laeuft auf einer Wegwerf-Datenbank aus der Kette, nicht auf Live.

`[read]` **Die 16 Befunde sind alt** (gemessen vor C-558). **Zuerst neu
zaehlen**, dann sortieren; C-558 hat Sollzahlen im Supplement-Bereich
nachgezogen, einige der 16 koennen dadurch weg sein.

**Reihenfolge:** A1 (Bauart), dann A2 (Triage, jeder echte Befund ein
eigener Punkt im Bericht, nicht repariert), dann A3 (nur melden).
**Kein Commit. Nie gegen Live. Wegwerf-Datenbank danach loeschen.**
