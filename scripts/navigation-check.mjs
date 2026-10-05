import {readFile} from 'node:fs/promises';
import {sections,readingGroups} from './navigation.mjs';
const root=new URL('../dist/',import.meta.url);
const pages=JSON.parse(await readFile(new URL('build-manifest.json',root)));
let checked=0;
for(const file of pages){
  const route='/'+file.replace(/index.html$/,'');
  const section=sections.find(([prefix])=>route.startsWith(prefix));
  if(!section)continue;
  const html=await readFile(new URL(file,root),'utf8');
  for(const [,href] of html.matchAll(/href="(\/[^"]*)"/g)){
    const target=sections.find(([prefix])=>href.startsWith(prefix));
    if(target&&target[0]!==section[0])throw Error(`Cross-section link: ${route} → ${href}`);
  }
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
console.log(`Passed ${checked} section pages: no cross-section links, Home exits, Journal reading order and three contact actions.`);
