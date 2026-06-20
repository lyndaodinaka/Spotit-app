# Spotit Android Store Roadmap

Spotit is currently a live web app and now has PWA install support. This means users can open the live link on phones, tablets, and computers. The store version should be prepared for Android devices only, including Samsung, Redmi/Xiaomi, Android tablets, and other Google Play compatible devices.

## Best Next Step

Use the current Spotit web app as the base and wrap it for Android with Capacitor. This keeps the same Railway backend, database, login system, and app design, while creating a Google Play-ready Android build.

## Publishing Decision

- Publish to Android only.
- Do not publish to Apple App Store or iPhone at this stage.
- Keep the live web link available for browser access and demonstrations.
- Prepare screenshots for Android phone and Android tablet layouts.

## Google Play Store Path

1. Create a Google Play Console account.
2. Build an Android wrapper for Spotit using Capacitor.
3. Generate an Android App Bundle file.
4. Add app name, logo, screenshots, privacy policy, and data safety answers.
5. Upload to Google Play Console.
6. Test internally.
7. Submit for review.

## Target Devices

- Samsung Android phones
- Redmi/Xiaomi Android phones
- Android tablets
- Other Google Play compatible Android devices
- Browser access on laptops and desktops through the live Railway link

## Not Included For Now

- iPhone app publishing
- iPad App Store publishing
- Apple TestFlight
- Apple App Store Connect submission

## Healthcare Safety Note

For marketing, investor demos, and buyer discussions, Spotit can be presented as a wound-care workflow demo. For real patient use, complete the privacy, data protection, clinical safety, information governance, and organisation approval steps before collecting live patient data.

## Recommended Store Positioning

Spotit helps wound-care teams capture wound information, assess progress, plan reviews, and prepare reports in one organised workflow.

## What Not To Expose Publicly

- Private admin login details
- Real patient information
- Full internal workflow logic
- Database credentials
- Encryption keys
- Clinical decision rules that are not yet formally validated

## Files Already Available

- Live web app
- Login system
- Railway deployment
- PostgreSQL database
- Privacy policy starter
- Terms of use starter
- Marketing kit
- PWA install setup
