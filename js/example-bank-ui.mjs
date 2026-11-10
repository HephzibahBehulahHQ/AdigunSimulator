import {filterExamples} from './example-bank.mjs';
const words={
 en:['Search examples','Type','Level','Category','PCB coverage','All','Stored layouts','Package mapping needed','Logic only','Previous','Next','matches','Loading example index…','Index unavailable; the original example list is still available.','Stored layout','No stored PCB packages','Logical instructions have no physical footprint','components','parts','pads','Expected diagnostic','Not a manufacturing verification.'],
 de:['Beispiele suchen','Typ','Niveau','Kategorie','Leiterplattenstatus','Alle','Gespeicherte Layouts','Gehäusezuordnung nötig','Nur Logik','Zurück','Weiter','Treffer','Beispielindex wird geladen…','Index nicht verfügbar; die bisherige Liste bleibt verfügbar.','Gespeichertes Layout','Keine Leiterplattengehäuse gespeichert','Logikanweisungen haben kein physisches Gehäuse','Bauteile','Gehäuse','Pads','Erwartete Diagnose','Keine Fertigungsprüfung.'],
 yo:['Wá àpẹẹrẹ','Irú','Ìpele','Ẹ̀ka','Ipò PCB','Gbogbo','Layout tí a fi pamọ́','Ó nílò package mapping','Logic nìkan','Ẹ̀yìn','Tó tẹ̀lé','àbájáde','Ń gba àtòjọ àpẹẹrẹ…','Àtòjọ tuntun kò sí; àtòjọ àtijọ́ ṣì wà.','Layout tí a fi pamọ́','Kò sí package PCB tí a fi pamọ́','Logic kò ní footprint ti ara','ẹ̀yà','package','pad','Àyẹ̀wò ìṣòro tí a retí','Kì í ṣe ìmúdájú iṣelọpọ.'],
 pcm:['Search examples','Type','Level','Category','PCB coverage','All','Saved layouts','Package mapping needed','Logic only','Previous','Next','matches','Loading example index…','Index no load; original example list still dey available.','Saved layout','No PCB packages saved','Logic instructions no get physical footprint','components','parts','pads','Expected diagnostic','This no be manufacturing verification.']
};
export function describeExample(e,locale='en'){const text=i=>(words[locale]??words.en)[i];return e?[e.components+' '+text(17),e.pcbStatus==='stored'?text(14)+': '+e.pcbParts+' '+text(18)+', '+e.pcbPads+' '+text(19):text(e.pcbStatus==='logic'?16:15),e.unmapped.length?'Unmapped: '+e.unmapped.slice(0,8).map(x=>x.reference).join(', ')+(e.unmapped.length>8?' …':'' ):'',e.analysis==='expected-diagnostic'?text(20):'',text(21)].filter(Boolean).join(' · '):'';}
export function createExampleBrowser({document,fetch,getLocale,translate}){
 const menu=document.querySelector('.example-menu'),picker=document.querySelector('#example-picker'),host=document.querySelector('#example-browser'),loadButton=document.querySelector('#load-example');
 const originalLabels=new Map([...picker.options].map(o=>[o.value,{text:o.textContent,key:o.dataset.i18n}]));
 const text=i=>(words[getLocale()]??words.en)[i];let entries=null,pending=false,page=0,lastLocale='',disposed=false;
 host.innerHTML='<label class="example-query"><span></span><input type="search" maxlength="120" data-example-query/></label><div class="example-filters">'+['type','level','category','pcb'].map(key=>'<label><span></span><select data-example-filter="'+key+'" disabled></select></label>').join('')+'</div><div class="example-pages"><button type="button" data-example-page="-1" disabled></button><output aria-live="polite"></output><button type="button" data-example-page="1" disabled></button></div><p class="example-coverage" aria-live="polite"></p>';
 const query=host.querySelector('[data-example-query]'),filters=[...host.querySelectorAll('[data-example-filter]')],output=host.querySelector('output'),coverage=host.querySelector('.example-coverage');
 const option=(value,label)=>{const node=document.createElement('option');node.value=value;node.textContent=label;return node;};
 const selectedInfo=()=>{const e=entries?.find(x=>'examples/'+x.file===picker.value);coverage.textContent=describeExample(e,getLocale());loadButton.disabled=!picker.value;};
 function results(clear=false){
  if(!entries)return;const selected=clear?'':picker.value,config=Object.fromEntries(filters.map(e=>[e.dataset.exampleFilter,e.value]));
  const result=filterExamples(entries,{...config,query:query.value,page});page=result.page;
  const choices=[option('',translate('chooseExample')),...result.items.map(e=>{const key='examples/'+e.file,old=originalLabels.get(key);return option(key,old?.key?translate(old.key):old?.text??e.title);})];
  picker.replaceChildren(...choices);if(choices.some(e=>e.value===selected))picker.value=selected;
  output.textContent=result.total+' / '+entries.length+' '+text(11)+' · '+(page+1)+' / '+result.pages;
  host.querySelector('[data-example-page="-1"]').disabled=page===0;host.querySelector('[data-example-page="1"]').disabled=page>=result.pages-1;selectedInfo();
 }
 function paint(){
  host.querySelector('.example-query span').textContent=text(0);query.setAttribute('aria-label',text(0));filters.forEach((field,i)=>field.previousElementSibling.textContent=text(i+1));host.querySelector('[data-example-page="-1"]').textContent=text(9);host.querySelector('[data-example-page="1"]').textContent=text(10);
  if(lastLocale===getLocale()){if(entries)selectedInfo();return;}lastLocale=getLocale();
  if(entries)populate();else if(pending)output.textContent=text(12);
 }
 function populate(){
  filters.forEach(field=>{const selected=field.value,key=field.dataset.exampleFilter,values=key==='pcb'?[['stored',text(6)],['unmapped',text(7)],['logic',text(8)]]:[...new Set(entries.map(e=>e[key]))].sort().map(v=>[v,v]);field.replaceChildren(option('',text(5)),...values.map(([v,label])=>option(v,label)));field.value=selected;field.disabled=false;});results();
 }
 async function opened(){
  if(!menu.open||pending)return;if(entries){selectedInfo();return;}pending=true;output.textContent=text(12);
  try{const response=await fetch('examples/index.json');if(!response.ok)throw Error('Index unavailable');const data=await response.json();if(data.schemaVersion!==1||!Array.isArray(data.entries)||data.entries.length>20000||data.entries.some(e=>!/^[-a-z0-9]+\.adigun\.json$/.test(e.file)))throw Error('Invalid index');if(disposed)return;entries=data.entries;populate();}
  catch{if(!disposed)output.textContent=text(13);}finally{pending=false;}
 }
 const changed=()=>{page=0;results(true);},clicked=e=>{const b=e.target.closest('[data-example-page]');if(b){page+=Number(b.dataset.examplePage);results(true);}};
 query.addEventListener('input',changed);filters.forEach(f=>f.addEventListener('change',changed));host.addEventListener('click',clicked);picker.addEventListener('change',selectedInfo);menu.addEventListener('toggle',opened);paint();
 return {paint,dispose(){disposed=true;query.removeEventListener('input',changed);filters.forEach(f=>f.removeEventListener('change',changed));host.removeEventListener('click',clicked);picker.removeEventListener('change',selectedInfo);menu.removeEventListener('toggle',opened);}};
}
