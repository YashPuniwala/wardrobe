# Fits — Your Closet, Reimagined 🌿✨

**Fits** is a premium, high-fidelity React Native (Expo) application designed to modernize how you manage, style, and curate your wardrobe. By photographing your clothes, creating digital collages, testing outfits on a virtual model, and chatting with an AI Stylist, Fits turns your physical closet into a beautiful, searchable, and intelligent digital collection.

---

## 📱 Features Breakdown

### 1. Unified Onboarding Journey
*   **Intro Carousel:** A smooth, welcoming slideshow introducing the core capabilities of Fits.
*   **Secure Signup:** Active input styling focusing on user feedback (borders highlight dynamically when editing).
*   **Step-by-Step Style Quiz:** An 8-step visual questionnaire determining style archetypes (e.g. Minimalist, Classic, Streetwear), color preferences, sizes, fits, and priorities. Styled with visual emojis and responsive card selects.
*   **Style Profile Builder:** An animated profile builder screen that simulates compiling your custom fashion recommendations.

### 2. Wardrobe Dashboard (Home)
*   **Time-Aware Greetings & Weather Chip:** Greets you based on the time of day and features a dynamic weather widget (Celsius/Fahrenheit preferences).
*   **Full-Bleed Horizontal Swipes:** Hero cards and Recent Outfits scroll natively to the screen edges, aligning perfectly with standard margins when stationary.
*   **Quick Actions:** Launch the Outfit Planner, Dressing Room, AI Try On, or snap a new garment photo instantly.
*   **Dynamic Stylist Tip:** A randomized styling suggestions card based on daily weather and wardrobe holdings.
*   **Full-Text Search:** Instantly filter your garments via the header search modal.

### 3. Interactive Dressing Room
*   **Virtual Fitting Room:** View, slot, and swap tops, bottoms, and shoes on a visual canvas.
*   **Layer Customizer:** Tap on individual slots to see clothing names, swap matching garments, or add them to your favorites.

### 4. Personal AI Stylist
*   **Style Chatbot:** Chat directly with an automated fashion stylist.
*   **Custom Prompting:** Ask for outfit ratings, weather combinations, and tips pulled directly from the clothes you own.

### 5. Outfit Collage Editor
*   **Visual Board:** Drag, drop, scale, and rotate clothes to draft custom collages.
*   **Multiple Styles:** Save your layouts, add text stickers, and choose backgrounds.

---

## 🛠️ Technology Stack

*   **Framework:** [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/)
*   **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with persisted AsyncStorage middleware)
*   **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (smooth transitions, scale effects, and entry fades)
*   **Icons:** `@expo/vector-icons` (MaterialIcons)
*   **Typography:** Google Fonts (`Plus Jakarta Sans` and `Inter`)

---

## 📂 Directory Structure

```text
├── app/                      # Expo Router File-Based Pages
│   ├── (tabs)/               # Main App Navigation Drawer
│   │   ├── _layout.tsx       # Tab Bar Configuration (Wardrobe, Outfits, Center, Stylist, Profile)
│   │   ├── wardrobe.tsx      # Main Home / Dashboard
│   │   ├── outfits.tsx       # Saved Outfits & Favorites
│   │   ├── stylist.tsx       # AI Stylist Chat Screen
│   │   └── profile.tsx       # User Stats, Settings, and resets
│   ├── onboarding/           # Onboarding Screens
│   │   ├── _layout.tsx       # Onboarding Router Layout
│   │   ├── intro.tsx         # Welcome slideshow
│   │   ├── email-signup.tsx  # Register screen with focus highlights
│   │   ├── style-quiz.tsx    # Questionnaire with visual emojis
│   │   └── building-profile.tsx # Profile compilation loader
│   ├── create-outfit/        # Outfit Maker Screens (Collage, Dressing Room)
│   ├── dressing-room/        # Individual Fitting Rooms
│   ├── index.tsx             # Auth Router Gate (WelcomeScreen)
│   └── _layout.tsx           # Global App Shell and Auth Routing Guards
├── assets/                   # Local Images & Fonts
├── components/               # Reusable Components
│   └── ui/                   # Buttons, BottomSheets, Icons, and Skeletons
├── constants/                # Theme Design System (colors, fonts, spacings)
├── hooks/                    # Custom Hooks (weather data, framework loaders)
├── store/                    # Zustand Global Stores (Auth, Profile, Quiz, Wardrobe)
└── utils/                    # Common functions and camera launchers
```

---

## 🚀 Installation & Local Setup

Follow these steps to run the application on your computer or mobile device:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or higher is recommended) along with `npm`.

### 1. Clone & Navigate to Project
```bash
git clone https://github.com/YashPuniwala/wardrobe.git
cd wardrobe-main
```

### 2. Install Dependencies
Install the package dependencies defined in `package.json`:
```bash
npm install
```

### 3. Run the Development Server
Start the Expo development server:
```bash
npx expo start
```

### 4. Launch the App
Once the server starts, select one of the following methods to view the app:
*   **iOS Simulator:** Press `i` in the terminal (macOS required, requires Xcode installed).
*   **Android Emulator:** Press `a` in the terminal (requires Android Studio and a running virtual device).
*   **Expo Go App:** Scan the QR code printed in the terminal using your phone camera (iOS) or the [Expo Go](https://expo.dev/go) app (Android) to test directly on your mobile device.

---

## 🧪 Validation & Typechecking

The project uses TypeScript for type safety. Run the following command to check for any compiler errors:
```bash
npm run typecheck
```
All files compile cleanly with zero errors.
