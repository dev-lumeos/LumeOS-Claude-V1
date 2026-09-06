---
nr: G-352
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-222
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  goal_type: 4
  difficulty_level: 5
  adr: 12
---

# G-352 — drei Zielskalen widersprechen sich

## Befund

Aus G-83, Claude Code, 2026-09-07.

`[cmd]` **Nachgemessen in `goals.user_goals`:**

    goal_type          body_composition, performance, health,
                       lifestyle                          -- 4
    difficulty_level   easy, moderate, challenging,
                       aggressive, unrealistic            -- 5

`[cmd]` **Der ADR nennt zwoelf Zielarten** — **sie passen zu keiner
der beiden Tabellen.**

`[cmd]` **11 Zeilen liegen im Bestand.**

## Warum es blockiert

`[read]` **Der Onboarding-Entwurf hat einen Schritt *Ziel
waehlen*.** `[read]` **Welche Skala er zeigt, ist nicht
entschieden.**

`[read]` **Und `goal_type` ist Pflicht** — **wer ein Ziel anlegt,
muss einen der vier Werte setzen.**

## Zu entscheiden

`[read]` **Welche Skala gilt?**

`[read]` **Die vier `goal_type`-Werte sind Kategorien** —
*Koerperzusammensetzung*, *Leistung*, *Gesundheit*, *Lebensstil*.

`[read]` **Die zwoelf des ADR sind vermutlich konkrete Ziele** —
*abnehmen*, *Muskeln aufbauen*, *Marathon*.

`[cmd]` **`subtype` steht daneben und ist optional** — **das koennte
der Ort fuer die zwoelf sein.**

`[read]` **Dann waeren es keine drei Skalen, sondern zwei Ebenen:**
**vier Kategorien, zwoelf Unterarten.**

`[read]` **Zu pruefen, bevor eine dritte entsteht.**

## Gemessen am 2026-09-06 (G-353)

**Die Pruefung, die dieser Punkt verlangt** — *,,zu pruefen, bevor
eine dritte entsteht"* — **ist gelaufen. Der Verdacht stimmt, und er
greift weiter.**

`[cmd]` **`subtype` ist `text`, nullable, OHNE CHECK** — eine freie
zweite Ebene. **Und schon belegt:** `cut`, `gain_muscle`,
`strength`, `training_capacity`, `cardio_frequency` unter den vier
`goal_type`.

`[cmd]` **Die zwoelf des ADR sind keine Zielarten, sondern PHASEN.**
**`goals.goal_phases.phase_type` steht live mit neun Werten:**
`fat_loss`, `lean_bulk`, `maintenance`, `recomp`, `contest_prep`,
`reverse_diet`, `expert_bb_annual`, `mini_cut`, `peak_week`.

`[cmd]` **Fuenf davon stehen woertlich in der Liste, aus der der ADR
zitiert** (`docs/BrainstormDocs/Core/auth_API.md:224`) — **und die
traegt FUENFZEHN Werte, nicht zwoelf.**

`[read]` **Jene Liste vermischt grob und fein** (`bulk` neben
`lean_bulk`). **Das laufende Schema hat genau das aufgeloest.**

`[cmd]` **Berichtigt: `difficulty_level` ist KEINE Zielskala**,
sondern die Schwierigkeit — eine Achse quer dazu. **Die Zahl 5 im
Kopf dieses Punktes zaehlt etwas anderes als die 4 und die 12.**

`[read]` **Es sind also vier Achsen, drei davon gebaut:**

    goal_type    WAS        4, CHECK, NOT NULL
    subtype      WELCHES    frei, kein CHECK
    phase_type   WIE        9, CHECK, live belegt
    variant      WIE STARK  frei, Vorgabe 'moderate'

**Was noch zu entscheiden bleibt, ist kleiner:**

    1  Bekommt `subtype` einen CHECK, oder bleibt er frei?
    2  Welche Achse setzt das Onboarding?
       (die Zielwerte lesen heute `profiles.nutrition_goal`,
        nicht `user_goals` - gemessen in G-83)

`[read]` **Keine Entscheidung ,,vier gegen zwoelf"** — **die Ebenen
existieren bereits.**

## Auftrag — vier Achsen, zwei Entscheidungen

**Mitbeauftragt: G-229, G-261.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-352 — was du gemessen hast, ausarbeiten

`[cmd]` **Du hast belegt: es sind vier Achsen, keine drei
widersprechenden Skalen.**

    goal_type          4 Werte, CHECK
    subtype            ohne CHECK, zweite Ebene
    phase_type         9 Werte -- die *zwoelf* des ADR
    difficulty_level   5 Werte, eine eigene Achse

`[read]` **Toms Verdacht traegt weiter als er selbst dachte.**

**Zwei kleine Entscheidungen bleiben** — **arbeite sie so aus, dass
Tom sie mit ja oder nein beantworten kann.**

`[read]` **Erstens: bekommt `subtype` einen CHECK?** `[cmd]`
**Miss, welche Werte heute drinstehen** — **eine freie Spalte mit
elf gelebten Werten ist etwas anderes als eine mit drei.**

`[read]` **Zweitens: welche Achse setzt das Onboarding?**
`[cmd]` **Du hast gemessen, dass die Ziele heute
`profiles.nutrition_goal` lesen, nicht `user_goals`.**

`[read]` **Das ist der wichtigere Befund** — **eine fuenfte Stelle,
die niemand als Achse gezaehlt hat.** `[read]` **Miss, wer sie
schreibt und wer sie liest.**

### 2 · G-229 — Admin-Override

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit C-31 gibt es `curate_food_tag` mit Rechteschranke in
der Datenbank** — **Nicht-Admins abgewiesen.**

### 3 · G-261 — Vergleichsfunktionen

`[cmd]` **Der Punkt wartet laut Notizen auf sich selbst
(Gate-Waechter).**

`[read]` **Miss, was er verlangt und was ihn blockiert.**

### Was nicht zu tun ist

**Keine fuenfte Achse.**
**Nichts in `supabase/` aendern** — **ein CHECK ist Codex' Arbeit.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    subtype        welche Werte gelebt, gezaehlt
    nutrition_goal wer schreibt, wer liest
    Vorlage        die zwei Fragen so, dass ja/nein reicht
    G-229, G-261   gilt / ueberholt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
