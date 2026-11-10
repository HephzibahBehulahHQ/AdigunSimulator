const classifications=[
 [10,'Analog','Beginner','LEDs, switches and supplies'],
 [20,'Analog','Intermediate','Passive networks and sensors'],
 [40,'Analog','Intermediate','Amplifiers, timers and filters'],
 [60,'Digital','Intermediate','Logic and serial protocols'],
 [80,'Digital','Advanced','Microcontrollers and embedded systems'],
 [90,'Digital','Advanced','Communications'],
 [100,'Analog','Intermediate','Audio and displays'],
 [120,'Power','Advanced','Conversion and protection'],
 [140,'PCB','Advanced','Board layout and manufacturing studies'],
 [150,'Tools','Intermediate','Measurement and analysis'],
 [160,'Tools','Advanced','Diagnostics and reproducibility'],
 [180,'PLC','Intermediate','Control and automation'],
 [200,'Tools','Intermediate','Design workflows and calculators']
];
export function classifyExample(file){
 if(file.includes('ladder-'))return {type:'PLC',level:'Intermediate',category:'Executable ladder logic'};
 if(file.startsWith('supplemental-')){
  if(/digital|flip-flop|mux/.test(file))return {type:'Digital',level:'Intermediate',category:'Event simulation'};
  return {type:'Analog',level:'Intermediate',category:/npn/.test(file)?'Transistor bias':'Passive filters'};
 }
 const index=Number(file.slice(0,3)),entry=classifications.find(([last])=>index<=last);
 if(!entry)throw new Error('Classify this example explicitly: '+file);
 return {type:entry[1],level:entry[2],category:entry[3]};
}
export function filterExamples(items,{query='',type='',level='',category='',pcb='',page=0,pageSize=40}={}){
 const terms=String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matches=items.filter(e=>(!type||e.type===type)&&(!level||e.level===level)&&(!category||e.category===category)&&(!pcb||e.pcbStatus===pcb)&&terms.every(t=>[e.title,e.file,e.type,e.level,e.category].join(' ').toLocaleLowerCase().includes(t)));
 const size=Math.max(1,Math.min(100,Math.floor(Number(pageSize)||40))),pages=Math.max(1,Math.ceil(matches.length/size)),current=Math.max(0,Math.min(pages-1,Math.floor(Number(page)||0)));
 return {total:matches.length,pages,page:current,items:matches.slice(current*size,(current+1)*size)};
}
export const EXPECTED_DIAGNOSTICS=new Set(['152-convergence-failure-study.adigun.json','153-floating-node-diagnosis.adigun.json','154-short-circuit-diagnosis.adigun.json','155-missing-ground-diagnosis.adigun.json','156-model-unavailable-diagnosis.adigun.json']);
export function pcbCoverage(project){
 const components=project.components??[],pcb=project.pcbFabrication,parts=pcb?.parts??[],pads=pcb?.pads??[];
 const placed=parts.filter(p=>pads.some(pad=>pad.instanceId===p.instanceId));
 const missing=components.filter(c=>!placed.some(p=>p.instanceId===c.instanceId)).map(c=>({reference:c.reference,libraryId:c.libraryId}));
 return {status:placed.length?'stored':components.length&&components.every(c=>c.libraryId.startsWith('plc.'))?'logic':'unmapped',parts:placed.length,pads:pads.length,routes:pcb?.routes?.length??0,missing};
}
