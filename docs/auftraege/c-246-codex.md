# C-246 und C-247 — Codex, 2026-08-23

**Rausgegangen 2026-08-23.** Im Wortlaut uebernommen, nicht
nachgeschrieben. Bericht: `docs/berichte/c-246-codex.md` (beide Punkte).

Beide Drifts hat Codex in C-243 **selbst gemeldet** und sauber als
nicht-C-243 gekennzeichnet, statt sie passend zu machen. Genau deshalb
kommen sie als eigener Auftrag zurueck.

---

## C-246: `058b` liegt committet und ist live nicht eingespielt

### WAS ICH GEMESSEN HABE

`[cmd]` **0 Tabellen `shopping%`** im gesamten Katalog. Fehlend:
`shopping_lists`, `shopping_list_items` samt Guards, Triggern und
Fremdschluesseln.

Sie stehen in
`supabase/_pipeline/05_user_tabellen/058b_recipes_meal_plans.sql`
(1.208 Zeilen), eingebracht von **`54bd0f3`, 2026-08-22**.

`[cmd]` Die uebrigen **fuenf** Tabellen **derselben Datei** existieren
live: `recipes`, `meal_plans`, `meal_plan_weeks`, `meal_plan_days`,
`meal_plan_entries`. Die stammen aus dem aelteren Commit `ebd9f6e`.

`[read]` Das ist derselbe Fehler wie am 2026-08-22, als sechs Auftraege
committet und nie eingespielt lagen. **Ein Fall ist durchgerutscht.**

`[cmd]` Es blockiert sichtbar: G-161 hat *„Shopping list"* und
*„Scale list"* als Attrappe stehen lassen und den Grund mit
*„0 `shopping%`-Tabellen"* belegt.

### WAS ZU TUN IST

Den Shopping-List-Teil aus `058b` **live nachziehen**. Kein neuer
Kettenschritt — die Kette ist richtig, nur die laufende Instanz hinkt.

Vollsicherung vorher. Danach **Zeilen UND Policies** zaehlen, nicht nur
Zeilen; `pg_restore` laesst Policies still fallen.

### NACHWEIS

Vorher **0** Tabellen `shopping%`, nachher genau die, die `058b`
definiert — **die Zahl aus der Datei ableiten und VOR dem Lauf
hinschreiben**, nicht raten. Guards, Trigger und FKs einzeln zaehlen.
Live-Schemapruefung muss fuer `058b` gruen werden.

---

## C-247: zwei Pruefungen widersprechen sich

### WAS ICH GEMESSEN HABE

`[cmd]` `medical.biomarker_reference_ranges` live: **566** Zeilen.
`[cmd]` `_validierung/testdaten-pruefen.ts` erwartet **564** und ist rot.
`[cmd]` Die Schemapruefung akzeptiert dieselbe Tabelle mit
*„566 / 566 ok"*.

### WAS ZU TUN IST

**ERST MESSEN, DANN ENTSCHEIDEN.** Nicht die Erwartung auf 566 setzen,
weil live 566 dasteht — das waere Anpassen statt Pruefen.

Finde heraus, **welche zwei Zeilen** den Unterschied machen: seit wann
sie da sind, aus welchem Kettenschritt oder Einspielvorgang, und ob sie
fachlich richtig sind.

Dann eines von beiden, **mit Begruendung im Bericht**:

- **a)** die zwei Zeilen gehoeren nicht dahin → entfernen, Erwartung
  bleibt 564
- **b)** die zwei Zeilen sind richtig → Erwartung auf 566, und im
  Bericht steht, **was sie sind**

Wenn du es nicht entscheiden kannst: melden, nicht raten.

`[read]` **Eine dauerhaft rote Pruefung ist gefaehrlicher als keine**,
weil sie umgangen statt repariert wird.

### NACHWEIS

Die zwei Zeilen **namentlich** im Bericht. `testdaten-pruefen.ts` nach
dem Lauf gruen — oder rot mit einem anderen, **benannten** Grund.

---

## REGELN — fuer beide Punkte

Wegwerf-Datenbank zum Pruefen, danach verwerfen. Vollsicherung vor jedem
Live-Eingriff. **Ein Auftrag ist nicht fertig, wenn die Kette gruen
laeuft, sondern wenn die Aenderung dort ist, wo Tom sie sieht.**

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster. Nie `pnpm dev`
oder `npx next dev` — nur `python tools/server.py`. `.next` nie
loeschen, `next build` nie direkt aufrufen. Pruefschleifen als
Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`. Nachweisdateien
mit `encoding="utf-8", newline="\n"`.

Nicht committen, nicht stagen, nicht pushen. Nichts in `docs/todo/` oder
`docs/ssot/` schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
