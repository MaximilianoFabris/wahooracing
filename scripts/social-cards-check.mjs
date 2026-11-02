import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {socialCards,postText} from './social-cards.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceFilename=card=>{const name=typeof card==='string'?card:card?.file??card?.imageURL;assert(typeof name==='string'&&name.length>0,'Source card must have a nonempty file string, object.file or object.imageURL');return path.basename(name);};
const raw=fs.readFileSync('content/social-cards.json'),data=JSON.parse(raw),receipt=JSON.parse(fs.readFileSync('docs/social-cards-source-receipt.json'));
assert.equal(hash(raw),receipt.projectionSha256,'Reviewed public projection changed');
const keys=(object,expected)=>assert.deepEqual(Object.keys(object).sort(),expected.sort());
keys(data,['batches']);assert.equal(data.batches.length,18);
assert.deepEqual(data.batches.map(b=>b.id),["cinematic-mixed-rev01", "color-impact-rev01", "color-reference-rev01", "color-testing-rev01", "components-rev01", "h0-development-rev01", "g031-rev01", "g030-rev01", "g029-rev01", "g028-rev01", "g026-rev01", "g025-rev01", "g001c1-rev01", "assignment18-rev01", "horizon-stories-rev01", "engineering-stories-rev01", "relaunch-rev03", "creative-trial-rev04"]);
assert.deepEqual(data.batches.map(b=>b.posts.length),[8, 8, 8, 10, 11, 1, 1, 2, 3, 1, 1, 1, 1, 1, 5, 3, 8, 3]);
assert.equal(data.batches.reduce((n,b)=>n+b.posts.length,0),76);
assert.deepEqual(data.batches[5].posts.map(p=>p.id),['H0-DEVELOPMENT-20261101']);
assert.deepEqual(data.batches[5].posts[0].cards.map(c=>path.basename(c.imageURL)),['H0-01.png','H0-02.png','H0-03.png','H0-04.png','H0-05.png']);
assert.deepEqual(data.batches[4].posts.map(p=>p.id),["WHE-03-001", "WHE-02-001", "WHE-02-002", "WHE-02-003", "WHE-02-011", "WHE-03-009", "WHE-EXH-001-PIPE", "WHE-EXH-001-JACKET", "THROTTLE-CONCEPT", "WHE-01-009", "PIPE-ALT-SELECTED-SECTION"]);
assert(data.batches[4].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[3].posts.map(p=>p.id),["DARK-BLUE-CONTROL", "DARK-DARK-RED", "DARK-NEON-YELLOW", "DARK-NEON-ORANGE", "DARK-DARK-GREEN", "LIGHT-BLUE-CONTROL", "LIGHT-DARK-RED", "LIGHT-NEON-YELLOW", "LIGHT-NEON-ORANGE", "LIGHT-DARK-GREEN"]);
assert(data.batches[3].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[2].posts.map(p=>p.id),["01-DARK", "01-LIGHT", "02-DARK", "02-LIGHT", "03-DARK", "03-LIGHT", "04-DARK", "04-LIGHT"]);
assert(data.batches[2].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[1].posts.map(p=>p.id),["01-DARK", "01-LIGHT", "02-DARK", "02-LIGHT", "03-DARK", "03-LIGHT", "04-DARK", "04-LIGHT"]);
assert(data.batches[1].posts.every(p=>p.cards.length===1));
assert.deepEqual(data.batches[0].posts.map(p=>p.id),["STUDIO-01", "STUDIO-02", "STUDIO-03", "STUDIO-04", "STUDIO-05", "STUDIO-06", "STUDIO-07", "STUDIO-08"]);
assert(data.batches[0].posts.every(p=>p.cards.length===1));
const html=fs.readFileSync('dist/preview/social-cards/index.html','utf8');
const g031Visible=html.includes('id="g031-rev01"');const projected=g031Visible?data:{...data,batches:data.batches.filter(b=>b.id!=='g031-rev01')};const markup=socialCards(projected);
assert(html.includes(markup));assert(html.includes('noindex, nofollow, noarchive'));assert(html.includes('class="site-header'));
assert(!/[CW]:[\\/]|file:\/\/|Wahoo_Intelligence|Social_Media|source-manifest|source-provenance|"evidence"|"visual_approach"|"rider_meaning"/i.test(html));
assert(!/[CW]:[\\/]|file:\/\/|Wahoo_Intelligence|Social_Media|source-manifest|source-provenance/i.test(raw.toString()));
let count=0;const urls=new Set();const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let workspace=path.resolve('.');while(!fs.existsSync(path.join(workspace,'Social_Media'))&&path.dirname(workspace)!==workspace)workspace=path.dirname(workspace);
for(const batch of projected.batches){
  keys(batch,['id','title','revision','posts']);
  const source=receipt.sources.find(s=>s.batch===batch.id),sourceFile=path.join(workspace,source.source);
  let originals;
  if(fs.existsSync(sourceFile)){const sourceRaw=fs.readFileSync(sourceFile);assert.equal(hash(sourceRaw),source.sha256);const parsed=JSON.parse(sourceRaw);originals=Array.isArray(parsed)?parsed:parsed.posts;}
  for(const post of batch.posts){
    keys(post,['id','title','format','cards','caption','hashtags','revision','reviewStatus']);assert.equal(post.reviewStatus,'OWNER_REVIEW');assert(post.caption.length>0);assert([1,3,5].includes(post.cards.length));
    assert(html.includes(`<div class="social-post-text" data-social-text>${esc(postText(post))}</div>`),'Visible text and clipboard text must be identical');
    const original=originals?.find(p=>p.id===post.id);
    if(original){assert.equal(post.caption,original.caption);assert.deepEqual(post.hashtags,original.hashtags);assert.deepEqual(post.cards.map(c=>c.alt),(original.alt_text??original.cards?.map(c=>c.alt)));if(original.cards||original.files)assert.deepEqual(post.cards.map(c=>path.basename(c.imageURL)),(original.cards||original.files).map(sourceFilename));else assert.equal(original.card_count,post.cards.length,'Source card count mismatch');}
    for(const card of post.cards){
      keys(card,['imageURL','alt']);assert(card.alt.length>0);assert(!urls.has(card.imageURL));urls.add(card.imageURL);count++;
      assert(/^\/preview\/social-cards\/images\/[a-z0-9-]+\/[A-Z0-9-]+\.png$/.test(card.imageURL));
      const record=receipt.files.find(f=>f.imageURL===card.imageURL);assert(record);
      for(const base of ['public','dist']){const buffer=fs.readFileSync(base+card.imageURL);assert.equal(buffer.length,record.bytes);assert.equal(hash(buffer),record.sha256);assert.equal(buffer.readUInt32BE(16),1080);assert.equal(buffer.readUInt32BE(20),1440);}
      const originalFile=path.join(workspace,record.source);if(fs.existsSync(originalFile))assert.equal(hash(fs.readFileSync(originalFile)),record.sha256,'Original export mismatch');
      assert(html.includes(`alt="${esc(card.alt)}"`));assert(html.includes(`href="${card.imageURL}" download`));
    }
  }
}
assert.equal(count,g031Visible?150:147);assert.equal(receipt.files.length,150);
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(folder,f.name)):[path.join(folder,f.name)]);}
const retained=receipt.retainedFiles||[];
for(const record of retained){assert(!urls.has(record.imageURL));assert(/^\/preview\/social-cards\/images\/[a-z0-9-]+\/[A-Z0-9-]+\.png$/.test(record.imageURL));for(const base of ['public','dist']){const raw=fs.readFileSync(base+record.imageURL);assert.equal(raw.length,record.bytes);assert.equal(hash(raw),record.sha256,'Historical image URL changed');}}
for(const base of ['public','dist']){const files=walk(base+'/preview/social-cards');const extra=base==='public'&&!g031Visible?receipt.files.filter(f=>f.imageURL.includes('/g031-rev01/')).map(f=>f.imageURL):[];const permitted=new Set([...urls,...extra,...retained.map(r=>r.imageURL)].map(url=>path.normalize(base+url)));if(base==='dist')permitted.add(path.normalize(base+'/preview/social-cards/index.html'));assert.deepEqual(files.map(f=>path.normalize(f)).sort(),[...permitted].sort(),'Only allowlisted current/historical images and rendered gallery may be public');}
const script=fs.readFileSync('public/social-cards.js','utf8');assert(script.includes("text.textContent"));assert(!/fetch\(|localStorage|innerHTML|execCommand/.test(script));
console.log(`PASS: ${projected.batches.reduce((n,b)=>n+b.posts.length,0)} posts / ${count} exact 1080×1440 PNGs; source hashes, captions, tags, alt text, public allowlist, visible/copy parity and privacy.`);
