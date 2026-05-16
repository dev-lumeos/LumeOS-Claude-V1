# Goals Module

## Übersicht
Das Goals Module ist das zentrale Steuerungssystem von Lumeos - alle anderen Module sind Werkzeuge die User Richtung ihrer Ziele steuern.

## Hauptfunktionen
- 🎯 **Goal Definition**: Gewichtsverlust, Muskelaufbau, Performance-Ziele
- 📊 **Adaptive TDEE**: Dynamische Kalorienziele basierend auf Progress
- 🔄 **Macro Cycling**: Carb Cycling und Refeed-Strategien
- 📈 **Progress Tracking**: Goal-Progress über alle Module hinweg
- ⚙️ **Auto-Adjustments**: Automatische Anpassung bei Plateaus
- 🎢 **Periodization**: Bulk/Cut/Maintain-Phasen management
- 🤖 **Goal-Aware AI**: Alle Empfehlungen sind goal-spezifisch

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 5900)
- **Frontend**: Next.js 15 (React Components)
- **Database**: Supabase PostgreSQL
- **Integration**: ZENTRAL - alle anderen Module berichten hierher
- **Analytics**: Goal-Progress-Algorithmen

## Code-Struktur
```
src/api/goals/          # Backend API
apps/app/app/(app)/goals/   # Goal Management Frontend
packages/types/src/goals/   # Type Definitions
```

## Status
✅ Vollständig implementiert als zentrales Steuerungsmodul

## Tom's Vision
"Goals ist nicht ein weiteres Modul sondern der **Aggregation Point** - alle Scores sind relativ zum Ziel, nicht absolut. Jeder Alert/Empfehlung muss beantworten: 'Bringt dich das näher an dein Ziel?'"