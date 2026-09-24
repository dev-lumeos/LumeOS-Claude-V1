---
nr: G-498
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-468
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: e4acf138
beruehrt:
  dateien:
    - packages/ui/src/styles/v2.css
    - apps/web/src/app/v2/supplements/tab-vorlieben.tsx
    - apps/web/src/lib/__tests__/g479-kontraste-in-packages-ui.test.ts
zahlen:
  gemessen: 2026-09-24
---

# G-498 - .v2-hinweis liegt unter 4,5:1

## Befund

Aus G-468, Claude Code, 2026-09-08:

> *,,`.v2-hinweis` traegt ueberall sonst `--fg-dim` und liegt
unter 4,5:1 ? das ist eine `packages/ui`-Aenderung, die alle
vier Module betrifft, also gehoert sie in einen eigenen
Auftrag."*

`[cmd]` **Er hat sie lokal ueberschrieben, nicht global** ?
**richtig, das war nicht sein Auftrag.**

## Dieselbe Sache wie G-479

`[cmd]` **Dort waren es `.v2-dim`, `.v2-eyebrow` und
`.v2-tbl th`: 2,88:1 hell, 2,12:1 dunkel** ? **jetzt 9,19:1
und 7,20:1.**

`[read]` **Die Lehre daraus gilt hier: die KLASSE anheben,
nicht das Token** ? **`--fg-dim` traegt vier Dekorationen, wo
2,88:1 richtig ist.**

`[read]` **Und die zweite: eine Messung an EINEM Thema sagt
nichts ueber das andere.**

## Abnahmebedingungen

    A1  wo wird .v2-hinweis benutzt? Je Modul eine Zahl.
    A2  Fliesstext oder Beiwerk? Je Stelle.
    A3  berichtigt, wo es Text ist -- hell UND dunkel
        gemessen.
    A4  die lokale Ueberschreibung aus G-468 faellt weg,
        wenn sie ueberfluessig wird.
    A5  vier Module: der Unterschied benannt, nicht
        versteckt.
    A6  ein Waechter faengt einen Rueckfall unter 4,5:1.
    A7  apps/web 1982 oder mehr, apps/coach 65.

## Bericht

**Alle sieben Bedingungen erfuellt.** Gemessen 2026-09-24,
`dev@lumeos.app`, Port 3200 und 3220.

**Eine Zeile Aenderung in `packages/ui`, eine geloeschte
Ueberschreibung, eine Zeile im Waechter.**

### A1 -- wo die Klasse benutzt wird

    apps/web/src      42
    apps/coach/src     0
    apps/admin/src     0
    apps/buddy/src     0
    apps/mobile/src    0
    apps/staff/src     0
    packages/ui        2   (die Definition selbst, keine Nutzung)

**Innerhalb von `apps/web`:**

    nutrition      24
    supplements    13
    settings        5

`[cmd]` **Die dichteste Datei:** `nutrition/plans-echt.tsx` mit
sechs.

#### Eine Berichtigung an meiner eigenen Aussage

`[cmd]` **Mein Befund in G-468 sagte *,,alle vier Module"*** ?
**das war aus G-479 uebernommen und nicht gemessen.** `[read]`
**Gemessen sind es ZWEI Anwendungen, die das Blatt ueberhaupt
laden** ? und nur EINE, die die Klasse benutzt.

`[cmd]` **Ein Zaehler ueber `apps/coach` meldete zuerst 9
Treffer** ? **alle in `.next/` und `.next-gate/`, also
Bauartefakte.** `[read]` **Nur `src` zaehlt.**

### A2 -- Fliesstext, keine einzige Dekoration

`[cmd]` **Alle 42 Verwendungen gelesen**, nicht gestichprobt:

    Fehlermeldungen        {fehler}
    Leerhinweise           "Fuer diesen Tag fuehrt der Plan
                            keine Eintraege."
    Erklaersaetze          "Kein Ziel ableitbar -- dafuer fehlt
                            das Koerpergewicht im Profil."
    Zaehlsaetze            "Gezaehlt sind 35 Tage in 5 Wochen."

`[read]` **Keine Trennzeichen, keine Punkte, keine Linien** ?
**der Unterschied zu `--fg-dim`, das vier echte Dekorationen
traegt.**

`[cmd]` **Und sieben Stellen setzten bereits eine eigene Farbe**
(`--neg`, `--pos`): **sie sind der Beleg, dass an der Klasse
vorbeigearbeitet wurde.** `[read]` **Diese sieben bleiben** ?
sie tragen eine BEDEUTUNG (Fehler, Bestaetigung), keine
Notloesung fuer den Kontrast.

### A3 -- berichtigt, beide Themen gemessen

    .v2-hinweis      color: var(--fg-dim)  ->  var(--fg-muted)
    .v2-hinweis strong  var(--fg-muted)    ->  var(--fg)

**Gemessen am Schirm (`tools/_g498-kontrast.mjs`, 1x1-Canvas),
drei Module, beide Themen:**

                     vorher hell  vorher dunkel  nachher
    nutrition            2,88:1       2,12:1     9,19 / 7,20
    settings             2,88:1       2,12:1     9,19 / 7,20
    settings (2)         2,76:1       2,32:1     8,79 / 7,86
    supplements          8,79:1       7,86:1     unveraendert

`[cmd]` **VORHER: 10 von 12 Messungen unter 4,5:1.**
`[cmd]` **NACHHER: 0 von 32 Messungen unter 4,5:1.**

`[read]` **Die Zahl der Messungen steigt**, weil nachher mehr
Flaechen einbezogen wurden ? **die Untergrenze gilt fuer alle.**

#### Warum `strong` mitmusste

`[cmd]` **`.v2-hinweis strong` trug `--fg-muted`** ? **genau die
Farbe, die der Rumpf jetzt hat.** `[read]` **Eine Hervorhebung in
der Farbe ihres Umfelds hebt nichts hervor.**

`[cmd]` **Zehn Verwendungen gemessen**, jetzt `--fg`:

    Rumpf         9,19:1 hell   7,20:1 dunkel
    Hervorhebung 18,11:1 hell  16,44:1 dunkel

`[read]` **Dieselbe Staffelung wie bei `.v2-empty strong` zwei
Regeln darueber** ? nicht erfunden, abgeschaut.

**Fotos:** `backup/x-g498-light.png`, `backup/x-g498-dark.png`

### A4 -- die oertliche Ueberschreibung ist weg

`[cmd]` **In `supplements/tab-vorlieben.tsx` stand
`style={{ color: 'var(--fg-muted)' }}`** ? **entfernt.**

`[read]` **Der Beleg, dass sie ueberfluessig wurde, steht in der
Messung:** die Supplements-Zeile zeigt **vorher wie nachher
8,79 / 7,86** ? **derselbe Wert, jetzt aus der Klasse statt aus
dem Element.**

`[cmd]` **Die sieben anderen Ueberschreibungen bleiben** ? sie
setzen `--neg` und `--pos`, und das ist eine Aussage, keine
Umgehung.

### A5 -- der Unterschied zwischen den Anwendungen

`[read]` **Der Auftrag sagt *,,vier Module"*. Gemessen sind es
zwei ? und nur eine ist betroffen.**

    apps/web     laedt v2.css, 42 Verwendungen   SICHTBAR GEAENDERT
    apps/coach   laedt v2.css,  0 Verwendungen   Regel reist mit,
                                                 Wirkung nicht
    admin/buddy/mobile/staff  laden v2.css nicht  unberuehrt

`[cmd]` **Am Coach-Portal (3220) nachgesehen:** das Blatt traegt
`.v2-hinweis { color: var(--fg-muted) }`, **und null Elemente
benutzen sie.** `[read]` **Also: die Aenderung erreicht das
Portal, veraendert dort aber nichts.**

`[read]` **Das ist der Unterschied, den A5 benannt haben will** ?
**nicht *,,vier Module betroffen"*, sondern eine Anwendung
geaendert, eine erreicht ohne Wirkung, vier gar nicht.**

### A6 -- der Waechter

`[cmd]` **Kein neuer** ? `g479-kontraste-in-packages-ui.test.ts`
**stellt genau diese Frage schon**, und die Klasse ist dort
dazugestellt:

    ['.v2-hinweis', /\.v2-hinweis\s*\{[^}]*color:\s*var\(--([a-z-]+)\)/]

`[read]` **Zwei Waechter fuer eine Sache laufen irgendwann
auseinander.**

`[cmd]` **Er rechnet je Klasse den Kontrast gegen BEIDE
Grundfarben** und verlangt 4,5:1 zweimal ? **eine Messung an
einem Thema sagt nichts ueber das andere.**

#### Die Sabotageprobe

`[cmd]` **Drei Schaeden, drei Mal ROT, Kontrolle vorher UND
nachher gruen:**

    .v2-hinweis zurueck auf --fg-dim        ROT
    .v2-hinweis auf --fg-subtle             ROT
    das TOKEN --fg-dim angehoben            ROT

`[read]` **Der dritte ist der wichtige** ? **er faengt genau den
Fehler, vor dem der Auftrag warnt:** das Token anzuheben statt
der Klasse. `[cmd]` **Der Waechter prueft dafuer, dass `--fg-dim`
seinen Wert BEHAELT und weiter Hintergruende traegt.**

`[cmd]` **Und `--fg-subtle` faellt, obwohl es hell 4,87:1
misst** ? **dunkel sind es 3,98.** `[read]` **Die zweite Lehre,
als Probe.**

### A7 -- die Waechter

    apps/web      1.982 Proben, 0 rot   (verlangt: 1.982 oder mehr)
    apps/coach       65 Proben, 0 rot
    tsc                 sauber
    eslint              sauber

`[read]` **Keine neue Probe noetig** ? die vorhandene deckt die
neue Klasse mit ab, und die Zahl bleibt deshalb gleich.

### Zwei eigene Ungenauigkeiten, berichtigt

`[cmd]` **Erstens: *,,alle vier Module"*** ? aus G-479
uebernommen, nie gemessen. **Gemessen: eine Anwendung benutzt die
Klasse.** `[read]` **Eine Zahl aus einem anderen Auftrag ist
keine Messung.**

`[cmd]` **Zweitens: im Waechterkommentar stand zuerst *,,sie
stand zweieinhalb Jahre auf demselben Wert"*** ? **geschaetzt.**
`[cmd]` **Gemessen ueber `git log -S`: die Klasse kam am
2026-08-16 herein (`abffc77f`)**, also fuenf Wochen. `[read]`
**Berichtigt, bevor sie die naechste Falschaussage wird.**

### Neustart

`[cmd]` **Nicht noetig gewesen** ? `packages/ui` wurde geaendert,
**aber die CSS ist heiss nachgeladen:** die Messung nach der
Aenderung zeigte sofort 9,19:1 ohne Zutun.

`[read]` **Die Regel aus CLAUDE.md nennt `packages/ui` als
Neustartgrund** ? **das gilt fuer Bausteine, die die Schale
einmal laedt.** `[cmd]` **Fuer eine reine Stilaenderung gilt es
nachweislich nicht** ? gemessen, nicht angenommen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`.v2-hinweis` steht auf `--fg-muted`,
`.v2-hinweis strong` auf `--fg`.**

    vorher   10 von 12 Messungen unter 4,5:1
             2,88 hell / 2,12 dunkel
    nachher   0 von 32
             9,19 / 7,20, strong 18,11 / 16,44

`[cmd]` **Proben: web 1982/1982, coach 65/65.**

### Er hat alle 42 gelesen, nicht gestichprobt

> *,,Jede einzelne ist Fliesstext (Fehlermeldungen,
Leerzustaende, Erklaerungen), keine Dekoration; sieben
Aufrufstellen ueberschrieben die Farbe bereits mit
`--neg`/`--pos` ? ein Beleg, dass Leute um die Klasse
herumgearbeitet haben."*

`[read]` **Die Umgehungen waren der Beweis, dass die Klasse
falsch war.**

### Zwei eigene Aussagen berichtigt

> *,,Mein G-468-Befund sagte *betrifft alle vier Module* ? die
Zahl kam aus G-479, und ich habe sie NIE gemessen."*

`[cmd]` **Gemessen: 42 Stellen, alle in `apps/web` (nutrition
24, supplements 13, settings 5).**

> *,,Eine erste Zaehlung zeigte 9 Treffer in coach ? alle
Bauartefakte unter `.next/`."*

> *,,Ich schrieb *zweieinhalb Jahre* in einen
Waechterkommentar, bevor ich mass; `git log -S` sagt: die
Klasse kam am 2026-08-16, vor fuenf Wochen."*

`[read]` **Zwei Zahlen aus dem Gefuehl, beide selbst gefunden
und berichtigt.**

### A6: den bestehenden Waechter erweitert

`[read]` **Statt einen zweiten fuer dieselbe Frage zu bauen** ?
**genau die drei Kopien, die er in G-492 aufgeloest hat.**

`[cmd]` **Drei Sabotagen, darunter die wichtigste: das TOKEN
anheben statt der Klasse.**

### Und eine Regel gemessen statt behauptet

> *,,Der laufende Server liefert die neuen Werte ? kein
Neustart noetig, obwohl `packages/ui` sich aenderte. Die
Neustartregel gilt fuer Bauteile, nicht fuer reines CSS."*

**Abgenommen.**

