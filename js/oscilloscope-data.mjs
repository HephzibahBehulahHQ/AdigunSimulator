// The scope only displays solver output. No decorative/generated waveform fallback.
export function scopeChannels(project,analysis,live){
  if(live.status!=='ready'||!live.data?.available)return [];
  if(live.data.units==='logic')return Object.keys(live.data.nodes);
  if(analysis?.scopeRecording)return [analysis.scopeRecording.preferredNet,...Object.keys(live.data.nodes).filter(n=>n!==analysis.scopeRecording.preferredNet)];
  if(live.kind==='transient')return analysis?.feedbackLayout?.nets?.filter(n=>project.nets.some(x=>x.id===n))??[];
  return Object.keys(live.data.nodes).filter(n=>Number.isFinite(live.data.nodes[n]));
}
export function scopeTrace(project,analysis,live,channel){
  if(!scopeChannels(project,analysis,live).includes(channel))return null;
  if(live.data.units==='logic'){const samples=analysis?.result?.samples?.slice(0,live.sampleIndex+1);if(!samples?.length)return null;const points=samples.flatMap((s,i)=>i?[[s.timeSeconds,samples[i-1].nets[channel]],[s.timeSeconds,s.nets[channel]]]:[[s.timeSeconds,s.nets[channel]]]);return {kind:'transient',units:'logic',voltage:samples.at(-1).nets[channel],time:samples.at(-1).timeSeconds,duration:analysis.result.samples.at(-1).timeSeconds,points};}
  if(analysis?.scopeRecording){const record=analysis.scopeRecording,samples=record.samples.slice(0,live.sampleIndex+1);if(!samples.length)return null;return {kind:'transient',model:record.model,voltage:samples.at(-1).nodeVoltages[channel],time:samples.at(-1).timeSeconds,duration:record.samples.at(-1).timeSeconds,points:samples.map(s=>[s.timeSeconds,s.nodeVoltages[channel]])};}
  if(live.kind==='dc')return {kind:'dc',...(live.data.model?{model:live.data.model}:live.data.kind==='battery-discharge-monitor'?{model:'Ideal comparator DC estimate'}:{}),voltage:live.data.nodes[channel],time:0,points:[[0,live.data.nodes[channel]],[1,live.data.nodes[channel]]],duration:1};
  const result=analysis?.result,index=analysis?.feedbackLayout?.nets?.indexOf(channel);
  if(result?.kind!=='linear-rlc-transient'||!Array.isArray(result.samples)||result.samples.length>2000||index<0)return null;
  const samples=result.samples.slice(0,live.sampleIndex+1);
  if(!samples.length||samples.some(s=>!Number.isFinite(s.timeSeconds)||!Number.isFinite(s.nodeVoltages?.[index])))return null;
  return {kind:'transient',voltage:samples.at(-1).nodeVoltages[index],time:samples.at(-1).timeSeconds,duration:result.samples.at(-1).timeSeconds,points:samples.map(s=>[s.timeSeconds,s.nodeVoltages[index]])};
}
export function scopePlot(trace,voltsPerDivision=0){
  const values=trace.points.map(p=>p[1]),low=Math.min(0,...values),high=Math.max(0,...values),span=Math.max(high-low,1e-6);
  const min=voltsPerDivision>0?-4*voltsPerDivision:low-span*.12,max=voltsPerDivision>0?4*voltsPerDivision:high+span*.12;
  const point=([t,v])=>[40+440*t/Math.max(trace.duration,1e-12),180-156*(v-min)/(max-min)];
  return {min,max,path:trace.points.map((p,i)=>`${i?'L':'M'}${point(p).map(n=>n.toFixed(2)).join(' ')}`).join(' '),cursorX:point([trace.kind==='dc'?0:trace.time,0])[0],clipped:values.some(v=>v<min||v>max)};
}
export function fitScopeWindow(box,bounds){
  const width=Math.min(Math.max(220,box.width),Math.max(1,bounds.width)),height=Math.min(Math.max(box.minimized?38:160,box.height),Math.max(1,bounds.height));
  return {...box,width,height,x:Math.min(Math.max(bounds.x,box.x),bounds.x+bounds.width-width),y:Math.min(Math.max(bounds.y,box.y),bounds.y+bounds.height-height)};
}
