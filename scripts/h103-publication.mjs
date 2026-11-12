// Scoped layout for the approved H1-03 projection. Private source sheets stay private.
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function h103Publication(source,record){
 let s=source;const hero=s.match(/<figure class="article-hero bare-visual">[\s\S]*?<\/figure>/);if(!hero)throw Error('H103 hero missing');s=s.replace(hero[0],'');const lead=s.match(/<p class="lead">[\s\S]*?<\/p>/);if(!lead)throw Error('H103 lead missing');
 const legend='<p class="h103-system-legend">System colours: green engine air · amber exhaust gas · purple cooling water/jacket · cyan bilge · blue jet water · ochre fuel. Colours identify systems, not measured flow. Drawings preserve source proportions; independently framed views are not to a common scale.</p>';
 s=s.replace(lead[0],lead[0]+hero[0]+legend).replace('<h1>Making room for the systems inside</h1>','<h1>Making room for<br>the systems inside</h1>').replace('<details class="article-toc" open>','<details class="article-toc">');
 s=s.replace(/<figure class="bare-visual article-inline-figure">[\s\S]*?<\/figure>/g,block=>block.includes('/tanks.png')?block.replace(/(<a\b[^>]*>[\s\S]*?<\/a>)/,'<div class="h103-options" tabindex="0" role="region" aria-label="Horizontally scrollable separate tank alternatives">$1</div>'):block);
 const description='Inside Wahoo’s H1-03 preliminary hull assembly: inner structure, tank alternatives, bilge collection and service interfaces, with unresolved design questions kept visible.';
 s=s.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+esc(description)+'">').replace('</head>','<meta property="og:title" content="'+esc(record.title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:image" content="https://www.wahooracing.com/assets/engineering/h103-nov12/social-preview.png"><link rel="stylesheet" href="/h103-journal.css"></head>');return s;
}
