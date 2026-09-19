---
nr: G-485
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-519
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 48c4c695
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-485 - das Tagebuch ist nicht lesbar

## Toms Befund

Tom, 2026-09-08:

> wieso sehe ich keine meals mehr in diary?

> Tagebuch nicht lesbar
> column meal_items.supplement_serving_size does not exist

## Gemessen

`[cmd]` **C-519 ist live: die vier Altspalten sind weg,
`supplement_intake_log_id` ist da.**

`[cmd]` **Und `mahlzeiten.tsx` liest sie noch:**

     98  supplement_serving_size?: string | null
     99  supplement_serving_quantity?: number | null
    100  supplement_nutrient_status?: string | null
   1069  {it.supplement_serving...
   1070  ? ` - ${it.supplement...
   1102  {it.supplement_servi...

`[read]` **Der Zeilenkommentar auf Z85 sagt sogar:**
*,,C-519 entfernt `supplement_servin...`"* ? **der Code wusste
es und hat es trotzdem abgefragt.**

## Was schiefging

`[cmd]` **G-481 meldete:** *,,Jetzt stehen beide Wege offen,
Lesen wie Schreiben, sodass Codex ohne Ausfallfenster
einspielen kann."*

`[read]` **Der SCHREIBweg ruft die RPC. Der LESEweg fragt die
Spalten direkt ab** ? **und `select` auf eine fehlende Spalte
laesst JEDE Zeile scheitern.**

`[cmd]` **Genau der Satz aus `client-grenze.test.ts`:** *,,Ein
`.select()` auf eine fehlende Spalte laesst JEDE Zeile
scheitern."*

## Was zu tun ist

`[read]` **Der Lesepfad nimmt `supplement_intake_log_id` und
holt die Werte aus `intake_logs`.**

`[cmd]` **Die Probe `g478-supplement-kacheln.test.ts` prueft
noch die alten Spalten** ? **sie muss mit.**

## Abnahmebedingungen

    A1  das Tagebuch laedt. Foto.
    A2  Toms Fruehstueck steht: 557,5 kcal, 40,022 g.
        Foto.
    A3  das Whey zeigt Portion und Anzahl. Foto.
    A4  KEINE Abfrage auf die vier Altspalten mehr.
        Belegt.
    A5  ein Waechter faengt es: eine Abfrage auf eine
        entfernte Spalte wird rot. Sabotageprobe.
    A6  vier Module unveraendert.
    A7  apps/web 1878 oder mehr, apps/coach 65.

## Bericht

**Das Tagebuch laedt wieder.** **Alle sieben Bedingungen erfuellt.**
**Gemessen am 2026-09-19, Dev-Server 3200.**

    A1  das Tagebuch laedt                       erfuellt
    A2  557,50 kcal / 40,022 g                   erfuellt
    A3  Whey mit Portion und Anzahl              erfuellt
    A4  keine Abfrage auf die vier Altspalten    erfuellt
    A5  Waechter faengt es, 12/12 Sabotagen      erfuellt
    A6  vier Module unveraendert                 erfuellt
    A7  apps/web 1881/1881, apps/coach 65/65     erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### Der Fehler war meiner, und der Bericht dazu auch

`[read]` **Mein G-481-Bericht sagte: *,,Jetzt stehen beide Wege offen,
Lesen wie Schreiben."*** `[cmd]` **Fuer den Leseweg stimmte das
nicht.**

`[cmd]` **Gemessen, was wirklich geschah:**

    1  der C-519-Weg scheiterte
    2  `ohneC519()` hielt das fuer „nicht eingespielt"
    3  der Rueckfall lief -- und nannte die vier Altspalten
    4  PostgREST: „column meal_items.supplement_serving_size
       does not exist"
    5  JEDE Zeile fiel, nicht nur die Supplemente

`[read]` **Der Rueckfall hat den Fehler nicht abgefedert, sondern
VERDECKT** — die Meldung beim Nutzer kam vom alten Weg, und der
eigentliche Grund stand nirgends.

`[read]` **Ich hatte ihn eingebaut, um eine Verklemmung zu loesen.**
**Nach dem Einspielen war er kein Netz mehr, sondern eine zweite
Fehlerquelle.**

### Warum der neue Weg ueberhaupt scheiterte

`[cmd]` **Gemessen:** der Fremdschluessel
`meal_items_supplement_intake_log_id_fkey` zeigt nach
**`supplements.intake_logs`** — ein anderes Schema.

`[cmd]` **PostgREST bettet nur innerhalb des angefragten Schemas
ein.** `[read]` **`.schema('nutrition')` erreicht die Tabelle nicht**,
also konnte `intake_logs!left(...)` nie aufloesen.

`[read]` **Das war in G-481 nicht gemessen, sondern angenommen** —
der Fremdschluessel existiert, also schien die Einbettung moeglich.

### Was jetzt dasteht

`[cmd]` **Eine Abfrage auf `meal_items`** mit
`supplement_intake_log_id`, **dann eine zweite auf `intake_logs`** —
nur wenn es Verweise gibt.

`[cmd]` **Der Zugriff liegt in `stack-write.ts`**, nicht im
Tagebuchweg: **G-138 verlangt genau EINE Datei fuer `intake_logs`**,
und der Waechter prueft die DATEI. `[read]` **Dieselbe Loesung wie in
G-475 bei `letzteEinnahmen`** — verschoben, nicht den Waechter
gelockert.

`[cmd]` **Und ein Fehler beim Nachlesen leert das Tagebuch NICHT
mehr** — dann fehlt die Portionsangabe, der Rest steht.

### Zwei Folgefehler, die erst die Messung zeigte

**1 — die Zeile fiel am Namen.**

`[cmd]` **C-519 hat `food_name` nullable gemacht** und den Namen nach
`intake_logs.supplement_name_snapshot` verlegt.

`[cmd]` **Der Leser hatte eine Pflichtpruefung:**
`typeof record.food_name !== 'string'` → verwerfen. `[read]` **Damit
fiel die Supplementzeile, BEVOR der Name aus der Einnahme gelesen
wurde.**

`[cmd]` **Gemessen: das Fruehstueck zeigte 438 statt 557,5 kcal** —
**eine Summe, die stimmig aussieht und 120 kcal unterschlaegt.**
`[read]` **Das ist die gefaehrlichere Haelfte des Fehlers: kein
Fehlertext, nur eine falsche Zahl.**

`[read]` **Dieselbe Klasse wie G-478 mit `amount_g`, ein Feld
weiter.**

**2 — die Naehrwerte fehlten.**

`[cmd]` **Die Supplementzeile traegt `enercc = NULL`, `prot625 =
NULL`** — die Werte stehen als JSON in
`supplier_product_nutrients_snapshot` (`{"ENERCC": 120.0000,
"PROT625": 24.0000, …}`).

`[read]` **Ohne Rueckgriff waere die Zeile da und leer gewesen.**

### A2 und A3 — die Zahlen

`[cmd]` **In der Datenbank nachgerechnet:**

    Haferflocken       60 g    208,8 kcal    7,93 g
    Heidelbeere       100 g     61,0 kcal    0,50 g
    Mandelmus          30 g    167,7 kcal    7,59 g
    Whey            1 x 31 g   120,0 kcal   24,00 g
    ------------------------------------------------
                             557,50 kcal   40,022 g

`[cmd]` **Am Schirm:** `558 kcal · 40 P` (gerundet), dazu
*,,davon 120 kcal · 24 P aus 1 Supplement"*.

`[cmd]` **Die Whey-Zeile:** Marke `Supplement · 31 Gram(s)`, Menge
`1 ×`, 120 kcal / 24 g. `[cmd]` **Null Seitenfehler.**

### A5 — der Waechter, und die Luecke in ihm

`[cmd]` **`g485-keine-entfernten-spalten.test.ts`, 4 Faelle.**
`[cmd]` **`_g485-sabotage.mjs`: 11 Schaeden plus Kontrolle.**

`[cmd]` **Erster Lauf: 8/11** — **drei blieben gruen, darunter GENAU
der Fall, der Tom getroffen hat.**

`[read]` **Der Grund:** mein erster Entwurf las nur `.select('…')`
**mit einer Zeichenkette IM Aufruf**. `[cmd]` **Die Spaltenliste stand
aber in einer Konstanten** (`const SPALTEN = '…'`), und
`.select(SPALTEN)` traegt kein Literal.

`[read]` **Ein Waechter, der den einen Fall nicht faengt, fuer den er
geschrieben wurde, ist schlimmer als keiner** — er behauptet Deckung.

`[cmd]` **Berichtigt: jede einfache Zeichenkette der Datei zaehlt.**
`[cmd]` **Zweiter Lauf: 12/12** — elf rot, die Kontrolle gruen.

### Zwei fremde Waechter nachgezogen, keiner gelockert

`[cmd]` **G-348 und G-223** pruefen
`/\.select\('[^']*food_source[^']*'\)/` — **eine Konstante macht sie
rot, obwohl die Felder mitkommen.** `[cmd]` **Die Liste steht deshalb
wieder IM Aufruf.**

`[cmd]` **G-475/A10 bis A12** pruefen, dass die Anwendung den
Schnappschuss selbst baut — **genau das hat C-519 in die Datenbank
verlegt.** `[read]` **Umgehaengt auf den neuen Vertrag:** die
Funktion wird gerufen, und die vier Altspalten werden NICHT mehr
geschrieben. `[read]` **Nicht geloescht — eine entfallene Zusicherung
waere eine stille Lockerung.**

### Ein Befund, der NICHT in diesen Auftrag gehoert

`[cmd]` **`nutrition.daily_summary` rechnet die Supplemente nicht
mehr mit.**

    Sicht            2.007,53 kcal
    ueber die Posten 2.127,53 kcal
    Differenz          120,00 kcal   (das Whey)

`[cmd]` **Der Grund steht im Sichtenrumpf:** `sum(mi.enercc)` —
**und `mi.enercc` ist seit C-519 bei Supplementen NULL.**

`[read]` **Die Kachel ,,4 Positionen ohne Wert bei Kalorien…" auf dem
Foto kommt daher** — sie ist richtig, die Sicht ist es nicht mehr.

`[cmd]` **Das ist `supabase/` und damit Codex** — gemeldet, nicht
angefasst. `[read]` **Bis dahin stimmt die Mahlzeitensumme (sie
rechnet im Browser), die Tagessumme nicht.**

### Die Fotos

    backup/x-g485-a1-tagebuch.png      A1, A2, A3 in einem Bild
    backup/x-g485-a2-fruehstueck.png   dasselbe, nach dem letzten Lauf

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **0 Altspalten in einem `select()`** ? **die 20
Treffer sind Typdefinitionen, die Altdaten tragen duerfen.**

`[cmd]` **`supplement_intake_log_id` wird gelesen.**

`[cmd]` **Proben: web 1881/1881, coach 65/65.**

### Warum das Tagebuch KOMPLETT leer war

> *,,Eine einzige entfernte Spalte im `.select()` laesst JEDE
Zeile scheitern ? deshalb war das Tagebuch komplett leer,
obwohl nur EINER von vier Posten ein Supplement ist."*

`[read]` **Und der Rueckfall hat es nicht abgefedert, sondern
VERDECKT** ? **`ohneC519()` hielt den Fehler fuer *,,noch nicht
eingespielt"* und schaltete auf die Altspalten um.**

### Die Ursache seines G-481-Fehlers

> *,,Der Fremdschluessel zeigt nach `supplements.intake_logs` ?
ein ANDERES Schema. PostgREST bettet nur innerhalb des
angefragten Schemas ein. In G-481 hatte ich das ANGENOMMEN,
nicht gemessen."*

`[read]` **Eine Annahme im Bericht, die ich abgenommen habe,
ohne sie zu pruefen.**

### Zwei Folgefehler, die erst die Messung zeigte

> *,,Zwischenstand war 438 statt 557,5 kcal ? eine stimmig
aussehende Summe, die 120 kcal unterschlaegt, ohne jede
Meldung."*

`[read]` **Eine falsche Zahl, die richtig aussieht** ? **das
ist gefaehrlicher als ein Absturz.**

### Der Waechter hatte selbst ein Loch

> *,,Erster Sabotagelauf 8/11, und AUSGERECHNET der Fall, der
dich getroffen hat, blieb gruen ? mein Muster las nur
`.select(...)` mit Literal im Aufruf, die Liste stand aber in
einer KONSTANTEN. Nach der Korrektur 12/12."*

`[read]` **Die Sabotageprobe hat den Waechter geprueft, nicht
nur den Code.**

### Und zwei fremde Waechter nachgezogen statt gelockert

`[cmd]` **G-348/G-223 (Spaltenliste wieder inline) und
G-475/A10-A12 (auf den C-519-Vertrag umgehaengt).**

### Sein Befund fuer Codex stimmt, und ist groesser

`[cmd]` **Selbst gemessen: DREI Supplementzeilen, alle mit
`enercc = NULL` UND `food_name = NULL`.**

`[read]` **Er meldet 120 kcal Fehlbetrag** ? **es sind drei
Zeilen, nicht eine.**

`[cmd]` **Als C-521.**

**Abgenommen.**


