import {readFile,stat} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const manifest=JSON.parse(await readFile(path.join(root,'build-manifest.json'),'utf8'));
const notFound=await readFile(path.join(root,'404.html'),'utf8');
if(notFound!==await readFile(path.join(root,'404/index.html'),'utf8'))throw Error('Cloudflare 404 page mismatch');
const headers=await readFile(path.join(root,'_headers'),'utf8');
if(!headers.includes('Content-Security-Policy:')||!headers.includes('https://:project.pages.dev/*'))throw Error('Cloudflare headers missing');
let references=0;
for(const file of manifest){const html=await readFile(path.join(root,file),'utf8');if(html.includes('Unpublished engine notes')||html.includes('unpublished-engine-notes'))throw Error('Draft leak');for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){let dest=path.join(root,m[1]);const s=await stat(dest).catch(()=>{throw Error(`Broken reference ${m[1]} in ${file}`)});if(s.isDirectory())await stat(path.join(dest,'index.html'));references++;}if(!html.includes('<h1>')||!html.includes('id="main"'))throw Error('Missing page landmarks');}
console.log(`Passed: ${manifest.length} pages, ${references} local references, draft exclusion and page landmarks.`);
