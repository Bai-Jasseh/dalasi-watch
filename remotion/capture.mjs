import puppeteer from 'puppeteer';

const BASE = 'https://dalasi-watch.lovable.app';
const OUT = 'remotion/public/screens';

const pages = [
  { name: 'home',       url: '/',                       wait: 1500 },
  { name: 'markets',    url: '/markets',                wait: 1500 },
  { name: 'commodity',  url: '/markets/rice-imported',  wait: 2000 },
  { name: 'compare',    url: '/compare',                wait: 1500 },
  { name: 'analytics',  url: '/analytics',              wait: 2000 },
  { name: 'dashboard',  url: '/dashboard',              wait: 1500 },
  { name: 'report',     url: '/report',                 wait: 1500 },
  { name: 'profile',    url: '/profile',                wait: 1200 },
];

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/bin/chromium',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

for (const p of pages) {
  console.log(`Capturing ${p.name} -> ${p.url}`);
  try {
    await page.goto(BASE + p.url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) { console.log('  nav warn:', e.message); }
  await new Promise(r => setTimeout(r, p.wait));
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: false });
}

// Ask DalasiWatch open: go home, open chat, type, send
console.log('Capturing AI chat interactions');
try {
  await page.goto(BASE + '/markets', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  // Click Ask DalasiWatch floating button
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /ask dalasiwatch/i.test(b.textContent || '') || b.getAttribute('aria-label')?.toLowerCase().includes('ask'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT}/ai-open.png` });

  // Click first starter
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const starter = btns.find(b => /price of rice in brikama/i.test(b.textContent || ''));
    if (starter) starter.click();
  });
  await new Promise(r => setTimeout(r, 8000)); // wait for AI response
  await page.screenshot({ path: `${OUT}/ai-answer.png` });

  // Type a follow-up
  await page.evaluate(() => {
    const inp = document.querySelector('input[placeholder*="prices" i]');
    if (inp) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(inp, 'Where is sugar cheapest right now?');
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${OUT}/ai-typed.png` });
} catch (e) { console.log('AI capture err:', e.message); }

await browser.close();
console.log('Done');
