---
nr: G-487
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 3a3c09b5
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-487 - der Tageswechsler startet nicht auf heute

## Toms Befund

Tom, 2026-09-08:

> der daychooser war auf 18.9. und nicht heute, sprich das ist
> eine boesartige falle

> der tageswechsler muss bloss auf heute gestellt werden, wenn
> ein refresh/server restart/F5/ctrl F5 gemacht wird

> ich sehe die eintraege ja jetzt, wenn ich auf heute stehe. so
> umgehen wir, dass ein user nicht auf dem alten datum
> stehenbleibt, wenn er mal paar tage nicht online ist

## Warum es zaehlt

`[cmd]` **Heute ist der 2026-09-21, der Schirm zeigte den
18.09.**

`[cmd]` **Am 18.09. hat der aktive Plan null Eintraege, am
21.09. vier** ? **Tom sah *,,kein Eintrag"* und hielt es fuer
einen Fehler.**

`[read]` **Wer ein paar Tage nicht online war, sieht einen
alten Tag ohne Hinweis.**

## Abnahmebedingungen

    A1  nach F5 steht der Tageswechsler auf HEUTE.
        Foto vorher (alter Tag) und nachher.
    A2  das gilt fuer jeden Tageswechsler -- miss,
        welche es gibt.
    A3  ein Waechter faengt es. Sabotageprobe.
    A4  vier Module unveraendert.
    A5  apps/web 1893 oder mehr, apps/coach 65.

## Bericht

**Nach F5 steht der Tageswechsler auf heute** — in allen sechs
Modulen, und das Blaettern funktioniert weiter.

    A1  nach F5 auf HEUTE, Foto vorher/nachher    erfuellt
    A2  EIN Wechsler -- alle sechs Module         gemessen
    A3  Waechter, 10/10 Sabotagen                 erfuellt
    A4  vier Module unveraendert                  erfuellt
    A5  apps/web 1900/1900, apps/coach 65/65      erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### A1 — die Falle, reproduziert und behoben

`[cmd]` **Vorher gemessen:**

    Adresse   /v2/nutrition?datum=2026-09-18
    F5
    Adresse   /v2/nutrition?datum=2026-09-18    <- unveraendert
    Anzeige   „Fr., 18. Sept. 2026"

`[cmd]` **Nachher:**

    Adresse   /v2/nutrition?datum=2026-09-21
    Anzeige   „Heute"

`[read]` **Das Datum lebt NUR in der Adresse** — gemessen: es gibt
keinen `localStorage`, keinen `sessionStorage`, nichts.
**F5 laedt dieselbe Adresse erneut, und die Seite zeigt gehorsam den
alten Tag.**

### A2 — es gibt genau EINEN Tageswechsler

`[cmd]` **`v2-datumsnav` steht an zwei Stellen:**

    app/v2/tageswechsler.tsx              in shell.tsx gerendert
    app/v2/nutrition/datumsnavigation.tsx OHNE Aufrufer seit G-376

`[cmd]` **Gemessen mit `rg`: `Datumsnavigation` wird nirgends mehr
gerufen** — die Datei ist tot.

`[read]` **Ich habe die Regel zuerst dort eingebaut** — und die Probe
zeigte: nichts passiert. `[cmd]` **Der Merker blieb `null`, weil der
Code nie lief.**

`[read]` **Ein Dateiname ist kein Beleg dafuer, dass etwas laeuft.**

`[cmd]` **Der echte Wechsler steht ueber ALLEN Modulen** (ein Portal
aus der Schale). **Gemessen, nach F5 von `?datum=2026-09-18`:**

    /v2/nutrition     -> datum=2026-09-21
    /v2/dashboard     -> datum=2026-09-21
    /v2/goals         -> datum=2026-09-21
    /v2/supplements   -> datum=2026-09-21
    /v2/training      -> datum=2026-09-21
    /v2/recovery      -> datum=2026-09-21

`[read]` **Eine Regel an einer Stelle, sechs Module.**

### Die Gegenprobe, die den Auftrag gerettet hat

`[cmd]` **Gemessen, was der Browser meldet:**

    frische Adresse (goto)      navigate
    F5                          reload
    Tageswechsel (router.push)  reload   <- BLEIBT STEHEN
    danach frische Adresse      navigate

`[read]` **`reload` bleibt ueber `router.push` hinweg stehen.**
`[read]` **Eine Regel, die bei jedem Rendern darauf schaut, spraenge
nach dem ersten Blaettern sofort zurueck auf heute** — **der Nutzer
koennte keinen anderen Tag mehr ansehen.**

`[cmd]` **Deshalb gemessen, nicht geglaubt:**

    Start        ?datum=2026-09-18
    F5           ?datum=2026-09-21   „Heute"
    blaettern 1  ?datum=2026-09-20
    blaettern 2  ?datum=2026-09-19
    blaettern 3  ?datum=2026-09-18

`[read]` **Dreimal zurueck, ohne Rueckfall.** `[cmd]` **Und der
Waechter prueft genau das** — der Schaden *,,der Riegel faellt"* wird
rot.

### Der Fehler, den die Messung gefunden hat

`[cmd]` **Der erste Entwurf merkte sich die Pruefung im
`sessionStorage`.** `[cmd]` **GEMESSEN: der Merker stand schon VOR
dem F5 auf `1`** — gesetzt vom ersten Aufruf.

`[read]` **`sessionStorage` ueberlebt genau das Ereignis, das
unterschieden werden soll.** **Die Regel las ,,schon geprueft" und
tat nichts** — sie war wirkungslos, und ohne die Messung haette das
wie ein Erfolg ausgesehen.

`[cmd]` **Jetzt ein Modulzustand** (`let schonGeprueft = false`):
**F5 laedt das Modul neu und setzt ihn zurueck, ein `router.push`
nicht.** `[read]` **Das ist die gesuchte Grenze.**

### Eine Entscheidung, die der Auftrag offen liess

`[cmd]` **Ein erster Entwurf liess auch `navigate` springen** — mit
Toms Begruendung *,,wenn er mal paar tage nicht online ist"*.

`[read]` **Das waere zu breit:** ein geteilter Link
`?datum=2026-09-18` ist eine ABSICHT, keine alte Sitzung. **Wer ihn
oeffnet, will genau diesen Tag sehen** — ihn auf heute umzuleiten
waere dieselbe Falle, nur andersherum.

`[cmd]` **Toms Wortlaut traegt die engere Fassung:** *,,wenn ein
refresh/server restart/F5/ctrl F5 gemacht wird"* — **er nennt
Neuladen, nicht Aufrufen.**

`[read]` **Gebaut ist deshalb nur `reload`.** `[cmd]` **Der Waechter
sichert beide Richtungen:** F5 springt, ein geteilter Link nicht.

### Zwei Kleinigkeiten, die sonst spaeter beissen

`[cmd]` **Der Sprung behaelt die uebrigen Parameter** (G-117) —
sonst wirft er `?tab=` weg und landet auf Diary.

`[cmd]` **`router.replace`, nicht `push`** — der alte Tag gehoert
nicht in die Zurueck-Liste, sonst fuehrt der Zurueck-Knopf direkt
zurueck in die Falle.

### Der Waechter

`[cmd]` **`g487-heute-nach-f5.test.ts`, 7 Faelle.** `[cmd]`
**`_g487-sabotage.mjs`: 9 Schaeden plus Kontrolle — 10/10.**

`[read]` **Der erste Schaden ist Toms Fall selbst** (*,,nach F5 wird
NICHT gesprungen"*), **der vierte ist die Gegenrichtung** (*,,jedes
Blaettern springt zurueck"*).

### Die Fotos

    backup/x-g487-a1-vorher.png    18.09., der alte Tag
    backup/x-g487-a1-nachher.png   nach F5: „Heute", 2.768 kcal

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    vorher   ?datum=2026-09-18   "Fr., 18. Sept. 2026"
    F5
    nachher  ?datum=2026-09-21   "Heute"

`[cmd]` **`useHeuteNachF5` in `v2/tageswechsler.tsx`, Zeile
135.**

`[cmd]` **Sechs Module rendern ihn: Dashboard, Goals,
Nutrition, Recovery, Supplements, Training.**

`[cmd]` **Proben: web 1900/1900, coach 65/65.**

### A2 brachte eine Ueberraschung

> *,,Ich habe die Regel zuerst in
`nutrition/datumsnavigation.tsx` eingebaut ? und die Probe
zeigte, dass NICHTS passiert. Die Datei hat seit G-376 keinen
Aufrufer mehr."*

`[read]` **Eine Datei, die aussieht wie die richtige Stelle,
und tot ist** ? **gefunden, weil er die Wirkung gemessen hat
statt den Einbau.**

### Die Gegenprobe war entscheidend

> *,,Gemessen meldet der Browser nach einem `router.push`
weiterhin `reload` ? eine Regel OHNE RIEGEL haette bei jedem
Blaettern auf heute zurueckgesprungen, und du haettest keinen
anderen Tag mehr ansehen koennen."*

`[cmd]` **Deshalb dreimal zurueckgeblaettert: 20., 19., 18. ?
haelt.**

`[read]` **Eine Behebung, die schlimmer gewesen waere als der
Fehler** ? **und er hat sie vor dem Abliefern gemessen.**

### Ein Fehler, den nur die Messung fand

> *,,Mein erster Entwurf merkte sich die Pruefung im
`sessionStorage`. Der Marker stand aber schon VOR dem F5 auf
1 ? `sessionStorage` ueberlebt genau das Ereignis, das
unterschieden werden soll. Die Regel war wirkungslos und
haette ohne Messung wie ein Erfolg ausgesehen."*

### Und eine Entscheidung, die der Auftrag offenliess

> *,,Ich habe die Regel auf `reload` begrenzt, nicht auf
`navigate`. Ein geteilter Link `?datum=2026-09-18` ist eine
ABSICHT, keine alte Sitzung ? ihn umzuleiten waere dieselbe
Falle, nur andersherum."*

`[read]` **Toms Wortlaut traegt die engere Fassung:**
*,,refresh/server restart/F5/ctrl F5"*.

`[cmd]` **Dazu: der Sprung behaelt `?tab=` (G-117) und nutzt
`replace` statt `push`** ? **der Zurueck-Knopf fuehrt nicht in
die Falle zurueck.**

**Abgenommen.**


