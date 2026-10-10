const themeButton=document.querySelector('.theme-toggle');
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 const night=theme==='night';
 const icon=themeButton?.querySelector('[data-theme-icon]');
 icon?.setAttribute('d',night?'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M6.3 17.7l-1.4 1.4 M19.1 4.9l-1.4 1.4':'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z');

 document.querySelectorAll('img[src]').forEach(img=>{
  const original=new URL(img.src,location.href).pathname.replace('/assets/day/','/assets/');
  if(window.wahooDayDrawings?.includes(original))img.src=night?original:original.replace('/assets/','/assets/day/');
 });
 themeButton?.setAttribute('aria-label',night?'Switch to day mode':'Switch to night mode');
 themeButton?.setAttribute('aria-pressed',String(night));
 const label=themeButton?.querySelector('[data-theme-label]');if(label)label.textContent=night?'Day mode':'Night mode';
 document.querySelectorAll('img[src*="/assets/brand/"]').forEach(img=>{img.src=img.src.replace(/(white|black)(?=\.png)/,night?'white':'black');});
}
applyTheme(document.documentElement.dataset.theme);
themeButton?.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='night'?'day':'night';applyTheme(theme);try{localStorage.setItem('wahoo-theme',theme);}catch{}});
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#primary-nav');
document.querySelectorAll('[data-station]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('[data-station-figure]').forEach(f=>f.hidden=f.dataset.stationFigure!==button.dataset.station);
}));
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width: 901px)');
const layers=[...document.querySelectorAll('[data-depth]')],reveals=[...document.querySelectorAll('.reveal-visual')];let pending=false;
function motion(){pending=false;const active=!reduce.matches&&desktop.matches;const hero=document.querySelector('.hero');const y=hero?Math.min(800,Math.max(0,-hero.getBoundingClientRect().top)):0;layers.forEach(el=>el.style.transform=active?`translate3d(0,${(y*Number(el.dataset.depth)).toFixed(1)}px,0)`:'none');reveals.forEach(el=>{const progress=Math.max(0,Math.min(1,(innerHeight-el.getBoundingClientRect().top)/(innerHeight*.75)));el.style.transform=active?`translate3d(0,${((1-progress)*18).toFixed(1)}px,0)`:'none';el.style.opacity=active?String(.6+.4*progress):'1';});}
function queueMotion(){if(!pending){pending=true;requestAnimationFrame(motion);}}
if(layers.length||reveals.length){window.addEventListener('scroll',queueMotion,{passive:true});window.addEventListener('resize',queueMotion);reduce.addEventListener('change',queueMotion);desktop.addEventListener('change',queueMotion);motion();}
const viewData={hero:['hull-hero.webp','Perspective view of the H0 R03 hull','Perspective View'],bottom:['hull-bottom.webp','Underside view of the H0 R03 hull','Underside'],side:['hull-side.webp','Side view of the H0 R03 hull','Side View'],front:['hull-front.webp','Front view looking toward the bow of the H0 R03 hull','Front View'],back:['hull-back.webp','Back view looking toward the stern of the H0 R03 hull','Back View']};
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{const [src,alt,caption]=viewData[button.dataset.view];const image=document.querySelector('#explore-image');image.src='/assets/'+src;image.alt=alt;document.querySelector('#view-caption').textContent=caption;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
const system=document.querySelector('#filter-system'),type=document.querySelector('#filter-type'),subject=document.querySelector('#filter-path'),sort=document.querySelector('#sort-records');
if(system&&type&&subject){
 const params=new URLSearchParams(location.search);
 for(const [el,key] of [[system,'system'],[type,'type'],[subject,'subject'],[sort,'sort']])if([...el.options].some(o=>o.value===params.get(key)))el.value=params.get(key);
 if(type.value!=='all')document.querySelector('.additional-filters').open=true;
 if(/^#reading-[1-6]$/.test(location.hash))subject.value=location.hash.slice(1);
 function filter(save=true){
 const grid=document.querySelector('#journal-records');const cards=[...grid.children];
 cards.sort((a,b)=>{if(sort.value==='reading')return Number(a.dataset.reading)-Number(b.dataset.reading);const x=a.dataset.date,y=b.dataset.date;if(!x||!y)return x?-1:y?1:Number(a.dataset.reading)-Number(b.dataset.reading);return (sort.value==='oldest'?x.localeCompare(y):y.localeCompare(x))||(sort.value==='oldest'?Number(b.dataset.publicationOrder)-Number(a.dataset.publicationOrder):Number(a.dataset.publicationOrder)-Number(b.dataset.publicationOrder));});cards.forEach(c=>grid.append(c));
 let count=0;document.querySelectorAll('#journal-records .journal-item').forEach(item=>{const show=(system.value==='all'||item.dataset.system.split(' ').includes(system.value))&&(type.value==='all'||item.dataset.kind===type.value)&&(subject.value==='all'||item.dataset.path===subject.value);item.hidden=!show;if(show)count++;});
 document.querySelector('#filter-count').textContent=`${count} ${count===1?'record':'records'}`;document.querySelector('#journal-empty').hidden=count!==0;
 const query=new URLSearchParams();for(const [el,key] of [[system,'system'],[type,'type'],[subject,'subject'],[sort,'sort']])if(el.value!=='all'&&(key!=='sort'||el.value!=='newest'))query.set(key,el.value);
 const index='/journal/'+(query.size?'?'+query:'');if(save)history.replaceState(null,'',index);
 document.querySelectorAll('#journal-records h3 a').forEach(a=>{const url=new URL(a.href,location.origin);url.search='';url.searchParams.set('index',index+'#record-'+url.pathname.split('/')[2]);a.href=url.pathname+url.search;});
 }
 for(const el of [system,type,subject,sort])el.addEventListener('change',()=>filter());filter(false);
}
// One article body and reading sequence; only the contextual return destination changes.
const study=document.querySelector('[data-study-systems]');
if(study){
 const params=new URLSearchParams(location.search);const systems=JSON.parse(study.dataset.studySystems);
 const origin=systems.find(s=>s.slug===params.get('from'));const indexValue=params.get('index');let index=null;
 if(indexValue?.startsWith('/journal/')){const u=new URL(indexValue,location.origin);if(u.origin===location.origin&&u.pathname==='/journal/'&&[...u.searchParams.keys()].every(k=>['subject','system','type','sort'].includes(k)))index=u.pathname+u.search+(/^#record-[a-z0-9-]+$/.test(u.hash)?u.hash:'');}
 if(origin){const destination='/systems/'+origin.slug+'/';document.querySelectorAll('[data-study-return]').forEach(a=>{a.href=destination+'#studies';a.textContent='Back to '+origin.name+' ↗';});document.querySelectorAll('#primary-nav a[href="/journal/"],.site-footer a[href="/journal/"]').forEach(a=>{a.href=destination;a.textContent=origin.name;});}
 else if(index){document.querySelectorAll('[data-study-return]').forEach(a=>{a.href=index.includes('#')?index:index+'#record-'+location.pathname.split('/')[2];a.textContent='Back to your results ↗';});}
 if(origin||index)for(const a of study.querySelectorAll('a[href^="/journal/"]')){if(a.hasAttribute('data-study-return'))continue;const u=new URL(a.href,location.origin);if(!/^\/journal\/[^/]+\/$/.test(u.pathname))continue;if(origin)u.searchParams.set('from',origin.slug);else u.searchParams.set('index',index);a.href=u.pathname+u.search+u.hash;}
}
const charts=document.querySelectorAll('[data-chart]');
if(charts.length)fetch('/assets/displacement.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json();}).then(data=>charts.forEach(chart=>{const mass=chart.querySelector('[data-mass]'),density=chart.querySelector('[data-density]');function update(){const p=data.find(r=>r.mass===Number(mass.value)&&r.density===Number(density.value));if(!p?.achievable)return;const point=chart.querySelector('.chart-point');point.setAttribute('cx',String(62+p.mass/80*615));point.setAttribute('cy',String(290-p.immersion/.16*235));chart.querySelector('[data-chart-readout]').textContent=`${p.mass} kg → ${p.immersion.toFixed(4)} m level immersion in ${p.density===1025?'seawater':'freshwater'}. Calculated estimate.`;}mass.addEventListener('change',update);density.addEventListener('change',update);update();})).catch(()=>charts.forEach(chart=>{chart.querySelector('.chart-controls').hidden=true;chart.querySelector('[data-chart-readout]').textContent='Interactive values are unavailable. The source table and plotted data remain available below.';}));

// Keep transparent engineering drawings readable at original resolution.
let drawingNumber=0;
for(const a of document.querySelectorAll('a[href^="/assets/geometry/"],a[href^="/assets/engineering/"],a[href^="/assets/hull-section-"]')){
  a.id=a.id||'drawing-'+(++drawingNumber);
  const params=new URLSearchParams({image:a.getAttribute('href'),return:location.pathname+location.search+'#'+a.id});
  a.href='/inspect/?'+params;
}
// Expand a reading path or drawing's disclosure after a direct return link.
function revealHash(){const target=document.getElementById(location.hash.slice(1));if(!target)return;for(let el=target;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}
if(location.hash)revealHash();window.addEventListener('hashchange',revealHash);
const returnLink=document.querySelector('[data-image-return]');
if(returnLink){const value=new URLSearchParams(location.search).get('return');if(value&&/^\/(?:journal|systems|history|explore|roadmap)\/[a-zA-Z0-9_/?=&%#.-]*$/.test(value)){
  const destination=new URL(value,location.origin);
  if(destination.origin===location.origin){returnLink.href=destination.pathname+destination.search+destination.hash;returnLink.textContent='Return to where you were reading ↗';}
}}

const inspected=document.querySelector('[data-inspection-image]');
if(inspected){const src=new URLSearchParams(location.search).get('image');const status=document.querySelector('[data-image-status]');const zoom=document.querySelector('[data-image-zoom]');if(/^\/assets\/(?:(geometry|engineering)\/[a-zA-Z0-9_-]+\.(png|svg)|hull-section-(25|50|75|90)\.svg)$/.test(src||'')){inspected.src=src;inspected.hidden=false;status.textContent='Loading drawing…';inspected.onload=()=>{zoom.disabled=false;status.textContent='Drawing loaded. '+inspected.naturalWidth+' × '+inspected.naturalHeight+' pixels.';};inspected.onerror=()=>{status.textContent='This drawing could not be loaded. Use the return link to choose another drawing.';};zoom.addEventListener('click',()=>{const large=inspected.classList.toggle('original-size');inspected.style.width=large?inspected.naturalWidth+'px':'';zoom.textContent=large?'Fit to screen':'Original size';zoom.setAttribute('aria-pressed',String(large));});}}

// Include drawings loaded by the inspection viewer after initial page setup.
applyTheme(document.documentElement.dataset.theme);
// Specification selection links both orthographic views to the same reviewed record.
document.querySelectorAll('[data-board-spec]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-board-spec]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('[data-board-detail]').forEach(a=>a.hidden=a.dataset.boardDetail!==button.dataset.boardSpec);
 document.querySelectorAll('[data-board-region]').forEach(g=>g.toggleAttribute('hidden',g.dataset.boardRegion!==button.dataset.zone));
 document.querySelectorAll('[data-component]').forEach(g=>g.setAttribute('aria-pressed',String(g.dataset.component===button.dataset.zone)));
 document.querySelector('[data-board-selection]').textContent=button.querySelector('.spec-name').textContent+' · '+button.querySelector('strong').textContent;
 const diagrams=document.querySelector('.board-diagrams');const bounds=diagrams.getBoundingClientRect();if(bounds.top<80||bounds.bottom>innerHeight)diagrams.scrollIntoView({behavior:'instant',block:'start'});
 document.querySelector('[data-board-location]').textContent=button.dataset.zone==='hull'?'Geometry envelope highlighted':'Original component silhouette · illustrative placement';
}));

document.querySelectorAll('[data-component]').forEach(part=>{
 const select=()=>document.querySelector('[data-board-spec][data-zone="'+part.dataset.component+'"]')?.click();
 part.addEventListener('click',select);part.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
});

// Reserve the closed header height without shifting content when the menu opens.
const fixedHeader=document.querySelector('.site-header');
if(fixedHeader){
 const syncHeaderHeight=()=>{if(!document.querySelector('#primary-nav.open'))document.documentElement.style.setProperty('--header-height',`${fixedHeader.getBoundingClientRect().height}px`);};
 new ResizeObserver(syncHeaderHeight).observe(fixedHeader);
 syncHeaderHeight();
}


document.querySelectorAll('[data-flow]').forEach(button=>button.addEventListener('click',()=>{
 const section=button.closest('.board-flows');
 section.querySelectorAll('[data-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 section.querySelectorAll('[data-flow-route]').forEach(route=>route.classList.toggle('flow-muted',button.dataset.flow!=='all'&&route.dataset.flowRoute!==button.dataset.flow));
 const descriptions={air:'Air enters at the bow and follows the concept’s internal and peripheral routes toward the engine.',breather:'The fuel tank has a separate ventilation route; final routing remains to be defined.',cooling:'Conceptual supply near the jet pump, routing toward the engine and a separate water outlet. Cooling architecture remains open.',exhaust:'Exhaust travels from the engine through the tuned pipe toward the stern.',bilge:'The bilge pump has a separate discharge route for water inside the hull.',all:'Select a route to follow its path through the board.'};
 section.querySelector('.flow-description').textContent=descriptions[button.dataset.flow];
}));

document.querySelectorAll('.journal-carousel').forEach(carousel=>{
 const track=carousel.querySelector('.carousel-track');
 const previous=carousel.querySelector('[data-carousel-prev]');
 const next=carousel.querySelector('[data-carousel-next]');
 const update=()=>{previous.disabled=track.scrollLeft<=5;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-5;};
 const move=direction=>{const step=track.children[1].offsetLeft-track.children[0].offsetLeft;track.scrollBy({left:direction*Math.max(1,Math.floor(track.clientWidth/step))*step,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 track.addEventListener('scroll',update,{passive:true});
 new ResizeObserver(update).observe(track);update();
});
