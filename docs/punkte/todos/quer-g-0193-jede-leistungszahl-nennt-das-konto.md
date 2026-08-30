---
nr: G-193
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-26
braucht: []
kind_von: G-190
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/punkte/00-LIESMICH.md"]
zahlen: null
---

# G-193 - Jede Leistungszahl nennt das Konto

## Befund

(neu 2026-08-26).
  Aus G-190, von Claude Code selbst formuliert.

  `[read]` **Seine Lehre, woertlich:** *„In jede Zahl gehoert, welches
  Konto gemessen wurde — so wie seit dem 18.8. der Stichtag zu jeder
  Zahl gehoert. Meine erste Messung war auf dev richtig und auf
  test-user um Faktor 15 daneben."*

  `[cmd]` **Der Anlass:** die erste G-190-Meldung nannte 880 ms fuer
  `ladeRegeln`. Bei der Nachmessung standen dort **58 ms**. Fuenf
  Hypothesen einzeln geprueft und verworfen — Reihenfolge,
  Wiederholung, Messhuelle, Thunk-Liste, Importliste. **Es war das
  Konto.**

  `[read]` **Warum das eine Regel wird und keine Anekdote:** eine
  Leistungszahl ohne Konto ist so wenig wert wie eine Bestandszahl
  ohne Stichtag. **Beide sehen aus wie Fakten und sind
  Momentaufnahmen.**

  **Zu tun:** in `docs/punkte/00-LIESMICH.md` neben die
  `[cmd]`-Regel. `[read]` **Und pruefen, ob ein Waechter moeglich
  ist** — Berichte mit `ms` oder `s` ohne Kontoangabe. Wenn nicht:
  in die Auftragsvorlage.
