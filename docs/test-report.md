# 瀏覽器自動測試結果

執行者：Codex 使用 Playwright 自動操作 Chromium；不是學生親自測試紀錄。

執行時間：2026/9/30 下午3:57:01（Asia/Taipei）。瀏覽器 Chromium 151.0.7922.34。

這些是 UI 操作測試。老師所稱的 Unit Test Table 包含介面整合與人工測試情境，並非只有函式單元測試。學生仍須親自操作，另填 manual-test-table.md。

| Test Case | 測試內容 | 預期結果 | 實際結果 | Pass/Fail | 證據 |
| --- | --- | --- | --- | --- | --- |
| TC01 | 新增正常任務 | 任務出現，輸入欄清空，統計為 1/1/0 | 新增任務出現，輸入已清空；共 1、未完成 1、已完成 0 | PASS | [TC01-before.png](../evidence/TC01-before.png)、[TC01-after.png](../evidence/TC01-after.png) |
| TC02 | 新增空白任務 | 空字串與純空白皆不新增，顯示提示 | 兩種空白輸入都沒有新增，畫面顯示提示 | PASS | [TC02-before.png](../evidence/TC02-before.png)、[TC02-after.png](../evidence/TC02-after.png) |
| TC03 | 完成任務 | 勾選後變成已完成，統計同步更新 | 任務已勾選且顯示完成樣式；統計為 1/0/1 | PASS | [TC03-before.png](../evidence/TC03-before.png)、[TC03-after.png](../evidence/TC03-after.png) |
| TC04 | 取消完成 | 取消勾選後恢復未完成 | 取消勾選，恢復未完成；統計為 1/1/0 | PASS | [TC04-before.png](../evidence/TC04-before.png)、[TC04-after.png](../evidence/TC04-after.png) |
| TC05 | 刪除任務 | 指定任務消失，其餘任務保留 | 指定任務消失，另一項保留；統計為 1/1/0 | PASS | [TC05-before.png](../evidence/TC05-before.png)、[TC05-after.png](../evidence/TC05-after.png) |
| TC06 | 篩選未完成 | 只顯示未完成，切回全部可看見所有任務 | 未完成篩選只顯示 A/C；全部篩選恢復 A/B/C，統計不受篩選影響 | PASS | [filter-all.png](../evidence/filter-all.png)、[filter-pending.png](../evidence/filter-pending.png) |
| TC07 | 篩選已完成 | 只顯示已完成；空結果有提示 | 僅已完成任務出現；取消完成後該篩選為空並顯示提示 | PASS | [filter-completed.png](../evidence/filter-completed.png)、[filter-empty.png](../evidence/filter-empty.png) |
| TC08 | 統計數字 | 新增、完成、刪除、篩選後統計皆正確 | 依序驗證 0/0/0、2/2/0、2/1/1、1/1/0；篩選不改變統計 | PASS | [TC08-before.png](../evidence/TC08-before.png)、[TC08-after.png](../evidence/TC08-after.png) |
| TC09 | 手機尺寸 | 480、375、320px 長文字不溢出，按鈕可操作 | 三種手機寬度皆無橫向溢出；新增、篩選、完成、刪除可操作 | PASS | [mobile-480.png](../evidence/mobile-480.png)、[mobile-375.png](../evidence/mobile-375.png)、[mobile-320.png](../evidence/mobile-320.png) |
| TC10 | Vue 功能 | Vue 正常啟動，新增、完成／取消、刪除立即更新 | Vue 已掛載；三項操作與取消完成皆更新，拒絕空白；320px 無溢出 | PASS | [vue-before.png](../evidence/vue-before.png)、[vue-added.png](../evidence/vue-added.png)、[vue-completed.png](../evidence/vue-completed.png)、[vue-uncompleted.png](../evidence/vue-uncompleted.png)、[vue-deleted.png](../evidence/vue-deleted.png)、[vue-mobile.png](../evidence/vue-mobile.png) |
| EX01 | 語意、重新整理、鍵盤、文字安全 | 基本 UI 保留，Enter 新增，HTML 字串不執行 | 語意結構存在；Enter 新增與 Space 切換成功；文字安全，重新整理保留 UI，hover 變色 | PASS | [desktop-reloaded.png](../evidence/desktop-reloaded.png)、[hover-before.png](../evidence/hover-before.png)、[hover-after.png](../evidence/hover-after.png)、[focus-after.png](../evidence/focus-after.png) |

重跑：npm install；npx playwright install chromium；npm test。
