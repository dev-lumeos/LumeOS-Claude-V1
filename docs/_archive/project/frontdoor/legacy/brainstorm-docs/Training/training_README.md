# Training Module

## Übersicht
Das Training Module ist das zentrale System für Workout-Management, Exercise-Database, Progressive Overload und Training-Analytics in Lumeos.

## Hauptfunktionen
- 💪 **Exercise Database**: 1.448+ Übungen mit Ausrüstung und Muskelgruppen
- 📋 **Workout Logging**: Live-Workout-Tracking mit Sets/Reps/Weight
- 📈 **Progressive Overload**: Automatische Steigerungsvorschläge
- 🎯 **Training Programs**: Routinen und strukturierte Programme
- 📊 **Training Analytics**: Volume, Intensity, Frequency Tracking
- 🤖 **AI Coach Integration**: Intelligent workout recommendations
- ⚡ **Performance Tracking**: 1RM Calculator, Volume Load, RPE

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 5200)
- **Frontend**: Next.js 15 (React Components)
- **Database**: Supabase PostgreSQL
- **Analytics**: Custom volume/intensity calculations
- **Media**: 4.633+ exercise videos and images

## Code-Struktur
```
src/api/training/          # Backend API
apps/app/app/(app)/training/   # Frontend Pages
apps/app/modules/training/     # React Components
packages/types/src/training/   # Type Definitions
```

## Status
✅ Vollständig implementiert mit Progressive Overload Engine