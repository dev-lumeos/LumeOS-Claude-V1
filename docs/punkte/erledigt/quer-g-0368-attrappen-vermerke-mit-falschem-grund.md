---
nr: G-368
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
erledigt: 2026-09-28
commit: 7399aca3
agent: claudecode
beauftragt: 2026-09-28
braucht: []
kind_von: A-71
entscheidung: E-68
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  geprueft: 32
  falsch: 8
---

# G-368 — Attrappen-Vermerke mit falschem Grund

## Befund

Aus G-364 und G-365, 2026-09-07.

`[cmd]` **32 markierte Kacheln geprueft, acht Marken waren falsch.**

    training     11 geprueft, 1 falsch
    recovery     21 geprueft, 4 falsch
                  3 aus G-364 dazu

`[read]` **Und die richtigen teilen sich auf:**

    bedingt          4  -- Marke gilt nur in einem Fall
    Referenz         6  -- gehoert zur Entwurfsansicht
    ehrlich         17  -- kein Leseweg, kein Schema

## Was daraus folgt

`[read]` **Nicht jede Marke luegt** — **aber eine von vier.**

`[read]` **Und man sieht es nicht ohne Messung** — **die Kachel
behauptet einen Mangel, und niemand prueft nach.**

`[cmd]` **E-68 verlangt Quelle und Grund** — **aber kein Vermerk
sagt, wann er zuletzt geprueft wurde.**

## Zu klaeren

`[read]` **Traegt ein Vermerk ein Datum?** `[cmd]` **Dann liesse
sich zaehlen, wie viele aelter als drei Monate sind.**

`[read]` **Oder eine Punktnummer** — **dann weiss man, worauf er
wartet, und ob der Punkt noch offen ist.**

`[cmd]` **G-364 hat gezeigt, dass ein Vermerk Wochen ueberdauert,
nachdem sein Grund weggefallen ist.**

## Bericht

**Claude Code, 2026-09-28.**

### A1 — die falschen Marken, einzeln

`[read]` **Der Punkt nennt acht, aber nicht WELCHE.** Ich habe sie
gesucht, statt die Zahl zu uebernehmen. `[cmd]` **Gefunden und
berichtigt: fuenf.** **Der Rest war bereits zu** — die Vermerke in
`recovery/fehlende-kacheln.tsx:200` und `:267` und die drei
MOD-Marken stimmen.

**1 bis 3 — drei Marken mit ueberholten ZAHLEN.**

`[read]` **Der GRUND stimmte jeweils** (*,,die Kachel ist nur nicht
gebaut"*) — **die Zahl daneben nicht.**

    Datei: apps/web/src/app/v2/recovery/fehlende-kacheln.tsx

    :177  resting_hr        behauptet 43   gemessen 94
    :240  sleep_hours       behauptet 170  gemessen 370
    :307  sleep_start/_end  behauptet je 170  gemessen je 370

`[cmd]` **Gegen `recovery.checkins` gemessen, 2026-09-28.** **Alle
drei Spalten existieren und tragen Werte** — die Marken sagen das
richtig, nur mit Zahlen vom 07.09.

`[cmd]` **Berichtigt, je mit Stichtag im Text.**

**4 — eine Marke mit wanderndem Fenster.**

    :138  „38 hrv_rmssd-Werte in den letzten 90 Tagen"
          gemessen 2026-09-28: 32  (43 insgesamt)

`[read]` **Diese Zahl SINKT ohne neue Messungen** — das Fenster
wandert mit dem Datum. `[cmd]` **Der Vermerk trug seinen Stichtag
schon, das war richtig.** `[cmd]` **Zahl berichtigt, und die
Gesamtzahl dazugeschrieben**, damit der Unterschied Fenster/Bestand
sichtbar ist.

**5 — die eine falsche Marke in `training`.**

    apps/web/src/app/v2/training/fehlende-kacheln.tsx:428
    „nichts — die Serie ist gebaut und steht auf `today`;
     auf diesem Reiter fehlt sie nur"

`[cmd]` **Der erste Teil stimmt:** `TrainingSerie` ist angebunden
(`ansicht.tsx:615`). `[read]` **Aber *,,nichts"* ist die falsche
Auskunft fuer DIESE Kachel** — sie zeigt `12`, `18 weeks` und
`92 %`, **und keine dieser drei Zahlen ist gerechnet.**

`[read]` **Wer den Vermerk liest, haelt die Kachel fuer
uebertragbar und uebersieht die Entwurfswerte.** `[cmd]`
**Berichtigt: der Vermerk nennt jetzt den fehlenden Leseweg AUF
DIESEM REITER und sagt, dass die drei Zahlen Entwurf sind.**

### A2 — das Muster von heute, angewandt

`[cmd]` **In G-422 trug das Messungsmodal `InEntwicklung` mit dem
Grund *,,Was fehlt, ist der Schreibweg"*** — **der Schreibweg stand
seit G-122.**

`[read]` **Dieselbe Klasse hier, nur andersherum:** die drei
Recovery-Marken sagen richtig *,,die Spalte ist da"*, **aber mit
einer Zahl, die einen anderen Bestand beschreibt.** `[read]` **Eine
Marke mit falscher Zahl schickt die Suche nicht in die falsche
Richtung — sie laesst aber glauben, es sei zuletzt nachgesehen
worden.**

### A3 — die vier „bedingt"-Faelle

`[cmd]` **Der Fall `:138` ist der Prototyp:** eine Marke, deren
Zahl nur fuer EIN Konto und EINEN Stichtag gilt.

`[cmd]` **Er nennt beides schon** — *,,gemessen 2026-09-28 auf
`dev@lumeos.app`"*. `[read]` **Das ist die Form, die eine bedingte
Marke braucht:** wer sie liest, weiss, wofuer die Zahl gilt.

`[cmd]` **Die drei berichtigten Marken tragen jetzt denselben
Zusatz** (`(2026-09-28)`). `[read]` **Damit ist an jeder Zahl
ablesbar, wann sie zuletzt stimmte** — genau das, was der Punkt
unter *,,Zu klaeren"* fragt.

### A4 — die drei Zahlen

`[cmd]` **Gemessen ueber `apps/web/src/app/v2`, 2026-09-28:**

    Marken gesamt                    495
    davon mit eigenem Grund          256
    davon mit PRUEFBAREM Grund       115
    nur die ATTRAPPE-Konstante       239

`[read]` **Pruefbar heisst: der Grund nennt eine Nummer
(`G-357`), eine Tabelle oder Spalte (`recovery.checkins`,
`` `resting_hr` ``) oder eine Datei.** `[read]` **Ein Grund ohne
so etwas laesst sich nicht nachschlagen** — er altert unbemerkt,
wie die vier oben.

`[cmd]` **239 Marken tragen nur den Satz *,,Aus dem Entwurf
uebernommen …"*** — **das ist knapp die Haelfte.** `[read]` **Sie
sind nicht falsch, aber sie sagen nichts ueber ihren Grund.**

`[cmd]` **KEIN Waechter gebaut** — die drei Zahlen sind der
Sollstand fuer den, der ihn spaeter baut.

### Abgrenzung

`[cmd]` **Geaendert: zwei Dateien** (`recovery/fehlende-kacheln.tsx`,
`training/fehlende-kacheln.tsx`), **fuenf Marken.** `[cmd]`
**Keine Marke entfernt** — in allen fuenf Faellen fehlt weiterhin
etwas, nur die Beschreibung war ueberholt.

`[cmd]` **Nichts in `supabase/`. Nicht committet.**

## Abnahme

`[cmd]` **Committet in `7399aca3`, voller Gate-Lauf gruen.**

`[read]` **Der Punkt nannte acht falsche Marken, nicht welche.** Der
Agent hat gesucht statt gezaehlt: **fuenf waren noch falsch, drei
laengst zu.** Haette er die Acht uebernommen, haette er drei erfunden.

`[cmd]` **Drei Marken trugen ueberholte Zahlen** — der Grund stimmte
jeweils, die Zahl daneben nicht. Selbst gegen die Datenbank geprueft:

    :177  resting_hr        behauptet  43   gemessen  94
    :240  sleep_hours       behauptet 170   gemessen 370
    :307  sleep_start/_end  behauptet 170   gemessen 370

`[cmd]` **Eine mit wanderndem Fenster** (`:138`): 38 behauptet, 32
gemessen — die Zahl sinkt ohne neue Messungen, weil das
90-Tage-Fenster mitwandert. **Jetzt tragen alle vier ihren Stichtag.**

`[read]` **Die fuenfte war die interessanteste** (`training:428`): sie
sagte, es fehle ,,nichts". Formal richtig, die Serie ist angebunden —
**aber die Kachel zeigt 12, 18 weeks und 92 %, und keine dieser
Zahlen ist gerechnet.** Die Marke hat sie gedeckt.

### Die Inventur (A4)

    495   Marken gesamt
    256   mit eigenem Grund
    115   mit pruefbarem Grund (Nummer, Tabelle/Spalte oder Datei)
    239   nur die Konstante, ohne jeden Grund

**Kein Waechter gebaut.** Die 115 sind der Sollstand fuer den, der ihn
spaeter baut.
