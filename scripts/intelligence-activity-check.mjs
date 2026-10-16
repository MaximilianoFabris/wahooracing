import assert from 'node:assert/strict';
import {publishedActivity} from './intelligence-activity.mjs';

const entry={id:'example',publication:'published',date:'2026-10-16',agents:['ada'],status:'completed',title:'Example',summary:'Public summary',evidence:'Local implementation'};
const project=records=>publishedActivity({schema_version:1,records});
assert.deepEqual(project([{...entry,publication:'draft',summary:'PRIVATE DRAFT'}]),[]);
assert.deepEqual(Object.keys(project([{...entry,privateSource:'C:/private-case',chatId:'secret'}])[0]),['id','date','agents','status','title','summary','evidence']);
assert.throws(()=>project([{...entry,agents:['unknown']}]),/agents/);
assert.throws(()=>project([{...entry,status:'running'}]),/status/);
assert.throws(()=>project([{...entry,date:'2026-02-30'}]),/date/);
assert.throws(()=>project([entry,entry]),/duplicate/);
assert.throws(()=>project([{...entry,publication:undefined}]),/publication/);
assert.equal(project([entry,{...entry,id:'newer',date:'2026-10-17'}])[0].id,'newer');
console.log('Passed: activity draft exclusion, public field allowlist, date/status/agent validation and ordering.');
