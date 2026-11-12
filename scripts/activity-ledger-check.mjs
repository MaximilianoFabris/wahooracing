import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../public/activity-ledger/',import.meta.url),index=JSON.parse(await readFile(new URL('index.json',base),'utf8')),ids=new Set();let total=0;
assert.equal(index.schema,'wahoo.activity-public/1');assert(index.historySyncedAt);assert(Date.parse(index.historySyncedAt)<=Date.parse(index.generatedAt));
const allowed=['id','date','datePrecision','actor','kind','status','title','summary','groupId','groupTitle','evidence'].sort();
for(const month of index.months){assert(/^\/activity-ledger\/[a-zA-Z0-9_-]+\.json$/.test(month.url));const raw=await readFile(new URL(month.url.split('/').pop(),base));assert.equal(createHash('sha256').update(raw).digest('hex'),month.sha256);const {events}=JSON.parse(raw);assert.equal(events.length,month.count);
for(const e of events){assert.deepEqual(Object.keys(e).sort(),allowed);assert(!ids.has(e.id),'duplicate action ID');ids.add(e.id);assert(index.agents.some(a=>a.id===e.actor));assert(index.kinds.some(k=>k.id===e.kind));assert(['timestamp','turn','day','unknown'].includes(e.datePrecision));assert.equal(e.datePrecision==='unknown',e.date===null);assert(!/C:\\Users|W:\\|sourcePointer|api[_-]?key|bearer\s+[a-z0-9]/i.test(JSON.stringify(e)),'private data pattern');}total+=events.length;
}
assert.equal(total,index.totalEvents);console.log(`PASS: ${total} unique activity records, exact monthly hashes, safe fields and explicit date precision.`);
