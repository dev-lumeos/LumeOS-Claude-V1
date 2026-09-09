---
nr: G-392
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-390
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  module_mit_platz: 6
  betroffen: 1
---

# G-392 — der Hydrationsfehler am Wechslerplatz

## Befund

Aus G-390, Claude Code, 2026-09-08. **Durch Bisektion gefunden,
zweimal reproduziert.**

`[cmd]` **`ansicht.tsx:327`:**

    <div className="v2-kopf-mitte" data-tageswechsler />

`[cmd]` **Weg davon: sauber. Zurueck: rot.**

`[cmd]` **Und die Meldung passt:** *,,did not expect server HTML to
contain a `<div>` in `<div>`."*

## Was der Orchestrator nachgemessen hat

`[cmd]` **`v2-kopf-mitte` je Modul:**

    dashboard    1   dashboard-echt.tsx:83
    goals        1   ansicht.tsx:203
    nutrition    1   ansicht.tsx:314
    recovery     1   ansicht.tsx:207
    supplements  1   ansicht.tsx:327
    training     1   ansicht.tsx:161

`[read]` **Genau eines je Modul** ? **Claude Codes Vermutung, dass
`nutrition` zwei hat, stimmt NICHT.**

`[read]` **Damit faellt seine Spur** ? **`querySelector` nimmt den
ersten Treffer, aber es gibt nur einen.**

## Was der Unterschied sein koennte

`[cmd]` **Das naechste Geschwisterelement:**

    dashboard    </div>  -- Kopf endet
    goals        <div className="v2-module-actions"> <button>
    nutrition    <div className="v2-module-actions"> {/* Kommentar */}
    recovery     <div className="v2-module-actions"> <button>
    training     <div className="v2-module-actions"> <button>
    supplements  <div className="v2-module-actions"> <InEntwicklungKnopf>

`[read]` **Bei `supplements` folgt ein BAUTEIL, bei den anderen ein
`<button>`.**

`[cmd]` **Aber `InEntwicklungKnopf` steht in 36 Dateien, auch in
`goals` und `medical`** ? **die sauber sind.**

`[read]` **Also ist es nicht das Bauteil allein** ? **es ist eine
Vermutung, kein Befund.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Meldung genau lesen

`[cmd]` **`<div>` in `<div>`** ? **das ist eine
Verschachtelungsmeldung, keine Textmeldung.**

`[read]` **Miss, WELCHE zwei `div` gemeint sind** ? **die
Browsermeldung nennt beide, mit Attributen.**

`[read]` **Und ob der Server ein `div` liefert, wo der Client
keines erwartet, oder umgekehrt** ? **die Richtung steht in der
Meldung.**

### 2 · Der Vergleich, den du schon halb hast

`[cmd]` **Sechs Module tragen den Platz, eines faellt.**

`[read]` **Miss den vom Server gelieferten HTML-Text an dieser
Stelle, je Modul** ? **`view-source` oder die Netzwerkansicht.**

`[read]` **Nicht den gerenderten Baum** ? **der ist schon
repariert.**

`[cmd]` **Der Unterschied muss im Serverausgang stehen** ? **sonst
waere er nicht serverseitig.**

### 3 · Die Kopfstruktur

`[cmd]` **`supplements/ansicht.tsx` ist 474 Zeilen** ? **die
laengste der sechs.**

`[read]` **Miss, ob der Kopf dort anders aufgebaut ist** ?
**mehr Verschachtelung, ein zusaetzlicher Rahmen, eine Bedingung
die serverseitig anders faellt.**

`[cmd]` **`v2-module-hero-lite`** ? **hat `supplements` es, haben
die anderen es?**

### Abnahmebedingungen

    A1  welche zwei `div` nennt die Meldung. Wortlaut.
    A2  der Serverausgang je Modul an dieser Stelle.
        Zahl: 6 Module, je der Ausschnitt.
    A3  der Unterschied, belegt. Nicht vermutet.
    A4  behoben, 0 Konsolenfehler auf allen elf Reitern.
        Bildschirmfoto.
    A5  Gegenprobe: der Fehler kehrt zurueck, wenn die Ursache
        wieder eingebaut wird.
    A6  1525 Tests bleiben gruen.

### Was nicht zu tun ist

**Den Wechslerplatz nicht entfernen** ? **er ist die Loesung aus
G-376, nicht das Problem.**
**Nichts in `packages/ui`** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-445.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`** ? **er ist dir
gestern von selbst zurueckgekommen, das war richtig.**

## Bericht

### A1 ? Der Wortlaut: die Meldung nennt die zwei `div` NICHT im Browser

`[cmd]` **Was die Konsole hergibt, vollstaendig ? drei Zeilen:**

    [error]     Warning: Extra attributes from the server: %s%s
                | data-mode |      at html, at RootLayout (Server)
    [pageerror] Hydration failed because the initial UI does not
                match what was rendered on the server.
    [pageerror] There was an error while hydrating this Suspense
                boundary. Switched to client rendering.

`[cmd]` **Drei Wege probiert, den ausfuehrlichen Text zu bekommen:**
`console`-Ereignisse mit allen Argumenten, `console.error` per
`addInitScript` VOR React ueberschrieben, und das
Entwicklungsoverlay (`nextjs-portal`, Shadow-DOM). **Keiner liefert
die `<div> in <div>`-Angabe** ? React wirft sie als Fehler, nicht
ueber `console.error`, und das Overlay rendert seinen Fehlertext erst
beim Aufklappen.

`[read]` **Die Angabe aus deiner Meldung ist trotzdem die genaueste
Spur, die es gibt**, und sie ist eindeutig zuzuordnen:

    <V2SupplementsPage>
      <SupplementsAnsicht>
        <div>          <- ansicht.tsx:299  v2-module-header
          <div>        <- ansicht.tsx:300  v2-module-title-block

`[cmd]` **Die RICHTUNG steht im Text:** *„Did not expect **server
HTML** to contain a `<div>` in `<div>`"* ? **der Server liefert ein
`div`, das der Client an dieser Stelle nicht erwartet.** Nicht
umgekehrt.

`[read]` **Und `data-mode` ist NICHT die Ursache** ? die Warnung
steht an `<html>`, kommt vom Themenschalter und erscheint auf **jedem**
Modul, auch den sauberen.

### A2 ? Der Serverausgang je Modul: sechs Ausschnitte, byte-gleich

`[cmd]` **Nicht der gerenderte Baum, sondern die erste HTTP-Antwort**
(`ctx.request.get` mit den Sitzungskeksen). **Je Modul der Ausschnitt
ab `v2-kopf-mitte`:**

    dashboard    ...</div></div><div class="v2-kopf-mitte"
                 data-tageswechsler="true"></div></div><div
                 class="v2-grid v2-g-cols-4"...
    goals        ...</div></div><div class="v2-kopf-mitte"
                 data-tageswechsler="true"></div><div
                 class="v2-module-actions"><button type="button"
                 class="v2-btn"><svg...
    nutrition    ...dito, <div class="v2-module-actions"><button...
    recovery     ...dito, <div class="v2-module-actions"><button...
    supplements  ...dito, <div class="v2-module-actions"><button...
    training     ...dito, <div class="v2-module-actions"><button...

`[cmd]` **Fuenf der sechs sind an dieser Stelle IDENTISCH**, bis auf
das Zeichen. **Nur `dashboard` weicht ab** ? dort endet der Kopf
nach dem Platz (`</div></div>`), es folgt kein Aktionsblock.

`[read]` **Damit faellt deine Geschwister-Spur, und zwar belegt:**
**`InEntwicklungKnopf` rendert ein schlichtes `<button
type="button" class="v2-btn">`** ? im Serverausgang nicht von den
`<button>` in goals, recovery und training zu unterscheiden. **Es ist
kein „Bauteil statt Knopf", es ist derselbe Knopf.**

### A3 ? Der Unterschied ist NICHT gefunden. Was ausgeschlossen ist

`[read]` **Ich melde das als offen, statt eine Vermutung als Befund
zu verkaufen.** Ausgeschlossen ist ? jedes durch eine Messung, nicht
durch Lesen:

| Vermutung | Messung | Ergebnis |
|---|---|---|
| das Geschwisterelement des Platzes | Serverausgang je Modul (A2) | **gleich** in fuenf Modulen |
| `InEntwicklungKnopf` als Bauteil | derselbe Ausschnitt | rendert `<button>`, wie die anderen |
| zwei `kopf-mitte` je Modul | deine Messung | genau eines, ueberall |
| die Reiterinhalte | alle zwoelf per `{false &&}` aus | **HYDRATION** |
| die Modale | `SupplementsModale` aus | **HYDRATION** |
| Titelblock / Aktionsblock / Pill-Zweig | je einzeln aus | **HYDRATION** |
| der aeussere Kopf-`div` | durch ein Fragment ersetzt | **HYDRATION** |
| die Referenzbloecke | fuenf `SuppXReferenz` aus | **HYDRATION** |
| nichtdeterministisches Rendern | zwei Serverabrufe verglichen | **gleich lang, gleicher Rumpf** (nur ein CSS-Zeitstempel weicht ab) |
| die GROESSE der Antwort | zwei Konten, zwei Module | **widerlegt, siehe unten** |

`[cmd]` **Die Groessenspur war die beste und ist widerlegt:**

    test-user  recovery      263.223 Zeichen  sauber
    test-user  supplements   385.925 Zeichen  HYDRATION
    dev        recovery      302.307 Zeichen  sauber
    dev        supplements   503.491 Zeichen  HYDRATION

`[read]` **`recovery` mit 302 KB ist sauber, `supplements` mit 386 KB
faellt** ? es gibt keine Schwelle, die beide erklaert. **Das Modul
entscheidet, nicht die Laenge.**

`[cmd]` **Und der Fehler ueberlebt C-445:** mit **16 Orten** und
**12 Spalten** in `injection_logs` (statt 4 und 6) ist er
unveraendert da. **Er haengt nicht an den Injektionsdaten.**

#### Die Bisektion weitergetrieben: es ist NICHT die Route

`[cmd]` **Nach dem JSX habe ich die Ladekette selbst zerlegt**, Schritt
fuer Schritt, je mit Messung:

    Rumpf auf den blossen Kopf reduziert
      (alle Kindimporte bleiben)              -> HYDRATION
    alle 9 lokalen Kindimporte auskommentiert -> HYDRATION
    page.tsx rendert `SupplementsAnsicht` gar
      nicht mehr, nur einen Kopf              -> HYDRATION
    page.tsx laedt KEINE Daten mehr
      (statische Seite, kein `Promise.all`)   -> HYDRATION
    `import './supplements.css'` entfernt     -> HYDRATION
    `loading.tsx` weggenommen                 -> HYDRATION

`[read]` **Eine Seite ohne Daten, ohne Ansicht, ohne CSS und ohne
Ladegrenze faellt weiter.** `[cmd]` **Damit ist die gesamte Route
ausgeschlossen** ? `page.tsx`, `ansicht.tsx`, alle fuenfzehn
Kindmodule, das Stylesheet und die Suspense-Grenze.

`[cmd]` **`loading.tsx` war die beste Spur und ist widerlegt:**
`supplements` ist das **einzige** Modul mit einer solchen Datei (alle
anderen haben keine), und die zweite Fehlermeldung nennt woertlich
eine *„Suspense boundary"*. **Trotzdem bleibt der Fehler ohne sie.**

`[read]` **Was daraus folgt:** der Unterschied liegt **ausserhalb des
Routenordners** ? in etwas, das an der ADRESSE `/v2/supplements`
haengt, nicht an ihrem Inhalt. **Naechster Schritt waere die Schale**
(`v2/layout.tsx`, `shell.tsx`) und was sie je Pfad anders tut:
`rg -n "supplements" apps/web/src/app/v2/shell.tsx` findet zwar
nichts, aber die Navigation kennt den Pfad, und der Tageswechsler
sucht sein Ziel per `document.querySelector` ueber den GANZEN Baum.

### A4 ? Nicht behoben

**Der Fehler steht.** `[cmd]` **11 Reiter, 0 sauber**, unveraendert
gegenueber G-390.

`[read]` **Kein Bildschirmfoto** ? die Bedingung (0 Konsolenfehler)
ist nicht erfuellt, und ein Bild waere hier nur der Beweis fuer etwas
anderes.

### A5 ? Gegenprobe entfaellt

`[read]` **Ohne Behebung gibt es keine Rueckkehr zu pruefen.** Die
Gegenprobe steht aus, bis A4 erfuellt ist.

### A6 ? 1525 Tests gruen

`[cmd]` **1525 pass / 0 fail**, `tsc` sauber. `[cmd]`
**`ansicht.tsx` ist Zeichen fuer Zeichen der committete Stand** ?
`git diff --stat` leer. **Alle Bisektionsschritte sind
zurueckgebaut.**

`[read]` **Der Wechslerplatz steht unveraendert** (G-376), wie
verlangt. **Nichts in `packages/ui`, nichts in `supabase/`.**

### Was das fuer den naechsten Schritt heisst

`[read]` **Zwei Sachen sind jetzt sicher, die es vorher nicht waren:**

**1 ? Der Serverausgang ist an der gemeldeten Stelle gleich.** Der
Unterschied steht NICHT im Kopf-HTML. `[read]` **Damit ist die
Meldung zwar richtig verortet, aber die Ursache liegt woanders** ?
React nennt den Ort, an dem es den Unterschied BEMERKT, nicht den, an
dem er entsteht.

**2 ? Der Fehler haengt am Modul, nicht an Groesse, Daten oder JSX.**
`[cmd]` Alle drei sind einzeln widerlegt.

`[read]` **Meine Empfehlung fuer den Folgeauftrag:** **nicht mehr im
Routenordner suchen** ? er ist vollstaendig ausgeschlossen. **Zwei
Ansaetze, in dieser Reihenfolge:**

**a) Den Fehler in einem ANDEREN Modul erzeugen.** `[cmd]` Ein
`loading.tsx` nach `recovery` kopieren, oder dessen Kopf um die
Zeichenzahl von supplements aufblaehen ? **wird recovery dann rot,
ist die Eigenschaft gefunden; bleibt es sauber, ist es wirklich der
Pfad.** Das ist die Gegenrichtung zu allem, was ich probiert habe:
ich habe nur weggenommen, nie hinzugefuegt.

**b) Die Schale je Pfad vergleichen.** `v2/layout.tsx` und
`shell.tsx` nennen `supplements` nicht namentlich ? aber die
Navigation kennt den Pfad, und der Tageswechsler sucht sein Ziel per
`document.querySelector` ueber den **ganzen** Baum. `[read]` **Ein
Portal, das in einen Knoten rendert, den der Server anders
ausliefert, ist genau die gemeldete Form** ? und es ist die einzige
Stelle, die den Routenordner verlaesst.


### Nachtrag G-393: die Ursache ist gefunden

### Zuerst: die Frage nach dem alten Fehler

**Ja, einen habe ich wieder eingebaut, und das war meiner.**

`[cmd]` **G-388, `tab-injektionen.tsx:111`:** `new Date()` in die
Rotationsrechnung. `[cmd]` **Die Warnung stand woertlich in der
Datei, in die der Reiter eingehaengt ist** (`ansicht.tsx:193`), und
**G-74 hatte genau das schon einmal behoben.**

`[cmd]` **Behoben in G-390** ? und zwar so, dass es nicht
wiederkommen kann: `tageSeitInjektion` nimmt jetzt einen `string`
statt eines `Date`. **Eine Funktion, die keinen Zeitpunkt annimmt,
kann keinen falschen annehmen.** Dazu ein Waechter
(`tools/hydration-datum-pruefen.mjs`).

`[read]` **Der Fehler, den du jetzt siehst, ist nicht dieser.**
`[cmd]` **In G-389 gemessen: er stand schon am Commit VOR G-388**
(`c3cd8fe5^`), und er ueberlebte die G-390-Behebung. **Zwei
verschiedene Fehler an derselben Stelle.**

### Eine Berichtigung an meinem eigenen G-392-Bericht

`[cmd]` **Mein Befund *„auch eine statische Seite ohne Ansicht
faellt"* war FALSCH**, und damit auch der Schluss *„die gesamte Route
ist ausgeschlossen"*.

`[cmd]` **Der Messfehler:** ich habe mit `lauf.hole()` gepruefte, ob
meine Aenderung ankommt ? und dabei **immer 23.552 Zeichen** bekommen,
egal was ich aenderte. **Das ist die Streaming-Huelle, der erste
Chunk.** Der Seitenrumpf kommt danach. `[read]` **Ich habe also
gegen einen Stand gemessen, der meine Aenderung nie enthielt** ?
sechs Bisektionsschritte lang.

`[cmd]` **Richtig gemessen (im Browser, `waitUntil: networkidle`):**
`page.tsx` auf reinen Text reduziert -> **0 Hydrationsfehler.**
`[read]` **Deine Meldung mit `V2SupplementsPage > SupplementsAnsicht`
war die ganze Zeit richtig, mein Ausschluss war es nicht.**

### A1 ? Die zwei `div`: die Streaming-Huelle

`[cmd]` **Im Serverstand, am Modulkopf:**

    <script src="/_next/static/chunks/app/v2/supplements/page.js"
            async=""></script>
    <div hidden id="S:0"><div class="v2-module-header
         v2-module-hero-lite"><div class="v2-module-title-block">...

`[read]` **`<div hidden id="S:0">` ist die Streaming-Huelle von
Next.** Der Server liefert erst das Skelett, dann den echten Kopf in
diesem versteckten `div`, und ein Skript haengt ihn um. **Das ist das
zusaetzliche `div`, das der Client an dieser Stelle nicht
erwartet** ? und die Richtung stimmt mit der Meldung ueberein:
*„server HTML to contain a `<div>` in `<div>`"*.

### A2/A3 ? Die Ursache, in beide Richtungen belegt

`[cmd]` **`supplements` ist das EINZIGE Modul mit einer
`loading.tsx`** ? `ls apps/web/src/app/v2/*/loading.tsx` liefert
genau eine Datei.

`[cmd]` **Gegenprobe, je zwei Laeufe, im Browser gemessen:**

    mit loading.tsx        HYDRATION (2 von 2)
    ohne loading.tsx       SAUBER    (2 von 2)
    wieder mit             HYDRATION (2 von 2)

`[read]` **Damit ist die Ursache belegt, nicht vermutet:** die
`loading.tsx` erzeugt eine Suspense-Grenze, und Next liefert den
Seiteninhalt danach in einer Huelle nach. **Die zweite Fehlermeldung
nennt sie woertlich:** *„error while hydrating this Suspense
boundary"*.

`[cmd]` **Und die Bisektion im Kopf, jetzt mit richtiger Messung:**

    Ansicht auf den blossen Kopf reduziert   HYDRATION
    derselbe Kopf OHNE `data-tageswechsler`  SAUBER

`[read]` **Beide Teile gehoeren zusammen:** die Suspense-Grenze
liefert den Kopf nach, und das Portal des Tageswechslers haengt sich
in genau diesen Kopf. **Ohne die Grenze passiert nichts, ohne den
Platz passiert nichts** ? erst beides zusammen bricht.

**Was ich sonst noch ausgeschlossen habe** (jedes gemessen):

    `dynamic = 'force-dynamic'`   in allen sieben Modulen gleich
    Reihenfolge in der Schale     Wechsler nach `children`: HYDRATION
    Anker im Skelett ergaenzt     HYDRATION
    Skelett mit gleichem Kopfbau  HYDRATION

### A4 ? Nicht behoben, und warum ich nicht geraten habe

**Der Fehler steht.** `[cmd]` **Die einzige Aenderung, die ihn
beseitigt, ist das Entfernen der `loading.tsx`** ? und die kostet den
Ladezustand aus G-376: **1,9?2,9 s ohne jede Rueckmeldung**, gemessen
2026-08-25. `[read]` **Das ist kein Tausch, den ich allein
entscheide.**

`[cmd]` **Vier Behebungsversuche, alle gemessen, alle erfolglos:**
den Anker ins Skelett, das Skelett mit demselben Kopfaufbau, den
Wechsler nach `children`, und `key={pathname}` am Wechsler (damit er
beim Pfadwechsel neu aufgebaut wird statt gegen einen alten
Portalknoten zu halten). **Alle vier zurueckgebaut, `git status` auf
`apps/` leer.**

`[read]` **Ich haette den vierten Versuch machen koennen** ? den
Wechsler nicht per Portal, sondern als Teil des Modulkopfes. **Das
waere aber die Rueckabwicklung von G-376**, und die hat Tom
ausdruecklich so gewollt. **Also melde ich statt zu bauen.**

### A5/A6 ? Gegenprobe und Tests

`[cmd]` **Die Gegenprobe steht** ? sie ist oben die Messreihe
mit/ohne `loading.tsx`, dreimal gewechselt. `[cmd]` **1525 Tests
gruen**, `tsc` sauber, **`git status` auf `apps/` leer.**

### Der Vorschlag

`[read]` **Drei Wege, und ich wuerde den ersten nehmen:**

**1 ? Den Platz in die SCHALE ziehen statt ins Modul.** Der Kopf
gehoert weiter dem Modul, aber der Anker steht in `shell.tsx`,
ausserhalb der Suspense-Grenze. **Dann faellt der Platz nicht mit dem
Seiteninhalt weg und wird nicht nachgeliefert.** `[read]` **Das
erhaelt G-376 (Wechsler im Kopf) und G-376s Ladezustand** ? es
verschiebt nur, wer den Anker stellt.

**2 ? Die `loading.tsx` streichen** und den Ladezustand anders
loesen. **Kostet den Befund aus G-376.**

**3 ? Den Wechsler ohne Portal bauen**, als Bauteil im Modulkopf.
**Das ist die Rueckabwicklung von G-376** und braeuchte ihn in sechs
Modulen.

`[cmd]` **Und ein vierter Befund nebenbei:** `supplements` ist das
einzige Modul mit `loading.tsx` ? **die anderen sechs haben gar
keinen Ladezustand.** Der Befund aus G-376 (*„0 Skeletons im ganzen
Projekt"*) gilt fuer sie unveraendert.

## Abnahme

_(vom Orchestrator)_

## Auftrag 2 — den Anker aus der Suspense-Grenze holen

**Beauftragt am 2026-09-08.**

### Sein Vorschlag ist der richtige

> *,,Den Anker in die Schale verlegen, ausserhalb der
> Suspense-Grenze. Der Kopf bleibt beim Modul, der Wechsler bleibt
> im Kopf, das Skelett bleibt ? nur wer den Anker stellt,
> aendert sich."*

`[read]` **Die zwei Alternativen sind schlechter:**

`[read]` **`loading.tsx` loeschen** kostet den Ladezustand aus
G-376 ? **1,9 bis 2,9 s ohne Rueckmeldung, gemessen am 2026-08-25.**

`[read]` **Den Wechsler ohne Portal bauen** macht G-376 in sechs
Modulen rueckgaengig.

### Was zu messen ist, bevor gebaut wird

`[read]` **Wo genau die Suspense-Grenze liegt** ? **`loading.tsx`
umschliesst `page.tsx`, aber wo endet sie?**

`[cmd]` **Wenn die Schale ausserhalb liegt, kann sie den Anker
stellen** ? **das ist die Bedingung, und sie ist zu belegen.**

`[read]` **Und: was passiert bei den fuenf anderen Modulen?**
`[read]` **Ein Anker in der Schale ist fuer alle da, nicht nur fuer
`supplements`.**

### Die vier gescheiterten Versuche NICHT wiederholen

`[cmd]` **Anker im Skelett, Skelett spiegelt den Kopf, Wechsler
nach den Kindern, `key={pathname}`** ? **alle gemessen, alle
gescheitert.**

`[read]` **Er hat sie zurueckgebaut** ? `git status` **auf
`apps/` leer, 1525 Tests gruen.**

### Abnahmebedingungen

    A1  wo liegt die Suspense-Grenze? Belegt, nicht vermutet.
    A2  der Anker in der Schale. 0 Konsolenfehler auf allen
        elf Reitern. Bildschirmfoto.
    A3  Gegenprobe: Anker zurueck in den Kopf -> Fehler kehrt
        wieder. Zurueckgebaut.
    A4  die fuenf anderen Module bleiben sauber. Zahl:
        6 mit Wechsler / davon sauber.
    A5  loading.tsx bleibt. Der Ladezustand ist belegt.
    A6  1525 Tests bleiben gruen.

### Und das Messwerkzeug

`[read]` **`lauf.hole()` liefert die Streaming-Huelle** ? **wer
damit eine Seitenaenderung prueft, prueft nichts.**

`[read]` **Miss, ob es das Ende der Antwort abwarten kann** ?
**oder ob ein Vermerk im Kopf der Datei reicht.**

`[cmd]` **`tools/lauf.py` gehoert dir** ? **du hast dort schon
`schreib()` behoben** (G-380).

    A7  hole(): behoben oder mit Vermerk. Belegt.

### Was nicht zu tun ist

**`loading.tsx` nicht loeschen** ? **das waere Toms
Entscheidung.**
**Nichts in `packages/ui`** ? **melden.**
Nicht committen, nicht stagen, nicht pushen.

## Die Karte ist herausgezogen

`[cmd]` **Der Kartenbefund steht als G-393** ? **er haengt nicht am
Hydrationsfehler.**

`[read]` **Zwei Sachen in einem Auftrag haben die Grafik hinter der
Fehlersuche warten lassen.**
