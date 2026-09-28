---
nr: G-513
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-26

braucht: []
kind_von: G-510
entscheidung: E-91

agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-27
commit: 9681b6f8
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

## Der Zusammenhang, 2026-09-08

`[cmd]` **G-511 ist entschieden: die PHASE entscheidet ueber
die Kalorien, `profiles.nutrition_goal` wird abgeleitet.**

`[read]` **Damit wird dieser Punkt dringend** ? **wenn die
Phase die Kalorien steuert und niemand eine Phase setzen
kann, steuert nichts.**

`[cmd]` **Die Umsetzung von G-511 liegt bei Codex
(`berechne_zielwerte` ist eine Datenbankfunktion)** ? **die
Oberflaeche dazu ist dieser Punkt.**

### Und Toms Zielbild (E-91)

> ein tag komplett erfassbar ? essen, training, supplemente,
> check-in. IN ABHAENGIGKEIT MIT GOALS

`[read]` **Die Abhaengigkeit laeuft ueber die Phase.**


## Bericht

**Claude Code, 2026-09-26.**

### In einem Satz

`[cmd]` **Fuenf Funktionen hatten null Aufrufer — jetzt haben drei
davon einen, und der Weg ist gegen die Datenbank belegt, nicht nur
gegen den Compiler.**

---

### A — was jede der fuenf Funktionen tut

`[cmd]` **Gemessen am RUMPF, nicht an der Signatur:**

    goal_phase_start(phase_type, gueltig_ab, goal_id,
                     projected_end_date, variant, parameters)
      -> uuid.  Nimmt user_id aus dem JWT, NICHT als Parameter.
      -> WEIST AB, wenn schon eine Phase laeuft (23505).
      -> prueft, ob goal_id dem Nutzer gehoert (42501).
      -> `recommended_next` bleibt bewusst leer.

    goal_phase_end(phase_id, transition_reason, actual_end_date)
      -> uuid.  GRUND IST PFLICHT (22023 bei leer/blank).
      -> UPDATE nur auf eigene, LAUFENDE Phase, und nur
         wenn actual_end_date >= gueltig_ab, sonst P0002.

    phase_am(user_id, stichtag)
      -> die am Stichtag GUELTIGE Phase.
      -> ACHTUNG: liefert auch eine BEENDETE, wenn
         actual_end_date >= stichtag.

    phase_transition_recommendation(user_id, as_of)
      -> SCHREIBT (UPDATE auf recommended_next).
      -> liefert nur bei projected_end_date <= as_of
         UND >= 2 Koerpermessungen.

    phase_transition_respond(phase_id, response, reason)
      -> schreibt NUR eine Zeile in
         phase_transition_responses.
      -> WECHSELT NICHTS, auch nicht bei 'accepted'.

`[read]` **Zwei Eigenschaften haben den Entwurf bestimmt** —
**beide stehen nicht in der Signatur:**

**1** — `goal_phase_start` **sperrt.** `[read]` **Es gibt keinen
Wechsel, nur ein Beenden und ein Beginnen.** **Also zwei
Handgriffe, und die Kachel sagt das.**

**2** — `phase_am` **liefert auch Beendetes.** `[cmd]` **Wer nur
auf `echt.phase` prueft, sperrt den Start hinter einer Phase, die
laengst vorbei ist.** **Laufend heisst `actual_end_date == null`.**

### B — der Vorschlagsweg

`[cmd]` **Er ist ein ZWEITEILER, und der zweite Teil tut weniger,
als sein Name sagt.**

`[cmd]` **`phase_transition_recommendation` ist eine REGEL, keine
Empfehlung aus Daten** (`422_…sql:48`):

    lean_bulk     -> mini_cut
    fat_loss      -> maintenance
    mini_cut      -> maintenance
    contest_prep  -> reverse_diet
    reverse_diet  -> maintenance
    alles andere  -> recomp

`[cmd]` **Sie feuert nur, wenn das geplante Ende ueberschritten ist
UND mindestens zwei Koerpermessungen vorliegen.**

`[cmd]` **`phase_transition_respond` schreibt eine Zeile, mehr
nicht** — CHECK erlaubt `accepted` und `rejected`.

`[read]` **Deshalb sagt die Kachel nach einem Ja NICHT
*,,gewechselt"***, sondern: *,,Die Zustimmung ist gespeichert.
Gewechselt ist damit noch nichts — beende die Phase, dann beginnt
die neue."*

`[read]` **Das ist der Unterschied zwischen einer Zusage und einer
Tatsache** — dieselbe Falle wie die Setup-Karte, die diesen Punkt
ausgeloest hat.

### C — was die Mockups zur Phase sagen

`[cmd]` **Die Geste ist uebernommen, nicht erfunden:**

    module-goals-pro.jsx:262-292  Raster, eine Kachel je Phase
                                  der Klick setzt NUR `preview`
    :295-429                      Vorschau klappt DARUNTER auf
                                  -- KEIN Modal
    :421                          erst dort „Switch to X"

`[read]` **Die Vorschau IST der Bestaetigungsschritt.** **Einen
zweiten Dialog kennt die Vorlage nicht, also gibt es hier
keinen.**

`[cmd]` **Drei Stellen, an denen ich der DATENBANK statt der
Vorlage gefolgt bin — je mit Grund:**

**1** — **Neun Phasenarten statt sieben.** `[cmd]` **Das Mockup
kennt sieben und nennt `mini_cut` als Folgephase, ohne sie zu
definieren** (G-515, W2). `[cmd]` **Der CHECK erlaubt neun.**
`[read]` **Wer `mini_cut` nicht anbietet, verbietet einen
Zustand, den die Datenbank erlaubt.**

**2** — **Ein „Phase beenden" GIBT ES IM MOCKUP NICHT.** `[cmd]`
**Gemessen: kein Knopf, kein Grund-Feld, weder in `GoalsPhaseView`
noch im Editor.** `[read]` **Die Vorlage denkt das Beenden als
Nebenwirkung des Wechsels** — **die Datenbank nicht.** **Hergeleitet
aus `goal_phase_end`, das einen Grund verlangt.**

**3** — **Keine Auswahlliste fuer `variant`.** `[cmd]` **Die Spalte
ist `text` ohne CHECK.** `[read]` **Eine Liste waere eine Zusage,
die das Schema nicht deckt.**

### D — was in `parameters` gehoert: NICHTS, vorerst

`[cmd]` **Live stehen dort vier Schluessel:** `calorie_surplus_kcal`,
`note`, `reason`, `source`.

`[cmd]` **Die Spec nennt acht andere** (`DATABASE.md:110`):
`calorie_target`, `protein_g`, `carbs_g`, `fat_g`, `rate_target`,
`max_duration_weeks`, `refeed_days`, `deload_frequency` — **und
ihre Sicht liest `calorie_target`** (`:414`), **nicht
`calorie_surplus_kcal`.**

`[cmd]` **Das Vorgaengerrepo nennt je Phase einen ANDEREN Namen:**
`calorieDeficit`, `calorieSurplus`, `calorieTarget`.

`[read]` **Drei Quellen, drei Schluesselnamen — und G-511 macht den
Schluessel TRAGEND.** `[cmd]` **Deshalb schreibt die Oberflaeche
`parameters` NICHT.** `[read]` **Ein hier erfundener Schluessel
waere eine Zahl, die die Rechnung nicht liest** — **und das faellt
niemandem auf, weil die Kachel sie brav anzeigt.**

`[cmd]` **Ein Waechter haelt das fest** (Zusicherung 16): die
Oberflaeche darf keinen `parameters`-Schluessel erfinden.

`[read]` **Der Satz steht auch in der Kachel** — damit der naechste
nicht sucht.

---

### Was gebaut wurde

    lib/goals/phase-regeln.ts     93 Z.  neun Arten, drei Pruefungen
                                         (kein Server-I/O -- A-30)
    lib/goals/phase-write.ts     207 Z.  drei rpc-Aufrufe,
                                         Fehlercodes uebersetzt
    v2/goals/phase-aktionen.ts    75 Z.  'use server', Fehler als WERT
    v2/goals/phase-setzen.tsx    442 Z.  drei Kacheln
    __tests__/g513-…test.ts      165 Z.  16 Zusicherungen

`[cmd]` **`ansicht.tsx`: drei Kacheln eingehaengt + `laufendePhase`
abgeleitet.**

### Die Abnahmebedingungen

**Eine Phase laesst sich starten** — `[cmd]` **belegt gegen die
Datenbank** (`test-user@lumeos.local`, mit JWT-Claim):

    goal_phase_start('lean_bulk','2026-09-20',null,
                     '2026-11-01','moderate')
      -> 1704f488-…
      -> Zeile: lean_bulk | moderate | 2026-09-20 |
                2026-11-01 | (laeuft) | {}

**Eine Phase laesst sich beenden, mit Grund** — `[cmd]` **belegt:**

    goal_phase_end(…,'Zielgewicht erreicht','2026-09-26')
      -> Zeile: actual_end_date 2026-09-26,
                transition_reason 'Zielgewicht erreicht'

**Und die Abweisungen, alle vier gemessen:**

    zweiter Start bei laufender Phase  -> 23505  abgewiesen
    leerer Grund ('   ')               -> 22023  abgewiesen
    Enddatum vor Beginn                -> P0002  abgewiesen
    nach dem Beenden: Start wieder     -> a190b348-…  geht

`[cmd]` **Danach aufgeraeumt** — Testzeilen geloescht, **die fuenf
Seedzeilen sind unveraendert.**

**Der Vorschlagsweg: GEBAUT.** `[cmd]` **`phase_transition_respond`
belegt** (`accepted` / `'passt'` geschrieben und wieder entfernt).
`[read]` **Die Empfehlungsfunktion wird NICHT beim Anzeigen
gerufen** — **sie macht ein `UPDATE`, und eine Leseseite darf nicht
schreiben.** **Die Kachel liest die Spalte, die die Funktion
fuellt.** `[cmd]` **Ein Waechter haelt das fest (Zusicherung 14).**

**Ohne aktive Phase: eine Erklaerung, kein leeres Feld** —
`[cmd]` **drei Leerfaelle, jeder benannt (E-72):**

    keine Phase       das Raster steht offen, neun Arten
    Phase laeuft      Satz VOR dem Raster, warum es gesperrt ist
    kein Vorschlag    nennt BEIDE Bedingungen der Regel
                      (geplantes Ende + zwei Messungen)

**Vier Module unveraendert** — `[cmd]` **`git status`: nur
`apps/web/src/app/v2/goals/` und `apps/web/src/lib/goals/`.**

### Was gelaufen ist

    pnpm gate            18 von 18            GRUEN
    Proben apps/web      2029 pass, 0 fail    (vorher 2013)
    npx tsc --noEmit     gruen
    next build           laeuft durch
    serverimport         55 Chunks, 0 Treffer

`[cmd]` **Sabotageprobe: SECHS Eingriffe, jeder von genau seiner
Zusicherung gefangen:**

    rpc-Name verdreht        -> 3  Aufrufer weg        ROT
    Kachel nicht gerendert   -> 6  gebaut+unerreichbar ROT
    Sperre entfernt          -> 9  Raster offen        ROT
    Grundpruefung raus       -> 11 Knopf ohne Grund    ROT
    mini_cut geloescht       -> 12 acht statt neun     ROT
    „Phase gewechselt."      -> 13 Falschaussage       ROT
    alles zurueckgebaut      -> 16 von 16              GRUEN

### Der Schirmnachweis — NACHGEHOLT 2026-09-27

`[cmd]` **Drei Bilder, `/v2/goals?tab=phase`, 1440 px:**

    backup/x-g513-phase.png      dev@lumeos.app (Phase laeuft)
    backup/x-g513-leer.png       test-user (keine Phase)
    backup/x-g513-vorschau.png   test-user, nach dem Klick

**1 — Die Kacheln stehen da** (`dev@lumeos.app`):

    [data-phasenwahl]            9    alle neun Arten
    [data-phase-beenden-oeffnen] 1
    sichtbar  Phase beginnen 2 · Phase beenden 1 ·
              Wechselvorschlag 1
    konsolenfehler 1   (die data-mode-Warnung, nicht meine)

**2 — Ohne laufende Phase faellt das Beenden weg**
(`test-user@lumeos.local`, 0 Phasen):

    [data-phasenwahl]            9
    [data-phase-beenden-oeffnen] 0    <- richtig weg
    sichtbar  Phase beginnen 1

`[read]` **Die Kachel erscheint nur, wenn es etwas zu beenden
gibt** — die Ableitung `actual_end_date == null` wirkt am Schirm.

**3 — Der Klick oeffnet die Vorschau** (`fat_loss`):

    [data-phasenfeld]  3    Start, geplantes Ende, Variante
    [data-phase-start] 1
    sichtbar  „wird begonnen" 1

`[read]` **Die Geste der Vorlage ist am Bild belegt:** Kachel ->
Vorschau darunter -> Knopf. **Kein Modal.**

### Und ein Beleg, den ich nicht gesucht habe

`[cmd]` **Der erste Klickversuch lief auf `dev@lumeos.app` und
SCHEITERTE:**

    <div class="v2-card"> intercepts pointer events
    retrying click action, attempt #32

`[cmd]` **Nachgemessen mit `elementFromPoint`:** das Raster traegt
`pointer-events: none` und `opacity: 0.5`.

`[read]` **Das ist kein Fehler — das ist die Sperre aus dem
Funktionsrumpf, am Schirm wirksam.** `[cmd]` **`dev@lumeos.app`
hat eine laufende `lean_bulk`-Phase, also ist der Start
gesperrt** — **genau wie `goal_phase_start` es mit `23505`
erzwingen wuerde.**

`[read]` **Die Oberflaeche weist ab, BEVOR die Datenbank es tun
muss.**

`[cmd]` **Offen sind damit ZWEI Bilder:** das Foto der
Phasenkachel (dieser Punkt) **und das der FFMI-Kachel aus
G-512.**

`[read]` **Was den Schirm ersetzt, ersetzt ihn nicht ganz** — aber
der Weg ist an beiden Enden belegt: **die Datenbank hat die Zeilen
geschrieben und wieder hergegeben**, und der Bau laeuft durch.

`[cmd]` **Kein Neustart noetig** — nur `apps/web/src`.

### Was daneben liegt und diesen Punkt beruehrt

`[cmd]` **Die Setup-Karte** (`lib/nutrition/setup-karten.ts:96`)
**fuehrt jetzt an einen Ort, an dem man die Phase waehlen kann** —
**die Sackgasse ist zu.**

`[read]` **Ihr Satz bleibt trotzdem eine halbe Zusage:** *,,Die
Phase bestimmt das Tempo."* `[read]` **Das stimmt erst, wenn G-511
bei Codex durch ist.** `[read]` **Kein eigener Punkt — G-511 traegt
es.**

## Abnahme

**2026-09-27, Orchestrator. Nachgemessen.**

`[cmd]` **Alle fuenf Funktionen haben jetzt Aufrufer:
`goal_phase_start` 2, `goal_phase_end` 2,
`phase_transition_respond` 2, `phase_transition_recommendation`
1, `phase_am` 5.**

`[cmd]` **Seedzeilen unveraendert: 5 Phasen, 5 Zielzeilen.
Proben: web 2029 (vorher 2013), coach 65.**

### Zwei Eigenschaften, die nicht in der Signatur stehen

> *,,`goal_phase_start` SPERRT (23505), solange eine Phase
laeuft. Es gibt keinen Wechsel ? nur Beenden und Beginnen."*

> *,,`phase_am` liefert auch BEENDETES, wenn
`actual_end_date >= stichtag`. Wer nur auf `echt.phase` prueft,
sperrt den Start hinter einer Phase, die laengst vorbei ist."*

`[read]` **Beides haette der Compiler nie gezeigt** ? **er hat
die Rumpfe gelesen, nicht die Signaturen.**

### Der Vorschlagsweg tut weniger, als sein Name sagt

> *,,`phase_transition_respond` schreibt NUR eine Antwortzeile
? auch bei `accepted` wechselt nichts."*

`[cmd]` **Die Kachel sagt es:** *,,Die Zustimmung ist
gespeichert. Gewechselt ist damit noch nichts."*

`[read]` **Ein Name, der mehr verspricht als die Funktion
haelt** ? **und die Flaeche korrigiert ihn, statt ihn zu
wiederholen.**

### Dreimal der Datenbank statt der Vorlage gefolgt

`[cmd]` **Neun Phasenarten statt sieben ? das Mockup nennt
`mini_cut` als Folgephase, ohne sie zu definieren.**

`[cmd]` **Kein *Phase beenden* im Mockup ? hergeleitet aus
`goal_phase_end`, das einen Grund verlangt.**

`[cmd]` **Keine Auswahlliste fuer `variant` ? die Spalte hat
keinen CHECK, eine Liste waere eine ungedeckte Zusage.**

### Und `parameters` bleibt leer, mit Absicht

> *,,Drei Quellen, DREI Schluesselnamen
(`calorie_surplus_kcal` live, `calorie_target` in der Spec,
`calorieSurplus`/`calorieDeficit` im Altrepo). G-511 macht den
Schluessel tragend, also erfindet die Oberflaeche keinen."*

`[read]` **Eine falsch benannte Zahl laese die Rechnung nicht,
und die Kachel zeigte sie brav an** ? **genau die Falle aus
G-485.**

### Gegen die Datenbank belegt

    Start -> Doppelstart 23505 abgewiesen
          -> leerer Grund 22023 abgewiesen
          -> Enddatum vor Beginn P0002 abgewiesen
          -> Antwort geschrieben
          -> Ende mit Grund -> Start wieder moeglich

`[cmd]` **Danach aufgeraeumt, die fuenf Seedzeilen
unveraendert ? selbst geprueft.**

### Was offen bleibt

`[cmd]` **Der Schirmnachweis: 3200 und 3220 antworteten auch
heute nicht, zweimal geprueft.** **Zwei Bilder stehen aus: die
Phasenkachel und die FFMI-Kachel aus G-512.**

`[read]` **Und sein Satz zur Setup-Karte:** *,,Ihr Satz *Die
Phase bestimmt das Tempo* stimmt erst, wenn G-511 durch ist."*

**Abgenommen, der Schirmnachweis steht aus.**


