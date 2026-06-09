# SPEC_10 — Workspace Integration & Links
> WebPlatform | Stand: Mai 2026 | Status: draft

---

## 1. Was sind Workspaces?

Workspaces sind **separate Anwendungen** mit eigenen Domains.
Sie teilen das gleiche Design-System und Auth-Backend (Supabase), laufen aber als eigene Next.js-Apps.

| Workspace | Domain | App | Zugang |
|---|---|---|---|
| Coach Portal | `coach.lumeos.app` | `apps/coach` | Athlete + Coach |
| Buddy | `buddy.lumeos.app` | `apps/buddy` | Athlete only |
| Marketplace | `marketplace.lumeos.app` | zukünftig `apps/marketplace` | Public + Athlete |
| Admin | `admin.lumeos.app` | `apps/admin` | Admin + Staff only |

---

## 2. Integration-Modell in apps/web

`apps/web` verlinkt zu Workspaces — kein Embed, kein iFrame.

### Sidebar-Einträge (Workspaces-Gruppe)

```tsx
const WORKSPACES = [
  {
    id: 'coach',
    label: 'Coach Portal',
    icon: 'Users',
    href: 'https://coach.lumeos.app',
    accent: 'var(--acc-coach)',
    requiresRole: null,           // alle User
  },
  {
    id: 'buddy',
    label: 'Buddy',
    icon: 'MessageCircle',
    href: 'https://buddy.lumeos.app',
    accent: 'var(--acc-buddy)',
    requiresRole: null,
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: 'ShoppingBag',
    href: 'https://marketplace.lumeos.app',
    accent: 'var(--acc-mkt)',
    requiresRole: null,
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'Shield',
    href: 'https://admin.lumeos.app',
    accent: 'var(--acc-admin)',
    requiresRole: 'admin',        // nur admin-Rolle
  },
];
```

Workspace-Links öffnen in `target="_blank"`.
Admin-Link: nur gerendert wenn `user.role === 'admin'`.

---

## 3. Auth-Handoff (SSO)

Alle Workspace-Apps nutzen dieselbe Supabase-Session.

### Mechanismus

Supabase Auth Session wird via `@supabase/ssr` in Cookies geführt.
Bei Navigation zu einer Workspace-Domain:

1. User klickt Workspace-Link
2. Neuer Tab öffnet auf `coach.lumeos.app`
3. `apps/coach` prüft Supabase-Session (shared Cookie via `.lumeos.app` Domain)
4. Session vorhanden → direkt eingeloggt
5. Session fehlt → Redirect zu `/login` (mit `?redirect=` Parameter)

### Cookie-Konfiguration

```ts
// Supabase Auth Cookie: domain-übergreifend
{
  name: 'lumeos-auth',
  domain: '.lumeos.app',        // Gilt für alle Subdomains
  sameSite: 'lax',
  secure: true,
  httpOnly: true,
}
```

### Role-Check

```ts
// Middleware in apps/admin/middleware.ts
const session = await supabase.auth.getSession();
const userRole = session.data.session?.user.app_metadata?.role;

if (userRole !== 'admin' && userRole !== 'staff') {
  return NextResponse.redirect(new URL('https://app.lumeos.app', request.url));
}
```

---

## 4. Deep-Links aus Modulen

Bestimmte Aktionen in `apps/web` linken direkt in Workspaces:

| Aktion in apps/web | Deep-Link |
|---|---|
| "Find Coach" Button (Coach-Modul) | `https://coach.lumeos.app/find` |
| "Message Coach" (Coach-Übersicht) | `https://coach.lumeos.app/messages/{coachId}` |
| "Order Refills" (Supplements) | `https://marketplace.lumeos.app/cart?items={ids}` |
| "Browse Plans" (Training Plan) | `https://marketplace.lumeos.app/plans` |
| "Ask Buddy" Quick-Action (Dashboard) | `https://buddy.lumeos.app/chat` |
| Product Detail → Marketplace | `https://marketplace.lumeos.app/products/{productId}` |

Deep-Links öffnen immer in `target="_blank"`.

---

## 5. Shared Design System

Alle Workspace-Apps importieren aus `packages/ui`:

```
packages/ui/
├── src/
│   ├── components/       — Card, Pill, Badge, Tabs, Modal, Drawer, Sparkline, ...
│   ├── tokens/
│   │   └── globals.css   — Alle CSS Custom Properties (OKLCH Tokens)
│   └── hooks/
│       └── useTheme.ts   — Dark/Light Toggle
```

Jede App importiert `globals.css` und bekommt dasselbe Token-System.
Modul-Akzentfarben: jede App setzt `--acc` auf ihre primäre Farbe.

---

## 6. Workspace-Awareness in apps/web

`apps/web` zeigt minimale Status-Info für Workspaces:

```tsx
// Sidebar Workspace-Item: Badge bei pending items
<WorkspaceNavItem
  workspace={workspace}
  badge={pendingCoachMessages > 0 ? pendingCoachMessages : undefined}
/>
```

Badge-Counts werden via Supabase Realtime abonniert (minimaler Payload).

---

## 7. Fehlerfall: Workspace nicht erreichbar

```tsx
<WorkspaceLink
  href={workspace.href}
  onError={() => toast.error(`${workspace.label} currently unavailable`)}
>
  {workspace.label}
</WorkspaceLink>
```

Kein Fallback-Content, kein Embed. Einfacher Error-Toast.

---

## 8. Onboarding-Flow (Auth)

### Multi-Step Onboarding (10 Steps)

Neue User durchlaufen einen Onboarding-Flow nach der Registration.

```
Step 1:  Welcome — Name, Sprache
Step 2:  Goals — Primärziel (Muskelaufbau / Abnehmen / Performance / Gesundheit)
Step 3:  Activity Level — Sedentary / Light / Moderate / Active / Very Active
Step 4:  Modules auswählen — welche Module aktivieren
Step 5:  Wearables — Garmin / Polar / Whoop / Apple Health (optional, skip möglich)
Step 6:  Buddy Persona — 5 Personas zur Auswahl
Step 7:  Privacy — Datenschutz-Präferenzen (Coach-Sichtbarkeit)
Step 8:  Tier — Free / Pro / Elite (Plan-Wahl)
Step 9:  Units — kg/lbs, cm/inch, Zeitzone
Step 10: Done — "Let's go" → redirect zu /dashboard
```

```tsx
<OnboardingFlow>
  <OnboardingStep step={1} total={10}>
    <StepContent />
    <ProgressBar />
    <NextButton />
    <SkipButton optional />
  </OnboardingStep>
</OnboardingFlow>
```

### Login / Register

```tsx
<AuthCard>
  <OAuthButton provider="apple">Continue with Apple</OAuthButton>
  <OAuthButton provider="google">Continue with Google</OAuthButton>
  <PasskeyButton>Continue with Passkey</PasskeyButton>
  <Divider>or</Divider>
  <EmailPasswordForm onSubmit={signIn} />
  <RegisterLink />
</AuthCard>
```

---

## 9. Acceptance Criteria

```
[ ] Workspace-Links öffnen in neuem Tab
[ ] Admin-Link nur für admin-Rolle sichtbar
[ ] Supabase-Session wird cross-domain geteilt (.lumeos.app Cookie)
[ ] Deep-Links aus Modulen funktionieren korrekt
[ ] packages/ui Tokens importiert von allen Apps
[ ] Badge-Counts im Sidebar für Workspaces
[ ] Onboarding 10-Step Flow vollständig
[ ] Login: Apple / Google / Passkey + Email-Password
[ ] Nach Login immer Redirect zu /dashboard (oder ?redirect= Ziel)
```
