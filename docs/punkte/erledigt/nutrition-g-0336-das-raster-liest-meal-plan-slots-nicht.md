---
nr: G-336
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-335
entscheidung: E-59
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 9ff2f0ec
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/plan-lesen.ts
zahlen:
  gemessen: 2026-09-02
---

# G-336 — das Raster liest `meal_plan_slots` nicht

## Befund

Tom, 2026-09-02: *,,ich habe getestet einen neuen plan anzulegen,
genau was ich sage es uebernimmt die definition in preferences
nicht."*

`[cmd]` **Gemessen: der Plan *test* HAT fuenf Slots.** **Die Kopie
greift.**

    test                 5 Slots
    Aufbau-Wochenplan    0
    Buddy auto-plan      0
    Cut 4-Meal 2200      0
    Lean bulk 3100       0

`[cmd]` **Aber das Raster zeigt vier Zeilen und schreibt:** *,,4
Reihen aus deinen Vorlieben — 4 Hauptmahlzeiten und 1 Snack."*

`[cmd]` **`meal_plan_slots` wird in `apps/` nirgends gelesen** — **nur
in der Pipeline und im Test.**

`[read]` **Die Tabelle ist gebaut, gefuellt, und hat keinen Aufrufer
im Browser.**

`[read]` **Die vierte Funktion ohne Aufrufer** — nach
`meal_plan_day_to_diary`, `copy_meal_plan_week` und
`reference_assessment_window_flags`.

## Und die vier alten Plaene sind leer

`[cmd]` **Die Kopie wirkt beim Anlegen** — **die geseedeten Plaene
sind vorher entstanden.**

`[read]` **Tom: *,,der bestehende eigene (geseedete plan) hat auch
nicht was in preferences ist."***

`[read]` **Zwei Faelle, zwei Loesungen:**

`[read]` **Selbstplaene ohne Slots** — **duerfen die Vorlieben lesen,
solange sie keine eigenen haben.** `[cmd]` **Das ist der Rueckfall,
den G-335 fuer das Tagebuch schon gebaut hat.**

`[read]` **Gelieferte Plaene ohne Slots** — **der Seed muesste sie
mitbringen.** `[cmd]` **C-380 hat die drei Plaene gefuellt, bevor
`meal_plan_slots` existierte.**

## Und die Ghost-Eintraege

Tom: *,,ghostentries sind klar die bilden ab was im plan drin ist
also muss der plan angepasst werden."*

`[read]` **Richtig** — **wenn der Plan seine Struktur traegt und das
Raster sie liest, folgen die Ghost-Eintraege von selbst.**

## Auftrag — das Raster liest die Planstruktur

**Beauftragt am 2026-09-02.**

### 1 · `meal_plan_slots` anschliessen

`[cmd]` **Die Tabelle ist gebaut und gefuellt** (C-396) — **`test`
traegt fuenf Slots.**

`[cmd]` **In `apps/` liest sie niemand.**

`[read]` **`rasterZeilen` rechnet weiter aus `food_preferences`** —
**deshalb vier Zeilen statt fuenf, und der Satz *aus deinen
Vorlieben*.**

### 2 · Die Rangfolge, wie in G-335

`[read]` **Du hast sie fuer die Namen schon gebaut** — **dieselbe
Ordnung gilt fuer die Zeilen:**

    Plan-Slots         wenn der Plan welche hat
    Nutzer-Slots       wenn nicht, und es ein Selbstplan ist
    meals_per_day      Rueckfall, wie im Tagebuch

`[cmd]` **Und der Satz unter dem Raster muss sagen, welche Quelle
gilt** — heute behauptet er *aus deinen Vorlieben*, **auch wenn der
Plan eigene traegt.**

### 3 · Die vier alten Plaene

`[cmd]` **`Aufbau-Wochenplan`, `Cut 4-Meal 2200`, `Lean bulk 3100`,
`Buddy auto-plan`: 0 Slots.**

`[read]` **Sie entstanden, bevor `meal_plan_slots` existierte.**

`[read]` **Selbstplaene ohne Slots duerfen die Vorlieben lesen** —
**das ist der Rueckfall.** `[read]` **Aber die drei gelieferten
muessten ihre eigene Struktur haben** — **melde, wenn Codex den Seed
nachziehen muss.**

### 4 · Die Ghost-Eintraege folgen

Tom: *,,ghostentries bilden ab was im plan drin ist, also muss der
plan angepasst werden."*

`[read]` **Richtig** — **wenn das Raster die Struktur liest, folgen
sie von selbst.** `[cmd]` **Miss es, statt es anzunehmen.**

### 5 · *Mahlzeit hinzufuegen* wird ein Modal

Tom, 2026-09-02: *,,das unten in diary auch nicht geloest, ich denke
da ist ein modal besser."*

`[cmd]` **Heute steht das Formular inline unter der letzten Karte** —
**deshalb verschwindet der Knopf beim Klick, deshalb draengeln sich
Uhrzeit und Auswahl.**

`[cmd]` **Und die Auswahl heisst weiter *Sonstiges*** — **sie liest
die Slots nicht.**

`[read]` **Ein Modal hat Platz fuer das, was eine neue Mahlzeit
braucht:** Name, Zeit, und den Hinweis, wo sie einsortiert wird.

`[cmd]` **Und es gibt schon eins:** `FoodSuchModal` aus G-320,
**ziehbar seit G-321.** `[read]` **Dieselbe Machart, keine neue.**

### Was die Auswahl anbietet

`[read]` **Die eigenen Slots, mit ihrer Zeit** — **und Freitext
daneben.**

`[cmd]` **E-58: wer um 22:00 isst und keinen Slot dafuer hat, erfasst
trotzdem.** `[read]` **Die Slots ordnen, sie schreiben nicht vor.**

`[read]` **Der Satz *,,Wird bei Nachmittagssnack (16:00) einsortiert
— die naechstliegende Zeit"* ist richtig** — **er gehoert ins Modal,
nicht unter ein halb verdecktes Feld.**

### Was nicht zu tun ist

**Keine zweite Rangfolge** — die aus `slots-lage.ts` gilt.
**Nichts auf `dev@lumeos.app` schreiben** — der Plan `test` ist Toms
Probe, er bleibt stehen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    test              fuenf Zeilen im Raster, nicht vier
    Satz darunter     nennt die richtige Quelle
    Aufbau-Plan       Rueckfall greift, gezaehlt
    Ghost-Eintraege   folgen der Planstruktur, gemessen
    gelieferte Plaene was fehlt, gemeldet
    Mahlzeit anlegen  im Modal, Slots als Auswahl plus Freitext
    22-Uhr-Fall       ohne passenden Slot erfassbar
    Einsortiersatz    steht im Modal, sichtbar
    Bildschirmfoto    vorher / nachher

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app`. Dev-Server
auf 3200 **nicht neu gestartet** — er lief gesund, eine Instanz.

---

### Der Befund war groesser als der Auftrag sagte

`[cmd]` **Der Auftrag nannte einen Fall:** `test` zeigt vier Zeilen
statt fuenf. `[cmd]` **Gemessen am Schirm, vor dem Bau, alle vier
Plaene:**

    Plan                       Slots   Satz unter dem Raster
    test                         5     "4 Reihen aus deinen Vorlieben"
    Aufbau-Wochenplan            0     "4 Reihen aus diesem Plan"
    Lean bulk 3100 (market)      0     "4 Reihen aus diesem Plan"
    (aktiver Plan)               0     "4 Reihen aus diesem Plan"

`[read]` **Der Satz war in jedem gemessenen Fall falsch herum** — der
Plan MIT Struktur berief sich auf die Vorlieben, die drei OHNE
Struktur beriefen sich auf den Plan.

### Die Ursache, gemessen

`[cmd]` **`planZeilen` kam aus den EINTRAEGEN**, nicht aus der
Struktur (`plan-lesen.ts:476`, vor dem Bau):

    const planZeilen: Slot[] = SLOTS.filter(s => benutzt.has(s))

`[read]` **Damit ging es in beide Richtungen schief:** `test` hat
**fuenf Slots und null Eintraege** — also keine Zeilen, also der
Rueckfall. **`Lean bulk` hat null Slots und 28 Eintraege** in vier
Kategorien — also *,,aus diesem Plan"*, obwohl der Plan nichts
mitbringt.

`[cmd]` **Und `SLOTS` hat nur vier Werte** — selbst ein Plan mit
`pre_workout`-Eintraegen haette nie fuenf Zeilen zeigen koennen.

---

## 1 · `meal_plan_slots` ist angeschlossen

`[cmd]` **Zwei Lesewege, beide neu:**

    plan-lesen.ts       .from('meal_plan_slots').eq('plan_id', ...)
                        — die Slots des GEWAEHLTEN Plans, fuers Raster
    slots-lesen.ts      ladeAktivPlanSlots() — die des AKTIVEN Plans,
                        fuer die Ghost-Eintraege

`[cmd]` **`status = 'active'`, nicht `is_active`** — dieselbe
Bedingung, unter der `ladeGhostEintraege` seine Positionen holt.
**Zwei Bedingungen fuer dieselbe Frage waeren zwei Wahrheiten.**

## 2 · Die Rangfolge, und der Satz folgt ihr

`[cmd]` **`rasterQuelle()` in `slots-lage.ts`** — **dort, wo schon
`mahlzeitName` steht (G-335). Keine zweite Rangfolge:**

    planSlots        wenn der Plan welche hat            (E-59)
    nutzerSlots      wenn nicht, und der Plan ist eigen  (E-58)
    vorlieben        Rueckfall, wie im Tagebuch

`[cmd]` **Der Satz kommt aus `zeilenSatz()`, derselben Datei** —
**er wird nicht mehr danebengeschrieben, sondern aus der Quelle
abgeleitet.** `[read]` **Genau daran ist er vorher gescheitert.**

`[cmd]` **Am Schirm gemessen, nachher:**

    test                     5  "5 Reihen aus diesem Plan — er bringt
                                 seine eigene Mahlzeitenstruktur mit."
    Aufbau-Wochenplan        5  "5 Reihen aus deinen Mahlzeiten —
                                 dieser Plan hat keine eigene
                                 Struktur, also gilt deine."
    Lean bulk (marketplace)  4  "4 Reihen aus deinen Vorlieben —
                                 dieser Plan bringt keine eigene
                                 Struktur mit."

`[read]` **Alle drei Stufen sind damit am Schirm belegt**, nicht nur
im Test.

### Eine Entscheidung, die der Auftrag nicht vorgab

`[cmd]` **`Aufbau-Wochenplan` hat `plan_origin = NULL`** — nicht
`self_created`. **Die anderen vier sind belegt.**

`[read]` **`NULL` gilt als eigener Plan:** er ist auf dem Konto des
Nutzers entstanden, niemand hat ihn geliefert. **Deshalb bekommt er
die Nutzerslots** (fuenf Zeilen), **und `Lean bulk` nicht** (vier aus
den Vorlieben). `[read]` **Waere es andersherum, wuerde ein
gekaufter Plan mit fremden Mahlzeitennamen beschriftet** — das
waere E-59 verletzt.

## 3 · Die vier alten Plaene — was Codex nachziehen muss

`[cmd]` **Gemessen: alle vier haben 0 Slots**, und alle vier tragen
genau vier Kategorien in ihren Eintraegen:

    Aufbau-Wochenplan   NULL            84 Eintraege, 4 Kategorien
    Lean bulk 3100      marketplace     28 Eintraege, 4 Kategorien
    Cut 4-Meal 2200     coach_created   28 Eintraege, 4 Kategorien
    Buddy auto-plan     buddy           29 Eintraege, 4 Kategorien

`[read]` **Der Selbstplan braucht nichts** — der Rueckfall greift,
gemessen: fuenf Zeilen aus den Nutzerslots.

**MELDUNG AN CODEX — die drei gelieferten Plaene brauchen ihre
Struktur:**

    Lean bulk 3100      marketplace     meal_plan_slots fehlen
    Cut 4-Meal 2200     coach_created   meal_plan_slots fehlen
    Buddy auto-plan     buddy           meal_plan_slots fehlen

`[cmd]` **C-380 hat sie gefuellt, bevor `meal_plan_slots` existierte**
(C-396). `[read]` **Solange sie fehlen, zeigen sie vier Zeilen aus
den Vorlieben** — **richtig beschriftet** (*,,dieser Plan bringt
keine eigene Struktur mit"*), **aber es ist nicht ihre Struktur.**

`[read]` **Ich habe sie NICHT nachgetragen** — der Auftrag sagt,
nichts auf `dev` zu schreiben, und ein Seed gehoert in die Pipeline,
nicht in einen Browser-Auftrag.

## 4 · Ghost-Eintraege: gebaut, aber NICHT am Schirm belegt

**Tom:** *,,ghostentries bilden ab was im plan drin ist, also muss
der plan angepasst werden."*

`[cmd]` **Gebaut:** `ladeAktivPlanSlots()` laedt die Slots des aktiven
Plans, `page.tsx` reicht sie als `ghostSlots` durch, und
`mahlzeiten.tsx` gibt sie NUR den Ghost-Karten weiter — **die eigenen
Karten des Tages heissen weiter nach den eigenen Slots** (E-58).

`[cmd]` **Am Schirm nicht belegbar, und der Grund ist gemessen:**

    Ghost-Karten heute                    0
    Planeintraege heute                   4 (breakfast, lunch,
                                             dinner, snack)
    erfasste Mahlzeiten heute             4 (dieselben vier)
    Tage mit Planeintraegen UND ohne
      erfasste Mahlzeiten                 0

`[read]` **Jeder geplante Tag ist bereits erfasst** — ein Ghost
verschwindet, sobald die Mahlzeit gebucht ist. **Das ist richtiges
Verhalten, kein Defekt.**

`[cmd]` **Und der aktive Plan hat ohnehin null Slots** — selbst mit
sichtbaren Ghosts faellt er auf die Nutzerslots zurueck, also auf den
Stand von G-335.

`[read]` **Es waere ohne Schreiben auf `dev` nicht zu zeigen**, und
der Auftrag verbietet das. **Der Weg ist gebaut und im Test belegt;
am Schirm ist er `[annahme]`, bis ein gelieferter Plan Slots hat** —
also bis Codex Punkt 3 nachzieht. **Dann zeigt sich beides in
einem.**

## 5 · *Mahlzeit hinzufuegen* ist ein Modal

`[cmd]` **Gemessen, warum der Knopf verschwand:** er lag bei
**y = 2720**, und beim Klick war er weg (`knopf_noch_da: 0`) —
**das Formular stand an SEINER Stelle**, unterhalb des sichtbaren
Bereichs. `[read]` **Kein Fehler, sondern die Bauweise:** der Knopf
WAR das Formular.

`[cmd]` **Nachher gemessen, 1400x900:**

    Knopf nach dem Klick     noch da (1)
    Dialog                   1
    Titelleiste              1
    Hinweis sichtbar         ja, bei y=265 (Fenster 900)
    ziehbar                  dx 100, dy 60

### Dieselbe Machart — buchstaeblich

`[read]` **Der Auftrag sagt: *,,Es gibt schon eins … dieselbe
Machart, keine neue."*** `[cmd]` **Also nicht nachgebaut, sondern
die Huelle herausgezogen:** `zieh-modal.tsx` traegt Versatz,
Griffpunkt, `mousemove`/`mouseup`, Escape, Zuruecksetzen und die
Ausnahme fuer die Kopfknoepfe — **einmal.**

`[cmd]` **`FoodSuchModal` benutzt sie jetzt auch** — 40 Zeilen
Ziehlogik dort entfernt. `[cmd]` **Ein Waechter zaehlt: `griff.current`
steht in GENAU einer Datei.**

### Die Auswahl bietet Slots mit Zeit, plus Freitext

`[cmd]` **Vorher:** Fruehstueck, Mittagessen, Abendessen, Snack, Vor
dem Training, Nach dem Training, Sonstiges — **kein einziger Name
des Nutzers**, Vorgabe *Sonstiges*.

`[cmd]` **Nachher gemessen:**

    Frühstück (07:30)
    Snack (10:14)
    Mittagessen (12:30)
    Nachmittagssnack (16:00)
    Abendessen (19:30)
    ── ohne eigenen Slot ──
    Frühstück / Mittagessen / Abendessen / Snack /
    Vor dem Training / Nach dem Training / Sonstiges

`[cmd]` **Eine Slotwahl setzt Zeit und Text mit** — gemessen:
`slot:1` → Zeit `07:30`, Text *Frühstück*, Hinweis *,,Wird bei
Frühstück (07:30) einsortiert"*. **Beides bleibt danach frei**
(E-58).

### Ein Fehler in meinem eigenen Bau, gefunden durch Messen

`[cmd]` **Der erste Entwurf rief `kategorieAuswahl(slots, reihen)`**
— **und damit zeigten BEIDE Haelften dieselben fuenf Namen**, waehrend
*Vor dem Training* ganz fehlte (von einem Slotnamen verdeckt).

`[read]` **Nur am Schirm aufgefallen, nicht im Test** — die Funktion
tat genau das, was sie soll. **Behoben: `kategorieAuswahl()` ohne
Slots**, denn hier ist die Kategorie gemeint, nicht ihr Slotname.

### Der 22-Uhr-Fall

`[cmd]` **Gemessen: Zeit auf 22:00 gesetzt** → *,,Für diese Zeit gibt
es keinen Slot. Die Mahlzeit wird trotzdem erfasst und steht mit
ihrer Uhrzeit da."* — **und *Anlegen* bleibt aktiv.**

`[cmd]` **Der Waechter sichert die Ursache, nicht den Satz:**
`disabled={laeuft || !zeit}` — **haenge es am Vorschlag, waere 22:00
gesperrt.**

### Was der freie Text NICHT kann — und warum das Feld *Notiz* heisst

`[cmd]` **`nutrition.meals` hat keine Namensspalte** (gemessen
2026-09-02): `id, user_id, entry_date, meal_type, notes, created_at,
updated_at, meal_time, entry_source, source_detail`.

`[read]` **Der Auftrag sagt *,,Freitext daneben"*** — **gebaut ist
er, er geht nach `notes`.** `[read]` **Aber er heisst *Notiz*, nicht
*Name*:** eine Beschriftung *Name* haette ihr Feld nicht gehalten,
und der naechste Leser haette eine Namensspalte vermutet.

**MELDUNG: wenn eine freie Mahlzeit einen NAMEN tragen soll, fehlt
die Spalte** — `meals.name`, wie `meal_slots.name`. **Entscheidung
und Migration, nicht dieser Auftrag.**

---

## Waechter

`[cmd]` **Neu: `__tests__/raster-liest-planslots.test.ts`, 15
Waechter.** Sie rufen mit Werten, wo es geht:

    Dateiproben finden ihre Dateien (Wurzel aus import.meta.url)
    Plan-Slots schlagen alles (E-59) — fuenf Zeilen, mit Zeit
    ohne Plan-Slots die Nutzerslots — NUR bei eigenem Plan
    der Rueckfall sind die Vorlieben — Zeit ist null, nicht '—'
    die Kategorie folgt der Stellung — der fuenfte bekommt `other`
    Slots werden nach Position sortiert, nicht nach Lesefolge
    der Satz sagt, welche Quelle gilt — drei verschiedene Saetze
    plan-lesen liest meal_plan_slots, gefiltert auf DIESEN Plan
    der Ghost-Leseweg fragt status='active'
    das Raster zeigt den Namen, filtert ueber die Kategorie
    es gibt EINE Ziehlogik, nicht zwei
    der Knopf bleibt stehen — kein `if (!offen)` davor
    die Auswahl: Slots MIT Zeit, Kategorien getrennt
    der Einsortiersatz nennt beide Faelle
    der freie Text geht nach notes

`[cmd]` **Vier Waechter aus G-332/G-321 massen den alten Stand** und
wurden nachgezogen — **die Zusagen sind unveraendert, nur ihre
Fundstelle hat gewechselt:**

    meal-slots (G-332)     misst jetzt meal_plan_slots + rasterQuelle
                           statt planZeilen
    such-modal x3 (G-321)  messen die Ziehlogik in zieh-modal.tsx
                           statt in food-such-modal.tsx
    dazu neu               das Suchmodal benutzt die Huelle wirklich

`[read]` **Die letzte Zeile ist noetig:** ohne sie waeren die drei
Zieh-Waechter gruen, waehrend das Suchmodal wieder eine eigene Logik
haelt — **sie messen ja die Huelle.**

## Sabotageprobe: 18 Eingriffe, 18 Faelle

`[cmd]` **Je Zusage ein Eingriff, der nur sie verletzt.** Nach dem
Rueckbau war keiner rot.

    faellt   Plan-Slots werden ignoriert (E-59 faellt)
    faellt   ein gelieferter Plan nimmt die Nutzerslots
    faellt   die Slots werden nicht sortiert
    faellt   die Kategorie faellt weg
    faellt   der Satz nennt immer die Vorlieben
    faellt   plan-lesen fragt die Tabelle nicht mehr
    faellt   die Abfrage haengt nicht am Plan
    faellt   die Rangfolge wird nicht angewandt
    faellt   der Ghost-Leseweg nimmt irgendeinen Plan
    faellt   das Raster zeigt wieder die Kategorie
    faellt   die Eintraege werden nicht gefiltert
    faellt   der Knopf haengt wieder an !offen
    faellt   die Slots verlieren ihre Zeit in der Auswahl
    faellt   die Kategorien werden ueber die Slots aufgeloest
    faellt   der Freitext wird nicht geschrieben
    faellt   der 22-Uhr-Fall verschwindet
    faellt   Anlegen haengt am Vorschlag statt an der Zeit
    faellt   die Suche haelt wieder eine eigene Ziehlogik

### Die Probe hat einen echten Wortwaechter gefunden

`[cmd]` **Ein Eingriff kam durch:** *,,die Rangfolge wird nicht
angewandt"*. **Der Waechter prueft `rasterQuelle({`** — die Sabotage
ersetzte die Rueckgabe durch `rasterQuelle({ vorlieben })`, **der
Aufruf stand noch da, die Planslots gingen nicht mehr hinein, gruen.**

`[read]` **Genau der Fall, den CLAUDE.md viermal beschreibt** (G-216,
G-247, G-246, G-108). **Berichtigt: der Aufrufblock wird
herausgeschnitten und jedes der vier Felder einzeln geprueft**, dazu,
dass `rasterLage` die Rueckgabe speist. **Danach faellt er.**

### Und ein zweiter, den mein eigener Waechter gefunden hat

`[cmd]` **Der nachgezogene G-332-Waechter fiel** mit *,,der Rueckfall
auf die Vorlieben ist weg"* — **er war es nicht.** `[read]` **Ich
hatte den Aufruf auf zwei Zeilen umbrochen**, und das Muster stand
auf einer. **Berichtigt mit `\\s*` und einer zweiten Zusage auf
`vorliebenZeilen =`.**

---

## Bildschirmfotos

    backup/g336-vorher-planner.png        vier Zeilen, falscher Satz
    backup/g336-vorher-diary-zu.png       der Knopf bei y=2720
    backup/g336-vorher-diary-offen.png    Knopf weg, Formular unten
    backup/g336-nachher-planner.png       fuenf Zeilen, richtiger Satz
    backup/g336-nachher-modal.png         das Modal, Hinweis sichtbar
    backup/g336-nachher-22uhr.png         der 22-Uhr-Fall
    backup/g336-nachher-diary-offen.png   Knopf bleibt, Dialog offen
    backup/g336-ghost.png                 der Tag ohne offene Ghosts

## Laeufe

    pnpm --filter @lumeos/web test      1367 gruen, 0 rot  (+16)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.
**Nicht diese Arbeit.**

## Nichts auf `dev` geschrieben — nachgemessen

    test                 5 Slots   (unveraendert, Toms Probe steht)
    Aufbau/Lean/Cut/Buddy 0 Slots  (unveraendert)
    Nutzerslots          5         (unveraendert)
    Mahlzeiten heute     4         (unveraendert)

    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht neu gestartet

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

`[cmd]` 1.367 Tests, 18 von 18 Sabotagen, 15 neue Waechter.

### Die Tabelle hat jetzt Aufrufer

`[cmd]` **`meal_plan_slots` steht in `plan-lesen.ts`,
`slots-lage.ts`, `slots-lesen.ts`** — **vorher nur in Pipeline und
Test.**

`[read]` **Die vierte Funktion ohne Aufrufer ist damit
angeschlossen.**

`[cmd]` **`rasterQuelle` in `slots-lage.ts:383`**, gerufen an zwei
Stellen in `plan-lesen.ts` — **neben der Namensrangfolge aus G-335,
nicht als zweite Ordnung.**

### Und der Satz behauptet nicht mehr

`[read]` **Er sagte *,,4 Reihen aus deinen Vorlieben"*, auch wenn der
Plan eigene trug.** `[read]` **Jetzt folgt er der Quelle.**

`[read]` **Das war der eigentliche Fehler:** **eine Anzeige, die ihre
Herkunft falsch benennt, ist schlimmer als eine, die schweigt.**

### Das Modal auf gemeinsamer Huelle

`[cmd]` **Aus `FoodSuchModal` herausgezogen** — **keine zweite
Machart.**

`[read]` **Dieselbe Entscheidung wie bei der Suche in G-323:** **wer
eine zweite Huelle baut, hat zwei Ziehverhalten und zwei
Schliesswege.**

### Drei Sachen, die er gemeldet statt umgangen hat

`[cmd]` **1. Die drei gelieferten Plaene haben 0 Slots** —
nachgemessen: `Lean bulk`, `Cut 4-Meal`, `Buddy auto-plan`, und auch
`Aufbau-Wochenplan`. **Nur `test` traegt fuenf.**

`[read]` **Der Seed muss nachgezogen werden** — **C-380 fuellte die
Plaene, bevor `meal_plan_slots` existierte.** **Als C-397.**

`[cmd]` **2. Punkt 4 ist gebaut und im Test belegt, aber am Schirm
nicht zeigbar** — **auf `dev` ist jeder geplante Tag bereits erfasst,
und der aktive Plan hat selbst 0 Slots.**

`[read]` **Er hat es gesagt, statt einen Nachweis zu behaupten, den
das Konto nicht hergibt.** `[read]` **Genau der Fehler, den ich in
G-311 gemacht habe.**

`[cmd]` **3. `meals.name` fehlt** — **nachgemessen: nur `notes`.**

`[read]` **Deshalb heisst das Feld *Notiz*, nicht *Name*.**
`[read]` **Eine freie Mahlzeit kann heute keinen eigenen Namen
tragen** — **und das ist eine Entscheidung, keine Luecke.** **Als
G-338.**

**Abgenommen.**

