---
nr: C-405
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: E-63
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 4b841cca
beruehrt:
  tabellen: [nutrition.nutrient_defs]
zahlen:
  gemessen: 2026-09-02
  in_sonstige: 2
---

# C-405 — *Sonstige* faellt weg

## Befund

Tom, 2026-09-02: *,,das sieht unprofessionell aus denn die sind alle
zuteilbar."*

`[cmd]` **`group_de = 'Sonstige Naehrstoffe'` haelt zwei Codes:**

    CHORL   Cholesterin        parent = NULL
    NT      Stickstoff, gesamt parent = NULL

## Was zu tun ist

### 1 · `CHORL` in *Fettbegleitstoffe*

`[read]` **Cholesterin ist ein Sterol, kein Fett.** `[cmd]`
**`FAMS + FAPU + FASAT` ergeben `FAT`, Cholesterin nicht.**

`[read]` **Kein `parent_code`** — **sonst erschiene es in einer
Summe, in die es nicht gehoert.** `[read]` **Dieselbe Trennung wie
bei `FIBT`** (E-48).

`[read]` **Neue Gruppe, direkt nach den Fettsaeuren einsortiert** —
`sort_index` entsprechend.

### 2 · `NT` zu Protein

`[cmd]` **`PROT625` heisst so, weil es `NT x 6,25` ist.**

`[read]` **Miss, ob ein `parent_code` richtig ist:** `[read]`
**Stickstoff ist kein Bestandteil von Protein, sondern seine
Quelle.** `[read]` **Die Gruppe reicht vermutlich.**

### 3 · Die Gruppe entfernen

`[cmd]` **Danach ist `Sonstige Naehrstoffe` leer** — **und die
Anzeige zeigt sie nicht mehr.**

`[cmd]` **G-136 hat am 02.09. den Kartenbau geaendert:**
`naehrstoff-anzeige.ts:karteFuerWurzel`. `[read]` **Melde, wenn dort
etwas nachzuziehen ist** — **das ist ein UI-Auftrag.**

## Und der Name

`[cmd]` **Der Code heisst `CHORL`, nicht `CHOL`.**

`[cmd]` **C-346 hat am 02.09. *CHORL auf CHOL* im Legacy-Mapping
gesetzt** — **nicht in `nutrient_defs`.**

`[read]` **Zu klaeren, ob die Definition mitziehen soll** — **oder ob
`CHORL` der BLS-Code bleibt und `CHOL` nur die Anzeige ist.**

## Auftrag

**Mitbeauftragt: C-406.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-405 — *Sonstige* faellt weg (E-63)

`[cmd]` **`nutrition.nutrient_defs`, `group_de = 'Sonstige
Naehrstoffe'` haelt zwei Codes:** `CHORL` und `NT`, beide ohne
`parent_code`.

**`CHORL` in *Fettbegleitstoffe*, kein `parent_code`.**

`[read]` **Cholesterin ist ein Sterol, kein Fett.** `[cmd]`
**`FAMS + FAPU + FASAT` ergeben `FAT`, Cholesterin nicht.**
`[read]` **Ein `parent_code` liesse es in einer Summe erscheinen, in
die es nicht gehoert** — dieselbe Trennung wie bei `FIBT` (E-48).

**`NT` zu Protein.** `[cmd]` **`PROT625` heisst so, weil es
`NT x 6,25` ist.** `[read]` **Miss, ob ein `parent_code` richtig
ist** — **Stickstoff ist kein Bestandteil von Protein, sondern seine
Quelle.** **Die Gruppe reicht vermutlich.**

`[cmd]` **Danach ist die Gruppe leer** — **melde, wenn in
`naehrstoff-anzeige.ts` etwas nachzuziehen ist** (UI-Auftrag).

`[cmd]` **Und der Code heisst `CHORL`, nicht `CHOL`.** `[cmd]`
**C-346 setzte *CHORL auf CHOL* im Legacy-Mapping, nicht in
`nutrient_defs`.** `[read]` **Zu klaeren, ob die Definition
mitzieht.**

### 2 · C-406 — `strong_avoid` entfernen

`[cmd]` **Claude Code hat gemessen: der Nutzer braucht die mittlere
Stufe je Lebensmittel nicht.**

`[cmd]` **Vier Stellen in `supabase/`:** `050:63`, `074:75`,
`075:263`, `075:837`.

`[read]` **Die mittlere Stufe bleibt ueber `intolerances`
erhalten** — `075:1053-1065`: **`strong` schliesst bei leerem
Suchbegriff aus.** `[read]` **Sie kommt nur nicht mehr aus einem
Wert, den niemand setzt.**

`[cmd]` **`apps/` traegt ihn noch an vier Stellen** —
`vorlieben-aktionen.ts`, `daumen-schreiben.ts`, `food-search.ts` und
ein Test. `[read]` **Melde, was dort nachzuziehen ist** — **nicht
selbst aendern.**

### Was nicht zu tun ist

**Kein `parent_code` fuer `CHORL`** — E-63.
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    CHORL          Fettbegleitstoffe, kein parent_code
    NT             bei Protein, parent oder nur Gruppe -- begruendet
    Sonstige       leer, gezaehlt
    strong_avoid   vier Stellen weg, CHECK bereinigt
    intolerances   die mittlere Stufe wirkt weiter, belegt
    apps/          was nachzuziehen ist, gemeldet

## Bericht

`[cmd]` 2026-09-05 live geprueft und eingespielt.

### C-405

- `CHORL` ist weiter der Definitionscode (C-346 mappt nur den
  Legacy-Quellschluessel `CHOL` darauf). Seine Definition liegt nun in
  `Fettbegleitstoffe`, `sort_index = 118`, direkt nach den Fettsaeuren,
  und hat weiterhin keinen `parent_code`. Cholesterin wird damit nicht
  faelschlich zu `FAT` aufsummiert.
- `NT` liegt nun bei `Makronaehrstoffe` und hat ebenfalls keinen
  `parent_code`. `PROT625 = NT x 6,25` beschreibt eine Umrechnung, keine
  Bestandteilsbeziehung; ein Parent wuerde eine falsche Summandenbeziehung
  modellieren.
- `Sonstige Naehrstoffe` hat danach 0 Codes; der Baum hat 41 Wurzeln und
  97 Kinder (vorher 40/98).

`apps/` blieb unveraendert. Fuer die Anzeige ist ein UI-Folgeauftrag
noetig: In `apps/web/src/lib/nutrition/naehrstoff-anzeige.ts` muss `NT`
der Protein-Karte zugeordnet werden, und `Fettbegleitstoffe` gehoert in
`KARTEN_REIHENFOLGE` direkt hinter `Fette`. Ohne diese Nacharbeit landet
`NT` weiterhin auf der Sonstige-Karte bzw. die neue Karte fehlt in der
Reihenfolge.

### C-406

- `strong_avoid` ist aus dem CHECK von
  `nutrition.food_preference_items` und aus den drei lesenden
  Pipeline-Stellen entfernt. Es gab keine gespeicherten
  `strong_avoid`-Zeilen.
- Die Intoleranzwirkung bleibt erhalten: Das Dev-Profil hat
  `intolerances = {lactose}`; die materialisierten Suchziele enthalten
  1.021 `profile_intolerance`-Treffer auf Stufe `strong`. Die Suche nach
  `Milch` liefert diese weiterhin als `preference_level = strong`,
  `preference_match_type = intolerance` und `score = -25`.
- In `apps/` bleiben vier bewusst nicht angefasste Altstellen:
  `src/lib/nutrition/daumen-schreiben.ts:49`,
  `src/lib/nutrition/food-search.ts:760`,
  `src/lib/nutrition/__tests__/daumen-schreiben.test.ts:39` und
  `src/app/v2/nutrition/vorlieben-aktionen.ts:48`.

Nachweis: die neue C-405/C-406-Validierung und der bestehende
C-346-Legacy-Mapping-Test sind gruen; der gezielte ESLint-Lauf hat keine
Fehler. Keine Migration, keine App-Datei und kein Dev-Server wurden
angefasst; nichts wurde gestaged oder committed.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### *Sonstige* ist leer

`[cmd]` **Selbst gemessen:**

    CHORL | Fettbegleitstoffe | parent = -
    NT    | Makronaehrstoffe  | parent = -

`[cmd]` **`group_de ilike '%sonstig%'` liefert nichts.**

`[read]` **Tom, 2026-09-07:** *,,das sieht unprofessionell aus denn
die sind alle zuteilbar."* **Erledigt.**

### `NT` bei Makronaehrstoffen, nicht als Kind

`[read]` **Ich hatte *zu Protein* geschrieben und offen gelassen, ob
ein `parent_code` richtig ist.**

`[cmd]` **Seine Antwort: Makronaehrstoffe, ohne `parent_code`** —
**`NT x 6,25 → PROT625` ist Umrechnung, keine Summen-Hierarchie.**

`[read]` **Das ist genauer als mein Auftrag.** `[read]` **Ein
`parent_code` haette behauptet, Stickstoff sei ein Bestandteil von
Protein** — **er ist seine Quelle.**

### Und der Name bleibt

`[cmd]` **`CHORL` bleibt `CHORL`.** `[cmd]` **C-346s `CHOL` bleibt
ausschliesslich Legacy-Mapping.**

`[read]` **Richtig: der BLS-Code ist der BLS-Code.** `[read]` **Eine
Umbenennung in der Definition haette die Herkunft verwischt.**

### C-406 — der CHECK ist bereinigt

`[cmd]` **Nachgemessen:**

    CHECK (strength IN ('hard_exclude', 'soft_dislike',
                        'neutral', 'like', 'boost'))

`[cmd]` **`strong_avoid` ist weg** — aus Constraint und
Lesefunktionen.

`[cmd]` **Und die Gegenprobe:** **Laktose liefert in der Suche
weiterhin `strong / intolerance` mit Score -25.**

`[read]` **Das ist der Beleg, der zaehlt:** **die mittlere Stufe
wirkt weiter, sie kommt nur nicht mehr aus einem Wert, den niemand
setzt.**

### Gemeldet, nicht selbst geaendert

`[cmd]` **`naehrstoff-anzeige.ts` braucht `NT` zu Protein und
*Fettbegleitstoffe* direkt nach *Fette*.**

`[cmd]` **Und vier alte `strong_avoid`-Stellen unter `apps/`.**

`[read]` **Beides gemeldet statt angefasst** — `apps/` **gehoert
Claude Code.** **Als G-347.**

**Abgenommen.**

