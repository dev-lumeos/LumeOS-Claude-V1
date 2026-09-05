---
nr: E-65
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-408, E-64]
modul: nutrition
---

# E-65 — der Vorrat ist ein Anhaltspunkt, kein Lager

## Entscheidung

Tom, 2026-09-07:

> das heisst eine kopie von supplement, wir mischen keine module
> durcheinander. jedes modul ist in sich geschlossen

> sollte der user entscheiden, ich denke g oder ml hilft uns mehr

> ja das sollte selber abziehen und der stock soll editierbar sein,
> denn wenn ein kumpel auch mit isst haben wir die daten nicht,
> sprich das wird mehr oder weniger symbolischer wert als lager haben

## 1 · Eine eigene Tabelle in `nutrition`

`[read]` **Kein Zugriff auf `supplements.user_inventory`.**

`[cmd]` **Das Muster wird kopiert, nicht die Tabelle geteilt** —
`nutrition.user_inventory` mit eigenen Spalten.

`[read]` **Jedes Modul ist in sich geschlossen.** `[read]` **Ein
Fremdschluessel ueber die Modulgrenze macht aus zwei Modulen eines.**

## 2 · Menge in Gramm oder Milliliter

Tom: *,,ich denke g oder ml hilft uns mehr."*

`[read]` **Nicht *zwei Packungen Reis*, sondern *1.800 g Reis*.**

`[cmd]` **Der Grund: `meal_items` rechnet in `amount_g`** — **der
Abzug braucht keine Umrechnung.**

`[read]` **Und der Nutzer entscheidet, was er fuehrt:** **wer Reis
kiloweise kauft, traegt 1.000 g ein.** `[read]` **Wer Huehnchen nach
Portionen denkt, traegt 200 g ein und erhoeht beim Einkauf.**

`[read]` **Kein Verpackungsmodell** — **keine `purchased_at`- und
`expires_at`-Ketten je Packung.**

## 3 · Der Abzug geschieht automatisch, der Wert bleibt editierbar

Tom: *,,denn wenn ein kumpel auch mit isst haben wir die daten
nicht, sprich das wird mehr oder weniger symbolischer wert als lager
haben."*

`[read]` **Das ist die tragende Einsicht:** **der Vorrat wird nie
stimmen.**

    Wer erfasst      zieht ab
    Wer nicht erfasst  zieht nicht ab
    Wer teilt        zieht zu wenig ab
    Wer wegwirft     zieht gar nicht ab

`[read]` **Deshalb ist er ein Anhaltspunkt, kein Bestand.**

`[cmd]` **Und deshalb muss er editierbar sein** — **jederzeit, ohne
Begruendung, ohne Verlaufszwang.**

`[read]` **Ein automatischer Abzug, der nicht stimmt, waere schlimm,
wenn er als Wahrheit auftraete.** `[read]` **Als Anhaltspunkt mit
Korrekturmoeglichkeit ist er nuetzlich.**

## Was daraus folgt

`[read]` **Die Anzeige darf keine Genauigkeit behaupten.**

`[read]` **Kein *,,noch 3 Portionen"*** — **eher *,,ca. 600 g, zuletzt
angepasst am 4.9."***

`[cmd]` **Und die Nachkaufschwelle bleibt** — `reorder_flag`
**sagt: *,,geht zur Neige"*, nicht *,,ist leer"*.**

## Und die Grenze zur Einkaufsliste

`[cmd]` **`shopping_lists.source_type` kennt `supplement_reorder`**
— **fuer Nutrition braucht es einen eigenen Wert.**

`[read]` **Zu klaeren: heisst er `nutrition_reorder`, oder reicht
`manual` mit einem Vermerk?** `[read]` **Das entscheidet Codex beim
Bau.**
