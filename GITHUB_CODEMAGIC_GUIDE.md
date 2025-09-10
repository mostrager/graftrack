# 📱 Build Your Android App - Step by Step

## Step 1: Create GitHub Account (if needed)
1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Enter email, password, username
4. Verify your email

## Step 2: Create a New GitHub Repository
1. Click the "+" icon (top right) → "New repository"
2. Name it: `graftrack`
3. Make it **Public** (required for free Codemagic)
4. DON'T add README, .gitignore, or license
5. Click "Create repository"

## Step 3: Push Your Code to GitHub

Copy and run these commands in order:

```bash
# Initialize git in your project
git init

# Add all your files
git add .

# Create your first commit
git commit -m "Initial commit - GrafTrack app"

# Connect to your GitHub repo (REPLACE with your username)
git remote add origin https://github.com/YOUR_USERNAME/graftrack.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If asked for credentials:**
- Username: Your GitHub username
- Password: You need a Personal Access Token (not your password)
  - Go to GitHub → Settings → Developer settings → Personal access tokens
  - Generate new token → Give it repo permissions → Copy token
  - Use this token as password

## Step 4: Set Up Codemagic

1. Go to [codemagic.io](https://codemagic.io)
2. Click "Sign up" → "Continue with GitHub"
3. Authorize Codemagic
4. Click "Add application"
5. Select "Other" platform
6. Choose your `graftrack` repository
7. Select "Android" workflow

## Step 5: Configure Build Settings

In Codemagic, create this workflow file:

**Click "Start new build" → "Edit workflow"**

Add this `codemagic.yaml` to your repository:

```yaml
workflows:
  android-workflow:
    name: Android Build
    max_build_duration: 60
    environment:
      android_signing:
        - keystore_reference
      groups:
        - google_play
      vars:
        PACKAGE_NAME: "com.graftrack.app"
      node: 18
    scripts:
      - name: Install npm dependencies
        script: |
          npm install
          
      - name: Build web app
        script: |
          npm run build
          
      - name: Add Android platform
        script: |
          npx cap sync android
          
      - name: Set Android SDK location
        script: |
          echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
          
      - name: Build Android debug APK
        script: |
          cd android
          ./gradlew assembleDebug
          
    artifacts:
      - android/app/build/outputs/**/*.apk
      - android/app/build/outputs/**/*.aab
```

## Step 6: Start Build

1. Save the workflow
2. Click "Start new build"
3. Select branch: `main`
4. Click "Start build"
5. Wait 5-10 minutes
6. Download your APK!

## Troubleshooting

**"Repository not found"**
- Make sure repo is Public
- Refresh Codemagic and try again

**"Build failed"**
- Check the build logs
- Most common: Missing dependencies

**"Can't push to GitHub"**
- Make sure you're using Personal Access Token, not password
- Check your remote URL is correct

---

## 🎉 That's it!
Your APK will be ready to download in about 10 minutes!