const form=document.querySelector('#unlock-form'),password=document.querySelector('#preview-password'),submit=document.querySelector('#unlock-submit'),status=document.querySelector('#unlock-status'),unlockStyle=document.querySelector('#unlock-style');
let pending=false;
const decodeBase64=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
document.querySelector('#unlock-theme').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='day'?'night':'day';document.documentElement.dataset.theme=next;localStorage.setItem('wahoo-theme',next)});
form.addEventListener('submit',async event=>{
event.preventDefault();if(pending||!password.value)return;pending=true;submit.disabled=true;status.dataset.error='false';status.textContent='Unlocking the saved preview…';
let appStyle,loginNodes;
try{
if(!globalThis.crypto?.subtle||!globalThis.DecompressionStream)throw Error('Required browser capability unavailable');
const secret=password.value;password.value='';
const [metaResponse,payloadResponse]=await Promise.all([fetch('./bundle.json',{cache:'no-store'}),fetch('./payload.bin',{cache:'no-store'})]);
if(!metaResponse.ok||!payloadResponse.ok)throw Error('Preview unavailable');
const meta=await metaResponse.json(),salt=decodeBase64(meta.salt_b64),iv=decodeBase64(meta.iv_b64);
if(meta.schema!=='wahoo.password-encrypted-preview/1'||meta.cipher!=='AES-GCM'||meta.hash!=='SHA-256'||meta.keyLength!==256||meta.tagLength!==128||meta.compression!=='gzip'||meta.payload!=='payload.bin'||salt.length!==32||iv.length!==12||typeof meta.aad!=='string'||!meta.aad||meta.iterations!==600000)throw Error('Invalid bundle metadata');
const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),'PBKDF2',false,['deriveKey']);
const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},material,{name:'AES-GCM',length:256},false,['decrypt']);
const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(meta.aad),tagLength:128},key,await payloadResponse.arrayBuffer());
const decompressed=await new Response(new Blob([plaintext]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
const bundle=JSON.parse(decompressed);
if(bundle.schema!=='wahoo.preview-bundle/1'||typeof bundle.html!=='string'||bundle.data?.schema!=='wahoo.simulator-v2.public/1')throw Error('Invalid preview payload');
const parsed=new DOMParser().parseFromString(bundle.html,'text/html');for(const script of parsed.querySelectorAll('script'))script.remove();
if(!parsed.body.querySelector('#workspace'))throw Error('Invalid preview document');
loginNodes=[...document.body.childNodes];window.__wahooV2UnlockedData=bundle.data;
appStyle=document.createElement('link');appStyle.rel='stylesheet';appStyle.href='./app.css';document.head.append(appStyle);unlockStyle.disabled=true;
document.title=parsed.title||'Engine laboratory | Wahoo Racing';document.body.replaceChildren(...[...parsed.body.childNodes].map(node=>document.importNode(node,true)));
await import('./app.js');delete window.__wahooV2UnlockedData;
}catch{
delete window.__wahooV2UnlockedData;if(loginNodes){document.body.replaceChildren(...loginNodes);unlockStyle.disabled=false;appStyle?.remove();document.title='Simulator V2 preview | Wahoo Racing'}
status.dataset.error='true';status.textContent='Incorrect password or damaged preview. Try again.';password.value='';password.focus();
}finally{password.value='';pending=false;submit.disabled=false}
});
