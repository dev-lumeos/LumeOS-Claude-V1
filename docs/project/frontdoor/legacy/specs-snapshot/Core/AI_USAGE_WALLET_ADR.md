# ADR: AI Features — Usage Tracking + Wallet-Modell

**Datum:** April 2026 | **Status:** V1 = Tracking only / Endausbau = Wallet-Transaktion

---

## Modell

AI-Features sind keine Subscription-Features — sie werden aus dem **User-Wallet** bezahlt.
Subscription (free/plus/pro) gibt Wallet-Guthaben. AI-Nutzung zieht daraus ab.

```
User kauft Abo → bekommt X Credits ins Wallet
User nutzt MealCam → -1 Credit
User nutzt Coach Chat → -0.5 Credits
User nutzt Intelligence Report → -2 Credits
Wallet leer → Topup oder warten bis nächste Periode
```

## V1: Nur Usage-Tracking, kein Gate

Alle AI-Features laufen durch — kein Wallet-Check, keine Blockierung.
Aber: **Jede AI-Aktion wird in `usage_events` geloggt.**

Damit haben wir echte Nutzungsdaten wenn wir die Wallet-Preise festlegen.

## usage_events Tabelle (von Tag 1 an befüllen)

```sql
-- Schema: core (oder analytics)
usage_events (
  id              UUID PK DEFAULT gen_random_uuid()
  user_id         UUID NOT NULL
  event_type      TEXT NOT NULL
    -- Nutrition
    mealcam_scan          -- Claude Vision API Aufruf
    food_search_smart     -- Smart Search mit Preference-Engine
    meal_suggestion       -- AI Mahlzeit-Vorschlag
    -- Coach
    coach_message         -- Chat-Nachricht an Buddy
    coach_decision        -- Autonome Buddy-Entscheidung
    coach_report          -- Wochenbericht generiert
    -- Intelligence
    correlation_compute   -- Korrelations-Berechnung
    insight_generate      -- Insight-Card generiert
    -- Training
    routine_generate      -- Trainingsplan von AI generiert
    deload_recommend      -- Deload-Empfehlung
    -- General
    ai_response           -- Generischer AI-Call
  metadata        JSONB             -- z.B. {"confidence": 0.87, "model": "claude-3-5-sonnet"}
  cost_usd        NUMERIC(8,6)      -- Tatsächliche API-Kosten in USD (für interne Kalkulation)
  credits_charged NUMERIC(8,4)      -- Credits die vom Wallet abgezogen werden (V2: aktiv, V1: 0)
  created_at      TIMESTAMPTZ DEFAULT now()
)

-- Index für User-Auswertungen
CREATE INDEX idx_usage_events_user_date ON usage_events (user_id, created_at DESC);
CREATE INDEX idx_usage_events_type ON usage_events (event_type, created_at DESC);
```

## Was wir damit auswerten können (bevor Wallet live geht)

```sql
-- Wie oft nutzt ein User MealCam pro Monat?
SELECT user_id, COUNT(*) as scans_per_month
FROM usage_events
WHERE event_type = 'mealcam_scan'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Durchschnittliche API-Kosten pro User pro Monat
SELECT AVG(monthly_cost) FROM (
  SELECT user_id, SUM(cost_usd) as monthly_cost
  FROM usage_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
) t;

-- Welche AI-Features werden am meisten genutzt?
SELECT event_type, COUNT(*), SUM(cost_usd) as total_cost
FROM usage_events
GROUP BY event_type ORDER BY total_cost DESC;
```

## Wallet-Infrastruktur (Endausbau — noch zu spezifizieren)

```
user_wallets          → Guthaben pro User (credits_balance)
wallet_transactions   → Aufladungen + Abzüge mit Referenz auf usage_event
wallet_topups         → Stripe/Payment Integrationen
credit_price_config   → event_type → credits_per_call (admin-konfigurierbar)
```

→ Vollständige Wallet-Spec: `docs/BrainstormDocs/Marketplace/wallet-and-monetization.md`
→ Noch zu erstellen: `docs/specs/Core/WALLET_SPEC.md`

## Implementierungs-Hinweis für Entwickler

**Jeder AI-Call in jedem Service muss usage_events befüllen.**
Das ist nicht optional — es ist die Datenbasis für Pricing-Entscheidungen.

```typescript
// Pattern für jeden AI-Aufruf
async function callMealCam(imageData: Buffer, userId: string) {
  const start = Date.now();
  const result = await claudeVision.analyze(imageData);

  // Usage immer loggen — auch wenn kein Gate aktiv
  await logUsageEvent({
    user_id: userId,
    event_type: 'mealcam_scan',
    metadata: { confidence: result.confidence, model: 'claude-3-5-sonnet' },
    cost_usd: estimateCost('claude-vision', imageData.length),
    credits_charged: 0, // V1: immer 0
  });

  return result;
}
```
