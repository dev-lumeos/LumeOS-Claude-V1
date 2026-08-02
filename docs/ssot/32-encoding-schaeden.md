# Encoding-Schäden (B-09) — Suchbericht

**Stand:** 2026-08-02 (autonome Sitzung) · **Ankerhash:** 76c8080
**Auftrag:** repo-weit beschädigte UTF-8-Sequenzen finden, nichts reparieren.
**Umfang:** `.ts .tsx .md .sql .ps1 .json`, ohne `node_modules`, `dist`,
`.next`, `temp`, `tmp`, `backup/data`.
**Methode:** `[cmd]` vier ripgrep-Durchgänge: (1) klassisches
UTF-8-als-Latin1-Mojibake (`Ã.`, `â€`, `ï»¿`, U+FFFD `�`), (2) CP850-Muster
(`ÔÇ`, `├x`, `┬`), (3) `Â.`-Muster, (4) `?`-Ersatzzeichen in Wortkontext
(`[A-Za-z]?[a-z]{1,3}`, alle Treffer einzeln gesichtet). Verdachtsstellen per
Hex-Dump (`od -c`) verifiziert.

---

## Ergebnis: 1 Datei mit echtem Schaden, 2 Stellen

### Bestätigter Schaden

| Pfad | Zeile | Beschädigt | Vermutetes Original |
|---|---|---|---|
| `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` | 396 | `k?se` — `[cmd]` Hex-Dump: literales ASCII `?` (0x3F) | `käse` |
| `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` | 399 | `n?sse` — dito | `nüsse` |

Kontext: beide stehen in Regex-Alternationen der Funktion
`nutrition.auto_tag_food()`:

```
'(milch|k?se|kaese|joghurt|quark|sahne)'
'(nuss|n?sse|nuesse|mandel|cashew|walnuss|haselnuss|erdnuss)'
```

**Doppelte Brisanz über den Schönheitsfehler hinaus:**

1. Der Schaden ist **irreversibel im Repo** — `?` trägt keine Information
   mehr; das Original ist nur aus dem Sprachkontext rekonstruierbar.
2. In einer Regex ist `k?se` nicht „k-Fragezeichen-se", sondern
   „optionales k, dann se" — die Alternation matcht damit **jedes Wort mit
   ‚se'** (Gemüse, Bratensauce …). Die `lactose_free`-Heuristik dieser Datei
   wäre grob falsch, **wenn** die Funktion liefe. `[cmd]` Sie läuft nicht:
   der Container enthält weder die Funktion noch den Trigger
   (siehe `31-migrations-rueckbau.md`). Latent, nicht akut.

### Bekannter Fall aus B-09: nicht reproduzierbar

`[cmd]` `packages/shared/src/supabase/client.ts` (12 Zeilen, vollständig
gelesen + `file`-Check: „UTF-8 text") enthält **heute kein Mojibake**.
Auch `server.ts` daneben ist sauber. Der Em-Dash `—` in Zeile 1 ist korrekt
kodiert. `[annahme]` Der ursprüngliche B-09-Befund war ein Anzeigefehler
(PowerShell-Konsole mit CP850/CP1252 stellt UTF-8-Mehrbytezeichen als
Zeichensalat dar), kein Dateischaden — oder die Datei wurde seither ersetzt;
Git-History nicht geprüft.

### Geprüft und sauber (Falsch-Positive der Suchmuster)

- `[cmd]` 5 Dateien enthalten Mojibake-Sequenzen **als Erkennungs-Regexe**
  (`system/workorders/cli/nutrient-defs-seed-extract.ts` + Test,
  `nutrition-human-layer.ts`, 2 p1-005-Validierungs-SQLs) — Werkzeuge der
  damaligen Import-Bereinigung, kein Schaden.
- `[cmd]` `├`/`┬`/`─`-Treffer sind Box-Drawing-Zeichen in ASCII-Diagrammen
  (Spec-Flows, Brainstorm-Docs) — korrekt kodiert.
- `[cmd]` Alle übrigen `x?yz`-Treffer sind URL-Query-Strings
  (`?user_id`, `?date=`, `?query`, `?limit`, `?consent`, `?nutrient` …).

### Nebenbefund Datenbank (read-only, über den Auftrag hinaus)

`[cmd]` Die Live-Daten sind sauber: 0 Treffer für `%?%` in
`foods.name_de/name_display`, `food_aliases.alias`,
`nutrient_defs.name_de/group_de/unit`. Die Import-Bereinigung hat die Daten
erwischt — nur die Migrationsdatei blieb beschädigt.

---

## Grenzen dieser Suche

- Nur die 6 beauftragten Dateitypen; `.js`, `.yaml`, `.txt`, `.csv` ungeprüft.
- Doppelt kodiertes Mojibake (`Ã¤` → `Ã?Â¤` usw.) über die Muster (1)–(3)
  hinaus nicht gezielt gesucht; Muster (1) hätte die häufigsten Formen gefunden.
- `?`-Ersatz am **Wortende oder -anfang** (z. B. `Di?t` fand das Muster,
  `hei?` fände es nur bei ≥1 Folgebuchstaben) — Restlücke `[annahme]` klein,
  da alle bekannten Schadensquellen (BLS-Import) durchgesichtet wurden.

## Konsequenz für TODO (nicht ausgeführt)

- B-09 kann von „repo-weit suchen" auf „2 Stellen in `20240522_002` fixen"
  verengt werden — **aber**: die Datei ist Teil der D-12-Frage O-6
  (Altdateien archivieren vs. behalten). Fix nur sinnvoll, wenn die Datei
  überlebt; in den Drafts (`migrations-draft/`) existiert die Funktion nicht.
- Der Verdachtsfall `client.ts` sollte aus B-09 gestrichen oder als
  Konsolen-Artefakt vermerkt werden.
