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
