---
nr: A-71
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-68
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a47dbb65
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

## Auftrag — der Waechter fuer ungenutzte Lesewege

**Mitbeauftragt: C-423.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · A-71 — sechs Faelle an einem Tag

    G-364   <RecMuscleMap /> ohne Prop                3 Kacheln
    G-365   Today-Sitzung aus festem Objekt           1
    G-365   Modalitaeten, modality_log ungenutzt      4
    G-365   Rechenweg las TDEE_STATE statt tdee-Prop  1
    G-366   ladeSitzungsUebungen nicht durchgereicht  1

`[read]` **Jedes Mal hat Tom es gefunden, nicht ein Agent.**

`[read]` **Und jedes Mal trug die Kachel weiter den Vermerk *,,noch
nicht angebunden"*** — **er log und verhinderte, dass jemand
nachsah.**

### Der Weg, den ich fuer richtig halte

`[read]` **Nicht: eine Datei, die importiert und nicht aufruft.**
`[read]` **Sondern: eine Tabelle mit Zeilen, die keinen Leser
hat.**

`[cmd]` **`modality_log` mit 178 Zeilen war so ein Fall** — **der
zweite Weg findet auch, was noch gar keinen Import hat.**

`[read]` **Miss, ob er sich bauen laesst** — **und wenn nicht, sag
warum.**

### 2 · C-423 — `stack_templates`

`[cmd]` **14 Spalten, 0 Zeilen.**

`[read]` **Vor dem Fuellen ist eine Frage zu klaeren, und sie
gehoert Tom:**

`[cmd]` **`source` und `is_public` deuten auf zwei Herkuenfte** —
**Katalog und Nutzer.**

`[read]` **Ist eine Vorlage ein vorgeschlagener Stack fuer ein
Ziel** — **oder eine Sammlung, die ein Nutzer teilt?**

`[cmd]` **`goal` verbindet sie mit `goals.user_goals`, vier
`goal_type`-Werte** (G-352).

`[read]` **Miss, was die Spec sagt** — `docs/specs/Supplements/`
**und `00-QUELLEN.md` zuerst.** `[read]` **Dann leg Tom die Frage
vor, statt sie zu entscheiden.**

### Abnahmebedingungen

    A1  Waechter: laesst er sich bauen? Ja mit Nachweis, oder
        nein mit Grund.
    A2  Wenn ja: Gegenprobe. Einen Leser entfernen -> rot,
        zurueck -> gruen.
    A3  Wenn ja: wie viele Tabellen mit Zeilen ohne Leser
        gibt es heute? Zahl, je Tabelle.
    A4  C-423: was die Spec sagt, mit Fundstelle.
    A5  C-423: die Frage an Tom, in einem Satz.

### Was nicht zu tun ist

**`stack_templates` nicht fuellen** — **erst die Frage.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort an G-344.**
Nicht committen, nicht stagen, nicht pushen.

### Und der Kettenlauf

`[cmd]` **Der taegliche Lauf von gestern 21:00 ging nicht durch** —
**das Gate ist deshalb rot.**

`[read]` **Wenn dein `lumeos_c422_final3` durchgelaufen ist, sag
es** — **dann ist C-422 endgueltig zu.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Abnahme

**2026-09-08, Orchestrator: nicht baubar, mit Grund.**

`[cmd]` **Codex:** *,,Ein korrekter Waechter *Tabelle mit Zeilen
ohne Leser* laesst sich aus dem aktuellen Bestand nicht beweisbar
bauen."*

**Drei Gruende, alle konkret:**

`[read]` **Leser koennen ueber Sichten, RPCs und generische
Funktionen laufen** — **ohne den Tabellennamen im App-Code zu
tragen.**

`[read]` **Ein reiner Quelltext-Scan wuerde falsche rote Befunde
erzeugen.**

`[cmd]` **Dieselbe Lehre wie C-415:** **eine Pruefung, die falsch
rot meldet, ist so schaedlich wie eine, die falsch gruen meldet.**

### Was bliebe

`[cmd]` **Eine gepflegte, testbare Leser-Registry** — **das ist ein
eigener Punkt, kein Nebenbei.**

`[read]` **Bis dahin bleibt das Muster ein Befund, den ein Mensch
findet** — **sechsmal am 07.09., jedes Mal von Tom.**

**Geschlossen als nicht baubar.**
