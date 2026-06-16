# SubKit — Native App Builds

SubKit is a PWA that ships as native apps on iOS and Android by loading the same `app.html` from `https://subkit-ten.vercel.app` inside a WebView shell. The web app is the source of truth; the native shells are thin wrappers.

## Build matrix

| Platform | Technology | Wrapper | Account needed | Cost |
|---|---|---|---|---|
| iOS | Capacitor + WKWebView | `ios/App/` | Apple Developer | $99/yr |
| Android | Bubblewrap TWA | `twa-manifest.json` | Google Play | $25 one-time |

## Why this setup

- **One codebase.** `app.html` is the same code on web, iOS, Android. No React Native, no Flutter, no Kotlin rewrite.
- **One deploy.** Vercel auto-deploys `main`; the native shells fetch the latest `app.html` from there. Push to update both stores.
- **Offline still works.** Service worker (`sw.js`) caches the shell. The only thing that doesn't work offline is the Stripe checkout redirect (which needs network anyway).

## Files added in Week 3

```
package.json                — npm scripts for build:icons, ios:*, android:*
capacitor.config.ts         — iOS native config
twa-manifest.json           — Android TWA config
ios/App/App/Info.plist      — iOS native config (NSAppTransportSecurity, camera, etc.)
ios/README.md               — iOS build steps (one-time setup)
.well-known/assetlinks.json — Android TWA domain verification
.well-known/apple-app-site-association — iOS Universal Links
store/ios/metadata.md       — App Store listing copy
store/android/metadata.md   — Play Store listing copy
scripts/build-icons.mjs     — generates 192/512/1024 PNGs + maskable variant
vercel.json                 — serves the new .well-known files
```

## What I still need from you

- **Apple Developer account** — enroll at https://developer.apple.com/programs/enroll/ ($99/yr)
- **Google Play Developer account** — enroll at https://play.google.com/console/signup ($25 one-time)
- **Domain ownership** for `subkit-ten.vercel.app` — if Vercel owns it, you already have it. If it's owned by you personally, you can still publish the TWA but the assetlinks.json must point to the SHA-256 of YOUR signing cert.
- **A real production keystore** for Android — run `keytool -genkey -v -keystore android.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias android` and replace the `REPLACE_ME` placeholders in `twa-manifest.json`

## Once you have those

```bash
npm install
node scripts/build-icons.mjs     # generates public/icons/icon-192.png, icon-512.png, etc.
git add public/icons/ && git commit -m "chore: generate app icons"
git push                            # auto-deploys to Vercel, assets available at /icons/

# iOS
npx cap add ios                    # generates the full Xcode project from capacitor.config.ts
npx cap sync ios
cd ios/App && pod install && cd ../..
npx cap open ios                   # opens Xcode — set Team, Archive, Distribute
# Upload to App Store Connect → TestFlight → submit for review

# Android
npx bubblewrap init --manifest twa-manifest.json
npx bubblewrap build               # outputs app-release-signed.aab
# Upload to Google Play Console → Internal testing → Production
```

## Risks (from PRD §9)

- **Apple may reject the PWA wrapper.** They've been touchy since EU DMA. Mitigation: ship Android first, come back to iOS once we have traction.
- **Bubblewrap + Vercel domain** — Google requires the domain to be served over HTTPS AND have a valid assetlinks.json. We have both. Good.
- **Icon has emoji-shaped corners** — the 3-card mark is a custom SVG so should pass. If App Review flags it, the script regenerates from a new `icon.svg` in 30 seconds.

## Post-launch monitoring

- App Store Connect → Sales & Trends → downloads
- Play Console → Statistics → installs
- SubKit → Settings → "Last 30 days" shows Pro conversion rate
- Crash reporting: Vercel logs + Play Console crash reports + App Store Connect crashes
