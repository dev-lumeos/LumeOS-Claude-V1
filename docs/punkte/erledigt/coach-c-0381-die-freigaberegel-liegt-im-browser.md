---
nr: C-381
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-151
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: dddbe5fc
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-09-02
---

# C-381 — die Freigaberegel liegt im Browser

## Befund

Aus G-151, Codex, 2026-09-02.

`[cmd]` **Die RLS-Update-Regel an `coach.pending_actions` erlaubt
Coach und Client Aenderungen.**

`[cmd]` **Ablauf und bestaetigender Client werden nur im Clientcode
geprueft.**

`[read]` **Eine Regel, die im Browser liegt, ist keine Regel.**

## Dieselbe Klasse wie G-306

`[cmd]` **Dort blockierte `ON DELETE RESTRICT` nur das Loeschen einer
protokollierten Position, nicht das Aendern** — **ein `UPDATE
amount_g = 999` ging glatt durch.**

`[read]` **Hier ist es die Freigabe:** wer die Route direkt ruft,
kann eine abgelaufene Aktion bestaetigen **oder eine fremde.**

## Was ein Ausfuehrer koennen muss

Codex' Anforderung, vollstaendig:

    atomar pruefen
    den Akteur aus auth.uid() ableiten
    nur erlaubte Aktionstypen dispatchen
    die Zielaenderung schreiben
    protokollieren

`[read]` **Der zweite Punkt ist der Kern** — `confirmed_by` darf
nicht aus dem Aufruf kommen.

`[cmd]` **E-29 gilt:** ein Zugriff auf `coach.*` geht ueber eine
Funktion. `[cmd]` **`coach.offene_aktionen()` ist bereits
`SECURITY DEFINER` mit `auth.uid()`** — **die Lesenaht macht es
richtig, die Schreibnaht nicht.**

## Auftrag — die Schreibnaht absichern und ausfuehren

**Mitbeauftragt: G-151.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-381 — die Regel gehoert in die Datenbank

`[cmd]` **Du hast es in G-151 gefunden: die RLS-Update-Regel erlaubt
Coach und Client Aenderungen, Ablauf und bestaetigender Client
werden nur im Clientcode geprueft.**

`[read]` **Dieselbe Klasse wie G-306**, wo `ON DELETE RESTRICT` nur
das Loeschen blockierte.

`[cmd]` **`coach.offene_aktionen()` ist bereits `SECURITY DEFINER`
mit `auth.uid()`** — **die Lesenaht macht es richtig.**

### 2 · G-151 — der Ausfuehrer

`[cmd]` **`entscheideAktion` setzt `status`, `confirmed_at`,
`confirmed_by`** — **`payload` wird nicht angewandt.**

`[cmd]` **Zwei abgelaufene Aktionen: `adjust_macro_targets`,
`protein_g_delta`.**

**Deine eigene Anforderungsliste, umgesetzt:**

    atomar pruefen
    den Akteur aus auth.uid() ableiten
    nur erlaubte Aktionstypen dispatchen
    die Zielaenderung schreiben
    protokollieren

`[read]` **Der zweite Punkt ist der Kern** — `confirmed_by` darf
nicht aus dem Aufruf kommen.

`[read]` **Und die Zielaenderung:** `[cmd]` **`adjust_macro_targets`
zeigt auf `goals.nutrition_targets`** — sechs Naehrstoffspalten
(E-31). `[read]` **Miss, ob `payload` dorthin passt, bevor du
schreibst.**

### Was nicht zu tun ist

**Kein Coach-UI** — Funktion und RLS.
**Keine abgelaufene Aktion ausfuehren** — sie sind der Testfall fuer
die Ablaufpruefung.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    fremde Aktion       abgewiesen, belegt
    abgelaufene Aktion  abgewiesen, belegt
    gueltige Aktion     Zielwert geaendert, protokolliert
    confirmed_by        aus auth.uid(), nicht aus dem Aufruf
    Rueckbau            gezaehlt

## Bericht

**Gebaut am 02.09.2026 (Codex, nicht committed).**

### C-381 — Freigabe liegt jetzt in der Datenbank

`[cmd]` `coach.pending_actions` hat fuer `authenticated` kein `UPDATE`
mehr und keine Update-Policy. `coach.action_log` hat fuer
`authenticated` nur noch `SELECT`; direkte `INSERT`- und `UPDATE`-
Rechte sowie ihre Policies sind entfernt.

`[cmd]` Die neue Funktion `coach.bestaetige_aktion(p_action_id uuid)`
ist `SECURITY DEFINER`, mit `search_path=pg_catalog, pg_temp`; sie ist
fuer `authenticated` und `service_role` ausfuehrbar, nicht fuer
`PUBLIC`.

`[cmd]` Sie leitet den Akteur ausschliesslich aus `auth.uid()` ab,
sperrt die passende Aktion, prueft Klient, Status und Ablauf atomar
und erlaubt ausschliesslich `nutrition/adjust_macro_targets`.
`confirmed_by` ist kein Parameter und wird ausschliesslich mit diesem
Akteur geschrieben.

### G-151 — der Ausfuehrer

`[cmd]` Das vorhandene Payload `{ protein_g_delta, reason }` passt zu
`goals.nutrition_targets.protein_g`. Die anderen fuenf Zielspalten
werden beim neuen Tagesstand uebernommen; historische Zielzeilen
bleiben unveraendert. Gibt es bereits einen heutigen Zielstand, wird
nur dieser fortgeschrieben.

`[cmd]` Die Bestaetigung schreibt Zielwert, `pending_actions` und genau
einen `coach.action_log`-Eintrag mit Payload-Snapshot und
`undo_data` in derselben Transaktion. Der Dispatcher weist unbekannte
Aktionstypen und unerwartete Payload-Felder ab.

`[cmd]` Die zwei vorhandenen Aktionen mit `adjust_macro_targets` sind
beide weiter `pending` und abgelaufen; fuer sie existieren null
`action_log`-Eintraege. Sie wurden nicht ausgefuehrt.

### Nachweise

`[cmd]` `pnpm exec tsx --test
supabase/_pipeline/_validierung/coach-c381-action-executor.test.ts`
ist gruen: fremde Aktion abgewiesen, abgelaufene Aktion abgewiesen,
direktes Tabellen-Update abgewiesen, gueltige Probe erhoeht Protein um
10, setzt `confirmed_by` und `executed_by` auf den JWT-Akteur und
schreibt genau einen Log-Eintrag. Die Probe rollt vollstaendig zurueck:
vorher und nachher null ihrer zwei Testaktionen bzw. Log-Eintraege.

`[cmd]` Zusaetzlich gruen: C-362-Consent-Test,
`schemafreigabe-pruefen`, `migration-datenlogik-pruefen`,
`nummern-pruefen`, `punkte-pruefen` und `git diff --check`.

### Offen ausserhalb dieses Auftrags

`[read]` `apps/web/src/lib/coach/rechte-schreiben.ts` ruft noch den
alten direkten Update-Weg. Er ist nach dem Rechte-Rueckbau bewusst
nicht mehr berechtigt und muss in einem separaten UI-Auftrag die RPC
`coach.bestaetige_aktion` aufrufen. `apps/` blieb hier unberuehrt.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Die Regel liegt jetzt in der Datenbank

`[cmd]` **`coach.bestaetige_aktion` ist live, `SECURITY DEFINER`.**

`[cmd]` **Und die UPDATE-Regel ist weg:** an `pending_actions`
stehen nur noch `SELECT`, `INSERT`, `DELETE`.

`[read]` **Damit ist der einzige Weg zu einer Statusaenderung die
Funktion** — **genau das, was der Punkt verlangte.**

`[cmd]` **`action_log` ist fuer Clients nur lesbar.**

### Die Probe lief in alle Richtungen

`[cmd]` **Fremde, abgelaufene und direkte Updates werden
abgewiesen.**

`[cmd]` **Die gueltige Probe aenderte Protein um 10, setzte beide
Akteursspalten aus `auth.uid()` und rollte vollstaendig zurueck.**

`[read]` **Der zweite Teil ist der Kern:** **`confirmed_by` kommt
nicht mehr aus dem Aufruf.**

### Und er hat den Umfang eng gehalten

`[cmd]` **`adjust_macro_targets` uebernimmt ausschliesslich
`protein_g_delta`.**

`[read]` **Nicht alles, was in `payload` stehen koennte** — **nur
das, was belegt ist.** `[cmd]` **Der Zielwert wird historisiert, mit
Undo-Schnappschuss.**

`[cmd]` **Die zwei echten Aktionen bleiben `pending` und abgelaufen,
0 Logs dafuer** — nachgemessen: 20.08. und 01.09., beide `pending`.

`[read]` **Er hat sie nicht ausgefuehrt, obwohl er konnte.** **Sie
waren der Testfall fuer die Ablaufpruefung, und sie bleiben es.**

### Was offen bleibt, und er sagt es

`[cmd]` **Der bestehende Browser-Schreibweg muss noch auf die RPC
umgestellt werden.**

`[read]` **Solange das nicht geschehen ist, ruft die Oberflaeche
einen Weg, den es nicht mehr gibt** — **als G-324.**

**Abgenommen.**

