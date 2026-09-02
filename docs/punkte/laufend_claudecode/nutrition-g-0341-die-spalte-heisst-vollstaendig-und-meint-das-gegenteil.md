---
nr: G-341
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-399
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-341 — die Spalte heisst *vollständig* und meint das Gegenteil

## Befund

`[cmd]` **Im Nutrients-Reiter steht je Zeile:**

    VITA        60/60 Tg. vollst.
    CARTB       18/60 Tg. vollst.
    CAROTPAXB    0/60 Tg. vollst.

`[read]` **Bei `60/60` liest es sich richtig.** `[read]` **Bei
`0/60 vollst.` liest es sich wie ein Fehler** — **die Zahl sagt
*null*, das Wort sagt *vollstaendig*.**

## Und der Schnitt sagt nicht, worauf er beruht

`[cmd]` **`SCHNITT/TAG` steht kommentarlos daneben.**

`[read]` **Wenn er aus unvollstaendigen Tagen stammt, gehoert es
dazu** — **oder er wird gar nicht gezeigt** (C-399).

## Zu tun

`[read]` **Erst C-399 messen** — **wenn der Schnitt keine Grundlage
hat, ist die Beschriftung das kleinere Problem.**

`[read]` **Danach: die Spalte sagt, was sie zaehlt.**

## Gemessen am 2026-09-02: 47 Codes betroffen

`[cmd]` **Von 138 Codes zeigt keiner einen Schnitt bei
`value_count = 0`** — **die Rechnung ist richtig.**

`[cmd]` **Aber 47 zeigen einen begruendeten Teilschnitt bei null
vollstaendigen Tagen.**

`[read]` **47 mal dieselbe missverstaendliche Beschriftung** — **Tom
hat drei davon gesehen und alles hinterfragt.**

`[read]` **C-399 ist widerlegt: die Zahlen stimmen.** **Was fehlt,
ist die Spalte, die sagt, was sie zaehlt.**

## Auftrag — die Spalte sagt, was sie zaehlt

**Mitbeauftragt: G-340, G-333.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-341 — 47 Codes, eine Beschriftung

`[cmd]` **Codex hat gemessen: von 138 Codes zeigt KEINER einen
Schnitt bei `value_count = 0`** — **die Rechnung ist richtig.**

`[cmd]` **Aber 47 zeigen einen begruendeten Teilschnitt bei null
vollstaendigen Tagen.**

`[cmd]` **`0/60 Tg. vollst.` heisst: kein Tag ist vollstaendig** —
**nicht: kein Tag hat einen Wert.**

`[read]` **Tom hat drei davon gesehen und alles hinterfragt** —
*,,der naechste schwachsinn der mich alles hinterfragen laesst was
ich hier an daten sehe."*

`[read]` **Die Zahlen stimmen. Die Beschriftung sagt nicht, was sie
zaehlt.**

`[cmd]` **Bei `CAROTPAXB`: 539 Postenwerte an allen 60 Tagen, 241
Posten fehlen** — **1.088,6 ug ist der Schnitt aus den vorhandenen.**

`[read]` **Sag es so, dass es niemand mehr fuer einen Fehler
haelt.**

### 2 · G-340 — Quick-Add ohne Schreibweg

`[cmd]` **Die Komponente ist gebaut, der Schreibweg fehlt.**

`[read]` **Zu klaeren, bevor du baust:** **ist Quick-Add ueberfluessig
geworden?** `[cmd]` **Seit G-320 gibt es `FoodSuchModal`, seit G-336
das Mahlzeiten-Modal.**

`[read]` **Oder ist es der Weg fuer den Fall ohne Suche: eine Zahl,
kein Lebensmittel.** **Miss und sag es.**

### 3 · G-333 — `erfassen.tsx`, 477 Zeilen ohne Aufrufer

`[cmd]` **Zuletzt geaendert am 16.08., kein Aufrufer.** `[cmd]`
**Ihr fehlen alle acht Suchlehren.**

`[read]` **A-59 sagt: geloescht, nicht auskommentiert.** `[read]`
**Aber 477 Zeilen wegzuwerfen ist eine Entscheidung** — **sag, was
darin steht, das anderswo fehlt.**

### Und drei Berichtigungen aus deinem letzten Lauf

`[cmd]` **G-339 nennt `kopfknoepfe.tsx`, es war `modale.tsx`** —
**berichtigt.**

`[cmd]` **`nutsettings` hat keinen Aufrufer, der
`meal_schedule`-Block ist toter Code** — **als G-342.**

`[cmd]` **GO-23s vier Zahlen sind nicht reproduzierbar, heute sind
es 7 Codes unter 50 Prozent** — **im Punkt berichtigt.**

### Was nicht zu tun ist

**Keine Zahl aendern** — die Rechnung stimmt.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    47 Codes        Beschriftung sagt, was sie zaehlt
    CAROTPAXB       am Schirm verstaendlich, ohne Zahlaenderung
    Quick-Add       ueberfluessig oder eigener Weg, begruendet
    erfassen.tsx    was darin steht, das anderswo fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
