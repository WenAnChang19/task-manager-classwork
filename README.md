# My Task Manager

課堂題目的靜態 Web App，包含原生 JavaScript 與獨立 Vue 版本。

## 開啟網站

直接用瀏覽器開啟 `index.html` 即可使用。右上方連結可切換至 `vue.html`。
Vue 官方執行檔已放在 `vendor/`，網頁不依賴 CDN、套件安裝或建置。

也可以在這個專案目錄執行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

開啟 <http://127.0.0.1:8765/>。這個預覽只供本機使用。

## 功能

- 原生版：新增、拒絕空白、完成／取消完成、刪除、三種篩選、即時統計。
- Vue 版：新增、拒絕空白、完成／取消完成、刪除、即時統計。
- 可用鍵盤操作；桌面與手機共用 RWD 版面，具 hover／focus 效果。
- 任務名稱最多 200 字元；文字會換行，輸入的 HTML 只會顯示為文字。

兩個版本的資料獨立，**重新整理會清空任務**；題目沒有要求儲存資料。
篩選只影響清單，統計始終顯示所有任務的數量。

## 原始碼

| 檔案 | 用途 |
| --- | --- |
| [index.html](index.html) | 原生版語意化 HTML |
| [styles.css](styles.css) | 共用版面、RWD、hover／focus |
| [app.js](app.js) | 原生版資料與 DOM 操作 |
| [vue.html](vue.html) | Vue 模板與掛載區 |
| [vue-app.js](vue-app.js) | Vue 的 data、methods、computed |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | Vue 來源與授權 |

## 測試與提交文件

- [要求對照](docs/requirements.md)
- [程式解說與查核點 4 程式片段](docs/code-explanation.md)
- [自動測試結果與截圖](docs/test-report.md)
- [各查核點證據索引](docs/evidence-index.md)
- [親自測試用表格](docs/manual-test-table.md)
- [AI 使用紀錄](docs/ai-use-record.md)
- [提交前檢查表](docs/submission-checklist.md)

測試需要 Node.js 與 Python 3：

```sh
npm install
npx playwright install chromium
npm run check
npm test
```

`npm test` 啟動只綁定 localhost 的測試伺服器，使用 Chromium 操作兩個版本，
將實際結果寫入 `evidence/test-results.json`、`docs/test-report.md`，並保存截圖。
一般使用網站不需要 npm；這些依賴只用於開發測試。

## 放上 GitHub Pages

本專案尚未公開發布。發布時請先確認要公開的內容，尤其是 AI 對話紀錄。

1. 在 GitHub 建立公開 repository，例如 `task-manager-classwork`。
2. 上傳本專案（包含 `vendor/`；不要上傳 `node_modules/`）。
3. 進入 repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選 **Deploy from a branch**，選 `main` 與 `/ (root)`，儲存。
5. 等 GitHub 顯示實際網站網址後，開啟原生版及 `vue.html`，親自重測。
6. 使用登出／無痕視窗確認網站與原始碼都不需要登入。

GitHub 官方說明：[從 branch 發布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
實際網址以 GitHub 顯示為準；本 README 不把預計網址當成已上線成果。

## 作業作者與 AI 揭露

程式由 Codex 依使用者要求產生，並由 AI 執行自動測試；不能因此聲稱由學生獨力撰寫。
老師規定 AI 只能協助局部問題，這份完整 AI 實作與該限制存在衝突。
請先依老師規定處理使用範圍，親自理解／修改／測試，並如實保留對話與採用方式。
`docs/ai-use-record.md` 不會替學生捏造三段問答、個人決策或反思。

## Vue 參考

使用 Options API 與官方完整 global production build，免建置即可掛載 HTML 模板。
參考 [Vue Quick Start](https://vuejs.org/guide/quick-start.html)、
[Production Deployment](https://vuejs.org/guide/best-practices/production-deployment)、
[List Rendering](https://vuejs.org/guide/essentials/list.html) 與
[Form Input Bindings](https://vuejs.org/guide/essentials/forms.html)。
