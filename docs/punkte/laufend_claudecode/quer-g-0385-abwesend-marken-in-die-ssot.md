---
nr: G-385
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-384
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  falschaussagen: 5
  ssot_mit_marke: 0
---

# G-385 — `@abwesend`-Marken in die SSOT

## Befund

Aus G-384, Claude Code, 2026-09-08.

`[read]` **Sein bester Fund ist gegen seine eigene Arbeit
gerichtet:**

> *,,Der Waechter existiert bereits, und besser.
> `tools/abwesenheit-pruefen.mjs` steht seit A-62 im Gate und loest
> es umgekehrt: die Aussage traegt eine `@abwesend`-Marke, und der
> Waechter faellt, wenn die Kette die Tabelle anlegt. Eine Marke ist
> eindeutig, eine Verneinung in Prosa nie."*

`[cmd]` **Nachgemessen: `tools/abwesenheit-pruefen.mjs`, 184
Zeilen, seit A-62 im Gate** ? **mit sechs belegten Faellen vom
30.08.**

`[cmd]` **Und A-62 nennt seinen Fall woertlich:**
`C-175-Kommentar "shopping_lists gibt es nicht"`.

`[cmd]` **`@abwesend` steht in vier Punktdateien** ? **und in
KEINER `docs/ssot/`-Datei.**

## Warum das der Weg ist

`[read]` **Sein eigener Waechter meldete 72 Faelle, davon 2
echte.**

> *,,2 von 72 wird binnen Tagen ignoriert, und ein ignorierter
> Waechter taeuscht Abdeckung vor."*

`[read]` **Die Ursache ist grammatisch, nicht einstellbar:**
`[cmd]` **`83-dashboard.md:189` sagt woertlich, die Tabelle gebe es
trotzdem** ? **und wird gemeldet.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Abwesenheitsaussagen finden

`[read]` **Du hast sie schon gemessen: 58 Kandidaten, 5
Falschaussagen.**

`[read]` **Jetzt die Gegenrichtung:** **welche Aussagen sind
RICHTIG und sichern eine Abwesenheit, die enden koennte?**

`[cmd]` **Beispiel: `hrv_readings`, `sleep_data`** ? **es gibt sie
nicht, und wenn Codex sie baut, wird die Aussage still falsch.**

### 2 · Marken setzen

`[cmd]` **Die Form steht in `abwesenheit-pruefen.mjs:22`:**

    // @abwesend nutrition.shopping_lists
    // `[cmd]` Die Tabelle gibt es nicht - deshalb kein Schreibweg.

`[read]` **In Markdown entsprechend** ? **miss, ob der Waechter
`.md` liest, oder ob er erweitert werden muss.**

`[read]` **Und melde die Marken, schreib sie nicht** ? `docs/`
**gehoert dem Orchestrator.**

`[read]` **Ausser du misst, dass der Waechter eine eigene Liste
fuehrt** ? **dann sag mir, wo.**

### 3 · Dein Waechter

`[cmd]` **`tools/ssot-abwesenheit-pruefen.mjs`, ungehaengt.**

`[read]` **Er bleibt als Messwerkzeug auf Zuruf** ? **er hat die
fuenf Falschaussagen gefunden, und das war seine Arbeit.**

`[read]` **Vermerk im Kopf, dass er bewusst nicht im Gate steht,
und warum** ? **sonst haengt ihn jemand ein.**

### Abnahmebedingungen

    A1  wie viele richtige Abwesenheitsaussagen? Zahl:
        geprueft / sichernswert.
    A2  liest abwesenheit-pruefen.mjs Markdown? Ja mit
        Fundstelle, nein mit dem noetigen Zusatz.
    A3  die Marken, je Datei und Zeile, im Bericht.
    A4  Gegenprobe: eine Marke fuer eine EXISTIERENDE Tabelle
        -> der Waechter faellt. Zurueckgebaut.
    A5  dein Waechter traegt den Vermerk. Belegt.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **auch keine Marken.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-436.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
