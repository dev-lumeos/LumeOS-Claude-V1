---
nr: A-29
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: A-28
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 851fa077
beruehrt:
  dateien:
    - apps/web/src/lib/__tests__/attrappen-zaehlweise.test.ts
zahlen:
  gemessen: 2026-08-20
  sichtbare_marken: 6
  v2_attrappe_klassen: 10
---

# A-29 - Der Attrappen-Test koennte die gerenderte Seite zaehlen

## Befund

(neu 2026-08-20, aus A-28).

  `[cmd]` **Der Test liest Quelltext** (`v2-attrappen.test.ts` zaehlt
  `attrappe={ATTRAPPE}` je Datei). **A-24 haelt fest, dass Textmarken
  kein Mass sind** — und `tools/schuss.mjs` misst die gerenderte Seite
  in einem Aufruf.

  `[cmd]` **Die zwei Zaehlweisen gehen auseinander**, gemessen am
  2026-08-20 auf `/v2/nutrition?tab=plans`: **6 sichtbare Marken gegen
  10 `v2-attrappe`-Klassen** im HTML, weil die Klasse auch an
  Unterelementen haengt.

  `[read]` **Beide Zahlen sind richtig, sie messen Verschiedenes.**
  Wer umstellt, entscheidet damit auch, **welche der beiden die
  verbindliche ist** — und muss die Erwartungen aller Module neu setzen.

  `[cmd]` **Der Test braucht dann einen laufenden Dev-Server.** Heute
  laeuft er ohne. Das ist der eigentliche Preis, nicht der Umbau.

## Auftrag — den Attrappen-Test schaerfen

**Mitbeauftragt: A-60, G-173.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · A-29 — der Test koennte die gerenderte Seite lesen

`[cmd]` **A-59 ist gemessen: 89 Marken im Quelltext, 24 am Schirm.**
`[read]` **Der Quelltext ueberschaetzt dreifach**, weil
`daten ? <Echt /> : <Attrappe />` beide Zweige enthaelt.

`[cmd]` **Du zaehlst deshalb seit Wochen am Schirm** — mit
`tools/schuss.mjs`, in jedem Bericht.

`[read]` **Die Frage ist, ob der Test das auch kann.** `[cmd]`
**`schuss.mjs` meldet `attrappen` und `konsolenfehler` als JSON** —
**die Zahl liegt also schon vor, sie steht nur in keinem Waechter.**

`[read]` **Und der Grund dagegen ist ernst zu nehmen:** ein Test, der
einen Server braucht, laeuft nicht im Gate. **Miss, was moeglich ist,
bevor du baust.**

### 2 · A-60 — eine `Map` ueber die Client-Grenze

`[cmd]` **Sie kommt leer an, ohne Fehler.** `[read]` **Das ist die
gefaehrlichste Klasse: kein Absturz, keine Meldung, nur nichts.**

`[read]` **Miss, wo im Baum das heute vorkommt** — **und ob ein
Waechter es fangen kann.** `[cmd]` **Der Serverimport-Waechter prueft
bereits Client-Chunks** — vielleicht liegt die Naht dort.

### 3 · G-173 — ein falscher Punktverweis in `scores-read.ts`

`[read]` **Klein.** `[cmd]` **Miss, ob er noch falsch ist** — die
Datei ist seit C-143 mehrfach angefasst worden.

### Was nicht zu tun ist

**Keinen Test bauen, der einen laufenden Server braucht**, ohne zu
sagen wie er im Gate laufen soll.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Attrappen am Schirm     kann ein Test sie zaehlen? gemessen
    Gate-tauglich           belegt oder als unmoeglich gemeldet
    Map-Faelle              Zahl, je Fundstelle
    Waechter dafuer         gebaut oder begruendet nicht
    G-173                   noch falsch? behoben oder ueberholt

`[read]` **Die zweite Zeile entscheidet A-29:** **ein Test, der nicht
im Gate laeuft, ist eine Zusage ohne Deckung.**

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt: A-60, G-173. Nichts auf
`dev@lumeos.app` geschrieben, nichts committet, nichts gestaged.

### 1 · A-29 — die Antwort ist Nein, und zwar aus zwei Gruenden

**Der Auftrag entscheidet es selbst:** *„ein Test, der nicht im Gate
laeuft, ist eine Zusage ohne Deckung."*

#### Grund 1: der Gate hat nichts, was so ein Test braucht

`[cmd]` **Alle 20 Gate-Schritte sind reine Dateipruefungen.** Keiner
startet einen Server, keiner spricht mit der Datenbank.

`[cmd]` **`tools/schuss.mjs` braucht vier Dinge:** laufender
Dev-Server auf 3200, Datenbank mit Seed-Daten, Anmeldung
(`tools/konten.mjs`), Chromium.

`[cmd]` **Gemessen am 2026-08-30, drei Routen, angemeldet:**

    /v2/nutrition?tab=diary   11,8 s
    /v2/supplements            9,0 s
    /v2/coach                 14,2 s
    Mittel                    11,7 s je Schuss

    12 v2-Seiten              2,3 min
    mit rund 40 Reitern       7,8 min

`[read]` **Der uebrige Gate liegt bei etwa einer Minute.** Ein
Schirmlauf waere also das Acht- bis Zehnfache des Ganzen.

`[cmd]` **Und der Server traegt es nicht** — mein eigener Befund von
heute, hier noch einmal eingetreten: **zwei Messversuche endeten an
`ERR_CONNECTION_REFUSED`**, weil der Server nach den langen
Testlaeufen weg war. Erst nach `server.py start` und einer Wartezeit
kamen die Zahlen oben zustande.

`[read]` **Ein Gate-Schritt, der daran haengt, ist rot, wenn nichts
kaputt ist.** Das ist schlimmer als kein Schritt: **er erzieht dazu,
Rot zu ignorieren.**

#### Grund 2: es gibt keine EINE richtige Quelltextzahl

`[cmd]` **Der Beleg, gemessen am 2026-08-30:**
`app/v2/supplements/tabs.tsx` traegt **17 Marken im Quelltext**. Am
Schirm sind es:

    ?tab=today    1
    ?tab=intel    7
    ?tab=spec     1

`[read]` **Die Ueberschaetzung ist damit nicht herausrechenbar.** Sie
kommt **nicht nur** aus `daten ? <Echt/> : <Attrappe/>`, sondern
daraus, **dass eine Datei mehrere Reiter traegt und immer nur einer
rendert.** Eine Quelltextzahl kann nicht wissen, welcher.

`[cmd]` **Ich habe es trotzdem versucht:** eine Heuristik, die Marken
in einem Zweig von unbedingten trennt, ergab **61 von 234 bedingt**.
`[read]` **Das rechnet 234 nicht auf 24 herunter** — die Zahl bliebe
um das Siebenfache zu hoch. **Der Ansatz traegt nicht.**

`[cmd]` **Der aktuelle Bestand:** 234 Marken in v2, ueber **fuenf**
Konstantennamen:

    212  ATTRAPPE
     17  RUECKFALL
      5  GRUND_FLOW / GRUND_AKTIVITAET / GRUND_READINESS /
         GRUND_BATTERY / GRUND_TONIGHT

#### Und ein Nebenbefund zur Zaehlweise selbst

`[cmd]` **Dieselbe Route, fuenfmal: `attrappen=2`, jedes Mal.** Die
Zahl ist stabil, nicht zufaellig.

`[cmd]` **Aber sie ist nicht dieselbe wie meine in den Berichten.**
Auf `/v2/nutrition?tab=diary`:

    schuss.mjs  `text=/Attrappe/i`        2
    meine       Blattelement == "Attrappe" 1

`[cmd]` **Der Unterschied ist benennbar:** eine Pille
(`span.v2-pill-warn`) **plus ein Fliesstext** im Buddy-Kasten
(*„Buddy ist in G-02 eine Attrappe…"*).

`[read]` **Beide Zahlen sind richtig, sie messen Verschiedenes** —
genau das, was A-29 im Befund fuer die CSS-Klasse festgehalten hat
(6 gegen 10). **Wer sie vergleicht, ohne die Zaehlweise zu nennen,
meldet einen Widerspruch, den es nicht gibt.**

#### Was gebaut wurde: die Zaehlweise sichern, nicht die Zahl

`apps/web/src/lib/__tests__/attrappen-zaehlweise.test.ts` — drei
Waechter, alle ohne Server:

    schuss.mjs meldet `attrappen` und `konsolenfehler` weiter
      -> faellt die Zahl aus der Ausgabe, verliert jeder Bericht
         seinen Nachweis
    die Zaehlweise bleibt `text=/Attrappe/i`
      -> ein Wechsel auf die CSS-Klasse macht alle frueheren
         Berichtszahlen unvergleichbar
    kein Gate-Schritt ruft schuss.mjs, server.py oder playwright
      -> kaeme einer dazu, waere die Begruendung oben hinfaellig
         und A-29 neu zu entscheiden
    der Attrappen-Waechter bleibt bei „keine ohne", nicht
      „so viele wie erwartet"

`[read]` **Damit bleibt es bei der Arbeitsteilung, die heute gilt:**
die Quelltextzahl ist eine **Obergrenze** und sichert *„jede Karte
traegt eine Marke"*; die Schirmzahl ist eine **Messung je Bericht**
und gehoert in den Nachweis eines Auftrags. **Beides ist richtig,
keines ersetzt das andere.**

### 2 · A-60 — der Fall existiert heute nicht, der Waechter schon

`[cmd]` **Gemessen ueber 435 Dateien, davon 123 mit `'use client'`:**

    Map/Set-liefernde Exporte           4
      lib/medical/lesen.ts              ladeMarkerStamm
      lib/nutrition/generated/
        such-wortschatz.ts              SUCH_WORTSCHATZ
      lib/supplements/substanz-anzeige  startOffen
      lib/training/sitzungen-read.ts    ladeMuskelWurzeln
    davon in einer Client-Datei         0
    Map/Set als Prop-Typ                0
    unannotierte `return new Map`       0

`[read]` **Der Fall ist heute nirgends gebaut.** `[cmd]` Die Datei
aus dem Befund macht es richtig:
`naehrstoff-ordnung-tab.tsx:94` baut ein `Set` **im Client** aus
einem Array — genau die Behebung aus G-246.

#### Warum trotzdem ein Waechter — gemessen, nicht vermutet

`[cmd]` **Der Typecheck faengt es NICHT.** Probe am 2026-08-30 unter
`app/_a60probe/`: eine `'use client'`-Komponente mit
`karte: Map<string, string>`, aus einer Serverkomponente mit
`new Map(...)` aufgerufen — **`tsc --noEmit` meldete nichts.** Die
Probe ist wieder entfernt.

`[cmd]` **Und der `serverimport`-Waechter kann es nicht.** Er liest
das gebaute Buendel und sucht Marken wie `createServerClient`. **Eine
Map-Prop hinterlaesst dort keine Zeichenkette** — sie ist ein
Laufzeitverhalten. **Die Naht liegt im Quelltext, nicht im Buendel;
die Vermutung im Punkt traegt nicht.**

`apps/web/src/lib/__tests__/client-grenze.test.ts` prueft die
**Prop-Signatur** exportierter Komponenten in `'use client'`-Dateien
— nicht das Vorkommen von `Map`.

`[read]` **Die Unterscheidung ist der ganze Punkt:** eine Map **im
Rumpf** einer Client-Datei ist richtig, eine Map **in der
Prop-Signatur** ist der Fehler.

`[cmd]` **Mit Gegenprobe, weil der Waechter heute eine Abwesenheit
sichert (A-62):** eine erfundene Map-Prop wird erkannt, ein
`Array<[string, number]>` **nicht**, und ein `new Set(...)` im Rumpf
**nicht**. **Ohne diese Gegenprobe waere er gruen, auch wenn die
Erkennung kaputt ist.**

### 3 · G-173 — der Verweis war noch falsch

`[cmd]` **`scores-read.ts:42` sagte weiterhin *„C-195 hat die Spalte
entfernt"*.** Die Datei ist seit C-143 mehrfach angefasst worden, die
Zeile blieb.

`[cmd]` **Beleg fuer C-215:**
`supabase/_pipeline/12_recovery/121_recovery_scores_modalities.sql:142-144`
— **dasselbe `ALTER TABLE`** setzt `algorithm_version` auf
`manual_v2_c215` **und** wirft `acwr_used` weg. `[cmd]` C-195 ist der
Substanzkatalog; C-215 heisst *„ACWR rechnet in der Datenbank
weiter"*.

**Berichtigt, mit dem alten Wortlaut als Zitat und dem Beleg.**

`[cmd]` **Und die Sabotageprobe hat etwas gezeigt, das ich sonst
uebersehen haette:** die Berichtigung **ueberlebte** eine
Ruecksetzung auf C-195 — **ein Kommentar hat keinen Waechter und
kippt still zurueck.** Deshalb ein Waechter dafuer; im zweiten Lauf
faellt sie.

### Nachweis

    Attrappen am Schirm    Ein Test KANN sie zaehlen (schuss.mjs
                           liefert sie, stabil: 5 Laeufe, jedes Mal 2).
                           Er DARF es nicht im Gate — s. u.
    Gate-tauglich          NEIN, als unmoeglich gemeldet:
                           - 20/20 Gate-Schritte sind Dateipruefungen
                           - 11,7 s je Schuss, 7,8 min fuer alle
                             Reiter gegen ~1 min Gesamt-Gate
                           - der Server stirbt (heute zweimal)
                           - und keine Quelltextzahl kann stimmen:
                             tabs.tsx 17 im Text, 1/7/1 am Schirm
    Map-Faelle             0 gebaut; 4 Map-liefernde Exporte, keiner
                           in einer Client-Datei; 0 Prop-Typen
    Waechter dafuer        gebaut (Prop-Signatur, mit Gegenprobe),
                           weil Typecheck und serverimport-Waechter
                           es beide nicht sehen — beides gemessen
    G-173                  noch falsch gewesen, behoben, bewacht

### Waechter und Sabotageprobe

**Neu:** `client-grenze.test.ts` (2 Waechter),
`attrappen-zaehlweise.test.ts` (4 Waechter, inkl. G-173).

**Sieben Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256) —
alle sieben fallen:**

    A-29  schuss.mjs meldet die Attrappenzahl nicht mehr
    A-29  die Zaehlweise auf die CSS-Klasse umstellen
    A-29  einen Server in den Gate haengen
    A-29  den Attrappen-Waechter auf Sichtbarkeit umbauen
    A-60  eine Map als Prop einer Client-Komponente
    A-60  ein Set als Prop einer Client-Komponente
    G-173 den falschen Verweis wieder einsetzen

`[cmd]` **Zwei eigene Fehler, von der Kette gefangen:**

**a) Ein Waechter, der die Haelfte misst.** Die erste Fassung suchte
`attrappe={ATTRAPPE}` und fand in `supplements/tabs.tsx` **0** — die
Konstante heisst dort `RUECKFALL`. **Ein Waechter, der den einen
Namen kennt und den anderen nicht, zaehlt falsch.** Behoben: auf die
Requisite pruefen, nicht auf den Namen.

**b) Ein Test, der nichts misst.** Die erste Fassung von
`client-grenze.test.ts` hatte einen dritten Test mit `assert.ok(true)`
und der Begruendung im Kommentar darueber. **Das ist die Sorte
Waechter, die das Wort statt der Wirkung prueft** — entfernt, die
Messung steht als Kommentar.

### Laeufe

    pnpm --filter @lumeos/web test    1056 pass, 0 fail (vorher 1051)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [abwesenheit]                      10 Marken, alle gelten noch
    [encoding]                         20.543 Dateien sauber

### Dateien

    apps/web/src/lib/__tests__/client-grenze.test.ts        neu
    apps/web/src/lib/__tests__/
      attrappen-zaehlweise.test.ts                          neu
    apps/web/src/lib/recovery/scores-read.ts        G-173 berichtigt

## Abnahme

**2026-08-30, Orchestrator.**

### Die Antwort ist Nein, und der zweite Grund ist der staerkere

`[cmd]` **Grund 1: alle 20 Gate-Schritte sind reine Dateipruefungen.**
`[cmd]` **`schuss.mjs` braucht vier Dinge: Server, Datenbank,
Anmeldung, Chromium.** `[cmd]` **11,7 s je Schuss, 7,8 Minuten fuer
alle Reiter — gegen etwa eine Minute fuer den ganzen uebrigen Gate.**

`[read]` **Und er zitiert meinen eigenen Auftragssatz gegen den
Auftrag:** *,,ein Test, der nicht im Gate laeuft, ist eine Zusage ohne
Deckung"* — **also gehoert er nicht hinein.**

`[read]` **Sein Zusatz ist der wichtige:** *,,ein Gate-Schritt, der rot
ist, wenn nichts kaputt ist, erzieht dazu, Rot zu ignorieren."*

### Grund 2 widerlegt die Voraussetzung des Punktes

`[cmd]` **`app/v2/supplements/tabs.tsx` traegt 17 Marken im
Quelltext.** `[cmd]` **Am Schirm sind es 1 / 7 / 1 — je nach offenem
Reiter.**

`[read]` **Die Ueberschaetzung kommt nicht nur aus
`daten ? <Echt/> : <Attrappe/>`** — **sondern daraus, dass eine Datei
mehrere Reiter traegt und immer nur einer rendert.** **Eine
Quelltextzahl kann nicht wissen, welcher.**

`[cmd]` **Er hat die Korrektur trotzdem versucht: 61 von 234 bedingt** —
**das rechnet 234 nicht auf 24 herunter.** `[read]` **Der Ansatz
traegt nicht, und er sagt es statt eine Heuristik zu liefern, die
knapp danebenliegt.**

### Ein Nebenbefund, der A-29s eigenen Punkt beweist

`[cmd]` **`schuss.mjs` meldet 2 fuer das Tagebuch, er hatte 1
berichtet.** `[cmd]` **Beide richtig: eine Pille plus eine Erwaehnung
im Fliesstext der Buddy-Box. Ueber fuenf Laeufe stabil.**

`[read]` **Deshalb hat er die Zaehlweise gesichert, nicht die Zahl.**

### A-60 — der Fall existiert nicht, der Waechter schon

`[cmd]` **0 von 123 Client-Dateien nehmen eine `Map`/`Set` als Prop.**
`[cmd]` **Die Datei aus dem Befund macht es richtig** — sie baut das
`Set` im Client, die Behebung aus G-246.

`[read]` **Zwei Messungen rechtfertigen den Bau trotzdem:** `[cmd]`
**der Typecheck faengt es nicht** — Probe unter `app/_a60probe/`,
`tsc --noEmit` schwieg, Probe entfernt. `[cmd]` **Und der
Serverimport-Waechter kann es nicht** — er liest das gebaute Buendel
nach Zeichenketten, **eine Map-Prop hinterlaesst dort keine.**

`[read]` **Die im Punkt vermutete Naht traegt nicht** — **meine
Vermutung im Auftrag war falsch, die Stelle ist der Quelltext.**

`[cmd]` **Der Waechter prueft die Prop-Signatur, nicht das Vorkommen
von `Map`** — eine Map im Rumpf ist richtig, eine in der Signatur ist
der Fehler.

### G-173 — und was die Sabotageprobe zutage brachte

`[cmd]` **Der Verweis war noch falsch:** *,,C-195 hat die Spalte
entfernt"*, tatsaechlich C-215. `[cmd]` **Beleg: dasselbe
`ALTER TABLE` setzt `manual_v2_c215` und wirft `acwr_used` weg.**

`[read]` **Und der eigentliche Fund:** `[cmd]` **die Berichtigung
ueberlebte eine Ruecksetzung** — **ein Kommentar hat keinen Waechter
und kippt still zurueck.** `[read]` **Nicht die Behebung beweist, dass
eine Korrektur haelt, sondern die Sabotageprobe.**

### Zwei eigene Fehler, von der Kette gefangen

`[cmd]` **Ein Waechter fand 0 Marken, weil die Konstante `RUECKFALL`
heisst und nicht `ATTRAPPE`.** `[cmd]` **Und ein Test behauptete
`assert.ok(true)` mit der Begruendung im Kommentar darueber** —
**er mass nichts.**

`[cmd]` 1056 Tests, 7 Sabotagen, Gate 11/11.

**Abgenommen.** Der Schirmlauf ausserhalb des Gates geht als **A-64**.

