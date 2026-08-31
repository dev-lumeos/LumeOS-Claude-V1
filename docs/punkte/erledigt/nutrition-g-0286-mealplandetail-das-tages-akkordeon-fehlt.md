---
nr: G-286
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-286 — MealPlanDetail — das Tages-Akkordeon fehlt

## Befund

`[cmd]` **`SPEC_10` nennt `MealPlanDetail`: *,,Plan-Vorschau:
Tages-Accordion mit Items"*.**

`[cmd]` **Der *Active plan*-Reiter zeigt heute Zahlen** — 3 Wochen,
21 Tage, 56 Eintraege — **aber nicht die 56 Eintraege.**

`[read]` **Tom, 2026-08-31:** *,,ist das was wir spezifieziert haben
und editierbar sein soll? dann erklaer mir mal was das alles soll
darin."*

`[read]` **Ein Plan, den man nicht aufklappen kann, ist eine
Kennzahl, kein Plan.**

## Was zu bauen ist

**Das Tages-Akkordeon: je Tag die Eintraege, aufklappbar,
bearbeitbar.**

`[cmd]` **Die Daten stehen:** `meal_plan_entries` traegt 112 Zeilen,
`meal_plan_days` 42, `meal_plan_weeks` die Wochen. `[cmd]` **Der
Schreibweg steht seit G-267/G-268.**

`[cmd]` **Und `MealPlanDayView` ist gebaut** — im Planner-Reiter,
siebenmal nebeneinander. **Es fehlt die Tagesansicht innerhalb eines
Plans.**

## Auftrag — der Meal-plans-Reiter wird benutzbar

**Mitbeauftragt: G-287, G-290.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag kann man einen Plan oeffnen, seine
Tage sehen, ihn bearbeiten und aktivieren.**

`[read]` **Tom hat den Reiter am 31.08. durchgesehen. Sein Urteil:**
*,,irgend eine auflistung die gar nichts sagt, nichtmal anschaubar ist
oder editierbar."*

### Die Spec nennt die Komponenten

`[cmd]` **`docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md`,
Abschnitt *Meal Plan Components (8)*:**

    MealPlanList              gebaut, ohne Karte
    MealPlanCard              fehlt
    MealPlanDetail            fehlt
    MealPlanActivationModal   fehlt
    MealPlanDayView           gebaut, im Planner
    MealPlanComplianceBar     gebaut
    GhostEntryList            gebaut
    LifecyclePicker           fehlt

**Drei davon sind dieser Auftrag: `MealPlanCard`, `MealPlanDetail`,
`MealPlanActivationModal` mit `LifecyclePicker`.**

### Die Vorlagen im Altbestand

`[cmd]` **CLAUDE.md: Struktur ja, Code nie.**

    referenz/.../nutrition/components/MealPlanView.tsx   21 kB
    referenz/.../nutrition/hooks/useMealPlans.ts          6 kB
    referenz/.../api/coach/engines/meal-planner.ts      18 kB
    mockup-zwischenwurf/features/nutrition/...          11 kB

`[read]` **`MealPlanView.tsx` ist mit 21 kB die groesste** — **sie
zeigt, wie Liste, Karte und Detail zusammenhaengen.**

`[read]` **`meal-planner.ts` gehoert zum Coach-Modul** — **lies sie
nur, wenn du wissen willst, wie ein Plan entsteht; sie ist nicht Teil
dieses Auftrags.**

`[read]` **Wenn eine Vorlage etwas zeigt, das `SPEC_10` nicht nennt:
melden, nicht weglassen.**

### Was da ist

`[cmd]` **`meal_plan_entries` 112 Zeilen, `meal_plan_days` 42,
`meal_plan_weeks` die Wochen.** `[cmd]` **Der Schreibweg steht seit
G-267/G-268, der Lebenszyklus seit dem 30.08. im Schema.**

`[cmd]` **`plan_origin` traegt die Quelle** — das Source-Badge aus der
Spec. `[cmd]` **Die zwei Bestandsplaene haben `NULL`** — **zeigen,
nicht fuellen.**

### Was nicht zu tun ist

**Keine zweite Ansicht neben `MealPlanDayView`** — die ist gebaut und
wird wiederverwendet.
**Nichts auf `dev@lumeos.app` schreiben** — `test-user@lumeos.local`
mit Rueckbau.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** **Codex fasst ihn nicht
an.**

### Nachweis

    Plan oeffnen           Karte fuehrt aufs Detail, Bildschirmfoto
    Tage aufklappen        die 112 Eintraege sichtbar
    bearbeiten             schreibt, belegt mit Rueckbau
    aktivieren             Startdatum und Lebenszyklus waehlbar
    plan_origin NULL       wie sieht die Zeile aus
    Attrappen              am Schirm, vorher / nachher
    Ladezeit               ms, kalt und warm

## Bericht

**Claude Code, 2026-08-31.** Mitbeauftragt: G-287, G-290. Nichts auf
`dev@lumeos.app` geschrieben, nichts committet, nichts gestaged.

### Eine Zahl im Auftrag meint etwas anderes

`[cmd]` **Der Auftrag nennt *„meal_plan_entries 112 Zeilen,
meal_plan_days 42"*.** `[cmd]` **Das sind die Gesamtzahlen ueber zwei
Nutzer.** Gemessen am 2026-08-31:

    dev@lumeos.app         1 Plan · 3 Wochen · 21 Tage · 56 Eintraege
    tom.seed@example.com   1 Plan ·            21 Tage · 56 Eintraege
    ────────────────────────────────────────────────────────────────
    Summe                  2 Plaene ·          42 Tage · 112 Eintraege

`[read]` **Am Schirm sind es 21 Tage und 56 Eintraege** — der zweite
Plan gehoert einem Konto ohne Passwort und faellt per RLS heraus.
**Die Zahl im Nachweis („die 112 Eintraege sichtbar") ist so nicht
erreichbar**, und das liegt nicht am Bau.

### Gebaut: drei Komponenten aus SPEC_10

    MealPlanCard             Name, Quelle, Status, Tage, kcal/Tag
    MealPlanDetail           Tages-Akkordeon mit Eintraegen
    MealPlanActivationModal  Startdatum + Laenge + LifecyclePicker

**Alle drei in `apps/web/src/app/v2/nutrition/plan-detail.tsx`**, die
Regeln serverfrei in `lib/nutrition/plan-detail-lage.ts` (A-30).

### G-286 — das Akkordeon

`[cmd]` **Am Schirm, angemeldet, `?tab=plans` → *Plan library*:**

    Tages-Zeilen sichtbar   21
    offener Tag             4 Eintragszeilen
                            Slot · Eintrag · Menge · kcal

`[cmd]` **Beispiel 2026-06-18, 2.333 kcal:** breakfast
*Banane-Joghurt-Haferflocken* 1,25 Port. 617 · lunch *Huhn-Reis-Bowl*
1 Port. 789 · snack *Magerquark* 250 g 165 · dinner *Lachs mit
Suesskartoffel und Spinat* 1 Port. 762.

`[read]` **Die leere Woche sagt es auch:** sieben Zeilen
*„nichts geplant"* mit einem Strich statt einer Null. `[cmd]` **Und
die kopierte Woche traegt ihre Marke** (C-150).

**Zwei Regeln, die nicht offensichtlich sind:**

`[read]` **Ein Tag mit einem unbelegten Eintrag hat KEINE
Tagessumme.** `kcal: null` heisst *nicht ermittelbar*, nicht *null
Kalorien* — **eine Summe aus unvollstaendigen Teilen ist keine
Summe.** Die Zeile zeigt dann einen Strich.

`[read]` **Und der Schnitt auf der Karte zaehlt nur vollstaendige
Tage.** `[cmd]` **ø 1.960 kcal/Tag** ist der Mittelwert der belegten
Tage; die leeren senken ihn nicht.

### G-287 — die Karte

`[cmd]` **Vorher:** `PlanBibliothekEcht` — je Woche eine Textzeile,
nicht anklickbar. `[cmd]` **Tom, 2026-08-31:** *„irgend eine
auflistung die gar nichts sagt."*

`[cmd]` **Jetzt, am Schirm:**

    Aufbau-Wochenplan · [Herkunft nicht hinterlegt] · [active]
    21 Tage · 56 Einträge · ø 1960 kcal/Tag
    „Für diesen Plan ist keine Herkunft hinterlegt — er stammt aus
     der Zeit vor der Unterscheidung."
    [Zuklappen] [Laufzeit ändern]

`[read]` **`plan_origin = NULL` wird gezeigt, nicht gefuellt** — wie
beauftragt. Ein Waechter sichert, dass niemand `?? 'self_created'`
danebenschreibt.

`[cmd]` **A-59:** `PlanBibliothekEcht` hatte danach null Aufrufer —
**geloescht, nicht auskommentiert.**

### G-290 — Aktivieren mit LifecyclePicker

`[cmd]` **Der Dialog, am Schirm:**

    Plan aktivieren · Aufbau-Wochenplan
    STARTDATUM · LÄNGE IN TAGEN
    WAS AM ENDE GESCHIEHT
      läuft einmal ab          Nach der letzten Woche endet der Plan.
      beginnt danach von vorn  … startet er wieder bei Tag 1.
      geht in einen Folgeplan über … wird der Folgeplan aktiv.

`[read]` **Jede Wahl traegt ihre Wirkung** — G-270 hatte an der alten
Legende bemaengelt, dass drei Woerter ohne Erklaerung dastehen.

`[read]` **`unbekannt` ist nicht waehlbar.** Es ist der Zustand der
Bestandsplaene, keine Wahl — wer ihn anboete, liesse eine Leerstelle
schreiben.

`[cmd]` **Die Texte kommen aus `plan-lage.ts`, nicht aus einer
zweiten Fassung.** `[read]` **Mein erster Entwurf hatte sie
dupliziert** — zwei Wahrheiten ueber dieselbe Sache. Ein Waechter
verbietet das jetzt.

### Der Schreibweg — belegt, mit gezaehltem Rueckbau

`[read]` **Nichts auf `dev@lumeos.app`.** `[cmd]` **`test-user@lumeos.local`
hat keinen Plan** — also einen angelegt, aktiviert, geloescht.

    vorher                    0 Zeilen (test-user)
    anlegen (art: plan)       status assigned · lifecycle once
                              plan_origin self_created
    aktivieren                status active · lifecycle rollover
      (art: plan_aendern)     start_date 2026-09-01 · days_count 14
    am Schirm gelesen         „G-290 Schreibprobe · selbst erstellt
                               · active"
    Rueckbau                  DELETE 1
    nachher                   0 Zeilen (test-user)
    dev-Plan                  unveraendert: active, lifecycle NULL,
                              start_date NULL, plan_origin NULL

`[read]` **Der Unterschied ist sichtbar:** ein neu angelegter Plan
bekommt `self_created` und `once`; **der Bestandsplan bleibt bei
`NULL`, weil niemand seine Herkunft kennt.**

### Was nicht gebaut wurde, und warum

`[read]` **Keine zweite Tagesansicht.** `PlanEintraegeEcht` zeigt die
Eintraege EINES Tages mit ihrem Ausfuehrungszustand — Bestaetigen,
Ueberspringen, Flow 4. **Das ist die Ausfuehrung von heute.**

`[read]` **Das Akkordeon zeigt die STRUKTUR** — 21 Tage ohne
Zustandsknoepfe. **Wer beides zusammenlegt, bietet an einem Plantag
in vier Wochen Knoepfe zum Abhaken.** Ein Waechter haelt die Trennung.

### Nachweis

    Plan oeffnen        Karte fuehrt aufs Detail — backup/g286-soll.png
    Tage aufklappen     21 Zeilen sichtbar, offener Tag 4 Eintraege
                        backup/g286-soll-akkordeon.png
    bearbeiten          schreibt: anlegen + aktivieren auf test-user,
                        Rueckbau DELETE 1, dev unberuehrt
    aktivieren          Startdatum, Laenge und Zyklus waehlbar
                        backup/g290-dialog.png
    plan_origin NULL    „Herkunft nicht hinterlegt" + Begruendung
    Attrappen           Meal plans 0 vorher, 0 nachher
    Ladezeit            kalt 3.686 ms · warm 3.503 ms

### Waechter und Sabotageprobe

**Neu:** `apps/web/src/lib/nutrition/__tests__/plan-detail-lage.test.ts`
(11 Waechter).

**Elf Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256) —
alle elf fallen:**

    G-286  unbelegte Eintraege als 0 mitzaehlen
    G-286  den Schnitt ueber alle Tage rechnen
    G-286  nur die Anzahl statt der Eintraege zeigen
    G-286  die Tageszeile nicht mehr aufklappbar
    G-286  Flow-4-Knoepfe ins Akkordeon holen
    G-287  die Karte nicht mehr anklickbar
    G-287  die fehlende Herkunft auffuellen
    G-287  die abgeloeste Bibliothek zurueckholen
    G-290  `unbekannt` waehlbar machen
    G-290  das Startdatum nicht mehr schicken
    G-290  den Plan nicht mehr aktiv setzen

`[cmd]` **Zwei eigene Fehler, von der Probe gefangen:**

**a) Zwei Waechter zaehlten ein Vorkommen fuer zwei.**
`aria-expanded={offen}` steht an der Karte UND an der Tageszeile,
`onClick={onOeffnen}` am Kopf UND am Knopf. **Die Sabotagen entfernten
je eines — `assert.match` fand das andere und blieb gruen.**
Behoben: **gezaehlt statt gesucht** (dieselbe Lehre wie G-274,
G-281).

**b) Eine zweite Wahrheit im ersten Entwurf.** Ich hatte
`ZYKLUS_TEXT` und `ZYKLUS_ERKLAERUNG` neu definiert — **sie stehen
seit G-270 in `plan-lage.ts`.** Behoben: von dort benutzt, und ein
Waechter verbietet die Doppelung.

### Laeufe

    pnpm --filter @lumeos/web test    1091 pass, 0 fail (vorher 1080)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [encoding]                         20.490 Dateien sauber

### Dateien

    apps/web/src/app/v2/nutrition/plan-detail.tsx            neu
    apps/web/src/lib/nutrition/plan-detail-lage.ts           neu
    apps/web/src/lib/nutrition/__tests__/
      plan-detail-lage.test.ts                               neu
    apps/web/src/app/v2/nutrition/tab-plans.tsx        verdrahtet
    apps/web/src/app/v2/nutrition/plans-echt.tsx    A-59 geloescht
    backup/g286-soll.png, g286-soll-akkordeon.png,
      g290-dialog.png, g290-schreibprobe.png          Nachweis

## Abnahme

**2026-08-31, Orchestrator.**

**Der Reiter ist benutzbar: Plan oeffnen, Tage sehen, bearbeiten,
aktivieren.**

### Meine Zahl war die Summe ueber zwei Nutzer

`[cmd]` **Der Auftrag nennt *112 Eintraege, 42 Tage*.** `[cmd]`
**`dev` sieht 1 Plan, 21 Tage, 56 Eintraege** — **der zweite gehoert
`tom.seed@example.com` und wird von RLS gefiltert.**

`[read]` **Damit ist mein Nachweispunkt *,,die 112 Eintraege
sichtbar"* nicht erfuellbar** — **und das ist keine Bauluecke.**

### G-286 — das Akkordeon, mit zwei Regeln, die nicht offensichtlich sind

`[cmd]` **21 Tageszeilen, der offene Tag zeigt Slot, Eintrag, Menge,
kcal.**

`[read]` **Erstens: ein Tag mit einem unbewerteten Eintrag hat keine
Summe** — `[cmd]` **`kcal: null` heisst nicht bestimmbar, nicht
null.**

`[read]` **Zweitens: der Durchschnitt zaehlt nur vollstaendige
Tage** — `[cmd]` **ø 1.960 kcal statt einer Zahl, die leere Tage nach
unten ziehen.**

`[cmd]` **Die leere Woche liest *,,nichts geplant"* mit einem
Strich, die kopierte traegt ihre Marke.**

### G-287 — die Karte

`[cmd]` **Name, Herkunft, Status, Tage, kcal je Tag — und sie oeffnet
das Detail.**

`[cmd]` **`plan_origin = NULL` wird gezeigt, nicht gefuellt** —
**ein Waechter verbietet `?? 'self_created'`.**

`[cmd]` **`PlanBibliothekEcht` hatte keine Aufrufer mehr und ist
geloescht** (A-59).

### G-290 — die Aktivierung

`[cmd]` **Alle drei Zyklen mit ihrer Folge ausgeschrieben.**
`[read]` **Und `unbekannt` wird bewusst nicht angeboten** — **es ist
der Zustand der Altplaene, keine Wahl.**

### Der Schreibweg ist mit gezaehltem Rueckbau belegt

`[cmd]` **`test-user` hatte keinen Plan: 0 → angelegt
(assigned/once/self_created) → aktiviert (active/rollover, Start
2026-09-01, 14 Tage) → DELETE 1 → 0.**

`[cmd]` **Der `dev`-Plan ist unberuehrt** — weiter `NULL` bei Zyklus
und Herkunft.

### Keine zweite Tagesansicht

`[read]` **`PlanEintraegeEcht` ist die heutige Ausfuehrung —
bestaetigen und auslassen.** **Das Akkordeon ist die Struktur.**

`[cmd]` **Ein Waechter haelt sie auseinander** — **sonst staenden
Abhak-Knoepfe auf einem Plantag, der vier Wochen entfernt ist.**

### Zwei eigene Fehler, vom Sabotagelauf gefangen

`[cmd]` **Zwei Waechter zaehlten ein Vorkommen fuer zwei** —
`aria-expanded` und `onClick` kommen je zweimal vor. `[cmd]` **Und
sein erster Entwurf verdoppelte `ZYKLUS_TEXT`/`ZYKLUS_ERKLAERUNG`,
die seit G-270 in `plan-lage.ts` stehen** — **eine zweite Wahrheit,
jetzt von einem Waechter verboten.**

`[read]` **Er nennt die Falle beim Namen: viermal aufgetreten, nicht
durch Aufmerksamkeit vermeidbar** — **und hat sie als Regel
abgelegt.**

`[cmd]` 1091 Tests, 11 Sabotagen, Gate 11/11. Kalt 3.686 ms, warm
3.503 ms, 0 Attrappen.

**Abgenommen.**

