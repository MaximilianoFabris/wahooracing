import {agents} from '../public/intelligence-roles.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={'completed':'Completed','in-progress':'In progress','planned':'Planned'};
const agentName=id=>agents.find(agent=>agent.id===id)?.name??id;
const dateLabel=date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(`${date}T00:00:00Z`))?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T00:00:00Z`)):date;

/** Render only records already selected for public release by the caller. */
export function intelligenceWorkBody(records=[]){
 const ordered=[...records].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const presentAgents=agents.filter(agent=>ordered.some(record=>record.agents.includes(agent.id)));
 return `<div class="wi-work-page wrap" data-work-page>
 <nav class="wi-work-breadcrumb" aria-label="Breadcrumb"><a href="/intelligence/">Wahoo Intelligence</a><span aria-hidden="true">/</span><span aria-current="page">Work record</span></nav>
 <header class="wi-work-heading"><p class="eyebrow">WAHOO INTELLIGENCE / ACTIVITY LOG</p><h1>The work,<br><em>recorded.</em></h1><p class="wi-work-lead">Reviewed updates from Wahoo’s AI team. Each entry keeps its date and evidence status.</p><p class="wi-work-context">A curated public record, updated after review. These entries describe recorded work and plans, not live agent activity.</p></header>
 <dl class="wi-work-counts" aria-label="Public record totals"><div><dt>Total entries</dt><dd>${ordered.length}</dd></div>${Object.entries(labels).map(([status,label])=>`<div><dt>${label}</dt><dd>${ordered.filter(record=>record.status===status).length}</dd></div>`).join('')}</dl>
 <section class="wi-work-records" aria-labelledby="wi-work-list-heading"><div class="wi-work-list-heading"><h2 id="wi-work-list-heading">The activity record</h2><p>Latest first</p></div>
 <form class="wi-work-filters" data-work-filters hidden role="search" aria-label="Filter activity entries"><label for="wi-work-search">Search the record<input id="wi-work-search" name="search" type="search" placeholder="Search titles, summaries or evidence" autocomplete="off" data-work-search></label><label for="wi-work-status">Status<select id="wi-work-status" name="status" data-work-status><option value="">All statuses</option>${Object.entries(labels).map(([status,label])=>`<option value="${status}">${label}</option>`).join('')}</select></label><label for="wi-work-agent">Agent<select id="wi-work-agent" name="agent" data-work-agent><option value="">All agents</option>${presentAgents.map(agent=>`<option value="${escape(agent.id)}">${escape(agent.name)}</option>`).join('')}</select></label><button type="reset">Clear filters</button></form>
 <p class="wi-work-results" data-work-results role="status" aria-live="polite" aria-atomic="true">${ordered.length} ${ordered.length===1?'entry':'entries'} in the public record.</p>
 <div class="wi-work-list" id="wi-work-list">${ordered.map((record,index)=>`<article class="wi-work-row" data-work-entry data-status="${escape(record.status)}" data-agents="${escape(record.agents.join(' '))}" tabindex="-1" aria-labelledby="wi-work-title-${index}"><div class="wi-work-meta"><time datetime="${escape(record.date)}">${escape(dateLabel(record.date))}</time><span class="wi-work-status">${escape(labels[record.status]??record.status)}</span></div><div class="wi-work-copy"><h3 id="wi-work-title-${index}">${escape(record.title)}</h3><p>${escape(record.summary)}</p><p class="wi-work-evidence"><strong>Evidence status</strong> ${escape(record.evidence)}</p></div><p class="wi-work-agents"><span>Agents</span>${record.agents.map(id=>escape(agentName(id))).join(' · ')}</p></article>`).join('')}</div>
 <p class="wi-work-empty" data-work-empty ${ordered.length?'hidden':''}>${ordered.length?'No entries match these filters. Try another search or clear the filters.':'No public entries have been recorded yet.'}</p>
 <button class="wi-work-more" type="button" data-work-more aria-controls="wi-work-list" hidden>Load more entries</button>
 </section><p class="wi-work-footnote">Dates, task status and evidence status belong to each entry. A completed task does not by itself mean a design has been physically validated.</p></div>`;
}
