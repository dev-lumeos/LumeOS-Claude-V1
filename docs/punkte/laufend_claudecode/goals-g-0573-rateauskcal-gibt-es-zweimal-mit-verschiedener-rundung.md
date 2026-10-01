---
nr: G-573
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01
beauftragt: 2026-10-01
agent: claudecode

braucht: []
kind_von: G-565
entscheidung: E-83

quellen:
  - docs/punkte/erledigt/goals-g-0565-die-einheit-ist-eine-nutzerwahl.md
  - docs/punkte/erledigt/goals-g-0569-g520-prueft-kilogramm-in-der-anwendung.md

beruehrt:
  dateien:
    - apps/web/src/lib/goals/anpassung.ts
    - apps/web/src/lib/goals/zielrate-einheit.ts
    - apps/web/src/lib/goals/__tests__/g569-relative-schwellen.test.ts
---

# rateAusKcal gibt es zweimal, mit verschiedener Rundung

## Auftrag

    AUFTRAG FUER Claude Code - G-573: rateAusKcal gibt es zweimal, mit
                                     verschiedener Rundung
    Bereich: apps/web/src/lib/goals/anpassung.ts
             apps/web/src/lib/goals/zielrate-einheit.ts
             apps/web/src/lib/goals/__tests__/
    Fremd:   tools/ baut die ANDERE Claude-Code-Sitzung gerade (A-85),
             supabase/ gehoert Codex (A-77). Beides bleibt unangetastet.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/punkte/erledigt/goals-g-0565-die-einheit-ist-eine-nutzerwahl.md`
(dort stehen die 126 gemessenen Faelle, die A4 als Vorlage nimmt).

## Der Befund

`[cmd]` **Zwei exportierte Funktionen, derselbe Name, dieselbe Aufgabe,
andere Rundung:**

    anpassung.ts:144          Math.round((kcal / (11 * kg)) * 1000) / 1000
    zielrate-einheit.ts:113   rundeWieDb(kcal / (11 * kg), 3)

`[cmd]` **`wochenAnpassung` ruft die mit `Math.round`**
(`anpassung.ts:207`). Der Einheitenschalter (G-565) ruft die andere.

`[read]` **Das ist die Fehlerklasse aus G-565, unter demselben Namen
wieder eingebaut.** Dort war gemessen: Postgres rundet die Haelfte von
der Null WEG, JavaScript nach oben — bei negativen Werten laufen sie
auseinander, und Abnehmen ist der negative Fall. **Die eine Funktion
stimmt mit `goals.kcal_delta_aus_zielrate` ueberein, die andere nicht.**

`[cmd]` **Und der Waechter deckt es nicht ab.**
`g569-relative-schwellen.test.ts:94` verbietet `Math.round` — aber er
liest nur `waechter-schwellen.ts`. Die Zusicherung auf Zeile 78 heisst
*„keine Datei rechnet selbst in Prozent um"* und prueft ein anderes
Muster (`/ gewichtAmStichtagKg * 100`). **Die Dublette steht 70 Zeilen
ueber dem Aufruf und faellt durch keine der beiden.**

`[read]` **Zwei Lesewege auf dieselbe Tatsache widersprechen sich
irgendwann, und kein Test faellt dabei um** — das ist in diesem Repo
eine benannte Klasse, viertes Vorkommen in drei Tagen.

## Was zu tun ist

**A1 — zaehlen, wie weit die zwei auseinanderliegen.** Je Gewicht und
kcal-Betrag, der auf der halben Stelle landet: welche Rate kommt heraus?
**Eine Zahl, die den Unterschied zeigt, oder der Beleg, dass es im
erreichbaren Bereich keine gibt** — und dann ist die Dublette trotzdem
eine.

**A2 — eine Rechnung.** `anpassung.ts` ruft die Fassung aus
`zielrate-einheit.ts`, die eigene faellt weg. `[read]` **Kein Umbenennen
der zweiten** — zwei Namen fuer eine Sache ist die Klasse aus G-529.

**A3 — der Waechter deckt BEIDE Dateien ab**, nicht nur die neue, und
sucht die Form: eine Division durch `11 * gewicht` ausserhalb von
`zielrate-einheit.ts`. `[read]` **Der Name allein genuegt nicht** — eine
Dublette kann anders heissen.

**A4 — gegen die Datenbank halten.** `goals.kcal_delta_aus_zielrate` ist
die Gegenseite. **Nach dem Umbau muessen beide Wege dieselbe Zahl
liefern, in beiden Richtungen** — G-565 hat 126 Faelle gemessen, das ist
die Vorlage.

**Nicht Teil:** die Schwellen selbst (G-569, erledigt) und die
Einheitenwahl (G-565, erledigt).

**Zu belegen:** die Zahl aus A1 · Sabotage je Zusicherung in beide
Richtungen · `pnpm gate` gruen mit Testzahl · nichts committen.
