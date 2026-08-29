---
nr: G-259
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: C-323
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/reference-assessment-read.ts
zahlen:
  gemessen: 2026-08-29
  fensterlaufzeit_90d_ms: 1786
  billiger_weg_ms: 195
---

# G-259 — toter Leseweg und die Fensterlaufzeit

## Zwei Befunde aus C-323

`[cmd]` **`getNaehrstoffZeitraum` hat keinen Aufrufer** — **und
traegt die G-249-Falle:** `.limit(20000)` fuer 12.420 Zeilen, ohne
seitenweises Laden. `[read]` **Heute harmlos, weil nichts sie
aufruft.** `[read]` **A-59 sagt loeschen:** Code ohne Aufrufer wird
beim naechsten Auftrag fuer gebaut gehalten — **und dieser traegt
zusaetzlich einen bekannten Defekt.**

`[cmd]` **`reference_assessment_window` kostet 1.786 ms fuer 90
Tage.** `[cmd]` **Die Kosten liegen in der Rechnung, nicht in der
Datenmenge** — Filtern spart nichts.

`[cmd]` **Ein billigerer Weg existiert bei 195 ms**, wuerde aber die
Referenzlogik nachrechnen. `[read]` **Beide Dateikoepfe verbieten
das** — es waere die zweite Wahrheit, die G-250 offenhaelt.

## Die Frage

`[read]` **Sind 1.786 ms fuer eine Flag-Ansicht vertretbar, oder
braucht es eine zaehlende Funktion in der Datenbank?**

`[read]` **Der Unterschied zum billigen Weg:** eine zaehlende
Funktion wuerde dieselbe Referenzlogik nutzen und nur weniger
zurueckgeben. **Das ist etwas anderes als sie nachzubauen.**

## Auftrag — die Ladezeit, drei Punkte

**Mitbeauftragt: G-252, G-260.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Die Zahlen im Befundteil hast du selbst gemessen** — in
C-323 und G-108. **Pruef sie trotzdem nach; sie sind aelter als deine
letzte Aenderung am Reiter.**

`[read]` **Und eine Ursache habe ich schon einmal falsch benannt:**
`[cmd]` **G-252 existiert, weil ich die 6,4 Sekunden einer
RPC-Schleife zugeschrieben habe, die es nicht gibt.** Codex hat es in
G-107 gemessen. **Diesmal misst du zuerst.**

### 1 · G-252 — woran liegt die Ladezeit?

`[cmd]` **Der Reiter braucht 5.906 ms warm bei `fenster=90`.**

`[read]` **Kandidaten, ungeordnet und ungemessen** — das ist eine
Liste, keine Vermutung, die du bestaetigen sollst:

    die Menge der geladenen Zeilen (138 x 90)
    das seitenweise Laden seit G-249
    reference_assessment_window (1.786 ms fuer 90 Tage, C-323)
    die Baumberechnung im Browser
    etwas, das hier nicht steht

`[cmd]` **`nutrition.reference_assessment_window()` existiert seit
G-107** und koennte Teil der Antwort sein. `[read]` **Ob der Leseweg
sie ueberhaupt nutzt, ist Teil der Messung.**

### 2 · G-259 — der tote Leseweg

`[cmd]` **`getNaehrstoffZeitraum` hat keinen Aufrufer und traegt die
G-249-Falle:** `.limit(20000)` fuer 12.420 Zeilen, ohne seitenweises
Laden.

`[read]` **A-59 sagt loeschen** — Code ohne Aufrufer wird beim
naechsten Auftrag fuer gebaut gehalten, **und dieser traegt
zusaetzlich einen bekannten Defekt.**

`[read]` **Loeschen, wenn nichts darauf zeigt.** Der Typecheck
belegt es, wie in G-255.

### 3 · G-260 — die Dauerregel, wenn es traegt

`[cmd]` **`flagVon` aus C-323 ist fertig, getestet, ohne Aufrufer,
und kostet 1.786 ms fuer 90 Tage.**

`[read]` **Du hast sie in G-108 absichtlich nicht angebunden, weil
zusammen rund 7,7 s herauskamen und C-189 neun Sekunden als Defekt
behandelt hat.** **Das war richtig.**

`[read]` **Wenn der Reiter nach Teil 1 schneller ist: anbinden und
messen.** **Wenn nicht: nicht anbinden und sagen, was fehlt.**

`[cmd]` **Was sie behebt, ist gemessen:** der `Auffaellig`-Filter
liefert bei 7, 30 und 90 Tagen dieselben zwoelf Codes. **Der
Zeitraumwaehler aendert die Zahlen, nicht die Auswahl.**

### Was nicht zu tun ist

**Die Referenzlogik nicht nachrechnen.** `[cmd]` **Ein billigerer Weg
existiert bei 195 ms, wuerde sie aber nachbauen** — **beide
Dateikoepfe verbieten das**, und es waere die zweite Wahrheit, die
E-31 gerade zurueckgestellt hat.

`[read]` **Eine zaehlende Funktion, die dieselbe Logik nutzt und
weniger zurueckgibt, ist etwas anderes** — die waere zulaessig, aber
sie gehoert Codex.

**Keine zweite Ansicht neben eine bestehende.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Ladezeit je Zeitfenster     ms, kalt und warm, vorher / nachher
    Ursache                     benannt und belegt, oder als
                                unklar gemeldet
    getNaehrstoffZeitraum       geloescht, Typecheck belegt es
    Dauerregel                  angebunden oder begruendet nicht
    Auffaellig je Zeitraum      aendert sich die Auswahl jetzt?
    Attrappen                   am Schirm gezaehlt (A-59)

`[read]` **Die zweite Zeile darf *unklar* lauten** — das ist besser
als eine plausible Erklaerung ohne Beleg. **Genau das hat Codex in
G-107 richtig gemacht.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205) — in
G-108 hast du ihn richtig ueber `tools/server.py` neu gestartet.
`[cmd]` **Eine Messung vor dem Neukompilieren zeigt alte Zahlen.**
`[cmd]` **A-30, A-59, A-60.** `[cmd]` **`.limit()` hebt den
PostgREST-Deckel nicht auf.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-29.** Alle Zahlen mit Nutzer und Zeitraum,
`dev@lumeos.app`, Stichtag 2026-08-29.

### Die Kurzfassung

**Die Ursache ist gefunden und belegt — sie stand nicht auf der
Kandidatenliste.** `[cmd]` **Nicht die Datenmenge, nicht die
Baumberechnung, nicht `reference_assessment_window`** (die der Reiter
gar nicht aufrief): **das seitenweise Laden holte dreizehn Seiten
NACHEINANDER, und jede kostete dieselben ~238 ms.**

**Behoben, gemessen: 5.906 → 3.426 ms** bei `fenster=90`.

**Danach die Dauerregel angebunden — und sie kostet mehr als
gerechnet.** `[cmd]` **Endstand 6.393 ms.** `[read]` **Das ist unter
den neun Sekunden aus C-189, aber ueber dem Stand vor diesem
Auftrag.** **Die Entscheidung darueber gehoert Tom; ich lege beide
Zahlen vor.**

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| Ladezeit je Zeitfenster | Tabelle unten, kalt und warm, drei Staende |
| Ursache | **benannt und belegt** — sequenzielle Seiten, je ~238 ms |
| `getNaehrstoffZeitraum` | **geloescht**, 67 Zeilen; Typecheck sauber |
| Dauerregel | **angebunden** — mit Vorbehalt, siehe Teil 3 |
| `Auffaellig` je Zeitraum | unveraendert 12/12/12; **die Flags dagegen 10/12/10** |
| Attrappen | **0 am Schirm** (A-59) |

### 1 · G-252 — die Ursache, gemessen statt vermutet

`[cmd]` **Zuerst die Frage, ob der Reiter die teure Funktion
ueberhaupt ruft: nein.** `naehrstoff-ordnung.ts` benutzt
`nutrient_summary_window` (**94,7 ms**), nicht
`reference_assessment_window`. **Der 1.786-ms-Kandidat war nicht
beteiligt.**

`[cmd]` **Dann jeden der sieben Aufrufe einzeln, `explain (analyze)`,
90 Tage:**

    nutrient_defs                              0,4 ms
    nutrient_summary_window                   94,7 ms
    daily_nutrient_summary_long (alles)      235,0 ms
    daily_reference_assessment (1 Tag)        41,2 ms
    nutrient_details                           1,2 ms
    nutrient_search_aliases                    0,3 ms

`[read]` **Zusammen keine 400 ms — der Reiter brauchte 5.906.** Also
lag es nicht an einem einzelnen Aufruf.

`[cmd]` **Der Fund: `ladeReihen` blaettert in einer Schleife mit
`await`, und jede Seite kostet dasselbe.**

    Seite  0 (offset     0)    249 ms
    Seite  6 (offset  6000)    246 ms
    Seite 12 (offset 12000)    238 ms
    SUMME 13 Seiten          3.093 ms
    dieselben Daten, ein Zug   238 ms     Faktor 13

`[read]` **Der `OFFSET` spart nichts** — PostgreSQL sortiert alle
12.420 Zeilen jedes Mal neu und wirft die uebersprungenen weg.

`[cmd]` **Die Gegenprobe ueber die Fenster bestaetigt es:**

    Fenster  Zeilen  Seiten  gemessen  Seitenkosten  Rest
       7        966      1    2.920 ms      235 ms   2.685 ms
      30      4.140      5    3.743 ms    1.175 ms   2.568 ms
      90     12.420     13    5.906 ms    3.055 ms   2.851 ms

`[read]` **Der Rest ist in allen drei Fenstern gleich gross** (~2,7 s
Dev-Modus-Grundlast) — **die gesamte fensterabhaengige Zeit steckt in
den Seiten.** Die vorhergesagten Differenzen treffen auf ±283 ms.

**Behoben, ohne die Referenzlogik zu beruehren:** die Seiten haengen
nicht voneinander ab, **also laufen sie jetzt gleichzeitig**
(`Promise.all`), und die Seitenzahl kommt vorher aus einer
`count`-Anfrage ohne Nutzlast statt aus einer kurzen letzten Seite.

`[cmd]` **Gemessen, warm:**

    fenster    vorher     nach G-252
       7      2.920 ms      3.099 ms
      30      3.743 ms      3.131 ms
      90      5.906 ms      3.426 ms      -2.480 ms

`[cmd]` **Und es ist nicht schnell-und-falsch:** die Sparklines tragen
**7 / 30 / 90 Punkte** je Fenster — alle Zeilen kommen an. **Das war
die G-249-Falle, und sie ist nicht wieder aufgegangen.**

### 2 · G-259 — der tote Leseweg ist weg

`[cmd]` **`getNaehrstoffZeitraum` und der Typ `NaehrstoffTag`
geloescht** — 67 Zeilen. `[cmd]` **Der Typecheck belegt es**, wie in
G-255: nichts verwies darauf, und `tsc --noEmit` bleibt sauber.

`[read]` **Ein Vermerk steht an der Stelle**, mit Datum, Grund und dem
Hinweis, wer die Tageswerte heute holt.

`[cmd]` **Ein Waechter haelt die Falle selbst fest**, nicht nur ihren
Traeger: kein `.limit()` ueber 1.000 in den beiden Lesewegen.

### 3 · G-260 — angebunden, und die Rechnung ging nicht auf

`[cmd]` **Zuerst die Zahl nachgemessen, wie der Auftrag verlangt:**
`reference_assessment_window`, Median aus fuenf Laeufen — **154 ms
(7 T), 628 ms (30 T), 1.844 ms (90 T).** `[read]` **Die C-323-Zahl von
1.786 ms hat sich bestaetigt;** ein Einzellauf von mir hatte 2.858 ms
gezeigt — **ein Ausreisser, der es fast in diesen Bericht geschafft
haette.**

**Die Bedingung des Auftrags war erfuellt** (3.426 + 1.844 = 5.270 ms,
und als Nebenlaeufer sollte es weniger sein), **also angebunden.**

`[cmd]` **Gemessen, warm, Endstand:**

    fenster    vor G-252   nach G-252   mit Dauerregel
       7        2.920 ms     3.099 ms       3.132 ms
      30        3.743 ms     3.131 ms       3.849 ms
      90        5.906 ms     3.426 ms       6.393 ms

`[read]` **Meine Erwartung war falsch, und das gehoert in den
Bericht:** ich hatte mit ~3,4 s gerechnet, weil der Aufruf neben den
anderen laeuft. **Er kostet 2.971 ms Aufschlag.**

`[cmd]` **Woraus, gemessen:**

    die Funktion selbst                    1.820 ms
    Gleichzeitigkeit (8 statt 1 Anfrage)     256 ms
    Rest: 8,3 MB jsonb ueber PostgREST      ~895 ms

`[read]` **Der Rest ist Fracht, die verworfen wird:** 154 Zeilen mit
13.860 Tageseintraegen werden uebertragen, ausgepackt — **und dann zu
zehn Flags gezaehlt.**

`[read]` **Genau das ist die zaehlende Funktion, die der Auftrag
beschreibt und die Codex gehoert.** Sie wuerde dieselbe Referenzlogik
nutzen und nur die Zaehlung zurueckgeben. **Ich habe sie nicht
gebaut.**

**Was die Anbindung liefert** — die Probe, die G-108 nicht bestehen
konnte:

    Auffaellig-Filter    7 T: 12    30 T: 12    90 T: 12   dieselben Codes
    Dauer-Flags          7 T: 10    30 T: 12    90 T: 10   verschiedene

`[cmd]` **Und die Flags nennen den Zeitraum:** *,,Wasser an 88 von 88
bewerteten Tagen unter dem Zielwert"*, *,,Magnesium an 87 von 88
bewerteten Tagen ueber der Obergrenze"* — letzteres grau, weil die
Grenze laut Quelle nicht fuer Nahrung gilt (C-323).

`[cmd]` **Im Tagesmodus laeuft die Funktion nicht** — ein Tag hat
keine Dauer, und der Aufruf waere umsonst.

**Die Entscheidung, die ich nicht treffe:**

    Dauerregel drin    6.393 ms, die Auswahl aendert sich je Zeitraum
    Dauerregel raus    3.426 ms, der Auffaellig-Filter bleibt traege

`[read]` **Beides ist vertretbar, und beides ist gemessen.** **Mit
einer zaehlenden Funktion faellt die Wahl weg** — dann kostet es die
1.844 ms der Rechnung und nicht die Fracht obendrauf.

### 4 · Die Sabotagen — 7 von 7 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | die Seiten laufen wieder nacheinander | ja |
| 2 | die Zaehlung holt die Zeilen mit | ja |
| 3 | die Seitengroesse ueberschreitet den Deckel | ja |
| 4 | die Dauerregel bekommt keine Daten | ja |
| 5 | die Fensterfunktion laeuft im Tagesmodus | ja |
| 6 | der Reiter zeigt die Flags nicht | ja |
| 7 | der Zeitraum verschwindet aus der Anzeige | ja |

`[read]` **Sabotage 1 prueft die Wirkung, nicht das Wort:** verboten
ist ein `await` innerhalb einer Schleife in `ladeReihen` — **genau die
Bauform, die die Ursache war.**

### 5 · Gate und Testlage

`[cmd]` **Typecheck sauber, Build gruen.** `[cmd]` **304 von 304
Nutrition-Tests gruen**, davon 9 neue. `[cmd]` **Encoding sauber,
Exit 0.** `[cmd]` **Am Schirm: 0 Attrappen, kein Kartentitel
doppelt** — **keine zweite Ansicht**, die Flags stehen in derselben
Karte.

`[cmd]` **Ein Fehler beim ersten Typecheck war meiner:** `matchAll`
mit Spread braucht `downlevelIteration` — dieselbe Stelle wie in
G-253, umgeschrieben auf `match`.

**`pnpm gate` faellt an einer Stelle, die nicht von mir stammt:**
`[cmd]` `[index] docs/punkte/00-INDEX.md ist nicht auf dem Stand des
Frontmatters` — **die Abweichung kommt aus
`laufend_codex/nutrition-c-0347-...md`.** `[read]` **Der Index gehoert
dem Orchestrator**, ich habe kein Frontmatter angefasst und ihn
deshalb nicht geschrieben. **Alle uebrigen Gate-Schritte sind gruen**,
einschliesslich `[zwei-wahrheiten]` und `[serverimport]`.

**Bildschirmfoto:** `backup/g259-nachher-90.png`.

**Nichts auf `dev@lumeos.app` geschrieben — nur gelesen. Nicht
committet, nicht gestaget.**

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

### Die Ursache lag nicht auf meiner Kandidatenliste

`[read]` **Ich hatte fuenf Kandidaten aufgeschrieben. Keiner war es.**

`[cmd]` **Der Reiter ruft die teure Funktion gar nicht auf** — er
nutzt `nutrient_summary_window` mit 95 ms. `[cmd]` **Alle sieben
Aufrufe zusammen unter 400 ms, gegen 5.906 ms gemessen.**

`[cmd]` **`ladeReihen` holte dreizehn Seiten nacheinander, und jede
kostet dieselben ~238 ms, weil `OFFSET` alle 12.420 Zeilen neu
sortiert und die uebersprungenen wegwirft.** Dreizehn Seiten sind
3.093 ms, dieselben Daten in einem Durchgang 238 ms.

`[read]` **Und die Gegenprobe traegt ueber alle Fenster:** die
Seitenkosten sagen die Unterschiede auf ±283 ms voraus, der Rest ist
eine konstante Grundlast.

`[cmd]` **Behoben ohne Eingriff in die Referenzlogik: 5.906 →
3.426 ms.** `[read]` **Und nicht schnell-aber-falsch** — die
Sparklines tragen 7/30/90 Punkte, jede Zeile kommt an.

### G-259

`[cmd]` **`getNaehrstoffZeitraum` geloescht, 67 Zeilen.**
`[cmd]` **Nachgemessen: die zwei verbliebenen Treffer sind ein
Kommentar und ein Waechter, der die Rueckkehr verbietet.**

`[read]` **Und der Waechter geht weiter als der Auftrag:** er verbietet
`.limit()` ueber 1.000 in beiden Lesewegen — **die Falle selbst, nicht
nur ihren Traeger.**

### G-260 — die eigene Vorhersage widerlegt

`[read]` **Er erwartete, die Dauerregel koste rund nichts obendrauf.**
`[cmd]` **Sie kostet 2.971 ms** — 1.820 Funktion, 256
Nebenlaeufigkeit, **und ~895 ms fuer 8,3 MB `jsonb`, die entpackt und
dann auf zehn Flags reduziert werden.**

`[read]` **Diese 895 ms sind genau die zaehlende Funktion, die der
Auftrag als Codex' Bereich benennt.** **Nicht gebaut — als C-348
angelegt.**

`[cmd]` **Und ein einzelner Messlauf haette ihn fast fehlgeleitet:**
2.858 ms als Ausreisser gegen 1.844 ms Median. **Selbst gefunden,
bevor es in den Bericht ging.**

### Toms Entscheidung

**Flags an, 6.393 ms.** `[cmd]` **Der `Auffaellig`-Filter liefert bei
7/30/90 weiterhin dieselben zwoelf Codes, die Flags 10/12/10 mit
echten Tageszaehlungen.**

`[read]` **Ein Filter, der bei drei Zeitraeumen dasselbe liefert, ist
wirkungslos** — und die 895 ms sind ein bekannter, behebbarer Posten.

`[cmd]` **Sabotage 1 verbietet die Bauform, die den Befund
verursacht hat:** ein `await` in einer Schleife. `[cmd]` 7/7 fallen,
304/304 Tests, 0 Attrappen.

**Abgenommen.**

