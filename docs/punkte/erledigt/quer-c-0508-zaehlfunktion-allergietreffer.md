---
nr: C-508
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-459
entscheidung: null
erledigt: 2026-09-08
commit: 8ec84645
beruehrt:
  tabellen: [public.user_allergies]
zahlen:
  gemessen: 2026-09-08
---

# C-508 - eine Zaehlfunktion fuer die Allergietreffer

## Befund

Aus G-459, Claude Code, 2026-09-08:

> *,,Die Zahlen kosten weiter rund 1,4 s (eine Anfrage je
Allergie); eine Zaehlfunktion in der DB waere ein
Codex-Auftrag."*

`[cmd]` **Die Kachel zeigt je Allergie die Trefferzahl:
60, 1.021, 56.948.**

`[read]` **Drei Allergien, drei Anfragen** ? **bei zehn
Allergien sind es zehn.**

## Die Vorgeschichte

`[cmd]` **Zuerst kostete es 27 Sekunden** ? **57 Runden a 1.000
Zeilen, der PostgREST-Deckel.**

`[cmd]` **Mit `head: true, count: exact` sind es 2,1 s, dann
1,4 s.**

`[read]` **Besser, aber es bleibt eine Anfrage je Zeile.**

## Was zu bauen ist

    user_allergy_treffer(p_user_id uuid)
      -> stoff_code, treffer_lebensmittel,
         treffer_produkte, treffer_medikamente

`[cmd]` **`user_allergy_catalog_matches` existiert schon
(C-503)** ? **miss, ob sie erweitert werden kann.**

`[read]` **Eine Anfrage fuer alle Allergien, nicht eine je
Allergie.**

## Abnahmebedingungen

    A1  eine Funktion, alle Allergien auf einmal.
    A2  Laufzeit gemessen, gegen 1,4 s heute.
    A3  die drei Zahlen bleiben: 60, 1.021, 56.948.
    A4  RLS: nur die eigenen.
    A5  Gegenprobe: ein Nutzer ohne Allergien -> leer.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

**Erledigt.** `public.user_allergy_treffer(uuid)` liefert in einer
RLS-gebundenen Anfrage `stoff_code`, Lebensmittel-, Produkt- und
Medikamenttreffer fuer alle Katalogallergien des angefragten Nutzers.
Auf `dev@lumeos.app` sind das: Laktose `1.021 / 714 / 0`, Soja
`60 / 7.743 / 0`, Magnesiumstearat `0 / 56.934 / 0`.

`EXPLAIN ANALYZE` auf der laufenden Datenbank: **102,0 ms** fuer drei
Zeilen und eine Anfrage (gegen die vorherige UI-Abfolge von rund
1,4 s mit einer Anfrage je Allergie). Ein Nutzer ohne Allergien und
ein fremder authentifizierter Nutzer erhalten leer. `authenticated`
hat EXECUTE, `anon` nicht. Die bestehende, explizit freigegebene
Coach-Leseregel bleibt die einzige Ausnahme vom reinen Eigenzugriff.
Die historische Punktzahl `56.948` ist auf der laufenden Datenbank
nicht reproduzierbar; vor und nach C-508 sind es **56.934**.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`public.user_allergy_treffer(uuid)` existiert.**

> *,,Live: 102,0 ms statt rund 1,4 s."*

`[read]` **Vorher waren es 27 Sekunden (G-459), dann 1,4 s,
jetzt 102 ms.**

### Und eine Zahl berichtigt

> *,,Die alte Punktzahl 56.948 ist nicht reproduzierbar ?
live sind es vor/nachher 56.934."*

`[cmd]` **Ich hatte 56.948 aus Claude Codes Bildschirmtext
uebernommen** ? **er hat es gemessen.**

`[read]` **14 Zeilen Unterschied, vermutlich zwischen zwei
Kettenlaeufen entstanden.**

**Abgenommen.**
