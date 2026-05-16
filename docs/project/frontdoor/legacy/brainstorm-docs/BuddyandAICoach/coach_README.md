# Coach Module

## Übersicht
Das Coach Module ist das AI-Brain von Lumeos - ein intelligenter Coach der alle Module überwacht, Patterns erkennt und personalisierte Empfehlungen gibt.

## Hauptfunktionen
- 🤖 **AI Coach Chat**: Intelligente Unterhaltungen über Fitness/Nutrition
- 📊 **Cross-Module Analysis**: Daten aus allen Modulen analysieren
- 💡 **Smart Recommendations**: Personalisierte Fitness/Nutrition-Tipps
- 🎯 **Goal Coaching**: Hilfe bei Zielerreichung und Motivation
- 📈 **Progress Tracking**: Fortschritt über alle Bereiche hinweg
- ⚠️ **Issue Detection**: Probleme und Plateaus erkennen
- 🧠 **Memory System**: Lernt User-Präferenzen und -Verhalten

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 5500)
- **Frontend**: Next.js 15 (React Components)
- **AI**: Z.AI GLM Models (GLM-5, GLM-4.5v)
- **Memory**: Conversation + Decision Memory System
- **Integration**: Alle anderen Module als Datenquellen

## Code-Struktur
```
src/api/coach/          # Backend API
apps/app/app/(app)/coach/   # Frontend Pages
packages/rules-engine/  # Coach Rules Engine
```

## Status
✅ Vollständig implementiert mit GLM-Integration und Memory System