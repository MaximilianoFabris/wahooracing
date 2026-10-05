import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const baseline='../wahooracing';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const old=await json(baseline+'/dist/build-manifest.json'),pages=await json('dist/build-manifest.json');
const redirects=(await readFile('dist/_redirects','utf8')).trim().split('\n').map(l=>l.split(' '));
if(pages.length!==48||pages.some(p=>p.includes('/studies/')))throw Error('Unexpected page count or duplicate study');
for(const file of old){if(pages.includes(file))continue;const route='/'+file.replace('index.html','');const rule=redirects.find(r=>r[0]===route);if(!rule||rule[2]!=='301'||!pages.includes(rule[1].split('?')[0].slice(1)+'index.html'))throw Error('Unpreserved address '+route);}
let elements=0,assets=0,content=0;
for(const file of old.filter(f=>/^journal\/[^/]+\/index.html$/.test(f))){const before=await readFile(baseline+'/dist/'+file,'utf8'),after=await readFile('dist/'+file,'utf8');
 for(const m of before.matchAll(/<(p|figcaption|table|svg|ul)\b[^>]*>[\s\S]*?<\/\1>/g)){if(!after.includes(m[0]))throw Error('Changed study content '+file+': '+m[0].slice(0,100));elements++;}
 for(const m of before.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g))if(!after.includes(m[1]))throw Error('Missing figure or download '+file+' '+m[1]);
}
async function assetCheck(dir=''){for(const entry of await readdir(baseline+'/public/assets/'+dir,{withFileTypes:true})){const file=dir+entry.name;if(entry.isDirectory())await assetCheck(file+'/');else{const a=await readFile(baseline+'/public/assets/'+file),b=await readFile('public/assets/'+file);if(!a.equals(b))throw Error('Asset changed '+file);assets++;}}}await assetCheck();
for(const file of await readdir(baseline+'/content')){const a=await json(baseline+'/content/'+file),b=await json('content/'+file);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('Source data changed '+file);content++;}
const counts={};for(const file of ['journal/index.html','systems/hull-hydrodynamics/index.html']){const html=await readFile('dist/'+file,'utf8');const main=html.split('<main id="main">')[1].split('</main>')[0];const links=[...main.matchAll(/href="(\/journal\/[^"#?]+)\/?(?:\?[^\"]*)?"/g)].map(m=>m[1]);if(links.length!==new Set(links).size)throw Error('Repeated study entry on '+file);counts[file]=links.length;}
const report={pages:47,errorPages:1,uniqueStudies:28,retiredAddresses:75,redirectRules:redirects.length,preservedStudyElements:elements,unchangedAssets:assets,unchangedContentFiles:content,indexStudyLinks:counts};
await mkdir('.preview',{recursive:true});await writeFile('.preview/simplification-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
