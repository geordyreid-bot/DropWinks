<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WinkDrops: Production-Ready PWA

This repository contains a production-ready version of the WinkDrops Progressive Web App, integrated with Firebase for authentication, real-time database, and push notifications.

View your app in AI Studio: https://ai.studio/apps/drive/1UQUf8IEouyExhBxO2-nzC8iSCsvSJ4ae

## Firebase Setup

This project requires a Firebase project to handle authentication, data storage, and push notifications.

### 1. Create a Firebase Project
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click "Add project" and follow the setup instructions.

### 2. Create a Web App
- In your new project, click the Web icon (`</>`) to add a new web app.
- Register your app. You don't need to add the SDK snippets to your code, as it's already included.
- After registering, go to **Project Settings > General**. Under "Your apps", find your web app and copy the `firebaseConfig` object.

### 3. Configure Firestore Database
- Go to the **Build > Firestore Database** section.
- Click "Create database" and start in **production mode**.
- Choose a location for your database.
- Go to the **Rules** tab and paste the following for initial development. **Note: These rules are not secure for a public application and should be refined.**
  ```json
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

### 4. Enable Authentication
- Go to the **Build > Authentication** section.
- Click "Get started".
- On the **Sign-in method** tab, enable the "Email/Password" and "Google" providers.

### 5. Configure Firebase Cloud Messaging (FCM)
- Go to **Project Settings > Cloud Messaging**.
- Under "Web configuration", click "Generate key pair" to get your VAPID key. This will be needed for your service worker.

## Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies:**
    `npm install`
2.  **Configure Firebase:**
    - Create a new file named `WD-main/firebase.ts`.
    - Paste your `firebaseConfig` object from the Firebase console into this file, like so:
      ```typescript
      import { initializeApp } from 'firebase/app';
      import { getAuth } from 'firebase/auth';
      import { getFirestore } from 'firebase/firestore';
      import { getMessaging } from 'firebase/messaging';

      const firebaseConfig = {
        apiKey: "AIza...",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "1234567890",
        appId: "1:12345..."
      };

      const app = initializeApp(firebaseConfig);
      export const auth = getAuth(app);
      export const db = getFirestore(app);
      export const messaging = getMessaging(app);
      ```
3.  **Configure Service Worker:**
    - Open `WD-main/sw.js`.
    - At the top, replace `"YOUR_VAPID_KEY"` with the VAPID key you generated in the Firebase Console.
4.  **Set Environment Variable:**
    - Set the `GEMINI_API_KEY` in a `.env.local` file at the root of the `WD-main` directory to your Gemini API key.
      ```
      GEMINI_API_KEY=your_gemini_api_key_here
      ```
5.  **Run the app:**
    `npm run dev`

## Deployment with Firebase Hosting & PWA Builder

1.  **Install Firebase CLI:**
    `npm install -g firebase-tools`
2.  **Login to Firebase:**
    `firebase login`
3.  **Initialize Firebase Hosting:**
    - In your project's root directory, run `firebase init hosting`.
    - Select "Use an existing project" and choose your Firebase project.
    - Set your public directory to `WD-main/dist`.
    - Configure as a single-page app (rewrite all urls to /index.html).
4.  **Build the App:**
    `npm run build`
5.  **Deploy to Firebase:**
    `firebase deploy --only hosting`
6.  **Validate with PWA Builder:**
    - Go to [PWA Builder](https://www.pwabuilder.com/).
    - Enter the URL of your deployed Firebase app (e.g., `https://your-project-id.web.app`).
    - Follow the steps to analyze, package, and deploy your PWA to various app stores.
