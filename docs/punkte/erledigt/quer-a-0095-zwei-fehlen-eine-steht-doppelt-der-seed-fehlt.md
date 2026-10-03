---
nr: A-95
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-10-02
agent: codex
beauftragt: 2026-10-02
erledigt: 2026-10-03
commit: df9cd8aa

braucht: [G-559, G-563, G-514, G-567]

quellen:
  - docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md
  - docs/punkte/erledigt/goals-G-0514-die-modulverrechnung-fehlt-ganz.md
  - docs/punkte/erledigt/quer-g-0567-die-tagesreferenz-kennt-kein-ziel.md
  - docs/punkte/erledigt/goals-g-0577-die-umfangserfassung-hat-keinen-schreibweg.md
  - docs/punkte/laufend_claudecode/goals-g-0570-der-rueckfall-gehoert-nach-dem-einspielen-weg.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.user_goals
  dateien:
    - supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
---

# Zwei fehlen, eine steht doppelt, der Seed fehlt

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-95: den Live-Stand an das Repo nachziehen,
                              nach der Form von G-577
    Bereich: die laufende Datenbank (ausdrueckliche Freigabe von Tom,
             2026-10-02) · supabase/_pipeline/ · backup/
    Fremd:   apps/ und packages/ gehoeren Claude Code - er arbeitet
             gerade an G-590 in apps/web/src/app/v2/recovery/ und
             apps/web/src/lib/recovery/. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-03

## Stand 2026-10-03 — lies das zuerst, du faengst ohne Kontext an

`[cmd]` **In der Nacht zum 03.10. war Stromausfall** (Halt 05:59:22,
System oben 07:38:19). **Dieser Auftrag war dir schon zugeteilt und du
hattest noch nicht angefangen** — in `backup/` liegt keine
`a95-vorher.sql`, und der Live-Stand ist unveraendert. **Fang von vorn
an, es ist nichts halb getan.**

`[cmd]` **Deine letzte Arbeit ist committet:** C-556 steht als `16fd9c9c`
(148 Zeilen in die C-230-Filter, `detection_marker` als eigener Typ).
**Nicht noch einmal machen.**

`[cmd]` **Der Live-Stand wurde am 03.10. nach dem Hochfahren erneut
gemessen und ist Zahl fuer Zahl derselbe wie unten beschrieben:**
`berechne_zielwerte` steht zweimal (6674 und 1027 Bytes),
`goals.goal_contributions` 0, `nutrition.micronutrient_snapshot` 2485
Bytes alter Rumpf, letzter Schreibvorgang in `goals` am 15.09. **Alles
unter „Der Befund" gilt unveraendert.**

`[cmd]` **Umgebung ist oben:** alle neun Supabase-Container healthy, Web
3200 und Coach 3220 laufen. **Der Wiederanlauf der Datenbank kostete
440 s fsync** — wenn du eine Wegwerf-Datenbank anlegst und verwirfst,
denk daran, dass jede liegengebliebene das naechste Mal verlaengert
(A-80, A-96).

`[read]` **Nach diesem Auftrag liegt C-557 fuer dich bereit** — der rote
Nachtlauf, `supplement_nutrient_mappings: 3, erwartet 17`. **Nicht
jetzt.** Dieser hier geht vor, er hat Toms Freigabe.

## Die Freigabe — und warum sie eine ist

**Tom, 2026-10-02, 16:42:** *„ok erlaubnis erteilt"*

`[cmd]` **Die Projektregel sagt: nie gegen die laufende Datenbank
testen.** Sie bleibt in Kraft. **Freigegeben ist das EINSPIELEN, nicht
das Proben** — geprobt wird weiter auf einer Wegwerf-Datenbank, und zwar
vorher. `[read]` **Das ist die Form, die G-577 vorgemacht hat:** Sicherung
nach `backup/`, die ganze Datei statt des Ausschnitts, Zaehlung vorher und
nachher, Wegwerf-Probe entfernt.

## Der Befund — die Warteschlange in LAUFEND.md ist veraltet

`[read]` **`docs/todo/LAUFEND.md` nennt vier gebaute, nicht eingespielte
Aenderungen (G-559, G-563, G-535, G-514).** `[cmd]` **Der Orchestrator hat
den Live-Stand am 2026-10-02 gemessen, und drei der vier Angaben
stimmen nicht mehr.** Was wirklich offen ist, steht hier.

### Erledigt, nichts zu tun — G-559 und G-535

`[cmd]` **G-559 ist live und richtig**, gemessen ueber `pg_proc` mit
`prokind = 'f'`:

    goals.phase_am(p_user_id uuid, p_stichtag date)
        RETURNS TABLE(phase_id, user_id, goal_id, phase_type, variant,
                      parameters, gueltig_ab, projected_end_date,
                      actual_end_date, transitioned_from,
                      recommended_next, transition_reason,
                      created_at, updated_at)
        Rumpf 974 Bytes, KEIN "limit 1"
    goals.phase_eines_ziels_am(p_goal_id uuid, p_stichtag date)
        vorhanden

`[read]` **Beide Punkte des Auftrags sind damit belegt**, nicht nur die
Existenz: die Mengenfassung gibt eine Tabelle zurueck und deckelt nicht.

`[cmd]` **G-535 ist seit G-577 live** — alle sechs Funktionen lesen
`auth.uid()`, Zaehlung damals 6 → 0 beim alten GUC. Sicherungen liegen in
`backup/g577-535-vorher.sql` und `-nachher.sql`.

### Halb eingespielt — G-563, und das ist der gefaehrlichste Posten

`[cmd]` **`goals.berechne_zielwerte` existiert LIVE ZWEIMAL:**

    (p_user_id uuid, p_goal_id uuid, p_stichtag date)   6674 Bytes   neu
    (p_user_id uuid, p_stichtag date)                   1027 Bytes   alt

`[cmd]` **Und zwei Datenbankobjekte rufen die alte Fassung weiter:**

    goals.nutrition_target_assign_phase
    nutrition.micronutrient_snapshot

`[read]` **Damit ist G-563 nicht eingespielt, sondern verdoppelt.** Die
alte Fassung ist genau die, die sich selbst eine Phase sucht — der Fehler,
den G-563 behoben hat. Sie ist nicht tot, sie hat zwei Aufrufer. **Wer
nur die neue Funktion einspielt, hat den Fehler nicht entfernt, sondern
ihm einen zweiten Weg gelassen.**

`[cmd]` **Nebenfolge, zu pruefen und zu melden:** die Bruecke in
`apps/web/src/lib/goals/zielwerte-read.ts` greift laut G-570 nur bei
`PGRST202`. Solange die Dreiparameter-Fassung live steht, kann
`PGRST202` nicht mehr entstehen — **die Bruecke ist bereits toter Code.**
`[read]` **Entfernen tut sie Claude Code unter G-570, nicht du.** Du sagst
im Bericht, ob sie nach deinem Lauf noch eine Lage hat, in der sie greift.

### Gar nicht live — G-514

`[cmd]` **`goals.goal_contributions` existiert nicht:**
`information_schema.tables` zaehlt 0 im Schema `goals`.

`[read]` **Daran haengt G-532/A2** — die Modulverrechnung ist der Grund,
warum die letzten drei Reiter nicht gebaut werden koennen.

### Gar nicht live — G-567

`[cmd]` **`nutrition.micronutrient_snapshot` traegt den ALTEN Rumpf**,
2485 Bytes, gemessen am Rumpf selbst:

    zielwerte_am            JA    (G-567 setzt es auf 0)
    berechne_zielwerte      JA    (G-567 setzt es auf 0)
    tdee_basis_am           NEIN  (G-567 fuehrt es ein)
    missing_profile         NEIN  (G-567 fuehrt es ein)

`[cmd]` **Es ist eine FUNKTION, keine Sicht** — eine Suche ueber
`pg_views` nach `micro`/`mikro` findet nichts, und keine Sicht enthaelt
`tdee_alpha_linolenic_acid`. **Wer hier ueber Sichten sucht, misst null
und haelt es fuer eingespielt.**

### Der Seed fehlt — und test-user hat nichts

`[cmd]` **Offene Phasen live, `actual_end_date IS NULL`:**

    tom.seed@example.com    1
    (niemand sonst)

`[cmd]` **Ziele je Nutzer:** `tom.seed@example.com` 5 ·
`dev@lumeos.app` 5 · `max.seed@example.com` 1.

`[cmd]` **`test-user@lumeos.local` hat null Ziele und null Phasen.**
`[read]` **Das ist ein eigener Befund und er trifft jeden kuenftigen
Nachweis:** die Projektregel verlangt Nachweise auf `test-user`, weil
Laeufe auf `dev` Toms gespeicherte Einstellungen ueberschreiben. **Fuer
Goals ist dieser Nachweis heute nicht fuehrbar** — der Nutzer hat kein
Ziel, an dem eine Oberflaeche etwas zeigen koennte.

`[cmd]` **Der Seed liegt in
`supabase/_pipeline/_testdaten/testdaten-einspielen.ts`** — die
Phasenwerte werden bei `:2641` gebaut (`goalPhaseValues`) und bei
`:3691-3703` nach `goals.goal_phases` geschrieben.

`[read]` **Berichtigung zur Quelle:** `LAUFEND.md` nennt
`supabase/_pipeline/testdaten-einspielen.ts:1149` — **diese Datei gibt es
nicht**, der Punktwaechter hat es gefangen. Welche Nutzer der Seed mit
wie vielen offenen Phasen versorgt, **ist von dir zu messen, nicht aus
dieser Zeile zu uebernehmen.** Die Behauptung „test-user bekommt zwei
offene Phasen an zwei Zielen" stand auf einem Pfad, der nicht
existiert — sie ist unbelegt, bis du sie am Seed selbst zaehlst.

## Auftrag

**A1 — Sicherung zuerst, wie bei G-577.** `[cmd]`
`pg_get_functiondef` ueber alle betroffenen Funktionen (`prokind = 'f'`
ist Pflicht, sonst faellt die Abfrage), dazu der Tabellenstand, nach
`backup/a95-vorher.sql`. **Danach dieselbe Datei als `-nachher.sql`.**
`[read]` **Ohne diese zwei Dateien ist der Lauf nicht rueckrollbar**, und
ein Einspielen ohne Rueckweg ist kein Einspielen.

**A2 — auf einer Wegwerf-Datenbank proben, bevor etwas live geht.**
`[cmd]` `PGDATABASE` gesetzt, nie `postgres`. **Dort laeuft die ganze
Reihenfolge einmal durch**, und erst wenn sie dort gruen ist, geht sie
live. **Wegwerf-Datenbank danach verwerfen, mit Zaehler.**

**A3 — G-567 einspielen:** `nutrition.micronutrient_snapshot` in der
zielfreien Fassung aus `supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts`.
**Die ganze Datei, nicht den Ausschnitt.** `[cmd]` **Zu zaehlen, vorher
und nachher, am Rumpf der live installierten Funktion:** `zielwerte_am`
1 → 0, `berechne_zielwerte` 1 → 0, `tdee_basis_am` 0 → 1, `missing_profile`
0 → vorhanden.

**A4 — G-514 einspielen:** `goals.goal_contributions`. `[cmd]`
**Nachher: 1 in `information_schema.tables`**, dazu Spalten, CHECKs und
RLS-Lage gezaehlt. `[read]` **Nenn im Bericht, ob die Tabelle RLS traegt**
— G-587 fragt dasselbe fuer `supplements`, und eine neue Tabelle ohne
Zeilensicherheit waere derselbe Befund eine Stunde nach dem Anlegen.

**A5 — die alte Zweiparameter-Fassung, und ZUERST ihre Aufrufer.**
`[read]` **Die Reihenfolge entscheidet, nicht die Absicht:** erst messen,
was `goals.nutrition_target_assign_phase` und
`nutrition.micronutrient_snapshot` von ihr brauchen, dann beide auf die
Dreiparameter-Fassung umstellen, **dann** die alte entfernen.
`[cmd]` **A3 erledigt den zweiten Aufrufer schon** — die zielfreie Fassung
ruft `tdee_basis_am` statt `berechne_zielwerte`. **Bleibt
`nutrition_target_assign_phase`.** `[read]` **Wenn die alte Fassung aus
einem Grund bleiben muss, nenn den Grund und entferne sie nicht** — ein
begruendetes Nein ist ein Ergebnis. Was nicht geht: sie stehen lassen,
ohne es zu sagen.

**A6 — den Seed einspielen**, sodass `test-user@lumeos.local` seine Ziele
und **zwei offene Phasen an zwei Zielen** traegt. `[cmd]` **Nachher
gezaehlt je Nutzer:** Ziele und offene Phasen (`actual_end_date IS NULL`).
`[read]` **Toms Daten nicht anfassen:** `dev@lumeos.app` traegt 5 Ziele,
die bleiben wie sie sind — und `tom.seed`/`max.seed` ebenso. **Nur
test-user kommt hinzu.**

**A7 — die Rechnung, die den ganzen Punkt tragbar macht.** `[cmd]` **Der
Unterschied ist gemessen: 716 kcal/Tag** (2306 gegen 3023 bei 81,4 kg),
weil die alte Fassung still eine von zwei Raten nimmt. `[read]`
**Nach dem Lauf: dieselbe Rechnung fuer einen Nutzer mit zwei offenen
Phasen, je Ziel.** Zwei Zahlen statt einer beliebigen — das ist der
Nachweis, dass das Einspielen gewirkt hat, und nicht die Existenz der
Funktion.

**Nicht Teil:** die Bruecke in `zielwerte-read.ts` (G-570, Claude Code) ·
jede Aenderung in `apps/` oder `packages/` · `supabase/README.md`
(Orchestrator) · der naechtliche Vollauf und der neue Dump (A-91).

**Zu belegen:** `backup/a95-vorher.sql` und `-nachher.sql` · die
Wegwerf-Probe gruen, danach verworfen, mit Zaehler · je Posten die
Zaehlung vorher/nachher wie oben benannt · `berechne_zielwerte` am Ende
EINMAL in `pg_proc`, oder der Grund, warum zweimal · test-user mit zwei
offenen Phasen an zwei Zielen · die zwei kcal-Zahlen aus A7 · kein
`db push` · nichts in `apps/` · nichts committen.

`[read]` **Und wenn ein Posten nicht sauber einspielbar ist, brich bei
ihm ab und melde.** Ein halb eingespielter Stand ist genau das, was
dieser Punkt aufraeumt — er darf nicht sein Ergebnis sein.

---

## Abnahme — 2026-10-03, Commit `df9cd8aa`

`[cmd]` **Alles vom Orchestrator nachgemessen, live, nach dem Lauf:**

    G-567  micronutrient_snapshot
           zielwerte_am JA -> nein · berechne_zielwerte JA -> nein
           tdee_basis_am nein -> JA · missing_profile nein -> JA
           Rumpf 2485 -> 2269 Bytes
    G-514  goal_contributions   Tabelle 0 -> 1 · 10 Spalten
           4 CHECKs · RLS an · 1 Policy · 892 Zeilen
    G-563  berechne_zielwerte   nur noch (p_user_id, p_goal_id,
           p_stichtag), 6674 Bytes. Die Zweiparameter-Fassung ist weg.
    Seed   test-user 0/0 -> 2 Ziele / 2 offene Phasen
           dev 5/0 · tom.seed 5/1 · max.seed 1/0 unveraendert

`[cmd]` **A7 belegt den Zweck, nicht nur die Existenz.** Fuer test-user,
je Ziel, bei TDEE 2753,6 und 81,40 kg:

    901  lose_weight   Rate -0,400 %/Woche   2395,4 kcal
    902  gain_muscle   Rate +0,400 %/Woche   3111,8 kcal
    Abstand 716,4 kcal

`[read]` **Vorher nahm die Rechnung still eine von zwei Raten.** Jetzt
bekommt jedes Ziel seine Zahl — das ist der ganze Punkt von G-563, und er
ist damit am Nutzer belegt, nicht an der Signatur.

### Der Schritt, der im Bericht fehlte, und er war der heikelste

`[cmd]` **A5 verlangte: erst die Aufrufer umstellen, DANN die alte Fassung
entfernen.** Der Bericht sagt nur, dass sie entfernt ist. **Nachgesehen:
der Aufrufer wurde umgestellt**, und zwar richtig —
`goals.nutrition_target_assign_phase` ruft jetzt

    FROM goals.berechne_zielwerte(NEW.user_id, v_goal_id, NEW.gueltig_ab)

`[read]` **Ohne diese Zeile waere der Trigger seit heute kaputt.** Der
Schritt ist getan; **im Bericht stand er nicht.** Das ist die Klasse, bei
der eine Abnahme am Bericht gruen gegeben haette, was nur die Messung
belegt.

`[cmd]` **Und das `max(p.goal_id::text)::uuid` in diesem Trigger ist KEIN
stilles Auswaehlen** — davor steht `count(*)`, und bei mehr als einer
Phase bricht die Funktion mit `23514` ab. **Richtig gebaut.** Daraus ist
aber ein neuer Punkt geworden, siehe unten.

### Zwei Zahlen im Bericht, die nicht stimmen

`[cmd]` **Datenbankzaehler:** der Bericht sagt 156 → 155. **Gemessen sind
156**, und keine `%a95%`-Datenbank liegt mehr da. **Die Wegwerf-Datenbank
ist also sauber verworfen** — der Endstand ist nur um eins falsch
benannt (der Ausgangsstand war 156, nicht 156→155).

`[cmd]` **`backup/a95-nachher.sql`:** der Bericht sagt 421.094 Bytes,
gemessen sind **421.044**. `backup/a95-vorher.sql` stimmt mit 21.368.

`[read]` **Beides aendert am Ergebnis nichts und steht hier trotzdem:**
*„Ein `[cmd]` mit falscher Zahl ist schlimmer als ein `[annahme]`"* — eine
Zahl unter dieser Marke wird geglaubt und zur Regel.

### Zwei neue Punkte aus diesem Lauf

`[cmd]` **G-594** — `goals.nutrition_targets` traegt `phase_id`, aber
**keine `goal_id`**. Der Trigger muss das Ziel aus `phase_am` ableiten und
verweigert bei zwei Phasen mit `23514` *„Zielbezug fehlt"*. **Seit diesem
Lauf hat test-user genau zwei** — damit ist fuer ihn kein formelbasiertes
Ernaehrungsziel mehr schreibbar, und er ist der Nutzer, auf dem jeder
Nachweis laeuft. **Der Lauf hat das nicht erzeugt, er hat es sichtbar
gemacht.**

`[cmd]` **A-97** — zwei Pipelineskripte tragen jetzt `--a95-live` und
`--a95-goals-only` und lassen damit `PGDATABASE=postgres` zu. **Fuer den
freigegebenen Lauf richtig, danach falsch** — dieselbe Klasse wie G-570.
**Und der A-88-Waechter bleibt dabei gruen**, weil `hatFailClosed` nur
prueft, ob `!DB` und `DB === 'postgres'` irgendwo in der Datei stehen,
nicht ob der Zweig unbedingt wirft. **Die `assert.match`-Klasse eine
Ebene hoeher.**

`[read]` **Die `DROP FUNCTION`-Zeile in `030_mikro-uebersicht.ts` bleibt** —
sie gehoert in die Pipeline, damit die Kette die alte Fassung nicht wieder
anlegt. **Nur die zwei Schalter gehen raus.**

### Belege

`[cmd]` Sicherungen `backup/a95-vorher.sql` (21.368 Bytes) und
`-nachher.sql` (421.044 Bytes), beide vorwaerts und rueckwaerts geprueft;
der Nachher-Stand reproduziert 892 Zeilen und sieben Funktionsdefinitionen
mit gleichen Pruefsummen. **Zwei dauerhafte Proben in
`testdaten-pruefen.ts`:** die 716 kcal und dass die alte Ueberladung nicht
wieder auftaucht. `pnpm gate` gruen im Vorcommit-Haken. Commit
`df9cd8aa`, 3 Dateien, +316/−14. **Claude Codes laufende G-590-Arbeit in
`apps/web` blieb ausserhalb des Staging.**

`[cmd]` **Offen und bekannt:** C-557 haelt den Vollauf weiter rot, G-570
(die Bruecke in `zielwerte-read.ts`) ist jetzt toter Code und gehoert weg.
