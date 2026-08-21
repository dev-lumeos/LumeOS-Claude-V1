# 161 — Naehrstoffanzeige: 138 statt 37, mit Zeitfenstern

**Auftrag:** G-121 · **Stand:** 2026-08-20 · **Modul:** Nutrition
**Vorher:** C-157 (lange Form + Fensterfunktion, Codex), G-117
(Klappen, Filterplatz markiert), G-101/C-54 (Ordnung aus
`display_tier`), C-48 (Referenzbewertung)

**Kurz:** Der Nutrients-Tab liest jetzt die **lange Form** — alle 138
Naehrstoffe tragen Werte, nicht mehr 37. `[cmd]` **Staerke steht mit
188,1 g da statt als Strich**, und jede Zeile sagt, aus wievielen
Positionen ihre Summe stammt („11 von 14"). Die **Zeitfenster
1/7/14/30/45/60/90** laufen ueber `nutrient_summary_window` und stehen
in der Adresse; ein Fenster zeigt den **Schnitt je protokolliertem
Tag**, der Tag die Summe — beides steht angeschrieben. Die Tabelle
traegt die Mockup-Spalten (Wert · Erfasst · Ziel · Fortschritt · % ·
Status) und die Scope-Filter samt der Regel **„ein Elternteil bleibt
sichtbar, wenn ein Kind auffaellig ist"**. Das Detail-Modal ist NICHT
gebaut (C-161), sein Andockpunkt schon. Tests **447/447** (6 neue).

---

## Was jetzt sichtbar ist

`[cmd]` **138 von 138 tragen fuer heute einen Wert** (vorher: 37
Spalten aus `daily_summary`, der Rest Striche). Der Kopf des Tabs sagt
beides an: wieviele messbar sind und wieviele eine Referenz tragen.

- **Der Staerke-Fall (Toms Befund) ist zu:** `[cmd]` STARCH zeigt
  **188,1 g aus 11 von 14 Positionen** — die Zeile sagt selbst, dass
  drei Positionen keinen Wert fuehrten und die Summe eine Untergrenze
  ist. Alle 11 Kohlenhydrate stehen unter `SUGAR` bzw. daneben.
- `[cmd]` **ALC erscheint** (0,026 g aus 12 von 14 Positionen) und
  **alle sechs Ballaststoff-Arten** (FIBLMW, FIBHMW, FIBINS, FIBSOL,
  FIBHMWS, FIBHMWI) stehen in ihrer Gruppe.
- **Vollstaendigkeit je Zeile:** am Tag „11 von 14 Pos.", im Fenster
  „2/30 Tg. vollst." (`complete_day_count` je Naehrstoff). `[read]`
  Das ist die C-48-Ehrlichkeit in Zeilenform: die Zahl steht da, und
  ihr Fehlzaehler daneben.
- **Ziel, Fortschritt, %, Status** kommen aus
  `daily_reference_assessment` — **die persoenliche Auswahl trifft die
  Datenbank** (Geschlecht, Alter), nicht die Oberflaeche; eine zweite
  Auswahl hier waere eine zweite Wahrheit. `[cmd]` 31 der 138 tragen
  eine nutzbare Referenz (30 Ziele + 13 Obergrenzen, 12 ueberlappend);
  heute stehen 5 unter dem Ziel, 3 ueber der Obergrenze. **Status ist
  eine Aussage ueber die Zahl** („unter Ziel", „im Bereich", „ueber
  UL"), kein Urteil ueber die Person; ohne Referenz steht ein Strich.
- `[cmd]` **FAT und CHO zeigen bewusst keinen Zielwert:** ihre
  Referenz ist ein Energie-Anteil (`RI`, `E%`, Richtung `range`) ohne
  Grammzahl — ein Vergleich waere eine andere Rechnung
  (Energie-Prozent), nicht dieselbe Spalte. NIA und CHORL sind
  `not_applicable`. So erklaert sich 31 statt 35.

## Wie die Zeitfenster rechnen

`[cmd]` **Ein Pfad fuer alles:** `nutrient_summary_window(user,
stichtag, tage)` — `tage = 1` ist der Tag. Das Fenster steht in der
Adresse (`?fenster=30`), die Seite laedt serverseitig; unbekannte
Werte fallen auf den Tag zurueck (`fensterOderTag`, getestet).

- **Tag (Fenster 1): die Tagessumme.** — **Fenster > 1: der Schnitt
  je protokolliertem Tag** (`avg_per_logged_day`); nur der ist mit
  einem Tagesziel vergleichbar. Der Kopf sagt es an („gezeigt wird der
  Schnitt je protokolliertem Tag (30 Tage erfasst), nicht die
  Fenstersumme"), die Fenstersumme steht als Hinweis (`title`) an
  jedem Wert.
- `[cmd]` **Laufzeit:** 30 Tage **35,4 ms**, 90 Tage **91,8 ms**
  (Serverzeit, `explain analyze`); der Seitenwechsel auf
  `?fenster=30` im Browser 1,6 s inkl. Navigation und Rendern.
  `[cmd]` STARCH im 30er-Fenster: Schnitt **233,4 g/Tag** (Summe
  7.001 g, vollstaendig an 2 von 30 Tagen).
- **Die Prozentspalte rechnet im Fenster aus dem gezeigten Schnitt.**
  `[read]` Das weicht von der C-48-Regel „pct null bei Fehlzaehler"
  ab — dort verschwand die Zahl, weil der Fehlzaehler unsichtbar war;
  hier steht er in derselben Zeile („Erfasst"). Benannt, nicht
  versteckt.
- **`assessment_horizon_days` ist NICHT gefuellt** — die Spalten aus
  C-160 bleiben leer, wie beauftragt. Welcher Naehrstoff sinnvoll
  ueber 30 oder 90 Tage bewertet wird, ist eine Fachentscheidung, die
  Quellen braucht; bis dahin waehlt der Nutzer das Fenster selbst.

## Was die Filter tun

- **Alle / Auffaellig / Unter Ziel** (die Vorlage nennt sie all /
  watch / deficient). Auffaellig = Status „unter" oder „ueber";
  **Zeilen ohne Referenz sind unbewertet, nicht auffaellig** — der
  Filter sammelt sie nicht ein.
- **Die Vorlagen-Regel `hasChildOutOfRange` ist mitgebaut**
  (`kindTrifft`, rekursiv ueber alle Stufen): ein Elternteil bleibt
  sichtbar, wenn irgendein Nachkomme den Filter trifft. `[cmd]`
  Gemessen: unter „Auffaellig" bleibt **FASAT (selbst ohne Referenz,
  Strich)** stehen, weil darunter **F18:2CN6 (Linolsaeure) mit 94 %
  unter dem Ziel** liegt. 5 Gruppen zeigen Treffer (5× „unter Ziel",
  3× „ueber UL"), die uebrigen 7 sind ausgeblendet.
- **Ein aktiver Filter oeffnet die Treffergruppen** — wer nach
  Auffaelligem fragt, will es sehen, nicht erst aufklappen; „Alle"
  kehrt zum G-117-Standard zurueck (12/12 zu). Der Gruppenkopf zaehlt
  im Filter „N von M Eintraegen".
- `[cmd]` Die Rekursion ist mit 6 Waechtertests festgeschrieben
  (`naehrstoff-anzeige.test.ts`): Enkel haelt Grossvater sichtbar,
  `status null` zaehlt nie als auffaellig, „ueber" ist auffaellig,
  aber nicht „unter Ziel".
- Die Filterlogik liegt in `lib/nutrition/naehrstoff-anzeige.ts` —
  **bewusst ohne Server-Importe**: die Client-Komponente braucht sie
  zur Laufzeit, und ein Import aus `naehrstoff-ordnung.ts` zoege den
  Sitzungs-Client ins Browser-Bundle.

## Was auf C-161 wartet

- **Das Detail-Modal der Vorlage (720 px)** — Zusammensetzung,
  Spektrum, Quellen, Modulverweise. Es braucht `parent_code` in
  `nutrient_defs`; der **Andockpunkt existiert**: die Zeilen nehmen
  eine `waehlen`-Eigenschaft (Code der Zeile), bis dahin ist die Zeile
  bewusst ohne Klick — ein Zeiger-Cursor ohne Wirkung waere eine
  Attrappe.
- **Der 14-Tage-Trend: nicht gebaut, gemeldet.** `[cmd]` In der
  Vorlage ist er erfunden (`// Fake 14-day trend`, Z. 694). Bei uns
  waere er echt — die lange Form fuehrt jeden Tag je Naehrstoff —,
  aber sein Ort ist das Modal, und das wartet auf C-161. Er dockt
  dort mit an, mit echten Tageswerten statt einer Sinuskurve.

## Nachweise

| Behauptung | Beleg |
|---|---|
| 138 mit Wert | `[cmd]` 138 Zeilen im Tab (`tbody tr` = 138 bei allen Gruppen offen); Kopf „138 von 138" |
| STARCH | `[cmd]` Zeile „Stärke STARCH · 188,1 g · 11 von 14 Pos."; 30er-Fenster „233,4 g · 2/30 Tg. vollst." — beide Zahlen decken sich mit SQL |
| ALC + Ballaststoff-Arten | `[cmd]` ALC 0,026 g (12 von 14 Pos.); alle 6 FIB*-Codes im HTML |
| Fenster in der Adresse | `[cmd]` Klick „7 Tage" → `?fenster=7`, Kopf „Schnitt je protokolliertem Tag (7 Tage erfasst)"; „Heute" entfernt den Parameter |
| Laufzeit | `[cmd]` `explain analyze`: 30 T = 35,4 ms, 90 T = 91,8 ms |
| Eltern bleiben im Filter | `[cmd]` FASAT (Strich) sichtbar unter „Auffaellig" wegen F18:2CN6 (94 %) darunter |
| Zeilenschutz | `[cmd]` UI: test-user sieht devs Zahlen nicht (188,1/233,4 = 0 Treffer im HTML). Funktion direkt: test-user mit devs UUID → 138 Katalogzeilen, **0 mit Wert**; dev selbst 138/138 |
| Bilder | `backup/g121/`: hell/dunkel × 1440/375, Kohlenhydrate offen. Attrappen je 1 (Buddy-Orb der Schale, Bestand), je 2 Konsolenfehler (bekannte `data-mode`-Hydrationswarnung) |
| Typen und Tests | `[cmd]` typecheck gruen, Tests **447/447** (441 + 6 neue Filter-Waechter) |

## Befunde am Rand

- `[cmd]` **test-user traegt eine eigene Mahlzeit** (2026-08-16, aus
  einem frueheren Nachweis) — deshalb zeigt sein 30er-Fenster „134 von
  138 … 1 Tag erfasst". Das sind seine Daten, kein Leck; wer den
  Nullzustand messen will, muss die Mahlzeit erst abraeumen.
- `[read]` **Die Ziele haengen am Stichtag:** `daily_reference_assessment`
  liefert an einem Tag ohne Eintraege keine Zeilen — ein Fenster, das
  auf einem leeren Tag endet, zeigt Werte, aber keine Ziele. Als
  Folgepunkt notiert.

## Was nicht angefasst wurde

- **Kein Schema** — `supabase/` ist Codex' Bereich; die
  C-157-Vertraege sind nur benutzt. `assessment_horizon_days` bleibt
  leer.
- **`supplements/` und `packages/ui`** unveraendert.
- `daily_summary` bleibt stehen — Diary und Makro-Kacheln lesen sie
  weiter; umgestellt ist nur der Nutrients-Tab.
