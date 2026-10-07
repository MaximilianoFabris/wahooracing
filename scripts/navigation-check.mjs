import {readFile} from 'node:fs/promises';
import {sections,readingGroups} from './navigation.mjs';
const root=new URL('../dist/',import.meta.url);
const pages=JSON.parse(await readFile(new URL('build-manifest.json',root)));
if(pages.some(p=>p.includes('/studies/')))throw Error('Duplicate study pages returned');
if(pages.filter(p=>/^journal\/[^/]+\/index.html$/.test(p)).length!==readingGroups.flatMap(g=>g[1]).length)throw Error('Study inventory mismatch');
const legacy=JSON.parse(await readFile(new URL('../content/legacy-study-routes.json',root)));
const redirects=(await readFile(new URL('_redirects',root),'utf8')).trim().split('\n').map(r=>r.split(' '));
for(const route of legacy)for(const variant of [route,route.slice(0,-1)]){
  const rule=redirects.find(r=>r[0]===variant);
  if(!rule||rule[2]!=='301'||!pages.includes(rule[1].split('?')[0].slice(1)+'index.html'))throw Error('Broken retired address '+variant);
}
const journal=await readFile(new URL('journal/index.html',root),'utf8');
const main=journal.split('<main id="main">')[1].split('</main>')[0];
const studyLinks=[...main.matchAll(/href="(\/journal\/[^/]+\/)"/g)].map(m=>m[1]);
if(studyLinks.length!==new Set(studyLinks).size)throw Error('Journal lists studies more than once');
let checked=0;
for(const file of pages){
  const route='/'+file.replace(/index.html$/,'');
  const section=sections.find(([prefix])=>route.startsWith(prefix));
  if(!section)continue;
  const html=await readFile(new URL(file,root),'utf8');
  const sectionContent=html.replace(/<header[\s\S]*?<\/header>/,'');
  for(const [,href] of sectionContent.matchAll(/href="(\/[^"]*)"/g)){
    const target=sections.find(([prefix])=>href.startsWith(prefix));
    if(target&&target[0]!==section[0]&&!(section[0]==='/systems/'&&/^\/journal\/[^/]+\/\?from=/.test(href)))throw Error(`Cross-section link: ${route} → ${href}`);
  }
  for(const [href] of sections)if(!html.split('</header>')[0].includes(`href="${href}"`))throw Error('Missing global navigation: '+route);
  if(!html.includes('Home · choose a section'))throw Error('Missing Home exit: '+route);
  checked++;
}
for(const [,slugs] of readingGroups)for(let i=0;i<slugs.length;i++){
  const html=await readFile(new URL('journal/'+slugs[i]+'/index.html',root),'utf8');
  const nav=html.match(/<nav class="reading-next"[\s\S]*?<\/nav>/)?.[0]??'';
  if(i<slugs.length-1&&!nav.includes('/journal/'+slugs[i+1]+'/'))throw Error('Missing next study: '+slugs[i]);
}
const back=await readFile(new URL('back/index.html',root),'utf8');
if((back.match(/href="mailto:contact@wahooracing.com\?subject=/g)||[]).length!==3)throw Error('Missing enquiry actions');
console.log(`Passed ${checked} section pages: section boundaries, shared studies, Home exits, consistent reading order and three contact actions.`);
