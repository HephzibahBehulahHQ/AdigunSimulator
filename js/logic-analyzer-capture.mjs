const blocked=message=>({state:"blocked",engine:"Bounded synchronous digital counter and logic capture",message,result:null});
export function captureLogicAnalyzer(project){
  const counter=project?.digitalCounter,capture=project?.logicCapture,channels=capture?.channels,trigger=capture?.trigger;
  if(!counter||!capture||!Array.isArray(channels)||!channels.length||!trigger)return blocked("A digital counter, labelled channels and trigger are required.");
  const width=Number(counter.bitWidth),period=Number(counter.clockPeriodMs),count=Number(capture.sampleCount),modulus=2**width;
  if(!Number.isInteger(width)||width<1||width>16||!Number.isFinite(period)||period<=0||!Number.isInteger(count)||count<2||count>4096||!Number.isInteger(counter.initialCount)||counter.initialCount<0||counter.initialCount>=modulus||!["up","down"].includes(counter.direction))return blocked("Counter width, initial state, direction, clock and capture length are outside supported limits.");
  const names=new Set(),bits=new Set();
  for(const channel of channels){if(!channel?.name||names.has(channel.name)||!Number.isInteger(channel.bit)||channel.bit<0||channel.bit>=width||bits.has(channel.bit))return blocked("Channel labels and bit assignments must be unique and map to valid counter bits.");names.add(channel.name);bits.add(channel.bit);}
  const selected=channels.find(channel=>channel.name===trigger.channel);
  if(!selected||!["rising","falling"].includes(trigger.edge))return blocked("Trigger channel must be labelled and use a rising or falling edge.");
  const samples=[];
  for(let i=0;i<count;i++){const value=((counter.initialCount+(counter.direction==="up"?i:-i))%modulus+modulus)%modulus,states=Object.fromEntries(channels.map(channel=>[channel.name,(value>>channel.bit)&1]));samples.push({sampleIndex:i,timeMs:i*period,states,decodedCount:value});}
  let triggerIndex=-1;
  for(let i=1;i<samples.length;i++){const before=samples[i-1].states[trigger.channel],after=samples[i].states[trigger.channel];if(trigger.edge==="rising"&&before===0&&after===1||trigger.edge==="falling"&&before===1&&after===0){triggerIndex=i;break;}}
  if(triggerIndex<0)return blocked("No selected logic transition occurs in the capture window.");
  return {state:"complete",engine:"Bounded synchronous digital counter and logic capture",message:"Digital states are sampled at declared counter clock boundaries; asynchronous timing and electrical thresholds are idealized.",result:{kind:"logic-analyzer-capture",triggerLocked:true,triggerChannel:trigger.channel,triggerEdge:trigger.edge,triggerSampleIndex:triggerIndex,triggerTimeMs:samples[triggerIndex].timeMs,channelLabels:channels.map(channel=>channel.name).join(", "),sampleCount:samples.length,decodedSequence:samples.map(sample=>sample.decodedCount).join(", "),samples}};
}
