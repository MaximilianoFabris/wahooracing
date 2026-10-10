(()=>{'use strict';
const root=document.getElementById('wahoo-exhaust'),$=id=>root.querySelector('#'+id),D=JSON.parse(document.getElementById('baseline-data').textContent),G=D.wet;
const fmt=(v,n=2)=>v.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
const labels=['Header including engine passage','Diffuser','Belly','Baffle','Stinger'];
$('dimensions').innerHTML=labels.map((n,i)=>`<tr><td>${n}</td><td>${G.radii_mm[i]*2} → ${G.radii_mm[i+1]*2} mm</td><td>${fmt(G.lengths_mm[i])} mm</td><td>${fmt(D.dry.lengths_mm[i])} mm</td></tr>`).join('')+`<tr><td>Effective tuned length</td><td>Baffle midpoint</td><td>${fmt(G.tuned_mm)} mm</td><td>${fmt(D.dry.tuned_mm)} mm</td></tr><tr><td>Overall unwrapped path</td><td>Port to stinger end</td><td>${fmt(G.overall_mm)} mm</td><td>${fmt(D.dry.overall_mm)} mm</td></tr><tr><td>Jacket span</td><td>89 mm maximum OD</td><td>${fmt(D.jacket_end_mm-D.jacket_start_mm)} mm</td><td>None</td></tr>`;
function calculate(){let els=['calc-rpm','calc-duration','calc-speed','calc-lead'].map($);let [n,d,a,b]=els.map(e=>Number(e.value));if(els.some(e=>!e.value||!e.checkValidity())||d<=b){$('calculation').textContent='Enter valid values within the displayed input limits. Return lead must be less than exhaust duration.';return;}let l=1000*a*(d-b)/(12*n),belly=l-G.lengths_mm[0]-G.lengths_mm[1]-G.lengths_mm[3]/2; $('calculation').textContent=`Effective length ${fmt(l)} mm · travel time ${fmt((d-b)/(6*n)*1000,3)} ms · residual belly ${fmt(belly)} mm. `+(belly<0?'Infeasible with the fixed header and cones: revise the combination.':'Geometrically positive; this is not a performance-qualified design.');}
['calc-rpm','calc-duration','calc-speed','calc-lead'].forEach(id=>$(id).addEventListener('input',calculate));calculate();
// Representative wave paths. a is held constant; no gas dynamics or pressure amplitude model.
const wave=$('wave'),NS='http://www.w3.org/2000/svg',scale=.87,start=125,center=128;
const x=v=>start+v*scale,y=r=>center-r*scale;
const points=G.stations_mm.map((v,i)=>[x(v),y(G.radii_mm[i])]);
const lower=G.stations_mm.map((v,i)=>[x(v),y(-G.radii_mm[i])]);
const line=a=>a.map(p=>p.join(',')).join(' ');
wave.innerHTML=`<title>Representative wave paths in a fixed 575 mm tuned chamber</title><path d="M125 115 V35 H55 V215 H125 V141" fill="none" stroke="#64748b" stroke-width="2"/><rect id="piston-vis" x="58" y="70" width="64" height="24" fill="#94a3b8"/><polyline points="${line(points)}" fill="none" stroke="#475569" stroke-width="2"/><polyline points="${line(lower)}" fill="none" stroke="#475569" stroke-width="2"/><line x1="125" y1="128" x2="${x(G.overall_mm)}" y2="128" stroke="#94a3b8" stroke-dasharray="5 5"/><g font-family="Arial" font-size="16" fill="#334155"><text x="45" y="25">Cylinder</text><text x="150" y="80">Header</text><text x="340" y="70">Diffuser</text><text x="530" y="70">Belly</text><text x="650" y="80">Baffle</text><text x="790" y="80">Stinger</text><text x="150" y="205">Port opens 88°</text><text x="420" y="205">BDC 180°</text><text x="690" y="205">Port closes 272°</text><text x="150" y="242" id="return-label"></text></g><g id="wave-markers"></g>`;
let playing=false,last=null,phase=0;
function drawWave(){let rpm=Number($('rpm').value),open=88,close=272,elapsed=(phase-open)/(6*rpm),distance=elapsed*450*1000,diff=(G.stations_mm[1]+G.stations_mm[2])/2,ref=G.tuned_mm;
let marks='';const mark=(pos,c,dash,double)=>{if(pos<0||pos>G.overall_mm)return;let xx=x(pos);marks+=`<line x1="${xx}" x2="${xx}" y1="100" y2="156" stroke="${c}" stroke-width="5" ${dash?'stroke-dasharray="5 4"':''}/>`;if(double)marks+=`<line x1="${xx+7}" x2="${xx+7}" y1="100" y2="156" stroke="${c}" stroke-width="2"/>`;};
if(elapsed>=0){mark(distance,'#d97706',false,false);if(distance>=diff)mark(2*diff-distance,'#0284c7',true,false);if(distance>=ref)mark(2*ref-distance,'#dc4444',false,true);}
$('wave-markers').innerHTML=marks;
// Sinusoidal piston is illustrative; crown crosses port roof at the selected symmetric event.
let roof=y(15),crown=roof+32*(Math.cos(open*Math.PI/180)-Math.cos(phase*Math.PI/180));$('piston-vis').setAttribute('y',crown);
let arrival=open+(2*ref/450000)*6*rpm,delta=arrival-close;
$('return-label').textContent=`Compression return: ${fmt(arrival,1)}° ATDC · ${Math.abs(delta)<.05?'at illustrative closure':fmt(Math.abs(delta),1)+'° '+(delta>0?'after':'before')+' closure'}`;
$('phase-label').textContent=fmt(phase,0)+'°';$('rpm-label').textContent=fmt(rpm,0)+' rpm';
const stage=phase<open?'Port closed: expansion before blowdown.':phase<180?'Port open: outgoing pulse and diffuser reflections.':phase<close?'Port open: rising piston approaches exhaust closure.':'Port closed: compression toward the next cycle.';
$('wave-caption').textContent=stage+' '+(delta<-1?'At this speed the modelled baffle return arrives early.':delta>1?'At this speed the modelled baffle return arrives after closure.':'At this illustrative reference the baffle return coincides with closure.');
}
function stop(){playing=false;last=null;$('play').textContent='Play one cycle';}
$('phase').addEventListener('input',()=>{stop();phase=Number($('phase').value);drawWave();});$('rpm').addEventListener('input',drawWave);
$('play').addEventListener('click',()=>{if(playing){stop();return;}if(matchMedia('(prefers-reduced-motion: reduce)').matches){phase=360;$('phase').value=phase;drawWave();stop();return;}if(phase>=360)phase=0;playing=true;last=null;$('play').textContent='Pause';});
function tick(t){if(playing){if(last!==null){phase=Math.min(360,phase+(t-last)*.045);$('phase').value=phase;drawWave();}last=t;if(phase>=360)stop();}requestAnimationFrame(tick);}drawWave();requestAnimationFrame(tick);
// Dependency-free 3D polygon projection. True geometry; approximate display lighting.
const canvas=$('model'),ctx=canvas.getContext('2d');let W=1000,H=350;
function facesOf(xs,rs,thickness,color,cut){let profile=xs.map((x,i)=>[x,rs[i]]).concat(xs.map((x,i)=>[x,rs[i]+thickness]).reverse());let faces=[],segments=72,begin=cut?Math.PI*.30:0,sweep=cut?Math.PI*1.40:Math.PI*2;
for(let j=0;j<profile.length;j++){let a=profile[j],b=profile[(j+1)%profile.length];for(let k=0;k<segments;k++){let t=begin+sweep*k/segments,u=begin+sweep*(k+1)/segments;let verts=[[a,t],[a,u],[b,u],[b,t]].map(([p,q])=>[p[0]-G.overall_mm/2,p[1]*Math.cos(q),p[1]*Math.sin(q)]);faces.push({verts,color,normalAngle:(t+u)/2});}}
if(cut){for(let t of [begin,begin+sweep]){for(let j=0;j<xs.length-1;j++){let p=[[xs[j],rs[j]],[xs[j+1],rs[j+1]],[xs[j+1],rs[j+1]+thickness],[xs[j],rs[j]+thickness]];faces.push({verts:p.map(([x,r])=>[x-G.overall_mm/2,r*Math.cos(t),r*Math.sin(t)]),color,normalAngle:t});}}}return faces;}
function drawModel(){let rect=canvas.getBoundingClientRect();W=rect.width;H=rect.height;let ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*ratio);canvas.height=Math.round(H*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,W,H);
let yaw=Number($('yaw').value)*Math.PI/180,roll=Number($('roll').value)*Math.PI/180,cut=$('cutaway').checked;
function project(p){let [xx,yy,zz]=p,y1=yy*Math.cos(roll)-zz*Math.sin(roll),z1=yy*Math.sin(roll)+zz*Math.cos(roll),x2=xx*Math.cos(yaw)+z1*Math.sin(yaw),z2=-xx*Math.sin(yaw)+z1*Math.cos(yaw);let sy=y1*.84-z2*.24,sz=y1*.24+z2*.84;return [W/2+x2*(W*.88/G.overall_mm),H/2-sy*(W*.88/G.overall_mm),sz];}
let faces=facesOf(G.stations_mm,G.radii_mm,1,[148,163,184],cut);
if($('jacket').checked){let xs=[20,...G.stations_mm.slice(1,5)],rs=[21,...G.radii_mm.slice(1,5).map(v=>v+6)];faces.push(...facesOf(xs,rs,1,[14,137,190],cut));}
faces=faces.map(f=>({...f,p:f.verts.map(project)}));faces.sort((a,b)=>a.p.reduce((s,v)=>s+v[2],0)-b.p.reduce((s,v)=>s+v[2],0));
faces.forEach(f=>{let light=.64+.36*Math.abs(Math.cos(f.normalAngle+roll-.6));let color=f.color.map(v=>Math.round(v*light));ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=`rgb(${color.join(',')})`;ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.3;ctx.stroke();});
ctx.fillStyle=getComputedStyle(root).getPropertyValue('--muted').trim()||'#94bce3';ctx.font='13px system-ui';ctx.fillText('PORT DATUM',12,H-16);ctx.textAlign='right';ctx.fillText('AFT GAS PATH →',W-12,H-16);ctx.textAlign='left';}
['yaw','roll','cutaway','jacket'].forEach(id=>$(id).addEventListener('input',drawModel));$('reset-view').onclick=()=>{$('yaw').value=-18;$('roll').value=30;$('cutaway').checked=true;$('jacket').checked=true;drawModel();};
$('save-png').onclick=()=>{canvas.toBlob(blob=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='WHE-EXH-001-cutaway-transparent.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});};
new ResizeObserver(drawModel).observe(canvas);new MutationObserver(drawModel).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});drawModel();
})();

