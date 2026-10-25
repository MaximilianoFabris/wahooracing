import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {socialCards,postText} from './social-cards.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync('content/social-cards.json'),data=JSON.parse(raw),receipt=JSON.parse(fs.readFileSync('docs/social-cards-source-receipt.json'));
assert.equal(hash(raw),receipt.projectionSha256,'Reviewed public projection changed');
const keys=(object,expected)=>assert.deepEqual(Object.keys(object).sort(),expected.sort());
keys(data,['batches']);assert.equal(data.batches.length,4);
assert.deepEqual(data.batches.map(b=>b.id),['horizon-stories-rev01','engineering-stories-rev01','relaunch-rev03','creative-trial-rev04']);
assert.deepEqual(data.batches.map(b=>b.posts.length),[5,3,8,3]);
const html=fs.readFileSync('dist/preview/social-cards/index.html','utf8'),markup=socialCards(data);
assert(html.includes(markup));assert(html.includes('noindex, nofollow, noarchive'));assert(html.includes('class="site-header'));
assert(!/[CW]:[\\/]|file:\/\/|Wahoo_Intelligence|Social_Media|source-manifest|source-provenance|"evidence"|"visual_approach"|"rider_meaning"/i.test(html));
assert(!/[CW]:[\\/]|file:\/\/|Wahoo_Intelligence|Social_Media|source-manifest|source-provenance/i.test(raw.toString()));
let count=0;const urls=new Set();const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const workspace=path.resolve('../..');
for(const batch of data.batches){
  keys(batch,['id','title','revision','posts']);
  const source=receipt.sources.find(s=>s.batch===batch.id),sourceFile=path.join(workspace,source.source);
  let originals;
  if(fs.existsSync(sourceFile)){const sourceRaw=fs.readFileSync(sourceFile);assert.equal(hash(sourceRaw),source.sha256);const parsed=JSON.parse(sourceRaw);originals=Array.isArray(parsed)?parsed:parsed.posts;}
  for(const post of batch.posts){
    keys(post,['id','title','format','cards','caption','hashtags','revision','reviewStatus']);assert.equal(post.reviewStatus,'OWNER_REVIEW');assert(post.caption.length>0);assert([1,3,5].includes(post.cards.length));
    assert(html.includes(`<div class="social-post-text" data-social-text>${esc(postText(post))}</div>`),'Visible text and clipboard text must be identical');
    const original=originals?.find(p=>p.id===post.id);
    if(original){assert.equal(post.caption,original.caption);assert.deepEqual(post.hashtags,original.hashtags);assert.deepEqual(post.cards.map(c=>c.alt),original.alt_text);assert.deepEqual(post.cards.map(c=>path.basename(c.imageURL)),original.cards||original.files);}
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
assert.equal(count,51);assert.equal(receipt.files.length,51);
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(folder,f.name)):[path.join(folder,f.name)]);}
const retained=receipt.retainedFiles||[];
for(const record of retained){assert(!urls.has(record.imageURL));assert(/^\/preview\/social-cards\/images\/[a-z0-9-]+\/[A-Z0-9-]+\.png$/.test(record.imageURL));for(const base of ['public','dist']){const raw=fs.readFileSync(base+record.imageURL);assert.equal(raw.length,record.bytes);assert.equal(hash(raw),record.sha256,'Historical image URL changed');}}
for(const base of ['public','dist']){const files=walk(base+'/preview/social-cards');const permitted=new Set([...urls,...retained.map(r=>r.imageURL)].map(url=>path.normalize(base+url)));if(base==='dist')permitted.add(path.normalize(base+'/preview/social-cards/index.html'));assert.deepEqual(files.map(f=>path.normalize(f)).sort(),[...permitted].sort(),'Only allowlisted current/historical images and rendered gallery may be public');}
const script=fs.readFileSync('public/social-cards.js','utf8');assert(script.includes("text.textContent"));assert(!/fetch\(|localStorage|innerHTML|execCommand/.test(script));
console.log('PASS: 19 posts / 51 exact 1080×1440 PNGs; source hashes, captions, tags, alt text, public allowlist, visible/copy parity and privacy.');
