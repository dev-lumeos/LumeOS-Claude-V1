---
nr: C-163
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-158
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 7146abc8
beruehrt:
  tabellen: [supplements.supplement_nutrients, supplements.intake_logs]
zahlen: null
---

# C-163 - 94 Substanzen ohne maschinenlesbare Naehrstoffmenge

## Befund

(neu 2026-08-20). **Fuer den Rechercheweg.** Rest aus C-158.

  `[cmd]` **Gemessen:** 567 Substanzen, **111 moegliche
  Naehrstofftraeger, 17 eindeutig zugeordnet.**

  `[cmd]` **Was fehlt, je Substanz:** **BLS-Code** (aus unseren 138) und
  **Menge je Portion mit Einheit.**

  `[read]` **Der Code kommt von uns** — Kimi kennt `nutrient_defs` nicht.
  **Die Menge steht auf dem Etikett** und ist seine Aufgabe.

  `[cmd]` **Und drei Einheiten brauchen die Form**, bevor sie
  umgerechnet werden koennen: **Vitamin A** (Retinol gegen Carotinoide),
  **Vitamin E** (natuerlich gegen synthetisch), **Folat** (Folat,
  Folsaeure, DFE).

## Auftrag — die Naehrstoffkette der Supplemente fuellen

**Mitbeauftragt: C-351.** Bericht in diese Datei.

### Das Ergebnis, auf das es hinauslaeuft

`[cmd]` **`supplements.supplement_nutrients` traegt 17 Zeilen fuer 17
Substanzen — von 412 im Katalog.** `[cmd]` **`intake_logs` hat 744
Einnahmen.**

`[read]` **Solange die Kette leer ist, kann Supplements keine
Tagesbilanz rechnen** (C-351, E-35). **Und die Obergrenzen fuer
Magnesium, Niacin und Folsaeure bleiben wirkungslos**, weil sie nur
fuer Praeparate gelten und niemand weiss, was aus Praeparaten kam
(C-344).

**Nach diesem Auftrag soll eine Tagesbilanz rechenbar sein.**

### 1 · C-163 — die 94 Substanzen

`[read]` **Der Punkt nennt 94 ohne maschinenlesbare
Naehrstoffmenge.** `[read]` **Miss nach** — er ist aelter als der
Katalogneuaufbau.

`[read]` **Und miss, welche ueberhaupt gebraucht werden:** `[cmd]`
**von 360 Einnahmen erreichen 90 einen Naehrstoffcode, alle
denselben** (C-323). **Die Substanzen, die jemand nimmt, sind
wenige** — **die zuerst.**

### 2 · C-351 — die Tagesbilanz

`[read]` **Dieselbe Gestalt wie `nutrition.daily_summary`:** aus
`intake_logs` und `supplement_nutrients`, je Tag und Naehrstoff.

`[cmd]` **E-35 gilt: jedes Modul rechnet seine eigene Bilanz,
summiert wird oben.** **Kein Griff nach `nutrition.meal_items`.**

`[read]` **Und dieselbe Ehrlichkeit wie dort:** eine Einnahme ohne
Naehrstoffzuordnung ist **nicht null, sondern unbekannt.**

### Was nicht zu tun ist

**Kein Katalogausbau.** `[read]` **Tom, 27.08.: *,,Schluss mit
Katalogdetails."*** **Es geht um die Naehrstoffmengen, die eine
Bilanz braucht — nicht um Beschreibungstexte, Evidenzstufen oder
Interaktionen.**

**Keine Menge raten.** `[read]` **Was auf der Packung steht, steht in
den Daten oder nicht** — **und wenn nicht, bleibt es unbekannt.**
`[cmd]` **Dieselbe Regel wie bei den Umrechnungsfaktoren in C-342 und
den Tag-Schwellen in G-221.**

`apps/` nicht anfassen — Claude Code arbeitet an G-274.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Substanzen mit Menge      vorher / nachher
    davon tatsaechlich        wie viele werden eingenommen?
      genommen
    Einnahmen mit Naehrstoff  vorher 90 von 360, nachher
    Tagesbilanz               rechnet sie? an einem Tag belegt
    unbekannte Mengen         Zahl - nicht als null gerechnet
    ohne Beleg geblieben      welche, mit Grund

`[read]` **Die vorletzte Zeile ist die ehrliche:** **wie viel bleibt
unbekannt, und weiss die Bilanz es?**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### 2026-08-30 - C-163 und C-351 umgesetzt

Der Live-Bestand weicht an zwei Stellen von der alten Punktzahl ab:

| Messung | Ist |
|---|---:|
| Katalog `supplements.supplements` | 596 (nicht 412) |
| `supplement_nutrients` | 17 Zeilen fuer 17 Supplements, alle `bekannt` |
| `intake_logs` | 744: 677 `taken`, 67 `skipped` |
| bestaetigte Einnahmen mit belegter Naehrstoffmenge | 164, ausschliesslich `FAPUN3` |
| bestaetigte Einnahmen ohne belegte Naehrstoffmenge | 513 |

Die tatsaechlich genommenen Substanzen sind vier: `sub_4480fcfa86`
(Omega-3, der einzige belegte Pfad), `sub_9f9bb8c160` (ohne
Naehrstoffzuordnung), sowie die freien Stack-Eintraege `Magnesium` und
`Vitamin D3`. Die beiden freien Namen wurden in C-243 bewusst nicht auf
eine Katalog-Salzform umgehaengt. Das bleibt so: Aus dem Namen wird weder
eine Stoffidentitaet noch eine Menge geraten. Daher ist insbesondere die
supplementaere Magnesium-Menge weiter **unbekannt**, nicht 0; die in C-344
strukturierten Magnesium-, Niacin- und Folsaeure-Grenzen duerfen daraus noch
keine Bewertung ableiten.

`supplements.supplement_nutrient_intake_for_day(user_id, date)` ist als
Tagesbilanz repariert und liegt als Kettenschritt `351` vor. Sie liest nur
`supplements.intake_logs`, `stack_items` und `supplement_nutrients` - kein
Zugriff auf `nutrition.meal_items` oder `nutrition.daily_summary`.

- Alle Einnahmelogs zaehlen jetzt, auch wenn `stack_items.supplement_id`
  leer ist. Zuvor verschluckte ein Inner Join diese Logs.
- Belegte Werte bleiben je Tag und Naehrstoff summiert. Am 2026-08-19
  liefert der dev-Nachweis `FAPUN3 = 2 g` bei vier bestaetigten Einnahmen:
  eine belegt, drei unbekannt.
- Gibt es an einem Tag ausschliesslich unbekannte Einnahmen, liefert die
  Funktion eine Statuszeile mit `nutrient_code = NULL` und
  `total_amount = NULL`, dazu die Tageszaehler. Das ist absichtlich keine
  Nullbilanz.

Der vorhandene Betrag wird nicht neu berechnet: Die Funktion verwendet nur
die bereits belegte `supplement_nutrients.amount_per_serving`-Kette und die
bisherige, quellengebundene Vitamin-D-Normalisierung. Es wurden weder der
Katalog noch Zuordnungen, Schwellen oder Oberflaechen erweitert.

Nachweis: Wegwerf-Datenbank `lumeos_c163_probe` mit dem neuen Schritt und
`pnpm exec tsx supabase/_pipeline/_validierung/supplement-daily-balance.test.ts`
gruen; derselbe Test danach live gruen (2/2). `kette.json` ist valides JSON,
`node tools/migration-datenlogik-pruefen.mjs` und `git diff --check` sind
gruen. Vollsicherung vor dem Live-Eingriff:
`backup/c163/20260830_before_live.dump`, SHA-256
`E3972C1F4E7AD18C05E9E614E1C9396D19B1BD5918E12DA0AD47649B5F104E09`.
Keine Aenderung unter `apps/`, nichts gestagt oder committet.

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

`[cmd]` **`supplements.daily_intake_summary` steht live.**

`[cmd]` **513 unklare Einnahmen bleiben sichtbar, statt als 0 zu
gelten.** `[cmd]` **Nachweis am 19.08.: FAPUN3 = 2 g bei vier
Einnahmen — eine belegt, drei unbekannt.**

`[read]` **Das ist C-48 Regel 1 auf der Supplement-Seite** — und die
Zahl, um die der Auftrag gebeten hatte: *,,wie viel bleibt unbekannt,
und weiss die Bilanz es?"*

`[read]` **Und die Zurueckhaltung traegt:** *,,Magnesium- und
Vitamin-D-Freieintraege wurden nicht geraten oder umgehaengt."*
`[cmd]` **Das sind genau die zwei Stack-Positionen ohne
`supplement_id` aus C-323** — **sie bleiben unbekannt.**

`[cmd]` **`supplement_nutrients` steht weiter bei 17 Substanzen** —
**der Katalog wurde nicht ausgebaut, wie vorgegeben.**

`[read]` **E-35 eingehalten:** die Bilanz rechnet aus `intake_logs`
und `supplement_nutrients`, **kein Griff nach `nutrition.meal_items`.**

`[cmd]` Test in Wegwerf-Datenbank und live 2/2 gruen, Vollsicherung,
`apps/` unberuehrt.

**Abgenommen.**

