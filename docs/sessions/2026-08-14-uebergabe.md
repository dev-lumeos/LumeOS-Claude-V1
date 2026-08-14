# Übergabe — 2026-08-14

**Anker:** `01951b1` auf `dev`, vier Commits vor `origin/dev` — **noch
nicht gepusht**. Working Tree sauber bis auf `docs/design-system-analysis/`
(Toms Material von Codex, nicht anfassen).

**Zuerst lesen:** `CLAUDE.md`, dann `docs/ssot/00-INDEX.md`.
Rangfolge bei Widerspruch: Code (per Befehl verifiziert) > `docs/ssot/` >
`docs/spezifikation/` > Rest.

**Neu seit heute:** `docs/spezifikation/00-KONSOLIDIERUNG.md` — Ablauf und
Register für die Auswertung des Altbestands. Bei Nutrition-Arbeit gehören
`docs/specs/Nutrition/` und `docs/BrainstormDocs/Nutrition/` mitgelesen;
`CLAUDE.md` ist entsprechend angepasst.

---

## Was morgen ansteht

Tom will an das **Nutrition-Modul** und an das **Design**. Beides ist
vorbereitet, keines blockiert.

**Design:** `docs/spezifikation/10-plattform/design-system/00-diskussionsstand.md`
— Abschnitt 8 listet acht offene Entscheidungen, **Abschnitt 9 ist neu**
und hält das Lichtmodell fest: eine Lichtquelle als globaler Token
(`--light-angle`), das Modulsymbol als Ursprung des Verlaufs, zwei
Verlaufsachsen, und Farbe als Redundanz statt als alleiniger Träger. Dazu
Toms Material unter `docs/design-system-analysis/`.

`[cmd]` Der Messbefund dahinter: die elf Modul-Akzente liegen bei
Helligkeit 0,74–0,80 und erreichen höchstens Chroma 0,10 — zu ähnlich
**und** zu matt.

**Nutrition:** `docs/ssot/54-nutrition-schema-abgleich.md` — 22 Objekte
spezifiziert, 17 vorhanden, 5 fehlen (`foods_custom`, `recipes`,
`recipe_items`, die vier Essensplan-Tabellen, `micro_flags`). Alle
fehlenden sind nirgends im Repo angelegt: Bauvorrat, kein Verlust.

**Der wichtigste Einzelbefund für morgen:** Die Tagessicht heisst gebaut
`daily_summary`, nicht `daily_nutrition_summary` wie in der Spec — und sie
ist **besser**: `[cmd]` neun `*_missing`-Spalten und `security_invoker`.
Damit ist C-37 für die Makros gelöst. Was fehlt, ist die
Mikronährstoffseite: die Spec listet 24 Werte, die gebaute Sicht keinen.
**Die Spec-Variante mit durchgängigem `COALESCE(…, 0)` darf nicht
übernommen werden** — sie macht aus einem nicht erfassten Eisenwert null
Milligramm Eisen.

---

## Der Tag in Zahlen

`[cmd]` Der MealCam-Massstab steht **live bei 34 von 37** — morgens 31,
vor der Suchüberarbeitung 2 von 16.

| | |
|---|---|
| `sort_weight` | 95 Stufen statt 62, Nullwerte von 2.165 auf 145 |
| Anzeigenamen | 5.775 von 5.775 geschrieben, 0 Kollisionen |
| Schema | 17 Tabellen · 2 Sichten · 10 Funktionen · 32 Policies · 4 Trigger |
| TODO | 46 Punkte offen, 77 erledigt in `ERLEDIGT.md` |

---

## Zwei Modelle sind gemessen gefallen

`[cmd]` **C-28** (Gruppierung über vier Codestellen): 39 von 100 gegen
eine Abnahme von 95. **C-33** (dazu der Zubereitungsschlüssel): 47 von
100. Berichte: `docs/ssot/48-` und `49-`.

**Die Grundannahme ist widerlegt, nicht offen:** Aus dem BLS-Code lässt
sich keine Lebensmittel-„Art" ableiten. Der BLS führt je Warengruppe ein
eigenes Schema; `[cmd]` 96 von 204 Zellen des Zubereitungsschlüssels sind
nicht deutbar. **Kein dritter Versuch in diese Richtung.**

Verwertbar geblieben (C-35): die Vertreterregel mit drittem Fall (Gruppen
ohne Vertreter 953 → 0), vier Erzeugnis-Zellen, die Saft von Frucht
trennen, und der Zubereitungsschlüssel als Anzeigehilfe.

**Was stattdessen trägt:** `[read]` `SPEC_05_FOOD_TAXONOMY.md` enthielt
Namensstrategie, Scoring-Formel und Prioritätsliste — gelesen wurde sie
erst am 2026-08-14, nach vier Tagen Arbeit an genau diesen Fragen. Daraus
wurden C-38 (umgesetzt) und C-39 (fast fertig). **Deshalb das
Konsolidierungsregister.**

---

## Offen bei den Anzeigenamen

`[cmd]` 5.775 Zeilen liegen in `supabase/_pipeline/daten/anzeigenamen.jsonl`.
Was noch aussteht:

**`X` und `Y` sind zu 100 % unverändert durchgereicht** — 2.050 Zeilen,
Median-Länge 38 → 38. Codex hat die Frage im Bericht selbst beantwortet:

> `[annahme]` Bei diesen 20 war die Regel „Durchreichen ist der
> Normalfall" zu weit ausgelegt. […] Die Bestandteile müssen erhalten
> bleiben, aber die amtliche Satzstruktur muss nicht erhalten bleiben.

Ein eigener `X`/`Y`-Durchgang ist damit begründet, nicht vermutet.
Beispiel: `Lasagne al forno, Teigwaren geschichtet mit Bechamel- und
Bologneser Sauce, mit Käse überbacken` (95 Zeichen) unverändert.

**`D` steht bei 63 % unverändert** gegenüber 73 % schwierigen Namen.
`[cmd]` 186 der unveränderten tragen eine Klammer (`Apfel-Streuselkuchen
(Mürbeteig)`). Verteidigbar — die Teigart unterscheidet drei sonst
identische Kuchen — aber ansehenswert, wenn `X`/`Y` ohnehin drankommen.

**Die Namen sind noch nicht eingespielt.** Die Datei ist erzeugt, der Weg
in `nutrition.foods` ist ein eigener Schritt und hängt an C-29
(Namensschichten, Override-Tabelle, die den Kettenlauf überlebt).

**576 Zeilen tragen `nebennamen`** — kuratierte Zweitbezeichnungen
(`Felchen` mit `Maräne`, `Renke`, `Schnäpel`). Wie sie in die
Aliasschicht kommen, ist offen. `[read]` Aliase leiten sich aus `name_de`
ab, **nie** aus dem Anzeigenamen — sonst gehen die Nebenformen verloren.

---

## Drei Fehler von mir, aus denen Regeln folgen

**1. Gegen einen Prüfling gemessen, der in Bewegung war — dreimal.**
Erst die Datenbank mitten im Kettenneuaufbau, dann `anzeigenamen.jsonl`
während Codex daran schrieb. **Vor jeder Messung feststellen, ob ein
Agent an dem Gegenstand arbeitet.** Bei zwei parallel laufenden Agenten
ist das der Normalzustand, kein Sonderfall — und `git status` sagt nur,
dass eine Datei verändert ist, nicht ob sie fertig ist.

**2. Einen richtigen Befund mit einer erfundenen Erklärung
zurückgenommen.** Der Alarm „`meals` und `meal_items` fehlen" war
richtig. Als ich sie später vorfand, erklärte ich die erste Messung zum
Messfehler — statt zu prüfen, dass Claude Code inzwischen repariert
hatte. **Die Entwarnung wäre die teurere Falschaussage gewesen.**

**3. Grenzen vermutet statt gemessen.** „5.775 Zeilen sind keine
Codex-Aufgabe", „Abbruchrisiko", „das skaliert nicht" — dreimal
unbelegt, dreimal falsch. Die Stopp-Regel, über die ich mich dann
wunderte, hatte ich selbst in den Auftrag geschrieben.

---

## Regeln, die heute dazugekommen sind

**Es gibt keine ausführbare Kettensteuerung.** `[cmd]` Die „Kette" ist
eine Prosa-Tabelle in `supabase/README.md`, von Hand abgearbeitet. Sie
endete bei `021`; **vierzehn Schritte fehlten**, fünf davon wirkten
tatsächlich nicht (`052`–`056`). Die Tabelle ist jetzt vollständig
(20 Zeilen). Dass es keine ausführbare Steuerung gibt, bleibt.

**Eine Prüfung, die nur zählt, was sie erwartet, kann nichts vermissen.**
Die alte Abschlussprüfung zählte sechs Dinge, alle sechs richtig — und
acht fehlende Objekte fielen nicht auf. Neu:
`supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`
gegen `daten/schema-sollstand.json`, `[cmd]` 107 Einzelaussagen, inkl.
Zeilenschutz, Policies je Operation, `security_invoker`, Trigger,
Fremdschlüssel.

**Und die Rückseite derselben Medaille:** `[cmd]` Der erste Lauf dieser
Prüfung verglich `rowsecurity` gegen `'t'` statt `'true'` und hätte 17
falsche Fehler gemeldet. *Eine Prüfung, die zu viel meldet, wird
abgeschaltet und schützt danach genauso wenig.*

**Umlaute gehen auf einem dritten Weg verloren.** `[cmd]` 704
Anzeigenamen trugen `?` statt eines Umlauts — nicht `ae`/`oe`/`ue` wie
beim vorherigen Mal. Die Prüfregel kannte nur den letzten bekannten
Fehler. `[annahme]` Ursache: PowerShell-Here-String mit Nicht-ASCII an
Node. **Bei Encoding-Verdacht entscheidet der Byteinhalt, nie die
Konsolenausgabe.**

**`\b`-Wortgrenzen und Lookaheads verhalten sich in Postgres anders als
in JavaScript.** `[cmd]` `\bschwarten\b(?! und)` lieferte in Postgres
`false`, wo TypeScript `true` lieferte. Beide Seiten sind jetzt
lookahead-frei. Wer eine Regel von TS nach SQL überträgt, prüft die
Werte, nicht die Zeichenkette.

---

## Werkzeuglage

`desktop-commander` lief den ganzen Tag stabil. Falls die Werkzeuge
fehlen: neues Gespräch → Connector aus/ein → Claude Desktop neu starten,
in dieser Reihenfolge.

**Achtung bei rekursiven Dateisuchen:** `docs/design-system/` ausschliessen
— die Pfade dort sind länger als Windows erlaubt und brechen jede Suche
ab. `[cmd]` Heute mehrfach passiert.

**Berichte kommen als Bild an**, Textanhänge sind mehrfach leer
angekommen.

---

## Was nicht angefasst werden darf

| | |
|---|---|
| `media/` | 13 GB Übungsmedien, ignoriert, einzige lokale Kopie |
| `referenz/lumeos-2026/` | Vorgängerrepo, 22 Stashes, 19 ungepushte Commits |
| `docs/design-system-analysis/` | Codex' Arbeit, Toms Material |
| `docs/specs/` | Datenquelle, kein Sollwert — Schreiben nur als Statusvermerk |

---

## Ein Vorschlag für den Anfang

Push. `[cmd]` Vier Commits liegen lokal: `1d2f189` Schema-Abgleich,
`bb0b95a` Kettenlücke, `17a4c2d` Umlaut-Reparatur, `01951b1`
Rechte-Prüfung.

Danach: die acht Design-Entscheidungen aus Abschnitt 8 durchgehen. Sie
blockieren C-01, C-03 und C-06 — und Abschnitt 9 liefert seit heute den
Rahmen, in dem sie beantwortet werden können.
