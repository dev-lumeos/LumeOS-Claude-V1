---
nr: C-149
typ: blocker
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-91
kinder: []
agent: codex
beauftragt: 2026-08-28
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-149 - Vitamin D in IU gegen µg

## Befund

(neu 2026-08-20). Befund aus
  G-91.

  `[cmd]` **Naiv addiert: 33.430 % statt rund 930 %** — **Faktor 40.**
  Supplement in IU, Mikro-Pfad in µg.

  `[cmd]` **Ein Umrechnungsfaktor liegt nirgends im Repo, auch nicht im
  Vorgaengerrepo.** Betroffen ist **genau eine von 11 Zeilen.**

  `[read]` **Nicht gesetzt** — *„das waere die Zahl ohne Beleg."*
  **Richtig: 1 µg Vitamin D3 sind 40 IU, aber der Faktor gehoert
  belegt, nicht aus dem Kopf.**

  `[cmd]` **Und der halbe Blocker ist weg:**
  `nutrition.micronutrient_snapshot` hat 8 echte Zeilen, **7 der 8 Codes
  kommen in `nutrients_provided` vor.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Die Zahlen im Befund
sind vom 20.08. und ungeprueft.**

`[read]` **Und der Befund selbst ist zu pruefen, nicht zu glauben.**
`[cmd]` Vier Auftraege sind in den letzten zwei Tagen an ihrer eigenen
Praemisse gescheitert; **einen Defekt habe ich behauptet, den es nicht
gab.**

### Warum das kein Detail ist

`[read]` **Vitamin D ist fettloeslich und kumuliert.** Eine Bilanz,
die 33.430 Prozent statt 930 anzeigt, ist nicht nur falsch — **sie
ist in der Richtung falsch, die zu Unterdosierung fuehrt**, wenn
jemand daraufhin absetzt.

`[read]` **Und der Fehler ist der von heute, in anderer Gestalt:**
zwei Zahlen mit demselben Namen und verschiedener Einheit werden
addiert. `[cmd]` **Genau wie `count_risk_flag_gte` Schluessel statt
Werte zaehlte.**

### Zu tun

**Zuerst messen, wie gross das Problem heute ist.** `[read]` Der
Befund nennt *,,genau eine von 11 Zeilen"* — **das war vor acht
Tagen.** **Welche Naehrstoffe tragen heute Werte in zwei Einheiten?**
`[read]` **Nicht nur Vitamin D** — Vitamin A, E und Folat haben
dieselbe Klasse Problem (IE gegen µg, DFE gegen µg).

**Dann den Umrechnungsfaktor belegen, nicht setzen.** `[read]` **Der
Befund sagt es selbst:** *,,1 µg Vitamin D3 sind 40 IU, aber der
Faktor gehoert belegt, nicht aus dem Kopf."*

`[read]` **Wo der Beleg herkommt, ist deine Entscheidung** — DGE,
EFSA, oder eine Quelle, die schon im Bestand steht. **Nenn sie, und
nenn sie je Naehrstoff**, denn die Faktoren unterscheiden sich: bei
Vitamin E haengt er an der Form.

**Und die Umrechnung dorthin, wo sie hingehoert.** `[read]` **Nicht
in die Anzeige.** Eine Bilanz, die nur beim Anzeigen richtig rechnet,
ist bei der naechsten Auswertung wieder falsch — **dasselbe Muster
wie die Snapshots aus G-138.**

### Was nicht zu tun ist

**Keinen Faktor aus dem Gedaechtnis setzen**, auch keinen richtigen.
`[read]` **Eine Zahl ohne Beleg ist der Fehler, den dieser Punkt seit
acht Tagen offenhaelt.**
**Keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort an G-218.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Naehrstoffe mit zwei Einheiten   Zahl, je einzeln benannt
    je Faktor                        Quelle genannt
    Umrechnung wo                    Ort begruendet
    Vitamin D vorher / nachher       die Bilanz in Prozent
    Gegenprobe                       ein Wert in µg und derselbe
                                     in IU ergeben dieselbe Bilanz
    andere Naehrstoffe               unveraendert - belegt

`[read]` **Die letzte Zeile ist die, die sonst fehlt.** Eine
Einheitenkorrektur, die nebenbei andere Werte verschiebt, faellt erst
auf, wenn jemand seine Bilanz vergleicht.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
