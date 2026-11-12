// Article-specific presentation of the owner-approved H1-02 package.
// Engineering copy, source images and model geometry are not changed here.
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function h102Publication(source,record){
 let s=source;
 const hero=s.match(/<figure class="article-hero bare-visual">[\s\S]*?<\/figure>/);
 if(!hero)throw Error('H1-02 hero missing');
 s=s.replace(hero[0],'');
 const lead=s.match(/<p class="lead">[\s\S]*?<\/p>/);
 if(!lead)throw Error('H1-02 lead missing');
 const legend='<p class="h102-system-legend" aria-label="Engineering system colour key">Green: engine air · Amber: exhaust gas · Purple: cooling water/jacket · Cyan: bilge water · Blue: jet-pump water. Red marks the tank/deck conflict. Colours identify systems, not measured flow.</p>';
 s=s.replace(lead[0],lead[0]+hero[0]+legend);
 s=s.replace('<h1>Water will get in. What happens next?</h1>','<h1>Water will get in. <br>What happens next?</h1>');
 s=s.replace('<details class="article-toc" open>','<details class="article-toc">');
 s=s.replace(/<section class="article-gallery">[\s\S]*?<\/section>/,gallery=>{
  let g=gallery.replace('<section class="article-gallery">','<section class="article-gallery h102-originals" id="h102-originals">');
  g=g.replace('</h2>','</h2><p>All ten original 2400 × 1800 engineering sheets, unchanged. Open a sheet for its complete annotations and source qualifications.</p><details><summary>Explore all ten original views</summary><div class="h102-original-grid">');
  g=g.replace(/<\/section>$/,'</div></details></section>');
  for(const item of record.gallery){
   const imagePath='/assets/'+item.image;
   g=g.replace(/<img\b[^>]*>/g,tag=>tag.includes('src="'+imagePath+'"')?tag.replace(/alt="[^"]*"/,'alt="'+esc(item.alt)+'"'):tag);
  }
  return g;
 });
 s=s.replace(/<figure class="bare-visual article-inline-figure">[\s\S]*?<\/figure>/g,block=>block.includes('/options.png')?block.replace(/(<a\b[^>]*>[\s\S]*?<\/a>)/,'<div class="h102-options" tabindex="0" role="region" aria-label="Horizontally scrollable three-option comparison">$1</div>'):block);
 const description='Wahoo’s H1-02 study rethinks engine air, bilge drainage and integrated packaging. Actual CAD, unresolved interfaces and the next development questions.';
 s=s.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+esc(description)+'">');
 s=s.replace('</head>','<meta property="og:title" content="'+esc(record.title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:image" content="https://www.wahooracing.com/assets/engineering/h102-review/social-preview.png"><link rel="stylesheet" href="/h102-journal.css"></head>');
 return s;
}
