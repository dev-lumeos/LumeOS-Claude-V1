---
nr: G-569
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01

braucht: [G-561, G-565]
kind_von: G-561
entscheidung: E-83

quellen:
  - docs/punkte/erledigt/goals-g-0561-sechs-waechter-pruefen-kilogramm-statt-prozent.md
  - docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md

beruehrt:
  dateien:
    - apps/web/src/lib/goals/anpassung.ts
    - apps/web/src/lib/goals/uebergangswaechter.ts
---

# G-520 prueft Kilogramm in der Anwendung

## Der Befund

`[cmd]` **Codex hat die Katalogseite umgestellt und die Anwendungsseite
gemeldet statt sie mitzunehmen** — `apps/` gehoert ihm nicht. Vom
Orchestrator nachgelesen, `anpassung.ts:217-222`:

    d.weightTrend > -0.1   &&  calorieAdherence > 85   ->  -100 kcal
    d.weightTrend < -1.0                              ->  +150 kcal

**Zwei Konstanten in Kilogramm je Woche**, dazu dieselbe Klasse in
`uebergangswaechter.ts:123`. `[cmd]` **Fuer `lean_bulk`: +0,75 und
+0,1 kg/Woche.**

`[read]` **Damit stehen jetzt zwei Maßstaebe nebeneinander:** der Katalog
prueft relativ (1,194 %), die Anwendung absolut (1,0 kg). **Bei 83,74 kg
ist das dieselbe Grenze — bei 60 kg nicht.** Dort greift der Katalog bei
0,716 kg und die Anwendung erst bei 1,0.

## Was Codex schon geliefert hat

`[cmd]` **Die Umrechnung, ohne Aenderung der Strenge:**

    1,00 kg  ->  1,194 %
    0,75 kg  ->  0,896 %
    0,10 kg  ->  0,119 %

`[cmd]` **Und die Bezugsgroesse ist entschieden** (G-561/A2, gegen die
Vorgabe des Orchestrators und mit Begruendung): **das letzte gueltige
Gewicht am Pruefstichtag**, nicht das am Phasenbeginn. Die Zielrate ist
die Absicht der Phase; der Waechter bewertet einen gegenwaertigen
Vorgang. **Fehlt am Stichtag ein Gewicht, ist das ein Hindernis** — kein
Rueckfall auf Profil- oder Startgewicht.

`[cmd]` **Die drei Waechtertexte liegen woertlich vor**, je in Prozent
und in Kilogramm. Sie stehen im Bericht zu G-561 und sind zu uebernehmen,
nicht neu zu formulieren.

## Auftrag

**A1 — zaehlen, wo absolut geprueft wird.** `anpassung.ts` und
`uebergangswaechter.ts` sind belegt; **miss, ob es weitere gibt**, und sag,
wie du abgegrenzt hast. Eine Schwelle kann als Zahl, als Konstante oder in
einem Text stehen.

**A2 — relativ rechnen, mit dem Gewicht am Stichtag.** Die Umrechnung
liegt server-frei neben E-1 (G-565 baut sie gerade) — **benutzen, nicht
neu schreiben.** Fehlt das Gewicht, ist es ein Hindernis ueber
`hindernisSatz` (G-568), keine stille Null.

**A3 — die Strenge darf sich nicht verschieben.** Randprobe wie bei
Codex: bei 83,74 kg muss 1,000 kg greifen und 0,999 nicht; bei 60 kg
0,717 greifen und 0,716 nicht. **Zwei Gewichte, je zwei Werte** — das ist
die Stelle, an der absolut und relativ auseinanderlaufen.

**A4 — die Texte in beiden Einheiten**, nach E-83 und mit der Einheit, die
der Nutzer gewaehlt hat (G-565). Die Kilogrammfassung nennt die Grenze
**zu seinem Gewicht**, nicht eine pauschale Zahl.

**Nicht Teil:** der Katalog (G-561, erledigt) und die Frage, ob die Raten
nach Erfahrungsstufe abgestuft werden (G-566, bei Tobias).

`[read]` **Und ein Hinweis von Codex, der hierher gehoert:** werden die
Raten je Stufe abgestuft, **bewegen sich die Waechtergrenzen nicht
automatisch mit** — sie sind Text im Katalog und Konstanten hier. **Sag
im Bericht, ob dein Bau das aushaelt**, oder ob die Grenze dann aus der
Rate abgeleitet werden muss.

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · die Randprobe mit
zwei Gewichten · Sabotage je Waechter in beide Richtungen · Bild je
Einheit · `pnpm gate` gruen mit Testzahl und der Aussage zu den neun
Waechtern · nichts committen.
