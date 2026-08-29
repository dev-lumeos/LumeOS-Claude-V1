---
nr: G-271
typ: messung
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---
# G-271 — Meal plans und Planner gegen die Quellen halten

## Befund

**Tom, 2026-08-29:** *,,meal plans (gegenchecken mit specs und altem
repo, da fehlt einiges)"* und *,,planner ebenfalls alles
gegenchecken, das ist nur irgendeine uebersicht oder darstellung"*.

`[read]` **Zwei Reiter, dieselbe Frage: was verlangt die Spec, und
was steht da?**

`[cmd]` **`SPEC_03_USER_FLOWS` fuehrt fuenf Ablaeufe zu Plaenen** —
Plan-Aktivierung, Ghost Entry bestaetigen in vier Faellen, und den
Plan-Lebenszyklus in drei Varianten.

`[cmd]` **`SPEC_10_COMPONENTS` nennt neun Komponenten:**
`MealPlanList`, `MealPlanCard`, `MealPlanDetail`,
`MealPlanActivationModal`, `MealPlanDayView`,
`MealPlanComplianceBar`, `GhostEntryList`, `LifecyclePicker`, dazu
`ShoppingListView`.

`[read]` **Der Planner steht in keiner dieser Listen** — **was er
sein soll, ist die erste Frage.**

## Auftrag — Meal plans und Planner, gegen die Quellen

**Mitbeauftragt: G-267, G-268, G-269, G-270, G-265, G-266.**
Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[read]` **Und die Befunde kommen von Tom, nicht von mir** — er ist
das Modul am 29.08. durchgegangen. **Seine Worte stehen je Punkt
woertlich drin.**

`[cmd]` **Der gebaute `/v2/`-Stand ist der Massstab.** `theme-v1`
nachschlagen, wenn etwas fehlt und die Frage ist, wie es gemeint war.
**Der Baum ohne `/v2/` bleibt unberuehrt.**

### 1 · Messen, bevor gebaut wird

**Tom:** *,,meal plans (gegenchecken mit specs und altem repo, da
fehlt einiges)"* und *,,planner ebenfalls alles gegenchecken, das ist
nur irgendeine uebersicht oder darstellung"*.

`[cmd]` **`SPEC_10_COMPONENTS` nennt neun Plan-Komponenten**,
`SPEC_03_USER_FLOWS` fuenf Ablaeufe. `[read]` **Je Komponente ein
Urteil: gebaut, fehlt, oder ueberholt.**

`[read]` **Der Planner steht in keiner dieser Listen** — **was er
sein soll, ist die erste Frage, nicht die letzte.** `[cmd]` **G-099
und G-072 fuehren dazu Befunde.**

### 2 · Was ohne Entscheidung gebaut werden kann

**G-265 — `+ Add` im Food DB oeffnet das falsche Modal.** `[read]`
**Miss, welches es oeffnet und welches es sein muesste.**

**G-267 — *New plan* tut nichts.** `[read]` **Ob der Knopf gebaut
werden kann, haengt an G-268 und den beiden Datenpunkten darunter.**

### 3 · Was gemeldet statt gebaut wird

**G-270 — die drei Attrappen im Meal-plans-Reiter.** `[cmd]` **Die
rechte Kachel sagt den Grund selbst:** *,,Lebenszyklus, Startdatum
und Bestaetigungsmodus fehlen im Schema."* `[cmd]` **C-238 und C-239
fuehren dieselbe Luecke.**

`[read]` **Keine drei Anzeigefehler, sondern eine Datenluecke mit
drei Symptomen** — **und das Schema gehoert Codex.**

**G-269 — Plaene von Coach und Marketplace.** `[read]` **Die Herkunft
ist mehr als ein Etikett:** ein Coach-Plan darf vermutlich nicht frei
bearbeitet werden. `[cmd]` **Das beruehrt `coach.client_autonomy` und
E-29** — Modulzugriffe auf `coach` gehen ueber eine Funktion.

### 4 · G-266 ist eine Entscheidung

`[read]` **Miss die drei Wege und leg sie mit Zahlen vor, entscheide
nicht.** Tom hat ausdruecklich um Vorschlaege gebeten.

### Was nicht zu tun ist

**Keine Tabelle anlegen, kein Schema aendern** — Codex hat den
Bereich.
**Keine zweite Ansicht neben eine bestehende.** `[cmd]` **Dreimal
passiert**, in G-253 hast du es selbst verhindert.
**Nichts erfinden, wo Daten fehlen** — eine Kachel, die sagt was ihr
fehlt, ist besser als eine mit erfundenen Zahlen.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Spec-Komponente ein Urteil   gebaut / fehlt / ueberholt
    Planner                        was ist er heute, was soll er
                                   sein
    G-265                          welches Modal, welches waere
                                   richtig
    G-267                          gebaut oder begruendet nicht
    G-270                          woran genau haengt jede der drei
    G-266                          drei Wege mit Zahlen, nicht
                                   entschieden
    Attrappen                      am Schirm gezaehlt, vorher /
                                   nachher (A-59)
    Ladezeit                       ms je Reiter, kalt und warm
    Bildschirmfoto je Zustand      `node tools/schuss.mjs`

`[read]` **Die letzten Zeilen sind Pflicht, weil dieser Auftrag breit
ist** — **ein Bericht ohne Zahlen waere hier nicht pruefbar.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60**, und **`.limit()` hebt den
PostgREST-Deckel nicht auf.**
`[cmd]` **Und ein `await` in einer Schleife kostet je Durchlauf voll**
— dein eigener Befund aus G-252.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
