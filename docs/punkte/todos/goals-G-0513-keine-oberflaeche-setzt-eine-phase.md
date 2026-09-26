---
nr: G-513
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-26

braucht: []
kind_von: G-510
entscheidung: E-91

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/lib/goals/schreiben.ts
    - apps/web/src/app/v2/goals/fehlende-kacheln.tsx
    - apps/web/src/lib/nutrition/setup-karten.ts

zahlen:
  gemessen: 2026-09-26
  schreibfunktionen_in_der_db: 3
  aufrufer_in_apps: 0
  schreibwege_goals_gesamt: 5
---

# G-513 - die Phase laesst sich nirgends setzen

## Der Befund

`[cmd]` **Die Schreibfunktionen gibt es seit G-357:**

    goals.goal_phase_start(…)
    goals.goal_phase_end(p_phase_id, p_transition_reason, …)
    goals.phase_transition_respond(…)

`[cmd]` **Gemessen 2026-09-26 ueber `apps/` und `packages/`:
NULL Aufrufer.** **Die einzigen Treffer stehen in Kommentaren**
(`fehlende-kacheln.tsx:163-176`), die genau das beschreiben.

## Die Gegenprobe: was Goals sonst schreibt

`[cmd]` **Fuenf Schreibwege gibt es** — und keiner davon ist die
Phase:

    zielAendern              user_goals
    reihenfolgeSetzen        user_goals
    messungAnlegenAktion     body_measurements
    messungAendernAktion     body_measurements
    fotosessionAnlegenAktion progress_photos

`[read]` **Ziel, Messung und Foto kann Tom anlegen. Eine Phase
nicht.**

## Warum das E-91 blockiert

`[cmd]` **`lib/nutrition/setup-karten.ts:96` bietet eine Karte an,
wenn `goal_phases` leer ist:**

    Titel   „Waehl deine Phase"
    Satz    „Die Phase bestimmt das Tempo — Aufbau, Diaet oder
             Halten. Ohne sie bleibt die Rate neutral."
    Knopf   „Phase waehlen"  ->  /v2/goals?tab=phase

`[cmd]` **Der Knopf fuehrt auf den Phasenreiter.** `[cmd]` **Dort
gibt es keinen Ausloeser, der eine Phase anlegt** — die Kachel
`Phase state machine` traegt ihre eigene Marke:

    wartet auf: einen Aufrufer fuer den Phasenwechsel

`[read]` **Die Karte schickt den Nutzer an einen Ort, an dem er das
Angebotene nicht tun kann.** `[read]` **Das ist eine Sackgasse mit
Wegweiser** — derselbe Fall wie der fehlende Ausloeser fuer
`LogPhotoModal`, den G-421 gefunden hat.

## Die fuenf Zeilen sind Seed, nicht Eingabe

`[cmd]` **Alle fuenf `goal_phases`-Zeilen tragen
`"source": "GO-07 testdata"`.** `[read]` **Kein Nutzer hat je eine
Phase gesetzt — es konnte keiner.**

## Zusammenhang

`[read]` **G-511 fragt, OB die Phase wirkt** (sie wirkt nicht).
`[read]` **Dieser Punkt fragt, ob man sie ueberhaupt setzen kann**
(kann man nicht).

`[read]` **Beide muessen durch, damit Toms Satz gilt:** *,,ein tag
komplett erfassbar — essen, training, supplemente, check-in. IN
ABHAENGIGKEIT MIT GOALS."*

`[read]` **Reihenfolge: erst dieser Punkt** — eine Phase, die wirkt,
aber nicht gesetzt werden kann, nuetzt niemandem.

## Was die Spec dazu sagt

`[cmd]` **`docs/specs/Goals/OPEN_ITEMS.md:75` nennt es selbst:**
*,,Phase Transitions | Nur manuell via API — kein automatischer
Guard-Trigger in DB"*.

`[cmd]` **Und `OPEN_ITEMS.md:60`:** *,,Phase-Wechsel ohne Ziel? Ja —
Phase ist unabhaengig vom konkreten Ziel waehlbar"* — **die
Entscheidung ist also getroffen, nur nicht gebaut.**

## Die Vorlage liegt vor

`[cmd]` **`module-goals-pro.jsx:261-317`** zeigt die Phasenauswahl
als Raster, **jede Phase anklickbar** mit Vorschau.

`[cmd]` **`module-goals-editor.jsx`** traegt den ganzen Editor —
Varianten, Parameter, Dauer, Guards, Exit-Bedingungen.

`[read]` **Nicht erfinden** — die Vorlage steht da (E-83s Lehre aus
G-475/G-478).
