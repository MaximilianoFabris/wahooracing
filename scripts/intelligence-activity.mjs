import {agents} from '../public/intelligence-roles.js';

const fields=['id','date','agents','status','title','summary','evidence'];
const roleIds=new Set(agents.map(a=>a.id));
const statuses=new Set(['completed','in-progress','planned']);
// Accept only the explicit public projection. Never read private coordination files.
export function publishedActivity(data){
 if(data?.schema_version!==1||!Array.isArray(data.records))throw Error('Invalid Intelligence activity schema');
 const seen=new Set();
 return data.records.filter(record=>{
  if(!['published','draft'].includes(record.publication))throw Error('Activity publication must be published or draft');
  return record.publication==='published';
 }).map(record=>{
  for(const field of fields.filter(f=>f!=='agents'))if(typeof record[field]!=='string'||!record[field].trim())throw Error(`Missing activity ${field}`);
  if(!/^[a-z0-9-]+$/.test(record.id)||seen.has(record.id))throw Error('Invalid or duplicate activity ID');
  seen.add(record.id);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(record.date)||!Number.isFinite(Date.parse(record.date))||new Date(record.date).toISOString().slice(0,10)!==record.date)throw Error(`Invalid activity date: ${record.id}`);
  if(!statuses.has(record.status))throw Error(`Invalid activity status: ${record.id}`);
  if(!Array.isArray(record.agents)||!record.agents.length||record.agents.some(id=>!roleIds.has(id)))throw Error(`Invalid activity agents: ${record.id}`);
  return Object.fromEntries(fields.map(field=>[field,record[field]]));
 }).sort((a,b)=>b.date.localeCompare(a.date));
}
