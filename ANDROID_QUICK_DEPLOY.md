# 🚀 Android Deployment - Quick Start Guide

Your app is ready for Android deployment! Follow these steps:

## ✅ What's Already Done
- ✓ Production build created
- ✓ Android project synced
- ✓ App icons generated
- ✓ Play Store content prepared

## 📱 Step 1: Install Android Studio
```bash
# Download from:
https://developer.android.com/studio

# Or use snap (Ubuntu):
snap install android-studio --classic
```

## 🔧 Step 2: Open Project in Android Studio
```bash
npx cap open android
```
Wait for Android Studio to load and sync the project (may take 2-3 minutes).

## 🔑 Step 3: Generate Signed App Bundle

In Android Studio:

1. **Menu: Build → Generate Signed Bundle/APK**

2. **Choose:** Android App Bundle → Next

3. **Create New Keystore:**
   - Key store path: Click "Create new" and save as `graftrack-release.keystore`
   - Passwords: Use a strong password (save it!)
   - Alias: `graftrack`
   - Validity: 25 years
   - Certificate:
     - First and Last Name: Your name
     - Organizational Unit: Development
     - Organization: Your company/name
     - City, State, Country Code: Your location

4. **Build:** Select "release" and "Finish"

⚠️ **IMPORTANT:** Save your keystore file and passwords securely! You'll need them for every update.

## 📤 Step 4: Upload to Play Store

### Create Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Complete account setup

### Create App
1. Click **"Create app"**
2. Enter details:
   - App name: **GrafTrack**
   - Default language: **English (US)**
   - App or game: **App**
   - Free or paid: **Free**
   - Accept declarations

### Upload Your App
1. Go to **Production** → **Create new release**
2. Click **Upload** → select your AAB file:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```
3. Add release notes:
   ```
   Initial release of GrafTrack
   - Track graffiti locations on interactive map
   - Upload photos with GPS data
   - Share discoveries with community
   ```

### Complete Store Listing
1. **Main store listing:**
   - Copy content from `play-store-listing.txt`
   - Upload icon from `play-store-assets/icon-512.png`

2. **Screenshots** (minimum 2):
   - Use your phone or emulator
   - Show map view and photo upload

3. **Content rating:**
   - Start questionnaire
   - Category: Reference, News, or Educational
   - No violence/drugs/gambling
   - User interaction: Yes

4. **App content:**
   - Target audience: 13+
   - Content: User-generated
   - Ads: No

## 🎯 Step 5: Submit for Review

1. Review all sections (must have green checkmarks)
2. Click **"Send for review"**
3. Confirm submission

## ⏱️ Timeline
- Review time: 2-24 hours (usually same day)
- Once approved, app goes live immediately

## 📊 Post-Launch
- Monitor crash reports in Play Console
- Respond to user reviews
- Track installation statistics

## 🆘 Troubleshooting

**Build fails?**
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

**Keystore issues?**
- Never lose your keystore file
- Use same keystore for all updates
- Keep passwords in password manager

**Upload rejected?**
- Check icon has no transparency
- Ensure screenshots are correct size
- Review content policy violations

---

## 🎉 You're Ready!

Your Android deployment files are prepared. The whole process should take about 1-2 hours including Play Store setup.

Good luck with your launch! 🚀