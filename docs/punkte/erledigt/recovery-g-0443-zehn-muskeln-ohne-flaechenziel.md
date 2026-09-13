---
nr: G-443
typ: fehler
modul: recovery
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-482
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 7e7e37b7
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/muskel-ebenen.ts
zahlen:
  gemessen: 2026-09-08
  muskeln: 10
---

# G-443 — zehn Muskeln ohne Flaechenziel

## Befund

`[cmd]` **`muskel-ebenen.test.ts`, zwei rote Proben:**

    "99 Beziehungen statt 89"
    zehn Muskeln ohne Flaechenziel

`[cmd]` **Claude Code hat sie durch Stashen geprueft** ?
**dieselben zwei Fehler ohne seine Aenderung.**

`[read]` **Die Ursache: C-482 hat zehn Namen in
`muscle_groups` angelegt (Serratus, drei Trizepskoepfe, zwei
Vastus, zwei Gastrocnemius, External Oblique, Posterior Neck
Muscles).**

`[cmd]` **Neun davon haben seit G-438 eine Flaeche** ? **nur
`Posterior Neck Muscles` nicht.**

`[read]` **Die Waechterzahl 89 stammt von VOR C-482.**

## Was zu tun ist

`[read]` **Die Zahl auf 99 setzen** ? **aber ERST messen, ob 99
richtig ist.**

`[cmd]` **Die Regel aus Toms Waechteransage:** *,,wer einen
waechter anfasst, laesst ihn GRUEN zurueck."*

`[cmd]` **C-482 hat zehn Namen gebaut und den Waechter rot
gelassen** ? **derselbe Fall wie G-439 (`fiber_g`).**

## Und die zehn einzeln

`[read]` **Miss je Name, ob er eine Flaeche BRAUCHT.**

`[cmd]` **`Posterior Neck Muscles` ist eine Gruppe, kein
Einzelmuskel** ? **Codex hat sie in C-482 bewusst so benannt,
*,,statt faelschlich nur Scalenes oder Splenius zu
behaupten"*.**

`[read]` **Eine Gruppe ohne eigene Flaeche ist kein Fehler.**

## Abnahmebedingungen

    A1  je der zehn: Flaeche noetig oder nicht?
        Begruendet.
    A2  die Waechterzahl stimmt mit der Wirklichkeit.
        Gemessen, nicht geschaetzt.
    A3  beide Proben GRUEN.
    A4  Gegenprobe: ein elfter Name ohne Flaeche
        -> faellt sie?

## Bericht

**Claude Code, 2026-09-13.**

### Die Auftragspraemisse faellt: nicht neun, sondern NULL

`[cmd]` **Der Auftrag sagt:** *,,Neun davon haben seit G-438 eine
Flaeche ? nur Posterior Neck Muscles nicht."*

`[cmd]` **Gemessen: ALLE ZEHN hatten keine.**

`[cmd]` **Zwei unabhaengige Wege, beide dasselbe:**

    Zaehlung gegen MUSKEL_ZU_FLAECHE   10 ohne Flaeche
    grep im ganzen recovery-Ordner     0 Treffer fuer
                                       "Serratus Anterior",
                                       "Vastus Lateralis"

`[cmd]` **Und der Waechter selbst nennt sie** ? **seine
Fehlermeldung listet genau diese zehn, nicht eine.**

`[read]` **Die Praemisse war nicht halb falsch, sondern ganz** ?
**ich habe sie gemessen, bevor ich gebaut habe.**

### A1 ? je der zehn, begruendet

`[cmd]` **Die Elternbeziehung aus C-482 (`8cd5c6bf`) gemessen**
? **jeder der zehn haengt unter einer Gruppe, die schon eine
Flaeche hatte:**

    Name                          Eltern        Flaeche der Eltern
    Serratus Anterior             Shoulders     deltoids
    External Oblique              Obliques      3er-Liste
    Triceps Brachii Long Head     Triceps       3er-Liste
    Triceps Brachii Lateral Head  Triceps       3er-Liste
    Triceps Brachii Medial Head   Triceps       3er-Liste
    Vastus Lateralis              Quadriceps    3er-Liste
    Vastus Medialis               Quadriceps    3er-Liste
    Gastrocnemius Lateral Head    Calves        2er-Liste
    Gastrocnemius Medial Head     Calves        2er-Liste
    Posterior Neck Muscles        Neck Muscles  2er-Liste

`[cmd]` **Der entscheidende Befund: die EINZELNEN Flaechen gibt
es laengst.** `[cmd]` **In `packages/ui/src/koerperkarte-pfade.ts`
nachgesehen** ? `serratus-anterior`, `external-oblique`,
`triepos-longum`, `vastus-lateralis`, `gastrocnemius-medialis`
**sind seit G-430/G-434 gezeichnete Pfade.**

`[read]` **Sie waren nur nicht erreichbar** ? **wer den Wert
eines einzelnen Kopfes kannte, faerbte ueber die Elterngruppe
ALLE Geschwister mit.**

`[read]` **Das ist genau das Gegenteil dessen, wofuer G-430 die
Flaechen aufgeteilt hat.**

**NEUN brauchen eine eigene Flaeche** ? **jeder ist EIN
anatomischer Muskel mit EINEM gezeichneten Pfad:**

    Serratus Anterior             -> serratus-anterior
    External Oblique              -> external-oblique
    Triceps Brachii Long Head     -> triceps-longum
    Triceps Brachii Lateral Head  -> triceps-lateralis
    Triceps Brachii Medial Head   -> triceps-mediale
    Vastus Lateralis              -> vastus-lateralis
    Vastus Medialis               -> vastus-medialis
    Gastrocnemius Lateral Head    -> gastrocnemius-lateralis
    Gastrocnemius Medial Head     -> gastrocnemius-medialis

`[cmd]` **`Serratus Anterior` ist der schaerfste Fall:** **ueber
`Shoulders` faerbte er `deltoids`** ? **den Deltamuskel, unter
dem er gar nicht liegt.** `[read]` **Anatomisch falsch, nicht nur
ungenau.**

`[read]` **Die Bauform stand schon da:** `'Rectus Femoris':
'rectus-femoris'` **neben der Gruppe `Quadriceps`** ? **die zwei
Vasti sind derselbe Fall, dritter und vierter Kopf.**

**EINER braucht KEINE** ? `Posterior Neck Muscles`.

`[cmd]` **Der Auftrag hat hier recht, und C-482 nennt den
Grund:** *,,statt faelschlich nur Scalenes oder Splenius zu
behaupten"*.

`[cmd]` **Und die Datenbank sagt es auch** ? **als einziger der
zehn hat er `NULL` als dritte Spalte, wo die neun anderen
`legs`/`arms`/`core`/`shoulders` tragen.**

`[read]` **Es gibt keinen Pfad zu zeichnen** ? **er faellt auf
`nacken`, wie seine Geschwister `Scalenes` und `splenius
capitis`.** `[read]` **Dieselbe Bauform wie `Back`/`Upper Back`
auf dem Latissimus, sechs Zeilen hoeher in derselben Datei.**

### A2 ? die Zahlen, gemessen

`[cmd]` **Zwei Zahlen im Waechter waren falsch, nicht eine:**

    Beziehungen   89 -> 99
    Namen         96 -> 106

`[cmd]` **C-482 hat zehn Namen UND zehn Beziehungen angelegt**
? **die zehnte Beziehung ist `('splenius capitis', 'Neck
Muscles')`, ein bestehender Name, der seine Elternzeile erst
dort bekam.** `[read]` **96+10 und 89+10.**

`[cmd]` **Gegengeprueft an einer dritten Quelle:
`107_muscle_groups_hierarchy.sql` prueft sich SELBST gegen
`v_groups <> 106`** ? **dieselbe 106, von Codex geschrieben,
nicht von mir gewaehlt.**

**Und ein zweiter Befund, den niemand gemeldet hat:**

`[cmd]` **Die Zusicherung `namenAusC73().length == 96` ist seit
C-482 NIE GELAUFEN** ? **sie steht hinter der Beziehungszahl in
derselben Pruefung, und die fiel schon bei 99 != 89.**

`[read]` **Die 96 war zwoelf Tage lang unbemerkt falsch** ?
**verdeckt von einem Fehler in derselben Funktion.**

### Der dritte Waechter, den der Auftrag nicht nennt

`[cmd]` **Nach der Aenderung fielen ZWEI weitere Proben in
`flaechen-zahlen.test.ts`** ? **einer Datei, die der Auftrag
nicht erwaehnt.**

`[read]` **Sie ist die Folge, nicht ein neuer Fehler:** **sie
zaehlt, wieviele Muskeln je Flaeche landen** ? **und zehn neue
Zuordnungen aendern diese Verteilung zwangslaeufig.**

`[cmd]` **Gemessen, nicht geschaetzt** ? **die Verteilung aus dem
Code selbst berechnet:**

    Summe        132 -> 142     genau +10
    Eintraege     96 -> 106
    Zuordnungen  132 -> 142

`[cmd]` **Je Name genau +1** ? **keiner der zehn deckt mehrere
Flaechen:**

    gastrocnemius-lateralis  9 -> 10
    gastrocnemius-medialis   9 -> 10
    vastus-lateralis         8 ->  9
    vastus-medialis          4 ->  5
    nacken                   3 ->  4
    external-oblique         2 ->  3
    serratus-anterior        1 ->  2
    triceps-longum           1 ->  2
    triceps-lateralis        1 ->  2
    triceps-mediale          1 ->  2

`[read]` **Keine Flaeche kam hinzu, keine fiel weg** ? **die
Pfade gab es alle seit G-430.**

`[read]` **Auch hier war eine zweite Zahl verdeckt:** **die
`96` in `flaechen-zahlen.test.ts` hat bis heute nie angeschlagen,
weil die Verteilungspruefung davor faellt.**

### A3 ? beide Proben gruen

`[cmd]` **`muskel-ebenen.test.ts`: 9 Pruefungen, 9 gruen** (vorher
7 gruen, 2 rot).

`[cmd]` **`flaechen-zahlen.test.ts`: 2 Pruefungen, 2 gruen.**

`[cmd]` **Zusammen 11 / 11.**

### A4 ? Gegenprobe

`[cmd]` **Einen elften Namen ohne Flaeche in die Kettendatei
gelegt** ? `('Sabotage Muskel G443', 'Triceps')`:

    not ok - C-73 fuehrt 106 Namen und 99 Beziehungen
             100 Beziehungen statt 99
    not ok - jede der 106 Gruppen hat eine Flaeche
             Ohne Flaechenziel: Sabotage Muskel G443

`[read]` **Beide Proben fallen, und die zweite NENNT den Namen**
? **sie misst die Sache, nicht eine Summe.**

`[cmd]` **Danach zurueckgespielt:
`git status supabase/_pipeline/10_training/` leer, 11 / 11
gruen.**

`[read]` **Die Kettendatei ist unveraendert** ? **die Sabotage
lief gegen eine Sicherungskopie und ist restlos zurueck.**

### Was ich angefasst habe

    apps/web/src/app/v2/recovery/muskel-ebenen.ts
    apps/web/src/app/v2/recovery/__tests__/muskel-ebenen.test.ts
    apps/web/src/app/v2/recovery/__tests__/flaechen-zahlen.test.ts

`[read]` **Nichts in `supabase/`** ? **die Sabotage war
voruebergehend und ist belegt zurueckgenommen.**

### Was offen bleibt

`[cmd]` **Der Waechtertext verweist auf
`docs/ssot/104-muskelkarte.md`** (*,,dann auch den Bericht
nachziehen"*). `[cmd]` **Nachgesehen: weder `132` noch `96`
stehen dort** ? **die Datei nennt 23 Flaechen-IDs und 17
Muskelgruppen, eine aeltere Ebene.**

`[read]` **Also kein Nachtrag noetig, den ich sehe** ? **aber
`docs/` gehoert dem Orchestrator** (CLAUDE.md), **und die 23/17
sind seit G-430/G-434 ebenfalls ueberholt.** `[read]` **Das
gehoert geprueft, nicht von mir geaendert.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    Waechter   11/11 gruen
    Proben     apps/web 1707/1707

### Meine Praemisse war falsch

> *,,Der Auftrag sagte: neun haben seit G-438 eine Flaeche ? nur
Posterior Neck Muscles nicht. GEMESSEN: alle zehn hatten
keine."*

`[cmd]` **Dreifach belegt** ? **eigene Zaehlung, `grep` ueber
`recovery/` (null Treffer fuer *Serratus Anterior* und *Vastus
Lateralis*), und die Fehlermeldung des Waechters selbst.**

`[read]` **Ich habe aus G-438 geschlossen, dass die Namen
eingetragen wurden** ? **eingetragen wurde in `ebenen.ts`, nicht
in `muskel-ebenen.ts`.**

### Der schaerfste Fall

> *,,Serratus Anterior faerbte `deltoids` ? den Deltoid, unter
dem er NICHT liegt."*

`[cmd]` **Jeder der zehn loeste nur ueber seinen Elternteil auf**
? **und der faerbt alle Geschwister gleichzeitig.**

`[read]` **Ein sichtbar falsches Bild, nicht nur eine fehlende
Zeile.**

### Zwei Zahlen, nicht eine

`[cmd]` **Beziehungen 89 -> 99 UND Namen 96 -> 106.**

> *,,Die `== 96`-Zusicherung war seit C-482 NIE GELAUFEN ?
versteckt hinter der fallenden Beziehungszahl im selben Test."*

`[read]` **Eine Zusicherung, die nie ausgefuehrt wird, weil eine
fruehere im selben Test faellt** ? **sie sieht gruen aus und
misst nichts.**

`[cmd]` **Und gegen eine DRITTE Quelle geprueft: die SQL-Datei
prueft sich selbst gegen `v_groups <> 106`** ? **Codex' Zahl,
nicht seine.**

### Ein dritter Waechter, den ich nicht genannt habe

`[cmd]` **`flaechen-zahlen.test.ts`: 132 -> 142.**

> *,,Das ist eine FOLGE, kein neuer Fehler ? zehn neue
Zuordnungen aendern die Verteilung. Aus dem Code gerechnet:
exakt +1 je Name."*

`[read]` **Er hat die Zahl nicht angepasst, sondern
hergeleitet.**

**Abgenommen.**
