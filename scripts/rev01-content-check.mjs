import {readFile,readdir,stat,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const baseline=path.resolve(process.argv[2]||'../wahooracing');
const root=process.cwd();
const hash=b=>createHash('sha256').update(b).digest('hex');
async function files(dir,prefix=''){const result=[];for(const name of await readdir(dir)){const rel=path.join(prefix,name);if((await stat(path.join(dir,name))).isDirectory())result.push(...await files(path.join(dir,name),rel));else result.push(rel);}return result;}
const missing=[],changed=[];
const sourceFiles=await files(path.join(baseline,'content'));
const assetFiles=await files(path.join(baseline,'public/assets'));
for(const [folder,list] of [['content',sourceFiles],['public/assets',assetFiles]])for(const file of list){const rel=path.join(folder,file);try{let a=await readFile(path.join(baseline,rel)),b=await readFile(path.join(root,rel));if(folder==='content'){a=Buffer.from(a.toString().replace(/\r\n/g,'\n'));b=Buffer.from(b.toString().replace(/\r\n/g,'\n'));}if(hash(a)!==hash(b))changed.push(rel);}catch{missing.push(rel);}}
const oldPages=JSON.parse(await readFile(path.join(baseline,'dist/build-manifest.json')));
const newPages=JSON.parse(await readFile('dist/build-manifest.json'));
for(const file of oldPages)if(!newPages.includes(file))missing.push(file);
const articlePages=oldPages.filter(f=>/^journal\/[^/]+\/index.html$/.test(f)||f.includes('/studies/'));
let preservedElements=0,articleImages=0,articleLinks=0;
for(const file of articlePages){const before=await readFile(path.join(baseline,'dist',file),'utf8'),after=await readFile(path.join(root,'dist',file),'utf8');
  // Content prose, source lists, tables, captions and complete generated SVGs.
  for(const m of before.matchAll(/<(p|figcaption|table|svg|ul)\b[^>]*>[\s\S]*?<\/\1>/g)){
    if(m[0].startsWith('<p class="meta">'))continue; // date moved into evidence metadata
    if(!after.includes(m[0]))changed.push(file+': '+m[0].slice(0,100));else preservedElements++;
  }
  for(const m of before.matchAll(/<img\b[^>]*src="([^"]+)"/g)){articleImages++;if(!after.includes('src="'+m[1]+'"'))missing.push(file+': image '+m[1]);}
  for(const m of before.matchAll(/href="([^"]+)"/g)){articleLinks++;if(!after.includes('href="'+m[1]+'"'))missing.push(file+': link '+m[1]);}
}
const report={baselineCommit:'3aa9a29240bbb5c68bbd4905b8004f3f1f894afa',baseline,checkedAt:new Date().toISOString(),routes:oldPages.length,articleRoutes:articlePages.length,unchangedContentFiles:sourceFiles.length,unchangedAssetFiles:assetFiles.length,preservedElements,articleImages,articleLinks,missing,changed};
await mkdir('.preview',{recursive:true});await writeFile('.preview/rev01-content-audit.json',JSON.stringify(report,null,2));
if(missing.length||changed.length){console.error(JSON.stringify(report,null,2));process.exitCode=1;}else console.log(JSON.stringify(report,null,2));
