# 🎯 SUPER SIMPLE Android Deployment

## Option 1: Quick Test APK (5 minutes)
**No Android Studio needed! Just test on your phone:**

```bash
# 1. Build debug APK (no signing needed)
cd android
chmod +x gradlew
./gradlew assembleDebug

# 2. Find your APK
# Location: android/app/build/outputs/apk/debug/app-debug.apk

# 3. Transfer to your phone:
# - Email it to yourself
# - Upload to Google Drive
# - Use USB cable
```

**On your phone:**
1. Settings → Security → Allow "Unknown Sources"
2. Open the APK file
3. Install and run!

---

## Option 2: Play Store Release (Without Android Studio)

### Step 1: Create Signing Key
```bash
# Run this once to create your keystore
keytool -genkey -v \
  -keystore ~/graftrack.keystore \
  -alias graftrack \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```
**Answer the questions** (name, organization, etc.)
**SAVE YOUR PASSWORD!**

### Step 2: Build Release AAB
```bash
cd android
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=$HOME/graftrack.keystore \
  -Pandroid.injected.signing.store.password=YOUR_PASSWORD \
  -Pandroid.injected.signing.key.alias=graftrack \
  -Pandroid.injected.signing.key.password=YOUR_PASSWORD
```

### Step 3: Upload to Play Store
1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay $25 (one-time)
3. Create app → Upload AAB
4. File location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🆘 Troubleshooting

**Java not found?**
```bash
# Install Java 17
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

**Build too slow?**
First build downloads ~200MB of dependencies. Be patient!

**Can't find APK?**
```bash
find android -name "*.apk"
```

---

## 🎉 That's it!
Your debug APK is ready to test in minutes.
No Android Studio needed!