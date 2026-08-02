# Buddy Floating Widget (B13)

## Overview

The Buddy Floating Widget is an always-accessible mini command center that provides quick access to health metrics, smart actions, and instant coach responses without navigating away from the current page.

**Status:** ✅ Complete  
**Estimated Effort:** 4h  
**Priority:** P3  
**Dependencies:** B1 (Daily Command Center), B2 (Action Cards)

---

## Features

### 🎯 Core Functionality

1. **Floating Chat Bubble**
   - Draggable positioning (remembers location)
   - Status-based emoji indicator
   - Notification badge for alerts
   - Smooth animations and hover effects
   - Mobile-responsive design

2. **Mini Command Center**
   - Quick stats overview (calories, protein, training)
   - Three-tab interface:
     - 📊 **Overview:** Key metrics and quick actions
     - ⚡ **Actions:** Smart action cards with priority
     - 💬 **Commands:** Instant AI responses

3. **Smart Action Cards**
   - AI-powered recommendations based on current state
   - Urgent vs. recommended priority levels
   - Context-aware suggestions (time of day, goals, deficits)
   - One-click navigation to relevant modules

4. **Real-time Updates**
   - Auto-refresh every 5 minutes
   - Live status indicators
   - Notification badge counts
   - Timestamp of last update

---

## Component Architecture

```
BuddyFloatingWidget.tsx
├── Minimized Bubble
│   ├── Status emoji indicator
│   ├── Notification badge
│   └── Quick stats tooltip
└── Expanded Panel
    ├── Header (draggable)
    ├── Tab Navigation
    ├── MiniCommandCenter
    │   ├── Overview Tab
    │   ├── Actions Tab (ActionCardsView)
    │   └── Commands Tab (QuickCommandsView)
    └── Footer (live timestamp, refresh)
```

### Hooks

- **`useBuddyQuickStats`**: Fetches nutrition, training, recovery stats
- **`useQuickCommands`**: Executes instant AI commands without chat
- **`useSmartActions`**: Generates context-aware action cards

---

## Usage

### Integration

The widget is automatically rendered in `App.tsx`:

```tsx
<BuddyFloatingWidget onNavigate={handleNavigate} />
```

### Navigation

The widget can navigate to any app section:

```tsx
onNavigate('diary')        // Opens nutrition diary
onNavigate('training')     // Opens training module
onNavigate('goals')        // Opens goals module
```

---

## Smart Actions Logic

Actions are generated based on:

### 1. Nutrition State
- **Critical Protein Deficit** (< 60%): Urgent reminder
- **Warning Protein** (60-80%): Recommended action
- **Calories Over** (> 110%): Warning
- **Meal Logging** (< 50% calories + afternoon): Suggestion

### 2. Training Context
- **Training Reminder** (4-8 PM, no workout logged)
- **Pre-Workout Prep** (4-6 PM, training scheduled)

### 3. Recovery Optimization
- **Sleep Prep** (9-11 PM): Evening wind-down
- **Recovery Check-in** (6-10 AM): Morning assessment

### 4. Supplement Timing
- **Morning Stack** (7-11 AM): Vitamin D, Omega-3

### 5. Goal Alignment
- **Weekly Review** (Sundays): Progress check
- **Goal Realignment** (if off-track): Urgent adjustment

---

## Visual Design

### Status Indicators

| Status      | Emoji | Color   | Badge |
|-------------|-------|---------|-------|
| On Track    | 💪    | Green   | None  |
| Warning     | ⚠️    | Yellow  | 1-2   |
| Off Track   | 🔥    | Red     | 3+    |
| Loading     | ⏳    | Gray    | None  |

### Animations

- **Bubble Pulse**: 2s loop for warnings
- **Badge Pulse**: 2s loop for notifications
- **Expand Animation**: 0.3s slide-up
- **Hover Effect**: Scale + shadow transition

### Responsive Breakpoints

```css
Mobile:  < 640px  → bottom: 70px, smaller panel
Tablet:  641-1024px → bottom: 80px
Desktop: > 1024px → bottom: 80px, full width
```

---

## Performance

### Optimization Strategies

1. **Memoization**: Actions cached until stats change
2. **Lazy Updates**: 5-minute auto-refresh interval
3. **LocalStorage**: Position and state persistence
4. **Conditional Rendering**: Only active tab renders
5. **Debounced Drag**: No transitions while dragging

### Bundle Impact

- Component size: ~15KB (gzipped)
- Hooks: ~5KB
- No additional dependencies

---

## Testing

### Unit Tests

```bash
npm test -- BuddyFloatingWidget.test.tsx
```

**Coverage:**
- ✅ Minimized bubble rendering
- ✅ Expand/collapse functionality
- ✅ Notification badge logic
- ✅ Tab switching
- ✅ LocalStorage persistence
- ✅ Drag positioning

### Visual Tests

```bash
npm run test:visual
```

**Snapshots:**
- Minimized bubble
- Expanded panel (all tabs)
- Mobile/tablet responsive
- Drag and drop
- Animations (expand, hover, pulse)

---

## API Integration

### Endpoints Used

```
GET /api/nutrition/summary?date=YYYY-MM-DD
GET /api/nutrition/targets
GET /api/nutrition/meals?date=YYYY-MM-DD
GET /api/training/workouts?date=YYYY-MM-DD
GET /api/coach/buddy-data/training
GET /api/coach/buddy-data/recovery
GET /api/coach/buddy-data/goal
GET /api/coach/buddy-data/complete
GET /api/supplements/schedule?date=YYYY-MM-DD
```

---

## Future Enhancements

### Phase 2 (Post-Launch)

1. **Voice Interaction**
   - Speech-to-text for quick logging
   - Audio responses for commands

2. **Advanced Analytics**
   - Trend predictions
   - Anomaly detection
   - Personalized insights

3. **Social Features**
   - Coach direct messaging
   - Community challenges

4. **Wearable Integration**
   - Real-time heart rate
   - Sleep data sync
   - Activity tracking

### Phase 3 (Long-term)

1. **AI Coaching Proactivity**
   - Predictive suggestions
   - Pre-emptive interventions
   - Adaptive learning from user behavior

2. **Multi-device Sync**
   - Cross-device widget state
   - Notification relay

---

## Troubleshooting

### Common Issues

**Widget not appearing:**
- Check z-index conflicts
- Verify `BuddyErrorBoundary` wrapper
- Confirm stats API responses

**Position resets on reload:**
- Check localStorage availability
- Verify key names match
- Test in incognito mode

**Drag not working on mobile:**
- Ensure `touchAction: 'none'`
- Check touch event listeners
- Verify passive flag settings

**Stats not updating:**
- Check network tab for API calls
- Verify refetch() is called
- Test auto-refresh interval

---

## Accessibility

- **Keyboard Navigation**: Tab, Enter, Escape support
- **Screen Reader**: ARIA labels on all interactive elements
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible focus states

---

## Related Documentation

- [Daily Command Center (B1)](./DAILY_COMMAND_CENTER.md)
- [Action Cards (B2)](./ACTION_CARDS.md)
- [Buddy API](../api/BUDDY_API.md)
- [Smart Actions Hook](../hooks/SMART_ACTIONS.md)

---

## Changelog

**v1.0.0** (2026-03-21)
- ✅ Initial implementation
- ✅ Three-tab interface (Overview, Actions, Commands)
- ✅ Smart action cards with priority
- ✅ Real-time stats updates
- ✅ Mobile-responsive design
- ✅ Drag & drop positioning
- ✅ Notification badges
- ✅ Visual tests suite
- ✅ Performance optimizations
