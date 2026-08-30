---
nr: G-275
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-351
entscheidung: E-35
beruehrt:
  tabellen: [supplements.intake_logs]
  dateien: [apps/web/src/app/v2/supplements/tabs.tsx]
zahlen:
  gemessen: 2026-08-30
  intake_logs: 744
  unklare_einnahmen: 513
agent: claudecode
beauftragt: 2026-08-30
---

# G-275 — die Supplement-Tagesbilanz anzeigen

## Befund

`[cmd]` **`supplements.daily_intake_summary` steht seit dem 30.08.
live** und wird von keiner Oberflaeche gerufen.

`[cmd]` **744 Einnahmen, davon 513 ohne belegte Naehrstoffmenge.**

`[read]` **Codex hat die Ehrlichkeit eingebaut:** die 513 bleiben
sichtbar, **statt als 0 zu gelten.** `[cmd]` **Nachweis am 19.08.:
FAPUN3 = 2 g bei vier Einnahmen — eine belegt, drei unbekannt.**

`[read]` **Diese Unterscheidung muss die Anzeige tragen**, sonst geht
sie unterwegs verloren.

## Auftrag

**Die Bilanz im Supplements-Reiter, mit der Trennung belegt gegen
unbekannt.**

`[read]` **E-35 gilt:** jedes Modul rechnet seine eigene Bilanz.
**Kein Griff nach `nutrition.daily_summary`** — die Summierung kommt
spaeter und gehoert ins Dashboard.

`[read]` **Und die Form steht schon:** die Mikronaehrstoff-Ansicht in
Nutrition zeigt seit G-239 vier Zustaende und trennt *unvollstaendig*
von *gedeckt*. **Dieselbe Unterscheidung, andere Quelle.**

### Was zu messen ist, bevor gebaut wird

`[cmd]` **Welche Naehrstoffe erreichen ueberhaupt eine Bilanz?**
`[cmd]` **`supplement_nutrients` traegt 17 Substanzen** — **das ist
wenig, und die Anzeige muss es sagen, statt eine leere Tabelle zu
zeigen.**

`[read]` **Und ob es einen Reiter gibt, der das schon zeigt** —
**Doppelungspruefung vor dem Bau, wie in G-253.**

### Was nicht zu tun ist

**Keine Summierung mit Nutrition.**
**Keine Menge raten** — 513 unbekannte bleiben unbekannt.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Bilanz je Tag             echte Zahlen, ein Tag belegt
    belegt gegen unbekannt    unterscheidbar - Bildschirmfoto
    Naehrstoffe ohne Bilanz   sichtbar, nicht als 0
    Doppelung                 zeigt ein Reiter das schon?
    Attrappen                 vorher / nachher, am Schirm
    Ladezeit                  ms, kalt und warm

## Bericht

**Claude Code, 2026-08-30.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Beide Funktionen sind angebunden, beide Ergebnisgleichheit
belegt.**

`[cmd]` **Der Nachweistag aus dem Auftrag stimmt genau:** FAPUN3 =
2,000 g bei 4 Einnahmen — 1 belegt, 3 unbekannt. **Und die Anzeige
traegt es:** *,,≥ 2 g · Untergrenze · aus 1 von 4 Einnahmen — für 3
ist keine Menge hinterlegt."*

**Drei Praemissen sind gefallen, alle drei zugunsten des Bestands:**

    daily_intake_summary ist eine VIEW, keine Funktion — die
    Bilanzfunktion heisst supplement_nutrient_intake_for_day
    564 Einnahmen ohne Menge, nicht 513
    die Umstellung auf die Flag-Funktion spart KEINE Zeit

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| Bilanz je Tag | **echte Zahlen** — FAPUN3 am 19.08., Bildschirmfoto |
| belegt gegen unbekannt | **unterscheidbar** — drei Zustaende, `≥` vor der Untergrenze |
| Naehrstoffe ohne Bilanz | **sichtbar als Strich**, nicht als 0 |
| Doppelung | **gefunden und ersetzt** — „Gap analysis" zeigte dasselbe |
| Attrappen | **`intel` 7 → 6**, am Schirm gezaehlt |
| Ladezeit | today **2.993 / 2.531 ms**, intel **2.889 / 2.500 ms** |
| G-273 Ergebnisgleichheit | **9 / 11 / 10 Flags — in allen drei Fenstern identisch** |

### 1 · Was zuerst gemessen wurde

`[cmd]` **Beide Funktionen gegen `pg_proc` geprueft, bevor eine
Zeile entstand** — die Lehre aus G-273, wo eine „gebaute" Funktion
live fehlte.

`[cmd]` **Dabei fiel die erste Praemisse:**
`supplements.daily_intake_summary` **ist eine View, keine Funktion**
— sie liefert Einnahmezahlen und `compliance_pct`, aber keine
Naehrstoffe. `[cmd]` **Die Bilanz je Naehrstoff liefert
`supplements.supplement_nutrient_intake_for_day(p_user_id,
p_entry_date)`** — sie steht live, und sie ist die richtige Quelle.

`[cmd]` **Die zweite Praemisse:** der Auftrag nennt 513 Einnahmen
ohne belegte Menge. **Gemessen sind es 564** (180 mit Menge, 744
gesamt). **Gemeldet, nicht angepasst.**

`[cmd]` **Der Nachweistag stimmt dafuer auf die Stelle:**
`supplement_nutrient_intake_for_day(dev, 2026-08-19)` liefert
**FAPUN3, 2,000 g, `taken_log_count` 4, `mapped` 1, `unmapped` 3.**

### 2 · Die Doppelungspruefung hat etwas gefunden

`[cmd]` **Der `intel`-Reiter trug eine Attrappe „Gap analysis"** —
Spalten `NUTRIENT`, `FOOD`, `SUPPS`, `TOTAL`, `RDA COVERAGE`, mit
erfundenen Zahlen.

`[read]` **Sie hatte die richtige Form und die falsche Rechnung:**
sie addierte Essen und Praeparate zu einer Gesamtzufuhr und verglich
mit der RDA. `[cmd]` **Genau das verbietet E-35** — jedes Modul
rechnet seine eigene Bilanz, die Summierung gehoert ins Dashboard.

`[read]` **Also ersetzt, nicht danebengestellt** (G-253). `[cmd]`
**Am Schirm: 7 Attrappen vorher, 6 nachher** — und die Karte heisst
jetzt *,,Nährstoffe aus Präparaten"*.

`[cmd]` **Der Geltungsbereich steht als Satz an der Karte:** *,,Nur
der Anteil aus Präparaten. Was über das Essen dazukommt, steht in
Nutrition."* **Ein Test verbietet jeden Griff nach `nutrition.`.**

### 3 · Die Trennung, um die es geht

`[read]` **Drei Zustaende, nicht zwei** — dieselbe Dreiteilung wie in
G-239 und G-208:

    belegt        jede genommene Einnahme traegt eine Menge
    Untergrenze   ein Teil ist belegt, der Rest nicht  ->  „≥ 2 g"
    unbekannt     nichts belegt  ->  ein Strich, KEINE 0

`[read]` **Die Null ist der Kern:** eine 0 hiesse „nichts
eingenommen", obwohl genommen wurde. **Ein Test und eine Sabotage
halten es fest.**

`[read]` **Und die Untergrenze ist grau, nicht rot** — sie ist keine
Warnung, sondern eine unvollstaendige Messung.

`[cmd]` **Die Datenlage steht darunter:** *,,Für 17 Substanzen sind
Nährstoffmengen hinterlegt. Einnahmen ohne hinterlegte Menge fehlen
in den Summen — sie zählen nicht als null."*

`[cmd]` **Ein Detail, das erst beim Bauen auffiel:** der Reiter zeigt
den **juengsten Protokolltag**, nicht heute (G-149) — auf dev der
19.08. **Die Bilanz nimmt denselben Tag**, sonst stuenden Kachel und
Tabelle auf verschiedenen Tagen und niemand saehe es.

### 4 · G-273 — angebunden, und die Erwartung faellt

`[cmd]` **`reference_assessment_window_flags` steht live** (C-349) —
in G-273 war sie nur in der Pipeline.

`[cmd]` **Ergebnisgleichheit, dev, bis 2026-08-30, drei Fenster:**

    7 Tage    Datenbank  9 Flags   Client  9 Flags   GLEICH
    30 Tage   Datenbank 11 Flags   Client 11 Flags   GLEICH
    90 Tage   Datenbank 10 Flags   Client 10 Flags   GLEICH

`[read]` **Verglichen wurden Code, getroffene Tage UND Nenner** —
nicht nur die Anzahl.

**Umgestellt. Aber die Zeitersparnis bleibt aus:**

    Reiter vorher (G-272), fenster=90    6.898 ms warm
    Reiter nachher                       6.605 ms warm

`[cmd]` **Die Ursache, gemessen:** beide Funktionen kosten dasselbe —
alte Fensterfunktion **Median 1.920 ms**, Flag-Funktion **Median
1.906 ms** (je fuenf Laeufe). **Die Flag-Funktion RUFT die
Fensterfunktion auf;** die Rechnung faellt weiter an, nur die Fracht
nicht.

`[cmd]` **Und die Fracht war nie der Engpass:** im Browser kommen
**0 Bytes** dieser Aufrufe an — er laeuft serverseitig, die 8,3 MB
gingen zwischen Next.js und PostgREST auf derselben Maschine.
**Meine Schaetzung von ~895 ms Uebertragung in G-272 war falsch.**

`[read]` **Die Umstellung bleibt richtig** — 10 Zeilen statt 154 mit
8,3 MB, weniger Auspacken, weniger Speicher. **Aber sie loest das
Zeitproblem nicht**, und das gehoert gesagt statt als Erfolg
gemeldet. **Die 1,9 s stecken in `reference_assessment_window`
selbst.**

`[cmd]` **Die Ausnahmeliste bleibt im Code:** drei Obergrenzen gelten
laut Quelle nicht fuer Nahrung (MG, NIA, FOLAC — C-323). **Die
Datenbank zaehlt nur Tage; die Einordnung trifft `mikro-flags.ts`.**
Ein Test haelt es fest — ohne sie warnte MG 88-mal falsch.

### 5 · Die Sabotagen — 10 von 10 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | unbelegte Einnahmen gelten als belegt | ja |
| 2 | die Untergrenze verschwindet | ja |
| 3 | bei unbekannter Menge steht trotzdem eine Zahl | ja |
| 4 | die Untergrenze wird als Warnung gefaerbt | ja |
| 5 | die Datenlage wird nicht genannt | ja |
| 6 | die Anzeige umgeht die Belegpruefung | ja |
| 7 | die Bilanz kommt aus einer anderen Funktion | ja |
| 8 | die zaehlende Funktion wird nicht gerufen | ja |
| 9 | der Nenner wird durch die getroffenen Tage ersetzt | ja |
| 10 | die Supplement-Ausnahme faellt weg | ja |

`[cmd]` **Sabotage 6 ueberlebte im ersten Lauf:** `{zeigtMenge(l)`
wurde zu `{true` — **die Funktion blieb importiert und wurde nie
gefragt.** `[read]` **Wort statt Wirkung, dieselbe Klasse wie in
G-274.** Verschaerft auf den Aufruf mit seinem Argument.

### 6 · Zwei Waechter haben sich gedreht (A-62)

`[cmd]` **Der G-260-Waechter verlangte `flagVon(` und
`getNaehrstoffDauer(` im Leseweg** — richtig, solange der Browser
zaehlte. **Seit heute zaehlt die Datenbank, und beide Namen stehen
dort nicht mehr.** `[read]` **Umgestellt auf die Wirkung:** der
Reiter bildet Flags und gibt einen Nenner mit.

`[cmd]` **Und der Attrappenzaehler ging von 12 auf 11** — er sagt
selbst, was zu tun ist (*,,Angebunden? Dann die Erwartung hier
senken"*).

### 7 · Zwei Befunde nebenbei

**a) `flagVon` und `getNaehrstoffDauer` haben nur noch
Test-Aufrufer.** `[read]` **Nach A-59 gehoeren sie geloescht** — Code
ohne Aufrufer wird beim naechsten Mal fuer gebaut gehalten. **Ich
habe es nicht getan:** `flagVon` traegt die gepruefte Regel, und ob
sie als Gegenprobe zur Datenbankfunktion stehen bleibt, ist eine
Entscheidung. **Zur Entscheidung vorgelegt.**

**b) Die 1,9 s von `reference_assessment_window` sind der eigentliche
Engpass.** `[read]` **Eine zaehlende Funktion, die NICHT ueber die
Fensterfunktion geht, waere die naechste Stufe** — sie gehoert Codex.

### 8 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 gruen.** `[cmd]` **Typecheck sauber,
Build gruen.** `[cmd]` **598 von 598 Tests gruen** (Nutrition +
Supplements), davon 15 neue. `[cmd]` **Encoding sauber, Exit 0.**

`[cmd]` **Am Schirm: keine Doppelung**, `intel` von 7 auf 6
Attrappen, `today` und `compliance` unveraendert bei 0.

**Bildschirmfotos:** `backup/g275-nachher-intel.png` (die Bilanz mit
`≥ 2 g` und der Herkunftszeile), `g275-vorher-intel.png` (die
ersetzte Attrappe), `g273-nachher.png`.

**Nichts auf `dev@lumeos.app` geschrieben — nur gelesen. Nicht
committet, nicht gestaget.**

## Abnahme

_(vom Orchestrator)_
