const page=document.querySelector('[data-activity-ledger]');
if(page){
 const find=name=>page.querySelector(`[data-al-${name}]`);
 const form=find('filters'),controls=find('controls'),list=find('list'),result=find('results'),more=find('more'),retry=find('retry');
 const refresh=find('refresh'),refreshResult=find('refresh-result');
 const fields=form.elements,cache=new Map(),opened=new Set(),number=new Intl.NumberFormat('en-GB');
 const outcomes={completed:'Completed',failed:'Failed',requested:'Requested only',observed:'Observed',unknown:'Unknown'};
 let index,events=[],matches=[],limit=40,generation=0,busy=false,refreshing=false,lastRefresh=0;
 let updateSyncNote=()=>{};
 const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);if(className)node.className=className;return node;};
 const label=(collection,id)=>collection?.find(item=>item.id===id)?.name||id||'Unattributed';
 function dateLabel(event){
  const value=String(event.date||'');
  if(event.datePrecision==='unknown'||!/^\d{4}-\d{2}-\d{2}/.test(value))return 'Date not recorded';
  const parsed=new Date(value.length===10?`${value}T00:00:00Z`:value);
  if(!Number.isFinite(parsed.getTime()))return 'Date not recorded';
  return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',...(event.datePrecision==='timestamp'?{hour:'2-digit',minute:'2-digit',second:'2-digit'}:{}),timeZone:'UTC'}).format(parsed)+(event.datePrecision==='timestamp'?' UTC':event.datePrecision==='turn'?' · turn start':' · day only');
 }
 function action(event){
  const row=element('details',undefined,'al-action');row.dataset.actionId=String(event.id||'');
  const summary=element('summary'),date=element('span',dateLabel(event),'al-date');
  const title=element('span',undefined,'al-action-name');title.append(element('span',event.title||'Recorded action'));
  title.append(element('span',`${label(index.agents,event.actor)} · ${label(index.kinds,event.kind)}`,'al-action-labels'));
  summary.append(date,title,element('span',outcomes[event.status]||'Unknown','al-outcome'));row.append(summary);
  // Details are built only when opened, keeping long monthly histories lightweight.
  row.addEventListener('toggle',()=>{
   if(row.open)opened.add(event.id);else opened.delete(event.id);
   if(!row.open||row.querySelector('.al-detail'))return;
   const detail=element('div',undefined,'al-detail');if(event.summary)detail.append(element('p',event.summary));
   const facts=element('dl');
   for(const [name,value] of [['Topic',event.groupTitle||'No topic recorded'],['Evidence',event.evidence||'Evidence not specified'],['Outcome',event.status==='requested'?'A request was recorded; completion is not established by this entry.':event.status==='completed'?'This action was recorded as completed. Engineering validation requires separate evidence.':outcomes[event.status]||'Unknown']])facts.append(element('dt',name),element('dd',value));
   detail.append(facts);row.append(detail);
  });row.open=opened.has(event.id);return row;
 }
 function render(){
  // Native details toggle events are asynchronous; preserve the actual current state before replacing rows.
  for(const row of list.children){if(!row.dataset.actionId)continue;if(row.open)opened.add(row.dataset.actionId);else opened.delete(row.dataset.actionId);}
  const terms=fields.search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  matches=events.filter(event=>{
   const parsed=event.datePrecision==='timestamp'?new Date(event.date):null;
   const day=event.datePrecision==='unknown'?'':parsed&&Number.isFinite(parsed.getTime())?parsed.toISOString().slice(0,10):String(event.date||'').slice(0,10);
   return (!fields.actor.value||event.actor===fields.actor.value)&&(!fields.kind.value||event.kind===fields.kind.value)&&(!fields.status.value||event.status===fields.status.value)&&(!fields.from.value||(day&&day>=fields.from.value))&&(!fields.to.value||(day&&day<=fields.to.value))&&terms.every(term=>[event.title,event.summary,event.groupTitle,event.evidence,label(index.agents,event.actor),label(index.kinds,event.kind)].join(' ').toLocaleLowerCase().includes(term));
  });
  const shown=matches.slice(0,limit),fragment=document.createDocumentFragment();shown.forEach(event=>fragment.append(action(event)));list.replaceChildren(fragment);
  find('period').textContent=number.format(events.length);find('matches').textContent=number.format(matches.length);
  result.textContent=`Showing ${number.format(shown.length)} of ${number.format(matches.length)} matching actions in ${fields.month.value==='all'?'all available months':fields.month.selectedOptions[0]?.textContent||'the selected month'}.`;
  find('empty').hidden=matches.length!==0;more.hidden=limit>=matches.length;
  more.textContent=`Load ${Math.min(40,Math.max(0,matches.length-limit))} more actions`;
 }
 async function fetchJSON(url){const response=await fetch(url,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw new Error('Unavailable activity data');return response.json();}
 async function monthEvents(month){
  const cached=cache.get(month.id);if(cached?.sha256===month.sha256)return cached.events;
  // Public history is read only from its dedicated same-origin static directory.
  if(!/^\/activity-ledger\/[a-zA-Z0-9_-]+\.json$/.test(month.url))throw new Error('Invalid activity location');
  const data=await fetchJSON(month.url);if(!Array.isArray(data.events))throw new Error('Invalid activity data');
  cache.set(month.id,{sha256:month.sha256,events:data.events});return data.events;
 }
 async function loadPeriod(){
  const current=++generation;busy=true;retry.hidden=true;more.hidden=true;list.replaceChildren();find('empty').hidden=true;
  find('period').textContent='—';find('matches').textContent='—';result.textContent='Loading selected actions…';
  const selected=index.months.filter(month=>fields.month.value==='all'||month.id===fields.month.value);
  try{
   const loaded=[];
   // Bound simultaneous transfers, even when a reader explicitly selects all history.
   for(let offset=0;offset<selected.length;offset+=3){if(current!==generation)return;loaded.push(...await Promise.all(selected.slice(offset,offset+3).map(monthEvents)));}
   if(current!==generation)return;
   const seen=new Set();events=loaded.flat().filter(event=>event&&typeof event==='object'&&!seen.has(event.id)&&seen.add(event.id));
   events.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.id).localeCompare(String(b.id)));limit=40;busy=false;render();
  }catch{if(current!==generation)return;busy=false;events=[];result.textContent='The selected activity records could not be loaded. No partial results are shown. Retry or choose another period.';retry.hidden=false;}
 }
 function options(select,items){for(const item of items){const option=element('option',item.name||item.id);option.value=item.id;select.append(option);}}
 function sortedMonths(data){return [...data.months].sort((a,b)=>(a.id==='unknown')-(b.id==='unknown')||b.id.localeCompare(a.id));}
 function validateIndex(data){
  if(data.schema!=='wahoo.activity-public/1'||!Array.isArray(data.months)||!Number.isSafeInteger(data.totalEvents)||data.totalEvents<0||!Array.isArray(data.agents)||!Array.isArray(data.kinds))throw new Error('Invalid activity index');
  const ids=new Set();let total=0;
  for(const month of data.months){if(!/^(?:\d{4}-\d{2}|unknown)$/.test(month.id)||ids.has(month.id)||month.url!==`/activity-ledger/${month.id}.json`||!Number.isSafeInteger(month.count)||month.count<0||typeof month.sha256!=='string')throw new Error('Invalid month');ids.add(month.id);total+=month.count;}
  if(total!==data.totalEvents)throw new Error('Invalid total');return {...data,months:sortedMonths(data)};
 }
 function replaceChoices(select,items,emptyLabel){const previous=select.value;select.replaceChildren();if(emptyLabel)options(select,[{id:'',name:emptyLabel}]);options(select,items);if([...select.options].some(o=>o.value===previous))select.value=previous;}
 async function refreshIndex(manual=false){
  if(!index||busy||refreshing||(!manual&&Date.now()-lastRefresh<30000))return;
  lastRefresh=Date.now();refreshing=true;if(refresh){refresh.disabled=true;refresh.textContent='Checking…';}if(refreshResult)refreshResult.textContent='Checking for published updates…';
  const prior=index,selectedMonth=fields.month.value,requestGeneration=generation;
  try{
   const next=validateIndex(await fetchJSON('/activity-ledger/index.json'));
   if(next.totalEvents<prior.totalEvents)throw new Error('Older activity snapshot');
   const changed=JSON.stringify(next.months.map(m=>[m.id,m.sha256,m.count]))!==JSON.stringify(prior.months.map(m=>[m.id,m.sha256,m.count]));
   let nextEvents=events;
   if(changed){
    const selected=next.months.filter(m=>selectedMonth==='all'||m.id===selectedMonth),loaded=[];
    for(let i=0;i<selected.length;i+=3)loaded.push(...await Promise.all(selected.slice(i,i+3).map(monthEvents)));
    const seen=new Set();nextEvents=loaded.flat().filter(e=>e&&typeof e==='object'&&!seen.has(e.id)&&seen.add(e.id));nextEvents.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.id).localeCompare(String(b.id)));
   }
   // A period change wins over an in-flight background refresh.
   if(generation!==requestGeneration||fields.month.value!==selectedMonth)return;
   index=next;find('total').textContent=number.format(index.totalEvents);updateSyncNote();
   if(changed){
    replaceChoices(fields.month,[...index.months.map(m=>({id:m.id,name:`${m.id} · ${number.format(m.count)} actions`})),{id:'all',name:'All available months (loads full history)'}]);
    replaceChoices(fields.actor,index.agents,'All agents and authors');replaceChoices(fields.kind,index.kinds,'All action types');events=nextEvents;render();
   }
   if(refreshResult)refreshResult.textContent=changed?'Published actions refreshed. Your filters are preserved.':'Up to date with the latest published actions.';
  }catch{if(refreshResult)refreshResult.textContent='Refresh unavailable. Showing the last successfully loaded actions; try again shortly.';}
  finally{refreshing=false;if(refresh){refresh.disabled=false;refresh.textContent='Refresh actions';}}
 }
 async function initialize(){
  retry.hidden=true;result.textContent='Loading the latest available actions…';
  try{
   index=validateIndex(await fetchJSON('/activity-ledger/index.json'));
   index.months.sort((a,b)=>(a.id==='unknown')-(b.id==='unknown')||b.id.localeCompare(a.id));
   find('total').textContent=number.format(index.totalEvents);
   const syncNote=()=>{
    const stamp=Date.parse(index.historySyncedAt),age=Date.now()-stamp;
    if(!Number.isFinite(stamp)){find('sync').textContent='Sync time unavailable';return;}
    const utc=new Date(stamp).toISOString().replace('T',' ').replace(/\.\d+Z$/,' UTC');
    find('sync').textContent=index.automaticSync?.enabled?`Automatic collection · every ${index.automaticSync.intervalMinutes} minutes while the computer is available. Last collection: ${utc}. ${age>7200000?'Update overdue: the computer may be offline or the sync may need attention.':'Idle website heartbeat: hourly.'}`:`History last synchronized: ${utc}`;
   };updateSyncNote=syncNote;syncNote();setInterval(()=>{syncNote();if(document.visibilityState==='visible')refreshIndex();},60000);
   find('coverage').textContent=index.coverage?.label||'Available public action history.';
   find('limitations').textContent=Array.isArray(index.coverage?.limitations)?index.coverage.limitations.join(' '):index.coverage?.limitations||'Only available, reviewed records are included.';
   fields.month.replaceChildren();options(fields.month,index.months.map(month=>({id:month.id,name:`${month.id} · ${number.format(month.count)} actions`})));
   if(index.months.length){options(fields.month,[{id:'all',name:'All available months (loads full history)'}]);fields.month.value=index.months[0].id;}
   options(fields.actor,index.agents||[]);options(fields.kind,index.kinds||[]);controls.disabled=false;
   await loadPeriod();if(refresh)refresh.disabled=false;
  }catch{result.textContent='The action ledger could not be loaded. Retry loading, or explore the original milestones below.';retry.hidden=false;}
 }
 refresh?.addEventListener('click',()=>index?refreshIndex(true):initialize());
 window.addEventListener('focus',()=>refreshIndex());
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshIndex();});
 form.addEventListener('submit',event=>event.preventDefault());
 form.addEventListener('input',event=>{if(event.target.name==='month')return;if(index&&!busy){limit=40;render();}});
 form.addEventListener('change',event=>{if(event.target.name==='month')loadPeriod();else if(event.target.name!=='search'&&index&&!busy){limit=40;render();}});
 form.addEventListener('reset',event=>{event.preventDefault();for(const name of ['search','actor','kind','status','from','to'])fields[name].value='';fields.month.value=index.months[0]?.id||'';loadPeriod();});
 more.addEventListener('click',()=>{const firstNew=limit;limit+=40;render();const target=list.children[firstNew]?.querySelector('summary');target?.focus({preventScroll:true});});
 retry.addEventListener('click',()=>index?loadPeriod():initialize());
 const milestones=document.getElementById('milestones');
 function revealMilestones(){if(location.hash==='#milestones'&&milestones)milestones.open=true;}
 window.addEventListener('hashchange',revealMilestones);revealMilestones();initialize();
}
