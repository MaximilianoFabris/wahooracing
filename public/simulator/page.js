const viewer=document.getElementById('simulator-viewer');
// Accept sizing only from this same-origin viewer. Its contents remain isolated
// from the shared site layout and follow the shared day/night theme.
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==viewer?.contentWindow||event.data?.type!=='wahoo-simulator-height')return;
  const height=Number(event.data.height);
  if(Number.isFinite(height)&&height>100&&height<100000)viewer.style.height=`${Math.ceil(height)+2}px`;
});
