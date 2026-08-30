---
nr: G-263
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-254
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/vorschlags-lage.ts
zahlen: null
---
# G-263 — Smart suggestions ist Attrappe

## Befund

**Tom, 2026-08-29.**

`[cmd]` **Die Kachel traegt den Text *,,Aus dem Entwurf uebernommen.
Die Zahlen sind erfunden, bis die Kachel eine Quelle hat."***

## Vor dem Bauen zu klaeren

`[read]` **Was ist ein Vorschlag?** `[read]` **Und die Grenze aus
C-108/F-02 gilt:** *Nennen ja, bewerten nein.* **Ein Vorschlag ist
eine Bewertung** — er sagt, was jemand tun soll.

`[read]` **Das ist dieselbe Frage, die bei `intel` und `extended` in
Supplements offensteht** (G-240).

## Auftrag

**Vorbereitet mit G-262 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt mit G-277. **Der
vollstaendige Bericht steht in [G-277](coach-g-0277-der-rechte-reiter-nennt-einen-grund-den-es-nicht-gibt.md#bericht).**

### Urteil: entfernt

`[read]` **Ein Vorschlag sagt, was jemand tun soll — das ist eine
Bewertung.** Damit ist die Kachel unter ihrem Namen nicht baubar.
**Je Zeile gemessen:**

    „Same as yesterday"    Fakt da (Vortag 16 Posten), ABER gebaut:
                           `wieGestern()` in mahlzeiten.tsx:275
    „Top breakfast · 78%"  Haeufigkeit zaehlbar (27x/30 Tage),
                           Quote nicht (eine Zielzeile); „Top" wertet
    „Quick post-workout"   keine Quelle; Dosierung + Kombination
    „Saturday cheat meal"  kein Muster: je Wochentag 13 Tage,
                           Sa 625 kcal zwischen Fr 560 und Do 663

`[read]` **Eine gebaut, eine erfunden, zwei Empfehlungen. Keine
traegt.** `[cmd]` **A-59: `SmartSuggestionsCard` hatte danach null
Aufrufer — geloescht.** Messungen in `lib/nutrition/vorschlags-lage.ts`.

`[read]` **Offen als Produktfrage:** eine Kachel *„haeufig erfasst"*
waere eine Angabe statt einer Bewertung. Das ist eine Entscheidung.

## Abnahme

**2026-08-30, mit G-277 abgenommen:** entfernt, je Zeile begruendet; `SmartSuggestionsCard` hatte danach
null Aufrufer.
