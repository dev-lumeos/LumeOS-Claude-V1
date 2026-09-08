---
nr: G-17
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-17
braucht: []
kind_von: G-14
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-17 - Datum beim Modulwechsel mitgeben

## Befund

(neu 2026-08-17). Rest
  aus G-14.

  `[cmd]` Heute lebt das Datum nur in der Nutrition-Adresse. Wer im
  Tagebuch auf gestern blaettert und aufs Dashboard wechselt, sieht dort
  wieder heute.

  `[read]` **Ein gemeinsamer Zustand wurde geprueft und verworfen:** Der
  Kontext des Vorgaengers ist ein Browser-Zustand, hier gibt es
  Serverkomponenten je Route — ein Browser-Kontext wuesste das Datum,
  der Server nicht. Ein Cookie waere serverseitig richtig, **aber ein
  Datum, das sich ueber Tage merkt, ist eines, das man vergisst.**

  **Der Weg: als Suchparameter im Link.** `[cmd]` Heute gibt es genau
  eine Verlinkung zwischen Dashboard und Tagebuch — **deshalb noch
  nicht dringend.** Es wird dringend, sobald das Dashboard
  datumsabhaengige Kacheln bekommt.

## Auftrag — jetzt ist es dringend

**Mitbeauftragt: G-338, G-256.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Der Punkt sagt selbst, wann

> *,,Es wird dringend, sobald das Dashboard datumsabhaengige
> Kacheln bekommt."*

`[cmd]` **G-152 hat gerade den Aktivitaetsstrom angeschlossen** —
**eine Liste, nach `occurred_at` sortiert, 40 Zeilen.**

`[cmd]` **Und `dashboard/page.tsx` liest bereits `searchParams`.**

`[read]` **Der Weg steht im Punkt: als Suchparameter im Link.**

### 1 · G-17 — das Datum ueberlebt den Modulwechsel

`[cmd]` **Heute lebt es nur in der Nutrition-Adresse.**

`[read]` **Wer im Tagebuch auf gestern blaettert und aufs Dashboard
wechselt, sieht dort wieder heute.**

`[cmd]` **Der Punkt hat einen gemeinsamen Zustand geprueft und
verworfen** — **Serverkomponenten je Route, ein Browser-Kontext
wuesste das Datum, der Server nicht.**

`[read]` **Und ein Cookie waere serverseitig richtig, aber
*,,ein Datum, das sich ueber Tage merkt, ist eines, das man
vergisst."***

`[read]` **Miss zuerst, welche Module ein Datum fuehren** —
`[cmd]` **15 Dateien lesen heute `searchParams` oder `datum=`.**

### 2 · G-338 — eine freie Mahlzeit hat keinen Namen

`[read]` **Miss, was heute geschieht, wenn jemand eine Mahlzeit
ohne Namen anlegt.**

### 3 · G-256 — die Originaldatei zum Laborbericht

`[cmd]` **Codex baut gerade den Ablageweg** (C-429).

`[read]` **Miss nur, was die Oberflaeche braeuchte, und melde es** —
**bau nichts, bis der Bucket steht.**

### Lies zuerst

`[cmd]` **`00-QUELLEN.md`, Abschnitte dashboard und nutrition.**

`[cmd]` **Und `module-dashboard.jsx`** — **dort stand schon die
Antwort auf die Formfrage in G-152.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  welche Module fuehren ein Datum? Zahl: Module /
        davon mit Datum in der Adresse.
    A2  vom Tagebuch auf gestern, dann aufs Dashboard:
        welches Datum steht dort? Vorher/nachher belegt.
    A3  zurueck ins Tagebuch: bleibt es bei gestern?
    A4  E-69: Referenz unter der Linie, unveraendert.
        Zahl: angebunden / Referenzen.
    A5  G-338: was geschieht heute ohne Namen? Gemessen.
    A6  G-256: was die Oberflaeche braeuchte, als Liste.

### Was nicht zu tun ist

**Kein Cookie, kein Browser-Kontext** — **der Punkt hat beides
geprueft und verworfen.**
**Nichts in `supabase/` aendern** — **Codex arbeitet an C-429.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **Bei `hasStartTime` im Log: nur `.next/cache/webpack`
loeschen** (A-73).

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
