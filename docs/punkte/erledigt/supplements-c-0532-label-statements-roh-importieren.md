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
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 2baaf25a
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-22
---

# C-532 - die Label Statements roh importieren

## Codex Empfehlung aus C-527

> Statements zuerst ROH in einer eigenen Relation importieren;
> `label_url` im Readmodell aus `dsld_id` berechnen; keine
> automatische Allergen-Entwarnung aus Formulation ableiten.

## Toms Vorgabe

Der Reiter *Hinweise* wartet auf Precautions und Formulation.
Etikettenbilder kommen getrennt ueber die NIH-Schnittstelle; C-532
legt dafuer keinen Zwischenspeicher an.

## Die Grenze

Zwei *No Soy*-Claims widersprechen vorhandenen *Soy Lecithin*-Zutaten.
Darum importiert C-532 die Aussagen roh zum Anzeigen, wertet sie aber
nicht aus: Ein Claim kann keine Allergiewarnung aufheben.

## Abnahmebedingungen

    A1  eine eigene Relation, roh, je Produkt und Art.
    A2  alle elf Arten, Zahl je Art.
    A3  label_url aus dsld_id im Readmodell.
    A4  KEINE Auswertung, keine Entwarnung.
    A5  Gegenprobe: die zwei No-Soy-Widersprueche
        stehen roh drin, die Allergiepruefung warnt
        weiter.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

### Umsetzung

- Neue Relation `supplements.supplier_product_label_statements`, Primaerschluessel
  `(product_id, statement_type)`, Quelle `dsld`, RLS aktiv. `authenticated`
  darf lesen, `anon` nicht.
- Neuer Pipeline-Schritt importiert ausschliesslich die drei DSLD-Felder
  `DSLD ID`, `Statement Type` und `Statement`. Die Texte werden nicht
  normalisiert, klassifiziert oder als Allergenentscheidung verwendet.
- `supplier_product_detail(uuid)` liefert `label_url` als
  `https://dsld.od.nih.gov/label/<dsld_id>` und die rohen
  `label_statements`. Das ist eine Webseiten-URL, kein Bildpfad.

### Importbefund

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

Die Statements gehoeren zu 214.759 Produkten. 43 Quellzeilen ohne
Statement-Art oder -Text werden bewusst nicht importiert: Ohne Art oder
Wert waeren sie keine nutzbare rohe Aussage.

Die vor C-532 in C-527 berichteten Typzahlen werden hiermit berichtigt.
Der dortige XLSX-Analysator behandelte ausgelassene Zwischenzellen als
Spaltenverschiebung. Der C-532-Importer liest die Tabellen korrekt; die
oben stehenden Zahlen sind der massgebliche Stand.

### Gegenprobe und Rechte

- DSLD 63829 und 260885 enthalten jeweils den rohen *No Soy*-Text sowie
  eine `Soy Lecithin`-Inhaltszeile.
- `nutrition:contains_soy` besteht weiter. Keine C-532-Funktion liest
  `Formulation` fuer diese oder eine andere Entwarnung.
- Auf der Kettendatenbank: `authenticated SELECT = true`,
  `anon SELECT = false`.

### Tests und Laeufe

- Sicherung vor dem Lauf:
  `backup/schema/20260922161324_c532_vorher.sql`.
- TDD-Gegenprobe: Ohne Relation schlaegt der neue C-532-Test fehl; nach
  Schema- und Daten-Pipeline sind beide Tests gruen.
- Die Vollkette importierte C-532 vollstaendig: 11 Arten, 1.467.176
  Statements, 214.759 Produkte. Ihr anschliessender
  Schema-Vollstaendigkeitswaechter bleibt an einer fremden Abweichung rot:
  `supplements.substance_group_memberships` hat fuer `service_role` zu
  weitgehende Rechte (Schritt 327/327a).
- `migration-datenlogik-pruefen.mjs` und
  `migration-kette-pruefen.mjs` sind gruen. `pnpm gate` ist daneben rot
  wegen bekannter, nicht von C-532 stammender Befunde: derselben
  ueberfaelligen/fehlgeschlagenen Tageskette und 26 statt 25
  Punktebefunden.

C-532 ist vorbereitet, aber nicht in die laufende Datenbank eingespielt.
Apps und Dev-Server wurden nicht angefasst.

## Abnahme

**2026-09-08, Orchestrator. Vorbereitet ? NICHT live.**

`[cmd]` **Keine Statement-Relation in der laufenden Datenbank.**

`[cmd]` **Vorliegend:** `migrations/20260922091600_c532_label_
statements_raw.sql`, `532_dsld_label_statements_import.ts`,
**plus Probe.**

### Der Importbefund

    Suggested Use                  210.388
    Statement of Identity          207.942
    Formulation                    197.915
    Precautions                    197.190
    Other                          176.000
    Product Specific Information   159.282
    Seals/Symbols                  116.779
    Branding Statement(s)          111.195
    Product/Version Code            75.533
    Formulation re: Organic         14.884
    Formulation re: Homeopathic         68
    Gesamt                       1.467.176

`[read]` **Und 43 Quellzeilen ohne Art oder Text bewusst
ausgelassen** ? **begruendet.**

### Er hat C-527 selbst berichtigt

> *,,Der dortige XLSX-Analysator behandelte ausgelassene
Zwischenzellen als Spaltenverschiebung."*

`[read]` **Ein Messfehler im eigenen Messauftrag, beim Bauen
gefunden und benannt.**

### Die Grenze haelt

`[cmd]` **DSLD 63829 und 260885: roher *,,No Soy"*-Text UND
`Soy Lecithin`, `contains_soy` warnt weiter.**

**Abgenommen. Einspielen steht aus.**

