import {writeFile,stat,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const entries=[];
const labels={intro:'A new way to experience the water','ch-01':'The dream','ch-02':'The opportunity','ch-03':'Meet Wahoo','ch-04':'You own it','ch-05':'The journey','ch-06':'Community','ch-07':'The future','ch-08':'Help build what comes next'};
export async function imagePlacements(root,page,title,html){
 const counts=new Map(),replacements=[];
 for(const match of html.matchAll(/<img\b[^>]*>|url\([^)]*\)/g)){
  const assets=[...match[0].matchAll(/\/assets\/(?:landing|history)\/[a-zA-Z0-9_-]+\.(?:webp|png|jpg)/g)].map(m=>m[0]);if(!assets.length)continue;
  const anchor=page==='/'?[...html.slice(0,match.index).matchAll(/<(?:section|article)\b[^>]*\bid="(intro|ch-\d+)"/g)].at(-1)?.[1]:null;
  const key=anchor||path.basename(assets[0]).replace(/-(?:800|1920)\.webp$|\.[^.]+$/,'');
  const count=(counts.get(key)||0)+1;counts.set(key,count);
  const id=(page==='/'?'landing':page.replace(/^\/|\/$/g,'').replaceAll('/','-'))+'-'+key+(count>1?'-'+count:'');
  const variants=[];let fragment=match[0];
  for(const asset of [...new Set(assets)]){
   const target='/assets/managed/'+id+'-'+path.basename(asset),output=path.join(root,'dist',target),saved=path.join(root,'public',target);
   await mkdir(path.dirname(output),{recursive:true});await copyFile(await stat(saved).catch(()=>null)?saved:path.join(root,'public',asset),output);
   fragment=fragment.replaceAll(asset,target);variants.push(target);
  }
  const primary=variants.find(v=>!v.endsWith('-800.webp'))||variants[0];
  entries.push({id,path:primary,name:labels[anchor]||path.basename(assets[0]).replace(/-\d+\.webp$|\.[^.]+$/,'').replaceAll('-',' '),page,pageTitle:page==='/'?'Landing page':title,pages:[page+(anchor?'#'+anchor:'')],variants,bytes:(await stat(path.join(root,'dist',primary))).size});
  replacements.push({start:match.index,end:match.index+match[0].length,fragment});
 }
 for(const r of replacements.reverse())html=html.slice(0,r.start)+r.fragment+html.slice(r.end);return html;
}
export async function imageCatalog(root){await writeFile(path.join(root,'dist/image-catalog.json'),JSON.stringify(entries));return entries;}
