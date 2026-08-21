# 172 — Nährstoff-Aliase: wonach ein Mensch sucht

**Auftrag:** C-165 · **Stand:** 2026-08-21 · **Bereich:**
`supabase/_pipeline/` (Schritt 019, Daten, Sollliste)
**Vorher:** 168 (G-129: Volltextsuche, mit dem vorab definierten
Auslöser), 164 (C-161: `nutrient_details`), `food_aliases` (32.845)
und `medical.biomarker_aliases` (292) als Muster

**Kurz:** `nutrition.nutrient_aliases` ist gebaut und **live**: `[cmd]`
**98 Zeilen, 74 Begriffe, 50 Codes** — kuratiert nach dem Prüfstein
„nur was jemand wirklich tippt". Der Gruppenbegriff ist als
**ein-Alias-mehrere-Zeilen** gelöst (BCAA → LEU/ILE/VAL); die Suche
zeigt die Mitglieder, keinen synthetischen Knoten. Die vier gemessenen
Fälle treffen (Fiber, Carbs, BCAA, Omega 3 — letzterer schon über den
Namen). Für apps/web liegt die Sicht
`nutrition.nutrient_search_aliases` bereit; **dazu ein gemessener
Befund:** die heutige Suchregel findet „Vitamin B5" prinzipiell nicht —
die nötige Kurz-Token-Erweiterung ist unten beschrieben. Kettenlauf
**Exit 0** (126,3 s), Schemaprüfung live Exit 0, `testdaten-pruefen`
grün.

---

## Wie viele Aliase und woher

`[cmd]` Aus dem Einspielschritt gezählt:

| | Zeilen |
|---|---:|
| **gesamt** | **98** (74 Begriffe, 50 Codes) |
| je Art | umgangssprache 24 · uebersetzung 21 · abkuerzung 16 · schreibvariante 8 · **gruppe 29** |
| je Sprache | de 48 · en 31 · und (sprachneutrale Abkürzungen) 19 · **th 0** |

**Quelle ist Sachkenntnis, keine Recherche** — jede Zeile ist ein
Begriff, den jemand benutzt: Fiber/Fibre, Carbs, Sat Fat, Eiweiss,
Traubenzucker/Dextrose, Kalzium/Glukose/Laktose (k-Varianten),
EAA/MUFA/PUFA/SFA/ALA/CLA/GLA, kcal/kJ, B1–B9, die
en-Elementnamen (Sodium, Potassium, Iron, …), Vitamin H/B3/B5/B7/B9.

`[cmd]` **88 der 138 Codes haben bewusst keinen Alias**, aus zwei
Gründen: (1) **der amtliche Name ist schon der Suchbegriff** —
Magnesium, Leucin, Biotin, Retinol, Vitamin C/B12, Salz, Niacin,
Saccharose, Folsäure, DHA/EPA (in Klammern im Namen), Omega-3/-6 (im
Namen seit der Umbenennung); (2) **es gibt keinen gängigen
Zweitnamen** — die 26 einzelnen Fettsäuren (`F10:0` …), Rohasche,
Organische Säuren im Detail. Ein Alias dafür wäre eine Erfindung.

**Bewusst NICHT drin:**

- **Thai-Umgangsnamen (0):** die 138 `name_th` liegen in den Defs;
  Umgangs-Thai ohne Sprecher oder Quelle wäre erfunden. Folgepunkt,
  kein Import.
- **Handelsbegriffe:** `[cmd]` Whey Protein, Micellar casein, Creatine
  monohydrate, L-Glutamine stehen im **Substanzkatalog** (C-134, mit
  eigener `aliases`-Spalte) — sie zeigen auf Supplements, nicht auf
  Nährstoffe. Dorthin gehören auch Fischöl und Glutamin (das chemisch
  NICHT die Glutaminsäure `GLU` ist).
- **„Mineralstoffe":** deckungsgleich mit der Elemente-Karte — 16
  Treffer wären Rauschen; Produktfrage, notiert.
- **„Omega 9":** gängig, aber die Zuordnung (Ölsäure? alle
  einfach-ungesättigten?) wäre geraten.
- **HDL/LDL, Blutzucker:** Biomarker-Begriffe, keine Zufuhr —
  `biomarker_aliases` führt diese Welt.

## Wie Gruppenbegriffe gelöst sind

`[read]` `food_aliases` kann nur eins-zu-eins (PK auf dem Alias je
Food). Hier ist **die Zeile das Paar**: `PRIMARY KEY (nutrient_code,
alias_folded)` — ein Begriff darf auf beliebig viele Codes zeigen,
`kind = 'gruppe'` benennt es. `[cmd]` Der Einspielschritt erzwingt die
Disziplin: mehrere Codes OHNE `kind=gruppe` brechen den Lauf, ebenso
eine „Gruppe" mit nur einem Code.

**Die Suche zeigt die Mitglieder, keinen Gruppenknoten:** ein
synthetischer „BCAA"-Knoten stünde nirgends im Baum und hätte weder
Wert noch Referenz — drei echte Treffer (je mit ihrem Ast, Leucin
2,7 g …) sind die ehrliche Antwort. `[cmd]` Belegt in der Simulation:

| Gruppenbegriff | Codes |
|---|---|
| BCAA | LEU, ILE, VAL (3) |
| Elektrolyte / Electrolytes | NA, K, MG, CA, CLD (5) |
| Spurenelemente | FE, ZN, CU, MN, ID, FD, CR, MO (8) |
| B-Vitamine | THIA, RIBF, NIAEQ, PANTAC, VITB6, BIOT, FOL, VITB12 (8) |

## Was die vier Testfälle zeigen

`[cmd]` Simulation mit **exakt der apps/web-Regel** (`trifftSuche` aus
`naehrstoff-anzeige.ts`) plus der unten beschriebenen
Alias-Erweiterung, gegen die Live-Daten:

| getippt | vorher | jetzt |
|---|---|---|
| **Fiber** | 0 | **FIBT** (Alias `uebersetzung`) |
| **Carbs** | 0 | **CHO** (Alias `umgangssprache`) |
| **BCAA** | 0 | **LEU + ILE + VAL** (Gruppe) |
| **Omega 3** | traf schon | FAPUN3 (+ FAPU/FAPUN6) — **über den Namen, kein Alias nötig**; die „0 im Namen"-Zeile des Auftrags galt für `name_en`, `name_de` heisst seit der Umbenennung „Omega-3-Fettsäuren" |

Dazu gemessen: „Elektrolyte" → 5, „Spurenelemente" → 8, „EAA" → AAE9,
„Eiweiss" → PROT625, „Traubenzucker" → GLUS, „kJ" → ENERCJ, „EPA" →
exakt F20:5CN3, **„Vitamin B5" → PANTAC**.

## Was `apps/web` noch braucht

**Der Anschluss liegt bereit:** die Sicht
`nutrition.nutrient_search_aliases` (je Code `aliases_folded text[]`
und `alias_text`) — `alias_folded` ist mit **derselben Faltung**
normalisiert wie die Suchfelder in apps/web (klein, ohne Akzente, ohne
Trennzeichen). Damit ist die Integration: **eine Abfrage mehr in
`ladeOrdnung`, ein drittes Feld je Knoten** (`suchAlias`).

**Und eine Regelerweiterung, nicht nur ein Feld:** `[cmd]` Die heutige
Nähe-Regel (2 Zeichen = nur Code, 3 = Name, ab 4 = Text) lässt
Kurz-Token wie `B5` oder `kJ` nirgends zu — **„Vitamin B5" findet
heute prinzipiell nichts**, auch mit Aliasen im Namensfeld nicht.
Vorschlag (simuliert und belegt):

> Token trifft, wenn er **gleich dem Code** ist ODER **gleich einem
> Eintrag in `aliases_folded`** (exakt — deckt B5, kJ) ODER ab 3
> Zeichen als Teilzeichenkette in Name **oder `alias_text`** ODER ab 4
> im Erklärtext.

Das ist ein G-Auftrag für den Nutrition-Agenten (`apps/web` war hier
gesperrt); ohne ihn liegen die 98 Zeilen brach.

## Nachweise

| Behauptung | Beleg |
|---|---|
| Kette | `[cmd]` `lumeos_c165_check2`: **KETTE OK 126,3 s**, „SCHEMA VOLLSTAENDIG", Exit 0 — `nutrient_aliases`/`nutrient_search_aliases` stehen in der Sollliste (die drei `exclusion_*`-Hinweise sind Altbestand aus Schritt 018) |
| Live | `[cmd]` Einspielen: „98 Aliaszeilen (74 Begriffe, 50 Codes)"; Schemaprüfung live Exit 0; `testdaten-pruefen.ts` „OK: C-82 Testdaten stimmen" |
| Testfälle | `[cmd]` Simulationstabelle oben, 12 Anfragen |
| Gruppenbegriff | `[cmd]` „BCAA" → 3 Zeilen/Codes, „Elektrolyte" → 5 |
| Zeilenschutz | `[cmd]` Als `test-user` (A-34: kein dev-Lauf): 98 Katalogzeilen lesbar, Sicht liefert (`FIBT → faserstoffe fiber fibre`); `anon` hat keinen Schemazugriff. Die Tabelle trägt keine Nutzerdaten — es gibt nichts Fremdes zu sehen |
| Abstimmung C-164 | `[cmd]` Keine gemeinsame Datei: Codex arbeitet in `07_lesefunktionen` (food_search); C-165 liegt in `015_kataloge/019` + `daten/` + Sollliste |

## Was nicht angefasst wurde

- **`food_aliases`** unverändert; **`apps/web`** unverändert (gesperrt,
  Anschluss oben beschrieben).
- Kein Umbau der Suche, keine Erklärtexte dupliziert.
- `kette.json`: nur der neue Schritt 019 (depends_on 015), keine
  bestehenden Schritte verändert.
