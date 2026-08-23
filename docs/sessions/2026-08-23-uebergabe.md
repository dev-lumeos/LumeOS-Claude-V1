# Übergabe — Stand 2026-08-23

Du bist Orchestrator im LumeOS-Projekt. Tom arbeitet mit dir und drei
Agenten: **Claude Code**, **Codex**, **Fable**. Dazu **Kimi**, eine
externe Recherche, die Datenpakete liefert.

Lies diese Datei ganz, bevor du etwas tust. Der Tagesbericht vom selben
Datum (`2026-08-23-tagesbericht.md`) hat die Einzelheiten.

---

## 1 · Wie Tom arbeitet

**Er ist knapp und direktiv.** Er erwartet, dass du Kontext selbst
liest, statt zu fragen. Eine Frage, deren Antwort in einer Spec, einem
Mockup, dem alten Repo oder im Code steht, ist eine vergeudete Runde.

**Er hat wenig Geduld für Vorreden.** Antworte mit dem Ergebnis, nicht
mit dem Weg dorthin. Kein „Ich werde jetzt…", kein „Soll ich…" — wenn
es dein Job ist, mach es.

**Er reagiert nicht immer.** Wenn keine Antwort kommt, arbeite weiter.

**Was ihn zuverlässig verärgert:**

- Fragen, deren Antwort in den Quellen steht
- Behauptungen über den Ist-Zustand, die nicht gemessen sind
- Aufträge, die rausgehen, ohne dass die vier Quellen geprüft wurden
- Wenn Agenten leerlaufen, weil du keine Arbeit findest
- Wenn du eine ganze Runde mit Rückfragen blockierst, statt den
  unstrittigen Teil zu erledigen

**Was er schätzt:** gemessene Zahlen, offengelegte eigene Fehler,
Widerspruch mit Beleg.

**Sprache:** Deutsch, informell. Dokumentation deutsch, Code und
Bezeichner englisch. Datenbankspalten mit `_de`/`_en`/`_th`.
Oberfläche über `next-intl`, deutsch und englisch, Thai später.

---

## 2 · Deine Rolle

**Du schreibst Aufträge, prüfst Berichte, committest.** Produktivcode
schreiben die Agenten.

### Vor jedem Auftrag: vier Quellen, alle vier

1. **Der Code** — was existiert schon? Ein `rg` kostet Sekunden.
2. **Die Daten** — selbst messen, nicht aus einem Bericht übernehmen.
3. **Spec und Mockup** — `docs/spezifikation/00-QUELLEN.md` sagt, welche
   Dateien es je Modul gibt. **Kein Modul hat nur eine.**
4. **Das Vorgängerrepo** (`referenz/lumeos-2026/`) — Struktur ja, Code
   nie. Und nachsehen, warum es ersetzt wurde.

`[read]` **Die häufigste Fehlerquelle:** Quellen lokalisiert statt
gelesen. Der Orchestrator hat Dateinamen in Auftragslisten geschrieben
und die Dateien nie geöffnet. Vier Aufträge gingen mit falschem Befund
raus, darunter einer, der `ADR_NUTRITION_PREFERENCES_V1.md` dem Agenten
zum Lesen gab und selbst nicht hineinsah.

### Nach jedem Bericht

1. **Prüfen, nicht glauben.** Die tragenden Zahlen selbst messen.
2. Rohbericht nach `docs/berichte/<nummer>-<agent>.md`
3. **Committen** — ein logischer Change pro Commit
4. Punkt schliessen, Abschluss nach `ERLEDIGT.md`, **mit den gemessenen
   Zahlen**
5. Neue Befunde anlegen
6. `LAUFEND.md` nachziehen

Nichts davon ist eine Nachfrage wert.

### Nummern

**Der Orchestrator vergibt sie, im Auftrag.** Reihen: `A` Struktur ·
`B` Werkzeug · `C` Daten und Pipeline · `G` Oberfläche · `GO` Goals ·
`D`/`E`/`F` historisch.

`[cmd]` **Höchste vergeben (2026-08-23):** `A-50 · B-30 · C-239 ·
D-20 · E-19 · F-9 · G-174 · GO-24`. Der Wächter gibt sie bei jedem
grünen Lauf aus.

**Eine Nummer im Auftrag ohne Punkt in `TODO.md` ist verloren** — so ist
`C-186` verschwunden. Der Wächter findet es inzwischen.

---

## 3 · Wo alles steht

| | |
|---|---|
| Offene Punkte | `docs/todo/TODO.md` — **226 offen** |
| Übersicht | `docs/todo/00-UEBERSICHT.md` — **erzeugt, nicht gepflegt** |
| Erledigtes | `docs/todo/ERLEDIGT.md` — 287, mit Beleg |
| Wer woran | `docs/todo/LAUFEND.md` |
| **Rohberichte** | **`docs/berichte/`** — was der Agent meldete |
| Geprüfte Berichte | `docs/ssot/` — was du gemessen hast, 150+ |
| Regeln | `CLAUDE.md` |
| Quellen je Modul | `docs/spezifikation/00-QUELLEN.md` |
| **Supplements-Schema** | **`docs/specs/Supplements/SCHEMA_NEUAUFBAU.md`** |
| Toms Bildschirmfotos | `backup/bestand/00-toms-bildschirmfotos.md` |

`[read]` **`TODO.md` ist ein Befundregister, kein Arbeitsvorrat.** Dort
steht, was jemandem aufgefallen ist. **Ein ganzes Modul voller
Attrappen steht nicht drin**, weil es niemand als Fehler notiert hat.
Wer wissen will, was zu tun ist, sieht ins Produkt.

`[read]` **Die Sektionsüberschriften in `TODO.md` sind keine
Reihenordnung** — 28 Reihenwechsel quer durch die Datei. Wer sortiert
sucht, nimmt `00-UEBERSICHT.md`.

---

## 4 · Werkzeuge

**`tools/lauf.py`** — `lauf()`, `git()`, `psql()` mit `shell=False` und
`CREATE_NO_WINDOW`. **Keine Konsolenfenster.** Wer einen Befehl
braucht, der nicht darüber geht, erweitert die Datei.

    import sys; sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
    from lauf import lauf, git, psql

`[cmd]` **`lauf()` gibt Zeichen zurück, die cp1252 nicht drucken kann.**
`print(lauf(...))` wirft `UnicodeEncodeError`. Schreib in eine Datei und
lies sie, oder `.encode("ascii","replace").decode()`.

**`python tools/server.py`** — `status` · `start` · `neustart` ·
`aufraeumen`. **Nie `pnpm dev` oder `npx next dev`**: fünf parallele
Next-Instanzen haben einen halben Tag gekostet.

**`tools/schuss.mjs`** — Bildschirmfotos, headless, meldet sich selbst
an, zählt Attrappen und Konsolenfehler, misst zwei Läufe.

**`tools/nummern-pruefen.mjs`** — im Gate, acht Prüfungen, jede über
einen eingebauten Fehler einzeln belegt
(`LUMEOS_NUMMERN_SELBSTTEST=1`). `--schreiben` erzeugt
`00-UEBERSICHT.md` neu.

**Live-Datenbank:**

    docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -At -c "<sql>"

**Nie `.next` löschen, nie `next build` direkt.** Nur `pnpm gate` oder
`pnpm --filter @lumeos/web build`.

`[cmd]` **`pnpm` braucht `pnpm.cmd`** unter `shell=False`. `lauf.py`
löst das auf; direkte `subprocess`-Aufrufe nicht.

---

## 5 · Die Regeln, die aus Fehlern entstanden sind

**Wegwerf-Datenbank zum Prüfen, laufende Instanz zum Abschliessen.**
`[cmd]` Sechs Aufträge lagen committet und nie eingespielt — live 31
Spalten, committet 63. Eine Woche Arbeit war unsichtbar. **Der Auftrag
nennt beide Schritte oder er ist unvollständig geschrieben.**

**Vor dem Einspielen eine Sicherung, die zurückgespielt wurde.**
`[cmd]` Der Vollrestore scheiterte an einem
`graphql_public.graphql`-GRANT und lief erst mit `--no-privileges`.
**Ein ungeprüfter Dump ist kein Backup.** Zählungen: Zeilen **und**
Policies — `pg_restore` lässt Policies still fallen.

**Ein `DROP COLUMN` prüft die Lesepfade.** `[cmd]` `acwr_used` war drei
Tage gedroppt und wurde weiter selektiert.

**Was heute nicht entschieden ist, wird nicht vorgebaut** — aber
sichtbar ausgelassen, mit Textblock im Code und Punkt im TODO.

**Agenten schreiben nicht in `docs/todo/` und `docs/ssot/`.** Ihr
Rohbericht gehört nach `docs/berichte/`. `[read]` Ein Bericht, den der
Ausführende verfasst, ist seine Selbstauskunft — der SSOT trägt, was
geprüft ist.

**Nachweisdateien mit `encoding="utf-8", newline="\n"`.** `[cmd]`
Doppelte Kodierung hat an einem Tag dreimal jeden Commit im Repo
blockiert.

**Nachweise auf `test-user@lumeos.local`.** `[cmd]` Seit C-236 trägt
das Konto Daten: 30 Check-ins, 6 Sitzungen, 1 Stack, 24 Einnahmen.
Bewusst leer: `meal_plans`, `user_medications`, Coach.

**Vor jedem Commit `git reset`, dann gezielt `git add`.** `[cmd]`
`LAUFEND.md` lag gestaged und landete im falschen Commit.

---

## 6 · Der Faden: Supplements-Neuaufbau

`[read]` **Tom, 2026-08-22:** *„wieso haben wir supplement_catalog und
substance_catalog? … jetzt wird zuerst aufgeräumt und definiert bevor
wir nur eine zeile mehr code machen."*

`[cmd]` `a02e838` legt `supplement_catalog` an (44 Zeilen). `022f2ce` —
Titel *„one catalogue from three sources"* — legt `substance_catalog`
daneben. Vier Commits bauen nur den zweiten aus. **Beide werden
gelesen.**

### Die Trennlinie

**Karte:** Name, Gruppe, Kategorie, Beschreibung, Dosis, Zeitpunkt,
Form, Evidenzgrad, Tags.
**Buddy:** Wechselwirkungen, Pharmakokinetik, Sicherheit je Organ,
Rechtslage je Land, Qualität, Monitoring, Herkunft je Feld.

`[read]` **Konflikte erscheinen nicht im Katalog** — dafür gibt es
Intelligence, Interactions und Buddy.

`[read]` **Buddy wird ein deterministischer Layer:** die Regel steht in
den Daten. Deshalb keine `jsonb`-Blöcke — `mechanismus =
'CYP3A4-Hemmung'` ist abfragbar, *„may increase plasma levels"* nicht.
**Und `unbekannt` ist ein Zustand, keine Abwesenheit.**

### Wo der Faden steht

| Schritt | |
|---|---|
| 1 · Anlegen | **durch** (C-232) — 33 Tabellen, live |
| 2 · Befüllen | **durch** (C-235) — live |
| **3 · Umhängen** | **als Nächstes** — `stack_items.supplement_id` zeigt auf die 44er-Tabelle. `[cmd]` 8 Positionen, 8 Zuordnungen |
| 4 · Lesepfade | `stack-read`, `stack-write`, `substanz-read`, `medical/page.tsx` |
| 5 · Alte weg | erst wenn 3 und 4 gemessen sind |

`[cmd]` **Der Bestand nach Schritt 2:** `supplement_field_sources`
2.147 · `supplement_aliases` 1.541 · `supplement_organ_risks` 1.450 ·
`supplement_identifiers` 1.226 · `supplement_regulatory` 1.119 ·
`supplements` 566 · `_dosing`/`_pharmacology`/`_evidence` je 566 ·
`_safety`/`_warnings`/`_wada` je 290 · `_quality` 237 ·
`_lab_effects` 222 · `_interactions` 78 · `_categories` 23 ·
`_groups` 3.

`[cmd]` **Gruppen:** `supplement` 307 · `enhanced` 177 · `peptide` 82.
**Filter:** 9 · 7 · 7 — aus 48 Rohwerten gebündelt.

### Toms Navigationsvorgabe

    Today
    Stacks          erfassen, editieren, aktivieren (sofort/Datum/Planer)
    Catalog         Suche, Kategorien mit Farben, Detail, Zuteilung
    ─────
    Extended        ab experience_level pro/elite
    Injections
    ─────
    Insights        Intelligence · Compliance · Interactions
    ─────
    Inventory
    Cost

`[read]` `Stack` fällt weg, `Stacks` bleibt, der aktive erscheint auf
Today. **Heute sind es elf Tabs**, nach Datenherkunft geschnitten statt
nach Nutzungsanlass.

---

## 7 · Was bei Tom liegt

| | |
|---|---|
| **`G-163`** | Die Rückfallfassungen — bleiben oder fliegen? `[cmd]` `supplements/tabs.tsx` 16, `tab-plans` 8, `tab-prefs` 6. `G-171`: sie machen die Markenzählung unbrauchbar |
| **`C-207`** | Vier Cam-Entscheidungen: Speicherweg, Datenschutz je Rechtsraum, Einwilligung, Vision-Modell |
| **`C-218`** | Zwei Skalen im Recovery-Score |
| **`C-223`** | `dose_ceiling` als Freitext — wird über `supplement_regulatory` lösbar |
| Taxonomie | 59 feine Kategorien neben 23 Filtern — Abnahme offen |

---

## 8 · Der Zustand der Module

`[cmd]` **Aufgenommen in C-217 und G-155:** sieben Module trugen einen
Pauschalbanner *„das Schema gibt es noch nicht"* — **bei sechs war er
falsch.** Korrigiert in G-156.

`[read]` **Der grösste Posten ist nicht fehlendes Schema, sondern Daten
liegen und werden nicht gelesen.** Gruppe M in `TODO.md` hat die
Einzelheiten.

Offen aus dieser Gruppe: `G-157` (Kachel ohne Marke, erfundene Zahlen) ·
`G-162` (supplements Compliance, medical Tracking) · `G-163` ·
`C-219` (Tabellen, die die Spec kennt und die es nicht gibt) ·
`C-220` (`buddy`, 0 von 16 Tabellen) · `G-164` (drei Vorgängermodule
ohne Gegenstück).

---

## 9 · Wiederkehrende Fallen

**Nach dem falschen Namen suchen und aus dem Nichtfinden auf
Nichtexistenz schliessen.** `[cmd]` Fünfmal an einem Tag:
`tree_nuts`/`contains_nuts` · `SE`/`SER` ·
`training.load_spike`/`ACWR_DATA` · `training.sessions`/
`workout_sessions` · `useTranslation`/`next-intl`. **Nachsehen, wie es
wirklich heisst.**

**Gesamtzahl statt RLS-Sicht.** `[cmd]` Dreimal: 60 Sitzungen gesamt,
30 für `dev` · 2 Pläne, 1 für `dev` · 340 Check-ins, 170. **Immer
fragen, was das Nachweiskonto sieht.**

**Ein grüner Test, der nichts misst.** `[cmd]` Viermal: der
Nummern-Selbsttest feuerte die falsche Prüfung · der `data-on`-Test las
den Nachbarknopf · dann das eigene Kommentar · ein Hochrechnungstest
hatte gleichverteilte Fixtures. **Nur der absichtliche Rückbau zeigt
es.**

**Zahlen aus einem Bericht statt aus einer Messung.** `[cmd]` Die
144 ms aus C-189 lagen unter dem Minimum aus zwölf Läufen. **Median und
Spanne, nicht eine Messung.**

**Regeln, die berichtet statt erzwungen werden, brechen.** `[cmd]`
Doppelte Kodierung dreimal an einem Tag · `[cmd]` 21 Wegwerf-Datenbanken
mit 3,58 GB, obwohl jeder Bericht sie als gelöscht meldet.

---

## 10 · Der Ablauf mit den Agenten

**Alle drei laufen parallel.** Ein UI-Agent je Modul; zwei in
`apps/web` teilen sich die Browsersitzung.

**Bereiche:** `supabase/_pipeline/` → Codex · `apps/web/src/app/v2/<modul>`
→ je ein Agent · `docs/todo/` und `docs/ssot/` → Orchestrator.

**Der Ablauf:** Auftrag schreiben → Tom sagt „läuft" → **erst dann** in
`LAUFEND.md` eintragen → Bericht abwarten → prüfen → committen.

`[read]` **Eintragen, wenn der Auftrag rausgeht, nicht wenn er
geschrieben ist.**

### Was in jeden Auftrag gehört

    WAS ICH GEMESSEN HABE   [cmd]-Zahlen, gegen die der Agent prüft
    WAS ZU TUN IST
    WAS NICHT ZU TUN IST    Bereiche anderer Agenten, offene Entscheidungen
    NACHWEIS                Erwartung VOR dem Lauf, beide Richtungen
    DOKUMENTATION           Bericht nach docs/berichte/, nichts in docs/todo
    REGELN                  server.py, lauf.py, nicht committen, nicht pushen

**Bei Pipeline-Aufträgen zusätzlich:** Wegwerf-Datenbank, Sicherung,
Kettenlauf, **und live einspielen** mit Vollsicherung davor und den 19
Kontrollzahlen danach.

`[read]` **Melden, nicht entscheiden:** Wenn eine Vorgabe nicht aufgeht,
soll der Agent es melden, nicht passend machen. Das hat mehrfach eigene
Fehler des Orchestrators aufgedeckt — 1.185 statt 1.119, „26 Tabellen"
statt 33, 0,80 statt 0,85 bei WHR.

---

## 11 · Wenn Tom einen Bericht schickt

`[read]` **Lange Berichte kommen in langen Gesprächen als leerer Anhang
an.** Vier hintereinander gingen so verloren. Deshalb legt der Agent
seinen Bericht selbst unter `docs/berichte/` ab — dann kannst du
nachsehen statt zu raten.

Kommt ein Bericht trotzdem leer: **selbst messen.** C-235 wurde so
abgenommen, ohne dass der Bericht je sichtbar war.

---

## 12 · Der Einstieg

    git log --oneline -10
    git status --short
    node tools/nummern-pruefen.mjs

`[cmd]` **Stand 2026-08-23:** `e954235` gepusht, Baum leer, 226 offen,
287 erledigt, keine Dublette, alle drei Agenten frei.

**Der nächste Schritt** ist Schritt 3 des Neuaufbaus: `stack_items`
umhängen. Danach die Lesepfade, dann die alten Tabellen weg.

`[read]` **Und wenn Agenten frei sind, halte sie beschäftigt.** Gruppe M
in `TODO.md` hat Punkte, die weder Schema noch Entscheidung brauchen —
Daten liegen, werden nicht gelesen. Das ist die billigste echte Arbeit
im Repo.
