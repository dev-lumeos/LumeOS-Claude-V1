# C-107 + C-195 + G-176 + G-177 — Claude Code, 2026-08-23

Auftrag: `docs/auftraege/c-107-claude-code.md` (drei Korrekturbloecke)

Reihenfolge wie verlangt: **G-176, dann G-177, dann C-107.**

**G-177 war meine eigene Baustelle** — die Luecken-Kachel stammt aus
C-252. Die Kritik trifft zu.

Nicht committet, nicht gestaged, nicht gepusht.

---

## KORREKTURBLOCK ZU C-254 (der Auftrag verlangt ihn)

**Punkt 3 sagt:** *„Rueckfall-Logik nach C-254 — jedes Textfeld, nicht
nur `name_de`."*

`[cmd]` **Zu weit, gemessen in C-254.** Von 66 `*_de`-Textspalten
tragen **21 IMMER Deutsch** (`nutrition.foods.name_de` 7.140/7.140),
und bei `nutrition.nutrient_details` sind de und en identisch gefuellt
— **0 Zeilen**, wo ein Rueckfall etwas rettete.

**Richtig:** wo die Spalte leer sein kann **und** ein gefuelltes `_en`
existiert. Die drei genannten Zahlen stimmen und stehen in der
Pruefliste von `tools/sprachrueckfall-pruefen.mjs`.

---

## G-176 — die 290 sind erreichbar

`[cmd]` `substanz-detail.tsx:314` trug `menge.slice(0, 50)`, aus
`d019b79` — **also aus G-172 selbst.**

### Erst gemessen, dann entschieden

`[cmd]` `tools/_g176-liste.mjs`, angemeldet, drei Laeufe je Stand:

| | DOM-Knoten | Ladezeit | letzte Zeile |
|---|---|---|---|
| **50 (vorher)** | **1.115** | 3.565 ms | `Choline bitartrate` |
| **290 (nachher)** | **4.713** | **3.270 · 3.354 · 3.494 ms** | `Zinc (T cross-ref)` |

`[read]` **4.713 Knoten sind unauffaellig, und die Ladezeit steigt
nicht** — sie liegt eher darunter. **Weder Nachladen noch
virtualisierte Liste noetig**; beides waere Aufwand gegen ein Problem,
das die Messung nicht zeigt.

**Nachweis:** 290 Zeilen im DOM, Fusszeile *„290 von 290 Einträgen"*,
Rollen bis ans Ende erreicht **`Zinc (T cross-ref)`** — ohne zu tippen.

`[read]` *„Suche verfeinern fuer mehr"* ist mit weg: der Zweig war nach
dem Entfernen des Limits unerreichbar, und die Aufforderung setzte
voraus, dass man den gesuchten Namen kennt.

---

## G-177 — die Gewichtung ist umgedreht

**Tom:** *„das detail sieht erstens scheisse aus und zweitens alles
ausser was ein user wirklich sehen will."*

`[cmd]` **Der Befund stimmte in jedem Punkt.** Bromocriptine zeigte:
einen Satz, fuenf zugeklappte Bloecke mit *„N Felder"* — und darunter
**aufgeklappt** meinen Schemabericht *„Ohne Quelle im neuen Katalog"*,
laenger als alle Inhaltsbloecke zusammen.

### 1 · Die Evidenz nach oben

`[cmd]` **Gemessen ueber alle 290:** `overall_grade` **290/290**,
`summary_en` **288/290**, im Schnitt **78 Zeichen**. **Der
meistgefuellte Fliesstext des Katalogs** — und er steckte zugeklappt
hinter *„Evidenz — 7 Felder"*.

**Jetzt steht er oben**, mit dem Grad als farbiger Pille (A/B gruen,
C neutral, D–F warnend — `[read]` nicht rot: ein schwacher Beleg ist
kein Fehler). Der Evidenz-Block entfaellt dafuer, sonst staende
dasselbe zweimal.

`[cmd]` Bromocriptine zeigt jetzt: *„Evidenz **D** — Experimental/
grey-market compound; limited formal evidence."*

`[read]` **Die Bloecke bleiben zu.** Tom hat das in C-229 entschieden
(*„zusatzinfos die keiner sehen muss"*), und ein Test haelt
`startOffen()` leer. **Geaendert ist der Anriss, nicht der
Startzustand** — die Vorgabe blieb, nur ihr Inhalt taugt jetzt.

### 2 · „N Felder" zaehlte Spalten, nicht Angaben

`[cmd]` **Toms schaerfster Punkt, und er hat recht:** *„Sicherheit —
2 Felder"* bei Bromocriptine — **beide Felder tragen `unknown`.**
Gemessen ueber die 290: `dosing.status` **115 unbekannt**,
`safety.status` **53**.

`anriss()` nennt jetzt den Inhalt und laesst weg, was keiner ist:

| | vorher | jetzt |
|---|---|---|
| Bromocriptine · Sicherheit | „2 Felder" | **„keine Angaben"** |
| Creatine · Wechselwirkungen | „1 Feld" | **„caffeine interaction debated (likely minimal)"** |
| Creatine · Qualität | „3 Felder" | **„keine Angaben"** |
| Bromocriptine · Rechtslage | „5 Felder" | „usa · approved drug · …" |

`[cmd]` **Zwei Fehler meines ersten Entwurfs, beide gemessen und
behoben:**

1. *„usa · **false** · not_prohibited"* und *„summary en · **false** ·
   **0** · D"* — `true`/`false`/Zahlen sagen ohne ihr Feld nichts.
   Jetzt steht dort der Feldname.
2. *„**[]**"* bei Qualitaet und *„**1**"* bei Wechselwirkungen — leere
   Sammlungen und die blosse Zeilennummer. `alleZeilen()` benennt
   Zeilen jetzt nach `partner_label`/`organ`/`jurisdiction`.

### 3 · Der Schemabericht ist raus

`[read]` **Die Trennlinie, nach der ich entschieden habe:** **DASS**
eine Angabe fehlt, ist fuer den Nutzer relevant — **WARUM** sie im
Schema fehlt, nicht.

Von den acht Eintraegen trugen sechs `art: 'fehlt'` (reine
Schemageschichte: *„Die alte Breittabelle fuehrte `cyp` als jsonb"*).
**Das gehoert in den Bericht.**

**An seiner Stelle steht eine Zeile**, und die ist substanzbezogen
statt schemabezogen:

    Ohne Angabe: Wechselwirkungen · Pharmakokinetik · Qualität.

`[cmd]` Gemessen, was da wirklich fehlt: `quality` bei **53 der 290**,
`interactions` bei **212**, `pharmacology` bei **0**.

`[read]` **`substanz-luecken.ts` bleibt** — die Messung war der halbe
Ertrag von C-252 und ist jetzt in den Kommentaren belegt. Sie steht nur
nicht mehr vor dem Nutzer.

### 4 · Die Kennung unter dem Namen

`[cmd]` Dort stand `sub_b30d752d32` — **an der auffaelligsten Stelle
des Fensters.**

**Entschieden: raus.** `[read]` Ein Datenbankschluessel hilft niemandem,
der wissen will, was Bromocriptine ist. **Die Darreichungsform bleibt**
— sie sagt etwas ueber die Substanz. Verloren geht nichts: der Slug ist
weiterhin der Stack-Anker (C-252), er wird nur nicht angezeigt.

---

## C-195 — beantwortet, nicht nochmal bauen

`[cmd]` **Alle acht Bloecke, die C-195 als fehlend nannte, gibt es
live:**

| Block | Zeilen | Substanzen |
|---|---|---|
| safety | 290 | 290 |
| warnings | 290 | 290 |
| regulatory | 1.119 | 290 |
| pharmacology | 566 | 566 |
| quality | 237 | 237 |
| identifiers | 1.226 | 283 |
| field_sources | 2.147 | 286 |
| interactions | 78 | 78 |

`[cmd]` **Die flachen Filterfelder auch:** `wada_status` 290 ·
`prescription_required` 601 · `dose_ceiling` 290 · `evidence_grade` 290.

`[cmd]` **Die C-185-Sorge ist geschlossen:** **alle 1.226**
Identifier-Zeilen tragen `evidence_provenance`.

**→ C-195 kann geschlossen werden.**

## C-107 — zur Haelfte

**Beantwortet:** `[cmd]` **`FAPUN3` gibt es** in `nutrient_defs`; der
Katalog ist von 44 auf 290 sichtbare gewachsen.

**Nicht beantwortet — der Kern des Punktes:**

`[cmd]` **`supplement_nutrients` traegt 17 Zeilen. Von den 290
sichtbaren haben 3 einen Naehrstoffbezug, 287 nicht.**

`[cmd]` **14 der 17 Bezuege haengen an VERBORGENEN Eintraegen:** die
generischen *Vitamin C · Magnesium · Zinc · Calcium · Iron · …* tragen
den Code, die sichtbaren Salzformen (*Magnesium citrate*, *Calcium
carbonate*, *Vitamin A retinol*) tragen keinen.

`[read]` **Das ist der C-107-Befund unveraendert** — der Gap-Score
bleibt nicht rechenbar. **Ich habe es nicht geloest, weil es C-244
(Salzform) ist**, und die liegt bei Tom; der Auftrag verbietet sie
ausdruecklich.

---

## WAS INS DETAIL GEBAUT WURDE — und was nicht

| Tabelle | Zeilen | echter Inhalt | Entscheidung |
|---|---|---|---|
| `supplement_wada` | 290 | **163 not_prohibited · 124 prohibited · 3 monitored** | **gebaut** |
| `supplement_warnings` | 290 | `dose_ceiling` **32 echt**, `doctor_consult_flags` **128** | **gebaut** |
| `supplement_organ_risks` | **1.450** | **1.446 = `unknown`** | **NICHT gebaut** |

`[read]` **Die groesste Tabelle ist die leerste.** Fuenf Organzeilen je
Substanz, 1.446 davon `unknown` — sie zu zeigen hiesse, jedem Eintrag
fuenf Zeilen *„unbekannt"* anzuhaengen. **Das saehe aus wie eine
Messung und waere keine.**

### Die JSON-Null-Falle

`[cmd]` **`dose_ceiling` ist bei 290 von 290 `is not null` — aber 258
tragen das JSON-Literal `null`. Echt gefuellt sind 32.**

`[read]` *„290 von 290 haben eine Obergrenze"* waere SQL-richtig und
fachlich falsch. **Ich hatte es zuerst so im Kommentar stehen** und
nach der Gegenmessung korrigiert.

`jsonNull()` wirft JSON-`null`, leeres Objekt und leeres Array weg —
**behaelt aber die echte 0 und `false`**: `detection_time_days: 0` ist
ein Messwert, `null` ist keiner.

`[cmd]` **Dieselbe Falle bei `studied_dose_ranges`:** 290 `is not
null`, **83 echt gefuellt.**

---

## NACHWEIS

### Gegenprobe, namentlich — ueber die laufende Seite

**Volles Detail — `Creatine monohydrate` (`sub_9f9bb8c160`):**

    wada_status      "not_prohibited"
    dose_ceiling     {"basis":"guideline (ISSN)","value":"3-5 g/day …
                      "source":"ISSN 2017 (PMID 28615996)"}
    Wechselwirkungen caffeine interaction debated (likely minimal)
    Ohne Angabe      (keine)

**Mit Luecken — `Bromocriptine` (`sub_b30d752d32`):**

    Evidenz oben     D — Experimental/grey-market compound
    Sicherheit       keine Angaben        (beide Felder `unknown`)
    dose_ceiling     NICHT dabei          (JSON-null, unterdrueckt)
    no_ceiling_reason "Unapproved/designer compound — no safe ceiling"
    Ohne Angabe      Wechselwirkungen · Pharmakokinetik · Qualität
    Schemabericht    nein
    Slug unter Namen nein

`[cmd]` **Kopfbereich mit Inhalt: 160 Zeichen** vor der ersten Klappe —
vorher stand dort nur ein Satz, und der Bericht fuellte den Rest.

### Negativprobe — sieben Eingriffe, alle rot

| Eingriff | vorher | mit Fehler | zurueck |
|---|---|---|---|
| 50er-Limit wieder einbauen | 6/0 | **5/1** | 6/0 |
| „Suche verfeinern" zurueck | 6/0 | **5/1** | 6/0 |
| `jsonNull` laesst JSON-null durch | 5/0 | **2/3** | 5/0 |
| Feldzahl statt Anriss | 8/0 | **7/1** | 8/0 |
| Schemabericht wieder anzeigen | 8/0 | **7/1** | 8/0 |
| `unbekannt` wieder als Inhalt | 6/0 | **4/2** | 6/0 |
| `true/false` wieder im Anriss | 6/0 | **5/1** | 6/0 |

**Alle Dateien byteweise identisch zurueck.**

`[cmd]` **Und ein Waechter hat mich selbst erwischt:** die erste
Fassung der Slug-Regel schlug auf den Stack-Anker an
(`open('add', { substanzId: satz.slug })`) — der **muss** den Slug
tragen. Die Regel prueft jetzt den Kopfbereich, nicht jede Verwendung.

### Stand

`[cmd]` `npx tsc --noEmit` **sauber** · Build **`Compiled
successfully`** · Tests **172 pass, 0 fail** · `sprachrueckfall`
**0 Funde** · `serverimport` **50 Chunks, 0 Treffer** · Bild
`backup/g177-katalog.png`, 2.926 ms.

---

## GEAENDERT

| Datei | |
|---|---|
| `v2/supplements/substanz-detail.tsx` | G-176 Limit raus · G-177 Evidenz oben, Anriss, Schemabericht raus, Slug raus |
| `lib/supplements/substanz-anzeige.ts` | `anriss()` **neu** |
| `lib/supplements/substanz-read.ts` | WADA + Warnschwellen · `alleZeilen()` benennt Zeilen |
| `lib/supplements/substanz-luecken.ts` | `jsonNull()` **neu** |
| `__tests__/anriss.test.ts` | **neu**, 6 Faelle |
| `__tests__/warnschwellen.test.ts` | **neu**, 5 Faelle |
| `__tests__/deutsch-und-scroll.test.ts` | 3 Waechter dazu |
| `tools/_g176-liste.mjs`, `_g177-detail.mjs`, `_c107-detail.mjs` | **neu** |

**`supplement_organ_risks` bewusst nicht angebunden.** Keine deutschen
Texte erfunden. `im_katalog` nicht umgangen.

## OFFEN

1. **C-107 bleibt offen:** 287 von 290 ohne Naehrstoffbezug, die
   Bezuege liegen auf den verborgenen generischen Eintraegen.
   **Haengt an C-244 (Salzform) — Tom.**
2. **`supplement_organ_risks` zu 99,7 % `unknown`** — die Kachel ist in
   einer Stunde gebaut, sobald die Recherche steht.
3. **`warning_de`/`warning_en` 0/290** und **`detection_time_days`
   0/290** — beide Wege stehen, die Felder erscheinen von selbst.
4. **`summary_de` 0/288** — die Evidenzsaetze sind englisch; der
   Rueckfall greift, aber uebersetzt ist nichts.
