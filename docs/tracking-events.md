# Tracking Events - Complete List

This document lists all `track()` function calls that send analytics events to the mobile app.

## Function Signature

```typescript
track(eventName: string, eventValue: string): void
```

**Location**: `src/lib/native-bridge.ts`

**Platforms**:
- Android: `AndroidBridge.track(eventName, eventValue)`
- iOS: `webkit.messageHandlers.track.postMessage({ eventName, eventValue })`
- Browser (dev mode): Console log only

---

## All Tracking Events

### 1. Banner Event

**Event Name**: `banner`  
**Event Value**: `'happy'` or `'sad'`  
**Location**: `src/components/story-viewer.tsx:361`

**When**: Triggered when the first slide (index 0) loads for the first time.

**Logic**:
```typescript
const eventValue = (serverResponse.trxCount || 0) > 0 ? 'happy' : 'sad';
track('banner', eventValue);
```

**Values**:
- `'happy'`: User has transactions (trxCount > 0)
- `'sad'`: User has no transactions (trxCount === 0)

**Frequency**: Once per session (tracked with `hasTrackedBannerRef`)

---

### 2. Final Summary Slide - Happy

**Event Name**: `finalSummarySlideHappy`  
**Event Value**: `'viewed'`  
**Location**: `src/components/story-viewer.tsx:372`

**When**: User reaches the last slide AND has transactions (trxCount > 0).

**Logic**:
```typescript
if (isLastSlide && trxCount > 0) {
  track('finalSummarySlideHappy', 'viewed');
}
```

**Frequency**: Once per session (tracked with `hasTrackedFinalSummaryRef`)

---

### 3. Final Summary Slide - Sad

**Event Name**: `finalSummarySlideSad`  
**Event Value**: `'viewed'`  
**Location**: `src/components/story-viewer.tsx:374`

**When**: User reaches the last slide AND has no transactions (trxCount === 0).

**Logic**:
```typescript
if (isLastSlide && trxCount === 0) {
  track('finalSummarySlideSad', 'viewed');
}
```

**Frequency**: Once per session (tracked with `hasTrackedFinalSummaryRef`)

---

### 4. In-Place Share

**Event Name**: `in_place`  
**Event Value**: Screen name (e.g., `'screen-1'`, `'screen-2'`, etc.)  
**Location**: `src/components/story-viewer.tsx:733`

**When**: User clicks the share button on any slide (except fullscreen mode).

**Logic**:
```typescript
const screenName = getScreenName(currentSlide.id);
track('in_place', screenName);
```

**Event Value Examples**:
- `'screen-1'` - Welcome screen
- `'screen-2'` - Total cups screen
- `'screen-3'` - Favorite products
- `'screen-13'` - Video greeting
- etc.

**Frequency**: Every time user clicks share button (not the share modal)

---

### 5. Screen Picker Share

**Event Name**: `screen_picker`  
**Event Value**: Screen name (e.g., `'screen-1'`, `'screen-2'`, etc.)  
**Location**: `src/components/story-viewer.tsx:776`

**When**: User selects a specific slide from the share modal (screen-13 picker).

**Logic**:
```typescript
const screenName = getScreenName(slideId);
track('screen_picker', screenName);
```

**Event Value Examples**:
- `'screen-1'` through `'screen-13'` - The selected slide ID

**Frequency**: Every time user selects a slide from the share modal

---

### 6. Invite Shopping (Deeplink)

**Event Name**: `inviteShopping`  
**Event Value**: `'deeplink'`  
**Location**: `src/components/story-viewer.tsx:1026`

**When**: User clicks the "Belanja Sekarang" (Shop Now) button on screen-2 when trxCount === 0.

**Logic**:
```typescript
track('inviteShopping', 'deeplink');
// TODO: Add navigation to shop page via handleDeeplink
```

**Note**: Currently only tracks the event. Deeplink navigation is not yet implemented (see TODO comment).

**Frequency**: Every time user clicks "Belanja Sekarang" button

---

## Summary Table

| Event Name | Event Value | Trigger | Frequency | Location |
|------------|-------------|---------|-----------|----------|
| `banner` | `'happy'` or `'sad'` | First slide loads | Once per session | story-viewer.tsx:361 |
| `finalSummarySlideHappy` | `'viewed'` | Last slide + has transactions | Once per session | story-viewer.tsx:372 |
| `finalSummarySlideSad` | `'viewed'` | Last slide + no transactions | Once per session | story-viewer.tsx:374 |
| `in_place` | Screen name (e.g., `'screen-1'`) | Share button clicked | Every click | story-viewer.tsx:733 |
| `screen_picker` | Screen name (e.g., `'screen-1'`) | Slide selected from modal | Every selection | story-viewer.tsx:776 |
| `inviteShopping` | `'deeplink'` | "Belanja Sekarang" button clicked | Every click | story-viewer.tsx:1026 |

---

## Event Flow

### Session Start
1. User opens story → `track('banner', 'happy'|'sad')` (once)

### During Story
2. User clicks share button → `track('in_place', screenName)` (every click)
3. User selects slide from modal → `track('screen_picker', screenName)` (every selection)
4. User clicks "Belanja Sekarang" → `track('inviteShopping', 'deeplink')` (every click)

### Session End
5. User reaches last slide → `track('finalSummarySlideHappy'|'finalSummarySlideSad', 'viewed')` (once)

---

## Implementation Details

### Tracking Prevention (Refs)

Some events use refs to prevent duplicate tracking:
- `hasTrackedBannerRef`: Prevents multiple `banner` events
- `hasTrackedFinalSummaryRef`: Prevents multiple final summary events

### Screen Name Mapping

The `getScreenName()` function converts slide IDs to screen names:
- Input: `'screen-1'`, `'screen-2'`, etc.
- Output: Same format (used as event value)

### Conditional Tracking

Some events are conditional:
- `banner`: Based on `trxCount > 0`
- `finalSummarySlideHappy` vs `finalSummarySlideSad`: Based on `trxCount > 0`

---

## Testing

In development mode, all `track()` calls are logged to console:
```
[NativeBridge] track() called: { eventName: 'banner', eventValue: 'happy' }
```

To test tracking:
1. Open browser console
2. Navigate through story
3. Check console logs for tracking events
4. Verify events match expected behavior

---

## Notes

- All events are sent to native app via `AndroidBridge` (Android) or `webkit.messageHandlers` (iOS)
- In browser/dev mode, events are only logged to console
- No events are sent to external analytics services (handled by native app)
- Event values are always strings (even numeric values like screen numbers)

---

**Last Updated**: December 2024  
**Total Events**: 6 unique event names

