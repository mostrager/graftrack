#!/bin/bash

echo "🚀 GrafTrack Native App Builder"
echo "================================"
echo ""

# Build the web app
echo "📦 Building web app..."
npm run build

# Sync with native projects
echo "🔄 Syncing with native projects..."
npx cap sync

echo ""
echo "✅ Build preparation complete!"
echo ""
echo "Next steps:"
echo ""
echo "For iOS (Mac only):"
echo "  1. Run: npx cap open ios"
echo "  2. In Xcode: Product → Archive"
echo "  3. Upload to App Store Connect"
echo ""
echo "For Android:"
echo "  1. Run: npx cap open android"
echo "  2. In Android Studio: Build → Generate Signed Bundle"
echo "  3. Upload to Google Play Console"
echo ""
echo "See APP_STORE_GUIDE.md for detailed instructions!"