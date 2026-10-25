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
 function fromHash(){const post=posts.find(p=>'#'+p.id===location.hash);if(post)open(post);else if(dialog.open)dialog.close();}
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
