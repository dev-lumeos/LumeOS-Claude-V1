---
nr: G-426
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-466
entscheidung: E-35
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a33bf493
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-426 — die Supplementspalte in Nutrients

## Der Leseweg steht

`[cmd]` **C-466, heute abgenommen:**

    supplements.daily_nutrient_summary_long
      user_id, entry_date, nutrient_code, nutrient_unit,
      total_amount, taken_log_count, skipped_log_count,
      mapped_taken_log_count, unmapped_taken_log_count

    nutrition.nutrient_intake_source_totals_for_day
      fuehrt beide Quellen zusammen

    nutrition.nutrient_upper_limit_assessment_with_supplements
      (p_user_id, p_entry_date)

## Was Tom will

Tom, 2026-09-08, woertlich:

> uebereinander OHNE summe ? die summe haben wir weiter hinten
> schon in der auflistung.

    Vitamin D    11,2 ug      Nahrung
                 25,0 ug      Supplement

`[read]` **Zwei Zeilen, keine dritte.** `[read]` **Und *,,wo
vorhanden"*** ? **wer kein Praeparat nimmt, sieht eine Zeile.**

## Und die Detailansicht

Tom: *,,und denk an die detailansichten, da muss natuerlich
supplements auch rein."*

`[cmd]` **`naehrstoff-modal.tsx` 15,9 KB,
`naehrstoff-detail-read.ts` 6,2 KB.**

`[read]` **In der Uebersicht steht eine Zahl** ? **im Detail
steht, WORAUS sie kommt.**

`[cmd]` **C-466 liefert beides:** **mit Produkt-FK der
Produktname, ohne FK die Substanz.**

## Die Obergrenze

`[cmd]` **C-344: die Grenzen fuer Magnesium, Niacin und
Folsaeure gelten NUR fuer Supplemente.**

`[cmd]` **`nutrient_upper_limit_assessment_with_supplements`
rechnet das** ? **die Kachel ruft sie, sie baut die Regel nicht
nach.**

`[read]` **Wenn eine Warnung erscheint, muss dabeistehen, gegen
welche Referenz sie laeuft.**

## Was zu messen ist

`[cmd]` **`micronutrient_overview_items` traegt heute EINE Quelle
je Naehrstoff (`value_source`).**

`[read]` **Miss, ob die Uebersicht eine zweite braucht** ? **oder
ob der neue Leser sie mitbringt.**

`[cmd]` **Und die Daten sind duenn:** **331 Zeilen in der
Supplementbilanz, drei Naehrstoffe (Omega-3, Magnesium,
Vitamin D).**

`[read]` **Wo nichts ist, steht nichts** ? **keine Nullzeile.**

## Der Leseweg traegt Daten, 2026-09-08

`[cmd]` **Alle drei aus C-466 sind live, selbst gemessen:**

    supplements.daily_nutrient_summary_long          DA
    nutrition.nutrient_intake_source_totals_for_day  DA
    nutrition.nutrient_upper_limit_assessment_
      with_supplements                               DA

`[cmd]` **Und er traegt Daten:**

    PROT625   48,00 g    |  168,00 g
    ENERCC   240,00 kcal |  910,00 kcal
    CA       260,00 mg   |  420,00 mg

`[read]` **Das sind Toms eigene Supplemente aus dieser
Sitzung** ? **das Whey aus dem Fruehstueck, das Rezept, der
Stack.**

### Was seither dazukam

    C-519  Supplements bleiben SSOT, Meal verweist
    C-521  die Tagessumme liest Intake-Snapshots
    C-529  der Stackeintrag kennt sein Produkt
    G-484  Produkt in Stack oder Mahlzeit
    G-489  der Ghost bestaetigt sie

`[read]` **Die Zahlen entstehen jetzt an fuenf Stellen** ?
**und landen alle in derselben Sicht.**

`[cmd]` **`naehrstoff-ordnung-tab.tsx` 27,8 KB,
`naehrstoff-modal.tsx` 15,5 KB.**


## Bericht

**Claude Code, 2026-09-24. Gemessen auf `dev@lumeos.app`,
Dev-Server 3200.**

### Was gebaut wurde

    naehrstoff-ordnung.ts        die zweite Quelle im Leseweg
    naehrstoff-ordnung-tab.tsx   zwei Zeilen statt einer
    naehrstoff-detail-read.ts    Herkunft + Obergrenze
    naehrstoff-modal.tsx         die Herkunft im Detail

### Die Abnahmebedingungen

`[cmd]` **`node tools/_g426-quellen.mjs`** ? **25 Proben, alle
gruen, Austritt 0.** **Die SOLL-Werte holt das Skript selbst per
`psql`** ? keine Zahl steht darin von Hand.

**A1 ? zwei Zeilen, KEINE Summenzeile.**

`[cmd]` **12 Naehrstoffe mit beiden Quellen am 2026-09-22**, und
es sind dieselben zwoelf, die die Datenbank nennt. `[cmd]` **Jeder
Supplementwert einzeln gegen `psql` geprueft:**

    CHO       247,8 g Nahrung  |   32 g Supplement
    SUGAR      45,1 g           |   11 g
    PROT625   181,0 g           |  168 g
    CA        721,9 mg          |  420 mg
    ENERCC  2.378,8 kcal        |  910 kcal

`[cmd]` **Zeilen mit einer DRITTEN Herkunftszeile: 0.** **Es wird
nichts addiert** ? die Spalte traegt zwei Zahlen, keine Summe.

**Bild:** `tools/_g426-a1-zwei-zeilen.png`

**A2 ? nur Nahrung: EINE Zeile.**

`[cmd]` **126 Naehrstoffe ohne Praeparat tragen eine Zeile ohne
Herkunftswort**, 12 tragen zwei ? **138 gesamt, so viele wie
`nutrient_defs` fuehrt.** `[read]` **Keine Nullzeile:** wo kein
Supplement wirkt, steht auch keins (E-72).

**A3 ? das Detail nennt Produkt ODER Substanz.**

`[cmd]` **`PROT625` am 2026-09-22:** 13 `food`-Zeilen (181 g) und
7 `meal_supplement`-Zeilen (168 g) **mit Produktnamen** ? *„ON
Optimum Nutrition Gold Standard 100% Whey Chocolate Hazelnut"*.

`[cmd]` **`FAPUN3` am 2026-08-19:** eine `supplement`-Zeile
**ohne Produkt-FK** ? sie traegt die **Substanz** *„Omega-3
(EPA/DHA)"* und ist als solche gekennzeichnet.

**Bild:** `tools/_g426-a3-detail.png`

**A4 ? die Obergrenze rechnet beide Quellen.**

`[cmd]` **`CA` am 2026-09-21:**

    Nahrung allein      1.422,8 mg
    beide Quellen       1.682,8 mg   von 2.500 mg = 67,3 %

`[read]` **Die zweite Zahl ist groesser als die erste** ? genau
das ist der Nachweis, dass beide Quellen zaehlen. `[cmd]`
**`upper_limit_scope` = `all_recorded_intake_sources`**, und der
Satz dazu steht in der Kachel.

`[cmd]` **`MG` am selben Tag: `supplements_only`** ? C-344, die
Grenze gilt nur fuer Praeparate, **und die Kachel sagt es.**

**Bild:** `tools/_g426-a4-grenze.png`

**A5 ? vier Module unveraendert.**

`[cmd]` **`node tools/_g426-module.mjs`** ? Training 47 Karten,
Recovery 72, Medical 50, Supplements 58, Goals 58. **Null
Seitenfehler.**

**A6 ? Gate.**

`[cmd]` **`pnpm gate` GRUEN, 18 von 18, Austritt 0.**
**`apps/web` 1.982 bestanden / 0 gefallen, `apps/coach` 65 / 0.**

### Die Sabotageprobe

`[read]` **Eine Pruefung, die nicht rot werden kann, misst
nichts.** **Zwei Eingriffe, beide kamen an:**

`[cmd]` **1 ? die Bedingung entfernt** (`k.supplement === null`
durch `false` ersetzt): **12 Zeilen wurden 119** ? die Probe
meldete die falsche Nullzeile, die E-72 verbietet.

`[cmd]` **2 ? den Supplementwert verdoppelt:** **Austritt 1**,
**zwoelf rote Zeilen** ? CA 840 statt 420, CHO 64 statt 32.

`[read]` **Der zweite Eingriff hat die Probe selbst verbessert:**
die erste Fassung DRUCKTE die Zahlen nur und blieb dabei gruen.
**Seither holt sie den SOLL-Wert aus `psql` und vergleicht.**

### Drei Befunde, die den Auftrag betreffen

**1** ? `[cmd]` **Die Tagessumme des Tabs ist die
NAHRUNGSSUMME.** **Gemessen:** `nutrient_summary_window` liefert
fuer alle zwoelf Codes **exakt `food_amount`** ? CA 721,86 gegen
721,86, PROT625 180,99 gegen 180,99.

`[read]` **Die Supplemente standen daneben und wurden bisher
nicht gezeigt.** `[read]` **Das ist die Luecke, die G-426
schliesst** ? und zugleich der Grund, warum keine Summe gebildet
werden musste: **`wert` war schon eine Quelle, nicht beide.**

**2** ? `[cmd]` **Der Leseweg kennt DREI Herkunftsarten, nicht
zwei.** C-466 lieferte `food` und `supplement`; **C-513/C-519 hat
`meal_supplement` ergaenzt** ? das Praeparat im Essen.

`[read]` **Die Uebersicht fasst die beiden Supplementwege zu
EINER Zeile zusammen** (Tom will zwei Zeilen) ? **im Detail
bleiben sie getrennt**, denn dort lautet die Frage gerade: woher.

**3** ? `[cmd]` **`product_name` unterscheidet NICHT mehr, ob ein
Produkt haengt.** **Gemessen:** bei `FAPUN3` steht dort *„Omega-3
(EPA/DHA)"*, waehrend `product_id` leer ist. `[read]` **Die Frage
*,,kommt der Name aus einem Produkt?"* beantwortet nur
`product_id`** ? die erste Fassung las `product_name` und meldete
faelschlich *Produkt*.

### Ein Befund fuer Codex ? nicht von mir behoben

`[cmd]` **Die Obergrenze ist an den meisten Tagen nicht
rechenbar.** **Am 2026-09-22: 1 von 18 Zeilen `complete`**, der
Rest `incomplete_supplements`.

`[cmd]` **Der Grund liegt in
`nutrient_intake_source_breakdown_for_day`:**
`meal_supplement_missing_count` **zaehlt `item_count` minus
`value_count`** ? **ein Praeparat, das einen Naehrstoff schlicht
NICHT enthaelt, wird als fehlende Messung gezaehlt.**

`[cmd]` **Bei sieben Whey-Posten heisst das fuer jeden
Mikronaehrstoff, den Whey nicht fuehrt: `missing = 7`** ? und
damit keine Zahl.

`[read]` **Eine Abwesenheit ist keine Luecke.** `[read]` **Das
liegt in `supabase/` und gehoert Codex** ? ich habe es gemessen,
nicht angefasst.

### Zwei Sachen, die ich an meiner eigenen Probe korrigiert habe

`[cmd]` **1 ? `fenster=1` fehlte in der Adresse.** Ohne den
Parameter galt die **gespeicherte** Ansicht des Nutzers, und die
stand auf einem Mehrtagesfenster: der erste Lauf zeigte CHO
13,5 g, die Datenbank fuehrt fuer den Tag 32 g. `[read]` **Die
Zahl war richtig ? die Frage war eine andere.**

`[cmd]` **2 ? ein Durchgang klappte nicht alles auf.** Sechs
Zeilen fehlten (`FRUS`, `GALS`, `GLUS`, `LACS`, `MALS`, `SUCS` ?
die vierte Ebene unter CHO ? SUGAR ? MNSAC). `[read]` **Ihre
Chevrons ENTSTEHEN erst, wenn die dritte Ebene offen ist.**

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`, heisses
Nachladen. **Kein `packages/ui`, keine Umgebung, kein Schema.**

### Werkzeuge

    tools/_g426-quellen.mjs   A1-A4, 25 Proben, Austritt 0/1
    tools/_g426-grenze.mjs    A4 im Bild
    tools/_g426-module.mjs    A5, fuenf Module
    tools/_g426-fehlend.mjs   Diagnose der sechs Zeilen

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **12 Naehrstoffe mit beiden Quellen am 2026-09-22:**

    PROT625   181,0 Nahrung  |  168,0 Supplement
    ENERCC  2.378,8          |  910,0
    CA        721,9          |  420,0
    CHO       247,8          |   32,0

`[cmd]` **138 `nutrient_defs`, 126 nur aus Nahrung** ? **seine
Rechnung 126 + 12 = 138 geht auf.**

`[cmd]` **Proben: web 1982/1982, coach 65/65.**

### Drei Befunde, alle echt

**1** ? *,,Die Tagessumme des Tabs WAR die Nahrungssumme.
`nutrient_summary_window` liefert exakt `food_amount` ? die
Supplemente lagen daneben und wurden nie gezeigt."*

`[read]` **Darum war auch keine Summe zu bilden: `wert` war
schon eine Quelle.** **Toms *,,uebereinander OHNE summe"* war
genauer, als er wissen konnte.**

**2** ? *,,DREI Herkunftsarten, nicht zwei ? C-513/C-519 hat
`meal_supplement` ergaenzt."*

`[read]` **Uebersicht fasst beide Supplementwege zu einer
Zeile (Toms Vorgabe), im Detail bleiben sie getrennt.**

**3** ? *,,`product_name` unterscheidet nicht mehr, ob ein
Produkt haengt ? nur `product_id` tut das. Meine erste Fassung
meldete faelschlich *Produkt*."*

### Und die Sabotage fand einen Fehler in seiner Probe

> *,,Der zweite Eingriff deckte auf, dass meine erste
Probenfassung Zahlen nur DRUCKTE ? seither holt sie den
SOLL-Wert selbst aus psql."*

`[read]` **Dieselbe Klasse wie G-493: *,,Gleichheit ohne
SOLL-Wert kann nicht rot werden"* ? hier war es gar kein
Vergleich.**

**Abgenommen.**


