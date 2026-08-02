# B2B Integration APIs — Technical Reference

## Gym Management APIs

| Platform | API | Docs | Auth | Notes |
|----------|-----|------|------|-------|
| **Mindbody** | REST API v6 | developers.mindbody.io | OAuth2 | Umfangreichste API. Appointments, Classes, Clients, Sales, Staff |
| **Glofox** | API (by ABC) | On request | API Key | Same company as Mindbody |
| **Magicline** | Open Platform API | developers.magicline.com | OAuth2 | Deutscher Markt. Developer Portal öffentlich |
| **GymMaster** | API | On request | API Key | Basic endpoints |
| **Wodify** | Limited | Kein Public Docs | — | Closed ecosystem |
| **PushPress** | API | On request | — | Limited public info |
| **Virtuagym** | Partner API | On request | OAuth2 | Selective Partner access |

## Gym Aggregator APIs

| Platform | API | Notes |
|----------|-----|-------|
| **ClassPass** | Partner API | Nur für verifizierte Partner, kein Public Access |
| **Urban Sports Club** | Partner API | B2B only, auf Anfrage |
| **Gympass/Wellhub** | Corporate API | Enterprise Integration |

## Equipment APIs

| Hersteller | API/Protokoll | Was | Notes |
|-----------|--------------|-----|-------|
| **Technogym** | Technogym API + mywellness cloud | Workout Data, Machine Settings | Partner-Zugang nötig, Magicline hat Integration |
| **EGYM** | EGYM Open API | Training Data, Machine Stats | Open Ecosystem, gut dokumentiert |
| **Life Fitness** | Halo Fitness Cloud API | Workout History | Partner Program |
| **Matrix Fitness** | Sprint 8 API | HIIT Data | Limited |
| **Concept2** | ErgData + Logbook | Rowing Data | Open, kostenlos |

## Wearable APIs (Gym-Relevant)

| Platform | Für Gym-Integration | Notes |
|----------|-------------------|-------|
| **Apple HealthKit** | Auto-Sync Workouts, HR, Steps | iOS only, User muss genehmigen |
| **Google Health Connect** | Android equivalent | Oura, Garmin, Samsung, Fitbit sync here |
| **WHOOP** | Developer API v2 | Recovery, Strain, Sleep, HR |
| **Garmin** | Health API + Connect IQ | Detailreichste Fitness-Daten |
| **Oura** | Oura API v2 | Readiness, Sleep, Activity |
| **Polar** | Accesslink API | Training, Activity, Nightly Recharge |

## Affiliate / Commerce APIs

| Platform | Für Supplement Brands | Notes |
|----------|---------------------|-------|
| **Impact** | Affiliate Tracking | Largest Performance Marketing Platform |
| **ShareASale** | Affiliate Network | Viele Supplement Brands |
| **Amazon Associates** | Product Links | Supplement → Amazon Link → Commission |
| **CJ Affiliate** | Performance Marketing | Enterprise-Level |
| **Stripe Connect** | Payment Split | Coach/Brand/Lumeos Revenue Split |

---

## Priorität für Lumeos

### Phase 1 (MVP):
1. **Apple HealthKit** + **Google Health Connect** — Gym Workout Sync
2. **Stripe Connect** — Revenue Split (Marketplace + Brands + Coaches)
3. **Mindbody API** — Check-in Integration (40K Gyms)

### Phase 2:
4. **Magicline API** — DACH Gym Integration (8K Studios)
5. **Impact/ShareASale** — Supplement Affiliate Tracking
6. **Technogym API** (via Magicline oder direkt) — Equipment Data

### Phase 3:
7. **EGYM Open API** — Smart Equipment Sync
8. **ClassPass/USC** — Aggregator Partnership
9. **Gympass Corporate API** — B2B Wellness
