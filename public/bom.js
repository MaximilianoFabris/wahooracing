const $=s=>document.querySelector(s);
const category=$('#bom-category'), procurement=$('#bom-procurement'), maturity=$('#bom-maturity');
const rows=[...document.querySelectorAll('[data-category]')];
function update(){
 let count=0,definitions=0;
 for(const row of rows){
  const p=JSON.parse(row.dataset.procurement),m=JSON.parse(row.dataset.maturity);
  const show=(category.value==='all'||row.dataset.category===category.value)&&(procurement.value==='all'||p[procurement.value]>0)&&(maturity.value==='all'||m[maturity.value]>0);
  row.hidden=!show;
  if(show){count++;definitions+=Number(row.dataset.definitions);}
  row.querySelector('[data-procurement-match]').textContent=procurement.value==='all'?'All procurement routes':`${p[procurement.value]||0} definitions · selected procurement route`;
  row.querySelector('[data-maturity-match]').textContent=maturity.value==='all'?'All evidence stages':`${m[maturity.value]||0} definitions · selected evidence stage`;
 }
 $('#bom-results').textContent=`${count} of 9 system categories · ${definitions} system definitions in those categories`;
 $('#bom-empty').hidden=count!==0;
}
for(const input of [category,procurement,maturity])input.addEventListener('change',update);
$('#bom-reset').addEventListener('click',()=>{category.value=procurement.value=maturity.value='all';update();});
update();
