---
nr: G-428
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-389
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-428 — der Injektionsreiter ist leer

## Befund 1: der Reiter zeigt NICHTS

Tom, 2026-09-08, nach G-389.

`[cmd]` **Bildschirmfoto, `/v2/supplements?tab=injektionen`:**

    test-user@lumeos.local   Reiterleiste, darunter LEER
    dev@lumeos.app           Reiterleiste, darunter LEER

`[cmd]` **Beide Nutzer, kein Konsolenfehler ausser der
bekannten `data-mode`-Warnung.**

`[read]` **Vor G-389 zeigte der Reiter die Rotationskarte, die
Konfiguration und die Protokollliste** ? **jetzt nichts.**

`[cmd]` **G-389 hat geaendert:** `ansicht.tsx`, `modale.tsx`,
**plus vier neue Dateien.**

`[read]` **Miss, was den Reiter heute leer laesst** ? **ein
Fehler beim Rendern, ein falscher Zweig, oder eine Abfrage, die
nichts liefert.**

## Befund 2: zwei nackte Bedienleisten in Extended

Tom: *,,supplements/Extended ? nach modulmenu Zyklen und
Protokolle halbherzig eingebaut, was ist das?"*

`[cmd]` **Bildschirmfoto zeigt ganz oben, VOR der Vorlage:**

    Zyklen 0      supplements.user_supplement_cycles
                  [Substanz waehlen] [+ Zyklus starten]
                  "Noch kein Zyklus. Die Tabelle ist seit
                   C-456 da und leer."

    Protokolle 0  3 Vorlagen bereit
                  [Vorlage waehlen] [Ankersubstanz]
                  [Aus Vorlage anlegen]
                  "Noch kein Protokoll."

`[read]` **Das sind SCHREIBWEGE ohne Ansicht** ? **Knoepfe, die
etwas anlegen, aber nichts zeigen.**

`[cmd]` **G-423 hat sie gebaut, um die C-456-Funktionen zu
rufen** ? **A3 und A4 verlangten genau das.**

`[read]` **Aber sie stehen VOR der Vorlage, ohne Kachel, ohne
Rahmen** ? **wie ein Werkzeugkasten, den jemand auf den Tisch
gelegt hat.**

## Was die Vorlage zeigt

`[cmd]` **`docs/spezifikation/10-plattform/design-system/theme-v1/`**
? **die Extended-Kacheln:**

    Extended supplements - log
    Active protocols          5 compounds
    Bloodwork - linked from Medical

`[read]` **`Active protocols` IST die Protokollansicht** ? **sie
steht als Attrappe da, waehrend darueber eine nackte Bedienleiste
anlegt.**

`[read]` **Und einen Zyklenbereich hat die Vorlage nicht
sichtbar** ? **miss, ob es ihn gibt.**

## Was zu tun ist

**1** ? **Den Injektionsreiter wieder zum Laufen bringen.**

`[read]` **Zuerst messen, WARUM er leer ist** ? **nicht raten.**

**2** ? **Die zwei Bedienleisten in die Vorlage einfuegen.**

`[read]` **Ein Zyklus gehoert in eine Kachel, nicht ueber die
Seite.**

`[cmd]` **`Active protocols` zeigt heute Entwurfsdaten** ? **wenn
ein Protokoll angelegt wird, gehoert es DORT hinein.**

`[read]` **Und wenn keines da ist: der Leerzustand in derselben
Kachel, nicht daneben.**

**3** ? **Wo gehoert der Zyklus hin?**

`[read]` **Miss, ob die Vorlage einen Zyklenbereich hat.**

`[read]` **Wenn nicht: melden und Tom entscheiden lassen** ?
**nicht erfinden.**

## Abnahmebedingungen

    A1  warum der Reiter leer war: GEMESSEN.
    A2  der Reiter zeigt wieder Inhalt. Foto.
    A3  Gegenprobe: der kaputte Zustand -> faellt sie?
    A4  Zyklen und Protokolle in einer Kachel der Vorlage.
        Foto vorher/nachher.
    A5  hat die Vorlage einen Zyklenbereich? Gemessen.
    A6  apps/web 1613 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-470.**
**Die Schreibwege NICHT entfernen** ? **sie sind richtig, sie
stehen nur am falschen Ort.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
