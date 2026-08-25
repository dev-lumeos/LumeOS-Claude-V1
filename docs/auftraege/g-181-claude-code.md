# G-181 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-181-claude-code.md`

**Nachfolger von G-180.** Die Tafel klappt richtig auf, sieht aber aus
wie die Liste.

**Tom, 2026-08-25:** *„detailansicht sieht scheisse aus und ist kaum
unterscheidbar von der liste. da kann man mit kacheln arbeiten und
strukturieren."*

---

## Was G-180 richtig gemacht hat und bleibt

`[read]` **Die Hoehe wurde VOR dem Bau gemessen** — 560 px Budget gegen
900 px noetig. **Das ist der Grund fuer die Reiter, nicht Geschmack.**
Diese Begruendung bleibt gueltig.

`[read]` **Und eine eigene blinde Pruefung wurde offengelegt:** die
Hoehenbremse war durch nichts bewacht, die dritte Negativprobe blieb
gruen. **Nachgezogen und gegengeprobt.** Genau so.

## 1 · Die Tafel muss sich von der Liste abheben

`[cmd]` Auf Toms Bildern hat der aufgeklappte Bereich fast denselben
Grauwert wie die Liste. Bei Trenbolon funktioniert es, weil der
Warnkasten Kontrast setzt — bei Kreatin steht ein Kasten mit **einer**
Zeile und darunter Fliesstext mit Mini-Ueberschriften.

**Zu tun:**

- **anderer Grund** als die Listenzeilen
- **durchgehende Akzentkante links** ueber Zeile und Tafel
- **die Nachbarzeilen daempfen**, solange eine Tafel offen ist

`[read]` **Man muss auf einen Blick sehen, was offen ist** — heute
sieht man es erst beim Lesen.

## 2 · Zahlenkacheln statt Tabellenzeile

`[cmd]` *„Auf einen Blick"* zeigt bei Kreatin **eine einzige Zeile**
(Uebliche Menge). **Ein Kasten mit einer Zeile wirkt leerer als gar
kein Kasten.**

**Stattdessen vier Kacheln nebeneinander**, je mit Beschriftung, grosser
Zahl und einer Zeile Erklaerung:

    BELEGLAGE        A          beste aller Sport-Supplements
    UEBLICHE MENGE   3-5 g      taeglich, dauerhaft
    WIRKUNG          5-15 %     mehr Maximalleistung
    WADA             erlaubt    nicht auf der Liste

`[cmd]` **Die Wirkungszahl fehlt heute im Ueberblick** — *„5-15 % mehr
Leistung"* steht im Fliesstext vergraben. **Genau die Zahl sucht man.**
Wo sie sich aus `was_bringt_es_de` nicht sauber ziehen laesst: **Kachel
weglassen, nicht raten.**

**Kachel ohne Wert entfaellt.** Drei Kacheln sind besser als vier mit
einem Strich.

## 3 · Feste Kachelbreiten — kein Bandwurm

**Tom:** *„es ist eine webapplikation mit viel platz also bau kacheln
mit fixen groessen nicht dass sich ploetzlich eine kachel dynamisch auf
1600 pixel vergroessert."*

**Vorgabe:**

    Zahlenkachel     Breite 180-220 px, feste Hoehe
    Textkachel       max-width 520 px
    Reihe            Kacheln bleiben linksbuendig; bleibt Platz
                     uebrig, bleibt er leer

`[read]` **Kein `1fr` ohne `max-width`.** Auf einem breiten Monitor
wird sonst aus einer Textkachel eine Zeile ueber die halbe Wand, und
der Text ist unlesbar. **Zeilenlaenge ueber 90 Zeichen ist der
Messwert, den du im Bericht nennst.**

`[read]` **Umgekehrt gilt auch:** unter der Mindestbreite wird
umgebrochen, nicht gestaucht.

## 4 · Textkacheln statt Fliesstext

*„Wie es wirkt"* und *„Was es bringt"* stehen heute als Absaetze mit
Mini-Ueberschrift. **Als Kacheln nebeneinander**, je mit Symbol und
Farbakzent in der Ueberschrift.

`[read]` **Die Regel aus §9 gilt weiter:** eine Kachel ohne Inhalt
erscheint nicht.

## 5 · Die Listenzeile zeigt noch die Schablone

`[cmd]` **Aus G-180 offen geblieben** und in Toms Bild sichtbar:
182-mal steht dort *„ist eine Supplement-Substanz mit eigener Beleglage
und eigenen Grenzen"* aus `description`.

`[cmd]` **`kurz_was_de` liegt daneben** — 290 Records, alle
verschieden. **Die Zeile liest kuenftig `kurz_was_de`**, mit Rueckfall
auf `description`, wo keiner existiert. `[cmd]` Das betrifft die 28
Sammelnamen.

## 6 · Die drei kleinen Punkte

**Tom, 2026-08-25:**

**a) Die Suche braucht ein X zum Leeren.** Erscheint, sobald etwas
drinsteht.

**b) Jede Filterebene braucht „Alle" als ersten Eintrag.** `[read]`
*„diverse filter haengen wenn man sie abwaehlt"* — heute ist das
Abwaehlen der einzige Weg zurueck, und er greift nicht zuverlaessig.
**Betrifft beide Ebenen: Gruppe und Kategorie.**

**c) Die Liste muss mit der Fensterhoehe wachsen.** `[cmd]` Heute
660 px fest. **Vom Viewport ableiten**, nicht als Konstante.

`[read]` **Punkt c beruehrt die Hoehenbremse aus G-180** — die
`max-height` der Tafel war gegen einen festen Rollbehaelter gerechnet.
**Beides zusammen loesen, nicht nacheinander.**

## WAS NICHT ZU TUN IST

**Keine Texte aendern.** Du zeigst sie.
**Keinen Wert erfinden**, um eine Kachel zu fuellen.
**Kein Modal.** Die Begruendung steht im Dateikopf von
`substanz-tafel.tsx` und gilt.
`supabase/_pipeline/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

`node tools/schuss.mjs`, `test-user@lumeos.local`, **bei zwei
Fensterbreiten: 1280 und 1920 px.**

**Erwartung vor dem Lauf:** Kachelbreiten bei beiden Breiten, laengste
Textzeile in Zeichen. `[read]` **Bei 1920 darf keine Kachel breiter
sein als bei 1280 plus dem erlaubten Spielraum.**

**Bilder:** Liste zu · Tafel offen bei 1280 · Tafel offen bei 1920 ·
ein Enhanced-Eintrag · Liste bei kleiner Fensterhoehe.

**Gegenprobe:** eine Substanz ohne Wirkungszahl zeigt drei Kacheln, ein
Sammelname ohne `kurz_was_de` faellt in der Liste auf `description`
zurueck — beide namentlich.

**Negativprobe:** `max-width` einer Textkachel entfernen; die Pruefung
muss rot werden. `[read]` **Genau diese Sorte Bremse war in G-180
unbewacht.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Bauen ueber `pnpm --filter @lumeos/web build`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
