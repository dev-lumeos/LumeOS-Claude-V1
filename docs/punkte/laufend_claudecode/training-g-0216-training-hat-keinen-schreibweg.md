---
nr: G-216
typ: feature
modul: training
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen:
    - training.workout_sessions
    - training.workout_exercises
    - training.workout_sets
  dateien:
    - apps/web/src/lib/training
zahlen:
  gemessen: 2026-08-28
  schreibstellen: 0
  lesestellen: 4
  seiten: 9
agent: claudecode
beauftragt: 2026-08-28
---

# G-216 — Training hat Daten und keinen Schreibweg

## Befund

`[cmd]` **Gemessen 2026-08-28:** `apps/web/src/lib/training/` hat
**4 Lesestellen und 0 Schreibstellen**, bei 9 Seiten unter
`app/v2/training/`. **Das einzige Modul ohne Schreibweg.**

`[cmd]` **Die Daten sind da:**

    exercises                  1.416
    exercise_muscles           6.625
    exercise_catalog_enrichment 1.407
    workout_sessions              66
    workout_exercises            132
    workout_sets                 238

`[read]` **Ein Nutzer kann kein Training erfassen.** Die 66 Sitzungen
stammen aus Seed-Daten.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und pruef zuerst, was es schon gibt.** `[cmd]` **In G-138
war meine ganze Praemisse falsch** — der Schreibweg existierte seit
G-148, und der Punkt hatte englische Vorlagennamen gegen deutschen
Code verglichen.

### Zu tun

**Eine Trainingssitzung erfassen: anlegen, Uebungen hinzufuegen,
Saetze eintragen, abschliessen.**

`[cmd]` **Drei Tabellen haengen zusammen** — `workout_sessions`
traegt als einzige `user_id`, `workout_exercises` und `workout_sets`
haengen darunter.

`[read]` **Das ist der Unterschied zu deinen bisherigen drei
Schreibwegen:** bei G-138, G-211 und G-122 war es je eine Zeile.
**Hier entsteht ein Baum, und er entsteht schrittweise** — jemand
faengt an, traegt zwischendurch ein, hoert auf.

`[read]` **Die Frage, die daraus folgt und die du beantworten musst:**
was passiert mit einer Sitzung, die begonnen und nie abgeschlossen
wurde? **Bleibt sie offen, wird sie verworfen, zaehlt sie?** `[cmd]`
Pruef, ob das Schema die Antwort schon vorgibt.

### Was aus den drei vorherigen uebernommen gehoert

**Die Naht.** `[read]` In G-122 war es *,,eine einfache, kein zweites
Ende"*, in G-138 *,,eine Naht mit zwei Enden"*. **Pruef, welche Form
hier passt, und sag es.**

**Snapshots, wo etwas einfrieren muss.** `[cmd]` In G-138 war das der
eigentliche Nachweis: Stack-Dosis geaendert, alte Einnahmen
unveraendert. `[read]` **Hier waere die Frage: wenn eine Uebung im
Katalog umbenannt oder geaendert wird, aendert sich dann ein
Trainingsprotokoll von letzter Woche?**

**Und der Fall, den es vielleicht nicht gibt.** `[read]` In G-122 gab
es keinen dritten Zustand, **weil er strukturell nicht entstehen
kann** — das war ein gueltiges Ergebnis.

### Was nicht zu tun ist

**Keine eigene Uebung anlegen koennen** — das ist **E-17**, eigene
Tabelle im Profil, und die Tabelle gibt es noch nicht.
**Keine Tabelle anlegen** — `supabase/_pipeline/` gehoert Codex, er
arbeitet an C-328.
**Kein Trainingsplan, keine Vorlagen** — nur Erfassung.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sitzung anlegen             Zeile da, `user_id` gesetzt
    Uebung hinzufuegen          haengt an der Sitzung
    Saetze eintragen            haengen an der Uebung
    abschliessen                Zustand unterscheidbar
    unterbrochen liegenlassen   was passiert - belegt
    Snapshots falls noetig      Gegenprobe wie in G-138
    Schreibstellen              Zahl, und welche Form
    Attrappen im neuen Code     Soll 0
    Rueckbau                    gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand   `node tools/schuss.mjs`

`[read]` **Negativprobe:** einen Satz an eine Uebung schreiben, die
nicht zur Sitzung gehoert. `[cmd]` **Pruef, ob ein Fremdschluessel das
erzwingt** — bei `medication_products` und `user_medications` war es
so, **und dann ist *,,strukturell ausgeschlossen"* das Ergebnis. Kein
Constraint loesen, um es doch zu zeigen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
