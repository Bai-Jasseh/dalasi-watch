import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({
  executablePath: '/bin/chromium',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('https://dalasi-watch.lovable.app/markets', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2000));
// Click first commodity card
await page.evaluate(() => {
  const card = document.querySelector('a[href*="/markets/"]');
  if (card) card.click();
});
await new Promise(r => setTimeout(r, 3500));
await page.screenshot({ path: '/dev-server/remotion/public/screens/commodity.png' });
console.log('URL:', page.url());
await browser.close();
