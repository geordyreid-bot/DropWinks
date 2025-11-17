# Winkdrops: Production Build

This `build` directory contains the complete, production-ready static output for the Winkdrops Progressive Web App (PWA). These files are optimized and ready for deployment.

## Folder Contents

- **`index.html`**: The main entry point for the application.
- **`manifest.json`**: The PWA manifest file, configured for "Add to Home Screen" and offline capabilities.
- **`sw.js`**: The service worker, which handles caching for offline support and push notifications.
- **`firebaseConfig.js`**: A placeholder for your Firebase project configuration.
- **`favicon.ico`, `icon-192.png`, `icon-512.png`**: App icons for various platforms.
- **`assets/`**: A directory containing the bundled JavaScript (`main.js`), CSS (`styles.css`), and other static images.

---

## 1. Firebase Setup & Deployment

Follow these steps to deploy your PWA to Firebase Hosting.

### Step 1: Configure Firebase

1.  **Configure `firebaseConfig.js`**: You have a placeholder file in this directory. Replace its contents with the actual configuration object from your Firebase project.
    - Go to your **Firebase Project Settings** > **General**.
    - Under "Your apps", find your web app.
    - Select the "Config" option and copy the `firebaseConfig` object.
    - Paste it into `build/firebaseConfig.js`.

    ```javascript
    // build/firebaseConfig.js
    // Replace this with your actual Firebase config
    export const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef123456"
    };
    ```

2.  **Configure Service Worker (Push Notifications)**:
    - Open `build/sw.js`.
    - Find the `firebaseConfig` object at the bottom of the file.
    - Replace the placeholder values with your actual Firebase configuration, specifically the `messagingSenderId`.

### Step 2: Deploy to Firebase Hosting

1.  **Install Firebase CLI** (if you haven't already):
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Initialize Firebase in your project root** (one level above this `build` folder):
    ```bash
    firebase init hosting
    ```
    - When prompted, select **"Use an existing project"** and choose your Firebase project.
    - For your public directory, enter **`build`**.
    - Configure as a **single-page app** (rewrite all URLs to /index.html). Say **Yes**.
    - **Do not** overwrite the `build/index.html` file if it asks.

4.  **Deploy**:
    ```bash
    firebase deploy --only hosting
    ```

Your Winkdrops PWA is now live!

---

## 2. Capacitor Integration (for Native iOS/Android)

Follow these steps to wrap your PWA build into a native mobile application using Capacitor.

### Step 1: Initial Setup

1.  **Create a new directory** for your Capacitor project and `cd` into it.
2.  **Install Capacitor CLI**:
    ```bash
    npm install @capacitor/cli @capacitor/core
    ```
3.  **Initialize Capacitor**:
    ```bash
    npx cap init
    ```
    -   **App Name**: Winkdrops
    -   **App ID**: com.winkdrops.app (or your own unique ID)
    -   **Web directory**: `www` (we will copy our build files here)

### Step 2: Add Platforms

1.  **Add iOS and Android platforms** to your project:
    ```bash
    npx cap add ios
    npx cap add android
    ```

### Step 3: Copy Web Build

1.  **Delete the default `www` folder** created by Capacitor.
2.  **Copy this entire `build` folder** into your Capacitor project's root directory.
3.  **Rename the `build` folder to `www`**.

### Step 4: Sync and Run

1.  **Sync your web assets** with the native projects:
    ```bash
    npx cap sync
    ```

2.  **Open the native project** in its IDE:
    -   For iOS: `npx cap open ios` (requires a Mac with Xcode)
    -   For Android: `npx cap open android` (requires Android Studio)

3.  **Run the app**: From Xcode or Android Studio, you can now build and run your Winkdrops app on a simulator or a physical device.