# G-191 — Die Mengen-Kachel zeigte eine Begruendung statt einer Menge

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

Der Befund stimmt, und er war groesser als beschrieben. **Ein Fehler in
drei Auspraegungen — und ein zweiter daneben, den der Auftrag nicht
kannte.**

`[cmd]` **Gemessen ueber die 412 Katalogzeilen, gegen die alte
Anzeigefunktion simuliert:**

| | vorher | nachher |
|---|---|---|
| Menge · Statuscode | **250** | **0** |
| Menge · echter Wert | 8 | **107** |
| Obergrenze · Statuscode | **241** | **0** |
| Obergrenze · echter Wert | **0** | 1 |

`[read]` **Die Obergrenze-Kachel hat noch nie einen richtigen Wert
gezeigt** — 0 von 412. Das stand in keinem Auftrag.

`[read]` **Und die Menge stieg von 8 auf 107 echte Werte**, weil ein
zweiter Fehler mitbehoben wurde: auch bei gefuelltem `value` war die
Anzeige falsch.

---

## 1 · Die Ursache, genau benannt

`[cmd]` `substanz-tafel.tsx` las beide Felder mit `jsonWert`. Deren
letzter Zweig lautete:

```ts
const teile = Object.values(o).map(jsonWert).filter(Boolean)
return teile.length ? teile.join(' · ') : null
```

**Bei `value: null` verkettete sie alle uebrigen Objektwerte** — also
`missing_reason` und `provenance_type`. Genau das stand in der Kachel:

> *„No validated clinical guideline dose (…) · CLINICAL_GUIDELINE"*

`[cmd]` **`Testosterone Enanthate` sah gut aus, weil beide Felder dort
NULL sind** — bestaetigt, nicht besser gepflegt.

### Der zweite Fehler: auch gefuellte Werte waren falsch

`[cmd]` `value` ist bei `studied_dose_ranges` ein **Array
strukturierter Spannen** (`min`, `max`, `units`, `duration`,
`population`, `route_form`). Die alte Funktion flachte auch das ein:

> Beta-Carotin → *„50 · 15 · mg/day · years (ATBC 20 mg; …)"*

**Das sind zusammenhanglose Zahlen** — `min`, `max`, `units` und
`duration` hintereinandergeschrieben. `spanneText` setzt jetzt
`20–30 mg/day` daraus zusammen.

`[read]` **Deshalb der Sprung von 8 auf 107.** Die 99 zusaetzlichen
Werte waren immer da; sie wurden nur unlesbar dargestellt.

---

## 2 · Punkt 2: Abbildung, nicht Nachforderung

**Entscheidung: Abbildung in der Anzeige.** Die Messung, die dahinter
steht:

`[cmd]` **857 belegte Gruende ueber alle vier Felder — aber nur 16
verschiedene.** Die acht haeufigsten decken **836 von 857 (97,6 %)**:

| n | Grund |
|---|---|
| 272 | No validated clinical guideline dose (…) |
| 154 | Manufacturer serving sizes are product-specific (…) |
| 104 | UL concept applies to nutrients (IOM/EFSA DRI) (…) |
| 75 | NOT_APPLICABLE: no regulatory UL concept for unapproved (…) |
| 74 | NO_RELIABLE_EVIDENCE: no reliable human dose-finding (…) |
| 61 | NOT_APPLICABLE: UL is a nutrient DRI concept (…) |
| 50 | NOT_APPLICABLE: no approved medicinal product label (…) |
| 46 | NOT_APPLICABLE: no approved label for this peptide (…) |

**Warum Abbildung:**

- **Es sind acht Saetze, keine 272.** Eine Nachforderung mit Wartezeit
  fuer etwas, das hier eine Tabelle ist.
- **Der Grund ist ein Zustand, keine Inhaltsangabe.** *„Es gibt keine
  Leitliniendosis"* sagt etwas ueber den Forschungsstand, nicht ueber
  die Substanz — er aendert sich nicht je Eintrag.
- **Kein Text wird geaendert.** Die Spalte bleibt englisch; uebersetzt
  wird bei der Anzeige (Auftrag: *„Keine Texte aendern"*).

### Was bewusst englisch bleibt — ein Befund

`[cmd]` **5 Belege bleiben unuebersetzt**, und das ist Absicht:

| Substanz | Grund |
|---|---|
| Beta-Carotin | *„IOM set no UL; high-dose supplements (20-30 mg/d) increased lung cancer in smokers (ATBC/CARET)"* |
| L-Tryptophan | *„historical EMS outbreak linked to contaminated tryptophan (1989)"* |
| Natrium | *„NASEM 2019 CDRR: reduce intake if >2300 mg/day"* |
| Chrom (2×) | *„IOM: no UL for chromium (insufficient data)"* |

`[read]` **Das sind substanzeigene Saetze mit echter
Sicherheitsinformation.** Eine Abbildung auf *„Keine Obergrenze
festgelegt"* wuerde die Lungenkrebs-Beobachtung und den
EMS-Ausbruch **loeschen**. Sie stehen unveraendert da.

**Das gehoert als Punkt gemeldet:** vier deutsche Uebersetzungen bei
Kimi nachfordern ist sinnvoll — aber als Inhalt, nicht als Anzeige.

---

## 3 · Wo die Angabe jetzt steht — und wo nicht

`[cmd]` **Der Auftrag nennt „die Kachel". Es sind zwei Bauteile**, und
nur eines davon steht auf dem Dosierungs-Reiter:

- **`Zahlenkacheln`** (grosse Zahl, 196 px) — **hier steht der Grund
  NICHT.**
- **`Zahlenkasten`** („Weitere Angaben") — **hier steht er.**

`[read]` **Mein erster Entwurf setzte einen Strich in die Zahlenkachel
und den Grund als Hinweis darunter. Das war falsch**, und die eigene
Datei sagt es: `substanz-kacheln.ts:30` — *„Was nicht drinsteht,
bekommt keine Kachel."* Ein Strich in einer Kachel, die auf eine Zahl
hin gelesen wird, **sieht aus wie eine Angabe**. Zurueckgebaut.

`[cmd]` **`DreiKacheln` wird nur von Tests aufgerufen**, nicht vom
Produkt — dieselbe Falle wie in G-187. Es ist trotzdem mitgeaendert
(feste Breite statt `1fr`), damit die beiden Fassungen nicht
auseinanderlaufen.

---

## 4 · Punkt 3: die Breite — am Bild gefunden, nicht im Test

**Hier hat die automatische Pruefung zweimal versagt, und das Bild hat
es gefunden.**

`[cmd]` **Erster Durchgang:** `statuscode_sichtbar: false`,
`ueberlauf: []` — alles gruen. **Im Bild war der Satz am rechten Rand
abgeschnitten:** *„…für Nährstoffe — für di…"*

`[read]` **`scrollWidth > clientWidth` schlug nicht an**, weil der Text
im eigenen Kasten umbrach und **erst die Tafel ihn beschnitt.** Die
Pruefung misst jetzt zusaetzlich gegen den Tafelrand.

`[cmd]` **Zweiter Durchgang:** Satz bricht um, beginnt aber weit rechts
und laeuft bis an den Rand — `max-width: 46ch` griff nicht, weil die
Flexzeile ihm den Restplatz zuwies.

`[read]` **Die Ursache war die Zeilenform selbst.**
`.v2-supp-kasten-wert` ist rechtsbuendig, fett, `tabular-nums` — die
Datei sagt es im Kommentar: *„fuer ZAHLEN gedacht"*. **Beschriftung
links, Wert rechts ist eine Zahlenzeile.** Ein Satz braucht die
Beschriftung **darueber**: bei einer Grund-Zeile steht sie jetzt
oben, der Satz linksbuendig darunter.

**Das ist die G-181-Regel, die fuer Zahlenkacheln nie galt — weil dort
nie Text stand.**

---

## 5 · Punkt 4: die uebrigen Felder

`[cmd]` **Gemessen, welche wirklich Objekte sind:**

| Feld | gefuellt | Objekt | mit Wert | nur Grund |
|---|---|---|---|---|
| `guideline_dose` | 290 | 290 | 18 | **272** |
| `upper_limit` | 262 | 262 | 13 | **249** |
| `official_label_dose` | 290 | 290 | 40 | **250** |
| `studied_dose_ranges` | 482 | 206 | 120 | 86 |

**Drei Korrekturen an den Auftragszahlen:**

1. **`upper_limit` hat 13 Werte, nicht 3** — und 249 Gruende, nicht
   287.
2. **`frequency` und `duration_studied` sind KEINE Objekte.** Es gibt
   sie so nicht: die Spalten heissen `frequency_de/_en/_th` und
   `duration_studied_de/_en/_th` und sind Text. **Nicht betroffen.**
3. **`studied_dose_ranges` ist gemischt:** 206 Objekte, **276 leere
   Arrays** (`[]`). Die Arrays waren nie das Problem.

`[cmd]` **`official_label_dose` ist mitbetroffen (250 Gruende), wird
aber heute nirgends angezeigt** — kein Aufrufer im Lesepfad. **Die
Lesefunktion behandelt es korrekt, sobald jemand es anzeigt.**

---

## 6 · Nachweise

### Die vier namentlich genannten

`[cmd]` Ueber die echte `dosisFelder`, nicht nachgebaut:

| Substanz | Menge | Obergrenze |
|---|---|---|
| **Astaxanthin** | *Keine Leitlinie nennt eine Dosis.* | *Eine Obergrenze gibt es nur für Nährstoffe — für diesen Stoff keine.* |
| **GHK-Cu** | *Keine Leitlinie nennt eine Dosis.* | *Für Peptide gibt es keine Obergrenze.* |
| **Drostanolone enanthate** | *Keine Leitlinie nennt eine Dosis.* | *Für nicht zugelassene Wirkstoffe gibt es keine Obergrenze.* |
| **Testosterone Enanthate** | **null / null** | **null / null** |

**Testosterone Enanthate unveraendert**, wie gefordert.

### Negativprobe

`[cmd]` **Datenseite**, in einer zurueckgerollten Transaktion —
Vitamin D2 (ergocalciferol), das einen echten Wert traegt:

| Schritt | `value` |
|---|---|
| vorher | *„Endocrine Society 2011: 1500-2000 IU/day…"* |
| nach `update … = null` | **leer** → Kachel verschwindet |
| nach `rollback` | wieder da |

`[read]` **Eine Einschraenkung, gemessen:** Vitamin D2 hat **keinen**
`missing_reason` (`hat_grund: f`). Die Kachel verschwindet also, **der
Hinweis erscheint nicht** — richtig so, es wird kein Grund erfunden.
Der Hinweis erscheint nur, wo einer hinterlegt ist.

`[cmd]` **Codeseite**, zwei Sabotagen, SHA-identischer Rueckbau:

| Sabotage | |
|---|---|
| `dosisFelder(d)` → `dosisFelderX(d)` | **rot** |
| alten `Object.values(o)`-Rueckfall zurueck | **rot** |

### Am Bild, beide Breiten

`[cmd]` `test-user@lumeos.local`, Astaxanthin aufgeklappt,
Dosierungs-Reiter:

| | 1280 | 1920 |
|---|---|---|
| Statuscode sichtbar | **nein** | **nein** |
| englischer Satz | **nein** | **nein** |
| deutscher Grund | **ja** | **ja** |
| Ueberlauf / Beschnitt | **keiner** | **keiner** |

Bilder: `backup/g191-1280.png`, `backup/g191-1920.png`.

`[cmd]` **2 Konsolenfehler** — die bekannte `data-mode`-Warnung des
Wurzel-Layouts plus die der Anmeldeseite, nicht aus diesem Umbau.

---

## 7 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe (`.ts` + `.tsx`) | **625 pass, 0 fail** |
| `dosis-feld.test.ts` (neu) | **11 pass**, davon 1 Verdrahtungswaechter |
| `tools/serverimport-pruefen.mjs` | 51 Chunks, 0 Treffer |
| `tools/sprachrueckfall-pruefen.mjs` | 12 Abfragen, 0 ohne Rueckfall |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/encoding-pruefen.mjs` | **19.998 Dateien, sauber** |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Der Dev-Server wurde NICHT neu gestartet.** `[cmd]` Er laeuft auf
**PID 351936**, nicht auf der im Auftrag genannten 343416 — er ist
zwischenzeitlich von selbst neu gestartet. Antwortzeit 0,1 s, ein
einziger Prozess auf 3200.

**Nicht angefasst:** `supabase/_pipeline/` (Codex).
**Nicht committet, nicht gestaged.**

---

## 8 · Was ich als Befund melde

**a) `jsonWert` ist geloescht, nicht auskommentiert.** `[read]` Nach
G-163: eine Funktion, die falsche Werte erzeugt, ist als Rueckfall
schlechter als keine. Wer ein Dosisfeld liest, nimmt `dosisFelder`.

**b) Vier deutsche Gruende bei Kimi nachfordern** — Beta-Carotin,
L-Tryptophan, Natrium, Chrom. **Nicht als Anzeigeproblem, sondern als
Inhalt:** sie tragen Sicherheitsinformation, die keine Abbildung
ersetzen darf.

**c) `official_label_dose` ist gleich kaputt, aber unsichtbar** — 250
Gruende, kein Aufrufer. Wer es anzeigt, bekommt es jetzt richtig.

**d) Die automatische Pruefung hat den Beschnitt nicht gefunden.**
`[read]` `scrollWidth > clientWidth` misst nur den eigenen Kasten. **Es
brauchte das Bild.** Die Pruefung misst jetzt auch gegen den
Tafelrand — aber die Lehre bleibt: **bei Layout ist der Blick aufs
Bild kein Zusatz, sondern die Pruefung.**

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/supplements/dosis-feld.ts` | **neu** — Wert und Grund trennen, 10 Gruende auf Deutsch |
| `apps/web/src/lib/supplements/__tests__/dosis-feld.test.ts` | **neu** — 11 Pruefungen inkl. Verdrahtung |
| `apps/web/src/app/v2/supplements/substanz-tafel.tsx` | `zahlenAus` liest ueber `dosisFelder`; `jsonWert` geloescht; `Zahlenkasten` zeigt Gruende |
| `apps/web/src/lib/supplements/substanz-reiter.ts` | `Zahlen` traegt `mengeGrund`, `obergrenzeGrund` |
| `apps/web/src/lib/supplements/substanz-kacheln.ts` | Begruendung, warum der Grund KEINE Zahlenkachel bekommt |
| `apps/web/src/app/v2/supplements/substanz-abschnitte.tsx` | `DreiKacheln` mit Gruenden und fester Breite |
| `apps/web/src/app/v2/supplements/supplements.css` | `.v2-supp-kasten-grund`, Dosis-Kacheln, Breitengrenzen |
| `backup/g191-schuss.mjs` | Nachweisskript (Beschnitt-Pruefung) |
