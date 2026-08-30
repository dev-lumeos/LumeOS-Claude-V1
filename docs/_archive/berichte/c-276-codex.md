# C-276 Codex Bericht

## Auftrag

Namenskern-Dubletten im sichtbaren Supplements-Katalog bereinigen, ohne Zeilen zu loeschen:

- Sammelname plus Formen: Formen per `parent_id` an den Sammelnamen haengen.
- Formen ohne Sammelnamen: sichtbar lassen und begruenden.
- NAC-Sonderfall: stehengebliebene F05-Huelle an den Sammelnamen haengen.
- Unsichtbare Huellen mit sichtbarem Gegenstueck per `parent_id` anhaengen.
- Gate-Waechter ueber den Namenskern bauen.
- Kette gegen Live-Abweichung 416/447 messen und melden, nicht live passend machen.

## Geaenderte Dateien

- `supabase/_pipeline/13_supplements/141e_supplement_kern_dubletten.sql`
- `supabase/_pipeline/kette.json`
- `tools/supplement-kern-dubletten-pruefen.mjs`
- `package.json`

Nicht angefasst:

- `apps/`
- `supabase/_pipeline/13_supplements/141d_kimi_wada_scope.ts`
- `docs/todo/`
- `docs/ssot/`

## Erwartung vor dem Lauf

[cmd] Live vor C-276:

| Messung | Wert |
|---|---:|
| `supplements.supplements` | 596 |
| `im_katalog = true` | 447 |
| sichtbare Top-Level-Eintraege | 418 |
| parented Forms | 29 |
| Top-Level-Kerndubletten | 6 |
| Kerndubletten ueber alle sichtbaren Eintraege inkl. Kinder | 18 |
| unsichtbare Huellen mit sichtbarem Gegenstueck | 66 |

[cmd] Ketten-Probelauf vor C-276:

| Messung | Wert |
|---|---:|
| `im_katalog = true` | 416 |
| sichtbare Top-Level-Eintraege | 416 |
| parented Forms | 50 |
| unsichtbare Huellen mit sichtbarem Gegenstueck | 50 |
| Top-Level-Kerndubletten | 6 |

[read] Die 66 aus dem Auftrag stimmen fuer Live. Die frische Kette erzeugt 50, weil Kette und Live beim Sichtbarkeitsausdruck fuer `im_katalog` auseinanderlaufen.

## Was umgesetzt wurde

[cmd] Neuer Kettenschritt:

`supabase/_pipeline/13_supplements/141e_supplement_kern_dubletten.sql`

Der Schritt:

- berechnet den Namenskern als lower-case, ohne Klammern und ohne Nicht-Alnum-Zeichen,
- haengt 20 sichtbare Form-/Cross-Ref-Eintraege an ihre Sammelnamen,
- haengt unsichtbare F05-/LumeOS-Huellen mit gleichem Namenskern an ein sichtbares Top-Level-Gegenstueck,
- erzeugt Aliaszeilen mit Quelle `c276_parent_resolution`,
- validiert NAC, Vitamin C, Vitamin B3 und die Restdubletten.

[cmd] Live-Lauf des Schritts:

`OK C-276: sichtbare Formen 20, unsichtbare Huellen 66, parent_id gesamt 99, erlaubte Top-Level-Kerndubletten 4`

## NAC

[cmd] Vorher war `f05_nac` als sichtbarer Eintrag mit Quelle `kimi_supplement` stehengeblieben. C-276 haengt `f05_nac` und `sub_f4b95e805a` an den Sammelnamen `nac`.

[cmd] Nachher bleibt genau ein Top-Level-Eintrag fuer den Namenskern `nac`.

## Restdubletten

[cmd] Nach C-276 live:

| Messung | Wert |
|---|---:|
| `supplements.supplements` | 596 |
| `im_katalog = true` | 447 |
| sichtbare Top-Level-Eintraege | 414 |
| `parent_id IS NOT NULL` | 99 |
| Top-Level-Kerndubletten | 4 |
| unbekannte Top-Level-Kerndubletten | 0 |

[cmd] Erlaubte Top-Level-Kerndubletten:

| Kern | Begruendung |
|---|---|
| `boron` | Boron plus hormoneller Cross-Ref, kein Form/Sammelname-Fall |
| `panaxginseng` | American Ginseng und Korean Red Ginseng, kein gemeinsamer Sammelname |
| `vitaminb3` | Nicotinic acid und Nicotinamide/Niacinamide sind pharmakologisch verschieden |
| `vitamink2` | MK-4 und MK-7 bleiben als unterschiedliche Formen sichtbar |

[read] Kerndubletten ueber alle sichtbaren Eintraege inklusive Kinder bleiben 18. Das ist jetzt gewollt: die Formen sind sichtbar, aber nicht mehr Top-Level. Der alte Namensvergleich hat die falsche Ebene gemessen.

## Gate-Waechter

[cmd] Neuer Waechter:

`tools/supplement-kern-dubletten-pruefen.mjs`

Er prueft nur Top-Level-Eintraege:

```sql
supplements.supplements
WHERE im_katalog IS TRUE
  AND parent_id IS NULL
```

Der Waechter erlaubt nur die dokumentierten Kerne und bricht bei jeder unbekannten Kerndublette ab.

[cmd] Normalprobe live:

`[supplement-kern] 414 Top-Level-Eintraege geprueft`

`[supplement-kern] 4 Kerndubletten-Gruppe(n), davon 4 erlaubt, 0 unbekannt`

[cmd] Negativprobe:

`C276_NEGATIVPROBE=1 node tools/supplement-kern-dubletten-pruefen.mjs`

Ergebnis:

`ROT ... vitaminc: Vitamin C | Vitamin C (Negativprobe)`

[read] Damit misst der Waechter beide Richtungen: gruen beim Ist-Stand, rot bei einer eingebauten vierten/falschen Gruppe.

## Kette gegen Live

[cmd] Kette nach Einbau von C-276:

| Messung | Wert |
|---|---:|
| Schritte | 103 |
| Kettenlauf Wegwerf-DB | Exit 0 |
| `supplements.supplements` | 596 |
| `im_katalog = true` | 412 |
| Top-Level sichtbar | 412 |
| `parent_id IS NOT NULL` | 104 |
| Top-Level-Kerndubletten | 4 |

[cmd] Live nach C-276:

| Messung | Wert |
|---|---:|
| `supplements.supplements` | 596 |
| `im_katalog = true` | 447 |
| Top-Level sichtbar | 414 |
| `parent_id IS NOT NULL` | 99 |
| Top-Level-Kerndubletten | 4 |

[read] Befund C-265 in neuer Form: Die Kette erzeugt weiterhin nicht denselben Sichtbarkeitsstand wie Live.

Ursache:

- In der frischen Kette wird `im_katalog` durch `140_supplement_nutzertexte.sql` mit `parent_id IS NULL` im generierten Ausdruck erzeugt.
- Live traegt den Ausdruck ohne `parent_id IS NULL`:

```sql
COALESCE(description_en, ''::text) <> ''::text
OR COALESCE(description_de, ''::text) <> ''::text
OR evidence_grade IS NOT NULL
```

- Das passt zum spaeter live eingespielten Verhalten aus der Kimi-Namens-/Text-Bruecke, wird aber von der heutigen Kette nicht reproduziert.

[cmd] C-276 hat diese Drift nicht repariert und Live nicht angepasst. Der neue Waechter prueft deshalb bewusst die Top-Level-Ebene ueber `parent_id`, nicht die generierte Sichtbarkeitsformel.

## Pruefungen

[cmd] Wegwerf-Datenbank:

| Pruefung | Ergebnis |
|---|---|
| Voller Kettenlauf | Exit 0 |
| Schemapruefung | `SCHEMA VOLLSTAENDIG` |
| `testdaten-einspielen.ts` | erfolgreich |
| `testdaten-pruefen.ts` | rot, 5 bekannte nicht-C-276-Fehler |

[cmd] Die 5 Fehler im Wegwerf-`testdaten-pruefen.ts`:

- 3 Shopping-List-Checks aus C-251,
- Vitamin-D3 Low-Stock-Item fehlt,
- Refill-Stufen fehlen.

[cmd] Live:

| Pruefung | Ergebnis |
|---|---|
| Vollsicherung vorher | `backup/vollsicherung/20260825_175409_c276_before_live.dump` |
| Live-Einspielung C-276 | erfolgreich |
| Schemapruefung | `SCHEMA VOLLSTAENDIG` |
| `testdaten-pruefen.ts` | `OK: C-82 Testdaten stimmen.` |
| `pnpm gate` | gruen |

[cmd] Gate-Nachweis liegt in:

`backup/c276/pnpm-gate.out`

## Nicht entschieden

[read] C-276 hat keine Salzform gewaehlt, keine Zeile geloescht und keine Katalogzeile versteckt. Die verbleibenden Top-Level-Kerndubletten sind fachliche Varianten oder Cross-Refs und muessen bei Bedarf als eigener Produktentscheid behandelt werden.

## Nachtrag C-277

[cmd] Nachpruefung am Live-Stand zeigte: `im_katalog` hatte `parent_id IS NULL` verloren.

Live-Ausdruck vorher:

```sql
COALESCE(description_en, '') <> ''
OR COALESCE(description_de, '') <> ''
OR evidence_grade IS NOT NULL
```

Folge:

| Messung | vorher |
|---|---:|
| `im_katalog = true` | 447 |
| Top-Level sichtbar | 414 |
| sichtbare Unterformen | 33 |

[cmd] Beispiele der falsch sichtbaren Unterformen:

- `sub_2c308411e9` - Caffeine (anhydrous)
- `sub_c325e8c0b7` - Magnesium chloride
- `sub_5e6fa4949b` - Magnesium citrate
- `sub_96dc337b14` - Iron (as ferrous bisglycinate)
- `sub_1b98d69c9a` - Iron (as ferrous sulfate)

[cmd] Ursache:

`supabase/_pipeline/13_supplements/144_kimi_wave3_name_bridge.ts` definierte `im_katalog` aktiv neu und kommentierte dabei falsch, dass `parent_id` kein Sichtbarkeits-Ausschluss sein duerfe. Dieser Schritt wurde live nachgezogen und hat die Drift erzeugt. In einem heutigen Vollauf korrigierte `140_supplement_nutzertexte.sql` spaeter wieder, weshalb die frische Kette naeher am richtigen Zustand lag.

[cmd] Reparatur:

- `144_kimi_wave3_name_bridge.ts` definiert `im_katalog` jetzt wieder mit `parent_id IS NULL`.
- `tools/supplement-kern-dubletten-pruefen.mjs` prueft zusaetzlich, dass keine Unterform `im_katalog = true` traegt.
- C-276s Formliste wurde um zwei Boldenone-Ester erweitert:
  - `f05_boldenone_acetate` -> `sub_af6dd9482e`
  - `f05_boldenone_cypionate` -> `sub_af6dd9482e`

[cmd] Live-Ausdruck nachher:

```sql
parent_id IS NULL
AND (
  NULLIF(btrim(COALESCE(description_en, '')), '') IS NOT NULL
  OR NULLIF(btrim(COALESCE(description_de, '')), '') IS NOT NULL
  OR evidence_grade IS NOT NULL
)
```

[cmd] Finale Zahlen:

| Messung | Live | Kette |
|---|---:|---:|
| `supplements.supplements` | 596 | 596 |
| `im_katalog = true` | 412 | 412 |
| Top-Level sichtbar | 412 | 412 |
| sichtbare Unterformen | 0 | 0 |
| `parent_id IS NOT NULL` | 101 | 104 |
| Top-Level-Kerndubletten | 4 | 4 |

[read] Die Sichtbarkeitszahl ist jetzt identisch. Die unterschiedliche Parent-Gesamtzahl bleibt Daten-Drift ausserhalb der Katalogsicht; die Top-Level-Slugs sind identisch. Es bleiben nur vier Namensabweichungen bei gleichem Slug:

- `ashwagandha-ksm66`: Live `Ashwagandha (KSM-66)`, Kette `Ashwagandha (KSM-66/Sensoril)`
- `sub_9132da9055`: Live `Methandienone`, Kette `Methandienone (Dianabol)`
- `sub_be89b6f179`: Live `Oxymetholone`, Kette `Oxymetholone (Anadrol)`
- `sub_d8baf04840`: Live `Oxandrolone`, Kette `Oxandrolone (Anavar)`

[cmd] Nachweise:

| Pruefung | Ergebnis |
|---|---|
| Vollsicherung vor Live-Fix | `backup/vollsicherung/20260825_180619_c277_before_im_katalog.dump` |
| Finaler Kettenlauf | 103 Schritte, `KETTE OK: 228.0s` |
| C-276 im finalen Kettenlauf | `sichtbare Formen 22, unsichtbare Huellen 50, parent_id gesamt 104` |
| Live-Schemapruefung | `SCHEMA VOLLSTAENDIG` |
| Live-`testdaten-pruefen.ts` | `OK: C-82 Testdaten stimmen.` |
| Live-`pnpm gate` | gruen |
| C-277-Negativprobe | rot bei simulierter sichtbarer Unterform |

[cmd] Nachweisdateien:

- `backup/c276/c277-kette-final.out`
- `backup/c276/c277-pnpm-gate.out`
- `backup/c276/c277-negativprobe.out`
- `backup/c276/c277-boldenone.out`
