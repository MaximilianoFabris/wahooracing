import {agents,icon} from './intelligence-roles.js';
const detail=document.querySelector('#wi-agent-detail');
document.querySelectorAll('[data-agent]').forEach(button=>button.addEventListener('click',()=>{
const a=agents.find(a=>a.id===button.dataset.agent);if(!a)return;
document.querySelectorAll('[data-agent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agent===a.id)));
detail.querySelector('.wi-detail-mark').innerHTML=a.id==='leo'?'<img class="wi-leo-portrait wi-detail-portrait" src="/assets/intelligence/leo/passport.png" alt="Leo, the fictional Wahoo AI Chief Engineer" width="1084" height="1451">':icon(a.icon);
detail.querySelector('[data-detail-name]').textContent=a.name+(a.short?' / '+a.short:'');
detail.querySelector('[data-detail-role]').textContent=a.role+' / '+a.discipline;
detail.querySelector('[data-detail-line]').textContent=a.line;
detail.querySelector('[data-detail-description]').textContent=a.description;
const ul=detail.querySelector('[data-detail-tasks]');ul.replaceChildren(...a.tasks.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));
if(button.classList.contains('wi-person'))detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}));

// Profile deep links select the matching existing detail; no role or identity is renamed.
function selectLinkedProfile(){const match=location.hash.match(/^#profile-([a-z]+)$/);if(!match)return;const button=document.getElementById('profile-'+match[1]);if(!button)return;button.click();requestAnimationFrame(()=>detail.scrollIntoView({block:'start',behavior:'instant'}));}
window.addEventListener('hashchange',selectLinkedProfile);selectLinkedProfile();
