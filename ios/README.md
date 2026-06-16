# SubKit — Native Builds

SubKit is a single-file PWA. The native wrappers just load the same `app.html` from Vercel inside a WKWebView (iOS) or a Trusted Web Activity (Android). This means **the web app IS the native app** — no separate native codebase to maintain.

## One-time setup

```bash
# Install Capacitor CLI + iOS + Bubblewrap
npm install
```

## iOS (App Store)

Prerequisites: macOS with Xcode 15+ and an Apple Developer account ($99/yr).

```bash
# 1. Generate the Xcode project from capacitor.config.ts
npx cap add ios
# 2. Replace the generated Info.plist with ios/App/App/Info.plist from this repo
cp ios/App/App/Info.plist ios/App/App/Info.plist.canonical
# (Actually npx cap add ios generates a complete project — keep its Info.plist and merge
# the keys from our reference one: NSAppTransportSecurity, NSCameraUsageDescription,
# NSPhotoLibraryUsageDescription, CFBundleAssociatedDomains, CFBundleURLTypes)
# 3. Sync the web assets
npx cap sync ios
# 4. Install CocoaPods
cd ios/App && pod install && cd ../..
# 5. Open in Xcode
npx cap open ios
# 6. In Xcode:
#    - Select "App" target → Signing & Capabilities → set your Team
#    - Bundle identifier: app.subkit.tracker
#    - General → Display Name: SubKit
#    - Build → Archive
# 7. Submit via Xcode → Organizer → Distribute App → App Store Connect
```

App Store metadata: see `store/ios/metadata.md`.

## Android (Play Store)

Prerequisites: a Google Play Developer account ($25 one-time) and a domain you own that matches the TWA's `assetlinks.json` (we use `subkit-ten.vercel.app`).

```bash
# 1. Initialize the TWA project from our twa-manifest.json
npx bubblewrap init --manifest twa-manifest.json
# 2. Build the signed AAB
npx bubblewrap build
# 3. Output: app-release-signed.aab — upload to Google Play Console
```

### Critical TWA requirement

Google requires a Digital Asset Links file at `https://subkit-ten.vercel.app/.well-known/assetlinks.json` that proves you own the domain. After `bubblewrap init`, the file content is in `twa/assetlinks.json.template`. Deploy it to Vercel (we've added a rewrite in `vercel.json` — see below).

App Store metadata: see `store/android/metadata.md`.

## Updating the web app

The native shells always load the latest `app.html` from Vercel, so a `git push` of any web change is automatically available in the native apps. The only reasons to rebuild the native binary are:
- App icon changed
- Native splash screen changed
- Bundle ID / signing changed
- App Store metadata changed

## Why we don't bundle the web app into the native binary

Some teams `npx cap copy` the web assets into the iOS/Android project, so the app works offline without Vercel. We deliberately don't — the marketing/legal/og.svg is one source of truth on Vercel, and the native shell just points at it. The app already caches via service worker (`sw.js`) so offline works. If you ever want true offline (e.g. on a plane), run `npx cap copy` and rebuild.
