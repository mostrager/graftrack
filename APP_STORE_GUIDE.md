# GrafTrack App Store Submission Guide

## ✅ Project Setup Complete
Your React app has been successfully configured with Capacitor for native iOS and Android builds.

## 📱 App Configuration
- **App ID**: `com.graftrack.app`
- **App Name**: GrafTrack
- **Platforms**: iOS & Android

## 🏗️ Building Your Apps

### Prerequisites

#### For iOS (App Store):
- **Mac computer** with macOS (required - iOS apps can only be built on Mac)
- **Xcode 15+** (free from Mac App Store)
- **Apple Developer Account** ($99/year)
- **Certificates & Provisioning Profiles** (created in Apple Developer Portal)

#### For Android (Google Play):
- **Android Studio** (free, works on Windows/Mac/Linux)
- **Google Play Developer Account** ($25 one-time fee)
- **Signing keystore** (will create during first build)

## 📦 Build Process

### Step 1: Clone and Install
```bash
git clone [your-repo]
npm install
```

### Step 2: Build the Web App
```bash
npm run build
```

### Step 3: Sync with Native Projects
```bash
npx cap sync
```

### Step 4: Build Native Apps

#### iOS Build Process:
```bash
npx cap open ios
```
1. Opens in Xcode
2. Select your team in Signing & Capabilities
3. Choose "Any iOS Device" as target
4. Product → Archive
5. Distribute App → App Store Connect
6. Upload to App Store Connect

#### Android Build Process:
```bash
npx cap open android
```
1. Opens in Android Studio
2. Build → Generate Signed Bundle/APK
3. Choose Android App Bundle (AAB)
4. Create or select keystore
5. Build release AAB
6. Upload to Google Play Console

## 📸 App Store Requirements

### iOS App Store:
1. **Screenshots Required**:
   - 6.9" iPhone (1320×2868px) - MANDATORY
   - 6.5" iPhone (1242×2688px) - Optional
   - 13" iPad (2064×2752px) - If supporting iPad

2. **App Information**:
   - App description (4000 chars max)
   - Keywords (100 chars max)
   - Support URL
   - Privacy Policy URL (REQUIRED)
   - Age rating

3. **App Icon**: 1024×1024px (no transparency, no rounded corners)

### Google Play Store:
1. **Screenshots Required**:
   - Phone: minimum 2 (320×320px to 3840×3840px)
   - Tablet: optional (if supporting tablets)
   - Feature graphic: 1024×500px

2. **App Information**:
   - Short description (80 chars)
   - Full description (4000 chars)
   - App category
   - Content rating
   - Privacy Policy URL

3. **App Icon**: 512×512px PNG

## 🚀 Submission Process

### iOS App Store:
1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app with bundle ID `com.graftrack.app`
3. Fill in app information
4. Upload screenshots and metadata
5. Upload build from Xcode
6. Submit for review (usually 24-48 hours)

### Google Play Store:
1. Log into [Google Play Console](https://play.google.com/console)
2. Create new app
3. Complete all sections in dashboard
4. Upload AAB file to Production or Beta track
5. Complete content rating questionnaire
6. Set pricing and distribution
7. Submit for review (usually 2-3 hours)

## 🔧 Native Permissions

The following permissions are configured:
- **Location** (for geotagging graffiti)
- **Camera** (for taking photos)
- **Storage** (for saving photos)

### iOS Info.plist Keys (already configured):
```xml
<key>NSCameraUsageDescription</key>
<string>GrafTrack needs camera access to photograph graffiti</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>GrafTrack needs location access to map graffiti locations</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>GrafTrack needs photo library access to save graffiti photos</string>
```

### Android Permissions (already configured):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 💡 Important Notes

1. **Testing**: Always test on real devices before submission
2. **Updates**: After app approval, updates can be pushed through the same process
3. **Versioning**: Increment version numbers for each submission
4. **Backend**: Your Replit backend will work with the mobile apps
5. **Deep Linking**: Share links will open in the native app if installed

## 📊 Expected Timeline

- **Initial Setup**: 2-3 hours
- **iOS Submission**: 1-2 days (includes review)
- **Android Submission**: 3-6 hours (faster review)
- **Total to Both Stores**: 2-3 days

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Run `npx cap sync` and try again
2. **Signing errors**: Check certificates in Apple Developer Portal
3. **API not working**: Update server URLs in capacitor.config.ts
4. **White screen**: Check console for JavaScript errors

### Need Help?
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Google Play Guidelines](https://play.google.com/console/about/guides/)

## ✅ Next Steps

1. Download Xcode (Mac) or Android Studio
2. Create developer accounts
3. Build your first release
4. Submit to stores!

Your app is ready for native deployment. The same codebase will work on both iOS and Android!