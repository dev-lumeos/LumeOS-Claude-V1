---
nr: A-71
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-68
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  faelle: 3
  kacheln: 8
---

# A-71 — der Leseweg liegt daneben

## Befund

**Dreimal am 2026-09-07, in drei Modulen:**

    G-364   <RecMuscleMap /> ohne Prop gerufen        3 Kacheln
            der Leseweg lag ungenutzt daneben
    G-365   Today-Sitzung aus festem Objekt           1
            verlauf.sitzungen lag daneben
    G-365   Modalitaeten aus Entwurfskonstanten       4
            recovery.modality_log, 178 Zeilen, ungenutzt

`[read]` **Kein Versehen, sondern eine Gewohnheit:** **eine Kachel
wird aus Entwurfskonstanten gebaut, der Leseweg entsteht spaeter,
und niemand verbindet sie.**

`[read]` **Und schlimmer: die Kachel traegt weiter den Vermerk
*,,noch nicht angebunden"*** — **er luegt und verhindert, dass
jemand nachsieht.**

Tom, 2026-09-07: *,,DIE WAREN ANGEBUNDEN UND HABEN VOLLUMFAENGLICH
FUNKTIONIERT."* — **er hatte recht, dreimal.**

## Was ein Waechter koennte

`[read]` **Eine Datei, die eine Ladefunktion importiert und nicht
aufruft, ist messbar.**

`[cmd]` **Beispiel: `tab-messwerte.tsx` importierte
`KARTE_ZU_RECOVERY` und zeigte trotzdem
`MUSCLE_GROUPS_BODYMAP`.**

`[read]` **Und umgekehrt: eine Tabelle mit Zeilen, die kein Leser
hat** — `[cmd]` **`modality_log` mit 178 Zeilen war so ein Fall.**

`[read]` **Der zweite Weg ist der bessere** — **er findet auch, was
noch gar keinen Import hat.**

## Zu bauen

`[read]` **Ein Waechter, der Tabellen mit Zeilen ohne Leser
zaehlt.**

`[cmd]` **`punkte-pruefen.mjs` und `mockup-deckung.mjs` sind die
Vorbilder** — **beide im Gate, beide in beide Richtungen belegt.**

`[read]` **Und die Gegenprobe: einen Leser entfernen, der Waechter
muss melden.**
