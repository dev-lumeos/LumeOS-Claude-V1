---
nr: A-90
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01
commit: 3868434
erledigt: 2026-10-02
agent: codex
beauftragt: 2026-10-01

braucht: [A-86]
kind_von: A-77

quellen:
  - docs/punkte/erledigt/quer-a-0077-werkzeugtests-liefen-nirgends.md
  - docs/punkte/erledigt/quer-a-0086-die-kette-spielt-die-testdaten-nicht-ein.md

beruehrt:
  dateien:
    - supabase/_pipeline/kette.json
    - supabase/_pipeline/daten/
---

# Grunddaten als Dump, nicht als Import bei jedem Lauf

## Auftrag

    AUFTRAG FUER Codex - A-90: Grunddaten als Dump statt als Import
    Bereich: supabase/_pipeline/kette.json
             supabase/_pipeline/daten/
             supabase/_pipeline/ (die Importschritte)
    Fremd:   apps/ und packages/ gehoeren Claude Code. docs/ und tools/
             gehoeren dem Orchestrator, auch diese Punktdatei: der
             Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei.

## Der Befund

**Tom, 2026-10-01, 14:20:** *„mach einen grossen grunddaten dump und die
anderen kleinen aenderungen kannst von mir aus eine scheisskette machen
... aber hoer auf verdammt nochmal 1000 am tag bei jeder scheiss
aenderung die kette komplett neu einzulesen."*

`[cmd]` **45 der 315 Kettenschritte sind Importskripte** — vom
Orchestrator aus `kette.json` gezaehlt (55 `.ts`-Schritte minus die 10
Proben). Was sie einlesen:

    26,8 MB  daten/biomarker-loinc/*.json  (7 Dateien)
     1,1 MB  daten/anzeigenamen.jsonl
             DSLD 3 Schritte, kimi 9 (Wellen 1-4, Stammdaten,
             Nutzertexte, Dosierung, WADA), BLS 3,
             Biomarker/Medikamente 7, Wissen 8, Kataloge 3

`[cmd]` **Ein voller Lauf dauert 1.459,7 s**, der reine Aufbau ohne
Testdaten 1.300,7 s (A-86).

`[read]` **Keine dieser Quellen aendert sich von selbst.** LOINC-Codes,
DSLD-Produkte, BLS-Werte, Kimis Lieferungen aendern sich, wenn ein
Auftrag sie aendert — und dann weiss es jeder, weil es im Auftrag steht.

## Wo die Linie liegt, und sie liegt nicht bei „Daten gegen Schema"

`[read]` **Unter den 45 sind zwei verschiedene Sorten:**

    Fremddaten     LOINC, DSLD, BLS, kimi-Wellen, Kataloge.
                   Reines Einlesen, aendert sich nur per Auftrag.
                   -> gehoert in den Dump.

    Unsere         _ableitung/anzeigenamen, kuratierte-aliase,
    Ableitung      portionen, mikro-uebersicht, nutrient_tree.
                   Haengt am Schema UND an Kurationsregeln, und die
                   aendern sich bei fast jedem Supplements- oder
                   Nutrition-Punkt.
                   -> laeuft weiter jedes Mal.

`[read]` **Wer die Ableitung mit in den Dump nimmt, misst die Kuration
nicht mehr.** Das ist die Grenze, an der dieser Auftrag scheitern kann.

## Auftrag

**A1 — die 45 Schritte einordnen, je Schritt eine Zeile:** Fremddaten
oder Ableitung, und **wie lange er dauert.** `[cmd]` **Die Kette
protokolliert heute keine Zeit je Schritt** —
`kettenlauf-status.json` traegt nur `duration_seconds` fuer den ganzen
Lauf. **Also zuerst messen, dann schneiden.**

**A2 — den Grunddaten-Dump bauen.** Ein Stand, der die Fremddaten
traegt, wiederherstellbar in Sekunden. **Sag, wie lange das
Wiederherstellen dauert** — das ist die Zahl, auf die es ankommt.

**A3 — die Kette faengt beim Dump an.** Die Importschritte fallen aus dem
normalen Lauf heraus; Schema, Ableitung und Proben laufen weiter.
`[read]` **Und der Dump braucht eine Herkunft:** aus welchem Stand, mit
welcher Pruefsumme, von wann. **Ein Dump ohne Herkunft ist eine
Behauptung.**

**A4 — wann der Dump neu gebaut wird, und wie man es merkt.** Ein Auftrag
fasst eine Quelle an — und dann? `[read]` **Ein Waechter, der eine
geaenderte Quelldatei gegen die Pruefsumme des Dumps haelt**, ist die
Antwort, die nicht an Aufmerksamkeit haengt. **In beide Richtungen zu
belegen.**

**A5 — der volle Lauf bleibt moeglich.** Naechtlich, mit den Importen,
als Beweis dass das Rezept noch stimmt. `[read]` **Genau dafuer ist die
Kette da** — und das ist der einzige Grund, warum es sie gibt.

**Nicht Teil:** die Testdatenschicht (A-86, erledigt), die 46 Zeugen
(A-87), die stillen Rueckfaelle auf `postgres` (A-88).

**Zu belegen:** die Einordnung der 45 mit Zeit je Schritt · die Dauer des
Wiederherstellens gegen die 1.300,7 s gehalten · der Waechter aus A4 in
beide Richtungen · Herkunft und Pruefsumme des Dumps ·
Wegwerf-Datenbank verworfen mit Zaehler · kein `db push` · nichts
committen.

`[read]` **Kein voller Kettenlauf als Nachweis** (00-LIESMICH.md). Bei
A-86 kostete die Arbeit 7,076 s und der verlangte Nachweis 1.300,7 s.
**Dieser Auftrag ist genau dagegen.**

---

## Abnahme — 2026-10-02, Commit `3868434`

`[cmd]` **In `kette.json` nachgezaehlt, nicht im Bericht gelesen:**

| Merkmal | gezaehlt |
| --- | --- |
| Name und Version | `lumeos-lokale-kette-mit-grunddaten-dump`, Version 2 |
| Eintraege | 320 — davon 263 `covered_by_dump`, **57 laufen wirklich** |
| Arten | 261 `sql` · 58 `tsx` · 1 `dump` |
| `grunddaten-pruefen.ts` | 190 Zeilen — Pruefsumme und Herkunft gegen alle eingefrorenen Quellen |
| Gegenprobe | `_validierung/quer-a90-grunddaten-dump.test.ts`, 52 Zeilen: unveraenderte Quelle gruen, geaenderte rot |
| `kette-voll.json` | `extends` auf `kette.json`, `mode: "full"`, eigene Schrittliste leer |
| Commit | `3868434`, 8 Dateien, +1320/−280 (zusammen mit A-91) |

`[cmd]` **Die Zahl 320 ist der Quercheck, dass die Kette stimmt:** Codex
meldete 318 Eintraege und 55 laufende. Die Differenz sind **genau die
zwei G-560-Schritte**, die zwischen seinem Bericht und diesem Commit
hineinkamen. **Zwei unabhaengig entstandene Zahlen treffen sich** — das
ist mehr wert als eine uebernommene.

`[read]` **Der Kern des Punktes war Toms Wartezeit, und sie ist
gemessen:** Restore 78,0 s statt 1.300,7 s Vollaufbau. **94 Prozent
weniger** fuer jeden Nachweis, der eine Wegwerf-Datenbank braucht. Der
Runner kennt `kind: "dump"`, setzt danach den Auth-Stub (der Snapshot
traegt den historischen Stub, und `request.jwt.claims` darf nicht auf den
Stand vor PostgREST 9 zurueckfallen) und ueberspringt jeden gedeckten
Schritt mit einer Zeile Ausgabe.

`[cmd]` **Der Dump selbst ist kein Quellcode** — Toms Entscheidung vom
2026-10-01. `.gitignore` nimmt `grunddaten-*.dump` und
`grunddaten-dump.manifest.json` auf; im Repo steht nur, wie er geprueft
und wiederhergestellt wird.

`[read]` **In einem Commit mit A-91**, und das war eine Entscheidung:
A-91 erweitert diesen Runner in denselben Funktionen. Die Begruendung
steht im Commit.
