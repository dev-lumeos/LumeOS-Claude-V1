---
nr: G-373
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-372
entscheidung: E-72
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 989500e0
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
  fehlend: 2
---

# G-373 — Stacks editieren und anlegen

## Befund

Aus G-372, Claude Code, 2026-09-08, A6:

> *,,Editieren braucht keine Datenbankarbeit: `ergaenzePosition`,
> `entfernePosition` und `setzeBestand` stehen in `stack-write.ts`
> mit null UI-Aufrufern."*

`[read]` **Siebter Fall von A-71** — **der Leseweg liegt daneben,
niemand ruft ihn.**

    G-364   <RecMuscleMap /> ohne Prop                3 Kacheln
    G-365   Today-Sitzung aus festem Objekt           1
    G-365   Modalitaeten, modality_log ungenutzt      4
    G-365   Rechenweg las TDEE_STATE statt tdee-Prop  1
    G-366   ladeSitzungsUebungen nicht durchgereicht  1
    G-353   vorlagenLageVon(0) fest verdrahtet        1
    G-373   drei Schreibwege ohne Aufrufer            3

`[cmd]` **`Neuer Stack` ist der letzte `InEntwicklungKnopf` in der
Kachel.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Editieren

`[cmd]` **Die drei Funktionen stehen** — **`ergaenzePosition`,
`entfernePosition`, `setzeBestand`.**

`[read]` **Reich sie durch, wie du es bei `ladeSitzungsUebungen`
gemacht hast** (G-366).

### 2 · Neuer Stack

`[cmd]` **`authenticated` haelt INSERT auf beiden Tabellen** —
**keine Datenbankarbeit noetig.**

`[read]` **Aber `goal` ist die Frage:** `[cmd]` **`user_stacks`
traegt sieben Werte im CHECK** (C-427).

`[read]` **Bis C-427 entschieden ist, gilt die Siebenerliste** —
**sie steht in der Datenbank und ist die aeltere.**

### Lies zuerst

`[cmd]` **`00-QUELLEN.md`, Abschnitt Supplements.** `[cmd]` **Und
`module-supplements-spec.jsx`** — **dort stand die Regel, die keine
Spec nennt** (G-372).

`[cmd]` **Der Mockup nennt es *Item customization*** — **das ist der
Gegenpart zum Editieren** (A5 aus G-372).

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  eine Position ergaenzt. Zahl: stack_items vorher/nachher.
    A2  eine Position entfernt. Zahl: vorher/nachher.
    A3  ein Bestand gesetzt. Zahl: der Wert vorher/nachher.
    A4  ein neuer Stack angelegt. Zahl: user_stacks
        vorher/nachher, und welches `goal` er traegt.
    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A6  kein `InEntwicklungKnopf` mehr in der Kachel. Zahl:
        vorher/nachher.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern.**
**C-427 nicht entscheiden** — **die Siebenerliste gilt bis dahin.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### Gelesen, bevor gebaut

`[cmd]` **`00-QUELLEN.md`, Abschnitt supplements:** vier
Mockupdateien.

`[cmd]` **`module-supplements-spec.jsx:562`, ,,Item customization"** —
**der Mockup nennt die vier Felder, die das Editieren braucht:**

    Custom name      "Morning Magnesium"
    Own dose         can deviate from rec.
    Own timing       any slot
    Cycling config   {on_weeks, off_weeks}

`[cmd]` **Und `:530`** — der Knopf heisst dort ,,Edit" und steht als
letzter in der Stackzeile. **`:513`** — ,,New stack" sitzt im
Kartenkopf.

### A1 — eine Position ergaenzt

**`stack_items` 3 → 4.**

`[cmd]` **Ueber das Formular unter dem aufgeklappten Stack:**

    G373 Testposten | 500.000 | mg | morning | Koerperkomposition Grundlagen

### A2 — eine Position entfernt

**`stack_items` 4 → 3**, und es verschwand genau die Testzeile.

#### Ein Befund am Weg dorthin

`[cmd]` **Der Entfernen-Knopf trug nur ein Icon und keinen Namen.**
**In der Knopfliste stand er als leer** — gemessen, weil der
Nachweis ihn nicht ansprechen konnte:

    Neuer Stack | Teilen | Zu | Ändern |  | Ändern |  | Position | …

`[read]` **Das ist kein Testproblem, sondern ein Bedienproblem:**
wer mit der Tastatur oder einem Vorleser arbeitet, findet einen
namenlosen Knopf nicht. **Behoben** — er heisst jetzt
*,,<Name> entfernen"*.

### A3 — ein Bestand gesetzt

**`stock_remaining` NULL → 42.00** an der ersten Position des
aktiven Stacks.

`[read]` **Eigener Schreibweg** (`setzeBestand`), nicht Teil des
Dosis-Formulars — der Bestand wird beim Verbrauch fortgeschrieben,
nicht beim Bearbeiten der Dosis.

### A4 — ein neuer Stack angelegt

**`user_stacks` 3 → 4**, **`goal` = `longevity`.**

    G373 Nachweis-Stack | longevity | user | nicht aktiv

`[cmd]` **`goal` aus der Siebenerliste des CHECK**
(`user_stacks_goal_check`) — die Auswahl im Formular fuehrt genau
diese sieben Werte.

`[read]` **C-427 ist NICHT entschieden.** Die Liste wird benutzt,
weil sie in der Datenbank steht und die aeltere ist — **wie
beauftragt.**

`[read]` **Der neue Stack ist nicht automatisch aktiv** — dieselbe
Trennung wie bei der Vorlagenuebernahme (SPEC_03, Flow 2: erst
anlegen, dann aktivieren).

### A5 — E-69: Referenz unter der Linie

**4 angebunden / 4 Referenzen** — unveraendert gegenueber G-372.

    OBEN   Meine Stacks | Vorlagen | Einnahmefrequenz |
           Je Eintrag hinterlegt
    UNTEN  My stacks | System templates | Frequency options |
           Item customization

### A6 — kein `InEntwicklungKnopf` mehr

**1 → 0.**

`[cmd]` **,,Neuer Stack" war die letzte Attrappe der Kachel.**
`[cmd]` **Nach dem Umbau blieb nur noch der Import stehen** — auch
der ist raus, sonst haette die Zahl 1 gemeldet, was keiner Sache
entspricht.

### Was gebaut wurde

    lib/supplements/stack-write.ts       legeStackAn,
                                         aenderePosition
    lib/supplements/substanz-read.ts     eintraege: StackPosten[]
    v2/supplements/stack-aktionen.ts     fuenf Aktionen
    v2/supplements/stack-bearbeiten.tsx  NEU, die Postenliste
    v2/supplements/tab-spec.tsx          Bearbeiten, Neuer Stack
    lib/supplements/__tests__/
      stack-lage.test.ts                 eintraege im Hilfsbauer

`[cmd]` **Der Leseweg gab bisher nur `posten: number`.** `[read]`
**Zum Editieren reicht eine Zahl nicht** — wer eine Position
aendern will, braucht ihre Kennung. **Die Posten kommen jetzt mit,
in EINER Abfrage** (nicht einer je Stack, C-189).

### Was gemeldet und nicht gebaut ist

`[cmd]` **`cycling` fehlt.** Der Mockup fuehrt es unter *Item
customization* als `{on_weeks, off_weeks}` — **ein Objekt, das eine
eigene Eingabe braucht.** `[read]` **Halb gebaut waere schlechter
als offen benannt**; die Kachel sagt es an der Stelle.

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen (1 Fehler behoben, eigener)
    encoding-pruefen            20.917 Dateien, sauber
    pnpm --filter web test      1502 pass, 1 fail — NICHT von mir

### Der Fehlschlag gehoert C-268, und er ist ein Waechterbefund

`[cmd]` **`C-225/G-169: die drei Schreibwege …` faellt mit
*,,Einladen fehlt"*.**

`[cmd]` **Gemessen, wann es brach:**

    vor 1d5f8785   nachrichten-schreiben.ts: 1x from('relationships')
    danach         0x

`[cmd]` **Der Einladeweg ist aber NICHT verloren** — C-268 hat ihn
auf einen RPC umgestellt:
`nachrichten-schreiben.ts:84` ruft
`create_relationship_invite`, und die Funktion steht live
(`pg_proc`).

`[read]` **Die Sache funktioniert, der Waechter nicht.** Er sucht
`from('relationships').insert(` — **eine Schreibform, nicht die
Wirkung.** **Dieselbe Klasse wie G-216, G-247, G-246.**

`[read]` **Nicht angefasst** — `lib/coach/` gehoert Codex. **Der
Waechter muesste auf den RPC-Aufruf pruefen, nicht auf den
Tabellenzugriff.**

### Was unberuehrt blieb

`[cmd]` **`dev@lumeos.app`: 1 Stack, 4 Posten — unveraendert.**
`[cmd]` **Alle Schreibvorgaenge auf `test-user`:** 4 Stacks,
3 Posten.

`[read]` **Die Nachweiszeilen stehen bewusst noch da** — sie sind
der Beleg am Schirm.

**Nichts in `supabase/`. C-427 nicht entschieden. Nicht committet,
nicht gestaget.**

## Abnahme

**2026-09-08, Orchestrator.** **Sechs Bedingungen mit Zahlen.**

    A1  stack_items 3 -> 4
    A2  4 -> 3, genau die Testzeile weg
    A3  Bestand NULL -> 42.00, eigener Schreibweg
    A4  user_stacks 3 -> 4, goal = longevity
    A5  4 angebunden / 4 Referenzen
    A6  InEntwicklungKnopf 1 -> 0

### Der Nachweis fand einen Mangel, den keine Pruefung sah

`[cmd]` **Der Entfernen-Knopf trug nur ein Zeichen und keinen
Namen** — **in der Knopfliste erschien er leer.**

`[read]` **Das ist ein Tastatur- und Vorleseproblem** — **gefunden
beim Nachweisen, nicht beim Hinsehen.**

`[cmd]` **Jetzt: *,,<Name> entfernen"*.**

### Und der Leseweg musste erweitert werden

`[cmd]` **Er lieferte nur `posten: number`.**

`[read]` **Eine Zahl laesst sich nicht bearbeiten** — **man braucht
die `id` je Posten.**

`[cmd]` **Die Posten kommen jetzt in einer Abfrage mit, nicht einer
je Stapel** (C-189).

### Der fremde Testfehler: diagnostiziert, nicht gemeldet

`[cmd]` **Er hat gemessen: vor `1d5f8785` ein Treffer fuer
`from('relationships')`, danach null.**

`[cmd]` **C-268 hat den Einladeweg auf die RPC
`create_relationship_invite` verlegt** — **die Pruefung suchte
weiter den Tabellenschreibvorgang.**

`[read]` **Das Wort statt der Wirkung** — **dieselbe Klasse wie
G-216, G-247, G-246, und wie die Sammelfrage in G-370.**

### Nachgezogen, und dabei ein zweiter Befund

`[cmd]` **Der Orchestrator hat den Waechter berichtigt** — **und
dabei gemessen, dass es VIER Wege sind, nicht drei:**

    sendeNachricht          Tabelle, .select('id')
    markiereGelesen         Tabelle, .select('id')
    ladeCoachEin            RPC (C-268)
    nehmeEinladungZurueck   RPC (C-269)

`[read]` **Die Drei war ueberholt, nicht falsch gemessen** —
**C-269 hat den vierten Weg dazugebaut, und niemand hat die
Erwartung nachgezogen.**

`[cmd]` **Jetzt zwei Zusicherungen statt einer Summe:** **zwei
Tabellenwege, zwei RPCs.**

`[cmd]` **Gegenprobe: die RPC entfernt -> ROT
*,,Einladen und Zuruecknehmen laufen ueber RPCs"*, zurueckgebaut ->
1503 gruen.**

### Was offen bleibt

`[cmd]` **Zyklen (`on_weeks`, `off_weeks`) sind ein Objekt und
brauchen eine eigene Eingabe.**

`[read]` **Gemeldet, nicht halb gebaut** — **und die Kachel sagt es
an der Stelle.**

**Abgenommen.**

