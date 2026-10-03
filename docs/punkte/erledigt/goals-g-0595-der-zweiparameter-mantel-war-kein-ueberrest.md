---
nr: G-595
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-03
erledigt: 2026-10-03
commit: c73a95c1
agent: orchestrator
beauftragt: 2026-10-03

braucht: [G-563, G-568, A-95]
kind_von: A-95

quellen:
  - docs/punkte/erledigt/quer-a-0095-zwei-fehlen-eine-steht-doppelt-der-seed-fehlt.md
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md
  - docs/punkte/erledigt/goals-g-0568-die-zielwerte-brauchen-ihr-ziel.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
    - supabase/_pipeline/_validierung/testdaten-pruefen.ts
---

# Der Zweiparameter-Mantel war kein Ueberrest — mein Auftrag hat ihn geloescht

## Der Befund

`[cmd]` **Tom, 2026-10-03, 11:43 und erneut 11:58, an der Goals-Seite:**

    Die Daten konnten nicht geladen werden.
    Could not find the function
    goals.berechne_zielwerte(p_stichtag, p_user_id) in the schema cache

`[cmd]` **Die Anwendung ruft bewusst zweiparametrig**, wo sie kein Ziel
kennt — `apps/web/src/lib/profile/zielwerte-read.ts:267`:

    const args = goalId
      ? { p_user_id: userId, p_goal_id: goalId, p_stichtag: stichtag }
      : { p_user_id: userId, p_stichtag: stichtag }

`[cmd]` **Und die Kette legt genau dafuer einen Mantel an** —
`11_goals/563_target_scoped_calculation.sql:244`: nach der
dreiparametrigen Fassung folgt `CREATE FUNCTION
goals.berechne_zielwerte(p_user_id, p_stichtag)`, die das Ziel der einen
offenen Phase holt, bei mehreren mit `23514` wirft und sonst an die
dreiparametrige delegiert.

`[read]` **Das ist G-568/A2 als Code:** *wo der Aufrufer ein Ziel kennt,
nennt er es; wo nicht, entscheidet die Datenbank — eine Phase geht durch,
zwei werfen.* **Kein geratenes Ziel.**

## Die Ursache — sie liegt in meinem Auftrag, nicht in der Ausfuehrung

`[cmd]` **A-95/A5 lautete:** erst die Aufrufer umstellen, dann die alte
Fassung entfernen. **Ich habe sie „die alte Zweiparameter-Fassung"
genannt und als Altlast behandelt.** Codex hat genau das ausgefuehrt,
korrekt, inklusive des einen Datenbank-Aufrufers.

`[cmd]` **Was ich nicht geprueft habe: die Aufrufer in der ANWENDUNG.**
Meine Abnahme zaehlte `pg_proc`, `information_schema`, Zeilen und zwei
kcal-Werte — alles SQL. **Die Seite hat niemand geoeffnet.**

`[cmd]` **Und A-95 hat den Loeschbefehl in die Kette geschrieben**,
`_ableitung/030_mikro-uebersicht.ts:385` — ein Schritt, der **nach** 563
laeuft. **Die Kette hat sich damit selbst widersprochen:** 563 legt an,
030 loescht.

`[read]` **Zwei meiner Aussagen waren falsch und sind widerrufen:**

1. *„der Rueckfall ist bereits toter Code, weil `PGRST202` nicht mehr
   entstehen kann"* — `PGRST202` entsteht, sobald die Signatur fehlt oder
   der Schema-Cache veraltet ist. **Der Rueckfall war hier nicht einmal
   beteiligt:** er greift nur, wenn ein `goalId` da ist.
2. *„die alte Fassung hat nur einen Aufrufer, und der ist umgestellt"* —
   sie hatte zwei, und der zweite stand in `apps/`.

`[cmd]` **Ein `NULL`-Ziel ist kein Ersatz**, gemessen vor der Korrektur:

    berechne_zielwerte(tom.seed,  NULL, heute)  -> keine_aktive_phase
    berechne_zielwerte(test-user, NULL, heute)  -> keine_aktive_phase

**Auch tom.seed mit einer offenen Phase bekommt „keine aktive Phase"** —
die dreiparametrige Fassung waehlt nie selbst. Genau das ist der Grund,
warum der Mantel existiert.

## Die Behebung

`[cmd]` **1 — live zurueckgespielt** aus `backup/a95-vorher.sql`,
Sicherungen `backup/g595-vorher.sql` (91.716 Zeichen) und
`-nachher.sql` (101.570), danach `NOTIFY pgrst, 'reload schema'`
(151 Funktionen).

`[cmd]` **2 — der DROP in `030_mikro-uebersicht.ts` ist entfernt**, und an
seiner Stelle steht, warum dort keiner stehen darf. **Ohne das haette die
naechste Kette den Fehler wiederhergestellt.**

`[cmd]` **3 — die A-95-Probe in `testdaten-pruefen.ts` hatte die falsche
Richtung** (*„alte Zweiparameter-Fassung steht noch"*). Sie verlangt jetzt
**beide** Fassungen, je mit eigener Meldung.

## Der Nachweis — in drei Richtungen, und an der Seite

`[cmd]` **Zweiparametrig gerufen, nach der Korrektur:**

    tom.seed    1 offene Phase    2802,0 kcal · Rate 0,271 · kein Hindernis
    test-user   2 offene Phasen   23514 "mehrere aktive Phasen;
                                  Zielbezug fehlt"
    dev         0 offene Phasen   hindernis keine_aktive_phase

`[cmd]` **An der Seite**, `tools/schuss.mjs /v2/goals`:

    titel            Goals & Body · LumeOS
    konsolenfehler   1  (data-mode aus RootLayout, fremd)
    PGRST202                 0 Treffer
    berechne_zielwerte       0 Treffer
    "konnten nicht geladen"  0 Treffer
    "schema cache"           0 Treffer
    attrappen        15 -> 19, weil die Kacheln wieder rendern

`[read]` **Die rote Richtung ist zweimal belegt und braucht keine
Sabotage:** Tom hat sie um 11:43 und 11:58 gesehen.

`[cmd]` **`pnpm gate` gruen im Vorcommit-Haken.** Commit `c73a95c1`,
2 Dateien, +27/−5.

## Was offen bleibt

`[cmd]` **`dev@lumeos.app` hat null offene Phasen.** Tom sieht auf Goals
deshalb „keine aktive Phase" statt Zahlen — **kein Fehler, aber auch keine
Daten.** Wer dort Zahlen sehen will, braucht eine Phase an einem Ziel.

`[read]` **G-570 bleibt richtig** — der Rueckfall gehoert weg, und sein
neues A4 (`PGRST202` als eigener, lesbarer Zustand in `ladefehler.ts`)
ist durch diesen Vorfall belegt: der Nutzer las eine Signatur, die
niemand mehr aufruft.
