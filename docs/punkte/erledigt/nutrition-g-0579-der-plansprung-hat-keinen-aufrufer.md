---
nr: G-579
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-02
commit: d8008745
erledigt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-02

braucht: [G-535, G-555, G-571, G-578]
kind_von: G-571

quellen:
  - docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0555-derselbe-ladefehler-verschluckt-zwei-weitere-module.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
    - apps/web/src/app/v2/nutrition/plans-echt.tsx
    - apps/web/src/lib/fehler/ladefehler.ts

zahlen:
  gemessen: 2026-10-02
  aufrufer_vorher: 0
---

# Der Plansprung existiert in der Datenbank und wird von nichts benutzt

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-579: der Plansprung bekommt seinen
                                     Aufrufer
    Bereich: apps/web/src/app/v2/nutrition/
             apps/web/src/lib/nutrition/
             apps/web/src/lib/fehler/ladefehler.ts
    Fremd:   supabase/ gehoert Codex (A-87 laeuft dort, die
             Zeugenstaffel - und seine Meal-Plan-Proben beruehren
             diesen Punkt: er MELDET, was sie behaupten, und aendert
             nichts in apps/). docs/ gehoert dem Orchestrator, auch
             diese Punktdatei: der Bericht kommt als Antwort, nicht
             als Anhang hier.
    Stand:   2026-10-02

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md`.

## Der Befund

`[cmd]` **Null Aufrufer**, gezaehlt in `apps/web/src` und `packages/`:

    nutrition.meal_plan_set_next_plan(uuid, uuid)
      zuerst gebaut  05_user_tabellen/058b_recipes_meal_plans.sql:1205
      seit G-535     00_querschnitt/535_auth_uid_legacy_readers.sql:403
      REVOKE von PUBLIC und anon, GRANT an authenticated (:1291, :1301)

`[cmd]` **Live liegt sie seit G-577 in der `auth.uid()`-Fassung** —
alter GUC 0, `auth.uid()` 6, gemessen und gesichert in
`backup/g577-535-nachher.sql`. **Ein `42501` darf dich hier nicht
treffen; wenn doch, ist es ein Befund.**

`[cmd]` **Die Oberflaeche ist reichlich vorhanden**, und genau deshalb
ist dieser Punkt klein:

    tab-plans.tsx · plans-echt.tsx · plan-detail.tsx · plan-modal.tsx
    plan-eintraege.tsx · plan-eintrag-editor.tsx · plan-werkbank-ui.tsx
    tab-planner-echt.tsx

`[read]` **Was fehlt, ist der eine Griff: welcher Plan als naechster
gilt.** Die Funktion nimmt zwei UUIDs — pruef gegen `pg_proc`, welche,
und was sie zurueckgibt, **bevor** du einen Aufruf schreibst.

## Auftrag

**A1 — die Signatur zuerst messen, dann bauen.** `[cmd]` `pg_proc` mit
`prokind = 'f'` (sonst wirft `pg_get_functiondef`
`"array_agg" is an aggregate function`). **Melde, was die Funktion selbst
tut** — bei G-578 legte `import_lab_report_rows` den Bericht selbst an,
und wer vorher eine Zeile geschrieben haette, haette zwei erzeugt.
**Dieselbe Frage hier: setzt sie den vorigen Plan selbst inaktiv?**

**A2 — der Aufrufer an der Stelle, an der ein Nutzer das entscheidet.**
`[read]` **Nicht irgendwo, wo er technisch passt** — wo im Mockup und in
den vorhandenen Reitern die Wahl des naechsten Plans hingehoert. Melde,
warum dort.

**A3 — die Fachmeldungen bekommen Texte** in `lib/fehler/ladefehler.ts`,
querliegend wie seit G-555. `[cmd]` **G-578 hat dort sieben Meldungen
eingetragen und dabei gefunden, dass `fehlerart()` die SQLSTATEs 28000
und 42501 nicht kannte** — pruef, ob die Rumpfmeldungen dieser Funktion
schon abgedeckt sind, und trag nur nach, was fehlt.

**A4 — ein Vermerk, der im Weg steht, ist eine Behauptung.** `[cmd]`
**Zwei Punkte hintereinander haben einen falschen Vermerk gefunden:**
G-577 (`body_measurements` statt `body_circumferences`, Schreibweg
"fehlt" seit G-535 vorhanden) und G-578 (die zweite Haelfte falsch).
**Wenn hier ein `InEntwicklungKnopf` oder eine `@abwesend`-Marke steht:
nachmessen, und wenn sie faellt, im Bericht sagen, welche Haelfte.**

**A5 — ein Waechter, der den AUFRUF zaehlt, nicht den Namen.** `[cmd]`
**G-578 hat ihn an einem Kommentar geeicht** (`katalog-suche.tsx:20`) —
dasselbe hier. **Mit entferntem Aufruf muss er rot werden.**

**Nicht Teil:** `coach.raise_alert` (apps/coach, eigener Punkt), die
Funktion selbst (G-535, erledigt) und das Erkennungsergebnis aus G-578
(`store_lab_report_ocr_result` hat einen Weg, aber keine Quelle — das
bleibt ein offener Befund, kein Auftrag).

**Zu belegen:** die Aufrufzahl vorher und nachher · ein Plansprung durch
die echte Oberflaeche auf `test-user@lumeos.local`, zurueckgelesen · die
Attrappenzahl des Reiters vorher und nachher, sie darf nicht sinken · der
Fehlertext einmal ausgeloest · Sabotage je Waechter in beide Richtungen ·
Testdaten danach entfernt mit Bestandszahl · `pnpm gate` gruen mit
Testzahl · nichts committen.

`[read]` **Kein voller Kettenlauf als Nachweis** (00-LIESMICH.md) — die
Funktion ist gebaut und live, du rufst sie auf.

---

## Abnahme — 2026-10-02, Commit `d8008745`

`[cmd]` **Gezaehlt am Ergebnis:**

| Merkmal | gezaehlt |
| --- | --- |
| `.rpc('meal_plan_set_next_plan', …)` | genau 1 — `lib/nutrition/plansprung-write.ts:69` |
| Waechter | `lib/nutrition/__tests__/g579-plansprung.test.ts:76` haelt genau diese Zeile als Text |
| neue Dateien | `plansprung.ts`, `plansprung-write.ts`, `app/v2/nutrition/plansprung-aktionen.ts` |
| `ZYKLUS_WAEHLBAR` in `plan-werkbank.ts:450` | zwei Werte; `sequence` kommt bedingt dazu (`plan-werkbank-ui.tsx:245`) |
| Fachtexte in `lib/fehler/ladefehler.ts:181-200` | 3 — Selbstbezug, Quellplan fehlt, Folgeplan fehlt |
| Bilder | 4 in `docs/bilder/g579/` |
| Gate beim Commit | **gruen**, 18 von 18 Tasks — der erste saubere Gate-Commit des Tages |
| Commit | `d8008745`, 12 Dateien, +629/−18 |

`[read]` **A1 ist die wertvollste Antwort des Berichts, und sie ist
gemessen:** die Funktion aktiviert nichts, sie verknuepft — setzt dabei
aber `lifecycle_type = 'sequence'` und `next_plan_id` **in einem Zug**,
weil `meal_plans_sequence_target_check` beide koppelt. `[cmd]` **Ein
PATCH mit `lifecycle_type` allein ergibt `23514`.** Daraus folgt der
einzige Bauentscheid: bei `sequence` schickt der Aktivierungsweg
`lifecycle_type` nicht mit. **Zwei Schreiber fuer eine gekoppelte Regel
waeren zwei Wahrheiten** — ein Waechter haelt das fest.

`[cmd]` **A2 hat eine Falle vermieden, die ich im Auftrag nur geahnt
habe:** `MealPlanActivationModal` sieht wie der richtige Ort aus, ist
aber **seit G-319 toter Code ohne Aufrufer**. Der Aufruf steht in
`AktivierenFrage`, die zwei lebende Aufrufer hat. **„Technisch passend"
haette den Griff an eine unerreichbare Stelle gelegt** — das ist der
zweite Fund dieser Klasse an zwei Tagen und wird G-581.

`[read]` **A4: der Vermerk war diesmal RICHTIG.** Drei Stellen sagten,
`sequence` sei nicht speicherbar, und `23514` belegt es. **Anders als bei
G-577 und G-578 fehlte nicht die Messung, sondern der Griff** — gebaut
war nur die Gegenseite, mit null Aufrufern. Das ist der Unterschied
zwischen einem falschen Vermerk und einem eingeloesten.

`[cmd]` **Mein Fehler, und er steht im Commit:** die drei Fachtexte
liegen nicht in `d8008745`, sondern im vorigen Commit `31ebb74e`
(G-578). Ich habe `lib/fehler/ladefehler.ts` als **ganze Datei** gestagt,
waehrend dieser Punkt schon daran schrieb. **Der Code ist richtig, die
Zuordnung in der Geschichte ist um einen Commit verschoben.** Ursache und
Gegenmassnahme stehen in A-93.

`[read]` **Ein Befund zum Entscheiden, nicht gebaut:** die Datenbank
erlaubt einen Ringschluss (A → B und B → A, beide CHECKs zufrieden). Der
Agent hat **keine Regel erfunden** — `moeglicheFolgeplaene` schliesst nur
den Plan selbst aus, weil der Rumpf das verlangt. **Ob ein Zyklus
unterbunden gehoert, ist eine Schemafrage: G-580.**
