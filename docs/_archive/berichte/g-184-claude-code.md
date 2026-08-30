# G-184 — Die WADA-Kachel sagt jetzt, fuer wen sie gilt

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

`note_de` wird angezeigt — als **Block unter der Kachelzeile**, nicht
in der Kachel. Toms Frage vom 2026-08-25 (*„WADA verboten — gilt das
auch fuer bodybuilding?"*) steht damit beantwortet, mit den Ligen
namentlich und ohne dass eigenes Wissen dazugekommen waere.

**Drei Zahlen des Auftrags stimmen so nicht.** Alle drei sind
gemessen, alle drei aendern etwas an der Umsetzung — Abschnitte 3, 5
und 6.

---

## 1 · Die Laengenverteilung — vor dem Bau

`[cmd]` **Gemessen ueber alle 320 `note_de`, bevor eine Zeile Code
entstand:**

| | Zeichen |
|---|---|
| Minimum | **253** |
| Median | **387** |
| p90 | **697** |
| Maximum | **818** |
| ueber 200 Zeichen | **143 von 320** |

**Je Zustand:**

| Zustand | min | Median | max |
|---|---|---|---|
| `prohibited` | 279 | 683 | 818 |
| `not_prohibited` | 387 | 387 | 387 |
| `monitored` | 253 | 253 | 326 |

### Die Entscheidung: Block, nicht Aufklapper

Der Auftrag nennt die Bedingung — *„wenn der laengste Text drei Zeilen
fuellt, ist ein Block richtiger als ein Aufklapper."*

`[cmd]` **Am Bild nachgezaehlt:** der Kreatin-Text (387 Zeichen) fuellt
**6 Zeilen**, der 1-Testosteron-Text (683) **10 Zeilen**. **Die
Bedingung ist nicht knapp erfuellt, sondern um das Doppelte bis
Dreifache.**

`[read]` **Zwei Gruende kommen aus dem Inhalt:**

- **Der Satz ist die Antwort auf die haeufigste Frage.** Was man
  aufklappen muss, liest niemand — und der Auftrag entstand, WEIL die
  Antwort fehlte. Sie hinter einen Klick zu legen waere derselbe
  Zustand mit mehr Arbeit.
- **Bei `prohibited` ist es eine Rechtsauskunft.** Ein Aufklapper legt
  nahe, dass man sie ueberspringen darf.

---

## 2 · Wo der Block steht

**Unter der Kachelzeile im Ueberblick**, direkt unter der WADA-Kachel,
auf die er sich bezieht.

`[read]` **Nur dort, nicht zusaetzlich in der Dosierung** — dieselbe
Regel wie beim Warnkasten in G-182: *„es gibt keinen grund oben
ueberall dasselbe zu zeigen."*

**Aufbau:** Ueberschrift je Zustand · Klasse als Marke rechts · der
Satz ungekuerzt darunter.

| Zustand | Ueberschrift | Ton |
|---|---|---|
| `prohibited` | *Für wen das Verbot gilt* | **warn** |
| `monitored` | *Beobachtungsprogramm — was das heißt* | **acc** |
| `not_prohibited` | *Für wen das gilt* | keiner |

`[read]` **Nur `prohibited` warnt.** `monitored` ist ein Hinweis;
faerbte `not_prohibited` mit, waere der halbe Katalog bunt.

---

## 3 · Punkt 2, die Kategorie — der Auftrag unterschaetzt sie

`[cmd]` **Der Auftrag nennt `wada_category` als Code (`S1.1`, `S2`,
`S4.1`, `S0`). Gemessen sind es 41 verschiedene Werte**, min 2, Median
5, **max 91 Zeichen** — 46 davon laenger als 12 Zeichen. Beispiel:

> `S1.1 Anabolic agents (exogene AAS: Testosteron und seine Ester) — jederzeit verboten`

`[read]` **Als Marke neben der Ueberschrift passt das nicht** — und
der Satz dahinter steht ohnehin in `note_de`. **Gezeigt wird deshalb
der Code am Anfang** (`S1.1`, `S2/S0`, `S4.4.2`, `S6.A`). Kein Text
geht verloren, er wird nur nicht zweimal gezeigt.

`[cmd]` **`unknown` faellt weg** (7 Zeilen) — es ist keine Klasse,
sondern das Fehlen einer.

### Und ein Datenwiderspruch, den die Kategorie aufdeckt

`[cmd]` **Zwei Zeilen tragen als Klasse `not prohibited` bzw.
`not on WADA list (not prohibited)` — bei `wada_status =
'prohibited'`:** Phenibut und Tianeptine.

`[cmd]` **`note_de` sagt es dort selbst:** *„Steht nach der
WADA-Verbotsliste 2026 nicht auf der Liste (laut Global DRO/USADA
nicht verboten); der Datensatz-Status 'prohibited' ist damit nicht
ve…"*

`[read]` **Die Anzeige unterdrueckt eine solche Klasse** — sonst
stuende *„verboten · not prohibited"* nebeneinander. **Der falsche
`wada_status` bleibt aber bestehen und gehoert korrigiert; das ist ein
Datenauftrag, kein Anzeigefehler.**

---

## 4 · Punkt 3, die drei Zustaende — schon richtig, aber

`[read]` **Der Auftrag vermutet, `monitored` falle heute unter
„erlaubt". Das trifft nicht zu.** `[cmd]` `substanz-kacheln.ts` fuehrt
seit G-182 alle drei:

    WADA_TEXT     monitored → „beobachtet"
    WADA_HINWEIS  monitored → „im Beobachtungsprogramm"
    ton           nur prohibited → 'warn'

**Der Zustand war korrekt abgebildet, ihm fehlte nur der Satz.** Der
Block fuehrt ihn jetzt als eigenen Fall weiter.

### Die drei `monitored` — und ein Fund

| Substanz | Klasse | im Katalog |
|---|---|---|
| **Semaglutide** | `2026 Monitoring Program (markers)` | ja |
| **Tirzepatide** | `2026 Monitoring Program (markers)` | ja |
| **Caffeine (anhydrous)** | *(keine)* | **nein** |

`[cmd]` **Koffein steht auf `im_katalog = false`** — es ist fuer den
Nutzer gar nicht sichtbar. Aufgefallen ist es, weil die Bildsuche es
nicht fand. **Ob das Absicht ist, entscheidet nicht die Anzeige** —
gemeldet als eigener Punkt.

`[cmd]` Die Klasse der beiden GLP-1 (`2026 Monitoring Program
(markers)`) traegt keinen `S`-Code und erscheint daher nicht als
Marke; **die Aussage steht im Satz.**

---

## 5 · Nachweise

### Die vier namentlich genannten

`[cmd]` Ueber die echte `wadaLage`, gegen die Datenbank:

| Substanz | Zustand | Block | Klasse | Ton | Zeichen |
|---|---|---|---|---|---|
| **1-Testosterone** | prohibited | ja | **S1.1** | warn | 683 |
| **Creatine monohydrate** | not_prohibited | ja | — | keiner | 387 |
| **Semaglutide** | monitored | ja | — | acc | 253 |
| **9-Me-BC** | *(keine Zeile)* | **nein** | — | — | — |
| *(Phenibut)* | prohibited | ja | **unterdrueckt** | warn | 279 |

**9-Me-BC erzeugt keinen Block, keine Ueberschrift, nichts.**

### Am Bild, beide Breiten

`[cmd]` `test-user@lumeos.local`, aufgeklappt, Reiter Ueberblick:

| Breite | Zeichen je Zeile | Zeilen | Blockbreite | beschnitten |
|---|---|---|---|---|
| **1280** | **80** | 6 | 485 px | nein |
| **1920** | **80** | 6 | 485 px | nein |

`[read]` **Gleiche Zeilenlaenge bei beiden Breiten** — die Grenze
haelt, ein breiterer Monitor zieht den Satz nicht auseinander.

Bilder: `backup/g184-kreatin-1280.png`, `-1920.png`,
`g184-aas-1280.png`, `g184-monitored-1280.png`, `g184-ohne-1280.png`.

`[cmd]` **2 Konsolenfehler** — die bekannte `data-mode`-Warnung plus
die der Anmeldeseite, nicht aus diesem Umbau.

### Negativprobe

`[cmd]` **Datenseite**, in einer zurueckgerollten Transaktion:

| Schritt | `length(note_de)` |
|---|---|
| vorher | 387 |
| nach `update … = null` | **leer** → Block verschwindet |
| nach `rollback` | 387 |

`[cmd]` **Codeseite**, drei Sabotagen, SHA-identischer Rueckbau:

| Sabotage | |
|---|---|
| `wada_note` im Lesepfad gekappt | **rot** |
| `wadaLage(...)` → `wadaLageX(...)` | **rot** |
| `wadaNote={satz.wada_note}` → `{undefined}` | **rot** |

---

## 6 · Zwei Zahlen des Auftrags stimmen nicht

**a) „92 Substanzen ohne `supplement_wada`-Zeile bei 412 sichtbaren".**
`[cmd]` **Gemessen sind es 124.** Der Katalog ist seit dem Verfassen
gewachsen. **An der Regel aendert das nichts** — dort erscheint
nichts, und 9-Me-BC belegt es.

**b) „Bei `not_prohibited` steht die Kategorie nur bei 3 von 172."**
`[cmd]` **Das stimmt** — und `prohibited` 145/145, `monitored` 2/3.

**c) Die Kategorie ist kein Code, sondern bis zu 91 Zeichen Text** —
Abschnitt 3.

---

## 7 · Was nicht getan wurde

**Kein Text gekuerzt, keiner umgeschrieben.** `[cmd]` Der Test prueft
`text.length === 387` bei Kreatin — die Saetze tragen ihre Quellen.

**Nichts ueber Verbaende ergaenzt.** `[read]` Was ueber IFBB und NPC
gesagt wurde, war `[wahrscheinlich]`; angezeigt wird ausschliesslich,
was in `note_de` steht.

**`supabase/_pipeline/` nicht angefasst** (C-280, Codex).
**Nicht committet, nicht gestaged.**

---

## 8 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe | **635 pass, 0 fail** |
| `wada-lage.test.ts` (neu) | **8 pass**, davon 1 Verdrahtungswaechter |
| `tools/serverimport-pruefen.mjs` | 51 Chunks, 0 Treffer |
| `tools/sprachrueckfall-pruefen.mjs` | 12 Abfragen, 0 ohne Rueckfall |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/encoding-pruefen.mjs` | 20.014 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Der Dev-Server wurde NICHT neu gestartet** — durchgehend **PID
351936**, 0,1 s.

---

## 9 · Was ich als Befund melde

**a) Phenibut und Tianeptine tragen `wada_status = 'prohibited'`,
obwohl `note_de` und `wada_category` sagen, dass sie nicht verboten
sind.** Die Anzeige entschaerft es; **der Datensatz gehoert
korrigiert.**

**b) Koffein steht auf `im_katalog = false`** — eine der drei
`monitored` ist unsichtbar.

**c) Der Verdrahtungswaechter war beim ersten Anlauf zu schwach.**
`[cmd]` Er prueft jetzt, **was an `wadaNote` gebunden ist**, nicht ob
der Name irgendwo vorkommt — die Sabotage `wadaNote={undefined}` kam
sonst durch, weil der Name in der Typdeklaration weiterlebt.
**Derselbe blinde Fleck wie in G-186/187/191, diesmal von der
Negativprobe gefunden.**

**d) Die erste Breitengrenze war zu weit.** `[cmd]` `78ch` ergab **97
Zeichen je Zeile** — ueber der G-181-Schwelle von 90. **`ch` ist die
Breite der Null**, und die Proportionalschrift bringt mehr Zeichen auf
dieselbe Strecke. Mit `64ch` sind es **80**. `[read]` Aufgefallen ist
es erst, als die Pruefung die gesetzten Zeilen zaehlte statt sie ueber
den Schriftgrad zu schaetzen.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/supplements/wada-lage.ts` | **neu** — Zustand, Titel, Ton, Klasse kuerzen |
| `apps/web/src/lib/supplements/__tests__/wada-lage.test.ts` | **neu** — 8 Pruefungen inkl. Bindungswaechter |
| `apps/web/src/lib/supplements/substanz-read.ts` | `wada_note` durchgereicht (wurde gelesen, nie weitergegeben) |
| `apps/web/src/app/v2/supplements/substanz-tafel.tsx` | `WadaLageBlock`, im Ueberblick gerendert |
| `apps/web/src/app/v2/supplements/supplements.css` | Block, Ton, Klassenmarke, `max-width: 64ch` |
| `backup/g184-schuss.mjs` | Nachweisskript (zaehlt gesetzte Zeilen) |
