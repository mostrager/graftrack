#!/bin/bash

echo "🚀 GrafTrack Android Builder (No Android Studio Required!)"
echo "========================================================="
echo ""

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    echo "📱 Setting up Android SDK..."
    echo ""
    echo "Option 1: Download Android command line tools:"
    echo "  wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    echo "  unzip commandlinetools-linux-*.zip"
    echo "  export ANDROID_HOME=$HOME/android-sdk"
    echo ""
    echo "Option 2: Install via snap:"
    echo "  sudo snap install android-sdk --classic"
    echo "  export ANDROID_HOME=/snap/android-sdk/current/android-sdk"
    echo ""
    exit 1
fi

# Build the web app first
echo "📦 Building web app..."
npm run build

# Sync with Android
echo "🔄 Syncing with Android..."
npx cap sync android

# Navigate to Android directory
cd android

# Make gradlew executable
chmod +x gradlew

echo ""
echo "Choose build type:"
echo "1) Debug APK (for testing - no signing needed)"
echo "2) Release AAB (for Play Store - requires signing)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🔨 Building Debug APK..."
        ./gradlew assembleDebug
        
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        if [ -f "$APK_PATH" ]; then
            echo ""
            echo "✅ Debug APK built successfully!"
            echo "📍 Location: android/$APK_PATH"
            echo ""
            echo "To install on your phone:"
            echo "1. Enable Developer Mode on your Android phone"
            echo "2. Enable USB Debugging"
            echo "3. Connect via USB and run:"
            echo "   adb install android/$APK_PATH"
            echo ""
            echo "Or transfer the APK file to your phone and install directly."
        else
            echo "❌ Build failed. Check error messages above."
        fi
        ;;
    2)
        echo "🔑 Creating Release Build..."
        echo ""
        echo "You need a keystore file. Create one with:"
        echo "keytool -genkey -v -keystore ~/graftrack-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias graftrack"
        echo ""
        read -p "Enter keystore path (or press Enter to create new): " KEYSTORE_PATH
        
        if [ -z "$KEYSTORE_PATH" ]; then
            KEYSTORE_PATH="$HOME/graftrack-release.keystore"
            if [ ! -f "$KEYSTORE_PATH" ]; then
                echo "Creating new keystore..."
                keytool -genkey -v -keystore "$KEYSTORE_PATH" -keyalg RSA -keysize 2048 -validity 10000 -alias graftrack
            fi
        fi
        
        read -s -p "Enter keystore password: " KEYSTORE_PASSWORD
        echo ""
        read -p "Enter key alias (default: graftrack): " KEY_ALIAS
        KEY_ALIAS=${KEY_ALIAS:-graftrack}
        read -s -p "Enter key password: " KEY_PASSWORD
        echo ""
        
        echo "Building release AAB..."
        ./gradlew bundleRelease \
            -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
            -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
            -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
            -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
        
        AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
        if [ -f "$AAB_PATH" ]; then
            echo ""
            echo "✅ Release AAB built successfully!"
            echo "📍 Location: android/$AAB_PATH"
            echo ""
            echo "This file is ready to upload to Google Play Console!"
            echo "⚠️ IMPORTANT: Save your keystore file and passwords securely!"
        else
            echo "❌ Build failed. Check error messages above."
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

cd ..
echo ""
echo "🎉 Done!"