# Spotit Android Build Next Steps

Spotit is ready as a live web app and PWA. To create the Android store package, the machine needs Android build tools.

## Install On The Build Machine

1. Node.js
2. Java Development Kit
3. Android Studio
4. Android SDK from Android Studio

## Capacitor Setup

After the tools are installed, add Capacitor to wrap the current Spotit web app. The app configuration is already prepared in `capacitor.config.json` and points the Android app to the live Railway Spotit URL.

```powershell
cd "C:\Users\Dealt-it.com\OneDrive\Documents\WPS Cloud Files\SpotitApp"
npm.cmd run android:install-tools
npx.cmd cap add android
npx.cmd cap sync android
```

## Android Studio Build

1. Open the generated `android` folder in Android Studio.
2. Confirm the package name is `com.medholic.spotit`.
3. Add the Spotit icon and splash screen.
4. Create a signed release build.
5. Generate the `.aab` Android App Bundle.
6. Upload the `.aab` to Google Play Console.

## Reviewer Login

Create a temporary reviewer login in Spotit for Google. Do not publish the main owner login or password.

## Release Type

Start with internal testing, then closed testing, then production once Google requirements are satisfied.
