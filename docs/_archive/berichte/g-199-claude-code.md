# G-199 — Community angeschlossen, WADA aufgeraeumt, drei Zustaende

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

Alle fuenf Punkte sind umgesetzt. **Der Community-Reiter fuellt sich
jetzt** — Trenbolone acetate zeigt *„Aus der Community 7"*.

**Deine Zahlen stimmten diesmal alle neun.** `[read]` Was fehlte, war
etwas anderes: **wie viel davon ankommt.** Das ist die Zahl, die die
Arbeit bestimmt — Abschnitt 1.

---

## 1 · Deine Zahlen neben meinen

| | dein Auftrag | gemessen | |
|---|---|---|---|
| Zeilen in der Sicht | 212 | 212 | ✓ |
| Spalten | 28 | 28 | ✓ |
| Nebenwirkungen | 37 | 37 | ✓ |
| Stacks | 31 | 31 | ✓ |
| Qualitaetssignale | 40 | 40 | ✓ |
| Begriffe | 71 | 71 | ✓ |
| Science-Delta | 30 | 30 | ✓ |
| Konzepte | 3 | 3 | ✓ |
| `substance_ids` gefuellt | 64 | 64 | ✓ |

**Neun von neun.** `[read]` Die Regel hat trotzdem gelohnt — nicht
durch eine Abweichung, sondern durch die Zahl, die im Auftrag fehlte.

### Die Zahl, die entscheidet: 49

**Deine Frage: *„Meine Vermutung: deutlich weniger als 212 — miss
es."***

`[cmd]` **Der Reiter erscheint bei 49 der 412 sichtbaren
Substanzen**, ueber 64 Zeilen.

`[cmd]` **Der Grund, warum es so wenige sind:**

    Zeilen mit substance_ids          64 von 212
    Zeilen mit substance_class        37
    Zeilen mit WEDER NOCH            146   ← nicht zuordenbar

`[cmd]` **`substance_ids` traegt Slugs** (`sub_xxxx`), nicht UUIDs —
320 Substanzen tragen so einen Slug. **0 Treffer ueber die UUID, 49
ueber den Slug.**

`[cmd]` **Und der Klassen-Rueckfall greift nicht:** `substance_class`
benutzt ein eigenes Vokabular (`aas_19nor`, `sarms`, `gh_igf`) —
**0 Treffer** gegen `supplement_groups.code`, wo nur `supplement`,
`enhanced` und `peptide` stehen.

`[cmd]` **Je Typ, zuordenbar ueber Kennungen:**

    nebenwirkung      35 von 37
    begriff           14 von 71
    produktqualitaet   8 von 40
    stack_tradeoff     7 von 31
    mythos             0 von 30
    konzept            0 von  3

`[read]` **Das ist ein Befund, kein Mangel meiner Arbeit:** die 30
Mythen und 3 Konzepte sind im Bestand, aber an keine Substanz
gebunden. **Sie erscheinen deshalb nirgends.**

---

## 2 · Warum der Reiter haengen blieb

`[cmd]` **G-192 las `wissen.community_records` ueber einen
Service-Role-Client** und gab `null` zurueck, sobald PostgREST das
Schema `wissen` nicht kennt. **Genau das war der Fall.**

`[cmd]` **Die Sicht aus C-280 liegt in `supplements`**, `authenticated`
hat SELECT — **sie kommt ueber den normalen Sitzungsclient an.** Kein
zweiter Verbindungsweg mehr.

`[cmd]` **Die Mapper mussten mit:** die Sicht ist flach (28 Spalten),
der alte Weg las `r.raw.*` als JSON. Alle fuenf umgeschrieben.

**`evidence_class` steht jetzt sichtbar im Reiterkopf:**
*„Evidenzklasse E · Erfahrungsberichte, keine Studien"*. `[cmd]` Bei
allen 212 Zeilen `E`.

---

## 3 · Punkt 4: die drei Zustaende, gemessen vor der Form

**Auftrag: *„Wenn Zustand drei fast nie vorkommt, brauchen zwei
Zustaende eine eigene Form und der dritte nicht."***

`[cmd]` **Gemessen ueber die 412 sichtbaren:**

| Feld | Wert | Grund | nicht erhoben |
|---|---|---|---|
| `guideline_dose` | **14** | 261 | **137** |
| `upper_limit` | **9** | 246 | **157** |
| `studied_dose_ranges` | 98 | 85 | **229** |
| `official_label_dose` | 40 | 236 | **136** |

`[read]` **Die Bedingung ist nicht eingetreten.** Zustand drei ist bei
drei von vier Feldern die zweitgroesste Gruppe, bei
`studied_dose_ranges` die groesste. **Er bekommt eine eigene Form.**

`[read]` **Und die Zahlen sagen noch etwas:** ein echter Wert ist die
Ausnahme (9–98 von 412). **Wer nur „Wert oder nichts" baut, zeigt bei
neun von zehn Substanzen eine leere Kachel** — genau der Zustand, den
Tom beanstandet hat.

**Die Form:**

    wert           grosse Zahl
    gibt_es_nicht  der Satz, normale Schrift, gedaempft
    nicht_erhoben  „Nicht erhoben", kursiv, gestrichelter Rand

`[read]` **Kein Strich beim dritten Zustand** — ein Strich sieht aus
wie eine Angabe (dieselbe Regel, aus der in G-191 der Strich flog).
**Keine eigene Farbe**: die Ordnung aus G-196 gilt, und *„nicht
erhoben"* ist keine der vier Bedeutungen.

---

## 4 · Ein Befund: `Zahlenkasten` ist geloescht

`[cmd]` Nach dem Umbau hatte er **null Aufrufer** — er war der Rest
von G-191, wo der Statuscode aus der Kachel flog und die graue Zeile
als Notloesung blieb.

`[read]` **Nicht auskommentiert, sondern weg** (G-163): eine
Notloesung, die niemand aufruft, wird beim naechsten Umbau
versehentlich wiederbelebt.

---

## 5 · Gegenprobe an vier namentlich genannten

| Substanz | Fall | Ergebnis |
|---|---|---|
| **Trenbolone acetate** | 19-nor-AAS, *„Deca dick"* | **Community 7** |
| **LGD-4033 (ligandrol)** | SARM | **Community 4** |
| **Vitamin D3** | Vitamin | **kein Community-Reiter** ✓ |
| **Desoxymethyltestosterone** | WADA in der Dosierung | **Kachel weg** ✓ |

`[cmd]` **Desoxymethyltestosterone, Dosierungs-Reiter, beide Themen:**

    Kacheln:     Übliche Menge · Obergrenze · Einnahme · Einheit
    Zustaende:   gibt_es_nicht · gibt_es_nicht · nicht_erhoben · nicht_erhoben
    WADA-Kachel: nein
    graue Zeilen: 0

**Bilder:** `backup/g199-dmt-hell-1280.png`,
`g199-dmt-dunkel-1920.png`.

---

## 6 · Negativprobe — und der fuenfte blinde Fleck

`[cmd]` Fuenf Sabotagen, SHA-identischer Rueckbau:

| Sabotage | |
|---|---|
| vierter Zustand in der Rechnung | **rot** (4 Tests) |
| vierter Zustand in der Anzeige | **rot** |
| Kacheln nicht gezeigt | **rot** |
| WADA zurueck in die Dosierung | **rot** |
| **Community-Lesepfad gekappt** | **erst gruen** → jetzt rot |

`[read]` **Der fuenfte blieb im ersten Lauf gruen.**
`.from('community_anzeige')` auf `…X` geaendert — **kein Test fiel
um.** Das ist derselbe Fehler wie in G-186/187/191/184/196: die
Funktion war geprueft, die Verdrahtung nicht.

`[read]` **Und er waere teuer gewesen:** genau so ist G-192 haengen
geblieben — der Lesepfad gab still `null` zurueck, und niemand merkte
es. **Der Waechter steht jetzt.**

---

## 7 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe | **663 pass, 0 fail** |
| `dosis-zustand.test.ts` (neu) | **10 Pruefungen** |
| `tools/serverimport-pruefen.mjs` | 51 Chunks, 0 Treffer |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/encoding-pruefen.mjs` | 20.052 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Der Dev-Server wurde NICHT neu gestartet** — durchgehend **PID
351936**.

**`.v2-supp-tafel` nicht angefasst** (G-197 offen).
**`supabase/_pipeline/` nicht angefasst** (C-283, Codex).
**Nicht committet, nicht gestaged.**

---

## 8 · Was ich als Befund melde

**a) 146 der 212 Community-Zeilen sind an keine Substanz gebunden** —
darunter **alle 30 Mythen und alle 3 Konzepte.** Sie sind im Bestand,
erscheinen aber nirgends. **Ein Datenauftrag, kein Anzeigefehler.**

**b) `substance_class` ist im Katalog nicht abbildbar.** Das Vokabular
der Sicht (`aas_19nor`, `sarms`) hat keine Entsprechung in
`supplement_groups`. **Der im Auftrag erwaehnte Klassen-Rueckfall
existiert nicht** — er muesste erst gebaut werden, und das waere eine
Zuordnung ueber geratene Gleichsetzungen.

**c) Der Verdrahtungswaechter fehlte zum fuenften Mal**, und diesmal
genau an der Stelle, die G-192 haengen liess.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/supplements/substanz-read.ts` | Community-Lesepfad auf `community_anzeige`, fuenf Mapper, `evidenzklasse` |
| `apps/web/src/lib/supplements/dosis-zustand.ts` | **neu** — die drei Zustaende, feste Kachelmenge |
| `apps/web/src/lib/supplements/__tests__/dosis-zustand.test.ts` | **neu** — 10 Pruefungen inkl. Verdrahtung |
| `apps/web/src/app/v2/supplements/substanz-tafel.tsx` | `DosisKacheln`, WADA aus der Dosierung, Evidenzmarke, `Zahlenkasten` geloescht |
| `apps/web/src/app/v2/supplements/supplements.css` | drei Zustaende, Evidenzmarke |
| `apps/web/src/lib/supplements/__tests__/substanz-reiter.test.ts` | Vorgabe um `evidenzklasse` ergaenzt |
| `backup/g199-schuss.mjs` | Nachweisskript (Kacheln, Zustaende, beide Themen) |
