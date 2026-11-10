import { DEFAULT_PALETTE, awgArea, editProjectPalette, editWireAppearance, wireAppearance } from './project-appearance.mjs';
import { scopeChannels, scopeTrace, scopePlot, fitScopeWindow } from './oscilloscope-data.mjs';
const words={
 en:['Wire customization','Select a schematic wire to edit.','Cable size (mm²)','Gauge (AWG 0–40)','Color','Apply to wire','Reset wire style','Size/gauge are annotations; ampacity and wire resistance are not simulated.','Color Palette','Palette name','Components','Wires','Background','Grid','Save palette','Cancel','Oscilloscope','Move oscilloscope','Resize oscilloscope','Close oscilloscope','Minimize / restore','Probe net','V/div','Auto','Run a supported DC or linear transient calculation.','Calculated samples','DC steady state','Outside vertical range','Use arrow keys to move or resize.','Running','Paused','Complete','Stopped','Updating…'],
 de:['Leitung anpassen','Eine Schaltplanleitung auswählen.','Querschnitt (mm²)','Querschnitt (AWG 0–40)','Farbe','Auf Leitung anwenden','Leitungsstil zurücksetzen','Querschnitt/AWG sind Angaben; Belastbarkeit und Leitungswiderstand werden nicht simuliert.','Farbpalette','Palettenname','Bauteile','Leitungen','Hintergrund','Raster','Palette speichern','Abbrechen','Oszilloskop','Oszilloskop bewegen','Oszilloskop skalieren','Oszilloskop schließen','Minimieren / wiederherstellen','Messnetz','V/Teil','Auto','Unterstützte DC- oder lineare Transientenberechnung starten.','Berechnete Messpunkte','DC-Arbeitspunkt','Außerhalb des vertikalen Bereichs','Pfeiltasten bewegen oder skalieren das Fenster.','Läuft','Pausiert','Abgeschlossen','Gestoppt','Aktualisierung…'],
 yo:['Ṣètò wáyà','Yan wáyà àwòrán láti ṣàtúnṣe.','Ìwọ̀n wáyà (mm²)','Gauge (AWG 0–40)','Àwọ̀','Fi sí wáyà','Dá àwọ̀ wáyà padà','Ìwọ̀n/AWG jẹ́ àlàyé; a kò ṣe ìṣirò agbára ìṣàn tàbí resistance wáyà.','Àkójọpọ̀ àwọ̀','Orúkọ àwọ̀','Àwọn ẹ̀yà','Àwọn wáyà','Abẹ́lẹ̀','Àkój','Fi àwọ̀ pamọ́','Fagilé','Oscilloscope','Gbé oscilloscope','Yí ìwọ̀n oscilloscope','Pa oscilloscope','Dín kù / dá padà','Yan net ìwọ̀n','V/div','Auto','Ṣe ìṣirò DC tàbí àkókò laini tí a ṣe àtìlẹ́yìn fún.','Àwọn iye ìṣirò','Ipò DC tó dúró','Ó kọjá ààyè inaro','Lo bọ́tìnì ọfà láti gbé tàbí yí ìwọ̀n.','Ń ṣiṣẹ́','Dúró díẹ̀','Parí','Ti dá dúró','Ń túnṣe…'],
 pcm:['Wire setup','Select schematic wire to edit am.','Cable size (mm²)','Gauge (AWG 0–40)','Color','Apply to wire','Reset wire style','Size/gauge na notes; ampacity and wire resistance no dey simulated.','Color Palette','Palette name','Components','Wires','Background','Grid','Save palette','Cancel','Oscilloscope','Move oscilloscope','Resize oscilloscope','Close oscilloscope','Minimize / restore','Probe net','V/div','Auto','Run supported DC or linear transient calculation.','Calculated samples','DC steady state','Outside vertical range','Use arrow keys to move or resize.','Running','Paused','Complete','Stopped','Updating…']
};
export const designText=(locale,index)=>(words[locale]??words.en)[index];
export function createDesignTools({document,window,getState,getLive,getRoute,commit,render}){
 const $=s=>document.querySelector(s),text=i=>designText(getState().project.metadata.locale,i),canvas=$('#design-canvas');
 const wireBox=$('#wire-style-menu');
 wireBox.innerHTML='<p data-design-label="1"></p><fieldset><legend data-design-label="0"></legend><label><span data-design-label="2"></span><input id="wire-size" type="number" min="0.001" max="300" step="any" /></label><label><span data-design-label="3"></span><input id="wire-gauge" type="number" min="0" max="40" step="1" placeholder="—" /></label><label><span data-design-label="4"></span><input id="wire-color" type="color" /></label><button type="button" id="wire-style-apply" data-design-label="5"></button><button type="button" id="wire-style-reset" data-design-label="6"></button></fieldset><small data-design-label="7"></small><output role="alert"></output>';
 const palette=document.createElement('dialog');palette.id='palette-dialog';palette.setAttribute('aria-labelledby','palette-title');
 palette.innerHTML='<form><h2 id="palette-title" data-design-label="8"></h2><label><span data-design-label="9"></span><input name="paletteName" maxlength="60" required /></label>'+Object.keys(DEFAULT_PALETTE).map((k,i)=>`<label><span data-design-label="${({component:10,wire:11,background:12,grid:13})[k]}"></span><input type="color" name="${k}" required /><input class="palette-hex" aria-label="${k} hex" data-hex="${k}" pattern="#[0-9a-fA-F]{6}" maxlength="7" required /></label>`).join('')+'<output role="alert"></output><div class="dialog-actions"><button type="submit" data-design-label="14"></button><button type="button" data-palette-cancel data-design-label="15"></button></div></form>';
 document.body.append(palette);
 const scope=document.createElement('section');scope.className='scope-window';scope.hidden=true;scope.setAttribute('role','dialog');scope.setAttribute('aria-label','Oscilloscope');
 scope.innerHTML='<header><button type="button" class="scope-move" data-design-label="16"></button><button type="button" class="scope-minimize">−</button><button type="button" class="scope-close">×</button></header><div class="scope-body"><div class="scope-controls"><label><span data-design-label="21"></span><select class="scope-channel"></select></label><label><span data-design-label="22"></span><select class="scope-scale"><option value="0" data-design-label="23"></option><option>0.1</option><option>1</option><option>5</option><option>10</option></select></label></div><div class="scope-chart"></div><output class="scope-status" aria-live="off"></output></div><button type="button" class="scope-resize">◢</button>';
 document.body.append(scope);
 let lastLocale=null,visible=false,box={x:0,y:0,width:380,height:240,minimized:false},drag=null,channel='',disposed=false;
 const query=s=>scope.querySelector(s),syncLabels=()=>{
   for(const node of document.querySelectorAll('[data-design-label]'))node.textContent=text(Number(node.dataset.designLabel));
   [['.scope-move',17],['.scope-resize',18],['.scope-close',19],['.scope-minimize',20]].forEach(([s,i])=>{query(s).setAttribute('aria-label',text(i));query(s).title=text(i)+' · '+text(28);});
   scope.setAttribute('aria-label',text(16));
 };
 function syncWire(){
   const route=getState().activeView==='schematic'?getRoute():null,style=route?wireAppearance(getState().project,route):{};
   wireBox.querySelector('fieldset').disabled=!route;wireBox.querySelector('p').hidden=Boolean(route);wireBox.querySelector('output').textContent='';
   $('#wire-size').value=style.sizeMm2??'';$('#wire-gauge').value=style.gaugeAwg??'';$('#wire-color').value=style.color??getState().project.palette?.colors.wire??DEFAULT_PALETTE.wire;
 }
 const wireInput=e=>{if(e.target.id==='wire-gauge'){const n=Number(e.target.value);if(e.target.value!==''&&Number.isInteger(n)&&n>=0&&n<=40)$('#wire-size').value=awgArea(n).toFixed(8);}else if(e.target.id==='wire-size')$('#wire-gauge').value='';};
 const wireClick=e=>{
   if(!['wire-style-apply','wire-style-reset'].includes(e.target.id))return;
   try{const route=getRoute();let style={};if(e.target.id==='wire-style-apply'){
     style.color=$('#wire-color').value;
     if($('#wire-size').value!=='')style.sizeMm2=Number($('#wire-size').value);
     if($('#wire-gauge').value!==''){style.gaugeAwg=Number($('#wire-gauge').value);style.sizeMm2=awgArea(style.gaugeAwg);}
   }commit(editWireAppearance(getState().project,route,style));render();}
   catch(error){e.stopPropagation();wireBox.querySelector('output').textContent=error.message;}
 };
 wireBox.addEventListener('input',wireInput);wireBox.addEventListener('click',wireClick);
 const editMenu=wireBox.closest('.app-menu'),editToggle=()=>{if(editMenu.open){syncLabels();syncWire();}};editMenu.addEventListener('toggle',editToggle);
 const paletteInput=e=>{if(e.target.matches('input[type=color]'))palette.querySelector(`[data-hex="${e.target.name}"]`).value=e.target.value;else if(e.target.dataset.hex&&/^#[0-9a-f]{6}$/i.test(e.target.value))palette.querySelector(`[name="${e.target.dataset.hex}"]`).value=e.target.value;};
 const paletteSubmit=e=>{e.preventDefault();try{const colors=Object.fromEntries(Object.keys(DEFAULT_PALETTE).map(k=>[k,palette.querySelector(`[data-hex="${k}"]`).value]));commit(editProjectPalette(getState().project,{name:palette.querySelector('[name=paletteName]').value,colors}));palette.close();render();}catch(error){palette.querySelector('output').textContent=error.message;}};
 palette.addEventListener('input',paletteInput);palette.querySelector('form').addEventListener('submit',paletteSubmit);palette.querySelector('[data-palette-cancel]').addEventListener('click',()=>palette.close());
 function bounds(){return {x:4,y:4,width:Math.max(1,window.innerWidth-8),height:Math.max(1,window.innerHeight-8)};}
 function position(){
   if(!visible)return;const limit=bounds();scope.hidden=limit.width<120||limit.height<80;if(scope.hidden)return;
   box=fitScopeWindow(box,limit);Object.assign(scope.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px'});scope.classList.toggle('minimized',box.minimized);
 }
 function close(){visible=false;scope.hidden=true;drag=null;}
 function paint(){
   if(disposed)return;const state=getState(),colors=state.project.palette?.colors;if(lastLocale!==state.project.metadata.locale){lastLocale=state.project.metadata.locale;syncLabels();}
   for(const [key,fallback] of Object.entries(DEFAULT_PALETTE))canvas.style.setProperty('--project-'+key,colors?.[key]??fallback);
   canvas.classList.toggle('custom-palette',Boolean(colors));
   if(!visible)return;position();if(scope.hidden||box.minimized)return;
   const live=getLive(),channels=scopeChannels(state.project,state.lastAnalysis,live),select=query('.scope-channel');
   if([...select.options].map(o=>o.value).join('\0')!==channels.join('\0')){select.replaceChildren(...channels.map(n=>{const option=document.createElement('option');option.value=n;option.textContent=n;return option;}));}
   if(!channels.includes(channel))channel=state.lastAnalysis?.scopeRecording?.preferredNet??channels.find(n=>/out/i.test(n))??channels.find(n=>! /^(0|gnd|ground)$/i.test(n))??channels[0]??'';select.value=channel;
   const trace=scopeTrace(state.project,state.lastAnalysis,live,channel),chart=query('.scope-chart'),status=query('.scope-status');
   if(!trace){chart.replaceChildren();status.textContent=live.status==='updating'?text(33):live.playback==='stopped'?text(32)+' · '+text(24):state.lastAnalysis?.state==='complete'?`${state.lastAnalysis.engine}: no voltage recording is available for this model.`:text(24);return;}
   const p=scopePlot(trace,Number(query('.scope-scale').value)),label=text(({running:29,paused:30,complete:31,stopped:32})[live.playback]??32);
   chart.innerHTML=`<svg viewBox="0 0 500 210" role="img" aria-label="${text(16)}"><defs><clipPath id="scope-trace-clip"><rect x="40" y="24" width="440" height="156"/></clipPath></defs>${Array.from({length:9},(_,i)=>`<path class="scope-grid" d="M40 ${24+i*19.5}H480"/>`).join('')}${Array.from({length:11},(_,i)=>`<path class="scope-grid" d="M${40+i*44} 24V180"/>`).join('')}<text x="4" y="26">${p.max.toPrecision(3)} V</text><text x="4" y="180">${p.min.toPrecision(3)} V</text><path class="scope-trace" clip-path="url(#scope-trace-clip)" d="${p.path}"/><path class="scope-cursor" d="M${p.cursorX} 24V180"/><text x="40" y="202">0</text><text x="380" y="202">${trace.kind==='dc'?'DC':(trace.duration*1000).toPrecision(4)+' ms'}</text></svg>`;
   status.textContent=`${label} · ${trace.model??text(trace.kind==='dc'?26:25)} · ${trace.voltage.toPrecision(4)} V${trace.kind==='dc'?'':' · '+(trace.time*1000).toPrecision(4)+' ms'}${p.clipped?' · '+text(27):''}`;
 }
 query('.scope-channel').addEventListener('change',()=>{channel=query('.scope-channel').value;paint();});query('.scope-scale').addEventListener('change',paint);
 query('.scope-close').addEventListener('click',close);query('.scope-minimize').addEventListener('click',()=>{box.minimized=!box.minimized;box.height=box.minimized?38:240;position();paint();});
 const down=e=>{const mode=e.target.closest('.scope-move')?'move':e.target.closest('.scope-resize')?'resize':null;if(!mode||e.button!==0)return;e.preventDefault();drag={mode,id:e.pointerId,x:e.clientX,y:e.clientY,box:{...box}};scope.setPointerCapture(e.pointerId);};
 const move=e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;box=drag.mode==='move'?{...drag.box,x:drag.box.x+dx,y:drag.box.y+dy}:{...drag.box,width:drag.box.width+dx,height:drag.box.height+dy};position();};
 const up=e=>{if(!drag||e.pointerId!==drag.id)return;if(e.type==='pointercancel')box=drag.box;drag=null;position();};
 scope.addEventListener('pointerdown',down);scope.addEventListener('pointermove',move);scope.addEventListener('pointerup',up);scope.addEventListener('pointercancel',up);
 scope.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){close();$('.command-bar summary[data-i18n="simulationMenu"]').focus();return;}const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!delta||!e.target.matches('.scope-move,.scope-resize'))return;e.preventDefault();if(e.target.matches('.scope-resize')){box.width+=delta[0];box.height+=delta[1];}else{box.x+=delta[0];box.y+=delta[1];}position();});
 window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
 function action(name){
   if(name==='color-palette'){syncLabels();const p=getState().project.palette??{name:'Project',colors:DEFAULT_PALETTE};palette.querySelector('[name=paletteName]').value=p.name;for(const k of Object.keys(DEFAULT_PALETTE)){palette.querySelector(`[name="${k}"]`).value=p.colors[k];palette.querySelector(`[data-hex="${k}"]`).value=p.colors[k];}palette.querySelector('output').textContent='';palette.showModal();return true;}
   if(name==='oscilloscope'){syncLabels();if(!visible){const r=canvas.getBoundingClientRect();box={...box,x:Math.max(12,r.left+12),y:Math.max(12,r.top+12)};}visible=true;channel=getRoute()?.netId??channel;position();paint();query('.scope-move').focus();return true;}
   return false;
 }
 syncLabels();
 return {action,paint,reset:()=>{close();palette.close();channel='';},dispose:()=>{disposed=true;close();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);editMenu.removeEventListener('toggle',editToggle);scope.remove();palette.remove();wireBox.removeEventListener('input',wireInput);wireBox.removeEventListener('click',wireClick);}};
}
