import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {reviewHub} from './review-hub.mjs';
const base='public/preview/simulator-v2/', raw=fs.readFileSync(base+'data.json'),data=JSON.parse(raw);
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'b8794626788a34264b6c657f052d7e1867136949f774e6f8f6a55a8c628550bb');
assert.equal(data.schema,'wahoo.simulator-v2.public/1');assert.equal(data.datasets.length,24);assert.equal(data.datasets.reduce((n,d)=>n+d.samples.length,0),4912);
assert(!/[CW]:[\\/]|file:\/\/|api[_-]?key|BEGIN PRIVATE KEY/i.test(raw.toString()));
for(const name of ['unlock.js','unlock.css','bundle.json','payload.bin'])assert(!fs.existsSync(base+name));
const catalog=JSON.parse(fs.readFileSync('content/review-pages.json'));const body=reviewHub(catalog);
for(const page of catalog.pages.filter(p=>p.publication==='published')){assert(body.includes(page.url));assert(fs.existsSync('dist'+page.url+'index.html'));}
for(const route of ['preview','preview/simulator-v2']){const html=fs.readFileSync('dist/'+route+'/index.html','utf8');assert(html.includes('Review pages'));assert(html.includes('noindex'));assert(!/type=["']password/.test(html));}
assert(fs.readFileSync('dist/index.html','utf8').includes('href="/preview/" aria-label="Review pages"'));
assert(!reviewHub({pages:[{publication:'draft'}]}).includes('data-review-page'));
console.log('PASS: public review routes, manifest, no login, exact allowlisted projection, privacy scan, 24 datasets / 4,912 samples.');

const videoCatalog=JSON.parse(fs.readFileSync('content/review-videos.json'));assert.equal(videoCatalog.videos.length,2);
const hubHTML=fs.readFileSync('dist/preview/index.html','utf8');assert(hubHTML.includes('data-review-page="videos"'));assert.equal((hubHTML.match(/<video /g)||[]).length,0);
const videoHTML=fs.readFileSync('dist/preview/videos/index.html','utf8');assert(videoHTML.includes('/social-cards.css'));assert.equal((videoHTML.match(/data-video-open=/g)||[]).length,2);assert.equal((videoHTML.match(/<video /g)||[]).length,2);
for(const v of videoCatalog.videos){assert(videoHTML.includes(v.url));assert(videoHTML.includes(v.poster));assert(videoHTML.includes('download>Download MP4'));assert(videoHTML.includes('Copy caption + hashtags'));}
const videoReceipt=JSON.parse(fs.readFileSync('docs/review-videos-asset-receipt.json'));assert.equal(videoReceipt.assets.length,4);
for(const asset of videoReceipt.assets){for(const base of ['public','dist']){const bytes=fs.readFileSync(base+asset.url);assert.equal(bytes.length,asset.bytes);assert(bytes.length<25*1024*1024);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);}}
console.log('PASS: two public films and two posters match approved exports; playback markup, downloads, captions and hosting size limit.');
