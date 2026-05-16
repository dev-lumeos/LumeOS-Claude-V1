# Marketplace Module — Frontend Components (Spec)
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Apps

| App | Port | Beschreibung |
|---|---|---|
| `apps/marketplace/` | 8503 | Vollständiges Marketplace-Frontend |
| `apps/app/modules/marketplace/` | Integriert | Eingebettete Kaufflows in User-App |

---

## Pages (Marketplace App)

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/` | Home (Discovery, Empfehlungen, Featured) |
| `browse/page.tsx` | `/browse` | Vollständiger Katalog mit Filtern |
| `products/[id]/page.tsx` | `/products/:id` | Produkt-Detail |
| `bundles/page.tsx` | `/bundles` | Bundle-Übersicht |
| `wallet/page.tsx` | `/wallet` | Wallet + Transaktionen |
| `purchases/page.tsx` | `/purchases` | Meine Käufe + Lizenzen |
| `creator/page.tsx` | `/creator` | Creator Dashboard (wenn Creator) |
| `creator/new/page.tsx` | `/creator/new` | Produkt erstellen |

---

## Storefront Components (10)

| Component | Beschreibung |
|---|---|
| `MarketplaceHome` | Discovery Page: Featured, Empfehlungen, Trending, Bundles |
| `ProductGrid` | Responsive Grid mit Filter-Sidebar |
| `ProductCard` | Kompakt: Bild, Titel, Creator, ⭐Rating, Preis, Status-Badges |
| `BundleCard` | Spezielle Karte: Komponenten sichtbar, Savings-Badge (€28 gespart) |
| `RecommendationSection` | Kontext-Sektion mit Titel + Horizontal Scroll |
| `FeaturedBanner` | Großes Hero-Banner für Featured Produkt |
| `SearchBar` | Volltextsuche mit AutoComplete + Quick-Filter-Chips |
| `FilterPanel` | Seitenleiste: Kategorie, Preis-Slider, Schwierigkeit, Goal, Rating |
| `SortDropdown` | Score / Preis / Rating / Neueste / Beliebteste |
| `PromotedBadge` | "Promoted" / "Bestseller" / "Neu" / "Gratis" Badges |

---

## Product Detail Components (8)

| Component | Beschreibung |
|---|---|
| `ProductDetailView` | Full-Page: Media + Info + Kauf + Reviews + Similar |
| `ProductHeader` | Titel, Creator-Card, Rating, Preis, Kauf-Button |
| `ProductMediaGallery` | Bilder-Carousel + Preview-Video |
| `BundleComponentList` | Alle Bundle-Inhalte + "Ersparnis: €28 (36%)" Callout |
| `ProductInfoGrid` | Schwierigkeit, Dauer, Equipment, Goal Tags |
| `ReviewSection` | Ø-Rating, Verteilungs-Balken, Review-Liste |
| `ReviewCard` | Einzelne Bewertung + Helpful Vote + Creator Response |
| `SimilarProductsRow` | Horizontal Scroll: ähnliche Produkte |

---

## Checkout Components (5)

| Component | Beschreibung |
|---|---|
| `CheckoutModal` | Vollständiger Kauf-Flow als Modal |
| `WalletBalanceBar` | Aktueller Saldo + "ausreichend ✅" / "zu niedrig ⚠️" |
| `InsufficientFundsWarning` | "Fehlen: €14.50 — Jetzt aufladen?" |
| `OrderConfirmationScreen` | "Kauf erfolgreich!" + Delivery-Status |
| `ContentDeliveryStatus` | Checkmarks: "Training ✅", "Meal Plan ✅", "Supplements ✅" |

---

## Wallet Components (6)

| Component | Beschreibung |
|---|---|
| `WalletView` | Haupt-Wallet: beide Salden, Transaktionen, Actions |
| `WalletBalanceSplit` | Voucher-Saldo + Revenue-Saldo visuell getrennt |
| `TransactionList` | Chronologische Liste + Typ-Icon + Betrag |
| `TransactionItem` | Einzelne Transaktion: Icon, Beschreibung, Betrag, Datum |
| `TopUpModal` | Betrag-Chips + Stripe-Payment |
| `PayoutModal` | Revenue auszahlen: Betrag eingeben + Bestätigung |

---

## Creator Components (7)

| Component | Beschreibung |
|---|---|
| `CreatorDashboard` | Overview: Revenue, Sales, Top Products |
| `SalesChart` | Zeitreihe: Umsatz + Anzahl Verkäufe (30/90 Tage) |
| `ProductBuilder` | Neues Produkt: Typ → Content → Preis → Preview → Publish |
| `BundleBuilder` | Bundle aus eigenen Produkten zusammenstellen |
| `ProductPerformanceRow` | Views, Purchases, Conversion Rate, Rating |
| `ReviewResponseEditor` | Auf Review antworten |
| `PromotionBoostCard` | Boost-Optionen kaufen + Analytics |

---

## In-App Embedded (3) — apps/app

| Component | Beschreibung |
|---|---|
| `MarketplaceEmbedded` | Mini-Storefront: 3 personalisierte Empfehlungen |
| `QuickBuyCard` | Produkt-Karte mit 1-Click-Kauf (für Buddy) |
| `MyPurchasesView` | Alle Käufe mit Zugangs-Status + Re-Delivery-Option |

---

## Custom Hooks (16)

| Hook | Beschreibung |
|---|---|
| `useProducts(filter?)` | Produkte mit Pagination |
| `useProductDetail(id)` | Einzelprodukt + Bundle-Komponenten |
| `useRecommendations(ctx)` | Personalisierte Empfehlungs-Sektionen |
| `useBundleComponents(id)` | Komponenten eines Bundles |
| `useWallet()` | Wallet-Salden |
| `useWalletTransactions(limit)` | Transaktions-History |
| `useTopupActions()` | Stripe Top-up, Auto-Topup config |
| `usePayoutActions()` | Revenue-Auszahlung |
| `useCheckout(productId)` | Checkout-Flow State Machine |
| `useLicenses()` | Eigene Lizenzen |
| `useOrders(filter?)` | Order-History |
| `useReviews(productId)` | Reviews + Rating-Distribution |
| `useReviewActions()` | submitReview, voteHelpful, creatorResponse |
| `useCreatorDashboard()` | Creator Sales + Analytics |
| `useCreatorProducts()` | Eigene Produkte CRUD |
| `usePromotionSlots(productId?)` | Promotion-Analytics |

---

## Stores (2)

```typescript
// marketplaceUIStore
interface MarketplaceUIStore {
  searchQuery:     string;
  activeFilters:   ProductFilters;
  sortBy:          'score'|'price'|'rating'|'newest'|'popular';
  viewMode:        'grid'|'list';
  activeCategory:  string | null;

  setSearch(q: string): void;
  setFilter(f: Partial<ProductFilters>): void;
  clearFilters(): void;
  setSort(s: string): void;
}

// checkoutStore
interface CheckoutStore {
  productId:       string | null;
  phase:           'idle'|'preview'|'confirming'|'processing'|'success'|'error'|'topup_needed';
  errorMsg:        string | null;
  deliveryStatus:  Record<string, 'pending'|'delivered'|'failed'> | null;

  openCheckout(productId: string): void;
  confirmPurchase(): Promise<void>;
  reset(): void;
}
```

---

## Shared Contracts

```
packages/contracts/src/marketplace/
  wallet.ts         Wallet, WalletTransaction, TransactionType
  subscription.ts   SubscriptionPlan, UserSubscription
  product.ts        Product, ProductType, ProductBundle
  order.ts          Order, OrderItem, OrderStatus, CheckoutRequest
  license.ts        ProductLicense, DeliveryStatus, DeliveryResult
  review.ts         ProductReview, RatingDistribution
  creator.ts        Creator, VerificationLevel, CreatorDashboard
  promotion.ts      PromotionSlot, PromotionROI
  for-buddy.ts      MarketplaceRecommendation
  scoring.ts        SearchScore, GoalMatchScore, FeeCalc
```

---

## i18n Keys (260+ Auszug)

```
marketplace.home.title                 = "Marketplace"
marketplace.wallet.voucher_balance     = "Guthaben"
marketplace.wallet.revenue_balance     = "Einnahmen"
marketplace.wallet.topup               = "Aufladen"
marketplace.wallet.payout              = "Auszahlen"
marketplace.product.buy_now            = "Jetzt kaufen"
marketplace.product.already_purchased  = "Bereits gekauft"
marketplace.checkout.confirm           = "Kauf bestätigen"
marketplace.checkout.success           = "Kauf erfolgreich!"
marketplace.bundle.includes            = "Im Bundle enthalten"
marketplace.bundle.savings             = "Du sparst: €{amount}"
marketplace.review.verified            = "Verifizierter Kauf"
marketplace.creator.total_sales        = "Verkäufe insgesamt"
marketplace.promotion.boost_weekly     = "Wochen-Boost €49.99"
marketplace.wallet.goodwill_note       = "Monatliches Membership Goodwill"
```
