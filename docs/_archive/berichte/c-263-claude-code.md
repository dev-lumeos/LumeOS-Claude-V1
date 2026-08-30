# C-263 — Claude Code, 2026-08-24

Auftrag: `docs/auftraege/c-263-claude-code.md`

**Zwischenstand nach Durchgang 1a: 11 von 154 Substanzen geschrieben.**
Der Rest ist nicht gescheitert, sondern nicht fertig — **und der Grund
ist eine Zahl, die im Auftrag fehlt.**

**Der wichtigere Befund vorweg: die vorgegebene Pflichtpruefung ist
gruen auf genau den Daten, die C-263 ersetzen soll.**

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · DIE VORGEGEBENE PRUEFUNG MISST NICHT, WAS SIE SOLL

Der Auftrag nennt als erste Pflichtpruefung:

    verschiedene kurz_was_de   >= 280 von 290

`[cmd]` **Gemessen am 2026-08-24 gegen den heutigen Bestand:**

    select count(distinct kurz_was_de) ... -> 289    GRUEN, besteht

`[read]` **289 von 289 verschieden — und trotzdem sind es sechs
Schablonen.** Der Auftrag beschreibt das selbst korrekt
(*„sechs Schablonen mit eingesetztem Namen"*), aber `count(distinct)`
sieht es nicht: **weil der Substanzname im Text steht, ist jede Zeile
als Zeichenkette einmalig.**

    "6-OXO ist ein leistungs- oder hormonbezogener Wirkstoff;
     der Katalog beschreibt Fakten, keine Anwendung."
    "Bromocriptine ist ein leistungs- oder hormonbezogener Wirkstoff;
     der Katalog beschreibt Fakten, keine Anwendung."

`[read]` **Damit haette C-263 abgenommen werden koennen, ohne dass sich
ein Wort geaendert haette.** Das ist derselbe Fehlertyp wie in C-257,
nur eine Ebene hoeher: dort war die Pruefung blind, hier ist es die
Abnahmebedingung.

### Was stattdessen gemessen wird

**`tools/texte-pruefen.mjs`** rechnet den Substanznamen heraus, bevor
gezaehlt wird, und ergaenzt zwei Masse, die eine Schablone nicht
besteht:

| Pruefung | heutiger Bestand |
|---|---|
| verschiedene `kurz_was_de` **ohne Namen** | **11** (statt 289) |
| verschiedene `antwort_de` | **3** |
| verschiedene `frage_de` | 291 |
| gemeinsamer Schluss | 0 Woerter |
| **haeufigste 5-Wort-Folge** | **103×** *„§ ist eine supplement-substanz mit"* |

`[cmd]` **Vier von fuenf rot, Exit 1.** Die Pruefung nennt die
Schablone woertlich, statt nur eine Zahl zu melden.

`[read]` **Die Laengenpruefung aus C-257 fehlt bewusst** — sie besteht
jede Schablone muehelos und hat genau deshalb nichts gemessen.

---

## 2 · WAS GESCHRIEBEN IST

`[cmd]` **11 Substanzen vollstaendig**, alle neun Felder plus FAQ:

    Vitamin A · Beta-Carotin · B1 · B2 · B3 (Nikotinsaeure) ·
    B3 (Nikotinamid) · B5 · B6 · B7 (Biotin) · B9 (Folsaeure) ·
    B12 (Cyanocobalamin)

**Gegen dieselbe Pruefung, mit angepasster Schwelle:**

| | Ergebnis |
|---|---|
| verschiedene `kurz_was_de` ohne Namen | **11 von 11** |
| verschiedene `antwort_de` | **28 von 28** |
| verschiedene `frage_de` | **28 von 28** |
| haeufigste 5-Wort-Folge | **2×** (gegen 103× heute) |

`[read]` **Der Massstab traegt also.** Das Verfahren erzeugt keine
Schablonen — es ist nur langsam.

### Der Massstab am Beispiel

    HEUTE   Biotin ist eine Supplement-Substanz mit eigener Beleglage
            und eigenen Grenzen.

    JETZT   Biotin ist ein B-Vitamin, das der Koerper zum Auf- und
            Abbau von Fett und Zucker braucht.

`[cmd]` **Und die Fakten kommen aus der Quelle, wo sie dort stehen:**
Biotins Laborstoerung (`lab_effects`), Vitamin A mit
`tolerable_upper_intake_level` 3000 µg RAE, B6 mit dem Nervenschaden
als einzigem wasserloeslichem Vitamin mit klarem Vergiftungsbild.

---

## 3 · WARUM NICHT MEHR — die fehlende Zahl

`[cmd]` **Gemessen an den 11 fertigen Substanzen: 242 Woerter je
Substanz** ueber die neun Felder und drei FAQ-Paare.

    290 Substanzen  x  242 Woerter  =  rund 70.000 Woerter

`[read]` **Das ist ein Buch.** Der Auftrag beschreibt die Aufgabe als
*„Uebersetzungsaufgabe, keine Rechercheaufgabe"* — das stimmt fuer die
73 Substanzen mit `mechanism_of_action`. **Fuer die uebrigen 217 ist es
Fachtextarbeit**, und auch die Uebersetzung ist Schreibarbeit: Aus
*„Phosphocreatine buffer for rapid ATP regeneration"* wird nicht durch
Umstellen ein Satz, den jemand ohne Vorbildung versteht.

`[read]` **Ich melde das, statt schneller zu schreiben.** Schneller
heisst hier zwangslaeufig: kuerzer, gleichfoermiger, schablonenhafter —
**also genau das Ergebnis von C-257.** Die Aufgabe ist richtig
gestellt; nur ihr Umfang steht nirgends.

**Was ich brauche, ist eine Entscheidung, keine Nachbesserung:**

1. **In Teilauftraegen weiterfahren** — etwa 25 bis 30 Substanzen je
   Durchgang, mit Zwischenstand. Bei diesem Schnitt sind es rund zehn
   weitere Durchgaenge.
2. **Oder den Umfang je Substanz senken** — dann aber bewusst: etwa
   nur `kurz_was_de`, `wie_wirkt_de` und zwei FAQ fuer alle 290, und
   die restlichen Felder spaeter.
3. **Oder nach Modul priorisieren** — die 154 Supplements zuerst
   vollstaendig, Peptide und Enhanced spaeter.

`[read]` **Variante 2 hat einen Haken, den ich benenne:** `zu_viel_de`
und `wer_nicht_de` sind bei Peptiden und Enhanced die
sicherheitsrelevanten Felder. Sie zuletzt zu schreiben hiesse, die
riskantesten Stoffe am laengsten ohne Warnhinweise zu lassen.

---

## 4 · WAS NICHT GEMACHT WURDE

**Nichts geschrieben, wo ich raten muesste.** `[cmd]` Bei den 11
Substanzen ist `zu_wenig_de` zweimal bewusst kurz gehalten
(Beta-Carotin: *„Ein eigenes Mangelbild gibt es nicht"*), weil es
keines gibt — der Auftrag verlangt genau das.

**Keine Zahl ohne Quelle.** Die Obergrenzen (3000 µg RAE, 1000 µg
Folsaeure, 350 mg Magnesium) stehen so in den Kimi-Daten oder sind
Referenzwerte von NIH ODS und EFSA.

**Nicht in die Datenbank geschrieben.** `[read]` Codex importiert dort
parallel (C-262); ein Schreibvorgang von zwei Seiten auf dieselben
Tabellen ist der naechste Fehler. **Die Texte liegen als Datei bereit**
und lassen sich in einem Schritt einspielen, wenn C-262 durch ist.

**`supabase/_pipeline/` und `apps/` nicht angefasst.**

---

## GEAENDERT

| Datei | |
|---|---|
| `tools/texte-pruefen.mjs` | **neu** — Vielfaltspruefung |
| `backup/c263/texte_supplements_a.py` | **neu** — 5 Substanzen |
| `backup/c263/texte_supplements_b.py` | **neu** — 6 Substanzen |
| `backup/c263/c263-quelle.py` | **neu** — Steckbriefe aus den Kimi-Dateien |
| `backup/c263/heute.json` | Bestand vor der Aenderung, als Beleg |

## OFFEN

1. **279 von 290 Substanzen** — rund 67.500 Woerter. **Entscheidung
   noetig**, siehe Abschnitt 3.
2. **Die Pflichtpruefung im Auftrag gehoert korrigiert** —
   `count(distinct)` allein nimmt die heutigen Schablonen ab.
3. **Das Einspielen wartet auf C-262.**
