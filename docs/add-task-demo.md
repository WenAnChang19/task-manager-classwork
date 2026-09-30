# 新增任務與截圖示範

執行者：Codex 使用 Playwright 操作獨立測試瀏覽器；非學生親自測試。
原始執行時間、瀏覽器與驗證結果見 [JSON](../evidence/add-demo-results.json)。
這次沒有修改應用程式，也沒有操作使用者目前開啟的頁面。

| 操作 | 預期 | 實際 | 結果 | 畫面 |
| --- | --- | --- | --- | --- |
| 新增前，已輸入「完成 Web App 實作」 | 清單為空，總數 0 | 清單為空，總數 0 | PASS | [新增前](../evidence/add-demo-before.png) |
| 新增「完成 Web App 實作」 | 清單 1 項，未完成 1、已完成 0 | 名稱正確，1／1／0，輸入已清空 | PASS | [新增第 1 項後](../evidence/add-demo-after-1.png) |
| 新增「完成 JavaScript 練習」 | 清單 2 項，未完成 2、已完成 0 | 名稱正確，2／2／0，輸入已清空 | PASS | [新增第 2 項後](../evidence/add-demo-after-2.png) |
| 新增「整理作業提交資料」 | 清單 3 項，未完成 3、已完成 0 | 名稱正確，3／3／0，輸入已清空 | PASS | [新增第 3 項後](../evidence/add-demo-after-3.png) |

重跑時先啟動 README 的本機伺服器，再執行 `node tests/capture-add-demo.cjs`。
這些圖片可核對新增查核點與 TC01；老師要求的本人操作確認仍須由你完成。
任務只保存在該測試頁的記憶體，不會同步到其他頁面，重新整理會清空。
