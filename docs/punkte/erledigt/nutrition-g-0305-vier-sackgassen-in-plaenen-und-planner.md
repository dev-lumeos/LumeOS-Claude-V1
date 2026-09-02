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
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 13c12f6f
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


## Auftrag

**Mitbeauftragt mit G-331 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit G-331 abgenommen:** einer von sechs galt noch.

`[cmd]` **Fuenf waren durch C-372, C-373 und G-319 erledigt.**

`[cmd]` **Der sechste: ein `InEntwicklungKnopf` mit *,,der
Schreibpfad im Browser ist nicht Teil dieses Auftrags"*** — **und der
Schreibpfad steht seit C-372.**

`[read]` **Die Attrappe log ueber ihren eigenen Zustand.**
