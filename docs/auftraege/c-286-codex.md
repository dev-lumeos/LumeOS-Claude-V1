# C-286 + C-287 — Codex, 2026-08-26

Bericht: `docs/berichte/c-286-codex.md`

**Eine Migration neben der Kette — und 148 Community-Zeilen, die
nirgends erscheinen.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

`[cmd]` **In C-283 lagen meine Zahlen dreimal zu niedrig:** UNII 420
statt „nicht genannt", RxNorm 113, Routen 498 statt 334. **Die
Kennungen lagen in `external_ids`, nicht auf der obersten Ebene.**

## 1 · C-286 — zwei Quellen fuer denselben Zustand

`[cmd]` **Beides existiert:**

    _pipeline/14_medical/283_medication_catalog_mapping.sql
    migrations/20260826180000_c283_medication_catalog_mapping.sql
                                                    3.237 Bytes

`[read]` **`supabase/README.md` und die Projektanweisung sagen:** der
Datenbankzustand entsteht aus der Kette in `_pipeline/`, **nicht aus
`migrations/`.**

`[read]` **Warum das nicht formal ist:** zwei Quellen fuer denselben
Zustand sind genau der Mechanismus, der uns zweimal auseinanderlaufen
liess — **C-265** (drei unverkettete Medical-Schritte, live gruen /
Kette rot) und **C-277** (`im_katalog` ohne `parent_id`-Bedingung,
416 gegen 447). **Beide Male hat es Stunden gekostet, die Ursache zu
finden.**

**Zu tun:** `[read]` **Absicht oder Rest?** Wenn eine
Strukturaenderung anders nicht greift, **gehoert die Begruendung in
den Bericht und die Ausnahme nach `supabase/README.md`.** Wenn nicht:
raus.

`[read]` **Und wenn du sie behaeltst, brauchen wir einen Waechter**,
der meldet, wenn Kette und Migration dieselbe Aenderung tragen.
**Sonst ist es beim naechsten Mal wieder unsichtbar.**

## 2 · C-287 — 148 Community-Zeilen erreichen niemanden

`[cmd]` **Claude Code hat in G-199 gemessen: der Community-Reiter
erscheint bei 49 der 412 Substanzen.** Der Grund liegt in der
Zuordnung.

`[cmd]` **Vom Orchestrator nachgemessen, je Datensatz ohne Kennung:**

    community_science_delta            30 von 30   ALLE
    community_usage_concepts            3 von 3    ALLE
    community_terminology_terms        57 von 71
    community_product_quality_signals  32 von 40
    community_stack_patterns           24 von 31
    community_side_effect_patterns      2 von 37

`[read]` **Die Verteilung ist kein Zufall.** Nebenwirkungen betreffen
einen Stoff und sind fast vollstaendig zugeordnet. **Mythen und
Konzepte betreffen eine Praxis** — *„SARMs sind selektiv"* gehoert zu
keiner einzelnen Substanz.

### Drei Befunde von Claude Code, die du pruefen sollst

`[cmd]` **`substance_ids` traegt Slugs (`sub_xxxx`), keine UUIDs** —
0 Treffer ueber UUID, 49 ueber Slug.

`[cmd]` **`substance_class` greift gar nicht:** das Vokabular
(`aas_19nor`, `sarms`) hat **0 Treffer** gegen `supplement_groups`, wo
nur `supplement`, `enhanced`, `peptide` stehen.

`[read]` **Damit ist der Klassen-Rueckfall, den ich in C-280
beschrieben habe, nicht vorhanden** — ich hatte ihn als Sicherheitsnetz
angenommen, **er existiert nicht.**

### Zu tun

**a) Die Klassen abbilden.** `[cmd]` Kimis Vokabular gegen
`supplement_categories` — dort stehen `injizierbare_aas`, `sarm`,
`orale_aas`. `[read]` **Miss, wie viele der 19 Klassen sich zuordnen
lassen. Wo nicht: melden, nicht raten** — eine falsche Klasse zeigt
Warnungen bei den falschen Stoffen.

**b) Die Mythen anders anbinden.** `[read]` **Sie gehoeren nicht an
eine Substanz, sondern an eine Gruppe** — *„SARMs sind selektiv"* an
alle SARMs. `[cmd]` `community_science_delta` hat 30 Zeilen; **miss,
worauf sie sich beziehen**, bevor du eine Zuordnung baust.

**c) Die Begriffe brauchen vermutlich gar keine.** `[read]` Ein
Glossar mit 71 Eintraegen ist nicht substanzgebunden — *„blast"* und
*„pin"* gelten allgemein. **Pruef, ob ein eigener Ort richtiger ist
als eine erzwungene Zuordnung.**

## WAS NICHT ZU TUN IST

**Keine Zuordnung raten.** `[read]` Eine falsch zugeordnete
Nebenwirkung ist schlimmer als eine fehlende.

**Die Sicht nicht oeffnen.** `[cmd]` `raw` und die vier
Anleitungsfelder bleiben draussen — der Waechter aus C-280 prueft es.

**Keinen Schreibweg fuer `user_medications`** — `[cmd]` **C-285** ist
offen, die Tabelle speichert im Klartext.

`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Deine Zahlen neben meinen.**

    Community-Reiter erscheint bei    heute 49 von 412
    Zeilen ohne Zuordnung             heute 148 von 212
    Klassen zuordenbar                Zahl nennen, von 19

**Gegenprobe an drei namentlich genannten:** Trenbolone acetate
(zeigt heute 7) · LGD-4033 (zeigt 4) · **Vitamin D3 — dort darf
weiterhin nichts erscheinen.**

**Negativprobe:** eine Klasse falsch zuordnen — ein Waechter muss rot
werden.

`[cmd]` **Und wie zuletzt: `im_katalog` fuer Kette und Live.** Beide
stehen bei **412**, sichtbare Unterformen **0**.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Schema-Pruefer lief in C-283 nach 184 Sekunden ins
Timeout.** `[read]` **Wenn das wieder passiert: melden, nicht
ueberspringen** — es ist neu und gehoert gemessen, bevor es zur
Gewohnheit wird.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
