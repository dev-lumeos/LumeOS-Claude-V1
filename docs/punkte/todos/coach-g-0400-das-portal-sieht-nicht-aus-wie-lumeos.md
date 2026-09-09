---
nr: G-400
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-398
entscheidung: null
beruehrt:
  dateien:
    - apps/coach/src/app/tokens.css
zahlen:
  gemessen: 2026-09-08
  tokens_coach: 73
  globals_web: 1184
---

# G-400 — das Portal sieht nicht aus wie LumeOS

## Befund

Tom, 2026-09-08, nach dem Blick auf 3220: *,,alles
schwachsinn."*

`[cmd]` **Bildschirmfoto `backup/g398-overview.png` nachgesehen:
weisser Hintergrund, andere Typografie, kein Modulkopf.**

`[read]` **Die Karten sind richtig eingeordnet** ? **aber es sieht
nicht aus wie LumeOS.**

## Warum

`[cmd]` **`apps/coach/src/app/layout.tsx` laedt:**

    @lumeos/ui/styles.css
    ./tokens.css      73 Zeilen
    ./portal.css     281 Zeilen

`[cmd]` **`apps/web` laedt `globals.css`** ? **1.184 Zeilen, plus
`AppShell`, `next-intl`, Modus-Cookie.**

### Die Tokens sind eine Kopie

`[cmd]` **`tokens.css`, Zeile 1-7:**

> *,,KOPIE aus `apps/web/src/styles/themes/lume.css` (Stand
> 2026-08-20), Werte unveraendert ? `v2.css` (aus `@lumeos/ui`)
> braucht sie, und `apps/web` darf von diesem Auftrag nicht
> angefasst werden (F-07). Wer die Tokens aendert, aendert BEIDE
> Dateien ? oder zieht sie in ein Paket."*

`[cmd]` **Stand 2026-08-20** ? **drei Wochen alt.**

`[read]` **Und `apps/web` hat seither elf Modul-Akzenttokens
bekommen** (G-384).

### Und die Klassen sind eigene

`[cmd]` **`portal.css`:** *,,eigene Klassen unter `cp-`, damit
keine Regel die v2-Bausteine aus `@lumeos/ui` trifft."*

    .cp-shell   .cp-kopf   ...

`[read]` **`apps/web` nutzt `v2-module-header`,
`v2-module-hero-lite`, `v2-kopf-mitte`** ? **das Portal keines
davon.**

`[read]` **Zwei Designs im selben Haus.**

### Der helle Modus

`[cmd]` **`layout.tsx`: der Modus kommt aus
`prefers-color-scheme`** ? **KEIN Modus-Cookie in dieser App.**

`[cmd]` **`apps/web` liest den Cookie** ? **deshalb dort dunkel,
hier hell.**

`[read]` **Wer zwischen den Anwendungen wechselt, sieht zwei
verschiedene Produkte.**

## Was zu entscheiden ist

**a** ? **Die Tokens nach `packages/ui`**, beide Anwendungen
darauf.

`[cmd]` **Der Kommentar in `tokens.css` schlaegt es selbst vor.**

`[read]` **Loest die Kopie, aber nicht die `cp-`-Klassen.**

**b** ? **Das Portal auf die `v2-`-Bausteine umstellen.**

`[read]` **Dann sieht es aus wie LumeOS** ? **aber es ist ein
anderer Aufbau: kein Tageswechsler, keine Modulnavigation, ein
Athlet statt eines Tages.**

`[cmd]` **G-399 hat denselben Befund im Kleinen:** **der
Referenz-Trenner steht jetzt zweimal.**

**c** ? **Beides.** `[read]` **Tokens ins Paket, Klassen
angleichen, Modus-Cookie teilen.**

## Was gemessen werden muss

`[read]` **Welche `cp-`-Klasse hat ein `v2-`-Gegenstueck?**

`[cmd]` **281 Zeilen `portal.css` gegen 1.184 `globals.css`** ?
**die Schnittmenge ist zu messen, nicht zu schaetzen.**

`[read]` **Und ob der Aufbau ueberhaupt derselbe sein soll** ?
**ein Arbeitsplatz ist kein Tagebuch.**

## Der Abstand, gemessen — nicht nur grafisch

Tom, 2026-09-08: *,,das hat nichts, gar nichts, nicht mal 1% etwas
mit meiner coaching plattform zu tun. weder grafisch noch
inhaltlich."*

`[read]` **Er hat recht, und der Orchestrator hat es nie
gemessen.**

### Der Kopf

`[cmd]` **Die Vorlage (`module-coach.jsx`, `CoachPortalStandalone`):**

    <div className="module-header">
      <div className="module-title-block">
        <span className="module-title">Coach Portal</span>
        <Pill variant="acc">separate platform</Pill>
        <Pill className="mono">coach.lumeos.app</Pill>
        <Pill>{n} athletes</Pill>
        <Pill><Icon name="alert"/>{m} alerts</Pill>
        <div className="module-sub">
          Coach workspace ? read-only on client data
          ? every call permission-checked</div>
      <div className="module-actions">
        <button className="btn">Broadcast</button>
        <button className="btn btn-primary">New plan</button>

`[cmd]` **Gebaut: `cp-kopf` mit Titel, zwei Pills, E-Mail
rechts.**

`[read]` **Kein `module-header`, keine Aktionen, kein
Untertitel.**

### Die Reiter

`[cmd]` **Die Vorlage traegt ZAEHLER je Reiter:**
`Athletes 3`, `Smart alerts 7`, `Rules 6`, `Plans 4`,
`Workflows 4`, `Programs 4`, `Messages 7`.

`[cmd]` **Gebaut: drei von sechzehn haben einen Zaehler.**

### Der Overview

`[cmd]` **Die Vorlage:**

    vier Kennzahlen MIT TREND
      Active athletes    3     +2 last 30d
      Median compliance  91%   30-day rolling   gruen
      Alerts open        7     3 athletes affected  gelb
      MRR ? 30d          4.820 +420 vs prior 30d

    Athletes needing attention
      Avatar, Name, Plan, "last 2d",
      Pill "2 alerts", Compliance farbig,
      KLICKBAR -> athleteDet-Modal

    Today's sessions logged   6 of 14 + Sparkline

`[cmd]` **Gebaut:**

    vier Zahlen OHNE Trend
      Aktive Athleten 2 von 3
      Check-ins eingereicht 1
      Alerts offen 2
      Vorschlaege offen 1

    Athleten: drei Namen mit Datum-Pill

`[read]` **Kein Avatar, keine Compliance, keine Farbe, kein Klick,
keine Sparkline.**

### Was das heisst

`[read]` **Der Unterschied ist nicht *,,noch nicht angebunden"*** ?
**es ist eine andere Anwendung.**

`[cmd]` **Die Vorlage zeigt einen Arbeitsplatz mit Kennzahlen,
Verlaeufen und Handlungen.** `[cmd]` **Gebaut ist eine Liste.**

`[read]` **Und der Orchestrator hat in G-391 und G-398 nur Karten
GEZAEHLT** ? **nie gemessen, ob eine Karte zeigt, was die Vorlage
zeigt.**

`[read]` **Eine Karte mit dem richtigen Titel und der falschen
Form gilt in beiden Auftraegen als *,,angebunden"*.**

## Was daraus folgt

**Der Abgleich muss auf Feldebene gehen, nicht auf Kartenebene.**

    je Karte  welche Felder zeigt die Vorlage?
              welche zeigt der Bau?
              welche fehlen, und warum

`[cmd]` **Beispiel `Athletes needing attention`:**

    Vorlage   Avatar, Name, Plan, letzte Sitzung,
              Alertzahl, Compliance farbig, Klick
    Bau       Name, Datum
    fehlt     5 von 7 Feldern

`[read]` **Das ist der Massstab, den beide Auftraege nicht
hatten.**
