---
nr: C-241
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: ["nutrition.meal_plans", "medical.user_medications"]
  dateien: []
zahlen: null
---

# C-241 - Das Nachweiskonto traegt weder Essensplaene noch Medikamente

## Befund

(neu 2026-08-23). Aus der Pruefung von G-161 und der
  Vorbereitung von G-162.

  `[cmd]` `nutrition.meal_plans` — gesamt 2, `dev@lumeos.app` 1,
  **`test-user@lumeos.local` 0**. Ebenso Wochen 6/3/0, Tage 42/21/0,
  Eintraege 112/56/0.
  `[cmd]` `medical.user_medications` — gesamt 2, `dev` 1,
  **`test-user` 0**.

  `[read]` **Die Folge ist konkret, nicht theoretisch:** G-161 musste
  seinen Nachweis auf `dev@lumeos.app` fuehren, gegen die Regel. Und
  **G-162 ist in seinem medical-Teil gar nicht beauftragbar** — der
  Punkt nennt *„`user_medications` 2"*, das ist die Gesamtzahl. Ein
  Agent saehe auf dem Nachweiskonto eine leere Liste und koennte nicht
  belegen, dass die Kachel liest.

  `[read]` **Beides ist in der Uebergabe als *bewusst leer* vermerkt.**
  Die Entscheidung ist also nicht *„vergessen"*, sondern *„soll das so
  bleiben"* — und wenn ja, wie ein Agent dort etwas belegen soll.
  Seeds gehoeren in die Kette, also zu Codex.

## Auftrag — das Nachweiskonto

**Mitbeauftragt: G-334, C-366.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-241 und G-334 sind derselbe Punkt

`[cmd]` **Du hast in C-394 gemessen:** `test-user@lumeos.local`
**hat keine Preferences, keine Meals und liegt nicht im
historischen Zwei-Konten-Seed.**

`[cmd]` **Und null `meal_slots`, waehrend `dev` fuenf traegt.**

`[read]` **Die Regel sagt: Nachweise werden auf `test-user`
gefuehrt** — **Laeufe auf `dev` ueberschreiben Toms gespeicherte
Einstellungen.**

`[read]` **Aber ein Konto ohne Daten kann nichts belegen.** `[read]`
**Und die Folge ist gemessen:** **in G-311 baute ein Agent seine
Buehne dort, raeumte sie weg, und der Nachweis existierte nicht mehr,
als der Orchestrator abnahm.**

### Was zu entscheiden ist — von dir vorgeschlagen, nicht entschieden

`[read]` **Bekommt `test-user` einen Grundbestand?**

`[cmd]` **Miss, was ein Nachweis heute braucht:** Plaene, Mahlzeiten,
Protokollzeilen, Slots, Vorlieben. `[cmd]` **`dev` traegt inzwischen
vier Plaene, sechs Logzeilen, fuenf Slots** — **vom Orchestrator
angelegt.**

`[read]` **Sag, was ein Seed abdecken muesste, und was er kosten
wuerde** — **jeder Kettenlauf schreibt ihn neu.**

### 2 · C-366 — der Pflegeweg fuer `food_tags`

`[cmd]` **E-55 entscheidet die zweite Tabelle, dein Entwurf aus
C-387 steht.**

`[read]` **Jetzt bauen** — Tabelle, RLS, **und der Leseweg, der
Import und Kuration vereint.**

`[cmd]` **Vier Schreiber wirken nur auf ihre eigene Tabelle:** 020,
027, 032, 221.

`[cmd]` **`apps/admin` hat eine Kurationsseite, 314 Zeilen,
vollstaendig lesend.** `[read]` **Der Schreibweg dorthin ist ein
UI-Auftrag, nicht deiner.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` loeschen** — die vier Plaene und fuenf
Slots stehen dort, damit Tom etwas sieht.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    test-user        was fehlt, je Tabelle gezaehlt
    Seed-Vorschlag   was er abdecken muesste, was er kostet
    food_tags_kur.   live, RLS, Leseweg vereint beide
    Entfernt-Zeile   ueberlebt einen Importlauf, belegt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
