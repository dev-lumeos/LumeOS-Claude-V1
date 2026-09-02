---
nr: C-241
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: ae0fb34b
beruehrt:
  tabellen: ["nutrition.meal_plans", "medical.user_medications"]
  dateien: []
zahlen: null
---

# C-241 - Das Nachweiskonto traegt weder Essensplaene noch Medikamente

## Befund

(neu 2026-08-23). Aus der Pruefung von G-161 und der
  Vorbereitung von G-162.

  `[cmd]` `nutrition.meal_plans` — gesamt 2, `dev@lumeos.app` 1,
  **`test-user@lumeos.local` 0**. Ebenso Wochen 6/3/0, Tage 42/21/0,
  Eintraege 112/56/0.
  `[cmd]` `medical.user_medications` — gesamt 2, `dev` 1,
  **`test-user` 0**.

  `[read]` **Die Folge ist konkret, nicht theoretisch:** G-161 musste
  seinen Nachweis auf `dev@lumeos.app` fuehren, gegen die Regel. Und
  **G-162 ist in seinem medical-Teil gar nicht beauftragbar** — der
  Punkt nennt *„`user_medications` 2"*, das ist die Gesamtzahl. Ein
  Agent saehe auf dem Nachweiskonto eine leere Liste und koennte nicht
  belegen, dass die Kachel liest.

  `[read]` **Beides ist in der Uebergabe als *bewusst leer* vermerkt.**
  Die Entscheidung ist also nicht *„vergessen"*, sondern *„soll das so
  bleiben"* — und wenn ja, wie ein Agent dort etwas belegen soll.
  Seeds gehoeren in die Kette, also zu Codex.

## Auftrag — das Nachweiskonto

**Mitbeauftragt: G-334, C-366.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-241 und G-334 sind derselbe Punkt

`[cmd]` **Du hast in C-394 gemessen:** `test-user@lumeos.local`
**hat keine Preferences, keine Meals und liegt nicht im
historischen Zwei-Konten-Seed.**

`[cmd]` **Und null `meal_slots`, waehrend `dev` fuenf traegt.**

`[read]` **Die Regel sagt: Nachweise werden auf `test-user`
gefuehrt** — **Laeufe auf `dev` ueberschreiben Toms gespeicherte
Einstellungen.**

`[read]` **Aber ein Konto ohne Daten kann nichts belegen.** `[read]`
**Und die Folge ist gemessen:** **in G-311 baute ein Agent seine
Buehne dort, raeumte sie weg, und der Nachweis existierte nicht mehr,
als der Orchestrator abnahm.**

### Was zu entscheiden ist — von dir vorgeschlagen, nicht entschieden

`[read]` **Bekommt `test-user` einen Grundbestand?**

`[cmd]` **Miss, was ein Nachweis heute braucht:** Plaene, Mahlzeiten,
Protokollzeilen, Slots, Vorlieben. `[cmd]` **`dev` traegt inzwischen
vier Plaene, sechs Logzeilen, fuenf Slots** — **vom Orchestrator
angelegt.**

`[read]` **Sag, was ein Seed abdecken muesste, und was er kosten
wuerde** — **jeder Kettenlauf schreibt ihn neu.**

### 2 · C-366 — der Pflegeweg fuer `food_tags`

`[cmd]` **E-55 entscheidet die zweite Tabelle, dein Entwurf aus
C-387 steht.**

`[read]` **Jetzt bauen** — Tabelle, RLS, **und der Leseweg, der
Import und Kuration vereint.**

`[cmd]` **Vier Schreiber wirken nur auf ihre eigene Tabelle:** 020,
027, 032, 221.

`[cmd]` **`apps/admin` hat eine Kurationsseite, 314 Zeilen,
vollstaendig lesend.** `[read]` **Der Schreibweg dorthin ist ein
UI-Auftrag, nicht deiner.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` loeschen** — die vier Plaene und fuenf
Slots stehen dort, damit Tom etwas sieht.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    test-user        was fehlt, je Tabelle gezaehlt
    Seed-Vorschlag   was er abdecken muesste, was er kostet
    food_tags_kur.   live, RLS, Leseweg vereint beide
    Entfernt-Zeile   ueberlebt einen Importlauf, belegt

## Bericht

### C-241 / G-334 — Messung 2026-09-02

`test-user@lumeos.local` hat fuer keinen der benoetigten Nachweise
eine Zeile. `dev@lumeos.app` wurde nur gelesen und nicht veraendert.

| Tabelle bzw. Nachweis | test-user | dev |
| --- | ---: | ---: |
| `nutrition.food_preferences` | 0 | 1 |
| `nutrition.food_preference_items` | 0 | 6 |
| `nutrition.meal_plans` | 0 | 4 |
| `nutrition.meal_plan_weeks` | 0 | 7 |
| `nutrition.meal_plan_days` | 0 | 49 |
| `nutrition.meal_plan_entries` | 0 | 169 |
| `nutrition.meals` | 0 | 730 |
| `nutrition.meal_items` | 0 | 2.300 |
| `nutrition.meal_plan_logs` | 0 | 6 |
| `nutrition.meal_slots` | 0 | 6 |

Die Slots sind beim aktuellen Messstand sechs, nicht die im Auftrag
genannten fuenf: Position 1 bis 6, einschliesslich `Spätmahlzeit`.
Die anderen genannten Werte (vier Plaene, sechs Protokollzeilen)
stimmen. Ein Nachweis auf `test-user` kann damit weder Plan- noch
Mahlzeiten-, Protokoll-, Slot- oder Vorlieben-Lesewege zeigen.

**Vorschlag, keine Entscheidung:** Ein idempotenter, ausschliesslich
auf `test-user` gerichteter Grund-Seed sollte mindestens eine
Vorlieben-Zeile mit einzelnen Praeferenzen, einen Plan mit Woche,
Tagen und Eintraegen, gespeicherte Mahlzeiten samt Positionen, zwei
unterschiedliche Protokollzustaende sowie geordnete Slots enthalten.
So kann ein Kettenlauf jeden dieser Lesewege belastbar zeigen, ohne
Toms Daten auf `dev` anzufassen.

Als Groessenordnung kostet ein kleiner Nachweis-Seed rund 30 bis 35
Einfügezeilen je frischem Lauf und bei Ersetzung ebenso viele
Loeschungen. Ein Seed, der den heutigen `dev`-Bestand nur nachbildet,
waere dagegen 3.278 Einfügezeilen und bei jedem erneuten Lauf bis zu
weitere 3.278 Loeschungen. Der kleine, fachlich gezielte Seed ist
deshalb der naheliegende Vorschlag; ob das Konto so befüllt werden
soll, bleibt bei Tom.

### C-366 — gebaut 2026-09-02

Die drei Migrationen `20260902073231`, `20260902073543` und
`20260902073914` sind lokal angewandt:

- `nutrition.food_tags_kuriert` traegt `food_id`, `tag_code`, die
  entschiedene Aktion `set` oder `removed` sowie Zeitstempel; die
  Kombination aus Lebensmittel und Tag ist eindeutig. Sie hat keine
  `confidence`.
- RLS ist aktiv. `authenticated` darf lesen, `anon` hat keinen
  Tabellenzugriff; der Test prueft den abgewiesenen anon-Zugriff.
  Der spaetere Admin-Schreibweg bleibt ausserhalb dieses Auftrags.
- `nutrition.food_tags_effective` ist der gemeinsame Leseweg:
  Import ohne Kuration erscheint als `import`, `removed` verbirgt ihn,
  und `set` erscheint als `curated`. Die Kuration hat damit auch bei
  einem bereits importierten Tag Vorrang.
- `food_search`, `preference_search_preview` und
  `refresh_food_preference_search_targets` lesen den gemeinsamen
  Leseweg. Die vier Kettenschreiber 020, 027, 032 und 221 bleiben
  unveraendert auf `nutrition.food_tags` begrenzt.

`supabase/_pipeline/_validierung/nutrition-c366-curated-food-tags.test.ts`
ist gruen. Er importiert eine temporaere Basiszeile, kuratiert sie als
`removed`, loescht und importiert sie erneut und prueft weiter 0
sichtbare Zeilen. Danach prueft er `set` als eine sichtbare Zeile aus
der Quelle `curated` sowie Tabelle, RLS, Policy und drei umgestellte
Lesefunktionen.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### `test-user` ist in allen Tabellen leer

`[cmd]` **0 Zeilen, ueberall.** `[cmd]` **`dev` traegt vier Plaene,
sechs Logzeilen, sechs Slots** — **nichts davon veraendert.**

`[read]` **Der Seed-Vorschlag steht im Punkt, mit Groessenordnung.**
`[read]` **Er entscheidet nicht, sondern legt vor** — richtig.

### C-366 — die zweite Tabelle steht

`[cmd]` **`nutrition.food_tags_kuriert`, Spalten `food_id`,
`tag_code`, `action`** — **kein `confidence`**, wie im Entwurf.

`[cmd]` **`nutrition.food_tags_effective` als Sicht**, RLS-geschuetzt.

`[cmd]` **Nachgemessen: 30.797 Zeilen in beiden** — **die Kuration
ist leer, also veraendert die Sicht nichts.**

`[read]` **Das ist der richtige Ausgangszustand:** **die Ueberlagerung
ist da und tut noch nichts.**

### Und die Zusage haelt in beide Richtungen

`[read]` **`removed` ueberdeckt auch einen erneuten Import.**
`[read]` **`set` gewinnt als Quelle `curated`.**

`[cmd]` **Der Reimport-Test ist gruen** —
`nutrition-c366-curated-food-tags.test.ts`.

`[read]` **Das war der Kern aus C-387:** *,,Eine Entfernt-Zeile
ueberdeckt auch einen Tag, den ein Import spaeter erneut setzt."*
**Belegt.**

### Und die Leser sind mit umgestellt

`[cmd]` **Suche, Vorschau und Suchziel-Aktualisierung lesen die
effektive Sicht.**

`[read]` **Nicht nur die Tabelle gebaut, sondern angeschlossen** —
**sonst waere es die vierte Funktion ohne Aufrufer gewesen.**

### Der Sicherheitshinweis

`[cmd]` **`pnpm audit` meldet 26 bestehende High-Severity-
Abhaengigkeiten**, darunter Next 14.2.35 und Playwright.

`[read]` **Er sagt selbst: nicht Teil dieses Auftrags.** **Als
A-69.**

**Abgenommen.** **Nicht committet** — der Gate ist rot wegen C-395.

