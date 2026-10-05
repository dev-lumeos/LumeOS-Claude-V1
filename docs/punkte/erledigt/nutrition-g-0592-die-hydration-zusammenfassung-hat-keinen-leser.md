---
nr: G-592
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-03
agent: claudecode
beauftragt: 2026-10-04
erledigt: 2026-10-05
commit: a646fd80

braucht: [G-588]
kind_von: G-588

quellen:
  - docs/punkte/todos/quer-g-0588-sechs-serveraktionen-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen:
    - nutrition.water_logs
  dateien:
    - apps/web/src/lib/nutrition/water-write.ts
    - apps/web/src/lib/nutrition/hydration-day-read.ts
---

# Die Hydration-Zusammenfassung ist ein ZWEITER Leseweg, keine fehlende Anzeige

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-592: ein Leseweg fuer eine Tatsache
    Bereich: apps/web/src/lib/nutrition/
             apps/web/src/app/v2/nutrition/  (nur falls A3 es verlangt)
    Fremd:   supabase/ gehoert Codex. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-03

## Der Befund — und er ist nicht der, den G-588 vermutet hat

`[read]` **G-588 nannte `getHydrationSummary` eine Leseabfrage ohne
Anzeige und schloss: es fehlt eine Oberflaeche.** `[cmd]` **Gemessen am
03.10. ist es anders — es gibt die Anzeige schon, ueber einen anderen,
reicheren Weg.**

### Zwei Leser, dieselbe Tatsache

`[cmd]` **`water-write.ts:131` — `getHydrationSummary`**, ohne Aufrufer,
liest die **Sicht** `nutrition.hydration_summary`:

    user_id · entry_date · logged_ml · log_count · food_ml ·
    food_ml_missing · total_ml · total_complete

`[cmd]` **`hydration-day-read.ts` — live und reicher**, liest die
**Funktion** `nutrition.hydration_day(user, datum)` und liefert dieselben
sechs Felder **plus**:

    target_ml · target_source · target_available · progress_pct ·
    glass_size_ml · glasses_total

`[cmd]` **Und sie hat einen Aufrufer:**
`apps/web/src/app/api/nutrition/water/route.ts:21`.

`[read]` **Das ist die Klasse aus G-544:** *„Wo zwei Lesewege auf dieselbe
Tatsache zeigen, widersprechen sie sich irgendwann — und kein Test faellt
dabei um."* Hier ist der zweite noch harmlos, weil ihn niemand ruft.
**Genau deshalb ist jetzt der richtige Zeitpunkt.**

`[cmd]` **Die Daten sind da:** `nutrition.water_logs` traegt 362 Zeilen
fuer `dev@lumeos.app`, 361 fuer `tom.seed`, 360 fuer `max.seed`.

## Auftrag

**A1 — zuerst messen, ob die Kachel lebt.** `[cmd]` Zeigt die
Nutrition-Oberflaeche heute den Wasserhaushalt, und ueber welchen Weg?
`route.ts` existiert — **ob eine Kachel ihn ruft, ist zu zaehlen, ohne
Kommentare.** `[read]` **Davon haengt alles andere ab**, und es ist eine
Messung, keine Entscheidung.

**A2 — dann die eine Richtung waehlen, und sie ist vorgezeichnet.**
`[read]` **Eine Tatsache, ein Leseweg.** `hydration_day` kann alles, was
`hydration_summary` kann, und mehr; sie ist live und hat einen Aufrufer.
**Also faellt `getHydrationSummary` weg** — es sei denn, A1 findet einen
Grund, der im Punkt nicht steht. **Dann nennst du ihn und baust nichts.**

`[cmd]` **Nicht die Sicht entfernen.** `nutrition.hydration_summary`
gehoert Codex, und ob sie sonst noch gebraucht wird, ist hier nicht
gemessen. **Nur die Ausfuhr in `apps/`.**

**A3 — wenn A1 ergibt, dass die Kachel FEHLT**, dann ist dieser Punkt ein
anderer: dann baust du sie ueber `hydration-day-read.ts`, nicht ueber
`getHydrationSummary`. `[cmd]` **Und dann gilt die eine Fachregel, die
der Dateikopf von `water-write.ts:127-129` schon nennt:**

    Kein Eintrag heisst nicht „0 getrunken", sondern „nichts erfasst"
    - deshalb ein leerer Tag mit `null`, nicht mit Nullen.

`[read]` **`hydration_day` traegt dafuer die Felder** — `food_ml_missing`
ueber null heisst unvollstaendig, `progress_pct` ist `null` statt 0, wenn
kein Ziel ableitbar ist. **Eine Kachel, die `null` als 0 zeichnet, hat
die eine Regel verfehlt, die diesen Weg traegt.**

**Nicht Teil:** die Schreibwege fuer Wasser (`addWaterLog` und die drei
anderen in `water-write.ts`, alle mit Aufrufer) · die Sicht und die
Funktion in `supabase/` · G-591 und G-593.

**Zu belegen:** die Aufruferzahl aus A1, ohne Kommentare · je nach
Richtung: die entfernte Ausfuhr mit Gegenprobe, ODER die Kachel am Bild
mit einem leeren Tag, der `null` zeigt und nicht 0 · `pnpm gate` gruen
mit Testzahl · Sabotage je Zusicherung in beide Richtungen · Nachweise
auf `test-user@lumeos.local` · nichts committen.

`[read]` **Und der Satz aus G-588 ist damit berichtigt:** nicht *„hier
fehlt eine Anzeige"*, sondern *„hier gibt es einen Leseweg zu viel"*.

## Abnahme - 2026-10-05, Commit `a646fd80`

`[cmd]` Diff: 6 geaenderte Dateien plus `g592-hydration-leer.test.ts` (7 Tests); 2650 - 5 + 7 = 2652 stimmt. `[cmd]` Kein Aufrufer von getHydrationSummary, parseHydrationSummaries, emptyHydrationSummary, hydrationPercent oder from('hydration_summary') mehr in apps/ und packages/, nur zwei Kommentare. Gate beim Commit gruen. Sein Schirmnachweis: leerer Tag test-user ,nichts erfasst', Tag mit Daten auf dev unveraendert; Sabotage 8/8 rot.

Befunde daraus: G-605 (14-Tage-Schnitt ohne Eintraege ist 0 statt NULL, Codex), A-102 (verdrahtung-pruefen rot, 26 Namen, nicht im Gate).

