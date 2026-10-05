import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const base=process.env.CHECK_BASE||'http://127.0.0.1:4173';
try{
  await page.goto(base+'/systems/hull-hydrodynamics/');
  await page.locator('a[href="/systems/hull-hydrodynamics/studies/arc-length-analysis/"]').first().click();
  await page.locator('.arc-library details').first().locator('summary').click();
  const drawing=page.locator('.arc-library details').first().locator('a').first();
  const url=new URL(await drawing.getAttribute('href'),base);
  const origin=url.searchParams.get('return');
  await drawing.click();
  await page.waitForURL('**/inspect/**');
  await page.locator('[data-image-return]').click();
  await page.waitForURL(base+origin);
  if(!await page.locator('.arc-library details').first().evaluate(el=>el.open))throw Error('Returned drawing disclosure is closed');
  await page.locator('.reading-next a').filter({hasText:'Next:'}).click();
  if(!page.url().includes('/systems/hull-hydrodynamics/studies/geometry-conversion-validation/'))throw Error('System sequence left its section');
  await page.goto(base+'/journal/surface-investigation/');
  await page.locator('.reading-next a').filter({hasText:'Next:'}).click();
  if(!page.url().endsWith('/journal/reading-the-hull-surface/'))throw Error('Journal sequence incorrect');
  await page.goto(base+'/inspect/?return='+encodeURIComponent('//example.com/'));
  if(await page.locator('[data-image-return]').getAttribute('href')!=='/')throw Error('Unsafe return link');
  for(const route of ['/journal/','/history/','/roadmap/','/back/','/systems/hull-hydrodynamics/studies/arc-length-analysis/']){
    await page.goto(base+route);
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile overflow: '+route);
  }
  console.log('Navigation browser checks passed: local reading sequences, exact drawing return, disclosure restore, safe fallback and mobile layout.');
}finally{await browser.close();}
