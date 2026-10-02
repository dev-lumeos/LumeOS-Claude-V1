---
nr: A-92
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01
commit: d1a82c24
erledigt: 2026-10-02
agent: codex
beauftragt: 2026-10-01

braucht: [G-563, A-91]
kind_von: A-87

quellen:
  - docs/punkte/laufend_codex/quer-a-0087-46-zeugen-nach-ursache-gestaffelt.md
  - docs/punkte/laufend_codex/quer-a-0091-der-taegliche-lauf-erzeugt-bei-gruen-einen-neuen-dump.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_validierung/goals-g558-phase-start-strategy.test.ts

zahlen:
  gemessen: 2026-10-01
  proben_mit_aufruf: 7
  ueberladungen: 2
---

# Die G-558-Probe ruft berechne_zielwerte ohne Zielbezug und haelt den Tagesdump auf

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-92: die G-558-Probe auf den Zielbezug
                              umstellen, damit A-91/A5 durchlaeuft
    Bereich: supabase/_pipeline/_validierung/
    Fremd:   apps/ gehoert Claude Code (G-577 laeuft dort). docs/
             gehoert dem Orchestrator, auch diese Punktdatei: der
             Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`supabase/_pipeline/11_goals/563_target_scoped_calculation.sql`.

## Der Befund

`[cmd]` **Du hast ihn selbst gemessen, im Vollauf zu A-91** (1.347,9 s,
nach erfolgreicher Kandidatenerzeugung):

    nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag;
    Zielbezug fehlt

`[cmd]` **Und du hast ihn richtig NICHT stillschweigend geaendert** — eine
fachliche Goals-Probe gehoerte nicht in A-91. **Deshalb steht sie jetzt
als eigener Punkt, mit eigener Nummer, und du bekommst sie als Auftrag.**

`[cmd]` **G-563 hat zwei Ueberladungen hinterlassen**, nicht eine:

    563_target_scoped_calculation.sql:8     berechne_zielwerte(uuid, uuid, date)
                                            - mit Zielbezug
    563_target_scoped_calculation.sql:245   DROP  berechne_zielwerte(uuid, date)
    563_target_scoped_calculation.sql:246   CREATE berechne_zielwerte(uuid, date)
                                            - nutzerweit, neu gebaut

`[cmd]` **Die Probe ruft die nutzerweite Form auf:**
`goals-g558-phase-start-strategy.test.ts:136` —
`FROM goals.berechne_zielwerte(` mit zwei Argumenten, **und erzeugt
selbst zwei aktive Zielphasen.** Die nutzerweite Form kann bei zwei
Phasen keinen Zielbezug herstellen und meldet genau das. **Die Probe ist
veraltet, nicht die Funktion.**

`[cmd]` **Sieben Probendateien rufen `berechne_zielwerte`:**

    goals-g563-target-calculation.test.ts    5 Treffer
    goals-g543-rate-calculation.test.ts      7
    goals-g511-phase-calories.test.ts        6
    goals-g536-goal-strategies.test.ts       4
    nutrition-c464-fiber-target.test.ts      2
    goals-g526-macro-rule-structure.test.ts  1
    goals-g558-phase-start-strategy.test.ts  1   <- der Zeuge

## Was zu tun ist

**A1 — die G-558-Probe auf die Form mit Zielbezug umstellen.** `[read]`
**Nicht die zweite Phase wegnehmen** — dass zwei Zielphasen gleichzeitig
aktiv sein koennen, ist seit G-563 gewollt und der Grund fuer die
Ueberladung. **Die Probe soll das Ziel nennen, um das es ihr geht.**

**A2 — die anderen sechs ansehen, einzeln.** `[cmd]` Sie laufen heute
gruen, also ist dort kein Schaden — **aber eine Probe, die die
nutzerweite Form benutzt, muss das aus einem Grund tun, und der Grund
gehoert in die Datei.** Melde je Datei: Zielbezug oder bewusst
nutzerweit.

**A3 — danach A-91/A5 nachholen.** `[cmd]` **Dein Vollauf scheiterte erst
NACH der Kandidatenerzeugung** — die Veroeffentlichung blieb korrekt aus,
der alte Dump steht unveraendert (434.525.275 Bytes,
2026-10-01T07:48:38.367Z, Manifest mit 19 Quellen). **Sobald die Probe
gruen ist, laeuft der Vollauf durch und veroeffentlicht.** Das ist der
Beleg, der A-91 noch fehlt.

**Nicht Teil:** die restlichen Zeugen aus A-86 (`G-561` belegt Prioritaet
1 beim Seed, `G-451/G-556` erwarten drei statt fuenf Seedphasen) — die
bleiben bei A-87, nach Ursache gestaffelt. **Und nicht die Funktion
selbst:** G-563 ist erledigt und geprueft.

**Zu belegen:** die geaenderte Probe gegen eine Wegwerf-Datenbank, mit
Laufzeit · die Gegenprobe, dass sie mit der alten zweiargumentigen Form
wieder rot wird · je der anderen sechs ein Satz · der Vollauf danach, mit
veroeffentlichtem Dump, Bytezahl und Manifestquellen vorher und nachher ·
Wegwerf-Datenbanken verworfen mit Zaehler · kein `db push` · nichts
committen.

`[read]` **Hier ist der volle Lauf ausdruecklich Teil des Nachweises** —
nicht als Pflichtuebung, sondern weil A-91/A5 genau ihn verlangt und er
ohne diese Probe nicht durchkommt. **Einmal, am Ende, nicht als
Vorbedingung.**

---

## Abnahme — 2026-10-02, Commit `d1a82c24`

`[cmd]` **In der Datei nachgezaehlt, nicht im Bericht gelesen:**

| Merkmal | gezaehlt |
| --- | --- |
| der Aufruf | `goals-g558-phase-start-strategy.test.ts:138`, drei Argumente: Nutzer, Ziel `…0102`, Stichtag |
| die zwei aktiven Phasen | bleiben stehen — die Probe wurde nicht entschaerft, sondern praezisiert |
| die sechs Nachbarn | alle sechs Dateien geaendert, je mit Begruendung: G-543, G-511, G-536, C-464 bewusst nutzerweit · G-526 prueft einen Kommentar · G-563 benutzt absichtlich beide Formen |
| Commit | `d1a82c24`, 6 Dateien, +15/−1 |

`[read]` **Die Gegenprobe ist der Kern und sie ist belegt:** mit der alten
zweiargumentigen Form wird die Probe rot (`mehrere aktive Phasen am
Gueltigkeitstag; Zielbezug fehlt`), mit der Zielform gruen — 1,60 s
Testzeit, im Vollauf 2,17 s. **Beide Richtungen, wie verlangt.**

`[cmd]` **A3 ist nicht erfuellt, und das ist kein Mangel dieses Punktes:**
der Vollauf kam 1.291,7 s weit und fiel dann an G-545, dessen Erwartung
`duration_ratio_pct` nicht kennt — **ein Zeuge, den mein eigener
G-560-Commit erzeugt hat.** Codex hat ihn nicht angepasst, richtig so.

`[read]` **Daraus folgt eine Korrektur an meiner Arbeitsweise, nicht an
seiner.** Zwei Vollaeufe sind an je einem Zeugen gestorben — 44 Minuten
fuer zwei von 46. **Die Staffel geht deshalb als Ganzes raus (A-87),
und A-91/A5 wird dort belegt.**
