# Focus App: VS Code & Mobile App 開發指南

這份指南將協助你在本地環境（VS Code）中繼續開發 "Focus" App，並將其打包成 iOS 或 Android 應用程式。

## 1. 準備工作

在開始之前，請確保你的電腦已安裝以下工具：
- **Node.js** (建議 v18 以上)
- **VS Code**
- **Android Studio** (用於開發 Android App)
- **Xcode** (僅限 Mac，用於開發 iOS App)

## 2. 下載專案

1. 在 AI Studio 中點擊右上角的 **Settings**。
2. 選擇 **Download ZIP** 或 **Export to GitHub**。
3. 解壓縮並在 VS Code 中開啟該資料夾。

## 3. 安裝依賴

在 VS Code 的終端機執行：
```bash
npm install
```

## 4. 初始化 Capacitor

專案已經預裝了 Capacitor 核心套件。請執行以下指令初始化：
```bash
npx cap init
```
- **App name**: Focus
- **App ID**: com.focus.study (或你自定義的 ID)
- **Web asset directory**: dist

## 5. 打包與同步

每次修改網頁程式碼後，請執行以下流程：

1. **編譯網頁程式碼**：
   ```bash
   npm run build
   ```

2. **同步到手機平台**：
   ```bash
   npx cap sync
   ```

## 6. 開啟原生專案

### Android
```bash
npx cap open android
```
這會開啟 Android Studio。你可以點擊 **Run** 按鈕在模擬器或實體手機上執行。

### iOS (僅限 Mac)
```bash
npx cap open ios
```
這會開啟 Xcode。

## 7. Firebase 注意事項

- **Google 登入**：在手機 App 上使用 Google 登入需要額外的設定（如 SHA-1 憑證）。
- **Firestore 規則**：目前的規則已設定為僅允許驗證使用者存取。

---

祝你開發順利！如果有任何問題，隨時回來問我。
