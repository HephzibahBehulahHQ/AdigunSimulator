// Executable logical instructions, not manufacturer hardware or power models.
const rows=[
 ['rail-left','Left logic rail','P',[],['Q'],'1'],
 ['rail-right','Right return rail','N',['L'],[],'0'],
 ['input','Boolean input','I',[],['Q'],'tag I0; state 0; events -'],
 ['contact-no','Normally open contact','S',['L'],['R'],'tag I0; state 0; events -'],
 ['contact-nc','Normally closed contact','S',['L'],['R'],'tag I0; state 0; events -'],
 ['coil','Output / relay coil','K',['L','R'],[],'tag Q0; initial 0'],
 ['coil-negated','Negated coil','K',['L','R'],[],'tag Q0; initial 0'],
 ['coil-set','Set coil','K',['L','R'],[],'tag Q0; initial 0'],
 ['coil-reset','Reset coil','K',['L','R'],[],'tag Q0; initial 0'],
 ['ton','TON on-delay timer','T',['IN'],['Q'],'tag T0; presetMs 500'],
 ['tof','TOF off-delay timer','T',['IN'],['Q'],'tag T0; presetMs 500'],
 ['tp','TP pulse timer','T',['IN'],['Q'],'tag T0; presetMs 500'],
 ['r-trig','Rising-edge detector','B',['CLK'],['Q'],'tag B0'],
 ['f-trig','Falling-edge detector','B',['CLK'],['Q'],'tag B0'],
 ['ctu','CTU up counter','C',['CU','RESET'],['Q'],'tag C0; preset 3'],
 ['ctd','CTD down counter','C',['CD','LOAD'],['Q'],'tag C0; preset 3'],
 ['ctud','CTUD up/down counter','C',['CU','CD','RESET','LOAD'],['QU','QD'],'tag C0; preset 3'],
 ['sr','SR set-dominant latch','B',['SET','RESET'],['Q'],'tag B0'],
 ['rs','RS reset-dominant latch','B',['SET','RESET'],['Q'],'tag B0'],
 ...[['eq','Equal'],['ne','Not equal'],['gt','Greater than'],['ge','Greater or equal'],['lt','Less than'],['le','Less or equal']].map(([op,label])=>['compare-'+op,label+' comparator','B',['EN'],['Q'],'left 5; right 3'])
];
export const LADDER_MODELS=Object.freeze(Object.fromEntries(rows.map(([kind,label,prefix,inputs,outputs,defaultValue])=>['plc.'+kind,Object.freeze({kind,label,prefix,inputs,outputs,defaultValue})])));
export const LADDER_PARTS=Object.freeze(Object.entries(LADDER_MODELS).map(([id,m])=>Object.freeze({id,category:'PLC & Ladder',type:m.label,prefix:m.prefix,pins:[...m.inputs,...m.outputs],defaultValue:m.defaultValue,simulation:'native-ladder-scan',status:'Executable scan-logic instruction; not a manufacturer hardware model',views:{breadboard:false,schematic:true,pcb:false}})));
export function ladderSettings(config={},componentCount=1,netCount=0){
 if(!config||typeof config!=='object'||Array.isArray(config))throw new Error('Invalid ladder recording settings.');
 const scanMs=config.scanMs??10,durationMs=config.durationMs??2000;
 if(!Number.isInteger(scanMs)||scanMs<1||!Number.isInteger(durationMs)||durationMs<scanMs||durationMs>60000||Math.floor(durationMs/scanMs)+1>2000)throw new Error('Use a 1–60,000 ms recording with at most 2,000 scans.');
 if((componentCount+netCount)*(Math.floor(durationMs/scanMs)+1)>150000)throw new Error('Reduce recording length or instruction count to keep editing responsive.');
 return {scanMs,durationMs};
}
const uiWords={en:['Ladder recording','Scan period (ms)','Record duration (ms)','Apply recording settings'],de:['Kontaktplan-Aufzeichnung','Zykluszeit (ms)','Aufzeichnungsdauer (ms)','Aufzeichnung übernehmen'],yo:['Àkọsílẹ̀ Ladder','Àkókò scan (ms)','Gígùn àkọsílẹ̀ (ms)','Fi àṣàyàn sílẹ̀'],pcm:['Ladder recording','Scan period (ms)','Record duration (ms)','Apply recording settings']};
export const ladderUiText=(locale,index)=>(uiWords[locale]??uiWords.en)[index];
const tagValid=s=>/^[A-Za-z][A-Za-z0-9_.]{0,31}$/.test(s)&&!['constructor','prototype','__proto__'].includes(s);
export function ladderParameters(component){
 const model=LADDER_MODELS[component.libraryId];if(!model)throw new Error('Unknown ladder instruction.');
 if(model.kind.startsWith('rail-'))return {};
 const expected=Object.fromEntries(model.defaultValue.split(';').map(s=>s.trim().split(/\s+(.+)/s).slice(0,2))),params={};
 for(const segment of String(component.value).split(';')){const [key,value]=segment.trim().split(/\s+(.+)/s);if(!Object.hasOwn(expected,key)||Object.hasOwn(params,key)||!value)throw new Error('Use the listed ladder parameters without duplicate or unknown fields.');params[key]=value;}
 if(Object.keys(params).length!==Object.keys(expected).length)throw new Error('Missing ladder parameter.');
 if(params.tag&&!tagValid(params.tag))throw new Error('Use a tag beginning with a letter, up to 32 letters/digits/dots.');
 for(const key of ['state','initial','presetMs','preset','left','right'])if(params[key]!==undefined){const n=Number(params[key]);if(!Number.isFinite(n)||(['state','initial'].includes(key)&&![0,1].includes(n))||(['presetMs','preset'].includes(key)&&(!Number.isInteger(n)||n<0||n>65535))||Math.abs(n)>1e9)throw new Error('Invalid ladder numeric parameter: '+key);params[key]=n;}
 if(params.events!==undefined){const source=params.events;params.events=source==='-'?[]:source.split(',').map(s=>{const m=s.trim().match(/^(\d+):([01])$/);if(!m)throw new Error('Events use milliseconds:bit, for example 0:0,100:1,500:0.');return {timeMs:Number(m[1]),value:Number(m[2])};});if(params.events.length>200||params.events.some((e,i)=>e.timeMs>60000||(i>0&&e.timeMs<=params.events[i-1].timeMs)))throw new Error('Use up to 200 ordered input events within 60 seconds.');}
 return params;
}
export function ladderSymbolSpec(id){
 const m=LADDER_MODELS[id];if(!m)return null;
 if(m.kind.startsWith('rail-'))return {kind:'ladder',width:56,height:58,pins:{[m.kind==='rail-left'?'Q':'L']:[28,29,m.kind==='rail-left'?'right':'left']}};
 if(m.kind.startsWith('contact-')||m.kind.startsWith('coil'))return {kind:'ladder',width:56,height:58,pins:{L:[6,29,'left'],R:[50,29,'right']}};
 const height=Math.max(70,24*(Math.max(m.inputs.length,m.outputs.length)+1)),pins={};
 m.inputs.forEach((p,i)=>{pins[p]=[6,(i+1)*height/(m.inputs.length+1),'left'];});m.outputs.forEach((p,i)=>{pins[p]=[90,(i+1)*height/(m.outputs.length+1),'right'];});
 return {kind:'ladder',width:96,height,pins};
}
export function ladderValueLabel(component){
 const p=ladderParameters(component),kind=LADDER_MODELS[component.libraryId].kind;
 if(kind.startsWith('rail-'))return kind==='rail-left'?'Logic 1':'Return';
 if(kind.startsWith('compare-'))return p.left+' / '+p.right;
 return p.tag+(p.presetMs!==undefined?' · '+p.presetMs+' ms':p.preset!==undefined?' · PV '+p.preset:'');
}
export function renderLadderSymbol(id){
 const m=LADDER_MODELS[id],s=ladderSymbolSpec(id);if(!m)return '';
 const path=d=>`<path class="symbol-stroke" d="${d}"/>`,text=(x,y,t)=>`<text class="symbol-text" x="${x}" y="${y}">${t}</text>`;
 let body='';
 if(m.kind.startsWith('rail-'))body=path('M28 6 V52');
 else if(m.kind.startsWith('contact-'))body=path('M6 29 H21 M21 17 V41 M35 17 V41 M35 29 H50')+(m.kind==='contact-nc'?path('M18 43 L38 15'):'');
 else if(m.kind.startsWith('coil'))body=path('M6 29 H19 M23 16 Q10 29 23 42 M33 16 Q46 29 33 42 M37 29 H50')+text(28,29,({'coil-set':'S','coil-reset':'R','coil-negated':'/'}[m.kind]??''));
 else body=path(`M18 10 H78 V${s.height-10} H18 Z`)+text(48,s.height/2,m.kind.replace('compare-','').toUpperCase())+Object.entries(s.pins).map(([p,[x,y,side]])=>path(`M${x} ${y} H${side==='left'?18:78}`)+`<text class="ladder-pin-text" x="${side==='left'?20:76}" y="${y-4}" text-anchor="${side==='left'?'start':'end'}">${p}</text>`).join('');
 return `<g data-symbol-kind="ladder" data-ladder-kind="${m.kind}">${body}</g>`;
}
