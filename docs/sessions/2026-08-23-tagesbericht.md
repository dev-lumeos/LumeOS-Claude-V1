# Übergabe — Stand 2026-08-23, Supplements-Neuaufbau

**Anlass:** Das vorige Gespräch lief so lang, dass eingefügte
Agentenberichte als Anhang ankamen und ihr Inhalt verlorenging — vier
hintereinander leer. Dieser Stand ist gemessen, nicht erinnert.

---

## Wo alles steht

| | |
|---|---|
| Offene Punkte | `docs/todo/TODO.md` |
| Übersicht | `docs/todo/00-UEBERSICHT.md` — erzeugt, nicht gepflegt |
| Erledigtes | `docs/todo/ERLEDIGT.md` |
| Wer woran | `docs/todo/LAUFEND.md` |
| **Das Schema** | **`docs/specs/Supplements/SCHEMA_NEUAUFBAU.md`** — 469 Zeilen, 33 Tabellen |
| Vorige Übergabe | `docs/sessions/2026-08-21-uebergabe.md` |

---

## Der Supplements-Neuaufbau — der Faden dieses Tages

`[read]` **Tom, 2026-08-22:** *„wieso haben wir supplement_catalog und
substance_catalog? … jetzt wird zuerst aufgeräumt und definiert bevor
wir nur eine zeile mehr code machen."*

`[cmd]` **Woher die zwei kamen:** `a02e838` legt `supplement_catalog`
an (44 Zeilen). `022f2ce` — Titel *„one catalogue from three
sources"* — legt `substance_catalog` daneben. Danach vier Commits, die
nur den zweiten ausbauen: 31→60→63→68 Spalten.

`[read]` **Der Orchestrator hat die Doppelung zementiert:** in C-224
stand *„`supplement_catalog` nicht anfassen — die Ablösung ist ein
eigener Punkt"*. Diesen Punkt hat er nie angelegt.

### Die Trennlinie

`[read]` **Tom:** *„das sind addon daten und gehören strukturiert in
eigene tables, die meisten davon interessieren den user nicht — sind
daten die buddy im hintergrund auswerten wird."*

**Karte:** Name, Gruppe, Kategorie, Beschreibung, Dosis, Zeitpunkt,
Form, Evidenzgrad, Tags.
**Buddy:** Wechselwirkungen, Pharmakokinetik, Sicherheit je Organ,
Rechtslage je Land, Qualität, Monitoring, Herkunft je Feld.

`[read]` **Konflikte erscheinen nicht im Katalog** — dafür gibt es
Intelligence, Interactions und Buddy. **Der Katalog braucht keinen
Nutzerkontext.**

`[read]` **Buddy wird ein deterministischer Layer:** die Regel steht in
den Daten, nicht im Modell. Deshalb keine `jsonb`-Blöcke — eine
Regel-Engine kann `mechanismus = 'CYP3A4-Hemmung'` abfragen, nicht
*„may increase plasma levels"*.

**Und `unbekannt` ist ein Zustand, keine Abwesenheit.** `[cmd]`
`interactions` bei 78 von 290 heisst: bei 212 wissen wir es nicht.

### Was gebaut ist

`[cmd]` **Schritt 1 (C-232) und Schritt 2 (C-235) sind live und
geprüft.** 33 Tabellen, alle über `supplement_id`, 29 Fremdschlüssel:

| Tabelle | Zeilen |
|---|---:|
| `supplement_field_sources` | **2.147** |
| `supplement_aliases` | 1.541 |
| `supplement_organ_risks` | 1.450 |
| `supplement_identifiers` | 1.226 |
| `supplement_regulatory` | 1.119 |
| `supplements` | 566 |
| `supplement_dosing` · `_pharmacology` · `_evidence` | je 566 |
| `supplement_safety` · `_warnings` · `_wada` | je 290 |
| `supplement_quality` | 237 |
| `supplement_lab_effects` | 222 |
| `supplement_interactions` | 78 |
| `supplement_categories` | 23 |
| `supplement_groups` | 3 |

`[cmd]` **Eine Abweichung ungeklärt:** `supplement_regulatory` 1.119
statt der vorgegebenen 1.185. Die 66 Fehlenden sind vermutlich
`"unknown"`-Werte, die als `status` statt als Zeile abgelegt wurden.
**Das ist die eine Zahl, die noch zu bestätigen ist.**

`[cmd]` **Gruppen:** `supplement` 307 · `enhanced` 177 · `peptide` 82.
**Filter:** 9 · 7 · 7 — aus 48 Rohwerten gebündelt (C-197, C-230).

---

## Was als Nächstes kommt — Schritt 3 bis 5

`docs/specs/Supplements/SCHEMA_NEUAUFBAU.md`, Abschnitt 8:

1. ~~Anlegen~~ — C-232, durch
2. ~~Befüllen~~ — C-235, durch
3. **Umhängen** — `stack_items.supplement_id` zeigt auf die 44er-Tabelle.
   `[cmd]` 8 Positionen, 8 Zuordnungen in
   `stack_item_substance_matches`
4. **Lesepfade umstellen** — `stack-read`, `stack-write`,
   `substanz-read`, `medical/page.tsx`
5. **Alte weg** — `supplement_catalog` (44), `substance_catalog` (566),
   `substance_aliases`, `substance_lab_effects`,
   `supplement_nutrient_mappings`, `substance_catalog_sources`

`[read]` **Schritt 5 erst, wenn 3 und 4 gemessen sind.**

---

## Die Regeln, die an diesem Tag entstanden sind

**Wegwerf-Datenbank zum Prüfen, laufende Instanz zum Abschliessen.**
`[cmd]` Sechs Aufträge lagen committet und nie eingespielt — live 31
Spalten, committet 63. Der Auftrag endete beim grünen Kettenlauf auf
einer Datenbank, die anschliessend gelöscht wird. **Ein
Pipeline-Auftrag ist nicht fertig, wenn die Kette grün läuft, sondern
wenn die Änderung dort ist, wo Tom sie sieht.**

**Vor dem Einspielen eine Sicherung, die zurückgespielt wurde.**
`[cmd]` Der Vollrestore scheiterte an einem
`graphql_public.graphql`-GRANT und lief erst mit `--no-privileges`
durch. **Ein ungeprüfter Dump ist kein Backup.**

**Was heute nicht entschieden ist, wird nicht vorgebaut** — aber
sichtbar ausgelassen. `[read]` Tom: *„sehe es vor und mach
texteintraege da im code und verweise im todo darauf."* Betrifft
C-233 (Altersprüfung), C-234 (Marketplace).

**Agenten schreiben nichts in `docs/`.** Bericht in den Chat, der
Orchestrator prüft und trägt ein. `[read]` Ein Bericht, den der
Ausführende selbst verfasst, ist seine Selbstauskunft.

**Datenbanken tragen `_de`/`_en`/`_th`.** `[cmd]` Vorbild
`nutrition.nutrient_defs`, dort je 138 von 138. **UI über `next-intl`**
— `apps/web/messages/`, de und en, thai später.

---

## Was bei Tom liegt

| | |
|---|---|
| **`G-163`** | Die Rückfallfassungen — bleiben oder fliegen? `[cmd]` `tab-plans` 8, `tab-prefs` 6, `supplements/tabs.tsx` 16. `G-171`: sie machen die Markenzählung unbrauchbar |
| **`C-207`** | Vier Cam-Entscheidungen: Speicherweg, Datenschutz je Rechtsraum, Einwilligung, Vision-Modell |
| **`C-218`** | Zwei Skalen im Recovery-Score — Frontend normiert `/85 × 100`, DB lässt den Term fallen |
| **`C-223`** | `dose_ceiling` als Freitext mit widersprüchlichen Rechtsräumen — wird lösbar über `supplement_regulatory` |

---

## Offene Befunde ohne Auftrag

**`A-50`** — ein `DROP COLUMN` prüft die Lesepfade nicht. `[cmd]`
`acwr_used` war seit C-215 gedroppt und wurde drei Tage weiter
selektiert.

**`C-236`** — die Recovery-Seeds sind Zählreihen. `[cmd]` `hrv_rmssd`
Schnitt **146** bei physiologisch 20–80, die jüngsten acht als perfekte
`+4`-Folge. `sleep_start_time`, `sleep_end_time`, `work_stress`,
`life_stress` je **0** von 170. **Läuft bei Fable.**

**`test-user@lumeos.local` ist für drei Module unbrauchbar** — `[cmd]`
0 Check-ins, 0 Trainingssitzungen, 0 Coach-Beziehungen. Drei Aufträge
mussten diese Woche auf `dev` ausweichen.

**`C-216`** — doppelte Kodierung in Nachweisdateien, **dreimal an einem
Tag**, jedes Mal blockierte es jeden Commit im Repo.
`[read]` **Eine Regel, die dreimal bricht, gehört ins Werkzeug, nicht
in einen Satz.** Vorschlag: ein Hilfsmittel, das Nachweisdateien
schreibt, statt dass jeder Agent es selbst tut.

---

## Und der Grund für diese Übergabe

`[read]` **Berichte, die als Anhang ankommen, verlieren in langen
Gesprächen ihren Inhalt.** Vier hintereinander kamen leer an; ich habe
`C-235` ohne Bericht abgenommen, indem ich die Zahlen selbst gemessen
habe.

**Vorschlag umgesetzt:**
Tom, 2026-08-23: *„diese berichte gehoeren sowieso protokolliert ins
repo."*

**`docs/berichte/<nummer>-<agent>.md`, roh und unbearbeitet.** Der
Agent legt ab, der Orchestrator prüft und schreibt daraus den SSOT.

`[read]` **Das ändert die Regel von heute Morgen, die zu breit war.**
Ihr Kern stimmt: der Agent soll nicht den SSOT schreiben — dort steht,
was **geprüft** ist. Sein Rohbericht ist etwas anderes: die
Selbstauskunft, **gegen die** geprüft wird. Beides nebeneinander zeigt,
was behauptet wurde und was stimmte.

`[read]` Und bei den vier leeren Anhängen hätte der Orchestrator
nachsehen können, statt zu raten.
