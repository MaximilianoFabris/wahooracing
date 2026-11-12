import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {socialCards,postText,publicationEntries} from './social-cards.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceFilename=card=>{const name=typeof card==='string'?card:card?.file??card?.imageURL;assert(typeof name==='string'&&name.length>0,'Source card must have a nonempty file string, object.file or object.imageURL');return path.basename(name);};
const raw=fs.readFileSync('content/social-cards.json'),data=JSON.parse(raw),receipt=JSON.parse(fs.readFileSync('docs/social-cards-source-receipt.json'));
assert.equal(hash(raw),receipt.projectionSha256,'Reviewed public projection changed');
const keys=(object,expected)=>assert.deepEqual(Object.keys(object).sort(),expected.sort());
keys(data,['batches']);assert.equal(data.batches.length,36);
assert.deepEqual(data.batches.map(b=>b.id),["hull-first-step-rev01", "engine-concept-rev01", "water-lifestyle-rev01", "blue-studio-rev01", "neon-red-deck-rev01", "cinematic-mixed-rev01", "color-impact-rev01", "color-reference-rev01", "color-testing-rev01", "components-rev01", "h0-development-rev01", "g031-rev01", "g030-rev01", "g029-rev01", "g028-rev01", "g026-rev01", "g025-rev01", "g001c1-rev01", "assignment18-rev01", "horizon-stories-rev01", "engineering-stories-rev01", "relaunch-rev03", "creative-trial-rev04", "h0-100ms-rev01", "h0-150ms-rev01", "pressure-fields-rev01", "intake-integration-rev01", "h1-architecture-rev01", "h102-water-management-rev01", "follow-build-rev01", "follow-build-rev02", "h1-progress-rev01", "h1-spotlights-rev01", "h0-dynamics-recap-rev01", "modular-fuel-rev01", "fuel-service-002-rev01"]);
assert.deepEqual(data.batches.map(b=>b.posts.length),[1, 1, 1, 8, 8, 8, 8, 8, 10, 11, 1, 1, 2, 3, 1, 1, 1, 1, 1, 5, 3, 8, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1]);
assert.equal(data.batches.reduce((n,b)=>n+b.posts.length,0),113);
assert.deepEqual(data.batches[23].posts[0].cards.map(c=>path.basename(c.imageURL)),['H0-100MS-01.png','H0-100MS-02.png','H0-100MS-03.png','H0-100MS-04.png','H0-100MS-05.png']);
assert.deepEqual(data.batches[10].posts.map(p=>p.id),['H0-DEVELOPMENT-20261101']);
assert.deepEqual(data.batches[10].posts[0].cards.map(c=>path.basename(c.imageURL)),['H0-01.png','H0-02.png','H0-03.png','H0-04.png','H0-05.png']);
assert.deepEqual(data.batches[9].posts.map(p=>p.id),["WHE-03-001", "WHE-02-001", "WHE-02-002", "WHE-02-003", "WHE-02-011", "WHE-03-009", "WHE-EXH-001-PIPE", "WHE-EXH-001-JACKET", "THROTTLE-CONCEPT", "WHE-01-009", "PIPE-ALT-SELECTED-SECTION"]);
assert(data.batches[9].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[8].posts.map(p=>p.id),["DARK-BLUE-CONTROL", "DARK-DARK-RED", "DARK-NEON-YELLOW", "DARK-NEON-ORANGE", "DARK-DARK-GREEN", "LIGHT-BLUE-CONTROL", "LIGHT-DARK-RED", "LIGHT-NEON-YELLOW", "LIGHT-NEON-ORANGE", "LIGHT-DARK-GREEN"]);
assert(data.batches[8].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[7].posts.map(p=>p.id),["01-DARK", "01-LIGHT", "02-DARK", "02-LIGHT", "03-DARK", "03-LIGHT", "04-DARK", "04-LIGHT"]);
assert(data.batches[7].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[6].posts.map(p=>p.id),["01-DARK", "01-LIGHT", "02-DARK", "02-LIGHT", "03-DARK", "03-LIGHT", "04-DARK", "04-LIGHT"]);
assert(data.batches[6].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[5].posts.map(p=>p.id),["STUDIO-01", "STUDIO-02", "STUDIO-03", "STUDIO-04", "STUDIO-05", "STUDIO-06", "STUDIO-07", "STUDIO-08"]);
assert(data.batches[5].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[4].posts.map(p=>p.id),["RED-01", "RED-02", "RED-03", "RED-04", "RED-05", "RED-06", "RED-07", "RED-08"]);
assert(data.batches[4].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[3].posts.map(p=>p.id),["BLUE-01", "BLUE-02", "BLUE-03", "BLUE-04", "BLUE-05", "BLUE-06", "BLUE-07", "BLUE-08"]);
assert(data.batches[3].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[2].posts.map(p=>p.id),['WATER-01']);
assert(data.batches[2].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[1].posts.map(p=>p.id),['ENGINE-CONCEPT']);
assert.deepEqual(data.batches[1].posts[0].cards.map(c=>path.basename(c.imageURL)),['ENGINE-01.png','ENGINE-02.png','ENGINE-03.png','ENGINE-04.png','ENGINE-05.png']);
assert.deepEqual(data.batches[0].posts.map(p=>p.id),['HULL-FIRST-STEP']);
assert.deepEqual(data.batches[0].posts[0].cards.map(c=>path.basename(c.imageURL)),['HULL-01.png','HULL-02.png','HULL-03.png','HULL-04.png','HULL-05.png']);
const html=fs.readFileSync('dist/preview/social-cards/index.html','utf8');
const plan=JSON.parse(fs.readFileSync('content/social-publication-plan.json'));
keys(plan,['schema','retiredBatches','entries']);
assert.deepEqual(plan.retiredBatches,['neon-red-deck-rev01','cinematic-mixed-rev01','color-impact-rev01','color-reference-rev01','color-testing-rev01','follow-build-rev01']);
for(const row of plan.entries)keys(row,row.alternateOf?['key','category','alternateOf']:['key','category']);
const allPostKeys=new Set(data.batches.flatMap(b=>b.posts.map(p=>b.id+'-'+p.id)));
assert(plan.entries.every(e=>allPostKeys.has(e.key)),'Unknown publication plan key');
assert.equal(new Set(plan.entries.map(e=>e.key)).size,plan.entries.length,'Duplicate publication plan key');
const g031Visible=html.includes('id="g031-rev01"');const projected=g031Visible?data:{...data,batches:data.batches.filter(b=>b.id!=='g031-rev01')};const entries=publicationEntries(projected,plan),activeKeys=new Set(entries.map(e=>e.key)),markup=socialCards(projected,plan);
assert.equal(entries.length,g031Visible?70:69);assert.equal(entries.filter(e=>!e.alternateOf).length,g031Visible?69:68);
assert.equal(entries.at(-1).key,'h0-dynamics-recap-rev01-H0-DYNAMIC-RECAP');assert.equal(entries.at(-1).position,69);assert.equal(entries.at(-2).key,'h1-progress-rev01-H1-EVOLUTION');assert.equal(entries.at(-3).key,'follow-build-rev02-FOLLOW-BUILD');assert.equal(entries.at(-3).position,67);assert.equal(entries.at(-3).category,'community');
assert.deepEqual(data.batches[25].posts[0].cards.map(c=>path.basename(c.imageURL)),['PRESSURE-01.png','PRESSURE-02.png','PRESSURE-03.png']);assert.deepEqual(data.batches[26].posts[0].cards.map(c=>path.basename(c.imageURL)),['INTAKE-01.png','INTAKE-02.png','INTAKE-03.png','INTAKE-04.png','INTAKE-05.png']);
assert.deepEqual(data.batches[24].posts[0].cards.map(c=>path.basename(c.imageURL)),['H0-150-01.png','H0-150-02.png','H0-150-03.png','H0-150-04.png','H0-150-05.png']);
assert.equal(entries.filter(e=>e.alternateOf).length,1);
assert.equal(entries.find(e=>e.alternateOf).position,entries.find(e=>e.key==='components-rev01-WHE-EXH-001-PIPE').position);
assert.deepEqual([...html.matchAll(/data-social-open="([^"]+)"/g)].map(m=>m[1]),entries.map(e=>e.key),'Grid must follow approved publishing order');
let run=0;for(const e of entries.filter(e=>!e.alternateOf)){run=e.category==='engineering'?run+1:0;assert(run<=2,'No more than two engineering posts without a break');}
for(const id of plan.retiredBatches){assert(!html.includes(`id="${id}"`));assert(!html.includes(`data-social-collection="${id}"`));}
assert(html.includes('data-social-collection-filter')&&html.includes('data-social-category-filter'));
assert.equal(entries.reduce((n,e)=>n+e.post.cards.length,0),g031Visible?195:192);
assert(html.includes(markup));assert(html.includes('noindex, nofollow, noarchive'));assert(html.includes('class="site-header'));
assert(!/[CW]:[\\/]|file:\/\/|Wahoo_Intelligence|Social_Media|source-manifest|source-provenance|"evidence"|"visual_approach"|"rider_meaning"/i.test(html));
assert(!/[CW]:[\\/]|file:\/\/|Wahoo_Intelligence|Social_Media|source-manifest|source-provenance/i.test(raw.toString()));
let count=0;const urls=new Set();const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let workspace=path.resolve('.');while(!fs.existsSync(path.join(workspace,'Social_Media'))&&path.dirname(workspace)!==workspace)workspace=path.dirname(workspace);
for(const batch of projected.batches){
  keys(batch,['id','title','revision','posts']);
  const source=receipt.sources.find(s=>s.batch===batch.id),sourceFile=path.join(workspace,source.source);
  let originals;
  if(fs.existsSync(sourceFile)){const sourceRaw=fs.readFileSync(sourceFile);assert.equal(hash(sourceRaw),source.sha256);const parsed=JSON.parse(sourceRaw);originals=Array.isArray(parsed)?parsed:parsed.posts;if(!originals&&parsed.caption&&parsed.cards){assert.equal(batch.posts.length,1);originals=[{...parsed,id:batch.posts[0].id}];}}
  for(const post of batch.posts){
    const active=activeKeys.has(batch.id+'-'+post.id);
    keys(post,['id','title','format','cards','caption','hashtags','revision','reviewStatus']);assert.equal(post.reviewStatus,'OWNER_REVIEW');assert(post.caption.length>0);assert([1,3,5].includes(post.cards.length)||(batch.id==='follow-build-rev02'&&post.id==='FOLLOW-BUILD'&&post.cards.length===8),'Standard formats or owner-requested six-chapter CTA');
    if(active)assert(html.includes(`<div class="social-post-text" data-social-text>${esc(postText(post))}</div>`),'Visible text and clipboard text must be identical');
    else assert(!html.includes(`data-social-open="${batch.id}-${post.id}"`),'Retired design must not appear in gallery');
    const original=originals?.find(p=>p.id===post.id);
    if(original){assert.equal(post.caption,original.caption);assert.deepEqual(post.hashtags,original.hashtags);assert.deepEqual(post.cards.map(c=>c.alt),(original.alt_text??original.cards?.map(c=>c.alt)));if(original.cards||original.files)assert.deepEqual(post.cards.map(c=>path.basename(c.imageURL)),(original.cards||original.files).map(sourceFilename));else assert.equal(original.card_count,post.cards.length,'Source card count mismatch');}
    for(const card of post.cards){
      keys(card,['imageURL','alt']);assert(card.alt.length>0);assert(!urls.has(card.imageURL));urls.add(card.imageURL);count++;
      assert(/^\/preview\/social-cards\/images\/[a-z0-9-]+\/[A-Z0-9-]+\.png$/.test(card.imageURL));
      const record=receipt.files.find(f=>f.imageURL===card.imageURL);assert(record);
      for(const base of ['public','dist']){const buffer=fs.readFileSync(base+card.imageURL);assert.equal(buffer.length,record.bytes);assert.equal(hash(buffer),record.sha256);assert.equal(buffer.readUInt32BE(16),1080);assert.equal(buffer.readUInt32BE(20),1440);}
      const originalFile=path.join(workspace,record.source);if(fs.existsSync(originalFile))assert.equal(hash(fs.readFileSync(originalFile)),record.sha256,'Original export mismatch');
      if(active){assert(html.includes(`alt="${esc(card.alt)}"`));assert(html.includes(`href="${card.imageURL}" download`));}
    }
  }
}
assert.equal(count,g031Visible?240:237);assert.equal(receipt.files.length,240);
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(folder,f.name)):[path.join(folder,f.name)]);}
const retained=receipt.retainedFiles||[];
for(const record of retained){assert(!urls.has(record.imageURL));assert(/^\/preview\/social-cards\/images\/[a-z0-9-]+\/[A-Z0-9-]+\.png$/.test(record.imageURL));for(const base of ['public','dist']){const raw=fs.readFileSync(base+record.imageURL);assert.equal(raw.length,record.bytes);assert.equal(hash(raw),record.sha256,'Historical image URL changed');}}
for(const base of ['public','dist']){const files=walk(base+'/preview/social-cards');const extra=base==='public'&&!g031Visible?receipt.files.filter(f=>f.imageURL.includes('/g031-rev01/')).map(f=>f.imageURL):[];const permitted=new Set([...urls,...extra,...retained.map(r=>r.imageURL)].map(url=>path.normalize(base+url)));if(base==='dist')permitted.add(path.normalize(base+'/preview/social-cards/index.html'));assert.deepEqual(files.map(f=>path.normalize(f)).sort(),[...permitted].sort(),'Only allowlisted current/historical images and rendered gallery may be public');}
const script=fs.readFileSync('public/social-cards.js','utf8');assert(script.includes("text.textContent"));assert(!/fetch\(|localStorage|innerHTML|execCommand/.test(script));
console.log(`PASS: ${entries.filter(e=>!e.alternateOf).length} publishing slots / ${entries.length} entries; balanced sequence, collection/content filters and alternatives; all ${count} exact original PNGs and source captions retained and verified.`);

assert.deepEqual(data.batches[27].posts[0].cards.map(c=>path.basename(c.imageURL)),['ARCH-01.png','ARCH-02.png','ARCH-03.png','ARCH-04.png','ARCH-05.png']);

assert.deepEqual(data.batches[28].posts[0].cards.map(c=>path.basename(c.imageURL)),['WATER-01.png','WATER-02.png','WATER-03.png','WATER-04.png','WATER-05.png']);

assert.deepEqual(data.batches[29].posts[0].cards.map(c=>path.basename(c.imageURL)),['FOLLOW-01.png','FOLLOW-02.png','FOLLOW-03.png']);

assert.deepEqual(data.batches[30].posts[0].cards.map(c=>path.basename(c.imageURL)),Array.from({length:8},(_,i)=>`BUILD-${String(i+1).padStart(2,'0')}.png`));

assert.deepEqual(data.batches.slice(31,34).map(b=>b.posts.reduce((n,p)=>n+p.cards.length,0)),[5,6,3]);

assert.deepEqual(data.batches[34].posts[0].cards.map(c=>path.basename(c.imageURL)),["FUEL-01.png","FUEL-02.png","FUEL-03.png","FUEL-04.png","FUEL-05.png"]);
assert.equal(entries.find(e=>e.key==="modular-fuel-rev01-MODULAR-FUEL").position,41);

assert.deepEqual(data.batches[35].posts[0].cards.map(c=>path.basename(c.imageURL)),["FUEL-01.png","FUEL-02.png","FUEL-03.png","FUEL-04.png","FUEL-05.png"]);
assert.equal(entries.find(e=>e.key==="fuel-service-002-rev01-FUEL-SERVICE-002").position,42);
