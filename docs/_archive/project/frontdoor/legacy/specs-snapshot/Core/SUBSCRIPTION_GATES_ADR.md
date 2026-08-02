# Subscription Gates — Architecture Decision Record

**Datum:** April 2026
**Status:** V1 — Revisit wenn Monetarisierung steht

---

## Entscheidung: Kein Subscription-Gate in V1

Alle Features sind in V1 ohne Einschränkung zugänglich.
Kein Tier-Lock, kein Paywall, kein Feature-Flag basierend auf Subscription.

**Betrifft konkret:**

| Feature | Geplantes Gate (später) | V1 |
|---|---|---|
| Mikro-Tier 2 (Athlete) | Plus-only | ✅ offen |
| Mikro-Tier 3 (Medical) | Pro-only | ✅ offen |
| MealCam / Claude Vision | Plus-only (3 Free Scans) | ✅ offen |
| Trend-Charts >7 Tage | Plus-only | ✅ offen |
| Coach Autonomy-Level | Plus-only | ✅ offen |
| Intelligence Korrelationen | Pro-only | ✅ offen |
| Export / Reports | Pro-only | ✅ offen |

## Was trotzdem jetzt schon richtig implementiert wird

Das Datenmodell ist von Tag 1 tier-ready — kein Refactoring nötig später:

- `nutrient_defs.display_tier` (1/2/3) ist in DB vorhanden
- `nutrition_settings.show_micros_tier` Setting existiert
- User-Profile hat `subscription_tier` Feld (free | plus | pro | coach)

Der Tier-Lock später = ein einziger Wrapper:
```typescript
// Später hinzufügen — kein Refactoring, nur Wrapper
function requireTier(userTier: Tier, required: Tier) {
  if (tierRank[userTier] < tierRank[required]) {
    return <UpgradePrompt requiredTier={required} />;
  }
  return null; // zeige Content
}
```

## Wann revisiten

Wenn Monetarisierung / Subscription-System gebaut wird.
Dann: Feature-Flags per Modul einschalten, UI-Wrapper einfügen.
Aufwand-Schätzung: ~1 Woche für alle Module.
