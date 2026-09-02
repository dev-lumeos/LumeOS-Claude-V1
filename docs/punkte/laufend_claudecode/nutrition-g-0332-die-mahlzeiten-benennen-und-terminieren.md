---
nr: G-332
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-72
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-vorlieben.tsx
zahlen: null
---

# G-332 — die Mahlzeiten benennen und terminieren

## Befund

Aus E-58, 2026-09-02.

Tom: *,,kuenftig sagt man wieviele mahlzeiten man hat und dann
definiert man jede einzelne mit zeit und namen."*

`[cmd]` **Heute steht in Preferences die Kachel *Mahlzeitenstruktur*
mit drei Zahlen** (G-72) — **Hauptmahlzeiten, Snacks, Vorkochen.**

`[read]` **Was fehlt: der Ort, an dem der Nutzer Name und Zeit einmal
definiert, statt sie je Eintrag zu wiederholen.**

## Was zu bauen ist

**Zwei Schritte:** Anzahl nennen, **dann jede Zeile mit Zeit und
Namen.**

    3   Fruehstueck        07:30
        Mittag             12:30
        Abend              19:30

`[read]` **Namen als Vorschlagsliste plus Freitext** — die
gaengigsten als Auswahl, **der Rest ist Eingabe.**

`[cmd]` **Initialwerte aus `meals_per_day` und `snacks_per_day`**,
**mit den gemessenen Zeiten** (07:30 / 12:30 / 16:00 / 19:30) —
**dann editierbar.**

## Drei Orte

    Preferences   linke Seite unten
    Settings      /v2/settings
    Onboarding    spaeter (G-222)

`[cmd]` **Die Kollision aus G-72 faellt weg:** `/v2/settings` schrieb
nach `user_profiles`, die Struktur lag in `food_preferences`.
`[cmd]` **Mit `meal_slots` als eigener Tabelle kann Settings direkt
darauf schreiben.**

## Und die Anzeige

`[cmd]` **Tagebuch und Planner lesen die Slots statt `SLOT_LABEL`.**

`[read]` **Die Zuordnung macht die Zeit** — **naechstliegende
Slot-Zeit, ohne gespeicherte Kennung.**

`[read]` **Wer die Slot-Zeit spaeter verschiebt, sieht alte Eintraege
anders gruppiert** — **aber kein gespeicherter Wert aendert sich.**

## Auftrag — die Mahlzeiten benennen und terminieren

**Beauftragt am 2026-09-02.** `[cmd]` **C-392 ist gebaut** — die
Tabelle steht.

### Die Tabelle, gemessen

    nutrition.meal_slots
      user_id       uuid
      position      integer
      name          text
      planned_time  time
      PRIMARY KEY (user_id, position)

`[cmd]` **Vier Policies: select, insert, update, delete.**
`[cmd]` **Keine `id`** — der Schluessel ist `(user_id, position)`.

`[cmd]` **`dev@lumeos.app` traegt fuenf Slots:**

    1  Fruehstueck        07:30
    2  Snack              10:14
    3  Mittagessen        12:30
    4  Nachmittagssnack   16:00
    5  Abendessen         19:30

`[cmd]` **`test-user` traegt null** — er hat weder Preferences noch
Meals (C-394). `[read]` **Das ist der Leerzustand, den du auch
abbilden musst.**

`[cmd]` **Und `meals_per_day` hat keinen CHECK mehr** — es gibt keine
Obergrenze.

### 1 · Die Liste in Preferences, linke Seite unten

Tom: *,,kuenftig sagt man wieviele mahlzeiten man hat und dann
definiert man jede einzelne mit zeit und namen."*

**Zwei Schritte:** Anzahl nennen, **dann je Zeile Name und Zeit.**

    Anzahl  [5]

    1  [Fruehstueck      v]  [07:30]
    2  [Snack            v]  [10:14]
    3  [Mittagessen      v]  [12:30]

`[read]` **Namen als Auswahlliste plus Freitext** — Tom: *,,die
gaengigsten als pulldown zur verfuegung stellen plus manuelle
eingabe."*

`[cmd]` **Heute steht dort die Kachel *Mahlzeitenstruktur* mit drei
Zahlen** (G-72). `[read]` **Sie bleibt** — Hauptmahlzeiten, Snacks
und Vorkochen sind etwas anderes als die Slotliste. `[read]`
**Oder du misst, dass sie ueberfluessig wird, und sagst es.**

### 2 · Die Initialwerte

`[cmd]` **Aus `meals_per_day` und `snacks_per_day`**, **mit den
gemessenen Zeiten** — nicht mit geratenen.

`[read]` **Wer die Anzahl erhoeht, bekommt neue Zeilen mit
Vorschlagswerten** — **wer sie senkt, verliert Zeilen von unten.**
`[read]` **Miss, was mit einer geloeschten Position geschieht, deren
Nummer eine andere braucht.**

### 3 · Und in `/v2/settings`

Tom: *,,es soll in settings sowie spaeter in das onboarding."*

`[cmd]` **Die Kollision aus G-72 faellt weg:** `/v2/settings` schrieb
nach `user_profiles`, die Struktur lag in `food_preferences`.
`[cmd]` **`meal_slots` ist eine eigene Tabelle** — **Settings kann
direkt darauf schreiben.**

`[read]` **Ein Formular, zwei Orte** — **nicht zwei Formulare.**

### 4 · Die Anzeige liest die Slots

`[cmd]` **Tagebuch und Planner lesen heute `SLOT_LABEL`.**

`[read]` **Die Zuordnung macht die Zeit** — **naechstliegende
Slot-Zeit, ohne gespeicherte Kennung.** `[cmd]` **0 von 2.899 `meals`
sind ohne `meal_time`** (C-392).

`[read]` **Wer die Slot-Zeit spaeter verschiebt, sieht alte
Eintraege anders gruppiert** — **aber kein gespeicherter Wert aendert
sich.** **Das ist gewollt** (E-58).

`[read]` **Miss, ob der Planner dasselbe braucht** — dort gibt es
keine tatsaechliche Zeit, `meal_plan_entries.planned_time` **ist die
Slot-Zeit.**

### 5 · Eine Mahlzeit im Tagebuch anlegen — sie ist verschwunden

Tom, 2026-09-02: *,,in diary unten mahlzeit hinzufuegen, das ist
verschwunden. ein user kann auch jederzeit im diary eine neue
mahlzeit anlegen und nutrients reinpacken."*

`[read]` **Vermutung: mit `HinzufuegenModal` in G-331
mitgegangen** — **380 Zeilen aus C-03 entfernt.** `[read]` **Miss
es, bevor du baust.**

`[cmd]` **Und mit den Slots wird es eine andere Sache:** **eine neue
Mahlzeit braucht Name und Zeit.**

`[read]` **Naheliegend: die Slots als Vorschlag, aber frei** —
**wer um 22:00 noch isst, hat dafuer keinen Slot und soll trotzdem
erfassen koennen.** `[read]` **Das folgt E-58: der Slot ordnet, die
Buchung ist die Wahrheit.**

### 6 · Dieselbe Logik im Planner

Tom: *,,dieselbe logik soll auch in den planner, man soll auch da
beim erstellen oder editieren definieren koennen wieviele mahlzeiten
man will. bei gekauften oder von coach wird der plan ja vollstaendig
geliefert. und das muss sich ueber den workflow durchziehen."*

`[cmd]` **Heute rechnet `rasterZeilen` die Zeilen aus
`meals_per_day` und `snacks_per_day`** — **den Vorlieben des
Nutzers.**

`[read]` **Das ist fuer einen eigenen Plan richtig** — **aber ein
gekaufter oder vom Coach vergebener bringt seine eigene Struktur
mit.**

`[read]` **Also gehoert die Zahl an den Plan, nicht nur an die
Vorlieben:**

    self_created     Vorgabe aus den Vorlieben, beim Anlegen
                     aenderbar
    coach_created    kommt mit dem Plan
    marketplace      kommt mit dem Plan
    buddy            kommt mit dem Plan

`[cmd]` **`meal_plans` traegt heute keine Slot- oder Zeilenzahl** —
**miss es und melde, wenn Codex eine Spalte bauen muss.**

`[read]` **Und E-45 gilt:** **ein gekaufter Plan ist editierbar** —
**wer die Mahlzeitenzahl aendert, aendert seinen Plan, nicht die
Vorlage.**

`[read]` **Das ist der Teil, der sich *ueber den Workflow
durchzieht*:** Plan anlegen, Plan aktivieren, Ghost Entries,
Tagebuch. `[cmd]` **Miss, wo die Zeilenzahl heute ueberall
herkommt** — **und sag, wie viele Stellen es sind, bevor du eine
aenderst.**

### Was nicht zu tun ist

**`meal_type` nicht anfassen** — es hoert auf, eine Bedeutung zu
haben, mehr nicht.
**Kein Onboarding** — das ist G-222.
**Nichts auf `dev@lumeos.app` schreiben** — die fuenf Slots stehen
dort zum Ansehen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Liste            Anzahl aendern, Zeilen folgen
    Namen            Auswahl plus Freitext, beides belegt
    Leerzustand      ein Konto ohne Slots -- was steht da
    Settings         dasselbe Formular, ein Schreibweg
    Tagebuch         Zeilen heissen wie die Slots
    Planner          gemessen: braucht er sie auch
    neue Mahlzeit    im Tagebuch anlegen, mit Name und Zeit
    22-Uhr-Fall      ohne passenden Slot erfassbar
    Plan-Zeilenzahl  woher kommt sie heute, an wie vielen Stellen
    fremder Plan     bringt seine Struktur mit, gemessen
    Bildschirmfoto   vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
