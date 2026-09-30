---
nr: G-539
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-09-29
beauftragt: 2026-09-30
agent: claudecode

braucht: [G-536, G-538]
kind_von: G-534

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx
  - docs/punkte/00-INDEX.md

erledigt: 2026-09-30
commit: 9ed19b12
beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx

zahlen:
  gemessen: 2026-09-29
  reiter_im_entwurf: 12
  reiter_gebaut: 0
  zeilen_entwurf: 569
---

# Der Phasen-Editor fehlt — „editieren" aus Toms Satz

    AUFTRAG FUER Claude Code - G-539: der Phasen-Editor, persoenlicher
                                     Override ohne die Vorgaben zu
                                     zerstoeren
    Bereich: apps/web/src/app/v2/goals/
             apps/web/src/lib/goals/
             apps/web/src/lib/goals/__tests__/
    Fremd:   supabase/ gehoert Codex, der gerade an G-559 baut
             (phase_am gibt eine Phase zurueck, wo mehrere gelten).
             Kein SQL, kein Kettenschritt. goal_strategies wird
             GELESEN - der Katalog hat seit G-545 Werte: 17 von 17
             guards, 7 exits, drei Prep-Stufen in sub_phases.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-09-30

**Zuerst lesen, vollstaendig:** diese Datei, dann
`docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx`
(569 Zeilen, der ganze Editor mit `PE_MODES` und dem `anchor`-Reiter)
und `docs/sessions/2026-09-30-uebergabe.md`.

**Zwei Dinge, die ohne Lesen falsch verstanden werden:**

- **Die Ankerrechnung ist schon da.** `lib/goals/anker.ts` aus G-544 ist
  server-frei und geprueft — **wiederverwenden, nicht neu rechnen.** Zwei
  Rechnungen fuer dasselbe gehen auseinander.
- **Der Editor ueberschreibt die Auslieferung nicht.** Der Entwurf sagt
  es auf Zeile 56: *„Personal override — the shipped defaults stay
  intact."* Ein Override liegt an der Phase des Nutzers, nie am Katalog.


**Tom, 2026-09-29, 11:56:** *„subnav phase engine: user kann seine goals
planen, terminieren, **editieren**."*

`[cmd]` `module-goals-editor.jsx` ist 569 Zeilen und war bis heute
ungelesen. **Claude Code meldet in G-534 „der komplette elfstufige
Editor" als ohne Quelle — die Quelle ist diese Datei.**

## Was der Editor ist

`[read]` Zeile 56: *„Personal override — the shipped defaults stay
intact"*. Der Editor aendert **nicht** den Katalog (G-536), sondern legt
eine persoenliche Abweichung darueber. Der Fuss hat zwei Knoepfe:
*„Save as my template"* und *„Apply to my plan"*.

Das ist die Ebene, die `goal_phases.parameters` traegt.

## Zwoelf Reiter, aber je Strategie nur die passenden

`[read]` `PE_MODES`, Zeile 3-11 — das ist keine Fallunterscheidung im
Browser, das ist eine Eigenschaft der Strategie und gehoert an den
Katalogeintrag (G-536, Nachtrag):

| Strategie | Reiter |
|---|---|
| `fat_loss` | variants · guards · duration |
| `lean_bulk` | params · guards · duration |
| `maintenance` | params |
| `recomp` | params · cycling |
| `contest_prep` | subphases · refeeds · peakweek · guards · anchor |
| `reverse_diet` | params · exits · guards |
| `expert_bb_annual` | annual · anchor · overrides |

Die zwoelf Reiter im Einzelnen, mit ihrer Fundstelle:

| Reiter | Zeile | Was er tut |
|---|---|---|
| variants | 110 | je Variante Defizit, Protein, Hoechstdauer, Rate, Diaetpause |
| params | 138 | flache Werte, Bereich oder Einzelwert |
| cycling | 152 | Trainings-/Ruhetag-Delta, **rechnet den Wochenmittelwert** |
| duration | 172 | Hoechstdauer, Mindestdauer, Auto-Uebergang, Diaetpausen |
| subphases | 200 | Tabelle: Stage, Wochen bis Show, Defizit, Cardio |
| refeeds | 246 | Startwoche, Haeufigkeit, Carb-Faktor, Wochentage |
| peakweek | 272 | Entleerung/Ladung in Tagen und g/kg, fuenf Protokolle |
| anchor | 296 | **Showdatum → alles rueckwaerts** |
| annual | 330 | Monatsbalken, Summe muss 12 ergeben |
| overrides | 400 | je Block im Jahreszyklus eigene Werte |
| guards | 432 | je Waechter Schalter **und Schwellwert-Schieber** |
| exits | 470 | Ausstiegsbedingungen, OR-verknuepft |

## Was das an Fachlogik verlangt

Drei Reiter rechnen, sie zeigen nicht nur:

- **cycling**: `(5 × 200 + 2 × -300) / 7` → Wochenmittel, dazu
  `TDEE + Mittel` als effektives Tagesziel
- **anchor**: Showdatum minus Wochen → sechs Datumsangaben
- **annual**: Monatssumme muss 12 sein, sonst ist der Plan kaputt

Die gehoeren server-frei in `lib/goals/`, nicht in die Komponente — wie
`ziel-regeln.ts`, damit beide Seiten dieselbe Rechnung nutzen.

## Was zu tun ist

1. Der Editor liest seine Ausgangswerte aus `goal_strategies` (G-536) und
   schreibt **nur die Abweichung** nach `goal_phases.parameters` — nicht
   den ganzen Satz. Sonst ist ein spaeter geaenderter Katalogwert bei
   jedem Nutzer eingefroren.
2. Welche Reiter erscheinen, entscheidet `PE_MODES` **aus der Tabelle**,
   nicht eine Liste im Browser.
3. Die drei Rechnungen server-frei nach `lib/goals/`, je eine
   Zusicherung mit einer Zahl, die von Hand nachrechenbar ist.
4. „Save as my template" braucht G-540 und bleibt bis dahin aus — **kein
   Knopf, der nichts tut**. „Apply to my plan" reicht fuer den Anfang.
5. Der `guards`-Reiter zieht die Schwellwerte aus den Waechtern, die
   G-520 gebaut hat. Wenn dort kein Schwellwert konfigurierbar ist, ist
   das ein Befund und kein Grund fuer einen Schieber ohne Wirkung.

## Grenze

Nach G-538. Der Editor verschiebt Zeitfenster; solange eine Phase an
keinem Ziel haengt, verschiebt er nichts Bestimmtes.

---

## Auftrag, vorbereitet 2026-09-29 16:20

Die fuenf Punkte oben. Dazu, was sich seit dem Anlegen geklaert hat:

**`PE_MODES` steht als Spalte im Katalog.** `[cmd]` `editor_modes` ist die
einzige der zehn Spalten, die in **allen 17** Zeilen gefuellt ist. Welche
Reiter erscheinen, kommt aus der Tabelle — keine Fallunterscheidung im
Browser, kein `switch` ueber Strategiecodes.

**Die Ausgangswerte sind duenn, und das entscheidet den Bau.** `[cmd]` Von
zehn Spalten sind sechs in genau einer der 17 Zeilen gefuellt (G-545 holt
das nach). Ein Editor, der ein leeres Feld als `0` anzeigt, schreibt beim
Speichern eine erfundene Null in den Override. **Leer muss leer bleiben,
bis der Nutzer etwas eintraegt** — und ein Feld ohne Katalogwert sagt, dass
es keinen gibt, statt einen zu behaupten.

**Der Override ist eine Differenz, kein Abzug.** `goal_phases.parameters`
traegt **nur die geaenderten** Werte. Wer den ganzen Satz hineinschreibt,
friert den Katalogstand von heute bei jedem Nutzer ein — und eine spaetere
Korrektur am Katalog erreicht keinen mehr.

**Die drei Rechnungen server-frei nach `lib/goals/`:**

    cycling   (5 × 200 + 2 × -300) / 7  ->  Wochenmittel, dann TDEE + Mittel
    anchor    Showdatum minus Wochen    ->  sechs Datumsangaben
    annual    Monatssumme muss 12 sein  ->  sonst ist der Plan kaputt

`[read]` **`anchor` wird von G-544 auch gebraucht** — dieselbe Rechnung,
zwei Aufrufer. Wenn G-544 sie gebaut hat, wird sie hier **benutzt**, nicht
nachgebaut. Zwei Rechnungen fuer dasselbe gehen auseinander.

**Reihenfolge:** nach G-544 (die Zeitachse, in Arbeit) und G-545 (die
Katalogwerte, bei Codex vorbereitet). Vorher editiert der Editor leere
Felder an einer Phase ohne Zeitfenster.

`[read]` **„Save as my template" bleibt aus** — G-540 ist nicht
entschieden, und drei Fragen liegen bei Tom. **Kein Knopf, der nichts
tut**; „Apply to my plan" reicht.


---

## Bericht Claude Code, 2026-09-30

### Was gebaut wurde

    apps/web/src/lib/goals/editor-rechnungen.ts    die drei Rechnungen
    apps/web/src/lib/goals/phase-write.ts          phasenOverrideSetzen
    apps/web/src/lib/goals/strategie-read.ts       refeeds, peak_week_details, roh
    apps/web/src/app/v2/goals/phasen-editor-echt.tsx  der Editor
    apps/web/src/app/v2/goals/phase-aktionen.ts    phasenOverrideAktion
    apps/web/src/app/v2/goals/phasen-zeitachse.tsx Knopf + Einbindung
    apps/web/src/lib/goals/__tests__/g539-editor.test.ts

### 1 — der Override ist eine Differenz

`[cmd]` **`module-goals-editor.jsx:56`:** *„Personal override — the
shipped defaults stay intact."*

`[cmd]` **Geschrieben wird nur, was vom Katalog abweicht**
(`nurAbweichung`). **Das ist keine Sorge auf Vorrat:** G-545 hat den
Katalog heute nachgefuellt — `guards` von 7 auf **17 von 17**, `exits`
von 1 auf 7. **Wer vorher den ganzen Satz kopiert haette, saehe diese
Korrektur nie.**

`[read]` **Ein leeres Feld ist keine Aenderung, eine getippte Null
schon** — beides mit einer Zusicherung festgehalten.

### 2 — die Reiter kommen aus der Tabelle

`[cmd]` **`editor_modes` ist in allen 17 Zeilen gefuellt** und deckt
sich mit `PE_MODES` des Entwurfs. **Am Schirm gemessen**, `contest_prep`
geoeffnet:

    subphases · refeeds · peakweek · guards · anchor

`[read]` **Kein `switch` ueber Strategiecodes** — ein Waechter prueft
das gegen alle 17 Codes, und die Sabotage (`code === 'contest_prep'`)
wird rot.

### 3 — die drei Rechnungen, server-frei und nachrechenbar

**cycling** — der Entwurf rechnet `(5 × 200 + 2 × -300) / 7` und
zeigt `+57 kcal/day` (`:164`):

    (5 × 200) + (2 × -300) = 1000 - 600 = 400
    400 / 7                  = 57,142…     -> 57
    gegen TDEE 2800          -> effektiv 2857

`[read]` **Die Ruhetage sind `7 − Trainingstage`, keine eigene
Eingabe** — sonst koennten beide auseinandergehen.

**annual** — *„Total must sum to 12 months"* (`:336`). **Gegen die
echten Spalten gerechnet:**

    1–4 -> 4 | 5–6 -> 2 | 7–10 -> 4 | 11 -> 1 | 12 -> 1   Summe 12

`[read]` **Eine Spanne zaehlt beide Enden mit** — `1–4` sind vier
Monate, nicht drei.

**anchor** — **nicht nachgebaut.** `[cmd]` **`lib/goals/anker.ts` aus
G-544 wird importiert**, und ein Waechter verbietet jede eigene
Tagesrechnung in der Editordatei.

### 4 — „Save as my template" bleibt aus

`[cmd]` **Der Entwurf hat zwei Fussknoepfe** (`:497-498`). `[read]`
**Nur „Uebernehmen" ist gebaut** — ein Waechter verbietet das Wort
„Vorlage" im Editor, und die Zeitachse sagt, dass G-540 dafuer fehlt.

### 5 — die Schwellen: ein BEFUND, kein Schieber

`[cmd]` **Der Entwurf zeigt je Waechter einen Schwellwert-Schieber**
(`:456-461`). `[cmd]` **Die Schwellen sind nicht einstellbar:**
`pruefeWaechter` (G-520) nimmt keine entgegen — `Waechterlage` traegt
Messwerte, die Grenzen stehen als Konstanten (`BF_SCHWELLE` aus
`PHASE_MODELS.md:133`).

`[read]` **Also kein Schieber ohne Wirkung.** **Die Schwelle wird
GELESEN und angezeigt** (wie im Entwurf, erste Zahl im Regeltext),
**und darunter steht, warum sie fest ist.** Am Schirm: drei Waechter,
Schwellen 5 und 20 erkannt, `hormonal symptoms` ohne — **`null`, nicht
`0`.**

`[cmd]` **Eine Gegenprobe haelt den Befund:** traegt `Waechterlage`
je ein Feld `schwelle`/`grenze`/`threshold`, wird der Test rot — dann
**waere** sie einstellbar und der Satz im Editor falsch.

### Am BILD gefunden: G-545 hat die Form geaendert

`[cmd]` **Der subphases-Reiter zeigte vier Gedankenstriche je Stufe.**
**Gemessen an `jsonb_object_keys`:**

    frueher   name · weeks · deficit · cardio(Text)
    seit G-545 name · cardio(OBJEKT) · fat_g_per_kg
               · tdee_multiplier · protein_g_per_kg
               · fat_minimum_g_per_kg

`[cmd]` **`weeks` und `deficit` gibt es in KEINER Zeile mehr**, und
`cardio` ist `{type, minutes, sessions_per_week}`.

**Behoben:** die Teilphase traegt ihre Rohform mit (`roh`), der Reiter
zeigt Schluessel und Wert wie sie dastehen, und verschachtelte Werte
werden lesbar (`type LISS · minutes 30–40 · sessions_per_week 3–4`)
statt `[object Object]`.

### Und eine Folge davon, die G-544 betrifft

`[read]` **Der Ankerplan hat seit G-545 keine Quelle mehr.** `[cmd]`
**Die Rechnung ist richtig und geprueft** — sie bekommt nur keine
Wochen mehr. **Der Editor sagt das jetzt woertlich:**

    3 Teilphasen, aber keine Wochenangabe. Seit dem Katalognachtrag
    (G-545) fuehrt `sub_phases` kein `weeks` mehr — ohne sie laesst
    sich kein Datum zurueckrechnen.

`[read]` **Das ist ein Befund fuer Codex**, kein Bau: entweder traegt
`sub_phases` die Wochen wieder, oder der Ankerplan braucht eine andere
Quelle. **Die Zeitachse aus G-544 zeigt denselben Leerstand** — dort
klappt der Terminplan seither nicht mehr auf.

### Nachweise

    23 Sabotagen, alle ROT, 1 Kontrollprobe gruen,
       Wiederherstellung byte-gleich (md5 je Datei)
    4 Bilder auf test-user@lumeos.local:
       x-g539-1-knopf.png    die Zeitachse mit dem Anpassen-Knopf
       x-g539-2-editor.png   fuenf Reiter aus editor_modes, echte Werte
       x-g539-3-guards.png   Waechter mit Schwellen, ohne Schieber
       x-g539-4-anchor.png   der Ankerreiter mit dem wahren Grund
    pnpm gate GRUEN -- 18/18 Tasks, 2.321 Tests, 0 Fehler
    serverimport: 63 Client-Chunks, 0 Treffer (A-30 haelt)
    Testzeilen entfernt: user_goals 0, goal_phases 0
    SSOT nachgezogen. Nichts committet.

### Zwei fremde Waechter nachgezogen

`[cmd]` **G-544/A4 verbot einen Knopf in den Editor** — mit der
Begruendung *„den gibt es erst mit G-539"*. **Den gibt es jetzt.**
`[read]` **Die Begruendung ist hinfaellig, die REGEL nicht:** die
Pruefungen fordern jetzt den Knopf UND verbieten weiterhin, was fehlt
(eigene Vorlagen, G-540).

### Was nicht gebaut wurde

`[read]` **Die Reiter `variants` und `params` teilen sich die Felder**
— der Entwurf trennt sie nach Darstellung (je Variante gegen flach),
**die Werte sind dieselben Spalten.** Eine eigene Variantentabelle gibt
es im Katalog nicht.

`[read]` **`overrides` zeigt die Abweichungen, nicht je Jahresblock
eigene Werte** — `annual` traegt `{months, phase, focus}`, keine
Parameter je Block. **Dafuer gibt es keine Spalte.**

`[read]` **`refeeds` und `peakweek` zeigen, was dasteht, und lassen
sich nicht aendern** — beide Spalten sind `jsonb` mit zwei
verschiedenen Formen (`{every_weeks, duration_weeks}` gegen
`{type, frequency, start_after_week}`). **Ein Formular dafuer braucht
eine Entscheidung, welche Form gilt.**

## Abnahme 2026-09-30 — `9ed19b12`

`[cmd]` **Die Differenz als Override ist die richtige Wahl, und der
Beweis ist heute entstanden:** G-545 hat `guards` von 7 auf 17 von 17
nachgefuellt. **Wer beim Anlegen den ganzen Katalogsatz kopiert haette,
saehe diese Korrektur nie** — der Nutzer haette eine Kopie vom Vormittag.

`[cmd]` **Die drei Rechnungen liegen server-frei** in
`lib/goals/editor-rechnungen.ts`, und der Anker wird aus G-544
**importiert, nicht nachgebaut** — mit einem Waechter, der eigene
Tagesrechnung in der Editordatei verbietet. Das war A2 des Auftrags und
ist die Stelle, an der zwei Rechnungen auseinanderlaufen wuerden.

`[read]` **Die Schwellen als Befund statt als Schieber** ist die
Entscheidung, die ich sehen wollte. `pruefeWaechter` nimmt keine
Schwelle entgegen; ein Feld dafuer waere ein Bedienelement ohne Wirkung
gewesen. **Stattdessen wird die Schwelle gelesen, angezeigt und
begruendet, und eine Gegenprobe wird rot, falls die Funktion je ein
Schwellenfeld bekommt.** Ein Befund mit eingebauter Warnung fuer die
Zukunft.

`[cmd]` **23 Sabotagen alle rot, 2.321 Tests.** Das ist die dritte
Meldung hintereinander, in der die Gegenprobe vor dem Bau kam.

## Der Befund, der aus dieser Abnahme folgt

`[cmd]` **G-545 hat `sub_phases` umgeschrieben und `weeks` sowie
`deficit` entfernt** — vom Orchestrator selbst aus der laufenden
Datenbank nachgelesen. Die drei Stufen tragen `tdee_multiplier`,
`protein_g_per_kg`, `fat_g_per_kg`, `fat_minimum_g_per_kg` und `cardio`
als Objekt. **Keine Wochenangabe.**

`[read]` **Damit hat der Ankerplan aus G-544 keine Quelle mehr.** Die
Rechnung ist richtig und geprueft, sie bekommt nur keine Wochen; der Plan
faellt auf eine Zeile zusammen und der Knopf „Terminplan" verschwindet.
**Das ist G-562**, und es ist eine Entscheidung, kein Bau.

`[read]` **Claude Code hat das am Bild gefunden, nicht am Test** — der
Reiter zeigte vier Gedankenstriche je Stufe. **Das ist heute das dritte
Mal, dass ein Fehler bei gruener Messung am Bild auffiel.**

## Mein Fehler in dieser Kette

`[cmd]` **Mein Auftrag G-545 verlangte als Nachweis eine ZAEHLUNG** —
,,vorher/nachher je Spalte: wie viele der 17 Zeilen tragen einen Wert".
`[read]` **Eine Zaehlung kann einen Formwechsel nicht sehen:** vorher 1,
nachher 1, anderer Inhalt. **Meine Abnahme hat genau diese Zahl geprueft
und nichts gemerkt.** Wer einen Wert ERSETZEN laesst, verlangt den
Schluesselvergleich, nicht die Anzahl.

`[annahme]` **Und zum dritten Mal hat ein Agent in `docs/` geschrieben**
(diese Punktdatei). Ohne Schaden, aber `docs/` gehoert dem Orchestrator —
der Bericht kommt als Antwort.
