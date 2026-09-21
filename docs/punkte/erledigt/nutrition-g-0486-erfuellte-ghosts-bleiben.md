---
nr: G-486
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-482
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 087f0543
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-486 - erfuellte Ghostentries bleiben stehen

## Toms Befund, zum vierten Mal

Tom, 2026-09-08:

> die ghostentries sind schon wieder verschwunden

> zuerst mal: das haben wir heute schonmal messen und beheben
> lassen!!

`[read]` **Er hat recht** ? **G-482 war heute, und ich habe
*,,kein Anzeigefehler"* abgenommen, ohne zu pruefen, ob die
Flaeche sich erklaert.**

`[cmd]` **Der eigentliche Befund stand in Claude Codes
Bericht:** *,,Tom sah einen leeren Tag und wusste nicht,
warum."*

## Dreimal derselbe Eindruck, dreimal ein anderer Grund

    1. Mal   "0 heute, 4 morgen"   falsch gemessen
    2. Mal   status=active         Plan begann erst morgen
    3. Mal   alle erfuellt         Mahlzeiten schon erfasst

`[read]` **Dreimal an derselben Stelle nichts gesehen** ?
**die Flaeche erklaert sich nicht selbst.**

## Gemessen, heute (2026-09-19)

    PLAN (aktiv)                 ERFASST
    breakfast  Banane-Joghurt    breakfast  5 Posten
    lunch      Huhn-Reis-Bowl    lunch      3
    snack      Magerquark        snack      2
    dinner     Lachs             dinner     4

`[read]` **Alle vier erfuellt, also alle vier Ghosts weg.**

## Toms Entscheidung

> ja die sollen einen gruenen rahmen kriegen und abgehakt
> stehenbleiben als erfuellt

`[read]` **Ein erfuellter Ghost verschwindet nicht** ? **er
zeigt, dass der Plan gemacht ist.**

## Und der zweite Befund: drei Plaene auf demselben Tag

`[cmd]` **Gemessen, heute:**

    Lean bulk 3100      assigned   4 Eintraege
    Cut 4-Meal 2200     paused     4
    Aufbau-Wochenplan   active     4

Tom, 2026-09-08:

> nur ein aktiver plan ist ssot. assigned ist ein geplanter
> zukuenftiger plan, der laufen soll/wird, paused ist wie der
> name sagt pausierend

> es obliegt dem user, welcher plan aktiv ist und wie er sich
> die durchplant. der job der software ist, den aktiven
> anzuzeigen und die planung so zu gestalten, dass es keine
> ueberlappungen gibt

`[read]` **Die Anzeige bleibt richtig: nur der aktive.**

`[read]` **Aber die UEBERLAPPUNG ist ein Befund** ? **drei
Plaene decken denselben Tag ab, und `Cut 4-Meal 2200` beginnt
am selben Tag wie der aktive.**

`[cmd]` **MISS, ob es eine Ueberlappungspruefung gibt.**

## Abnahmebedingungen

    A1  ein erfuellter Ghost bleibt stehen, gruener
        Rahmen, abgehakt. Foto.
    A2  ein offener Ghost sieht anders aus als ein
        erfuellter. Foto beide.
    A3  woran wird "erfuellt" erkannt? Gemessen --
        Mahlzeitart, Rezept, oder Bestaetigung?
    A4  ein Tag ohne Plan sagt WARUM. Foto.
    A5  gibt es eine Ueberlappungspruefung? Gemessen.
        Wenn nein: GEMELDET, nicht gebaut.
    A6  vier Module unveraendert.
    A7  apps/web 1887 oder mehr, apps/coach 65.

## Bericht

**Erfuellte Ghosts bleiben stehen, gruen und abgehakt.** **Ein leerer
Tag sagt jetzt, warum er leer ist.**

    A1  erfuellter Ghost bleibt, gruen, abgehakt    erfuellt
    A2  offen und erfuellt gemessen verschieden     erfuellt
    A3  erkannt am LOG, nicht an der Mahlzeit       gemessen
    A4  ein Tag ohne Plan sagt WARUM                erfuellt
    A5  KEINE Ueberlappungspruefung                 gemeldet
    A6  vier Module unveraendert                    erfuellt
    A7  apps/web 1893/1893, apps/coach 65/65        erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### A3 zuerst — und die Antwort ist eine andere als vermutet

`[cmd]` **Der Auftrag nennt als dritten Grund:** *,,alle erfuellt —
Mahlzeiten schon erfasst"*. `[cmd]` **GEMESSEN am 2026-09-20:**

    Planeintraege (aktiv)      4
    meal_plan_logs             0        <- LEER
    erfasste Mahlzeiten        4 Typen, 12 Posten

`[read]` **Alle vier Ghosts standen da** — **eine erfasste Mahlzeit
erfuellt einen Planeintrag NICHT.**

`[cmd]` **Erkannt wird ausschliesslich an `meal_plan_logs.status`**
(`mahlzeiten.tsx:329`: `filter(g => g.status === 'pending')`).
`[read]` **Nicht an der Mahlzeitart, nicht am Rezept.**

`[cmd]` **Den Zustand deshalb HERGESTELLT, nicht angenommen:** vier
Bestaetigungen ueber die eigene Route.

    vorher    Route 4 Eintraege, Schirm 4 Ghostkarten
    nachher   Route 4 Eintraege, Schirm 0 Ghostkarten

`[read]` **Damit war Toms Befund reproduziert** — und die Ursache
belegt statt vermutet.

### Warum es viermal gemeldet wurde

`[read]` **Das Verschwinden war ABSICHT.** `[cmd]` **Der Kommentar
sagt es seit G-309:** *,,Ein bestaetigter Eintrag hat eine Mahlzeit
erzeugt, die schon oben steht — ihn daneben nochmal als Vorschlag zu
zeigen, waere derselbe Tag zweimal."*

`[read]` **Die Begruendung ist richtig und das Ergebnis trotzdem
falsch:** **ein erledigter Punkt, der verschwindet, sieht aus wie ein
verlorener.** `[read]` **Viermal gemeldet heisst: die Absicht kam nie
an.**

**Und der Fehler ist meiner.** `[read]` **Mein G-482-Bericht endete
mit** *,,Tom sah einen leeren Tag und wusste nicht, warum — das ist
der eigentliche Befund"* — **und ich habe ihn als Notiz liegen
lassen statt als Auftrag.**

### A1 und A2 — gemessen, nicht beschrieben

`[cmd]` **Beide Zustaende auf einem Schirm** (2026-09-21, ein
Eintrag bestaetigt, drei offen):

    ERFUELLT   Rahmen solid   RGB(29, 125, 62)   Haken JA
               Knoepfe: nur „Zutat hinzufuegen"
               Satz: „Erfuellt — die erfasste Mahlzeit steht oben."

    OFFEN      Rahmen dashed  RGB(151, 152, 155) Haken NEIN
               Knoepfe: Bestaetigen, MealCam, Auslassen

`[read]` **Gestrichelt heisst *noch nicht*** — beim erfuellten stimmt
das nicht mehr, deshalb durchgezogen.

`[read]` **Die Knoepfe fallen weg, nicht nur der erste:**
*Auslassen* nach dem Essen waere eine Falschaussage, *MealCam* fuehrte
in eine Attrappe fuer etwas Erledigtes.

`[cmd]` **`skipped` bleibt WEG** — ausgelassen heisst entschieden UND
nicht gegessen. `[read]` **Ein abgehakter Rahmen waere dort eine
Luege**, und der Waechter prueft es.

### A4 — der Satz, der seit G-482 fehlte

`[cmd]` **Gemessen, was ein Tag nach dem Planende zeigte:** nur
*,,Zukunft"* — **nichts ueber den Plan.**

`[cmd]` **Jetzt, an drei Tagen gemessen:**

    2026-09-18   „Dein Plan ‚Aufbau-Wochenplan' beginnt erst am
                  2026-09-19 — deshalb steht fuer diesen Tag noch
                  nichts."
    2026-10-24   „Dein Plan ‚Aufbau-Wochenplan' endete am
                  2026-10-23 — deshalb steht fuer diesen Tag nichts
                  mehr."

`[read]` **Der 2026-09-18 ist GENAU der Tag aus G-482** — der, an dem
Tom nichts sah und niemand sagen konnte, warum.

`[cmd]` **Vier Gruende, je ein Satz:** kein aktiver Plan, beginnt
spaeter, beendet, kein Eintrag an diesem Tag. `[read]` **Jeder nennt
das DATUM und den PLANNAMEN** — *,,beginnt spaeter"* ohne Tag laesst
den Nutzer weitersuchen.

### A5 — die Ueberlappungspruefung, gemeldet

`[cmd]` **Es gibt KEINE.** `[cmd]` **Gemessen an drei Stellen:**

    CHECKs auf meal_plans        13 -- keiner prueft Datumsfenster
    Trigger auf meal_plans        3 -- Slots kopieren,
                                      status/is_active, updated_at
    Funktionen mit „overlap"      0
    Anwendung (plan-write.ts)     0

`[cmd]` **Und die Lage, die das zeigt:**

    Lean bulk 3100      assigned   4 Eintraege
    Cut 4-Meal 2200     paused     4
    Aufbau-Wochenplan   active     4     <- derselbe Tag

`[read]` **Drei Plaene ueberlappen, und nichts haelt das auf.**
`[read]` **Die Anzeige bleibt richtig** — sie zeigt den aktiven, wie
Tom es beschreibt. `[read]` **Aber wer morgen einen zweiten Plan
aktiviert, hat zwei aktive Plaene auf denselben Tagen**, und die
Software sagt nichts.

`[cmd]` **GEMELDET, nicht gebaut** — wie beauftragt. `[read]` **Es
ist ein Datenbankpunkt (`nutrition.meal_plans`) und damit Codex.**

### Zwei Befunde am eigenen Werkzeug

`[cmd]` **`Card` reicht `data-probe` NICHT durch** — es nimmt nur
benannte Props (`primitives.tsx:61`), ein unbekanntes Attribut faellt
still weg. `[cmd]` **Gemessen: die Probe fand 0 Karten, obwohl vier
dastanden.** `[read]` **Die Klasse traegt den Zustand jetzt** — sie
kommt durch.

`[cmd]` **Dasselbe bei `Icon`:** das SVG war da, die Marke nicht.
`[read]` **Die Marke steht am umschliessenden `span`.**

`[read]` **Beides haette wie ein Baufehler ausgesehen** — es war die
Probe.

### Der Waechter

`[cmd]` **`g486-erfuellte-ghosts.test.ts`, 6 Faelle.** `[cmd]`
**`_g486-sabotage.mjs`: 14 Schaeden plus Kontrolle — 15/15.**

`[read]` **Der erste Schaden ist der Rueckfall selbst:**
*,,erfuellte Ghosts verschwinden wieder"* — **er wird rot.**

`[cmd]` **Und einer prueft die Gegenrichtung:** wer vom
*erfassten Essen* auf *erfuellt* schliesst, faellt auf — **denn
gemessen ist das falsch** (A3).

`[cmd]` **Eine Luecke im eigenen Waechter gefunden und geschlossen:**
das Fenster um den Filter war zu weit und las die Nachbarzeile mit.

### Die Fotos

    backup/x-g486-a1-erfuellt.png    A1: vier erfuellte Ghosts
    backup/x-g486-a2-beide.png       A2: erfuellt und offen zusammen
    backup/x-g486-a4-ohne-plan.png   A4: der Grund am leeren Tag

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `globals.css`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g486-a2-beide.png` angesehen:**

    ERFUELLT   gruener Rahmen, Haken, "erfuellt"
               "Erfuellt -- die erfasste Mahlzeit steht
                oben."
               nur "Zutat hinzufuegen"

    OFFEN      gestrichelter Rahmen, "aus deinem Plan"
               Bestaetigen | MealCam | Auslassen

`[cmd]` **Proben: web 1893/1893, coach 65/65.**

### A3 war anders, als mein Auftrag annahm

> *,,Gemessen am 20.09.: vier Planeintraege, vier erfasste
Mahlzeiten mit 12 Posten ? und `meal_plan_logs` LEER. Alle vier
Ghosts standen da. Eine erfasste Mahlzeit erfuellt einen
Planeintrag NICHT; erkannt wird ausschliesslich am
Log-Status."*

`[cmd]` **Selbst nachgemessen: `meal_plan_logs` traegt
`status`, `actual_meal_id`, `confirmation_mode`,
`confirmed_at`, `skipped_at` ? 13 Zeilen.**

`[read]` **Ich hatte im Auftrag vermutet, die Mahlzeiten seien
der Grund** ? **falsch.**

> *,,Ich habe den Zustand deshalb HERGESTELLT statt angenommen:
nach vier Bestaetigungen lieferte die Route weiter 4 Eintraege,
der Schirm zeigte 0 Karten ? dein Befund, reproduziert."*

### Das Verschwinden war Absicht

> *,,G-309: *waere derselbe Tag zweimal*. Die Begruendung ist
richtig und das Ergebnis trotzdem falsch ? ein erledigter
Punkt, der verschwindet, sieht aus wie ein VERLORENER. Viermal
gemeldet heisst: die Absicht kam nie an."*

`[read]` **Eine richtige Regel mit falschem Ergebnis** ?
**das ist der Kern.**

> *,,Und mein G-482-Bericht hat genau das benannt und als
Notiz liegen lassen."*

`[read]` **Der Fehler war meiner: ich habe die Notiz nicht zum
Auftrag gemacht.**

### Und `skipped` bleibt weg, begruendet

> *,,Ausgelassen heisst ENTSCHIEDEN und NICHT GEGESSEN; ein
abgehakter Rahmen waere dort eine Falschaussage."*

### A4 ? der Satz, der seit G-482 fehlte

`[cmd]` **Der 18.09. sagt jetzt:** *,,Dein Plan
*Aufbau-Wochenplan* beginnt erst am 2026-09-19."*

`[read]` **Genau der Tag, an dem Tom nichts sah.**

### A5 ? keine Ueberlappungspruefung

`[cmd]` **Selbst gemessen: 13 CHECKs auf `meal_plans`, keiner
auf Datumsfenster. Drei Trigger: Slots, Status, Zeitstempel.**

`[cmd]` **Drei Plaene ueberlappen bereits.** **Als C-526.**

### Und zwei Befunde am eigenen Werkzeug

> *,,`Card` und `Icon` reichen `data-probe` nicht durch ? die
Probe fand 0 Karten, obwohl vier dastanden. Das haette wie ein
BAUFEHLER ausgesehen; es war die MESSUNG."*

**Abgenommen.**


