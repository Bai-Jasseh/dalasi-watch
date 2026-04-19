import puppeteer from 'puppeteer';

const BASE = 'https://id-preview--3ecb6358-2d95-46cc-be75-136abbea10cd.lovable.app';
const OUT = 'public/screens';

const pages = [
  { name: 'home',       url: '/',                   wait: 2500 },
  { name: 'markets',    url: '/markets',            wait: 2500 },
  { name: 'commodity',  url: '/markets/rice-sadam', wait: 3000 },
  { name: 'compare',    url: '/compare',            wait: 2500 },
  { name: 'analytics',  url: '/analytics',          wait: 3000 },
  { name: 'dashboard',  url: '/dashboard',          wait: 2500 },
  { name: 'report',     url: '/report',             wait: 2000 },
  { name: 'profile',    url: '/profile',            wait: 1500 },
];

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/bin/chromium',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],
  headless: 'new',
});

async function fresh() {
  const p = await browser.newPage();
  await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  return p;
}

for (const p of pages) {
  console.log(`Capturing ${p.name} -> ${p.url}`);
  const page = await fresh();
  try {
    await page.goto(BASE + p.url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) { console.log('  nav warn:', e.message); }
  await new Promise(r => setTimeout(r, p.wait));
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: false });
  await page.close();
}

console.log('Capturing AI chat');
{
  const page = await fresh();
  try {
    await page.goto(BASE + '/markets', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 2500));

    // Click the floating ask button by aria-label
    const clicked = await page.evaluate(() => {
      const sel = document.querySelector('button[aria-label="Ask DalasiWatch AI"]');
      if (sel) { sel.click(); return true; }
      // fallback: any button containing the text
      const btn = [...document.querySelectorAll('button')].find(b =>
        (b.textContent || '').toLowerCase().includes('ask dalasiwatch')
      );
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('  ask button clicked:', clicked);
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `${OUT}/ai-open.png` });

    // click first starter
    await page.evaluate(() => {
      const starter = [...document.querySelectorAll('button')].find(b =>
        /price of rice in brikama/i.test(b.textContent || '')
      );
      if (starter) starter.click();
    });
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: `${OUT}/ai-answer.png` });

    // type follow-up
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

    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
    });
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: `${OUT}/ai-answer2.png` });
  } catch (e) { console.log('AI capture err:', e.message); }
  await page.close();
}

await browser.close();
console.log('Done');
