---
nr: G-541
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: claudecode
beauftragt: 2026-09-29
erledigt: 2026-09-29
commit: 6dd3932b

braucht: [G-536]
kind_von: G-534

quellen:
  - docs/ssot/130-goals-bauordnung.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - apps/web/src/app/v2/goals/ansicht.tsx
    - referenz/lumeos-2026/src/modules/goals/components/nutrition/GoalSelector.tsx

zahlen:
  gemessen: 2026-09-29
  elemente_ohne_quelle_vorher: 10
  strategien_im_katalog: 17
  davon_simple: 3
  davon_advanced: 14
---

# Das Vorschaupanel liest den Strategiekatalog

`[cmd]` Claude Code hat in G-534 gemeldet: **sieben Elemente des
Vorschaupanels haben keine Quelle** — Sub-phases, Guards, Exit
conditions, Success metrics, Jahreszyklus, Best for, Purpose. Dazu die
Variantenkachel „ohne jede Zahl", Hoechstdauer und Protein als Strich.

`[cmd]` **Seit 2026-09-29 14:00 haben alle zehn eine Quelle.**
`goals.goal_strategies` ist live, 17 Zeilen, selbst gemessen:

    Sub-phases        sub_phases            Guards       guards
    Exit conditions   exits                 Success      success
    Jahreszyklus      annual                Best for     best_for
    Purpose           purpose               Editor       editor_modes
    Hoechstdauer      max_duration_weeks    Protein      protein_per_kg

`[read]` **Die Variantenkachel loest sich auf:** `aggressive_cut`,
`moderate_cut` und `conservative_cut` sind **drei Katalogzeilen**, keine
Varianten einer Zeile. Jede traegt eigenen Faktor, eigene Rate, eigene
Makros.

## Auftrag

**A1** Das Vorschaupanel liest `goal_strategies` statt einer Attrappe.
Kein Element bleibt unter dem Trennstrich, das jetzt eine Spalte hat.

**A2** Was NULL ist, bleibt ein Strich **mit Grund** — nicht mit einer
erfundenen Zahl und nicht mit einem Absatz. `[cmd]` Gemessen: 1 von 17
Zeilen ohne `protein_per_kg` (`expert_bb_annual`, weil es aus Spec und
Mockup kommt, wo keiner steht).

**A3** Die Auswahl zeigt `tier` und `category` wie das Altrepo:
`referenz/lumeos-2026/src/modules/goals/components/nutrition/GoalSelector.tsx`
— Reiter Fat Loss · Aufbau · Hybrid · Contest · Expert, `simple` offen,
`advanced` hinter dem Schalter, `isGoalAvailable` als Sperre, `warnings`
auf der Karte. `[cmd]` Live: 3 simple, 14 advanced, 6 Kategorien. **Die
Datei lesen, bevor gebaut wird — sie lief.**

**A4** `requirements` als Sperre, nicht als Text. Eine Strategie, die
`coach_approval` verlangt, ist ohne Coach nicht waehlbar, und der Grund
steht am Knopf.

**A5** Die Grenze: Anzeige und Auswahl. **Nicht** der Editor (G-539),
**nicht** die Terminierung (G-538, Codex). Kein Knopf, der dorthin zeigt.

## Zu belegen

Bilder je Zustand auf `test-user@lumeos.local` — Auswahl offen, eine
`advanced`-Strategie gesperrt, eine Vorschau mit vollen Feldern, eine mit
NULL-Feld. Sabotage je Waechter in beide Richtungen. Vier Module
zeichengleich. `pnpm gate` gruen. Nichts committen.

`[read]` **Und die eigene Lehre gilt weiter:** zwei Fehler fand Claude
Code am Bild, nicht am Test. Hier sind es siebzehn Zeilen mit je zehn
Feldern — eine Zaehlprobe sagt nicht, ob das lesbar ist.

---

## Bericht Claude Code, 2026-09-29

### Was gebaut wurde

    apps/web/src/lib/goals/strategie-read.ts      Leseweg + Profil
    apps/web/src/lib/goals/strategie-regeln.ts    Reiter, Sperre, Merkmale
    apps/web/src/app/v2/goals/strategie-wahl.tsx  Auswahl (A3, A4)
    apps/web/src/app/v2/goals/strategie-vorschau.tsx  Panel (A1, A2)
    apps/web/src/lib/goals/__tests__/g541-strategiekatalog.test.ts

Angeschlossen in `page.tsx` (serverseitig geladen) und `ansicht.tsx`
**oberhalb** der Trennlinie — die Karten lesen eine Tabelle, nicht den
Entwurf.

### A1 — kein Element mehr unter dem Strich, das eine Spalte hat

`[cmd]` **Die Variantenkachel ist WEG, nicht befuellt.** Sie zeigte
`conservative · moderate · aggressive` als drei Woerter, weil
`phase_rate_rules` 0 Zeilen hatte (steht heute noch so). **Die drei sind
drei Katalogzeilen** — sie stehen jetzt als eigene Karten mit eigenem
Faktor, eigener Rate, eigenen Makros.

`[cmd]` **Zwei Waechter aus G-534 mussten umgeschrieben werden:** sie
fragten, ob die Kachel eine MARKE traegt. Die Frage ist nicht mehr
stellbar. **Was bleibt, ist die eigentliche:** es darf keine unbelegte
Spanne dastehen — `phase_rate_rules` ist weiterhin leer.

### A2 — eine Spalte zu haben heisst nicht, einen Wert zu haben

`[cmd]` **Gemessen 2026-09-29, wie viele der 17 Zeilen INHALT tragen:**

    editor_modes  17     guards         7     purpose    1
    protein       16     sub_phases     1     exits      1
    max_duration   9     best_for       1     success    1
                                             annual     1

`[read]` **Sechs der zehn Elemente sind in genau EINER Zeile gefuellt.**
**Deshalb entscheidet die ZEILE ueber den Strich, nicht das Element:**
`expert_bb_annual` zeigt fuenf Jahresbloecke und daneben fuenf Striche,
`reverse_diet` zeigt Waechter und Ausstiege und vier Felder ohne Eintrag.

`[cmd]` **Die eine Zeile ohne `protein_per_kg` ist `expert_bb_annual`** —
dieselbe ohne `tdee_modifier`. **Sie zeigt einen Strich, keine Null.**

`[cmd]` **`max_duration_weeks` fehlt in 8 von 17** — das heisst
*unbegrenzt*, nicht *nicht hinterlegt*, und traegt deshalb einen eigenen
Grund.

### A3 — die Auswahl, wie das Altrepo

`[cmd]` **`GoalSelector.tsx` gelesen, 248 Zeilen** — Aufbau und Regeln
uebernommen, nicht der Code. **Drei `simple` offen, 14 `advanced` hinter
dem Schalter, fuenf Reiter, Karte mit Abzeichen, Kennzahlen, Merkmalen.**

`[cmd]` **Zwei Fallen, beide aus der Datei gelesen:**

    Reiter `contest`  -> Kategorie `contest_prep`   NICHT derselbe Wert
    Reiter `hybrid`   -> `hybrid` UND `recovery`    sonst ist
                                                    reverse_diet
                                                    unerreichbar

`[cmd]` **Alle sechs gemessenen Kategorien liegen unter einem Reiter.**

### A4 — die Sperre greift auf echten Spalten

`[cmd]` **Beide Quellen gemessen, keine Attrappe:**

    Erfahrung   public.profiles.experience_level
                CHECK: beginner · advanced · pro · elite
    Coach       coach.relationships, status = 'active'
                RLS: der Klient darf seine eigene Zeile lesen

`[cmd]` **Am Schirm belegt:** `test-user` ist `pro` und hat **keinen**
Coach. **Beide Contest-Strategien sind gesperrt**, je mit
*,,Erfordert Coach-Betreuung"* **statt** des Knopfes — nicht daneben.
Gemessen: `[data-strategie-gesperrt]` 2, `[data-strategie-grund]` 2.

`[read]` **`min_experience` sperrt nur `beginner`** — die Regel des
Altrepos, und die vorsichtigere: wer nichts hinterlegt hat, wird nicht
ausgesperrt.

### A5 — die Grenze, gemessen statt vermutet

`[cmd]` **`goal_phases.strategie_code` existiert als Fremdschluessel auf
`goal_strategies.code`** — aber **`goals.goal_phase_start` nimmt ihn
nicht entgegen** (gemessen an `pg_get_function_arguments`).

`[read]` **Die Wahl laesst sich also nicht speichern.** **Ein Satz sagt
das, kein Knopf verspricht es:** *,,Die Wahl gilt fuer diese Ansicht.
Eine Strategie an eine Phase zu binden, braucht den Schreibweg aus
G-538."*

### Was das BILD zeigte und der Zaehler nicht

`[read]` **Die Warnung aus dem Auftrag hat sich bestaetigt.** **Zwei
Befunde bei gruener Messung** — kein Element lief ueber den Panelrand
hinaus, die Blockzahl stimmte:

    1  Der lange Leergrund stand in der rechtsbuendigen Zahlenspalte
       bis an die Kante.
    2  Bei `reverse_diet` standen VIER Listenueberschriften mit
       viermal demselben Satz darunter -- der Leerstand nahm mehr
       Platz ein als der Inhalt.

`[cmd]` **Beide behoben, beide mit einem Waechter festgehalten:** in der
engen Spalte steht der kurze Grund (voll im `title`), die leeren Felder
stehen gesammelt unter *,,Ohne Eintrag"* — **die Namen bleiben sichtbar**,
sonst waere nicht zu sehen, dass es die Felder gibt.

### Nachweise

    16 Sabotagen, je in beide Richtungen -- alle ROT, Wiederherstellung
       byte-gleich (md5 geprueft)
    4 Bilder auf test-user@lumeos.local:
       x-g541-1-auswahl.png        drei simple, Advanced zu
       x-g541-2-advanced.png       Contest-Reiter, 2 Karten gesperrt
       x-g541-4-voll.png           reverse_diet -- Waechter + Ausstiege
       x-g541-5-null.png           expert_bb_annual -- Jahreszyklus,
                                   Protein als Strich
    pnpm gate GRUEN -- 18/18 Tasks, 2192 Tests, 0 Fehler
    serverimport: 63 Client-Chunks, 0 Treffer (A-30 haelt)
    SSOT nachgezogen (Modultabellen, Schema, Spec-Abgleich)
    Nichts committet. Keine Zeile geschrieben -- `user_goals` fuer
       test-user: 0.

### Drei Waechter, die zuerst NICHT gemessen haben

`[read]` **Alle drei in der eigenen Sabotage aufgefallen, nicht am
Ergebnis:**

    1  Der Strich-Waechter suchte das Wort `grund` im Rumpf -- das
       steht auch in der Signatur. Die Sabotage blieb gruen.
    2  Der Literalwaechter verbot DREI Codes; die Sabotage setzte
       `'lose'` ein und kam durch. Jetzt: alle 17.
    3  Der Kurzgrund-Waechter suchte `LEER_KURZ` in der Datei -- die
       Konstante bleibt stehen, auch wenn die Ausgabe sie nicht mehr
       benutzt.

### Offen, nicht gebaut

`[read]` **`goal_phase_start` ohne `strategie_code`** — die Wahl haengt,
bis G-538 den Weg hat. **Die Auswahl ist bedienbar**, damit sie am Tag
der Einspielung nur noch durchgereicht werden muss.

`[read]` **`tools/_g541-vorschau.mjs`** hat die Panelbilder gemacht
(`schuss.mjs --fullPage` liefert 1440x900, weil das Geruest intern
scrollt). Liegt unter `tools/_*` und ist ignoriert.

---

## Abnahme, Orchestrator, 2026-09-29 16:10

**Angenommen — und der Bericht korrigiert die Abnahme von G-536.**

### Der Befund, der meine eigene Abnahme widerlegt

`[cmd]` Die Abnahme zu G-536 sagte: *„die zehn Elemente aus G-534 tragen
jetzt eine Spalte."* Claude Code hat gezaehlt, **wie viele der 17 Zeilen
einen Wert tragen**:

    editor_modes  17     guards         7     purpose    1
    protein       16     sub_phases     1     exits      1
    max_duration   9     best_for       1     success    1
                                             annual     1

`[read]` **Sechs von zehn Spalten sind in genau EINER Zeile gefuellt.**
Eine Spalte zu haben ist nicht dasselbe wie einen Wert zu haben — und
genau das hatte die Abnahme zu G-536 gleichgesetzt. **Der Katalog hat die
Form, nicht den Inhalt.** Das ist **G-545**.

`[read]` Und die Folge daraus hat er richtig gezogen: **bei A2 entscheidet
die Zeile ueber den Strich, nicht das Element.** `expert_bb_annual` zeigt
fuenf Jahresbloecke und daneben fuenf Striche — dieselbe Kachel ist bei
einer Strategie belegt und bei sechzehn leer.

### Die drei Fallen, die er gemeldet hat

`[read]` **A3:** Reiter `contest` → Kategorie `contest_prep` (nicht
derselbe Wert), und `hybrid` muss `hybrid` **und** `recovery` sammeln —
sonst ist `reverse_diet` ueber keinen Reiter erreichbar. **Das haette kein
Test gefunden**, nur das Durchklicken.

`[read]` **A4:** Die Sperre liegt auf echten Spalten
(`profiles.experience_level`, `coach.relationships`), nicht auf einer
Attrappe. `test-user` ist pro ohne Coach, also sind **beide
Contest-Strategien real gesperrt** — der Grund steht statt des Knopfes.

`[read]` **A5:** `goal_phases.strategie_code` existiert als
Fremdschluessel, aber `goal_phase_start` nimmt ihn nicht entgegen. **Die
Wahl laesst sich nicht speichern, und ein Satz sagt das** — kein Knopf
verspricht etwas, das nicht geht. Das ist der Rest von G-544.

### Die Warnung aus dem Auftrag hat zweimal getroffen

`[cmd]` **Zwei Befunde bei gruener Messung:** der lange Leergrund lief in
der rechtsbuendigen Spalte bis an die Kante, und bei `reverse_diet`
standen vier Ueberschriften mit viermal demselben Satz darunter. **Kein
Element lief ueber den Panelrand, die Blockzahl stimmte** — die Zaehlprobe
war gruen und das Bild war falsch.

`[cmd]` **Und drei eigene Waechter haben zuerst nichts gemessen**,
aufgefallen in der Sabotage statt am Ergebnis: einer suchte das Wort
`grund`, das auch in der Signatur steht; einer verbot drei Codes statt
aller 17; einer suchte eine Konstante, die auch unbenutzt dasteht.

`[read]` **Das ist die Regel „eine Pruefung muss in beide Richtungen
belegt sein" bei der Arbeit** — ohne die sechzehn Sabotagen waeren drei
gruene Waechter stehen geblieben, die nichts pruefen. Dieselbe Fehlerart,
die der Orchestrator heute sechsmal ohne Gegenprobe gemacht hat.

### Die Variantenkachel ist weg, nicht befuellt

`[read]` Zwei G-534-Waechter mussten umgeschrieben werden, weil ihre Frage
(*„traegt die Kachel eine Marke?"*) nicht mehr stellbar ist — die drei
Cuts sind drei Katalogzeilen und stehen als eigene Karten oberhalb der
Linie. **Die eigentliche Frage (keine unbelegte Spanne) bleibt geprueft.**
