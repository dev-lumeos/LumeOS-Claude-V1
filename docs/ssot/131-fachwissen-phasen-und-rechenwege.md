# 131 · Fachwissen — Phasen, Rechenwege, Grenzwerte

`[cmd]` Stand 2026-09-29, 17:00. **Maßgeblich ist
*Professional Bodybuilding Encyclopedia v2.0*** — sie ist eine
vollständige Neufassung und löst die vier Vorfassungen desselben Tages ab.
Wo diese Datei früher Bänder nannte, stehen jetzt die Einzelwerte aus v2.0.

---

## GELTUNG — zuerst lesen

**Tom, 2026-09-29, 16:15:** *„das sind keine ssot daten, die quelle kennt
lumeos nicht und sagt nur wie es das bauen wuerde."*

`[read]` **Diese Datei ist Fachwissen, keine Festlegung.** Nichts hier gilt,
weil es hier steht. Was gilt, entscheidet ein Punkt mit Abnahme oder Tom.

Die Rangfolge aus `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`
bleibt: **Vorgängerrepo (Rechenwege) → Designvorlage (Umfang) → Spec
(Absicht).** Diese Quelle steht **unter** allen drei.

**Die Grundentscheidung von v2.0, und sie deckt sich mit Toms Einwand:**

> *Basis: Gesamtkörpergewicht. Kein LBM nötig. KFA optional für Feintuning
> (5 Kategorien).*

**Tom, 16:19:** *„niemand kennt seine magermasse."* `[cmd]` v2.0 nennt LBM
im Glossar ausdrücklich `not used in calculations`.

### Fundstellen

Die Quelle liegt als Anhang am Gespräch vom 2026-09-29, nicht im Repo.
Abschnittsnummern in dieser Datei verweisen auf v2.0. `[read]` **Eine Zahl
ohne Abschnittsnummer ist ein Fehler dieser Datei.**

Zitierte Primärquellen: Helms et al. 2014 (JISSN 11:20) · Iraki et al. 2019
(Sports 7(7)) · Garthe et al. 2011 (IJSNEM 21(2)) · Pasiakos et al. 2013 ·
Trexler et al. 2014 · Byrne et al. 2018 (MATADOR) · Roberts et al. 2020 ·
Chappell et al. 2018.

---

## 1. Die acht Phasen von v2.0 gegen unsere 17 Strategien

`[cmd]` **v2.0 kennt acht Phasen** (Abschnitt 9.1), `goals.goal_strategies`
trägt **17 Strategien**. Das ist kein Widerspruch, sondern eine andere
Schnittweite — aber die Zuordnung ist nötig, bevor ein Wert übernommen wird:

| v2.0-Phase | unsere Strategie(n) |
|---|---|
| Off-Season | `gain`, `clean_bulk`, `aggressive_bulk` |
| Lean Bulk | `lean_bulk` |
| Recomp | `body_recomp`, `maintain`, `maintenance_diet_break` |
| Cut | `lose`, `conservative_cut`, `moderate_cut`, `aggressive_cut`, `mini_cut` |
| Contest Prep Early/Mid/Late | `contest_prep` — **eine Zeile für drei Stufen** |
| Peak Week | `peak_week` |
| Reverse Diet | `reverse_diet` |

`[read]` **Zwei Stellen passen nicht:**

**Fünf Cut-Varianten, ein v2.0-Wert.** v2.0 nennt für Cut pauschal −20 %
und 2,2 g/kg Protein. Unsere fünf unterscheiden sich in der Rate
(`aggressive_cut` −1,0 %/Woche gegen `conservative_cut`). **Der v2.0-Wert
ist der Mittelwert, nicht die Spanne** — er ersetzt unsere Differenzierung
nicht, er prüft sie.

**Wettkampfvorbereitung ist drei Phasen.** Das ist der Kern:

| Stufe | Kalorien | Protein | Fett | Cardio |
|---|---|---|---|---|
| Early | × 0,85 (−15 %) | 2,2 g/kg | 0,8 g/kg | 3–4× 30–40 min LISS |
| Mid | × 0,78 (−22 %) | 2,4 g/kg | 0,7 g/kg | 4–6× 40 min |
| Late | × 0,70 (−30 %) | 2,6 g/kg | 0,6 g/kg | 5–7× 40–45 min + HIIT |

`[cmd]` **Live steht eine Zeile mit `tdee_modifier −0,25` und
`protein_per_kg 2,50`.** Drei Stufen lassen sich damit nicht abbilden — das
ist der Befund hinter **G-530** und der Grund, warum `sub_phases` mehr als
eine Textliste sein muss.

---

## 2. Rechenwege (v2.0, Abschnitte 1.3, 3.1, 13.1)

### 2.1 Grundumsatz und Gesamtumsatz

    Mifflin-St Jeor, Männer:  10×kg + 6,25×cm − 5×Alter + 5
    Mifflin-St Jeor, Frauen:  10×kg + 6,25×cm − 5×Alter − 161

    TDEE = BMR × Aktivitätsmultiplikator
      sedentär 1,2 · leicht 1,375 · mäßig 1,55
      sehr aktiv 1,725 · extrem 1,9
      Bodybuilder-Anpassung: +0,05 bis +0,15 je nach Cardio und Beruf

`[cmd]` Derselbe Weg wie im Vorgängerrepo (`calculateTDEE.ts`, gemessen in
G-510), inklusive Aktivitätsmultiplikator.

### 2.2 Makros

    Protein  Gewicht × Phasenfaktor × KFA-Faktor
    Fett     Gewicht × Phasenfaktor, mindestens Gewicht × Phasenminimum
    Carbs    (kcal − Protein×4 − Fett×9) / 4        Restgröße

### 2.3 Kalorien je Cardiominute — aus dem Gewicht (5.1)

    LISS   0,10 × kg pro Minute       90 kg: 9,0 kcal/min
    MISS   0,12 × kg pro Minute       90 kg: 10,8 kcal/min
    HIIT   0,15 × kg pro Minute       90 kg: 13,5 kcal/min + Nachbrennen

`[read]` **Das ist die Formel, die eine Pauschaltabelle ersetzt** — ein
70-kg- und ein 110-kg-Nutzer verbrennen in derselben Stunde nicht dasselbe.

---

## 3. Die Werte je Phase (v2.0, Abschnitte 1.4, 3.1, 4.1, 4.2, 5.2)

### 3.1 Kalorien, Protein, Fett

| Phase | Kalorien | Protein g/kg | Fett g/kg | Fett-Minimum |
|---|---|---|---|---|
| Off-Season | × 1,15 | 1,8 | 1,0 | 0,6 |
| Lean Bulk | × 1,10 | 2,0 | 0,9 | 0,6 |
| Recomp | × 1,00 | 2,0 | 0,9 | 0,6 |
| Cut | × 0,80 | 2,2 | 0,8 | 0,6 |
| Contest Prep Early | × 0,85 | 2,2 | 0,8 | 0,6 |
| Contest Prep Mid | × 0,78 | 2,4 | 0,7 | 0,5 |
| Contest Prep Late | × 0,70 | 2,6 | 0,6 | 0,5 |
| Peak Week | variabel | 2,0 | 0,4 | 0,4 |
| Reverse Diet | × 0,90 → 1,0 | 1,8 | 1,0 | 0,6 |

### 3.2 Die KFA-Kategorie als Feinjustierung (1.2, 1.4, 3.1)

    Männer   very_low <10 % · low 10-15 % · moderate 15-20 %
             high 20-25 % · very_high >25 %
    Frauen   very_low <18 % · low 18-22 % · moderate 22-27 %
             high 27-32 % · very_high >32 %

    auf das Protein     very_low ×1,15 · low ×1,05 · moderate ×1,00
                        high ×0,95 · very_high ×0,90
    auf die Kalorien    very_low −5 % · low 0 · moderate 0
                        high −3 % · very_high −5 %

`[read]` **Die Proteinreihe ist begründet** (Muskelschutz bei wenig
Reserve). `[annahme]` **Die Kalorienreihe ist es nicht:** −3 und −5 % bei
*hohem* Körperfett steht als *„konservativer"* ohne Begründung und
widerspricht Helms — wer mehr Reserve hat, kann schneller abnehmen. **Nicht
übernehmen, ohne dass Tobias es bestätigt** (G-552).

### 3.3 Schätzung ohne Messung — US Navy (1.2)

    Männer  KFA% = 86,010 × log10(Taille − Hals)
                 − 70,041 × log10(Größe) + 36,76
    Frauen  KFA% = 163,205 × log10(Taille + Hüfte − Hals)
                 − 97,684 × log10(Größe) − 78,387

`[cmd]` Taille, Hals und Hüfte erfasst LumeOS bereits. **Damit braucht die
Feinjustierung keine neue Eingabe** — nur zwei vorhandene Maße.

### 3.4 Trainingsvolumen, Sätze je Muskelgruppe und Woche (4.1)

| Erfahrung | Off-Season | Lean Bulk | Cut | Contest Prep | Peak Week |
|---|---|---|---|---|---|
| beginner | 10 | 11 | 8 | 7 | 3 |
| intermediate | 14 | 15 | 12 | 10 | 4 |
| advanced | 18 | 20 | 15 | 13 | 5 |
| elite | 22 | 24 | 18 | 15 | 6 |

    Recovery-Anpassung  <50 ×0,70 · 50-65 ×0,85 · 65-85 ×1,00 · >85 ×1,05
    Intensität % 1RM    Off-Season 70-85 · Lean Bulk 75-90 · Cut 75-90
                        Prep Early 75-88 · Mid 78-92 · Late 80-95
                        Peak Week 50-65
    Split               3 Tage Ganzkörper · 4 Upper/Lower
                        5 PPL+UL · 6 PPL · 7 PPL+Schwachstellen

### 3.5 Cardio je Phase (5.2)

| Phase | Einheiten/Woche | Minuten | Typ |
|---|---|---|---|
| Off-Season | 0–2 | 20–30 | LISS |
| Lean Bulk | 2–3 | 30 | LISS |
| Cut | 3–5 | 30–40 | LISS/MISS |
| Contest Prep Early | 3–4 | 30–40 | LISS |
| Contest Prep Mid | 4–6 | 40 | LISS/MISS |
| Contest Prep Late | 5–7 | 40–45 | LISS + HIIT |
| Peak Week | 2–3 | 20 | LISS |

    Kohlenhydratausgleich  +2 g Carbs je 10 min Cardio (nur bei
                           Präferenz "high") — 300 min/Woche = +60 g/Tag

---

## 4. Erholung, Übergänge, Alarme

### 4.1 Erholungsbewertung, 0 bis 100 (7.1)

    Schlaf     30  7-9 h gut 30 · 6-7 h oder mittel 22
                   5-6 h oder schlecht 15 · <5 h 5
    HRV        30  >100 % Baseline 30 · 90-100 % 25 · 80-90 % 20
                   70-80 % 10 · <70 % 5
    Stress     20  1-3 → 20 · 4-6 → 15 · 7-8 → 10 · 9-10 → 5
    Muskelkater 20 1-2 → 20 · 3-4 → 15 · 5-6 → 10 · 7+ → 5

`[cmd]` **LumeOS hat `recovery.scores` und `recovery.score_contributions`
live.** Ob die Gewichtung dieselbe ist, ist nicht geprüft — **G-552**.

### 4.2 Anpassung nach Erholungswert (7.2)

| Wert | Training | Cardio | Ernährung | Ergänzung |
|---|---|---|---|---|
| <50 | Volumen −30 % | −50 % | Refeed einlegen | Ashwagandha, Melatonin |
| 50–65 | Volumen −15 % | halten | halten | Magnesium |
| 65–85 | halten | halten | halten | halten |
| >85 | +10 % Volumen | mehr möglich | halten | halten |

### 4.3 Phasenübergänge mit Auslöser (9.2)

    Off-Season  -> Lean Bulk    KFA >15 % (M) / >22 % (F)
    Lean Bulk   -> Cut          Zielgewicht ODER KFA >18 % / >25 %
    Cut         -> Contest Prep Wettkampfdatum steht, 16-20 Wochen vorher
    Prep        -> Peak Week    7-10 Tage vor der Show
    Peak Week   -> Reverse Diet Show beendet

`[read]` **Die ersten beiden Auslöser brauchen den Körperfettanteil**, und
damit die Kategorie oder die Navy-Schätzung aus 3.3. Ohne sie kann der
Übergang nicht vorgeschlagen werden — er wäre eine reine Datumsfrage.

### 4.4 Alarmschwellen (11.3) und medizinische Grenzen (8.1)

    Gewichtsverlust >2 %/Woche      warning
    Kraftverlust >15 %              critical
    Schlaf <5 h an 3+ Tagen         warning
    HRV <70 % an 5+ Tagen           critical

    Blutdruck systolisch >160 · diastolisch >100   critical
    Ruhepuls >100                                   warning
    ALT/AST >100 U/L                                critical
    Kreatinin >1,5 mg/dL · eGFR <60                 warning
    Hämatokrit >55 % · Hämoglobin >18 g/dL          critical
    Brustschmerz · starke Kopfschmerzen ·
    Sehstörungen · Kurzatmigkeit                    emergency

`[read]` **Die obere Gruppe sind Steuergrößen**, die untere sind
**medizinische Aussagen** — sie gehören ins Medical-Modul mit dessen
Belegpflicht (C-183, C-204), nicht als Textzeile an eine Strategie. Medical
hat einen eigenen Biomarker-Katalog mit Evidenzeinstufung; Werte aus einer
Sekundärquelle nachzutragen würde ihn verwässern.

### 4.5 Fehlersuche (12.1)

    Gewicht stagniert      metabolische Adaption  -> Diätpause 1-2 Wochen
    zu schneller Verlust   Defizit zu groß        -> +200-300 kcal
    Kraftverlust           Muskelverlust, CNS     -> Refeed, Deload
    Schlaf schlecht        Cortisol, Hunger       -> Carbs abends
    Wasserretention        Cortisol, Natrium      -> Konsistenz
    Libido weg             Hormonabfall           -> Fett erhöhen, Pause
    Plateau                Adaption               -> Refeed, Cardiowechsel

---

## 5. Peak Week (v2.0, Abschnitt 10)

    Tag -10 bis -7   Wasser 8-10 L   Natrium 5-8 g
    Tag  -6 bis -4   Wasser 6-8 L    Natrium 4-6 g
    Tag  -3 bis -2   Wasser 4-5 L    Natrium 2-3 g
    Tag  -1          Wasser 2-3 L    Natrium 1-2 g
    Showtag          nach Durst      normal

    Front-Load   -5: 2 g/kg · -4: 3 · -3: 4 · -2: 5-6 · -1: 3-4 · Show 1-2
    Back-Load    Entleerung 0,5-1 g/kg bis -4, dann 5 · 7-8 · 4-5 · 2-3

    Training     -7 hoch (20+ Sätze) bis -1 Ruhe, Intensität fallend
    Nie          neues Essen · viel Wasser auf einmal · NSAIDs

`[cmd]` **Peak Week rechnet in der anderen Richtung:** Kohlenhydrate pro
Kilogramm sind die **Vorgabe**, die Kalorien das **Ergebnis**. Bei uns sind
Kohlenhydrate die Restgröße — **das ist G-549**.

---

## 6. Was ausdrücklich nicht übernommen wird

`[cmd]` **v2.0 Abschnitt 6.3 bis 6.5 — Peptidprotokolle.** Elf Wirkstoffe
mit Dosierung, Timing, Dauer, Stapelung, Injektionsort, Nadelstärke und
Rekonstitution: BPC-157, TB-500, CJC-1295 (DAC und no-DAC), Ipamorelin,
GHRP-6, GHRP-2, HGH-Fragment 176-191, AOD9604, IGF-1 LR3, MGF, Melanotan 2,
PT-141.

**Und Abschnitt 9.1 empfiehlt sie je Phase** — CJC+IPA+IGF im Off-Season,
CJC+IPA+Fragment im Cut, dazu MT2 in der Wettkampfvorbereitung, `Stop` in
der Peak Week.

`[read]` **Das ist die „ausliefern"-Richtung, und sie ist nicht
entschieden.** LumeOS **erfasst** heute Medikamente verschlüsselt (C-285),
hat einen Medikamentenkatalog (C-506) und ein Datenmodell für
Injektionsstellen (C-385). Eine Dosierung **auszuliefern, weil eine Phase
sie vorsieht**, ist eine andere Kategorie mit rechtlicher Seite. **Das ist
G-546 und liegt bei Tom.**

**Solange G-546 offen ist:** kein Katalogeintrag trägt eine Substanz, und
in Goals erscheint keine.

`[cmd]` **Nicht übernommen, weil Medical es besser hat:** die
Blutwert-Referenzbereiche und der Bluttest-Zeitplan (8.2). Der
Biomarker-Katalog trägt Evidenzeinstufungen (C-180, C-183, C-204).

`[cmd]` **Nicht übernommen, weil ohne Begründung:** die Kalorien-Senkung bei
*hohem* Körperfett (3.2).

`[cmd]` **Nicht übernommen, weil wir eine bessere Quelle haben:** die
Lebensmitteltabelle (13.2). Der BLS-Katalog hat 300+ Nährstoffe je Eintrag.

---

## 7. Wohin das gegangen ist

| Befund | Punkt | Stand |
|---|---|---|
| Zielrate in Prozent pro Woche | G-542 | entschieden |
| Wettkampfvorbereitung als drei Stufen | G-530, G-545 A1 | offen |
| drei Proteinfaktoren außerhalb | G-545 A7 | vorbereitet |
| Fett als g/kg mit Minimum statt Prozentsatz | **G-550** | neu |
| Höchstdauer `moderate_cut` | G-548 | bei Tobias |
| Protein und Fett in der Ladewoche | G-549 | bei Tobias |
| Peptide — erfassen oder empfehlen | G-546 | bei Tom |
| Cardio fehlt als Modul ganz | **G-551** | neu |
| Trainingsvolumen und Erholung je Phase | **G-552** | neu |
| persönliche Untergrenze am Ziel | G-547 | offen |
| Rate statt Faktor in der Rechnung | G-543 | vorbereitet |

`[read]` **Nicht in einem Punkt, weil es einen anderen Modulstand braucht:**
Mahlzeitenverteilung (3.2), Nährstofftiming (3.3), die
Trainingstechniken (4.4 — Myo-Reps, Rest-Pause, Cluster), der
Schlafoptimierungs-Ablauf (7.3). Alles vier ist beschrieben und keines
blockiert die Goals-Grundlagen.
