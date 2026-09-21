---
nr: G-484
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519]
kind_von: E-83
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 00e94b7c
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-484 - keine Aktion im Produkte-Reiter

## Toms Beanstandung

Tom, 2026-09-08:

> in supplements, wenn ich ein produkt suche und waehlen will,
> muss die funktion her, dass ich es einem stack zuweisen kann
> mit den noetigen angaben, oder einem meal hinzufuegen kann

## Gemessen

`[cmd]` **Der Produkte-Reiter (G-452, G-453) fuehrt nur zur
Tafel** ? **keine Aktion.**

`[cmd]` **Und die Felder stehen alle:** `stack_items.dose`,
`dose_unit`, `frequency`, `timing`, `cycling` **(E-83,
Frage E).**

    timing      morning | midday | evening | pre_workout
                post_workout | bedtime | with_meal | any
    frequency   daily | weekdays | training_days |
                custom | cycling

## Was zu bauen ist

`[read]` **Zwei Aktionen je Produkt:**

    In den Stack     Dosis, Einheit, Haeufigkeit,
                     Zeitpunkt, Zyklus
    In eine Mahlzeit nur wenn untermischbar
                     (Powder, Liquid, Bar, Gummy)

`[cmd]` **C-519 liefert den Schreibweg** ? **warte darauf.**

`[cmd]` **Und `stack_items` fuehrt SUBSTANZEN** ? **C-518
misst, ob eine Produktspalte noetig ist. MELDEN, wenn sie
fehlt.**

## Abnahmebedingungen

    A1  ein Produkt in den Stack, mit Dosis und
        Zeitpunkt. Foto.
    A2  ein Produkt in eine Mahlzeit. Foto.
    A3  eine Kapsel bietet NUR den Stack an. Foto.
    A4  ein Pulver bietet beides an. Foto.
    A5  Gegenprobe: was passiert bei einem Produkt
        ohne Naehrwerte?
    A6  die elf anderen Reiter unveraendert.

## Toms Praezisierung, 2026-09-08

> das muss natuerlich so gebaut werden, dass man waehlen
> kann, in welchen stack / in welches heutige meal

`[read]` **Nicht *,,in den Stack"*, sondern *,,in WELCHEN
Stack"*.**

`[cmd]` **MISS, ob ein Nutzer mehrere Stacks haben kann** ?
`supplements.stacks` **oder nur `stack_items`.**

`[read]` **Und *,,in welches heutige Meal"*** ? **die
Mahlzeiten des Tages stehen zur Wahl: Fruehstueck,
Mittagessen, Nachmittagssnack, Abendessen.**

`[cmd]` **`meal_items.meal_id` zeigt auf `nutrition.meals`,
`meal_type` traegt die Art** ? **miss, welche es heute
gibt.**

### Die Abnahmebedingungen dazu

    A+  die Stackwahl steht, wenn es mehrere gibt.
        Foto.
    A+  die Mahlzeitwahl zeigt die HEUTIGEN Mahlzeiten.
        Foto.

## Bericht

**Die Aktion steht: ein Produkt kann in einen gewaehlten Stack oder
in eine gewaehlte Mahlzeit** — und die Form entscheidet, was
angeboten wird.

    A1  in den Stack, mit Dosis und Zeitpunkt      erfuellt
    A2  die Stackwahl steht (zwei Stacks)          erfuellt
    A3  in eine Mahlzeit                           erfuellt
    A4  die HEUTIGEN vier Mahlzeiten               erfuellt
    A5  eine Kapsel bietet nur den Stack           erfuellt
    A6  ein Pulver bietet beides                   erfuellt
    A7  ohne Naehrwerte: der Satz steht            erfuellt
    A8  die elf anderen Reiter unveraendert        erfuellt
    A9  apps/web 1910/1910, apps/coach 65/65       erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### C-518: der Befund haelt, und er blockiert NICHT

`[cmd]` **Gemessen am 2026-09-21:** `supplements.stack_items` hat
**keine Produktspalte** — nur `supplement_id` (Substanz) und
`custom_name`. **Codex' Empfehlung ist nicht gebaut.**

`[cmd]` **Aber der CHECK laesst beides zu:**

    stack_items_check
      CHECK (supplement_id IS NOT NULL OR custom_name IS NOT NULL)

`[cmd]` **In einer Transaktion belegt** (mit ROLLBACK): ein
Produktname geht durch, mit Dosis, Einheit, Zeitpunkt und
Haeufigkeit.

`[read]` **Also traegt der Eintrag den PRODUKTNAMEN.** `[read]`
**Eine Substanz zu raten waere schlimmer als keine:** C-518 hat
*,,1.478 bis 29.004 Produktkandidaten, nie genau einer"* gemessen —
**aus dieser Menge eine auszusuchen hiesse, eine Zuordnung zu
behaupten, die niemand gemessen hat.**

`[cmd]` **Der Waechter sichert es:** `supplement_id: null` und
`custom_name: stackName(…)` — **wer eine Substanz raet, faellt auf.**

`[read]` **Was fehlt, bleibt gemeldet:** solange `stack_items` keine
Produktspalte hat, **weiss der Stackeintrag nicht, WELCHES Produkt
gemeint war.** `[cmd]` **Die Id steht in `notes`** — das ist eine
Kruecke, keine Zuordnung.

### A1 bis A4 — nicht eine Aktion, sondern eine WAHL

`[cmd]` **Ueber die Wege der Anwendung geschrieben, und beides in
die NICHT erste Wahl** — damit die Wahl belegt ist und nicht die
Vorgabe:

    Stacks       Muskelaufbau Basics (aktiv) | Cut-Phase
    gewaehlt     Cut-Phase            -> 201
    Mahlzeiten   Fruehstueck 07:30 | Mittagessen 12:30 |
                 Snack 16:00 | Abendessen 19:30
    gewaehlt     Mittagessen          -> 200

`[cmd]` **In der Datenbank gegengeprueft:**

    Cut-Phase | Optimum Nutrition Gold Standard 100% Whey …
              | 1.000 Scoop | post_workout | training_days

    lunch     | Optimum Nutrition Gold Standard 100% Whey …
              | 31 Gram(s) | 1.000

`[cmd]` **Alle acht Zeitpunkte und fuenf Haeufigkeiten** — dieselben
Werte, die die CHECKs erlauben. `[read]` **Eine Auswahl, die einen
Wert anbietet, den die Datenbank ablehnt, ist eine Zusage, die
bricht.**

`[cmd]` **Fuer A2 wurde ein zweiter Stack angelegt** (`Cut-Phase`,
`fat_loss`) — **vorher gab es nur einen, und eine Wahl mit einem
Eintrag belegt nichts.** `[cmd]` **`uq_user_stacks_one_active`
laesst nur EINEN aktiven zu** — deshalb laedt der Leseweg ALLE und
markiert den aktiven.

### A5 bis A7 — die Form entscheidet

`[cmd]` **Die Regel kommt aus G-480** (`darfInMahlzeit`) — **gerufen,
nicht nachgebaut.** `[cmd]` **Der Waechter prueft beides:**

    Capsule | Tablet | Softgel | Lozenge   -> nur Stack
    Powder  | Liquid | Gummy   | Bar       -> Stack + Mahlzeit
    Other   | Unknown | null                -> nur Stack

`[read]` **Im Zweifel nicht in die Mahlzeit** — E-83 hat gemessen,
dass 82 % der `Other`-Produkte keinen Formhinweis tragen.

`[cmd]` **Und der Knopf fehlt nicht wortlos:** neben ihm steht
*,,Diese Darreichungsform laesst sich nicht untermischen — sie
gehoert in den Stack, nicht in eine Mahlzeit."* `[read]` **G-486 hat
gezeigt, was ein wortloses Fehlen kostet:** viermal gemeldet.

### Zwei Fehler, die nur die Messung gefunden hat

**1 — jeder Mahlzeitschreibweg meldete einen Fehler, obwohl er
schrieb.**

`[cmd]` **Gemessen: Status 400,** *,,Kein Posten angelegt."* —
**und die Zeile war da.**

`[cmd]` **Der Grund:** `record_supplier_product_intake` ist
`RETURNS uuid`, **der Leseweg las aber `data.id`.** `[read]` **Eine
Fehlermeldung ueber einen Erfolg ist schlimmer als eine ueber einen
Fehler** — sie laedt zum zweiten Versuch ein.

`[read]` **Das traf JEDEN Supplementposten seit C-519**, nicht nur
diesen Auftrag.

**2 — die Kachel behauptete ,,keine Naehrwerte", obwohl es welche
gibt.**

`[cmd]` **Ein erster Entwurf holte die Portionen ueber den NAMEN.**
`[cmd]` **Gemessen: fuenf Produkte heissen ,,Gold Standard 100% Whey
Vanilla Ice Cream"**, die Suche deckelt bei 150 Treffern, **und die
Id der offenen Tafel war nicht darunter.**

`[read]` **Eine Falschaussage ueber die Daten, erzeugt von der
Anzeige.** `[cmd]` **Jetzt kommen die Portionen aus
`ladeProdukt(id)`** — derselben Abfrage, die die Tafel ohnehin
macht. `[cmd]` **Danach: `31 Gram(s) · 120 kcal`.**

### Der Waechter, und das Loch in ihm

`[cmd]` **`g484-produkt-aktion.test.ts`, 10 Faelle.** `[cmd]`
**`_g484-sabotage.mjs`: 15 Schaeden plus Kontrolle — 16/16.**

`[cmd]` **Erster Lauf: 14/16.** **Zwei Schaeden blieben gruen:**

`[read]` **Der eine war ein blinder Waechter:** die Zusicherung
prueftE `NUR_STACK_SATZ` als KONSTANTE, nicht die Anzeige — **den
Satz aus dem JSX zu entfernen fiel nicht auf.** `[cmd]` **Berichtigt
auf `{NUR_STACK_SATZ}`.**

`[read]` **Der andere war eine zu weiche SABOTAGE:** `if (false &&
…)` liess die Dosisprüfung zwar aus, **aber `dose: 0` fiel auf eine
spaetere Regel durch und lieferte weiter eine Meldung.** `[cmd]`
**Die Sabotage verschiebt jetzt die Grenze** (`<= 0` zu `< 0`) —
**und trifft.** `[cmd]` **Die Zusicherung nennt dazu alle uebrigen
Felder gueltig**, sonst prueft sie die falsche Regel.

`[read]` **Nicht jeder gruene Schaden ist ein blinder Waechter** —
manchmal liegt die Sabotage daneben.

### Ein Befund an meinem Werkzeug, der offen bleibt

`[cmd]` **Die Browserprobe konnte nur den Whey oeffnen.** `[cmd]`
**Gemessen: `/api/supplements/produkte?q=Ultraplex Vitamin D3`
liefert 200 mit 200 Zeilen** — **im Browser blieb die Tabelle leer.**

`[read]` **Die Ursache habe ich nicht gefunden**, und weiter zu raten
kostet mehr, als es belegt. `[cmd]` **A5 und A6 sind ueber den
Waechter belegt** (Formregel, Sabotage rot), **nicht ueber ein
Foto.** `[read]` **Das ist der ehrliche Stand.**

### Die Fotos

    backup/x-g484-a1-stack.png      A1/A2/A6: beide Knoepfe,
                                    Stackwahl, Dosis, Einheit,
                                    Zeitpunkt, Haeufigkeit
    backup/x-g484-a4-mahlzeit.png   A4: die vier heutigen Mahlzeiten

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `supplements.css`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Beide Zeilen selbst in der Datenbank gesehen:**

    Stack    Cut-Phase | Optimum Nutrition Gold Standard
             100% Whey Vanilla Ice Cream | 1.000 Scoop |
             post_workout
    Mahlzeit lunch | 2026-09-21

`[read]` **Beides in die NICHT erste Wahl geschrieben** ?
**Cut-Phase ist nicht der aktive Stack, Mittagessen nicht die
erste Mahlzeit. So ist die WAHL belegt, nicht nur die
Aktion.**

`[cmd]` **Proben: web 1910/1910, coach 65/65.**

### C-518 haelt, blockiert aber nicht

> *,,Der CHECK laesst `custom_name` zu ? in einer Transaktion
belegt. Der Eintrag traegt daher den Produktnamen; eine
Substanz aus 1.478 bis 29.004 Kandidaten zu raten waere eine
BEHAUPTUNG."*

`[read]` **Und was fehlt, ist gemeldet:** *,,der Stackeintrag
weiss nicht, welches Produkt gemeint war (die Id steht als
KRUECKE in `notes`)."*

`[cmd]` **Als C-529.**

### Zwei Fehler, die nur die Messung fand

**1** ? **Jeder Supplement-Schreibweg meldete *,,Kein Posten
angelegt"*, obwohl die Zeile entstand.**

> *,,`record_supplier_product_intake` ist `RETURNS uuid`, der
Code las `data.id`. Das traf JEDE Erfassung seit C-519, nicht
nur diesen Auftrag."*

`[read]` **Eine Fehlermeldung bei Erfolg** ? **der Nutzer
haette nachgetragen und doppelt erfasst.**

**2** ? **Die Kachel behauptete *,,keine Naehrwerte"* fuer ein
Produkt mit Portion.**

> *,,Fuenf Produkte tragen denselben Namen, und meine
Suche-ueber-den-Namen traf die falsche Id."*

`[cmd]` **Jetzt ueber `ladeProdukt(id)`: 31 Gram(s), 120
kcal.**

### Und die Sabotage lehrte etwas

> *,,Nicht jeder gruene Schaden ist ein blinder Waechter."*

`[read]` **Eine zu weiche Sabotage (`if (false && ...)`) fiel auf
eine spaetere Regel durch** ? **er hat den Unterschied
benannt statt den Waechter zu verschaerfen.**

### Offen, ehrlich benannt

> *,,Meine Browserprobe konnte nur den Whey oeffnen ? die API
liefert fuer andere Produkte 200 mit 200 Zeilen, im Browser
blieb die Tabelle leer. Ursache nicht gefunden; A5/A6 sind
ueber den Waechter belegt, nicht ueber ein Foto."*

`[read]` **A5 und A6 sind damit schwaecher belegt als die
anderen** ? **Waechter statt Foto.**

`[cmd]` **Als G-491.**

**Abgenommen, A5/A6 mit Vorbehalt.**
