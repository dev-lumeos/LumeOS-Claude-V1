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

## Bericht

**Claude Code, 2026-09-02.** **Nicht committet, nichts auf
`dev@lumeos.app` geschrieben** (5 Slots, test-user 0, 2.899 meals —
vor und nach dem Lauf gleich).

**Web-Tests: 1.340 grün, 0 Fehler. Sabotageprobe: 28 von 28
gefangen.** `pnpm gate` bricht an **fremden Migrationen** (C-327a,
C-385, ungetrackt in `supabase/migrations/`) — nicht an dieser
Arbeit; Typecheck und Lint sind sauber.

### Zwei Auftragsfragen, gemessen

**1 · Was geschieht mit einer gelöschten Position?**

`[cmd]` **Gegen eine Wegwerf-Tabelle gemessen:**

    DELETE position=2, dann UPDATE 3 -> 2     geht
    UPDATE 3 -> 2, waehrend 2 noch steht      duplicate key

`[read]` **Der PK ist `(user_id, position)`, es gibt keine `id`.**
**Deshalb schreibt der Weg DELETE + INSERT, nicht UPDATE** — nach dem
Löschen ist der Nummernraum leer, und die Reihenfolge der Anweisungen
kann gar nicht kollidieren.

**2 · Wo kommt die Zeilenzahl im Planner her?** — **Drei Stellen**,
alle über `rasterZeilen`: `page.tsx:184`, `tab-vorlieben.tsx:1031`,
`plan-lesen.ts:226`.

`[cmd]` **Und `meal_plans` trägt keine Zeilenzahl** — keine Spalte
für `meals`, `slots` oder Zeilen.

`[read]` **Sie muss auch keine tragen.** `[cmd]` **Gemessen: alle vier
Herkünfte bringen ihre Struktur bereits mit** — `self_created`,
`coach_created`, `marketplace` und `buddy` tragen ihre
`meal_type`-Werte in `meal_plan_entries`. **Die Positionen sagen es
genauer als eine Zahl es könnte.**

**Codex braucht also KEINE Spalte.** Der Planner leitet die Reihen aus
dem geladenen Plan ab; nur ein leerer, selbst angelegter Plan fällt
auf die Vorlieben zurück.

### Was gebaut wurde

**1 · Die Liste in Preferences, links unten** (Kachel bei x=264).
Zwei Schritte: Anzahl nennen, dann je Zeile Name und Zeit. `[cmd]`
**Namen als `<datalist>`** — Auswahl **plus** Freitext, wie Tom es
verlangt; ein `<select>` verböte den freien Text, und `name` ist in
der Datenbank frei.

**Die G-72-Kachel *Mahlzeitenstruktur* bleibt** — Hauptmahlzeiten,
Snacks und Vorkochen liegen in `food_preferences` und werden mit
Allergien zusammen gelesen. `[read]` **Sie wird nicht überflüssig:**
`meals_per_day` steuert die Planzeilen, `meal_slots` benennt die
Tagebuchzeilen.

**2 · Initialwerte** aus den gemessenen Zeiten (07:30 / 12:30 / 19:30
für drei Mahlzeiten). **Erhöhen fügt an, senken kürzt von unten**,
eigene Namen überleben. `[cmd]` **Keine Obergrenze** — über sechs
füllt die Liste mit nummerierten Mahlzeiten auf, statt abzuschneiden.

**3 · `/v2/settings`: dasselbe Formular.** `[cmd]` **Ein Baustein,
zwei Aufrufer** — die Kollision aus G-72 fällt weg, weil `meal_slots`
eine eigene Tabelle mit eigenem Schreibweg ist.

**4 · Tagebuch und Planner lesen die Slots.** `[cmd]` **Am Schirm:**
*Frühstück · Mittagessen · Nachmittagssnack · Abendessen* statt der
festen Bezeichnungen. **Der Planner meldet: *,,4 Reihen aus diesem
Plan"*.**

### Eine Grenze, die der Auftrag nicht nannte

`[cmd]` **Ohne sie fände 22:00 das Abendessen um 19:30** — 150
Minuten entfernt. **Das ist keine Zuordnung, das ist der nächstbeste
Rest** — und Toms Satz sagt das Gegenteil: *,,wer um 22:00 noch isst,
hat dafuer keinen Slot."*

`[cmd]` **Gemessen an den dev-Slots:** die Abstände zwischen
benachbarten Slots sind 164, 136, 210 und 210 Minuten. **Die Hälfte
des grössten ist 105.**

`[read]` **`MAX_ABSTAND_MIN = 120` liegt knapp darüber** — jede Zeit
ZWISCHEN zwei Slots wird noch zugeordnet, auch in der weitesten
Lücke; erst ausserhalb der Reihe fällt sie heraus.

**Am Schirm belegt:**

    22:00   "Fuer diese Zeit gibt es keinen Slot. Die Mahlzeit wird
             trotzdem erfasst und steht mit ihrer Uhrzeit da."
    12:20   "Wird bei Mittagessen (12:30) einsortiert."

### Punkt 5 — die Vermutung war falsch

**Tom:** *,,in diary unten mahlzeit hinzufuegen, das ist
verschwunden."*

`[cmd]` **Gemessen: der Weg ist NICHT mit G-331 verschwunden.**
`sicherstellen()` legt seit C-03 Mahlzeiten an, und der Code ist
gegen `HEAD` unverändert.

`[read]` **Es gab ihn nie für eine FREIE Mahlzeit:** leere Karten
entstehen je vordefiniertem Slot — **wer um 22:00 isst, hatte keine.**

`[cmd]` **Und `meal_time` wurde bis heute NIE gesetzt**
(`buildMealInsert`) — die 2.899 vorhandenen Zeiten kommen aus den
Seeds. **Ohne Schema-Erweiterung hätte die neue Mahlzeit keine Zeit,
und die Zuordnung liefe ins Leere.** Beides ergänzt, mit `null` als
Vorgabe für den Bestandsweg.

### Leerzustand

`[cmd]` **`test-user@lumeos.local`, 0 Slots:** *,,Noch keine
Mahlzeiten festgelegt. Nenne oben eine Anzahl."* **Plus ein Knopf
*Vier Mahlzeiten vorschlagen*** — ein Angebot, kein Fehler.

### Nachweis

    Liste          5 Zeilen, Anzahl-Feld 5, Kachel links (x=264)
    Namen          datalist mit 9 Vorschlaegen, Freitext moeglich
    Leerzustand    0 Zeilen, Hinweis + Angebot
    Settings       5 Zeilen, derselbe Baustein, Verweis bleibt
    Tagebuch       Fruehstueck, Mittagessen, Nachmittagssnack, Abendessen
    Planner        "4 Reihen aus diesem Plan"
    22-Uhr-Fall    kein Slot, trotzdem erfassbar
    Bilder         backup/g332-prefs.png, -settings.png, -diary.png,
                   -planner.png, -leer.png

### Gate und Sabotageprobe

    Web-Tests        1.340 gruen, 0 Fehler
    Typecheck/Lint   sauber
    Sabotageprobe    28 von 28 gefangen
    neuer Waechter   meal-slots.test.ts, 19 Proben

`[cmd]` **`pnpm gate` bricht an fremden Migrationen** — C-327a und
C-385 liegen ungetrackt in `supabase/migrations/` und enthalten
`INSERT`/`DELETE`. **Codex' laufende Arbeit, nicht diese.**

### Zwei Sabotagen kamen zuerst durch

`[cmd]` **`position: i + 1` steht auch in `slots-lage.ts`** — mein
Wächter suchte über die ganze Datei und fand das falsche Vorkommen.
**Jetzt im INSERT-Block geschnitten**, mit ausdrücklichem Ausschluss
von `position: s.position`.

`[cmd]` **Und die Vorab-Prüfung war ungeprüft** — dass `listenFehler`
VOR dem Schreiben läuft, hielt kein Wächter fest.
