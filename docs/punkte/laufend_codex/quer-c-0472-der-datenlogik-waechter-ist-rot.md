---
nr: C-472
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-471
entscheidung: null
beruehrt:
  dateien:
    - tools/migration-datenlogik-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  verletzungen: 15
---

# C-472 — der Datenlogik-Waechter ist rot

## Befund

Aus C-471, Claude Code, 2026-09-08:

> *,,`migration-datenlogik-pruefen.mjs` ist rot ? aber nicht wegen
> mir. `grep -c "c471"` -> 0. Er nennt FUENFZEHN aeltere,
> committete Migrationen (C-428 bis C-467)."*

> *,,Das ist der eigentliche Befund: solange er rot ist, faellt
> eine NEUE Verletzung nicht auf ? wer ihn laufen laesst, sieht
> ohnehin eine Liste."*

`[read]` **Ein Waechter, der immer rot ist, misst nichts.**

## Was die Regel sagt

`[cmd]` **`supabase/README.md`, D-17:**

> *,,Eine Migration darf keine Katalogdaten oder Ableitungen
> schreiben: `INSERT`, `UPDATE`, `COPY`, `DELETE`, `TRUNCATE` und
> `MERGE` gehoeren in einen nummerierten Schritt unter
> `_pipeline/`. Das gilt auch fuer Backfills."*

`[cmd]` **Eine benannte Ausnahme existiert:**
`public.handle_new_user()` **in der Baseline.**

## Was zu messen ist

**1** ? **Welche fuenfzehn, und was steht drin?**

`[cmd]` **C-428 bis C-467** ? **je Migration die Zeile, die
anschlaegt.**

`[read]` **Ist es eine echte Verletzung, oder erkennt der
Waechter etwas falsch?**

`[cmd]` **Der Orchestrator hat heute selbst 13 Treffer in einer
Migration gezaehlt, die alle Kommentare und `ON DELETE`-Klauseln
waren** ? **derselbe Fehler ist hier moeglich.**

**2** ? **Wenn es echte Verletzungen sind: umziehen oder als
Ausnahme benennen?**

`[read]` **Ein Backfill in einer alten Migration laesst sich nicht
mehr herausnehmen, ohne die Kette zu brechen** ? **miss, was
passiert.**

**3** ? **Der Sollstand.**

`[cmd]` **`punkte-pruefen.mjs` fuehrt einen Sollstand von 25
Befunden** ? **dieselbe Bauform.**

`[read]` **Ein Waechter mit bekanntem Altbestand meldet NEUE
Verletzungen, nicht alle.**

## Und die zweite Frage aus C-471

> *,,Jeder Agent kann ueber einen Interpreter nach `migrations/`
> schreiben. Wenn du das enger willst, muesste der Hook
> Interpreteraufrufe mitlesen, und das ist eine Entscheidung mit
> Folgekosten."*

`[read]` **Der Hook nennt die Luecke selbst:** *,,Damm gegen
Versehen, nicht gegen Absicht."*

`[read]` **Das ist eine Entscheidung fuer Tom** ? **enger machen
heisst, jeden Python- und Node-Aufruf zu lesen.**
