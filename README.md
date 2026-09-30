# 課堂任務管理器

Web App 個人課堂實作，包含原生 JavaScript 與 Vue 兩個版本。

## 提交入口

- [線上操作網站](https://wenanchang19.github.io/task-manager-classwork/)
- [Vue 版本](https://wenanchang19.github.io/task-manager-classwork/vue.html)
- [完整實作報告：查核點證據、程式解說與測試表](REPORT.md)

報告集中在 **REPORT.md**，圖片直接顯示於 GitHub，不需要下載 ZIP。
發布及驗證狀態以報告中的記錄為準。

## 原始碼

| 檔案 | 用途 |
| --- | --- |
| [index.html](index.html) | 原生版語意化 HTML |
| [styles.css](styles.css) | 共用版面、RWD、hover／focus |
| [app.js](app.js) | 原生版資料與 DOM 操作 |
| [vue.html](vue.html) | Vue 模板與掛載區 |
| [vue-app.js](vue-app.js) | Vue 的 data、methods、computed |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | Vue 來源與授權 |

## 功能與執行方式

原生版具有新增、拒絕空白、完成／取消完成、刪除、三種篩選與即時統計。
Vue 版重新實作新增、完成與刪除，並提供即時統計。
兩個版本皆支援手機尺寸、鍵盤操作與長任務文字換行。

直接使用上述網站，或以瀏覽器開啟 `index.html`。Vue 執行檔包含在
`vendor/`，不需安裝套件或使用 CDN。兩個版本的資料獨立，重新整理會清空任務。
篩選只影響清單，統計顯示所有任務的數量。

## 開發測試

需要 Node.js 與 Python 3；一般使用網站不需要這些工具。

```sh
npm install
npx playwright install chromium
npm run check
npm test
```

自動測試結果保存在 `evidence/test-results.json`。測試與截圖由 Codex 使用
Playwright 執行，報告不會把它記為學生本人測試。學生親自測試及確認仍待完成。

程式由 Codex 依使用者要求產生；AI 使用紀錄已整合在 `REPORT.md` 第十節，請本人核對並保留聊天原文。
