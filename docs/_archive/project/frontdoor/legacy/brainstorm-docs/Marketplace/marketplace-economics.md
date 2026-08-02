# Lumeos Marketplace Economics

**Date:** 2026-02-17
**Status:** Konzeptphase

---

## Kernprinzip: Visibility = Paid

Marketplace-Ranking ist nicht demokratisch. Wer investiert, wird gepusht. Wer nicht investiert, ist organisch sichtbar aber weiter unten.

---

## Ranking-Modell

```
Marketplace Visibility = f(Paid Boost + Performance + Relevanz)

┌─────────────────────────────────────────┐
│          MARKETPLACE FEED                │
├─────────────────────────────────────────┤
│  🔝 PROMOTED (Paid Boost)              │
│     Coach zahlt Push-Kosten             │
│     + akzeptiert höhere Marge           │
│     = Top-Platzierung                   │
├─────────────────────────────────────────┤
│  ⭐ TOP RATED (Performance)             │
│     Hohe Bewertungen + Verkäufe         │
│     = Organisch oben                    │
├─────────────────────────────────────────┤
│  📋 STANDARD (Organisch)               │
│     Basis-Marge, kein Boost             │
│     = Chronologisch / Kategorie         │
├─────────────────────────────────────────┤
│  🆕 NEW (Neue Einträge)                │
│     Anfangs-Visibility für neue Seller  │
│     = Discovery-Phase                   │
└─────────────────────────────────────────┘
```

---

## Paid Boost Mechanik

### Was der Seller zahlt

| Komponente | Beschreibung |
|------------|-------------|
| **Push-Kosten** | Direkter Betrag für Visibility (aus Wallet, Voucher oder Revenue) |
| **Höhere Marge** | Akzeptiert höhere Transaktionsgebühr auf Verkäufe |

### Beispiel: Coach will oben stehen

```
Standard-Coach:
  · Verkauft "12-Week Hypertrophy Program" für €49
  · Lumeos nimmt X% Marge
  · Organisches Ranking (Position ~30)

Promoted Coach:
  · Zahlt €Y/Woche Push-Kosten (aus Wallet)
  · Akzeptiert X+Z% Marge auf Verkäufe (höher als Standard)
  · Bekommt Top-Platzierung
  · Mehr Verkäufe → trotz höherer Marge mehr Netto-Einnahmen
```

**Der Coach rechnet:** "Ich zahle €Y Push + Z% mehr Marge, aber ich verkaufe 5× mehr. Lohnt sich." — Genau wie Google Ads, Amazon Sponsored, Instagram Promoted.

### Für alle Seller-Typen

| Seller | Was er promoted | Push-Kosten aus |
|--------|----------------|-----------------|
| **Coach** | Programme, Meal Plans, Stacks | Revenue-Wallet |
| **Supplement Brand** | Produkte, Bundles | Revenue-Wallet |
| **Gym** | Kurse, Memberships, Merchandise | Revenue-Wallet |
| **Content Creator** | Templates, Guides, AI Personas | Revenue-Wallet oder Voucher |

---

## Marge-Staffelung

```
Je mehr Visibility, desto höher die Marge:

Standard (organisch):     Basis-Marge (% TBD)
Promoted (Boost):         Basis + Premium-Aufschlag (% TBD)
Featured (Top-Spot):      Basis + Top-Aufschlag (% TBD)
Exclusive (Kategorie-Exklusiv): Verhandlungsbasis

+ Push-Kosten (fix pro Zeiteinheit, TBD):
  · Tages-Boost: €X
  · Wochen-Boost: €Y
  · Monats-Boost: €Z
  · Kategorie-Feature: €W
```

---

## Was im Marketplace verkauft wird

### Digitale Produkte (höchste Marge)

| Produkt | Typischer Preis | Seller |
|---------|----------------|--------|
| Training Programme (4-16 Wochen) | €19-79 | Coach, Creator |
| Meal Plans | €9-39 | Coach, Nutritionist |
| Supplement Stacks/Protocols | €5-19 | Coach, Brand |
| Recovery Protocols | €9-29 | Coach |
| Cross-Module Bundles | €29-99 | Coach, Lumeos |
| AI Coach Personas | €4.99/mo | Coach |
| Templates (Workout/Meal) | €2-9 | Creator |
| E-Books / Guides | €9-29 | Creator |

### Physische Produkte (B2B Fulfillment)

| Produkt | Typischer Preis | Seller |
|---------|----------------|--------|
| Supplements (Whey, Creatine, etc.) | €15-60 | Brand, Gym |
| Gym Merchandise (Shirts, Shaker) | €10-40 | Gym |
| Snacks, Drinks, Riegel | €2-5 | Gym |
| Equipment (Bands, Grips etc.) | €10-50 | Brand |

### Services

| Service | Typischer Preis | Seller |
|---------|----------------|--------|
| 1:1 Coaching Session | €30-100 | Coach |
| Program Review | €15-50 | Coach |
| Bloodwork Consultation | €50-150 | Coach/Medical |
| Gym Day Pass | €10-20 | Gym |
| Kurs/Class Booking | €5-15 | Gym |

---

## Revenue für Lumeos (pro Transaktion)

```
Jeder Marketplace-Verkauf:

  Buyer zahlt:     €49.00 (aus Wallet/Voucher)
  Lumeos nimmt:    €X.XX  (Basis-Marge)
  + Promoted:      €Y.YY  (Premium-Aufschlag falls Boost aktiv)
  + Push-Kosten:   separat (Wallet-Belastung des Sellers)
  Seller bekommt:  €49.00 - Marge (ins Revenue-Wallet)
  
  Prozentsätze TBD — aber: JEDER Verkauf generiert Revenue für Lumeos
```

---

## Warum Seller trotzdem kommen

```
Alternative für einen Coach OHNE Lumeos:
  · Instagram: €500/mo Ads, 2% Conversion, keine Integration
  · Eigene Website: €50/mo Hosting, SEO dauert Monate
  · Gumroad: 10% Fee, keine Fitness-Audience
  · = Zahlt viel, erreicht wenig

Mit Lumeos:
  · Audience ist DA (aktive Fitness-User mit Wallet-Guthaben)
  · Integration ist DA (Programm = live in der App)
  · Trust ist DA (Lumeos-verifiziert, Ratings, AI-Empfehlung)
  · Conversion ist HOCH (User hat Voucher zum Ausgeben)
  · = Zahlt Marge, aber verkauft 10×
```

---

## Cross-Referenz

- Wallet-Mechanik: → `system/wallet-and-monetization.md`
- Supplement-Kanäle: → `system/supplement-channels.md`
- Marketplace Modul: → `marketplace/lumeos-marketplace-strategy.md`

---

*Konzeptphase — Prozentsätze und Preise TBD. Stand: 2026-02-17*
