---
nr: G-537
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: claudecode
beauftragt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/lib/goals/schreiben.ts
    - apps/web/src/lib/goals/ziel-regeln.ts
    - apps/web/src/app/v2/goals/modale.tsx
    - apps/web/src/app/v2/goals/ziel-karten.tsx

zahlen:
  gemessen: 2026-09-29
  schreibwege_exportiert: 2
  anlegewege: 0
  ziele_live: 5
  davon_seed: 5
---

# In LumeOS kann man kein Ziel anlegen

`[cmd]` `apps/web/src/lib/goals/schreiben.ts` exportiert `zielAendern`
und `reihenfolgeSetzen`. **Kein `zielAnlegen`.** Die fuenf Ziele in der
Datenbank sind Seed — es gibt keinen Weg, ein sechstes zu erzeugen.

**Tom, 2026-09-29, 11:56:** *„subnav goals: user kann einzelne oder
mehrere ziele setzen."*

## Die Tabelle ist fast fertig

`[cmd]` `goals.user_goals` traegt bereits alles, was der Entwurf
verlangt:

| Spalte | Deckung im Entwurf |
|---|---|
| `goal_type` CHECK body_composition, performance, health, lifestyle | **genau die vier** Typen des Dialogs |
| `title` (nicht leer) · `description` · `motivation_reason` | Titel · Notizen |
| `target_value` · `target_unit` · `start_value` · `current_value` | Ist- und Zielwert |
| `gueltig_ab` · `target_date` (CHECK `>= gueltig_ab`) | Startdatum · Deadline |
| `status` (6 Werte) · `priority` (1-10, aktiv 1-3) · `is_primary` | — |
| `progress_pct` · `difficulty_level` · `auto_update` | — |

**Es fehlt ein Feld: `linked_modules`.** Die Spalte kommt aus einem
eigenen Auftrag. Bau ohne sie, aber lies den Nachtrag unten.

## Die Vorlage

`[read]` `docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx`

- `:705` „Choose type · set target · link modules"
- `:727` Current value · `:728` Target value
- `:734` Linked modules

Lesen, bevor du anfaengst. Der Dialog ist die Vorgabe, nicht diese
Beschreibung.

## Der Auftrag

### A1 — `zielAnlegen`

In `apps/web/src/lib/goals/schreiben.ts`, neben `zielAendern`, in
derselben Form: **Zeilenzahl aus `.select('id')`**, damit ein vom
Zeilenschutz weggefiltertes INSERT nicht als Erfolg zurueckkommt — der
Fehler aus G-79 wiederholt sich sonst am Anlegeweg.

Die Regeln liegen schon in `ziel-regeln.ts` (server-frei, von beiden
Seiten nutzbar). **Ergaenzen, nicht duplizieren.**

### A2 — die Regeln, die die Datenbank schon kennt

- aktives Ziel: `priority` 1 bis 3, und **jeder Platz nur einmal**
  (`uq_user_goals_active_slot`). Ein belegter Platz wird ein **Satz**,
  kein Postgres-Fehler. Der Weg dafuer steht in G-79: *„Prioritaet 2 ist
  schon vergeben. Aktive Ziele belegen die Plaetze 1 bis 3, jeden nur
  einmal."*
- `target_date` nicht vor `gueltig_ab`
- `title` nicht leer
- `goal_type` aus den vier

Je Regel eine Zusicherung, von beiden Seiten belegt.

### A3 — der Dialog

Die vier Typen als **Auswahl**, nicht als Dropdown mit Codenamen:
Koerperzusammensetzung · Leistung · Gesundheit · Lebensstil.

Titel · aktueller Wert · Zielwert · Einheit · Startdatum · Deadline ·
Notizen. Und die **Prioritaet**, weil sie beim Anlegen entschieden wird
und nicht danach.

### A4 — was der Dialog nicht tut

Er legt **kein Ernaehrungsziel** an. Das ist Schicht 2 und kommt aus dem
Strategiekatalog (G-536, Codex). Ein `body_composition`-Ziel sagt
**wohin**, eine Strategie sagt **wie** — und nur die zweite aendert die
Tageswerte.

Der Dialog darf das nicht vermischen, auch nicht durch einen Hinweis,
der beides in einen Satz zieht.

### A5 — die Grenze

Vier andere Module zeichengleich. Bilder je Zustand auf
`test-user@lumeos.local`: leer · ausgefuellt · Prioritaet belegt ·
Deadline vor Start. Sabotageprobe je Waechter, beide Richtungen.
`pnpm gate` gruen. Nichts committen.

## Nachtrag, 2026-09-29 12:00 — `linked_modules` ist die Datenquelle

`[read]` `module-goals.jsx:7-70` gibt jedem Ziel `history[]` und `pace`
(`on-track`, `ahead`), und `goals.user_goals` traegt die Spalte
`auto_update`. **Der Ist-Wert eines Ziels wird aus den verknuepften
Modulen gezogen, nicht getippt.** Der Entwurf nennt es „auto-pull data"
und listet fuenf: nutrition · training · recovery · supplements ·
medical.

`linked_modules` ist damit keine Zierde, sondern die Angabe, **woher
`current_value` kommt**.

Also: das Feld „Verknuepfte Module" ist im Dialog **auswaehlbar** zu
bauen — die fuenf aus dem Entwurf — auch wenn die Spalte noch fehlt. Die
Auswahl wird im Formularzustand gehalten und traegt die Marke nach
`attrappeAus()`: eine Zeile, Quelle und Grund, *„wartet auf: G-536"*.

**Ein Feld, das man nicht anklicken kann, prueft niemand** — und dann
faellt beim Nachziehen der Spalte auf, dass der halbe Dialog fehlt.

## Warum dieser Punkt vor der Phase Engine kommt

**Tom, 2026-09-29, 11:56:** *„subnav phase engine: user kann seine goals
planen, terminieren, editieren."*

Die Phase Engine plant **Ziele**. Solange es keinen Weg gibt, ein Ziel
anzulegen, hat sie nichts zu planen — und genau deshalb zeigt der
Phase-Reiter heute eine Liste von Phasentypen statt einer Zeitachse
(G-538).

## Bericht

**Claude Code, 2026-09-29.**

### A1 - zielAnlegen

`[cmd]` **`lib/goals/schreiben.ts` kannte zwei Operationen, beide
`.update()`.** `[cmd]` **`zielAnlegen()` steht jetzt daneben** -
dieselbe Form wie `zielAendern`:

    .select('id')        die Zeilenzahl, die der INSERT getroffen hat
    data.length === 0    ein weggefiltertes INSERT ist KEIN Erfolg
    23505 + active_slot  derselbe Satz wie in zielAendern

`[read]` **Ohne `.select('id')` meldet PostgREST auch dann Erfolg,
wenn der Zeilenschutz alles weggefiltert hat** - der Fehler aus
G-79 haette sich am Anlegeweg wiederholt. **Eine Zusicherung haelt
es fest.**

`[read]` **Die Regeln liegen in `ziel-regeln.ts`, ergaenzt statt
dupliziert** - `pruefeNeuesZiel()` neben `pruefeAenderung()`.
**Dialog und Schreibweg rufen dieselbe Funktion.**

### A2 - die Regeln, gegen die Datenbank gemessen

`[cmd]` **Je Regel einmal gegen die laufende DB ausgeloest,
2026-09-29 - alle fuenf wiesen ab:**

    gueltiges Ziel          ANGELEGT
    Titel aus Leerzeichen   user_goals_title_check
    Deadline vor Start      user_goals_check
    Prioritaet 4 aktiv      user_goals_check1
    Zielart erfunden        user_goals_goal_type_check
    Prioritaet 1 doppelt    uq_user_goals_active_slot (23505)

`[read]` **Die Pruefung im Code bildet genau diese fuenf ab** - je
Regel eine Zusicherung, von beiden Seiten. `[cmd]` **Der Starttag
selbst ist erlaubt** (der CHECK sagt `>=`), **eine gebrochene
Prioritaet nicht** (die Spalte ist ganzzahlig).

`[cmd]` **Mehrere Fehler kommen EINZELN zurueck**, nicht als
Sammelsatz - sonst liessen sie sich nicht am Feld anzeigen.

### A3 - der Dialog

`[cmd]` **Die vier Arten aus dem CHECK**, nicht die sechs des
Entwurfs (`module-goals.jsx:696-703` nennt `weight`, `strength`,
`habit`, `custom` - die kennt die Datenbank nicht; `strength` ist
dort ein `subtype`). `[read]` **Das war schon G-354; ich habe es
nur bestaetigt.**

**Gebaut:** Titel · aktueller Wert · Zielwert · Einheit ·
Startdatum · Deadline · Prioritaet · Notizen.

`[read]` **Die Prioritaet gehoert ins ANLEGEN** - sie entscheidet,
welchen der drei aktiven Plaetze das Ziel belegt. **Danach ist sie
nur noch Umsortieren.** `[cmd]` **Als Auswahl 1 bis 3 mit dem
Hinweis ,,3 aktive Plaetze, jeder einmal".**

**Die verknuepften Module sind BEDIENBAR** - nach der Schaerfung:

`[read]` **Sie sind die Datenquelle, nicht Schmuck.** `[cmd]` **Der
Entwurf gibt jedem Ziel `history[]` und `pace`
(`module-goals.jsx:746-779`), und `user_goals` traegt
`auto_update`** - **der Ist-Wert kommt aus den Modulen, er wird
nicht getippt.**

`[cmd]` **Fuenf Knoepfe, die Wahl wird gehalten, `aria-pressed`
sagt den Zustand.** `[cmd]` **Am Schirm belegt:** 5 Knoepfe, nach
einem Klick 1 auf `aria-pressed="true"`.

`[cmd]` **Die Marke daneben, EINE Zeile:** *,,Attrappe -
theme-v1/module-goals.jsx · wartet auf: eine Spalte fuer
verknuepfte Module - wartet auf: G-536"*. `[read]` **Kein Absatz
ueber die fehlende Spalte** - das war G-534/A1.

### A4 - der Dialog vermischt nichts

`[cmd]` **Eine Zusicherung prueft fuenf Woerter im Rumpf des
Dialogs:** `nutrition_targets`, `Kalorienziel`, `Tageswert`,
`Strategie`, `kcal`. **Keines kommt vor.**

`[read]` **Ein `body_composition`-Ziel sagt WOHIN, eine Strategie
sagt WIE** - und nur die zweite aendert die Tageswerte. **Auch
nicht durch einen Hinweis, der beides in einen Satz zieht.**

### A5 - die vier Zustaende am Bild

    x-g537-1-leer.png          Dialog offen, 8 Felder,
                               „Create goal" GESPERRT (kein Titel)
    x-g537-2-ausgefuellt.png   Titel, Ist, Ziel, Einheit, Deadline
    x-g537-3-prio-belegt.png   „Prioritaet 1 ist schon vergeben.
                               Aktive Ziele belegen die Plaetze 1
                               bis 3, jeden nur einmal."
    x-g537-4-deadline.png      „Die Deadline liegt vor dem Start."
                               Knopf gesperrt
    x-g537-5-module.png        5 Modulknoepfe, 1 gewaehlt

`[cmd]` **Das Ziel wurde ueber die OBERFLAECHE angelegt:**

    body_composition | Auf 12 % Koerperfett | prio 1 | active
    current 16,000 | target 12,000 | % | 2026-12-31

`[cmd]` **Danach geloescht**, `test-user` hat wieder 0 Ziele.

`[read]` **Ein Messfehler bei mir selbst:** der erste Lauf meldete
`gespeichert: false`, obwohl die Zeile da war. `[cmd]` **Ursache:
das Modal schliesst nach 900 ms, mein Blick kam bei 2500 ms.**
`[cmd]` **Mit `waitForSelector` VOR dem Klick: Erfolgsmarke
gesehen, Modal zu.** `[read]` **Der Befund lag an der Probe, nicht
am Bau** - deshalb habe ich die Zeile in der Datenbank geprueft,
bevor ich etwas gemeldet habe.

### Die Grenze

`[cmd]` **20 Zusicherungen gruen.**

**Sabotageprobe, sieben Eingriffe, je von ihrer eigenen
gefangen:**

    Titel nicht getrimmt        -> 4      ROT
    Deadline-Regel weg          -> 5, 9   ROT
    Prioritaet bis 10           -> 6, 9   ROT
    .select(id) weg             -> 2      ROT
    Dialog nennt Kalorienziel   -> 1      ROT
    Modulwahl nicht gehalten    -> 5      ROT
    Module wieder ohne Klick    -> 4      ROT
    alles zurueck               -> 20/20  GRUEN, byteidentisch

`[cmd]` **`turbo run typecheck test build`: 18 von 18.** `[cmd]`
**Alle vier Waechter gruen.**

`[cmd]` **Der volle `pnpm gate` ist rot an EINER Stelle:**
`migration-kette` meldet
`20260929115000_g536_goal_strategies.sql` als nicht-live ohne
Kettenschritt. `[cmd]` **Codex' G-536-Migration, um 12:02 angelegt,
ungetrackt, in `supabase/`** - **nicht meine.**

`[cmd]` **`git status` in `apps/web/src/app/v2/`: nur `goals`.**
**Nichts committet.**

### Was offen bleibt

`[read]` **`linked_modules` wird gewaehlt, aber nirgends
gespeichert** - die Spalte kommt mit G-536. `[cmd]` **Die Marke
sagt das, und die Wahl ist bedienbar, damit sie am Tag der
Einspielung nur noch durchgereicht werden muss.**
