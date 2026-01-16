# Haraz Coffee House - iOS App Build Guide

This project is set up to automatically build an iOS application from your HTML file using **Capacitor** and **GitHub Actions**.

## How it Works
Since you are on Windows, you cannot build iOS apps locally (which requires a Mac and Xcode). Instead, we use a "Virtual Mac" on GitHub to do the work for you.

### 1. Files Added
- `package.json`: Tells GitHub which tools to install (Capacitor).
- `capacitor.config.json`: Configures the app name and settings.
- `.github/workflows/ios-build.yml`: The automation script that runs on GitHub.
- `.gitignore`: Prevents temporary files from being uploaded.

### 2. How to Build the App
1.  **Upload to GitHub**: Create a new repository on GitHub and push all these files to it.
2.  **Wait for Build**: Go to the **Actions** tab on your GitHub repository. You will see a workflow named "Build iOS App" running.
3.  **Get the App**: Once finished, it will output a build folder. Note: To get a real `.ipa` file for your phone, you will eventually need an Apple Developer account.

### 3. Local Development
If you want to test the app functionality while working on the HTML:
- Just open `Haraz_Cafe.html` in your browser as usual.
- The app will look and behave exactly the same way in the iOS app.

## Advanced: Icons and Splash Screens
To add your own logo as the app icon:
1. Create a `resources` folder.
2. Add your icon as `icon.png` (1024x1024).
3. We can then use Capacitor tools to generate all the sizes needed for iOS.

---
*Created with the help of Antigravity.*
