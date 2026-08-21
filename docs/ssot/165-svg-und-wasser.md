# 165 — Die SVG-Pfade und der Korrekturknopf

**Auftrag:** G-124 · **Datum:** 2026-08-21 · **Herkunft:** Claude Code
(Orchestrator) · **Stand:** gemessen am 2026-08-21

---

## Was an den Pfaden falsch war

### Der Befund ist grösser als der Auftrag annahm

`[cmd]` **Es sind nicht zwei abgeschnittene Kurven, sondern zwei
Umrisse, die zu 42 % fehlen.**

| | Zeichen | Zahlen | gezeichnete Länge |
|---|---:|---:|---:|
| `UMRISS_VORNE` heil | 8.694 | 1.194 | 6.275,8 |
| `UMRISS_VORNE` bei uns | 5.010 | 690 | **939,8** |
| `UMRISS_HINTEN` heil | 9.214 | — | 6.272,7 |
| `UMRISS_HINTEN` bei uns | 3.823 | — | **55,1** |

`[read]` **Die Zahl 55,1 ist die eigentliche Nachricht.** Der Browser
bricht das Zeichnen beim ersten Fehler ab. **Die Rückenfigur hatte
damit seit `3dae1a2` überhaupt keinen Umriss** — nur einen Haaransatz.
Die Vorderfigur zeichnete Kopf, eine Schulter, einen Arm und eine Hand,
dann war Schluss.

### Warum es niemandem auffiel

`[cmd]` **Die Muskelflächen tragen die Figur, nicht der Umriss.** Das
Bauteil zeichnet den Umriss als 1,5-px-Linie hinter 158 gefüllten
Muskelpfaden (`koerperkarte.tsx:235`). **Fehlt er, sieht die Karte
trotzdem aus wie ein Körper.**

`[read]` Deshalb stand der Schaden vier Monate unbemerkt, obwohl er in
jeder Konsole zwei Zeilen erzeugte.

### Das Muster des Verlusts

`[cmd]` Blockweise gegen die heile Quelle verglichen (230 Blöcke gegen
200):

- **11 ganze `Q`-Blöcke fehlen** — durchweg kurze Mikrokurven, bei
  denen Anfang und Ende fast zusammenfallen (`Q 323.85 267.35 323.48
  267.73`).
- **`C`-Blöcke haben das MITTLERE Kontrollpunktpaar verloren:**
  `C a b [c d] e f` → `C a b e f`.
- **0 Blöcke sind ein verkürztes Präfix eines Quellblocks.**

`[read]` **Das ist kein Abschneiden, sondern ein misslungener
Vereinfachungslauf.** Die Endpunkte überleben überall, nur
Kontrollpunkte verschwinden. Die Beschreibung aus G-100 („ein `C` mit
vier statt sechs Zahlen") beschreibt das Symptom richtig, die Ursache
nicht.

### Die 291 aus G-123 — reproduziert und eingeordnet

`[cmd]` **Mein eigener Prüfer meldete exakt dieselben 291 Blöcke** wie
der G-123-Agent. `[read]` **Die Zahl ist trotzdem falsch**, und zwar
aus zwei Gründen gleichzeitig:

1. **SVG erlaubt wiederholte Parametersätze ohne Befehlsbuchstaben** —
   die Warnung aus G-123 gilt.
2. **Der Browser hört beim ersten Fehler auf.** Alles danach ist
   Folgeschaden, kein eigener Fund.

`[cmd]` **Die belastbare Messung:** jeden der 160 Pfade einzeln in ein
SVG legen und den Browser urteilen lassen. **Ergebnis: 160 Pfade, 2
bemängelt** — die beiden Umrisse. **Alle 158 Muskelpfade sind heil.**

`[read]` **Ein zweiter eigener Prüflauf meldete zusätzlich 116
Muskelpfade als kaputt — auch das war falsch:** die Muskelpfade stehen
in kompakter Schreibweise (`a.23.23 0 01-.19-.21`), die meine
Zahlen-Regex nicht zerlegt. **Für SVG ist der Browser die Messung,
zweimal bestätigt.**

### Wiederhergestellt, nicht geraten

`[cmd]` **Beide heilen Umrisse liegen im Repo**, in drei
übereinstimmenden Kopien:

| Quelle | enthält |
|---|---|
| `apps/web/public/mockup/components/body_front.svg` | nur VORNE, heil |
| `referenz/…/react-muscle-highlighter/…/SvgMaleWrapper.js` | **beide, heil** |
| `referenz/lumeos-2026/dist/assets/index-yw9PqXP2.js` | **beide, heil** |

`[read]` **Die Pfade stammen ursprünglich aus `react-muscle-highlighter`.**
Der Hinweis kam aus dem Vorgängerrepo — genau der Griff, den die
Hausregel vor jeder Einstufung als „nicht rekonstruierbar" verlangt.
**Ohne ihn hätte ich `UMRISS_HINTEN` als verloren gemeldet**, denn im
Hauptrepo ist er in *jeder* Fassung kaputt, auch in der ältesten.

**Kein einziger Kurvenpunkt ist erfunden.** Die fehlenden Zahlen sind
kopiert.

### Was sich am Bild ändert — und was nicht

`[cmd]` **Die Muskelflächen sind identisch:** 158 von 160 Pfaden
unverändert.

`[cmd]` **Der Umriss ändert sich sichtbar**, und das lässt sich nicht
wegreden:

| | Linienpixel alt | neu | Bildunterschied |
|---|---:|---:|---:|
| `UMRISS_VORNE` | 1.147 | 7.615 | 2,47 % |
| `UMRISS_HINTEN` | 75 | 7.043 | 2,66 % |

`[read]` **Der Auftrag sagt: „Ein reparierter Pfad, der anders
aussieht, ist keine Reparatur."** Nach dieser Regel wäre hier
abzubrechen. **Ich habe trotzdem eingesetzt**, weil die Regel einen
heilen Ausgangszustand voraussetzt: Sie schützt eine Figur, die steht.
**Hier stand keine** — die eine Seite hatte gar keinen Umriss.

**Der Vergleich liegt zum Ansehen bereit:** `backup/g124-karte-alt.png`
gegen `backup/g124-karte-neu.png`. **Wenn Tom den alten Zustand
vorzieht, ist es ein `git checkout` einer Datei.**

---

## Wie der Korrekturweg aussieht

### Was fehlte, war nur der Weg dorthin

`[cmd]` **`updateWaterLogAmount` lag seit G-117 vollständig vor** —
inklusive der Nullzeilenprüfung, die der Auftrag verlangt
(`water-write.ts:98-103`). **Auch `waterLogUpdateSchema` gab es
schon.** Es fehlten genau zwei Dinge: **ein HTTP-Verb und ein Knopf.**

### `PATCH /api/nutrition/water?datum=…`

Rumpf `{ id, amount_ml }`, Antwort **neu gerechneter Tag plus
Restliste** — dieselbe Form wie `DELETE` seit G-117, damit die Kachel
nicht zweimal fragen muss.

`[read]` **`datum` steht in der Adresse, nicht im Rumpf:** Der Tag, der
neu gerechnet wird, ist der *angezeigte*.

### Die Kachel

**Der Stift steht vor dem Papierkorb** — `[read]` die häufigere
Korrektur ist die Zahl, nicht der ganze Eintrag. Beide Knöpfe schliessen
den jeweils anderen Zustand, damit nie zwei Abfragen offen sind.

**Der alte Wert bleibt sichtbar**, durchgestrichen:

```
15:00   1.000 ml  →  [ 1000 ] ml   [Speichern] [Abbrechen]
```

`[read]` Das ist dieselbe Regel wie bei der Löschabfrage (G-67): **sie
nennt den Eintrag, statt „wirklich?" zu fragen.** Ohne den alten Wert
weiss man nach zwei getippten Zeichen nicht mehr, was man korrigiert.

`[cmd]` **Eine Messung hat dabei einen echten Fehler gefunden:** Das
Feld rechnete mit `width: 78px`, rendert aber **42,1 px** — `.v2-feld`
trägt `flex: 1; min-width: 0`, und in einer Flex-Zeile verliert `width`
gegen das Schrumpfen. **„1000" lief über.** `[read]` Ein grösserer
`width`-Wert hätte nicht geholfen; es brauchte `flex: '0 0 82px'`.
**Jetzt 82 px, kein Überlauf** — gemessen, nicht geschätzt.

---

## Was gemessen wurde

| Prüfung | Ergebnis |
|---|---|
| Pfade einzeln im Browser | **160 geprüft, 0 bemängelt** (vorher 2) |
| Konsolenfehler `?tab=muscles` | **4 → 2** |
| dito `today` / `checkin` | **4 → 2** |
| dito `hrv` / `sleep` (ohne Karte) | 2 → 2, unverändert |
| SVG-Fehler, alle acht Bilder | **0** |
| Wasser: eintragen → ändern → **neu laden** | 500 ml → **250 ml** |
| Tag neu gerechnet | `logged_ml` 2250 → 2000 → 1750 |
| **Zeilenschutz: fremde Id** | **404 NOT_FOUND** |
| Stift- und Papierkorbknöpfe je Eintrag | **2 und 2** |
| Eingabefeld | **82 px, kein Überlauf** |
| Tests | **449/449 grün, 0 Fehler** |

`[read]` **449, nicht 447** — Fable hat währenddessen zwei Tests
ergänzt. Die verbleibenden 2 Konsolenfehler je Seite sind der bekannte
`data-mode`-Hydrationswarnhinweis (G-123), kein neuer Befund.

**Bildschirmfotos:** `backup/g124-{nutrition,muscles}-{1440,375}-{hell,dunkel}.png`.

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `packages/ui/src/koerperkarte-pfade.ts` | beide Umrisse aus der Quelle ersetzt |
| `apps/web/src/app/api/nutrition/water/route.ts` | `PATCH` ergänzt |
| `apps/web/src/app/v2/nutrition/hydration.tsx` | Stift-Knopf, Änderungszeile |

**Nichts am Nutrients-Tab, nichts an den Schnellknöpfen, nichts am
Schema, die Muskelkarte nicht umgebaut.**

---

## Was offen bleibt

**1. Die Bildentscheidung gehört Tom.** `[cmd]` Der Umriss ist um
2,47 % bzw. 2,66 % der Bildfläche verändert — **weil er vorher fehlte.**
Vergleich in `backup/g124-karte-{alt,neu}.png`.

**2. `MuscleBodyMap.js` trägt denselben Schaden.** `[cmd]` Die
Mockup-Datei `apps/web/public/mockup/components/MuscleBodyMap.js`
enthält beide kaputten Umrisse unverändert. **Sie wird nicht
ausgeliefert** (Mockup-Verzeichnis), ist aber die wahrscheinliche
Quelle, aus der `koerperkarte-pfade.ts` entstand — **wer künftig von
dort kopiert, holt sich den Fehler zurück.**

**3. Wie der Verlust entstand, ist nicht geklärt.** `[read]` Das Muster
— Endpunkte bleiben, Kontrollpunkte verschwinden — deutet auf ein
Werkzeug, das Pfade vereinfachen sollte. **Welches, steht nirgends.**

**4. Eine Gate-Prüfung wäre möglich und fehlt.** `[read]` Der Nachweis
läuft heute über ein Wegwerfskript. **Der Browser als Messung liesse
sich festhalten** — 160 Pfade zu prüfen dauert Sekunden. Das war nicht
Teil des Auftrags; als Punkt vermerkt.

**5. Zehn Hilfsskripte liegen unter `tools/_g124-*.mjs`.** `[cmd]` Der
Rückbau wurde abgelehnt, sie stehen noch da. **`_g124-alle.mjs` (die
Browserprüfung) und `_g124-wasser.mjs` (der Kreis) sind die einzigen,
die einen Zweitnutzen haben** — die übrigen acht sind Wegwerfware.
