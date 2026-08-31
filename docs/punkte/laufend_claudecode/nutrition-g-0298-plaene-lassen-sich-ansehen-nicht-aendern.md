---
nr: G-298
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-286
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-298 — Plaene lassen sich ansehen, nicht aendern

## Befund

Tom, 2026-08-31: *,,meal plans sehe ich noch nichts brauchbares."*

`[cmd]` **Nach G-286 ist der Reiter lesbar:** Karte, Tages-Akkordeon,
Aktivierung mit Zyklus.

`[read]` **Aber es gibt keinen Weg, einen Eintrag zu aendern.**
`[cmd]` **Die einzigen Knoepfe sind *Zuklappen* und *Laufzeit
aendern*.**

## Was fehlt

**Einen Eintrag hinzufuegen, aendern, entfernen.**

`[read]` **Ein Plan, den man nur ansehen kann, ist ein Ausdruck.**

`[cmd]` **Der Schreibweg steht:** G-267 legt Plaene an, G-286 hat
Anlegen, Aktivieren und Loeschen mit gezaehltem Rueckbau belegt.
`[read]` **Was fehlt, ist die Bearbeitung der Positionen.**

## Und ein zweiter Befund im selben Bild

`[cmd]` **Der aktive Plan laeuft vom 18.06. bis 08.07., heute ist der
31.08.** `[cmd]` **Die Karte sagt *aktiv*, und die Tagesansicht sagt
*fuer diesen Tag fuehrt der Plan keine Eintraege*.**

`[read]` **Beides stimmt einzeln und ergibt zusammen keinen Sinn.**
**Ein Plan, dessen Laufzeit vorbei ist, ist nicht aktiv** — **oder
die Anzeige muss sagen, dass er ausgelaufen ist.**

`[cmd]` **`lifecycle_type` ist bei diesem Plan `NULL`** — **also ist
nicht festgelegt, was am Ende geschieht** (G-290). **Das ist die
Luecke, die hier sichtbar wird.**

## Auftrag — Plaene bearbeitbar machen

**Mitbeauftragt: G-299, G-297.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Tom hat durchgesehen

*,,meal plans sehe ich noch nichts brauchbares"* — *,,planner ist
irgendwas aber noch nicht brauchbar"* — *,,tagesdeckung geht
kleiner."*

`[read]` **Nach G-286 ist der Reiter lesbar. Er ist nicht
benutzbar.**

### 1 · G-298 — einen Eintrag aendern

`[cmd]` **Die einzigen Knoepfe sind *Zuklappen* und *Laufzeit
aendern*.** `[read]` **Ein Plan, den man nur ansehen kann, ist ein
Ausdruck.**

**Hinzufuegen, aendern, entfernen — je Position.**

`[cmd]` **Der Schreibweg steht:** G-267 legt Plaene an, G-286 hat
Anlegen, Aktivieren und Loeschen belegt. **Es fehlen die
Positionen.**

**Und ein zweiter Befund im selben Bild:** `[cmd]` **der Plan laeuft
vom 18.06. bis 08.07., heute ist der 31.08., und die Karte sagt
*aktiv*.** `[read]` **Ein Plan, dessen Laufzeit vorbei ist, ist nicht
aktiv — oder die Anzeige muss sagen, dass er ausgelaufen ist.**
`[cmd]` **`lifecycle_type` ist `NULL`, also ist nicht festgelegt, was
am Ende geschieht.**

### 2 · G-299 — der Planner

`[cmd]` **Er oeffnet auf dem 18.6.** `[cmd]` **Heute ist der 31.8.**

`[read]` **Und die Vorfrage gehoert beantwortet, bevor du baust:**
**was ist der Planner, wenn es den Meal-plans-Reiter gibt?**

`[cmd]` **Beide zeigen denselben Plan** — der eine als Tagesliste,
der andere als Wochengitter. `[cmd]` **`SPEC_10` kennt den Planner
nicht als eigenen Bereich; `MealPlanDayView` steht unter den
Plan-Komponenten.**

`[read]` **Miss das und sag, was er sein soll.** **Dann bau es.**

### 3 · G-297 — die Tagesdeckung kleiner

`[cmd]` **28 Felder ueber die volle Kachelhoehe, je Feld eine Zahl.**
`[cmd]` **Und die Verlaufskachel daneben hat dadurch Leerraum.**

`[cmd]` **`HeatmapView.js` im Fundus zeigt es kompakt** — 7x5-Gitter,
**ohne dass ein Feld eine Bildschirmzeile fuellt.**

`[read]` **Die Zahl im Feld ist verzichtbar** — die Farbe traegt die
Aussage, die Zahl steht beim Darauffahren.

### Die Vorlagen

`[cmd]` **`referenz/.../nutrition/components/MealPlanView.tsx`, 21
kB** — Struktur ja, Code nie.

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` schreiben** — `test-user` mit
Rueckbau.
**Keine dritte Ansicht** — entweder der Planner ist die Wochenansicht
oder er verschwindet.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Eintrag aendern        schreibt, mit gezaehltem Rueckbau
    Eintrag hinzufuegen    dito
    abgelaufener Plan      was zeigt die Karte jetzt
    Planner                was ist er, und zeigt er die
                           laufende Woche
    Tagesdeckung           kleiner, Bildschirmfoto vorher/nachher
    Attrappen              am Schirm, vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
