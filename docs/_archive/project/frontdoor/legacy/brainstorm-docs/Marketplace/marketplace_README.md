# Marketplace Module

## Übersicht
Das Marketplace Module ist der E-Commerce-Hub von Lumeos für Supplements, Equipment, Meal Plans und andere Fitness-/Health-Produkte mit integriertem Wallet-System.

## Hauptfunktionen
- 🛒 **Product Catalog**: Supplements, Equipment, Nutrition Products
- 💳 **Lumeos Wallet**: Voucher-basiertes Payment System
- 🎯 **Personalized Recommendations**: AI-basierte Produkt-Empfehlungen
- 📦 **Order Management**: Bestellungen und Tracking
- ⭐ **Reviews & Ratings**: User-Reviews für alle Produkte
- 💰 **Revenue System**: Transaktionsgebühren auf alle Käufe
- 🏪 **Vendor Management**: Partner-Shops und Creators

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 5700)
- **Frontend**: Next.js 15 (React Components)
- **Database**: Supabase PostgreSQL
- **Payment**: Lumeos Wallet + Stripe Integration
- **Integration**: Supplements + Nutrition + Goals Module

## Code-Struktur
```
src/api/marketplace/          # Backend API
apps/app/app/(app)/marketplace/ # Frontend Shop
packages/types/src/marketplace/ # Type Definitions
```

## Status
✅ Implementiert mit Wallet-System und AI-Recommendations