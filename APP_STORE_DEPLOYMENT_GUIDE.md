# GrafTrack App Store Deployment Guide - Ubuntu Desktop

## Prerequisites

### For Android
- Ubuntu 20.04 or later
- At least 8GB RAM
- 10GB free disk space
- Java Development Kit (JDK) 17

### For iOS
- Apple Developer Account ($99/year)
- Access to a Mac (physical, virtual, or cloud service)
- iOS device for testing

---

## Part 1: Android Play Store Deployment

### Step 1: Install Android Studio

```bash
# Add Android Studio repository
sudo add-apt-repository ppa:maarten-fonville/android-studio
sudo apt update

# Install Android Studio
sudo apt install android-studio

# Or download directly from:
# https://developer.android.com/studio
```

### Step 2: Set Up Android SDK

1. Open Android Studio
2. Go to File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools
   - Android Emulator

### Step 3: Configure Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell
source ~/.bashrc
```

### Step 4: Build the Android App

```bash
# First, build your web app
npm run build

# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 5: Generate Signed APK/AAB

In Android Studio:

1. **Build → Generate Signed Bundle/APK**
2. Choose **Android App Bundle** (required for Play Store)
3. **Create new keystore** (first time only):
   - Keystore path: `~/graftrack-keystore.jks`
   - Password: [create strong password]
   - Alias: graftrack
   - Validity: 25 years
   - Fill in certificate information
4. **Save your keystore securely!** You'll need it for all future updates

### Step 6: Configure App Details

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.graftrack"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 7: Test on Device/Emulator

```bash
# List devices
adb devices

# Install on connected device
adb install app-release.aab
```

### Step 8: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app details:
   - App name: GrafTrack
   - Default language: English
   - App category: Photography
   - Free/Paid
4. Upload AAB file to Production track
5. Complete store listing:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (min 2, max 8)
   - Feature graphic (1024x500)
   - Icon (512x512)
6. Set up content rating questionnaire
7. Set pricing and distribution
8. Review and publish

---

## Part 2: iOS App Store Deployment (from Ubuntu)

### Option A: Using Cloud Mac Services

#### Services to Consider:
- **MacInCloud** ($20-50/month)
- **MacStadium** ($79+/month)
- **AWS EC2 Mac Instances** ($25+/day)
- **GitHub Actions with macOS runners** (free for public repos)

#### Step 1: Set Up Cloud Mac

1. Sign up for MacInCloud or similar service
2. Connect via VNC or Remote Desktop
3. Install Xcode from Mac App Store

#### Step 2: Transfer Your Project

```bash
# From Ubuntu, create archive
tar -czf graftrack.tar.gz .

# Upload to cloud service
scp graftrack.tar.gz user@mac-cloud:~/

# On Mac, extract
tar -xzf graftrack.tar.gz
```

### Option B: Using CI/CD Services

#### Using Codemagic (Recommended)

1. Create account at [codemagic.io](https://codemagic.io)
2. Connect your Git repository
3. Create `codemagic.yaml`:

```yaml
workflows:
  ios-workflow:
    name: iOS Workflow
    environment:
      xcode: 15.0
      node: 18
      npm: 9
    scripts:
      - name: Install dependencies
        script: npm install
      - name: Build web
        script: npm run build
      - name: Sync Capacitor
        script: npx cap sync ios
      - name: Set up provisioning profiles
        script: |
          keychain initialize
          app-store-connect fetch-signing-files $BUNDLE_ID \
            --type IOS_APP_STORE \
            --create
      - name: Build ipa
        script: |
          xcode-project build-ipa \
            --workspace ios/App/App.xcworkspace \
            --scheme App
    artifacts:
      - build/ios/ipa/*.ipa
    publishing:
      app_store_connect:
        api_key: $APP_STORE_CONNECT_API_KEY
        key_id: $APP_STORE_CONNECT_KEY_ID
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
```

### Option C: Using a Friend's Mac

If you have access to a Mac occasionally:

#### Step 1: Prepare on Ubuntu

```bash
# Build and sync
npm run build
npx cap sync

# Create archive
zip -r graftrack-ios.zip ios/
```

#### Step 2: On Mac

```bash
# Extract project
unzip graftrack-ios.zip

# Install dependencies
npm install

# Open in Xcode
npx cap open ios
```

### iOS Build Process (on Mac/Cloud)

#### Step 1: Configure in Xcode

1. Open `ios/App/App.xcworkspace`
2. Select "App" target
3. Under "Signing & Capabilities":
   - Team: Select your Apple Developer team
   - Bundle Identifier: `com.yourcompany.graftrack`
   - Signing Certificate: iOS Distribution

#### Step 2: Configure App Info

Edit `ios/App/App/Info.plist`:
- Add app permissions descriptions
- Set minimum iOS version (13.0 recommended)
- Configure app transport security if needed

#### Step 3: Archive and Upload

1. Product → Scheme → Edit Scheme → Archive → Release
2. Product → Archive
3. Window → Organizer
4. Select archive → Distribute App
5. App Store Connect → Next
6. Upload → Next
7. Automatically manage signing → Next
8. Upload

#### Step 4: App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create New App:
   - Platform: iOS
   - Name: GrafTrack
   - Bundle ID: com.yourcompany.graftrack
   - SKU: graftrack-001
3. Fill in App Information:
   - Category: Photo & Video
   - Content rights
   - Age rating
4. Add screenshots (required sizes):
   - 6.7" (1290x2796) - iPhone 15 Pro Max
   - 6.5" (1242x2688) - iPhone 11 Pro Max
   - 5.5" (1242x2208) - iPhone 8 Plus
   - iPad Pro 12.9" (2048x2732)
5. Write descriptions
6. Set pricing (Free)
7. Submit for review

---

## Part 3: Generate Required Assets

### Create App Icons

```bash
# Install ImageMagick
sudo apt install imagemagick

# Create icon sizes from SVG
convert -background none -resize 512x512 public/icon.svg icon-512.png
convert -background none -resize 192x192 public/icon.svg icon-192.png
convert -background none -resize 180x180 public/icon.svg icon-180.png
convert -background none -resize 152x152 public/icon.svg icon-152.png
convert -background none -resize 120x120 public/icon.svg icon-120.png
convert -background none -resize 1024x1024 public/icon.svg icon-1024.png
```

### Create Screenshots

Use Android Emulator for Android screenshots:
```bash
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

For iOS screenshots, use Simulator on Mac or screenshot service.

### Generate Feature Graphics

Create using GIMP or Inkscape:
```bash
sudo apt install gimp inkscape

# Android Feature Graphic: 1024x500px
# iOS App Preview: 1920x1080px (optional video)
```

---

## Part 4: Testing Checklist

### Before Submission

- [ ] Test on multiple devices/screen sizes
- [ ] Check offline functionality
- [ ] Verify camera permissions work
- [ ] Test location services
- [ ] Check deep linking
- [ ] Verify push notifications (if implemented)
- [ ] Test on slow network
- [ ] Check accessibility features
- [ ] Review crash reports
- [ ] Test app updates

### Privacy & Compliance

- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready
- [ ] GDPR compliance (if applicable)
- [ ] Content rating questionnaire completed
- [ ] Export compliance (for iOS)

---

## Part 5: Automation Scripts

### Build Script for Ubuntu

Create `build-apps.sh`:

```bash
#!/bin/bash

echo "Building GrafTrack for App Stores..."

# Build web assets
echo "Building web assets..."
npm run build

# Android Build
echo "Building Android..."
npx cap sync android

# Generate Android AAB
cd android
./gradlew bundleRelease
cd ..
echo "Android AAB created at: android/app/build/outputs/bundle/release/"

# iOS Build (requires Mac)
echo "iOS build requires macOS. Use Codemagic or cloud Mac service."

echo "Build complete!"
```

Make executable:
```bash
chmod +x build-apps.sh
```

---

## Troubleshooting

### Android Issues

**Issue**: Build fails with SDK not found
```bash
# Solution: Set ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
```

**Issue**: Signing key problems
```bash
# Generate new key
keytool -genkey -v -keystore graftrack.keystore -alias graftrack -keyalg RSA -keysize 2048 -validity 10000
```

### iOS Issues

**Issue**: Code signing fails
- Ensure you have valid provisioning profiles
- Check Apple Developer account is active
- Revoke and regenerate certificates if needed

**Issue**: Archive not appearing
- Check build settings → Skip Install = No
- Ensure scheme is set to Release

---

## Estimated Timeline

- Android submission: 2-4 hours (same day approval usually)
- iOS submission: 3-5 days (review time)
- Total setup time: 1-2 days

---

## Support Resources

- [Android Developer Docs](https://developer.android.com/distribute)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

---

## Cost Summary

### Required Costs
- Apple Developer Account: $99/year
- Google Play Developer: $25 (one-time)

### Optional Costs
- Cloud Mac service: $20-100/month (for iOS builds)
- Code signing service: $20-50/month
- CI/CD service: Free tier usually sufficient

---

## Next Steps

1. Start with Android (easier from Ubuntu)
2. Set up cloud Mac or CI/CD for iOS
3. Generate all required assets
4. Test thoroughly
5. Submit to stores
6. Monitor reviews and respond to feedback

Good luck with your app store submissions!