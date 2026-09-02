---
nr: C-383
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-379
entscheidung: E-54
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 107387fd
beruehrt:
  tabellen: [goals.goal_phases]
zahlen:
  gemessen: 2026-09-02
  goal_phases: 5
---

# C-383 — gehoeren Plaene in `goal_phases`?

## Befund

Aus E-54, 2026-09-02.

Tom: *,,das kann ein komplettes jahr sein als beispiel mit allen
phasen parallel zu training/supplement etc."*

`[cmd]` **Das Muster gibt es schon zweimal:**

    goals.goal_phases                  5 Zeilen, 14 Spalten
    supplements.user_supplement_cycles 0 Zeilen

`[cmd]` **`goal_phases` fuehrt:** `goal_id`, `phase_type`, `variant`,
`parameters jsonb`, `gueltig_ab`, `projected_end_date`,
`actual_end_date`, `transitioned_from`, `recommended_next`,
`transition_reason`.

`[read]` **Das ist bereits eine Zeitachse mit Uebergaengen** —
geplantes und tatsaechliches Ende getrennt, Herkunft und Empfehlung
festgehalten.

`[read]` **Zwei Module haben es unabhaengig erfunden. Nutrition waere
das dritte.**

## Zu messen

`[read]` **Traegt `parameters jsonb` schon Verweise auf Plaene?**
`[cmd]` **Das ist zu lesen, nicht anzunehmen** — fuenf Zeilen stehen
drin.

`[read]` **Und wie verhaelt sich `gueltig_ab` zu
`meal_plans.start_date`?** `[cmd]` **Heute setzt das Aktivieren es**
(G-306). `[read]` **In einer Phase waere es abgeleitet** — **sonst
gibt es zwei Wahrheiten ueber denselben Tag.**

`[read]` **Und `phase_type`: welche Werte gibt es, wer setzt sie?**

## Warum es zuerst gemessen wird

`[read]` **Eine dritte Fassung derselben Sache waere der Fehler, den
wir bei den fuenf Suchen gefunden haben** (G-323) — **acht Lehren in
einer, sieben Kopien ohne.**

`[cmd]` **Und `next_plan_id` bleibt** — **es traegt *danach kommt B*,
nicht *von Maerz bis Mai, dreimal wiederholt*.**

## Auftrag — die Zeitachse messen

**Mitbeauftragt: C-36, C-24.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-383 — gehoeren Plaene in `goal_phases`?

`[cmd]` **`goals.goal_phases` traegt 5 Zeilen und 14 Spalten**,
darunter `parameters jsonb`, `gueltig_ab`, `projected_end_date`,
`actual_end_date`, `transitioned_from`, `recommended_next`.

`[read]` **Lies die fuenf Zeilen.** **Traegt `parameters` schon
Verweise auf Plaene?** `[read]` **Das ist zu lesen, nicht
anzunehmen.**

`[read]` **Und `phase_type`: welche Werte gibt es, wer setzt sie?**

`[cmd]` **`supplements.user_supplement_cycles` fuehrt dasselbe
Muster** — `started_at`, `paused_at`, `stopped_at`, `source`.
**0 Zeilen.**

`[read]` **Zwei Module haben es unabhaengig erfunden. Nutrition waere
das dritte** — **das ist der Fehler aus G-323, acht Lehren in einer
Suche und sieben Kopien ohne.**

### Und die Frage, die daran haengt

`[cmd]` **`meal_plans.start_date` setzt heute das Aktivieren**
(G-306). `[cmd]` **`goal_phases.gueltig_ab` traegt den Beginn einer
Phase.**

`[read]` **In einer Phase waere das Startdatum abgeleitet** —
**sonst gibt es zwei Wahrheiten ueber denselben Tag.**

### 2 · C-36 — kuratierte Zuordnung statt Ableitung

`[read]` **Lies den Punkt und miss, ob er noch gilt.** `[cmd]`
**E-55 hat seither entschieden, dass Kuration in einer zweiten
Tabelle steht** — **derselbe Gedanke, andere Ebene.**

### 3 · C-24 — Halbfertigprodukte ranken als Grundzutat

`[cmd]` **Miss, ob es noch gilt.** `[cmd]` **Seit G-281 traegt die
Suche einen Treffergrund** — **er koennte zeigen, warum ein
Halbfertigprodukt oben steht.**

### Was nicht zu tun ist

**Keine Tabelle anlegen** — dieser Auftrag misst.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    goal_phases        die fuenf Zeilen, was steht in parameters
    phase_type         welche Werte, wer setzt sie
    gueltig_ab         wie verhaelt es sich zu start_date
    dritte Fassung     noetig oder vermeidbar? begruendet
    C-36, C-24         gilt / ueberholt

## Bericht

### Messung vom 2026-09-02

#### C-383 — `goal_phases` ist eine Zeitachse, aber noch kein Planträger

`goals.goal_phases` hat die angekündigten fünf Zeilen. Die unterschiedlichen
`parameters`-Inhalte sind: zweimal `maintenance`/`baseline` mit `reason` und
`source`, zweimal `lean_bulk`/`moderate` mit `source` und
`calorie_surplus_kcal: 250`, einmal `maintenance`/`performance_placeholder`
mit `note` und `source`. Die einzigen JSON-Schlüssel sind somit
`calorie_surplus_kcal`, `note`, `reason` und `source`; keine Zeile enthält
`plan` im JSON oder eine Planreferenz. Alle fünf sind Testdaten
(`source: GO-07 testdata`).

Live kommen nur `maintenance` (3) und `lean_bulk` (2) vor. Der CHECK erlaubt
außerdem `fat_loss`, `recomp`, `contest_prep`, `reverse_diet`,
`expert_bb_annual`, `mini_cut` und `peak_week`. Die fünf heutigen Zeilen
setzen ausschließlich die beiden Testdaten-Einspieler
`_testdaten/testdaten-einspielen.ts` und `_testdaten/eigenes-konto-fuellen.sql`;
im Produktpfad wird die Tabelle gelesen, nicht geschrieben. In der Datenbank
gibt es nur den `updated_at`-Trigger und die Lesefunktion `goals.phase_am`.

`supplements.user_supplement_cycles` trägt zwar `started_at`, `paused_at`,
`stopped_at`, `source` und `suggestion_source`, hat auf dev aber **0 Zeilen**.
Das belegt das parallele Schema-Muster, nicht schon eine zweite gelebte
Zeitachse.

Die acht `meal_plans` sind ebenfalls nicht gekoppelt: Die vier Seed-Pläne
haben kein `start_date`; die vier dev-Pläne beginnen am 01./02.09.2026. Die
dev-Phasen beginnen dagegen am 21.05. bzw. 04.06.2026. Es gibt weder eine
Referenz noch einen gleichen, daraus ableitbaren Beginn.

**Ergebnis:** E-54 beschreibt die Zielrichtung, ist aber noch nicht gebaut.
Eine dritte, nutrition-eigene Zeitachse ist vermeidbar; eine spätere
Plan-Phasen-Verbindung muss die Phase zum Termininhaber machen und
`meal_plans.start_date` daraus ableiten. Welcher Beziehungstyp das ist, wird
hier bewusst nicht entschieden.

#### C-36 — teilweise begonnen, nicht erledigt

Die gewünschte kuratierte Zuordnung liegt technisch bereits in
`nutrition.food_aliases`: live **12** `curated_suchbegriff`-Zeilen, sämtlich
für Reis-Begriffe, und **311** `curated_nebenname`-Zeilen. Die zwölf
Suchbegriffe verweisen direkt auf einen ausgewählten BLS-Eintrag (etwa
`reis` → `C352000`, weißer Reis roh); bei der Suche nach `reis` steht dieser
Eintrag auf Platz 1 von 145 Treffern.

Das ist ein funktionierender erster Fall der in C-36 verlangten
Begriff-zu-Eintrag-Kuration, nicht aber deren Abschluss: Die übrigen
32.522 Alias-Zeilen sind `editorial` (21.420) oder `derived` (11.102), und
die beiden allgemeinen Kurationstabellen sind leer. E-55 entscheidet die
Trennung von Import- und Menschen-Tags; sie ersetzt weder den kuratierten
Alias noch macht sie aus den abgeleiteten Aliasen Zuordnungen. **C-36 gilt
weiter, mit dem engeren Befund: Reis ist der vorhandene Beweisweg.**

#### C-24 — gilt weiter; Treffergrund ist nicht vorhanden

Mit der korrekten Synonymgruppe aus `024_suchsynonyme.sql` liefert
`food_search('kartoffelstock', …)` **16** Treffer. Auf Platz 1 steht weiter
`K213000 Kartoffelpüree Instantpulver` mit `sort_weight 450`; danach folgen
Süßkartoffelpüree/Babynahrung (je 320) und verzehrfertige
Kartoffelpüree-Varianten (50 bzw. 0). Damit besteht der konkrete Rangfehler
fort.

Das Namensmuster `instant|pulver|granulat|konzentrat|trockenprodukt|backmischung`
trifft heute 69 Lebensmittel, `sort_weight` im Mittel 214,3 (0–830), nicht
mehr 73 mit 369. Es ist kein sicheres Klassifikationsmerkmal — einzelne Fälle
müssten weiterhin kuratiert werden.

Die Korrektur aus C-384 stimmt: Keines der 16 Ergebnisobjekte enthält
`match_reason`. `food_search` liefert derzeit keinen Treffergrund; daraus
lässt sich die Rangfolge nicht erklären lassen. **C-24 ist nicht überholt.**

## Abnahme

**2026-09-02, Orchestrator.**

### `goal_phases` ist eine Zeitachse, aber kein Plantraeger

`[cmd]` **Alle fuenf Zeilen sind Testdaten** (`source: GO-07
testdata`). `[cmd]` **Die JSON-Schluessel sind
`calorie_surplus_kcal`, `note`, `reason`, `source`** — **keine Zeile
enthaelt eine Planreferenz.**

`[cmd]` **Im Produktpfad wird die Tabelle gelesen, nicht
geschrieben** — nur `updated_at`-Trigger und die Lesefunktion
`goals.phase_am`.

`[cmd]` **Der CHECK erlaubt zehn Phasentypen**, live kommen zwei vor:
`maintenance` (3), `lean_bulk` (2). `[read]` **Darunter
`expert_bb_annual`** — **die Jahresplanung, die Tom beschrieben
hat, ist im CHECK schon vorgesehen.**

### Und die Daten belegen, dass nichts gekoppelt ist

`[cmd]` **Vier Seed-Plaene ohne `start_date`, vier dev-Plaene ab
01./02.09.** `[cmd]` **Die dev-Phasen beginnen am 21.05. und
04.06.**

`[read]` **Weder eine Referenz noch ein ableitbarer Beginn.**

### Sein Ergebnis ist die richtige Antwort auf meine Frage

`[read]` *,,E-54 beschreibt die Zielrichtung, ist aber noch nicht
gebaut. Eine dritte, nutrition-eigene Zeitachse ist vermeidbar; eine
spaetere Plan-Phasen-Verbindung muss die Phase zum Termininhaber
machen und `meal_plans.start_date` daraus ableiten."*

`[read]` **Und er entscheidet den Beziehungstyp ausdruecklich
nicht** — richtig, das ist eine Produktfrage.

`[cmd]` **`user_supplement_cycles` traegt 0 Zeilen** — **das Muster
ist da, die zweite gelebte Zeitachse nicht.**

### C-36 — ein Beweisweg existiert

`[cmd]` **`food_aliases` traegt 12 `curated_suchbegriff`-Zeilen,
saemtlich fuer Reis.** `[cmd]` **`reis` liefert `C352000` auf Platz 1
von 145.**

`[read]` **Das ist der erste funktionierende Fall der geforderten
Begriff-zu-Eintrag-Kuration** — **nicht ihr Abschluss.**

`[cmd]` **Die uebrigen 32.522 Alias-Zeilen sind `editorial` (21.420)
oder `derived` (11.102).**

`[read]` **Und seine Abgrenzung zu E-55 ist sauber:** *,,sie ersetzt
weder den kuratierten Alias noch macht sie aus den abgeleiteten
Aliasen Zuordnungen."*

### C-24 — der Rangfehler besteht fort

`[cmd]` **`kartoffelstock` liefert 16 Treffer, Platz 1 ist
`Kartoffelpueree Instantpulver`** mit `sort_weight 450`.

`[cmd]` **Und die Zahlen haben sich bewegt:** das Namensmuster trifft
**69 Lebensmittel, `sort_weight` im Mittel 214,3** — **nicht mehr 73
mit 369.**

`[read]` **Sein Urteil: kein sicheres Klassifikationsmerkmal**,
einzelne Faelle muessten kuratiert werden.

`[cmd]` **Und er bestaetigt meine Korrektur aus C-384:** keines der
16 Ergebnisobjekte traegt `match_reason`.

**Abgenommen.** **Ein Befund als C-391.**

