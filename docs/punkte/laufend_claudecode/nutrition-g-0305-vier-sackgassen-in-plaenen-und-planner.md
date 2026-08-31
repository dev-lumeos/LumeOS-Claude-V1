---
nr: G-305
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen:
  gemessen: 2026-08-31
  sackgassen: 4
---

# G-305 — vier Sackgassen in Plaenen und Planner

## Befund

Aus G-304, Claude Code, 2026-08-31. **Alle am Schirm gegangen.**

### 1 · *New plan* legt einen Plan an, den niemand fuellen kann

`[cmd]` **0 Wochen, 0 Tage, 0 Eintraege.** **Als C-372.**

### 2 · Der Planner meldet dann *,,kein Plan"*

`[cmd]` **Der Zweig ist `!d.plan || d.wochen.length === 0`** — **ein
Plan ohne Wochen wird als *kein Plan* gemeldet.**

### 3 · *New recipe* gibt veraltete Auskunft

`[cmd]` **Der Knopf im Planner sagt, die Rezepterstellung sei nicht
gebaut.** `[cmd]` **Seit G-289 ist sie es — einen Reiter weiter.**

`[read]` **Ein Knopf, der falsch informiert, ist schlimmer als
keiner.** `[cmd]` **Die Meldung nennt *G-97* als Grund** — **einen
Auftrag, der seit heute erledigt ist.**

### 4 · *Copy week* erklaert, dass es sich nicht gibt

`[cmd]` **Ein Dialog, der sagt, die Funktion existiere nicht.**

## Und zwei Dinge, die gar nicht laufen

`[cmd]` **Die Lebenszykluswahl wird gespeichert und nie ausgefuehrt**
— keine Funktion, kein Zeitplaner, `rollover_count` steht auf 0.

`[cmd]` **Ein abgelaufener Plan kann nicht beendet werden** — **kein
Knopf setzt `completed`, `paused` oder `archived`.**

`[read]` **Damit laufen Flow 11–13 nicht.** **Als C-373.**

## Toms Sicht, bestaetigt

*,,Meal plans hat irgendwelche anzeigen welche moeglicherweise plaene
sein koennen"* — `[cmd]` **5 Metadatenkarten, keine Tageseintraege.**

*,,dann gibts in planner einen editierbaren wochenplan, woher diese
daten darin kommen weiss niemand"* — `[cmd]` **aus dem C-150-Seed.**

*,,und dann gibts unter rezepte die 3 rezepte anlegbar, editierbar,
anschaubar"* — `[cmd]` **Flow 7 und Flow 8 gehen vollstaendig durch.**

## Auftrag — die vier Sackgassen schliessen

**Beauftragt am 2026-08-31.**

`[read]` **Du hast sie in G-304 gefunden. Jetzt weg damit.**

`[read]` **Drei der vier brauchen keine Entscheidung** — sie geben
falsche oder leere Auskunft.

### 1 · *New recipe* im Planner

`[cmd]` **Der Knopf sagt, die Rezepterstellung sei nicht gebaut, und
nennt G-97.** `[cmd]` **Seit G-289 ist sie gebaut, einen Reiter
weiter.**

`[read]` **Entweder er fuehrt dorthin, oder er verschwindet.**
**Ein Knopf, der falsch informiert, ist schlimmer als keiner.**

### 2 · *Copy week*

`[cmd]` **Ein Dialog, der erklaert, dass es die Funktion nicht
gibt.**

`[read]` **Dasselbe: fuehren oder verschwinden.** `[read]` **Und wenn
er bleiben soll, sag was er tun muesste** — **C-370 vermutet, dass
*eine Woche sichern* der eigentliche Weg zu einem Plan ist.**

### 3 · *,,Es liegt kein Plan vor"* bei einem Plan ohne Wochen

`[cmd]` **Der Zweig ist `!d.plan || d.wochen.length === 0`.**

`[read]` **Ein Plan ohne Wochen ist kein fehlender Plan** — **er ist
ein leerer.** **Das gehoert unterschieden und gesagt.**

`[cmd]` **Und der Hinweis darf sagen, dass es keinen Weg gibt, ihn zu
fuellen** — **das ist C-372, und es ist die Wahrheit.**

### 4 · *New plan*

`[cmd]` **Das Formular erzeugt einen Plan mit 0 Wochen.** `[cmd]`
**`meal_plan_weeks` hat keinen Schreibweg** (C-372).

`[read]` **Solange das so ist, darf der Knopf nicht so tun, als
entstuende ein Plan.** `[read]` **Entweder er verschwindet, oder er
sagt, was er erzeugt und was fehlt.**

`[read]` **Der Orchestrator hat dieses Formular erfunden** —
`SPEC_03` Flow 3 kennt kein Anlegen. **Das gehoert dazugesagt, nicht
kaschiert.**

### Was nicht zu tun ist

**Keinen Schreibweg fuer Wochen bauen** — das ist C-372 und braucht
Toms Entscheidung.
**Keine Attrappe durch eine andere ersetzen.**
**Nichts auf `dev@lumeos.app`** — deine eigene Lehre: eine Probe, die
schreiben kann, gehoert nicht auf ein unantastbares Konto.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    je Knopf         fuehrt / weg / sagt die Wahrheit
    leerer Plan      wird als leer gemeldet, nicht als fehlend
    Attrappen        am Schirm, vorher / nachher
    Wege gegangen    am Schirm, nicht im Code gelesen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
