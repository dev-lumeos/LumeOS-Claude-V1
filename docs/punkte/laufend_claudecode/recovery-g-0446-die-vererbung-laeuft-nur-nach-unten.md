---
nr: G-446
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-445
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/training/muskelzustand.ts
zahlen:
  gemessen: 2026-09-08
---

# G-446 — die Vererbung laeuft nur nach unten

## Der gemeinsame Nenner von vier Befunden

Tom, 2026-09-08: *,,schau zuerst selber, was die liste
betrifft, vorallem child vom triceps."*

`[read]` **Ein Elternteil weiss nicht, was seine Kinder tun.**

## Befund 1: Koepfe zeigen `--`, der Elternteil rechnet

    Triceps                        100%  607 h - 7 Saetze
      Triceps Brachii Lateral Head   --  keine Uebung trifft ihn
      Triceps Brachii Long Head      --  keine Uebung trifft ihn
      Triceps Brachii Medial Head    --  keine Uebung trifft ihn

    Quadriceps                     100%  751 h - 7 Saetze
      Vastus Lateralis               --  keine Uebung trifft ihn
      Vastus Medialis                --  keine Uebung trifft ihn

`[read]` **Widersinnig: der Trizeps wurde trainiert, seine drei
Koepfe angeblich nicht.**

`[cmd]` **Und `Rectus Femoris` steht direkt daneben mit `Wert
von Quadriceps`** ? **dieselbe Ebene, andere Antwort.**

`[read]` **Die Marke *,,keine Uebung trifft ihn"* ist FALSCH bei
einem Kopf, dessen Elternteil getroffen wird** ? **er leiht,
wie G-438 es baut.**

`[cmd]` **Betroffen, gemessen:**

    triceps-longum, -lateralis, -mediale
    vastus-lateralis, -medialis
    gastrocnemius-lateralis, -medialis

`[read]` **Sieben Koepfe** ? **ihre Eltern (`Triceps` 305,
`Quadriceps`, `Calves`) haben Zuordnungen.**

## Befund 2: ein Elternteil ohne Wert vererbt einen

    Lower Back        --    Kinder ohne eigene Messung
      erector spinae  100%  Wert von Lower Back

`[read]` **Woher nimmt der Erector einen Wert von einem
Elternteil, der keinen hat?**

`[cmd]` **`erector spinae` hat 204 EIGENE Zuordnungen** ? **er
muesste selbst rechnen, nicht leihen.**

## Befund 3: ein unbelastetes Elternteil mit trainiertem Kind

    Chest              100%  unbelastet - nie trainiert
      Pectoralis Major 100%  607 h - 7 Saetze - Push 6

`[read]` **Ein Elternteil kann nicht unbelastet sein, wenn sein
Kind trainiert wurde.**

`[cmd]` **Dasselbe bei `Glutes`, `Hamstrings`, `Adductors`** ?
**ueberall, wo ein Kind Saetze hat und der Elternteil nicht.**

## Was zu bauen ist

`[read]` **Die Vererbung muss in BEIDE Richtungen gehen:**

    nach unten   ein Kind ohne eigene Messung leiht vom
                 Elternteil            (G-438, gebaut)
    nach oben    ein Elternteil ohne eigene Messung
                 verdichtet aus den Kindern   (FEHLT)

`[cmd]` **Und die Reihenfolge zaehlt:**

    1  hat der Muskel EIGENE Saetze?      -> rechnen
    2  hat ein Elternteil Saetze?         -> leihen
    3  haben Kinder Saetze?               -> verdichten
    4  keine Uebung trifft ihn und keinen
       seiner Verwandten                  -> Marke

`[read]` **Heute fehlt Schritt 3, und Schritt 4 wird zu frueh
erreicht.**

## Abnahmebedingungen

    A1  die sieben Koepfe leihen vom Elternteil.
        Foto Liste.
    A2  erector spinae rechnet SELBST (204
        Zuordnungen), leiht nicht.
    A3  Chest zeigt den verdichteten Wert seiner
        Kinder, nicht "unbelastet".
    A4  "keine Uebung trifft ihn" nur noch, wenn
        weder Muskel noch Eltern noch Kinder
        getroffen werden. Zahl vorher/nachher.
    A5  Gegenprobe je Richtung: ein Kind ohne
        Elternteil, ein Elternteil ohne Kinder.
    A6  apps/web 1717 oder mehr.

