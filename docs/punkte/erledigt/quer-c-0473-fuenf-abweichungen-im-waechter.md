---
nr: C-473
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-470
entscheidung: null
agent: codex
erledigt: 2026-09-08
commit: af742778
beruehrt:
  tabellen: [public.muscle_training_loads]
zahlen:
  gemessen: 2026-09-08
  abweichungen: 5
---

# C-473 — fuenf Abweichungen, die der Waechter jetzt sieht

## Befund

`[cmd]` **C-470 hat den Waechter erweitert** ? **er meldet jetzt
fuenf Abweichungen, die vorher niemand sah:**

    1  medical.user_medications
       zehn Spalten FEHLEN (monitoring,
       monitoring_frequency, last_...)

    2  public.shopping_lists
       authenticated ZU VIEL: DELETE
       Herkunft 407_shopping_lists

    3  public.muscle_training_loads
       authenticated ZU VIEL: INSERT, UPDATE, DELETE

    4  public.muscle_training_loads
       service_role ZU VIEL: INSERT, UPDATE, DELETE

    5  public.muscle_training_loads
       anon -- nicht vorgesehene Rolle

## Was gemessen ist

`[cmd]` **`activity_stream` und `muscle_training_loads` sind
SICHTEN mit `security_invoker=true`.**

`[read]` **Die Sicht laeuft mit den Rechten des Aufrufers** ?
**`anon` kommt nicht an die Daten.**

`[read]` **Die Rechte sind trotzdem falsch** ? **wer sie liest,
muss erst `security_invoker` nachsehen.**

`[cmd]` **Und `pg_default_acl` in `public` vergibt sie
automatisch** (C-468) ? `ON TABLES` **umfasst auch Sichten.**

## Was zu entscheiden ist

**Je Abweichung eine von drei Antworten:**

    a  das Recht wird entzogen
    b  der Sollstand wird berichtigt (es ist gewollt)
    c  die Spalten werden gebaut (Fall 1)

`[read]` **Fall 1 ist kein Rechteproblem** ? **zehn Spalten
fehlen in `medical.user_medications`.**

`[cmd]` **Miss, ob sie je gebraucht wurden** ? **oder ob der
Sollstand aus einer Spec stammt, die nie gebaut wurde.**

**Fall 2:** `[read]` **darf ein Nutzer seine Einkaufsliste
loeschen?**

`[read]` **Vermutlich ja** ? **dann ist der Sollstand falsch,
nicht das Recht.**

**Faelle 3 bis 5:** `[cmd]` **eine Sicht braucht kein INSERT.**

`[read]` **Aber wenn `pg_default_acl` sie automatisch vergibt,
reicht ein `REVOKE` nicht** ? **die naechste Sicht hat sie
wieder.**

`[read]` **Das ist der eigentliche Punkt: entweder
`ALTER DEFAULT PRIVILEGES` in `public` aendern, oder jede Sicht
einzeln beschneiden.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    1  medical.user_medications   35 Spalten, monitoring da
    2  shopping_lists             nur service_role und
                                  postgres haben DELETE
    3  activity_stream            authenticated:SELECT
       muscle_training_loads      authenticated:SELECT
                                  anon: NICHTS
    4  pg_default_acl public      nur noch
                                  postgres=arwdDxtm/postgres

`[cmd]` **Mein erster Blick war zu grob** ? **ich sah `r postgres`
und `r supabase_admin` und hielt sie fuer unveraendert.**

`[cmd]` **Der Inhalt zeigt es:** `{postgres=arwdDxtm/postgres}`
? **der Eigentuemer sich selbst; `anon`, `authenticated` und
`service_role` sind raus.**

### Der vierte Punkt ist der wichtigste

`[read]` **C-468 hat den Mechanismus gefunden:** `pg_default_acl`
**vergab in `public` bei JEDER neuen Tabelle alles.**

`[cmd]` **Jetzt nicht mehr** ? **neue Probeobjekte beider
Eigentuemer erhielten 0 App-Rechte.**

> *,,Funktions-/Sequenz-Defaults blieben bewusst
> unangetastet."*

`[read]` **Richtig** ? **eine Funktion ohne EXECUTE fuer
`authenticated` waere ein Ausfall.**

### Und er hat C-471 verteidigt

> *,,C-471 bleibt sinnvoll: Sein REVOKE ist beim Aufbau weiterhin
> noetig, da C-473 in der Kette SPAETER laeuft."*

`[read]` **Zwei Schutzschichten, in der richtigen Reihenfolge
gedacht.**

### Die Restabweichung

`[cmd]` **Die zehn Spalten stehen am Tabellenende statt nach
`indication`.**

> *,,Das Beheben erfordert Tabellenrebuild/Kopie/Swap und damit
> Toms explizite Freigabe. Nicht gebaut."*

`[read]` **Eine Spaltenreihenfolge ist kosmetisch** ? **ein
Rebuild auf einer Tabelle mit Nutzerdaten ist es nicht.**

**Abgenommen.**
