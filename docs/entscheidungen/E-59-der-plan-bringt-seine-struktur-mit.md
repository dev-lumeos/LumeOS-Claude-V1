---
nr: E-59
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-332, E-58, E-45]
modul: nutrition
---

# E-59 — der Plan bringt seine Struktur mit

## Entscheidung

Tom, 2026-09-02:

> ich denke der plan hat seine struktur die er mit bringt. mahlzeit
> hinzufuegen geht ja genau gleich noch

## Der Konflikt, den es aufloest

`[read]` **Zwei Quellen fuer dieselbe Sache:**

    meal_slots      was ICH esse -- meine Namen, meine Zeiten
    Plan-Struktur   was der PLAN vorsieht

`[read]` **Drei Wege waren denkbar:** der Plan gewinnt, die Slots
gewinnen, **oder eine Abbildung beim Aktivieren.**

`[read]` **Tom nimmt keinen davon** — **beide bleiben nebeneinander
stehen.**

`[cmd]` **Und das steht heute schon so am Schirm:** **im Tagebuch die
eigenen Mahlzeiten oben, die Plan-Karten darunter.**

`[read]` **Der Plan sagt *Breakfast*, weil er das so nennt. Die
eigene Zeile sagt *Fruehstueck*, weil der Nutzer das so nennt.**
**Kein Konflikt, weil es zwei verschiedene Sachen sind.**

## Was gilt

    self_created     Slots als Vorlage, beim Anlegen aenderbar
    coach_created    bringt seine Struktur mit
    marketplace      bringt seine Struktur mit
    buddy            bringt seine Struktur mit

`[read]` **Ein selbst erstellter Plan hat keine mitgebrachte
Struktur** — **er entsteht in der Werkbank, also nimmt er die Slots
als Vorlage.** `[read]` **Beim Anlegen editierbar, danach gehoert
die Struktur dem Plan.**

`[cmd]` **Der Planner schreibt es bereits so:** *,,4 Reihen aus
diesem Plan — ein gelieferter Plan bringt seine Struktur mit."*
`[read]` **Der Satz stimmt, die Zeilen dahinter noch nicht.**

## Und die freie Erfassung bleibt

Tom: *,,mahlzeit hinzufuegen geht ja genau gleich noch."*

`[read]` **Wer um 22:00 isst und keinen Slot dafuer hat, erfasst
trotzdem** — **die Slots ordnen, sie schreiben nicht vor** (E-58).

## Was daraus folgt

`[cmd]` **`meal_plans` braucht die Struktur als Daten.** `[cmd]`
**Heute rechnet `rasterZeilen` sie aus den Vorlieben — auch bei einem
Coach-Plan.**

`[cmd]` **Und `meal_type` steht an acht Stellen als Beschriftung**,
jede mit ihrer eigenen Uebersetzung: `erfassen-modal`,
`plan-eintrag-editor`, `plans-echt`, `rezepte-echt`, `modale`,
`erfassen`, `mahlzeiten`, `ansicht`.

`[read]` **Die Plan-Struktur ersetzt sie dort, wo ein Plan die Quelle
ist** — **`meal_type` bleibt als Kategorie ohne Bedeutung** (E-58).
