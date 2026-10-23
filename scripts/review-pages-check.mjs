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
