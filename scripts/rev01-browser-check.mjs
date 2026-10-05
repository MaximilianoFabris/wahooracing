import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
const base=process.env.CHECK_BASE||'http://127.0.0.1:4181';await mkdir('.preview/rev01',{recursive:true});
try{
 await page.goto(base);await page.waitForLoadState('networkidle');
 if(!await page.evaluate(()=>document.fonts.check('600 20px "Barlow Condensed"')))throw Error('Heading font missing');
 for(const station of [25,50,75,90]){
  const button=page.locator('[data-station="'+station+'"]');await button.focus();await page.keyboard.press('Enter');
  const visible=page.locator('[data-station-figure]:visible');if(await visible.count()!==1||await visible.getAttribute('data-station-figure')!==String(station))throw Error('Section switch failed');
  const original=await readFile('public/assets/hull-section-'+station+'.svg','utf8');
  const expected=[...original.matchAll(/<polyline points="([^"]+)"/g)].map(m=>m[1]);
  const actual=await visible.locator('polyline').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('points')));
  if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Geometry changed at '+station);
 }
 await page.locator('[data-mass]').selectOption('80');if(!(await page.locator('[data-chart-readout]').textContent()).includes('0.1318'))throw Error('Homepage hydrostatics changed');
 const routes=[['home','/'],['systems','/systems/'],['controls','/systems/controls/'],['article','/systems/controls/studies/electronics-control-architecture/'],['journal','/journal/'],['history','/history/'],['roadmap','/roadmap/'],['back','/back/'],['explore','/explore/'],['hull','/systems/hull-hydrodynamics/']];
 for(const width of [390,1440]){await page.setViewportSize({width,height:960});for(const [name,url] of routes){
  await page.goto(base+url);await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(i=>i.decode()));});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+name+' '+width);
  await page.screenshot({path:'.preview/rev01/'+name+'-'+width+'.png',fullPage:['home','systems','back'].includes(name)});
 }}
 await page.goto(base+'/journal/electronics-control-architecture/');
 await page.locator('.article-toc a').first().click();if(!page.url().endsWith('#section-1'))throw Error('Article contents failed');
 await page.locator('.article-hero').screenshot({path:'.preview/rev01/electronics-figure.png'});
 await page.goto(base+'/systems/hull-hydrodynamics/');await page.getByRole('navigation',{name:'On this page'}).getByRole('link',{name:'03 Geometry'}).click();if(!page.url().endsWith('#geometry'))throw Error('Hull section navigation failed');
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile('.preview/rev01/browser-check.json',JSON.stringify({passed:true,widths:[390,1440],pageFamilies:routes.map(r=>r[0]),exactGeometryStations:[25,50,75,90],fontLoaded:true,errors},null,2));
 console.log('Rev01 checked: ten page families, desktop/mobile, source-exact section geometry, chart controls, article contents, hull section navigation, fonts and image loading.');
}finally{await browser.close();}
