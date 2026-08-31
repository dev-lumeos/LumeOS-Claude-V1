---
nr: G-281
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-214
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 707cba93
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/substanz-kategorien.ts
zahlen:
  gemessen: 2026-08-30
---

# G-281 — der Treffergrund in der Katalogsuche

## Befund

Aus G-214, Codex, 2026-08-30.

`[cmd]` **Pterostilbene trifft bei der Suche nach *Resveratrol*.**
`[cmd]` **Der Grund: `supplement_user_texts.kurz_was_en` sagt
*,,related to resveratrol"*.**

`[read]` **Der Treffer ist richtig. Die Auskunft fehlt.**

## Warum es an Claude Code geht

`[cmd]` **Die Suche liegt in
`apps/web/src/lib/supplements/substanz-kategorien.ts:trifftSuche()`**
— **kein RPC, kein JSON-Dokument, nur `boolean`.**

`[cmd]` **`food_search` kann den Treffer nicht liefern** — sie sucht
BLS-Lebensmittel und hat keine Verbindung zum `supplements`-Schema.

`[read]` **Codex hat es vermessen und nicht gebaut, weil `apps/`
seinem Auftrag entzogen war.** **Richtig — die Bereichsregel gilt.**

## Was zu bauen ist

**`trifftSuche()` gibt statt `boolean` den Treffergrund zurueck, und
die Kartenzeile zeigt ihn.**

`[cmd]` **Die Funktion prueft der Reihe nach `name`, `description`
und `zwecke`** — **welcher Zweig zugeschlagen hat, weiss sie bereits.**

`[read]` **Die Rangregeln bleiben unveraendert.** `[read]` **Und die
Beschriftung entscheidet, was der Nutzer versteht:** *,,in der
Beschreibung"* sagt mehr als *,,Treffer"*.

## Auftrag

**Beauftragt am 2026-08-30.**

`[cmd]` **Codex hat es in G-214 vermessen und nicht gebaut** — `apps/`
war seinem Auftrag entzogen. **Die Messung liegt vor, der Bau ist
klein.**

### Was zu tun ist

**`trifftSuche()` gibt den Treffergrund zurueck, die Kartenzeile
zeigt ihn.**

`[cmd]` **Die Funktion prueft `name`, `description`, `zwecke` der
Reihe nach** — **welcher Zweig zugeschlagen hat, weiss sie schon.**

`[read]` **Die Beschriftung entscheidet, was der Nutzer versteht:**
*,,in der Beschreibung"* sagt mehr als *,,Treffer"*.

### Was nicht zu tun ist

**Keine Rangregel aendern.**
**Keine zweite Suche bauen** — `food_search` hat mit diesem Katalog
nichts zu tun.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Pterostilbene bei Resveratrol   Grund sichtbar, Bildschirmfoto
    Reihenfolge                     unveraendert
    Treffer ohne Grund              gibt es welche? dann warum
    Attrappen                       am Schirm, vorher / nachher

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — **er laesst einen gesunden
Server stehen** (G-280, Gegenprobe: 18 Starts unveraendert).

`[read]` **`neustart` nur, wenn `start` nicht reicht** — **er beendet
den Server hart, und Tom arbeitet auf demselben Port.**

`[cmd]` **Codex fasst ihn nicht an** — die Regel steht seit
2026-08-30 in `CLAUDE.md`.

## Bericht

**Claude Code, 2026-08-31.** Mitbeauftragt: G-102, A-50, C-356.
Nichts auf `dev@lumeos.app` geschrieben, nichts committet, nichts
gestaged.

### 1 · G-281 — gebaut

`[cmd]` **Die Praemisse haelt, mit einer Praezisierung.** Der Text
steht in `supplement_user_texts.kurz_was_*` (Codex nannte
`kurz_was_en`; auf Deutsch steht dasselbe in `kurz_was_de`), und er
erreicht die Suche als `description` — `substanz-read.ts:418` nimmt
erst `kurz_was_de`, dann `_en`.

    Pterostilben ist ein dem Resveratrol verwandter Pflanzenstoff
    aus Blaubeeren, der im Koerper deutlich besser ankommt.

**`treffergrund()` gibt zurueck, was `trifftSuche()` ohnehin schon
wusste** — dieselbe Reihenfolge, dieselbe Rangregel:

    name → description → zwecke

`[read]` **`trifftSuche()` bleibt, ruft aber `treffergrund()`** —
sonst koennten Filter und Begruendung auseinanderlaufen. Ein Waechter
haelt beide gegeneinander.

`[read]` **Bei Namenstreffern steht nichts.** Wer *Magnesium* sucht
und Magnesium findet, braucht keine Auskunft; ein Hinweis an jeder
Zeile waere Rauschen.

### Nachweis

`[cmd]` **Am Schirm, `dev@lumeos.app`, 2026-08-31,
`/v2/supplements?tab=catalog`, Suche „Resveratrol":**

    Treffer                        2
    davon mit Grundangabe          1

    Pterostilbene    „in der Beschreibung"   (Lupensymbol)
    Resveratrol      —                        (Namenstreffer)

`backup/g281-soll.png`.

    Reihenfolge          unveraendert — durch zwei Sabotagen belegt:
                         Beschreibung vor Name und Zwecke vor
                         Beschreibung lassen beide die Kette fallen
    Treffer ohne Grund   ja, und zwar gewollt: Namenstreffer und die
                         leere Suche. Beide Faelle liefern '' aus
                         GRUND_TEXT, kein fehlender Wert
    Attrappen            Katalogreiter 0 vorher, 0 nachher

### 2 · G-102 — der Befund ist ueberholt, der Waechter hat keine Luecke

**Der Auftrag: miss, warum der Waechter die zwei nicht faengt.**
`[cmd]` **Er faengt sie nicht, weil es sie nicht gibt.**

`[cmd]` **Die zitierten Bruchstuecke stehen so nicht in der Datei.**
Der Befund zitiert:

    … C 89.50 823.53 109.24 767.88 A 0.37 …      (vier Zahlen)

`[cmd]` **Im Repo steht:**

    … C 89.50 823.53 107.08 773.44 109.24 767.88 A 0.37 …

`[read]` **Sechs Zahlen, korrekt** — dem Zitat fehlen `107.08
773.44` in der Mitte. **Beim zweiten Fall dasselbe:** `C 1039.50
206.91 1039.29 219.51 1039.32 221.19` ist vollstaendig, das Zitat
nennt nur die letzten zwei.

`[cmd]` **Gegengeprobt, weil ein Zitat kein Beleg ist:** die beiden
BETROFFENEN Pfade vollstaendig in einen Browser gelegt —

    Pfad 0 (8.694 Zeichen)   0 Konsolenfehler, Laenge 6.276, 630x1185
    Pfad 1 (9.214 Zeichen)   0 Konsolenfehler, Laenge 6.273, 630x1185

`[cmd]` **Und die Bruchstuecke einzeln, als Gegenprobe:** beide
erzeugen sehr wohl einen Konsolenfehler — **die Meldung im Befund war
echt, sie kam nur von einem falsch ausgeschnittenen Zitat.**

`[cmd]` **Am Schirm, `/v2/recovery`, angemeldet:**

    SVG-Konsolenfehler (path / attribute d)     0
    Muskelkarten                                2
    Pfade                                       90 + 70 = 160
    davon gezeichnet                            160
    davon leer                                  0

`backup/g102-karte.png` zeigt die Karte vollstaendig.

`[cmd]` **Der Waechter selbst misst nachweislich etwas:** `160 Pfade,
0 bemaengelt`, und mit `--selbsttest-kaputt` faellt genau der
eingebaute Fehler. `[read]` **Ohne diesen Schalter waere „0
bemaengelt" nicht von „prueft nichts" zu unterscheiden** — genau die
Frage, die G-102 an ihn gestellt hat. **Ein Waechter sichert ihn
jetzt.**

`[read]` **G-102 kann geschlossen werden** — nicht behoben, sondern
ueberholt.

### 3 · A-50 — gebaut, `tools/gefallene-spalten-pruefen.mjs`

`[read]` **Die Gegenrichtung zu `abwesenheit-pruefen.mjs`:** dort ist
etwas Fehlendes wieder da, hier war etwas da und ist weg.

`[cmd]` **Gemessen: 21 `DROP COLUMN` in der Pipeline** — davon **20
ohne spaetere Wiederkehr.**

**Zwei Unterscheidungen entscheiden, ob der Waechter benutzbar ist:**

`[cmd]` **1. Wiederkehr.** `im_katalog` wird in
`144_kimi_wave3_name_bridge.ts:91` geworfen **und zwei Zeilen weiter
neu angelegt** (als GENERATED-Spalte). **Sie steht live.** `[read]`
**Wer nur `DROP` zaehlt, meldet zwei saubere Lesewege als Fehler** —
und wird abgeschaltet. **Der Waechter liest die Ereignisse in
Reihenfolge, auch innerhalb einer Datei.**

`[cmd]` **2. Tests sind keine Lesepfade.** Der G-173-Waechter nennt
`acwr_used` viermal — jedes Mal, um zu pruefen, dass ein KOMMENTAR den
richtigen Punkt nennt. `[read]` **Ein Waechter, der einen Waechter
meldet, erzieht dazu, ihn abzuschalten.**

`[cmd]` **Gegengeprobt am historischen Fall:** `acwr_used` als
Lesefeld in `scores-read.ts` eingesetzt — **der Waechter meldet
genau die Stelle**, mit Verweis auf die Pipeline-Datei. Rueckbau
byte-gleich.

`[cmd]` **Heute sauber:** 20 gefallene Spalten, 372 Codedateien, kein
lebender Lesepfad darauf. **Im Gate seit heute.**

### 4 · C-356 — die Aufteilung ist gemessen, und sie ist eindeutig

`[cmd]` **Gemessen, `dev@lumeos.app`, warm, drei Laeufe, 2026-08-31:**

    Fenster  HTML    TTFB (Server)  Download  DOM-fertig
      1      164 kB      410 ms        11 ms      17 ms
      7      216 kB      872 ms        15 ms      23 ms
     30      351 kB    1.585 ms        18 ms      16 ms
     90      699 kB    4.183 ms        28 ms     100 ms

    Zuwachs 1 -> 90:  Server +3.773 ms · Download +17 ms · DOM +83 ms

**Die Aufteilung ist kein 50/50 — sie ist praktisch ganz Server.**

`[cmd]` **Die Uebertragung faellt nicht ins Gewicht, weil komprimiert
wird:** 699 kB dekodiert gegen **120 kB uebertragen**. Der Download
bleibt in allen drei Laeufen unter 30 ms.

`[cmd]` **Stabil ueber drei Laeufe:** TTFB bei 90 Tagen 4.183 /
4.416 / 4.130 ms.

`[read]` **Damit ist meine eigene C-353-Schaetzung berichtigt.** Dort
stand *„~1.620 ms HTML-Aufbau und -Uebertragung, rund 3,0 ms je kB"*.
`[cmd]` **Der Anteil ist groesser und liegt anders:** das Rendern
selbst kostet die Zeit, die Bytes kosten fast nichts. **Die Zahl war
aus einer Differenz gerechnet, nicht aus der Zerlegung** — und eine
Differenz sagt nicht, worin sie besteht.

### Waechter und Sabotageprobe

**Neu:** `tools/gefallene-spalten-pruefen.mjs` (Gate) und
`apps/web/src/lib/supplements/__tests__/treffergrund.test.ts`
(9 Waechter).

**Zehn Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256):**

    faellt (Testkette)
      G-281  Beschreibung vor Name pruefen
      G-281  Zwecke vor Beschreibung pruefen
      G-281  trifftSuche rechnet wieder selbst
      G-281  derselbe Text fuer beide Gruende
      G-281  bei Namenstreffern doch etwas anzeigen
      G-281  die Zeile zeigt den Grund nicht mehr
      A-50   den Waechter aus dem Gate nehmen
      G-102  den SVG-Selbsttest entfernen

    faellt (Gate, nicht Testkette) — beide gegengeprobt
      A-50   ADD COLUMN ignorieren   -> Gate meldet 2 Fehlalarme
                                        auf `im_katalog`
      A-50   Tests wieder mitzaehlen -> Gate meldet 1 Fehlalarm
                                        auf den G-173-Waechter

`[read]` **Die zwei letzten brechen das WERKZEUG, und dessen Schutz
liegt im Gate, nicht in der Testkette.** `[cmd]` **Beide wurden
einzeln gegen den Gate-Lauf geprobt und faerben ihn rot** — sie sind
gedeckt, nur eine Schicht weiter aussen. **Das steht hier, statt sie
als „gefallen" zu zaehlen.**

`[cmd]` **Drei eigene Fehler, von der Probe gefangen:**

**a) Ein Waechter, der zwei Vorkommen fuer eines hielt.** Der
Ausdruck `GRUND_TEXT[treffer.gruende.get(s.id) ?? 'alle']` steht
**zweimal** — als Bedingung und im Rumpf. Die Sabotage ersetzte nur
die Bedingung durch `false &&`, der Rumpf blieb, **und `assert.match`
blieb gruen.** Behoben: **gezaehlt statt gesucht** (dieselbe Lehre wie
G-274).

**b) Ein Test, der `node` als Kindprozess startete.** Unter
`tsx --test` faellt der Aufruf sofort aus — `duration_ms: 1.4`, leeres
stderr. `[read]` **Ein Test, der aus dem falschen Grund rot wird, ist
schlimmer als keiner.** Behoben: die REGEL selbst im Test nachbilden
und gegen die echten Dateien laufen lassen, mit beiden Gegenproben
(`acwr_used` muss gefallen sein, `im_katalog` darf es nicht).

**c) Der A-36-Waechter von gestern fand sich selbst.** Er sucht
`module-stubs` in `apps/` — und diese Testdatei nennt den Namen.
**G-186 wieder.** Behoben: Tests ausgenommen.

### Laeufe

    pnpm --filter @lumeos/web test    1072 pass, 0 fail (vorher 1063)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [gefallene-spalten]                20 Spalten, kein Lesepfad
    [abwesenheit]                      10 Marken, alle gelten noch
    [encoding]                         20.552 Dateien sauber

### Dateien

    tools/gefallene-spalten-pruefen.mjs                     neu
    apps/web/src/lib/supplements/__tests__/
      treffergrund.test.ts                                  neu
    apps/web/src/lib/supplements/substanz-kategorien.ts   G-281
    apps/web/src/app/v2/supplements/substanz-detail.tsx   G-281
    apps/web/src/lib/nutrition/__tests__/
      score-lage.test.ts                        A-36-Waechter
    package.json                                  Gate-Kette
    backup/g281-soll.png, backup/g102-karte.png     Nachweis

## Abnahme

**2026-08-30, Orchestrator.**

`[cmd]` **`treffergrund()` liefert, was `trifftSuche()` ohnehin
wusste, und `trifftSuche()` ruft es jetzt** — **Filter und
Begruendung koennen nicht auseinandergehen.**

`[read]` **Das ist die bessere Loesung als die im Auftrag
beschriebene:** ich hatte *,,gibt statt `boolean` den Grund zurueck"*
verlangt — **er hat die Begruendung zur Quelle gemacht und den Filter
davon abgeleitet.**

`[cmd]` **Am Schirm: *Resveratrol* liefert 2 Treffer, einer mit
Grund.** Pterostilbene zeigt *,,in der Beschreibung"*, Resveratrol
selbst nichts — **ein Namenstreffer braucht keine Erklaerung.**

`[cmd]` **Zwei Sabotagen kippen die Rangfolge, beide fallen.**

### G-102 — ueberholt, und der Punkt zitierte falsch

`[cmd]` **Der Punkt zitiert `C 89.50 823.53 109.24 767.88` — vier
Zahlen.** `[cmd]` **Die Datei traegt sechs:
`C 89.50 823.53 107.08 773.44 109.24 767.88`.**

`[read]` **Das Zitat hat die mittleren zwei weggelassen** — **und
genau daraus entstand der Befund *,,abgeschnitten"*.**

`[cmd]` **Beide Pfade im Browser geprueft: 0 Konsolenfehler, echte
Laenge und Bounding-Box.** `[cmd]` **Die Seite: 160 Pfade, 160
zeichnen, 0 leer.**

`[read]` **Und der Waechter hat keine Luecke** — `--selbsttest-kaputt`
faengt einen eingebauten Bruch, **und ein neuer Waechter schuetzt
diesen Schalter.**

### A-50 — gebaut, mit zwei Unterscheidungen, die ihn brauchbar machen

`[cmd]` **`tools/gefallene-spalten-pruefen.mjs`, im Gate. 21
`DROP COLUMN`, 20 ohne Rueckkehr.**

`[read]` **Erste Unterscheidung:** `im_katalog` wird geworfen **und
zwei Zeilen spaeter neu angelegt.** `[read]` **Wer nur `DROP` zaehlt,
meldet zwei saubere Lesewege als Fehler.**

`[read]` **Zweite:** Tests sind keine Lesewege. `[cmd]` **Der
G-173-Waechter nennt `acwr_used` nur innerhalb einer regulaeren
Ausdrucksklammer.**

`[cmd]` **Gegen den historischen Fall geprueft:** `acwr_used` in
`scores-read.ts` wieder eingesetzt — **der Waechter meldet genau
diese Zeile.**

### C-356 — und er berichtigt meine Zahl

`[cmd]` **Die Aufteilung ist nicht halbe-halbe, sondern fast alles
Server:** **TTFB waechst von 410 auf 4.183 ms, der Download von 11 auf
28 ms** — **699 kB komprimieren auf 120.**

`[read]` **Meine C-353-Schaetzung *,,rund 1.620 ms HTML-Bau und
Uebertragung bei etwa 3 ms je kB"* war aus einer Differenz
gerechnet** — `[read]` **und eine Differenz sagt nicht, woraus sie
besteht.**

`[read]` **Sie war in Groesse und Ort falsch.** **Wer die Ladezeit
angeht, muss den Renderpfad angehen, nicht die Nutzlast.**

### Und eine ehrliche Sabotagemeldung

`[cmd]` **8 von 10 fallen in der Testsuite, zwei brechen das
Waechterwerkzeug selbst** — **deren Schutz liegt im Gate.** `[cmd]`
**Beide einzeln geprueft, beide machen den Gate rot.**

`[read]` **Er meldet die Aufteilung, statt sie als zehn gefallene zu
zaehlen.**

`[cmd]` **Drei eigene Fehler gefangen:** ein Waechter, der zwei
Vorkommen als eines behandelte; ein Test, der in 1,4 ms aus dem
falschen Grund scheiterte; **und der gestrige A-36-Waechter, der
seinen eigenen Dateinamen fand.**

`[cmd]` 1072 Tests, Gate 11/11.

**Abgenommen.**

