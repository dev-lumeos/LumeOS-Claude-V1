---
nr: A-87
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01

braucht: [A-86]
kind_von: A-77

quellen:
  - docs/punkte/erledigt/quer-a-0077-werkzeugtests-liefen-nirgends.md

beruehrt:
  dateien:
    - supabase/_pipeline/kette.json
    - supabase/_pipeline/_validierung/
---

# 46 Zeugen, nach Ursache gestaffelt verdrahten

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

`[cmd]` **G-563:** G-526 sucht den frueheren Kommentar der
ueberschriebenen Zielfunktion.

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

**A4 — die oberflaechenrelevanten roten Aussagen melden**, nicht
entscheiden: Recovery-Kacheln, Activity Stream,
Meal-Plan-Lifecycle und -Slots, aeltere Goals-Zielwertproben.
`[read]` **Die Fachlichkeit dahinter ist in keinem Auftrag entschieden
worden.**

**Zu belegen:** je Gruppe die Entscheidung mit einem Satz Begruendung ·
**je Stapel nur die verdrahteten Proben**, gegen eine Wegwerf-Datenbank,
mit ihrer Laufzeit · die Schrittzahl aus `kette.json` gelesen ·
kein `db push` · nichts committen.

`[read]` **Kein voller Kettenlauf als Nachweis** (00-LIESMICH.md, „Was
ein Auftrag als Nachweis verlangen darf"). Bei A-86 kostete die Arbeit
7,076 s und der verlangte Nachweis 1.300,7 s. **Der volle Lauf laeuft
naechtlich, einmal.**
