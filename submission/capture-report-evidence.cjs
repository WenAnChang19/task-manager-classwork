"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(__dirname, "report-evidence");
const baseUrl = "http://127.0.0.1:8765";
const runner = "Codex 使用 Playwright 自動操作 Chromium；不是學生親自測試紀錄";
const results = {};

let browser;

function pngDimensions(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", "expected PNG screenshot");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function recordScreenshot(target, filename, metadata, options = {}) {
  const outputPath = path.join(outputDirectory, filename);
  await target.screenshot({ path: outputPath, animations: "disabled", ...options });
  const dimensions = pngDimensions(await fs.readFile(outputPath));
  results[filename] = {
    ...metadata,
    actual: metadata.actual,
    runner,
    time: new Date().toISOString(),
    status: "PASS",
    dimensions,
  };
}

async function counters(page, total, pending, completed) {
  for (const [selector, expected] of [
    ["#total-count", total],
    ["#pending-count", pending],
    ["#completed-count", completed],
  ]) {
    assert.equal((await page.locator(selector).innerText()).trim(), String(expected), selector);
  }
}

async function rowNames(page) {
  return page.locator(".task-name").allTextContents();
}

async function addTask(page, name) {
  await page.locator("#task-input").fill(name);
  await page.locator(".add-button").click();
}

async function openPage(fileName, viewport = { width: 1280, height: 900 }) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ""}`);
  });
  await page.goto(`${baseUrl}/${fileName}`, { waitUntil: "load" });
  if (fileName === "vue.html") {
    await page.waitForFunction(() => document.querySelector("#vue-app")?.hasAttribute("data-v-app"));
  }
  return { page, errors };
}

async function closeVerified(page, errors) {
  assert.deepEqual(errors, [], "browser errors during evidence capture");
  await page.close();
}

async function captureInitial() {
  const { page, errors } = await openPage("index.html");
  assert.equal(await page.locator("h1").innerText(), "課堂任務管理器");
  assert.equal(await page.locator(".task-item").count(), 0);
  assert.equal((await page.locator("#empty-state").innerText()).trim(), "目前沒有任務");
  await counters(page, 0, 0, 0);
  await recordScreenshot(page, "desktop-overall.png", {
    action: "在 1280×900 Chromium 中開啟原生版本首頁",
    expected: "頁首、版本連結、新增表單與空任務清單完整顯示",
    actual: "完整頁面顯示，空清單與統計 0/0/0 正確",
  }, { fullPage: true });
  await recordScreenshot(page.locator("main"), "initial-ui.png", {
    action: "擷取原生版本 main 區域的初始狀態",
    expected: "報告主要功能區清楚顯示空清單",
    actual: "新增表單、空清單提示與統計 0/0/0 均可見",
  });
  await closeVerified(page, errors);
}

async function captureAdd() {
  const { page, errors } = await openPage("index.html");
  const name = "完成 Web App 實作";
  await page.locator("#task-input").fill(name);
  assert.equal(await page.locator("#task-input").inputValue(), name);
  assert.equal(await page.locator(".task-item").count(), 0);
  await recordScreenshot(page.locator("main"), "add-before.png", {
    action: `在任務輸入欄輸入「${name}」，尚未送出`,
    expected: "輸入文字可見，清單仍為空",
    actual: "輸入值正確且任務列數為 0",
  });
  await page.locator(".add-button").click();
  assert.deepEqual(await rowNames(page), [name]);
  assert.equal(await page.locator("#task-input").inputValue(), "");
  await counters(page, 1, 1, 0);
  await recordScreenshot(page.locator("main"), "add-after.png", {
    action: "按下新增任務",
    expected: "任務加入清單、輸入欄清空、統計更新",
    actual: `清單顯示「${name}」，輸入欄已清空，統計 1/1/0`,
  });
  await closeVerified(page, errors);
}

async function captureBlank() {
  const { page, errors } = await openPage("index.html");
  await page.locator("#task-input").fill("   ");
  assert.equal(await page.locator(".task-item").count(), 0);
  await recordScreenshot(page.locator("main"), "blank-before.png", {
    action: "在輸入欄放入純空白字元，尚未送出",
    expected: "畫面仍沒有任務",
    actual: "任務列數為 0，統計 0/0/0",
  });
  await page.locator(".add-button").click();
  assert.equal(await page.locator(".task-item").count(), 0);
  assert.equal((await page.locator("#form-message").innerText()).trim(), "請輸入任務內容。");
  await counters(page, 0, 0, 0);
  await recordScreenshot(page.locator("main"), "blank-after.png", {
    action: "送出純空白任務",
    expected: "拒絕新增並顯示輸入提示",
    actual: "沒有新增任務，顯示「請輸入任務內容。」，統計維持 0/0/0",
  });
  await closeVerified(page, errors);
}

async function captureToggle() {
  const { page, errors } = await openPage("index.html");
  const name = "完成 JavaScript 練習";
  await addTask(page, name);
  assert.equal(await page.locator(".task-item input").isChecked(), false);
  await counters(page, 1, 1, 0);
  await recordScreenshot(page.locator("main"), "toggle-before.png", {
    action: `新增「${name}」，尚未勾選`,
    expected: "任務呈現未完成狀態",
    actual: "核取方塊未勾選，統計 1/1/0",
  });
  await page.locator(".task-item input").click();
  assert.equal(await page.locator(".task-item input").isChecked(), true);
  assert.ok((await page.locator(".task-item").getAttribute("class")).includes("completed"));
  await counters(page, 1, 0, 1);
  await recordScreenshot(page.locator("main"), "toggle-after.png", {
    action: "勾選任務核取方塊",
    expected: "任務呈現完成樣式且統計更新",
    actual: "核取方塊已勾選、任務有 completed 樣式，統計 1/0/1",
  });
  await page.locator(".task-item input").click();
  assert.equal(await page.locator(".task-item input").isChecked(), false);
  await counters(page, 1, 1, 0);
  await recordScreenshot(page.locator("main"), "untoggle-after.png", {
    action: "再次按下核取方塊取消完成",
    expected: "任務恢復未完成狀態",
    actual: "核取方塊未勾選，完成樣式移除，統計 1/1/0",
  });
  await closeVerified(page, errors);
}

async function captureDelete() {
  const { page, errors } = await openPage("index.html");
  await addTask(page, "完成 Web App 實作");
  await addTask(page, "整理作業提交資料");
  assert.deepEqual(await rowNames(page), ["完成 Web App 實作", "整理作業提交資料"]);
  await counters(page, 2, 2, 0);
  await recordScreenshot(page.locator("main"), "delete-before.png", {
    action: "建立兩項任務，準備刪除第一項",
    expected: "兩項任務與各自刪除按鈕可見",
    actual: "兩項任務順序正確，統計 2/2/0",
  });
  await page.locator(".task-item").filter({ hasText: "完成 Web App 實作" }).locator(".delete-button").click();
  assert.deepEqual(await rowNames(page), ["整理作業提交資料"]);
  await counters(page, 1, 1, 0);
  await recordScreenshot(page.locator("main"), "delete-after.png", {
    action: "刪除「完成 Web App 實作」",
    expected: "指定任務消失，另一項保留",
    actual: "僅保留「整理作業提交資料」，統計 1/1/0",
  });
  await closeVerified(page, errors);
}

async function seedFilterTasks(page) {
  for (const name of ["完成 Web App 實作", "完成 JavaScript 練習", "整理作業提交資料"]) {
    await addTask(page, name);
  }
  await page.locator(".task-item").filter({ hasText: "完成 JavaScript 練習" }).locator("input").click();
  await counters(page, 3, 2, 1);
}

async function captureFilters() {
  const { page, errors } = await openPage("index.html");
  await seedFilterTasks(page);
  assert.deepEqual(await rowNames(page), ["完成 Web App 實作", "完成 JavaScript 練習", "整理作業提交資料"]);
  await recordScreenshot(page.locator("main"), "filter-all.png", {
    action: "以相同三項任務選擇「全部」，中間任務已完成",
    expected: "三項任務依原順序顯示",
    actual: "依序顯示 Web App、JavaScript、提交資料；統計 3/2/1",
  });
  await page.locator("[data-filter=pending]").click();
  assert.deepEqual(await rowNames(page), ["完成 Web App 實作", "整理作業提交資料"]);
  await counters(page, 3, 2, 1);
  await recordScreenshot(page.locator("main"), "filter-pending.png", {
    action: "以同一組資料選擇「未完成」",
    expected: "只顯示第一與第三項未完成任務",
    actual: "顯示 Web App 與提交資料兩項，整體統計仍為 3/2/1",
  });
  await page.locator("[data-filter=completed]").click();
  assert.deepEqual(await rowNames(page), ["完成 JavaScript 練習"]);
  await counters(page, 3, 2, 1);
  await recordScreenshot(page.locator("main"), "filter-completed.png", {
    action: "以同一組資料選擇「已完成」",
    expected: "只顯示中間的已完成任務",
    actual: "只顯示「完成 JavaScript 練習」，整體統計仍為 3/2/1",
  });
  await closeVerified(page, errors);
}

async function captureStats() {
  const { page, errors } = await openPage("index.html");
  for (const name of ["完成 Web App 實作", "完成 JavaScript 練習"]) {
    await addTask(page, name);
  }
  await counters(page, 2, 2, 0);
  await recordScreenshot(page.locator("main"), "stats-before.png", {
    action: "新增兩項未完成任務",
    expected: "統計顯示總數 2、未完成 2、已完成 0",
    actual: "兩項任務均未勾選，統計 2/2/0",
  });
  await page.locator(".task-item").filter({ hasText: "完成 Web App 實作" }).locator("input").click();
  await counters(page, 2, 1, 1);
  await recordScreenshot(page.locator("main"), "stats-after.png", {
    action: "將第一項任務標示為完成",
    expected: "總數不變，未完成減一、已完成加一",
    actual: "第一項已勾選，統計由 2/2/0 更新為 2/1/1",
  });
  await closeVerified(page, errors);
}

async function captureVue() {
  const { page, errors } = await openPage("vue.html");
  assert.equal(await page.locator(".task-item").count(), 0);
  await counters(page, 0, 0, 0);
  await recordScreenshot(page.locator("main"), "vue-initial.png", {
    action: "開啟並等待 Vue 3 版本掛載",
    expected: "Vue 表單、空清單與 0/0/0 統計顯示",
    actual: "#vue-app 已掛載，任務列數 0，統計 0/0/0",
  });
  await addTask(page, "完成 Web App 實作");
  assert.deepEqual(await rowNames(page), ["完成 Web App 實作"]);
  await counters(page, 1, 1, 0);
  await recordScreenshot(page.locator("main"), "vue-add.png", {
    action: "在 Vue 版本新增「完成 Web App 實作」",
    expected: "Vue 清單與統計立即更新",
    actual: "新增一項未完成任務，統計 1/1/0",
  });
  await page.locator(".task-item input").click();
  assert.equal(await page.locator(".task-item input").isChecked(), true);
  await counters(page, 1, 0, 1);
  await recordScreenshot(page.locator("main"), "vue-completed.png", {
    action: "勾選 Vue 任務",
    expected: "任務顯示完成且統計更新",
    actual: "核取方塊已勾選，統計 1/0/1",
  });
  await page.locator(".task-item input").click();
  assert.equal(await page.locator(".task-item input").isChecked(), false);
  await counters(page, 1, 1, 0);
  await recordScreenshot(page.locator("main"), "vue-uncompleted.png", {
    action: "取消勾選 Vue 任務",
    expected: "任務恢復未完成且統計更新",
    actual: "核取方塊未勾選，統計 1/1/0",
  });
  await page.locator(".delete-button").click();
  assert.equal(await page.locator(".task-item").count(), 0);
  await counters(page, 0, 0, 0);
  await recordScreenshot(page.locator("main"), "vue-deleted.png", {
    action: "刪除 Vue 任務",
    expected: "清單回到空狀態且統計歸零",
    actual: "任務列數 0，空清單提示可見，統計 0/0/0",
  });
  await closeVerified(page, errors);
}

async function captureHoverAndFocus() {
  const { page, errors } = await openPage("index.html");
  const form = page.locator("#task-form");
  const button = page.locator(".add-button");
  await page.mouse.move(0, 0);
  const before = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  await recordScreenshot(form, "hover-before.png", {
    action: "滑鼠尚未移入新增按鈕時擷取表單",
    expected: "按鈕顯示預設藍色",
    actual: `新增按鈕背景色為 ${before}`,
  });
  await button.hover();
  await page.waitForTimeout(250);
  const after = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.notEqual(after, before);
  await recordScreenshot(form, "hover-after.png", {
    action: "將滑鼠移入新增按鈕後擷取表單",
    expected: "hover 樣式使按鈕背景色改變",
    actual: `背景色由 ${before} 改為 ${after}`,
  });
  await page.locator("nav a").focus();
  await page.keyboard.press("Tab");
  assert.equal(await page.locator("#task-input").evaluate((element) => element === document.activeElement), true);
  await recordScreenshot(form, "focus-input.png", {
    action: "從版本連結按 Tab，將鍵盤焦點移至任務輸入欄",
    expected: "輸入欄顯示清楚的 focus-visible 外框",
    actual: "document.activeElement 為 #task-input，焦點外框可見",
  });
  await closeVerified(page, errors);
}

async function captureMobile() {
  const { page, errors } = await openPage("index.html", { width: 375, height: 812 });
  await addTask(page, "完成 Web App 實作");
  await addTask(page, "LongTaskWithoutSpaces".repeat(7));
  assert.equal(await page.locator(".task-item").count(), 2);
  await counters(page, 2, 2, 0);
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(dimensions.scroll <= dimensions.viewport, JSON.stringify(dimensions));
  for (const element of await page.locator("button").all()) {
    const box = await element.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= dimensions.viewport + 1, `button overflow ${JSON.stringify(box)}`);
  }
  await recordScreenshot(page, "mobile375.png", {
    action: "在 375×812 手機尺寸新增一項短任務與一項無空格長任務",
    expected: "長文字換行，所有按鈕留在視窗內，頁面無水平溢出",
    actual: `兩項任務可見，scrollWidth ${dimensions.scroll} ≤ viewport ${dimensions.viewport}，所有按鈕邊界均在視窗內`,
  }, { fullPage: true });
  await closeVerified(page, errors);
}

async function main() {
  await fs.mkdir(outputDirectory, { recursive: true });
  browser = await chromium.launch({ headless: true });
  await captureInitial();
  await captureAdd();
  await captureBlank();
  await captureToggle();
  await captureDelete();
  await captureFilters();
  await captureStats();
  await captureVue();
  await captureHoverAndFocus();
  await captureMobile();

  const report = {
    runner,
    time: new Date().toISOString(),
    browser: await browser.version(),
    baseUrl,
    summary: {
      status: "PASS",
      screenshots: Object.keys(results).length,
      failures: 0,
    },
    results,
  };
  await fs.writeFile(
    path.join(outputDirectory, "capture_results.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(`PASS — ${report.summary.screenshots} report screenshots captured with assertions`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
