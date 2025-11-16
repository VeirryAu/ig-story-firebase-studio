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
- [Contributing](#contributing)

## 🎯 Overview

This project is an interactive year-end recap experience for Fore Coffee customers. It displays personalized statistics, achievements, and highlights in a story format similar to Instagram Stories. The application supports:

- **Dynamic Content**: Personalized data from server responses
- **Background Music**: Continuous audio playback across slides
- **Video Support**: Full-screen video playback on the final slide
- **Offline Support**: Service Worker for caching assets
- **Responsive Design**: Mobile-first approach with desktop support
- **Share Functionality**: Share button on multiple slides

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Audio/Video**: HTML5 Audio/Video APIs
- **Offline Support**: Service Worker
- **Deployment**: Firebase App Hosting

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

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

### Build for Production

```bash
npm run build
npm start
```

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
│   │   └── story-data.tsx     # Story slide definitions
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

## 📚 Component Documentation

### StoryViewer

Main component that manages the story experience.

**Props:**
- `stories: Story[]` - Array of story objects
- `initialStoryIndex?: number` - Starting story index
- `onClose: () => void` - Callback when user closes stories
- `serverResponse?: ServerResponse` - Dynamic data from server

**Features:**
- Slide navigation (next/prev, keyboard, touch)
- Progress bar with auto-advance (disabled on last slide)
- Background music management
- Video playback control
- Mute/unmute functionality
- Last slide protection (no next navigation, video doesn't restart)
- Event propagation prevention for video stability

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

This ensures the video plays continuously without interruption on the final slide.

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
