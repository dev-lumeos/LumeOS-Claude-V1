---
nr: C-455
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-445
entscheidung: E-79
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 2fa1e5fc
beruehrt:
  tabellen: [medical.injection_logs]
zahlen:
  gemessen: 2026-09-08
  fehlende_spalten: 17
  fehlende_tabellen: 1
---

# C-455 — der Injektionsplaner, vollstaendig

## Warum dieser Punkt

Tom, 2026-09-08: *,,bau fuer alles zuerst die grundlagen in der db
und nicht nur eine table, und dann fehlen dir beim anbinden weitere
zehn."*

`[read]` **C-441 und C-445 haben stueckweise nachgereicht.**
`[read]` **Dies ist die vollstaendige Liste, gegen die Spec
gemessen.**

## `injection_sites` — neun von dreizehn Spalten fehlen

`[cmd]` **`Injection Planner:27-46`:**

    vorhanden   id, route, display_name
    FEHLT       max_volume_ml       Hoechstmenge je Einstich
                rest_days           Ruhetage
                body_view           front | back
                x_pct, y_pct        Lage auf der Figur
                needle_gauge        z.B. 23G
                needle_length_in
                landmark_note       "2 cm lateral vom Nabel"
                difficulty          beginner | advanced
                is_active

`[read]` **`minimum_rest_days` ist NICHT `rest_days`** ? **C-441,
A2: E-57/C-385 erzwingt dort begruendetes NULL.**

`[read]` **Das ist zu entscheiden, nicht zu ueberschreiben.**

## `injection_logs` — sechs Spalten fehlen

`[cmd]` **`Injection Planner:80-101`:**

    FEHLT   substance_id      FK, verbindet mit dem Katalog
            dose_amount       Menge
            dose_unit         mg | IU | mcg | ml
            needle_gauge      wie tatsaechlich benutzt
            needle_length_in
            notes
            stack_item_id     FK, verbindet mit dem Stack

`[read]` **`stack_item_id` ist der wichtigste** ? **ohne ihn weiss
niemand, welcher Stack-Eintrag die Injektion geplant hat.**

`[cmd]` **Und Zeile 109:** *,,Computed on read from active stack
items where `route IN ('injection_im','injection_subq')"* ?
**genau dafuer.**

`[cmd]` **Indizes:** `(user_id, injected_at DESC)`,
`(user_id, site_id, injected_at DESC)`.

## `injection_site_overrides` — fehlt ganz

`[cmd]` **`Injection Planner:261`:**

    (user_id, site_id, max_volume_ml, rest_days,
     physician_note, set_by_coach_id, ...)

`[cmd]` **Live: 0 Tabellen.**

`[read]` **Bedingung laut Spec: aktive Medical-Coach-Beziehung mit
`full`-Sichtbarkeit auf Extended.**

`[cmd]` **Und der Eintrag erscheint im Medical-Auditlog.**

## Was NICHT als Tabelle gebaut wird

`[cmd]` **`injection_schedule`, Zeile 107-111:** *,,derived, not
stored ? no table needed."*

`[read]` **Aus aktiven Stack-Eintraegen berechnet** ? **nur
materialisieren, wenn die Geschwindigkeit es verlangt.**

## Die sieben Regeln aus 5.3

`[cmd]` **Drei sperren, vier warnen:**

    block   volume_limit         volume_ml > site.max_volume_ml
            rest_window          siteState = resting
            route_mismatch       substance.route != site.route
    warn    overuse_30d          >= 3 Einstiche in 30 Tagen
            advanced_site        difficulty = advanced,
                                 nicht zugestimmt
            complication_repeat  letzter Log hatte eine
            pain_trend           Mittel der letzten 3 >= 2

`[read]` **Sperren sind ueberschreibbar** ? **nur mit nichtleerem
`override_reason`, und die Ueberschreibung wird protokolliert.**

`[cmd]` **`advanced_site` braucht `difficulty`** ? **fehlt.**
`[cmd]` **`volume_limit` braucht `max_volume_ml`** ? **fehlt.**

`[read]` **Vier der sieben Regeln sind heute nicht rechenbar.**

## Entschieden: E-79

`[cmd]` **`Injection Planner:363` faellt** ? **die Muskelkarte ist
die Auswahl, die 16 Orte sind Fachwissen.**

`[read]` **Das aendert Punkt 2 und 3 der Reihenfolge:**
`injection_sites` **braucht keine `user_id`, aber eine Zuordnung
zur Flaeche** ? **und `injection_logs` zeigt auf die Flaeche.**

## Der urspruengliche Widerspruch

`[cmd]` **`Injection Planner:363`:**

> *,,No user-created custom sites ? the 16 seeded sites cover
> standard practice."*

Tom, 2026-09-08: *,,ja wir kennen die ueblichen einstichstellen,
das heisst aber nicht dass ein user nicht andere waehlen kann.
wenn er triceps waehlt weil er lokal ein tendonproblem hat, dann
zeigen wir den triceps."*

`[read]` **Die Spec sagt nein, Tom sagt ja.**

`[cmd]` **Und BPC-157 an der Problemstelle ist derselbe Fall**
(C-453).

`[read]` **Das ist zu entscheiden, BEVOR gebaut wird** ? **es
aendert, ob `injection_sites` eine `user_id` braucht und ob die 16
eine geschlossene Liste sind.**

`[read]` **Und ebenso: C-454** ? **die Ebene *,,welche Punkte hat
dieser Nutzer fuer diese Substanz gewaehlt"* fehlt vollstaendig.**

## Die Reihenfolge

    1  Tom entscheidet: eigene Orte ja oder nein
    2  injection_sites vervollstaendigen
    3  injection_logs vervollstaendigen
    4  injection_site_overrides anlegen
    5  die Nutzerauswahl aus C-454
    6  DANN die Regeln aus 5.3
    7  DANN die Oberflaeche

`[read]` **Punkt 7 ist G-396 und wartet.**

## Nachtrag aus G-396 — `latissimus` fehlt

`[cmd]` **`MUSKELN` in `koerperkarte-pfade.ts` fuehrt 21
Flaechen** ? **`latissimus` ist NICHT darunter.**

`[cmd]` **`lat_l/r` faellt heute auf `trapezius`** ? **eine
Naeherung.**

`[read]` **Anatomisch falsch:** **der Latissimus liegt seitlich am
Ruecken, der Trapezius oben.**

`[read]` **Eine eigene Flaeche waeren neue Pfaddaten in
`packages/ui`** ? **das gehoert zu den Grundlagen, nicht zur
Anbindung.**

## Auftrag

**Beauftragt am 2026-09-08, als Teil der Kette C-455 -> C-454 ->
C-457 -> C-459.**

`[read]` **Der Kettenauftrag steht in C-455.**

## Bericht 2026-09-10

### Eingespielt und live gemessen

`20260909210000_c455_injection_planner.sql` und
`455_injection_planner_catalog_seed.sql` sind auf dev eingespielt.

    medical.injection_sites       16 vorher / 16 nachher
    voll konfigurierte Orte         0 vorher / 16 nachher
    minimum_rest_days = NULL       16 vorher / 16 nachher
    medical.injection_logs          0 vorher / 0 nachher
    medical.injection_site_overrides existierte nicht / 0 Zeilen nachher

Alle 16 Katalogorte tragen jetzt `max_volume_ml`, `rest_days`,
`body_view`, `x_pct`, `y_pct`, `needle_gauge`, `needle_length_in`,
`landmark_note`, `difficulty`, `is_active` und die E-79-Zuordnung
`body_area_code`. `minimum_rest_days` blieb fuer alle 16 bewusst
leer: `rest_days` ist die Planner-Konfiguration, nicht eine
nachtraeglich erfundene klinische Mindestruhezeit nach E-57.

`injection_logs` bekam die acht fuer den neuen Vertrag erforderlichen
Spalten: `body_area_code`, `substance_id`, `dose_amount`,
`dose_unit`, `needle_gauge`, `needle_length_in`, `notes` und
`stack_item_id`. Der Katalogort kann nun leer sein, die Flaeche nicht:
so kann C-454 spaeter eine nutzergewaehlte Flaeche ohne erfundenen
Katalogort protokollieren. Die Indizes sind
`injection_logs_user_injected_at_idx` und der bestehende
`injection_logs_user_site_injected_at_idx`.

`medical.injection_site_overrides` ist RLS-geschuetzt. `anon` hat
null Tabellenprivilegien; `authenticated` nur SELECT/INSERT/UPDATE.
Die drei Regeln verlangen beim Coach eine aktive Beziehung und
`coach.hat_sicht(user_id, 'medical', 'full')`. Ein Trigger schreibt
jede Anlage/Aenderung als `medical/injection_site_override` in
`coach.action_log`. Die SECURITY-DEFINER-Triggerfunktion hat kein
PUBLIC-EXECUTE; die Stack-Pruefung ist SECURITY INVOKER und ebenfalls
nicht direkt ausfuehrbar. Es gibt keine `injection_schedule`-Tabelle.

### Frische Probe

Die formelle Rotprobe gegen `lumeos_c455_red` scheiterte zuerst am
fehlenden `body_area_code`. Nach dem Bau waren auf
`lumeos_c455_final` beide Zusicherungen gruen in **2,9 s**:

    1  16/16 konfigurierte Katalogorte, 16 E-57-NULLs,
       korrekte Flaechenmatrix und keine gespeicherte Schedule-Tabelle
    2  eigener Stack erlaubt; fremder Stack abgelehnt; Full-Coach
       schreibt und sieht Override samt Audit; Summary, inaktive
       Full-Beziehung und anon werden abgelehnt bzw. sehen 0

Die komplette Fixture-Transaktion endet mit `ROLLBACK`.

### Sicherung

Vor dem Einspielen:

    backup/schema/20260910094800_c455_injection_planner_vor_einspielen.dump
    32.231 Bytes
    SHA-256 FFEE7B695E612E1D082436B95D47E47BA9663E35A00BD6803848646A4A769406

Sie enthaelt den Vorzustand von `medical.injection_sites`,
`medical.injection_logs` und `coach.action_log`.

### Kette und Punktelauf

Der frische Aufbau auf `lumeos_c455_final2` lief durch alle **182
Schritte**; C-455 Schema und Seed waren beide gruen (je **0,9 s**).
Der Kettenprozess bleibt danach jedoch jeweils bei
`== Abschlusspruefung` ohne `SCHEMA VOLLSTAENDIG`, `KETTE OK` oder
Fehlerausgabe stehen und beendet sich. Das trat ebenso bei
`lumeos_c455_final` auf. Der frische Endzustand wurde deshalb direkt
gemessen: 16 Orte, 16 Konfigurationen, 16 E-57-NULLs, 8 neue
Logspalten, Override-Tabelle mit RLS und keine Schedule-Tabelle.

Der Kettenwaechter ist gruen: 23 Migrationsdateien, davon 9
Kette+live, 14 Kette+nicht-live, 0 neue Luecke. Der Punktelauf ist
gruen: 599 Punkte, 25/25 erwartete Befunde, kein neuer Schaden.

**Stopp:** Die erforderliche explizite grüne Abschlussmeldung der
Vollkette fehlt trotz zweier vollständig ausgeführter Frischaufbauten.
Darum beginne ich C-454 nicht, bis der Abschlusswrapper eine
nachvollziehbare grüne oder rote Meldung liefert.

### Nicht angefasst

`apps/` und `packages/ui/` blieben unverändert. Der bekannte
Latissimus-Befund bleibt offen: `lat_l/r` ordnen nach E-79 zu
`latissimus`, die aktuelle Muskelkarte hat diese Fläche nicht und
fällt auf Trapezius zurück. Das ist anatomisch falsch, aber als
Pfaddatenarbeit außerhalb von C-455 ausdrücklich nicht gebaut.

### Nachtrag 2026-09-10 — Abschlussläufer repariert

Ursache war `run()` in `kette-ausfuehren.ts`: Auf Windows nutzte
`pnpm` eine Shell und fing deren Ausgabe ein. `runFinalCheck()` ruft
nun denselben Prozess mit `stdio: 'inherit'` auf. Der neue Test
`quer-c455-kettenabschluss-ausgabe.test.mjs` war zuerst rot und ist
grün; `tsc --noEmit` ist ebenfalls grün.

Die Gegenprobe trug kurz die nicht existierende Solltabelle
`c455_abschlussprobe_fehlt_absichtlich` ein. Der frische Aufbau
meldete sie sichtbar unter `FEHLT`, danach
`SCHEMA UNVOLLSTAENDIG` und `KETTE FEHLGESCHLAGEN`. Die Testzeile
wurde vollständig zurückgebaut. Der grüne Gegenlauf auf
`lumeos_c455_abschlussgruen` meldet sichtbar
`SCHEMA VOLLSTAENDIG` und **`KETTE OK: 600,9 s`**.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    16/16 Orte konfiguriert, 16 E-57-NULLs
    10 neue Spalten in injection_sites
     7 neue Spalten in injection_logs
    injection_site_overrides existiert
    Sicherung 32.231 B, SHA-256
    Punktelauf gruen, 599 Punkte

`[cmd]` **Selbst gemessen: alle vier Zahlen stimmen.**

### Der Stopp war richtig

> *,,Der Abschlusswrapper endet nach `== Abschlusspruefung` ohne
> `SCHEMA VOLLSTAENDIG`, `KETTE OK` oder Fehlerausgabe. Daher
> beginne ich C-454 nicht."*

`[read]` **Ein Lauf, der stumm endet, ist kein gruener Lauf** ?
**und er hat nicht weitergemacht.**

`[cmd]` **Ursache selbst gefunden:**
`kette-ausfuehren.ts:60` ? `useShell = win32 && command === 'pnpm'`
**und `runFinalCheck` ruft mit `'pnpm'`.**

`[cmd]` **Die Pruefung selbst laeuft** ? **direkt gefahren mit
`PGDATABASE` und `LUMEOS_DB_CONTAINER`: exit 1, fuenf
Abweichungen, alle mit Namen.**

`[read]` **Und die fuenf sind ALT:** `medical.user_medications`
**10 Spalten,** `shopping_lists` **ein DELETE zu viel,**
`muscle_training_loads` **drei GRANT-Abweichungen.**

**Abgenommen.**
