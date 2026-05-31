# Workout Record

一個部署到 Vercel 的健身紀錄網站。目標是記錄每次訓練的日期、項目、重量、次數、組數等資訊，並依照不同項目檢視訓練趨勢圖。

目前只建立初始骨架與 placeholder 頁面，還沒有實作資料儲存、表單或圖表。

## 技術棧

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **SCSS** for styling, no Tailwind CSS
- **Vercel** for deployment

## 頁面骨架

| Route | 用途 |
| --- | --- |
| `/` | 首頁，之後顯示近期訓練摘要與快速入口 |
| `/workouts/new` | 新增訓練量頁面，之後放訓練紀錄表單 |
| `/trends` | 趨勢圖頁面，之後依項目檢查重量、次數或訓練量趨勢 |

## 本地開發

```powershell
npm install
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)。

## Scripts

```powershell
npm run dev
npm run build
npm run start
npm run lint
```

## 專案結構

```text
src/
	app/
		globals.scss
		layout.tsx
		page.tsx
		trends/page.tsx
		workouts/new/page.tsx
```

## 開發規範

- 專案專屬 agent/system prompt 寫在 `AGENTS.md`，`CLAUDE.md` 會引用同一份內容。
- 開發過程中提到的新注意事項要持續記錄到 `memory.md`。
- CSS 請使用 `.scss` 或 `.module.scss`，不要加入 Tailwind，除非之後明確改變方向。
- 新增 component 或 util function 時，應補上對應 unit test；每次改動後確認 lint 與 test 狀態。

## E2E Test 候選方案

尚未安裝 E2E 工具。初步建議優先評估 **Playwright**，因為它和 Next/Vercel 生態整合成熟，支援 Chromium、Firefox、WebKit、多 viewport、trace viewer，也適合之後驗證表單輸入與趨勢圖互動。

可比較的替代方案：

- **Cypress**：互動式 debug 體驗很好，適合前端團隊熟悉瀏覽器測試流程時使用。
- **Vitest Browser Mode**：適合較接近 component/integration 的瀏覽器測試，但完整跨瀏覽器 E2E 能力仍以 Playwright 較完整。

## 部署到 Vercel

1. 將專案 push 到 GitHub。
2. 在 Vercel 新增 Project，選擇此 repository。
3. Framework Preset 選 Next.js。
4. Build command 使用 `npm run build`，Output directory 保持 Next.js 預設值。
