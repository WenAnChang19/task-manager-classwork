// AI 操作同一網站的獨立測試瀏覽器，不改動使用者現有頁面的任務。
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

async function main() {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'evidence');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8765/index.html');
    const names = ['完成 Web App 實作', '完成 JavaScript 練習', '整理作業提交資料'];
    assert.equal(await page.locator('.task-item').count(), 0);
    await page.locator('#task-input').fill(names[0]);
    await page.screenshot({ path: path.join(output, 'add-demo-before.png'), fullPage: true });
    const steps = [];
    for (const [index, name] of names.entries()) {
      await page.locator('#task-input').fill(name);
      await page.locator('.add-button').click();
      assert.equal(await page.locator('.task-item').count(), index + 1);
      assert.equal(await page.locator('.task-name').nth(index).innerText(), name);
      assert.equal(await page.locator('#total-count').innerText(), String(index + 1));
      assert.equal(await page.locator('#pending-count').innerText(), String(index + 1));
      assert.equal(await page.locator('#completed-count').innerText(), '0');
      assert.equal(await page.locator('#task-input').inputValue(), '');
      const screenshot = `add-demo-after-${index + 1}.png`;
      await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
      steps.push({ name, total: index + 1, pending: index + 1, completed: 0, result: 'PASS', screenshot });
    }
    assert.deepEqual(errors, []);
    const report = { runner: 'Codex／Playwright 自動測試，非學生親自測試', time: new Date().toISOString(), url: page.url(), browser: await browser.version(), steps };
    await fs.writeFile(path.join(output, 'add-demo-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
