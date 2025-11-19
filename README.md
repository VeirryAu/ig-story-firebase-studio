# Fore Coffee Year Recap - Interactive Story Viewer

An Instagram Stories-like interactive year recap application built with Next.js, featuring dynamic content, background music, video playback, and offline support.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Configuration](#configuration)
- [Development Guide](#development-guide)
- [Component Documentation](#component-documentation)
- [Data Structure](#data-structure)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Documentation Index](#documentation-index)
- [Contributing](#contributing)

## 🎯 Overview

This project is an interactive year-end recap experience for Fore Coffee customers. It displays personalized statistics, achievements, and highlights in a story format similar to Instagram Stories. The application is designed to run in native Android and iOS WebView environments and supports:

- **Dynamic Content**: Personalized data from server responses
- **Background Music**: Continuous audio playback across slides
- **Video Support**: Full-screen video playback on the final slide
- **Offline Support**: Service Worker for caching assets
- **Responsive Design**: Mobile-first approach (mobile-only view)
- **Share Functionality**: Screenshot and share to native apps
- **Native Bridge Integration**: Communication with Android/iOS native apps
- **Authentication**: Header-based authentication for production
- **Date Restriction**: Accessible until December 31, 2025 (production)

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Audio/Video**: HTML5 Audio/Video APIs
- **Offline Support**: Service Worker
- **Screenshot**: html2canvas (for share functionality)
- **Deployment**: Firebase App Hosting
- **Target Platform**: Android/iOS WebView

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd forecap-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

   **Note**: The screenshot functionality requires `html2canvas`. Install it separately:
   ```bash
   npm install html2canvas @types/html2canvas
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

### Build for Production

**Standard Production Build** (requires authentication):
```bash
npm run build
npm start
```

**Production Build with Dev Mode** (for developer testing on S3):
```bash
npm run build:prod-dev
```

This creates a production-optimized build that allows developers to enable dev features via:
- URL parameter: `?dev=true`
- LocalStorage: `localStorage.setItem('dev_mode', 'true')`
- Environment variable: `NEXT_PUBLIC_ENABLE_DEV_MODE=true` (set at build time)

See [docs/build-for-s3-with-dev.md](docs/build-for-s3-with-dev.md) for detailed instructions.

## 📁 Project Structure

```
forecap-2025/
├── public/
│   └── stories-asset/          # Static assets (images, videos, audio)
│       ├── main/               # Main assets (logo, background music)
│       ├── slides01-13/        # Slide-specific assets
│       └── ...
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main entry point
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── screens/            # Screen components (screen-1.tsx, etc.)
│   │   ├── story-viewer.tsx   # Main story viewer component
│   │   ├── story-progress-bar.tsx
│   │   ├── share-button.tsx   # Reusable share button
│   │   └── ui/                # Reusable UI components
│   ├── hooks/
│   │   ├── use-background-music.ts  # Background music hook
│   │   ├── use-audio-preload.ts
│   │   └── use-video-preload.ts
│   ├── lib/
│   │   ├── const.json         # Configuration constants
│   │   ├── story-data.tsx     # Story slide definitions
│   │   ├── native-bridge.ts   # Native bridge utilities (Android/iOS)
│   │   ├── screenshot.ts      # Screenshot capture utilities
│   │   └── auth.ts           # Authentication & date restriction
│   └── types/
│       ├── server.ts          # ServerResponse interface
│       └── story.ts           # Story/Slide interfaces
├── public/sw.js               # Service Worker for offline support
└── docs/                      # Additional documentation
```

## ✨ Key Features

### 1. Dynamic Story Slides

The application displays 14 different slides with dynamic content:

- **Screen 1**: Welcome screen with user name
- **Screen 2**: Transaction count display (with conditional rendering for zero transactions)
- **Screen 3**: Favorite products list
- **Screen 4**: User persona based on variant count
- **Screen 5**: Points and redeemable items
- **Screen 6**: Time-based persona (Daybreak Catcher, Sun Chaser, Twilight Seeker)
- **Screen 7**: Favorite stores bar graph
- **Screen 8-9**: Delivery/Pickup statistics
- **Screen 10**: MyFore Plan savings
- **Screen 11**: Year summary recap
- **Screen 12**: Motivational message with animated images
- **Screen 13**: Final video showcase

### 2. Background Music

- Continuous playback across all slides
- Auto-unmute on video slide (screen-13) when first reached
- Progressive loading for faster initial load
- Offline support with Service Worker caching
- User interaction unlock for autoplay policies

### 3. Video Playback

- Multiple video format support (AV1, WebM, H.264)
- Full-screen display on screen-13
- Auto-play functionality
- Fallback handling for autoplay restrictions
- Video continues playing on last slide without restarting
- No next navigation on last slide (prevents video interruption)

### 4. Offline Support

- Service Worker caches all assets
- Progressive media loading with Range request support
- Works offline after first visit

### 5. Native Bridge Integration

- **Close WebView**: Closes the native WebView container
- **Share Screenshot**: Captures current slide and shares via native share sheet
- **Analytics Tracking**: Sends events to native app (`track()` function)
- **Deeplink Handling**: Navigates to native app screens (`handleDeeplink()` function)
- **Platform Support**: Android (via `AndroidBridge`) and iOS (via `webkit.messageHandlers`)

### 6. Share Functionality

- **Regular Slides (screen-2 to screen-12)**: Share button captures screenshot of current slide (excluding navigation buttons) and shares via native app
- **Last Slide (screen-13)**: Share button opens modal to choose which slide (screen-1 to screen-13) to share
- Screenshots exclude navigation buttons, progress bar, and UI controls
- Uses `html2canvas` library for high-quality screenshot capture

### 7. Fullscreen Mode

- Access specific slides directly via URL parameter: `?fullscreen=screen-01` (or `screen-1`, `screen-02`, etc.)
- Navigation buttons are hidden in fullscreen mode
- Useful for displaying individual slides in native app contexts

### 8. Authentication & Security

- **Production Authentication**: Requires headers (`timestamp`, `user_id`, `sign`)
- **Signature Validation**: `sign = base64(timestamp + user_id)` (if `AUTH_SIGNATURE_SECRET` is set, the backend expects `base64(timestamp + SECRET + user_id)`)
- **Timestamp Validation**: Must be within 10 minutes of current time
- **Date Restriction**: Only accessible until December 31, 2025 (production only)
- **Development Mode**: Authentication and date restrictions are bypassed

## ⚙️ Configuration

### `src/lib/const.json`

Main configuration file for the application:

```json
{
  "slideDuration": 10000,           // Duration per slide in milliseconds
  "backgroundMusic": "/stories-asset/main/sunset-in-bali-audio.aac",
  "devPauseOnSlide": null,          // Pause on specific slide (dev only)
  "devMaxSlide": null,              // Limit to specific slide index (dev only)
  "devTrxCount": 100                // Mock transaction count (dev only)
}
```

### Development-Only Features

- **`devPauseOnSlide`**: Pauses the story at a specific slide index (useful for testing)
- **`devMaxSlide`**: Limits the story to show only up to a specific slide index
- **`devTrxCount`**: Sets a mock transaction count for development

**Note**: These features only work in development mode (`NODE_ENV === 'development'`).

## 👨‍💻 Development Guide

### Adding a New Screen

1. **Create the screen component** in `src/components/screens/`:
   ```typescript
   // screen-X.tsx
   "use client";
   
   import type { ServerResponse } from "@/types/server";
   
   interface ScreenXProps {
     serverResponse?: ServerResponse;
   }
   
   export function ScreenX({ serverResponse }: ScreenXProps) {
     return (
       <div className="relative w-full h-full">
         {/* Your screen content */}
       </div>
     );
   }
   ```

2. **Add to story data** in `src/lib/story-data.tsx`:
   ```typescript
   {
     id: 'screen-X',
     type: 'component',
     duration: config.slideDuration,
     alt: 'Screen description',
     component: <ScreenX />,
   }
   ```

3. **Pass serverResponse** in `src/components/story-viewer.tsx`:
   ```typescript
   : slide.id === 'screen-X' && serverResponse
   ? React.cloneElement(slide.component as React.ReactElement, { serverResponse })
   ```

4. **Add Share Button** (if needed):
   ```typescript
   currentSlide?.id === 'screen-X' || // Add to the condition
   ```

### Modifying Screen Content

Each screen component receives `serverResponse` as a prop. Check `src/types/server.ts` for available data fields.

### Adding Assets

1. Place assets in `public/stories-asset/` organized by slide number
2. Reference them using absolute paths: `/stories-asset/slidesXX/asset-name.ext`
3. Add to preload list in `src/app/page.tsx` if needed for immediate display

### Audio Optimization

See `docs/audio-optimization.md` for FFmpeg commands to compress audio files.

### API Documentation

See `docs/api/README.md` for OpenAPI/Swagger API documentation. The API contract is defined in `docs/api/openapi.yaml`.

## 📚 Component Documentation

### StoryViewer

Main component that manages the story experience.

**Props:**
- `stories: Story[]` - Array of story objects
- `initialStoryIndex?: number` - Starting story index
- `onClose: () => void` - Callback when user closes stories
- `serverResponse?: ServerResponse` - Dynamic data from server
- `fullscreenSlide?: string` - Slide ID for fullscreen mode (e.g., "screen-01")

**Features:**
- Slide navigation (next/prev, keyboard, touch)
- Progress bar with auto-advance (disabled on last slide)
- Background music management
- Video playback control
- Mute/unmute functionality
- Last slide protection (no next navigation, video doesn't restart)
- Event propagation prevention for video stability
- Native bridge integration (close, share, track, deeplink)
- Fullscreen mode support (hides navigation)
- Share modal for last slide

### Screen Components

All screen components follow a similar pattern:

- Located in `src/components/screens/`
- Accept `serverResponse` prop (optional)
- Use Tailwind CSS for styling
- Support responsive design (mobile-first)

**Key Screens:**

- **Screen1**: Welcome screen with user name
- **Screen2**: Transaction count (conditional: `screen-2-notrx.tsx` for zero transactions)
- **Screen3**: Favorite products with rankings
- **Screen4**: User persona based on variant count
- **Screen5**: Points display with redeemable items
- **Screen6**: Time-based persona (3 conditions)
- **Screen7**: Favorite stores vertical bar graph
- **Screen8-9**: Delivery/Pickup stats (reusable component)
- **Screen10**: MyFore Plan savings with ranking
- **Screen11**: Year summary with background image
- **Screen12**: Motivational message with animated images
- **Screen13**: Video showcase (final slide, no next navigation)

### ShareButton

Reusable share button component.

**Location**: `src/components/share-button.tsx`

**Props:**
- `onClick?: () => void` - Click handler

**Features:**
- Black background with white text/icon
- Positioned at bottom center
- Prevents event propagation to avoid navigation conflicts

### ShareModal

Modal component for selecting which slide to share (used on last slide).

**Location**: `src/components/share-modal.tsx`

**Props:**
- `isOpen: boolean` - Whether modal is open
- `onClose: () => void` - Close handler
- `slides: Array<{ id: string; label: string }>` - List of available slides
- `onCaptureSlide: (slideId: string) => Promise<string>` - Function to capture and return image URL

**Features:**
- Lists all slides (screen-1 to screen-13)
- Captures screenshot of selected slide
- Shares via native bridge `shareImageUrl()`

### Native Bridge Utilities

Functions to communicate with Android and iOS native apps.

**Location**: `src/lib/native-bridge.ts`

**Available Functions:**
- `closeWebView()` - Closes the WebView in native app
- `shareImageUrl(url: string)` - Shares image URL to native app for sharing
- `track(eventName: string, eventValue: string)` - Sends analytics event to native app
- `handleDeeplink(deeplinkUrl: string)` - Handles deeplink navigation in native app

**Platform Support:**
- **Android**: Uses `window.AndroidBridge` object
- **iOS**: Uses `window.webkit.messageHandlers` object
- **Fallback**: Logs to console in development mode

**Usage in Screen Components:**
```typescript
import { track, handleDeeplink } from '@/lib/native-bridge';

// Track an event
track('screen_viewed', 'screen-5');

// Handle deeplink
handleDeeplink('forecoffee://product/123');
```

### Screenshot Utilities

Functions to capture screenshots of slides.

**Location**: `src/lib/screenshot.ts`

**Available Functions:**
- `captureScreenshot(element?, excludeSelectors?)` - Captures screenshot, returns base64 data URL
- `captureScreenshotAsBlobUrl(element?)` - Captures screenshot, returns blob URL

**Features:**
- Excludes navigation buttons, progress bar, and UI controls by default
- Uses `html2canvas` library for high-quality capture
- Returns blob URL suitable for sharing

### Authentication Utilities

Functions for authentication and access control.

**Location**: `src/lib/auth.ts`

**Available Functions:**
- `validateAuthHeaders(headers)` - Validates authentication headers
- `checkDateRestriction()` - Checks if current date is before expiration
- `validateAccess(headers?)` - Validates both authentication and date restriction

**Authentication Headers (Production):**
- `timestamp`: ISO 8601 format (e.g., "2025-11-10T20:00:00.000Z")
- `user_id`: Integer user ID
- `sign`: Base64 encoded signature = `base64(timestamp + user_id)` (or `base64(timestamp + SECRET + user_id)` if `AUTH_SIGNATURE_SECRET` is configured)

**Date Restriction:**
- Content is only accessible until December 31, 2025 (production)
- Date restriction is bypassed in development mode

### Hooks

#### `useBackgroundMusic`

Manages background music playback.

**Location**: `src/hooks/use-background-music.ts`

**Returns:**
- `isReady: boolean` - Whether audio is ready
- `isPlaying: boolean` - Whether audio is playing
- `playAudio: () => void` - Function to force play audio

**Features:**
- Progressive loading
- Continuous playback across slides (doesn't restart)
- User interaction unlock for autoplay policies
- Auto-unmute on video slide (screen-13) when first reached

## 📊 Data Structure

### ServerResponse

Interface for server-provided data (`src/types/server.ts`):

```typescript
interface ServerResponse {
  userName: string;
  trxCount: number;
  listProductFavorite?: ProductFavorite[];
  variantCount?: number;
  totalPoint?: number;
  totalPointDescription?: string;
  totalPointPossibleRedeem?: number;
  totalPointImage?: string;
  listFavoriteStore?: FavoriteStore[];
  deliveryCount?: number;
  pickupCount?: number;
  cheaperSubsDesc?: string;
  cheaperSubsAmount?: number;
  topRanking?: number;
  listCircularImages?: string[];
}
```

### Story Data

Stories are defined in `src/lib/story-data.tsx`:

```typescript
interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  slides: Slide[];
}

interface Slide {
  id: string;
  type: 'image' | 'video' | 'component';
  url?: string;
  component?: ReactNode;
  duration: number;
  alt: string;
}
```

## 🔧 Common Tasks

### Testing with Limited Slides

Set in `src/lib/const.json`:
```json
{
  "devMaxSlide": 2  // Only show first 3 slides (0-indexed)
}
```

### Testing Zero Transactions

Set in `src/lib/const.json`:
```json
{
  "devTrxCount": 0  // Shows screen-2-notrx instead of screen-2
}
```

### Pausing on a Specific Slide

Set in `src/lib/const.json`:
```json
{
  "devPauseOnSlide": 5  // Pauses on slide index 5
}
```

### Adding Preload Images

In `src/app/page.tsx`, add to the `imageUrls` array:
```typescript
imageUrls.push('/stories-asset/path/to/image.png');
```

### Modifying Slide Duration

Update `src/lib/const.json`:
```json
{
  "slideDuration": 8000  // 8 seconds per slide
}
```

### Using Fullscreen Mode

Access a specific slide directly without navigation:
```
https://your-domain.com/?fullscreen=screen-01
https://your-domain.com/?fullscreen=screen-1
https://your-domain.com/?fullscreen=screen-13
```

Navigation buttons will be hidden in fullscreen mode.

### Using Native Bridge Functions

In any screen component, you can use native bridge functions:

```typescript
import { track, handleDeeplink } from '@/lib/native-bridge';

export function Screen5({ serverResponse }: Screen5Props) {
  useEffect(() => {
    // Track when screen is viewed
    track('screen_viewed', 'screen-5');
  }, []);

  const handleButtonClick = () => {
    // Navigate to product page in native app
    handleDeeplink('forecoffee://product/123');
  };

  return (
    <div>
      {/* Screen content */}
    </div>
  );
}
```

### Production Authentication Setup

For production, the native app must pass authentication headers:

**Android Example:**
```kotlin
webView.loadUrl("https://your-domain.com", mapOf(
    "timestamp" to "2025-11-10T20:00:00.000Z",
    "user_id" to "12345",
    "sign" to Base64.encode("2025-11-10T20:00:00.000Z12345")
))
```

**iOS Example:**
```swift
var request = URLRequest(url: URL(string: "https://your-domain.com")!)
request.setValue("2025-11-10T20:00:00.000Z", forHTTPHeaderField: "timestamp")
request.setValue("12345", forHTTPHeaderField: "user_id")
request.setValue(base64Signature, forHTTPHeaderField: "sign")
webView.load(request)
```

**Note**: In Next.js client-side, headers must be passed via URL parameters or postMessage, as request headers are not accessible client-side.

## 🐛 Troubleshooting

### Audio Not Playing

1. **Check browser autoplay policies**: Some browsers block autoplay. The app handles this with user interaction unlock.
2. **Check audio file format**: Ensure AAC format is used for best compatibility.
3. **Check Service Worker**: Clear cache and reload if audio was cached incorrectly.

### Video Not Full Screen

1. Ensure video element has `absolute inset-0` classes
2. Check parent container has `relative` positioning
3. Verify `object-cover` class is applied
4. Check that video is on screen-13 (final slide)

### Video Restarting on Last Slide

1. **Check navigation**: Next button and tap zone should be hidden on last slide
2. **Check event handlers**: `handlePointerDown` and `handlePointerUp` should return early on last slide
3. **Check event propagation**: Next tap zone should use `stopPropagation()` to prevent bubbling
4. **Verify `goToNextSlide` guard**: Function should return early if `isLastSlide` is true

### Images Not Loading

1. Check file paths are correct (absolute paths from `/public`)
2. Verify images are in `public/stories-asset/`
3. Check browser console for 404 errors
4. Ensure images are added to preload list if needed immediately

### Service Worker Issues

1. **Clear cache**: Open DevTools > Application > Clear Storage
2. **Unregister Service Worker**: Application > Service Workers > Unregister
3. **Hard Reload**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Development Mode Issues

- Ensure `NODE_ENV` is set to `development` for dev-only features
- Check `const.json` values are valid
- Verify TypeScript types are correct

### Screenshot Not Working

1. **Check html2canvas installation**: Ensure `html2canvas` is installed:
   ```bash
   npm install html2canvas @types/html2canvas
   ```
2. **Check browser console**: Look for errors related to html2canvas
3. **Check CORS**: Ensure images are from same origin or have proper CORS headers
4. **Check element visibility**: Element must be visible in DOM to capture

### Native Bridge Not Working

1. **Check platform**: Verify you're testing in actual WebView (not browser)
2. **Check bridge setup**: Ensure native app has properly set up `AndroidBridge` or `webkit.messageHandlers`
3. **Check console logs**: Native bridge functions log to console in development mode
4. **Verify function names**: Function names must match exactly (`closeWebView`, `shareImageUrl`, etc.)

### Authentication Errors

1. **Check timestamp format**: Must be ISO 8601 format
2. **Check timestamp validity**: Must be within 10 minutes of current time
3. **Check signature**: Verify signature calculation matches: `base64(timestamp + user_id)` (or `base64(timestamp + SECRET + user_id)` if configured)
4. **Check environment**: Authentication is only enforced in production mode

### Date Restriction Errors

1. **Check current date**: Content is only accessible until December 31, 2025
2. **Check environment**: Date restriction is bypassed in development mode
3. **Verify server time**: Ensure server/client time is synchronized

## 📚 Documentation

### Complete Documentation Book

**[📖 Read the Complete Documentation Book](./docs/BOOK.md)**

A comprehensive, book-style guide covering:
- **Part I**: Introduction & Architecture
- **Part II**: Frontend Development
- **Part III**: Backend Development
- **Part IV**: Deployment (Local, Docker, EC2, Fargate)
- **Part V**: Performance & Monitoring
- **Part VI**: Operations & Troubleshooting

### Quick Links

- **[Deployment Guide](./docs/deployment-guide.md)** - Step-by-step deployment instructions
- **[Data Import Guide](./docs/import-data-guide.md)** - Import Excel data to MySQL
- **[Load Testing Guide](./backend/load-test/README.md)** - Performance testing with K6/Artillery
- **[Realistic Load Testing](./docs/realistic-load-testing.md)** - EC2 t3.medium with 10M users
- **[Monitoring Setup](./monitoring/README.md)** - Prometheus + Grafana monitoring
- **[Backend README](./backend/README.md)** - NestJS backend documentation
- **[API Specification](./docs/api/openapi.yaml)** - OpenAPI/Swagger documentation

## 🤝 Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Use Tailwind CSS for styling
- Add JSDoc comments for complex functions
- Keep components focused and reusable

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly (including mobile devices)
4. Update documentation if needed
5. Submit a pull request

### Pull Request Guidelines

- **Title**: Clear description of changes
- **Description**: Explain what and why
- **Testing**: Describe how you tested
- **Screenshots**: Include for UI changes
- **Breaking Changes**: Clearly mark if any

### Before Submitting

- [ ] Code follows project patterns
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Tested on mobile and desktop
- [ ] Documentation updated if needed
- [ ] No sensitive data committed

## 📝 Additional Notes

### Last Slide Behavior

On the final slide (screen-13, video slide):
- **No next navigation**: Next button, next tap zone, and right arrow key are disabled
- **Video protection**: Video continues playing without restarting when clicking/touching
- **Event handling**: Pointer events are prevented from triggering video pause/resume
- **Progress bar**: Auto-advance is disabled (no-op function)
- **Previous navigation**: Still available to go back
- **Share button**: Opens modal to choose which slide to share (screen-1 to screen-13)

This ensures the video plays continuously without interruption on the final slide.

### Native App Integration

This application is designed to run in Android and iOS WebView environments. The native apps must:

1. **Set up JavaScript bridges**:
   - Android: Expose `AndroidBridge` object with methods
   - iOS: Set up `webkit.messageHandlers` for each function

2. **Handle authentication** (production):
   - Pass `timestamp`, `user_id`, and `sign` headers
   - Ensure timestamp is within 10 minutes of current time
   - Calculate signature: `base64(timestamp + user_id)` (append the same secret if `AUTH_SIGNATURE_SECRET` is set)

3. **Handle share functionality**:
   - Receive image URL from `shareImageUrl()` call
   - Display native share sheet with the image
   - Handle share completion/cancellation

4. **Handle analytics**:
   - Receive events from `track()` calls
   - Forward to analytics service (Firebase, Mixpanel, etc.)

5. **Handle deeplinks**:
   - Receive deeplink URL from `handleDeeplink()` call
   - Navigate to appropriate screen in native app

### Track and Deeplink Functions

The `track()` and `handleDeeplink()` functions are available for use in screen components. Detailed implementation and event naming conventions will be discussed separately.

**Example Usage:**
```typescript
// Track screen view
track('screen_viewed', 'screen-5');

// Track user interaction
track('button_clicked', 'share_button');

// Navigate to product
handleDeeplink('forecoffee://product/123');

// Navigate to store
handleDeeplink('forecoffee://store/456');
```

### Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Features**: Service Worker requires HTTPS (except localhost)

### Performance

- Images are preloaded before story starts
- Audio uses progressive loading
- Videos support multiple formats for compatibility
- Service Worker caches assets for offline use

### Accessibility

- Keyboard navigation (Arrow keys, Space, Escape)
- ARIA labels on interactive elements
- Focus management
- Screen reader friendly where applicable

## 📄 License

[Add your license information here]

## 👥 Team

[Add team information here]

## 📞 Support

For questions or issues, please:
1. Check this README
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy Coding! ☕**
