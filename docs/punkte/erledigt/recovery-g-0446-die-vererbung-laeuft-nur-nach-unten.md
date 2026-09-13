---
nr: G-446
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-445
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 6a0c5926
beruehrt:
  dateien:
    - apps/web/src/lib/training/muskelzustand.ts
zahlen:
  gemessen: 2026-09-08
---

# G-446 — die Vererbung laeuft nur nach unten

## Der gemeinsame Nenner von vier Befunden

Tom, 2026-09-08: *,,schau zuerst selber, was die liste
betrifft, vorallem child vom triceps."*

`[read]` **Ein Elternteil weiss nicht, was seine Kinder tun.**

## Befund 1: Koepfe zeigen `--`, der Elternteil rechnet

    Triceps                        100%  607 h - 7 Saetze
      Triceps Brachii Lateral Head   --  keine Uebung trifft ihn
      Triceps Brachii Long Head      --  keine Uebung trifft ihn
      Triceps Brachii Medial Head    --  keine Uebung trifft ihn

    Quadriceps                     100%  751 h - 7 Saetze
      Vastus Lateralis               --  keine Uebung trifft ihn
      Vastus Medialis                --  keine Uebung trifft ihn

`[read]` **Widersinnig: der Trizeps wurde trainiert, seine drei
Koepfe angeblich nicht.**

`[cmd]` **Und `Rectus Femoris` steht direkt daneben mit `Wert
von Quadriceps`** ? **dieselbe Ebene, andere Antwort.**

`[read]` **Die Marke *,,keine Uebung trifft ihn"* ist FALSCH bei
einem Kopf, dessen Elternteil getroffen wird** ? **er leiht,
wie G-438 es baut.**

`[cmd]` **Betroffen, gemessen:**

    triceps-longum, -lateralis, -mediale
    vastus-lateralis, -medialis
    gastrocnemius-lateralis, -medialis

`[read]` **Sieben Koepfe** ? **ihre Eltern (`Triceps` 305,
`Quadriceps`, `Calves`) haben Zuordnungen.**

## Befund 2: ein Elternteil ohne Wert vererbt einen

    Lower Back        --    Kinder ohne eigene Messung
      erector spinae  100%  Wert von Lower Back

`[read]` **Woher nimmt der Erector einen Wert von einem
Elternteil, der keinen hat?**

`[cmd]` **`erector spinae` hat 204 EIGENE Zuordnungen** ? **er
muesste selbst rechnen, nicht leihen.**

## Befund 3: ein unbelastetes Elternteil mit trainiertem Kind

    Chest              100%  unbelastet - nie trainiert
      Pectoralis Major 100%  607 h - 7 Saetze - Push 6

`[read]` **Ein Elternteil kann nicht unbelastet sein, wenn sein
Kind trainiert wurde.**

`[cmd]` **Dasselbe bei `Glutes`, `Hamstrings`, `Adductors`** ?
**ueberall, wo ein Kind Saetze hat und der Elternteil nicht.**

## Was zu bauen ist

`[read]` **Die Vererbung muss in BEIDE Richtungen gehen:**

    nach unten   ein Kind ohne eigene Messung leiht vom
                 Elternteil            (G-438, gebaut)
    nach oben    ein Elternteil ohne eigene Messung
                 verdichtet aus den Kindern   (FEHLT)

`[cmd]` **Und die Reihenfolge zaehlt:**

    1  hat der Muskel EIGENE Saetze?      -> rechnen
    2  hat ein Elternteil Saetze?         -> leihen
    3  haben Kinder Saetze?               -> verdichten
    4  keine Uebung trifft ihn und keinen
       seiner Verwandten                  -> Marke

`[read]` **Heute fehlt Schritt 3, und Schritt 4 wird zu frueh
erreicht.**

## Abnahmebedingungen

    A1  die sieben Koepfe leihen vom Elternteil.
        Foto Liste.
    A2  erector spinae rechnet SELBST (204
        Zuordnungen), leiht nicht.
    A3  Chest zeigt den verdichteten Wert seiner
        Kinder, nicht "unbelastet".
    A4  "keine Uebung trifft ihn" nur noch, wenn
        weder Muskel noch Eltern noch Kinder
        getroffen werden. Zahl vorher/nachher.
    A5  Gegenprobe je Richtung: ein Kind ohne
        Elternteil, ein Elternteil ohne Kinder.
    A6  apps/web 1717 oder mehr.

## Bericht

**Claude Code, 2026-09-13.**

### Alle drei Befunde nachgemessen — und zwei Zahlen berichtigt

`[cmd]` **Gemessen ueber `training`, alle Konten, 2026-09-13:**

    Name                       Zuordnungen   Saetze
    Triceps                        309         109
      die drei Koepfe                0           0
    Quadriceps                     356          77
      Vastus Lateralis/Medialis      0           0
    Calves                         199           0
      Gastrocnemius L/M Head         0           0
    Lower Back                       0           0
      erector spinae               204          77
    Chest                            1           0
      Pectoralis Major             211         109

`[read]` **Der Auftrag nennt fuer `Triceps` 305** ? **es sind
309.** `[read]` **Kein Streit, nur ein anderer Stichtag** —
C-493 hat inzwischen Sitzungen ergaenzt.

`[cmd]` **Und eine Unterscheidung, die der Auftrag nicht trennt:
Zuordnungen sind nicht Saetze.** `[cmd]` **`Calves` hat 199
Zuordnungen und NULL Saetze** ? **seine Uebungen wurden nie
ausgefuehrt.** `[read]` **Das entscheidet weiter unten, ob
`Calves` verdichtet oder unbelastet bleibt.**

### Was gebaut ist

`[cmd]` **Die vier Schritte stehen in `muskelLage()`** —
`apps/web/src/lib/training/muskelzustand.ts`:

    1  eigene Saetze?          -> gerechnet
    2  Elternteil hat Saetze?  -> geliehen      (nach unten)
    3  Kinder haben Saetze?    -> verdichtet    (nach oben, NEU)
    4  Sippe leer?             -> Marke

`[cmd]` **`sippen()` liefert Eltern und Kinder je Muskel** — aus
denselben Knoten, aus denen die Liste gebaut wird, **ohne zweite
Abfrage.**

`[cmd]` **Karte UND Liste rufen dieselbe Funktion** ? **sonst
faerbte die Karte wieder anders, als die Liste rechnet (der
Befund aus G-440).**

### Wie verdichtet wird — und warum so

`[cmd]` **Der Auftrag gibt keine Formel vor.** `[cmd]` **Gemessen,
welche Eltern ueberhaupt betroffen sind:**

    Chest        1 gemessenes Kind   (Pectoralis Major)
    Lower Back   1 gemessenes Kind   (erector spinae)
    Glutes / Hamstrings / Adductors / Calves
                 0 gemessene Kinder  -> bleiben unbelastet

**Stunden: der JUENGSTE Reiz (`Math.min`).** `[read]` **Wer ein
Kind vor zwei Stunden trainiert hat, ist als Gruppe nicht
erholt** — auch wenn ein anderes Kind seit Wochen ruht. `[read]`
**Ein Maximum liesse die Gruppe erholt aussehen, waehrend sie es
nicht ist.**

**Saetze: SUMMIERT.** `[read]` **Sie sind eine Menge, anders als
die Erholung selbst** — zwei Kinder mit je 7 Saetzen ergeben 14.

**Der angezeigte PROZENTWERT bleibt der Schnitt** ? **`Ø` in der
Gruppenzeile rechnet unveraendert weiter** (G-436). `[read]`
**Dieselbe Groesse an derselben Stelle darf nicht zwei Rechenarten
haben** — sonst zeigte `Ø` etwas anderes als der Wert daneben.

**Keine Summe der Prozente:** `[read]` **Erholung ist ein
Prozentsatz, keine Menge** — zwei Kinder zu 100 % ergeben nicht
200 %.

### A1 — die sieben Koepfe leihen

`[cmd]` **Als TEXT gelesen, nicht nur betrachtet**
(`tools/_g446-zeilen.mjs`, 105 Zeilen aus dem DOM):

    Triceps                      || 100% 607 h - 7 Saetze - Push 6
    Triceps Brachii Lateral Head || 100% Wert von Triceps
    Triceps Brachii Long Head    || 100% Wert von Triceps
    Triceps Brachii Medial Head  || 100% Wert von Triceps
    Vastus Lateralis             || 100% Wert von Quadriceps
    Vastus Medialis              || 100% Wert von Quadriceps

`[cmd]` **Foto: `backup/x-g446-nachher.png`** (1920 breit).

**FUENF leihen, ZWEI nicht** ? **und das ist richtig:**

`[cmd]` **`Gastrocnemius Lateral/Medial Head` haben nichts zu
leihen** ? **`Calves` hat 199 Zuordnungen, aber NULL Saetze.**
`[cmd]` **Sie stehen jetzt auf `unbelastet`, wie ihr Elternteil
und ihr Geschwister `Soleus`:**

    Calves                     || 100% unbelastet - nie trainiert
    Soleus                     || 100% unbelastet - nie trainiert
    Gastrocnemius Lateral Head || 100% unbelastet - nie trainiert

`[read]` **Der Auftrag zaehlt sie zu den sieben** ? **sie
bekommen denselben Zustand wie ihre Sippe, nur ueber Schritt 4
statt Schritt 2.** `[read]` **Von `--` sind sie weg, und darum
ging es.**

### A2 — erector spinae rechnet SELBST

    erector spinae || 100% 751 h - 7 Saetze - Legs 5
    Lower Back     || Ø 100% - schwaechstes: erector spinae 100%
                      100% aus 1 Kind verdichtet - 751 h - 7 Saetze

`[read]` **Kein *,,Wert von Lower Back"* mehr** ? **Schritt 1
schlaegt Schritt 2, und die 204 Zuordnungen tragen die Zeile.**

`[read]` **Und der Elternteil hat es umgekehrt gelernt:** **er
verdichtet jetzt aus dem Kind, statt ihm einen Wert zu geben, den
er selbst nie hatte.**

### A3 — Chest zeigt den verdichteten Wert

    Chest            || Ø 100% - schwaechstes: Pectoralis Major 100%
                        92% aus 1 Kind verdichtet - 607 h - 7 Saetze
    Pectoralis Major || 100% 607 h - 7 Saetze - Push 6

`[cmd]` **Und die zwei anderen Kinder leihen jetzt vom Bruder
ueber den Elternteil:**

    Clavicular Head  || 100% Wert von Pectoralis Major
    Sternal Head     || 100% Wert von Pectoralis Major

`[cmd]` **`ARMS` desgleichen:** `86% aus 3 Kindern verdichtet -
607 h - 16 Saetze`.

### A4 — die Marke: 9 -> 0

`[cmd]` **Ueber dieselben 105 Zeilen gezaehlt, vorher und
nachher:**

    "keine Uebung trifft ihn"    9  ->  0
    "Wert von ..."              18  -> 23
    "verdichtet"                 0  ->   6

`[cmd]` **Belegt durch Stashen** ? **`x-g446-zeilen-vorher.txt`
gegen `x-g446-zeilen.txt`, beide aus derselben Messung.**

**Warum NULL und nicht EINS:**

`[cmd]` **Die Datenbank kennt genau einen Muskel ohne jede
erreichbare Verwandtschaft: `Posterior Neck Muscles`.**

`[cmd]` **Er zeigt `-- nicht gezeichnet`** ? **der DRITTE
Zustand, nicht die Marke.** `[cmd]` **Grund nachgesehen:
`ebenen.ts:313` gibt `nacken` bewusst `name: null`** (*„die
Vorlage trennt Scalenes und splenius capitis nicht"*). `[read]`
**Keine Zeile beansprucht diese Flaeche** — **das ist
vorbestehend und richtig, kein Nebeneffekt von G-446.**

**Und ein Befund, den erst der Bildschirm zeigte:**

`[cmd]` **Nach Schritt 3 stand da:**

    Calves                      100%  unbelastet
      Soleus                    100%  unbelastet
      Gastrocnemius Lat. Head     --  keine Uebung trifft ihn

`[read]` **Alle drei gleich untrainiert, einer anders
beschriftet** ? **weil Schritt 4 den Katalog nur am EINZELNEN
Knoten fragte.**

`[cmd]` **Berichtigt: die Katalogfrage gilt der SIPPE** — wer
erreichbare Eltern oder Kinder hat, ist erreichbar. `[cmd]` **Das
ist woertlich, was A4 verlangt:** *„nur noch, wenn weder Muskel
noch Eltern noch Kinder getroffen werden."*

### A5 — Gegenprobe je Richtung

`[cmd]` **Beide Richtungen als eigene Zusicherung:**

    ein Kind OHNE Elternteil     -> leiht nichts, keine Quelle
    ein Elternteil OHNE Kinder   -> verdichtet nichts, zustand null
    ganz OHNE Sippe              -> faellt nicht um

`[read]` **Der zweite ist der gefaehrliche:** **`Math.min()` ueber
eine leere Liste ergibt `Infinity`** ? **die Gruppe saehe
vollstaendig erholt aus, ohne dass irgendetwas gemessen waere.**

`[cmd]` **Drei Sabotagen, je die richtige Probe rot:**

    Schritt 1 abgeschaltet  -> not ok 1, not ok 11   (2 rot)
    min -> max beim Verdichten -> not ok 5           (1 rot)
    sippen() auf einen Durchlauf -> not ok 10        (1 rot)

`[cmd]` **Alle drei zurueckgespielt: 11 / 11 gruen.**

`[read]` **Die dritte Sabotage ist die, die ich beim Bauen selbst
fast gemacht haette** ? **ein Einzeldurchlauf in `sippen()` haengt
an der Zeilenreihenfolge: ein Knoten, der zuerst als ELTERNTEIL
auftaucht, bekaeme `elternId: null` und behielte es.**

### A6 — Bestand

`[cmd]` **`apps/web`: 1728 Pruefungen, 1728 gruen, 0 rot**
(vorher 1717 — **die elf neuen sind meine G-446-Proben**).

`[cmd]` **`apps/coach`: 65 Pruefungen, 65 gruen, 0 rot.**

`[cmd]` **`pnpm --filter @lumeos/web build`: gruen**,
`/v2/recovery` **44,7 kB / 186 kB.** `[cmd]` **`tsc --noEmit`:
gruen.**

### Was ich angefasst habe

    apps/web/src/lib/training/muskelzustand.ts
      muskelLage() um geliehen/verdichtet erweitert, sippen() neu
    apps/web/src/app/v2/recovery/tab-messwerte.tsx
      Karte und Liste rufen dieselbe Entscheidung
    apps/web/src/lib/training/__tests__/
      g446-vererbung.test.ts                  NEU, 11 Proben
    apps/web/src/lib/koerper/__tests__/
      g438-geliehen.test.ts                   blinde Zeile -> Wirkung
    tools/_g446-zeilen.mjs                    NEU, das Messwerkzeug

`[read]` **`tools/_g446-zeilen.mjs` bleibt liegen** ? **dieselbe
Bauform wie `_g440-quellen.mjs` und `_g438-zuordnung.mjs`.**
`[cmd]` **Es liest die 105 Listenzeilen als Text** — **damit ist
A1 bis A4 zaehlbar statt betrachtet.**

`[read]` **Nichts in `supabase/`** ? **C-493 lief waehrenddessen
und ist unberuehrt.**

`[read]` **Nicht committet, nicht gestaged.**

### Ein blinder Waechter, den die Aenderung aufgedeckt hat

`[cmd]` **`wertKommtVonGruppe()` wird von der Liste nicht mehr
gerufen** ? **die Zuordnung lief ueber die KARTENflaeche, nicht
ueber den Baum, und traf deshalb nur gezeichnete Muskeln.**

`[cmd]` **Ich hatte zuerst in diesen Bericht geschrieben, die
Funktion habe *,,weitere Aufrufer"*** ? **nachgemessen:
`grep -rn wertKommtVonGruppe apps/web/src` **findet KEINEN
Aufrufer mehr**, nur den Import und eine Waechterzeile.**

`[cmd]` **Und dieser Waechter war blind:**
`g438-geliehen.test.ts:146` **sucht `/wertKommtVonGruppe\(/` ueber
die GANZE Datei** ? **er blieb gruen, weil der Name noch in
meinem Kommentar stand.**

`[read]` **Die Lehre `waechter-liest-die-eigene-begruendung`** —
**ein Waechter, der Kommentare mitliest, misst die Begruendung
statt der Sache.**

`[cmd]` **Berichtigt: Kommentare raus, dann nach der WIRKUNG
suchen** (`/vonGruppe:\s*\w/`) ? **bestimmt die Kachel die
Herkunft ueberhaupt?**

`[cmd]` **Und belegt, dass er dadurch nicht blind blieb** —
Sabotage `return { wert, vonGruppe: … }` **->** `return wert`:

    not ok 6 - G-438/A3: die Liste schreibt die Herkunft AN DIE ZEILE

`[cmd]` **Der tote Import ist raus**,
`SCHLUESSEL_ZU_GRUPPE` **bleibt** — **die KARTE braucht ihn
weiter.**

`[read]` **`wertKommtVonGruppe()` selbst bleibt in
`schluessel-gruppe.ts` stehen** ? **sie zu entfernen waere eine
zweite Aenderung im selben Durchgang.** `[cmd]` **Gemeldet, nicht
still geloescht** — **wer sie wieder braucht, findet sie.**

### Neustart

`[read]` **Keiner noetig** ? **nur `apps/web/src/`, heisses
Nachladen.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Sein `_g446-zeilen.mjs` selbst gelaufen:**

    Triceps Brachii Lateral Head  100%  Wert von Triceps
    Triceps Brachii Long Head     100%  Wert von Triceps
    Triceps Brachii Medial Head   100%  Wert von Triceps
    erector spinae                100%  752 h - 7 Saetze
    Chest                          92%  aus 1 Kind verdichtet
    Lower Back                    100%  aus 1 Kind verdichtet

`[cmd]` **Kein einziges *,,keine Uebung trifft ihn"*.**

`[cmd]` **Proben: web 1728/1728, coach 65/65.**

### Zwei Korrekturen an meiner Vorgabe

**1** ? `[cmd]` **Triceps hat 309 Zuordnungen, nicht 305** ?
**C-493 hat zwischenzeitlich Sitzungen angelegt.**

**2** ? **Und das ist der wichtigere:**

> *,,Zuordnungen sind keine SAETZE. Calves hat 199 Zuordnungen,
aber null Saetze ? seine Uebungen wurden nie ausgefuehrt. Diese
Unterscheidung entscheidet A1."*

`[read]` **Mein Auftrag nannte 305 Zuordnungen als Begruendung,
warum die Koepfe leihen sollen** ? **die richtige Groesse sind
die Saetze.**

`[cmd]` **Selbst nachgemessen: Triceps 160 Saetze, Calves 11.**

`[read]` **Zum Zeitpunkt seines Laufs waren es null** ? **C-493
lief daneben.**

### Die Verdichtungsformel, gemessen und begruendet

> *,,`hours = Math.min` (der FRISCHESTE Reiz ? eine Gruppe ist
nicht erholt, weil ein Kind geruht hat), `sets` = summiert (eine
MENGE, anders als die Erholung), und das angezeigte O bleibt der
Mittelwert, weil dieselbe Zahl an derselben Stelle nicht zwei
Arithmetiken haben darf."*

`[read]` **Ich hatte KEINE Formel vorgegeben** ? **er hat drei
verschiedene gewaehlt und jede einzeln begruendet.**

`[read]` **Der letzte Satz ist der beste** ? **eine Zahl, eine
Rechnung.**

### Die zwei Gastrocnemius-Koepfe

> *,,Sie haben nichts zu leihen, also landen sie auf
`unbelastet` ? derselbe Zustand wie ihr Elternteil `Calves` und
ihr Geschwister `Soleus`. Weg von `--`, und das war der
Punkt."*

`[read]` **Konsistent mit der Familie, nicht mit einer Regel.**

### Und eine Selbstkorrektur

> *,,Ich schrieb zuerst, `wertKommtVonGruppe()` haette *andere
Aufrufer*. Gemessen: keinen. Und der Waechter blieb nur gruen,
weil der NAME in meinem eigenen Kommentar ueberlebte ? er suchte
die ganze Datei einschliesslich Kommentare."*

`[cmd]` **Selbst nachgemessen: fuenf Treffer, vier davon
Kommentare, einer die Definition.**

`[cmd]` **Umgeschrieben: Kommentare abgestreift, Wirkung
geprueft, und belegt, dass er weiter faellt.**

`[read]` **Die tote Funktion bleibt** ? *,,gemeldet statt still
geloescht"*.

**Abgenommen.**
