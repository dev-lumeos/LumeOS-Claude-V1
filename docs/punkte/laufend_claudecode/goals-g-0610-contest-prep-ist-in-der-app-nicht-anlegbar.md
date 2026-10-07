---
nr: G-610
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-07
agent: claudecode
beauftragt: 2026-10-07

braucht: [G-608]
kind_von: G-608

quellen:
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien: []
---

# contest_prep ist in der App nicht anlegbar

## Befund

`[read]` Claude Code, G-608: das Anlegemodal bietet nur Strategien mit
`tier = 'simple'` an (Filter aus G-554). `contest_prep` ist `advanced` -
die Wettkampfvorbereitung samt Dauer-Anteilen, Stufenwochen und Ankerplan
ist gebaut, aber kein Nutzer kommt hinein. Der Nachweis lief nur ueber ein
per SQL angelegtes Ziel.

`[read]` Dazu: tragen die gespeicherten Stufen mehr Wochen als die
Gesamtdauer, beginnt die erste Stufe VOR dem Zielbeginn (Nachweis: 30.09.
statt 07.10.). Sichtbar ist das nur im Abweichungssatz.

## Was zu entscheiden ist (Tom)

1. Sollen fortgeschrittene Strategien (contest_prep u. a.) im Anlegemodal
   waehlbar sein - fuer alle, nach einer Erfahrungsfrage, oder nur ueber
   einen Coach?
2. Wenn die Stufen laenger sind als die Gesamtdauer: darf der Plan vor dem
   Zielbeginn starten, oder verschiebt sich das Zieldatum, oder wird das
   Speichern verweigert?

---

## Entschieden - 2026-10-07, Tom

1. *,Erfahrungsgrad pro und elite"* - fortgeschrittene Strategien sind
   waehlbar, wenn `public.profiles.experience_level` `pro` oder `elite` ist.
2. *,gespeicherte sachen sind seed, verschieb das enddatum einfach.
   richtig angelegte plaene haben ein ziel datum und anhand dem wird
   geplant"* - der Plan wird vom Zieldatum aus vorgeschlagen; aendert der
   Nutzer Stufenwochen so, dass die Summe nicht mehr passt, verschiebt
   sich das Enddatum. Kein Beginn vor dem Zielbeginn.

`[cmd]` **Gemessen beim Schreiben, 07.10.:** von 17 Strategien sind nur 3
`simple` (`gain`, `lose`, `maintain`), **14 sind `advanced`** - darunter
`moderate_cut`, `lean_bulk`, `mini_cut`, `contest_prep`. Das Anlegemodal
zeigt heute also nur drei. Die Grade gibt es schon:
`profile-model.ts:87` `EXPERIENCE_LEVELS = ['beginner','advanced','pro','elite']`;
dasselbe Muster steht in Supplements (`extended-regel.ts:39`
`GRAD_FUER_EXTENDED = 'pro'`).

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-610: fortgeschrittene Strategien ab pro, Enddatum folgt den Stufen
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

1. Messen: wo filtert das Anlegemodal auf `tier = 'simple'` (G-554), wie
   kommt `experience_level` des Nutzers dorthin; was zeigt es heute fuer
   test-user (Grad nennen).
2. `advanced`-Strategien erscheinen ab `pro`; darunter nur `simple`, mit
   einem Satz, warum mehr gesperrt ist. Eine gemeinsame Regel, keine
   zweite Gradliste (vorhandenes `EXPERIENCE_LEVELS` nutzen).
3. Zeitachse/Ankerplan: Plan beginnt nie vor dem Zielbeginn; ist die
   Summe der Stufen groesser als die Gesamtdauer, verschiebt sich das
   Enddatum und der Satz sagt das (statt ,gerechnet wird mit 17").
4. Schirmnachweis auf `test-user@lumeos.local`: mit Grad unter pro nur 3
   Strategien, mit pro alle; contest_prep ueber die Oberflaeche anlegen
   (G-604 beachten), Stufen laenger machen -> Enddatum verschiebt sich;
   Rueckbau inkl. Grad. Bilder nach `backup/`.
5. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.

## Berichtigt - 2026-10-07 13:54, Tom

**Tom:** *,610 gehe ich mit dir nicht einig"* - nicht ,alle fortgeschrittenen
ab pro", sondern ein Mindestgrad JE STRATEGIE:

| Kategorie | Strategie | ab Grad |
|---|---|---|
| fat_loss | lose | beginner |
| fat_loss | conservative_cut, mini_cut, moderate_cut | advanced |
| fat_loss | aggressive_cut | pro |
| muscle_gain | gain | beginner |
| muscle_gain | clean_bulk, lean_bulk | advanced |
| muscle_gain | aggressive_bulk | pro |
| hybrid | maintain | beginner |
| hybrid | body_recomp | advanced |
| contest_prep | contest_prep, peak_week | pro |
| expert | custom, expert_bb_annual, maintenance_diet_break | pro |
| recovery | reverse_diet | **offen - Tom fragen** |

`[annahme]` `maintain` steht in `hybrid`; Tom nennt es zuerst ausdruecklich
,beginner" und dann ,hybrid: beide advanced". Hier gilt beginner, bis Tom
es anders sagt.

`[read]` Folge fuer die Bauart: das ist ein Wert je Strategie, also ein
Katalogfeld - dasselbe Muster wie `supplements.supplement_groups.min_experience_level`.
Der Grad gehoert in `goals.goal_strategies` (Codex, Kette und live), die
Oberflaeche liest ihn (Claude Code). **Der Auftrag oben (,advanced ab pro")
ist damit ueberholt; der Oberflaechenteil wartet auf das Katalogfeld.**

---

## Auftrag - ERSETZT alle obigen Auftragsteile (2026-10-07, 14:15)

    AUFTRAG FUER Claude Code - G-610: EINE Strategieauswahl nach dem Mockup
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

**Tom:** *,das will ich schnellstmoeglich erledigt und grafisch brauchbar
in der UI sehen."* Vorlage ist das Mockup, nicht das Vorgaengerrepo.

Rundgang 07.10. (`backup/rundgang-goals/01..04`, G-612): drei Auswahlen auf
einer Seite (17 Strategien in fest codierten Reitern, 9 Phasenarten,
Mockup-Attrappe ,Phase state machine" mit 7 Karten); Reiter Hybrid sammelt
hybrid+recovery; Sperre nur fuer beginner; Anlegemodal nur 3 Strategien.

**Soll (Mockup `module-goals-pro.jsx:5-68` und `:259-330`, Spec
`PHASE_MODELS.md`):**

1. EINE Auswahl: das Raster ,Phase state machine" mit sieben Karten
   (Fat Loss, Lean Bulk, Maintenance, Recomposition, Contest Prep, Reverse
   Diet, Expert BB Annual), Farben und Zustaende wie im Mockup (current /
   recommended next / switchable / gesperrt). Die Attrappe wird zur echten
   Auswahl; die Reiterliste und die getrennte Phasenarten-Liste gehen darin
   auf - nichts doppelt.
2. Klick auf eine Karte: Vorschaupanel wie Mockup, darin die Strategien
   dieser Karte als Varianten (z. B. Fat Loss: Abnehmen, Conservative,
   Moderate, Mini, Aggressive) mit Parametern aus `goal_strategies`.
3. Sperre je Strategie nach `goal_strategies.min_erfahrung` gegen
   `profiles.experience_level`, mit Satz ,ab pro" o. ae.; Karte gesperrt,
   wenn ALLE Varianten gesperrt sind. Gruppierung aus
   `goal_strategies.phasen_karte` - KEINE feste Liste im Code (beide
   Spalten kommen mit Codex' G-614; bis dahin gegen die Kette bauen,
   Schirmnachweis erst nach G-614 live).
4. Das Anlegemodal ,Neues Ziel" nutzt dieselbe Auswahl (nicht nur 3).
5. Zeitachse/Ankerplan: Plan beginnt nie vor dem Zielbeginn; laengere
   Stufen verschieben das Enddatum, der Satz sagt das (Tom 07.10.).
6. Schirmnachweis auf `test-user@lumeos.local` mit Bildern vorher/nachher:
   Grad beginner -> nur Abnehmen/Aufbauen/Halten waehlbar; pro -> alles
   ausser elite-only; contest_prep ueber die Oberflaeche anlegen (G-604:
   bestehendes Abbauziel vorher pausieren), Rueckbau. Bilder so, dass
   Tom die ganze Seite sieht.
7. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.

---

## Auftrag - ERSETZT ALLE obigen (2026-10-07, 14:15)

    AUFTRAG FUER Claude Code - G-610: ,Ziel setzen" in zwei Ebenen
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

**Tom 14:09:** *,das wo da ist ist nicht brauchbar"* - direkt bauen.
Bauart nach Recherche (RP Diet Coach, MacroFactor, Progressive Disclosure
nach Nielsen: hoechstens zwei Ebenen, ~80 % fertig auf Ebene 1;
TrainingPeaks fuer den Planer):

**Zwei Werkzeuge statt drei Auswahlen.** Dieser Auftrag baut (A); der
Planer (B) ist G-615 und folgt.

(A) ,Ziel setzen":
1. Ebene 1: drei grosse Karten **Abnehmen · Halten · Aufbauen**, dazu
   Zielwert oder Zieldatum und das vorgeschlagene Tempo (aenderbar). Ein
   Anfaenger ist hier fertig - die Standardvariante ist vorgewaehlt.
2. Ebene 2 (aufklappbar, beschriftet ,Vorgehen anpassen"): die Varianten
   der Richtung aus `goal_strategies.auswahl_gruppe`, Standard markiert;
   gesperrte nach `min_erfahrung` gegen `profiles.experience_level`
   bleiben SICHTBAR mit ,ab advanced/pro". Je Variante eine Zeile Zweck
   und die Kernwerte (Tempo, Protein, Dauer) aus dem Katalog.
3. Reverse Diet (`auswahl_gruppe = uebergang`) erscheint nicht in der
   Liste, sondern nach einem Abnehm-Ziel als ,empfohlener naechster
   Schritt" (Mockup ,recommended next", `next_codes`).
4. Die Mockup-Karte ,Phase state machine" wird ANZEIGE: wo stehe ich,
   was ist empfohlen. Keine Auswahl mehr.
5. Weg damit: die fest codierten Reiter (`strategie-regeln.ts:34-40`),
   die getrennte Phasenarten-Auswahl, das 3er-Modal als eigener Weg -
   ,Neues Ziel" oeffnet dasselbe ,Ziel setzen". Keine Liste im Code;
   Gruppen, Grade, Standard kommen aus Codex' G-614 (bis live gegen die
   Kette bauen).
6. Schirmnachweis auf `test-user@lumeos.local`, Bilder der GANZEN Seite
   vorher/nachher: Grad beginner -> nur Standards waehlbar, Rest sichtbar
   gesperrt; pro -> alle; Ziel ueber die Oberflaeche anlegen (G-604:
   Abbauziel vorher pausieren), Rueckbau inkl. Grad.
7. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.
