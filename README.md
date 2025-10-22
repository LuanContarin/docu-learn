<p align="center"><img src="app/assets/images/icon.png" alt="DocuLearn Logo" width="250"></p>

**DocuLearn** is an intelligent mobile app built with **Expo + React Native** that allows users to read documents, tap on words, and instantly translate them between **English 🇺🇸 → Portuguese 🇧🇷** using an integrated AI-powered translation API.

<ul id="content-table" align="left">
   <li><a href="#features">Features</a></li>
   <li><a href="#technologies">Technologies</a></li>
   <li><a href="#how-to-run">How to run</a></li>
   <li><a href="#screenshots">Screenshots</a></li>
</ul>

<h2 id="features" align="left">🧠 Features</h2>

- 📖 **Document reader:** Upload and read PDF books directly within the app.
- 🔍 **Instant translation:** Tap on any word to get its translation from English → Portuguese.
- 💾 **Local storage:** Books are saved locally using Expo FileSystem, inside the app folder.
- 🗂️ **Book management:** Add and view books easily.
- 🤖 **AI translation API:** Connects to a Flask-based Python backend that serves a TensorFlow/Keras translation model.
- 🎨 **UI:** Built with default dark theming, icons, and a minimalist interface.

<h2 id="technologies" align="left">⚙️ Technologies</h2>

**Mobile App (Frontend)**

- **Expo + React Native:** Cross-platform mobile development framework.
- **@react-native-ml-kit:** OCR library for text extraction w/ Google ML Kit.

**API (Backend)**

- **Python + Flask:** Lightweight REST API to serve translation results.
- **TensorFlow / Keras:** Deep learning model for text translation.
- **NumPy:** Data processing and numerical operations.

<h2 id="how-to-run" align="left">▶️ How to run</h2>

### 🧩 Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI (With dev build)](https://docs.expo.dev/get-started/installation/)
- [Python 3.12](https://www.python.org/downloads/)

### 🚀 Run the App

This project uses **React Native with native dependencies**, so it **cannot be run with Expo Go**.  
You’ll need to build a **development client** or run it directly through **Metro with native builds**.

#### 1. Install dependencies

```bash
npm install
# or
yarn install
```

#### 2. Prebuild the native project

```bash
npx expo prebuild
```

If it’s a bare React Native app, skip this step.

#### 3. Start the Metro bundler

```bash
npx expo start --dev-client
```

> 💡 Do **not** use “Run in Expo Go” — it won’t work because Expo Go doesn’t include native dependencies.

#### 4. Run the app on a device or emulator

Choose one of the following:

```bash
# Android
npx expo run:android

# iOS (on macOS)
npx expo run:ios
```

#### 5. (Optional) Create a custom dev build

To make testing easier, you can create and reuse a dev build:

```bash
npx expo run:android --variant release
```

Then, you can open the app manually and connect it to Metro via the QR code printed in the terminal.

### 🧠 Run the Translation API

1. **Install dependencies**

   ```bash
   pip install numpy tensorflow keras flask
   ```

2. **Start the Flask API**

   ```bash
   python api.py
   ```

3. The API will be available at:

   ```
   http://localhost:5000
   ```

<h2 id="screenshots" align="left">🖼️ Screenshots</h2>

<p align="center">
   TODO: Add screenshots here
  <!-- <img src="screenshots/1.png" width="240" alt="Reader Screen">
  <img src="screenshots/2.png" width="240" alt="Translation Modal">
  <img src="screenshots/3.png" width="240" alt="Book List"> -->
</p>

<h4 align="center">📚 Built with passion to help learning new languages ❤️</h4>
