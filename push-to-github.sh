#!/bin/bash

# This script pushes your code to GitHub

echo "🚀 Pushing to GitHub..."

# First, make sure codemagic.yaml is staged
git add -f codemagic.yaml

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ codemagic.yaml already committed"
else
    git commit -m "Add Android build configuration"
    echo "✅ Committed codemagic.yaml"
fi

# Now push to GitHub
git push origin main || git push

echo "✅ Done! Go back to Codemagic and click 'Check for configuration file'"