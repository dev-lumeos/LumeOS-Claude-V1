---
nr: G-612
typ: entscheidung
modul: goals
schwere: hoch
angelegt: 2026-10-07

braucht: []
kind_von: G-610

quellen:
  - docs/punkte/laufend_claudecode/goals-g-0610-contest-prep-ist-in-der-app-nicht-anlegbar.md
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-pro.jsx
  - docs/specs/Goals/PHASE_MODELS.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - apps/web/src/lib/goals/strategie-regeln.ts
---

# Drei Auswahlen auf einer Seite, und keine folgt dem Mockup

## Rundgang 07.10. (Orchestrator ueber Unteragent, nur gelesen)

Bilder: `backup/rundgang-goals/01..04-*.png` (test-user).

`[read]` **Reiter fest im Code**, nicht aus der Datenbank:
`strategie-regeln.ts:34-40` - Fat Loss, Aufbau, Hybrid, Contest, Expert;
`hybrid` sammelt die Kategorien `hybrid` UND `recovery` - deshalb steht
Reverse Diet unter Hybrid und es gibt keinen Reiter Recovery. Uebernommen
aus dem Vorgaengerrepo (`GoalSelector.tsx:19-42`).
`[read]` Im Reiter nur `tier = 'advanced'` - ,Halten" (maintain, simple)
fehlt unter Hybrid. Das Anlegemodal (`modale.tsx:317`) zeigt nur
ohne/Abnehmen/Aufbauen/Halten.
`[read]` Auf derselben Seite drei Auswahlen nach drei Ordnungen:
Strategien (17, `strategie-wahl.tsx`), Phasenarten (9, `phase-regeln.ts`),
Mockup-Attrappe ,Phase state machine" (7).

| Quelle | Ordnung |
|---|---|
| Mockup `module-goals-pro.jsx:5-67` | 7 Phasen, keine Gruppen, Sperre nur Expert BB Annual |
| Spec `PHASE_MODELS.md:10-24` | 7 Phasen als Zustandsautomat; Varianten (moderate/aggressive) und Diet Break als Parameter |
| DB `goal_strategies` | 17 Strategien, 6 Kategorien, simple/advanced |
| UI heute | 3 simple ohne Reiter + 5 Reiter (Hybrid = hybrid+recovery) |

## Was Tom entscheiden muss

1. Welche Ordnung gilt: 7 Phasen (Mockup/Spec) mit Varianten, oder 17
   Strategien in Kategorien (DB)?
2. Mindestgrad je Strategie (Toms Tabelle in G-610) - bestaetigt, offen
   sind `maintain` und `reverse_diet`.
3. EINE Auswahl auf der Seite statt drei.

## Entschieden - 2026-10-07 14:09, Tom

Tom: *,diese aufgabe ist gewachsen, da koennen wir nicht mehr sagen das oder dieses gilt. recherchiere online ...'* und *,das wo da ist ist nicht brauchbar'* - Recherche (RP Diet Coach, MacroFactor, Nielsen Progressive Disclosure, TrainingPeaks ATP) ergab zwei Werkzeuge: (A) ,Ziel setzen' in zwei Ebenen (Richtung, dann Vorgehen) = G-610; (B) ,Planer' fuer mehrphasige Plaene vom Termin rueckwaerts = G-615. Katalogfelder = G-614. Weder die 7 Karten noch die 17 als Liste.

