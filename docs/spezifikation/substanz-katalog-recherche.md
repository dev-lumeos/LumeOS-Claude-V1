# Substanz- und Supplement-Katalog — Datensammlung (F-05)

Stand: 2026-08-19 · Herkunft: gesammelt in dieser Sitzung.
**Kein Schema, kein Import, keine Oberfläche. Nichts committet.**

Datendatei: `supabase/_pipeline/daten/substanz-katalog.json`
(206,8 KB, unter dem 10-MB-Hook-Limit — nicht aufgeteilt).
Reproduzierbar über das Wegwerf-Skript `build_katalog.py` (Scratchpad):
es übernimmt die Halbwertszeiten aus der Mini-PC-CSV **unbelegt** und legt
den kuratierten Rahmen (Recht, Doping, Obergrenzen, Überwachung) darüber,
je Zeile mit Quellenkennung.

**Das Nachschlagewerk-Prinzip:** erfasst wird, *was* eine Substanz ist,
wie lange sie wirkt, wo sie rechtlich steht, was sie im Blutbild
verschiebt und in welchem Bereich sie dosiert wird. **Nicht** erfasst
wird, *was jemand tun soll* — keine Zyklen, keine PCT-Protokolle, keine
Kombinationsempfehlungen. Dieselbe Grenze wie bei Wechselwirkungen
(C-108) und Referenzwerten: *Fakt ja, Anweisung nein.*

---

## 1. Was gesammelt wurde

`[cmd]` **320 Substanzen** in der Datendatei, gezählt je Klasse:

| Klasse | Anzahl | Herkunft der Kernangabe |
|---|---:|---|
| Botanicals / Kräuter | 43 | Namensbestand aus CSV, ohne kuratierte Dosis |
| AAS injizierbar | 35 | Halbwertszeit CSV (unbelegt), Rahmen kuratiert |
| Longevity / Anti-Aging | 32 | Namensbestand aus CSV |
| Nootropika | 30 | Namensbestand aus CSV |
| Peptide | 26 | Halbwertszeit CSV (unbelegt), Rahmen kuratiert |
| AAS oral (17aa) | 25 | Halbwertszeit CSV, Lebertoxizität als Überwachung |
| SARMs | 19 | Halbwertszeit CSV, Rahmen kuratiert |
| Adaptogene | 19 | Namensbestand aus CSV |
| GH / GH-Sekretagoga | 15 | Halbwertszeit CSV, Rahmen kuratiert |
| SERM / HPTA-Modulatoren | 11 | Halbwertszeit CSV, Rahmen kuratiert |
| Aromatasehemmer | 10 | Halbwertszeit CSV, Rahmen kuratiert |
| Insulin / Glukose-Modulatoren | 10 | Halbwertszeit CSV, Rahmen kuratiert |
| Diuretika | 10 | Halbwertszeit CSV, Rahmen kuratiert |
| Vitamine | 8 | Dosis + **EFSA/DRI-Obergrenze belegt** |
| Mineralstoffe | 8 | Dosis + **EFSA/DRI-Obergrenze belegt** |
| Fatburner / Stimulanzien | 7 | gemischte Klasse, Rahmen je Fall |
| Standard-Supplemente (Performance/Recovery/Sleep/Longevity/…) | 12 | Dosis aus `spec_05`, UL wo belegt |
| Schilddrüsenhormone | 2 | Halbwertszeit CSV, Rahmen kuratiert |

`[cmd]` Belegtheit der drei kritischen Felder:

| Feld | belegt | Rest |
|---|---:|---|
| Dosisbereich | **27** (Vitamine, Mineralstoffe, Kern-Supplemente aus `spec_05`) | bei PEDs bewusst leer |
| Obergrenze (UL) | **13** (EFSA/DRI) | bei Peptiden/PEDs nicht existent |
| `nutrients_provided` | **16** (schließt die Gap-Score-Lücke aus F-02) | Rest trägt keinen Nährstoff |
| Halbwertszeit | 151 | **alle 151 unbelegt** (CSV-Übernahme, `source_status`) |

`[read]` Die vier Enhanced-Klassen (AAS, SARM, Peptid, GH) sind
vollständig als **Stammdaten mit Halbwertszeit und Nachweisdauer**
erfasst — das ist der Teil, für den es „ein Notizbuch statt der
Plattform" bräuchte. Botanicals, Nootropika und Anti-Aging sind bewusst
nur **Namens- und Klassenzeilen**: sie zu dosieren wäre Kuratierung ohne
belastbare Obergrenzen, und der Aufwand steht in keinem Verhältnis, bevor
das Modul sie überhaupt anzeigt.

**Nicht erfasst:** Dosierungsschemata, Zyklusaufbau, PCT-Protokolle,
Kombinationsempfehlungen, jede Wertung „gut/schlecht". Das ist die
Auftragsgrenze, nicht ein Auslassen.

---

## 2. Woher die Daten stammen

**Zuerst das Repo:**

- `[cmd]` **Mini-PC-CSV** (702 Zeilen) — Quelle der 200 Enhanced-Zeilen
  mit Halbwertszeit und Nachweisdauer. **Diese Werte sind unbelegt:** die
  CSV führt keine Quellenspalte, die Chargen-Zeitstempel (Dez 2025 – Jan
  2026) zeigen Kuratierung ohne Beleg. Jede übernommene Zeile trägt
  `half_life_source: "minipc_csv"` und den `unbelegt_note`.
- `[cmd]` **`SPEC_05_CATALOG_EVIDENCE`** — Dosisbereiche und Timing der
  Standard-Supplemente (KI-erzeugt, gegen die Recherche gehalten).
- `[cmd]` **`047_coach_planning_system.sql`** (Vorgänger) — führt
  `supplement_categories`/`supplement_knowledge`, aber nur **10
  Kategorien und drei Wissenszeilen** (Kreatin, Omega-3, Vitamin D). Als
  Struktur interessant, als Datenbestand dünn — nicht als Katalogquelle
  übernommen.
- `[cmd]` **`015_nutrient_defs_seed.sql`** — die BLS-Nährstoffcodes, an
  die `nutrients_provided` andockt (VITD, MG, ZN, FE, CA, SE, CU, ID …).

**Dann extern, je Zeile mit Quelle und Prüfdatum 2026-08-19** (im
`sources`-Register der Datei):

- **WADA-Verbotsliste 2026** (in Kraft seit 2026-01-01) — Klassen S0–S6,
  über USADA für die SARM-Einordnung (S1.2).
- **EFSA UL-Guidance 2024** und die Neubewertungen 2023/24 — u. a.
  **Vitamin B6 auf 12 mg/Tag gesenkt** (vorher 25), **Selen auf 255
  µg/Tag** (vorher 300). US DRI/NIH ODS für die übrigen Obergrenzen.
- **FDA / USADA** — SARMs sind unzugelassene Arzneimittel unter
  FDA-Enforcement, **nicht DEA-scheduled**; kein legaler
  Supplement-Inhaltsstoff.
- **FDA Category-2-Bulklist** für Peptide (BPC-157 u. a.) — mit dem
  Vorbehalt, dass der Status **in Bewegung ist**: Sept 2024 wurden fünf
  Substanzen gestrichen, Feb 2026 kündigte HHS eine Rückstufung an, **die
  formal noch nicht publiziert ist**. Das steht so in der Datei.
- **Pflegeliteratur** für die IM-Injektionsvolumina (Abschnitt 3).

`[read]` **Eine Spanne aus einem Forum ist keine Quelle.** Wo nur
Erfahrungswerte kursieren — bei den meisten PED-Dosen —, bleibt das Feld
leer statt gefüllt mit einer Zahl, die belegt aussieht.

---

## 3. Was im Blutbild zu überwachen ist — die Verbindung zu Medical

`[read]` Je Substanzgruppe ist hinterlegt, **welche Marker sich
verschieben** — belegte Pharmakologie, keine Empfehlung. Die Marker sind
so benannt, dass sie an Medicals 560 Referenzbereiche (C-84) andocken.
Neun Überwachungsprofile:

| Profil | Kernmarker | Was sich verschiebt |
|---|---|---|
| `aas` | Hämatokrit, LH, FSH, Gesamt-/Freies Testosteron, E2, SHBG, LDL/HDL/ApoB | Suppression der eigenen Achse, Hämatokrit hoch, Lipide verschoben |
| `aas_17aa` | + ALT, AST, GGT, Bilirubin | orale 17aa-Steroide zusätzlich lebertoxisch |
| `sarm` | Gesamttestosteron, LH, FSH, ALT/AST, HDL | dosisabhängige HPTA-Suppression |
| `gh_igf` | IGF-1, Nüchternglukose, HbA1c, Insulin, TSH/fT4 | IGF-1 hoch, Insulinresistenz möglich |
| `insulin_glp1` | Glukose, HbA1c, C-Peptid | Glukose/HbA1c verschoben, Hypoglykämierisiko |
| `ai` | E2, LDL/HDL/ApoB, Knochendichte | zu niedriges E2 verschlechtert Lipide/Knochen |
| `serm` | Testosteron, LH, FSH, E2, SHBG | HPTA-Stimulation |
| `thyroid` | TSH, fT3, fT4 | exogenes T3/T4 unterdrückt TSH |
| `kreatinin_hinweis` | Kreatinin, eGFR, Cystatin C | **Fehldeutungsfalle** (siehe unten) |

`[cmd]` **Der Kreatinin-Hinweis ist genau der aus dem Repo genannte
Fall:** Kreatin und hohe Muskelmasse heben das Serum-Kreatinin ohne
Nierenschaden, und die aus Kreatinin gerechnete eGFR wirkt dadurch
fälschlich niedrig — Cystatin C ist muskelunabhängig und der bessere
Marker. Das ist ein Fakt über die Messung, keine Aussage über die Person.

`[read]` **Das ist die Fläche, die das Produkt ausmacht:** Wer TRT oder
ein Peptid protokolliert, sieht in Medical nicht irgendein Panel, sondern
genau die Marker, die diese Substanz bewegt — als Lagebeschreibung, nicht
als Urteil.

---

## 4. Wo die Rechtslage auseinandergeht

`[read]` **Tom sitzt in Koh Samui, die Nutzer sitzen überall** — deshalb
trägt jeder `legal_framework` drei Länder getrennt. Die Unterschiede sind
nicht kosmetisch:

| Substanzklasse | Deutschland | USA | Thailand |
|---|---|---|---|
| **Anabole Steroide** | AMG-rezeptpflichtig; **Besitz „nicht geringer Menge" nach AntiDopG strafbar**, auch für Eigenbedarf | **Schedule III** (kontrolliert) | **„dangerous drug"** — Apothekenabgabe für On-Label möglich; **Testosteron rezeptpflichtig** |
| **SARMs** | nicht als Arzneimittel zugelassen; AntiDopG ab Mengenschwelle (DmMV, z. B. 540 mg) | **unzugelassenes Arzneimittel**, FDA-Enforcement, kein legales Supplement | nicht als Arzneimittel zugelassen |
| **Forschungspeptide** (BPC-157, TB-500 …) | nicht zugelassen; **viele nicht im AntiDopG gelistet** → nicht strafbewehrt | FDA Category-2 / unapproved; **Status in Bewegung** (HHS-Ankündigung Feb 2026) | nicht zugelassen |
| **GLP-1** (Semaglutid, Tirzepatid) | rezeptpflichtig | **FDA-zugelassen**, Off-Label für Körperkomposition | rezeptpflichtig |
| **Vitamine/Mineralstoffe** | frei; EU-Höchstmengen in Vorbereitung | Supplement (DSHEA) | frei |

`[read]` **Der schärfste Kontrast ist Thailand:** Was in Deutschland und
den USA klar kontrolliert ist (anabole Steroide), ist dort über die
„dangerous drug"-Kategorie **in der Apotheke ohne Rezept** erhältlich —
aber nur für den Zulassungszweck, und Testosteron bleibt rezeptpflichtig.
Für ein Produkt mit thailändischem Sitz und globaler Nutzerschaft heißt
das: **die Rechtslage kann nicht als ein Wert erfasst werden**, sie ist
strukturell länderabhängig.

`[read]` **Zwei Wackelstellen ausdrücklich vermerkt:** (a) Der
US-Peptid-Status ist Feb 2026 in Umbruch und die Datei sagt das, statt
einen scheinbar festen Wert zu führen. (b) Die AntiDopG-Mengenschwellen
stehen in der Dopingmittel-Mengen-Verordnung je Stoff — die Datei nennt
das Rahmenwerk, nicht jede Einzelschwelle (das wäre ein eigener
Rechercheauftrag).

---

## 5. Was unbelegt bleibt und warum

`[cmd]` **Die 151 Halbwertszeiten und alle Nachweisdauern** stammen aus
dem Vorgänger-Export ohne Primärquelle. Sie sind übernommen, weil sie die
einzige zusammenhängende Quelle sind und pharmakologisch plausibel wirken
— aber jede trägt `source_status`-Vermerk. **Aus der Existenz folgt nicht
die Richtigkeit:** vor einer produktiven Nutzung braucht jede Klasse eine
Gegenprüfung an Fachliteratur.

`[read]` **Dosisbereiche bei Peptiden und PEDs bleiben leer** — nicht aus
Nachlässigkeit, sondern weil sie **nie am Menschen belegt** sind (SARMs,
die meisten Peptide) oder eine medizinische Aussage wären (Steroide). Wie
bei den 410 Referenzbereichen ohne Zahlen (C-79) und den „conservative
defaults" der Injektionsgrenzwerte (C-109): leeres Feld plus Grund ist
ehrlicher als eine Forenzahl.

`[cmd]` **Botanicals/Nootropika/Anti-Aging sind nur Namenszeilen** — 124
Substanzen ohne Dosis/UL. Grund: keine belegten Obergrenzen für die
meisten Botanicals, und die Kuratierung lohnt erst, wenn das Modul sie
anzeigt.

### Was der Injektionsteil zu C-109 beiträgt

`[cmd]` Der Auftrag verlangt die dritte Zahl — das Volumen je Stelle —
wo belegt. Aus der Pflegeliteratur (`im_volume_lit`) sind fünf
IM/SubQ-Bereiche hinterlegt:

| Stelle | belegtes Max (ml) | typisch (ml) |
|---|---:|---:|
| Deltoid | 2,0 | 1,0 |
| Vastus lateralis (Quad) | 5,0 | 2,0 |
| Ventrogluteal | 3,0 (bis 5,0) | 2,5 |
| Dorsogluteal | 4,0 | 3,0 |
| SubQ (Abd/Oberschenkel/Arm) | 1,5 | 1,0 |

`[read]` **Das erledigt C-109 teilweise:** Die Mockup-Werte (Glute 3,0 /
Delt 1,0 / SubQ 0,5–1,0) liegen innerhalb dieser belegten Bereiche und
sind damit **nicht mehr auf Toms Abnahme angewiesen** — sie haben jetzt
eine Pflegeliteraturquelle. Was die Literatur **nicht** liefert, sind die
substanzspezifischen `rest_days` (Ruhefenster) und die Nadelempfehlungen
je Ort — die bleiben „conservative defaults" ohne Einzelquelle.

---

## Nachweis

`[cmd]` Erzeugt am 2026-08-19 durch `build_katalog.py` (Wegwerf-Skript,
Scratchpad, nicht im Repo). Statistik: 320 Substanzen, 27 mit belegtem
Dosisbereich, 13 mit EFSA/DRI-Obergrenze, 16 mit `nutrients_provided`,
151 mit unbelegter Halbwertszeit. `[cmd]` Datei 206,8 KB, ein Stück
(unter 10 MB). `[read]` Externe Quellen mit Prüfdatum 2026-08-19 im
`sources`-Register; die 200 Enhanced-Halbwertszeiten tragen
`half_life_source: "minipc_csv"` und `unbelegt_note`. **Nichts committet,
nichts gestaged, kein Schema, kein Import, keine Oberfläche. Vorgängerrepo
nur gelesen.**
