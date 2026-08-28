---
nr: G-218
typ: messung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-331
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/regeln-read.ts
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen: null
---

# G-218 — kommt die `critical`-Warnung auf den Bildschirm?

## Befund

`[cmd]` **Aus C-331, 2026-08-28:** `wr_drug_serotonergic_combo`
liefert live `fulfilled`, `critical`, `physician_referral` — **zum
ersten Mal, seit es die Regel gibt.**

`[cmd]` **Geprueft sind drei Stationen** — Erfassung ueber
`user_medications`, `rule_assessment`, Rueckgabe. `[read]`
**Leseweg und Anzeige nicht** — `apps/` gehoerte nicht zu C-331, und
Codex hat die Grenze benannt statt sie zu ueberschreiten.

`[read]` **Berichtigung:** ich hatte mehrfach *,,die einzige
`critical`-Regel im Bestand"* geschrieben. `[cmd]` **Der Katalog
fuehrt 10 `critical`-Regeln** — die eine war die unter den fuenf mit
`count_risk_flag_gte`. **Wieder ein Ausschnitt fuer das Ganze
gehalten.**

`[read]` **Der Durchstich aus G-215 lief ueber `wr_anticoag_stack`**
— eine Regel mit `severity: high`, die `drug_class` liest.
**`critical` ist noch nie auf einem Bildschirm erschienen.**

## Was zu pruefen ist

**Dieselbe Lage wie in C-331 herstellen, ueber die Oberflaeche**, und
die zwei fehlenden Stationen nachmessen.

`[read]` **Und die Frage, die dabei zum ersten Mal auftaucht:
unterscheidet die Anzeige `critical` von `high`?** `[cmd]` Bis heute
gab es keine `critical`-Meldung — **die Unterscheidung ist nie
sichtbar geworden, also auch nie geprueft.**

`[read]` **`physician_referral` ist der andere Teil.** Eine Regel, die
zum Arzt schickt, muss anders aussehen als eine, die ein
Einnahmefenster verschiebt. **Wenn beide gleich aussehen, ist die
Schwere im Datenbestand und nicht auf dem Bildschirm.**

## Gegenprobe

**Die ausloesende Erfassung entfernen — die Warnung muss
verschwinden.** `[cmd]` In G-215 hat das getragen (4 → 0 aktive
Medikamente, `fulfilled` → `not_fulfilled`). **Fuer `critical` ist es
nicht geprueft.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

### 1 · Die zwei fehlenden Stationen

**Dieselbe Lage wie in C-331 herstellen, ueber die Oberflaeche**, und
Leseweg und Anzeige nachmessen.

`[cmd]` **Drei Stationen sind belegt** — Erfassung ueber
`user_medications`, `rule_assessment`, Rueckgabe. **Zwei nicht.**

**Gegenprobe:** die ausloesende Erfassung entfernen, **die Warnung
muss verschwinden.** `[cmd]` In G-215 hat das getragen; **fuer
`critical` ist es nicht geprueft.**

### 2 · Die feinstufige Bewertung

**Entscheidung Tom, 2026-08-28:** *,,ja klar stellen wir critical dar,
wir brauchen eine feinstufige bewertung"*.

`[cmd]` **Der Katalog fuehrt zwei Achsen, und beide sind heute
unsichtbar:**

    severity                  low · medium · high · critical
    recommended_action_type   physician_referral · information ·
                              lab_context · warning ·
                              schedule_adjustment ·
                              general_information · verify_prescription

`[read]` **Die zweite Achse ist die wichtigere und wird meist
vergessen.** Eine Regel, die zum Arzt schickt, muss anders aussehen
als eine, die ein Einnahmefenster verschiebt — **auch wenn beide
`high` sind.**

`[read]` **Miss zuerst, wie die beiden Achsen zusammenhaengen.**
Wenn jede `critical` ohnehin `physician_referral` traegt, ist eine
Achse redundant; **wenn sie sich kreuzen, braucht die Anzeige beide.**

`[read]` **Und die Zahl je Stufe entscheidet die Gestaltung:** vier
Stufen mit je zwei Regeln sind etwas anderes als vier Stufen, von
denen eine die Haelfte traegt.

### Was nicht zu tun ist

**Keine Regel aendern, keine `severity` anpassen.** `[read]` **Die
Anzeige folgt dem Bestand, nicht umgekehrt.**
**Keine Warnung erfinden, wo keine Regel feuert.**
**Keine Tabelle anlegen** — Codex arbeitet an C-149.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Lage ueber die Oberflaeche    hergestellt
    Leseweg                       kommt es an
    Anzeige                       erscheint es
    critical gegen high           unterscheidbar - Bildschirmfoto
    Handlungsart sichtbar         Zahl der dargestellten Arten
    Verteilung je Achse           gemessen
    Gegenprobe                    Warnung verschwindet
    Rueckbau                      gezaehlt, `dev` unberuehrt

`[read]` **Die vierte Zeile ist der Kern.** Bis heute gab es keine
`critical`-Meldung auf einem Bildschirm — **die Unterscheidung ist nie
sichtbar geworden, also auch nie geprueft.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Ja, sie kommt an** — alle fuenf Stationen tragen. **Und die
Praemisse zu Teil 2 stimmte nicht:** beide Achsen waren bereits
sichtbar, nur nicht unterscheidbar. Der Unterschied entscheidet, was
zu bauen war.

### 1 · Die zwei fehlenden Stationen

`[cmd]` **Lage ueber die Oberflaeche hergestellt:** Sertraline und
Tramadol ueber das Formular aus G-211 eingetragen
(`/v2/medical?tab=tracking` → Medications → „Medikament eintragen").
Kein `INSERT`.

    Station 1  Erfassung          Sertraline true, Tramadol true
    Station 2  rule_assessment    fulfilled / critical / physician_referral
    Station 3  Rueckgabe          message_de vollstaendig
    Station 4  Leseweg            regeln-read.ts:113-114 reicht
                                  severity UND aktion durch
    Station 5  Anzeige            „critical" auf dem Schirm, Text
                                  „Serotonin-Syndrom-Risiko",
                                  „ärztlich abklären"

`[read]` **Stationen 1 bis 3 sind Codex' C-331-Befund, unabhaengig
nachgemessen** — nicht uebernommen. **4 und 5 waren offen und tragen.**

`[cmd]` **Der Leseweg filtert nichts:** `regeln-read.ts:104-119`
reicht jeden Zustand durch, `:113` `severity`, `:114`
`recommended_action_type`. **Beide Felder waren schon da.**

### Berichtigung zur Auftragspraemisse

**Der Auftrag sagt: *„Der Katalog fuehrt zwei Achsen, und beide sind
heute unsichtbar."*** `[cmd]` **Das stimmt nicht.**

`[cmd]` **Gemessen am 2026-08-28 auf dem ersten `critical`-Bild
ueberhaupt** — die Karte trug bereits:

    Pille „critical"              oklch(0.5 0.16 22)     = --neg
    Pille „aerztlich abklaeren"   oklch(0.4 0.005 270)   = grau

`[read]` **Beide Achsen wurden angezeigt**, seit G-110 —
`AKTION_TEXT` uebersetzte bereits alle sieben Handlungsarten,
`SCHWERE_RANG` sortierte seit G-187 nach Schwere. **Was fehlte, ist
etwas anderes und Genaueres:**

**a) `critical` und `high` sind FARBGLEICH.** `[cmd]` Beide stehen in
`SCHWERE_FARBE` auf `var(--neg)` = `oklch(0.50 0.16 22)`
(`styles/themes/lume.css`). **Die Stufe war nur an der Beschriftung
zu erkennen, nicht an der Gestalt.**

**b) Die Handlungsart ging unter.** `[cmd]` Auf der Nachweiskarte
standen **acht** Marken in derselben grauen Farbe:
*„aerztlich abklaeren"*, `CYP2D6_inhibitor`, `CYP2D6_substrate`,
`opioid`, `ssri`, `SSRI`, `tramadol`. `[read]` **Die eine, die
jemanden aus der App hinausschickt, sah aus wie eine
Stoffwechselnotiz.**

**c) Die Stufen standen auf Englisch da** — `critical`, `high`,
`medium`, `low` in einer sonst deutschen Oberflaeche.

`[read]` **Das ist keine Wortklauberei, es aendert die Aufgabe:**
nicht „Achsen sichtbar machen", sondern **„Achsen unterscheidbar
machen".**

### 2 · Wie die Achsen zusammenhaengen — die Messung zuerst

**Auftrag: *„Wenn jede `critical` ohnehin `physician_referral`
traegt, ist eine Achse redundant; wenn sie sich kreuzen, braucht die
Anzeige beide."***

`[cmd]` **Die Antwort ist BEIDES, je nach Stufe** — gemessen ueber
alle 64 Regeln:

    severity   Regeln   Handlungsarten darin
    critical       10   physician_referral 10                      <- EINE
    high           18   physician_referral 17, lab_context 1
    medium         17   physician_referral 6, lab_context 6,
                        warning 3, schedule_adjustment 1,
                        verify_prescription 1                      <- FUENF
    low            19   information 15, general_information 2,
                        lab_context 1, schedule_adjustment 1

`[cmd]` **Innerhalb von `critical` ist die zweite Achse redundant:
10 von 10 tragen `physician_referral`.**

`[cmd]` **Ueber den Katalog ist sie es nicht:** `physician_referral`
steht bei **drei** Schweregraden — 17 `high`, 10 `critical`, 6
`medium`. **12 von 28 rechnerisch moeglichen Kombinationen kommen
vor.**

`[read]` **Damit ist Toms Punkt gemessen bestaetigt:** eine
`medium`-Regel, die zum Arzt schickt, steht neben vier anderen
`medium`-Regeln, die es nicht tun. **Die Schwere allein sagt nicht,
was zu tun ist.**

`[cmd]` **Und im Durchstich selbst wurde es sichtbar:** die drei
feuernden Regeln waren `critical`, `high` und `medium` — **alle drei
mit `physician_referral`.** Genau der Kreuzfall.

**Verteilung der Handlungsarten:** `physician_referral` 33,
`information` 15, `lab_context` 8, `warning` 3,
`schedule_adjustment` 2, `general_information` 2,
`verify_prescription` 1.

`[read]` **Die Schweren sind fast gleichverteilt** (10/18/17/19) —
**keine Stufe traegt die Haelfte.** Deshalb ordnet die Schwere und
faerbt, aber sie allein traegt die Anzeige nicht.

### Was daraus gebaut wurde

**`lib/supplements/regel-stufen.ts`** — serverfrei (A-30), enthaelt
die Messung als Begruendung.

    Schwere        vier Stufen, Rangfolge, Farbe, deutscher Klartext
    Hervorhebung   NUR `critical` — Rahmen und Flaeche, kein zweites Rot
    Handlungsart   alle sieben auf Deutsch, `physician_referral`
                   ausgezeichnet
    Verteilung     zaehlt, was ZUTRIFFT, nicht den Katalog

`[read]` **Warum `critical` Flaeche bekommt und keine neue Farbe:**
zwei benachbarte Rottoene unterscheidet niemand. **Rahmen und
Hintergrund wirken auch dort, wo Farbe nicht ankommt.**

`[read]` **Warum nur `critical` und nicht `high`:** `[cmd]` mit `high`
waeren es **28 von 64** — eine Hervorhebung, die fast die Haelfte
betrifft, hebt nichts hervor. Ein Waechter prueft das.

`[read]` **Warum die Handlungsart an der HANDLUNG haengt und nicht an
der Schwere:** weil sie bei drei Schweregraden steht. Haenge ich sie
an `critical`, verliere ich die 17 `high` und 6 `medium`, die
ebenfalls zum Arzt schicken.

`[read]` **Die Grenze aus C-108/F-02 bleibt:** *„Nennen ja, bewerten
nein."* **Es entsteht keine Note, keine Sperre, keine Rangzahl** —
nur die Stufe, die ohnehin im Katalog steht, sichtbar gemacht.

### Der Nachweis: critical gegen high, nebeneinander

`[cmd]` **Zusaetzlich Warfarin und Apixaban eingetragen**, damit drei
Stufen auf demselben Bildschirm stehen
(`backup/g218-2-critical-gegen-high.png`):

    wr_drug_serotonergic_combo  kritisch   Karte getoent + gerahmt,
                                           Pille INVERTIERT
                                           (hell auf --neg)
    wr_drug_bleeding_stack      hoch       Karte normal,
                                           Pille rot auf weiss
    wr_anticoag_stack           mittel     Karte normal,
                                           Pille bernstein
    Kopfzeile                   „1× kritisch · 1× hoch · 1× mittel"

`[cmd]` **Und die Handlungsart sticht heraus:** *„ärztlich abklären"*
in `oklch(0.5 0.16 22)` mit Warnzeichen, **die sechs Kontextmarken
daneben unveraendert grau** `oklch(0.4 0.005 270)`.

`[read]` **Damit ist die vierte Nachweiszeile beantwortet:** vorher
war `critical` von `high` **nur am Wort** zu unterscheiden, jetzt an
Kartenflaeche, Rahmen und Pillenumkehr.

### Gegenprobe

`[cmd]` **Nur die zwei serotonergen Medikamente abgesetzt** — die
Antikoagulanzien blieben stehen, damit sich zeigt, dass **genau die
`critical`-Warnung** verschwindet und nicht alles:

    wr_drug_serotonergic_combo   fulfilled  ->  not_fulfilled
    „Serotonin-Syndrom" sichtbar        ja  ->  nein
    „kritisch" sichtbar                 ja  ->  nein
    Kopfzeile      1× kritisch · 1× hoch · 1× mittel
                             ->  1× hoch · 1× mittel
    die anderen zwei Regeln     feuern weiter

`[read]` **Die Kopfzeile zaehlt also mit, statt einen Stand
festzuhalten.** Keine Warnung blieb stehen.

### Nachweisliste

    Lage ueber die Oberflaeche   [cmd] Formular G-211, kein INSERT
    Leseweg                      [cmd] kommt an, filtert nichts
    Anzeige                      [cmd] erscheint, mit Text
    critical gegen high          [cmd] unterscheidbar, Bild 2
    Handlungsart sichtbar        [cmd] 7 Arten uebersetzt, 1 ausgezeichnet
    Verteilung je Achse          [cmd] Kreuztabelle oben
    Gegenprobe                   [cmd] Warnung verschwindet, gezielt
    Rueckbau                     [cmd] 4 angelegt, 4 geloescht

### Waechter: sieben Sabotagen, sieben Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    high wird mit hervorgehoben              faellt
    Handlungsart nicht mehr ausgezeichnet    faellt
    Unbekanntes an den Anfang sortieren      faellt
    Stufe unuebersetzt lassen                faellt
    leere Stufen in die Kopfzeile            faellt (2 Tests)
    die Karte hebt nicht mehr hervor         faellt
    zweite Stufentabelle in der Anzeige      faellt

`[cmd]` **13 neue Tests, 196 im Supplements-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.537 Dateien sauber.

`[read]` **Ein Waechter verdient eine eigene Zeile:** er verbietet der
Anzeige eine **zweite** Stufentabelle. `[cmd]` Vorher hielt
`tab-interactions-echt.tsx` `SCHWERE_FARBE`, `SCHWERE_RANG` und
`AKTION_TEXT` selbst — **dieselbe Zusage an zwei Orten, und die
laufen auseinander** (Begruendung wie bei der Naht, G-122).

### Rueckbau, gezaehlt

`[cmd]` **4 angelegt** (Sertraline, Tramadol, Warfarin, Apixaban),
**4 geloescht.** `[read]` Absetzen loescht nicht (G-211), also mussten
sie einzeln weg.

    medical.user_medications  test-user   0   (vorher 0)
    medical.user_medications  dev         1   Warfarin, unveraendert
    medical.user_medications  gesamt      2   (vorher 2)
    feuernde Regeln auf test-user     (keine)

`[cmd]` **Der Katalog ist unveraendert:** `critical` 10, `high` 18,
`medium` 17, `low` 19 — **wie vor dem Auftrag. Keine `severity`
angepasst**, ein Waechter prueft, dass die Stufendatei nicht schreibt.

`[cmd]` **`dev@lumeos.app` unberuehrt.** Nicht committet, nicht
gestaged.

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank und den laufenden Dev-Server.

`[cmd]` **Die Zahl des Auftrags stimmt:** 10 `critical`-Regeln —
nachgezaehlt. `[read]` Die Berichtigung im Befundteil („nicht die
einzige, sondern eine von zehn") ist damit bestaetigt.

`[read]` **Abgrenzung bei der Kreuztabelle:** gezaehlt wurde
`group by severity, recommended_action_type` ueber
`supplements.rule_catalog`, **ohne** Filter auf
`input_coverage_status` — also alle 64 Regeln, auch die, die heute
nicht auswertbar sind. **Wer nur die auswertbaren zaehlt, bekommt
andere Zahlen.**

`[read]` **Abgrenzung bei „Farbe":** gemessen mit
`getComputedStyle(...).color` im gerenderten Browser, nicht aus der
CSS-Datei gelesen — `color-mix` und Themenumschaltung machen den
Quelltextwert unzuverlaessig (G-196).

`[read]` **Abgrenzung bei „Attrappen":** 0 im neuen Code; die Seite
zeigt weiterhin **1**, die stand vorher schon da.

### Ein Nebenbefund

`[cmd]` **`wr_drug_bleeding_stack` feuert jetzt** — die Regel, von der
ich in G-215 belegt hatte, dass sie **nie** feuern kann. `[read]`
**Codex hat den Operator in C-331 behoben**, und ich habe es
nachgemessen: `array_agg(flag_key)` **ohne** `DISTINCT` (zaehlt je
Medikament) und `AND COALESCE((mas.risk_flags->>key)::boolean,
false)` (filtert auf `true`). **Beide G-215-Fehler sind weg.**

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Die Achsenmessung stimmt exakt:**

    Katalog              low 19 · high 18 · medium 17 · critical 10
    physician_referral   high 17 · critical 10 · medium 6
    critical             10 von 10 mit physician_referral
    medium               5 verschiedene Handlungsarten

`[read]` **Die Schlussfolgerung traegt in beide Richtungen:** innerhalb
`critical` ist die zweite Achse redundant, ueber den Katalog nicht.
**17 `high` und 6 `medium` schicken ebenfalls zum Arzt** — wer die
Handlungsart an die Schwere haengt, verliert 23 Regeln.

### Meine Praemisse war falsch, und der Unterschied zaehlt

`[read]` Ich hatte geschrieben: *,,beide Achsen sind heute
unsichtbar"*. `[cmd]` **Sie waren sichtbar, aber nicht
unterscheidbar** — `AKTION_TEXT` uebersetzte alle sieben
Handlungsarten, seit G-187 wurde nach Schwere sortiert.

`[cmd]` **Was fehlte:** `critical` und `high` rendern in derselben
Farbe, *,,aerztlich abklaeren"* stand grau wie sieben Kontextmarken,
und die Stufen standen englisch in einer deutschen Oberflaeche.

`[read]` **,,Sichtbar machen" und ,,unterscheidbar machen" sind zwei
verschiedene Auftraege.** Ich haette das Erste bestellt und das
Zweite gebraucht.

### Die Gestaltung ist begruendet, nicht gewaehlt

`[read]` **Flaeche statt einer dritten Rotnuance** — *,,zwei
benachbarte Rots unterscheidet niemand"*. **Und nur `critical`**,
weil `high` dazu 28 von 64 waeren und nichts mehr hervorhoebe.

`[read]` **Die Handlungsart haengt an der Handlung, nicht an der
Schwere** — sonst fallen die 23 `high`/`medium`-Regeln weg, die
ebenfalls zum Arzt schicken.

### Die zwei Agenten haben sich gegenseitig bestaetigt

`[cmd]` **`wr_drug_bleeding_stack` feuert jetzt** — die Regel, von der
Claude Code in G-215 belegt hatte, dass sie nie feuern kann. **Codex
hat den Operator in C-328/C-331 behoben, Claude Code hat beide eigenen
G-215-Befunde nachgemessen und sie sind weg** — ohne voneinander zu
wissen.

`[cmd]` **Eine zweite Stufentabelle in der Anzeige ist entfernt**
(`SCHWERE_FARBE`, `SCHWERE_RANG`, `AKTION_TEXT` lokal), ein Waechter
verbietet sie — **dieselbe Begruendung wie bei der Naht.**

`[cmd]` **Gegenprobe gezielt:** nur die serotonergen abgesetzt, die
Antikoagulanzien blieben — Kopfzeile von *,,1x kritisch · 1x hoch · 1x
mittel"* auf *,,1x hoch · 1x mittel"*. **Rueckbau 4/4/0, Katalog
unveraendert bei 10/18/17/19, keine `severity` angepasst.**

**Abgenommen.**

