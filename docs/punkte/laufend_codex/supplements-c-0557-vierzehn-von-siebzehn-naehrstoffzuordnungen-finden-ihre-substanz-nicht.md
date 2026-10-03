---
nr: C-557
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-10-03
agent: codex
beauftragt: 2026-10-03

braucht: [C-295, C-556, A-91]
kind_von: C-295

quellen:
  - docs/punkte/erledigt/quer-c-0295-die-kette-liest-aus-zwei-kimi-pfaden.md
  - docs/punkte/erledigt/supplements-c-0556-zwei-fachliche-folgen-des-neuen-kimi-bestands.md
  - docs/punkte/laufend_codex/quer-a-0091-der-taegliche-lauf-erzeugt-bei-gruen-einen-neuen-dump.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/13_supplements/135_supplement_nutrients.ts
    - supabase/_pipeline/daten/supplement-naehrstoffcodes.json
---

# Vierzehn von siebzehn Naehrstoffzuordnungen finden ihre Substanz nicht

## Auftrag — Kopf

    AUFTRAG FUER Codex - C-557: die 14 local_-Substanzen wieder
                               aufloesbar machen
    Bereich: supabase/_pipeline/13_supplements/
             supabase/_pipeline/daten/supplement-naehrstoffcodes.json
             supabase/_pipeline/_validierung/
    Fremd:   apps/ und packages/ gehoeren Claude Code. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei. A-95 ist dein
             laufender Auftrag und hat Vorrang.
    Stand:   2026-10-03

## Stand 2026-10-03 — lies das zuerst, du faengst ohne Kontext an

`[cmd]` **Deine letzten zwei Auftraege sind abgenommen und committet.
Nicht wiederholen:**

    C-556  16fd9c9c   148 Zeilen in die C-230-Filter,
                      detection_marker als eigener Typ
    A-95   df9cd8aa   Live-Stand nachgezogen: G-567 und G-514
                      eingespielt, alte Zweiparameter-Fassung von
                      berechne_zielwerte entfernt, Seed fuer test-user

`[cmd]` **Die laufende Datenbank ist seit A-95 anders als vorher:**
`goals.goal_contributions` existiert (892 Zeilen),
`nutrition.micronutrient_snapshot` ist zielfrei, und
`goals.berechne_zielwerte` gibt es nur noch dreiparametrig.

`[cmd]` **WICHTIG — die zwei Schalter aus A-95 benutzt du NICHT.**
`030_mikro-uebersicht.ts --a95-live` und
`testdaten-einspielen.ts --a95-goals-only` lassen `PGDATABASE=postgres`
zu. **Sie waren fuer den einen freigegebenen Lauf da und gehen wieder
raus** (A-97). **Dieser Auftrag laeuft ausschliesslich auf einer
Wegwerf-Datenbank.**

`[cmd]` **Umgebung ist oben:** alle neun Supabase-Container healthy, Web
3200 und Coach 3220 laufen. In der Nacht zum 03.10. war Stromausfall
(05:59 bis 07:38); der Wiederanlauf der Datenbank kostete 440 s fsync,
**jede liegengebliebene Wegwerf-Datenbank verlaengert das** (A-80, A-96).

`[read]` **Claude Code arbeitet parallel an G-590** in
`apps/web/src/app/v2/recovery/` und `apps/web/src/lib/recovery/`. **Finger
weg von `apps/` und `packages/`** — dort stehen seine ungesicherten
Aenderungen.

## Der Befund — der Nachtlauf, und warum C-556 ihn nicht gruen gemacht hat

`[cmd]` **Der naechtliche Vollauf vom 2026-10-03, 04:00 Ortszeit, ist
rot** — und zwar aus eigener Kraft, nicht am Stromausfall:

    started_at   2026-10-02T21:00:02Z   (04:00:02 Ortszeit)
    finished_at  2026-10-02T21:03:35Z
    duration     213,6 s
    exit_code    1
    database     lumeos_tageskette_20261002

`[read]` **Dieser Lauf hatte C-556 schon drin** (Commit `16fd9c9c`, am
02.10. um ~17:00 Ortszeit). **C-556 war richtig und hat seine zwei
Schritte gruen gemacht — es faellt jetzt ein dritter**, und zwar vor
ihnen.

`[cmd]` **Der Grund steht im Postgres-Containerlog**, 21:03:34.785 UTC:

    ERROR:  supplement_nutrient_mappings: 3, erwartet 17

`[read]` **Die Fehler um 02:03 bis 02:07 im selben Log sind die
eingebauten Sabotageproben** (`g545_tdee_low`, `invented-protein`,
`fat-floor`, `permission denied for table wallets`). **Die sollen rot
werden** und gehoeren nicht hierher.

## Die Ursache — gemessen, nicht vermutet

`[cmd]` **Der Schritt ist
`supabase/_pipeline/13_supplements/135_supplement_nutrients.ts`** (C-158),
Eingabe `supabase/_pipeline/daten/supplement-naehrstoffcodes.json`.
**Die 17 ist keine festgeschriebene Zahl:** `expectedRows =
data.mappings.length`, und die Datei traegt 17 Zuordnungen.

`[cmd]` **Er loest ueber DREI inneren Verbunde auf** (`:149-151`):

    JOIN supplements.supplement_catalog sc ON sc.slug = p->>'supplement_slug'
    JOIN supplements.substance_catalog  s  ON s.id   = p->>'substance_id'
    JOIN nutrition.nutrient_defs        nd ON nd.code = p->>'nutrient_code'

`[cmd]` **Die 17 `substance_id` tragen ZWEI Gestalten**, vom
Orchestrator am 03.10. aus der Datendatei gezaehlt:

    14x  local_biotin · local_calcium · local_collagen ·
         local_fiber_psyllium_husk · local_folate_b9 · local_iron ·
         local_magnesium · local_vitamin_b12 · local_vitamin_b6 ·
         local_vitamin_c · local_vitamin_d3 · local_vitamin_k2_mk7 ·
         local_whey_protein · local_zinc
     3x  sub_8d8a87d263 (Glutamin) · sub_f8dec97a40 (Glycin) ·
         sub_4480fcfa86 (Omega-3)

`[cmd]` **Gegen den neuen Rohbestand gehalten** (446 Substanzen in
`docs/kimi_research/.../data/substances/`): **von den 17 `substance_id`
treffen genau 3 ein `id`-Feld des Rohbestands** — und das sind die drei
`sub_`-Werte. **Null treffen ueber `canonical_name`.**

`[read]` **Damit ist die Zahl erklaert, ohne eine Annahme:** 3 von 17
loesen auf, weil nur die drei Kimi-IDs im Katalog landen. **Die 14
`local_`-Substanzen kommen nicht aus dem Kimi-Bestand**, sondern aus dem
lokalen Teil von Schritt 134 (`localOwn` in
`expectedSubstanceRows = kimiRows.length + localOwn + f05Own`). **Der
zweite Verbund ist der, der sie fallen laesst.**

`[annahme]` **Was NICHT gemessen ist:** ob Schritt 134 die
`local_`-Substanzen nach dem Pfadwechsel gar nicht mehr anlegt, oder sie
unter anderen IDs anlegt. **Das ist die erste Frage des Auftrags**, und
sie entscheidet, ob die Datendatei oder der Katalogschritt falsch ist.

## Auftrag

**A1 — zuerst zaehlen, welcher Verbund fallen laesst.** `[cmd]` Auf einer
Wegwerf-Datenbank, nach Schritt 134 und vor 135: wie viele der 17 je
Verbund ueberleben — `supplement_catalog.slug`, `substance_catalog.id`,
`nutrient_defs.code`, einzeln. `[read]` **Drei Zahlen, nicht eine
Vermutung.** Der Orchestrator sagt, der zweite sei es; **widerlege oder
belege es.**

**A2 — dann entscheiden, auf welcher Seite der Fehler liegt.** `[read]`
Zwei Moeglichkeiten, und sie fuehren zu verschiedenen Loesungen:

1. **Schritt 134 legt die 14 lokalen Substanzen nicht mehr an** — dann
   gehoert die Korrektur nach 134, und die Datendatei bleibt.
2. **Er legt sie unter anderen IDs an** — dann gehoert die Datendatei
   nachgezogen, mit den neuen IDs, je Zeile belegt.

`[cmd]` **Zaehl beides, bevor du waehlst:** wie viele Zeilen mit
`local_`-Praefix 134 heute in `substance_catalog` schreibt, und wie ihre
IDs lauten.

**A3 — nicht den Verbund lockern.** `[read]` **Ein `LEFT JOIN` wuerde
den Lauf gruen machen und die Bruecke still leer lassen** — genau die
Klasse, die C-230 mit dem Filterzwang verhindert und die du bei C-556
richtig behandelt hast. **Die 17 muessen 17 bleiben**, oder die
Erwartung aendert sich mit einem fachlichen Grund je entfallener Zeile.

**A4 — eine Probe, die diesen Fall faengt.** `[cmd]` In
`_validierung/`, in beiden Kettenmodi verdrahtet, **die je Verbund
zaehlt** und nicht nur die Endzahl. `[read]` **Eine Probe auf „17 = 17"
haette diesen Fehler auch gemeldet, aber nicht gezeigt, wo er liegt** —
und drei Monate spaeter sucht das wieder jemand von Hand.

**A5 — und melde die Lage danach.** `[cmd]` **Wird der Vollauf damit
gruen, erzeugt die naechste Nacht den neuen Dump und A-91/A5 ist
belegt.** Sag im Bericht, was die Nacht vorfinden wird. **Kein Vollauf
von Hand.**

**Nicht Teil:** der Pfadwechsel (C-295) und die zwei Schritte aus C-556
— beide erledigt · `supabase/README.md` · die fehlende
Ausgabeumleitung des geplanten Tasks (A-96, Orchestrator) · A-95, das
ist dein anderer Auftrag und geht vor.

**Zu belegen:** die drei Verbundzahlen aus A1 · die ID-Gestalt der
lokalen Substanzen aus A2 · 17 von 17 nach der Korrektur · die Probe aus
A4 rot bei eingebautem Fehler und gruen danach · Wegwerf-Datenbank
verworfen mit Zaehler · kein `db push` · nichts committen.

`[cmd]` **Und ein Nebenbefund, der dir gehoert, weil er deine Laeufe
betrifft:** ein fehlgeschlagener Tageslauf **verwirft seine
Wegwerf-Datenbank nicht.** Gemessen am 03.10. liegen
`lumeos_tageskette_20260907`, `_20260918`, `_20260919`, `_20260920`,
`_20260921`, `_20261001` und `_20261002` noch da — sieben Stueck.
**Gesamtzahl 156** (02.10.: 152), davon 117 mit `lumeos`-Praefix. `[read]`
**Das ist A-80 und nicht dieser Punkt** — aber nenn es im Bericht, damit
die Zahl nicht wieder nur im Vorbeigehen auftaucht.
