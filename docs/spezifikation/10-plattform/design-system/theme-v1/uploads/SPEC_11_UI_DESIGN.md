# SPEC_11 — Buddy App UI Design
> BuddyandAICoach | apps/buddy | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/BuddyandAICoach/SPEC_01–SPEC_10 (Backend-Spec)

---

## 1. Übersicht

Buddy ist der **KI-Companion** — das Kernprodukt von LumeOS.
Separate App (`apps/buddy`, Domain: `buddy.lumeos.app`).
Accent: `--acc-buddy` (lilac, oklch(0.76 0.09 310)).

Buddy ist kein weiteres Modul. Buddy ist eine eigenständige konversationelle Erfahrung
die alle Module kennt und den User kennt.

---

## 2. App-Shell

```
┌─────────────────────────────────────────┐
│ Buddy Header: [Avatar] [LumeOS Buddy]   │
│                                         │
│ [Navigation Tabs]                       │
│                                         │
│ [Tab Content]                           │
└─────────────────────────────────────────┘
```

Kein 3-Spalten-Layout. Buddy hat eine eigene, schmalere Shell (max-width: 900px, zentriert).
Hintergrund: `--bg` mit subtiler `--acc-buddy` Tinting im Header-Bereich.

---

## 3. Navigation (6 Tabs)

| Tab | Inhalt |
|---|---|
| Chat | Haupt-Konversationsoberfläche |
| Insights | Proaktiver Insights-Feed |
| Memory | Was Buddy über den User gespeichert hat |
| Decisions | Protokollierte Auto-Entscheidungen |
| Personality | Persona / Kommunikationsstil / Notifications |
| Avatar | Showcase + Tester für alle 5 Avatar-Zustände |

---

## 4. Chat (Tab 1)

### Layout

```
[Thread-List — linke Sidebar, 240px]  |  [Chat Surface — fluid]
  ├── General
  ├── Nutrition
  ├── Training
  ├── Recovery
  └── Goals
```

### Chat Surface

```tsx
<ChatSurface thread={activeThread}>
  <ChatMessages messages={messages}>
    <MessageBubble role="buddy" content={...} />
    <MessageBubble role="user" content={...} />
  </ChatMessages>

  <QuickActionPills>
    {contextualActions.map(action => (
      <QuickActionPill key={action} onSelect={() => sendQuickAction(action)}>
        {action}
      </QuickActionPill>
    ))}
  </QuickActionPills>

  <ChatInput
    placeholder="Ask Buddy anything..."
    onSend={sendMessage}
    onVoice={startVoiceInput}
  />
</ChatSurface>
```

### Live Persona Avatar (im Chat-Header)

```tsx
<BuddyAvatarWidget state={buddyState} size={56} />
```

Avatar-Zustand live:
- `idle` → gentle pulse
- `thinking` → rotation + opacity cycle (während API-Call)
- `responding` → faster pulse (während Antwort streamst)
- `alert` → rot-tint + Shake
- `celebrating` → grün + scale-pop

Implementierung via Framer Motion `variants`.

### Quick-Action-Pills

Kontextsensitiv, basierend auf aktuellen User-Daten:

```ts
const quickActions = [
  nutrition.today.remaining > 0 ? "What should I eat for dinner?" : null,
  recovery.score < 65 ? "My recovery is low, what should I do?" : null,
  training.nextSession ? `What's today's workout?` : null,
  supplements.nextDose ? `When is my next supplement?` : null,
].filter(Boolean);
```

---

## 5. Insights Feed (Tab 2)

Proaktive Hinweise von Buddy. Chronologisch, neueste oben.

```tsx
<InsightsFeed>
  <InsightCard
    type="suggestion"
    title="Pre-workout window open"
    body="Training in 90min — optimal window for 30g carbs + 20g protein now."
    modules={['nutrition', 'training']}
    timestamp={now}
    onDismiss={dismissInsight}
    onAction={() => openNutritionDiary()}
  />
  <InsightCard
    type="alert"
    title="Recovery Score niedrig"
    body="Score 62 — unter deinem 14d-Durchschnitt von 78. Heute eher Regeneration."
    modules={['recovery']}
  />
  <InsightCard
    type="celebration"
    title="Neuer Bench-PR! 🎉"
    body="105 kg heute — 5 kg über deinem letzten e1RM. Das war Woche 7 des Strength Blocks."
    modules={['training']}
  />
  <InsightCard
    type="pattern"
    title="Donnerstag-Einbruch erkannt"
    body="Dein Recovery-Score ist donnerstags durchschnittlich 12% niedriger als Mittwoch. Schauen wir uns Mittwoch-Abend an."
    modules={['recovery']}
  />
</InsightsFeed>
```

Insight-Types: `suggestion` | `alert` | `celebration` | `pattern` | `info`.

---

## 6. Memory (Tab 3)

Was Buddy über den User gespeichert hat. Transparent, editierbar.

```tsx
<BuddyMemory>
  <MemoryCategories categories={['Goals', 'Preferences', 'Health', 'Training', 'Nutrition']} />

  <MemoryTable memories={memories} filter={activeCategory}>
    <MemoryRow
      content="Primary goal: Lean bulk — +2 kg Muskelmasse bis Oktober"
      source="dashboard"
      lastUpdated="May 20"
      category="Goals"
      onEdit={editMemory}
      onDelete={deleteMemory}
    />
    <MemoryRow
      content="Präferiert morgens trainieren, Mittagessen oft ausgelassen"
      source="nutrition"
      lastUpdated="May 18"
      category="Preferences"
    />
  </MemoryTable>

  <AddMemoryButton onClick={addManualMemory} />
</BuddyMemory>
```

User sieht alle Memories und kann sie bearbeiten oder löschen (DSGVO-konform).

---

## 7. Decisions (Tab 4)

Protokollierte automatische Entscheidungen von Buddy.

```tsx
<DecisionLog>
  <DecisionRow
    autonomyLevel={2}            // 1 = Buddy entscheidet allein, 5 = User entscheidet
    decision="Reminded user to log lunch (12:30) — no log detected since 08:00"
    outcome="User logged lunch at 12:45"
    timestamp={ts}
  />
  <DecisionRow
    autonomyLevel={3}
    decision="Suggested rest day based on Recovery Score 58 + Training Load"
    outcome="User acknowledged, rescheduled Pull Day"
  />
</DecisionLog>
```

Autonomy-Level-Badge: 1–5 mit Farbcodierung (grün = Buddy handelt, amber = empfiehlt, neutral = nur informiert).

---

## 8. Personality (Tab 5)

### Persona-Cards (5 Personas)

```tsx
<PersonaSelector>
  <PersonaCard
    name="Scientist"
    description="Datengetrieben, präzise, sachlich"
    active={persona === 'scientist'}
    onSelect={() => setPersona('scientist')}
  />
  <PersonaCard name="Motivator" description="Enthusiastisch, ermutigend, energetisch" ... />
  <PersonaCard name="Drill" description="Direkt, fordernd, kein Sugarcoating" ... />
  <PersonaCard name="Friend" description="Warm, unterstützend, humorvoll" ... />
  <PersonaCard name="Zen" description="Ruhig, ganzheitlich, achtsam" ... />
</PersonaSelector>
```

### Autonomy Level Toggle

```tsx
<AutonomyLevelToggle
  value={autonomyLevel}
  onChange={setAutonomyLevel}
  levels={[
    { value: 1, label: 'Buddy entscheidet', description: 'Maximale Automatisierung' },
    { value: 2, label: 'Buddy empfiehlt stark', description: '' },
    { value: 3, label: 'Shared', description: 'Buddy schlägt vor, du entscheidest' },
    { value: 4, label: 'Du führst, Buddy unterstützt', description: '' },
    { value: 5, label: 'Nur informieren', description: 'Minimale Einmischung' },
  ]}
/>
```

### Communication Settings

```tsx
<CommSettings>
  <FrequencySelect
    label="Notification frequency"
    options={['Minimal', 'Normal', 'Active', 'Always-on']}
  />
  <QuietHours from={quietStart} to={quietEnd} onChange={setQuietHours} />
  <CriticalBypass
    label="Always notify for critical alerts"
    checked={criticalBypass}
    onChange={setCriticalBypass}
  />
  <ToneSelect label="Communication tone" options={['Formal', 'Casual', 'Motivating']} />
</CommSettings>
```

### Privacy Settings

```tsx
<BuddyPrivacy>
  <PrivacyRow module="Medical" access="aggregate" onChange={setMedicalAccess} />
  <PrivacyRow module="Supplements Extended" access="off" onChange={...} />
  <PrivacyRow module="Goals" access="full" onChange={...} />
</BuddyPrivacy>
```

---

## 9. Avatar Showcase (Tab 6)

```tsx
<AvatarShowcase>
  <AvatarStateGrid>
    {['idle', 'thinking', 'responding', 'alert', 'celebrating'].map(state => (
      <AvatarPreview key={state} state={state} size={96} label={state} />
    ))}
  </AvatarStateGrid>
  <AvatarSizePicker sizes={[32, 56, 96, 128]} />
</AvatarShowcase>
```

---

## 10. Avatar — Technische Implementierung

```tsx
// BuddyAvatar.tsx
const VARIANTS = {
  idle: {
    scale: [1, 1.04, 1],
    opacity: [0.85, 1, 0.85],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  thinking: {
    rotate: [0, 360],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
  responding: {
    scale: [1, 1.06, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
  },
  alert: {
    x: [-3, 3, -3, 3, 0],
    backgroundColor: 'oklch(0.72 0.16 22)',
    transition: { duration: 0.4, times: [0, 0.25, 0.5, 0.75, 1] },
  },
  celebrating: {
    scale: [1, 1.12, 1],
    backgroundColor: 'oklch(0.78 0.13 150)',
    transition: { duration: 0.5, repeat: 3, ease: 'easeOut' },
  },
};

<motion.div
  className="buddy-orb"
  variants={VARIANTS}
  animate={state}
  style={{
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'var(--acc-buddy)',
    display: 'grid',
    placeItems: 'center',
  }}
/>
```

---

## 11. Acceptance Criteria

```
[ ] Chat rendert Message-Bubbles korrekt (User links, Buddy rechts oder umgekehrt)
[ ] Quick-Action-Pills sind kontextsensitiv
[ ] Buddy-Avatar wechselt Zustand live während API-Call (thinking → responding)
[ ] Insights Feed zeigt alle 4 Typen korrekt
[ ] Memory: User kann eigene Memories editieren und löschen
[ ] Persona-Wechsel persistiert in DB
[ ] Autonomy-Level-Toggle: 5 Stufen wählbar
[ ] Quiet Hours persistiert
[ ] Avatar-States animieren korrekt (Framer Motion)
[ ] buddy.lumeos.app SSO mit app.lumeos.app
[ ] prefers-reduced-motion: alle Animationen deaktiviert
```
