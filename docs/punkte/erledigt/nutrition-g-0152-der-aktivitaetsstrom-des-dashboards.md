---
nr: G-152
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-100
kinder: []
entscheidung: E-52
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 64937c89
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-152 - Der Aktivitaetsstrom des Dashboards

## Befund

(neu 2026-08-20,
  aus G-100).

  `[cmd]` **Er waere baubar** — anders als der Tagesverlauf braucht er
  keine Dauer, nur Zeitpunkt, Modul und einen Satz. Die Zeitpunkte
  liegen vollstaendig vor: `meals.meal_time` **725/725**,
  `intake_logs.intake_time` **360/360**,
  `workout_sessions.started_time` **30/30**.

  `[read]` **Was fehlt, ist eine Entscheidung, keine Spalte:** Es gibt
  keine gemeinsame Ereignistabelle. Sechs Abfragen je Seitenaufruf,
  nach Zeit gemischt — **oder** eine Sicht in der Datenbank, die das
  einmal tut. Das Zweite waere die Loesung, das Erste die Abkuerzung.

## Auftrag

**Mitbeauftragt mit G-11 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.

`[cmd]` **Nachgemessen 2026-08-29, der Bericht steht in G-11.**
Die Zeitpunkte liegen unveraendert vollstaendig vor (725/725,
360/360, 30), und es gibt weiterhin keine gemeinsame
Ereignissicht. `[read]` **Es fehlt eine Entscheidung, keine
Spalte** — unveraendert offen.

## Zwischenstand, 2026-08-29

`[cmd]` **In G-11 geprueft und unveraendert offen.** Die Zeitpunkte
sind vollstaendig (725/725, 360/360, 30), **aber es gibt weiterhin
keine gemeinsame Ereignissicht.**

`[read]` **Das ist Codex' Bereich** — eine Sicht ueber mehrere
Module braucht eine Funktion, keine Oberflaeche.

## Entschieden: E-52, 2026-09-02

Tom: *,,wieso soll ich 6 straenge abfragen wenn wir die sowieso als
daten immer brauchen? also zusammenfassen als eine sicht in der db
und wenn was dazu kommt erweitern."*

**Eine Sicht in der Datenbank, keine Schleife im Browser.**

`[read]` **Und die Entscheidung reicht ueber diesen Punkt hinaus:**
**wo mehrere Abfragen dieselbe Frage beantworten, gehoert eine Sicht
hin.**

`[cmd]` **C-353 hat gemessen, was der andere Weg kostet:** TTFB von
410 auf 4.183 ms — **die Zeit lag im Warten auf mehrere Abfragen,
nicht in der Uebertragung.**

`[read]` **Der zweite Grund ist Wahrheit, nicht Tempo:** **wer im
Browser mischt, hat die Sortierregel in der Anzeige** — **an einer
Stelle, die kein Waechter erreicht.**

`[cmd]` **Der Ereignisstrom ist die erste modulschneidende Sicht** —
wie *Wasser* bei den Naehrwerten (E-48).

## Auftrag

**Mitbeauftragt mit G-348 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: braucht die Sicht

`[cmd]` **Die Entscheidung ist mit E-52 laengst gefallen:**
**gemeinsame Sichten statt sechs Abfragen.**

`[read]` **Der Punkt wartet auf Codex** — **die Sicht ist nicht
gebaut.**

`[cmd]` **Und ein Befund haengt daran: `intake_logs` endet am
19.08.** — **ein 7-Tage-Strom wuerde Supplements faelschlich als
still zeigen** (C-412).

`[read]` **Eine richtige Funktion auf altem Bestand erzeugt eine
falsche Aussage.**

## Auftrag

**Mitbeauftragt mit G-222 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: wartet weiter, aber die Sicht kommt.

`[cmd]` **Codex hat sie am 2026-09-07 gebaut** —
`activity_stream`, sechs Module, TTFB 4,60 ms warm (C-412).

`[cmd]` **Und ein Befund haengt daran: sie liegt in `nutrition`
statt querschnittlich** (C-414).

`[read]` **Der Anschluss ist ein UI-Auftrag** — **nach C-414.**

## Gemessen am 2026-09-08, vor der Auftragsvergabe

`[cmd]` **`public.activity_stream` steht seit C-412/C-414.**

    Spalten   user_id, event_date, event_time, occurred_at,
              module, event_type, event_id, summary_de

    nutrition    4170   bis 2026-11-16
    supplements   810   bis 2026-09-06
    recovery      370   bis 2026-11-06
    training       66   bis 2026-11-11
    medical        10   bis 2026-06-06
    ------------------
    gesamt       5426

`[cmd]` **Und null Dateien in `apps/` lesen sie.**

`[read]` **Achter Fall von A-71** — **der Leseweg steht, niemand
ruft ihn.**

`[cmd]` **TTFB warm 4,6 ms** (C-412) — **die Sicht ist schnell
genug.**

## Auftrag — den Aktivitaetsstrom anschliessen

**Mitbeauftragt: G-374.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
dashboard.** `[cmd]` **Dann die Mockups, die dort genannt sind.**

`[read]` **Und sieh nach, wie das Mockup den Strom zeigt** — **eine
Liste, ein Verlauf, oder je Modul getrennt.**

### 1 · G-152 — der Strom im Dashboard

`[cmd]` **`dashboard-echt.tsx` und `entwurf.tsx` liegen da.**

`[read]` **Miss zuerst, was die Entwurfsfassung zeigt** — **und ob
`summary_de` reicht oder je Ereignisart etwas anderes noetig ist.**

`[cmd]` **`summary_de` heisst: die Sicht traegt deutschen Text.**
`[read]` **Die App ist dreisprachig** (DE/EN/TH) — **das ist zu
messen und zu melden, nicht zu loesen.**

### 2 · G-374 — Zyklen brauchen ein Startdatum

`[cmd]` **`{on_weeks, off_weeks}` ohne Beginn ergibt kein
*Wk 5 of 8*.**

`[cmd]` **`stack_items` traegt 17 Spalten** — **miss, ob eine den
Beginn haelt.**

`[read]` **Wenn nicht: melden, nicht in `supabase/` bauen.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  der Strom am Schirm. Zahl: Zeilen gezeigt / 5426.
        Und: welcher Zeitraum, welche Sortierung.
    A2  je Modul: erscheint es? Zahl: 5 Module / davon sichtbar.
    A3  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A4  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A5  summary_de gegen DE/EN/TH: was fehlt, gemessen.
    A6  G-374: haelt eine Spalte den Zyklusbeginn? Ja mit Namen,
        nein mit Vorschlag.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **Er war eben unten** — **`server.py start`, nicht `.next`
loeschen.**

## Bericht

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### Gelesen, bevor gebaut

`[cmd]` **`00-QUELLEN.md`, Abschnitt dashboard:** EINE Mockupdatei,
`module-dashboard.jsx` (15 KB).

`[cmd]` **Die Frage des Auftrags** — *Liste, Verlauf oder je Modul
getrennt* — **beantwortet `module-dashboard.jsx:105`:**

    Card title="Activity" sub="Live"
      Zeit (64px) | modulfarbenes Zeichen (16px) | Text + Meta
      sechs Eintraege, neueste zuerst, gemischt

`[read]` **EINE gemischte Liste, nicht je Modul getrennt** — die
Module sind an der Farbe unterscheidbar.

### A1 — der Strom am Schirm

**40 gezeigt / 133 fuer dieses Konto** — **nicht von 5.426.**

`[cmd]` **Die 5.426 sind die Summe ueber FUENF Konten:**

    dev@lumeos.app         1657
    tom.seed@example.com   1651
    max.seed@example.com   1080
    sarah.seed@example.com  905
    test-user@lumeos.local  133

`[read]` **`public.activity_stream` ist eine SICHT mit
`security_invoker=true`** — die Zeilenrechte der Quelltabellen
greifen, jede Nutzerin sieht nur ihre eigenen Zeilen. **Die Kachel
kann also nie 5.426 zeigen.**

**Zeitraum und Sortierung:** `2026-06-09` bis `2026-09-06`,
**sortiert nach `occurred_at` absteigend** — nicht nach
`event_date`: zwei Ereignisse am selben Tag haetten sonst keine
Reihenfolge.

**Die Kachel sagt beides:** *,,40 von 133 · neueste zuerst"* und
darunter *,,93 weitere Ereignisse in der Sicht"*.

### A2 — je Modul

**5 Module / 4 sichtbar.**

`[cmd]` **Am Schirm gezaehlt:**

    supplements  23
    recovery      8
    nutrition     7
    training      2
    medical       0

`[cmd]` **`medical` fehlt, weil es fuer dieses Konto NICHT
existiert** — die zehn Medical-Zeilen der Sicht gehoeren
`dev@lumeos.app` (5) und `tom.seed@example.com` (5).

`[read]` **Kein Anzeigefehler, ein Datenstand.**

#### Und die Grenze war zuerst falsch gewaehlt

`[cmd]` **Mit `limit 20` waren nur ZWEI Module sichtbar.** Gemessen
ueber `row_number() over (order by occurred_at desc)`:

    nutrition    ab Zeile  1
    supplements  ab Zeile  2
    recovery     ab Zeile 23
    training     ab Zeile 30

`[read]` **Bei 20 waeren zwei der vier Module strukturell
unsichtbar** — die Kachel saehe nach *,,nur Ernaehrung und
Supplemente"* aus, obwohl vier Module Zeilen haben. **Grenze auf 40,
mit dieser Messung als Begruendung im Code.**

### A3 — E-72: keine nackte Null

**8 Kacheln / 7 mit Daten / 1 mit benanntem Leerhinweis.**

`[cmd]` **`Bestleistungen`:** *,,Keine Bestleistung erfasst."* —
sagt, WAS leer ist.

`[cmd]` **Der Strom selbst traegt einen eigenen Leerfall**, der auf
diesem Konto nicht greift: er nennt `activity_stream` beim Namen und
erklaert, dass der Strom aus den Modulen entsteht.

### A4 — E-69: Referenz unter der Linie

**8 angebunden / 7 Referenzen** — **vorher 5.**

`[cmd]` **Der Mockup fuehrt SIEBEN Kacheln**, unter der Linie
standen fuenf. **`Macros · today` und `PR watch` fehlten**, obwohl
beide oben ein angebundenes Gegenstueck haben
(`Makros · heute`, `Bestleistungen`). **Ergaenzt.**

`[cmd]` **Und die `Activity`-Referenz war eine Inhaltsangabe:**
*,,Der Entwurf zeigt sechs Eintraege aus vier Modulen."* — **die
Attrappe der Attrappe.** **Jetzt die sechs Zeilen des Mockups**, mit
Zeit, Farbe, Text und Meta.

`[read]` **Acht oben gegen sieben unten ist richtig:** vier Kacheln
(`Ziele`, `Recovery`, `Medical`, `Supplements`) sind ueber den
Mockup hinaus gebaut, und `Today's flow` hat oben kein
Gegenstueck.

### A5 — `summary_de` gegen DE/EN/TH

**1 von 3 Sprachen. Es fehlen `summary_en` und `summary_th`.**

`[cmd]` **Die Sicht traegt genau eine Sprachspalte.** **Und der
Vergleich zeigt, dass es anders geht:**

    public.activity_stream.summary_de              nur DE
    supplements.supplement_evidence.summary_de     DE
    supplements.supplement_evidence.summary_en     EN
    supplements.supplement_evidence.summary_th     TH

`[cmd]` **Der deutsche Text steht als Literal IN der
Sichtdefinition** — `'Mahlzeit erfasst: '`, `'Wasser erfasst: '`,
`'Fruehstueck'`, `'Mittagessen'`, `'Abendessen'`, `'Snack'`.

`[read]` **Damit ist es keine Anzeigefrage:** EN und TH brauchen
eine Aenderung an der Sicht, also an `supabase/`. **Gemessen und
gemeldet, nicht geloest** — wie beauftragt.

`[cmd]` **Die Kachel sagt es selbst**, damit die Luecke am Schirm
sichtbar bleibt: *,,Die Texte kommen als `summary_de` aus der Sicht
— nur auf Deutsch, auch in EN und TH."*

### A6 — G-374: haelt eine Spalte den Zyklusbeginn?

**Nein.** `[cmd]` **Alle 17 Spalten von `stack_items` gepruefet:**

    id, stack_id, supplement_id, custom_name, notes, dose,
    dose_unit, frequency, timing, cycling, stock_remaining,
    stock_unit, low_stock_threshold, sort_order, is_active,
    added_at, updated_at

`[cmd]` **Keine haelt einen Zyklusbeginn.** `added_at` ist der
Anlagezeitpunkt der ZEILE — wer einen Posten Wochen spaeter auf
Cycling stellt, haette damit einen falschen Start.

`[cmd]` **`cycling` ist `jsonb` mit genau einem CHECK:**
*,,ist NULL oder ein Objekt"* — **keine Schluesselvorgabe.**
`[cmd]` **Und NULL Zeilen sind belegt**, also gibt auch der Bestand
nichts vor.

**Vorschlag — nicht gebaut, `supabase/` gehoert Codex:**

`[read]` **Der kleinste Weg ist ein Schluessel IM vorhandenen
`cycling`-Objekt**, kein neue Spalte:

    {"on_weeks": 8, "off_weeks": 4, "started_on": "2026-09-08"}

`[read]` **Warum dort und nicht als Spalte:** `cycling` ist schon
da, hat schon einen CHECK, und ein Zyklus ohne die drei Werte
zusammen ergibt ohnehin keinen Sinn. **Eine eigene Spalte waere ein
zweiter Ort fuer dieselbe Sache.**

`[read]` **Bis dahin bleibt Cycling ungebaut** — die Kachel sagt
den Grund an der Stelle, statt ein *,,Wk 5 of 8"* zu erfinden
(C-378).

### Ein Befund an meiner eigenen Arbeit aus G-373

`[cmd]` **Die Timing-Auswahl fuehrte `night`** — **den Wert kennt
`stack_items_timing_check` nicht.** Wer ihn gewaehlt haette, waere
beim Speichern abgewiesen worden. **Und drei erlaubte Werte
fehlten:** `bedtime`, `with_meal`, `any`.

`[cmd]` **Berichtigt aus dem CHECK** und am Schirm gegengeprueft:
`with_meal` gewaehlt, gespeichert, **in der Datenbank angekommen.**

`[read]` **Eine Auswahlliste ist eine Zusage** — was darin steht,
muss die Datenbank annehmen. **Aus dem Kopf geschrieben statt
gemessen; das war der Fehler.**

### Was gebaut wurde

    lib/dashboard/lesen.ts                ladeAktivitaetsstrom
    v2/dashboard/aktivitaetsstrom.tsx     NEU, die Kachel
    v2/dashboard/page.tsx                 laedt und zeigt
    v2/dashboard/entwurf-rest.tsx         Activity portiert,
                                          Macros + PR watch ergaenzt
    v2/supplements/stack-bearbeiten.tsx   Timing aus dem CHECK

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    encoding-pruefen            20.923 Dateien, sauber
    pnpm --filter web test      1503 pass, 0 fail

### Was unberuehrt blieb

`[cmd]` **`dev@lumeos.app`: 1.657 Zeilen — unveraendert.**
`[read]` **Der Strom ist eine SICHT** — es gibt dort nichts zu
schreiben.

**Nichts in `supabase/`. Nicht committet, nicht gestaget.**

## Abnahme

**2026-09-08, Orchestrator.** **Sechs mit Zahlen, und eine
Berichtigung an mir.**

    A1  40 gezeigt / 133 dieses Kontos -- nicht von 5426
    A2  5 Module / 4 sichtbar (medical hat hier keine Zeilen)
    A3  8 Kacheln / 7 mit Daten / 1 benannter Leerhinweis
    A4  7 Referenzen, waren 5
    A5  1 von 3 Sprachen
    A6  keine Spalte haelt den Zyklusbeginn

### Meine Zahl war falsch

`[cmd]` **Ich schrieb *,,40 von 5426"*.**

`[cmd]` **Nachgemessen: 5426 ist die Summe ueber fuenf Konten.**

    dev@lumeos.app          1657
    tom.seed@example.com    1651
    max.seed@example.com    1080
    sarah.seed@example.com   905
    test-user@lumeos.local   133

`[cmd]` **Und `activity_stream` traegt `security_invoker=true`** —
**jeder sieht nur seine eigenen Zeilen.**

`[read]` **Ich hatte eine Gesamtzahl als Kontozahl in den Auftrag
geschrieben** — **derselbe Fehler wie bei den 178 Zeilen in
`modality_log`** (G-371).

### Das Mockup beantwortete die Formfrage

`[cmd]` **`module-dashboard.jsx:105`: eine gemischte Liste, neueste
zuerst** — **Zeit, modulfarbiges Zeichen, Text.** `[read]` **Nicht
je Modul getrennt.**

`[read]` **Er hat es nachgesehen, statt zu waehlen.**

### Die Messung fing einen strukturellen Fehler

`[cmd]` **Mit 20 Zeilen erschienen nur zwei Module.**

`[cmd]` **Gemessen mit `row_number()`: `recovery` erscheint erst auf
Rang 23, `training` auf 30.**

`[read]` **Zwanzig verbarg die Haelfte der Module** — **nicht
zufaellig, sondern der Struktur nach.**

`[cmd]` **Auf 40 gehoben, und die Messung steht als Begruendung im
Code.**

`[read]` **Eine Zahl mit Grund ist etwas anderes als eine Zahl.**

### A5 — die Sicht traegt nur Deutsch

`[cmd]` **Nachgemessen: `summary_de`, sonst nichts.**

`[cmd]` **Und der deutsche Text steht als Zeichenkette IN der
Sichtdefinition** — `'Mahlzeit erfasst: '`, `'Abendessen'`.

`[cmd]` **`supplement_evidence` traegt `_de`, `_en`, `_th`** —
**die Sicht ist der Ausreisser.**

`[read]` **EN/TH heisst: die Sicht aendern.** **Als C-430.**

### A6 — sein Vorschlag ist der bessere

`[cmd]` **Alle 17 Spalten geprueft, `added_at` ist die
Zeilenanlage.**

`[cmd]` **`cycling` ist JSONB mit einem *ist ein Objekt*-CHECK und
null gefuellten Zeilen.**

`[read]` **Sein Vorschlag: `started_on` INNERHALB des bestehenden
Objekts** — **statt einer neuen Spalte.**

> *,,die drei Werte sind einzeln bedeutungslos."*

`[read]` **Richtig: eine Woche-an ohne Woche-aus und ohne Beginn
ist kein Zyklus.**

### Und ein Fehler in seiner eigenen Vorarbeit

`[cmd]` **Die Zeitpunkt-Auswahl aus G-373 bot `night` an, was der
CHECK ablehnt** — **und liess drei gueltige Werte weg.**

`[read]` **Seine Lehre:** *,,Eine Auswahlliste ist ein Versprechen;
ich hatte sie aus dem Gedaechtnis geschrieben statt gemessen."*

`[cmd]` **Berichtigt aus der Bedingung, durchgehend geprueft.**

**Abgenommen.**

