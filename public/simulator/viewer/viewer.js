(async()=>{

const root=document.documentElement,button=document.getElementById('viewerTheme');
function theme(value){root.dataset.theme=value==='day'?'day':'night';button.textContent=root.dataset.theme==='night'?'Day mode':'Night mode';}
try{theme(window.parent!==window?window.parent.document.documentElement.dataset.theme:localStorage.getItem('wahoo-theme'));}catch{theme('night');}
button.addEventListener('click',()=>{const value=root.dataset.theme==='night'?'day':'night';theme(value);try{localStorage.setItem('wahoo-theme',value);if(window.parent!==window)window.parent.document.documentElement.dataset.theme=value;}catch{}});
try{if(window.parent!==window)new MutationObserver(()=>theme(window.parent.document.documentElement.dataset.theme)).observe(window.parent.document.documentElement,{attributes:true,attributeFilter:['data-theme']});}catch{}
if(window.parent!==window){document.querySelector('.public-tools').hidden=true;const report=()=>window.parent.postMessage({type:'wahoo-simulator-height',height:Math.ceil(document.body.scrollHeight)},window.location.origin);new ResizeObserver(report).observe(document.body);window.addEventListener('load',report);document.fonts.ready.then(report);report();}



'use strict';
const DATA=await fetch('./data.json').then(r=>{if(!r.ok)throw Error('Saved results unavailable');return r.json();});
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
function available(v){return typeof v==='number'&&Number.isFinite(v)}
function fmt(v){return available(v)?(Math.abs(v)!==0&&(Math.abs(v)<.001||Math.abs(v)>=1e6)?v.toExponential(6):v.toPrecision(8)):'UNAVAILABLE'}
function metrics(id,entries){$(id).replaceChildren(...entries.map(([label,value,unit])=>{let d=document.createElement('div');d.className='metric';let s=document.createElement('small'),b=document.createElement('b');s.textContent=label+' / '+unit;b.textContent=fmt(value);if(!available(value))b.className='unavailable';d.append(s,b);return d}))}
function element(tag,attrs){let e=document.createElementNS(NS,tag);for(let [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
function plot(id,x,y,index){let svg=$(id);svg.replaceChildren();let pairs=x.map((a,i)=>[a,y[i]]).filter(p=>p.every(available));if(!pairs.length){svg.append(element('text',{x:20,y:60,fill:'var(--warning)'}));svg.lastChild.textContent='UNAVAILABLE';return}let xs=pairs.map(p=>p[0]),ys=pairs.map(p=>p[1]),lo=Math.min(...ys),hi=Math.max(...ys),xmin=Math.min(...xs),xmax=Math.max(...xs);let spread=hi-lo;if(!spread){spread=Math.max(Math.abs(lo)*.02,1);lo-=spread/2;hi+=spread/2}let X=v=>55+(v-xmin)/(xmax-xmin||1)*525,Y=v=>145-(v-lo)/(hi-lo)*120;svg.append(element('path',{d:'M55 15V145H580',fill:'none',stroke:'var(--line)'}));let poly=element('polyline',{points:pairs.map(p=>X(p[0])+','+Y(p[1])).join(' '),fill:'none',stroke:'var(--blue)','stroke-width':2});svg.append(poly);for(let [v,yy]of[[hi,23],[lo,145]]){let t=element('text',{x:0,y:yy,fill:'var(--muted)','font-size':10});t.textContent=fmt(v);svg.append(t)}for(let [v,xx]of[[xmin,55],[xmax,520]]){let t=element('text',{x:xx,y:170,fill:'var(--muted)','font-size':10});t.textContent=fmt(v);svg.append(t)}if(Number.isInteger(index)&&available(x[index])&&available(y[index]))svg.append(element('circle',{cx:X(x[index]),cy:Y(y[index]),r:4,fill:'var(--text)'}))}
function portOpen(angle,event){let a=angle===360?0:angle;return a>event.opening_deg&&a<event.closing_deg}
function pose(){let i=Number($('angle').value),p=DATA.mechanism.poses[i],svg=$('mechanismSvg');svg.replaceChildren();let X=v=>65+v*2900,Y=v=>155-v*2900;svg.append(element('line',{x1:30,y1:155,x2:595,y2:155,stroke:'var(--line)','stroke-dasharray':'5 5'}));let c=p.crankpin_M_m,pin=p.pin_M_m;svg.append(element('circle',{cx:X(0),cy:Y(0),r:79.025,fill:'none',stroke:'var(--line)'}));svg.append(element('line',{x1:X(0),y1:Y(0),x2:X(c[0]),y2:Y(c[1]),stroke:'var(--muted)','stroke-width':6}));svg.append(element('line',{x1:X(c[0]),y1:Y(c[1]),x2:X(pin[0]),y2:Y(pin[1]),stroke:'var(--blue)','stroke-width':8}));svg.append(element('rect',{x:X(pin[0])-23,y:Y(pin[1])-45,width:46,height:90,fill:'none',stroke:'var(--blue)','stroke-width':2}));for(let q of[[0,0],c,pin])svg.append(element('circle',{cx:X(q[0]),cy:Y(q[1]),r:6,fill:'var(--text)'}));metrics('poseValues',[['Crank angle',p.angle_deg,'deg'],['Piston travel',p.displacement_mm,'mm'],['Pin axis coordinate',pin[0]*1000,'mm']]);$('ports').textContent='EXHAUST '+(portOpen(p.angle_deg,DATA.ports.exhaust)?'OPEN':'CLOSED')+' · TRANSFER '+(portOpen(p.angle_deg,DATA.ports.transfer)?'OPEN':'CLOSED')+' · events '+DATA.ports.exhaust.opening_deg+'° / '+DATA.ports.exhaust.closing_deg+'°; '+DATA.ports.transfer.opening_deg+'° / '+DATA.ports.transfer.closing_deg+'°';$('mechanismSource').textContent='Saved synthetic software benchmark · Physical engine validation NONE'}
function thermo(){let r=DATA.thermo[Number($('thermoSet').value)];$('thermoIndex').max=r.samples.length-1;let i=Math.min(Number($('thermoIndex').value),r.samples.length-1);$('thermoIndex').value=i;let s=r.samples[i];metrics('thermoValues',[['Time',s.time_s,'s'],['Absolute pressure',s.pressure_Pa,'Pa'],['Temperature',s.temperature_K,'K'],['Volume',r.volume_m3,'m³'],['Internal energy',s.internal_energy_J,'J'],['Gas mass',s.mass_kg,'kg']]);plot('pressurePlot',r.samples.map(s=>s.time_s),r.samples.map(s=>s.pressure_Pa),i);plot('temperaturePlot',r.samples.map(s=>s.time_s),r.samples.map(s=>s.temperature_K),i);$('thermoNote').textContent=r.classification+' · Independent fixed-volume time series. Crank-angle value: UNAVAILABLE for this state sequence. Not synchronized with the mechanism.';$('thermoSource').textContent='Saved synthetic software benchmark · Physical engine validation NONE'}
function acoustic(){let r=DATA.acoustics[Number($('acousticSet').value)],i=Math.min(Number($('snapshot').value),r.snapshots.length-1),s=r.snapshots[i];$('snapshot').max=r.snapshots.length-1;$('snapshot').value=i;$('acousticTime').max=r.history.length-1;let j=Math.min(Number($('acousticTime').value),r.history.length-1);$('acousticTime').value=j;let h=r.history[j];metrics('acousticValues',[['Snapshot time',s.time_s,'s'],['Reference pressure',r.reference_pressure_Pa,'Pa absolute'],['Sound speed',r.sound_speed_m_s,'m/s']]);metrics('receiverValues',[['Receiver time',h.time_s,'s'],['Receiver 1 p′',h.receiver1_p_Pa,'Pa'],['Stored acoustic energy',h.energy_J,'J'],['Net boundary out',h.cumulative_net_out_J,'J'],['Energy defect',h.energy_defect_J,'J']]);plot('axialPlot',s.x_m,s.p_Pa,null);plot('receiverPlot',r.history.map(h=>h.time_s),r.history.map(h=>h.receiver1_p_Pa),j);$('acousticSource').textContent='Saved synthetic software benchmark · Physical engine validation NONE'}
function options(id,rows){rows.forEach((r,i)=>{let o=document.createElement('option');o.value=i;o.textContent=r.id;$(id).append(o)})}
if(DATA.schema!=='wahoo.a10.saved-view/1'||DATA.synchronization!=='INDEPENDENT_DEMONSTRATIONS')throw Error('INCOMPATIBLE_SAVED_DATA');
options('thermoSet',DATA.thermo);options('acousticSet',DATA.acoustics);$('angle').oninput=pose;$('thermoSet').onchange=thermo;$('thermoIndex').oninput=thermo;$('acousticSet').onchange=acoustic;$('snapshot').oninput=acoustic;$('acousticTime').oninput=acoustic;pose();thermo();acoustic();


'use strict';
// Read saved rows only. No timers, integration, interpolation or simulation commands.
function pfPlot(id,rows,key,index){
  const svg=$(id);svg.replaceChildren();const pairs=rows.map(s=>[s.time_s,s[key]]).filter(p=>p.every(available));
  if(!pairs.length){let t=element('text',{x:20,y:60,fill:'var(--warning)'});t.textContent='UNAVAILABLE';svg.append(t);return;}
  const xs=pairs.map(p=>p[0]),ys=pairs.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs);let lo=Math.min(...ys),hi=Math.max(...ys);
  if(lo===hi){let span=Math.max(Math.abs(lo)*.02,1e-12);lo-=span/2;hi+=span/2;}
  const X=v=>65+(v-xmin)/(xmax-xmin||1)*510,Y=v=>145-(v-lo)/(hi-lo)*120;
  svg.append(element('path',{d:'M65 15V145H575',fill:'none',stroke:'var(--line)'}));
  for(const p of pairs)svg.append(element('circle',{cx:X(p[0]),cy:Y(p[1]),r:1.6,fill:'var(--blue)'}));
  for(const [v,y]of [[hi,24],[lo,145]]){let t=element('text',{x:0,y,fill:'var(--muted)','font-size':10});t.textContent=fmt(v);svg.append(t);}
  for(const [v,x]of [[xmin,65],[xmax,515]]){let t=element('text',{x,y:170,fill:'var(--muted)','font-size':10});t.textContent=fmt(v);svg.append(t);}
  const s=rows[index];if(s&&available(s.time_s)&&available(s[key]))svg.append(element('circle',{cx:X(s.time_s),cy:Y(s[key]),r:4,fill:'var(--text)'}));
}
function pfUpdate(){
  const r=DATA.port_flow[Number($('pfSet').value)];$('pfIndex').max=r.samples.length-1;
  const i=Math.min(Number($('pfIndex').value),r.samples.length-1);$('pfIndex').value=i;const s=r.samples[i];
  metrics('pfValues',[
    ['Time',s.time_s,'s'],['Crank angle',s.angle_rad*180/Math.PI,'deg'],['Piston travel',s.displacement_m*1000,'mm'],
    ['Opening height',s.opening_height_m,'m'],['Geometric area',s.area_geom_m2,'m²'],['Restriction area',s.area_restriction_m2,'m²'],
    ['Outward mass flow',s.mdot_outward_kg_s,'kg/s'],['Absolute pressure',s.pressure_Pa,'Pa'],['Temperature',s.temperature_K,'K'],
    ['Gas mass',s.mass_kg,'kg'],['Internal energy',s.internal_energy_J,'J'],['Fixed volume',r.volume_m3,'m³'],
    ['External pressure input',s.external_pressure_Pa,'Pa'],['Synthetic RPM input',r.rpm,'rpm'],['Energy residual',s.energy_residual_J,'J']]);
  const q=s.mdot_outward_kg_s;$('pfDirection').textContent=q<0?'EXTERNAL → PORT → CYLINDER':q>0?'CYLINDER → PORT → EXTERNAL':'NO FLOW';
  $('pfOpening').value=s.area_geom_m2/s.max_area_geom_m2;
  $('pfStateNote').textContent='Regime: '+s.regime+' · Donor: '+(s.donor_id===null?'NONE':s.donor_id)+' · Event: '+(s.event_identity===null?'NONE':s.event_identity)+' · Saved sample '+i+' / '+(r.samples.length-1)+'. Pressure-boundary events use the declared right-side value at the stored event; left-side values remain in the engineering transaction record.';
  for(const [id,key]of [['pfPressurePlot','pressure_Pa'],['pfTemperaturePlot','temperature_K'],['pfFlowPlot','mdot_outward_kg_s'],['pfAreaPlot','area_restriction_m2'],['pfMassPlot','mass_kg'],['pfEnergyPlot','internal_energy_J']])pfPlot(id,r.samples,key,i);
  $('pfSource').textContent='Saved synthetic software benchmark · Physical engine validation NONE';
}
if(DATA.viewer_revision!=='wahoo.a11.port-flow-view/1'||DATA.port_flow.length!==4)throw Error('INCOMPATIBLE_A11_SAVED_DATA');
options('pfSet',DATA.port_flow);$('pfSet').onchange=pfUpdate;$('pfIndex').oninput=pfUpdate;pfUpdate();



'use strict';
// Saved rows only; integer sample selection. No interpolation, model or timer.
function mvUpdate(){
 const r=DATA.moving_volume[Number($('mvSet').value)];$('mvIndex').max=r.samples.length-1;
 const i=Math.min(Number($('mvIndex').value),r.samples.length-1);$('mvIndex').value=i;const s=r.samples[i];
 metrics('mvValues',[
 ['Saved time',s.time_s,'s'],['Crank angle',s.angle_rad*180/Math.PI,'deg'],['Wrapped phase',s.phase_angle_rad,'rad'],
 ['Piston travel',s.piston_travel_m*1000,'mm'],['Volume',s.volume_m3,'m³'],['Volume rate',s.dVdt_m3_s,'m³/s'],
 ['Absolute pressure',s.pressure_Pa,'Pa'],['Temperature',s.temperature_K,'K'],['Gas mass',s.mass_kg,'kg'],['Internal energy',s.internal_energy_J,'J'],
 ['Boundary work out',s.boundary_work_out_J,'J'],['Geometric area',s.area_geom_m2,'m²'],['Restriction area',s.area_restriction_m2,'m²'],
 ['Opening height',s.opening_height_m,'m'],['Discharge coefficient',s.Cd,'1'],['Outward mass flow',s.mdot_outward_kg_s,'kg/s'],['External pressure',s.external_pressure_Pa,'Pa']]);
 metrics('mvStreams',[
 ['Mass in',s.mass_in_kg,'kg'],['Mass out',s.mass_out_kg,'kg'],['Enthalpy in',s.energy_in_J,'J'],['Enthalpy out',s.energy_out_J,'J'],
 ['Species A in',s.species_A_in_kg,'kg'],['Species A out',s.species_A_out_kg,'kg'],['Species B in',s.species_B_in_kg,'kg'],['Species B out',s.species_B_out_kg,'kg'],
 ['Species A inventory',s.species_A_kg,'kg'],['Species B inventory',s.species_B_kg,'kg'],['Species A fraction',s.Y_A,'1'],['Species B fraction',s.Y_B,'1']]);
 metrics('mvResiduals',[['Signed mass residual',s.mass_residual_kg,'kg'],['Signed energy residual',s.energy_residual_J,'J'],['Signed species A residual',s.species_A_residual_kg,'kg'],['Signed species B residual',s.species_B_residual_kg,'kg']]);
 const q=s.mdot_outward_kg_s;$('mvDirection').textContent=q<0?'EXTERNAL → PORT → CYLINDER':q>0?'CYLINDER → PORT → EXTERNAL':'NO FLOW';
 $('mvNote').textContent='Regime: '+s.regime+' · Donor: '+(s.donor_id===null?'NONE':s.donor_id)+' · Event: '+(s.event_identity===null?'NONE':s.event_identity)+' · Saved sample '+i+' / '+(r.samples.length-1)+'. Positive boundary work leaves gas and enters prescribed actuator. Pressure-event sample uses right-side forcing; extensive state remains continuous. Points are saved samples.';
 for(const [id,key]of [['mvVolumePlot','volume_m3'],['mvPressurePlot','pressure_Pa'],['mvTemperaturePlot','temperature_K'],['mvFlowPlot','mdot_outward_kg_s'],['mvWorkPlot','boundary_work_out_J'],['mvEnergyPlot','internal_energy_J']])pfPlot(id,r.samples,key,i);
 $('mvSource').textContent='Saved synthetic software benchmark · Physical engine validation NONE';
}
if(DATA.moving_volume_revision!=='wahoo.a12.moving-volume-view/1'||DATA.moving_volume.length!==4)throw Error('INCOMPATIBLE_A12_SAVED_DATA');
options('mvSet',DATA.moving_volume);$('mvSet').onchange=mvUpdate;$('mvIndex').oninput=mvUpdate;mvUpdate();


'use strict';
// Point-only display of saved rows; no integration, model, interpolation or timer.
function hrScatter(id,rows,xkey,ykey,index){
 const svg=$(id);svg.replaceChildren();const ns='http://www.w3.org/2000/svg';
 const xs=rows.map(s=>s[xkey]),ys=rows.map(s=>s[ykey]);const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
 for(let i=0;i<rows.length;i++){const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',30+540*(xs[i]-xmin)/(xmax-xmin||1));dot.setAttribute('cy',160-140*(ys[i]-ymin)/(ymax-ymin||1));dot.setAttribute('r',i===index?4:1.5);dot.setAttribute('fill',i===index?'var(--selected)':'var(--sample)');svg.append(dot);}
}
function hrUpdate(){
 const r=DATA.heat_release[Number($('hrSet').value)];$('hrIndex').max=r.samples.length-1;
 const i=Math.min(Number($('hrIndex').value),r.samples.length-1);$('hrIndex').value=i;const s=r.samples[i];
 metrics('hrValues',[
 ['Saved time',s.time_s,'s'],['Crank angle',s.angle_rad,'rad'],['Piston travel',s.piston_travel_m*1000,'mm'],['Volume',s.volume_m3,'m³'],['Volume rate',s.dVdt_m3_s,'m³/s'],['Geometric area',s.area_geom_m2,'m²'],['Restriction area',s.area_restriction_m2,'m²'],['Discharge coefficient',s.Cd,'1'],['Gas mass',s.mass_kg,'kg'],['Absolute pressure',s.pressure_Pa,'Pa'],['Temperature',s.temperature_K,'K'],['Internal energy',s.internal_energy_J,'J'],['Prescribed Qdot',s.heat_rate_W,'W'],['Cumulative Q in',s.heat_in_J,'J'],['Boundary work out',s.boundary_work_out_J,'J']]);
 metrics('hrStreams',[['Enthalpy in',s.energy_in_J,'J'],['Enthalpy out',s.energy_out_J,'J'],['Mass in',s.mass_in_kg,'kg'],['Mass out',s.mass_out_kg,'kg']]);
 metrics('hrResiduals',[['Signed mass residual',s.mass_residual_kg,'kg'],['Signed energy residual',s.energy_residual_J,'J'],['Signed species A residual',s.species_A_residual_kg,'kg'],['Signed species B residual',s.species_B_residual_kg,'kg']]);
 $('hrNote').textContent=r.id+' · '+r.volume_mode+' · '+(r.volume_mode==='FIXED'?'FIXED-VOLUME SEALED BENCHMARK':'PRESCRIBED MOVING VOLUME')+' · Regime '+s.regime+' · donor '+(s.donor_id||'NONE')+' · saved point '+i+' / '+(r.samples.length-1)+'. Q enters gas; positive work leaves gas. Enthalpy contains flow work once.';
 for(const [id,y]of [['hrPressurePlot','pressure_Pa'],['hrTemperaturePlot','temperature_K'],['hrRatePlot','heat_rate_W'],['hrVolumePlot','volume_m3']])hrScatter(id,r.samples,'angle_rad',y,i);
 hrScatter('hrPVPlot',r.samples,'volume_m3','pressure_Pa',i);pfPlot('hrHeatPlot',r.samples,'heat_in_J',i);pfPlot('hrWorkPlot',r.samples,'boundary_work_out_J',i);
 $('hrSource').textContent='Saved synthetic software benchmark · Physical engine validation NONE';
 $('hrApplicability').textContent='MODEL APPLICABILITY / PHYSICAL VALIDATION NONE / NO ACTUAL COMBUSTION / '+JSON.stringify(r.model_applicability,null,2);
}
if(DATA.heat_release_revision!=='wahoo.a13.heat-release-view/1'||DATA.heat_release.length!==4)throw Error('INCOMPATIBLE_A13_SAVED_DATA');
options('hrSet',DATA.heat_release);$('hrSet').onchange=hrUpdate;$('hrIndex').oninput=hrUpdate;hrUpdate();

})().catch(error=>{const node=document.getElementById("viewerError");node.hidden=false;node.textContent="Saved results could not load. Please reload this page.";console.error(error);});
