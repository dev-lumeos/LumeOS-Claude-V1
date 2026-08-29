---
nr: C-346
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-336
entscheidung: null
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 7017e5e3
beruehrt:
  tabellen: [nutrition.nutrient_details]
  dateien:
    - supabase/_pipeline/015_kataloge/015a_nutrient_tree_details.ts
zahlen:
  gemessen: 2026-08-29
  bls_komponenten: 138
  detailtexte_neu_verknuepft: 2
  selen_komponenten: 0
---

# C-346 — zwei Detailtexte neu verknuepfen

## Ergebnis

`FD` und `CHORL` sind im Katalogimport neu mit den vorhandenen
Vorgaengertexten verknuepft. Es wurde kein Text geschrieben und keine
Referenzzahl geaendert.

Der Import bevorzugt nun fuer zwei bekannte Schluessel-Kollisionen die
belegten Legacy-Schluessel, **bevor** eine Schluesselgleichheit geprueft
wird:

| Zielcode | bisheriger `source_key` und Text | Quelle und neuer `source_key` | Text nach Neuaufbau |
| --- | --- | --- | --- |
| `FD` / Fluorid | `FD`: „Trockenmassegehalt eines Lebensmittels“ | `F` in `referenz/lumeos-2026/.../nutrientDetails.ts` | „Zahnschutz“ |
| `CHORL` / Cholesterin | `CHORL`: „Magensäure, Elektrolythaushalt, Verdauung“ | `CHOL` in derselben Datei | „Hormone, Zellmembranen“ |

Die Ursache war bestaetigt: Die beiden Zielcodes kommen in der
Vorgaengerdatei ebenfalls vor, bezeichnen dort aber etwas anderes.
Der bisherige Exakt-Treffer lief zuerst und verdeckte damit das bereits
vorhandene Mapping `F → FD` beziehungsweise `CHOL → CHORL`. Der
Import führt diese beiden, explizit dokumentierten Legacy-Zuordnungen
jetzt zuerst aus; erst danach werden echte Schluesselgleichheiten
uebernommen. Der naechste Aufbau kann die beiden falschen Texte daher
nicht wieder einsetzen.

## C-346 — Nachweis

Der Test wurde vor der Aenderung gegen `lumeos_c276_probe` ausgefuehrt
und scheiterte erwartbar:

```text
CHORL: source_key CHORL / „Magensäure, Elektrolythaushalt, Verdauung“
FD:    source_key FD    / „Trockenmassegehalt eines Lebensmittels“
```

Nach dem Neuaufbau von `015a_nutrient_tree_details.ts` besteht derselbe
Test mit genau diesen Paaren:

```text
CHORL: source_key CHOL / „Hormone, Zellmembranen“
FD:    source_key F    / „Zahnschutz“
```

Die Detailtexte selbst sind globaler Kataloginhalt und haben deshalb
keinen Nutzer- oder Zeitraumbezug. Die Sichtbarkeit der zugehoerigen
Tageswerte wurde nur in der Wegwerf-Datenbank gemessen, nicht auf
`dev`:

| Konto | Zeitraum | `CHORL` vollstaendig | `FD` vollstaendig |
| --- | --- | ---: | ---: |
| `max.seed@example.com` | 2026-05-20 bis 2026-11-16 | 179 Tage | 7 Tage |
| `sarah.seed@example.com` | 2026-05-20 bis 2026-11-16 | 181 Tage | 0 Tage |
| `tom.seed@example.com` | 2026-05-20 bis 2026-11-16 | 179 Tage | 3 Tage |

Die anderslautende historische Aussage ueber „alle 90 Tage auf dev“
wurde nicht als eigene aktuelle Messung wiederholt. Es gab keine
Live-Abfrage und keinen Live-Eingriff.

## C-212 — CHORL im Baum

**Überholt, nicht geaendert.** Die BLS-Komponentendatei führt
Komponente 118 als `CHORL`, „Cholesterin“, `mg`, Gruppe „Sonstige
Nährstoffe“. `nutrition.nutrient_defs` enthält genau diese Gruppe und
`parent_code = NULL`: `CHORL` ist absichtlich eine Wurzel, nicht
verwaist. Die bestehende Kartenregel ordnet eine Wurzel dieser Gruppe
der Karte „Sonstige“ zu. Einen kuenstlichen Eltern-Naehrstoff nur fuer
den Gruppenlabel anzulegen waere eine neue Baumstruktur und nicht durch
die BLS-Tabelle belegt.

Der Detailtextfehler und das behauptete Baumproblem waren somit nicht
zwei Fehler desselben Datensatzes: Der Text war falsch verknuepft, der
Baum bereits korrekt.

## C-211 und C-333 — Selen

**Gleicher Befund, gegenstandslos.** Die BLS-Komponentendatei enthält
138 Komponenten; weder der Code `SE` noch „Selen“/„Selenium“ kommt
vor. Entsprechend hat `nutrition.nutrient_defs` keinen `SE`-Code und
die Tagesbewertung kann Selen nicht führen. Es gibt keine zweite,
unabhaengige Ursache und keinen fehlenden BLS-Import zu bauen.

## C-49 — drei Stufen danach

**Nicht schliessen.** Die Messung bleibt auf genau einen Rest begrenzt:

| Stufe | Stand | Rest |
| --- | --- | --- |
| Tagesbilanz | C-48 gebaut | keiner in C-49 |
| Warnungen | C-323 erledigt | keiner in C-49 |
| Tages-Score | C-324 entschieden, nicht gebaut | C-342: BLS-`VITA` in µg RE lässt sich nicht ohne formabhängige, unbelegte Umrechnung gegen NRF9.3-IU rechnen. C-343: `vitc_missing` macht fast alle Seed-Tage unvollständig. |

Ein Score darf weder eine Vitamin-A-Umrechnung erfinden noch eine
lueckenhafte Summe als Ergebnis ausgeben. C-49 bleibt daher ausschließlich
als Klammer fuer diese zwei dokumentierten Blocker offen; es wurde kein
Score gebaut.

## Pruefung

1. BLS `BLS_4_0_Components_DE_EN.xlsx` gelesen: 138 Komponenten,
   `FD` und `CHORL` bestaetigt, Selen nicht vorhanden.
2. Red-Green-Test
   `supabase/_pipeline/_validierung/nutrient-details-legacy-map.test.ts`:
   vor der Korrektur fehlgeschlagen, nach Neuaufbau grün (1/1).
3. `pnpm exec tsx supabase/_pipeline/015_kataloge/015a_nutrient_tree_details.ts`
   gegen `lumeos_c276_probe`: 114 Quellenschlüssel, 107 exakt, sechs
   Legacy-Mappings; zwei davon bewusst bevorzugt, ein redundantes
   Mapping durch einen echten exakten Schlüssel ersetzt.
4. Zielgerichteter TypeScript-Check konnte nicht vollständig laufen,
   weil im Wurzel-Setup `@types/node` fehlt; dadurch fehlen den
   Standalone-Pipeline-Dateien die Node-Typen. Der Seed und der
   ausführbare Test haben Syntax und das tatsächliche Datenverhalten
   geprüft.

Keine Datei unter `apps/` wurde für C-346 geändert. Nicht committed,
nicht gestaged, nicht gepusht.

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

`[cmd]` **Der Kettenschritt priorisiert jetzt `F` -> `FD` und
`CHOL` -> `CHORL`, keine Texte neu geschrieben.** `[cmd]` **Test
zuerst rot, nach Neuaufbau gruen.**

`[cmd]` **Live steht der falsche Text noch** — `FD` traegt weiter
*,,Trockenmassegehalt"*, `CHORL` weiter *,,Magensaeure,
Elektrolythaushalt, Verdauung"*, `source_key` unveraendert.
`[read]` **Richtig so, war nicht beauftragt** — aber die
medizinisch irrefuehrende Zeile steht bis zum Einspielen.

### Drei von fuenf Punkten waren ueberholt oder gegenstandslos

`[cmd]` **C-212: `CHORL` ist Wurzel mit `parent_code = NULL`, Gruppe
*Sonstige Naehrstoffe*** — genau wie die BLS-Komponententabelle es
fuehrt. **Ueberholt.**

`[cmd]` **C-211 und C-333: kein Selen-Code in `nutrient_defs`.**
`SER` ist Serin, eine Aminosaeure. `[read]` **BLS 4.0 kennt Selen
nicht** — beide Punkte gegenstandslos, **und das ist das Ergebnis,
nicht eine Luecke.**

`[read]` **Zwei Punkte, die seit dem 22.08. offenstanden, waren nie
etwas** — eine Abfrage auf `nutrient_defs` haette es gezeigt.

### C-49 bleibt, aber kleiner

`[cmd]` **Offen nur noch wegen C-342 (Vitamin A in IE) und C-343**
— und C-343 ist inzwischen geschlossen. `[read]` **Damit haengt die
Klammer an einer einzigen Frage: der Vitamin-A-Einheit.**

### Ein Werkzeugbefund

`[cmd]` **Der zielgerichtete `tsc`-Lauf ist durch fehlendes
`@types/node` im Wurzel-Setup blockiert.** `[read]` **Gemeldet statt
umgangen** — Seed und Laufzeittest liefen.

**Abgenommen.**

