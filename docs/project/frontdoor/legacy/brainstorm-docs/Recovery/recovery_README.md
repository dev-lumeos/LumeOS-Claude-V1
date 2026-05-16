# Recovery Module

## Übersicht
Das Recovery Module monitort Erholung, Schlafqualität, Stress-Level und bietet datenbasierte Recovery-Empfehlungen für optimale Trainings-Performance.

## Hauptfunktionen
- 😴 **Sleep Tracking**: Schlafqualität und -dauer monitoring
- ❤️ **HRV Monitoring**: Heart Rate Variability tracking
- 🧘 **Stress Management**: Stress-Level und Recovery-Status
- 📊 **Recovery Scores**: Täglich berechnete Readiness-Scores
- 🛀 **Recovery Modalities**: Sauna, Cold Plunge, Massage tracking
- ⚡ **Readiness Alerts**: Training-Intensitäts-Empfehlungen
- 📈 **Recovery Trends**: Langzeit-Recovery-Pattern-Analyse

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 5400)
- **Frontend**: Next.js 15 (React Components)
- **Database**: Supabase PostgreSQL
- **Integration**: Training + Goals + Coach Module
- **Wearables**: HRV4Training, Oura, Whoop integration

## Code-Struktur
```
src/api/recovery/          # Backend API
apps/app/app/(app)/recovery/   # Frontend Pages
packages/types/src/recovery/   # Type Definitions
```

## Status
✅ Implementiert mit Recovery-Score-Berechnung und Modality-Tracking