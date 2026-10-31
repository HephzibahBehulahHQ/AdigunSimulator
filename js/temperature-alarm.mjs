const validSamples=(samples)=>Array.isArray(samples)&&samples.length>=1&&samples.length<=200&&samples.every(sample=>Number.isFinite(sample?.tempC)&&sample.tempC>=-40&&sample.tempC<=250&&typeof sample.reset==="boolean");
export function runTemperatureAlarm(project) {
  const cfg=project?.temperatureAlarm;
  if(cfg?.kind!=="latched-temperature-threshold"||!Number.isFinite(cfg.thresholdC)||cfg.thresholdC< -39||cfg.thresholdC>250||!validSamples(cfg.samples))
    return {state:"blocked",engine:"Temperature threshold alarm concept",message:"Provide a threshold from −39 to 250 °C and 1–200 valid temperature/reset samples.",errors:[{code:"TEMPERATURE_ALARM_CONFIGURATION",message:"The threshold or sample input is invalid or outside the bounded range."}],warnings:[],result:null};
  let alarmLatched=false;const frames=[];
  cfg.samples.forEach((sample,index)=>{let resetRejected=false;if(sample.tempC>=cfg.thresholdC)alarmLatched=true;else if(sample.reset)alarmLatched=false;
    if(sample.reset&&sample.tempC>=cfg.thresholdC&&alarmLatched)resetRejected=true;
    frames.push({step:index+1,tempC:sample.tempC,resetRequested:sample.reset,resetRejected,alarmLatched,buzzerOn:alarmLatched});});
  return {state:"complete",engine:"Deterministic latched temperature threshold model",message:"Alarm latches at or above threshold and can be reset only while below threshold.",errors:[],warnings:[{code:"TEMPERATURE_ALARM_CONCEPT_ONLY",message:"Synthetic temperature samples only; no thermistor curve, sensor accuracy, comparator hysteresis, circuit response, buzzer load, calibration or protective control is modeled."}],result:{kind:"latched-temperature-alarm",thresholdC:cfg.thresholdC,sampleCount:frames.length,tripCount:frames.filter((frame,index)=>frame.alarmLatched&&(!frames[index-1]?.alarmLatched||index===0)).length,resetRejected:frames.some(frame=>frame.resetRejected),frames}};
}
