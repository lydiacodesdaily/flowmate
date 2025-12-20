# FlowMate Mobile

React Native mobile app for FlowMate focus timer, built with Expo.

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Expo Go app on your phone (for testing)
- For iOS development: macOS with Xcode
- For Android development: Android Studio

### Installation

From the monorepo root:

```bash
npm install
```

### Running the App

```bash
# From monorepo root
npm run dev:mobile

# Or from this directory
npm start
```

This will start the Expo dev server. You can then:

- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with Expo Go app on your phone

## Project Structure

```
src/
├── screens/       # Screen components
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── utils/         # Utilities (storage adapters, etc.)
└── services/      # Audio service, notification service
```

## Features

- **Native Audio**: Uses expo-av for reliable background audio playback
- **Persistent Stats**: AsyncStorage for statistics tracking
- **Haptic Feedback**: Tactile feedback on session transitions
- **Keep Awake**: Screen stays on during focus sessions
- **Notifications**: Native notifications for session changes

## Shared Code

This app uses the `@flowmate/shared` package for:
- Timer logic and calculations
- Session configurations
- Statistics utilities
- Type definitions

## Development

```bash
# Type checking
npm run type-check

# Start with specific platform
npm run ios
npm run android
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Tech Stack

- **Expo SDK 54**
- **React Native 0.81**
- **TypeScript 5**
- **expo-av**: Audio playback
- **AsyncStorage**: Local persistence
- **expo-notifications**: Push notifications
- **expo-haptics**: Tactile feedback
