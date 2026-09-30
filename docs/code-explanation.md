# 程式理解與查核點 4

以下片段來自實際 app.js 第 3–30 行，共 28 行。截圖見 [JavaScript](../evidence/code-javascript.png)。

```js
const tasks = [];
let nextTaskId = 1;
let activeFilter = "all";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const formMessage = document.querySelector("#form-message");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll(".filter-button");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const taskName = taskInput.value.trim();

  if (!taskName) {
    showMessage("請輸入任務內容。", true);
    taskInput.focus();
    return;
  }

  tasks.push({ id: nextTaskId, name: taskName, completed: false });
  nextTaskId += 1;
  taskForm.reset();
  showMessage("任務已新增。", false);
  renderTasks();
  taskInput.focus();
});
```

- **保存任務的變數**：`tasks` 是陣列。每個任務包含 `id`、`name`、`completed`。
- **新增任務**：submit 事件裡的 `tasks.push(...)` 把一個未完成任務放進陣列。
- **更新畫面**：新增後呼叫 `renderTasks()`（完整函式在 app.js）。
- `trim()` 去掉頭尾空白；`if (!taskName)` 拒絕空字串及純空白。
- `preventDefault()` 避免表單送出時重新載入頁面。
- `nextTaskId` 每次加一，讓同名任務也能用不同 ID 完成或刪除。
- `const tasks` 表示不能重新指派這個變數，但仍可以 push/splice 修改陣列。

## 資料到畫面的流程

1. 新增、完成、刪除先修改 `tasks`。
2. `renderTasks()` 依目前篩選建立 li、checkbox、名稱、刪除按鈕。
3. 名稱使用 `textContent`，輸入的 HTML 字串不會被當作 HTML 執行。
4. `updateSummary()` 依完整的 tasks 更新總數／未完成／已完成。

篩選使用 `filter()` 產生顯示用的陣列，不會刪掉原始任務。
例如三個任務有一個完成：未完成清單顯示兩項，但統計仍是總數 3、未完成 2、已完成 1。

## 查核點 1-2：重要語意區域

實際 index.html 第 42–61 行，含標示重要區域的註解。
截圖見 [HTML](../evidence/code-html.png)。

```html
      <!-- 重要語意區：任務清單與操作狀態集中在這個 section。 -->
      <section class="panel task-panel" aria-labelledby="list-heading">
        <div class="section-heading">
          <h2 id="list-heading">任務清單</h2>
          <div class="filters" aria-label="篩選任務">
            <button class="filter-button" type="button" data-filter="all" aria-pressed="true">全部</button>
            <button class="filter-button" type="button" data-filter="pending" aria-pressed="false">未完成</button>
            <button class="filter-button" type="button" data-filter="completed" aria-pressed="false">已完成</button>
          </div>
        </div>

        <p id="empty-state" class="empty-state">目前沒有任務</p>
        <ul id="task-list" class="task-list" aria-label="任務"></ul>

        <div id="stats" class="stats" aria-label="任務統計">
          <p>總數 <strong id="total-count">0</strong></p>
          <p>未完成 <strong id="pending-count">0</strong></p>
          <p>已完成 <strong id="completed-count">0</strong></p>
        </div>
      </section>
```

`section` 配合 `aria-labelledby` 表明這是任務清單區塊；`ul` 表明內容為清單。
新增後 JavaScript 會建立真正的 `li`，每項包含可操作 checkbox 的 `label` 和 `button`。
畫面標題使用 header，主要內容使用 main，任務輸入使用 form 與 label。

## Vue 與原生版本的差異

- `data()` 回傳 tasks 和輸入內容，Vue 會追蹤它們。
- `v-model="newTaskName"` 連動輸入內容。
- `@submit.prevent="addTask"` 處理表單提交並阻止重新整理。
- `v-for` 依 tasks 渲染清單，`:key="task.id"` 辨識每一項。
- `:checked` 配合 `@change` 把 checkbox 連到任務完成狀態。
- `computed` 由任務資料計算三個數字。
- 修改資料後 Vue 會更新模板，因此不需要自己呼叫 renderTasks()。

請你親自讀過與操作後，再用自己的話說明這些流程。
