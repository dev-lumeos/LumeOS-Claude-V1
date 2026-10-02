---
nr: G-582
typ: fehler
modul: coach
schwere: mittel
angelegt: 2026-10-02
commit: fd2a086c
erledigt: 2026-10-02
beauftragt: 2026-10-02
agent: claudecode

braucht: [G-535, G-571]
kind_von: G-571

quellen:
  - docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md
  - docs/punkte/erledigt/nutrition-g-0579-der-plansprung-hat-keinen-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/coach/src/components/tab-alerts.tsx
---

# Der Coach-Alarm hat keinen Aufrufer

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-582: coach.raise_alert bekommt seinen
                                     Aufrufer
    Bereich: apps/coach/src/
    Fremd:   apps/web/ ist dein eigener Bereich, aber nicht Teil
             dieses Punktes. supabase/ gehoert Codex (A-87). docs/
             gehoert dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

`[cmd]` **Gezaehlt am 2026-10-02:** `coach.raise_alert`
(`535_auth_uid_legacy_readers.sql:7`) hat **null Aufrufer** in `apps/`
und `packages/` — der vierte und letzte Weg aus G-571.

`[cmd]` **Die Oberflaeche existiert:**
`apps/coach/src/components/tab-alerts.tsx`. Der Reiter zeigt Alarme;
erzeugt werden kann keiner.

`[cmd]` **Live liegt die Funktion seit G-577 in der
`auth.uid()`-Fassung** (alter GUC 0, `auth.uid()` 6) — ein `42501` darf
dich nicht treffen; wenn doch, ist es ein Befund.

## Auftrag

**A1 — Signatur gegen `pg_proc` messen** (`prokind = 'f'`), **bevor** du
schreibst, und melden, was die Funktion selbst tut. `[cmd]` Bei G-578
legte sie den Bericht selbst an, bei G-579 setzte sie zwei gekoppelte
Spalten in einem Zug. **Eine Annahme ueber die Form hat hier zweimal
fast den ganzen Aufrufer falsch gebaut.**

**A2 — den Aufrufer dorthin, wo ein Coach das wirklich tut**, und
begruenden, warum dort. `[cmd]` **Pruef zuerst, ob die Stelle lebt:** bei
G-579 war `MealPlanActivationModal` seit G-319 toter Code und sah wie der
richtige Ort aus.

**A3 — Fachmeldungen** in `lib/fehler/ladefehler.ts`, falls `apps/coach`
darauf zugreifen kann; wenn nicht, melde, wo der Ort fuer Coach-Texte
ist — **und erfinde keinen zweiten.**

**A4 — ein Waechter, der den Aufruf zaehlt, nicht den Namen.** Mit
entferntem Aufruf rot.

**Zu belegen:** Aufrufzahl vorher und nachher · ein Alarm durch die echte
Oberflaeche auf `test-user@lumeos.local` (oder dem Coach-Konto, dann
nennen welches), zurueckgelesen · Attrappenzahl des Reiters vorher und
nachher · Testdaten entfernt mit Bestandszahl · `pnpm gate` gruen mit
Testzahl · nichts committen.

`[read]` **Kein Kettenlauf** — die Funktion ist gebaut und live.

---

## Abnahme — 2026-10-02, Commit `fd2a086c`

`[cmd]` **Gezählt:** `.rpc('raise_alert', …)` genau einmal, in
`apps/coach/src/lib/aktionen.ts:204`. 6 Dateien, +457/−2, drei Bilder.
**Damit ist G-571 geschlossen:**

| Funktion | Aufrufer | durch |
| --- | --- | --- |
| `body_circumference_write` | 1 | G-577 |
| `import_lab_report_rows` | 1 | G-578 |
| `start_lab_report_ocr` | 1 | G-578 |
| `store_lab_report_ocr_result` | 1 | G-578 — Weg da, **Quelle fehlt** |
| `meal_plan_set_next_plan` | 1 | G-579 |
| `raise_alert` | 1 | G-582 |

`[read]` **A1 ist der wertvollste Teil, und es ist der dritte Punkt in
Folge, in dem die Funktion anders arbeitet als eine Annahme es
erwartet:** `raise_alert` **entdoppelt** — gleicher `coach + client +
kind` innerhalb 24 Stunden und nicht `done` gibt die **bestehende** Id
zurück und schreibt nichts. **Eine zurückgegebene Id ist also nicht
zwangsläufig neu.** Belegt: zweiter Alarm, selber Anlass, Zeilen blieben
bei 4. Der Hinweis steht am Knopf, nicht nur im Bericht.

`[cmd]` **A3 hat er gegen den Auftrag beantwortet, und zwar richtig:**
`apps/coach` teilt mit `apps/web` nur `@lumeos/shared` und `@lumeos/ui`,
`lib/fehler/ladefehler.ts` ist nicht erreichbar. **Er hat keine Kopie
angelegt** — mein Auftrag hatte genau davor gewarnt, und ein Wächter hält
es jetzt fest.

`[cmd]` **Nachweis auf `coach@lumeos.app`, nicht auf `test-user`** —
`test-user@lumeos.local` hat keine Coach-Beziehung, gemessen. Das ist die
begründete Ausnahme von der Regel, und er nennt sie.

`[read]` **Ein Befund zum Messweg, der eine Stunde gespart hat:** der
erste Browserlauf zeigte *„JWT issued at future"* — Toms Fehler aus
G-553. Nachgemessen: **keine Uhrendrift**, der Satz kam aus einer ersten
veralteten Antwort nach der Anmeldung. **Hätte er ihn geglaubt, wäre er
in die Umgebung statt in den Punkt gelaufen.**

`[read]` **Offen bleibt der `alertGenerator`** — die Alarme entstehen
weiterhin nur von Hand. Das steht als Hinweis im Reiter und gehört in
einen eigenen Punkt, nicht hierher.
