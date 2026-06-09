# SPEC_11 — Marketplace UI Design
> Marketplace | apps/marketplace | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Marketplace/SPEC_01–SPEC_10 (Backend-Spec)

---

## 1. Übersicht

Der Marketplace ist die **Closed-Economy-Handelsplattform** von LumeOS.
Nur verifizierte Anbieter. Interne Wallet-Transaktionen.
Separate App (`apps/marketplace`, Domain: `marketplace.lumeos.app`).

Accent: `--acc-mkt` (moss, oklch(0.78 0.08 145)).

---

## 2. App-Shell

Leichtere Shell als `apps/web`. Keine Sidebar. Stattdessen:

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] LumeOS Marketplace  [Suche] [Wallet: €48.20] [👤] │
│ ─────────────────────────────────────────────────────── │
│ Browse · Coaches · Plans · Orders · Seller Dashboard    │
│ ─────────────────────────────────────────────────────── │
│ [Content]                                               │
└─────────────────────────────────────────────────────────┘
```

Topbar zeigt Wallet-Balance prominent.
Navigation: horizontale Tabs (kein Sidebar-Layout).

---

## 3. Navigation (6 Tabs)

| Tab | Inhalt |
|---|---|
| Browse | Produkt-Grid (Supplements, Equipment, Plans, Coaching) |
| Coaches | Coach-Marketplace, Profile, Buchung |
| Plans | Trainings- und Ernährungspläne kaufen |
| Orders | Bestellhistorie, Downloads, aktive Abos |
| Subscriptions | Aktive Abo-Verträge |
| Seller Dashboard | Für verifizierte Verkäufer |

---

## 4. Browse (Tab 1)

### Layout

```
[Suchfeld] [Kategorie-Filter] [Sort-Dropdown]
[Produkt-Grid — 3 Spalten auf Desktop]
```

### Kategorie-Filter

```tsx
<CategoryFilter categories={[
  { id: 'all',          label: 'All' },
  { id: 'supplements',  label: 'Supplements' },
  { id: 'equipment',    label: 'Equipment' },
  { id: 'plans',        label: 'Plans' },
  { id: 'coaching',     label: 'Coaching Packages' },
]} />
```

### Produkt-Card

```tsx
<ProductCard product={product}>
  <ProductImage
    src={product.imageUrl}
    fallback={<StripedPlaceholder label={product.category} />}
  />
  <ProductName>{product.name}</ProductName>
  <ProductBrand>{product.brand}</ProductBrand>
  <CoachRecommendationBadge coach={product.recommendedBy} />
  <ProductPrice wallet={product.price} />
  <AddToCartButton product={product} />
</ProductCard>
```

### Product Detail Page

```tsx
<ProductDetailPage product={selectedProduct}>
  <ProductHero image={product.image} name={product.name} brand={product.brand} />
  <ProductDescription>{product.description}</ProductDescription>

  <ActiveIngredients ingredients={product.ingredients} />
  <EvidenceLevel level={product.evidenceLevel} />
  <ThirdPartyTesting certifications={product.certifications} />

  <CoachEndorsements coaches={product.endorsements} />

  <PurchasePanel>
    <PriceDisplay wallet={product.price} fiat={product.fiatPrice} />
    <BuyNowButton />
    <AddToStackDirectlyButton />  // Öffnet "Add to Supplements Stack" Flow
  </PurchasePanel>

  <RelatedProducts items={related} />
</ProductDetailPage>
```

---

## 5. Coaches (Tab 2)

### Coach Discovery Grid

```tsx
<CoachGrid>
  <CoachCard coach={coach}>
    <CoachAvatar />
    <CoachName>{coach.name}</CoachName>
    <CoachType badge>{coach.type}</CoachType>
    <CoachSpecialties tags={coach.specialties} />
    <CoachStats athletes={coach.athleteCount} rating={coach.rating} />
    <PricingBadge>€{coach.monthlyFee} / mo</PricingBadge>
    <ViewProfileButton />
    <HireButton />
  </CoachCard>
</CoachGrid>
```

Filter: Coach-Typ (Training / Nutrition / Supplement / Medical), Preis-Range, Sprache.

### Coach Profile Page

```tsx
<CoachProfilePage coach={selected}>
  <CoachHero />
  <CoachBio>{coach.bio}</CoachBio>
  <CoachCertifications certs={coach.certifications} />
  <CoachMethodology text={coach.methodology} />
  <CoachStats athletes={count} avgRating={rating} successRate={pct} />
  <ReviewsList reviews={reviews} />
  <PricingTable packages={coach.packages} />
  <HireButton onHire={openHireModal} />
</CoachProfilePage>
```

### Hire Coach Modal

```tsx
<HireCoachModal coach={selected}>
  <PackageSelect packages={coach.packages} />
  <StartDatePicker />
  <PersonalNoteInput />
  <WalletPaymentConfirm amount={selectedPackage.price} balance={walletBalance} />
  <ConfirmButton />
</HireCoachModal>
```

---

## 6. Plans (Tab 3)

### Plan Grid

```tsx
<PlanGrid>
  <PlanCard plan={plan}>
    <PlanName>{plan.name}</PlanName>
    <PlanType badge>{plan.type}</PlanType>     // Training / Nutrition
    <PlanAuthor author={plan.author} />
    <PlanStats downloads={plan.downloads} rating={plan.rating} duration={plan.weeks} />
    <PlanPrice wallet={plan.price} />
    <BuyButton />
    <PreviewButton />
  </PlanCard>
</PlanGrid>
```

### Plan Preview Modal

```tsx
<PlanPreviewModal plan={selected}>
  <PlanOverview weeks={plan.weeks} sessionsPerWeek={plan.sessionsPerWeek} />
  <SampleWeek sessions={plan.sampleWeek} />
  <PurchaseCallout price={plan.price} />
</PlanPreviewModal>
```

---

## 7. Orders (Tab 4)

```tsx
<OrderHistory>
  <OrderCard order={order}>
    <OrderDate>{order.date}</OrderDate>
    <OrderItems items={order.items} />
    <OrderTotal amount={order.total} />
    <OrderStatus status={order.status} />
    <ReorderButton items={order.items} />
    <DownloadButton files={order.downloads} />
  </OrderCard>
</OrderHistory>
```

---

## 8. Subscriptions (Tab 5)

```tsx
<SubscriptionList>
  <SubscriptionCard subscription={sub}>
    <SubName>{sub.name}</SubName>
    <SubProvider>{sub.provider}</SubProvider>
    <SubCycle>{sub.billingCycle} · €{sub.amount}/mo</SubCycle>
    <SubStatus status={sub.status} nextBilling={sub.nextBillingDate} />
    <CancelButton />
  </SubscriptionCard>
</SubscriptionList>
```

---

## 9. Seller Dashboard (Tab 6)

Nur sichtbar für Accounts mit `seller`-Rolle (verifizierter Anbieter).

```tsx
<SellerDashboard>
  <SellerKpis>
    <KpiCard label="Revenue (30d)" value={`€${revenue}`} />
    <KpiCard label="Active Listings" value={listings} />
    <KpiCard label="Avg Rating" value={rating} />
    <KpiCard label="Net (after 15% fee)" value={`€${net}`} />
  </SellerKpis>

  <ListingsTable
    listings={listings}
    onEdit={editListing}
    onPause={pauseListing}
  />

  <RevenueChart data={last12Months} />

  <PayoutSection nextPayout={nextPayout} totalUnpaid={unpaid} />
</SellerDashboard>
```

Platform-Fee: 15% auf alle Transaktionen.

---

## 10. Wallet

Wallet-Balance immer sichtbar im App-Header.

```tsx
<WalletDisplay balance={walletBalance}>
  <BalanceValue>€{walletBalance.toFixed(2)}</BalanceValue>
  <TopUpButton onClick={openTopUpModal} />
</WalletDisplay>
```

Top-Up Modal: Stripe-basiert. Feste Beträge (€20 / €50 / €100 / Custom).
Alle Marketplace-Transaktionen laufen über Wallet (kein direkter Kreditkarten-Checkout im Marketplace).

---

## 11. Acceptance Criteria

```
[ ] Produkt-Grid 3 Spalten auf Desktop, responsiv auf 2/1
[ ] Suche: Fuzzy-Search über Namen + Beschreibung
[ ] Coach-Filter nach Typ funktioniert
[ ] Product Detail: alle Felder korrekt dargestellt
[ ] Hire Modal: Wallet-Saldo-Prüfung vor Bestätigung
[ ] Orders: Download-Button für digitale Produkte
[ ] Seller Dashboard: nur für seller-Rolle sichtbar
[ ] Platform-Fee 15% korrekt berechnet
[ ] Wallet-Balance live aktualisiert nach Transaktion
[ ] marketplace.lumeos.app SSO mit app.lumeos.app
```
