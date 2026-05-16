# Auth Module

## Übersicht
Das Auth Module verwaltet Benutzer-Authentication, Permissions, Session-Management und Account-Security für das gesamte Lumeos-System.

## Hauptfunktionen
- 🔐 **User Authentication**: JWT-basierte secure Authentication
- 👤 **User Profiles**: User-Profile mit Preferences und Settings
- 🛡️ **Permission System**: Role-based Access Control (RBAC)
- 🔄 **Session Management**: Secure Session handling
- 📱 **Multi-Device Support**: Cross-device Authentication
- 🔒 **Security Features**: 2FA, Password Reset, Account Recovery
- 📊 **Admin Dashboard**: User Management für Admins

## Technologie-Stack
- **Backend**: Hono.js APIs (Port 4200)
- **Frontend**: Next.js 15 (React Components)  
- **Database**: Supabase Auth + Custom Users Table
- **Security**: JWT Tokens, bcrypt, rate limiting
- **Integration**: Basis für alle anderen Module

## Code-Struktur
```
src/api/auth/          # Backend API
packages/auth/src/     # Auth Utilities
packages/types/src/auth/ # Type Definitions
```

## Status
✅ Vollständig implementiert mit Supabase Auth Integration