---
nr: A-29
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: A-28
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/components/shell/__tests__/v2-attrappen.test.ts", "tools/schuss.mjs"]
zahlen:
  gemessen: 2026-08-20
  sichtbare_marken: 6
  v2_attrappe_klassen: 10
---

# A-29 - Der Attrappen-Test koennte die gerenderte Seite zaehlen

## Befund

(neu 2026-08-20, aus A-28).

  `[cmd]` **Der Test liest Quelltext** (`v2-attrappen.test.ts` zaehlt
  `attrappe={ATTRAPPE}` je Datei). **A-24 haelt fest, dass Textmarken
  kein Mass sind** — und `tools/schuss.mjs` misst die gerenderte Seite
  in einem Aufruf.

  `[cmd]` **Die zwei Zaehlweisen gehen auseinander**, gemessen am
  2026-08-20 auf `/v2/nutrition?tab=plans`: **6 sichtbare Marken gegen
  10 `v2-attrappe`-Klassen** im HTML, weil die Klasse auch an
  Unterelementen haengt.

  `[read]` **Beide Zahlen sind richtig, sie messen Verschiedenes.**
  Wer umstellt, entscheidet damit auch, **welche der beiden die
  verbindliche ist** — und muss die Erwartungen aller Module neu setzen.

  `[cmd]` **Der Test braucht dann einen laufenden Dev-Server.** Heute
  laeuft er ohne. Das ist der eigentliche Preis, nicht der Umbau.

## Auftrag — den Attrappen-Test schaerfen

**Mitbeauftragt: A-60, G-173.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-30.**

### 1 · A-29 — der Test koennte die gerenderte Seite lesen

`[cmd]` **A-59 ist gemessen: 89 Marken im Quelltext, 24 am Schirm.**
`[read]` **Der Quelltext ueberschaetzt dreifach**, weil
`daten ? <Echt /> : <Attrappe />` beide Zweige enthaelt.

`[cmd]` **Du zaehlst deshalb seit Wochen am Schirm** — mit
`tools/schuss.mjs`, in jedem Bericht.

`[read]` **Die Frage ist, ob der Test das auch kann.** `[cmd]`
**`schuss.mjs` meldet `attrappen` und `konsolenfehler` als JSON** —
**die Zahl liegt also schon vor, sie steht nur in keinem Waechter.**

`[read]` **Und der Grund dagegen ist ernst zu nehmen:** ein Test, der
einen Server braucht, laeuft nicht im Gate. **Miss, was moeglich ist,
bevor du baust.**

### 2 · A-60 — eine `Map` ueber die Client-Grenze

`[cmd]` **Sie kommt leer an, ohne Fehler.** `[read]` **Das ist die
gefaehrlichste Klasse: kein Absturz, keine Meldung, nur nichts.**

`[read]` **Miss, wo im Baum das heute vorkommt** — **und ob ein
Waechter es fangen kann.** `[cmd]` **Der Serverimport-Waechter prueft
bereits Client-Chunks** — vielleicht liegt die Naht dort.

### 3 · G-173 — ein falscher Punktverweis in `scores-read.ts`

`[read]` **Klein.** `[cmd]` **Miss, ob er noch falsch ist** — die
Datei ist seit C-143 mehrfach angefasst worden.

### Was nicht zu tun ist

**Keinen Test bauen, der einen laufenden Server braucht**, ohne zu
sagen wie er im Gate laufen soll.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Attrappen am Schirm     kann ein Test sie zaehlen? gemessen
    Gate-tauglich           belegt oder als unmoeglich gemeldet
    Map-Faelle              Zahl, je Fundstelle
    Waechter dafuer         gebaut oder begruendet nicht
    G-173                   noch falsch? behoben oder ueberholt

`[read]` **Die zweite Zeile entscheidet A-29:** **ein Test, der nicht
im Gate laeuft, ist eine Zusage ohne Deckung.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
