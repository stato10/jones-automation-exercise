const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE_URL = 'https://test.netlify.app/';
const SCREENSHOT_PATH = path.join(__dirname, 'artifacts', 'before-submit.png');

const testData = {
  name: 'Alex Jones',
  email: 'alex.jones@example.com',
  phone: '+1 202 555 0147',
  company: 'Jones Automation',
  website: 'https://example.com',
  employees: '51-500',
};

const headed = process.env.HEADED === '1' || process.argv.includes('--headed');

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeInto(page, label, value) {
  const field = page.getByLabel(label);
  await field.click();
  await field.fill('');
  if (headed) {
    await field.pressSequentially(value, { delay: 80 });
  } else {
    await field.fill(value);
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: !headed,
    slowMo: headed ? 600 : 0,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  try {
    console.log('1) Opening https://test.netlify.app/ ...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    if (headed) await pause(1500);

    console.log('2) Typing Name:', testData.name);
    await typeInto(page, 'Name *', testData.name);
    if (headed) await pause(1000);

    console.log('3) Typing Email:', testData.email);
    await typeInto(page, 'Email *', testData.email);
    if (headed) await pause(1000);

    console.log('4) Typing Phone:', testData.phone);
    await typeInto(page, 'Phone *', testData.phone);
    if (headed) await pause(1000);

    console.log('5) Typing Company:', testData.company);
    await typeInto(page, 'Company', testData.company);
    if (headed) await pause(1000);

    console.log('6) Typing Website:', testData.website);
    await typeInto(page, 'Website', testData.website);
    if (headed) await pause(1000);

    console.log('7) BONUS: Changing Number of Employees to', testData.employees);
    await page.getByLabel('Number of Employees').selectOption({
      label: testData.employees,
    });
    assert.equal(
      await page.getByLabel('Number of Employees').inputValue(),
      testData.employees,
      'Number of Employees was not changed to 51-500',
    );
    if (headed) await pause(1500);

    console.log('8) Creating screenshot BEFORE clicking submit:', SCREENSHOT_PATH);
    await fs.mkdir(path.dirname(SCREENSHOT_PATH), { recursive: true });
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    if (headed) await pause(1500);

    console.log('9) Clicking "Request a call back"...');
    await Promise.all([
      page.waitForURL('**/thank-you.html**', {
        waitUntil: 'domcontentloaded',
      }),
      page.getByRole('button', { name: 'Request a call back' }).click(),
    ]);

    await page.getByRole('heading', { name: 'Thank You!' }).waitFor();
    assert.equal(await page.title(), 'Thank You');
    if (headed) await pause(2500);

    console.log('Success: reached the thank-you page.');
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error('Automation failed:', error);
  process.exitCode = 1;
});
