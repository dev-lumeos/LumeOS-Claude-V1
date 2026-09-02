---
nr: C-396
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-332
entscheidung: E-59
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: ae0fb34b
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-02
---

# C-396 — `meal_plans` traegt keine Struktur

## Befund

Aus E-59, 2026-09-02.

`[cmd]` **`rasterZeilen` rechnet die Zeilen aus
`food_preferences.meals_per_day` und `snacks_per_day`** — **den
Vorlieben des Nutzers.**

`[read]` **Auch bei einem Coach-Plan, einem gekauften und einem von
Buddy.**

`[cmd]` **E-59: ein gelieferter Plan bringt seine Struktur mit.**

## Was zu bauen ist

**Die Struktur am Plan, nicht nur an den Vorlieben.**

`[read]` **Dieselbe Gestalt wie `meal_slots`:** Position, Name,
geplante Zeit. `[cmd]` **Miss, ob eine Tabelle `meal_plan_slots`
richtig ist oder ob `meal_plan_entries.meal_type` reicht.**

`[cmd]` **`meal_plan_entries` traegt bereits `planned_time` und
`slot_order`** — **melde, wenn daraus schon eine Struktur ableitbar
ist.**

## Und die vier Herkuenfte

    self_created     Slots als Vorlage, beim Anlegen aenderbar
    coach_created    bringt seine Struktur mit
    marketplace      bringt seine Struktur mit
    buddy            bringt seine Struktur mit

`[read]` **Ein selbst erstellter Plan kopiert die Slots beim
Anlegen** — **danach gehoert die Kopie dem Plan.**

`[read]` **Sonst aendert eine spaetere Slot-Aenderung rueckwirkend
einen laufenden Plan** — **das waere E-42 in der Gegenrichtung.**

## Auftrag

**Mitbeauftragt: C-395.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-395 zuerst — der Gate ist rot

`[cmd]` **Drei Migrationen aus C-385/C-393 tragen `DELETE` und
`INSERT`:**

    20260902070117_c327a_chelation_mineral_membership.sql
    20260902070205_c385_injection_site_model.sql

`[cmd]` **Der Datenlogik-Waechter faellt.** `[read]` **Der Zustand
entsteht aus der Kette, nicht aus `migrations/`.**

`[read]` **Nach einem Kettenneuaufbau waeren die acht Quellen und
vier Injektionsstellen weg.**

`[read]` **Und der Widerspruch ist in deinem eigenen Lauf:** `[cmd]`
**du hast 327a als Kettenschritt UND als Migration angelegt.**
`[cmd]` **Bei C-392 hast du es richtig gemacht** — der Seed steht in
der Kette.

### 2 · C-396 — die Struktur am Plan

`[cmd]` **`rasterZeilen` rechnet die Zeilen aus
`food_preferences`** — **auch bei einem Coach-Plan.**

`[cmd]` **E-59: ein gelieferter Plan bringt seine Struktur mit.**

`[read]` **Miss zuerst, ob eine neue Tabelle noetig ist.** `[cmd]`
**`meal_plan_entries` traegt `planned_time` und `slot_order`** —
**melde, wenn daraus schon eine Struktur ableitbar ist.**

    self_created     Slots als Vorlage, beim Anlegen aenderbar
    coach_created    bringt seine Struktur mit
    marketplace      bringt seine Struktur mit
    buddy            bringt seine Struktur mit

`[read]` **Ein selbst erstellter Plan kopiert die Slots beim
Anlegen** — **danach gehoert die Kopie dem Plan.** `[read]` **Sonst
aendert eine spaetere Slot-Aenderung rueckwirkend einen laufenden
Plan.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`** — das ist gerade der Befund.
**Nichts auf `dev@lumeos.app` loeschen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Gate             gruen, Datenlogik-Waechter faellt nicht mehr
    Kettenneuaufbau  acht Quellen und vier Stellen ueberleben
    Struktur         noetig oder ableitbar, mit Zahl
    vier Herkuenfte  je Weg belegt
    self_created     Kopie beim Anlegen, spaetere Slot-Aenderung
                     wirkt nicht zurueck

## Bericht

### C-395 — Kette statt Migration, gebaut 2026-09-02

Der Datenlogik-Waechter ist gruen. Die beiden beanstandeten Migrationen
tragen keine ausfuehrbare Datenoperation mehr:

- `20260902070117_c327a_chelation_mineral_membership.sql` bleibt als
  bereits registrierte, nun leere Historienmigration erhalten. Die
  Ableitung lebt allein in Schritt `327a`.
- `20260902070205_c385_injection_site_model.sql` traegt nur Struktur,
  Funktionen, RLS und Grants. Die vier Orte, die Lipohypertrophie-Regel
  und die acht Quellenvarianten liegen im neuen Schritt `385`.

`kette.json` registriert beides explizit: `385_schema` fuer die
deploybare Struktur und danach `385` fuer den lokalen Datenzustand.
Der zielgerichtete Test prueft Gate, Registrierung, vier Ortskennungen,
acht Quellen und den bestehenden 327a-Schritt.

Die beiden Schritte wurden lokal ausgefuehrt. Danach standen wieder
vier `injection_sites`, acht `injection_needle_recommendations`, eine
Gewebe-Regel und acht Mitgliedschaften aus `wr_chelation_timing`.
`dev`-Plaene und -Slots wurden nicht beruehrt.

### C-396 — Messung und Struktur, gebaut 2026-09-02

Eine Struktur ist aus `meal_plan_entries` **nicht** belastbar
ableitbar. Die Tabelle enthaelt zwar `planned_time` und `slot_order`,
aber sie beschreibt einzelne Inhalte eines Tages, nicht benannte
Planzeilen:

- Die vier `dev`-Plaene tragen 84, 28, 28 und 29 Eintraege; alle haben
  nur die vier Zeiten 07:30, 12:30, 16:00 und 19:30.
- Bei drei Plaenen ist jeder `slot_order` gleich 1. Der Buddy-Plan hat
  zusaetzlich eine Zeile mit `slot_order = 2`, aber ohne Zeit.
- Es gibt weder einen Plan-Zeilennamen noch eine Planzeile ohne Inhalt.
  Eine leere vorgesehene Mahlzeit und zwei gleichzeitige benannte
  Planzeilen waeren daher nicht darstellbar.

Die separate Tabelle `nutrition.meal_plan_slots` ist folglich noetig.
Sie traegt `plan_id`, Besitzer, Position, Namen und geplante Zeit,
hat `(plan_id, position)` als Schluessel und vier Owner-RLS-Policies.
Die Besitzerpruefung verhindert, dass eine Struktur einem fremden Plan
zugeordnet wird.

Der Kettenschritt `396` installiert die einzige Kopierregel:
`self_created` kopiert beim INSERT die gegenwaertigen Nutzer-Slots in
den Plan. Danach ist es eine eigenstaendige Planstruktur; eine spaetere
Aenderung an `meal_slots` wirkt nicht zurueck. `coach_created`,
`marketplace` und `buddy` kopieren nichts — ihre jeweiligen Schreiber
setzen ihre eigene Struktur in `meal_plan_slots`.

Der transaktionale C-396-Test belegt alle vier Wege: ein Selbstplan
behaelt Name und Zeit `C396 Quelle`/06:45 nach einer Aenderung des
Nutzer-Slots auf 22:00; drei gelieferte Plaene schreiben jeweils ihre
eigene Struktur. Alle Testzeilen werden zurueckgerollt. Bestehende
`dev`-Plaene wurden bewusst nicht nachbefuellt; die Regel gilt beim
Anlegen, wie E-59 verlangt.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

`[cmd]` **Gate gruen** — der Waechter meldet: *,,Migrationen
enthalten keine Datenlogik."*

### C-395 — und der Umbau hat die Daten nicht gekostet

`[cmd]` **327a bleibt ausschliesslich Kettenschritt.** `[cmd]`
**C-385 hat jetzt Struktur-Migration plus registrierten
Seed-Schritt.**

`[cmd]` **Nachgemessen nach dem Umbau: 4 Stellen, 8 Quellen, 1
Gewebe-Regel, 8 Chelat-Mitgliedschaften** — **unveraendert.**

`[read]` **Das ist der Beleg, der zaehlt:** **die Trennung ist
vollzogen und nichts ist verloren gegangen.**

### C-396 — `meal_plan_entries` reicht nicht, mit Begruendung

`[read]` **Ich hatte gefragt, ob eine neue Tabelle noetig ist.**

`[cmd]` **Seine Antwort mit Zahlen:** **keine Namen, `slot_order = 1`
fast ueberall, nur Inhaltszeilen.**

`[read]` **Eine Struktur braucht Positionen ohne Inhalt** — **ein
leerer Slot ist auch einer.** `[read]` **`meal_plan_entries` kennt
nur, was drinsteht.**

`[cmd]` **`nutrition.meal_plan_slots` steht:** `plan_id`, `user_id`,
`position`, `name`, `planned_time`. `[cmd]` **Vier Policies.**

`[cmd]` **0 Zeilen** — **richtig: die Kopie greift beim Anlegen,
nicht rueckwirkend.**

### Und die Regel aus E-59 ist gebaut

`[cmd]` **Selbstplaene kopieren die Slots einmalig beim Anlegen.**
`[cmd]` **Spaetere Nutzer-Slotaenderungen aendern den Plan nicht.**

`[read]` **Das war die Sorge im Auftrag:** *,,sonst aendert eine
spaetere Slot-Aenderung rueckwirkend einen laufenden Plan."*
**Belegt.**

`[cmd]` **Coach-, Marketplace- und Buddy-Plaene tragen ihre eigene
Struktur.**

**Abgenommen.**

