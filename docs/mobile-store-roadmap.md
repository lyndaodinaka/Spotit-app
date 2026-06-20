# Spotit Mobile App Store Roadmap

Spotit is currently a live web app and now has PWA install support. This means users can open the live link on a phone and add Spotit to their home screen.

## Best Next Step

Use the current Spotit web app as the base and wrap it for mobile stores with Capacitor. This keeps the same Railway backend, database, login system, and app design, while creating store-ready mobile builds.

## Apple App Store Path

1. Create an Apple Developer account.
2. Build an iOS wrapper for Spotit using Capacitor.
3. Open the iOS project in Xcode.
4. Add the Spotit app name, logo, screenshots, privacy text, and support contact.
5. Upload to App Store Connect.
6. Test with TestFlight.
7. Submit for App Review.

## Google Play Store Path

1. Create a Google Play Console account.
2. Build an Android wrapper for Spotit using Capacitor.
3. Generate an Android App Bundle file.
4. Add app name, logo, screenshots, privacy policy, and data safety answers.
5. Upload to Google Play Console.
6. Test internally.
7. Submit for review.

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
