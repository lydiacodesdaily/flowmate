# FlowMate Monorepo Setup - Complete ✓

## What Was Done

### 1. Directory Restructure
- Created `apps/` directory for platform-specific apps
- Created `packages/` directory for shared code
- Moved existing Next.js app to `apps/web/`
- Set up `packages/shared/` for cross-platform code

### 2. Package Configuration
- **Root `package.json`**: npm workspaces configuration
- **`apps/web/package.json`**: Next.js app with dependency on `@flowmate/shared`
- **`packages/shared/package.json`**: Shared utilities package

### 3. Shared Package Structure

Created `packages/shared/` with:

```
packages/shared/
├── index.ts                    # Main entry point
├── package.json                # Package config
├── tsconfig.json               # TypeScript config
├── types/
│   └── index.ts               # All TypeScript types
├── constants/
│   ├── index.ts
│   ├── audio.ts               # Audio file paths and helpers
│   └── timer.ts               # Timer configurations (Pomodoro, Guided)
└── utils/
    ├── index.ts
    ├── statsUtils.ts          # Statistics calculation (copied from web)
    └── timerUtils.ts          # Timer logic utilities (new)
```

### 4. What's in the Shared Package

**Types (`packages/shared/types/index.ts`):**
- `TimerMode`, `PomodoroType`, `GuidedType`
- `Session`, `SessionType`
- `AudioSettings`, `UISettings`
- `UserStats`, `DailyStat`
- `TimerState`

**Constants (`packages/shared/constants/`):**
- `POMODORO_CONFIGS`: All Pomodoro session configurations (1pom, 2pom, 3pom, 5pom)
- `GUIDED_CONFIGS`: All Guided Deep Work configurations (30-180 min, pom & deep styles)
- `DEFAULT_AUDIO_SETTINGS`, `DEFAULT_UI_SETTINGS`
- Audio file path helpers: `getMinuteAudioPath()`, `getSecondAudioPath()`, etc.

**Utils (`packages/shared/utils/`):**
- **statsUtils.ts**: All statistics logic (copied from web app)
  - `loadStats()`, `saveStats()`, `addFocusSession()`
  - `recalculateStreak()`, `formatFocusTime()`
  - Note: Uses localStorage (web-specific) - will need platform adapters

- **timerUtils.ts**: Timer calculations (new)
  - `calculateTotalDuration()`, `calculateProgress()`
  - `formatTime()`, `getSessionLabel()`
  - `isFocusSession()`, `calculateFocusTime()`
  - `adjustTime()`, `shouldAnnounceMinute()`, `shouldPlayDing()`

### 5. Updated Files
- `.gitignore`: Added Expo-specific ignores
- `README.md`: Updated to reflect monorepo structure

## Verification

✓ Monorepo structure created
✓ npm workspaces configured
✓ Dependencies installed successfully
✓ Web app builds successfully (`npm run build:web`)
✓ Shared package has all types, constants, and utilities

## Next Steps

### Immediate: Extract Web App Logic (Not Yet Done)

The web app ([apps/web/app/page.tsx](apps/web/app/page.tsx)) still has embedded logic that should use the shared package:

1. **Update imports in `apps/web/app/page.tsx`**:
   ```typescript
   // Replace local type imports with:
   import {
     TimerMode,
     Session,
     AudioSettings,
     POMODORO_CONFIGS,
     GUIDED_CONFIGS,
     // etc.
   } from '@flowmate/shared';
   ```

2. **Replace hardcoded configurations** with imported constants from shared package

3. **Update `apps/web/app/utils/statsUtils.ts`** to re-export from shared:
   ```typescript
   export * from '@flowmate/shared';
   ```

4. **Update `apps/web/app/types/index.ts`** to re-export from shared

### Then: Initialize Mobile App

Once web app is using shared package:

1. **Create Expo app**:
   ```bash
   cd apps
   npx create-expo-app mobile --template blank-typescript
   ```

2. **Configure mobile app** to use `@flowmate/shared`:
   ```json
   {
     "dependencies": {
       "@flowmate/shared": "*"
     }
   }
   ```

3. **Copy audio files** from `apps/web/public/audio/` to `apps/mobile/assets/audio/`

4. **Create platform adapters** for storage:
   - Web: `localStorage`
   - Mobile: `AsyncStorage`

## Running the Apps

**Web:**
```bash
npm run dev          # Runs web app
npm run dev:web      # Same as above
npm run build:web    # Build web app
```

**Mobile (after setup):**
```bash
npm run dev:mobile   # Start Expo dev server
```

## Important Notes

- The shared package uses **platform-agnostic logic only**
- Platform-specific code (localStorage, HTML5 Audio, AsyncStorage, expo-av) stays in respective apps
- Audio file paths in shared package assume `/audio/` prefix - may need platform adapters
- Stats utilities use localStorage - needs abstraction for mobile (AsyncStorage)

## File Locations

- **Web app**: `apps/web/`
- **Mobile app**: `apps/mobile/` (to be created)
- **Shared code**: `packages/shared/`
- **Audio files (web)**: `apps/web/public/audio/`
- **Audio files (mobile)**: `apps/mobile/assets/audio/` (to be copied)

## Architecture Decisions

1. **npm workspaces** (not Turborepo) - Simpler, sufficient for 2 apps + 1 shared package
2. **Shared business logic only** - Platform APIs stay in respective apps
3. **TypeScript throughout** - Full type safety across packages
4. **Barrel exports** - Clean imports via `index.ts` files
