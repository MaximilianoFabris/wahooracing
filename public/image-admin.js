const local=location.hostname==='127.0.0.1'&&location.port==='4176';
const status=document.querySelector('#admin-status'),library=document.querySelector('#image-library'),publish=document.querySelector('#publish-images');
const ratio=(w,h)=>{const gcd=(a,b)=>b?gcd(b,a%b):a;const d=gcd(w,h);return `${w/d}:${h/d} (${(w/h).toFixed(2)}:1)`;};
const size=n=>`${(n/1024).toFixed(0)} KB`;
function element(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
async function request(url,options){const res=await fetch(url,options);const data=await res.json();if(!res.ok)throw Error(data.error||'Request failed');return data;}
async function start(){
 if(local){document.querySelector('#local-editor').hidden=true;document.querySelector('#local-help').textContent='Choose an image, preview your replacement and save it. Save updates your local website and keeps a backup. Publish sends the saved images to the live website.';publish.hidden=false;}
 const entries=await request('/image-catalog.json');
 status.textContent=`${entries.length} replaceable images · marketing and history photography`;
 for(const entry of entries){
  const card=element('article',null,'admin-image');card.dataset.search=(entry.name+' '+entry.pages.join(' ')).toLowerCase();
  const image=element('img');image.src=entry.path;image.alt=entry.name;image.loading='lazy';
  card.append(image,element('h2',entry.name));
  const details=element('dl');const values={};for(const label of ['Pixels','Aspect ratio','File size']){const value=element('dd','Loading…');values[label]=value;details.append(element('dt',label),value);}card.append(details);
  image.addEventListener('load',()=>{values.Pixels.textContent=`${image.naturalWidth} × ${image.naturalHeight}`;values['Aspect ratio'].textContent=ratio(image.naturalWidth,image.naturalHeight);values['File size'].textContent=size(entry.bytes);},{once:true});
  const labels={'/#intro':'A new way to experience the water','/#ch-01':'01 · The dream','/#ch-02':'02 · The opportunity','/#ch-03':'03 · Meet Wahoo','/#ch-04':'04 · You own it','/#ch-05':'05 · The journey','/#ch-06':'06 · Community','/#ch-07':'07 · The future','/#ch-08':'08 · Help build what comes next','/history/':'Our Story','/investors/':'Investors'};
  const usage=element('p','Used on: ','image-usage');for(const page of entry.pages){const a=element('a',labels[page]||page);a.href=page;a.target='_blank';usage.append(a,document.createTextNode(' · '));}card.append(usage);
  if(entry.variants.length>1)card.append(element('p','Responsive versions: '+entry.variants.map(p=>p.split('/').pop()).join(', ')));
  const input=element('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.disabled=!local;input.setAttribute('aria-label','Choose replacement for '+entry.name);
  const note=element('p',local?'Select JPG, PNG or WebP.':'Open the local editor to replace this image.','selection-info');
  const save=element('button','Save replacement');save.type='button';save.disabled=true;if(!local)save.hidden=true;
  card.append(input,note,save);library.append(card);
  let chosen,objectURL;
  input.addEventListener('change',async()=>{try{save.disabled=true;chosen=null;if(objectURL)URL.revokeObjectURL(objectURL);const file=input.files[0];if(!file)return;if(file.size>30*1024*1024)throw Error('Please choose an image smaller than 30 MB.');objectURL=URL.createObjectURL(file);const test=new Image();test.src=objectURL;await test.decode();chosen=test;image.src=objectURL;note.textContent=`Replacement: ${test.naturalWidth} × ${test.naturalHeight} px · ${ratio(test.naturalWidth,test.naturalHeight)} · ${size(file.size)}. Saved as optimized WebP. Shared uses update together.`;save.disabled=false;}catch(e){note.textContent=e.message;}});
  save.addEventListener('click',async()=>{try{save.disabled=true;note.textContent='Saving and backing up the current image…';const replacements=[];for(const asset of entry.variants){const canvas=document.createElement('canvas');const limit=asset.endsWith('-800.webp')?800:Math.min(chosen.naturalWidth,2400);canvas.width=limit;canvas.height=Math.round(chosen.naturalHeight*limit/chosen.naturalWidth);canvas.getContext('2d').drawImage(chosen,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/webp',.92);if(!data.startsWith('data:image/webp;'))throw Error('This browser cannot encode WebP.');replacements.push({path:asset,data:data.split(',')[1]});}const result=await request('/api/images',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({replacements})});note.textContent='Saved locally. Previous image backed up. Use “Publish saved images” to update the live website.';status.textContent=result.message;image.src=entry.path+'?saved='+Date.now();await image.decode();values.Pixels.textContent=`${image.naturalWidth} × ${image.naturalHeight}`;values['Aspect ratio'].textContent=ratio(image.naturalWidth,image.naturalHeight);values['File size'].textContent=size(result.bytes);}catch(e){note.textContent=e.message;save.disabled=false;}});
 }
 document.querySelector('#image-search').addEventListener('input',e=>{const term=e.target.value.toLowerCase();library.querySelectorAll('.admin-image').forEach(card=>card.hidden=!card.dataset.search.includes(term));});
}
publish.addEventListener('click',async()=>{try{publish.disabled=true;status.textContent='Building, checking and publishing saved images…';const result=await request('/api/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});status.textContent=result.message;}catch(e){status.textContent=e.message;}finally{publish.disabled=false;}});
start().catch(e=>status.textContent=e.message);
