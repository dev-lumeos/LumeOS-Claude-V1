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
erledigt: 2026-09-02
commit: 2796ee5c
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

### C-399 und C-398 — gemessen, keine Ableitung gebaut

`[cmd]` **Der aktuelle Dev-Bestand widerlegt den Ausgangsbefund von
C-399.** Die sichtbaren `1.088,6 ug` sind exakt der Wert aus
`nutrition.nutrient_summary_window(dev, 2026-09-02, 60)`: Summe
`65.316,89020 ug` / 60 protokollierte Tage = `1.088,615 ug`.
Der Reiter liest diesen Wert als `avg_per_logged_day`; es gibt keinen
Rueckfall und keine weitere Ableitung.

`[cmd]` **`0/60 Tg. vollst.` bedeutet nicht 0 Tage mit Wert.** Fuer
`CAROTPAXB` gibt es in diesem Fenster 539 gemessene Postenwerte an
allen 60 Tagen, aber 241 fehlende Postenwerte. Deshalb sind 0 von 60
Tagen vollstaendig, obwohl die Summe und ihr Schnitt eine Grundlage
haben. Ueber alle 138 Codes zeigt keiner einen Schnitt bei
`value_count = 0` oder bei 0 Tagen mit Wert. 47 Codes haben wie
`CAROTPAXB` einen begruendeten Teilschnitt bei 0 vollstaendigen Tagen;
bei ihnen beschreibt die Vollstaendigkeitszahl die Luecke, nicht die
Abwesenheit des Zaehlerwerts.

`[cmd]` **Die 1.088,6 stammen aus eingefrorenen Postenwerten, nicht
aus einer nachtraeglichen Rechnung gegen Stammdaten.** Im gesamten
Dev-Bestand tragen 1.574 `meal_items` den `CAROTPAXB`-Snapshot; bei
allen 1.574 stimmt er exakt mit `food_nutrients.value * amount_g / 100`
ueberein. Die Stammdaten selbst haben 5.094 numerische
`CAROTPAXB`-Zeilen, 1.983 `missing` und 63 `trace`.

`[cmd]` **C-398 hat eine andere, beabsichtigte Ursache.** `VITA` in
ug ist ein eigener, direkt eingefrorener Snapshot und damit im
60-Tage-Fenster 60/60 vollstaendig (780 von 780 Postenwerten). Die
IE-Funktion liest dagegen ausschliesslich `RETOL`, `CARTB` und
`CAROTPAXB`: `RETOL` ist 60/60 vollstaendig, `CARTB` nur 18/60
(59 Luecken) und `CAROTPAXB` 0/60 (241 Luecken). Ihr `bool_and` laesst
den IE-Wert daher an allen 60 Tagen `NULL`; es wird nichts mit Nullen
summiert und kein Gesamtfaktor auf `VITA` angewandt.

`[cmd]` Im aktuellen 120-Tage-Lauf liegen 105 Tage mit Positionen vor:
an diesen 105 meldet `nrf93_daily` `VITA` als unvollstaendig; 15 Tage
sind `no_data`. Die frühere Angabe 120/120 ist damit fuer den heutigen
Dev-Bestand ueberholt.

`[read]` Der gemeinsame Hintergrund ist die unvollstaendige
Komponentenabdeckung im BLS-Snapshot. Die Rechenwege sind dennoch
verschieden: C-399 summiert vorhandene Teilwerte und kennzeichnet die
Luecke; C-398 verweigert die IE-Umrechnung, sobald auch nur eine
Komponente unvollstaendig ist. Eine neue Ableitung waere deshalb keine
Folge dieses Befunds.

## Abnahme

**2026-09-02, Orchestrator.**

### Der Punkt war falsch, und der Fehler war meiner

`[cmd]` **1.088,6 ug kommt aus `nutrient_summary_window`:
65.316,89020 / 60 = 1.088,615.**

`[cmd]` **Grundlage sind 539 `CAROTPAXB`-Postenwerte an allen 60
Tagen.**

`[read]` **Meine erste Messung sagte *,,kein einziger Posten traegt
einen Wert"*** — **falsch.** `[cmd]` **Eine spaetere Gegenprobe ergab
1.205 von 1.749 Posten mit Wert.**

`[read]` **Ich habe zweimal falsch gemessen und beim zweiten Mal das
Gegenteil des ersten herausbekommen** — **ohne zu merken, dass beide
nicht stimmen koennen.**

### Die Spalte sagt etwas anderes, als ich las

`[cmd]` **`0/60 Tg. vollst.` heisst: kein Tag ist vollstaendig** —
**nicht: kein Tag hat einen Wert.**

`[cmd]` **241 Posten fehlen.**

`[read]` **Die Anzeige ist richtig.** **Zwei Zahlen, die
Verschiedenes messen** — und die Spalte warnt genau davor.

### Und die Zahl, die den Umfang klaert

`[cmd]` **Von 138 Codes zeigt KEINER einen Schnitt bei
`value_count = 0`.**

`[cmd]` **47 zeigen einen begruendeten Teilschnitt bei null
vollstaendigen Tagen.**

`[read]` **Also kein Rechenfehler, sondern 47 mal dieselbe
missverstaendliche Beschriftung** — **und Tom hat drei davon
gesehen.**

`[read]` **Damit ist G-341 der eigentliche Punkt** — **die
Beschriftung, nicht die Rechnung.**

### C-398 hat eine andere Ursache

`[cmd]` **`VITA` in ug ist ein direkt eingefrorener Snapshot, 60/60
vollstaendig.**

`[cmd]` **Die IE-Funktion rechnet nur aus `RETOL`, `CARTB`,
`CAROTPAXB` und verweigert die Ausgabe bei jeder
Komponentenluecke.** `[cmd]` **Sie summiert keine Nullen und nutzt
keinen Gesamtfaktor.**

`[read]` **Das ist der Kern: der ug-Wert kommt fertig aus dem BLS,
der IE-Wert wird gerechnet** — **und die Rechnung ist strenger als
die Quelle.**

`[read]` **Tom, heute:** *,,eine summe kann man bilden mit 0."*
`[read]` **Der ug-Snapshot tut das offenbar, die IE-Funktion
nicht.**

**Abgenommen.** **C-398 bleibt offen, C-399 ist widerlegt.**

