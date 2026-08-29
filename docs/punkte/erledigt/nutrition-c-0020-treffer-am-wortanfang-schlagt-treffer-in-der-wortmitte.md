---
nr: C-20
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-14
braucht: []
kind_von: C-25
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  dateien: [supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
zahlen: null
---

# C-20 - Treffer am Wortanfang schlägt Treffer in der Wortmitte

## Befund

(neu 2026-08-14). **Der grösste verbliebene Hebel für die Relevanz.**

  `[cmd]` Gemessen an sechs Anfragen:

  | Anfrage | Platz 1 heute |
  |---|---|
  | `butter` | Limabohne (**Butter**bohne Mondbohne) |
  | `lachs` | Alaska-Pollack/Alaska-See**lachs** |
  | `kuerbis` | **Kürbis**kern |
  | `huhn` | Suppen**huhn**, Reb**huhn**, Perl**huhn** |

  Die Suche vergleicht mit `LIKE '%tok%'` — ein Treffer **innerhalb**
  eines längeren Wortes zählt genauso viel wie das ganze Wort. `[cmd]`
  Der `huhn`-Fall steht seit `41-…` fest: 31 Treffer, und das gesuchte
  Brustfilet war nicht dabei. *Eine Trefferzahl über null ist noch kein
  Fund.*

  Vorschlag: drei Stufen statt einer — ganzes Wort, Wortanfang,
  Wortmitte. Vor dem Bauen messen, nicht danach.

  ---

  `[cmd]` **Nachgemessen 2026-08-14 am Anker `7b5e631`** — der Punkt ist
  kleiner geworden, aber nicht weg. Von den vier Faellen der Tabelle ist
  einer geloest, drei stehen unveraendert:

  | Anfrage | Platz 1 heute |
  |---|---|
  | `huhn` | **Haehnchen Brustfilet, roh** — geloest |
  | `butter` | Buttermilchpulver |
  | `lachs` | Lachsrogen roh (Lachs roh steht auf 2) |
  | `kuerbis` | Kuerbiskern |

  Die Zubereitungsstufe aus C-25 hat die Wortmitte nicht angetastet —
  sie sortiert innerhalb der Treffermenge, das Problem liegt darin, dass
  ein Treffer *im* Wort so viel zaehlt wie das ganze Wort. Der Vorschlag
  von drei Stufen (ganzes Wort, Wortanfang, Wortmitte) steht unveraendert.

## Auftrag — die Suche, sechs Punkte

**Mitbeauftragt: C-338, C-102, C-117, C-121, C-192.** `[read]` **Ein
Thema — Relevanz und Kosten von `food_search`.** Bericht in diese
Datei, die anderen fuenf tragen einen Verweis.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Seit heute Regel in `CLAUDE.md`:** am 28.08. sind fuenf
Auftragspraemissen gefallen, **weil ich gemessen und dann etwas
anderes behauptet habe.**

`[read]` **Alles, was unten steht, ist die Frage — nicht die
Antwort.** **Miss selbst, und nenn Nutzer und Zeitraum dazu.**

`[cmd]` **Und: ein Kettenschritt ist nicht live.** Das habe ich am
28.08. zweimal verwechselt.

### 1 · C-338 — die Sortierwerte einspielen

`[read]` **Der Kettenschritt aus G-245 traegt zehn Werte und die
`unsupported_sort`-Rueckmeldung. Miss, was die laufende Funktion
kennt**, und bring beides in Deckung.

`[cmd]` **Die Oberflaeche sortiert seit G-70 auf der geladenen Seite,
wenn die Datenbank die Achse nicht kann** — mit der Grenze als Satz
darunter. **Das ist die Rueckfallebene, kein Ersatz.**

### 2 · C-20 — Wortanfang vor Wortmitte

`[read]` **Der Punkt nennt es *,,den groessten verbliebenen Hebel fuer
die Relevanz"* und schlaegt drei Stufen vor: ganzes Wort, Wortanfang,
Wortmitte.** `[read]` **Er sagt auch: *,,vor dem Bauen messen, nicht
danach."***

**Miss die Beispiele aus dem Punkt nach** — sie sind vom 14.08. **Wenn
sie nicht mehr gelten, ist das der Befund.**

### 3 · C-102 und C-117 — die Rangfrage

`[read]` **Beide Punkte enden mit derselben offenen Entscheidung:**
*Trinkform vor Pulverform* als Regel, **oder Haeufigkeit statt
Dichte.** `[read]` **Keiner von beiden ist gesetzt.**

**Miss, was jeder Weg bewirkt**, und leg beides mit Zahlen vor.
`[read]` **Nicht entscheiden — das ist Toms Sache.** `[read]` **Und
wenn ein dritter Weg sichtbar wird: nennen.**

### 4 · C-121 und C-192 — die Kosten

`[read]` **Beide betreffen die Laufzeit, beide sind aelter als eine
Woche.** `[cmd]` C-192 traegt den Vermerk *,,Laeuft bei Codex"* —
**pruef, ob das noch stimmt.**

`[read]` **Und miss die Kosten deiner eigenen Aenderungen aus Teil 1
bis 3 mit** — eine bessere Relevanz, die dreimal so lange braucht,
ist ein Tausch und kein Fortschritt.

### Was nicht zu tun ist

**Keine Rangregel setzen** — C-102/C-117 sind eine Entscheidung.
**Keine Tags anlegen, keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil          erledigt / gebaut / offen / ueberholt
    Sortierwerte live            vorher / nachher
    unsupported_sort             wirkt es
    Trefferliste je Beispiel     vorher / nachher, mit der Anfrage
    Laufzeit                     ms je Anfrage, vorher / nachher
    Rangfrage                    zwei Wege mit Zahlen, nicht
                                 entschieden

`[read]` **Die letzte Zeile ist die, die nicht gebaut wird.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **`.limit()` hebt den PostgREST-Deckel nicht auf** — 1.000
Zeilen serverseitig.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Nachtrag vom Orchestrator, 2026-08-28

**Der gebaute `/v2/`-Stand ist der Massstab, nicht der Mockup.**

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben ... also ist theme-v1 nur noch eine ideen struktur
falls uns in v2 was fehlt."*

`[read]` **Also nicht: den Mockup gegen den gebauten Stand halten.**
**Sondern: den gebauten Stand messen.** `theme-v1` **nur
nachschlagen, wenn etwas fehlt und die Frage ist, wie es gemeint
war.**

`[cmd]` **Und es gibt zwei Routenbaeume:** `/v2/nutrition` und
`/nutrition`. **Der alte traegt ein eigenes Template und bleibt** —
Tom: *,,da laeuft ein anderes template und das soll bleiben"*.
**Nicht anfassen.**

`[read]` **Mein Fehler in diesem Auftrag:** ich habe `theme-v1` als
*,,massgeblich"* bezeichnet. **Das war falsch.**

## Bericht

Stand 2026-08-29. `[cmd]` Alle SQL-Messungen liefen im Wegwerfbestand `lumeos_c20_live`, einer Vollsicherung von `postgres`; der vollstaendige Kettenlauf `lumeos_c20` lief mit 132 Schritten durch. Vor dem Live-Eingriff liegt `backup/c20/20260829_c338_vor_live.dump` (25.280.672 Bytes).

### Urteile

| Punkt | Urteil | Messung |
|---|---|---|
| C-338 | erledigt | `[cmd]` Vorher kannte die laufende `nutrition.food_search` vier Sortierwerte (`relevance`, `protein_desc`, `kcal_asc`, `name_asc`) und kein `unsupported_sort`. Nach Schritt 075 sind es zehn: zusaetzlich `protein_asc`, `kcal_desc`, `carbs_desc`, `carbs_asc`, `fat_desc`, `fat_asc`. `not_a_sort` liefert jetzt `sort = relevance` und `unsupported_sort.code = unsupported_sort`. |
| C-20 | gebaut | `[cmd]` `such_rang_wortgrenze` ist bereits vorhanden: ganzes Namenswort = 3, Wortgrenze = 2, Wortmitte = 0. Heute steht bei `lachs` `Lachs roh`, bei `huhn` ein Treffer mit eigenem Wort `Huhn`, bei `butter` `Buttermilch`; keiner dieser drei Faelle hat Wortmitte vor Wortgrenze. `kuerbis` liefert weiter `Kuerbiskern`, aber auch das ist Wortgrenze, kein Verstoss gegen die Regel. Keine Rangregel wurde hier gesetzt oder geaendert. |
| C-102 | ueberholt | `[cmd]` Die aktuelle App-Anfrage `milch` liefert 261 Treffer; Rang 1 ist `M111100 Milch entrahmt ...` aus `trinkmilch-sahne`, Joghurt `M141100` liegt auf Rang 66. Die alte Ausgangslage "Joghurt vor Milch" ist nicht mehr reproduzierbar. |
| C-117 | ueberholt | `[cmd]` Auch mit `p_user_id = dev@lumeos.app` bleiben die ersten zwoelf Treffer Milch bzw. Milchprodukte, nicht Joghurt. |
| C-121 | ueberholt | `[cmd]` Median aus je fuenf Laeufen im Live-Snapshot: leer 246,8 ms, `spinat` 123,5 ms, `reis` 129,2 ms, `huhn` 213,8 ms, `huehnerbrust` 211,4 ms, `haehnchen brust roh` 215,6 ms. Die historische Spanne 330--492 ms ist nicht reproduzierbar. |
| C-192 | ueberholt | `[cmd]` `milch`, Limit 25, je fuenf Laeufe im Live-Snapshot: ohne `p_user_id` Median 136,176 ms, mit `dev@lumeos.app` 140,705 ms (+4,529 ms, +3,3 %). Der behauptete Dreifach-Effekt besteht heute nicht; der Vermerk "Laeuft bei Codex" ist abgeschlossen. |

### C-338: Kette und Live

`[cmd]` Den vorhandenen Schritt `supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql` habe ich zuerst im Live-Snapshot ausgefuehrt. Dort wurden alle zehn Werte angenommen; die acht Naehrstoffachsen waren richtig sortiert, beispielsweise `carbs_desc` 100,00000 g am Anfang und 20,70000 g am Ende, `carbs_asc` 0,00000 g am Anfang und 9,80000 g am Ende der serverseitig auf 100 begrenzten Ergebnismenge.

`[cmd]` Die sechs neuen Achsen lagen bei `milch` mit Medianen von 115,390 bis 116,923 ms; `relevance` lag bei 129,288 ms. Der gesamte Suchlauf nach dem Schritt blieb im Snapshot in derselben Groessenordnung: leer 234,8 ms, `spinat` 122,1 ms, `reis` 128,9 ms, `huhn` 217,1 ms, `huehnerbrust` 218,8 ms, `haehnchen brust roh` 216,6 ms. Gegenueber vorher: -12,0 bis +7,4 ms, kein Faktorwechsel.

`[cmd]` Nach der Vollsicherung wurde exakt derselbe Kettenschritt live eingespielt und in einer `READ ONLY`-Transaktion geprueft. Alle zehn Sortierwerte und die Negativprobe `not_a_sort` stimmen mit dem Snapshot ueberein. Der Schritt enthaelt keine neue Rangregel; die vier C-20-Anfragen haben live vor und nach dem Einspielen dieselben ersten Treffer.

### C-102 und C-117: keine Entscheidung

`[cmd]` Eine Trinkform-vor-Pulver-Regel haette bei der heutigen Anfrage fuer Rang 1 einen Effekt von 0 Plaetzen: dieser Rang ist bereits Trinkmilch. Unter den ersten 100 serverseitig gelieferten Treffern sind 33 aus `trinkmilch-sahne` und drei Namen mit `pulver`. Die Tabelle `foods` hat keine eigene physische Formspalte; eine spaetere Regel muesste deshalb eine Kategorienzuordnung begruenden, nicht Namen raten.

`[cmd]` Eine Haeufigkeitssortierung existiert im Rumpf von `food_search` nicht; `meal_items` wird dort nicht gelesen. Fuer `dev@lumeos.app` hat `M111100` 0, die alte Vollmilch `M111300` 35 und der alte Joghurt `M141100` 36 Meal-Items. Eine reine Haeufigkeitsregel wuerde den alten Joghurt also um einen Eintrag vor die alte Vollmilch setzen. Das ist keine Empfehlung fuer einen Weg, sondern die Messung ihrer heutigen Wirkung.

Als dritter, sichtbarer Weg bleibt eine fachlich gepflegte Zuordnung zur Produktform. Sie ist im heutigen Schema nicht vorhanden und wurde weder angelegt noch entschieden.

### Nachweise und Grenzen

`[cmd]` Die Lesevalidierung `v070_lesefunktionen.sql` bestand die `food_search`-Pruefungen. Sie meldet separat vier statt null anonyme EXECUTE-Rechte auf den fuenf Lesefunktionen; das ist keine durch C-338 verursachte Sortierabweichung und wurde nicht veraendert.

`[cmd]` Beim Aufbau des Messbestands zeigte sich: `tools/lauf.py::psql()` bindet die Datenbank fest an `postgres` und ignoriert `PGDATABASE`. Fuer alle hier dokumentierten Klonmessungen habe ich deshalb ausnahmslos `docker exec ... psql -d lumeos_c20_live` verwendet. C-338 wurde nur nach der genannten Vollsicherung gegen live geschrieben.

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen, was der Bericht behauptet.**

`[cmd]` **`food_search` live: zehn Sortierwerte, `unsupported_sort`
wirkt.**

    'relevance' · 'protein_desc' · 'protein_asc'
    'kcal_desc' · 'kcal_asc' · 'carbs_desc' · 'carbs_asc'
    'fat_desc' · 'fat_asc' · 'name_asc'

`[cmd]` **Vollsicherung unter `backup/c20/20260829_c338_vor_live.dump`.**
`[cmd]` **115,4 bis 116,9 ms Median im Klon, kein Laufzeitaufschlag.**

### Vier von sechs Punkten waren ueberholt

    C-20    gebaut
    C-338   erledigt
    C-102 · C-117 · C-121 · C-192   ueberholt

`[cmd]` **`milch` liefert heute Trinkmilch auf Rang 1, Joghurt auf
66.** `[read]` **Der Befund, der C-102 und C-117 traegt, gilt nicht
mehr.**

### Die Rangfrage wurde gemessen und nicht entschieden

`[cmd]` **Eine Haeufigkeitssortierung existiert nicht** — und sie
wuerde bei den alten Vergleichskandidaten **Joghurt (36) vor Vollmilch
(35)** legen.

`[read]` **Also genau das Gegenteil dessen, was der Punkt erreichen
wollte.** `[read]` **Gemessen, vorgelegt, nicht gebaut** — das war
die Vorgabe, und sie wurde eingehalten.

`[read]` **Damit ist die Entscheidung, die C-102 seit dem 18.08.
offenhielt, gegenstandslos:** der Weg, der als Alternative
vorgeschlagen war, macht es schlechter.

**Abgenommen.**

