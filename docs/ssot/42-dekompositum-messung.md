# Dekompositum-Messung: Wörterbuch am BLS-Bestand

`[cmd]` Erhoben 2026-08-13 auf Branch `suche/wortschatz-und-relevanz`.
Grundlage: `docs/ssot/41-lebensmittelsuche-wortschatz.md`.

## Anlass

Nach `41-…` blieben Toms fünf Formen offen — `huehnerbrust`, `huehnchenbrust`,
`huehner brust`, `chicken brust`, `pouletbrust` liefern null Treffer. Die
Ableitung aus Block 28 konnte sie nicht lösen, weil sie nur Schreibvarianten
des Bestands erzeugt: `Huhn` und `Hähnchen` sind zwei verschiedene Wörter.

Die Branche löst das nicht mit Synonymlisten. `[read]` Die
Elasticsearch-Dokumentation sagt ausdrücklich, dass man dafür unendlich viele
Wortpermutationen modellieren müsste und das im Deutschen schnell
unpraktikabel wird — man geht vom anderen Ende heran und zerlegt das
Kompositum anhand bekannter Bestandteile.

Getestet wurde das Standardwerkzeug: `uschindler/german-decompounder`,
14.525 Zeilen, abgeleitet aus igerman98 von Björn Jacke. Es enthält
ausschliesslich Kompositum-**Bestandteile**, nicht die Komposita selbst.

## Was Postgres allein kann

`[cmd]` PostgreSQL 17.6, Konfigurationen `simple` und `german` vorhanden,
`unaccent` verfügbar aber nicht installiert.

| Eingabe | `to_tsvector('german', …)` |
|---|---|
| `Hühner` | `huhn` |
| `Huhn` | `huhn` |
| `Hühnchen` | `huhnch` |
| `Hähnchen` | `hahnch` |
| `Hühnerbrust` | `huhnerbrust` |
| `Haferflocken` | `haferflock` |

Drei Befunde:

1. **Der Stemmer normalisiert Umlaute selbst** — `Hühner` → `huhn`, ohne
   `unaccent` und ohne unsere `search_fold`.
2. **Er zerlegt keine Komposita.** `Hühnerbrust` bleibt ein Wort.
3. **`hahnch` und `huhnch` bleiben verschieden.** Hähnchen und Hühnchen sind
   auch nach dem Stemmen zwei Wörter — das ist und bleibt ein Synonymfall.

`[cmd]` `tsearch_data` liegt im Nix-Store unter
`/nix/store/…-postgresql-17.6/share/postgresql/tsearch_data`, ist im lokalen
Container **beschreibbar** (Schreibtest bestanden, Datei danach entfernt).
`[annahme]` In Supabase Cloud ist das nicht verfügbar — der Weg über eine
installierte Wörterbuchdatei wäre damit umgebungsabhängig.

## Messung am Bestand

**1.985 zweiwortige Namensköpfe geprüft.** Frage: Wenn ein Mensch sie
zusammenschreibt, zerlegt das Wörterbuch sie wieder in genau die
Bestandteile, die im Bestand stehen?

| | Anzahl | Anteil |
|---|---|---|
| richtig zerlegt | **374** | **18,8 %** |
| falsch zerlegt | 4 | 0,2 % |
| nicht zerlegbar | 1.607 | 81,0 % |

**Die Ursache steht in der Wortabdeckung, nicht in der Technik:**

| im Wörterbuch | fehlt |
|---|---|
| `huhn`, `hühner`, `pute`, `rind`, `hafer`, `brust`, `filet`, `quark`, `kartoffel` | `hähnchen`, `brustfilet`, `mager`, `öl`, `oliven`, `süß`, `truthahn`, `poulet` |

`[Sicher]` **Das Wörterbuch kennt allgemeines Deutsch, nicht Lebensmittel.**
`hähnchen` fehlt — ausgerechnet das Wort, das im Bestand über 40 mal vorkommt.
Die Fehlschläge bestätigen es: `aalroh`, `acerolaroh`, `amaranthgekocht` —
weder die Lebensmittelnamen (`Aal`, `Acerola`, `Amaranth`) noch die
Zubereitungsangaben (`roh`, `gedünstet`, `geräuchert`, `paniert`) sind drin.

## Der wichtigste Einzelbefund

`[cmd]` Auf der **Anfrageseite** funktioniert es:

```
hühnerbrust   -> hühner + brust      (und hühner stemmt zu huhn)
putenbrust    -> pute   + brust
rinderhack    -> rind   + hack
haferflocken  -> hafer  + flocken
```

Aber: `[cmd]` `hühnerbrust` zerlegt, **`huehnerbrust` nicht.** Das Wörterbuch
trägt echte Umlaute.

**Unsere `search_fold` wandelt `ü` → `ue` vor jedem Vergleich.** Wer zuerst
faltet und dann zerlegt, bekommt nichts. Die Reihenfolge muss sein:
**zerlegen, dann falten.** Das ist eine Zeile und der Unterschied zwischen
funktioniert und funktioniert nicht.

## Was daraus folgt

Das Wörterbuch ist die richtige Technik am falschen Ende. Es taugt für die
**Anfrageseite** — dort schreibt der Mensch normales Deutsch, und dort löst es
genau Toms Fall.

Für die **Bestandsseite** braucht es kein Wörterbuch: dort stehen die Wörter
bereits getrennt. `Hähnchen Brustfilet` ist schon zerlegt und muss nur als
Wortliste indexiert werden statt als Zeichenkette.

```
Anfrage "hühnerbrust"
  -> Wörterbuch:  hühner + brust
  -> Stemmer:     huhn + brust
  -> Synonym:     huhn ≡ hähnchen        (~50 Zeilen Handarbeit)
Bestand "Hähnchen Brustfilet, roh"
  -> Wortliste:   hähnchen, brustfilet, roh
  -> Stemmer:     hahnch, brustfilet, roh
  -> trifft
```

`[Vermutung]` Die fehlenden Lebensmittelwörter lassen sich ergänzen: der
Bestand liefert sie selbst. `[cmd]` 5.172 verschiedene Namensköpfe, deren
erste Wörter genau die fehlenden Begriffe sind. Ein Ergänzungswörterbuch aus
dem Bestand plus die 14.372 allgemeinen Wörter.

## Was NICHT gemessen wurde

- Ob ein ergänztes Wörterbuch die 18,8 % nennenswert hebt. `[annahme]`
  Erwartbar deutlich, weil die Fehlschläge fast alle an fehlenden
  Bestandswörtern liegen — aber ungemessen.
- Laufzeit. Die Zerlegung lief auf 1.985 Köpfen in Sekunden; die Frage ist
  die Abfragezeit, nicht die Aufbereitung.
- Ob `unaccent` gebraucht wird, wenn der Stemmer Umlaute ohnehin normalisiert.

## Ein Messfehler, der festgehalten gehört

`[cmd]` Der erste Messversuch zog alle Leerzeichen aus dem ganzen
Komma-Abschnitt und erzeugte damit Ungetüme wie
`aalgebratenohnefett(pfanne)`. Ergebnis: 11,9 %, und die Zahl war wertlos,
weil die Eingabe es war. Erst die Beschränkung auf echte zweiwortige Köpfe
lieferte eine Zahl, die etwas bedeutet.

*Wer eine Zerlegung misst, misst zuerst, was er hineingibt.*
