---
nr: G-610
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-07

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
