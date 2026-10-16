const page=document.querySelector('[data-work-page]');
if(page){
 const form=page.querySelector('[data-work-filters]');
 const search=page.querySelector('[data-work-search]');
 const status=page.querySelector('[data-work-status]');
 const agent=page.querySelector('[data-work-agent]');
 const result=page.querySelector('[data-work-results]');
 const empty=page.querySelector('[data-work-empty]');
 const more=page.querySelector('[data-work-more]');
 const entries=[...page.querySelectorAll('[data-work-entry]')];
 const searchable=new Map(entries.map(entry=>[entry,entry.textContent.toLocaleLowerCase()]));
 const pageSize=12;
 let visibleLimit=pageSize;
 let matches=[];
 function render(){
  const terms=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  matches=entries.filter(entry=>(!status.value||entry.dataset.status===status.value)&&(!agent.value||entry.dataset.agents.split(' ').includes(agent.value))&&terms.every(term=>searchable.get(entry).includes(term)));
  const visible=new Set(matches.slice(0,visibleLimit));
  entries.forEach(entry=>{entry.hidden=!visible.has(entry);});
  empty.hidden=matches.length!==0;
  more.hidden=matches.length<=visibleLimit;
  const shown=Math.min(visibleLimit,matches.length);
  result.textContent=`Showing ${shown} of ${matches.length} matching ${matches.length===1?'entry':'entries'} (${entries.length} in the public record).`;
 }
 function filter(){visibleLimit=pageSize;render();}
 form.addEventListener('submit',event=>event.preventDefault());
 search.addEventListener('input',filter);
 status.addEventListener('change',filter);
 agent.addEventListener('change',filter);
 form.addEventListener('reset',()=>{search.value='';status.value='';agent.value='';filter();});
 more.addEventListener('click',()=>{
  const firstNew=matches[visibleLimit];
  visibleLimit+=pageSize;
  render();
  firstNew?.focus({preventScroll:true});
 });
 render();
 form.hidden=false;
}
