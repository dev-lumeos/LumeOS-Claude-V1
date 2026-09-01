---
nr: G-317
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-315
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-317 — drei Zeilen der Vorlage fehlen am Schirm

## Befund

`[cmd]` **Bildschirmfoto vom 2026-09-02, `backup/g315-nachher-voll.png`,
gegen `theme-v1` Z. 334-521 gehalten.**

    Z. 364   Ring: label UNTER der Zahl
             Ist: "COMPLIANCE" liegt im Ring und ueberlagert ihn
    Z. 393   Status-Pille in der Statusfarbe
             Ist: grau, fuer jeden Zustand gleich
    Z. 394   kcal rechtsbuendig, marginLeft auto
             Ist: fehlt

`[read]` **Alle drei wurden in G-315 als umgesetzt gemeldet.**

## Warum es zaehlt

`[read]` **Die Statuspille ist die einzige Stelle, an der `confirmed`,
`deviated` und `skipped` sich unterscheiden.** `[cmd]` **Die Vorlage
gibt jedem eine Farbe** (Z. 341-346): `--pos`, `--warn`, `--neg`,
`--fg-dim`.

`[read]` **Grau fuer alle heisst: die Unterscheidung ist unsichtbar.**

`[cmd]` **Und die kcal je Eintrag stehen in der Vorlage rechts** —
sie sind der einzige Zahlenwert der Zeile.

## Und ein vierter, aus G-302

`[cmd]` **Die Zielzeile bricht weiter um** — *Kohlenhydrate 313 g*
steht ueber der Beschriftung, bei 1440 px.

`[read]` **G-302 liegt seit dem 31.08. offen.**

## Auftrag — die drei Zeilen und der Umbruch

**Mitbeauftragt: G-302, G-316.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Drei Zeilen, die du als umgesetzt gemeldet hast

`[cmd]` **Am Bildschirmfoto `backup/g315-nachher-voll.png`
nachgesehen:**

    Z. 364   Ring: label UNTER der Zahl
             Ist: "COMPLIANCE" liegt im Ring
    Z. 393   Status-Pille in der Statusfarbe
             Ist: grau, fuer jeden Zustand gleich
    Z. 394   kcal rechtsbuendig, marginLeft auto
             Ist: fehlt

`[read]` **Die Statuspille ist die einzige Stelle, an der
`confirmed`, `deviated` und `skipped` sich unterscheiden.** `[cmd]`
**Die Vorlage gibt jedem eine Farbe** (Z. 341-346): `--pos`,
`--warn`, `--neg`, `--fg-dim`.

`[read]` **Grau fuer alle heisst: die Unterscheidung ist
unsichtbar** — **und genau sie traegt die Compliance-Rechnung
darueber.**

### G-302 — die Zielzeile bricht um

`[cmd]` **Seit dem 31.08. offen.** `[cmd]` **Bei 1440 px steht
*Kohlenhydrate 313 g* ueber der Beschriftung, nicht daneben.**

`[cmd]` **Vier Werte in einer Zeile, der dritte hat die laengste
Beschriftung.**

### G-316 — Log deviation

`[cmd]` **Du hast gemeldet: `ladeTagesEintraege` liefert nur
Bezeichnung und kcal.**

`[cmd]` **Der Rest steht:** G-309 hat die Ghost-Anzeige mit
Einzelzutaten gebaut, **je Zutat ein Mengenfeld.** `[cmd]` **Und
`plan-log-write.ts` rechnet `deviation_kcal` und `deviation_pct`** —
belegt mit 1.028 kcal und 76,3 Prozent.

`[read]` **Es fehlt der Leseweg** — **derselbe, den du in G-311 fuer
das Rezept im Raster gebraucht hast.**

`[read]` **MealCam bleibt weg** — G-276, kein Modell.

### Wie du es belegst

`[cmd]` **`dev@lumeos.app` traegt vier Plaene und sechs
Protokollzeilen** — lesen und ansehen erlaubt, **nicht schreiben.**

`[read]` **Ein Bildschirmfoto, auf dem die drei Statusfarben
gleichzeitig zu sehen sind** — **die Buehne hat confirmed, deviated
und skipped.**

### Nachweis

    Ring            label unter der Zahl, Bildschirmfoto
    Statuspille     drei Farben gleichzeitig sichtbar
    kcal            rechtsbuendig je Zeile
    Zielzeile       bricht nicht um, 1440 px
    Log deviation   Mengenfelder, Abweichung beziffert
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
