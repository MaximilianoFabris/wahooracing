
(() => {
  const root=document.getElementById('wahoo-motion-r1');
  const find=id=>root.querySelector('#'+id);
  const angleInput=find('wm-angle'),rpmInput=find('wm-rpm'),play=find('wm-play');
  let angle=60,rpm=12000,frame=0,playing=false,plotCache=[],lastTime=null;
  const motion=(deg,n)=>{
    const t=deg*Math.PI/180,r=.02725,L=.102,s=Math.sin(t),c=Math.cos(t),q=Math.sqrt(L*L-r*r*s*s),w=n*2*Math.PI/60;
    const x=r+L-r*c-q;
    return {x:1000*x,v:(r*s+r*r*s*c/q)*w,a:(r*c+r*r*(c*c-s*s)/q+r**4*s*s*c*c/q**3)*w*w,pin:(r*c+q)*1000,cx:r*c*1000,cy:r*s*1000,crown:157.25-1000*x};
  };
  const fmt=(x,d=2)=>(Math.abs(x)<1e-8?0:x).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});
  const svgEl=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;};
  function save(){}
  function mechanism(){
    const svg=find('wm-mechanism'),W=Math.max(280,svg.clientWidth),H=245,m=motion(angle,rpm),scale=Math.min((W-52)/230,2.25),ox=(W-184.5*scale)/2+27.25*scale,oy=117;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
    const x=v=>ox+v*scale,y=v=>oy+v*scale;
    const add=(tag,attrs,text)=>svg.appendChild(svgEl(tag,attrs,text));
    add('line',{x1:15,y1:oy,x2:W-15,y2:oy,class:'wm-structure'});
    add('circle',{cx:ox,cy:oy,r:27.25*scale,class:'wm-structure'});
    add('line',{x1:ox,y1:oy,x2:x(m.cx),y2:y(m.cy),stroke:'var(--text)','stroke-width':2});
    add('line',{x1:x(m.cx),y1:y(m.cy),x2:x(m.pin),y2:oy,class:'wm-rod'});
    [[ox,oy],[x(m.cx),y(m.cy)],[x(m.pin),oy]].forEach(([cx,cy])=>add('circle',{cx,cy,r:4,class:'wm-joint'}));
    add('line',{x1:x(m.pin),y1:oy,x2:x(m.crown),y2:oy,class:'wm-datum'});
    add('line',{x1:x(m.crown),y1:oy-22,x2:x(m.crown),y2:oy+22,class:'wm-datum'});
    add('text',{x:15,y:20},'Joint centres to scale · outlines omitted');
    add('text',{x:15,y:43},'Crankpin orbit r = 27.25 mm');
    add('text',{x:W-15,y:66,'text-anchor':'end'},'Rod centres L = 102 mm · verify');
    add('line',{x1:x(m.pin),y1:oy-8,x2:x(m.pin),y2:oy-28,class:'wm-structure'});
    add('text',{x:x(m.pin),y:oy-34,'text-anchor':'middle'},'Piston pin');
    add('text',{x:W-15,y:203,'text-anchor':'end'},`Crown datum reach ${fmt(m.crown)} mm*`);
    add('text',{x:W-15,y:226,'text-anchor':'end'},'*H = 28 mm · datum unverified');
  }
  function charts(){
    plotCache=[];
    const values=Array.from({length:361},(_,i)=>({angle:i,...motion(i,rpm)}));
    for(const [id,key,label] of [['wm-travel','x','Travel (mm)'],['wm-velocity','v','Velocity (m/s)']]){
      const svg=find(id),W=Math.max(280,svg.clientWidth),H=205,left=64,right=16,top=28,bottom=46;
      svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
      const low=Math.min(...values.map(d=>d[key])),high=Math.max(...values.map(d=>d[key])),pad=(high-low)*.07||1;
      const xs=a=>left+4+a/360*(W-left-right-8),ys=v=>H-bottom-4-(v-low+pad)/(high-low+2*pad)*(H-bottom-top-8);
      const add=(tag,attrs,text)=>{const e=svgEl(tag,attrs,text);svg.append(e);return e;};
      add('rect',{x:left,y:top,width:W-left-right,height:H-bottom-top,fill:'none',stroke:'var(--line)','data-chart-frame':''});
      for(const a of [0,120,240,360])add('text',{x:xs(a),y:H-bottom+20,'text-anchor':a===0?'start':a===360?'end':'middle',class:'tick-label'},String(a));
      for(const v of [low,(low+high)/2,high])add('text',{x:left-8,y:ys(v)+4,'text-anchor':'end',class:'tick-label'},fmt(v,1));
      add('text',{x:left,y:16,class:'axis-title'},label);
      add('text',{x:(left+W-right)/2,y:H-6,'text-anchor':'middle',class:'axis-title'},'Crank angle (° after TDC)');
      add('line',{x1:left,x2:W-right,y1:ys(0),y2:ys(0),stroke:'var(--line)'});
      add('polyline',{points:values.map(d=>`${xs(d.angle)},${ys(d[key])}`).join(' '),fill:'none',stroke:'var(--blue)','stroke-width':2});
      const guide=add('line',{y1:top,y2:H-bottom,stroke:'var(--text)','stroke-width':1,opacity:.4}),dot=add('circle',{r:4,fill:'var(--blue)'});
      plotCache.push({guide,dot,xs,ys,key});
    }
  }
  function draw(announce=true){
    angleInput.value=angle;rpmInput.value=rpm;find('wm-angle-value').textContent=`${fmt(angle,1)}° after TDC`;find('wm-rpm-value').textContent=`${fmt(rpm,0)} rpm`;
    const m=motion(angle,rpm);mechanism();
    const vals=find('wm-values');vals.setAttribute('aria-live',announce?'polite':'off');
    vals.textContent=`Travel ${fmt(m.x)} mm · Velocity ${fmt(m.v)} m/s · Acceleration ${fmt(m.a/1000)} km/s²`;
    vals.setAttribute('data-displacement',m.x);vals.setAttribute('data-velocity',m.v);vals.setAttribute('data-acceleration',m.a);
    for(const p of plotCache){p.guide.setAttribute('x1',p.xs(angle));p.guide.setAttribute('x2',p.xs(angle));p.dot.setAttribute('cx',p.xs(angle));p.dot.setAttribute('cy',p.ys(m[p.key]));}
    play.disabled=rpm===0;
  }
  function stop(){cancelAnimationFrame(frame);playing=false;lastTime=null;play.textContent='One revolution';}
  angleInput.addEventListener('input',()=>{stop();angle=Number(angleInput.value);draw();});angleInput.addEventListener('change',save);
  rpmInput.addEventListener('input',()=>{stop();rpm=Number(rpmInput.value);charts();draw();});rpmInput.addEventListener('change',save);
  for(const [id,a] of [['wm-tdc',0],['wm-bdc',180]])find(id).addEventListener('click',()=>{stop();angle=a;draw();save();});
  play.addEventListener('click',()=>{
    if(playing){stop();draw();save();return;}if(!rpm)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){angle=360;draw();save();return;}
    playing=true;play.textContent='Pause';angle=0;lastTime=null;
    const tick=time=>{if(!playing)return;if(lastTime===null)lastTime=time;angle=Math.min(360,(time-lastTime)/4000*360);draw(false);if(angle<360)frame=requestAnimationFrame(tick);else{stop();draw();save();}};
    frame=requestAnimationFrame(tick);
  });
  charts();draw();
  new ResizeObserver(()=>{charts();draw(false);}).observe(root);
})();
