# Smart TMJ Pro

Smart TMJ Pro is an Expo / React Native application for TMJ education, exercise-session tracking, local patient records, PDF summaries and optional AI-assisted explanations.

## Development

- Install: `npm ci`
- Start Expo: `npx expo start`
- Android preview APK: `npx eas-cli build --platform android --profile preview`

## Gemini AI backend

The mobile app calls the Node.js backend at `/api/chat`. The Gemini API key belongs only on the backend and must never be placed in the mobile app or committed to Git.

### Deploy the backend

1. Create a new Web Service in Render and connect this repository, or deploy the included `render.yaml` Blueprint.
2. Set the backend environment variable `GEMINI_API_KEY` in Render. Do not commit the key.
3. Wait for deployment and verify the service root returns JSON with status `Smart TMJ server online`.
4. Copy the deployed service origin (for example, `https://your-service.onrender.com`).

### Configure the mobile app

Set the EAS environment variable `EXPO_PUBLIC_API_BASE_URL` to the deployed service origin (without a trailing slash) in the EAS project environment used by the preview build. Then create a new Android preview build. The app appends `/api/chat` automatically.

The source currently retains a legacy development endpoint as a temporary fallback if the environment variable is not configured. Do not rely on that Codespaces endpoint for production or long-term AI availability.

## Privacy and clinical limitations

- Patient records are currently stored locally on the device. This is not a cloud-synced, authenticated, multi-user electronic health record.
- AI patient-context sharing is opt-in. The Results AI feature sends a limited, name-free summary only after the user enables consent.
- The backend API currently has IP-based rate limiting but does not implement user authentication or per-clinician authorization. Do not expose sensitive patient records or use this prototype as a production clinical record system.
- Sensor events are raw threshold-crossing segments. They are not validated bruxism episodes, EMG, calibrated force or a clinical Bruxism Index.
- Night Mode does not establish sleep duration or sleep stages. Real overnight monitoring requires compatible hardware and validation.
- BLE functionality requires a custom native build, compatible firmware, known GATT UUIDs and physical hardware testing. Calibration metadata and validated clinical thresholds have not been supplied.

## Android package identity

The Android application ID remains `com.mahmoud124578.snacka6961d11a56046eaad4cf2e002cf7648`. Preview builds from this same project can update an existing installation when Android signing credentials match; always back up locally stored patient data before reinstalling or updating.
