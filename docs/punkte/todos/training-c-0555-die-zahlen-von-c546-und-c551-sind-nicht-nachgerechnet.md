---
nr: C-555
typ: messung
modul: training
schwere: mittel
angelegt: 2026-09-28

braucht: []
quellen:
  - docs/punkte/00-INDEX.md
  - supabase/migrations/20260927043000_c546_muscle_anatomy.sql
  - supabase/migrations/20260927040500_c551_role_measurement_separation.sql

beruehrt:
  tabellen:
    - training.exercise_muscles
  dateien:
    - supabase/_pipeline/10_training/490_exercise_muscle_factors.sql
    - apps/web/src/lib/profile/zielwerte-write.ts

zahlen:
  gemessen: 2026-09-28
  strukturell_geprueft: 16
  zahlen_offen: 9
---

# C-555 - die Zahlen von C-546 und C-551 sind berichtet, nicht nachgerechnet

## Warum dieser Punkt existiert

`[cmd]` **C-546 und C-551 sind am 2026-09-28 abgeschlossen worden,
nachdem ihre Struktur nachgezaehlt war** — 16 Bezeichner, vier
Trigger, die Alias-Sperre, die zusammengesetzten Fremdschluessel, mit
eingebauter Gegenprobe.

`[read]` **Die ZAHLEN in den zwei Berichten sind damit nicht
geprueft.** Sie brauchen einen Kettenlauf gegen eine
Wegwerf-Datenbank, und der wurde nicht gestartet, weil Codex am
selben Nachmittag gegen denselben Server arbeitete (C-554).

`[read]` **Dieser Punkt existiert, damit das nicht als geprueft
durchgeht.** Ein Abschluss mit benannter Luecke ist ehrlich; eine
Luecke ohne Punkt ist ein Verlust.

## A1 - die Zahlen von C-546 nachrechnen

    23 von 112 Katalogknoten mit mindestens einem Anatomiefakt
    89 ohne
    20 Urspruenge
    21 Ansaetze
    23 Nervenrelationen
     0 Ausstrahlungsmuster
    108 kanonische Knoten, davon 77 Blaetter

`[cmd]` **Gegenprobe, die im Bericht steht und mitzupruefen ist:**
Vastus Medialis traegt je einen belegten Ursprung, Ansatz und Nerv;
Brachioradialis traegt 0/0/0/0 und keinen Platzhalter.

## A2 - die Zahlen von C-551 nachrechnen

    4.941,0  gewichtete Saetze nach der Trennung
    4.941,41 Summe der alten Mischspalte (und damit kein Volumenwert)
    6.723    Pelland-Zeilen mit activation_factor IS NULL
    3        EMG-Zeilen mit 0,95 / 0,79 / 0,67, Klasse A
    10/10    Fachtests C-490/C-543/C-551
    5/5      C-551 allein

## A3 - die fehlende Quelle fuer Ausstrahlungsmuster

`[cmd]` **`training.muscle_pain_referrals` steht leer** — 0 Zeilen,
mit Begruendung: FIPAT TA2 und NCBI Bookshelf belegen
Ausstrahlungsmuster nicht systematisch.

`[read]` **Tom hat Ausstrahlung ausdruecklich verlangt** (C-546,
2026-09-08: ,,nerven, welche vielleicht ausstrahlen oder
taubheitsgefuehle"). **Die leere Tabelle ist richtig gebaut, aber
sie loest die Vorgabe nicht ein.** Was fehlt, ist eine belegbare
Quelle fuer Triggerpunkt-Referralmuster — und die Entscheidung, ob
es eine gibt, die unseren Belegansprueehen genuegt.

`[read]` **Das ist keine Bauaufgabe, sondern eine Quellenfrage.**
Solange sie offen ist, bleibt die Tabelle leer und der
Injektionspunkt-Gedanke aus C-546 unerreichbar.

## A4 - ein Fehlercode ist kein Fehlergrund

`[cmd]` **C-546 wirft `ERRCODE 23514` fuer eine
Anatomieverletzung** (`require_canonical_muscle_reference()`,
Migration Zeile 67-86).

`[cmd]` **`apps/web/src/lib/profile/zielwerte-write.ts:31` filtert
in `hindernisAusFehler()` auf genau diesen Code:**
`if (error.code !== '23514') return null`.

`[read]` **Heute kollidiert das nicht:** die Anatomietabellen sind
nur fuer `service_role` schreibbar, `apps/` schreibt sie nicht.

`[read]` **Aber die Zuordnung Fehlercode → Hindernissatz ist
grundsaetzlich zu eng.** `23514` ist der Postgres-Code fuer *jede*
CHECK-Verletzung im ganzen Schema. Wer den Hindernissatz je
verallgemeinert oder eine gemeinsame Fehlerabbildung baut, bekommt
fuer eine Anatomieverletzung einen Satz ueber Phasen. **Die
Zuordnung braucht den Constraint-Namen, nicht den Code.**

## A5 - der Bericht muss den Bezeichner nennen, den der Code traegt

`[cmd]` **C-551 nennt die EMG-Quelle `pmc4327372_emg`. Im Code steht
`pmc4327372_bench_press_emg`**
(`_pipeline/10_training/490_exercise_muscle_factors.sql:22`).

`[read]` **Sachlich dasselbe, praktisch nicht:** eine Suche nach der
Berichtszeile findet null Treffer. Meine Abnahme hat genau daran
gehangen und einen Fehlalarm erzeugt, bis ich im Code nachgesehen
habe. **Bezeichner werden im Bericht nicht verkuerzt.**

## Eine Reihenfolgeabhaengigkeit, die niemand aufgeschrieben hat

`[cmd]` **`490_exercise_muscle_factors_daten` steht in `kette.json`
(Zeile 2064) vor der C-551-Migration (Zeile 2745).** Der
Kettenschritt schreibt `faktor`, `source_id`, `evidence_class`; die
Migration benennt danach in `activation_*` um.

`[read]` **Das laeuft, solange die Reihenfolge stimmt** — und sie
steht nur in `kette.json`, nicht im Kopf der Dateien. Wer `490`
einzeln nach `c551` ausfuehrt, bekommt `column "faktor" does not
exist`. **Ein Satz im Dateikopf von `490` wuerde das abfangen.**
