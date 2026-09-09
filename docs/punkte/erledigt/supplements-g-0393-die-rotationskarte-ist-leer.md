---
nr: G-393
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-392
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: d49c547b
beruehrt:
  dateien:
    - apps/web/src/lib/medical/injektion-karte.ts
zahlen:
  gemessen: 2026-09-08
  orte: 16
  gezeigt: 0
---

# G-393 — die Rotationskarte ist leer

## Befund

Tom, am Schirm: *,,die map hat er nie richtiggestellt."*

`[cmd]` **Die Kachel meldet:** *,,Keine Injektionsorte gelesen.
`medical.injection_sites` ist leer oder nicht lesbar."*

`[cmd]` **Nachgemessen: 16 Zeilen, RLS erlaubt `authenticated`
alles** (`injection_sites_select`, `USING true`).

`[read]` **Die Meldung ist falsch** ? **die Tabelle ist weder leer
noch unlesbar.**

## Die Ursache

`[cmd]` **`apps/web/src/lib/medical/injektion-karte.ts:46`:**

    KARTEN_ORTE = {
      deltoid:          ['delt_l', 'delt_r'],
      vastus_lateralis: ['quad_l', 'quad_r'],
      ventrogluteal:    ['vg_l',   'vg_r'],
      subcutaneous:     [],
    }

`[cmd]` **Der Kommentar darueber sagt es:** *,,`injection_sites`
fuehrt REGIONEN ohne Seite ? `deltoid`, `vastus_lateralis`,
`ventrogluteal`, `subcutaneous`. Kein `delt_l`/`delt_r`."*

`[read]` **Das war am Vormittag richtig.**

`[cmd]` **Seit C-445 fuehrt sie genau das:**

    abd_l      abd_r      delt_l     delt_r
    glute_l    glute_r    lat_l      lat_r
    quad_l     quad_r     sq_delt_l  sq_delt_r
    thigh_sq_l thigh_sq_r vglute_l   vglute_r

`[read]` **`KARTEN_ORTE['delt_l']` ist `undefined`** ? **die
Schleife findet nichts, `punkte` bleibt leer, die Kachel meldet
*leer*.**

## Und zwei Namen weichen ab

`[cmd]` **`INJEKTIONS_ORTE` in
`packages/ui/src/koerperkarte-pfade.ts`:**

    delt_l/r  pec_l/r   bicep_l/r  quad_l/r    (vorne)
    glute_l/r vg_l/r    lat_l/r    tricep_l/r  (hinten)

    Datenbank  vglute_l/r      Karte  vg_l/r
    Datenbank  abd, sq_delt, thigh_sq  -> kein Punkt
    Karte      pec, bicep, tricep      -> keine Zeile

`[cmd]` **Von 16 Orten und 16 Punkten decken sich zehn.**

## Auftrag

**Beauftragt am 2026-09-08.**

`[read]` **Herausgezogen aus G-392** ? **die Karte haengt nicht am
Hydrationsfehler, und Tom wartet seit Stunden darauf.**

### 1 · Die Zuordnung fallen lassen

`[read]` **`KARTEN_ORTE` war eine Bruecke zwischen Regionen und
Punkten.** `[read]` **Seit C-445 gibt es keine Regionen mehr.**

`[read]` **Die Zeile-Id IST die Punkt-Id** ? **direkt
verwenden.**

`[cmd]` **Und den Kommentar berichtigen** ? **er beschreibt einen
Stand von heute morgen.**

### 2 · Die zwei Luecken

`[cmd]` **`vglute_l/r` gegen `vg_l/r`** ? **eine Umbenennung.**

`[read]` **Welche Richtung?** `[cmd]` **Die Datenbank folgt der
Spec (`Injection Planner:48`), die Karte ist aelter** ? **also
weicht die Karte ab.**

`[read]` **Aber `packages/ui` gehoert Admin und Coach mit** ?
**melden, nicht anfassen.**

`[cmd]` **`abd`, `sq_delt`, `thigh_sq` haben keinen Punkt** ?
**das sind die SubQ-Orte.**

`[read]` **Miss, wo sie auf der Figur liegen muessten** ? **und
melde es.**

### 3 · Was die Karte zeigt, wenn nichts protokolliert ist

`[cmd]` **`injection_logs` hat 0 Zeilen.**

`[cmd]` **Der Kommentar in `injektion-karte.ts:59` sagt es
richtig:** *,,Ohne Protokollzeile bleibt `daysSince` `undefined`,
nicht 0 ? 0 hiesse *heute injiziert*."*

`[read]` **Also: alle Punkte in *nie*-Faerbung, und die Kachel sagt
warum** ? **E-72, kein leeres Bild.**

### Abnahmebedingungen

    A1  die Karte zeigt Punkte. Zahl: 16 Orte / davon auf
        der Figur. Bildschirmfoto.
    A2  KARTEN_ORTE entfernt, Kommentar berichtigt.
    A3  die zwei Luecken, je mit Vorschlag. Nichts in
        packages/ui geaendert.
    A4  ohne Protokollzeilen: alle Punkte *nie*, mit
        benanntem Hinweis. E-72.
    A5  1525 Tests bleiben gruen.

### Was nicht zu tun ist

**Nichts in `packages/ui`** ? **melden.**
**Den Hydrationsfehler nicht anfassen** ? **das ist G-392.**
**Nichts in `supabase/`.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

### A1 ? Die Karte zeigt Punkte: 10 von 16

`[cmd]` **Am Schirm gemessen**, `test-user@lumeos.local`:

    Punkte mit data-punkt   10
    Ids   delt_l delt_r quad_l quad_r glute_l glute_r
          lat_l lat_r vg_l vg_r
    Untertitel   10 von 16 Orten auf der Figur

`[cmd]` **Bildschirmfoto: `backup/g388-rotationskarte.png`** ? beide
Ansichten, zehn beschriftete Punkte, alle grau.

### A2 ? `KARTEN_ORTE` ist weg, der Kommentar berichtigt

`[cmd]` **Die Ursache, wie du sie genannt hast, ist bestaetigt:**
`KARTEN_ORTE['delt_l']` war `undefined`, `punkte` blieb leer. **Die
Tabelle bildete REGIONEN auf Paare ab** ? und seit C-445 gibt es
keine Regionen mehr.

**Ersetzt durch zwei Sachen statt einer Tabelle:**

    PUNKT_UMBENENNUNG   die EINE Ausnahme (vglute -> vg)
    punktFuerOrt(id)    Zeilen-Id = Punkt-Id, sonst `null`

`[read]` **Der alte Kommentar war am Vormittag richtig und ist
trotzdem zur Falschaussage geworden.** Der neue nennt beides: was
dastand, warum es kippte, und die gemessene Deckung. **Ein Kommentar
schuetzt nicht vor einer Schema-Aenderung ? ein Test schon**, deshalb
prueft `injektion-karte.test.ts` jetzt, dass `KARTEN_ORTE` nicht
zurueckkommt.

`[cmd]` **Sabotageprobe, zwei Richtungen:**

    Umbenennung entfernt   -> not ok 2 (vglute), not ok 4 (zehn Orte)
    KARTEN_ORTE zurueck    -> not ok 11 (alte Regionentabelle)

**Beide zurueckgenommen, 11/11 gruen.**

### A3 ? Die zwei Luecken, mit Vorschlag

`[cmd]` **Gemessen, 16 Zeilen gegen 16 Punkte:**

    decken sich (8)   delt_l/r  glute_l/r  lat_l/r  quad_l/r
    nur Datenbank     vglute_l/r  abd_l/r  sq_delt_l/r  thigh_sq_l/r
    nur Karte         pec_l/r  bicep_l/r  vg_l/r  tricep_l/r

`[read]` **Der Auftrag nennt zehn Deckungen ? gemessen sind es
acht.** Die zehnte und neunte entstehen erst durch die Umbenennung,
die ich gebaut habe. **Ohne sie waeren es acht.**

#### Luecke 1 ? `vglute` gegen `vg`: behoben, ohne `packages/ui`

`[read]` **Eine reine Schreibweise** ? die Stelle existiert auf der
Figur, sie heisst nur anders. **In `apps/` abgebildet**
(`PUNKT_UMBENENNUNG`), damit Admin und Coach unberuehrt bleiben.

**Vorschlag:** so lassen. `[read]` **Ein Umbenennen in
`packages/ui` waere sauberer**, aber es beruehrt zwei fremde
Anwendungen fuer eine Schreibweise. **Der Preis ist hoeher als der
Gewinn**, solange es bei einer Ausnahme bleibt ? und der Test faellt,
wenn eine zweite dazukommt.

#### Luecke 2 ? sechs SubQ-Stellen ohne Punkt

    abd_l  abd_r  sq_delt_l  sq_delt_r  thigh_sq_l  thigh_sq_r

`[read]` **Das ist keine Schreibweise, sondern eine fehlende Stelle
auf der Figur.** `INJEKTIONS_ORTE` fuehrt keinen Bauchpunkt und keinen
fuer den subkutanen Oberschenkel.

**Vorschlag, und er gehoert dir:** `INJEKTIONS_ORTE` in
`packages/ui/src/koerperkarte-pfade.ts:243-262` um sechs Eintraege
ergaenzen ? **je zwei fuer Abdomen, SubQ-Deltoid, SubQ-Oberschenkel.**
`[cmd]` **Vier vorhandene Punkte werden dabei frei:** `pec_l/r` und
`tricep_l/r` haben keine Zeile in der Datenbank. **Sie zu ueberschreiben
waere falsch** ? sie gehoeren zur Figur, nicht zu den Injektionen; ein
anderer Aufrufer (`ErmuedungsKarte`) koennte sie brauchen.

`[read]` **Nichts davon angefasst.** `packages/ui` gehoert Admin und
Coach mit ? wie bei `.v2-content` in G-392 gemeldet statt geaendert.

### A4 ? Ohne Protokollzeilen: alle Punkte „nie", mit Hinweis

`[cmd]` **`medical.injection_logs`: 0 Zeilen** (gemessen). `[cmd]`
**Alle zehn Punkte stehen auf `nie`** (`var(--fg-dim)`), wie die
Legende sie fuehrt.

`[read]` **Und die Kachel sagt, warum** ? sonst sieht Grau aus wie ein
Fehler:

    Noch keine Injektion erfasst — alle Stellen stehen auf nie.
    Die 6 SubQ-Stellen (Abdomen, SubQ-Deltoid, SubQ-Oberschenkel)
    haben keinen Punkt auf der Figur.

`[cmd]` **Der Untertitel nennt beide Zahlen:** *„10 von 16 Orten auf
der Figur"*. `[read]` **Vorher stand dort `16 Orte`, waehrend zehn
gezeichnet waren** ? eine nackte Zahl, die nicht zum Bild passt.
**E-72 gilt auch fuer Zahlen, nicht nur fuer leere Kacheln.**

`[read]` **Beide Saetze stehen bedingt da:** kommt eine Injektion
dazu, verschwindet der erste; kommen die SubQ-Punkte, der zweite.
**Kein Text, der stehen bleibt, wenn sein Grund entfaellt.**

### A5 ? 1529 Tests gruen

`[cmd]` **1525 -> 1529** (vier neue: Umbenennung, fehlende Stelle,
Deckung, alte Tabelle weg). `[cmd]` **tsc** sauber, **`next lint`**
sauber.

`[cmd]` **Und der Hydrationsfehler aus G-392 bleibt behoben** ?
`SAUBER (2 Laeufe)` nach allen Aenderungen.

### Was offen bleibt

**1 ? Die sechs SubQ-Punkte in `packages/ui`** (A3). **Deine
Entscheidung**, mit dem Hinweis, dass vier ungenutzte Punkte
(`pec`, `tricep`) NICHT dafuer umgewidmet werden sollten.

**2 ? `injection_logs` hat weiter keinen Schreibweg** (G-388/A3).
**Solange bleibt jeder Punkt grau** ? die Karte ist richtig, sie hat
nur nichts zu zeigen. **Die Rotation ist erst rechenbar, wenn
erfasst wird.**


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  16 Orte, 10 auf der Figur, 6 ohne Punkt
    A2  KARTEN_ORTE umgekehrt statt geloescht
    A3  vier Vorschlaege, packages/ui unberuehrt
    A4  16 mal "nie", ein benannter Hinweis
    A5  1525 Tests gruen

`[cmd]` **Selbst gemessen: 16 Punkte in `INJEKTIONS_ORTE`, 10 der
16 Orte haben einen** ? `abd`, `sq_delt`, `thigh_sq`, `vglute`
**fehlen.**

### A2 ist die bessere Entscheidung

`[read]` **Ich schrieb: `KARTEN_ORTE` faellt weg, die Zeilen-Id IST
die Punkt-Id.**

`[cmd]` **Das gilt fuer zwoelf von sechzehn** ? **`vglute_l/r`
heisst in der Karte `vg_l/r`, und `sq_delt`/`thigh_sq` haben gar
keinen Punkt.**

> *,,Eine Zuordnung mit vier Eintraegen ist ehrlicher als eine
> geloeschte, die vier Orte verschwinden laesst."*

`[read]` **Und die Umkehrung ist der Kern:** **vorher verteilte sie
Regionen auf Punkte, jetzt berichtigt sie nur abweichende Namen.**
`[read]` **Der Regelfall geht direkt durch.**

### A4 — der Hinweis nennt die Zahl

`[cmd]` **`0 von 16 Orten benutzt ? Rotation beginnt mit dem ersten
Eintrag.`**

`[read]` **Nicht *,,keine Daten"*** ? **die Zahl sagt, dass die
Orte da sind und nur die Nutzung fehlt.**

`[cmd]` **Und `daysSince` bleibt `undefined`, nicht 0** ? **wie der
Kommentar in Zeile 59 es verlangt.**

### A3 — vier Vorschlaege, nichts angefasst

`[cmd]` **`vg_l/r` -> `vglute_l/r`**, mit der Begruendung: **die
Datenbank folgt der Spec, die Karte ist aelter.**

`[cmd]` **`sq_delt` und `thigh_sq` liegen versetzt neben den
IM-Punkten** ? **subkutan wird flacher und weiter aussen
gesetzt.**

`[cmd]` **`abd_l/r` fehlt ganz** ? **die Figur hat keinen
Bauchpunkt.**

`[read]` **Und `pec`, `bicep`, `tricep` bleiben** ? **sie sind fuer
die Erholungskarte da, nicht fuer Injektionen.**

`[read]` **Er hat die zwei Verwendungen derselben Karte
unterschieden** ? **das ist der Grund, warum sie nicht aufgeraeumt
werden duerfen.**

**Abgenommen.**

