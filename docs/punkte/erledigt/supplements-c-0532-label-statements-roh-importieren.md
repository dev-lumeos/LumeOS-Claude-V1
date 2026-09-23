---
nr: C-532
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-527
entscheidung: null
agent: codex
erledigt: 2026-09-22
commit: "kein Commit (Tom-Vorgabe)"
beruehrt:
  tabellen: [supplements.supplier_products, supplements.supplier_product_label_statements]
zahlen:
  gemessen: 2026-09-22
  statements: 1467176
  produkte: 214759
  arten: 11
  vollkette_sekunden: 1373.7
---

# C-532 - die Label Statements roh importieren

## Auftrag und Grenze

Label Statements werden je Produkt und Art roh importiert und angezeigt.
`Formulation` und `Precautions` werden dabei weder klassifiziert noch für
eine Allergieentscheidung verwendet. Ein Etikett-Claim kann keine
vorhandene positive Zutat oder Warnung aufheben.

Die Etikettenbild-Schnittstelle der NIH bleibt G-495 vorbehalten;
C-532 speichert keinen Bildcache.

## Umsetzung

- `supplements.supplier_product_label_statements` ist die neue
  Produktrelation. Ihr Primaerschluessel `(product_id, statement_type)`
  erlaubt genau eine rohe Aussage jeder Art je Produkt.
- Der Pipeline-Schritt liest nur `DSLD ID`, `Statement Type` und
  `Statement`. Er normalisiert, klassifiziert und leitet nichts ab.
- `supplements.supplier_product_detail(uuid)` behält seine Signatur
  `p_product_id uuid` und seine bisherigen Felder `header`, `contents`
  und `suppliers`. Ergänzt sind ausschliesslich `header.label_url` und
  `label_statements`.
- `label_url` wird aus `dsld_id` als
  `https://dsld.od.nih.gov/label/<dsld_id>` erzeugt. Es ist eine
  Webseiten-URL, kein Bildpfad.

## Live-Einspielen 2026-09-22

Sicherung vor dem Einspielen:
`backup/schema/20260922161324_c532_vorher.sql`
(`SHA-256 A6D5C135D6A863651740C9B98FE3C37266762B57380833A522CFC12EDE20D503`).

Die Strukturmigration und der Daten-Pipeline-Schritt sind auf der
laufenden Datenbank ausgeführt. Der Import ist transaktional.

| Statement-Art | Statements |
|---|---:|
| Branding Statement(s) | 111.195 |
| Formulation | 197.915 |
| Formulation re: Homeopathic | 68 |
| Formulation re: Organic | 14.884 |
| Other | 176.000 |
| Precautions | 197.190 |
| Product Specific Information | 159.282 |
| Product/Version Code | 75.533 |
| Seals/Symbols | 116.779 |
| Statement of Identity | 207.942 |
| Suggested Use | 210.388 |
| **Gesamt** | **1.467.176** |

Die Statements gehoeren zu 214.759 Produkten und 11 Arten. 43
Quellzeilen ohne Statement-Art oder -Text bleiben bewusst draussen:
Ohne Art oder Inhalt bilden sie keine rohe Aussage.

Die Typzahlen aus C-527 werden damit berichtigt. Der damalige
XLSX-Analysator verschob Spalten bei ausgelassenen Zwischenzellen; der
hier verwendete Import liest die Tabellenstruktur korrekt.

## Gegenproben

- DSLD 63829 liefert `label_url = https://dsld.od.nih.gov/label/63829`
  und sieben rohe Statements.
- DSLD 63829 und 260885 enthalten je einen rohen *No Soy*-Claim und
  `Soy Lecithin`. Der vorhandene dev-Allergieeintrag
  `nutrition:contains_soy` liefert für beide Produkte weiterhin je eine
  Warnung.
- `authenticated` hat `SELECT` auf der neuen Relation, `anon` hat kein
  `SELECT` und kein `EXECUTE` auf dem Detail-RPC.
- Der bestehende Detailvertrag blieb lesbar: drei vorherige Top-Level-
  Felder und acht Header-Felder sind erhalten; nur zwei additive Felder
  kamen hinzu.

## Validierung

- C-532-Integrationstest: 2/2 gruen auf der Kettendatenbank.
- `migration-datenlogik-pruefen.mjs`: gruen, 44/44 historische
  Datenoperationen.
- `migration-kette-pruefen.mjs`: gruen.
- Vollkette `lumeos_c533_kette`: `SCHEMA VOLLSTAENDIG`,
  `KETTE OK: 1373.7s`. C-532 selbst importierte darin wieder exakt
  1.467.176 Statements, 214.759 Produkte und 11 Arten.
- Der dauerhafte C-327-Grantfehler wurde als C-533 geschlossen: Der
  Sollstand unterschlug eine in Quelle und Kettenschritt explizit
  vergebene `service_role ALL`.
- `punkte-pruefen.mjs` bleibt ausschliesslich an 25 alten, fehlenden
  `kind_von`-Zielen und der leeren `beruehrt`-Angabe in C-527 rot.

Apps und Dev-Server wurden nicht angefasst. Nicht committet auf Toms
Vorgabe.

## Abnahme

Live eingespielt und nachgemessen am 2026-09-22.

## Nachtrag: LIVE eingespielt, 2026-09-08

`[cmd]` **Selbst nachgemessen,
`supplements.supplier_product_label_statements`:**

    1.467.176 Zeilen
    11 Arten
    214.759 Produkte

`[cmd]` **`supplier_product_detail` liefert zusaetzlich
`header.label_url` und `label_statements`** ? **Felder
hinzugefuegt, keine entfernt.**

`[cmd]` **`anon` hat kein SELECT und kein RPC-Execute.**

