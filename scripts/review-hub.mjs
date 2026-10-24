const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const piston=`<svg class="review-page-visual" viewBox="0 0 180 140" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M61 80V12h58v68M61 26h58M66 46h48M66 52h48M90 52v32l18 20M55 34h6M119 34h6"/><circle cx="90" cy="110" r="20"/><circle cx="90" cy="110" r="5"/><path d="M60 135h60M90 4v8M90 130v5"/><path d="M90 18v22M90 59v15" stroke-dasharray="2 4" opacity=".45"/></svg>`;
export const reviewHubStylesheet='/review-hub.css';
export function reviewHub(input){
  const pages=Array.isArray(input)?input:input?.pages;
  if(!Array.isArray(pages))throw new Error('Review hub requires a pages array');
  const ids=new Set();
  const published=pages.filter(page=>page?.publication==='published').map(page=>{
    for(const field of ['id','title','url','description','version','evidence','scope'])if(typeof page[field]!=='string'||!page[field].trim())throw new Error(`Review page missing ${field}`);
    if(ids.has(page.id))throw new Error('Duplicate review page ID');ids.add(page.id);
    if(!/^\/preview\/[a-z0-9\/-]+\/$/.test(page.url)||page.url.includes('//')||page.url.includes('..'))throw new Error('Review page requires a local preview URL');
    if(page.visual==='social-cards'&&!/^\/preview\/social-cards\/images\/[a-z0-9-]+\/[A-Z0-9-]+\.png$/.test(page.image||''))throw new Error('Invalid social review image');
    return page;
  });
  return `<link rel="stylesheet" href="${reviewHubStylesheet}"><section class="page-intro wrap review-hub-intro"><p class="eyebrow">WAHOO / OPEN REVIEW</p><h1>Review pages<span>.</span></h1><p class="lead">A place to explore work in progress. Open a page to inspect the details and share a direct link.</p></section><section class="wrap review-hub-list" aria-label="Available review pages">${published.length?published.map((page,index)=>`<a class="review-page-row" href="${escape(page.url)}" data-review-page="${escape(page.id)}"><div class="review-page-image">${page.visual==='social-cards'?`<img class="review-page-social-image" src="${escape(page.image)}" alt="Social artwork draft: Back to the board" width="1080" height="1440" loading="lazy" decoding="async">`:piston}</div><div class="review-page-copy"><div class="review-page-meta"><span>${String(index+1).padStart(2,'0')} / ${escape(page.version)}</span><span>${escape(page.evidence)}</span></div><h2>${escape(page.title)}</h2><p>${escape(page.description)}</p><small>${escape(page.scope)}</small></div><span class="review-page-open">Open page <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></a>`).join(''):'<p class="review-hub-empty">Review pages will appear here when they are ready to share.</p>'}</section><div class="wrap review-hub-note"><p>Each page states its evidence and limits. Development previews do not establish tested hardware performance or safety.</p></div>`;
}
