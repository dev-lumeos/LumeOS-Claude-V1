---
nr: C-399
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-09-02
  tage: 135
  posten_mit_wert: 0
  angezeigter_schnitt: 1088.6
---

# C-399 — ein Schnitt ohne einen einzigen Wert

## Befund

Tom, 2026-09-02: *,,wenn 0 von 60 tagen nicht erfasst sind kann der
schnitt nur 0 sein. wenn keine daten da sind gibt es keinen
schnitt."*

`[cmd]` **Der Nutrients-Reiter zeigt fuer `CAROTPAXB`:**

    Carotinoide, ausser Beta-Carotin    1.088,6 ug    0/60 Tg. vollst.

`[cmd]` **Gemessen auf `dev@lumeos.app`, 135 Tage mit Mahlzeiten:**
**kein einziger Posten traegt einen `CAROTPAXB`-Wert.**

`[read]` **Es gibt keine Grundlage fuer 1.088,6.**

## Und mein eigener Denkfehler daneben

`[cmd]` **Meine Gegenprobe ergab 1.111,3** — **weil
`coalesce(fn.value, 0)` die fehlenden Werte als Nullen mitzaehlte und
durch alle Tage teilte.**

`[read]` **Der Zaehler war null, der Nenner nicht.** `[read]`
**Wahrscheinlich macht die Anzeige denselben Fehler** — **aber das ist
zu messen, nicht anzunehmen.**

## Zu messen

`[read]` **Woher kommt die Zahl?** `[cmd]` **Aus `daily_nutrient_
summary_long`, aus einer Ableitung, oder aus einem Rueckfall?**

`[read]` **Und wie viele andere Naehrstoffe zeigen einen Schnitt ohne
Grundlage?** `[cmd]` **Der Reiter fuehrt 138 Codes** — **wenn einer
falsch rechnet, tun es vermutlich mehr.**

## Warum es zaehlt

Tom: *,,der naechste schwachsinn der mich alles hinterfragen laesst
was ich hier an daten sehe."*

`[read]` **Eine Zahl ohne Grundlage beschaedigt jede andere Zahl
daneben** — **auch die richtigen.**

`[cmd]` **C-378 und E-38 sagen dasselbe von der anderen Seite:**
**wenn die Daten nicht da sind, erfinden wir sie nicht.**

`[read]` **Ein Schnitt aus null Werten ist eine Erfindung.**

## Auftrag — woher kommt die Zahl?

**Mitbeauftragt: C-398.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-399 — der Schnitt ohne Grundlage

`[cmd]` **`CAROTPAXB` zeigt 1.088,6 ug Schnitt bei 0 von 60 Tagen.**

`[cmd]` **Gemessen: an 135 Tagen mit Mahlzeiten traegt kein einziger
Posten einen `CAROTPAXB`-Wert.**

`[read]` **Woher kommt die Zahl?** `[cmd]` **Aus
`daily_nutrient_summary_long`, aus einer Ableitung, oder aus einem
Rueckfall?**

`[read]` **Und wie viele der 138 Codes zeigen einen Schnitt ohne
Grundlage?** — **wenn einer falsch rechnet, tun es vermutlich mehr.**

`[read]` **Achtung bei der eigenen Abfrage:** `[cmd]`
**`coalesce(value, 0)` zaehlt fehlende Werte als Nullen und teilt
durch alle Tage** — **das ergibt einen Schnitt, wo keiner ist.**
`[read]` **Genau dieser Fehler unterlief dem Orchestrator bei der
Gegenprobe.**

### 2 · C-398 — die IE-Summe fuer Vitamin A

`[cmd]` **`350_vitamin_a_components_magnesium_ul.sql` rechnet Vitamin
A in IE aus drei Komponenten:**

    RETOL       ug -> IU   Faktor 3,3333
    CARTB       ug -> IU   Faktor 1,6667
    CAROTPAXB   ug -> IU   Faktor 0,8333

`[cmd]` **Zeile 76: *,,sich auf die gespeicherte Komponente in ug,
nie auf den Gesamtwert VITA."*** `[cmd]` **Zeile 155: *,,Kein
Gesamtfaktor."***

`[read]` **Fachlich richtig** — drei Faktoren, kein Mittelwert.

`[cmd]` **Aber: `nrf93_daily` meldet `VITA` als einzigen fehlenden
Code**, an 120 von 120 Tagen — **`components.vitamin_a.amount` ist
`null`.**

`[read]` **Und `VITA` in ug steht auf 60/60 vollstaendig.** `[read]`
**Die Datenbank bildet die Summe dort also mit Nullen** — **die
IE-Umrechnung nicht.**

`[read]` **Miss, ob das zusammenhaengt** — **und ob C-399 dieselbe
Ursache hat.**

### Was nicht zu tun ist

**Keinen Wert erfinden** — C-378, E-38.
**Keine Ableitung bauen**, bevor die Ursache steht.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    1.088,6        woher, mit Fundstelle
    138 Codes      wie viele zeigen einen Schnitt ohne Grundlage
    VITA in IE     warum null, obwohl ug vollstaendig ist
    Zusammenhang   dieselbe Ursache oder zwei

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
