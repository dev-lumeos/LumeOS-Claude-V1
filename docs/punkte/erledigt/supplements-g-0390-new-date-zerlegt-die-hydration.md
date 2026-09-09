---
nr: G-390
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-388
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 59c7ae21
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
  treffer: 1
---

# G-390 — `new Date()` zerlegt die Hydration

## Befund

`[cmd]` **`tab-injektionen.tsx:111`:**

    () => tageSeitInjektion(stand?.orte ?? [],
                            stand?.protokoll ?? [], new Date()),

`[cmd]` **Und `ansicht.tsx:193-195` warnt woertlich davor:**

> *,,G-74: Der Stichtag der Rechnungen. Kommt serverseitig; ohne ihn
> der juengste Protokolltag ? **nie `new Date()`**, das zerlegte die
> Hydration und rechnete im Browser anders als beim Rendern."*

`[read]` **G-74 hat das schon einmal behoben. G-388 hat es wieder
eingebaut.**

`[read]` **Die Warnung stand in der Datei, in die der Reiter
eingehaengt ist.**

## Warum es alle elf Reiter trifft

`[read]` **Claude Code hat gemessen: der Fehler erscheint auf allen
elf Reitern, nur im Supplements-Modul.**

`[cmd]` **Der Grund: `tab-injektionen` wird in `ansicht.tsx`
importiert** ? **die Berechnung laeuft beim Rendern der Schale,
nicht erst beim Oeffnen des Reiters.**

`[read]` **Ein Fehler in einem Reiter faellt auf die ganze Schale
zurueck.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Den Stichtag durchreichen

`[cmd]` **`ansicht.tsx:196` hat ihn schon:**

    const stichtag = heuteProp
      ?? datenProp?.einnahmen.map(e => e.intake_date).sort().pop()
      ?? '1970-01-01'

`[read]` **Reich ihn an `tab-injektionen` durch** ? **wie an die
anderen Reiter.**

`[read]` **Und miss, ob `tageSeitInjektion` mit einem `string`
umgehen kann oder ein `Date` braucht.**

### 2 · Ein Waechter

`[read]` **G-74 hat es behoben, G-388 hat es wieder eingebaut** ?
**eine Warnung im Kommentar reicht nicht.**

`[cmd]` **`new Date()` ohne Argument in `apps/web/src/app/v2/`
darf es nicht geben.**

`[read]` **Miss, wie viele es heute gibt** ? **und ob alle falsch
sind oder manche berechtigt.**

`[read]` **Wenn berechtigte dabei sind: der Waechter braucht eine
Form, die sie durchlaesst** ? **nicht eine Ausnahmeliste.**

### 3 · Die zwei anderen Fundstellen

`[cmd]` **`tab-compliance.tsx:132` und `:204` nennen
`Math.random()` und `Date.now()` NUR im Kommentar** ? **als
Begruendung, warum sie es NICHT tun.**

`[cmd]` **`tab-spec.tsx:521` ebenso.**

`[read]` **Pruefen, nicht anfassen** ? **sie sind der Beleg, dass
die Regel bekannt war.**

### Abnahmebedingungen

    A1  der Fehler ist weg. Bildschirmfoto, Konsolenfehler 0.
    A2  auf allen elf Reitern. Zahl: 11 / davon sauber.
    A3  der Waechter faellt bei einem eingebauten `new Date()`.
        Gegenprobe, zurueckgebaut.
    A4  wie viele `new Date()` gibt es in v2? Zahl: gefunden /
        davon berechtigt, je mit Grund.
    A5  1518 Tests bleiben gruen.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-441.**
**Kein `git stash`** ? **er hat gestern eine Kollision erzeugt.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? Der `new Date()`-Fehler ist behoben, der Hydrationsfehler NICHT

**Zwei Sachen, und sie sind nicht dieselbe.**

`[cmd]` **Behoben:** `tab-injektionen.tsx:111` gab `new Date()` in
die Rotationsrechnung. `[read]` **Die Warnung stand woertlich in der
Datei, in die der Reiter eingehaengt ist** (`ansicht.tsx:193`), und
**G-74 hatte es schon einmal behoben.** Mein Fehler, und du hast
recht damit.

**Wie behoben:** `tageSeitInjektion` nimmt jetzt einen **`string`**
statt eines `Date`.

    vorher   tageSeitInjektion(orte, protokoll, heute: Date)
    nachher  tageSeitInjektion(orte, protokoll, stichtag: string)

`[read]` **Die Form macht den Fehler unmoeglich** ? wer keinen
Zeitpunkt annimmt, kann keinen falschen annehmen. **Der Aufrufer muss
einen Tag NENNEN**, und `ansicht.tsx:196` hat ihn serverseitig
bereits.

`[cmd]` **Gemessen: `tageSeitInjektion` braucht kein `Date`** ? sie
benutzte nur `getTime()`. Ein Datumsstring genuegt.

#### Aber der Hydrationsfehler bleibt ? und er ist ein anderer

`[cmd]` **Nach der Berichtigung erneut gemessen: 11 Reiter, 0
sauber.** `[cmd]` **Und weiter nur `supplements`** ? dashboard,
recovery, medical, nutrition, training, goals sind sauber.

`[read]` **Das deckt sich mit der Messung aus G-389:** der Fehler
stand schon am Commit **vor** G-388 (`c3cd8fe5^`). **Mein
`new Date()` war ein zweiter, echter Fehler an derselben Stelle ?
aber nicht die Ursache dieses Fehlers.**

### Die Ursache, durch Bisektion gefunden

`[read]` **Nicht geraten, sondern ausgeknipst und gemessen.** Je
Schritt der Reihe nach:

    alle 12 Reiterinhalte aus     -> HYDRATION   (nicht die Reiter)
    Modale aus                    -> HYDRATION   (nicht die Modale)
    Titelblock aus                -> HYDRATION
    Aktionsblock aus              -> HYDRATION
    Pill-Zweig aus                -> HYDRATION
    ganzer Modulkopf aus          -> SAUBER

`[cmd]` **Der Kopf war es ? aber nicht sein Inhalt.** Also die eine
Zeile, die mit ihm verschwand:

    <div className="v2-kopf-mitte" data-tageswechsler />

`[cmd]` **Nur diese Zeile entfernt, Kopf sonst unveraendert:**

    supplements  sauber

**Zweimal wiederholt, beide Male sauber.**

`[read]` **Das ist der Platz fuer den Tageswechsler** (G-378). Die
Schale rendert per `createPortal` hinein ? **der Server liefert das
`div` leer, der Browser fuellt es.** Genau die gemeldete Form: *„Did
not expect server HTML to contain a `<div>` in `<div>`."*

`[cmd]` **Gegenprobe ueber fuenf Module** (Server- gegen Clientstand):

    recovery     kopf-mitte S=1 C=1   datumsnav S=0 C=1   sauber
    nutrition    kopf-mitte S=2 C=2   datumsnav S=0 C=1   sauber
    supplements  kopf-mitte S=1 C=1   datumsnav S=0 C=1   HYDRATION
    training     kopf-mitte S=1 C=1   datumsnav S=0 C=1   sauber
    goals        kopf-mitte S=1 C=1   datumsnav S=0 C=1   sauber

`[read]` **Alle fuenf zeigen dasselbe Portalverhalten** (`S=0 C=1`),
**nur eines faellt.** `[cmd]` **Und die Slotzeile ist in allen vier
Modulen byte-gleich** ? nachgesehen.

`[read]` **Damit ist die Ursache eingegrenzt, aber nicht erklaert:**
die Zeile ist der Ausloeser, etwas an `supplements` macht sie
toedlich. **Der naechste Schritt waere, warum das Portal hier anders
trifft als dort** ? und das ist ein eigener Punkt, kein Nebenbefund.

**Kein Bildschirmfoto der sauberen Kachel**, weil die Bedingung
(`Konsolenfehler 0`) nicht erfuellt ist. **Ich melde das, statt ein
Foto zu zeigen, das etwas anderes belegt.**

### A2 ? 11 Reiter / 0 sauber

`[cmd]` **Je Reiter eine FRISCHE Seite** ? Hydration passiert nur
beim ersten Anstrich; wer im selben Tab weiterklickt, misst nichts.

    today stack extended catalog stacks intel inventory
    injection compliance interactions cost      alle HYDRATION (2)

`[read]` **Zwei Fehler je Reiter** ? die zweite Meldung ist die
Folge der ersten (*„error while hydrating this Suspense boundary"*).

### A3 ? Der Waechter faellt

**Gebaut:** `tools/hydration-datum-pruefen.mjs`.

`[cmd]` **Gegenprobe:** `new Date().toISOString().slice(0,10)` in
`tab-injektionen.tsx` wieder eingebaut ?

    vorher    6 Stellen
    sabotiert 7 Stellen, die neue namentlich
    zurueck   6 Stellen

**Und ein zweiter Waechter auf der Rechnung selbst**
(`injektion-karte.test.ts`, 7 Pruefungen). `[cmd]` **Sabotage
`new Date().getTime()` in die Rechnung:**

    not ok 5 - ein unlesbarer Stichtag rechnet nicht falsch, sondern gar nicht
    not ok 7 - die Rechnung nimmt einen Stichtag entgegen, keine Uhr

`[read]` **Zwei verschiedene Waechter haben sie gefangen** ? einer
ueber die Form, einer ueber das Verhalten. **Zurueckgenommen, 7/7
gruen.**

### A4 ? 27 Rohtreffer, 11 als Code, 6 zu Recht rot

`[cmd]` **Der rohe `rg`-Zaehler meldet 27** ? **16 davon stehen in
Kommentaren**, und fast alle warnen vor genau diesem Fehler. **Wer
sie mitzaehlt, meldet die Warnung als Verstoss.**

`[cmd]` **Als Code: 11.** `[cmd]` **Nach der Form geprueft: 6 rot,
5 berechtigt.**

**Die Form laesst drei Faelle durch, ohne Ausnahmeliste:**

| Form | Warum berechtigt | gemessen |
|---|---|---|
| in einem Ereignisbehandler | laeuft NUR im Browser, nach der Hydration | `medical/tab-tracking.tsx:561` (ein Klick) |
| in `useEffect` | laeuft NUR im Browser, nach dem ersten Anstrich | `nutrition/mahlzeiten.tsx:499` |
| in einer Serverkomponente | laeuft NUR auf dem Server ? es gibt keine zweite Rechnung | `dashboard/page.tsx:37` |

`[read]` **Eine Liste der erlaubten Stellen altert nur nach oben**
(Erlaubnisliste). **Eine FORM altert nicht** ? wer sie benutzt, kommt
durch, ohne dass jemand einen Eintrag pflegt.

**Die sechs roten, je mit Grund:**

| Stelle | Warum rot |
|---|---|
| `nutrition/erfassen-modal.tsx:96` | `useState(() => new Date())` ? **der Initialisierer laeuft auf BEIDEN Seiten** |
| `nutrition/plan-detail.tsx:53` | `heuteIso()` beim Rendern gerufen (Zeile 100) |
| `nutrition/plan-detail.tsx:358` | `useState`-Initialisierer |
| `nutrition/plan-eintraege.tsx:63` | beim Rendern, Client-Komponente |
| `nutrition/plans-echt.tsx:173` | `heuteIso()` beim Rendern (Zeilen 133, 210) |
| `training/sitzung-formular.tsx:42` | Helfer, beim Rendern gerufen |

`[read]` **Alle sechs sind dieselbe Klasse wie meiner** ? und alle
**bestanden vor diesem Auftrag.** `[cmd]` **Nicht angefasst:** sechs
Dateien in drei fremden Modulen zu aendern, waere ein eigener
Auftrag. **Der Waechter meldet sie, ab jetzt sichtbar.**

`[read]` **Der Waechter ist NICHT im Gate** ? er waere sofort rot,
und ein Gate, das an sechs Altlasten haengt, blockiert alles andere.
**Er laeuft auf Zuruf, bis die sechs entschieden sind.**

### A5 ? 1518 -> 1525 Tests, alle gruen

`[cmd]` **tsc** sauber, **Tests 1525 pass / 0 fail**, **encoding
21.085 Dateien sauber.** `[cmd]` **Sieben neue Pruefungen** in
`injektion-karte.test.ts`.

`[cmd]` **Eine eigene Erwartung war falsch und ist berichtigt:** ich
hatte 7 Tage erwartet, gemessen sind **6** ? der Stichtag ist
Mitternacht UTC, die Injektion war um 10:00, dazwischen liegen 6
Tage und 14 Stunden. `[read]` **Die Richtung stimmt:** lieber einen
Tag zu wenig gutschreiben als einen zu viel ? wer zu frueh „bereit"
zeigt, schickt jemanden in eine Stelle, die noch ruht. **Als eigene
Pruefung festgehalten.**

### Punkt 3 ? die drei Kommentarstellen: geprueft, nicht angefasst

`[cmd]` **`tab-compliance.tsx:132` und `:204`, `tab-spec.tsx:521`
nennen `Math.random()` und `Date.now()` nur im Kommentar** ? als
Begruendung, warum sie es NICHT tun. **Mein Waechter zaehlt sie
nicht mit** (Kommentarfilter). **Unveraendert.**

### Neustart

`[read]` **Keiner noetig** ? nur `apps/web/src`.

`[cmd]` **Der Server war waehrend des Auftrags einmal weg**
(`ERR_CONNECTION_REFUSED`, `server.py status`: *„keiner laeuft"*).
**Ich habe ihn nicht gestartet, sondern gewartet** ? er kam von
selbst zurueck, und die Messungen liefen danach.

### Was offen bleibt

**1 ? Der Hydrationsfehler.** `[cmd]` **Eingegrenzt auf
`ansicht.tsx:327`**, die Slotzeile des Tageswechslers ? **eine Zeile,
zweimal reproduziert.** `[read]` **Warum sie hier faellt und in vier
anderen Modulen nicht, ist nicht geklaert.** **Ein eigener Punkt**,
und ich wuerde dort mit dem Portal anfangen: `document.querySelector`
nimmt den ERSTEN Treffer, und `nutrition` hat zwei
`kopf-mitte`-Elemente ? die Zahl je Modul lohnt eine Messung.

**2 ? Die sechs `new Date()` in nutrition und training** (A4). **Der
Waechter meldet sie**, geaendert ist nichts.

**3 ? Der Waechter gehoert erst ins Gate, wenn die sechs entschieden
sind.** `[read]` **Sonst ist er von Tag eins rot** ? und ein rotes
Gate wird umgangen, nicht gelesen.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  new Date() behoben -- der Hydrationsfehler nicht
    A2  11 Reiter, 0 sauber -- zwei Fehler an derselben Stelle
    A3  der Waechter faellt: 6 -> 7 -> 6
    A4  27 Rohtreffer, 11 als Code, 6 zu Recht rot
    A5  1518 -> 1525 gruen

### A1 ist die richtige Trennung

`[read]` **Ich hatte behauptet, `new Date()` sei die Ursache.**

`[cmd]` **Er hat es behoben UND gemessen, dass der Fehler
bleibt.**

> *,,Das sind zwei verschiedene Fehler an derselben Stelle."*

`[read]` **Und er hat KEIN Bildschirmfoto geliefert** ? **weil die
Bedingung *0 Konsolenfehler* nicht erfuellt war.**

> *,,Ich melde das lieber, als ein Bild zu zeigen, das etwas anderes
> beweist."*

### Die Behebung ist besser als mein Auftrag

`[read]` **Ich schrieb: reich den Stichtag durch.**

`[cmd]` **Er hat die Signatur geaendert:** `tageSeitInjektion`
**nimmt jetzt einen `string` statt eines `Date`.**

> *,,Eine Funktion, die keinen Zeitstempel annimmt, kann keinen
> falschen annehmen."*

`[cmd]` **Sie benutzte ohnehin nur `getTime()`** ? **die
Datumszeichenkette genuegt.**

`[read]` **Die Form macht den Fehler unmoeglich, statt ihn zu
beheben.**

### A4 — ein Waechter ueber die Form, nicht ueber eine Liste

`[cmd]` **27 Rohtreffer, davon 16 KOMMENTARE, die vor genau diesem
Fehler warnen.**

`[read]` **Sie mitzuzaehlen haette die Warnung als Verstoss
gemeldet** ? **derselbe Fall wie in G-385, wo der Waechter sein
eigenes Beispiel fand.**

`[cmd]` **Die Form laesst durch:** **Ereignisbehandler, `useEffect`,
Serverkomponente.** `[cmd]` **Rot ist alles beim Rendern einer
Clientkomponente** ? **einschliesslich `useState(() => new Date())`,
dessen Anfangswert auf beiden Seiten laeuft.**

`[read]` **Das ist der Fall, den eine Ausnahmeliste durchgelassen
haette.**

### Und er haelt den Waechter aus dem Gate

`[cmd]` **Sechs vorbestehende Faelle in `nutrition` und
`training`.**

> *,,Ein rotes Gate wird umgangen, nicht gelesen."*

`[read]` **Gemeldet, nicht angefasst** ? **und der Waechter wartet,
bis die sechs entschieden sind.**

### A5 — er hat seine eigene Erwartung berichtigt

`[cmd]` **Er erwartete 7 Tage, es sind 6** ? **Mitternacht UTC
gegen eine Injektion um 10:00.**

> *,,Die Abrundung ist richtig: einen Tag zu wenig gutzuschreiben
> ist sicherer, als jemanden an eine Stelle zu schicken, die noch
> ruht."*

`[read]` **Er hat den Test berichtigt, nicht die Rechnung** ?
**und begruendet, warum die Richtung stimmt.**

### Meine Spur war falsch

`[cmd]` **Ich vermutete `nutrition` habe zwei `v2-kopf-mitte`.**
`[cmd]` **Nachgemessen: genau eines je Modul, in allen sechs.**

`[read]` **Damit faellt seine Erklaerung ueber `querySelector`** ?
**und der Befund geht als G-392 weiter.**

**Abgenommen.**

