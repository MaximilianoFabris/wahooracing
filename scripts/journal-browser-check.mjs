import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();const base=process.env.CHECK_BASE||'http://127.0.0.1:4183';const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base+'/journal/');
 if(await page.locator('#journal-records article').count()!==28)throw Error('Missing records');
 await page.locator('#journal-records img').evaluateAll(async imgs=>{if(imgs.length!==28)throw Error('Missing thumbnails');imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()));});
 for(const mode of ['newest','oldest','reading']){
  await page.locator('#sort-records').selectOption(mode);
  const rows=await page.locator('#journal-records article').evaluateAll(els=>els.map(e=>({date:e.dataset.date,reading:+e.dataset.reading})));
  if(mode==='reading'){if(rows.some((r,i)=>r.reading!==i))throw Error('Reading order');}
  else{const dated=rows.filter(r=>r.date).map(r=>r.date);const expected=[...dated].sort();if(mode==='newest')expected.reverse();if(JSON.stringify(dated)!==JSON.stringify(expected)||rows.slice(dated.length).some(r=>r.date))throw Error('Date sort');}
 }
 await page.locator('#filter-system').selectOption('engine');
 if(!await page.locator('#journal-records article:visible').count())throw Error('System filter empty');
 if(await page.locator('#journal-records article:visible').evaluateAll(els=>els.some(e=>!e.dataset.system.split(' ').includes('engine'))))throw Error('System mismatch');
 await page.locator('#journal-records article:visible h3 a').first().click();await page.waitForLoadState('load');
 await page.locator('[data-study-return]').first().click();await page.waitForLoadState('load');
 if(await page.locator('#filter-system').inputValue()!=='engine'||await page.locator('#sort-records').inputValue()!=='reading')throw Error('Return lost filters/sort');
 for(const width of [390,1440]){await page.setViewportSize({width,height:950});await page.goto(base+'/journal/?subject=reading-4');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow');await page.locator('#journal-records img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()));});await page.screenshot({path:'.preview/journal-'+width+'.png',fullPage:true});}
 if(errors.length)throw Error(errors.join('\n'));
 console.log('Passed: 28 image previews, date and reading sorts, undated archives last, system filter, contextual return and desktop/mobile layout.');
}finally{await browser.close();}
