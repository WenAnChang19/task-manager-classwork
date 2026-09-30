# 查核點證據索引

提交用的查核點、圖片、程式說明與測試表已統一在 [REPORT.md](../REPORT.md)。
本檔保留原始本機測試圖片索引。

以下 PNG 由 Playwright 在實際瀏覽器操作後拍攝，執行者為 AI 自動測試。
請核對畫面與程式，並依老師要求補上你親自測試的紀錄。
完整結果見 [test-report.md](test-report.md) 與 [JSON 原始結果](../evidence/test-results.json)。
另有依使用者要求實際新增三項任務的 [操作前後截圖示範](add-task-demo.md)。

| 查核點 | 證據 |
| --- | --- |
| 1-1 基本結構、重新整理保留 UI | [桌面完整畫面](../evidence/desktop-reloaded.png) |
| 1-2 重要語意化區域 | [HTML 程式片段](code-explanation.md)、[HTML 片段截圖](../evidence/code-html.png) |
| 2-1 基本版面 | [有任務的桌面畫面](../evidence/filter-all.png) |
| 2-2 RWD | [桌面](../evidence/filter-all.png)、[480px](../evidence/mobile-480.png)、[375px](../evidence/mobile-375.png)、[320px](../evidence/mobile-320.png) |
| 2-3 hover／focus | [hover 前](../evidence/hover-before.png)、[hover 後](../evidence/hover-after.png)、[輸入框 focus](../evidence/focus-after.png) |
| 3-1 新增任務 | [前](../evidence/TC01-before.png)、[後](../evidence/TC01-after.png)；[空白提示](../evidence/TC02-after.png) |
| 3-2 完成／取消完成 | [未完成](../evidence/TC03-before.png)、[已完成](../evidence/TC03-after.png)；[取消前](../evidence/TC04-before.png)、[取消後](../evidence/TC04-after.png) |
| 3-3 刪除任務 | [前](../evidence/TC05-before.png)、[後](../evidence/TC05-after.png) |
| 3-4 篩選 | [全部](../evidence/filter-all.png)、[未完成](../evidence/filter-pending.png)、[已完成](../evidence/filter-completed.png) |
| 3-5 統計同步 | [前 2/2/0](../evidence/TC08-before.png)、[後 2/1/1](../evidence/TC08-after.png) |
| 4 程式驗證 | [10–30 行程式與說明](code-explanation.md)、[JavaScript 片段截圖](../evidence/code-javascript.png) |
| 5-1 Vue 啟動 | [初始 Vue 畫面](../evidence/vue-before.png) |
| 5-2 Vue 新增 | [前](../evidence/vue-before.png)、[後](../evidence/vue-added.png) |
| 5-3 Vue 完成／取消完成 | [前](../evidence/vue-added.png)、[後](../evidence/vue-completed.png)、[取消後](../evidence/vue-uncompleted.png) |
| 5-4 Vue 刪除 | [前](../evidence/vue-uncompleted.png)、[後](../evidence/vue-deleted.png) |
| 至少兩個 Test Case | TC02 [前](../evidence/TC02-before.png)／[後](../evidence/TC02-after.png)，TC05 [前](../evidence/TC05-before.png)／[後](../evidence/TC05-after.png)；實際結果在測試表 |

## 證據的範圍

自動測試使用本機 HTTP 靜態伺服器。這些截圖證明測試時本機功能可用；
GitHub Pages 的發布與公開網址驗證另記於 [REPORT.md](../REPORT.md)。
圖中內容是測試任務，沒有替學生填寫個人姓名、心得或 AI 反思。
