# C-276 — Codex, 2026-08-25

Bericht: `docs/berichte/c-276-codex.md`

**Der Katalog zeigt denselben Stoff mehrfach.** Aus der Nachpruefung
von C-275.

**C-275 hat das nicht verursacht** — es hat es sichtbar gemacht.

---

## Der Befund

`[cmd]` **18 Dublettengruppen im sichtbaren Katalog**, gemessen ueber
den Namenskern (Klammern entfernt, Kleinschreibung, nur
Alphanumerisches):

    Vitamin C                        lumeos_supplement_catalog
    Vitamin C (ascorbic acid)        kimi_supplement

    Iron                             lumeos_supplement_catalog
    Iron (as ferrous bisglycinate)   kimi_supplement
    Iron (as ferrous sulfate)        kimi_supplement

    NAC                              kimi_supplement   (Slug f05_nac)
    NAC (N-Acetyl Cysteine)          lumeos_supplement_catalog
    NAC (N-acetylcysteine)           kimi_supplement

`[cmd]` **Betroffen:** Ashwagandha · Boron · Caffeine · Calcium · Iron
· Lion's Mane · NAC · Panax ginseng · Tongkat Ali · Vitamin A · B12 ·
B3 · B6 · C · D3 · E · K2 · Zinc.

`[read]` **Das ist die C-244-Entscheidung, zur Haelfte umgesetzt.** Tom
hat entschieden: **der Sammelname gewinnt, die Formen werden
Unterformen.** `[cmd]` Bei Magnesium traegt das — sieben Salze haengen
an `parent_id`. **Bei diesen 18 nicht.**

`[read]` **Der Grund liegt in der Reihenfolge:** C-244 lief, bevor Kimi
diese Formen geliefert hat. Die neuen Records sind als eigenstaendige
sichtbare Eintraege angekommen, **statt unter den Sammelnamen zu
ruecken.**

`[read]` **Und meine Pruefvorgabe war schuld, dass es durchging** — ich
hatte `count(*) > 1` auf `name_en` gestellt, und *„Vitamin C"* ist nun
mal nicht *„Vitamin C (ascorbic acid)"*. **Deine Probe war korrekt
ausgefuehrt, sie mass das Falsche.**

## Zwei Sorten, und sie brauchen verschiedene Behandlung

`[read]` **a) Sammelname plus Formen** — Vitamin C, Iron, Calcium,
Zink, Vitamin A, B12, B6, D3, E, K2, Ashwagandha, Koffein, Lion's Mane,
Tongkat Ali. **Genau das Muster aus C-244: `parent_id` setzen, die
Formen verschwinden aus der obersten Ebene.**

`[read]` **b) Zwei Formen ohne Sammelnamen** — `Vitamin B3
(nicotinamide)` gegen `(nicotinic acid)`, `Panax ginseng (American)`
gegen `(Korean red)`, `Boron` gegen `Boron (hormonal cross-ref)`,
`Vitamin K2 (MK-4)` gegen `(MK-7)`.

`[read]` **Hier ist Vorsicht geboten:** Nikotinsaeure und Nicotinamid
sind **pharmakologisch verschieden** — die eine senkt Blutfette und
loest Flush aus, die andere nicht. `[read]` **Kein Zusammenlegen ohne
Sammelnamen.** Wo keiner existiert: **beide sichtbar lassen und im
Bericht nennen.** Der Cross-Ref-Fall (`Boron`, `Caffeine (fat-loss
context cross-ref)`) ist etwas anderes — **das sind Verweise, keine
Formen.**

## NAC ist ein dritter Fall

`[cmd]` **Drei Zeilen, und eine davon hat einen falschen Slug:** `NAC`
traegt `f05_nac` bei `source = kimi_supplement`. `[read]` **Da ist
beim Aufloesen der Huelse in C-275 der alte Slug stehengeblieben.**

## WAS ZU TUN IST

1. **Die 18 Gruppen einzeln durchgehen** und je Gruppe entscheiden:
   Sammelname vorhanden → `parent_id` setzen. Kein Sammelname →
   **melden, nicht zusammenlegen.**

2. **Den NAC-Slug pruefen** und die drei Zeilen aufloesen.

3. `[cmd]` **66 der 149 unsichtbaren haben ein sichtbares
   Gegenstueck** — Anastrozole (Arimidex), Cabergoline (Dostinex),
   Bacopa Monnieri, Cardarine (GW-501516), Ashwagandha (Sensoril).
   **Die per `parent_id` anhaengen**, wie in C-244.

4. **Die Dublettenpruefung als Gate-Waechter**, ueber den Namenskern,
   nicht ueber `name_en`. `[read]` **Sonst faellt dasselbe beim
   naechsten Import wieder durch.**

## Und der zweite Befund aus C-275

`[cmd]` **Die frische Kette erzeugt 416 sichtbare, live sind es 447.**
Dein Grund: live waren es vor C-275 schon 318, die Kette erzeugt 290.

`[read]` **Das ist C-265 in neuer Form** — die Kette laeuft wieder
auseinander, diesmal um **31 Eintraege.** `[read]` **Und es ist
derselbe Mechanismus:** ein Schritt fehlt in der Kette, oder live steht
etwas, das nie verkettet wurde.

**Miss es, wie du C-265 gemessen hast**, und melde welcher Fall
vorliegt. `[read]` **Nicht live anpassen, um die Kette gruen zu
bekommen.**

## WAS NICHT ZU TUN IST

**Keine Substanz loeschen.** `parent_id` setzen, nicht entfernen.
**Keine zwei Formen zusammenlegen**, zu denen es keinen Sammelnamen
gibt.
**Keine Anreicherung** — C-272 kommt danach.

`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    Dublettengruppen ueber Namenskern   18 -> Zahl nennen
    im_katalog                         447 -> Zahl nennen
    unsichtbar mit Gegenstueck          66 -> Zahl nennen
    Kette gegen Live                416/447 -> beide nennen

**Gegenprobe:** `Vitamin C` bleibt sichtbar, `Vitamin C (ascorbic
acid)` wird Unterform. `Vitamin B3 (nicotinic acid)` und
`(nicotinamide)` **bleiben beide sichtbar** — und du begruendest es.

**Negativprobe:** eine Dublette absichtlich anlegen, der neue Waechter
muss sie finden. `[read]` **Ueber den Kern, nicht ueber den vollen
Namen** — sonst hat er dasselbe Loch wie meine Vorgabe.

## PIPELINE

Kettenschritt hinter `141c`. Wegwerf-Datenbank, Sicherung vorher, live
einspielen mit Vollsicherung in `backup/vollsicherung/`.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der C-272-Entwurf `141d_kimi_wada_scope.ts` liegt untracked
im Baum** — nicht verdrahtet, nicht ausgefuehrt. **Lass ihn liegen**,
er wird nach C-276 gebraucht.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
