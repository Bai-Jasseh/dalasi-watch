import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({
  executablePath: '/bin/chromium',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('https://dalasi-watch.lovable.app/markets', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2500));
await page.evaluate(() => {
  const link = [...document.querySelectorAll('a')].find(a => a.href.includes('/markets/rice'));
  if (link) link.click();
});
await new Promise(r => setTimeout(r, 5000));
console.log('After click URL:', page.url());
await page.screenshot({ path: 'public/screens/commodity.png' });
await browser.close();
