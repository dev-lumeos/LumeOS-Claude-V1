# G-195 — Der Reiter „Rechtslage"

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

Der Reiter steht, vor „Quellen", mit `note_de`, `wada_category` und
`rechtslage_klartext_de`. Die Kachel bleibt im Ueberblick.

`[cmd]` **Gemessen: 345 der 412 sichtbaren Substanzen bekommen den
Reiter, 67 nicht.**

**Und die neue Regel hat sofort getragen: drei deiner vier Zahlen
weichen ab**, zwei davon deutlich — Abschnitt 1.

---

## 1 · Deine Zahlen neben meinen

| | dein Auftrag | gemessen | |
|---|---|---|---|
| `note_de` gefuellt | **320** von 412 | **305** von 412 | ✗ |
| `rechtslage_klartext_de` | **136** | **201** von 412 | ✗ |
| `wada_category` bei prohibited | **145** | **145** | ✓ |
| `note_de` Median / max | **387 / 818** | **387 / 818** | ✓ |
| geerbte Zeilen | **17** | **32** | ✗ |

**Dein Verdacht war richtig, und er ging in beide Richtungen:**

`[cmd]` **`note_de` ist in ALLEN 337 Zeilen gefuellt**, nicht in 320 —
deine Abfrage zaehlte richtig, aber gegen die Tabelle. **Von den 337
gehoeren 32 zu Substanzen, die nicht sichtbar sind.** Sichtbar bleiben
**305**.

`[cmd]` **`rechtslage_klartext_de` steht bei 201, nicht 136** — die
Zahl stammt aus G-183 (2026-08-25) und ist seither durch Kimis Import
gewachsen. **Sie ist um die Haelfte zu niedrig, nicht zu hoch.**

`[read]` **Die zweite Abweichung aendert die Sache:** haette ich mit
136 gerechnet, waere der Reiter als Randfall erschienen. Mit 201 ist
er bei jeder zweiten Substanz gefuellt.

### Die entscheidende Zahl

`[cmd]` **345 von 412 bekommen den Reiter:**

    beides (note_de UND rechtslage)     161
    nur note_de                         144
    nur rechtslage_klartext_de           40
    ────────────────────────────────────────
    mit Reiter                          345
    ohne Reiter                          67

**Gegengeprobt:** 305 + 201 − 161 = 345. ✓

---

## 2 · Was der Umzug bringt — gemessen

**Toms Anlass:** *„anstatt das ganze bild zu zerstoeren."*

`[cmd]` **Der WADA-Block nahm im Ueberblick 155–235 px** von 580
sichtbaren — **27 bis 41 Prozent**, fuer eine Angabe, die die Kachel
darueber in drei Worten macht.

`[cmd]` **Ueberblickhoehe vorher und nachher, gemessen:**

| Substanz | vorher | nachher |
|---|---|---|
| Creatine monohydrate | 580 px | **444 px** |
| AC-262356 | 580 px | **523 px** |
| 1-Testosterone | 580 px | **660 px** * |

`[read]` **Der dritte Wert steigt, und das ist kein Fehler:** vorher
wurde bei 580 px abgeschnitten (der Behaelter rollt), nachher misst
`scrollHeight` den ganzen Inhalt. **Die 660 px sind der Inhalt ohne den
WADA-Block** — er ist trotzdem raus.

---

## 3 · Ein Befund: die Reiterzahl war schon vorher am Anschlag

**Auftrag: *„Kein siebter Reiter. Nachher sind es sechs."***

`[cmd]` **Gemessen ueber alle 412, ohne Community-Reiter:**

    7 Reiter    63 Substanzen
    6 Reiter   272
    5 Reiter    76

`[read]` **Bei 63 Substanzen ist der Rechtslage-Reiter der siebte, nicht
der achte** — die Grenze war vor diesem Umbau erreicht. Am Bild sind es
weniger (Kreatin 6, AC-262356 5), weil selten alles gefuellt ist.

`[cmd]` **Im Vollausbau sind es acht** (mit Community). **Ich habe es
nicht gedeckelt** — das waere eine Entscheidung ueber die
Navigationsstruktur, nicht ueber diesen Reiter. Der Waechter haelt die
**8** fest; ein neunter faellt auf.

---

## 4 · Die Rechtslage war fuer die Mehrheit unsichtbar

`[cmd]` **Sie stand in der Sicherheit, aber nur bei `heikel`** — also
nur fuer Enhanced und Peptide:

```
{heikel && <AufgeteilterAbschnitt titel="Rechtslage" … />}
```

`[read]` **Damit war ein Feld, das bei 201 von 412 gefuellt ist, fuer
die Mehrheit nicht erreichbar.** Im neuen Reiter steht es ohne diese
Bedingung. **Das war nicht im Auftrag — es fiel beim Umzug auf.**

---

## 5 · Der Kontrast: G-197 faellt NICHT weg

**Deine Frage: *„Miss, ob der Umzug es loest."***

`[cmd]` **Nein.** *„Fuer wen das Verbot gilt"* liegt weiterhin bei
**4.32** im Hellmodus.

`[cmd]` **Der Grund, nachgemessen im neuen Reiter:**

    .v2-supp-wada-block   oklch(0.55 0.13 80 / 0.05)
    .v2-supp-tafel-inhalt transparent
    .v2-supp-tafel        oklch(0.982 0.006 1)   ← rosa

`[read]` **`.v2-supp-tafel` ist der Grund in BEIDEN Reitern.** Der
Block ist umgezogen, der Boden unter ihm nicht. **G-197 bleibt
noetig.**

`[cmd]` Alle uebrigen Ueberschriften liegen unveraendert bei
**4.55–5.23** (hell) und **7.2–10.13** (dunkel).

---

## 6 · Gegenprobe an vier namentlich genannten

| Substanz | Fall | Reiter | Block |
|---|---|---|---|
| **1-Testosterone** | S1.1-AAS | ja, 5 Reiter | ja |
| **Creatine monohydrate** | `not_prohibited`, langer Text | ja, **vor Quellen** | ja |
| **Semaglutide** | `monitored` | ja | ja |
| **9-Me-BC** | ohne beide Felder | **nein** | **nein** |

`[cmd]` Bei Kreatin lautet die Reihenfolge: *Ueberblick · Dosierung ·
Sicherheit · Fragen 6 · **Rechtslage** · Quellen 2* — genau die Stelle
aus Toms Satz.

**Bilder:** `backup/g195-aas-hell-1280.png`,
`g195-aas-dunkel-1920.png`, `g195-kreatin-hell.png`.

---

## 7 · Negativprobe

`[cmd]` **Datenseite**, in einer zurueckgerollten Transaktion
(1-Testosterone):

| Schritt | `note_de` | `rechtslage` |
|---|---|---|
| vorher | 683 | 178 |
| nach `update … = null` | **leer** | **leer** |
| nach `rollback` | 683 | 178 |

`[cmd]` **Codeseite**, vier Sabotagen, SHA-identischer Rueckbau:

| Sabotage | |
|---|---|
| Felder nicht durchgereicht | **rot** |
| Reiter-Weiche umbenannt | **rot** |
| Block zurueck in den Ueberblick | **rot** |
| Bedingung entfernt (`if (true)`) | **rot** |

`[read]` **Die dritte ist die wichtige:** sie faengt genau den
Rueckfall, den dieser Auftrag beseitigt — den Block an zwei Stellen.

---

## 8 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe | **653 pass, 0 fail** |
| `rechtslage-reiter.test.ts` (neu) | **7 Pruefungen** |
| `tools/serverimport-pruefen.mjs` | 51 Chunks, 0 Treffer |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/encoding-pruefen.mjs` | 20.041 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Der Dev-Server wurde NICHT neu gestartet** — durchgehend **PID
351936**.

**`supabase/_pipeline/` nicht angefasst.**
**Nicht committet, nicht gestaged.**

---

## 9 · Was ich als Befund melde

**a) G-197 bleibt noetig.** Der Umzug loest den Kontrast nicht — der
rosa Tafelgrund ist in beiden Reitern derselbe.

**b) `rechtslage_klartext_de` hing an `heikel`** und war fuer die
Mehrheit unsichtbar. Behoben.

**c) Die Reiterzahl ist bei 63 Substanzen bei sieben, im Vollausbau
acht.** Ob das zu viel ist, ist eine Entscheidung ueber die
Navigation — nicht ueber diesen Reiter.

**d) Die neue Regel hat beim ersten Auftrag drei Abweichungen
gefunden.** `[read]` Zwei davon haetten die Arbeit verzerrt: mit „136
statt 201" waere der Reiter als Randfall erschienen.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/supplements/substanz-reiter.ts` | `rechtslage`-Id, Bedingung, Position |
| `apps/web/src/app/v2/supplements/substanz-tafel.tsx` | Reiterinhalt, Block aus dem Ueberblick, Rechtslage aus der Sicherheit |
| `apps/web/src/lib/supplements/__tests__/rechtslage-reiter.test.ts` | **neu** — 7 Pruefungen |
| `backup/g195-schuss.mjs` | Nachweisskript (Reiter, Hoehe, beide Themen) |
