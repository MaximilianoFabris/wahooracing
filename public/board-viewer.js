// Display-only mesh renderer. No simulation, geometry generation or third-party requests.
const canvas=document.querySelector('#board3d-canvas'),fallback=document.querySelector('#board3d-fallback'),status=document.querySelector('#board3d-status'),zoom=document.querySelector('#board3d-zoom'),motion=document.querySelector('#board3d-motion');
const presets={studio:[-1.10,.69,3.1],deck:[-Math.PI/2,1.54,3.1],underside:[-Math.PI/2,-1.54,3.1],profile:[-Math.PI/2,.015,3.1]};
let [yaw,elevation,distance]=presets.studio,automatic=false,raf=0,lastTime=0,drawScene=()=>{},ready=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function stop(){automatic=false;motion.setAttribute('aria-pressed','false');motion.textContent='Auto rotate';cancelAnimationFrame(raf);raf=0;lastTime=0;}
function selectView(name){[yaw,elevation,distance]=presets[name];zoom.value=distance;stop();document.querySelectorAll('[data-hull-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hullView===name)));drawScene();}
function manual(){stop();document.querySelectorAll('[data-hull-view]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function animate(t){if(!automatic||document.hidden)return;const dt=lastTime?Math.min(t-lastTime,50):0;lastTime=t;yaw+=dt*.00018;drawScene();raf=requestAnimationFrame(animate);}
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const n=Math.hypot(...a);return a.map(v=>v/n);};
function camera(eye,aspect){const z=norm(eye),x=norm(cross([0,0,1],z)),y=cross(z,x);const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];const f=1/Math.tan(.55/2),near=.05,far=20,p=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=p[k*4+r]*view[c*4+k];return out;}
const vs=`attribute vec3 position;attribute vec3 normal;uniform mat4 mvp;varying vec3 P;varying vec3 N;void main(){P=position;N=normal;gl_Position=mvp*vec4(position,1.);}`;
const fs=`precision highp float;varying vec3 P;varying vec3 N;uniform vec3 eye;uniform sampler2D weave;uniform float day;
void main(){vec3 n=normalize(N);if(!gl_FrontFacing)n=-n;vec3 v=normalize(eye-P);vec3 l=normalize(vec3(-.5,-.7,1.5));vec3 h=normalize(v+l);
// Mirrored cosmetic weave; reversed V progression, independent of source topology.
vec2 uv=vec2(-P.x,abs(P.y))*44.;
float tex=smoothstep(.05,.4,texture2D(weave,uv).r);float diffuse=max(dot(n,l),0.);float fres=pow(1.-max(dot(n,v),0.),4.);
vec3 base=mix(vec3(.035,.045,.055),vec3(.13,.15,.17),tex);
float coat=pow(max(dot(n,h),0.),85.);vec3 l2=normalize(vec3(.4,1.,1.2));float strip=pow(max(dot(n,normalize(v+l2)),0.),150.);
vec3 color=base*(.45+diffuse*.9+day*.45)+vec3(.82,.9,1.)*coat*.7+vec3(.7,.84,1.)*strip*.55+vec3(.20,.35,.52)*fres*.65;
gl_FragColor=vec4(pow(color,vec3(.78)),1.);}`;
async function initialize(){
 try{
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl||!gl.getExtension('OES_element_index_uint'))throw Error('This browser cannot display the interactive mesh.');
  function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('The graphics shader could not initialize.');return s;}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('The graphics program could not initialize.');gl.useProgram(program);
  const response=await fetch('/preview/board-3d/hull.bin');if(!response.ok)throw Error('The mesh could not load.');const bytes=await response.arrayBuffer(),head=new Uint32Array(bytes,0,3);if(head[0]!==0x57424831||bytes.byteLength!==12+head[1]*24+head[2]*4)throw Error('Unexpected display mesh.');
  const count=head[1],indices=head[2];
  for(const [name,offset] of [['position',12],['normal',12+count*12]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(bytes,offset,count*3),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);}
  const indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(bytes,12+count*24,indices),gl.STATIC_DRAW);
  const image=new Image();image.src='/preview/board-3d/carbon-twill.png';await image.decode();const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  const mvp=gl.getUniformLocation(program,'mvp'),eyeLoc=gl.getUniformLocation(program,'eye'),dayLoc=gl.getUniformLocation(program,'day');gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  drawScene=()=>{if(!ready||document.hidden)return;const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(!w||!h)return;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const fitted=distance*Math.max(1,1.5/(w/h));const eye=[fitted*Math.cos(elevation)*Math.cos(yaw),fitted*Math.cos(elevation)*Math.sin(yaw),fitted*Math.sin(elevation)];gl.uniformMatrix4fv(mvp,false,camera(eye,w/h));gl.uniform3fv(eyeLoc,eye);gl.uniform1f(dayLoc,document.documentElement.dataset.theme==='day'?1:0);gl.drawElements(gl.TRIANGLES,indices,gl.UNSIGNED_INT,0);};
  ready=true;canvas.hidden=false;fallback.hidden=true;status.textContent='Interactive hull · cosmetic finish';canvas.dataset.ready='true';drawScene();new ResizeObserver(()=>drawScene()).observe(canvas);new MutationObserver(()=>drawScene()).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();ready=false;canvas.hidden=true;fallback.hidden=false;status.textContent='Graphics paused. Static view shown. Reload to try again.';document.querySelectorAll('.board3d-controls button,.board3d-controls input').forEach(el=>el.disabled=true);});
 }catch(error){status.textContent=error.message+' Static view shown.';canvas.hidden=true;fallback.hidden=false;document.querySelectorAll('.board3d-controls button,.board3d-controls input').forEach(el=>el.disabled=true);}
}
document.querySelectorAll('[data-hull-view]').forEach(b=>b.addEventListener('click',()=>selectView(b.dataset.hullView)));
document.querySelector('#board3d-reset').addEventListener('click',()=>selectView('studio'));
zoom.addEventListener('input',()=>{manual();distance=Number(zoom.value);drawScene();});
motion.addEventListener('click',()=>{if(automatic){stop();return;}if(reduced.matches){status.textContent='Reduced motion is enabled. Use the view buttons or drag to rotate.';return;}automatic=true;motion.setAttribute('aria-pressed','true');motion.textContent='Pause rotation';raf=requestAnimationFrame(animate);});
document.addEventListener('visibilitychange',()=>{stop();drawScene();});reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
const pointers=new Map();let pinch=0;
canvas.addEventListener('pointerdown',e=>{manual();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);}});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){yaw-=(e.clientX-prev[0])*.008;elevation=clamp(elevation+(e.clientY-prev[1])*.008,-1.54,1.54);}else if(pointers.size===2){const p=[...pointers.values()],next=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch>0&&next>0)distance=clamp(distance*pinch/next,2.1,5.5);pinch=next;zoom.value=distance;}drawScene();});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{pointers.delete(e.pointerId);pinch=0;});
canvas.addEventListener('wheel',e=>{if(document.activeElement!==canvas)return;e.preventDefault();manual();distance=clamp(distance+e.deltaY*.002,2.1,5.5);zoom.value=distance;drawScene();},{passive:false});
canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();manual();if(e.key==='Home'){selectView('studio');return;}if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')elevation+=.10;if(e.key==='ArrowDown')elevation-=.10;if(e.key==='+'||e.key==='=')distance-=.15;if(e.key==='-')distance+=.15;elevation=clamp(elevation,-1.54,1.54);distance=clamp(distance,2.1,5.5);zoom.value=distance;drawScene();});
initialize();
