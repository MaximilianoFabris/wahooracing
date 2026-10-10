(()=>{
const local=location.hostname==='127.0.0.1'&&location.port==='4176';
const status=document.querySelector('#admin-status'),library=document.querySelector('#image-library'),publish=document.querySelector('#publish-images');
const ratio=(w,h)=>{const gcd=(a,b)=>b?gcd(b,a%b):a;const d=gcd(w,h);return `${w/d}:${h/d} (${(w/h).toFixed(2)}:1)`;};
const size=n=>`${(n/1024).toFixed(0)} KB`;
function element(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
async function request(url,options){const res=await fetch(url,options);const data=await res.json();if(!res.ok)throw Error(data.error||'Request failed');return data;}
let queue=Promise.resolve(),pending=0;
async function start(){
 publish.hidden=!local;
 const entries=await request('/image-catalog.json'),groups=new Map();
 entries.sort((a,b)=>(a.page===b.page?0:a.page==='/'?-1:b.page==='/'?1:a.page.localeCompare(b.page)));
 for(const entry of entries){
  if(!groups.has(entry.page)){
   const group=element('section',null,'admin-page'),heading=element('h2',entry.pageTitle),grid=element('div',null,'admin-grid');
   group.append(heading,grid);library.append(group);groups.set(entry.page,{group,grid});
  }
  const card=element('article',null,'admin-image');card.dataset.search=(entry.name+' '+entry.pageTitle+' '+entry.pages.join(' ')).toLowerCase();card.dataset.slot=entry.id;
  const image=element('img');image.src=entry.path;image.alt=entry.name;image.loading='lazy';
  card.append(image,element('h3',entry.name));
  const details=element('dl'),values={};for(const label of ['Pixels','Aspect ratio','File size']){const value=element('dd','Loading…');values[label]=value;details.append(element('dt',label),value);}card.append(details);
  const metadata=()=>{if(!image.naturalWidth)return;values.Pixels.textContent=`${image.naturalWidth} × ${image.naturalHeight}`;values['Aspect ratio'].textContent=ratio(image.naturalWidth,image.naturalHeight);values['File size'].textContent=size(entry.bytes);};image.addEventListener('load',metadata);
  const usage=element('a','View this placement ↗','image-usage');usage.href=entry.pages[0];usage.target='_blank';card.append(usage);
  const drop=element('label',local?'Drop an image here or choose a file':'Choose an image in the local manager','image-drop');
  const input=element('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.disabled=!local;input.setAttribute('aria-label','Replace '+entry.name);drop.append(input);
  const note=element('p',null,'selection-info');note.setAttribute('role','status');card.append(drop,note);groups.get(entry.page).grid.append(card);
  function select(file){
   if(!local||!file)return;
   pending++;publish.disabled=true;input.disabled=true;note.textContent='Waiting to save…';
   queue=queue.catch(()=>{}).then(async()=>{
    let objectURL;
    try{
     if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPG, PNG or WebP image.');
     if(file.size>30*1024*1024)throw Error('Choose an image smaller than 30 MB.');
     objectURL=URL.createObjectURL(file);const chosen=new Image();chosen.src=objectURL;await chosen.decode();image.src=objectURL;note.textContent='Saving…';
     const replacements=[];for(const asset of entry.variants){const canvas=document.createElement('canvas');const limit=Math.min(chosen.naturalWidth,asset.endsWith('-800.webp')?800:2400);canvas.width=limit;canvas.height=Math.max(1,Math.round(chosen.naturalHeight*limit/chosen.naturalWidth));canvas.getContext('2d').drawImage(chosen,0,0,canvas.width,canvas.height);const encoded=canvas.toDataURL('image/webp',.92);if(!encoded.startsWith('data:image/webp;'))throw Error('This browser cannot encode WebP.');replacements.push({path:asset,data:encoded.split(',')[1]});}
     const result=await request('/api/images',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({replacements})});entry.bytes=result.bytes;image.src=entry.path+'?saved='+Date.now();await image.decode();metadata();note.textContent='Saved automatically · previous image backed up';status.textContent='Local website updated. Publish when ready.';
    }catch(e){note.textContent=e.message;image.src=entry.path+'?refresh='+Date.now();}
    finally{if(objectURL)URL.revokeObjectURL(objectURL);pending--;input.disabled=false;publish.disabled=pending>0;input.value='';}
   });
  }
  input.addEventListener('change',()=>select(input.files[0]));
  for(const type of ['dragenter','dragover'])drop.addEventListener(type,e=>{e.preventDefault();if(local)drop.classList.add('dragging');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');select(e.dataTransfer.files[0]);});
 }
 document.querySelector('#image-search').addEventListener('input',e=>{const term=e.target.value.toLowerCase();library.querySelectorAll('.admin-image').forEach(card=>card.hidden=!card.dataset.search.includes(term));for(const {group,grid} of groups.values())group.hidden=![...grid.children].some(card=>!card.hidden);});
 // Prevent files dropped outside a placement from replacing the browser tab.
 document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>e.preventDefault());
}
publish.addEventListener('click',async()=>{try{publish.disabled=true;status.textContent='Building, checking and publishing saved images…';const result=await request('/api/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});status.textContent=result.message;}catch(e){status.textContent=e.message;}finally{publish.disabled=false;}});
start().catch(e=>status.textContent=e.message);

})();

