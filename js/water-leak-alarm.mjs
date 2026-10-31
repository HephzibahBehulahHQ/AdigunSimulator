export function runWaterLeakAlarm(project) {
  const cfg=project?.waterLeakAlarm,samples=cfg?.wetSamples;
  if(cfg?.kind!=="direct-wet-dry-alarm"||!Array.isArray(samples)||samples.length<1||samples.length>300||samples.some(value=>typeof value!=="boolean"))
    return {state:"blocked",engine:"Water-leak alarm concept",message:"Provide 1–300 Boolean wet/dry samples.",errors:[{code:"WATER_LEAK_CONFIGURATION",message:"The wet/dry sample series is invalid or outside the bounded range."}],warnings:[],result:null};
  let alarmEpisodes=0;const frames=samples.map((wet,index)=>{if(wet&&!samples[index-1])alarmEpisodes+=1;return {step:index+1,wet,alarmOn:wet,relayCommand:wet?"ON":"OFF"};});
  return {state:"complete",engine:"Deterministic wet/dry alarm logic",message:"Synthetic wet stimulus raises the alarm; a dry sample clears it.",errors:[],warnings:[{code:"WATER_LEAK_CONCEPT_ONLY",message:"Boolean sensor stimulus only; no probe conductivity, corrosion, false-alarm immunity, buzzer/relay load, mains separation, water exposure, or property protection is modeled."}],result:{kind:"water-leak-alarm-sequence",sampleCount:frames.length,alarmEpisodes,dryRecoveryObserved:frames.some((frame,index)=>!frame.wet&&frames.slice(0,index).some(previous=>previous.wet)),frames}};
}
