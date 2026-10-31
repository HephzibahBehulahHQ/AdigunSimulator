const blocked=message=>({state:"blocked",engine:"Bounded ideal pulse oscilloscope",message,result:null});
export function captureTriggeredPulse(project){
  const source=project?.pulseSource,scope=project?.oscilloscope;
  if(!source||!scope)return blocked("A pulse source and oscilloscope configuration are required.");
  const high=Number(source.highVoltageV),low=Number(source.lowVoltageV),period=Number(source.periodMs),width=Number(source.pulseWidthMs),delay=Number(source.delayMs??0),level=Number(scope.triggerLevelV),range=Number(scope.timeRangeMs),edge=scope.triggerEdge;
  if(![high,low,period,width,delay,level,range].every(Number.isFinite)||period<=0||width<=0||width>=period||delay<0||range<=0||range>100)return blocked("Pulse levels, timing and scope range are outside the supported bounds.");
  if(!["rising","falling"].includes(edge))return blocked("Choose a rising or falling trigger edge.");
  if(!(level>Math.min(low,high)&&level<Math.max(low,high)))return blocked("Trigger level must lie strictly between the pulse low and high levels.");
  const crossings=[];
  for(let cycle=0,at=delay+cycle*period;at<=range;cycle++,at=delay+cycle*period)crossings.push({timeMs:at,edge:"rising"});
  for(let cycle=0,at=delay+width+cycle*period;at<=range;cycle++,at=delay+width+cycle*period)crossings.push({timeMs:at,edge:"falling"});
  crossings.sort((a,b)=>a.timeMs-b.timeMs);
  const trigger=crossings.find(item=>item.edge===edge);
  if(!trigger)return blocked("No matching trigger crossing occurs within the selected time range.");
  const sampleCount=101,step=range/(sampleCount-1),samples=Array.from({length:sampleCount},(_,index)=>{const t=index*step,phase=((t-delay)%period+period)%period,voltage=t>=delay&&phase<width?high:low;return {timeMs:Number(t.toFixed(6)),voltageV:voltage};});
  return {state:"complete",engine:"Bounded ideal digital pulse source and oscilloscope trigger",message:"Ideal edge trigger locked to the first matching threshold crossing in the configured capture window.",result:{kind:"oscilloscope-trigger",triggerLocked:true,triggerEdge:edge,triggerLevelV:level,triggerTimeMs:trigger.timeMs,periodMs:period,pulseWidthMs:width,highVoltageV:high,lowVoltageV:low,sampleCount:samples.length,traceStartMs:0,traceEndMs:range,samples}};
}
