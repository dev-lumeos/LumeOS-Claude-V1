---
nr: G-249
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
    - apps/web/src/app/v2/nutrition/mikro-ansicht.tsx
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
    - apps/web/src/app/v2/nutrition/naehrstoff-modal.tsx
zahlen:
  gemessen: 2026-08-28
  mikro_ansicht_zeilen: 722
  ordnung_tab_zeilen: 518
  modal_zeilen: 368
agent: claudecode
beauftragt: 2026-08-28
---

# G-249 — zwei Ansichten zusammenfuehren und den Verlauf als Trend zeigen

## Befund

`[cmd]` **Der `nutrients`-Reiter rendert zwei Ansichten
uebereinander** (`ansicht.tsx`):

    <MikroAnsicht>            G-239/G-246/G-247, heute gebaut
    <NaehrstoffOrdnungTab>    G-101/C-54/G-121/G-122, aelter

`[read]` **Beide zeigen Naehrstoffe gegen Referenzwerte, beide haben
eigene Zeitfilter, und die Filter der oberen wirken nicht auf die
untere.** Kein Defekt — **die Folge davon, dass zweimal dasselbe
gebaut wurde.**

### Der Fehler ist meiner

`[read]` **Ich habe G-239 beauftragt, ohne zu pruefen, was im selben
Reiter schon steht.** Dann G-247 mit Zeitraeumen, **die die Ordnung
seit G-121 hat.** Dann G-246 mit Detailkacheln, **die das
Ordnungsmodal bereits zeigt.**

`[cmd]` **Toms Erinnerung an *,,1, 14, 30, 45, 90"* war exakt
richtig** — sie stand in der Ordnung, nicht in der neuen Ansicht.

### Was die Ordnung kann und die neue Ansicht nicht

    Baum ueber `parent_code`, auf jeder Ebene klappbar
    Klappzustand in `user_display_preferences` gespeichert
      (Datenbank, nicht Browser - "dieselbe Sicht am Telefon")
    Filter Alle / Auffaellig / Unter Ziel
    Suche ueber Name, Code, Beschwerde, Quelle
    sieben Zeitfenster: Heute · 7 · 14 · 30 · 45 · 60 · 90
    `nutrition_targets` - das persoenliche Ziel aus den Goals
    Modal mit wissenschaftlicher Referenz, Quelle, Zusammensetzung

### Was die neue Ansicht kann und die Ordnung nicht

    Verlauf mit drei Linien (G-247)
    Detailkacheln: `deficiency_de`, `excess_de`, `top_sources_de`,
      `rda_athlete_text` (G-246)
    Pillen als Filter mit Zaehlern (G-247)
    vier Zustaende inkl. "kein Richtwert" (G-239)

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, mit Nutzer und Zeitraum** (`CLAUDE.md`).
`[read]` **Und ein Waechter prueft die Wirkung, nicht das Wort** —
dreimal in Folge derselbe Fehler in deinen eigenen Waechtern.

### 1 · Zusammenfuehren

**Die Ordnung bleibt, die MikroAnsicht geht darin auf.**

`[read]` **Tom, 2026-08-28:** *,,ja klar so ist es nicht brauchbar und
der alte teil ist detailliert mit modal"*.

**Was aus der MikroAnsicht mitkommt:** die vier Zustaende, die Pillen
als Filter, die Detailkacheln, der Verlauf. **Was bleibt:** Baum,
Suche, Klappzustand, `nutrition_targets`, das Modal.

`[read]` **Miss zuerst, was doppelt ist** — die Pillen der oberen und
der Filter *,,Auffaellig"* der unteren koennten dasselbe meinen.
**Wenn ja: eine Fassung, nicht beide.**

**Das Modal bleibt vorerst ein Modal.** `[read]` Tom: *,,koennen wir
dann immer noch entscheiden ob wir einen view change bauen wollen
sprich dulldown anstatt modal"* — **eigene Entscheidung, nicht Teil
dieses Auftrags.**

### 2 · Der Verlauf wird ein Trend

`[read]` **Tom:** *,,haesslich und nicht was ein bodybuilder sehen
muss. es geht um trends und nicht einzelne tagesbalken. selbst wenn
mal tage fehlen kann man einen trend darstellen."*

**Recherchiert am 2026-08-28, drei Regeln aus der Fachliteratur:**

**Linie statt Balken.** Balken vergleichen Kategorien, Linien zeigen
Verlaeufe ueber die Zeit. `[read]` **Die heutige Balkenform aus G-247
war meine Vorgabe** — sie kam aus dem Gedanken, dass ein fehlender Tag
keine Null ist. **Das bleibt richtig, loest sich aber anders: ein
gleitender Mittelwert ueberbrueckt Luecken, ohne sie zu erfinden.**

**Nicht bei Null beginnen.** `[read]` Eine Nullbasis drueckt echte
Schwankungen zu einer flachen Linie zusammen. **Bei einem Naehrstoff,
der zwischen 839 und 8.396 ug schwankt, ist das der Unterschied
zwischen sichtbar und unsichtbar.**

**Gleiche Achsenskalierung ueber alle Zeilen**, wenn mehrere Verlaeufe
untereinander stehen — sonst sehen ungleiche Aenderungen gleich aus.

`[read]` **Und was ein Bodybuilder sehen muss:** nicht der einzelne
Tag, sondern **ob es steigt, faellt oder steht** — und wo es
gegenueber Ziel und Obergrenze liegt.

`[read]` **Die Fachliteratur nennt dafuer zwei Formen, die
zusammenpassen:** eine **Sparkline** in der Zeile fuer die Trendform,
und ein **Bullet-Balken** fuer Wert gegen Ziel gegen Obergrenze.
**Beides kompakt genug fuer eine Tabellenzeile mit 138 Eintraegen.**

**Bei 7 / 30 / 90 zeigen. Im Tagesmodus nicht** — ein Tag hat keinen
Trend.

### Was nicht zu tun ist

**Keine Referenzwerte aendern, keine Schwellen setzen.**
**Kein Dropdown statt Modal** — eigene Entscheidung.
**Keine Zeitfenster streichen** ohne zu sagen warum. `[cmd]` Die
Ordnung hat sieben, die MikroAnsicht vier. **Sag, welche bleiben.**
**Den gespeicherten Klappzustand nicht verlieren** — er liegt in
`user_display_preferences`, nicht im Browser.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Ansichten im Reiter          vorher 2, nachher 1
    Zeitfenster                  welche bleiben, begruendet
    Filter wirken durchgaengig   Pille + Suche + Zeitfenster
                                 zusammen - Bildschirmfoto
    Klappzustand                 ueberlebt einen Neuladen
    Trend statt Balken           Bildschirmfoto, 7/30/90
    Luecken                      ueberbrueckt, nicht als Null
    Achsen                       gleiche Skalierung je Gruppe
    Detailkacheln                unveraendert erreichbar
    Zeilen gesamt                vorher / nachher
    Ladezeit                     ms je Zeitfenster, kalt und warm

`[read]` **Die vorletzte Zeile ist die ehrlichste:** 722 + 518 + 368
Zeilen stehen heute im Reiter. **Wenn die Zusammenfuehrung mehr
ergibt, ist etwas schiefgelaufen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und **eine
Messung vor dem Neukompilieren zeigt alte Zahlen.**
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.
`[cmd]` **A-60:** keine `Map` ueber die Client-Grenze — sie kommt
leer an, ohne Fehler.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
