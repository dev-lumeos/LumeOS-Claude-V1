# G-207 — Die Symptomtabellen gibt es schon

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-27**

---

## Kurz

**Der Auftrag geht davon aus, dass eine Symptomtabelle fehlt und
entworfen werden muss.** `[cmd]` **Sie existiert** —
`medical.symptoms` (34 Zeilen) und `medical.symptom_biomarker_map`
(102 Zeilen), beide fuer `authenticated` lesbar. **Kein
Tabellenentwurf noetig, nur der Weg dorthin.**

`[cmd]` **Und die entscheidende Frage des Auftrags — zeigt jede
Zuordnung auf einen Biomarker, den es gibt? — lautet NEIN.** Zwei
Marker fehlen im Katalog, 49 Symptome ebenso, 6 Zuordnungen tragen
keine LOINC-Kennung. **Die Konstante hat das nie gezeigt; jetzt steht
es auf dem Schirm.**

---

## 1 · Deine Zahlen neben meinen

| | Auftrag | gemessen | |
|---|---|---|---|
| Dateien im Modul | 16 | 16 | ✓ |
| Tabs | 5 | 5 | ✓ |
| Konstanten in `daten.ts` | 15 | 15 | ✓ |
| `SYMPTOMS` benutzt an | 3 Stellen | 3 | ✓ |
| **Attrappen im Modul** | **27** | **18** | ✗ |

`[cmd]` **18, nicht 27** — verteilt auf **drei** Dateien, nicht acht:
`tab-biomarker.tsx` 7, `tab-tracking.tsx` 7, `ansicht.tsx` 4. `[read]`
Die Zahl 27 duerfte aus einer Zaehlung stammen, die auch Vorkommen in
Kommentaren und Konstantennamen mitzaehlt.

### Die Konstanten, gemessen

    SYMPTOMS                    4 Eintraege
    SYMPTOM_BIOMARKER_MAP       7 Symptome
    Zuordnungen                28
    verschiedene Biomarker     17

`[cmd]` **Eine Unstimmigkeit schon in der Konstante:** die Karte
fuehrt **7** Symptome, die Liste nur **4**. `low_libido`,
`poor_recovery` und `weight_gain` haben eine Zuordnung, aber keinen
Eintrag — **im Tracking-Tab erscheinen sie deshalb nie.**

---

## 2 · Die Tabellen existieren — und sind reicher

`[cmd]` **`medical.symptoms`** — 34 Zeilen:
`symptom_id, slug, name_de, name_en, name_th, source`

`[cmd]` **`medical.symptom_biomarker_map`** — 102 Zeilen:
`symptom_id, marker_id, biomarker_loinc_code, relation_type,
specificity, reason_de, is_diagnosis_claim, symptom_match_status,
marker_match_status`

`[read]` **Der Auftrag zitiert C-159:** *„keine Symptomtabelle im
ganzen Schema"*. **Das gilt nicht mehr.** Beide Tabellen tragen RLS
mit `SELECT`-Policy fuer `authenticated` — **ueber den normalen
Sitzungsclient erreichbar, kein Eingriff in `_pipeline/` noetig.**

**Was die Tabelle kann, was die Konstante nicht konnte:**

| | Konstante | Tabelle |
|---|---|---|
| Symptome | 4 | **34** |
| Zuordnungen | 28 | **102** |
| LOINC-Kennung | nein | **96 von 102** |
| Aussagekraft | nein | HIGH 10 · MODERATE 48 · LOW 44 |
| Begruendung auf Deutsch | nein | **102 von 102** |
| Art der Beziehung | nein | 6 Arten, 70× `DIFFERENTIAL_RELEVANCE` |
| Diagnosemarke | nein | `is_diagnosis_claim` — bei allen 102 `false` |

---

## 3 · Die entscheidende Frage: NEIN

**Auftrag: *„Zeigt jede Zuordnung auf einen Biomarker, den es gibt?
… In der Konstante faellt sie nie auf."***

`[cmd]` **Gemessen gegen `medical.lab_marker_catalog` (66 Marker):**

    Zuordnungen gesamt              102
    Marker NICHT im Katalog           2
    Symptom NICHT im Katalog         49
    ohne LOINC-Kennung                6

`[cmd]` **Die zwei fehlenden Marker, namentlich:**

| Marker | Symptom | Vermerk der Tabelle |
|---|---|---|
| `lab_bnp` | `sym_edema` | *„natriuretisches Peptid fehlt"* |
| `lab_crp` | `sym_abdominal_pain` | *„CRP fehlt im Katalog; unspez…"* |

`[read]` **Die Tabelle weiss es selbst** — sie fuehrt
`marker_match_status` und `symptom_match_status`:

    matched                | matched                    | 52
    symptom_not_in_catalog | matched                    | 48
    matched                | marker_not_in_explanations |  1
    symptom_not_in_catalog | marker_not_in_explanations |  1

### Und so sah es vorher aus

`[cmd]` **`tab-tracking.tsx:114`** loeste gegen die Konstante
`BIOMARKERS` auf und warf weg, was nicht passte:

```
.map(n => BIOMARKERS.find(b => b.name === n))
.filter((b): b is NonNullable<typeof b> => Boolean(b))
```

`[cmd]` **Und Zeile 218:** `{b?.abbr ?? m}` — **ein unbekannter Marker
sah aus wie ein bekannter**, nur mit seiner Rohkennung.

`[read]` **Beides ist genau das, was der Auftrag beschreibt.** Jetzt
traegt die Kachel die Marke `unbekannt` in Warnfarbe, und unter der
Karte steht, wie viele es sind.

---

## 4 · Was ich NICHT gebaut habe — und warum

**Die vier Tabs, die sieben Konstanten:** nicht angefasst, wie
verlangt.

**Aber auch `SYMPTOMS` selbst bleibt eine Konstante**, und das ist
eine Abweichung, die ich begruenden muss:

`[cmd]` **`medical.symptoms` ist ein KATALOG von 34 Symptomarten** —
`acne`, `anxiety`, `fatigue`, `tremor`. `[cmd]` **Eine Tabelle fuer
ERFASSTE Symptome gibt es nicht:** kein `severity`, kein `onset`, kein
`impact`, keine `triggers`, kein `resolved`. `[cmd]` Geprueft ueber
alle Schemata — es gibt genau zwei Tabellen mit `symptom` im Namen,
beide Katalog.

`[read]` **Die vier Eintraege in `SYMPTOMS` sind Tagebuchzeilen, keine
Katalogeintraege.** Sie haben nirgends eine Spalte. **Sie anzubinden
haette geheissen, eine Tabelle anzulegen — und das gehoert Codex.**

**Beschreibung fuer C-293** (nicht angelegt, wie verlangt):

    medical.user_symptom_logs
      id            uuid, Primaerschluessel
      user_id       uuid -> auth.users, RLS auf auth.uid()
      symptom_id    text -> medical.symptoms(symptom_id)
      severity      smallint  1..10
      impact        smallint  1..10
      onset_date    date
      resolved_date date NULL
      triggers      text[]
      relieving     text[]
      note          text NULL
      created_at / updated_at

`[read]` **Fremdschluessel auf `symptoms(symptom_id)` ist der Punkt** —
**dann kann genau der Fehler nicht mehr entstehen**, den dieser
Auftrag in der Konstante gesucht hat.

---

## 5 · Was gebaut ist

| Datei | Was |
|---|---|
| `lib/medical/symptome.ts` | **neu** — Aufloesung mit Befundliste, serverfrei |
| `lib/medical/lesen.ts` | `ladeSymptome()` — drei Tabellen, ein `Promise.all` |
| `lib/medical/__tests__/symptome.test.ts` | **neu** — 7 Pruefungen |
| `app/v2/medical/echtdaten.ts` | `symptome: SymptomStand` |
| `app/v2/medical/page.tsx` | im bestehenden `Promise.all` |
| `app/v2/medical/tab-tracking.tsx` | Karte auf die Tabellen |
| `components/shell/__tests__/v2-attrappen.test.ts` | Erwartung 7 → 6 |

`[read]` **Der Leseweg laeuft im vorhandenen `Promise.all` mit** —
keine zusaetzliche Rundreise nacheinander (die Lehre aus G-190).

---

## 6 · Nachweis

| | vorher | nachher |
|---|---|---|
| Symptome in `SYMPTOMS` | 4 | 4 *(unveraendert, s. Abschnitt 4)* |
| Zuordnungen in der Konstante | 28 | — |
| **Zuordnungen aus der Tabelle** | — | **102** |
| davon Marker unbekannt | *unsichtbar* | **2, benannt** |
| davon Symptom unbekannt | *unsichtbar* | **49, markiert** |
| ohne LOINC | *unsichtbar* | **6, gezaehlt** |
| Attrappen im Modul | **18** | **17** |
| `tab-tracking.tsx` | 7 | **6** |

**Bildschirmfoto:** `backup/g207-tracking.png` — die Karte zeigt
*„102 Zuordnungen aus dem Katalog"*, und unter *edema* steht
**`lab_bnp · unbekannt · hoch`** in Warnfarbe.

`[cmd]` **Ladezeit:** 1.691 ms kalt / **282 ms warm** (Dokument).
**Der Server war beim ersten Lauf frisch gestartet** — die Lehre aus
G-205.

### Negativprobe

`[cmd]` **Datenseite**, in einer zurueckgerollten Transaktion:

| Schritt | Marker unbekannt |
|---|---|
| vorher | 2 |
| nach `update … = 'lab_voellig_erfunden'` | **3** |
| nach `rollback` | 2 |

`[cmd]` **Codeseite**, drei Sabotagen, SHA-identischer Rueckbau:

| Sabotage | |
|---|---|
| `zuordnungenAus(` → `zuordnungenAusX(` | **rot** |
| `.from('lab_marker_catalog')` → `…X` | **rot** |
| **Luecke wieder verschluckt** (`if (markerUnbekannt) continue`) | **rot** |

`[read]` **Die dritte ist die eigentliche:** sie stellt das alte
Verhalten wieder her — und faellt.

---

## 7 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe | **670 pass, 0 fail** |
| `symptome.test.ts` (neu) | 7 Pruefungen |
| `tools/verdrahtung-pruefen.mjs` | kein unbewachter Zuwachs |
| `tools/encoding-pruefen.mjs` | 20.167 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

`[cmd]` **Der Verdrahtungswaechter (G-200) bleibt gruen**, weil die
drei neuen Tabellen im Test namentlich stehen — **genau wofuer er
gebaut wurde.**

`[cmd]` **Ein Typrest aus G-203** (`messung-g203` in
`.next-gate/types`) blockierte den Typecheck und wurde entfernt —
**gezielt dieser Ordner, nicht `.next-gate`.**

**`supabase/_pipeline/` und `tools/` nicht angefasst** (C-293, Codex).
**Nichts auf `dev@lumeos.app` gespeichert.**
**Nicht committet, nicht gestaged.**

---

## 8 · Was ich als Punkte melde

**a) Zwei Marker fehlen im Katalog:** `lab_bnp` (BNP,
natriuretisches Peptid) und `lab_crp` (CRP). **Beide sind gaengige
Werte** — die Tabelle vermerkt es, der Katalog holt es nicht nach.

**b) 49 der 102 Zuordnungen zeigen auf Symptome ausserhalb des
Katalogs** — `sym_concentration_problems`, `sym_muscle_cramps`,
`sym_vomiting`, `sym_paresthesia` und weitere. **Entweder gehoeren sie
in `symptoms`, oder die Zuordnung ist verwaist.**

**c) `medical.symptoms.name_de` ist bei 0 von 34 gefuellt** — `name_en`
ebenso. **Angezeigt wird der Slug.** Dieselbe Lage wie im
Supplements-Katalog (C-252).

**d) Es fehlt eine Tabelle fuer erfasste Symptome** — Abschnitt 4, mit
Entwurf.

**e) `reason_de` ist bei allen 102 gefuellt und wird nicht gezeigt.**
`Pill` kennt kein `title`; der Grund braucht eine eigene Zeile oder
ein Aufklappen. **Kleiner eigener Punkt.**

**f) Die Zahl 27 im Auftrag stimmt nicht** — es sind 18 (Abschnitt 1).
