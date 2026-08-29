---
nr: E-29
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-258]
modul: quer
---

# E-29 — Modulzugriffe auf `coach` gehen ueber eine Funktion

## Geltungsbereich — berichtigt 2026-08-29

`[read]` **Diese Entscheidung gilt fuer einen einzelnen Fall:
*Pending actions* im Tagebuch.**

`[read]` **Ich hatte sie Tom als *,,G-254"* vorgelegt** — aber G-254
fuehrt **sechs** Kacheln, und *Pending actions* ist nur eine davon.
**Die anderen fuenf waeren damit stillschweigend miterledigt worden,
ohne dass Tom sie gesehen hat.**

`[cmd]` **Berichtigt:** dieser ADR gilt fuer **G-258**, den
herausgeloesten Punkt. **G-254 bleibt offen fuer die fuenf
uebrigen.**

## Frage

`[cmd]` **`coach.pending_actions` traegt eine Spalte `module`** — die
Tabelle ist modulueebergreifend gedacht. **Liest das Tagebuch direkt,
oder gibt es eine Funktion?**

## Entscheidung

Tom, 2026-08-29: **eine Funktion, die liefert.**

## Warum das mehr ist als eine Bauform

`[cmd]` **Das Coach-Schema fuehrt drei Aenderungsprotokolle** —
`autonomy_change_log`, `permission_change_log`,
`relationship_change_log`. `[read]` **Ein direkter Lesezugriff aus
einem anderen Modul umgeht sie.**

`[read]` **Und die Rechte liegen dort, nicht im lesenden Modul:**
`client_permissions` und `client_autonomy` sagen, was ein Coach darf.
**Wer direkt liest, muss diese Logik nachbauen** — und sie waere ab
dem zweiten Modul doppelt.

`[read]` **Die Funktion ist damit die Naht:** ein Ort, an dem die
Rechte geprueft werden, ein Ort, an dem nachvollziehbar ist, wer was
gesehen hat.

## Was daraus folgt

`[read]` **Sie gilt nicht nur fuer Nutrition.** `[cmd]` `module`
steht in der Tabelle — **jedes Modul wird dieselbe Frage stellen.**
**Also eine Funktion je Zweck, nicht je Modul.**

`[read]` **Und die Gegenrichtung ist damit noch offen:** wenn ein
Modul eine offene Coach-Aktion zeigt, kann der Nutzer sie
vermutlich bestaetigen. **Ein Schreibweg zurueck ist eine eigene
Entscheidung** — er beruehrt `confirmed_by` und die Protokolle.
