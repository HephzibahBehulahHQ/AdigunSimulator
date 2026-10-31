const blocked=message=>({state:"blocked",engine:"Bounded reciprocal-period frequency counter",message,result:null});
export function measureFrequency(project){
  const source=project?.oscillator,config=project?.frequencyCounter;
  if(!source||!config)return blocked("An oscillator and frequency-counter configuration are required.");
  const period=Number(source.periodMs),first=Number(source.firstRisingEdgeMs??0),cycles=Number(config.periodsToMeasure);
  if(!Number.isFinite(period)||period<=0||!Number.isFinite(first)||first<0||!Number.isInteger(cycles)||cycles<1||cycles>10000)return blocked("Oscillator period, first edge and measurement cycle count must be valid.");
  const edges=Array.from({length:cycles+1},(_,i)=>first+i*period),elapsed=edges.at(-1)-edges[0];
  if(!(elapsed>0))return blocked("At least one complete measured period is required.");
  const measuredPeriod=elapsed/cycles,frequency=1000/measuredPeriod;
  return {state:"complete",engine:"Bounded reciprocal-period frequency counter",message:"Frequency is calculated from elapsed time across complete ideal oscillator periods; gate-time quantization and oscillator jitter are not modeled.",result:{kind:"frequency-counter",measuredFrequencyHz:frequency,unit:"Hz",measuredPeriodMs:measuredPeriod,cyclesMeasured:cycles,edgeCount:edges.length,firstEdgeMs:edges[0],lastEdgeMs:edges.at(-1),periodSamplesMs:edges.slice(1).map((edge,i)=>edge-edges[i]),method:"reciprocal-period"}};
}
