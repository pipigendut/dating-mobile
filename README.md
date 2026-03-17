# Dating Mobile RN

A modern, scalable dating application built with React Native and Expo, following the "Startup Scale Architecture Guide".

## 🚀 Architecture Overview

This project implements a **Feature-Based Architecture**, designed for scalability and maintainability.

### Key Principles:
- **Feature Encapsulation**: Each feature (Auth, Dashboard, Chat, etc.) contains its own screens, components, and logic.
- **Shared Infrastructure**: Unified UI components, hooks, and utilities.
- **State Management Separation**:
  - **UI State**: Managed via [Zustand](https://github.com/pmndrs/zustand).
  - **Server State**: Managed via [TanStack Query](https://tanstack.com/query/latest) (React Query).
- **Type Safety**: Strict TypeScript implementation with [Zod](https://github.com/colinhacks/zod) for schema validation.

## 📁 Project Structure

```text
src/
├── app/                # Core application setup
│   ├── navigation/    # App, Tab, and Stack navigators
│   └── providers/     # Global Context Providers (User, Theme, etc.)
├── features/           # Feature-based business modules
│   ├── auth/          # Authentication flow & Login
│   ├── chat/          # Messaging & Matches
│   ├── dashboard/     # Swipe cards, Filters, Subscriptions
│   ├── onboarding/    # Multi-step user profile setup
│   └── profile/       # User settings and profile management
├── shared/             # Reusable global resources
│   ├── components/ui/ # Atomic UI components (Button, Input, etc.)
│   ├── hooks/         # Global custom hooks
│   ├── theme/          # Design system tokens (Colors, Typography)
│   └── utils/         # Helper functions
├── data/               # Static mock data
└── services/           # External API & Storage clients
```

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [React Query](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://github.com/colinhacks/zod)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Styling**: [Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) & Native Styles
- **Authentication**: Google Sign-In

## 🏁 Getting Started

### Prerequisites
- Node.js (Late LTS)
- Expo Go app on your mobile device (for development)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm start
```
- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with Expo Go to run on a physical device

### Running on Physical Device (USB)
1. **Enable Developer Options & USB Debugging** on your device.
2. Connect your device to your computer via USB cable.
3. Verify connection:
   - Android: `adb devices`, `adb reverse tcp:8080 tcp:8080`, `adb reverse tcp:9090 tcp:9090`, `adb reverse --list`
   - iOS: `xcrun devicectl list devices` (or use Xcode)
4. Run the command:
   ```bash
   # Android
   npx expo run:android

   # iOS
   npx expo run:ios
   ```

## 🛠 Debugging (Best Practices)

This project uses **Reactotron** for professional auditing of API requests and State management.

### Setup Reactotron Desktop:
1. Download [Reactotron Desktop](https://github.com/infinitered/reactotron/releases).
2. Open the app on your Mac.

### Connect Physical Device (Android):
1. Connect via USB.
2. Run port forwarding for Reactotron and Backend:
   ```bash
   adb reverse tcp:9090 tcp:9090  # Reactotron
   adb reverse tcp:8080 tcp:8080  # Backend
   ```
3. Run `npx expo run:android`.
4. Your device will appear in Reactotron under **"Dating App Mobile"**.

## ✨ Features Implemented
- [x] **Social Auth**: Google Sign-In integration.
- [x] **Onboarding**: Beautiful multi-step profile creation flow.
- [x] **Discovery**: Swipe-based discovery with advanced filtering.
- [x] **Premium Tiers**: Subscription models (Plus, Premium, Ultimate).
- [x] **Explorer Mode**: Search and match in different locations.
- [x] **Profile Management**: Profile verification, boosting, and account settings.

---
Built with ❤️ during the Startup Scale Refactoring.
