# Nutrition Module — Food Taxonomy & Human Layer
> Spec Phase 5 | Kategorien, Canonical Names, Semantic Tags, Preference System

---

## Übersicht

BLS 4.0 ist eine wissenschaftliche Datenbank. User sehen niemals BLS-Rohdaten.
Stattdessen liegt über den Rohdaten eine vollständige **Human Layer**:

```
BLS Rohdaten (wissenschaftlich)
        │
        ▼
┌───────────────────────────────────────────────────────┐
│  HUMAN LAYER                                           │
│  ① Canonical Names     → Anzeigename für User         │
│  ② Category Tree       → 4-Ebenen Hierarchie          │
│  ③ Semantic Tags       → Ingredient/Diet/Allergen/Gym  │
│  ④ Search Aliases      → Synonyme & alternative Namen  │
└───────────────────────────────────────────────────────┘
        │
        ▼
User erlebt: "Hähnchenbrust", "Lachs", "Haferflocken"
User filtert: liked/disliked auf jeder Ebene
```

---

## Preference-System Überblick

User kann **auf jeder Ebene** liken oder disliken:
- Ganze Hauptkategorie: "Ich mag keine Innereien"
- Unterkategorie: "Ich mag kein Schweinefleisch"
- Einzelnes Food: "Ich mag Hähnchenbrust sehr"
- Tag: "Ich will nichts mit Gluten"

**Prioritäts-Hierarchie bei Konflikten:**
```
food (spezifisch) > category (spezifisch) > tag
Spezifischerer Eintrag schlägt allgemeineren.
Beispiel: User disliked "Fisch" (tag), liked "Lachs" (food)
→ Lachs wird trotzdem angezeigt.
```

---

## Schema: Preference Items

```sql
-- Erweiterung der food_preferences: likes/dislikes werden strukturiert
nutrition.food_preference_items (
  id              UUID PK
  user_id         UUID NOT NULL
  preference      TEXT NOT NULL       -- 'liked' | 'disliked'
  target_type     TEXT NOT NULL       -- 'food' | 'category' | 'tag'
  food_id         UUID FK → foods             -- wenn target_type = 'food'
  category_id     UUID FK → food_categories  -- wenn target_type = 'category'
  tag_code        TEXT FK → tag_definitions  -- wenn target_type = 'tag'
  created_at      TIMESTAMPTZ
  -- CONSTRAINT: genau eines der drei _id Felder muss gesetzt sein
)
```

---

## Schema: Category Tree

```sql
nutrition.food_categories (
  id          UUID PK DEFAULT gen_random_uuid()
  slug        TEXT UNIQUE NOT NULL
  name_de     TEXT NOT NULL
  name_en     TEXT
  parent_id   UUID FK → food_categories    -- NULL = Level 1
  level       INTEGER NOT NULL             -- 1, 2, 3, 4
  icon        TEXT                         -- emoji
  sort_order  INTEGER DEFAULT 0
  bls_hint    TEXT    -- Hinweis auf BLS-Prefix/Digit-Pattern (für Import)
)

-- Erweiterung nutrition.foods:
-- name_display      TEXT          user-freundlicher Anzeigename
-- name_display_en   TEXT
-- category_id       UUID FK → food_categories  (tiefste Ebene)
-- is_prepared_dish  BOOLEAN DEFAULT false
-- processing_level  TEXT   raw | minimally_processed | processed | ultra_processed
```

---

## Category Tree — Level 1 bis 4

---

### 🥩 FLEISCH & GEFLÜGEL

#### Rindfleisch
- Rinderhackfleisch (U0xxxx Rind)
- Rindersteaks & Braten
  - Filet & Tenderloin
  - Rumpsteak & Entrecôte
  - Gulasch & Bratenfleisch (Bug)
  - Rindsbrust & Rippen
  - Tafelspitz & Kochfleisch
  - Keule & Hinterhesse
  - Roastbeef
  - Rinderblut & Sonderschnitte
- Rindfleisch Konserven & Saucen

#### Kalbfleisch
- Kalbsschnitzel & Roulade
- Kalbsfilet & Steaks
- Kalbsgulasch & Braten
- Kalbshackfleisch

#### Schweinefleisch
- Schweinefilet & Medaillons
- Schweinekoteletts & Nacken
- Schweinebauch & Wamme
- Schweinespeck & Rückenspeck
- Schweinehackfleisch
- Schmorbraten & Gulasch (Schwein)
- Pökelwaren & Schinken (roh)

#### Geflügel
- Hähnchen
  - Hähnchenbrust & Filet
  - Hähnchenschenkel & Flügel
  - Hähnchen ganz
  - Suppenhuhn
- Pute/Truthahn
  - Putenbrust
  - Putenschenkel
  - Pute ganz
- Ente
  - Entenbrust
  - Entenschenkel
  - Ente ganz
- Gans
- Poularde & sonstiges Hausgeflügel

#### Lamm & Schaf
- Lammkeule & Lammrücken
- Lammkoteletts & Lammcarré
- Lammschulter & Lammhaxe
- Lammhackfleisch
- Schaf & Hammel

#### Wild
- Hase & Kaninchen
  - Kaninchen Fleisch
  - Hase Fleisch
  - Wildkaninchen
- Hirsch & Reh
- Wildschwein
- Wildgeflügel
  - Wildente
  - Fasan & Rebhuhn
  - Wachtel
- Sonstiges Wild (Rentier, Pferd, Ziege)

#### Innereien
- Leber
  - Rinderleber
  - Schweineleber
  - Kalbsleber
  - Geflügelleber (Hähnchen, Ente, Gans)
- Herz
  - Rinderherz, Schweineherz, Hähnchenherz
- Niere
- Lunge
- Gehirn
- Magen & Kutteln
- Zunge
- Bries (Thymus)
- Blut & Blutprodukte

#### Wurstwaren & Aufschnitt
- Kochwurst
  - Leberwurst & Pasteten
  - Blutwurst & Sülze
  - Presswurst
- Brühwurst
  - Wiener & Frankfurter Würstchen
  - Lyoner & Mortadella
  - Fleischkäse & Leberkäse
  - Geflügelwurst
- Rohwurst
  - Salami (Schwein, Rind, Geflügel)
  - Mettwurst & Teewurst
  - Chorizo
  - Cervelatwurst
- Rohpökelware & Schinken
  - Schwarzwälder Schinken
  - Lachsschinken
  - Prosciutto & Parmaschinken
  - Kasseler
  - Speck geräuchert

---

### 🐟 FISCH & MEERESFRÜCHTE

#### Fetter Seefisch
- Lachs & Atlantischer Lachs
- Hering
- Makrele
- Thunfisch
- Sardine & Sardelle
- Heilbutt

#### Magerer Seefisch
- Kabeljau & Dorsch
- Seelachs & Pollack
- Scholle & Seezunge
- Steinbutt
- Rotbarsch
- Forelle (Meerforelle)

#### Süßwasserfisch
- Forelle (Regenbogen, Bach)
- Karpfen
- Zander & Barsch
- Hecht
- Aal

#### Räucherfisch & Fischprodukte
- Räucherlachs
- Bückling (Räucherhering)
- Makrele geräuchert
- Fischkonserven (Thunfisch, Sardinen in Öl/Wasser)
- Fischpaste & Kaviar

#### Schalentiere
- Garnelen & Shrimps
- Hummer & Langusten
- Krabben & Taschenkrebse
- Flusskrebse

#### Weichtiere & Andere
- Miesmuscheln
- Jakobsmuscheln & Venusmuscheln
- Austern
- Tintenfisch & Calamari
- Oktopus
- Schnecken & Escargot

---

### 🥛 MILCH & KÄSE

#### Trinkmilch & Sahne
- Vollmilch (3,5% Fett)
- Fettarme Milch (1,5%)
- Magermilch
- Laktosefreie Milch
- H-Milch
- Schlagsahne (>30% Fett)
- Saure Sahne & Crème fraîche
- Kaffeerahm (10-15% Fett)
- Kondensmilch & Milchpulver

#### Joghurt & Quark
- Naturjoghurt (3,5%, 1,5%, 0,1%)
- Griechischer Joghurt (>10% Fett)
- Skyr
- Kefir
- Buttermilch
- Magerquark
- Speisequark (10%, 20%, 40% Fett)
- Hüttenkäse/Cottage Cheese

#### Käse — Hartkäse (>45% Trockenmasse)
- Parmesan & Grana Padano
- Emmentaler & Gruyère
- Bergkäse & Allgäuer Käse
- Gouda gereift (>12 Monate)
- Manchego & Pecorino

#### Käse — Schnittkäse
- Gouda & Edamer (jung/mittelalt)
- Tilsiter & Butterkäse
- Havarti & Edam
- Appenzeller

#### Käse — Weichkäse
- Brie & Camembert
- Limburger & Münster
- Taleggio

#### Käse — Frischkäse
- Mozzarella (Kuh, Büffel)
- Ricotta
- Frischkäse (Doppelrahm, Kräuter, Natur)
- Mascarpone
- Feta (Salzlakenkäse)
- Hirtenkäse & Halloumi
- Burrata

#### Käse — Schimmelkäse
- Blauschimmel: Roquefort, Gorgonzola, Bleu d'Auvergne
- Weißschimmel: Brie de Meaux, Camembert Normandie

#### Butter & Milchfette
- Butter (gesüßt, gesäuert, ungesalzen)
- Ghee & Butterschmalz
- Halbfettbutter

---

### 🥚 EIER

- Hühnerei (roh, hartgekocht)
- Hühnerei Eigelb
- Hühnerei Eiweiß
- Putenei
- Wachtelei & Entenei
- Eiprodukte (Pulver, flüssig pasteurisiert)

---

### 🌾 GETREIDE, BROT & PASTA

#### Brot
- Vollkornbrot (Roggenvollkorn, Dinkelvollkorn)
- Roggenmischbrot & Sauerteigbrot
- Weißbrot & Toastbrot
- Brötchen & Semmeln
- Knäckebrot & Crispbread
- Mehrkornbrot

#### Rohe Körner, Flocken & Pseudogetreide
- Haferflocken & Hafer (ganz)
- Weizen (ganz, Bulgur, Grieß)
- Dinkel & Emmer
- Roggen & Gerste (ganz, Graupen)
- Buchweizen
- Quinoa
- Reis (weiß, Vollkorn, Basmati, Jasmin, Parboiled)
- Hirse & Amaranth
- Mais (ganz, Mehl, Polenta)
- Teff

#### Mehl & Stärke
- Weizenmehl (Typ 405, 550, 812, 1050)
- Vollkornmehl (Weizen, Dinkel, Roggen)
- Reismehl & Maismehl
- Kartoffelstärke & Tapioka
- Speisestärke
- Glutenfreies Mehl

#### Pasta & Teigwaren
- Normale Pasta (Spaghetti, Penne, Fusilli, etc.)
- Vollkornpasta
- Eiernudeln
- Glasnudeln & Reisnudeln
- Gnocchi & Spätzle (roh)
- Gefüllte Pasta (Tortellini, Ravioli — roh/getrocknet)

#### Backwaren & Gebäck (Snack-Kategorie)
- Kekse & Plätzchen
- Lebkuchen & Weihnachtsgebäck
- Croissants & Blätterteig
- Kuchen & Hefeteilchen (Bäckerei)
- Zwieback & Knäckebrot

---

### 🥦 GEMÜSE

#### Blattgemüse & Salate
- Spinat & Mangold
- Grünkohl & Wirsing
- Blattsalate (Rucola, Feldsalat, Kopfsalat, Eisberg, Lollo)
- Radicchio & Chicorée & Endivie
- Pak Choi & Chinakohl
- Rucola

#### Kreuzblütler (Brassica)
- Brokkoli
- Blumenkohl
- Weißkohl & Rotkohl & Savoyerkohl
- Rosenkohl
- Kohlrabi
- Grünkohl

#### Fruchtgemüse
- Tomaten (Fleischtomaten, Kirschtomaten, Rispentomaten)
- Paprika (rot, gelb, grün, orange)
- Zucchini & Kürbis
- Aubergine
- Gurke
- Avocado
- Artischocke

#### Wurzel- & Knollengemüse
- Karotten & Möhren (roh, gekocht)
- Rote Bete
- Pastinaken & Petersilienwurzel
- Knollensellerie
- Radieschen & Rettich
- Meerrettich
- Schwarzwurzel

#### Zwiebeln & Lauch
- Zwiebeln (weiß, gelb, rot)
- Frühlingszwiebeln
- Knoblauch
- Schalotten
- Lauch/Porree
- Schnittlauch (→ eher Kräuter)

#### Pilze
- Champignons (weiß, braun)
- Steinpilze & Pfifferlinge
- Austernpilze & Shiitake
- Kräuterseitlinge
- Trüffel
- Getrocknete Pilze

#### Kartoffeln
- Kartoffeln (roh)
- Kartoffeln (gekocht, gedämpft)
- Süßkartoffeln
- Yams

#### Spargel & Artischocken
- Weißer Spargel
- Grüner Spargel
- Artischocken

#### Sprossen & Keimlinge
- Alfalfasprossen
- Mungbohnensprossen
- Linsensprossen
- Radieschensprossen

---

### 🍎 OBST

#### Beerenfrüchte
- Erdbeeren
- Himbeeren
- Brombeeren
- Blaubeeren & Heidelbeeren
- Johannisbeeren (rot, schwarz, weiß)
- Stachelbeeren
- Cranberries & Preiselbeeren
- Goji-Beeren

#### Kernobst
- Äpfel (diverse Sorten)
- Birnen

#### Steinobst
- Kirschen (süß, sauer)
- Pfirsiche & Nektarinen
- Pflaumen & Zwetschgen
- Aprikosen & Mirabellen
- Sauerkirschen

#### Zitrusfrüchte
- Orangen & Mandarinen
- Clementinen & Satsumas
- Grapefruit & Pampelmuse
- Zitronen & Limetten
- Blutorangen

#### Exotisches & Tropisches Obst
- Bananen & Kochbananen
- Mango
- Papaya
- Ananas
- Kiwi (grün, gelb)
- Granatapfel
- Feigen (frisch)
- Litschi & Rambutan
- Jackfrucht
- Drachenfrucht

#### Melonen
- Wassermelone
- Honigmelone & Galiamelone
- Cantaloupmelone

#### Trockenfrüchte
- Rosinen & Sultaninen
- Getrocknete Aprikosen
- Datteln (getrocknet)
- Getrocknete Pflaumen/Backpflaumen
- Feigen (getrocknet)
- Cranberries getrocknet (oft gezuckert)

---

### 🫘 HÜLSENFRÜCHTE, NÜSSE & SAMEN

#### Hülsenfrüchte
- Linsen (rote, grüne, schwarze, Beluga, Puy)
- Kichererbsen
- Schwarze Bohnen
- Kidneybohnen
- Weiße Bohnen (Cannellini, Navy)
- Erbsen (grün, gelb, getrocknet)
- Edamame & Sojabohnen (frisch/gefroren)
- Dicke Bohnen/Ackerbohnen
- Mungbohnen

#### Sojaprodukte
- Tofu (fest, Seide, geräuchert)
- Tempeh
- Seitan (Weizengluten — Achtung: Gluten!)
- Sojamilch & Sojakefir
- Sojaprotein isoliert/texturiert (TVP)
- Miso

#### Nüsse
- Walnüsse
- Mandeln (roh, geröstet, blanchiert)
- Haselnüsse
- Cashewnüsse
- Paranüsse
- Pistazien
- Macadamia
- Pekannüsse
- Kokosnuss (frisch, geraspelt, Kokosmehl)

#### Erdnüsse & Erdnussprodukte
- Erdnüsse (roh, geröstet, gesalzen)
- Erdnussbutter (creamy, crunchy)

#### Samen & Kerne
- Kürbiskerne
- Sonnenblumenkerne
- Leinsamen (ganz, geschrotet)
- Chiasamen
- Hanfsamen
- Sesam (weiß, schwarz)
- Mohn
- Flohsamenschalen

#### Nussmuse & Saaten-Pasten
- Mandelmus
- Tahini (Sesammus)
- Cashewmus
- Sonnenblumenkernmus

---

### 🫒 FETTE & ÖLE

#### Pflanzliche Öle
- Olivenöl (nativ extra, raffiniert)
- Rapsöl (kalt gepresst, raffiniert)
- Kokosöl (nativ, raffiniert/Kokosfett)
- Leinöl
- Hanföl
- Walnussöl & Haselnussöl
- Avocadoöl
- Sesamöl
- Sonnenblumenöl & Distelöl
- Kürbiskernöl

#### Tierische Fette
- Butter (gesüßt, gesäuert, Rohmilch)
- Ghee / Butterschmalz
- Schweineschmalz
- Gänseschmalz & Entenschmalz
- Rindertalg
- Fischöl & Lebertran (Supplement → Nutrition übernimmt)

#### Margarine & Streichfette
- Pflanzenmargarine
- Halbfettbutter & Halbfettmargarine
- Pflanzliche Butteralternativen

---

### 🍬 SÜSSES & SNACKS

#### Schokolade & Kakao
- Dunkle Schokolade (≥70% Kakao)
- Dunkle Schokolade (50–70%)
- Vollmilchschokolade
- Weiße Schokolade
- Kakaopulver (ungesüßt)
- Kakaobutter & Kakao-Nibs
- Schokoladenriegel (gefüllt, Nuss-Nougat)

#### Zucker & Süßungsmittel
- Weißzucker & Rohzucker
- Puderzucker
- Honig (Blütenhonig, Waldhonig)
- Agavensirup & Ahornsirup
- Kokosblütenzucker
- Erythrit & Xylit
- Stevia (natürlich)
- Kunstsüßstoffe (Aspartam, Saccharin)

#### Eis & Süßspeisen
- Speiseeis (Sahneeis, Fruchteis, Sorbet)
- Pudding & Wackelpudding
- Mousse & Creme

#### Chips & Salzgebäck
- Kartoffelchips & Stapelchips
- Popcorn (gesalzen, süß)
- Salzgebäck, Brezeln, Cracker
- Reiswaffeln & Maiswaffeln

#### Süßigkeiten & Confiserie
- Gummibärchen & Fruchtgummi
- Bonbons & Lollies
- Marzipan & Nougat
- Marshmallows

---

### 🥤 GETRÄNKE

#### Wasser
- Stilles Mineralwasser
- Sprudelwasser
- Trinkwasser

#### Kaffee & Tee
- Kaffee (Espresso, Filterkaffee, Instantkaffee)
- Cappuccino & Kaffeezubereitungen (mit Milch/Zucker)
- Schwarztee & Grüntee
- Kräutertee & Früchtetee
- Matcha

#### Fruchtsäfte & Smoothies
- Orangensaft, Apfelsaft, Traubensaft
- Gemüsesäfte (Tomatensaft, Karottensaft)
- Smoothies

#### Softdrinks & Limonaden
- Cola & Energy Drinks
- Limonaden (Zitrone, Orange)
- Eistee gesüßt
- Zuckerfreie Varianten (Diet Coke etc.)

#### Sportgetränke & Isotonische
- Isotonische Getränke
- Elektrolyt-Drinks
- Sportgetränke (mit Kohlenhydraten)

#### Alkoholische Getränke
- Bier (hell, dunkel, alkoholfrei)
- Wein (Rot, Weiß, Rosé, Schaumwein)
- Spirituosen (Vodka, Whisky, Rum, Gin)
- Cider & Obstwein
- Liköre

---

### 🍽️ FERTIGGERICHTE & ZUBEREITUNGEN

#### Brühen & Suppen
- Fleischbrühen & Consommé (Rind, Huhn, Wild)
- Gemüsebrühe
- Fischbrühe
- Fertigsuppen (Tomatensuppe, Linsensuppe)

#### Fleischgerichte (zubereitet)
- Braten & Schmorgerichte (zubereitet)
- Kurzgebratenes (Steak, Kotelett — zubereitet)
- Hackfleischgerichte (Frikadellen, Bouletten)
- Fast Food (Burger, Nuggets, Döner)

#### Fischgerichte (zubereitet)
- Gebratener/gegrillter Fisch
- Fischstäbchen & Panade
- Sushi & Sashimi

#### Eier-Zubereitungen
- Rührei, Spiegelei, Omelette
- Hartgekochte Eier (→ wird in Eier Rohwaren auch erfasst)
- Quiche & Soufflé

#### Vegetarisch/Vegan (zubereitet)
- Gemüsegerichte (zubereitet)
- Tofu-Gerichte
- Vegane Fleischersatzprodukte

#### Pasta & Getreidegerichte (zubereitet)
- Nudeln mit Sauce (zubereitet)
- Risotto & Reisgerichte (zubereitet)
- Spätzle (zubereitet)

#### Desserts (zubereitet)
- Milchdesserts & Crème brûlée
- Mehlspeisen (Apfelstrudel, Palatschinken)
- Torten & Kuchen (Bäckerei/Konditorei)

#### Tiefkühlprodukte
- TK-Gemüse
- TK-Fisch & -Meeresfrüchte
- TK-Fertiggerichte (Pizza, Lasagne)

---

### 🧂 WÜRZMITTEL & GEWÜRZE

#### Gewürze & Kräuter
- Trockene Gewürze (Pfeffer, Paprika, Kurkuma, etc.)
- Kräuter getrocknet (Oregano, Thymian, Basilikum)
- Kräuter frisch (→ eher unter Gemüse, Unterkategorie Kräuter)
- Gewürzmischungen

#### Saucen, Dips & Marinaden
- Tomatenprodukte (Ketchup, Tomatenmark, Passata)
- Mayonnaise & Aioli
- Senf (mittelscharf, Dijon, süß)
- Sojasoße & Tamari
- Worcestershire & Fischsoße
- BBQ-Sauce & Grillmarinaden
- Salatdressings

#### Essig
- Apfelessig
- Balsamico
- Weißweinessig & Rotweinessig

#### Salze
- Speisesalz & Meersalz
- Jodsalz
- Kräutersalze

---

---

## Semantic Tags — Vollständiger Profi-Katalog

---

### A. Ingredient Tags (was das Food ist)

| Code | Name DE | BLS-Basis |
|---|---|---|
| `pork` | Schweinefleisch | U5xxxx, U6xxxx, V5xxxx (Schwein), W (Name) |
| `beef` | Rindfleisch | U0xxxx(Rind), U1xxxx, U2xxxx |
| `veal` | Kalbfleisch | U3xxxx, U4xxxx |
| `lamb` | Lamm | U7xxxx, U8xxxx (Lamm/Hammel) |
| `mutton` | Hammelfleisch | U7xxxx, U8xxxx (Hammel) |
| `poultry` | Geflügel | V4xxxx |
| `chicken` | Hähnchen/Hühnerfleisch | V4x4xxx |
| `turkey` | Pute/Truthahn | V4x8xxx |
| `duck` | Ente | V4x5xxx |
| `goose` | Gans | V4x6xxx |
| `game_meat` | Wild | V2xxxx (Hirsch, Wildschwein, Reh) |
| `rabbit` | Kaninchen & Hase | V1xxxx, V2xxxx |
| `wild_poultry` | Wildgeflügel | V3xxxx |
| `offal` | Innereien | V5xxxx, V6xxxx |
| `liver` | Leber | V5x3xxx, V6x3xxx |
| `kidney` | Niere | V5x4xxx |
| `heart` | Herz | V5x1xxx, V6x1xxx |
| `brain` | Gehirn | V5x2xxx |
| `lung` | Lunge | V5x4xxx |
| `processed_meat` | Wurstwaren | W |
| `fish` | Fisch | T (Seefisch + Süßwasser) |
| `fatty_fish` | Fetter Fisch | T (Lachs, Hering, Makrele, Thunfisch) |
| `lean_fish` | Magerer Fisch | T (Kabeljau, Seelachs, Scholle) |
| `shellfish` | Schalentiere | T7xxxx (Garnele, Hummer) |
| `molluscs` | Weichtiere | T7xxxx (Muscheln, Austern, Tintenfisch) |
| `dairy` | Milchprodukt | M |
| `cheese` | Käse | M0xxxx–M5xxxx |
| `hard_cheese` | Hartkäse | M (Parmesan, Emmentaler) |
| `soft_cheese` | Weichkäse | M (Brie, Camembert) |
| `fresh_cheese` | Frischkäse | M (Mozzarella, Ricotta, Quark) |
| `blue_cheese` | Schimmelkäse | M (Roquefort, Gorgonzola) |
| `yogurt` | Joghurt & Quark | M14xxxx |
| `egg` | Ei | E111xxx |
| `soy` | Sojaprodukt | H (Tofu, Tempeh, Sojaprotein) |
| `nuts` | Nüsse | H (Walnuss, Mandel, Cashew, etc.) |
| `peanuts` | Erdnüsse | H110xxx |
| `seeds` | Samen & Kerne | H (Kürbis, Sonnenblume, Sesam, Lein, Chia) |
| `legumes` | Hülsenfrüchte | H (Linsen, Kichererbsen, Bohnen) |
| `gluten_grain` | Glutenhaltiges Getreide | B, C (Weizen, Roggen, Gerste, Hafer, Dinkel) |
| `whole_grain` | Vollkorn | B (Vollkornbrot), C (ganze Körner) |
| `refined_grain` | Auszugsmehl/weiß | B (Weißbrot), C (Weißmehl) |
| `potato` | Kartoffel | K110xxx |
| `vegetable` | Gemüse | G |
| `leafy_greens` | Blattgemüse | G (Spinat, Salate, Grünkohl) |
| `cruciferous` | Kreuzblütler | G (Brokkoli, Blumenkohl, Kohl) |
| `fruit` | Obst | F |
| `berries` | Beeren | F3xxxx |
| `citrus` | Zitrusfrüchte | F (Orangen, Zitronen, Grapefruit) |
| `tropical_fruit` | Tropisches Obst | F (Banane, Mango, Ananas) |
| `dried_fruit` | Trockenfrüchte | F (Rosinen, Datteln, Aprikosen getr.) |
| `cooking_fat` | Speisefett/-öl | Q |
| `olive_oil` | Olivenöl | Q (Olivenöl) |
| `coconut` | Kokos | Q, H (Kokosöl, Kokosfleisch, -milch) |
| `sugar` | Zucker & Süßungsmittel | S111xxx–S119xxx |
| `honey` | Honig | S120xxx–S122xxx |
| `alcohol` | Alkohol | P |
| `mushroom` | Pilze | G (Champignon, Steinpilz, etc.) |
| `seaweed` | Meeresalgen | — (Custom Foods / nicht in BLS) |
| `fermented_food` | Fermentiertes Lebensmittel | M (Joghurt, Käse, Kefir), R (Essig) |

---

### B. Diet Tags

| Code | Name DE | Formel / Bedingung |
|---|---|---|
| `vegetarian` | Vegetarisch | NOT (pork\|beef\|veal\|lamb\|mutton\|poultry\|chicken\|turkey\|duck\|goose\|game_meat\|rabbit\|wild_poultry\|offal\|processed_meat\|fish\|fatty_fish\|lean_fish\|shellfish\|molluscs) |
| `vegan` | Vegan | vegetarian AND NOT (dairy\|cheese\|yogurt\|egg) |
| `pescatarian` | Pescatarisch | vegetarian OR fish\|shellfish\|molluscs (kein Fleisch, aber Fisch ok) |
| `keto_strict` | Keto (strikt) | CHO ≤ 2g/100g |
| `keto_moderate` | Keto-geeignet | CHO ≤ 5g/100g |
| `low_carb` | Low-Carb | CHO ≤ 10g/100g |
| `very_low_carb` | Sehr Low-Carb | CHO ≤ 5g/100g (alias für keto_moderate) |
| `paleo` | Paleo-kompatibel | NOT (gluten_grain\|dairy\|legumes\|processed_meat\|sugar) |
| `carnivore` | Carnivore | beef\|pork\|poultry\|fish\|egg (nur tierische Produkte) |
| `mediterranean` | Mediterrane Ernährung | fish\|olive_oil\|vegetable\|legumes\|whole_grain |
| `low_fat` | Fettarm | FAT ≤ 3g/100g |
| `high_fiber` | Ballaststoffreich | FIBT ≥ 6g/100g |
| `sugar_free` | Zuckerarm/Zuckerfrei | SUGAR ≤ 0.5g/100g |
| `low_sodium` | Natriumarm | NA ≤ 120mg/100g |
| `gluten_free` | Glutenfrei | NOT gluten_grain (Vorsicht: Kontamination) |
| `lactose_free` | Laktosefrei | NOT dairy (oder explizit als laktosefrei markiert) |
| `whole_food` | Vollwertig | processing_level = 'raw' oder 'minimally_processed' |

---

### C. Allergen Tags (EU 14 Pflichtallergene)

| Code | Name DE | Name EN | Basis |
|---|---|---|---|
| `allergen_gluten` | Glutenhaltiges Getreide | Cereals w/ gluten | gluten_grain tag |
| `allergen_crustaceans` | Krebstiere | Crustaceans | shellfish tag |
| `allergen_eggs` | Eier | Eggs | egg tag |
| `allergen_fish` | Fisch | Fish | fish\|fatty_fish\|lean_fish |
| `allergen_peanuts` | Erdnüsse | Peanuts | peanuts tag |
| `allergen_soy` | Soja | Soybeans | soy tag |
| `allergen_milk` | Milch | Milk | dairy\|cheese\|yogurt |
| `allergen_nuts` | Schalenfrüchte | Tree nuts | nuts tag (Walnuss, Mandel, Haselnuss, Cashew, Pekan, Paranuss, Pistazie, Macadamia) |
| `allergen_celery` | Sellerie | Celery | G (Sellerie-Foods) |
| `allergen_mustard` | Senf | Mustard | R (Senf-Foods) |
| `allergen_sesame` | Sesam | Sesame | seeds (Sesam-Foods) |
| `allergen_sulphites` | Sulfite/SO₂ | Sulphur dioxide | P (Wein, Trockenfrüchte) |
| `allergen_lupin` | Lupinen | Lupin | H (Lupinen-Mehl) |
| `allergen_molluscs` | Weichtiere | Molluscs | molluscs tag |

---

### D. Fitness Tags — Nährstoffbasiert (deterministisch, aus BLS-Werten)

#### Protein
| Code | Name DE | Formel |
|---|---|---|
| `high_protein` | Proteinreich | PROT625 ≥ 20g/100g |
| `very_high_protein` | Sehr proteinreich | PROT625 ≥ 30g/100g |
| `lean_protein` | Mageres Protein | PROT625 ≥ 20g/100g AND FAT ≤ 5g/100g |
| `complete_protein` | Vollständiges Protein | alle 9 essent. AS vorhanden (aus food_nutrients: ILE+LEU+LYS+MET+PHE+THR+TRP+VAL+HIS alle >0) |
| `leucine_rich` | Leucinreich (mTOR) | LEU ≥ 2.0g/100g |
| `bcaa_rich` | BCAA-reich | ILE+LEU+VAL ≥ 3.5g/100g |
| `high_leucine_ratio` | Hoher Leucin-Anteil | LEU / PROT625 ≥ 0.08 (>8% des Proteins) |
| `slow_protein` | Langsam verdaulich | cheese tag (Casein-Quelle) |
| `fast_protein` | Schnell verdaulich | whey-Quellen (nicht direkt aus BLS, Annotation) |

#### Kohlenhydrate
| Code | Name DE | Formel |
|---|---|---|
| `high_carb` | Kohlenhydratreich | CHO ≥ 50g/100g |
| `complex_carbs` | Komplexe KH (Stärke) | STARCH / CHO ≥ 0.5 |
| `fast_carbs` | Schnelle KH (Zucker) | SUGAR / CHO ≥ 0.7 |
| `low_glycemic` | Niedrig-glykämisch | complex_carbs AND high_fiber (Näherung) |
| `resistant_starch_source` | Resistente Stärke | Gekochte+gekühlte Kartoffeln, unreife Bananen (Annotation) |
| `high_fiber` | Ballaststoffreich | FIBT ≥ 6g/100g |
| `very_high_fiber` | Sehr ballaststoffreich | FIBT ≥ 10g/100g |

#### Fette
| Code | Name DE | Formel |
|---|---|---|
| `omega3_rich` | Omega-3-reich | FAPUN3 ≥ 1g/100g |
| `high_omega3` | Sehr omega-3-reich | FAPUN3 ≥ 2g/100g |
| `epa_dha_source` | EPA & DHA Quelle | F20:5CN3 + F22:6CN3 ≥ 0.5g/100g |
| `favorable_omega_ratio` | Gutes Omega-3/6-Verhältnis | FAPUN3/FAPUN6 ≥ 0.3 |
| `low_sat_fat` | Wenig gesättigte FS | FASAT ≤ 2g/100g |
| `high_sat_fat` | Reich an gesättigten FS | FASAT ≥ 10g/100g |
| `mct_rich` | MCT-reich | Kokosöl (Annotation — C8:0+C10:0 Fettsäuren hoch) |
| `cholesterol_free` | Cholesterinfrei | CHORL = 0 (logisch Null — pflanzlich) |

#### Mikronährstoffe (für Athleten relevant)
| Code | Name DE | Formel |
|---|---|---|
| `iron_rich` | Eisenreich | FE ≥ 3mg/100g |
| `high_iron` | Sehr eisenreich | FE ≥ 8mg/100g |
| `heme_iron` | Häm-Eisen (besser bioverfügbar) | beef\|pork\|poultry\|fish (Häm-Eisen = aus Tier) |
| `magnesium_rich` | Magnesiumreich | MG ≥ 50mg/100g |
| `high_magnesium` | Sehr magnesiumreich | MG ≥ 100mg/100g |
| `zinc_rich` | Zinkreich | ZN ≥ 2mg/100g |
| `high_zinc` | Sehr zinkreich | ZN ≥ 5mg/100g |
| `calcium_rich` | Calciumreich | CA ≥ 200mg/100g |
| `potassium_rich` | Kaliumreich | K ≥ 400mg/100g |
| `phosphorus_rich` | Phosphorreich | P ≥ 200mg/100g |
| `vitamin_d_source` | Vitamin-D-Quelle | VITD ≥ 2μg/100g |
| `high_vitamin_d` | Gute Vitamin-D-Quelle | VITD ≥ 5μg/100g |
| `vitamin_b12_source` | B12-Quelle | VITB12 ≥ 1μg/100g |
| `high_b12` | Sehr gute B12-Quelle | VITB12 ≥ 3μg/100g |
| `folate_rich` | Folatreich | FOL ≥ 50μg/100g |
| `vitamin_c_rich` | Vitamin-C-reich | VITC ≥ 30mg/100g |
| `antioxidant_rich` | Antioxidantienreich | vitamin_c_rich OR vitamin_e_rich (Näherung) |
| `creatine_source` | Kreatin-Quelle (natürlich) | beef\|pork\|fish (annotation — Kreatin in Muskeln) |
| `carnitine_source` | L-Carnitin-Quelle | beef\|lamb (höchster natürl. Gehalt) |
| `choline_rich` | Cholinreich | egg (Eigelb), liver (Leber) — annotation |
| `iodine_source` | Jodquelle | FD\|ID ≥ 15μg/100g OR fish\|dairy |
| `selenium_source` | Selenquelle | SE ≥ 10μg/100g |

#### Energieprofil
| Code | Name DE | Formel |
|---|---|---|
| `calorie_dense` | Kalorienreich | ENERCC ≥ 400 kcal/100g |
| `very_calorie_dense` | Sehr kalorienreich | ENERCC ≥ 600 kcal/100g |
| `low_calorie` | Kalorienarm | ENERCC ≤ 100 kcal/100g |
| `very_low_calorie` | Sehr kalorienarm | ENERCC ≤ 50 kcal/100g |
| `high_satiety` | Hohe Sättigungswirkung | (PROT625 ≥ 15g OR FIBT ≥ 5g) AND ENERCC ≤ 200 kcal/100g |

---

### E. Gym / Use-Case Tags (Professionell)

#### Training-Timing
| Code | Name DE | Beschreibung | Basis |
|---|---|---|---|
| `pre_workout_carbs` | Pre-Workout (KH) | Schnelle KH-Energie 60–90min vorher | fast_carbs\|high_carb + low_fat |
| `pre_workout_balanced` | Pre-Workout (KH+Protein) | KH + moderate Protein 2–3h vorher | high_carb + high_protein |
| `intra_workout` | Intra-Workout | Schnelle Energie während Training | fast_carbs + low_fat + low_fiber |
| `post_workout_protein` | Post-Workout (Protein) | Schnelles Protein für Regeneration | high_protein + fast_protein |
| `post_workout_recovery` | Post-Workout (Recovery) | Protein + KH für Glykogens-Auffüllung | high_protein + high_carb |
| `pre_sleep_protein` | Pre-Sleep Protein | Langsam verdauliches Protein vor Schlaf | slow_protein (Casein) |
| `morning_fast_break` | Fastenbrechen (morgens) | Optimale erste Mahlzeit | high_protein + moderate_carb |

#### Ziel-basierte Tags
| Code | Name DE | Beschreibung | Basis |
|---|---|---|---|
| `muscle_building` | Muskelaufbau | Protein-Qualität & Leucin für Muskelproteinsynthese | very_high_protein + complete_protein + leucine_rich |
| `anti_catabolic` | Anti-katabol | Muskelschutz bei Kaloriendefizit | leucine_rich + complete_protein + bcaa_rich |
| `cutting_phase` | Cutting-Phase | Kalorienarm, hohe Sättigung, Protein-erhalt | high_satiety + lean_protein OR low_calorie+high_protein |
| `bulking_phase` | Bulking-Phase | Kalorienreich + Protein | calorie_dense + high_protein |
| `lean_bulk` | Lean Bulk | Kaloriendicht aber clean | calorie_dense + high_protein + whole_food |
| `recomp` | Body Recomposition | Hohe Protein-Dichte, moderate Kalorien | high_protein + low_calorie (high satiety protein) |
| `endurance_fuel` | Ausdauer-Energie | Komplexe KH für Langzeitenergie | complex_carbs + high_carb + low_fat |
| `glycogen_replenishment` | Glykogen-Auffüllung | Schnelle KH post-Ausdauer | fast_carbs + high_carb |
| `contest_prep` | Wettkampfvorbereitung | Extrem lean, Wasserretention beachten | very_high_protein + very_low_carb + low_fat |
| `powerlifting_bulk` | Powerlifting Bulk | Kraftaufbau mit Masse | calorie_dense + high_protein + high_carb |

#### Spezialist-Tags
| Code | Name DE | Beschreibung | Basis |
|---|---|---|---|
| `hormone_support` | Hormonunterstützung | Zink+VitD für Testosteron-Synthese | zinc_rich + vitamin_d_source |
| `testosterone_support` | Testosteron-Unterstützung | Cholesterin + Zink (Testosteron-Vorstufen) | zinc_rich + beef\|egg |
| `cortisol_management` | Cortisol-Kontrolle | Omega-3 anti-inflammatorisch | omega3_rich + epa_dha_source |
| `insulin_sensitivity` | Insulinsensitivität | Low-GI + hohe Ballaststoffe | low_glycemic + high_fiber |
| `inflammation_reducer` | Anti-inflammatorisch | EPA+DHA für Entzündungsreduktion | epa_dha_source + omega3_rich |
| `recovery_nutrients` | Regenerations-Nährstoffe | Magnesium + Zink + Protein | magnesium_rich + zinc_rich + high_protein |
| `gut_health` | Darmgesundheit | Probiotisch + Ballaststoffe | fermented_food\|high_fiber |
| `bone_density` | Knochengesundheit | Calcium + Vitamin D | calcium_rich + vitamin_d_source |
| `liver_support` | Lebergesundheit | Cholin-reich (Phospholipide) | choline_rich (Eigelb, Leber) |
| `blood_formation` | Blutbildung | Eisen + B12 + Folat | iron_rich + vitamin_b12_source + folate_rich |
| `electrolyte_source` | Elektrolytquelle | Na + K + Mg + Ca für Nerven/Muskel | potassium_rich\|magnesium_rich |
| `connective_tissue` | Bindegewebeunterstützung | Kollagen-Vorstufen (Glycin, Prolin) | offal\|bone_broth (Annotation) |
| `cognitive_function` | Kognitive Unterstützung | Omega-3 + Cholin für Gehirn | epa_dha_source + choline_rich |

---

### F. Processing Tags

| Code | Name DE | Beschreibung |
|---|---|---|
| `raw` | Roh | Unverarbeitet, roh |
| `minimally_processed` | Minimal verarbeitet | Getrocknet, gefroren, fermentiert ohne Zusätze |
| `fermented` | Fermentiert | Joghurt, Käse, Kefir, Sauerkraut, Miso |
| `smoked` | Geräuchert | Räucherverfahren (Lachs, Schinken, Käse) |
| `dried` | Getrocknet | Trockenprodukte (Früchte, Pilze, Fleisch) |
| `cooked` | Gegart | Erhitzt (gekocht, gebraten, gebacken) |
| `canned` | Konserve | Konserviert in Dose/Glas |
| `processed` | Verarbeitet | Industriell verarbeitet mit Zusatzstoffen |
| `ultra_processed` | Hochverarbeitet | NOVA Gruppe 4 — Fertigprodukte, Chips, Wurst |
| `fortified` | Angereichert | Mit Vitaminen/Mineralstoffen angereichert |
| `organic` | Bio | Biologischer Anbau (Annotation — nicht aus BLS) |

---

## Canonical Names — Generierungsstrategie

### Phase 1: Regelbasierte Bereinigung
Einfache Kategorien (Gemüse G, Obst F, Getreide C):
- "Erdbeere roh" → "Erdbeere"
- "Hafer Flocken" → "Haferflocken"
- "Brokkoli roh" → "Brokkoli"

### Phase 2: AI-Batch (Claude API, einmalig für alle 7.140)
Komplexe Kategorien (Fleisch U/V, Wurstwaren W, Fertiggerichte X/Y):
- Input: BLS Name + BLS Code + Kategorie-Kontext
- Output: name_display (kurz, klar, deutsch), name_display_en
- Beispiel-Prompt: "Gib einen kurzen, benutzerfreundlichen deutschen Namen für: 'Schwein Fettwamme, ohne Schwarten, geringer Magerfleischanteil (S XI) roh'"
- Expected Output: "Schweinebauch (roh)"

### Phase 3: Editorial Review
- Spot-Check 10% der AI-generierten Namen
- Korrekturen für bekannte Probleme
- Admin-Interface für Einzel-Korrekturen

---

## Canonical Name Beispiele (komplett)

| BLS Code | BLS Original | name_display (DE) | name_display_en |
|---|---|---|---|
| E111100 | Hühnerei roh | Ei (roh) | Egg (raw) |
| E112100 | Hühnerei Eigelb, roh | Eigelb (roh) | Egg yolk (raw) |
| E113100 | Hühnerei Eiweiß, roh | Eiweiß (roh) | Egg white (raw) |
| V416100 | Hähnchen Brustfilet, roh | Hähnchenbrust (roh) | Chicken breast (raw) |
| V486100 | Pute Brust, ohne Haut, roh | Putenbrust (roh) | Turkey breast (raw) |
| T102100 | Hering roh | Hering | Herring |
| U010100 | Rind Hackfleisch, roh | Rinderhackfleisch (roh) | Ground beef (raw) |
| U333100 | Kalb Filetsteak, roh | Kalbsfilet (roh) | Veal filet (raw) |
| M111300 | Vollmilch frisch, 3,5% Fett, past. | Vollmilch (3,5% Fett) | Whole milk (3.5%) |
| M141300 | Joghurt mild, mind. 3,5% Fett | Naturjoghurt (3,5%) | Natural yogurt (3.5%) |
| M884000 | Magermilchpulver | Magermilchpulver | Skim milk powder |
| C133000 | Hafer Flocken | Haferflocken | Oat flakes |
| C352000 | Reis poliert, roh | Weißer Reis (roh) | White rice (raw) |
| F301100 | Erdbeere roh | Erdbeere | Strawberry |
| G541100 | Gemüsepaprika grün, roh | Paprika grün | Green bell pepper |
| H861000 | Tofu | Tofu | Tofu |
| W211200 | Wiener Würstchen | Wiener Würstchen | Frankfurter sausage |
| Y720163 | Rührei gebraten in Butter | Rührei (Butter) | Scrambled eggs (butter) |
| U505100 | Schwein Fettwamme... (S XI) roh | Schweinebauch (roh) | Pork belly (raw) |

---

## Search Aliases

```sql
nutrition.food_aliases (
  food_id   UUID FK → nutrition.foods
  alias     TEXT NOT NULL
  locale    TEXT DEFAULT 'de'
  source    TEXT DEFAULT 'editorial'  -- editorial | ai_generated | user
  PRIMARY KEY (food_id, alias, locale)
)
```

| food_id (name_display) | Aliases DE | Aliases EN |
|---|---|---|
| Hähnchenbrust (roh) | Hühnerbrust, Chicken Breast, Brustfilet | Chicken breast, Chicken filet |
| Haferflocken | Oats, Porridge, Hafer, Overnight Oats | Oatmeal, Rolled oats |
| Naturjoghurt | Joghurt, Yogurt, YO | Yogurt, Plain yogurt |
| Rinderhackfleisch | Hackfleisch, Mince, Bolognese, Beef |  Ground beef, Minced beef |
| Lachs | Lachsfilet, Atlantischer Lachs, Salmon | Salmon, Atlantic salmon |
| Volleier | Ei, Eier, Hühnerei | Egg, Eggs |
| Magerquark | Quark, Topfen, 0% Quark | Cottage cheese (Näherung) |
| Parmesan | Parmigiano Reggiano, Grana Padano | Parmesan |
| Avocado | Avocado, Avo, Butter Fruit | Avocado |
| Brokkoli | Broccoli, Brokoletti | Broccoli |

---

## Sort Weight System

### Konzept

`sort_weight` ist eine **statische Relevanz-Kennzahl** (0–1000) pro Food.
Sie wird **einmalig beim Import** berechnet und repräsentiert:
**Wie relevant ist dieses spezifische Food für einen LumeOS-User?**

Sie beeinflusst die Suchreihenfolge, wird aber durch Text-Relevanz dominiert.

### Suchformel (PostgreSQL)

```sql
ORDER BY
  -- Custom Foods immer zuerst
  CASE WHEN is_custom THEN 1 ELSE 0 END DESC,
  -- Text-Relevanz (60%) + Relevanz-Gewicht (40%)
  (similarity(name_display, $query) * 0.60)
  + (sort_weight / 1000.0 * 0.40)
DESC
```

### Konkrete Beispiele

**Suche "Hafer" — Erwartete Reihenfolge:**
```
sort_weight  Food
─────────────────────────────────────────────────
 950         Haferflocken                         ← GANZ OBEN
 780         Hafer ganzes Korn, roh
 720         Hafer Schrot
 680         Hafer Kleie
 650         Hafer Mehl
 600         Haferdrink ungesüßt
 520         Haferbrot / Haferbrötchen
 350         Hafer Grütze, gekocht (zubereitet)
 250         Haferflocken gesüßt, mit Milch (Babybrei)
 150         Milchsuppe gebunden mit Haferflocken
```

**Suche "Rind" — Erwartete Reihenfolge:**
```
sort_weight  Food
─────────────────────────────────────────────────
 920         Rind Hackfleisch, roh                ← GANZ OBEN
 890         Rind Filet/Lende, roh
 860         Rind Hüfte, roh
 840         Rind Oberschale (Roulade), roh
 820         Rind Gulasch (Bug), roh
 800         Rind Bug/Schulter, roh
 750         Rind Keule, roh
 700         Rind Muskelfleisch, roh
 600         Rindfleischbrühe Konserve
 350         Rind Leber, roh                      ← Innereien deutlich tiefer
 200         Rind Lunge, roh
 150         Rind Milz, roh
 100         Rind Blut, roh
 080         Rind Knochenmark, roh
 050         Rind Fettgewebe, intermuskulär
```

---

### Scoring-Regeln (deterministisch beim Import)

Basis-Score nach BLS-Kategorie:

| BLS Prefix | Kategorie | Basis |
|---|---|---|
| C | Getreide & Flocken | 700 |
| E (Eier) | Hühnereier | 750 |
| E (Pasta) | Teigwaren | 580 |
| F | Obst | 660 |
| G | Gemüse | 660 |
| H | Hülsenfrüchte, Nüsse | 650 |
| K | Kartoffeln | 550 |
| M | Milchprodukte | 660 |
| T | Fisch & Meeresfrüchte | 700 |
| U (Muskel) | Fleisch-Muskelfleisch | 780 |
| U (Fett) | Fleisch-Fettgewebe | 100 |
| V (Geflügel) | Hähnchen, Pute, etc. | 760 |
| V (Innereien) | Organe | 300 |
| W | Wurstwaren | 440 |
| B | Brot | 520 |
| D | Backwaren & Gebäck | 340 |
| Q | Fette & Öle | 460 |
| R | Würzmittel | 360 |
| S | Süßwaren & Zucker | 240 |
| N | Nichtalkoholische Getränke | 400 |
| P | Alkohol | 180 |
| X | Fertiggerichte | 200 |
| Y | Zubereitungen | 240 |

---

### Modifikatoren (addiert auf Basis-Score)

**Fitness-Relevanz (+):**
| Bedingung | Bonus |
|---|---|
| Core LumeOS Fitness Food (Hähnchenbrust, Haferflocken, Lachs, Eier, Quark…) | +200 |
| PROT625 ≥ 20g/100g | +80 |
| PROT625 ≥ 30g/100g | +120 zusätzlich |
| Lean Protein: PROT625 ≥ 20 AND FAT ≤ 5g | +50 |
| omega3_rich (FAPUN3 ≥ 1g) | +40 |
| high_fiber (FIBT ≥ 6g) | +30 |
| whole_food (raw + C/G/F/H/T category) | +60 |

**Verarbeitungsgrad (−):**
| Bedingung | Malus |
|---|---|
| processing_level = 'ultra_processed' | −250 |
| Fertiggericht (X/Y prefix) | −300 |
| Prepared/Cooked Variante eines Rohprodukts | −150 |
| Gesüßte Variante | −100 |
| Konserve (nicht Fischkonserve) | −80 |

**Fleisch-spezifisch (−):**
| Bedingung | Malus |
|---|---|
| offal tag (Innereien gesamt) | −400 |
| Leber (liver tag) | −380 (etwas weniger wegen Beliebtheit) |
| Herz, Niere | −400 |
| Gehirn, Lunge, Milz | −450 |
| Blut & Blutprodukte | −500 |
| Fettgewebe (name enthält "Fettgewebe") | −500 |
| Knochenmark | −450 |
| Schwarte & Kutteln | −430 |

**Sonstige (−):**
| Bedingung | Malus |
|---|---|
| Sehr spezifische Laborschnitte (S VII, S VIII, etc. im Namen) | −200 |
| Alkohol (P prefix) | −300 |
| Specialty/Luxus (Hummer, Kaviar, Trüffel) | +100 (selten, aber relevant) |

**Grenzen:**
```
sort_weight = CLAMP(basis + modifikatoren, 0, 1000)
```

---

### Core LumeOS Fitness Foods Liste (+200 Bonus)

Diese Foods sind für LumeOS-User am wichtigsten.
Liste wird beim Import als Seed-Daten hinterlegt:

**Protein-Quellen:**
- Hähnchen Brustfilet (V416100)
- Pute Brust, ohne Haut (V486100)
- Rind Hackfleisch (U010100)
- Rind Filet/Lende (U211100)
- Lachs (diverse T-Codes)
- Thunfisch roh & Konserve
- Hering roh
- Hühnerei roh (E111100)
- Hühnerei Eiweiß (E113100)
- Magerquark (M)
- Hüttenkäse/Cottage Cheese (M)
- Griechischer Joghurt (M)
- Skyr (M)
- Tofu fest (H861000)
- Linsen getrocknet

**Kohlenhydrat-Quellen:**
- Haferflocken (C133000)
- Reis weiß poliert (C352000)
- Süßkartoffel (K)
- Kartoffel roh (K110100)
- Banane (F)
- Vollkornbrot

**Fett-Quellen:**
- Mandeln (H)
- Walnüsse (H)
- Avocado (G)
- Olivenöl nativ extra (Q)

**Gemüse (Basis):**
- Brokkoli roh
- Spinat roh
- Paprika roh
- Tomate roh
- Karotten roh
- Süßkartoffel

---

### Custom Food Priorität

Custom Foods des Users werden **immer vor BLS Foods** angezeigt:

```sql
-- In der Search Query:
ORDER BY
  is_custom DESC,                              -- Custom Foods zuerst
  (similarity(name_display, $query) * 0.60)
  + (sort_weight / 1000.0 * 0.40) DESC        -- dann BLS nach Relevanz
```

Custom Foods bekommen `sort_weight = NULL` — der DB-Query behandelt
sie separat via `is_custom` Flag. Keine Tag-Zuordnung nötig.
