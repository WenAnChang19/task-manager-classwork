# 最終驗證備註

2026-09-30，執行者為 Codex 與獨立測試／檢查代理；非學生親自測試。

- `npm run check` 與 `node --check tests/browser-test.cjs` 通過。
- 最後一輪 `npm test`：TC01–TC10 與 EX01，共 11／11 PASS。
- Chromium 151.0.7922.34；本輪結果在 [JSON](../evidence/test-results.json)。
- 以 `file://` 直接開啟原生版與 Vue 版，新增、切換完成、刪除及原生篩選通過。
- 以只包含本專案的暫存伺服器模擬 GitHub Pages 的
  `/task-manager-classwork/` 子路徑：兩版互動、樣式、腳本與導覽皆通過，
  沒有 page、console 或 request 錯誤。
- 桌面、375px 長文字畫面及兩張程式片段截圖均已目視檢查，沒有裁切或橫向溢出。
- 獨立程式檢查發現的連結對比、刪除後鍵盤焦點及測試工具等待問題均已修正。
- 所有文件中的本機相對連結已檢查，沒有缺檔。

## 使用者要求簡化 UI 後的再次驗證

- 兩版頁首移除英文與副標，輸入欄移除 placeholder，空清單顯示「目前沒有任務」。
- 改用灰白底與簡單藍色按鈕，移除漸層、陰影及按鈕位移效果。
- 已再次執行 `npm run check`、`npm test`，11／11 PASS；結果與所有 UI 截圖已更新。
- 已重新執行三次新增示範，3／3 PASS，操作前後截圖已更新。
- 使用 Chromium 另外核對兩版文字、placeholder、背景與陰影，均符合本次要求。
- HTML 程式片段改用現有 index.html 第 42–61 行，兩張程式截圖已重新產生。

尚未驗證實際公開網站，因為本次交付仍在本機。發布 GitHub Pages 後須再操作一次。
任務不持久化，重新整理會清空；兩版資料獨立。
