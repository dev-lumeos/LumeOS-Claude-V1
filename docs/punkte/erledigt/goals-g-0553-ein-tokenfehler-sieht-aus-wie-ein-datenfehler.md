---
nr: G-553
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: claudecode
beauftragt: 2026-09-29

braucht: []
kind_von: null
entscheidung: E-68

quellen:
  - docs/punkte/00-INDEX.md

erledigt: 2026-09-30
commit: 20992639
beruehrt:
  tabellen:
    - goals.body_measurements
  dateien:
    - apps/web/src/lib/goals/lesen.ts
    - apps/web/src/app/v2/goals/ansicht.tsx
    - supabase/_pipeline/11_goals/112_body_measurements.sql

zahlen:
  gemessen: 2026-09-29
  fehlertext_sichtbar: 1
  mockup_sichtbar: 0
---

# Ein Tokenfehler sieht aus wie ein Datenfehler — und das Mockup fehlt

**Tom, 2026-09-29, 16:56, auf dem Phase-Reiter:**

    Goals konnten nicht geladen werden
    body_composition_navy: JWT issued at future

`[read]` **Zwei getrennte Fehler in zwei Zeilen**, und keiner davon ist ein
Datenfehler.

## A1 — die Fehlermeldung nennt die falsche Ursache

`[cmd]` `goals.body_composition_navy` existiert seit Kettenschritt 112
(`112_body_measurements.sql:216`) und wird in
`apps/web/src/lib/goals/lesen.ts:86` aufgerufen. **Die Funktion ist nicht
kaputt.** `JWT issued at future` kommt aus der Tokenpruefung: das
Ausstellungsdatum des Tokens liegt hinter der Serveruhr.

`[annahme]` **Die naheliegende Ursache ist ein Uhrensprung der Docker-VM**
nach einem Ruhezustand von Windows — ein Token, der davor ausgestellt wurde,
traegt danach ein `iat` in der Zukunft. `[cmd]` **Nicht belegt:** ein
Vergleich der Containeruhren (db 09:57:19, auth 09:57:20, kong 09:57:24) ist
untauglich, weil sequenziell gemessen — der Messabstand ist so gross wie die
gesuchte Abweichung. **Wer das belegen will, misst gleichzeitig.**

**Was hier zu bauen ist, haengt nicht an der Ursache:**

`[read]` **Ein Sitzungsfehler darf nicht als Datenfehler erscheinen.** *„Goals
konnten nicht geladen werden"* schickt den Nutzer auf die falsche Suche —
er prueft seine Ziele, und das Problem ist die Anmeldung.

    Tokenfehler (JWT, expired, issued at future, invalid claim)
      -> "Die Sitzung ist nicht mehr gueltig. Neu anmelden."
         mit dem Weg zur Anmeldung, nicht nur dem Satz.

    alles andere
      -> die heutige Meldung, mit dem technischen Text darunter

`[cmd]` **Und der technische Text bleibt sichtbar** — er hat den Befund
moeglich gemacht. Ein Fehler ohne Text waere schlechter als der falsche.

## A2 — die Seite zeigt kein Mockup mehr

**Tom:** *„lass da zumindest das mockup wieder einblenden, wir haben keine
seite ohne mockup."*

`[read]` **Die Regel gilt seit E-68/G-365:** unter dem Trennstrich steht die
Mockup-Referenz, damit jede Seite zeigt, wohin sie gebaut wird. G-541 hat die
Variantenkachel **aufgeloest statt befuellt** (richtig, die drei Cuts sind
drei Katalogzeilen) — und dabei ist die Referenz verschwunden.

**Zu pruefen und wiederherzustellen:**

1. Zeigt der Phase-Reiter den Mockup-Teil unter dem Trennstrich? Wenn nicht,
   wieder einblenden.
2. **Und er muss auch dann stehen, wenn der echte Teil oben faellt.** Das ist
   der Fall, den Tom gesehen hat: ein Fehler beim Laden hat die ganze Seite
   leer gemacht, Mockup inbegriffen. **Der Mockup-Teil braucht keine Daten
   und darf nicht am Datenfehler haengen.**
3. Ein Waechter, der zaehlt, dass der Trennstrich und der Mockup-Teil je
   Goals-Reiter vorhanden sind. **Mit Gegenprobe:** entfernt man ihn, wird
   der Waechter rot.

`[read]` **Punkt 2 ist der eigentliche Befund.** Eine Seite, die bei einem
Ladefehler nichts mehr zeigt, verliert auch das, was ohne Daten funktioniert.

## Zu belegen

- Bild mit gueltiger Sitzung, Bild mit ungueltigem Token — im zweiten steht
  der Sitzungshinweis **und** das Mockup
- der Tokenfehler laesst sich ohne Uhrenmanipulation erzeugen: ein
  abgelaufener oder verfaelschter Token reicht
- vier andere Module zeichengleich
- Sabotageprobe je Waechter in beide Richtungen
- `pnpm gate` gruen, nichts committen

**Reihenfolge: vor G-544.** Tom sieht heute einen Fehler statt einer Seite —
das geht vor der Zeitachse.

---

## Auftrag — in dieser Ordnung

**A2 zuerst, A1 danach.** Das Mockup ist der sichtbare Mangel und braucht
keine Fehlerbehandlung; die Fehlerunterscheidung braucht einen Weg, den
Tokenfehler herzustellen.

    A2  Mockup-Teil wieder einblenden, und zwar UNABHAENGIG vom
        Ladezustand der echten Daten. Waechter mit Gegenprobe.

    A1  Tokenfehler von Datenfehler trennen. Der technische Text
        bleibt sichtbar - er hat diesen Befund moeglich gemacht.

**Was nicht dazugehoert:** die Ursache des Uhrensprungs. Das ist Umgebung,
nicht Bau — und `goals.body_composition_navy` ist nachweislich in Ordnung
(Kettenschritt 112, live).

`[read]` **Und nicht mitbauen:** die Zeitachse (G-544) liegt vorbereitet und
wartet auf diesen Punkt. Tom sieht heute einen Fehler statt einer Seite —
das geht zuerst.

---

## Bericht Claude Code, 2026-09-29

### Was gebaut wurde

    apps/web/src/lib/fehler/ladefehler.ts            fehlerart · fehlertexte
    apps/web/src/app/v2/goals/ansicht.tsx           Umbau + LadefehlerKachel
    apps/web/src/app/v2/goals/__tests__/g553-mockup-und-ladefehler.test.ts

### A2 — der Befund lag woanders, als der Punkt vermutete

`[cmd]` **Der Phase-Reiter hatte seinen Trennstrich und sein Mockup die
ganze Zeit** (`ReferenzTrenner` + `GoalsPhaseView`, Zeile 396/397).
**G-541 hat sie nicht entfernt.**

`[cmd]` **Die Ursache ist Punkt 2 des Auftrags, und nur der:** in
`ansicht.tsx` stand ein Ternaer ueber SIEBEN Reitern —

    ladefehler && [...7 Reiter].includes(tab)
      ? <Card>Goals konnten nicht geladen werden</Card>
      : <>...der GESAMTE Inhalt aller Reiter...</>

`[read]` **Der `else`-Zweig trug alles** — Trennstrich und Mockup
inbegriffen. **Ein Ladefehler loeschte damit auch das, was ohne Daten
funktioniert.**

`[cmd]` **`cross`, `timeline` und `poses` standen AUSSERHALB** und haben
ihren Entwurf behalten. **Genau die drei waren nie betroffen** — das ist
die Gegenprobe zur Ursache.

**Umgebaut:** die Fehlerkachel steht jetzt neben dem Reiterinhalt, nicht
statt seiner. Ein Schalter `echtAus` sperrt **nur die datentragenden
Bauteile** (`ZielKarten`, `GoalsTDEEView`, `KoerperMetriken`,
`KoerperUmfaenge`, `CompositionTab`, `StrategieWahl`, `PhaseEcht`,
`PhysiqueEcht`). **Kein Mockup-Bauteil haengt daran** — und ein Waechter
prueft beide Richtungen.

`[read]` **Dieselbe Klasse wie G-359/G-365:** dort verdraengte der ECHTE
Teil den Entwurf, hier der FEHLER. **Beide Male stand der Quelltext da
und war nicht erreichbar.**

### A1 — der Code reicht zur Unterscheidung nicht

`[cmd]` **Der beobachtete Fehler kam als `READ_FAILED`, nicht als
`NO_SESSION`:** PostgREST meldet den Tokenfehler als Antwort auf die
Abfrage, und `lesen.ts` verpackt jede Antwort mit `error` gleich.
**Die Unterscheidung muss deshalb den TEXT lesen.**

    Tokenfehler (jwt · token is expired · pgrst301 · invalid claim
                 · bad_jwt · session not found · refresh_token)
      -> "Sitzung abgelaufen"
         "Die Sitzung ist nicht mehr gueltig. Melde dich neu an --
          deine Daten sind unveraendert."
         + Knopf "Zur Anmeldung" -> /login

    alles andere
      -> "Goals · Die Daten konnten nicht geladen werden."
         ohne Anmeldeknopf -- dort aendert eine Neuanmeldung nichts

`[cmd]` **Der technische Text steht in beiden Faellen darunter** — er hat
diesen Befund moeglich gemacht.

`[read]` **Im Zweifel Datenfehler.** Ein faelschlich als Sitzungsfehler
gemeldeter Datenfehler schickt den Nutzer zur Anmeldung, die nichts
aendert.

### Der Tokenfehler ohne Uhrenmanipulation — und was dabei auffiel

`[cmd]` **Der erste Weg schlug fehl, und das ist ein Befund:** ein
verfaelschter Auth-Cookie erreicht die Goals-Seite **gar nicht**. Die
Middleware ruft `getUser()` (`middleware.ts:62`) und leitet nach
`/login?redirect=…` um — gemessen, die Seite war die Anmeldung.

`[read]` **Toms Fall war anders:** der Token kam durch die Middleware und
wurde erst von PostgREST abgewiesen. **Ein kaputter Cookie bildet das
nicht ab** — er ist zu kaputt.

`[cmd]` **Stattdessen der Fehlerweg selbst ausgeloest**, mit einem
Dateischalter in `lesen.ts`, der **Toms Text wortwoertlich** wirft.
**Danach entfernt, `md5` gegen das Original geprueft:**
`393ee191c076365464cdf25c4645c0c3` — byte-gleich.

### Gemessen am Schirm, test-user@lumeos.local

    Zustand              Fehlerart  Text  Knopf  Trennstrich  Attrappen
    ----------------------------------------------------------------
    gueltige Sitzung     --          --     0         1          12
    JWT issued at future sitzung     da     1         1          12
    Datenfehler          daten       da     0         1           7

`[read]` **Die mittlere Zeile ist der Auftrag:** der Sitzungshinweis
steht **und** das Mockup. **Vorher waren dort ueberall Nullen.**

`[read]` **Die dritte Zeile ist die Gegenprobe:** ein echter Datenfehler
bleibt Datenfehler, ohne Anmeldeknopf — und das Mockup steht auch dort.

### Nachweise

    14 Sabotagen, je in beide Richtungen -- alle ROT
       (eine war zuerst GRUEN, siehe unten), Wiederherstellung
       byte-gleich (md5 geprueft)
    3 Bilder:
       x-g553-1-gut.png          gueltige Sitzung
       x-g553-2-token.png        Sitzungshinweis + Mockup
       x-g553-3-datenfehler.png  Datenfehler + Mockup
    pnpm gate GRUEN -- 18/18 Tasks, 2208 Tests, 0 Fehler
    Nichts committet.

### Ein Waechter, der zuerst nicht gemessen hat

`[cmd]` **Sabotage „Anmeldeknopf ohne Text" blieb GRUEN.** Der Waechter
prueft Marke und `href` — **nicht, ob der Knopf beschriftet ist.** Ein
leerer Kasten ist kein Weg. **Nachgebessert**, jetzt rot.

### Was NICHT dazugehoerte und nicht angefasst wurde

`[read]` **Die Ursache des Uhrensprungs** — Umgebung, nicht Bau. **Die
Zeitachse (G-544)** — liegt weiter unberuehrt.

### Aufgefallen, ausserhalb dieses Auftrags

`[cmd]` **Dieselbe Kopplung gibt es in zwei anderen Modulen**, gemessen:

    apps/web/src/app/v2/medical/tab-biomarker.tsx:56
      `if (echt.ladefehler) return <Card>…</Card>`  -- und
      `MedImportReferenz` steht in Zeile 399, also DAHINTER
    apps/web/src/app/v2/nutrition/tab-vorlieben.tsx:447
      dasselbe Muster

`[read]` **Nicht angefasst** — der Auftrag nennt `apps/web/src/app/v2/goals/`.
**Gemeldet, weil es derselbe Fehler ist und Tom ihn dort genauso sehen
wird.**

---

## Abnahme, Orchestrator, 2026-09-30 08:55

**Angenommen — und der Punkt selbst war in einer Vermutung falsch.**

### Was widerlegt wurde, und wie

`[read]` **A2 dieses Punktes nannte zwei moegliche Ursachen.** Die erste war
*„G-541 hat die Referenz entfernt"*. **Sie ist widerlegt**, und zwar nicht
durch eine Behauptung, sondern durch eine Gegenprobe im Code: `cross`,
`timeline` und `poses` lagen **ausserhalb** des Ternaers und haben ihren
Entwurf behalten — **genau die drei waren nie betroffen.**

`[cmd]` Der Trennstrich stand die ganze Zeit in Zeile 396/397. Die Ursache war
Punkt 2 und nur der: ein Ternaer ueber sieben Reitern, dessen `else`-Zweig den
gesamten Inhalt trug.

`[read]` **Das ist die Art Beleg, die dieser Auftrag verlangt hat** — eine
Aufteilung, die von sich aus zeigt, welche Faelle betroffen sein muessen und
welche nicht. Wer stattdessen G-541 zurueckgerollt haette, haette einen
richtigen Bau beschaedigt und den Fehler behalten.

### Der Fehlercode reicht nicht — selbst gemessen

`[cmd]` Toms Fehler kam als `READ_FAILED`, nicht als `NO_SESSION`: PostgREST
meldet den Tokenfehler **als Antwort auf die Abfrage**. Die Unterscheidung
liest darum den Text.

`[read]` **Und die Richtung des Zweifels ist richtig gewaehlt:** im Zweifel
Datenfehler. Ein falsch als Sitzungsfehler gemeldeter Datenfehler schickt den
Nutzer zu einer Anmeldung, die nichts aendert — das waere schlimmer als die
heutige Meldung.

    Zustand                Fehlerart  Text  Knopf  Trennstrich  Attrappen
    gueltige Sitzung          --       --     0         1          12
    JWT issued at future    sitzung    da     1         1          12
    Datenfehler              daten     da     0         1           7

**Die mittlere Zeile ist der Auftrag** — vorher standen dort Nullen.

### Der Weg zum Fehler ist selbst ein Befund

`[read]` **Ein verfaelschter Cookie erreicht die Goals-Seite nicht.** Die
Middleware ruft `getUser()` und leitet nach `/login` um. Toms Token kam durch
die Middleware und fiel erst bei PostgREST — **ein kaputter Cookie ist zu
kaputt, um das abzubilden.**

Der Fehlerweg wurde darum direkt ausgeloest, mit Toms Text woertlich, danach
entfernt und mit md5 gegen das Original geprueft: byte-gleich. **Das ist die
Ruecksetzprobe, die der Auftrag verlangt.**

### Eine Sabotage war zuerst gruen

`[cmd]` *„Anmeldeknopf ohne Text"* ging durch — der Waechter prueste Marke und
`href`, nicht ob der Knopf beschriftet ist. **Ein leerer Kasten ist kein Weg.**
Nachgebessert, jetzt rot.

`[read]` Das ist die vierte Sabotage in zwei Tagen, die einen gruenen Waechter
entlarvt hat. **Ohne die Gegenprobe waere jedes Mal ein Waechter
stehengeblieben, der nichts prueft.**

### Der Fund ausserhalb des Auftrags

`[cmd]` Dieselbe Kopplung in `medical/tab-biomarker.tsx` und
`nutrition/tab-vorlieben.tsx` — **gemeldet, nicht mitgenommen**, weil der
Auftrag `goals/` nannte. Das ist **G-555**.

`[cmd]` **Selbst nachgesehen und praezisiert:** in `medical` ist es kein
Ternaer, sondern ein frueher `return` (Zeile 55). Der verlaesst die Komponente
komplett — `MedImportReferenz` in Zeile 399 wird nie erreicht. **Strenger als
in Goals**, wo der Entwurf wenigstens im anderen Zweig stand.

### Was der Orchestrator zu verantworten hat

`[cmd]` **Die sieben gestagten Dateien kommen aus meinem gescheiterten
Commit-Versuch**, nicht aus `eb541cfc`. Mein `git add -A` lief, das Gate fiel
an einem `# fail 1` — **und dieser Fehlschlag war Claude Codes Zwischenstand,
weil ich mitten in seine Arbeit gemessen habe.** Die Lehre stand schon in
`LAUFEND.md`: waehrend ein Agent in einem Bereich schreibt, misst dort
niemand. **Mein Commit-Hook misst dort.**

## Hash 2026-09-30 — `20992639`

`[cmd]` Der Commit lag an G-556 fest (`punkte-pruefen` rot, weil der
naechtliche Kettenlauf gescheitert war). Seit `89e71386` ist die Kette
gruen. `ladefehler.ts` und das wieder sichtbare Mockup sind drin.

`[cmd]` **Der Folgebefund G-555 bleibt offen** — derselbe verschluckte
Ladefehler in `medical/tab-biomarker.tsx` und
`nutrition/tab-vorlieben.tsx`. Bei Medical ist es ein `early return`,
also strenger als ein Ternaer: `MedImportReferenz` auf Zeile 399 wird
nie erreicht.
