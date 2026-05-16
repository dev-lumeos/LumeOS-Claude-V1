# Marketplace Module — Frontend Components

## Apps

| App | Port | Beschreibung |
|---|---|---|
| `apps/marketplace/` | 8503 | Vollständiges Marketplace-Frontend |
| `apps/app/modules/marketplace/` | Integriert | Eingebettete Kaufflows im User-App |

---

## Storefront Components (8)

| Component | Beschreibung |
|---|---|
| `MarketplaceHome` | Home: Featured, Empfehlungen, Trending, Bundles |
| `ProductGrid` | Sortiertes Grid mit Filter-Sidebar |
| `ProductCard` | Bild, Titel, Creator, Rating, Preis, Badge (PROMOTED/NEW/FREE) |
| `BundleCard` | Spezielle Karte: alle Komponenten sichtbar, Savings Badge |
| `RecommendationSection` | "Für dein Lean Bulk Goal", "Trending" etc. |
| `FeaturedBanner` | Großes Featured-Banner oben |
| `SearchBar` | Mit Auto-Complete + Filter-Chips |
| `FilterPanel` | Kategorie, Preis, Schwierigkeit, Goal, Rating |

---

## Product Detail Components (6)

| Component | Beschreibung |
|---|---|
| `ProductDetailView` | Header + Media + Info + Reviews + Similar |
| `ProductHeader` | Titel, Creator, Rating, Preis, Kauf-Button |
| `ProductMedia` | Bilder-Galerie + Preview-Video |
| `BundleComponentList` | Alle Bundle-Inhalte aufgelistet + "Savings: €28" |
| `ProductReviewSection` | Rating-Verteilung + Review-Liste + Schreiben |
| `SimilarProducts` | Horizontal scroll: ähnliche Produkte |

---

## Checkout Components (4)

| Component | Beschreibung |
|---|---|
| `CheckoutModal` | Preis, Wallet Balance, Bestätigen |
| `WalletBalanceCheck` | Voucher + Revenue Saldo, Top-up wenn nötig |
| `OrderConfirmation` | Bestätigung + "Inhalte werden geladen..." |
| `ContentDeliveryStatus` | "Training Routine wurde hinzugefügt ✅", "Meal Plan ✅" |

---

## Wallet Components (5)

| Component | Beschreibung |
|---|---|
| `WalletView` | Balance, Transaktions-History, Top-up, Payout |
| `WalletBalance` | Voucher + Revenue Saldo prominent |
| `TransactionList` | Chronologische Liste aller Transaktionen |
| `TopUpModal` | Betrag wählen + Stripe-Checkout |
| `PayoutModal` | Revenue-Wallet auszahlen (Creator only) |

---

## Creator Dashboard Components (6)

| Component | Beschreibung |
|---|---|
| `CreatorDashboard` | Overview: Revenue, Sales, Top Products |
| `SalesAnalytics` | Zeitreihe + Breakdown nach Produkt |
| `ProductBuilder` | Neues Produkt erstellen: Typ, Inhalt, Preis |
| `BundleBuilder` | Bundle aus eigenen Komponenten zusammenstellen |
| `ProductPerformanceCard` | Views, Purchases, Conversion Rate, Rating |
| `ReviewResponseEditor` | Auf Käufer-Reviews antworten |

---

## In-App Embedded Components (3) — apps/app

| Component | Beschreibung |
|---|---|
| `MarketplaceEmbedded` | Mini-Storefront innerhalb Lumeos App |
| `QuickBuyCard` | Produkt-Karte mit direktem Kaufflow (für Buddy) |
| `MyPurchasesView` | Alle gekauften Inhalte mit Zugangs-Status |

---

## Custom Hooks (16)

| Hook | Beschreibung |
|---|---|
| `useProducts(filter?)` | Produkte mit Search/Filter |
| `useProductDetail(id)` | Einzelprodukt-Detail |
| `useRecommendations(context)` | Personalisierte Empfehlungen |
| `useBundleComponents(id)` | Bundle-Inhalte |
| `useWallet()` | Wallet-Salden |
| `useWalletTransactions(limit)` | Transaktions-History |
| `useTopupActions()` | Stripe-Topup, Auto-Topup |
| `usePayoutActions()` | Revenue-Auszahlung |
| `useCheckout()` | Checkout Flow State |
| `useLicenses()` | Gekaufte Inhalte |
| `useOrders(filter?)` | Order-History |
| `useReviews(productId)` | Reviews eines Produkts |
| `useReviewActions()` | submitReview, markHelpful |
| `useCreatorDashboard()` | Creator Sales + Analytics |
| `useCreatorProducts()` | Eigene Produkte |
| `usePromotions()` | Boost Slots verwalten |

---

## Stores (2)

```typescript
// marketplaceUIStore
interface MarketplaceUIStore {
  activeCategory:    string | null;
  searchQuery:       string;
  filters:           ProductFilters;
  viewMode:          'grid' | 'list';

  setCategory(c: string | null): void;
  setSearch(q: string): void;
  setFilter(f: Partial<ProductFilters>): void;
  clearFilters(): void;
}

// checkoutStore
interface CheckoutStore {
  productId:         string | null;
  checkoutStatus:    'idle'|'confirming'|'processing'|'success'|'error';
  deliveryStatus:    DeliveryStatus | null;

  startCheckout(productId: string): void;
  confirmPurchase(): void;
  resetCheckout(): void;
}
```

---

## Shared Contracts

```
packages/contracts/src/marketplace/
  product.ts       Product, ProductType, ProductBundle
  wallet.ts        Wallet, WalletTransaction, TransactionType
  order.ts         Order, OrderItem, OrderStatus
  license.ts       ProductLicense, DeliveryStatus
  review.ts        ProductReview
  creator.ts       Creator, VerificationLevel
  promotion.ts     PromotionSlot
  checkout.ts      CheckoutRequest, CheckoutResponse
  for-buddy.ts     MarketplaceRecommendation
```
