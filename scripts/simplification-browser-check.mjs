import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CHECK_BASE||'http://127.0.0.1:4182';
const legacy=JSON.parse(await readFile('content/legacy-study-routes.json'));
for(const route of legacy){for(const path of [route,route.slice(0,-1)]){const r=await fetch(base+path,{redirect:'manual'});const target=r.headers.get('location');if(r.status!==301||!target.startsWith('/journal/')||!target.includes('?from='))throw Error('Invalid legacy redirect '+path);}}
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base+'/journal/');await page.locator('#filter-path').selectOption('reading-3');if(await page.locator('#journal-records article:visible').count()!==2)throw Error('Subject filter');
 await page.locator('#record-first-corrected-cfd-run h3 a').click();await page.locator('.reading-next a').filter({hasText:'Next:'}).click();if(new URL(page.url()).pathname!=='/journal/20kmh-completed-analysis/')throw Error('Next study');
 await page.locator('[data-study-return]').first().click();if(await page.locator('#filter-path').inputValue()!=='reading-3'||!page.url().endsWith('#record-first-corrected-cfd-run'))throw Error('Filtered return not preserved');
 await page.goto(base+'/journal/#reading-1');if(await page.locator('#journal-records article:visible').count()!==7)throw Error('Old reading-path bookmark');
 await page.goto(base+'/journal/arc-length-analysis/?from=engine');const sequenceA=await page.locator('.reading-next a').filter({hasText:'Next:'}).getAttribute('href');
 await page.goto(base+'/journal/arc-length-analysis/');const sequenceB=await page.locator('.reading-next a').filter({hasText:'Next:'}).getAttribute('href');if(sequenceA.split('?')[0]!==sequenceB)throw Error('Reading order varies by entry');
 for(const q of ['?from=https://example.com/','?index='+encodeURIComponent('//example.com/'),'?index='+encodeURIComponent('/journal/../../back/')]){await page.goto(base+'/journal/arc-length-analysis/'+q);if(!(await page.locator('[data-study-return]').first().getAttribute('href')).startsWith('/journal/#reading-'))throw Error('Unsafe context accepted');}
 await mkdir('.preview/navigation',{recursive:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:960});for(const route of ['/journal/','/systems/hull-hydrodynamics/','/systems/controls/','/journal/arc-length-analysis/?from=hull-hydrodynamics']){await page.goto(base+route);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+width+route);}await page.goto(base+'/journal/');await page.locator('img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()));});await page.screenshot({path:'.preview/navigation/journal-'+width+'.png',fullPage:false});}
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile('.preview/navigation/browser-check.json',JSON.stringify({redirects:150,subjectFilters:true,filteredReturn:true,stableReadingOrder:true,unsafeContextRejected:true,widths:[320,390,768,1440],errors},null,2));console.log('Passed 150 redirects, subject filters, exact results return, one reading order, safe context and four viewport widths.');
}finally{await browser.close();}
