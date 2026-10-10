import {readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
// Marketing and history photography are editable; sourced scientific graphics stay in their records.
export async function imageCatalog(root,pages){
 const entries=new Map();
 for(const file of pages){
  if(file==='admin/index.html')continue;
  const html=await readFile(path.join(root,'dist',file),'utf8');
  const page='/'+file.replace(/index\.html$/,'');
  for(const match of html.matchAll(/\/assets\/(?:landing|history)\/[a-zA-Z0-9_-]+\.(?:webp|png|jpg)/g)){
   const url=match[0];if(!await stat(path.join(root,'public',url)).catch(()=>null))continue;
   const canonical=url.replace(/-800\.webp$/,'-1920.webp');
   if(!entries.has(canonical))entries.set(canonical,{path:canonical,name:path.basename(canonical).replace(/-1920\.webp$|\.webp$|\.png$|\.jpg$/,'').replaceAll('-',' '),pages:[],variants:[]});
   let location=page;
   if(page==='/'){
    const ids=[...html.slice(0,match.index).matchAll(/<(?:section|article)\b[^>]*\bid="(intro|ch-\d+)"/g)];
    if(ids.length)location='/#'+ids.at(-1)[1];
   }
   const entry=entries.get(canonical);if(!entry.pages.includes(location))entry.pages.push(location);
   if(!entry.variants.includes(url))entry.variants.push(url);
  }
 }
 const catalog=await Promise.all([...entries.values()].map(async entry=>({...entry,bytes:(await stat(path.join(root,'public',entry.path))).size})));
 await writeFile(path.join(root,'dist/image-catalog.json'),JSON.stringify(catalog));
 return catalog;
}
