# Reis-Kuration C-32

Stand: 2026-08-15.

`[cmd]` Dieser Auftrag hat keine Datenbank verändert. Es wurden nur eine
Datendatei und ein Prüfskript angelegt.

Dateien:

- `supabase/_pipeline/daten/reis-alias-kuration.json`
- `supabase/_pipeline/_validierung/reis-alias-kuration-messen.ts`
- `docs/ssot/57-reis-kuration.md`

---

## Ausgangslage

`[read]` `docs/todo/TODO.md` C-32 beschreibt Reis als ersten kuratierten
Aliasfall. Der BLS kennt Verarbeitung, aber keine Sorten wie Basmati oder
Jasmin.

`[read]` C-32 nennt 13 Reis-Arten im Bestand, darunter `C352` weißer Reis,
`C351` unpolierter Reis, `C359` Parboiled-Reis, Wildreis, Reismehl,
Reisstärke, Reiskleie, Reisnudeln und Reisdrink.

`[cmd]` Live nachgeschlagen:

| Code | amtlicher Name | englischer Name |
|---|---|---|
| `C351000` | Reis unpoliert, roh | Brown rice raw |
| `C352000` | Reis poliert, roh | White rice raw |
| `C359000` | Reis parboiled, poliert, roh | Rice parboiled, raw |
| `M141100` | Joghurt aus entrahmter Milch, max. 0,5 % Fett | Yogurt from skimmed milk, max. 0.5 % fat |

`[read]` `docs/ssot/51-sortweight-formel.md` vermerkt: „Griechischer
Joghurt" existiert im BLS nicht; Ersatz ist `M141100`, ausdrücklich als
Ersatz gekennzeichnet.

---

## Datendatei

`[cmd]` Angelegt:
`supabase/_pipeline/daten/reis-alias-kuration.json`.

`[cmd]` Die Datei enthält 11 gesetzte Zuordnungen, 2 strittige Varianten für
`sushireis` und 2 ausdrücklich ausgeschlossene Begriffe.

Gesetzte Zuordnungen:

| Suchbegriff | Zielcode | Status | Begründung |
|---|---|---|---|
| `reis` | `C352000` | gesetzt | generischer Reis-Suchbegriff, weißer Reis roh |
| `basmatireis` | `C352000` | gesetzt | Sorte ohne eigene BLS-Messung |
| `jasminreis` | `C352000` | gesetzt | Sorte ohne eigene BLS-Messung |
| `langkornreis` | `C352000` | gesetzt | gleiche Verarbeitungsform |
| `rundkornreis` | `C352000` | gesetzt | gleiche Verarbeitungsform |
| `naturreis` | `C351000` | gesetzt | unpolierter Reis, englisch Brown rice |
| `brauner reis` | `C351000` | gesetzt | deutsche Suchform zu Brown rice |
| `vollkornreis` | `C351000` | gesetzt | gebräuchliche Form für unpolierten Reis |
| `parboiled reis` | `C359000` | gesetzt | Parboiled-Reis roh |
| `parboiledreis` | `C359000` | gesetzt | zusammengeschriebene Suchform |
| `griechischer joghurt` | `M141100` | Ersatz | BLS hat keinen eigenen griechischen Joghurt |

`[annahme]` Für die Makronährwerte ist der Sortenunterschied zwischen
Basmati, Jasmin, Langkorn, Rundkorn und weißem Reis kleiner als die
Suchlücke; die relevante Abweichung liegt eher beim glykämischen Index.
Deshalb ist ein Alias auf denselben BLS-Eintrag vertretbar, aber kein neuer
Food-Eintrag.

---

## Strittige Zuordnungen

`[cmd]` `sushireis` liefert heute auf Platz 1 `X8A1100 Sushi-Reis
(Grundrezept)`.

`[annahme]` Beide Varianten sind fachlich begründbar:

| Variante | Zielcode | Argument |
|---|---|---|
| Zutat | `C352000` | Sushireis als rohe Reissorte ist nährwertlich weißer polierter Reis |
| Gericht | `X8A1100` | Im Bestand existiert ein fertiger Eintrag `Sushi-Reis (Grundrezept)` |

`[annahme]` Tom muss entscheiden, ob `sushireis` in der Aliasdatei später auf
die rohe Zutat oder auf das Grundrezept zeigen soll.

Weitere Nicht-Zuordnungen:

| Suchbegriff | Entscheidung | Begründung |
|---|---|---|
| `milchreis` | nicht auf rohen Reis | im Bestand als Gericht/Dessert belegt |
| `risotto` | nicht auf rohen Reis | im Bestand als Gericht belegt |

`[cmd]` Informative Vorhermessung: `milchreis` landet aktuell auf
`C532100 Vollmilchschokolade mit Puffreis und Crispies`; `risotto` landet
auf `Y623523 Seelachs-Risotto`. Das ist kein Einspielvorschlag, sondern
zeigt nur die aktuelle Suchlage.

---

## Prüfskript

`[cmd]` Angelegt:
`supabase/_pipeline/_validierung/reis-alias-kuration-messen.ts`.

`[read]` Das Skript erweitert nicht `mealcam-zutaten-messen.ts`. Es liest
die neue Datendatei, baut Suchgruppen mit `buildFoodSearchGroups` und misst
gegen `nutrition.food_search`.

`[cmd]` Aufruf:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/reis-alias-kuration-messen.ts
```

`[cmd]` Vorherwert, vor Einspielen der Aliase:

| Suchbegriff | Soll | Ist |
|---|---|---|
| `basmatireis` | `C352000` | leer |
| `jasminreis` | `C352000` | leer |
| `vollkornreis` | `C351000` | Platz 1 |
| `naturreis` | `C351000` | Platz 1 |
| `parboiled reis` | `C359000` | Platz 1 |
| `reis` | `C352000` | Platz 1 |
| `griechischer joghurt` | `M141100` | leer |

`[cmd]` Zusammenfassung:

| Maß | Wert |
|---|---:|
| Abnahmebegriffe | 7 |
| Sollwert auf Platz 1 | 4 |
| in den ersten drei | 4 |
| überhaupt in den Top 10 | 4 |
| gar keine Treffer | 3 |

`[cmd]` Das Skript endet aktuell mit Exit 1. Das ist erwartet, weil die
Aliasdaten noch nicht eingespielt sind.

---

## Was dieser Schritt nicht tut

- Kein `INSERT` in `food_aliases`.
- Kein Kettenschritt.
- Kein Kettenneuaufbau.
- Keine Änderung an `nutrition.foods`, `food_search` oder
  `search_synonyms`.
- Keine Sortenkopien als eigene Food-Einträge.

`[annahme]` Der nächste Schritt ist eine fachliche Entscheidung zu
`sushireis`; danach kann ein eigener Kettenschritt die gesetzten Aliasdaten
einspielen.
