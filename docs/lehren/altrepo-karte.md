# Was im Vorgaengerrepo liegt

**Tom, 2026-09-08:** *,,muss ich nicht verstehen, wieso man ein grep
macht, wenn man simpelst ein ls machen kann und sich einfach mal
tief durch die strukturen durchhangeln und aufnehmen was alles da
ist."*

`[read]` **Diese Datei ist das Ergebnis des Durchhangelns.**
`[read]` **Sie ersetzt die Suche: wer wissen will, ob es etwas
gibt, sieht hier nach.**

`[cmd]` **`referenz/lumeos-2026/`** ? **nicht getrackt, `git grep`
findet dort NICHTS. Mit dem Dateisystem arbeiten.**

---

## Fuenf Apps

    apps/app/           696 Dateien   die Hauptanwendung
    apps/coach/         420           Coach-Portal
    apps/admin/         319
    apps/marketplace/   250
    apps/web/           190

## `src/modules/` ? zwoelf Fachmodule

    nutrition       147 Dateien
    training         89
    coach            55
    goals            52
    human-coach      32
    supplements      29
    recovery         27
    medical          14
    dashboard        12
    marketplace      12
    intelligence     11
    onboarding       11

`[read]` **`intelligence` und `onboarding` haben in LumeOS kein
Gegenstueck.**

## `docs/modules/` ? je Modul SIEBEN Dateien, gleiches Schema

    API.md          COMPONENTS.md   DATABASE.md
    FEATURES.md     MIGRATION.md    README.md
    RESEARCH.md

    auth          169 KB      human-coach   151 KB
    goals         142 KB      medical       140 KB
    marketplace   121 KB      supplements   109 KB (16 Dateien)
    coach          89 KB      nutrition      77 KB
    recovery       69 KB      training       59 KB

`[cmd]` **Zusammen 1.126 KB.**

`[read]` **`RESEARCH.md` je Modul ist der Teil, den keine heutige
Spec hat** ? **dort steht, WARUM etwas so gebaut wurde.**

`[cmd]` **`DATABASE.md` traegt volle `CREATE TABLE`-Anweisungen** ?
**Marketplace: 960 Zeilen, 14 Tabellen.**

## `research/` ? 259 Dateien, 2.679 KB

    nutrition    32 Dateien, 1257 KB
    training     25 Dateien,  491 KB
    supplements  19 Dateien,  312 KB
    medical      17 Dateien,   72 KB
    recovery     14 Dateien,   69 KB
    b2b          13 Dateien,   50 KB
    enhanced-supplements  13,  95 KB
    ai-coach     11 Dateien,   90 KB
    coach        10 Dateien,   52 KB
    marketplace  10 Dateien,   51 KB
    goals         9 Dateien,   59 KB
    system        6 Dateien,   61 KB
    gym           2 Dateien,   20 KB

`[read]` **Nutrition-Forschung allein: 1,2 MB.** `[read]` **Und
`b2b` und `gym` sind Themen, die LumeOS noch gar nicht hat.**

## `docs/buddy/` ? 88 Dateien

    archive/               63
    master-specification/   4
    architecture/           2
    engines/                2
    ai-layer/               1
    mobile-app/             1

## `packages/` ? geteilte Bausteine

    rules-engine     79 KB   src/nutrition.ts, src/safety.ts
    scoring          70 KB   src/nutrition.ts + Test
    contracts        47 KB   nutrition/food, aggregates, scoring
    config           12 KB
    ui                6 KB   button, modal, input, badge
    supabase          5 KB
    types             3 KB
    permissions       2 KB   src/rbac.ts
    auth              1 KB
    utils             1 KB

`[read]` **`rules-engine` und `scoring` sind die interessanten** ?
**79 und 70 KB Fachlogik, mit `safety.ts`.**

`[cmd]` **`packages/scoring` zeigt 1.353 Dateien** ? **1.328 davon
sind `node_modules`.** `[read]` **Nicht auf Ordnergroessen
verlassen.**

## Weitere Bereiche

    supabase/migrations/   73 Dateien
    scripts/              129
    pipeline/              66   results, runner, specs, tasks, tests
    imports/               21   supplements-minipc
    design-system/          8   components, tokens
    memory/                 9
    tests/buddy/           11

---

## Wie man hier sucht

`[read]` **Nicht `git grep`** ? **das Verzeichnis ist nicht
getrackt.**

**Sondern, in dieser Reihenfolge:**

    1  docs/modules/<modul>/README.md      was ist das Modul
    2  docs/modules/<modul>/DATABASE.md    die Tabellen
    3  docs/modules/<modul>/FEATURES.md    was es kann
    4  docs/modules/<modul>/RESEARCH.md    warum es so ist
    5  src/modules/<modul>/                der Code

`[read]` **Struktur ja, Code nie** ? **aber lesen, um zu
verstehen, ist keine Uebernahme.**
