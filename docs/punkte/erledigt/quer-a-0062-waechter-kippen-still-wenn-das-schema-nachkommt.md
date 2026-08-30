---
nr: A-62
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-267
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 6d089067
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen: null
---

# A-62 — Waechter kippen still, wenn das Schema nachkommt

## Befund

Aus G-267, Claude Code, 2026-08-30.

`[cmd]` **Drei Faelle an einem Tag:**

    die Planumfang-Karte sagte "Lebenszyklus, Startdatum und
      Bestaetigungsmodus fehlen im Schema"
    ein Waechter aus G-272 verbot die Nutzung von `lifecycle`
    ein zweiter bestand, weil er den Text in einem Kommentar fand

`[read]` **Alle drei waren richtig, als sie geschrieben wurden.**
**Alle drei wurden falsch an dem Tag, an dem Codex das Schema
lieferte** — **und keiner hat es gemeldet.**

`[read]` **Ein Waechter, der einen Kommentar findet, prueft nichts.**
`[cmd]` **Das ist die vierte Erscheinungsform von *Wort statt
Wirkung*** — nach G-216, G-247, G-246 und G-108.

## Warum es eine eigene Klasse ist

`[read]` **Die anderen Faelle waren von Anfang an schwach.**
**Dieser war richtig und ist gekippt** — **weil sich die Welt
darunter geaendert hat.**

`[read]` **Ein Waechter, der eine Abwesenheit sichert, wird zur
Bremse, sobald die Sache da ist.** **Ein Kommentar, der eine Luecke
beschreibt, wird zur Falschaussage.**

## Zu messen

**Welche Waechter und welche Texte sichern eine Abwesenheit?**

`[read]` **Kandidaten: alles, was *fehlt*, *existiert nicht*, *ist
nicht angebunden* sagt.** `[cmd]` **C-175 war schon so einer** — der
Kommentar behauptete, `shopping_lists` gebe es nicht, und die Tabelle
stand da.

`[read]` **Und die Gegenfrage gehoert dazu:** kann ein Waechter
sagen, *,,ich sichere eine Abwesenheit, pruef mich, wenn sie
endet"*?

## Auftrag — die gekippten Waechter finden, bevor sie bremsen

**Mitbeauftragt: G-264, G-93.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · A-62 — der Befund, der dich viermal getroffen hat

`[cmd]` **Am 30.08. in vier Faellen:**

    G-272-Waechter    verbot die Nutzung von `lifecycle`
    G-270-Waechter    listete `GhostEintraegeEcht`, das du entfernt
                      hattest
    G-274-Waechter    invertierte, als der MealCam-Knopf fiel
    Planumfang-Karte  "Lebenszyklus fehlt im Schema" - vier Wochen
                      richtig, falsch am Tag der Lieferung

`[read]` **Alle vier waren richtig, als sie geschrieben wurden.**
**Du hast alle vier selbst gefunden und repariert** — **jedes Mal
erst, nachdem sie gekippt waren.**

### Zwei weitere aus C-177, 2026-08-30

`[cmd]` **Ein Waechter fand seinen Namen im eigenen Kommentar** —
**G-186 zum zweiten Mal.** `[cmd]` **Und eine Sabotage erreichte den
Code nie, weil `.replace(…, 1)` den Kommentar darueber traf.**

`[read]` **Beide Male hat die Sabotageprobe es gefangen, nicht der
Waechter.** `[read]` **Ein Anker, der im Kommentar landet, ist
dieselbe Klasse wie ein Waechter, der ein Wort statt einer Wirkung
prueft.**

**Miss, welche weiteren eine Abwesenheit sichern.**

`[read]` **Kandidaten sind Waechter und Texte, die *fehlt*,
*existiert nicht*, *ist nicht angebunden*, *hat keinen Aufrufer*
behaupten.** `[cmd]` **C-175 war schon so einer** — der Kommentar
sagte, `shopping_lists` gebe es nicht, **und die Tabelle stand da.**

`[read]` **Und die eigentliche Frage:** kann ein Waechter sagen,
*,,ich sichere eine Abwesenheit, pruef mich, wenn sie endet"*?
`[read]` **Wenn ja, ist das die Loesung. Wenn nein, ist eine Liste
das Beste, was geht** — und die gehoert dann irgendwohin, wo sie
gelesen wird.

### 2 · G-264 — Micronutrient trend

`[cmd]` **Die Attrappe steht weiter im Insights-Reiter.**

`[read]` **In G-11 wurde entschieden, sie nicht anzubinden** — der
Nutrients-Reiter zeigt denselben Verlauf je Naehrstoff. **Das war
richtig.**

`[read]` **Aber nicht angebunden ist nicht entfernt.** `[cmd]`
**G-254 fuehrte sie als *gestrichen, nicht offen* — und das war
falsch.**

`[read]` **A-59: was keinen Aufrufer hat, wird beim naechsten Auftrag
fuer gebaut gehalten. Bei einer sichtbaren Attrappe gilt das
doppelt** — sie sieht aus wie eine Zusage.

### 3 · G-93 — der Anzeigename im Erfassungsdialog

`[read]` **Klein und klar.** `[cmd]` **Miss zuerst, ob es den Befund
noch gibt** — der Dialog ist seit G-272 neu.

### Was nicht zu tun ist

**Keine Waechter loeschen, ohne zu sagen was sie sicherten.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Waechter mit Abwesenheit   Zahl, je einzeln benannt
    davon schon gekippt        welche behaupten Falsches
    Selbstmeldung moeglich?    gebaut oder begruendet nicht
    G-264                      entfernt, Attrappen am Schirm
    G-93                       noch da? gebaut oder ueberholt

`[read]` **Die dritte Zeile ist die wertvolle:** **ein Waechter, der
sein eigenes Ablaufdatum kennt, waere mehr wert als zwanzig
gepruefte.**

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt: G-264, G-93. Nichts auf
`dev@lumeos.app` geschrieben, nichts committet, nichts gestaged.
`supabase/` nicht angefasst (Codex arbeitet dort an C-354).

### 1 · A-62 — die Antwort auf die eigentliche Frage lautet ja

**Der Auftrag:** *,,kann ein Waechter sagen ‚ich sichere eine
Abwesenheit, pruef mich, wenn sie endet'? Ein Waechter, der sein
eigenes Ablaufdatum kennt, waere mehr wert als zwanzig gepruefte."*

**Gebaut: `tools/abwesenheit-pruefen.mjs`, im Gate.**

Eine Aussage traegt eine Marke mit ihrer Bedingung:

    // @abwesend public.user_inventory
    // Es gibt keine user_inventory-Tabelle; der Bestand steht in
    // stack_items.stock_remaining.

**Sobald `supabase/_pipeline/` ein `CREATE TABLE` dafuer fuehrt, faellt
der Gate** und nennt Datei und Zeile. Vier Markenformen:

    @abwesend <schema>.<tabelle>          eine Tabelle
    @abwesend <schema>.*                  ein ganzes Schema
    @abwesend-spalte <tabelle>.<spalte>   eine Spalte
    @abwesend-api <schema>                nicht ueber PostgREST

`[read]` **Gegen die Pipeline, nicht gegen die laufende Datenbank** —
der Gate laeuft ohne Zugangsdaten, und die Pipeline steht **vor** der
Datenbank. Eine Aussage, die kippt, kippt dort zuerst.

**Wirkungsprobe, jede Form einzeln, Rueckbau byte-gleich:**

    faellt   Marke auf supplements.stack_items   (Tabelle, existiert)
    faellt   Marke auf coach.*                   (Schema, existiert)
    faellt   Marke auf profiles.locale           (Spalte, existiert)
    faellt   Marke auf @abwesend-api coach       (in config.toml)
    haelt    Marke auf nutrition.gibt_es_nicht   (Gegenprobe)

`[read]` **Die Gegenprobe ist der Teil, der zaehlt** — ohne sie waere
nicht belegt, dass er nicht einfach immer faellt.

### Wie gesucht wurde — und warum die erste Zahl nichts wert war

`[cmd]` **Erster Lauf: 300 Zusicherungen** (`doesNotMatch`, `== 0`,
`ok(!x)`) in 156 Testdateien und 15 Waechtern. **Unbrauchbar.**

`[read]` **Der Grund ist der Unterschied, auf den es ankommt:**

    sichert eine CODE-Eigenschaft   kippt nie von selbst
      "kein .insert() in einer Lesedatei"
      "keine rgba() in globals.css"
    sichert eine WELT-Abwesenheit   kippt, wenn geliefert wird
      "die Spalte lifecycle gibt es nicht"
      "das coach-Schema fehlt"

**Nur die zweite Gruppe ist A-62.** `[cmd]` **Zweiter Lauf, auf
Aussagen ueber benennbare Gegenstaende: 656** — davon **434 in
`docs/ssot/` und `docs/punkte/erledigt/`.**

`[read]` **Die 434 sind kein Befund.** Protokoll traegt Datum und
`[cmd]`-Marke und **soll** altern — das ist seine Aufgabe. **A-62 ist,
was als Gegenwart gelesen wird:** laufender Code, aktive Waechter,
Text am Schirm. **222 Aussagen.**

### Waechter und Texte mit Abwesenheit — je einzeln

`[cmd]` **Gegen die laufende Datenbank geprueft, 2026-08-30:**

    coach        12 Tabellen      Code sagte: gibt es nicht
    medical      22 Tabellen      Code sagte: gibt es nicht
    recovery      3 Tabellen
    alle sieben Schemata stehen in config.toml unter `schemas`

**Gekippt und berichtigt — neun Stellen:**

    apps/web/src/app/v2/coach/ansicht.tsx:42
    apps/web/src/app/v2/coach/modale.tsx:53
    apps/web/src/app/v2/coach/tab-autonomie.tsx:44
    apps/web/src/app/v2/coach/tab-onboarding.tsx:48
    apps/web/src/app/v2/coach/tab-rechte.tsx:41
        „Ein `coach`-Schema gibt es nicht"
        -> 13 CREATE TABLE in 15_coach/, 12 Tabellen live

    apps/web/src/app/v2/coach/tab-rechte.tsx:66-68
        „sechs Tabellen" + „coach ist nicht fuer PostgREST
        freigegeben" -> zwoelf, und es IST freigegeben.
        `[cmd]` rechte-read.ts:234 liest ueber client.schema('coach')
        aus zehn Tabellen; live 5 Zeilen client_permissions,
        6 relationships, 8 permission_change_log.
        `[read]` DIESE war tragend - sie begruendet, warum ein
        Leerzustand statt Daten steht.

    apps/web/src/app/v2/medical/daten.ts:25
        „Ein `medical`-Schema gibt es nicht" -> 22 Tabellen

    apps/web/src/components/shell/__tests__/
      v2-attrappen.test.ts:1758
        „weder buddy noch coach kommt in supabase/_pipeline/ in
        einem CREATE TABLE vor" -> fuer coach falsch (13 Stueck).
        `[read]` Der Waechter selbst blieb gruen - er zaehlt Karten
        gegen Marken. NUR SEINE BEGRUENDUNG war gekippt.

    apps/web/src/components/shell/__tests__/
      v2-attrappen.test.ts:1203
        „meal_plans hat keine Lifecycle-Spalten" -> fuehrt heute
        lifecycle_type, start_date, days_count, status,
        plan_origin, next_plan_id, rollover_count.
        `[read]` Halb gekippt: „meal_plan_entries keine
        Statusspalte" gilt weiter (der Zustand liegt in
        meal_plan_logs, G-274). Die Zahl 8 bleibt richtig -
        Spalten da heisst nicht gelesen.

    apps/web/src/components/shell/sprachwahl.tsx:14
        „public.profiles braucht eine locale-Spalte; das ist
        Schemaarbeit und gehoert Codex" -> die Spalte GIBT es.
        `[read]` Nebenbefund aus C-177 von gestern. Der Befund
        bleibt, sein Grund kehrt sich um: nicht das Schema fehlt,
        sondern diese Datei schreibt die Spalte nicht.

**Noch gueltig und jetzt markiert — drei:**

    public.user_inventory     gemessen FEHLT   route.ts:114
    coach.coach_profiles      gemessen FEHLT   uebersicht-echt.tsx:17
    coach.buddy_memory        kein buddy-Schema; keine der 12
                              coach-Tabellen traegt Buddy-Material
                              (kein Treffer buddy/ai/memory/persona)
                                               ai/page.tsx:25

`[read]` **Der dritte ist der wertvollste** — er sichert *,,DIESE
SEITE LIEST NICHTS"*. **Ohne Marke wuerde daraus still eine
Falschaussage, sobald Buddy kommt.**

### Was NICHT geloescht wurde

`[read]` **Der Auftrag: keine Waechter loeschen, ohne zu sagen, was sie
sicherten.** **Kein einziger Waechter ist geloescht.** Neun
Begruendungen sind berichtigt, **jede mit dem alten Wortlaut als Zitat
und dem Datum, an dem sie kippte.**

### Die ehrliche Grenze

`[read]` **Die Marke faengt, was jemand markiert.** Die neun gekippten
Stellen fand ich durch Suchen, nicht durch den Waechter — **er haette
sie gefunden, wenn sie markiert gewesen waeren.** Fuer die 222
laufenden Aussagen ist er **nicht** flaechendeckend gesetzt; das waere
ein eigener Auftrag. **Was er kann: verhindern, dass die naechste
still kippt.**

### 2 · G-264 — Micronutrient trend entfernt

`[cmd]` **Attrappen am Schirm, `/v2/nutrition?tab=insights`,
`dev@lumeos.app`, 2026-08-30:**

    vorher    1 Attrappen-Pille
              Karten: Calorie balance, Macro split · 14d avg,
                      Micronutrient trend
    nachher   0 Attrappen-Pillen
              Karten: Calorie balance, Macro split · 14d avg

`backup/g264-vorher.png`, `backup/g264-nachher.png`.

`[read]` **Die eine Pille am Schirm WAR diese Kachel** — die anderen
zwei tragen echte Zahlen aus `daily_summary`.

**Entfernt: die Kachel, `NutrientHeatmap`, `wert()`, `NAEHRSTOFFE`,
`TAGE`** — 195 auf 122 Zeilen. `[cmd]` **A-59 eingehalten:** nach dem
Wegfall der Kachel hatte `NutrientHeatmap` null Aufrufer, `wert`/
`NAEHRSTOFFE`/`TAGE` nur noch Vorkommen in ihr.

**Was sie sicherte, steht am Ort im Code:** eine Heatmap aus 8
Naehrstoffen x 30 Tagen, Werte aus einer Sinusformel — der Ersatz fuer
das `Math.random()` der Vorlage. **In G-11 entschieden, sie nicht
anzubinden:** der Nutrients-Reiter zeigt denselben Verlauf je
Naehrstoff aus `daily_nutrient_summary_long`.

`[cmd]` **Zwei Folgestellen mitgezogen**, die sonst zu Falschaussagen
geworden waeren: der Dateikopf (*,,Drei Kacheln"*, plus die
`Math.random()`-Begruendung fuer nicht mehr vorhandenen Code) und die
`ohneEchte`-Doku (*,,alle drei Kacheln"*).

### 3 · G-93 — den Befund gibt es noch

`[cmd]` **Zuerst gemessen, wie beauftragt: er besteht unveraendert.**
G-272 hat den Dialog **nicht** angefasst.

    mahlzeiten.tsx   ausgeliefert ueber ansicht.tsx:49
    erfassen.tsx     hat den Rueckfall - wird nicht ausgeliefert

`[cmd]` **Die drei Stellen aus dem Befund, unveraendert an Zeile 750,
766, 535.** `[cmd]` **5.014 von 7.140** Eintraegen tragen einen
abweichenden `name_display_de` — die Zahl aus dem Punkt stimmt.

**Zwei Stellen geaendert, eine bewusst nicht:**

    750  Trefferliste    -> name_display_de || name_de
    766  Auswahlkopf     -> name_display_de || name_de
    535  Suchfeld        bleibt name_de

`[read]` **Die dritte ist der Punkt.** Der Wert geht zurueck ins
**Suchfeld**, ist also ein Suchbegriff, keine Anzeige. `[cmd]`
**`name_display_de` als Suchbegriff liefert 0 Treffer** (G-265, belegt
in `add-und-plaene.test.ts:38`). **Ein Waechter, der ueberall den
Anzeigenamen verlangt, haette die Suche kaputtgemacht** — deshalb
sichert ein eigener Test, dass hier der Rohname bleibt.

`[cmd]` **Ein Nebenbefund:** der Punkt sagt, der Rueckfall sei noetig,
*,,weil nicht jeder Eintrag einen Anzeigenamen hat"*. **Gemessen heute:
0 von 7.140 ohne.** Der Rueckfall bleibt als Absicherung richtig,
**seine Begruendung ist gekippt** — A-62 im Punkttext selbst.

### Waechter, Sabotageprobe, Laeufe

**Neu:** `apps/web/src/lib/nutrition/__tests__/anzeigename-und-abwesenheit.test.ts`
(5 Waechter) und `tools/abwesenheit-pruefen.mjs` (Gate).

**Fuenf Sabotagen ueber die Testkette, jede einzeln, Rueckbau
byte-gleich (SHA-256):**

    faellt   G-93: Trefferliste zurueck auf den Rohnamen
    faellt   G-93: Auswahlkopf zurueck auf den Rohnamen
    faellt   G-93: Suchfeld auf den Anzeigenamen (bricht die Suche)
    faellt   G-264: die Attrappenkachel wieder einsetzen
    faellt   A-62: den Waechter aus der Gate-Kette nehmen

`[cmd]` **Zwei eigene Fehler, beide von der Probe gefangen:**

**a) Ein Test, der gruen geworden waere, ohne etwas zu pruefen.** Die
erste Fassung der A-62-Wirkungsprobe legte eine **neue** Datei mit
einer Marke an. **Der Waechter liest ueber `git ls-files` und sieht
Ungetracktes nicht** — er blieb gruen, und der Test haette das fuer
Erfolg gehalten. `[read]` **Dieselbe Klasse wie die Sabotage aus C-177,
die den Code nie erreichte.** Behoben: eine getrackte Datei bekommt die
Marke kurz, mit belegtem Rueckbau.

**b) Ein Waechter, der im zu grossen Heuhaufen suchte.** Die
G-93-Pruefung nahm `exec` auf `v2-insight-title` — **die Klasse kommt
zweimal vor**, und der erste Treffer ist eine Fehlermeldung
(`t('tagebuchNichtLesbar')`, Zeile 204). Behoben: `matchAll`, und
**eines** der Vorkommen muss den Namen zeigen.

**Und ein bestehender Waechter hat gearbeitet:** die Attrappenzahl fuer
`tab-insights.tsx` fiel von 3 auf 2 und meldete das von selbst — genau
das Verhalten, das A-62 fuer Begruendungen herstellen soll.

    pnpm --filter @lumeos/web test    1031 pass, 0 fail (vorher 1027)
    pnpm gate                          11/11 Tasks gruen
    [abwesenheit]                      3 Marken, alle gelten noch
    [encoding]                         20.525 Dateien sauber

`[cmd]` **Der Gate war einmal rot, durch mich:** die Analyseskripte
schrieben `_a62-*.json` in die Repo-Wurzel, und `encoding-pruefen.mjs`
fand darin 5 Doppelkodierungen. **Die Dateien gehoerten in den
Scratchpad** — entfernt, danach gruen.

### Dateien

    tools/abwesenheit-pruefen.mjs                          neu
    apps/web/src/lib/nutrition/__tests__/
      anzeigename-und-abwesenheit.test.ts                  neu
    package.json                                  Gate-Kette
    apps/web/src/app/v2/nutrition/tab-insights.tsx   G-264
    apps/web/src/app/v2/nutrition/mahlzeiten.tsx      G-93
    apps/web/src/components/shell/__tests__/
      v2-attrappen.test.ts                    A-62 + Zahl 3->2
    apps/web/src/app/api/supplements/intake/route.ts  Marke
    apps/web/src/app/v2/coach/uebersicht-echt.tsx     Marke
    apps/web/src/app/v2/coach/ai/page.tsx        Marke + A-62
    apps/web/src/app/v2/coach/ansicht.tsx             A-62
    apps/web/src/app/v2/coach/modale.tsx              A-62
    apps/web/src/app/v2/coach/tab-autonomie.tsx       A-62
    apps/web/src/app/v2/coach/tab-onboarding.tsx      A-62
    apps/web/src/app/v2/coach/tab-rechte.tsx          A-62
    apps/web/src/app/v2/medical/daten.ts              A-62
    apps/web/src/components/shell/sprachwahl.tsx      A-62
    backup/g264-vorher.png, backup/g264-nachher.png Nachweis

## Abnahme

**2026-08-30, Orchestrator.**

### Die Antwort auf die eigentliche Frage lautet ja

**Der Auftrag fragte:** *,,kann ein Waechter sagen — ich sichere eine
Abwesenheit, pruef mich, wenn sie endet?"*

`[cmd]` **`tools/abwesenheit-pruefen.mjs`, im Gate.** Eine Aussage
traegt eine Marke mit ihrer Bedingung:

    // @abwesend public.user_inventory

**Vier Formen:** Tabelle, ganzes Schema, Spalte, PostgREST-Freigabe.

`[read]` **Und die Bauentscheidung dahinter ist die kluge:** `[cmd]`
**geprueft wird gegen `supabase/_pipeline/` und `config.toml`, nicht
gegen die laufende Datenbank** — **der Gate laeuft ohne Zugangsdaten,
und eine Aussage kippt in der Kette zuerst.**

`[cmd]` **Jede Form einzeln durch Wirkung belegt, Rueckbau
bytegleich** — **und die Gegenprobe auf etwas tatsaechlich
Abwesendes haelt.** `[read]` **Ohne sie waere nicht belegt, dass er
nicht einfach immer faellt.**

### Neun Aussagen waren bereits gekippt

`[cmd]` **Das `coach`-Schema (12 Tabellen) und `medical` (22) werden
in sieben Dateien als nicht existent bezeichnet** — **alle sieben
Schemata stehen in `config.toml`.**

`[cmd]` **Die tragende Stelle ist `tab-rechte.tsx:66`:** *,,sechs
Tabellen, nicht fuer PostgREST freigegeben"* **ist die genannte
Begruendung dafuer, dass ein Leerzustand statt Daten erscheint** —
**waehrend `rechte-read.ts:234` zehn `coach`-Tabellen liest, in denen
Zeilen stehen.**

`[read]` **Ein Reiter zeigt leer und nennt einen Grund, den es nicht
gibt.** **Als G-277 angelegt.**

`[cmd]` **Auch gekippt:** die Begruendung des Attrappen-Waechters
selbst — **seine Zaehlung blieb gruen, nur der Grund war verrottet.**

`[read]` **Drei Aussagen sind weiter wahr und jetzt markiert**,
darunter *,,DIESE SEITE LIEST NICHTS"* fuer den AI-Coach. `[read]`
**Die wertvollste, weil sie an dem Tag stillschweigend falsch wuerde,
an dem Buddy kommt.**

### Die Unterscheidung, die die Suche brauchbar machte

`[cmd]` **Erster Lauf: 300 Zusicherungen. Unbrauchbar.**

`[read]` **Der Grund:**

    Code-Eigenschaft    kippt nie von selbst
                        "kein .insert() in einer Lesedatei"
    Welt-Abwesenheit    kippt bei Lieferung
                        "die Spalte gibt es nicht"

`[cmd]` **Zweiter Lauf: 656 — davon 434 in `docs/ssot/` und
`docs/punkte/erledigt/`.**

`[read]` **Und die Einordnung ist richtig:** Protokoll traegt Datum
und `[cmd]`-Marke und **soll** altern. **A-62 betrifft, was als
Gegenwart gelesen wird: 222 Aussagen.**

### Die ehrliche Grenze

`[read]` Er selbst: *,,die Marke faengt nur, was jemand markiert. Ich
habe die neun durch Suchen gefunden, nicht durch den Waechter."*

`[read]` **Das ist die richtige Beschreibung** — der Waechter
verhindert das naechste stille Kippen, **er ist keine flaechendeckende
Pruefung.** **Als G-278 angelegt.**

### G-264 und G-93

`[cmd]` **G-264: Attrappenpillen im Insights-Reiter 1 auf 0.** Die
Karte und der aufruferlose `NutrientHeatmap` sind weg, 195 auf 122
Zeilen, **samt zwei Folgekommentaren, die falsch geworden waeren.**

`[cmd]` **G-93: der Befund besteht** — G-272 hat den Dialog nie
angefasst. **Zwei von drei Stellen behoben.**

`[read]` **Und die dritte bewusst nicht:** `[cmd]` **Zeile 535 speist
das Suchfeld, und `name_display_de` als Suchbegriff liefert 0
Treffer** (G-265). **Ein Waechter, der den Anzeigenamen ueberall
verlangt haette, haette die Suche gebrochen.**

`[cmd]` **Und die Praemisse des Punktes kippte auch: 0 von 7.140
haben keinen Anzeigenamen mehr.**

### Zwei eigene Fehler, von der Sabotageprobe gefangen

`[read]` **Ein Test haette bestanden, ohne etwas zu pruefen** — der
Waechter liest `git ls-files` und sieht ungetrackte Dateien nicht.
`[read]` **Und ein Waechter suchte in zu grossem Heuhaufen.**

`[cmd]` **Der Gate war einmal rot durch ihn** — Analyseskripte
schrieben `_a62-*.json` in den Repo-Wurzelordner. **Entfernt und
gemeldet.**

`[cmd]` 1031 Tests, Gate 11/11, Encoding ueber 20.525 Dateien.

**Abgenommen.**

