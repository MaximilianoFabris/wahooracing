import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir,stat,copyFile,rename} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const run=promisify(execFile),origin='http://127.0.0.1:4176';let busy=false;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const git=(...args)=>run('git',['-c',`safe.directory=${root.replaceAll('\\','/')}`,...args],{cwd:root,maxBuffer:2*1024*1024});
async function catalog(){return JSON.parse(await readFile(path.join(dist,'image-catalog.json'),'utf8'));}
async function body(req){let chunks=[],length=0;for await(const chunk of req){length+=chunk.length;if(length>45*1024*1024)throw Error('Upload too large');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
function json(res,code,value){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
http.createServer(async(req,res)=>{try{
 if(req.headers.host!=='127.0.0.1:4176'){json(res,403,{error:'Local editor only'});return;}
 const url=new URL(req.url,origin);
 if(req.method==='POST'){
  if(req.headers.origin!==origin||req.headers['content-type']!=='application/json'){json(res,403,{error:'Open the local editor to save images'});return;}
  if(!['/api/images','/api/publish'].includes(url.pathname)){json(res,404,{error:'Unknown action'});return;}
  if(busy){json(res,409,{error:'Another save or publish is running. Please wait.'});return;}busy=true;
  try{
   const entries=await catalog(),allowed=new Set(entries.flatMap(e=>e.variants));
   if(url.pathname==='/api/images'){
    const data=await body(req);if(!Array.isArray(data.replacements)||!data.replacements.length||data.replacements.length>2)throw Error('Invalid replacement');
    const replacement=data.replacements.map(r=>{if(!allowed.has(r.path)||!r.path.endsWith('.webp')||typeof r.data!=='string')throw Error('Image is not editable');const bytes=Buffer.from(r.data,'base64');if(bytes.length<20||bytes.length>30*1024*1024||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP image');return {path:r.path,bytes};});
    const backup=path.join(root,'.image-admin-backups',new Date().toISOString().replaceAll(':','-')+'-'+randomUUID());await mkdir(backup,{recursive:true});
    for(const r of replacement){const source=path.join(root,'public',r.path),saved=path.join(backup,path.basename(r.path));await copyFile(source,saved);const staged=source+'.pending';await writeFile(staged,r.bytes);await rename(staged,source);await copyFile(source,path.join(dist,r.path));}
    for(const entry of entries)entry.bytes=(await stat(path.join(root,'public',entry.path))).size;await writeFile(path.join(dist,'image-catalog.json'),JSON.stringify(entries));
    json(res,200,{message:'Images saved locally with a backup. Ready to publish.',bytes:replacement[0].bytes.length});
   }else{
    await body(req);
    const branch=(await git('branch','--show-current')).stdout.trim();if(branch!=='website/initial-prototype')throw Error('The production branch is not active.');
    const paths=[...allowed].map(p=>'public'+p);
    const changes=(await git('status','--porcelain','--untracked-files=no')).stdout.split(/\r?\n/).filter(Boolean);
    if(changes.some(line=>!paths.includes(line.slice(3))))throw Error('Other website edits are present. Publish those separately before publishing images.');
    const staged=(await git('diff','--cached','--name-only')).stdout.trim();if(staged)throw Error('Other staged changes are present.');
    await run(process.execPath,['scripts/build.mjs'],{cwd:root,maxBuffer:2*1024*1024});
    for(const script of ['scripts/check.mjs','scripts/navigation-check.mjs'])await run(process.execPath,[script],{cwd:root,maxBuffer:2*1024*1024});
    if(changes.length){await git('add','--',...paths);await git('commit','-m','Update website photography from local image manager');}
    await git('push','origin','website/initial-prototype');
    json(res,200,{message:'Published to the deployment branch. The live website will update when the hosting build finishes, usually within a minute.'});
   }
  }finally{busy=false;}return;
 }
 if(!['GET','HEAD'].includes(req.method)){json(res,405,{error:'Method not allowed'});return;}
 let file=path.resolve(dist,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(dist+path.sep)&&file!==dist){json(res,403,{error:'Invalid path'});return;}
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){json(res,400,{error:e.stderr?.trim()||e.message});}
}).listen(4176,'127.0.0.1',()=>console.log(`Wahoo image manager: ${origin}/admin/`));
