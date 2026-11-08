const posts=[...document.querySelectorAll('[data-social-post]')],updates=new Map();
for(const post of posts){
 const track=post.querySelector('[data-social-track]'),slides=[...track.children],controls=post.querySelector('[data-social-controls]');
 const index=()=>slides.reduce((best,slide,i)=>Math.abs(slide.getBoundingClientRect().left-track.getBoundingClientRect().left)<Math.abs(slides[best].getBoundingClientRect().left-track.getBoundingClientRect().left)?i:best,0);
 const go=i=>track.scrollTo({left:slides[Math.max(0,Math.min(slides.length-1,i))].offsetLeft-slides[0].offsetLeft,behavior:'instant'});
 if(controls){
  controls.hidden=false;
  const prev=controls.querySelector('[data-social-prev]'),next=controls.querySelector('[data-social-next]'),position=controls.querySelector('[data-social-position]');
  const update=()=>{const i=index();prev.disabled=i===0;next.disabled=i===slides.length-1;position.textContent=`${i+1} / ${slides.length}`;};
  updates.set(post,update);prev.addEventListener('click',()=>go(index()-1));next.addEventListener('click',()=>go(index()+1));
  let frame;track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});
  window.addEventListener('resize',update,{passive:true});update();
 }
 track.addEventListener('keydown',event=>{if(event.target!==track)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();go(event.key==='Home'?0:event.key==='End'?slides.length-1:index()+(event.key==='ArrowRight'?1:-1));}});
 const copy=post.querySelector('[data-social-copy]'),result=post.querySelector('[data-social-copy-result]');
 copy.hidden=false;copy.addEventListener('click',async()=>{
  const text=post.querySelector('[data-social-text]');
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text.textContent);result.textContent='Caption and hashtags copied.';}
  catch{const range=document.createRange();range.selectNodeContents(text);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);result.textContent='The complete caption and hashtags are selected; use your device’s Copy command.';}
 });
}
const gallery=document.querySelector('[data-social-gallery]'),dialog=document.querySelector('[data-social-dialog]');
const collection=gallery?.querySelector('[data-social-collection-filter]'),category=gallery?.querySelector('[data-social-category-filter]'),tiles=[...document.querySelectorAll('[data-social-tile]')];
function filterPosts(){
 if(!collection||!category)return;
 const visible=tiles.filter(tile=>{const show=(collection.value==='all'||tile.dataset.socialCollection===collection.value)&&(category.value==='all'||tile.dataset.socialCategory===category.value);tile.hidden=!show;const post=posts.find(p=>p.id===tile.dataset.socialOpen);if(post)post.hidden=!show;return show;});
 const slots=new Set(visible.map(tile=>tile.dataset.publicationPosition));
 gallery.querySelector('[data-social-filter-count]').textContent=`${visible.length} of ${tiles.length} entries · ${slots.size} publishing slots`;
 gallery.querySelector('[data-social-empty]').hidden=visible.length!==0;
}
function hashCollection(){
 const id=location.hash.slice(1);if(!collection||![...collection.options].some(o=>o.value===id&&id!=='all'))return false;
 collection.value=id;category.value='all';filterPosts();return true;
}
if(collection&&category){
 gallery.querySelector('[data-social-filters]').hidden=false;
 collection.addEventListener('change',filterPosts);category.addEventListener('change',filterPosts);
 gallery.querySelector('[data-social-clear]').addEventListener('click',()=>{collection.value=category.value='all';filterPosts();history.replaceState(null,'','#publication-sequence');});
 for(const link of gallery.querySelectorAll('[data-social-filter-batch]'))link.addEventListener('click',()=>{collection.value=link.dataset.socialFilterBatch;category.value='all';filterPosts();});
 filterPosts();hashCollection();
}
if(gallery&&typeof dialog?.showModal==='function'){
 gallery.classList.add('social-enhanced');
 const body=dialog.querySelector('[data-social-dialog-body]'),close=dialog.querySelector('[data-social-close]'),origins=new Map(posts.map(post=>[post,post.parentNode]));
 let active=null,trigger=null;
 function restore(){if(active){origins.get(active).append(active);active=null;}document.body.classList.remove('social-modal-open');}
 function open(post){
  if(active===post)return;
  restore();active=post;body.append(post);dialog.setAttribute('aria-labelledby',post.id+'-title');
  document.body.classList.add('social-modal-open');if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;requestAnimationFrame(()=>updates.get(post)?.());
 }
 function fromHash(){if(hashCollection()){if(dialog.open)dialog.close();return;}const post=posts.find(p=>'#'+p.id===location.hash);if(post){post.hidden=false;open(post);}else if(dialog.open)dialog.close();}
 for(const tile of gallery.querySelectorAll('[data-social-open]'))tile.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();trigger=tile;const id=tile.dataset.socialOpen;
  if(location.hash!=='#'+id)history.pushState(null,'','#'+id);
  open(posts.find(p=>p.id===id));
 });
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{
  const previous=active;restore();
  if(previous&&location.hash==='#'+previous.id)history.replaceState(null,'','#'+origins.get(previous).closest('.social-batch').id);
  const target=trigger||gallery.querySelector(`[data-social-open="${previous?.id}"]`);target?.focus({preventScroll:true});trigger=null;
 });
 window.addEventListener('hashchange',fromHash);window.addEventListener('popstate',fromHash);fromHash();
}
