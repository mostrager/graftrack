#!/bin/bash

# Generate Android app icons from SVG

echo "📱 Generating Android icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not installed. Installing..."
    sudo apt install imagemagick -y
fi

# Check if SVG exists
if [ ! -f "public/icon.svg" ]; then
    echo "❌ public/icon.svg not found!"
    exit 1
fi

# Create Android icon directories
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

# Generate icons for each density
echo "Generating launcher icons..."
convert -background none -resize 48x48 public/icon.svg android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert -background none -resize 72x72 public/icon.svg android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert -background none -resize 96x96 public/icon.svg android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert -background none -resize 144x144 public/icon.svg android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert -background none -resize 192x192 public/icon.svg android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Generate round icons (same as regular for now)
echo "Generating round launcher icons..."
cp android/app/src/main/res/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# Generate foreground icons for adaptive icons
echo "Generating adaptive icon layers..."
convert -background none -resize 108x108 public/icon.svg android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
convert -background none -resize 162x162 public/icon.svg android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
convert -background none -resize 216x216 public/icon.svg android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
convert -background none -resize 324x324 public/icon.svg android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
convert -background none -resize 432x432 public/icon.svg android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

# Generate Play Store icon
echo "Generating Play Store icon..."
mkdir -p play-store-assets
convert -background none -resize 512x512 public/icon.svg play-store-assets/icon-512.png

echo "✅ Android icons generated successfully!"
echo ""
echo "Icons created in:"
echo "  - android/app/src/main/res/mipmap-* (app icons)"
echo "  - play-store-assets/icon-512.png (Play Store)"