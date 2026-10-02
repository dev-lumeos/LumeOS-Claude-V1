---
nr: A-87
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01
agent: codex
beauftragt: 2026-10-02

braucht: [A-86, A-92]
kind_von: A-77

quellen:
  - docs/punkte/erledigt/quer-a-0077-werkzeugtests-liefen-nirgends.md
  - docs/punkte/erledigt/quer-a-0092-die-g558-probe-ruft-ohne-zielbezug.md

beruehrt:
  dateien:
    - supabase/_pipeline/kette.json
    - supabase/_pipeline/_validierung/
---

# 46 Zeugen, nach Ursache gestaffelt verdrahten

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-87: die Zeugen in EINEM Durchgang, nicht
                              einzeln - sonst stirbt jeder Vollauf am
                              naechsten
    Bereich: supabase/_pipeline/_validierung/
             supabase/_pipeline/kette.json
    Fremd:   apps/ gehoert Claude Code (G-579 laeuft dort). docs/
             gehoert dem Orchestrator, auch diese Punktdatei: der
             Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-02

**Zuerst lesen, vollstaendig:** diese Datei und deinen A-77-Bericht, aus
dem die Gruppierung unten stammt.

## Warum dieser Auftrag jetzt kommt, und was ich falsch gemacht habe

`[cmd]` **Zwei Vollaeufe sind an je EINEM Zeugen gestorben:**

    A-91   1.347,9 s   Abbruch bei G-558 (Zielbezug fehlt)
    A-92   1.291,7 s   G-558 gruen, Abbruch bei G-545
                       (Erwartung ohne duration_ratio_pct)

`[read]` **Das sind 44 Minuten Wartezeit fuer zwei Zeugen von 46.** Ich
habe A-92 als eigenen Punkt herausgeschnitten, weil er billig aussah.
Er war billig — aber der naechste Zeuge stand schon dahinter, und das
war vorhersehbar. **Darum kommt jetzt die ganze Staffel, und A-88 wartet
dahinter.**

`[cmd]` **Der G-545-Zeuge ist von mir verursacht, gestern:** G-560
schreibt `duration_ratio_pct` in die Teilphasen des Katalogs
(`560_goal_programs.sql:205-207`, 22/44/33). Die Probe
`goals-g545-strategy-content.test.ts` erwartet den Inhalt ohne dieses
Feld. **Der Bestand hat recht, die Probe ist ueberholt** — genau der
Fall A1 unten, und du musst ihn nicht erst entscheiden.

## Der Befund

`[cmd]` **A-77 hat alle 120 Proben eingeordnet.** 71 sind aktuell und
gruen, **46 sind Zeugen** — sie beschreiben einen Zustand, den es nicht
mehr gibt —, 3 sind nicht sicher messbar, weil `-d postgres` fest im
Test steht.

`[read]` **Ein Zeuge ist kein kaputter Test.** Er sagt, dass eine
Aussage ueber das Produkt nicht mehr stimmt. **Jede Gruppe unten ist
eine Aussage, die einmal gegolten hat.**

## Die Ursachen, wie Codex sie gruppiert hat

`[cmd]` **Fehlender Bestand im Lauf** — der groesste Block, und er
gehoert A-86: C-422, C-430, C-380, C-392, C-397, C-413, C-501, C-493 und
mehrere Goals-Proben.

`[cmd]` **G-559:** G-451 erwartet weiterhin drei statt fuenf
Seedphasen.

`[cmd]` **C-541:** C-466, C-542 und C-516 erzeugen Profile ohne den
inzwischen verpflichtenden Erfahrungsgrad.

`[cmd]` **G-531/G-535:** aeltere Proben setzen noch
`request.jwt.claim.sub` — betroffen G-357 sowie C-441 und C-445.

`[cmd]` **G-538/G-558/G-563:** aeltere Goals-Proben kennen Zielbindung,
Strategieargument oder die zielbezogene Signatur nicht vollstaendig.
**G-558 selbst ist seit A-92 erledigt** und faellt aus der Liste.

`[cmd]` **G-563:** G-526 sucht den frueheren Kommentar der
ueberschriebenen Zielfunktion.

`[cmd]` **G-560, neu am 2026-10-02:** G-545 erwartet die Teilphasen ohne
`duration_ratio_pct`.

`[cmd]` **C-465:** C-419 erwartet die Marketplace-Tabelle
`delivery_results` noch nicht.

`[cmd]` **C-530/C-531:** C-492 erwartet weiterhin 112 statt der
kuratierten 105 Muskelprofile.

`[cmd]` **C-275/C-516:** feste Katalogzaehlungen in C-352, C-453 und
C-510 sind durch spaetere Katalogerweiterungen ueberholt.

`[cmd]` **Mehrere weitere pruefen exakte Seedmengen oder nehmen eine
beliebige Zeile mit `LIMIT 1`.**

## Was zu tun ist

**A1 — je Gruppe entscheiden, wer recht hat.** `[read]` **Das ist der
ganze Punkt und keine Formalie:** erwartet die Probe das Richtige und
das Produkt hat sich falsch geaendert, oder hat sich das Produkt richtig
geaendert und die Probe ist ueberholt? **Im ersten Fall entsteht ein
Befund, im zweiten wird die Aussage nachgezogen — mit Begruendung in der
Datei.**

**A2 — gestaffelt verdrahten, nach Vorbedingung und Modul.** `[cmd]`
**Pauschal ist es nicht tragbar:** die Serieninventur aller 117
umleitbaren Dateien brauchte 819,7 s, also rund 13,5 Minuten
Zusatzlaufzeit zu den 1.459,7 s.

**A3 — die drei nicht messbaren zuerst lauffaehig machen.** `-d postgres`
fest im Test ist dieselbe Klasse wie die stillen Rueckfaelle (A-88).
`[cmd]` **Ich finde `-d postgres` heute nur in sechs Kommentarzeilen** —
pruef das nach und melde, welche der drei wirklich ausfuehren.

**A4 — die oberflaechenrelevanten roten Aussagen melden**, nicht
entscheiden: Recovery-Kacheln, Activity Stream,
Meal-Plan-Lifecycle und -Slots, aeltere Goals-Zielwertproben.
`[read]` **Die Fachlichkeit dahinter ist in keinem Auftrag entschieden
worden.** `[cmd]` **Der Meal-Plan-Teil beruehrt G-579**, das gerade bei
Claude Code laeuft: `nutrition.meal_plan_set_next_plan` bekommt dort
seinen ersten Aufrufer. **Melde, was deine Proben dazu behaupten —
aendere nichts in `apps/`.**

**A5 — der Vollauf am Ende, einmal.** `[read]` **Hier ist er
ausdruecklich Teil des Nachweises**, weil A-91/A5 ihn verlangt und er
seit zwei Tagen an Zeugen stirbt. **Erst wenn deine Staffel steht, nicht
als Zwischenprobe.** Danach gilt A-91 als belegt: veroeffentlichter
Dump, Bytezahl und Manifestquellen vorher und nachher.

**Nicht Teil:** der stille Rueckfall auf `postgres` (A-88, liegt in
`next/` und kommt nach diesem Punkt) und der fehlende Bestand selbst
(A-86, erledigt).

**Zu belegen:** je Gruppe die Entscheidung mit einem Satz Begruendung ·
**je Stapel nur die verdrahteten Proben**, gegen eine Wegwerf-Datenbank,
mit ihrer Laufzeit · die Zahl der Zeugen vorher und nachher · die
Schrittzahl aus `kette.json` gelesen · der eine Vollauf am Ende ·
Wegwerf-Datenbanken verworfen mit Zaehler · kein `db push` · nichts
committen.
