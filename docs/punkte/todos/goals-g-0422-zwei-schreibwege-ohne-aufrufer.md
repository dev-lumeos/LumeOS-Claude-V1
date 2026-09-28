---
nr: G-422
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-421
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/modale.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-422 — Schreibwege ohne Aufrufer

## Befund

Aus G-421, Claude Code, 2026-09-08.

`[cmd]` **`messungAnlegenAktion` (G-122) ist gebaut und hat
KEINEN Aufrufer.**

`[read]` **Dieselbe Lage wie das Fotomodal, bevor er den Knopf
nachgetragen hat:**

> *,,Das Modal war unerreichbar, nichts schickte
> `{ typ: 'logPhoto' }`. Die Vorlage hat den Knopf, die Attrappe
> hatte ihn nicht mitkopiert."*

## Warum das ein Muster ist

`[cmd]` **Zweimal an einem Tag:**

    logPhoto              Modal gebaut, kein Ausloeser
    messungAnlegenAktion  Funktion gebaut, kein Aufrufer

`[cmd]` **Und ein drittes Mal in G-413:**
`preferences_hidden` **berechnet, kein Leser.**

`[read]` **Drei Bauteile, die fertig sind und nie gerufen
werden.**

`[read]` **Kein Test faellt darueber** ? **eine Funktion, die
niemand ruft, ist syntaktisch einwandfrei.**

## Was zu messen ist

`[read]` **Wie viele solche Stellen gibt es?**

`[cmd]` **Ein Waechter waere: jede exportierte Aktion in
`apps/web/src/app/v2/*/aktionen.ts` muss mindestens einen
Aufrufer haben.**

`[read]` **Und jedes `typ:` in einer Modalschaltung muss irgendwo
geschickt werden.**

`[cmd]` **`tools/` hat schon Waechter dieser Art** ? **der
`new Date()`-Waechter, der Attrappen-Waechter.**

## Und der Phasenwechsel

`[cmd]` **G-421 hat den Vermerk berichtigt: nicht *,,G-357
fehlt"*, sondern *,,der Aufrufer fehlt"*.**

`[read]` **Dieselbe Klasse** ? **die Schreibfunktion steht, der
Knopf nicht.**

## Bericht

**Claude Code, 2026-09-28.**

### B1 — die drei Faelle, je mit Zeilenbeleg

**1 — `logPhoto`: WAR SCHON VERDRAHTET.**

`[cmd]` `fehlende-kacheln.tsx:491` — `onClick={() => open({ typ:
'logPhoto' })}`. `[read]` **G-421 hat es behoben**, der Punkt
nennt es noch als offen.

**2 — `messungAnlegenAktion`: WAR OFFEN, jetzt verdrahtet.**

`[cmd]` **Gemessen: null Aufrufer in `apps/web/src`** — die
einzigen Treffer standen in KOMMENTAREN zweier Medical-Dateien,
die den Fall als Beispiel nennen.

`[cmd]` **Und das Modal trug einen `InEntwicklungKnopf` mit einem
FALSCHEN Grund:**

    „`goals.body_measurements` gibt es (17 Spalten, 362 Zeilen
     live) und wird gelesen. Was fehlt, ist der Schreibweg."

`[read]` **Der Schreibweg fehlte nicht.** `messungAnlegenAktion`
(`koerpermass-aktionen.ts:31`), `pruefeMessung`
(`koerpermass-rechnung.ts`) und `messungAnlegen`
(`koerpermass-write.ts`) stehen seit G-122. **Der Vermerk hat
verhindert, dass jemand nachsieht** — dieselbe Klasse wie der
ueberholte Grund in G-421.

`[cmd]` **Verdrahtet:** `LogWeightModal` ruft jetzt die Aktion,
zeigt Feldfehler am Feld und schliesst erst nach dem Erfolg.

`[cmd]` **Ein zweiter Befund fiel dabei an:** die Quellenliste bot
`Manual / Smart scale / DXA`. `[cmd]` **`body_measurements_method_ck`
erlaubt zehn Werte, und zwei dieser drei stehen nicht darin.**
**Jetzt kommt die Liste aus `BF_METHODEN`** — also aus dem CHECK.

**3 — `preferences_hidden`: WAR SCHON VERDRAHTET.**

`[cmd]` `tab-foods.tsx:1066` — `vorliebenLeerSatz(payload?.
preferences_hidden)`, mit eigenem Waechter
(`g413-leere-filtersuche.test.ts:74`). `[read]` **G-413 hat es
behoben.**

`[read]` **Zwei von drei waren also bereits zu** — **der Punkt war
in dem Teil ueberholt.** `[read]` **Gemessen, nicht angenommen:
je Fall eine Zeile.**

### Der Nachweis am Schirm UND in der Datenbank

`[cmd]` **`test-user@lumeos.local`, `/v2/goals?tab=metrics`,
ueber die Oberflaeche:**

    Modal geoeffnet            [data-messfeld] 5
                               [data-messung-speichern] 1
                               [data-messfeld-quelle] 10
    Erste Probe                „measurement_time: Um welche
                               Uhrzeit?" — die Pruefung greift
    Nach dem Ausfuellen        Modal schliesst

`[cmd]` **Die Zeile in `goals.body_measurements`:**

    2026-09-28 | 07:15:00 | 81.40 kg | 14.20 % | bia
    notes „G-422 Nachweis" | ffmi 20.96

`[read]` **`ffmi` hat die DATENBANK gerechnet** — die generierte
Spalte, nicht die Oberflaeche. **Das belegt zugleich G-512/A3.**

`[cmd]` **Danach geloescht, `test-user` hat wieder 0 Messungen.**

### B2 — die Zahl: NEUN ohne Aufrufer

`[cmd]` **Gemessen ueber 204 Dateien in `apps/web/src/app/v2/`,
Kommentare vorher entfernt:**

    aktion  messungAendernAktion     goals/koerpermass-aktionen.ts
    aktion  prioritaetenSpeichern    goals/ziel-aktionen.ts
    aktion  checkinAktion            recovery/erfassen-aktionen.ts
    aktion  modalitaetAnlegenAktion  recovery/erfassen-aktionen.ts
    aktion  modalitaetAendernAktion  recovery/erfassen-aktionen.ts
    modal   invite                   coach/kontext.tsx
    modal   goalDet                  goals/kontext.tsx
    modal   measureDet               goals/kontext.tsx
    modal   med                      medical/kontext.tsx

`[cmd]` **KEIN Waechter gebaut** — der Auftrag sagt: die Zahl ist
der Sollstand fuer den, der ihn spaeter baut.

`[read]` **Die Zahl ist einmal korrigiert worden.** `[cmd]` **Der
erste Lauf meldete 21** — er zaehlte JEDES Vorkommen von
`typ: 'x'` und hielt `logWeight`, `logPhoto` und `logMeasure`
faelschlich fuer tot. `[read]` **Der Ausloeser ist aber ein
`open({ typ: 'x' })`, nicht irgendein Vorkommen** — der `case` in
`modale.tsx` ist die ANZEIGE. **Nach der Berichtigung: neun.**

`[cmd]` **Stichprobe an zweien:** `goalDet` steht in
`kontext.tsx:18` und `modale.tsx:138`, **nirgends ein
`open(...)`**. `checkinAktion` kommt nur an ihrer eigenen
Definition vor.

`[read]` **`messungAendernAktion` bleibt bewusst offen** — sie
braucht ein Bearbeiten-Modal, und das ist nicht Teil dieses
Auftrags. **Sie steht jetzt in der Liste, statt unbemerkt zu
altern.**

### B3 — warum es dreimal an einem Tag passierte

`[cmd]` **Der Punkt sagt es selbst: *,,Kein Test faellt
darueber."*** `[cmd]` **`__tests__/g422-logweight-schreibt.test.ts`
ist der Test, der darueber faellt** — 8 Zusicherungen.

`[cmd]` **Sabotageprobe, vier Eingriffe:**

    Aktion nicht mehr gerufen     -> 2   ROT
    schliesst vor dem Erfolg      -> 4   ROT (nach Nachbesserung)
    erfundene Quellen zurueck     -> 6   ROT
    Vorlagendatum zurueck         -> 8   ROT
    alles zurueck                 -> 8/8 GRUEN

`[read]` **Die zweite Sabotage blieb beim ersten Versuch GRUEN.**
`[cmd]` **Meine Zusicherung fragte nur, ob nach `if (r.ok)`
irgendwo ein `onClose` steht** — das blieb wahr, als ich ein
zweites davor setzte. `[cmd]` **Jetzt wird GEZAEHLT: genau ein
`setTimeout(onClose`, und es muss zwischen `if (r.ok)` und `else`
liegen.** `[read]` **Ohne die Sabotage haette ich eine Zusicherung
abgenommen, die nichts misst.**

`[cmd]` **Rueckbau byteidentisch** (`cmp` gegen die Sicherung).

`[cmd]` **Und ein zweiter eigener Fehler, vom Gate gefangen:** die
nachgebesserte Zusicherung benutzte `[...r.matchAll(…)]`. `[cmd]`
**`npx tsc --noEmit` lief gruen, `pnpm gate` nicht** — `TS2802`,
der Spread eines `matchAll`-Iterators verlangt ein hoeheres
`target`. `[read]` **Meine Einzelpruefung lief VOR der
Nachbesserung** — **ein gruener Einzellauf ersetzt den Gatelauf
nicht.** `[cmd]` **Behoben mit `match` statt `matchAll`, Sabotage
erneut geprueft: faengt weiterhin.**

### Abgrenzung

`[cmd]` **Geaendert: `modale.tsx`** (ein Modal verdrahtet).
`[cmd]` **Neu: ein Waechter.** `[cmd]` **Nichts in `supabase/`,
kein Eingabefeld fuer Phasen, kein Waechter fuer B2.**

`[cmd]` **Nicht committet.**
