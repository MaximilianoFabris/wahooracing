import {agents,icon} from '../public/intelligence-roles.js';
const chief=agents.find(a=>a.id==='leo');
const specialists=agents.filter(a=>!['leo','isaac','grace','clio'].includes(a.id));
const reviewer=agents.find(a=>a.id==='isaac');
const communicator=agents.find(a=>a.id==='grace');
const controller=agents.find(a=>a.id==='clio');
const portrait=(cls='')=>`<img class="wi-leo-portrait ${cls}" src="/assets/intelligence/leo/passport.png" alt="Leo, Wahoo’s fictional AI Chief Engineer" width="1084" height="1451" loading="lazy">`;
const node=(a,extra='')=>`<button id="profile-${a.id}" class="wi-node ${extra}" type="button" data-agent="${a.id}" aria-pressed="${a.id==='leo'}" aria-controls="wi-agent-detail">${a.id==='leo'?portrait('wi-node-portrait'):icon(a.icon)}<span><strong>${a.name}</strong><small>${a.role}</small></span><span class="wi-plus" aria-hidden="true">↗</span></button>`;

// Labels and dashed connectors use exactly the same angular positions.
function heroPositions(){
 return [...specialists,reviewer,communicator,controller].map((agent,index)=>{
  const angle=(-90+(index+1)*360/agents.length)*Math.PI/180;
  return {agent,angle,x:50+37.5*Math.cos(angle),y:50+(225/540*100)*Math.sin(angle)};
 });
}
function heroSpokes(){
 return heroPositions().map(({agent,angle})=>{
  // Leave a clear gap at the agent label; aim every connector at Leo's centre.
  const x=(300+190*Math.cos(angle)).toFixed(2);
  const y=(270+190*Math.sin(angle)).toFixed(2);
  return `<path class="wi-agent-spoke" data-spoke-agent="${agent.id}" d="M${x} ${y}L300 270"/>`;
 }).join('');
}
function heroSatellites(){
 const engineerIds=new Set(specialists.map(a=>a.id));
 return heroPositions().map(({agent:a,x,y})=>`<div class="wi-satellite ${engineerIds.has(a.id)?'wi-engineer':'wi-support'}" data-orbit-agent="${a.id}" data-orbit-group="${engineerIds.has(a.id)?'engineering':'support'}" style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%">${icon(a.icon)}<span>${a.name}</span><small>${a.discipline}</small></div>`).join('');
}

export function intelligenceBody(){return `<div class="wi-page">

<section class="wi-hero wrap"><div class="wi-hero-copy"><p class="eyebrow">WAHOO INTELLIGENCE</p><h1>Engineering,<br><em>connected.</em></h1><p class="wi-lead">One board. Many disciplines.<br>A shared way to move forward.</p><p class="wi-intro">Ten defined AI roles, connecting Wahoo’s engineering work through a common record of questions, evidence and decisions. The local coordination foundation and private dashboard are implemented; hosted chat and background services are not connected.</p><a class="text-link" href="/intelligence/work/">Follow the team’s work <span>↗</span></a></div><div class="wi-constellation" aria-hidden="true"><svg class="wi-orbits" viewBox="0 0 600 540"><ellipse cx="300" cy="270" rx="225" ry="225"/><ellipse cx="300" cy="270" rx="150" ry="150"/>${heroSpokes()}<path class="wi-orbit-bright" d="M300 45a225 225 0 0 1 225 225"/></svg><div class="wi-core wi-core-character"><img src="/assets/intelligence/leo/full-body.png" alt="" width="1122" height="1402" fetchpriority="high"><span>LEONARDO</span><small>AI CHIEF ENGINEER</small></div>${heroSatellites()}<p class="wi-constellation-caption">SPECIALIST THINKING. SHARED ENGINEERING RECORD.</p></div></section>
<section class="wi-organization-section" id="organization"><div class="wrap wi-section"><div class="wi-section-label"><span>THE ORGANIZATION</span><i></i><span>SELECT A SPECIALIST ↓</span></div><div class="wi-section-heading"><h2>Different minds.<br>One direction.</h2><p>Leonardo connects the work. Six engineering specialists investigate. Isaac independently challenges the evidence. Grace makes the approved story clear. Clio keeps revisions, sources and active dependencies traceable across the team. You remain the final design and publication authority.</p></div>
<div class="wi-org"><div class="wi-owner">${icon('owner')}<div><strong>Max / Project owner</strong><small>Final design & publication authority</small></div></div><div class="wi-connector"></div><div class="wi-leo">${node(chief)}</div><div class="wi-branch"><span></span><p>ENGINEERING TEAM</p><span></span></div><div class="wi-specialists">${specialists.map(a=>node(a)).join('')}</div><div class="wi-branch"><span></span><p>OPERATIONS</p><span></span></div><div class="wi-reviewers">${node(reviewer,'wi-independent')}${node(communicator)}${node(controller)}</div><p class="wi-support-note">Independent review, public communications and document control support every engineering discipline.</p></div>
<div class="wi-agent-detail" id="wi-agent-detail" aria-live="polite" aria-atomic="true"><div class="wi-detail-mark">${portrait('wi-detail-portrait')}</div><div><p class="eyebrow" data-detail-role>CHIEF ENGINEER / SYSTEMS INTEGRATION</p><h3 data-detail-name>Leonardo<span> / Leo</span></h3><p class="wi-detail-line" data-detail-line>Bring the whole board into focus.</p><p data-detail-description>${chief.description}</p></div><div class="wi-detail-tasks"><p class="eyebrow">FOCUS</p><ul data-detail-tasks>${chief.tasks.map(t=>`<li>${t}</li>`).join('')}</ul><p class="wi-role-status">DEFINED ROLE · ASSIGNED WORK RUNS ON DEMAND</p></div></div>
</div></section>



<section class="wrap wi-section" id="workflow"><div class="wi-section-label"><span>HOW THE WORK MOVES</span><i></i></div><div class="wi-section-heading"><h2>From a question<br>to a decision.</h2><p>Each recommendation carries its sources, assumptions and review status. A shared engineering record preserves what changed, why it changed and what still needs testing.</p></div><ol class="wi-workflow">${[['Investigate','Specialists explore a defined engineering question.'],['Record','Clio supports revisions, provenance and dependencies; sources, units and results stay together.'],['Verify','Isaac checks the evidence and its limitations.'],['Review','Leo connects the findings across disciplines.'],['Approve','The owner decides what moves forward.'],['Draft','Grace prepares the approved public story.'],['Publish','Owner approval releases the website update.']].map(([t,d],i)=>`<li><span class="wi-step">${String(i+1).padStart(2,'0')} <b>→</b></span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol><p class="wi-note">The local coordination foundation is implemented. Specialists work on assigned tasks; they are not continuously running. Hosted chat and background services are not connected. Existing chats do not automatically synchronize.</p></section>
<section class="wi-simulator-section"><div class="wrap wi-section"><div class="wi-section-label"><span>THE SIMULATOR CONNECTION</span><i></i><span>IN DEVELOPMENT</span></div><div class="wi-section-heading"><h2>A model that grows<br>with the board.</h2><p>Wahoo Intelligence is intended to help frame experiments, review results and document decisions around the simulator. A validated digital twin is a longer-term goal.</p></div><div class="wi-timeline">${[['Current foundation','Geometry & motion','Existing piston-motion and geometry work provides a starting point.','DOCUMENTED'],['Planned integration','A controlled baseline','Investigate a Wahoo interface around the licensed EngMod2T core, with Rhino for spatial geometry.','PLANNED'],['Planned workflow','Repeatable experiments','Preserve inputs, versions and run IDs; compare options and review their limitations.','PLANNED'],['Longer-term goal','Measured validation','Use appropriate bench and dyno measurements to calibrate and challenge predictions.','FUTURE']].map(([k,t,d,status],i)=>`<article><div class="wi-timeline-marker ${i===0?'is-current':''}"></div><p class="eyebrow">${k}</p><h3>${t}</h3><p>${d}</p><span class="wi-stage-status">${status}</span></article>`).join('')}</div><a class="text-link" href="/journal/engine-simulation-digital-twin/">Read the simulator development record ↗</a></div></section>
<section class="wrap wi-section wi-leo-preview"><div class="wi-leo-ask"><img class="wi-leo-professional" src="/assets/intelligence/leo/professional.png" alt="Leo in a three-quarter professional pose" width="1084" height="1451" loading="lazy"><div class="wi-leo-ask-copy"><p class="eyebrow">A FUTURE WAY INTO THE RECORD</p><h2>Ask Leo.</h2><p>Explore Wahoo’s engineering story through a conversation grounded in approved public information.</p><span class="wi-ask-status"><i></i> CONCEPT PREVIEW / CHAT NOT CONNECTED</span></div></div></section>

</div>`;}

export function intelligenceEntry(){return `<section class="wrap wi-engineering-entry"><div>${icon('compass')}</div><div><p class="eyebrow">WAHOO INTELLIGENCE</p><h2>The thinking behind the engineering.</h2><p>Ten defined AI roles, connected through shared records, independent checks and owner-led decisions.</p><a class="text-link" href="/intelligence/">Meet Wahoo Intelligence ↗</a></div></section>`;}
