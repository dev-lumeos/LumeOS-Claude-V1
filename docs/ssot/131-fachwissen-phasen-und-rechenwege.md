# 131 · Fachwissen — Phasen, Rechenwege, Grenzwerte

`[cmd]` Erstellt 2026-09-29 aus vier Dokumenten, die Tom am selben Tag
beigebracht hat.

---

## GELTUNG — zuerst lesen

**Tom, 2026-09-29, 16:15:** *„das sind keine ssot daten, die quelle kennt
lumeos nicht und sagt nur wie es das bauen wuerde."*

`[read]` **Diese Datei ist Fachwissen, keine Festlegung.** Sie sammelt, was
aus den vier Dokumenten verwertbar ist, und nennt je Aussage die Herkunft.
**Nichts hier gilt, weil es hier steht.** Was gilt, entscheidet ein Punkt
mit Abnahme oder eine Entscheidung Toms.

Die Rangfolge aus `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`
bleibt unberuehrt: **Vorgaengerrepo (Rechenwege) → Designvorlage (Umfang) →
Spec (Absicht).** Diese Dokumente stehen **unter** allen drei — sie sind
Sekundaerliteratur, die Primaerquellen zitiert.

### Die vier Quellen

    A  Professional Bodybuilding Encyclopedia - Contest Prep Protocol
    B  Formelsammlung BMR/TDEE/Phasen
    C  Contest Prep - das wissenschaftliche Framework
    D  Goal System Architecture (Ansatzdokument) + Protein-Nachtrag

**Alle vier liegen als Anhang am Gespraech vom 2026-09-29**, nicht im Repo.
Wer eine Zahl braucht, holt sie dort. `[read]` **Eine Zahl ohne Fundstelle
in dieser Datei ist ein Fehler dieser Datei.**

### Zitierte Primaerquellen

    Helms et al. 2014, JISSN 11:20    natural contest prep
    Helms et al. 2015                  Fortsetzung
    Iraki et al. 2019, Sports 7(7)     off-season
    Garthe et al. 2011, IJSNEM 21(2)   Rate und Magermasse
    Pasiakos et al. 2013               Proteolyse bei niedrigem KFA
    Trexler et al. 2014, JISSN 11:7    metabolische Adaption
    Byrne et al. 2018, Int J Obes 42   MATADOR, intermittierende Diaet
    Roberts et al. 2020 · Chappell et al. 2018

---

## 1. Was LumeOS davon schon hat

`[cmd]` Bevor etwas uebernommen wird — der Stand am 2026-09-29:

| Gegenstand | Wo | Stand |
|---|---|---|
| Rate↔kcal-Identitaet | E-1, `11 × Rate × Gewicht` | gilt, gemessen |
| Mifflin-St Jeor mit Aktivitaetsfaktor | Vorgaengerrepo, G-510 | gemessen |
| Kohlenhydrate als Restgroesse | `berechne_zielwerte` | live |
| Anpassungsregeln und Uebergangswaechter | G-520 | gebaut, Vorschlagsfunktionen |
| 17 Strategien mit Faktor, Rate, Makros | `goals.goal_strategies` | live, Werte duenn (G-545) |
| Koerpermasse, Magermasse, KFA, FFMI | `goals.body_measurements` | 362 Zeilen |
| Biomarker mit Referenzbereichen | Medical, C-183/C-204 | eigener Katalog |
| Adaptiver TDEE | `goals.tdee_history`, G-523 | live |

---

## 2. Rechenwege

### 2.1 Grundumsatz — Mifflin-St Jeor bleibt

`[read]` Die Quellen nennen Katch-McArdle als Bodybuilder-Vorzug
(`370 + 21,6 × Magermasse`, A 1.2, B). **Fuer LumeOS nicht verwendbar:**
er braucht die Magermasse, und die braucht den Koerperfettanteil.

**Tom, 2026-09-29:** *„niemand kennt seine magermasse."*

    Mifflin-St Jeor, Maenner:  10×kg + 6,25×cm − 5×Alter + 5
    Mifflin-St Jeor, Frauen:   10×kg + 6,25×cm − 5×Alter − 161

`[cmd]` Das ist der Weg, den auch das Vorgaengerrepo nimmt
(`calculateTDEE.ts`, gemessen in G-510) — **inklusive des
Aktivitaetsmultiplikators**, der in der Spec fehlte und dort um Faktor 1,2
bis 1,9 zu niedrig lag.

### 2.2 Aktivitaetsmultiplikatoren (A 1.3, B)

    sedentaer  (kein Sport)        1,20
    leicht     (1-3×/Woche)        1,375
    maessig    (3-5×/Woche)        1,55
    sehr aktiv (6-7×/Woche)        1,725
    extrem     (2×/Tag)            1,90

`[read]` **Und eine Sonderregel fuer Wettkampfvorbereitung** (A 1.3):
`Contest Prep TDEE = BMR × 1,4–1,5` bei 5–6 Einheiten plus Cardio. Das ist
**niedriger** als der Tabellenwert fuer „sehr aktiv" — weil in der Diaet
die Alltagsaktivitaet sinkt. Nicht uebernommen, aber ein Kandidat.

### 2.3 Gewichtsaenderung — deckt sich mit E-1

    Δkg/Woche = (kcal-Differenz × 7) / 7700        (A 1.4, B)

`[cmd]` Identisch zu unserer Form `kcal/Tag = 11 × Rate(%/Woche) ×
Gewicht(kg)`, nur nach der anderen Groesse aufgeloest. **Vier Quellen,
dieselbe Konstante 7700 kcal/kg.**

### 2.4 Makros

    Protein   Gewicht × Faktor je Phase        (Abschnitt 3.1)
    Fett      Prozentsatz der Kalorien / 9     ODER g/kg — offen, 3.2
    Carbs     (kcal − Protein×4 − Fett×9) / 4  Restgroesse

`[cmd]` Die Restgroessenregel steht in keiner Goals-Spec, aber als Code im
Vorgaengerrepo und in allen vier Dokumenten. **Sie ist live.**

### 2.5 Cardio-Bedarf aus dem Restdefizit (D 5.1)

    Restdefizit = Zieldefizit − Defizit aus der Ernaehrung
    1 % Defizit ≈ 200-300 kcal ≈ 30-45 min LISS
    Minuten = Restdefizit × 35

`[read]` **Das ist der Rechenweg, der Ernaehrung und Cardio verbindet** —
und LumeOS hat ihn nicht. Heute entscheidet die Strategie das Defizit, und
niemand rechnet, wieviel davon aus Bewegung kommen soll. **Ein Kandidat
fuer das Cardio-Modul, kein Goals-Thema.**

### 2.6 Kalorien je Cardio-Einheit (A 5.4)

    LISS  30 min   150-250 kcal    (gewichtsabhaengig)
    MISS  30 min   250-350 kcal
    HIIT  20 min   250-400 kcal    inkl. Nachbrennen
    1 h LISS ≈ 300-500 kcal ≈ dieselbe Menge weniger essen

---

## 3. Baender je Phase

### 3.1 Protein, pro kg **Koerpergewicht** (D, korrigierte Fassung)

| Phase | g/kg Koerpergewicht |
|---|---|
| Off-Season / Bulk | 1,8 – 2,2 |
| Lean Bulk | 2,0 – 2,4 |
| Recomp / Maintenance | 2,0 – 2,4 |
| Cut (standard) | 2,2 – 2,6 |
| Contest Prep | 2,4 – 3,0 |
| Peak Week | 2,0 – 2,4 |

`[read]` **Warum Koerpergewicht und nicht Magermasse:** die Literatur
rechnet in g/kg Magermasse (Helms 2014: 2,3–3,1), aber das setzt einen
bekannten Koerperfettanteil voraus. Dokument D rechnet die Baender um und
begruendet es: bei hoeherem Koerperfett gibt die Gewichtsmethode **mehr**
Protein (bei 25 % KFA +52 g), bei niedrigem sind beide fast gleich (+5 g
bei 6 %). **Die Abweichung zeigt in die sichere Richtung** — zu viel
Protein kostet Kohlenhydrate, zu wenig kostet Muskelmasse.

`[cmd]` **Drei Live-Werte liegen ausserhalb** (G-545 A7): `peak_week` 2,50,
`conservative_cut` 2,00, `aggressive_bulk` 1,60.

### 3.2 Fett — zwei Wege, und wir nehmen den einen

    Weg 1   Prozentsatz der Kalorien   20-30 %        (A 1.5)
    Weg 2   Gramm pro kg Koerpergewicht 0,5-1,0       (D)

`[cmd]` **`goals.goal_strategies.fat_percent` nimmt Weg 1.** Dokument D
gibt Weg 2 je Phase: Bulk 1,0 · Lean Bulk 0,9 · Cut 0,8 · Contest Prep 0,7
· Peak Week 0,5 · Maintenance 0,9.

`[read]` **Die beiden Wege sind nicht dasselbe**, und der Unterschied
waechst mit dem Defizit: 25 % von 2.000 kcal sind 55 g, das sind bei 84 kg
0,66 g/kg. 25 % von 3.000 kcal sind 83 g, also 0,99 g/kg. **Derselbe
Prozentsatz ergibt in der Diaet weniger Fett pro Kilogramm** — genau dort,
wo die Hormongrenze wichtig wird.

**Die Untergrenze, die beide Wege nennen:** nie unter 0,5 g/kg
Koerpergewicht fuer mehr als etwa eine Woche (A 1.5, C Phase 3). `[cmd]`
Als CHECK haben wir das nicht.

### 3.3 Kohlenhydrate (A 3.2)

    Trainingstage   3-4 g/kg        bei >5 h Cardio/Woche: 4-5
    Ruhetage        2-3 g/kg        bei <3 h Cardio/Woche: 1,5-2,5
    Ladephase       6-8 g/kg        Peak Week

`[read]` Kohlenhydrate sind bei uns die Restgroesse und werden nicht
vorgegeben. **Diese Baender sind damit eine Pruefgroesse, kein Zielwert** —
wenn die Restrechnung unter 1,5 g/kg fuehrt, ist entweder das Defizit zu
gross oder Protein und Fett zu hoch.

### 3.4 Wettkampfvorbereitung, vier Unterphasen (C)

| Stage | Wochen | Defizit | Zielrate | Cardio |
|---|---|---|---|---|
| Initiation | 0–4 | −15…20 % | 0,5–0,8 %/Woche | 2× 30 min LISS |
| Progression | 4–12 | −20…25 % | 0,5–1,0 %/Woche | 3–5× 30–40 min |
| Intensification | 12–18 | −25…35 % | 0,3–0,6 %/Woche | 5–6× + HIIT |
| Peak Week | letzte 7–10 Tage | variabel | — | minimal |

`[read]` **Die Rate sinkt, waehrend das Defizit steigt.** Kein Widerspruch:
bei niedrigem Koerperfett ist Muskelverlust das Risiko, nicht die
Geschwindigkeit (Pasiakos et al. 2013 zur erhoehten Proteolyse). **Das ist
der Grund, warum ein pauschaler `tdee_modifier` je Strategie
Wettkampfvorbereitung nicht darstellen kann** (G-543, G-545 A1).

### 3.5 Dauer aus dem Koerperfettanteil (C 1)

    Prep-Wochen = (Start-KFA % − Ziel-KFA %) × 1,5 bis 2,0
                  + 2-4 Wochen Puffer

    Mindestvoraussetzung  Maenner ≤ 15 % (besser 12-13 %)
                          Frauen  ≤ 22 % (besser 18-20 %)

`[cmd]` **`max_duration_weeks` steht bei uns als feste Zahl** (contest_prep
16). Fuer 10 % KFA zu lang, fuer 18 % zu kurz — und dann greift
`force_transition` am falschen Tag. Gemeldet in G-545 A5, nicht geloest.

---

## 4. Anpassung und Waechter

### 4.1 Der symmetrische Algorithmus (C 2)

    Verlust < 0,5 %/Woche ueber 2 Wochen  ->  −100…200 kcal ODER +1 Cardio
    Verlust > 1,2 %/Woche ueber 2 Wochen  ->  +100…150 kcal

`[cmd]` **Der zweite Zweig fehlt uns.** G-520 baute
`weekly_loss > 1.0kg → increase_calories (+150)` — **eine absolute Zahl.**
0,7 kg sind bei 60 kg dasselbe Problem wie 1,2 kg bei 100 kg. `[read]` Die
Regel gehoert relativ. Gemeldet in G-545 A2.

### 4.2 Wann eine Diaetpause (A 8.1, C 3)

    Gewicht stagniert 3+ Wochen trotz Anpassung
    Kaelteempfindlichkeit, Libido sinkt, Schlafqualitaet faellt
    Trainingsleistung −20…30 %
    Thyroid unterdrueckt (TSH erhoeht, T3 niedrig)

    Dauer      1-2 Wochen auf TDEE, nicht laenger
    Protein    2,0-2,2 g/kg, bleibt hoch
    Fett       1,0 g/kg

`[read]` **MATADOR (Byrne et al. 2018) ist das Argument dafuer:**
intermittierende Diaet ergab mehr Fettverlust und geringere Adaption als
durchgehende. **Das ist die Begruendung, mit der `moderate_cut` auf 20
Wochen gesetzt wurde** (G-542) — die Sicherheit kommt von der Pause, nicht
vom kurzen Deckel.

### 4.3 Refeed (A 3.3, C 3)

    Frequenz    1-2×/Woche, an einem schweren Trainingstag
    Dauer       1 Tag, nicht 24h+
    Kalorien    TDEE oder +10-20 %
    Carbs       +100-150 g   Protein konstant   Fett −30-50 %

`[read]` **Kein Cheat Day.** Beide Dokumente betonen es: der Refeed ist
geplant, kohlenhydratbetont und einen Tag lang.

### 4.4 Erholung, mit Schwellen (A 7.2)

    HRV 10 % unter Baseline    Intensitaet senken oder Ruhetag
    HRV 20 % unter Baseline    Ruhetag zwingend
    Schlaf                     7-9 h, Raum 18-19 °C

`[cmd]` LumeOS hat HRV in Recovery und `hrv7d < baseline × 0.85` in G-520 —
**das ist 15 %, zwischen den beiden Schwellen.** Kein Fehler, aber eine
Zahl ohne Beleg dort, wo zwei belegte existieren.

### 4.5 Abbruchkriterien (C 3)

    Libido komplett weg  > 2 Wochen
    Schlaf < 5 h trotz Muedigkeit
    Trainingsleistung −40 % und mehr
    Depression, Anhedonie
    Herzrhythmusstoerungen
    Maenner: Testosteron < 200 ng/dL

`[read]` **Die ersten drei sind Steuergroessen, die letzten drei sind
medizinisch.** Trainingsleistung und Schlafdauer duerfen in `guards` einer
Strategie; Blutwerte und Herzrhythmus gehoeren ins Medical-Modul mit dessen
Belegpflicht — **nicht als Textzeile an eine Ernaehrungsstrategie**
(G-545 A6).

---

## 5. Peak Week — ohne Pharmakologie

### 5.1 Wasser und Natrium (A 6.2, C 4)

| Tag | Wasser | Natrium |
|---|---|---|
| −10 bis −7 | 8–10 L | 5–8 g |
| −6 bis −4 | 6–8 L | 4–6 g |
| −3 bis −2 | 4–5 L | 2–3 g |
| −1 | 2–3 L | 1–2 g |
| Showtag | nach Durst | normal |

`[read]` **Der Mechanismus, den beide nennen:** hohe Zufuhr senkt Aldosteron
und erhoeht die Ausscheidung; die ploetzliche Reduktion laeuft dann ueber
das Ziel hinaus. **Und beide nennen die Alternative:** manche verzichten
ganz darauf und arbeiten nur mit Kohlenhydraten und gleichmaessigem
Natrium — sicherer, aber weniger „trocken".

### 5.2 Kohlenhydratladung, zwei Wege (A 6.3, C 4)

    Front-Load   Tag −5: 2 g/kg, dann 3, 4, 5-6, Tag −1: 3-4
    Back-Load    Entleerung 0,5-1 g/kg bis −4, dann 5, 7-8, −1: 4-5

    Beurteilung  flach     -> mehr Carbs
                 weich     -> weniger Carbs, Natrium pruefen
                 voll und definiert -> halten

### 5.3 Training in der Peak Week (A 6.4)

Volumen faellt von hoch (Tag −7) auf nichts (Tag −1), Intensitaet von
moderat auf sehr leicht. Letzte Einheit: Pumparbeit, 15–25 Wiederholungen.

`[cmd]` **Nicht uebernommen:** Diuretika-Tabelle (A 2.6) und alles aus
A Abschnitt 2. Das ist **G-546**, Toms Entscheidung.

---

## 6. Ansaetze, die LumeOS heute nicht hat

`[read]` Aus Dokument D, dem Architekturentwurf. **Er kennt LumeOS nicht** —
was hier steht, ist der Gedanke, nicht die Vorgabe.

### 6.1 Die persoenliche Untergrenze am Ziel

    constraints: min_calories, max_cardio_hours_per_week,
                 min_protein_g_per_kg, max_deficit_percent,
                 min_bf_percent

`[cmd]` **Unsere drei Ebenen haben dafuer keine Spalte.** Eine Grenze gilt
fuer den Nutzer und begrenzt jede Strategie; ein Override gilt fuer eine
Phase. Das ist **G-547**.

### 6.2 Koerperfett als Kategorie statt als Zahl

    <10 %  10-15 %  15-20 %  20-25 %  >25 %
    Faktor 1,15 · 1,05 · 1,00 · 0,95 · 0,90 auf das Protein

`[read]` **Das ist die Bruecke, die Toms Einwand aufloest:** niemand kennt
seine Magermasse, aber „eher schlank oder eher fett" kann jeder
einschaetzen — und als Fuenferstufe ist der Fehler eingebaut statt
versteckt. Dazu die Navy-Formel als Rueckfall:

    Maenner: 86,010 × log10(Taille − Hals) − 70,041 × log10(Groesse) + 36,76
    Frauen:  163,205 × log10(Taille + Huefte − Hals)
             − 97,684 × log10(Groesse) − 78,387

`[cmd]` **Taille, Hals und Huefte erfassen wir schon.** Der Weg braucht
keine neue Eingabe. Gemeldet in G-545, nicht beauftragt.

### 6.3 Module beschraenken sich gegenseitig

`[read]` Der Abhaengigkeitsgraph in D ist **bidirektional**, nicht nur
„Module liefern Beitraege an Goals" (das ist G-514):

    min_carbs_for_hiit           wenig Carbs -> kein HIIT
    cardio_interference_window   Stunden Abstand zum Training
    max_total_training_hours     Training plus Cardio zusammen
    leg_day_cardio_restriction   kein Cardio nach Beintag
    liver_enzymes_elevated       keine oralen Substanzen
    thyroid_suppressed           kein weiteres Defizit

**Das ist eine Schicht zwischen den Modulen, nicht in Goals.** Notiert in
G-547, ohne Nummer und ohne Auftrag.

### 6.4 Alarmstufen und Anpassungsablauf

    info · warning · critical · emergency

Und der Ablauf: Daten sammeln → Trends → Abweichung → Anpassung erzeugen →
priorisieren → **Nutzer bestaetigt** → umsetzen → nach 1–2 Wochen messen,
ob es gewirkt hat.

`[cmd]` **Schritt 6 haben wir** (G-520 baut Vorschlagsfunktionen, der Nutzer
antwortet ueber `phase_transition_respond`). **Schritt 8 fehlt:** niemand
prueft, ob eine angenommene Anpassung gewirkt hat.

---

## 7. Was ausdruecklich nicht uebernommen wird

`[cmd]` **Dokument A, Abschnitt 2 — Pharmakologie.** Dosierungen fuer
anabole Steroide, Wachstumshormon, Thyroidhormone, Insulin, Diuretika, DNP,
mit Zyklusplaenen und Nebenwirkungsmanagement. **Steht in keinem
Katalogeintrag und in keinem Auftrag.** Die Entscheidung liegt bei Tom und
ist als **G-546** vorgelegt: erfassen, was ein Nutzer nimmt, oder eine
Dosierung ausliefern.

`[cmd]` **Dokument A, Abschnitt 7.3 — Blutwert-Referenzbereiche.** Medical
hat einen eigenen Biomarker-Katalog mit Evidenzeinstufung (C-183, C-204,
C-180). **Referenzbereiche aus einer Sekundaerquelle nachzutragen wuerde
ihn verwaessern**, nicht ergaenzen.

`[cmd]` **Katch-McArdle als Grundumsatz.** Braucht die Magermasse.

---

## 8. Wohin das gegangen ist

| Befund | Punkt |
|---|---|
| Zielrate in Prozent pro Woche — vier Fundstellen | G-542, entschieden |
| Unterphasen der Wettkampfvorbereitung | G-545 A1 |
| symmetrischer Anpassungsalgorithmus, relativ statt absolut | G-545 A2 |
| Mindest-Koerperfett als `requirements` | G-545 A3 |
| Ausstiegs- und Erfolgskriterien | G-545 A4 |
| Dauer als Rechnung statt Konstante | G-545 A5, gemeldet |
| drei Proteinfaktoren ausserhalb der Baender | G-545 A7 |
| Pharmakologie — erfassen oder empfehlen | G-546, bei Tom |
| persoenliche Untergrenze am Ziel | G-547 |
| Rate statt Faktor in der Rechnung | G-543 |

`[read]` **Nicht in einem Punkt, weil noch zu weit weg:** Cardio-Bedarf aus
dem Restdefizit (2.5), Fettuntergrenze 0,5 g/kg als CHECK (3.2),
Kohlenhydratbaender als Pruefgroesse (3.3), HRV-Schwellen 10/20 % statt 15 %
(4.4), Wirkungskontrolle nach einer Anpassung (6.4).
