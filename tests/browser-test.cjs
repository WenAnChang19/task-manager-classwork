// 透過真實瀏覽器操作 UI，另存截圖與實際結果；不是學生親自測試的聲明。
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'evidence');
const port = Number(process.env.TEST_PORT || 8766);
const base = `http://127.0.0.1:${port}`;
const results = [];
let browser;
let server;
let serverError;

const add = async (page, name) => {
  await page.locator('#task-input').fill(name);
  await page.locator('.add-button').click();
};
const task = (page, name) => page.locator('.task-item').filter({ hasText: name });
const count = async (page, expected) => {
  assert.equal(await page.locator('.task-item').count(), expected);
};
const stats = async (page, total, pending, completed) => {
  for (const [id, value] of Object.entries({ 'total-count': total, 'pending-count': pending, 'completed-count': completed })) {
    assert.equal((await page.locator(`#${id}`).innerText()).trim(), String(value), id);
  }
};
const shot = (page, name) => page.screenshot({ path: path.join(evidence, `${name}.png`), fullPage: true });

async function run(id, description, expected, execute, actual, files, pageName = 'index.html') {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    await page.goto(`${base}/${pageName}`);
    await execute(page);
    assert.deepEqual(errors, [], '瀏覽器執行錯誤');
    results.push({ id, description, expected, actual, status: 'PASS', files });
    console.log(`${id} PASS — ${description}`);
  } catch (error) {
    await shot(page, `${id}-failure`).catch(() => {});
    results.push({ id, description, expected, actual: error.message, status: 'FAIL', files: [`${id}-failure.png`] });
    console.error(`${id} FAIL — ${error.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  await fs.mkdir(evidence, { recursive: true });
  // 僅綁定 localhost，並限定專案目錄，避免公開其他個人檔案。
  server = spawn(process.env.PYTHON || 'python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', root], { stdio: 'ignore' });
  server.on('error', error => { serverError = error; });
  server.on('exit', code => { if (code !== null && code !== 0) serverError = new Error(`測試伺服器啟動失敗 (${code})`); });
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (serverError) throw serverError;
    try {
      const response = await fetch(`${base}/index.html`);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error('測試伺服器未能於五秒內啟動');
  browser = await chromium.launch({ headless: true });

  await run('TC01', '新增正常任務', '任務出現，輸入欄清空，統計為 1/1/0', async page => {
    await count(page, 0);
    await shot(page, 'TC01-before');
    await add(page, '完成 Web App 實作');
    await count(page, 1);
    assert.equal(await task(page, '完成 Web App 實作').count(), 1);
    assert.equal(await page.locator('#task-input').inputValue(), '');
    await stats(page, 1, 1, 0);
    await shot(page, 'TC01-after');
  }, '新增任務出現，輸入已清空；共 1、未完成 1、已完成 0', ['TC01-before.png', 'TC01-after.png']);

  await run('TC02', '新增空白任務', '空字串與純空白皆不新增，顯示提示', async page => {
    await shot(page, 'TC02-before');
    for (const input of ['', '   ']) {
      await add(page, input);
      await count(page, 0);
      await stats(page, 0, 0, 0);
      assert.ok((await page.locator('#form-message').innerText()).trim().length > 0);
    }
    await shot(page, 'TC02-after');
  }, '兩種空白輸入都沒有新增，畫面顯示提示', ['TC02-before.png', 'TC02-after.png']);

  await run('TC03', '完成任務', '勾選後變成已完成，統計同步更新', async page => {
    await add(page, '完成 JavaScript 練習');
    await shot(page, 'TC03-before');
    await task(page, '完成 JavaScript 練習').locator('input[type=checkbox]').click();
    assert.ok(await task(page, '完成 JavaScript 練習').locator('input').isChecked());
    assert.ok((await task(page, '完成 JavaScript 練習').getAttribute('class')).includes('completed'));
    await stats(page, 1, 0, 1);
    await shot(page, 'TC03-after');
  }, '任務已勾選且顯示完成樣式；統計為 1/0/1', ['TC03-before.png', 'TC03-after.png']);

  await run('TC04', '取消完成', '取消勾選後恢復未完成', async page => {
    await add(page, '完成課程作業');
    await task(page, '完成課程作業').locator('input').click();
    await shot(page, 'TC04-before');
    await task(page, '完成課程作業').locator('input').click();
    assert.equal(await task(page, '完成課程作業').locator('input').isChecked(), false);
    await stats(page, 1, 1, 0);
    await shot(page, 'TC04-after');
  }, '取消勾選，恢復未完成；統計為 1/1/0', ['TC04-before.png', 'TC04-after.png']);

  await run('TC05', '刪除任務', '指定任務消失，其餘任務保留', async page => {
    await add(page, '完成 Web App 實作');
    await add(page, '保留的任務');
    await shot(page, 'TC05-before');
    await task(page, '完成 Web App 實作').locator('.delete-button').click();
    await count(page, 1);
    assert.equal(await task(page, '完成 Web App 實作').count(), 0);
    assert.equal(await task(page, '保留的任務').count(), 1);
    await stats(page, 1, 1, 0);
    await shot(page, 'TC05-after');
  }, '指定任務消失，另一項保留；統計為 1/1/0', ['TC05-before.png', 'TC05-after.png']);

  await run('TC06', '篩選未完成', '只顯示未完成，切回全部可看見所有任務', async page => {
    for (const name of ['任務 A', '任務 B', '任務 C']) await add(page, name);
    await task(page, '任務 B').locator('input').click();
    await shot(page, 'filter-all');
    await page.locator('[data-filter=pending]').click();
    await count(page, 2);
    assert.equal(await task(page, '任務 B').count(), 0);
    assert.equal(await page.locator('[data-filter=pending]').getAttribute('aria-pressed'), 'true');
    await stats(page, 3, 2, 1);
    await shot(page, 'filter-pending');
    await page.locator('[data-filter=all]').click();
    await count(page, 3);
  }, '未完成篩選只顯示 A/C；全部篩選恢復 A/B/C，統計不受篩選影響', ['filter-all.png', 'filter-pending.png']);

  await run('TC07', '篩選已完成', '只顯示已完成；空結果有提示', async page => {
    await add(page, '未完成任務');
    await add(page, '已完成任務');
    await task(page, '已完成任務').locator('input').click();
    await page.locator('[data-filter=completed]').click();
    await count(page, 1);
    assert.equal(await task(page, '已完成任務').count(), 1);
    await shot(page, 'filter-completed');
    // 切換狀態後此項會立刻離開篩選清單，以 click 操作再驗證資料結果。
    await task(page, '已完成任務').locator('input').click();
    await count(page, 0);
    assert.ok(await page.locator('#empty-state').isVisible());
    await stats(page, 2, 2, 0);
    await shot(page, 'filter-empty');
  }, '僅已完成任務出現；取消完成後該篩選為空並顯示提示', ['filter-completed.png', 'filter-empty.png']);

  await run('TC08', '統計數字', '新增、完成、刪除、篩選後統計皆正確', async page => {
    await stats(page, 0, 0, 0);
    await add(page, '任務 A');
    await add(page, '任務 B');
    await stats(page, 2, 2, 0);
    await shot(page, 'TC08-before');
    await task(page, '任務 A').locator('input').click();
    await stats(page, 2, 1, 1);
    await shot(page, 'TC08-after');
    await page.locator('[data-filter=completed]').click();
    await stats(page, 2, 1, 1);
    await task(page, '任務 A').locator('.delete-button').click();
    await stats(page, 1, 1, 0);
  }, '依序驗證 0/0/0、2/2/0、2/1/1、1/1/0；篩選不改變統計', ['TC08-before.png', 'TC08-after.png']);

  await run('TC09', '手機尺寸', '480、375、320px 長文字不溢出，按鈕可操作', async page => {
    for (const width of [480, 375, 320]) {
      await page.setViewportSize({ width, height: 812 });
      await page.reload();
      await add(page, '超長任務內容LongTaskWithoutSpaces'.repeat(6));
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(dimensions.scroll <= dimensions.viewport, JSON.stringify(dimensions));
      for (const selector of ['#task-input', '.add-button', '.delete-button', '.filter-button']) {
        for (const element of await page.locator(selector).all()) {
          const box = await element.boundingBox();
          assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1, `${width}px ${selector}`);
        }
      }
      await shot(page, `mobile-${width}`);
      await page.locator('[data-filter=completed]').click();
      await count(page, 0);
      await page.locator('[data-filter=pending]').click();
      await count(page, 1);
      await page.locator('.task-item input').click();
      await count(page, 0);
      await stats(page, 1, 0, 1);
      await page.locator('[data-filter=all]').click();
      assert.ok(await page.locator('.task-item input').isChecked());
      await page.locator('.delete-button').click();
      await count(page, 0);
    }
  }, '三種手機寬度皆無橫向溢出；新增、篩選、完成、刪除可操作', ['mobile-480.png', 'mobile-375.png', 'mobile-320.png']);

  await run('TC10', 'Vue 功能', 'Vue 正常啟動，新增、完成／取消、刪除立即更新', async page => {
    await page.waitForFunction(() => document.querySelector('#vue-app').hasAttribute('data-v-app'));
    await count(page, 0);
    await shot(page, 'vue-before');
    await add(page, 'Vue 任務');
    await count(page, 1);
    await stats(page, 1, 1, 0);
    await shot(page, 'vue-added');
    await task(page, 'Vue 任務').locator('input').check();
    await stats(page, 1, 0, 1);
    await shot(page, 'vue-completed');
    await task(page, 'Vue 任務').locator('input').uncheck();
    await stats(page, 1, 1, 0);
    await shot(page, 'vue-uncompleted');
    await task(page, 'Vue 任務').locator('.delete-button').click();
    await count(page, 0);
    await stats(page, 0, 0, 0);
    await shot(page, 'vue-deleted');
    for (const blank of ['', '   ']) { await add(page, blank); await count(page, 0); }
    const htmlText = '<img src=x onerror="alert(1)">';
    await add(page, htmlText);
    assert.equal(await page.locator('#task-list img').count(), 0);
    assert.equal(await page.locator('.task-name').innerText(), htmlText);
    await page.locator('.delete-button').click();
    await count(page, 0);
    await page.setViewportSize({ width: 320, height: 812 });
    await add(page, 'Vue超長任務WithoutSpaces'.repeat(8));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await shot(page, 'vue-mobile');
  }, 'Vue 已掛載；三項操作與取消完成皆更新，拒絕空白；320px 無溢出', ['vue-before.png', 'vue-added.png', 'vue-completed.png', 'vue-uncompleted.png', 'vue-deleted.png', 'vue-mobile.png'], 'vue.html');

  await run('EX01', '語意、重新整理、鍵盤、文字安全', '基本 UI 保留，Enter 新增，HTML 字串不執行', async page => {
    for (const selector of ['header', 'main', 'section', 'label[for=task-input]', '#task-list', '#stats']) assert.ok(await page.locator(selector).count());
    await page.locator('#task-input').fill('<img src=x onerror="alert(1)">');
    await page.locator('#task-input').press('Enter');
    await count(page, 1);
    assert.equal(await page.locator('#task-list img').count(), 0);
    assert.equal(await task(page, '<img').count(), 1);
    await page.locator('.task-item input').focus();
    await page.keyboard.press('Space');
    await stats(page, 1, 0, 1);
    assert.equal(await page.locator('.task-item input').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Space');
    await stats(page, 1, 1, 0);
    await page.locator('[data-filter=completed]').focus();
    await page.keyboard.press('Enter');
    await count(page, 0);
    await page.locator('[data-filter=all]').focus();
    await page.keyboard.press('Enter');
    await count(page, 1);
    await page.locator('.delete-button').focus();
    await page.keyboard.press('Enter');
    await count(page, 0);
    assert.equal(await page.locator('#task-input').evaluate(el => el === document.activeElement), true);
    await page.reload();
    await count(page, 0);
    assert.ok(await page.locator('#task-form').isVisible());
    await shot(page, 'desktop-reloaded');
    await page.mouse.move(0, 0);
    await shot(page, 'hover-before');
    const before = await page.locator('.add-button').evaluate(el => getComputedStyle(el).backgroundColor);
    await page.locator('.add-button').hover();
    await page.waitForTimeout(300);
    const after = await page.locator('.add-button').evaluate(el => getComputedStyle(el).backgroundColor);
    assert.notEqual(after, before);
    await shot(page, 'hover-after');
    await page.locator('#task-input').focus();
    await shot(page, 'focus-after');
  }, '語意結構存在；Enter 新增與 Space 切換成功；文字安全，重新整理保留 UI，hover 變色', ['desktop-reloaded.png', 'hover-before.png', 'hover-after.png', 'focus-after.png']);

  const report = { runner: 'Codex 使用 Playwright 自動操作 Chromium；不是學生親自測試紀錄', time: new Date().toISOString(), browser: await browser.version(), results };
  await fs.writeFile(path.join(evidence, 'test-results.json'), JSON.stringify(report, null, 2) + '\n');
  const escapeCell = value => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
  const rows = results.map(result => `| ${result.id} | ${result.description} | ${result.expected} | ${escapeCell(result.actual)} | ${result.status} | ${result.files.map(file => `[${file}](../evidence/${file})`).join('、')} |`).join('\n');
  await fs.writeFile(path.join(root, 'docs', 'test-report.md'), `# 瀏覽器自動測試結果\n\n執行者：${report.runner}。\n\n執行時間：${new Date(report.time).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}（Asia/Taipei）。瀏覽器 Chromium ${report.browser}。\n\n這些是 UI 操作測試。老師所稱的 Unit Test Table 包含介面整合與人工測試情境，並非只有函式單元測試。學生仍須親自操作，另填 manual-test-table.md。\n\n| Test Case | 測試內容 | 預期結果 | 實際結果 | Pass/Fail | 證據 |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\n重跑：npm install；npx playwright install chromium；npm test。\n`);
  if (results.some(result => result.status !== 'PASS')) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});
