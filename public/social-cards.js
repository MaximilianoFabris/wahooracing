for(const post of document.querySelectorAll('[data-social-post]')){
  const track=post.querySelector('[data-social-track]'),slides=[...track.children];
  const controls=post.querySelector('[data-social-controls]');
  const index=()=>slides.reduce((best,slide,i)=>Math.abs(slide.getBoundingClientRect().left-track.getBoundingClientRect().left)<Math.abs(slides[best].getBoundingClientRect().left-track.getBoundingClientRect().left)?i:best,0);
  const go=i=>track.scrollTo({left:slides[Math.max(0,Math.min(slides.length-1,i))].offsetLeft-slides[0].offsetLeft,behavior:'instant'});
  if(controls){
    controls.hidden=false;
    const prev=controls.querySelector('[data-social-prev]'),next=controls.querySelector('[data-social-next]'),position=controls.querySelector('[data-social-position]');
    const update=()=>{const i=index();prev.disabled=i===0;next.disabled=i===slides.length-1;position.textContent=`${i+1} / ${slides.length}`;};
    prev.addEventListener('click',()=>go(index()-1));next.addEventListener('click',()=>go(index()+1));
    let frame;track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});
    window.addEventListener('resize',update,{passive:true});update();
  }
  track.addEventListener('keydown',event=>{if(event.target!==track)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();go(event.key==='Home'?0:event.key==='End'?slides.length-1:index()+(event.key==='ArrowRight'?1:-1));}});
  const copy=post.querySelector('[data-social-copy]'),result=post.querySelector('[data-social-copy-result]');
  copy.hidden=false;copy.addEventListener('click',async()=>{
    const text=post.querySelector('[data-social-text]');
    try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text.textContent);result.textContent='Caption and hashtags copied.';}
    catch{const range=document.createRange();range.selectNodeContents(text);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);result.textContent='Copy is unavailable here. The complete caption and hashtags are selected; use your device’s Copy command.';}
  });
}
